import { Component, Input, OnChanges, OnDestroy, ViewChild, AfterViewInit, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { FDServices } from '../../../../fd_shared/services/fd-services.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { AclService } from '@appDir/shared/services/acl.service';
import {
	changeDateFormat,
	unSubAllPrevious,
	getAge,
} from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { RequestService } from '@appDir/shared/services/request.service';
import { Observable, Subject, Subscription } from 'rxjs';
import { CanDeactivateComponentInterface } from '@appDir/shared/canDeactivateFormsComponent/CanDeactivateComponent.interface';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { RadioButtonClass } from '@appDir/shared/dynamic-form/models/RadioButtonClass.class';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { ButtonTypes } from '@appDir/shared/dynamic-form/constants/ButtonTypes.enum';
import { ButtonClass } from '@appDir/shared/dynamic-form/models/ButtonClass.class';
import { PatientModel, MaritalStatusEnum, GenderEnum } from '../../../../fd_shared/models/Patient.model'
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { CaseFlowServiceService } from '../../../../fd_shared/services/case-flow-service.service';
import { DynamicControl } from '@appDir/shared/dynamic-form/models/DynamicControl.class';
import { getFieldControlByName } from '@appDir/shared/dynamic-form/helper';
import { CaseModel, DialogEnum } from '../../../../fd_shared/models/Case.model';
import { compareArrOfNumbers, isObjectFalsy, validateAllFormFields, WithoutTime } from '@appDir/shared/utils/utils.helpers';
import { CaseTypeEnum } from '../../../../fd_shared/models/CaseTypeEnums';
import { Location } from '@angular/common';
import { NgSelectClass } from '@appDir/shared/dynamic-form/models/NgSelectClass.class';
import { PatientFormUrlsEnum } from '@appDir/front-desk/patient/patient-form/PatientForm-Urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { pairwise } from 'rxjs/operators';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { AllergyTypes } from '@appDir/front-desk/models/PatientModel';
import { I } from '@angular/cdk/keycodes';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EnumApiPath } from '@appDir/front-desk/billing/Models/searchedKeys-modal';
@Component({
	selector: 'app-personal-information-form',
	templateUrl: './personal-information-form.component.html',
	styleUrls: ['./personal-information-form.scss']
})
export class PersonalInformationFormComponent extends PermissionComponent implements OnDestroy, OnChanges, CanDeactivateComponentInterface {
	subscription: Subscription[] = [];
	public form: FormGroup;
	public allergyForm: FormGroup;
	public accident_information: FormGroup;
	public patient_personal: FormGroup;
	@Input() title = 'Edit';
	@ViewChild(DynamicFormComponent) _component: DynamicFormComponent;
	@ViewChild('addEditAllergyInfoModel') addEditAllergyInfoModel: any;
	addEditAllergyInfoModelActive: NgbModalRef;
	@Input() patient: PatientModel;
	patientId: number;
	@Input() caseId: number;
	case: CaseModel;
	caseData: any;
	disableBtn: boolean = false;
	private redirectTo: string;
	pregnancyCondition: any;
	loadSpin: boolean = false;
	public loadData:Promise<boolean>
	formEnabled: boolean = false;
	enableflag: boolean = true;
	searchTypeHead$: Subject<any> = new Subject<any>();
	fieldConfig: FieldConfig[] = []
	languagesList = [];
	//patient allergies
	istableValid: boolean;
	isAccidentFormValid: boolean
	lstAllergyTypes: any[] = [];
	lstAllergySeverity: any[] = [];
	lstAllergyStatuses: any[] = [];
	allergiesList: any[] = [];
	searchAllergyType$: Subject<any> = new Subject<any>();
	resetTheNgSelectField$: Subject<any> = new Subject<any>();
	dataFetchNgSelectField$: Subject<any> = new Subject<any>();
	removeItemTheNgSelectField$: Subject<Boolean> = new Subject<Boolean>();
	public allAllergiesList: any[] = [];
	public selectedAllergyTypes: any[] = [];
	page: number = 1;
	lastpage: number = 0;
	loading = false;
	Allergyloading = false;
	allergiesData: any[] = [];
	getallReactionsData: any[] = [];
	accidentInfoData: any
	// selectedItemDisplay:'hammad';
	hasId: boolean = false
	addAllergyInfoForm: FormGroup;
	extraparams = {}
	currAllergyDataRow: any
	prevAllergyDataRow: any
	prevAllergyIndex: any
	EnumApiPath = EnumApiPath;
	requestServerpath = REQUEST_SERVERS;
	constructor(
		private fb: FormBuilder,
		public aclService: AclService,
		public router: Router,
		private route: ActivatedRoute,
		// private logger: Logger,
		private fd_services: FDServices,
		private toastrService: ToastrService,
		protected requestService: RequestService,
		// private titleService: Title,
		// private _route: ActivatedRoute,
		private caseFlowService: CaseFlowServiceService,
		private location: Location,
		private customDiallogService: CustomDiallogService,
		private el: ElementRef,
		private modalService: NgbModal,
		private changeDetectorRef: ChangeDetectorRef
	) {
		super();

		this.setFormConfig();

		// this.titleService.setTitle(this._route.snapshot.data['title']);
		this.route.snapshot.pathFromRoot.forEach((path) => {
			if (path && path.params && path.params.caseId) {
				if (!this.caseId) {
					this.caseId = path.params.caseId;
				}
			}
		});
		// this.getCase(this.caseId);
	}

	onReady(form) {
		// debugger;
		// this.form = form
		// if (this.aclService.hasPermission(this.userPermissions.patient_case_list_personal_information_personal_view)) {
		// 	// this.form = this._component.form;

		// 	this.setGenderListener();
		// 	this.setLanguageListener();
		// 	this.setDateChangeListener();
		// 	this.bindAtTheTimeOfAccident();
		// 	this.getCase(this.caseId);
		// 	console.log(this.form.getRawValue())
		// }

		// if(!this.aclService.hasPermission(this.userPermissions.patient_case_list_personal_information_personal_edit))
		// {
		// 	this.enableForm();
		// }
	}

