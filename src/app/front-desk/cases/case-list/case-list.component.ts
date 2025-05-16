import { ErrorMessageModalComponent } from './components/error-message-component/error-message-component';
import { CustomDiallogService } from './../../../shared/services/custom-dialog.service';
import { CasesUrlsEnum } from '@appDir/front-desk/cases/Cases-Urls-Enum';
import { CaseStatusUrlsEnum } from './../../masters/billing/billing-master/CaseStatus-Urls-Enum';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { getFieldControlByName } from '@appDir/shared/dynamic-form/helper';
// import { Options } from 'ng5-slider';
import { CaseTypeUrlsEnum } from '@appDir/front-desk/masters/providers/caseType/case.type.enum';
import { SelectClass } from '@appDir/shared/dynamic-form/models/SelectClass.class';
import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { Location } from '@angular/common'
import { FormGroup, FormBuilder } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { Page } from '@appDir/front-desk/models/page';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { ToastrService } from 'ngx-toastr';
import { AclService } from '@appDir/shared/services/acl.service';
import { Observable, Subject, Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ChoosePatientComponent } from './components/choose-patient/choose-patient.component';
import { CaseFlowUrlsEnum } from '@appDir/front-desk/fd_shared/models/CaseFlowUrlsEnum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { CaseListModel } from './CaseList.Model';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { ButtonClass } from '@appDir/shared/dynamic-form/models/ButtonClass.class';
import { ButtonTypes } from '@appDir/shared/dynamic-form/constants/ButtonTypes.enum';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { NgSelectClass } from '@appDir/shared/dynamic-form/models/NgSelectClass.class';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { removeEmptyAndNullsFormObject, getExtentionOfFile, removeEmptyKeysFromObject, getIdsFromArray, makeDeepCopyArray } from '@appDir/shared/utils/utils.helpers';
import { map, take } from 'rxjs/operators';
import { isEmptyObject, changeDateFormat } from '@appDir/shared/utils/utils.helpers';
import { EnumApiPath } from '@appDir/front-desk/billing/Models/searchedKeys-modal';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { FirmUrlsEnum } from '@appDir/front-desk/masters/billing/attorney-master/firm/Firm-Urls-enum';
import { FilterService } from '@appDir/shared/filter/service/filter.service';


@Component({
	selector: 'app-case-list',
	templateUrl: './case-list.component.html',
	styleUrls: ['./case-list.component.scss'],
})
export class CaseListComponent extends PermissionComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	fieldConfig: FieldConfig[] = []
	cases: CaseListModel[] = [];
	form: FormGroup;
	selection = new SelectionModel<Element>(true, []);
	page: Page;
	// showMoreFilters: boolean = false;
	public loadSpin: boolean = false;
	loadSpinComment: boolean = false;
	isCollapsed = false;
	// @ViewChild('patientName') patientNameElement;
	caseTypeData: any[] = [];
	fieldsValue:any = {};
	lstpractiseLocation=[];
	lsthomeLocation=[];
	lstCaseStatus=[];
	lstEmployer=[]
	lstCaseTypes=[];
	practice_location_filter={
		page:0,
		searchKey:'',
		lastPage:2,
		per_page:10
	}
	home_location_filter={
		page:0,
		searchKey:'',
		lastPage:2,
		per_page:10
	}
	caseStatus_filter={
		page:0,
		searchKey:'',
		lastPage:2,
		per_page:10
	}
	employer_filter={
		page:0,
		searchKey:'',
		lastPage:2,
		per_page:10
	}
	attorney_filter={
		page:0,
		searchKey:'',
		lastPage:2,
		per_page:10
	}
	caseType_filter={
		page:0,
		searchKey:'',
		lastPage:2,
		per_page:10
	}
	firmPaginationSetting = {
		search:'',
		lastPage:null,
		per_page:10,
		currentPage:1,
	}
	
	searchTypeHead$:Subject<any>=new Subject<any>();
	searchTypeHeadHomeLocation$:Subject<any>=new Subject<any>();
	caseStatusSearchTypeHead$:Subject<any>=new Subject<any>();
	employerSearchTypeHead$:Subject<any>=new Subject<any>();
	caseTypeSearchTypeHead$:Subject<any>=new Subject<any>();
	updatedBySearchTypeHead$:Subject<any>=new Subject<any>();
	createdBySearchTypeHead$:Subject<any>=new Subject<any>();
	eventsSubjectReset$: Subject<any> = new Subject<any>();
	searchAttorneyTypeHead$:Subject<any>=new Subject<any>();
	resetTheNgSelectField$:Subject<any>=new Subject<any>();
	requestServerpath = REQUEST_SERVERS;
	CaseStatusUrlsEnum = CaseStatusUrlsEnum;
	currentCase: any; 
	caseUpdateForm: FormGroup;
	caseStatusUpdateBoolean: boolean= false;
	filterFormDisabled:boolean = false;
	@ViewChild(DynamicFormComponent) component: DynamicFormComponent;
	@ViewChild('errorMessageComponent') errorMessageComponent :ErrorMessageModalComponent;
	casesTotalRows:number =0;
	bulkCommentModal:any;
	fileToUpload:any;
	CreatedByPaginationSetting = {
		search:'',
		lastPage:null,
		per_page:10,
		currentPage:1,
	}
	UpdatedByPaginationSetting = {
		search:'',
		lastPage:null,
		per_page:10,
		currentPage:1,
	}
	CaseNoPaginationSetting = {
		search: '',
		lastPage: null,
		per_page: 10,
		currentPage: 1,
	}
	lstCreatedBy: any[] = [];
	lstUpdatedBy: any[] = [];
	lstCaseNo: any[] = [];
	colSelected: boolean = true;
	isAllFalse: boolean = false;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('caseList') caseListTable: DatatableComponent;
	customizedColumnComp: CustomizeColumnComponent;
	@ViewChild(CustomizeColumnComponent) set con(con: CustomizeColumnComponent) {
		if (con) { // initially setter gets called with undefined
		  this.customizedColumnComp = con;
		}
	}
	modalCols :any[] = [];
	lstFirm: any[] = [];
	columns: any[] = [];
	alphabeticColumns:any[] =[];
	caseListingTable: any;
    lstAttorney=[];
	selCols: any[] = [];
	practiceLocationFilter: any[] = [];

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
		private filterService:FilterService,
		public customDiallogService: CustomDiallogService,
		private localStorage: LocalStorage
	) {
		super(aclService, router, _route, requestService, titleService);
	}

	ngAfterViewInit() {
		this.form = this.component.form;
		this.caseUpdateForm = this.fb.group({
			status_id:null
		});

		if (this.caseListTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.caseListTable._internalColumns]);
			this.columns.forEach(element => {
				if(this.caseListingTable.length) {
					let obj = this.caseListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.caseListingTable.length) {
				const nameToIndexMap = {};
				this.caseListingTable.forEach((item, index) => {
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
			this.selCols = this.caseListingTable?.length ? this.caseListingTable : [];
			this.customizeColumnsForCSV();
			this.onConfirm(false);
		}
	}
	ngOnInit() {
		this.setTitle();
		// this.titleService.setTitle(this._route.snapshot.data['title']);
		this.initFilters();
		this._route.queryParams.subscribe((params) => {
			// this.form.patchValue(params);
			this.fieldsValue = {...params};
			this.fieldsValue.practice_locations=this.fieldsValue.practice_locations?this.fieldsValue.practice_locations.map(val=> Number(val)):null
			// this.fieldsValue = params;
			this.page.size = parseInt(params.per_page) || 10;
			this.page.pageNumber = parseInt(params.page) || 1;
			if(params && Object.keys(params).length > 0)
			{
				this.getPracticesBydefault();
				this.getCaseTypeListing();
		
			}
			this.checkInputs();
			this.setPage(params)
		}),
		this.setFilterForm()
		this.caseListingTable = this.localStorage.getObject('caseTableList' + this.storageData.getUserId());
	}

	resetFirmPagination() {
		this.firmPaginationSetting = {
		search:'',
		lastPage:null,
		currentPage:1,
		per_page:10
		}
	}
	getFirm(name?, firmid?,attorneyid?) {

		let order_by;
		let order;
		order = OrderEnum.DEC;
		!name ? order_by='count' : '';
		let paramQuery: any = { filter: true, order: OrderEnum.DEC, pagination: 1,order_by:order_by,page:this.firmPaginationSetting.currentPage,per_page:this.firmPaginationSetting.per_page,dropDownFilter:true }
		paramQuery = removeEmptyKeysFromObject(paramQuery);
		let filter = {}
		firmid ? filter['id'] = firmid : null
		name ? filter['name'] = name : null
		return this.requestService.sendRequest(FirmUrlsEnum.AllFirms_list_GET, 'get', REQUEST_SERVERS.fd_api_url, { ...paramQuery, ...filter })
	}
	searchFirm(name) {

		return new Observable((res) => {
			if(!this.lstFirm.length)
			{
				this.resetFirmPagination();
				this.getFirm(name, '').subscribe(data => {
				this.firmPaginationSetting.currentPage = parseInt(data?.result?.current_page);
				this.firmPaginationSetting.lastPage = parseInt(data?.result?.last_page);
				this.firmPaginationSetting.search = name;
				this.lstFirm = data['result']['data'];
				res.next(this.lstFirm);
				})
			}
			else
			{
				res.next(this.lstFirm);
			}
			
		})

	}
	onFocusSearchFirm(name) {
		return new Observable((res) => {
			if(!this.lstFirm.length)
			{
				this.resetFirmPagination();
				this.getFirm(name, '').subscribe(data => {
				this.firmPaginationSetting.currentPage = parseInt(data?.result?.current_page);
				this.firmPaginationSetting.lastPage = parseInt(data?.result?.last_page);
				this.firmPaginationSetting.search = name;
				this.lstFirm = data['result']['data'];
				res.next(this.lstFirm);
				})
			}
			else
			{
				res.next(this.lstFirm);
			}
			
		})

	}
	searchFirmScrollToEnd()
	{
		return new Observable((res) => {
			if (this.firmPaginationSetting.currentPage < this.firmPaginationSetting.lastPage) {
				this.firmPaginationSetting.currentPage += 1;
				this.firmPaginationSetting.currentPage = this.firmPaginationSetting.currentPage;
				this.getFirm(this.firmPaginationSetting.search, '').subscribe(data => {
					this.firmPaginationSetting.currentPage = parseInt(data?.result?.current_page);
					this.firmPaginationSetting.lastPage = parseInt(data?.result?.last_page);
					let result = data['result']['data'];
					this.lstFirm = [...this.lstFirm, ...result];
					res.next(this.lstFirm);
					});
			}
		})		
	}

	getFullName(Array):any {
		return Array.map(res => {
			return {
				full_name: `${res?.first_name} ${res?.middle_name ? res?.middle_name : ''} ${res?.last_name}`,
				...res,
			}
		});
	}

	getAttorneyOnOpen(byDefault?,isClear?) {
		if(isClear)
		{
			this.lstAttorney=[];
			this.attorney_filter.page=0;
			this.attorney_filter.searchKey='';
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
				this.subscription.push(this.filterService.searchAttorney(body).subscribe((data) => {
					let result = [...data['result']['data']];
					this.attorney_filter.searchKey = '';
					this.attorney_filter.lastPage = data?.result?.last_page;
					this.lstAttorney = [...this.lstAttorney, ...result];
					this.lstAttorney = this.getFullName(this.lstAttorney); 
					res.next(this.lstAttorney);
				}));
			}
		})
	}

searchAttorney(name) {
	return new Observable((res) => {
		let firmId=this.form?.value?.attorney?this.form.value.attorney_ids:null;
	});
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
				this.subscription.push(this.filterService.searchAttorney(body).subscribe((data) => {	
					let result = [...data['result']['data']];	
					this.attorney_filter.lastPage = data?.result?.last_page;	
					this.lstAttorney = [...this.lstAttorney, ...result];
					this.lstAttorney = this.getFullName(this.lstAttorney);
					res.next(this.lstAttorney);
				}));
			}
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
					name: this.attorney_filter.searchKey,
					dropDownFilter:true,
					per_page: this.attorney_filter.per_page,
				};	
				this.subscription.push(this.filterService.searchAttorney(body).subscribe((data) => {
					let result = [...data['result']['data']];	
					this.attorney_filter.lastPage = data?.result?.last_page;
					this.lstAttorney = [...this.lstAttorney, ...result];
					this.lstAttorney = this.getFullName(this.lstAttorney); 
					res.next(this.lstAttorney);
				}));
		})
	}

	searchHomeLocations(name) {

		return new Observable((res) => {
			let attorneyid=this.form?.value?.attorney?this.form.value.attorney.attorney_id:null;

		})

	}

