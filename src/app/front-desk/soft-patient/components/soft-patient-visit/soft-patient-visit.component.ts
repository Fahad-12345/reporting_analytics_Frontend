import { changeDateFormat, removeEmptyAndNullsFormObject, unSubAllPrevious } from '@shared/utils/utils.helpers';
import { attorney } from './../../../models/attorneyModel';
import { CaseFlowServiceService } from './../../../fd_shared/services/case-flow-service.service';
import { CaseInfoFormComponent } from './../case-info-component/case-info-component';
import { CaseFlowUrlsEnum } from '@appDir/front-desk/fd_shared/models/CaseFlowUrlsEnum';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { PatientFormUrlsEnum } from './../../../patient/patient-form/PatientForm-Urls-enum';
import { PatientSoftFormComponent } from './../patient-form-component/patient-form.component';
import { D, E } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, Input, OnInit, ViewChild, EventEmitter, Output, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {MatStepperModule} from '@angular/material/stepper';
import { MatStepper } from '@angular/material/stepper';
import { getFieldControlByName } from '@appDir/shared/dynamic-form/helper';
import { SoftPatientCreateAppointmentComponent } from '../soft-patient-create-appointment/soft-patient-create-appointment.component';
import { ActivatedRoute, Router } from '@angular/router';
import { SoftPatientEnum } from '../../enums/CaseFlowUrlsEnum';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { LoaderService } from '@appDir/shared/services/loader.service';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { SoftPatientService } from '../../services/soft-patient-service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';



@Component({
  selector: 'app-soft-patient-visit-componet',
  templateUrl: './soft-patient-visit.component.html',
  styleUrls: ['./soft-patient-visit.component.scss']
})
export class SoftPatientVisitComponent implements OnInit,OnDestroy {

	isLinear = true;
	// patinetFormGroup: Dynamic;
	caseFormGroup: FormGroup;
	creatAppointmentFormGroup: FormGroup;
	patientId: number;
	caseId:number;
	caseTypeId:number;
	case:any;
	appointmentId:number;
	startLoader: boolean = false;
	@ViewChild('stepper') stepperComponent: MatStepper;
	@ViewChild('patientSoftRegistrationComponent') patientSoftRegistrationComponent: PatientSoftFormComponent;
	@ViewChild('createCaseComponent') createCaseComponent : CaseInfoFormComponent;
	@ViewChild('createAppointment') createAppointment : SoftPatientCreateAppointmentComponent;
  	@Input() addSoftPatientProviderCalandar=false;
	@Output() closeModalEmitter=new EventEmitter<any>();
	subscription: Subscription[] = [];
	
	disabledClassStepper : boolean;
	constructor(private _formBuilder: FormBuilder,
		private requestService: RequestService,
		 private caseFlowService: CaseFlowServiceService,
		 private route: ActivatedRoute,
		 private router: Router,
		 private cd: ChangeDetectorRef,
		 private toasterService: ToastrService,private loaderService:LoaderService,
		 private customDiallogService: CustomDiallogService,
		 public softCaseService: SoftPatientService,
		 public modalService:NgbModal
		) {}
  
	ngOnInit() {
		this.subscription.push(this.loaderService.startLoader$.subscribe(startLoader=>{
			this.startLoader=startLoader;
		}));
		this.subscription.push(this.route.params.subscribe(params => {
			this.patientId = params['id']?+params['id']:null; // (+) converts string 'id' to a numbe
		 }));
		 this.subscription.push(this.route.queryParams.subscribe(params=>{
			this.caseId=params['caseId']?+params['caseId']:null;
			this.appointmentId=params['appointmentId']?+params['appointmentId']:null;
		 }))
	//   this.patinetFormGroup = this.patientSoftRegistrationComponent.form
	//   this.secondFormGroup = 

	this.subscription.push(this.softCaseService.pullCaseInfoTab().subscribe(res => {
		if(res!=0){
			this.patientId = res;
		}
	})
	);
	}

