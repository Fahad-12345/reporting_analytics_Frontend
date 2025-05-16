import { Component, ViewChild} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
import { FDServices } from '../../../../fd_shared/services/fd-services.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { AclService } from '@appDir/shared/services/acl.service';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { CasesServiceService } from '@appDir/front-desk/cases/cases-service.service';
import { CanDeactivateComponentInterface } from '@appDir/shared/canDeactivateFormsComponent/CanDeactivateComponent.interface';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { AddressClass } from '@appDir/shared/dynamic-form/models/AddressClass.class';
import { RadioButtonClass } from '@appDir/shared/dynamic-form/models/RadioButtonClass.class';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { ButtonClass } from '@appDir/shared/dynamic-form/models/ButtonClass.class';
import { ButtonTypes } from '@appDir/shared/dynamic-form/constants/ButtonTypes.enum';
import { CaseModel, PatientDetailModel, AddressEnum, DialogEnum } from '../../../../fd_shared/models/Case.model';
import { RequestService } from '@appDir/shared/services/request.service';
import { DynamicControl } from '@appDir/shared/dynamic-form/models/DynamicControl.class';
import { CaseFlowServiceService } from '../../../../fd_shared/services/case-flow-service.service';
import { getFieldControlByName } from '@appDir/shared/dynamic-form/helper';
import { CaseTypeEnum } from '../../../../fd_shared/models/CaseTypeEnums';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { ZipFormatMessages } from '@appDir/shared/dynamic-form/constants/ZipFormatMessages.enum';
import { removeEmptyAndNullsFormObject, statesList,allStatesList } from '@appDir/shared/utils/utils.helpers';
import { SelectClass } from '@appDir/shared/dynamic-form/models/SelectClass.class';

