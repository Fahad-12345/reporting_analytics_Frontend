import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
import { FDServices } from '../../../../../fd_shared/services/fd-services.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { RadioButtonClass } from '@appDir/shared/dynamic-form/models/RadioButtonClass.class';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { AddressClass } from '@appDir/shared/dynamic-form/models/AddressClass.class';
import { ButtonClass } from '@appDir/shared/dynamic-form/models/ButtonClass.class';
import { ButtonTypes } from '@appDir/shared/dynamic-form/constants/ButtonTypes.enum';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { CaseModel, VehicleBelongsToEnum, DialogEnum } from '../../../../../fd_shared/models/Case.model';
import { RequestService } from '@appDir/shared/services/request.service';
import { CaseFlowUrlsEnum } from '../../../../../fd_shared/models/CaseFlowUrlsEnum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { DynamicControl } from '@appDir/shared/dynamic-form/models/DynamicControl.class';
import { getFieldControlByName } from '@appDir/shared/dynamic-form/helper';
import { CaseFlowServiceService } from '../../../../../fd_shared/services/case-flow-service.service';
import { CaseTypeEnum, CaseTypeIdEnum, PurposeVisitSlugEnum } from '../../../../../fd_shared/models/CaseTypeEnums';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Location } from '@angular/common';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';

@Component({
	selector: 'app-object-involved-form',
	templateUrl: './object-involved-form.component.html',
})
export class ObjectInvolvedFormComponent extends PermissionComponent implements  OnChanges, OnDestroy {

	public objectForm: FormGroup
	@Input() title = 'Edit'
	@Input() caseId: any;
	@Input() caseData: CaseModel;
	@Output() getCase = new EventEmitter()
	@Output() onSaved = new EventEmitter()
	@ViewChild(DynamicFormComponent) component: DynamicFormComponent;
	private patientId: any;
	private accidentDetails: any;
	disableBtn = false
	formEnabled: boolean = false;
	enableflag: boolean = true;
	showTitle:boolean=true;
	constructor(aclService: AclService,private fb: FormBuilder, private logger: Logger, private fd_services: FDServices,  router: Router, private toastrService: ToastrService, private route: ActivatedRoute,  requestService: RequestService, private caseFlowService: CaseFlowServiceService, private location: Location) {
		super(aclService)
		this.setForm()
	}

	ngOnDestroy() {
		unSubAllPrevious(this.subscription)
	}
	subscription: any[] = []
	fieldConfig = [
		new DivClass([
			new RadioButtonClass('Was an object involved in the injury/illness? *', 'object_involved', [
				{ name: 'yes', value: 1, label: 'Yes' },
				{ name: 'no', label: 'No', value: 0 }
			], '', [
				{ name: 'required', message: "This field is required", validator: Validators.required }
			], ['col-lg-8']),
			new InputClass('If Yes, what? *', 'object_involved_description', InputTypes.text, '', [
				{ name: 'required', message: "This field is required", validator: Validators.required }
			], '', ['col-lg-4', 'hidden'])
		], ['row']),
		new DivClass([
			new RadioButtonClass('Was the injury the result of the use or operation of a licensed motor vehicle? *', 'vehicle_involved', [
				{ name: 'yes', value: DialogEnum.yes, label: 'Yes' },
				{ name: 'no', value: DialogEnum.no, label: 'No' }
			], '', [
				{ name: 'required', message: "This field is required", validator: Validators.required }
			], ['col-xl-8'])
		], ['row']),
		new DivClass([
			new DivClass([
				new RadioButtonClass('At the time of accident I was? *', 'patient_at_time_of_accident', [
					{ name: 'driver', label: 'driver', value: 'driver' },
					{ name: 'passenger', value: 'passenger', label: 'passenger' },
					{ name: 'padestrian', label: 'Pedastrian', value: 'pedestrian' },
					{ name: 'bicyclist', value: 'bicyclist', label: 'bicyclist' },
					{ name: 'other', label: 'Other', value: 'other' }
				], '', [
					{ name: 'required', validator: Validators.required, message: 'This field is required' }
				], ['col-xl-8 d-inline-block ps-0', 'radio-space-evenly']),
				new InputClass('If Other, What?', 'at_time_of_accident_other_description', InputTypes.text, '', [], '', ['col-lg-4 p-0', 'hidden']),
				new DivClass([
					new RadioButtonClass('Taxi Or Limo? *', 'driver_type', [
						{ name: 'limoDriver', value: 'limo', label: 'Limo Driver' },
						{ name: 'taxiDriver', label: 'Taxi Driver', value: 'taxi' },
						{ name: 'none', label: 'None', value: 'none' }
					], '', [], ['col-lg-8 ps-0', 'radio-space-evenly', 'hidden']),

				], ['display-contents',], '', '', { name: 'driver-div' }),
			], ['display-contents m-0', 'hidden'], '', '', { name: 'time_of_accident_div' }),

			new DivClass([
				new RadioButtonClass('Whose vehicle was this?', 'was_this', [
					{ name: 'patient', label: 'Patient', value: 'patient' },
					{ name: 'employer', label: 'Employer', value: 'employer' },
					{ name: 'other', label: 'Other', value: 'other' }
				], '', [
					// { name: 'required', message: 'This field is required', validator: Validators.required }
				], ['col-lg-8', 'radio-space-evenly']),
				new InputClass('If Other, what?', 'was_this_description', InputTypes.text, '', [], '', ['col-lg-4', 'hidden'])
			], ['row', 'hidden'], '', '', { name: 'belongs-to-div' }),
		], ['display-contents'], '', '', { name: 'accident-div' }),

		new DynamicControl('id', null),
		// new DivClass([
		//   new ButtonClass('Back', ['btn', 'btn-primary', 'btn-block', 'mt-0 mb-3'], ButtonTypes.button, this.goBack.bind(this), { icon: 'icon-left-arrow me-2' }),
		//   new ButtonClass('Save & Continue', ['btn', 'btn-success', 'btn-block', 'mt-0 mb-3'], ButtonTypes.submit, null, { icon: 'icon-save-continue me-2' })
		// ], ['row', 'form-btn', 'justify-content-center'])
	];

