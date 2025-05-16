import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges, OnChanges, AfterViewInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
import { FDServices } from '../../../../../fd_shared/services/fd-services.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { dateFormatterMDY, dateObjectPicker, changeDateFormat, unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { RadioButtonClass } from '@appDir/shared/dynamic-form/models/RadioButtonClass.class';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { CaseModel } from '../../../../../fd_shared/models/Case.model';
import { ButtonClass } from '@appDir/shared/dynamic-form/models/ButtonClass.class';
import { ButtonTypes } from '@appDir/shared/dynamic-form/constants/ButtonTypes.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { CaseFlowUrlsEnum } from '../../../../../fd_shared/models/CaseFlowUrlsEnum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { DynamicControl } from '@appDir/shared/dynamic-form/models/DynamicControl.class';
import { getFieldControlByName } from '@appDir/shared/dynamic-form/helper';
import { CaseFlowServiceService } from '../../../../../fd_shared/services/case-flow-service.service';
import { CaseTypeEnum, PurposeVisitSlugEnum } from '@appDir/front-desk/fd_shared/models/CaseTypeEnums';

@Component({
	selector: 'app-return-to-work-form',
	templateUrl: './return-to-work-form.component.html',
})
export class ReturnToWorkFormComponent implements OnChanges {

	public form: FormGroup
	@Input() title = ''
	public insuranceType: string = 'major medical'
	@Input() caseId: any;
	@Input() patientId: any;
	@Input() caseData: CaseModel;
	@Input() accidentId: number;
	@Output() getCase = new EventEmitter();
	@ViewChild(DynamicFormComponent) component: DynamicFormComponent
	public contactPersonTypesId: number = 3
	private returnToWorkData: any;
	private supervisorData: any;
	public relations: any[];
	formEnabled: boolean = false;
	enableflag: boolean = true;
	disableBtn = false
	constructor(private fb: FormBuilder, private logger: Logger, private fd_services: FDServices, private router: Router, private toastrService: ToastrService, private route: ActivatedRoute, private requestService: RequestService, private caseFlowService: CaseFlowServiceService) {
		this.setForm()
		this.getRelations()
	}
	subscription: any[] = []

	ngOnDestroy() {
		unSubAllPrevious(this.subscription)
	}
	fieldConfig: FieldConfig[] = []

