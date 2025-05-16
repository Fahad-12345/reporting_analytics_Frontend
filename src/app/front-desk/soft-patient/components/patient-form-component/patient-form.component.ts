import { SoftPatientService } from '@appDir/front-desk/soft-patient/services/soft-patient-service';
import { PatientFormUrlsEnum } from './../../../patient/patient-form/PatientForm-Urls-enum';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { NgbModalOptions,NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { changeDateFormat, unSubAllPrevious, WithoutTime } from '@appDir/shared/utils/utils.helpers';
import { Component, OnInit, ViewChild, EventEmitter, Output, ElementRef } from '@angular/core';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { RadioButtonClass } from '@appDir/shared/dynamic-form/models/RadioButtonClass.class';
import { SelectClass } from '@appDir/shared/dynamic-form/models/SelectClass.class';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { ButtonTypes } from '@appDir/shared/dynamic-form/constants/ButtonTypes.enum';
import { ButtonClass } from '@appDir/shared/dynamic-form/models/ButtonClass.class';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { fromEvent, Subscription } from 'rxjs';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Router, ActivatedRoute } from '@angular/router';
import { AddressClass } from '@appDir/shared/dynamic-form/models/AddressClass.class';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { Title } from '@angular/platform-browser';
import { statesList,allStatesList  } from '@appDir/shared/utils/utils.helpers';
import { getFieldControlByName } from '@appDir/shared/dynamic-form/helper';
import { Patient } from '@appDir/front-desk/models/PatientModel';
import { DynamicControl } from '@appDir/shared/dynamic-form/models/DynamicControl.class';
import { ZipFormatMessages } from '@appDir/shared/dynamic-form/constants/ZipFormatMessages.enum';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { SoftPatientProfileModalComponent } from '../soft-patient-profile-modal/soft-patient-profile-modal.component';
import { debounceTime, take } from 'rxjs/operators';
import { CustomFormValidators } from '@appDir/shared/customFormValidator/customFormValidator';

@Component({
	selector: 'app-patient-form-soft',
	templateUrl: './patient-form.component.html',
	styleUrls: ['./patient-form.component.scss']
})
export class PatientSoftFormComponent implements OnInit {
	constructor(protected requestService: RequestService, private route: ActivatedRoute, private router: Router, private fd_services: FDServices, private fb: FormBuilder,
		private titleService: Title,
		private modalService: NgbModal,
		public commonService:DatePipeFormatService,
		public caseFlowService: CaseFlowServiceService,
		public softCaseService: SoftPatientService,
		private el:ElementRef
		) { }
	@ViewChild(DynamicFormComponent) form: DynamicFormComponent;
	@ViewChild('duplicatePatientModal') duplicatePatientModal: any;
	
	duplicatePatientModalActive:NgbModalRef;

	data: any[] = null;
	fieldConfig: FieldConfig[] = [];
	public patient: Patient;
	public id: any = null;
	title: string = 'Add';
	public relations: any[] = [];
	states = statesList;
	_form: FormGroup;
	contact_information: FormGroup;
	mail_address: FormGroup;
	personalForm: FormGroup;
	signature: any;
	currentPatientDuplicate:any;
	exisitPatientId:number;
	softCaseRoute = false;
	duplicate_patient_is_active:boolean=false;
	is_soft_registered = true;
	allStates = allStatesList;
	@Output() patientAddForm = new EventEmitter();
	@Output() patientEditForm = new EventEmitter();
	@Output() patientAddedSucuss = new EventEmitter();
	@Output() moveToCaseInfoTab = new EventEmitter();
	@Output() moveToNextTab = new EventEmitter();
	subscription: Subscription[] = [];

	ngOnInit() {
		this.setConfigration();
		this.getRelations();
		this.isDisplayBackButton();
		this.caseFlowService.addScrollClasses();
		this.titleService.setTitle(this.route.snapshot.data['title']);
		this.route.snapshot.pathFromRoot.forEach((path) => {
			if (path && path.params && path.params.id) {
				if (!this.id) {
					this.id = path.params.id;
					this.title = 'Edit';
					this.softCaseRoute = path.queryParams ? path.queryParams.softCase ?  path.queryParams.softCase : false : false;
					if(path.queryParams && path.queryParams.is_soft_registered === "false"){
						this.is_soft_registered = false
					}else{
						this.is_soft_registered = true;	
					}
					this.getPatient(this.id);
				}
			}
		});

		this.subscription.push(this.softCaseService.pullCaseInfoTab().subscribe(res => {
			if(res!=0 ){
				this.is_soft_registered = false;
				this.softCaseRoute = true;
				this.id = res;
				this.getPatient(this.id);
			}
		})
		);
		this.subscription.push(this.softCaseService.pullAddNewSoftPatientThroughPatientProfile().subscribe(res => {
			if(res!=0 ){
				this.is_soft_registered = false;
				this.softCaseService.patientProfileRoute = true;
				this.id = res;
				this.fieldConfig[2].classes.push('hidden');
				this.getPatient(this.id);
			}
		})
		);

	}

