import { FacilityUrlsEnum } from './../../../../../../front-desk/masters/practice/practice/utils/facility-urls-enum';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

// Modal
import { AppointmentSubjectService } from '../../../subject.service'
import { VisitHistoryComponent } from '../../modals/visit-history/visit-history.component';
// service
import { SchedulingQueueService } from '../../scheduling-queue.service';
import { ActivatedRoute } from '@angular/router';
import { DoctorCalendarService } from '@shared/modules/doctor-calendar/doctor-calendar.service';
//
import { ToastrService } from 'ngx-toastr';
import { StorageData, HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { AddToBeSchedulledUrlsEnum } from '@appDir/scheduler-front-desk/modules/add-to-be-scheduled/add-to-be-scheduled-list-urls-enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { AssignSpecialityUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
import { AppointmentUrlsEnum } from '../../../appointment-urls-enum';
import { DoctorCalendarUrlsEnum } from '@appDir/shared/modules/doctor-calendar/doctor-calendar-urls-enum';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { convertDateTimeForSending } from '@appDir/shared/utils/utils.helpers';

@Component({
  selector: 'app-scheduler-front-desk-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent extends PermissionComponent implements OnInit {
  myForm: FormGroup;
  public enableBest = true;
  public enableManual = false;  
  public disableBest = false;
  public disableManual = true;
  public selectedClinicId: any;
  public selectedSepcId: any;
  public selectedDoctorId: any;
  public historyData: any = [];
  public specId: any = [];
  public interval: number = 30;
  public isStart: boolean = false;
  public isFindBestClicked: boolean = true;
  public isManualClicked: boolean = true;
  public isAddToOpenClicked: boolean = true;
  public chartNo: any
  public selectedClinic: any = []
  public selectedDoc: any = []
  public appointmentTitle: any = '';
  public selectedPrioirtyName: string;
  public date: Date;
  public clinics: any = [{
    'name': 'Location',
    'id': 0,
  }];
  public speciality: any = [{
    'name': 'Specialty',
    'id': 0,
  }];
  public caseId: any;
  public doctors: any = [{
    'doctorName': 'Provider',
    'docId': 0,
  }];
  public waitingSlots: any = 0;
  public freeSlots: any = 0;
  public appointmentPirorityId: any;
  public viewVisitHistoryButton: boolean = false;
  private stDate: Date;
  private edDate: Date;
  public allClinicIds = []
  public priorityForAppointmentArray = [{
    "createdAt": "NULL",
    "createdBy": 0,
    "description": "Piority",
    id: 0,
    "modifiedAt": null,
    "modifiedBy": 0,
  }];
  private typeForAppointment: any;
  private selectedPriorityId: any;
  public AppointmentPriority: any;
  public AppointmentType: any;
  public selectedAppointmentPriorityId: any;
  public patientId: any;
  public caseType: any;
  public case_type_id
  public history: any = []
  public data: any;
  ngOnInit() {
    const lastClicked = localStorage.getItem('lastClicked');
    this.isAddToOpenClicked = true
    this.selectedDoctorId = this.doctors[0].docId
    this.route.snapshot.pathFromRoot.forEach(path => {
      if (path && path.params && path.params.caseId) {
        if (!this.caseId) {
          this.caseId = parseInt(path.params.caseId);
          this.requestService
            .sendRequest(
              DoctorCalendarUrlsEnum.caseDetail + JSON.stringify(this.caseId) + '&route=schduler_app',
              'GET',
              REQUEST_SERVERS.kios_api_path
            ).subscribe(
              (res: any) => {
				  debugger;
                this.data = res.result.data;
                this.DoctorCalendarService.chartNo = this.data.patient_id;

                let dataManual = {
                  "name": this.data.patient.last_name,
                  "patientLastName": this.data.patient.last_name,
                  "patientFirstName": this.data.patient.first_name,
                  "patientMiddleName": this.data.patient.middle_name,

                  "chartNo": this.data.patient_id,
                  "patientId": this.data.patient_id,
                  "id": this.data.patient_id,

                  "caseId": this.caseId,
				  "caseType": this.data.case_type.name,
				  "case_type_id":this.data.case_type.id
                }
                
                const scheduler = this.storageData.getSchedulerInfo();

                scheduler['patientData'] = JSON.stringify(dataManual);

                // let tempChart = JSON.parse(scheduler.patientData);
                // console.log("SSSS",scheduler.patientData)
                // tempChart['chartNo'] =  this.data.patient_id;
                // scheduler.patientData = JSON.stringify(tempChart);
                this.storageData.setSchedulerInfo(scheduler);
                this.patientId = this.data.patient_id;
				this.caseType = this.data.case_type.name;
				this.case_type_id=this.data.case_type.id
                this.appointmentPirorityId = this.data.case_type.id;
                this.requestService
                  .sendRequest(
                    DoctorCalendarUrlsEnum.getAppointmentPriority,
                    'GET',
                    REQUEST_SERVERS.schedulerApiUrl1
                  ).subscribe(
                    (resp: HttpSuccessResponse) => {
                      this.AppointmentPriority = resp.result.data;
                      this.myForm.controls['appointmentPirority'].setValue(this.AppointmentPriority[0].id)
                      this.selectedAppointmentPriorityId = this.AppointmentPriority[0].id;
                      this.selectedPrioirtyName = this.AppointmentPriority[0].slug;
                    })
                this.allClinicIds = this.storageData.getFacilityLocations()
                this.requestService
                  .sendRequest(
					FacilityUrlsEnum.Facility_list_dropdown_GET   , 
					 'GET',
					REQUEST_SERVERS.fd_api_url,
                    // {
                    //   "clinics": this.allClinicIds
                    // }
                  ).subscribe(
                    (ress: HttpSuccessResponse) => {
                      for (var i = 0, j = 1; i < ress.result.data.length; i++, j++) {
                        this.clinics[j] = ress.result.data[i];
                      }
                      this.selectedClinicId = this.clinics[0].id
                      this.myForm.controls['clinicName'].setValue(this.clinics[0].id)
                      this.requestService
                        .sendRequest(
							AssignSpecialityUrlsEnum.GetUserInfoBySpecialities,
							'post',
							REQUEST_SERVERS.schedulerApiUrl1,
                        ).subscribe(
                          (respSpec: HttpSuccessResponse) => {
                            let resp = respSpec.result.data.docs;
                            for (var i = 0, j = 1; i < resp.length; i++, j++) {
                              this.speciality[j] = resp[i];
                              this.specId[i] = resp[i].id
                            }
                            this.selectedSepcId = this.speciality[0].id;
                //             this.requestService
                //               .sendRequest(
                //                 AppointmentUrlsEnum.getAppointmentListByCase,
                //                 'POST',
                //                 REQUEST_SERVERS.schedulerApiUrl1,
                //                 {
                //                   "case_id": this.caseId,
                //                   "speciality_id": this.specId
								// }
                //               ).subscribe(
                //                 (resssp: HttpSuccessResponse) => {
                //                   this.historyData = resssp.result.data;
                //                   for (var i = 0; i < this.historyData.length; i++) {
                //                     let leftappointmnt = parseInt(this.historyData[i]["overAllAppointments"]) - parseInt(this.historyData[i]["doneAppointments"])
                //                     this.historyData[i]['leftAppointment'] = leftappointmnt
                //                   }
                //                 }, err => {
                //                   this.historyData = []
                //                 })

                            if (this.clinics.length) {
                              this.edDate = new Date();
                              this.edDate.setMilliseconds(59);
                              this.edDate.setMinutes(59);
                              this.edDate.setSeconds(59);

                              this.edDate.setHours(23);
                              this.stDate = new Date();
                            }
                            if (lastClicked === 'manual') {
                              this.manualCalendar();
                            } else {
                              this.findBest();
                            }
							this.startLoader=false;
							
                            //
                          });
                    });
              })
        }
      }
    })
    this.AppointmentPriority = [{}];
	
  }
  constructor(private route: ActivatedRoute, private toastrService: ToastrService,
    public DoctorCalendarService: DoctorCalendarService,
    protected requestService: RequestService,
    private storageData: StorageData,
    public formBuilder: FormBuilder,
    aclService: AclService, public visitHistoryModal: NgbModal, public schedulingQueueService: SchedulingQueueService,
     public appointmentSubjectService: AppointmentSubjectService) {
    super(aclService);
	this.startLoader=true;
    this.schedulingQueueService.appointmentTitle = ""
    // this.requestService
    //   .sendRequest(
        // WaitingListUrlsEnum.getWaitingListPriority,
    //     'GET',
    //     REQUEST_SERVERS.schedulerApiUrl,
    //   ).subscribe(
    //     (res: HttpSuccessResponse) => {
    //       for (var i = 0, j = 1; i < res.result.data.length; i++, j++) {
    //         this.priorityForAppointmentArray[j] = res.result.data[i];
    //       }
    //       this.selectedPriorityId = this.priorityForAppointmentArray[0].id
    //     })

    this.requestService
      .sendRequest(
        AddToBeSchedulledUrlsEnum.getAppointmentTypes,
        'GET',
        REQUEST_SERVERS.schedulerApiUrl1,
      ).subscribe(
        (res: HttpSuccessResponse) => {
          this.AppointmentType = res.result.data;
          this.typeForAppointment = this.AppointmentType[0].id;
        })
    this.createForm();
    this.date = new Date();
  }
  /*Form intilaization function*/
  private createForm() {
    this.myForm = this.formBuilder.group({
      clinicName: '',
      specailityName: '',
      doctorName: '',
      appointmentPirority: ''
    });
  }
  /*Get possible appointment types*/
  public getAppointmentType(event) {
    for (let i = 0; i < this.AppointmentType.length; i++) {
      if (this.AppointmentType[i].description === event.target.value) {
        this.typeForAppointment = JSON.parse(JSON.stringify(this.AppointmentType[i].id));
        break;
      }
    }
  }
  /*Get possible appointment priorities*/
  public getAppointmentPriority(event) {
    this.selectedPrioirtyName = event.target.value
  }
  /*Get open and free slots for waiting list*/
  public getOpenAndWaitingSlots() {
    this.freeSlots = 0
    this.waitingSlots = 0
    if (this.selectedClinicId != 0 && this.selectedSepcId != 0) {
      let reqObj = {
        'specId': this.selectedSepcId,
        'clinicId': this.selectedClinicId,
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
  /*Get doctor assigned for waiting list*/
  public getDocAssign() {
    this.stDate.setHours(0)
    this.stDate.setMinutes(0)
    this.edDate.setHours(23)
    this.edDate.setMinutes(59)
    this.requestService
      .sendRequest(
        AppointmentUrlsEnum.getDoctorAssigned,
        'POST',
        REQUEST_SERVERS.schedulerApiUrl,
        {
          'clinicId': this.selectedClinicId,
          'specId': parseInt(this.selectedSepcId),
          'start': convertDateTimeForSending(this.storageData, this.stDate),
          'end': convertDateTimeForSending(this.storageData, this.edDate)
        }
      ).subscribe(
        (response: HttpSuccessResponse) => {
          for (var i = 0, j = 1; i < response.result.data.length; i++, j++) {
            this.doctors[j] = response.result.data[i];
          }
          this.selectedDoctorId = this.doctors[0].docId
          this.getOpenAndWaitingSlots();
        }, err => {
          this.doctors = [{ 'doctorName': 'Provider', 'docId': 0 }]
          this.selectedDoctorId = this.doctors[0].docId
          this.getOpenAndWaitingSlots();
        });
  }
  public findBest() 
  {
    this.enableBest = true;
    this.disableBest = false;
    this.enableManual = false;
    this.disableManual = true;
    this.isFindBestClicked = false;
    this.isManualClicked = true;
    this.isAddToOpenClicked = true;
    localStorage.setItem('lastClicked', 'findBest');
  }
  public manualCalendar() {
    this.enableManual = true;
    this.enableBest = false;
    this.disableBest = true;
    this.disableManual = false;
    this.isFindBestClicked = true;
    this.isAddToOpenClicked = true;
    this.isManualClicked = false;
    this.isStart = false;
    localStorage.setItem('lastClicked', 'manual');
    //To modify Calender attributes of Doctor Calender
     this.DoctorCalendarService.PatientSchedulingCalendar = true;
    //
  }
  public waitngList() {
    this.isFindBestClicked = true;
    this.isAddToOpenClicked = false;
    this.isManualClicked = true;
    this.isStart = false;
  }
  public viewVisitHistory() {
    this.schedulingQueueService.nameOfPatient = this.data.patient.middle_name?this.data.patient.first_name + ' ' + this.data.patient.middle_name + ' ' + this.data.patient.last_name:this.data.patient.first_name + ' ' + this.data.patient.last_name;
    this.schedulingQueueService.visitHistoryChartNo = this.patientId
    this.schedulingQueueService.caseId = parseInt(this.caseId);
    const activeModal = this.visitHistoryModal.open(VisitHistoryComponent, {
      size: 'lg', backdrop: 'static', windowClass: 'history-modal',
      keyboard: false
    });
  }
  public clinicChange() {
    this.getDocAssign()
  }
  public specialityChange() {

    this.getDocAssign()
  }
  public doctorChange() {
    this.getOpenAndWaitingSlots()
  }
  // public changeAppointmentTitle() {
  //   this.DoctorCalendarService.appointmentTitle = this.appointmentTitle;
  // }
  public addToWaitingList() {
    //
    //console.log("ADDWAITING", this.appointmentTitle,this.typeForAppointment);
    //
    if (this.appointmentTitle === null || this.appointmentTitle == '' || this.appointmentTitle === undefined) {
      this.appointmentTitle = 'N/A'
    }

    let reqObj = {
      'specId': parseInt(this.selectedSepcId),
      'clinicId': parseInt(this.selectedClinicId),
      'priorityId': parseInt(this.selectedPriorityId),
      'caseType': this.caseType,
      'chartNo': this.patientId,
      'currentDateTime': convertDateTimeForSending(this.storageData, new Date()),
      'appointmentPriorityId': this.selectedAppointmentPriorityId,
      'appointmentTypeId': this.typeForAppointment,
      'appointmentTitle': this.appointmentTitle,
      'caseId': parseInt(this.caseId),
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
          this.toastrService.success("Successfully Added", 'Success')
          this.waitingSlots = this.waitingSlots + 1;
        });
  }
  public resetWaitingListForm() {
    //
    this.appointmentTitle="";
    //
    this.selectedClinicId = this.clinics[0].id
    this.selectedSepcId = this.speciality[0].id
    this.selectedDoctorId = this.doctors[0].docId
    this.waitingSlots = 0;
    this.freeSlots = 0;
    this.selectedPriorityId = this.priorityForAppointmentArray[0].id

  }
}
