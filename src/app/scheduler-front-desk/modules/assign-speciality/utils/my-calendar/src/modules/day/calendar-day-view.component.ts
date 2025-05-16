import {
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Inject,
	Input,
	LOCALE_ID,
	OnChanges,
	OnDestroy,
	OnInit,
	Output,
	TemplateRef,
} from '@angular/core';

import { DragEndEvent } from 'angular-draggable-droppable';
import { ResizeEvent } from 'angular-resizable-element';
import {
	CalendarEvent,
	DayView,
	DayViewEvent,
	DayViewHour,
	ViewPeriod,
} from 'calendar-utils';
import { PlacementArray } from 'positioning';
import {
	Subject,
	Subscription,
} from 'rxjs';

import {
	NgbModal,
	NgbPopover,
} from '@ng-bootstrap/ng-bootstrap';

import { SchedulerSupervisorService } from '../../../../../../../scheduler-supervisor.service';
import { AccordianComponent } from '../../../../../modals/accordian/accordian.component';
import {
	AddAssignmentModalComponent,
} from '../../../../../modals/add-assignment-modal/add-assignment-modal.component';
import {
	UpdateAssignmentModalComponent,
} from '../../../../../modals/update-assignment-modal/update-assignment-modal.component';
import { SubjectService } from '../../../../../subject.service';
import { DateAdapter } from '../../date-adapters/date-adapter';
import { CalendarDragHelper } from '../common/calendar-drag-helper.provider';
import {
	CalendarEventTimesChangedEvent,
	CalendarEventTimesChangedEventType,
} from '../common/calendar-event-times-changed-event.interface';
import { CalendarResizeHelper } from '../common/calendar-resize-helper.provider';
import { CalendarUtils } from '../common/calendar-utils.provider';
import {
	getDefaultEventEnd,
	getMinimumEventHeightInMinutes,
	getMinutesMoved,
	isDraggedWithinPeriod,
	shouldFireDroppedEvent,
	trackByDayOrWeekEvent,
	trackByEventId,
	trackByHour,
	trackByHourSegment,
	validateEvents,
} from '../common/util';
//services
import { CalendarMonthService } from '../month/calendar-month.service';
import { CalendarDayService } from './calendar-day.service';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { convert12, convertDateTimeForRetrieving, getAvailableDoctorCurrentDateList } from '@appDir/shared/utils/utils.helpers';
import { AclService } from '@appDir/shared/services/acl.service';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';

export interface CalendarDayViewBeforeRenderEvent {
	body: {
		hourGrid: DayViewHour[];
		allDayEvents: CalendarEvent[];
	};
	period: ViewPeriod;
}

/**
 * @hidden
 */
export interface DayViewEventResize {
	originalTop: number;
	originalHeight: number;
	edge: string;
}

/**
 * Shows all events on a given day. Example usage:
 *
 * ```typescript
 * <mwl-calendar-day-view
 *  [viewDate]="viewDate"
 *  [events]="events">
 * </mwl-calendar-day-view>
 * ```
 */
@Component({
	selector: 'cal-assign-speciality-day-view',
	templateUrl: 'calendar-day-view.component.html',
	styleUrls: ['calendar-day-view.scss'],
})
export class CalendarDayViewComponent implements OnChanges, OnInit, OnDestroy {
	public filteredEvents: any = [];
	userPermissions = USERPERMISSIONS;
	@Output() childEvent = new EventEmitter();
	@Output() updateSpecAssign = new EventEmitter();
	@Input() swaps: any;
	@Input() clinicId: any;
	@Input() speciality: any;
	@Input() clinicIndex: any;
	@Input() specAssign: any;

	/**
	 * The current view date
	 */
	@Input()
	viewDate: Date;

	/**
	 * An array of events to display on view
	 * The schema is available here: https://github.com/mattlewis92/calendar-utils/blob/c51689985f59a271940e30bc4e2c4e1fee3fcb5c/src/calendarUtils.ts#L49-L63
	 */
	@Input()
	events: CalendarEvent[] = [];

	/**
	 * The number of segments in an hour. Must be <= 6
	 */
	@Input()
	hourSegments: number = 1;

	/**
	 * The height in pixels of each hour segment
	 */
	@Input()
	hourSegmentHeight: number = 30;