	ngOnChanges() {
		debugger;
		// this.form = this._component.form;
	}

	ngAfterViewInit() {
		if (this.aclService.hasPermission(this.userPermissions.patient_case_list_personal_information_personal_view)) {
			this.form = this._component.form;
			let control: InputClass = getFieldControlByName(this.fieldConfig, 'allergy_types')
			this.accident_information = this.form.get('accident_information') as FormGroup
			this.patient_personal = this.form.get('patient_personal') as FormGroup
			this.allergyForm = this.form.controls['allergies'] as FormGroup;
			this.setGenderListener();
			this.setLanguageListener();
			this.setDateChangeListener();
			this.getCase(this.caseId);
			this.bindAtTheTimeOfAccident();
			this.bindAllergyChange();
			this.bindAllergyTypeChange();
		}

		if (!this.aclService.hasPermission(this.userPermissions.patient_case_list_personal_information_personal_edit)) {
			this.enableForm();
		}
	}

	setAutoInsuranceForm() {
		let control = getFieldControlByName(this.fieldConfig, 'autoinsurance-form')
		if (this.case && this.case.case_type && ((this.case && this.case.case_type && this.case.case_type.slug === CaseTypeEnum.auto_insurance) || (this.case && this.case.case_type && this.case.case_type.slug === CaseTypeEnum.auto_insurance_worker_compensation))) {
			control.classes = control.classes.filter(className => className != 'hidden')
		} else {
			control.classes.push('hidden')
		}
	}

	setWeightValidations() {
		debugger;
		let control = getFieldControlByName(this.fieldConfig, 'weight_lbs')
		if (this.case && this.case.category.slug == 'diagnostic') {

			control.validations.push({ name: 'required', message: 'This field is required', validator: Validators.required });

			control.label = "Weight in lbs.*";
			this._component.setValidations(control.validations, control.form.controls['weight_lbs']);
		} else {
			control.label = "Weight in lbs.";

			control.validations = control.validations.filter(validation => validation.name != 'required');
			this._component.setValidations(control.validations, control.form.controls['weight_lbs']);

		}
	}

	setDrugTestingForm() {
		let control = getFieldControlByName(this.fieldConfig, 'is_law_enforcement_agent')
		if (this.case && this.case.case_type && this.case.case_type.slug === CaseTypeEnum.corporate) {
			control.classes = control.classes.filter(className => className != 'hidden')
		} else {
			control.classes.push('hidden')
		}
	}

