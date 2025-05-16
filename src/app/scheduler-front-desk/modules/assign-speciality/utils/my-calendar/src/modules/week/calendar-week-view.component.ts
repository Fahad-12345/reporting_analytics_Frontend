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
import { Router } from '@angular/router';

import {
	DragEndEvent,
	DragMoveEvent,
	DropEvent,
} from 'angular-draggable-droppable';
import { ResizeEvent } from 'angular-resizable-element';
import {
	CalendarEvent,
	DayViewEvent,
	WeekDay,
	WeekView,
	WeekViewAllDayEvent,
	WeekViewHourColumn,
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
	getWeekViewPeriod,
	isDraggedWithinPeriod,
	roundToNearest,
	shouldFireDroppedEvent,
	trackByDayOrWeekEvent,
	trackByHour,
	trackByHourSegment,
	trackByIndex,
	trackByWeekDayHeaderDate,
	validateEvents,
} from '../common/util';
import { CalendarWeekService } from './calendar-week.service';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { convert12, convertDateTimeForRetrieving, getAvailableDoctorCurrentDateList } from '@appDir/shared/utils/utils.helpers';
import { AclService } from '@appDir/shared/services/acl.service';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';

export interface WeekViewAllDayEventResize {
	originalOffset: number;
	originalSpan: number;
	edge: string;
}

export interface CalendarWeekViewBeforeRenderEvent extends WeekView {
	header: WeekDay[];
}

@Component({
	selector: 'cal-assign-speciality-week-view',
	templateUrl: 'calendar-week-view.component.html',
	styleUrls: ['./calendar-week-view.scss'],
})
export class CalendarWeekViewComponent implements OnChanges, OnInit, OnDestroy {
	@Output() childEvent = new EventEmitter();
	@Output() updateSpecAssign = new EventEmitter();

	@Input() speciality: any;

	@Input() specAssign: any;

	@Input() clinicId: any;
	@Input() clinicIndex: any;

	@Input()
	viewDate: Date;
	userPermissions = USERPERMISSIONS;

	/**
	 * An array of events to display on view
	 * The schema is available here: https://github.com/mattlewis92/calendar-utils/blob/c51689985f59a271940e30bc4e2c4e1fee3fcb5c/src/calendarUtils.ts#L49-L63
	 */
	@Input()
	events: CalendarEvent[] = [];

	/**
	 * An array of day indexes (0 = sunday, 1 = monday etc) that will be hidden on the view
	 */
	@Input()
	excludeDays: number[] = [];

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
	 * The start number of the week
	 */
	@Input()
	weekStartsOn: number;

	/**
	 * A custom template to use to replace the header
	 */
	@Input()
	headerTemplate: TemplateRef<any>;

	/**
	 * A custom template to use for week view events
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
	 * The precision to display events.
	 * `days` will round event start and end dates to the nearest day and `minutes` will not do this rounding
	 */
	@Input()
	precision: 'days' | 'minutes' = 'days';

	/**
	 * An array of day indexes (0 = sunday, 1 = monday etc) that indicate which days are weekends
	 */
	@Input()
	weekendDays: number[];

	/**
	 * Whether to snap events to a grid when dragging
	 */
	@Input()
	snapDraggedEvents: boolean = true;

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
	 * A custom template to use to replace the hour segment
	 */
	@Input()
	hourSegmentTemplate: TemplateRef<any>;

	/**
	 * The grid size to snap resizing and dragging of hourly events to
	 */
	@Input()
	eventSnapSize: number;

	/**
	 * A custom template to use for the all day events label text
	 */
	@Input()
	allDayEventsLabelTemplate: TemplateRef<any>;

	/**
	 * The number of days in a week. Can be used to create a shorter or longer week view.
	 * The first day of the week will always be the `viewDate`
	 */
	@Input()
	daysInWeek: number;

	/**
	 * Called when a header week day is clicked. Adding a `cssClass` property on `$event.day` will add that class to the header element
	 */
	@Output()
	dayHeaderClicked = new EventEmitter<{
		day: WeekDay;
	}>();

	/**
	 * Called when the event title is clicked
	 */
	@Output()
	eventClicked = new EventEmitter<{
		event: CalendarEvent;
	}>();

