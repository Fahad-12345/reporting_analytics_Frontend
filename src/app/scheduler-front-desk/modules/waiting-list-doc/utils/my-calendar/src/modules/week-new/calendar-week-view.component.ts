import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  OnChanges,
  OnInit,
  OnDestroy,
  LOCALE_ID,
  Inject,
  TemplateRef
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import {
  WeekDay,
  CalendarEvent,
  WeekViewAllDayEvent,
  WeekView,
  ViewPeriod,
  WeekViewHourColumn,
  DayViewEvent,
  DayViewHourSegment,
  DayViewHour
} from 'calendar-utils';
import { ResizeEvent } from 'angular-resizable-element';
import { CalendarDragHelper } from '../common/calendar-drag-helper.provider';
import { CalendarResizeHelper } from '../common/calendar-resize-helper.provider';
import {
  CalendarEventTimesChangedEvent,
  CalendarEventTimesChangedEventType
} from '../common/calendar-event-times-changed-event.interface';
import { CalendarUtils } from '../common/calendar-utils.provider';
import {
  validateEvents,
  trackByIndex,
  roundToNearest,
  trackByWeekDayHeaderDate,
  trackByHourSegment,
  trackByHour,
  getMinutesMoved,
  getDefaultEventEnd,
  getMinimumEventHeightInMinutes,
  addDaysWithExclusions,
  trackByDayOrWeekEvent,
  isDraggedWithinPeriod,
  shouldFireDroppedEvent,
  getWeekViewPeriod
} from '../common/util';
import { DateAdapter } from '../../date-adapters/date-adapter';
import {
  DragEndEvent,
  DropEvent,
  DragMoveEvent
} from 'angular-draggable-droppable';
import { PlacementArray } from 'positioning';
import { Router } from '@angular/router';
import { WeekSubjectService } from '../daySub/subject.service';
import { ScrollToService, ScrollToConfigOptions } from '@nicky-lenaers/ngx-scroll-to';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarWeekService } from './calendar-week.service';
import { DoctorService } from '../../../../../../../doctor.service';

import { SubjectService } from '../../../../../subject.service';
import { WeekDaySubjectService } from './subject.service';
export interface WeekViewAllDayEventResize {
  originalOffset: number;
  originalSpan: number;
  edge: string;
}

export interface CalendarWeekViewBeforeRenderEvent extends WeekView {
  header: WeekDay[];
}

@Component({
  selector: 'mwl-calendar-week-view-day',
  templateUrl: 'calendar-week-view.component.html',
  styleUrls: ['./calendar-week-view.scss']
})
export class CalendarWeekViewComponent implements OnChanges, OnInit, OnDestroy {
  @Output() childEvent = new EventEmitter();
  @Output() startEvaluation = new EventEmitter();
  @Output() currentAssignments = new EventEmitter();


  @Input() currentDocId: any;
  @Input() speciality: any;

  @Input() clinicId: any;
  @Input() docIndex: any;

  @Input()
  viewDate: Date;

  /**
   * An array of events to display on view
   * The schema is available here: https://github.com/mattlewis92/calendar-utils/blob/c51689985f59a271940e30bc4e2c4e1fee3fcb5c/src/calendarUtils.ts#L49-L63
   */
  // @Input()
  events: CalendarEvent[] = [];

  /**
   * An array of day-old indexes (0 = sunday, 1 = monday etc) that will be hidden on the view
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
   * `days` will round event start and end dates to the nearest day-old and `minutes` will not do this rounding
   */
  @Input()
  precision: 'days' | 'minutes' = 'days';

  /**
   * An array of day-old indexes (0 = sunday, 1 = monday etc) that indicate which days are weekends
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
  hourSegments: number;

  /**
   * The height in pixels of each hour segment
   */
  @Input()
  hourSegmentHeight: number = 30;

  /**
   * The day-old start hours in 24 hour time. Must be 0-23
   */
  @Input()
  dayStartHour: number = 0;

  /**
   * The day-old start minutes. Must be 0-59
   */
  @Input()
  dayStartMinute: number = 0;

