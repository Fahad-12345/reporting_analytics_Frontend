import { changeDateFormat, compareArrOfNumbers, statesList, WithoutTime } from '@appDir/shared/utils/utils.helpers';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { NgbModalOptions, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CustomDiallogService } from './../../../shared/services/custom-dialog.service';
import { ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { RadioButtonClass } from '@appDir/shared/dynamic-form/models/RadioButtonClass.class';
import { SelectClass } from '@appDir/shared/dynamic-form/models/SelectClass.class';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { Observable, Subject, Subscription } from 'rxjs';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Router, ActivatedRoute } from '@angular/router';
import { AddressClass } from '@appDir/shared/dynamic-form/models/AddressClass.class';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { Title } from '@angular/platform-browser';
import { getFieldControlByName } from '@appDir/shared/dynamic-form/helper';
import { PatientFormUrlsEnum } from './PatientForm-Urls-enum';
import { AllergyTypes, Patient } from '@appDir/front-desk/models/PatientModel';
import { DynamicControl } from '@appDir/shared/dynamic-form/models/DynamicControl.class';
import { SignatureBoxClass } from '@appDir/shared/dynamic-form/models/SignatureBox.class';
import { ZipFormatMessages } from '@appDir/shared/dynamic-form/constants/ZipFormatMessages.enum';
import { NgSelectClass } from '@appDir/shared/dynamic-form/models/NgSelectClass.class';
import { NgSelectComponent } from '@ng-select/ng-select';
import { I } from '@angular/cdk/keycodes';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { debounceTime, distinctUntilChanged, pairwise } from 'rxjs/operators';
import { DialogEnum } from '@appDir/front-desk/fd_shared/models/Case.model';
import * as _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { EnumApiPath } from '@appDir/front-desk/billing/Models/searchedKeys-modal';
import { NgSelectShareableComponent } from '@appDir/shared/ng-select-shareable/ng-select-shareable.component';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
@Component({
	selector: 'app-patient-form',
	templateUrl: './patient-form.component.html',
	styleUrls: ['./patient-form.component.scss']
})
export class PatientFormComponent implements OnInit {
	constructor(protected requestService: RequestService, private route: ActivatedRoute, private router: Router, private fd_services: FDServices, private fb: FormBuilder,
		private titleService: Title,
		private customDiallogService: CustomDiallogService,
		private modalService: NgbModal,
		public commonService: DatePipeFormatService,
		private toastrService: ToastrService,
		private caseFlowService: CaseFlowServiceService,
		private el: ElementRef,
		private changeDetectorRef: ChangeDetectorRef
	) { }
	@ViewChild(DynamicFormComponent) form: DynamicFormComponent;
	@ViewChild('duplicatePatientModal') duplicatePatientModal: any;
	@ViewChild('addEditAllergyInfoModel') addEditAllergyInfoModel: any;
	@ViewChild('tagngSelect') tagngSelect: NgSelectComponent
	data: any[] = null;
	fieldConfig: FieldConfig[] = [];
	public loadData:Promise<boolean>
	public patient: Patient;
	public id: any = null;
	title: string = 'Add';
	public relations: any[] = [];
	states = statesList;
	_form: FormGroup;
	contact_information: FormGroup;
	mail_address: FormGroup;
	personalForm: FormGroup;
	allergyForm: FormGroup;
	hasId: boolean = false
	addAllergyInfoForm: FormGroup;
	signature: any;
	currentPatientDuplicate: any;
	exisitPatientId: number;
	min: Date= new Date('1900/01/01');
	duplicatePatientModalActive: NgbModalRef;
	addEditAllergyInfoModelActive: NgbModalRef;
	loadSpin: boolean = false;
	lstAllergyTypes: any[] = [];
	currAllergyDataRow: any
	prevAllergyDataRow: any
	prevAllergyIndex: any
	lstAllergySeverity: any[] = [];
	lstAllergyStatuses: any[] = [];
	allergiesList: any[] = []
	searchAllergyType$: Subject<any> = new Subject<any>();
	searchAllergyTypehead$: Subject<any> = new Subject<any>();
	searchReactionTypehead$: Subject<any> = new Subject<any>();
	resetTheNgSelectField$: Subject<any> = new Subject<any>();
	removeItemTheNgSelectField$: Subject<Boolean> = new Subject<Boolean>();
	public allAllergiesList: any[] = [];
	public selectedAllergyTypes: any[] = [];
	allergiesData: any[] = [];
	istableValid: boolean
	// commonSearchAllergy$ = new Subject();
	// commonSearchReact$ = new Subject();
	extraparams = {}
	getallReactionsData: any[] = [];
	selectedItemDisplay = '';
	isEnableAllergyTypes: boolean = false;
	prevOptSelected: any;
	EnumApiPath = EnumApiPath;
	requestServerpath = REQUEST_SERVERS;
	ngOnInit() {
		this.setConfigration();
		this.getAllergiesTypesAndSeverityStatusData();
		this.getRelations();
		this.titleService.setTitle(this.route.snapshot.data['title']);
		this.route.snapshot.pathFromRoot.forEach((path) => {
			if (path && path.params && path.params.id) {
				if (!this.id) {
					this.id = path.params.id;
					this.title = 'Edit';
					this.getPatient(this.id);
				}
			}
		});
		this.addEditAllergyForm();
	}
	
