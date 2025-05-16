import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserByModel } from '@appDir/eor/Models/user-by-model';
import { EnumApiPath, EnumSearch, SearchedKeys } from '@appDir/front-desk/billing/Models/searchedKeys-modal';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { ShareAbleFilter } from '@appDir/shared/models/share-able-filter';
import { makeSingleNameFormFIrstMiddleAndLastNames, removeEmptyAndNullsArraysFormObject, removeEmptyAndNullsFormObject, isEmptyObject, makeDeepCopyArray} from '@appDir/shared/utils/utils.helpers';
import { map, Subject } from 'rxjs';
import { IFilterFieldHtml } from '../../model/filter-field-html-model';
import { MappingFilterObject } from '../../model/mapping-filter-object';
import { FilterService } from '../../service/filter.service';
import { BillingRecipientUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/Billing-Recipient.Enum';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
@Component({
	selector: 'app-filter',
	templateUrl: './filter.component.html',
	styleUrls: ['./filter.component.scss'],
})
export class FilterComponent implements OnInit {
	searchedKeys:SearchedKeys = new SearchedKeys();
	@Input() fieldShow: IFilterFieldHtml;
	@Input() showPacketIDFilter : boolean = true
	@Input() formFiledValue = {};
	@Input() formFiledListOfValue = {};
	@Input() showCategoryDropdown: boolean = true;
	isCollapsed = false;
	filterForm: FormGroup;
	bill_ids: any[] = [];
	caseIds: any[] = [];
	caseTypeLists: any[] = [];
	patientNameLists: any[] = [];
	lstspecalities: any[] = [];
	lstPomIds: any[] = [];
	lstpractiseLocation: any[] = [];
	listOfUserCreatedBy: any[] = [];
	lstBillstate: any[] = [];
	lstBillJob: any[] =[];
	public maxDate: string;
	min: Date= new Date('1900/01/01');
	lstProvider:any[] = [];
	selectedMultipleFieldFiter: any = {
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
		'facility_location_ids': [],
		'employer_ids': [],
		'firm_ids':[],
		'insurance_ids':[],
		'bill_status_ids':[],
		'type_ids':[]

	};
	lstEmployer: any[] =[];
	lstAttorney: any[] =[];
	lstInsurance: any[] =[];
	billReciepientCheck ={
		attorney: false,
		insurance: false,
		patient: false,
		employer: false
	}
	@Output() searchFilterData = new EventEmitter();
	EnumApiPath = EnumApiPath;
	eventsSubject: Subject<any> = new Subject<any>();
	requestServerpath = REQUEST_SERVERS;
	BillingRecipientUrlsEnum = BillingRecipientUrlsEnum
	DATEFORMAT = '_/__/____';
	constructor(private fb: FormBuilder, public filterService: FilterService) {}

	ngOnInit() {
		// this.fieldShow.showBillIDFiled()
		debugger;
		this.filterForm = this.initializeSearchForm();
		this.valueAssignInListOfFieldArray(this.formFiledListOfValue);
		this.formFiledValue['firm_ids'] =  this.formFiledValue['firm_ids'][0];
		this.filterForm.patchValue(this.formFiledValue);
		this.getCaseTypeList();
		this.getBillRecipient();
	}

	initializeSearchForm(): FormGroup {
		return this.fb.group({
			bill_ids: [null],
			type_ids:[null],
			case_ids: [null],
			patient_ids: [null],
			name: [null],
			speciality_ids: [null],
			pom_ids: [null],
			bill_status_ids:[null],
			packet_ids: [null],
			case_type_ids: [null],
			facility_ids: [null],
			job_status: [null],
			created_by_ids: [null],
			updated_by_ids: [null],
			bill_recipient_type_ids: [null],
			doctor_ids:[null],
			employer_ids: [null],
			insurance_ids: [null],
			firm_ids:[null],
			facility_location_ids: [null],
			bill_date_from: [
				null,
				[
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
				],
			],
			bill_date_to: [
				null,
				[
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
				],
			],
			pom_date: [
				null,
				[
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
				],
			],
			scan_upload_date_from: [
				null,
				[
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
				],
			],
			scan_upload_date_to: [
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
			bill_date_range1: [
				null,
				[
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
				],
			],
			bill_date_range2: [
				null,
				[
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
				],
			],
			visit_date_range_1: [
				null,
				[
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
				],
			],
			visit_date_range_2: [
				null,
				[
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
				],
			],
});
	
	}

	doFilter() {
		const formData = this.filterForm.value;
		const filterData = removeEmptyAndNullsArraysFormObject(formData);
		formData['speciality_ids'] = formData['speciality_ids'] ?  JSON.stringify(this.selectedMultipleFieldFiter.speciality_ids): formData['speciality_ids'];
		formData['job_status'] = formData['job_status'] ? JSON.stringify(this.selectedMultipleFieldFiter.job_status): formData['job_status'];
		formData['created_by_ids'] = formData['created_by_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.created_by_ids): formData['created_by_ids'];
		formData['facility_ids'] = formData['facility_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.facility_ids): formData['facility_ids'];
		formData['bill_ids'] = formData['bill_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.bill_ids): formData['bill_ids'];
		formData['case_ids'] = formData['case_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.case_ids): formData['case_ids'];
		formData['packet_ids'] = formData['packet_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.packet_ids): formData['packet_ids'];
		formData['doctor_ids'] = formData['doctor_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.doctor_ids): formData['doctor_ids'];
		formData['facility_location_ids'] = formData['facility_location_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.facility_location_ids): formData['facility_location_ids'];
		formData['employer_ids'] = filterData['employer_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.employer_ids): formData['employer_ids'];
		formData['firm_ids'] = filterData['firm_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.firm_ids): formData['firm_ids'];
		formData['insurance_ids'] = filterData['insurance_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.insurance_ids): formData['insurance_ids'];
		formData['bill_status_ids'] = filterData['bill_status_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.bill_status_ids): formData['bill_status_ids'];
		formData['type_ids'] = filterData['type_ids'] ? JSON.stringify(this.selectedMultipleFieldFiter.type_ids): formData['type_ids'];
		this.searchFilterData.emit(this.filterService.filterResponse(formData));
	}

	resetFilter() {
		this.filterForm.reset();
		this.billReciepientCheck = {attorney: false, insurance: false, employer: false, patient: false};
		this.eventsSubject.next(true);
		this.searchFilterData.emit({});
	}

	/**
	 *
	 *  intellisense for Bills Id
	 */

	searchBill(e: any) {
		const value = this.trim(e.target.value);
		if (value) {
			this.filterService.searchBillIds(value).subscribe((t) => {
				this.bill_ids = [...t['result']['data']];
			});
		}
	}

	/**
	 *
	 *  intellisense for Case Id
	 */

	searchCaseId({ target }) {
		const value = this.trim(target.value);
		if (value) {
			const query = {
				filter: true,
				id: value,
			};
			this.filterService.searchCaseIds(query).subscribe((data) => {
				if (data['status']) {
					this.caseIds = [...data['result']['data']];
				}
			});
		}
	}

	/**
	 *
	 *  intellisense for Case Type List
	 */

	getCaseTypeList() {
		this.filterService.getAllSensationsOfCaseType().subscribe((res) => {
			if (res['status'] == 200) {
				this.caseTypeLists =
					res['result'] && res['result'].data && res['result'].data.type
						? res['result'].data.type
						: [];
			}
		});
	}

	/**
	 * intelecience for Patient Name
	 * @param event
	 */

	searchPatientName({ target }) {
		const value = this.trim(target.value);
		if (value.length >= 3) {
			const query = {
				filter: true,
				name: value,
			};
			this.filterService.searchPatientName(query).subscribe((data) => {
				if (data['status']) {
					const result = [...data['result']['data']];
					this.patientNameLists = result.map((t) => {
						return new UserByModel(t);
					});
				}
			});
		}
	}

	/**
	 *
	 *  intellisense for speciality
	 */

	getSpeciality(event='',page = 1,paginationType = 'search') {
		const value = event ? this.trim(event) : '';
			this.searchedKeys.specialityName.searchKey = event;
			this.searchedKeys.specialityName.page = page;
			let body = {
				page: page || 1,
			}
			if(value.length > this.searchedKeys.minChar || paginationType == EnumSearch.InitSearch || paginationType == EnumSearch.ScrollSearch) {
			this.filterService.getSpeciality(value,body).subscribe((data) => {
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
	getMoreSpecialities() {
		if(this.searchedKeys.specialityName.page != this.searchedKeys.specialityName.lastPage) { 
			this.getSpeciality(this.searchedKeys.specialityName.searchKey,this.searchedKeys.specialityName.page + this.searchedKeys.page,'scroll');
		}	
	}
	getMoreSpecialitiesOpen() {
		if(this.lstspecalities.length == 0) {
			this.getSpeciality('',this.searchedKeys.page, EnumSearch.InitSearch);
		}
	}
	/**
	 *
	 *  intellisense for Pom Id
	 */

	searchPomId({ target }) {
		const value = this.trim(target.value);
		if (value) {
			const query = {
				pom_id: value,
			};
			this.filterService.searchPomIds(query).subscribe((data) => {
				if (data['status']) {
					this.lstPomIds = [...data['result']['data']];
				}
			});
		}
	}

	/**
	 *
	 *  intellisense for practice location
	 */

	searchPractice(event='',page = 1,paginationType = 'search') {
		const value = event ? this.trim(event) : '';
			this.searchedKeys.practiceLocation.searchKey = event;
			this.searchedKeys.practiceLocation.page = page;
			let body = {
				page: page || 1,
				name:value
			}
			if(value.length > this.searchedKeys.minChar || paginationType == EnumSearch.InitSearch || paginationType == EnumSearch.ScrollSearch) {
			this.filterService.searchOfPractice(body).subscribe((data) => {
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
	getMorePracticeLocation() {
		if(this.searchedKeys.practiceLocation.page != this.searchedKeys.practiceLocation.lastPage) { 
			this.searchPractice(this.searchedKeys.practiceLocation.searchKey,this.searchedKeys.practiceLocation.page + this.searchedKeys.page,'scroll');
		}
	}
	getMorePracticeLocationOpen() {
		debugger;
		if(this.lstpractiseLocation.length == 0) {
			this.searchPractice('',this.searchedKeys.page, EnumSearch.InitSearch);
		}
	}

	/**
	 *
	 *  intellisense for User  CreatedBy
	 */

	searchUserListCreatedBy(event: any) {
		const value = this.trim(event.target.value);
		if (value.length >= 3) {
			this.filterService.searchUserList(value).subscribe((data) => {
				const result = [...data['result']['data']];
				this.listOfUserCreatedBy = result.map((t) => {
					return new UserByModel(t);
				});
			});
		}
	}

	/**
	 *
	 *  intellisense for get Bill Status
	 */

	 getBillRecipient() {
			this.filterService.getBillRecipient().subscribe((data) => {
				this.lstBillstate =
					data && data['result'] && data['result']['data'] ? data['result']['data'] : [];
			});
	}

	/**
	 *
	 *  intellisense for get Bill Status
	 */

	 getJobStatus(event: any) {
		const value = this.trim(event.target.value);
		if (value.length >= 3) {
			this.filterService.getJobStatus().subscribe((data) => {
				this.lstBillJob =
					data && data['result'] && data['result']['data'] ? data['result']['data'] : [];
			});
		}
	}


	
	/**
	 *
	 *  intellisense for get searchEmployer
	 */
	searchEmployer(event) {
		const value = this.trim(event.target.value);
		if (value.length >= 3) {
		this.filterService.searchEmployer(value).pipe(map(val => val['result']['data']))
			.subscribe(data => {
				this.lstEmployer = [...data];
			})
		}
	}

	/**
	 *
	 *  intellisense for get searchAttorney
	 */
	 searchAttorney(event) {
		const value = this.trim(event.target.value);
		if (value.length >= 3) {
		this.filterService.getAttorney(value).subscribe((data) => {
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
	}

	/**
	 *
	 *  intellisense for getInsurance
	 */

	getInsurance(event?) {
		const value = this.trim(event.target.value);
		if (value.length >= 3) {
			this.filterService.getInsurance(event).subscribe((data) => {
				this.lstInsurance =
					data && data['result'] && data['result']['data'] ? data['result']['data'] : [];
			});
		}
	}

	trim(el) {
		const search = el
			.replace(/(^\s*)|(\s*$)/gi, '') // removes leading and trailing spaces
			.replace(/[ ]{2,}/gi, ' ') // replaces multiple spaces with one space
			.replace(/\n +/, '\n'); // Removes spaces after newlines
		return search;
	}

	/**
	 *
	 *  Field Action
	 */

	getFieldAction(status: boolean, name: string) {
		this.filterService.updateFilterField(status, name);
	}
	get getOrderBy(){
		return {order_by:OrderEnum.ASC}
	}


	changeSelect(value, fieldName) {
		if (!value.length) {
			this.filterForm.controls[fieldName].setValue(null);
		}
	}
	getChange($event: any[], fieldName: string) {
		let selectedValue:any[] = $event;
		if($event) {
			if(!Array.isArray($event)) {
				selectedValue = [];
				selectedValue.push($event);
			}
			this.selectedMultipleFieldFiter[fieldName] = selectedValue.map(
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

	
	actionRecipient($event){
		const selectedRecipient: any[] = $event;
		this.billReciepientCheck = {attorney: false, insurance: false, employer: false, patient: false};
		if(selectedRecipient.some(res => res.name === "Patient")){
			this.billReciepientCheck.patient = true;
		}else{
			this.filterForm.patchValue({'patient_ids': []});
		}
		if(selectedRecipient.some(res => res.name === "Firm Name")){
			this.billReciepientCheck.attorney = true;
		}else{
			this.filterForm.patchValue({'firm_ids': []});
		}
		if(selectedRecipient.some(res => res.name === "Insurance")){
			this.billReciepientCheck.insurance = true;
		}else{
			this.filterForm.patchValue({'insurance_ids': []});
		}
		if(selectedRecipient.some(res => res.name === "Employer")){
			this.billReciepientCheck.employer = true;
		}else{
			this.filterForm.patchValue({'employer_ids': []});
		}
	}
	searchProvider(event) {
		const value = this.trim(event.target.value);
		if (value.length >= 3) {
			this.filterService.getProvider(value).subscribe((data) => {
				this.lstProvider = data['result']['data'];
				this.lstProvider = this.lstProvider.map((res) => {
					let name = this.filterService.makeSingleNameFormFIrstMiddleAndLastNames(
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

	valueAssignInListOfFieldArray(values: object={}){
		this.selectedMultipleFieldFiter['speciality_ids'] = values['speciality_ids'];
		this.lstspecalities = values['speciality_ids'];
		this.selectedMultipleFieldFiter['job_status'] = values['job_status'];
		this.lstBillJob = values['job_status'];
		this.listOfUserCreatedBy = values['created_by_ids'];
        this.selectedMultipleFieldFiter['created_by_ids'] = values['created_by_ids'];
		this.lstpractiseLocation = values['facility_ids'];
        this.selectedMultipleFieldFiter['facility_ids'] = values['facility_ids'];
		this.bill_ids = values['bill_ids'];
        this.selectedMultipleFieldFiter['bill_ids'] = values['bill_ids'];
		this.selectedMultipleFieldFiter['case_ids'] = values['case_ids'];
		this.selectedMultipleFieldFiter['packet_ids'] = values['packet_ids'];
		this.lstProvider = values['doctor_ids'];
        this.selectedMultipleFieldFiter['doctor_ids'] = values['doctor_ids'];
		this.selectedMultipleFieldFiter['bill_status_ids'] = values['bill_status_ids'];
		const filterData = removeEmptyAndNullsArraysFormObject(values);
		if(filterData['facility_location_ids'] && filterData['facility_location_ids'].length != 0){
			this.lstpractiseLocation = values['facility_location_ids'];
			this.selectedMultipleFieldFiter['facility_location_ids'] = values['facility_location_ids'];
		}
		if(filterData['patient_ids']){
			this.billReciepientCheck.patient = true;
			this.patientNameLists = values['patient_ids'];
        	this.selectedMultipleFieldFiter['patient_ids'] = values['patient_ids'];
		}

		if(filterData['employer_ids']){
			this.billReciepientCheck.employer = true;
			this.lstEmployer = values['employer_ids'];
        	this.selectedMultipleFieldFiter['employer_ids'] = values['employer_ids'];
		}

		if(filterData['insurance_ids']){
			this.billReciepientCheck.insurance = true;
			this.lstInsurance = values['insurance_ids'];
        	this.selectedMultipleFieldFiter['insurance_ids'] = values['insurance_ids'];
		}

		if(filterData['firm_ids']){
			this.billReciepientCheck.attorney = true;
			this.lstAttorney = values['firm_ids'];
        	this.selectedMultipleFieldFiter['firm_ids'] = values['firm_ids'];
		}

	}

	getChangeForSingalSelection(data, fieldName: string){
		this.selectedMultipleFieldFiter[fieldName] =  [new MappingFilterObject(data.id, data.name, data.full_Name, data.facility_full_name ,data.created_by_name,data.updated_by_name, data.label_id ,data.insurance_name , data.employer_name)];
	}
	selectionOnValueChange(e: any,Type?) {
		const info = new ShareAbleFilter(e);
		this.filterForm.patchValue(removeEmptyAndNullsFormObject(info));
		this.getChange(e.data, e.label);
		if(!e.data) {
			this.filterForm.controls[Type].setValue(null);
		}
	}
	checkInputs() {
		if (isEmptyObject(this.filterForm.value)) {
			return true;
		  }
		  return false;
	}

	onInitialApiComplete() {
		this.doFilter();
	}
}
