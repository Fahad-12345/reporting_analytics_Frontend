import { Subscription } from 'rxjs/index';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { CaseModel, MRI } from "@appDir/front-desk/fd_shared/models/Case.model";
import { CaseFlowServiceService } from "@appDir/front-desk/fd_shared/services/case-flow-service.service";
import { PermissionComponent } from "@appDir/front-desk/permission.abstract.component";
import { AclService } from "@appDir/shared/services/acl.service";
import { RequestService } from "@appDir/shared/services/request.service";
import { changeDateFormat, removeEmptyKeysFromObject, unSubAllPrevious } from "@appDir/shared/utils/utils.helpers";
import { ToastrService } from "ngx-toastr";
import { MRIIntake2FormComponent } from "./components/mri-intake-2-component/mri-intake-2-component";
import { MRIIntake1FormComponent } from "./components/mri-intake1-Form/mri-intake1-Form.component";
import { MRIIntake3FormComponent } from "./components/mri-intake3-Form/mri-intake3-Form.component";
import { MriIntake4ComponentComponent } from "./components/mri-intake4-component/mri-intake4-component.component";
import { MriIntake6FormComponent } from "./components/mri-intake6-form/mri-intake6-form.component";
import { PatientsRadiologyMontageComponent } from "./components/patients-radiology-montage/patients-radiology-montage.component";
import {MriIntakeService} from './services/mri-intake-service'
@Component({
	selector: 'app-mri-intakes',
	templateUrl: './mri-intakes.component.html',
	styleUrls: ['./mri-intakes.component.scss'],
})
export class MriIntakesComponent extends PermissionComponent  implements OnInit, AfterViewInit, OnDestroy {
	isFormDisabled:boolean=false;
	public caseId;
	 caseData: CaseModel;
	 MriData: MRI = new MRI();
	 subscription: Subscription[] = [];
	 @ViewChild('patientsRadiologyMontage') patientsRadiologyMontage : PatientsRadiologyMontageComponent;
	@ViewChild('mriIntake1Form') mriIntake1FormComponent : MRIIntake1FormComponent
	@ViewChild('mriIntake2Form') mriIntake2FormComponent : MRIIntake2FormComponent
	@ViewChild('mriIntake3Form') mriIntake3FormComponent : MRIIntake3FormComponent
	@ViewChild('mriIntake6Form') mriIntake6FormComponent : MriIntake6FormComponent
	@ViewChild('mriIntake4Form') mriIntake4FormComponent : MriIntake4ComponentComponent;
	constructor(public caseFlowService: CaseFlowServiceService ,
		aclService: AclService,requestService: RequestService,
		private MriIntakeService:MriIntakeService,
		router: Router,private route: ActivatedRoute,private toastrService: ToastrService,
		titleService: Title,)
	{
		super(aclService,router,route,requestService,titleService);	
		this.route.snapshot.pathFromRoot.forEach(path => {
			if (path && path.params && path.params.caseId) {
				if (!this.caseId) {
					this.caseId = path.params.caseId;
					this.MriIntakeService.setCase_id(this.caseId);
				}
			}
		})
	}
	ngOnInit() {}
	ngAfterViewInit() {
		this.getCase()
	}
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}

	goBack() {
		this.caseFlowService.goBack()
	}

	

	save(event) {
		debugger;
		// this.caseFlowService.goToNextStep();
		if (this.mriIntake1FormComponent.dynamiccomponent)
			this.mriIntake1FormComponent.dynamiccomponent.disableHiddenControlsPublic()
		if (this.mriIntake1FormComponent.dynamiccomponent)
			this.mriIntake1FormComponent.dynamiccomponent.disableHiddenControlsPublicByFieldConfig(this.mriIntake1FormComponent.fieldConfigPreviousMri,this.mriIntake1FormComponent.formPreviousMri)
		if (this.mriIntake1FormComponent.dynamiccomponent)
		    this.mriIntake1FormComponent.dynamiccomponent.disableHiddenControlsPublicByFieldConfig(this.mriIntake1FormComponent.fieldConfigDiagImaging,this.mriIntake1FormComponent.formDiagImaging)
		if (this.mriIntake2FormComponent)
		this.mriIntake2FormComponent.dynamiccomponent.disableHiddenControlsPublic()
		if (this.mriIntake3FormComponent)
			this.mriIntake3FormComponent.dynamiccomponent.disableHiddenControlsPublic()
		if(this.patientsRadiologyMontage){
			this.patientsRadiologyMontage.patientradiology.disableHiddenControlsPublic();
		}
		if(this.mriIntake6FormComponent){
			this.mriIntake6FormComponent._component.disableHiddenControlsPublic();
		}
		if(this.mriIntake1FormComponent.formMedSympSurgery && this.mriIntake1FormComponent.formDiagImaging && this.mriIntake1FormComponent.formPreviousMri)
		if(this.mriIntake1FormComponent.formMedSympSurgery.invalid || this.mriIntake1FormComponent.formDiagImaging.invalid 
			|| this.mriIntake1FormComponent.formPreviousMri.invalid || this.mriIntake3FormComponent.form.invalid)
			{
				this.mriIntake1FormComponent.dynamiccomponent.enableHiddenControlsPublic();
				this.mriIntake1FormComponent.dynamiccomponent.enableHiddenControlsPublicByFieldConfig(this.mriIntake1FormComponent.fieldConfigPreviousMri)
				this.mriIntake3FormComponent.dynamiccomponent.enableHiddenControlsPublic()

				return;
			}
		if(this.mriIntake4FormComponent){
			this.mriIntake4FormComponent._component.disableHiddenControlsPublic();
		}
		

		if(this.mriIntake6FormComponent&&this.mriIntake6FormComponent.form)
		if(this.mriIntake6FormComponent.form.invalid)
		{
			return;
		}
		if(this.mriIntake2FormComponent.form)
		if(this.mriIntake2FormComponent.form.invalid){
			return;
		}
		if(this.patientsRadiologyMontage.form)
		if(this.patientsRadiologyMontage.form.invalid){
			return;
		}
		if(this.mriIntake4FormComponent.form)
		if(this.mriIntake4FormComponent.form.invalid){
			return;
		}
		let inkate6 = this.mriIntake6FormComponent && this.mriIntake6FormComponent.form ?this.mriIntake6FormComponent.form.value:null;
		if (
			inkate6 &&
			inkate6['mri_intake_6'] && inkate6['mri_intake_6']['date_of_period']
		) {

			inkate6['mri_intake_6']['date_of_period'] = inkate6['mri_intake_6']['date_of_period'] ?
				changeDateFormat(
					inkate6['mri_intake_6']['date_of_period'],
				): null;
		}
		let formMedSurgery=this.mriIntake1FormComponent.formMedSympSurgery.getRawValue();
		let formDiagImaging=this.mriIntake1FormComponent.formDiagImaging.getRawValue();
		let formPreviousMri=this.mriIntake1FormComponent.formPreviousMri.getRawValue()
		let mri_intake_1={
			...formMedSurgery,
			...formDiagImaging,
			...formPreviousMri
		}
		mri_intake_1.id=mri_intake_1 && mri_intake_1.id? mri_intake_1.id:this.MriData.mri_intake_1 &&this.MriData.mri_intake_1.id?this.MriData.mri_intake_1.id:null
		let formMri_intake_2 = this.mriIntake2FormComponent.form.getRawValue();
		let mri_intake_2 = {
			...formMri_intake_2,
			medication:	this.MriIntakeService.getMriIntake_2_object() && this.MriIntakeService.getMriIntake_2_object().medicines && this.MriIntakeService.getMriIntake_2_object().medicines.length > 0 ? this.MriIntakeService.getMriIntake_2_object().medicines.map((item) =>  item.name) : null
		}
		console.log(this.caseData);
		console.log(this.MriData);
		let data = {
			'mri':{
				'id': this.MriData  && this.MriData.id?this.MriData.id:null,
				'mri_intake_1': removeEmptyKeysFromObject(mri_intake_1),
				'mri_intake_2': removeEmptyKeysFromObject(mri_intake_2),
				'mri_intake_3': removeEmptyKeysFromObject(this.mriIntake3FormComponent.form.getRawValue()),
				'mri_intake_4': removeEmptyKeysFromObject(this.mriIntake4FormComponent.form.getRawValue()),
				'mri_intake_6': inkate6&& inkate6['mri_intake_6']?removeEmptyKeysFromObject(inkate6['mri_intake_6']):null,
				'mri_radiology_montage': removeEmptyKeysFromObject(this.patientsRadiologyMontage.form.getRawValue()['mri_radiology_montage']),
			},
			"request_from_front_desk": true,
			case_type_id:this.caseData&&this.caseData.case_type_id?this.caseData.case_type_id:null
		}

		// let mri_intake_1=this.mriIntake1FormComponent.form.getRawValue();
		// data.mri.mri_intake_1=removeEmptyKeysFromObject(mri_intake_1);

		// let mri_intake_three=this.mriIntake3FormComponent.form.getRawValue();
		// data.mri.mri_intake_3=removeEmptyKeysFromObject(mri_intake_three);
		
		// let mri_radiology_montage = this.patientsRadiologyMontage.form.getRawValue()['mri_radiology_montage'];

		// data.mri.mri_radiology_montage = removeEmptyKeysFromObject(mri_radiology_montage);
		// let mri_intake_6 = this.mriIntake6FormComponent.form.getRawValue()['mri_intake_6'];

		// data.mri.mri_intake_6 = removeEmptyKeysFromObject(mri_intake_6);

		// this.caseFlowService.updateCase(this.caseId, removeEmptyKeysFromObject(data)).subscribe(res => {

		// });

			this.caseFlowService.updateCase(this.caseId, removeEmptyKeysFromObject(data)).subscribe(data => {
				if(this.mriIntake1FormComponent)
				{
					this.mriIntake1FormComponent.dynamiccomponent.enableHiddenControlsPublic();
					this.mriIntake1FormComponent.dynamiccomponent.enableHiddenControlsPublicByFieldConfig(this.mriIntake1FormComponent.fieldConfigPreviousMri)

				}
				if(this.mriIntake3FormComponent)
				{
					this.mriIntake3FormComponent.dynamiccomponent.enableHiddenControlsPublic()
				}
				if(this.mriIntake6FormComponent){
					this.mriIntake6FormComponent._component.enableHiddenControlsPublic();
				}
				if(this.mriIntake4FormComponent){
					this.mriIntake4FormComponent._component.enableHiddenControlsPublic();
				}
				if(this.patientsRadiologyMontage){
					this.patientsRadiologyMontage.patientradiology.enableHiddenControlsPublic();
				}
				this.toastrService.success('Successfully Updated', 'Success')
				this.getCase(callback => {
					this.caseFlowService.goToNextStep();
				})
			},error=>{
				if (this.mriIntake1FormComponent)
					this.mriIntake1FormComponent.dynamiccomponent.enableHiddenControlsPublic()
				if (this.mriIntake3FormComponent)
					this.mriIntake3FormComponent.dynamiccomponent.enableHiddenControlsPublic()
				this.toastrService.error(error.error.message, 'Error');
			});
				

		// 		if (this.InsuranceFormComponent)
		// 			this.InsuranceFormComponent.dynamiccomponent.enableHiddenControlsPublic()
		// 		if (this.InsuranceFormComponent1)
		// 			this.InsuranceFormComponent1.dynamiccomponent.enableHiddenControlsPublic()
		// 		if (this.InsuranceFormComponent2)
		// 			this.InsuranceFormComponent2.dynamiccomponent.enableHiddenControlsPublic()
		// 		if (this.HealthInsuranceFormComponent)
		// 			this.HealthInsuranceFormComponent.dynamiccomponent.enableHiddenControlsPublic()

		// 		this.getCase(callback => {

		// 			form1 ? form1.reset({},{ emitEvent: false }) : null
		// 			form2 ? form2.reset({},{ emitEvent: false }) : null
		// 			form3 ? form3.reset({},{ emitEvent: false }) : null
		// 			form4 ? form4.reset({},{ emitEvent: false }) : null
		// 			this.caseFlowService.goToNextStep()
		// 		})
		// 		this.toastrService.success('Successfully Updated', 'Success')

		// 	}, err => {
		// 		if (this.InsuranceFormComponent)
		// 			this.InsuranceFormComponent.dynamiccomponent.enableHiddenControlsPublic()
		// 		if (this.InsuranceFormComponent1)
		// 			this.InsuranceFormComponent1.dynamiccomponent.enableHiddenControlsPublic()
		// 		if (this.InsuranceFormComponent2)
		// 			this.InsuranceFormComponent2.dynamiccomponent.enableHiddenControlsPublic()
		// 		if (this.HealthInsuranceFormComponent)
		// 			this.HealthInsuranceFormComponent.dynamiccomponent.enableHiddenControlsPublic()
		// 		this.toastrService.error(err.error.message, 'Error');
		// 		// this.toggleForm()
		// 	})
		// } else {
		// 	if (this.InsuranceFormComponent)
		// 		this.InsuranceFormComponent.dynamiccomponent.enableHiddenControlsPublic()
		// 	if (this.InsuranceFormComponent1)
		// 		this.InsuranceFormComponent1.dynamiccomponent.enableHiddenControlsPublic()
		// 	if (this.InsuranceFormComponent2)
		// 		this.InsuranceFormComponent2.dynamiccomponent.enableHiddenControlsPublic()
		// 	if (this.HealthInsuranceFormComponent)
		// 		this.HealthInsuranceFormComponent.dynamiccomponent.enableHiddenControlsPublic()
		// }



	}

	getCase(callback?) {
		this.subscription.push(
			this.caseFlowService.getCase(this.caseId,'mri').subscribe((res) => {
				callback ? callback() : null
				if (res.status == 200) {
					this.caseData = res['result'] && res['result'].data?res['result'].data:null;
					this.MriData=this.caseData && this.caseData.mri?this.caseData.mri:new MRI();	
					this.setMri_Intake_2_object();
					
					// this.MriIntakeService.MriIntake1PriorSurgeryRefreshListingData(this.MriData.mri_intake_1);	
					// callback ? callback() : null;
					// this.assingValues();
					// this.formReady = true;
					// this.setLienForm()
					// if (!this.caseData.insurance) {
					// }

				}
			}),
		);
	}
	setMri_Intake_2_object() {
		debugger;
		if(!this.MriData || !this.MriData.mri_intake_2) {
			this.MriIntakeService.setMriIntake_2_object(null);
		}
		this.MriData ? this.MriIntakeService.setMri_object(this.MriData) : this.MriIntakeService.setMri_object(null);
	}
			

}
