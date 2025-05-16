import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import {
  CalendarEvent,
} from 'angular-calendar';

import {
  isSameDay,
  isSameMonth
} from 'date-fns';
import { MDService } from '../services/md/medical-doctor.service';
import { Appointment, MedicalSession, Evaluation, HeadInjury, Complaints2, PastMedicalHistory } from '../models/common/commonModels';
import { DUMMYDATA } from '../models/dummy_data/dummyData';
import { MainService } from '@shared/services/main-service';
import { RequestService } from '@appDir/shared/services/request.service';
import { MDSessionEnum } from '../MDSession.enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { StorageData, HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
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
  selector: 'app-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.scss']
})
export class SchedulerComponent implements OnInit {
  @ViewChild("content") contentModal: any;
  selectedAppointment: Appointment;
  activeDayIsOpen: boolean = true;
  closeResult: string;
  modalRef: NgbModalRef;
  maxOfflineAppointments: Number = 4;
  offlineAppointments: Object[] = [];
  // appointments:Object[];

  constructor(
    private modalService: NgbModal,
    private router: Router,
    private MDService: MDService,
    private mainService: MainService,
    private storageData: StorageData,
    protected requestService: RequestService

  ) {
    this.mainService.resetPanelData();
  }

  dayClicked = ({ date, appointments }: { date: Date; appointments: CalendarEvent[] }): void => {
    if (isSameMonth(date, this.viewDate)) {
      this.viewDate = date;
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        appointments.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
    }
  }
  getSeedInfo() {

    this.requestService.sendRequest(MDSessionEnum.Seeded_Info_GET,
      'GET', REQUEST_SERVERS.medical_doctor_api_url,
      removeEmptyAndNullsFormObject({ user_id: this.storageData.getUserId() }))
      .subscribe((responce: HttpSuccessResponse) => {
        this.MDService.setOfflineData(responce.result.data);
      }
      );
  }
  ngOnInit() {
    this.getAppointments();
    this.getSeedInfo();
  }
  public currentdate: Date = new Date();
  public model: any = {
    date:


      { year: this.currentdate.getFullYear(), month: this.currentdate.getMonth(), day: this.currentdate.getDate() }
  };
  view: string = 'day';

  newEvent: CalendarEvent;

  viewDate: Date = new Date();


  handleEvent = (content, event: Appointment): void => {
    console.log(event);
    this.selectedAppointment = event;
    let ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false, size: 'lg', windowClass: 'modal_extraDOc'
    };
    this.modalRef = this.modalService.open(content, ngbModalOptions);
  }

  getAppointments = () => {
    for (let index in DUMMYDATA) {
      if (DUMMYDATA[index].status != "Complete") {
        this.offlineAppointments.push(DUMMYDATA[index]);
      }
    }
    this.MDService.setOfflineSchedules(this.offlineAppointments);
    this.offlineAppointments = [...this.offlineAppointments];
  }
  startEvaluation = () => {
    this.modalRef.dismiss();
    // console.log(this.selectedAppointment);
    this.selectedAppointment.session = new MedicalSession({
      id: "",
      evaluation: new Evaluation({}),
      currentComplaints: [],
      headInjury: new HeadInjury({}),
      currentComplaints2: new Complaints2({}),
      pastMedicalHistory: new PastMedicalHistory({})
    });
    this.MDService.setCurrentSession(this.selectedAppointment);
    // this.mainService.setEvaluationLink();
    // this.router.navigate([`medical-doctor/evaluation`]);

  }
  eventTimesChanged = (event, content) => {
  }


}
