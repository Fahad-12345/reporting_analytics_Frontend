import { SpecialityUrlsEnum } from './../../masters/providers/speciality/speciality.enum';
import { Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { EorBillUrlsEnum } from '@appDir/eor/eor-bill.url.enum';
import { UserByModel } from '@appDir/eor/Models/user-by-model';
import { EORService } from '@appDir/eor/shared/eor.service';
import { AttorneyUrlsEnum } from '@appDir/front-desk/masters/billing/attorney-master/attorney/Attorney-Urls-enum';
import { BillingStatusUrlsEnum } from '@appDir/front-desk/masters/billing/Billing-Status-Urls.Enum';
import { InsuranceUrlsEnum } from '@appDir/front-desk/masters/billing/insurance-master/Insurance/insurance-list/Insurance-Urls-enum';
import { UsersUrlsEnum } from '@appDir/front-desk/masters/master-users/users/users-urls.enum';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { MappingFilterObject } from '@appDir/shared/filter/model/mapping-filter-object';
import { AclService } from '@appDir/shared/services/acl.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { changeDateFormat, isEmptyObject, makeSingleNameFormFIrstMiddleAndLastNames, removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
import { Subscription } from 'rxjs';
import { EnumApiPath, EnumSearch, SearchedKeys } from '../Models/searchedKeys-modal';
import { ShareAbleFilter } from '@appDir/shared/models/share-able-filter';
import { Subject } from 'rxjs';
import { BillingService } from '../service/billing.service';

@Component({
	selector: 'app-billisting-filter',
	templateUrl: './billisting-filter.component.html',
	styleUrls: ['./billisting-filter.component.scss'],
})
export class BillistingFilterComponent extends PermissionComponent implements OnInit, OnChanges {
	searchedKeys = new SearchedKeys();
	@Input() adminBilling: boolean = false;
	@Output() filterData = new EventEmitter();
	@Output() resetSelectedRecord= new EventEmitter();
	@Input() formFiledValue = {};
	@Input() formFiledListOfValue = {};
	@Input() caseId: number;
	searchForm: FormGroup;
	isCollapsed = false;
	bill_ids: any[] = [];
	subscription: Subscription[] = [];
	lstInsurance: any[] = [];
	lstspecalities: any = [];
	lstAttorney: any = [];
	lstUser: any = [];
	lstBillstate: any = [];
	billStatusloading = false;
	billStatusCurrentPage : number = 1;
	billStatusLastPage: number = 1;
	caseIds: any = [];
	denialStatusList: any[] = [];
	denialTypeList:any[] = [];
	eorStatusList: any[] = [];
	verificationStatusList: any[] = [];
	paymentStatusList: any[] = [];
	providerList: any[] = [];
	caseTypeLists: any[] = [];
	patientNameLists: any[] = [];
	payerIdLists: any[] = [];
	patientIdLists: any[] = [];
	DATEFORMAT = EorBillUrlsEnum.DATE_FORMAT;
	min: Date= new Date('1900/01/01');
	lstpractiseLocation: any[] = [];
	dateRangeValidator: any[] = [
		Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
		Validators.maxLength(10),
	];
	customCurrencyMaskConfig = {
		align: 'left',
		allowNegative: false,
		allowZero: true,
		decimal: '.',
		precision: 2,
		prefix: '',
		suffix: '',
		thousands: ',',
		nullable: true,
	};
	selectedMultipleFieldFiter: any = {
		speciality_ids: [],
		facility_ids: [],
		bill_ids: [],
		case_ids: [],
		patient_ids: [],
		denial_type_ids:[],
		pom_ids: [],
		packet_ids: [],
		case_type_ids: [],
		appointment_type_ids: [],
		job_status: [],
		created_by_ids: [],
		bill_recipient_type_ids: [],
		firm_ids:[],
		attorney_ids:[],
		doctor_ids: [],
		insurance_ids: [],
		patient_name:[], 
		payer_ids:[],
		clearing_house_ids:[],
		bill_type_ids:[],
		ebill_status_ids:[]
	};
	EnumApiPath = EnumApiPath;
	eventsSubject: Subject<any> = new Subject<any>();
	requestServerpath = REQUEST_SERVERS;
	@Input() receivedData: any;
	constructor(
		private fb: FormBuilder,
		public eorService: EORService,
		protected requestService: RequestService,
		public aclService: AclService,
		private _route: ActivatedRoute,
		private _router: Router,
		titleService: Title,
		private billingService:BillingService
	) {
		super(aclService, _router, _route, requestService, titleService);
	}

	ngOnInit() {
		this.searchForm = this.initializeSearchForm();
		this.updateDateFields();
		this.valueAssignInListOfFieldArray(this.formFiledListOfValue);
		this.searchForm.patchValue(this.formFiledValue);
		this.getBillstate();
		// this.getCaseTypeList();	
	
	
		this.eorService.pullBillFilterFormReset().subscribe(status => {
			if(status){
				this.searchForm = this.initializeSearchForm();
				this.searchForm.reset();
			}
		});
	}

	ngOnChanges() {
		this.updateDateFields();
	}


	updateDateFields(): void {
		if(this.receivedData){
			this.searchForm?.patchValue({
			  bill_date_range1: this.searchForm?.get('bill_date_range1')?.value ? this.searchForm?.get('bill_date_range1')?.value : this.receivedData?.get('bill_date_range1')?.value,
			  bill_date_range2: this.searchForm?.get('bill_date_range2')?.value ? this.searchForm?.get('bill_date_range2')?.value : this.receivedData?.get('bill_date_range2')?.value,
			});
		}
	}

	/**
	 * Initialize 'case status' search form
	 * @param void
	 * @returns FormGroup
	 */
	initializeSearchForm(): FormGroup {
		return this.fb.group({
			// case_id: [null],
			provider_ids: [null],
			denial_status_ids: [null],
			denial_type_ids:[null],
			eor_status_ids: [null],
			verification_status_ids: [null],
			payment_status_ids: [null],
			bill_amount_from: [null],
			bill_amount_to: [null],
			bill_ids: null,
			case_ids: [null],
			doctor_ids: [null],
			bill_date_range1: [
				null,
				this.dateRangeValidator,
			],
			bill_date_range2:  [
				null,
				this.dateRangeValidator,
			],
			date_of_accident_from: [
				null,
				this.dateRangeValidator,
			],
			updated_at: [
				null,
				this.dateRangeValidator,
			],
			created_at: [
				null,
				this.dateRangeValidator,
			],
			
			date_of_accident_to: [
				null,
				this.dateRangeValidator,
			],
			speciality_ids: [null],
			insurance_ids: [null],
			claim_no: [null],
			firm_ids: [null],
			attorney_ids: [null],
			bill_amount: [null],
			bill_status_ids: [null],
			created_by_ids: [null],
			updated_by_ids: [null],
			patient_ids: [null],
			patient_name: [null],
			name: [null],
			case_type_ids: [null],
			appointment_type_ids: [null],
			facility_ids: [null],
			bill_recipient_type_ids: [null],
			visit_date_range_1: [
				null,
				this.dateRangeValidator,
			],
			visit_date_range_2: [
				null,
				this.dateRangeValidator,
			],
			clearing_house_ids:[null],
			payer_ids:[null],
			bill_type_ids:[null],
		    ebill_status_ids:[null]
		});
	}

	getFieldAction(status: boolean, name: string) {
		this.eorService.updateFilterField(status, name);
	}
	get getConditionalCaseIds(){
		return {case_ids:[this.caseId]}
	}
	get getOrderBy(){
		return {order_by:OrderEnum.ASC}
	}
	/**
	 *
	 *  intellisense for Bills Id
	 */
	/**
	BELOW UN USED CODE
	 */
	searchBill(event?:any,page?,paginationType = 'search') {
		if (event) {
			const value = event;
			this.searchedKeys.BillId.searchKey = value;
			this.searchedKeys.BillId.page = page;
		let body = {
			page: page || 1,
		}
			this.eorService.searchBillIds(value,body).subscribe((t) => {
				this.bill_ids = [...t['result']['data']];
			});
		}
	}
	/**
	BELOW UN USED CODE
	 */
	getMoreBillIds() {
		// console.log(this.searchedKeys);
		// this.searchBill(this.searchedKeys.BillId.searchKey,this.searchedKeys.BillId.page + this.searchedKeys.page,'scroll');
	}
	/**
	 * intelecience for search Case
	 * @param event
	 */
	/**
	BELOW UN USED CODE
	*/
	searchPatientName(event?:any,page?, search?: string,paginationType = 'search') {
		debugger;
		if (search === 'patientName') {
			const value = event;
			if (value.length >=3) {
				this.searchedKeys.patientName.searchKey = value;
				this.searchedKeys.patientName.page = page;
				let body = {
					page: page || 1,
				}
				const query = {
					filter: true,
					name: value,
				};
				this.eorService.searchPatientName(query,body).subscribe((data) => {
					if (data['status']) {
						const result = [...data['result']['data']];
						this.patientNameLists = result.map((t) => {
							return new UserByModel(t);
						});
					}
				});
			}
		} else {
			const value = event;
			if (value.length >=3) {
				this.searchedKeys.patientName.searchKey = value;
				this.searchedKeys.patientName.page = page;
				let body = {
					page: page || 10,
				}
				const query = {
					filter: true,
					id: value,
				};
				this.eorService.searchPatientName(query,body).subscribe((data) => {
					if (data['status']) {
						const result = [...data['result']['data']];
						this.patientIdLists = result;
					}
				});
			}
		}
	}
	/**
	BELOW UN USED CODE
	*/
	getMorePatients() {
		// this.searchPatientName(this.searchedKeys.patientName.searchKey,this.searchedKeys.patientName.page + this.searchedKeys.page, 'patientName','scroll');
	}
	/**
	BELOW UN USED CODE
	*/
	getMoreSpeciality() {
		if(this.searchedKeys.specialityName.page != this.searchedKeys.specialityName.lastPage) { 
			this.getSpeciality(this.searchedKeys.specialityName.searchKey,this.searchedKeys.specialityName.page + this.searchedKeys.page, 'scroll');
		}
	}
	/**
	BELOW UN USED CODE
	*/
	getMoreSpecialityOpen() {
		if(this.lstspecalities.length == 0) {
			this.getSpeciality('',this.searchedKeys.page, EnumSearch.InitSearch);
		}
	}

	/**
	 *
	 *  intellisense for practice location
	 */
	/**
	BELOW UN USED CODE
	*/
	searchPractice(event='',page = 1,paginationType = 'search') {
			this.searchedKeys.practiceLocation.searchKey = event;
			this.searchedKeys.practiceLocation.page = page;
			let body = {
				page: page || 1,
				name : event
			}
			if(event.length > this.searchedKeys.minChar || paginationType == EnumSearch.InitSearch || paginationType == EnumSearch.ScrollSearch) {
			this.eorService.searchOfPractice(body).subscribe((data) => {
				if(paginationType == 'search') {
					this.lstpractiseLocation = [];
					this.searchedKeys.practiceLocation.lastPage = this.searchedKeys.last_page;
				}
				let result =  [...data['result']['data']];
				this.searchedKeys.practiceLocation.lastPage = data.result.last_page;
				this.lstpractiseLocation = [...this.lstpractiseLocation,...result];
			});
		}
	}
	/**
	BELOW UN USED CODE
	*/
	getMorePractices() {
		if(this.searchedKeys.practiceLocation.page != this.searchedKeys.practiceLocation.lastPage) { 
			this.searchPractice(this.searchedKeys.practiceLocation.searchKey,this.searchedKeys.practiceLocation.page + this.searchedKeys.page,'scroll');
		}
	}
	/**
	BELOW UN USED CODE
	*/
	getMorePracticesOpen() {
		if(this.lstpractiseLocation.length == 0) { 
			this.searchPractice('',this.searchedKeys.page, EnumSearch.InitSearch);
		}
	}

	/**
	 * intelecience for search
	 * @param event
	 */
	/**
	BELOW UN USED CODE
	*/
	getInsurance(event?:any,page?,paginationType = 'search') {
		this.searchedKeys.InsuranceName.searchKey = event;
		this.searchedKeys.InsuranceName.page = page;
		let paramQuery: any = {
			// order: OrderEnum.ASC,
			pagination: true,
			filter: false,
			page: page || 1,
			per_page: 10,
			order_by: 'insurance_name',
		};
		this.requestService
			.sendRequest(InsuranceUrlsEnum.Insurance_list_GET, 'GET', REQUEST_SERVERS.billing_api_url, {
				...paramQuery,
				...{ insurance_name: event },
			})
			.subscribe((data) => {
				this.lstInsurance =
					data && data['result'] && data['result']['data'] ? data['result']['data'] : [];
			});
	}
	/**
	BELOW UN USED CODE
	*/
	getMoreInsurances() {
		// this.getInsurance(this.searchedKeys.InsuranceName.searchKey,this.searchedKeys.InsuranceName.page + this.searchedKeys.page, 'scroll');
	}

	/**
	 * intelecience for search
	 * @param event
	 */
	/**
	BELOW UN USED CODE
	*/
	getAttorney(event?:any,page?,paginationType = 'search') {
		this.searchedKeys.attorneyName.searchKey = event;
		this.searchedKeys.attorneyName.page = page;
		let paramQuery: ParamQuery = {
			order: OrderEnum.ASC,
			pagination: true,
			filter: false,
			page: page || 1,
			per_page: 1,
		};
		this.requestService
			.sendRequest(AttorneyUrlsEnum.attorney_list_GET, 'GET', REQUEST_SERVERS.fd_api_url, {
				...paramQuery,
				...{ insurance_name: event },
			})
			.subscribe((data) => {
				this.lstAttorney =
					data && data['result'] && data['result']['data']
						? data['result']['data'].map((res) => {
								return {
									id: res.id,
									name: makeSingleNameFormFIrstMiddleAndLastNames(
										[res.first_name, res.middle_name, res.last_name],
										' ',
									),
								};
						  })
						: [];
			});
	}
	/**
	BELOW UN USED CODE
	*/
	getMoreAttorney() {
		// this.getAttorney(this.searchedKeys.attorneyName.searchKey,this.searchedKeys.attorneyName.page + this.searchedKeys.page, 'scroll');
	}

	/**
	 * intelecience for search Provider
	 * @param event
	 */
	/**
	BELOW UN USED CODE
	*/
	searchProvider(event?:any,page?,paginationType = 'search') {
		if (event) {
			this.searchedKeys.searchProvider.searchKey = event;
			this.searchedKeys.searchProvider.page = page;
			let body = {
				page: page || 1,
			}
			this.eorService.getProvider(event,undefined,body).subscribe((data) => {
				this.providerList = data['result']['data'];
				this.providerList = this.providerList.map((res) => {
					let name = this.eorService.makeSingleNameFormFIrstMiddleAndLastNames(
						[res.first_name, res.middle_name, res.last_name],
						' ',
					);
					return {
						id: res.id,
						name: name,
					};
				});
				this.providerList = [...this.providerList];
			});
		}
	}
	/**
	BELOW UN USED CODE
	*/
	getMoreSearchProvider() {
		// this.searchProvider(this.searchedKeys.searchProvider.searchKey,this.searchedKeys.searchProvider.page + this.searchedKeys.page,'scroll');
	}

	/**
	 * intelecience for search Denial Status
	 * @param event
	 */
	/**
	BELOW UN USED CODE
	*/
	searchDenialStatus(event?:any,page?,paginationType = 'search') {
		if (event) {
			this.searchedKeys.denialStatus.searchKey = event;
			this.searchedKeys.denialStatus.page = page;
			let body = {
				page: page || 1,
			}
			this.eorService.searchDenialStatus(event,body).subscribe((data) => {
				if (data['status']) {
					this.denialStatusList = [...data['result']['data']];
				}
			});
		}
	}
	/**
	BELOW UN USED CODE
	*/
	getMoreDenialStatus() {
		// this.searchDenialStatus(this.searchedKeys.denialStatus.searchKey,this.searchedKeys.denialStatus.page + this.searchedKeys.page,'scroll');
	}
	/**
	 * intelecience for search Eor Status
	 * @param event
	 */
	/**
	BELOW UN USED CODE
	*/
	searchEorStatus(event?:any,page?,paginationType = 'search') {
		if (event) {
			this.searchedKeys.eorStatus.searchKey = event;
			this.searchedKeys.eorStatus.page = page;
			let body = {
				page: page || 1,
			}
			this.eorService.searchEorStatus(event,body).subscribe((data) => {
				if (data['status']) {
					this.eorStatusList = [...data['result']['data']];
				}
			});
		}
	}
	/**
	BELOW UN USED CODE
	*/
	getMoreEorStatus() {
		// this.searchEorStatus(this.searchedKeys.eorStatus.searchKey,this.searchedKeys.eorStatus.page + this.searchedKeys.page,'scroll');
	}

	/**
	 * intelecience for search Provider
	 * @param event
	 */
	/**
	BELOW UN USED CODE
	*/
	searchVerificationStatus(event?:any,page?,paginationType = 'search') {
		if (event) {
			this.searchedKeys.verificationStatus.searchKey = event;
			this.searchedKeys.verificationStatus.page = page;
			let body = {
				page: page || 1,
			}
			this.eorService.getVerificationStatus(event,body).subscribe((data) => {
				if (data['status']) {
					this.verificationStatusList = [...data['result']['data']];
				}
			});
		}
	}
	/**
	BELOW UN USED CODE
	*/
	getMoreVerificationStatus() {
		// this.searchVerificationStatus(this.searchedKeys.verificationStatus.searchKey,this.searchedKeys.verificationStatus.page + this.searchedKeys.page,'scroll');
	}

	/**
	 * intelecience for search Payment Status
	 * @param event
	 */
	/**
	BELOW UN USED CODE
	*/
	searchPaymentStatus(event?:any,page?,paginationType = 'search') {
		if (event) {
			this.searchedKeys.paymentStatus.searchKey = event;
			this.searchedKeys.paymentStatus.page = page;
			let body = {
				page: page || 10,
			}
			this.eorService.searchPaymentStatus(event,body).subscribe((data) => {
				if (data['status']) {
					this.paymentStatusList = [...data['result']['data']];
				}
			});
		}
	}
	/**
	BELOW UN USED CODE
	*/
	getMorePaymentStatus() {
		// this.searchPaymentStatus(this.searchedKeys.paymentStatus.searchKey,this.searchedKeys.paymentStatus.page + this.searchedKeys.page,'scroll');
	}

	/**
	 * intelecience for search
	 * @param event
	 */
	/**
	BELOW UN USED CODE
	*/
	getUser(event?:any,page?,paginationType = 'search') {
		this.searchedKeys.createdBy.searchKey = event;
		this.searchedKeys.createdBy.page = page;
		let paramQuery: ParamQuery = {
			order: OrderEnum.ASC,
			pagination: true,
			filter: false,
			page: page || 1,
			per_page: 10,
		};
		this.requestService
			.sendRequest(UsersUrlsEnum.UserListing_list_GET, 'GET', REQUEST_SERVERS.fd_api_url, {
				...paramQuery,
				...{ name: event },
			})
			.subscribe((data) => {
				this.lstUser =
					data && data['result'] && data['result']['data']
						? data['result']['data'].map((res) => {
								return {
									id: res.id,
									name: makeSingleNameFormFIrstMiddleAndLastNames(
										[res.first_name, res.middle_name, res.last_name],
										' ',
									),
								};
						  })
						: [];
			});
	}
	/**
	BELOW UN USED CODE
	*/
	getMoreCreatedBy() {
		// this.getUser(this.searchedKeys.createdBy.searchKey,this.searchedKeys.createdBy.page + this.searchedKeys.page,'scroll');
	}
	/**
	BELOW UN USED CODE
	*/
	getMoreUpdatedBy() {
		// this.getUser(this.searchedKeys.createdBy.searchKey,this.searchedKeys.createdBy.page + this.searchedKeys.page,'scroll');
	}

	/**
	 * intelecience for search
	 * @param event
	 */
	getBillstate(event?) {
		this.billStatusloading = true;
		let paramQuery: ParamQuery = {
			order: OrderEnum.ASC,
			pagination: true,
			filter: false,
			per_page: 10,
			page: this.billStatusCurrentPage,
		};
		this.requestService
			.sendRequest(
				BillingStatusUrlsEnum.BillingStatus_list_GET,
				'GET',
				REQUEST_SERVERS.fd_api_url,
				paramQuery,
			)
			.subscribe((data) => {
				const d = data && data['result'] && data['result']['data'] ? data['result']['data'] : [];
				this.lstBillstate = [...this.lstBillstate, ...d];
				this.billStatusLastPage = data['result'].last_page;
				this.billStatusloading = false;
			});
	}

	getCaseTypeList() {
		this.eorService.getAllSensationsOfCaseType().subscribe((res) => {
			debugger;
			if (res['status'] == 200 && this.eorService.hasCaseType()) {
				this.caseTypeLists =
					res['result'] && res['result'].data && res['result'].data.type
						? res['result'].data.type
						: [];
				this.eorService.setCaseType(this.caseTypeLists);
			}else{
				this.caseTypeLists = res;
			}
		});
	}
	/**
	BELOW UN USED CODE
	*/
	getSpeciality(event='',page = 1,paginationType = 'search') {
		let paramQuery: ParamQuery = {
			order: OrderEnum.ASC,
			pagination: true,
			filter: false,
			page: page || 1,
			per_page: 10,
		};
		let NewparamQuery = removeEmptyAndNullsFormObject({ ...paramQuery, ...{ name: event } });
		this.searchedKeys.specialityName.searchKey = event;
		this.searchedKeys.specialityName.page = page;
		if(event.length == this.searchedKeys.minChar || paginationType == EnumSearch.InitSearch || paginationType == EnumSearch.ScrollSearch) {
		return this.requestService.sendRequest(
			SpecialityUrlsEnum.Speciality_list_Get,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			 ...NewparamQuery,
		).subscribe(data=>{
			if(paginationType == 'search') {
				this.lstspecalities = [];
				this.searchedKeys.specialityName.lastPage = this.searchedKeys.last_page;
			}
			let result =
			data && data['result'] && data['result']['data'] ? data['result']['data'] : [];
			this.searchedKeys.specialityName.lastPage = data.result.last_page;
			this.lstspecalities = [...this.lstspecalities,...result];
		});
	}
	}
	setpage() {
		// this.filterData.emit(this.searchForm.value);
		const formData = this.searchForm.value;
		formData['speciality_ids'] = formData['speciality_ids'] ?  JSON.stringify(this.selectedMultipleFieldFiter.speciality_ids): formData['speciality_ids'];
		formData['job_status'] = formData['job_status'] ? JSON.stringify(this.selectedMultipleFieldFiter.job_status): formData['job_status'];
		formData['created_by_ids'] = formData['created_by_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.created_by_ids): formData['created_by_ids'];
		formData['updated_by_ids'] = formData['updated_by_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.updated_by_ids): formData['updated_by_ids'];
		formData['facility_ids'] = formData['facility_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.facility_ids): formData['facility_ids'];
		formData['bill_ids'] = formData['bill_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.bill_ids): formData['bill_ids'];
		formData['case_ids'] = formData['case_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.case_ids): formData['case_ids'];
		formData['doctor_ids'] = formData['doctor_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.doctor_ids) : formData['doctor_ids'];
		formData['insurance_ids'] = formData['insurance_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.insurance_ids) : formData['insurance_ids'];
		formData['firm_ids'] = formData['firm_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.firm_ids) : formData['firm_ids'];
		formData['attorney_ids'] = formData['attorney_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.attorney_ids) : formData['attorney_ids'];
		formData['denial_status_ids'] = formData['denial_status_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.denial_status_ids) : formData['denial_status_ids'];
		formData['denial_type_ids'] = formData['denial_type_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.denial_type_ids) : formData['denial_type_ids'];
		formData['eor_status_ids'] = formData['eor_status_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.eor_status_ids) : formData['eor_status_ids'];
		formData['verification_status_ids'] = formData['verification_status_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.verification_status_ids): formData['verification_status_ids'];
		formData['payment_status_ids'] = formData['payment_status_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.payment_status_ids): formData['payment_status_ids'];
		formData['patient_ids'] = formData['patient_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.patient_ids): formData['patient_ids'];
		formData['clearing_house_ids'] = formData['clearing_house_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.clearing_house_ids): formData['clearing_house_ids'];
		formData['payer_ids'] = formData['payer_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.payer_ids): formData['payer_ids'];
		formData['bill_type_ids'] = formData['bill_type_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.bill_type_ids): formData['bill_type_ids'];
		formData['ebill_status_ids'] = formData['ebill_status_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.ebill_status_ids): formData['ebill_status_ids'];
		this.filterData.emit(this.filterResponse(formData));
	}

	resetCase() {
		this.billingService.getBills([]);
		this.searchForm = this.initializeSearchForm();
		this.updateDateFields();
		this.eventsSubject.next(true);
		this.resetSelectedRecord.emit(true);
		this.setpage();
	}

	valueAssignInListOfFieldArray(values: object = {}) {
		this.selectedMultipleFieldFiter['speciality_ids'] = values['speciality_ids'];
		this.lstspecalities = values['speciality_ids'];
		this.lstUser = values['created_by_ids'];
		this.selectedMultipleFieldFiter['created_by_ids'] = values['created_by_ids'];
		this.selectedMultipleFieldFiter['updated_by_ids'] = values['updated_by_ids'];
        this.lstpractiseLocation = values['facility_ids'];
		this.selectedMultipleFieldFiter['facility_ids'] = values['facility_ids'];
		this.bill_ids = values['bill_ids'];
		this.selectedMultipleFieldFiter['bill_ids'] = values['bill_ids'];
		this.selectedMultipleFieldFiter['case_ids'] = values['case_ids'];
		this.providerList = values['doctor_ids'];
		this.selectedMultipleFieldFiter['doctor_ids'] = values['doctor_ids'];
		this.lstInsurance = values['insurance_ids'];
		this.selectedMultipleFieldFiter['insurance_ids'] = values['insurance_ids'];
		this.lstAttorney = values['firm_ids'];
		this.selectedMultipleFieldFiter['firm_ids'] = values['firm_ids'];
		this.selectedMultipleFieldFiter['attorney_ids'] = values['attorney_ids'];
		this.denialStatusList = values['denial_status_ids'];
		this.selectedMultipleFieldFiter['denial_status_ids'] = values['denial_status_ids'];
		this.denialStatusList = values['denial_type_ids'];
		this.selectedMultipleFieldFiter['denial_type_ids'] = values['denial_type_ids'];
		this.eorStatusList = values['eor_status_ids'];
		this.selectedMultipleFieldFiter['eor_status_ids'] = values['eor_status_ids'];
		this.denialStatusList = values['denial_status_ids'];
		this.selectedMultipleFieldFiter['denial_status_ids'] = values['denial_status_ids'];
		this.verificationStatusList = values['verification_status_ids'];
		this.selectedMultipleFieldFiter['verification_status_ids'] = values['verification_status_ids'];
		this.paymentStatusList = values['payment_status_ids'];
		this.selectedMultipleFieldFiter['payment_status_ids'] = values['payment_status_ids'];
		this.patientNameLists = values['patient_ids'];
		this.selectedMultipleFieldFiter['patient_ids'] = values['patient_ids'];
		this.selectedMultipleFieldFiter['clearing_house_ids'] = values['clearing_house_ids'];
		this.payerIdLists = values['payer_ids'];
		this.selectedMultipleFieldFiter['payer_ids'] = values['payer_ids'];
		this.selectedMultipleFieldFiter['ebill_status_ids'] = values['ebill_status_ids'];
		this.selectedMultipleFieldFiter['bill_type_ids'] = values['bill_type_ids'];
	}

	getChange($event: any[], fieldName: string) {
		if($event) {
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

	filterResponse(filterFormData: any) {
		const filters = removeEmptyAndNullsFormObject(filterFormData);
		if (filters.bill_date_range1) {
			filters.bill_date_range1 = changeDateFormat(filters.bill_date_range1);
		}
		if (filters.bill_date_range2) {
			filters.bill_date_range2 = changeDateFormat(filters.bill_date_range2);
		}
		if (filters.date_of_accident_from) {
			filters.date_of_accident_from = changeDateFormat(filters.date_of_accident_from);
		}
		if (filters.date_of_accident_to) {
			filters.date_of_accident_to = changeDateFormat(filters.date_of_accident_to);
		}
		if (filters.visit_date_range_1) {
			filters.visit_date_range_1 = changeDateFormat(filters.visit_date_range_1);
		}
		if (filters.visit_date_range_2) {
			filters.visit_date_range_2 = changeDateFormat(filters.visit_date_range_2);
		}
		if (filters.scan_upload_date) {
			filters.scan_upload_date = changeDateFormat(filters.scan_upload_date);
		}
		if (filters.pom_date) {
			filters.pom_date = changeDateFormat(filters.pom_date);
		}
		if (filters.created_at) {
			filters.created_at = changeDateFormat(filters.created_at);
		}
		if (filters.updated_at) {
			filters.updated_at = changeDateFormat(filters.updated_at);
		}
		return filters;
	}
	selectionOnValueChange(e: any,Type?) {
		const info = new ShareAbleFilter(e);
		this.searchForm.patchValue(removeEmptyAndNullsFormObject(info));
		this.getChange(e.data, e.label);
		if(!e.data) {
			this.searchForm.controls[Type].setValue(null);
		}
	}
	ngSelectClear(Type?) {
		this.searchForm.controls[Type].setValue(null);
	}
	checkInputs() {
		if (isEmptyObject(this.searchForm.value)) {
			return true;
		  }
		  return false;
	}

	billStatusOnScroll({ end }){
		if (this.billStatusloading  || this.billStatusCurrentPage > this.billStatusLastPage) {
             return;
        }
        if (end  >= this.lstBillstate.length) {
        	this.billStatusfetchMore();    
		}
	}

	billStatusOnScrollToEnd(){
		this.billStatusfetchMore();
	}

	private billStatusfetchMore() {
		++this.billStatusCurrentPage;
		this.getBillstate();
    }

}
