import {
	Component,
	OnInit,
	Input,
	ViewChild,
	ElementRef,
	OnChanges,
	SimpleChange,
	SimpleChanges,
	Output,
	EventEmitter,
	AfterViewInit,
	OnDestroy,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
import { FDServices } from '../../../../../fd_shared/services/fd-services.service';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { CanDeactivateComponentInterface } from '@appDir/shared/canDeactivateFormsComponent/CanDeactivateComponent.interface';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { RadioButtonClass } from '@appDir/shared/dynamic-form/models/RadioButtonClass.class';
import { SelectClass } from '@appDir/shared/dynamic-form/models/SelectClass.class';
import { ButtonClass } from '@appDir/shared/dynamic-form/models/ButtonClass.class';
import { ButtonTypes } from '@appDir/shared/dynamic-form/constants/ButtonTypes.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { CaseFlowUrlsEnum } from '../../../../../fd_shared/models/CaseFlowUrlsEnum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { DynamicControl } from '@appDir/shared/dynamic-form/models/DynamicControl.class';
import { getFieldControlByName } from '@appDir/shared/dynamic-form/helper';
import { CaseFlowServiceService } from '../../../../../fd_shared/services/case-flow-service.service';
import { CaseTypeEnum, CaseTypeIdEnum, PurposeVisitSlugEnum } from '../../../../../fd_shared/models/CaseTypeEnums';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';

@Component({
	selector: 'app-employment-info-form',
	templateUrl: './employment-info-form.component.html',
})
export class EmploymentInfoFormComponent implements OnChanges, CanDeactivateComponentInterface, OnDestroy {
	public form: FormGroup;
	@Input() title = 'Edit';

	public insuranceType: string = 'major medical';
	@Input() caseId: any;
	@Input() patientId: any;
	@Input() employmentInfo: any;
	@Input() case:any;
	@Output() getCase = new EventEmitter();
	@Input() caseType: any;
	@Output() submit = new EventEmitter()
	@ViewChild(DynamicFormComponent) component: DynamicFormComponent
	public contactPersonTypesId: number = 3;
	public formattedAmount: any;
	public relations: any[];
	public formEnabled: boolean = false;
	enableflag: boolean = true;
	disableBtn = false;
	fieldConfig: FieldConfig[] = []
	subscription: any[] = [];

	ngOnDestroy() {
		unSubAllPrevious(this.subscription)
	}

	constructor(
		private fb: FormBuilder,
		private logger: Logger,
		private fd_services: FDServices,
		private toastrService: ToastrService,
		private router: Router,
		private route: ActivatedRoute,
		private requestService: RequestService,
		private caseFlowService: CaseFlowServiceService
	) {
		this.setForm();
	}

	ngAfterViewInit() {
		this.form = this.component.form
		// this.form.disable();

		this.bindJobType();
		this.bindReceiveLodgin();
	}


	setFormByCaseType() {

		// if (this.caseFlowService.case && this.caseFlowService.case.case_type_id === CaseTypeIdEnum.auto_insurance) {
		// 	getFieldControlByName(this.fieldConfig, 'unemployment_benefits').classes.push('hidden')
		// }

		let course_of_employment_control = getFieldControlByName(this.fieldConfig, 'course_of_employment')
		let unemployment_benefits_control = getFieldControlByName(this.fieldConfig, 'unemployment_benefits')
		switch ( this.caseFlowService.case.case_type.slug) {
			case  CaseTypeEnum.worker_compensation:
				course_of_employment_control ? course_of_employment_control.classes.push('hidden') : null
				break;
			case  CaseTypeEnum.worker_compensation_employer:
				course_of_employment_control ? course_of_employment_control.classes.push('hidden') : null
				break;
			case  CaseTypeEnum.auto_insurance:
				course_of_employment_control ? course_of_employment_control.classes.push('hidden') : null
				unemployment_benefits_control ? unemployment_benefits_control.classes.push('hidden') : null
				break;
		}
	}
	ngOnInit() {
		
		let purposeOfVistSlug = 'speciality';
		this.fieldConfig = [
			new DivClass([
				new DynamicControl('caseId', ''),
				new DynamicControl('patientId', ''),
				new InputClass('Job Title / Description *', 'title', InputTypes.text, '', [
					{ name: 'required', message: 'This field is required', validator: Validators.required },
					{ name: 'maxlength', message: 'Maximum characters should be 20', validator: Validators.maxLength(20) }
				], '', ['col-md-6 col-lg-6']),
				new InputClass('Type of Activities *', 'activities', InputTypes.text, '', [
					{ name: 'required', message: 'This field is required', validator: Validators.required },
					{ name: 'maxlength', message: 'Maximum characters should be 200', validator: Validators.maxLength(200) }
				], '', ['col-md-6 col-lg-6']),
				new RadioButtonClass('Was your job? *', 'type', [
					{ name: "full_time", value: "full_time", label: 'Full Time' },
					{ name: "part_time", value: "part_time", label: 'Part Time' },
					{ name: "seasonal", value: "seasonal", label: 'Seasonal' },
					{ name: "volunteer", value: "volunteer", label: 'Volunteer' },
					{ name: "other", value: "other", label: 'Other' },
				], '', [
					{ name: 'required', message: 'This field is required', validator: Validators.required }
				], ['col-md-12 col-lg-12', 'radio-space-evenly']),
				// new InputClass('If Other, What?', 'type_description', InputTypes.text, '', [], '', ['col-4']),
				new InputClass('If Other, What?', 'type_description', InputTypes.text, '', [], '', ['col-md-6 col-lg-4', 'hidden']),
				new SelectClass('How often were you paid?', 'often_paid', [
					{ name: 'Hourly', label: 'Hourly', value: 'Hourly' },
					{ name: 'Daily', label: 'Daily', value: 'Daily' },
					{ name: 'Weekly', label: 'Weekly', value: 'Weekly' },
					{ name: 'BiWeekly', label: 'Bi-Weekly', value: 'Bi-Weekly' },
					{ name: 'Monthly', label: 'Monthly', value: 'Monthly' },
					{ name: 'Yearly', label: 'Yearly', value: 'Yearly' },
				], '', [], ['col-md-6 col-lg-3']),
				new InputClass('Your gross pay (before taxes) per pay period?', 'gross_salary', InputTypes.number, null, [
					{ name: 'maxlength', message: 'Max Length cannot be greater than 6', validator: Validators.maxLength(6) }
				], '', ['col-md-6 col-lg-6'], { mask: '000000', skip_validation: true }),

				new InputClass('Weekly Earning', 'weekly_earning', InputTypes.number, null, [
					{ name: 'maxlength', message: 'Max Length cannot be greater than 6', validator: Validators.maxLength(6) }
				], '', ['col-md-6 col-lg-2'], { mask: '000000', skip_validation: true }),
				new InputClass('Days/Week', 'no_of_hours_per_day', InputTypes.number, null, [
					{ name: 'max', message: 'Value cannot be greater than 7', validator: Validators.max(7) }
				], '', ['col-md-6 col-lg-2'], { mask: '0', skip_validation: true }),
				// new InputClass('Days/Week', 'no_of_hours_per_day', InputTypes.text, '', [], '', ['col-4']),
				new InputClass('Hours/Day', 'no_of_days_per_week', InputTypes.number, null, [
					{ name: 'max', message: 'Value cannot be greater than 24', validator: Validators.max(24) }
				], '', ['col-md-6 col-lg-2'], { mask: '00', skip_validation: true }),
				// new InputClass('Hours/Day', 'no_of_days_per_week', InputTypes.text, '', [], '', ['col-4']),
				new RadioButtonClass('Did you receive lodging & tips in addition to your pay?', 'receive_lodging', [
					{ name: 'yes', label: 'Yes', value: 1 },
					{ name: 'no', label: 'No', value: 0 }
				], '', [], ['col-md-12 col-lg-8']),
				new InputClass('Please describe', 'lodging_description', InputTypes.text, '', [], '', ['col-md-4', 'hidden']),
				// new RadioButtonClass('Did you loose time from work at other employments as a result of your injury? *', 'looseTimeToWork', [
				// 	{ value: 'true', label: 'Yes', name: 'yes' },
				// 	{ name: 'no', label: 'No', value: 'false' }	
				// ], '', [], ['col-8']),
				// new RadioButtonClass('At the time of your accident ,were you in the course of employment?', 'course_of_employment', [
				// 	{ name: 'yes', value: 1, label: 'Yes' },
				// 	{ name: 'no', label: 'No', value: 0 }
				// ], '', [], ['col-md-12 col-lg-8']),
				// new RadioButtonClass('Were you receiving unemployment benefits at the time of accident?', 'unemployment_benefits', [
				// 	{ name: 'yes', value: 1, label: 'Yes' },
				// 	{ name: 'no', label: 'No', value: 0 }
				// ], '', [], ['col-8']),

			], ['row']),
			new DivClass([
				// new ButtonClass('Back', ['btn', 'btn-primary', 'btn-block', 'mt-0 mb-3'], ButtonTypes.button, this.disableForm.bind(this), { icon: 'icon-left-arrow me-2' }),
				// new ButtonClass('Save & Continue', ['btn', 'btn-success', 'btn-block', 'mt-0 mb-3'], ButtonTypes.submit, null, { icon: 'icon-save-continue me-2' })
			], ['row', 'form-btn', 'justify-content-center']),
			new DynamicControl('id', '')

		]
		this.toggleBtn()
	}

	bindJobType() {
		this.subscription.push(this.form.controls['type'].valueChanges.subscribe(value => {
			let elem = getFieldControlByName(this.fieldConfig, 'type_description')
			if (value === 'other') {

				elem.classes = elem.classes.filter(className => {
					return className != "hidden"
				})
			} else {
				elem.classes.push('hidden')
			}
		}))
	}

	checkPurposeOfVisitSpeciality() {

		if (this.form &&this.caseFlowService.case && (this.caseFlowService.case.case_type.slug === CaseTypeEnum.worker_compensation || 
			this.caseFlowService.case.case_type.slug === CaseTypeEnum.worker_compensation_employer
			|| this.caseFlowService.case.case_type.slug === CaseTypeEnum.auto_insurance)
			&& this.caseFlowService.case.purpose_of_visit.slug === PurposeVisitSlugEnum.Speciality)
			{
				this.hideWasYourJob();	
				this.hideHowOftenYouPaid();	
				if(this.form &&this.caseFlowService.case && this.caseFlowService.case.case_type.slug === CaseTypeEnum.auto_insurance)
				{
					this.hideGrossSalary();
				}
				this.hideNoOfHourPerDay();	
				this.hideNoOfDaysPerWeek();	
				this.hideWeeklyEarning();	
				this.hideReceiveLodging();
			}
			else if(this.form)
			{
			
				this.hideWasYourJob(false);	
				this.hideHowOftenYouPaid(false);	
				
					this.hideGrossSalary(false);
				
				this.hideNoOfHourPerDay(false);	
				this.hideNoOfDaysPerWeek(false);	
				this.hideWeeklyEarning(false);	
				this.hideReceiveLodging(false);
			}

			
	
	}

	hideWasYourJob(show:boolean=true)
	{
		debugger;
		if(this.fieldConfig.length)
		{
			let elemWasYourJob = getFieldControlByName(this.fieldConfig, 'type');
			elemWasYourJob.classes = elemWasYourJob.classes.filter(className => {
					return className != "hidden"
				})
				if(show)
				{
					elemWasYourJob.classes.push('hidden');
					this.form.patchValue({
						type: null,
						type_description:null,
						
					});
				}
				
				// this.form.patchValue({
				// 	type: null,
				// 	type_description:null,
					
				// });
		}
		
	}
	hideHowOftenYouPaid(show:boolean=true)
	{
		if(this.fieldConfig.length)
		{
		let elemHowOftenYouPaid = getFieldControlByName(this.fieldConfig, 'often_paid');
					elemHowOftenYouPaid.classes = elemHowOftenYouPaid.classes.filter(className => {
						return className != "hidden"
					})
					if(show)
				{
					elemHowOftenYouPaid.classes.push('hidden');
					this.form.patchValue({
					
						often_paid: null,
					
					});
				}
					// this.form.patchValue({
					
					// 	often_paid: null,
					
					// });
		}		
	}

	hideGrossSalary(show:boolean=true)
	{
		if(this.fieldConfig.length)
		{
		let elemGrossSalary = getFieldControlByName(this.fieldConfig, 'gross_salary');
		elemGrossSalary.classes = elemGrossSalary.classes.filter(className => {
						return className != "hidden"
					})
					if(show)
					{
						elemGrossSalary.classes.push('hidden');
						this.form.patchValue({
					
							gross_salary: null,
						
						});

					}
					// this.form.patchValue({
					
					// 	gross_salary: null,
					
					// });
		}		
	}
	hideNoOfHourPerDay(show:boolean=true)
	{
		if(this.fieldConfig.length)
		{
		let elemNoOfHourPerDay = getFieldControlByName(this.fieldConfig, 'no_of_hours_per_day');
					elemNoOfHourPerDay.classes = elemNoOfHourPerDay.classes.filter(className => {
						return className != "hidden"
					})
					if(show)
					{
					elemNoOfHourPerDay.classes.push('hidden');
					this.form.patchValue({
					
						no_of_hours_per_day: null,
						
					});
					}
					// this.form.patchValue({
					
					// 	no_of_hours_per_day: null,
						
					// });
					
		}
	}

	hideNoOfDaysPerWeek(show:boolean=true)
	{
		if(this.fieldConfig.length)
		{
		let elemNoOfDaysPerWeek = getFieldControlByName(this.fieldConfig, 'no_of_days_per_week');
		elemNoOfDaysPerWeek.classes = elemNoOfDaysPerWeek.classes.filter(className => {
			return className != "hidden"
		})
		if(show)
		{
			elemNoOfDaysPerWeek.classes.push('hidden');
			this.form.patchValue({
		
				no_of_days_per_week: null,
				
			});
		}
		// this.form.patchValue({
		
		// 	no_of_days_per_week: null,
			
		// });
		
		}
	}
	hideWeeklyEarning(show:boolean=true)
	{
		if(this.fieldConfig.length)
		{
		let elemWeeklyEarning = getFieldControlByName(this.fieldConfig, 'weekly_earning');
		elemWeeklyEarning.classes = elemWeeklyEarning.classes.filter(className => {
						return className != "hidden"
					})
					if(show)
					{
						elemWeeklyEarning.classes.push('hidden');
						this.form.patchValue({
							weekly_earning: null,	
						});
					}
					
					// this.form.patchValue({
					// 	weekly_earning: null,	
					// });
		}
	}

	hideReceiveLodging(show:boolean=true)
	{
		if(this.fieldConfig.length)
		{
		let elemReceiveLodging = getFieldControlByName(this.fieldConfig, 'receive_lodging');
		elemReceiveLodging.classes = elemReceiveLodging.classes.filter(className => {
						return className != "hidden"
					})
					if(show)
					{
						elemReceiveLodging.classes.push('hidden');
						this.form.patchValue({
		
						receive_lodging: null,
						lodging_description:null
						
					});
					}
				
					// this.form.patchValue({
		
					// 	receive_lodging: null,
					// 	lodging_description:null
						
					// });
		}
	}

	bindReceiveLodgin() {
		if(this.fieldConfig.length)
		{
		this.subscription.push(this.form.controls['receive_lodging'].valueChanges.subscribe(value => {
			let elem = getFieldControlByName(this.fieldConfig, 'lodging_description')
			if (value === 1) {
				elem.classes = elem.classes.filter(className => {
					return className != "hidden"
				})
			} else {
				elem.classes.push('hidden')
			}
		}))
	}
	}

	ngOnChanges(changes: SimpleChanges) {
		debugger;
		if (this.employmentInfo) {
			this.form.patchValue(this.employmentInfo)

		}
		if (this.caseFlowService.case) {
			this.setFormByCaseType();
			this.checkPurposeOfVisitSpeciality();
		}
		// console.log(this.employmentInfo);
		// if (changes && changes['employmentInfo']) {
		// 	if (!this.fd_services.isEmpty(changes['employmentInfo'].currentValue)) {
		// 		this.setValues();
		// 	}
		// }

		// if (this.patientId && this.caseId) {
		// 	this.form.patchValue({
		// 		caseId: this.caseId,
		// 		patientId: this.patientId,
		// 	});
		// }

	}

	setValues(disable?: boolean) {
		this.form.patchValue({
			id: this.employmentInfo.id,
			title: this.employmentInfo.title,
			activities: this.employmentInfo.activities,
			type: this.employmentInfo.type,
			receive_lodging: this.employmentInfo.receive_lodging,
			lodging_description: this.employmentInfo.lodging_description,
			gross_salary: this.employmentInfo.gross_salary,
			often_paid: this.employmentInfo.often_paid,
			weekly_earning: this.employmentInfo.weekly_earning,
			no_of_days_per_week: this.employmentInfo.no_of_days_per_week,
			no_of_hours_per_day: this.employmentInfo.no_of_hours_per_day,
			looseTimeToWork: this.employmentInfo.looseTimeToWork,
			course_of_employment: this.employmentInfo.course_of_employment,
			unemployment_benefits: this.employmentInfo.unemployment_benefits,
			caseId: this.caseId,
			patientId: this.patientId,
			type_description: this.employmentInfo.type_description,
		});
		if (disable) {
			this.form.disable();
		}
	}

	setForm() {
		this.form = this.fb.group({
			id: null,
			title: ['', [Validators.required, Validators.maxLength(20)]],
			activities: ['', [Validators.required]],
			type: ['', [Validators.required]],
			receive_lodging: ['', [Validators.maxLength(50)]],
			lodging_description: '',
			gross_salary: [null],
			often_paid: [''],
			weekly_earning: [null],
			no_of_days_per_week: [null],
			no_of_hours_per_day: [null],
			looseTimeToWork: ['', [Validators.required]],
			course_of_employment: ['', [Validators.required]],
			unemployment_benefits: ['', [Validators.required]],
			caseId: this.caseId,
			patientId: this.patientId,
			type_description: '',
		});

		this.form.disable();
	}

	onSubmit(form) {
		// this.submit.emit(this.form.value)

	}

	add(form) {
		this.fd_services.addEmploymentInfo(form).subscribe(
			(res) => {
				debugger;
				this.disableBtn = false;
				if (res.statusCode == 200) {
					this.form.markAsUntouched();
					this.form.markAsPristine();
					this.form.disable();
					this.employmentInfo = res.data;
					this.setValues();
					this.getCase.emit();
					debugger;
					this.checkPurposeOfVisitSpeciality();
					this.toastrService.success('Successfully Updated', 'Succces');
				} else {
					this.toastrService.error(res.error.message, 'Error');
				}
			},
			(err) => {
				this.disableBtn = false;
				this.toastrService.error(err.error.error.message, 'Error');
			},
		);
	}

	update(form) {
		this.fd_services.updateEmploymentInfo(form).subscribe(
			(res) => {
				debugger;
				this.disableBtn = false;
				if (res.statusCode == 200) {
					this.form.markAsUntouched();
					this.form.markAsPristine();
					this.form.disable();
					this.getCase.emit();
					this.toastrService.success('Successfully Updated', 'Succces');
				} else {
					this.toastrService.error(res.error.message, 'Error');
				}
			},
			(err) => {
				this.disableBtn = false;
				this.toastrService.error(err.error.error.message, 'Error');
			},
		);
	}

	toggleDescriptionField(ev) {
		if (ev.target.value == 'Other') {
			this.form.controls['lodging_description'].setValidators([
				Validators.required,
				Validators.maxLength(50),
			]);
		} else {
			this.form.controls['lodging_description'].clearValidators();
		}
	}

	goBack() {
		this.router.navigate(['employer'], { relativeTo: this.route.parent.parent.parent });
	}

	addDollar(element: HTMLElement) {
		this.formattedAmount = '$' + element.nodeValue;
		element.nodeValue = this.formattedAmount;
	}

	toggleBtn() {
		this.form.disabled ? this.fieldConfig[1].classes.push('hidden') : this.fieldConfig[1].classes = this.fieldConfig[1].classes.filter(className => className != 'hidden')
	}
	// enableForm(enableflag) {
	// 	if (enableflag == false) {
	// 		this.disableForm();
	// 		return;
	// 	} else {
	// 		this.form.enable();
	// 		this.formEnabled = true;
	// 		this.enableflag = false;
	// 		if (this.fieldConfig.length > 0) { this.toggleBtn() }
	// 	}
	// }
	// disableForm() {
	// 	this.form.disable();
	// 	this.formEnabled = false;
	// 	this.enableflag = true;
	// 	if (this.fieldConfig.length > 0) { this.toggleBtn() }
	// }
	canDeactivate() {
		return (this.form.dirty);
	}
}
