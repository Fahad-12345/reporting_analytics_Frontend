import { ErrorMessageModalComponent } from './../../cases/case-list/components/error-message-component/error-message-component';
import { CustomDiallogService } from './../../../shared/services/custom-dialog.service';
import { CasesUrlsEnum } from '@appDir/front-desk/cases/Cases-Urls-Enum';
import { CaseStatusUrlsEnum } from './../../masters/billing/billing-master/CaseStatus-Urls-Enum';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { Page } from '@appDir/front-desk/models/page';
import { SelectionModel } from '@angular/cdk/collections';
import { AclService } from '@appDir/shared/services/acl.service';
import { Location } from '@angular/common';
import {
	unSubAllPrevious,
} from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Subscription, Subject, Observable } from 'rxjs'
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { Title } from '@angular/platform-browser';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { PatientListingUrlsEnum } from '../patient-listing/PatientListing-Urls-Enum';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { ButtonClass } from '@appDir/shared/dynamic-form/models/ButtonClass.class';
import { ButtonTypes } from '@appDir/shared/dynamic-form/constants/ButtonTypes.enum';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { isEmptyObject, removeEmptyKeysFromObject } from '@appDir/shared/utils/utils.helpers';
import { CaseFlowUrlsEnum } from '@appDir/front-desk/fd_shared/models/CaseFlowUrlsEnum';
import { PatientFormUrlsEnum } from '../patient-form/PatientForm-Urls-enum';
import { isObjectEmpty, removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
import { getFieldControlByName } from '@appDir/shared/dynamic-form/helper';
import { SoftPatientVisitComponentModal } from '@appDir/shared/modules/doctor-calendar/modals/soft-patient-visit-modal/soft-patient-visit-modal.component';
import { SoftPatientService } from '@appDir/front-desk/soft-patient/services/soft-patient-service';
import { NgSelectClass } from '@appDir/shared/dynamic-form/models/NgSelectClass.class';
import { FirmUrlsEnum } from '@appDir/front-desk/masters/billing/attorney-master/firm/Firm-Urls-enum';
import { EnumApiPath } from '@appDir/front-desk/billing/Models/searchedKeys-modal';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { FilterService } from '@appDir/shared/filter/service/filter.service';

@Component({
	selector: 'app-patient-profile',
	templateUrl: './patient-profile.component.html',
	styleUrls: ['./patient-profile.component.scss'],
})
export class PatientProfileComponent extends PermissionComponent implements OnInit, OnDestroy {
	@ViewChild('tabset') tabset;
	@ViewChild('errorMessageComponent') errorMessageComponent :ErrorMessageModalComponent;
	@ViewChild('allergiesModal') private allergiesModal: any;

	refresh: Subject<boolean> = new Subject<boolean>();
    employerSearchTypeHead$:Subject<any>=new Subject<any>();
	searchAttorneyTypeHead$:Subject<any>=new Subject<any>();
    eventsSubjectReset$: Subject<any> = new Subject<any>();
	resetTheNgSelectField$:Subject<any>=new Subject<any>();
	caseTypeSearchTypeHead$:Subject<any>=new Subject<any>();
	subscription: Subscription[] = [];
	cases = [];
	public dob;
	case_id: number;
	patientId: number;
	patient: any = {};
	patientAddress: any;
	emergencyContact: any;
    lstEmployer=[]
	contactAddress: any;
	form: FormGroup;
	formNote: FormGroup;
	page: Page;
	allPage: Page;
	caseCount: number;
	rows = new Array<any>();
	age: number;
	contactPerson: any;
	patientdata: any;
	lstAttorney=[];
	relationship: any;
	ssnformate: string;
	public loadSpin: boolean = false;
	isCollapsed = false;
	patientPharmacyDetail;
	@ViewChild(DynamicFormComponent) component: DynamicFormComponent;
	selection = new SelectionModel<Element>(true, []);
	requestServerpath = REQUEST_SERVERS;
	CaseStatusUrlsEnum = CaseStatusUrlsEnum;
	currentCase: any; 
	caseUpdateForm: FormGroup;
	caseStatusUpdateBoolean: boolean= false;
	filterFormDisabled:boolean = false;
	firmPaginationSetting = {
		search:'',
		lastPage:null,
		per_page:10,
		currentPage:1,
	}
CreatedByPaginationSetting = {
		search:'',
		lastPage:null,
		per_page:10,
		currentPage:1,
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
	lstCreatedBy: any[] = [];
	limit=10;
	apage=1;
	lstFirm: any[] = [];
	patAllergiesTypes=[];
	patAllergies=[];
	alltotal: any;
	limitPerPage = 10;
	lstCaseTypes=[];
	caseType_filter={
		page:0,
		searchKey:'',
		lastPage:2,
		per_page:10
	}

	constructor(
		// public datepipe: DatePipe,
		aclService: AclService,
		private localStorage: LocalStorage,
		private fd_services: FDServices,
		private modalService: NgbModal,
		private route: ActivatedRoute,
		private fb: FormBuilder,
		// private logger: Logger,
		private toastrService: ToastrService,
		protected requestService: RequestService,
		titleService: Title,
		private _route: ActivatedRoute,
		private storageData: StorageData,
		private location: Location,
		public datePipeService: DatePipeFormatService,
		router: Router,
		public customDiallogService: CustomDiallogService,
		public softPatientModal: NgbModal,
		public softPatientService:SoftPatientService,
		private caseFlowServie:CaseFlowServiceService,
		private filterService:FilterService,


	) {
		super(aclService, router, route, requestService, titleService);
		this.patientId = this.route.snapshot.params['id'];
		this.patientId = +this.patientId;

		this.form = fb.group({
			id: '',
			case_type: '',
			attorney_name: '',
			firm_ids:[],
			created_by_ids:[],
            updated_by_ids:[],
			insurance_name: '',
			date_of_accident: '',
			Created_at: '',
			Updated_at: '',
			claim_no: '',
		});
		this.formNote = fb.group({
			id: '',
			note: '',
		});

		this.page = new Page();
		this.page.pageNumber = 0;
		this.page.size = 10;
		this.getPatient(this.patientId);
		this.allPage = new Page();
		this.allPage.pageNumber = 0;
		this.allPage.size = 10;
		this.getPatientAllergies()
	}
	pageLimit($num) {
		this.page.size = Number($num);
		this.setPage({ offset: 0 });
	}

	resetFilters() {
		this.eventsSubjectReset$.next(true);
		this.isCollapsed = false;
		this.lstCreatedBy = [];
		this.lstCaseTypes = [];
		this.lstAttorney = [];
		this.lstEmployer=[];
		this.form.reset();
		this.page.pageNumber = 1;
		this.caseType_filter.page = 0;
		this.employer_filter.page=0;
		this.attorney_filter.page = 0;
		this.CreatedByPaginationSetting.currentPage = 1;
	}

	reset() {
		this.resetFilters();
		this.addUrlQueryParams();
		this.setPage({ offset: 0 });

	}
	
	public params = null;
	ngOnInit() {
		this.setTitle();
		this.subscription.push(
			this.route.queryParams.subscribe((params) => {
				this.form.patchValue(params);
				this.params = params;
				this.checkInputs();
			}),
		);
		this.setConfigration();
		this.getPatient(this.patientId);
		this.setPage({ offset: 0 });
		this.caseUpdateForm = this.fb.group({
			status_id:null
		});
	}
	/**
		 * Calls when dynamic form is ready
		 * @param event 
		 */
	onReady(event: FormGroup) {
		this.form = event;
		this.form.patchValue(this.params);
	}
	getPatient(id?: number) {
		console.log('pat1')
		let queryParams = {
			filter: true,
			per_page: this.page.size,
			page: 1,
			pagination: 1,
			order_by: OrderEnum.DEC,
			id: this.patientId
		};
		this.requestService.sendRequest(PatientListingUrlsEnum.Patient_Get, 'get', REQUEST_SERVERS.kios_api_path, queryParams).subscribe(res => {
			this.showPharmacyOfPatient(res['result']['data'][0]);
			this.patient = res['result'] && res['result']['data'] ? res['result']['data'][0] : {}
			this.patientAddress = this.patient && this.patient.self && this.patient.self.contact_information ? this.patient.self.contact_information.mail_address : {}
			this.contactPerson = this.patient && this.patient.emergency ? this.patient.emergency : {}
			this.patientdata = this.patient && this.patient.self && this.patient.self.contact_information ? this.patient.self.contact_information : {}
			this.relationship = this.patient && this.patient.emergency && this.patient.emergency.contact_person_relation && this.patient.emergency.contact_person_relation.name ? this.patient.emergency.contact_person_relation.name : ''
		})
	}
	ssnFormat = (patient) => {
		let id = patient.id;
		id = String(id);
		let newstring = id;
		if (id.length < 10) {
			for (let i = id.length; i < 9; i++) {
				newstring = "0" + newstring
			}
		}
		newstring = newstring.substring(0, 3) + '-' + newstring.substring(4, 6) + '-' + newstring.substring(5, 9);
		this.patient.displaId = newstring;
	};


	submitNote() {
		let formData = this.formNote.getRawValue();
		let requestData = {
			"patient_personal":
				{ "id": this.patient.id, "first_name": this.patient.first_name, "middle_name": this.patient.middle_name, "last_name": this.patient.last_name, "gender": this.patient.gender, "dob": this.patient.dob, "ssn": this.patient.ssn, notes: formData.note },
			"patient_contact_info": { "id": this.patient.self.id, "home_phone": this.patient.self.home_phone, "work_phone": this.patient.self.work_phone, "cell_phone": this.patient.self.cell_phone, "email": this.patient.self.email, "mail_address": { "id": this.patient.self.contact_information.mail_address.id, "street": this.patient.self.contact_information.mail_address.street, "apartment": this.patient.self.contact_information.mail_address.apartment, "city": this.patient.self.contact_information.mail_address.city, "state": this.patient.self.contact_information.mail_address.state, "zip": this.patient.self.contact_information.mail_address.zip } }
		}
		this.subscription.push(
			this.requestService.sendRequest(PatientFormUrlsEnum.Patient_Update_PATCH, 'put', REQUEST_SERVERS.kios_api_path, { ...requestData })
				.subscribe(
					(res: any) => {
						if (res.statusCode == 200) {
							this.toastrService.success('Note information saved successfully', 'Success');
						}
					},
					(err) => {
						this.toastrService.error(err.error, 'Error');
					},
				),
		);
	}
	/**
	 * get patient case data
	 * Populate the table with new data based on the page number
	 * @param pageInfo 
	 */
	setPage(pageInfo) {

		this.loadSpin = true;
		let formData = this.form.getRawValue();
		this.page.pageNumber = pageInfo.offset;
		let pageNumber = this.page.pageNumber + 1;
		// formData.date_of_accident = formData.date_of_accident ? getDate(formData.date_of_accident) : '';
		let filters = removeEmptyAndNullsFormObject(formData);
		let queryParams = {
			filter: !isObjectEmpty(filters),
			pagination: 1,
			page: pageNumber,
			per_page: this.page.size,
			order_by: 'DESC',
			patient_id: this.patientId,
			all_listing:true
		};
		let requestData = { ...queryParams, ...filters };
		let per_page = this.page.size;
		let queryparam = { per_page, page: pageNumber }
		this.addUrlQueryParams({ ...filters, ...queryparam });
		this.requestService.sendRequest(CaseFlowUrlsEnum.GetCaseList, 'get', REQUEST_SERVERS.kios_api_path, requestData).subscribe(res => {
			if (res['status'] == 200) {
				this.cases = res['result'].data;
				this.page.totalElements = res['result'].total;
				this.page.totalPages = this.page.totalElements / this.page.size;
				this.loadSpin = false;
			}
		},
			(err) => {
				this.toastrService.error(err.error, 'Error');
				this.loadSpin = false;
			},
		);
	}

	addUrlQueryParams(params?) {
		this.location.replaceState(
			this.router.createUrlTree([], { queryParams: params, }).toString()
		);
	}
	/**
		 * after view init
		 */
	ngAfterViewInit() {
		this.form = this.component.form;
	}

	searchCaseType(name) {
		return new Observable((res) => {
			let caseid=this.form.value.case_type?this.form.value.case_type:null;
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


	searchEmployer(name){
		return new Observable((res) => {
			let employerid=this.form?.value?.employer_ids || null;

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
	getFullName(Array):any {
		return Array.map(res => {
			return {
				full_name: `${res?.first_name} ${res?.middle_name ? res?.middle_name : ''} ${res?.last_name}`,
				...res,
			}
		});
	}

	searchAttorney(name) {
		return new Observable((res) => {
			let firmId=this.form?.value?.attorney?this.form.value.attorney_ids:null;
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
					debugger;
					if (res && res.status===true){
						this.page.pageNumber=0;
						this.setPage({ offset: 0 });
						this.toastrService.success(res.message, 'Success');
						this.selection.clear();
						this.getPatient();
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

	stringfy(obj) {
		return JSON.stringify(obj);
	}

	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.cases.length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle(event) {
		this.isAllSelected()
			? this.selection.clear()
			: this.cases.forEach((row) => this.selection.select(row));
	}


	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
		// this.logger.log('patient-profile OnDestroy called');
	}
	public menu: any[] = [];
	public submenu: any[] = [];
	public ssubmenu: any[] = [];
	public submenu1: any[] = [];

	goToCaseDetail(id,row) {
		debugger;
		if (row && row.is_active){
		this.router.navigate([`front-desk/cases/edit/${id}/patient/patient_summary`]);
		}
		else {
			this.router.navigate(['front-desk/soft-patient/list'], {queryParams:{pagination: true,page:1,per_page:10,filter:true,order_by:'DESC',case_id:row.id,id:row.patient_id} }) 	
		}

	}
	childNavigation(id) {
		this.navigatToChild(true, '{id}', id, "Patient", "Case List")

	}
	addNewCase() {
		this.router.navigate(['/front-desk/cases/create/' + this.patientId])
	}
	showPharmacyOfPatient(data) {
		this.patientPharmacyDetail = data;
	}
	//=============================================================================================================================
	/**
	 * Sets configration of dynamic forms. 
	 */
	fieldConfig: FieldConfig[] = [];
	setConfigration() {
		this.fieldConfig = [
			new DivClass([
				new DivClass([
					new DivClass([
						new InputClass('Case No.', 'case_ids[]', InputTypes.number, '', [], '', ['col-sm-7 col-md-5 col-lg-4 col-xl-3']),
						new NgSelectClass("Case Type", 'case_type', 'name', 'id', this.searchCaseType.bind(this), true, null, [], '', ['col-sm-6 col-md-6 col-lg-4 col-xl-3'],[],{dropdownSearch: true},null,null,this.getCaseTypeOnOpen.bind(this,null,'clear'),this.getCaseTypeOnOpen.bind(this),this.searchCaseTypeScrollToEnd.bind(this),this.caseTypeSearchTypeHead$,this.searchTypeHeadCaseTypes.bind(this),this.eventsSubjectReset$),
						new NgSelectClass("Attorney", 'attorney_ids', 'full_name', 'id', this.searchAttorney.bind(this), true, null, [], '', ['col-sm-6 col-md-6 col-lg-4 col-xl-3'],[],{dropdownSearch: true},null,null,this.getAttorneyOnOpen.bind(this,null,'clear'),this.getAttorneyOnOpen.bind(this),this.searchAttorneyScrollToEnd.bind(this),this.searchAttorneyTypeHead$,this.searchAttorneyTypeHead.bind(this),this.resetTheNgSelectField$),
						new NgSelectClass("Employer Name", 'employer_ids', 'employer_name', 'id', this.searchEmployer.bind(this), true, null, [], '', ['col-sm-6 col-md-6 col-lg-4 col-xl-3'],[],{dropdownSearch: true},null,null,this.getEmployerOnOpen.bind(this,null,'clear'),this.getEmployerOnOpen.bind(this),this.searchEmployerScrollToEnd.bind(this),this.employerSearchTypeHead$,this.searchTypeHeadEmployer.bind(this),this.eventsSubjectReset$),
						new NgSelectClass("Firm's Name", 'firm_ids', 'name', 'id', this.searchFirm.bind(this), true, null, [], '', ['col-sm-7 col-md-5 col-lg-4 col-xl-3'],[],{add_tag: false},null,null,this.searchFirm.bind(this),this.onFocusSearchFirm.bind(this),this.searchFirmScrollToEnd.bind(this),null,null),
						new InputClass('Insurance', 'insurance_name', InputTypes.text, '', [], '', ['col-sm-7 col-md-5 col-lg-4 col-xl-3']),
						new InputClass('Date of Accident (mm/dd/yyyy)', 'date_of_accident', InputTypes.date, '', [], '', ['col-sm-7 col-md-5 col-lg-4 col-xl-3'], { max: new Date() }),
						new InputClass('Claim No.', 'claim_no', InputTypes.text, '', [], '', ['col-sm-7 col-md-5 col-lg-4 col-xl-3']),
						new NgSelectClass("Created By",'created_by_ids','first_name','id', this.searchCreatedBy.bind(this), true, null, [], '', ['col-sm-7 col-md-5 col-lg-4 col-xl-3'],[],{add_tag: false},null,null,this.searchCreatedBy.bind(this),this.onFocusSearchCreatedBy.bind(this),this.searchCratedByScrollToEnd.bind(this),null,null),
						new NgSelectClass("Updated By",'updated_by_ids','first_name','id', this.searchCreatedBy.bind(this), true, null, [], '', ['col-sm-7 col-md-5 col-lg-4 col-xl-3'],[],{add_tag: false},null,null,this.searchCreatedBy.bind(this),this.onFocusSearchCreatedBy.bind(this),this.searchCratedByScrollToEnd.bind(this),null,null),
						new InputClass('Created At (mm/dd/yyyy)', 'created_at', InputTypes.date, '', [], '', ['col-sm-7 col-md-5 col-lg-4 col-xl-3'], { max: new Date() }),
						new InputClass('Updated At (mm/dd/yyyy)', 'updated_at', InputTypes.date, '', [], '', ['col-sm-7 col-md-5 col-lg-4 col-xl-3'], { max: new Date() }),
						

					], ['row']),
				], ['col-lg-12 col-xl-10']),
				new DivClass([
					new DivClass([
						new ButtonClass('Filter', ['btn', 'btn-success w-100 float-right'], ButtonTypes.submit, null, { button_classes: ['col-5 col-sm-3 col-lg-2 col-xl-6'] }),
						new ButtonClass('Reset', ['btn', 'btn-primary w-100'], ButtonTypes.button, this.reset.bind(this), { button_classes: ['col-5 col-sm-3 col-lg-2 col-xl-6'],disabled:this.filterFormDisabled,name:'resetBtn'}),
					], ['row', 'justify-content-center mb-3 mb-xl-0'], '', '', { name: 'button-div' }),
				], ['col-lg-12 col-xl-2']),
			], ['row', 'dynamic-filter']),
		]
	}
	onPageChange(number) {

		this.page.pageNumber = number
		this.setPage({ offset: this.page.pageNumber })
	}

	searchFirmScrollToEnd()
	{
		return new Observable((res) => {
			if (this.firmPaginationSetting.currentPage < this.firmPaginationSetting.lastPage) {
				this.firmPaginationSetting.currentPage += 1;
				this.firmPaginationSetting.currentPage = this.firmPaginationSetting.currentPage;
				this.getFirm(this.firmPaginationSetting.search, '').subscribe(data => {
					this.firmPaginationSetting.currentPage = parseInt(data.result.current_page);
					this.firmPaginationSetting.lastPage = parseInt(data.result.last_page);
					let result = data['result']['data'];
					this.lstFirm = [...this.lstFirm, ...result];
					res.next(this.lstFirm);
					});
			}
		})		
	}

	getFirm(name?, firmid?,attorneyid?) {

		let order_by;
		let order;
		if(name)
		{
			order=OrderEnum.DEC	
		}
		else
		{
			order_by='count';
			order=OrderEnum.DEC	
		}

		let paramQuery: any = { filter: true, order: OrderEnum.DEC, pagination: 1,order_by:order_by,page:this.firmPaginationSetting.currentPage,per_page:this.firmPaginationSetting.per_page,dropDownFilter:true }
		paramQuery = removeEmptyKeysFromObject(paramQuery);
		let filter = {}
		firmid ? filter['id'] = firmid : null
		name ? filter['name'] = name : null
		// order_by ? filter['order_by'] = order_by : null
		return this.requestService.sendRequest(FirmUrlsEnum.AllFirms_list_GET, 'get', REQUEST_SERVERS.fd_api_url, { ...paramQuery, ...filter })
	}


	searchFirm(name) {

		return new Observable((res) => {
			if(!this.lstFirm.length)
			{
				this.resetFirmPagination();
				this.getFirm(name, '').subscribe(data => {
				this.firmPaginationSetting.currentPage = parseInt(data.result.current_page);
				this.firmPaginationSetting.lastPage = parseInt(data.result.last_page);
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

	resetFirmPagination() {
		this.firmPaginationSetting = {
		search:'',
		lastPage:null,
		currentPage:1,
		per_page:10
		}
	}

	onFocusSearchFirm(name) {
		return new Observable((res) => {
			if(!this.lstFirm.length)
			{
				this.resetFirmPagination();
				this.getFirm(name, '').subscribe(data => {
				this.firmPaginationSetting.currentPage = parseInt(data.result.current_page);
				this.firmPaginationSetting.lastPage = parseInt(data.result.last_page);
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

	getCreatedBy(name?, createdByid?) {

		let order_by;
		let order;
		if(name)
		{
			order=OrderEnum.DEC	
		}
		else
		{
			order_by='count';
			order=OrderEnum.DEC	
		}

		let paramQuery: any = { filter: true, order: OrderEnum.DEC, pagination: 1,order_by:order_by,page:this.CreatedByPaginationSetting.currentPage,per_page:this.CreatedByPaginationSetting.per_page,dropDownFilter:true }
		paramQuery = removeEmptyKeysFromObject(paramQuery);
		let filter = {}
		createdByid ? filter['id'] = createdByid : null
		name ? filter['name'] = name : null
		// order_by ? filter['order_by'] = order_by : null
		return this.requestService.sendRequest(EnumApiPath.createdByApiPath, 'get', REQUEST_SERVERS.fd_api_url, { ...paramQuery, ...filter })
	}


	searchCreatedBy(name) {

		return new Observable((res) => {
			if(!this.lstCreatedBy.length)
			{
				this.resetFirmPagination();
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

	resetCreatedByPagination() {
		this.CreatedByPaginationSetting = {
		search:'',
		lastPage:null,
		currentPage:1,
		per_page:10
		}
	}

	onFocusSearchCreatedBy(name) {
		return new Observable((res) => {
			if(!this.lstCreatedBy.length)
			{
				this.resetFirmPagination();
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


	goToErx() {
		this.router.navigate([`/front-desk/patients/profile/${this.patientId}/erx`])
	}

	patientEmit(e?) {
		this.refresh.next(true);
		for (let i = 0;e && i < this.tabset.tabs.length; i++) {
			if (this.tabset.tabs[i].id == e) {
				this.tabset.tabs[i].active = true;
			} else{
				this.tabset.tabs[i].active = false;
			}
		}
	}

	editCaseStatus(caseStatusModal,row){
		debugger;
		this.currentCase = row; 
		this.caseUpdateForm.patchValue({
			status_id:  null
		});
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'overflow_unset body-scroll',
		};
		this.modalService.open(caseStatusModal, ngbModalOptions);
		

	}

	selectionOnValueChange($event){
		debugger;
		this.caseUpdateForm.patchValue({
			status_id:  $event.formValue
		});
	}

	updateCaseStatus(){
		debugger;
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
					this.page.pageNumber = 1;
					this.setPage({ offset: 0 });
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
	
	public addSoftCase() {
		
		const activeModal = this.softPatientModal.open(SoftPatientVisitComponentModal, { backdrop: 'static',
		keyboard: false, windowClass:'modal-width-xl' });
		activeModal.componentInstance.addSoftPatientProviderCalandar=false;
		this.softPatientService.addSoftPatientProviderCalandar=false;
		this.softPatientService.pushAddNewSoftPatientThroughPatientProfile(this.patient.id)
		activeModal.result.then(res=>{
			this.setPage({ offset: 0 });
		})
	  }
	  close(){
		this.modalService.dismissAll();
	}
	  viewPatientAllergies()
	  {
		this.allPage.pageNumber = 0;
		this.getPatientAllergies();
		this.modalService.open(this.allergiesModal, { 
			windowClass : "myCustomModalClass",
			size: 'xl',
			backdrop: 'static',
			keyboard: false });
	  }
	  getPatientAllergies(pageInfo?)
	  {
		if (pageInfo) {
			this.allPage.pageNumber = pageInfo.offset;
		}
		let pageNumber = this.allPage && this.allPage.pageNumber + 1;
		let queryParams = {
			patient_id:this.patientId,
			per_page: (this.allPage && this.allPage.size )|| 10,
			page: pageNumber,
			pagination: true,
      

		};
		this.requestService.sendRequest(PatientListingUrlsEnum.Patient_Allergies, 'get', REQUEST_SERVERS.kios_api_path,queryParams).subscribe(res => {
				this.patAllergies=res&&res.result&&res.result.data&&res.result.data.docs;
				this.alltotal=res&&res.result&&res.result.data&&res.result.data.total;
				
				this.patAllergies.length && this.patAllergies.forEach((value:any,index:any)=>{
					let reactions=[]
					value&&value.reactions&&value.reactions.forEach((element:any,index:any)=>{
						reactions.push(element.reaction.name);
					}
					)
					this.patAllergies[index].reactions && delete this.patAllergies[index].reactions;
					this.patAllergies[index]['reactions']=reactions.join(', ');
				})
			})
	}

	allPageLimit($num) {
		this.allPage.size = Number($num);
		this.getPatientAllergies({ offset: 0 });
	}
}
