import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { EorBillUrlsEnum } from '@appDir/eor/eor-bill.url.enum';
import { IUser, UserByModel } from '@appDir/eor/Models/user-by-model';
import { EnumApiPath, EnumSearch, SearchedKeys } from '@appDir/front-desk/billing/Models/searchedKeys-modal';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { MappingFilterObject } from '@appDir/shared/filter/model/mapping-filter-object';
import { ShareAbleFilter } from '@appDir/shared/models/share-able-filter';
import { changeDateFormat, isEmptyObject, removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
import { Subject } from 'rxjs';
import { EORService } from '../eor.service';
import { ToastrService } from 'ngx-toastr';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';


@Component({
	selector: 'app-bill-filter',
	templateUrl: './eor-filter.component.html',
	styleUrls: ['./eor-filter.component.scss'],
})
export class EorFilterComponent implements OnInit{
	searchedKeys:SearchedKeys = new SearchedKeys();
	@Input() field: string;
	@Input() adminBilling: boolean = false;
	@Input() formFiledValue = {};
	@Input() formFiledListOfValue = {};
	@Input() caseId: number;
	selectedItemDisplay='';
	lstspecalities: any = [];
	lstProvider: any = [];
	lstpractiseLocation: any[] = [];
	eorTypeData: any[] = [];
	listOfUserCreatedBy: IUser[] = [];
	listOfUserUpdatedBy: IUser[] = [];
	listOfDenialTypes: any[] = [];
	bill_ids: any[] = [];
	created_at: any[] = [];
	updated_at: any[] = [];
	paymentList: any[] = [];
	paymentTypeList: any[] = [];
	actionTypeList: any[] = [];
	paidByList: any[] = [];
	verificationTypeData: any[] = [];
	appealStatusData: any[] = [];
	verificationStatusData: any[] = [];
	caseIds: any[] = [];
	searchForm: FormGroup;
	isCollapsed = false;
	caseTypeLists: any[]=[];
	min= new Date('1900/01/01');
	EOR = EorBillUrlsEnum.EOR;
	DENIAL = EorBillUrlsEnum.DENIAL;
	PAYMENT = EorBillUrlsEnum.PAYMENT;
	VERIFICATION = EorBillUrlsEnum.VERIFICATION;
	INVOICE = EorBillUrlsEnum.INVOICE
	DATEFORMAT = EorBillUrlsEnum.DATE_FORMAT;
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
	lstInsurance: any = [];
	lstAttorney: any = [];
	lstBillStatus: any = [];
	paymentStatusList: any =[];
	denialStatusList: any = [];
	eorStatusList: any = [];
	patientNameLists:any= [];
	patientIdLists:any =[];
	selectedMultipleFieldFiter: any = {
		'invoice_ids':[],
		'speciality_ids': [],
		'facility_ids':[],
		'bill_ids': [],
		'case_ids': [],
		'patient_ids': [],
		'pom_ids': [],
		'packet_ids': [],
		'case_type_ids': [],
		'job_status': [],
		'created_by_ids': [],
		'updated_by_ids': [],
		'bill_recipient_type_ids': [],
		'doctor_ids':[],	
		'denial_type_ids':[],
		'action_type_ids':[],
		'type_ids':[],
		'by_ids':[],
		'verification_type_ids':[],
		'patient_name_ids':[],
		'attorney_ids':[],
		'firm_ids':[],
		'insurance_ids':[],
		'payment_status_ids':[],
		'bill_status_ids':[],
		'denial_status_ids':[],
		'eor_status_ids':[],
		'employer_ids':[],
		'eor_type_ids': [],
		'appeal_status_ids': [],
	};
	EnumApiPath = EnumApiPath;
	requestServerpath = REQUEST_SERVERS;
	eventsSubject: Subject<any> = new Subject<any>();
	constructor(public eorService: EORService, private fb: FormBuilder,private toastrService:ToastrService) {}

	ngOnInit() {
		this.searchForm = this.initializeSearchForm();
		this.valueAssignInListOfFieldArray(this.formFiledListOfValue);
		this.searchForm.patchValue(this.formFiledValue);
		this.eorService.pullFilterFormReset().subscribe((reset) => {
			if (reset) {
				this.isCollapsed = false;
				this.resetCase();
				this.searchForm = this.initializeSearchForm();
			}
		});
		// setTimeout(() => {
		// 	this.getCaseTypeList();
		// }, 3000);	
	}

	initializeSearchForm(): FormGroup {
		return this.fb.group({
			bill_ids: [null],
			invoice_ids: [null],
			employer_ids: [null],
			case_ids: [null],
			speciality_ids: [null],
			facility_ids: [null],
			doctor_ids: [null],
			eor_type_ids: [null],
			description: [null],
			created_by_ids: '',
			updated_by_ids: [null],
			bill_amount: [null],
			check_no:[null],
			posted_date_from: [
				null,
				[
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
				],
			],
			posted_date_to: [
				null,
				[
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
				],
			],
			bill_date_range1: [
				null,
				[
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
				],
			],
			invoice_date_range1: [
				null,
				[
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
				],
			],
			eor_date_from: [
				null,
				[
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
				],
			],
			eor_date_to: [
				null,
				[
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
				],
			],
			eor_amount: [null],
			denial_type_ids: [null],
			comments: [null],
			denial_date_from: [
				null,
				[
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
				],
			],
			denial_date_to: [
				null,
				[
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
				],
			],
			reason: [null],
			action_type_ids: [null],
			type_ids: [null],
			check_date: [
				null,
				[
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
				],
			],
			by_ids: [null],
			check_amount: [null],
			no_of_days_from: [null],
			no_of_days_to: [null],
			invoice_patient_name: [null],
			name: [null],
			createdBy: [null],
			verification_type_ids: [null],
			verification_status_ids: [null],
			verification_date_from: [
				null,
				[
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
				],
			],
			verification_date_to: [
				null,
				[
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
				],
			],
			sent_date: [
				null,
				[
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
				],
			],
			sent_posted_date: [
				null,
				[
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
				],
			],
			sent_description: [null],
			appeal_status: [null],
			appeal_status_ids: [null],
			status_name: [null],
			date_of_accident_from: [
				null,
				[
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
				],
			],
			date_of_accident_to: [
				null,
				[
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
				],
			],
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

			case_type_ids: [null],
			patient_ids: [null],
			patient_name_ids: [null],
			claim_no: [null],
			attorney_ids: [null],
			firm_ids:[null],
			insurance_ids: [null],
			payment_status_ids: [null],
			bill_status_ids: [null],
			denial_status_ids: [null],
			eor_status_ids:[null],
			bill_date_range2: [
				null,
				[
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
				],
			],
			invoice_date_range2: [
				null,
				[
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
				],
			],
		});
	}

	/**
	 * clean the reset case for form
	 *
	 */

	resetCase(resetForm?: boolean) {
		this.searchForm = this.initializeSearchForm();
		this.eventsSubject.next(true);
		if (resetForm) {
			this.eorService.pushDoSearch(true, this.field, this.searchForm.value);
		}
	}

	/**
	 *
	 *  Apply for Reset button disabled
	 */

	checkInputs() {
		if (isEmptyObject(this.searchForm.value)) {
			return true;
		}
		return false;
	}

	/**
	 *
	 *  intellisense for speciality
	 */

	getSpeciality(event?) {
		const value = this.trim(event.target.value);
		if (value) {
			this.eorService.getSpeciality(event).subscribe((data) => {
				this.lstspecalities =
					data && data['result'] && data['result']['data'] ? data['result']['data'] : [];
			});
		}
	}

	/**
	 *
	 *  intellisense for Provider
	 */
	/*
	 *  BELOW UN_USED CODE
	 */
	searchProvider(event?,page?,paginationType = 'search') {
		const value = this.trim(event);
		if (value) {
			this.searchedKeys.searchProvider.searchKey = event;
			this.searchedKeys.searchProvider.page = page;
			let body = {
				page: page || 1,
			}
			this.eorService.getProvider(event,undefined,body).subscribe((data) => {
				this.lstProvider = data['result']['data'];
				this.lstProvider = this.lstProvider.map((res) => {
					let name = this.eorService.makeSingleNameFormFIrstMiddleAndLastNames(
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
	}
	/*
	 *  BELOW UN_USED CODE
	 */
	getMoreSearchProvider() {
		// this.searchProvider(this.searchedKeys.searchProvider.searchKey,this.searchedKeys.searchProvider.page + this.searchedKeys.page,'scroll');
	}

	/**
	 *
	 *  intellisense for search Eor Type
	 */
	/*
	*  BELOW UN_USED CODE
	*/
	searchRorType(event?,page?,paginationType = 'search') {
		const value = this.trim(event);
		if (value) {
			this.searchedKeys.eorType.searchKey = event;
			this.searchedKeys.eorType.page = page;
			let body = {
				page: page || 1,
			}
			this.eorService.searchRorType(value,body).subscribe((eor) => {
				if (eor['status'] == 200 || eor['status'] == true) {
					this.eorTypeData = eor['result']['data'] ? eor['result']['data'] : [];
				}
			});
		}
	}
	/*
	 *  BELOW UN_USED CODE
	 */
	getMoreEorTypes() {
		// this.searchProvider(this.searchedKeys.eorType.searchKey,this.searchedKeys.eorType.page + this.searchedKeys.page,'scroll');
	}

	/**
	 *
	 *  intellisense for practice location
	 */
	/*
	*  BELOW UN_USED CODE
	*/
	searchPractice(event='',page=1,paginationType = 'search') {
		const value = event ?  this.trim(event) : '';
			this.searchedKeys.practiceLocation.searchKey = event;
			this.searchedKeys.practiceLocation.page = page;
			let body = {
				page: page || 1,
				name : event
			}
			if(value.length > this.searchedKeys.minChar || paginationType == EnumSearch.InitSearch || paginationType == EnumSearch.ScrollSearch) {
			this.eorService.searchOfPractice(body).subscribe(data => {
				if(paginationType == 'search') {
					this.lstpractiseLocation = [];
					this.searchedKeys.practiceLocation.lastPage = this.searchedKeys.last_page;
				}
				let result = [...data['result']['data']];
				this.searchedKeys.practiceLocation.lastPage = data.result.last_page;
				this.lstpractiseLocation = [...this.lstpractiseLocation,...result];
			});
		}
	}
	/*
	*  BELOW UN_USED CODE
	*/
	getMorePractices() {
		if(this.searchedKeys.practiceLocation.page != this.searchedKeys.practiceLocation.lastPage) { 
			this.searchPractice(this.searchedKeys.practiceLocation.searchKey,this.searchedKeys.practiceLocation.page + this.searchedKeys.page,'scroll');
		}
	}
	/*
	*  BELOW UN_USED CODE
	*/
	getMorePracticesOpen() {
		if(this.lstpractiseLocation.length == 0) {
			this.searchPractice('',this.searchedKeys.page, EnumSearch.InitSearch);
		}
	}

	/**
	 *
	 *  intellisense for User  CreatedBy
	 */
	/*
	*  BELOW UN_USED CODE
	*/
	searchUserListCreatedBy(event?:any,page?,paginationType = 'search') {
		const value = this.trim(event);
		if (value) {
			this.searchedKeys.createdBy.searchKey = event;
			this.searchedKeys.createdBy.page = page;
			const body = {
				page:page || 1
			}
			this.eorService.searchUserList(value,body).subscribe((data) => {
				const result = [...data['result']['data']];
				this.listOfUserCreatedBy = result.map((t) => {
					return new UserByModel(t);
				});
			});
		}
	}
	/*
	*  BELOW UN_USED CODE
	*/
	getMoreCreatedBy() {
		// this.searchUserListCreatedBy(this.searchedKeys.createdBy.searchKey,this.searchedKeys.createdBy.page + this.searchedKeys.page,'scroll');
	}
	/**
	 *
	 *  intellisense for User UpdatedBy
	 */
	/*
	*  BELOW UN_USED CODE
	*/
	searchUserListUpdatedBy(event?:any,page?,paginationType = 'search') {
		const value = this.trim(event);
		if (value) {
			this.searchedKeys.updatedBy.searchKey = event;
			this.searchedKeys.updatedBy.page = page;
			const body = {
				page:page || 1
			}
			this.eorService.searchUserList(value,body).subscribe((data) => {
				const result = [...data['result']['data']];
				this.listOfUserUpdatedBy = result.map((t) => {
					return new UserByModel(t);
				});
			});
		}
	}
	/*
	*  BELOW UN_USED CODE
	*/
	getMoreUpdatedBy() {
		// this.searchUserListUpdatedBy(this.searchedKeys.updatedBy.searchKey,this.searchedKeys.updatedBy.page + this.searchedKeys.page,'scroll');
	}

	/**
	 *
	 *  intellisense for Bills Id
	 */
	/*
	*  BELOW UN_USED CODE
	*/
	searchBill(event?:any,page?,paginationType = 'search') {
		const value = this.trim(event);
		if (value) {
			this.searchedKeys.BillId.searchKey = event;
			this.searchedKeys.BillId.page = page;
			let body = {
				page: page || 1,
			}
			this.eorService.searchBillIds(value,body).subscribe((t) => {
				this.bill_ids = [...t['result']['data']];
			});
		}
	}
	/*
	*  BELOW UN_USED CODE
	*/
	getMoreBillIds() {
		// this.searchBill(this.searchedKeys.BillId.searchKey,this.searchedKeys.BillId.page + this.searchedKeys.page,'scroll');
	}

	/**
	 *
	 *  intellisense for Denial Type
	 */
	/*
	*  BELOW UN_USED CODE
	*/
	searchDenial(event?,page?,paginationType = 'search') {
		const value = this.trim(event);
		if (value) {
			this.searchedKeys.denialType.searchKey = event;
			this.searchedKeys.denialType.page = page;
			let body = {
				page: page || 1
			}
			this.eorService.denialSearch(value,body).subscribe((d) => {
				this.listOfDenialTypes = d['result']['data'] ? d['result']['data'] : [];
			});
		}
	}
	/*
	*  BELOW UN_USED CODE
	*/
	getMoreSearchDenail() {
		// this.searchDenial(this.searchedKeys.denialType.searchKey,this.searchedKeys.denialType.page + this.searchedKeys.page,'scroll');
	}

	/**
	 *
	 *  Apply Filter
	 */

	doFilter() {
		debugger;
		const formData = this.searchForm.value;
		formData['bill_date_range1'] = formData.bill_date_range1 ? changeDateFormat(formData.bill_date_range1): null;
		formData['bill_date_range2'] = formData.bill_date_range2 ? changeDateFormat(formData.bill_date_range2): null;
		formData['created_at'] = formData.created_at ? changeDateFormat(formData.created_at): null;
		formData['updated_at'] = formData.updated_at ? changeDateFormat(formData.updated_at): null;
		formData['invoice_date_range1'] = formData.invoice_date_range1 ? changeDateFormat(formData.invoice_date_range1): null;
		formData['invoice_date_range2'] = formData.invoice_date_range2 ? changeDateFormat(formData.invoice_date_range2): null;
		formData['speciality_ids'] = formData['speciality_ids'] ?  JSON.stringify(this.selectedMultipleFieldFiter.speciality_ids): formData['speciality_ids'];
		formData['invoice_ids'] = formData['invoice_ids'] ?  JSON.stringify(this.selectedMultipleFieldFiter.invoice_ids): formData['invoice_ids'];
		formData['employer_ids'] = formData['employer_ids'] ?  JSON.stringify(this.selectedMultipleFieldFiter.employer_ids): formData['employer_ids'];
		formData['job_status'] = formData['job_status'] ? JSON.stringify(this.selectedMultipleFieldFiter.job_status): formData['job_status'];
		formData['created_by_ids'] = formData['created_by_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.created_by_ids): formData['created_by_ids'];
		formData['facility_ids'] = formData['facility_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.facility_ids): formData['facility_ids'];
		formData['bill_ids'] = formData['bill_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.bill_ids): formData['bill_ids'];
		formData['doctor_ids'] = formData['doctor_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.doctor_ids): formData['doctor_ids'];
		formData['denial_type_ids'] = formData['denial_type_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.denial_type_ids): formData['denial_type_ids'];
		formData['action_type_ids'] = formData['action_type_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.action_type_ids): formData['action_type_ids'];
		formData['type_ids'] = formData['type_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.type_ids): formData['type_ids'];
		formData['by_ids'] = formData['by_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.by_ids): formData['by_ids'];
		formData['verification_type_ids'] = formData['verification_type_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.verification_type_ids): formData['verification_type_ids'];
		formData['patient_name_ids'] = formData['patient_name_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.patient_name_ids): formData['patient_name_ids'];
		formData['attorney_ids'] = formData['attorney_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.attorney_ids): formData['attorney_ids'];
		formData['firm_ids'] = formData['firm_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.firm_ids): formData['firm_ids'];
		formData['insurance_ids'] = formData['insurance_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.insurance_ids): formData['insurance_ids'];
		formData['payment_status_ids'] = formData['payment_status_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.payment_status_ids): formData['payment_status_ids'];
		formData['bill_status_ids'] = formData['bill_status_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.bill_status_ids): formData['bill_status_ids'];
		formData['denial_status_ids'] = formData['denial_status_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.denial_status_ids): formData['denial_status_ids'];
		formData['eor_status_ids'] = formData['eor_status_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.eor_status_ids): formData['eor_status_ids'];
		formData['eor_type_ids'] = formData['eor_type_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.eor_type_ids): formData['eor_type_ids'];
		formData['updated_by_ids'] = formData['updated_by_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.updated_by_ids): formData['updated_by_ids'];
		formData['patient_ids'] = formData['patient_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.patient_ids): formData['patient_ids'];
		formData['appeal_status_ids'] = formData['appeal_status_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.appeal_status_ids): formData['appeal_status_ids'];
		this.eorService.pushDoSearch(true, this.field, formData);
	}

	/**
	 *
	 *  Field Action
	 */

	getFieldAction(status: boolean, name: string) {
		this.eorService.updateFilterField(status, name);
	}
	get getConditionalCaseIds(){
		return {case_ids:[this.caseId]}
	}
	get getOrderBy(){
		return {order_by:OrderEnum.ASC}
	}
	/*

	*  BELOW UN_USED CODE
	*/
	paymentType(event?,page?,paginationType = 'search') {
		const value = this.trim(event);
		if (value) {
			this.searchedKeys.paymentType.searchKey = event;
			this.searchedKeys.paymentType.page = page;
			let body = {
				page: page || 1,
			}
			this.eorService.paymentType(value,body).subscribe((types) => {
				if (types['status']) {
					this.paymentTypeList = [...types['result']['data']];
				}
			});
		}
	}
	/*
	*  BELOW UN_USED CODE
	*/
	getMorePaymentType() {
		// this.paymentType(this.searchedKeys.paymentType.searchKey,this.searchedKeys.paymentType.page + this.searchedKeys.page,'scroll');
	}
	/*
	*  BELOW UN_USED CODE
	*/
	paymentBy(event?,page?,paginationType = 'search') {
		const value = this.trim(event);
		if (value) {
			this.searchedKeys.paymentBy.searchKey = event;
			this.searchedKeys.paymentBy.page = page;
			let body = {
				page: page || 1
			}
			this.eorService.getPaymentBy(value,body).subscribe((by) => {
				if (by['status']) {
					this.paidByList = [...by['result']['data']];
				}
			});
		}
	}
	/*
	*  BELOW UN_USED CODE
	*/
	getMorePaidBy() {
		// this.paymentBy(this.searchedKeys.paymentBy.searchKey,this.searchedKeys.paymentBy.page + this.searchedKeys.page,'scroll');
	}
	/*
	*  BELOW UN_USED CODE
	*/
	actionType(event?,page?,paginationType = 'search') {
		const value = this.trim(event);
		if (value) {
			this.searchedKeys.actionType.searchKey = event;
			this.searchedKeys.actionType.page = page;
			let body = {
				page: page || 1,
			}
			this.eorService.getActionType(value,body).subscribe((type) => {
				if (type['status']) {
					this.actionTypeList = [...type['result']['data']];
				}
			});
		}
	}
	/*
	*  BELOW UN_USED CODE
	*/
	getMoreActionType() {
		// this.actionType(this.searchedKeys.actionType.searchKey,this.searchedKeys.actionType.page + this.searchedKeys.page,'scroll');
	}
	/*
	*  BELOW UN_USED CODE
	*/
	getVerificationType(event?,page?,paginationType = 'search') {
		const value = this.trim(event);
		if (value) {
			this.searchedKeys.verificationType.searchKey = event;
			this.searchedKeys.verificationType.page = page;
			let body = {
				page: page || 1,
			}
			this.eorService.getVerificationType(value,body).subscribe((data) => {
				if (data['status']) {
					this.verificationTypeData = [...data['result']['data']];
				}
			});
		}
	}
	/*
	*  BELOW UN_USED CODE
	*/
	getMoreVerificationType() {
		// this.searchPractice(this.searchedKeys.verificationType.searchKey,this.searchedKeys.verificationType.page + this.searchedKeys.page,'scroll');
	}
	/*
	*  BELOW UN_USED CODE
	*/
	searchVerificationStatus(event?:any,page?,paginationType = 'search') {
		const value = this.trim(event);
		if (value) {
			this.searchedKeys.verificationStatus.searchKey = event;
			this.searchedKeys.verificationStatus.page = page;
			let body = {
				page: page || 1,
			}
			this.eorService.getVerificationStatus(event,body).subscribe((data) => {
				if (data['status']) {
					this.verificationStatusData = [...data['result']['data']];
				}
			});
		}
	}
	/*
	*  BELOW UN_USED CODE
	*/
	getMoreVerificationStatus() {
		// this.searchVerificationStatus(this.searchedKeys.verificationStatus.searchKey,this.searchedKeys.verificationStatus.page + this.searchedKeys.page,'scroll');
	}
	changeSelect(value, fieldName) {
		if (!value.length) {
			this.searchForm.controls[fieldName].setValue(null);
		}
	}
	onselectionChange(event){
		let mappedarray = [];
		if(event.length > 1){
			
			this.selectedItemDisplay = event.map((elem)=> elem.name).toString();
			console.log(this.selectedItemDisplay);
		}
	}
	trim(el) {
		const search = el
			.replace(/(^\s*)|(\s*$)/gi, '') // removes leading and trailing spaces
			.replace(/[ ]{2,}/gi, ' ') // replaces multiple spaces with one space
			.replace(/\n +/, '\n'); // Removes spaces after newlines
		return search;
	}
	/*
	*  BELOW UN_USED CODE
	*/
	searchCaseId({ target }) {
		const value = this.trim(target.value);
		if (value) {
			const query = {
				filter: true,
				id: value,
			};
			this.eorService.searchCaseIds(query).subscribe((data) => {
				if (data['status']) {
					this.caseIds = [...data['result']['data']];
				}
			});
		}
	}

	/**
	 *
	 *  intellisense for getInsurance
	 */
	/*
	*  BELOW UN_USED CODE
	*/
	getInsurance(event?:any,page?,paginationType = 'search') {
		const value = this.trim(event);
		if (value) {
			this.searchedKeys.InsuranceName.searchKey = event;
			this.searchedKeys.InsuranceName.page = page;
			const body = {
				page: page || 1
			}
			this.eorService.getInsurance(event,body).subscribe((data) => {
				this.lstInsurance =
					data && data['result'] && data['result']['data'] ? data['result']['data'] : [];
			});
		}
	}
	/*
	*  BELOW UN_USED CODE
	*/
	getMoreInsurances() {
		// this.getInsurance(this.searchedKeys.InsuranceName.searchKey,this.searchedKeys.InsuranceName.page + this.searchedKeys.page, 'scroll');
	}

	/**
	 *
	 *  intellisense for getAttorney
	 */
	/*
	*  BELOW UN_USED CODE
	*/
	getAttorney(event?:any,page?,paginationType = 'search') {
		const value = this.trim(event);
		if (value) {
			this.searchedKeys.attorneyName.searchKey = event;
			this.searchedKeys.attorneyName.page = page;
			const body = {
				page : page || 1
			}
			this.eorService.getAttorney(event,body).subscribe((data) => {
				const result = [...data['result']['data']];
				this.lstAttorney = result.map((t) => {
					return new UserByModel(t);
				});
			});
		}
	}
	/*
	*  BELOW UN_USED CODE
	*/
	getMoreAttorney() {
		// this.getAttorney(this.searchedKeys.attorneyName.searchKey,this.searchedKeys.attorneyName.page + this.searchedKeys.page, 'scroll');
	}

	/**
	 *
	 *  intellisense for getAttorney
	 */
	/*
	*  BELOW UN_USED CODE
	*/
	getBillStatus(event?,page?,paginationType = 'search') {
		const value = this.trim(event);
		if (value) {
			this.searchedKeys.BillStatus.searchKey = event;
			this.searchedKeys.BillStatus.page = page;
			let body = {
				page: page || 1
			}
			this.eorService.getBillstatus(event,body).subscribe((data) => {
				this.lstBillStatus =
					data && data['result'] && data['result']['data'] ? data['result']['data'] : [];
			});
		}
	}
	/*
	*  BELOW UN_USED CODE
	*/
	getMoreBillStatus() {
		// this.getBillStatus(this.searchedKeys.BillStatus.searchKey,this.searchedKeys.BillStatus.page + this.searchedKeys.page, 'scroll');
	}

	/**
	 * intelecience for search Payment Status
	 * @param event 
	 */
	/*
	*  BELOW UN_USED CODE
	*/
	searchPaymentStatus(event?,page?,paginationType = 'search'){
		if(event){
			this.searchedKeys.paymentStatus.searchKey = event;
			this.searchedKeys.paymentStatus.page = page;
			let body = {
				page: page || 1,
			}
		this.eorService.searchPaymentStatus(event,body).subscribe(data => {
			if(data['status']){
				this.paymentStatusList = [...data['result']['data']];
			}
		});
	}
	}
	/*
	*  BELOW UN_USED CODE
	*/
	getMorePaymentStatus() {
		// this.searchPaymentStatus(this.searchedKeys.paymentStatus.searchKey,this.searchedKeys.paymentStatus.page + this.searchedKeys.page,'scroll');
	}

	/**
	 * intelecience for search Denial Status
	 * @param event 
	 */
	/*
	*  BELOW UN_USED CODE
	*/
	searchDenialStatus(event?:any,page?,paginationType = 'search'){
		if(event){
			this.searchedKeys.denialStatus.searchKey = event;
			this.searchedKeys.denialStatus.page = page;
			let body = {
				page: page || 1,
			}
		this.eorService.searchDenialStatus(event,body).subscribe(data => {
			if(data['status']){
				this.denialStatusList = [...data['result']['data']];
			}
		});
	}
	}
	/*
	*  BELOW UN_USED CODE
	*/
	getMoreDenialStatus() {
		// this.searchDenialStatus(this.searchedKeys.denialStatus.searchKey,this.searchedKeys.denialStatus.page + this.searchedKeys.page,'scroll');
	}

	
	/**
	 * intelecience for search Eor Status
	 * @param event 
	 */
	/*
	*  BELOW UN_USED CODE
	*/
	searchEorStatus(event?:any,page?,paginationType = 'search'){
		if(event){
			this.searchedKeys.eorStatus.searchKey = event;
			this.searchedKeys.eorStatus.page = page;
			let body = {
				page: page || 1,
			}
		this.eorService.searchEorStatus(event,body).subscribe(data => {
			if(data['status']){
				this.eorStatusList = [...data['result']['data']];
			}
		});
	}
	}
	/*
	*  BELOW UN_USED CODE
	*/
	getMoreEorStatus() {
		// this.searchEorStatus(this.searchedKeys.eorStatus.searchKey,this.searchedKeys.eorStatus.page + this.searchedKeys.page,'scroll');
	}

	getCaseTypeList() {
		this.eorService.getAllSensationsOfCaseType().subscribe((res) => {
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
	 * intelecience for search Case
	 * @param event
	 * 
	 */
	/*
	*  BELOW UN_USED CODE
	*/
	searchPatientName(event?:any,page?, search?: string,paginationType = 'search') {
		if (search === 'patientName') {
			const value = event;
			if (value) {
			this.searchedKeys.patientName.searchKey = event;
			this.searchedKeys.patientName.page = page;
				let body = {
					page: page || 10,
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
			if (value) {
				this.searchedKeys.patientName.searchKey = event;
				this.searchedKeys.patientName.page = page;
				let body = {
					page: page || 1,
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
	/*
	*  BELOW UN_USED CODE
	*/
	getMorePatients() {
		// this.searchPatientName(this.searchedKeys.patientName.searchKey,this.searchedKeys.patientName.page + this.searchedKeys.page, 'patientName','scroll');
	}
	valueAssignInListOfFieldArray(values: object={}){
		this.selectedMultipleFieldFiter['speciality_ids'] = values['speciality_ids'];
		this.lstspecalities = values['speciality_ids'];
		this.listOfUserCreatedBy = values['created_by_ids'];
        this.selectedMultipleFieldFiter['created_by_ids'] = values['created_by_ids'];
		this.listOfUserUpdatedBy = values['updated_by_ids'];
        this.selectedMultipleFieldFiter['updated_by_ids'] = values['updated_by_ids'];
		this.lstpractiseLocation = values['facility_ids'];
        this.selectedMultipleFieldFiter['facility_ids'] = values['facility_ids'];
		this.bill_ids = values['bill_ids'];
		this.created_at = values['created_at'];
		this.updated_at = values['updated_at'];
        this.selectedMultipleFieldFiter['bill_ids'] = values['bill_ids'];
		this.lstProvider = values['doctor_ids'];
        this.selectedMultipleFieldFiter['doctor_ids'] = values['doctor_ids'];

		this.listOfDenialTypes = values['denial_type_ids'];
        this.selectedMultipleFieldFiter['denial_type_ids'] = values['denial_type_ids'];
		this.actionTypeList = values['action_type_ids'];
        this.selectedMultipleFieldFiter['action_type_ids'] = values['action_type_ids'];
		this.paymentTypeList = values['type_ids'];
        this.selectedMultipleFieldFiter['type_ids'] = values['type_ids'];
		this.paidByList = values['by_ids'];
        this.selectedMultipleFieldFiter['by_ids'] = values['by_ids'];
		this.verificationTypeData = values['verification_type_ids'];
        this.selectedMultipleFieldFiter['verification_type_ids'] = values['verification_type_ids'];

		this.appealStatusData = values['appeal_status_ids'];
        this.selectedMultipleFieldFiter['appeal_status_ids'] = values['appeal_status_ids'];

		this.patientNameLists = values['patient_name_ids'];
        this.selectedMultipleFieldFiter['patient_name_ids'] = values['patient_name_ids'];

		this.lstAttorney = values['attorney_ids'];
        this.selectedMultipleFieldFiter['attorney_ids'] = values['attorney_ids'];
		this.selectedMultipleFieldFiter['firm_ids'] = values['firm_ids'];
		this.lstInsurance = values['insurance_ids'];
        this.selectedMultipleFieldFiter['insurance_ids'] = values['insurance_ids'];

		this.paymentStatusList = values['payment_status_ids'];
        this.selectedMultipleFieldFiter['payment_status_ids'] = values['payment_status_ids'];

		this.lstBillStatus = values['bill_status_ids'];
        this.selectedMultipleFieldFiter['bill_status_ids'] = values['bill_status_ids'];

		this.denialStatusList = values['denial_status_ids'];
        this.selectedMultipleFieldFiter['denial_status_ids'] = values['denial_status_ids'];

		this.eorStatusList = values['eor_status_ids'];
        this.selectedMultipleFieldFiter['eor_status_ids'] = values['eor_status_ids'];

		this.eorTypeData = values['eor_type_ids'];
        this.selectedMultipleFieldFiter['eor_type_ids'] = values['eor_type_ids'];

		this.patientNameLists = values['patient_ids'];
        this.selectedMultipleFieldFiter['patient_ids'] = values['patient_ids'];
	


	}

	getChange($event:any[], fieldName: string) {
		if($event) {
			this.selectedMultipleFieldFiter[fieldName] = $event.map(data => new MappingFilterObject(data.id, data.name, data.full_Name, data.facility_full_name ,data.created_by_name,data.updated_by_name, data.label_id ,data.insurance_name, data.employer_name));
		}
	}
	selectionOnValueChange(e: any,Type?) {
		const info = new ShareAbleFilter(e);
		this.searchForm.patchValue(removeEmptyAndNullsFormObject(info));
		this.getChange(e.data, e.label);
		if(!e.data) {
			this.searchForm.controls[Type].setValue(null);
		}
	}
	labelMovetoAbove(status: boolean, label: string) {
		this.fb[label] = status;
	}
	ngSelectClear(Type) {
		this.searchForm.controls[Type].setValue(null);
	}
}
