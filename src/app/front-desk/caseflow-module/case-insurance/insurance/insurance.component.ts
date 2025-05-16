import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorage } from '@shared/libs/localstorage';
import { FDServices } from 'app/front-desk/fd_shared/services/fd-services.service';
import { ToastrService } from 'ngx-toastr';
import { Patient } from 'app/front-desk/patient/patient.model';
import { MainService } from '@shared/services/main-service';
import { FRONT_DESK_LINKS } from 'app/front-desk/models/leftPanel/leftPanel';
import { fromEvent, Subscription } from 'rxjs';
import { changeDateFormat, unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Logger } from '@nsalaun/ng-logger';
import { CanDeactivateComponentInterface } from '@appDir/shared/canDeactivateFormsComponent/CanDeactivateComponent.interface';
import { FormGroup } from '@angular/forms';
// import { HealthInsuranceFormComponent } from '@appDir/front-desk/caseflow-module/case-insurance/insurance/components/health-insurance-form/health-insurance-form.component';
import { InsuranceFormComponent } from '@appDir/front-desk/caseflow-module/case-insurance/insurance/components/insurance-form/insurance-form.component';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { CaseTypeIdEnum, CaseTypeEnum } from '@appDir/front-desk/fd_shared/models/CaseTypeEnums';
import { PatientModel } from '@appDir/front-desk/fd_shared/models/Patient.model';
import { CaseModel, DialogEnum } from '@appDir/front-desk/fd_shared/models/Case.model';
import { HealthInsuranceFormComponent } from './components/health-insurance-form/health-insurance-form.component';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { getFieldControlByName } from '@appDir/shared/dynamic-form/helper';
import { debounceTime, take } from 'rxjs/operators';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
@Component({
	selector: 'app-insurance',
	templateUrl: './insurance.component.html',
	styleUrls: ['./insurance.component.scss'],
})
//CanDeactivateComponentInterface
export class InsuranceComponent extends PermissionComponent implements OnInit, AfterViewInit, OnDestroy {
	subscription: Subscription[] = [];
	primaryInsurance: any;
	primaryTitle: string;
	CaseTypeSlugEnum=CaseTypeEnum;

	// shouldShowTertiaryInsurance:boolean=false;
	secondaryInsurance: any;

	tertiaryInsurance: any;

	privateHealthInsurance: any;

	public title: string;
	public caseData: CaseModel;
	public caseId: number;
	public patient: PatientModel;
	patientInsuranceCompanies = [];
	addNew = false;
	insuranceType: string = '';
	insurances: any[] = [];
	formReady: boolean = false;
	constructor(
		 aclService: AclService,
		 router: Router,
		 titleService: Title,
		private mainService: MainService,
		private route: ActivatedRoute,
		private localStorage: LocalStorage,
		public fd_services: FDServices,
		private toastrService: ToastrService,
		// private logger: Logger,
		private caseFlowService: CaseFlowServiceService,
		private customDiallogService : CustomDiallogService,
		requestService: RequestService,
		private el:ElementRef
	) {
		super(aclService,router,route,requestService,titleService);	
		this.route.snapshot.pathFromRoot.forEach((path) => {
			if (path && path.params && path.params.caseId) {
				if (!this.caseId) {
					this.caseId = path.params.caseId;
				}
			}
		});


		//this.getCase();
	}
	public form1: FormGroup;
	public form2: FormGroup;
	public form3: FormGroup;
	// @ViewChild('insu1') InsuranceFormComponent: InsuranceFormComponent;
	// @ViewChild('insu2') InsuranceFormComponent1: InsuranceFormComponent;
	// @ViewChild('insu3') InsuranceFormComponent2: InsuranceFormComponent;
	// @ViewChild(HealthInsuranceFormComponent) HealthInsuranceFormComponent: HealthInsuranceFormComponent;