	onReady(form) {
		this.objectForm = form;

		this.bindObjectInvolved()
		this.bindLicenseMotorVehicle()
		this.bindAtTheTimeOfAccident()

		this.bindVehicleBelongsTo()
		this.setValues();
		this.checkPurposeOfVisitSpeciality()
		if(!this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_accident_edit))
		{
			
			this.objectForm.disable();

		}
	}
	ngAfterViewInit() {

	}

	checkPurposeOfVisitSpeciality() {

		if (this.objectForm &&this.caseFlowService.case && (this.caseFlowService.case.case_type.slug === CaseTypeEnum.worker_compensation || 
			this.caseFlowService.case.case_type.slug === CaseTypeEnum.worker_compensation_employer 
			|| this.caseFlowService.case.case_type.slug === CaseTypeEnum.auto_insurance)
			&& this.caseFlowService.case.purpose_of_visit.slug === PurposeVisitSlugEnum.Speciality)
			{
				this.showTitle=false;
				this.hideObjectInvolved();
				this.hideObjectInvolvedDescription();
				this.hideVehicleInvolved();
				this.hideVehicleInvolved();
				this.hidePatientAtTimeOfAccident();

			}
	}

	hideObjectInvolved()
	{
		let elemObjectInvolved = getFieldControlByName(this.fieldConfig, 'object_involved');
		elemObjectInvolved.classes = elemObjectInvolved.classes.filter(className => {
				return className != "hidden"
			})
			elemObjectInvolved.classes.push('hidden');
			this.objectForm.patchValue({
				object_involved: null,
				
			});
	}

	hideObjectInvolvedDescription()
	{
		let elemObjectInvolvedDescription = getFieldControlByName(this.fieldConfig, 'object_involved_description');
		elemObjectInvolvedDescription.classes = elemObjectInvolvedDescription.classes.filter(className => {
				return className != "hidden"
			})
			elemObjectInvolvedDescription.classes.push('hidden');
			this.objectForm.patchValue({
				object_involved_description: null,
				
			});
	}

	hideVehicleInvolved()
	{
		let elemVehicleInvolved = getFieldControlByName(this.fieldConfig, 'vehicle_involved');
		elemVehicleInvolved.classes = elemVehicleInvolved.classes.filter(className => {
				return className != "hidden"
			})
			elemVehicleInvolved.classes.push('hidden');
			this.objectForm.patchValue({
				vehicle_involved: null,
				
			});
	}

	hidePatientAtTimeOfAccident()
	{
		let elemPatientAtTimeOfAccident = getFieldControlByName(this.fieldConfig, 'patient_at_time_of_accident');
		elemPatientAtTimeOfAccident.classes = elemPatientAtTimeOfAccident.classes.filter(className => {
				return className != "hidden"
			})
			elemPatientAtTimeOfAccident.classes.push('hidden');
			this.objectForm.patchValue({
				patient_at_time_of_accident: null,
				at_time_of_accident_other_description:null,
				driver_type:null,
				was_this_description : null,
				was_this:null
			});

			let elemWhoseVehicleWasThis = getFieldControlByName(this.fieldConfig, 'was_this');
			elemWhoseVehicleWasThis.classes = elemWhoseVehicleWasThis.classes.filter(className => {
				return className != "hidden"
			})
			elemWhoseVehicleWasThis.classes.push('hidden');
	}


	setWorkerCompensationForm() {
		if (( this.caseFlowService.case&& this.caseFlowService.case.case_type&&(this.caseFlowService.case.case_type.slug === CaseTypeEnum.worker_compensation || this.caseFlowService.case.case_type.slug === CaseTypeEnum.worker_compensation_employer) )) {
			let control = getFieldControlByName(this.fieldConfig, 'belongs-to-div');
			control.classes.push('hidden')

		}
	}

	setAutoInsuranceForm() {


		if (this.caseData&& this.caseData.case_type&&(( this.caseData&& this.caseData.case_type&&this.caseData.case_type.slug === CaseTypeEnum.auto_insurance) || ( this.caseData&& this.caseData.case_type&&this.caseData.case_type.slug === CaseTypeEnum.auto_insurance_worker_compensation))) {
			let object_involved = getFieldControlByName(this.fieldConfig, 'object_involved');
			object_involved.label = (object_involved.label as string).replace('*', '')
			this.objectForm.get('object_involved').clearValidators()
		}
		// let control = getFieldControlByName(this.fieldConfig, 'time_of_accident_div');
		// // let control2 = getFieldControlByName(this.fieldConfig, 'was_this_description')
		// if (this.caseData && this.caseData.case_type_id === CaseTypeIdEnum.auto_insurance) {
		//   control.classes.push('hidden')
		//   // control2.classes.push('hidden')
		// } else {
		//   control.classes = control.classes.filter(className => className != 'hidden')
		// }
	}
	bindVehicleBelongsTo() {
		this.subscription.push(this.objectForm.controls['was_this'].valueChanges.subscribe(value => {
			let control = getFieldControlByName(this.fieldConfig, 'was_this_description')
			if (value === 'other') {
				control.classes = control.classes.filter(className => className != 'hidden')
			}
			else {
				control.classes.push('hidden')
			}
		}))
	}
	setLienForm() {
		// let control = getFieldControlByName(this.fieldConfig, 'belongs-to-div');

		// if (this.caseFlowService.case && this.caseFlowService.case.case_type_id !== CaseTypeIdEnum.worker_compensation) {
		//   control.classes.push('hidden')
		// } else {
		//   control.classes = control.classes.filter(className => className != 'hidden')
		// }
	}
	bindAtTheTimeOfAccident() {
		let control = this.objectForm.controls['patient_at_time_of_accident'];
		let driver_type = getFieldControlByName(this.fieldConfig, 'driver_type')
		let other_control = getFieldControlByName(this.fieldConfig, 'at_time_of_accident_other_description')
		this.subscription.push(control.valueChanges.subscribe(value => {
			if (value == 'driver') {
				other_control.classes.push('hidden')
				driver_type.classes = driver_type.classes.filter(className => className != 'hidden')
			} else if (value == 'other') {
				other_control.classes = other_control.classes.filter(className => className != 'hidden')
				driver_type.classes.push('hidden')
			} else {
				other_control.classes.push('hidden')
				driver_type.classes.push('hidden')
			}
		}))
	}
	bindObjectInvolved() {
		this.subscription.push(this.objectForm.controls['object_involved'].valueChanges.subscribe(value => {
			let elem = this.fieldConfig[0].children[1]
			if (value == 1) {
				elem.classes = elem.classes.filter(className => className != 'hidden')
			} else {
				elem.classes.push('hidden')
			}
		}))
	}
	bindLicenseMotorVehicle() {


		if (this.caseData&&this.caseData.case_type&&(( this.caseData&& this.caseData.case_type&&this.caseData.case_type.slug === CaseTypeEnum.auto_insurance) || (this.caseData&& this.caseData.case_type&& this.caseData.case_type.slug === CaseTypeEnum.auto_insurance_worker_compensation ) )) {
			let control = getFieldControlByName(this.fieldConfig, 'vehicle_involved')
			control.classes.push('hidden');
			let was_this_control = getFieldControlByName(this.fieldConfig, 'belongs-to-div')
			was_this_control.classes = was_this_control.classes.filter(className => className != 'hidden')
		} else {

			this.subscription.push(this.objectForm.controls['vehicle_involved'].valueChanges.subscribe(value => {
				let elem = getFieldControlByName(this.fieldConfig, 'belongs-to-div')
				let driver_was_control = getFieldControlByName(this.fieldConfig, 'time_of_accident_div')
				if (value == DialogEnum.yes) {
					if (this.caseData.case_type&&(this.caseData.case_type.slug === CaseTypeEnum.worker_compensation || this.caseData.case_type.slug === CaseTypeEnum.worker_compensation_employer) )
						driver_was_control.classes = driver_was_control.classes.filter(className => className != 'hidden')

					elem.classes = elem.classes.filter(className => className != 'hidden')
				} else {
					driver_was_control.classes.push('hidden')
					elem.classes.push('hidden')
				}
			}))
		}


	}
	ngOnInit() {

	}

	showForm: boolean = false
	ngOnChanges(changes: SimpleChanges) {
		if (this.caseData && this.objectForm) {

			this.showForm = true
			// this.bindLicenseMotorVehicle()
			// this.setValues()
			this.setLienForm()

			this.setWorkerCompensationForm();
			this.checkPurposeOfVisitSpeciality();
		}

	}

	setValues() {
		if (this.caseData && this.caseData.accident && this.caseData.accident.object_involved) {
			this.objectForm.patchValue({ ...this.caseData.accident.object_involved, patient_at_time_of_accident: this.caseData.accident.accident_information?this.caseData.accident.accident_information.patient_at_time_of_accident:null, driver_type: this.caseData.accident.accident_information?this.caseData.accident.accident_information.driver_type:null, at_time_of_accident_other_description: this.caseData.accident.accident_information?this.caseData.accident.accident_information.at_time_of_accident_other_description:null })
			this.setAutoInsuranceForm()
		}

	}


	setForm() {
		this.objectForm = this.fb.group({
			id: null,
			objectInvolved: ['', [Validators.required]],
			objectInvoldedDescription: '',
			licenseMotorVehicle: ['', [Validators.required]],
			whoseVehicle: '',
			licenseNo: ['', [Validators.maxLength(7)]],
			vehicleInsuranceName: ['', [Validators.maxLength(20)]],
			vehicleInsuranceAddress: '',
			vehicleInsuranceCity: [''],
			vehicleInsuranceState: [''],
			vehicleInsuranceZip: [''],
			lat: '',
			lng: '',
			vehicleInsuranceApartment: ['', [Validators.maxLength(20)]],
			accidentId: [''],
			caseId: this.caseId,
			patientId: this.patientId,
		});

	}

	onSubmit(form) {
		// let data = { object_involved: form }
		// if (this.caseData.case_type_id === CaseTypeIdEnum.worker_compensation) {
		//   this.caseData.accident.accident_information = { ...this.caseData.accident.accident_information, patient_at_time_of_accident: form.patient_at_time_of_accident, driver_type: form.driver_type, at_time_of_accident_other_description: form.at_time_of_accident_other_description }
		//   data['accident_information'] = this.caseData.accident.accident_information;

		// }
		// this.caseFlowService.updateCase(this.caseId, data).subscribe(data => {
		//   this.toastrService.success('Object Involved Successfully Updated', 'Success');
		//   this.onSaved.emit({ component: 'object_involved_status', status: true })
		// }, err => this.toastrService.error(err.message, 'Error'))

	}



	public handleAddressChange(address: Address) {

		let street_number = this.fd_services.getComponentByType(address, "street_number");
		let route = this.fd_services.getComponentByType(address, "route");
		let city = this.fd_services.getComponentByType(address, "locality");
		let state = this.fd_services.getComponentByType(address, "administrative_area_level_1");
		let postal_code = this.fd_services.getComponentByType(address, "postal_code");
		let lat = address.geometry.location.lat();
		let lng = address.geometry.location.lng();

		if (street_number != null) {
			let address: any;
			address = street_number.long_name + ' ' + route.long_name

			this.objectForm.patchValue({
				'vehicleInsuranceAddress': address,
				'vehicleInsuranceCity': city.long_name,
				'vehicleInsuranceState': state.long_name,
				'vehicleInsuranceZip': postal_code.long_name,
				'lat': lat,
				'lng': lng,
			})
		} else {
			this.objectForm.patchValue({
				'vehicleInsuranceAddress': "",
				'vehicleInsuranceCity': "",
				'vehicleInsuranceState': "",
				'vehicleInsuranceZip': "",
				'lat': "",
				'lng': "",
			})
		}
	}


	toggleValidations(value, fields) {
		// ;
		this.logger.log(fields);
		for (var i = 0; i < fields.length; i++) {
			if (value) {
				this.objectForm.controls[fields[i]].setValidators([Validators.required]);
			} else {
				this.objectForm.controls[fields[i]].clearValidators();
				this.objectForm.patchValue({
					[fields[i]]: ''
				})
				this.objectForm.controls[fields[i]].updateValueAndValidity({ onlySelf: true, emitEvent: false });
				this.objectForm.updateValueAndValidity()

			}
		}
	}

	goBack() {
		this.location.back()
	}


}
