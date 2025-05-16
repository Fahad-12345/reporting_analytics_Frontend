import { DatePipeFormatService } from './../../../../../../../../shared/services/datePipe-format.service';
import {
  Component,
  Input,
  OnChanges,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  LOCALE_ID,
  Inject,
  OnInit,
  OnDestroy,
  TemplateRef
} from '@angular/core';
import {
  CalendarEvent,
  DayView,
  DayViewHour,
  DayViewHourSegment,
  DayViewEvent,
  ViewPeriod,
  WeekViewAllDayEvent
} from 'calendar-utils';
import { Subject, Subscription } from 'rxjs';
import { ResizeEvent } from 'angular-resizable-element';
import { CalendarDragHelper } from '../common/calendar-drag-helper.provider';
import { CalendarResizeHelper } from '../common/calendar-resize-helper.provider';
import {
  CalendarEventTimesChangedEvent,
  CalendarEventTimesChangedEventType
} from '../common/calendar-event-times-changed-event.interface';
import { CalendarUtils } from '../common/calendar-utils.provider';
import { AddDocAssignmentModalComponent } from '../../../../../modals/add-doc-assignment-modal/add-doc-assignment-modal.component'
import {
  validateEvents,
  trackByEventId,
  trackByHour,
  trackByHourSegment,
  getMinutesMoved,
  getDefaultEventEnd,
  getMinimumEventHeightInMinutes,
  trackByDayOrWeekEvent,
  isDraggedWithinPeriod,
  shouldFireDroppedEvent
} from '../common/util';
import { DateAdapter } from '../../date-adapters/date-adapter';
import { DragEndEvent } from 'angular-draggable-droppable';
import { PlacementArray } from 'positioning';
import { AccordianComponent } from '../../../../../modals//accordian/accordian.component'
import { UpdateDocAssignmentModalComponent } from '../../../../../modals/update-doc-assignment-modal/update-doc-assignment-modal.component';
//services
import { CalendarDayService } from './calendar-day.service';
import { SchedulerSupervisorService } from '../../../../../../../scheduler-supervisor.service';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { AssignDoctorSubjectService } from '../../../../../assign-doctor-subject.service';
import { SubjectService } from '../../../../../subject.service';
import { ToastrService } from 'ngx-toastr';
import { RequestService } from '@appDir/shared/services/request.service';
import { HttpSuccessResponse, StorageData } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { AssignDoctorUrlsEnum } from '../../../../../assign-doctor-urls-enum';
import { convert12, convertDateTimeForRetrieving } from '@appDir/shared/utils/utils.helpers';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
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
  selector: 'mwl-calendar-day-view',
  templateUrl: 'calendar-day-view.component.html',
  styleUrls: ['calendar-day-view.scss']
})
export class CalendarDayViewComponent implements OnChanges, OnInit, OnDestroy {
  public filteredEvents: any = [];

  @Output() childEvent = new EventEmitter();
  @Input() swaps: any;
  @Input() clinicId: any;
  @Input() speciality: any;
  @Input() clinicIndex: any;
  public specAssign: any;
  userPermissions = USERPERMISSIONS;

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
  @Input() specality_id:any;
  @Input() facility_location_id:any;

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


  disable = false;
  /**
   * @hidden
   */
  constructor(
    private cdr: ChangeDetectorRef,
    protected requestService: RequestService,
    private customDiallogService: CustomDiallogService,
    private utils: CalendarUtils,
    public deleteModal: NgbModal,
    public supervisorService: SchedulerSupervisorService, 
    @Inject(LOCALE_ID) locale: string,
    public AssignDoctorSubjectService: AssignDoctorSubjectService,
    public subject: SubjectService,
    private dateAdapter: DateAdapter, private toastrService: ToastrService,
    public dayService: CalendarDayService,
	public addAssignmentDayModal: NgbModal,
	private storageData: StorageData,
	public datePipeService:DatePipeFormatService,
  public aclService: AclService
  ) {
    this.locale = locale;
  }

