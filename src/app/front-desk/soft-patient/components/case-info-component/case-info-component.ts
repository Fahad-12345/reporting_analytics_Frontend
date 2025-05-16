import { CheckboxClass } from '@appDir/shared/dynamic-form/models/Checkbox.class';
import { Adjuster } from './../../../models/InsuranceModel';
import { CaseTypeEnum, CaseTypeIdEnum } from '@appDir/front-desk/fd_shared/models/CaseTypeEnums';
import { AttorneyUrlsEnum } from './../../../masters/billing/attorney-master/attorney/Attorney-Urls-enum';
import { USERPERMISSIONS } from './../../../UserPermissions';
import { AdjusterInformationUrlsEnum } from './../../../masters/billing/insurance-master/adjuster/adjuster-information/adjuster-information-urls-enum';
import { PlanNameUrlsEnum } from './../../../masters/billing/insurance-master/PlanName/PlanName-Urls-enum';
import { BillingInsuranceModel } from './../../../masters/billing/insurance-master/models/BillingInsurance.Model';
import { InsuranceUrlsEnum } from './../../../masters/billing/insurance-master/Insurance/insurance-list/Insurance-Urls-enum';

import { AdjusterInformationModel } from './../../../masters/billing/models/AdjusterInformation.Model';
import { FirmUrlsEnum } from './../../../masters/billing/attorney-master/firm/Firm-Urls-enum';
import { removeEmptyAndNullsFormObject, removeEmptyKeysFromObject, WithoutTime,checkSelectedLocationsForInactive, removeNullKeyValueFromCommaSepratedArray } from '@appDir/shared/utils/utils.helpers';
import { ZipFormatMessages } from './../../../../shared/dynamic-form/constants/ZipFormatMessages.enum';
import { FDServices } from './../../../fd_shared/services/fd-services.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { AddressClass } from './../../../../shared/dynamic-form/models/AddressClass.class';
import { Component, OnInit, OnDestroy, Output, EventEmitter, AfterViewInit, Input, ViewChild, OnChanges, ElementRef } from '@angular/core';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { SelectClass } from '@appDir/shared/dynamic-form/models/SelectClass.class';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { ButtonClass } from '@appDir/shared/dynamic-form/models/ButtonClass.class';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonTypes } from '@appDir/shared/dynamic-form/constants/ButtonTypes.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { CaseFlowUrlsEnum } from '@appDir/front-desk/fd_shared/models/CaseFlowUrlsEnum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { DynamicControl } from '@appDir/shared/dynamic-form/models/DynamicControl.class';
import { ToastrService } from 'ngx-toastr';
import { PatientListingUrlsEnum } from '@appDir/front-desk/patient/patient-listing/PatientListing-Urls-Enum';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { Location } from '@angular/common';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { getFieldControlByName } from '@appDir/shared/dynamic-form/helper';
import { Options } from '@appDir/shared/dynamic-form/models/options.model';
import { AutoCompleteClass } from '@appDir/shared/dynamic-form/models/AutoCompleteClass.class';
import { FormGroup, Validators } from '@angular/forms';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { CaseModel } from '@appDir/front-desk/fd_shared/models/Case.model';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { fromEvent, Observable, Subject, zip } from 'rxjs'
import { HttpSuccessResponse, StorageData } from '@appDir/pages/content-pages/login/user.class';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { isThisTypeNode } from 'typescript';
import { NgSelectClass } from '@appDir/shared/dynamic-form/models/NgSelectClass.class';
import { HealthInsuranceFormComponent } from '@appDir/front-desk/caseflow-module/case-insurance/insurance/components/health-insurance-form/health-insurance-form.component';
import { I } from '@angular/cdk/keycodes';
import { FacilityUrlsEnum } from '@appDir/front-desk/masters/practice/practice/utils/facility-urls-enum';
import { debounceTime, map, take } from 'rxjs/operators';
import * as _ from 'lodash';

@Component({
	selector: 'app-create-case-form',
	templateUrl: './case-info-component.html',
	styleUrls: ['./case-info-component.scss']
})
export class CaseInfoFormComponent implements OnInit, OnDestroy, OnChanges {

	@Output() submit = new EventEmitter();
	@Output() updateCase = new EventEmitter()
	@Output() back  = new EventEmitter();
	@Input() case: CaseModel;
	@Input() insuranceType: string
	@Input() disableBtn: boolean
	@ViewChild(DynamicFormComponent) dynamiccomponent: DynamicFormComponent;
	@ViewChild('caseInformationFormComponent') caseInformationFormComponent : DynamicFormComponent;
	@ViewChild('privateHealthInsuranceFormComponent') privateHealthInsuranceFormComponent : HealthInsuranceFormComponent;
	@Input() addSoftPatientProviderCalandar=false;
	@Input() patient_id:number;
	form: FormGroup;
	lstAdjusterInformation: AdjusterInformationModel[] = [];
	lstInsurance: BillingInsuranceModel[] = [];
	caseId: number; 
	lstFirm: any[] = [];
	allPracticeLocations:any[]=[];
	userPermissions = USERPERMISSIONS;
	lstAttorney: any[] = []
	showPrivateHealthFormComponent:boolean=false;
	fieldConfigs: FieldConfig[] = []
	caseLists: Options[] = []
	subscription: any[] = []
	practice_loc: any[] = []
	practicelocationForm: FormGroup
	lstpractiseLocation=[];
	lat_log = {
		"latitude": null,
		"longitude": null
	}
	selectedLocations: any = [];
	locations: Array<any> = [];
	practice_location_filter={
		page:0,
		searchKey:'',
		lastPage:2,
		per_page:10
	}
	searchFirmTypeHead$:Subject<any>=new Subject<any>();
	searchTypeHead$:Subject<any>=new Subject<any>();
	isBtnSubmitDisabled:boolean=false
	firmPaginationSetting = {
		search:'',
		lastPage:null,
		per_page:10,
		currentPage:1,
	}
	InsurancePaginationSetting = {
		search:'',
		lastPage:null,
		per_page:10,
		currentPage:1,
	}
	AdjusterPaginationSetting = {
		search:'',
		lastPage:null,
		per_page:10,
		currentPage:1,
	}
	AttorneyPaginationSetting = {
		search:'',
		lastPage:null,
		per_page:10,
		currentPage:1,
	}
	aleardyOpenFacility = false;
	citimedLocationSelected  = false;
	masters:any={}
	addCategorySlug: any;