	ngOnDestroy(): void {
		unSubAllPrevious(this.subscription);
	}
	
	selectedIndex($event:any){
		let id = $event.selectedIndex; 

		switch (id){
			case 0: {
				if (this.patientId) {
					// this.toggleStepperClass();
					this.patientSoftRegistrationComponent.getPatient(this.patientId);
				}
				break;
			}
			case 1:{
				// this.toggleStepperClass();
				this.getCaseInfo();
				break;
			}
			case 2: {
				// this.toggleStepperClass();
				if (this.caseId){
					this.subscription.push(this.caseFlowService.getCase(this.caseId,"soft_register").subscribe(data => {
						this.softCaseService.pushPatientCaseInfo(data?.result?.data);
				  }));
				}
				if(this.appointmentId)
				{
					this.createAppointment?.getAppointmentData(this.appointmentId);
				}
				else
				{
					this.createAppointment.getDropdownLists();
				}
				
				break;
			}
		}
	}

	getCaseInfo(){
		if (this.caseId){
			this.subscription.push(this.caseFlowService.getCase(this.caseId,"soft_register").subscribe(data => {
			this.case = data['result']['data'];
			this.createCaseComponent.case = this.case;
			this.createCaseComponent.caseId = this.case.id;
			let selfPatient={
				patient:{
					personal:{
						first_name:  this.case && this.case.patient?this.case.patient.first_name:null,
						middle_name:	this.case && this.case.patient?this.case.patient.middle_name:null,
						last_name: this.case && this.case.patient?this.case.patient.last_name:null,
						ssn: this.case && this.case.patient?this.case.patient.ssn:null,
						gender: this.case && this.case.patient?this.case.patient.gender:null,
						dob: this.case && this.case.patient?changeDateFormat(this.case.patient.dob):null,
					},
					contact_information:{
						patient:{
							cell_phone :this.case && this.case.patient?this.case.patient.cell_phone:null,
						}
					}

				}
			}
			this.caseFlowService.softCase = selfPatient;
			// this.createCaseComponent.getPosition();
			this.createCaseComponent.onReady(this.createCaseComponent.form);

		  }));
		}
		else
		{
			this.createCaseComponent.onReady(this.createCaseComponent.form);
		}

	}



	patientEditForm($event) {
		// $event['is_soft_registered'] =true;
		this.subscription.push(this.requestService.sendRequest(PatientFormUrlsEnum.Patient_Update_PATCH, 'PUT', REQUEST_SERVERS.kios_api_path, $event).subscribe(res => {
				if (res['status'] == 200) {

					this.patientId = res['result']['data'] && res['result']['data']['patient_personal']['id'] ? res['result']['data']['patient_personal']['id'] : null;
					
					this.stepperComponent.next();
					getFieldControlByName(this.patientSoftRegistrationComponent.fieldConfig, 'button-div').configs.disabled = false;
					this.toasterService.success('Patient Updated Successfully','Success');
				}
			},
				(err) => {
					getFieldControlByName(this.patientSoftRegistrationComponent.fieldConfig, 'button-div').configs.disabled = false;
				}));
	}


	patientAddForm(dataFormate){
		this.subscription.push(this.requestService.sendRequest(PatientFormUrlsEnum.Patient_Verificaiton_API, 'POST', REQUEST_SERVERS.kios_api_path, dataFormate).subscribe(res => {
				if (res && res.result && res.result.data && res.result.data.patient_exists){
					this.patientSoftRegistrationComponent.exisitPatientId = res.result.data.patient_id;
					this.patientSoftRegistrationComponent.duplicate_patient_is_active=res.result.data.is_active;
					this.patientSoftRegistrationComponent.openDuplicateModal(dataFormate);		
				}
				else {
					getFieldControlByName(this.patientSoftRegistrationComponent.fieldConfig, 'button-div').configs.disabled = false;
					this.patientSoftRegistrationComponent.addPatient(dataFormate);

				}

			}));

	}

