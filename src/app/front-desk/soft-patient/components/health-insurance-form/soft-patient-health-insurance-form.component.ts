import { Component, OnInit, Input, OnChanges, Output, EventEmitter, SimpleChanges, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
// import { FDServices } from '../../services/fd-services.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { HealthInsuranceModel } from 'app/front-desk/models/health-insurance'
import { ToastrService } from 'ngx-toastr';
import { Patient } from 'app/front-desk/patient/patient.model';
import { Route, Router, ActivatedRoute } from '@angular/router';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { dateFormatterMDY, dateObjectPicker, changeDateFormat, unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { RadioButtonClass } from '@appDir/shared/dynamic-form/models/RadioButtonClass.class';
import { AddressClass } from '@appDir/shared/dynamic-form/models/AddressClass.class';
import { ButtonClass } from '@appDir/shared/dynamic-form/models/ButtonClass.class';
import { ButtonTypes } from '@appDir/shared/dynamic-form/constants/ButtonTypes.enum';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { SelectClass } from '@appDir/shared/dynamic-form/models/SelectClass.class';
// import { InsuranceModel, DialogEnum } from '../../models/Case.model';
import { AutoCompleteClass } from '@appDir/shared/dynamic-form/models/AutoCompleteClass.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { InsuranceUrlsEnum } from '@appDir/front-desk/masters/billing/insurance-master/Insurance/insurance-list/Insurance-Urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { BillingModel } from '@appDir/front-desk/billing/Models/billing.model';
import { BillingInsuranceModel } from '@appDir/front-desk/masters/billing/insurance-master/models/BillingInsurance.Model';
import { getFieldControlByName, updateControlValidations } from '@appDir/shared/dynamic-form/helper';
// import { CaseFlowUrlsEnum } from '../../models/CaseFlowUrlsEnum';
// import { PatientModel } from '../../models/Patient.model';
// import { CaseFlowServiceService } from '../../services/case-flow-service.service';
import { DynamicControl } from '@appDir/shared/dynamic-form/models/DynamicControl.class';
import { makeDeepCopyArray, WithoutTime } from '@appDir/shared/utils/utils.helpers';
// import { CaseTypeIdEnum } from '../../models/CaseTypeEnums';
import { CheckboxClass } from '@appDir/shared/dynamic-form/models/Checkbox.class';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { CaseTypeEnum, CaseTypeIdEnum } from '@appDir/front-desk/fd_shared/models/CaseTypeEnums';
import { CaseFlowUrlsEnum } from '@appDir/front-desk/fd_shared/models/CaseFlowUrlsEnum';
import { PatientModel } from '@appDir/front-desk/fd_shared/models/Patient.model';
import { InsuranceModel, DialogEnum, CaseModel } from '@appDir/front-desk/fd_shared/models/Case.model';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { ZipFormatMessages } from '@appDir/shared/dynamic-form/constants/ZipFormatMessages.enum';
import { pairwise } from 'rxjs/operators';
import { NgSelectClass } from '@appDir/shared/dynamic-form/models/NgSelectClass.class';
import { Observable } from 'rxjs';

@Component({
	selector: 'app-soft-patient-health-insurance-form',
	templateUrl: './soft-patient-health-insurance-form.component.html',
})
export class HealthInsuranceFormComponent extends PermissionComponent implements OnChanges, OnDestroy {

	public form: FormGroup;
	@Input() title = 'Edit'
	@Input() insurance: InsuranceModel;
	@Input() caseId: any;
	@Output() getCase = new EventEmitter
	@Output() confirmedForBillingChange = new EventEmitter()
	@Input() patient: Patient
	@Input() case: CaseModel;
	public insuranceType: string = 'major medical'
	public patientId: any;
	public contactPersonTypesId: number = 3
	public relations: any[];
	disableBtn = false
	formEnabled: boolean = false;
	enableflag: boolean = true;
	subscription: any[] = []
	InsurancePaginationSetting = {
		search:'',
		lastPage:null,
		per_page:10,
		currentPage:1,
	}
	constructor(
		aclService: AclService, private localStorage: LocalStorage,
		private fb: FormBuilder, private logger: Logger, private fd_services: FDServices,
		private toastrService: ToastrService, router: Router, private route: ActivatedRoute,
		requestService: RequestService, private caseFlowService: CaseFlowServiceService) {
		super(aclService, router, route, requestService);
		this.setConfigration();

	}

	lstInsurance: BillingInsuranceModel[] = []
	ngOnInit() {

	}
	@ViewChild(DynamicFormComponent) dynamiccomponent: DynamicFormComponent;
	data: any[] = null;
	fieldConfig: FieldConfig[] = [];

	bindConfirmedForBilling() {
		this.form.controls['confirmed_for_billing'].valueChanges.subscribe(value => {
			this.confirmedForBillingChange.emit(value)
		})
	}
	isDateOfBirthMax() {
		if(this.form) {
		this.subscription.push(this.form.controls['dob'].valueChanges.subscribe((value) => {
			if(WithoutTime(new Date(value)) > WithoutTime(new Date)) {
				this.form.controls['dob'].setErrors({max_date:true});
			} else {
				this.form.controls['dob'].setErrors(null);
			}
		}));
	}
}
	setDrugTestingForm() {
		// let control_name = this.insuranceType == 'secondary_health' ? 'secondary_dialog' : 'tertiary_dialog'
		let control = getFieldControlByName(this.fieldConfig, 'private_health_dialog');
		if (control)
			control.options.push({ name: 'Skip', label: 'Skip', value: DialogEnum.skip })
	}
	ngAfterViewInit() {

		if (this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_insurance_info_view)
		) {



			// this.getInsurances().subscribe(data => {
			// 	let insurance: BillingInsuranceModel[] = data['result']['data']
			// 	this.lstInsurance = insurance
			// 	let control = getFieldControlByName(this.fieldConfig[1].children, 'id')
			// 	// let location_control = getFieldControlByName(this.fieldConfig, 'location_id')
			// 	if (control)
			// 		control.items = [...this.lstInsurance]
			// 	// if (location_control)
			// 	//   location_control.items = [...insurance.insurance_locations]

			// })
			this.form = this.dynamiccomponent.form;

			// if (this.insurance) {
			// 	this.form.patchValue(this.insurance)
			// }
			// this.enableForm()
			if (this.caseFlowService.case && this.caseFlowService.case.case_type&& ( this.caseFlowService.case.case_type.slug === CaseTypeEnum.corporate)) {
				this.setDrugTestingForm()
			}
			this.bindInsuranceChange()
			this.bindHasInsuranceChange()
			this.bindInsuredByChange()
			this.bindLocationChange()
			this.bindConfirmedForBilling()
			this.isDateOfBirthMax();
			this.form.patchValue(this.form.getRawValue());
			if (this.insurance) {
				this.form.patchValue(this.insurance)
			}
			this.requestService.sendRequest(CaseFlowUrlsEnum.GetRelations, 'get', REQUEST_SERVERS.kios_api_path).subscribe(data => {
				this.relations = data['result']['data'];
				getFieldControlByName(this.fieldConfig, 'contact_person_relation_id').options = this.relations.filter(relation => relation.id == 1 || relation.id == 2).map(relation => {
					// if ()
					return { name: relation.name, value: relation.id, label: relation.name }
				})

			})


			// let control = getFieldControlByName(this.fieldConfig, 'form-div')
			// if (!this.insurance) {
			//   control.classes.push('hidden')
			// } else {
			//   control ? control.classes = control.classes.filter(className => className != 'hidden') : null

			// }
		}
	}

	onReady(event?: FormGroup) {
		debugger;
		if (event){
		this.form = event;
		}
	}

	ngOnDestroy() {
		unSubAllPrevious(this.subscription)
	}

	onFocusGetPrivateInsurance()
	{

		return new Observable((res) => {
			if (this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_insurance_info_view))

			{
				if(!this.lstInsurance.length)
				{
					this.resetInsurancePagination();
					this.getInsurances(null,null).subscribe(data => {
						this.InsurancePaginationSetting.lastPage = parseInt(data.result.pages);
						let insurance: BillingInsuranceModel[] = data['result']['data']
						this.lstInsurance = insurance
						let control = getFieldControlByName(this.fieldConfig[1].children, 'id')
						if (control)
							control.items = [...this.lstInsurance];		
							res.next(this.lstInsurance);
					})
				}
				else
				{
					res.next(this.lstInsurance);
				}
			}
		else
		{
			res.next(this.lstInsurance);
		}
					
		})	
	}
	searchInsuranceScrollToEnd()
	{
		return new Observable((res) => {
			if (this.InsurancePaginationSetting.currentPage < this.InsurancePaginationSetting.lastPage) {
				this.InsurancePaginationSetting.currentPage += 1;
					this.getInsurances(this.InsurancePaginationSetting.search,null).subscribe(data => {
					this.InsurancePaginationSetting.lastPage = parseInt(data.result.pages);
					let result = data['result']['data'];
					this.lstInsurance = [...this.lstInsurance , ...result];
					res.next(this.lstInsurance);
					});
			}
		})
	}

	bindHasInsuranceChange() {
		this.subscription.push(this.form.controls['private_health_dialog'].valueChanges.pipe(pairwise())
		.subscribe(([preval, value]: [any, any]) => {
			debugger;
			let control = getFieldControlByName(this.fieldConfig, 'form-div')
			
			this.disableFields(true,['insurance_code','street_address','city','state','zip','ext','fax' ,'apartment_suite', 'phone_no', 'email', 'location_code'],'insurance_company')
			if (value === DialogEnum.yes) {
				if(this.form.controls['insured'].disable){
					this.form.controls['insured'].enable();
				}
				control.classes = control.classes.filter(className => className != 'hidden')
				this.form.patchValue({ is_deleted: false }, { emitEvent: false })
				this.disableFields(true,['insurance_code','street_address','city','state','zip','ext','fax' ,'apartment_suite', 'phone_no', 'email', 'location_code'],'insurance_company')
				this.disableFields(false,['id','location_id',],'insurance_company')
				this.disableFields(false,['group_no','member_id','prior_authorization_no']);

			}
			else if (value == DialogEnum.no) { 
				control.classes.push('hidden')
					this.form.patchValue({
						insured:'',
						first_name:'',
						middle_name:'',
						last_name:'',
						dob:'',
						gender:'',
						ssn:'',
						phone_no:'',
						contact_person_relation_id:'',
						other_relation_description:'',
						prior_authorization_no:'',
						member_id:'',
						group_no :'',
					},{ emitEvent: false });
					this.form.controls['insurance_company'].reset({ emitEvent: false })
			}
			else{
				control.classes.push('hidden')
				// this.insurance&&this.insurance.id ? this.form.patchValue({ is_deleted: true }, { emitEvent: false }) : null
				this.case&& this.case.insurance&& this.case.insurance.private_health_insurance
				&& this.case.insurance.private_health_insurance.insurance_company && this.case.insurance.private_health_insurance.insurance_company.id?this.form.patchValue({ is_deleted: true }, { emitEvent: false }) : null
			}
		}))
	}

	enableDisableControl()
	{

	}




	toggleSelfFormControls(shouldDisable: boolean) {
		let first_name = this.form.controls['first_name']
		let middle_name = this.form.controls['middle_name']
		let last_name = this.form.controls['last_name']
		let ssn = this.form.controls['ssn']
		let dob = this.form.controls['dob']
		let phone_no = this.form.controls['phone_no']
		let gender = this.form.controls['gender']

		shouldDisable ? first_name.disable({ emitEvent: false }) : first_name.enable({ emitEvent: false })
		shouldDisable ? middle_name.disable({ emitEvent: false }) : middle_name.enable({ emitEvent: false })
		shouldDisable ? last_name.disable({ emitEvent: false }) : last_name.enable({ emitEvent: false })
		shouldDisable ? ssn.disable({ emitEvent: false }) : ssn.enable({ emitEvent: false })
		shouldDisable ? dob.disable({ emitEvent: false }) : dob.enable({ emitEvent: false })
		shouldDisable ? phone_no.disable({ emitEvent: false }) : phone_no.enable({ emitEvent: false })
		shouldDisable ? gender.disable({ emitEvent: false }) : gender.enable({ emitEvent: false })
	}
	bindInsuredByChange() {
		
		this.subscription.push(this.form.controls['insured'].valueChanges.subscribe(value => {
			debugger;
			let control = getFieldControlByName(this.fieldConfig, 'insured-by-div')
			if (!value) {
				control.classes.push('hidden')

			} else {
				control.classes = control.classes.filter(className => className != 'hidden')
			}
			let relation_control = getFieldControlByName(this.fieldConfig, 'contact_person_relation_id')
			let other_relation_control = getFieldControlByName(this.fieldConfig, 'other_relation_description')
			switch (value) {
				case 'patient':
					this.toggleSelfFormControls(true)
					let patient: any = this.caseFlowService.softCase;
					if(patient){
						this.form.patchValue({
							first_name: patient.patient.personal ?patient.patient.personal.first_name:'',
							middle_name: patient.patient.personal ?patient.patient.personal.middle_name: '',
							last_name: patient.patient.personal ?patient.patient.personal.last_name: '',
							ssn: patient.patient.personal ?patient.patient.personal.ssn: '',
							gender: patient.patient.personal ?patient.patient.personal.gender: '',
							dob: patient.patient.personal ?new Date(patient.patient.personal.dob): '',
							phone_no:patient.patient.contact_information? patient.patient.contact_information.patient['cell_phone']: ''
						})
					}
					relation_control.classes.push('hidden')
					other_relation_control.classes.push('hidden')
					break;

				case 'spouse':
					this.toggleSelfFormControls(false)
					this.form.patchValue({
						first_name: '',
						middle_name: '',
						last_name: '',
						ssn: '',
						dob: '',
						phone_no: '',
						gender: ''
					})
					relation_control.classes.push('hidden')
					other_relation_control.classes = other_relation_control.classes.filter(className => className != 'hidden');
					this.form.controls['other_relation_description'].enable();
					// relation_control = new InputClass('Enter Relation ', 'contact_person_relation_id', InputTypes.text, '', [], '', ['col-md-4', 'col-sm-3'])
					// this.fieldConfig = makeDeepCopyArray(this.fieldConfig)
					// relation_control.classes = relation_control.classes.filter(className => className != 'hidden')
					break;

				case 'parent':
					this.toggleSelfFormControls(false)
					this.form.patchValue({
						first_name: '',
						middle_name: '',
						last_name: '',
						ssn: '',
						dob: '',
						phone_no: '',
						gender: ''
					});
					other_relation_control.classes.push('hidden')
					// relation_control = new SelectClass('Select Relation ', 'contact_person_relation_id', this.relations, '', [], ['col-md-4', 'col-sm-3'])
					// this.fieldConfig = makeDeepCopyArray(this.fieldConfig)
					relation_control.classes = relation_control.classes.filter(className => className != 'hidden');
					this.form.controls['contact_person_relation_id'].enable();
					break;

				case 'other':
					this.toggleSelfFormControls(false)
					this.form.patchValue({
						first_name: '',
						middle_name: '',
						last_name: '',
						ssn: '',
						dob: '',
						phone_no: '',
						gender: ''
					})
					relation_control.classes.push('hidden')
					other_relation_control.classes = other_relation_control.classes.filter(className => className != 'hidden')
					this.form.controls['other_relation_description'].enable();
					break;

			}
		}))
	}
	ngOnChanges(changes: SimpleChanges) {
		// let control = getFieldControlByName(this.fieldConfig, 'form-div')
		if(this.case && this.case.insurance && this.case.insurance.private_health_insurance ){
				if(this.case.insurance.private_health_insurance.insurance_company)
				{
					this.getInsurances(this.case.insurance.private_health_insurance.insurance_company.name,this.case.insurance.private_health_insurance.insurance_company.id).subscribe(data => {
						debugger;
						// let insurance: BillingInsuranceModel[] = data['result']['data']
						let insurance: BillingInsuranceModel = data['result']
							this.lstInsurance = [insurance];
							let control = getFieldControlByName(this.fieldConfig[1].children, 'id')
							if (control){
								control.items = [...this.lstInsurance];	
							}
							let insuranceLocationControl=getFieldControlByName(this.fieldConfig, 'location_id')
							if(insuranceLocationControl)
							{
								insuranceLocationControl.items = insurance && insurance.insurance_locations?insurance.insurance_locations:[];
							}
							this.form.controls['insurance_company'].patchValue(this.case.insurance.private_health_insurance.insurance_company ? this.case.insurance.private_health_insurance.insurance_company : {});
						});
				}
				setTimeout(() => {
					this.form.controls['private_health_dialog'].patchValue(this.case.insurance.private_health_insurance.id?this.case.insurance.private_health_insurance.private_health_dialog:null);
					this.form.controls['insured'].patchValue(this.case.insurance.private_health_insurance.insured);
					this.form.controls['member_id'].patchValue(this.case.insurance.private_health_insurance.member_id ? this.case.insurance.private_health_insurance.member_id: null);
					this.form.controls['group_no'].patchValue(this.case.insurance.private_health_insurance.group_no ? this.case.insurance.private_health_insurance.group_no: null);
					this.form.controls['prior_authorization_no'].patchValue(this.case.insurance.private_health_insurance.prior_authorization_no ? this.case.insurance.private_health_insurance.prior_authorization_no: null);
					// this.form.controls['insurance_company'].patchValue(this.case.insurance.private_health_insurance.insurance_company ? this.case.insurance.private_health_insurance.insurance_company : {});
					this.form.patchValue(this.case.insurance.private_health_insurance,{emitEvent: false});
					this.disableFields(true,['insurance_code','street_address','city','state','zip','ext','fax' ,'apartment_suite', 'phone_no', 'email', 'location_code'],'insurance_company')
				// }
				}, 300);
		}

	}

	goBack() {
		this.router.navigate(['insurance'], { relativeTo: this.route.parent.parent.parent })
	}
	enableForm() {

		let control = getFieldControlByName(this.fieldConfig, 'button-div')
		if (this.form.disabled) {
			this.form.enable()
			control.classes = control.classes.filter(className => className != 'hidden')

		} else {
			this.form.disable()
			control.classes.push('hidden')
		}

	}
	disableForm() {
		this.form.disable();
		this.formEnabled = false;
		this.enableflag = true;
		// this.setValues(true);

	}

	searchInsurance(name) {
		return new Observable((res) => {
			this.resetInsurancePagination();
			this.getInsurances(name,null)
				.subscribe(data => {
					this.InsurancePaginationSetting.lastPage = parseInt(data.result.pages);
					this.InsurancePaginationSetting.search = name;
					this.lstInsurance = data['result']['data']
					res.next(this.lstInsurance);
				})
		})
	}
	resetInsurancePagination() {
		this.InsurancePaginationSetting = {
		search:'',
		lastPage:null,
		currentPage:1,
		per_page:10
		}
	}
	getInsurances(name?, id? ) {
		let order_by;
		let order;
		if(name)
		{
			order_by='insurance_name';
			order=OrderEnum.ASC	
		}
		else
		{
			order_by='count';
			order=OrderEnum.DEC	
		}
		let paramQuery: ParamQuery = { order: order, pagination: true, filter: false, page: this.InsurancePaginationSetting.currentPage, per_page: this.InsurancePaginationSetting.per_page, dropDownFilter:true,
			order_by: order_by  }
		let filter = {}
		if (id) {
			paramQuery.filter = true;
			filter['id'] = id
		}
		if (name) {
			paramQuery.filter = true;
			filter['insurance_name'] = name
		}
		// paramQuery['all_listing'] = true;
		return this.requestService.sendRequest(InsuranceUrlsEnum.Insurance_list_GET, 'get', REQUEST_SERVERS.billing_api_url, { ...paramQuery, ...filter })
	}
	bindLocationChange() {
		let insuranceForm = this.form.controls['insurance_company'] as FormGroup
		this.subscription.push(insuranceForm.controls['location_id'].valueChanges.subscribe(location_id => {
			if (!location_id) {
				insuranceForm.patchValue({
					street_address: '',
					apartment_suite: '',
					city: '',
					state: '',
					zip: '',
					phone_no: '',
					ext: '',
					fax: '',
					email: '',
					location_code: '',
					location:''
				}, { emitEvent: false })
				return;
			}
			let insurance_id = insuranceForm.value.id;
			let insurance = this.lstInsurance.find(insurance => insurance.id === insurance_id)
			if (!insurance){
				this.form.controls['insurance_company'].patchValue({ 'location':location_id , 'new_location': true});
				return;
			} 
			let location = insurance.insurance_locations.find(location => location.id === location_id)
			if (!location){
				this.form.controls['insurance_company'].patchValue({ 'location':location_id , 'new_location': true});
				this.disableFields(false,['insurance_code','street_address','city','state','zip','ext','fax' ,'apartment_suite', 'phone_no', 'email', 'location_code'],'insurance_company')
				return;
			}else{
				this.form.controls['insurance_company'].patchValue({'location':location.location_name,'new_location': false});
			}
			insuranceForm.patchValue({
				street_address:  location.street_address,
				apartment_suite: location.apartment_suite,
				city: location.city,
				state:  location.state,
				zip: location.zip,
				phone_no:  location.phone_no,
				ext:  location.ext,
				fax:  location.fax,
				email:  location.email,
				location_code:  location.location_code,
				location:location.location_name
			})
		}))
	}

	bindInsuranceChange() {
		this.subscription.push((this.form.controls['insurance_company'] as FormGroup).controls['id'].valueChanges.subscribe(id => {
		
			let control = getFieldControlByName(this.fieldConfig, 'location_id') as AutoCompleteClass;
			let locationControlForm=(this.form.controls['insurance_company'] as FormGroup).controls['location_id'];
			control.validations=[];
			if (!id) {
				(this.form.controls['insurance_company'] as FormGroup).patchValue({
					location_id: '',
					location:'',
					name: ''
				})
				control.label="Location Name"
				updateControlValidations(control.validations,locationControlForm)
				return;

			}
			control.label="Location Name*"
			control.validations.push({ name: 'required', message: 'This field is required', validator: Validators.required })
			updateControlValidations(control.validations,locationControlForm)
			let insurance = this.lstInsurance.find(insurance => insurance.id === id)
			if (insurance) {
				let control = getFieldControlByName(this.fieldConfig, 'location_id');

				(this.form.controls['insurance_company'] as FormGroup).patchValue({
					insurance_code: insurance.insurance_code,
					name: insurance.insurance_name
				})

				if (control) {
					control.items = insurance.insurance_locations
					if (insurance && insurance.insurance_locations) {
						insurance.insurance_locations.length == 1 ? (this.form.controls['insurance_company'] as FormGroup).patchValue({ location_id: insurance.insurance_locations[0].id }) : this.glowAndResetFormValues();
					}
				}
				this.form.controls['insurance_company'].patchValue({'new_insurance': false});
				if(insurance.is_verified)
				{
					this.disableFields(true,['insurance_code','street_address','city','state','zip','ext','fax' ,'apartment_suite', 'phone_no', 'email', 'location_code'],'insurance_company')

				}
				else
				{
					this.disableFields(false,['insurance_code','street_address','city','state','zip','ext','fax' ,'apartment_suite', 'phone_no', 'email', 'location_code'],'insurance_company')

				}
			}else{
				(this.form.controls['insurance_company'] as FormGroup).patchValue({});
				(this.form.controls['insurance_company'] as FormGroup).patchValue({
					insurance_code: '',
					name: ''
				})
				this.form.controls['insurance_company'].patchValue({'name': id , 'new_insurance': true});
				this.disableFields(false,['insurance_code','street_address','city','state','zip','ext','fax' ,'apartment_suite', 'phone_no', 'email', 'location_code'],'insurance_company')
			}

		}))
	}

	glowAndResetFormValues()
	{
		(this.form.controls['insurance_company'] as FormGroup).patchValue({ location_id: null })
		let control=getFieldControlByName(this.fieldConfig, 'location_id');
		control.classes = control.classes.filter(className => className != 'glow')
		control.classes.push('glow');
		// getFieldControlByName(this.fieldConfig, 'location_id').classes.push('glow')

	}

	setConfigration(data?) {
		this.fieldConfig = [

			new DynamicControl('id', null),

			new DivClass([

				new CheckboxClass('Set as primary', 'confirmed_for_billing', InputTypes.checkbox, false, [], '', ['set-primary']),

				new RadioButtonClass('Do you have private insurance?*', 'private_health_dialog', [
					{ name: 'yes', label: 'Yes', value: DialogEnum.yes },
					{ name: 'no', label: 'No', value: DialogEnum.no }
				], '', [
					{ name: 'required', message: 'This field is required', validator: Validators.required },
					{ name: 'dialogError', message: 'This field is required', validator: this.caseFlowService.DialogEnumValidator() }
				], ['col-12 col-lg-6']),
				new DivClass([

					new RadioButtonClass('Insured By', 'insured', [{ name: 'patient', label: "Self", value: 'patient' }, { name: "spouse", value: 'spouse', label: "Spouse" }, { name: "parent", value: 'parent', label: "Parent" }, { name: "other", value: 'other', label: "Other" }], data && data['insuredTo'] ? data['insuredTo'] : '', [], ['col-lg-6 radio-space-evenly']),
					new DivClass([
						new DivClass([
							new InputClass('First Name ', 'first_name', InputTypes.text, data && data['insuredFirstName'] ? data['insuredFirstName'] : '', [
								// { name: 'required', message: 'First Name is required', validator: Validators.required }
							], '', ['col-sm-6', 'col-md-4', 'col-xl-3']),
							new InputClass('Middle Name', 'middle_name', InputTypes.text, data && data['insuredMiddleName'] ? data['insuredMiddleName'] : '', [], '', ['col-sm-6', 'col-md-4', 'col-xl-3']),
							new InputClass('Last Name ', 'last_name', InputTypes.text, data && data['insuredLastName'] ? data['insuredLastName'] : '', [
								// { name: 'required', message: 'Last Name is required', validator: Validators.required }
							], '', ['col-sm-6', 'col-md-4', 'col-xl-3']
							),
							new InputClass('Date of Birth (mm/dd/yyyy)', 'dob', InputTypes.date, data && data['insuredDob'] ? data['insuredDob'] : '', [], '', ['col-sm-6', 'col-md-5', 'col-lg-4', 'col-xl-3'], { max: new Date() }),
							new RadioButtonClass('Gender *', 'gender', [
								{ name: 'male', label: 'Male', value: 'male' },
								{ name: 'female', label: 'Female', value: 'female' },
								{ name: 'X', label: 'X', value: 'x' }
							], '', [
								{ name: 'required', message: 'This field is required', validator: Validators.required }
							], ['col-md-7', 'col-lg-8', 'col-xl-3', 'radio-space-evenly']),
							new InputClass('SSN', 'ssn', InputTypes.text, data && data['socialSecurity'] ? data['socialSecurity'] : '', [{ name: 'minlength', message: 'Length can not be less then 9', validator: Validators.minLength(9) }], '', ['col-sm-6', 'col-md-4', 'col-xl-3'], { mask: '000-000-0000', skip_validation: true }),

							new InputClass('Work Phone', 'phone_no', InputTypes.text, data && data['homePhone'] ? data['homePhone'] : '', [], '', ['col-sm-6', 'col-md-4', 'col-xl-3'], { mask: '000-000-0000', }),
							new SelectClass('Select Relation ', 'contact_person_relation_id', this.relations, '', [], ['col-sm-6', 'col-md-4', 'col-xl-3', 'hidden']),
							new InputClass('Enter Relation ', 'other_relation_description', InputTypes.text, '', [], '', ['col-sm-6', 'col-md-4', 'col-xl-3', 'hidden']),

						], ['row', 'hidden'], '', '', { name: 'insured-by-div' }),
					], ['col-12']),
					new DivClass([
						// new AutoCompleteClass('Insurance Name', 'id', 'insurance_name', 'id', this.searchInsurance.bind(this), false, "", [], null, ['col-sm-6', 'col-md-4', 'col-xl-3'],[],null,this.onFocusGetPrivateInsurance.bind(this),'',this.searchInsurance.bind(this)),
						new NgSelectClass("Insurance Name", 'id', 'insurance_name', 'id', this.searchInsurance.bind(this), false, null, [], '', ['col-sm-6', 'col-md-4', 'col-xl-3'],[],{add_tag:true},null,null,this.searchInsurance.bind(this),this.onFocusGetPrivateInsurance.bind(this),this.searchInsuranceScrollToEnd.bind(this),null,null),
						new DynamicControl('name', null),
						new DynamicControl('new_insurance', false),
						new InputClass('Insurance Code ', 'insurance_code', InputTypes.text, data && data['companyCode'] ? data['companyCode'] : '', [
							// { name: 'required', message: 'Code is required', validator: Validators.required }
						], '', ['col-sm-6', 'col-md-4', 'col-xl-3']),
						new NgSelectClass('Location Name', 'location_id', 'location_name', 'id', null, false, null, [], '', ['col-sm-6', 'col-md-4', 'col-xl-3'],[],{add_tag:true}),
						new DynamicControl('new_location', false),
						new DynamicControl('location', ''),
						    
						new InputClass('Location Code ', 'location_code', InputTypes.text, data && data['companyCode'] ? data['companyCode'] : '', [
							// { name: 'required', message: 'Code is required', validator: Validators.required }
						], '', ['col-sm-6', 'col-md-4', 'col-xl-3']),

						new AddressClass('Street Address', 'street_address', null, '', [], '', ['col-sm-6', 'col-md-4',  'col-xl-6']),
						new InputClass('Suite / Floor', 'apartment_suite', InputTypes.text, data && data['apartment'] ? data['apartment'] : '', [], '', ['col-sm-6', 'col-md-4', 'col-xl-6']),
						
						new InputClass('City', 'city', InputTypes.text, data && data['city'] ? data['city'] : '', [], '', ['col-sm-6', 'col-md-4']),
						new InputClass('State', 'state', InputTypes.text, data && data['state'] ? data['state'] : '', [], '', ['col-sm-6', 'col-md-4']),
						// new InputClass('Zip', 'zip', InputTypes.text, data && data['zip'] ? data['zip'] : '', [{ name: 'minlength', message: 'Length can not be less then 5', validator: Validators.minLength(5) }], '', ['col-sm-6', 'col-md-4'], { mask: '00000', readonly: true }),
						new InputClass('Zip', 'zip', InputTypes.text, data && data['zip'] ? data['zip'] : '', [{name:'pattern', message:ZipFormatMessages.format_usa,validator:Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')}], '', ['col-sm-6', 'col-md-4']),
						new InputClass('Email', 'email', InputTypes.text, '', [], '', ['col-sm-6', 'col-md-4']),
						new InputClass('Fax', 'fax', InputTypes.text, '', [], '', ['col-sm-6', 'col-md-4'], { mask: '000-000-0000', skip_validation: true}),

						new InputClass('Work Phone', 'phone_no', InputTypes.text, '', [], '', ['col-sm-6', 'col-md-4'], { mask: '000-000-0000', skip_validation: true }),
						new InputClass('Ext', 'ext', InputTypes.text, '', [], '', ['col-sm-6', 'col-md-4', 'col-xl-3'], { mask: '000-000-0000', skip_validation: true }),
					], ['display-contents'], '', '', { formControlName: 'insurance_company', name: 'insurance-company' }),
					new InputClass('Member ID* ', 'member_id', InputTypes.text, data && data['memberId'] ? data['memberId'] : '', [
						{ name: 'required', message: 'This field is required', validator: Validators.required }
					], '', ['col-sm-6', 'col-md-4', 'col-xl-3']
					),
					new InputClass('Group No* ', 'group_no', InputTypes.text, data && data['groupNo'] ? data['groupNo'] : '', [
						{ name: 'required', message: 'This field is required', validator: Validators.required }
					], '', ['col-sm-6', 'col-md-4', 'col-xl-3']),
					new InputClass('Prior Authorization No', 'prior_authorization_no', InputTypes.text, data && data['prior_authorization_no'] ? data['prior_authorization_no'] : '', [], '', ['col-sm-6', 'col-md-4', 'col-xl-3']),

				], ['display-contents','hidden'], '', '', { name: 'form-div' }),
				new DivClass([
					// new ButtonClass('Reset', ['btn', 'btn-primary', 'btn-block'], ButtonTypes.reset, this.disableForm.bind(this)),
					// new ButtonClass('Save', ['btn', 'btn-success', 'btn-block'], ButtonTypes.submit)
				], ['col-12', 'row'], '', '', { name: 'button-div' })
			], ['row']),
			new DynamicControl('is_deleted', false),
		]
	}
	onSubmit(form) {
		// this.caseFlowService.updateCase(this.caseId, { private_health: form }).subscribe(data => this.toastrService.success('Successfully Updated', 'Success'), error => this.toastrService.error(error.message, 'Error'))
	}

	disableFields(disable,disableControlNames:any[],ControlFormGroup?,controlName?)
	{

		debugger;
		if(disable)
		{
			if(ControlFormGroup)
			{
				let formgroup= this.form.controls[ControlFormGroup] as FormGroup
				disableControlNames.forEach(name => {
					// if(name=="id" && ControlFormGroup==='insurance_company')
					// {
					// 	formgroup.get(name).enable() ;
					// }
					// else
					// {
						formgroup.get(name).disable() ;
					// }
					
					 
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
				disableControlNames.forEach(name => { this.form.get(name).enable() })
			}		}
		
	}

}
