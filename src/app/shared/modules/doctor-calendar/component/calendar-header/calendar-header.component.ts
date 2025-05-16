import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { HomeComponent } from '../home/home.component';
import { CreateNotesComponent } from '../../modals/create-notes/create-notes.component';
import { DoctorCalendarService } from '../../doctor-calendar.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UnavialabilityComponent } from '../../modals/unavialability/unavialability.component';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { Router } from '@angular/router';
import { SchedulerSupervisorService } from '@appDir/scheduler-front-desk/scheduler-supervisor.service';

@Component({
  selector: 'app-view-calendar-header',
  templateUrl: 'calendar-header.component.html',
  styleUrls: ['calendar-header.component.scss']
})
export class CalendarHeaderComponent extends PermissionComponent {
  hourSegmentsList = [10, 15, 20, 30, 60];
  @Input() hourSegments: any;
  /**
   * The current view Month/Week/Day
   */
  @Input() view: string;

  /**
   * The current date
   */
  @Input() viewDate: Date;

  /**
   * Call the function for the next view date
   */
  @Output() changeDatePickerMonthNext: EventEmitter<any> = new EventEmitter();

  /**
   * Call the function for the previous view date
   */
  @Output() changeDatePickerMonthPrev: EventEmitter<any> = new EventEmitter();

  /**
   * used for the display of date 
   */
  @Input() locale: string = 'en';

  /**
   * The view change funtion (Month/Week/Day)
   */
  @Output() viewChange: EventEmitter<string> = new EventEmitter();

  /**
 * The view change funtion (Month/Week/Day)
 */
  @Output() hourChange: EventEmitter<string> = new EventEmitter();

  /**
   * Change date on next or previous 
   */
  @Output() viewDateChange: EventEmitter<Date> = new EventEmitter();

  /**
   * Store the current user Id
   */
  private localStorageId: string;

  /**
   * Boolean to check for the permission access of note
   */
  public noteButton: boolean = false;

  /**
   * Boolean to check for the permission access of unavailability
   */
  public unavailabilityButton: boolean = false;

  //Month Button not shown in case of Scheduling Patient Calendar
  public isProvCalendarChosen: boolean = true;
  //

  //

  constructor(aclService: AclService,
    router: Router,
    public _service: HomeComponent,
    public doctorCalendarService: DoctorCalendarService,
    public appointmentModal: NgbModal,
    private storageData: StorageData,
    public supervisorService: SchedulerSupervisorService,
  ) {
    super(aclService, router);
    this.localStorageId = JSON.stringify(this.storageData.getUserId())

    if(this.doctorCalendarService.PatientSchedulingCalendar == true){
      this.isProvCalendarChosen = false;
    }

  }

  ngOnInit(): void {
    if (this.aclService.hasPermission(this.userPermissions.note_add)
      || this.storageData.isSuperAdmin()) {
      this.noteButton = true;
    }
    if (this.aclService.hasPermission(this.userPermissions.unavailability_add)
      || this.storageData.isSuperAdmin()) {
      this.unavailabilityButton = true;
    }


    this.viewChangeFun(this.view); ////
   
  }

  public sendDataNext(date) {
    this.changeDatePickerMonthNext.emit(date);
  }

  public sendDataPrev(date) {
    this.changeDatePickerMonthPrev.emit(date);
  }

  public viewChangeFun(text) {
    this.viewChange.emit(text);
  }

  /**
   * hourChangeFun
   */
  public hourChangeFun(value) {
    this.hourChange.emit(value.target.value);
  }
  /**
   * Open the Note modal
   */
  public addNote(date: any) {
    if (this.supervisorService.popover) {
      this.supervisorService.popover.isOpen() ? this.supervisorService.popover.close() : this.supervisorService.popover;
    }
    this.doctorCalendarService.notesStartDate = new Date(date);
    const activeModal = this.appointmentModal.open(CreateNotesComponent, { size: 'lg', backdrop: 'static',
    keyboard: false });
  }

  /**
   * Open the unavailability modal
   */
  public addUnavailability(viewDate: Date) {
    if (this.supervisorService.popover) {
      this.supervisorService.popover.isOpen() ? this.supervisorService.popover.close() : this.supervisorService.popover;
    }
    const activeModal = this.appointmentModal.open(UnavialabilityComponent, { size: 'lg' , backdrop: 'static',
    keyboard: false});
  }
}