	/**
	 * The day start hours in 24 hour time. Must be 0-23
	 */
	@Input()
	dayStartHour: number = 0;

	/**
	 * The day start minutes. Must be 0-59
	 */
	@Input()
	dayStartMinute: number = 0;

	/**
	 * The day end hours in 24 hour time. Must be 0-23
	 */
	@Input()
	dayEndHour: number = 23;

	/**
	 * The day end minutes. Must be 0-59
	 */
	@Input()
	dayEndMinute: number = 59;

	/**
	 * The width in pixels of each event on the view
	 */
	@Input()
	eventWidth: number = 150;

	/**
	 * An observable that when emitted on will re-render the current view
	 */
	@Input()
	refresh: Subject<any>;

	/**
	 * The locale used to format dates
	 */
	@Input()
	locale: string;

	/**
	 * The grid size to snap resizing and dragging of events to
	 */
	@Input()
	eventSnapSize: number;

	/**
	 * The placement of the event tooltip
	 */
	@Input()
	tooltipPlacement: PlacementArray = 'auto';

	/**
	 * A custom template to use for the event tooltips
	 */
	@Input()
	tooltipTemplate: TemplateRef<any>;

	/**
	 * Whether to append tooltips to the body or next to the trigger element
	 */
	@Input()
	tooltipAppendToBody: boolean = true;

	/**
	 * A custom template to use to replace the hour segment
	 */
	@Input()
	hourSegmentTemplate: TemplateRef<any>;

	/**
	 * A custom template to use for day view events
	 */
	@Input()
	eventTemplate: TemplateRef<any>;

	/**
	 * A custom template to use for event titles
	 */
	@Input()
	eventTitleTemplate: TemplateRef<any>;

	/**
	 * A custom template to use for event actions
	 */
	@Input()
	eventActionsTemplate: TemplateRef<any>;

	/**
	 * Whether to snap events to a grid when dragging
	 */
	@Input()
	snapDraggedEvents: boolean = true;

	/**
	 * Called when an event title is clicked
	 */
	@Output()
	eventClicked = new EventEmitter<{
		event: CalendarEvent;
	}>();

	/**
	 * Called when an hour segment is clicked
	 */
	@Output()
	hourSegmentClicked = new EventEmitter<{
		date: Date;
	}>();

	/**
	 * Called when an event is resized or dragged and dropped
	 */
	@Output()
	eventTimesChanged = new EventEmitter<CalendarEventTimesChangedEvent>();

	/**
	 * An output that will be called before the view is rendered for the current day.
	 * If you add the `cssClass` property to an hour grid segment it will add that class to the hour segment in the template
	 */
	@Output()
	beforeViewRender = new EventEmitter<CalendarDayViewBeforeRenderEvent>();

	/**
	 * @hidden
	 */
	hours: DayViewHour[] = [];

	/**
	 * @hidden
	 */
	view: DayView;

	/**
	 * @hidden
	 */
	width: number = 0;

	/**
	 * @hidden
	 */
	refreshSubscription: Subscription;

	/**
	 * @hidden
	 */
	currentResizes: Map<DayViewEvent, DayViewEventResize> = new Map();

	/**
	 * @hidden
	 */
	eventDragEnter = 0;

	/**
	 * @hidden
	 */
	calendarId = Symbol('angular calendar day view id');

	/**
	 * @hidden
	 */
	validateDrag: (args: any) => boolean;

	/**
	 * @hidden
	 */
	validateResize: (args: any) => boolean;

	/**
	 * @hidden
	 */
	trackByEventId = trackByEventId;

	/**
	 * @hidden
	 */
	trackByHour = trackByHour;

	/**
	 * @hidden
	 */
	trackByHourSegment = trackByHourSegment;

	/**
	 * @hidden
	 */
	trackByDayEvent = trackByDayOrWeekEvent;

	/**
	 * @hidden
	 */
	constructor(
		private cdr: ChangeDetectorRef,
		private utils: CalendarUtils,
		public deleteModal: NgbModal,
		@Inject(LOCALE_ID) locale: string,
		private dateAdapter: DateAdapter,
		public monthService: CalendarDayService,
		public dayService: CalendarMonthService,
		public weekService: CalendarDayService,
		public addAssignmentDayModal: NgbModal,
		public updateAssignmentDayModal: NgbModal,
		public supervisorSerivce: SchedulerSupervisorService,
		public _subjectService: SubjectService,
		private storageData: StorageData,
		public aclService: AclService
	) {
		this.locale = locale;
	}