	ngOnDestroy(): void {
		this.caseFlowService.removeScrollClasses();
		unSubAllPrevious(this.subscription);
	}
	/**
	 * get patient for edit case
	 * @param patientId 
	 */
	getPatient(patientId?) {
		let data = {filter: true, per_page: 10, page: 1, pagination: 1, order_by: 'DESC', id: patientId };
		this.subscription.push(this.requestService.sendRequest(PatientFormUrlsEnum.Patient_Get, 'GET', REQUEST_SERVERS.kios_api_path, data).subscribe(
			(res) => {
				this.patient = res['result'].data[0];
				if(this.patient)
				{
					this.setPatientValues();
					if(this.softCaseRoute){
						this.softCaseRoute = false;
						this.moveToCaseInfoTab.emit(this.patientObjectResponse());
					}
					if (this.softCaseService.patientProfileRoute) {
						this.softCaseService.patientProfileRoute = false;
						this.softCaseService.patientFormValidation = true;
						this.fieldConfig[2].classes.push('hidden');
						this.patientFormDisabled(
							['first_name', 'last_name', 'middle_name', 'id', 'gender', 'dob', 'ssn'],
							['cell_phone', 'home_phone', 'email', 'id', 'mail_address', 'work_phone'],
						);
						this.moveToNextTab.emit(this.patientObjectResponse());
					}
				}
			},
			(err) => {
			},
		));
	}