	InsuranceFormComponent: InsuranceFormComponent;
	@ViewChild('insuranceForm') set bodyPartInsuranceFormComponentcontent(content: InsuranceFormComponent) {
	  if (content) { // initially setter gets called with undefined
		this.InsuranceFormComponent = content;
		if(!this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_insurance_info_edit))
			{
		this.InsuranceFormComponent.form.disable();
		
			}
	  }
	}
	InsuranceFormComponent1: InsuranceFormComponent;
	@ViewChild('insuranceForm1') set bodyPartInsuranceFormComponent1content(content: InsuranceFormComponent) {
		if (content) { // initially setter gets called with undefined
		  this.InsuranceFormComponent1 = content;
		  if(!this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_insurance_info_edit))
			{
		  this.InsuranceFormComponent1.form.disable();
		 
			}
		}
	  }

	  InsuranceFormComponent2: InsuranceFormComponent;
	  @ViewChild('insuranceForm2') set bodyPartInsuranceFormComponent2content(content: InsuranceFormComponent) {
		  if (content) { // initially setter gets called with undefined
			this.InsuranceFormComponent2 = content;
			if(!this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_insurance_info_edit))
			{
				this.InsuranceFormComponent2.form.disable();
				
			}
			
		  }
		}
		HealthInsuranceFormComponent: HealthInsuranceFormComponent;
		@ViewChild(HealthInsuranceFormComponent)  set bodyPartHealthInsuranceFormComponentcontent(content: HealthInsuranceFormComponent) {
			if (content) { // initially setter gets called with undefined
			  this.HealthInsuranceFormComponent = content;
			  if(!this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_insurance_info_edit))
			  {
				  this.HealthInsuranceFormComponent.form.disable();
				  
			  }
			  
			}
		  }

	ngAfterViewInit() {
		this.getCase();
		
		if(!this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_insurance_info_edit))
		{
			
			// this.disableFormAndHideButton();
		}

		// this.getChildProperty();
	}

	disableFormAndHideButton() {
		// let control = getFieldControlByName(this.fieldConfig, 'button-div');
		// this.InsuranceFormComponent.form.disable();
		// this.InsuranceFormComponent1.form.disable();
		// this.InsuranceFormComponent2.form.disable();
		// this.HealthInsuranceFormComponent.form.disable()
		// this.form1.disable();
		// this.form2.disable();
		// this.form3.disable();
		this.isFormDisabled=true;

	}



	getChildProperty() {
		this.form1 = this.InsuranceFormComponent.form;
		this.form2 = this.InsuranceFormComponent1.form;
		this.form3 = this.InsuranceFormComponent2.form;

	}

	showTertiaryInsurance: boolean = true;
	onSecondaryInsuranceReady(event: FormGroup) {
		event.controls['secondary_dialog'].valueChanges.subscribe(data => {
			if (this.caseData&&this.caseData.case_type&&(( this.caseData&&this.caseData.case_type&&this.caseData.case_type.slug === CaseTypeEnum.auto_insurance) || 
			( this.caseData&&this.caseData.case_type&&(this.caseData.case_type.slug === CaseTypeEnum.worker_compensation || this.caseData.case_type.slug === CaseTypeEnum.worker_compensation_employer)) || 
			( this.caseData&&this.caseData.case_type&&this.caseData.case_type.slug === CaseTypeEnum.auto_insurance_worker_compensation))) {
				if (data === DialogEnum.yes) {
					this.showTertiaryInsurance = true;
				} else {
					this.showTertiaryInsurance = false;
				}
			}
		})
	}

	ngOnInit() {
		this.caseFlowService.addScrollClasses();
		this.titleService.setTitle(this.route.snapshot.data['title']);
		this.title = this.route.snapshot.data['title'];
		this.mainService.setLeftPanel(FRONT_DESK_LINKS);
		this.route.snapshot.pathFromRoot.forEach((path) => {
			if (path && path.params && path.params.caseId) {
				if (!this.caseId) {
					this.caseId = path.params.caseId;
				}
			}
		});
		//this.getCase();
	}

	getCase(callback?) {
		this.subscription.push(
			this.caseFlowService.getCase(this.caseId).subscribe((res) => {
				if (res.status == 200) {
					this.caseData = res['result'].data;
					callback ? callback() : null;
					this.assingValues();
					this.formReady = true;
					this.setLienForm();
					// this.tertiaryFormReset()
					if (!this.caseData.insurance) {
					}

				}
			}),
		);
	}

	assingValues() {
		this.patient = this.caseFlowService.case.patient;
		let insuranceData = this.caseData.insurance;



		if (this.caseData.is_finalize) { this.isFormDisabled = false; this.toggleForm() }

		if (insuranceData) {
			this.primaryInsurance = insuranceData.primary_insurance;
			this.secondaryInsurance = insuranceData.secondary_insurance;
			this.tertiaryInsurance = insuranceData.tertiary_insurance;
			this.privateHealthInsurance = insuranceData.private_health_insurance;
			this.isFormDisabled = false;

		}

	}


	getCaseEmitter() {		
		this.getCase();
	}

	ngOnDestroy() {
		this.caseFlowService.removeScrollClasses();
		unSubAllPrevious(this.subscription);
		// this.logger.log('insurance Component OnDestroy Called');
	}
	canDeactivate() {


		try {
			let form1 = this.InsuranceFormComponent.form
			let form2 = this.InsuranceFormComponent1.form
			let form3 = this.InsuranceFormComponent2.form
			let form4 = this.HealthInsuranceFormComponent.form

			return (form1 && form1.dirty && form1.touched) || (form2 && form2.dirty && form2.touched) || (form3 && form3.dirty && form3.touched) || (form4 && form4.dirty && form4.touched)

		} catch (e) {
			return false;
		}
		// return ((this.form1.dirty && this.form1.touched) || (this.form2.dirty && this.form2.touched) || (this.form3.dirty && this.form3.touched));
	}
	getPrimaryTitle() {
		return this.caseFlowService.getPrimaryTitle()
	}

	shouldShowPrimary() {
		return this.caseFlowService.shouldShowPrimary()
	}
	isFormDisabled: boolean = false;
	toggleForm() {


		if (this.isFormDisabled) {
			this.InsuranceFormComponent ? this.InsuranceFormComponent.form.enable() : null
			this.InsuranceFormComponent1 ? this.InsuranceFormComponent1.form.enable() : null
			this.InsuranceFormComponent2 ? this.InsuranceFormComponent2.form.enable() : null
			this.HealthInsuranceFormComponent ? this.HealthInsuranceFormComponent.form.enable() : null
		}
		else {


			this.InsuranceFormComponent ? this.InsuranceFormComponent.form.disable() : null
			this.InsuranceFormComponent1 ? this.InsuranceFormComponent1.form.disable() : null
			this.InsuranceFormComponent2 ? this.InsuranceFormComponent2.form.disable() : null
			this.HealthInsuranceFormComponent ? this.HealthInsuranceFormComponent.form.disable() : null
		}

		this.isFormDisabled = !this.isFormDisabled

	}

	goBack() {
		this.caseFlowService.goBack()
	}

	

	save(event) {
		debugger;
		if (this.InsuranceFormComponent)
			this.InsuranceFormComponent.dynamiccomponent.disableHiddenControlsPublic()
		if (this.InsuranceFormComponent1)
			this.InsuranceFormComponent1.dynamiccomponent.disableHiddenControlsPublic()
		if (this.InsuranceFormComponent2)
			this.InsuranceFormComponent2.dynamiccomponent.disableHiddenControlsPublic()
		if (this.HealthInsuranceFormComponent)
			this.HealthInsuranceFormComponent.dynamiccomponent.disableHiddenControlsPublic()


		let form1 = this.InsuranceFormComponent ? this.InsuranceFormComponent.form : new FormGroup({})
		let form2 = this.InsuranceFormComponent1 ? this.InsuranceFormComponent1.form : new FormGroup({})
		let form3 = this.InsuranceFormComponent2 ? this.InsuranceFormComponent2.form : new FormGroup({})
		let form4 = this.HealthInsuranceFormComponent ? this.HealthInsuranceFormComponent.form : new FormGroup({})
		if(this.ScrollToError(form1,form2,form3,form4)) {
			return;
		}
		let bool_form1 = form1 ? form1.valid : true;
		let bool_form2 = form2 ? form2.valid : true;
		let bool_form3 = form3 ? form3.valid : true;
		let bool_form4 = form4 ? form4.valid : true
		if (bool_form1 && (bool_form2 || !this.showSecondaryInsurance) && (bool_form3 || !this.showTertiaryInsurance) && bool_form4) {
			let data = { primary_health: form1 ? form1.getRawValue() : null, secondary_health: form2.getRawValue(), tertiary_health: form3.getRawValue(), private_health: form4.getRawValue() }
			// this.toggleForm()  commented it ,bcz it disable field and hide save and continue button when its on last allowed route
			if(data && data.private_health && data.private_health.dob)
			{	
				data.private_health.dob= data.private_health.dob? changeDateFormat(data.private_health.dob) : null;
			}
			this.caseFlowService.updateCase(this.caseId, data).subscribe(data => {
				

				if (this.InsuranceFormComponent)
					this.InsuranceFormComponent.dynamiccomponent.enableHiddenControlsPublic()
				if (this.InsuranceFormComponent1)
					this.InsuranceFormComponent1.dynamiccomponent.enableHiddenControlsPublic()
				if (this.InsuranceFormComponent2)
					this.InsuranceFormComponent2.dynamiccomponent.enableHiddenControlsPublic()
				if (this.HealthInsuranceFormComponent)
					this.HealthInsuranceFormComponent.dynamiccomponent.enableHiddenControlsPublic()

				this.getCase(callback => {

					form1 ? form1.reset({},{ emitEvent: false }) : null
					form2 ? form2.reset({},{ emitEvent: false }) : null
					form3 ? form3.reset({},{ emitEvent: false }) : null
					form4 ? form4.reset({},{ emitEvent: false }) : null

					this.caseFlowService.goToNextStep()
				})
				this.caseFlowService.getPersonalInformation(this.caseId).subscribe(data => {
				})
				this.toastrService.success('Successfully Updated', 'Success')

			}, err => {
				if (this.InsuranceFormComponent)
					this.InsuranceFormComponent.dynamiccomponent.enableHiddenControlsPublic()
				if (this.InsuranceFormComponent1)
					this.InsuranceFormComponent1.dynamiccomponent.enableHiddenControlsPublic()
				if (this.InsuranceFormComponent2)
					this.InsuranceFormComponent2.dynamiccomponent.enableHiddenControlsPublic()
				if (this.HealthInsuranceFormComponent)
					this.HealthInsuranceFormComponent.dynamiccomponent.enableHiddenControlsPublic()
			})
		} else {
			if (this.InsuranceFormComponent)
				this.InsuranceFormComponent.dynamiccomponent.enableHiddenControlsPublic()
			if (this.InsuranceFormComponent1)
				this.InsuranceFormComponent1.dynamiccomponent.enableHiddenControlsPublic()
			if (this.InsuranceFormComponent2)
				this.InsuranceFormComponent2.dynamiccomponent.enableHiddenControlsPublic()
			if (this.HealthInsuranceFormComponent)
				this.HealthInsuranceFormComponent.dynamiccomponent.enableHiddenControlsPublic()
		}



	}
	ScrollToError(form1,form2,form3,form4) {
		if(!form1.valid || !form2.valid || !form3.valid || !form4.valid) {
			// FOR GETTING THE CORRECT LOCATION
			if(form4 && form4.controls['insured'] && form4.controls['insured'].invalid || form4 && form4.controls['private_health_dialog'] && form4.controls['private_health_dialog'].invalid || form4 && form4.controls['secondary_dialog'] && form4.controls['secondary_dialog'].invalid ) {
			let firstInvalidControl: HTMLElement =
			this.el.nativeElement.querySelector('form .ng-invalid');
			if(firstInvalidControl){
			this.caseFlowService.scrollToFirstInvalidControl(firstInvalidControl);
			return true;}
			}
			if(form3 && form3.controls['insurance_company'] && form3.controls['insurance_company'].invalid) {
				let firstInvalidControl: HTMLElement =
				this.el.nativeElement.querySelector('form .ng-invalid');
				if(firstInvalidControl){
				this.caseFlowService.scrollToFirstInvalidControl(firstInvalidControl);
				return true;}
			}  if(form2 && form2.controls['insurance_company'] && form2.controls['insurance_company'].invalid ) {
				let firstInvalidControl: HTMLElement =
				this.el.nativeElement.querySelector('form .ng-invalid');
				if(firstInvalidControl){
				this.caseFlowService.scrollToFirstInvalidControl(firstInvalidControl,150);
				return true;
			}
			}  if(form4 && form4.controls['gender'] && form4.controls['gender'].invalid) {
				let firstInvalidControl: HTMLElement =
				this.el.nativeElement.querySelector('form .ng-invalid');
				if(firstInvalidControl) {
				this.caseFlowService.scrollToFirstInvalidControl(firstInvalidControl);
				return true;}
			}  if(form2 && form2.controls['secondary_dialog'] && form2.controls['secondary_dialog'].value == "yes") {
				if(form3 && form3.controls['tertiary_dialog'] && form3.controls['tertiary_dialog'].invalid) {
					let firstInvalidControl: HTMLElement =
					this.el.nativeElement.querySelector('form .ng-invalid');
					if(firstInvalidControl){
					this.caseFlowService.scrollToFirstInvalidControl(firstInvalidControl);
					return true;
					}
				}
			}
			if(!form1.valid || !form2.valid || !form3.valid || !form4.valid) 
			 {
				 if(form3 && form3.controls['tertiary_dialog'] && form3.controls['tertiary_dialog'].invalid) {
					let firstInvalidControl: HTMLElement =
					this.el.nativeElement.querySelector('form .ng-invalid');
					if(firstInvalidControl) {
					this.caseFlowService.scrollToFirstInvalidControl(firstInvalidControl);
					return false;
					}
				 } else {
				let firstInvalidControl: HTMLElement =
				this.el.nativeElement.querySelector('form .ng-invalid:not(div)');
				if(firstInvalidControl) {
				this.caseFlowService.scrollToFirstInvalidControl(firstInvalidControl);
				return true;
			}
		}
			}
			}
	}
	confirmedForBilling(value, form: FormGroup) {
		if (value) {
			// this.confirmationService.create('Are you sure', 'Are you sure you want to change this insurance as your primary?').subscribe(ans => {
			// 	if (ans.resolved) {
			this.InsuranceFormComponent && this.InsuranceFormComponent.form ? this.InsuranceFormComponent.form.controls['confirmed_for_billing'].setValue(false, { emitEvent: false }) : null;
			this.InsuranceFormComponent1 && this.InsuranceFormComponent1.form && this.InsuranceFormComponent1.form.controls['confirmed_for_billing'] ? this.InsuranceFormComponent1.form.controls['confirmed_for_billing'].setValue(false, { emitEvent: false }) : null;
			this.InsuranceFormComponent2 && this.InsuranceFormComponent2.form && this.InsuranceFormComponent2.form.controls['confirmed_for_billing'] ? this.InsuranceFormComponent2.form.controls['confirmed_for_billing'].setValue(false, { emitEvent: false }) : null;
			this.HealthInsuranceFormComponent && this.HealthInsuranceFormComponent.form && this.HealthInsuranceFormComponent.form.controls['confirmed_for_billing'] ? this.HealthInsuranceFormComponent.form.controls['confirmed_for_billing'].setValue(false, { emitEvent: false }) : null

			form?.controls['confirmed_for_billing'].setValue(value, { emitEvent: false })
			// 	} else {
			// 		this.InsuranceFormComponent && this.InsuranceFormComponent.form ? this.InsuranceFormComponent.form.controls['confirmed_for_billing'].setValue(false, { emitEvent: false }) : null;
			// 		this.InsuranceFormComponent1 && this.InsuranceFormComponent1.form && this.InsuranceFormComponent1.form.controls['confirmed_for_billing'] ? this.InsuranceFormComponent1.form.controls['confirmed_for_billing'].setValue(false, { emitEvent: false }) : null;
			// 		this.InsuranceFormComponent2 && this.InsuranceFormComponent2.form && this.InsuranceFormComponent2.form.controls['confirmed_for_billing'] ? this.InsuranceFormComponent2.form.controls['confirmed_for_billing'].setValue(false, { emitEvent: false }) : null;
			// 		this.HealthInsuranceFormComponent && this.HealthInsuranceFormComponent.form && this.HealthInsuranceFormComponent.form.controls['confirmed_for_billing'] ? this.HealthInsuranceFormComponent.form.controls['confirmed_for_billing'].setValue(false, { emitEvent: false }) : null

			// 	}
			// })

		}
	}

	showSecondaryInsurance: boolean = true;
	// showTertiaryInsurance:boolean=true;
	setLienForm() {
		debugger;
		if (this.caseData&&this.caseData.case_type&&(( this.caseData&&this.caseData.case_type&&this.caseData.case_type.slug === CaseTypeEnum.lien) || 
		( this.caseData&&this.caseData.case_type&&this.caseData.case_type.slug === CaseTypeEnum.private_health_insurance) || 
		( this.caseData&&this.caseData.case_type&&this.caseData.case_type.slug === CaseTypeEnum.corporate)) && this.HealthInsuranceFormComponent && this.InsuranceFormComponent1 && this.InsuranceFormComponent2) {


			let healthForm = this.HealthInsuranceFormComponent.form;

			let secondaryForm = this.InsuranceFormComponent1.form;

			let tertiaryForm = this.InsuranceFormComponent2.form;

			this.showSecondaryInsurance = false;
			this.showTertiaryInsurance = false;
			this.subscription.push(healthForm.get('private_health_dialog').valueChanges.subscribe(value => {
				debugger;
				// alert('private_health_dialog vales changes')
				if (value == DialogEnum.yes) {
					this.showSecondaryInsurance = true;
					if(secondaryForm.get('secondary_dialog').value==DialogEnum.yes)
					{
					this.showTertiaryInsurance = true;
					}
					
				} else {
					this.showSecondaryInsurance = false;
					this.showTertiaryInsurance = false;
					// secondaryForm.patchValue({ secondary_dialog: DialogEnum.none }, { emitEvent: false })
					// tertiaryForm.patchValue({ tertiary_dialog: DialogEnum.none }, { emitEvent: false })
				}

			})		
			)
			this.showTertiaryInsurance = false;
			this.subscription.push(secondaryForm.get('secondary_dialog').valueChanges.subscribe(value => {
				debugger;
				if (value == DialogEnum.yes && healthForm.get('private_health_dialog').value === DialogEnum.yes) {
					this.showTertiaryInsurance = true;
				} else {
					this.showTertiaryInsurance = false
					// secondaryForm.patchValue({ secondary_dialog: DialogEnum.none }, { emitEvent: false })
					// tertiaryForm.patchValue({ tertiary_dialog: DialogEnum.none }, { emitEvent: false })
				}
			})
			)	

			if(healthForm.get('private_health_dialog').value === DialogEnum.yes ){
				this.showSecondaryInsurance = true;
				if(secondaryForm.get('secondary_dialog').value === DialogEnum.yes){
					this.showTertiaryInsurance = true;
				}
			}else{
				this.showTertiaryInsurance = false;
				this.showSecondaryInsurance = false;
			}
		}
		else {
			// if (this.caseFlowService.case && (this.caseFlowService.case.case_type_id !== CaseTypeIdEnum.worker_compensation && this.caseFlowService.case.case_type_id !== CaseTypeIdEnum.auto_insurance && this.caseFlowService.case.case_type_id !== CaseTypeIdEnum.lien)) {

			// 	this.showSecondaryInsurance = false;
			// 	this.showTetiary = false;
			// 	// this.form.patchValue({ secondary_dialog: DialogEnum.yes })
			// 	// getFieldControlByName(this.fieldConfig, 'secondary_dialog').classes.push('hidden')
			// }

		}
	}

	tertiaryFormReset($event) 
	{
		debugger;
		if(this.InsuranceFormComponent1.form && this.InsuranceFormComponent2) {
			let tertiaryForm = this.InsuranceFormComponent2.form;
			tertiaryForm.controls['insurance_company'].reset({ emitEvent: true })
			tertiaryForm.controls['adjustor'].reset({ emitEvent: false });
			tertiaryForm.controls['insurance_plan_name_id'].reset();
			tertiaryForm.controls['claim_no'].reset();
			tertiaryForm.controls['policy_no'].reset();
			tertiaryForm.controls['wcb_no'].reset();
			tertiaryForm.controls['prior_authorization_no'].reset();
			tertiaryForm.controls['first_name'].reset();
			tertiaryForm.controls['last_name'].reset();
			tertiaryForm.controls['middle_name'].reset();
			this.tertiaryInsurance&& this.tertiaryInsurance.id? tertiaryForm.patchValue({ is_deleted: true }, { emitEvent: false }):null;
			tertiaryForm.controls['tertiary_dialog'].patchValue(DialogEnum.none,{ emitEvent: false });
	
		}
	}

