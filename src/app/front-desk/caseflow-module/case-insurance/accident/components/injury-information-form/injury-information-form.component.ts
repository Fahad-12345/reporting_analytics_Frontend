import { Component, OnInit, Input, OnChanges, SimpleChanges, EventEmitter, Output, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
import { FDServices } from '../../../../../fd_shared/services/fd-services.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { dateFormatterMDY, dateObjectPicker, changeDateFormat, unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { RequestService } from '@appDir/shared/services/request.service';
import { relationshipUrlsEnum } from '@appDir/front-desk/relationship-Urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Subscription } from 'rxjs';
import { InjryInformationUrlsEnum } from './Injury-Information-Urls-Enum';
import { CanDeactivateComponentInterface } from '@appDir/shared/canDeactivateFormsComponent/CanDeactivateComponent.interface';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { RadioButtonClass } from '@appDir/shared/dynamic-form/models/RadioButtonClass.class';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { AddressComponent } from '@appDir/shared/dynamic-form/components/address/address.component';
import { AddressClass } from '@appDir/shared/dynamic-form/models/AddressClass.class';
import { ButtonClass } from '@appDir/shared/dynamic-form/models/ButtonClass.class';
import { ButtonTypes } from '@appDir/shared/dynamic-form/constants/ButtonTypes.enum';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { getFieldControlByName } from '@appDir/shared/dynamic-form/helper';
import { CaseModel } from '../../../../../fd_shared/models/Case.model';
import { CaseFlowUrlsEnum } from '../../../../../fd_shared/models/CaseFlowUrlsEnum';
import { DynamicControl } from '@appDir/shared/dynamic-form/models/DynamicControl.class';
import { CaseFlowServiceService } from '../../../../../fd_shared/services/case-flow-service.service';
import { CaseTypeEnum, CaseTypeIdEnum, PurposeVisitSlugEnum } from '../../../../../fd_shared/models/CaseTypeEnums';
import { Location } from '@angular/common';
import { AclService } from '@appDir/shared/services/acl.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { debug } from 'console';
import { ZipFormatMessages } from '@appDir/shared/dynamic-form/constants/ZipFormatMessages.enum';
import { WithoutTime } from '@appDir/shared/utils/utils.helpers';

@Component({
	selector: 'app-injury-information-form',
	templateUrl: './injury-information-form.component.html',
})
export class InjuryInformationFormComponent extends PermissionComponent implements OnChanges, OnDestroy, CanDeactivateComponentInterface {

	subscription: Subscription[] = [];
	public form: FormGroup
	@Input() title = 'Edit'
	public insuranceType: string = 'major medical'
	@Input() caseId: any;
	@Input() caseData: CaseModel;
	// @Input() injury: any;
	@Input() patientId: any;
	@Output() getCase = new EventEmitter();
	@Output() onSaved = new EventEmitter();
	@ViewChild(DynamicFormComponent) component: DynamicFormComponent
	public contactPersonTypesId: number = 3
	public relations: any[];
	// public caseData:any;
	disableBtn = false
	formEnabled: boolean = false;
	enableflag: boolean = true;
	DOA = {
		req_DOA : new InputClass('DOA * (mm/dd/yyyy)', 'accident_date', InputTypes.date, '', [
			{ name: 'required', message: 'This field is required', validator: Validators.required }
		], '', ['col-sm-6 col-xl-2'], { max: new Date() }),
		opt_DOA : new InputClass('DOA * (mm/dd/yyyy)', 'accident_date', InputTypes.date, '',[], '', ['col-sm-6 col-xl-2']),
		get ReqDOA() {
			return this.req_DOA;
		},
	
		get OptDOA() {
			return this.opt_DOA;
		}
	}


	constructor(aclService: AclService,private fb: FormBuilder, private logger: Logger, private fd_services: FDServices, private toastrService: ToastrService,  router: Router, private route: ActivatedRoute,
		protected requestService: RequestService, private caseFlowService: CaseFlowServiceService, private location: Location) {
			super(aclService)
			this.setForm()
		this.getRelations()
	}

	setFormByCaseId() {
		if (this.caseData&&this.caseData.case_type &&this.caseData.case_type.slug !== CaseTypeEnum.lien) {
			let control = getFieldControlByName(this.fieldConfig, 'accident-div')
			control.classes.push('hidden');
			let injured_control = getFieldControlByName(this.fieldConfig, 'injured_at_work_location')
			injured_control.classes.push('hidden')
			let location_reason_control = getFieldControlByName(this.fieldConfig, 'location_reason');
			location_reason_control.classes.push('hidden')

		} else {
			getFieldControlByName(this.fieldConfig, 'usual_work_location').classes.push('hidden');
			getFieldControlByName(this.fieldConfig, 'accident_location').classes.push('hidden')
			getFieldControlByName(this.fieldConfig, 'address_div').classes.push('hidden')
			getFieldControlByName(this.fieldConfig, 'activity_at_injury').classes.push('hidden')
			getFieldControlByName(this.fieldConfig, 'injury_description').classes.push('hidden')
			getFieldControlByName(this.fieldConfig, 'nature_of_accident').classes.push('hidden')
			// getFieldControlByName(this.fieldConfig, 'non-lien-div').classes.push('hidden')
			// const lein_elements = ['address_div', 'activity_at_injury', 'injury_description', 'nature_of_accident']
		}

		if (this.caseData&& this.caseData.case_type&&( this.caseData.case_type.slug === CaseTypeEnum.auto_insurance) || 
			( this.caseData&&this.caseData.case_type&&this.caseData.case_type.slug === CaseTypeEnum.auto_insurance_worker_compensation)) {
			getFieldControlByName(this.fieldConfig, 'usual_work_location').classes.push('hidden')
		}
	}

	bindUsualLocation() {
		this.subscription.push(this.form.controls['usual_work_location'].valueChanges.subscribe(value => {
			let control = getFieldControlByName(this.fieldConfig, 'location_reason')
			if (value == 0) {
				// control.classes = control.classes.filter(className => className != 'hidden')
			} else {
				control.classes.push('hidden')

			}
		}))
	}
	fieldConfig = [
		new DivClass([
			new RadioButtonClass('Was this an occupational disease?*', 'occupational_disease', [
				{ name: 'yes', label: 'Yes', value: 1 },
				{ name: 'no', label: 'No', value: 0 }
			], '', [
				{ name: 'required', validator: Validators.required, message: 'This field is required' }
			], ['col-12 col-lg-6 col-xl-4']),
			new InputClass('DOA * (mm/dd/yyyy)', 'accident_date', InputTypes.date, '', [], '', ['col-sm-6 col-xl-2']),
			new InputClass('Time Of Accident/Injury:', 'accident_time', InputTypes.time, '', [], '', ['col-sm-6 col-xl-2']),

			new RadioButtonClass('Was this your usual location?', 'usual_work_location', [
				{ name: 'yes', label: 'Yes', value: 1 },
				{ name: 'no', label: 'No', value: 0 }
			], '', [], ['col-12 col-lg-6 col-xl-4']),

			new InputClass('Why were you at this location?', 'location_reason', InputTypes.text, '', [], '', ['col-md-6 col-lg-4', 'hidden']),
			new InputClass('Where did the injury/illness happen?', 'accident_location', InputTypes.text, '', [], '', ['col-lg-6 col-xl-4']),
			new DivClass([
				new RadioButtonClass('At the time of accident I was? *', 'patient_at_time_of_accident', [
					{ name: 'driver', label: 'driver', value: 'driver' },
					{ name: 'passenger', value: 'passenger', label: 'passenger' },
					{ name: 'padestrian', label: 'Pedastrian', value: 'pedestrian' },
					{ name: 'bicyclist', value: 'bicyclist', label: 'bicyclist' },
					{ name: 'other', label: 'Other', value: 'other' }
				], '', [
					{ name: 'required', validator: Validators.required, message: 'This field is required' }
				], ['col-xl-8', 'radio-space-evenly']),
				new InputClass('If Other, What?', 'at_time_of_accident_other_description', InputTypes.text, '', [], '', ['col-lg-6 col-xl-4', 'hidden']),
				new RadioButtonClass('Taxi Or Limo? *', 'driver_type', [
					{ name: 'limoDriver', value: 'limo', label: 'Limo Driver' },
					{ name: 'taxiDriver', label: 'Taxi Driver', value: 'taxi' },
					{ name: 'none', label: 'None', value: 'none' }
				], '', [
					{ name: 'required', message: 'This field is required', validator: Validators.required }
				], ['col-12 col-lg-6', 'radio-space-evenly', 'hidden']),
			], ['display-contents'], '', '', { name: 'accident-div' }),



			// new RadioButtonClass('Is your injury covered by insurance? *', 'injuryCovered', [
			// 	{ name: 'yes', value: 'true', label: 'Yes' },
			// 	{ name: 'no', label: 'No', value: 'false' }
			// ], '', [], ['col-6']),
			// new InputClass('If Yes, Please mention company name? *', 'injuryCoveredInsuranceComp', InputTypes.text, '', [], '', ['col-12']),
			// new RadioButtonClass('Due to this accident have you recieved or eligible for payments under any of the following? *', 'eligibleForPayments',
			// 	[
			// 		{ name: 'disability', label: 'New York Disablility', value: '0' },
			// 		{ name: 'workerCompensation', label: 'Worker Compensation', value: '1' }
			// 	], '', [], ['col-12', 'radio-space-evenly']),
			// new InputClass('If Yes, Please mention your worker compensation? *', 'workerCompInsuranceCompany', InputTypes.text, '', [], '', ['col-6']),
			new RadioButtonClass('Were you injured at your workplace? *', 'injured_at_work_location', [
				{ name: 'yes', value: 1, label: 'Yes' },
				{ name: 'no', label: 'No', value: 0 }
			], 0, [
				{ name: 'required', message: 'This field is required', validator: Validators.required }
			], ['col-lg-6']),
			new DivClass([


				new DivClass([
					new DivClass([
						new AddressClass('Street Address', 'street_no', this.handleAddressChange.bind(this), '', [
							// { name: 'required', message: 'This field is required', validator: Validators.required }
						], '', ['col-sm-6 col-lg-4 col-xl-6 accident-google-places']),
						new InputClass('Suite / Floor', 'apartment', InputTypes.text, '', [], '', ['col-sm-6 col-lg-4 col-xl-6']),
						new InputClass('City', 'city', InputTypes.text, '', [], '', ['col-sm-6 col-lg-4']),
						new InputClass('State*', 'state', InputTypes.text, '', [
							{ name: 'required', message: 'This field is required', validator: Validators.required }
						], '', ['col-sm-6 col-lg-4']),
						// new InputClass('Zip', 'zip', InputTypes.text, '', [
						// 	{ name: 'maxlength', message: 'Max Length cannot be greater than 5', validator: Validators.maxLength(5) }
						// ], '', ['col-sm-6 col-lg-4'], { mask: '00000' }),
						new InputClass('Zip', 'zip', InputTypes.text, '', [
							{name:'pattern', message:ZipFormatMessages.format_usa,validator:Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')}
						], '', ['col-sm-6 col-lg-4']),
					], ['row']),
				], ['col-12'], '', '', { name: 'address_div' }),

				new InputClass('What were you doing when you were injured or became ill? (e.g, unloading a truck, typing a report) *', 'activity_at_injury', InputTypes.text, '', [
					{ name: 'required', message: 'This field is required', validator: Validators.required }
				], '', ['col-lg-12']),
				new InputClass('How did the injury/illness happen? (e.g., I tripped over a pipe and fell on the floor) *', 'accident_happend', InputTypes.text, '', [
					{ name: 'required', message: 'This field is required', validator: Validators.required }
				], '', ['col-lg-12']),
				new InputClass('Describe your injury?', 'injury_description', InputTypes.text, '', [
				], '', ['col-lg-6']),
				new InputClass('Explain fully the nature of your injury / illness(e.g., twisted left ankle and cut to forehead) *', 'nature_of_accident', InputTypes.text, '', [
					{ name: 'required', message: 'This field is required', validator: Validators.required }
				], '', ['col-lg-12'])
			], ['display-contents'], '', '', { name: 'non-lien-div' }),

		], ['row']),

		// new DivClass([
		// 	new ButtonClass('Back', ['btn', 'btn-primary', 'btn-block', 'mt-0'], ButtonTypes.button, this.goBack.bind(this), { icon: 'icon-left-arrow me-2' }),
		// 	new ButtonClass('Save & Continue', ['btn', 'btn-success', 'btn-block', 'mt-0'], ButtonTypes.submit, null, { icon: 'icon-save-continue me-2' })
		// ], ['row', 'form-btn', 'justify-content-center'], '', '', { name: 'button-div' }),
		new DynamicControl('id', '')
	]
	ngOnInit() {

	}

	ngAfterViewInit() {
		this.form = this.component.form;
		this.bindAtTheTimeOfAccident()
		this.bindUsualLocation()
		this.setValues();
		this.checkPurposeOfVisitSpeciality();
		this.setValidationOnAccidentDate();
		this.isDateOfAccidentMax();
		if(!this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_accident_edit))
		{
			this.form.disable();
		}
	}

	checkPurposeOfVisitSpeciality() {
		if (this.form &&this.caseFlowService.case && (this.caseFlowService.case.case_type.slug === CaseTypeEnum.worker_compensation || 
			this.caseFlowService.case.case_type.slug === CaseTypeEnum.worker_compensation_employer ||
			this.caseFlowService.case.case_type.slug === CaseTypeEnum.auto_insurance) 
			&& this.caseFlowService.case.purpose_of_visit.slug === PurposeVisitSlugEnum.Speciality)
			{
				this.hideAccidentTime();
				this.hideActivityAtInjury();
				this.hideUsualWorkLocation();
				this.hideInjuryHappenedLocation();
				this.hideInjuryHappenedLocationAddress();

			}
	}

	hideAccidentTime()
	{
		let elemAccidentTime = getFieldControlByName(this.fieldConfig, 'accident_time');
		elemAccidentTime.classes = elemAccidentTime.classes.filter(className => {
				return className != "hidden"
			})
			elemAccidentTime.classes.push('hidden');
			this.form.patchValue({
				accident_time: null,
				
			});
	}

	hideUsualWorkLocation()
	{
		let elemUsualWorkLocation = getFieldControlByName(this.fieldConfig, 'usual_work_location');
		elemUsualWorkLocation.classes = elemUsualWorkLocation.classes.filter(className => {
				return className != "hidden"
			})
			elemUsualWorkLocation.classes.push('hidden');
			this.form.patchValue({
				usual_work_location: null,
				location_reason:null,
				
			});
	}

	hideInjuryHappenedLocation()
	{
		let elemInjuryHappenedLocation = getFieldControlByName(this.fieldConfig, 'accident_location');
		elemInjuryHappenedLocation.classes = elemInjuryHappenedLocation.classes.filter(className => {
				return className != "hidden"
			})
			elemInjuryHappenedLocation.classes.push('hidden');
			this.form.patchValue({
				accident_location: null,
				
			});
	}

	hideInjuryHappenedLocationAddress()
	{
		let elemInjuryHappenedLocationAddress = getFieldControlByName(this.fieldConfig, 'address_div');
		elemInjuryHappenedLocationAddress.classes = elemInjuryHappenedLocationAddress.classes.filter(className => {
				return className != "hidden"
			})
			elemInjuryHappenedLocationAddress.classes.push('hidden');
			this.form.patchValue({
				street_no: null,
				apartment:null,
				city:null,
				state:null,
				zip:null,
				
			});
	}

	hideActivityAtInjury()
	{
		let elemActivityAtInjury = getFieldControlByName(this.fieldConfig, 'activity_at_injury');
		elemActivityAtInjury.classes = elemActivityAtInjury.classes.filter(className => {
				return className != "hidden"
			})
			elemActivityAtInjury.classes.push('hidden');
			this.form.patchValue({
				activity_at_injury:null
				
			});
	}





	bindAtTheTimeOfAccident() {
		let control = this.form.controls['patient_at_time_of_accident'];
		// let driverControl = getFieldControlByName(this.fieldConfig, 'patient_at_time_of_accident')
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

	shouldShowOccupationalDiseaseAccident() {
		let occupational_disease_control = getFieldControlByName(this.fieldConfig, 'occupational_disease')
		let shuldShowOccupationalDisease=this.caseFlowService.shouldShowOccupationalDiseaseAccident();
			if (shuldShowOccupationalDisease) {
				occupational_disease_control.classes = occupational_disease_control.classes.filter(className => className != 'hidden')
			}
			else {
				occupational_disease_control.classes.push('hidden')
			}
			let occ_dis = this.caseData.accident && this.caseData.accident.accident_information;
			if(occ_dis && occ_dis.occupational_disease === 0) {
				this.fieldConfig[0].children[1] = this.DOA.ReqDOA;
			}
			else {
				this.fieldConfig[0].children[1] = this.DOA.OptDOA;
			}
	}
	
	ngOnChanges(changes: SimpleChanges) {
		if (this.caseData) {
			this.setValues();
			this.shouldShowOccupationalDiseaseAccident();
			this.checkPurposeOfVisitSpeciality();
		}
		// if (changes && changes['caseData']) {
		// 	if (!this.fd_services.isEmpty(changes['caseData'].currentValue)) {
		// 		this.setValues();
		// 	}
		// }

		// if (this.caseId) {
		// 	this.form.patchValue({ caseId: this.caseId })
		// }
	}

	setValues() {
		if (this.caseData) {
			this.setFormByCaseId()
		}
		if (this.caseData && this.caseData.accident.accident_information && this.fieldConfig.length > 0) {
			let accident = this.caseData.accident.accident_information;
			const truthy = Object.keys(accident).filter(item => accident[item] != undefined || accident[item] != null );
			const newObj = {};
			truthy.forEach(item =>Object.assign(newObj, { [item]: accident[item]}));
			this.form.patchValue(newObj);
		}
	}
	
	formatAMPM(date) {
		var hours = date.getHours();
		var minutes = date.getMinutes();
		var ampm = hours >= 12 ? 'PM' : 'AM';
		hours = hours % 12;
		hours = hours ? hours : 12; // the hour '0' should be '12'
		minutes = minutes < 10 ? '0' + minutes : minutes;
		var strTime = hours + ':' + minutes + ' ' + ampm;
		return strTime;
	}
	getRelations() {
		this.subscription.push(
			this.fd_services.getRelations()
				// this.requestService
				// 	.sendRequest(
				// 		relationshipUrlsEnum.relationship_list_GET,
				// 		'GET',
				// 		REQUEST_SERVERS.kios_api_path,
				// 	)
				.subscribe((res: any) => {
					if (res.statusCode == 200) {
						this.relations = res.data;
					}
				}));
	}
	setForm() {
		this.form = this.fb.group({
			id: null,
			accidentDate: ['', [Validators.required]],
			accidentTime: [''],
			caseEstablished: [''],
			injuryCovered: [''],
			eligibleForPayments: [''],
			workerCompTxt: [''],
			injuryCoveredInsuranceComp: [''],
			workerCompInsuranceCompany: [''],
			apartment: [''],
			accidentLocation: [''],
			workLocation: ['', [Validators.required]],
			howInjuryHappend: ['', [Validators.required, Validators.maxLength(150)]],
			whyAtThisLocation: [''],
			activityAtInjury: ['', [Validators.required]],
			natureOfInjury: ['', [Validators.required]],
			injuryDescription: ['', [Validators.required]],
			driverCondition: ['', [Validators.required]],
			streetNo: ['', [Validators.required]],
			city: [''],
			state: ['', [Validators.required]],
			zip: [''],
			lat: '',
			lng: '',
			limoDriverCondition: ['', [Validators.required]],
			limoDriver: [''],
			ime: ['', [Validators.required]],
			translatorLearning: ['', [Validators.required]],
			language: [''],
			injuredAtYourPlace: ['', [Validators.required]],
			pregnancyCondition: [''],
			caseId: this.caseId,
			patientId: this.patientId,
		});
		// this.form.disable()
	}

	onSubmit(form) {
		// this.toggleForm()
		// this.caseFlowService.updateCase(this.caseId, { accident_information: form }).subscribe(data => {
		// 	this.toastrService.success('Accident/Injury Information Successfully Updated', 'Success');
		// 	this.onSaved.emit({ component: 'injury_information_status', status: true })
		// }, err => this.toastrService.error(err.message, 'Error'))

		// this.requestService.sendRequest(CaseFlowUrlsEnum.UpdateSession + this.caseId, 'put', REQUEST_SERVERS.kios_api_path, { accident_information: form }).subscribe(data => this.toastrService.success('Data Successfully Updated', 'Success'), err => this.toastrService.error(err.message, 'Error'))
		// this.logger.log(this.form);
		// if (this.form.valid) {

		// 	form.accidentDate = changeDateFormat(form.accidentDate);

		// 	this.disableBtn = true
		// 	this.logger.log('form is valid')
		// 	if (form.id == null) {
		// 		this.add(form)
		// 	} else {
		// 		this.update(form)
		// 	}
		// } else {
		// 	this.logger.log('form is invalid');
		// 	this.fd_services.touchAllFields(this.form);
		// }
	}

	add(form) {
		var accidentTime = '';
		if (form.accidentTime != '' && form.accidentTime != null) {
			accidentTime = this.formatAMPM(form.accidentTime);
		}
		form['accidentTime'] = accidentTime
		this.subscription.push(
			this.fd_services.addInjury(form)
				// this.requestService
				// 	.sendRequest(
				// 		InjryInformationUrlsEnum.InjusryInformation_accidents_POST,
				// 		'POST',
				// 		REQUEST_SERVERS.kios_api_path,
				// 		form
				// 	)
				.subscribe((res: any) => {
					this.disableBtn = false
					if (res.statusCode == 200) {
						// this.toggleForm()
						this.form.markAsUntouched();
						this.form.markAsPristine();
						this.getCase.emit()
						this.toastrService.success('Injury Added Successfully', 'Success')
					} else {
						this.toastrService.error(res.error.message, 'Error')
					}
				}, err => {
					this.disableBtn = false
					this.toastrService.error(err.error.error.message, 'Error')
				}));
	}

	update(form) {
		var accidentTime = '';
		if (form.accidentTime != '' && form.accidentTime != null) {
			accidentTime = this.formatAMPM(form.accidentTime);
		}
		form['accidentTime'] = accidentTime
		this.subscription.push(
			this.fd_services.updateInjury(form)
				// this.requestService
				// 	.sendRequest(
				// 		InjryInformationUrlsEnum.InjusryInformation_accidents_PATCH + form['id'],
				// 		'PATCH',
				// 		REQUEST_SERVERS.kios_api_path,
				// 		form
				// 	)
				.subscribe((res: any) => {
					this.disableBtn = false
					if (res.statusCode == 200) {
						this.form.markAsUntouched();
						this.form.markAsPristine();
						// this.toggleForm()
						this.getCase.emit()
						this.toastrService.success('Injury Update Successfully', 'Success')
					} else {
						this.toastrService.error(res.error.message, 'Error')
					}
				}, err => {
					this.disableBtn = false
					this.toastrService.error(err.error.error.message, 'Error')
				}));
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

			this.form.patchValue({
				'street_no': address,
				'city': city.long_name,
				'state': state.long_name,
				'zip': postal_code.long_name,
				'lat': lat,
				'lng': lng,
			})
		} else {
			this.form.patchValue({
				'street_no': "",
				'city': "",
				'state': "",
				'zip': "",
				'lat': "",
				'lng': "",
			})
		}
	}

	goBack() {
		this.location.back()
		// this.router.navigate(['injury'], { relativeTo: this.route.parent.parent.parent })
	}


	toggleOtherField() {
		if (this.form.get('relationshipId').value == 7) {
			this.form.controls['Other'].setValidators([Validators.required]);
		} else {
			this.form.patchValue({ Other: '' });
			this.form.controls['Other'].clearValidators();

		}
	}

	toggleWorkLocation(value) {
		if (value) {
			this.form.controls['whyAtThisLocation'].setValidators([Validators.required])
			this.form.controls['whyAtThisLocation'].updateValueAndValidity({ onlySelf: true, emitEvent: false });

			this.form.updateValueAndValidity()
		} else {
			this.form.controls['whyAtThisLocation'].clearValidators()
			this.form.controls['whyAtThisLocation'].updateValueAndValidity({ onlySelf: true, emitEvent: false });
			this.form.updateValueAndValidity()
		}
	}

	toggleLimoDriver(value) {
		if (value) {
			this.form.controls['limoDriver'].setValidators([Validators.required])
			this.form.controls['limoDriver'].updateValueAndValidity({ onlySelf: true, emitEvent: false });

			this.form.updateValueAndValidity()
		} else {
			this.form.controls['limoDriver'].clearValidators()
			this.form.controls['limoDriver'].updateValueAndValidity({ onlySelf: true, emitEvent: false });
			this.form.updateValueAndValidity()
		}
	}

	toggleLanugageField(value) {
		if (value) {
			this.form.controls['language'].setValidators([Validators.required])
			this.form.controls['language'].updateValueAndValidity({ onlySelf: true, emitEvent: false });
			this.form.updateValueAndValidity()
		} else {
			this.form.controls['language'].clearValidators()
			this.form.controls['language'].updateValueAndValidity({ onlySelf: true, emitEvent: false });
			this.form.updateValueAndValidity()
		}
	}

	// toggleForm() {
	// 	this.form.disabled ? this.form.enable() : this.form.disable()
	// 	this.toggleButtons()
	// }
	toggleButtons() {

		let control = getFieldControlByName(this.fieldConfig, 'button-div')
		this.form.disabled ? control.classes.push('hidden') : control.classes = control.classes.filter(className => className != 'hidden')
	}
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}
	canDeactivate() {
		return (this.form.dirty);
	}

	setValidationOnAccidentDate(){
		this.subscription.push(this.form.controls['occupational_disease'].valueChanges.subscribe(data => {
			console.log(data);
			if(data === 0 || data === null){
				this.fieldConfig[0].children[1] = new InputClass('DOA * (mm/dd/yyyy)', 'accident_date', InputTypes.date, '', [
					{ name: 'required', message: 'This field is required', validator: Validators.required }
				], '', ['col-sm-6 col-xl-2'], { max: new Date() });
			}else{
				this.fieldConfig[0].children[1] = new InputClass('DOA  (mm/dd/yyyy)', 'accident_date', InputTypes.date, '',[], '', ['col-sm-6 col-xl-2']);
			}
		}));
	}
	isDateOfAccidentMax() {
		if(this.form) {
		this.subscription.push(this.form.controls['accident_date'].valueChanges.subscribe((value) => {
			if(WithoutTime(new Date(value)) > WithoutTime(new Date)) {
				this.form.controls['accident_date'].setErrors({max_date:true});
			} else {
				this.form.controls['accident_date'].setErrors(null);
			}
			if(!value) {
				this.form.controls['accident_date'].setErrors(null);
			}
		}))
	}
	}
}
