import { MappingFilterObject } from '@appDir/shared/filter/model/mapping-filter-object';
import { EnumApiPath } from '@appDir/front-desk/billing/Models/searchedKeys-modal';
import { DatePipeFormatService } from './../../../../../shared/services/datePipe-format.service';
import { Socket } from 'ngx-socket-io';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FrontDeskService } from '../../../../front-desk.service';
import { CancelAppointmentDetailsComponent } from '../../modals/cancel-appointment-details/cancel-appointment-details.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { DoctorCalendarService } from '@shared/modules/doctor-calendar/doctor-calendar.service'
import { SubjectService } from '../../../../subject.service'
import { ToastrService } from 'ngx-toastr';
import { StorageData, HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { Router } from '@angular/router';
import { AssignSpecialityUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { CancelAppointmentListUrlsEnum } from '../../cancel-appointmnet-list-urls-enum';
import {AclServiceCustom} from '../../../../../acl-custom.service'
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { Page } from '@appDir/front-desk/models/page';
import { NgFilterService } from '@appDir/shared/services/ng-filter.service';
import { convertDateTimeForSending, removeEmptyAndNullsFormObject, WithoutTime, isEmptyArray, removeEmptyKeysFromObjectArrays, getIdsFromArray, makeDeepCopyArray} from '@appDir/shared/utils/utils.helpers';
import {  EnumApiPathScheduler } from '@appDir/scheduler-front-desk/enums/enum-api-paths';
import { map, Subject } from 'rxjs';
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
export class HomeComponent extends PermissionComponent implements OnInit,OnDestroy {
  startDateError=false;
  endDateError=false;
  public minDate: Date = new Date('1900/01/01');
  public temp = [];
  public allData: any = []
  public isOpenFilters = true;
  public details: any;
  public deleteAll: any = [];
  public isEnableButtons: any = true;
  public numSelected = 0
  public lastPage: any;
  public entriesOnLastPage: any;
  public counterChecked = 0;
  public pageNumber = 1;
  public allChecked = false;
  public postObject: any = { 'currentDate': '', 'endDate': '', 'clinicId': {} }
  public assignClinics = []
  public assignSpecialities = []
  public assignDoctor = []
  public selectedDoc: any = {}
  public startDate: any = new Date();
  public createdAt: any = new Date();
  public updatedAt: any = new Date();
  public endDate: Date = new Date();
  min: Date= new Date('1900/01/01');
  public data: any = []
  myForm: FormGroup;
  public allClinicIds: any = [];
  public cancel_refresher;
  totalRecord: number;
  WithoutTime = WithoutTime;
  currentDate:Date;
  page: Page;
  todayDate: Date = new Date();
	specSelectedMultiple: any;
	docSelectedMultiple: any;
  clinicSelectedMultiple: any;
  caseIds:any[]=[]
  requestObject: any;
  socketCancelAppointmentEvent:any;
  loadSpin = false;
  selectedMultipleFieldFiter: any = {
	case_ids: []
  };
  EnumApiPath=EnumApiPathScheduler;
  EnumApiPathFilter = EnumApiPath;
  conditionalExtraApiParams:any={
    order_by:OrderEnum.ASC
  }
  apiPath=REQUEST_SERVERS.kios_api_path
  eventsSubject: Subject<any> = new Subject<any>();
  @ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
  @ViewChild('cancelledappList') cancelledApptListTable: DatatableComponent;
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
  cancelledAppListingTable: any;

  constructor(
    aclService: AclService,
    private customDiallogService: CustomDiallogService,
    router: Router,
    private socket:Socket,
    public aclCustom :AclServiceCustom,
    protected requestService: RequestService,
    private toastrService: ToastrService,
    private modalService: NgbModal,
    private storageData: StorageData,
    public doctorCalendarService: DoctorCalendarService,
    public formBuilder: FormBuilder, 
    public subject: SubjectService,
    public add: NgbModal, 
    public frontDeskService: FrontDeskService,
    public ngFilterService: NgFilterService, 
    public datePipeService:DatePipeFormatService,
    private localStorage: LocalStorage
    ) 
    {
    super(aclService, router);
    this.page = new Page();
		this.page.pageNumber = 0;
		this.page.size = 10;
		this.currentDate=new Date();
    this.createForm();
  }
  ngOnDestroy():void
  {
	this.socket.removeListener('CHANGEINAPPOINTMENTS');
  }
  ngOnInit() {
      this.socket.on('CHANGEINAPPOINTMENTS', (message) => {
		if(this.aclService.hasPermission(this.userPermissions.schedule_cancelled_appointment_list_filter))
		{
		this.setPage({ offset: this.page.pageNumber });
		}	
	});
    if (this.aclService.hasPermission(this.userPermissions.schedule_cancelled_appointment_list_view)
      || this.storageData.isSuperAdmin()) {

      this.subject.castCancelledAppointment.subscribe(res => {
        if (res == 'undo') {
		this.setPage({ offset: 0 });
        }
      })
      this.startDate = new Date()
      this.endDate = new Date()
      this.startDate.setHours(0);
      this.startDate.setMinutes(0);
      this.endDate.setHours(23);
      this.endDate.setMinutes(59);
	this.setPage({ offset: 0 });
      this.allClinicIds = this.storageData.getFacilityLocations()
      this.requestService
        .sendRequest(
		AssignSpecialityUrlsEnum.Facility_list_dropdown_GET   ,  'GET',
        REQUEST_SERVERS.fd_api_url,
        ).subscribe(
          (responseClinic: HttpSuccessResponse) => {
            this.assignClinics = responseClinic.result.data?responseClinic.result.data:[]
            this.startDate.setHours(0);
            this.startDate.setMinutes(0);
            this.endDate.setHours(23);
            this.endDate.setMinutes(59);
            this.postObject.currentDate = this.startDate
            this.postObject.endDate = this.endDate

			let paramQuery: ParamQuery = {
				order: OrderEnum.ASC,
				pagination: false,
				filter: false,
				// per_page: 10,
				// page: 1,
			};
            this.requestService
              .sendRequest(
				'search_doctor', 'GET', REQUEST_SERVERS.fd_api_url, 
			{ ...paramQuery, 
			})
      .pipe(
			map((response) => {
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
              .subscribe(
                (data) => {
        
				this.assignDoctor = data;
			
				this.myForm.controls['doctorName'].setValue(this.assignDoctor[0].id)
                  this.assignDoctor = [...this.assignDoctor]
                  this.requestService
                    .sendRequest(
					AssignSpecialityUrlsEnum.Speciality_list_Get,
					'GET',
					REQUEST_SERVERS.fd_api_url,
                    ).subscribe(
                      (responseSpeciality: HttpSuccessResponse) => {
                        this.assignSpecialities = responseSpeciality.result.data ? responseSpeciality.result.data:[]
                        this.myForm.controls['clinicName'].setValue(this.assignClinics[0].id)
                        this.myForm.controls['doctorName'].setValue(this.assignDoctor[0].id)
                        this.myForm.controls['specialityName'].setValue(this.assignSpecialities[0].id)

                      });
                })
          });
      this.startDate = new Date();
      this.endDate = new Date(this.startDate);
    }
    this.cancelledAppListingTable = this.localStorage.getObject('cancelledAppTableList' + this.storageData.getUserId());
  }

  ngAfterViewInit() {
    if (this.cancelledApptListTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.cancelledApptListTable._internalColumns]);
			this.columns.forEach(element => {
				if(this.cancelledAppListingTable.length) {
					let obj = this.cancelledAppListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.cancelledAppListingTable.length) {
				const nameToIndexMap = {};
				this.cancelledAppListingTable.forEach((item, index) => {
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

  /*Form intilaization function*/
  private createForm() {
    this.myForm = this.formBuilder.group({
      specialityName: ['', Validators.required],
      clinicName: ['', Validators.required],
      doctorName: ['', Validators.required],
      facility_location_ids:[null],
      doctor_ids: [null],
      speciality_ids: [null],
      created_at: [
        null,
        [
          Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
          Validators.maxLength(10),
        ],
      ],
    
      updated_at:[
        null,
        [
          Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
          Validators.maxLength(10),
        ],
      ],
      created_by_ids:[null],
      updated_by_ids:[null],
      case_ids:[null],
    });
  }
  /*Get all cancelled appointments in list*/
    public getCancelledAppointment(param?) {
	      if (this.endDate != null && this.minDate) {
          if (this.endDate.getTime() < this.minDate.getTime()) {
            this.toastrService.error("Pick end date with respect to start date");
            return;
          }
        }
 
	  let reqObj=this.makeObject({});
    let params = {
    filters:reqObj,
    paginate:true,
	  page:param.page,
	  per_page:param.per_page,
    appointment_type:'CANCELLED',
    }
    this.startLoader=true;
    this.requestService
      .sendRequest(
        AppointmentUrlsEnum.getAppointmentAllDetailsList,
        'POST',
        REQUEST_SERVERS.schedulerApiUrl1,
        removeEmptyKeysFromObjectArrays(params)
      ).subscribe(
        (data: HttpSuccessResponse) => {
			this.loadSpin = false;
      this.startLoader=false;
			this.deleteAll=[];
		  this.data = [...data.result.data.docs];
          for (let i = 0; i < data.result.data.docs.length; i++) {
            debugger;
            this.data[i]['isChecked'] = false;
            if (data.result.data.docs[i].action_performed === "cancelled") {
              data.result.data.docs[i]["disabled"] = false
            } else {
              data.result.data.docs[i]["disabled"] = true
            }
            if (data.result.data.docs[i].availableSpeciality && data.result.data.docs[i].availableSpeciality.availableSpecialityDoctor) {
              if (this.aclService.hasPermission(this.userPermissions.cancelled_appointment_delete)
                || this.storageData.isSuperAdmin()) {
                this.data[i]['deleteDisable'] = false
              }
              else {
                this.data[i]['deleteDisable'] = true
              }
              if ((this.aclService.hasPermission(this.userPermissions.appointment_add)  &&  !(WithoutTime(this.data[i].scheduled_date_time)< WithoutTime(this.currentDate) ))
                || (this.storageData.isSuperAdmin() &&  !(WithoutTime(this.data[i].scheduled_date_time)< WithoutTime(this.currentDate) ))) {
                this.data[i]['canUndo'] = false
              }
              else {
                this.data[i]['canUndo'] = true;
              }
        
            } else {
            //   let clinicId = data.result.data.docs[i].availableSpeciality.facility_location_id
              if (this.aclService.hasPermission(this.userPermissions.cancelled_appointment_delete)
                || this.storageData.isSuperAdmin()) {
                this.data[i]['deleteDisable'] = false
              }
              else {
                this.data[i]['deleteDisable'] = true
              }
              if ((this.aclService.hasPermission(this.userPermissions.appointment_add &&
				!(WithoutTime(this.data[i].scheduled_date_time)< WithoutTime(this.currentDate) )))
                || (this.storageData.isSuperAdmin() 
				&&!(WithoutTime(this.data[i].scheduled_date_time)< WithoutTime(this.currentDate) ))) {
                this.data[i]['canUndo'] = false
              }
              else {
                this.data[i]['canUndo'] = true;
              }

            }
          }

       
          this.data = [...data.result.data.docs]
		  this.allData = [...data.result.data.docs];
			this.page.totalElements = data.result.data.total? data.result.data.total:0;
        }, error => {
		this.loadSpin = false;
        this.data = []
        this.allData = []
        this.numSelected = 0
        this.isEnableButtons = true;
        this.allChecked = false;
        })
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
	// this.caseIds=info.case_ids;
	this.myForm.patchValue(removeEmptyAndNullsFormObject(info));
	this.getChange(e.data, e.label);
	if(!e.data  || isEmptyArray(e.data)) {
		this.myForm.controls[Type].setValue(null);
	}
}
  /*Change date for filtering*/
  public changeDate() {
    this.startDate.setHours(0);
    this.startDate.setMinutes(0);
    this.endDate.setHours(23);
    this.endDate.setMinutes(59);
    if (this.startDate > this.endDate) {
      this.toastrService.error("Start Date should be less than End Date", 'Error')
      return;
    } else {
		this.setPage({ offset: this.page.pageNumber });
    }
  }
  public changeStartDate() {
	  debugger;
    if (this.startDate === null) {
      this.startDateError=true;
      return;
    } else{
      this.startDateError=false;
    }
   
	this.minDate = new Date(this.startDate);
    if (this.endDate < this.minDate) {
      this.endDate = this.minDate;
	}
	if(this.startDate && this.endDate )
	{
	if((this.startDate.getDate() == this.endDate.getDate()) && (this.startDate.getMonth() == this.endDate.getMonth()) && (this.startDate.getFullYear() == this.endDate.getFullYear()))
   	{
	this.endDate.setHours(23)
    this.endDate.setMinutes(59)
	this.endDate.setMinutes(0)
    } 
	}
	
	this.setPage({ offset: this.page.pageNumber });
  }

  onStartDateChange(event)
  {
	  debugger;
	  if(event.dateValue)
	  {
		this.startDate=new Date(event.dateValue);
		this.changeStartDate()
	  }
	  else
	  {
		this.startDate=null;
		this.minDate=this.min;
	  }
	  
	 
	 
  }

  onEndDateChange(event)
  {
	  if(event.dateValue)
	  {
		this.endDate=new Date(event.dateValue);
		this.changeEndDate()
	  }
	  else
	  {
		this.endDate=null
	  } 
  }

  public changeEndDate() {
    if (this.endDate === null) {
      this.endDateError=true;
      // this.coolDialogs.alert("End Date is needed");
      return;
    }else{
      this.endDateError=false;
    }
	if(this.startDate && this.endDate)
	{
		if ((this.startDate.getDate() == this.endDate.getDate()) && (this.startDate.getMonth() == this.endDate.getMonth()) && (this.startDate.getFullYear() == this.endDate.getFullYear())&& (this.startDate.getHours() == this.endDate.getHours())&& (this.startDate.getMinutes() == this.endDate.getMinutes())) {
			this.endDate.setHours(this.startDate.getHours())
			this.endDate.setMinutes(this.startDate.getMinutes() + 30)
		  }
		  else {
			this.endDate.setHours(23)
			this.endDate.setMinutes(59)
			if (this.endDate != null && this.minDate) {
			  if (this.endDate.getTime() < this.minDate.getTime()) {
				this.toastrService.error("Pick end date with respect to start date");
				return;
			  }
			}
		  }
	}
    
	this.setPage({ offset: this.page.pageNumber });
	
  }

  public resetFilter(resetCheck) {
    this.data = this.allData;
    this.deleteAll = [];
    this.isEnableButtons = true;
    this.allChecked = false;
    this.numSelected = 0;
    this.counterChecked = 0;
	this.specSelectedMultiple = null;
  this.clinicSelectedMultiple= null;
  this.myForm.controls['doctor_ids'].setValue(null);
		this.myForm.controls['speciality_ids'].setValue(null);
		this.myForm.controls['created_at'].setValue(null);
		this.myForm.controls['updated_at'].setValue(null);
		this.myForm.controls['created_by_ids'].setValue(null);
		this.myForm.controls['updated_by_ids'].setValue(null);
		this.myForm.controls['facility_location_ids'].setValue(null);
    this.myForm.controls['case_ids'].setValue(null);
    if(resetCheck)
    {
      this.startDate = new Date()
      this.endDate = new Date()
      this.startDate.setHours(0);
      this.startDate.setMinutes(0);
      this.endDate.setHours(23);
      this.endDate.setMinutes(59);
    }
	this.eventsSubject.next(true);
	this.caseIds=[];
		this.setPage({ offset: 0 });
  }
  /*Delete particular appointment*/
  public deleteParticularAppointment(id) {
    var obj = {
      "appointment_ids": [id]
	}
  this.customDiallogService.confirm('Delete','Are you sure you want to delete?','Yes','No')
		.then((confirmed) => {
			this.loadSpin = true;
			if (confirmed){
        this.deleteAll.splice(obj.appointment_ids, 1);
        this.requestService
          .sendRequest(
            CancelAppointmentListUrlsEnum.deleteCancelledAppointments,
			'delete_with_body',
            REQUEST_SERVERS.schedulerApiUrl1,
            obj
          ).subscribe(
            (res: HttpSuccessResponse) => {
			  this.toastrService.success('Appointment Deleted Successfully', 'Success')
			  this.setPage({ offset: this.page.pageNumber });
            },error=>{
				this.toastrService.error(error.error.message, 'Error')
			});
			}else if(confirmed === false){
			}else{
				this.loadSpin = false;
			}
		})
		.catch();
  
  }

  public deleteAppointment(id) {
    var obj = {
      "appointment_ids": [id]
	}
        this.deleteAll.splice(obj.appointment_ids, 1);
        this.requestService
          .sendRequest(
            CancelAppointmentListUrlsEnum.deleteCancelledAppointments,
			'delete_with_body',
            REQUEST_SERVERS.schedulerApiUrl1,
            obj
          ).subscribe(
            (res: HttpSuccessResponse) => {
			  this.setPage({ offset: this.page.pageNumber });
            },error=>{
				this.toastrService.error(error.error.message, 'Error')
			});
      
    
  }
  /*Delete all  appointments*/
  public deleteAllAppointments() {
    if (this.deleteAll.length != 0) {
      var obj = {
        "appointment_ids": this.deleteAll
      }

      this.customDiallogService.confirm('Delete','Are you sure you want to delete?','Yes','No')
		.then((confirmed) => {
			this.loadSpin = true;
			if (confirmed){
        this.requestService
        .sendRequest(
          CancelAppointmentListUrlsEnum.deleteCancelledAppointments,
          'delete_with_body',
          REQUEST_SERVERS.schedulerApiUrl1,
          obj
        ).subscribe(
          (res: HttpSuccessResponse) => {
    this.toastrService.success('Appointment Deleted Successfully', 'Success');
    this.setPage({ offset: this.page.pageNumber });
            this.deleteAll = [];
            this.allChecked = false;
          });
			}else if(confirmed === false){
			}else{
				this.loadSpin = false;
			}
		})
		.catch();

    }
  }
  /*Detail of  appointment that are cancelled*/
  public cancelledAppointmentDetails($event) {
    this.requestService
						.sendRequest(
							AppointmentUrlsEnum.getAppointmentDetails,
							'GET',
							REQUEST_SERVERS.schedulerApiUrl,
							{id:$event.id, 
                appointment_type:'CANCELLED'
              }
						).subscribe(res=>{
              let app = res.result.data;
              this.frontDeskService.detailsForCancel = {
                "chartNo": app["patient_id"],
                "caseId": app["case_id"],
                "caseType": app["caseType"],
                "patient_id" : app['patient_id'],
                "doctor":  app['doctor_info'] && app['doctor_info']['first_name'] ? `${app['doctor_info']['first_name']} ${app['doctor_info']['middle_name'] ? app['doctor_info']['middle_name'] : ''} ${app['doctor_info']['last_name']}, ${app['doctor_info']['billingTitle'] ? app['doctor_info']['billingTitle'] : ''}` : 'N/A',
                "patientLastName": app["patient"]["last_name"],
                "patientFirstName": app["patient"]["first_name"],
                "patientMiddleName": app["patient"]["middle_name"],
                "patient": app["patient"],
                "startDateTime": app["scheduled_date_time"],
                "timeSlot": app["time_slots"],
                "complaint": app['comments'],
                "cancelled_comments":app['cancelled_comments'],
                "speciality": app['speciality']['name'],
                "clinicName":`${app['facility_location']['facility']['name']}-${app['facility_location']['name']}` ,
                "specialityQualifier":  app['speciality']['qualifier'],
                "practiceLocationQualifier":`${app['facility_location']['facility']['qualifier']}-${app['facility_location']['qualifier']}`,
                "deletedBy": {'name': app['updated_by'] && app['updated_by']['middle_name'] ? app['updated_by']['first_name']+ ' '+ app['updated_by']['middle_name'] + ' '+ app['updated_by']['last_name'] : app['updated_by']['first_name'] + ' '+ app['updated_by']['last_name']},
                "updated_at" :app['updated_at']
              };
              const activeModal = this.add.open(CancelAppointmentDetailsComponent, {
                size: 'lg', backdrop: 'static',
                keyboard: false
              });

            });
  }
  /*Undo of  appointment that are cancelled*/
  public UndoAppointment(app) {
    this.details = app;
    var object: any;
    let cpt_codes: number[] = [];
    if (this.details.appointment_title == null) {
      this.details.appointment_title = 'N/A'
    }
    this.requestService
      .sendRequest(
        AppointmentUrlsEnum.getAppointmentCptCodes,
        'GET',
        REQUEST_SERVERS.schedulerApiUrl,
        {
          appointment_id: app.id,
        }
      ).subscribe((res: any) => {
        cpt_codes = res.result.data.cpt_code.map((x: any) => x.id)
        object = {
          "start_date_time": convertDateTimeForSending(this.storageData, app.scheduled_date_time),
          "confirmation_status": app.confirmation_status,
          "comments": this.details.cancelled_comments ? this.details.cancelled_comments : "N/A",
          "doctor_id": app.doctor_id,
          "speciality_id": app.speciality_id,
          "facility_location_id": app.facility_location_id,
          "priority_id": app.priority_id,
          "patient_id": app.patient_id,
          "appointment_type_id": app.appointment_type_id,
          "case_id": app.case_id,
          "case_type_id": app.case_type_id,
          "appointmentTitle": app.appointmentTitle,
          "time_slot": app.time_slots,
          "undo_appointment_status_id": app.status_id,
          "session_status_id": app.session_status_id,
          "timeZone": this.storageData.getUserTimeZoneOffset(),
          ...(cpt_codes && cpt_codes.length > 0 && { "cpt_codes": cpt_codes })
        }
        object = removeEmptyAndNullsFormObject(object);
        this.startLoader = true;
        this.requestService
          .sendRequest(
            CancelAppointmentListUrlsEnum.addAppointment,
            'POST',
            REQUEST_SERVERS.schedulerApiUrl1,
            object
          ).subscribe(
            (res: HttpSuccessResponse) => {
              this.startLoader = false;
              if (!res.result.data['message']) {
                this.toastrService.success("Successfully Undo", 'Success');
                this.deleteAppointment(this.details.id)
              } else if (res.result.data[0]["message"] === 'Patient already has appointment at this time!') {
              
this.customDiallogService.confirm('Add',res.result.data[0]["message"] + '.Are you sure you want to add.','Yes','No')
.then((confirmed) => {
  this.loadSpin = true;
  if (confirmed){
    object[0]["appointment"]["confirm"] = true;
    this.requestService
      .sendRequest(
        CancelAppointmentListUrlsEnum.addAppointment,
        'POST',
        REQUEST_SERVERS.schedulerApiUrl1,
        object
      ).subscribe(
        (respp: HttpSuccessResponse) => {
          if (!respp.result.data['message']) {
            this.toastrService.success("Successfully Undo", 'Success');
            this.deleteAppointment(this.details.id)
          } else if (respp.result.data[0]['message']) {
            this.toastrService.error(respp.result.data[0]['message'], 'Error')
          }
        });
  }else if(confirmed === false){
  }else{
    this.loadSpin = false;
  }
})
.catch();
              
              } else if (res.result.data[0]['message']) {
                this.toastrService.error(res.result.data[0]['message'], 'Error')
              }
            }, error => {
              this.startLoader = false;
            }
          )
      })
  }
  /*See more and less functionality for filters*/
  public openAndCloseFilters() {
    this.isOpenFilters = !this.isOpenFilters;
  }
  /*No of entries to show in table function*/

  /*Particular appointment selected from table to perform  certain action against appointments*/
  public particularSelected(data, e) {
    if (e.checked) {
      this.isEnableButtons = false;
	  this.numSelected = this.numSelected + 1;
	  data.isChecked=true;
	  this.deleteAll.push(data.id)
    
    }
    else {
      this.numSelected = this.numSelected - 1;
      this.allChecked = false
   
		  data.isChecked = false;
        //   this.data[i]['isChecked'] = false;
        this.deleteAll.splice(this.deleteAll.indexOf(data.id), 1)
	
    }
  }
  /*All appointment selected from table to perform  certain actions against appointments*/
  public allSelected(e) {
    this.counterChecked = 0;
    if (e.checked) {
      this.isEnableButtons = false;
	  this.allChecked = true;
	  this.data.forEach(appointment => {
		  if(!appointment?.isChecked && appointment?.appointmentStatus?.slug!='no_show' && appointment?.appointmentStatus?.slug!='completed')
		  {
			appointment.isChecked=true;
			this.deleteAll.push(appointment?.id)
		  }
	
		  
	  });
   
    }
    else {
      this.allChecked = false;
	//   let start = this.counter * (this.pageNumber - 1);
	  this.data.forEach(appointment => {
		(appointment?.appointmentStatus?.slug!='no_show' && appointment?.appointmentStatus?.slug!='completed')
		{
			appointment.isChecked=false;
			this.deleteAll.splice(this.deleteAll.indexOf(appointment?.id), 1)
			  
		}
		
	  });
   
      if (this.data.length == 0) {
        this.isEnableButtons = true;
      }
   
    }
  }
  entryCountSelection(params) {
	this.getCancelledAppointment();
}
FilterSubmit(pageInfo) {
	this.setPage(pageInfo);
}
setPage(pageInfo) {
	let pageNum;
	pageNum = pageInfo.offset;
	this.page.pageNumber = pageInfo.offset;
	const pageNumber = this.page.pageNumber + 1;
	let per_page = this.page.size;
	let queryparam = { per_page:per_page, page: pageNumber }
	this.getCancelledAppointment(queryparam);
}

PageLimit($num) {
	this.page.size = Number($num);
	this.setPage({ offset: 0 });
}

  makeObject(params){
    this.requestObject = {};
    if (!!this.specSelectedMultiple && this.specSelectedMultiple.length != 0) {
      this.requestObject['speciality_ids'] = this.specSelectedMultiple;
    }
    if (this.myForm && this.myForm.value && this.myForm.value['speciality_ids'] && this.myForm.value['speciality_ids'].length != 0) {
      this.requestObject['speciality_ids'] = this.myForm.value['speciality_ids'];
    }
    if (this.myForm && this.myForm.value && this.myForm.value['updated_by_ids'] && this.myForm.value['updated_by_ids'].length != 0) {
      this.requestObject['updated_by_ids'] = this.myForm.value['updated_by_ids'];
    }
    if (this.myForm && this.myForm.value && this.myForm.value['created_by_ids'] && this.myForm.value['created_by_ids'].length != 0) {
      this.requestObject['created_by_ids'] = this.myForm.value['created_by_ids'];
    }
    if (this.myForm && this.myForm.value && this.myForm.value['created_at'] && this.myForm.value['created_at'].length != 0) {
      this.requestObject['created_at'] = this.myForm.value['created_at'];
    }
    if (this.myForm && this.myForm.value && this.myForm.value['updated_at'] && this.myForm.value['updated_at'].length != 0) {
      this.requestObject['updated_at'] = this.myForm.value['updated_at'];
    }
    if (this.myForm && this.myForm.value && this.myForm.value['facility_location_ids'] && this.myForm.value['facility_location_ids'].length != 0) {
      this.requestObject['facility_location_ids'] = this.myForm.value['facility_location_ids'];
    }
    else {
      this.requestObject['facility_location_ids'] =
        this.storageData.getFacilityLocations();
    }
    if (this.myForm && this.myForm.value && this.myForm.value['doctor_ids'] && this.myForm.value['doctor_ids'].length != 0) {
      this.requestObject['doctor_ids'] = this.myForm.value['doctor_ids'];
    }
    if (this.myForm && this.myForm.value && this.myForm.value['case_ids'] && this.myForm.value['case_ids'].length != 0) {
      this.requestObject['case_ids'] = [this.myForm.value['case_ids']];
    }
    this.requestObject['start_date'] = this.storageData && this.startDate ? convertDateTimeForSending(this.myForm.value, this.startDate) : null;
    this.requestObject['end_date'] = this.storageData && this.endDate ? convertDateTimeForSending(this.storageData, this.endDate) : null;
    this.requestObject['end_date'].setMilliseconds(0);
    this.requestObject['end_date'].setSeconds(59);
    this.requestObject['start_date'].setMilliseconds(0);
    this.requestObject['start_date'].setSeconds(0);
    this.requestObject['per_page'] = params.per_page;
    this.requestObject['page'] = params.page_no;
    this.requestObject['paginate'] = params.paginate;
    return this.requestObject;
  }
  
  setActionOfNgDropDown(fieldName: string , action: boolean){
		this.ngFilterService.updateFilterField(fieldName, action);
	}
	changeSelectTemplateForm(value, fieldName) {
		if (!value.length) {
			if(fieldName == 'specSelectedMultiple') {
				this.specSelectedMultiple = null;
			} else if(fieldName == 'docSelectedMultiple') {
				this.docSelectedMultiple = null;
			} else if(fieldName == 'clinicSelectedMultiple') {
				this.clinicSelectedMultiple = null;
			}
		}
	}
	checkInputs(){
		if (!this.specSelectedMultiple && !this.startDate && !this.endDate && !this.docSelectedMultiple && !this.clinicSelectedMultiple) {
			return true;
		  }
		  return false;
	}

  cancelAppointmentHistoryStats(row) {
    const ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      windowClass: 'modal_extraDOc body-scroll history-modal',
      modalDialogClass: 'modal-lg'
    };
    let modelRef = this.modalService.open(CreatedHistoryComponent,ngbModalOptions);
    modelRef.componentInstance.createdInformation = [row];
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
			this.localStorage.setObject('cancelledAppTableList' + this.storageData.getUserId(), data);
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
		this.cancelledApptListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.cancelledApptListTable._internalColumns.sort(function (a, b) {
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

}