FormReset($event) 
{
	debugger;
	if(this.caseData&&this.caseData.case_type&&(( this.caseData&&this.caseData.case_type&&this.caseData.case_type.slug === CaseTypeEnum.lien) || 
	( this.caseData&&this.caseData.case_type&&this.caseData.case_type.slug === CaseTypeEnum.private_health_insurance) || 
	( this.caseData&&this.caseData.case_type&&this.caseData.case_type.slug === CaseTypeEnum.corporate)) && this.InsuranceFormComponent1.form && this.InsuranceFormComponent2) 
	{
		this.resetSecondaryForm();
		this.hideSecondaryForm();
		this.resetTertiaryForm();
		this.hideTertiaryForm();	
	}
}

resetSecondaryForm()
{
	let secondaryForm = this.InsuranceFormComponent1.form;
	secondaryForm.controls['insurance_company'].reset({ emitEvent: true })
	secondaryForm.controls['adjustor'].reset({ emitEvent: false });
	secondaryForm.controls['insurance_plan_name_id'].reset();
	secondaryForm.controls['claim_no'].reset();
	secondaryForm.controls['policy_no'].reset();
	secondaryForm.controls['wcb_no'].reset();
	secondaryForm.controls['prior_authorization_no'].reset();
	secondaryForm.controls['first_name'].reset();
	secondaryForm.controls['last_name'].reset();
	secondaryForm.controls['middle_name'].reset();
	this.secondaryInsurance && this.secondaryInsurance.id ?secondaryForm.patchValue({ is_deleted: true }, { emitEvent: false }):null;
	secondaryForm.controls['secondary_dialog'].patchValue(DialogEnum.none ,{ emitEvent: false });
}
hideSecondaryForm()
{
	let secondaryControl = getFieldControlByName(this.InsuranceFormComponent1.fieldConfig, 'form')
		secondaryControl.classes = secondaryControl.classes.filter(className => className != 'hidden')
		secondaryControl.classes.push('hidden');
}