  /**
   * @hidden   
   */
  ngOnInit(): void {
    this.subject.cast.subscribe(assign => {
      this.specAssign = JSON.parse(JSON.stringify(assign))
      // this.cdr.detectChanges()
      this.refreshAll()
      // this.returnItem(this.day, this.spec.id, this.clinicId.id)
    })
    if (this.refresh) {
      this.refreshSubscription = this.refresh.subscribe(() => {
        this.refreshAll();
        // this.cdr.markForCheck();
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
    allDay: boolean
  ): void {
    if (shouldFireDroppedEvent(dropEvent, date, allDay, this.calendarId)) {
      this.eventTimesChanged.emit({
        type: CalendarEventTimesChangedEventType.Drop,
        event: dropEvent.dropData.event,
        newStart: date,
        allDay
      });
    }
  }

  resizeStarted(
    event: DayViewEvent,
    resizeEvent: ResizeEvent,
    dayEventsContainer: HTMLElement
  ): void {
    this.currentResizes.set(event, {
      originalTop: event.top,
      originalHeight: event.height,
      edge: typeof resizeEvent.edges.top !== 'undefined' ? 'top' : 'bottom'
    });
    const resizeHelper: CalendarResizeHelper = new CalendarResizeHelper(
      dayEventsContainer
    );
    this.validateResize = ({ rectangle }) =>
      resizeHelper.validateResize({ rectangle });
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
      this.eventSnapSize
    );

    let newStart: Date = dayEvent.event.start;
    let newEnd: Date = getDefaultEventEnd(
      this.dateAdapter,
      dayEvent.event,
      getMinimumEventHeightInMinutes(this.hourSegments, this.hourSegmentHeight)
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
      type: CalendarEventTimesChangedEventType.Resize
    });
    this.currentResizes.delete(dayEvent);
  }

  dragStarted(event: HTMLElement, dayEventsContainer: HTMLElement): void {
    const dragHelper: CalendarDragHelper = new CalendarDragHelper(
      dayEventsContainer,
      event
    );
    this.validateDrag = ({ x, y }) =>
      this.currentResizes.size === 0 &&
      dragHelper.validateDrag({
        x,
        y,
        snapDraggedEvents: this.snapDraggedEvents
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
        this.eventSnapSize
      );
      let newStart: Date = this.dateAdapter.addMinutes(
        dayEvent.event.start,
        minutesMoved
      );
      if (dragEndEvent.y < 0 && newStart < this.view.period.start) {
        minutesMoved += this.dateAdapter.differenceInMinutes(
          this.view.period.start,
          newStart
        );
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
          type: CalendarEventTimesChangedEventType.Drag
        });
      }
    }
  }
  public updateAssignmentModal(event, spec, clinic) {
    if (this.supervisorService.popover) {
      this.supervisorService.popover.isOpen() ? this.supervisorService.popover.close() : this.supervisorService.popover;
    }
    this.subject.Event = event;
    if (this.swaps) {
      this.subject.spec = spec
      this.subject.clinic = this.clinicId
    } else {
      this.subject.spec = this.clinicId
      this.subject.clinic = spec
	}
	this.subject.currentEvent=event
    this.subject.currentStartDate = event.current_dateList_event.start_date;
    this.subject.currentEndDate = event.current_dateList_event.end_date;
    this.subject.updatedEventId = event.id;
    this.subject.recCheckForUpdate = event.recId
    this.subject.specAssignId = event.id;
    const activeModal = this.addAssignmentDayModal.open(UpdateDocAssignmentModalComponent, {
      size: 'lg', backdrop: 'static',
      keyboard: true
    });
  }
  private refreshHourGrid(): void {
    this.hours = this.utils.getDayViewHourGrid({
      viewDate: this.viewDate,
      hourSegments: this.hourSegments,
      dayStart: {
        hour: this.dayStartHour,
        minute: this.dayStartMinute
      },
      dayEnd: {
        hour: this.dayEndHour,
        minute: this.dayEndMinute
      }
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
        minute: this.dayStartMinute
      },
      dayEnd: {
        hour: this.dayEndHour,
        minute: this.dayEndMinute
      },
      eventWidth: this.eventWidth,
      segmentHeight: this.hourSegmentHeight
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
          allDayEvents: this.view.allDayEvents
        },
        period: this.view.period
      });
    }
  }

  disableCheckspecId(specId) {
    this.disable = false;
    if (this.swaps && this.clinicId.id != 0) {
      this.disable = true;
      for (let r = 0; r < (this.clinicId.faciltyTiming&&this.clinicId.faciltyTiming.length); r++) {
        if (this.clinicId.faciltyTiming[r].day_id === this.viewDate.getDay()) {
          this.disable = false;
          break;
        }
      }
      let userTiming = []
      if (!this.disable) {
        if (specId.id != 0) {
          this.disable = true;
          for (let i = 0; i < (specId.doctor&&specId.doctor.user_timings.length); i++) {
            if (this.clinicId.id === specId.doctor.user_timings[i].facility_location_id
              && specId.doctor.user_timings) {
              userTiming = specId.doctor.user_timings;
              break;
            }
          }
        }
        if (userTiming.length != 0) {
          for (let x = 0; x < userTiming.length; x++) {
            if (userTiming[x].day_id === this.viewDate.getDay()) {
              this.disable = false;
              break;
            }
          }
        }
      }

    } else if (!this.swaps && specId.id != 0) {
      this.disable = true;
      for (let r = 0; r < (specId.faciltyTiming&&specId.faciltyTiming.length); r++) {
        if (specId.faciltyTiming[r].day_id === this.viewDate.getDay()) {
          this.disable = false;
          break;
        }
      }
      let userTiming = []
      if (!this.disable) {
        if (this.clinicId.id != 0) {
          this.disable = true;
          for (let i = 0; i < (this.clinicId.doctor&&this.clinicId.doctor.user_timings.length); i++) {
            if (specId.id === this.clinicId.doctor.user_timings[i].facility_location_id
              && this.clinicId.doctor.user_timings) {
              userTiming = this.clinicId.doctor.user_timings;
              break;
            }
          }
        }
        if (userTiming.length != 0) {
          for (let x = 0; x < userTiming.length; x++) {
            if (userTiming[x].day_id === this.viewDate.getDay()) {
              this.disable = false;
              break;
            }
          }
        }
      }

    }
    this.cdr.markForCheck()
    return this.disable
  }
  returnItem(specId) {
    // console.log(specId, this.clinicId)
	debugger;
	// this.facility_location_id = this.swaps?
	   
	// (specId?specId.facility_location_id:''):specId.id;
	
	this.specality_id = this.swaps?
	   
	(specId && specId.doctor && specId.doctor.specialities?specId.doctor.specialities.id:''):
	(this.clinicId && this.clinicId.doctor && this.clinicId.doctor.specialities?this.clinicId.doctor.specialities.id:'');
    let newEvents = []
    for (let e of this.specAssign) {
		if (
        (e.doctor_id == specId.id &&
          e.clinicId == this.clinicId.id && e &&  e.availableSpeciality && 
		  e.availableSpeciality.speciality_id === this.specality_id  && 
          this.swaps &&
		//   new Date(this.viewDate).toString().substring(0, 15) == new Date(e.startDate).toString().substring(0, 15)
		this.CheckeventOndateExist(e, new Date(this.viewDate))
		  ) ||
        (e.doctor_id == this.clinicId.id &&
			
          e.clinicId == specId.id &&  e &&  e.availableSpeciality && 
		  e.availableSpeciality.speciality_id === this.specality_id  && 
          !this.swaps &&
		//   new Date(this.viewDate).toString().substring(0, 15) == new Date(e.startDate).toString().substring(0, 15)
		this.CheckeventOndateExist(e, new Date(this.viewDate))
		  )
      ) {
		let _datelist=e.dateList&&e.dateList.find(datelist=>new Date(datelist.start_date).toString().substring(0, 15)==this.viewDate.toString().substring(0, 15));	

		if(_datelist)
		{
			// _datelist=this.convertdateTimeToSelectedZone(_datelist);
			
			e['current_dateList_event']=_datelist
		}	 
  

		// let _event=JSON.parse(JSON.stringify(e));;
		// let _datelist=e.dateList&&e.dateList.find(datelist=>new Date(datelist.start_date).toString().substring(0, 15)==new Date(this.viewDate).toString().substring(0, 15));
		// if(_datelist)
		// {
		// 	_datelist=this.convertdateTimeToSelectedZone(_datelist)

		// }
		// _event['dateList'] =_datelist? _datelist:null

		newEvents.push(e);
        // newEvents.push(e);
      }
      else if (
        (e.doctor_id == specId.id &&
          this.swaps && e.subject &&
		//   new Date(this.viewDate).toString().substring(0, 15) == new Date(e.startDate).toString().substring(0, 15)
		this.CheckeventOndateExist(e, new Date(this.viewDate))
		  )
        ||
        (e.doctor_id == this.clinicId.id &&
			e.facility_location_id  ===this.facility_location_id && 
          !this.swaps && e.subject &&
		//   new Date(this.viewDate).toString().substring(0, 15) == new Date(e.startDate).toString().substring(0, 15)
		this.CheckeventOndateExist(e, new Date(this.viewDate))
		  )
      ) {

		let _datelist=e.dateList&&e.dateList.find(datelist=>new Date(datelist.start_date).toString().substring(0, 15)==this.viewDate.toString().substring(0, 15));	

		if(_datelist)
		{
			// _datelist=this.convertdateTimeToSelectedZone(_datelist);
			
			e['current_dateList_event']=_datelist
		}	 

		// let _event=JSON.parse(JSON.stringify(e));;
		// let _datelist=e.dateList&&e.dateList.find(datelist=>new Date(datelist.start_date).toString().substring(0, 15)==new Date(this.viewDate).toString().substring(0, 15));
		// if(_datelist)
		// {
		// 	_datelist=this.convertdateTimeToSelectedZone(_datelist)

		// }
		// _event['dateList'] =_datelist? _datelist:null

		newEvents.push(e);
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


  public removeSideEntry(spec) {
    this.childEvent.emit(spec);
  }
  public openAssignmentModal(spec) {
    if (!this.disableCheckspecId(spec) && this.aclService.hasPermission(this.userPermissions.scheduler_assignment_add_new)) {
      if (this.supervisorService.popover) {
        this.supervisorService.popover.isOpen() ? this.supervisorService.popover.close() : this.supervisorService.popover;
      }
      if (this.speciality["id"] != 0 && this.clinicId["id"] != 0) {

        this.subject.currentStartDate = this.viewDate
		this.subject.currentSelectedDateDoubleClicked =  this.viewDate.toString();
        if (this.swaps) {
          this.subject.spec = spec
          this.subject.clinic = this.clinicId
        } else {
          this.subject.spec = this.clinicId
          this.subject.clinic = spec
        }
        const activeModal = this.addAssignmentDayModal.open(AddDocAssignmentModalComponent, {
          size: 'lg', backdrop: 'static',
          keyboard: true
        });
      }
    }
  }
  public deleteEvent(e, spec, clinic) {
	  debugger;
    if (this.supervisorService.popover) {
      this.supervisorService.popover.isOpen() ? this.supervisorService.popover.close() : this.supervisorService.popover;
    }
	if (e.is_provider_assignment ==false) {      

    this.customDiallogService.confirm('Delete','Are you sure you want to delete?','Yes','No')
		.then((confirmed) => {
			if (confirmed){
        this.requestService
        .sendRequest(
     AssignDoctorUrlsEnum.deleteDoctorAssignment,
          'DELETE',
          REQUEST_SERVERS.schedulerApiUrl1,
          {
            'date_list_id': e.current_dateList_event.id,
    available_doctor_id : e && e.current_dateList_event && e.current_dateList_event.available_doctor_id?
    e.current_dateList_event.available_doctor_id : null
          }
        ).subscribe(
          (response: HttpSuccessResponse) => {
            this.AssignDoctorSubjectService.refreshUpdate("delete")
            this.toastrService.success('Provider assignment Successfully Deleted', 'Success')
          }
        )
			}else if(confirmed === false){
			}else{
			}
		})
		.catch();

    }
    else {
      var specialityName: any;
      var ClinicName: any;
	  debugger;
      this.supervisorService.currentDeleteAppointment = e;
      this.subject.specialityForDeleteModal = e.doctor.userBasicInfo.middle_name? e.doctor.userBasicInfo.first_name + " "+e.doctor.userBasicInfo.middle_name +" "+e.doctor.userBasicInfo.last_name : e.doctor.userBasicInfo.first_name +" "+e.doctor.userBasicInfo.last_name ;
      if (this.swaps) {
        this.subject.clinicForDeleteModal = `${clinic.facility_name}-${clinic.name}`
		this.subject.specialityNameForDeleteModal = spec.speciality;
      } else {
        this.subject.clinicForDeleteModal = `${spec.facility_name?spec.facility_name+'-':''}${spec.name}`
		this.subject.specialityNameForDeleteModal = spec.speciality;
      }
      this.subject.available_doctor_id_ForDeleteModal = e.current_dateList_event.available_doctor_id;
      this.subject.date_list_id_ForDeleteModal = e.current_dateList_event.id;

      const activeModal = this.deleteModal.open(AccordianComponent, {
        size: 'lg', backdrop: 'static',
        keyboard: true
      });
    }
    this.subject.specialityQualifierNameForDeleteModal = e.availableSpeciality && e.availableSpeciality.speciality && e.availableSpeciality.speciality.qualifier;
		this.subject.clinicQualifierForDeleteModal = e.facilityLocations && e.facilityLocations.facility?   e.facilityLocations.facility.qualifier +'-'+e.facilityLocations.qualifier:'';
  }
  openPop(p: NgbPopover): void {
    if (this.supervisorService.popover) {
      this.supervisorService.popover.isOpen() ? this.supervisorService.popover.close() : this.supervisorService.popover;
    }
    this.supervisorService.popover = p;
  }

}
