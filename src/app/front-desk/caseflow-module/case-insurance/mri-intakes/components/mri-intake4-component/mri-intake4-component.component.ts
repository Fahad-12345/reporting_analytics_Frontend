import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CaseModel } from '@appDir/front-desk/fd_shared/models/Case.model';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { DynamicControl } from '@appDir/shared/dynamic-form/models/DynamicControl.class';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { RadioButtonClass } from '@appDir/shared/dynamic-form/models/RadioButtonClass.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mri-intake4-component',
  templateUrl: './mri-intake4-component.component.html',
  styleUrls: ['./mri-intake4-component.component.scss']
})
export class MriIntake4ComponentComponent implements OnInit ,AfterViewInit, OnChanges {
  fieldConfig: FieldConfig[] = [];
  subscription: Subscription[] = [];
  public form: FormGroup;
  @ViewChild(DynamicFormComponent) _component: DynamicFormComponent;
  @Input() caseData: CaseModel;
  constructor(public caseFlowServiceService: CaseFlowServiceService , public requestService: RequestService) { }
  ngOnChanges(changes: SimpleChanges): void {
    this.form =this._component && this._component.form ? this._component.form : null;
    if (this.caseData && this.caseData.mri && this.caseData.mri.mri_intake_4) {
      setTimeout(()=>this.form.patchValue(this.caseData.mri.mri_intake_4),500);
    }
  }
  ngAfterViewInit(): void {
    this.form =this._component && this._component.form ? this._component.form : null;
  }


  ngOnInit() {
    this.setConfigration();
  }


  /**
	 * form configratios
	 */
	setConfigration(data?) {
		this.fieldConfig = [
			new DivClass([
				new DynamicControl('id', null),
        new RadioButtonClass('Do you have history of asthma, allergic reaction, respiratory disease or reaction to a contrast medium or dye used for an MRI , CT, X-Ray examination?*', 'is_history', [{ name: 'yes', label: 'Yes', value: true }, { name: 'no', value: false, label: 'No' }], data && data['is_history'] ? data['is_history'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-xl-12', 'col-lg-12', 'col-md-12', ' ']),
        new RadioButtonClass('Have you ever had chemotherapy?*', 'is_chemotherapy', [{ name: 'yes', label: "Yes", value: true }, { name: 'no', value: false, label: 'No' }], data && data['is_chemotherapy'] ? data['is_chemotherapy'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-xl-6', 'col-lg-6', 'col-md-12', ' ']),
        new RadioButtonClass('Have you ever had radiation therapy?*', 'is_radiation_therapy', [{ name: 'yes', label: "Yes", value: true }, { name: 'no', value: false, label: 'No' }], data && data['is_hormonal_treatment'] ? data['is_hormonal_treatment'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-xl-6', 'col-lg-6', 'col-md-12', ' ']),
        new RadioButtonClass('Do you have anemia or any disease(s) that effects your blood, a history of renal(Kidney) disease, high blood pressure, Liver disease, a history of diabetes or seizures?*', 'is_anemia_disease', [{ name: 'yes', label: "Yes", value: true }, { name: 'no', value: false, label: 'No' }], data && data['is_anemia_disease'] ? data['is_anemia_disease'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-xl-12', 'col-lg-12', 'col-md-12', ' ']),
			
			], ['row']),
		];
	}

  submit(form) {

  }
}
