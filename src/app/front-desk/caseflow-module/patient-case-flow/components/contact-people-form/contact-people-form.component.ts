import {
	Component,
	OnInit,
	Input,
	OnChanges,
	SimpleChanges,
	Output,
	EventEmitter,
	ViewChild,
	OnDestroy,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
import { FDServices } from '../../../../fd_shared/services/fd-services.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { AclService } from '@appDir/shared/services/acl.service';
import {
	unSubAllPrevious,
} from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { CasesServiceService } from '@appDir/front-desk/cases/cases-service.service';
import { CanDeactivateComponentInterface } from '@appDir/shared/canDeactivateFormsComponent/CanDeactivateComponent.interface';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { RadioButtonClass } from '@appDir/shared/dynamic-form/models/RadioButtonClass.class';
import { AddressComponent } from '@appDir/shared/dynamic-form/components/address/address.component';
import { AddressClass } from '@appDir/shared/dynamic-form/models/AddressClass.class';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { ButtonClass } from '@appDir/shared/dynamic-form/models/ButtonClass.class';
import { ButtonTypes } from '@appDir/shared/dynamic-form/constants/ButtonTypes.enum';
import { SelectClass } from '@appDir/shared/dynamic-form/models/SelectClass.class';
import { CaseModel, PatientDetailModel, AddressEnum, DialogEnum } from '../../../../fd_shared/models/Case.model';
import { DynamicControl } from '@appDir/shared/dynamic-form/models/DynamicControl.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { CasesUrlsEnum } from '@appDir/front-desk/cases/Cases-Urls-Enum';
import { CaseFlowUrlsEnum } from '../../../../fd_shared/models/CaseFlowUrlsEnum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { getFieldControlByName } from '@appDir/shared/dynamic-form/helper';
import { CaseFlowServiceService } from '../../../../fd_shared/services/case-flow-service.service';
import { CaseTypeEnum, CaseTypeIdEnum } from '../../../../fd_shared/models/CaseTypeEnums';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { ZipFormatMessages } from '@appDir/shared/dynamic-form/constants/ZipFormatMessages.enum';
import { recursiveRemoveEmptyAndNullsFormObject, WithoutTime } from '@appDir/shared/utils/utils.helpers';

@Component({
	selector: 'app-contact-people-form',
	templateUrl: './contact-people-form.component.html',
})
export class ContactPeopleFormComponent extends PermissionComponent implements OnChanges, OnDestroy, CanDeactivateComponentInterface {
	subscription: Subscription[] = [];
	public form: FormGroup;
	// @Input() titleForSimilerFields = 'isLegalGuardian' + 'emergencycontact';
	title = 'Edit Emergency Contact';
	// patientId: number = 1;
	// contactPersonTypeId: number = 1;
	patientDetail: PatientDetailModel;
	caseId: number;
	formType: any;
	_route: any
	@ViewChild(DynamicFormComponent) component: DynamicFormComponent
	disableBtn = false;
	relations: any[];
	enableflag: boolean = true;
	contactPersonTypes: any[];
	formEnabled: boolean = false;

	constructor(
		public aclService: AclService,
		private fb: FormBuilder,
		// private logger: Logger,
		private fd_services: FDServices,
		public toastrService: ToastrService,
		protected activatedRoute: ActivatedRoute,
		protected titleService: Title,
		private caseService: CasesServiceService,
		protected router: Router,
		protected requestService: RequestService,
		public caseFlowService: CaseFlowServiceService
	) {

	 super(aclService,router,activatedRoute, requestService,titleService);

		// this.setForm();
		this.caseFlowService.addScrollClasses();
	}

	setDrugTestingForm() {
		if ( this.caseFlowService.case&&this.caseFlowService.case.case_type&&this.caseFlowService.case.case_type.slug === CaseTypeEnum.corporate) {
			getFieldControlByName(this.fieldConfig, 'is_guarantor').options = [...getFieldControlByName(this.fieldConfig, 'is_guarantor').options, { name: 'skip', label: 'Skip', value: DialogEnum.skip }]
		}
	}

	bindEmergencyContactChange() {
		this.form.controls['is_emergency'].valueChanges.subscribe(data => {
			let control = getFieldControlByName(this.fieldConfig, 'is_guarantor')
			if (!this.router.url.includes('form-filler')) { return; }
			if (data !== DialogEnum.yes) {
				control.classes.push('hidden')
				this.form.patchValue({ is_guarantor: DialogEnum.none }, { emitEvent: false })
			} else {
				this.form.patchValue({ is_guarantor: DialogEnum.none }, { emitEvent: false })
				if (this.caseFlowService.shouldShowGuarantorOption()) {
					control.classes = control.classes.filter(className => className != 'hidden')
				}
			}
		})
	}
	bindRelationChange() {
		this.subscription.push(this.form.controls['contact_person_relation_id'].valueChanges.subscribe(value => {
			let control = getFieldControlByName(this.fieldConfig, 'other_relation_description')
			if (value == 8) {
				control.classes = control.classes.filter(className => className != 'hidden')
			} else {
				control.classes.push('hidden')
			}
		}))
	}
	ngAfterViewInit() {
		debugger;
	console.log(this.component.form);
		this.form = this.component.form
		if (this._route =='emergency-contact' &&this.aclService.hasPermission(this.userPermissions.patient_case_list_personal_information_emergency_contact_view)||(this. _route =='form-filler' &&this.aclService.hasPermission(this.userPermissions.patient_case_list_personal_information_form_filler_view))
		||(this. _route =='guarantor' &&this.aclService.hasPermission(this.userPermissions.patient_case_list_personal_information_form_filler_view))
		) {
			this.bindRelationChange()
			this.bindEmergencyContactChange()
			this.isDateOfAdmissionMax();
			this.titleService.setTitle(this.activatedRoute.snapshot.data['title']);


			this.activatedRoute.snapshot.pathFromRoot.forEach((path) => {
				if (path && path.params && path.params.caseId) {
					if (!this.caseId) {
						this.caseId = path.params.caseId;
					}
				}
			});
		}

		this.getCase();
	
		if( this. _route =='emergency-contact' && !this.aclService.hasPermission(this.userPermissions.patient_case_list_personal_information_emergency_contact_edit)
		|| (this. _route =='form-filler' &&!this.aclService.hasPermission(this.userPermissions.patient_case_list_personal_information_form_filler_edit))
		|| (this. _route =='guarantor' && !this.aclService.hasPermission(this.userPermissions.patient_case_list_personal_information_gurantor_edit))
		)
		{this.enableForm();

		}



		this.subscription.push(
			this.requestService.sendRequest(CaseFlowUrlsEnum.GetRelations, 'get', REQUEST_SERVERS.kios_api_path).subscribe(
				(res) => {

					this.relations = res['result']['data'];
					getFieldControlByName(this.fieldConfig, 'contact_person_relation_id').options = this.relations.map(relation => {
						return { name: relation.name, value: relation.id, label: relation.name }
					})

				},
				(err) => {
					this.toastrService.error(err, 'Error');
				},
			),
		);
		// this.subscription.push(
		// 	this.fd_services.getContactPersonTypes().subscribe(
		// 		(res) => {

		// 			if (res.statusCode == 200) {
		// 				this.contactPersonTypes = res.data;
		// 			}
		// 		},
		// 		(err) => {
		// 			this.toastrService.error(err, 'Error');
		// 		},
		// 	),
		// );
	}

	fieldConfig: FieldConfig[] = []
	setFormFillerDynamicForm() {
		this.fieldConfig = [
			new DivClass([
				new DynamicControl('id', null),
				new DynamicControl('contact_person_type_id', this.formType),
				new InputClass('First Name *', 'first_name', InputTypes.text, '', [
					{ name: 'required', message: 'This field is required', validator: Validators.required },
					{ name: 'maxlength', message: 'Length cannot be greater than 20', validator: Validators.maxLength(20) }
				], '', ['col-12 col-sm-6 col-lg-3']),
				new InputClass('Middle Name', 'middle_name', InputTypes.text, '', [
					{ name: 'maxlength', message: 'Length cannot be greater than 20', validator: Validators.maxLength(20) }
				], '', ['col-12 col-sm-6 col-lg-3']),
				new InputClass('Last Name *', 'last_name', InputTypes.text, '', [
					{ name: 'required', message: 'This field is required', validator: Validators.required },
					{ name: 'maxlength', message: 'Length cannot be greater than 20', validator: Validators.required }
				], '', ['col-12 col-sm-6 col-lg-3']),
				new InputClass('Date of Birth (mm/dd/yyyy)', 'dob', InputTypes.date, '', [], '', ['col-12 col-sm-6 col-lg-3'], { max: new Date() }),
				new InputClass('Home Phone', 'home_phone', InputTypes.text, '', [{ name: 'minlength', message: 'This field cannot be less than 10', validator: Validators.minLength(10) }], '', ['col-12 col-sm-6 col-lg-3'], { mask: '000-000-0000' }),
				new InputClass('Cell Phone*', 'cell_phone', InputTypes.text, '', [{ name: 'minlength', message: 'This field cannot be less than 10', validator: Validators.minLength(10) }, { name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-lg-3', 'col-md-6'], { mask: '000-000-0000' }),
				new InputClass('Email', 'email', InputTypes.email, '', [
					{ name: 'pattern', message: 'Email is not valid', validator: Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$') }
				], '', ['col-12 col-sm-6 col-lg-3']),
				new InputClass('Fax', 'fax', InputTypes.text, '', [{ name: 'minlength', message: 'This field cannot be less than 10', validator: Validators.minLength(10) }], '', ['col-12 col-sm-6 col-lg-3'], { mask: '000-000-0000' }),
				new InputClass('SSN', 'ssn', InputTypes.text, '', [], '', ['col-12 col-sm-6 col-lg-3'], { mask: '000-00-0000' }),
				new RadioButtonClass('Gender', 'gender', [
					{ name: 'male', label: 'Male', value: 'male' },
					{ name: 'female', label: 'Female', value: 'female' },
					{ name: 'x', label: 'X', value: 'x' },
				], '', [], ['col-12 col-md-9', 'radio-space-evenly']),
				new DivClass([
					new DivClass([
						new DynamicControl('id', null),
						new AddressClass('Street Address', 'street', this.handleAddressChange.bind(this), '', [
						], '', ['col-12 col-sm-6']),
						new InputClass('Suite / Floor', 'apartment', InputTypes.text, '', [], '', ['col-12 col-sm-6']),
						new InputClass('City', 'city', InputTypes.text, '', [], '', ['col-12 col-sm-6 col-lg-4']),
						new InputClass('State', 'state', InputTypes.text, '', [], '', ['col-12 col-sm-6 col-lg-4']),
						// new InputClass('Zip', 'zip', InputTypes.text, '', [], '', ['col-12 col-sm-6 col-lg-4'], { mask: '00000' }),
						new InputClass('Zip', 'zip', InputTypes.text, '', [{name:'pattern', message:ZipFormatMessages.format_usa,validator:Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')}], '', ['col-12 col-sm-6 col-lg-4'], ),
					], ['row'], '', '', { formControlName: 'mail_address' }),
				], ['col-12']),
				new SelectClass('Relation *', 'contact_person_relation_id', this.relations, null, [
					{ name: 'required', message: 'This field is required', validator: Validators.required }
				], ['col-12 col-sm-6 col-lg-4']),
				new InputClass('Please Specify', 'other_relation_description', InputTypes.text, '', [], '', ['col-12 col-sm-6 col-lg-4', 'hidden']),

				new RadioButtonClass('Are you also a Patient Emergency Contact Person? *', 'is_emergency', [
					{ name: 'yes', value: DialogEnum.yes, label: 'Yes' },
					{ name: 'no', label: 'No', value: DialogEnum.no }
				], '', [
					{ name: 'required', message: 'This field is required', validator: Validators.required }
				], ['col-12 col-md-9 col-lg-6']),
				// new SelectClass('Relation *', 'contact_person_relation_id', this.relations, null, [
				// 	{ name: 'required', message: 'This field is required', validator: Validators.required }
				// ], ['col-4']),
				new RadioButtonClass('Are you also a guarantor? *', 'is_guarantor', [
					{ name: 'yes', value: DialogEnum.yes, label: 'Yes' },
					{ name: 'no', label: 'No', value: DialogEnum.no }
				], '', [
					{ name: 'required', message: 'This field is required', validator: Validators.required }
				], ['col-12 col-md-9 col-lg-6', 'hidden'])
			], ['row']),

			new DivClass([
				new ButtonClass('Back', ['btn', 'btn-primary', 'btn-block', 'mt-0 mb-3 mb-sm-0'], ButtonTypes.button, this.goBack.bind(this), { icon: 'icon-left-arrow me-2', button_classes: [''] }),
				new ButtonClass('Save & Continue', ['btn', 'btn-success', 'btn-block', 'mt-0'], ButtonTypes.submit, null, { icon: 'icon-save-continue me-2', button_classes: [''] })
			], ['row', 'form-btn', 'justify-content-center'], '', '', { name: 'button-div' })

		]
	}

	ngOnChanges(changes: SimpleChanges) {

	}

	setValues() {
		this.form.patchValue(recursiveRemoveEmptyAndNullsFormObject(this.patientDetail))
	}

	getFormType() {
		var url = this.router.url
		if (url.includes('emergency-contact')) {
			this.formType = 3
		} else if (url.includes('form-filler')) {
			this.formType = 2
		} else if (url.includes('guarantor')) {
			this.formType = 4
		}
	}
	ngOnInit() {
		this.activatedRoute.snapshot.pathFromRoot.forEach((path) => {
			if (path && path.params && path.params.caseId) {

				if (!this.caseId) {
					this.caseId = path.params.caseId;
					this.getFormType();
				}
			}
		});
		let urlarr = this.router.url.split('/');
		this. _route = urlarr[urlarr.length - 1];
		this.setFormFillerDynamicForm()
	}

	onSubmit(form) {
		let url = this.router.url;
		let data = {}
		if (url.includes('form-filler')) {
			data = { form_filler_contact_info: form }
		} else if (url.includes('emergency-contact')) {
			data = { emergency_contact_info: form }
		} else if (url.includes('guarantor')) {
			data = { guarantor_contact_info: form }
		}
		// this.enableForm()
		this.caseFlowService.updateCase(this.caseId, data).subscribe(data => {
			// this.enableForm()
			this.toastrService.success('Successfully Updated', 'Success')
			// this.form.reset()
			this.form.markAsPristine();
			this.form.markAsUntouched();
			this.getCase(callback => {
				this.caseFlowService.goToNextStep()
			})
		}, err => this.toastrService.error(err.error.message, 'Error'))
	}


	goBack() {
		this.caseFlowService.goBack()
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

			this.form.controls['mail_address'].patchValue({
				street: address,
				city: city.long_name,
				state: state.long_name,
				zip: postal_code.long_name,

			});
		} else {
			this.form.controls['mail_address'].patchValue({
				street: '',
				city: '',
				state: '',
				zip: '',

			});
		}
	}


	enableForm() {
		let buttonDiv = getFieldControlByName(this.fieldConfig, 'button-div')
		if (this.form.disabled) {
			this.form.enable();
			buttonDiv.classes = buttonDiv.classes.filter(className => className != 'hidden');
		} else {
			this.form.disable();
			buttonDiv.classes.push('hidden');
		}
	}


	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
		this.caseFlowService.removeScrollClasses();
		// this.logger.log('contact-people-form OnDestroy Called');
	}
	canDeactivate() {
		if (this.aclService.hasPermission('patient-case-list-personal-information-emergency-contact-view'))
			return (this.form.dirty && this.form.touched);
	}
	case: CaseModel
	getCase(callback?) {
		this.subscription.push(
			this.caseFlowService.getCase(this.caseId).subscribe((res) => {
				let data: CaseModel = res.result.data;
				this.setDrugTestingForm()
				if (this.router.url.includes('form-filler')) {

					this.patientDetail = data.form_filler_information;
					getFieldControlByName(this.fieldConfig, 'dob').classes.push('hidden')
					getFieldControlByName(this.fieldConfig, 'home_phone').classes.push('hidden')
					getFieldControlByName(this.fieldConfig, 'ssn').classes.push('hidden')
					getFieldControlByName(this.fieldConfig, 'gender').classes.push('hidden')
					// getFieldControlByName(this.fieldConfig,'ssn').classes.push('hidden')
					// getFieldControlByName(this.fieldConfig, 'contact_person_relation_id').classes.push('hidden')
					if (!this.caseFlowService.shouldShowGuarantorOption()) {
						getFieldControlByName(this.fieldConfig, 'is_guarantor').classes.push('hidden')
					}
				} else if (this.router.url.includes('emergency-contact')) {
					this.patientDetail = data.emergency_information;
					getFieldControlByName(this.fieldConfig, 'ssn').classes.push('hidden')
					getFieldControlByName(this.fieldConfig, 'gender').classes.push('hidden')
					getFieldControlByName(this.fieldConfig, 'is_emergency').classes.push('hidden')
					if (!this.caseFlowService.shouldShowGuarantorOption()) {
						getFieldControlByName(this.fieldConfig, 'is_guarantor').classes.push('hidden')
					} else {
						getFieldControlByName(this.fieldConfig, 'is_guarantor').classes = getFieldControlByName(this.fieldConfig, 'is_guarantor').classes.filter(className => className != 'hidden')
					}
				} else if (this.router.url.includes('guarantor')) {
					this.patientDetail = data.guarantor_information;
					getFieldControlByName(this.fieldConfig, 'is_emergency').classes.push('hidden')
					getFieldControlByName(this.fieldConfig, 'is_guarantor').classes.push('hidden')
				}

				this.case = data
				this.case.is_finalize ? this.enableForm() : null

				if (this.patientDetail) {
					this.setValues()
					// this.enableForm()
					callback ? callback() : null
				}
			}),
		);
	}
	isDateOfAdmissionMax() {
		if(this.form) {
		this.subscription.push(this.form.controls['dob'].valueChanges.subscribe((value) => {
			if(WithoutTime(new Date(value)) > WithoutTime(new Date)) {
				this.form.controls['dob'].setErrors({max_date:true});
			} else {
				this.form.controls['dob'].setErrors(null);
			}
		}))
	}
	}
}