	/**
	 * @hidden
	 */
	ngOnInit(): void {
		if (this.refresh) {
			this.refreshSubscription = this.refresh.subscribe(() => {
				this.refreshAll();
				this.cdr.markForCheck();
			});
		}
	}

	/**
	 * @hidden
	 */
	ngOnDestroy(): void {
		if (this.refreshSubscription) {
			this.refreshSubscription.unsubscribe();
		}
	}

	/**
	 * @hidden
	 */
	ngOnChanges(changes: any): void {
		if (
			changes.viewDate ||
			changes.dayStartHour ||
			changes.dayStartMinute ||
			changes.dayEndHour ||
			changes.dayEndMinute ||
			changes.hourSegments
		) {
			this.refreshHourGrid();
		}

		if (changes.events) {
			validateEvents(this.events);
		}

		if (
			changes.viewDate ||
			changes.events ||
			changes.dayStartHour ||
			changes.dayStartMinute ||
			changes.dayEndHour ||
			changes.dayEndMinute ||
			changes.eventWidth
		) {
			this.refreshView();
		}
	}

	eventDropped(
		dropEvent: { dropData?: { event?: CalendarEvent; calendarId?: symbol } },
		date: Date,
		allDay: boolean,
	): void {
		if (shouldFireDroppedEvent(dropEvent, date, allDay, this.calendarId)) {
			this.eventTimesChanged.emit({
				type: CalendarEventTimesChangedEventType.Drop,
				event: dropEvent.dropData.event,
				newStart: date,
				allDay,
			});
		}
	}

	resizeStarted(
		event: DayViewEvent,
		resizeEvent: ResizeEvent,
		dayEventsContainer: HTMLElement,
	): void {
		this.currentResizes.set(event, {
			originalTop: event.top,
			originalHeight: event.height,
			edge: typeof resizeEvent.edges.top !== 'undefined' ? 'top' : 'bottom',
		});
		const resizeHelper: CalendarResizeHelper = new CalendarResizeHelper(dayEventsContainer);
		this.validateResize = ({ rectangle }) => resizeHelper.validateResize({ rectangle });
		this.cdr.markForCheck();
	}

	resizing(event: DayViewEvent, resizeEvent: ResizeEvent): void {
		const currentResize: DayViewEventResize = this.currentResizes.get(event);
		if (resizeEvent.edges.top) {
			event.top = currentResize.originalTop + +resizeEvent.edges.top;
			event.height = currentResize.originalHeight - +resizeEvent.edges.top;
		} else if (resizeEvent.edges.bottom) {
			event.height = currentResize.originalHeight + +resizeEvent.edges.bottom;
		}
	}

	resizeEnded(dayEvent: DayViewEvent): void {
		const currentResize: DayViewEventResize = this.currentResizes.get(dayEvent);

		const resizingBeforeStart = currentResize.edge === 'top';
		let pixelsMoved: number;
		if (resizingBeforeStart) {
			pixelsMoved = dayEvent.top - currentResize.originalTop;
		} else {
			pixelsMoved = dayEvent.height - currentResize.originalHeight;
		}

		dayEvent.top = currentResize.originalTop;
		dayEvent.height = currentResize.originalHeight;

		const minutesMoved = getMinutesMoved(
			pixelsMoved,
			this.hourSegments,
			this.hourSegmentHeight,
			this.eventSnapSize,
		);

		let newStart: Date = dayEvent.event.start;
		let newEnd: Date = getDefaultEventEnd(
			this.dateAdapter,
			dayEvent.event,
			getMinimumEventHeightInMinutes(this.hourSegments, this.hourSegmentHeight),
		);
		if (resizingBeforeStart) {
			newStart = this.dateAdapter.addMinutes(newStart, minutesMoved);
		} else {
			newEnd = this.dateAdapter.addMinutes(newEnd, minutesMoved);
		}

		this.eventTimesChanged.emit({
			newStart,
			newEnd,
			event: dayEvent.event,
			type: CalendarEventTimesChangedEventType.Resize,
		});
		this.currentResizes.delete(dayEvent);
	}

