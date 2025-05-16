import { NgSelectShareableComponent } from './../../shared/ng-select-shareable/ng-select-shareable.component';
import { ErrorMessageModalBillingComponent } from './shared-components/error-message-componnet/error-meesage-component';
import { Appointment } from '@appDir/medical-doctor/models/common/commonModels';
import { RequestService } from '@appDir/shared/services/request.service';
import { BillingEnum, visit_status_enum } from '@appDir/front-desk/billing/billing-enum';
import { VisitDocumentListingComponent } from './shared-components/visit-document-listing/visit-document-listing.component';
import { CustomDiallogService } from './../../shared/services/custom-dialog.service';
import { SelectionModel } from '@angular/cdk/collections';
import { Location } from '@angular/common';
import { Component, Input, OnInit, ViewChildren, QueryList, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

import { FileSystemDirectoryEntry, FileSystemFileEntry } from 'ngx-file-drop';
import { ToastrService } from 'ngx-toastr';
import { v4 as uuidv4 } from 'uuid';

import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { AclService } from '@appDir/shared/services/acl.service';
import {
	addBillingTitleWithProviderName,
	changeDateFormat,
	convertTimeAndDateToUSA,
	getIdsFromArray,
	getObjectChildValue,
	isArray,
	isEmptyObject,
	makeDeepCopyArray,
	makeDeepCopyObject,
	makeSingleNameFormFIrstMiddleAndLastNames,
	removeEmptyAndNullsArraysFormObject,
	removeEmptyAndNullsFormObject,
	removeEmptyKeysFromObject,
	unSubAllPrevious,
	WithoutTime
} from '@appDir/shared/utils/utils.helpers';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { MainService } from '@shared/services/main-service';

import { FileModel } from '../documents/Models/FilesModel.Model';
import { FolderModel } from '../documents/Models/FolderModel.Model';
import { DocumentManagerServiceService } from '../documents/services/document-manager-service.service';
import { FRONT_DESK_LINKS } from '../models/leftPanel/leftPanel';
import { Page } from '../models/page';
import { PermissionComponent } from '../permission.abstract.component';
import { CreateBillModel, FeeScheduleCalculatedData } from './billingVisitDeskModel';
import { BillingService } from './service/billing.service';
import { CreateBillModalComponent } from './shared-components/create-bill-modal/create-bill-modal.component';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { BillFilterModelQueryPassInApi } from './Models/bill-filter-model-query-pass-in-api';
import { BulkEditICD10CodesModalComponent } from './shared-components/bulk-edit-icd10-codes-modal/bulk-edit-icd10-codes-modal.component';
import { MappingFilterObject } from '@appDir/shared/filter/model/mapping-filter-object';
import { BillFilterModelQueryParamField } from './Models/bill-filter-model-query-param-field';
import { MatCheckbox } from '@angular/material/checkbox';
import { EnumApiPath, EnumSearch, SearchedKeys } from './Models/searchedKeys-modal';
import { map, Subject, take } from 'rxjs';
import { ShareAbleFilter } from '@appDir/shared/models/share-able-filter';
import { EorBillUrlsEnum } from '@appDir/eor/eor-bill.url.enum';
import { IMatAutoCompleteSpinnerShowIntellicense, MatAutoCompleteSpinnerShowIntellicenseModal } from '@appDir/shared/components/mat-autocomplete/modal/mat-autocomplete.modal';
import { DeleteReasonBillingComponentComponent } from './shared-components/delete-reason-billing-component/delete-reason-billing-component.component';
import { I, R } from '@angular/cdk/keycodes';
import { DoctorCalendarUrlsEnum } from '@appDir/shared/modules/doctor-calendar/doctor-calendar-urls-enum';
import { MriEnum } from './mri-enum';
import { VisitSessionEnum } from '@appDir/manual-specialities/models/VisitSession.model';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { AssignSpecialityUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
import { ReferringPhysicianUrlsEnum } from '../masters/practice/referring-physician/referring-physician/referringPhysicianUrlsEnum';
@Component({
	selector: 'app-billing',
	templateUrl: './billing.component.html',
	styleUrls: ['./billing.component.scss']
})
export class BillingComponent extends PermissionComponent implements OnInit, OnDestroy {
	datePickerId: string;
	lstBilling: Array<CreateBillModel> = [];
	lstSpecialities: any[] = [];
	public selection = new SelectionModel<CreateBillModel>(true, []);
	page: Page = new Page();
	icdPage: Page = new Page();
	cptPage: Page = new Page();
	searchValue = '';
	searchType;
	searchedKeys: SearchedKeys = new SearchedKeys();
	public isCollapsed = false;
	public specialityisCollapsed = true;
	public searchForm: FormGroup;
	public uploadForm: FormGroup;
	public form: FormGroup;
	changeSpecailityForm: FormGroup;
	// public emailForm: FormGroup;
	public editModalRef: NgbModalRef;
	submitted:boolean=false;
	public modalRef: NgbModalRef;
	public createModalRef: NgbModalRef;
	public bulkEditICD10ModeModalRef: NgbModalRef;
	readingProviderId:any
	// userEmail: string;
	lstpractiseLocation: any = [];
	isClicked: boolean = false;
	showAssertionCode: boolean = false;
	dialogMessage = 'This action will overwrite the selected CPT Code over the existing one.';
	selectMultipleCPTs = true;
	lstProvider: any[] = [];
	lstIcd: any[] = [];
	IcdDataNew: any[] = [];
	cptDataNew: any[] = [];
	lstInsurance: any[] = [];
	lstspecalities: any = [];
	lstVisitType: any[] = [];
	lstVistyTypeDiag: any[] = [];
	lstcpt: any[] = [];
	lstCaseType: any[] = [];
	lstStatus: any[] = [];
	VisitSessionStatus: any[] = [];
	lstReferringPhy: any[] = [];
	caseId: any;
	firm_location_name: any;
	firm_apartment_suite:any;
	firm_city: any;
	firm_state: any;
	firm_zip: any;
	files: any[] = [];
	folder: FolderModel;
	shareVisitDesk: any;
	caseIds: any[] = [];
	@Input() adminVisit: boolean = false;
	technicianAPIhit:boolean = false;
	billListingObj: any;
	routeCaseId: number;
	viewFile: boolean;
	loading = false;
	min: Date= new Date('1900/01/01');
	file_names: any[] = [];
	currentVistRow: any;
	currentVisitFile: any[] = [];
	lstBillable: any[] = [
		{
			id: 1, name: 'Yes'
		},
		{
			id: 0, name: 'No'
		}
	];
	lstReportUploadedStatus: any[] = [
		{
			id: 1, name: 'Yes'
		},
		{
			id: 0, name: 'No'
		}
	];
	lstCd: any[] = [
		{
			id: 1, name: 'Yes'
		},
		{
			id: 0, name: 'No'
		}
	]
	public allowed_case_type_slugs: string[] = ['auto_insurance'];
	selected_case_type_slug = 'auto_insurance';
	labelName = {
		practiceLocation: false,
		caseId: false,
		providerName: false,
		specialty: false,
		visitType: false,
		status: false,
		caseType: false,
		billable: false
	};
	selectedMultipleFieldFiter: any = {
		appointment_type_ids: [],
		facility_location_ids: [],
		visit_status_ids: [],
		speciality_ids: [],
		case_ids: [],
		provider_ids: [],
		firm_ids:[],
		insurance_ids:[],
		employer_ids:[],
		created_by_ids:[],
		updated_by_ids:[],
		technician_id:[]
	};
	btnDisable = false;
	disableView = false;
	disableUpload = false;
	@ViewChildren(MatCheckbox) ubilledVisitCheckBox: QueryList<MatCheckbox>;
	scrollDistance = 1;
	scrollUpDistance = 1;
	throttle = 300;
	infiniteScrollDisabled: boolean = false;
	EnumApiPath = EnumApiPath;
	requestServerpath = REQUEST_SERVERS;
	BillingApiPath = BillingEnum;
	eventsSubject: Subject<any> = new Subject<any>();
	eventsSubjectTechnician: Subject<any> = new Subject<any>();
	getTechnicianListing=AssignSpecialityUrlsEnum.get_supervisor_technicians;
	visitEditDocumentListingComponent: VisitDocumentListingComponent;
	showSpinnerIntellicense: IMatAutoCompleteSpinnerShowIntellicense = new MatAutoCompleteSpinnerShowIntellicenseModal();
	@ViewChild('visitEditDocumentListingComponent') set content(content: VisitDocumentListingComponent) {
		if (content) { // initially setter gets called with undefined
			this.visitEditDocumentListingComponent = content;
		}
	}
	visitFileValue: boolean = false;
	calledspeciality: any[] = [];
	calledspecialityIndex = null;
	DATEFORMAT = EorBillUrlsEnum.DATE_FORMAT;
	currentDate: Date;
	cptCodePlaceHolder = 'CPT Codes*';
	icdCodePlaceHolder = 'ICD-10 Codes*'
	billTotalRows: number = 0;
	@ViewChild('errorMessageBilling') errorMessageComponent: ErrorMessageModalBillingComponent;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('billingList') billingListTable: DatatableComponent;
	customizedColumnComp: CustomizeColumnComponent;
	@ViewChild(CustomizeColumnComponent) set con(con: CustomizeColumnComponent) {
		if (con) { // initially setter gets called with undefined
		  this.customizedColumnComp = con;
		}
	}
	@ViewChild('statusNgSelect') statusDropdown: NgSelectShareableComponent;
	changeSpecalityModal: any;
	changeSpecalityModelInfo: any;
	diagnosticProviders;
	diagnosticTechnicians;
	first_name;
	last_name;
	middle_name;
	eventsSubjectPhysicians: Subject<any> = new Subject<any>();
	ReferringPhysician_LocationListing = ReferringPhysicianUrlsEnum.GET_PHYSICIANS_LIST;
	eventsSubjectReadingProvider: Subject<any> = new Subject<any>();
	showSelectFieldList: any = {
		'reading_provider': [],
		'physician_id': []
	};
	DoctorCalendarUrlsEnum = DoctorCalendarUrlsEnum;
	OrderEnum = OrderEnum;
	enableReadingProvider: boolean = false;
	modalCols :any[] = [];
	columns: any[] = [];
	alphabeticColumns:any[] =[];
	colSelected: boolean = true;
	isAllFalse: boolean = false;
	billingListData: any;
	physician:any;
	lstPhysician:any[]=[];
	public hitAPIonEdit = false;
	selCols: any[] = [];
	practiceLocationFilter: any;

	constructor(
		private mainService: MainService,
		public modalService: NgbModal,
		private fb: FormBuilder,
		private location: Location,
		titleService: Title,
		private route: ActivatedRoute,
		router: Router,
		public aclService: AclService,
		public billingService: BillingService,
		private toastrService: ToastrService,
		private storageData: StorageData,
		private documentManagerService: DocumentManagerServiceService,
		public datePipeService: DatePipeFormatService,
		private customDiallogService: CustomDiallogService,
		public requestService: RequestService,
		private toaster: ToastrService,
		private localStorage: LocalStorage
	) {
		super(aclService, router, route, requestService, titleService);
		titleService.setTitle(this.route.snapshot.data['title']);
		this.route.snapshot.pathFromRoot.forEach((path) => {
			!this.caseId ? (this.caseId = getObjectChildValue(path, null, ['params', 'caseId'])) : null;
		});
		this.routeCaseId = Number(this.router.url.split('/')[4]);
		this.routeCaseId = this.routeCaseId ? this.routeCaseId : null;
		this.currentDate = new Date();
		this.changeSpecailityForm = this.fb.group({
			appointment_type_id: [''],
			speciality_id: [''],

		});

	}

	ngOnInit() {
		// this.router.navigate([], {
		// 	relativeTo: this.route,
		// 	queryParams:this.adminVisit? {
		// 		visit_status_ids: [1,2]}:{},
		// 	queryParamsHandling: 'merge',
		// 	skipLocationChange: true
		//   });
		this.initializeSearchForm();
		this.page.pageNumber = 1;
		this.page.size = 10;
		this.mainService.setLeftPanel(FRONT_DESK_LINKS);
		if(this.adminVisit) {
			this.billingListData = this.localStorage.getObject('billingTableList' + this.storageData.getUserId());
		}
		else {
			this.billingListData = this.localStorage.getObject('visitsTableList' + this.storageData.getUserId());
		}
	}


	ngAfterViewInit(): void {
		//Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
		//Add 'implements AfterViewInit' to the class.
		this.getSpecialitiesWithCount();
		this.getSpeciality();
		this.getVisitType();
		this.getSpeciality();
		if (this.adminVisit) {
			this.getCaeType();
		}
		this.getStatusList();
		// this.initializeEmailForm()
		this.initializeVisitDeskForm();
		this.initializeUploadDocument();
		// this.getBilling(this.createQueryParam())
		this.subscription.push(
			this.route.queryParams.subscribe((params: any) => {
				const formFiledListOfValue = new BillFilterModelQueryParamField(params);
				const formFiledValue = new BillFilterModelQueryPassInApi(params);
				if (!this.adminVisit) {
					params.speciality_ids && params.speciality_ids.length != 0 ? this.calledspeciality = params.speciality_ids.map(r => Number(r)) : this.calledspeciality = null;

				}
				else {
					formFiledListOfValue['visit_status_ids'] = [1, 2];
				}
				this.valueAssignInListOfFieldArray(formFiledListOfValue);
				//	this.searchForm.patchValue({formFiledListOfValue});
				this.searchForm.controls['visit_status_ids'].setValue(formFiledListOfValue && formFiledListOfValue.visit_status_ids ? formFiledListOfValue.visit_status_ids : []);
				this.page.pageNumber = parseInt(params.page) || 1;
				this.page.size = parseInt(params.per_page) || 10;
				params = {
					...params,
					visit_status_ids: formFiledListOfValue['visit_status_ids']
				};
				// if(!this.adminVisit){
                 this.getBillingListing(this.createQueryParam({
					case_ids: this.routeCaseId, ...params,

				}));
				// }
				
			}),
		);
		this.datePickerId = uuidv4();
		this.setInitialPageNumberAll();

		if (this.billingListTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.billingListTable._internalColumns]);
			this.columns.forEach(element => {
				if(this.billingListData.length) {
					let obj = this.billingListData.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.billingListData.length) {
				const nameToIndexMap = {};
				this.billingListData.forEach((item, index) => {
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
			this.selCols = this.billingListData?.length ? this.billingListData : [];
			this.customizeColumnsForCSV();
			this.onConfirm(false);
		}
	}


	ngOnChanges(): void {
		//Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
		//Add '${implements OnChanges}' to the class.
		setTimeout(() => {
			this.visitEditDocumentListingComponent ?
				this.currentVisitFile = this.visitEditDocumentListingComponent.files : [];
		});
	}
	initializeUploadDocument(): FormGroup {
		this.uploadForm = this.fb.group({
			fileTitle: [''],
			tags: [''],
			parentId: [''],
		});
		return this.uploadForm;
	}
	createQueryParam(obj?): ParamQuery {
		let data = removeEmptyAndNullsFormObject(obj);
		return {
			...data,
			...{
				filter: false,
				order: this.page.order ? this.page.order : OrderEnum.ASC,
				page: this.page.pageNumber,
				pagination: true,
				per_page: this.page.size || 10,
				column: this.page.column,
			}
		};
	}
	getSpecialitiesWithCount() {
		if (this.adminVisit) {
			return;
		}

		this.billingService.getSpecialitiesWithCount(this.caseId).subscribe(
			(data) => {
				console.log(data);
				this.lstSpecialities = data['result']['data'];
				this.lstSpecialities.filter((item, index) => {
					if (!this.adminVisit && this.calledspeciality.findIndex((e) => e === item.id) != -1) {
						item['checked'] = true;
						this.calledspecialityIndex = index;
					}
					else {
						item['checked'] = false;
					}

				});
			},
			(err) => {
				this.startLoader = false;
			},
		);
	}
	resetChecked() {
		this.lstSpecialities.map((speciality) => (speciality['checked'] = false));
	}
	visitIsClicked(data) {
		this.lstSpecialities.filter((item) => {
			item.id != data.id ? (item['checked'] = false) : '';
		});
		data['checked'] = !data['checked'];
	}
	getBillingListing(obj, oldapi?) {
		this.adminVisit;
		this.selection.clear();
		if (this.searchForm.valid) {
			let per_page = this.page.size;
			let queryParams = { ...obj, per_page, page: this.page.pageNumber };
			if (!this.adminVisit) {
				queryParams['case_ids'] = this.caseId;
				obj.case_ids = this.caseId;
				if (this.calledspeciality && this.calledspeciality.length != 0) {
					obj['speciality_ids'] = this.calledspeciality;
					queryParams['speciality_ids'] = this.calledspeciality;
				}
			}
			this.addUrlQueryParams(queryParams);
		}
		this.startLoader = true;
		this.billListingObj = obj;
		const paramDataFilter = new BillFilterModelQueryPassInApi(obj);
		if (paramDataFilter['billable']) {
			paramDataFilter['billable'] = paramDataFilter['billable'] === 'Yes' ? 1 : 0;
		}
		if (paramDataFilter['report_upload_status']) {
			paramDataFilter['report_upload_status'] = paramDataFilter['report_upload_status'] == 'Yes' ? 1 : 0;
		}
		this.billingService
      .getBillingRecord(
        removeEmptyAndNullsArraysFormObject(paramDataFilter),
        oldapi
      )
      .subscribe(
        (data) => {
          this.startLoader = false;
          this.selection.clear();
          this.page.totalElements = data['result']['total'];
          this.lstBilling = data['result']['data'];
		  if(this.lstBilling.length>0){
			for (let index in this.lstBilling) {
				this.lstBilling[index]['visit_date'] = convertTimeAndDateToUSA(this.lstBilling[index]['visit_date'])
			  }
		  }
        },
        (err) => {
          this.startLoader = false;
        }
      );
	}
	addUrlQueryParams(params?) {
		this.location.replaceState(this.router.createUrlTree([], { queryParams: params }).toString());
	}
	/**
	 * Initializes search form
	 * @returns search form
	 */
	initializeSearchForm(): FormGroup {
		this.searchForm = this.fb.group({
			insurance_id: [null],
			claim_no: [null],
			no_of_days: [null],
			no_of_days_from: [null],
			no_of_days_to: [null],
			case_type_ids: [null],
			icd_code_ids: [null],
			doa: [null],
			visit_date: [null],
			appointment_type_ids: [null],
			facility_location_ids: [null],
			visit_status_ids: [],
			speciality_ids: [null],
			provider_ids: [null],
			created_by_ids: [null],
			updated_by_ids: [null],
			case_ids: [null],
			firm_ids:[null],
			insurance_ids: [null],
			appointment_type_id: [null],
			speciality_id: [null],
			billable: [null],
			report_upload_status: [null],
			employer_ids: [null],
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
			visit_date_range1: [
				null,
				[
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
				],
			],
			visit_date_range2: [
				null,
				[
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
				],
			]
		});

		// if(this.adminVisit){
		// 	this.searchForm.get('facility_location_ids').setValidators(Validators.required);
		// 	this.searchForm.get('facility_location_ids').updateValueAndValidity();
		// }
		return this.searchForm;
	}

	onPageChange(event) {
		this.page.pageNumber = event.offset + 1;
		this.setCaseIdOnThroughCaseFlow();
		this.getBillingListing(this.createQueryParam(this.searchForm.value));
	}
	pageSizeChange(event) {
		this.startLoader = true;
		this.page.size = event.target.value;
		this.page.pageNumber = 1;
		this.setCaseIdOnThroughCaseFlow();
		this.getBillingListing(this.createQueryParam(this.searchForm.value));
	}
	resetFilter() {
		this.practiceLocationFilter = null;
		this.page.pageNumber = 1;
		// this.page.size = 10;
		this.addUrlQueryParams();
		this.searchForm.reset();
		if (!this.adminVisit) {
			this.calledspeciality = null;
			this.lstSpecialities = this.lstSpecialities.map((e) => e = { ...e, checked: false });
			this.calledspecialityIndex = null;
		}
		this.eventsSubject.next(true);
		this.setCaseIdOnThroughCaseFlow();
		

		// if(!this.adminVisit){
		this.getBillingListing(this.createQueryParam(this.searchForm.value));
		// }else{
		// 	this.submitted=false;
		// 	let formFieldListOfValue = {
		// 		'visit_status_ids': [1, 2]
		// 	  };
		// 	  this.page.totalElements=0;
		// 	this.searchForm.controls['visit_status_ids'].setValue(formFieldListOfValue && formFieldListOfValue.visit_status_ids ? formFieldListOfValue.visit_status_ids : []);
		// 	this.lstBilling=[];
		// }
	}

	specialitySearch(item, index) {
		this.caseId;
		// this.calledspeciality == item.id
		// 	? (this.calledspeciality = null,this.calledspecialityIndex=null)
		// 	: (this.calledspeciality = item.id,this.calledspecialityIndex=index);
		this.page.pageNumber = 1;
		let obj = this.createQueryParam(this.searchForm.value);
		// this.calledspeciality ? (obj['speciality_ids'] = [item.id]) : delete obj['speciality_ids'];

		this.lstSpecialities.map((specialityLst) => {
			// item.id != data.id ? (item['checked'] = false) : '';
			if (specialityLst.id === item.id) {
				specialityLst['checked'] = !specialityLst['checked']
			}
		});
		// data['checked'] = !data['checked'];
		this.calledspeciality = this.lstSpecialities.filter(lstSpec => lstSpec.checked).map(e => e.id);
		obj['speciality_ids'] = this.calledspeciality.length != 0 ? this.calledspeciality : null;
		obj['case_ids'] = this.caseId;
		this.getBillingListing(obj);
	}

	generteFormFilter() {
		let formData = this.searchForm.value;
		this.selection.clear();
		// state start//
		formData['speciality_ids'] = formData['speciality_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.speciality_ids) : formData['speciality_ids'];
		formData['provider_ids'] = formData['provider_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.provider_ids) : formData['provider_ids'];
		formData['created_by_ids'] = formData['created_by_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.created_by_ids) : formData['created_by_ids'];
		formData['updated_by_ids'] = formData['updated_by_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.updated_by_ids) : formData['updated_by_ids'];
		formData['facility_location_ids'] = formData['facility_location_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.facility_location_ids) : formData['facility_location_ids'];
		formData['firm_ids'] = formData['firm_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.firm_ids): formData['firm_ids'];
		formData['insurance_ids'] = formData['insurance_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.insurance_ids): formData['insurance_ids'];
		// state end/// 
		formData['visit_date'] = formData['visit_date'] ?  changeDateFormat(formData['visit_date']) : null;
		formData['visit_date_range1'] = formData['visit_date_range1'] ?  changeDateFormat(formData['visit_date_range1']) : null;
		formData['visit_date_range2'] = formData['visit_date_range2'] ?  changeDateFormat(formData['visit_date_range2']) : null;
		formData['created_at'] = formData['created_at'] ?  changeDateFormat(formData['created_at']) : null;
		formData['updated_at'] = formData['updated_at'] ?  changeDateFormat(formData['updated_at']) : null;
		formData['doa'] = formData['doa'] ?  changeDateFormat(formData['doa']) : null;
		if (!this.adminVisit) {
			formData['case_ids'] = this.caseId;
			// this.calledspeciality && !formData['speciality_ids']? formData['speciality_ids']=this.calledspeciality:''
		}

		return formData;

	}
	submitFilter(oldapi?) {
		let formData = this.generteFormFilter();
		this.practiceLocationFilter = formData?.facility_location_ids;
		this.page.pageNumber = 1;
		let params = {
			...formData,
			per_page: this.page.size || 10,
			pagination: 1,
			page: this.page.pageNumber,
		};
		// if(this.adminVisit){
		// 	this.submitted = true;
		// }
		// if(this.searchForm.valid){
			this.getBillingListing(removeEmptyAndNullsFormObject(params), oldapi);
		
		// }
			
		
	}
	getBilling(obj) {
		return this.billingService.getBilling(obj)
			.pipe(
				map((data) => {
					this.page.totalElements = data['result']['total'];
					return data['result']['data'];
				}));
	}

	// lstCaseDetail = []
	// getDetail(billing) {
	//   ;
	//   return this.billingService.getDetail(billing.caseId).subscribe(data => {
	//     this.lstCaseDetail.push(data)
	//     console.log(this.lstCaseDetail)
	//     this.createObjectfromResponse(data, billing)
	//   })
	// }
	// createObjectfromResponse(object, billing) {
	//   ;
	//   var dat = object.providers.find(provider => {
	//     return provider.id == billing.doctorId
	//   })

	//   billing['providers'] = object.providers
	//   billing['insurance'] = object['patientInsuranceCompanies'].find(insurance => {
	//     return insurance.type.toLowerCase() == 'primary'
	//   })
	// }
	title: string;
	/**
	 * Opens modal
	 * @param modal
	 * @param [row]
	 */
	openModal(modal?, row?: any) {
		this.currentVistRow = row;
		this.editRecord = row;
		// this.selection.clear();
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			size: 'lg',
			keyboard: false,
			windowClass: 'modal_extraDOc body-scroll modal-width',
		};
		this.editModalRef = this.modalService.open(modal, ngbModalOptions);
		// if (row == undefined || row == null) {
		//   this.title = 'create'
		//   this.initializeVisitDeskForm();
		// } else {
		this.caseId = row.case_id;
		this.shareVisitDesk = row;
		this.visitFileValue = true;
		this.currentVisitFile = [];
		this.getBillVisitDetail({ visit_ids: [row.visit_session_id] }, false);
		this.showDocumentTable(null, row, false);
		this.hitAPIonEdit = true;
	}
	initializeVisitDeskForm() {
		this.form = this.fb.group({
			id: [null],
			doctor_id: [''],
			icd_codes: ['', [Validators.required]],
			cpt_codes: ['', [Validators.required]],
			speciality_id: [''],
			// visit_date: ['',],
			appointment_type_id: [''],
			practices: [''],
			case_types: [''],
			insurance: [''],
			claim_no: [''],
			no_of_days: [''],
			visit_session_state_id: ['', [Validators.required]],
			visit_date_format: [''],
			billable: [null, [Validators.required]],
			provider_id: [''],
			technician_id: [''],
			cd: [null],
			reading_provider: [''],
			physician_id: [''],
			assertion_code: ['', [Validators.required]]
		});
	}

	codeTooltip(value) {
		return value.map((item) => item.name).join(',');
	}

	getCurrentRecords($event) {
		this.visitFileValue = false;
		this.currentVisitFile = [...$event];
	}
	checkFileValidation() {
		if (!this.disableUpload) {
			return this.form && (this.form.value.visit_session_state_id === visit_status_enum.bill_created || this.form.value.visit_session_state_id === '3' || this.form.value.visit_session_state_id === visit_status_enum.finalized || this.form.value.visit_session_state_id === '2') ? (this.currentVisitFile && this.currentVisitFile.length == 0 ? true : false) : false;
		}
	}

	editRecord: any;
	patchEditValues(row?) {
		this.initializeVisitDeskForm();
		this.editRecord = row;
		this.showDocumentTable(null, row, false);
		// let prov = row.doctor && row.doctor.basic_info && row.doctor.basic_info
		this.lstProvider = [
			{
				id: row.doctor_id,
				name: this.makeSingleNameFormFIrstMiddleAndLastNames(
					[row.doctor.first_name, row.doctor.middle_name, row.doctor.last_name],
					' ',
				) + addBillingTitleWithProviderName(row.billing_title),

			},
		];
		this.lstInsurance =
			row['kiosk_case'].primary_insurance && row['kiosk_case'].primary_insurance.insurance
				? [row['kiosk_case'].primary_insurance.insurance].map((res) => {
					return { id: res.id, name: res.insurance_name };
				})
				: null;
		this.lstpractiseLocation =
			row.facility_location && row.facility_location.facility && row.facility_location.facility.name
				? [row.facility_location].map((item) => {
					return { name: item.facility_full_name, id: item.facility.id };
				})
				: null;
		this.lstIcd =
			row.icd_codes && row.icd_codes.length
				? row.icd_codes.map((m) => {
					return {
						id: m.id,
						name: this.makeSingleNameFormFIrstMiddleAndLastNames([m.name, m.description], '-'),
					};
				})
				: [];
		this.lstcpt =
			row.cpt_codes && row.cpt_codes.length
				? row.cpt_codes.map((m) => {
					return {
						id: m.id,
						name: this.makeSingleNameFormFIrstMiddleAndLastNames([m.name, m.description], '-'),
					};
				})
				: [];
		this.form.patchValue({
			id: row.id,
			doctor_id: row.doctor_id,
			assertion_code: row.assertion_code,
			icd_codes:
				row.icd_codes && row.icd_codes.length > 0
					? row.icd_codes.map((m) => {
						// return m.id}):[],
						{
							return { id: m.id, is_editable: m.pivot.is_editable };
						}
					})
					: [],
			cpt_codes:
				row.cpt_codes.length > 0
					? row.cpt_codes.map((m) => {
						// return m.id}):[],
						return { id: m.id, is_editable: m.pivot.is_editable };
					})
					: [],
			speciality_id: row.speciality_id,
			visit_date_format: row.visit_date_format,
			appointment_type_id: row.appointment_type_id,
			practices:
				this.lstpractiseLocation && this.lstpractiseLocation[0] && this.lstpractiseLocation[0]['id']
					? this.lstpractiseLocation[0]['id']
					: null,
			case_types: row['kiosk_case'] ? row['kiosk_case'].case_types.name : '',
			insurance:
				this.lstInsurance && this.lstInsurance[0] && this.lstInsurance[0]['id']
					? this.lstInsurance[0]['id']
					: null,
			claim_no:
				row['kiosk_case'] && row['kiosk_case'].primary_insurance
					? row['kiosk_case'].primary_insurance.claim_no
					: '',
			no_of_days: row.no_of_days,
			visit_session_state_id:
				row.visit_session_state && row.visit_session_state.id ? row.visit_session_state.id : null,
			billable: row.billable === 0 ? 0 : 1,
			report_upload_status: row.report_upload_status === 0 ? 0 : 1,
		});
		console.log(this.form.value);
		this.title = 'update';
		this.form.disable();
		this.form.get('billable').enable();
		this.form.get('assertion_code').enable();
		this.form.get('icd_codes').enable();
		this.form.get('cpt_codes').enable();
		this.form.get('provider_id').enable();
		this.form.get('technician_id').enable();
		this.form.get('reading_provider').enable();
		this.form.get('physician_id').enable();
		this.form.get('cd').enable();
		this.form.get('visit_session_state_id').enable();
		this.form.controls['icd_codes'].markAsTouched();
		this.form.controls['icd_codes'].markAsDirty();
		this.form.get('id').enable();
		if (this.form.controls['visit_session_state_id'].value == visit_status_enum.un_finalized) {
			this.form.controls['cpt_codes'].clearValidators();
			this.form.controls['cpt_codes'].updateValueAndValidity();
			this.cptCodePlaceHolder = 'CPT Codes';
			this.form.controls['icd_codes'].clearValidators();
			this.form.controls['icd_codes'].updateValueAndValidity();
			this.icdCodePlaceHolder = 'ICD-10 Codes';
		} else {
			this.form.controls['cpt_codes'].setValidators([Validators.required]);
			this.form.controls['cpt_codes'].updateValueAndValidity();
			this.cptCodePlaceHolder = 'CPT Codes*';
			this.form.controls['cpt_codes'].markAsTouched();
			this.form.controls['cpt_codes'].markAsDirty();
			this.form.controls['icd_codes'].setValidators([Validators.required]);
			this.form.controls['icd_codes'].updateValueAndValidity();
			this.icdCodePlaceHolder = 'ICD-10 Codes*';
			this.form.controls['icd_codes'].markAsTouched();
			this.form.controls['icd_codes'].markAsDirty();
		}
		this.selectMultipleCPTs = this.editRecord['specialityVisitType'] && this.editRecord['specialityVisitType']['allow_multiple_cpt_codes'] ? this.editRecord['specialityVisitType']['allow_multiple_cpt_codes'] == 1 ? true : false : false;
		let visitTypeSlug = this.editRecord['specialityVisitType'] && this.editRecord['specialityVisitType']['appointment_type'] && this.editRecord['specialityVisitType']['appointment_type'].length && this.editRecord['specialityVisitType']['appointment_type'][0] && this.editRecord['specialityVisitType']['appointment_type'][0]['slug'];
		let visitStatus = this.editRecord && this.editRecord['visit_session_state'] && this.editRecord['visit_session_state'] && this.editRecord['visit_session_state']['slug'];
		if ((visitTypeSlug === MriEnum.XRAY || visitTypeSlug === MriEnum.MRI || visitTypeSlug === MriEnum.CTScan) && (this.editRecord.speciality && this.editRecord.speciality['speciality_key'] == MriEnum.speciality_key)) {
			this.showAssertionCode = true;
		} else {
			this.showAssertionCode = false;
			this.form.removeControl("assertion_code")
		}
		if (visitStatus !== VisitSessionEnum.Visit_Status) {
			this.VisitSessionStatus = [...this.lstStatus.filter(visit => visit['slug'] != VisitSessionEnum.Visit_Status)];

		} else {
			this.VisitSessionStatus = [...this.lstStatus.filter(visit => visit['slug'] == VisitSessionEnum.Visit_Status)];
		}
	}
	closeEditModal() {
		this.files = [];
		this.editModalRef.close();
		this.selection.clear();
		this.form.reset();
		this.file_names = [];
		this.enableReadingProvider = false;
		this.disableView=false;
	}
	closeModal(file_name: string[]) {
		// if (file_name && file_name.length) {
		// 	file_name.forEach((name) => {
		// 		if (typeof name == 'string') {
		// 			this.file_names.push(name);
		// 		}
		// 	});
		// }
		this.showDocumentTable(null, this.shareVisitDesk, false);

		this.files = [];
		this.selection.clear();
		this.modalRef.close();
	}

	setStartLoader(event) {
		this.startLoader = event;
		this.visitFileValue = true;
	}
	/**
	 * intelicence for fields
	 * @param event
	 * @param type
	 */
	setInitialPageNumberAll() {
		this.setInitialPageNumberIcdPage();
		this.setInitialPageNumberCptPage();
	}
	setInitialPageNumberIcdPage() {
		this.icdPage.pageNumber = 1;
	}
	setInitialPageNumberCptPage() {
		this.cptPage.pageNumber = 1;
	}
	/**
	* comingFrom decide search function call with pagination or only text search
	* @param comingFrom
	*/
	onScroll(comingFrom, searchType) {
		if (comingFrom == 'scrollDown' && this.searchValue) {
			if (searchType == 'icd') {
				this.icdPage.pageNumber = this.icdPage.pageNumber + 1;
			} else if (searchType == 'cpt') {
				this.cptPage.pageNumber = this.cptPage.pageNumber + 1;
			}
		} else {
			if (searchType == 'icd') {
				this.setInitialPageNumberIcdPage();
			} else if (searchType == 'cpt') {
				this.setInitialPageNumberCptPage();
			}
		}
		this.search(this.searchValue, searchType);
	}

	searchWithIcd(value, type: string, searchType?) {
		this.searchValue = value;
		this.searchType = type;
		var value = value;
		this.showSpinnerIntellicense.icd_10 = true;
		if (searchType == 'search') {
			this.setInitialPageNumberIcdPage();
		}
		return this.subscription.push(this.billingService
			.getCodes(value, null, this.icdPage.pageNumber)
			.pipe(
				map((val) => {
					return val['result']['data'];
				}))
			.subscribe((data) => {
				if (searchType == 'search') {
					this.lstIcd = [];
					this.setInitialPageNumberIcdPage();
				}
				this.IcdDataNew = [...data];
				this.IcdDataNew =
					this.IcdDataNew && this.IcdDataNew.length
						? this.IcdDataNew.map((m) => {
							return {
								id: m.id,
								name: this.makeSingleNameFormFIrstMiddleAndLastNames(
									[m.name, m.description],
									'-',
								),
							};
						})
						: [];
				this.showSpinnerIntellicense.icd_10 = false;
				if (this.IcdDataNew.length) {
					this.lstIcd.push(...this.IcdDataNew);
				}
			}));
	}

	searchWithCpt(value, type: string, searchType?) {
		this.showSpinnerIntellicense.cpt_codes = true;
		this.searchValue = value;
		this.searchType = type;
		if (searchType == 'search') {
			this.setInitialPageNumberCptPage();
		}
		return this.subscription.push(this.billingService
			.getCPTCodes(value, null, this.cptPage.pageNumber)
			.pipe(
				map((val) => {
					return val['result']['data'];
				}))
			.subscribe((data) => {
				if (searchType == 'search') {
					this.lstcpt = [];
					this.setInitialPageNumberCptPage();
				}
				this.cptDataNew = [...data];
				this.cptDataNew =
					this.cptDataNew && this.cptDataNew.length
						? this.cptDataNew.map((m) => {
							return {
								id: m.id,
								name: this.makeSingleNameFormFIrstMiddleAndLastNames(
									[m.name, m.description],
									'-',
								),
							};
						})
						: [];
				this.showSpinnerIntellicense.cpt_codes = false;
				if (this.cptDataNew.length > 0) {
					this.lstcpt.push(...this.cptDataNew);
				}

			}));
	}

	search(value, type: string, searchType?) {
		this.searchValue = value;
		this.searchType = type;
		var value = value;
		type = type.toLowerCase();
		switch (type) {
			case 'icd':
				this.showSpinnerIntellicense.icd_10 = true;
				if (searchType == 'search') {
					this.setInitialPageNumberIcdPage();
				}
				return this.subscription.push(this.billingService
					.getCodes(value, null, this.icdPage.pageNumber)
					.pipe(
						map((val) => {
							return val['result']['data'];
						}))
					.subscribe((data) => {
						if (searchType == 'search') {
							this.lstIcd = [];
							this.setInitialPageNumberIcdPage();
						}
						this.IcdDataNew = [...data];
						this.IcdDataNew =
							this.IcdDataNew && this.IcdDataNew.length
								? this.IcdDataNew.map((m) => {
									return {
										id: m.id,
										name: this.makeSingleNameFormFIrstMiddleAndLastNames(
											[m.name, m.description],
											'-',
										),
									};
								})
								: [];
						this.showSpinnerIntellicense.icd_10 = false;
						if (this.IcdDataNew.length) {
							this.lstIcd.push(...this.IcdDataNew);
						}
					}));
			case 'insurance':
				return this.subscription.push(this.billingService
					.searchInsurance(value)
					.pipe(
						map((val) => {
							return val['result']['data'];
						}))
					.subscribe((data) => {
						this.lstInsurance = [...data];
					}));
			case 'provider':
				return this.subscription.push(this.billingService
					.searchProvider(value)
					.pipe(
						map((val) => {
							return val['result']['data'];
						}))
					.subscribe((data) => {
						this.lstProvider = data;
						this.lstProvider = this.lstProvider.map((res) => {
							return {
								id: res.id,
								name: res.first_name + ' ' + res.middle_name + ' ' + res.last_name,
							};
						});
					}));
			case 'cpt':
				this.showSpinnerIntellicense.cpt_codes = true;
				if (searchType == 'search') {
					this.setInitialPageNumberCptPage();
				}
				return this.subscription.push(this.billingService
					.getCPTCodes(value, null, this.cptPage.pageNumber)
					.pipe(
						map((val) => {
							return val['result']['data'];
						}))
					.subscribe((data) => {
						if (searchType == 'search') {
							this.lstcpt = [];
							this.setInitialPageNumberCptPage();
						}
						this.cptDataNew = [...data];
						this.cptDataNew =
							this.cptDataNew && this.cptDataNew.length
								? this.cptDataNew.map((m) => {
									return {
										id: m.id,
										name: this.makeSingleNameFormFIrstMiddleAndLastNames(
											[m.name, m.description],
											'-',
										),
									};
								})
								: [];
						this.showSpinnerIntellicense.cpt_codes = false;
						if (this.cptDataNew.length > 0) {
							this.lstcpt.push(...this.cptDataNew);
						}

					}));
		}
	}
	onCodeChange(value, id) {
		if (id === 'icd') {
			this.form.patchValue({
				icd_codes: value.map((obj) => {
					return { id: obj.id, is_editable: true };
					// return obj.id;
				}),
			});
			this.form.controls['icd_codes'].markAsTouched();
			this.form.controls['icd_codes'].markAsDirty();
		}
		if (id === 'cpt') {
			this.form.patchValue({
				cpt_codes: value.map((obj) => {
					return { id: obj.id, is_editable: true };
				}),
			});
			this.form.controls['cpt_codes'].markAsTouched();
			this.form.controls['cpt_codes'].markAsDirty();
		}
	}

	searchProvider(event, page, paginationType = 'search') {
		var value = event;
		this.searchedKeys.providerName.searchKey = value;
		this.searchedKeys.providerName.page = page;
		let body = {
			page: page || 1,
		};
		this.billingService.searchProvider(value, undefined, body).subscribe((data) => {
			this.lstProvider = data['result']['data'];
			this.lstProvider = this.lstProvider.map((res) => {
				let name = this.makeSingleNameFormFIrstMiddleAndLastNames(
					[res.first_name, res.middle_name, res.last_name],
					' ',
				);
				return {
					id: res.id,
					name: name,
				};
			});
			this.lstProvider = [...this.lstProvider];
		});
	}
	makeSingleNameFormFIrstMiddleAndLastNames(arrayName, key) {
		let arr = arrayName;
		arr = arr.filter(function (e) {
			return e;
		}); // The filtering function returns `true` if e is not empty.
		return arr.join(key);
	}
	searchPractice(event = '', page = 1, paginationType = 'search') {
		let val = event;
		this.searchedKeys.practiceLocation.searchKey = val;
		this.searchedKeys.practiceLocation.page = page;
		let body = {
			page: page || 1,
		};
		if (val.length == this.searchedKeys.minChar || paginationType == EnumSearch.InitSearch || paginationType == EnumSearch.ScrollSearch) {
			this.billingService.searchPractice(val, undefined, body).subscribe((data) => {
				if (paginationType == 'search') {
					this.lstpractiseLocation = [];
					this.searchedKeys.practiceLocation.lastPage = this.searchedKeys.last_page;
				}
				let result = [...data['result']['data']];
				this.searchedKeys.practiceLocation.lastPage = data.result.last_page;
				this.lstpractiseLocation = [...this.lstpractiseLocation, ...result];
			});
		}
	}

	toLowerCase(value: string) {

		return value.toLocaleLowerCase();
	}
	getVisitType() {
		this.billingService
			.getvisitType()
			.pipe(
				map((val) => {
					return val['result']['data'];
				}))
			.subscribe((data) => {
				this.lstVisitType = [...data];
				this.lstVistyTypeDiag = this.lstVisitType.filter(value => this.toLowerCase(value.name) === 'emg' || this.toLowerCase(value.name) === "rom");
			});
	}
	getSpeciality(event = '', page = 1, paginationType = 'search') {
		const value: String = event;
		this.searchedKeys.specialityName.searchKey = value;
		this.searchedKeys.specialityName.page = page;

		let body = {
			page: page || 1,
		};
		let SpeicalityLastPage;
		if (value.length >= this.searchedKeys.minChar || paginationType == EnumSearch.InitSearch || paginationType == EnumSearch.ScrollSearch) {
			this.billingService
				.searchSpeciality(value, undefined, body)
				.pipe(
					map((val) => {
						SpeicalityLastPage = val['result'].last_page;
						return val['result']['data'];

					}))
				.subscribe((data) => {
					if (paginationType == 'search') {
						this.lstspecalities = [];
						this.searchedKeys.specialityName.lastPage = this.searchedKeys.last_page;
					}
					let result = data;
					this.searchedKeys.specialityName.lastPage = SpeicalityLastPage;
					this.lstspecalities = [...this.lstspecalities, ...result];
				});
		}
	}
	getCaeType() {
		this.billingService.getCaseTypes().subscribe((res) => {
			if (res['status'] == 200) {
				this.lstCaseType =
					res['result'] && res['result'].data && res['result'].data.type
						? res['result'].data.type
						: [];
			}
		});
	}
	getStatusList() {
		this.billingService
			.getStatusList()
			.pipe(
				map((val) => {
					return val['result']['data'];
				}))
			.subscribe((data) => {
				this.lstStatus = [...data];
				this.statusDropdown.selectedItemAPICall();
				this.statusDropdown.searchForm.patchValue({
					common_ids: [1,2]
				})
				this.VisitSessionStatus = [...data];
			});
	}
	onSelectCode(value) {
		if (value.length !== 0) {
			this.searchForm.patchValue({ icd_code_ids: [value[0].id] });
		} else {
			this.searchForm.patchValue({ icd_code_ids: null });
		}
	}
	/**
	 * On form submit
	 * @param form
	 */
	onFormSubmit(form: any) {
		if (this.form.invalid || this.checkFileValidation()) {
			if (this.editRecord && this.editRecord.speciality && this.editRecord.speciality.speciality_key == 'diagnostic') {
				if (this.disableUpload) {
					this.toastrService.error('At least 1 Assertion Code, ICD and CPT Code are required', "Error");
				}
				else {
					this.toastrService.error('At least 1 Document, Assertion Code, ICD and CPT Code are required', "Error");
				}
			} else {
				if (this.disableUpload) {
					this.toastrService.error('At least 1 ICD and CPT Code are required', "Error");
				}
				else {
					this.toastrService.error('At least 1 Document, ICD and CPT Code are required', "Error");
				}
			}
			return false;
		}
		if (this.editRecord && this.editRecord.speciality && this.editRecord.speciality.speciality_key == 'diagnostic') {
			form['provider_id'] = this.form && this.form.get('provider_id').value ? this.form.get('provider_id').value : null;
			form['technician_id'] = this.form && this.form.get('technician_id').value ? this.form.get('technician_id').value : null;
			form['cd'] = this.form.get('cd').value;
			form['speciality'] = 'Diagnostic'
		}
		if(form['visit_session_state_id'] === visit_status_enum.finalized){
			form['can_finalize'] = true;
		}
		this.onUpdate(form);
		this.resetChecked();

	}
	/**
	 * On Submit
	 * @param value
	 */
	// onSubmit(value: any): void {
	//   this.startLoader = true;
	//   delete value.id;
	//   let obj = { ...value, ...this.uploadFiles }
	//   this.billingService.submitVisirDesk(obj).subscribe(response => {
	//     if (response['status'] == 200) {
	//       this.startLoader = false;
	//       this.toastrService.success('Successfully added', 'Success');
	//       this.modalRef.close();
	//     }
	//   }, err => {
	//     this.startLoader = false;
	//   })
	// }
	/**
	 * On  Update
	 * @param value
	 */
	onUpdate(value: any): void {
		this.startLoader = true;
		this.btnDisable = true;
		this.billingService.UpdateVisirDesk(value).subscribe(
			(response) => {
				if (response['status'] == true) {
					if (response['flag']) {
						this.startLoader = false;
						this.customDiallogService.confirm('Are you sure?', response['message'], 'Yes', 'No')
							.then((confirmed) => {
								let data = value;
								if (confirmed) {
									data['warning'] = 1;
									this.updateVisitDeskapiCallForCptChange(data);
								} else if (confirmed === false) {
									data['is_not'] = 1;
									this.updateVisitDeskapiCallForCptChange(value);
								} else {
									this.startLoader = false;
									this.btnDisable = false;
									return;
								}
							})
							.catch();
					} else {
						this.commonUpdateVisitFunctionality();
					}
				}
			},
			(err) => {
				this.btnDisable = false;
				this.startLoader = false;
			},
		);
	}

	getLinkwithAuthToken(link) {
		let token = this.storageData.getToken();
		return link;
		if (token) {
			return `${link}&token=${token}`;
		} else {
			return link;
		}
	}
	onSubmitUploadForm(form) {
		this.billingService.deleteRecord(form).subscribe((response) => {
			if (response['status'] == 200) {
				this.startLoader = false;
				this.selection.clear();
				this.toastrService.success('Successfully Added', 'Success');
				this.selection.clear();
				this.modalRef.close();
			}
		});
	}
	// DeleteRecord(data) {
	//   let id = data.id
	//   this.billingService.deleteRecord(id).subscribe(response => {
	//     if (response['status'] == 200) {
	//       this.startLoader = false;
	//       this.selection.clear();
	//       this.toastrService.success('Successfully Sent', 'Success');
	//       this.modalRef.close();
	//     }
	//   })
	// }

	public dropped(event: any, uploadDocuments?) {
		this.getVisitdeskSpecialityFolder();
		this.uploadFiles = [];
		this.files = [];
		let ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc doc-modal',
		};
		for (const droppedFile of event) {
			// Is it a file?
			if (droppedFile.fileEntry.isFile) {
				const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
				fileEntry.file((file: File) => {
					this.files.push(file);
					this.setFileDetails(file);
				});

				// this.handleFiles()
			} else {
				const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
			}
		}
		this.modalRef = this.modalService.open(uploadDocuments, ngbModalOptions);
		this.handleFiles();

		// if (this.files && this.files.length > 0) {
		//   // this.handleFiles()
		//   this.modalRef = this.modalService.open(uploadDocuments, ngbModalOptions);
		// }
	}

	onFileChange(event, uploadDocuments?) {
		this.folder = null;
		this.viewFile = false;
		this.getVisitdeskSpecialityFolder();
		this.files = event.target.files;

		let ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc doc-modal',
		};
		if (this.files && this.files.length > 0) {
			this.handleFiles();
			this.modalRef = this.modalService.open(uploadDocuments, ngbModalOptions);
			this.modalRef.result
				.then((res) => {
					event.target.value = '';
				})
				.catch((err) => (event.target.value = ''));
		}
	}
	getVisitdeskSpecialityFolder(callbackFn?) {
		this.folder = null;
		let requestdata = {
			case_id: this.caseId,
			speciality_id: this.editRecord && this.editRecord.speciality_id ? this.editRecord['speciality_id'] : '',
			facility_provider_id: this.editRecord && this.editRecord.facility_location_id
				? this.editRecord.facility_location_id
				: '',
			speciality_name: '',
			facility_provider_name: '',
		};
		if (this.viewFile) {
			requestdata['speciality_name'] =
				this.editRecord && this.editRecord.speciality_name ? this.editRecord.speciality_name : '';
			requestdata['facility_provider_name'] =
				this.editRecord && this.editRecord.practice_location_name
					? this.editRecord.practice_location_name
					: '';
		} else {
			requestdata['speciality_name'] =
				this.editRecord && this.editRecord.speciality &&
					this.editRecord.speciality.name &&
					this.editRecord.speciality.name
					? this.editRecord.speciality.name
					: (this.editRecord && this.editRecord.speciality_name ? this.editRecord.speciality_name : '');
			requestdata['facility_provider_name'] =
				this.editRecord && this.editRecord.facility_location && this.editRecord.facility_location.facility.name
					? this.editRecord.facility_location.facility.name
					: (this.editRecord && this.editRecord.practice_location_name ? this.editRecord.practice_location_name : '');
		}
		if (requestdata.facility_provider_name && requestdata.speciality_name && requestdata.case_id) {
			this.billingService.getfoldername(requestdata).subscribe((res) => {
				this.folder = res['data'];
				if (callbackFn) {
					callbackFn();
				}
			});
		}
	}
	setFileDetails(file) {
		this.setEachFile(file);
	}
	showDocumentTable(documenttable, row, openPopup?) {
		if (!row) {
			return false;
		}
		this.startLoader = true;
		this.disableView = true;
		this.caseId = row.case_id;
		if (openPopup) {
			this.editRecord = row;
			this.form.controls['visit_session_state_id'].setValue(this.editRecord && this.editRecord.visit_session_state_id ? this.editRecord.visit_session_state_id : '');
		}
		this.shareVisitDesk = row;
		this.shareVisitDesk['visit_session_id'] = row.id || row.visit_session_id;
		this.getVisitdeskSpecialityFolder(() => {
			this.documentManagerService
				.getFilesFromFolderId(this.folder.id, 10, 1, [], this.shareVisitDesk && this.shareVisitDesk.visit_session_id ? this.shareVisitDesk.visit_session_id :
					(this.editRecord && this.editRecord.visit_session_id ? this.editRecord.visit_session_id : null)
				)
				.subscribe((data) => {
					let files: FileModel[] = data['data'];
					this.file_names = data['data'];
					if (files && files.length != 1) {
						if (openPopup) {
							let ngbModalOptions: NgbModalOptions = {
								backdrop: 'static',
								size: 'lg',
								keyboard: false,
								windowClass: 'modal_extraDOc doc-modal',
							};
							if (documenttable) {
								this.modalRef = this.modalService.open(documenttable, ngbModalOptions);
							}
						}
						this.disableView = false;
					}
					else if (files && files.length == 1 && openPopup) {
						this.viewPdf(files[0].pre_signed_url);
						this.disableView=false;
					}
					else {
						this.disableView = false;
					}
				}, err => {
					this.startLoader = false;
					this.disableView = false;
				});
			this.startLoader = false;
		});
	}
	handleFiles(file?) {
		this.uploadFiles = [];
		for (const file of this.files) {
			this.setEachFile(file);
		}
	}

	setEachFile(file) {
		let ext = file.type.split('/');
		switch (ext[1] ? ext[1].toLocaleLowerCase() : '') {
			case 'jpg':
			case 'jpeg':
			case 'png':
			case 'pdf':
				const reader = new FileReader();
				reader.onload = this.handleReaderLoaded.bind(this);
				reader.readAsDataURL(file);
				break;
			default:
				this.toastrService.error(`Only files with extension JPG, JPEG, PNG or PDF are allowed.`);
				// this.activeModal.close()
				return;
		}
	}
	uploadFiles: any[] = [];
	handleReaderLoaded(e, id) {
		let reader = e.target;
		let imageSrc = reader.result;
		let filecode = imageSrc.split(',');
		imageSrc = filecode[1];
		let ext = filecode[0].split('/');
		let ext1 = ext[1].split(';');
		this.uploadFiles.push({ file: imageSrc, ext: ext1[0] });
	}
	onChecked(event, row, index) {
		if (this.adminVisit) {
			// if (!this.searchForm.controls['case_ids'].value || (Array.isArray(this.searchForm.controls['case_ids'].value) && !this.searchForm.controls['case_ids'].value.length) ) {
			// 	this.toastrService.error('Please apply filter on case id', 'Error');
			// 	this.ubilledVisitCheckBox['_results'] ? this.ubilledVisitCheckBox['_results'][index].checked= false : null;
			// 	return false;
			// }
		}
		event ? this.selection.toggle(row) : null;
	}


	exportToExcel() {
		let formData = removeEmptyAndNullsFormObject(this.generteFormFilter());
		// if(this.adminVisit && !this.practiceLocationFilter) {
		// 	this.toastrService.info('Practice-Location filter is required before exporting to CSV', 'Info');
		// 	return;
		// }
		if (!this.adminVisit) {
			formData['case_ids'] = this.caseId;
			if (this.calledspeciality && this.calledspeciality.length != 0) {
				formData['speciality_ids'] = this.calledspeciality;
			}
		}
		let paramDataFilter = new BillFilterModelQueryPassInApi(formData);
		paramDataFilter = {
			...removeEmptyKeysFromObject(paramDataFilter),
			order_by: OrderEnum.DEC,
			order: 'id'
		}
		if (paramDataFilter['billable']) {
			paramDataFilter['billable'] = paramDataFilter['billable'] === 'Yes' ? 1 : 0;
		}
		if (paramDataFilter['report_upload_status']) {
			paramDataFilter['report_upload_status'] = paramDataFilter['report_upload_status'] === 'Yes' ? 1 : 0;
		}
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
		let params = {
			...paramDataFilter,
			custom_columns: JSON.stringify(cols)
		}
		this.subscription.push(this.requestService.sendRequest(BillingEnum.unbilledVisitExcel + "?token=" + this.storageData.getToken(), 'get', REQUEST_SERVERS.fd_api_url, params)
			.subscribe((res) => {
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

	mapping(source: FeeScheduleCalculatedData[], destination: CreateBillModel[]) {
		return destination.map((item) => {
			item.cpt_fee_schedules = [];
			let source_item = source.find((_item) => item.id === _item.id);
			source_item.cpt_codes.map((_item) => {
				let arr = [];
				if (_item.fee_schedules.length > 1) {
					_item.fee_schedules.filter((multiplefees) => {
						multiplefees['hasMultiplFee'] = true;
						if (!multiplefees) {
							return;
						}
						multiplefees.cpt_code = item.cpt_codes.filter((x) => x.id == multiplefees.code_id)[0];
						multiplefees.cpt_code = {
							id: multiplefees.cpt_code.id,
							name: makeSingleNameFormFIrstMiddleAndLastNames(
								[multiplefees.cpt_code.name, multiplefees.cpt_code.description],
								'-',
							),
						};
						multiplefees.modifiers = [];
						multiplefees['total_charges'] = multiplefees['units'] * multiplefees['per_unit_price'];
						multiplefees['fee_schedule_id'] = multiplefees['id'];
						multiplefees['visit_id'] = source_item.id;
						arr.push(multiplefees);
					});
					let fee_schedul = makeDeepCopyObject(_item.fee_schedules[0]);
					fee_schedul['modifiers'] = [];
					fee_schedul['total_charges'] = fee_schedul['units'] * fee_schedul['per_unit_price'];
					fee_schedul['multiplefees'] = arr;
					fee_schedul['visit_id'] = item.id;
					item['isexpand'] = false;
					item['visit_charges'] = 0;
					item.cpt_fee_schedules.push(fee_schedul);
				} else if (_item.fee_schedules.length == 1) {
					let fee_schedules = _item.fee_schedules[0];
					if (!fee_schedules) {
						return;
					}
					fee_schedules.cpt_code = item.cpt_codes.filter((x) => x.id == fee_schedules.code_id)[0];
					fee_schedules.cpt_code = {
						id: fee_schedules.cpt_code.id,
						name: makeSingleNameFormFIrstMiddleAndLastNames(
							[fee_schedules.cpt_code.name, fee_schedules.cpt_code.description],
							'-',
						),
					};
					fee_schedules.modifiers = [];
					fee_schedules['visit_id'] = item.id;
					fee_schedules['total_charges'] = fee_schedules['units'] * fee_schedules['per_unit_price'];
					fee_schedules['fee_schedule_id'] = fee_schedules['id'];
					item['isexpand'] = false;
					item['visit_charges'] = 0;
					item.cpt_fee_schedules.push(fee_schedules);
				} else if (_item.fee_schedules.length == 0) {
					let fee_schedul = makeDeepCopyObject(_item.fee_schedules[0]);
					fee_schedul['modifiers'] = [];
					fee_schedul['per_unit_price'] = 0;
					fee_schedul['units'] = 0;
					fee_schedul['base_price'] = 0;
					fee_schedul['total_charges'] = 0;
					fee_schedul.cpt_code = item.cpt_codes.filter((x) => x.id == _item.id)[0];
					fee_schedul.cpt_code = {
						id: fee_schedul.cpt_code.id,
						name: makeSingleNameFormFIrstMiddleAndLastNames(
							[fee_schedul.cpt_code.name, fee_schedul.cpt_code.description],
							'-',
						),
					};
					fee_schedul['visit_id'] = item.id;
					item['isexpand'] = false;
					item['visit_charges'] = 0;
					item.cpt_fee_schedules.push(fee_schedul);
				}
			});
			return item;
		});
	}

	AttachSelectedOtions() {
		this.form;
	}

	isVisitTypeFummi() {
		return this.selection.selected.some(visits => visits && visits['appointment_type_slug'] ? visits['appointment_type_slug'] === "fu_mmi" : false) ?
			(this.selection.selected.every(visits => visits && visits['appointment_type_slug'] ? visits['appointment_type_slug'] === "fu_mmi" : false) ? true : false) : true
	}


	createVistsBill() {
	
		let multipleCaseId = this.selection.selected.length != 0 ? this.selection.selected[0]['case_id'] : null;

		if (!this.isVisitTypeFummi()) {
			this.toastrService.error("All Visits Type should be FUMMI", 'Error');
			return false;

		}
		this.startLoader = true;
		this.disableView = true;
		if (this.selection.selected.some((visit) => visit['visit_session_state_id'] == visit_status_enum.un_finalized ||
			visit['visit_session_state_id'] == visit_status_enum.bill_created || visit['billable'] == 0
		)

		) {
			this.startLoader = false;
			this.disableView = false;
			this.toastrService.error("You can't create bill as visit status is Unfinalized , Bill Created or  Billable status is No", 'Error');
			return false;
		}
		if (!this.selection.selected.every((visit) => visit['case_id'] === multipleCaseId)) {
			this.startLoader = false;
			this.disableView = false;
			this.toastrService.error("You can't create bill with different case Id", 'Error');
			return false;
		}


		this.caseId = this.selection.selected[0].case_id || this.searchForm.controls['case_ids'].value;
		let visitDetails = makeDeepCopyArray(this.selection.selected);
		let visitIds = visitDetails.map((visit) => {
			return visit.visit_session_id;
		});
		this.getBillVisitDetail({ visit_ids: visitIds }, true);
		// this.createBill(visits);
	}
	getBillVisitDetail(params, createBill?) {
		this.startLoader = true;
		this.disableView=true;
		this.billingService.getBilling(params).subscribe(
			(data: any) => {
				this.startLoader = false;
				this.disableView=false;
				if (createBill) {
					this.createBill(data.result.data);
				} else {
					this.disableUpload = false;
					if (!data?.result?.data?.[0]?.template_type || data?.result?.data?.[0]?.template_type != 'manual') {
						this.disableUpload = true;
					}
					this.isEnableReadingProvider(data.result.data[0]);
					this.bindReadingProviderList(data.result.data[0]);
					this.patchEditValues(data.result.data[0]);
					this.setValuesInDiagnosticSpecialty(); // SET VALUES TECHNICIAN AND PROVIDER AND CD IN CASE DIAGNOSTIC SPECIALTY
				}
			},
			(err) => {
				this.startLoader = false;
				this.disableView=false;
			},
		);
	}

	createBill(visits: CreateBillModel[]) {
		let calculationObject = [];
		let cptLength: number = 0;
		visits.filter((d) => {
			cptLength = cptLength + d.cpt_codes.length;
		});
		this.selected_case_type_slug = visits[0].kiosk_case.case_types.slug;
		let selected_allowed_case_type_slug = this.allowed_case_type_slugs.findIndex((case_type_slug) => case_type_slug == this.selected_case_type_slug);
		if ((selected_allowed_case_type_slug < -1)) {
			if (cptLength > 6) {
				this.toastrService.error('CPT codes are greater than 6');
				return false;
			}
		}
		let condition = visits.every(
			(visit) => visit['speciality']['id'] == visits[0]['speciality']['id'],
		);
		let condition2 = visits.every((visit) => visit['doctor_id'] == visits[0]['doctor_id']);
		let condition3 = visits.every(
			(visit) => visit['facility_location_id'] == visits[0]['facility_location_id'],
		);
		// const visitsHaveCPTCodesGreaterThan6 = visits.filter((d) => d.cpt_codes.length > 6);
		// if (
		// 	visitsHaveCPTCodesGreaterThan6 &&
		// 	Array.isArray(visitsHaveCPTCodesGreaterThan6) &&
		// 	visitsHaveCPTCodesGreaterThan6.length > 0
		// ) {
		// 	this.toastrService.error('CPT codes are greater than 6');
		// 	return false;
		// }

		if (condition && condition2 && condition3) {
			this.startLoader = true;
			visits.forEach((element) => {
				let formate = {
					id: element['id'],
					case_type_id: element['kiosk_case']['case_type_id'],
					visit_type_id: element['appointment_type_id'],
					provider_id: element['doctor_id'],
					speciality_id: element['speciality_id'],
					facility_location_id: element['facility_location_id'],
					region_id:
						element['facility_location'] && element['facility_location']['region_id']
							? element['facility_location']['region_id']
							: null,
					place_of_service_id:
						element['facility_location'] && element['facility_location']['place_of_service_id']
							? element['facility_location']['place_of_service_id']
							: null,
					insurance_id: element['kiosk_case']['insurance_id'] ? element['kiosk_case']['insurance_id'] : [],
					employer_id:
						element['kiosk_case'] && element['kiosk_case']['case_employers']
							? element['kiosk_case']['case_employers']
								.filter((m) => m['pivot']['employer_type_id'] === 1)
								.map((x) => x.id)[0]
							: [],
					plan_id:
						element['kiosk_case'] && element['kiosk_case']['case_insurances']
							? element['kiosk_case']['case_insurances']
								.filter((m) => m['pivot']['type'] == 'primary')
								.map((x) => x['pivot']['insurance_plan_name_id'])[0]
							: [],
					cpt_code_ids: element['cpt_codes'] ? element['cpt_codes'].map((m) => m.id) : [],
				};
				calculationObject.push(removeEmptyAndNullsFormObject(formate));
			});
			this.billingService
				.getCalculatedFeeSchedule({ visit_sessions: calculationObject })
				.subscribe((data) => {
					if (data) {
						this.startLoader = false;

						let ngbModalOptions: NgbModalOptions = {
							backdrop: 'static',
							keyboard: false,
							size: 'lg',
							windowClass: 'modal_extraDOc create-bill-modal overflow_unset',
						};
						let feeCallculateddata: FeeScheduleCalculatedData[] = data['result']['data'];
						this.mapping(feeCallculateddata, visits);
						this.createModalRef = this.modalService.open(CreateBillModalComponent, ngbModalOptions);
						this.createModalRef.componentInstance.visitList = visits;
						this.createModalRef.componentInstance.modalRef = this.createModalRef;
						this.createModalRef.componentInstance.caseId = this.caseId;
						this.createModalRef.componentInstance.visit_sessions = calculationObject;
						this.createModalRef.componentInstance.facility_location_id =
							visits[0]['facility_location_id'];
						this.createModalRef.result.then((res) => {
							this.selection.clear();
							visits = [];
							calculationObject = [];
							res ? this.getBillingListing(this.createQueryParam(this.searchForm.value)) : '';
						});
					}
				});
		} else {
			this.toastrService.error(
				'Bill can only be created against multiple visit types of same speciality, practice location and provider',
				'Error',
			);
		}
		this.startLoader = false;
	}

	openbulkEditICdCodesModal(data) {
		let ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			size: 'lg',
			windowClass: 'modal_extraDOc create-bill-modal body-scroll',
			// windowClass:'modalxl',

		};
		this.bulkEditICD10ModeModalRef = this.modalService.open(BulkEditICD10CodesModalComponent, ngbModalOptions);
		this.bulkEditICD10ModeModalRef.componentInstance.modalRef = this.bulkEditICD10ModeModalRef;
		this.bulkEditICD10ModeModalRef.componentInstance.Visit_data = data;
		this.bulkEditICD10ModeModalRef.componentInstance.adminVisit = this.adminVisit;
		this.bulkEditICD10ModeModalRef.result.then((res) => {
			if (res === "updated") {
				this.getBillingListing(this.createQueryParam(this.searchForm.value));
			}

		});

	}

	cptValidation() {
		let cptCodes: any[] = this.form.value.cpt_codes;
		let totallength = cptCodes.length;
		if (totallength > 6) {
			cptCodes.pop();
			this.form.controls['cpt_codes'].setValue(cptCodes);
			this.toastrService.error('Maximum CPT codes can only be 6', 'Error');
		}
	}

	viewPdf(link: string) {
		let linkOpen = this.getLinkwithAuthToken(link);
		window.open(linkOpen, '_blank', 'location=yes,height=770,width=720,scrollbars=yes,status=yes');
		// let modalRef = this.modalService.open(PdfViewerComponent, { size: 'lg' })
		// modalRef.componentInstance.pdfSourceLink = link
	}

	changeSessionId($event) {
		if ($event && $event.slug == 'un_finalized') {
			this.form.controls['cpt_codes'].clearValidators();
			this.form.controls['cpt_codes'].updateValueAndValidity();
			this.form.controls['icd_codes'].clearValidators();
			this.form.controls['icd_codes'].updateValueAndValidity();
			this.cptCodePlaceHolder = 'CPT Codes';
			this.icdCodePlaceHolder = 'ICD-10 Codes';
		} else {
			this.form.controls['cpt_codes'].setValidators([Validators.required]);
			this.form.controls['cpt_codes'].updateValueAndValidity();
			this.cptCodePlaceHolder = 'CPT Codes*';
			this.form.controls['cpt_codes'].markAsTouched();
			this.form.controls['cpt_codes'].markAsDirty();
			this.form.controls['icd_codes'].setValidators([Validators.required]);
			this.form.controls['icd_codes'].updateValueAndValidity();
			this.icdCodePlaceHolder = 'ICD-10 Codes*';
			this.form.controls['icd_codes'].markAsTouched();
			this.form.controls['icd_codes'].markAsDirty();
		}
	}
	searchCaseIds({ target }) {
		this.billingService.searchCaseId(target.value).subscribe((res) => {
			if (res['status']) {
				this.caseIds = [...res['result']['data']];
			}
		});
	}

	labelMovetoAbove(status: boolean, label: string) {
		this.labelName[label] = status;
	}

	filterTheCPTCode(row: any[], filterId: number) {
		return row.filter((d) => d.code_type_id === filterId);
	}

	sorting({ sorts }) {
		this.page.column = sorts[0].prop;
		this.page.order = sorts[0].dir;
		this.getBillingListing(this.createQueryParam(this.searchForm.value));
	}

	setCaseIdOnThroughCaseFlow() {
		if (this.routeCaseId) {
			this.searchForm.value['case_ids'] = this.routeCaseId;
		}
	}
	//state management of filter///

	getChange($event: any[], fieldName: string) {
		if ($event && fieldName != 'report_upload_status') {
			this.selectedMultipleFieldFiter[fieldName] = $event.map(
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
	getMorePracticeLocation() {
		if (this.searchedKeys.practiceLocation.page != this.searchedKeys.practiceLocation.lastPage) {
			this.searchPractice(this.searchedKeys.practiceLocation.searchKey, this.searchedKeys.practiceLocation.page + this.searchedKeys.page, EnumSearch.ScrollSearch);
		}
	}
	getMorePracticeLocationOpen() {
		if (this.lstpractiseLocation.length == 0) {
			this.searchPractice('', this.searchedKeys.page, EnumSearch.InitSearch);
		}
	}
	getMoreProviders() {
		// this.searchProvider(this.searchedKeys.providerName.searchKey,this.searchedKeys.providerName.page + this.searchedKeys.page,'scroll');
	}
	getMoreSpeciality() {
		if (this.searchedKeys.specialityName.page != this.searchedKeys.specialityName.lastPage) {
			this.getSpeciality(this.searchedKeys.specialityName.searchKey, this.searchedKeys.specialityName.page + this.searchedKeys.page, EnumSearch.ScrollSearch);
		}

	}
	getMoreSpecialityOpen() {
		if (this.lstspecalities.length == 0) {
			this.getSpeciality('', this.searchedKeys.page, EnumSearch.InitSearch);
		}

	}
	valueAssignInListOfFieldArray(values: object = {}) {
		this.selectedMultipleFieldFiter['appointment_type_ids'] = values['appointment_type_ids'];
		this.lstVisitType = values['appointment_type_ids'];

		this.selectedMultipleFieldFiter['facility_location_ids'] = values['facility_location_ids'];
		this.lstpractiseLocation = values['facility_location_ids'];

		this.selectedMultipleFieldFiter['speciality_ids'] = values['speciality_ids'];
		this.lstspecalities = values['speciality_ids'];
		this.selectedMultipleFieldFiter['firm_ids'] = values['firm_ids'];
		this.lstInsurance = values['insurance_ids'];
        this.selectedMultipleFieldFiter['insurance_ids'] = values['insurance_ids'];
        this.selectedMultipleFieldFiter['case_ids'] = values['case_ids'];
		this.selectedMultipleFieldFiter['provider_ids'] = values['provider_ids'];
		this.lstProvider = values['provider_ids'];
		this.selectedMultipleFieldFiter['created_by_ids'] = values['created_by_ids'];
		this.lstProvider = values['created_by_ids'];
		this.selectedMultipleFieldFiter['updated_by_ids'] = values['updated_by_ids'];
		this.lstProvider = values['updated_by_ids'];
		this.selectedMultipleFieldFiter['visit_status_ids'] = values['visit_status_ids'];
		this.lstStatus = values['visit_status_ids'];

		this.selectedMultipleFieldFiter['employer_ids'] = values['employer_ids'];
		this.lstStatus = values['employer_ids'];

	}

	showFileInformation(fileName) {
		if (fileName && fileName.pre_signed_url) {
			this.viewPdf(fileName.pre_signed_url);
		}
	}

	deleteVistFile(name) {
		this.customDiallogService
			.confirm('Delete File', 'Do you really want to delete this file?')
			.then((confirmed) => {
				if (confirmed) {
					this.deleteFilesOrFilders({ ids: [name.id] });
				}
			})
			.catch();
	}



	onDeleteVisit(visit) {
		this.customDiallogService
			.confirm('Delete Visit', 'Do you really want to delete these visit?')
			.then((confirmed) => {
				if (confirmed) {
					this.removeVisits(visit);
				}
			})
			.catch();
	}


	removeVisits(visit) {
		if (WithoutTime(new Date(visit.visit_date)) < WithoutTime(this.currentDate)) {
			let ngbModalOptions: NgbModalOptions = {
				backdrop: 'static',
				size: 'sm',
				keyboard: false,
				windowClass: 'cancel-modal'
			};

			let modalRef = this.modalService.open(DeleteReasonBillingComponentComponent, ngbModalOptions);
			modalRef.result.then((res) => {
				if (res && res.data && res.data.cancelled_comments) {
					this.deleteVisit(
						{
							data: [{
								appointment_id: visit.appointment_id,
								case_id: visit.case_id
							}],
							cancelled_comments: res.data.cancelled_comments
						});

				}

			});
		}
		else {
			let params = {
				data: [{
					appointment_id: visit.appointment_id,
					case_id: visit.case_id,
					prev_status: visit?.appointment_status
				}],
			};
			this.deleteVisit(params);
		}
	}

	isbillAllSelected(): boolean {
		this.billTotalRows = this.lstBilling.length;
		const numSelected = this.selection.selected.length;
		const numRows = this.billTotalRows;
		return numSelected === numRows;
	}
	/**
	 * Invoke isbillAllSelected method and perform operation its return value
	 * @param void
	 * @returns void
	 */
	billsmasterToggle(): void {
		this.isbillAllSelected()
			? this.selection.clear()
			: this.lstBilling
				.slice(0, this.billTotalRows)
				.forEach((row) => this.selection.select(row));
	}


	deleteVisitSession() {
		this.customDiallogService
			.confirm('Delete Visit', 'Do you really want to delete these visit?')
			.then((confirmed) => {
				if (confirmed) {
					let backDatedVist: any[] = [] = this.selection.selected.filter(visit => WithoutTime(new Date(visit.visit_date)) < WithoutTime(this.currentDate));
					if (backDatedVist.length != 0) {
						let ngbModalOptions: NgbModalOptions = {
							backdrop: 'static',
							size: 'sm',
							keyboard: false,
							windowClass: 'cancel-modal'

						};

						let modalRef = this.modalService.open(DeleteReasonBillingComponentComponent, ngbModalOptions);
						modalRef.result.then((res) => {
							if (res && res.data && res.data.cancelled_comments) {
								let data = this.selection.selected.map(visit => {
									return {
										case_id: visit.case_id,
										appointment_id: visit.appointment_id,
										prev_status : visit['appointment_status']
									};
								});


								this.deleteVisit({
									data: data,
									cancelled_comments: res.data.cancelled_comments
								});
							}
						});
					}
					else {
						let data = this.selection.selected.map(visit => {
							return {
								case_id: visit.case_id,
								appointment_id: visit.appointment_id,
								prev_status : visit['appointment_status']
							};
						});

						this.deleteVisit({
							data: data,
						});
					}

				}
				else {

				}
			});
	}

	deleteVisit(params) {
		this.startLoader = true;
		this.subscription.push(
			this.requestService
				.sendRequest(BillingEnum.DeleteVisit, 'post', REQUEST_SERVERS.fd_api_url,
					params
				)
				.subscribe((response: any) => {
					this.startLoader = false;
					if (response.status == true) {
						// this.resetFilter();
						this.getBillingListing(this.createQueryParam(this.searchForm.value));
						this.selection.clear();
						this.toastrService.success(response.message, 'Success');
					}
					else {
						this.errorMessageComponent.modelTitle = "Delete Visit";
						this.errorMessageComponent.errorMessage = response.message;
						this.errorMessageComponent.rows = response.result.data;
						this.errorMessageComponent.openErrorMessage();
						this.selection.clear();
					}
				}, error => {
					this.selection.clear();
					this.startLoader = false;
				}),
		);

	}

	deleteFilesOrFilders(requestData) {
		this.documentManagerService.deleteDocument(requestData).subscribe(res => {
			if (res['status'] == true) {
				this.showDocumentTable(null, this.currentVistRow, false);
			}
		}, err => {

		});
	}

	scrollDownCaseComments() {
	}

	scrollUpCaseComments() {
	}
	ngSelectClear(Type) {
		this.searchForm.controls[Type].setValue(null);
	}
	selectionOnValueChange(e: any, Type?) {
		const info = new ShareAbleFilter(e);

		this.searchForm.patchValue(removeEmptyAndNullsFormObject(info));
		if(Type === 'technician_id'){
			this.form.controls[Type].setValue(e?.formValue);
			if (!e.data ) {
			   this.form.controls[Type].setValue(null);
		}
		return
		};
		this.getChange(e.data, e.label);
		// if(Type == "visit_status_ids" && !(e.formValue.length >= 1)){
		// 	this.searchForm.controls[Type].setValue([]);
		// }
		if (!e.data ) {
				this.searchForm.controls[Type].setValue(null);
		}
		// if(this.adminVisit && e?.label==='facility_location_ids' && e.formValue?.length == 0 && e.data?.length == 0 ){
		// 	this.searchForm.controls[Type].setValue(null);
		// }
	}

	onSelectionValueChange(e: any, _form: FormGroup, Type?) {
		_form.controls[Type].setValue(e && e.formValue ? e.formValue : null);
	}
	checkInputs() {
		if (isEmptyObject(this.searchForm.value)) {
			return true;
		}
		return false;
	}
	commonUpdateVisitFunctionality() {
		this.startLoader = false;
		this.btnDisable = false;
		this.selection.clear();
		this.getBillingListing(this.createQueryParam(this.billListingObj));
		this.toastrService.success('Successfully updated', 'Success');
		this.editModalRef.close();
		this.getSpecialitiesWithCount();
		this.calledspeciality = null;
		this.enableReadingProvider = false;
	}

	updateVisitDeskapiCallForCptChange(value) {
		this.billingService.UpdateVisirDesk(value).subscribe(
			(response) => {
				if (response['status'] == true) {
					this.commonUpdateVisitFunctionality();
				}
			},
			(err) => {
				this.btnDisable = false;
				this.startLoader = false;
			},
		);
	}

	onFormSpecalitySubmit() {
		console.log(this.searchForm);
		console.log(this.currentVistRow);
		let params = {

			visit_type_id: this.searchForm.value.appointment_type_id,
			speciality_id: this.searchForm.value.speciality_id,
			id: this.currentVistRow.visit_session_id,
			appointment_id: this.currentVistRow.appointment_id,
		};

		this.setSpecalityVistForUser({ visit_sessions: [params] });
	}

	changeVistSession() {

	}


	closeModalChangeSpecality() {
		this.searchForm.controls['appointment_type_id'].setValue(null);
		this.searchForm.controls['speciality_id'].setValue(null);
		this.currentVistRow = null;
		this.changeSpecalityModal.close();


	}


	setSpecalityVistForUser(params) {

		this.startLoader = true;
		this.subscription.push(
			this.requestService
				.sendRequest(BillingEnum.changevisitSpeclality, 'put', REQUEST_SERVERS.fd_api_url,
					params
				)
				.subscribe((response: any) => {
					this.startLoader = false;
					if (response.status == true) {
						this.closeModalChangeSpecality();
						this.page.pageNumber = 1;
						this.getBillingListing(this.createQueryParam(this.searchForm.value));
						this.toastrService.success(response.message, 'Success');
					}
					else {
						this.toastrService.error(response.message, 'Error');
					}
				}, error => {
					this.toastrService.error(error.message, 'Error');
				}),
		);

	}

	onChangeSpeaclity(row, changeSpecalityModel) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			size: 'lg',
			keyboard: false,
			windowClass: 'modal_extraDOc',
		};
		this.currentVistRow = row;
		this.changeSpecalityModelInfo = changeSpecalityModel;
		this.changeSpecalityModal = this.modalService.open(changeSpecalityModel, ngbModalOptions);

	}
	setValuesInDiagnosticSpecialty() {
		// SHOW ASSIGN VALUES IN DIAGNSOTIC SPECIALTY
		if (this.editRecord && this.editRecord.speciality && this.editRecord.speciality.speciality_key == 'diagnostic') {
			this.form.controls['provider_id'].setValue(this.editRecord && this.editRecord.doctor && this.editRecord.doctor.user_id ? this.editRecord.doctor.user_id : null);
			this.diagnosticProviders = this.editRecord && this.editRecord.doctor ? [{
				id: this.editRecord.doctor.user_id,
				name: this.getFullName(this.editRecord.doctor)
			}] : [];
			this.form.controls['technician_id'].setValue(this.editRecord && this.editRecord.technician_id ? this.editRecord.technician_id : null);
			this.technicianAPIhit = true;
			this.selectedMultipleFieldFiter['technician_id'] = this.editRecord && this.editRecord.technician_id ?
				[{
					id: this.editRecord && this.editRecord.technician_id ? this.editRecord.technician_id : null,
					first_name: this.editRecord && this.editRecord.technician_first_name ? this.editRecord.technician_first_name : '',
					middle_name: this.editRecord && this.editRecord.technician_middle_name ? this.editRecord.technician_middle_name : '',
					last_name: this.editRecord.technician_last_name,
					role_qualifier: this.editRecord?.technician_role_qualifier || '',
					role_name:this.editRecord?.technician_role_name || '',
					billing_titles_name:this.editRecord?.technician_billing_titles_name || ''
				}]: [];

			this.diagnosticTechnicians = this.editRecord && this.editRecord.technician_id ?
			[{
				id: this.editRecord && this.editRecord.technician_id ? this.editRecord.technician_id : null,
				first_name: this.editRecord && this.editRecord.technician_first_name ? this.editRecord.technician_first_name : '',
				middle_name: this.editRecord && this.editRecord.technician_middle_name ? this.editRecord.technician_middle_name : '',
				last_name: this.editRecord.technician_last_name
			}] : [];
			if(this.editRecord){
				this.physician= {...this.editRecord};	
			  }
			if(this.physician) {
				this.physician.full_name = `${this.physician?.physicians_first_name} ${this.physician?.physicians_middle_name?this.physician?.physicians_middle_name:''} ${this.physician?.physicians_last_name}${this.physician?.street_address?', '+this.physician?.street_address+',':''} 
				${this.physician?.floor?this.physician?.floor+",":''}
				${this.physician?.city?this.physician?.city+",":''} ${this.physician?.state?this.physician?.state+",":''} ${this.physician?.zip?this.physician?.zip:''} `  
				const physican_id =  this.physician?.physicians_id;
				this.physician.id =  this.physician?.physician_clinic_id;
				this.physician.physician_clinic_id = physican_id;
				this.physician['first_name'] = this.physician?.physicians_first_name ? this.physician?.physicians_first_name : null;
				this.physician['middle_name'] = this.physician?.physicians_middle_name ? this.physician?.physicians_middle_name : null;
				this.physician['last_name'] = this.physician?.physicians_last_name ? this.physician?.physicians_last_name : null;
				this.physician['name'] = this.physician?.clinic_name ? this.physician?.clinic_name : null;
				this.lstPhysician = [
					{...this.physician}
				];
				if(this.physician?.physicians_id){
					this.showSelectFieldList.physician_id= [...this.lstPhysician]
				}
				this.form.get('physician_id').setValue(this.physician && this.physician?.id);
			}
			this.form.controls['cd'].setValue(this.editRecord.cd);
			this.form.controls['provider_id'].setValidators(Validators.required);
			this.form.controls['provider_id'].updateValueAndValidity();
		}
	}
	getProvidersForDiagnosticSpecialty() {
		let Object = {
			facility_location_id: this.editRecord && this.editRecord.facility_location_id,
			speciality_id: this.editRecord && this.editRecord.speciality_id
		}
		this.startLoader = true;
		this.billingService.getProvidersForOnlyDiagnosticSpecialty(Object).subscribe(res => {
			if (res.status) {
				console.log(res);
				this.editRecord;
				this.startLoader = false;
				this.diagnosticProviders = res && res.result && res.result.data ? res.result.data : [];
				this.diagnosticProviders = res['result']['data'].map(res => {
					return {
						id: res.id,
						name: this.getFullName(res),
					}
				});
				// this.diagnosticProviders = res && res.result && res.result.data ?  res.result.data : [];
			}
		},
			(err => {
				this.startLoader = false;
			}))
	}
	getProviderTechnisionForDiagnosticSpecialty() {
		if (this.editRecord && this.editRecord.speciality && this.editRecord.speciality.speciality_key == 'diagnostic' && this.form.get('provider_id').value) {
			let TechnicianExtraParams = {
				supervisor_id: this.form && this.form.get('provider_id').value,
				facility_location_id: this.editRecord.facility_location_id ? this.editRecord.facility_location_id : null
			}
			this.startLoader = true;
			this.billingService.getProviderTechnisionForOnlyDiagnosticSpecialty(TechnicianExtraParams).subscribe(res => {
				if (res.status) {
					this.startLoader = false;
					this.diagnosticTechnicians = res && res.result && res.result.data ? res.result.data : [];
				}
			},
				(err => {
					this.startLoader = false;
				}))
		}
	}
	technicianExtraParams(){
		return {
			supervisor_id: this.form && this.form.get('provider_id').value,
			facility_location_id: this.editRecord.facility_location_id ? this.editRecord.facility_location_id : null
		}
	}
	getFirstName(obj) {
		return obj && obj.first_name ? this.first_name = obj.first_name : '';
	}

	getMiddleName(obj) {
		return obj && obj.middle_name ? this.middle_name = obj.middle_name : '';
	}

	getLastName(obj) {
		return obj && obj.last_name ? this.last_name = obj.last_name : '';
	}

	getFullName(obj) {
		return this.getFirstName(obj) + ' ' + this.getMiddleName(obj) + ' ' + this.getLastName(obj);
	}
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}

	isEnableReadingProvider(data) {

		if (data.appointment_type) {
			this.enableReadingProvider = data.appointment_type.is_reading_provider
		}
		else {
			this.resetReadingProvider()
			this.enableReadingProvider = false;

		}
	}

	resetReadingProvider() {
		this.eventsSubjectReadingProvider.next(true);
		this.form.get('reading_provider').reset(null, { emitEvent: false })
		this.readingProviderId = null;
	}

	bindReadingProviderList(data) {
		if (data) {
			let readingProvider = {
				id: data.reading_provider_id,
				first_name: data.reading_provider_first_name,
				middle_name: data.reading_provider_middle_name,
				last_name: data.reading_provider_last_name,
				full_name: `${data.reading_provider_first_name}${data.reading_provider_middle_name ? ' ' + data.reading_provider_middle_name : ''}${data.reading_provider_last_name}`
			}
			if (readingProvider.id) {
				this.form.get('reading_provider').setValue(readingProvider && readingProvider.id);
				this.showSelectFieldList.reading_provider = [{ ...readingProvider }];
				this.readingProviderId = readingProvider.id;
			}

		}



	}

	dateFormate(e: any, date) {
		let format = e[date] && e[date] != '' ? e[date].split(' ')[0].split('-') : null;
		format = format ? `${format[1]}/${format[2]}/${format[0]}` : '';
		return format;
	}
	
	billingHistoryStats(row) {
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
			if(this.adminVisit) {
				this.localStorage.setObject('billingTableList' + this.storageData.getUserId(), data);
			}
			else {
				this.localStorage.setObject('visitsTableList' + this.storageData.getUserId(), data);
			}
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
		this.billingListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.billingListTable._internalColumns.sort(function (a, b) {
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






/**
 * disable create bill button on provider n speciality check
 */
// canGenerateBill() {
// 	let visits = this.selection.selected
// 	let condition = visits.every((visit, index) => visit['speciality']['id'] == visits[0]['speciality']['id'])
// 	let condition2 = visits.every((visit, index) => visit['doctor_id'] == visits[0]['doctor_id'])
// 	if (visits[0]['doctor_id'] && condition && condition2) {
// 		return false
// 	}
// 	else {
// 		return true
// 	}
// }
