import { MappingFilterObject } from '@appDir/shared/filter/model/mapping-filter-object';
import { convertDateTimeForRetrieving, getIdsFromArray, makeDeepCopyArray, removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
import { EnumApiPath } from '@appDir/front-desk/billing/Models/searchedKeys-modal';
import { DatePipeFormatService } from './../../../../../shared/services/datePipe-format.service';
import { Socket } from 'ngx-socket-io';

import { FacilityUrlsEnum } from '@appDir/front-desk/masters/practice/practice/utils/facility-urls-enum';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
//service
import { AppointmentService } from '@shared/modules/appointment/appointment.service';
import { SchedulingQueueService } from '@shared/modules/appointment/scheduling-queue/scheduling-queue.service';
import { FrontDeskService } from '../../../../front-desk.service';
//modalsg
import { CancelAppointmentDetailsComponent } from '../../modals/cancel-appointment-details/cancel-appointment-details.component';
import { DoctorCalendarService } from '@shared/modules/doctor-calendar/doctor-calendar.service';
import { SubjectService } from '@shared/modules/doctor-calendar/subject.service';
import { AppointmentSubjectService } from '@shared/modules/appointment/subject.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { AddToBeSchedulledUrlsEnum } from '../../add-to-be-scheduled-list-urls-enum';
import { AssignSpecialityUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
import {AclServiceCustom} from '../../../../../acl-custom.service';
import { Page } from '@appDir/front-desk/models/page';
import { NgFilterService } from '@appDir/shared/services/ng-filter.service';
import { map, Subject, Subscription } from 'rxjs';
import { ConvertToISOWithoutChangingDateTime, unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
import { EnumApiPathScheduler } from '@appDir/scheduler-front-desk/enums/enum-api-paths';
import { ShareAbleFilter } from '@appDir/shared/models/share-able-filter';
import { AppointmentUrlsEnum } from '@appDir/shared/modules/appointment/appointment-urls-enum';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent extends PermissionComponent implements OnInit {
  myForm: FormGroup;
  public temp = [];
  public  allowSpecs = false;
  public allowProv = false;
  public allowApp = false;
  public allowTar = false;
  public allowCase = false;
  public allSpec = [];
  public counter: any = 10;
  public pageNumber = 1;
  public lastPage: any;
  public deleteAll: any = [];
  public entriesOnLastPage: any;
  public counterChecked = 0;
  public allData: any = [];
  public allChecked = false;
  public allClinic = [];
  public isEnableButtons: any = true;
  public allClinicIds: any = [];
  public numSelected = 0;
  public visitType = [];
  public visitStatus = [];
  public caseType = [];
  public isOpenFilters: any = true;
  public allDoctors: any = [];
  public currentDateTime: Date;
  public endDateTime: Date;
  min: Date= new Date('1900/01/01');
  public deleteDisable: boolean = true;
  public scheduleDisable: boolean = true;
  public data = [];
  public visitTypeFilter: any = "Visit Type";
  public visitStatusFilter: any = "Visit Status";
  public scheduleTypeFilter: any = "Schedule Type";
  public caseTypeFilter: any = "Case Type";
  public startDate:Date = new Date();
  public endDate = new Date();
 public re_refreher;
 page: Page;

  //Filter Times..hhh
  createdAtDateTimeFrom; //Forwarded From
  createdAtDateTimeTo; //Forwarded To
  startDateTimeFrom;
  startDateTimeTo;
	specSelectedMultiple: any;
	docSelectedMultiple: any;
	clinicSelectedMultiple: any;
	appTypeSelectedMultiple: any;
	visitStatusSelectedMultiple: any;
	caseTypeSelectedMultiple: any;
	caseIds:any[]=[]
	offset :number = 0;
  totalRecord:number = 0;
  requestObject = {};
  subscription: Subscription[] = [];
  loadSpin = false;
  selectedMultipleFieldFiter: any = {
	case_ids: [],
  };
  EnumApiPath=EnumApiPathScheduler;
  conditionalExtraApiParams:any={
    order_by:OrderEnum.ASC
  }
  apiPath=REQUEST_SERVERS.kios_api_path
  eventsSubject: Subject<any> = new Subject<any>();
  EnumApiPathFilter = EnumApiPath;
  @ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
  @ViewChild('rescheduleList') rescheduleListTable: DatatableComponent;
  customizedColumnComp: CustomizeColumnComponent;
  @ViewChild(CustomizeColumnComponent) set con(con: CustomizeColumnComponent) {
    if (con) { // initially setter gets called with undefined
      this.customizedColumnComp = con;
    }
  }
	modalCols :any[] = [];
	columns: any[] = [];
	alphabeticColumns:any[] =[];
  colSelected: boolean = true;
  isAllFalse: boolean = false;
  reSceduleListingTable: any;

  constructor(aclService: AclService,
    router: Router, protected requestService: RequestService,
    private customDiallogService: CustomDiallogService,
    public schedulingService: SchedulingQueueService,
    public openModal: NgbModal,
    public aclCustom : AclServiceCustom,
    public AppointmentService: AppointmentService,
    public cdr: ChangeDetectorRef,
    private toastrService: ToastrService,
    public frontDeskService: FrontDeskService,
    public appointmentSubjectService: AppointmentSubjectService,
    public updateModal: NgbModal,
    public doctorSubjectService: SubjectService,
    public doctorCalendarService: DoctorCalendarService,
    public formBuilder: FormBuilder,
    public _router: Router,
    titleService: Title,
    private _route: ActivatedRoute,
	private storageData: StorageData,
	private socket:Socket,
	public datePipeService:DatePipeFormatService,
  public ngFilterService: NgFilterService,
  private modalService: NgbModal,
  private localStorage: LocalStorage
  
  ) {
    super(aclService, router, _route, requestService, titleService);
              if (this.aclService.hasPermission(this.userPermissions.schedule_list_view)
                || this.storageData.isSuperAdmin()) {
	this.page = new Page();
	this.page.pageNumber = 0;
	this.page.size = 10;
    this.currentDateTime = new Date();
    this.endDateTime = new Date();
    this.getClinic();
    this.getDoctors();
    this.getSpeciality();
    this.getCaseType();
	this.getAllStatus();
	let  params = {
		page:1
	};
	this.setPageAndGetAppointment({ offset: 0 })
    this.getAllAppointmentType();
    this.createForm();
                }          
  }

  ngOnDestroy()
  {
	this.socket.removeListener('CHANGEINAPPOINTMENTS');
	unSubAllPrevious(this.subscription);
  }
  
  ngOnInit() {
	let params = {
		page:1
	};
	this.socket.on('CHANGEINAPPOINTMENTS', (message) => {
		if(this.aclService.hasPermission(this.userPermissions.schedule_list_filter))
		{
			this.setPageAndGetAppointment({ offset: 0 })
		}
	});
                  this.startDate.setHours(0);
                  this.startDate.setMinutes(0);
                  this.startDate.setSeconds(0);
                  this.endDate.setHours(23);
                  this.endDate.setMinutes(59);
                  this.endDate.setSeconds(59);
                  if (this.aclService.hasPermission(this.userPermissions.schedule_list_view)
                || this.storageData.isSuperAdmin()) {
                  
    this.setTitle();
    this.subscription.push(this.doctorSubjectService.cast.subscribe(res => {
      if (res == 'delete') {
		this.deleteAll = [];
		this.setPageAndGetAppointment({ offset: 0 })
      }
    }));
	this.subscription.push( this.appointmentSubjectService.castAppointment.subscribe(res => {
      if (res == 'Appointment Updated') {
		this.setPageAndGetAppointment({ offset: 0 })
      }
    }));
	this.subscription.push( this.appointmentSubjectService.castWaititngList.subscribe(res => {
      if (res == 'true') {
		this.setPageAndGetAppointment({ offset: 0 })
      }
    }));
    }
    this.reSceduleListingTable = this.localStorage.getObject('reScheduleTableList' + this.storageData.getUserId());
  }
  ngAfterViewInit() {
    if (this.rescheduleListTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.rescheduleListTable._internalColumns]);
			this.columns.forEach(element => {
				if(this.reSceduleListingTable.length) {
					let obj = this.reSceduleListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.reSceduleListingTable.length) {
				const nameToIndexMap = {};
				this.reSceduleListingTable.forEach((item, index) => {
					nameToIndexMap[item?.header] = index;
				});
				this.columns.sort((a, b) => nameToIndexMap[a?.name] - nameToIndexMap[b?.name]);
			}
			let columns = makeDeepCopyArray(this.columns);
			this.alphabeticColumns = columns.sort(function (a, b) {
				if (a.name < b.name) { return -1; }
				if (a.name > b.name) { return 1; }
				return 0;
			});
			this.onConfirm(false);
		}
  }
  sample()
  {
  }
  onChangeStartdate(event)
  {
	  if(event.dateValue)
	  {
		this.startDate=new Date(event.dateValue);
		this.changeDate();
	  }
	  else
	  {
		this.startDate=event.dateValue;
		this.toastrService.error("Schedule Date From is required", 'Error')
	  }	 
  }
  onChangeEnddate(event)
  {
	  if(event.dateValue)
	  {
		this.endDate=new Date(event.dateValue);
		this.changeDate();
	  }
	  else
	  {
		this.endDate=event.dateValue;
		this.toastrService.error("Schedule Date To is required", 'Error')
	  }	 
  }
  public changeDate() {
    this.startDate.setHours(0);
    this.startDate.setMinutes(0);
    this.startDate.setSeconds(0);
    this.endDate.setHours(23);
    this.endDate.setMinutes(59);
    this.endDate.setSeconds(59);
    let params = {
      page:1
    };
    this.setPageAndGetAppointment({ offset: 0 })
  }
  /*Form intilaization function*/
  private createForm() {
    this.myForm = this.formBuilder.group({
      clinicName: ['Any', Validators.required],
      specialityName: ['Any', Validators.required],
      doctorName: ['Any', Validators.required],
      priorityName: ['Any', Validators.required],
      speciality_ids:[null],
      facility_location_ids:[null],
      appointment_type_ids:[null],
      case_ids:[null],
      doctor_ids:[null],
      case_type_ids:[null],
      created_by_ids:[null],
      updated_by_ids:[null],
      created_at:[null],
      updated_at:[null],
    });
  }
  /*Get all speciality function*/
  public getSpeciality() {
    this.requestService
      .sendRequest(
        AssignSpecialityUrlsEnum.Speciality_list_Get,
        'GET',
        REQUEST_SERVERS.fd_api_url,
      ).subscribe(
        (response: HttpSuccessResponse) => {
		  this.allSpec = response.result && response.result.data ? response.result.data : [];
		  if (this.allSpec.length!=0){
		  this.myForm.controls['specialityName'].setValue(this.allSpec[0].id);
		  }
        }
      );
  }

  getChange($event: any[], fieldName: string) {
	if($event) {
		this.selectedMultipleFieldFiter[fieldName] =  $event.map(
			(data) =>
				new MappingFilterObject(
					data.id,
					data.name,
					data.full_Name,
					data.facility_full_name,
					data.label_id,
					data.insurance_name,
					data.employer_name,
          data.created_by_ids,
          data.updated_by_ids,
				),
		);
	}
}

selectionOnValueChange(e: any,Type?) {
  const info = new ShareAbleFilter(e);
  this.caseIds=info.case_ids;
  this.myForm.patchValue(removeEmptyAndNullsFormObject(info));
  this.getChange(e.data, e.label);

  if(!e.data) {
	this.myForm.controls[Type].setValue(null);
	}

 
}

getDoctors() {
	let paramQuery: ParamQuery = {
		order: OrderEnum.ASC,
		pagination: false,
		filter: false,
		// per_page: 10,
		// page: 1,
	};

	this.requestService
		.sendRequest('search_doctor', 'GET', REQUEST_SERVERS.fd_api_url, 
		{ ...paramQuery, 
			// ...filter 
		})
		.pipe(map((response) => {
			let data = response['result']['data'];
			data.map((provider) => {
				provider['name'] = `${provider?.first_name} ${
					provider?.middle_name ? provider?.middle_name : ''
				} ${provider?.last_name}${
          provider?.medical_identifier && provider?.medical_identifier?.billing_title ? ', '+ provider?.medical_identifier?.billing_title?.name : ''
        }`;
			});
			return data;
		}))
		.subscribe((data) => {
			this.allDoctors = data;
			
		});
}

  /*Get all clinics function*/
  public getClinic() {
    this.allClinicIds = this.storageData.getFacilityLocations();
    this.requestService
      .sendRequest(
		FacilityUrlsEnum.Facility_list_dropdown_GET   ,  'GET',
        REQUEST_SERVERS.fd_api_url,
      ).subscribe(
        (response: HttpSuccessResponse) => {
          this.allClinic = [...response.result.data];
          this.myForm.controls['clinicName'].setValue(this.allClinic[0].id);

        }
      );
  }
  /*Get all appointment types function*/
  public getAllAppointmentType() {
    this.requestService
      .sendRequest(
        AddToBeSchedulledUrlsEnum.getAppointmentTypes,
        'GET',
        REQUEST_SERVERS.schedulerApiUrl1,
      ).subscribe(
        (response: HttpSuccessResponse) => {
          for (var i = 0, j = 1; i < response.result.data.length; i++ , j++) {
            this.visitType[i] = response.result.data[i];
          }
          this.visitTypeFilter = this.visitType[0].description;
          this.visitType = [...this.visitType];
        }
      );
  }
  /*Get all case  types function*/
  public getCaseType() {
    this.requestService
      .sendRequest(
        AddToBeSchedulledUrlsEnum.caseTypes,
        'GET',
        REQUEST_SERVERS.kios_api_path,
      ).subscribe(
        (response: any) => {
          for (var i = 0, j = 1; i < response.result.data.length; i++ , j++) {
            this.caseType[i] = response.result.data[i];
          }
          this.caseTypeFilter = this.caseType[0].name;
          this.caseType = [...this.caseType];

        }
      );
  }
  /*Get all status of patients*/
  public getAllStatus() {
    this.requestService
      .sendRequest(
        AddToBeSchedulledUrlsEnum.GetAllStatus,
        'GET',
        REQUEST_SERVERS.kios_api_path,
      ).subscribe(
        (res: any) => {
          for (var i = 0, j = 1; i < res.result.data.length; i++ , j++) {
            this.visitStatus[i] = res.result.data[i];
          }
          this.visitStatusFilter = this.visitStatus[0].name;
          this.visitStatus = [...this.visitStatus];


        });
  }
  /*Get all data of schedule list(appointments that are cancelled or forwarded to front desk*/
  public getAllAppointment(params) {
	  if(!this.startDate)
	  {
		this.toastrService.error("Schedule date is required.", 'Error');
		return ;
	  }

    let reqObject = {
      filters:this.makeObject(params),
      appointment_type: 'RESCHEDULED',
      per_page:params.per_page,
      page:params.page_no ,
      paginate:1
    }
    this.loadSpin = true;
      this.requestService
        .sendRequest(

					AppointmentUrlsEnum.getAppointmentAllDetailsList,
          'POST',
          REQUEST_SERVERS.schedulerApiUrl1,
          reqObject
        ).subscribe(
          (res: HttpSuccessResponse) => {
			this.loadSpin = false;
            this.data = [];
			this.allData=[];
			this.page.totalElements = res.result.data.total ? res.result.data.total : 0;
			  if(res.result && res.result.data && res.result.data.docs && res.result.data.docs.length != 0 ){
            this.deleteAll = [];
            this.isEnableButtons = true;
            this.allChecked = false;
            this.numSelected = 0;
            this.data = res.result.data && res.result.data.docs ?res.result.data.docs:[];
            this.allData = this.data;
            this.data = [...this.data];
		      }
          }, error => {
			  this.loadSpin = false;
            this.data = [];
		  });
  }

  //Change Filter Date
  changeCreatedAtDate(){
    if (this.createdAtDateTimeFrom != null ) {
			this.createdAtDateTimeFrom.setSeconds(0);
      this.createdAtDateTimeFrom.setMilliseconds(0);
    }
    if (this.createdAtDateTimeTo != null ) {
			this.createdAtDateTimeTo.setSeconds(0);
      this.createdAtDateTimeTo.setMilliseconds(0);
      
		}
  }
  changeStartDate(){
    if (this.startDateTimeFrom != null ) {
			this.startDateTimeFrom.setSeconds(0);
			this.startDateTimeFrom.setMilliseconds(0);
    }
    if (this.startDateTimeTo != null ) {
			this.startDateTimeTo.setSeconds(0);
			this.startDateTimeTo.setMilliseconds(0);			
		}
  }

  /*Change visit type function*/
  public visitTypeChange(e) {
    this.visitTypeFilter = e.target.value;
  }
  /*Change visit status function*/
  public visitStatusChange(e) {
    this.visitStatusFilter = e.target.value;
  }
  /*Change case type function*/
  public caseTypeChange(e) {
    this.caseTypeFilter = e.target.value;
  }

  //Check if Arr contains particular value for the particular key
  public contains(arr, key, val) {
    for (var i = 0; i < arr.length; i++) {
      
        if(arr[i][key] === val[key])
        {
          return true;
        }
    }
    return false;
  }

  /*Schedule appointment for patient against specific case*/
  public scheduleAppointment(obj) {
    this.appointmentSubjectService.particularPatientInfo = obj;
    const scheduler = this.storageData.getSchedulerInfo();
    scheduler.patientData = JSON.stringify(obj);
    scheduler.toDelAppId= JSON.stringify(obj);
    scheduler.toDelCheck = true;
    this.storageData.setSchedulerInfo(scheduler);
    this.appointmentSubjectService.refreshScheduler('Scheduler Load');
    this._router.navigate(['/front-desk/cases/edit/' + obj.case_id + '/scheduler']);
  }
  /*Detail of  appointment that are cancelled or forward to frontdesk*/
  public cancelAppointmentDetails(event) {
	  let doctor =
    event && event.doctor_first_name?`${event.doctor_first_name} ${event.doctor_middle_name?event.doctor_middle_name:''} ${event.doctor_first_name}` :'N/A';
      this.frontDeskService.detailsForCancel = {
        "appointmentTitle": event["appointment_title"],
        "chartNo": event["patient_id"],
        "caseId": event["case_id"],
        "caseType": event["case_type"],
		    "doctor": doctor,
        "patientLastName": event["patient_last_name"],
        "patientFirstName": event["patient_first_name"],
        "patientMiddleName": event["patient_middle_name"],
	    	"appointmentType": event['appointment_type_name'],
        "startDateTime": event["scheduled_date_time"],
        "timeSlot": event['time_slots'],
        "appointmentTypeId": event["appointment_type_id"],
		    "deletedAt": event['updated_at'],
	      "clinicName": event['facility_name'] +'-'+event['facility_location_name'],
        "speciality": event && event.speciality_name ? event.speciality_name  : 'N/A',
        "specialityQualifier":event && event.speciality_qualifier ? event.speciality_qualifier  : 'N/A',
        "practiceLocationQualifier":  event['facility_qualifier']+'-'+event['facility_location_qualifier'],
        "deletedBy":  event && event.updated_by_first_name? `${event.updated_by_first_name} ${event.updated_by_middle_name?event.updated_by_middle_name:''} ${event.updated_by_last_name}` : 'N/A',
        "complaint": event['comments'],
      };
	
    const activeModal = this.updateModal.open(CancelAppointmentDetailsComponent, {
      size: 'lg', backdrop: 'static',
      keyboard: true
    });
  }
  /*See more and less functionality for filters*/
  public openAndCloseFilters() {
    this.isOpenFilters = !this.isOpenFilters;
  }
 
  PageLimit($num) {
	  this.page.size = Number($num);
	  this.setPageAndGetAppointment({ offset: 0 });
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
      this.allChecked = false;
    }
  }
  FilterSubmit(pageInfo) {
	  debugger;
	this.setPageAndGetAppointment(pageInfo);
  }
  setPageAndGetAppointment(pageInfo) {
	let pageNum;
	// this.selection.clear();
	pageNum = pageInfo.offset;
	this.page.pageNumber = pageInfo.offset;
	const pageNumber = this.page.pageNumber + 1;
	let per_page = this.page.size;
	let queryparam = { per_page:per_page, page_no: pageNumber }
	this.getAllAppointment(queryparam);
}
  /*Particular appointment selected from table to perform  certain action against appointments*/
  public particularSelected(data, e) {
    if (e.checked) {
      this.isEnableButtons = false;
      this.numSelected = this.numSelected + 1;

      for (var i = 0; i < this.data.length; i++) {
        if (data.id == this.data[i].id) {
          data.isChecked = true;
          this.deleteAll.push(this.data[i].id);
          this.data[i]['isChecked'] = true;
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
        this.allChecked = false;
      }
    }
    else {
      this.numSelected = this.numSelected - 1;
      this.allChecked = false;
      if (this.numSelected <= 0) {
        this.isEnableButtons = true;
        this.numSelected = 0;
      }
      for (var i = 0; i < this.data.length; i++) {
        if (data.id == this.data[i].id) {
          data.isChecked = false;
          this.data[i]['isChecked'] = false;
          this.deleteAll.splice(this.deleteAll.indexOf(this.data[i].id), 1);
          this.counterChecked--;
          break;
        }
      }
    }
  }
  /*All appointment selected from table to perform  certain actions against appointments*/
  public allSelected(e) {
    this.counterChecked = 0;
    if (e.checked) {
      this.isEnableButtons = false;
      this.allChecked = true;
      let start = this.counter * (this.pageNumber - 1);
      for (var i = start; i < (start + this.counter); i++) {
        if (this.data[i] != undefined) {
          if (this.data[i]['isChecked'] == false) {
            this.data[i]['isChecked'] = true;
            this.deleteAll.push(this.data[i].id);
            this.numSelected++;
            this.counterChecked++;
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
            this.deleteAll.splice(this.deleteAll.indexOf(this.data[i].id), 1);
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
  }
  /*Reset filters*/
  public resetFilters() {
    this.data = []
    this.allData;[]
     this.startDate = new Date();
    this.isEnableButtons = true;
    this.allChecked = false;
    this.numSelected = 0;
    this.counterChecked = 0;
    this.myForm.controls['clinicName'].setValue(this.allClinic[0].id);
    this.myForm.controls['doctorName'].setValue(this.allDoctors[0].user_id);
    this.myForm.controls['specialityName'].setValue(this.allSpec[0].id);
    this.myForm.controls['appointment_type_ids'].setValue(null);
    this.myForm.controls['speciality_ids'].setValue(null);
    this.myForm.controls['facility_location_ids'].setValue(null);
    this.myForm.controls['case_ids'].setValue(null);
    this.myForm.controls['doctor_ids'].setValue(null);
    this.myForm.controls['created_by_ids'].setValue(null);
    this.myForm.controls['created_at'].setValue(null);
    this.myForm.controls['updated_at'].setValue(null);
    this.myForm.controls['updated_by_ids'].setValue(null);
    this.myForm.controls['case_type_ids'].setValue(null);

    this.visitTypeFilter = this.visitType[0].description;
    this.visitStatusFilter = this.visitStatus[0].name;
    this.caseTypeFilter = this.caseType[0].name;
    this.startDateTimeFrom = null;
    this.startDateTimeTo = null;
    this.createdAtDateTimeFrom = null;
    this.createdAtDateTimeTo = null;
    this.specSelectedMultiple = null;
	this.docSelectedMultiple = null;
	this.clinicSelectedMultiple= null;
	this.appTypeSelectedMultiple= null;
	this.visitStatusSelectedMultiple= null;
	this.caseTypeSelectedMultiple= null;
	this.eventsSubject.next(true);
	this.caseIds=[];

	this.changeDate();
  }
  /*Delete particular appointment*/
  public deleteParticularAppointment(id) {

    this.customDiallogService.confirm('Delete','Are you sure you want to delete?','Yes','No')
		.then((confirmed) => {
			this.loadSpin = true;
			if (confirmed){
        this.requestService
        .sendRequest(
          AddToBeSchedulledUrlsEnum.deleteAppointment,
          'delete_with_body',
          REQUEST_SERVERS.schedulerApiUrl1,
          {
            "appointment_ids": [id]
          }
        ).subscribe(
          (res: HttpSuccessResponse) => {
      this.toastrService.success('Deleted Successfully', 'Success');
      let params = {
      page:1
    };
    this.setPageAndGetAppointment({ offset: 0 })
          },error=>{
      this.toastrService.error(error.error.message, 'Error');
    });
			}else if(confirmed === false){
			}else{
				this.loadSpin = false;
			}
		})
		.catch();
  }
  /*Delete all  appointments*/
  public deleteAllAppointment() {
    this.customDiallogService.confirm('Delete','Are you sure you want to delete?','Yes','No')
		.then((confirmed) => {
			if (confirmed){
        this.requestService
        .sendRequest(
          AddToBeSchedulledUrlsEnum.deleteAppointment,
          'delete_with_body',
          REQUEST_SERVERS.schedulerApiUrl1,
          {
            "appointment_ids": this.deleteAll
          }
        ).subscribe(
          (res: HttpSuccessResponse) => {
            this.deleteAll = [];
      this.toastrService.success('Deleted Successfully', 'Success');
      let params = {
        page:1
      };
      this.setPageAndGetAppointment({ offset: this.page.pageNumber })
          });
			}else if(confirmed === false){
			}else{
				this.loadSpin = false;
			}
		})
		.catch();
  }

  makeObject(params){
    this.requestObject = {};
	  let st = new Date(this.startDate)
    st.setMinutes(0)
    st.setHours(5)
    let ed = new Date(this.endDate)
    ed.setDate(ed.getDate() + 1);
    ed.setMinutes(59)
    ed.setHours(4);
    ed.setSeconds(59);
    ed.setMilliseconds(0);
    st.setMilliseconds(0)
    if(this.myForm && this.myForm.value && this.myForm.value['speciality_ids'] && this.myForm.value['speciality_ids'].length !=0 ){
      this.requestObject['speciality_ids'] = this.myForm.value['speciality_ids'] ;
    }
    if(this.myForm && this.myForm.value && this.myForm.value['appointment_type_ids'] && this.myForm.value['appointment_type_ids'].length !=0 ){
      this.requestObject['appointment_type_ids'] = this.myForm.value['appointment_type_ids'] ;
     }
    if(this.myForm && this.myForm.value && this.myForm.value['created_by_ids'] && this.myForm.value['created_by_ids'].length !=0 ){
      this.requestObject['created_by_ids'] = this.myForm.value['created_by_ids'] ;
     }
    if(this.myForm && this.myForm.value && this.myForm.value['created_at'] && this.myForm.value['created_at'].length !=0 ){
      this.requestObject['created_at'] = this.myForm.value['created_at'] ;
    }
    if(this.myForm && this.myForm.value && this.myForm.value['updated_at'] && this.myForm.value['updated_at'].length !=0 ){
      this.requestObject['updated_at'] = this.myForm.value['updated_at'] ;
    }
    if(this.myForm && this.myForm.value && this.myForm.value['updated_by_ids'] && this.myForm.value['updated_by_ids'].length !=0 ){
      this.requestObject['updated_by_ids'] = this.myForm.value['updated_by_ids'] ;
     }
    if(this.myForm && this.myForm.value && this.myForm.value['facility_location_ids'] && this.myForm.value['facility_location_ids'].length !=0 ){
      this.requestObject['facility_location_ids'] = this.myForm.value['facility_location_ids'] ;
    }
    else {
      this.requestObject['facility_location_ids']= 
      this.storageData.getFacilityLocations();
    }
    if( this.myForm && this.myForm.value && this.myForm.value['doctor_ids'] && this.myForm.value['doctor_ids'].length !=0 ){
      this.requestObject['doctor_ids'] = this.myForm.value['doctor_ids'] 
    }
    if( this.myForm && this.myForm.value && this.myForm.value['case_type_ids'] && this.myForm.value['case_type_ids'].length !=0 ){
      this.requestObject['case_type_ids'] = this.myForm.value['case_type_ids'];
    }
    if( this.myForm && this.myForm.value && this.myForm.value['case_ids'] && this.myForm.value['case_ids'].length !=0 ){
      this.requestObject['case_ids'] = [this.myForm.value['case_ids']];
    }
    this.requestObject['start_date'] =  ConvertToISOWithoutChangingDateTime(this.storageData, new Date(st));
    this.requestObject['end_date']  =  ConvertToISOWithoutChangingDateTime(this.storageData, new Date(ed));
    return this.requestObject;
  }

  setActionOfNgDropDown(fieldName: string , action: boolean){
    this.ngFilterService.updateFilterField(fieldName, action);
  }
  checkInputs(){
	if (!this.clinicSelectedMultiple && !this.caseTypeSelectedMultiple && !this.startDate && !this.appTypeSelectedMultiple && !this.docSelectedMultiple && !this.specSelectedMultiple) {
		return true;
	  }
	  return false;
  }

  openCustomoizeColumn(CustomizeColumnModal) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal-lg-package-generate',
		};
		this.modalCols = [];
		let self = this;
		this.columns.forEach(element => {
			let obj = self.alphabeticColumns.find(x => x?.name === element?.name);
			if(obj) {
				this.modalCols.push({ header: element?.name, checked: obj?.checked });
			}
		});
		this.CustomizeColumnModal.show();
	}

	onConfirm(click) {
    if (this.isAllFalse && !this.colSelected){
			this.toastrService.error('At Least 1 Column is Required.','Error');
			return false;
		}
		if(click) {
			this.customizedColumnComp;
			this.modalCols = makeDeepCopyArray(this.customizedColumnComp?.modalCols)
			let data: any = [];
			this.modalCols.forEach(element => {
				if(element?.checked) {
					data.push(element);
				}
				let obj = this.alphabeticColumns.find(x => x?.name === element?.header);
				if (obj) {
					if (obj.name == element.header) {
						obj.checked = element.checked;
					}
				}
			});
			this.localStorage.setObject('reScheduleTableList' + this.storageData.getUserId(), data);
		}
		let groupByHeaderCol = getIdsFromArray(this.modalCols, 'header'); // pick header
		this.columns.sort(function (a, b) {
			return groupByHeaderCol.indexOf(a.name) - groupByHeaderCol.indexOf(b.name);
		});
		//set checked and unchecked on the base modal columns in alphabeticals columns
		this.alphabeticColumns.forEach(element => {
		let currentColumnIndex = findIndexInData(this.columns, 'name', element.name)
			if (currentColumnIndex != -1) {
				this.columns[currentColumnIndex]['checked'] = element.checked;
				this.columns = [...this.columns];
			}
		});
		// show only those columns which is checked
		let columnsBody = makeDeepCopyArray(this.columns);
		this.rescheduleListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.rescheduleListTable._internalColumns.sort(function (a, b) {
			return groupByHeader.indexOf(a.name) - groupByHeader.indexOf(b.name);
		});
		window.dispatchEvent(new Event('resize'));
		this.CustomizeColumnModal.hide();
	}

  onCancel() {
		this.CustomizeColumnModal.hide();
	}

	onSelectHeaders(isChecked) {
		this.colSelected = isChecked;
		if(!isChecked) {
			this.isAllFalse = true;
		}
	}

	onSingleSelection(isChecked) {
		this.isAllFalse = isChecked;
		if(isChecked) {
			this.colSelected = false;
		}
	}

rescheduleHistoryStats(row) {
  const ngbModalOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    windowClass: 'modal_extraDOc body-scroll history-modal',
    modalDialogClass: 'modal-lg'
  };
  let modelRef = this.modalService.open(CreatedHistoryComponent,ngbModalOptions);
  modelRef.componentInstance.createdInformation = [row];
}

}
