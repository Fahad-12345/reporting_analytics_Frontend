import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CaseModel } from '@appDir/front-desk/fd_shared/models/Case.model';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { DynamicControl } from '@appDir/shared/dynamic-form/models/DynamicControl.class';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { RadioButtonClass } from '@appDir/shared/dynamic-form/models/RadioButtonClass.class';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-patients-radiology-montage',
  templateUrl: './patients-radiology-montage.component.html',
  styleUrls: ['./patients-radiology-montage.component.scss']
})
export class PatientsRadiologyMontageComponent implements OnInit, AfterViewInit, OnChanges {
  fieldConfig: FieldConfig[] = [];
  subscription: Subscription[] = [];
  public form: FormGroup;
  @Input() caseData: CaseModel;
  @ViewChild(DynamicFormComponent) patientradiology: DynamicFormComponent
  constructor() { }
  ngOnChanges(changes: SimpleChanges): void {
    if(this.caseData &&  this.caseData.mri && this.caseData.mri.mri_radiology_montage){
      this.form.patchValue({mri_radiology_montage:this.caseData.mri.mri_radiology_montage });
    }
  }

  ngOnInit() {
    this.setConfigration();
  }


  ngAfterViewInit(): void {
    this.form = this.patientradiology.form;
  }

  /**
	 * form configratios
	 */
	setConfigration(data?) {
		this.fieldConfig = [
			new DivClass([
        new DivClass([
          new DivClass([
            new DynamicControl('id', null),
            new RadioButtonClass('Aneurysm clip(s)*', 'aneurysm_clip', [{ name: 'yes', label: 'Yes', value: true }, { name: 'no', value: false, label: 'No' }], data && data['aneurysm_clip'] ? data['aneurysm_clip'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-12', ' ']),
            new RadioButtonClass('Any metallic fragment or foreign body*', 'metallic_fragment', [{ name: 'yes', label: 'Yes', value: true }, { name: 'no', value: false, label: 'No' }], data && data['metallic_fragment'] ? data['metallic_fragment'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-12', ' ']),
            new RadioButtonClass('Body piercing jewelry*', 'body_piercing', [{ name: 'yes', label: 'Yes', value: true }, { name: 'no', value: false, label: 'No' }], data && data['body_piercing'] ? data['body_piercing'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-12', ' ']),
            new RadioButtonClass('Body weight greater than 280 pounds*', 'body_weight', [{ name: 'yes', label: 'Yes', value: true }, { name: 'no', value: false, label: 'No' }], data && data['body_weight'] ? data['body_weight'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-12', ' ']),
            new RadioButtonClass('Cardiac pacemaker*', 'cardiac_pacemaker', [{ name: 'yes', label: 'Yes', value: true }, { name: 'no', value: false, label: 'No' }], data && data['cardiac_pacemaker'] ? data['cardiac_pacemaker'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-12', ' ']),
            new RadioButtonClass('Dentures, Partial plates or prosthesis*', 'dentures', [{ name: 'yes', label: 'Yes', value: true }, { name: 'no', value: false, label: 'No' }], data && data['dentures'] ? data['dentures'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-12', ' ']),
            new RadioButtonClass('Electronic or magnetically activated*', 'magnetically_activated', [{ name: 'yes', label: 'Yes', value: true }, { name: 'no', value: false, label: 'No' }], data && data['magnetically_activated'] ? data['magnetically_activated'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-12', ' ']),
          ],['row']),
        ],['patient-montage-body-holder card-bg-white border-bottom-width-0']),
        new DivClass([
          new DivClass([
            new DynamicControl('id', null),
            new RadioButtonClass('Hearing aid(remove before entering MRI room)*', 'hearing_aid', [{ name: 'yes', label: 'Yes', value: true }, { name: 'no', value: false, label: 'No' }], data && data['hearing_aid'] ? data['hearing_aid'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-12', ' ']),
            new RadioButtonClass('Implanted Cardioverter Defibrillator (ICD)*', 'cardioverter', [{ name: 'yes', label: 'Yes', value: true }, { name: 'no', value: false, label: 'No' }], data && data['cardioverter'] ? data['cardioverter'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-12', ' ']),
            new RadioButtonClass('Implanted drug infusion device*', 'infusion_device', [{ name: 'yes', label: 'Yes', value: true }, { name: 'no', value: false, label: 'No' }], data && data['infusion_device'] ? data['infusion_device'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-12', ' ']),
            new RadioButtonClass('IUD, Diaphragm or pessary*', 'diaphragm', [{ name: 'yes', label: 'Yes', value: true }, { name: 'no', value: false, label: 'No' }], data && data['diaphragm'] ? data['diaphragm'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-12', ' ']),
            new RadioButtonClass('Mechanical heart valves*', 'mechanical_heart_valves', [{ name: 'yes', label: 'Yes', value: true }, { name: 'no', value: false, label: 'No' }], data && data['mechanical_heart_valves'] ? data['mechanical_heart_valves'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-12', ' ']),
            new RadioButtonClass('Metallic stent, FiIter, or coil due to Bone Fracture*', 'metallic_stent', [{ name: 'yes', label: 'Yes', value: true }, { name: 'no', value: false, label: 'No' }], data && data['metallic_stent'] ? data['metallic_stent'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-12', ' ']),
            new RadioButtonClass('Spinal cord stimulator*', 'spinal_cord_stimulator', [{ name: 'yes', label: 'Yes', value: true }, { name: 'no', value: false, label: 'No' }], data && data['spinal_cord_stimulator'] ? data['spinal_cord_stimulator'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-12', ' ']),
            // new RadioButtonClass('Metallic stent, FiIter, or coil due to Bone Fracture?', '', [{ name: 'yes', label: 'Yes', value: true }, { name: 'no', value: false, label: 'No' }], data && data[''] ? data[''] : '', [], ['col-xl-3', 'col-lg-3', 'col-md-3', ' ']),
          ],['row']),
        ],['patient-montage-body-holder card-bg-white border-top-width-0']),
			
			], ['patient-montage-body'], '', '', { formControlName: 'mri_radiology_montage' }),
		];
	}

  submit(form) {

  }

}
