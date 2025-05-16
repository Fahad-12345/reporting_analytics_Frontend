import { AfterViewInit, Component, Input, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CaseModel, MRI, MriIntake3 } from '@appDir/front-desk/fd_shared/models/Case.model';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { getFieldControlByName } from '@appDir/shared/dynamic-form/helper';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { DynamicControl } from '@appDir/shared/dynamic-form/models/DynamicControl.class';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { RadioButtonClass } from '@appDir/shared/dynamic-form/models/RadioButtonClass.class';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { pairwise, startWith } from 'rxjs/operators';
import { isEqual } from 'lodash';
@Component({
	selector: 'app-mri-intake3-form',
	templateUrl: './mri-intake3-Form.component.html',
	styleUrls: ['./mri-intake3-Form.component.scss'],
})
export class MRIIntake3FormComponent implements OnInit, AfterViewInit, OnDestroy {
	fieldConfig: FieldConfig[] = [];
	@Input() caseId: any;
	@Input() MRIData: MRI;
	@Input() title = '';
	subscription: any[] = [];
	form: FormGroup;
	modalRef: NgbModalRef;
	
	@ViewChild(DynamicFormComponent) dynamiccomponent: DynamicFormComponent;
	constructor(public customDiallogService: CustomDiallogService, private modalService: NgbModal) {}
	ngOnInit() {
		this.setConfigration();
	}
	ngOnChanges(changes: SimpleChanges) {
		debugger;
		// if(changes.MRIData &&changes.MRIData.currentValue&&!isEqual(changes.MRIData.currentValue.mri_intake_3,changes.MRIData.previousValue.mri_intake_3)  )
		// {
			if(this.form && this.MRIData&&this.MRIData.mri_intake_3)
			{
				this.setFormvalues(this.MRIData.mri_intake_3)
			}
			
		// }
		console.log(changes)
	  }
	ngAfterViewInit() {}
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}

	setConfigration() {
		this.fieldConfig = [
			new DivClass(
				[
					new DynamicControl('id', null),
					// new DynamicControl('is_deleted', false),
					// new DynamicControl('case_id', null),

					new RadioButtonClass(
						'Are you Allergic to any food/medication?*',
						'is_alergic_to_food_medication',
						[
							{ name: 'yes', label: 'Yes', value: true },
							{ name: 'no', label: 'No', value: false },
						],
						'',
						[{ name: 'required', message: 'This field is required', validator: Validators.required }],
						['col-12 col-lg-12 col-xl-6'],
					),
					new RadioButtonClass(
						'Iodine contrast(dye injection)?* ',
						'iodine_contrast',
						[
							{ name: 'yes', label: 'Yes', value: true },
							{ name: 'no', label: 'No', value: false },
						],
						'',
						[{ name: 'required', message: 'This field is required', validator: Validators.required }],
						['col-12 col-lg-6 col-xl-6', 'hidden'],
					),
					new RadioButtonClass(
						'Latex Allergy?*',
						'latex_allergy',
						[
							{ name: 'yes', label: 'Yes', value: true },
							{ name: 'no', label: 'No', value: false },
						],
						'',
						[{ name: 'required', message: 'This field is required', validator: Validators.required }],
						['col-12 col-lg-6 col-xl-6', 'hidden'],
					),
					new RadioButtonClass(
						'Medication/food allergies?*',
						'food_allergy',
						[
							{ name: 'yes', label: 'Yes', value: true },
							{ name: 'no', label: 'No', value: false },
						],
						'',
						[{ name: 'required', message: 'This field is required', validator: Validators.required }],
						['col-12 col-lg-12 col-xl-6', 'hidden'],
					),
					new InputClass('Other*', 'others', InputTypes.text, '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', [
						'col-xl-6 col-lg-12 col-md-12',
						'hidden',
					]),
				],
				['row'],
				'',
				'',
			),
		];
	}

	onReady(event) {
		debugger;
		this.form = event;
		this.bindAreYouAllergicToAnyFood();
		this.bindMedicationFoodAllergies();
		// this.setFormvalues(this.MRIData.mri_intake_3)
	}

	setFormvalues(data:MriIntake3)
	{
		debugger;
		this.form.patchValue(data);
		debugger;
	}

	bindAreYouAllergicToAnyFood() {
		this.subscription.push(
			this.form.controls['is_alergic_to_food_medication'].valueChanges .pipe( startWith(this.form.controls['is_alergic_to_food_medication'].value),pairwise()).subscribe(([prev, next]: [any, any])  => {
				
				debugger;
				let is_iodine_contrast_control = getFieldControlByName(
					this.fieldConfig,
					'iodine_contrast',
				);
				let is_latex_allergy_control = getFieldControlByName(this.fieldConfig, 'latex_allergy');
				let is_medication_allergy_control = getFieldControlByName(
					this.fieldConfig,
					'food_allergy',
				);
				let is_medication_allergy_other_control = getFieldControlByName(
					this.fieldConfig,
					'others',
				);

				if (next) {
					is_iodine_contrast_control.classes = is_iodine_contrast_control.classes.filter(
						(className) => className != 'hidden',
					);
					is_latex_allergy_control.classes = is_latex_allergy_control.classes.filter(
						(className) => className != 'hidden',
					);
					is_medication_allergy_control.classes = is_medication_allergy_control.classes.filter(
						(className) => className != 'hidden',
					);
					is_medication_allergy_other_control.classes =
						is_medication_allergy_other_control.classes.filter(
							(className) => className != 'hidden',
						);
						if(!this.form.controls['food_allergy'].value===true)
						{
							is_medication_allergy_other_control.classes.push('hidden');

						}
				} else {
					if(prev)
					{
						this.customDiallogService
						.confirm('Are you Sure', 'This will delete all existing information?')
						.then((confirmed) => {
							if (confirmed) {
								this.hideResetAreYouAllergicToAnyFood();
								
							} else {
								this.form.controls['is_alergic_to_food_medication'].setValue(true,{ emitEvent: true },)
								return;
							}
						})
						.catch();
					}
					else
					{
						// this.hideResetAreYouAllergicToAnyFood();
					}
					
				}
			}),
		);
	}

	hideResetAreYouAllergicToAnyFood()
	{
		let is_iodine_contrast_control = getFieldControlByName(
			this.fieldConfig,
			'iodine_contrast',
		);
		let is_latex_allergy_control = getFieldControlByName(this.fieldConfig, 'latex_allergy');
		let is_medication_allergy_control = getFieldControlByName(
			this.fieldConfig,
			'food_allergy',
		);
		let is_medication_allergy_other_control = getFieldControlByName(
			this.fieldConfig,
			'others',
		);
		is_iodine_contrast_control.classes.push('hidden');
								is_latex_allergy_control.classes.push('hidden');
								is_medication_allergy_control.classes.push('hidden');
								is_medication_allergy_other_control.classes.push('hidden');
								// this.form.patchValue(
								// 	{
								// 		iodine_contrast: '',
								// 		latex_allergy: '',
								// 		food_allergy: '',
								// 		others: '',
								// 	},
								// 	{ emitEvent: false },
								// );
								this.form.controls['iodine_contrast'].reset('',{ emitEvent: false });
								this.form.controls['latex_allergy'].reset('',{ emitEvent: false });
								this.form.controls['food_allergy'].reset('',{ emitEvent: false });
								this.form.controls['others'].reset('',{ emitEvent: false });

	}

	bindMedicationFoodAllergies() {
		this.subscription.push(
			this.form.controls['food_allergy'].valueChanges.subscribe((value) => {
				4;
				debugger;

				let is_medication_allergy_control = getFieldControlByName(
					this.fieldConfig,
					'food_allergy',
				);
				let is_medication_allergy_other_control = getFieldControlByName(
					this.fieldConfig,
					'others',
				);

				if (value) {
					is_medication_allergy_other_control.classes =
						is_medication_allergy_other_control.classes.filter(
							(className) => className != 'hidden',
						);
				} else {
					is_medication_allergy_other_control.classes.push('hidden');
					// this.form.patchValue(
					// 	{
					// 		others: '',
					// 	},
					// 	{ emitEvent: false },
					// );
					this.form.controls['others'].reset('',{ emitEvent: false });
				}
			}),
		);
	}

	onSubmit(form) {}
}
