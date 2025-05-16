import { DatePipeFormatService } from './../../../../../shared/services/datePipe-format.service';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { HttpSuccessResponse, StorageData } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { AssignDoctorUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-doctor/assign-doctor-urls-enum';
import { AssignRoomsUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-rooms/assign-rooms-urls-enum';
import { Pagination } from '@appDir/shared/models/pagination';
import { AclService } from '@appDir/shared/services/acl.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AssignSpecialityUrlsEnum } from '../../assign-speciality-urls-enum';
import { AppointmentCancelCommentModel } from '../accordian/appoinment-cancel-comment-model';
import { ReplaceAccordianService } from './services/replace-accordian.service';
import { convertDateTimeForRetrieving, convertDateTimeForSending } from '@appDir/shared/utils/utils.helpers';

@Component({
  selector: 'app-replace-accordian',
  templateUrl: './replace-accordian.component.html',
  styleUrls: ['./replace-accordian.component.scss']
})
export class ReplaceAccordianComponent extends PermissionComponent implements OnInit {

	myForm: FormGroup;
	public data: any;
	public allChecked = false;
	public counter: any = 10;
	public isEnableButtons: any = true;
	public numSelected = 0
	public lastPage: any;
	public entriesOnLastPage: any;
	public counterChecked = 0;
	public pageNumber = 1;
	public deleteIds: number[];
	public deleteStatus: any;
	public comments: string;
	public clinicArray: any;
	public speciality: string = "";
	public selectedClinicId: any;
	public actionOption: any = "Cancel Appointment";
	public isForwardToFrontDesk: any = true;
	public autoResolve: any = true;
	public applyActionCheck: any = 1;
	public status: any = true;
	public deleteButtonStatus: any;
	public disableDeleteBtn:boolean=false
	public allFacilitySupervisorClinicIds: any = [];
	public autoResolveList = [{ 'name': 'Same Location',"value":'same' }, { 'name': 'Any Location ',"value":'any' }];
	public defaultComments : AppointmentCancelCommentModel[]=[];
	public actions = [{ 'name': 'Cancel Appointment', 'id': 1 }, { 'name': 'Forward to Front Desk', 'id': 2 }, { 'name': 'Auto Resolve', 'id': 3 }];
	constructor(aclService: AclService,
		router: Router,
		protected requestService: RequestService,
		private formBuilder: FormBuilder,
		public activeModal: NgbActiveModal,
		private storageData: StorageData,
		public http: HttpClient,
	    public replaceAccordianService: ReplaceAccordianService,
		public datePipeService: DatePipeFormatService,
		private toastrService: ToastrService,) {
		super(aclService, router);
		
	  }
	ngOnInit(): void {
		this.createForm();
		this.myForm.patchValue({
			speciality:this.replaceAccordianService.speciality_name,
			practice_location:this.replaceAccordianService.Practice_location,
			auto_resolve_on_clinic:this.autoResolveList[0].value,
			action:this.actions[0].id
		})
	//   this.autoResOnClinic=this.autoResolveList[0].value;
	  this.requestService
		.sendRequest(
		  AssignSpecialityUrlsEnum.Default_Comments,
		  'GET',
		  REQUEST_SERVERS.schedulerApiUrl1,
		).subscribe(
		  (res: HttpSuccessResponse) => {
			//
			this.defaultComments=res.result.data.filter(defaultComment=>defaultComment.type_id &&(defaultComment.type_id==1 || defaultComment.type_id==3) )
			if(this.defaultComments && this.defaultComments.length>0)
			{
			  this.myForm.controls['defaultComments'].setValue(this.defaultComments[0].name)
  
			}
		  })
	  this.getDocAssignments()
	  this.allFacilitySupervisorClinicIds = this.storageData.getFacilityLocations()
	  this.requestService
		.sendRequest(
		  AssignSpecialityUrlsEnum.getUserInfobyFacility,
		  'POST',
		  REQUEST_SERVERS.schedulerApiUrl1,
		  { 'facility_location_ids': this.allFacilitySupervisorClinicIds ,
			  per_page: Pagination.per_page,
			  page:1,
			  pagination:true}
		).subscribe(
		  (response: HttpSuccessResponse) => {
			this.clinicArray = response.result.data.docs;
			if(this.clinicArray.length>0)
			{

			}
			this.myForm.patchValue({'target_clinic_id':this.clinicArray[0].id}) 
		  }, error => {
		  });
	  
	  this.myForm.controls['actionOption'].setValue("Cancel Appointment")
	
	}
	
	/*Form intilaization function*/
	private createForm() {
	  this.myForm = this.formBuilder.group({
		  speciality:[''],
		  practice_location:[''],
		action:[''],
		actionOption: 'Cancel Appointment',
		defaultCommentsOption: ['default'],
		defaultComments: '',
		otherComments: '',
		target_clinic_id:[''],
		auto_resolve_on_clinic:[]
	  });
	}
	/*Get doctor appointments in this assignment*/
	public getDocAssignments() {
	  this.requestService
		.sendRequest(
		  AssignSpecialityUrlsEnum.getProviderSpecificAppointment,
		  'POST',
		  REQUEST_SERVERS.schedulerApiUrl1,
		  {
			available_doctor_id:this.replaceAccordianService.conflictedProviderAssignment.id,
			start_date:convertDateTimeForSending(this.storageData,new Date(this.replaceAccordianService.conflictedProviderAssignment.start_date)),
			end_date:convertDateTimeForSending(this.storageData,new Date(this.replaceAccordianService.conflictedProviderAssignment.end_date))
		  }
		).subscribe(
		  (response: HttpSuccessResponse) => {
			this.data = response.result.data;
			// this.getVisitSession();
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
			// this.getDeleteIds.AppointmentWithSpecId(response.result.data);
		  }, error => {
			this.data = [];
			// this.getDeleteIds.AppointmentWithSpecId(this.data);
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
	  if (appointment_ids&&appointment_ids.length>0)
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
  
	/*This assignment(i.e get appointments for this partiular assignment) option function*/
	 /*This assignment(i.e get appointments for this partiular assignment) option function*/
  
	/*All appointment selection from table to perform  certain actions against appointments*/
	public allSelected(e) {
	  this.counterChecked = 0;
	  if (e.checked) {
		this.status = true;
		this.isEnableButtons = false;
		this.allChecked = true;
		let start = this.counter * (this.pageNumber - 1);
		for (var i = start; i < (start + this.counter); i++) {
		  if (this.data[i] != undefined) {
			if (this.data[i]['isChecked'] == false) {
			  this.data[i]['isChecked'] = true;
			  this.replaceAccordianService.deleteSelectedAppointmentIds[this.numSelected] = this.data[i].id
			  this.numSelected++;
			  this.counterChecked++;
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
			  // this.getDeleteIds.deleteSelected.splice(this.getDeleteIds.deleteSelected.indexOf(this.data[i].id), 1)
		   this.replaceAccordianService.deleteSelectedAppointmentIds.splice(this.replaceAccordianService.deleteSelectedAppointmentIds.indexOf(this.data[i].id), 1)
  
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
	//   this.getDeleteIds.editStatus(!this.isEnableButtons)
	}
	/*Particular appointment selection from table to perform  certain action against appointments*/
	public particularSelected(e, u) {
	  var singleSelectionStatus;
	  if (e.checked) {
		this.status = true;
		this.isEnableButtons = false;
		this.numSelected = this.numSelected + 1;
	this.counterChecked++;
		this.replaceAccordianService.deleteSelectedAppointmentIds.push(u.id)
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
		this.status = false;
		this.numSelected = this.numSelected - 1;
		this.allChecked = false
		if (this.numSelected <= 0) {
		  this.isEnableButtons = true;
		  this.numSelected = 0;
		}
		this.replaceAccordianService.deleteSelectedAppointmentIds.splice(this.replaceAccordianService.deleteSelectedAppointmentIds.indexOf(u.id), 1)
			this.counterChecked--;
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
	/*Actions options against appointment(i.e auto reslove,cancel,forward to front desk)*/
	public changeAppointmentsAction() {
		let action=this.myForm.get('action').value;
	  if (action == 2) {
		this.isForwardToFrontDesk = false;
		this.autoResolve = true;
		this.applyActionCheck = 2;  // if forwardtoFD selected bcz 2 is ID of forwardToFD check array line 36
	  }
	  else if (action == 3) {
		this.autoResolve = false;
		this.isForwardToFrontDesk = true;
		this.applyActionCheck = 3;  // if autoResolve selected bcz 3 is ID of autoRes check array line 36
	  } else {
		this.isForwardToFrontDesk = true;
		this.autoResolve = true;
		this.applyActionCheck = 1; // if cancelAssign selected bcz 1 is ID of cancelAssi check array line 36
	  }
  
	}
	/*Solve appointment against particular action*/
	public applyAppointmentAction() {
		let isOtherChecked=this.myForm.get('defaultComments').value=='Other'?true:false
	  if (isOtherChecked) {
		this.comments = this.myForm.get('otherComments').value;
	  }
	  else {
		this.comments = this.myForm.get('defaultComments').value;
	  }
	  if (this.comments == '') {
		this.comments = 'N/A'
	  }
	  if (this.applyActionCheck == 1) {
		let req={
			appointment_ids:this.replaceAccordianService.deleteSelectedAppointmentIds,
			Cancel_Appointment_new:this.comments
		}
		
		this.requestService
		  .sendRequest(
			AssignSpecialityUrlsEnum.Cancel_Appointment_new,
			'POST',
			REQUEST_SERVERS.schedulerApiUrl1,
			req
		  ).subscribe(
			(result: HttpSuccessResponse) => {
			  this.toastrService.success("Appointment Cancelled Successfully", result.message);
			  this.replaceAccordianService.deleteSelectedAppointmentIds=[];
			  this.getDocAssignments();	
			}, error => {
			  this.toastrService.error(error.error.message, 'Error');
			});
	  }
	  else if (this.applyActionCheck == 2) {
		var requestedObject = {
		  "appointment_ids": this.replaceAccordianService.deleteSelectedAppointmentIds,
		  "target_clinic_id": parseInt(this.myForm.get('target_clinic_id').value),
		  "origin_clinic_id": this.replaceAccordianService.conflictedProviderAssignment.facility_id,
		  "comments": this.comments
		};
		this.requestService
		  .sendRequest(
			AssignSpecialityUrlsEnum.Forward_Appointments_FD_new,
			'POST',
			REQUEST_SERVERS.schedulerApiUrl1,
			requestedObject
		  ).subscribe(
			(result: HttpSuccessResponse) => {
			  this.toastrService.success("Appointment forward Successfully", result.message);
			  this.replaceAccordianService.deleteSelectedAppointmentIds=[];
			  this.getDocAssignments();
			}, error => {
			  this.toastrService.error(error.error.message, 'Error');
			
			});
	  }
	  else if (this.applyActionCheck == 3) {
		let req={
			appointment_ids:this.replaceAccordianService.deleteSelectedAppointmentIds,
			facility_location_tpye:this.myForm.get('auto_resolve_on_clinic').value
		}
		this.requestService
		  .sendRequest(
			AssignSpecialityUrlsEnum.resolveSpecialityAppointment,
			'POST',
			REQUEST_SERVERS.schedulerApiUrl1,
			req
		  ).subscribe(
			(result: HttpSuccessResponse) => {
				this.replaceAccordianService.deleteSelectedAppointmentIds=[];
				this.getDocAssignments();
			}, error => {
			});
	  }
	}
	/*Form submitation function*/
	public submitForm() {
		this.disableDeleteBtn=true

		 let  req={
			date_list_id:this.replaceAccordianService.conflictedProviderAssignment.date_list_id,
			available_doctor_id:this.replaceAccordianService.conflictedProviderAssignment.id
		  }
	
	  
	  
	  this.requestService
		.sendRequest(
			AssignDoctorUrlsEnum.deleteDoctorAssignment,
		  'Delete',
		  REQUEST_SERVERS.schedulerApiUrl1,
		  req
		).subscribe(
		  (result: HttpSuccessResponse) => {
			this.toastrService.success("Assignment Deleted Successfully", 'Success')
			// this.getDeleteIds.deleteSelected = []
		  
			this.activeModal.close(true);
			// this._subjectService.refreshUpdate('accordin');
			this.disableDeleteBtn=false
		  }, error => {
			  this.toastrService.success(error.message, 'Error')
			// this.getDeleteIds.deleteSelected = []
			// this.activeModal.close(true);
			this.disableDeleteBtn=false
		  });
  
	}
	/*Form cancellation function*/
	public cancelForm() {
	this.replaceAccordianService.deleteSelectedAppointmentIds=[];
	  this.activeModal.close(false)
	}
  
  

}