	bind_work_stop_date() {

		this.subscription.push(this.form.controls['work_stop_date'].valueChanges.subscribe(value => {
			let control = getFieldControlByName(this.fieldConfig, 'return_to_work_date')
			if (control) {
				control['configs']['min'] = value
			}
		}))
	}
	ngOnInit() {
		this.fieldConfig = [

			new DivClass([
				new RadioButtonClass('Did you stop work because of your injury/illness? *', 'work_stop', [
					{ name: 'yes', label: 'Yes', value: 1 },
					{ name: 'no', label: 'No', value: 0 }
				], '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-md-6']),
				new InputClass('On What Date?', 'work_stop_date', InputTypes.date, '', [], '', ['col-md-6', 'hidden'], { max: new Date() }),
			], ['row']),

			new DivClass([
				new RadioButtonClass('Have you returned to work? *', 'return_to_work', [
					{ name: 'yes', value: 1, label: 'Yes' },
					{ name: 'no', value: 0, label: 'No' }
				], '', [
					{ name: 'required', message: 'This field is required', validator: Validators.required }
				], ['col-md-6']),

			], ['row']),

			new DivClass([
				new InputClass('Date of Return To Work *', 'return_to_work_date', InputTypes.date, '', [
					{ name: 'required', message: 'This field is required', validator: Validators.required }
				], '', ['col-md-6'], { min: new Date() }),
				new RadioButtonClass('If you have returned to work, who are you working for now?*', 'current_employment_status', [
					{ name: "same_employer", label: 'Same Employer', value: "same_employer" },
					{ name: "new_employer", label: 'New Employer', value: "new_employer" },
					{ name: "self_employed", label: 'Self Employed', value: "self_employed" }
				], '', [
					{ name: 'required', message: 'This field is required', validator: Validators.required }
				], ['col-12 radio-space-evenly']),
				new RadioButtonClass('Type of New Assignment *', 'type_of_assignment', [
					{ name: "regular_duty", value: "regular_duty", label: 'Regular Duty' },
					{ name: "limited_duty", label: 'Limited Duty', value: "limited_duty" }
				], '', [
					{ name: 'required', message: 'This field is required', validator: Validators.required }
				], ['col-md-6 radio-space-evenly']),
			], ['row', 'hidden']),

			new DivClass([
				new RadioButtonClass('Have you given your employer(or Supervisor) notice of injury/illness? *', 'illness_notice', [
					{ name: 'yes', value: 1, label: 'Yes' },
					{ name: 'no', label: 'No', value: 0 }
				], '', [
					{ name: 'required', message: 'This field is required', validator: Validators.required }
				], ['col-md-6']),
			], ['row']),

			new DivClass([
				new DivClass([
					new DynamicControl('id', null),
					new InputClass('First Name *', 'first_name', InputTypes.text, '', [
						{ name: 'required', message: 'This field is required', validator: Validators.required }
					], '', ['col-md-4']),
					new InputClass('Middle Name', 'middle_name', InputTypes.text, '', [], '', ['col-md-4']),
					new InputClass('Last Name *', 'last_name', InputTypes.text, '', [
						{ name: 'required', message: 'This field is required', validator: Validators.required }
					], '', ['col-md-4']),

				], ['display-contents'], '', '', { formControlName: 'contact_information' }),
				new RadioButtonClass('Notice was given *', 'given_notice_type', [
					{ name: 'inWriting', value: 'in_writing', label: 'In Writing' },
					{ name: 'verbally', value: 'verbally', label: 'Verbal' }
				], '', [{ name: 'required', message: 'This field is required', validator: Validators.required }
			], ['col-md-6']),
				new InputClass('Date of Notice', 'illness_notice_date', InputTypes.date, '', [], '', ['col-md-6'], { max: new Date() })
			], ['row', 'hidden'], 'Notice Given To:'),
			new DivClass([
				// new ButtonClass('Save & Continue', ['btn', 'btn-success'], ButtonTypes.submit, null),
				// new ButtonClass('Cancel', ['btn', 'btn-primary'], ButtonTypes.button, this.enableForm.bind(this))
			], ['row'], '', '', { name: 'button-div' }),
			new DynamicControl('id', null),
		]
		// this.toggleForm();
	}
	// toggleForm() {
	//   let control = getFieldControlByName(this.fieldConfig, 'button-div')
	//   if (this.form.disabled) {
	//     this.form.enable();
	//     control.classes = control.classes.filter(className => className != 'hidden')
	//   } else {
	//     this.form.disable()
	//     control.classes.push('hidden')
	//   }
	//   // this.form.disabled ? this.fieldConfig[8].classes.push('hidden') : this.fieldConfig[8].classes = this.fieldConfig[8].classes.filter(className => className != 'hidden')
	// }


	ngAfterViewInit() {
		this.form = this.component.form;
	
		this.bindWorkStop()
		this.bindReturnToWork()
		this.bindNotice()
		this.bind_work_stop_date();
		this.setFormvalues();
		this.bind_work_stop_date()
		this.checkPurposeOfVisitSpeciality();
		
			
		

	}

	checkPurposeOfVisitSpeciality() {

		if (this.form &&this.caseFlowService.case && 
			(this.caseFlowService.case.case_type.slug === CaseTypeEnum.worker_compensation || 
				this.caseFlowService.case.case_type.slug === CaseTypeEnum.worker_compensation_employer ||
		 		this.caseFlowService.case.case_type.slug === CaseTypeEnum.auto_insurance) &&
				this.caseFlowService.case.purpose_of_visit.slug === PurposeVisitSlugEnum.Speciality)
			{
				if(this.fieldConfig.length>0)
				{
					this.hideStopWork();
					this.hideNoticeOfIllness();		
				}
			
			}
			else if(this.form)
			{
				if(this.fieldConfig.length>0)
				{
					this.hideStopWork(false);
					this.hideNoticeOfIllness(false);		
				}
			}

	}

	hideStopWork(hide:boolean=true)
	{
		
		let elemWorkStop = getFieldControlByName(this.fieldConfig, 'work_stop');
		elemWorkStop.classes = elemWorkStop.classes.filter(className => {
				return className != "hidden"
			})
			if(hide)
			{
				elemWorkStop.classes.push('hidden');
				this.form.patchValue({
				work_stop: null,
				work_stop_date:null
				
			});
			}
			
			// this.form.patchValue({
			// 	work_stop: null,
			// 	work_stop_date:null
				
			// });
	}

	hideNoticeOfIllness(hide:boolean=true)
	{
		debugger;
		let elemNoticeOfIllness = getFieldControlByName(this.fieldConfig, 'illness_notice');
		elemNoticeOfIllness.classes = elemNoticeOfIllness.classes.filter(className => {
				return className != "hidden"
			})
			if(hide)
			{
			elemNoticeOfIllness.classes.push('hidden');
			this.form.patchValue({
				illness_notice: null,
				given_notice_type:null,
				illness_notice_date:null,

				first_name:null,
				middle_name:null,
				last_name:null,
				
			});
			let contact_information= this.form.controls['contact_information'] as FormGroup;
			contact_information.reset();	
			}
			// this.form.patchValue({
			// 	illness_notice: null,
			// 	given_notice_type:null,
			// 	illness_notice_date:null,

			// 	first_name:null,
			// 	middle_name:null,
			// 	last_name:null,
				
			// });
			// let contact_information= this.form.controls['contact_information'] as FormGroup;
			// contact_information.reset();	
		}
	bindWorkStop() {
		this.subscription.push(this.form.controls['work_stop'].valueChanges.subscribe(value => {
			let elem = this.fieldConfig[0].children[1]
			if (value == 1) {
				elem.classes = elem.classes.filter(className => className != 'hidden')
			} else {
				elem.classes.push('hidden')
			}
		}))
	}

	bindReturnToWork() {
		this.subscription.push(this.form.controls['return_to_work'].valueChanges.subscribe(value => {
			let elem = this.fieldConfig[2]
			if (value == 1) {
				elem.classes = elem.classes.filter(className => className != 'hidden')
			} else {
				elem.classes.push('hidden')
			}
		}))
	}
	bindNotice() {
		this.subscription.push(this.form.controls['illness_notice'].valueChanges.subscribe(value => {
			let elem = this.fieldConfig[4]
			if (value == 1) {
				elem.classes = elem.classes.filter(className => className != 'hidden')
			} else {
				elem.classes.push('hidden')
			}
		}))
	}
	ngOnChanges(changes: SimpleChanges) {

		if (this.caseData && this.caseData.employer.return_to_work) {

			this.form.patchValue({ ...this.caseData.employer.return_to_work, contact_information: this.caseData.employer && this.caseData.employer.return_to_work && this.caseData.employer.return_to_work.contact_person ? this.caseData.employer.return_to_work.contact_person : {} },{emitEvent:true})
			this.checkPurposeOfVisitSpeciality();
		}

		// this.form.disable();
		// ;

		// if (changes && changes['caseData']) {
		//   if (!this.fd_services.isEmpty(changes['caseData'].currentValue)) {
		//     
		//     this.returnToWorkData = this.caseData.patientWorkDetails != null ? this.caseData.patientWorkDetails : null
		//     this.patientId = this.caseData.patient.id
		//     this.caseId = this.caseData.id
		//     this.supervisorData = this.caseData.accident != null ? this.caseData.accident.accidentDetails : null
		//     this.accidentId = this.caseData.accident != null ? this.caseData.accident.id : null
		//     this.setValues();
		//   }
		// }
	}

	setFormvalues() {
		if (this.caseData && this.caseData.employer.return_to_work) {

			this.form.patchValue({ ...this.caseData.employer.return_to_work, contact_information: this.caseData.employer && this.caseData.employer.return_to_work && this.caseData.employer.return_to_work.contact_person ? this.caseData.employer.return_to_work.contact_person : {} },{emitEvent:true})
		}
		// ;

		// if (changes && changes['caseData']) {
		//   if (!this.fd_services.isEmpty(changes['caseData'].currentValue)) {
		//     
		//     this.returnToWorkData = this.caseData.patientWorkDetails != null ? this.caseData.patientWorkDetails : null
		//     this.patientId = this.caseData.patient.id
		//     this.caseId = this.caseData.id
		//     this.supervisorData = this.caseData.accident != null ? this.caseData.accident.accidentDetails : null
		//     this.accidentId = this.caseData.accident != null ? this.caseData.accident.id : null
		//     this.setValues();
		//   }
		// }
	}


	setValues() {

		// if (this.returnToWorkData != null) {
		//   this.form.patchValue({
		//     id: this.returnToWorkData.id,
		//     workStop: this.returnToWorkData.workStop,
		//     workStopDate: (this.returnToWorkData.workStopDate != null && this.returnToWorkData.workStopDate != '') ? dateObjectPicker(dateFormatterMDY(this.returnToWorkData.workStopDate)) : null,
		//     returnedToWork: this.returnToWorkData.returnedToWork,
		//     returnedToWorkDate: this.returnToWorkData.returnedToWorkDate != null ? dateObjectPicker(dateFormatterMDY(this.returnToWorkData.returnedToWorkDate)) : null,
		//     employerStatusNow: this.returnToWorkData.employerStatusNow,
		//     returnedToWorkType: this.returnToWorkData.returnedToWorkType,
		//     accidentId: this.accidentId,
		//     caseId: this.caseId,
		//     patientId: this.patientId,
		//   })
		// }
		// if (this.returnToWorkData != null) {
		//   this.form.patchValue({
		//     dateOfNotice: this.returnToWorkData.dateOfNotice != null ? dateObjectPicker(dateFormatterMDY(this.returnToWorkData.dateOfNotice)) : null,
		//     notice: this.returnToWorkData.notice,
		//     noticeGivenToFirstName: this.returnToWorkData.noticeGivenToFirstName,
		//     noticeGivenToMiddleName: this.returnToWorkData.noticeGivenToMiddleName,
		//     noticeGivenToLastName: this.returnToWorkData.noticeGivenToLastName,
		//     noticeType: this.returnToWorkData.noticeType,
		//   })
		// }

	}

	getRelations() {
		this.fd_services.getRelations().subscribe(res => {
			if (res.statusCode == 200) {
				this.relations = res.data;
			}
		})
	}

	setForm() {
		this.form = this.fb.group({
			id: null,
			work_stop: ['', [Validators.required]],
			work_stop_date: '',
			return_to_work: ['', [Validators.required]],
			return_to_work_date: '',
			current_employment_status: [''],
			type_of_assignment: '',
			illness_notice_date: '',
			illness_notice: ['', [Validators.required]],
			noticeGivenToFirstName: ['', [Validators.maxLength(20)]],
			noticeGivenToMiddleName: ['', [Validators.maxLength(20)]],
			noticeGivenToLastName: ['', [Validators.maxLength(20)]],
			given_notice_type: [''],
			accidentId: [''],
			caseId: this.caseId,
			patientId: this.patientId,
		});

	}

	onSubmit(form) {
		// this.toggleForm()
		// this.caseFlowService.updateCase(this.caseId, { return_to_work: form }).subscribe(data => {
		//   console.log(data)
		//   this.toastrService.success('Successfully Updated', 'Success')
		// }, error => this.toastrService.error(error.message, 'Error'))
		// this.logger.log(form);
		// if (this.form.valid) {
		//   form.workStopDate = changeDateFormat(form.workStopDate);
		//   form.returnedToWorkDate = changeDateFormat(form.returnedToWorkDate);
		//   form.dateOfNotice = changeDateFormat(form.dateOfNotice);

		//   this.disableBtn = true
		//   this.logger.log('form is valid')
		//   if (form.id == null) {
		//     this.add(form)
		//   } else {
		//     this.update(form)
		//   }
		// } else {
		//   this.logger.log('form is invalid');
		//   this.fd_services.touchAllFields(this.form);
		// }

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
				'companyAddress': address,
				'city': city.long_name,
				'state': state.long_name,
				'zip': postal_code.long_name,
				'lat': lat,
				'lng': lng,
			})
		} else {
			this.form.patchValue({
				'companyAddress': "",
				'city': "",
				'state': "",
				'zip': "",
				'lat': "",
				'lng': "",
			})
		}
	}



	toggleStopWorkDate(value, fields) {
		this.logger.log(fields);
		for (var i = 0; i < fields.length; i++) {
			if (value) {
				this.form.controls[fields[i]].setValidators([Validators.required]);
			} else {
				this.form.controls[fields[i]].clearValidators();
				this.form.controls[fields[i]].updateValueAndValidity({ onlySelf: true, emitEvent: false });
				this.form.updateValueAndValidity()

			}
		}
	}

	goBack() {
		this.router.navigate(['injury'], { relativeTo: this.route.parent.parent.parent })
	}
	// enableForm(enableflag) {

	//   if (enableflag == false) { this.disableForm(); return; }
	//   else {
	//     this.form.enable();
	//     this.formEnabled = true;
	//     this.enableflag = false;
	//   }
	//   if (this.fieldConfig.length > 0) { this.toggleForm() }
	// }
	// disableForm() {
	//   this.form.disable();
	//   this.formEnabled = false;
	//   this.enableflag = true;
	//   if (this.fieldConfig.length > 0) { this.toggleForm() }
	// }
}
