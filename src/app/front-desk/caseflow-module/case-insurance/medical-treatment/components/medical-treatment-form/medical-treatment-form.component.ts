import {
	Component,
	OnInit,
	Input,
	SimpleChanges,
	OnDestroy,
	ViewChild,
	OnChanges,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
import { FDServices } from '../../../../../fd_shared/services/fd-services.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SelectionModel } from '@angular/cdk/collections';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Observable, Subscription } from 'rxjs';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { RadioButtonClass } from '@appDir/shared/dynamic-form/models/RadioButtonClass.class';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { SelectClass } from '@appDir/shared/dynamic-form/models/SelectClass.class';
import { ButtonClass } from '@appDir/shared/dynamic-form/models/ButtonClass.class';
import { ButtonTypes } from '@appDir/shared/dynamic-form/constants/ButtonTypes.enum';
import { AddressClass } from '@appDir/shared/dynamic-form/models/AddressClass.class';
import { DynamicControl } from '@appDir/shared/dynamic-form/models/DynamicControl.class';
import { MedicalTreatment } from '@appDir/front-desk/models/MedicalTreatmentModal';
import { CaseFlowServiceService } from '../../../../../fd_shared/services/case-flow-service.service';
import { getFieldControlByName } from '@appDir/shared/dynamic-form/helper';
import { Location } from '@angular/common';
import { AutoCompleteClass } from '@appDir/shared/dynamic-form/models/AutoCompleteClass.class';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { BillingInsuranceModel } from '@appDir/front-desk/masters/billing/insurance-master/models/BillingInsurance.Model';
import { InsuranceUrlsEnum } from '@appDir/front-desk/masters/billing/insurance-master/Insurance/insurance-list/Insurance-Urls-enum';
import { CaseModel } from '../../../../../fd_shared/models/Case.model';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { removeEmptyKeysFromObject, statesList, WithoutTime,allStatesList  } from '@appDir/shared/utils/utils.helpers';
import { ZipFormatMessages } from '@appDir/shared/dynamic-form/constants/ZipFormatMessages.enum';
import { CaseTypeEnum, PurposeVisitSlugEnum } from '@appDir/front-desk/fd_shared/models/CaseTypeEnums';
import { NgSelectClass } from '@appDir/shared/dynamic-form/models/NgSelectClass.class';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
@Component({
	selector: 'app-medical-treatment-form',
	templateUrl: './medical-treatment-form.component.html',
})
export class MedicalTreatmentFormComponent
	extends PermissionComponent
	implements OnInit, OnDestroy, OnChanges {
	subscription: Subscription[] = [];
	public form: FormGroup;
	public hospitalAddress: FormGroup;
	public mailAddress: FormGroup;
	public pervDocMailAddress: FormGroup;
	public doctorForm: FormGroup;
	public doctorPrevForm: FormGroup;
	public currentDoctorRows: any[] = [];
	public prevtDoctorRows: any[] = [];
	public allDoctorRows: any[] = [];
	@Input() title = 'Edit';
	public ProviderTitle: string = 'Add';
	@Input() caseId: any;
	caseData: any;
	previousTitle: string = 'Previous';
	currentTitle: string = 'Current';
	index: any;
	prevIndex: any;
	showCurrentTable: boolean = true;
	docTitle: string;
	private patientId: any;
	private medical_treatment: MedicalTreatment;
	private general_details: any;
	private hospital: any = {};
	public modalRef: NgbModalRef;
	public doctorInfo: any;
	disableBtn = false;
	formEnabled: boolean = true;
	enableflag: boolean = true;
	doctorFormEnabled: boolean = false;
	selection = new SelectionModel<Element>(true, []);
	loadSpin: boolean = false;
	formSubmit: boolean = false;
	@ViewChild('addCurrentDoctor') modalReference: MedicalTreatmentFormComponent;
	states = statesList;
	allStates=allStatesList;
	constructor(
		private modalService: NgbModal,
		private fb: FormBuilder,
		private logger: Logger,
		private fd_services: FDServices,
		router: Router,
		private toastrService: ToastrService,
		private route: ActivatedRoute,
		private customDiallogService : CustomDiallogService,
		private caseFlowService: CaseFlowServiceService,
		private location: Location,
		protected requestService: RequestService,
		aclService: AclService,
	) {
		super(aclService);
		this.setConfigration();
		this.route.snapshot.pathFromRoot.forEach((path) => {
			if (path && path.params && path.params.caseId) {
				if (!this.caseId) {
					this.caseId = path.params.caseId;
				}
			}
		});
		this.setModalConfigration();
	}
	@ViewChild(DynamicFormComponent) component: DynamicFormComponent;
	data: any[] = null;
	fieldConfig: FieldConfig[] = [];
	modalFieldConfig: FieldConfig[] = [];
	ngOnInit() {
		this.formSubmit = false;
		this.caseFlowService.addScrollClasses();
		this.formEnabled = true;
	}
	case: CaseModel;
	dta: any;
	accidentcondition: any;
	getCase() {
		this.subscription.push(
			this.caseFlowService.getCase(this.caseId).subscribe((res) => {
				let data: CaseModel = res.result.data;
				this.case = data;
				this.case.is_finalize ? this.enableForm() : null;
				if (res.status == 200) {
					this.caseData = res.result.data;
					this.fd_services.setCase(res.data);
					this.dta = this.WcCaseForMedicalTreatment();
					if (this.dta) {
						this.accidentcondition = this.WcCaseAccidentForMedicalTreatment();
						if (this.accidentcondition) {
							this.fieldConfig[0].children[1].classes.push('hidden');
						} else {
							this.fieldConfig[0].children[1].children[1].classes.push('hidden');
							this.fieldConfig[0].children[1].children[2].classes.push('hidden');
							this.fieldConfig[0].children[1].children[3].classes.push('hidden');
							this.fieldConfig[0].children[1].children[4].classes.push('hidden');
						}
					}

					if (this.caseData.medical_treatment) {
						this.medical_treatment = this.caseData.medical_treatment;
						this.hospital = this.medical_treatment['hospitals'];
					}
					if (this.caseData.general_details) {
						this.general_details = this.caseData.general_details;
					}
					// this.form ? this.setValues() : '';
					if(this.form)
					{
						this.setValues();
						this.checkPurposeOfVisitSpeciality();
					}
					if (
						this.caseData &&
						this.caseData.medical_treatment &&
						this.caseData.medical_treatment.contact_information.current_treated_by.data.length > 0
					) {
						this.currentDoctorRows =
							this.caseData.medical_treatment &&
							this.caseData.medical_treatment &&
							this.caseData.medical_treatment.contact_information.current_treated_by &&
							this.caseData.medical_treatment.contact_information.current_treated_by.data;
						this.currentDoctorRows = this.currentDoctorRows.map((res) => {
							res.mail_address && res.mail_address.id ? delete res.mail_address.id : '';
							return {
								type: this.currentTitle,
								first_name: res.first_name,
								middle_name: res.middle_name,
								last_name: res.last_name,
								mail_address: res.mail_address,
							};
						});
					}
					if (
						this.caseData &&
						this.caseData.medical_treatment &&
						this.caseData.medical_treatment.contact_information.previous_treated_by.data.length > 0
					) {
						this.prevtDoctorRows =
							this.caseData.medical_treatment &&
							this.caseData.medical_treatment &&
							this.caseData.medical_treatment.contact_information.previous_treated_by &&
							this.caseData.medical_treatment.contact_information.previous_treated_by.data;
						this.prevtDoctorRows = this.prevtDoctorRows.map((res) => {
							res.mail_address && res.mail_address.id ? delete res.mail_address.id : '';
							return {
								type: this.previousTitle,
								first_name: res.first_name,
								middle_name: res.middle_name,
								last_name: res.last_name,
								mail_address: res.mail_address,
							};
						});
					}
					this.getAllDoctorsData();
				}
			}),
		);
	}

	ngAfterViewInit() {
		this.getCase();
		if(!this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_medical_treatment_edit))
{
	this.component.form.disable();
	// this.component.form.disabled({se})
	this.component.form.disable({
		onlySelf: true,
		emitEvent: false,
	});
	// this.form.disable()
	this.hideButtons();
}
	}
	/**
	 * check condition in case of WC caseType to hide some fields
	 */
	WcCaseForMedicalTreatment() {
		return this.caseFlowService.WcCaseForMedicalTreatment();
	}
	WcCaseAccidentForMedicalTreatment() {
		return this.caseFlowService.WcCaseAccidentForMedicalTreatment();
	}
	ngOnChanges(changes: SimpleChanges) {
		if (this.caseData && this.form) {
			this.setValues();
			this.checkPurposeOfVisitSpeciality();
		}
	}
	/**
	 * set the values in the form
	 */
	setValues() {
		let medical_treatmentForm = this.form.get('medical_treatment') as FormGroup;
		let general_details_form = this.form.get('general_details') as FormGroup;
		// let injury_covered_insurance = general_details_form.get(
		// 	'injury_covered_insurance',
		// ) as FormGroup;
		let worker_compensation_insurance = general_details_form.get(
			'worker_compensation_insurance',
		) as FormGroup;
		// let doctor_office=medical_treatmentForm.get('doctor_office')
		if (this.medical_treatment) {
			medical_treatmentForm.patchValue({
				have_any_first_treatment: this.medical_treatment.have_any_first_treatment,
				id: this.medical_treatment.id,
				date_of_first_treatment:
					this.medical_treatment.date_of_first_treatment != null
						? this.medical_treatment.date_of_first_treatment.split('T')[0]
						: null,
				treated_on_site: this.medical_treatment.treated_on_site,
				treated_on_site_date:
					this.medical_treatment.treated_on_site_date != null
						? this.medical_treatment.treated_on_site_date.split('T')[0]
						: null,
				treated_off_site: this.medical_treatment.treated_off_site,
				first_off_site_treatment_location: this.medical_treatment.first_off_site_treatment_location,
				date_of_admission:
					this.medical_treatment.date_of_admission != null
						? this.medical_treatment.date_of_admission.split('T')[0]
						: null,
				caseId: this.caseId,
				same_injury_body_part: this.medical_treatment.same_injury_body_part,
				is_prev_injury_work_related: this.medical_treatment.is_prev_injury_work_related,
				same_employer: this.medical_treatment.same_employer,
				had_ime: this.medical_treatment.had_ime,
			});
			if (this.medical_treatment.contact_information) {
				medical_treatmentForm.patchValue(
					{
						injury_still_treated:
							this.medical_treatment.contact_information.current_treated_by
								.current_treated_by_dialog === 'yes'
								? 1
								: 0,
						were_you_treated:
							this.medical_treatment.contact_information.previous_treated_by
								.previous_treated_by_dialog === 'yes'
								? 1
								: 0,
					},
					{ emitEvent: false },
				);
			}
			if (this.medical_treatment['doctor_office']) {
				this.hospitalAddress.patchValue(this.medical_treatment['doctor_office']);
			}
		}
		if (this.general_details) {
			medical_treatmentForm.patchValue(
				{
					injury_still_treated: this.general_details.injury_still_treated,
					were_you_treated: this.general_details.were_you_treated,
				},
				{ emitEvent: false },
			);
		}
		this.firstTreatmentfields();
		if (this.general_details) {
			general_details_form.patchValue({
				id: this.general_details.id,
				// injury_covered: this.general_details.injury_covered,// commented by adil
				// injury_covered_insurance_id: this.general_details.injury_covered_insurance_id,
				eligible_for_payments: this.general_details.eligible_for_payments,
				// worker_compensation_insurance: this.general_details.worker_compensation_insurance,
				amount_of_bills: this.general_details.amount_of_bills,
				other_expenses: this.general_details.other_expenses,
				expense_description: this.general_details.expense_description,
				// same_injury: this.general_details.same_injury,
				more_health_treatment: this.general_details.more_health_treatment,
				// show_eligibible_for_payments: this.general_details.show_eligibible_for_payments,
			});
		}
		let medical_treatment_information = this.form.get('medical_treatment') as FormGroup;

		this.hospitalAddress = medical_treatment_information.controls['hospital'] as FormGroup;

		if (this.hospital) {
			this.hospitalAddress.patchValue(
				{
					name: this.hospital.name,
					id: this.hospital.id?this.hospital.id:'',
					street_address: this.hospital.street_address,
					city: this.hospital.city,
					state: this.hospital.state,
					zip: this.hospital.zip,
					long: this.hospital.long,
					lat: this.hospital.lat,
					apartment: this.hospital.apartment,
				},
				{ emitEvent: false },
			);
			if (this.hospital.name) {
				let hosp = { id: this.hospital.id, name: this.hospital.name };
				let hosField = getFieldControlByName(this.fieldConfig, 'hospital');
				let idField = getFieldControlByName(hosField.children, 'id');
				idField.items = [hosp];
				this.hospitalAddress.patchValue({
					id: this.hospital.id ? this.hospital.id : null,
				});
			}
		} else {
			let hospitalField = getFieldControlByName(this.fieldConfig, 'hospital');
			let _idField = getFieldControlByName(hospitalField.children, 'id');
			_idField.items = this.lstHospitals;
		}

		if (this.general_details && this.general_details.injury_covered_insurance_id) {
			this.getInsurances('', this.general_details.injury_covered_insurance_id).subscribe((res) => {
				// let data = res['result'];
				// let injury_covered_insurancedata = getFieldControlByName(
				// 	this.fieldConfig,
				// 	'injury_covered_insurance',
				// );
				// getFieldControlByName(injury_covered_insurancedata.children, 'id').items = [data];
				// injury_covered_insurance.patchValue({
				// 	id: data.id ? data.id : null,
				// }); by adil
			});
		} else {
			// let _insuranceField = getFieldControlByName(this.fieldConfig, 'injury_covered_insurance');
			// let _idField = getFieldControlByName(_insuranceField.children, 'id');
			// _idField.items = this.lstInsurance;// commented by adil
		}
		if (this.general_details && this.general_details.worker_compensation_insurance_id) {
			this.getInsurances('', this.general_details.worker_compensation_insurance_id).subscribe(
				(res) => {
					let data = res['result'];
					let worker_compensation_insurancedata = getFieldControlByName(
						this.fieldConfig,
						'worker_compensation_insurance',
					);
					getFieldControlByName(worker_compensation_insurancedata.children, 'id').items = [data];
					worker_compensation_insurance.patchValue({
						id: data.id ? data.id : null,
					});
				},
			);
		} else {
			let insuranceField = getFieldControlByName(this.fieldConfig, 'worker_compensation_insurance');
			let idField = getFieldControlByName(insuranceField.children, 'id');
			idField.items = this.lstWorkerCompensationInsurance;
		}
		if (this.dta) {
			this.fieldConfig[0].children[1].children[1].classes.push('hidden');
			this.fieldConfig[0].children[1].children[2].classes.push('hidden');
			this.fieldConfig[0].children[1].children[3].classes.push('hidden');
			this.fieldConfig[0].children[1].children[4].classes.push('hidden');
		}
	}
	setDoctorForm() {
		this.doctorForm = this.fb.group({
			id: null,
			first_name: ['', [Validators.required]],
			middle_name: [''],
			last_name: ['', [Validators.required]],
			city: [''],
			apartment: [''],
			state: '',
			zip: [''],
			street: [''],
			caseId: this.caseId,
			patientId: this.patientId,
		});
	}

	/**
	 * submit Form
	 * @param form
	 */
	
	onSubmit(form) {

		let medical_treatment_information = this.form.get('medical_treatment') as FormGroup;
		this.isDateOfTreatedOnSite(medical_treatment_information);
		if (this.form.valid) {
			let contact_information = medical_treatment_information.get(
				'contact_information',
			) as FormGroup;
			if(medical_treatment_information?.value?.treated_on_site === 0 && medical_treatment_information?.value?.treated_off_site === 0){
				this.toastrService.error("Please choose 'Yes' for at least one of the questions. 'Were you treated on site?' or 'Were you treated off site?' You cannot select 'No' for both.", 'Error');
				return;
			}
			let id = medical_treatment_information.get('id').value as FormGroup;
			if (this.allDoctorRows.length > 0) {
				this.currentDoctorRows = this.allDoctorRows.filter((res) => res.type == this.currentTitle);
				this.prevtDoctorRows = this.allDoctorRows.filter((res) => res.type == this.previousTitle);
			}
			contact_information.patchValue({
				current_treated_by: {
					data: this.currentDoctorRows,
					is_deleted: this.currentDoctorRows.length > 0 ? false : true,
				},
				previous_treated_by: {
					data: this.prevtDoctorRows,
					is_deleted: this.prevtDoctorRows.length > 0 ? false : true,
				},
			});
			contact_information = contact_information;
			this.disableBtn = true;
			if(form && form.medical_treatment&& form.medical_treatment.first_off_site_treatment_location!="doctor_office")
			{
				this.setHospitalObject();
			}
			
			if (id == null) {
				this.add(this.form.value);
			} else {
				this.update(this.form.value);
			}
		} else {
			debugger;
			this.fd_services.touchAllFields(this.form);
		}
	};
	setHospitalObject() {
			let medical_treatment_form = this.form.controls['medical_treatment'] as FormGroup
			let hospital_form = medical_treatment_form.controls['hospital'] as FormGroup
			let obj = hospital_form.value;
			obj['name'] = this.isNewHospitalIDString() ? hospital_form.controls['id'].value : null
			obj['id'] =  this.isNewHospitalIDString() ? null : this.hospitalAddress.controls['id'].value
			this.form.value && this.form.value.medical_treatment && this.form.value.medical_treatment.hospital ? this.form.value.medical_treatment.hospital == obj : this.form.value.medical_treatment.hospital
	}
	setHospitalIDWhenAddNew() {
		if(this.isNewHospitalIDString()) {
			let medical_treatment_form = this.form.controls['medical_treatment'] as FormGroup
			let hospital_form = medical_treatment_form.controls['hospital'] as FormGroup
			hospital_form.controls['id'].setValue(null);
		}
	}
	isNewHospitalIDString() {
		let medical_treatment_form = this.form.controls['medical_treatment'] as FormGroup
		let hospital_form = medical_treatment_form.controls['hospital'] as FormGroup
		let type = typeof hospital_form.controls['id'].value;
		if(type == 'string') {
			return true;
		} 
		return false;
	}
	/**
	 * Submit current doctor
	 * @param form
	 */
	submit(form) {
		if (this.doctorForm.valid) {
			this.disableBtn = true;
			if (this.ProviderTitle == 'Add') {
				form.type == this.currentTitle ? this.addDoctor(form) : this.addprevDoctor(form);
			} else {
				form.type == this.currentTitle ? this.updateDoctor(form) : this.updateprevDoctor(form);
			}
		} else {
			this.fd_services.touchAllFields(this.doctorForm);
		}
	}
	/**
	 * add current doctor's new record in Array
	 * @param form
	 */
	addDoctor(form) {
		this.currentDoctorRows = [...this.currentDoctorRows, form];
		this.allDoctorRows = [...this.allDoctorRows, form];
		if (this.form) {
			this.modalRef.close();
		}
	}
	/**
	 * update current doctor's record in Array
	 * @param form
	 */
	updateDoctor(form) {
		this.allDoctorRows[this.index] = form;
		this.allDoctorRows = [...this.allDoctorRows];

		this.modalRef.close();
		this.index = null;
		this.prevIndex = null;
	}
	/**
	 * add Previous doctor's new record in Array
	 * @param form
	 */
	addprevDoctor(form) {
		this.prevtDoctorRows = [...this.prevtDoctorRows, form];
		this.allDoctorRows = [...this.allDoctorRows, form];
		if (this.form) {
			this.modalRef.close();
		}
	}
	/**
	 * update Previous doctor's record in Array
	 * @param form
	 */
	updateprevDoctor(form) {
		this.allDoctorRows[this.index] = form;
		this.allDoctorRows = [...this.allDoctorRows];

		this.modalRef.close();
		this.prevIndex = null;
		this.index = null;
	}
	/**
	 * assign all data to doctors
	 */
	getAllDoctorsData() {
		this.allDoctorRows = [];
		this.allDoctorRows = [...this.prevtDoctorRows, ...this.currentDoctorRows];
	}
	/**
	 * Onsubmit Previous doctor
	 * @param form
	 */
	onSubmitDoctorForm(form) {
		this.logger.log('doctorform treatment General', form);
		if (this.doctorPrevForm.valid) {
			this.disableBtn = true;
			this.logger.log('form is valid');

			if (this.ProviderTitle == 'Add') {
				this.addprevDoctor(form);
			} else {
				this.updateprevDoctor(form);
			}
		} else {
			this.logger.log('form is invalid');
			this.fd_services.touchAllFields(this.form);
		}
	}

	getMedData(callback?) {
		this.subscription.push(
			this.caseFlowService.getCase(this.caseId).subscribe((res) => {
				callback ? callback() : null
			}),
		);
	}
	/**
	 * Add record
	 * @param form
	 */
	add(form) {
		this.subscription.push(
			this.caseFlowService.updateCase(this.caseId, form).subscribe(
				(res) => {
					this.disableBtn = false;
					this.form.markAsUntouched();
					this.form.markAsPristine();
					this.medical_treatment = res['data'];
					this.getMedData(callback => {
						this.goForward();
					})
					this.toastrService.success(' Successfully Added', 'Success');
				},
				(err) => {
					this.disableBtn = false;
					this.toastrService.error(err.error, 'Error');
				},
			),
		);
	}
	/**
	 * Update record
	 * @param form
	 */
	update(form) {
		this.subscription.push(
			this.caseFlowService.updateCase(this.caseId, form).subscribe(
				(res) => {
					this.disableBtn = false;
					this.form.markAsUntouched();
					this.form.markAsPristine();
					this.getMedData(callback => {
						this.goForward();
					})
					this.toastrService.success(' Successfully Updated', 'Success');
				},
				(err) => {
					this.disableBtn = false;
					this.toastrService.error(err.error.error.message, 'Error');
				},
			),
		);
	}
	/**
	 * populate Address
	 * @param address
	 * @param isDoctor
	 * @param isPrvDoctor
	 */
	public handleAddressChange(address: Address, isDoctor?: boolean) {
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
			if (isDoctor) {
				this.mailAddress.patchValue({
					street: address,
					city: city.long_name,
					state: state.long_name,
					zip: postal_code.long_name,
				});
			} else {
				this.hospitalAddress.patchValue(
					{
						id: this.isNewHospitalIDString() ? this.hospitalAddress.controls['id'].value : null,
						street_address: address,
						city: city.long_name,
						state: state.long_name,
						zip: postal_code.long_name,
						lat: lat,
						long: lng,
					},
					{ emitEvent: false },
				);
			}
		} else {
			this.mailAddress.reset({}, { emitEvent: false });
			this.hospitalAddress.patchValue(
				{
					id: null,
					street_address: '',
					city: '',
					state: '',
					zip: '',
					lat: '',
					long: '',
				},
				{ emitEvent: false },
			);
		}
	}

	/**
	 * set current doctor value for edit
	 */
	setDoctorFormValues() {
		let mailaddress = this.doctorForm.get('mail_address') as FormGroup;
		this.doctorForm.patchValue({
			first_name: this.doctorInfo.first_name,
			middle_name: this.doctorInfo.middle_name,
			last_name: this.doctorInfo.last_name,
			type: this.doctorInfo.type ? this.doctorInfo.type : null,
		});
		if (this.doctorInfo.mail_address) {
			mailaddress.patchValue(this.doctorInfo.mail_address);
		}
		this.fd_services.touchAllFields(this.doctorForm);
	}
	/**
	 * set previous doctor value for edit
	 */
	setPrevDoctorFormValues() {
		let prev_treated_by = this.doctorPrevForm.get('previous_treated_by') as FormGroup;
		let mailaddress = prev_treated_by.get('mail_address') as FormGroup;
		prev_treated_by.patchValue({
			first_name: this.doctorInfo.first_name,
			middle_name: this.doctorInfo.middle_name,
			last_name: this.doctorInfo.last_name,
		});
		if (this.doctorInfo.mail_address) {
			delete this.doctorInfo.mail_address.id;
			mailaddress.patchValue(this.doctorInfo.mail_address);
		}
	}

	save() {
		this.formSubmit = true;
	}
	/**
	 * navigate to previous screen
	 */
	goBack() {
		this.location.back();
	}
	/**
	 * move to next tab
	 */
	goForward() {
		this.caseFlowService.goToNextStep();
	}
	/**
	 * Doctor Model
	 */
	addDoctorModal = (content, doctor?: any, rowIndex?: any, docType?: string): void => {
		if(!this.formSubmit) {
			let ngbModalOptions: NgbModalOptions = {
				backdrop: 'static',
				keyboard: false,
				size: 'lg',
				windowClass: 'modal_extraDOc',
			};
			docType ? (this.docTitle = docType) : (this.docTitle = '');
			this.hideModalDropdown();
			if (doctor) {
				this.doctorInfo = doctor;
				this.ProviderTitle = 'Edit';
				this.index = rowIndex;
				this.prevIndex = rowIndex;
			} else {
				this.ProviderTitle = 'Add';
			}
			this.modalRef = this.modalService.open(content, ngbModalOptions);
		}
	};
	/**
	 * hide type field in case of edit
	 */
	hideModalDropdown() {
		this.ProviderTitle == 'Edit' ||
		this.docTitle == this.previousTitle ||
		this.docTitle == this.currentTitle
			? getFieldControlByName(this.modalFieldConfig, 'type').classes.push('hidden')
			: (getFieldControlByName(this.modalFieldConfig, 'type').classes = getFieldControlByName(
					this.modalFieldConfig,
					'type',
			  ).classes.filter((className) => className != 'hidden'));
	}
	/**
	 * to enable form
	 *
	 */
	enableForm() {
		let buttonDiv = getFieldControlByName(this.fieldConfig, 'button-div');
		if (this.form.disabled) {
			this.form.enable();
			buttonDiv.classes = buttonDiv.classes.filter((className) => className != 'hidden');
		} else {
			this.form.disable();
			buttonDiv.classes.push('hidden');
		}
	}
	/**
	 * to disable form
	 */
	disableForm() {
		this.form.disable({
			onlySelf: true,
			emitEvent: false,
		});
		this.formEnabled = false;
		this.enableflag = true;
		this.hideButtons();
	}
	enableDoctorForm() {
		this.doctorForm.enable();
		this.doctorFormEnabled = true;
	}

	/**
	 * hide save or back button
	 */
	hideButtons() {
		this.form.disabled
			? this.fieldConfig[1].classes.push('hidden')
			: (this.fieldConfig[1].classes = this.fieldConfig[1].classes.filter(
					(className) => className != 'hidden',
			  ));
	}
	/**
	 * delete doc record
	 * @param deleteTitle
	 * @param id
	 */
	deleteSelected(deleteTitle, rowIndex?: number) {
		let ids: any = [];
		let medical_treatment_information = this.form.get('medical_treatment') as FormGroup;
		if (deleteTitle == this.currentTitle) {
			if (rowIndex != null) {
				this.currentDoctorRows.splice(this.currentDoctorRows.indexOf(1), 1);
				this.allDoctorRows = this.allDoctorRows.filter((doc, index) => index != rowIndex);
				this.allDoctorRows = [...this.allDoctorRows];
				if (this.currentDoctorRows.length == 0) {
					medical_treatment_information.patchValue(
						{ injury_still_treated: 0 },
						{ emitEvent: false },
					);
				}
			} else {
				this.allDoctorRows = this.allDoctorRows.filter((res) => res.type != this.currentTitle);
				this.allDoctorRows = [...this.allDoctorRows];
				this.currentDoctorRows = [];
			}
		}
		if (deleteTitle == this.previousTitle) {
			if (rowIndex != null) {
				this.prevtDoctorRows.splice(this.prevtDoctorRows.indexOf(1), 1);
				this.allDoctorRows = this.allDoctorRows.filter((doc, index) => index != rowIndex);
				this.allDoctorRows = [...this.allDoctorRows];
				if (this.prevtDoctorRows.length == 0) {
					medical_treatment_information.patchValue({ were_you_treated: 0 }, { emitEvent: false });
				}
			} else {
				this.allDoctorRows = this.allDoctorRows.filter((res) => res.type != this.previousTitle);
				this.allDoctorRows = [...this.allDoctorRows];
				this.prevtDoctorRows = [];
			}
		}
	}
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.allDoctorRows.length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle(event) {
		this.isAllSelected()
			? this.selection.clear()
			: this.allDoctorRows.forEach((row) => this.selection.select(row));
	}
	/**
	 * delete doc record confirmation
	 * @param deleteTitle
	 * @param id
	 */
	confirmDel(deleteTitle, rowIndex?: number) {
		this.customDiallogService.confirm('Delete Confirmation?', 'Do you really want to delete it.','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				this.loadSpin = true;
				this.deleteSelected(deleteTitle, rowIndex);
				this.loadSpin = false;
			}else{
				let medical_treatment_information = this.form.get('medical_treatment') as FormGroup;
						deleteTitle == this.currentTitle
							? medical_treatment_information.patchValue(
									{ injury_still_treated: 1 },
									{ emitEvent: false },
							  )
							: '';
						deleteTitle == this.currentTitle
							? medical_treatment_information.patchValue({ have_any_first_treatment: 1 })
							: '';
						deleteTitle == this.previousTitle
							? medical_treatment_information.patchValue(
									{ were_you_treated: 1 },
									{ emitEvent: false },
							  )
							: '';
						deleteTitle == this.previousTitle
							? medical_treatment_information.patchValue({ same_injury_body_part: 1 })
							: '';
			}
		})
		.catch();
	}
	/**
	 * Delete all doctor Record
	 */
	deleteAllDoctors() {
		this.customDiallogService.confirm('Delete Confirmation?', 'Do you really want to delete all records.','Yes','No')
		.then((confirmed) => {
			
		if (confirmed) {
        this.loadSpin = true;
        this.prevtDoctorRows = [];
        this.currentDoctorRows = [];
        this.allDoctorRows = [];
        let medical_treatment_information = this.form.get(
          'medical_treatment'
        ) as FormGroup;
        medical_treatment_information.patchValue(
          { injury_still_treated: 0 },
          { emitEvent: false }
        );
        medical_treatment_information.patchValue(
          { were_you_treated: 0 },
          { emitEvent: false }
        );
        this.loadSpin = false;
      }
		})
		.catch();
	}
	stringfy(obj) {
		return JSON.stringify(obj);
	}
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
		this.caseFlowService.removeScrollClasses();
		this.logger.log('medical-treatment-form OnDestroy Called');
	}
	/**
	 * All show and hide conditions
	 * @param res
	 */
	firstTreatmentfields(res?) {
		let firstTreatmentval;
		let medical_treatment_information = this.form.get('medical_treatment') as FormGroup;
		let treated_on_site = medical_treatment_information.get('treated_on_site').value as any;
		let treated_off_site = medical_treatment_information.get('treated_off_site').value as number;
		let same_injury = this.fieldConfig[0].children[0].children[9].values as number;
		if (res != undefined) {
			firstTreatmentval = res;
		} else {
			firstTreatmentval = medical_treatment_information.get('have_any_first_treatment').value;
		}
		firstTreatmentval == 0 || firstTreatmentval == null
			? getFieldControlByName(this.fieldConfig, 'injury_still_treated').classes.push('hidden')
			: (getFieldControlByName(
					this.fieldConfig,
					'injury_still_treated',
			  ).classes = getFieldControlByName(this.fieldConfig, 'injury_still_treated').classes.filter(
					(className) => className != 'hidden',
			  ));

		firstTreatmentval == 0 || firstTreatmentval == null
			? this.fieldConfig[0].children[0].children[1].classes.push('hidden')
			: (this.fieldConfig[0].children[0].children[1].classes = this.fieldConfig[0].children[0].children[1].classes.filter(
					(className) => className != 'hidden',
			  ));
		firstTreatmentval == 0 || firstTreatmentval == null
			? getFieldControlByName(this.fieldConfig, 'date_of_first_treatment').classes.push('hidden')
			: (getFieldControlByName(
					this.fieldConfig,
					'date_of_first_treatment',
			  ).classes = getFieldControlByName(
					this.fieldConfig,
					'date_of_first_treatment',
			  ).classes.filter((className) => className != 'hidden'));
		firstTreatmentval == 0 || firstTreatmentval == null
			? getFieldControlByName(this.fieldConfig, 'treated_on_site').classes.push('hidden')
			: (getFieldControlByName(this.fieldConfig, 'treated_on_site').classes = getFieldControlByName(
					this.fieldConfig,
					'treated_on_site',
			  ).classes.filter((className) => className != 'hidden'));
		firstTreatmentval == 0 || firstTreatmentval == null
			? getFieldControlByName(this.fieldConfig, 'first_off_site_treatment_location').classes.push(
					'hidden',
			  )
			: (getFieldControlByName(
					this.fieldConfig,
					'first_off_site_treatment_location',
			  ).classes = getFieldControlByName(
					this.fieldConfig,
					'first_off_site_treatment_location',
			  ).classes.filter((className) => className != 'hidden'));
		firstTreatmentval == 0 || firstTreatmentval == null
			? this.fieldConfig[0].children[0].children[7].classes.push('hidden')
			: (this.fieldConfig[0].children[0].children[7].classes = this.fieldConfig[0].children[0].children[7].classes.filter(
					(className) => className != 'hidden',
			  ));
		firstTreatmentval == 0 || firstTreatmentval == null
			? getFieldControlByName(this.fieldConfig, 'treated_on_site_date').classes.push('hidden')
			: treated_on_site == 0 || treated_on_site == '' || treated_on_site == null
			? getFieldControlByName(this.fieldConfig, 'treated_on_site_date').classes.push('hidden')
			: (getFieldControlByName(
					this.fieldConfig,
					'treated_on_site_date',
			  ).classes = getFieldControlByName(this.fieldConfig, 'treated_on_site_date').classes.filter(
					(className) => className != 'hidden',
			  ));
		firstTreatmentval == 0 || firstTreatmentval == null
			? getFieldControlByName(this.fieldConfig, 'treated_off_site').classes.push('hidden')
			: (getFieldControlByName(
					this.fieldConfig,
					'treated_off_site',
			  ).classes = getFieldControlByName(this.fieldConfig, 'treated_off_site').classes.filter(
					(className) => className != 'hidden',
			  ));
		firstTreatmentval == 0 || firstTreatmentval == null
			? ''
			: this.treatedOffSiteFildes(treated_off_site);
		firstTreatmentval == 0 || firstTreatmentval == null ? this.reSetfirstTreatmentval() : '';
	}
	reSetfirstTreatmentval() {
		let medical_treatment_information = this.form.get('medical_treatment') as FormGroup;
		medical_treatment_information.get('date_of_first_treatment').setValue(null);
		medical_treatment_information.get('treated_on_site').setValue(null);
		medical_treatment_information.get('date_of_admission').setValue(null);
		medical_treatment_information.get('first_off_site_treatment_location').setValue(null);
		medical_treatment_information.get('treated_on_site_date').setValue(null);
		medical_treatment_information.get('treated_off_site').setValue(null);
		medical_treatment_information.get('injury_still_treated').setValue(null);
	}
	first_Treatment_Changes_Detection() {
		let medical_treatment_information = this.form.get('medical_treatment') as FormGroup;
		this.subscription.push(
			medical_treatment_information
				.get('have_any_first_treatment')
				.valueChanges.subscribe((res) => {
					this.firstTreatmentfields(res);
				}),
		);
	}
	treatedOnSiteFildes(res?) {
		let medical_treatment_information = this.form.get('medical_treatment') as FormGroup;
		let treatedonsite;
		if (res != undefined) {
			treatedonsite = res;
		} else {
			treatedonsite = getFieldControlByName(this.fieldConfig, 'treated_on_site').values;
		}
		if (treatedonsite == 0 || treatedonsite == '' || treatedonsite == null) {
			getFieldControlByName(this.fieldConfig, 'treated_on_site_date').classes.push('hidden');
			medical_treatment_information.get('treated_on_site_date').setValue(null);
		} else
			getFieldControlByName(
				this.fieldConfig,
				'treated_on_site_date',
			).classes = getFieldControlByName(this.fieldConfig, 'treated_on_site_date').classes.filter(
				(className) => className != 'hidden',
			);
			this.isDateOfTreatedOnSite(medical_treatment_information);
	}

	isDateOfTreatedOnSite(event) {
		let medical_treatment_information = this.form.get('medical_treatment') as FormGroup;
			if(WithoutTime(new Date(event.controls['treated_on_site_date'].value)) > WithoutTime(new Date)) {
				medical_treatment_information.controls['treated_on_site_date'].setErrors({max_date:true});
			} else {
				medical_treatment_information.controls['treated_on_site_date'].setErrors(null);
			}
			if(!event.controls['treated_on_site_date'].value) {
				medical_treatment_information.controls['treated_on_site_date'].setErrors({required:true});
			}

	}

	treatedOnSite_Changes_Detection() {
		let medical_treatment_information = this.form.get('medical_treatment') as FormGroup;
		this.subscription.push(
			medical_treatment_information.get('treated_on_site').valueChanges.subscribe((res) => {
				this.treatedOnSiteFildes(res);
			}),
		);
	}
	treatedOffSiteFildes(res?) {
		let medical_treatment_information = this.form.get('medical_treatment') as FormGroup;
		let hospitals = medical_treatment_information.get('hospital') as FormGroup;
		let treatedonsite;
		if (res != undefined) {
			treatedonsite = res;
		} else {
			treatedonsite = getFieldControlByName(this.fieldConfig, 'treated_off_site').values;
		}
		treatedonsite == 0 || treatedonsite == null
			? medical_treatment_information.get('date_of_admission').setValue(null)
			: '';
		treatedonsite == 0 || treatedonsite == null
			? medical_treatment_information.get('first_off_site_treatment_location').setValue(null)
			: '';
		treatedonsite == 0 || treatedonsite == null ? hospitals.reset({}, { emitEvent: false }) : '';
		treatedonsite == 0 || treatedonsite == null
			? getFieldControlByName(this.fieldConfig, 'first_off_site_treatment_location').classes.push(
					'hidden',
			  )
			: (getFieldControlByName(
					this.fieldConfig,
					'first_off_site_treatment_location',
			  ).classes = getFieldControlByName(
					this.fieldConfig,
					'first_off_site_treatment_location',
			  ).classes.filter((className) => className != 'hidden'));
		treatedonsite == 0 || treatedonsite == null
			? this.fieldConfig[0].children[0].children[7].classes.push('hidden')
			: '';
	}
	treatedOffSite_Changes_Detection() {
		let medical_treatment_information = this.form.get('medical_treatment') as FormGroup;
		this.subscription.push(
			medical_treatment_information.get('treated_off_site').valueChanges.subscribe((res) => {
				this.treatedOffSiteFildes(res);
			}),
		);
	}
	treatmentoffsitevalue: string;
	offSiteTreatmentFildes(res?) {
		let treatedoffnsite;
		let hospital_control = getFieldControlByName(this.fieldConfig, 'hospital');
		let date_of_admission_control = getFieldControlByName(this.fieldConfig, 'date_of_admission');
		let doc_control = getFieldControlByName(this.fieldConfig, 'name');
		if (res != '') {
			treatedoffnsite = res;
		} else {
			treatedoffnsite = getFieldControlByName(this.fieldConfig, 'first_off_site_treatment_location')
				.values;
		}
		this.treatmentoffsitevalue = treatedoffnsite;
		treatedoffnsite == 'none' || treatedoffnsite == null || treatedoffnsite == ''
			? this.fieldConfig[0].children[0].children[7].classes.push('hidden')
			: (this.fieldConfig[0].children[0].children[7].classes = this.fieldConfig[0].children[0].children[7].classes.filter(
					(className) => className != 'hidden',
			  ));
		treatedoffnsite == 'none' || treatedoffnsite == null || treatedoffnsite == ''
			? hospital_control.classes.push('hidden')
			: (hospital_control.classes = hospital_control.classes.filter(
					(className) => className != 'hidden',
			  ));
		treatedoffnsite == 'none' || treatedoffnsite == null || treatedoffnsite == ''
			? date_of_admission_control.classes.push('hidden')
			: (date_of_admission_control.classes = date_of_admission_control.classes.filter(
					(className) => className != 'hidden',
			  ));

		let medical_treatment_information = this.form.get('medical_treatment') as FormGroup;
		let hospitals = medical_treatment_information.get('hospital') as FormGroup;
		treatedoffnsite == 'none' ? hospitals.reset({}, { emitEvent: false }) : '';
		treatedoffnsite == 'none'
			? medical_treatment_information.get('date_of_admission').setValue(null)
			: '';

		treatedoffnsite == 'doctor_office'
			? (doc_control.classes = doc_control.classes.filter((className) => className != 'hidden'))
			: doc_control.classes.push('hidden');
		treatedoffnsite == 'doctor_office'
			? this.fieldConfig[0].children[0].children[7].children[1].children[1].classes.push('hidden')
			: (this.fieldConfig[0].children[0].children[7].children[1].children[1].classes = this.fieldConfig[0].children[0].children[7].children[1].children[1].classes.filter(
					(className) => className != 'hidden',
			  ));
	
		treatedoffnsite == 'doctor_office' ? hospitals.reset({}, { emitEvent: false }) : '';
		treatedoffnsite == 'doctor_office' ? this.hospitalAddress.enable() : '';
		treatedoffnsite == 'doctor_office'
			? medical_treatment_information.get('date_of_admission').setValue(null)
			: '';

		treatedoffnsite != 'doctor_office' &&
		treatedoffnsite != 'none' &&
		this.hospitalAddress.get('apartment').disabled
			? ''
			: hospitals.reset({}, { emitEvent: false });
		treatedoffnsite != 'doctor_office' &&
		treatedoffnsite != 'none' &&
		this.hospitalAddress.get('apartment').disabled
			? ''
			: medical_treatment_information.get('date_of_admission').setValue(null);
		treatedoffnsite == 'doctor_office' || treatedoffnsite == 'none'
			? ''
			: this.disbaleHospitalForm();

		if (treatedoffnsite != 'none' && treatedoffnsite != '' && treatedoffnsite != null)
			this.checkfirstTreatmentval();
	}
	checkfirstTreatmentval() {
		let medical_treatment_information = this.form.get('medical_treatment') as FormGroup;
		let have_any_first_treatment = medical_treatment_information.get('have_any_first_treatment')
			.value as number;

		have_any_first_treatment == 0 || have_any_first_treatment == null
			? getFieldControlByName(this.fieldConfig, 'hospital').classes.push('hidden')
			: (getFieldControlByName(this.fieldConfig, 'hospital').classes = getFieldControlByName(
					this.fieldConfig,
					'hospital',
			  ).classes.filter((className) => className != 'hidden'));
		have_any_first_treatment == 0 || have_any_first_treatment == null
			? getFieldControlByName(this.fieldConfig, 'date_of_admission').classes.push('hidden')
			: (getFieldControlByName(
					this.fieldConfig,
					'date_of_admission',
			  ).classes = getFieldControlByName(this.fieldConfig, 'date_of_admission').classes.filter(
					(className) => className != 'hidden',
			  ));
	}
	disbaleHospitalForm() {
		this.hospitalAddress.disable();
		this.hospitalAddress.get('id').enable();
		this.hospitalAddress.get('name').enable();
		this.hospitalAddress.get('street_address').disable();
		this.hospitalAddress.get('apartment').disable();
		this.hospitalAddress.get('city').disable();
		this.hospitalAddress.get('state').disable();
		this.hospitalAddress.get('zip').disable();
	}
	offSiteTreatment_Changes_Detection() {
		let medical_treatment_information = this.form.get('medical_treatment') as FormGroup;
		this.subscription.push(
			medical_treatment_information
				.get('first_off_site_treatment_location')
				.valueChanges.subscribe((res) => {
					this.offSiteTreatmentFildes(res);
				}),
		);
	}
	injury_still_treated_Detection() {
		let medical_treatment_information = this.form.get('medical_treatment') as FormGroup;
		this.subscription.push(
			medical_treatment_information.get('injury_still_treated').valueChanges.subscribe((res) => {
				if (res) this.addDoctorModal(this.modalReference, '', '', this.currentTitle);
				else {
					if (this.currentDoctorRows.length > 0 && !this.formSubmit) {
						this.confirmDel(this.currentTitle);
					}
				}
			}),
		);
	}
	rememeberOtherInjuryFildes(res?) {
		let medical_treatment_information = this.form.get('medical_treatment') as FormGroup;
		let same_injury;
		if (res != undefined) {
			same_injury = res;
		} else {
			same_injury = getFieldControlByName(this.fieldConfig, 'same_injury_body_part').values;
		}

		same_injury == 0 || same_injury == null
			? getFieldControlByName(this.fieldConfig, 'were_you_treated').classes.push('hidden')
			: (getFieldControlByName(
					this.fieldConfig,
					'were_you_treated',
			  ).classes = getFieldControlByName(this.fieldConfig, 'were_you_treated').classes.filter(
					(className) => className != 'hidden',
			  ));
		same_injury == 0 || same_injury == null
			? getFieldControlByName(this.fieldConfig, 'is_prev_injury_work_related').classes.push(
					'hidden',
			  )
			: (getFieldControlByName(
					this.fieldConfig,
					'is_prev_injury_work_related',
			  ).classes = getFieldControlByName(
					this.fieldConfig,
					'is_prev_injury_work_related',
			  ).classes.filter((className) => className != 'hidden'));
		same_injury == 0 || same_injury == null
			? medical_treatment_information.get('were_you_treated').setValue(null)
			: '';
	}
	same_injury_body_part_Detection() {
		let medical_treatment_information = this.form.get('medical_treatment') as FormGroup;
		medical_treatment_information.get('same_injury_body_part').valueChanges.subscribe((res) => {
			this.rememeberOtherInjuryFildes(res);
		});
	}
	were_you_treated_Detection() {
		let medical_treatment_information = this.form.get('medical_treatment') as FormGroup;
		this.subscription.push(
			medical_treatment_information.get('were_you_treated').valueChanges.subscribe((res) => {
				if (res) this.addDoctorModal(this.modalReference, '', '', this.previousTitle);
				else {
					if (this.prevtDoctorRows.length > 0 && !this.formSubmit) {
						this.confirmDel(this.previousTitle);
					}
				}
			}),
		);
	}
	sameEmployerFildes(res?) {
		let same_employer;
		if (res != undefined) {
			same_employer = res;
		} else {
			same_employer = getFieldControlByName(this.fieldConfig, 'is_prev_injury_work_related').values;
		}
		same_employer == 0 || same_employer == null
			? getFieldControlByName(this.fieldConfig, 'same_employer').classes.push('hidden')
			: (getFieldControlByName(this.fieldConfig, 'same_employer').classes = getFieldControlByName(
					this.fieldConfig,
					'same_employer',
			  ).classes.filter((className) => className != 'hidden'));
	}
	is_prev_injury_work_related_Detection() {
		let medical_treatment_information = this.form.get('medical_treatment') as FormGroup;
		this.subscription.push(
			medical_treatment_information
				.get('is_prev_injury_work_related')
				.valueChanges.subscribe((res) => {
					this.sameEmployerFildes(res);
				}),
		);
	}
	expenceExplanationFildes(res?) {
		let expensesDetail;
		let general_details = this.form.get('general_details') as FormGroup;
		if (res != undefined) {
			expensesDetail = res;
		} else {
			expensesDetail = getFieldControlByName(this.fieldConfig, 'other_expenses').values;
		}
		expensesDetail == 0 || expensesDetail == null
			? getFieldControlByName(this.fieldConfig, 'expense_description').classes.push('hidden')
			: (getFieldControlByName(
					this.fieldConfig,
					'expense_description',
			  ).classes = getFieldControlByName(this.fieldConfig, 'expense_description').classes.filter(
					(className) => className != 'hidden',
			  ));
		expensesDetail == 0 || expensesDetail == null
			? general_details.get('expense_description').setValue('')
			: '';
	}
	other_expenses_Detection() {
		let general_details = this.form.get('general_details') as FormGroup;
		this.subscription.push(
			general_details.get('other_expenses').valueChanges.subscribe((res) => {
				this.expenceExplanationFildes(res);
			}),
		);
	}
	injury_coveredFildes(res?) {
		let expensesDetail;
		let general_details = this.form.get('general_details') as FormGroup;
		// let injury_covered_insuranceForm = general_details.get('injury_covered_insurance') as FormGroup; by adil
		// let injurycovered = getFieldControlByName(this.fieldConfig, 'injury_covered_insurance');
		// if (res != undefined) {
		// 	expensesDetail = res;
		// } else {
		// 	// expensesDetail = getFieldControlByName(this.fieldConfig, 'injury_covered').values;// bby adil
		// }
		// expensesDetail == 0 || expensesDetail == null
		// 	? injurycovered.classes.push('hidden')
		// 	: (injurycovered.classes = injurycovered.classes.filter(
		// 			(className) => className != 'hidden',
		// 	  ));
		// expensesDetail == 0 || expensesDetail == null
		// 	? injury_covered_insuranceForm.get('id').setValue('')
		// 	: '';
	}
	injury_covered_Detection() {
		let general_details = this.form.get('general_details') as FormGroup;
		// this.subscription.push(
		// 	general_details.get('injury_covered').valueChanges.subscribe((res) => {
		// 		this.injury_coveredFildes(res);
		// 	}),
		// ); by adil
	}
	eligible_for_paymentsFildes(res?) {
		let eligible;
		let general_details = this.form.get('general_details') as FormGroup;
		let worker_compensation_insuranceForm = general_details.get(
			'worker_compensation_insurance',
		) as FormGroup;
		if (res != undefined) {
			eligible = res;
		} else {
			eligible = getFieldControlByName(this.fieldConfig, 'eligible_for_payments').values;
		}
		(eligible != 'worker_compensation' || eligible != 'worker_compensation_employer') || eligible == null
			? getFieldControlByName(this.fieldConfig, 'worker_compensation_insurance').classes.push(
					'hidden',
			  )
			: (getFieldControlByName(
					this.fieldConfig,
					'worker_compensation_insurance',
			  ).classes = getFieldControlByName(
					this.fieldConfig,
					'worker_compensation_insurance',
			  ).classes.filter((className) => className != 'hidden'));
		(eligible != 'worker_compensation' || eligible != 'worker_compensation_employer') || eligible == null
			? worker_compensation_insuranceForm.get('id').setValue('')
			: '';
	}

	is_eligible_for_payments_Detection() {
		// let general_details = this.form.get('general_details') as FormGroup;
		// // this.subscription.push(
		// 	general_details.get('show_eligibible_for_payments').valueChanges.subscribe((res) => {
		// 		// this.eligible_for_paymentsFildes(res);
		// 		let eligible = getFieldControlByName(this.fieldConfig, 'eligible_for_payments');
		// 		if (res == 1) {
		// 			eligible.classes = eligible.classes.filter((className) => className != 'hidden');
		// 		} else {
		// 			eligible.classes.push('hidden');
		// 			this.form.patchValue({ eligible_for_payments: DialogEnum.none });
		// 		}
		// 	}),
		// );
	}
	eligible_for_payments_Detection() {
		let general_details = this.form.get('general_details') as FormGroup;
		this.subscription.push(
			general_details.get('eligible_for_payments').valueChanges.subscribe((res) => {
				this.eligible_for_paymentsFildes(res);
			}),
		);
	}
	changeHospitalcall() {
		let medical_treatment_information = this.form.get('medical_treatment') as FormGroup;
		let hospitalForm = medical_treatment_information.controls['hospital'] as FormGroup;
		hospitalForm.controls['id'].valueChanges.subscribe((value) => {
			if (value) {
				let hosaddress = this.lstHospitals.filter((res) => res.id === value);
				hosaddress.length > 0 ? this.populateHopitalAddress(hosaddress[0]) : '';
			}

			if (value == null)
				this.hospitalAddress && this.treatmentoffsitevalue != 'doctor_office'
					? this.resetHopitalAddress()
					: '';
		});
	}
	/**
	 * reset hospital data
	 */
	resetHopitalAddress() {
		this.hospitalAddress.reset({}, { emitEvent: false });
	}
	/**
	 * populate hospitale address
	 */
	populateHopitalAddress(address) {
		this.hospitalAddress.patchValue(
			{
				street_address: address.street_address,
				apartment: address.apartment,
				city: address.city,
				state: address.state,
				zip: address.zip,
			},
			{ emitEvent: false },
		);
	}
	onFormReady(event) {
		this.form = event;

		if (this.caseData) {
			this.setValues();
			this.checkPurposeOfVisitSpeciality();
		}
		let medical_treatment_information = this.form.get('medical_treatment') as FormGroup;
		this.hospitalAddress = medical_treatment_information.controls['hospital'] as FormGroup;
		this.disbaleHospitalForm();
		let medical_treatmentForm = this.form.get('medical_treatment') as FormGroup;
		let general_details_form = this.form.get('general_details') as FormGroup;

		medical_treatmentForm.patchValue(
			{
				case_id: this.caseId,
			},
			{ emitEvent: false },
		);
		general_details_form.patchValue(
			{
				case_id: this.caseId,
			},
			{ emitEvent: false },
		);

		// this.disableForm();
		this.bindHospitalChange();
		this.first_Treatment_Changes_Detection();
		this.treatedOnSite_Changes_Detection();
		this.treatedOffSite_Changes_Detection();
		this.offSiteTreatment_Changes_Detection();
		this.injury_still_treated_Detection();
		this.were_you_treated_Detection();
		this.rememeberOtherInjuryFildes();
		this.same_injury_body_part_Detection();
		this.is_prev_injury_work_related_Detection();
		this.other_expenses_Detection();
		this.expenceExplanationFildes();
		this.firstTreatmentfields();
		this.sameEmployerFildes();
		// this.injury_coveredFildes();
		// this.injury_covered_Detection();
		// this.is_eligible_for_payments_Detection();
		this.eligible_for_payments_Detection();
		this.eligible_for_paymentsFildes();
		this.changeHospitalcall();
		// this.bindGeneralInsuranceChange();
		this.bindWorkerCompensateInsuranceChange();
		this.bindMedicalTreatmentHospitalNameChange();
		this.isDateOfEndMax();
		
// if(!this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_medical_treatment_edit))
// {
// 	this.component.form.disable();
// 	// this.form.disable()
// 	this.hideButtons();
// }

	}

	/**
	 * initialize form configration
	 * @param data
	 */
	setConfigration(data?) {
		this.fieldConfig = [
			new DivClass(
				[
					new DivClass(
						[
							new RadioButtonClass(
								'Have you had any treatments for this injury before?',
								'have_any_first_treatment',
								[
									{ name: 'first_treatment_true', value: 1, label: 'Yes' },
									{ name: 'first_treatment_false', value: 0, label: 'No' },
								],
								null,
								[],
								['col-md-12'],
							),
							new DivClass([], ['row'], 'What was the date of your first treatment?*'),
							new InputClass(
								'First Treatment Date (mm/dd/yyyy)',
								'date_of_first_treatment',
								InputTypes.date,
								null,
								[
									{
										name: 'required',
										message: 'This field is required',
										validator: Validators.required,
									},
								],
								'',
								['col-md-12'],
								{ max: new Date() },
							),
							new RadioButtonClass(
								'Were you treated on site? *',
								'treated_on_site',
								[
									{ name: 'true', value: 1, label: 'Yes' },
									{ name: 'false', value: 0, label: 'No' },
								],
								null,
								[
									{
										name: 'required',
										message: 'This field is required',
										validator: Validators.required,
									},
								],
								['col-md-6'],
							),
							new InputClass(
								'Date Of Treatment* (mm/dd/yyyy)',
								'treated_on_site_date',
								InputTypes.date,
								null,
								[
									{
										name: 'required',
										message: 'This field is required',
										validator: Validators.requiredTrue,
									},
								],
								'',
								['col-md-6'],
								{ max: new Date() },
							),
							new RadioButtonClass(
								'Were you treated off site? *',
								'treated_off_site',
								[
									{ name: 'treated_off_site_yes', value: 1, label: 'Yes' },
									{ name: 'treated_off_site_no', value: 0, label: 'No' },
								],
								null,
								[
									{
										name: 'required',
										message: 'This field is required',
										validator: Validators.required,
									},
								],
								['col-md-6'],
							),
							new RadioButtonClass(
								'Where did you receive your first off site medical treatment for your injury/illness? *',
								'first_off_site_treatment_location',
								[
									{
										name: 'clinic_hospital_urgent_care',
										value: 'clinic_hospital_urgent_care',
										label: 'Clinic/Hospital/Urgent Care',
									},
									{
										name: 'hospital_stay_over_24_hours',
										value: 'hospital_stay_over_24_hours',
										label: 'Hospital stay over 24 hours',
									},
									{ name: 'doctor_office', value: 'doctor_office', label: "Doctor's Office" },
									{ name: 'emergency_room', value: 'emergency_room', label: 'Emergency Room' },
									{ name: 'none', value: 'none', label: 'None' },
								],
								null,
								[
									{
										name: 'required',
										message: 'This field is required',
										validator: Validators.required,
									},
								],
								['col-md-12', 'radio-space-evenly'],
							),
							new DivClass(
								[
									new DivClass(
										[
											new InputClass(
												'Date Of Admission',
												'date_of_admission',
												InputTypes.date,
												null,
												[],
												'',
												['col-md-4'],
												{ max: new Date() },
											),
										],
										['row'],
									),
									new DivClass(
										[
											// new InputClass('Doctor Name', 'apartment', InputTypes.text, '', [], '', ['col-md-4']),
											new InputClass('Doctor Name*', 'name', InputTypes.text, '', [{name: 'required',message: 'This field is required',validator: Validators.required,}], '', [
												'col-md-4',
											]),
											new NgSelectClass("Hospital Name*", 'id', 'name', 'id', null, false, '', [{
												name: 'required',message: 'This field is required',validator: Validators.required,	
											}], '', ['col-sm-4'],[],{add_tag:true},null,null,null,this.onFocusSearchHospitalName.bind(this),null,null,this.searchHospitalName.bind(this)),
											new AddressClass(
												'Street Address',
												'street_address',
												this.handleAddressChange.bind(this),
												'',
												[],
												'',
												['col-md-4'],
											),
											// new InputClass('Street Address*', 'street', InputTypes.text, '', [{ name: 'required', message: 'This firld is required', validator: Validators.required }], '', ['col-md-4']),
											new InputClass('Suite / Floor', 'apartment', InputTypes.text, '', [], '', [
												'col-md-4',
											]),
											new InputClass('City', 'city', InputTypes.text, '', [], '', ['col-md-4']),
											new SelectClass(
												'State ',
												'state',
												this.allStates.map((res) => {
													return { name: res.name, label: res.name, value: res.name,fullName:res.fullName };
												}),
												'',
												[],
												['col-md-4'],false,false,'selectState',
											),
											// new InputClass(
											// 	'Zip',
											// 	'zip',
											// 	InputTypes.text,
											// 	data && data['zip'] ? data['zip'] : '',
											// 	[
											// 		{
											// 			name: 'minlength',
											// 			message: 'Length can not be less then 5',
											// 			validator: Validators.minLength(5),
											// 		},
											// 	],
											// 	'',
											// 	['col-md-4'],
											// 	{ mask: '00000' },
											new InputClass(
												'Zip',
												'zip',
												InputTypes.text,
												data && data['zip'] ? data['zip'] : '',
												[
													// {
													// 	name: 'minlength',
													// 	message: 'Length can not be less then 5',
													// 	validator: Validators.minLength(5),
													// },
													{name:'pattern', message:ZipFormatMessages.format_usa,validator:Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')}
												],
												'',
												['col-md-4']
												
											),
										],
										['row'],
										'',
										'',
										{ formControlName: 'hospital' },
									),
								],
								['col-12'],
								'',
								'',
								{ name: 'hospital-div' },
							),
							new RadioButtonClass(
								'Are you still being treated for this injury/illness *',
								'injury_still_treated',
								[
									{ name: 'injury_still_treated_yes', value: 1, label: 'Yes' },
									{ name: 'injury_still_treated', value: 0, label: 'No' },
								],
								null,
								[
									{
										name: 'required',
										message: 'This field is required',
										validator: Validators.required,
									},
								],
								['col-md-12'],
							),
							new RadioButtonClass(
								'Have you had another injury to the same body part, or a similar illness? *',
								'same_injury_body_part',
								[
									{ name: 'same_injury_body_part_yes', value: 1, label: 'Yes' },
									{ name: 'same_injury_body_part_no', value: 0, label: 'No' },
								],
								null,
								[
									{
										name: 'required',
										message: 'This field is required',
										validator: Validators.required,
									},
								],
								['col-md-12'],
							),
							new RadioButtonClass(
								'If yes, were you treated by a doctor? *',
								'were_you_treated',
								[
									{ name: 'were_you_treated_yes', value: 1, label: 'Yes' },
									{ name: 'were_you_treated_no', value: 0, label: 'No' },
								],
								null,
								[
									{
										name: 'required',
										message: 'This field is required',
										validator: Validators.required,
									},
								],
								['col-md-6'],
							),
							new RadioButtonClass(
								'Was this previous injury/illness work related? *',
								'is_prev_injury_work_related',
								[
									{ name: 'is_prev_injury_work_related_yes', value: 1, label: 'Yes' },
									{ name: 'is_prev_injury_work_related_no', value: 0, label: 'No' },
								],
								null,
								[
									{
										name: 'required',
										message: 'This field is required',
										validator: Validators.required,
									},
								],
								['col-md-12'],
							),
							new RadioButtonClass(
								'If yes, were you working for the same employer that you work for now *',
								'same_employer',
								[
									{ name: 'same_employer_yes', value: 1, label: 'Yes' },
									{ name: 'same_employer_no', value: 0, label: 'No' },
								],
								null,
								[
									{
										name: 'required',
										message: 'This field is required',
										validator: Validators.required,
									},
								],
								['col-md-12'],
							),
							new RadioButtonClass(
								'Have you had an independent medical examination(IME)? *',
								'had_ime',
								[
									{ name: 'had_ime_yes', value: 1, label: 'Yes' },
									{ name: 'had_ime_no', value: 0, label: 'No' },
								],
								null,
								[
									{
										name: 'required',
										message: 'This field is required',
										validator: Validators.required,
									},
								],
								['col-md-12'],
							),
							new DynamicControl('id', null),
							new DynamicControl('case_id', null),
							new DynamicControl('contact_information', ''),
						],
						['row'],
						'',
						'',
						{ formControlName: 'medical_treatment' },
					),
					new DivClass(
						[
							new DynamicControl('id', null),
							// new RadioButtonClass(
							// 	'Is your injury covered by insurance?',
							// 	'injury_covered',
							// 	[
							// 		{ name: 'injury_covered_yes', value: 1, label: 'Yes' },
							// 		{ name: 'injury_covered_no', value: 0, label: 'No' },
							// 	],
							// 	null,
							// 	[],
							// 	['col-md-6', 'col-sm-3'],
							// ),
							// new DivClass(
							// 	[
							// 		new AutoCompleteClass(
							// 			'Insurance Name',
							// 			'id',
							// 			'insurance_name',
							// 			'id',
							// 			this.SearchInsurance.bind(this),
							// 			false,
							// 			'',
							// 			[],
							// 			'',
							// 			[''],
							// 			[],
							// 			null,
							// 			this.onFocusGeneralSearchInsurance.bind(this),'',this.SearchInsurance.bind(this),
							// 		),
							// 	],
							// 	['col-12'],
							// 	'',
							// 	'',
							// 	{ formControlName: 'injury_covered_insurance' },
							// ),
							// new AutoCompleteClass('Insurance Name', 'injury_covered_insurance_id', 'name', '', this.SearchInsurance.bind(this), false, '', [], '', ['col-12']),

							new RadioButtonClass(
								'Due to this accident have you received or are you eligible for payments under any of the following',
								// 'show_eligibible_for_payments',
								// [
								// 	{ name: 'Yes', value: 1, label: 'Yes' },
								// 	{ name: 'No', value: 0, label: 'No' },
								// ],
								'eligible_for_payments',
								[
									{
										name: 'new_york_state_disability',
										value: 'new_york_state_disability',
										label: 'New York State disability',
									},
									{
										name: 'eligible_for_payments_no',
										value: 'worker_compensation',
										label: 'Worker compensation',
									},
									{
										name: 'eligible_for_payments_no',
										value: 'worker_compensation_employer',
										label: 'Worker compensation (Employer)',
									},
									{
										name: 'none',
										value: 'none',
										label: 'None',
									},
								],
								null,
								[],
								['col-md-12', 'radio-space-evenly'],
							),

							// new RadioButtonClass(
							// 	'',
							// 	'eligible_for_payments',
							// 	[
							// 		{
							// 			name: 'new_york_state_disability',
							// 			value: 'new_york_state_disability',
							// 			label: 'New York State disability',
							// 		},
							// 		{
							// 			name: 'eligible_for_payments_no',
							// 			value: 'worker_compensation',
							// 			label: 'Worker compensation',
							// 		},
							// 	],
							// 	null,
							// 	[],
							// 	['col-md-6', 'radio-space-evenly', 'hidden'],
							// ),
							// new AutoCompleteClass('Insurance Name', 'worker_compensation_insurance', 'name', '', this.SearchInsurance.bind(this), false, '', [], '', ['col-12']),
							new DivClass(
								[
									new AutoCompleteClass(
										'Insurance Name',
										'id',
										'insurance_name',
										'id',
										this.SearchWorkerCompensationInsurance.bind(this),
										false,
										'',
										[],
										'',
										[''],
										[],
										null,
										this.onFocusWorkerCompensationSearchInsurance.bind(this),'',this.SearchWorkerCompensationInsurance.bind(this)
									),
								],
								['col-6'],
								'',
								'',
								{ formControlName: 'worker_compensation_insurance' },
							),
							new InputClass(
								'$ Amount of health bills to date',
								'amount_of_bills',
								InputTypes.number,
								'',
								[
									{
										name: 'maxlength',
										message: 'maximum length should be 6',
										validator: Validators.maxLength(6),
									},
								],
								'',
								['col-md-4'],
								{ min: 0 },
							),
							new RadioButtonClass(
								'As a result of your injury, have you had any other expenses? *',
								'other_expenses',
								[
									{ name: 'other_expenses_yes', value: 1, label: 'Yes' },
									{ name: 'other_expenses_no', value: 0, label: 'No' },
								],
								null,
								[
									{
										name: 'required',
										message: 'This field is required',
										validator: Validators.required,
									},
								],
								['col-md-12'],
							),
							new InputClass(
								'Explanation and amounts of such expenses *',
								'expense_description',
								InputTypes.text,
								'',
								[
									{
										name: 'required',
										message: 'This field is required',
										validator: Validators.required,
									},
								],
								'',
								['col-md-6'],
							),
							// new RadioButtonClass('Do you remember having the same injury to the same body part? *', 'same_injury',
							// 	[{ name: 'same_injury_yes', value: 1, label: 'Yes' }, { name: 'same_injury_no', value: 0, label: 'No' }], null, [{ name: 'required', message: 'This firld is required', validator: Validators.required }], ['col-md-8']),
							new RadioButtonClass(
								'Will you have more health treatment(s)? *',
								'more_health_treatment',
								[
									{ name: 'more_health_treatment_yes', value: 1, label: 'Yes' },
									{ name: 'more_health_treatment_no', value: 0, label: 'No' },
								],
								null,
								[
									{
										name: 'required',
										message: 'This field is required',
										validator: Validators.required,
									},
								],
								['col-md-12'],
							),
						],
						['row'],
						'Genaral Details',
						'',
						{ formControlName: 'general_details', name:'GeneralDetails' },
					),
				],
				['display-content'],
				'',
				'',
			),
			new DivClass(
				[
					new ButtonClass(
						'Back',
						['btn', 'btn-primary', 'btn-block', 'mt-0 mb-3 mb-sm-0'],
						ButtonTypes.button,
						this.goBack.bind(this),
						{ icon: 'icon-left-arrow me-2', button_classes: [''] },
					),
					new ButtonClass(
						'Save & Continue',
						['btn', 'btn-success', 'btn-block', 'mt-0 mb-0'],
						ButtonTypes.submit,
						this.save.bind(this),
						{ icon: 'icon-save-continue me-2', button_classes: [''] },
					),
				],
				['row', 'form-btn', 'justify-content-center pb-3 mb-1'],
				'',
				'',
				{ name: 'button-div' },
			),
		];
	}

	lstInsurance: BillingInsuranceModel[] = [];
	lstWorkerCompensationInsurance: BillingInsuranceModel[] = [];

	checkPurposeOfVisitSpeciality() {

		if (this.form &&this.caseFlowService.case && (this.caseFlowService.case.case_type.slug === CaseTypeEnum.worker_compensation || 
			this.caseFlowService.case.case_type.slug === CaseTypeEnum.worker_compensation_employer
			|| this.caseFlowService.case.case_type.slug === CaseTypeEnum.auto_insurance) 
			&& this.caseFlowService.case.purpose_of_visit.slug === PurposeVisitSlugEnum.Speciality)
			{
				this.hideAnyFirstTreatment();
				this.hideSameInjuryBodypart();
				this.hideGeneralDetails();
			

			}
	}

	hideAnyFirstTreatment()
	{
		let elemAnyFirstTreatment = getFieldControlByName(this.fieldConfig, 'have_any_first_treatment');
		elemAnyFirstTreatment.classes = elemAnyFirstTreatment.classes.filter(className => {
				return className != "hidden"
			})
			elemAnyFirstTreatment.classes.push('hidden');
			// this.form.patchValue({
			// 	have_any_first_treatment: null,
			// 	date_of_first_treatment:null,
			// 	treated_on_site:null,
			// 	treated_on_site_date:null,
			// 	treated_off_site:null,
			// 	first_off_site_treatment_location:null,
				
			// 	date_of_admission:null,
			// 	// id
			// 	injury_still_treated:null,
			// 	were_you_treated:null,
			// 	is_prev_injury_work_related:null,
			// 	same_employer:null,
				
			// });
			let medical_treatment_information = this.form.get('medical_treatment') as FormGroup;
			medical_treatment_information.patchValue({
				have_any_first_treatment: null,
				date_of_first_treatment:null,
				treated_on_site:null,
				treated_on_site_date:null,
				treated_off_site:null,
				first_off_site_treatment_location:null,
				
				date_of_admission:null,
				// id
				injury_still_treated:null,
				were_you_treated:null,
				is_prev_injury_work_related:null,
				same_employer:null,
			})
			let hospitals = medical_treatment_information.get('hospital') as FormGroup;
			hospitals.reset();
			if(this.doctorForm)
			{
				let mailaddress = this.doctorForm.get('mail_address') as FormGroup;
				this.doctorForm.patchValue({
					first_name: null,
					middle_name: null,
					last_name: null,
					type: null,
				});
				if (this.doctorInfo.mail_address) {
					mailaddress.reset();
				}
			}
			
		
		
	}

	hideSameInjuryBodypart()
	{
		debugger
		let elemSameInjuryBodypart = getFieldControlByName(this.fieldConfig, 'same_injury_body_part');
		elemSameInjuryBodypart.classes = elemSameInjuryBodypart.classes.filter(className => {
				return className != "hidden"
			})
			elemSameInjuryBodypart.classes.push('hidden');
			let medical_treatment_information = this.form.get('medical_treatment') as FormGroup;
			medical_treatment_information.patchValue({
				same_injury_body_part: null,
				were_you_treated:null,
				is_prev_injury_work_related:null,
				same_employer:null,
				
			});
			let elemWereYouTreated = getFieldControlByName(this.fieldConfig, 'were_you_treated');
			elemWereYouTreated.classes = elemWereYouTreated.classes.filter(className => {
					return className != "hidden"
				})
				elemWereYouTreated.classes.push('hidden');

				let elemPrevInjuryWorkRelated = getFieldControlByName(this.fieldConfig, 'is_prev_injury_work_related');
				elemPrevInjuryWorkRelated.classes = elemPrevInjuryWorkRelated.classes.filter(className => {
					return className != "hidden"
				})
				elemPrevInjuryWorkRelated.classes.push('hidden');

				let elemWorkingForTheSameEmployer = getFieldControlByName(this.fieldConfig, 'same_employer');
				elemWorkingForTheSameEmployer.classes = elemWorkingForTheSameEmployer.classes.filter(className => {
					return className != "hidden"
				})
				elemWorkingForTheSameEmployer.classes.push('hidden');

	}

	hideGeneralDetails()
	{
		debugger
		let elemMoreHealthTreatment = getFieldControlByName(this.fieldConfig, 'more_health_treatment');
		elemMoreHealthTreatment.classes = elemMoreHealthTreatment.classes.filter(className => {
				return className != "hidden"
			})
			elemMoreHealthTreatment.classes.push('hidden');
			let elemGeneralDetailsDiv = getFieldControlByName(this.fieldConfig, 'GeneralDetails');
			elemGeneralDetailsDiv.classes = elemGeneralDetailsDiv.classes.filter(className => {
					return className != "hidden"
				})
				elemGeneralDetailsDiv.classes.push('hidden');
			let generailDetailsForm = this.form.get('general_details') as FormGroup;
			generailDetailsForm.patchValue({
				more_health_treatment: null,
				expense_description:null,
				other_expenses:null,
				amount_of_bills:null,
				eligible_for_payments:null,
				
			});
			let WorkerCompensationInsuranceForm=generailDetailsForm.get('worker_compensation_insurance') as FormGroup;
			WorkerCompensationInsuranceForm.reset();

			let elemEligibleForPayments = getFieldControlByName(this.fieldConfig, 'eligible_for_payments');
			elemEligibleForPayments.classes = elemEligibleForPayments.classes.filter(className => {
				return className != "hidden"
			})
			elemEligibleForPayments.classes.push('hidden');

			let elemAmountOfBills = getFieldControlByName(this.fieldConfig, 'amount_of_bills');
			elemAmountOfBills.classes = elemAmountOfBills.classes.filter(className => {
				return className != "hidden"
			})
			elemAmountOfBills.classes.push('hidden');

			let elemOtherExpenses = getFieldControlByName(this.fieldConfig, 'other_expenses');
			elemOtherExpenses.classes = elemOtherExpenses.classes.filter(className => {
				return className != "hidden"
			})
			elemOtherExpenses.classes.push('hidden');
			

			

	}


	/**
	 * serach  for insurance
	 * @param name
	 */
	SearchInsurance(name) {
		return new Observable((res) => {
			this.getInsurances(name).subscribe((data) => {
				this.lstInsurance = data['result'].data;
				res.next(this.lstInsurance);
			});
		});
	}

	

	SearchWorkerCompensationInsurance(name) {
		return new Observable((res) => {
			this.getInsurances(name).subscribe((data) => {
				this.lstWorkerCompensationInsurance = data['result'].data;
				res.next(this.lstWorkerCompensationInsurance);
			});
		});
	}

	

	bindGeneralInsuranceChange() {
		// let general_details_form = this.form.controls['general_details'] as FormGroup
		// let injury_covered_insurance_form = general_details_form.controls['injury_covered_insurance'] as FormGroup
		// this.subscription.push(
		// 	injury_covered_insurance_form.controls['id'].valueChanges.subscribe((value) => {
			
		// 		if (!value) {
				
		// 			return;
		// 		}
				
		// 	}),
		// ); by adil
	}

	bindWorkerCompensateInsuranceChange() {
		let general_details_form = this.form.controls['general_details'] as FormGroup
		let worker_compensation_insurance_form = general_details_form.controls['worker_compensation_insurance'] as FormGroup
		this.subscription.push(
			worker_compensation_insurance_form.controls['id'].valueChanges.subscribe((value) => {
				
				if (!value) {
					return
				}
			}),
		);
	}
	bindMedicalTreatmentHospitalNameChange() {
		let medical_treatment_form = this.form.controls['medical_treatment'] as FormGroup
		let hospital_form = medical_treatment_form.controls['hospital'] as FormGroup
		this.subscription.push(
			hospital_form.controls['id'].valueChanges.subscribe((value) => {
			
				if (!value) {
					
				
						// this.getHospitals().subscribe((data) => {
							
						// 	console.log(data);
						// 	this.lstHospitals = data['result'].data;
						// 	let medical_treatment_form_div = getFieldControlByName(this.fieldConfig, 'medical_treatment');
						// 	let hospital_form_div = getFieldControlByName(medical_treatment_form_div.children,'hospital')
	
						// 	let insurance_control = getFieldControlByName(hospital_form_div.children, 'id');
	
						// 	insurance_control.items = this.lstHospitals;
						// 	return;
						// });
					
						return;
					
				}
			}),
		);
	}

	onFocusGeneralSearchInsurance(name) {
		return new Observable((res) => {
			if (!this.lstInsurance.length) {
				this.getInsurances(name).subscribe((data) => {
					this.lstInsurance = data['result'].data;
					res.next(this.lstInsurance);
				});
			} else {
				res.next(this.lstInsurance);
			}
		});
	}

	onFocusWorkerCompensationSearchInsurance(name) {
		return new Observable((res) => {
			if (!this.lstWorkerCompensationInsurance.length) {
				this.getInsurances(name).subscribe((data) => {
					this.lstWorkerCompensationInsurance = data['result'].data;
					res.next(this.lstWorkerCompensationInsurance);
				});
			} else {
				res.next(this.lstWorkerCompensationInsurance);
			}
		});
	}
	/**
	 * intelience for insurance
	 * @param name
	 * @param id
	 */
	getInsurances(name?, id?) {
		let order_by;
		let order;
		if (name) {
			order_by = null;
			order = OrderEnum.ASC;
		} else {
			order_by = 'count';
			order = OrderEnum.DEC;
		}

		let paramQuery: ParamQuery = {
			order: order,
			pagination: true,
			filter: false,
			per_page: 10,
			page: 1,
			order_by: order_by,
		};
		paramQuery = removeEmptyKeysFromObject(paramQuery);
		let filter = {};
		if (id) {
			paramQuery.filter = true;
			filter['id'] = id;
		}
		if (name) {
			paramQuery.filter = true;
			filter['insurance_name'] = name;
		}
		return this.requestService.sendRequest(
			InsuranceUrlsEnum.Insurance_list_GET,
			'get',
			REQUEST_SERVERS.billing_api_url,
			{ ...paramQuery, ...filter },
		);
	}
	lstHospitals: any[] = [];
	/**
	 * serach  for hospital name
	 * @param name
	 */
	searchHospitalName(name) {
		return new Observable((res) => {
			this.getHospitals(name).subscribe((data) => {
				this.lstHospitals = data['result'].data;
				res.next(this.lstHospitals);
			});
		});
	}

	onFocusSearchHospitalName(name) {
		return new Observable((res) => {
			if (!this.lstHospitals.length) {
				this.getHospitals(name).subscribe((data) => {
					this.lstHospitals = data['result'].data;
					res.next(this.lstHospitals);
				});
			} else {
				res.next(this.lstHospitals);
			}
		});
	}

	/**
	 * intelience for hospital
	 * @param name
	 * @param id
	 */
	getHospitals(name?, id?) {
		let order_by;
		let order;
		if (name) {
			order_by = null;
			order = OrderEnum.ASC;
		} else {
			order_by = 'count';
			order = OrderEnum.DEC;
		}
		let paramQuery: ParamQuery = {
			order: order,
			pagination: false,
			dropDownFilter:true,
			filter: false,
			order_by: order_by,
		};
		paramQuery = removeEmptyKeysFromObject(paramQuery);
		let filter = {};
		if (id) {
			paramQuery.filter = true;
			filter['id'] = id;
		}
		if (name) {
			paramQuery.filter = true;
			filter['name'] = name;
		}
		return this.requestService.sendRequest('all_hospitals', 'get', REQUEST_SERVERS.fd_api_url, {
			...paramQuery,
			...filter,
		});
	}

	/***
	 * close doc Modal
	 */
	closeModal() {
		this.modalRef.close();
		let medical_treatment_information = this.form.get('medical_treatment') as FormGroup;
		if (this.currentDoctorRows.length < 1) {
			medical_treatment_information.patchValue({ injury_still_treated: 0 }, { emitEvent: false });
		}
		if (this.prevtDoctorRows.length < 1) {
			medical_treatment_information.patchValue({ were_you_treated: 0 }, { emitEvent: false });
		}
	}
	/**
	 * initialize Current doc form configrations
	 * @param data
	 */
	setModalConfigration() {
		this.modalFieldConfig = [
			new DivClass(
				[
					new SelectClass(
						'Type',
						'type',
						[
							{ name: this.previousTitle, label: this.previousTitle, value: this.previousTitle },
							{ name: this.currentTitle, label: this.currentTitle, value: this.currentTitle },
						],
						'',
						[
							{
								name: 'required',
								message: 'This Field is required',
								validator: Validators.required,
							},
						],
						['col-md-12', 'col-sm-3'],
					),
					// new DynamicControl('type', 'Current doc'),
					new InputClass(
						"Doctors's First Name *",
						'first_name',
						InputTypes.text,
						'',
						[
							{
								name: 'required',
								message: 'This field is required',
								validator: Validators.required,
							},
						],
						'',
						['col-md-4', 'col-sm-3'],
						{ title_case: true },
					),
					new InputClass(
						'Middle Name',
						'middle_name',
						InputTypes.text,
						'',
						[],
						'',
						['col-md-4', 'col-sm-3'],
						{ title_case: true },
					),
					new InputClass(
						'Last Name *',
						'last_name',
						InputTypes.text,
						'',
						[
							{
								name: 'required',
								message: 'This field is required',
								validator: Validators.required,
							},
						],
						'',
						['col-md-4', 'col-sm-3'],
						{ title_case: true },
					),
					// new InputClass("Office No", 'office_no', InputTypes.text, '', [], '', ['col-md-4', 'col-sm-3']),
					new DivClass(
						[
							new DivClass(
								[
									new AddressClass(
										'Street Address',
										'street',
										this.modalHandleAddress.bind(this),
										'',
										[],
										'',
										['col-md-6', 'col-sm-3'],
									),
									new InputClass('Suite / Floor', 'apartment', InputTypes.text, '', [], '', [
										'col-md-6',
										'col-sm-3',
									]),
									new InputClass('City', 'city', InputTypes.text, '', [], '', [
										'col-md-4',
										'col-sm-3',
									]),
									new InputClass('State', 'state', InputTypes.text, '', [], '', [
										'col-md-4',
										'col-sm-3',
									]),
									// new InputClass(
									// 	'Zip',
									// 	'zip',
									// 	InputTypes.text,
									// 	'',
									// 	[
									// 		{
									// 			name: 'minlength',
									// 			message: 'Length can not be less then 5',
									// 			validator: Validators.minLength(5),
									// 		},
									// 	],
									// 	'',
									// 	['col-md-4', 'col-sm-3'],
									// 	{ mask: '00000' },
									new InputClass(
										'Zip',
										'zip',
										InputTypes.text,
										'',
										[
											// {
											// 	name: 'minlength',
											// 	message: 'Length can not be less then 5',
											// 	validator: Validators.minLength(5),
											// },
											{name:'pattern', message:ZipFormatMessages.format_usa,validator:Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')}
										],
										'',
										['col-md-4', 'col-sm-3']
										
									),
								],
								['row'],
								'',
								'',
								{ formControlName: 'mail_address' },
							),
						],
						['col-12'],
					),
				],
				['row'],
			),

			new DivClass(
				[
					new ButtonClass(
						'Cancel',
						['btn', 'btn-primary', 'btn-block', 'mt-0 me-3'],
						ButtonTypes.button,
						this.closeModal.bind(this),
						{ button_classes: [''] },
					),
					new ButtonClass(
						'Save',
						['btn', 'btn-success', 'btn-block', 'mt-0 ms-3'],
						ButtonTypes.submit,
						null,
						{ button_classes: [''] },
					),
				],
				['row', 'modal-btn-width', 'justify-content-center'],
			),
		];
	}

	modalHandleAddress($event) {
		this.handleAddressChange($event, true);
	}

	/**
	 *current doc form changes
	 * @param event
	 */
	onReady(event) {
		if (this.ProviderTitle == 'Add') {
			this.doctorForm = event;
		} else {
			this.doctorForm = event;
			this.setDoctorFormValues();
		}
		this.mailAddress = this.doctorForm.controls['mail_address'] as FormGroup;
		this.hideModalDropdown();
		if (this.docTitle)
			this.doctorForm.patchValue({
				type: this.docTitle ? this.docTitle : null,
			});
	}
	treated_on_site_date
	isDateOfEndMax() {
		this.form;
		this.doctorForm;
		this.doctorPrevForm;

		if(this.form) {
		this.subscription.push(this.form.controls['medical_treatment'].get('date_of_first_treatment').valueChanges.subscribe((value) => {
			if(WithoutTime(new Date(value)) > WithoutTime(new Date)) {
				this.form.controls['medical_treatment'].get('date_of_first_treatment').setErrors({max_date:true});
			} else {
				this.form.controls['medical_treatment'].get('date_of_first_treatment').setErrors(null);
			}
		}))
		this.subscription.push(this.form.controls['medical_treatment'].get('treated_on_site_date').valueChanges.subscribe((value) => {
			if(WithoutTime(new Date(value)) > WithoutTime(new Date)) {
				this.form.controls['medical_treatment'].get('treated_on_site_date').setErrors({max_date:true});
			} else {
				this.form.controls['medical_treatment'].get('treated_on_site_date').setErrors(null);
			}
		}))
		this.subscription.push(this.form.controls['medical_treatment'].get('date_of_admission').valueChanges.subscribe((value) => {
			if(WithoutTime(new Date(value)) > WithoutTime(new Date)) {
				this.form.controls['medical_treatment'].get('date_of_admission').setErrors({max_date:true});
			} else {
				this.form.controls['medical_treatment'].get('date_of_admission').setErrors(null);
			}
		}))
	}
	}
	bindHospitalChange() {
		let medical_treatment_form = this.form.controls['medical_treatment'] as FormGroup
		let hospital_form = medical_treatment_form.controls['hospital'] as FormGroup
		this.subscription.push(
			hospital_form.controls['id'].valueChanges.subscribe((value) => {
				if(hospital_form.controls['id'].value && medical_treatment_form && medical_treatment_form.value.first_off_site_treatment_location!="doctor_office") {
					if(this.isNewHospitalIDString()) {
						hospital_form.controls['name'].setValue(value);
						let enabledControlNames = ['apartment','city', 'name', 'state', 'street_address','zip']
						enabledControlNames.forEach(name => { hospital_form.get(name).enable() })
					} else {
						let enabledControlNames = ['apartment','city', 'name', 'state', 'street_address','zip']
						enabledControlNames.forEach(name => { hospital_form.get(name).disable() })
					}
				}
			}),
		);
		}
}
