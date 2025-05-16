import { DatePipeFormatService } from './../../../../../shared/services/datePipe-format.service';

import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DeletingIdsService } from '../datatable/deleting-ids.service';
import { SchedulerSupervisorService } from "../../../../scheduler-supervisor.service";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SubjectService } from '../../subject.service'
import { FrontDeskService } from '../../../../front-desk.service'
import { ToastrService } from 'ngx-toastr';
import { StorageData, HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { AssignSpecialityUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { AssignDoctorUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-doctor/assign-doctor-urls-enum';
import { ActivatedRoute, Router } from '@angular/router';
import {AclServiceCustom} from '../../../../../acl-custom.service'
import { AssignRoomsUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-rooms/assign-rooms-urls-enum';
import { convertDateTimeForRetrieving, convertDateTimeForSending } from '@appDir/shared/utils/utils.helpers';
import { AclService } from '@appDir/shared/services/acl.service';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';

@Component({
  selector: 'app-accordian',
  templateUrl: './accordian.component.html',
  styleUrls: ['./accordian.component.css']
})
export class AccordianComponent {
  myForm: FormGroup;
  public data: any;
  public lastPage: any;
  public otherPage: any = 0;
  public entriesOnLastPage: any;
  public numSelected = 0;
  public pageNumber = 1;
  public counterChecked = 0;
  public deleteAll: any;
  public counter: any = 10;
  public allChecked = false;
  public isOpenFilters = true;
  public isEnableButtons: any = true;
  public singleSelection: any = [];
  public deleteIds: number[];
  public rec_id: any;
  public deleteStatus: any;
  public specId: any;
  public isOtherChecked: boolean = true;
  public comments: string;
  public recId: any = null;
  public selectedClinic;
  public clinicArray: any;
  public speciality: string = "";
  public clinicName: string = "";
 public clinicNameQualifier :string=''
  public selectedClinicId: any;
  public actionOption: any = "Cancel Appointment";
  public isForwardToFrontDesk: any = true;
  public isAutoResolve: any = true;
  public applyActionCheck: any = 1;
  public clinicSelected: any = "Same Clinic";
  public spec_id: any;
  public action: any = "Cancel"  // take action on cancel appointment
  public targetClinicName: any;
  public status: any = true;
  public endTime: any
  public autoResOnClinic: any;
  public deleteButtonStatus: any;
  public allFacilitySupervisorClinicIds: any;
  public deleteForRecOrSpecCheck: any;
  public autoResolveList = [
    { 'name': 'Same Location' ,'value':'same'},
    { 'name': 'Any Location ','value':'any' }

  ];
  public defaultComments = [];
  public actions = [
    { 'name': 'Cancel Appointment', 'id': 1 },
    { 'name': 'Forward to Front Desk', 'id': 2 },
    { 'name': 'Auto Resolve', 'id': 3 }
  ];
  	OtherReason = 'Other';
	isSelectedOtherReason = false;
	isSelectedOtherReasonRequired = false;
	isSelectedOtherReasonHaveValue = false;
  appointment_deleted:boolean=false;
  userPermissions = USERPERMISSIONS;

  ngOnInit(): void {
	
    this.getDeleteIds.cast.subscribe(
      status => this.status = status
    );
    this.getDeleteIds.castDeleteButton.subscribe(
      status => this.deleteStatus = status
    )
    this.getDeleteIds.castArrayOfAppointment.subscribe(
      status => this.data = status
    );
    this.getDeleteIds.castArraySpecId.subscribe(
      status => this.data = status
    )
    this.getDeleteIds.castUpdatedSpec.subscribe(
      status => this.data = status
    )
    this.getDeleteIds.castUpdatedRec.subscribe(
      status => this.data = status
    )
    // this.selectedClinic = this.clinicName;
    this.action = this.actions[0].id
    this.getDeleteIds.cast.subscribe(
      status => this.status = status
    );
    this.getDeleteIds.castDeleteButton.subscribe(
      response => this.deleteButtonStatus = response
    )
    if (this.data.length == null)
    {
      this.status = false;
    }
  }
  constructor(
    private formBuilder: FormBuilder, 
    public getDeleteIds: DeletingIdsService, 
    private router: Router,
    private route: ActivatedRoute,
    public aclCustom : AclServiceCustom,
    public activeModal: NgbActiveModal,
    public http: HttpClient,
    protected requestService: RequestService,
    private storageData: StorageData,
    public _subjectService: SubjectService,
    private SupervisorService: SchedulerSupervisorService,
	  public  datePipeService:DatePipeFormatService,
    private toastrService: ToastrService, 
    public frontDeskService: FrontDeskService,
    public aclService: AclService
  ) {
    this.rec_id = this._subjectService.recIdForDeleteModal
    this.spec_id = this._subjectService.specIdForDeleteModal;
   
    if (this.rec_id == null) {
      this.recId = true;
    }
    else {
      this.recId = false;
    }
    this.getDocAssignments()
    this.allFacilitySupervisorClinicIds = this.storageData.getFacilityLocations()
    this.requestService
      .sendRequest(
        AssignSpecialityUrlsEnum.Facility_list_dropdown_GET,
        'GET',
		REQUEST_SERVERS.fd_api_url,
		{ 'clinics': this.allFacilitySupervisorClinicIds ,
		
	}
      ).subscribe(
        (response: HttpSuccessResponse) => {
          this.clinicArray = response.result.data;
          this.targetClinicName = this.clinicArray[0].id
          this.selectedClinicId = this.targetClinicName;
		  this.setSelectedClinic( this.selectedClinicId)
        });
    this.requestService
      .sendRequest(
        AssignDoctorUrlsEnum.appointmentCancellationComments,
        'GET',
        REQUEST_SERVERS.schedulerApiUrl1,
      ).subscribe(
        (res: HttpSuccessResponse) => {
          for(var i = 0 ; i<res.result.data.length; i++){  
            if(res.result.data[i]["type_id"] != undefined && (res.result.data[i]["type_id"] == 2 || res.result.data[i]["type_id"] == 3)){
              this.defaultComments.push(res.result.data[i]);
            }
          }
          // this.defaultComments = res.result.data;
          this.myForm.controls['defaultComments'].setValue(this.defaultComments[0].name)
        })

	this.createForm();
	this.autoResOnClinic=this.autoResolveList[0].value
    this.myForm.controls['actionOption'].setValue("Cancel Appointment")
    this.speciality = this._subjectService.specialityForDeleteModal; // displaying speciallity name in cancel modal
    this.clinicName = this._subjectService.clinicForDeleteModal; // displaying clinic name in cancel modal
    this.clinicName =  this.aclCustom.convertFacilityToPracticeLocation(this._subjectService.clinicIdForDeleteModal);
	this.clinicNameQualifier=this._subjectService.clinicQualifierForDeleteModal
  }
  /*Form intilaization function*/
  private createForm() {
    this.myForm = this.formBuilder.group({
      actionOption: 'Cancel Appointment',
      defaultComments: '',
      otherComments: '',
    });
  }
  public async getVisitSession()
  {
	let appointment_ids = []
	//This is to get all the appointments for the visit session
	this.data.forEach((item) =>
	{
		appointment_ids.push(item.id)
	});
	if (appointment_ids.length != 0)
	{
		await this.requestService
	.sendRequest(
	AssignRoomsUrlsEnum.getVisitSession,
	'POST',
	REQUEST_SERVERS.fd_api_url,
	{ "appointment_ids": appointment_ids})
	.subscribe((response : any) =>
	{
		response.result.data.forEach((item) =>
		{
			this.data.forEach((inner) =>
			{
				if (item.appointment_id == inner.id)
				{
					inner['visit_session'] = item.visit_session
				}
			})
		})
		this.data = [...this.data];
	})
	}
  }
  /*Get doctor appointments in this assignment*/
  public getDocAssignments() {
    this.requestService
      .sendRequest(
        AssignSpecialityUrlsEnum.unavailable_doctors_appointments,
        'POST',
        REQUEST_SERVERS.schedulerApiUrl1,
        {
		  'date_list_id': this.SupervisorService.currentDeleteAppointment.current_dateList_event.id,
		  'start_date':convertDateTimeForSending(this.storageData, new Date(this.SupervisorService.currentDeleteAppointment.unavailable_start_date_time)),
		  'end_date':convertDateTimeForSending(this.storageData, new Date(this.SupervisorService.currentDeleteAppointment.unavailable_end_date_time))
        }
      ).subscribe(
        (response: HttpSuccessResponse) => {
		  this.data = response.result.data;
		  this.getVisitSession();
          for (let i = 0; i < this.data.length; i++) {
            this.data[i].scheduled_date_time = convertDateTimeForRetrieving(this.storageData, new Date(this.data[i].scheduled_date_time))
            var startString = "000-00-"
            var receivedString = JSON.stringify(this.data[i].patient_id);
            var finalStr = startString + receivedString.padStart(4, "0");
            this.data[i].patient_id = finalStr
          }
          this.numSelected = 0;
          this.isEnableButtons = true;
          this.allChecked = false;
          this.pageNumber = 1;
          this.lastPage = Math.ceil(this.data.length / parseInt(this.counter));
          this.entriesOnLastPage = this.data.length % parseInt(this.counter);
          if (response.result.data.length == 0) {
            this.deleteButtonStatus = false;
          }
          for (var i = 0; i < this.data.length; i++) {
            this.data[i]['isChecked'] = false
          }

          this.getDeleteIds.AppointmentWithSpecId(response.result.data);
        }, error => {
          this.data = [];
          this.getDeleteIds.AppointmentWithSpecId(this.data);
        }
      )
  }
  /*Get doctor appointments in all assignments created in recurrence*/
  public getRecAssignments() {
    if (this.rec_id != null) {
      this.requestService
        .sendRequest(
          AssignSpecialityUrlsEnum.unavailable_doctors_appointments,
          'GET',
          REQUEST_SERVERS.schedulerApiUrl1,
          {
            "available_doctor_id": this.SupervisorService.currentDeleteAppointment.current_dateList_event.available_doctor_id,
			'start_date':convertDateTimeForSending(this.storageData, new Date(this.SupervisorService.currentDeleteAppointment.unavailable_start_date)),
		  	'end_date':convertDateTimeForSending(this.storageData, new Date(this.SupervisorService.currentDeleteAppointment.unavailable_end_date))
		}
        ).subscribe(
          (response: HttpSuccessResponse) => {
			this.data = response.result.data;
			this.getVisitSession();
            for (let i = 0; i < this.data.length; i++) {
              this.data[i].scheduled_date_time = convertDateTimeForRetrieving(this.storageData, new Date(this.data[i].scheduled_date_time))
              var startString = "000-00-"
              var receivedString = JSON.stringify(this.data[i].patient_id);
              var finalStr = startString + receivedString.padStart(4, "0");
              this.data[i].patient_id = finalStr
            }
            this.numSelected = 0;
            this.isEnableButtons = true;
            this.allChecked = false;
            this.pageNumber = 1;
            this.lastPage = Math.ceil(this.data.length / parseInt(this.counter));
            this.entriesOnLastPage = this.data.length % parseInt(this.counter);
            if (response.result.data.length == 0) {
              this.deleteButtonStatus = false;
            }
            for (var i = 0; i < this.data.length; i++) {
              this.data[i]['isChecked'] = false
            }

            this.getDeleteIds.AppointmentWithRecId(response.result.data);
          }, error => {
            this.data = [];
            this.getDeleteIds.AppointmentWithRecId(this.data);
          }
        );
    }
  }
  /*This assignment(i.e get appointments for this partiular assignment) option function*/
  public thisAssignment() {
    this.deleteForRecOrSpecCheck = "this clicked";
    this.isEnableButtons = true;
    this.rec_id = this._subjectService.recIdForDeleteModal
    this.spec_id = this._subjectService.specIdForDeleteModal;
    this.getDocAssignments()
  }
  /*All subsequent(i.e get appointments for this and all the assignments that are created in recurrence) assignments function*/
  public allSubSequentAssignments(e) {
    if (e.target.checked) {
      this.deleteForRecOrSpecCheck = "subsequent clicked";
      this.rec_id = this.SupervisorService.currentDeleteAppointment.rec_id;
      this.spec_id = this.SupervisorService.currentDeleteAppointment.spec_id;
      this.getRecAssignments()
    }
  }
  /*All appointment selection from table to perform  certain actions against appointments*/
  public allSelected(e) {
    this.counterChecked = 0;
    if (e.checked) {
      this.allChecked = true;
      this.isEnableButtons = false;
      let start = this.counter * (this.pageNumber - 1);
      for (var i = start; i < (start + this.counter); i++) {
        if (this.data[i] != undefined) {
          if (this.data[i]['isChecked'] == false) {
			if(this.data[i].appointment_status_slug &&(this.data[i].appointment_status_slug!='no_show'&& this.data[i].appointment_status_slug!='completed' ))          
			{
            this.data[i]['isChecked'] = true;
            this.getDeleteIds.deleteSelected[this.numSelected] = this.data[i].appointment_id
            this.numSelected++;
            this.counterChecked++;
			}
          }
        }
      }
    }
    else {
      this.isEnableButtons = true;
      this.allChecked = false;
      let start = this.counter * (this.pageNumber - 1);
      for (var i = start; i < (start + this.counter); i++) {
        if (this.data[i] != undefined) {
          if (this.data[i]['isChecked'] == true) {
            this.data[i]['isChecked'] = false;
            this.getDeleteIds.deleteSelected.splice(this.getDeleteIds.deleteSelected.indexOf(this.data[i].appointment_id), 1)
            this.numSelected--;
            this.counterChecked--;
          }
        }
      }
      for (var i = 0; i < this.data.length; i++) {
        if (this.data[i]['isChecked'] == true) {
          this.isEnableButtons = false;
          break;
        }
        else {
          this.isEnableButtons = true;
        }
      }
    }
    this.getDeleteIds.editStatus(!this.isEnableButtons)

  }
  /*Particular appointment selection from table to perform  certain action against appointments*/
  public particularSelected(e, u) {
	  if(e.checked)
	  {
		if(u.appointment_status_slug &&(u.appointment_status_slug=='no_show'|| u.appointment_status_slug=='completed' ))
		{
		  // && u.appointment_status=="Completed"
		  // u.isChecked=false;
		  u.isChecked=false;
		  e.source._checked=false;
		  this.toastrService.error("Appointment can't be deleted because the evaluation has been completed.", 'Error');
		  return ;
		}
	  }
    var singleSelectionStatus;
    if (this.getDeleteIds.emptyArray == true) {
      this.singleSelection = []
      this.getDeleteIds.emptyArray = false
    }
    if (e.checked) {
      this.isEnableButtons = false;
      this.numSelected = this.numSelected + 1;
      if (this.numSelected == this.data.length) {
        this.allChecked = true;
      }
      else {
        this.allChecked = false
      }
      for (var i = 0; i < this.data.length; i++) {
        if (u.appointment_id == this.data[i].appointment_id) {
          u.isChecked = true;
          this.data[i]['isChecked'] = true;
          this.getDeleteIds.deleteSelected.push(u.appointment_id)
          break;
        }
      }
    }
    else {
      this.numSelected = this.numSelected - 1;
      this.allChecked = false;
      if (this.numSelected <= 0) {
        this.isEnableButtons = true;
      }
      for (var i = 0; i < this.data.length; i++) {
        if (u.appointment_id == this.data[i].appointment_id) {
          u.isChecked = false;
          this.data[i]['isChecked'] = false;
          this.getDeleteIds.deleteSelected.splice(this.getDeleteIds.deleteSelected.indexOf(u.appointment_id), 1)
          break;
        }
      }
    }
    if (this.getDeleteIds.deleteSelected == undefined || this.getDeleteIds.deleteSelected.length == 0) {
      singleSelectionStatus = true;
    } else {
      singleSelectionStatus = false;
    }
    this.getDeleteIds.editStatus(!singleSelectionStatus)
  }
  /*No of entries to show in table function*/
  public changeNoOfEntries(e) {
    this.counter = e;
    this.counter = parseInt(this.counter);
    this.lastPage = Math.ceil(this.data.length / this.counter);
    this.entriesOnLastPage = this.data.length % this.counter;
    if (this.counter >= this.data.length) {
      this.pageNumber = 1;
    }
    else {
      this.pageNumber = this.otherPage
      this.counterChecked = 0;
      this.allChecked = false;
      if (this.numSelected > 0) {
        this.isEnableButtons = false;
      }
      else {
        this.isEnableButtons = true;
      }
      let start = this.counter * (this.pageNumber - 1);
      for (var i = start; i < (this.counter + start); i++) {
        if (this.data[i] != undefined) {
          if (this.data[i]['isChecked'] == true) {
            this.counterChecked++;
          }
        }
      }
      if (this.pageNumber == this.lastPage && this.counterChecked == this.entriesOnLastPage && this.entriesOnLastPage != 0) {
        this.allChecked = true;
      }
      else if (this.counterChecked == this.counter || this.data.length == this.counterChecked) {
        this.allChecked = true;
      }
      else {
        this.allChecked = false
      }
    }

  }
  /*Change Page Function*/
  public changePage(e) {
    this.counterChecked = 0;
    this.pageNumber = e.offset + 1;
    this.otherPage = e.offset + 1;
    this.allChecked = false;
    if (this.numSelected > 0) {
      this.isEnableButtons = false;
    }
    else {
      this.isEnableButtons = true;
    }
    let start = this.counter * (this.pageNumber - 1);
    for (var i = start; i < (this.counter + start); i++) {
      if (this.data[i] != undefined) {
        if (this.data[i]['isChecked'] == true) {
          this.counterChecked++;
        }
      }
    }
    if (this.pageNumber == this.lastPage && this.counterChecked == this.entriesOnLastPage && this.entriesOnLastPage != 0) {
      this.allChecked = true;
    }
    else if (this.counterChecked == this.counter || this.data.length == this.counterChecked) {
      this.allChecked = true;
    }
    else {
      this.allChecked = false
    }
  }
  /*Change origin clinic function for autoreslove action */
  public changeOriginClinic() {
    this.selectedClinicId = this.targetClinicName;
	this.setSelectedClinic( this.selectedClinicId)
  }
  /*Change target clinic function  for autoreslove action*/
  public changeTargetClinic(e) {
    this.autoResOnClinic = e.target.value
    //this.clinicSelected= clinic;
  }
  /*Actions options against appointment(i.e auto reslove,cancel,forward to front desk)*/
  public changeAppointmentsAction() {
    if (this.action == 2) {
      this.isForwardToFrontDesk = false;
      this.isAutoResolve = true;
      this.applyActionCheck = 2;  // if forwardtoFD selected bcz 2 is ID of forwardToFD check array line 36
    }
    else if (this.action == 3) {
      this.isAutoResolve = false;
      this.isForwardToFrontDesk = true;
      this.applyActionCheck = 3;  // if autoResolve selected bcz 3 is ID of autoRes check array line 36
    } else {
      this.isForwardToFrontDesk = true;
      this.isAutoResolve = true;
      this.applyActionCheck = 1; // if cancelAssign selected bcz 1 is ID of cancelAssi check array line 36
    }

  }
  /*Solve appointment against particular action*/
  public applyAppointmentAction() {
    if (this.isSelectedOtherReason == true) {
      this.comments = this.myForm.get('otherComments').value;
    }
    else {
      this.comments = this.myForm.get('defaultComments').value;
    }
    if (this.comments == '') {
      this.comments = 'N/A'
    }
    if (this.applyActionCheck == 1) {
      var req = {  };
      if (this.getDeleteIds.deleteAll === undefined || this.getDeleteIds.deleteAll.length == 0) {

        req['appointment_ids'] = this.getDeleteIds.deleteSelected;
        req['cancelled_comments'] = this.comments;
        this.getDeleteIds.emptyArray = true
      } else {
        req['appointment_ids'] = this.getDeleteIds.deleteAll;
        req['cancelled_comments'] = this.comments;
      }
      this.requestService
        .sendRequest(
          AssignSpecialityUrlsEnum.Cancel_Appointment_new,
          'POST',
          REQUEST_SERVERS.schedulerApiUrl1,
          req
        ).subscribe(
          (result: HttpSuccessResponse) => {
            this.getDeleteIds.deleteAll = []
            this.getDeleteIds.deleteSelected = []
            if (this.getDeleteIds.deleteSelected.length == 0) {
              this.status = false
            }
            else {
              this.status = true
            }
            //This is where the change is needed
            this.toastrService.success(result.message, 'Success');
			this.appointment_deleted=true
            this._subjectService.apiUpdate.next(true);
            // this.activeModal.close();
            // setTimeout(() =>
            // {
            //   // window.location.reload();
            //   this.router.navigate([`/scheduler-front-desk`]);
            // }, 1000);
            if (this.deleteForRecOrSpecCheck == "subsequent clicked") {
              this.getRecAssignments()
            } else {
              this.getDocAssignments()
            }
          });
    }
    else if (this.applyActionCheck == 2) {
      var req1;
      var allSelected = this.getDeleteIds.deleteAll;
      if (allSelected === undefined || allSelected.length == 0) {

        req1 = this.getDeleteIds.deleteSelected;
        this.getDeleteIds.emptyArray = true
      } else {
        req1 = this.getDeleteIds.deleteAll;
      }
      var requestedObject = {
        "appointment_ids": req1,
        "target_clinic_id": this.selectedClinicId,
        "origin_clinic_id": this._subjectService.clinicIdForDeleteModal,
        "pushed_to_front_desk_comments": this.comments
      };
      this.requestService
        .sendRequest(
          AssignSpecialityUrlsEnum.Forward_Appointments_FD_new,
          'POST',
          REQUEST_SERVERS.schedulerApiUrl1,
          requestedObject
        ).subscribe(
          (result: HttpSuccessResponse) => {
            this.getDeleteIds.deleteAll = []
            this.getDeleteIds.deleteSelected = []
            if (this.getDeleteIds.deleteSelected.length == 0) {
              this.status = false
            }
            else {
              this.status = true
            }
            this.toastrService.success('Successfully Forwaded', 'Success');
			this.appointment_deleted=true
            if (this.deleteForRecOrSpecCheck == "subsequent clicked") {
              this.getRecAssignments()
            } else {
              this.getDocAssignments()
            }
          }, error => {
            if (this.getDeleteIds.deleteSelected.length == 0) {
              this.status = false
            }
            else {
              this.status = true
            }
          });
      if (this.data == '' || this.data == undefined || this.data == null) {
        this.getDeleteIds.deleteStatus(false);
      } else {
        this.getDeleteIds.deleteStatus(true)
      }
    }

    else if (this.applyActionCheck == 3) {
      var reqObj;
      var req2;
      var allSelected = this.getDeleteIds.deleteAll;
      var onlySelected = this.getDeleteIds.deleteSelected;

      if (allSelected === undefined || allSelected.length == 0) {

        req2 = this.getDeleteIds.deleteSelected;
        this.getDeleteIds.emptyArray = true

      } else {
        req2 = this.getDeleteIds.deleteAll;

      }
    //   var sendThisClinic;
    //   if (this.autoResOnClinic == undefined) {
    //     sendThisClinic = 'same'
    //   } else {
    //     sendThisClinic = 'any'
    //   }
      if (this.deleteForRecOrSpecCheck == "subsequent clicked") {
        reqObj = {
		  "appointment_ids": req2,
		  "facility_location_tpye":this.autoResOnClinic,
		  "available_doctor_id":this.SupervisorService.currentDeleteAppointment.current_dateList_event.available_doctor_id
        //   "clinic": sendThisClinic,
        //   "recId": this.SupervisorService.currentDeleteAppointment.recId
        }
        // if (reqObj.recId == null) {
        //   delete reqObj.recId;
        // }
      }
      else {

        reqObj = {
          "appointment_ids": req2,
          "facility_location_tpye": this.autoResOnClinic,
        }
      }
      this.requestService
        .sendRequest(
          AssignDoctorUrlsEnum.automaticResolveForDoctorAppointments,
          'POST',
          REQUEST_SERVERS.schedulerApiUrl1,
          reqObj
        ).subscribe(
          (result: HttpSuccessResponse) => {
            this.getDeleteIds.deleteAll = []
            this.getDeleteIds.deleteSelected = []
            if (this.getDeleteIds.deleteSelected.length == 0) {
              this.status = false
            }
            else {
              this.status = true
            }
            this.toastrService.success('Successfully Resolved', 'Success');
			this.appointment_deleted=true
            if (this.deleteForRecOrSpecCheck == "subsequent clicked") {
              this.getRecAssignments()
            } else {
              this.getDocAssignments()
            }
          }, error => {
            if (this.getDeleteIds.deleteSelected.length == 0) {
              this.status = false
            }
            else {
              this.status = true
            }
          });
      if (this.data == '' || this.data == undefined || this.data == null) {
        this.getDeleteIds.deleteStatus(false);
      } else {
        this.getDeleteIds.deleteStatus(true)
      }
    }
  }
  /*Choose other comment option for commenting*/
  public commentOtherOption(e) {
    if (e.target.checked) {
      this.isOtherChecked = false;
    }
  }
  /*Choose default comment option commenting*/
  public commentDefaultOption(e) {
    if (e.target.checked) {
      this.isOtherChecked = true;
    }
  }
  /*Form submitation function*/
  public submitForm() {
    var req;
    if (this.deleteForRecOrSpecCheck == "this clicked") {
      req = {
        "available_doctor_id": this.SupervisorService.currentDeleteAppointment.current_dateList_event.available_doctor_id,
		"date_list_id": this.SupervisorService.currentDeleteAppointment.current_dateList_event.id

      }
    } else if (this.deleteForRecOrSpecCheck == "subsequent clicked") {
      req = {
        "date_list_id": this.SupervisorService.currentDeleteAppointment.current_dateList_event.id
      }
    } else {
      req = {
        "available_doctor_id": this.SupervisorService.currentDeleteAppointment.current_dateList_event.available_doctor_id,
		"date_list_id": this.SupervisorService.currentDeleteAppointment.current_dateList_event.id
      }
    }
    this.requestService
      .sendRequest(
        AssignDoctorUrlsEnum.deleteDoctorAssignment,
        'DELETE',
        REQUEST_SERVERS.schedulerApiUrl1,
        req
      ).subscribe(
        (response: HttpSuccessResponse) => {
          this.toastrService.success('Assignment deleted successfully', 'Success')
          this.getDeleteIds.deleteSelected = []
          this.activeModal.close();
          this._subjectService.refreshUpdate('accordin');
        });

  }
  /*Form cancellation function*/
  public cancelForm() {
    this.getDeleteIds.deleteSelected = []
    this.getDeleteIds.editStatus(false)
	if(this.appointment_deleted)
	{
		this._subjectService.refreshUpdate('currentnotificationdetail');

	}
    this.activeModal.close()
    
  }
  getSelectionchage(value) {
	  debugger;
	if(this.OtherReason === value.target.value) {
		this.setOthersFieldConfig();
	} else {
		this.RemoveOtherFieldConfig();
	}
	}
	// setOthersFieldConfig() {
	// this.isSelectedOtherReason = true;
	// this.isSelectedOtherReasonRequired = true;
	// if(this.myForm.controls.otherComments.value != '') {
	// this.isSelectedOtherReasonHaveValue = false;
	// } else {
	// this.isSelectedOtherReasonHaveValue = true;
	// }
	// }
	// RemoveOtherFieldConfig(){
	// this.isSelectedOtherReason = false;
	// this.isSelectedOtherReasonRequired = false;
	// this.isSelectedOtherReasonHaveValue = false;
	// }
	
	  setOthersFieldConfig() {
	  this.isSelectedOtherReason = true;
	  this.myForm.controls['otherComments'].setValidators([Validators.required]);
	  this.myForm.controls['otherComments'].updateValueAndValidity({emitEvent:false})
	  }
	  RemoveOtherFieldConfig(){
		  this.isSelectedOtherReason = false;
		  this.myForm.controls['otherComments'].reset('',{emitEvent:false});
		  this.myForm.controls['otherComments'].clearValidators()
		  this.myForm.controls['otherComments'].updateValueAndValidity({emitEvent:false})
  
	  }
	  setSelectedClinic(clinicId)
	  {
	   let selectedClinic= this.clinicArray.find(clinic=>clinic.id==clinicId);
	   if(selectedClinic)
	   {
		 this.selectedClinic=selectedClinic;
	   }
	   else
	   {
		this.selectedClinic=null
	   }
	
	  }
}