	patientAddedSucuss($event){
		this.patientId = $event;
		this.toasterService.success("Patient Added Successfully",'Success')
		this.cd.detectChanges();
		getFieldControlByName(this.patientSoftRegistrationComponent.fieldConfig, 'button-div').configs.disabled = false;
		this.stepperComponent.next();
		// setTimeout(()=>{
		// 	this.stepperComponent.next();

		// },0)
		
	}

	submitCase($event){
		
		// this.createCaseComponent.onSubmit(this.createCaseComponent.form);
		let reqObj=this.makeRequestObj($event)
		reqObj=removeEmptyAndNullsFormObject(reqObj)
		// $event['patient_id'] = this.patientId;
		// $event['is_soft_registered'] = true;
		this.subscription.push(this.requestService.sendRequest(SoftPatientEnum.createSoftCase, 'post', REQUEST_SERVERS.kios_api_path, reqObj).subscribe(response=>{
			if (response.status) {
				

				if (
					response &&
					response.result &&
					response.result.data &&
					response.result.data.case_exists
				) {
					let message = `Duplicate case found against Case Id ${response.result.data.id}.`;
					this.customDiallogService
						.confirm(
							'Duplicate Case Found',
							message,
							'Create a New Case',
							'Go to Existing Case',
							'sm',
							'btn btn-danger',
						)
						.then((confirmed) => {
							
							if (confirmed===true) {
								
								reqObj['case_info']['check_duplicate'] = false;
								this.requestService.sendRequest(SoftPatientEnum.createSoftCase, 'post', REQUEST_SERVERS.kios_api_path, reqObj).subscribe(response=>{
									this.caseCreateCommonFunctionality(response, $event);
								},err=>{
									this.createCaseComponent.isBtnSubmitDisabled=false;
								});
							} else if(confirmed===false) {
								
								if (response.result.data && response.result.data.is_active) {
									if(this.modalService.hasOpenModals())
										{
											this.modalService.dismissAll();
										}
									this.router.navigate(['front-desk/cases/list'], 
									{queryParams:{pagination: true,page:1,per_page:10,filter:true,order_by:'DESC',id: response.result.data.id} }); 
								} else {
									if(this.modalService.hasOpenModals())
										{
											this.modalService.dismissAll();
										}
									this.router.navigate(['front-desk/soft-patient/list'], 
									{queryParams:{pagination: true,page:1,per_page:10,filter:true,order_by:'DESC',case_id: response.result.data.id} }) 
								}
							}
							else
							{

								this.createCaseComponent.isBtnSubmitDisabled=false;
								return;
							}
						});
				}else{
			
					this.caseCreateCommonFunctionality(response, $event);
				}
			}
		},error=>{
			this.createCaseComponent.isBtnSubmitDisabled=false;
		}));
		
	}