	setDateChangeListener() {
		this.subscription.push(this.form.controls['patient_personal'].get('dob').valueChanges.subscribe(value => {
			if (WithoutTime(new Date(value)) > WithoutTime(new Date)) {
				this.form.controls['patient_personal'].get('dob').setErrors({ max_date: true });
			} else {
				this.form.controls['patient_personal'].get('dob').setErrors(null);
			}
			if (!value) {
				this.form.controls['patient_personal'].get('dob').setErrors({ required: true });
			}
			this.calculateAge(value);
		}))
	}
	setGenderListener() {
		let control: RadioButtonClass = getFieldControlByName(this.fieldConfig, 'is_pregnant');
		this.subscription.push(this.form.controls['patient_personal'].get('gender').valueChanges.subscribe(value => {
			if (value === GenderEnum.female || value === GenderEnum.x) {
				control.classes = control.classes.filter(className => className !== 'hidden');
			  } else {
				control.classes.push('hidden');
			  }
		}))

	}
	bindAtTheTimeOfAccident() {
		debugger;
		let accident_form = this.form.controls['accident_information'] as FormGroup
		let control = accident_form.controls['patient_at_time_of_accident'];
		// let driverControl = getFieldControlByName(this.fieldConfig, 'patient_at_time_of_accident')
		let driver_type = getFieldControlByName(this.fieldConfig, 'driver_type')
		let other_control = getFieldControlByName(this.fieldConfig, 'at_time_of_accident_other_description')
		this.subscription.push(control.valueChanges.subscribe(value => {
			debugger;
			if (value == 'driver') {
				other_control.classes.push('hidden')
				driver_type.classes = driver_type.classes.filter(className => className != 'hidden');
				accident_form.patchValue({ at_time_of_accident_other_description: '' }, { emitEvent: true })
				accident_form.patchValue({ driver_type: this.accidentInfoData.driver_type}, { emitEvent: true })
				this.accidentInfoData['patient_at_time_of_accident'] = accident_form.value['patient_at_time_of_accident'] ? accident_form.value['patient_at_time_of_accident'] : this.accidentInfoData['patient_at_time_of_accident'];
				this.checkAccidentInformationFormValidity(this.accidentInfoData);
			} else if (value == 'other') {
				accident_form.patchValue({ driver_type: '' }, { emitEvent: false })
				other_control.classes = other_control.classes.filter(className => className != 'hidden')
				driver_type.classes.push('hidden')
				this.accidentInfoData['patient_at_time_of_accident'] = accident_form.value['patient_at_time_of_accident'] ? accident_form.value['patient_at_time_of_accident'] : this.accidentInfoData['patient_at_time_of_accident'];
				this.checkAccidentInformationFormValidity(this.accidentInfoData);
			} else {
				accident_form.patchValue({ driver_type: '' }, { emitEvent: false })
				accident_form.patchValue({ at_time_of_accident_other_description: '' }, { emitEvent: false })
				other_control.classes.push('hidden')
				driver_type.classes.push('hidden');
				this.accidentInfoData['patient_at_time_of_accident'] = accident_form.value['patient_at_time_of_accident'] ? accident_form.value['patient_at_time_of_accident'] : this.accidentInfoData['patient_at_time_of_accident'];
				this.checkAccidentInformationFormValidity(this.accidentInfoData);
			}
		}))
	}
	setLanguageListener() {

		let control: InputClass = getFieldControlByName(this.fieldConfig, 'language')
		this.subscription.push(this.form.controls['patient_personal'].get('need_translator').valueChanges.subscribe(value => {
			if (value === 1) {
				control.classes = control.classes.filter(className => className != 'hidden');
			} else {
				control.classes.push('hidden')
			}
		}))
	}
	// addIdControl() {
	// 	let control = this.fb.control(this.caseId)
	// 	this.form.addControl('id', control)
	// }
	setFormConfig() {
		this.fieldConfig = [
			new DivClass([
				new DynamicControl('id', null),
				new RadioButtonClass('At the time of accident I was?*', 'patient_at_time_of_accident', [
					{ name: 'driver', label: 'Driver', value: 'driver' },
					{ name: 'passenger', value: 'passenger', label: 'Passenger' },
					{ name: 'padestrian', label: 'Pedastrian', value: 'pedestrian' },
					{ name: 'bicyclist', value: 'bicyclist', label: 'Bicyclist' },
					{ name: 'other', label: 'Other', value: 'other' }
				], null, [
					{ name: 'required', validator: Validators.required, message: 'This field is required' }
				], ['col-12 col-xl-8', 'radio-space-evenly']),
				new InputClass('If Other, What?', 'at_time_of_accident_other_description', InputTypes.text, null, [{ name: 'required', validator: Validators.required, message: 'This field is required' }], '', ['col-lg-4', 'hidden']),
				new RadioButtonClass('Taxi Or Limo? *', 'driver_type', [
					{ name: 'limoDriver', value: 'limo', label: 'Limo Driver' },
					{ name: 'taxiDriver', label: 'Taxi Driver', value: 'taxi' },
					{ name: 'none', label: 'None', value: 'none' }
				], null, [{ name: 'required', validator: Validators.required, message: 'This field is required' }], ['col-12', 'radio-space-evenly', 'hidden']),
			], ['row', 'hidden'], '', '', { name: 'autoinsurance-form', formControlName: 'accident_information' }),
			new DivClass([
				new DynamicControl('id', ''),
				new InputClass('First Name *', 'first_name', InputTypes.text, '', [
					{ name: 'maxlength', message: 'Length cannot be greater than 20', validator: Validators.maxLength(20) },
					{ name: 'required', message: 'This field is required', validator: Validators.required }
				], '', ['col-12 col-sm-6 col-md-4 col-xl-2 mb-1']),
				new InputClass('Middle Name', 'middle_name', InputTypes.text, '', [
					{ name: 'maxlength', message: 'Length cannot be greater than 20', validator: Validators.maxLength(20) }
				], '', ['col-12 col-sm-6 col-md-4 col-xl-2']),
				new InputClass('Last Name *', 'last_name', InputTypes.text, '', [
					{ name: 'required', message: 'This field is required', validator: Validators.required },
					{ name: 'maxlength', message: 'Length cannot be greater than 20', validator: Validators.maxLength(20) }
				], '', ['col-12 col-sm-6 col-md-4 col-xl-2']),
				new InputClass('Date of Birth*(mm/dd/yyyy)', 'dob', InputTypes.date, '', [
					{ name: 'required', message: 'This field is required', validator: Validators.required }
				], '', ['col-12 col-sm-6 col-md-4 col-xl-2'], { max: new Date() }),
				new InputClass('Age', 'age', InputTypes.text, 0, [], '', ['col-12 col-sm-6 col-md-4 col-xl-2']),
				new InputClass('SSN', 'ssn', InputTypes.text, '', [{ name: 'minlength', message: 'This field cannot be less than 9', validator: Validators.minLength(9) }], '', ['col-12 col-sm-6 col-md-4 col-xl-3'], { mask: '000-00-0000' }),
				new InputClass('Weight in lbs.', 'weight_lbs', InputTypes.text, 0, [
					{ name: 'max', message: 'Weight cannot be greater than 999', validator: Validators.max(999) }
				], '', ['col-12 col-sm-6 col-md-4 col-xl-3'], { max: 999, mask: '000', skip_validation: true }),
				new InputClass('Height in Ft.', 'height_ft', InputTypes.text, '', [
					{ name: 'max', message: 'Height cannot be greater than 9', validator: Validators.max(9) }
				], '', ['col-12 col-sm-6 col-md-4 col-xl-3'], { max: 9, mask: '0', skip_validation: true }),
				new InputClass('Height in Inches', 'height_in', InputTypes.text, '', [
					{ name: 'max', message: 'Invalid height in inches', validator: Validators.max(11) }
				], '', ['col-12 col-sm-6 col-md-4 col-xl-3'], { max: 11, mask: '00', skip_validation: true }),
				new RadioButtonClass('Gender *', 'gender', [
					{ name: 'male', label: 'Male', value: 'male' },
					{ name: 'female', label: 'Female', value: 'female' },
					{ name: 'X', label: 'X', value: 'x' }
				], '', [
					{ name: 'required', message: 'This field is required', validator: Validators.required }
				], ['col-lg-5', 'radio-space-evenly']),
				new RadioButtonClass('Marital Status', 'meritial_status', [
					{ name: 'single', label: 'Single', value: MaritalStatusEnum.single },
					{ name: 'married', label: 'Married', value: MaritalStatusEnum.married },
					{ name: 'widowed', label: 'Widowed', value: MaritalStatusEnum.widowed },
					{ name: 'divorced', label: 'Divorced', value: MaritalStatusEnum.divorce }
				], '', [], ['col-12 col-lg-7', 'radio-space-evenly']),
				new RadioButtonClass('Are you pregnant? *', 'is_pregnant', [
					{ name: 'yes', value: 'yes', label: 'Yes' },
					{ name: 'no', value: 'no', label: 'No' },
					{ name: 'not_sure', value: 'not_sure', label: 'Not Sure' }
				], 'no', [
					{ name: 'required', message: 'This field is required', validator: Validators.required }
				], ['col-12 col-lg-6', 'radio-space-evenly']),
				new RadioButtonClass('Will you need a translator? *', 'need_translator', [
					{ name: 'yes', label: 'Yes', value: 1 },
					{ name: 'no', label: 'No', value: 0 }
				], 'no', [
					{ name: 'required', message: 'This field is required', validator: Validators.required }
				], ['col-md-8 col-lg-6 col-xl-3']),

				new NgSelectClass("If yes, What Language?", 'language', 'name', 'name', null, false, null, [], '', ['col-12 col-sm-6'], [], null, null, null, this.getLanguages.bind(this), this.onOpengetLanguages.bind(this), null, this.searchTypeHead$, this.searchTypeHead.bind(this)),


				// new SelectClass('If yes, What Language', 'language', [
				// 	{ label: 'English', name: 'English', value: 'English' },
				// 	{ label: 'Urdu', value: 'Urdu', name: 'Urdu' },
				// 	{ label: 'Spanish', value: 'Spanish', name: 'Spanish' }
				// ], '', [], ['col-md-4 col-lg-6 col-xl-3']),

				new RadioButtonClass('Are you a law enforcement agent? *', 'is_law_enforcement_agent', [
					{ label: 'Yes', name: 'yes', value: DialogEnum.yes },
					{ label: 'No', name: 'no', value: DialogEnum.no }
				], '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-md-4 col-lg-6'])
			], ['row col-width-20'], '', '', { formControlName: 'patient_personal' }),
			new DivClass([
				new RadioButtonClass('Do you have any allergies?*', 'allergy_status_id',
					[{ name: 'yes', label: "Yes", value: DialogEnum.one },
					{ name: 'no', value: DialogEnum.two, label: 'No' },
					{ name: 'unknown', label: "Unknown", value: DialogEnum.three }]
					, '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-xl-5', 'col-lg-6', 'col-md-7', 'radio-space-evenly']),
				new NgSelectClass("Allergy Type", 'allergy_types', 'name', 'id', this.searchAllergyType.bind(this), true, null, [], '', ['col-sm-5 col-md-5 col-lg-3'], [], null, null, null,null, this.getAllergyTypeOnOpen.bind(this), this.searchAllergyTypeScrollToEnd.bind(this), this.searchAllergyType$, this.searchAllergyTypeHead.bind(this), this.resetTheNgSelectField$, false, '', '', false, this.removeItemTheNgSelectField$, this.dataFetchNgSelectField$,this.onFetchDataEvent.bind(this)),
			], ['row'], '', '', { formControlName: 'allergies' }),
		]
	}
	goBack() {
		this.router.navigate([`front-desk/cases/edit/${this.caseId}/patient/case-info`])
		// this.location.back()
	}
	setValues() {
		if (this.patient && this.form) {
			this.patient.dob = new Date(this.patient.dob)
			this.form.patchValue(this.patient);
			this.calculateAge(this.patient.dob);
		}
	}
	setHiddenFormControls() {
		if (this.patient.gender != GenderEnum.female && this.patient.gender != GenderEnum.x)
			this.patient_personal.controls['is_pregnant'].setValue('no');

		if (this.case && this.case.case_type && this.case.case_type.slug != CaseTypeEnum.corporate && !this.patient.is_law_enforcement_agent) {
			this.patient_personal.controls['is_law_enforcement_agent'].setValue('no');
		}
	}
	ngOnInit() {
		this.route.snapshot.pathFromRoot.forEach((path) => {
			if (path && path.params && path.params.caseId) {
				if (!this.caseId) {
					this.caseId = path.params.caseId;
				}
			}
		});
		this.addEditAllergyForm();
	}
	getAllergiesTypesAndSeverityStatusData(caseHasAllergies?:boolean) {
		this.loadSpin = true;
		this.requestService.sendRequest(PatientFormUrlsEnum.Allergies_Severity_Status, 'GET', REQUEST_SERVERS.kios_api_path, {}).subscribe(
			(res) => {
				this.loadSpin = false;
				this.loadData = Promise.resolve(true);
				this.lstAllergyTypes = res['result'] && res['result'].data['allergy_types']
				this.lstAllergySeverity = res['result'] && res['result'].data['allergy_severity']
				this.lstAllergyStatuses = res['result'] && res['result'].data['allergy_status']
				if(caseHasAllergies){
					getFieldControlByName(this.fieldConfig,'allergy_types').items = this.lstAllergyTypes;
					this.allergyForm.patchValue({
						allergy_types:this.selectedAllergyTypes
					});
				}
				this.dataFetchNgSelectField$.next(true);
			},
			(err) => {
				this.loadSpin = false;
			},
		);
	}

	onFetchDataEvent(res){
		return new Observable((res) => {
			res.next(this.lstAllergyTypes)
		})
	}

	setAllergyTypesValidations() {
		debugger;
		let control = getFieldControlByName(this.fieldConfig, 'allergy_types')
		if (this.allergyForm.controls['allergy_status_id'].value == 1 && !this.allAllergiesList.length) {
			if (!control.validations.length) {
				control.validations.push({ name: 'required', message: 'This field is required', validator: Validators.required });
			}

			control.label = "Allergy Type*";
			this._component.setValidations(control.validations, control.form.controls['allergy_types']);
		} else {
			control.label = "Allergy Type";

			control.validations = control.validations.filter(validation => validation.name != 'required');
			this._component.setValidations(control.validations, control.form.controls['allergy_types']);

		}
	}
	checkAccidentInformationFormValidity(accidentIformation: any = {}) {
		if (accidentIformation && !isObjectFalsy(accidentIformation) && accidentIformation.patient_at_time_of_accident) {

			if (this.accident_information.controls['patient_at_time_of_accident'].value == 'driver') {
				this.accident_information.controls['at_time_of_accident_other_description'].setValue('dummy', { emitEvent: false });
				this.accident_information.controls['driver_type'].setValue(accidentIformation?.driver_type , { emitEvent: false });
			}
			else if (this.accident_information.controls['patient_at_time_of_accident'].value == 'other') {
				this.accident_information.controls['driver_type'].setValue('dummy', { emitEvent: false });
				this.accident_information.controls['at_time_of_accident_other_description'].setValue(accidentIformation?.at_time_of_accident_other_description, { emitEvent: false });
			} else {
				this.accident_information.controls['at_time_of_accident_other_description'].setValue('dummy', { emitEvent: false });
				this.accident_information.controls['driver_type'].setValue('dummy', { emitEvent: false });
			}
		} else {
			this.accident_information.controls['driver_type'].setValue('dummy', { emitEvent: false });
			this.accident_information.controls['at_time_of_accident_other_description'].setValue('dummy', { emitEvent: false });
			this.accident_information.controls['patient_at_time_of_accident'].setValue('dummy', { emitEvent: false });
		}
	}
	findInvalidControls(f: FormGroup) {
		const invalid = [];
		const controls = f.controls;
		for (const name in controls) {
			if (controls[name].invalid) {
				invalid.push(name);
			}
		}
		return invalid;
	}
	getCase(id: number, callback?) {
		this.loadSpin = true;
		let control: InputClass = getFieldControlByName(this.fieldConfig, 'allergy_types')
		this.subscription.push(
			this.caseFlowService.getCase(id)
				.subscribe(
					(res: any) => {
						this.loadSpin = false;
						// this.logger.log('case', res);
						if (res.status == 200) {
							this.fd_services.setCase(res.result.data);
							this.case = res.result.data

							if (this.case.is_finalize) {
								this.enableForm()
							}
							this.patient = res.result.data.patient;
							this.patient.allergy_status_id = res.result.data.patient.allergy_status_id;
							this.patient.allergy_types = res.result.data.patient.allergy_types;
							let myNewObj = new AllergyTypes(this.patient.allergy_types)
							myNewObj.formatAllergiesforEdit();
							this.selectedAllergyTypes = myNewObj.getAllergyTypesIds();
							this.allAllergiesList = this.patient.allergy_types.length ? [...this.patient.allergy_types] : [];
							this.allergiesData = [...myNewObj.getAllallergies()];
							this.getallReactionsData = [...myNewObj.getAllReactions()];
							this.patient.dob = new Date(this.patient.dob)
							let accident_information = res.result.data.accident_information;
							this.accidentInfoData = res.result.data.accident_information;
							if (this.patient && this.form) {
								// var dob = this.patient.dob.split('T');
								// dob = dob;
								setTimeout(() => {
									this.form.patchValue({ patient_personal: this.patient, accident_information: accident_information ? accident_information : {} });
									this.checkAccidentInformationFormValidity(accident_information);
									this.allergyForm.controls['allergy_status_id'].setValue(this.patient.allergy_status_id, { emitEvent: true });
									this.setHiddenFormControls();
									if (this.allergyForm.controls['allergy_status_id'].value != 1) {
										control.classes.push('hidden')
										this.allergyForm.controls['allergy_types'].setValue(this.selectedAllergyTypes, { emitEvent: false });
									} else {
										control.classes = control.classes.filter(className => className != 'hidden');
									}
									this.getLanguagesForEditForm();
									this.getAllergiesTypesAndSeverityStatusData(this.allergyForm.controls['allergy_status_id'].value == 1);
								}, 50);
								this.calculateAge(this.patient.dob);
							}
							// this.setValues();	
							this.setAutoInsuranceForm();
							this.setDrugTestingForm();
							this.setWeightValidations()
							callback ? callback() : null;

						}
					},
					(err) => {
						this.loadSpin = false;
						this.toastrService.error(err.error.error.message, 'Error');
					},
				));
	}

	getLanguagesForEditForm() {
		let selectedlanguage = this.form.value && this.form.value.patient_personal && this.form.value.patient_personal.language ? this.form.value.patient_personal.language : null
		this.caseFlowService.getLanguageList(selectedlanguage).subscribe(languages => {
			let language_control = getFieldControlByName(this.fieldConfig, 'language');
			language_control.items = languages

		}, error => {
			let language_control = getFieldControlByName(this.fieldConfig, 'language');
			language_control.items = []
		});

	}

	getLanguages()
	{
		
		return new Observable((res) => {
			this.caseFlowService.getLanguageList().subscribe(languages=>{
				console.log(languages);
				this.languagesList=languages
				res.next(this.languagesList)
				
			},error=>{
				res.next(this.languagesList)
			})
		})


	}
	onOpengetLanguages() {
		return new Observable((res) => {
			if(!this.languagesList.length)
			{
				let selectedLanguage=this.form.value&&this.form.value.patient_personal && this.form.value.patient_personal.language?this.form.value.patient_personal.language:null
				this.caseFlowService.getLanguageList(selectedLanguage).subscribe(languages => {
					this.languagesList = languages
					res.next(this.languagesList);
				})
			}
			else
			{
				res.next(this.languagesList);
			}

		})

	}

	searchTypeHead(filterby)
	{
		let list=[]
		return new Observable((res) => {
				this.caseFlowService.getLanguageList(filterby).subscribe((languages) => {
	
					console.log(languages);
					list=languages;
					res.next(list)
				},error=>{
					res.next([])
				});
		})
	}
	onSubmit() {
		let form = { ...this.form.getRawValue() }
		this.setAllergyTypesValidations();
		if (this.form.invalid || this.findEmptyAllergies().length !== 0) {
			if (this.findEmptyAllergies().length)
			this.toastrService.error(`Please add allergies for ${this.findEmptyAllergies()}`, 'Add Allergy')
			if(this.form.invalid){
				this.caseFlowService.addScrollClasses();
				this.validateAllFormFields(this.form);
				let firstInvalidControl: HTMLElement =
					this.el.nativeElement.querySelector('form .ng-invalid:not(div)');
				if (firstInvalidControl) {
					this.caseFlowService.scrollToFirstInvalidControl(firstInvalidControl);
				}
				setTimeout(()=>{
					this.caseFlowService.removeScrollClasses()	
				},5)
			} 
		} else {
			if (form['patient_personal'].gender == GenderEnum.male) {
				form['patient_personal'].is_pregnant = null;
			}
			if (this.case && this.case.case_type && this.case.case_type.slug != CaseTypeEnum.corporate) {
				form['patient_personal'].is_law_enforcement_agent = null;
			}
			if (form['allergies'].allergy_status_id == "1") {
				form.allergies['allergy_types'] = [...this.allAllergiesList];
			} else {
				form.allergies['allergy_types'] = [];
			}
			for (const accidentInfo in form.accident_information) {
				if (form.accident_information[accidentInfo] === 'dummy') {
					form.accident_information[accidentInfo] = null
				}
			}
			
			isObjectFalsy(form.accident_information) ? delete form.accident_information : null
			form.patient_personal.dob = changeDateFormat(form.patient_personal.dob);
			form.patient_personal.age = this.form.controls['patient_personal'].get('age').value;
			form.patient_allergy_info = form.allergies;
			this.disableBtn = true;
			this.startLoader = true;
			this.loadSpin = true;
			this.caseFlowService.updateCase(this.caseId, form)
				.subscribe(data => {
					this.loadSpin = false;
					this.form.markAsUntouched();
					this.form.markAsPristine();
					this.startLoader = false;
					this.getCase(this.caseId, callback => {
						this.caseFlowService.goToNextStep()

					})
					
					this.toastrService.success('Successfully Updated', 'Success')
				}, err => {
					this.loadSpin = false
					this.toastrService.error(err.message, 'Error')
				})
		}
	}


	enableForm() {

		if (this.form.disabled) {
			this.form.enable();
			this.form.controls['patient_personal'].get('age').disable()

		} else {
			this.form.disable();

		}

	}


	calculateAge(dateOfBirth: any) {
		if (!dateOfBirth) return;
		const birthDate = new Date(dateOfBirth);
		let age = getAge(birthDate, 'long')
		// let age = today.getFullYear() - birthDate.getFullYear();
		// const month = today.getMonth() - birthDate.getMonth();
		// if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
		// 	age--;
		// }
		this.form.controls['patient_personal'].get('age').setValue(age);
		let control: InputClass = getFieldControlByName(this.fieldConfig, 'age');
		control.values = this.form.controls['patient_personal'].get('age').value;
		this.patient.age = this.form.controls['patient_personal'].get('age').value;
		this.form.controls['patient_personal'].get('age').disable();
	}

	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}
	canDeactivate() {
		if (this.aclService.hasPermission(this.userPermissions.patient_case_list_personal_information_personal_view))
			return (this.form.touched && this.form.dirty);
	}
	bindAllergyChange() {
		let control: InputClass = getFieldControlByName(this.fieldConfig, 'allergy_types')
		this.subscription.push(this.allergyForm.controls['allergy_status_id'].valueChanges
			.pipe(pairwise())
			.subscribe(([preval, val]: [any, any]) => {
				if (val == DialogEnum.one) {
					this.allergyForm.patchValue({ is_deleted: false }, { emitEvent: false })
					control.classes = control.classes.filter(className => className != 'hidden');
					control.label = "Allergy Type";

					control.validations = control.validations.filter(validation => validation.name != 'required');
					this._component.setValidations(control.validations, control.form.controls['allergy_types']);

				}
				else if (val == DialogEnum.two) {
					if (val != preval && (preval && preval !== 3) && (this.allergyForm.dirty || this.allergyForm.touched) && (this.allAllergiesList.length)) {
						this.customDiallogService.confirm('Are you sure?', "This action will delete all the selected info of Patient's Allergy.", 'YES', 'NO').then((confirmed) => {
							if (confirmed) {
								this.allergyForm.patchValue({ is_deleted: false }, { emitEvent: false });
								this.allAllergiesList.length = 0;
								this.selectedAllergyTypes.length = 0;
								this.allergyForm.controls['allergy_types'].setValue(this.selectedAllergyTypes, { emitEvent: false });
								control.classes.push('hidden')
							} else {
								this.allergyForm.controls['allergy_status_id'].patchValue(1)
							}
						});
					} else {
						control.classes.push('hidden')
					}
				} else if (val == DialogEnum.three) {
					if (val != preval && (preval && preval !== 2) && (this.allergyForm.dirty || this.allergyForm.touched) && (this.allAllergiesList.length)) {
						this.customDiallogService.confirm('Are you sure?', "This action will delete all the selected info of Patient's Allergy.", 'YES', 'NO').then((confirmed) => {
							if (confirmed) {
								this.allergyForm.patchValue({ is_deleted: false }, { emitEvent: false })
								this.allAllergiesList.length = 0;
								this.selectedAllergyTypes.length = 0;
								this.allergyForm.controls['allergy_types'].setValue(this.selectedAllergyTypes, { emitEvent: false });
								control.classes.push('hidden')
							} else {
								this.allergyForm.controls['allergy_status_id'].patchValue(1)
							}
						});
					} else {
						control.classes.push('hidden')
					}
				} else {
					if (preval == DialogEnum.one && (this.allAllergiesList.length)) {
						this.customDiallogService.confirm('Are you sure?', "This action will delete all the selected info of Patient's Allergy.", 'YES', 'NO').then((confirmed) => {
							if (confirmed) {
								this.allAllergiesList.length = 0;
								this.selectedAllergyTypes.length = 0;
								this.allergyForm.controls['allergy_types'].setValue(this.selectedAllergyTypes, { emitEvent: false });
								control.classes.push('hidden');
							} else {
								this.allergyForm.controls['allergy_status_id'].patchValue(1)
							}
						});
					} else {
						control.classes.push('hidden');
					}
				}
			}
			));
	}
	bindAllergyTypeChange() {
		this.subscription.push(this.allergyForm.controls['allergy_types'].valueChanges.subscribe((value) => {
			if (value && value.length) {
				let allergy_type_id = Number(value && value[value.length - 1].toString());
				if (this.allAllergiesList.length) {
					this.allAllergiesList.forEach((x, index) => {
						if (!value.includes(x['allergy_type_id'])) {
							this.customDiallogService.confirm('Are you sure?', "This action will delete the associated allergy information.", 'YES', 'NO').then((confirmed) => {
								if (confirmed) {
									this.allAllergiesList.splice(index, 1);
									this.allAllergiesList = [...this.allAllergiesList];
									this.selectedAllergyTypes = value ? [...value] : [];
									this.onCancelUpdateSelectedItemsTooltip();
								} else {
									this.allergyForm.controls['allergy_types'].setValue(this.selectedAllergyTypes, { emitEvent: false });
									this.selectedAllergyTypes = [...this.selectedAllergyTypes]
									this.onCancelUpdateSelectedItemsTooltip();
								}
							});
						} else {
							if (!this.allAllergiesList.find(x => x.allergy_type_id == allergy_type_id)) {
								this.allAllergiesList.push({ 'name': this.getLabelWithId(allergy_type_id, this.lstAllergyTypes), 'id': allergy_type_id, 'allergy_type_id': allergy_type_id, 'allergies': [] });
								this.selectedAllergyTypes = value ? [...value] : [];
							}
						}
					});
				} else {

					this.allAllergiesList.push({ 'name': this.getLabelWithId(allergy_type_id, this.lstAllergyTypes), 'id': allergy_type_id, 'allergy_type_id': allergy_type_id, 'allergies': [] });
					this.selectedAllergyTypes = value ? [...value] : [];
				}
			} else {
				this.customDiallogService.confirm('Are you sure?', "This action will delete the associated allergy information.", 'YES', 'NO').then((confirmed) => {
					if (confirmed) {
						this.allAllergiesList = []
						this.selectedAllergyTypes = value ? [...value] : [];
					} else {
						this.allergyForm.controls['allergy_types'].setValue(this.selectedAllergyTypes, { emitEvent: false });
						this.selectedAllergyTypes = [...this.selectedAllergyTypes];
						this.onCancelUpdateSelectedItemsTooltip();
					}
				});
			}
		}));
	}
	searchAllergyType(name) {
		return new Observable((res) => {
		});
	}
	getAllergyTypeOnOpen() {
		return new Observable((res) => {
			res.next(this.lstAllergyTypes)
		})
	}
	searchAllergyTypeScrollToEnd() {
		return new Observable((res) => {
			res.next(this.lstAllergyTypes)
		})
	}
	searchAllergyTypeHead(res) {
		debugger
		return new Observable((res) => {
			res.next(this.lstAllergyTypes)
		})
	}
	getLabelWithId(id, arr) {
		let labelType;
		labelType = arr.filter(x => x.id == id).map(x => x.name);
		return labelType.toString();
	}
	onCancel(i: number, allergyType_id: number) {
		this.customDiallogService.confirm('Are you sure?', "This action will delete the relevant allergy type and its associated information.", 'YES', 'NO').then((confirmed) => {
			if (confirmed) {
				this.allAllergiesList.splice(i, 1);
				this.allAllergiesList = [...this.allAllergiesList];
				this.onCancelUpdateSelectedItems(allergyType_id);
				this.onCancelUpdateSelectedItemsTooltip();
			}
		});
	}
	onCancelUpdateSelectedItems(allergyType_id: number) {
		let selectedTypeIndx = this.selectedAllergyTypes.indexOf(allergyType_id)
		this.selectedAllergyTypes.splice(selectedTypeIndx, 1);
		this.selectedAllergyTypes = [...this.selectedAllergyTypes]
		this.allergyForm.controls['allergy_types'].setValue(this.selectedAllergyTypes, { emitEvent: false });
	}
	onCancelUpdateSelectedItemsTooltip() {
		let allergy_type_control = getFieldControlByName(this.fieldConfig, 'allergy_types') as NgSelectClass;

		allergy_type_control.items = this.lstAllergyTypes.filter(o1 => this.selectedAllergyTypes.some(o2 => o1.id === o2));

		this.removeItemTheNgSelectField$.next(true);
		this.dataFetchNgSelectField$.next(true);
	}
	onRowDelete(index: number, rowIndex: number) {
		this.customDiallogService.confirm('Are you sure?', "This action will delete the entire row.", 'YES', 'NO').then((confirmed) => {
			if (confirmed) {
				this.allAllergiesList[index].allergies.splice(rowIndex, 1);
			}
		});
	}
	validateAllFormFields(formGroup: FormGroup) {
		Object.keys(formGroup.controls).forEach(field => {
			const control = formGroup.get(field);
			control.markAsTouched({ onlySelf: true });
			if (control instanceof FormGroup) {
				this.validateAllFormFields(control as FormGroup)
			}
		});
	}
	addEditAllergyForm() {
		this.addAllergyInfoForm = new FormGroup({
			allergy_id: new FormControl(null, Validators.required),
			allergy: new FormControl(null),
			reaction_ids: new FormControl([]),
			reactions: new FormControl([]),
			severity_id: new FormControl(null),
			severity: new FormControl(null),
			status_id: new FormControl(1),
			status: new FormControl({ id: 1, name: 'Active', slug: 'active' })
		})
	}
	resetAllergyForm() {
		this.addAllergyInfoForm.controls['allergy_id'].reset()
		this.addAllergyInfoForm.controls['allergy'].reset();
		this.addAllergyInfoForm.controls['reaction_ids'].reset();
		this.addAllergyInfoForm.controls['reactions'].reset();
		this.addAllergyInfoForm.controls['severity_id'].reset();
		this.addAllergyInfoForm.controls['severity'].reset();
		this.addAllergyInfoForm.controls['status_id'].setValue(1);
		this.addAllergyInfoForm.controls['status'].setValue({ id: 1, name: 'Active', slug: 'active' });
	}
	close(modal) {
		this.addEditAllergyInfoModelActive.close();
		this.resetAllergyForm();
	}
	onSelectionChange(ev, type?) {
		switch (type) {
			case 'allergy':
				if (ev && ev.formValue) {
					if(!this.hasId){
						if(!this.checkAllergyExists(this.currAllergyDataRow['allergies'],ev.data && ev.data['realObj'])){
							this.addAllergyInfoForm.controls['allergy_id'].setValue(ev.formValue);
							this.addAllergyInfoForm.controls['allergy'].setValue(ev.data['realObj']);
						}
						else{
							this.toastrService.error('This allergy already added','Duplicate Allergies');
						}
					}else{
						if((this.prevAllergyDataRow['allergy_id'] != ev.data['realObj']['id'])){
							if(!this.checkAllergyExists(this.currAllergyDataRow['allergies'],ev.data && ev.data['realObj'])){
								this.addAllergyInfoForm.controls['allergy_id'].setValue(ev.formValue);
								this.addAllergyInfoForm.controls['allergy'].setValue(ev.data['realObj']);
							}
							else{
								this.toastrService.error('This allergy already added','Duplicate Allergies');
							}	
						}else{
							this.addAllergyInfoForm.controls['allergy_id'].setValue(ev.formValue);
							this.addAllergyInfoForm.controls['allergy'].setValue(ev.data['realObj']);
						}
					}
				} else {
					this.addAllergyInfoForm.controls['allergy_id'].setValue(null);
					this.addAllergyInfoForm.controls['allergy'].setValue(null);
				}
				return
			case 'reaction':
				if (ev && ev.formValue && ev.formValue.length) {
					this.addAllergyInfoForm.controls['reaction_ids'].setValue(ev.formValue);
					let reactions = ev.data.map(reaction => reaction.realObj);
					this.addAllergyInfoForm.controls['reactions'].setValue(reactions);
				} else {
					this.addAllergyInfoForm.controls['reaction_ids'].setValue([]);
					this.addAllergyInfoForm.controls['reactions'].setValue([]);
				}
				return
			case 'severity':
				if (ev) {
					this.addAllergyInfoForm.controls['severity_id'].setValue(ev.formValue);
					this.addAllergyInfoForm.controls['severity'].setValue({...ev['data']});
				} else {
					this.addAllergyInfoForm.controls['severity'].setValue(null);
					this.addAllergyInfoForm.controls['severity_id'].setValue(null);
				}
				break;
			case 'status':
				if (ev) {
					this.addAllergyInfoForm.controls['status'].setValue(ev?.data);
				} else {
					this.addAllergyInfoForm.controls['status_id'].setValue(null);
					this.addAllergyInfoForm.controls['status'].setValue(null);
				}
				break;
		}

	}
	openAddEditAllergyModal(row, btnclicked, allergy?, idx?) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc',
			size: 'lg',
		};
		switch (btnclicked) {
			case 'add':
				this.hasId = false;
				this.resetAllergyForm()
				this.extraparams = {
					allergy_type_id: row.allergy_type_id,
					per_page: 20
				}
				this.currAllergyDataRow = { ...row };
				this.addEditAllergyInfoModelActive = this.modalService.open(this.addEditAllergyInfoModel, ngbModalOptions);
				break;
			case 'edit':
				this.hasId = true;
				this.extraparams = {
					allergy_type_id: row.allergy_type_id,
					per_page: 20
				}
				this.currAllergyDataRow = { ...row };
				this.prevAllergyDataRow = { ...allergy };
				this.prevAllergyIndex = idx;
				allergy['reactions'] = allergy['reactions']?.map(x => {
					return (x?.reaction) ? x.reaction : {...x} 
				});
				this.addAllergyInfoForm.patchValue(allergy);
				this.addEditAllergyInfoModelActive = this.modalService.open(this.addEditAllergyInfoModel, ngbModalOptions);
				break;
		}
	}
	onSubmitAllergy(allergyInfoForm: FormGroup) {
		var parcurrIndex = this.allAllergiesList.findIndex(x => x.allergy_type_id === this.currAllergyDataRow.allergy_type_id);
		let rowData = { ...allergyInfoForm.getRawValue() };
		rowData['selectedReactionsTooltipDisp'] = rowData['reactions'] && rowData['reactions'].map(x => {
			if(x.name)
			    return x.name;
			else
				return x['reaction'].name;
			}).join(', ');
		if (!rowData['status']) {
			rowData['status'] = { id: 1, name: 'Active', slug: 'active' }
			rowData['status_id'] = 1
		}
		if (!this.hasId) {
			this.allAllergiesList[parcurrIndex].allergies.push(rowData);
			this.allAllergiesList = [...this.allAllergiesList]
			this.allAllergiesList[parcurrIndex].allergies = [...this.allAllergiesList[parcurrIndex].allergies]
			this.changeDetectorRef.detectChanges()
		} else if(this.hasId) {
			this.allAllergiesList[parcurrIndex].allergies.splice(this.prevAllergyIndex, 1, rowData);
			this.allAllergiesList = [...this.allAllergiesList]
			this.allAllergiesList[parcurrIndex].allergies = [...this.allAllergiesList[parcurrIndex].allergies]
			this.changeDetectorRef.detectChanges()
		}
		this.close('addEditAllergyInfoModel')
		this.extraparams = {}
	}
	checkDuplicateArr(prevObj, currObj) {
		debugger
		if ((prevObj && prevObj.allergy_id == currObj && currObj.allergy_id) && (prevObj && prevObj.severity_id == currObj && currObj.severity_id)
			&& (prevObj && prevObj.status_id == currObj && currObj.status_id) && compareArrOfNumbers(prevObj && prevObj.reaction_ids, currObj && currObj.reaction_ids)) {
			return true;
		}
		else {
			return false;
		}
	}
	checkAllergyExists(allergiesData,rowData){
		let allergy_id = rowData['allergy_id']
		return allergiesData.some(x => x.allergy_id == allergy_id)
	}
	getReactionsDispaly(reactionArr) {
		let reactions = reactionArr && reactionArr.map(res => res.name).toString();
		return reactions;
	}
	findEmptyAllergies() {
		return this.allAllergiesList.filter(x => x.allergies.length == 0).map(x => x.name).toString();
	}
}
