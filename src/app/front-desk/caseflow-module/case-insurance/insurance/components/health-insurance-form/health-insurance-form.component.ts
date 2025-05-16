import { Component, OnInit, Input, OnChanges, Output, EventEmitter, SimpleChanges, ViewChild, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
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
import { makeDeepCopyArray } from '@appDir/shared/utils/utils.helpers';
// import { CaseTypeIdEnum } from '../../models/CaseTypeEnums';
import { CheckboxClass } from '@appDir/shared/dynamic-form/models/Checkbox.class';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { CaseTypeEnum, CaseTypeIdEnum } from '@appDir/front-desk/fd_shared/models/CaseTypeEnums';
import { CaseFlowUrlsEnum } from '@appDir/front-desk/fd_shared/models/CaseFlowUrlsEnum';
import { PatientModel } from '@appDir/front-desk/fd_shared/models/Patient.model';
import { InsuranceModel, DialogEnum } from '@appDir/front-desk/fd_shared/models/Case.model';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { ZipFormatMessages } from '@appDir/shared/dynamic-form/constants/ZipFormatMessages.enum';
import { pairwise } from 'rxjs/operators';
import { NgSelectClass } from '@appDir/shared/dynamic-form/models/NgSelectClass.class';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SelectPayerInfoComponent } from '../select-payer-info/select-payer-info.component';
import { ClearinghouseEnum } from '@appDir/front-desk/masters/billing/clearinghouse/CH-helpers/clearinghouse';
import { Observable } from 'rxjs';

@Component({
	selector: 'app-health-insurance-form',
	templateUrl: './health-insurance-form.component.html',
})
export class HealthInsuranceFormComponent extends PermissionComponent implements OnChanges, OnDestroy, AfterViewInit {

