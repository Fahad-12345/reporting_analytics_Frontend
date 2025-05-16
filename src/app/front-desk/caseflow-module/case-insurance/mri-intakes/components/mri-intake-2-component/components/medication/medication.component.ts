import { removeEmptyAndNullsFormObject } from '@shared/utils/utils.helpers';

import { Component, EventEmitter, Input, OnChanges,Output  } from "@angular/core";
import { changeDateFormat, unSubAllPrevious } from "@appDir/shared/utils/utils.helpers";
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { NgSelectClass } from '@appDir/shared/dynamic-form/models/NgSelectClass.class';
import { RadioButtonClass } from '@appDir/shared/dynamic-form/models/RadioButtonClass.class';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { Validators, FormGroup } from '@angular/forms';
import { DynamicControl } from '@appDir/shared/dynamic-form/models/DynamicControl.class';
import { ButtonClass } from '@appDir/shared/dynamic-form/models/ButtonClass.class';
import { ButtonTypes } from '@appDir/shared/dynamic-form/constants/ButtonTypes.enum';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { Subject, Subscription } from "rxjs";
import { MriIntakeService } from '../../../../services/mri-intake-service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-medication',
  templateUrl: './medication.component.html',
  styleUrls: ['./medication.component.scss']
})
export class MedicationComponent implements OnChanges {
	subscription:Subscription[]=[]
	fieldConfig: FieldConfig[] = [];
	form:FormGroup;
	@Input() data;
	@Input() singleMedicationObject = null;
	@Input() title= "Add";
	@Input() mri_intake_id;
	caseId;
	medicationList = [];
	searchTypeHead$:Subject<any>=new Subject<any>();
	constructor(private activeModal: NgbActiveModal,	
		private requestService: RequestService,
		private caseFlowService: CaseFlowServiceService,
		private route: ActivatedRoute,
		private mriIntakeService:MriIntakeService)
	{

	}
	ngOnInit() {
		this.setfieldConfig();
	}

	ngOnChanges()
	{

	}
	ngAfterViewInit() {

	}

	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
		
	}

	onReady(event) {
		debugger;
		this.form = event;
		if(this.singleMedicationObject) {
			this.title = 'Edit';
			this.form.controls.id.setValue(this.singleMedicationObject.id);
			this.form.controls.describe_objects.setValue(this.singleMedicationObject.name);
		} else {
			this.title = 'Add';
		}
	}

	onSubmit(form) {
		
		debugger;
		if(this.singleMedicationObject) {
			let editMedicationObj = {
				"medication_id": this.singleMedicationObject.id,
				"medication": form.describe_objects
			}
			this.caseFlowService.add_Edit_Intake_2_Medication(editMedicationObj).subscribe(res =>{
				this.mriIntakeService.ForKnowMedicationHasBeenAddOrEdit.next(true);
			})

		} else {
			if(!this.mriIntakeService.getMriIntake_2_object()) {
				this.getCaseId();
			}
			let editMedicationObj = {
				"medication": form.describe_objects,
				"intake_two_id": this.mriIntakeService.getMriIntake_2_object() && this.mriIntakeService.getMriIntake_2_object().id ? this.mriIntakeService.getMriIntake_2_object().id: null, 
				case_id:(this.mriIntakeService.getMriIntake_2_object() !=undefined || this.mriIntakeService.getMriIntake_2_object() !=null) ? null : this.caseId
			}
			editMedicationObj = removeEmptyAndNullsFormObject(editMedicationObj);
			 editMedicationObj['id'] = this.mriIntakeService.getMri_object()  && this.mriIntakeService.getMri_object().id ? this.mriIntakeService.getMri_object().id : null // This is requirement from backend if ID not exist then send null
			this.caseFlowService.add_Edit_Intake_2_Medication(editMedicationObj).subscribe(res =>{
				if(!this.mriIntakeService.getMriIntake_2_object()) {
					if(res && res.result && res.result.data && res.status) {
						this.mriIntakeService.setMriIntake_2_object(res.result.data)
					}
				}
				this.mriIntakeService.ForKnowMedicationHasBeenAddOrEdit.next(true);
			})
		}
		this.close();
	}

	setfieldConfig()
	{
		this.fieldConfig = [
			new DivClass([
				new DynamicControl('id', null),
				new DynamicControl('is_deleted', false),				
				new InputClass('Medication*', 'describe_objects', InputTypes.text, '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-lg-12 col-xl-12', '']),
			], ['row']),
			new DivClass([
				new ButtonClass('Cancel', ['btn', 'btn-primary', 'btn-block', 'mt-1 mt-sm-0 mb-1 mb-sm-0'], ButtonTypes.button, this.close.bind(this), { icon: 'icon-left-arrow me-2', button_classes: [''] }),
				new ButtonClass('Save & Continue', ['btn', 'btn-success', 'btn-block', 'mt-1 mt-sm-0'], ButtonTypes.submit, null, { icon: 'icon-save-continue me-2', button_classes: [''] })
			], ['row', 'form-btn', 'justify-content-center'])
		]
	}

	

	close() {
		this.activeModal.close()
	}
	getCaseId() {
		this.caseId = this.mriIntakeService.getCase_id();
	}
	

}
