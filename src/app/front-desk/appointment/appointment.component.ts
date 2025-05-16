import { Component, OnInit, Input, ViewChild, TemplateRef, ChangeDetectionStrategy, LOCALE_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { NgbModalRef, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
import { ToastrService } from 'ngx-toastr';
import { CalendarDateFormatter, CalendarViewPeriod, CalendarView, CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent } from 'angular-calendar';
// import { SchedulerDateFormatter, CalendarSchedulerEventAction, CalendarSchedulerEvent, SchedulerViewDay, SchedulerViewHour, SchedulerViewHourSegment, subPeriod, endOfPeriod, startOfPeriod, addPeriod, SchedulerEventTimesChangedEvent } from 'angular-calendar-scheduler';
import { Subject } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';


import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours
} from 'date-fns';

import { FDServices } from '../fd_shared/services/fd-services.service';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { Speciality } from './models/Speciality';

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF'
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  }
};


@Component({
  selector: 'app-appointment',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './appointment.component.html',
})
export class AppointmentComponent implements OnInit {

  @ViewChild("content") contentModal: any;
  modalRef: NgbModalRef;

  form: FormGroup
  assignmentForm: FormGroup
  specialities: Speciality[] = []
  doctorsData = []


  //Calender
  @ViewChild('modalContent')
  modalContent: TemplateRef<any>;

  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fa fa-fw fa-pencil"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      }
    },
    {
      label: '<i class="fa fa-fw fa-times"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.appointments = this.appointments.filter(iEvent => iEvent !== event);
        this.handleEvent('Deleted', event);
      }
    }
  ];

  refresh: Subject<any> = new Subject();
  appointments: CalendarEvent[] = [];
  activeDayIsOpen: boolean = true;
  appointmentTypes: [] = []
  appointmentPriorities = []
  facilities = []
  docsAssigned = []
  rooms = []
  caseId: number;
  loading: boolean = false
  appointmentError: boolean = false
  minDate: string
  maxDate: string

  constructor(private modal: NgbModal, private cd: ChangeDetectorRef, private localStorage: LocalStorage, private fd_servies: FDServices, private modalService: NgbModal, private route: ActivatedRoute, private fb: FormBuilder, private logger: Logger, private toastrService: ToastrService) {

    this.caseId = +this.localStorage.get('caseId')

    this.assignmentForm = this.fb.group({
      specId: ['', [Validators.required]],
      docId: ['', [Validators.required]],
      clinicId: ['', [Validators.required]],
      start: ['', [Validators.required]],
      end: ['', [Validators.required]],
    });

    this.form = this.fb.group({
      id: null,
      specId: [0, [Validators.required]],
      // history: [''],
      // patientType: '',
      docId: [0, [Validators.required]],
      clinicId: 0,
      roomId: 0,
      priorityId: [0, [Validators.required]],
      chartNo: '',
      appointmentTypeId: [0, [Validators.required]],
      appointmentTitle: '',
      comments: [''],
      confirmationStatus: true,
      appointments: this.fb.array([]),
      caseId: this.caseId
    })
  }

  ngOnInit() {
    this.getSpecialities()
    this.getAppointmentPriorities()
    this.getAppointmentTypes()
    this.getFacilities()
    // this.getDoctors()
  }

  onSubmitAssignments(form) {
    this.logger.log(form)

    if (!this.assignmentForm.invalid) {
      this.loading = true
      this.logger.log('form is valid')
      let param = {
        clinicId: +form.clinicId,
        specId: +form.specId,
        start: form.start,
        end: form.end
      }
      this.fd_servies.getDoctorAssigned(param).subscribe(res => {
        this.loading = false
        this.docsAssigned = res
        this.cd.detectChanges()
        if (res.statusCode == 405) {
          this.toastrService.success(res.message, 'Success')
        }
        this.logger.log(res)
      }, err => {
        this.toastrService.error(err.message, 'Error')
      })
    } else {
      this.loading = false
      this.logger.log('form is invalid')
      this.fd_servies.touchAllFields(this.assignmentForm)
      this.cd.detectChanges()
    }
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      this.viewDate = date;
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
    }
  }

  onSubmit(form) {
    this.logger.log('form', form)
    if (this.appointments.length > 0) {
      let params = []
      this.appointments.forEach((elem, i) => {
        let appointment = {
          appointment: {
            startDateTime: elem.start,
            specId: +form.specId,
            // history: form.history,
            // patientType: form.patientType,
            docId: +form.docId,
            clinicId: +form.clinicId,
            roomId: +form.roomId,
            priorityId: +form.priorityId,
            chartNo: this.caseId,
            appointmentTypeId: +form.appointmentTypeId,
            appointmentTitle: elem.title,
            comments: form.comments,
            confirmationStatus: true,
            caseId: this.caseId
          }
        }

        params.push(appointment)

        if (i == this.appointments.length - 1) {
          this.logger.log(params)
          this.fd_servies.addAppointment(params).subscribe(res => {
            this.logger.log(res)
            if (res.statusCode == 200) {
              this.toastrService.success(res.message, 'Success');
            } else {
              this.toastrService.error(res.message, 'Error')
            }
          }, err => {
            this.logger.log(err)
            this.toastrService.error(err.message, 'Error')
          })
        }
      })
    } else {
      this.appointmentError = true
    }
  }


  getSpecialities() {
    this.fd_servies.getSpecialities().subscribe(res => {
      this.specialities = res.data
      this.cd.detectChanges()
    }, err => {
      this.toastrService.error(err.error.error.message, 'Error')
    })
  }

  getDoctors(docId: number) {
    this.logger.log(docId)
    this.fd_servies.getDoctors(docId).subscribe(res => {
      this.doctorsData = res.data
      this.cd.detectChanges()
    }, err => {
      this.toastrService.error(err.message, 'Error')
    })
  }

  getAppointmentTypes() {
    this.fd_servies.getAppointmentTypes().subscribe(res => {
      this.appointmentTypes = res.data
      this.cd.detectChanges()
    }, err => {
      this.toastrService.error(err.error.error.message, 'Error')
    })
  }

  //get_facility
  getFacilities() {
    this.fd_servies.getFacilities().subscribe(res => {
      this.facilities = res.data
      this.cd.detectChanges()
    }, err => {
      this.toastrService.error(err.error.error.message, 'Error')
    })
  }

  getAppointmentPriorities() {
    this.fd_servies.getAppointmentPriorities().subscribe(res => {
      this.appointmentPriorities = res.data
      this.cd.detectChanges()
    }, err => {
      this.toastrService.error(err.error.error.message, 'Error')
    })
  }

  getRooms(facilityId: number) {
    let rooms = []
    this.fd_servies.getRooms().subscribe(res => {
      res.data.forEach(room => {
        if (room.facilityId == facilityId) {
          this.rooms.push(room)
        }
      });
      // this.rooms = res.data
      this.cd.detectChanges()
    }, err => {
      this.toastrService.error(err.error.error.message, 'Error')
    })
  }

  //getRooms

  eventTimesChanged({
    event,
    newStart,
    newEnd
  }: CalendarEventTimesChangedEvent): void {
    event.start = newStart;
    event.end = newEnd;
    this.handleEvent('Dropped or resized', event);
    this.refresh.next(1);
  }

  handleEvent(action: string, event: CalendarEvent): void {
    this.modalData = { event, action };
    this.modal.open(this.modalContent, { size: 'lg' });
  }

  addEvent(): void {
    this.appointmentError = false
    let appointment = <FormArray>this.form.get('appointments')
    let appointmentLength = this.appointments.length + 1
    let data = {
      title: 'Appointment ' + appointmentLength,
      start: startOfDay(new Date()),
      end: endOfDay(new Date()),
      color: colors.red.primary,
      draggable: false,
      resizable: {
        beforeStart: true,
        afterEnd: true
      }
    }

    appointment.push(this.fb.group(data))
    this.appointments.push(data)

    this.form.updateValueAndValidity()
    this.refresh.next(1);
  }

  deleteAppointment(index) {
    let appointment = <FormArray>this.form.get('appointments')
    appointment.removeAt(index)
    this.appointments.splice(index, 1)
  }

  updateAppointment(ev, i) {
    this.logger.log(ev)
    let appointments = <FormArray>this.form.get('appointments')
    this.appointments[i] = appointments.at(i).value
    this.refresh.next(1);
  }


  openAppointmentForm(content, row) {
    this.logger.log(row)
    let ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false, size: 'lg', windowClass: 'modal_extraDOc'
    };

    this.getRooms(row.facilityId);

    this.logger.log('docId', this.assignmentForm.get('docId'))
    this.form.patchValue({
      docId: row.docId,
      specId: +this.assignmentForm.get('specId').value,
      clinicId: +this.assignmentForm.get('clinicId').value
    })
    this.minDate = row.startDate
    this.maxDate = row.endDate

    this.modalRef = this.modalService.open(content, ngbModalOptions);
  }
}