	/**
	 * Called when an event is resized or dragged and dropped
	 */
	@Output()
	eventTimesChanged = new EventEmitter<CalendarEventTimesChangedEvent>();

	/**
	 * An output that will be called before the view is rendered for the current week.
	 * If you add the `cssClass` property to a day in the header it will add that class to the cell element in the template
	 */
	@Output()
	beforeViewRender = new EventEmitter<CalendarWeekViewBeforeRenderEvent>();

	/**
	 * Called when an hour segment is clicked
	 */
	@Output()
	hourSegmentClicked = new EventEmitter<{
		date: Date;
	}>();

	/**
	 * @hidden
	 */
	days: WeekDay[];

	/**
	 * @hidden
	 */
	view: WeekView;

	/**
	 * @hidden
	 */
	refreshSubscription: Subscription;

	/**
	 * @hidden
	 */
	allDayEventResizes: Map<WeekViewAllDayEvent, WeekViewAllDayEventResize> = new Map();

	/**
	 * @hidden
	 */
	timeEventResizes: Map<CalendarEvent, ResizeEvent> = new Map();

	/**
	 * @hidden
	 */
	eventDragEnter = 0;

	/**
	 * @hidden
	 */
	dragActive = false;

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
	dayColumnWidth: number;

	/**
	 * @hidden
	 */
	calendarId = Symbol('angular calendar week view id');

	/**
	 * @hidden
	 */
	trackByIndex = trackByIndex;

	/**
	 * @hidden
	 */
	trackByWeekDayHeaderDate = trackByWeekDayHeaderDate;

	/**
	 * @hidden
	 */
	trackByHourSegment = trackByHourSegment;

	/**
	 * @hidden
	 */
	trackByHour = trackByHour;

	/**
	 * @hidden
	 */
	trackByDayOrWeekEvent = trackByDayOrWeekEvent;

	@Input() swaps: any;

	/**
	 * @hidden
	 */
	trackByHourColumn = (index: number, column: WeekViewHourColumn) =>
		column.hours[0] ? column.hours[0].segments[0].date.toISOString() : column;