getHomeOnOpen(byDefault?,isClear?) {
		if(isClear)
		{
			this.lsthomeLocation=[];
			this.home_location_filter.page=0;
			this.home_location_filter.searchKey='';
		}

		return new Observable((res) => {
			if (this.lsthomeLocation.length == 0) {
				this.home_location_filter.page+=1;
				let search_key= this.form.value.pra?this.form.value.attorney.attorney_id:null;
				let body = {
					page: this.home_location_filter.page,
					name: this.home_location_filter.searchKey,
					per_page: this.home_location_filter.per_page,
	
				};
	
				this.caseFlowServie.searchPractice(body).subscribe((data) => {

					let result = [...data['result']['data']];
	
					this.home_location_filter.searchKey = '';
	
					this.home_location_filter.lastPage = data?.result?.last_page;
	
					this.lsthomeLocation = [...this.lsthomeLocation, ...result];
					if(this.lstpractiseLocation.length) {
						this.lstpractiseLocation.forEach(x => {
							if(x?.id){
								x['is_select']= "all";
							}
						})	
						}
					
					res.next(this.lsthomeLocation);
					getFieldControlByName(this.fieldConfig, 'home_locations').items = data.length > 0 ? data.map(item => {
						return { label: item?.facility_full_name, name: item?.facility_full_name, value: item.id } as any
					}) : this.lsthomeLocation;
	
				});
	
			}
		})
	}



