import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
//service
import { AppointmentService } from '../../appointment.service'
//modal Pre-req
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DoctorCalendarService } from '../../../doctor-calendar/doctor-calendar.service';
import { AppointmentSubjectService } from '../../subject.service';
import { StorageData, HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { AssignSpecialityUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { AddToBeSchedulledUrlsEnum } from '@appDir/scheduler-front-desk/modules/add-to-be-scheduled/add-to-be-scheduled-list-urls-enum';
import { DoctorCalendarUrlsEnum } from '@appDir/shared/modules/doctor-calendar/doctor-calendar-urls-enum';
import { WaitingListUrlsEnum } from '@appDir/scheduler-front-desk/modules/waiting-list/waiting-list-urls-enum';
import { AppointmentUrlsEnum } from '../../appointment-urls-enum';
import { convertDateTimeForRetrieving, convertDateTimeForSending } from '@appDir/shared/utils/utils.helpers';

@Component({
  selector: 'app-add-to-waiting-list-modal',
  templateUrl: './add-to-waiting-list-modal.component.html',
  styleUrls: ['./add-to-waiting-list-modal.component.scss']
})
export class AddToWaitingListModalComponent implements OnInit {

  public clinics: any = [];
  public speciality: any = [];
  public caseId: any;
  public stDate: any = new Date();
  public edDate: any = new Date();
  public typeForAppointment: any;
  public freeSlots: any
  public waitingSlots: any;
  public waitingPriorityArray = []
  public selectedAppointmentPriorityId: any;
  public typeArray = []
  public spec: any
  public clinic: any;
  public caseTypes: any = [];
  public selectedPriorityId: any
  public titleofAppointment: any;
  public selectedDoctorId: any;
  public priorityArray = []
  public idOfPatient: any
  public clinicId: any
  public specId: any
  public doctors: any = [{
    'doctorName': 'Provider',
    'docId': 0,
  }];
  public selectedDoc: any;
  public selectedClinicId: any;
  public selectedSpecialityId: any;
  public allClinicIds: any;
  public caseTypeId: any;
  public specCheck: any = false
  constructor(
    public activeModal: NgbActiveModal,
    public AppointmentService: AppointmentService,
    public docService: DoctorCalendarService,
    public subjectService: AppointmentSubjectService,
    private toastrService: ToastrService,
    private storageData: StorageData,
    protected requestService: RequestService


  ) {
    this.spec = this.docService.updateModalData.specId
    this.clinic = this.docService.updateModalData.clinicId
    this.selectedAppointmentPriorityId = this.docService.updateModalData.priorityId
    this.typeForAppointment = this.docService.updateModalData.visitTypeid
    this.titleofAppointment = this.docService.updateModalData.appointmentTitle
    this.caseId = this.docService.updateModalData.caseId
    this.idOfPatient = this.docService.updateModalData.chartNo
    this.allClinicIds = this.storageData.getFacilityLocations()
    this.requestService
      .sendRequest(
        AssignSpecialityUrlsEnum.Facility_list_Post,
        'POST',
        REQUEST_SERVERS.schedulerApiUrl,
        { 'clinics': this.allClinicIds }
      ).subscribe(
        (res: HttpSuccessResponse) => {
          this.clinics = res.result.data;

          //this.selectedClinicId = this.clinics[0].id;
          //Setting Clinic
          this.selectedClinicId = this.clinic;


          this.requestService
            .sendRequest(
              DoctorCalendarUrlsEnum.getAllReturningCasesByPatient + JSON.stringify(this.idOfPatient),
              'GET',
              REQUEST_SERVERS.kios_api_path,
            ).subscribe(
              (res: any) => {
                this.caseTypes = res.result.data
                this.caseTypeId = this.caseTypes[0].case_type
              })
          this.requestService
            .sendRequest(
              AssignSpecialityUrlsEnum.Speciality_list,
              'POST',
              REQUEST_SERVERS.schedulerApiUrl,
            ).subscribe(
              (resp: HttpSuccessResponse) => {
                this.speciality = resp.result.data;
                if (this.clinics.length) {

                  this.selectedSpecialityId = this.speciality[0].id;
                  this.edDate = new Date();
                  this.edDate.setMilliseconds(59);
                  this.edDate.setMinutes(59);
                  this.edDate.setSeconds(59);
                  this.edDate.setHours(23);
                  this.stDate = convertDateTimeForRetrieving(this.storageData, new Date());
                  this.getDocAssign();
                  this.selectedDoctorId = this.doctors[0].docId;
                  this.getFreeSlots();
                }

              });

        });
    this.requestService
      .sendRequest(
        DoctorCalendarUrlsEnum.getAppointmentPriority,
        'GET',
        REQUEST_SERVERS.schedulerApiUrl
      ).subscribe(
        (resp: HttpSuccessResponse) => {
          this.priorityArray = resp.result.data
        })

    this.requestService
      .sendRequest(
        AddToBeSchedulledUrlsEnum.getAppointmentTypes,
        'GET',
        REQUEST_SERVERS.schedulerApiUrl1,
      ).subscribe(
        (response: HttpSuccessResponse) => {
          this.typeArray = response.result.data
        })

    this.requestService
      .sendRequest(
        WaitingListUrlsEnum.getWaitingListPriority,
        'GET',
        REQUEST_SERVERS.schedulerApiUrl,
      ).subscribe(
        (res: HttpSuccessResponse) => {
          this.waitingPriorityArray = res.result.data
          this.selectedPriorityId = this.waitingPriorityArray[0].id
        })

  }
  ngOnInit() { }

  public changeAppointmentPriority(event) {
    for (let i = 0; i < this.priorityArray.length; i++) {
      if (this.priorityArray[i].id === event.target.value) {
        this.selectedAppointmentPriorityId = this.priorityArray[i].id;
        break;
      }
    }
  }
  public changeAppointmentType(event) {
    for (let i = 0; i < this.typeArray.length; i++) {
      if (this.typeArray[i].id === event.target.value) {
        this.typeForAppointment = this.typeArray[i].id;
        break;
      }
    }
  }
  public changeAppointmentPriorityWaitingList(event) {
    for (let i = 0; i < this.waitingPriorityArray.length; i++) {
      if (this.waitingPriorityArray[i].id === event.target.value) {
        this.selectedPriorityId = this.waitingPriorityArray[i].id;
        break;
      }
    }
  }
  public clinicChange(event) {
    this.getDocAssign();
    this.getFreeSlots();
  }
  public specialityChange(event) {
    this.specCheck = true
    this.getDocAssign()
    this.getFreeSlots()

  }
  public doctorChange(event) {
    this.getFreeSlots()
  }
  public addToWaitingList() {
    let appointmentId = this.docService.updateModalData.appointmentId
    if (this.titleofAppointment === null || this.titleofAppointment == '' || this.titleofAppointment === undefined) {
      this.titleofAppointment = 'N/A'
    }
    let reqObj = {
      'specId': this.spec,
      'clinicId': this.clinic,
      'caseType': this.caseTypeId,
      'priorityId': this.selectedPriorityId,
      'chartNo': this.idOfPatient,
      'currentDateTime': convertDateTimeForSending(this.storageData, new Date()),
      'appointmentPriorityId': this.selectedAppointmentPriorityId,
      'appointmentTypeId': this.typeForAppointment,
      'appointmentTitle': this.titleofAppointment,
      'caseId': parseInt(this.caseId),
      'id': appointmentId
    }
    if (parseInt(this.selectedDoctorId) !== 0) {
      reqObj['docId'] = parseInt(this.selectedDoctorId)
    }
    this.requestService
      .sendRequest(
        AppointmentUrlsEnum.addToWaitingList,
        'POST',
        REQUEST_SERVERS.schedulerApiUrl,
        reqObj
      ).subscribe(
        (res: HttpSuccessResponse) => {
          if (res.result.data[0].appointmentId) {
            this.toastrService.success('Successfully Added', 'Success')
            this.activeModal.close()
            this.subjectService.refreshWaitingList('true')
          }
        });
  }
  public getDocAssign() {
    this.requestService
      .sendRequest(
        AppointmentUrlsEnum.getDoctorAssigned,
        'POST',
        REQUEST_SERVERS.schedulerApiUrl,
        {
          'clinicId': this.clinic,
          'specId': this.spec,
          'start': convertDateTimeForSending(this.storageData, this.stDate),
          'end': convertDateTimeForSending(this.storageData, this.edDate)
        }
      ).subscribe(
        (response: HttpSuccessResponse) => {
          response.result.data.unshift(this.doctors[0]);
          this.doctors = response.result.data;
        }, err => {
          this.doctors = [{
            'doctorName': 'Provider',
            'docId': 0
          }
          ];
        });
  }
  public getFreeSlots() {
    this.selectedDoctorId = parseInt(this.selectedDoctorId)
    let reqObj = {
      'specId': this.spec,
      'clinicId': this.clinic,
      'currentDateTime': convertDateTimeForSending(this.storageData, new Date()),
      'endDate': convertDateTimeForSending(this.storageData, this.edDate)
    };
    if (this.selectedDoctorId !== 0) {
      reqObj['docId'] = this.selectedDoctorId;
    }
    this.requestService
      .sendRequest(
        AppointmentUrlsEnum.getFreeSlotsAndEntriesCount,
        'POST',
        REQUEST_SERVERS.schedulerApiUrl,
        reqObj
      ).subscribe(
        (respp: HttpSuccessResponse) => {
          this.freeSlots = respp.result.data[0].freeSlots;
          this.waitingSlots = respp.result.data[0].waitingListEntries;
        });
  }
}
