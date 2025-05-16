import { map, take } from 'rxjs/operators';
import { changeDateToNextDay, getIdsFromArray, makeDeepCopyArray, removeEmptyAndNullsFormObject, unSubAllPrevious } from '@shared/utils/utils.helpers';
import { AssignSpecialityUrlsEnum } from './../../../../scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
import { DeleteReasonSoftRegistrationComponent } from './../delete-reason-billing-component/delete-reason-billing-component.component';
import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CaseListModel } from '@appDir/front-desk/cases/case-list/CaseList.Model';
import { ChoosePatientComponent } from '@appDir/front-desk/cases/case-list/components/choose-patient/choose-patient.component';
import { ErrorMessageModalComponent } from '@appDir/front-desk/cases/case-list/components/error-message-component/error-message-component';
import { CasesUrlsEnum } from '@appDir/front-desk/cases/Cases-Urls-Enum';
import { CaseFlowUrlsEnum } from '@appDir/front-desk/fd_shared/models/CaseFlowUrlsEnum';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { CaseStatusUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/CaseStatus-Urls-Enum';
import { CaseTypeUrlsEnum } from '@appDir/front-desk/masters/providers/caseType/case.type.enum';
import { Page } from '@appDir/front-desk/models/page';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { ButtonTypes } from '@appDir/shared/dynamic-form/constants/ButtonTypes.enum';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { getFieldControlByName } from '@appDir/shared/dynamic-form/helper';
import { ButtonClass } from '@appDir/shared/dynamic-form/models/ButtonClass.class';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { NgSelectClass } from '@appDir/shared/dynamic-form/models/NgSelectClass.class';
import { Options } from '@appDir/shared/dynamic-form/models/options.model';
import { SelectClass } from '@appDir/shared/dynamic-form/models/SelectClass.class';
import { AclService } from '@appDir/shared/services/acl.service';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { isEmptyObject, removeEmptyKeysFromObject,changeDateFormat } from '@appDir/shared/utils/utils.helpers';
import { convertDateTimeForRetrieving } from '@appDir/shared/utils/utils.helpers';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, Subscription } from 'rxjs';
import { Location } from '@angular/common'
import { SoftPatientEnum } from '../../enums/CaseFlowUrlsEnum';
import { AutoCompleteClass } from '@appDir/shared/dynamic-form/models/AutoCompleteClass.class';
import { SoftPatientService } from '../../services/soft-patient-service';
import { Socket } from 'ngx-socket-io';
import { AdjusterInformationUrlsEnum } from '@appDir/front-desk/masters/billing/insurance-master/adjuster/adjuster-information/adjuster-information-urls-enum';
import { FacilityUrlsEnum } from '@appDir/front-desk/masters/practice/practice/utils/facility-urls-enum';
import { InsuranceUrlsEnum } from '@appDir/front-desk/masters/billing/insurance-master/Insurance/insurance-list/Insurance-Urls-enum';
import { AttorneyUrlsEnum } from '@appDir/front-desk/masters/billing/attorney-master/attorney/Attorney-Urls-enum';
import { FirmUrlsEnum } from '@appDir/front-desk/masters/billing/attorney-master/firm/Firm-Urls-enum';
import SoftFilterPaginationClass from '../../class/softFilterPaginationClass';
import ISoftFilterPagination from '../../class/softFilterPaginationClass';
import { VisitStatusSlugEnum } from '../../enums/visit-status-enum';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';

@Component({
  selector: 'app-soft-patinet',
  templateUrl: './soft-patinet.component.html',
  styleUrls: ['./soft-patinet.component.scss']
})
export class SoftPatinetComponent extends PermissionComponent implements OnInit,OnDestroy {
	@ViewChild(DynamicFormComponent) component: DynamicFormComponent;
	subscription: Subscription[] = [];

	fieldConfig: FieldConfig[] = []
	cases: any[] = [];
	form: FormGroup;
	selection = new SelectionModel<Element>(true, []);
	page: Page;
	// showMoreFilters: boolean = false;
	public loadSpin: boolean = false;
	isCollapsed = false;
	// @ViewChild('patientName') patientNameElement;
	caseTypeData: any[] = [];
	fieldsValue:any = {};
	lstpractiseLocation=[];
	lstFirms=[];
	lstAttorney=[];
	lstInsurance=[];
	lstAdjusterName=[];
	lstAppointmentLocation=[];
	lstCaseStatus=[];
	lstCaseNo: any[] = [];
	practice_location_filter: ISoftFilterPagination= new SoftFilterPaginationClass();
	case_type_filter: ISoftFilterPagination= new SoftFilterPaginationClass();
	firms_filter: ISoftFilterPagination =new SoftFilterPaginationClass();
	attorney_filter: ISoftFilterPagination =new SoftFilterPaginationClass();
	insurance_filter: ISoftFilterPagination =new SoftFilterPaginationClass();
	adjusterName_filter: ISoftFilterPagination=new SoftFilterPaginationClass();
	appointmentLocation_filter: ISoftFilterPagination=new SoftFilterPaginationClass();
	caseStatus_filter: ISoftFilterPagination=new SoftFilterPaginationClass();
	provider_filter: ISoftFilterPagination=new SoftFilterPaginationClass();
	searchTypeHead$:Subject<any>=new Subject<any>();
	searchSpecialtyTypeHead$:Subject<any>=new Subject<any>();
	searchProviderTypeHead$:Subject<any>=new Subject<any>();
	searchCaseTypeHead$:Subject<any>=new Subject<any>();
	searchFirmTypeHead$:Subject<any>=new Subject<any>();
	searchAttorneyTypeHead$:Subject<any>=new Subject<any>();
	searchInsuranceTypeHead$:Subject<any>=new Subject<any>();
	searchAdjusterNameTypeHead$:Subject<any>=new Subject<any>();
	searchAppointmentTypeHead$:Subject<any>=new Subject<any>();
	caseStatusSearchTypeHead$:Subject<any>=new Subject<any>();
	resetTheNgSelectField$:Subject<any>=new Subject<any>();
	eventsSubject: Subject<any> = new Subject<any>();
	requestServerpath = REQUEST_SERVERS;
	CaseStatusUrlsEnum = CaseStatusUrlsEnum;
	currentCase: any; 
	caseUpdateForm: FormGroup;
	caseStatusUpdateBoolean: boolean= false;
	filterFormDisabled:boolean = false;
	@ViewChild('errorMessageComponent') errorMessageComponent :ErrorMessageModalComponent;
	casesTotalRows:number =0;
	caseTypes:any[]=[];
	specialties:any[]=[]
	providers:any[]=[]
	allClinicIds:any[]=[];
	visitStatuses:any[]=[];
	CaseIDPaginationSetting = {
		search: '',
		lastPage: null,
		per_page: 10,
		currentPage: 1,
	}
	specialties_filter = {
		searchKey: '',
		lastPage: null,
		per_page: 10,
		page: 0,
	}
	// data: any[] = null;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('softPatientList') softPatientListTable: DatatableComponent;
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
	showRefreshButton: boolean = false;
	softPatientListingTable: any;

	constructor(
		private fb: FormBuilder,
		private fd_services: FDServices,
		private toastrService: ToastrService,
		aclService: AclService,
		// private logger: Logger,
		titleService: Title,
		private _route: ActivatedRoute,
		private storageData: StorageData,
		public router: Router,
		private modalService: NgbModal,
		public requestService: RequestService,
		private location: Location,
		private route: ActivatedRoute,
		public datePipeService:DatePipeFormatService,
		private caseFlowServie:CaseFlowServiceService,
		public customDiallogService: CustomDiallogService,
		private toasterService: ToastrService,
		private softPatientService:SoftPatientService,
		private socket:Socket,
		private localStorage: LocalStorage
	) {
		super(aclService, router, _route, requestService, titleService);
	}