  /**
   * The day-old end hours in 24 hour time. Must be 0-23
   */
  @Input()
  dayEndHour: number = 23;

  /**
   * The day-old end minutes. Must be 0-59
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
   * A custom template to use for the all day-old events label text
   */
  @Input()
  allDayEventsLabelTemplate: TemplateRef<any>;

  /**
   * The number of days in a week. Can be used to create a shorter or longer week view.
   * The first day-old of the week will always be the `viewDate`
   */
  @Input()
  daysInWeek: number;

  /**
   * Called when a header week day-old is clicked. Adding a `cssClass` property on `$event.day-old` will add that class to the header element
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
   * If you add the `cssClass` property to a day-old in the header it will add that class to the cell element in the template
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


  events_Out: any;

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
  allDayEventResizes: Map<
    WeekViewAllDayEvent,
    WeekViewAllDayEventResize
  > = new Map();

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
  @Input() doc: any;

  public scrollValue: number = 750;

  /**
   * @hidden
   */
  trackByHourColumn = (index: number, column: WeekViewHourColumn) =>
    column.hours[0] ? column.hours[0].segments[0].date.toISOString() : column;


  public totalDays: any = [];
  /**
   * @hidden

   */
  public localStorageId: any;
  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private utils: CalendarUtils,
    public unavailabilityModal: NgbModal,
    public subject: SubjectService,
    public sub: WeekDaySubjectService,
    public weekService: CalendarWeekService,
    public _subjectService: WeekSubjectService,
    @Inject(LOCALE_ID) locale: string,
    private dateAdapter: DateAdapter,
    private _scrollToService: ScrollToService,
    public doctorService: DoctorService,
	public datePipeService:DatePipeFormatService
  ) {


  }

  /**
   * @hidden
   */
  public column: any;

  speciality_Check: boolean;


  ngAfterViewInit() {
    this.sub.refreshScroll('scroll')
  }

  ngOnInit(): void {
    this.subject.castHour.subscribe(hour => {
      if (hour.length != 0) {

        this.hourSegments = hour
        // this.triggerScrollToDay()
      }
    })

    this._subjectService.cast.subscribe(data => {
      this.events = data;
      this.refreshAll()
    })
    this.column = this.view.hourColumns[this.viewDate.getDay() - 1]
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
    if (
      changes.viewDate ||
      changes.excludeDays ||
      changes.weekendDays ||
      changes.daysInWeek
    ) {
      this.refreshHeader();
    }

    if (changes.events) {
      validateEvents(this.events);
      this._subjectService.refresh(this.events)

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
    const resizeHelper: CalendarResizeHelper = new CalendarResizeHelper(
      eventsContainer,
      minWidth
    );
    this.validateResize = ({ rectangle }) =>
      resizeHelper.validateResize({ rectangle });
    this.cdr.markForCheck();
  }

  /**
   * @hidden
   */
  timeEventResizeStarted(
    eventsContainer: HTMLElement,
    timeEvent: DayViewEvent,
    resizeEvent: ResizeEvent
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
      const newEventDates = this.getTimeEventResizedDates(
        event,
        lastResizeEvent
      );
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
    const newEventDates = this.getTimeEventResizedDates(
      timeEvent.event,
      lastResizeEvent
    );
    this.eventTimesChanged.emit({
      newStart: newEventDates.start,
      newEnd: newEventDates.end,
      event: timeEvent.event,
      type: CalendarEventTimesChangedEventType.Resize
    });
  }

  /**
   * @hidden
   */
  allDayEventResizeStarted(
    allDayEventsContainer: HTMLElement,
    allDayEvent: WeekViewAllDayEvent,
    resizeEvent: ResizeEvent
  ): void {
    this.allDayEventResizes.set(allDayEvent, {
      originalOffset: allDayEvent.offset,
      originalSpan: allDayEvent.span,
      edge: typeof resizeEvent.edges.left !== 'undefined' ? 'left' : 'right'
    });
    this.resizeStarted(
      allDayEventsContainer,
      this.getDayColumnWidth(allDayEventsContainer)
    );
  }

  /**
   * @hidden
   */
  allDayEventResizing(
    allDayEvent: WeekViewAllDayEvent,
    resizeEvent: ResizeEvent,
    dayWidth: number
  ): void {
    const currentResize: WeekViewAllDayEventResize = this.allDayEventResizes.get(
      allDayEvent
    );

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
    const currentResize: WeekViewAllDayEventResize = this.allDayEventResizes.get(
      allDayEvent
    );

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
      type: CalendarEventTimesChangedEventType.Resize
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

  /**
   * @hidden
   */
  dragStarted(
    eventsContainer: HTMLElement,
    event: HTMLElement,
    dayEvent?: DayViewEvent
  ): void {
    this.dayColumnWidth = this.getDayColumnWidth(eventsContainer);
    const dragHelper: CalendarDragHelper = new CalendarDragHelper(
      eventsContainer,
      event
    );
    this.validateDrag = ({ x, y }) =>
      this.allDayEventResizes.size === 0 &&
      this.timeEventResizes.size === 0 &&
      dragHelper.validateDrag({
        x,
        y,
        snapDraggedEvents: this.snapDraggedEvents
      });
    this.dragActive = true;
    this.eventDragEnter = 0;
    if (!this.snapDraggedEvents && dayEvent) {
      this.view.hourColumns.forEach(column => {
        const linkedEvent = column.events.find(
          columnEvent =>
            columnEvent.event === dayEvent.event && columnEvent !== dayEvent
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

  /**
   * @hidden
   */
  dragMove(dayEvent: DayViewEvent, dragEvent: DragMoveEvent) {
    if (this.snapDraggedEvents) {
      const newEventTimes = this.getDragMovedEventTimes(
        dayEvent,
        dragEvent,
        this.dayColumnWidth,
        true
      );
      const originalEvent = dayEvent.event;
      const adjustedEvent = { ...originalEvent, ...newEventTimes };
      const tempEvents = this.events.map(event => {
        if (event === originalEvent) {
          return adjustedEvent;
        }
        return event;
      });
      this.restoreOriginalEvents(
        tempEvents,
        new Map([[adjustedEvent, originalEvent]])
      );
    }
  }

  /**
   * @hidden
   */
  dragEnded(
    weekEvent: WeekViewAllDayEvent | DayViewEvent,
    dragEndEvent: DragEndEvent,
    dayWidth: number,
    useY = false
  ): void {
    this.view = this.getWeekView(this.events);
    this.dragActive = false;
    const { start, end } = this.getDragMovedEventTimes(
      weekEvent,
      dragEndEvent,
      dayWidth,
      useY
    );
    if (
      this.eventDragEnter > 0 &&
      isDraggedWithinPeriod(start, end, this.view.period)
    ) {
      this.eventTimesChanged.emit({
        newStart: start,
        newEnd: end,
        event: weekEvent.event,
        type: CalendarEventTimesChangedEventType.Drag,
        allDay: !useY
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
        this.daysInWeek
      )
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
        ...this.view
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
        minute: this.dayStartMinute
      },
      dayEnd: {
        hour: this.dayEndHour,
        minute: this.dayEndMinute
      },
      segmentHeight: this.hourSegmentHeight,
      weekendDays: this.weekendDays,
      ...getWeekViewPeriod(
        this.dateAdapter,
        this.viewDate,
        this.weekStartsOn,
        this.excludeDays,
        this.daysInWeek
      )
    });
  }

  private getDragMovedEventTimes(
    weekEvent: WeekViewAllDayEvent | DayViewEvent,
    dragEndEvent: DragEndEvent | DragMoveEvent,
    dayWidth: number,
    useY: boolean
  ) {
    const daysDragged = roundToNearest(dragEndEvent.x, dayWidth) / dayWidth;
    const minutesMoved = useY
      ? getMinutesMoved(
        dragEndEvent.y,
        this.hourSegments,
        this.hourSegmentHeight,
        this.eventSnapSize
      )
      : 0;

    const start = this.dateAdapter.addMinutes(
      this.dateAdapter.addDays(weekEvent.event.start, daysDragged),
      minutesMoved
    );
    let end: Date;
    if (weekEvent.event.end) {
      end = this.dateAdapter.addMinutes(
        this.dateAdapter.addDays(weekEvent.event.end, daysDragged),
        minutesMoved
      );
    }

    return { start, end };
  }

  private restoreOriginalEvents(
    tempEvents: CalendarEvent[],
    adjustedEvents: Map<CalendarEvent, CalendarEvent>
  ) {
    this.view = this.getWeekView(tempEvents);
    const adjustedEventsArray = tempEvents.filter(event =>
      adjustedEvents.has(event)
    );
    this.view.hourColumns.forEach(column => {
      adjustedEventsArray.forEach(adjustedEvent => {
        const originalEvent = adjustedEvents.get(adjustedEvent);
        const existingColumnEvent = column.events.find(
          columnEvent => columnEvent.event === adjustedEvent
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
            endsAfterDay: false
          });
        }
      });
    });
    adjustedEvents.clear();
  }

  private getTimeEventResizedDates(
    calendarEvent: CalendarEvent,
    resizeEvent: ResizeEvent
  ) {
    const minimumEventHeight = getMinimumEventHeightInMinutes(
      this.hourSegments,
      this.hourSegmentHeight
    );
    const newEventDates = {
      start: calendarEvent.start,
      end: getDefaultEventEnd(
        this.dateAdapter,
        calendarEvent,
        minimumEventHeight
      )
    };
    const { end, ...eventWithoutEnd } = calendarEvent;
    const smallestResizes = {
      start: this.dateAdapter.addMinutes(
        newEventDates.end,
        minimumEventHeight * -1
      ),
      end: getDefaultEventEnd(
        this.dateAdapter,
        eventWithoutEnd,
        minimumEventHeight
      )
    };

    if (resizeEvent.edges.left) {
      const daysDiff = Math.round(
        +resizeEvent.edges.left / this.dayColumnWidth
      );
      const newStart = this.dateAdapter.addDays(newEventDates.start, daysDiff);
      if (newStart < smallestResizes.start) {
        newEventDates.start = newStart;
      } else {
        newEventDates.start = smallestResizes.start;
      }
    } else if (resizeEvent.edges.right) {
      const daysDiff = Math.round(
        +resizeEvent.edges.right / this.dayColumnWidth
      );
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
        this.eventSnapSize
      );
      const newStart = this.dateAdapter.addMinutes(
        newEventDates.start,
        minutesMoved
      );
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
        this.eventSnapSize
      );
      const newEnd = this.dateAdapter.addMinutes(
        newEventDates.end,
        minutesMoved
      );
      if (newEnd > smallestResizes.end) {
        newEventDates.end = newEnd;
      } else {
        newEventDates.end = smallestResizes.end;
      }
    }

    return newEventDates;
  }


  public update(event) {
    this.events = event;
    this.viewDate = new Date(this.viewDate)
    // window.location.reload();

    // this.cellChild.update(this.events)
  }
  public showPatientRecordParent($event) {
    // this.showPatientRecord.emit($event)
  }

  public getCurrentAssignments($event) {
    this.currentAssignments.emit("test")
  }

  // public triggerScrollToWeek() {
  //   const config: ScrollToConfigOptions = {
  //     target: 'drag2',
  //     duration: 650,
  //     easing: 'easeOutElastic',
  //     offset: 750
  //   };
  //   this._scrollToService.scrollTo(config);
  // }
  
 
  // public triggerScrollToDay() {
  //   let off = (8 * (this.hourSegmentHeight * this.hourSegments))
  //   const config: ScrollToConfigOptions = {
  //     target: 'drag-day-view',
  //     duration: 950,
  //     easing: 'easeOutElastic',
  //     offset: off
  //   };

  //   this._scrollToService.scrollTo(config);
  //   this.refreshAll()
  // }
}