	dragStarted(event: HTMLElement, dayEventsContainer: HTMLElement): void {
		const dragHelper: CalendarDragHelper = new CalendarDragHelper(dayEventsContainer, event);
		this.validateDrag = ({ x, y }) =>
			this.currentResizes.size === 0 &&
			dragHelper.validateDrag({
				x,
				y,
				snapDraggedEvents: this.snapDraggedEvents,
			});
		this.eventDragEnter = 0;
		this.cdr.markForCheck();
	}

	dragEnded(dayEvent: DayViewEvent, dragEndEvent: DragEndEvent): void {
		if (this.eventDragEnter > 0) {
			let minutesMoved = getMinutesMoved(
				dragEndEvent.y,
				this.hourSegments,
				this.hourSegmentHeight,
				this.eventSnapSize,
			);
			let newStart: Date = this.dateAdapter.addMinutes(dayEvent.event.start, minutesMoved);
			if (dragEndEvent.y < 0 && newStart < this.view.period.start) {
				minutesMoved += this.dateAdapter.differenceInMinutes(this.view.period.start, newStart);
				newStart = this.view.period.start;
			}
			let newEnd: Date;
			if (dayEvent.event.end) {
				newEnd = this.dateAdapter.addMinutes(dayEvent.event.end, minutesMoved);
			}
			if (isDraggedWithinPeriod(newStart, newEnd, this.view.period)) {
				this.eventTimesChanged.emit({
					newStart,
					newEnd,
					event: dayEvent.event,
					type: CalendarEventTimesChangedEventType.Drag,
				});
			}
		}
	}

	private refreshHourGrid(): void {
		this.hours = this.utils.getDayViewHourGrid({
			viewDate: this.viewDate,
			hourSegments: this.hourSegments,
			dayStart: {
				hour: this.dayStartHour,
				minute: this.dayStartMinute,
			},
			dayEnd: {
				hour: this.dayEndHour,
				minute: this.dayEndMinute,
			},
		});
		this.emitBeforeViewRender();
	}

	private refreshView(): void {
		this.view = this.utils.getDayView({
			events: this.events,
			viewDate: this.viewDate,
			hourSegments: this.hourSegments,
			dayStart: {
				hour: this.dayStartHour,
				minute: this.dayStartMinute,
			},
			dayEnd: {
				hour: this.dayEndHour,
				minute: this.dayEndMinute,
			},
			eventWidth: this.eventWidth,
			segmentHeight: this.hourSegmentHeight,
		});
		this.emitBeforeViewRender();
	}

	private refreshAll(): void {
		this.refreshHourGrid();
		this.refreshView();
	}

	private emitBeforeViewRender(): void {
		if (this.hours && this.view) {
			this.beforeViewRender.emit({
				body: {
					hourGrid: this.hours,
					allDayEvents: this.view.allDayEvents,
				},
				period: this.view.period,
			});
		}
	}

	disable(specId) {
		let temp = this.clinicId;
		if (!this.swaps) {
			temp = specId;
		}
		if (temp.id != 0) {
			for (let i = 0; i < (temp.day_list&&temp.day_list.length); i++) {
				if (this.viewDate.getDay() == temp.day_list[i]) {
					return false;
				}
			}
		} 
		// else {
		// 	return true;
		// }
		return true;
	}
	returnItem(specId) {
		let newEvents = [];
		for (let e of this.specAssign) {
			if (
				(e.speciality_id == specId &&
					e.facility_location_id == this.clinicId.id &&
					this.swaps &&
					// this.viewDate.toString().substring(0, 15) ==
					// 	new Date(e.startDate).toString().substring(0, 15)
					this.CheckeventOndateExist(e,this.viewDate)
						) ||
				(e.speciality_id == this.clinicId.id &&
					e.facility_location_id == specId &&
					!this.swaps &&
					this.CheckeventOndateExist(e,this.viewDate)
					// this.viewDate.toString().substring(0, 15) ==
					// 	new Date(e.startDate).toString().substring(0, 15)
						)
			) {
				// e.availableDoctors.map(availabledoc=>{
				// 	let current_dateList_event=getAvailableDoctorCurrentDateList(availabledoc.dateList,this.viewDate)
				// 	availabledoc['current_dateList_event']=current_dateList_event
				// })
				let _datelist=e.dateList&&e.dateList.find(datelist=>new Date(datelist.start_date).toString().substring(0, 15)==this.viewDate.toString().substring(0, 15));	

				if(_datelist)
				{
					// _datelist=this.convertdateTimeToSelectedZone(_datelist);
					
					e['current_dateList_event']=_datelist
				}	   
				newEvents.push(e);
				// let _event=JSON.parse(JSON.stringify(e));;
				// 		let _datelist=e.dateList&&e.dateList.find(datelist=>new Date(datelist.start_date).toString().substring(0, 15)==this.viewDate.toString().substring(0, 15));
				// 		if(_datelist)
				// 		{
				// 			_datelist=this.convertdateTimeToSelectedZone(_datelist)

				// 		}
				// 		_event['dateList'] =_datelist? _datelist:null

				// newEvents.push(_event);

				// newEvents.push(e);
			}
		}
		return newEvents;
	}