	ngAfterViewInit() {
		this._form = this.form.form;
		this.personalForm = this._form.controls['personal'] as FormGroup;
		this.contact_information = this._form.controls['contact_information'] as FormGroup;
		this.mail_address = this.contact_information.controls['mail_address'] as FormGroup;
		this.isDateOfBirthMax();
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
		});
		if (this.patient && this.patient.self && this.patient.self.contact_information && this.patient.self.contact_information.mail_address)
			this.mail_address.patchValue({
				id: this.patient.self.contact_information.mail_address.id,
				street: this.patient.self.contact_information.mail_address.street,
				apartment: this.patient.self.contact_information.mail_address.apartment,
				city: this.patient.self.contact_information.mail_address.city,
				zip: this.patient.self.contact_information.mail_address.zip,
				state: this.patient.self.contact_information.mail_address.state,
			});
		this.contact_information.patchValue({
			id: this.patient.self.id,
			home_phone: this.patient.home_phone,
			work_phone: this.patient.work_phone,
			cell_phone: this.patient.cell_phone,
			email: this.patient.self.email,
			mail_address: this.mail_address
		});

	}
	/**
	 * form configratios
	 */
	setConfigration(data?) {
		this.fieldConfig = [
			new DivClass([
				new DynamicControl('id', null),
				new InputClass('First Name*', 'first_name', InputTypes.text, data && data['first_name'] ? data['first_name'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required },{ name: 'whitespace', message: 'To save the changes, please enter at least one character.', validator: CustomFormValidators.noWhitespace}], '', ['col-lg-4', 'col-md-6']),
				new InputClass('Middle Name', 'middle_name', InputTypes.text, data && data['middle_name'] ? data['middle_name'] : '', [,{ name: 'whitespace', message: 'To save the changes, please enter at least one character.', validator: CustomFormValidators.noWhitespace}], '', ['col-lg-4', 'col-md-6']),
				new InputClass('Last Name*', 'last_name', InputTypes.text, data && data['last_name'] ? data['last_name'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required },{ name: 'whitespace', message: 'To save the changes, please enter at least one character.', validator: CustomFormValidators.noWhitespace}], '', ['col-lg-4', 'col-md-6']),
				new RadioButtonClass('Gender*', 'gender', [{ name: 'male', label: "Male", value: "male" }, { name: 'female', value: 'female', label: 'Female' }, { name: 'x', label: "X", value: "x" }], data && data['gender'] ? data['gender'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-xl-4', 'col-lg-5', 'col-md-6', 'radio-space-evenly']),
				new InputClass('Date Of Birth* (mm/dd/yyyy)', 'dob', InputTypes.date, data && data['dob'] ? data['dob'] : null, [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-lg-4', 'col-md-6', 'parent-horizontal-label'], { max: new Date() }),
				new InputClass('SSN', 'ssn', InputTypes.text, data && data['ssn'] ? data['ssn'] : '', [{ name: 'minlength', message: '', validator: Validators.minLength(9) }], '', ['col-xl-4', 'col-lg-3', 'col-md-6'], { mask: '000-00-0000' }),
			], ['row'], '', '', { formControlName: 'personal' }),
			new DivClass([
				new DynamicControl('id', null),
				new InputClass('Home Phone', 'home_phone', InputTypes.text, data && data['home_phone'] ? data['home_phone'] : '', [{ name: 'minlength', message: '', validator: Validators.minLength(10) }], '', ['col-lg-3', 'col-md-6'], { mask: '000-000-0000' }),
				new InputClass('Work Phone', 'work_phone', InputTypes.text, data && data['work_phone'] ? data['work_phone'] : '', [{ name: 'minlength', message: '', validator: Validators.minLength(10) }], '', ['col-lg-3', 'col-md-6'], { mask: '000-000-0000' }),
				new InputClass('Cell Phone*', 'cell_phone', InputTypes.text, data && data['cell_phone'] ? data['cell_phone'] : '', [{ name: 'minlength', message: '', validator: Validators.minLength(10) }, { name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-lg-3', 'col-md-6'], { mask: '000-000-0000' }),
				new InputClass('Email', 'email', InputTypes.email, data && data['email'] ? data['email'] : '', [{ name: 'pattern', message: 'Email is not valid', validator: Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$') }], '', ['col-lg-3', 'col-md-6']),
				new DivClass([
					new DivClass([
						new DynamicControl('id', null),
						new AddressClass('Street Address*', 'street', this.handleAddressChange.bind(this), '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-md-6', 'col-md-6']),
						new InputClass('Suite / Floor', 'apartment', InputTypes.text, data && data['apartment'] ? data['apartment'] : '', [], '', ['col-md-6', 'col-md-6']),
						new InputClass('City*', 'city', InputTypes.text, data && data['city'] ? data['city'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-lg-4', 'col-md-6']),
						new SelectClass('State*', 'state', this.allStates.map(res => {
							return { name: res.name, label: res.name, value: res.name,fullName:res.fullName  }
						  }), '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-lg-4', 'col-md-6'],false,false,'selectState'),
						new InputClass('Zip*', 'zip', InputTypes.text, data && data['zip'] ? data['zip'] : '', [{name:'pattern', message:ZipFormatMessages.format_usa,validator:Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')},{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-lg-4', 'col-md-6']),

					], ['row'], '', '', { formControlName: 'mail_address' }),
				], ['col-12']),
			], ['row'], '', '', { formControlName: 'contact_information' }),
			new DivClass([
				new ButtonClass('Back', ['btn', 'btn-primary', 'btn-block mt-1 mt-sm-0 mb-2 mb-sm-0'], ButtonTypes.button, this.goBack.bind(this), { icon: 'icon-left-arrow me-2', button_classes: [''], name: 'button-div' }),
				new ButtonClass('Save & Continue', ['btn', 'btn-success', 'btn-block mt-0'], ButtonTypes.submit, null, { icon: 'icon-save-continue me-2', button_classes: [''], name: 'button-div' })
			], ['row', 'form-btn', 'justify-content-center'])
		];
	}
	/**
	 * go back 
	 */
	goBack() {
		this.router.navigate(['soft-patient/list'], { relativeTo: this.route.parent.parent.parent });
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
			this.duplicatePatientModalActive=this.modalService.open(this.duplicatePatientModal, ngbModalOptions);
		this.currentPatientDuplicate = row;
		
	}
	submit(form) {
		if(this.form.form.invalid) {
			let firstInvalidControl: HTMLElement =
			this.el.nativeElement.querySelector('input .ng-invalid');
			if(firstInvalidControl) {
			this.caseFlowService.scrollToFirstInvalidControl(firstInvalidControl);
			return;}
		}
		getFieldControlByName(this.fieldConfig, 'button-div').configs.disabled = true;
		let dataFormate = {
			id: this.id,
			request_from_front_desk: true,
			patient: { personal: form.personal, contact_information: { patient: form.contact_information } },
		};
		let data = {
			patient_personal: form.personal, patient_contact_info: form.contact_information
		};
		if (dataFormate && dataFormate.patient && dataFormate.patient.personal && dataFormate.patient['dob']){        
			dataFormate.patient.personal.dob= changeDateFormat(dataFormate.patient.personal.dob);        
		}       
			
		if (data && data.patient_personal && data.patient_personal['dob']){       
			 data.patient_personal.dob= changeDateFormat(data.patient_personal.dob);       
			 }
			//  dataFormate['patient']['contact_information']['patient']['residential_address']= {dataFormate['patient']['contact_information']['patient']['mail_address']};
			dataFormate['patient']['contact_information']['patient']['residential_address']=Object.assign({}, dataFormate['patient']['contact_information']['patient']['mail_address']); 
			dataFormate['patient']['contact_information']['patient']['residential_address']['id']=(this.patient&& this.patient.self&&
			 this.patient.self.contact_information&& this.patient.self.contact_information.residential_address&&this.patient.self.contact_information.residential_address)?
			 this.patient.self.contact_information.residential_address.id:null;
			 if (this.id) {
			this.caseFlowService.softCase = dataFormate;
		   	this.patientEditForm.emit(data);
		}
		else {
			this.caseFlowService.softCase = dataFormate;
			this.patientAddForm.emit(dataFormate);		
		}
	}
	addPatient(formData) {
		formData['is_soft_registered'] = true;
		this.subscription.push(this.requestService.sendRequest(PatientFormUrlsEnum.Patient_Add_POST, 'POST', REQUEST_SERVERS.kios_api_path, formData).subscribe(res => {
			if (res['status'] == 200) {
				this.id = res['result']['data'] && res['result']['data']['id'] ? res['result']['data']['id'] : null;
				this.patientAddedSucuss.emit(this.id);
			}
		},
			(err) => {
				getFieldControlByName(this.fieldConfig, 'button-div').configs.disabled = false;
			}));
	}
	uploadImage(event) {
	}

	newPatient() {
		this.addPatient(this.currentPatientDuplicate);
		this.duplicatePatientModalActive.close()
		// this.modalService.dismissAll();
	}

	existingPatient(){
		getFieldControlByName(this.fieldConfig, 'button-div').configs.disabled = false;
		if(this.duplicate_patient_is_active)
		{
			this.duplicatePatientModalActive.close()
			this.openPatientProfileModal({patientId:this.exisitPatientId});
		}
		else
		{
			// this.duplicatePatientModalActive.close()
			if(this.modalService.hasOpenModals)
			{
				this.modalService.dismissAll();

			}
			this.router.navigate(['front-desk/soft-patient/list'], {queryParams:{pagination: true,page:1,per_page:10,filter:true,order_by:'DESC',id:this.exisitPatientId} }) 
		}
		
		

	}
	openPatientProfileModal(row?) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			size:'lg',
			windowClass: 'modal_extraDOc create-bill-modal',
		};
			let softPatientProfileModalComponent=this.modalService.open(SoftPatientProfileModalComponent, ngbModalOptions);
			softPatientProfileModalComponent.componentInstance.patientId=row.patientId;
			softPatientProfileModalComponent.componentInstance.modalRef=softPatientProfileModalComponent
			softPatientProfileModalComponent.componentInstance.title='Please Confirm your identity'
		
	}
	close()
	{
		getFieldControlByName(this.fieldConfig, 'button-div').configs.disabled = false;
		this.duplicatePatientModalActive.close()
	}

	patientObjectResponse(){
		let dataFormate = {
			id: this.id,
			request_from_front_desk: true,
			patient: { personal: this.personalForm.value, contact_information: { patient: this.contact_information.value } },
		};
		return dataFormate;
	}

	patientFormDisabled(fields, contactForm){
		fields.map(r => this.personalForm.controls[r] && this.personalForm.controls[r].disable());
		contactForm.map(r => this.contact_information.controls[r] && this.contact_information.controls[r].disable());
	}
	isDisplayBackButton() {
		let endPath:any = this.route.snapshot.url && this.route.snapshot.url.length > 0 && this.route.snapshot.url[0] ? this.route.snapshot.url[0] : '';
		let actualRoute = 'front-desk/soft-patient/list';
		if(actualRoute + '/' + endPath != actualRoute+'/add' && actualRoute + '/' + endPath != actualRoute+'/edit')
		{
			this.fieldConfig[2].children[0].classes.push('hidden');
		}
	}
	isDateOfBirthMax() {
		if(this.personalForm) {
		this.subscription.push(this.personalForm.controls['dob'].valueChanges.subscribe((value) => {
			if(WithoutTime(new Date(value)) > WithoutTime(new Date)) {
				this.personalForm.controls['dob'].setErrors({max_date:true});
			} else {
				this.personalForm.controls['dob'].setErrors(null);
			}
			if(!value) {
				this.personalForm.controls['dob'].setErrors({required:true});
			}
		}))
	}
	}
}
