import { FormGroup, Validators } from '@angular/forms';
import { AfterViewInit, Component, ComponentFactoryResolver, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild, ViewContainerRef } from "@angular/core";
import { CaseModel, DialogEnum, MRI, MriIntake1 } from "@appDir/front-desk/fd_shared/models/Case.model";
import { InputTypes } from "@appDir/shared/dynamic-form/constants/InputTypes.enum";
import { CheckboxClass } from "@appDir/shared/dynamic-form/models/Checkbox.class";
import { DivClass } from "@appDir/shared/dynamic-form/models/DivClass.class";
import { DynamicControl } from "@appDir/shared/dynamic-form/models/DynamicControl.class";
import { FieldConfig } from "@appDir/shared/dynamic-form/models/fieldConfig.model";
import { InputClass } from "@appDir/shared/dynamic-form/models/InputClass.class";
import { RadioButtonClass } from "@appDir/shared/dynamic-form/models/RadioButtonClass.class";
import { unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
import { getFieldControlByName } from '@appDir/shared/dynamic-form/helper';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AddPriorSurgeryFormComponent } from './components/prior-surgery/add-prior-surgery-Form/add-prior-surgery-Form.componet';
import { AddPriorDiagnosticImagingFormComponent } from './components/prior-diagnostic-imaging/add-prior-diagnostic-imaging-Form/add-prior-diagnostic-imaging-Form.componet';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { PriorSurgeryListingComponent } from './components/prior-surgery/prior-surgery-listing/prior-surgery-listing.componet';
import { pairwise, startWith } from 'rxjs/operators';
import {MriIntakeService} from'../../services/mri-intake-service';
import { I } from '@angular/cdk/keycodes';
import { PriorDiagnosticImagingListingComponent } from './components/prior-diagnostic-imaging/prior-diagnostic-imaging-listing/prior-diagnostic-imaging-listing.component';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { ToastrService } from 'ngx-toastr';
@Component({
	selector: 'app-mri-intake1-form',
	templateUrl: './mri-intake1-Form.component.html',
	styleUrls: ['./mri-intake1-Form.component.scss'],
})
//CanDeactivateComponentInterface
export class MRIIntake1FormComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
	fieldConfigMedSympSurgery: FieldConfig[] = [];
	fieldConfigDiagImaging: FieldConfig[] = [];
	fieldConfigPreviousMri: FieldConfig[] = [];
	@Input() caseId: any;
	@Input() MRIData: MRI=new MRI();
	@Input() title = '';
	subscription: any[] = [];
	formMedSympSurgery: FormGroup;
	formDiagImaging: FormGroup;
	formPreviousMri: FormGroup;
	modalRef: NgbModalRef;
	componentRef: any;
	hidepriorSurgeryListingComponent: boolean = true;
	hideDiagnosticImagingListingComponent: boolean = true;
	@ViewChild('priorSurgeryListingComponent')
	priorSurgeryListingComponent: PriorSurgeryListingComponent;
	@ViewChild('DiagnosticImagingListingComponent')
	DiagnosticImagingListingComponent: PriorDiagnosticImagingListingComponent;
	@ViewChild(DynamicFormComponent) dynamiccomponent: DynamicFormComponent;
	constructor(
		public customDiallogService: CustomDiallogService,
		private modalService: NgbModal,
		private MriIntakeService: MriIntakeService,
		public caseFlowService: CaseFlowServiceService,
		private viewContainerRef: ViewContainerRef,private toastrService: ToastrService,
		private componentFactoryResolver: ComponentFactoryResolver,
	) {}
	ngOnInit() {
		this.setfieldConfigMedSympSurgery();
		this.setfieldConfigDiagImaging();
		this.setfieldConfigPreviousMri();
	}
	ngOnChanges(changes: SimpleChanges) {
		debugger;
		if (
			this.formMedSympSurgery &&
			this.formDiagImaging &&
			this.formPreviousMri &&
			this.MRIData &&
			this.MRIData.mri_intake_1
		) {
			this.setFormvalues(this.MRIData.mri_intake_1);
		}
		console.log(changes);
	}
	ngAfterViewInit() {}
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}

	setfieldConfigMedSympSurgery() {
		this.fieldConfigMedSympSurgery = [
			new DivClass(
				[
					new DynamicControl('id', null),
					
					new DynamicControl('check_null', true),
					// new DynamicControl('is_deleted', false),
					// new DynamicControl('case_id', null),

					new InputClass(
						'What Medical Symptoms are you having that are to be evaluated?*',
						'medical_symptoms',
						InputTypes.text,
						'',
						[{ name: 'required', message: 'This field is required', validator: Validators.required }],
						'',
						['col-12 col-xl-4'],
					),
					new RadioButtonClass(
						'Have you had prior surgery or operation(e.g., arthroscopy, endoscopy, etc.) of any kind?*',
						'is_prior_surgery',
						[
							{ name: 'yes', label: 'Yes', value: true },
							{ name: 'no', label: 'No', value: false },
						],
						'',
						[{ name: 'required', message: 'This field is required', validator: Validators.required }],
						['col-12 col-xl-8'],
					),
				],
				['row'],
				'',
				'',
			),
		];
	}

	setfieldConfigDiagImaging() {
		this.fieldConfigDiagImaging = [
			new DivClass(
				[
					new RadioButtonClass(
						'Have you had a prior diagnostic imaging study or examination(MRI, CT, Ultrasound, X-Ray)?*',
						'is_imaging_study',
						[
							{ name: 'yes', label: 'Yes', value: true },
							{ name: 'no', label: 'No', value: false },
						],
						'',
						[{ name: 'required', message: 'This field is required', validator: Validators.required }],
						['col-12 col-xl-12'],
					),
				],
				['row'],
				'',
				'',
			),
		];
	}

	setfieldConfigPreviousMri() {
		this.fieldConfigPreviousMri = [
			new DivClass(
				[
					new RadioButtonClass(
						'Have you experienced any problems related to a previous MRI examination or MRI procedure?*',
						'is_previous_problem',
						[
							{ name: 'yes', label: 'Yes', value: true },
							{ name: 'no', label: 'No', value: false },
						],
						'',
						[{ name: 'required', message: 'This field is required', validator: Validators.required }],
						['col-12 col-xl-8'],
					),
					new InputClass(
						'Description*',
						'previous_problem_description',
						InputTypes.text,
						'',
						[
							{
								name: 'required',
								message: 'This field is required',
								validator: Validators.required,
							},
						],
						'',
						['col-12 col-xl-4', 'hidden'],
					),
				],
				['row'],
				'',
				'',
			),
		];
	}

	onReady(event, form) {
		debugger;
		switch (form) {
			case 'formMedSympSurgery':
				this.formMedSympSurgery = event;
				this.bindIsPriorSurgery();
				break;
			case 'formDiagImaging':
				this.formDiagImaging = event;
				this.bindIsImagingStudy();
				break;
			case 'formPreviousMri':
				this.formPreviousMri = event;
				this.bindIsPreviousProblem();
				break;
		}
	}

	setFormvalues(data: MriIntake1) {
		this.formMedSympSurgery.patchValue({
			id: data.id,
			medical_symptoms: data.medical_symptoms,
			is_prior_surgery: data.is_prior_surgery,
		});
		this.formDiagImaging.patchValue({
			is_imaging_study: data.is_imaging_study,
		});
		this.formPreviousMri.patchValue({
			is_previous_problem: data.is_previous_problem,
			previous_problem_description: data.previous_problem_description,
		});
	}
	deleteSessionMri(data) {
		this.caseFlowService.deleteSessionMri(data).subscribe((res) => {
			debugger;
			this.toastrService.success('Successfully Deleted', 'Success')
			switch (data.to_delete) {
				case 'surgery':
					this.hidepriorSurgeryListingComponent = true;
					this.getStudyDetailsAndSurgeryDetails('surgery_details');
					break;
				case 'study':
					this.hideDiagnosticImagingListingComponent = true;
					this.getStudyDetailsAndSurgeryDetails('study_details');
			}
		});
	}

	bindIsPriorSurgery() {
		this.subscription.push(
			this.formMedSympSurgery.controls['is_prior_surgery'].valueChanges
				.pipe(startWith(this.formMedSympSurgery.controls['is_prior_surgery'].value), pairwise())
				.subscribe(([prev, next]: [any, any]) => {
					debugger;
					if (next) {
						if (
							!this.MRIData ||
							(this.MRIData && !this.MRIData.mri_intake_1) ||
							(this.MRIData && this.MRIData.mri_intake_1 &&!this.MRIData.mri_intake_1.prior_surgery_details) ||
							(this.MRIData && this.MRIData.mri_intake_1 &&this.MRIData.mri_intake_1.prior_surgery_details&&this.MRIData.mri_intake_1.prior_surgery_details.length == 0)
						) {
							if (this.hidepriorSurgeryListingComponent) {
								this.AddEditAddPriorSurgery();
								this.hidepriorSurgeryListingComponent = false;
							}
						}
						this.priorSurgeryListingComponent.mriIntake1Data =
							this.MRIData &&
							this.MRIData.mri_intake_1 &&
							this.MRIData.mri_intake_1.prior_surgery_details
								? this.MRIData.mri_intake_1.prior_surgery_details
								: [];
						this.priorSurgeryListingComponent.mri_id = this.MRIData ? this.MRIData.id : null;
						this.priorSurgeryListingComponent.caseId = this.caseId;

						this.hidepriorSurgeryListingComponent = false;
						this.priorSurgeryListingComponent.mri_intake_id =
							this.MRIData && this.MRIData.mri_intake_1 && this.MRIData.mri_intake_1
								? this.MRIData.mri_intake_1.id
								: null;
					} else {
						if (
							prev &&
							this.MRIData &&
							this.MRIData.mri_intake_1 &&
							this.MRIData.mri_intake_1.prior_surgery_details &&
							this.MRIData.mri_intake_1.prior_surgery_details.length
						) {
							this.customDiallogService
								.confirm('Are you Sure', 'This will delete all existing information?')
								.then((confirmed) => {
									if (confirmed) {
										let data = {
											mri_intake_1_id:
												this.MRIData && this.MRIData.mri_intake_1
													? this.MRIData.mri_intake_1.id
													: null,
											to_delete: 'surgery',
										};

										this.deleteSessionMri(data);
									} else {
										this.formMedSympSurgery.controls['is_prior_surgery'].patchValue(true);
										this.hidepriorSurgeryListingComponent = false;
										return;
									}
								})
								.catch();
						} else {
							this.priorSurgeryListingComponent.mriIntake1Data = null;
							this.priorSurgeryListingComponent.mri_id = null;
							this.priorSurgeryListingComponent.caseId = null;
							this.priorSurgeryListingComponent.mri_intake_id = null;
							this.hidepriorSurgeryListingComponent = true;
						}
					}
				}),
		);
	}
	AddEditAddPriorSurgery() {
		let ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			size: 'lg',
			windowClass: 'modal_extraDOc',
		};
		this.modalRef = this.modalService.open(AddPriorSurgeryFormComponent, ngbModalOptions);
		this.modalRef.componentInstance.data = null;
		this.modalRef.componentInstance.caseId = this.caseId;
		this.modalRef.componentInstance.mri_intake_id =
			this.MRIData && this.MRIData.mri_intake_1 ? this.MRIData.mri_intake_1.id : null;
		this.modalRef.componentInstance.mri_id =
			this.MRIData && this.MRIData.id ? this.MRIData.id : null;
		this.modalRef.result.then((data: any) => {
			debugger;
			if (data) {
				this.reEvaluateForm('surgery_details',data.id?data.id:null, true);
			} else {
				if (!this.MRIData || (this.MRIData&&!this.MRIData.mri_intake_1)
					|| (this.MRIData && this.MRIData.mri_intake_1 && !this.MRIData.mri_intake_1.prior_surgery_details)
					|| (this.MRIData&&this.MRIData.mri_intake_1 && this.MRIData.mri_intake_1.prior_surgery_details && this.MRIData.mri_intake_1.prior_surgery_details.length==0)
				) {
					this.formMedSympSurgery.controls['is_prior_surgery'].patchValue(false);
				} else {
					return;
				}
				
			}
			// if (data) {
			// 	this.onEmployerFormSubmit(data)
			// 	this.reEvaluateForm();
			// } else {
			// 	this.reEvaluateForm();
			// }
		});
	}

	reEvaluateForm(route,mri_id?, isRecordAdded?) {
		
			this.getStudyDetailsAndSurgeryDetails(route,mri_id);
		
	}

	bindIsImagingStudy() {
		this.subscription.push(
			this.formDiagImaging.controls['is_imaging_study'].valueChanges
				.pipe(startWith(this.formDiagImaging.controls['is_imaging_study'].value), pairwise())
				.subscribe(([prev, next]: [any, any]) => {
					debugger;

					if (next) {
						if (
							!this.MRIData || (this.MRIData&&!this.MRIData.mri_intake_1)
					|| (this.MRIData && this.MRIData.mri_intake_1 && !this.MRIData.mri_intake_1.imaging_study_details)
					|| (this.MRIData&&this.MRIData.mri_intake_1 && this.MRIData.mri_intake_1.imaging_study_details && this.MRIData.mri_intake_1.imaging_study_details.length==0)
						) {
							if (this.hideDiagnosticImagingListingComponent) {
								this.AddEditAddPriorDiagnosticImaging();
								this.hideDiagnosticImagingListingComponent = false;
							}
						}
						// else
						// {
						// 	this.AddEditAddPriorDiagnosticImaging();
						// }

						// if(this.MRIData&&this.MRIData.mri_intake_1&&this.MRIData.mri_intake_1.imaging_study_details &&this.MRIData.mri_intake_1.imaging_study_details.length)
						// {
						this.DiagnosticImagingListingComponent.mriIntake1Data =
							this.MRIData &&
							this.MRIData.mri_intake_1 &&
							this.MRIData.mri_intake_1.imaging_study_details
								? this.MRIData.mri_intake_1.imaging_study_details
								: [];
						this.hideDiagnosticImagingListingComponent = false;
						this.DiagnosticImagingListingComponent.mri_id = this.MRIData ? this.MRIData.id : null;
						this.DiagnosticImagingListingComponent.caseId = this.caseId;
						// if(this.MRIData&& this.MRIData.mri_intake_1&& this.MRIData.mri_intake_1.prior_surgery_details&&this.MRIData.mri_intake_1.prior_surgery_details.length)
						// {
						// this.priorSurgeryListingComponent.caseId=this.caseId;
						// this.priorSurgeryListingComponent.mri_id=this.MRIData? this.MRIData.id:null;
						this.DiagnosticImagingListingComponent.mri_intake_id =
							this.MRIData && this.MRIData.mri_intake_1 && this.MRIData.mri_intake_1
								? this.MRIData.mri_intake_1.id
								: null;
						// }
					} else {
						if (
							prev &&
							this.MRIData &&
							this.MRIData.mri_intake_1 &&
							this.MRIData.mri_intake_1.imaging_study_details &&
							this.MRIData.mri_intake_1.imaging_study_details.length
						) {
							this.customDiallogService
								.confirm('Are you Sure', 'This will delete all existing information?')
								.then((confirmed) => {
									if (confirmed) {
										let data = {
											mri_intake_1_id:
												this.MRIData && this.MRIData.mri_intake_1
													? this.MRIData.mri_intake_1.id
													: null,
											to_delete: 'study',
										};

										this.deleteSessionMri(data);
										this.hideDiagnosticImagingListingComponent = true;
									} else {
										this.formDiagImaging.controls['is_imaging_study'].patchValue(true);
										this.hideDiagnosticImagingListingComponent = false;
										return;
									}
								})
								.catch();
						} else {
							this.hideDiagnosticImagingListingComponent = true;
						}
					}
				}),
		);
	}

	AddEditAddPriorDiagnosticImaging() {
		let ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			size: 'lg',
			windowClass: 'modal_extraDOc',
		};
		this.modalRef = this.modalService.open(AddPriorDiagnosticImagingFormComponent, ngbModalOptions);
		this.modalRef.componentInstance.data = null;
		this.modalRef.componentInstance.caseId = this.caseId;
		this.modalRef.componentInstance.mri_intake_id =
			this.MRIData && this.MRIData.mri_intake_1 && this.MRIData.mri_intake_1.id
				? this.MRIData.mri_intake_1.id
				: null;
		this.modalRef.componentInstance.mri_id =
			this.MRIData && this.MRIData.id ? this.MRIData.id : null;
		this.modalRef.result.then((data: any) => {
			debugger;
			if (data) {
				this.reEvaluateForm('study_details',data.id?data.id:null);
			} else {

				if (!this.MRIData || (this.MRIData&&!this.MRIData.mri_intake_1)
					|| (this.MRIData && this.MRIData.mri_intake_1 && !this.MRIData.mri_intake_1.imaging_study_details)
					|| (this.MRIData&&this.MRIData.mri_intake_1 && this.MRIData.mri_intake_1.imaging_study_details && this.MRIData.mri_intake_1.imaging_study_details.length==0)
				) {
					this.formDiagImaging.controls['is_imaging_study'].patchValue(false);
				} else {
					return;
				}
				// this.reEvaluateForm('study_details', false);
			}
			// if (data) {
			// 	this.onEmployerFormSubmit(data)
			// 	this.reEvaluateForm();
			// } else {
			// 	this.reEvaluateForm();
			// }
		});
	}

	bindIsPreviousProblem() {
		this.subscription.push(
			this.formPreviousMri.controls['is_previous_problem'].valueChanges.subscribe((value) => {
				4;
				debugger;
				let previous_problem_description_control = getFieldControlByName(
					this.fieldConfigPreviousMri,
					'previous_problem_description',
				);
				if (value) {
					previous_problem_description_control.classes =
						previous_problem_description_control.classes.filter(
							(className) => className != 'hidden',
						);
				} else {
					previous_problem_description_control.classes.push('hidden');
					this.formPreviousMri.controls['previous_problem_description'].reset('', {
						emitEvent: false,
					});
				}
			}),
		);
	}

	onSubmit(form) {}

	getCase(route,mri_id?) {
		debugger;
		this.subscription.push(
			this.caseFlowService.getCase(this.caseId, route).subscribe((res) => {
				if (res.status == 200) {
					let caseData = res['result'] && res['result'].data ? res['result'].data : null;
					switch (route) {
						case 'study_details':
							if(caseData)
							this.setDiagnosticImagingData(caseData,mri_id)
							break;
						case 'surgery_details':
							if(caseData)
							this.setPriorSurgeryData(caseData,mri_id);
							break;
							
					}
				}
			}),
		);
	}

	setPriorSurgeryData(caseData,mri_id?)
	{
		// if(!this.MRIData)
		// {
		// 	this.MRIData=new MRI();
		// }
		this.MRIData.mri_intake_1.prior_surgery_details = caseData
		? caseData.prior_surgery_details
		: [];
		this.MRIData.id=mri_id?mri_id:this.MRIData.id;
	this.priorSurgeryListingComponent.mriIntake1Data =
		this.MRIData &&
		this.MRIData.mri_intake_1 &&
		this.MRIData.mri_intake_1.prior_surgery_details
			? this.MRIData.mri_intake_1.prior_surgery_details
			: [];
	this.MRIData.mri_intake_1.is_prior_surgery=caseData ?caseData.is_prior_surgery:null
	this.MRIData.mri_intake_1.id=caseData ?caseData.id:null
	this.priorSurgeryListingComponent.mri_id = this.MRIData ? this.MRIData.id : null;
	this.priorSurgeryListingComponent.mri_intake_id =
		this.MRIData && this.MRIData.mri_intake_1 && this.MRIData.mri_intake_1
			? this.MRIData.mri_intake_1.id
			: null;
			this.setMriIntakeId(this.MRIData && this.MRIData.mri_intake_1 && this.MRIData.mri_intake_1
				? this.MRIData.mri_intake_1.id
				: null)	;
	this.priorSurgeryListingComponent.caseId = this.caseId ? this.caseId : null;
		if(this.formMedSympSurgery.controls['is_prior_surgery'].value!==this.MRIData.mri_intake_1.is_prior_surgery)
		{
			this.formMedSympSurgery.controls['is_prior_surgery'].patchValue(this.MRIData.mri_intake_1.is_prior_surgery)
		}

	}

	setDiagnosticImagingData(caseData,mri_id?)
	{
		// if(!this.MRIData)
		// {
		// 	this.MRIData=new MRI();
		// }
		this.MRIData.mri_intake_1.imaging_study_details = caseData
		? caseData.imaging_study_details
		: [];
		this.MRIData.id=mri_id?mri_id:this.MRIData.id;
	this.DiagnosticImagingListingComponent.mriIntake1Data =
		this.MRIData &&
		this.MRIData.mri_intake_1 &&
		this.MRIData.mri_intake_1.imaging_study_details
			? this.MRIData.mri_intake_1.imaging_study_details
			: [];
	this.MRIData.mri_intake_1.is_imaging_study=caseData ?caseData.is_imaging_study:null
	this.MRIData.mri_intake_1.id=caseData ?caseData.id:null
	this.DiagnosticImagingListingComponent.mri_id = this.MRIData ? this.MRIData.id : null;
	this.DiagnosticImagingListingComponent.mri_intake_id =
		this.MRIData && this.MRIData.mri_intake_1 && this.MRIData.mri_intake_1
			? this.MRIData.mri_intake_1.id
			: null;
			this.setMriIntakeId(this.MRIData && this.MRIData.mri_intake_1 && this.MRIData.mri_intake_1
				? this.MRIData.mri_intake_1.id
				: null)	;
	this.DiagnosticImagingListingComponent.caseId = this.caseId ? this.caseId : null;
		if(this.formDiagImaging.controls['is_imaging_study'].value!==this.MRIData.mri_intake_1.is_imaging_study)
		{
			this.formDiagImaging.controls['is_imaging_study'].patchValue(this.MRIData.mri_intake_1.is_imaging_study)
		}

	}

	setMriIntakeId(id:number)
	{
		if(id)
		{
			this.formMedSympSurgery.controls['id'].patchValue(id);
		}
		
	}

	getStudyDetailsAndSurgeryDetails(route,mri_id?) {
		debugger;
		this.getCase(route,mri_id);
	}

	// createPriorSurgeryListingComponent(){
	// 	debugger;
	// 	const componentFactory = this.componentFactoryResolver.resolveComponentFactory(PriorSurgeryListingComponent);
	// 	const containerRef = this.viewContainerRef;

	// 	containerRef.clear();
	// 	 this.componentRef=containerRef.createComponent(componentFactory);
	// 	this.componentRef.instance.mriIntake1Data=this.MRIData&&this.MRIData.mri_intake_1&&this.MRIData.mri_intake_1.prior_surgery_details?this.MRIData.mri_intake_1.prior_surgery_details:[]
	// 	// this.MriIntakeService.MriIntake1PriorSurgeryRefreshListingData(this.MRIData.mri_intake_1);

	// }
	// destroyComponent() {
	//     this.componentRef.destroy();
	// }
}
