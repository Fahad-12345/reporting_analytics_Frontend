import { ReferringPhysicianUrlsEnum } from '@appDir/front-desk/masters/practice/referring-physician/referring-physician/referringPhysicianUrlsEnum';
import { NgSelectClass } from '@appDir/shared/dynamic-form/models/NgSelectClass.class';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { FirmUrlsEnum } from '@appDir/front-desk/masters/billing/attorney-master/firm/Firm-Urls-enum';
import { Component, OnInit, Input, OnChanges, ViewChild, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
// import { FDServices } from '../../../fd_shared/services/fd-services.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { AclService } from '@appDir/shared/services/acl.service';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { AddressClass } from '@appDir/shared/dynamic-form/models/AddressClass.class';
import { RadioButtonClass } from '@appDir/shared/dynamic-form/models/RadioButtonClass.class';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { ButtonClass } from '@appDir/shared/dynamic-form/models/ButtonClass.class';
import { ButtonTypes } from '@appDir/shared/dynamic-form/constants/ButtonTypes.enum';
import { DynamicControl } from '@appDir/shared/dynamic-form/models/DynamicControl.class';
import { Referral } from '@appDir/front-desk/models/ReferralModal';
import { Observable, Subscription } from 'rxjs';
import { getFieldControlByName } from '@appDir/shared/dynamic-form/helper';
// import { CaseFlowServiceService } from '../../../fd_shared/services/case-flow-service.service';
import { SelectClass } from '@appDir/shared/dynamic-form/models/SelectClass.class';
import { Location } from '@angular/common';
import { formatMoment } from 'ngx-bootstrap/chronos/format';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';

import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { CaseTypeEnum, CaseTypeIdEnum } from '@appDir/front-desk/fd_shared/models/CaseTypeEnums';
import { DialogEnum, CaseModel } from '@appDir/front-desk/fd_shared/models/Case.model';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { allStatesList,statesList, removeEmptyAndNullsFormObject, removeEmptyKeysFromObject } from '@appDir/shared/utils/utils.helpers';
import { RequestService } from '@appDir/shared/services/request.service';
import { sortAndDeduplicateDiagnostics } from 'typescript';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';



@Component({
	selector: 'app-referring-form',
	templateUrl: './referring-form.component.html',
})
export class ReferringFormComponent extends PermissionComponent implements OnChanges {

	public form: FormGroup
	public contactPersonAddresses: FormGroup
	public contactPersonAddresses_primary: FormGroup
	public reffering_physician: FormGroup
	public primary_physician: FormGroup
	@Input() title = ''
	@Input() caseId: any;
	public referring: Referral
	@Input() type;
	@Input() enableForm: boolean;
	@ViewChild(DynamicFormComponent) component: DynamicFormComponent;
	radioBtnHide: any = false;
	radioBtnPrimaryHide: any = false;
	formDetails: FormGroup;
	disableBtn = false
	deleteButton = true
	deletebtn = true
	formEnabled: boolean = false;
	enableflag: boolean = true;
	states = statesList
	data: any[] = null;
	fieldConfig: FieldConfig[] = [];
	allStates = allStatesList;
	id: number;

	constructor(public aclService: AclService, private caseFlowService: CaseFlowServiceService, private location: Location,
		private customDiallogService : CustomDiallogService, private fb: FormBuilder,
		protected requestService: RequestService,
		//  private logger: Logger,
		  private fd_services: FDServices, private toastrService: ToastrService,  route: ActivatedRoute,  router: Router) {
		super(aclService);
	}
	ngAfterViewInit() {

		this.bindRefferingPhyscianChange();
		this.bindClinicChange();
		this.bindLocationChange();
		if (this.aclService.hasPermission('patient-case-list-referrals-physical-information-view')) {
			this.form = this.component.form
			// this.disableRefForm();
			this.hideButtons();
		}

		if(!this.aclService.hasPermission(this.userPermissions.patient_case_list_referrals_physical_information_edit))
		{
			this.enableDisableForm();
		}
	
		
	}
	physicianRadioButton() {
		let reffer_by_physician_dialog = getFieldControlByName(this.fieldConfig, 'reffer_by_physician_dialog').values
		let primary_care_physician_dialog = getFieldControlByName(this.fieldConfig, 'primary_care_physician_dialog').values
		let reffering_physicianfield = getFieldControlByName(this.fieldConfig, 'reffering_physician_div')
		let primary_physicianfield = getFieldControlByName(this.fieldConfig, 'primary_physician_div')

		reffer_by_physician_dialog == 'no' || reffer_by_physician_dialog == '' || reffer_by_physician_dialog == 'skip' ? reffering_physicianfield.classes.push('hidden') : reffering_physicianfield.classes = reffering_physicianfield.classes.filter(className => className != 'hidden')
		primary_care_physician_dialog == 'no' || primary_care_physician_dialog == '' || primary_care_physician_dialog == 'skip' ? primary_physicianfield.classes.push('hidden') : primary_physicianfield.classes = primary_physicianfield.classes.filter(className => className != 'hidden')
	}
	formValue: any
	formmailValue: any
	/**
	 * hide or show Referred fields on radio button click
	 */
	hideReferredFields() {
		let referringForm = this.form.controls['reffering_physician'] as FormGroup;
				let clinicLocationForm = referringForm.controls['clinic_location'] as FormGroup;
				let  refferingPhysicanForm = referringForm.controls['physician'] as FormGroup;
				let  clinic = referringForm.controls['clinic'] as FormGroup;
				this.subscription.push(referringForm.get('reffer_by_physician_dialog').valueChanges.subscribe(res => {
			res == 'yes' ? this.deleteButton = true : ""
			let field = getFieldControlByName(this.fieldConfig, 'reffering_physician_div')
			if (res == 'no') {
				this.formValue = (this.reffering_physician.value)
				
				this.formmailValue = removeEmptyKeysFromObject(clinicLocationForm.value)
				delete this.formValue.case_id
				delete this.formValue.id
				this.formValue.clinic_location = removeEmptyKeysFromObject(this.formValue.clinic_location)
				delete this.formValue.clinic_location.id
				this.form;
				Object.keys(this.formValue.clinic_location).length > 0 ? this.formValue.clinic_location : delete this.formValue.clinic_location
				delete this.formValue.is_deleted
				delete this.formValue.reffer_by_physician_dialog
				this.formValue ? this.formValue : this.formValue = null
			}
			if (this.deleteButton) {
				if ((res == 'no' || res == 'skip') && res != null && res != '' && ((!refferingPhysicanForm.dirty && refferingPhysicanForm.value.first_name) || refferingPhysicanForm.dirty ||  clinic.dirty  || clinicLocationForm.dirty )) {
					this.confirmDel('reffer_by_physician_dialog', res)
				}
				if (res == 'yes') {
					field.classes = field.classes.filter(className => className != 'hidden')
				}
				else
					field.classes.push('hidden')
			}

		}))
	}
	/**
	 * hide or show Primary fields on radio button click
	 */
	hidePrimaryFields() {
		this.subscription.push(this.form.get('primary_physician').get('primary_care_physician_dialog').valueChanges.subscribe(res => {
			res == 'yes' ? this.deletebtn = true : ""
			let field = getFieldControlByName(this.fieldConfig, 'primary_physician_div')
			if (res != 'yes') {
				this.formValue = removeEmptyAndNullsFormObject(this.primary_physician.value)
				this.formmailValue = removeEmptyAndNullsFormObject(this.primary_physician.value['mail_address'])
				delete this.formValue.case_id
				delete this.formValue.id
				this.formValue.mail_address = removeEmptyAndNullsFormObject(this.formValue.mail_address)
				delete this.formValue.mail_address.id
				Object.keys(this.formValue.mail_address).length > 0 ? this.formValue.mail_address : delete this.formValue.mail_address
				delete this.formValue.is_deleted
				delete this.formValue.primary_care_physician_dialog
				this.formValue ? this.formValue : this.formValue = null
			}
			if (this.deletebtn) {
				if ((res == 'no' || res == 'skip') && res != null && res != '' && ((!this.primary_physician.dirty && this.primary_physician.value.first_name) || this.primary_physician.touched || this.primary_physician.dirty) && Object.keys(this.formValue).length > 0) {
					this.confirmDel('primary_care_physician_dialog', res)
				}
				if (res == 'yes') {
					field.classes = field.classes.filter(className => className != 'hidden')

				}
				else
					field.classes.push('hidden')
			}
		}))
	}
	/**
	 * hide save and cancle button
	 */
	hideButtons() {
		this.form.disabled ? this.fieldConfig[1].classes.push('hidden') : this.fieldConfig[1].classes = this.fieldConfig[1].classes.filter(className => className != 'hidden')
	}

	enableDisableForm() {
		let buttonDiv = getFieldControlByName(this.fieldConfig, 'button-div')
		if (this.form.disabled) {
			this.form.enable();
			buttonDiv.classes = buttonDiv.classes.filter(className => className != 'hidden');
		} else {
			this.form.disable();
			buttonDiv.classes.push('hidden');
		}
	}
	ngOnInit() {
		this.setConfigration(this.referring);
		this.getCase();
		this.physicianRadioButton();
	}



	ngOnChanges(changes?: SimpleChanges) {
		if (this.referring && this.reffering_physician && this.primary_physician) {
			this.setValues()
		}
		if (this.enableForm) {
			this.form.enable()
		}
	}
	/**
	 * set values in form
	 */
	setValues() {
		this.reffering_physician.patchValue({ case_id: this.caseId, reffer_by_physician_dialog: this.referring.reffer_by_physician_dialog === "none" ? null : this.referring.reffer_by_physician_dialog });
		this.primary_physician.patchValue({ case_id: this.caseId, primary_care_physician_dialog: this.referring.primary_care_physician_dialog === "none" ? null : this.referring.primary_care_physician_dialog });
		if(this.referring?.reffer_by_physician_dialog == DialogEnum.yes){
			if (this.referring && this.referring.reffering_physician)
				this.reffering_physician.patchValue(this.referring.reffering_physician)
				let referingPhysican = this.reffering_physician.controls['physician'] as FormGroup;
				let referingClinc = this.reffering_physician.controls['clinic'] as FormGroup;
				 referingPhysican.controls['referrer_id'].setValue(this.referring.reffering_physician.physician_id);
				 referingClinc.controls['clinic_id'].setValue(this.referring.reffering_physician.clinic_id);
				 let referingPhysicanSelected =[{
					id: this.referring.reffering_physician?.physician_id,
					first_name: this.referring.reffering_physician?.physician?.['first_name'],
					middle_name: this.referring.reffering_physician?.physician?.['middle_name'],
					last_name: this.referring.reffering_physician?.physician?.['last_name'],
					referrer_id:this.referring.reffering_physician?.physician_id,
				 }];
	
				 let ClinicPhysicanSelected =[{
					id: this.referring.reffering_physician?.clinic_id,
					name: this.referring.reffering_physician?.clinic?.['name'],
					clinic_id:this.referring.reffering_physician?.clinic_id,
					locations: [this.referring.reffering_physician?.clinic_location]
				 }];
				 let addressClinic =[{
					id: this.referring.reffering_physician?.clinic_id,
					name: this.referring.reffering_physician?.clinic?.['name'],
					clinic_id:this.referring.reffering_physician?.clinic_id,
				 }];
				 this.lstClinic= [...ClinicPhysicanSelected];
				 this.lstFirm = [...referingPhysicanSelected];
				 
				  let clinic_control = getFieldControlByName(this.fieldConfig, 'clinic_id');
				  clinic_control.items = this.lstClinic;
				let physcian_control = getFieldControlByName(this.fieldConfig, 'referrer_id');
				this.lstFirm = this.lstFirm?.map(refferr => {
					return { ...refferr, customBind: `${refferr.first_name} ${refferr.middle_name ? refferr.middle_name : ''} ${refferr.last_name}`,full_name: `${refferr.first_name} ${refferr.middle_name ? refferr.middle_name : ''} ${refferr.last_name}`}
				})
				physcian_control.items = this.lstFirm;

				//  referingPhysican.controls['fir'].setValue(this.referring.reffering_physician.physician_id);
	
				if (this.referring && this.referring.reffering_physician && this.referring.reffering_physician.clinic_location) {
					this.contactPersonAddresses.controls['clinic_location_id'].setValue(this.referring.reffering_physician.clinic_location.id);
					let clinic_location_control = getFieldControlByName(this.fieldConfig, 'clinic_location_id');
					clinic_location_control.items = [this.referring.reffering_physician.clinic_location];
					this.contactPersonAddresses.patchValue(this.referring.reffering_physician.clinic_location, { emitEvent: true })
				}
		}
	
		if(this.referring?.primary_care_physician_dialog == DialogEnum.yes){
			if (this.referring && this.referring.primary_physician)
				this.primary_physician.patchValue(this.referring.primary_physician)
			if (this.referring && this.referring.primary_physician && this.referring.primary_physician.mail_address) {
				this.contactPersonAddresses_primary.patchValue(this.referring.primary_physician.mail_address, { emitEvent: false })
			}
		}
		// this.physicianRadioButton()
	}
	/**
	 * on submit form
	 * @param form 
	 */
	submit(form) {
	
		if (form) {
			form.primary_care_physician_dialog = ''
			form.reffer_by_physician_dialog = ''
			if (this.referring && form.primary_physician && !form.primary_physician.first_name) {
				form.primary_physician.primary_care_physician_dialog ? form.primary_care_physician_dialog = form.primary_physician.primary_care_physician_dialog : form.primary_care_physician_dialog = 'no'
				// form.primary_physician = null;
			}
			else {
				form.primary_care_physician_dialog = 'yes'
			}
			if (this.referring && form.reffering_physician && !form.reffering_physician.first_name) {
				form.reffering_physician.reffer_by_physician_dialog ? form.reffer_by_physician_dialog = form.reffering_physician.reffer_by_physician_dialog : form.reffer_by_physician_dialog = 'no'
				// form.reffering_physician = null;
			}
			else {
				form.reffer_by_physician_dialog = 'yes'
			}
			this.disableBtn = true
			// this.logger.log('form is valid')
			 
			this.reffering_physician;
			let referingPhyscian = this.reffering_physician.controls['physician'];
			let reffering_id = referingPhyscian.get('id').value
			let primary_id = this.primary_physician.get('id').value
			if(typeof form['reffering_physician']['physician']['referrer_id'] == 'string') {
				form['reffering_physician']['physician']['first_name'] = 
				form['reffering_physician']['physician']['referrer_id'];
				form['reffering_physician']['physician']['referrer_id']= null;
			}
			if(typeof form['reffering_physician']['clinic']['clinic_id'] == 'string') {
				form['reffering_physician']['clinic']['name']= form['reffering_physician']['clinic']['clinic_id'];
				form['reffering_physician']['clinic']['clinic_id']= null;
			}
			if(typeof form['reffering_physician']['clinic_location']['clinic_location_id'] == 'string') {
				form['reffering_physician']['clinic_location']['street_address']= 
				form['reffering_physician']['clinic_location']['clinic_location_id'] ;
				form['reffering_physician']['clinic_location']['clinic_location_id']  = null;
			}
			form['reffering_physician']['is_deleted'] = false;
			form['reffering_physician']['id']  = this.id;
			if (reffering_id == null && primary_id == null ||  primary_id == '' && reffering_id == "") {
				this.addReferring((form))
			} 
			else {
				this.updateReferring((form))
			}
		} 
		else {
			this.fd_services.touchAllFields(this.form);
		}
	}
	/**
	 * update record 
	 * @param form 
	 */
	updateReferring(form) {
		if(form?.primary_care_physician_dialog == DialogEnum.no || form?.primary_care_physician_dialog == DialogEnum.skip || form?.primary_care_physician_dialog == DialogEnum.none){
			delete form['primary_physician']
		}
		if(form?.reffer_by_physician_dialog == DialogEnum.no || form?.reffer_by_physician_dialog == DialogEnum.skip || form?.reffer_by_physician_dialog == DialogEnum.none){
			delete form['reffering_physician']
		}
		this.caseFlowService.updateCase(this.caseId, form).subscribe(res => {
			// getFieldControlByName(this.fieldConfig, 'save-button').configs.disabled = true

			this.disableBtn = false
			this.form.markAsUntouched();
			this.form.markAsPristine();
			this.getPhyInfoData(callback => {
				this.goForward();
			})
			this.toastrService.success('Successfully Updated ', 'Success')

		}, err => {
			getFieldControlByName(this.fieldConfig, 'save-button').configs.disabled = false

			this.disableBtn = false
			this.toastrService.error(err.error.error.message, 'Error')
		})
	}
	/**
	 * Add record
	 * @param form 
	 */
	addReferring(form) {
		if(form?.primary_care_physician_dialog == DialogEnum.no || form?.primary_care_physician_dialog == DialogEnum.skip || form?.primary_care_physician_dialog == DialogEnum.none){
			delete form['primary_physician']
		}
		if(form?.reffer_by_physician_dialog == DialogEnum.no || form?.reffer_by_physician_dialog == DialogEnum.skip || form?.reffer_by_physician_dialog == DialogEnum.none){
			delete form['reffering_physician']
		}
		this.caseFlowService.updateCase(this.caseId, form).subscribe(res => {
			// getFieldControlByName(this.fieldConfig, 'save-button').configs.disabled = true

			this.disableBtn = false
			this.form.markAsUntouched();
			this.form.markAsPristine();
			this.getPhyInfoData(callback => {
				this.goForward();
			})
			this.toastrService.success('Successfully Updated', 'Success')
		}, err => {
			getFieldControlByName(this.fieldConfig, 'save-button').configs.disabled = false
			this.disableBtn = false
			this.toastrService.error(err?.error?.error?.message, 'Error')
		})
	}

	getPhyInfoData(callback?) {
		this.subscription.push(
			this.caseFlowService.getCase(this.caseId).subscribe((res) => {
				callback ? callback() : null
			}),
		);
	}

	case: CaseModel
	getCase() {
		this.subscription.push(
			this.caseFlowService.getCase(this.caseId).subscribe((res) => {

				if (res.status == 200) {
					let data: CaseModel = res.result.data;
					this.case = data
					this.referring = res['result']['data'] && res['result']['data']['physician'] ? res['result']['data']['physician'] : [];
					this.id = this.referring?.reffering_physician?.id;
					// this.case.is_finalize ? this.enableRefForm() : null
					if (this.referring && (this.referring.primary_physician || this.referring.reffering_physician) && this.reffering_physician && this.primary_physician)
	 				

					this.setValues()
					if (this.referring && this.reffering_physician && this.primary_physician) {
						this.reffering_physician.patchValue({ case_id: this.caseId, reffer_by_physician_dialog: this.referring.reffer_by_physician_dialog === "none" ? null :  this.referring.reffer_by_physician_dialog });
						this.primary_physician.patchValue({ case_id: this.caseId, primary_care_physician_dialog: this.referring.primary_care_physician_dialog === "none" ? null : this.referring.primary_care_physician_dialog  });
					}
					this.disabledAttorneryDependentFields();
					this.disableFields(true,['email','floor', 'street_address','state','city','zip','phone','extension'],'reffering_physician');

				}
			}, err => {
				this.disableBtn = false
				if(this.referring?.primary_physician) {
					this.referring.primary_physician = null
				}
				if(this.referring?.reffering_physician) {
					this.referring.reffering_physician = null
				}
				// this.toastrService.error(err.error, 'Error')
			}
			))
	}
	/**
	 * populate Address 
	 * @param address 
	 * @param primary 
	 */
	public handleAddressChange(address: Address, primary) {

		let street_number = this.fd_services.getComponentByType(address, "street_number");
		let route = this.fd_services.getComponentByType(address, "route");
		let city = this.fd_services.getComponentByType(address, "locality");
		let state = this.fd_services.getComponentByType(address, "administrative_area_level_1");
		let postal_code = this.fd_services.getComponentByType(address, "postal_code");


		if (street_number != null) {
			let address: any;
			address = street_number.long_name + ' ' + route.long_name
			if (primary) {
				this.contactPersonAddresses_primary.patchValue({
					street: address,
					city: city.long_name,
					state: state.long_name,
					zip: postal_code.long_name,
				})
			}
			else {
				this.contactPersonAddresses.patchValue({
					street: address,
					city: city.long_name,
					state: state.long_name,
					zip: postal_code.long_name,
				})
			}

		} else {
			this.contactPersonAddresses.patchValue({
				street: "",
				city: "",
				state: "",
				zip: "",
			})
		}
	}
	/**
	 * navigate to pevious screen
	 */
	goBack() {
		this.caseFlowService.goBack();
	}
	/**
	 * move to next tab
	 */
	goForward() {
		this.caseFlowService.goToNextStep()
	}
	/**
	 * enable the form
	 */
	enableRefForm(enableflag?) {
		let buttonDiv = getFieldControlByName(this.fieldConfig, 'button-div')
		if (this.form.disabled) {
			this.form.enable();
			buttonDiv.classes = buttonDiv.classes.filter(className => className != 'hidden')
		} else {
			this.form.disable();
			buttonDiv.classes.push('hidden')
		}
		// if (enableflag == false) { this.disableRefForm(); return; }
		// this.form.enable({
		//   onlySelf: true,
		//   emitEvent: false
		// });
		// this.formEnabled = true;
		// this.enableflag = false;
		// this.hideButtons();
	}
	/**
	 * disable the form
	 */
	disableRefForm() {

		this.form.disable({
			onlySelf: true,
			emitEvent: false
		});
		this.formEnabled = false;
		this.enableflag = true;
		this.hideButtons();
	}

	addSkipInDrugCase() {
		// if (this.caseFlowService.showSkipReferral()) {
		if (this.caseFlowService.case && this.caseFlowService.case.case_type && this.caseFlowService.case.case_type.slug === CaseTypeEnum.corporate) {
			let field = getFieldControlByName(this.fieldConfig, "primary_care_physician_dialog")
			let field2 = getFieldControlByName(this.fieldConfig, "reffer_by_physician_dialog")
			field.options.push({ name: "reffer_by_physician_dialog_skip", label: "Skip", value: DialogEnum.skip })
			field2.options.push({ name: "primary_care_physician_dialog_skip", label: "Skip", value: DialogEnum.skip })
		}

	}
	/**
	 * set the form configrations
	 * @param data 
	 */
	setConfigration(data?) {
		this.fieldConfig = [
			new DivClass([

				new DivClass([
					new DivClass([
						new RadioButtonClass('Were you referred by a physician?*', 'reffer_by_physician_dialog',
							[{ name: 'reffer_by_physician_dialog_true' + this.type, value: 'yes', label: 'Yes' }, { name: 'reffer_by_physician_dialog_false' + this.type, value: 'no', label: 'No' }],
							null, [{ name: 'required', message: 'This field is required', validator: Validators.required }],
						['col-sm-12', 'col-md-8 col-lg-6']),
						new DivClass([
							new DivClass([
								new DivClass([
									new DivClass([
										new DynamicControl('id', null),
										new DynamicControl('clinic_id', null),
										new DynamicControl('name', null),
										new NgSelectClass("Clinic Name", 'clinic_id', 'name', 'id', this.searchClinicName.bind(this), false, null, [], '', ['col-md-3 col-sm-12', 'ps-0'], [], { add_tag: true }, null, null, this.searchClinicName.bind(this), this.onFocusSearchClinicName.bind(this)),
									], [], '', '', { formControlName: 'clinic' }),
									new DivClass([
										new DynamicControl('id', null),
										new DynamicControl('street_address', null),
										new NgSelectClass('Address*', 'clinic_location_id', 'street_address', 'id', null, false, null, [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-12 col-sm-6'], [], { add_tag: true }),
										new InputClass('Suite / Floor', 'floor', InputTypes.text, '', [], '', ['col-sm-6', 'col-md-4', 'col-lg-6']),
										new InputClass('City*', 'city', InputTypes.text, '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-sm-6 col-md-4']),
										new SelectClass('State*', 'state', this.allStates.map(res => {
											return { name: res.name, label: res.name, value: res.name, fullName: res.fullName }
										}), '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-sm-6', 'col-lg-4'], false, false, 'selectState'),
										new InputClass('Zip*', 'zip', InputTypes.text, '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-sm-6 col-md-4'], { mask: '00000' }),
										new InputClass('Email', 'email', InputTypes.email, '', [{ name: 'pattern', message: 'Email is not valid', validator: Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$') }], '', ['col-sm-6 col-md-4 col-lg-3']),
										new InputClass('Phone Number', 'phone', InputTypes.text, '', [{ name: 'minlength', message: '', validator: Validators.minLength(9) }], '', ['col-sm-6 col-md-4 col-lg-3'], { mask: '000-000-0000' }),
										new InputClass('Extention', 'extension', InputTypes.text, '', [
											{ name: "maxlength", message: "Extention length cannot be greater than 15", validator: Validators.maxLength(15) }
										], '', ['col-sm-6 col-md-4 col-lg-3'], { mask: '000000000000000', skip_validation: true }),
									], ['row'], '', '', { formControlName: 'clinic_location' }),
								], ['col-12']),
								new DivClass([
									new DivClass([
										new DynamicControl('id', null),
										new DynamicControl('case_id', null),
										new DynamicControl('first_name', null),
										new NgSelectClass("First Name *", 'referrer_id', 'full_name', 'id', this.searchReferingPhyscian.bind(this), false, null, [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-sm-12 col-md-3'], [], { add_tag: true },this.onFocusSearchReferingPhysician.bind(this), null, this.searchReferingPhyscian.bind(this), this.onFocusSearchReferingPhysician.bind(this), '', null, null, null, null, null, null, true,null,null,null,null,null,null,'first_name'),
										new DynamicControl('type', ''),
										new InputClass('Middle Name ', 'middle_name', InputTypes.text, '', [], '', ['col-md-3 col-sm-12']),
										new InputClass('Last Name *', 'last_name', InputTypes.text, '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-sm-12 col-md-3']),
									], ['row'], '', '', { formControlName: 'physician' }),
								], ['col-md-12']),
								new DynamicControl('is_deleted', false)
							], ['row'], '', '', { name: 'reffering_physician_div' }),
						], ['col-12']),

					], ['row'], '', '', { formControlName: 'reffering_physician' }),
				], ['col-md-12']),
				new DivClass([], [], 'Primary Physician'),

				new DivClass([
					new DivClass([
						new RadioButtonClass('Do you have a primary care physician?*', 'primary_care_physician_dialog',
							[{ name: 'primary_care_physician_dialog_true' + this.type, value: 'yes', label: 'Yes' }, { name: 'primary_care_physician_dialog_false' + this.type, value: 'no', label: 'No' }],
							null, [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-sm-12', 'col-md-8 col-lg-6']),
						new DivClass([
							new DivClass([
								new DynamicControl('id', null),
								new DynamicControl('case_id', null),
								new DynamicControl('type', ''),
								new InputClass('First Name *', 'first_name', InputTypes.text, '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-sm-6 col-md-4'], null, '_reff_first_name'),
								new InputClass('Middle Name ', 'middle_name', InputTypes.text, '', [], '', ['col-sm-6 col-md-4'], null, 'ref-middle_name'),
								new InputClass('Last Name *', 'last_name', InputTypes.text, '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-sm-6 col-md-4'], null, 'ref_last_name'),
								new InputClass('Clinic Name', 'workplace_name', InputTypes.text, '', [], '', ['col-sm-6 col-md-4 col-lg-3'], null, 'ref_workplace_name'),
								new InputClass('Email', 'email', InputTypes.email, '', [{ name: 'pattern', message: 'Email is not valid', validator: Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$') }], '', ['col-sm-6 col-md-4 col-lg-3'], null, 'ref_email'),
								new InputClass('Phone Number *', 'cell_phone', InputTypes.text, '', [{ name: 'minlength', message: '', validator: Validators.minLength(9) }, { name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-sm-6 col-md-4 col-lg-3'], { mask: '000-000-0000' }, 'ref_cell_phone'),
								new InputClass('Extention', 'ext', InputTypes.text, '', [
									{ name: "maxlength", message: "Extention length cannot be greater than 15", validator: Validators.maxLength(15), }
								], '', ['col-sm-6 col-md-4 col-lg-3'], { mask: '000000000000000', skip_validation: true }, 'ref_ext'),
								new DivClass([
									new DivClass([
										new DynamicControl('id', null),
										new AddressClass('Address*', 'street', this.handleAddressChange_primary.bind(this), '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-sm-6', 'col-md-4', 'col-lg-6']),
										new InputClass('Suite / Floor', 'apartment', InputTypes.text, '', [], '', ['col-sm-6', 'col-md-4', 'col-lg-6'], null, 'apartment_ref'),
										new InputClass('City*', 'city', InputTypes.text, '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-sm-6 col-md-4'], null, 'ref_city'),
										new SelectClass('State*', 'state', this.allStates.map(res => {
											return { name: res.name, label: res.name, value: res.name,fullName:res.fullName  }
										  }), '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-sm-6 col-md-4'],false,false,'selectState'),
										new InputClass('Zip*', 'zip', InputTypes.text, '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-sm-6 col-md-4'], { mask: '00000' }, 'ref_zip'),
									], ['row'], '', '', { formControlName: 'mail_address' }),
								], ['col-12']),
								new DynamicControl('is_deleted', false)
							], ['row'], '', '', { name: 'primary_physician_div' }),
						], ['col-12']),
					], ['row'], '', '', { formControlName: 'primary_physician' }),
				], ['col-12']),
			], ['row']),
			new DivClass([
				new ButtonClass('Back', ['btn', 'btn-primary', 'btn-block mt-2 mt-sm-0'], ButtonTypes.button, this.goBack.bind(this), { icon: 'icon-left-arrow me-2', button_classes: [''] }),
				new ButtonClass('Save & Continue', ['btn', 'btn-success', 'btn-block mt-2 mt-sm-0'], ButtonTypes.submit, null, { icon: 'icon-save-continue me-2', button_classes: [''], name: 'save-button' })
			], ['row', 'form-btn', 'justify-content-center'], '', '', { name: 'button-div' })
		]

	}
	/**
	 * call address for primary physician
	 * @param $event 
	 */
	 lstAttorney:any[]=[];
	 disabledAttorneryDependentFields() {
		 
		let referringForm = this.form.controls['reffering_physician'] as FormGroup;
		let referrForm = referringForm.controls['physician'] as FormGroup
		let enabledControlNames = ['middle_name','last_name']
		enabledControlNames.forEach(name => {
			if (referrForm.get(name)){
				referrForm.get(name).disable() 
			}
		})
	}
	enalbedAttorneyDependentField() {
		let referringForm = this.form.controls['reffering_physician'] as FormGroup;
		let physician = referringForm.controls['physician'] as FormGroup;
		let enabledControlNames = ['middle_name','last_name']
		enabledControlNames.forEach(name => { 
			if (physician.get(name)){
			physician.get(name).enable();
			}
		}
	)
		
	}

	bindClinicChange() {
		 
		let referingForm = this.form.controls['reffering_physician'] as FormGroup;
		let clinicForm = referingForm.controls['clinic'] as FormGroup;
		let locationForm = referingForm.controls['clinic_location'] as FormGroup;
		let refferingPhysicanDiv=getFieldControlByName(this.fieldConfig,'reffering_physician');
		let attornyFormDiv=getFieldControlByName(refferingPhysicanDiv.children,'clinic');
		let attorntControl=getFieldControlByName(attornyFormDiv.children,'clinic_id');
		let firm_control = getFieldControlByName(refferingPhysicanDiv.children, 'referrer_id');
		let referingform = this.form.controls['reffering_physician'] as FormGroup;
		let attorney_form =referingform.controls['clinic'];
		 
		this.subscription.push(
			clinicForm.get('clinic_id').valueChanges.subscribe(id => {
				if(this.isNewClinicIDString()) {
				if(clinicForm.controls['clinic_id'].value) {
						//this.enalbedAttorneyDependentField();
					}
				} else {
				//  this.disabledAttorneryDependentFields();

				if (!id) {
					// (clinicForm.controls['clinic_location'] as FormGroup).reset({},{emitEvent: false})
					// locationForm.controls['clinic_location_id'].reset(null,{emitEvent: false});
					// locationForm.controls['clinic_location_id'].clearValidators();
					// locationForm.controls['clinic_location_id'].updateValueAndValidity({ emitEvent: false });
					
					attorney_form.reset({}, { emitEvent: false })

					this.lstAttorney=[];
						
					attorntControl.items=this.lstAttorney;
					this.lstClinic= [];
					getFieldControlByName(this.fieldConfig, 'clinic_location_id').items = [...this.lstClinic];
						if(!this.form.value.referrer_id)
						{
							this.lstFirm=[];	
												
							firm_control.items = this.lstFirm;
						}
						locationForm.reset();
					return
				}
				 
				id;

				let clinics = this.lstClinic.find(clinic => clinic.id === id);
				 

				getFieldControlByName(this.fieldConfig, 'clinic_location_id').items = clinics ? clinics.locations.filter(res => (res.street_address != null && res.is_verified && res.status) ) : []
				attorntControl.items=this.lstClinic;
				if (clinics)
				{
					locationForm.reset();
					locationForm.controls['clinic_location_id'].setErrors(null);
					locationForm.controls['clinic_location_id'].setErrors({required:true});
					locationForm.updateValueAndValidity({emitEvent:true});
					if (clinics && clinics.locations && clinics.locations.length ==1){
					locationForm.controls['clinic_location_id'].setValue(clinics.locations[0].id);
					let clinic_location_control = getFieldControlByName(this.fieldConfig, 'clinic_location_id');
					clinic_location_control.items =clinics.locations;
					locationForm.patchValue(clinics.locations, { emitEvent: true })
					}
					if(!referingform.value.referrer_id)
					{
						let referingform = this.form.controls['reffering_physician'] as FormGroup;
						let clinicForm = referingform.controls['clinic'] as FormGroup;
						clinicForm.patchValue({
							id: clinics.id,
							name: clinics.name,
							clinic_id:clinics.id

						},{ emitEvent: false });
						// this.form.patchValue({referrer_id:null, reffering_physician: clinics }, { emitEvent: false })
						this.lstFirm=[]
						let firm_control = getFieldControlByName(this.fieldConfig, 'referrer_id');
						firm_control.items = this.lstFirm
					}
				else
					// this.form.patchValue({ reffering_physician: clinics}, { emitEvent: false });
					clinicForm.patchValue({
						id: clinics.id,
						name: clinics.name,
						clinic_id:clinics.id

					},{ emitEvent: false });

				}}
				}))
	}


	 bindRefferingPhyscianChange() {
		 
		
		let  refferingPhysican = this.form.controls['reffering_physician'] as FormGroup;
		let  refferingPhysicanForm = refferingPhysican.controls['physician'] as FormGroup;
		this.subscription.push(
			refferingPhysicanForm.get('referrer_id').valueChanges.subscribe(id => {

				if(this.isNewRefferingPhyscianIDString()) {
					 
				if(refferingPhysicanForm.controls['referrer_id'].value) {
				 this.enalbedAttorneyDependentField();
					}
				} else {
				
				 this.disabledAttorneryDependentFields();
				let refferingPhyscianFormDiv=getFieldControlByName(this.fieldConfig,'reffering_physician');
				let attorntControl=getFieldControlByName(refferingPhyscianFormDiv.children,'referrer_id');
				let firm_control = getFieldControlByName(this.fieldConfig, 'referrer_id');
	
				if (!id) {
					let attorney_form = this.form.controls['reffering_physician']
					refferingPhysicanForm.reset({}, { emitEvent: false })
					
				
						if(!this.form.value.referrer_id)
						{
							this.lstFirm=[];						
							firm_control.items = this.lstFirm;
						}
					return
				}
				let clinic = this.lstFirm.find(clinic => clinic.id === id);
				 
				// this.lstClinic=this.lstFirm.filter(clinic => clinic.id === id);
				attorntControl.items=clinic;
				if (clinic)
				{
					if(!refferingPhysicanForm.value.referrer_id)
					{
						// refferingPhysicanForm.patchValue({referrer_id:null, physician: clinic, contact_person: clinic.contact_person ? clinic.contact_person : {} }, { emitEvent: false })
						refferingPhysicanForm.patchValue({
							id:clinic.id,
							first_name:clinic.first_name,
							middle_name:clinic.middle_name,
							last_name:clinic.last_name


						});
					
						this.lstFirm=[]
						let firm_control = getFieldControlByName(this.fieldConfig, 'referrer_id');
						firm_control.items = this.lstFirm
					}
				else
refferingPhysicanForm.patchValue({
							id:clinic.id,
							first_name:clinic.first_name,
							middle_name:clinic.middle_name,
							last_name:clinic.last_name


						});
					
						this.lstFirm=[]
						let firm_control = getFieldControlByName(this.fieldConfig, 'referrer_id');
						firm_control.items = this.lstFirm
				}}
				}))
	}
	 isNewRefferingPhyscianIDString() {
		
		
		let referingPhysicanform = this.form.controls['reffering_physician'] as FormGroup
		let physicianform = referingPhysicanform.controls['physician'] as FormGroup
		 
		let type = typeof physicianform.controls['referrer_id'].value;
		if(type == 'string') {
			return true;
		} 
		return false;
	}

	isNewClinicIDString() {

		let refferingPhysican = this.form.controls['reffering_physician'] as FormGroup
		let clinicform =refferingPhysican.controls['clinic'] as FormGroup
		 
		let type = typeof clinicform.controls['clinic_id'].value;
		if(type == 'string') {
			return true;
		} 
		return false;
	}


	onFocusSearchClinicName(name) {
		return new Observable((res) => {
			let refferingPhysicanForm= this.form.value.reffering_physician;
			let referrer_id=refferingPhysicanForm.physician?refferingPhysicanForm.physician.referrer_id:null;
			if(!this.lstClinic.length && !this.isNewRefferingPhyscianIDString())
			{
				this.getClinicName(name, referrer_id).subscribe(data => {
					this.lstClinic = [...data['result']['data']];
					res.next(this.lstClinic);
				})
			}
			else
			{
				const id = typeof(referrer_id) === 'number' ? referrer_id: null;
				this.getClinicName(name,id).subscribe(data => {
					this.lstClinic = data['result']['data']
					res.next(this.lstClinic);
				})
			}
		})
	}
	 onFocusSearchReferingPhysician(name) {
		return new Observable((res) => {
			if(!this.lstFirm.length && !this.isNewRefferingPhyscianIDString())
			{
				let clinicId=this.form.value.reffering_physician && this.form.value.reffering_physician.clinic?this.form.value.reffering_physician.clinic.clinic_id:null
				this.getRefferingPhyscian(name, '',clinicId).subscribe(data => {
					this.lstFirm = data['result']['data']
					res.next(this.lstFirm);
				})
			}
		})
	}

	 getRefferingPhyscian(name?, refferId?,clinicId?) {

		let order_by;
		let order;
		if(name)
		{
			// order_by='insurance_name';
			order=OrderEnum.DEC	
		}
		else
		{
			order_by='count';
			order=OrderEnum.DEC	
		}

		let paramQuery: any = { filter: true, order: OrderEnum.DEC, pagination: false,order_by:order_by,'clinic_ids[]':clinicId,dropDownFilter:true }
		paramQuery = removeEmptyKeysFromObject(paramQuery);
		let filter = {}
		refferId ? filter['id'] = refferId : null
		name ? filter['name'] = name : null;
		// order_by ? filter['order_by'] = order_by : null
		return this.requestService.sendRequest(ReferringPhysicianUrlsEnum.PHYSICIAN_LISTING, 'get', REQUEST_SERVERS.fd_api_url, { ...paramQuery, ...filter })
	}
	lstFirm: any[] = [];
	lstClinic:any[] = [];
	getClinicName(name?, refferId?) {

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

		let paramQuery: any = { filter: true, order: OrderEnum.DEC, pagination: false,order_by:order_by,'referrer_id':refferId,dropDownFilter:true}
		paramQuery = removeEmptyKeysFromObject(paramQuery);
		let filter = {}
		name ? filter['name'] = name : null
		// order_by ? filter['order_by'] = order_by : null
		return this.requestService.sendRequest(ReferringPhysicianUrlsEnum.GET_CLINICS_REFERRING_PHYSICIAN, 'get', REQUEST_SERVERS.fd_api_url, { ...paramQuery, ...filter })
	}
	searchClinicName(name) {
		
		return new Observable((res) => {
			let clinicId=this.form.value.reffering_physician?this.form.value.reffering_physician.clinic_id:null;
			let referrer_id=this.form.value?.reffering_physician?.physician?.id || null;
			const id = typeof(clinicId) === 'number' ? clinicId: null;
			this.getClinicName(name,referrer_id).subscribe(data => {
				this.lstClinic = data['result']['data'];
				let lst =data['result']['data']  ;
				lst = lst.map(refferr => {
					return { ...refferr, full_name: `${refferr.first_name} ${refferr.middle_name ? refferr.middle_name : ''} ${refferr.last_name}` }
				})
		
				res.next(lst);
			})
		})

	}

	 searchReferingPhyscian(name) {
		return new Observable((res) => {
			let refferId=this.form.value.reffering_physician?this.form.value.reffering_physician.referrer_id:null;
			const id = typeof(refferId) === 'number' ? refferId: null;
			this.getRefferingPhyscian(name, '',id).subscribe(data => {
				this.lstFirm = data['result']['data'];
				let lst =data['result']['data']  ;
				lst = lst.map(refferr => {
					return { ...refferr, full_name: `${refferr.first_name} ${refferr.middle_name ? refferr.middle_name : ''} ${refferr.last_name}` }
				})	

				res.next(lst);
			})
		})

	}
	handleAddressChange_primary($event) {
		this.handleAddressChange($event, true)
	}
	/**
	 * on form changes configrations
	 * @param event 
	 */
	onReady(event) {
		if (this.aclService.hasPermission('patient-case-list-referrals-physical-information-view')) {
			this.form = event;
			this.addSkipInDrugCase()
			this.reffering_physician = this.form.get('reffering_physician') as FormGroup
			this.primary_physician = this.form.get('primary_physician') as FormGroup
			this.contactPersonAddresses = this.reffering_physician.controls['clinic_location'] as FormGroup;
			this.contactPersonAddresses_primary = this.primary_physician.controls['mail_address'] as FormGroup;
			debugger;
			this.hideReferredFields();
			this.hidePrimaryFields();
			if (this.referring && this.reffering_physician && this.primary_physician) {
				this.setValues()
			}
		}
		// this.hideReferredFields();
		// this.hidePrimaryFields();
	}
	subscription: Subscription[] = [];
	/**
	 * discart confirmation
	 * @param obj 
	 */

	 disableFields(disable,disableControlNames:any[],ControlFormGroup?,controlName?)
	 {
		 
		 if(disable)
		 {
			 if(ControlFormGroup)
			 {
				 let formgroup= this.form.controls[ControlFormGroup] as FormGroup;
				 let formGroupClinicLocation = formgroup.controls['clinic_location'] as FormGroup;
				 disableControlNames.forEach(name => {
					if (formGroupClinicLocation && formGroupClinicLocation.get(name)){
						formGroupClinicLocation.get(name).disable();
					}	  
				 })
			 }
			 else
			 {
				 disableControlNames.forEach(name => {
					if ( this.form && this.form.get(name)){
					 this.form.get(name).disable();
					}
					})
			 }	
		 }
		 else
		 {
			 if(ControlFormGroup)
			 {
				 let formgroup= (this.form.controls['reffering_physician'])as FormGroup;
				 let formGroupClinicLocation = formgroup.controls['clinic_location'] as FormGroup;

				 disableControlNames.forEach(name => {
					if ( formGroupClinicLocation && formGroupClinicLocation.get(name)){
						formGroupClinicLocation.get(name).enable() ;
					}
					  
					})
					
			 }
			 else
			 {
				 disableControlNames.forEach(name => { 
					if (this.form && this.form.get(name)){
					this.form.get(name).disable()
					}
				 })
			 }		
			}
		 
	 }
	 bindLocationChange() {
		console.log(this.form,'Form Information');
		 
		let refererForm= this.form.controls['reffering_physician'] as FormGroup;
		let referingForm = refererForm.controls['clinic'] as FormGroup;
		let locationForm = refererForm.controls['clinic_location'] as FormGroup
		console.log('Location Form',locationForm);
		 
		// locationForm.valueChanges.subscribe(val=>{
		// 	 
		// })
		this.subscription.push(
			locationForm.controls['clinic_location_id'].valueChanges.subscribe(id => {
				  
				locationForm;
				
				if(referingForm.value && referingForm.value.clinic_id){
					locationForm.controls['clinic_location_id'].setValidators([Validators.required]);
					locationForm.controls['clinic_location_id'].updateValueAndValidity({ emitEvent: false });
					// this.fieldConfig[0].children[2].label = ' Location*';
					// this.fieldConfig[0].children[2].validations = [
					// 	{ name: 'required', message: 'This field is required', validator: Validators.required },
					// ];


				}else{
					locationForm.controls['clinic_location_id'].clearValidators();
					locationForm.controls['clinic_location_id'].updateValueAndValidity({ emitEvent: false });
					// this.fieldConfig[0].children[2].label = ' Location';
					// this.fieldConfig[0].children[2].validations = [];
				}
				if (!id) {
					let location_form = refererForm.controls['clinic_location']
					location_form.reset({}, { emitEvent: false });
					referingForm.controls['clinic_id'].clearValidators();
					referingForm.controls['clinic_id'].updateValueAndValidity({ emitEvent: false });
					this.fieldConfig[0].children[1].label = "Clinic Name";
					this.fieldConfig[0].children[1].validations = [];
					return;
				}
				let clinics = this.lstClinic.find(firm => firm.id === referingForm.get('clinic_id').value)
				if (clinics && clinics.locations && clinics.locations.find) {
					let location = clinics.locations.find(location => location.id === id)
					console.log('selectedLocation ',location);
					if (location){
						 
						 this.disableFields(true,['email','floor', 'street_address','state','city','zip','phone','extension'],'reffering_physician');
						refererForm.patchValue({ clinic_location: location }, { emitEvent: false });
					}else{
						  this.disableFields(false,['email','floor', 'street_address','state','city','zip','phone','extension'],'clinic_location');
						let location_form = refererForm.controls['clinic_location'] as FormGroup;
						location_form.reset({}, { emitEvent: false });
						let clinic_location_control = getFieldControlByName(this.fieldConfig, 'clinic_location_id');
						clinic_location_control.items = [];
						 locationForm.patchValue({
						 clinic_location_id:id,
						street_address:id
						
					},{emitEvent:false});
						
					}
					referingForm.controls['clinic_id'].setValidators([Validators.required]);
					referingForm.controls['clinic_id'].updateValueAndValidity({ emitEvent: false });
						this.fieldConfig[0].children[1].label = "Clinic Name";
						this.fieldConfig[0].children[1].validations = [
							{ name: 'required', message: 'This field is required', validator: Validators.required },
					];
				}else{
					referingForm.controls['clinic_id'].setValidators([Validators.required]);
					referingForm.controls['clinic_id'].updateValueAndValidity({ emitEvent: false });
					this.fieldConfig[0].children[1].label = "Firm's Name*";
					this.fieldConfig[0].children[1].validations = [
						{ name: 'required', message: 'This field is required', validator: Validators.required },
					];
					this.disableFields(false,['email','floor', 'street_address','state','city','zip','phone','extension'],'clinic_location');
				
					let location_form = refererForm.controls['clinic_location'];
				
					let clinic_location_control = getFieldControlByName(this.fieldConfig, 'clinic_location_id');
					clinic_location_control.items = [];
					  location_form.reset({}, { emitEvent: false });
					 locationForm.patchValue({
						clinic_location_id:id,
						street_address:id

					},{emitEvent:false});
				}

			}))
	}
	
	confirmDel(obj, skipOrno) {
		let referringForm = this.form.controls['reffering_physician'] as FormGroup;
		this.customDiallogService.confirm('Discard Confirmation?', 'Do you really want to discard it.','Yes','No')
		.then((confirmed) => {

			if (confirmed == true) {
        if (obj == 'primary_care_physician_dialog') {
          this.deletebtn = false;
          this.form;
          this.primary_physician.reset({}, { emitEvent: false });
          this.contactPersonAddresses_primary.reset({}, { emitEvent: false });

          this.primary_physician.patchValue(
            {
              primary_care_physician_dialog: skipOrno,
              case_id: this.caseId,
              id:
                this.referring &&
                this.referring.primary_physician &&
                this.referring.primary_physician.id
                  ? this.referring.primary_physician.id
                  : null,
              is_deleted: true,
            },
            { emitEvent: false }
          );
          // this.form.patchValue({ primary_care_physician_dialog: false }, { emitEvent: false })
        }
        if (obj == 'reffer_by_physician_dialog') {
          this.deleteButton = false;

          let referingPhysican = referringForm.controls[
            'physician'
          ] as FormGroup;
          let referingClinc = referringForm.controls['clinic'] as FormGroup;

          // referingClinc.controls['clinic_id'].clearValidators();
          // referingClinc.controls['clinic_id'].updateValueAndValidity({ emitEvent: false });

          // this.primary_physician.controls['cell_phone'].clearValidators();
          // this.primary_physician.controls['cell_phone'].updateValueAndValidity({ emitEvent: false })
          // this.primary_physician.controls['first_name'].clearValidators();
          // this.primary_physician.controls['first_name'].updateValueAndValidity({ emitEvent: false });
          // this.primary_physician.controls['last_name'].clearValidators();
          // this.primary_physician.controls['last_name'].updateValueAndValidity({ emitEvent: false });
          // this.reffering_physician.reset({}, { emitEvent: false })
          // this.contactPersonAddresses.reset({}, { emitEvent: false })

          referringForm.reset({}, { emitEvent: false });

          referringForm.patchValue(
            {
              reffer_by_physician_dialog: skipOrno,
              case_id: this.caseId,
              is_deleted: true,
            },
            { emitEvent: true }
          );
          // referingPhysican.patchValue({
          //  	  id: null,
          // 	  first_name: '',
          // 	  last_name:'',
          // 	  referrer_id:null,
          // 	  middle_name:null

          // 	}, { emitEvent: false });
          // referingClinc.patchValue({
          // 	clinic_id:null,
          // 	name:''

          //   }, { emitEvent: false })
          //   this.reffering_physician = referringForm;
          //this.contactPersonAddresses=locationForm;

          // this.form.patchValue({ reffer_by_physician_dialog: false }, { emitEvent: false })
        }
      } else if(confirmed == false) {
		let field1 = getFieldControlByName(this.fieldConfig, 'reffering_physician_div')
		let field2 = getFieldControlByName(this.fieldConfig, 'primary_physician_div')
		obj == 'reffer_by_physician_dialog' ? referringForm.patchValue({ reffer_by_physician_dialog: 'yes' }, { emitEvent: false }) : ''
		obj == 'reffer_by_physician_dialog' ? field1.classes = field1.classes.filter(className => className != 'hidden') : ''
		obj == 'reffer_by_physician_dialog' ? this.deletebtn = true : ''
		obj == 'reffer_by_physician_dialog' ? referringForm.patchValue({ case_id: this.caseId, is_deleted: false, id: this.referring && this.referring.reffering_physician && this.referring.reffering_physician.id ? this.referring.reffering_physician.id : null }, { emitEvent: false }) : ''
		obj == 'primary_care_physician_dialog' ? this.primary_physician.patchValue({ primary_care_physician_dialog: 'yes' }, { emitEvent: false }) : ''
		obj == 'primary_care_physician_dialog' ? field2.classes = field2.classes.filter(className => className != 'hidden') : ''
		obj == 'primary_care_physician_dialog' ? this.deletebtn = true : ''
		obj == 'primary_care_physician_dialog' ? this.primary_physician.patchValue({
			case_id: this.caseId,
			id: this.referring && this.referring.primary_physician && this.referring.primary_physician.id ? this.referring.primary_physician.id : null,
			is_deleted: false
		}, { emitEvent: false }) : ''
      }
		})
		.catch();
	}
}
