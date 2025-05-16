import {
  Component,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
  OnDestroy,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ApplicationRef,
  OnInit
} from '@angular/core';
import { MonthViewDay, CalendarEvent } from 'calendar-utils';
import { PlacementArray } from 'positioning';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { AddRoomAssigModalComponent } from '../../../../../modals/add-room-assig-modal/add-room-assig-modal.component'


//modal
import { DeleteRoomAssignModalComponent1 } from '../../../../../modals/delete-room-assign-modal/delete-room-assign-modal.component'
import { SubjectService } from '../../../../../subject.service';
//service
import { AssignRoomsService } from '../../../../../assign-rooms.service';
import { CalendarMonthService } from "./calendar-month.service";
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { Router } from '@angular/router';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { SchedulerSupervisorService } from '@appDir/scheduler-front-desk/scheduler-supervisor.service';

@Component({
  selector: 'mwl-calendar-month-cell',
  templateUrl: 'calendar-month-cell.component.html',
  styleUrls: ['./calendar-month-view.scss'],
  host: {
    class: 'cal-cell cal-day-cell',
    '[class.cal-past]': 'day.isPast',
    '[class.cal-today]': 'day.isToday',
    '[class.cal-future]': 'day.isFuture',
    '[class.cal-weekend]': 'day.isWeekend',
    '[class.cal-in-month]': 'day.inMonth',
    '[class.cal-out-month]': '!day.inMonth',
    '[class.cal-has-events]': 'day.events.length > 0',
    '[class.cal-open]': 'day === openDay',
    '[class.cal-event-highlight]': '!!day.backgroundColor',
    '[style.backgroundColor]': 'day.backgroundColor'
  }
})
export class CalendarMonthCellComponent extends PermissionComponent {
  // trackByEventId = trackByEventId;
  @Output() currentAssignments = new EventEmitter;


  @Input() monthEvents: any = [];

  public allEvents: any = [];

  public temp: string;
  private localStorageId: any;
  private roomDelete: boolean = false;
  private roomAdd: boolean = false;
  disable: boolean = false;
  trackByAssignmentId(index) {
    return index; // or item.id
  }
  @Input() data: any;

  @Input()
  viewDate: Date;

  @Input()
  swaps: any;

  @Input()
  index: any;

  @Input()
  docName: any;
  @Input()
  day: MonthViewDay;

  @Input()
  openDay: MonthViewDay;

  @Input()
  locale: string;

  @Input()
  tooltipPlacement: PlacementArray;

  @Input()
  tooltipAppendToBody: boolean;

  @Input()
  customTemplate: TemplateRef<any>;

  @Input()
  tooltipTemplate: TemplateRef<any>;

  @Output()
  highlightDay: EventEmitter<any> = new EventEmitter();

  @Output()
  unhighlightDay: EventEmitter<any> = new EventEmitter();

  @Output()
  eventClicked: EventEmitter<{ event: CalendarEvent }> = new EventEmitter<{
    event: CalendarEvent;
  }>();

  @Output() updateSpecAssign = new EventEmitter;

  currentUrl;
  speciality: boolean;

  public extraTempDate: any;

  @Input() clinicDays: any;