	constructor(public aclService: AclService, router: Router,  route: ActivatedRoute, 
		private requestService: RequestService, 
		private toasterService: ToastrService, private location: Location, public caseFlowService: CaseFlowServiceService,
		public storageData: StorageData,
		private fd_services: FDServices,
		private el: ElementRef
		) {

			this.initializeform()

	}
	ngOnInit() {
		this.caseFlowService.addScrollClasses();
				this.subscription.push(this.caseFlowService.getCaseMasters().subscribe(res => {
					let data = res['result']['data'];
					this.masters=data?{...data}:{}
					console.log(data);
					getFieldControlByName(this.fieldConfigs, 'category_id').options = data.categories.map(category => {
						return { label: category.name, name: category.name, value: category.id } as Options
					})
		
					getFieldControlByName(this.fieldConfigs, 'purpose_of_visit_id').options = data.purpose_of_visit.map(purpose => {
						return { label: purpose.name, value: purpose.id, name: purpose.name } as Options
					})
		
					this.caseLists = data.type.map(type => {
						return { label: type.name, name: type.name, value: type.id } as Options
					})
		
					getFieldControlByName(this.fieldConfigs, 'case_type_id').options = this.caseLists
		
		
				}))
				if(!this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_attorney_info_edit))
				{
					this.enableForm();
		
					
				}
			}
	

	ngAfterViewInit() {	
		this.form = this.dynamiccomponent.form;
			// this.getCase()
			this.bindFirmChange()
			this.bindCaseTypeChange();
			this.bindAttorneyChange()
			this.bindLocationChange();
			this.bindInsuranceChange();
			this.bindInsuranceLocationChange();
			this.bindAdjusterInformationChange();
			this.isDateOfBirthMax();
			this.form.markAsUntouched();
			this.form.markAsPristine();
		
		if(!this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_attorney_info_edit))
		{
			this.enableForm();

			
		}

	}
	ngOnChanges() {
		// this.getPosition();

	}
	ngOnDestroy() {
		this.caseFlowService.removeScrollClasses();
		unSubAllPrevious(this.subscription)
	}
	onReady(event?: FormGroup) {
		if (event){
		this.form = event;
		}
		
		if (this.case) {

			this.getPracticeBydefault()
			if(this.case.attorney && this.case.attorney.firm )
			{
				let _firm={...this.case.attorney.firm}
			
				_firm['firm_locations']=[this.case.attorney.firm_location];
				this.lstFirm = _firm? [_firm]:[];
	
				let firm_control = getFieldControlByName(this.fieldConfigs, 'firm_id');
				firm_control.items = this.lstFirm
				let firm_location_control = getFieldControlByName(this.fieldConfigs, 'firm_location_id');
	
				if (this.case.attorney.firm_location&&this.case.attorney.firm_location.id) {
				this.locations = [this.case.attorney.firm_location]
				firm_location_control.items = this.locations;
				}
			}
			
			if(this.case.attorney.attorney&&this.case.attorney.attorney.id)
			{
				let attorney={...this.case.attorney.attorney};
				attorney['full_name']= `${attorney.first_name}${attorney.middle_name ? attorney.middle_name : ''} ${attorney.last_name}` ;
				this.lstAttorney = attorney?[attorney]:[]
				let attorney_control = getFieldControlByName(this.fieldConfigs, 'attorney_id');
				attorney_control.items = [...this.lstAttorney]
			}
			
			if(this.case.insurance && this.case.insurance.primary_insurance && this.case.insurance.primary_insurance.insurance_company&& this.case.insurance.primary_insurance.insurance_company.id)
			
			{
				
				this.getBydefaultInsurance(this.case.insurance.primary_insurance.insurance_company)
				// this.getBydefaultInsurance("",this.case.insurance.primary_insurance.insurance_company.id);
			}

			if (this.case.insurance && this.case.insurance.primary_insurance && this.case.insurance.primary_insurance.adjustor) {
				let adjustor=this.case.insurance.primary_insurance.adjustor 
				 adjustor['full_name']= `${this.case.insurance.primary_insurance.adjustor.first_name ? this.case.insurance.primary_insurance.adjustor.first_name : ''} ${this.case.insurance.primary_insurance.adjustor.middle_name ? this.case.insurance.primary_insurance.adjustor.middle_name : ''} ${this.case.insurance.primary_insurance.adjustor.last_name ? this.case.insurance.primary_insurance.adjustor.last_name : ''}`
				this.lstAdjusterInformation = [adjustor] as any;
				let _control = getFieldControlByName(this.fieldConfigs, 'adjustor');
				let adjustor_control = getFieldControlByName(_control.children, 'id');
				if (adjustor_control) {
					adjustor_control.items = this.lstAdjusterInformation;
				}

			}

			this.form = event as FormGroup
			//edit mode 
			// event.patchValue(this.case);
			event.patchValue({
				id:this.case.id,
				purpose_of_visit_id: this.case.purpose_of_visit_id,
				accident_date:this.case.accident&&this.case.accident.accident_information?this.case.accident.accident_information.accident_date:'',
				attorney:this.case.attorney && this.case.attorney.attorney?this.case.attorney.attorney:new FormGroup({}),
				case_type_id:this.case.case_type_id,
				category_id:this.case.category_id,
				firm_id:this.case.attorney && this.case.attorney.firm_id?this.case.attorney.firm_id:'',
				firm_location:this.case.attorney && this.case.attorney.firm_location?this.case.attorney.firm_location:new FormGroup({}),
				firm_location_id:this.case.attorney && this.case.attorney.firm_location_id?this.case.attorney.firm_location_id:'',
				advertisement:this.case['advertisement']?this.case['advertisement']:new FormGroup({})
			})
			if(this.case.insurance && this.case.insurance.primary_insurance && this.case.insurance.primary_insurance)
			{
				if(this.case.insurance.primary_insurance.adjustor)
				{
					event.patchValue({
						adjustor: this.case.insurance && this.case.insurance.primary_insurance && this.case.insurance.primary_insurance.adjustor ? this.case.insurance.primary_insurance.adjustor:null,
					})
				}
				if(this.case.insurance.primary_insurance.insurance_company)
				{
					event.patchValue({
						insurance_company:this.case.insurance.primary_insurance.insurance_company,
					})
				}
				
			}
			
			event.get('attorney.attorney_id').patchValue(this.case.attorney.attorney_id);
			event.controls['purpose_of_visit_id'].setValue(this.case?.purpose_of_visit_id, { emitEvent: false })
			
			this.showhidePrivateHealthFormComponent(this.case.case_type_id);
			if(!this.aclService.hasPermission(this.userPermissions.patient_case_list_case_info_edit))
			{this.enableForm();
				
			}
			event.controls['accident_date'].setValue(this.case.accident && this.case.accident.accident_information?this.case.accident.accident_information.accident_date:null);
			event.controls['accident_date'].enable({ emitEvent: false });

				this.practicelocationForm = event.get('practice_locations') as FormGroup
			this.subscription.push(event.controls['practice_locations'].valueChanges.subscribe((value: number[]) => {
				const fixed_practices = this.case['case_practice_locations'].map(_=>{return _.practice_location_id});
				let new_value = [...value, ...fixed_practices]
				new_value = new_value.filter((item, index) => new_value.indexOf(item) === index)
				new_value = this.facilityNameCondition(new_value)
				event.controls['practice_locations'].patchValue(new_value, { emitEvent: false })
			}))
			this.subscription.push(event.controls['purpose_of_visit_id'].valueChanges.subscribe(value => {
				switch (value) {
					case 1:
						getFieldControlByName(this.fieldConfigs, 'case_type_id').options = this.caseLists.filter(_case => {
							if (_case.value != 6) { return _case }
						})
						event.patchValue({ case_type_id: '' }, { emitEvent: false })
						break;
					case 2:
						getFieldControlByName(this.fieldConfigs, 'case_type_id').options = this.caseLists.filter(_case => {
							if (_case.value == 3) { return _case }
						})
						event.patchValue({ case_type_id: 3 }, { emitEvent: false })
						break;
					case 3:
						getFieldControlByName(this.fieldConfigs, 'case_type_id').options = this.caseLists.filter(_case => {
							if (_case.value == 6) { return _case }
						})
						event.patchValue({ case_type_id: 6 }, { emitEvent: false })
						break;
					case 4:
						getFieldControlByName(this.fieldConfigs, 'case_type_id').options = this.caseLists.filter(_case => {
							if (_case.value != 6 && _case.value != 728) { return _case }
						})
						event.patchValue({ case_type_id: '' }, { emitEvent: false })
						break;
						case 5:
							getFieldControlByName(this.fieldConfigs, 'case_type_id').options = this.caseLists.filter(_case => {
								if (_case.value != 6 && _case.value != 728) { return _case }
							})
							event.patchValue({ case_type_id: '' }, { emitEvent: false })
							break;
			
				}
				
			}))
			
		} else {
			//create mode
			this.disableFields(true,['middle_name','last_name','email','fax','phone_no','ext','cell_no'],'attorney')
			event.controls['practice_locations'].enable({ emitEvent: false });
			event.controls['category_id'].disable({ emitEvent: false });
			event.controls['purpose_of_visit_id'].disable({ emitEvent: false });
			event.controls['case_type_id'].disable({ emitEvent: false });
			this.subscription.push(
				event.controls['practice_locations'].valueChanges.subscribe(data => {
						if (data && data.length > 0) {
						event.controls['category_id'].enable({ emitEvent: false });
						if(event.controls['category_id'].value)
						{
							event.controls['purpose_of_visit_id'].enable({ emitEvent: false });
						}
						if(event.controls['purpose_of_visit_id'].value)
						{
							event.controls['case_type_id'].enable({ emitEvent: false });
						}

					} else {

						event.controls['category_id'].disable({ emitEvent: false });
						event.controls['purpose_of_visit_id'].disable({ emitEvent: false });
						event.controls['purpose_of_visit_id'].disable({ emitEvent: false });
						event.controls['case_type_id'].disable({ emitEvent: false });
					}

				}))
				this.subscription.push(
					event.controls['category_id'].valueChanges.subscribe(categoryId => {
							if (categoryId ) {
						let category= this.masters&& this.masters.categories &&this.masters.categories.find(category=>category.id==categoryId);
						if(category)
						{
							event.patchValue({ purpose_of_visit_id: '' }, { emitEvent: false })
							this.addCategorySlug = category.slug ? category.slug : '';
						}
						else
						{
							this.addCategorySlug=''
						}
							event.controls['purpose_of_visit_id'].enable({ emitEvent: false });
							if(event.controls['purpose_of_visit_id'].value)
						{
							event.controls['case_type_id'].enable({ emitEvent: false });
						}
	
						} else {
							event.controls['purpose_of_visit_id'].disable({ emitEvent: false });
							event.controls['case_type_id'].disable({ emitEvent: false });

						}

					}))

			this.subscription.push(event.controls['purpose_of_visit_id'].valueChanges.subscribe(value => {
				if (value ) {
					event.controls['case_type_id'].enable({ emitEvent: false });

				} else {
					event.controls['case_type_id'].disable({ emitEvent: false });

				}
				switch (value) {
					case 1:
						getFieldControlByName(this.fieldConfigs, 'case_type_id').options = this.caseLists.filter(_case => {
							if(this.addCategorySlug == 'surgical') {
								if (_case.value != 6 && _case.value != 728) { 
									return _case 
								}
							}
							else {
								if (_case.value != 6) { 
									return _case 
								}
							}
						})
						event.patchValue({ case_type_id: '' }, { emitEvent: false })
						break;
					case 2:
						getFieldControlByName(this.fieldConfigs, 'case_type_id').options = this.caseLists.filter(_case => {
							if (_case.value == 3) { return _case }
						})
						event.patchValue({ case_type_id: 3 }, { emitEvent: false })
						break;
					case 3:
						getFieldControlByName(this.fieldConfigs, 'case_type_id').options = this.caseLists.filter(_case => {
							if (_case.value == 6) { return _case }
						})
						event.patchValue({ case_type_id: 6 }, { emitEvent: false })
						break;
					case 4:
						getFieldControlByName(this.fieldConfigs, 'case_type_id').options = this.caseLists.filter(_case => {
							if (_case.value != 6 && _case.value != 728) { return _case }
						})
						event.patchValue({ case_type_id: '' }, { emitEvent: false })
						break;
						case 5:
							getFieldControlByName(this.fieldConfigs, 'case_type_id').options = this.caseLists.filter(_case => {
								if (_case.value != 6 && _case.value != 728) { return _case }
							})
							event.patchValue({ case_type_id: '' }, { emitEvent: false })
							break;
				}
			}))
			this.subscription.push(event.controls['practice_locations'].valueChanges.subscribe((value: number[]) => {
				if(!this.case){
				value = this.facilityNameConditionForCreate(value)
				event.controls['practice_locations'].patchValue(value, { emitEvent: false })
				}
			}))
		}
	}
	
	


	facilityloc: any = []


	onClearPracticeLocation($event){
	}

	public handleAddressChange(address: Address) {
		let street_number = this.fd_services.getComponentByType(address, 'street_number');
		let route = this.fd_services.getComponentByType(address, 'route');
		let city = this.fd_services.getComponentByType(address, 'locality');
		let state = this.fd_services.getComponentByType(address, 'administrative_area_level_1');
		let postal_code = this.fd_services.getComponentByType(address, 'postal_code');
		let lat = address.geometry.location.lat();
		let lng = address.geometry.location.lng();

		if (street_number != null) {
			let address: any;
			address = street_number.long_name + ' ' + route.long_name;

			(this.form.controls['firm_location'] as FormGroup).patchValue({
				street_address: address,
				city: city.long_name,
				state: state.long_name,
				zip: postal_code.long_name,
				lat: lat,
				lng: lng,
			});
		} else {
			(this.form.controls['firm_location'] as FormGroup).patchValue({
				address: '',
				city: '',
				state: '',
				zip: '',
				lat: '',
				lng: '',
			});
		}
	}

	public handleAddressChangeInInsurance(address: Address) {
			let street_number = this.fd_services.getComponentByType(address, 'street_number');
			let route = this.fd_services.getComponentByType(address, 'route');
			let city = this.fd_services.getComponentByType(address, 'locality');
			let state = this.fd_services.getComponentByType(address, 'administrative_area_level_1');
			let postal_code = this.fd_services.getComponentByType(address, 'postal_code');
			let lat = address.geometry.location.lat();
			let lng = address.geometry.location.lng();
	
			if (street_number != null) {
				let address: any;
				address = street_number.long_name + ' ' + route.long_name;
	
				(this.form.controls['insurance_company']as FormGroup).patchValue({
					street_address: address,
					city: city.long_name,
					state: state.long_name,
					zip: postal_code.long_name,
					lat: lat,
					lng: lng,
				});
			} else {
				(this.form.controls['insurance_company']as FormGroup).patchValue({
					street_address: '',
					city: '',
					state: '',
					zip: '',
					lat: '',
					lng: '',
				});
			}
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

		let paramQuery: any = { filter: true, order: OrderEnum.DEC, pagination: 1,order_by:order_by,page:this.firmPaginationSetting.currentPage,per_page:this.firmPaginationSetting.per_page,attorney_id:attorneyid,dropDownFilter:true }
		paramQuery = removeEmptyKeysFromObject(paramQuery);
		let filter = {}
		firmid ? filter['id'] = firmid : null
		name ? filter['name'] = name : null
		// order_by ? filter['order_by'] = order_by : null
		return this.requestService.sendRequest(FirmUrlsEnum.AllFirms_list_GET, 'get', REQUEST_SERVERS.fd_api_url, { ...paramQuery, ...filter })
	}

	searchFirm(name) {

		return new Observable((res) => {
			let attorney_varified=(this.form.controls['attorney']as FormGroup).controls['attorney_verified'].value;
			console.log(this.form.value.attorney);
			let attorneyid=this.form.value.attorney && attorney_varified?this.form.value.attorney.attorney_id:null;
			if(attorney_varified){
			if(!this.lstFirm.length)
			{
				this.resetFirmPagination();
				this.subscription.push(this.getFirm(name, '',attorneyid).subscribe(data => {
				this.firmPaginationSetting.currentPage = parseInt(data.result.current_page);
				this.firmPaginationSetting.lastPage = parseInt(data.result.last_page);
				this.firmPaginationSetting.search = name;
				this.lstFirm = data['result']['data'];
				res.next(this.lstFirm);
				}))
			}
			else
			{
				res.next(this.lstFirm);
			}
			}else{
				if(this.form.value.attorney.attorney_id){
					res.next([]);
				}else{
				this.resetFirmPagination();
				this.subscription.push(this.getFirm(name, '',attorneyid).subscribe(data => {
				this.firmPaginationSetting.currentPage = parseInt(data.result.current_page);
				this.firmPaginationSetting.lastPage = parseInt(data.result.last_page);
				this.firmPaginationSetting.search = name;
				this.lstFirm = data['result']['data'];
				res.next(this.lstFirm);
				}))
				}
			}
		})

	}

	onFocusSearchFirm(name) {
		return new Observable((res) => {
			let attorney_varified=(this.form.controls['attorney']as FormGroup).controls['attorney_verified'].value;
			console.log(this.form.value.attorney);
			let attorneyid=this.form.value.attorney && attorney_varified?this.form.value.attorney.attorney_id:null;
			if(attorney_varified){
			if(!this.lstFirm.length)
			{
				this.resetFirmPagination();
				this.subscription.push(this.getFirm(name, '',attorneyid).subscribe(data => {
				this.firmPaginationSetting.currentPage = parseInt(data.result.current_page);
				this.firmPaginationSetting.lastPage = parseInt(data.result.last_page);
				this.firmPaginationSetting.search = name;
				this.lstFirm = data['result']['data'];
				res.next(this.lstFirm);
				}))
			}
			else
			{
				res.next(this.lstFirm);
			}
			}else{
				if(this.form.value.attorney.attorney_id){
					res.next([]);
				}else{
				this.resetFirmPagination();
				this.subscription.push(this.getFirm(name, '',attorneyid).subscribe(data => {
				this.firmPaginationSetting.currentPage = parseInt(data.result.current_page);
				this.firmPaginationSetting.lastPage = parseInt(data.result.last_page);
				this.firmPaginationSetting.search = name;
				this.lstFirm = data['result']['data'];
				res.next(this.lstFirm);
				}))
				}
			}
		})

	}
	searchFirmScrollToEnd()
	{
		return new Observable((res) => {
			if (this.firmPaginationSetting.currentPage < this.firmPaginationSetting.lastPage) {
				this.firmPaginationSetting.currentPage += 1;
				this.firmPaginationSetting.currentPage = this.firmPaginationSetting.currentPage;
				let attorney_varified=(this.form.controls['attorney']as FormGroup).controls['attorney_verified'].value
				let attorneyid=this.form.value.attorney && attorney_varified?this.form.value.attorney.attorney_id:null
				this.subscription.push(this.getFirm(this.firmPaginationSetting.search, '',attorneyid).subscribe(data => {
					this.firmPaginationSetting.currentPage = parseInt(data.result.current_page);
					this.firmPaginationSetting.lastPage = parseInt(data.result.last_page);
					let result = data['result']['data'];
					this.lstFirm = [...this.lstFirm, ...result];
					res.next(this.lstFirm);
					}));
			}
		})		
	}
	searchInsuranceScrollToEnd()
	{
		return new Observable((res) => {
			if (this.InsurancePaginationSetting.currentPage < this.InsurancePaginationSetting.lastPage) {
				this.InsurancePaginationSetting.currentPage += 1;
				this.InsurancePaginationSetting.currentPage = this.InsurancePaginationSetting.currentPage;
				let adjustor_varified=(this.form.controls['adjustor']as FormGroup).controls['adjustor_verified'].value;
				let attorney_varified=(this.form.controls['attorney']as FormGroup).controls['attorney_verified'].value
				let adjustorid=this.form.value.adjustor && adjustor_varified? this.form.value.adjustor.id:null;
					let insuranceid=this.form.value.insurance_company?this.form.value.insurance_company.id:null;
					this.subscription.push(this.getInsurances(this.InsurancePaginationSetting.search, '',adjustorid).subscribe(data => {
					this.InsurancePaginationSetting.lastPage = parseInt(data.result.pages);
					let result = data['result']['data'];
					this.lstInsurance = [...this.lstInsurance , ...result];
					res.next(this.lstInsurance);
					}));
			}
		})		
	}
	searchAttorneyScrollToEnd()
	{
		return new Observable((res) => {
			if (this.AttorneyPaginationSetting.currentPage < this.AttorneyPaginationSetting.lastPage) {
				this.AttorneyPaginationSetting.currentPage += 1;
				this.AttorneyPaginationSetting.currentPage = this.AttorneyPaginationSetting.currentPage;
				let firm_varified=this.form.controls['firm_verified'].value;
				let firm_id=this.form.value.firm_id && firm_varified?this.form.value.firm_id:null
				this.subscription.push(this.getAttorney(this.AttorneyPaginationSetting.search, '', firm_id).subscribe(data => {
				this.AttorneyPaginationSetting.currentPage = parseInt(data.result.current_page);
				this.AttorneyPaginationSetting.lastPage = parseInt(data.result.last_page);
				let result = data['result']['data'];
				this.lstAttorney = [...this.lstAttorney,...result]
				res.next(this.lstAttorney);
				}));
			}
		})		
	}
	searchAdjusterScrollToEnd()
	{
		return new Observable((res) => {
			if (this.AdjusterPaginationSetting.currentPage < this.AdjusterPaginationSetting.lastPage) {
				this.AdjusterPaginationSetting.currentPage += 1;
				let insurance_varified=(this.form.controls['insurance_company']as FormGroup).controls['insurance_verified'].value;
				let insuranceid=this.form.value.insurance_company && insurance_varified?this.form.value.insurance_company.id:null;
				this.subscription.push(this.getAdjustor(this.AdjusterPaginationSetting.search,null,insuranceid).subscribe(data => {
				this.AdjusterPaginationSetting.lastPage = parseInt(data.result.pages);
				let result = data['result']['data'];
				this.lstAdjusterInformation = [...this.lstAdjusterInformation,...result];
				res.next(this.lstAdjusterInformation);
				}));
			}
		});
	}

	searchFirmTypeHead(res)
	{
		// this.firms_filter.searchKey=res;
		// this.firms_filter.page=1;
		// this.firms_filter.lastPage=2
		// this.lstFirms=[]
		// return new Promise((res) => {	
		// 		let body = {
		// 			page: this.firms_filter.page,
		// 			value: this.firms_filter.searchKey,
		// 			per_page: this.firms_filter.per_page,	
		// 			keyName:'name'
		// 		};	
		// 		this.getFirm(this.getQueryParams(body), this.API_URL(FirmUrlsEnum.AllFirms_list_GET)).subscribe((data) => {
		// 			let result = [...data['result']['data']];	
		// 			this.firms_filter.lastPage = data.result.last_page;
		// 			this.lstFirms = [...this.lstFirms, ...result];
		// 			res(this.lstFirms);
		// 		});
		// })
	}	
	resetFirmPagination() {
		this.firmPaginationSetting = {
		search:'',
		lastPage:null,
		currentPage:1,
		per_page:10
		}
	}
	resetInsurancePagination() {
		this.InsurancePaginationSetting = {
		search:'',
		lastPage:null,
		currentPage:1,
		per_page:10
		}
	}
	resetAdjusterPagination() {
		this.AdjusterPaginationSetting = {
			search:'',
			lastPage:null,
			currentPage:1,
			per_page:10
			}
	}
	resetAttorneyPagination() {
		this.AttorneyPaginationSetting = {
			search:'',
			lastPage:null,
			currentPage:1,
			per_page:10
			}
	}
	getInsurances(name?, Insuranceid?,adjustorid?) {
		let order_by;
		let order;
		if(name)
		{
			order_by='insurance_name';
			order=OrderEnum.ASC	;
		
		}
		else
		{
			order_by='count';
			order=OrderEnum.DEC	
			
		}
		let paramQuery: any = { order: order, pagination: true, filter: false, page: this.InsurancePaginationSetting.currentPage, per_page: this.InsurancePaginationSetting.per_page, dropDownFilter:true,
			order_by: order_by,adjustor_id: adjustorid?adjustorid:null }
			paramQuery = removeEmptyKeysFromObject(paramQuery);
		let filter = {}
		if (Insuranceid) {
			paramQuery.filter = true;
			filter['id'] = Insuranceid
		}
		if (name) {
			paramQuery.filter = true;
			filter['insurance_name'] = name
		}
		// paramQuery['all_listing'] = true;
		return this.requestService.sendRequest(InsuranceUrlsEnum.Insurance_list_GET, 'get', REQUEST_SERVERS.billing_api_url, { ...paramQuery, ...filter })
	}

	SearchInsurance(name) {
		return new Observable((res) => {
			let adjustor_varified=(this.form.controls['adjustor']as FormGroup).controls['adjustor_verified'].value;
			let attorney_varified=(this.form.controls['attorney']as FormGroup).controls['attorney_verified'].value
			let adjustorid=this.form.value.adjustor && adjustor_varified? this.form.value.adjustor.id:null;
				let insuranceid=this.form.value.insurance_company?this.form.value.insurance_company.id:null;
		if(attorney_varified){
			this.resetInsurancePagination();
			this.subscription.push(this.getInsurances(name,null,adjustorid).subscribe(data => {
				this.InsurancePaginationSetting.lastPage = parseInt(data.result.pages);
				this.InsurancePaginationSetting.search = name;
				this.lstInsurance = data['result'].data?data['result'].data:[]
				res.next(this.lstInsurance)
			}))
		}else{
			if(this.form.value.attorney.attorney_id){
				res.next([]);
			}else{
				this.resetInsurancePagination();
				this.subscription.push(this.getInsurances(name,null,adjustorid).subscribe(data => {
					this.InsurancePaginationSetting.lastPage = parseInt(data.result.pages);
					this.InsurancePaginationSetting.search = name;
					this.lstInsurance = data['result'].data?data['result'].data:[]
					res.next(this.lstInsurance)
				}))
			}
		}
		})
	}

	initializeform(data?) {
		this.case;
		this.fieldConfigs = [
			new DivClass([
				new DynamicControl('request_from_front_desk', true),
				new NgSelectClass("Practice Location*", 'practice_locations', 'facility_full_name', 'id', this.searchPracticeLocations.bind(this), true, null, [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-sm-6'],[],null,null,null,null,this.getPracticesOnOpen.bind(this),this.searchPracticeLocationsScrollToEnd.bind(this),this.searchTypeHead$,this.searchTypeHead.bind(this), null, true),

				new SelectClass('Category*', 'category_id',
					[

					],
					'',
					[
						{ name: 'required', message: 'This field is required', validator: Validators.required }
					],
					['col-sm-6']
				),
				new SelectClass('Purpose of Visit*', 'purpose_of_visit_id',
					[],
					'',
					[{ name: 'required', message: 'This field is required', validator: Validators.required }],
					['col-sm-6']
				),
				new SelectClass('Case Type*', 'case_type_id',
					[],
					'',
					[
						{ name: 'required', message: 'This field is required', validator: Validators.required }
					],
					['col-sm-6'],
				),
				new InputClass('DOA * (mm/dd/yyyy)', 'accident_date', InputTypes.date, '', [
					{ name: 'required', message: 'This field is required', validator: Validators.required }
				], '', ['col-sm-6 parent-horizontal-label'], { max: new Date() }),
				new CheckboxClass('Transferred Case', 'is_transferring_case', InputTypes.checkbox, false, [], '', ['col-sm-4']),
			], ['row']),
			
			
			new DivClass([
				
				new DynamicControl('id', null),	
				   new NgSelectClass("Firm's Name", 'firm_id', 'name', 'id', this.searchFirm.bind(this), false, null, [], '', ['col-12 col-sm-6'],[],{add_tag: true},null,null,this.searchFirm.bind(this),this.onFocusSearchFirm.bind(this),this.searchFirmScrollToEnd.bind(this),null,null),
				// new NgSelectClass("Firm", 'firm_id', 'name', 'id', this.searchFirm.bind(this), true, null, [], '', ['col-sm-6 col-md-3'],[],null,null,null,null,this.searchFirm.bind(this),this.searchFirmScrollToEnd.bind(this),this.searchFirmTypeHead$,this.searchFirmTypeHead.bind(this)),
				new NgSelectClass(' Location', 'firm_location_id', 'location_name', 'id', null, false, null, [], '', ['col-12 col-sm-6'],[],{add_tag:true}),
				new DynamicControl('firm_location_name', ''),
				new DynamicControl('firm_verified', false),
				new DivClass([
					new DynamicControl('firm_location_name_verified', false),
					new DynamicControl('location_name', ''),
					new DynamicControl('firm_name', ''),
					new DynamicControl('first_name', ''),
					new DynamicControl('middle_name', ''),
					new DynamicControl('last_name', ''),
					new AddressClass('Street Address*', 'street_address', this.handleAddressChange.bind(this), '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-md-6', 'col-12 col-sm-6']),
					new InputClass('Suite/Floor', 'apartment_suite', InputTypes.text, data && data['apartment'] ? data['apartment'] : '', [], '', ['col-md-6', 'col-12 col-sm-6']),
					new InputClass('City*', 'city', InputTypes.text, data && data['city'] ? data['city'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-md-4', 'col-12 col-sm-6 col-md-4']),
					new InputClass('State*', 'state', InputTypes.text, data && data['state'] ? data['state'] : '',[{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-md-4', 'col-12 col-sm-6 col-md-4']),
					// new InputClass('Zip', 'zip', InputTypes.text, data && data['zip'] ? data['zip'] : '', [], '', ['col-md-4', 'col-12 col-sm-6 col-md-4'], { mask: '00000', readonly: true, skip_validation: true }),
					new InputClass('Zip*', 'zip', InputTypes.text, data && data['zip'] ? data['zip'] : '', [{name:'pattern', message:ZipFormatMessages.format_usa,validator:Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')},{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-md-4', 'col-12 col-sm-6 col-md-4'], {  skip_validation: true }),
					// new DynamicControl('firm_verified', false),
				], ['display-contents'], '', '', { formControlName: 'firm_location' }),
			], ['row'],"Firm's Information"),
			new DivClass([
				new DivClass([
					new DynamicControl('id', null),
					//  new NgSelectClass("Name", 'attorney_id', 'full_name', 'id', this.searchAttorney.bind(this), false, null, [], '', ['col-12 col-sm-6 col-md-4'],[],{add_tag:true},null,null,null, this.onFocussearchAttorney.bind(this),this.searchAttorneyScrollToEnd.bind(this),null,null),
					 new NgSelectClass("First Name", 'attorney_id', 'first_name', 'id', this.searchAttorney.bind(this), false, null, [], '', ['col-12 col-sm-6 col-md-4'],[],{add_tag:true},null,null,this.searchAttorney.bind(this),this.onFocussearchAttorney.bind(this),this.searchAttorneyScrollToEnd.bind(this),null,null),
					 new DynamicControl('first_name', ''),
					 new InputClass('Middle Name', 'middle_name', InputTypes.text, data && data['middle_name'] ? data['middle_name'] : '', [], '', ['col-md-4', 'col-6 col-sm-6']),
					//  new DynamicControl('middle_name', ''),
					 new InputClass('Last Name*', 'last_name', InputTypes.text, data && data['last_name'] ? data['last_name'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-md-4', 'col-6 col-sm-6']),
					//  new DynamicControl('last_name', ''),
					 new InputClass('Email', 'email', InputTypes.email, data && data['email1'] ? data['email1'] : '', [{ name: 'pattern', message: 'Email is not valid', validator: Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$') }], '', ['col-12 col-sm-6 col-md-4'], ),
					new InputClass('Fax', 'fax', InputTypes.text, data && data['fax'] ? data['fax'] : '', [], '', ['col-12 col-sm-6 col-md-4'], { mask: '000-000-0000', }),
					new InputClass('Work Phone', 'phone_no', InputTypes.text, data && data['workPhone'] ? data['workPhone'] : '', [], '', ['col-12 col-sm-6 col-md-4'], { mask: '000-000-0000',  }),
					new InputClass('Extension', 'ext', InputTypes.text, data && data['cellPhone'] ? data['cellPhone'] : '', [], '', ['col-12 col-sm-6 col-md-4'], ),
					new InputClass('Cell Phone', 'cell_no', InputTypes.text, data && data['personalPhone'] ? data['personalPhone'] : '', [], '', ['col-12 col-sm-6 col-md-4'], { mask: '000-000-0000',  }),
					new DynamicControl('attorney_verified', false),
				], ['display-contents'], '', '', { formControlName: 'attorney' }),
			], ['row'], "Attorney's Information"),

			new DivClass([
				new DivClass([
					new DynamicControl('id', null),
					new DivClass([], []),

					new DivClass([
						// new NgSelectClass('Insurance Name', 'id', 'insurance_name', 'id', this.SearchInsurance.bind(this), false, null, [], null, ['col-sm-6', 'col-md-4', 'col-xl-3'],[],{add_tag:true},null,this.searchInsuranceScrollToEnd.bind(this),null,this.onFocusGetInsurance.bind(this)),
						new NgSelectClass("Insurance Name", 'id', 'insurance_name', 'id', this.SearchInsurance.bind(this), false, null, [], null, ['col-sm-6', 'col-md-4', 'col-xl-3'],[],{add_tag:true},null,null,this.SearchInsurance.bind(this),this.onFocusGetInsurance.bind(this),this.searchInsuranceScrollToEnd.bind(this),null,null),
						new InputClass('Insurance Code', 'insurance_code', InputTypes.text, data && data['insurance_code'] ? data['insurance_code'] : '', [], '', ['col-sm-6', 'col-md-4', 'col-xl-3']),
						new DynamicControl('name', null),

						new NgSelectClass('Insurance Location', 'location_id', 'location_name', 'id', null, false, null, [], '', ['col-sm-6', 'col-md-4', 'col-xl-3'],[],{add_tag:true}),
						new DynamicControl('location', null),
						new DynamicControl('insurance_location_verified', false),
						new DynamicControl('insurance_verified', false),
						new InputClass('Location Code', 'location_code', InputTypes.text, '', [], '', ['col-sm-6', 'col-md-4', 'col-xl-3'], ),
						// new SelectClass('Plan name', 'planName', [], '', [], ['col-md-4', 'col-sm-3']),
						new AddressClass('Street Address*', 'street_address',  this.handleAddressChangeInInsurance.bind(this), '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-sm-6', 'col-md-4', 'col-xl-6'], ),
						new InputClass('Suite Floor', 'apartment_suite', InputTypes.text, data && data['apartment'] ? data['apartment'] : '', [], '', ['col-sm-6', 'col-md-4', 'col-xl-3'], ),
						new InputClass('Email', 'email', InputTypes.text, '', [], '', ['col-sm-6', 'col-md-4', 'col-xl-3'], ),

						new InputClass('City*', 'city', InputTypes.text, data && data['city'] ? data['city'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-sm-6', 'col-md-4', 'col-xl-3'], ),
						new InputClass('State*', 'state', InputTypes.text, data && data['state'] ? data['state'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-sm-6', 'col-md-4', 'col-xl-3'], ),
						// new InputClass('Zip', 'zip', InputTypes.text, data && data['zip'] ? data['zip'] : '', [], '', ['col-sm-6', 'col-md-4', 'col-xl-3'], { readonly: true }),
						new InputClass('Zip*', 'zip', InputTypes.text, data && data['zip'] ? data['zip'] : '', [{name:'pattern', message:ZipFormatMessages.format_usa,validator:Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')},{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-sm-6', 'col-md-4', 'col-xl-3'], ),
						new InputClass('Fax', 'fax', InputTypes.text, data && data['fax'] ? data['fax'] : '', [
							// { name: 'minlength', message: 'Length can not be less then 10', validator: Validators.minLength(10) }
						], '', ['col-sm-6', 'col-md-4', 'col-xl-3'], { mask: '000-000-0000'}),

						new InputClass('Phone Number', 'phone_no', InputTypes.text, data && data['workPhone'] ? data['workPhone'] : '', [
							// { name: 'minlength', message: 'Length can not be less then 10', validator: Validators.minLength(10) }
						], '', ['col-sm-6', 'col-md-4', 'col-xl-3'], { mask: '000-000-0000', }),
						new InputClass('Extension', 'ext', InputTypes.text, data && data['workExt'] ? data['workExt'] : '', [
							// { name: 'minlength', message: 'Length can not be less then 10', validator: Validators.minLength(10) }
						], '', ['col-sm-6', 'col-md-4', 'col-xl-3'],),
						new InputClass('Cell No.', 'cell_no', InputTypes.text, data && data['cellPhone'] ? data['cellPhone'] : '', [
							// { name: 'minlength', message: 'Length can not be less then 10', validator: Validators.minLength(10) }
						], '', ['col-sm-6', 'col-md-4', 'col-xl-3'], { mask: '000-000-0000', }),
					

					], ['display-contents'], "Insurance Information", '', { formControlName: 'insurance_company' }),
				], ['row']),

				new DivClass([
					// new DynamicControl('id', null),
					new NgSelectClass('First Name', 'id', 'first_name', 'id', this.searchAdjusterInformation.bind(this), false, null, [], '', ['col-sm-6', 'col-md-4'],[],{add_tag:true},null,null,this.searchAdjusterInformation.bind(this), this.onFocusSearchAdjusterInformation.bind(this),this.searchAdjusterScrollToEnd.bind(this),null,null),
					new DynamicControl('first_name', null),
					// new DynamicControl('middle_name', null),
					// new DynamicControl('last_name', null),
					new InputClass('Middle Name', 'middle_name', InputTypes.text, data && data['middle_name'] ? data['middle_name'] : '', [], '', ['col-md-4', 'col-6 col-sm-6']),
					//  new DynamicControl('middle_name', ''),
					 new InputClass('Last Name*', 'last_name', InputTypes.text, data && data['last_name'] ? data['last_name'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-md-4', 'col-6 col-sm-6']),
					new InputClass('Email', 'email', InputTypes.email, data && data['email'] ? data['email'] : '', [{ name: 'pattern', message: 'Email is not valid', validator: Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$') }], '', ['col-lg-3', 'col-md-6']),
					new InputClass('Fax', 'fax', InputTypes.text, data && data['fax'] ? data['fax'] : '', [
						// { name: 'minlength', message: 'Length can not be less then 10', validator: Validators.minLength(10) }
					], '', ['col-sm-6', 'col-md-4'], { mask: '000-000-0000' }),

					new InputClass('Phone No.', 'phone_no', InputTypes.text, data && data['phone_no'] ? data['phone_no'] : '', [
						// { name: 'minlength', message: 'Length can not be less then 10', validator: Validators.minLength(10) }
					], '', ['col-sm-6', 'col-md-4'], { mask: '000-000-0000' }),
					new InputClass('Extension', 'ext', InputTypes.text, data && data['ext'] ? data['ext'] : '', [
						// { name: 'minlength', message: 'Length can not be less then 10', validator: Validators.minLength(10) }
					], '', ['col-sm-6', 'col-md-4']),
					new InputClass('Cell No.', 'cell_no', InputTypes.text, data && data['cell_no'] ? data['cell_no'] : '', [
						// { name: 'minlength', message: 'Length can not be less then 10', validator: Validators.minLength(10) }
					], '', ['col-sm-6', 'col-md-4'], { mask: '000-000-0000' }),
					new DynamicControl('adjustor_verified', false),
				], ['row'], "Adjuster's Information", '', { formControlName: 'adjustor' }),

				new DivClass([
					new DynamicControl('id', null),
					new InputClass('Account Manager', 'account_manager', InputTypes.text, data && data['account_manager'] ? data['account_manager'] : '', [
					], '', ['col-sm-6', 'col-md-4'], {})
				], ['row'], "Marketing", '', { formControlName: 'advertisement' }),
				
				new DivClass([
				
				], ['row', 'form-btn', 'justify-content-center'], '', '', { name: 'button-div' })
			], ['display-contents'], '', '', { name: 'form' }),
			new DynamicControl('is_deleted', false),
		]
		
	}
	searchAttorney(name) {
		return new Observable((res) => {
			let firm_varified=this.form.controls['firm_verified'].value;
			let firm_id=this.form.value.firm_id && firm_varified?this.form.value.firm_id:null
			this.resetAttorneyPagination();
			this.subscription.push(this.getAttorney(name, '', firm_id).subscribe(data => {
				this.lstAttorney = (data['result']&&data['result']['data'])?data['result']['data']:[]
				this.AttorneyPaginationSetting.currentPage = parseInt(data.result.current_page);
				this.AttorneyPaginationSetting.lastPage = parseInt(data.result.last_page);
				this.AttorneyPaginationSetting.search = name;
				res.next(this.lstAttorney);
			}))
		})
	}

	getAttorney(name, id, firm_id) {
		let order_by;
		let order;
		if(name)
		{
			order_by=null;
			order=OrderEnum.ASC	
		}
		else
		{
			order_by='count';
			order=OrderEnum.DEC	
		}

		let paramQuery: ParamQuery = { filter: false, order: order, pagination: true,order_by:order_by,page: this.AttorneyPaginationSetting.currentPage, per_page: this.AttorneyPaginationSetting.per_page,dropDownFilter:true,}
		paramQuery = removeEmptyKeysFromObject(paramQuery);
		let filter = {}
		id ? filter['id'] = id : null
		name ? filter['name'] = name : null;
		firm_id ? filter['firm_id'] = firm_id : null;
		return this.requestService.sendRequest(AttorneyUrlsEnum.attorney_list_GET, 'get', REQUEST_SERVERS.fd_api_url, { ...paramQuery, ...filter })
		.pipe(
		map(response => {
			let lst: any[] = response['result']['data'];
			lst = lst.map(attorney => {
				return { ...attorney, full_name: `${attorney.first_name} ${attorney.middle_name ? attorney.middle_name : ''} ${attorney.last_name}` }
			})
			response['result']['data'] = lst
			return response
		}));
	}

	searchPracticeLocations(name) {
		return new Observable((res) => {
			let attorneyid=this.form.value.attorney?this.form.value.attorney.attorney_id:null;

		})

	}

	getPracticeBydefault(name? ,ids?:any[])
	{
		let values = 	this.case['case_practice_locations'].map(item => {
			return 	item.practice_location_id;	
		});
			this.practice_location_filter.page=1;
			let body = {
				page: this.practice_location_filter.page,
				name: name,
				filter:true,
				per_page: this.practice_location_filter.per_page,
				facility_location_ids:values

			};
			this.subscription.push(this.caseFlowService.searchPractice(body).subscribe((data) => {
				let practices = [...data['result']['data']];
				this.lstpractiseLocation=practices
		getFieldControlByName(this.fieldConfigs, 'practice_locations').items=this.lstpractiseLocation
		if (this.case && this.case['case_practice_locations'] && this.fieldConfigs) {
			let values = 	this.case['case_practice_locations'].map(item => {
					return 	item.practice_location_id;	
				});
			getFieldControlByName(this.fieldConfigs, 'practice_locations').form.controls['practice_locations'].setValue([...values]);
			}
		}))

	}
	facilityLocationsArray = [];
	getPracticesOnOpen() {
		return new Observable((res) => {
			if (this.lstpractiseLocation.length == 0) {
				this.practice_location_filter.page+=1;
				let search_key= this.form.value.pra?this.form.value.attorney.attorney_id:null;
				let body = {
					page: this.practice_location_filter.page,
					name: this.practice_location_filter.searchKey,
					per_page: this.practice_location_filter.per_page,
				};
	
				this.subscription.push(this.caseFlowService.searchPractice(body).subscribe((data) => {
					let result = [...data['result']['data']];
	
					this.practice_location_filter.searchKey = '';
	
					this.practice_location_filter.lastPage = data.result.last_page;
					let lstpractiseLocation = [...this.lstpractiseLocation, ...result];
					this.lstpractiseLocation.forEach(x => {
						if(x.id){
							x['is_select']= "all";
						}
					})
					this.lstpractiseLocation = this.getlstpractiseLocation(lstpractiseLocation);
					res.next(this.lstpractiseLocation);
	
				}));
	
			}
		})
	}
	getlstpractiseLocation(lstpractiseLocation) {
		let locations:any = [];
		let storeFacilityLocationIds = this.storageData.getFacilityLocations();
		lstpractiseLocation.forEach(location => {
			if (storeFacilityLocationIds.includes(location.id)) {
				locations.push(location)
			}
		});
		return locations;
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
	
				this.subscription.push(this.caseFlowService.searchPractice(body).subscribe((data) => {
	
					let result = [...data['result']['data']];
	
					this.practice_location_filter.lastPage = data.result.last_page;
					let lstpractiseLocation = [...this.lstpractiseLocation, ...result];
					this.lstpractiseLocation.forEach(x => {
						if(x.id){
							x['is_select']= "all";
						}
					})

					this.lstpractiseLocation = this.getlstpractiseLocation(lstpractiseLocation);
					res.next(this.lstpractiseLocation);
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
	
				this.subscription.push(this.caseFlowService.searchPracticeTypahead(body).subscribe((data) => {
					
					let result = [...data['result']['data']];
					this.allPracticeLocations=[...this.allPracticeLocations,...result];
					this.practice_location_filter.lastPage = data.result.last_page;
					let lstpractiseLocation = [...this.lstpractiseLocation, ...result];
					lstpractiseLocation = _.uniqBy(lstpractiseLocation, 'id');
					this.lstpractiseLocation = this.getlstpractiseLocation(lstpractiseLocation);
					res.next(this.lstpractiseLocation);
				}));
	
			// }
	
		})
	}



	onFocussearchAttorney(name) {
		return new Observable((res) => {
			if(!this.lstAttorney.length)
			{
				let firm_varified=this.form.controls['firm_verified'].value;
				
				let firm_id=this.form.value.firm_id && firm_varified?this.form.value.firm_id:null
				this.resetAttorneyPagination();	
				this.subscription.push(this.getAttorney(name, '', firm_id).subscribe(data => {
					this.AttorneyPaginationSetting.currentPage = parseInt(data.result.current_page);
					this.AttorneyPaginationSetting.lastPage = parseInt(data.result.last_page);
					this.lstAttorney = (data['result']&&data['result']['data'])?data['result']['data']:[]
					res.next(this.lstAttorney)
				}))
			}
			else
			{
				res.next(this.lstAttorney)
			}
			
		})
	}
	
	onFocusGetInsurance()
	{
		return new Observable((res) => {
					let adjustor_varified=(this.form.controls['adjustor']as FormGroup).controls['adjustor_verified'].value;
					let adjustorid=this.form.value.adjustor && adjustor_varified? this.form.value.adjustor.id:null;
					let insuranceid=this.form.value.insurance_company?this.form.value.insurance_company.id:null;
					if(adjustor_varified){
					if(!this.lstInsurance.length){
						this.resetInsurancePagination();		
						this.subscription.push(this.getInsurances(null,insuranceid,adjustorid).subscribe(data => {					
							this.InsurancePaginationSetting.lastPage = parseInt(data.result.pages);
							let insurance: BillingInsuranceModel[] =  data['result']&&data['result']['data']?data['result']['data']:[]
							this.lstInsurance = [...insurance];	
							res.next(this.lstInsurance);
						}))
					}			
					else{
						res.next(this.lstInsurance);
					}
					}else{
						if(this.form.value.adjustor.id){
							res.next([]);
						}else{
							this.resetInsurancePagination();		
							this.subscription.push(this.getInsurances(null,insuranceid,adjustorid).subscribe(data => {					
							this.InsurancePaginationSetting.lastPage = parseInt(data.result.pages);
							let insurance: BillingInsuranceModel[] =  data['result']&&data['result']['data']?data['result']['data']:[]
							this.lstInsurance = insurance && insurance.length ? [...insurance] : this.lstInsurance;	
							res.next(this.lstInsurance);
						}))
						}
					}
	})	
	}

	lstPlanName: any[] = []
	searchPlanName(name) {
		return new Observable((res) => {
			this.subscription.push(this.getPlanName(name).subscribe(data => {
				this.lstPlanName = data['result'].data;
				res.next(this.lstPlanName)
			}))
		})
	}
	getPlanName(name?, id?) {
		let paramQuery: ParamQuery = { order: OrderEnum.ASC, pagination: true, filter: false, page: 1, per_page: 10, order_by: 'plan_name' }
		let filter = {}
		if (id) {
			paramQuery.filter = true;
			filter['id'] = id
		}
		if (name) {
			paramQuery.filter = true;
			filter['plan_name'] = name
		}
		return this.requestService.sendRequest(PlanNameUrlsEnum.PlanNAme_list_GET, 'get', REQUEST_SERVERS.billing_api_url, { ...paramQuery, ...filter })
	}

	getAdjustor(name?, adjustorid?,insuranceid?) {
		// /adjuster/get-adjustor?insurance_id=192&name=shasna&pagination=true&page=1&per_page=1
	
		let order_by;
		let order;
		if(name)
		{
			order_by=null;
			order=OrderEnum.ASC	
		}
		else
		{
			order_by='count';
			order=OrderEnum.DEC	
		}

		let url = AdjusterInformationUrlsEnum.insurance_adjuster_list_Get;
		let paramQuery: any = { order: order, pagination: true, filter: false, page: this.AdjusterPaginationSetting.currentPage, per_page: this.AdjusterPaginationSetting.per_page, dropDownFilter:true,
			order_by: order_by,insurance_id:insuranceid?insuranceid:null }

			paramQuery = removeEmptyKeysFromObject(paramQuery);


		let filter = {}
		if (adjustorid) {
			paramQuery.filter = true;
			filter['adjuster_id'] = adjustorid
			url = AdjusterInformationUrlsEnum.adjuster_list_GET
		}
		if (name) {
			paramQuery.filter = true;
			filter['name'] = name


		}
		// paramQuery['all_listing'] = true;

		return this.requestService.sendRequest(url, 'get', REQUEST_SERVERS.billing_api_url, { ...paramQuery, ...filter }).
		pipe(
		map(response => {
			let lst: any[] = response['result']['data']
			lst = lst.map(adjuster => {
				return { ...adjuster, full_name: `${adjuster.first_name ? adjuster.first_name : ''} ${adjuster.middle_name ? adjuster.middle_name : ''} ${adjuster.last_name ? adjuster.last_name : ''}` }
			})

			response['result']['data'] = lst;
			
			return response

		}));
	}

	searchAdjusterInformation(name) {
		return new Observable((res) => {
			let insurance_varified=(this.form.controls['insurance_company']as FormGroup).controls['insurance_verified'].value;
			let insuranceid=this.form.value.insurance_company && insurance_varified?this.form.value.insurance_company.id:null;
			this.resetAdjusterPagination();
			this.subscription.push(this.getAdjustor(name,null,insuranceid).subscribe(data => {
				if (data) {
					this.AdjusterPaginationSetting.lastPage = parseInt(data.result.pages);
					this.AdjusterPaginationSetting.search = name;
					this.lstAdjusterInformation = data['result'].data?data['result'].data:[];
					res.next(this.lstAdjusterInformation)
				} else {
					this.lstAdjusterInformation=[]
					res.next(this.lstAdjusterInformation)
				}
			}))
		})
	}

	onFocusSearchAdjusterInformation(name) {
	
		return new Observable((res) => {
		
			if((!this.lstAdjusterInformation.length))
			{
				let insurance_varified=(this.form.controls['insurance_company']as FormGroup).controls['insurance_verified'].value;

				let adjustorid=this.form.value.adjustor? this.form.value.adjustor.id:null;
				let insuranceid=this.form.value.insurance_company && insurance_varified?this.form.value.insurance_company.id:null;
				this.resetAdjusterPagination();
				this.subscription.push(this.getAdjustor(name,adjustorid,insuranceid).subscribe(data => {
					if (data) {
						this.lstAdjusterInformation = data['result'].data;
						res.next(this.lstAdjusterInformation)
					} else {
						res.next(this.lstAdjusterInformation)
					}
				}))
			}
			else
			{
				res.next(this.lstAdjusterInformation);
			}
		})
	}





	goBack()
{
	this.back.emit(true)
}
	enableForm() {
		let buttonDiv = getFieldControlByName(this.fieldConfigs, 'button-div')
		console.log(this.form.value);
		if (this.form.disabled) {
			this.form.enable();
			buttonDiv.classes = buttonDiv.classes.filter(className => className != 'hidden');
		} else {
			this.form.disable();
			buttonDiv.classes.push('hidden');
		}
	}

	onSubmit(form) {
		if(this.addCategorySlug === "diagnostic"){
			if(!this.citimedLocationSelected){
				this.toasterService.error('Diagnostic is only available at Citimed right now, please select one of Citimed locations to use the diagnostic flow.', 'Error');
				this.isBtnSubmitDisabled=false;

				return;
			}
		 }
		 this.addCategorySlug === "";
		 this.citimedLocationSelected = false;

		if(form.case_information&&form.case_information.firm_id&& form.case_information.firm_verified===false)
		{
			form.case_information.firm_id=null;	
		}

		if(form.case_information&&form.case_information.firm_location_id&&  form.case_information.firm_location&& form.case_information.firm_location.firm_location_name_verified===false)
		{
			form.case_information.firm_location_id=null	
		}
		if(form.case_information.attorney&&form.case_information.attorney.attorney_id&& form.case_information.attorney.attorney_verified===false)
		{
			
			form.case_information.attorney.attorney_id=null;
			
		}

		if(form.case_information&&form.case_information.adjustor.id&& form.case_information.adjustor.adjustor_verified===false)
		{
			
			form.case_information.adjustor.id=null;
			
		}
		
		if(form.case_information&&form.case_information.insurance_company&&form.case_information.insurance_company.id  && form.case_information.insurance_company.insurance_verified===false)
		{
			
			form.case_information.insurance_company.id=null;;
		}

		if(form.case_information&&form.case_information.insurance_company&&form.case_information.insurance_company.location_id  && form.case_information.insurance_company.insurance_location_verified===false)
		{
			
			form.case_information.insurance_company.location_id=null
		}
			
		if(form.private_health && form.private_health.insurance_company  && form.private_health.insurance_company.new_insurance){
			form.private_health.insurance_company.id = null;
		}

		if(form.private_health && form.private_health.insurance_company && form.private_health.insurance_company.new_location){
			form.private_health.insurance_company.location_id = null;
		}
		
		let selected_practice_locations= form.practice_locations?form.practice_locations:[];

		this.storageData.setSelectedFacilityLocationIds(selected_practice_locations);

		if (!this.caseId){
	
		this.submit.emit(form)
		}
		else {

			form['case_id']
			this.updateCase.emit(form)
		}

	}
	save(event) {
		if(!checkSelectedLocationsForInactive(this.caseInformationFormComponent?.form?.value?.practice_locations,this.allPracticeLocations)){
			this.toasterService.error("Selected location(s) is/are inactive, please contact your supervisor",'Error');
			return;
		}

		if (this.caseInformationFormComponent){
		this.caseInformationFormComponent.validateAllFormFields(this.caseInformationFormComponent.form)
		}
		
		if(this.form.invalid) {
			let firstInvalidControl: HTMLElement;
			if(this.form.controls.insurance_company.invalid) {
				firstInvalidControl =
				this.el.nativeElement.querySelector('form ng-select.ng-invalid');
			} else {
				firstInvalidControl =
				this.el.nativeElement.querySelector('form .ng-invalid');
			}
			if(firstInvalidControl) {
				this.caseFlowService.scrollToFirstInvalidControl(firstInvalidControl);
				try{
				document.getElementsByClassName("modal-dialog")[0]?.setAttribute('id','content');
				document.getElementById("content")?.scrollIntoView({
					behavior: "smooth"
				})
				}catch(e){
					console.log(e);
				}
				return;
			}
		}

			this.caseInformationFormComponent.validateAllFormFields(this.caseInformationFormComponent.form)
		if(this.caseInformationFormComponent.form.invalid)
		{
			return ;
		}
	
		// if(this.caseInformationFormComponent.form && this.caseInformationFormComponent.form.value.firm_id === null  &&this.caseInformationFormComponent.form.value.attorney.attorney_id !=null){
		// 	return ;
		// }
		// if(this.caseInformationFormComponent.form && !this.caseInformationFormComponent.form.value.firm_id && this.caseInformationFormComponent.form.value.firm_location_id != null && this.caseInformationFormComponent.form.value.firm_location_id !="" && this.caseInformationFormComponent.form.value.attorney.attorney_id ===null){
		// 	return ;
		// }
		// if(this.caseInformationFormComponent.form && !this.caseInformationFormComponent.form.value.insurance_company.id && this.caseInformationFormComponent.form.value.insurance_company.location_id != null && this.caseInformationFormComponent.form.value.insurance_company.location_id != ""  && this.caseInformationFormComponent.form.value.adjustor.id ===null){
		// 	return ;
		// }
		if(this.privateHealthInsuranceFormComponent)	
		{
			this.privateHealthInsuranceFormComponent.dynamiccomponent.validateAllFormFields(this.privateHealthInsuranceFormComponent.form)
			this.privateHealthInsuranceFormComponent.dynamiccomponent.disableHiddenControls(this.privateHealthInsuranceFormComponent.fieldConfig)
			if(this.privateHealthInsuranceFormComponent.form.invalid)
			{
				return ;
			}
		}
		this.isBtnSubmitDisabled=true;
	
			let form1 = this.caseInformationFormComponent ? this.caseInformationFormComponent.form :null
		let form2 = this.privateHealthInsuranceFormComponent ? this.privateHealthInsuranceFormComponent.form : null

			let data = { case_information: form1 ? form1.getRawValue() : null, private_health:form2? form2.getRawValue():null };
			data['case_information']['firm_location']['first_name'] = data['case_information']['attorney'] && data['case_information']['attorney']['first_name'] ? data['case_information']['attorney']['first_name']: '';
			data['case_information']['firm_location']['last_name'] = data['case_information']['attorney'] && data['case_information']['attorney']['last_name'] ? data['case_information']['attorney']['last_name']: '';
			data['case_information']['practice_locations'] = removeNullKeyValueFromCommaSepratedArray(data['case_information']['practice_locations']);
			this.onSubmit(data);



	}
	facilityNameCondition(value: any[]) {
		if (!this.lstpractiseLocation || !this.lstpractiseLocation.length) { return value }
		let arr = value.map(id => this.lstpractiseLocation.find(fac => fac.id == id));
		if(arr){
		arr.map(practice => {
			if(practice?.facility_full_name) {
				practice['facility_name'] = practice?.facility_full_name.split(' ')[0];
			}
		});
		}
		arr = arr.filter((item, index) => arr.findIndex(_item => _item?.facility_name == item?.facility_name) === index);
		this.citimedLocationSelected = arr.every(l => (l?.facility?.slug) ? l.facility.slug === "citimed" : false);

		if (value.length !== arr.length) {
			this.toasterService.info('You can only select location of one facility at a time', 'Info')
		}
		return arr.map(item => item?.id)
	}

	bindCaseTypeChange() {
		this.subscription.push(
			this.form.controls['case_type_id'].valueChanges.subscribe(id => {
				if (!id) {
					
				}
				else
				{
					this.showhidePrivateHealthFormComponent(parseInt(id))
				}
			})
		)
				
	}

	showhidePrivateHealthFormComponent(case_type_id:number)
	{
		if(CaseTypeIdEnum.auto_insurance===case_type_id || CaseTypeIdEnum.worker_compensation===case_type_id || CaseTypeIdEnum.worker_compensation_employer===case_type_id || CaseTypeIdEnum.auto_insurance_worker_compensation===case_type_id  )
		{
			this.showPrivateHealthFormComponent=false
			this.showInsuranceAdjustor(true)
		}
		else
		{
			this.showPrivateHealthFormComponent=true;
			this.showInsuranceAdjustor(false)
		}
	}

	showInsuranceAdjustor(isShow:boolean)
	{
		let insuranceFormControl=getFieldControlByName(this.fieldConfigs,'insurance_company');
		let adjustorFormControl=getFieldControlByName(this.fieldConfigs,'adjustor');
		if(isShow)
		{
			insuranceFormControl.classes=insuranceFormControl.classes.filter(className => className != 'hidden')
			adjustorFormControl.classes=adjustorFormControl.classes.filter(className => className != 'hidden');

		}
		else
		{
			insuranceFormControl.classes.push('hidden');
			
			adjustorFormControl.classes.push('hidden');

			(this.form.controls['adjustor']as FormGroup).patchValue(
				{adjustor_verified:false,
					id:null,
				first_name:'',
				middle_name:'',
				last_name:'',
				email:'',
				fax:'',
				phone_no:'',
				ext:'',
				cell_no:''
			},{ emitEvent: false });	

			(this.form.controls['insurance_company']as FormGroup).patchValue(
				{adjustor_verified:false,
					id:null,
					insurance_code:'',
					name:'',
					insurance_location_verified :'',
					location:'',
					location_id:'',
					street_address:'',
					apartment_suite:'',
					email:'',
					city:'',
					state:'',
					zip:'',
					fax:'',
					phone_no:'',
					ext:'',
					cell_no:''
			},{ emitEvent: false });	
			let formGroupInsurnace = this.form.controls['insurance_company'] as FormGroup;
				formGroupInsurnace.get('id').clearValidators();
				formGroupInsurnace.get('id').updateValueAndValidity({ emitEvent: false });
				formGroupInsurnace.get('location_id').clearValidators();
				formGroupInsurnace.get('location_id').updateValueAndValidity({ emitEvent: false });
				this.implementTheValidationLabelOfInsurance(false);
			this.case&&this.case.insurance && this.case.insurance.primary_insurance &&  this.case.insurance.primary_insurance.id? this.form.patchValue({ is_deleted: true }, { emitEvent: false }) : null


		}
		


	}



	bindFirmChange() {
		this.subscription.push(
			this.form.controls['firm_id'].valueChanges.subscribe(id => {
				
				let firm_varified_control = getFieldControlByName(this.fieldConfigs, 'firm_verified');
				let firm_control = getFieldControlByName(this.fieldConfigs, 'firm_id');
				
				let attorney_control = getFieldControlByName(this.fieldConfigs, 'attorney_id') as AutoCompleteClass;
				if (!id) {
					this.form.controls['firm_location_id'].clearValidators();
					this.form.controls['firm_location_id'].updateValueAndValidity({ emitEvent: false });
					this.implementTheValidationLabelOfFirms(false);
					(this.form.controls['firm_location'] as FormGroup).reset({},{emitEvent: false})
					this.form.controls['firm_location_id'].reset(null,{emitEvent: false})
					this.form.controls['firm_location_id'].clearValidators();
					// this.form.controls['firm_location_id'].updateValueAndValidity();
					if(!(this.form.value.attorney&&this.form.value.attorney.attorney_id))
					{
						// this.lstFirm=[];						
						// firm_control.items = this.lstFirm;
						// this.lstAttorney=[];
						// attorney_control.items = this.lstAttorney
					}
		
				return
			}
			this.form.controls['firm_location_id'].setValidators([Validators.required]);
			this.form.controls['firm_location_id'].updateValueAndValidity({ emitEvent: false });
			this.implementTheValidationLabelOfFirms(true);
				let firm = this.lstFirm.find(firm => firm.id === id);
				if(!firm)
				{
					// this.myfirm_varified_control.values=false
					this.form.controls['firm_verified'].patchValue(false)
					this.form.controls['firm_location'].patchValue(
						{
							firm_name :id
						})
				}
				else
				{
					// firm_varified_control.values=true;
					this.form.controls['firm_verified'].patchValue(true);

					this.form.controls['firm_location'].patchValue(
						{
							firm_name :firm.name
						})
				}
				this.lstFirm=this.lstFirm.filter(firm => firm.id === id)
				firm_control.items = this.lstFirm
				this.locations = firm ? firm.firm_locations : []
				getFieldControlByName(this.fieldConfigs, 'firm_location_id').items = firm ? firm.firm_locations : []

				if(!(this.form.value.attorney&&this.form.value.attorney.attorney_id))
				{	
						// this.lstAttorney=[];
						// attorney_control && attorney_control.items ?attorney_control.items = this.lstAttorney:null;
				}
				if (firm && firm.firm_locations.length !=0 && firm.firm_locations[0] != null) {
					this.form.controls['firm_location_id'].setValidators([Validators.required]);
					this.form.controls['firm_location_id'].updateValueAndValidity({ emitEvent: false });
					firm.firm_locations.length == 1 ? this.form.controls.firm_location_id.setValue(firm.firm_locations[0].id) : getFieldControlByName(this.fieldConfigs, 'firm_location_id').classes.push('glow')
				}

				if(firm && firm.is_verified)
				{
					this.disableFields(true,['street_address','apartment_suite','city','state','zip'],'firm_location');
				}
				else
				{
					this.disableFields(false,['street_address','apartment_suite','city','state','zip'],'firm_location');
				}
			})
		)
		this.disableFields(true,['street_address','apartment_suite','city','state','zip'],'firm_location');
	}
	bindLocationChange() {
		this.subscription.push(
			this.form.controls['firm_location_id'].valueChanges.subscribe(id => {
				if (!id) {
					let location_form = this.form.controls['firm_location']
					location_form.reset({}, { emitEvent: false })
				}
				let firm = this.lstFirm.find(firm => firm.id === this.form.get('firm_id').value);
				if(firm)
				{	
					this.form.controls['firm_location'].patchValue(
						{
							firm_name :firm.name
						})
				}
				if (firm && firm.firm_locations && firm.firm_locations.length !=0 && firm.firm_locations[0] !=null) {
					let location = firm.firm_locations.find(location => location.id === id)
					if (location)
					{
						this.form.patchValue({ firm_location: location }, { emitEvent: false });
						this.form.controls['firm_location'].patchValue(
							{
								firm_location_name_verified:true,
								location_name :location.location_name
							})
							if(firm.is_verified)
							{
								this.disableFields(true,['street_address','apartment_suite','city','state','zip'],'firm_location')

							}
							else
							{
								this.disableFields(false,['street_address','apartment_suite','city','state','zip'],'firm_location')

							}
					}
					else
					{
						this.form.controls['firm_location'].patchValue(
							{
								firm_location_name_verified:false,
								location_name :id
							})
					
						this.disableFields(false,['street_address','apartment_suite','city','state','zip'],'firm_location');
					}	
					this.form.controls['firm_location_id'].setValidators([Validators.required]);
					this.form.controls['firm_location_id'].updateValueAndValidity({ emitEvent: false });
					this.implementTheValidationLabelOfFirms(true);										
				}
				else
				{
					this.form.controls['firm_location'].patchValue(
						{
							firm_location_name_verified:false,
							location_name :id
						})
				
					this.disableFields(false,['street_address','apartment_suite','city','state','zip'],'firm_location');
					if(!id){
						this.form.controls['firm_id'].clearValidators();
						this.form.controls['firm_id'].updateValueAndValidity({ emitEvent: false });
						this.implementTheValidationLabelOfFirms(false);			
					}else{
						this.form.controls['firm_id'].setValidators([Validators.required]);
					this.form.controls['firm_id'].updateValueAndValidity({ emitEvent: false });
					this.implementTheValidationLabelOfFirms(true);			
					}

				}
				
			}))
			this.disableFields(true,['street_address','apartment_suite','city','state','zip'],'firm_location')
	}

	disableFields(disable,disableControlNames:any[],ControlFormGroup?,controlName?)
	{
		if(disable)
		{
			if(ControlFormGroup)
			{
				let formgroup= this.form.controls[ControlFormGroup] as FormGroup
				disableControlNames.forEach(name => {
					formgroup.get(name).disable() ;
					 
					})
			}
			else
			{
				disableControlNames.forEach(name => { this.form.get(name).disable() })
			}	
		}
		else
		{
			if(ControlFormGroup)
			{
				let formgroup= (this.form.controls[ControlFormGroup])as FormGroup
				disableControlNames.forEach(name => {
					formgroup.get(name).enable() ;
					 
					})
			}
			else
			{
				disableControlNames.forEach(name => { this.form.get(name).disable() })
			}		}
		
	}

	bindAttorneyChange() {
		let attornyform = this.form.controls['attorney'] as FormGroup;
		this.subscription.push(
			attornyform.get('attorney_id').valueChanges.subscribe(id => {
				// this.implementTheValidationLabelOfFirms(true);
				// this.setRequiredFiledFirmId();
				let attorney_varified_control = getFieldControlByName(this.fieldConfigs, 'attorney_verified');
				let attornyFormDiv=getFieldControlByName(this.fieldConfigs,'attorney');
				let attorntControl=getFieldControlByName(attornyFormDiv.children,'attorney_id');
				let firm_control = getFieldControlByName(this.fieldConfigs, 'firm_id');
				if (!id) {
					let attorney_form = this.form.controls['attorney']
					attorney_form.reset({}, { emitEvent: false });
					this.form.controls['firm_id'].clearValidators();
					this.form.controls['firm_id'].updateValueAndValidity({ emitEvent: false });
					this.form.controls['firm_location_id'].clearValidators();
					this.form.controls['firm_location_id'].updateValueAndValidity({ emitEvent: false });
					this.implementTheValidationLabelOfFirms(false);
					this.lstAttorney=[];
						attorntControl.items=this.lstAttorney;
						if(!this.form.value.firm_id)
						{
							this.lstFirm=[];						
							firm_control.items = this.lstFirm;
						}

						(this.form.controls['attorney']as FormGroup).patchValue(
							{
								first_name:'',
								middle_name:'',
								last_name:'',
								attorney_verified:false
							}, { emitEvent: false });
	
							(this.form.controls['firm_location']as FormGroup).patchValue(
								{
									first_name:'',
									middle_name:'',
									last_name:'',
									attorney_verified:false
								}, { emitEvent: false })
						this.disableFields(true,['middle_name', 'last_name','email','fax','phone_no','ext','cell_no'],'attorney')
					return
				}
				let attorney = this.lstAttorney.find(attorney => attorney.id === id);
				this.lstAttorney=this.lstAttorney.filter(attorney => attorney.id === id);
				attorntControl.items=this.lstAttorney;
				if (attorney)
				{
					if(!this.form.value.firm_id)
					{
						this.form.patchValue({firm_id:null, attorney: attorney, contact_person: attorney.contact_person ? attorney.contact_person : {} }, { emitEvent: false })
						this.lstFirm=[]
						let firm_control = getFieldControlByName(this.fieldConfigs, 'firm_id');
						firm_control.items = this.lstFirm
					}
				else
				{
					this.form.patchValue({ attorney: attorney, contact_person: attorney.contact_person ? attorney.contact_person : {} }, { emitEvent: false });

			

				}
				(this.form.controls['attorney']as FormGroup).patchValue(
					{
						attorney_verified:true
					}, { emitEvent: false });

					(this.form.controls['firm_location']as FormGroup).patchValue(
						{
							first_name:attorney.first_name,
							middle_name:attorney.middle_name,
							last_name:attorney.last_name,
							attorney_verified:true
						}, { emitEvent: false })
				}
				else{
					
					let _name=String(id);
					let nameArray:any[] =_name.split(' ');

					(this.form.controls['attorney']as FormGroup).patchValue(
						{
							attorney_verified:false,
							first_name:nameArray[0],
							middle_name:nameArray.length>2?nameArray[1]:null,
							last_name:nameArray.length>2?nameArray[2]:nameArray.length==2?nameArray[1]:null
						}, { emitEvent: false });

						(this.form.controls['firm_location']as FormGroup).patchValue(
							{
								attorney_verified:false,
								first_name:nameArray[0],
								middle_name:nameArray.length>2?nameArray[1]:null,
								last_name:nameArray.length>2?nameArray[2]:nameArray.length==2?nameArray[1]:null
							}, { emitEvent: false })

					this.disableFields(false,['middle_name','last_name','email','fax','phone_no','ext','cell_no'],'attorney')
				}
				if(attorney&&attorney.is_verified)
				{
					this.disableFields(true,['middle_name','last_name','email','fax','phone_no','ext','cell_no'],'attorney')

				}
				else
				{
					this.disableFields(false,['middle_name','last_name','email','fax','phone_no','ext','cell_no'],'attorney')

				}
				}))

	}

	// getBydefaultInsurance(name?,insurance_id?)
	// {
	// 	this.getInsurances(name, insurance_id).subscribe(data => {
	// 		let insurance: BillingInsuranceModel = data['result']
	// 		this.lstInsurance = insurance?[insurance]:[]
	// 		let insurance_div = getFieldControlByName(this.fieldConfigs, 'insurance_company');
	// 		let insurance_control = getFieldControlByName(insurance_div.children,'id')
	// 		let location_control = getFieldControlByName(this.fieldConfigs, 'location_id')
	// 		if (insurance_control)
	// 		insurance_control.items = [...this.lstInsurance]
	// 		if (location_control && insurance)
	// 			location_control.items = [...insurance.insurance_locations]
	// 			this.disableFields(true,
	// 				[
	// 				'insurance_code','location_code','street_address','apartment_suite','email','city','state',
	// 				'zip','fax','phone_no','ext','cell_no'
	// 				],'insurance_company','id');

	// 				if(this.case && this.case.insurance && this.case.insurance.primary_insurance  &&this.case.insurance.primary_insurance.insurance_company)
	// 				{
	// 					this.form.patchValue({
	// 						insurance_company:this.case.insurance.primary_insurance.insurance_company,
	// 						})
	// 				}	
	// 	})


	// }

	getBydefaultInsurance(Insurance_company)
	{
			let insurance: BillingInsuranceModel = Insurance_company
			insurance.insurance_name=Insurance_company.name;
			insurance.insurance_locations=[Insurance_company.insurance_locations]
			this.lstInsurance = insurance?[insurance]:[]
			let insurance_div = getFieldControlByName(this.fieldConfigs, 'insurance_company');
			let insurance_control = getFieldControlByName(insurance_div.children,'id')
			let location_control = getFieldControlByName(this.fieldConfigs, 'location_id')
			if (insurance_control)
			insurance_control.items = [...this.lstInsurance]
			if (location_control && insurance)
				location_control.items = insurance.insurance_locations
				this.disableFields(true,
					[
					'insurance_code','location_code','street_address','apartment_suite','email','city','state',
					'zip','fax','phone_no','ext','cell_no'
					],'insurance_company','id');

					if(this.case && this.case.insurance && this.case.insurance.primary_insurance  &&this.case.insurance.primary_insurance.insurance_company)
					{
						this.form.patchValue({
							insurance_company:this.case.insurance.primary_insurance.insurance_company,
							})
					}	
		


	}

	

	bindAdjusterInformationChange() {
		let form = this.form.controls['adjustor'] as FormGroup
		this.subscription.push(form.controls['id'].valueChanges.subscribe(id => {
			let formGroupInsurnace = this.form.controls['insurance_company'] as FormGroup;
			let insurance_div = getFieldControlByName(this.fieldConfigs, 'insurance_company');
			let insurance_control = getFieldControlByName(insurance_div.children,'id')
			let adjustor_div = getFieldControlByName(this.fieldConfigs, 'adjustor');
			let adjustor_control = getFieldControlByName(adjustor_div.children,'id')
			if (!id) {				
				form.reset({}, { emitEvent: false });
				this.implementTheValidationLabelOfInsurance(false);
				formGroupInsurnace.get('id').clearValidators();
				formGroupInsurnace.get('id').updateValueAndValidity({ emitEvent: false });
				formGroupInsurnace.get('location_id').clearValidators();
				formGroupInsurnace.get('location_id').updateValueAndValidity({ emitEvent: false });
				this.lstAdjusterInformation=[];
				adjustor_control.items=this.lstAdjusterInformation;
				if(!(this.form.value.insurance_company&&this.form.value.insurance_company.id))
			{
				this.lstInsurance=[];			
				insurance_control.items = this.lstInsurance
			}
			(this.form.controls['adjustor']as FormGroup).patchValue(
				{adjustor_verified:false,
				first_name:'',
				middle_name:'',
				last_name:''}
				
				,{ emitEvent: false });	
			this.disableFields(true,
				[
				'email','fax','phone_no','ext','cell_no','middle_name','last_name'			
				],'adjustor','id');
				  return;
			}
			// formGroupInsurnace.get('id').setValidators([Validators.required]);
			// formGroupInsurnace.get('id').updateValueAndValidity({ emitEvent: false });
			// this.implementTheValidationLabelOfInsurance(true);

			let adjuster = this.lstAdjusterInformation.find(adjuster => adjuster && adjuster['id'] == id);
			if (!adjuster){


				let _name=String(id);
				let nameArray:any[] =_name.split(' ');
				(this.form.controls['adjustor']as FormGroup).patchValue(
					{adjustor_verified:false,
					first_name:nameArray[0],
					middle_name:nameArray.length>2?nameArray[1]:null,
					last_name:nameArray.length>2?nameArray[2]:nameArray.length==2?nameArray[1]:null}
					
					,{ emitEvent: false });	
				this.disableFields(false,
					['middle_name','last_name',
					'email','fax','phone_no','ext','cell_no'			
					],'adjustor','id');
				return;
			} 
			this.form.patchValue({ adjustor: { ...adjuster, id: adjuster['id'],adjustor_verified:true } }, { emitEvent: false });
			let adjustorlist=this.lstAdjusterInformation.filter(adjustor=>adjustor && adjustor.id === id)
			this.lstAdjusterInformation=adjustorlist
			adjustor_control.items = this.lstAdjusterInformation
			if(!(this.form.value.insurance_company&&this.form.value.insurance_company.id))
			{
				this.lstInsurance=[];				
				insurance_control.items = this.lstInsurance

			}
			if(adjuster&&adjuster.is_verified)
			{
				this.disableFields(true,
					['middle_name','last_name',
					'email','fax','phone_no','ext','cell_no'			
					],'adjustor','id')
			}
			else
			{
				this.disableFields(false,
					['middle_name','last_name',
					'email','fax','phone_no','ext','cell_no'			
					],'adjustor','id')
			}
			
		}))
		this.disableFields(true,
			['middle_name','last_name',
			'email','fax','phone_no','ext','cell_no'			
			],'adjustor','id');
	}

	
	bindInsuranceChange() {
		let form = this.form.controls['insurance_company'] as FormGroup
		this.subscription.push(form.controls['id'].valueChanges.subscribe(value => {
			let insurance_div = getFieldControlByName(this.fieldConfigs, 'insurance_company');
			let insurance_control = getFieldControlByName(insurance_div.children,'id');
			let insurance_location_control = getFieldControlByName(insurance_div.children,'location_id');
			let adjustor_div = getFieldControlByName(this.fieldConfigs, 'adjustor');
			let adjustor_control = getFieldControlByName(adjustor_div.children,'id');
			if (!value) {
				form.get('location_id').clearValidators();
				form.get('location_id').updateValueAndValidity({ emitEvent: false });
				this.implementTheValidationLabelOfInsurance(false);
				form.reset({}, { emitEvent: false });
				this.lstInsurance=[];
				insurance_control.items = this.lstInsurance;
				if(!(this.form.value.adjustor&& this.form.value.adjustor.id))
				{
					this.lstAdjusterInformation=[];
				adjustor_control.items=this.lstAdjusterInformation;
				}
				insurance_location_control.items=[];
				(this.form.controls['insurance_company']as FormGroup).patchValue(
					{insurance_verified:false,
					name:''
				},{ emitEvent: false });	
				this.disableFields(true,
					[
					'insurance_code','location_code','street_address','apartment_suite','email','city','state',
					'zip','fax','phone_no','ext','cell_no'
					],'insurance_company','id');
				return;
			}
			form.get('location_id').setValidators([Validators.required]);
			form.get('location_id').updateValueAndValidity({ emitEvent: false });
			this.implementTheValidationLabelOfInsurance(true);
			let insurance = this.lstInsurance.find(insurance => insurance.id === value)
			this.lstInsurance=this.lstInsurance.filter(insurance => insurance.id === value);
			insurance_control.items = this.lstInsurance
			
			if (!insurance) { 

				(this.form.controls['insurance_company']as FormGroup).patchValue(
					{insurance_verified:false,
					name:value
				},{ emitEvent: false });	
					
					

				this.disableFields(false,
					[
					'insurance_code','location_code','street_address','apartment_suite','email','city','state',
					'zip','fax','phone_no','ext','cell_no'
					],'insurance_company','id');
					
					insurance_location_control.items=[];
				return }

				(this.form.controls['insurance_company']as FormGroup).patchValue(
					{insurance_verified:true,
					name:insurance.insurance_name
				},{ emitEvent: false });	
			let control = getFieldControlByName(this.fieldConfigs, 'location_id') as AutoCompleteClass;
			if(insurance.is_verified)
			{
				this.disableFields(true,
					[
					'insurance_code','location_code','street_address','apartment_suite','email','city','state',
					'zip','fax','phone_no','ext','cell_no'
					],'insurance_company','id');
			}
			else{
				this.disableFields(false,
					[
					'insurance_code','location_code','street_address','apartment_suite','email','city','state',
					'zip','fax','phone_no','ext','cell_no'
					],'insurance_company','id');

			}
			
				
			(this.form.controls['insurance_company'] as FormGroup).patchValue({
				insurance_code: insurance.insurance_code,
				name: insurance.insurance_name
			})
			if (control) {
				control.items = insurance.insurance_locations
				if (insurance &&insurance.insurance_locations&& insurance.insurance_locations.length) {
					insurance.insurance_locations.length == 1 ? (this.form.controls['insurance_company'] as FormGroup).patchValue({ location_id: insurance.insurance_locations[0]&&insurance.insurance_locations[0].id ?insurance.insurance_locations[0].id : null }) : this.glowAndResetFormValues()
				}
			}

			// if(!(this.form.value.adjustor&& this.form.value.adjustor.id))
			// {
			// 	let adjustorForm = this.form.controls['adjustor'] as FormGroup
			// 	adjustorForm.reset({},{ emitEvent: false })
			// 		this.lstAdjusterInformation=[];
			// 		let adjustor_div = getFieldControlByName(this.fieldConfigs, 'adjustor');
			// 		let adjustor_control = getFieldControlByName(adjustor_div.children,'id')
			// 		adjustor_control.items = this.lstAdjusterInformation
			// }
		})
		)
		this.disableFields(true,
			[
			'insurance_code','location_code','street_address','apartment_suite','email','city','state',
			'zip','fax','phone_no','ext','cell_no'
			],'insurance_company','id');
	}

	bindInsuranceLocationChange() {
		let form = this.form.controls['insurance_company'] as FormGroup
		this.subscription.push(form.controls['location_id'].valueChanges.subscribe((id: any) => {
			if (!id) {
				form.patchValue({
					street_address: '',
					apartment_suite: '',
					city: '',
					state: '',
					zip: '',
					phone_no: '',
					cell_no: '',
					ext: '',
					fax: '',
					location_code: '',
					email: ''
				}, { emitEvent: false })
				return;
			}
			let insurance = this.lstInsurance.find(insurance => {
				return insurance.id == (this.form && this.form.value &&  this.form.value.insurance_company&& this.form.value.insurance_company.id)
			});
			if (!insurance){
				(this.form.controls['insurance_company']as FormGroup).patchValue(
					{
						insurance_location_verified:false,
						location:id
				},{ emitEvent: false });
				this.disableFields(false,
					[
					'insurance_code','location_code','street_address','apartment_suite','email','city','state',
					'zip','fax','phone_no','ext','cell_no'
					],'insurance_company','id');	
				return;}
			let value: any = insurance.insurance_locations.find(location => parseInt(location.id) === id);

			
			if(value)
			{
				(this.form.controls['insurance_company'] as FormGroup).patchValue({
					street_address: value.street_address,
					apartment_suite: value.apartment_suite,
					city: value.city,
					state: value.state,
					zip: value.zip,
					phone_no: value.phone_no,
					cell_no: value.cell_number,
					ext: value.ext,
					fax: value.fax,
					location_code: value.location_code,
					email: value.email
				});
				(this.form.controls['insurance_company']as FormGroup).patchValue(
					{insurance_location_verified:true,
						location:value.location_name
				},{ emitEvent: false });
				if(insurance.is_verified)
				{
					this.disableFields(true,
						[
						'insurance_code','location_code','street_address','apartment_suite','email','city','state',
						'zip','fax','phone_no','ext','cell_no'
						],'insurance_company','id');
				}
				else
				{
					this.disableFields(false,
						[
						'insurance_code','location_code','street_address','apartment_suite','email','city','state',
						'zip','fax','phone_no','ext','cell_no'
						],'insurance_company','id');
				}
				
			}
			else
			{
				(this.form.controls['insurance_company']as FormGroup).patchValue(
					{insurance_location_verified:false,
						location:id
				},{ emitEvent: false });
				this.disableFields(false,
					[
					'insurance_code','location_code','street_address','apartment_suite','email','city','state',
					'zip','fax','phone_no','ext','cell_no'
					],'insurance_company','id');
			}	
			
		}))
	}

	glowAndResetFormValues()
	{
		(this.form.controls['insurance_company'] as FormGroup).patchValue({ location_id: null })
		let control=getFieldControlByName(this.fieldConfigs, 'location_id');
		control.classes = control.classes.filter(className => className != 'glow')
		control.classes.push('glow');
		// getFieldControlByName(this.fieldConfig, 'location_id').classes.push('glow')

	}


	setRequiredFiledFirmId()
	{
		this.form.controls['firm_id'].setValidators([Validators.required]);
		
	}

	implementTheValidationLabelOfInsurance(label: boolean){
		if(label){
			this.fieldConfigs[3].children[0].children[2].children[0].label = 'Insurance Name*';
			this.fieldConfigs[3].children[0].children[2].children[0].validations = [
				{ name: 'required', message: 'This field is required', validator: Validators.required },
			];
			if((this.form.controls['insurance_company']as FormGroup).controls['id'].value)
			{
				this.fieldConfigs[3].children[0].children[2].children[3].label = 'Insurance Location*';
				this.fieldConfigs[3].children[0].children[2].children[3].validations = [
					{ name: 'required', message: 'This field is required', validator: Validators.required },
				];
			}
		}
		else{
			this.fieldConfigs[3].children[0].children[2].children[0].label = 'Insurance Name';
			this.fieldConfigs[3].children[0].children[2].children[0].validations = [];
			if(!(this.form.controls['insurance_company']as FormGroup).controls['id'].value)
			{
				this.fieldConfigs[3].children[0].children[2].children[3].label = 'Insurance Location';
				this.fieldConfigs[3].children[0].children[2].children[3].validations = [];
			}
		}
	}

	implementTheValidationLabelOfFirms(label: boolean){
		if(label){
		this.fieldConfigs[1].children[1].label = "Firm's Name*";
		this.fieldConfigs[1].children[1].validations = [
			{ name: 'required', message: 'This field is required', validator: Validators.required },
		];

		this.fieldConfigs[1].children[2].label = ' Location*';
		if(this.form.controls['firm_id'].value)
		{
			this.fieldConfigs[1].children[2].validations = [
				{ name: 'required', message: 'This field is required', validator: Validators.required },
			];
		}
		
		}else{
			this.fieldConfigs[1].children[1].label = "Firm's Name";
			this.fieldConfigs[1].children[1].validations = [];
			if(!this.form.controls['firm_id'].value)
			{
				this.fieldConfigs[1].children[2].label = ' Location';
				this.fieldConfigs[1].children[2].validations = [];
			}
			
		}
	}
    
	facilityNameConditionForCreate(value: any[]) {
		if (!this.lstpractiseLocation || !this.lstpractiseLocation.length) { return value }
		let arr = value.map(id => this.lstpractiseLocation.find(fac => fac.id == id));
		if(arr){
		arr.map(practice =>{ practice['facility_name'] = practice && practice.facility_full_name?practice.facility_full_name.split(' ')[0]:console.log()});
		}
		arr = arr.filter((item, index) => arr.findIndex(_item => _item.facility_name == item.facility_name) === index);
		this.citimedLocationSelected = arr.every(l => (l.facility && l.facility.slug) ? l.facility.slug === "citimed" : false);

		if (value.length !== arr.length) {
			if(!this.aleardyOpenFacility){
				this.aleardyOpenFacility = true;
				this.toasterService.info('You can only select location of one facility at a time', 'Info');
			}else{
				this.aleardyOpenFacility = false;
			}
		}
		return arr.map(item => item.id)
	}

	isDateOfBirthMax() {
		if(this.form) {
		this.subscription.push(this.form.controls['accident_date'].valueChanges.subscribe((value) => {
			if(WithoutTime(new Date(value)) > WithoutTime(new Date)) {
				this.form.controls['accident_date'].setErrors({max_date:true});
			} else {
				this.form.controls['accident_date'].setErrors(null);
			}
			if(!value) {
				this.form.controls['accident_date'].setErrors({required:true});
			}
		}))
	   }
    }

}