	updateCase($event){
		let reqObj=this.makeRequestObj($event,true)
		reqObj=removeEmptyAndNullsFormObject(reqObj)
		this.subscription.push(this.requestService.sendRequest(`${CaseFlowUrlsEnum.UpdateSession}?caseId=${this.createCaseComponent.caseId}`,
			 'put', REQUEST_SERVERS.kios_api_path, reqObj).subscribe(response=>{
			
			if (response.status){
				this.toasterService.success("Case Updated Successfully",'Success')
				this.caseTypeId=$event.case_information.case_type_id;
				this.cd.markForCheck();
				this.cd.detectChanges();
				this.createCaseComponent.isBtnSubmitDisabled=false;
				this.stepperComponent.next();
			}
		},error=>{
			this.createCaseComponent.isBtnSubmitDisabled=false;
		}));
		
	}
makeRequestObj($event,isUpdate=false)
{
	if($event.case_information && $event.case_information.advertisement &&!$event.case_information.advertisement.account_manager)
	{
		$event.case_information.advertisement.account_manager=null;
	}

	// let case_info= {
	// 		request_from_front_desk: true,
	// 		is_soft_registered: true,
	// 		practice_locations:$event.case_information.practice_locations&&$event.case_information.practice_locations?$event.case_information.practice_locations:[],
			
	// 		category_id: $event.case_information.category_id?$event.case_information.category_id:null,
	// 		purpose_of_visit_id:  $event.case_information.purpose_of_visit_id?$event.case_information.purpose_of_visit_id:null,
	// 		case_type_id: $event.case_information.case_type_id,
	// 		patient_id:this.patientId,
	// 		accident_date:  $event.case_information.accident_date? $event.case_information.accident_date:null,
	// 		check_duplicate: false
	// 	};

	let obj={
		// case_info: {
		// 	request_from_front_desk: true,
		// 	is_soft_registered: true,
		// 	practice_locations:$event.case_information.practice_locations&&$event.case_information.practice_locations?$event.case_information.practice_locations:[],
			
		// 	category_id: $event.case_information.category_id?$event.case_information.category_id:null,
		// 	purpose_of_visit_id:  $event.case_information.purpose_of_visit_id?$event.case_information.purpose_of_visit_id:null,
		// 	case_type_id: $event.case_information.case_type_id,
		// 	patient_id:this.patientId,
		// 	accident_date:  $event.case_information.accident_date? $event.case_information.accident_date:null,
		// 	check_duplicate: false
		// },
		attorney:{
			firm_id: $event.case_information.firm_id?$event.case_information.firm_id:null,
			attorney_id: $event.case_information.attorney && $event.case_information.attorney.attorney_id?$event.case_information.attorney.attorney_id:null,
			attorney_verified: $event.case_information.attorney?$event.case_information.attorney.attorney_verified:null,
			// contact_information: {},
			// id: $event.case_information.id?$event.case_information.id:null, //??
			id:this.case && this.case.attorney ?this.case.attorney.id:null, //??
			attorney:$event.case_information.attorney?$event.case_information.attorney:{},
			information: $event.case_information.firm_location?$event.case_information.firm_location:null,
			firm_verified: $event.case_information.firm_verified,
			firm_location_id: $event.case_information.firm_location_id
		},
		primary_health:
		{
			id:this.case && this.case.insurance && this.case.insurance.primary_insurance ?this.case.insurance.primary_insurance.id:null, //??
			is_deleted: $event.case_information && $event.case_information.is_deleted,
			insurance_company:$event.case_information && $event.case_information.insurance_company?$event.case_information.insurance_company:null,
			adjustor:$event.case_information && $event.case_information.adjustor?$event.case_information.adjustor:null},
		private_health:$event.private_health?$event.private_health:null,
		
		advertisement:$event.case_information.advertisement && !$event.case_information.advertisement.id && !$event.case_information.advertisement.account_manager?null:$event.case_information.advertisement
		
	}
	let req;
	let case_info:any={}
	if(isUpdate)
	{
		 case_info= {
			request_from_front_desk: true,
			// is_soft_registered: true,
			practice_locations:$event.case_information.practice_locations&&$event.case_information.practice_locations?$event.case_information.practice_locations:[],
			is_transferring_case: $event.case_information.is_transferring_case,
			category_id: $event.case_information.category_id?$event.case_information.category_id:null,
			purpose_of_visit_id:  $event.case_information.purpose_of_visit_id?$event.case_information.purpose_of_visit_id:null,
			case_type_id: $event.case_information.case_type_id,
			// patient_id:this.patientId,
			// accident_date:  $event.case_information.accident_date?changeDateFormat( $event.case_information.accident_date):null,
			// check_duplicate: false
			accident_information :{
				accident_date :$event.case_information.accident_date?changeDateFormat( $event.case_information.accident_date):null,
				id: this.case && this.case.accident&&this.case.accident.accident_information?this.case.accident.accident_information.id:null,
			}
		};
		req={...obj,...case_info}
	}
	else
	{
		 case_info= {
			request_from_front_desk: true,
			is_soft_registered: true,
			practice_locations:$event.case_information.practice_locations&&$event.case_information.practice_locations?$event.case_information.practice_locations:[],
			is_transferring_case: $event.case_information.is_transferring_case,
			category_id: $event.case_information.category_id?$event.case_information.category_id:null,
			purpose_of_visit_id:  $event.case_information.purpose_of_visit_id?$event.case_information.purpose_of_visit_id:null,
			case_type_id: $event.case_information.case_type_id,
			patient_id:this.patientId,
			accident_date:  $event.case_information.accident_date? changeDateFormat($event.case_information.accident_date):null,
			check_duplicate: true
		};
		req={...obj,case_info:case_info}
	}

	if(req &&( (req.primary_health.id &&req.primary_health.is_deleted===false) || (!req.primary_health.id  &&req.primary_health.is_deleted===true) || (!req.primary_health.id  &&req.primary_health.is_deleted===false))&& req.private_health && req.private_health.is_deleted===false )
	{
		delete req.primary_health;
	}

	if(!req.private_health)
	{

		if(this.case&& this.case.insurance && this.case.insurance.private_health_insurance&& this.case.insurance.private_health_insurance.id)
		{
			req.private_health={
				id:this.case.insurance.private_health_insurance.id,
				is_deleted:true
			}
		}
	}
	// if(this.case)
	// {
	// 	delete obj.case_info.is_soft_registered;
	// 	delete obj.case_info.check_duplicate;
	// }
	return req?req:{}
}
	back(event)
	{
		this.stepperComponent.previous();
	}
	
