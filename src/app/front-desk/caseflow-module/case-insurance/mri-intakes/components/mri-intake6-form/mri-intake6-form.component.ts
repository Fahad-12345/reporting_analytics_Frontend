import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BillingEnum } from '@appDir/front-desk/billing/billing-enum';
import { CaseModel } from '@appDir/front-desk/fd_shared/models/Case.model';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { getFieldControlByName } from '@appDir/shared/dynamic-form/helper';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { DynamicControl } from '@appDir/shared/dynamic-form/models/DynamicControl.class';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { Options } from '@appDir/shared/dynamic-form/models/options.model';
import { RadioButtonClass } from '@appDir/shared/dynamic-form/models/RadioButtonClass.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { WithoutTime } from '@appDir/shared/utils/utils.helpers';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mri-intake6-form',
  templateUrl: './mri-intake6-form.component.html',
  styleUrls: ['./mri-intake6-form.component.scss']
})
export class MriIntake6FormComponent implements OnInit , AfterViewInit, OnChanges{
  
  fieldConfig: FieldConfig[] = [];
  subscription: Subscription[] = [];
  public form: FormGroup;
  @ViewChild(DynamicFormComponent) _component: DynamicFormComponent;
  lateMenstural: any;
  masters:any[]=[];
  @Input() caseData: CaseModel;
  constructor(public CaseFlowServiceService: CaseFlowServiceService, public requestService: RequestService) { }

  ngOnInit() {
    this.setConfigration();
  }

  ngOnChanges(changes: SimpleChanges): void {
	this.form =this._component && this._component.form ? this._component.form : null;
	if (this.caseData && this.caseData.mri && this.caseData.mri.mri_intake_6) {
		setTimeout(()=>(this.form.controls['mri_intake_6'] as FormGroup).patchValue(this.caseData.mri.mri_intake_6),500);
	}
  }


  ngAfterViewInit(): void {
    this.form =this._component && this._component.form ? this._component.form : null;
    this.setFertilityMedicationListener();
    this.disableFields(true,['description'],'mri_intake_6');
    let mriIntake6FormControl=getFieldControlByName(this.fieldConfig,'mri_intake_6');
    if(this.CaseFlowServiceService.case && this.CaseFlowServiceService.case.patient && this.CaseFlowServiceService.case.patient.gender === "male"){
      mriIntake6FormControl.classes.push('hidden');
    }else{
      mriIntake6FormControl.classes = mriIntake6FormControl.classes.filter(className => className != 'hidden');
    }
	this.getMenstrualOptions();
	this.isDateOfPeriodMax();
  }

  /**
	 * form configratios
	 */
	setConfigration(data?) {
		this.fieldConfig = [
			new DivClass([
				new DynamicControl('id', null),
        new InputClass('Date Of Last Menstrual Period (MM/DD/YYYY)*', 'date_of_period', InputTypes.date, data && data['date_of_period'] ? data['date_of_period'] : null, [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-xl-3', 'col-lg-6', 'col-md-6 date-label'], { max: new Date() }),
        new RadioButtonClass('Post-Menopausal?*', 'is_post_menopausal', [{ name: 'yes', label: 'Yes', value: true }, { name: 'no', value: false, label: 'No' }], data && data['is_post_menopausal'] ? data['is_post_menopausal'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-xl-3', 'col-lg-6', 'col-md-6']),
        new RadioButtonClass('Are you pregnant or experiencing a late menstrual period?*', 'late_menstural_period_id', [], data && data['late_menstural_period_id'] ? data['late_menstural_period_id'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-xl-6', 'col-lg-12', 'col-md-12']),
        new RadioButtonClass('Are you taking oral contraceptives or receiving hormonal treatment?*', 'is_hormonal_treatment', [{ name: 'yes', label: "Yes", value: true }, { name: 'no', value: false, label: 'No' }], data && data['is_hormonal_treatment'] ? data['is_hormonal_treatment'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-xl-6', 'col-lg-12', 'col-md-12']),
        new RadioButtonClass('Are you taking any type of fertility medication or having fertility treatments?*', 'is_fertility_treatment', [{ name: 'yes', label: "Yes", value: true }, { name: 'no', value: false, label: 'No' }], data && data['is_fertility_treatment'] ? data['is_fertility_treatment'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-xl-6', 'col-lg-12', 'col-md-12']),
        new InputClass('Describe*', 'description', InputTypes.text, data && data['description'] ? data['description'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-xl-6', 'col-lg-12', 'col-md-12','hidden']),
        new RadioButtonClass('Are you currently breastfeeding?*', 'is_breastfeeding', [{ name: 'yes', label: "Yes", value: true }, { name: 'no', value: false, label: 'No' }], data && data['is_breastfeeding'] ? data['is_breastfeeding'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-xl-6', 'col-lg-12', 'col-md-12']),
			
			], ['row'], '', '', { formControlName: 'mri_intake_6' }),
		];
	}

  submit(form) {

  }

  setFertilityMedicationListener() {
		let control: RadioButtonClass = getFieldControlByName(this.fieldConfig, 'description');
		this.subscription.push(this.form.controls['mri_intake_6'].get('is_fertility_treatment').valueChanges.subscribe(value => {
			if (value === true) {
				control.classes = control.classes.filter(className => className != 'hidden');
        		this.disableFields(false,['description'],'mri_intake_6');
			} else {
				control.classes.push('hidden');
       			 this.disableFields(true,['description'],'mri_intake_6');
				(this.form.controls['mri_intake_6'] as FormGroup).patchValue(
					{
						description: null,
					},
					{ emitEvent: false },
				);
			}
		}))

	}

  disableFields(disable,disableControlNames:any[],ControlFormGroup?,controlName?)
	{
		if(disable)
		{
			if(ControlFormGroup)
			{
				let formgroup= this.form.controls[ControlFormGroup] as FormGroup
				disableControlNames.forEach(name => {
					formgroup.get(name).disable() ;
					 
					})
			}
			else
			{
				disableControlNames.forEach(name => { this.form.get(name).disable() })
			}	
		}
		else
		{
			if(ControlFormGroup)
			{
				let formgroup= (this.form.controls[ControlFormGroup])as FormGroup
				disableControlNames.forEach(name => {
					formgroup.get(name).enable() ;
					 
					})
			}
			else
			{
				disableControlNames.forEach(name => { this.form.get(name).disable() })
			}		}
		
	}

	getMenstrualOptions() {
		this.CaseFlowServiceService.getCaseMasters().subscribe(res => {
			debugger;
			let data = res['result']['data'] && res['result']['data']['menstrual_options'];
			this.masters=data? data :[];
			getFieldControlByName(this.fieldConfig, 'late_menstural_period_id').options=this.masters.map(purpose => {
				return { label: purpose.name, value: purpose.id, name: purpose.slug } as Options
			})


		});

	}
	isDateOfPeriodMax() {
		if(this.form) {
		this.subscription.push(this.form.controls['mri_intake_6'].get('date_of_period').valueChanges.subscribe((value) => {
			if(WithoutTime(new Date(value)) > WithoutTime(new Date)) {
				this.form.controls['mri_intake_6'].get('date_of_period').setErrors({max_date:true});
			} else {
				this.form.controls['mri_intake_6'].get('date_of_period').setErrors(null);
			}
		}))
	}
	}
}