	public form: FormGroup;
	@Input() title = 'Edit'
	@Input() insurance: InsuranceModel;
	@Input() caseId: any;
	@Output() getCase = new EventEmitter
	@Output() confirmedForBillingChange = new EventEmitter()
	@Input() patient: Patient
	@Output() resetForm = new EventEmitter();
	newInsurance:any;
	public insuranceType: string = 'major medical'
	public patientId: any;
	public contactPersonTypesId: number = 3
	public relations: any[];
	disableBtn = false
	formEnabled: boolean = false;
	enableflag: boolean = true;
	subscription: any[] = [];
	payer_info_list = [];
	loadSpin: boolean = false;
	constructor(
		aclService: AclService, private localStorage: LocalStorage,private modalService: NgbModal,
		private fb: FormBuilder, private logger: Logger, private fd_services: FDServices,
		private toastrService: ToastrService, router: Router, private route: ActivatedRoute,private changeDetectorRef:ChangeDetectorRef,
		requestService: RequestService, private caseFlowService: CaseFlowServiceService,private customDiallogService : CustomDiallogService) {
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
			this.form.patchValue(this.form.getRawValue());
			if (this.insurance) {
				const insur_location = this.insurance?.insurance_company?.['insurance_locations'];
				if(this.insurance?.payer){
					let clearinghouse_name=getFieldControlByName(this.fieldConfig, 'clearinghouse_name');
					clearinghouse_name.classes = clearinghouse_name.classes.filter(className => className != 'hidden');
					let payer_info=getFieldControlByName(this.fieldConfig, 'payer_info');
					payer_info.classes = payer_info.classes.filter(className => className != 'hidden');
					let select_payer=getFieldControlByName(this.fieldConfig, 'select_payer');
					select_payer.classes = select_payer.classes.filter(className => className != 'hidden');
					this.insurance.insurance_company['clearinghouse_name'] = this.insurance?.payer?.clearingHouse?.name;
					this.insurance.insurance_company['payer_info'] = this.insurance?.payer?.payer_id;
					this.insurance.insurance_company['payer_id'] = this.insurance?.payer?.id;
					this.newInsurance = {...this.insurance};
					this.insurance.insurance_company['state_id'] = this.newInsurance?.insurance_company['insurance_locations'].kiosk_state_id;
				}
				else if(insur_location?.default_payer_id && insur_location?.is_associate_with_payer){
					let clearinghouse_name=getFieldControlByName(this.fieldConfig, 'clearinghouse_name');
					clearinghouse_name.classes = clearinghouse_name.classes.filter(className => className != 'hidden');
					let payer_info=getFieldControlByName(this.fieldConfig, 'payer_info');
					payer_info.classes = payer_info.classes.filter(className => className != 'hidden');
					let select_payer=getFieldControlByName(this.fieldConfig, 'select_payer');
					select_payer.classes = select_payer.classes.filter(className => className != 'hidden');
					this.insurance.insurance_company['clearinghouse_name'] = insur_location?.defaul_payer?.clearingHouse?.name;
					this.insurance.insurance_company['payer_info'] = insur_location?.defaul_payer?.payer_id;
					this.insurance.insurance_company['payer_id'] = insur_location?.defaul_payer?.id;
					this.newInsurance = {...this.insurance};
					this.insurance.insurance_company['state_id'] = this.newInsurance?.insurance_company['insurance_locations'].kiosk_state_id;
				}
				this.form.patchValue({
					id:this.insurance?.id,
					confirmed_for_billing:this.insurance['confirmed_for_billing'],
					private_health_dialog : this.insurance?.private_health_dialog,
					insured : this.insurance?.insured,
					first_name : this.insurance?.first_name,
					middle_name : this.insurance?.middle_name,
					last_name : this.insurance?.last_name,
					dob : this.insurance['dob'],
					gender : this.insurance['gender'],
					ssn : this.insurance['ssn'],
					phone_no : this.insurance['phone_no'],
					contact_person_relation_id : this.insurance['contact_person_relation_id'],
					other_relation_description : this.insurance['other_relation_description'],
					member_id : this.insurance?.member_id,
					group_no : this.insurance?.group_no,
					prior_authorization_no : this.insurance?.prior_authorization_no
				});
				(this.form.controls['insurance_company'] as FormGroup).patchValue({
					...this.insurance?.insurance_company
				},{emitEvent:false})
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

	ngOnDestroy() {
		unSubAllPrevious(this.subscription)
	}

	onFocusGetPrivateInsurance()
	{

		return new Observable((res) => {
			if (this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_insurance_info_view))

			{
				if(!(this.lstInsurance?.length>1))
				{
					this.getInsurances(null,null).subscribe(data => {
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

	bindHasInsuranceChange() {
		this.subscription.push(this.form.controls['private_health_dialog'].valueChanges.pipe(pairwise())
		.subscribe(([preval, value]: [any, any]) => {
			let control = getFieldControlByName(this.fieldConfig, 'form-div')
			if (value === DialogEnum.yes) {
				control.classes = control.classes.filter(className => className != 'hidden')
				this.form.patchValue({ is_deleted: false }, { emitEvent: false })

				Object.keys(this.form.value).forEach((item: any) =>{
					if(item === "insured" || item === "gender"  || item === "location_id"  || item === "member_id" || item === "group_no"){
						this.form.get(item).setValidators([Validators.required]);
						this.form.get(item).updateValueAndValidity();
					}
				})

			}
			else if (value == DialogEnum.no) { 
				if(value!=preval && (preval && preval!=='none')&& (this.form.value.insured || this.form.value.location_name  || this.form.value.member_id || this.form.value.group_no || this.form.value.prior_authorization_no )) 
				{

					this.customDiallogService
            .confirm(
              'Discard Changes',
              'Are you sure you want to discard the changes?',
              'Yes',
              'No'
            )
            .then((confirmed) => {
              if (confirmed) {
                control.classes.push('hidden');
                this.form.patchValue(
                  {
                    insured: '',
                    first_name: '',
                    middle_name: '',
                    last_name: '',
                    dob: '',
                    gender: '',
                    ssn: '',
                    phone_no: '',
                    contact_person_relation_id: '',
                    other_relation_description: '',
                    prior_authorization_no: '',
                    member_id: '',
                    group_no: '',
                  },
                  { emitEvent: false }
                );

				Object.keys(this.form.value).forEach((item: any) =>{
					if(item === "insured" || item === "gender" || item === "location_id" || item === "member_id" || item === "group_no"){
						this.form.get(item).clearValidators();
						this.form.get(item).updateValueAndValidity({onlySelf: true});
					}
				})

                this.form.controls['insurance_company'].reset({
                  emitEvent: false,
                });
                this.insurance && this.insurance.id
                  ? this.form.patchValue(
                      { is_deleted: true },
                      { emitEvent: false }
                    )
                  : null;
                this.resetForm.emit(true);
              } else {
                this.form.controls['private_health_dialog'].patchValue('yes');
              }
            })
            .catch();
					
				}
				else
				{
					control.classes.push('hidden');
					this.form.patchValue(
					  {
						insured: '',
						first_name: '',
						middle_name: '',
						last_name: '',
						dob: '',
						gender: '',
						ssn: '',
						phone_no: '',
						contact_person_relation_id: '',
						other_relation_description: '',
						prior_authorization_no: '',
						member_id: '',
						group_no: '',
					  },
					  { emitEvent: false }
					);
	
					Object.keys(this.form.value).forEach((item: any) =>{
						if(item === "insured" || item === "gender" || item === "location_id" || item === "member_id" || item === "group_no"){
							this.form.get(item).clearValidators();
							this.form.get(item).updateValueAndValidity({onlySelf: true});
						}
					})
	
					this.form.controls['insurance_company'].reset({},{ emitEvent: false })
					this.insurance&&this.insurance.id ? this.form.patchValue({ is_deleted: true }, { emitEvent: false }) : null
				}
			}
			else{
				control.classes.push('hidden')
				this.insurance&&this.insurance.id ? this.form.patchValue({ is_deleted: true }, { emitEvent: false }) : null
	
			}
		}))
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
					let patient: PatientModel = this.caseFlowService.case.patient
					this.form.patchValue({
						first_name: patient?patient.first_name:'',
						middle_name: patient?patient.middle_name: '',
						last_name: patient?patient.last_name: '',
						ssn:patient? patient.ssn: '',
						gender: patient?patient.gender: '',
						dob: patient?new Date(patient.dob): '',
						phone_no:patient? patient['cell_phone']: ''
					})



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
					other_relation_control.classes = other_relation_control.classes.filter(className => className != 'hidden')
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
					})
					other_relation_control.classes.push('hidden')
					relation_control.classes = relation_control.classes.filter(className => className == 'hidden')
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

					break;

			}
		}))
	}
	ngOnChanges(changes: SimpleChanges) {
		let control = getFieldControlByName(this.fieldConfig, 'form-div')
		if (this.insurance) {
			if (this.form) {
				this.form.patchValue(this.insurance)
			}
			control && this.form&&this.form.get('private_health_dialog').value==="yes" ? control.classes = control.classes.filter(className => className != 'hidden') : null

			let paramQuery: ParamQuery = { filter: true, order: OrderEnum.ASC, pagination: false }
			this.form ? this.form.patchValue(this.insurance,{emitEvent:false}) : null
			if (this.insurance.insurance_company) {
			
				// this.requestService.sendRequest(InsuranceUrlsEnum.Insurance_list_GET, 'get', REQUEST_SERVERS.billing_api_url, { ...paramQuery, id: this.insurance.insurance_company.id, name: this.insurance.insurance_company.name }).subscribe(data => {
					// this.lstInsurance = [data['result']]
					// getFieldControlByName(this.fieldConfig[1].children, 'id').items = this.lstInsurance
					// getFieldControlByName(this.fieldConfig, 'location_id').items = data['result'].insurance_locations
					// this.bindHasInsuranceChange()
					this.getBydefaultInsurance(this.insurance.insurance_company);
					if(this.form)
					{
						this.form.patchValue(this.insurance)
						this.form.patchValue({
							first_name: this.insurance.first_name,
							middle_name: this.insurance.middle_name,
							last_name: this.insurance.last_name,
							ssn: this.insurance['ssn'],
							dob: this.insurance['dob'],
							phone_no: this.insurance['phone_no']
						},{emitEvent:false})
	
					}
					
				// })
			}

		} else {
			control && this.insuranceType != 'primary_health' ? control.classes.push('hidden') : null
		}


	}

	getBydefaultInsurance(Insurance_company)
	{
		debugger;
		let insurance: BillingInsuranceModel = {...Insurance_company};
		insurance.insurance_name=Insurance_company.name;
		insurance.insurance_locations=Insurance_company&&Insurance_company.insurance_locations?[Insurance_company.insurance_locations]:[]
		this.lstInsurance = insurance?[insurance]:[]
		getFieldControlByName(this.fieldConfig[1].children, 'id').items = this.lstInsurance
		getFieldControlByName(this.fieldConfig, 'location_id').items = insurance.insurance_locations?insurance.insurance_locations:[]
		


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
			this.getInsurances(name,null)
				.subscribe(data => {
					this.lstInsurance = data['result']['data']
					res.next(this.lstInsurance);
				})
		})
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
		let paramQuery: ParamQuery = { order: order, pagination: true, filter: false, page: 1, per_page: 10, dropDownFilter:true,
			order_by: order_by }
		let filter = {}
		if (id) {
			paramQuery.filter = true;
			filter['id'] = id
		}
		if (name) {
			paramQuery.filter = true;
			filter['insurance_name'] = name
		}
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
					location_code: ''
				}, { emitEvent: false })
				insuranceForm.controls['payer_id'].setValue(null);
				return;
			}
			let insurance_id = insuranceForm.value.id;
			let insurance = this.lstInsurance.find(insurance => insurance.id === insurance_id)
			if (!insurance) return;
			let location = insurance.insurance_locations.find(location => location.id === location_id);
			if(insurance['payer'] || (location?.is_associate_with_payer && !(insurance['is_mapped_in'] == 'employer_tab'))){
			if(location?.kiosk_state_id && location?.is_associate_with_payer){
				this.getPayerInfo(location?.kiosk_state_id,location['insurance_id'],location?.default_payer_id,false)
			}else{
				this.payer_info_list = [];
				this.hideFields();
			}}else{
				let insurance_company = this.form?.controls['insurance_company'] as FormGroup;
		        insurance_company.controls['payer_info'].setValue(null);
		        insurance_company.controls['payer_id'].setValue(null);
		        let payer_info=getFieldControlByName(this.fieldConfig, 'payer_info');
		        payer_info.classes.push('hidden');
		        let select_payer=getFieldControlByName(this.fieldConfig, 'select_payer');
		        select_payer.classes.push('hidden');
			}
			if (!location) return;
			insuranceForm.patchValue({
				street_address: location.street_address,
				apartment_suite: location.apartment_suite,
				city: location.city,
				state: location.state,
				zip: location.zip,
				phone_no: location.phone_no,
				ext: location.ext,
				fax: location.fax,
				email: location.email,
				location_code: location.location_code,
				state_id:location.kiosk_state_id
			})
		}))
	}
