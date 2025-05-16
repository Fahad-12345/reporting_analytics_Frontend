import { getFieldControlByName } from '@appDir/shared/dynamic-form/helper';
import { Subscription } from 'rxjs';
import { FormGroup,Validators  } from '@angular/forms';
import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { CaseModel, DialogEnum, MRI } from "@appDir/front-desk/fd_shared/models/Case.model";
import { InputTypes } from "@appDir/shared/dynamic-form/constants/InputTypes.enum";
import { CheckboxClass } from "@appDir/shared/dynamic-form/models/Checkbox.class";
import { DivClass } from "@appDir/shared/dynamic-form/models/DivClass.class";
import { DynamicControl } from "@appDir/shared/dynamic-form/models/DynamicControl.class";
import { FieldConfig } from "@appDir/shared/dynamic-form/models/fieldConfig.model";
import { InputClass } from "@appDir/shared/dynamic-form/models/InputClass.class";
import { RadioButtonClass } from "@appDir/shared/dynamic-form/models/RadioButtonClass.class";
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { pairwise, startWith } from 'rxjs/operators';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { MedicationComponent } from './components/medication/medication.component';
import { MedicationsListingComponent } from './components/medications-listing/medications-listing.component';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { MriIntakeService } from '../../services/mri-intake-service';
import { getLoginUserObject } from '@appDir/shared/utils/utils.helpers';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
@Component({
	selector: 'app-mri-intake2-form',
	templateUrl: './mri-intake-2-component.html',
	styleUrls: ['./mri-intake-2-component.scss'],
})
//CanDeactivateComponentInterface
export class MRIIntake2FormComponent  implements OnInit, AfterViewInit, OnDestroy {
	fieldConfig: FieldConfig[] = [];
	@Input() caseId: any;
	@Input() caseData: CaseModel;
	@Input() title = '';
	@Input() MRIData: MRI;	
	form:FormGroup;
	subscription: Subscription[] = [];
	modalRef:NgbModalRef;
	@ViewChild("medicationsListingComponent") medicationsListingComponent:MedicationsListingComponent;
	@ViewChild(DynamicFormComponent) dynamiccomponent: DynamicFormComponent;
	hideMedicationsListingComponent:boolean=false;
	constructor(public customDiallogService: CustomDiallogService,private modalService: NgbModal,private mriIntakeService:MriIntakeService,private caseFlowService:CaseFlowServiceService)
	{

	}
	ngOnInit() {
		
		this.setConfigration();

	}
	ngAfterViewInit() {

		this.form =this.dynamiccomponent && this.dynamiccomponent.form ? this.dynamiccomponent.form : null;
		this.form.get('eye_injury_metallic_object_description').disable();
		this.form.get('injury_by_metallic_object_description').disable();
	}
	ngOnDestroy() {}
	ngOnChanges(){
		if(this.MRIData && this.MRIData.mri_intake_2) {
			this.MRIData.mri_intake_2;
			this.hideMedicationsListingComponent = this.medicationsListingComponent.mriIntake2MedicationData ? true : false;
			this.medicationsListingComponent.mriIntake2MedicationData = this.MRIData.mri_intake_2.medicines;
			this.mriIntakeService.setMriIntake_2_object(this.MRIData.mri_intake_2);
			setTimeout(()=>this.form.patchValue(this.MRIData.mri_intake_2),500);
		} else {
			this.hideMedicationsListingComponent = true;
		}
		
	}
	setConfigration() {
		this.fieldConfig = [
			new DivClass([
				
				new DynamicControl('id', null),
				new RadioButtonClass('Have you had an injury to the eye involving a metallic object or fragment(e.g. Metallic Shavings)?*',
				 'eye_injury_metallic_object', [
					{ name: 'yes', label: 'Yes', value: true  },
					{ name: 'no', label: 'No', value: false  }
				], '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-xl-8 col-lg-12 col-md-12']),
				new InputClass('Describe Injuries*', 'eye_injury_metallic_object_description', InputTypes.text, '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-lg-6 col-xl-4', 'hidden']),
					new RadioButtonClass('Have you ever been injured by a metallic object or foreign body(e.g., bb, bullet, etc.)?*', 'injury_by_metallic_object', [
						{ name: 'yes', label: 'Yes', value: true },
						{ name: 'no', label: 'No', value: false }
					], '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-xl-8 col-lg-12 col-md-12']),
					new InputClass('Describe Objects*', 'injury_by_metallic_object_description', InputTypes.text, '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-lg-6 col-xl-4', 'hidden']),
					new RadioButtonClass('Are you currently or have you recently taken any medication or drug?*', 
					'recently_taken_medication', [
						{ name: 'yes', label: 'Yes', value: true },
						{ name: 'no', label: 'No', value: false }
					], null, [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-xl-12 col-lg-12 col-md-12']),
			], ['row'],'',''),
			
		]
	}

	onReady(event) {
		debugger;
		this.form = event;
		this.bindIsPreviousProblem();
		this.bindDescribeObjectProblem();
		this.bindHavingMedicationDrug();
	}

	onSubmit(form) {

	}

	bindIsPreviousProblem() {
		debugger;
		this.subscription.push(this.form && this.form.controls['eye_injury_metallic_object'].valueChanges.subscribe(value => {4
			debugger;
			let previous_problem_description_control=getFieldControlByName(this.fieldConfig,'eye_injury_metallic_object_description');
			if(value)
			{	
				this.form.get('eye_injury_metallic_object_description').enable()
				previous_problem_description_control.classes = previous_problem_description_control.classes.filter(className => className != 'hidden')	

			}
			else
			{
				this.form.get('eye_injury_metallic_object_description').disable()
				previous_problem_description_control.classes.push('hidden');
				this.form.controls['eye_injury_metallic_object_description'].reset('',{emitEvent:false})
				// previous_problem_description_control.classes.push('hidden');
				// this.form.controls['is_previous_problem'].reset('',{emitEvent:false})
			}
		 
		  
		}))
	  }
	  bindDescribeObjectProblem() {
		debugger;
		this.subscription.push(this.form && this.form.controls['injury_by_metallic_object'].valueChanges.subscribe(value => {
			debugger;
			let previous_problem_description_control=getFieldControlByName(this.fieldConfig,'injury_by_metallic_object_description');
			if(value)
			{	
				this.form.get('injury_by_metallic_object_description').enable()
				previous_problem_description_control.classes = previous_problem_description_control.classes.filter(className => className != 'hidden')	

			}
			else
			{
				this.form.get('injury_by_metallic_object_description').disable()
				previous_problem_description_control.classes.push('hidden');
				this.form.controls['injury_by_metallic_object_description'].reset('',{emitEvent:false})
				// previous_problem_description_control.classes.push('hidden');
				// this.form.controls['is_previous_problem'].reset('',{emitEvent:false})
			}
		 
		  
		}))
	  }
	  bindHavingMedicationDrug() {
		this.subscription.push(this.form.controls['recently_taken_medication'].valueChanges.pipe( startWith(this.form.controls['recently_taken_medication'].value),pairwise()).subscribe(([prev, next]: [any, any])=> {
		 debugger;
		if(next && this.mriIntakeService.getMriIntake_2_object() && this.mriIntakeService.getMriIntake_2_object().medicines && this.mriIntakeService.getMriIntake_2_object().medicines.length <= 0 && (this.MRIData && this.MRIData.mri_intake_2 && !this.MRIData.mri_intake_2.recently_taken_medication))
		{
			this.AddEditAddPriorSurgery();
		}
		else if(next && (!this.MRIData || !this.MRIData.mri_intake_2))
		{
			this.AddEditAddPriorSurgery();
		}
		else if(this.MRIData && this.MRIData.mri_intake_2 && this.MRIData.mri_intake_2.medicines.length < 1 && !prev && next && this.mriIntakeService.getMriIntake_2_object().medicines.length < 1)
		{
			this.AddEditAddPriorSurgery();
		}
		if(this.MRIData && this.MRIData.mri_intake_2 && !this.MRIData.mri_intake_2.recently_taken_medication) {
			if(this.mriIntakeService.getMriIntake_2_object() && this.mriIntakeService.getMriIntake_2_object().medicines && this.mriIntakeService.getMriIntake_2_object().medicines.length > 0) {
				this.medicationsListingComponent.mriIntake2MedicationData = this.mriIntakeService.getMriIntake_2_object().medicines;
				this.hideMedicationsListingComponent = false;
			}
		}
		if(this.mriIntakeService.getMriIntake_2_object() && this.mriIntakeService.getMriIntake_2_object().medicines && this.mriIntakeService.getMriIntake_2_object().medicines.length > 0 && next) {
			this.medicationsListingComponent.mriIntake2MedicationData = this.mriIntakeService.getMriIntake_2_object().medicines;
			this.hideMedicationsListingComponent = false;
		}
		else
		{
			this.MRIData;
			if(prev || prev == null || prev == false){
			if(this.mriIntakeService.getMriIntake_2_object() && this.mriIntakeService.getMriIntake_2_object().medicines && this.mriIntakeService.getMriIntake_2_object().medicines.length > 0) {
					{
						this.customDiallogService
						.confirm('Are you Sure', 'This will delete all existing information?')
						.then((confirmed) => {
							debugger;
							if (confirmed) {								
								let medicationDeleteObject = {
									mri_intake_2_id: this.MRIData && this.MRIData.mri_intake_2 && this.MRIData.mri_intake_2.id ? this.MRIData.mri_intake_2.id : this.mriIntakeService.getMriIntake_2_object().id,
									to_delete: 'medication',
									user_id: getLoginUserObject().id,
								};
						this.caseFlowService
							.deleteIntake_2_Medication(medicationDeleteObject)
							.subscribe((res) => {
								// this.mriIntakeService.setMriIntake_2_object()
								this.MRIData.mri_intake_2.medicines = [];
								this.mriIntakeService.ForKnowMedicationHasBeenAddOrEdit.next(true);
							});
								 this.hideMedicationsListingComponent = true;
							}
							else
							{
								if(this.mriIntakeService.getMriIntake_2_object() && this.mriIntakeService.getMriIntake_2_object().medicines && this.mriIntakeService.getMriIntake_2_object().medicines.length > 0) {
									this.hideMedicationsListingComponent = false;
									this.form.patchValue(
										{
											recently_taken_medication : true
										},
										// { emitEvent: false },
									);
								}
								return;
							}
						})
						.catch();
					}

		
		}
		  
		}
	}}
	))
	  }
	  AddEditAddPriorSurgery()
	  {
		let ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			// size: '',
			windowClass: 'modal_extraDOc',
		};
		this.modalRef = this.modalService.open(MedicationComponent, ngbModalOptions);
		this.modalRef.componentInstance.data=null;
		this.modalRef.componentInstance.caseId=this.caseId;
		this.modalRef.componentInstance.mri_intake_id=null;
		this.modalRef.result.then((data: any) => {
			debugger;
			if(this.mriIntakeService.getMriIntake_2_object() && this.mriIntakeService.getMriIntake_2_object().medicines && this.mriIntakeService.getMriIntake_2_object().medicines.length > 0) {
				this.medicationsListingComponent.mriIntake2MedicationData = this.mriIntakeService.getMriIntake_2_object().medicines;
				this.hideMedicationsListingComponent = false;
			}
			if(this.mriIntakeService.getMriIntake_2_object() && this.mriIntakeService.getMriIntake_2_object().medicines && this.mriIntakeService.getMriIntake_2_object().medicines.length <= 0) {
				this.form.patchValue(
					{
					recently_taken_medication : false
					},
					// { emitEvent: false },
				);
			}
			if(!this.mriIntakeService.getMriIntake_2_object()) {
				this.form.patchValue(
					{
					recently_taken_medication : false
					},
					// { emitEvent: false },
				);
			}
			if(data)
			{
				// this.reEvaluateForm();
			}
			else
			{
				// this.reEvaluateForm();
			}
		})
	  }
	  hasMedicationListData(isMedicationListEmpty) {
		debugger;
		this.hideMedicationsListingComponent = isMedicationListEmpty;
		if(isMedicationListEmpty && this.mriIntakeService.getMriIntake_2_object() && this.mriIntakeService.getMriIntake_2_object().medicines && this.mriIntakeService.getMriIntake_2_object().medicines.length <= 0 && this.form) {
		this.form.patchValue(
			{
				recently_taken_medication : false
			},
			{ emitEvent: false },
		);
		}
		if(this.mriIntakeService.getMriIntake_2_object() && this.mriIntakeService.getMriIntake_2_object().medicines && this.mriIntakeService.getMriIntake_2_object().medicines.length > 0 && this.form) {
			this.form.patchValue(
				{
					recently_taken_medication : true
				},
				{ emitEvent: false },
			);
			}
	}
}