	toggleStepperClass(){
			const data: any[] = [0,1,2];
			data.forEach(res => {
				const className = 'cdk-step-label-0-'+res;
				if(document.getElementById(className).children[1].classList.contains('mat-step-icon-selected')){
					document.getElementById(className).classList.add('done-stepper');
				}else{
					document.getElementById(className).classList.remove('done-stepper');
				}	
				if(document.getElementById(className).children[1].classList.contains('mat-step-icon-state-edit')){
					document.getElementById(className).classList.add('edit-stepper');
				}else{
					document.getElementById(className).classList.remove('edit-stepper');
				}
			});

	}

	moveToCaseInfoTab(e){
		if(e){
			this.caseFlowService.softCase = e;
			this.cd.detectChanges();
			getFieldControlByName(this.patientSoftRegistrationComponent.fieldConfig, 'button-div').configs.disabled = false;
			this.caseFlowService.check_duplication_of_soft_case = true;
			this.stepperComponent.next();
		}
	}

	caseCreateCommonFunctionality(response, $event){
		this.caseId=response && response.result&& response.result.data && response.result.data.attorney &&  response.result.data.attorney.case_id;
				this.caseTypeId=$event.case_information.case_type_id
				this.toasterService.success("Case Created Successfully",'Success')
				this.createCaseComponent.caseId = this.caseId;
				this.createAppointment.data = response?.result?.data;
				this.createCaseComponent.isBtnSubmitDisabled=false;
				this.cd.markForCheck();
				this.cd.detectChanges();
				if(this.addSoftPatientProviderCalandar)
				{
					this.closeModalEmitter.emit({caseId:this.caseId})
				}
				else
				{
					this.stepperComponent.next();
				}
	}

	moveToNextTab(e){
		if(e){
			this.caseFlowService.softCase = e;
			this.patientId = e.id;
			this.cd.detectChanges();
			getFieldControlByName(this.patientSoftRegistrationComponent.fieldConfig, 'button-div').configs.disabled = false;
			this.caseFlowService.check_duplication_of_soft_case = true;
			this.stepperComponent.next();
		}
	}
}