	public totalDays: any = [];
	/**
	 * @hidden
	 */
	constructor(
		private router: Router,
		private cdr: ChangeDetectorRef,
		private utils: CalendarUtils,
		public deleteModal: NgbModal,
		@Inject(LOCALE_ID) locale: string,
		private dateAdapter: DateAdapter,
		public monthService: CalendarWeekService,
		public supervisorService: SchedulerSupervisorService,
		public updateAssignmentDayModal: NgbModal,
		public addAssignmentService: NgbModal,
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
		this.view.hourColumns.filter((element) => {
			this.totalDays.push(element);
		});

		//assigning colors to events of speciality
		for (let i = 0; i < this.totalDays.length; i++) {
			for (let j = 0; j < this.totalDays[i].events.length; j++) {
				for (let k = 0; k < this.speciality.length; k++) {
					if (this.totalDays[i].events[j].event['specId'] == this.speciality[k].id) {
						this.totalDays[i].events[j].event['specColor'] = this.speciality[k].color;
					}
				}
			}
		}
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
	ngOnChanges(changes: any): void {
		if (changes.viewDate || changes.excludeDays || changes.weekendDays || changes.daysInWeek) {
			this.refreshHeader();
		}

		if (changes.events) {
			validateEvents(this.events);
		}

		if (
			changes.viewDate ||
			changes.dayStartHour ||
			changes.dayStartMinute ||
			changes.dayEndHour ||
			changes.dayEndMinute ||
			changes.hourSegments ||
			changes.weekStartsOn ||
			changes.weekendDays ||
			changes.excludeDays ||
			changes.hourSegmentHeight ||
			changes.events ||
			changes.daysInWeek
		) {
			this.refreshBody();
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

	private resizeStarted(eventsContainer: HTMLElement, minWidth?: number) {
		this.dayColumnWidth = this.getDayColumnWidth(eventsContainer);
		const resizeHelper: CalendarResizeHelper = new CalendarResizeHelper(eventsContainer, minWidth);
		this.validateResize = ({ rectangle }) => resizeHelper.validateResize({ rectangle });
		this.cdr.markForCheck();
	}

	/**
	 * @hidden
	 */
	timeEventResizeStarted(
		eventsContainer: HTMLElement,
		timeEvent: DayViewEvent,
		resizeEvent: ResizeEvent,
	): void {
		this.timeEventResizes.set(timeEvent.event, resizeEvent);
		this.resizeStarted(eventsContainer);
	}

	/**
	 * @hidden
	 */
	timeEventResizing(timeEvent: DayViewEvent, resizeEvent: ResizeEvent) {
		this.timeEventResizes.set(timeEvent.event, resizeEvent);
		const adjustedEvents = new Map<CalendarEvent, CalendarEvent>();

		const tempEvents = [...this.events];

		this.timeEventResizes.forEach((lastResizeEvent, event) => {
			const newEventDates = this.getTimeEventResizedDates(event, lastResizeEvent);
			const adjustedEvent = { ...event, ...newEventDates };
			adjustedEvents.set(adjustedEvent, event);
			const eventIndex = tempEvents.indexOf(event);
			tempEvents[eventIndex] = adjustedEvent;
		});

		this.restoreOriginalEvents(tempEvents, adjustedEvents);
	}

	/**
	 * @hidden
	 */
	timeEventResizeEnded(timeEvent: DayViewEvent) {
		this.view = this.getWeekView(this.events);
		const lastResizeEvent = this.timeEventResizes.get(timeEvent.event);
		this.timeEventResizes.delete(timeEvent.event);
		const newEventDates = this.getTimeEventResizedDates(timeEvent.event, lastResizeEvent);
		this.eventTimesChanged.emit({
			newStart: newEventDates.start,
			newEnd: newEventDates.end,
			event: timeEvent.event,
			type: CalendarEventTimesChangedEventType.Resize,
		});
	}

	/**
	 * @hidden
	 */
	allDayEventResizeStarted(
		allDayEventsContainer: HTMLElement,
		allDayEvent: WeekViewAllDayEvent,
		resizeEvent: ResizeEvent,
	): void {
		this.allDayEventResizes.set(allDayEvent, {
			originalOffset: allDayEvent.offset,
			originalSpan: allDayEvent.span,
			edge: typeof resizeEvent.edges.left !== 'undefined' ? 'left' : 'right',
		});
		this.resizeStarted(allDayEventsContainer, this.getDayColumnWidth(allDayEventsContainer));
	}

	/**
	 * @hidden
	 */
	allDayEventResizing(
		allDayEvent: WeekViewAllDayEvent,
		resizeEvent: ResizeEvent,
		dayWidth: number,
	): void {
		const currentResize: WeekViewAllDayEventResize = this.allDayEventResizes.get(allDayEvent);

		if (resizeEvent.edges.left) {
			const diff: number = Math.round(+resizeEvent.edges.left / dayWidth);
			allDayEvent.offset = currentResize.originalOffset + diff;
			allDayEvent.span = currentResize.originalSpan - diff;
		} else if (resizeEvent.edges.right) {
			const diff: number = Math.round(+resizeEvent.edges.right / dayWidth);
			allDayEvent.span = currentResize.originalSpan + diff;
		}
	}

	/**
	 * @hidden
	 */
	allDayEventResizeEnded(allDayEvent: WeekViewAllDayEvent): void {
		const currentResize: WeekViewAllDayEventResize = this.allDayEventResizes.get(allDayEvent);

		const allDayEventResizingBeforeStart = currentResize.edge === 'left';
		let daysDiff: number;
		if (allDayEventResizingBeforeStart) {
			daysDiff = allDayEvent.offset - currentResize.originalOffset;
		} else {
			daysDiff = allDayEvent.span - currentResize.originalSpan;
		}

		allDayEvent.offset = currentResize.originalOffset;
		allDayEvent.span = currentResize.originalSpan;

		let newStart: Date = allDayEvent.event.start;
		let newEnd: Date = allDayEvent.event.end || allDayEvent.event.start;
		if (allDayEventResizingBeforeStart) {
			newStart = this.dateAdapter.addDays(newStart, daysDiff);
		} else {
			newEnd = this.dateAdapter.addDays(newEnd, daysDiff);
		}

		this.eventTimesChanged.emit({
			newStart,
			newEnd,
			event: allDayEvent.event,
			type: CalendarEventTimesChangedEventType.Resize,
		});
		this.allDayEventResizes.delete(allDayEvent);
	}

	/**
	 * @hidden
	 */
	getDayColumnWidth(eventRowContainer: HTMLElement): number {
		return Math.floor(eventRowContainer.offsetWidth / this.days.length);
	}

	/**
	 * @hidden
	 */
	eventDropped(
		dropEvent: DropEvent<{ event?: CalendarEvent; calendarId?: symbol }>,
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

	/**
	 * @hidden
	 */
	dragStarted(eventsContainer: HTMLElement, event: HTMLElement, dayEvent?: DayViewEvent): void {
		this.dayColumnWidth = this.getDayColumnWidth(eventsContainer);
		const dragHelper: CalendarDragHelper = new CalendarDragHelper(eventsContainer, event);
		this.validateDrag = ({ x, y }) =>
			this.allDayEventResizes.size === 0 &&
			this.timeEventResizes.size === 0 &&
			dragHelper.validateDrag({
				x,
				y,
				snapDraggedEvents: this.snapDraggedEvents,
			});
		this.dragActive = true;
		this.eventDragEnter = 0;
		if (!this.snapDraggedEvents && dayEvent) {
			this.view.hourColumns.forEach((column) => {
				const linkedEvent = column.events.find(
					(columnEvent) => columnEvent.event === dayEvent.event && columnEvent !== dayEvent,
				);
				// hide any linked events while dragging
				if (linkedEvent) {
					linkedEvent.width = 0;
					linkedEvent.height = 0;
				}
			});
		}
		this.cdr.markForCheck();
	}

	public deleteEvent(e, spec, clinic,date) {
		debugger;
		if (this.supervisorService.popover) {
			this.supervisorService.popover.isOpen()
				? this.supervisorService.popover.close()
				: this.supervisorService.popover;
		}
		var specialityName: any;
		var ClinicName: any;
		let _event={...e};
		_event.availableDoctors.map(availabledoc=>{
					let current_dateList_event=getAvailableDoctorCurrentDateList(availabledoc.dateList,date)
					availabledoc['current_dateList_event']=current_dateList_event
				})
		this.supervisorService.currentDeleteAppointment = _event;
		this.monthService.specialityForDeleteModal = spec.name;
		this.monthService.specialityQualifierForDeleteModal = spec.qualifier;
			this.monthService.clinicForDeleteModal =clinic.facility_name+'-'+ clinic.name;
		this.monthService.clinicQualifierForDeleteModal =clinic.facility.qualifier+'-'+ clinic.qualifier;
		this.monthService.available_speciality_ForDeleteModal = _event.current_dateList_event.available_speciality_id
		this.monthService.date_list_id_ForDeleteModal = _event.current_dateList_event.id;

		const activeModal = this.deleteModal.open(AccordianComponent, {
			size: 'lg',
			backdrop: 'static',
			keyboard: false,
		});
	}
	/**
	 * @hidden
	 */
	dragMove(dayEvent: DayViewEvent, dragEvent: DragMoveEvent) {
		if (this.snapDraggedEvents) {
			const newEventTimes = this.getDragMovedEventTimes(
				dayEvent,
				dragEvent,
				this.dayColumnWidth,
				true,
			);
			const originalEvent = dayEvent.event;
			const adjustedEvent = { ...originalEvent, ...newEventTimes };
			const tempEvents = this.events.map((event) => {
				if (event === originalEvent) {
					return adjustedEvent;
				}
				return event;
			});
			this.restoreOriginalEvents(tempEvents, new Map([[adjustedEvent, originalEvent]]));
		}
	}

	/**
	 * @hidden
	 */
	dragEnded(
		weekEvent: WeekViewAllDayEvent | DayViewEvent,
		dragEndEvent: DragEndEvent,
		dayWidth: number,
		useY = false,
	): void {
		this.view = this.getWeekView(this.events);
		this.dragActive = false;
		const { start, end } = this.getDragMovedEventTimes(weekEvent, dragEndEvent, dayWidth, useY);
		if (this.eventDragEnter > 0 && isDraggedWithinPeriod(start, end, this.view.period)) {
			this.eventTimesChanged.emit({
				newStart: start,
				newEnd: end,
				event: weekEvent.event,
				type: CalendarEventTimesChangedEventType.Drag,
				allDay: !useY,
			});
		}
	}

	private refreshHeader(): void {
		this.days = this.utils.getWeekViewHeader({
			viewDate: this.viewDate,
			weekStartsOn: this.weekStartsOn,
			excluded: this.excludeDays,
			weekendDays: this.weekendDays,
			...getWeekViewPeriod(
				this.dateAdapter,
				this.viewDate,
				this.weekStartsOn,
				this.excludeDays,
				this.daysInWeek,
			),
		});
		this.emitBeforeViewRender();
	}

	private refreshBody(): void {
		this.view = this.getWeekView(this.events);
		this.emitBeforeViewRender();
	}

	private refreshAll(): void {
		this.refreshHeader();
		this.refreshBody();
	}

	private emitBeforeViewRender(): void {
		if (this.days && this.view) {
			this.beforeViewRender.emit({
				header: this.days,
				...this.view,
			});
		}
	}

	private getWeekView(events: CalendarEvent[]) {
		return this.utils.getWeekView({
			events,
			viewDate: this.viewDate,
			weekStartsOn: this.weekStartsOn,
			excluded: this.excludeDays,
			precision: this.precision,
			absolutePositionedEvents: true,
			hourSegments: this.hourSegments,
			dayStart: {
				hour: this.dayStartHour,
				minute: this.dayStartMinute,
			},
			dayEnd: {
				hour: this.dayEndHour,
				minute: this.dayEndMinute,
			},
			segmentHeight: this.hourSegmentHeight,
			weekendDays: this.weekendDays,
			...getWeekViewPeriod(
				this.dateAdapter,
				this.viewDate,
				this.weekStartsOn,
				this.excludeDays,
				this.daysInWeek,
			),
		});
	}

	private getDragMovedEventTimes(
		weekEvent: WeekViewAllDayEvent | DayViewEvent,
		dragEndEvent: DragEndEvent | DragMoveEvent,
		dayWidth: number,
		useY: boolean,
	) {
		const daysDragged = roundToNearest(dragEndEvent.x, dayWidth) / dayWidth;
		const minutesMoved = useY
			? getMinutesMoved(
					dragEndEvent.y,
					this.hourSegments,
					this.hourSegmentHeight,
					this.eventSnapSize,
			  )
			: 0;

		const start = this.dateAdapter.addMinutes(
			this.dateAdapter.addDays(weekEvent.event.start, daysDragged),
			minutesMoved,
		);
		let end: Date;
		if (weekEvent.event.end) {
			end = this.dateAdapter.addMinutes(
				this.dateAdapter.addDays(weekEvent.event.end, daysDragged),
				minutesMoved,
			);
		}

		return { start, end };
	}

	private restoreOriginalEvents(
		tempEvents: CalendarEvent[],
		adjustedEvents: Map<CalendarEvent, CalendarEvent>,
	) {
		this.view = this.getWeekView(tempEvents);
		const adjustedEventsArray = tempEvents.filter((event) => adjustedEvents.has(event));
		this.view.hourColumns.forEach((column) => {
			adjustedEventsArray.forEach((adjustedEvent) => {
				const originalEvent = adjustedEvents.get(adjustedEvent);
				const existingColumnEvent = column.events.find(
					(columnEvent) => columnEvent.event === adjustedEvent,
				);
				if (existingColumnEvent) {
					// restore the original event so trackBy kicks in and the dom isn't changed
					existingColumnEvent.event = originalEvent;
				} else {
					// add a dummy event to the drop so if the event was removed from the original column the drag doesn't end early
					column.events.push({
						event: originalEvent,
						left: 0,
						top: 0,
						height: 0,
						width: 0,
						startsBeforeDay: false,
						endsAfterDay: false,
					});
				}
			});
		});
		adjustedEvents.clear();
	}

	private getTimeEventResizedDates(calendarEvent: CalendarEvent, resizeEvent: ResizeEvent) {
		const minimumEventHeight = getMinimumEventHeightInMinutes(
			this.hourSegments,
			this.hourSegmentHeight,
		);
		const newEventDates = {
			start: calendarEvent.start,
			end: getDefaultEventEnd(this.dateAdapter, calendarEvent, minimumEventHeight),
		};
		const { end, ...eventWithoutEnd } = calendarEvent;
		const smallestResizes = {
			start: this.dateAdapter.addMinutes(newEventDates.end, minimumEventHeight * -1),
			end: getDefaultEventEnd(this.dateAdapter, eventWithoutEnd, minimumEventHeight),
		};

		if (resizeEvent.edges.left) {
			const daysDiff = Math.round(+resizeEvent.edges.left / this.dayColumnWidth);
			const newStart = this.dateAdapter.addDays(newEventDates.start, daysDiff);
			if (newStart < smallestResizes.start) {
				newEventDates.start = newStart;
			} else {
				newEventDates.start = smallestResizes.start;
			}
		} else if (resizeEvent.edges.right) {
			const daysDiff = Math.round(+resizeEvent.edges.right / this.dayColumnWidth);
			const newEnd = this.dateAdapter.addDays(newEventDates.end, daysDiff);
			if (newEnd > smallestResizes.end) {
				newEventDates.end = newEnd;
			} else {
				newEventDates.end = smallestResizes.end;
			}
		}

		if (resizeEvent.edges.top) {
			const minutesMoved = getMinutesMoved(
				resizeEvent.edges.top as number,
				this.hourSegments,
				this.hourSegmentHeight,
				this.eventSnapSize,
			);
			const newStart = this.dateAdapter.addMinutes(newEventDates.start, minutesMoved);
			if (newStart < smallestResizes.start) {
				newEventDates.start = newStart;
			} else {
				newEventDates.start = smallestResizes.start;
			}
		} else if (resizeEvent.edges.bottom) {
			const minutesMoved = getMinutesMoved(
				resizeEvent.edges.bottom as number,
				this.hourSegments,
				this.hourSegmentHeight,
				this.eventSnapSize,
			);
			const newEnd = this.dateAdapter.addMinutes(newEventDates.end, minutesMoved);
			if (newEnd > smallestResizes.end) {
				newEventDates.end = newEnd;
			} else {
				newEventDates.end = smallestResizes.end;
			}
		}

		return newEventDates;
	}

	disable(day, specId) {
		let temp = this.clinicId;
		if (!this.swaps) {
			temp = specId;
		}
		if (temp.id != 0) {
			for (let i = 0; i < (temp.day_list&&temp.day_list.length); i++) {
				if (day.getDay() == temp.day_list[i]) {
					return false;
				}
			}
		} 
		// else {
		// 	return true;
		// }
		return true;
	}
	returnItem(day, specId, clinicId) {
		
		let newEvents = [];
		for (let e of this.specAssign) {
			if (
				(e.facility_location_id  == clinicId &&
					e.speciality_id == specId &&
					this.swaps &&
					// day.date.toString().substring(0, 15) ==
					// 	new Date(e.startDate).toString().substring(0, 15)
					this.CheckeventOndateExist(e,day.date)
						) ||
				(e.facility_location_id == specId &&
					e.speciality_id == clinicId &&
					!this.swaps &&
					// day.date.toString().substring(0, 15) == new Date(e.startDate).toString().substring(0, 15)
					this.CheckeventOndateExist(e,day.date)
					)
			) {
				let newDay = day.date.toString().substring(0, 3);
				if (newDay == 'Wed' || newDay == 'Thu' || newDay == 'Fri' || newDay == 'Sat') {
					e['placement'] = 'left';
				} else {
					e['placement'] = 'right';
				}

				// e.availableDoctors.map(availabledoc=>{
				// 	let current_dateList_event=getAvailableDoctorCurrentDateList(availabledoc.dateList,day.date)
				// 	availabledoc['current_dateList_event']=current_dateList_event
				// })

				let _datelist=e.dateList&&e.dateList.find(datelist=>new Date(datelist.start_date).toString().substring(0, 15)==day.date.toString().substring(0, 15));	

				if(_datelist)
				{
					// _datelist=this.convertdateTimeToSelectedZone(_datelist);
					
					e['current_dateList_event']=_datelist
				}	   
				newEvents.push(e);
			

			}
		}
		return newEvents;
	}

	makeDeepCopyObject(obj) {
		return Object.assign({}, obj);
	}

	currentDateEventFromdateList(event:any, _date)
	{
		let currentDateEvent=event.dateList&&event.dateList.find(datelist=>new Date(datelist.start_date).toString().substring(0, 15)==new Date(_date).toString().substring(0, 15));
		let _newEvent={...event};
		_newEvent.current_dateList_event=currentDateEvent
		return _newEvent
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
	
		let eventExist=_event.dateList&& _event.dateList.length>0&&_event.dateList.find(date_list=>new Date(date_list.start_date).toString().substring(0, 15)==date.toString().substring(0, 15))
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

	public cellCurrentAppointments(event) {
		this.updateSpecAssign.emit(event);
	}

	public open(spec, clinic, date) {
		if (!this.disable(date, spec) && this.aclService.hasPermission(this.userPermissions.scheduler_assignment_add_new)) {
			if (this.supervisorService.popover) {
				this.supervisorService.popover.isOpen()
					? this.supervisorService.popover.close()
					: this.supervisorService.popover;
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
			const activeModal = this.addAssignmentService.open(AddAssignmentModalComponent, {
				size: 'lg',
				backdrop: 'static',
				keyboard: false,
			});
			activeModal.result.then(() => {
			});
		}
	}
	updateFunction(date, event, clinicId, spec) {
		if (this.supervisorService.popover) {
			this.supervisorService.popover.isOpen()
				? this.supervisorService.popover.close()
				: this.supervisorService.popover;
		}
		this._subjectService.assignDoctorData = [];
		if (this.swaps) {
			this._subjectService.spec = spec;
			this._subjectService.clinic = clinicId;
		} else {
			this._subjectService.spec = clinicId;
			this._subjectService.clinic = spec;
		}
		let _event={...event}
		// e.availableDoctors.map(availabledoc=>{
				// 	let current_dateList_event=getAvailableDoctorCurrentDateList(availabledoc.dateList,day.date)
				// 	availabledoc['current_dateList_event']=current_dateList_event
				// })

		// this._subjectService.numberOfDoc = event.noOfDoctors;
		this._subjectService.numberOfDoc = _event.current_dateList_event.no_of_doctors;
		// this._subjectService.assignDoc = event.doctorName;
		this._subjectService.assignDoc = _event.availableDoctors;
		this._subjectService.assignDoctorData=_event.availableDoctors;
		this._subjectService.currentEvent=_event;
		this._subjectService.currentStartDate = _event.current_dateList_event.start_date;
		this._subjectService.currentEndDate = _event.current_dateList_event.end_date;
		this._subjectService.specAssignId = _event.id;
		this._subjectService.result = [];
		const activeModal = this.addAssignmentService.open(UpdateAssignmentModalComponent, {
			size: 'lg',
			backdrop: 'static',
			keyboard: false,
		});
		activeModal.result.then(() => {
			// this.event.noOfDoctors = 5
			if (this._subjectService.result.result) {
				event.startDate = this._subjectService.result.result[0]['startDate'];
				event.endDate = this._subjectService.result.result[0]['endDate'];
				event.start = new Date(event.startDate);
				event.end = new Date(event.endDate);

				event.startTime =
					event.start.getHours().toString() + ':' + event.start.getMinutes().toString();
				event.endTime = event.end.getHours().toString() + ':' + event.end.getMinutes().toString();

				event.no_of_doctors = this._subjectService.result.result[0]['noOfDoctors'];

				// event.doctorName = [];
				event.availableDoctors = [];

				for (let i = 1; i < this._subjectService.result.result.length; i++) {
					// event.doctorName.push(this._subjectService.result.result[i].doctorName);
					event.availableDoctors=this._subjectService.result.result[i].availableDoctors
				}
			}
		});
	}
	openPop(p: NgbPopover): void {
		if (this.supervisorService.popover) {
			this.supervisorService.popover.isOpen()
				? this.supervisorService.popover.close()
				: this.supervisorService.popover;
		}
		this.supervisorService.popover = p;
	}
}