	/**
	 * get patient for edit case
	 * @param patientId 
	 */
	getPatient(patientId?) {
		let data = { filter: true, per_page: 10, page: 1, pagination: 1, order_by: 'DESC', id: patientId };
		this.requestService.sendRequest(PatientFormUrlsEnum.Patient_Get, 'GET', REQUEST_SERVERS.kios_api_path, data).subscribe(
			(res) => {
				this.patient = res['result'].data[0];
				let myNewObj = new AllergyTypes(this.patient.allergy_types)
				myNewObj.formatAllergiesforEdit();
				this.selectedAllergyTypes = myNewObj.getAllergyTypesIds();
				this.allergiesData = [...myNewObj.getAllallergies()];
				this.getallReactionsData = [...myNewObj.getAllReactions()];
				this.allAllergiesList = this.patient.allergy_types.length ? [...this.patient.allergy_types] : [];
				this.setPatientValues();
			},
			(err) => {
			},
		);
	}
	getAllergiesTypesAndSeverityStatusData() {
		this.loadSpin = true;
		this.requestService.sendRequest(PatientFormUrlsEnum.Allergies_Severity_Status, 'GET', REQUEST_SERVERS.kios_api_path, {}).subscribe(
			(res) => {
				this.loadSpin = false;
				this.loadData = Promise.resolve(true);
				this.lstAllergyTypes = res['result'] && res['result'].data['allergy_types'];
				this.lstAllergySeverity = res['result'] && res['result'].data['allergy_severity'];
				this.lstAllergyStatuses = res['result'] && res['result'].data['allergy_status'];
				if(this.id){
					getFieldControlByName(this.fieldConfig, 'allergy_types').items = this.lstAllergyTypes;
					this.allergyForm.controls['allergy_types'].setValue(this.selectedAllergyTypes, { emitEvent: false });
				}
			},
			(err) => {
				this.loadSpin = false;
			},
		);
	}
	