	convertdateTimeToSelectedZone(_datelist)
	{
		let tempDateForStart = convertDateTimeForRetrieving(
			this.storageData,
			new Date(_datelist.start_date),
		);
		let tempDateForEnd = convertDateTimeForRetrieving(
			this.storageData,
			new Date(_datelist.end_date),
		);
		_datelist.start_date = convertDateTimeForRetrieving(
			this.storageData,
			new Date(_datelist.start_date),
		);
		_datelist.end_date = convertDateTimeForRetrieving(
			this.storageData,
			new Date(_datelist.end_date),
		);
		let startTime =
			('0' + tempDateForStart.getHours()).slice(-2) +
			':' +
			('0' + tempDateForStart.getMinutes()).slice(-2);
		let endTime =
			('0' + tempDateForEnd.getHours()).slice(-2) +
			':' +
			('0' + tempDateForEnd.getMinutes()).slice(-2);
		// specAssign[i]['start'] = tempDateForStart;
		// specAssign[i]['end'] = tempDateForEnd;
		startTime = convert12(startTime);
		endTime = convert12(endTime);
		_datelist['startTime'] = startTime;
		_datelist['endTime'] = endTime;
		return _datelist
	}

	CheckeventOndateExist(_event:any,date):boolean
	{
		let eventExist=_event.dateList&&_event.dateList.find(date_list=>new Date(date_list.start_date).toString().substring(0, 15)==date.toString().substring(0, 15))
		if(eventExist)
		{
			return true;
		}
		else
		{
			return false;
		}
	}