resetTertiaryForm()
{
	let tertiaryForm = this.InsuranceFormComponent2.form;
	tertiaryForm.controls['insurance_company'].reset({ emitEvent: true })
	tertiaryForm.controls['adjustor'].reset({ emitEvent: false });
	tertiaryForm.controls['insurance_plan_name_id'].reset();
	tertiaryForm.controls['claim_no'].reset();
	tertiaryForm.controls['policy_no'].reset();
	tertiaryForm.controls['wcb_no'].reset();
	tertiaryForm.controls['prior_authorization_no'].reset();
	tertiaryForm.controls['first_name'].reset();
	tertiaryForm.controls['last_name'].reset();
	tertiaryForm.controls['middle_name'].reset();
	this.tertiaryInsurance && this.tertiaryInsurance.id?tertiaryForm.patchValue({ is_deleted: true }, { emitEvent: false }):null;
	tertiaryForm.controls['tertiary_dialog'].patchValue(DialogEnum.none ,{ emitEvent: false });
}

hideTertiaryForm()
{
	let tertiaryControl = getFieldControlByName(this.InsuranceFormComponent2.fieldConfig, 'form')
	tertiaryControl.classes = tertiaryControl.classes.filter(className => className != 'hidden')
	tertiaryControl.classes.push('hidden');
}

}