	ngAfterViewInit() {
		this.form = this.component.form;
		this.caseUpdateForm = this.fb.group({
			status_id:null
		});

		if (this.softPatientListTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.softPatientListTable._internalColumns]);
			this.columns.forEach(element => {
				if(this.softPatientListingTable.length) {
					let obj = this.softPatientListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.softPatientListingTable.length) {
				const nameToIndexMap = {};
				this.softPatientListingTable.forEach((item, index) => {
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
	ngOnInit() {
		this.getVisitStatuses()
		this.allClinicIds = this.storageData.getFacilityLocations();
		this.setTitle();
		// this.titleService.setTitle(this._route.snapshot.data['title']);
		this.initFilters();
		// this.getCaseTypeListing({
		// 	per_page:20,
		// 	pagination:1
		// })
		this.subscription.push(this._route.queryParams.subscribe((params) => {
			// this.form.patchValue(params);
			this.fieldsValue = {...params};
			this.fieldsValue.practice_location_ids=this.fieldsValue.practice_location_ids?this.fieldsValue.practice_location_ids.length==1?[Number(this.fieldsValue.practice_location_ids)]:this.fieldsValue.practice_location_ids.length>1?this.fieldsValue.practice_location_ids.map(val=> Number(val)):null:null
			// this.fieldsValue = params;provider_id
			this.fieldsValue.case_type_id=this.fieldsValue.case_type_id?this.fieldsValue.case_type_id.length==1?[Number(this.fieldsValue.case_type_id)]:this.fieldsValue.case_type_id.length>1?this.fieldsValue.case_type_id.map(val=> Number(val)):null:null

			this.fieldsValue.speciality_id=this.fieldsValue.speciality_id?parseInt(this.fieldsValue.speciality_id):null
			this.fieldsValue.provider_id=this.fieldsValue.provider_id?parseInt(this.fieldsValue.provider_id):null
			this.page.size = parseInt(params.per_page) || 10;
			this.page.pageNumber = parseInt(params.page) || 1;
			if(params && Object.keys(params).length > 0)
			{
				this.getPracticesBydefault();
				this.getCaseTypeOnOpen(true);
				// this.getCaseStatusBydefault();
				// this.onFocusSearchSpecialties(null,true)
				this.onFocusSearchProviders(null,true)
				// this.setBydefaultSpecialityDropdown()
		
			}
			this.checkInputs();
			this.setPage(params)
		})),
		this.setFilterForm();
		this.enablesocket();
		this.softPatientListingTable = this.localStorage.getObject('softPatientTableList' + this.storageData.getUserId());
	}


	refreshNow() {
		this.showRefreshButton = false;
		this.setPage();
	}

	onClickLink(link) {
		// let ro=this.activatedRoute.parent.url;
	  this.router.navigate([link], { relativeTo: this.activatedRoute.parent });
	}

	setFilterForm(data?) {
		this.fieldConfig = [
			new DivClass([
				new DivClass([
					new DivClass([
						new InputClass('Chart ID', 'id', InputTypes.text, '', [], '', ['col-sm-6 col-md-6 col-lg-3'], { mask: '000-00-0000', skip_validation: true }),
						new InputClass('Patient Name', 'name', InputTypes.text, '', [], '', ['col-sm-6 col-md-6 col-lg-3']),
						new NgSelectClass("Case ID",'case_ids','id','id', this.searchCaseID.bind(this), true, null, [], '', ['col-sm-7 col-md-5 col-lg-4 col-xl-3'],[],{add_tag: false, dropdownSearch: true},null,null,this.searchCaseID.bind(this, 'clear'),this.onFocusSearchCaseID.bind(this),this.searchCaseIDScrollToEnd.bind(this),null,null,this.resetTheNgSelectField$),
						new InputClass('DOB (mm/dd/yyyy)', 'dob', InputTypes.date, '', [], '', ['col-sm-6 col-md-6 col-lg-3']),
						// new InputClass('Primary Phone', 'phone_no', InputTypes.text, data && data['phone_no'] ? data['phone_no'] : '', [{ name: 'minlength', message: '', validator: Validators.minLength(10) }], '', ['col-lg-3', 'col-md-6'], { mask: '000-000-0000' }),
					
					], ['display-contents']),

					new DivClass([
						// new InputClass('SSN', 'ssn', InputTypes.text, data && data['ssn'] ? data['ssn'] : '', [{ name: 'minlength', message: '', validator: Validators.minLength(9) }], '', ['col-xl-3', 'col-lg-3', 'col-md-3'], { mask: '000-00-0000' }),

						// new InputClass('Case No.', 'case_id', InputTypes.text, '', [], '', ['col-sm-3 col-md-3']),
						new NgSelectClass('Case Type', 'case_type_id','name','id',
						null, true, null, [], '', ['col-sm-6 col-md-6 col-lg-4'],[],{dropdownSearch: true},null,null,this.getCaseTypeOnOpen.bind(this,null,'clear'),this.getCaseTypeOnOpen.bind(this),this.searchCaseTypesOnScrollToEnd.bind(this),this.searchCaseTypeHead$,this.searchCaseTypeHead.bind(this),this.resetTheNgSelectField$
					),

					new InputClass('Date of Accident (mm/dd/yyyy)', 'accident_date', InputTypes.date, '', [], '', ['col-sm-6 col-md-6 col-lg-4']),

						// new InputClass('Attorney', 'attorney_name', InputTypes.text, '', [], '', ['col-sm-6 col-md-3']),
						new NgSelectClass("Practice Location", 'practice_location_ids', 'facility_full_name', 'id', this.searchPracticeLocations.bind(this), true, null, [], '', ['col-sm-6 col-md-6 col-lg-4'],[],{dropdownSearch: true},null,null,this.getPracticesOnOpen.bind(this,null,'clear'),this.getPracticesOnOpen.bind(this),this.searchPracticeLocationsScrollToEnd.bind(this),this.searchTypeHead$,this.searchTypeHead.bind(this),this.resetTheNgSelectField$,true),
						new NgSelectClass("Firm", 'firm_ids', 'name', 'id', this.searchFirm.bind(this), true, null, [], '', ['col-sm-6 col-md-6 col-lg-4'],[],{dropdownSearch: true},null,null,this.getFirmOnOpen.bind(this,null,'clear'),this.getFirmOnOpen.bind(this),this.searchFirmScrollToEnd.bind(this),this.searchFirmTypeHead$,this.searchFirmTypeHead.bind(this),this.resetTheNgSelectField$),
						new NgSelectClass("Attorney", 'attorney_ids', 'full_name', 'id', this.searchAttorney.bind(this), true, null, [], '', ['col-sm-6 col-md-6 col-lg-4'],[],{dropdownSearch: true},null,null,this.getAttorneyOnOpen.bind(this,null,'clear'),this.getAttorneyOnOpen.bind(this),this.searchAttorneyScrollToEnd.bind(this),this.searchAttorneyTypeHead$,this.searchAttorneyTypeHead.bind(this),this.resetTheNgSelectField$),
						new NgSelectClass("Insurance", 'insurance_ids', 'insurance_name', 'id', this.searchInsurance.bind(this), true, null, [], '', ['col-sm-6 col-md-6 col-lg-4'],[],{dropdownSearch: true},null,null,this.getInsuranceOnOpen.bind(this,null,'clear'),this.getInsuranceOnOpen.bind(this),this.searchInsuranceScrollToEnd.bind(this),this.searchInsuranceTypeHead$,this.searchInsuranceTypeHead.bind(this),this.resetTheNgSelectField$),
						new NgSelectClass("Adjuster", 'adjuster_ids', 'full_name', 'id', this.searchAdjusterName.bind(this), true, null, [], '', ['col-sm-6 col-md-6 col-lg-4'],[],{dropdownSearch: true},null,null,this.getAdjusterNameOnOpen.bind(this,null,'clear'),this.getAdjusterNameOnOpen.bind(this),this.searchAdjusterNameScrollToEnd.bind(this),this.searchAdjusterNameTypeHead$,this.searchAdjusterTypeHead.bind(this),this.resetTheNgSelectField$),
						new NgSelectClass("Appointment Practice-Location", 'facility_location_id', 'facility_full_name', 'id', this.searchAppointment.bind(this), true, null, [], '', ['col-sm-6 col-md-6 col-lg-4'],[],{dropdownSearch: true},null,null,this.getAppointmentLocationOnOpen.bind(this,null,'clear'),this.getAppointmentLocationOnOpen.bind(this),this.searchAppointmentLocationScrollToEnd.bind(this),this.searchAppointmentTypeHead$,this.searchAppointmentTypeHead.bind(this),this.resetTheNgSelectField$,true),
						new NgSelectClass("Specialty", 'speciality_id', 'qualifier', 'id', this.searchSpecialty.bind(this), true, null, [], '', ['col-sm-6 col-md-6 col-lg-4'],[],{dropdownSearch: true},null,null,this.getSpecialtiesOnOpen.bind(this,null,'clear'),this.getSpecialtiesOnOpen.bind(this),this.searchSpecialtyOnScrollToEnd.bind(this),this.searchSpecialtyTypeHead$,this.onTypeSearchSpecialties.bind(this),this.resetTheNgSelectField$,true,'qualifier','name'),
						// new AutoCompleteClass("Specialty", 'speciality_id', 'name', 'id', this.searchSpecialties.bind(this), true, null, [], '', ['col-sm-6 col-md-3'],[],null,this.onFocusSearchSpecialties.bind(this),null,null,true),
						// new AutoCompleteClass("Provider", 'provider_id', 'full_name', 'doctor_id', this.searchProviders.bind(this), true, null, [], '', ['col-sm-6 col-md-6 col-lg-4'],[],null,this.onFocusSearchProviders.bind(this)),
						new NgSelectClass("Provider", 'provider_id', 'full_name', 'doctor_id', this.searchProviders.bind(this), true, null, [], '', ['col-sm-6 col-md-6 col-lg-4'],[],{dropdownSearch: true},this.onFocusSearchProviders.bind(this),null,this.searchProviders.bind(this,null,'clear'),this.searchProviders.bind(this),null,null,null,this.resetTheNgSelectField$),
						// new NgSelectClass("Case Status", 'status_id', 'name', 'id', this.searchCaseStatus.bind(this), true, null, [], '', ['col-sm-6 col-md-3'],[],null,null,null,null,this.getCaseOnOpen.bind(this),this.searchCaseScrollToEnd.bind(this),this.caseStatusSearchTypeHead$,this.searchTypeHeadCaseStatus.bind(this)),
						new InputClass('Apt. Date From (mm/dd/yyyy)', 'from_appointment_time', InputTypes.date, '', [], '', ['col-sm-6 col-md-6 col-lg-4']),
						new InputClass('Apt. Date To (mm/dd/yyyy)', 'to_appointment_time', InputTypes.date, '', [], '', ['col-sm-6 col-md-6 col-lg-4']),
						// new InputClass('Claim No.', 'claim_no', InputTypes.text, '', [], '', ['col-3']),
						new DivClass([
							new ButtonClass('Filter', ['btn', 'btn-success float-right me-3'], ButtonTypes.submit),
							new ButtonClass('Reset', ['btn', 'btn-primary'], ButtonTypes.button, this.resetForm.bind(this), {disabled:this.filterFormDisabled,name:'resetBtn'})
						], ['col-12', 'search-filter-btn', 'd-flex justify-content-center'])
					], ['display-contents', 'hidden'])

				], ['row px-2', 'field-block']),
				new DivClass([
					new ButtonClass('', ['btn', 'btn-primary plus-btn float-right mt-0'], ButtonTypes.button, this.collapseDiv.bind(this), { icon: 'icon-plus', button_classes: ['col-2'] })
				], ['colps-btn-block']),

			], ['row', 'dynamic-filter']),

		]
	}

	resetForm() {
		this.form.reset();
		this.resetNgSelectField();
		this.page.pageNumber = 1
		this.setPage();
		this.lstCaseNo = [];
		this.caseTypes = [];
		this.CaseIDPaginationSetting.currentPage = 1;
	}

	searchCaseID(name) {
		return new Observable((res) => {
			this.subscription.push(this.getCaseID(name).subscribe(data => {
			this.CaseIDPaginationSetting.lastPage = parseInt(data.result.pages);
			this.CaseIDPaginationSetting.search = name;
			this.lstCaseNo = data['result']['data'];
			res.next(this.lstCaseNo);
			}))
		})
	}

	getCaseID(name?) {
		let paramQuery: any = { 
			filter: true, 
			pagination: 1,
			dropDownFilter:true,
			all_listing:true,
			page: name == 'clear' || name == '' ? 1 : this.CaseIDPaginationSetting.currentPage,
			per_page: this.CaseIDPaginationSetting.per_page ,
			order_by: OrderEnum.ASC
		}
		paramQuery = removeEmptyKeysFromObject(paramQuery);
		let filter = {}
		name && name != 'clear' ? filter['id'] = name : null
		return this.requestService.sendRequest(CaseFlowUrlsEnum.GetCaseList, 'get', REQUEST_SERVERS.kios_api_path, { ...paramQuery, ...filter })
	}

	onFocusSearchCaseID(name) {
		return new Observable((res) => {
			if(!this.lstCaseNo.length)
			{
				this.subscription.push(	this.getCaseID(name).subscribe(data => {
				this.CaseIDPaginationSetting.lastPage = parseInt(data.result.pages);
				this.CaseIDPaginationSetting.search = name;
				this.lstCaseNo = data['result']['data'];
				res.next(this.lstCaseNo);
				}))
			}
			else
			{
				res.next(this.lstCaseNo);
			}
		})
	}

	searchCaseIDScrollToEnd()
	{
		return new Observable((res) => {
			if (this.CaseIDPaginationSetting.currentPage < this.CaseIDPaginationSetting.lastPage) {
				this.CaseIDPaginationSetting.currentPage += 1;
				this.CaseIDPaginationSetting.currentPage = this.CaseIDPaginationSetting.currentPage;
				this.subscription.push(this.getCaseID(this.CaseIDPaginationSetting.search).subscribe(data => {
					this.CaseIDPaginationSetting.lastPage = parseInt(data.result.pages);
					let result = data['result']['data'];
					this.lstCaseNo = [...this.lstCaseNo, ...result];
					res.next(this.lstCaseNo);
				}));
			}
		})		
	}

	onDeleteCase(row?){
		let params :any = {};
		if (row){
			params = {
				case_id : row.case.id
			}
		}
		this.customDiallogService
		.confirm('Delete Case', 'Do you really want to delete these Case?')
		.then((confirmed) => {
			if (confirmed) {
				         this.page.offset=0;
						this.page.pageNumber=1;
						this.setPage();

			}
		})
		.catch();
	}



	
	  getCaseTypes(queryParamscaseType)
	  {
		let param={
			filter:queryParamscaseType.name?true:false,
			per_page:10,
			page:1,
			pagination:1,
			dropDownFilter:true,
			name:queryParamscaseType && queryParamscaseType.name ? queryParamscaseType.name : null,
			order:OrderEnum.ASC
			
		}
		return 	this.requestService
		.sendRequest(
		  CaseTypeUrlsEnum.CaseType_list_GET,
		  'GET',
		  REQUEST_SERVERS.fd_api_url,
		  removeEmptyAndNullsFormObject(param),
		)
	  }
	  searchCaseTypes(name) {
		return new Observable((res) => {

			let param={
				filter:name?true:false,
				dropDownFilter:true,
				per_page:10,
				page:1,
				pagination:1,
				name:name,
				order:OrderEnum.ASC
				
			}
			this.subscription.push(this.getCaseTypes(param).subscribe((data) => {
			
				let attorney = data['result']['data'];
				this.caseTypes=attorney?attorney:[];

				res.next(this.caseTypes);
			}));
		});
	}
	
	getCaseTypeOnOpen(byDefault?,isClear?) {
		if(isClear)
		{
			this.caseTypes=[];
			this.case_type_filter= new SoftFilterPaginationClass();
		}
		return new Observable((res) => {
			if (this.caseTypes?.length == 0) {
				this.case_type_filter.page+=1;
				let body = {
					filter:this.case_type_filter.searchKey?true:false,
					page: this.case_type_filter.page,
					name: this.case_type_filter.searchKey,
					dropDownFilter:true,
					per_page: this.case_type_filter.per_page,
					pagination:1,
					order:OrderEnum.ASC

				};
	
				this.subscription.push(this.getCaseTypes(body).subscribe((data) => {
					let result = [...data['result']['data']];
	
					this.case_type_filter.searchKey = '';
	
					this.case_type_filter.lastPage = data.result.last_page;
	
					this.caseTypes = [...result];
					this.caseTypes.forEach(x => {
						if(x.id){
							x['is_select']= "all";
						}
					})
					if(byDefault)
					{
						getFieldControlByName(this.fieldConfig, 'case_type_id').items = this.caseTypes
					}

					res.next(this.caseTypes);
	
				}));
	
			}
		})
	}

	searchCaseTypesOnScrollToEnd()
	{
		return new Observable((res) => {
			
			if (this.case_type_filter.page < this.case_type_filter.lastPage) {
				this.case_type_filter.page += 1
				this.case_type_filter.page = this.case_type_filter.page
	
				let body = {
					filter:this.case_type_filter.searchKey?true:false,
					dropDownFilter:true,
					page: this.case_type_filter.page,
					name: this.case_type_filter.searchKey,
					per_page: this.case_type_filter.per_page,
					pagination:1,
					order:OrderEnum.ASC

				};
	
				this.subscription.push(this.getCaseTypes(body).subscribe((data) => {
	
					let result = [...data['result']['data']];
	
					this.case_type_filter.lastPage = data.result.last_page;
	
					this.caseTypes = [...this.caseTypes, ...result];
					this.caseTypes.forEach(x => {
						if(x.id){
							x['is_select']= "all";
						}
					})
					res.next(this.caseTypes);
				}));
	
			}
	
		})
			
	}

	searchCaseTypeHead(res)
	{
		this.case_type_filter.searchKey=res;
		this.case_type_filter.page=1;
		this.case_type_filter.lastPage=2
		this.caseTypes=[]
		return new Observable((res) => {
	
			let body = {
				filter:this.case_type_filter.searchKey?true:false,
				dropDownFilter:true,
				page: this.case_type_filter.page,
				name: this.case_type_filter.searchKey,
				per_page: this.case_type_filter.per_page,
				pagination:1,
				order:OrderEnum.ASC

			};
	
			this.subscription.push(this.getCaseTypes(body).subscribe((data) => {
	
					let result = [...data['result']['data']];
	
					this.case_type_filter.lastPage = data.result.last_page;
	
					this.caseTypes = [ ...result];
					this.caseTypes.forEach(x => {
						if(x.id){
							x['is_select']= "all";
						}
					})
					res.next(this.caseTypes);
				}));
	
			// }
	
		})
	}

	getSpecialtiesOnOpen(name, isClear?) {
		if(isClear)
		{
			this.specialties=[];
			this.specialties_filter = {
				searchKey: '',
				lastPage: null,
				per_page: 10,
				page: 0,
			}
		}
		return new Observable((res) => {
			if(this.specialties?.length == 0){
				this.specialties_filter.page+=1;
				this.specialtyApiFunction(res);
			}
		});
	}

	onFocusSearchSpecialties(name?,byDefault?) {
		return new Observable((res) => {
			let param={
				doctor_id:null,
				facility_location_id:this.allClinicIds
					}
			if (!this.specialties.length) {
				this.subscription.push(this.softPatientService.getMasterSpecialities(param).subscribe((data) => {
			
				
					this.specialties=data['result']['data']?data['result']['data']:[];
					this.specialties.forEach(x => {
						if(x?.id){
							x['is_select']= "all";
						}
					})
					if(byDefault)
					{
						getFieldControlByName(this.fieldConfig, 'speciality_id').items = this.specialties
					}

					res.next(this.specialties);
					
					
				}));
			} else {
				res.next(this.specialties);
			}
		});
	}


	onTypeSearchSpecialties(res) {

		this.specialties_filter.searchKey=res;
		this.specialties_filter.page=1;
		this.specialties_filter.lastPage=null;
		this.specialties=[];

		return new Observable((res) => {
			this.specialtyApiFunction(res);
		});
	}

	searchSpecialtyOnScrollToEnd()
	{
		return new Observable((res) => {
			
			if (this.specialties_filter.page < this.specialties_filter.lastPage)
			{
				this.specialties_filter.page += 1
				this.specialties_filter.page = this.specialties_filter.page
				this.specialtyApiFunction(res);
			}
		})
	}

	specialtyApiFunction(res){
		let param={
			doctor_id:null,
			facility_location_id:this.allClinicIds,
			pagination: true,
			dropDownFilter:true,
			page: this.specialties_filter.page,
			per_page: this.specialties_filter.per_page,
			name: this.specialties_filter.searchKey
			}
		
		this.subscription.push(
			this.softPatientService.getMasterSpecialities(param).subscribe((data) => {
			let result = [...data['result']['data']['docs']];
			this.specialties_filter.searchKey = '';	
			this.specialties_filter.lastPage = data.result.data.pages;
			this.specialties = [...this.specialties, ...result];
			this.specialties.forEach(x => {
				if(x?.id){
					x['is_select']= "all";
				}
			})

			res.next(this.specialties);
			})
		);
}


	searchProviders(name, isClear?) {
		if(isClear)
		{
			this.providers=[];
			// this.insurance_filter= new SoftFilterPaginationClass();
		}
		return new Observable((res) => {

			let param={
				speciality_id:null,
				dropDownFilter:true,
				facility_location_id:this.allClinicIds
					}
				this.subscription.push(this.softPatientService.getMasterProviders(param).subscribe((data) => {
			
				
				this.providers=data['result']['data']?data['result']['data']:[];

				res.next(this.providers);
			}));
		});
	}

	onFocusSearchProviders(name?,byDefault?) {
		return new Observable((res) => {
			let param={
				speciality_id:null,
				dropDownFilter:true,
				facility_location_id:this.allClinicIds
					}
			if (!this.providers.length) {
				this.subscription.push(this.softPatientService.getMasterProviders(param).subscribe((data) => {
			
				
					this.providers=data['result']['data']?data['result']['data']:[];
					if(byDefault)
					{
						getFieldControlByName(this.fieldConfig, 'provider_id').items = this.providers
					}
					res.next(this.providers);
				}));
			} else {
				res.next(this.providers);
			}
		});
	}
	submit() {
		let chart_id = this.form.value.id as string;
		this.page.pageNumber = 1
		if (chart_id) {
			this.form.patchValue({ id: `0`.repeat(9 - chart_id.length) + chart_id })
		}
		this.setPage()
	}
	collapseDiv() {
		let collapseField = this.fieldConfig[0].children[1].children[0]
		let collapseDiv = this.fieldConfig[0].children[0].children[1]
		if (collapseField.configs.icon === 'icon-plus') {
			collapseField.configs.icon = 'icon-minus'
			collapseDiv.classes = collapseDiv.classes.filter(className => className != 'hidden')
		} else {
			collapseField.configs.icon = 'icon-plus'
			collapseDiv.classes.push('hidden')
		}
	}
	// loadSpin
	setPage(params={}) {
		this.loadSpin = true;
		this.form.value.name ? this.form.value.name = this.form.value.name.trim() : null;
		let formValue={...this.form.value} ;
		formValue.dob = formValue.dob ? changeDateFormat(formValue.dob) : '';
		formValue.accident_date = formValue.accident_date ? changeDateFormat(formValue.accident_date) : '';
		formValue.from_appointment_time = formValue.from_appointment_time ? changeDateFormat(formValue.from_appointment_time) : '';
		formValue.to_appointment_time = formValue.to_appointment_time ? changeDateToNextDay(formValue.to_appointment_time) : '';
		// val.practice_locations=val.practice_locations?val.practice_locations.toString():'';
		let query: any = { pagination: true, page: this.page.pageNumber, per_page: this.page.size, filter: true, order_by: OrderEnum.DEC, ...formValue , ...params } as any
		this.setQueryParams(query)
		// query.practice_location_ids=query.practice_location_ids?query.practice_location_ids.toString():'';
		query.status_id=query.status_id?query.status_id.toString():'';
		this.requestService.sendRequest(SoftPatientEnum.GetRegisteredSoftPatient, 'get', REQUEST_SERVERS.kios_api_path, removeEmptyAndNullsFormObject({ ...query })).subscribe(data => {
			this.cases = data?.['result']?.['data']
			if(this.cases.length)
			{
				this.cases.forEach(casedata=>{
		if(casedata.case&&casedata.case.appointment &&casedata.case.appointment.id  && casedata.case.appointment.available_speciality  && casedata.case.appointment.available_speciality.id )
		{
			casedata.case.appointment.speciality=casedata.case.appointment.available_speciality.speciality? casedata.case.appointment.available_speciality.speciality:null;
			casedata.case.appointment.speciality_qualifier=casedata.case.appointment.available_speciality.speciality? casedata.case.appointment.available_speciality.qualifier:null;

			// casedata.appointment.userFacility=this.appointment.dateList.available_speciality.facility_location_id;
			casedata.case.appointment.doctor=null;
			casedata.case.appointment['specialty_base_appointment'] = true;
			// let practice_location=casedata.case.appointment.available_speciality.facility_location?casedata.case.appointment.available_speciality.facility_location.facility && casedata.case.appointment.available_speciality.facility_location.facility.name?casedata.case.appointment.available_speciality.facility_location.facility.name+'-'+casedata.case.appointment.available_speciality.facility_location.name:"-"+casedata.case.appointment.available_speciality.facility_location.name:null
		let practice_location='';
		let practiceLocationQualifier = ''; 
			if(casedata.case.appointment.available_speciality.facility_location.facility.name && casedata.case.appointment.available_speciality.facility_location.name)
			{
				practice_location=casedata.case.appointment.available_speciality.facility_location.facility.name+'-'+casedata.case.appointment.available_speciality.facility_location.name;
				practiceLocationQualifier = casedata.case.appointment.available_speciality.facility_location.facility.qualifier+'-'+casedata.case.appointment.available_speciality.facility_location.qualifier;
			}
			else if(!casedata.case.appointment.available_speciality.facility_location.facility.name && casedata.case.appointment.available_speciality.facility_location.name )
			{
				practice_location=`-${casedata.case.appointment.available_speciality.facility_location.name}`;
				practiceLocationQualifier = `-${casedata.case.appointment.available_speciality.facility_location.qualifier}`;
			}
			else if(casedata.case.appointment.available_speciality.facility_location.facility.name && !casedata.case.appointment.available_speciality.facility_location.name )
			{
				practice_location=`${casedata.case.appointment.available_speciality.facility_location.facility.name} - `;
				practiceLocationQualifier = `${casedata.case.appointment.available_speciality.facility_location.facility.qualifier} - `;
			}
			else
			{
				practice_location='';
				practiceLocationQualifier = '';
			}
			casedata.case.appointment.practice_location=practice_location;
			casedata.case.appointment.practice_location_qualifier=practiceLocationQualifier;

		}
		if(casedata.case&&casedata.case.appointment && casedata.case.appointment &&casedata.case.appointment.id&&  casedata.case.appointment.available_doctor   &&  casedata.case.appointment.available_doctor.id )
		{
			// casedata.appointment.userFacility=casedata.appointment.available_doctor.facility_location_id;
			casedata.case.appointment.doctor=casedata.case.appointment.available_doctor.doctor;
			casedata.case.appointment['specialty_base_appointment'] = false;
			// let userfacility=casedata.case.appointment.available_doctor.doctor.user_facilities.find(userFacility=>userFacility.facility_location_id==casedata.case.appointment.available_doctor.facility_location_id);
			let userfacility=casedata.case.appointment.available_doctor.available_speciality;

			casedata.case.appointment.speciality= userfacility && userfacility.speciality? userfacility.speciality:null;
			casedata.case.appointment.speciality_qualifier= userfacility && userfacility.speciality? userfacility.speciality.qualifier:null

			if(casedata.case && casedata.case.appointment&&!casedata.case.appointment.available_speciality.id)
			{
				// let practice_location=casedata.case.appointment.available_doctor.user_facilities?casedata.case.appointment.available_doctor.facility_location.facility?casedata.case.appointment.available_doctor.facility_location.facility.name+'-'+casedata.case.appointment.available_doctor.facility_location.name:"-"+casedata.case.appointment.available_doctor.facility_location.name:null
				let practice_location='';
				let practiceLocationQualifier='';

				if(casedata.case.appointment.available_doctor.facility_location.facility.name && casedata.case.appointment.available_doctor.facility_location.name)
				{
					practice_location=casedata.case.appointment.available_doctor.facility_location.facility.name+'-'+casedata.case.appointment.available_doctor.facility_location.name;
					practiceLocationQualifier = casedata.case.appointment.available_doctor.facility_location.facility.qualifier+'-'+casedata.case.appointment.available_doctor.facility_location.qualifier;
				}
				else if(!casedata.case.appointment.available_doctor.facility_location.facility.name && casedata.case.appointment.available_doctor.facility_location.name )
				{
					practice_location=`-${casedata.case.appointment.available_doctor.facility_location.name}`;
					practiceLocationQualifier =`-${casedata.case.appointment.available_doctor.facility_location.qualifier}`;
				}
				else if(casedata.case.appointment.available_doctor.facility_location.facility.name && !casedata.case.appointment.available_doctor.facility_location.name )
				{
					practice_location=`${casedata.case.appointment.available_doctor.facility_location.facility.name} - `;
					practiceLocationQualifier = `${casedata.case.appointment.available_doctor.facility_location.facility.qualifier} - `;
				}
				else
				{
					practice_location='';
					practiceLocationQualifier = '';
				}

				casedata.case.appointment.practice_location=practice_location;
				casedata.case.appointment.practice_location_qualifier=practiceLocationQualifier;

			}
			
		}
		if(casedata.case.appointment &&casedata.case.appointment.id && casedata.case.appointment.scheduled_date_time  )
		{
			casedata.case.appointment.scheduled_date_time=convertDateTimeForRetrieving(this.storageData,new Date(casedata.case.appointment.scheduled_date_time));
		}
				})
			}
			this.page.totalElements = data['result'].total
			this.loadSpin = false;
		}, err => {
			this.loadSpin = false
			this.toastrService.error(err.error.message, 'Error')
		}
		)
	}
	onPageChange(number) {
		// this.page = new Page();
		this.page.pageNumber = number + 1;
		this.setPage()
	}
	initFilters() {
		this.form = this.fb.group({
			patientId: '',
			patientName: '',
			caseId: '',
			caseType: '',
			attorney: '',
			insurance: '',
			dateOfAccident: '',
			claimNo: '',			
			specialty: '',
		});
		this.page = new Page();
		this.page.pageNumber = 1;
		this.page.size = 10;
		// this.getFilteredCases();
	}
	reset() {
		this.initFilters();
		this.isCollapsed = false;
	}
	getFilteredCases(pageInfo?) {
		this.selection.clear();
		if (pageInfo) {
			this.page.pageNumber = pageInfo.offset;
		}
		let formData = this.form.getRawValue();
		formData.caseId = +formData.caseId;
		let pageNumber = this.page.pageNumber + 1;
		var dateString = '';
		if (formData.dateOfAccident) {
			var date = new Date(formData.dateOfAccident);
			dateString = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
				.toISOString()
				.split('T')[0];
		}
		let requestData = {};
		if (formData.patientId) {
			requestData['patientId'] = +formData.patientId;
		}
		if (formData.patientName) {
			requestData['patientName'] = formData.patientName;
		}
		if (formData.patientName) {
			requestData['patientName'] = formData.patientName;
		}
		if (formData.caseId) {
			requestData['caseId'] = formData.caseId;
		}
		if (formData.caseType) {
			requestData['caseType'] = formData.caseType;
		}
		if (formData.claimNo) {
			requestData['claimNo'] = formData.claimNo;
		}
		if (formData.insurance) {
			requestData['insurance'] = formData.insurance;
		}
		if (formData.attorney) {
			requestData['attorney'] = formData.attorney;
		}
		if (dateString) {
			requestData['dateOfAccident'] = dateString;
		}
		requestData['pageNumber'] = pageNumber;
		requestData['pageSize'] = this.page.size;
		requestData['Authorization'] = this.storageData.getToken();
		requestData['userId'] = this.storageData.getUserId();

		this.loadSpin = true;

		this.subscription.push(
			this.fd_services.getFilteredCases(requestData).subscribe(
				(res) => {
					if (res.statusCode == 200) {
						// this.logger.log('cases data', res.data.cases);
						this.cases = res.data.cases;
						this.page.totalElements = res.data.totalRecords;
						this.page.totalPages = this.page.totalElements / this.page.size;
						this.loadSpin = false;
					}
				},
				(err) => {
					this.toastrService.error(err.error.error.message, 'Error');
					this.loadSpin = false;
				},
			),
		);
	}
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.cases.length;
		return numSelected === numRows;
	}

	pageLimit($num) {
		this.selection.clear();
		this.page.size = Number($num);
		this.page.offset=0;
		this.page.pageNumber=this.page.offset+1
		this.setPage()

	}

	isCasesAllSelected(): boolean {
		this.casesTotalRows = this.cases.length;
		const numSelected = this.selection.selected.length;
		const numRows = this.casesTotalRows;
		return numSelected === numRows;
	}

	casesmasterToggle(): void {
		this.isCasesAllSelected()
			? this.selection.clear()
			: this.cases
					.slice(0, this.casesTotalRows)
					.forEach((row:any) => this.selection.select(row));
	}

	confirmDel(row?) {

		let ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			size: 'sm',
			keyboard: false,
			
		};
		this.customDiallogService
		.confirm('Delete Patient', 'Are You sure you want to delete the Patient?')
		.then((confirmed) => {
			if (confirmed) {
				if (row && row.case && row.case.appointment && row.case.appointment.id){
					let modalRef = this.modalService.open(DeleteReasonSoftRegistrationComponent, ngbModalOptions);
					modalRef.result.then((res) => {
						if(res && res.data && res.data.cancelled_comments)
						{
							let params = {
								appointment_ids:[row.case.appointment.id],
								cancelled_comments:res.data.cancelled_comments
							}

							this.subscription.push(
								this.requestService
								  .sendRequest(
									AssignSpecialityUrlsEnum.Cancel_Appointment_new,
									'post',
									REQUEST_SERVERS.schedulerApiUrl,
									params,
								  )
								  .subscribe(
									(res: any) => {
										if (res.status){
										this.modalService.dismissAll();
										// this.deleteSelected([row.id]);
										this.deleteSelected(row);
										}
									},
									(err) => {
									},
								  ),
							  );
						}
						
					});	
				}
				else {
					// this.deleteSelected([row.id]);
					this.deleteSelected(row);
				}
			}
		})
		.catch();
		
	}

	searchFirm(name) {
		return new Observable((res) => {
			let firmId=this.form.value.firm?this.form.value.firm_id:null;
		});
	}
	searchAttorney(name) {
		return new Observable((res) => {
			let firmId=this.form.value.attorney?this.form.value.attorney_ids:null;
		});
	}
	searchInsurance(name) {
		return new Observable((res) => {
			let firmId=this.form.value.insurance?this.form.value.insurance_ids:null;
		});
	}
	searchAdjusterName(name) {
		return new Observable((res) => {
			let firmId=this.form.value.adjuster?this.form.value.adjuster_id:null;
		});
	}
	searchAppointment(name) {
		return new Observable((res) => {
			let firmId=this.form.value.facility_location?this.form.value.facility_location_id:null;
		});
	}
	searchPracticeLocations(name) {
		return new Observable((res) => {
			let attorneyid=this.form.value.attorney?this.form.value.attorney.attorney_id:null;
		})
	}
	searchCaseStatus(name) {
		return new Observable((res) => {
			let attorneyid=this.form.value.status_id?this.form.value.status_id:null;

		})

	}
	searchSpecialty(name) {
		return new Observable((res) => {
			let firmId=this.form.value.specialty?this.form.value.specialty:null;
		});
	}

	geneneteExcel(){
	
		this.form.value.name ? this.form.value.name = this.form.value.name.trim() : null;
		let val={...this.form.value} ;
		let filters=removeEmptyKeysFromObject(val);
		this.subscription.push(this.requestService.sendRequest(CasesUrlsEnum.CaseExportExcel, 'url_base_with_token', REQUEST_SERVERS.fd_api_url,
		filters,
		)
		.pipe(
			take(1))		
			.subscribe((res) => {
			if (res){
			window.open(res);
			}
		}));
	}

	getCaseStatusOnOpen() {
		return new Observable((res) => {
				this.caseStatus_filter.page+=1;
				let search_key= this.form.value.pra?this.form.value.attorney.attorney_id:null;
				let body = {
					page: this.caseStatus_filter.page,
					name: this.caseStatus_filter.searchKey,
					per_page: this.caseStatus_filter.per_page,
	
				};
	
				this.subscription.push(this.caseFlowServie.searchPractice(body).subscribe((data) => {
					let result = [...data['result']['data']];
	
					this.caseStatus_filter.searchKey = '';
	
					this.caseStatus_filter.lastPage = data.result.last_page;
	
					this.lstCaseStatus = [...this.lstCaseStatus, ...result];

					res.next(this.lstCaseStatus);
	
				}));
	
			
		})
	} 

	getPracticesOnOpen(byDefault?,isClear?) {
		if(isClear)
		{
			this.lstpractiseLocation=[];
			this.practice_location_filter= new SoftFilterPaginationClass();
		}
		return new Observable((res) => {
			if (this.lstpractiseLocation.length == 0) {
				this.practice_location_filter.page+=1;
				let search_key= this.form.value.pra?this.form.value.attorney.attorney_id:null;
				let body = {
					page: this.practice_location_filter.page,
					name: this.practice_location_filter.searchKey,
					per_page: this.practice_location_filter.per_page,
	
				};
	
				this.subscription.push(this.caseFlowServie.searchPractice(body).subscribe((data) => {
					let result = [...data['result']['data']];
	
					this.practice_location_filter.searchKey = '';
	
					this.practice_location_filter.lastPage = data.result.last_page;
	
					this.lstpractiseLocation = [...result];
					this.lstpractiseLocation.forEach(x => {
						if(x.id){
							x['is_select']= "all"
						}
					})
					if(byDefault)
					{
						getFieldControlByName(this.fieldConfig, 'practice_location_ids').items = this.lstpractiseLocation
					}

					res.next(this.lstpractiseLocation);
	
				}));
	
			}
		})
	}
	getFirmOnOpen(byDefault?,isClear?) {
		if(isClear)
		{
			this.lstFirms=[];
			this.firms_filter= new SoftFilterPaginationClass();
		}
		return new Observable((res) => {
			if (this.lstFirms.length == 0) {
				this.firms_filter.page+=1;
				let body = {
					page: this.firms_filter.page,
					value: this.firms_filter.searchKey,
					per_page: this.firms_filter.per_page,
					keyName:'name',
				};
				this.subscription.push(this.caseFlowServie.searchMultipleSoftPatient(this.getScrollToEndObject(body),this.API_URL(FirmUrlsEnum.AllFirms_list_GET) ).subscribe((data) => {
					let result = [...data['result']['data']];
					this.firms_filter.searchKey = '';
					this.firms_filter.lastPage = data.result.last_page;
					this.lstFirms = [...this.lstFirms, ...result];
					if(byDefault)
					{
						getFieldControlByName(this.fieldConfig, 'firm_ids').items = this.lstFirms
					} 
					res.next(this.lstFirms);
				}));
			}
		})
	}
	getAttorneyOnOpen(byDefault?,isClear?) {
		if(isClear)
		{
			this.lstAttorney=[];
			this.attorney_filter= new SoftFilterPaginationClass();
		}
		return new Observable((res) => {
			if (this.lstAttorney.length == 0) {
				this.attorney_filter.page+=1;
				let body = {
					page: this.attorney_filter.page,
					value: this.attorney_filter.searchKey,
					dropDownFilter:true,
					per_page: this.attorney_filter.per_page,
					keyName:'name'
				};
				this.subscription.push(this.caseFlowServie.searchMultipleSoftPatient(this.getScrollToEndObject(body),this.API_URL(AttorneyUrlsEnum.attorney_list_GET)).subscribe((data) => {
					let result = [...data['result']['data']];
					this.attorney_filter.searchKey = '';
					this.attorney_filter.lastPage = data.result.last_page;
					this.lstAttorney = [...this.lstAttorney, ...result];
					this.lstAttorney = this.getFullName(this.lstAttorney); 
					res.next(this.lstAttorney);
				}));
			}
		})
	}
	getInsuranceOnOpen(byDefault?,isClear?) {
		if(isClear)
		{
			this.lstInsurance=[];
			this.insurance_filter= new SoftFilterPaginationClass();
		}
		return new Observable((res) => {
			if (this.lstInsurance.length == 0) {
				this.insurance_filter.page+=1;
				let body = {
					page: this.insurance_filter.page,
					value: this.insurance_filter.searchKey,
					dropDownFilter:true,
					per_page: this.insurance_filter.per_page,
					keyName:'insurance_name'
				};
				this.subscription.push(this.caseFlowServie.searchMultipleSoftPatient(this.getScrollToEndObject(body),this.API_URL(InsuranceUrlsEnum.Insurance_list_GET,'billing')).subscribe((data) => {
					let result = [...data['result']['data']];
					this.insurance_filter.searchKey = '';
					this.insurance_filter.lastPage = data.result.pages;
					this.lstInsurance = [...this.lstInsurance, ...result];
					res.next(this.lstInsurance);
				}));
			}
		})
	}
	getAdjusterNameOnOpen(byDefault?,isClear?) {
		if(isClear)
		{
			this.lstAdjusterName=[];
			this.adjusterName_filter= new SoftFilterPaginationClass();
		}
		return new Observable((res) => {
			if (this.lstAdjusterName.length == 0) {
				this.adjusterName_filter.page+=1;
				let body = {
					page: this.adjusterName_filter.page,
					value: this.adjusterName_filter.searchKey,
					dropDownFilter:true,
					per_page: this.adjusterName_filter.per_page,
					keyName:'name'
				};
				this.subscription.push(this.caseFlowServie.searchMultipleSoftPatient(this.getScrollToEndObject(body),this.API_URL(AdjusterInformationUrlsEnum.insurance_adjuster_list_Get,'billing') ).subscribe((data) => {
					let result = [...data['result']['data']];
					this.adjusterName_filter.searchKey = '';
					this.adjusterName_filter.lastPage = data.result.page;
					this.lstAdjusterName = [...this.lstAdjusterName, ...result];
					this.lstAdjusterName = this.getFullName(this.lstAdjusterName);
					res.next(this.lstAdjusterName);
				}));
			}
		})
	}
	getAppointmentLocationOnOpen(byDefault?,isClear?) {
		if(isClear)
		{
			this.lstAppointmentLocation=[];
			this.appointmentLocation_filter= new SoftFilterPaginationClass();
		}
		return new Observable((res) => {
			if (this.lstAppointmentLocation.length == 0) {
				this.appointmentLocation_filter.page+=1;
				let body = {
					page: this.appointmentLocation_filter.page,
					value: this.appointmentLocation_filter.searchKey,
					dropDownFilter:true,
					per_page: this.appointmentLocation_filter.per_page,
					keyName:'name'
				};
				this.subscription.push(this.caseFlowServie.searchMultipleSoftPatient(this.getScrollToEndObject(body),this.API_URL(FacilityUrlsEnum.Facility_list_dropdown_GET)).subscribe((data) => {
					let result = [...data['result']['data']];
					this.appointmentLocation_filter.searchKey = '';
					this.appointmentLocation_filter.lastPage = data.result.last_page;
					this.lstAppointmentLocation = [...this.lstAppointmentLocation, ...result];
					this.lstAppointmentLocation.forEach(x => {
						if(x.id){
							x['is_select']= "all";
						}
					})
					res.next(this.lstAppointmentLocation);
				}));
			}
		})
	}
	getCaseOnOpen() {
		return new Observable((res) => {
			if (this.lstCaseStatus.length == 0) {
				this.caseStatus_filter.page+=1;
				let search_key= this.form.value.pra?this.form.value.attorney.attorney_id:null;
				let body = {
					page: this.caseStatus_filter.page,
					name: this.caseStatus_filter.searchKey,
					per_page: this.caseStatus_filter.per_page,
	
				};
	
				this.subscription.push(this.caseFlowServie.searchCaseStatus(body).subscribe((data) => {
					let result = [...data['result']['data']];
	
					this.caseStatus_filter.searchKey = '';
	
					this.caseStatus_filter.lastPage = data.result.last_page;
	
					this.lstCaseStatus = [...this.lstCaseStatus, ...result];

					res.next(this.lstCaseStatus);
	
				}));
	
			}
		})
	}

	getPracticesBydefault() {
				this.practice_location_filter.page+=1;
				let body = {
	
					page: this.practice_location_filter.page,
	
					name: this.practice_location_filter.searchKey,
					per_page :this.practice_location_filter.per_page
	
				};
	
				this.subscription.push(this.caseFlowServie.searchPractice(body).subscribe((data) => {
					let result = [...data['result']['data']];
	
					this.practice_location_filter.searchKey = '';
	
					this.practice_location_filter.lastPage = data.result.last_page;
	
					this.lstpractiseLocation = [...this.lstpractiseLocation, ...result];
					this.lstpractiseLocation.forEach(x => {
						if(x.id){
							x['is_select']= "all";
						}
					})
					getFieldControlByName(this.fieldConfig, 'practice_location_ids').items = data.length > 0 ? data.map(item => {
						return { label: item?.facility_full_name, name: item?.facility_full_name, value: item.id } as Options
					}) : this.lstpractiseLocation;

	
				}));

	}

	getCaseStatusBydefault(){
		this.caseStatus_filter.page+=1;
		let body = {

			page: this.caseStatus_filter.page,

			name: this.caseStatus_filter.searchKey,
			per_page :this.caseStatus_filter.per_page

		};

		this.subscription.push(this.caseFlowServie.searchPractice(body).subscribe((data) => {
			let result = [...data['result']['data']];

			this.caseStatus_filter.searchKey = '';

			this.caseStatus_filter.lastPage = data.result.last_page;

			this.lstCaseStatus = [...this.lstCaseStatus, ...result];

			getFieldControlByName(this.fieldConfig, 'practice_location_ids').items = data.length > 0 ? data.map(item => {
				return { label: item?.facility_full_name, name: item?.facility_full_name, value: item.id } as Options
			}) : this.lstCaseStatus;


		}));

	}


	searchPracticeLocationsScrollToEnd()
	{
		return new Observable((res) => {
			
			if (this.practice_location_filter.page < this.practice_location_filter.lastPage) {
				this.practice_location_filter.page += 1
				this.practice_location_filter.page = this.practice_location_filter.page
	
				let body = {
	
					page: this.practice_location_filter.page,
					dropDownFilter:true,
					name: this.practice_location_filter.searchKey,
					per_page :this.practice_location_filter.per_page
	
				};
	
				this.subscription.push(this.caseFlowServie.searchPractice(body).subscribe((data) => {
	
					let result = [...data['result']['data']];
	
					this.practice_location_filter.lastPage = data.result.last_page;
	
					this.lstpractiseLocation = [...this.lstpractiseLocation, ...result];
					this.lstpractiseLocation.forEach(x => {
						if(x.id){
							x['is_select']= "all"
						}
					})
					res.next(this.lstpractiseLocation);
				}));
	
			}
	
		})
			
	}
	searchFirmScrollToEnd()
	{
		return new Observable((res) => {
			if (this.firms_filter.page < this.firms_filter.lastPage) {
				this.firms_filter.page += 1
				this.firms_filter.page = this.firms_filter.page
				let body = {
					page: this.firms_filter.page,	
					value: this.firms_filter.searchKey,
					per_page :this.firms_filter.per_page,
					keyName:'name'	
				};
				this.subscription.push(this.caseFlowServie.searchMultipleSoftPatient(this.getScrollToEndObject(body),this.API_URL(FirmUrlsEnum.AllFirms_list_GET)).subscribe((data) => {	
					let result = [...data['result']['data']];	
					this.firms_filter.lastPage = data.result.last_page;	
					this.lstFirms = [...this.lstFirms, ...result];
					res.next(this.lstFirms);
				}));
			}
		})		
	}
	searchAttorneyScrollToEnd()
	{
		return new Observable((res) => {
			if (this.attorney_filter.page < this.attorney_filter.lastPage) {
				this.attorney_filter.page += 1
				this.attorney_filter.page = this.attorney_filter.page
				let body = {
					page: this.attorney_filter.page,	
					value: this.attorney_filter.searchKey,
					dropDownFilter:true,
					per_page :this.attorney_filter.per_page,
					keyName:'name'
				};
				this.subscription.push(this.caseFlowServie.searchMultipleSoftPatient(this.getScrollToEndObject(body),this.API_URL(AttorneyUrlsEnum.attorney_list_GET)).subscribe((data) => {	
					let result = [...data['result']['data']];	
					this.attorney_filter.lastPage = data.result.last_page;	
					this.lstAttorney = [...this.lstAttorney, ...result];
					this.lstAttorney = this.getFullName(this.lstAttorney);
					res.next(this.lstAttorney);
				}));
			}
		})		
	}
	searchInsuranceScrollToEnd()
	{
		return new Observable((res) => {
			if (this.insurance_filter.page < this.insurance_filter.lastPage) {
				this.insurance_filter.page += 1
				this.insurance_filter.page = this.insurance_filter.page
				let body = {
					page: this.insurance_filter.page,	
					value: this.insurance_filter.searchKey,
					dropDownFilter:true,
					per_page :this.insurance_filter.per_page,
					keyName:'name'
				};
				this.subscription.push(this.caseFlowServie.searchMultipleSoftPatient(this.getScrollToEndObject(body),this.API_URL(InsuranceUrlsEnum.Insurance_list_GET,'billing')).subscribe((data) => {	
					let result = [...data['result']['data']];	
					this.insurance_filter.lastPage = data.result.last_page;	
					this.lstInsurance = [...this.lstInsurance, ...result];
					console.log(this.lstInsurance);
					res.next(this.lstInsurance);
				}));
			}
		})		
	}
	getScrollToEndObject(QueryParams) {
		let paramQuery: ParamQuery = {
			order: OrderEnum.ASC,
			pagination: true,
			filter: false,
			per_page: QueryParams ? QueryParams.per_page : 10,
			page: QueryParams ? QueryParams.page : 1,
			[QueryParams.keyName]:QueryParams.value
		};
		return paramQuery;
	}
	API_URL(API_URL,ServerURL?) {
		let Main_URL = REQUEST_SERVERS.fd_api_url; // DEFAULT CM OVADA_MD REQUEST URL
		if(ServerURL == 'billing') {
			Main_URL = REQUEST_SERVERS.billing_api_url;
		}
		return {
			Api_URL:API_URL,
			Main_URL:Main_URL,
		}
	}
	searchAdjusterNameScrollToEnd()
	{
		return new Observable((res) => {
			if (this.adjusterName_filter.page < this.adjusterName_filter.lastPage) {
				this.adjusterName_filter.page += 1
				this.adjusterName_filter.page = this.adjusterName_filter.page
				let body = {
					page: this.adjusterName_filter.page,	
					value: this.adjusterName_filter.searchKey,
					dropDownFilter:true,
					per_page :this.adjusterName_filter.per_page,
					keyName:'name'
				};
				this.subscription.push(this.caseFlowServie.searchMultipleSoftPatient(this.getScrollToEndObject(body), this.API_URL(AdjusterInformationUrlsEnum.insurance_adjuster_list_Get,'billing')).subscribe((data) => {	
					let result = [...data['result']['data']];	
					this.adjusterName_filter.lastPage = data.result.last_page;	
					this.lstAdjusterName = [...this.lstAdjusterName, ...result];
					this.lstAdjusterName = this.getFullName(this.lstAdjusterName);
					res.next(this.lstAdjusterName);
				}));
			}
		})		
	}
	searchAppointmentLocationScrollToEnd()
	{
		return new Observable((res) => {
			if (this.appointmentLocation_filter.page < this.appointmentLocation_filter.lastPage) {
				this.appointmentLocation_filter.page += 1
				this.appointmentLocation_filter.page = this.appointmentLocation_filter.page
				let body = {
					page: this.appointmentLocation_filter.page,	
					value: this.appointmentLocation_filter.searchKey,
					dropDownFilter:true,
					per_page :this.appointmentLocation_filter.per_page,
					keyName:'name'
				};
				this.subscription.push(this.caseFlowServie.searchMultipleSoftPatient(this.getScrollToEndObject(body),this.API_URL(FacilityUrlsEnum.Facility_list_dropdown_GET)).subscribe((data) => {	
					let result = [...data['result']['data']];	
					this.appointmentLocation_filter.lastPage = data.result.last_page;	
					this.lstAppointmentLocation = [...this.lstAppointmentLocation, ...result];
					this.lstAppointmentLocation.forEach(x => {
						if(x.id){
							x['is_select']= "all";
						}
					})
					res.next(this.lstAppointmentLocation);
				}));
			}
		})		
	}
	searchCaseScrollToEnd()
	{
		return new Observable((res) => {
			
			if (this.caseStatus_filter.page < this.caseStatus_filter.lastPage) {
				this.caseStatus_filter.page += 1
				this.caseStatus_filter.page = this.caseStatus_filter.page
	
				let body = {
	
					page: this.caseStatus_filter.page,
	
					name: this.caseStatus_filter.searchKey,
					per_page :this.caseStatus_filter.per_page
	
				};
	
				this.subscription.push(this.caseFlowServie.searchPractice(body).subscribe((data) => {
	
					let result = [...data['result']['data']];
	
					this.caseStatus_filter.lastPage = data.result.last_page;
	
					this.lstCaseStatus = [...this.lstCaseStatus, ...result];
					res.next(this.lstCaseStatus);
				}));
	
			}
	
		})
			
	}

	searchTypeHead(res)
	{
		
			this.practice_location_filter.searchKey=res;
			this.practice_location_filter.page=1;
			this.practice_location_filter.lastPage=2
			this.lstpractiseLocation=[]
			return new Observable((res) => {
		
					let body = {
		
						page: this.practice_location_filter.page,
		
						name: this.practice_location_filter.searchKey,
						
						per_page: this.practice_location_filter.per_page,
		
					};
		
					this.caseFlowServie.searchPracticeTypahead(body).subscribe((data) => {
		
						let result = [...data['result']['data']];
		
						this.practice_location_filter.lastPage = data.result.last_page;
		
						this.lstpractiseLocation = [...this.lstpractiseLocation, ...result];
						this.lstpractiseLocation.forEach(x => {
							if(x.id){
								x['is_select']= "all";
							}
						})
						res.next(this.lstpractiseLocation);
					});
		
				// }
		
			})
	}
	searchFirmTypeHead(res)
	{
		this.firms_filter.searchKey=res;
		this.firms_filter.page=1;
		this.firms_filter.lastPage=2
		this.lstFirms=[]
		return new Observable((res) => {	
				let body = {
					page: this.firms_filter.page,
					value: this.firms_filter.searchKey,
					dropDownFilter:true,
					per_page: this.firms_filter.per_page,	
					keyName:'name'
				};	
				this.subscription.push(this.caseFlowServie.searchMultipleTypahead(this.getQueryParams(body), this.API_URL(FirmUrlsEnum.AllFirms_list_GET)).subscribe((data) => {
					let result = [...data['result']['data']];	
					this.firms_filter.lastPage = data.result.last_page;
					this.lstFirms = [...this.lstFirms, ...result];
					res.next(this.lstFirms);
				}));
		})
	}	
	searchAttorneyTypeHead(res)
	{
		this.attorney_filter.searchKey=res;
		this.attorney_filter.page=1;
		this.attorney_filter.lastPage=2
		this.lstAttorney=[]
		return new Observable((res) => {	
				let body = {
					page: this.attorney_filter.page,
					value: this.attorney_filter.searchKey,
					dropDownFilter:true,
					per_page: this.attorney_filter.per_page,
					keyName:'name'
				};	
				this.subscription.push(this.caseFlowServie.searchMultipleTypahead(this.getQueryParams(body), this.API_URL(AttorneyUrlsEnum.attorney_list_GET)).subscribe((data) => {
					let result = [...data['result']['data']];	
					this.attorney_filter.lastPage = data.result.last_page;
					this.lstAttorney = [...this.lstAttorney, ...result];
					this.lstAttorney = this.getFullName(this.lstAttorney); 
					res.next(this.lstAttorney);
				}));
		})
	}
	getFullName(Array):any {
		return Array.map(res => {
			return {
				full_name: `${res.first_name} ${res.middle_name ? res.middle_name : ''} ${res.last_name}`,
				...res,
			}
		});
	}
	searchInsuranceTypeHead(res)
	{
		this.attorney_filter.searchKey=res;
		this.attorney_filter.page=1;
		this.attorney_filter.lastPage=2
		this.lstInsurance=[]
		return new Observable((res) => {	
				let body = {
					page: this.attorney_filter.page,
					value: this.attorney_filter.searchKey,
					per_page: this.attorney_filter.per_page,
					dropDownFilter:true,
					keyName:'insurance_name'	
				};	
				this.subscription.push(this.caseFlowServie.searchMultipleTypahead(this.getQueryParams(body),this.API_URL(InsuranceUrlsEnum.Insurance_list_GET,'billing')).subscribe((data) => {
					let result = [...data['result']['data']];	
					this.attorney_filter.lastPage = data.result.last_page;
					this.lstInsurance = [...this.lstInsurance, ...result];
					res.next(this.lstInsurance);
				}));
		})
	}
	searchAdjusterTypeHead(res)
	{
		this.adjusterName_filter.searchKey=res;
		this.adjusterName_filter.page=1;
		this.adjusterName_filter.lastPage=2
		this.lstAdjusterName=[]
		return new Observable((res) => {	
				let body = {
					page: this.adjusterName_filter.page,
					value: this.adjusterName_filter.searchKey,
					dropDownFilter:true,
					per_page: this.adjusterName_filter.per_page,
					keyName:'name'	
				};	
				this.subscription.push(this.caseFlowServie.searchMultipleTypahead(this.getQueryParams(body),this.API_URL(AdjusterInformationUrlsEnum.insurance_adjuster_list_Get,'billing')).subscribe((data) => {
					let result = [...data['result']['data']];	
					this.adjusterName_filter.lastPage = data.result.last_page;
					this.lstAdjusterName = [...this.lstAdjusterName, ...result];
					this.lstAdjusterName = this.getFullName(this.lstAdjusterName); 
					res.next(this.lstAdjusterName);
				}));
		})
	}
	searchAppointmentTypeHead(res)
	{
		this.appointmentLocation_filter.searchKey=res;
		this.appointmentLocation_filter.page=1;
		this.appointmentLocation_filter.lastPage=2
		this.lstAppointmentLocation=[];
		return new Observable((res) => {	
				let body = {
					page: this.appointmentLocation_filter.page,
					value: this.appointmentLocation_filter.searchKey,
					dropDownFilter:true,
					per_page: this.appointmentLocation_filter.per_page,
					keyName:'name'
				};	
				this.subscription.push(this.caseFlowServie.searchMultipleTypahead(this.getQueryParams(body), this.API_URL(FacilityUrlsEnum.Facility_list_dropdown_GET)).subscribe((data) => {
					let result = [...data['result']['data']];	
					this.appointmentLocation_filter.lastPage = data.result.last_page;
					this.lstAppointmentLocation = [...this.lstAppointmentLocation, ...result];
					this.lstAppointmentLocation.forEach(x => {
						if(x.id){
							x['is_select']= "all";
						}
					})
					res.next(this.lstAppointmentLocation);
				}));
		})
	}
	searchTypeHeadCaseStatus(res)
	{
		this.caseStatus_filter.searchKey=res;
		this.caseStatus_filter.page=1;
		this.caseStatus_filter.lastPage=2
		this.lstCaseStatus=[]
		return new Observable((res) => {
	
				let body = {
	
					page: this.caseStatus_filter.page,
	
					name: this.caseStatus_filter.searchKey,
					
					per_page: this.caseStatus_filter.per_page,
	
				};
	
				this.subscription.push(this.caseFlowServie.searchCaseStatusTypahead(body).subscribe((data) => {
	
					let result = [...data['result']['data']];
	
					this.caseStatus_filter.lastPage = data.result.last_page;
	
					this.lstCaseStatus = [...this.lstCaseStatus, ...result];
					this.lstCaseStatus.forEach(x => {
						if(x.id){
							x['is_select']= "all";
						}
					})
					res.next(this.lstCaseStatus);
				}));
		})
	}

	getQueryParams(QueryParams) {
		let params: ParamQuery = {
			filter: QueryParams.value ? true : false,
			order: OrderEnum.ASC,
			pagination: true,
			per_page: QueryParams.per_page || 10,
			page: QueryParams.page || 1,
			[QueryParams['keyName']]: QueryParams.value || null,
		} as any;
		return params;
	}
	onFocusSearchPracticeLocation(name) {
		return new Observable((res) => {
			
		})

	}

	bulkDeletePatient(){
		let patientIds:any[] = [];
		let appointmentIds : any[] = [];
		let ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			size: 'sm',
			keyboard: false,
			
		};
		this.customDiallogService
		.confirm('Delete Patient', 'Are You sure you want to delete the Patients?')
		.then((confirmed) => {
			if (confirmed) {
				this.selection.selected.forEach((softPatient:any)=> {
					patientIds.push(softPatient.id);
					if (softPatient.case&&softPatient.case.appointment){
						appointmentIds.push(softPatient.case.appointment.id);
					}
				});
				if (appointmentIds.length!=0) {
					let modalRef = this.modalService.open(DeleteReasonSoftRegistrationComponent, ngbModalOptions);
							modalRef.result.then((res) => {
								if(res && res.data && res.data.cancelled_comments)
								{
									let params = {
										appointment_ids:appointmentIds,
										cancelled_comments:res.data.cancelled_comments
									}
		
									this.subscription.push(
										this.requestService
										  .sendRequest(
											AssignSpecialityUrlsEnum.Cancel_Appointment_new,
											'post',
											REQUEST_SERVERS.schedulerApiUrl,
											params,
										  )
										  .subscribe(
											(res: any) => {
												if (res.status){
												this.modalService.dismissAll();
												this.deleteSelected(patientIds);
												}
											},
											(err) => {
											},
										  ),
									  );
								}
								
							});	
				}
				else {
					this.deleteSelected(patientIds);
				}
			}

		})
		.catch();

	
	}

	deleteSelected(row?) {
		
		let requestData = {
			patient_id: row.id,
			case_id: row.case.id,
			appointment_id: row.case.appointment && row.case.appointment.id ? row.case.appointment.id: null ,

		};
		this.subscription.push(
			this.requestService
			  .sendRequest(
				SoftPatientEnum.deleteSoftRegistrationPatient,
				'delete_with_body',
				REQUEST_SERVERS.kios_api_path,
				removeEmptyAndNullsFormObject(requestData),
			  )
			  .subscribe(
				(res: any) => {
					if (res && res.status){
						this.page.pageNumber=1;
						this.page.offset=0;
						this.setPage({});
						this.toastrService.success(res.message, 'Success');
						this.selection.clear();
					}
				},
				(err) => {
				},
			  ),
		  );
		
	}


	enablesocket() {
		this.socket.on('CHANGEINSOFTPATIENT', (message) => {
			this.showRefreshButton = true;
		});
	}

	disablesocket() {
			this.socket?.removeListener('CHANGEINSOFTPATIENT')
	}
	ngOnDestroy() {
		this.disablesocket();
		unSubAllPrevious(this.subscription);
		// this.logger.log('case-list ONDestroy Called');
	}
	public menu: any[] = [];
	public submenu: any[] = [];
	public ssubmenu: any[] = [];
	public submenu1: any[] = [];
	childNavigation(id) {
		this.router.navigate([`front-desk/cases/edit/${id}/patient/patient_summary`])
	}
	choosePatient() {
		let modalRef = this.modalService.open(ChoosePatientComponent, { size: 'lg', backdrop: 'static' });
		modalRef.result.then(data => {
		})
	}
	setQueryParams(params) {
		this.location.replaceState(
			this.router.createUrlTree([], { queryParams: removeEmptyAndNullsFormObject(params), }).toString()
		);
	}

	editCaseStatus(caseStatusModal,row){
		this.currentCase = row; 
		this.caseUpdateForm.patchValue({
			status_id:  null
		});
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'overflow_unset',
		};
		this.modalService.open(caseStatusModal, ngbModalOptions);
		

	}

	selectionOnValueChange($event){
		this.caseUpdateForm.patchValue({
			status_id:  $event.formValue
		});
	}

	masterToggle($event) {

	}

	updateCaseStatus(){
		this.caseStatusUpdateBoolean = true;
		let params = {
			case_id: this.currentCase.id,
			status_id: this.caseUpdateForm.value.status_id
		}
		this.subscription.push(
			this.requestService
			  .sendRequest(
				CasesUrlsEnum.CaseStatusUpdate,
				'put',
				REQUEST_SERVERS.kios_api_path,
				params,
			  )
			  .subscribe(
				(data: any) => {
					this.page.pageNumber = 1;this.setPage()
					this.caseStatusUpdateBoolean = false;
					this.modalService.dismissAll();
				},
				(err) => {
					this.caseStatusUpdateBoolean = false;
				},
			  ),
		  );

	}
	onValueChanges(form) {
		if(!isEmptyObject(form)) {
			this.filterFormDisabled = false;
		} else {
			this.filterFormDisabled = true;
		}
		let ResetButtonControl =  getFieldControlByName(this.fieldConfig, 'resetBtn');
		ResetButtonControl ? ResetButtonControl.configs.disabled = this.filterFormDisabled : null;
	}
	checkInputs(){
		if (isEmptyObject(this.form.value)) {
			this.filterFormDisabled = true;
		} else { 
			this.filterFormDisabled = false;
		}
	}

	resumeCase(row){
		if(row && row.case && !row.case.id)
		{
			this.toasterService.error('You cannot resume the case, because case is not created. ', 'Error');
			return ;
		}
		let practice_location_ids=row && row.case&& row.case.case_practice_locations?row.case.case_practice_locations.map((practiceloc)=>practiceloc.practice_location_id):[];

		let params = {
			patient_id: row.id, 
			case_id: row && row.case&& row.case.id?row.case.id :null,
			practice_locations:practice_location_ids && practice_location_ids.length? practice_location_ids:null,
		};
		this.customDiallogService
		.confirm('Resume Case', 'Do you really want to resume this Case?')
		.then((confirmed) => {
			if (confirmed) {
				this.resumeCaseApiCall(params, row);
			}
		})
		.catch();
	}

	
	resumeCaseApiCall(params, row?) {
		this.disablesocket();
		this.subscription.push(
			this.requestService
			  .sendRequest(
				SoftPatientEnum.resumeSoftRegistrationPatient,
				'post',
				REQUEST_SERVERS.kios_api_path,
				params,
			  )
			  .subscribe(
				(res: any) => {
					if (res.status){
						
						this.toasterService.success('Verified Successfully', 'Success');
						// this.page.offset=0;
						// this.page.pageNumber=1;
						// this.setPage();
						let practice_location_ids=row && row.case&& row.case.case_practice_locations?row.case.case_practice_locations.map((practiceloc)=>practiceloc.practice_location_id):[]
						let visitStatusCheckedIn=this.visitStatuses.find(visitStatus=>visitStatus.slug===VisitStatusSlugEnum.CheckedIn);
						let visitStatusParam={
							check_for_walk_in: true,
							case_id:row && row.case&& row.case.id?row.case.id :null,
							practice_location_ids:practice_location_ids && practice_location_ids.length? practice_location_ids:null,
							status_id: visitStatusCheckedIn&& visitStatusCheckedIn.id? visitStatusCheckedIn.id:null
						
						}
						visitStatusParam=removeEmptyAndNullsFormObject(visitStatusParam);

						this.changeVisitStatusesOnResumeCase(visitStatusParam)

					}
				
				},
				(err) => {
				},
			  ),
		  );
	}

	getVisitStatuses() {
		this.subscription.push(
			this.requestService
			  .sendRequest(
				SoftPatientEnum.getVisitStatuses,
				'Get',
				REQUEST_SERVERS.kios_api_path,
			  )
			  .subscribe(
				(res: any) => {
					this.visitStatuses=res && res.result && res.result.data?res.result.data:[]
				
				},
				(err) => {
				},
			  ),
		  );
	}

	changeVisitStatusesOnResumeCase(params) {
		this.subscription.push(
			this.requestService
			  .sendRequest(
				SoftPatientEnum.case_patient_session,
				'PUT',
				REQUEST_SERVERS.kios_api_path,
				params,
			  )
			  .subscribe(
				(res: any) => {
					if (res.status){
						this.page.offset=0;
						this.page.pageNumber=1;
						this.setPage();
						this.enablesocket();

					}
				},
				(err) => {
				},
			  ),
		  );
	}



	editSoftPatient(row){
		this.softPatientService.addSoftPatientProviderCalandar = false;
		this.softPatientService.pushAddNewSoftPatientThroughPatientProfile(0);
		this.router.navigate( ['/front-desk','soft-patient','list','edit',row.id], { queryParams: { caseId: row.case?row.case.id:null,appointmentId:row.case &&row.case.appointment?row.case.appointment.id:null, } });

	}
	addNewCase(){
		this.softPatientService.addSoftPatientProviderCalandar = false;
		this.softPatientService.pushAddNewSoftPatientThroughPatientProfile(0);
		this.router.navigate( ['/front-desk/soft-patient/list/add']);
	}

	resetNgSelectField(){
		this.resetTheNgSelectField$.next(true);
		this.caseTypes = [];
		this.lstpractiseLocation = [];
		this.lstFirms = [];
		this.lstInsurance = [];
		this.lstAppointmentLocation = [];
		this.lstAttorney = [];
		this.lstAdjusterName = [];
		this.specialties = [];
		this.specialties_filter.page = 0;
		this.practice_location_filter =  new SoftFilterPaginationClass();
		this.case_type_filter= new SoftFilterPaginationClass();
		this.firms_filter =new SoftFilterPaginationClass();
		this.attorney_filter =new SoftFilterPaginationClass();
		this.insurance_filter =new SoftFilterPaginationClass();
		this.adjusterName_filter=new SoftFilterPaginationClass();
		this.appointmentLocation_filter=new SoftFilterPaginationClass();
		this.caseStatus_filter=new SoftFilterPaginationClass();
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
			this.localStorage.setObject('softPatientTableList' + this.storageData.getUserId(), data);
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
		this.softPatientListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.softPatientListTable._internalColumns.sort(function (a, b) {
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
	billingHistoryStats(row) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc body-scroll history-modal',
			modalDialogClass: 'modal-lg'
		};
		let modelRef = this.modalService.open(CreatedHistoryComponent, ngbModalOptions);
		modelRef.componentInstance.createdInformation = [row];
	}

}
