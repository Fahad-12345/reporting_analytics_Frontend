
import { OnInit } from '@angular/core';
import { Component, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DoctorCalendarService } from '../../doctor-calendar.service';
import { SubjectService } from "../../subject.service"
import { ToastrService } from 'ngx-toastr';
import { StorageData, HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { Router } from '@angular/router';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { DoctorCalendarUrlsEnum } from '../../doctor-calendar-urls-enum';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { convertDateTimeForSending } from '@appDir/shared/utils/utils.helpers';
import { map } from 'rxjs';


@Component({
  selector: 'app-unavialability',
  templateUrl: './unavialability.component.html',
  styleUrls: ['./unavialability.component.scss']
})
export class UnavialabilityComponent extends PermissionComponent implements OnInit {
  myForm: FormGroup;
  public docName: any;
  public submitted = false;
  public allDoctors: any = [];
  public object:any={};
  public interval: number = 30;
  public speciality: any = [];
  public localStorageId: any;
  public isSupervisor: any;
  public startDate: Date;
  public endDate: Date;
  public startTime: Date
  public endTime: Date
  public minDate: Date;
  public minTime: Date;
  //values from calendar cell
  public cellSpeciality: any;
  public cellClinic: any;
  public assignClinics: any;
  public allClinicIds = [];
  addFalse: boolean = false;
  currentDId: any;
  ngOnInit() {
    let docs = this.DoctorCalendarService.currentDoc;
    for (let i = 0; i < docs.length; i++) {
      if (docs[i].doctor) {
		// this.currentDId = docs[i].id;
		this.currentDId = docs[i].user_id;
        break;
      }
    }
    this.assignClinics = [];
    this.speciality = [];
    this.docName = this.subjectService.docName;
    this.startDate = new Date()
    this.endDate = new Date()
    this.minDate = new Date(this.startDate);
    this.startTime = new Date()
    this.endTime = new Date()
    this.startTime.setHours(this.startDate.getHours());
    this.startTime.setMinutes(this.startDate.getMinutes())
    this.endTime.setHours(this.startDate.getHours() + 1);
    this.endTime.setMinutes(this.startDate.getMinutes());
    this.minTime = new Date(this.startTime);
    this.addFalse = false;

  }
  constructor(aclService: AclService,
    router: Router,
    private appointedModalService: NgbModal,
    protected requestService: RequestService,
    private formBuilder: FormBuilder, public toastrService: ToastrService,
    public activeModal: NgbActiveModal,
    public subjectService: SubjectService,
    private storageData: StorageData,
    public DoctorCalendarService: DoctorCalendarService) {
    super(aclService, router);

    this.createForm();
    this.localStorageId = JSON.stringify(this.storageData.getUserId());
    if (this.aclService.hasPermission(this.userPermissions.unavailability_add)) {
      this.allClinicIds = this.storageData.getFacilityLocations();
    }
    //role id=3 supervisor
    let role = this.storageData.getRole()
    if (role.id === 3
      || this.storageData.isSuperAdmin()) {
      this.isSupervisor = true
    }
    if (!this.aclService.hasPermission(this.userPermissions.unavailability_add)) {
      this.isSupervisor = false
    }
	// if (this.aclService.hasPermission(this.userPermissions.unavailability_add)) {
	// 	this.isSupervisor = true
	//   }
    if (this.isSupervisor) {
    //   this.requestService
    //     .sendRequest(
    //       AddToBeSchedulledUrlsEnum.Get_providers,
    //       'POST',
    //       REQUEST_SERVERS.schedulerApiUrl1,
    //     //   {
    //     //     "clinics": this.allClinicIds
	// 	//   }
	// 	{
	// 		facility_location_ids: this.allClinicIds,
	// 		per_page: Pagination.per_page_Provider,
	// 		page:1,
	// 		pagination:true
	// 	}
    //     ).subscribe(
    //       (res: HttpSuccessResponse) => {
    //         let doc = res.result.data.docs;
    //         // for (var i = 0; i < doc.length; i++) {
    //         //   doc[i]["doctor"]["id"] = doc[i]["docId"]
    //         //   this.allDoctors[i] = doc[i]['doctor']
	// 		// }
	// 		this.allDoctors=doc;
    //         if (this.currentDId) {
    //           this.myForm.controls['doctorName'].setValue(this.currentDId);
    //         } else {
    //           this.myForm.controls['doctorName'].setValue(this.allDoctors[0].user_id);
    //         }
	//       });
	this.searchProvider();
    }
  }

  searchProvider(name?, id?) {
	let paramQuery: ParamQuery = {
		order: OrderEnum.ASC,
		pagination: false,
		filter: false,
		// per_page: 10,
		// page: 1,
	};
	// let filter = {};
	// id ? (filter['id'] = id) : name ? (filter['doctor_name'] = name) : '';
	// id || name ? (paramQuery.filter = true) : '';
	this.requestService
		.sendRequest('search_doctor', 'GET', REQUEST_SERVERS.fd_api_url, 
		{ ...paramQuery, 
			// ...filter 
		}).pipe(
		map((response) => {
			let data = response['result']['data'];
			data.map((provider) => {
				provider['name'] = `${provider.first_name} ${
					provider.middle_name ? provider.middle_name : ''
				} ${provider.last_name}`;
			});
			return data;
		}))
		.subscribe((data) => {
			this.allDoctors = data;
			if (this.currentDId) {
				          this.myForm.controls['doctorName'].setValue(this.currentDId);
				        } else {
				          this.myForm.controls['doctorName'].setValue('');
				        }
			// this.subject.next(this.lstProviders);
		});
}
  public changeStartDate() {
    if (this.startDate === null) {
      // this.toastrService.error("Start Date is required", 'Error')
      return;
    }
    this.minDate = new Date(this.startDate);
    if (this.endDate < this.minDate) {
      this.endDate = this.minDate;
    }
  }

  onChangeStartDate(event)
	{
		debugger;
		
		if(event.dateValue)
		{
			
			  this.startDate=new Date(event.dateValue)
			  this.changeStartDate()
		} 
		else
		{
			
			this.startDate=null
		}
	}
	onChangeEndtDate(event)
	{
		debugger;
		
		if(event.dateValue)
		{
			
			  this.endDate=new Date(event.dateValue)
			  this.changeEndDate()
		} 
		else
		{
			
			this.endDate=null
		}
	}
  public changeEndDate() {
    if (this.endDate === null) {
      // this.toastrService.error("End Date is required", 'Error')
      return;
    }
    if ((this.startDate.getDate() == this.endDate.getDate()) && (this.startDate.getMonth() == this.endDate.getMonth()) && (this.startDate.getFullYear() == this.endDate.getFullYear())) {
      this.startTime.setDate(this.startDate.getDate());
      this.startTime.setMonth(this.startDate.getMonth());
      this.startTime.setFullYear(this.startDate.getFullYear());
      this.endDate.setHours(this.startDate.getHours() + 1)
      this.endDate.setMinutes(this.startDate.getMinutes())
      this.minTime = new Date(this.startTime);
    }
    else {
      this.endDate.setHours(0)
      this.endDate.setMinutes(0)
      this.endTime.setDate(this.endDate.getDate());
      this.endTime.setMonth(this.endDate.getMonth());
      this.endTime.setFullYear(this.endDate.getFullYear());
      this.minTime = new Date(this.endDate);
      if (this.endDate != null) {
        if (this.endDate.getTime() < this.minDate.getTime()) {
          this.toastrService.error("Pick end date with respect to start date", 'Error')
          return;
        }
      }
    }

  }
  public changeStartTime() {
    if (this.startTime === null) {
      // this.toastrService.error("Start time is required", 'Error')
      return;
    }
    this.startTime.setDate(this.startDate.getDate());
    this.startTime.setMonth(this.startDate.getMonth());
    this.startTime.setFullYear(this.startDate.getFullYear());
    this.startDate.setHours(this.startTime.getHours());
    this.startDate.setMinutes(this.startTime.getMinutes());
    this.endDate.setHours(this.endTime.getHours());
    this.endDate.setMinutes(this.endTime.getMinutes());
    if ((this.startDate.getDate() == this.endDate.getDate()) && (this.startDate.getMonth() == this.endDate.getMonth()) && (this.startDate.getFullYear() == this.endDate.getFullYear())) {
      this.minTime = new Date(this.startTime);
    }
    else {
      this.minTime.setHours(0);
      this.minTime.setMinutes(0);
    }
    this.minDate = new Date(this.minTime);
  }
  public changeEndTime() {

    if (this.endTime != null) {
      this.endTime.setDate(this.endDate.getDate());
      this.endTime.setMonth(this.endDate.getMonth());
      this.endTime.setFullYear(this.endDate.getFullYear());
      this.startDate.setHours(this.startTime.getHours());
      this.startDate.setMinutes(this.startTime.getMinutes());
      this.endDate.setHours(this.endTime.getHours());
      this.endDate.setMinutes(this.endTime.getMinutes());
      this.minDate = new Date(this.minTime);
      if (this.endTime.getTime() <= this.minTime.getTime()) {
        this.toastrService.error("Pick end Time with respect to start", 'Error')
        return;
      }
    }
    else {
      // this.toastrService.error("End time is mandatory", 'Error')
      return;
    }
  }
  private createForm() {
    this.myForm = this.formBuilder.group({
      subject: ['', [Validators.required, Validators.minLength(0)]],
      descrpition: ['', [Validators.required, Validators.minLength(0), Validators.maxLength(512)]],
      doctorName: ['',Validators.required],
    });
  }
  get f() { return this.myForm.controls }
  public addUnavailability() {
    this.submitted = true;
	if (!this.isSupervisor) {
        this.myForm.get('doctorName').setValue(this.localStorageId);
      } 

    if (this.myForm.invalid) {
      return;
    }
    if (this.startDate === null) {
      // this.toastrService.error("Start Date is required", 'Error')
      return;
    }
    if (this.endDate === null) {
      // this.toastrService.error("End Date is required", 'Error')
      return;
    }
    if (this.startTime === null) {
      // this.toastrService.error("Start time is required", 'Error')
      return;
    }
    if (this.endTime === null) {
      // this.toastrService.error("End time is mandatory", 'Error')
      return;
    }
    if (this.endDate.getDay() < this.minDate.getDay() && this.endDate.getMonth() < this.minDate.getMonth() && this.endDate.getFullYear() < this.minDate.getFullYear()) {
      this.toastrService.error("Pick end date with respect to start date", 'Error')
      return;
    }
    if (this.endTime.getHours() <= this.minTime.getHours() && this.endTime.getMinutes() <= this.minTime.getMinutes()) {
      this.toastrService.error("Pick end time with respect to start time", 'Error')
      return;
    }
    else {
      this.addFalse = true;
      this.startDate = new Date(this.startDate);
      this.startDate.setSeconds(0)
      this.endDate = new Date(this.endDate);
      this.endDate.setSeconds(0)
      this.minDate.setSeconds(0)
      this.startTime = new Date(this.startTime);
      this.endTime = new Date(this.endTime);
      this.startDate.setHours(this.startTime.getHours());
      this.startDate.setMinutes(this.startTime.getMinutes());
      this.endDate.setHours(this.endTime.getHours());
      this.endDate.setMinutes(this.endTime.getMinutes());
      this.object.start_date = convertDateTimeForSending(this.storageData, this.startDate);
      this.object.end_date = convertDateTimeForSending(this.storageData, this.endDate);
      this.object.subject = this.myForm.get('subject').value.replace(/['"]+/g, '');;
      this.object.description = this.myForm.get('descrpition').value.replace(/['"]+/g, '');
      if (this.isSupervisor) {
        this.object.doctor_id = parseInt(this.myForm.get('doctorName').value);
      } else {
        this.object.doctor_id = this.localStorageId
      }

      this.requestService
        .sendRequest(
          DoctorCalendarUrlsEnum.addDoctorUnavailability,
          'POST',
          REQUEST_SERVERS.schedulerApiUrl1,
          this.object
        ).subscribe(
          (res: HttpSuccessResponse) => {
            this.toastrService.success("Unavailability Successfully Added", 'Success')
            this.activeModal.close();
            this.subjectService.refresh('unavailb')
          }, error => {
            this.activeModal.close();

          });
    }
  }
}


