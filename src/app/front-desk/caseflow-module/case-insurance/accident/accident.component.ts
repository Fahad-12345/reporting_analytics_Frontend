import { Component, OnInit, SimpleChanges, OnDestroy, ViewChild, AfterViewInit, ElementRef, OnChanges } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { FDServices } from 'app/front-desk/fd_shared/services/fd-services.service';
import { ToastrService } from 'ngx-toastr';
import { Patient } from 'app/front-desk/patient/patient.model';
import { MainService } from '@shared/services/main-service';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { SelectionModel } from '@angular/cdk/collections';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Subscription } from 'rxjs';
import { InjuryInformationFormComponent } from '@appDir/front-desk/caseflow-module/case-insurance/accident/components/injury-information-form/injury-information-form.component';
import { ObjectInvolvedFormComponent } from '@appDir/front-desk/caseflow-module/case-insurance/accident/components/object-involved-form/object-involved-form.component';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { AddressClass } from '@appDir/shared/dynamic-form/models/AddressClass.class';
import { ButtonClass } from '@appDir/shared/dynamic-form/models/ButtonClass.class';
import { ButtonTypes } from '@appDir/shared/dynamic-form/constants/ButtonTypes.enum';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { CaseModel, PatientDetailModel, DialogEnum, WitnessToAccidentModel, AccidentInformation } from '@appDir/front-desk/fd_shared/models/Case.model';
import { RequestService } from '@appDir/shared/services/request.service';
import { DynamicControl } from '@appDir/shared/dynamic-form/models/DynamicControl.class';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { RadioButtonClass } from '@appDir/shared/dynamic-form/models/RadioButtonClass.class';
import { CaseTypeEnum, CaseTypeIdEnum, PurposeVisitSlugEnum } from '@appDir/front-desk/fd_shared/models/CaseTypeEnums';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { ZipFormatMessages } from '@appDir/shared/dynamic-form/constants/ZipFormatMessages.enum';
import { changeDateFormat, isObjectEmpty, removeEmptyAndNullsArraysFormObject, removeEmptyKeysFromObject } from '@appDir/shared/utils/utils.helpers';
import { getFieldControlByName } from '@appDir/shared/dynamic-form/helper';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
@Component({
	selector: 'app-accident',
	templateUrl: './accident.component.html',
	styleUrls: ['./accident.component.scss'],
})
export class AccidentComponent extends PermissionComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
	subscription: Subscription[] = [];
	primaryInsurance: any;
	secondaryInsurance: any;
	tertiaryInsurance: any;
	privateHealthInsurance: any;
	accidentId: number;
	public modalRef: NgbModalRef;
	public title: string;
	public caseData: CaseModel;
	public caseId: number;
	public patient: Patient;
	patientInsuranceCompanies = [];
	addNew = false;
	insuranceType: string = '';
	insurances: any[] = [];
	injury: any;
	patientId: any;
	public form: FormGroup;
	public disableBtn: boolean = false;
	private injuryWitness: any;
	witnessesRows: PatientDetailModel[] = [];
	selection = new SelectionModel<PatientDetailModel>(true, []);
	formEnabled: boolean = false;
	loaderSpin = false;
	constructor(
		private modalService: NgbModal,
		private mainService: MainService,
		private fb: FormBuilder,
		private route: ActivatedRoute,
		private logger: Logger,
		private fd_services: FDServices,
		router: Router,
		private toastrService: ToastrService,
		titleService: Title,
		requestService: RequestService,
		private caseFlowService: CaseFlowServiceService,
		aclService: AclService,
		private el:ElementRef,
		private customDiallogService : CustomDiallogService 
	) {
		super(aclService);
		titleService.setTitle(this.route.snapshot.data['title']);
		this.setForm();
		this.route.snapshot.pathFromRoot.forEach((path) => {
			if (path && path.params && path.params.caseId) {
				// alert('before if not'+this.caseId);
				if (!this.caseId) {
					this.caseId = path.params.caseId;
				}
			}
		});

		this.getCase();
	}
	public form1: FormGroup;
	public form2: FormGroup;
	@ViewChild(InjuryInformationFormComponent) InjuryInformationFormComponent: InjuryInformationFormComponent;
	@ViewChild(ObjectInvolvedFormComponent) ObjectInvolvedFormComponent: ObjectInvolvedFormComponent;
	@ViewChild('add_witness_form') component: DynamicFormComponent;
	@ViewChild('witness_form') witnessComponent: DynamicFormComponent;
	@ViewChild('addWitness') witnessModal: ElementRef
	fieldConfig: FieldConfig[] = []
	witnessFieldConfig: FieldConfig[] = []
	witnessForm: FormGroup;
	showTitle:boolean=true;
	ngAfterViewInit() {
		// this.form = this.component.form
		this.getChildProperty();
		// this.witnessForm = this.witnessComponent.form

		// if(!this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_accident_edit))
		// {
		// 	this.InjuryInformationFormComponent.form.disable();
		
		// }


	}
	bindHasWitnessChange() {
		this.subscription.push(this.witnessForm.controls['has_witness'].valueChanges.subscribe(value => {
			debugger;
			if (value == DialogEnum.yes) {

				this.addWitnessModal(this.witnessModal)
			}
			else {
				if(this.isPurposeOfVisitSpeciality())
				{
					if(this.witnessesRows.length >0)
					{
						this.witnessesRows = [];
						this.onSubmit(null)
					}
				}
				else
				{
					this.witnessesRows.length > 0 ? 

					this.customDiallogService.confirm('Are you sure?', 'This will delete any previous witness, Are you sure you want to continue','Yes','No')
		.then((confirmed) => {
			if (confirmed){
				this.witnessesRows = [];
				this.onSubmit(null)
			}
			else if(confirmed === false){
				this.witnessForm.controls['has_witness'].setValue(DialogEnum.yes,{emitEvent:false});
				
			}
			else{
				
			}
		})
		.catch()		
				 : this.caseFlowService.updateCase(this.caseId, { witness_to_accident: { data: [], anyone_see_injury_dialog: value ? value : "none" } as WitnessToAccidentModel })
				 .subscribe(data => 
					{ });
				}
			}
		}))
	}
	onWitnessReady($event) {
		this.form = $event
		
	}
	getChildProperty() {

		this.form1 = this.InjuryInformationFormComponent ? this.InjuryInformationFormComponent.form : null;
		this.form2 = this.ObjectInvolvedFormComponent ? this.ObjectInvolvedFormComponent.objectForm : null;

		this.InjuryInformationFormComponent ? this.injury_information_status = false : true;
		this.ObjectInvolvedFormComponent ? this.object_involved_status = false : true;

		
	}
	isFormDisabled: boolean = false;
	toggleForm() {
		this.form1 ? (!this.isFormDisabled && !this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_accident_edit)) ? this.form1.disable() : this.form1.enable() : null
		this.form2 ? (!this.isFormDisabled && !this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_accident_edit)) ? this.form2.disable() : this.form2.enable() : null

		this.isFormDisabled = !this.isFormDisabled
	}

	object_involved_status: boolean = false;
	injury_information_status: boolean = false;
	onSavedEvent(event) {
		this[event.component] = event.status

		if ((this.object_involved_status || !this.shouldShowObjectInvolved()) && this.injury_information_status) {
			this.caseFlowService.getCase(this.caseId).subscribe(data => {
				this.caseFlowService.goToNextStep()
			})

		}
	}

	save(event) {
		this.ObjectInvolvedFormComponent ? this.ObjectInvolvedFormComponent.component.disableHiddenControlsPublic() : null;
		this.InjuryInformationFormComponent ? this.InjuryInformationFormComponent.component.disableHiddenControlsPublic() : null;

		this.form1 = this.InjuryInformationFormComponent ? this.InjuryInformationFormComponent.form : this.fb.group({});
		this.form2 = this.ObjectInvolvedFormComponent ? this.ObjectInvolvedFormComponent.objectForm : this.fb.group({});
		if(!this.form1.valid || !this.form2.valid) {
			let firstInvalidControl: HTMLElement =
			this.el.nativeElement.querySelector('form .ng-invalid');
			if(firstInvalidControl) {
				this.caseFlowService.scrollToFirstInvalidControl(firstInvalidControl);
				return;
			}
		}
		if((this.form1.value.occupational_disease === 0 && this.form1.value.accident_date === null)){
			this.ObjectInvolvedFormComponent ? this.ObjectInvolvedFormComponent.component.enableHiddenControlsPublic() : null;
			this.InjuryInformationFormComponent ? this.InjuryInformationFormComponent.component.enableHiddenControlsPublic() : null;
			this.toastrService.error('DOA Date field is required.', 'Error');
			return;
		}
		if(this.form1.value.accident_date === null && (this.caseData.case_type.slug === CaseTypeEnum.auto_insurance || this.caseData.case_type.slug === CaseTypeEnum.lien || this.caseData.case_type.slug === CaseTypeEnum.auto_insurance_worker_compensation )){
			this.toastrService.error('DOA Date field is required.', 'Error');
			return;
		}
		if (this.form1.valid && this.form2.valid) {
			let requestData: AccidentInformation = {
				accident_information: {
					...this.form1.getRawValue(),
					...(this.caseData&&this.caseData.case_type && (this.caseData.case_type.slug === CaseTypeEnum.worker_compensation || this.caseData.case_type.slug === CaseTypeEnum.worker_compensation_employer)) ?
						{
							patient_at_time_of_accident: this.form2.value.patient_at_time_of_accident,
							driver_type: this.form2.value.driver_type,
							at_time_of_accident_other_description: this.form2.value.at_time_of_accident_other_description,

						} : {},

				},
				object_involved: this.form2.getRawValue()
			} as AccidentInformation
			isObjectEmpty(requestData.accident_information) ? delete requestData.accident_information : null
			isObjectEmpty(requestData.object_involved) ? delete requestData.object_involved : null
			requestData.accident_information.accident_date = requestData.accident_information.accident_date ?  changeDateFormat(requestData.accident_information.accident_date) : requestData.accident_information.accident_date ;
			this.caseFlowService.updateCase(this.caseId,
				requestData
			).subscribe(data => {
				this.toastrService.success('Successfully Updated', 'Success');
				// this.form1 ? this.form1.reset() : null;  commented it ,bcz it reset form fields  when its on last allowed route
				// this.form2 ? this.form2.reset() : null;
				this.form1.markAsUntouched();
				this.form1.markAsPristine();
				this.form2.markAsUntouched();
				this.form2.markAsPristine();
				this.caseFlowService.getCase(this.caseId).subscribe(data => {
					this.caseFlowService.goToNextStep()
				})

			}, err => this.toastrService.error(err.message, 'Error'))

		}
		this.ObjectInvolvedFormComponent ? this.ObjectInvolvedFormComponent.component.enableHiddenControlsPublic() : null;
		this.InjuryInformationFormComponent ? this.InjuryInformationFormComponent.component.enableHiddenControlsPublic() : null;

	}

	ngOnInit() {
		this.fieldConfig = [
			new DivClass([
				new InputClass('First Name *', 'first_name', InputTypes.text, '', [
					{ name: 'required', message: 'This field is required', validator: Validators.required }
				], '', ['col-md-4'], { title_case: true }),
				new InputClass('Middle Name', 'middle_name', InputTypes.text, '', [], '', ['col-md-4'], { title_case: true }),
				new InputClass('Last Name *', 'last_name', InputTypes.text, '', [
					{ name: 'required', message: 'This field is required', validator: Validators.required }
				], '', ['col-md-4'], { title_case: true }),
				new DivClass([
					new DynamicControl('id', null),
					new AddressClass('Street Address', 'street', this.handleAddressChange.bind(this), '', [], '', ['col-md-6']),
					new InputClass('Suite / Floor', 'apartment', InputTypes.text, '', [], '', ['col-md-6']),

					new InputClass('City', 'city', InputTypes.text, '', [], '', ['col-md-4']),
					new InputClass('State', 'state', InputTypes.text, '', [], '', ['col-md-4']),
					// new InputClass('Zip', 'zip', InputTypes.text, '', [], '', ['col-md-4'], { mask: '00000' }),
					new InputClass('Zip', 'zip', InputTypes.text, '', [{name:'pattern', message:ZipFormatMessages.format_usa,validator:Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')}], '', ['col-md-4']),
				], ['display-contents'], '', '', { formControlName: 'mail_address' }),
				new InputClass('Cell Phone No', 'cell_phone', InputTypes.text, '', [
					// { name: 'required', message: 'This field is required', validator: Validators.required }
				], '', ['col-md-4'], { mask: '000-000-0000' })
			], ['row']),
			new DynamicControl('id', ''),
			new DivClass([
				new ButtonClass('Cancel', ['btn', 'btn-primary', 'btn-block', 'mt-0 me-3'], ButtonTypes.button, this.disableForm.bind(this), { button_classes: [''] }),
				new ButtonClass('Save', ['btn', 'btn-success', 'btn-block', 'mt-0 ms-3'], ButtonTypes.submit, null, { button_classes: [''] }),
			], ['row', 'modal-btn-width', 'justify-content-center'])
		]

		this.witnessFieldConfig = [
			new DivClass([
				new RadioButtonClass('Do you have any witness to the accident', 'has_witness', [
					{ name: 'Yes', label: 'Yes', value: DialogEnum.yes },
					{ name: 'No', label: 'No', value: DialogEnum.no }
				], '', [], ['col-md-6'])
			], ['row']),

		]

		this.route.snapshot.pathFromRoot.forEach((path) => {
			if (path && path.params && path.params.caseId) {
				if (!this.caseId) {
					this.caseId = path.params.caseId;
				}
			}
		});

		this.caseFlowService.addScrollClasses();
		this.getCase();
	}
	showWitnessForm: boolean = false
	ngOnChanges(changes: SimpleChanges) {

		// if (this.caseData.accident) {
		// 	this.showWitnessForm = true
		// }
		// if (changes && changes['injuryWitness']) {

		// 	if (!this.fd_services.isEmpty(changes['injuryWitness'].currentValue)) {
		// 		this.setValues();
		// 	}
		// }
	}

	checkPurposeOfVisitSpeciality() {
		if (this.witnessForm &&this.caseFlowService.case && (this.caseFlowService.case.case_type.slug === CaseTypeEnum.worker_compensation || 
			this.caseFlowService.case.case_type.slug === CaseTypeEnum.worker_compensation_employer
			|| this.caseFlowService.case.case_type.slug === CaseTypeEnum.auto_insurance )
			&& this.caseFlowService.case.purpose_of_visit.slug === PurposeVisitSlugEnum.Speciality)
			{
				this.showTitle=false;
				this.hideWitnessToTheAccident();
				

			}
	}

	isPurposeOfVisitSpeciality()
	{
		if (this.witnessForm &&this.caseFlowService.case && (this.caseFlowService.case.case_type.slug === CaseTypeEnum.worker_compensation || 
			this.caseFlowService.case.case_type.slug === CaseTypeEnum.worker_compensation_employer 
			|| this.caseFlowService.case.case_type.slug === CaseTypeEnum.auto_insurance )
			&& this.caseFlowService.case.purpose_of_visit.slug === PurposeVisitSlugEnum.Speciality)
			{
				return true
			}
			else
			{
				return false;
			}
	}

	hideWitnessToTheAccident()
	{
		let elemWitnessToTheAccident = getFieldControlByName(this.witnessFieldConfig, 'has_witness');
		elemWitnessToTheAccident.classes = elemWitnessToTheAccident.classes.filter(className => {
				return className != "hidden"
			})
			elemWitnessToTheAccident.classes.push('hidden');
			this.witnessForm.patchValue({
				has_witness: null,
				
			});
			this.form.patchValue({
				id: this.injuryWitness&&this.injuryWitness.id?this.injuryWitness.id:null,
				firstName: null,
				middleName: null,
				lastName:null,
				address: null,
				lat: null,
				long: null,
				city: null,
				state: null,
				zip: null,
				cellPhone: null,
				injuryId: this.injuryWitness && this.injuryWitness.injuryId?this.injuryWitness.injuryId:null,
				caseId: this.caseId,
				patientId: this.patientId,
			});
	}
	onWitnessFormReady(form) {
		this.witnessForm = form;
		this.bindHasWitnessChange()
		this.witnessForm.patchValue({ has_witness: this.caseData.accident&&this.caseData.accident.witness_to_accident&&this.caseData.accident.witness_to_accident.anyone_see_injury_dialog }, { emitEvent: false })
		if(!this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_accident_edit))
		{
			this.witnessForm.disable();
		}
		this.checkPurposeOfVisitSpeciality();
	}
	formReady: boolean = false;
	getCase() {
		this.loaderSpin = true;
		this.subscription.push(
			this.caseFlowService.getCase(this.caseId).subscribe(res => {
				
				this.caseData = res.result.data;
				this.formReady = true;
				this.showWitnessForm = true;
				this.witnessesRows = this.caseData.accident &&this.caseData.accident?.witness_to_accident?.data
				if (this.witnessForm) {
					this.witnessForm.patchValue({ has_witness: this.caseData.accident.witness_to_accident.anyone_see_injury_dialog }, { emitEvent: false })
				} if (this.caseData.is_finalize) {
					this.isFormDisabled = false;
					this.toggleForm()
				}
				this.checkPurposeOfVisitSpeciality();
				setTimeout(() => {
					this.loaderSpin = false;
				},1000)
			}, err => {
				this.toastrService.error(err.message, 'Error');
				setTimeout(() => {
					this.loaderSpin = false;
				},1000)
			})
		);
	}


	goBack() { this.caseFlowService.goBack() }

	addWitnessModal = (content, witness?: any): void => {
debugger;
		this.editMode = false;
		let ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			size: 'lg',
			windowClass: 'modal_extraDOc',
		};
		this.form.reset();
		this.modalRef = this.modalService.open(content, ngbModalOptions);
		if (witness) {
			this.editMode = true;
			setTimeout(() => {
				this.form.patchValue(witness)
			}, 100)

		}
		// this.enableForm();



	};
	setValues() {
		this.form.patchValue({
			id: this.injuryWitness.id,
			firstName: this.injuryWitness.firstName,
			middleName: this.injuryWitness.middleName,
			lastName: this.injuryWitness.lastName,
			address: this.injuryWitness.address,
			lat: this.injuryWitness.lat,
			long: this.injuryWitness.long,
			city: this.injuryWitness.city,
			state: this.injuryWitness.state,
			zip: this.injuryWitness.zip,
			cellPhone: this.injuryWitness.cellPhone,
			injuryId: this.injuryWitness.injuryId,
			caseId: this.caseId,
			patientId: this.patientId,
		});
	}

	setForm() {
		this.form = this.fb.group({
			id: null,
			firstName: ['', [Validators.required, Validators.maxLength(20)]],
			middleName: ['', [Validators.maxLength(20)]],
			lastName: ['', [Validators.required, Validators.maxLength(20)]],
			address: ['', []],
			lat: '',
			long: '',
			city: ['', []],
			state: ['', []],
			zip: ['', []],
			cellPhone: ['', [Validators.minLength(10)]],
			injuryId: 0,
			caseId: this.caseId,
			patientId: this.patientId,
		});
	}

	editMode: boolean = false;
	onSubmit(form: PatientDetailModel) {
		debugger;
		let message = "Successfully Added"
		if (form) {
			if (form.id) {
				message = "Successfully Updated"
				this.witnessesRows = this.witnessesRows.map(witness => {
					witness.id === form.id ? witness = form : witness
					return witness;
				})
			}
			else {
				this.witnessesRows = [...this.witnessesRows, form]

			}
			this.modalRef.close();
			this.editMode = false;
		}
		this.caseFlowService.updateCase(this.caseId, { witness_to_accident: { data: this.witnessesRows, anyone_see_injury_dialog: this.witnessForm.value.has_witness ? this.witnessForm.value.has_witness : "none" } as WitnessToAccidentModel })
		.subscribe(data => 
			{
				this.toastrService.success(message, 'Success'); 
				this.getCase();		 
		},
			 err => this.toastrService.error(err.message, 'Error'))
	}

	add(form) {
		form['caseId'] = this.caseId;
		form['patientId'] = this.patientId;
		this.subscription.push(
			this.fd_services.addInjuryWitnesses(form).subscribe(
				(res) => {
					this.disableBtn = false;
					if (res.statusCode == 200) {
						this.form.markAsUntouched();
						this.form.markAsPristine();
						this.injuryWitness = res.data;
						this.form.reset();
						this.modalRef.close();

						this.getCase();
						// this.setValues()
						this.toastrService.success('Witnesses Data Added Successfully', 'Success');
					} else {
						this.toastrService.error('Something went wrong', 'Error');
					}
				},
				(err) => {
					this.disableBtn = false;
					this.toastrService.error(err.error.error.message, 'Error');
				},
			),
		);
	}

	update(form) {
		this.subscription.push(
			this.fd_services.updateInjuryWitnesses(form).subscribe(
				(res) => {
					this.disableBtn = false;
					if (res.statusCode == 200) {
						this.form.markAsUntouched();
						this.form.markAsPristine();
						this.getCase();
						this.form.reset();
						this.modalRef.close();
						this.toastrService.success('Witnesses General Successfully Updated', 'Success');
					} else {
						this.toastrService.error(res.error.message, 'Error');
					}
				},
				(err) => {
					this.disableBtn = false;
					this.fd_services.touchAllFields(this.form);
					this.toastrService.error(err.error.error.message, 'Error');
				},
			),
		);
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
				address: address,
				city: city.long_name,
				state: state.long_name,
				zip: postal_code.long_name,
				lat: lat,
				long: lng,
			});
		} else {
			this.form.patchValue({
				address: '',
				city: '',
				state: '',
				zip: '',
				lat: '',
				long: '',
			});
		}
	}

	deleteSelected(id?: number) {
		let ids: any = [];
		if (id) {
			ids.push(id);
		} else {
			this.selection.selected.forEach(function (obj) {
				ids.push(obj.id);
			});
		}

		let requestData = {
			ids: ids,
		};
		this.subscription.push(
			this.fd_services.deleteInjuryWitness(requestData).subscribe(
				(res) => {
					this.selection.clear();
					this.getCase();
				},
				(err) => { },
			),
		);
	}
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.witnessesRows.length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle(event) {
		this.isAllSelected()
			? this.selection.clear()
			: this.witnessesRows.forEach((row) => this.selection.select(row));
	}

	confirmDel(id?: number) {
		this.customDiallogService.confirm('Delete Confirmation?', 'Do you really want to delete it.','Yes','No')
		.then((confirmed) => {
			if (confirmed){
				this.witnessesRows = this.witnessesRows.filter(witness => witness.id != id).map(witness => {
					delete witness.id;
					return witness
				})
				this.caseFlowService.updateCase(this.caseId, { witness_to_accident: { data: this.witnessesRows, anyone_see_injury_dialog: this.witnessesRows.length ? this.witnessForm.value.has_witness : "none" } as WitnessToAccidentModel })
				.subscribe(data => {
					this.toastrService.success('Successfully Updated', 'Success'), 
					this.getCase();	
				},
					err => this.toastrService.error(err.message, 'Error')
					)
			}	
			else if(confirmed === false){
				
			}
			else{
				
			}
		})
		.catch();

	}

	enableForm() {
		this.form.enable();
		this.formEnabled = true;
	}
	disableForm() {
		if(!this.witnessesRows.length){
			this.witnessForm.patchValue({
				has_witness: null,
			});
		}
		this.form.disable();
		this.modalRef.close();
		this.formEnabled = false;
	}

	stringfy(obj) {
		return JSON.stringify(obj);
	}

	ngOnDestroy() {
		this.caseFlowService.removeScrollClasses();
		unSubAllPrevious(this.subscription);
		this.logger.log('accident.component OnDestroy Called');
	}
	canDeactivate() {

		return false;
		// ((this.form && this.form.dirty && this.form.touched) || (this.form1 && this.form1.dirty && this.form1.touched) || (this.form2 && this.form2.dirty && this.form2.touched));
	}
	shouldShowObjectInvolved() {
		return this.caseFlowService.shouldShowObjectInvolved()
	}

}
