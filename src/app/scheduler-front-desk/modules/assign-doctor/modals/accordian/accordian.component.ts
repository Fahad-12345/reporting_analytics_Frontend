import { DatePipeFormatService } from './../../../../../shared/services/datePipe-format.service';

import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DeletingIdsService } from './deleting-ids.service';
import { SchedulerSupervisorService } from "../../../../scheduler-supervisor.service";
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { AssignDoctorSubjectService } from '../../assign-doctor-subject.service';
import { SubjectService } from '../../subject.service'
import { FrontDeskService } from '@appDir/scheduler-front-desk/front-desk.service';
import { ToastrService } from 'ngx-toastr';
import { StorageData, HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { Router } from '@angular/router';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { AssignDoctorUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-doctor/assign-doctor-urls-enum';
import { AssignSpecialityUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
import { AccordianEnum } from '@appDir/scheduler-front-desk/modules/assign-speciality/modals/accordian/accordian-enum';
import { AppointmentCancelCommentModel } from '@appDir/scheduler-front-desk/modules/assign-speciality/modals/accordian/appoinment-cancel-comment-model';
import { AssignRoomsUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-rooms/assign-rooms-urls-enum';
import { Pagination } from '@appDir/shared/models/pagination';
import { convertDateTimeForRetrieving } from '@appDir/shared/utils/utils.helpers';

@Component({
  selector: 'app-accordian',
  templateUrl: './accordian.component.html',
  styleUrls: ['./accordian.component.css']
})
export class AccordianComponent extends PermissionComponent {
  myForm: FormGroup;
  public data: any;
  public allChecked = false
  public counter: any = 10;
  public lastPage: any;
  public entriesOnLastPage: any;
  public counterChecked = 0;
  public pageNumber = 1;
  public isOpenFilters = true;
  public isEnableButtons: any = true;
  public numSelected: any
  public singleSelection: any = [];
  public deleteIds: number[];
//   public rec_id: any;
  public sepc_id: any;
  public deleteStatus: any;
  public specId: any;
  public isOtherChecked: boolean = true;
  public comments: string;
//   public recId: any = null;
  public isCreatedthroughRecurrance:boolean;
  public selectedClinic;
  public clinicArray: any;
  public speciality: string = "";
  public specalityName: string;
  public specalityQualifier: string;
  public clinicName: string = "";
  public clinicQualifier:string;
  public selectedClinicId: any;
  public actionOption: any = "Cancel Appointment";
  public optionId = 1;
  public isForwardToFrontDesk: any = true;
  public isAutoResolve: any = true;
  public applyActionCheck: any = 1;
  public clinicSelected: any = "Same Clinic";
//   public spec_id: any;
  public action: any = ""  // take action on cancel appointment
  public targetClinicName: any;
  public status: any = true;
  public autoResOnClinic: any;
  public deleteButtonStatus: any;
  public disableDeleteBtnOnDelete:boolean=false;
  public autoResolveList = [{ 'name': 'Same Location','value':'same' }, { 'name': 'Any Location ','value':'any' }];
  public defaultComments :AppointmentCancelCommentModel[]=[];
  public actions = [{ 'name': 'Cancel Appointment', 'id': 1 }, { 'name': 'Forward to Front Desk', 'id': 2 }, { 'name': 'Auto Resolve', 'id': 3 }];
  public thisAssignment=AccordianEnum.thisAssignment;
  public subsequentAssignment=AccordianEnum.subsequentAssignment;
  public deleteForRecOrSpecCheck:string=AccordianEnum.thisAssignment 
  ngOnInit(): void {
    this.allFacilitySupervisorClinicIds = this.storageData.getFacilityLocations()
	  this.autoResOnClinic=this.autoResolveList[0].value;
    this.requestService
      .sendRequest(
        AssignSpecialityUrlsEnum.getUserInfobyFacility,
        'POST',
        REQUEST_SERVERS.schedulerApiUrl1,
		{ 'facility_location_ids': this.allFacilitySupervisorClinicIds,
		page:1,
		per_page: Pagination.per_page,
		pagination:true
	 }
      ).subscribe(
        (result: HttpSuccessResponse) => {
          this.clinicArray = result.result.data && result.result.data.docs;
          this.targetClinicName = this.clinicArray[0].id
          this.selectedClinicId = this.targetClinicName;
		  this.setSelectedClinic(this.selectedClinicId);
        });
    this.requestService
      .sendRequest(
        AssignDoctorUrlsEnum.appointmentCancellationComments,
        'GET',
        REQUEST_SERVERS.schedulerApiUrl1,
      ).subscribe(
        (res: HttpSuccessResponse) => {
          //this.defaultComments = res.result.data;
        //   this.defaultComments=res.result.data
            for(var i = 0 ; i<res.result.data.length; i++){  
              if(res.result.data[i]["type_id"] != undefined && (res.result.data[i]["type_id"] == 1 || res.result.data[i]["type_id"] == 3)){
                this.defaultComments.push(res.result.data[i]);
              }
            }
          //
          this.myForm.controls['defaultComments'].setValue(this.defaultComments[0].name)
        })
    this.createForm();
	this.myForm.controls['actionOption'].setValue("Cancel Appointment")
	this.isCreatedthroughRecurrance=(this.SupervisorService.currentDeleteAppointment.dateList && this.SupervisorService.currentDeleteAppointment.dateList.length>1)?true:false
    // if (this.SupervisorService.currentDeleteAppointment.recId == null) {
    //   this.recId = true;
    // } else {
    //   this.recId = false;
    // }
	debugger;

    this.speciality = this._subjectService.specialityForDeleteModal; // displaying speciallity name in cancel modal
	console.log('Subject Service',this._subjectService);
	this.specalityName = this._subjectService.specialityNameForDeleteModal;
	this.specalityQualifier = this._subjectService.specialityQualifierNameForDeleteModal;
	// this._subjectService && this._subjectService.spec && this._subjectService.spec.speciality?this._subjectService.spec.speciality:''; // displaying speciallity name in cancel modal
	this.selectedClinic;
	
    this.clinicQualifier = this._subjectService.clinicQualifierForDeleteModal; // displaying clinic name in cancel modal
	this.clinicName=this._subjectService.clinicForDeleteModal
    this.getDocAssignments()
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
  }
  public allFacilitySupervisorClinicIds: any = []
  constructor(aclService: AclService,
    router: Router,
    protected requestService: RequestService,
    private formBuilder: FormBuilder, public getDeleteIds: DeletingIdsService,
    public activeModal: NgbActiveModal,
    private storageData: StorageData, private toastrService: ToastrService,
    public AssignDoctorSubjectService: AssignDoctorSubjectService, public _subjectService: SubjectService,
    public _fdService: FrontDeskService,
    public http: HttpClient,
	public datePipeService:DatePipeFormatService,
    private SupervisorService: SchedulerSupervisorService) {
    super(aclService, router);
  }
  /*Form intilaization function*/
  private createForm() {
    this.myForm = this.formBuilder.group({
      actionOption: 'Cancel Appointment',
      defaultComments: '',
      otherComments: '',
    });
  }
  /*Get doctor appointments in this assignment*/
  public getDocAssignments() {
    this.requestService
      .sendRequest(
        AssignSpecialityUrlsEnum.getAppointmentsForAssignment_new,
        'POST',
        REQUEST_SERVERS.schedulerApiUrl1,
        {
			availablity_check:'dateList',
          "date_list_ids": [this.SupervisorService.currentDeleteAppointment.current_dateList_event.id]
        }
      ).subscribe(
        (response: HttpSuccessResponse) => {
		  this.data = response.result.data;
		  this.getVisitSession();
          for (let i = 0; i < this.data.length; i++) {
            this.data[i].scheduled_date_time = convertDateTimeForRetrieving(this.storageData, new Date(this.data[i].scheduled_date_time))
            //To Append End Time of App...hhh
            var newDateObj = new Date(this.data[i].scheduled_date_time.getTime() + this.data[i].time_slots*60000);
            this.data[i].dateTimeEnd = newDateObj;
            var startString = "000-00-"
              var receivedString = JSON.stringify(this.data[i].patient_id);
              var finalStr = startString + receivedString.padStart(4, "0");
              this.data[i].patient_id = finalStr
            //
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
			if(error.status != 406)
			{
				this.toastrService.success(error.error.message, 'Error')

			}
          this.data = [];
        }
      )
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
  /*Get doctor appointments in all assignments created in recurrence*/
  public getRecAssignments() {
    // if (this.rec_id != null) {
      this.requestService
        .sendRequest(
          AssignSpecialityUrlsEnum.getAppointmentsForAssignment_new,
          'POST',
          REQUEST_SERVERS.schedulerApiUrl1,
        //   {
        //     "docRecId": this.rec_id
		//   }
		{
			availablity_check:'doctor',
			available_doctor_ids:[this.SupervisorService.currentDeleteAppointment.current_dateList_event.available_doctor_id]
		}
        ).subscribe(
          (response: HttpSuccessResponse) => {
			this.data = response.result.data;
			this.getVisitSession();
            for (let i = 0; i < this.data.length; i++) {
              this.data[i].scheduled_date_time = convertDateTimeForRetrieving(this.storageData, new Date(this.data[i].scheduled_date_time))
              //To Append End Time of App...hhh
              var newDateObj = new Date(this.data[i].scheduled_date_time.getTime() + this.data[i].time_slots*60000);
              this.data[i].dateTimeEnd = newDateObj;
              var startString = "000-00-"
              var receivedString = JSON.stringify(this.data[i].patient_id);
              var finalStr = startString + receivedString.padStart(4, "0");
              this.data[i].patient_id = finalStr
              //
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
			if(error.status != 406)
			{
				this.toastrService.success(error.error.message, 'Error')

			}
            this.data = [];
          }
        );
    // }
  }
  /*This assignment(i.e get appointments for this partiular assignment) option function*/
  public getappoinmentForRecOrSpecAssignment(event) {
   
    //   this.rec_id = this.SupervisorService.currentDeleteAppointment.recId;
    //   this.spec_id = this.SupervisorService.currentDeleteAppointment.id;
    //   if (this.rec_id == null) {
    //     this.recId = true;
    //   }
    //   else {
    //     this.recId = false;
	//   }
	if(this.deleteForRecOrSpecCheck==AccordianEnum.thisAssignment)
	{
      this.getDocAssignments()
	}
	else
	{	
		this.getRecAssignments()
	}
  }
  /*All subsequent(i.e get appointments for this and all the assignments that are created in recurrence) assignments function*/
  public allSubSequentAssignments(e) {
    if (e.target.checked) {
      this.deleteForRecOrSpecCheck = AccordianEnum.subsequentAssignment;
    //   this.rec_id = this.SupervisorService.currentDeleteAppointment.recId;
    //   this.spec_id = this.SupervisorService.currentDeleteAppointment.specId;
      this.getRecAssignments()
    }
  }
  /*All appointment selection from table to perform  certain actions against appointments*/
  public allSelected(e) {
    this.counterChecked = 0;
    if (e.checked) {
      this.isEnableButtons = false;
      this.status = true;
      this.allChecked = true;
      let start = this.counter * (this.pageNumber - 1);
      for (var i = start; i < (start + this.counter); i++) {
        if (this.data[i] != undefined) {
          if (this.data[i]['isChecked'] == false) {
			  if(this.data[i].appointment_status_slug &&(this.data[i].appointment_status_slug!='no_show'&& this.data[i].appointment_status_slug!='completed' ))          
			{
				this.data[i]['isChecked'] = true;
				this.getDeleteIds.deleteSelected[this.numSelected] = this.data[i].id || this.data[i].appointment_id
				this.numSelected++;
				this.counterChecked++;
			}  
			
          }
        }
      }
    }
    else {
      this.allChecked = false;
      this.status = false;
      let start = this.counter * (this.pageNumber - 1);
      for (var i = start; i < (start + this.counter); i++) {
        if (this.data[i] != undefined) {
          if (this.data[i]['isChecked'] == true) {
            this.data[i]['isChecked'] = false;
            this.getDeleteIds.deleteSelected.splice(this.getDeleteIds.deleteSelected.indexOf(this.data[i].id), 1)
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
      this.status = true;
      this.numSelected = this.numSelected + 1;

      for (var i = 0; i < this.data.length; i++) {
        if (u.appointment_id == this.data[i].appointment_id) {
          u.isChecked = true;
          this.data[i]['isChecked'] = true;
          this.getDeleteIds.deleteSelected.push(u.appointment_id)
          this.counterChecked++;
          break;
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
    else {
      this.numSelected = this.numSelected - 1;
      this.allChecked = false
      if (this.numSelected <= 0) {
        this.status = false;
        this.isEnableButtons = true;
        this.numSelected = 0;
      }
      for (var i = 0; i < this.data.length; i++) {
        if (u.appointment_id == this.data[i].appointment_id) {
          u.isChecked = false;
          this.data[i]['isChecked'] = false;
          this.getDeleteIds.deleteSelected.splice(this.getDeleteIds.deleteSelected.indexOf(u.appointment_id), 1)
          this.counterChecked--;
          break;
        }
      }
      if (this.getDeleteIds.deleteSelected == undefined || this.getDeleteIds.deleteSelected.length == 0) {
        singleSelectionStatus = true;
      } else {
        singleSelectionStatus = false;
      }
      this.getDeleteIds.editStatus(!singleSelectionStatus)
    }
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
      if (this.lastPage <= this.pageNumber) {
        this.pageNumber = this.lastPage;
      }
      else {
        this.pageNumber = this.pageNumber;
      }
      // this.pageNumber = this.otherPage
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
	this.setSelectedClinic(this.selectedClinicId)
  }
  /*Change target clinic function  for autoreslove action*/
  public changeTargetClinic(e) {
    this.autoResOnClinic = e.target.value
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
    if (this.isOtherChecked == false) {
      this.comments = this.myForm.get('otherComments').value;
    }
    else {
      this.comments = this.myForm.get('defaultComments').value;
    }
    if (this.comments == '') {
      this.comments = 'N/A'
    }
    if (this.applyActionCheck == 1) {
      var req = { 'appointment_ids': 0, 'cancelled_comments': '' };
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
            this.toastrService.success(result.message, 'Success')
            if (this.deleteForRecOrSpecCheck == AccordianEnum.subsequentAssignment) {
              this.getRecAssignments()
            } else {
              this.getDocAssignments()
            }
          },error=>{
			this.toastrService.error(error.error.message, 'Error');
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
        "origin_clinic_id": this.SupervisorService.currentDeleteAppointment.clinicId,
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
            this.toastrService.success('Successfully Forwarded', 'Success')
            if (this.deleteForRecOrSpecCheck == AccordianEnum.subsequentAssignment) {
              this.getRecAssignments()
            } else {
              this.getDocAssignments()
            }
          }, error => {
            if (this.getDeleteIds.deleteSelected.length == 0) {
              this.status = false

            }
            else {
              if (this.getDeleteIds.deleteSelected.length == 0) {
                this.status = false
              }
              else {
                this.status = true
              }
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
      if (allSelected === undefined || allSelected.length == 0) {
        req2 = this.getDeleteIds.deleteSelected;
        this.getDeleteIds.emptyArray = true
      } else {
        req2 = this.getDeleteIds.deleteAll;
	  }
	  if(req2.length==0)
	  {
		this.toastrService.error("Kindly select atleast one appointment", 'Error');
		return;
	  }
      var sendThisClinic;
    //   if (this.autoResOnClinic == undefined) {
    //     sendThisClinic = 0
    //   } else {
    //     sendThisClinic = 1
    //   }
      if (this.deleteForRecOrSpecCheck == AccordianEnum.subsequentAssignment) {
        reqObj = {
		  "appointment_ids": req2,
		  "facility_location_tpye":this.autoResOnClinic,
		  "available_doctor_id":this.SupervisorService.currentDeleteAppointment.current_dateList_event.available_doctor_id
        //   "clinic": sendThisClinic,
        //   "recId": this.SupervisorService.currentDeleteAppointment.recId
        }
        if (reqObj.recId == null) {
          delete reqObj.recId;
        }
      }
      else {
        reqObj = {
          "appointment_ids": req2,
		//   "clinic": sendThisClinic,
		'facility_location_tpye':this.autoResOnClinic
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
            this.toastrService.success('Successfully Resolved', 'Success')
            if (this.deleteForRecOrSpecCheck ==AccordianEnum.subsequentAssignment) {
              this.getRecAssignments()
            } else {
              this.getDocAssignments()
            }
            this.getDeleteIds.UpdatedSpecIds();
          }, error => {
            if (this.getDeleteIds.deleteSelected.length == 0) {
              this.status = false
            }
            else {
              this.status = true
            }
            this.getDeleteIds.UpdatedSpecIds();
          });
      if (this.data == '' || this.data == undefined || this.data == null) {
        this.getDeleteIds.deleteStatus(false);
      } else {
        this.getDeleteIds.deleteStatus(true)
      }
    }
  }
  
  /*Choose other comment option for commenting*/
  public commentOtherOption() {
  let value=this.myForm.get('defaultComments').value
  if (value && value=='Other') {
      this.isOtherChecked = false;
    }
    else
    {
      this.isOtherChecked = true;
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
	  this.disableDeleteBtnOnDelete=true
    var req;
	if(this.deleteForRecOrSpecCheck == AccordianEnum.thisAssignment)
	{
		req={
			date_list_id:this.SupervisorService.currentDeleteAppointment.current_dateList_event.id,
			available_doctor_id:this.SupervisorService.currentDeleteAppointment.current_dateList_event.available_doctor_id
		}
	}
	else
	{
		req={
			available_doctor_id:this.SupervisorService.currentDeleteAppointment.current_dateList_event.available_doctor_id
		}
	}
    this.requestService
      .sendRequest(
        AssignDoctorUrlsEnum.deleteDoctorAssignment,
        'DELETE',
        REQUEST_SERVERS.schedulerApiUrl1,
        req
      ).subscribe(
        (result: HttpSuccessResponse) => {
          this.toastrService.success('Assignment Deleted Successfully', 'Success')
          this.getDeleteIds.deleteSelected = []
          this.activeModal.close();
		  this._subjectService.refreshUpdate('accordin');
		  this.disableDeleteBtnOnDelete=false

        },err=>{
			if(err.status != 406)
			{
				this.toastrService.success(err.error.message, 'Error')
				this.disableDeleteBtnOnDelete=false;

			}
		});

  }
  /*Form cancellation function*/
  public cancelForm() {
    this.getDeleteIds.deleteSelected = []
    this.activeModal.close();
    this.getDeleteIds.editStatus(false)
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