	public removeSideEntry(id) {
		for (let i = 0; i < this.speciality.length; i++) {
			if (this.speciality[i].id == id) {
				this.childEvent.emit(this.speciality[i]);
				return;
			}
		}
	}
	public deleteEvent(e, spec, clinic,date) {
		if (this.supervisorSerivce.popover) {
			this.supervisorSerivce.popover.isOpen()
				? this.supervisorSerivce.popover.close()
				: this.supervisorSerivce.popover;
		}
		var specialityName: any;
		var ClinicName: any;
		debugger;
		if(this.swaps)
		{
			this.dayService.specialityForDeleteModal = spec.name;
			this.dayService.specialityQualifierForDeleteModal = spec.qualifier;
			this.dayService.clinicForDeleteModal =clinic.facility_name+'-'+ clinic.name;
			this.dayService.clinicQualifierForDeleteModal =clinic.facility.qualifier+'-'+ clinic.qualifier;
		}
		else
		{
			this.dayService.specialityForDeleteModal = clinic.name;
			this.dayService.specialityQualifierForDeleteModal = clinic.qualifier;
			this.dayService.clinicQualifierForDeleteModal =spec.facility.qualifier+'-'+ spec.qualifier;
		}
		let _event={...e}
		_event.availableDoctors.map(availabledoc=>{
					let current_dateList_event=getAvailableDoctorCurrentDateList(availabledoc.dateList,date)
					availabledoc['current_dateList_event']=current_dateList_event
				})

		this.supervisorSerivce.currentDeleteAppointment = _event;
		
		this.dayService.available_spec_Id_ForDeleteModal = _event.current_dateList_event.available_speciality_id;
		this.dayService.date_list_id_ForDeleteModal = _event.current_dateList_event.id
		const activeModal = this.deleteModal.open(AccordianComponent, {
			size: 'lg',
			backdrop: 'static',
			keyboard: false,
		});
	}
	public cellCurrentAppointments(event) {
		this.updateSpecAssign.emit(event);
	}
	public open(date, clinic, spec) {
		if (!this.disable(spec) && this.aclService.hasPermission(this.userPermissions.scheduler_assignment_add_new)) {
			if (this.supervisorSerivce.popover) {
				this.supervisorSerivce.popover.isOpen()
					? this.supervisorSerivce.popover.close()
					: this.supervisorSerivce.popover;
			}
			if (this.swaps) {
				this._subjectService.spec = spec;
				this._subjectService.clinic = clinic;
			} else {
				this._subjectService.spec = clinic;
				this._subjectService.clinic = spec;
			}

			this._subjectService.currentStartDate = date;
			this._subjectService.currentSelectedDateDoubleClicked =date.toString();
			const activeModal = this.addAssignmentDayModal.open(AddAssignmentModalComponent, {
				size: 'lg',
				backdrop: 'static',
				keyboard: false,
			});
			activeModal.result.then(() => {
			});
		}
	}
	public updateFunction(spec, clinic, event,date) {
		if (this.supervisorSerivce.popover) {
			this.supervisorSerivce.popover.isOpen()
				? this.supervisorSerivce.popover.close()
				: this.supervisorSerivce.popover;
		}
		this._subjectService.assignDoctorData = [];
		if (this.swaps) {
			this._subjectService.spec = spec;
			this._subjectService.clinic = clinic;
		} else {
			this._subjectService.spec = clinic;
			this._subjectService.clinic = spec;
		}

		let _event={...event}
		_event.availableDoctors.map(availabledoc=>{
					let current_dateList_event=getAvailableDoctorCurrentDateList(availabledoc.dateList,date)
					availabledoc['current_dateList_event']=current_dateList_event
				})

		// this._subjectService.numberOfDoc = event.noOfDoctors;
		this._subjectService.numberOfDoc = _event.current_dateList_event.no_of_doctors;
		// this._subjectService.assignDoc = event.doctorName;
		this._subjectService.assignDoc = _event.availableDoctors;
		// this._subjectService.assignDoctorData.push(event.doctor);
		this._subjectService.assignDoctorData=_event.availableDoctors;
		this._subjectService.currentStartDate = _event.current_dateList_event.start_date;
		this._subjectService.currentEndDate = _event.current_dateList_event.end_date;;
		this._subjectService.specAssignId = _event.id;
		this._subjectService.currentEvent=_event;
		this._subjectService.result = [];
		const activeModal = this.addAssignmentDayModal.open(UpdateAssignmentModalComponent, {
			size: 'lg',
			backdrop: 'static',
			keyboard: false,
		});
		activeModal.result.then(() => {
			if (this._subjectService.result.result) {
				event.startDate = this._subjectService.result.result[0]['startDate'];
				event.endDate = this._subjectService.result.result[0]['endDate'];
				event.start = new Date(event.startDate);
				event.end = new Date(event.endDate);

				event.startTime =
					event.start.getHours().toString() + ':' + event.start.getMinutes().toString();
				event.endTime = event.end.getHours().toString() + ':' + event.end.getMinutes().toString();

				// event.noOfDoctors = this._subjectService.result.result[0]['noOfDoctors'];
				// event.doctorName = [];
				event.no_of_doctors = this._subjectService.result.result[0]['no_of_doctors'];
				event.availableDoctors = [];

				for (let i = 1; i < this._subjectService.result.result.length; i++) {
					// event.doctorName.push(this._subjectService.result.result[i].doctorName);
					event.availableDoctors=this._subjectService.result.result[i].availableDoctors;
				}
			}
		});
	}
	openPop(p: NgbPopover): void {
		if (this.supervisorSerivce.popover) {
			this.supervisorSerivce.popover.isOpen()
				? this.supervisorSerivce.popover.close()
				: this.supervisorSerivce.popover;
		}
		this.supervisorSerivce.popover = p;
	}
}
