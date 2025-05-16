import {
  Component,
  OnChanges,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
  LOCALE_ID,
  Inject,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {
  CalendarEvent,
  WeekDay,
  MonthView,
  MonthViewDay,
  ViewPeriod
} from 'calendar-utils';
import { Subject, Subscription } from 'rxjs';
import {
  CalendarEventTimesChangedEvent,
  CalendarEventTimesChangedEventType
} from '../common/calendar-event-times-changed-event.interface';
import { CalendarUtils } from '../common/calendar-utils.provider';
import { validateEvents, trackByIndex } from '../common/util';
import { DateAdapter } from '../../date-adapters/date-adapter';
import { PlacementArray } from 'positioning';
import { CalendarMonthCellComponent } from './calendar-month-cell.component';
import { MonthSubjectService } from './subject.service';
// import { HomeComponent } from 'app/supervisor/modules/assign-speciality/components/home/home.component';

export interface CalendarMonthViewBeforeRenderEvent {
  header: WeekDay[];
  body: MonthViewDay[];
  period: ViewPeriod;
}

export interface CalendarMonthViewEventTimesChangedEvent<
  EventMetaType = any,
  DayMetaType = any
  > extends CalendarEventTimesChangedEvent<EventMetaType> {
  day: MonthViewDay<DayMetaType>;
}

/**
 * Shows all events on a given month. Example usage:
 *
 * ```typescript
 * <mwl-calendar-month-view
 *  [viewDate]="viewDate"
 *  [events]="events">
 * </mwl-calendar-month-view>
 * ```
 */
@Component({
  selector: 'mwl-calendar-month-view',
  templateUrl: './calendar-month-view.component.html',
  styleUrls: ['./calendar-month-view.scss']
})
export class CalendarMonthViewComponent
  implements OnChanges, OnInit, OnDestroy {
  @Output() startEvaluation = new EventEmitter;
  @Output() startEvualtionFlagShow = new EventEmitter(); 
  @Input() currentDoc: any;
  @Input() patientObject: any;
  @Input() patientData: any;
  @Input() allMonthEvents:any;
  @Output() currentAssignments = new EventEmitter;
  public swaps: any;
  public clinicID: string;

  @Output() updateSpecAssign = new EventEmitter;

  @Input()
  selectDate: string;

  @Input()
  clinicIndex: string;

  @Input() specAssign: any;

  @Input()
  swap: any;


  @Input()
  specId: any;

  @Input()
  specColor: any;

  @Input()
  specNames: any;


  @Input()
  clinicId: string;
  /**
   * The current view date
   */
  @Input()
  viewDate: Date;

  /**
   * An array of events to display on view.
   * The schema is available here: https://github.com/mattlewis92/calendar-utils/blob/c51689985f59a271940e30bc4e2c4e1fee3fcb5c/src/calendarUtils.ts#L49-L63
   */
  @Input()
  events: any = [];

  /**
   * An array of day indexes (0 = sunday, 1 = monday etc) that will be hidden on the view
   */
  @Input()
  excludeDays: number[] = [];

  /**
   * Whether the events list for the day of the `viewDate` option is visible or not
   */
  @Input()
  activeDayIsOpen: boolean = false;

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
   * A custom template to use to replace the day cell
   */
  @Input()
  cellTemplate: TemplateRef<any>;

  @Input() patient: any;
  /**
   * A custom template to use for the slide down box of events for the active day
   */
  @Input()
  openDayEventsTemplate: TemplateRef<any>;

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
   * An array of day indexes (0 = sunday, 1 = monday etc) that indicate which days are weekends
   */
  @Input()
  weekendDays: number[];

  /**
   * An output that will be called before the view is rendered for the current month.
   * If you add the `cssClass` property to a day in the body it will add that class to the cell element in the template
   */
  @Output()
  beforeViewRender = new EventEmitter<CalendarMonthViewBeforeRenderEvent>();

  /**
   * Called when the day cell is clicked
   */
  @Output()
  dayClicked = new EventEmitter<{
    day: MonthViewDay;
  }>();

  /**
   * Called when the event title is clicked
   */
  @Output()
  eventClicked = new EventEmitter<{
    event: CalendarEvent;
  }>();

  /**
   * Called when an event is dragged and dropped
   */
  @Output()
  eventTimesChanged = new EventEmitter<
    CalendarMonthViewEventTimesChangedEvent
  >();

  /**
   * @hidden
   */
  columnHeaders: WeekDay[];

  /**
   * @hidden
   */
  view: MonthView;

  /**
   * @hidden
   */
  openRowIndex: number;

  /**
   * @hidden
   */
  openDay: MonthViewDay;

  spec: string;
  /**
   * @hidden
   */
  refreshSubscription: Subscription;

  /**
   * @hidden
   */
  trackByIndex = trackByIndex;

  /**
   * @hidden
   */


  @Output() childEvent = new EventEmitter();

  @Output() mainCalenderCurrentDate = new EventEmitter();


  trackByDate = (index: number, day: MonthViewDay) => day.date.toISOString();





  /**
   * @hidden
   */
  constructor(
    private cdr: ChangeDetectorRef,
    private utils: CalendarUtils,
    @Inject(LOCALE_ID) locale: string,
    private dateAdapter: DateAdapter,
    public _subjectService: MonthSubjectService
  ) {
    this.locale = locale;
  }

  /**
   * @hidden
   */
  ngOnInit(): void {
    // this._subjectService.refresh(this.monthEvents)
    if (this.refresh) {
      this.refreshSubscription = this.refresh.subscribe(() => {
        this.refreshAll(this.specAssign);
        this.cdr.markForCheck();
      });
    }

  }

  /**
   * @hidden
   */
  ngOnChanges(changes: any): void {
    if (changes.viewDate || changes.excludeDays || changes.weekendDays) {
      this.refreshHeader();
    }

    if (changes.events) {
      this._subjectService.refresh(this.specAssign)
    }

    if (
      changes.viewDate ||
      changes.events ||
      changes.excludeDays ||
      changes.weekendDays ||
      changes.specAssign
    ) {
      this.refreshBody(this.specAssign);
    }

    if (
      changes.activeDayIsOpen ||
      changes.viewDate ||
      changes.specAssign ||
      changes.excludeDays
    ) {
      this.checkActiveDayIsOpen();
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
  toggleDayHighlight(event: CalendarEvent, isHighlighted: boolean): void {
    this.view.days.forEach(day => {
      if (isHighlighted && day.events.indexOf(event) > -1) {
        day.backgroundColor =
          (event.color && event.color.secondary) || '#D1E8FF';
      } else {
        delete day.backgroundColor;
      }
    });
  }


  private refreshHeader(): void {
    this.columnHeaders = this.utils.getWeekViewHeader({
      viewDate: this.viewDate,
      weekStartsOn: this.weekStartsOn,
      excluded: this.excludeDays,
      weekendDays: this.weekendDays
    });
    this.emitBeforeViewRender();
  }

  private refreshBody(assign): void {
    this.view = this.utils.getMonthView({
      events: this.specAssign,
      viewDate: this.viewDate,
      weekStartsOn: this.weekStartsOn,
      excluded: this.excludeDays,
      weekendDays: this.weekendDays
    });
    this.specAssign = assign
    this.emitBeforeViewRender();
  }

  private checkActiveDayIsOpen(): void {
    if (this.activeDayIsOpen === true) {
      this.openDay = this.view.days.find(day =>
        this.dateAdapter.isSameDay(day.date, this.viewDate)
      );
      const index: number = this.view.days.indexOf(this.openDay);
      this.openRowIndex =
        Math.floor(index / this.view.totalDaysVisibleInWeek) *
        this.view.totalDaysVisibleInWeek;
    } else {
      this.openRowIndex = null;
      this.openDay = null;
    }
  }

  private refreshAll(assign): void {
    this.columnHeaders = null;
    this.view = null;
    this.refreshHeader();
    this.refreshBody(assign);
    this.checkActiveDayIsOpen();
  }

  private emitBeforeViewRender(): void {
    if (this.columnHeaders && this.view) {
      this.beforeViewRender.emit({
        header: this.columnHeaders,
        body: this.view.days,
        period: this.view.period
      });
    }
  }
  public selectedDate(date) {
    this.mainCalenderCurrentDate.emit(date)
  }


  public removeSideEntry(id) {
    for (let i = 0; i < this.specId.length; i++) {
      if (this.specId[i].id == id) {
        this.childEvent.emit(this.specId[i]);
        this.specId.splice(i, 1)
        if (this.specId.length == 0) {
          this.specId.push({ name: '', id: 0 })
        }
        return
      }
    }


  }

  public viewCurrentAssignments(event) {
    this.currentAssignments.emit(event)
  }
  public getCurrentAssignments($event) {
    this.currentAssignments.emit("test")
  }

}