searchHomeLocationsScrollToEnd()
	{

		return new Observable((res) => {
			
			if (this.home_location_filter.page < this.home_location_filter.lastPage) {
				this.home_location_filter.page += 1
				this.home_location_filter.page = this.home_location_filter.page
	
				let body = {
	
					page: this.home_location_filter.page,
	
					name: this.practice_location_filter.searchKey,
					per_page :this.home_location_filter.per_page
	
				};
	
				this.caseFlowServie.searchPractice(body).subscribe((data) => {
	
					let result = [...data['result']['data']];
	
					this.home_location_filter.lastPage = data?.result?.last_page;
	
					this.lsthomeLocation = [...this.lsthomeLocation, ...result];
					this.lsthomeLocation?.forEach(x => {
						if(x?.id){
							x['is_select']= "all";
						}
					})
					res.next(this.lsthomeLocation);
					getFieldControlByName(this.fieldConfig, 'home_locations').items = data.length > 0 ? data.map(item => {
						return { label: item?.facility_full_name, name: item?.facility_full_name, value: item?.id } as any
					}) : this.lsthomeLocation;
				});
	
			}
	
		})
			
	}

	searchTypeHeadHomeLocation(res)
	{
		this.home_location_filter.searchKey=res;
		this.home_location_filter.page=1;
		this.home_location_filter.lastPage=2
		this.lsthomeLocation=[];
		return new Observable((res) => {
	
				let body = {
	
					page: this.home_location_filter.page,
	
					name: this.home_location_filter.searchKey,
					
					per_page: this.home_location_filter.per_page,
	
				};
	
				this.caseFlowServie.searchPracticeTypahead(body).subscribe((data) => {
	
					let result = [...data['result']['data']];
	
					this.home_location_filter.lastPage = data?.result?.last_page;
					this.lsthomeLocation=[];
					this.lsthomeLocation = [...this.lsthomeLocation, ...result];
					this.lsthomeLocation?.forEach(x => {
						if(x?.id){
							x['is_select']= "all";
						}
					})
					res.next(this.lsthomeLocation);
					getFieldControlByName(this.fieldConfig, 'home_locations').items = data.length > 0 ? data.map(item => {
						return { label: item?.facility_full_name, name: item?.facility_full_name, value: item?.id } as any
					}) : this.lsthomeLocation;
				});
	
			// }
	
		})
	}

	navigateTo(caseid)
	{
		if(this.aclService.hasPermission(this.userPermissions.patient_case_list_patient_summary_menu))
		{		
			this.router.navigate(['edit',caseid,'patient','patient_summary'],{ relativeTo: this.activatedRoute.parent.parent })
		}
		else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_case_info_menu))
		{
			this.router.navigate(['edit',caseid,'patient','case-info'],{ relativeTo: this.activatedRoute.parent.parent })

		}
		else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_personal_information_menu))
		{
			if(this.aclService.hasPermission(this.userPermissions.patient_case_list_personal_information_personal_tab))
			{
				this.router.navigate(['edit',caseid,'patient','personal-information','personal'],{ relativeTo: this.activatedRoute.parent.parent })

			}
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_personal_information_basic_contact_tab))
			{
				this.router.navigate(['edit',caseid,'patient','personal-information','basic-contact'],{ relativeTo: this.activatedRoute.parent.parent })

				
			}
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_personal_information_form_filler_tab))
			{
				this.router.navigate(['edit',caseid,'patient','personal-information','form-filler'],{ relativeTo: this.activatedRoute.parent.parent })

				
			}

			
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_personal_information_emergency_contact_tab))
			{
				this.router.navigate(['edit',caseid,'patient','personal-information','emergency-contact'],{ relativeTo: this.activatedRoute.parent.parent })

				
			}
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_personal_information_gurantor_tab))
			{
				this.router.navigate(['edit',caseid,'patient','personal-information','guarantor'],{ relativeTo: this.activatedRoute.parent.parent })

				
			}
		}
		else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_referrals_menu))
		{
			this.router.navigate(['edit',caseid,'referrals'],{ relativeTo: this.activatedRoute.parent.parent })

		}

		else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_menu))
		{
			if(this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_attorney_tab))
			{
				this.router.navigate(['edit',caseid,'case-insurance','attorney'],{ relativeTo: this.activatedRoute.parent.parent })

			}
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_insurance_tab))
			{
				this.router.navigate(['edit',caseid,'case-insurance','insurance'],{ relativeTo: this.activatedRoute.parent.parent })

			}
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_employer_tab))
			{
				this.router.navigate(['edit',caseid,'case-insurance','employer'],{ relativeTo: this.activatedRoute.parent.parent })

			}
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_accident_tab))
			{
				this.router.navigate(['edit',caseid,'case-insurance','accident'],{ relativeTo: this.activatedRoute.parent.parent })

			}
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_vehicle_tab))
			{
				this.router.navigate(['edit',caseid,'case-insurance','vehicle'],{ relativeTo: this.activatedRoute.parent.parent })

			}
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_household_tab))
			{
				this.router.navigate(['edit',caseid,'case-insurance','house-hold-info'],{ relativeTo: this.activatedRoute.parent.parent })

			}
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_medical_treatment_tab))
			{
				this.router.navigate(['edit',caseid,'case-insurance','medical-treatment'],{ relativeTo: this.activatedRoute.parent.parent })

			}

		}

		else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_injury_menu))
		{
			this.router.navigate(['edit',caseid,'injury'],{ relativeTo: this.activatedRoute.parent.parent })

		}
		else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_marketing_menu))
		{
			this.router.navigate(['edit',caseid,'marketing'],{ relativeTo: this.activatedRoute.parent.parent })

		}
		else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_docs_menu))
		{
			this.router.navigate(['edit',caseid,'document'],{ relativeTo: this.activatedRoute.parent.parent })

		}
		else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_scheduler_menu))
		{
			this.router.navigate(['edit',caseid,'scheduler'],{ relativeTo: this.activatedRoute.parent.parent })

		}
		else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_visits_menu))
		{
			this.router.navigate(['edit',caseid,'visits'],{ relativeTo: this.activatedRoute.parent.parent })

			
		}
		else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_billing_menu))
		{
			this.router.navigate(['edit',caseid,'billing'],{ relativeTo: this.activatedRoute.parent.parent })

		}
		// else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_comments_menu))
		// {

		// }
		
		
		
		
	}

	onClickLink(link) {
		// let ro=this.activatedRoute.parent.url;
	  this.router.navigate([link], { relativeTo: this.activatedRoute.parent });
	}

	setFilterForm() {
		this.fieldConfig = [
			new DivClass([
				new DivClass([
					new DivClass([
						// new NgSelectClass("Case No.",'case_ids','id','id', this.searchCaseNo.bind(this), true, null, [], '', ['col-sm-7 col-md-5 col-lg-4 col-xl-3'],[],{add_tag: false},null,null,this.searchCaseNo.bind(this, 'clear'),this.onFocusSearchCaseNo.bind(this),this.searchCaseNoScrollToEnd.bind(this),null,null),
						new InputClass('Case No.', 'case_ids[]', InputTypes.number, '', [], '', ['col-sm-6 col-md-6 col-lg-4 col-xl-3']),
						new InputClass('Chart ID', 'patient_id', InputTypes.text, '', [], '', ['col-sm-6 col-md-6 col-lg-4 col-xl-3'], { mask: '000-00-0000', skip_validation: true }),
						new InputClass('Patient Name', 'patient_name', InputTypes.text, '', [], '', ['col-sm-6 col-md-6 col-lg-4 col-xl-3']),
						// new ButtonClass('',['btn','btn-success'],ButtonTypes.button,null,{icon}),
					new NgSelectClass("Case Type", 'case_type', 'name', 'id', this.searchCaseType.bind(this), true, null, [], '', ['col-sm-6 col-md-6 col-lg-4 col-xl-3'],[],{dropdownSearch: true},null,null,this.getCaseTypeOnOpen.bind(this,null,'clear'),this.getCaseTypeOnOpen.bind(this),this.searchCaseTypeScrollToEnd.bind(this),this.caseTypeSearchTypeHead$,this.searchTypeHeadCaseTypes.bind(this),this.eventsSubjectReset$),
					], ['display-contents' ]),
					new DivClass([
						// new InputClass('Attorney', 'attorney_name', InputTypes.text, '', [], '', ['col-sm-6 col-md-3']),
						new NgSelectClass("Practice Location", 'practice_locations', 'facility_full_name', 'id', this.searchPracticeLocations.bind(this), true, null, [], '', ['col-sm-6 col-md-6 col-lg-4 col-xl-3'],[],{dropdownSearch: true},null,null,this.getPracticesOnOpen.bind(this,null,'clear'),this.getPracticesOnOpen.bind(this),this.searchPracticeLocationsScrollToEnd.bind(this),this.searchTypeHead$,this.searchTypeHead.bind(this),this.eventsSubjectReset$,true),
						new NgSelectClass("Home Location", 'home_locations', 'home_locations', 'id', this.searchHomeLocations.bind(this), true, null, [], '', ['col-sm-6 col-md-6 col-lg-4 col-xl-3'],[],{dropdownSearch: true},null,null,this.getHomeOnOpen.bind(this,null,'clear'),this.getHomeOnOpen.bind(this),this.searchHomeLocationsScrollToEnd.bind(this),this.searchTypeHeadHomeLocation$,this.searchTypeHeadHomeLocation.bind(this),this.eventsSubjectReset$,true),
						new NgSelectClass("Case Status", 'status_id', 'name', 'id', this.searchCaseStatus.bind(this), true, null, [], '', ['col-sm-6 col-md-6 col-lg-4 col-xl-3'],[],{dropdownSearch: true},null,null,this.getCaseOnOpen.bind(this,null,'clear'),this.getCaseOnOpen.bind(this),this.searchCaseScrollToEnd.bind(this),this.caseStatusSearchTypeHead$,this.searchTypeHeadCaseStatus.bind(this),this.eventsSubjectReset$),
						new NgSelectClass("Employer Name", 'employer_ids', 'employer_name', 'id', this.searchEmployer.bind(this), true, null, [], '', ['col-sm-6 col-md-6 col-lg-4 col-xl-3'],[],{dropdownSearch: true},null,null,this.getEmployerOnOpen.bind(this,null,'clear'),this.getEmployerOnOpen.bind(this),this.searchEmployerScrollToEnd.bind(this),this.employerSearchTypeHead$,this.searchTypeHeadEmployer.bind(this),this.eventsSubjectReset$),
						new NgSelectClass("Firm's Name", 'firm_ids', 'name', 'id', this.searchFirm.bind(this), true, null, [], '', ['col-sm-7 col-md-5 col-lg-4 col-xl-3'],[],{add_tag: false},null,null,this.searchFirm.bind(this),this.onFocusSearchFirm.bind(this),this.searchFirmScrollToEnd.bind(this),null,null),
						new NgSelectClass("Attorney", 'attorney_ids', 'full_name', 'id', this.searchAttorney.bind(this), true, null, [], '', ['col-sm-6 col-md-6 col-lg-4 col-xl-3'],[],{dropdownSearch: true},null,null,this.getAttorneyOnOpen.bind(this,null,'clear'),this.getAttorneyOnOpen.bind(this),this.searchAttorneyScrollToEnd.bind(this),this.searchAttorneyTypeHead$,this.searchAttorneyTypeHead.bind(this),this.resetTheNgSelectField$),
						new InputClass('Patient DOB (mm/dd/yyyy)', 'dob', InputTypes.date, '', [], '', ['col-sm-6 col-md-6 col-lg-4 col-xl-3']),
						new InputClass('Insurance', 'insurance_name', InputTypes.text, '', [], '', ['col-sm-6 col-md-6 col-lg-4 col-xl-3']),
						new InputClass('Date of Accident From (mm/dd/yyyy)', 'date_of_accident_from', InputTypes.date, '', [], '', ['col-sm-6 col-md-6 col-lg-4 col-xl-3']),
						new InputClass('Date of Accident To (mm/dd/yyyy)', 'date_of_accident_to', InputTypes.date, '', [], '', ['col-sm-6 col-md-6 col-lg-4 col-xl-3']),
						new InputClass('Claim No.', 'claim_no', InputTypes.text, '', [], '', ['col-sm-6 col-md-6 col-lg-4 col-xl-3']),
						new InputClass('WCB No. (G0000000/00000000)', 'wcb_no', InputTypes.wcb, '', [], '', ['col-sm-6 col-md-6 col-lg-4 col-xl-3'], { mask: 'A0000000', skip_validation: true }),
						new InputClass('Injured Body Parts', 'body_parts', InputTypes.text, '', [], '', ['col-sm-6 col-md-6 col-lg-4 col-xl-3']),
						new InputClass('Policy', 'policy', InputTypes.text, '', [], '', ['col-sm-6 col-md-6 col-lg-4 col-xl-3']),
						// new InputClass('Case Status', 'status', InputTypes.text, '', [], '', ['col-sm-6 col-md-3']),
						new InputClass('Last Appointment. (mm/dd/yyyy)', 'lastAppointment', InputTypes.date, '', [], '', ['col-sm-6 col-md-6 col-lg-4 col-xl-3']),
						new InputClass('Next Appointment. (mm/dd/yyyy)', 'nextAppointment', InputTypes.date, '', [], '', ['col-sm-6 col-md-6 col-lg-4 col-xl-3']),
						// new InputClass('Claim No.', 'claim_no', InputTypes.text, '', [], '', ['col-3']),
						new NgSelectClass("Created By",'created_by_ids','full_name','id', this.searchCreatedBy.bind(this), true, null, [], '', ['col-sm-7 col-md-5 col-lg-4 col-xl-3'],[],{add_tag: false, dropdownSearch: true},null,null,this.searchCreatedBy.bind(this,null,'clear'),this.onFocusSearchCreatedBy.bind(this),this.searchCratedByScrollToEnd.bind(this),this.createdBySearchTypeHead$,this.searchTypeHeadCreatedBy.bind(this),this.eventsSubjectReset$),
						new NgSelectClass("Updated By",'updated_by_ids','full_name','id', this.searchUpdatedBy.bind(this), true, null, [], '', ['col-sm-7 col-md-5 col-lg-4 col-xl-3'],[],{add_tag: false, dropdownSearch: true},null,null,this.searchUpdatedBy.bind(this,null,'clear'),this.onFocusSearchUpdatedBy.bind(this),this.searchUpdatedByScrollToEnd.bind(this),this.updatedBySearchTypeHead$,this.searchTypeHeadUpdatedBy.bind(this),this.eventsSubjectReset$),
						new DivClass([
							new ButtonClass('Filter', ['btn', 'btn-success float-right me-3'], ButtonTypes.submit),
							new ButtonClass('Reset', ['btn', 'btn-primary'], ButtonTypes.button, this.resetForm.bind(this), {disabled:this.filterFormDisabled,name:'resetBtn'})
						], ['col-12', 'search-filter-btn', 'd-flex justify-content-center'])
					], ['display-contents','ng-check', 'hidden'])

				], ['row px-2', 'field-block']),
				new DivClass([
					new ButtonClass('', ['btn', 'btn-primary plus-btn float-right mt-0'], ButtonTypes.button, this.collapseDiv.bind(this), { icon: 'icon-plus', button_classes: ['col-2'] })
				], ['colps-btn-block']),

			], ['row', 'dynamic-filter']),

		]
	}

	searchCaseNo(name) {
		return new Observable((res) => {
			this.getCaseNo(name).subscribe(data => {
			this.CaseNoPaginationSetting.lastPage = parseInt(data.result.pages);
			this.CaseNoPaginationSetting.search = name;
			this.lstCaseNo = data['result']['data'];
			res.next(this.lstCaseNo);
			})
		})
	}

	getCaseNo(name?) {
		let paramQuery: any = { 
			filter: true, 
			pagination: 1,
			page: name == 'clear' || name == '' ? 1 : this.CaseNoPaginationSetting.currentPage,
			per_page: this.CaseNoPaginationSetting.per_page 
		}
		paramQuery = removeEmptyKeysFromObject(paramQuery);
		let filter = {}
		name && name != 'clear' ? filter['id'] = name : null
		return this.requestService.sendRequest(CaseFlowUrlsEnum.GetCaseList, 'get', REQUEST_SERVERS.kios_api_path, { ...paramQuery, ...filter })
	}

	onFocusSearchCaseNo(name) {
		return new Observable((res) => {
			if(!this.lstCaseNo.length)
			{
				this.getCaseNo(name).subscribe(data => {
				this.CaseNoPaginationSetting.lastPage = parseInt(data.result.pages);
				this.CaseNoPaginationSetting.search = name;
				this.lstCaseNo = data['result']['data'];
				res.next(this.lstCaseNo);
				})
			}
			else
			{
				res.next(this.lstCaseNo);
			}
		})
	}

	searchCaseNoScrollToEnd()
	{
		return new Observable((res) => {
			if (this.CaseNoPaginationSetting.currentPage < this.CaseNoPaginationSetting.lastPage) {
				this.CaseNoPaginationSetting.currentPage += 1;
				this.CaseNoPaginationSetting.currentPage = this.CaseNoPaginationSetting.currentPage;
				this.getCaseNo(this.CaseNoPaginationSetting.search).subscribe(data => {
					this.CaseNoPaginationSetting.lastPage = parseInt(data.result.pages);
					let result = data['result']['data'];
					this.lstCaseNo = [...this.lstCaseNo, ...result];
					res.next(this.lstCaseNo);
				});
			}
		})		
	}

	getCreatedBy(name?, createdByid?) {
		let paramQuery: any = { filter: true, pagination: 1,page:this.CreatedByPaginationSetting.currentPage,per_page:this.CreatedByPaginationSetting.per_page,dropDownFilter:true,}
		paramQuery = removeEmptyKeysFromObject(paramQuery);
		let filter = {}
		createdByid ? filter['id'] = createdByid : null
		name ? filter['name'] = name : null
		return this.requestService.sendRequest(EnumApiPath.createdByApiPath, 'get', REQUEST_SERVERS.fd_api_url, { ...paramQuery, ...filter })
	}

	searchCreatedBy(name,isClear?) {
		if(isClear)
		{
			this.lstCreatedBy=[];
			this.CreatedByPaginationSetting.currentPage=1;
			this.CreatedByPaginationSetting.search='';
		}
		return new Observable((res) => {
			this.getCreatedBy(name, '').subscribe(data => {
			this.CreatedByPaginationSetting.currentPage = parseInt(data.result.current_page);
			this.CreatedByPaginationSetting.lastPage = parseInt(data.result.last_page);
			this.CreatedByPaginationSetting.search = name;
			this.lstCreatedBy = data['result']['data'];
			res.next(this.lstCreatedBy);
			})
		})
	}

	onFocusSearchCreatedBy(name) {
		return new Observable((res) => {
			if(!this.lstCreatedBy.length)
			{
				this.getCreatedBy(name, '').subscribe(data => {
				this.CreatedByPaginationSetting.currentPage = parseInt(data.result.current_page);
				this.CreatedByPaginationSetting.lastPage = parseInt(data.result.last_page);
				this.CreatedByPaginationSetting.search = name;
				this.lstCreatedBy = data['result']['data'];
				res.next(this.lstCreatedBy);
				})
			}
			else
			{
				res.next(this.lstCreatedBy);
			}
		})
	}

	searchCratedByScrollToEnd()
	{
		return new Observable((res) => {
			if (this.CreatedByPaginationSetting.currentPage < this.CreatedByPaginationSetting.lastPage) {
				this.CreatedByPaginationSetting.currentPage += 1;
				this.CreatedByPaginationSetting.currentPage = this.CreatedByPaginationSetting.currentPage;
				this.getCreatedBy(this.CreatedByPaginationSetting.search, '').subscribe(data => {
					this.CreatedByPaginationSetting.currentPage = parseInt(data.result.current_page);
					this.CreatedByPaginationSetting.lastPage = parseInt(data.result.last_page);
					let result = data['result']['data'];
					this.lstCreatedBy = [...this.lstCreatedBy, ...result];
					res.next(this.lstCreatedBy);
				});
			}
		})		
	}

	searchTypeHeadCreatedBy(name)
	{
		this.CreatedByPaginationSetting.search=name;
		this.CreatedByPaginationSetting.currentPage=1;
		this.CreatedByPaginationSetting.lastPage=null;
		this.lstCreatedBy=[];
		return new Observable((res) => {
	
			this.getCreatedBy(name, '').subscribe(data => {
				this.CreatedByPaginationSetting.currentPage = parseInt(data.result.current_page);
				this.CreatedByPaginationSetting.lastPage = parseInt(data.result.last_page);
				this.CreatedByPaginationSetting.search = name;
				this.lstCreatedBy = data['result']['data'];
				res.next(this.lstCreatedBy);
				})
		})
	}

	getUpdatedBy(name?, createdByid?) {
		let paramQuery: any = { filter: true, pagination: 1,page:this.UpdatedByPaginationSetting.currentPage,per_page:this.UpdatedByPaginationSetting.per_page,dropDownFilter:true }
		paramQuery = removeEmptyKeysFromObject(paramQuery);
		let filter = {}
		createdByid ? filter['id'] = createdByid : null
		name ? filter['name'] = name : null
		return this.requestService.sendRequest(EnumApiPath.createdByApiPath, 'get', REQUEST_SERVERS.fd_api_url, { ...paramQuery, ...filter })
	}

	searchUpdatedBy(name,isClear?) {
		if(isClear)
		{
			this.lstUpdatedBy=[];
			this.UpdatedByPaginationSetting.currentPage=1;
			this.UpdatedByPaginationSetting.search='';
		}
		return new Observable((res) => {
			this.getUpdatedBy(name, '').subscribe(data => {
			this.UpdatedByPaginationSetting.currentPage = parseInt(data.result.current_page);
			this.UpdatedByPaginationSetting.lastPage = parseInt(data.result.last_page);
			this.UpdatedByPaginationSetting.search = name;
			this.lstUpdatedBy = data['result']['data'];
			res.next(this.lstUpdatedBy);
			})
		})
	}

	onFocusSearchUpdatedBy(name) {
		return new Observable((res) => {
			if(!this.lstUpdatedBy.length)
			{
				this.getUpdatedBy(name, '').subscribe(data => {
				this.UpdatedByPaginationSetting.currentPage = parseInt(data.result.current_page);
				this.UpdatedByPaginationSetting.lastPage = parseInt(data.result.last_page);
				this.UpdatedByPaginationSetting.search = name;
				this.lstUpdatedBy = data['result']['data'];
				res.next(this.lstUpdatedBy);
				})
			}
			else
			{
				res.next(this.lstUpdatedBy);
			}
		})
	}

	searchUpdatedByScrollToEnd()
	{
		return new Observable((res) => {
			if (this.UpdatedByPaginationSetting.currentPage < this.UpdatedByPaginationSetting.lastPage) {
				this.UpdatedByPaginationSetting.currentPage += 1;
				this.UpdatedByPaginationSetting.currentPage = this.UpdatedByPaginationSetting.currentPage;
				this.getUpdatedBy(this.UpdatedByPaginationSetting.search, '').subscribe(data => {
					this.UpdatedByPaginationSetting.currentPage = parseInt(data.result.current_page);
					this.UpdatedByPaginationSetting.lastPage = parseInt(data.result.last_page);
					let result = data['result']['data'];
					this.lstUpdatedBy = [...this.lstUpdatedBy, ...result];
					res.next(this.lstUpdatedBy);
				});
			}
		})		
	}

	searchTypeHeadUpdatedBy(name)
	{
		this.UpdatedByPaginationSetting.search=name;
		this.UpdatedByPaginationSetting.currentPage=1;
		this.UpdatedByPaginationSetting.lastPage=null;
		this.lstUpdatedBy=[];
		return new Observable((res) => {
	
			this.getUpdatedBy(name, '').subscribe(data => {
				this.UpdatedByPaginationSetting.currentPage = parseInt(data.result.current_page);
				this.UpdatedByPaginationSetting.lastPage = parseInt(data.result.last_page);
				this.UpdatedByPaginationSetting.search = name;
				this.lstUpdatedBy = data['result']['data'];
				res.next(this.lstUpdatedBy);
				})
		})
	}

	resetForm() {
		this.eventsSubjectReset$.next(true);
		this.lstCreatedBy = [];
		this.lstUpdatedBy = [];
		this.lstCaseNo = [];
		this.lstCaseTypes = [];
		this.lstCaseStatus = [];
		this.lstpractiseLocation = [];
		this.lsthomeLocation = [];
		this.lstAttorney = [];
		this.lstEmployer=[];
		this.form.reset();
		// this.form.patchValue({ caseId: null });
		this.page.pageNumber = 1;
		this.caseType_filter.page = 0;
		this.employer_filter.page=0;
		this.caseStatus_filter.page = 0;
		this.attorney_filter.page = 0;
		this.practice_location_filter.page = 0;
		this.home_location_filter.page = 0;
		this.UpdatedByPaginationSetting.currentPage = 1;
		this.CreatedByPaginationSetting.currentPage = 1;
		this.setPage();
	}

	onDeleteCase(row?){
		let params :any = {};
		if (row){
			params = {
				id : row.case_id
			}
		}
		this.customDiallogService
		.confirm('Delete Case', 'Do you really want to delete these Case?')
		.then((confirmed) => {
			if (confirmed) {
				

			}
		})
		.catch();
	}



	getCaseTypeListing(queryParamscaseType?) {
		// for plan type
		this.subscription.push(
		  this.requestService
			.sendRequest(
			  CaseTypeUrlsEnum.CaseType_list_GET,
			  'GET',
			  REQUEST_SERVERS.fd_api_url,
			  queryParamscaseType,
			)
			.subscribe(
			  (data: any) => {
				this.caseTypeData = data && data.result ? data.result.data : [];

				let  caseTypes:any[]=  this.caseTypeData.map(type => {
					return { label: type.name, name: type.name, value: type.name } as any
				 })
	
				getFieldControlByName(this.fieldConfig, 'case_type').options =caseTypes;
			  },
			  (err) => {
				// const str = parseHttpErrorResponseObject(err.error.message);
				// this.toaster.error(str);
			  },
			),
		);
	}
	submit() {
		let chart_id = this.form.value.patient_id as string;
		this.page.pageNumber = 1
		if (chart_id) {
			this.form.patchValue({ patient_id: `0`.repeat(9 - chart_id.length) + chart_id })
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
		this.form.value.patient_name ? this.form.value.patient_name = this.form.value.patient_name.trim() : null;
		let val={...this.form.value};
		this.practiceLocationFilter = val?.practice_locations;
		val.date_of_accident_from = val.date_of_accident_from ? changeDateFormat(val.date_of_accident_from) : '';
		val.date_of_accident_to = val.date_of_accident_to ? changeDateFormat(val.date_of_accident_to) : '';
		val.dob = val.dob ? changeDateFormat(val.dob) : '';
		val.lastAppointment = val.lastAppointment ? changeDateFormat(val.lastAppointment) : '';
		val.nextAppointment = val.nextAppointment ? changeDateFormat(val.nextAppointment) : '';
		let query: any = { pagination: true, page: this.page.pageNumber, per_page: this.page.size, filter: true, order_by: OrderEnum.DEC, ...val , ...params } as any
		this.setQueryParams(query)
		query.practice_locations=query.practice_locations?query.practice_locations.toString():'';
		query.home_locations=query.home_locations?query.home_locations.toString():'';
		query.case_type=query.case_type?query.case_type.toString():'';
		query.status_id=query.status_id?query.status_id.toString():'';
		this.requestService.sendRequest(CaseFlowUrlsEnum.GetCaseList, 'get', REQUEST_SERVERS.kios_api_path, removeEmptyAndNullsFormObject({ ...query })).subscribe(data => {
			this.cases = data?.['result']?.['data']
			this.page.totalElements = data?.['result']?.total
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

	confirmDel(id?: number) {

		this.customDiallogService
		.confirm(`Delete ${id?'Case':'Cases'}`, `Do you really want to delete ${id?'this Case?':
		this.selection.selected.length===1?'this Case?':'these Cases?'}`)
		.then((confirmed) => {
			if (confirmed) {
				this.deleteSelected(id);
			}
		})
		.catch();
		
	}

	searchPracticeLocations(name) {
		return new Observable((res) => {
			let attorneyid=this.form.value.attorney?this.form.value.attorney.attorney_id:null;

		})
	}
	searchEmployer(name){
		return new Observable((res) => {
			let employerid=this.form?.value?.employer_ids || null;

		})
	}

	searchCaseStatus(name) {
		return new Observable((res) => {
			let attorneyid=this.form.value.status_id?this.form.value.status_id:null;

		})

	}
	searchCaseType(name) {
		return new Observable((res) => {
			let attorneyid=this.form.value.case_type?this.form.value.case_type:null;

		})

	}

	generateExcel(){
		this.form.value.patient_name ? this.form.value.patient_name = this.form.value.patient_name.trim() : null;
		let val = {
			...this.form.value,
			order_by: OrderEnum.DEC,
			order: 'id'
		}
		// if(!this.practiceLocationFilter?.length) {
		// 	this.toastrService.info('Practice-Location filter is required before exporting to CSV', 'Info');
		// 	return;
		// }
		val['date_of_accident_from'] = changeDateFormat(val['date_of_accident_from']);
		val['date_of_accident_to'] = changeDateFormat(val['date_of_accident_to']);
		val['dob'] = changeDateFormat(val['dob']);
		val['lastAppointment'] = changeDateFormat(val['lastAppointment']);
		val['nextAppointment'] = changeDateFormat(val['nextAppointment']);
		let cols: any[] = [];
		if(this.selCols?.length) {
			this.selCols?.map(ele => {
				if(ele?.prop == 'actions') {
					cols.push('created_at')
					cols.push('updated_at')
					cols.push('created_by')
					cols.push('updated_by')
				}
				else {
					cols.push(ele?.prop)
				}
			})
		}
		let filters=removeEmptyKeysFromObject(val);
		filters = {
			...filters,
			custom_columns: JSON.stringify(cols)
		}
		this.subscription.push(this.requestService.sendRequest(CasesUrlsEnum.CaseExportExcel + "?token=" + this.storageData.getToken(), 'get', REQUEST_SERVERS.fd_api_url, filters)
		.subscribe(res => {
			this.toastrService.success(res?.message, 'Success');
			}, 
			err => {
				if(err?.error?.message) {
					this.toastrService.error(err?.error?.message, 'Error');
				}
				else {
					this.toastrService.error(err?.error?.error?.message, 'Error');
				}
			}
		));
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
				this.caseFlowServie.searchPractice(body).subscribe((data) => {
					let result = [...data['result']['data']];
	
					this.caseStatus_filter.searchKey = '';
	
					this.caseStatus_filter.lastPage = data.result.last_page;
	
					this.lstCaseStatus = [...this.lstCaseStatus, ...result];

					res.next(this.lstCaseStatus);
	
				});
	
			
		})
	}
	getPracticesOnOpen(byDefault?,isClear?) {
		if(isClear)
		{
			this.lstpractiseLocation=[];
			this.practice_location_filter.page=0;
			this.practice_location_filter.searchKey='';
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
	
				this.caseFlowServie.searchPractice(body).subscribe((data) => {

					let result = [...data['result']['data']];
	
					this.practice_location_filter.searchKey = '';
	
					this.practice_location_filter.lastPage = data.result.last_page;
	
					this.lstpractiseLocation = [...this.lstpractiseLocation, ...result];
					this.lstpractiseLocation?.forEach(x => {
						if(x?.id){
							x['is_select']= "all";
						}
					})
					res.next(this.lstpractiseLocation);
	
				});
	
			}
		})
	}
	getEmployerOnOpen(byDefault?,isClear?){
		if(isClear)
			{
				this.lstEmployer=[];
				this.employer_filter.page=0;
				this.employer_filter.searchKey='';
			}
	
			return new Observable((res) => {
				if (this.lstEmployer.length == 0) {
					this.employer_filter.page+=1;
					let search_key= this.form.value.pra?this.form.value.attorney.attorney_id:null;
					let body = {
						page: this.employer_filter.page,
						name: this.employer_filter.searchKey,
						per_page: this.employer_filter.per_page,
		
					};
	
					this.caseFlowServie.searchEmployer(body).subscribe((data) => {
						let result = [...data['result']['data']];
		
						this.employer_filter.searchKey = '';
		
						this.employer_filter.lastPage = data.result.last_page;
		
						this.lstEmployer = [...this.lstEmployer, ...result];
						this.lstEmployer.forEach(x => {
							if(x.id){
								x['is_select']= "all";
							}
						})
	
						res.next(this.lstEmployer);
		
					});
		
				}
			})
	}

	getCaseOnOpen(byDefault?,isClear?) {
		if(isClear)
		{
			this.lstCaseStatus=[];
			this.caseStatus_filter.page=0;
			this.caseStatus_filter.searchKey='';
		}

		return new Observable((res) => {
			if (this.lstCaseStatus.length == 0) {
				this.caseStatus_filter.page+=1;
				let search_key= this.form.value.pra?this.form.value.attorney.attorney_id:null;
				let body = {
					page: this.caseStatus_filter.page,
					name: this.caseStatus_filter.searchKey,
					per_page: this.caseStatus_filter.per_page,
	
				};

				this.caseFlowServie.searchCaseStatus(body).subscribe((data) => {
					let result = [...data['result']['data']];
	
					this.caseStatus_filter.searchKey = '';
	
					this.caseStatus_filter.lastPage = data.result.last_page;
	
					this.lstCaseStatus = [...this.lstCaseStatus, ...result];
					this.lstCaseStatus.forEach(x => {
						if(x.id){
							x['is_select']= "all";
						}
					})

					res.next(this.lstCaseStatus);
	
				});
	
			}
		})
	}
	getCaseTypeOnOpen(byDefault?,isClear?) {
		if(isClear)
		{
			this.lstCaseTypes=[];
			this.caseType_filter.searchKey='';
			this.caseType_filter.page=0;
		}
		return new Observable((res) => {
			if (this.lstCaseTypes.length == 0) {
				this.caseType_filter.page+=1;
				let search_key= this.form.value.pra?this.form.value.attorney.attorney_id:null;
				let body = {
					page: this.caseType_filter.page,
					name: this.caseType_filter.searchKey,
					per_page: this.caseType_filter.per_page,
				};
	
				this.caseFlowServie.searchCaseTypes(body).subscribe((data) => {
					let result = [...data['result']['data']];
	
					this.caseType_filter.searchKey = '';
	
					this.caseType_filter.lastPage = data.result.last_page;
	
					this.lstCaseTypes = [...this.lstCaseTypes, ...result];
					this.lstCaseTypes.forEach(x => {
						if(x.id){
							x['is_select']= "all";
						}
					})
					if(byDefault)
					{
						getFieldControlByName(this.fieldConfig, 'case_type').items = this.lstCaseTypes
					}
					
					res.next(this.lstCaseTypes);
	
				});
	
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
				this.caseFlowServie.searchPractice(body).subscribe((data) => {
					let result = [...data['result']['data']];
					this.practice_location_filter.searchKey = '';
					this.practice_location_filter.lastPage = data.result.last_page;
					this.lstpractiseLocation = [...this.lstpractiseLocation, ...result];
					this.lstpractiseLocation.forEach(x => {
						if(x.id){
							x['is_select']= "all";
						}
					})
			getFieldControlByName(this.fieldConfig, 'practice_locations').items = data.length > 0 ? data.map(item => {
				return { label: item?.facility_full_name, name: item?.facility_full_name, value: item.id } as any
			}) : this.lstpractiseLocation;
				});
	}
	getCaseStatusBydefault(){

		this.caseStatus_filter.page+=1;
		let body = {

			page: this.caseStatus_filter.page,

			name: this.caseStatus_filter.searchKey,
			per_page :this.caseStatus_filter.per_page

		};

		this.caseFlowServie.searchPractice(body).subscribe((data) => {

			let result = [...data['result']['data']];

			this.caseStatus_filter.searchKey = '';

			this.caseStatus_filter.lastPage = data.result.last_page;

			this.lstCaseStatus = [...this.lstCaseStatus, ...result];
			this.lstCaseStatus.forEach(x => {
				if(x.id){
					x['is_select']= "all";
				}
			})

			getFieldControlByName(this.fieldConfig, 'practice_locations').items = data.length > 0 ? data.map(item => {
				return { label: item.facility_full_name, name: item.facility_full_name, value: item.id } as any
			}) : this.lstCaseStatus;


		});

	}


	searchPracticeLocationsScrollToEnd()
	{

		return new Observable((res) => {
			
			if (this.practice_location_filter.page < this.practice_location_filter.lastPage) {
				this.practice_location_filter.page += 1
				this.practice_location_filter.page = this.practice_location_filter.page
	
				let body = {
	
					page: this.practice_location_filter.page,
	
					name: this.practice_location_filter.searchKey,
					per_page :this.practice_location_filter.per_page
	
				};
	
				this.caseFlowServie.searchPractice(body).subscribe((data) => {
	
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
	
			}
	
		})
			
	}
	searchEmployerScrollToEnd()
	{
		return new Observable((res) => {
			
			if (this.employer_filter.page < this.employer_filter.lastPage) {
				this.employer_filter.page += 1
				this.employer_filter.page = this.employer_filter.page
	
				let body = {
	
					page: this.employer_filter.page,
	
					name: this.employer_filter.searchKey,
					per_page :this.employer_filter.per_page
	
				};
	
				this.caseFlowServie.searchEmployer(body).subscribe((data) => {
	
					let result = [...data['result']['data']];
	
					this.employer_filter.lastPage = data.result.last_page;
	
					this.lstEmployer = [...this.lstEmployer, ...result];
					this.lstEmployer.forEach(x => {
						if(x.id){
							x['is_select']= "all";
						}
					})
					res.next(this.lstEmployer);
				});
	
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
	
				this.caseFlowServie.searchCaseStatus(body).subscribe((data) => {
	
					let result = [...data['result']['data']];
	
					this.caseStatus_filter.lastPage = data.result.last_page;
	
					this.lstCaseStatus = [...this.lstCaseStatus, ...result];
					this.lstCaseStatus.forEach(x => {
						if(x.id){
							x['is_select']= "all";
						}
					})
					res.next(this.lstCaseStatus);
				});
	
			}
	
		})
			
	}
	searchCaseTypeScrollToEnd()
	{
		return new Observable((res) => {
			
			if (this.caseType_filter.page < this.caseType_filter.lastPage) {
				this.caseType_filter.page += 1
				this.caseType_filter.page = this.caseType_filter.page
	
				let body = {
	
					page: this.caseType_filter.page,
	
					name: this.caseType_filter.searchKey,
					per_page :this.caseType_filter.per_page
	
				};
	
				this.caseFlowServie.searchCaseTypes(body).subscribe((data) => {
	
					let result = [...data['result']['data']];
	
					this.caseType_filter.lastPage = data.result.last_page;
	
					this.lstCaseTypes = [...this.lstCaseTypes, ...result];
					this.lstCaseTypes.forEach(x => {
						if(x.id){
							x['is_select']= "all";
						}
					})
					res.next(this.lstCaseTypes);
				});
	
			}
	
		})
			
	}
	searchTypeHead(res)
	{
		this.practice_location_filter.searchKey=res;
		this.practice_location_filter.page=1;
		this.practice_location_filter.lastPage=2
		this.lstpractiseLocation=[];
		return new Observable((res) => {
	
				let body = {
	
					page: this.practice_location_filter.page,
	
					name: this.practice_location_filter.searchKey,
					
					per_page: this.practice_location_filter.per_page,
	
				};
	
				this.caseFlowServie.searchPracticeTypahead(body).subscribe((data) => {
	
					let result = [...data['result']['data']];
	
					this.practice_location_filter.lastPage = data.result.last_page;
					this.lstpractiseLocation=[];
					this.lstpractiseLocation = [...this.lstpractiseLocation, ...result];
					this.lstpractiseLocation.forEach(x => {
						if(x.id){
							x['is_select']= "all";
						}
					})
					res.next(this.lstpractiseLocation);
				});
		})
	}
	searchTypeHeadEmployer(res)
	{
		this.employer_filter.searchKey=res;
		this.employer_filter.page=1;
		this.employer_filter.lastPage=2
		this.lstEmployer=[];
		return new Observable((res) => {
	
				let body = {
	
					page: this.employer_filter.page,
	
					name: this.employer_filter.searchKey,
					
					per_page: this.employer_filter.per_page,
	
				};
	
				this.caseFlowServie.searchEmployer(body).subscribe((data) => {
					let result = [...data['result']['data']];
	
					this.employer_filter.lastPage = data.result.last_page;
					this.lstEmployer=[];
					this.lstEmployer = [...this.lstEmployer, ...result];
					this.lstEmployer.forEach(x => {
						if(x.id){
							x['is_select']= "all";
						}
					})
					res.next(this.lstEmployer);
				});
	
			// }
	
		})
	}	
	searchTypeHeadCaseStatus(res)
	{	
		this.caseStatus_filter.searchKey=res;
		this.caseStatus_filter.page=1;
		this.caseStatus_filter.lastPage=2
		this.lstCaseStatus=[];
		return new Observable((res) => {
	
				let body = {
	
					page: this.caseStatus_filter.page,
	
					name: this.caseStatus_filter.searchKey,
					
					per_page: this.caseStatus_filter.per_page,
	
				};
	
				this.caseFlowServie.searchCaseStatusTypahead(body).subscribe((data) => {
					let result = [...data['result']['data']];
	
					this.caseStatus_filter.lastPage = data.result.last_page;
					this.lstCaseStatus=[];
					this.lstCaseStatus = [...this.lstCaseStatus, ...result];
					this.lstCaseStatus.forEach(x => {
						if(x.id){
							x['is_select']= "all";
						}
					})
					res.next(this.lstCaseStatus);
				});
	
			// }
	
		})
	}
	searchTypeHeadCaseTypes(res)
	{
		this.caseType_filter.searchKey=res;
		this.caseType_filter.page=1;
		this.caseType_filter.lastPage=2
		this.lstCaseTypes=[];
		return new Observable((res) => {
	
				let body = {
	
					page: this.caseType_filter.page,
	
					name: this.caseType_filter.searchKey,
					
					per_page: this.caseType_filter.per_page,
	
				};
	
				this.caseFlowServie.searchCaseTypes(body).subscribe((data) => {
					let result = [...data['result']['data']];
	
					this.caseType_filter.lastPage = data.result.last_page;
					this.lstCaseTypes=[];
					this.lstCaseTypes = [...this.lstCaseTypes, ...result];
					this.lstCaseTypes.forEach(x => {
						if(x.id){
							x['is_select']= "all";
						}
					})
					res.next(this.lstCaseTypes);
				});
		})
	}

	onFocusSearchPracticeLocation(name) {
		return new Observable((res) => {
			
		})

	}

	deleteSelected(id?: number) {
		let ids: any = [];
		if (id) {
			ids.push(id);
		} else {
			this.selection.selected.forEach(function (obj) {
				ids.push(obj.id);
			});
		}

		let requestData = {
			ids: ids
		};
		this.subscription.push(
			this.requestService
			  .sendRequest(
				CasesUrlsEnum.CaseDeleteURL,
				'delete_with_body',
				REQUEST_SERVERS.kios_api_path,
				requestData,
			  )
			  .subscribe(
				(res: any) => {
					if (res && res.status===true){
						this.setPage({});
						this.toastrService.success(res.message, 'Success');
						this.selection.clear();
					}else {
						this.errorMessageComponent.modelTitle = "Delete Case";
						this.errorMessageComponent.errorMessage= res.message;
						this.errorMessageComponent.rows = res.result.data;
						this.errorMessageComponent.openErrorMessage();
						this.selection.clear();

					}
				},
				(err) => {
				},
			  ),
		  );
		
	}



	ngOnDestroy() {
		// unSubAllPrevious(this.subscription);
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
	bulkCommentUpload(bulkComment){
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'overflow_unset',
		};
		this.bulkCommentModal =this.modalService.open(bulkComment, ngbModalOptions);
	}

	clearFile() {

		this.fileToUpload= null;
	}
	saveBulkComment() {
		this.loadSpinComment= true;
		let formData:FormData = new FormData();
		formData.append('file',this.fileToUpload);
		this.subscription.push(
			this.requestService
			  .sendRequest(
				CasesUrlsEnum.CaseBulkComment,
				'post',
				REQUEST_SERVERS.kios_api_path,
				formData,
			  )
			  .subscribe(
				(data: any) => {
					this.fileToUpload = null;
					this.loadSpinComment= false;
					this.toastrService.success(data.message, 'Success');
					this.bulkCommentModal.close();

				},
				(err) => {
					this.loadSpinComment= false;
					this.toastrService.error(err.message, 'Error');

				},
			  ),
		  );

	}

	handleFileInput(files:FileList){
			if (files.length > 0) {
				if (getExtentionOfFile(files.item(0).name) == '.xlsx') {
					this.fileToUpload = files.item(0);
				} else {
					this.toastrService.error('Please select excel file');
				}
			}
		
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
	patientHistoryStats(row) {
		console.log(row,'row in case list')
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
			this.localStorage.setObject('caseTableList' + this.storageData.getUserId(), data);
			this.selCols = data;
			let selCustCols: any[] = [];
			this.selCols.map(key => {
				this.alphabeticColumns.map(inner => {
					if(key?.header == inner?.name) {
						selCustCols.push({prop: inner?.prop});
					}
				})
			})
			this.selCols = selCustCols;
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
		this.caseListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.caseListTable._internalColumns.sort(function (a, b) {
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

	customizeColumnsForCSV() {
		this.columns.map(ele => {
			if(ele?.checked) {
				if(this.selCols.length) {
					let i = this.selCols.findIndex(key => key?.header == ele?.name);
					if(i != -1) {
						this.selCols[i] = {prop: ele?.prop};
					}
					else {
						this.selCols.push({prop: ele?.prop});
					}
				}
				else {
					this.selCols.push({prop: ele?.prop});
				}
			}
		})
	}
}