	ngAfterViewInit() {
		let control: InputClass = getFieldControlByName(this.fieldConfig, 'allergy_types')
		this._form = this.form.form;
		// this.contact_information=this._form.get('contact_information') as FormGroup
		this.allergyForm = this._form.controls['allergies'] as FormGroup;
		this.personalForm = this._form.controls['personal'] as FormGroup;
		this.contact_information = this._form.controls['contact_information'] as FormGroup;
		this.mail_address = this.contact_information.controls['mail_address'] as FormGroup;
		this.isDateOfBirthMax();
		this.bindAllergyChange();
		this.bindAllergyTypeChange();
		if(!this.id){
		this.allergyForm.controls['allergy_status_id'].setValue('', { emitEvent: true });
		let control: InputClass = getFieldControlByName(this.fieldConfig, 'allergy_types')
		if (this.allergyForm.controls['allergy_status_id'].value != 1) {
			control.classes.push('hidden');

		} else {
			control.classes = control.classes.filter(className => className != 'hidden');
		}
		}
	}
	/**
	 * get relations for drop down
	 */
	getRelations() {
		this.subscription.push(
			this.fd_services.getRelations().subscribe((res) => {
				if (res.statusCode == 200) {
					this.relations = res.data;
					this.fieldConfig[1].children[5].options = this.relations.map(res => {
						return { name: res.type, label: res.type, value: res.id };
					});
				}
			}),
		);
	}
	/**
  set values in form for edit
   * 
   */
	setPatientValues() {
		this.personalForm.patchValue({
			id: this.patient.id,
			first_name: this.patient.first_name,
			middle_name: this.patient.middle_name,
			last_name: this.patient.last_name,
			gender: this.patient.gender,
			dob: this.patient.dob,
			ssn: this.patient.ssn,
			weight_lbs: this.patient.weight_lbs,
			height_ft: this.patient.height_ft,
			height_in: this.patient.height_in

		});
		if (this.patient && this.patient.self && this.patient.self.contact_information && this.patient.self.contact_information.mail_address)
			this.mail_address.patchValue({
				id: this.patient.self ? this.patient.self.contact_information.mail_address.id : null,
				street: this.patient.self ? this.patient.self.contact_information.mail_address.street : null,
				apartment: this.patient.self ? this.patient.self.contact_information.mail_address.apartment : null,
				city: this.patient.self ? this.patient.self.contact_information.mail_address.city : null,
				zip: this.patient.self ? this.patient.self.contact_information.mail_address.zip : null,
				state: this.patient.self ? this.patient.self.contact_information.mail_address.state : null,
			});
		this.contact_information.patchValue({
			id: this.patient.self ? this.patient.self.id : null,
			home_phone: this.patient.home_phone,
			work_phone: this.patient.work_phone,
			cell_phone: this.patient.cell_phone,
			email: this.patient.self ? this.patient.self.email : null,
			mail_address: this.mail_address
		});
		this.allergyForm.controls['allergy_status_id'].setValue(this.patient.allergy_status_id, { emitEvent: true });
		let control: InputClass = getFieldControlByName(this.fieldConfig, 'allergy_types')
		if (this.allergyForm.controls['allergy_status_id'].value != 1) {
			control.classes.push('hidden');

		} else {
			control.classes = control.classes.filter(className => className != 'hidden');
		}
	}
	/**
	 * form configratios
	 */
	setConfigration(data?) {
		this.fieldConfig = [
			new DivClass([
				new DynamicControl('id', null),
				new InputClass('First Name*', 'first_name', InputTypes.text, data && data['first_name'] ? data['first_name'] : '', [
					{ name: 'maxlength', message: 'This fields cannot be greater than 35', validator: Validators.maxLength(35) }, { name: 'required', message: 'This field is required', validator: Validators.required }
				], '', ['col-lg-4', 'col-md-6']),

				new InputClass('Middle Name', 'middle_name', InputTypes.text, data && data['middle_name'] ? data['middle_name'] : '', [{ name: 'maxlength', message: 'This fields cannot be greater than 35', validator: Validators.maxLength(35) }], '', ['col-lg-4', 'col-md-6']),
				new InputClass('Last Name*', 'last_name', InputTypes.text, data && data['last_name'] ? data['last_name'] : '', [{ name: 'maxlength', message: 'This fields cannot be greater than 35', validator: Validators.maxLength(35) }, { name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-lg-4', 'col-md-6']),
				new RadioButtonClass('Gender*', 'gender', [{ name: 'male', label: "Male", value: "male" }, { name: 'female', value: 'female', label: 'Female' }, { name: 'x', label: "X", value: "x" }], data && data['gender'] ? data['gender'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-xl-4', 'col-lg-5', 'col-md-6', 'radio-space-evenly']),
				new InputClass('Date Of Birth* (mm/dd/yyyy)', 'dob', InputTypes.date, data && data['dob'] ? data['dob'] : null, [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-lg-4', 'col-md-6'], { max: new Date() }),
				new InputClass('SSN', 'ssn', InputTypes.text, data && data['ssn'] ? data['ssn'] : '', [{ name: 'minlength', message: 'This field cannot be less than 9', validator: Validators.minLength(9) }],  '', ['col-xl-4', 'col-lg-3', 'col-md-6'], { mask: '000-00-0000' }),
				new InputClass('Weight in lbs.', 'weight_lbs', InputTypes.text, null, [
					{ name: 'max', message: 'Weight cannot be greater than 999', validator: Validators.max(999) }
				], '', ['col-xl-4', 'col-lg-3', 'col-md-6'], { max: 999, mask: '000', skip_validation: true }),
				new InputClass('Height in Ft.', 'height_ft', InputTypes.text, '', [
					{ name: 'max', message: 'Height cannot be greater than 9', validator: Validators.max(9) }
				], '', ['col-xl-4', 'col-lg-3', 'col-md-6'], { max: 9, mask: '0', skip_validation: true }),

				new InputClass('Height in Inches', 'height_in', InputTypes.text, '', [
					{ name: 'max', message: 'Invalid height in inches', validator: Validators.max(11) }
				], '', ['col-xl-4', 'col-lg-3', 'col-md-6'], { max: 11, mask: '00', skip_validation: true }),
			], ['row'], '', '', { formControlName: 'personal' }),
			new DivClass([
				new DynamicControl('id', null),
				new InputClass('Home Phone', 'home_phone', InputTypes.text, data && data['home_phone'] ? data['home_phone'] : '', [{ name: 'minlength', message: 'This field cannot be less than 10', validator: Validators.minLength(10) }], '', ['col-lg-3', 'col-md-6'], { mask: '000-000-0000' }),
				new InputClass('Work Phone', 'work_phone', InputTypes.text, data && data['work_phone'] ? data['work_phone'] : '', [{ name: 'minlength', message: 'This field cannot be less than 10', validator: Validators.minLength(10) }], '', ['col-lg-3', 'col-md-6'], { mask: '000-000-0000' }),
				new InputClass('Cell Phone*', 'cell_phone', InputTypes.text, data && data['cell_phone'] ? data['cell_phone'] : '', [{ name: 'minlength', message: 'This field cannot be less than 10', validator: Validators.minLength(10) }, { name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-lg-3', 'col-md-6'], { mask: '000-000-0000' }),
				new InputClass('Email', 'email', InputTypes.email, data && data['email'] ? data['email'] : '', [{ name: 'pattern', message: 'Email is not valid', validator: Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$') }], '', ['col-lg-3', 'col-md-6']),
				new DivClass([
					new DivClass([
						new DynamicControl('id', null),
						new AddressClass('Address*', 'street', this.handleAddressChange.bind(this), '', [{ name: 'maxlength', message: 'This fields cannot be greater than 40', validator: Validators.maxLength(40) }, { name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-md-6', 'col-md-6']),
						new InputClass('Suite / Floor', 'apartment', InputTypes.text, data && data['apartment'] ? data['apartment'] : '', [{ name: 'maxlength', message: 'This fields cannot be greater than 40', validator: Validators.maxLength(40) }], '', ['col-md-6', 'col-md-6']),
						new InputClass('City*', 'city', InputTypes.text, data && data['city'] ? data['city'] : '', [{ name: 'maxlength', message: 'This fields cannot be greater than 35', validator: Validators.maxLength(35) }, { name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-lg-4', 'col-md-6']),
						new SelectClass('State* ', 'state', this.states.map(res => {
							return { name: res, label: res, value: res };
						}), '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-lg-4', 'col-md-6']),
						new InputClass('Zip*', 'zip', InputTypes.text, data && data['zip'] ? data['zip'] : '', [{ name: 'pattern', message: ZipFormatMessages.format_usa, validator: Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$') }, { name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-lg-4', 'col-md-6']),

					], ['row'], '', '', { formControlName: 'mail_address' }),
				], ['col-12']),
			], ['row'], '', '', { formControlName: 'contact_information' }),
			new DivClass([
				new RadioButtonClass('Do you have any allergies?*', 'allergy_status_id',
					[{ name: 'yes', label: "Yes", value: DialogEnum.one },
					{ name: 'no', value: DialogEnum.two, label: 'No' },
					{ name: 'unknown', label: "Unknown", value: DialogEnum.three }]
					, '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-xl-5', 'col-lg-6', 'col-md-7', 'radio-space-evenly']),
				new NgSelectClass("Allergy Type", 'allergy_types', 'name', 'id', this.searchAllergyType.bind(this), true, null, [], '', ['col-sm-5 col-md-5 col-lg-3'], [], null, null, null,null, this.getAllergyTypeOnOpen.bind(this), this.searchAllergyTypeScrollToEnd.bind(this), this.searchAllergyType$, this.searchAllergyTypeHead.bind(this), this.resetTheNgSelectField$, false, '', '', false, this.removeItemTheNgSelectField$),
			], ['row'], '', '', { formControlName: 'allergies' }),
		];
	}
	/**
	 * go back 
	 */
	goBack() {

		// this.route.parent.parent.parent
		// this is returning null
		this.router.navigate(['front-desk/patients/list']);
	}/*
populate addresss
  */
	public handleAddressChange(address: Address, type?: string) {
		let street_number = this.fd_services.getComponentByType(address, "street_number");
		let route = this.fd_services.getComponentByType(address, "route");
		let city = this.fd_services.getComponentByType(address, "locality");
		let state = this.fd_services.getComponentByType(address, "administrative_area_level_1");
		let postal_code = this.fd_services.getComponentByType(address, "postal_code");
		let lat = address.geometry.location.lat();
		let lng = address.geometry.location.lng();

		if (street_number != null) {
			let address: any;
			address = street_number.long_name + ' ' + route.long_name;
			this.mail_address.patchValue({
				'street': address,
				'city': city.long_name,
				'state': state.long_name,
				'zip': postal_code.long_name,
			});
		}
	}
	subscription: Subscription[] = [];
	/**
	 * on form submit
	 * @param form 
	 */

	openDuplicateModal(row) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'duplicate-patient modal-sm',
		};
		this.duplicatePatientModalActive = this.modalService.open(this.duplicatePatientModal, ngbModalOptions);
		this.currentPatientDuplicate = row;

	}

	close(modal) {
		switch (modal) {
			case 'duplicatePatientModal':
				this.duplicatePatientModalActive.close();
				this.resetAllergyForm();
				break;
			case 'addEditAllergyInfoModel':
				this.addEditAllergyInfoModelActive.close();
				this.resetAllergyForm();
				break;
			default:
				this.modalService.dismissAll();
				this.resetAllergyForm();
				break;
		}
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
					this.addAllergyInfoForm.controls['severity_id'].setValue(ev?.formValue);
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
					this.addAllergyInfoForm.controls['status'].setValue(null);
					this.addAllergyInfoForm.controls['status_id'].setValue(null);
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
				this.addAllergyInfoForm.patchValue(allergy);
				this.addEditAllergyInfoModelActive = this.modalService.open(this.addEditAllergyInfoModel, ngbModalOptions);
				break;
		}
	}
	submit(form) {
		this.setAllergyTypesValidations();
		let address = this._form?.value?.contact_information?.mail_address?.street;
		if(address) {
			address = address.trim();
			if(address == '') {
				this.toastrService.error('Address is required', 'Error');
				return false;
			}
		}
		if (this._form.invalid || this.findEmptyAllergiesTypes().length !== 0) {
			if (this.findEmptyAllergiesTypes().length)
				this.toastrService.error(`Please add allergies for ${this.findEmptyAllergiesTypes()}`, 'Add Allergy')
			if(this._form.invalid){
				this.caseFlowService.addScrollClasses();
				this.validateAllFormFields(this._form);
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
			form = { ...this._form.getRawValue() }
			// getFieldControlByName(this.fieldConfig, 'button-div').configs.disabled = true;

			if (form.personal.height_ft != '') {
				form.personal.height_ft = parseInt(form.personal.height_ft);

			}
			if (form.personal.height_in != '') {
				form.personal.height_in = parseInt(form.personal.height_in);
			}
			if (form.personal.height_ft != '' && form.personal.height_in == '') {
				form.personal.height_in = 0;
			}

			if (form.personal.weight_lbs != '') {
				form.personal.weight_lbs = parseInt(form.personal.weight_lbs);
				form.personal['weight_kgs'] = Math.round(form.personal.weight_lbs / 2.205);

			}
			if (form.allergies.allergy_status_id == "1") {
				form.allergies['allergy_types'] = [...this.allAllergiesList]
			}
			let dataFormate = {
				id: this.id,
				request_from_front_desk: true,
				patient: { personal: form.personal, contact_information: { patient: form.contact_information }, allergy: form.allergies },
			};
			let data = {
				patient_personal: form.personal,
				patient_contact_info: form.contact_information,
				patient_allergy_info: form.allergies
			};
			if (dataFormate && dataFormate.patient && dataFormate.patient.personal && dataFormate.patient['dob']) {
				dataFormate.patient.personal.dob = changeDateFormat(dataFormate.patient.personal.dob);
			}

			if (data && data.patient_personal && data.patient_personal['dob']) {
				data.patient_personal.dob = changeDateFormat(data.patient_personal.dob);
			}

			if (this.id) {
				this.loadSpin = true
				this.requestService.sendRequest(PatientFormUrlsEnum.Patient_Update_PATCH, 'PUT', REQUEST_SERVERS.kios_api_path, data).subscribe(res => {
					if (res['status'] == 200) {
						this.loadSpin = false;
						this.id = res['result']['data'] && res['result']['data']['patient_personal']['id'] ? res['result']['data']['patient_personal']['id'] : null;

						this.id ? this.router.navigate(['front-desk/patients/profile/' + this.id]) : null;
					}
				},
					(err) => {
						this.loadSpin = false;
						// getFieldControlByName(this.fieldConfig, 'button-div').configs.disabled = false;
					});
			}
			else {
				this.loadSpin = true
				this.requestService.sendRequest(PatientFormUrlsEnum.Patient_Verificaiton_API, 'POST', REQUEST_SERVERS.kios_api_path, dataFormate).subscribe(res => {
					if (res && res.result && res.result.data && res.result.data.patient_exists) {
						this.loadSpin = false
						this.exisitPatientId = res.result.data.patient_id;
						this.openDuplicateModal(dataFormate);
					}
					else {
						// getFieldControlByName(this.fieldConfig, 'button-div').configs.disabled = false;
						this.addPatient(dataFormate);
					}

				});

			}
		}

	}
	addPatient(formData) {
		this.requestService.sendRequest(PatientFormUrlsEnum.Patient_Add_POST, 'POST', REQUEST_SERVERS.kios_api_path, formData).subscribe(res => {
			if (res['status'] == 200) {
				this.loadSpin = false;
				this.id = res['result']['data'] && res['result']['data']['id'] ? res['result']['data']['id'] : null;
				this.id ? this.router.navigate(['front-desk/patients/profile/' + this.id]) : null;
			}
		},
			(err) => {
				this.loadSpin = false;
			});
	}
	uploadImage(event) {
	}

	newPatient() {
		this.addPatient(this.currentPatientDuplicate);
		this.modalService.dismissAll();
	}

	existingPatient() {
		this.router.navigate(['front-desk/patients/profile/' + this.exisitPatientId])
		this.modalService.dismissAll();

	}
	isDateOfBirthMax() {
		if (this.personalForm) {
			this.subscription.push(this.personalForm.controls['dob'].valueChanges.subscribe((value) => {
				if (WithoutTime(new Date(value)) > WithoutTime(new Date)) {
					this.personalForm.controls['dob'].setErrors({ max_date: true });
				} else {
					this.personalForm.controls['dob'].setErrors(null);
				}
				if (!value) {
					this.personalForm.controls['dob'].setErrors({ required: true });
				}
			}))
		}
	}
	//for allergy type dropdown
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
		return new Observable((res) => {
			res.next(this.lstAllergyTypes)
		})
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
					this.form.setValidations(control.validations, control.form.controls['allergy_types']);
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
					if (preval === DialogEnum.one && (this.allAllergiesList.length)) {
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
	getLabelWithId(id, arr) {
		let labelType;
		labelType = arr.filter(x => x.id == id).map(x => x.name);
		return labelType.toString();
	}
	AddnewAllergy(index: number) {
		this.addEditAllergyInfoModel(index);
		if (this.allAllergiesList[index].allergies.some((val) => val.allergy == null)) {
			this.toastrService.error('Please fill all the previous allergies.', 'Error');
		} else {
			this.allAllergiesList[index].allergies.push(
				{ allergy_id: null, allergy: null, allergyLoader: false, reactionLoader: false, reaction_ids: null, status: { id: 1, name: 'Active', slug: 'active' }, severity: null, reactions: [], selectedReactionsTooltipDisp: null, severity_id: null, status_id: 1 });
		}
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
	}
	onRowDelete(index: number, rowIndex: number) {
		this.customDiallogService.confirm('Are you sure?', "This action will delete the entire row.", 'YES', 'NO').then((confirmed) => {
			if (confirmed) {
				this.allAllergiesList[index].allergies.splice(rowIndex, 1);
			}
		});
	}
	onSubmit(allergyInfoForm: FormGroup) {
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
		} else{
			this.allAllergiesList[parcurrIndex].allergies.splice(this.prevAllergyIndex, 1, rowData);
			this.allAllergiesList = [...this.allAllergiesList]
			this.allAllergiesList[parcurrIndex].allergies = [...this.allAllergiesList[parcurrIndex].allergies]
			this.changeDetectorRef.detectChanges()
		}
		this.close('addEditAllergyInfoModel')
		this.extraparams = {}
	}
	checkDuplicateArr(prevObj, currObj) {
		if ( (Number(prevObj && prevObj.severity_id) == Number(currObj && currObj.severity_id))
			&& Number((prevObj && prevObj.status_id) == Number(currObj && currObj.status_id)) && compareArrOfNumbers(prevObj && prevObj.reaction_ids, currObj && currObj.reaction_ids)) {
			return true;
		}
		else {
			return false;
		}
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
	setAllergyTypesValidations() {
		debugger;
		let control = getFieldControlByName(this.fieldConfig, 'allergy_types')
		if (this.allergyForm.controls['allergy_status_id'].value == 1 && !this.allAllergiesList.length) {

			if (!control.validations.length) {
				control.validations.push({ name: 'required', message: 'This field is required', validator: Validators.required });
			}

			control.label = "Allergy Type*";
			this.form.setValidations(control.validations, control.form.controls['allergy_types']);
		} else {
			control.label = "Allergy Type";

			control.validations = control.validations.filter(validation => validation.name != 'required');
			this.form.setValidations(control.validations, control.form.controls['allergy_types']);

		}
	}
	findEmptyAllergiesTypes() {
		return this.allAllergiesList.filter(x => x.allergies.length == 0).map(x => x.name).join(', ');
	}
	checkAllergyExists(allergiesData,rowData){
		debugger
		let allergy_id = rowData['id']
		return allergiesData.some(x => x.allergy_id == allergy_id)
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
}