@Component({
	selector: 'app-contact-info-form',
	templateUrl: './contact-info-form.component.html',
})
export class ContactInfoFormComponent extends PermissionComponent implements CanDeactivateComponentInterface {
	subscription: Subscription[] = [];
	public form: FormGroup;
	title = 'Edit';
	contactInfo: PatientDetailModel;
	caseId: number;
	patientId: number;
	@ViewChild(DynamicFormComponent) component: DynamicFormComponent
	private redirectTo: string;
	disableBtn = false;
	formEnabled: boolean = false;
	enableflag: boolean = true;
	states = statesList;
	allStates = allStatesList;
	constructor(
		private fb: FormBuilder,
		public aclService: AclService,
		private route: ActivatedRoute,
		private logger: Logger,
		private fd_services: FDServices,
		private toastr: ToastrService,
		router: Router,
		titleService: Title,
		private casesService: CasesServiceService,
		protected requestService: RequestService,
		private caseFlowService: CaseFlowServiceService,
	) {
		super(aclService);
		titleService.setTitle(this.route.snapshot.data['title']);


	}
	fieldConfig: FieldConfig[] = []
	bindIsResidentialAddress() {
		this.subscription.push(this.form.controls['is_resedential_same'].valueChanges.subscribe(data => {
			this.residentialOption({ target: { value: data } })
		}))
	}
	ngAfterViewInit() {
		if (this.aclService.hasPermission(this.userPermissions.patient_case_list_personal_information_basic_contact_view)) {
			this.form = this.component.form;

			// let residentialForm: FormGroup = this.form.controls['residential'] as FormGroup
			this.bindIsResidentialAddress()
			// let control = this.fb.control('');
			// this.form.addControl('id', control)

			this.route.snapshot.pathFromRoot.forEach((path) => {
				if (path && path.params && path.params.caseId) {
					if (!this.caseId) {
						this.caseId = path.params.caseId;
					}
				}
			});
		}
		this.getCase();
		if(!this.aclService.hasPermission(this.userPermissions.patient_case_list_personal_information_basic_contact_edit))
		{this.enableForm();

		}

	}
	setDynamicForm() {
		let mailing = (event) => {
			this.handleAddressChange(event, 'mail_address')
		}
		let residential = (event) => {
			this.handleAddressChange(event, 'residential_address')
		}
		this.fieldConfig = [
			new DynamicControl('id', ''),
			new DivClass([
				new InputClass('Home Phone', 'home_phone', InputTypes.text, '', [{ name: 'minlength', message: 'This field cannot be less than 10', validator: Validators.minLength(10) }], '', ['col-12 col-sm-6 col-lg-3'], { mask: '000-000-0000' }),
				new InputClass('Cell Phone*', 'cell_phone', InputTypes.text, '', [{ name: 'minlength', message: 'This field cannot be less than 10', validator: Validators.minLength(10) }, { name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-lg-3', 'col-md-6'], { mask: '000-000-0000' }),
				new InputClass('Work Phone', 'work_phone', InputTypes.text, '', [{ name: 'minlength', message: 'This field cannot be less than 10', validator: Validators.minLength(10) }], '', ['col-12 col-sm-6 col-lg-3'], { mask: '000-000-0000' }),
				new InputClass('Extention', 'ext', InputTypes.text, '', [
					{ name: "maxlength", message: "Extention length cannot be greater than 15", validator: Validators.maxLength(15) }
				], '', ['col-12 col-sm-6 col-lg-3'], { mask: '000000000000000', skip_validation: true }),
				new DivClass([
					new DynamicControl('id', ''),
					new AddressClass('Street Address *', 'street', mailing, '', [
						{ name: 'required', message: 'This field is required', validator: Validators.required }
					], '', ['col-12 col-sm-6']),
					new InputClass('Suite / Floor', 'apartment', InputTypes.text, '', [], '', ['col-12 col-sm-6']),
					new InputClass('City', 'city', InputTypes.text, '', [{ name: 'maxlength', message: 'This fields cannot be greater than 35', validator: Validators.maxLength(35) }, { name: 'required', message: 'This field is required', validator: Validators.required }], '',  ['col-12 col-sm-6 col-lg-4']),
					new SelectClass('State', 'state', this.allStates.map(res => {
						return { name: res.name, label: res.name, value: res.name,fullName:res.fullName };
					}), '', [{ name: 'required', message: 'This field is required', validator: Validators.required }],   ['col-12 col-sm-6 col-lg-4'],false,false,'selectState'),
					new InputClass('Zip', 'zip', InputTypes.text, '', [{name:'pattern', message:ZipFormatMessages.format_usa,validator:Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')}, { name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-12 col-sm-6 col-lg-4']),
				], ['display-contents'], '', '', { formControlName: 'mail_address' }),


			], ['row']),
			new DivClass([
				new InputClass('Email', 'email', InputTypes.email, '', [{ name: 'pattern', message: 'Email is not valid', validator: Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$') }], '', ['col-12 col-sm-6 col-xl-3']),
				new InputClass('Fax', 'fax', InputTypes.text, '', [], '', ['col-12 col-sm-6 col-xl-3'], { mask: '000-000-0000' }),

				new RadioButtonClass('Is your residential address same as mailing address? *', 'is_resedential_same', [
					{ name: 'yes', value: 1, label: 'Yes' },
					{ name: 'no', value: 0, label: 'No' }
				], '', [
					{ name: 'required', message: 'This field is required', validator: Validators.required }
				], ['col-12 col-lg-8 col-xl-6']),
			], ['row']),
			new DivClass([
				new DynamicControl('id', ''),
				new AddressClass('Street Address*', 'street', residential, '', [
					{ name: 'required', message: 'This field is required', validator: Validators.required }
				], '', ['col-12 col-sm-6']),
				new InputClass('Suite / Floor', 'apartment', InputTypes.text, '', [], '', ['col-12 col-sm-6']),
				new InputClass('City', 'city', InputTypes.text, '', [], '', ['col-12 col-sm-6 col-lg-4']),
				// new InputClass('State', 'state', InputTypes.text, '', [], '', ['col-12 col-sm-6 col-lg-4']),
				new SelectClass('State ', 'state', this.allStates.map(res => {
					return { name: res.name, label: res.name, value: res.name, fullName:res.fullName};
				}), '', [], ['ccol-12 col-sm-6 col-lg-4'],false,false,'selectState'),
				// new InputClass('Zip', 'zip', InputTypes.text, '', [], '', ['col-12 col-sm-6 col-lg-4'])
				// new InputClass('Zip', 'zip', InputTypes.text, '', [], '', ['col-12 col-sm-6 col-lg-4'])

				new InputClass('Zip', 'zip', InputTypes.text, '', [{name:'pattern', message:ZipFormatMessages.format_usa,validator:Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')}], '', ['col-12 col-sm-6 col-lg-4'])
			], ['row'], 'Residential Address', '', { formControlName: 'residential_address' }),
			new DivClass([
				new RadioButtonClass('Is the patient entering this information themselves? *', 'is_form_filler', [
					{ label: 'Self', name: 'self', value: DialogEnum.self },
					{ label: 'Other', name: 'other', value: DialogEnum.other }
				], '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-12 col-lg-8 col-xl-6']),
			], ['row']),
			new DivClass([
				new ButtonClass('Back', ['btn', 'btn-primary', 'btn-block', 'mt-0 mb-3 mb-sm-0'], ButtonTypes.button, this.goBack.bind(this), { icon: 'icon-left-arrow me-2', button_classes: [''] }),
				new ButtonClass('Save & Continue', ['btn', 'btn-success', 'btn-block', 'mt-0'], ButtonTypes.submit, null, { icon: 'icon-save-continue me-2', button_classes: [''] })
			], ['row', 'form-btn', 'justify-content-center'], '', '', { name: 'button-div' })
		]
	}

	setFormByCaseId() {
		if ( this.caseFlowService.case&&this.caseFlowService.case.case_type&&this.caseFlowService.case.case_type.slug === CaseTypeEnum.corporate) {
			getFieldControlByName(this.fieldConfig, 'is_form_filler').options.push({ name: "skip", label: "Skip", value: DialogEnum.skip })
		}
	}
	ngOnInit() {
		this.redirectTo = '/front-desk/patients/patient_summary/' + this.caseId;
		this.setDynamicForm()



	}



	onSubmit(form) {
		this.logger.log(form);
		if (this.form.valid) {
			this.logger.log('valid');


			this.form.markAsUntouched();
			this.form.markAsPristine();
			// this.enableForm()
			// this.requestService.sendRequest(CaseFlowUrlsEnum.UpdateSession + this.caseId, 'put', REQUEST_SERVERS.kios_api_path, { patient_contact_info: form }).
			this.caseFlowService.updateCase(this.caseId, { patient_contact_info: form }).subscribe(res => {
				// this.enableForm()
				this.toastr.success('Successfully Updated', 'Success')
				this.getCase(callback => {

					// this.form.reset()
					this.caseFlowService.goToNextStep()
				})
				this.caseFlowService.getPersonalInformation(this.caseId).subscribe(data => {
				})
			}, err => this.toastr.error(err.error.message, 'Error'))
			// if (form.id == null) {
			// 	this.addContactInfo(form);
			// } else {
			// 	this.updateContactInfo(form);
			// }
		} else {
			this.logger.log('invalid');
			this.fd_services.touchAllFields(this.form);
		}
	}

	addContactInfo(form) {
		this.disableBtn = true;
		this.subscription.push(
			this.fd_services.addPatientAddress(form).subscribe(
				(res) => {
					this.disableBtn = false;
					if (res.statusCode == 200) {
						this.form.markAsUntouched()
						this.form.markAsPristine()
						this.casesService.updateCaseObsevable(true)
						// this.disableForm();
						this.getCase();
						this.toastr.success("Patient's contact information added successfully", 'Success');
						// this.router.navigate([this.redirectTo]);
					} else {
						this.toastr.error(res.error.message, 'Error');
					}
				},
				(err) => {
					this.disableBtn = false;
					this.toastr.error(err.error.error.message, 'Error');
				},
			),
		);
	}

	updateContactInfo(form) {
		this.disableBtn = true;
		this.subscription.push(
			this.fd_services.updatePatientAddress(form).subscribe(
				(res) => {
					this.disableBtn = false;
					if (res.statusCode == 200) {
						this.form.markAsPristine()
						this.form.markAsUntouched()
						this.casesService.updateCaseObsevable(true)
						// this.disableForm();
						this.getCase();
						this.toastr.success("Patient's contact information Successfully Updated", 'Success');
						// this.router.navigate([this.redirectTo]);
					} else {
						this.toastr.error(res.error.message, 'Error');
					}
				},
				(err) => {
					this.disableBtn = false;
					this.toastr.error(err.error.error.message, 'Error');
				},
			),
		);
	}

	case: CaseModel
	getCase(callback?) {
		this.subscription.push(
			this.caseFlowService.getCase(this.caseId).subscribe((res) => {
				// this.fd_services.setCase(res.data);
				let data: CaseModel = res.result.data;
				this.case = data
				this.contactInfo = data.basic_information;
				this.patientId = data.patient_id;
				this.setFormByCaseId()
				this.case.is_finalize ? this.enableForm() : null
				if (this.contactInfo) {
					this.form.patchValue(removeEmptyAndNullsFormObject(this.contactInfo))
				}
				else {
					// data.patient ? this.form.patchValue(data.patient) : ''
					// let mailingForm = this.form.controls['mail_address'] as FormGroup;
					// mailingForm.patchValue({
					// 	apartment: data.patient['appartment'],
					// 	city: data.patient['city'],
					// 	state: data.patient['state'],
					// 	zip: data.patient['zip']
					// })
				}
				callback ? callback() : null


			}),
		);
	}

	public handleAddressChange(address: Address, type: string) {
		let street_number = this.fd_services.getComponentByType(address, 'street_number');
		let route = this.fd_services.getComponentByType(address, 'route');
		let city = this.fd_services.getComponentByType(address, 'locality');
		let state = this.fd_services.getComponentByType(address, 'administrative_area_level_1');
		let postal_code = this.fd_services.getComponentByType(address, 'postal_code');

		let subform = this.form.controls[type] as FormGroup
		if (street_number != null) {
			let address: any;
			address = street_number.long_name + ' ' + route.long_name;


			subform.patchValue({
				street: address,
				city: city.long_name,
				state: state.long_name,
				zip: postal_code.long_name,
			});
		} else {
			subform.patchValue({
				address: '',
				city: '',
				state: '',
				zip: '',
			});
		}
	}

	residentialOption(ev) {
		this.logger.log(ev.target.value);
		let residentialForm = this.form.controls['residential_address'] as FormGroup;
		let mailingForm = this.form.controls['mail_address'] as FormGroup;
		if (ev.target.value == 1) {


			residentialForm.patchValue({ ...mailingForm.value, id: residentialForm.value.id })

		} else {
			let residential_form_id=this.case.basic_information.residential_address.id
			residentialForm.reset();
			residentialForm.patchValue({id: residential_form_id })

		}
	}

	goBack() {
		this.caseFlowService.goBack()
		// this.router.navigate(['patient_summary'], { relativeTo: this.route.parent });
	}

	enableForm() {
		let buttonDiv = getFieldControlByName(this.fieldConfig, 'button-div')
		if (this.form.disabled) {
			this.form.enable();
			buttonDiv.classes = buttonDiv.classes.filter(className => className != 'hidden')
		} else {
			this.form.disable();
			buttonDiv.classes.push('hidden')
		}
		// if (enableflag == false) {
		// 	this.disableForm();
		// 	return;
		// } else {
		// 	this.form.enable();
		// 	this.formEnabled = true;
		// 	this.enableflag = false;
		// }
	}
	disableForm() {
		this.form.disable();
		this.formEnabled = false;
		this.enableflag = true;
	}

	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
		this.logger.log('contact-info-form OnDestroy Called');
	}
	canDeactivate() {
		if (this.aclService.hasPermission(this.userPermissions.patient_case_list_personal_information_basic_contact_view))
			return (this.form.dirty && this.form.touched);
	}

}