getPayerInfo(state_ids,insurance_id,default_payer_id,editMode:boolean) {
		if(state_ids && insurance_id){
			this.subscription.push(
			  this.requestService.sendRequest(
				ClearinghouseEnum.Get_Payers_Info, 'get', REQUEST_SERVERS.fd_api_url, { state_ids: [state_ids],insurance_ids : [insurance_id]})
				.subscribe((res) => {
					this.loadSpin = false;
					if (res && res['result'] && res['result']['data'] && res['result']['data'].length) {
					  let insurance_company = this.form.controls['insurance_company'] as FormGroup;
					  if(!editMode){
						let clearinghouse_name=getFieldControlByName(this.fieldConfig, 'clearinghouse_name');
						clearinghouse_name.classes = clearinghouse_name.classes.filter(className => className != 'hidden');
						let payer_info=getFieldControlByName(this.fieldConfig, 'payer_info');
						payer_info.classes = payer_info.classes.filter(className => className != 'hidden');
						let select_payer=getFieldControlByName(this.fieldConfig, 'select_payer');
						select_payer.classes = select_payer.classes.filter(className => className != 'hidden');
						this.payer_info_list = [];
						this.payer_info_list.push(...res['result']['data']);
						this.changeDetectorRef.detectChanges();
						this.payer_info_list = [...this.payer_info_list];
						if(this.payer_info_list?.length)
						{
							this.payer_info_list?.forEach(obj =>{
								if((obj['id'] == default_payer_id) || (this.payer_info_list.length == 1)){
									obj['is_default_payer'] = true;
								}else{
									obj['is_default_payer'] = false;
								}
							});
							this.populateSelectedPayer(this.payer_info_list,insurance_company);
						}
					  }else{
						this.payer_info_list = [];
						this.payer_info_list.push(...res['result']['data']);
						this.changeDetectorRef.detectChanges();
						this.payer_info_list = [...this.payer_info_list];
						if(this.payer_info_list?.length)
							{
								this.payer_info_list?.forEach(obj =>{
									if((obj['id'] == default_payer_id) || (this.payer_info_list.length == 1)){
										obj['is_default_payer'] = true;
									}else{
										obj['is_default_payer'] = false;
									}
								});
							}
							let activeModel = this.modalService.open(SelectPayerInfoComponent,{
								backdrop: 'static',
								keyboard: false,
								size: 'xl',
								windowClass: 'modal_extraDOc',
							});
							activeModel.componentInstance.payer_info_list = [...this.payer_info_list];
							activeModel.result.then(res =>{
								if(res){
									this.populateSelectedPayer(res,insurance_company);
								}
							}) 
					  }
				}
				})
			)
		}
	}
	populateSelectedPayer(payer_info_list:any[], form:FormGroup){
		payer_info_list?.forEach(obj =>{
			if(obj.is_default_payer){
				form.controls['clearinghouse_name'].setValue(obj?.clearinghouse?.name);
			    form.controls['payer_info'].setValue(obj?.payer_id);
			    form.controls['payer_id'].setValue(obj?.id);
			}
		})
	}
	bindInsuranceChange() {
		this.subscription.push((this.form.controls['insurance_company'] as FormGroup).controls['id'].valueChanges.subscribe(id => {
			let control = getFieldControlByName(this.fieldConfig, 'location_id');
			let locationControlForm=(this.form.controls['insurance_company'] as FormGroup).controls['location_id']
			control.validations=[];
			control.label="Location Name"
			if (!id) {
				(this.form.controls['insurance_company'] as FormGroup).patchValue({
					location_id: '',
					insurance_code: '',
					name: ''
				})
				updateControlValidations(control.validations,locationControlForm)
				control.items = [];
            let clearinghouse_name=getFieldControlByName(this.fieldConfig, 'clearinghouse_name');
			clearinghouse_name.classes.push('hidden');
			let payer_info=getFieldControlByName(this.fieldConfig, 'payer_info');
			payer_info.classes.push('hidden');
			let select_payer=getFieldControlByName(this.fieldConfig, 'select_payer');
			select_payer.classes.push('hidden');
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
					if (insurance && insurance.insurance_locations&&insurance.insurance_locations.length) {
						insurance.insurance_locations.length == 1 && insurance.insurance_locations[0].id ? (this.form.controls['insurance_company'] as FormGroup).patchValue({ location_id: insurance.insurance_locations[0].id }) : this.glowAndResetFormValues()
					}
				}
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

					new RadioButtonClass('Insured By *', 'insured', [{ name: 'patient', label: "Self", value: 'patient' }, { name: "spouse", value: 'spouse', label: "Spouse" }, { name: "parent", value: 'parent', label: "Child" }, { name: "other", value: 'other', label: "Other" }], data && data['insuredTo'] ? data['insuredTo'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-lg-6 radio-space-evenly']),
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
							new InputClass('SSN', 'ssn', InputTypes.text, data && data['socialSecurity'] ? data['socialSecurity'] : '', [{ name: 'minlength', message: 'Length can not be less then 9', validator: Validators.minLength(9) }], '', ['col-sm-6', 'col-md-4', 'col-xl-3'], { mask: '000-00-0000', skip_validation: true }),

							new InputClass('Phone No', 'phone_no', InputTypes.text, data && data['homePhone'] ? data['homePhone'] : '', [], '', ['col-sm-6', 'col-md-4', 'col-xl-3'], { mask: '000-000-0000', }),
							new SelectClass('Select Relation ', 'contact_person_relation_id', this.relations, '', [], ['col-sm-6', 'col-md-4', 'col-xl-3', 'hidden']),
							new InputClass('Enter Relation ', 'other_relation_description', InputTypes.text, '', [], '', ['col-sm-6', 'col-md-4', 'col-xl-3', 'hidden']),

						], ['row', 'hidden'], '', '', { name: 'insured-by-div' }),
					], ['col-12']),
					new DivClass([
						new NgSelectClass("Insurance Name", 'id', 'insurance_name', 'id', this.searchInsurance.bind(this), false, null, [], '', ['col-sm-6', 'col-md-4', 'col-xl-3'],[],null,this.onFocusGetPrivateInsurance.bind(this),null,this.searchInsurance.bind(this)),
						new DynamicControl('name', null),
						new InputClass('Insurance Code ', 'insurance_code', InputTypes.text, data && data['companyCode'] ? data['companyCode'] : '', [
							// { name: 'required', message: 'Code is required', validator: Validators.required }
						], '', ['col-sm-6', 'col-md-4', 'col-xl-3'], { readonly: true }),
						new AutoCompleteClass('Location Name *', 'location_id', 'location_name', 'id', null, false, '', [{ name: 'required', message: 'Location Name is required', validator: Validators.required }], '', ['col-sm-6', 'col-md-4', 'col-xl-3'],[],null,this.OnFocusLocations.bind(this),'',this.OnclearLocation.bind(this)),
						// new AutoCompleteClass('Location Name', 'location_id', 'location_name', 'id', null, false, '', [], '', ['col-md-4']),         
						new InputClass('Location Code ', 'location_code', InputTypes.text, data && data['companyCode'] ? data['companyCode'] : '', [
							// { name: 'required', message: 'Code is required', validator: Validators.required }
						], '', ['col-sm-6', 'col-md-4', 'col-xl-3'], { readonly: true }),
						new InputClass('Clearinghouse Name', 'clearinghouse_name', InputTypes.text, data && data['companyCode'] ? data['companyCode'] : '', [
						], '', ['col-sm-6', 'col-md-4', 'col-xl-3','hidden'], { readonly: true }),
						new InputClass('Payer ID ', 'payer_info', InputTypes.text, data && data['companyCode'] ? data['companyCode'] : '', [
						], '', ['col-sm-6', 'col-md-4', 'col-xl-3','hidden'], { readonly: true }),
						new DynamicControl('payer_id', null),
						new DynamicControl('state_id', null),
						new ButtonClass('Select Payer Info',['btn', 'btn-primary', 'btn-block','hidden'], ButtonTypes.button,this.showPayerSelect.bind(this),{name:'select_payer'}),
						new AddressClass('Street Address', 'street_address', null, '', [], '', ['col-sm-6', 'col-md-4',  'col-xl-6'], { readonly: true }),
						new InputClass('Suite / Floor', 'apartment_suite', InputTypes.text, data && data['apartment'] ? data['apartment'] : '', [], '', ['col-sm-6', 'col-md-4', 'col-xl-6'], { readonly: true }),
						
						new InputClass('City', 'city', InputTypes.text, data && data['city'] ? data['city'] : '', [], '', ['col-sm-6', 'col-md-4'], { readonly: true }),
						new InputClass('State', 'state', InputTypes.text, data && data['state'] ? data['state'] : '', [], '', ['col-sm-6', 'col-md-4'], { readonly: true }),
						// new InputClass('Zip', 'zip', InputTypes.text, data && data['zip'] ? data['zip'] : '', [{ name: 'minlength', message: 'Length can not be less then 5', validator: Validators.minLength(5) }], '', ['col-sm-6', 'col-md-4'], { mask: '00000', readonly: true }),
						new InputClass('Zip', 'zip', InputTypes.text, data && data['zip'] ? data['zip'] : '', [{name:'pattern', message:ZipFormatMessages.format_usa,validator:Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')}], '', ['col-sm-6', 'col-md-4'], {  readonly: true }),
						new InputClass('Email', 'email', InputTypes.text, '', [], '', ['col-sm-6', 'col-md-4'], { readonly: true }),
						new InputClass('Fax', 'fax', InputTypes.text, '', [], '', ['col-sm-6', 'col-md-4'], { mask: '000-000-0000', skip_validation: true, readonly: true }),

						new InputClass('Work Phone', 'phone_no', InputTypes.text, '', [], '', ['col-sm-6', 'col-md-4'], { mask: '000-000-0000', skip_validation: true, readonly: true }),
						new InputClass('Ext', 'ext', InputTypes.text, '', [], '', ['col-sm-6', 'col-md-4', 'col-xl-3'], { mask: '000-000-0000', skip_validation: true, readonly: true }),
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
	OnclearLocation(){
		return new Observable((res) => {
			let InsuranceLocations = [];
			this.hideFields();
			let insuranceid=this.form.value.insurance_company?this.form.value.insurance_company.id:null;
			this.getInsurances('',insuranceid).subscribe(data => {
				this.lstInsurance = data['result']?[data['result']]:[]
				InsuranceLocations = data['result']?data['result']['insurance_locations']:[]
				res.next(InsuranceLocations)
			})
		})
	}
	OnFocusLocations(){
		return new Observable((res) =>{
			let InsuranceLocations = [];
			let insuranceid=this.form.value.insurance_company?this.form.value.insurance_company.id:null;
			this.getInsurances('',insuranceid).subscribe(data => {
				this.lstInsurance = data['result']?[data['result']]:[]
				InsuranceLocations = data['result']?data['result']['insurance_locations']:[]
				res.next(InsuranceLocations)
			})
		})
	}
	showPayerSelect(event){
		this.loadSpin = true
		let insurance_company = this.form.controls['insurance_company'] as FormGroup;
		let formData = insurance_company.getRawValue();
		this.getPayerInfo(formData['state_id'],formData['id'],formData['payer_id'],true);
	}
	onSubmit(form) {
		// this.caseFlowService.updateCase(this.caseId, { private_health: form }).subscribe(data => this.toastrService.success('Successfully Updated', 'Success'), error => this.toastrService.error(error.message, 'Error'))
	}
	hideFields(){
		let insurance_company = this.form?.controls['insurance_company'] as FormGroup;
		insurance_company.controls['clearinghouse_name'].setValue(null);
		insurance_company.controls['payer_info'].setValue(null);
		insurance_company.controls['payer_id'].setValue(null);
		let clearinghouse_name=getFieldControlByName(this.fieldConfig, 'clearinghouse_name');
		clearinghouse_name.classes.push('hidden');
		let payer_info=getFieldControlByName(this.fieldConfig, 'payer_info');
		payer_info.classes.push('hidden');
		let select_payer=getFieldControlByName(this.fieldConfig, 'select_payer');
		select_payer.classes.push('hidden');
	}
}
