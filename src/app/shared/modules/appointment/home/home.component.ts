import { MappingFilterObject } from '@appDir/shared/filter/model/mapping-filter-object';
import { EnumApiPath } from '@appDir/front-desk/billing/Models/searchedKeys-modal';

import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
//service
import { AppointmentService } from '../appointment.service'
import { SchedulingQueueService } from '../scheduling-queue/scheduling-queue.service'
import { FrontDeskService } from '../../../../scheduler-front-desk/front-desk.service'
//modals
import { UpdateAppoitModalComponent } from '../../doctor-calendar/modals/update-appoit-modal/update-appoit-modal.component';
import { DeleteReasonComponent } from '../../doctor-calendar/modals/delete-reason/delete-reason.component';
import { AddToWaitingListModalComponent } from '../modals/add-to-waiting-list-modal/add-to-waiting-list-modal.component';
import { WalkInNotSeenComponent } from '../modals/walk-in-not-seen/walk-in-not-seen.component';
import { DoctorCalendarService } from '../../doctor-calendar/doctor-calendar.service';
import { SubjectService } from '../../doctor-calendar/subject.service';
import { AppointmentSubjectService } from '../subject.service';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { StorageData, HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { Router } from '@angular/router';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { AssignSpecialityUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { DoctorCalendarUrlsEnum } from '../../doctor-calendar/doctor-calendar-urls-enum';
import { AddToBeSchedulledUrlsEnum } from '@appDir/scheduler-front-desk/modules/add-to-be-scheduled/add-to-be-scheduled-list-urls-enum';
import { AppointmentUrlsEnum } from '../appointment-urls-enum';
import { AclServiceCustom} from '../../../../acl-custom.service'
import { Page } from '@appDir/front-desk/models/page';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { Location } from '@angular/common';
import { map, Subject, Subscription, timer } from 'rxjs';
import { AssignRoomsUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-rooms/assign-rooms-urls-enum';
import { Socket } from 'ngx-socket-io';
import { NgFilterService } from '@appDir/shared/services/ng-filter.service';
import { convertDateTimeForRetrieving, convertDateTimeForSending, getIdsFromArray, makeDeepCopyArray, removeEmptyAndNullsFormObject, unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
import { changeDateFormat, isEmptyObject ,changeTimeFormate } from '@appDir/shared/utils/utils.helpers';
import { CancelAppointmentListUrlsEnum } from '@appDir/scheduler-front-desk/modules/cancel-appointment-list/cancel-appointmnet-list-urls-enum';
import { EnumApiPathScheduler } from '@appDir/scheduler-front-desk/enums/enum-api-paths';
import { ShareAbleFilter } from '@appDir/shared/models/share-able-filter';
import { ViewAppoitModalComponent } from '../../doctor-calendar/modals/view-appointment-modal/view-appoointment-modal.component';
import { F } from '@angular/cdk/keycodes';
import { request } from 'http';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { findIndexInData } from '../../ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
@Component({
	selector: 'app-appointment-list',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent 
 extends PermissionComponent implements OnInit,OnDestroy 
{
	public isCollapsed = false;
	public appScheduler = true;
	public waitingScheduler = false;
	specSelectedMultiple: any;
	docSelectedMultiple: any;
	clinicSelectedMultiple: any;
	appTypeSelectedMultiple: any;
	visitStatusSelectedMultiple: any;
	caseTypeSelectedMultiple: any;
	appointmentStatusSelectedMultiple: any;
	page: Page;
	page_WL:Page;
	queryParams: ParamQuery;
	min: Date= new Date('1900/01/01');
	myForm: FormGroup;
	appointmentListFilterForm: FormGroup;
	public allSpec = []
	public isKiosPatient: any = false;
	public allChecked = false;
	public deleteAll: any = [];
	public deleteAllPermanat: any = [];
	public deleteAllKios: any = [];
	public allClinic = [];
	public allClinicIds: any = [];
	public visitType = []
	public visitStatus = []
	public appointmentStatus = []
	public filteredAppointmentStatus = []
	public allDisabledAppointmentStatus = []
	public caseType = []
	public createdBy=[]
	public updatedBy=[]
	public assignedDoctor = []
	public isOpenFilters: any = true;
	public allDoctors: any = []
	public delayCheck: any = false
	public now: any
	public getStartTime: any
	public currentDateTime: Date
	public endDateTime: Date
	public delay: any = [];
	public data = [];
	public visitTypeFilter: any = "Visit Type";
	public visitStatusFilter: any = "Visit Status";
	public caseTypeFilter: any = "Case Type";
	public createdByFilter: any = "Created By";
	notseenId: any;
	walk_in: any;
	public dataWL = [];
	public appoint_check = true;
	public wait_check = false
	public appointment_list_count:number=0;
	public waiting_list_count : number=0;
	todayDate: Date = new Date()
	subscription: Subscription[] = [];
	selectedMultipleFieldFiter: any = {
		case_ids: [],
		
	};
	AddToBeSchedulledUrlsEnum=AddToBeSchedulledUrlsEnum
	EnumApiPath=EnumApiPathScheduler;
		EnumApiPathFilter=EnumApiPath;

	conditionalExtraApiParams:any={
		order_by:OrderEnum.ASC
	}
	apiPath=REQUEST_SERVERS.kios_api_path  
	requestServerpath = REQUEST_SERVERS;
	eventsSubjectAppointment: Subject<any> = new Subject<any>();
	eventsSubjectWaiting: Subject<any> = new Subject<any>();
	activeModalViewAppointment:NgbModalRef;
	changeTimeFormate=changeTimeFormate;
	caseIdsWaiting:any[]=[];
	appointmentEventCalled:number =0;
	showRefreshButtonAL: boolean = false;
	showRefreshButtonWL: boolean = false;
	isAppointementList: boolean = true;
	isWaitingList: boolean = false;
	counter : number = 0;
	createdDate: Date = new Date();
	currentTime:number=0;
	countDown:Subscription;
	counterAppointment = 60;
	tick = 1000;
	conditionalExtraApiParamsLocation:any;

	conditionalExtraApiParamsStatus = {
		specific_appointment_status:true
	}
	conditionalExtraApiParamsStatus1 = {
		specific_visit_status:true
	}

	vistStatusAllowedSlugs = [
		're_scheduled', 'scheduled','no_show','checked_in', 'checked_out' ,'in_session' 
	];
	appointmentStatusAllowedSlugs=[
		're_scheduled', 'scheduled','arrived','completed','no_show'
	];
	allowedAppointmentStatus:any[] =[];
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('appointmentList') appointmentListTable: DatatableComponent;
	@ViewChild('waitingList') waitingListTable: DatatableComponent;
	customizedColumnComp: CustomizeColumnComponent;
	@ViewChild(CustomizeColumnComponent) set con(con: CustomizeColumnComponent) {
		if (con) { // initially setter gets called with undefined
		  this.customizedColumnComp = con;
		}
	}
	modalCols :any[] = [];
	columnsApp: any[] = [];
	columnsWaiting: any[] = [];
	alphabeticColumns:any[] =[];
	colSelected: boolean = true;
  	isAllFalse: boolean = false;
	appointmentListingTable: any;
	waitingListingTable: any;


	constructor(aclService: AclService,
		router: Router,
		private customDiallogService: CustomDiallogService,
		public schedulingService: SchedulingQueueService,
		public aclCustom : AclServiceCustom,
		public openModal: NgbModal,
		private storageData: StorageData,
		public AppointmentService: AppointmentService,
		private toastrService: ToastrService,
		public cdr: ChangeDetectorRef,
		public frontDeskService: FrontDeskService,
		public appointmentSubjectService: AppointmentSubjectService,
		public updateModal: NgbModal,
		public doctorSubjectService: SubjectService,
		public doctorCalendarService: DoctorCalendarService,
		public formBuilder: FormBuilder,
		public _router: Router,
		titleService: Title,
		private _route: ActivatedRoute,
		private modalService: NgbModal,
		protected requestService: RequestService,
		private location: Location,
		private socket:Socket,
		public ngFilterService: NgFilterService,
		public datePipeService:DatePipeFormatService,
		private localStorage: LocalStorage
	) {
		super(aclService, router, _route, requestService, titleService);
		this.page=new Page();
		this.page.pageNumber = 0;
		this.page.size = 10
		this.subscription.push(this.appointmentSubjectService.refresher.subscribe(
			(check) =>
			{
				if(check)
				{
					this.getAllAppointmentWL({offset:this.page.pageNumber||0})
				}
			}
		)
		)
		if (this.aclService.hasPermission(this.userPermissions.schedule_appointment_list_view)
			|| this.storageData.isSuperAdmin()) {
			this.createForm();
			this.createAppointlistFilterForm();
			this.currentDateTime = new Date();
			this.endDateTime = new Date();
			this.getClinic()
			this.getDoctors()
			this.getSpeciality()
			this.getCaseType();
			this.getAllStatus();
			this.getAppointmentsByPageNo({offset:this.page.pageNumber});
			this.getAppointmentCount('appointmentList');
			this.getAllAppointmentType()
		}
		if (this.aclService.hasPermission(this.userPermissions.schedule_waiting_list_front_desk_view)
			|| this.storageData.isSuperAdmin()) {
				if(!this.aclService.hasPermission(this.userPermissions.schedule_appointment_list_view))
				{
					this.createForm();
					if(this.wait_check==true)
					{
						this.clickWaitingList()

					}
				}
			if(this.wait_check)
			{
				this.getAllAppointmentWL({offset:this.page.pageNumber||0})
			}
		}
	}

	refreshNow() {
		this.showRefreshButtonAL = false;
		this.showRefreshButtonWL = false;

		if (this.appoint_check == true) {
			this.getAppointmentsByPageNo({ offset: this.page.pageNumber });
			this.getAppointmentCount('appointmentList');
		} else {
			this.getAppointmentCount('waitingList');
			this.getAllAppointmentWL({offset:this.page.pageNumber||0})
		}
	}

	counterAppontment(){
	  let curentdate = new Date();
	  let commentDate = new Date(this.createdDate);
	  
	  let time = (curentdate.getTime() - commentDate.getTime())/1000;

	  if (time == 60){
		  this.refreshNow();
	  }
	
	this.currentTime= time ;
	
	}
	ngOnInit() {
		this.conditionalExtraApiParamsLocation={
			allowed_facilities:this.storageData.getFacilityLocations()
		}

		if (this.aclService.hasPermission(this.userPermissions.schedule_appointment_list_view)
			|| this.storageData.isSuperAdmin()) {
			this.setTitle();
			this.doctorSubjectService.cast.subscribe(response => {
				if (response == 'delete') {
					this.deleteAll = [];
					this.deleteAllKios = [];
					this.deleteAllPermanat = [];
					this.getAppointmentsByPageNo({offset:this.page.pageNumber});
				}
			})

			this.socket.on('CHANGEINAPPOINTMENTS', (message) => {
					this.showRefreshButtonAL = true;						
			});

						this.socket.on('CHANGEINWAITINGLIST', (message) => {
							this.showRefreshButtonWL= message === null ? false :true;
								// if(this.wait_check==true)
								// {
								// 	this.getAppointmentCount('waitingList');
								// }
								// else 
								// {
								// 	this.getAppointmentCount('appointmentList');
								// }								
					});

			this.subscription.push( this.appointmentListFilterForm.controls['start_date'].valueChanges.subscribe(value=>{
				this.onchangeStartDate(value);
				this.page.pageNumber=0
				this.getAppointmentsByPageNo({offset:this.page.pageNumber});
			})
			)

			this.subscription.push(this.appointmentListFilterForm.controls['end_date'].valueChanges.subscribe(value=>{
				// this.onchangeEndDate(value)
				this.page.pageNumber=0
				this.getAppointmentsByPageNo({offset:this.page.pageNumber});
			}))

	
			this.appointmentSubjectService.castAppointment.subscribe(res => {
				if (res == 'Appointment Updated') {
				this.getAppointmentsByPageNo({offset:this.page.pageNumber});
				}
			})
			this.appointmentSubjectService.castWaititngList.subscribe(res => {
				if (res == 'true') {
				this.getAppointmentsByPageNo({offset:this.page.pageNumber});
				}
			})
		}
		this.appointmentListingTable = this.localStorage.getObject('appointmentTableList' + this.storageData.getUserId());
		this.waitingListingTable = this.localStorage.getObject('waitingTableList' + this.storageData.getUserId());
	}

	ngAfterViewInit() {
		this.tableColumns();
	}

	tableColumns() {
		this.appointmentListingTable = this.localStorage.getObject('appointmentTableList' + this.storageData.getUserId());
		this.waitingListingTable = this.localStorage.getObject('waitingTableList' + this.storageData.getUserId());
		if(this.appoint_check) {
			if (this.appointmentListTable && this.appointmentListTable._internalColumns) {
				this.columnsApp = makeDeepCopyArray(this.columnsApp?.length ? [...this.columnsApp] : [...this.appointmentListTable?._internalColumns]);
				this.columnsApp.forEach(element => {
					if(this.appointmentListingTable.length) {
						let obj = this.appointmentListingTable.find(x => x?.header === element?.name);
						obj ? element['checked'] = true : element['checked'] = false;
					}
					else {
						element['checked'] = true;
					}
				});
				if(this.appointmentListingTable.length) {
					const nameToIndexMap = {};
					this.appointmentListingTable.forEach((item, index) => {
						nameToIndexMap[item?.header] = index;
					});
					this.columnsApp.sort((a, b) => nameToIndexMap[a?.name] - nameToIndexMap[b?.name]);
				}
				let columns = makeDeepCopyArray(this.columnsApp);
				this.alphabeticColumns = columns.sort(function (a, b) {
					if (a.name < b.name) { return -1; }
					if (a.name > b.name) { return 1; }
					return 0;
				});
			}
		}
		else {
			if (this.waitingListTable && this.waitingListTable._internalColumns) {
				this.columnsWaiting = makeDeepCopyArray([...this.waitingListTable._internalColumns]);
				this.columnsWaiting.forEach(element => {
					if(this.waitingListingTable.length) {
						let obj = this.waitingListingTable.find(x => x?.header === element?.name);
						obj ? element['checked'] = true : element['checked'] = false;
					}
					else {
						element['checked'] = true;
					}
				});
				if(this.waitingListingTable.length) {
					const nameToIndexMap = {};
					this.waitingListingTable.forEach((item, index) => {
						nameToIndexMap[item?.header] = index;
					});
					this.columnsWaiting.sort((a, b) => nameToIndexMap[a?.name] - nameToIndexMap[b?.name]);
				}
				let columns = makeDeepCopyArray(this.columnsWaiting);
				this.alphabeticColumns = columns.sort(function (a, b) {
					if (a.name < b.name) { return -1; }
					if (a.name > b.name) { return 1; }
					return 0;
				});
			}
		}
		this.onConfirm(false);
	}

	ngOnDestroy() {
		this.socket.removeListener('CHANGEINAPPOINTMENTS');
		this.socket.removeListener('CHANGEINWAITINGLIST');
		unSubAllPrevious(this.subscription);
		if (this.countDown){
		this.countDown.unsubscribe();
		}
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
	selectionOnValueChange(e: any,Type?,check?) {
	 const info = new ShareAbleFilter(e);
	  if(check==="appointmentList")
	  {
		this.appointmentListFilterForm.patchValue(removeEmptyAndNullsFormObject(info));
		this.getChange(e.data, e.label);
		if(!e.data || e.data.length ===0) {
			this.appointmentListFilterForm.controls[Type].setValue(null);
		}
	  }
	  else
	  {
		  this.caseIdsWaiting=info.case_ids;
		  this.myForm.patchValue(removeEmptyAndNullsFormObject(info));
		this.getChange(e.data, e.label);
		if(!e.data || e.data.length ===0) {
			this.myForm.controls[Type].setValue(null);
		}
	  }

	
	}

	onStartDateChange(event)
	{
		if(event.dateValue)
		{
			this.appointmentListFilterForm.patchValue({start_date:new Date(event.dateValue)})
		this.onchangeStartDate(this.appointmentListFilterForm.get('start_date').value)
		}
		else
		{
		this.appointmentListFilterForm.patchValue({start_date:null})
		} 
	}

	onEndDateChange(event)
  {
	  if(event.dateValue)
	  {
		this.appointmentListFilterForm.patchValue({end_date:new Date(event.dateValue)})
		this.onchangeEndDate(this.appointmentListFilterForm.get('end_date').value)
	  } 
  }

	clickAppoinmentList() {
		this.page.pageNumber=0;
		this.page.size=10;
		this.page.totalElements=0;
		this.appoint_check = true;
		this.wait_check = false;
		this.allChecked=false;
		this.appScheduler = true;
		this.waitingScheduler = false;
		this.currentDateTime = new Date();
		this.endDateTime = new Date();
		this.currentDateTime.setSeconds(0)
		this.endDateTime.setSeconds(0)
		this.currentDateTime.setMilliseconds(0)
		this.endDateTime.setMilliseconds(0)
		this.page.pageNumber=0
		this.showRefreshButtonAL = false;
		this.isAppointementList = true;
		this.isWaitingList = false;
		this.resetFilters();
		this.getAppointmentCount('appointmentList');
	}

	clickWaitingList() {
		this.page.pageNumber=0;
		this.page.size=10;
		this.page.totalElements=0;
		this.appoint_check = false;
		this.wait_check = true;
		this.appScheduler = false;
		this.waitingScheduler = true;
		this.showRefreshButtonWL = false;
		this.currentDateTime = new Date();
		this.isWaitingList = true;
		this.isAppointementList = false;
		this.resetFiltersWL();
		this.getAppointmentCount('waitingList');
	}

	private createForm() {
		this.myForm = this.formBuilder.group({
			clinicName: ['', Validators.required],
			specialityName: ['', Validators.required],
			doctorName: ['', Validators.required],
			patient_name:[''],
			priorityName: ['', Validators.required],
			'facility_location_ids' :['', Validators.required],
			'practicelocation':[false],
			case_type_ids: [],
			case_ids:[[]],
			created_by_ids: [],
			updated_by_ids: [],
			created_at:[
				null,
				[
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
				],
			],
			updated_at: [
				null,
				[
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
				],
			]
         });
	}

	private createAppointlistFilterForm()
	{
		this.appointmentListFilterForm = this.formBuilder.group({
			speciality_ids: [],
			doctor_ids: [],
			patient_name:[],
			start_date: [ new Date()],
			end_date: [ new Date()],
			appointment_type_ids:[],
			case_type_ids:[],
			created_at: [
				null,
				[
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
				],
			],
			updated_at: [
				null,
				[
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
				],
			],
			patient_status_ids:[],
			appointment_status_ids:[],
			facility_location_ids:[],
			case_ids:[],
			created_by_ids:[],
			updated_by_ids:[],

		});
	}
	public getSpeciality() {
		this.requestService
			.sendRequest(

				AssignSpecialityUrlsEnum.Speciality_list_Get,
				'GET',
				REQUEST_SERVERS.fd_api_url,
			).subscribe(
				(response: HttpSuccessResponse) => {
					this.allSpec=response.result && response.result.data;


				})
	}
	public getAllAppointmentType() {
		this.requestService
			.sendRequest(
				DoctorCalendarUrlsEnum.getAppointmentTypes,
				'GET',
				REQUEST_SERVERS.schedulerApiUrl1
			).subscribe(
				(res: HttpSuccessResponse) => {
					for (var i = 0, j = 1; i < res.result.data.length; i++, j++) {
						this.visitType[i] = res.result.data[i]
					}
					this.visitTypeFilter = this.visitType[0].description
					this.visitType = [...this.visitType]
				}
			)
	}
	public getCaseType() {
		this.requestService
			.sendRequest(
				AddToBeSchedulledUrlsEnum.caseTypes,
				'GET',
				REQUEST_SERVERS.kios_api_path
			).subscribe(
				(response: any) => {
					for (var i = 0, j = 1; i < response.result.data.length; i++, j++) {
						this.caseType[i] = response.result.data[i]
					}
					this.caseTypeFilter = this.caseType[0].name
					this.caseType = [...this.caseType]
				})
	}
	
	getDoctors(name?, id?) {
		let paramQuery: ParamQuery = {
			order: OrderEnum.ASC,
			pagination: false,
			filter: false,

		};
	
		this.requestService
			.sendRequest('search_doctor', 'GET', REQUEST_SERVERS.fd_api_url, 
			{ ...paramQuery, 
			}).pipe(
			map((response) => {
				let data = response['result']['data'];
				data.forEach(x => {
					if(x.id){
						x['full_name']= `${x?.first_name} ${
							x?.middle_name ? x?.middle_name : ''
						} ${x?.last_name}${
							x?.medical_identifier && x?.medical_identifier?.billing_title ? ', '+ x?.medical_identifier?.billing_title?.name : ''
						}`;;
					}
				})
				return data;
			}))
			.subscribe((data) => {
				this.allDoctors = data;
				this.allDoctors = [...this.allDoctors]
				this.myForm.controls['doctorName'].setValue(this.allDoctors[0].id)
			});
	}

	public getClinic() {
		
		REQUEST_SERVERS.fd_api_url,
		this.allClinicIds = this.storageData.getFacilityLocations()
		this.requestService
			.sendRequest(
				AssignSpecialityUrlsEnum.Facility_list_dropdown_GET   ,  'GET',
        REQUEST_SERVERS.fd_api_url
				
			).subscribe(
				(response: HttpSuccessResponse) => {
					this.allClinic = response.result.data?response.result.data:[];
				}
			)
	}

	onchangeStartDate(start_date)
	{
		let end_date= this.appointmentListFilterForm.get('end_date').value;
		start_date=new Date(start_date)
		end_date=new Date(end_date)
		if(start_date>end_date)
		{
			
			end_date=new Date(start_date);
			end_date.setMinutes(59)
			end_date.setHours(23)
			end_date.setSeconds(59)
			end_date.setMilliseconds(59);
			this.appointmentListFilterForm.get('end_date').setValue(end_date,{emitEvent:false})
		
		}
	}

	onchangeEndDate(end_date)
	{
		let start_date= this.appointmentListFilterForm.get('start_date').value;
		start_date=new Date(start_date)
		end_date=new Date(end_date)
		if(end_date<start_date)
		{
			
			start_date=new Date(end_date);
			start_date.setMinutes(0)
			start_date.setHours(0)
			start_date.setSeconds(0)
			start_date.setMilliseconds(59);
			end_date.setMinutes(59)
			end_date.setHours(23)
			end_date.setSeconds(59)
			end_date.setMilliseconds(59);
			this.appointmentListFilterForm.get('start_date').setValue(start_date,{emitEvent:false})
		
		}
	}
	public getAllAppointment(requestParam) {	
		this.startLoader=true;
		
		let params = {
			appointment_type:'SCHEDULED',
			filters:requestParam,
			per_page: requestParam['per_page'],
			paginate: requestParam['paginate'],
			page: requestParam['page'],
		}
			this.requestService
				.sendRequest(
					AppointmentUrlsEnum.getAppointmentAllDetailsList,
					'POST',
					REQUEST_SERVERS.schedulerApiUrl1,
					params
				).subscribe(
					(res: HttpSuccessResponse) => {
						this.data = [];
						this.deleteAllKios = []
						this.deleteAll = [];
						this.deleteAllPermanat = [];
						this.allChecked = false;
						let appointmentData:any[]=[] = res.result.data&& res.result.data.docs?res.result.data.docs:[];
						this.page.totalElements=res.result.data && res.result.data.total?res.result.data.total:0
						this.appointment_list_count=this.page.totalElements
						let appointment_ids = [];
						appointmentData.forEach((item) =>
						{
							appointment_ids.push(item.id)
						});
						if (appointment_ids.length != 0)
						{
							
						for (let i = 0; i < appointmentData.length; i++) {
							appointmentData[i]['isChecked'] = false;
							this.data = [...appointmentData];
							let clinicId = this.data[i].facility_location_id
							if (this.aclService.hasPermission(this.userPermissions.appointment_delete)
								|| this.storageData.isSuperAdmin()) {
								this.data[i]['deleteDisable'] = false
							}
							else {
								this.data[i]['deleteDisable'] = true
							}
							if (this.aclService.hasPermission(this.userPermissions.appointment_edit)
								|| this.storageData.isSuperAdmin()) {
								this.data[i]['updateDisable'] = false
							}
							else {
								this.data[i]['updateDisable'] = true
							}
							if (this.aclService.hasPermission(this.userPermissions.appointment_add)
								|| this.storageData.isSuperAdmin()) {
								this.data[i]['scheduleDisable'] = false
							}
							else {
								this.data[i]['scheduleDisable'] = true;
							}
							if (this.aclService.hasPermission(this.userPermissions.waiting_list_add)
								|| this.storageData.isSuperAdmin()) {
								this.data[i]['waitingListDisable'] = false
							}
							else {
								this.data[i]['waitingListDisable'] = true
							}
						}
						this.data = [...this.data];
						this.startLoader = false;
					}else{
						this.data = [];
					}
					this.startLoader = false;
					this.tableColumns();
					}, err => {
						this.startLoader = false;
						this.data = [];
					})
	}
	public getAllStatus() {

		this.requestService
			.sendRequest(
				AddToBeSchedulledUrlsEnum.GetAllStatus,
				'GET',
				REQUEST_SERVERS.kios_api_path
			).subscribe(
				(res: any) => {
					this.visitStatus=[];
					if (res && res.result && res.result.data){
					let visitStatus:any[] = res.result.data;
					visitStatus.forEach((visit:any, index)=>{
						if (this.vistStatusAllowedSlugs.includes(visit.slug)){
							this.visitStatus.push(visit);
							}
							if (visit.slug == 'walk_in_not_seen') {
								this.notseenId = visit.id
							} else if (visit.slug == 'walk_in') {
								this.walk_in = visit.id
							}
					});
				}
					if (this.visitStatus && this.visitStatus.length!=0){
					 this.visitStatusFilter = this.visitStatus[0].name;
					}
					this.visitStatus=[...this.visitStatus];
				})
		this.requestService
			.sendRequest(
				AddToBeSchedulledUrlsEnum.getAppointmentStatus,
				'GET',
				REQUEST_SERVERS.schedulerApiUrl1
			).subscribe(
				(res: any) => {
					this.appointmentStatus = [...res.result.data]
					this.appointmentStatus.forEach((appoitnmentStatus:any, index)=>{
						if (this.appointmentStatusAllowedSlugs.includes(appoitnmentStatus.slug)){
							this.allowedAppointmentStatus.push(appoitnmentStatus);
							}	
					});
					this.allowedAppointmentStatus= [...this.allowedAppointmentStatus];
					this.filteredAppointmentStatus = this.allowedAppointmentStatus.map((appointmentStatus)=>{
						return appointmentStatus.name === 'Arrived' ? appointmentStatus : {...appointmentStatus,disabled:true}
					});
					this.allDisabledAppointmentStatus = this.allowedAppointmentStatus.map((appointmentStatus)=>{
						return {...appointmentStatus,disabled:true}
					});
				})
	}
	public visitTypeChange(e) {
		this.visitTypeFilter = e.target.value
	}
	public visitStatusChange(e) {
		this.visitStatusFilter = e.target.value
	}
	public caseTypeChange(e) {
		this.caseTypeFilter = e.target.value
	}

	public contains(arr, key, val) {
		for (var i = 0; i < arr.length; i++) {

			if (arr[i][key] === val[key]) {
				return true;
			}
		}
		return false;
	}

	getAppointmentsByPageNo(pageInfo)
	{
		let st;
		let ed;
		this.page.pageNumber=pageInfo.offset;
		const PageNumber= this.page.pageNumber+1;
		let reqObj = this.appointmentListFilterForm.getRawValue();
		reqObj['case_ids'] = [reqObj['case_ids']];
		if(reqObj['case_ids'][0] == null) {
			delete reqObj['case_ids'];
		}
		if(reqObj.start_date!=null)
		{
			st = new Date(reqObj.start_date)
			st.setMinutes(0)
			st.setHours(0)
			st.setSeconds(0)
			st.setMilliseconds(0)
		}
		else
		{
			st = new Date()
			st.setMinutes(0)
			st.setHours(0)
			st.setSeconds(0)
			st.setMilliseconds(0)
		}
		if(reqObj.end_date!=null)
		{
			ed = new Date(reqObj.end_date)
			ed.setMinutes(59)
			ed.setHours(23)
			ed.setSeconds(59)
			ed.setMilliseconds(0)
		}
		else
		{
			ed = new Date()
			ed.setMinutes(59)
			ed.setHours(23)
			ed.setSeconds(59)
			ed.setMilliseconds(0)
		}
		
		reqObj.facility_location_ids=reqObj.facility_location_ids&&reqObj.facility_location_ids.length>0?reqObj.facility_location_ids:this.storageData.getFacilityLocations()
		reqObj.start_date=convertDateTimeForSending(this.storageData, new Date(st))
		reqObj.end_date=convertDateTimeForSending(this.storageData, new Date(ed))
		reqObj=removeEmptyAndNullsFormObject(reqObj);

		this.queryParams = {
			...reqObj,
			per_page: this.page.size || 10,
			page: PageNumber,
			paginate: true,
		};
		this.getAllAppointment(this.queryParams)
	}
	addUrlQueryParams(params?) {
		this.location.replaceState(
			this.router.createUrlTree([], { queryParams: params, }).toString()
		);
	}


	public applyFilters() {
		this.appointment_list_count=this.data.length
	}
	public changeDate() {
		if (this.currentDateTime != null && this.endDateTime == null) {
			this.currentDateTime.setSeconds(0)
			this.currentDateTime.setMilliseconds(0)
			this.getAppointmentsByPageNo({offset:this.page.pageNumber});
		}
		else if (this.currentDateTime == null && this.endDateTime != null) {
			this.endDateTime.setSeconds(0)
			this.endDateTime.setMilliseconds(0)
			this.getAppointmentsByPageNo({offset:this.page.pageNumber});
		}
		else if (this.currentDateTime == null && this.endDateTime == null) {

			this.getAppointmentsByPageNo({offset:this.page.pageNumber});
		}
		else if (this.currentDateTime != null && this.endDateTime != null) {
			this.currentDateTime.setSeconds(0)
			this.endDateTime.setSeconds(0)
			this.currentDateTime.setMilliseconds(0)
			this.endDateTime.setMilliseconds(0)
			if (this.currentDateTime > this.endDateTime) {
				return;
			}
			else {
				this.getAppointmentsByPageNo({offset:this.page.pageNumber});
			}
		}
	}

	public scheduleAppointment(obj) {
		this.appointmentSubjectService.particularPatientInfo = obj;
		const scheduler = this.storageData.getSchedulerInfo();
		obj['chartNo'] = obj.patientId;
		scheduler.patientData = JSON.stringify(obj);
		this.storageData.setSchedulerInfo(scheduler);
		this.appointmentSubjectService.refreshScheduler('Scheduler Load');
		this._router.navigate(['/front-desk/cases/edit/' + obj.caseId + '/scheduler'])
	}
	public editAppointment(event) {
		this.startLoader = true;
		this.requestService
						.sendRequest(
							AppointmentUrlsEnum.getAppointmentDetails,
							'GET',
							REQUEST_SERVERS.schedulerApiUrl,
							{id:event.id}
						).subscribe(res=>{
							this.startLoader = false;
							let data = res.result.data;
							if (data['physician_clinic']){
							data['physician_clinic'] = {
								physician: {
									first_name: data['physician_clinic']['first_name'],
									last_name:data['physician_clinic']['last_name'],
									middle_name:data['physician_clinic']['middle_name'],
									name:data['physician_clinic']['name'],
									street_address:data['physician_clinic']['street_address'],
									zip:data['physician_clinic']['zip'],
									city:data['physician_clinic']['city'],
									floor:data['physician_clinic']['floor'],
									state:data['physician_clinic']['state'],
									physician_clinic_id:data['physician_clinic']['id'],
									referring_physician_speciality :data['physician_clinic']['referring_physician_speciality'],
									clinic_id:data['physician_clinic']['clinic_id'],
									id: data['physician_clinic']['id'],
									clinic_location_id:data['physician_clinic']['clinic_locations_id'],
									facility_id:data['physician_clinic']['facility_id'],
						            facility_name: data['physician_clinic']['name'],
						            facility_city: data['physician_clinic']['facility_city'],
						            facility_address: data['physician_clinic']['facility_address'],
						            facility_zip: data['physician_clinic']['facility_zip'],
						            facility_state: data['physician_clinic']['facility_state'],
						            facility_floor: data['physician_clinic']['facility_floor']

								}
							}
						}
							let params = {
								"appointment_title": data["appointment_title"],
								"patientName": data['patient'] ? ((data["patient"]['first_name'] || '') + ' ' +(data["patient"]['middle_name'] || '') + ' ' + (data["patient"]['last_name'] || '')) : null,
								"patient_id": data["patient_id"],
								"case_id": data["case_id"],
								"case_type_id":data['case_type']["id"],
								"case_type_name" : data['case_type']["name"],
								"doctor_id": data['doctor_info']?data['doctor_info']['doctor_id']:0,
								"docName":data['doctor_info']?`${data['doctor_info']['first_name']} ${data['doctor_info']['middle_name']?data['doctor_info']['middle_name']:''} ${data['doctor_info']['last_name']}`:null,
								"duration": data["time_slots"],
								"time_slot": data["time_slots"],
								"startDateTime": 				convertDateTimeForRetrieving(this.storageData, new Date(data["scheduled_date_time"])),

								"priority_id": data['priority']["id"],
								"appointment_type_id": data['appointment_type']["id"],
								"comments": data["comments"],
								"facility_id": data['facility_location']['id'],
								"speciality_id": data['speciality']['id'],
								"appointmentId": data['id'],
								"visitTypeid": data['appointment_type']["id"],
								"confirmation_status": data["confirmation_status"],
								cd_image:data['cd_image'],
								is_transportation:data['is_transportation'],
								transportations:data['transportations'],
								physician_clinic: data['physician_clinic'],
								physician: data && data['physician_clinic']?data['physician_clinic']["physician"]:null,
								reading_provider:data['reading_provider'],
								reading_provider_id:data['reading_provider']?data['reading_provider']['id']:null,
								appointment_cpt_codes: data['appointment_cpt_codes'],
								change_cpt_response:true,
							}
							this.doctorCalendarService.updateModalData= {
								...params
							}
							const activeModal = this.updateModal.open(UpdateAppoitModalComponent, {
								
								backdrop: 'static',
								keyboard: false,
								windowClass: 'modal-view',
							});	
						},err=>{
							this.startLoader = false;
						});
		
	}

	mapAppointmentDetail(event){
		let viewAppointmentObj;
			let readingProivderMiddlename= event["reading_provider"] && event["reading_provider"]['middle_name']?event["reading_provider"]['middle_name']:'';
			event['patient']?	event['patient']['id'] = event['patient_id']:false;
			if (event['physician_clinic']){
				event['physician_clinic'] = {
					physician: {
						first_name: event['physician_clinic']['first_name'],
						last_name:event['physician_clinic']['last_name'],
						middle_name:event['physician_clinic']['middle_name'],
						billingTitle:event['physician_clinic']['billingTitle'],
						name:event['physician_clinic']['name'],
						street_address:event['physician_clinic']['street_address'],
						zip:event['physician_clinic']['zip'],
						floor:event['physician_clinic']['floor'],
						city:event['physician_clinic']['city'],
						state:event['physician_clinic']['state'],
						physician_clinic_id:event['physician_clinic']['id'],
						referring_physician_speciality :event['physician_clinic']['referring_physician_speciality'],
						clinic_id:event['physician_clinic']['clinic_id'],
						id: event['physician_clinic']['id'],
						clinic_location_id:event['physician_clinic']['clinic_locations_id'],
						facility_id:event['physician_clinic']['facility_id'],
						facility_name: event['physician_clinic']['name'],
						facility_city: event['physician_clinic']['facility_city'],
						facility_address: event['physician_clinic']['facility_address'],
						facility_zip: event['physician_clinic']['facility_zip'],
						facility_state: event['physician_clinic']['facility_state'],
						facility_floor: event['physician_clinic']['facility_floor'],


					}
					}
				}

			return  {
				action_performed: event["confirmation_status"],
				change_cpt_response:true,
				 appointmentCptCodes: event["appointment_cpt_codes"] ?event["appointment_cpt_codes"]:[] ,
				appointmentStatus : event["appointment_status"]?{name:event["appointment_status"]['name']}:null,
				appointmentType:null,
				appointment_title:event["appointment_title"],
				availableDoctor:event["doctor_info"]? {doctor_id:event['doctor_info']["id"]}:null,
				reading_provider: event["reading_provider"]? 
				`${event["reading_provider"]['first_name']} ${readingProivderMiddlename} ${event["reading_provider"]['last_name']}`
				:null,
				billable:event["billable"],
				cancelled:false	,			
				cancelled_comments:	""	,	
				caseType:{name:event['case_type']['name']},
				case_id: event["case_id"],
				case_type_id:event['case_type']['id'],
				comments:event["comments"],
				confirmation_status: event["appointment_confirmation_status"],
				doctor_full_name: event['doctor_info']?event['doctor_info']["first_name"] + (event['doctor_info']["middle_name"]?' '+event['doctor_info']["middle_name"]:' ') + (event['doctor_info']["last_name"]) + (event['doctor_info']["billingTitle"]?', '+ event['doctor_info']["billingTitle"] : '') : null,
				evaluation_date_time: convertDateTimeForRetrieving(this.storageData, new Date(event["scheduled_date_time"])),
				facility_location_id: event["facility_location_id"],
				facility_location_name:event['facility_location']["facility"]&&event['facility_location']["facility"]['name'] && event['facility_location']["name"]? event['facility_location']["facility"]['name']+' - '+ event['facility_location']["name"]:
				
				!event['facility_location']["facility"]  && event['facility_location']["name"]?'- '+event['facility_location']["name"]:null,
				facility_location_qualifier:
				event['facility_location']["facility"]&&
				event['facility_location']["facility"]['qualifier']
				&& 
				event['facility_location']["qualifier"]? event['facility_location']["facility"]['qualifier']+' - '+ 
				event['facility_location']["qualifier"]:!event['facility_location']["facility"]  && 
				event['facility_location']["qualifier"]?'- '
				+	event['facility_location']["qualifier"]:null,
				id: event["id"],
				patient: event['patient'],
				patientSessions: event["patient_session"],
				cd_image: event["cd_image"],
				patient_id: event["patient_id"],
				physician_clinic: event['physician_clinic'],
				physician: event && event['physician_clinic']?event['physician_clinic']["physician"]:null,
				physician_id: null,
				priority: null,
				priority_id:event['priority']["id"],
				scheduled_date_time:
				convertDateTimeForRetrieving(this.storageData, new Date(event["scheduled_date_time"])),
				speciality:{id:event['speciality']["id"],name:event['speciality']["name"],
			qualifier:event['speciality']['qualifier']
			},
				technician_id: null,
				time_slots: event["time_slots"],
				transportations:event["transportations"],
				type_id:event['appointment_type']["id"],
				visit_type: event['appointment_type']['name'],
				visit_status:event['visit_status']['name'],
			}


	}
	public ViewAppointment(event) {
		this.startLoader = true;
		let viewAppointmentObj;
		this.requestService
						.sendRequest(
							AppointmentUrlsEnum.getAppointmentDetails,
							'GET',
							REQUEST_SERVERS.schedulerApiUrl,
							{id:event.id}
						).subscribe(res=>{
							this.startLoader= false;
							if (res && res.result && res.result.data){
							 viewAppointmentObj = {...this.mapAppointmentDetail(res.result.data)};
							 				 
			const ngbModalOptions: NgbModalOptions = {
				backdrop: 'static',
				keyboard: false,
				windowClass: 'modal-view',
				
			};
		this.activeModalViewAppointment = this.updateModal.open(ViewAppoitModalComponent, ngbModalOptions);
		this.activeModalViewAppointment.componentInstance.viewCurrentAppointment= viewAppointmentObj;
		this.activeModalViewAppointment.componentInstance.onlyView=true;
		this.activeModalViewAppointment.componentInstance.openAsModal=true;
		this.activeModalViewAppointment.result.then(res=>{
		});
							}
						},err=>{
							this.startLoader = false;
						}
						);

	}
	public addToWaitingList(event) {
		if (event['doctorId'] != undefined) {
			
			this.doctorCalendarService.updateModalData = {
				"appointmentTitle": event["appointmentTitle"],
				"patientName": event["patientMiddleName"] ? event["patientFirstName"] + ' ' + event["patientMiddleName"] + ' ' + event["patientLastName"] : event["patientFirstName"] + ' ' + event["patientLastName"],
				"chartNo": event["patientId"],
				"caseId": event["caseId"],
				"caseType" : event["caseType"],
				"docId": event['docId'],
				"docName": event['doctorName'],
				"duration": event["duration"],
				"timeSlot": event["timeSlot"],
				"startDateTime": event["appointmentTime"],
				"priorityId": event["priorityId"],
				"appointmentTypeId": event["appointmentTypeId"],
				"roomId": event["roomId"],
				"comments": event["appointmentComments"],
				"clinicId": event['facilityId'],
				"specId": event['specialityId'],
				"appointmentId": event["appointmentId"],
				"visitTypeid": event["visitTypeId"]
			}
		}
		else {
			this.doctorCalendarService.updateModalData = {
				"appointmentTitle": event["appointmentTitle"],
				"patientName": event["patientMiddleName"] ? event["patientFirstName"] + ' ' + event["patientMiddleName"] + ' ' + event["patientLastName"] : event["patientFirstName"] + ' ' + event["patientLastName"],
				"chartNo": event["patientId"],
				"caseId": event["caseId"],
				"caseType" : event["caseType"],
				"docId": 0,
				"docName": "N/A",
				"duration": event["duration"],
				"timeSlot": event["timeSlot"],
				"startDateTime": event["appointmentTime"],
				"priorityId": event["priorityId"],
				"appointmentTypeId": event["appointmentTypeId"],
				"roomId": event["roomId"],
				"comments": event["appointmentComments"],
				"clinicId": event['facilityId'],
				"specId": event['specialityId'],
				"appointmentId": event["appointmentId"],
				"visitTypeid": event["visitTypeId"]
			}
		}
		const activeModal = this.updateModal.open(AddToWaitingListModalComponent, {
			size: 'lg', backdrop: 'static',
			keyboard: false
		});
	}
	public openAndCloseFilters() {
		this.isOpenFilters = !this.isOpenFilters;
	}
	public changeNoOfEntries(e, event?) {
		this.page.size=+e
		this.page.pageNumber=0;
		this.getAppointmentsByPageNo({offset:this.page.pageNumber})
	}
	public particularSelected(data, e) {
		if (e.checked) {
					data.isChecked = true;
					if ((data.speciality_id != undefined && data.facility_location_id != undefined) || data.doctor_id != undefined) {
						
							if( ((!data['visit_session'] && data.patient_status_slug!=="in_session") && data.billable==null && data.doctor_id && data.appointment_status_slug!='no_show'  && data.appointment_status_slug!='completed') 
							||(( data['visit_session'] && data.patient_status_slug!=="in_session") && data.doctor_id && data.appointment_status_slug!='no_show')
							|| (data?.appointment_status_slug==='scheduled') && data?.visit_status_slug==='scheduled' 
							|| (data?.appointment_status_slug==='rescheduled') && data?.visit_status_slug==='rescheduled' 
							|| (data?.appointment_status_slug==='arrived') && data?.visit_status_slug==='arrived' 
							|| (data?.appointment_status_slug==='no_show') && data?.visit_status_slug==='no_show')
						{
								this.deleteAll.push(data.id);
							}
					}
					else {
						this.deleteAllKios.push(data.id)
					}
					this.deleteAllPermanat.push(data.id);
			let all_checked=this.data.every(data=>{ return data.isChecked})
			if (all_checked ) {
				this.allChecked = true;
			}
		}
		else {
			this.allChecked = false					
					if ((data.speciality_id != undefined && data.facility_location_id != undefined) || data.doctor_id != undefined) {
						data.isChecked = false;
					
						if( ((!data['visit_session'] && data.patient_status_slug!=="in_session")&&data.billable==null && data.doctor_id && data.appointment_status_slug!='no_show'  && data.appointment_status_slug!='completed') 
						||((data['visit_session'] && data.patient_status_slug!=="in_session")&& data.doctor_id && data.appointment_status_slug!='no_show') 
						|| (data?.appointment_status_slug==='scheduled') && data?.visit_status_slug==='scheduled' 
						|| (data?.appointment_status_slug==='rescheduled') && data?.visit_status_slug==='rescheduled' 
						|| (data?.appointment_status_slug==='arrived') && data?.visit_status_slug==='arrived' 
						|| (data?.appointment_status_slug==='no_show') && data?.visit_status_slug==='no_show' 
						)
						{
								this.deleteAll.splice(this.deleteAll.indexOf(data.id), 1)
							}
					}
					else {
						data['isChecked'] = false;
						this.deleteAllKios.splice(this.deleteAllKios.indexOf(data.id), 1)
					}
					this.deleteAllPermanat.splice(this.deleteAllPermanat.indexOf(data.id), 1)
		}
	}
	public allSelected(e) {
		if (e.checked) {
			this.allChecked = true;
			for (var i = 0; i < this.data.length; i++) {
				if (this.data[i] != undefined) {
					this.data[i]['isChecked_for_delete'] = true;
					if (this.data[i]['isChecked'] == false) {
						this.deleteAllPermanat.push(this.data[i].id);
						if ((this.data[i].speciality_id != undefined && this.data[i].facility_location_id != undefined) || this.data[i].doctor_id != undefined) {
							if(((!this.data[i]['visit_session'] && this.data[i].patient_status_slug!=="in_session")&&this.data[i].billable==null && this.data[i].doctor_id && this.data[i].appointment_status_slug!='no_show'  && this.data[i].appointment_status_slug!='completed')
							 ||(( this.data[i].patient_status_slug!=="in_session") && this.data[i].doctor_id && this.data[i].appointment_status_slug!='no_show' ) 
							 || (this.data[i]?.appointment_status_slug==='scheduled') && this.data[i]?.visit_status_slug==='scheduled' 
							 || (this.data[i]?.appointment_status_slug==='rescheduled') && this.data[i]?.visit_status_slug==='rescheduled' 
							 || (this.data[i]?.appointment_status_slug==='arrived') && this.data[i]?.visit_status_slug==='arrived' 
							 || (this.data[i]?.appointment_status_slug==='no_show') && this.data[i]?.visit_status_slug==='no_show')

							{
								if((this.data[i]?.appointment_status_slug!=='arrived') && this.data[i]?.visit_status_slug!=='in_session' 
								&& (this.data[i]?.appointment_status_slug!=='completed') && this.data[i]?.visit_status_slug!=='checked_out'){
									this.data[i]['isChecked'] = true;
									this.deleteAll.push(this.data[i].id);
								}
							}
							else if( ((!this.data[i]['visit_session'] && this.data[i].patient_status_slug!=="in_session")&&!this.data[i].doctor_id && this.data[i].appointment_status_slug!='no_show'  && this.data[i].appointment_status_slug!='completed') 
							||((this.data[i]['visit_session'] && this.data[i].patient_status_slug!=="in_session")  &&!this.data[i].doctor_id && this.data[i].appointment_status_slug!='no_show'))

							{
								if((this.data[i]?.appointment_status_slug!=='arrived') && this.data[i]?.visit_status_slug!=='in_session' 
								&& (this.data[i]?.appointment_status_slug!=='completed') && this.data[i]?.visit_status_slug!=='checked_out'){
									this.data[i]['isChecked'] = true;
									this.deleteAll.push(this.data[i].id);
								}
							}
							
						}
						else {
							this.data[i]['isChecked'] = true;
							this.deleteAllKios.push(this.data[i].id);
						}
					}
				}
			}
		}
		else {
			this.allChecked = false;
			for (var i = 0; i < this.data.length; i++) {
				if (this.data[i] != undefined) {
					this.data[i]['isChecked_for_delete'] = false;
					this.deleteAllPermanat.splice(this.deleteAllPermanat.indexOf(this.data[i].id), 1)
					if (this.data[i]['isChecked'] == true) {
						if ((this.data[i].speciality_id != undefined && this.data[i].facility_location_id != undefined) || this.data[i].doctor_id != undefined) {
						
							if( ((!this.data[i]['visit_session'] && this.data[i].patient_status_slug!=="in_session")&&this.data[i].billable==null && this.data[i].doctor_id&& this.data[i].appointment_status_slug!='no_show'  && this.data[i].appointment_status_slug!='completed') 
							||(( this.data[i]['visit_session']&& this.data[i].patient_status_slug!=="in_session")  && this.data[i].doctor_id&& this.data[i].appointment_status_slug!='no_show'  )
							|| (this.data[i]?.appointment_status_slug==='scheduled') && this.data[i]?.visit_status_slug==='scheduled' 
							|| (this.data[i]?.appointment_status_slug==='rescheduled') && this.data[i]?.visit_status_slug==='rescheduled' 
							|| (this.data[i]?.appointment_status_slug==='arrived') && this.data[i]?.visit_status_slug==='arrived' 
							|| (this.data[i]?.appointment_status_slug==='no_show') && this.data[i]?.visit_status_slug==='no_show')

							{
								this.data[i]['isChecked'] = false;
								this.deleteAll.splice(this.deleteAll.indexOf(this.data[i].id), 1)
							}

							else if( ((!this.data[i]['visit_session']&& this.data[i].patient_status_slug!=="in_session")&&!this.data[i].doctor_id&& this.data[i].appointment_status_slug!='no_show'  && this.data[i].appointment_status_slug!='completed') ||((this.data[i]['visit_session']&& this.data[i].patient_status_slug!=="in_session")  &&!this.data[i].doctor_id&& this.data[i].appointment_status_slug!='no_show'  ))

							{
								this.data[i]['isChecked'] = false;
								this.deleteAll.splice(this.deleteAll.indexOf(this.data[i].id), 1)
							}
							
						}
						else {
							this.data[i]['isChecked'] = false;
							this.deleteAllKios.splice(this.deleteAllKios.indexOf(this.data[i].id), 1)
						}
					}
				}
			}
		}
	}
	public resetFilters() {
		this.appointmentListFilterForm.reset({start_date:new Date(),end_date:new Date()},{emitEvent:false});
		this.page.pageNumber=0;
		this.page.size=10;
		this.eventsSubjectAppointment.next(true);
		this.getAppointmentsByPageNo({offset:this.page.pageNumber});
	}
	FilterSubmit() {
		this.page.pageNumber=0;
		this.getAppointmentsByPageNo({offset:this.page.pageNumber});
	}
	public Filter() {
		this.page.pageNumber=0;
		this.getAppointmentsByPageNo({offset:this.page.pageNumber});
	}
	public deleteParticularAppointment(data, appId) {
		this.customDiallogService.confirm('Cancel Appointment','Are you sure you want to cancel this appointment?','Yes','No')
		.then((confirmed) => {
			if (confirmed){
				if ((data.speciality_id == undefined && data.facility_location_id == undefined) && data.doctor_id == undefined) {
					const object = { 'ids': [data.appointment_id] }
					this.requestService
						.sendRequest(
							AppointmentUrlsEnum.remove_patient_status,
							'PUT',
							REQUEST_SERVERS.kios_api_path,
							object
						).subscribe(
							(response: any) => {
								this.toastrService.success(response.result.data, 'Success')

								this.showRefreshButtonAL=false;
								this.getAppointmentsByPageNo({offset:this.page.pageNumber});
							})
				}
				else {
					this.doctorCalendarService.deleteAppId = [appId];
					const activeModal = this.updateModal.open(DeleteReasonComponent, {
						size: 'sm', backdrop: 'static',
						keyboard: false, windowClass: 'cancel-modal'
					});
				}
				this.cdr.detectChanges();
			}else if(confirmed === false){
			}else{
			}
		})
		.catch();
	
	}
	deletePermentParticularAppointmentInList(id) {

this.customDiallogService.confirm('Delete','Are you sure you want to delete?','Yes','No')
		.then((confirmed) => {
			if (confirmed){
				this.startLoader = true;
				const object = { appointment_ids: [id] };
				this.requestService
					.sendRequest(
						CancelAppointmentListUrlsEnum.deleteCancelledAppointments,
						'delete_with_body',
						REQUEST_SERVERS.schedulerApiUrl1,
						object,
					)
					.subscribe((res: any) => {
						this.startLoader = false;
						if(res['status'] === 200){
							this.toastrService.success('Successfully deleted', 'Success');
							this.getAppointmentsByPageNo({ offset: this.page.pageNumber });
						}else{
							this.toastrService.success(res.message, 'Success');	
						}
					},err=>{
						this.startLoader = false;
					});
			}else if(confirmed === false){
			}else{
			}
		})
		.catch();

	}
	deleteAllAppoinmtmentListPermanent(){
		this.customDiallogService.confirm('Delete','Are you sure you want to delete?','Yes','No')
		.then((confirmed) => {
			if (confirmed){
				this.startLoader = true;
				const object = { appointment_ids: this.deleteAllPermanat };
				this.requestService
					.sendRequest(
						CancelAppointmentListUrlsEnum.deleteCancelledAppointments,
						'delete_with_body',
						REQUEST_SERVERS.schedulerApiUrl1,
						object,
					)
					.subscribe((res: any) => {
						this.startLoader = false;
						if(res['status'] === 200){
							this.toastrService.success('Successfully deleted', 'Success');
							this.getAppointmentsByPageNo({ offset: this.page.pageNumber });
						}else{
							this.toastrService.success(res.message, 'Success');	
						}
					},err=>{
						this.startLoader = false;
					});
			}else if(confirmed === false){
			}else{
			}
		})
		.catch();

	}
	public changePage(e) {
		this.allChecked = false;
		this.page.pageNumber= e.offset;
		this.getAppointmentsByPageNo({offset:this.page.pageNumber});
		
	}

	public changePageWL(e) {
		this.allChecked = false;
		this.page.pageNumber= e.offset;
		this.getAllAppointmentWL({offset:this.page.pageNumber});
		
	}
	public deleteAllAppoinmtment() {
		this.isKiosPatient = false;
		for (var i = 0; i < this.data.length; i++) {
			if (this.data[i]['isChecked'] == true) {
				if ((this.data[i].speciality_id == undefined && this.data[i].facility_location_id == undefined) && this.data[i].doctor_id == undefined) {
					this.isKiosPatient = true;
				}
			}
		}
		if (this.isKiosPatient) {
			if (this.deleteAll.length != 0) {
				

this.customDiallogService.confirm('Delete','Are you sure you want to delete?You have also selected patient having no appointment','Yes','No')
.then((confirmed) => {
	if (confirmed){
		const object = { 'ids': this.deleteAllKios }
		this.requestService
			.sendRequest(
				AppointmentUrlsEnum.remove_patient_status,
				'PUT',
				REQUEST_SERVERS.kios_api_path,
				object
			).subscribe(
				(res: any) => {
					this.toastrService.success(res.result.data, 'Success')
					this.getAppointmentsByPageNo({offset:this.page.pageNumber});

				})
		this.doctorCalendarService.deleteAppId = this.deleteAll;
		const activeModal = this.updateModal.open(DeleteReasonComponent, {
			size: 'sm', backdrop: 'static',
			keyboard: false
		});
	}else if(confirmed === false){
	}else{
	}
})
.catch();		
			}

			else {
				
this.customDiallogService.confirm('Delete','Are you sure you want to delete?You have selected patient having no appointment','Yes','No')
.then((confirmed) => {
	if (confirmed){
		const object = { 'ids': this.deleteAllKios }
		this.requestService
			.sendRequest(
				AppointmentUrlsEnum.remove_patient_status,
				'PUT',
				REQUEST_SERVERS.kios_api_path,
				object
			).subscribe(
				(response: any) => {
					this.toastrService.success(response.result.data, 'Success')
					this.getAppointmentsByPageNo({offset:this.page.pageNumber});
				})
	}else if(confirmed === false){
	}else{
	}
})
.catch();

			}
		}
		else {

			this.customDiallogService.confirm('Cancel Appointment','Are you sure you want to cancel the appointment?','Yes','No')
			.then((confirmed) => {
				if (confirmed){
					this.doctorCalendarService.deleteAppId = this.deleteAll;
					const activeModal = this.updateModal.open(DeleteReasonComponent, {
						size: 'sm', backdrop: 'static',
						keyboard: false
					});
				}else if(confirmed === false){
				}else{
				}
			})
			.catch();

		
		}
	}


	public getAllAppointmentWL(pageInfo) {
		if (this.currentDateTime != undefined && this.endDateTime != undefined) {
			if (this.currentDateTime > this.endDateTime) {
				this.toastrService.error('Future date cannot be selected.','Error')

				return;
			}
			let st = new Date(this.currentDateTime)
			st.setMinutes(0)
			st.setHours(0)
			st.setSeconds(0)
			st.setMilliseconds(0)
			let ed = new Date(this.endDateTime)
			ed.setMinutes(59)
			ed.setHours(23)
			ed.setSeconds(0)
			ed.setMilliseconds(0);
			let convertedStDate = convertDateTimeForSending(this.storageData, new Date(st))
			let convertedEdDate = convertDateTimeForSending(this.storageData, new Date(ed))

			let formattedSt = changeDateFormat(convertedStDate)
			let formattedEd = changeDateFormat(convertedEdDate)
			this.page.pageNumber=pageInfo.offset;
			const PageNumber= this.page.pageNumber+1;
			var reqObj = {
				"case_ids":this.myForm.value.case_ids,
				"patient_name":this.myForm.value.patient_name,
				'case_type_ids':this.myForm.value.case_type_ids?this.myForm.value.case_type_ids:[],
				'updated_by_ids': this.myForm.value.updated_by_ids?this.myForm.value.updated_by_ids:[],
				'created_by_ids': this.myForm.value.created_by_ids?this.myForm.value.created_by_ids:[],
				'created_at': this.myForm.value.created_at?this.myForm.value.created_at:null,
				'updated_at': this.myForm.value.updated_at?this.myForm.value.updated_at:null,
				"checked_in_date_from": formattedSt,
				"checked_in_date_to": formattedEd,
				facility_location_ids: this.myForm.value.facility_location_ids,
				"page":PageNumber,
				per_page:+this.page.size,
				order_by:OrderEnum.ASC,
				pagination:true
			}
			this.startLoader=true;
			this.requestService
				.sendRequest(
					AppointmentUrlsEnum.getAppointmentListWL,
					'POST',
					REQUEST_SERVERS.kios_api_path,
					removeEmptyAndNullsFormObject(reqObj)
				).subscribe(
					(res: HttpSuccessResponse) => {
						this.startLoader = false;
						this.deleteAllKios = []
						this.deleteAll = [];
						this.deleteAllPermanat = [];
						this.allChecked = false;
						this.dataWL = JSON.parse(JSON.stringify(res.result.data));
						this.page.totalElements=res.result.data.checked_in_patients?res.result.data.checked_in_patients.total:0;
						this.waiting_list_count=this.page.totalElements;
						this.dataWL['checked_in_patients'] = this.dataWL && this.dataWL['checked_in_patients'] && this.dataWL['checked_in_patients'].docs?this.reverseArrWL(this.dataWL):[];
						this.tableColumns();
						for (let i = 0; i < (this.dataWL['checked_in_patients']&&this.dataWL['checked_in_patients'].length); i++) {
							this.dataWL['checked_in_patients'][i]['isChecked'] = false;

							for (var ii = 0; ii < this.visitStatus.length; ii++) {
								if (this.dataWL['checked_in_patients'][i]['status_id'] == this.visitStatus[ii]['id']) {
									this.dataWL['checked_in_patients'][i]['patientStatus'] = this.visitStatus[ii]['name'];
								}
							}
						
							if (this.dataWL['checked_in_patients'][i]['appointment_status'] == undefined) {
								this.dataWL['checked_in_patients'][i]['appointmentStatus'] = "N/A";
							}
							else {
								this.dataWL['checked_in_patients'][i]['appointmentStatus'] = this.dataWL['checked_in_patients'][i]['appointment_status'];
								
							}
						}
					}, err => {
						this.startLoader = false;
						if(err.status===500)
						{
							this.toastrService.error(err.error.message,"Error");
						}
						this.dataWL = [];
					})
		} else {
			this.startLoader = false;
		}
	}


	reverseArrWL(arr) {
		var revArr = [];
		for (let i = arr['checked_in_patients'].docs.length - 1; i >= 0; i--) {
			revArr.push(arr['checked_in_patients'].docs[i]);
		}

		return revArr;
	}


	public deleteParticularAppointmentWL(data, appId) {

		
this.customDiallogService.confirm('Remove','Are you sure you want to remove this patient from waiting list?','Yes','No')
.then((confirmed) => {
	if (confirmed){
		this.startLoader=true;
		const object = { 'ids': [data.id] }
		this.requestService
			.sendRequest(
				AppointmentUrlsEnum.remove_patient_status,
				'PUT',
				REQUEST_SERVERS.kios_api_path,
				object
			).subscribe(
				(response: any) => {
					this.toastrService.success('Patient deleted successfully', 'Success')
					this.startLoader=false;
					this.getAllAppointmentWL({offset:this.page.pageNumber||0})
				},err=>{
					this.startLoader=false;
				})

		this.cdr.detectChanges();
	}else if(confirmed === false){
	}else{
	}
})
.catch();

	}

	getAppointmentCount(countFor)
	{
				this.requestService
					.sendRequest(
						AppointmentUrlsEnum.getAppointmentCount,
						'Post',
						REQUEST_SERVERS.schedulerApiUrl1,
						this.makeRequestObject(countFor)
					).subscribe(
						(response:  HttpSuccessResponse) => {
						     if (countFor === 'appointmentList'){
								this.waiting_list_count = response?.result?.data?.checked_in_patients;
							 }
							 else if (countFor === 'appointmentList'){
								this.appointment_list_count = response?.result?.data?.appointment_count;
							 }
						})
	}

	get getOrderBy(){
		return {order_by:OrderEnum.ASC}
	}

	makeRequestObject(countFor):any
	{
		switch(countFor)
		{
			case 'appointmentList':{
				if (this.currentDateTime != undefined && this.endDateTime != undefined) {
					let st = new Date(this.currentDateTime)
					st.setMinutes(0)
					st.setHours(0)
					st.setSeconds(0)
					st.setMilliseconds(0)
					let ed = new Date(this.endDateTime)
					ed.setMinutes(59)
					ed.setHours(23)
					ed.setSeconds(59)
					ed.setMilliseconds(59)
					let convertedStDate = convertDateTimeForSending(this.storageData, new Date(st))
					
					let formattedSt = changeDateFormat(convertedStDate)
				let  reqObj = {
					"count_for": countFor,
					"case_ids":[],
					"current_date": formattedSt
				}
				return reqObj;
			}
			break;
			}
			case 'waitingList':
				{
				if ((this.currentDateTime != undefined && this.endDateTime != undefined) || (this.currentDateTime != null && this.endDateTime == null) || (this.currentDateTime == null && this.endDateTime != null) || (this.currentDateTime == null && this.endDateTime == null) || (this.currentDateTime == null && this.endDateTime == null)) {
					let st;
					let ed;
					let reqObj=this.appointmentListFilterForm.getRawValue();
					if(reqObj.start_date!=null)
					{
						st = new Date(reqObj.start_date)
						st.setMinutes(0)
						st.setHours(0)
						st.setSeconds(0)
						st.setMilliseconds(0)
					}
					else
					{
						st = new Date()
						st.setMinutes(0)
						st.setHours(0)
						st.setSeconds(0)
						st.setMilliseconds(0)
					}
					if(reqObj.end_date!=null)
					{
						ed = new Date(reqObj.end_date)
						ed.setMinutes(59)
						ed.setHours(23)
						ed.setSeconds(59)
						ed.setMilliseconds(59)
					}
					else
					{
						ed = new Date()
						ed.setMinutes(59)
						ed.setHours(23)
						ed.setSeconds(59)
						ed.setMilliseconds(59)
					}	
					reqObj.facility_location_ids=reqObj.facility_location_ids&&reqObj.facility_location_ids.length>0?reqObj.facility_location_ids:this.storageData.getFacilityLocations()
					reqObj.start_date=convertDateTimeForSending(this.storageData, new Date(st))
					reqObj.end_date=convertDateTimeForSending(this.storageData, new Date(ed));
					reqObj.count_for= countFor,
					reqObj=removeEmptyAndNullsFormObject(reqObj);
					return reqObj;
				}
				break;
			}
		}
	}

	public scheduleAppointmentWL(obj) {
		let convertedObj = obj;
		convertedObj['caseId'] = obj['case_id'];
		convertedObj['caseType'] = obj['case_type'];
		convertedObj['checkInId'] = null;//

		convertedObj['patientFirstName'] = obj['first_name'];
		convertedObj['patientId'] = obj['patient_id'];
		convertedObj['patientLastName'] = obj['last_name'];
		convertedObj['patientMiddleName'] = obj['middle_name'];
		convertedObj['patientPicture'] = null;//
		this.appointmentSubjectService.particularPatientInfo = convertedObj;
		const scheduler = this.storageData.getSchedulerInfo();
		convertedObj['chartNo'] = convertedObj.patient_id;
		scheduler.patientData = JSON.stringify(convertedObj);
		scheduler.toDelAppIdWL = JSON.stringify(obj);
		scheduler.toDelCheckWL = true
		this.storageData.setSchedulerInfo(scheduler)
		this.appointmentSubjectService.refreshScheduler('Scheduler Load');
		this._router.navigate(['/front-desk/cases/edit/' + convertedObj.case_id + '/scheduler'])
	}

	public changeNoOfEntriesWL(e, event?) {
		this.page.pageNumber=0;
		this.getAllAppointmentWL({offset:this.page.pageNumber||0})
	}
	public applyFiltersWL() {
		debugger;
		this.allChecked = false;
		this.deleteAll = [];
		this.deleteAllKios = [];
		this.deleteAllPermanat =[];
		this.page.pageNumber=0;

		this.getAllAppointmentWL({offset:this.page.pageNumber||0})
	}

	public resetFiltersWL() {
		this.deleteAll = []
		this.deleteAllKios = []
		this.deleteAllPermanat =[];
		this.allChecked = false;
		this.currentDateTime = new Date();
		this.endDateTime = new Date(this.currentDateTime)
		this.currentDateTime.setSeconds(0)
		this.endDateTime.setSeconds(0)
		this.currentDateTime.setMilliseconds(0)
		this.endDateTime.setMilliseconds(0)
		this.specSelectedMultiple = null;
		this.docSelectedMultiple = null;
		this.clinicSelectedMultiple = null;
		this.appTypeSelectedMultiple = null;
		this.visitStatusSelectedMultiple = null;
		this.appointmentStatusSelectedMultiple = null;
		this.caseTypeSelectedMultiple = null;
		this.page.pageNumber=0;
		this.page.size=10;
		this.page.totalElements=0
		this.eventsSubjectWaiting.next(true);
		this.caseIdsWaiting=[];
		this.myForm.reset();
		this.getAllAppointmentWL({offset:this.page.pageNumber||0})
	}
	public onChangeCheckedInDate(event)
	{
		if(event.dateValue)
		{
		 this.currentDateTime=new Date(event.dateValue);
		 this.changeDateWL();

		} 

	}

	public onChangeCheckedInDateTo(event)
	{
		if(event.dateValue)
		{
		  this.endDateTime=new Date(event.dateValue);
		  this.changeDateWL();
		} 
		else
		{
			this.endDateTime=null
		}
	}

	public changeDateWL() {
		if (this.currentDateTime != null && this.endDateTime != null) {
			this.currentDateTime.setSeconds(0)
			this.endDateTime.setSeconds(0)
			this.currentDateTime.setMilliseconds(0)
			this.endDateTime.setMilliseconds(0)
			if (this.currentDateTime > this.endDateTime) {
				this.toastrService.error('Future date cannot be selected.','Error')
				return;
			}
			else {
				this.getAllAppointmentWL({offset:this.page.pageNumber||0})
			}
		}
		if(this.currentDateTime == null)
		{
			this.currentDateTime = new Date()
			this.endDateTime = new Date(this.currentDateTime)
			this.currentDateTime.setHours(0)
			this.currentDateTime.setMinutes(0)
			this.currentDateTime.setSeconds(0)
			this.endDateTime.setHours(23)
			this.endDateTime.setMinutes(59)
			this.endDateTime.setSeconds(59)
			this.currentDateTime.setMilliseconds(0)
			this.endDateTime.setMilliseconds(0)
			if (this.currentDateTime > this.endDateTime) {
				this.toastrService.error('Future date cannot be selected.','Error')
				return;
			}
			else {
				this.getAllAppointmentWL({offset:this.page.pageNumber||0})
			}
		}
	}

	public particularSelectedWL(data, e) {
		if (e.checked) {
					this.deleteAllKios.push(data.id)
			let all_checked=this.dataWL['checked_in_patients'] && this.dataWL['checked_in_patients'].every(data=>{ return data.isChecked})
			 if (all_checked) {
				this.allChecked = true;
			}
			else {
				this.allChecked = false
			}
		}
		else {
			// this.numSelectedWl = this.numSelectedWl - 1;
			this.allChecked = false
			this.deleteAllKios.splice(this.deleteAllKios.indexOf(data.id), 1)

		}
	}


	public allSelectedWL(e) {
		if (e.checked) {
			this.allChecked = true;
				
			for (var i = 0; i < (this.dataWL['checked_in_patients']&&this.dataWL['checked_in_patients'].length); i++) {
				if (this.dataWL['checked_in_patients'][i] != undefined) {
					if (this.dataWL['checked_in_patients'][i]['isChecked'] == false) {
						this.dataWL['checked_in_patients'][i]['isChecked'] = true;
					
						this.deleteAllKios.push(this.dataWL['checked_in_patients'][i].id);
					
					}
				}
			}
		}
		else {
			this.allChecked = false;
				
			for (var i = 0; i < (this.dataWL['checked_in_patients']&& this.dataWL['checked_in_patients'].length); i++) {
				if (this.dataWL['checked_in_patients'][i] != undefined) {
					if (this.dataWL['checked_in_patients'][i]['isChecked'] == true) {
						this.dataWL['checked_in_patients'][i]['isChecked'] = false;
					
						this.deleteAllKios.splice(this.deleteAllKios.indexOf(this.dataWL['checked_in_patients'][i].id), 1)
					
					}
				}
			}
			
		}
	}

	public deleteAllAppoinmtmentWL() {

		

this.customDiallogService.confirm('Remove','Are you sure you want to remove these patients from waiting list?','Yes','No')
.then((confirmed) => {
	if (confirmed){
		const object = { 'ids': this.deleteAllKios }
		this.requestService
			.sendRequest(
				AppointmentUrlsEnum.remove_patient_status,
				'PUT',
				REQUEST_SERVERS.kios_api_path,
				object
			).subscribe(
				(response: any) => {
					if(response['status'] === 200){
						this.toastrService.success('Patient Successfully Deleted', 'Success');
						this.getAllAppointmentWL({offset:this.page.pageNumber||0})
					}else{
						this.toastrService.success(response.message, 'Success');	
					}
				})
	}else if(confirmed === false){
	}else{
	}
})
.catch();
	}

	walkInChange(e, row) {
		if (e.target.value == '1') {
			this.doctorCalendarService.walkinNotSeen = {
				caseId: row.case_id,
				notSeen: this.notseenId,
				patient_not_seen_reason:row.patient_not_seen_reason
			}
			const activeModal = this.updateModal.open(WalkInNotSeenComponent, {
				size: 'lg', backdrop: 'static',
				keyboard: false
			});
			activeModal.result.then((result) => {
				if(result){
					for(let i=0;i<this.dataWL['checked_in_patients'].length;i++){
						if(this.dataWL['checked_in_patients'][i].id===row.id){
							this.dataWL['checked_in_patients'][i].status_id=this.notseenId
						}
					}
				}
			})
		}
	}
	changeVistStatus(event,rowObj,Type?) {
		this.startLoader = true;
		let visitStatusObject = {
			"appointment_id": rowObj && rowObj.id,
			"user_id": this.storageData.getUserId(),
			"confirmation_status": true,
			"facility_location_id": rowObj?.facility_location_id
		}
		if(Type =='visitType') {
			visitStatusObject['appointment_status_id'] = rowObj && rowObj.appointment_status_id;
			visitStatusObject['visit_status_id'] = event.id;
		}
		else if(Type =='AppointmentType' && event.slug === "arrived" ){
			visitStatusObject['appointment_status_id'] = event.id;
			visitStatusObject['visit_status_id'] = this.getVisitStatusId("checked_in",this.visitStatus);
		} 
		else{
			visitStatusObject['appointment_status_id'] = event.id;
			visitStatusObject['visit_status_id'] = null 
		}
		this.requestService
		.sendRequest(
			AddToBeSchedulledUrlsEnum.manuallyUpdateStatus,
			'PUT',
			REQUEST_SERVERS.schedulerApiUrl1,
			visitStatusObject
		).subscribe(
			(res: any) => {
				if(res.status == 200) {
					this.toastrService.success(Type == 'visitType' ? 'Visit status successfully changed' : 'Appointment status successfully changed','Success');
					this.getAllAppointment(this.queryParams);
				}
				
			},err=>{
				this.startLoader = false;
			})
	}

	concatTime(date,time){
		return date+ ' ' +time;
	}

	toggleFoucsedClass(fieldName: string, status: boolean){
		this.AppointmentService.applyFoucssedClass(fieldName, status);
	}

	toggleWTFoucsedClass(fieldName: string, status: boolean){
		 this.myForm.controls[fieldName].setValue(status);
  
		//this.AppointmentService.applyFoucssedClass(fieldName, status);
	}



	// setActionOfNgDropDown(fieldName: string , action: boolean){
	// 	this.ngFilterService.updateFilterField(fieldName, action);
	// }
	changeSelectTemplateForm(value, fieldName) {
		if (value && !value.length) {
			fieldName = null;
		}
	}
	changeSelect(value, fieldName) {
		if (value && !value.length) {
			this.appointmentListFilterForm.controls[fieldName].setValue(null);
		}
	}

	changeSelectmyForm(value, fieldName) {
		if (!value.length) {
			this.myForm.controls[fieldName].setValue(null);
		}
	}
	checkInputs(){
		if (isEmptyObject(this.appointmentListFilterForm.value)) {
			return true;
		  }
		  return false;
	}
	checkInputsTemplateForm() {
		if(!this.currentDateTime && !this.caseTypeSelectedMultiple) {
			return true;
		}
		return false;
	}
	getVisitStatusId(key?,VisitStatusArr?){
		let VisitId = VisitStatusArr.filter(x => x.slug === key).map(c => c.id).toString();
		return VisitId
	}
	appointmentHistoryStats(row) {
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
		if(this.appoint_check) {
			this.columnsApp.forEach(element => {
				let obj = self.alphabeticColumns.find(x => x?.name === element?.name);
				if(obj) {
					this.modalCols.push({ header: element?.name, checked: obj?.checked });
				}
			});
		}
		else {
			this.columnsWaiting.forEach(element => {
				let obj = self.alphabeticColumns.find(x => x?.name === element?.name);
				if(obj) {
					this.modalCols.push({ header: element?.name, checked: obj?.checked });
				}
			});
		}
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
			if(this.appoint_check) {
				this.localStorage.setObject('appointmentTableList' + this.storageData.getUserId(), data);
			}
			else {
				this.localStorage.setObject('waitingTableList' + this.storageData.getUserId(), data);
			}
		}
		if(this.appoint_check) {
			const nameToIndexMap = {};
			this.modalCols.forEach((item, index) => {
				nameToIndexMap[item?.header] = index;
			});
			this.columnsApp.sort((a, b) => nameToIndexMap[a?.name] - nameToIndexMap[b?.name]);
		}
		else {
			const nameToIndexMap = {};
			this.modalCols.forEach((item, index) => {
				nameToIndexMap[item?.header] = index;
			});
			this.columnsWaiting.sort((a, b) => nameToIndexMap[a?.name] - nameToIndexMap[b?.name]);
		}
		//set checked and unchecked on the base modal columns in alphabeticals columns
		this.alphabeticColumns.forEach(element => {
			if(this.appoint_check) {
				let currentColumnIndex = findIndexInData(this.columnsApp, 'name', element.name);
				if (currentColumnIndex != -1) {
					this.columnsApp[currentColumnIndex]['checked'] = element.checked;
					this.columnsApp = [...this.columnsApp];
				}
			}
			else {
				let currentColumnIndex = findIndexInData(this.columnsWaiting, 'name', element.name);
				if (currentColumnIndex != -1) {
					this.columnsWaiting[currentColumnIndex]['checked'] = element.checked;
					this.columnsWaiting = [...this.columnsWaiting];
				}
			}
		});
		// show only those columns which is checked
		if(this.appoint_check) {
			let columnsBody = makeDeepCopyArray(this.columnsApp);
			this.appointmentListTable._internalColumns = columnsBody.filter(c => {
				return c.checked == true;
			});
			const nameToIndexMap = {};
			this.modalCols.forEach((item, index) => {
				nameToIndexMap[item?.header] = index;
			});
			this.appointmentListTable._internalColumns.sort((a, b) => nameToIndexMap[a?.name] - nameToIndexMap[b?.name]);
		}
		else {
			let columnsBody = makeDeepCopyArray(this.columnsWaiting);
			this.waitingListTable._internalColumns = columnsBody.filter(c => {
				return c.checked == true;
			});
			const nameToIndexMap = {};
			this.modalCols.forEach((item, index) => {
				nameToIndexMap[item?.header] = index;
			});
			this.waitingListTable._internalColumns.sort((a, b) => nameToIndexMap[a?.name] - nameToIndexMap[b?.name]);
		}
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