  constructor(aclService: AclService,
    router: Router,
    public appointmentModal: NgbModal,
    public subject: SubjectService,
    public monthService: CalendarMonthService,
    public AssignRoomsService: AssignRoomsService,
    private storageData: StorageData,
    private changeDetector: ChangeDetectorRef,
    public applicationRef: ApplicationRef,
    public addAssignmentService: NgbModal,
    public schedulerSupervisorService: SchedulerSupervisorService) {
    super(aclService, router);

    this.localStorageId = JSON.stringify(this.storageData.getUserId())

  }
  public eventCount = 0;
  public eventOne: any;
  public eventTwo: any;
  ngOnInit() {
    this.CurrDateApp = [];

    if (this.aclService.hasPermission(this.userPermissions.room_delete)
      || this.storageData.isSuperAdmin()) {
      this.roomDelete = true
    }
    if (this.aclService.hasPermission(this.userPermissions.room_add)
      || this.storageData.isSuperAdmin()) {
      this.roomAdd = true
    }
    this.extraTempDate = this.day.date
  }
  ngOnChanges(change) {
    if (change.monthEvents && change.monthEvents.currentValue) {
      this.disableCheckspecId()
      if (this.swaps === 'true') {
        this.monthEvents = change.monthEvents.currentValue[this.index];
        this.returnItem(this.day.date)
        this.changeDetector.markForCheck();
      }
      if (this.swaps === 'false') {
        this.monthEvents = change.monthEvents.currentValue[this.index];
        this.returnItem(this.day.date)
        this.changeDetector.markForCheck()

      }
    }
  }

  disableCheckspecId() {
    this.disable = false;
    for (let i = 0; i < this.clinicDays.length; i++) {
      this.disable = true;
      if (this.clinicDays[i] === this.day.date.getDay()) {
        this.disable = false;
        break;
      }
    }
    if (this.swaps === 'true' && !this.disable) {
      if (this.data) {
        this.disable = true;
        for (let i = 0; i < this.data.specialities.user_timings.length; i++) {
          if (this.data.specialities.user_timings[i].day_id === this.day.date.getDay()) {
            this.disable = false;
            break;
          }
        }
      }
    }
    return this.disable
  }

  CurrDateApp;
  returnItem(date) {
    this.CurrDateApp = [];
    this.eventCount = 0;

    if (this.monthEvents != undefined) {
      for (let event of this.monthEvents) {
        if (date.toString().substring(0, 15) == new Date(event.startDate).toString().substring(0, 15)) {
          if (date.toString().substring(0, 3) == "Sat" || date.toString().substring(0, 3) == "Fri") {
            event["placement"] = "left"
          }
          else {
            event["placement"] = "right"
          }
          if (this.eventCount == 0) {
            this.eventOne = event
          } else if (this.eventCount == 1) {
            this.eventTwo = event
          }
          this.eventCount = this.eventCount + 1;
          this.CurrDateApp.push(event);
        }
      }
    }

    this.allEvents = this.CurrDateApp;
    return this.CurrDateApp;
  }
  updateAssignmentModal(event) {

  }
  EventClicked(e) {
    if (this.schedulerSupervisorService.popover) {
      this.schedulerSupervisorService.popover.isOpen() ? this.schedulerSupervisorService.popover.close() : this.schedulerSupervisorService.popover;
    }
    this.AssignRoomsService.requirementForDeleteModal = e
    const activeModal = this.appointmentModal.open(DeleteRoomAssignModalComponent1, {
      size: 'lg', backdrop: 'static',
      keyboard: false
    });
  }
  public addRoomAssignment(date) {
    if (this.schedulerSupervisorService.popover) {
      this.schedulerSupervisorService.popover.isOpen() ? this.schedulerSupervisorService.popover.close() : this.schedulerSupervisorService.popover;
    }
    if (this.roomAdd) {
      let DateCurr = new Date(date)
      this.AssignRoomsService.currentStartDate = DateCurr;
      this.AssignRoomsService.currentEndDate = DateCurr;
      this.AssignRoomsService.isSwap = this.swaps;
      this.AssignRoomsService.selectedData = this.data;
      const activeModal = this.appointmentModal.open(AddRoomAssigModalComponent, {
        size: 'lg', backdrop: 'static',
        keyboard: false
      });
    }
  }
  openPop(p: NgbPopover): void {
    if (this.schedulerSupervisorService.popover) {
      this.schedulerSupervisorService.popover.isOpen() ? this.schedulerSupervisorService.popover.close() : this.schedulerSupervisorService.popover;
    }
    this.schedulerSupervisorService.popover = p;
  }
}
