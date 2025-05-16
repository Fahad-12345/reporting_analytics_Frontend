import { ModalDirective } from 'ngx-bootstrap/modal';
import { Component, OnInit, Input, OnChanges, SimpleChanges, OnDestroy, ViewChild } from '@angular/core';
import { FDServices } from '../../services/fd-services.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Logger } from '@nsalaun/ng-logger';
import { AclService } from '@appDir/shared/services/acl.service';
import { Subscription } from 'rxjs';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { MENU } from '@appDir/shared/layouts/navbar/nav-content';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { CaseFlowServiceService } from '../../services/case-flow-service.service';
import { CommentsModalComponent } from '@appDir/shared/components/case-comments/case-comments.component';
import { Socket } from 'ngx-socket-io';

@Component({
	selector: 'app-case-left-sidebar',
	templateUrl: './case-left-sidebar.component.html',
	styleUrls: ['./case-left-sidebar.component.scss']
})
export class CaseLeftSidebarComponent extends PermissionComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	@Input() caseType: string = '';
	@Input() speciality: string;
	@Input() purpose: string;
	source: string = "./../../../../../assets/images/alert.png";
	@ViewChild('caseCommentsModal') caseCommentsModal:ModalDirective;
	commentComponent: CommentsModalComponent;
	@ViewChild('caseComments') set caseCommentsContent(content: CommentsModalComponent) {
		if (content) { // initially setter gets called with undefined
		  this.commentComponent = content;
		}
	  }
	public links: any[] = [];
	public menu: any[] = [];
	public submenu: any[] = [];
	public ssubmenu: any[] = [];
	public submenu1: any[] = [];
	public privileges: string[];

	public filteredLinks: any[];

	constructor(
		private logger: Logger,
		aclService: AclService,
		activatedRoute: ActivatedRoute,
		public router: Router,
		private caseFlowService: CaseFlowServiceService,
		public socket: Socket,

	) {
		super(aclService, router, activatedRoute);
		this.filteredLinks = [];
	}
	public id: any;

	ngOnDestroy() {
		unSubAllPrevious(this.subscription)
	}

	_shouldShowInsuranceTab: boolean = true;
	_shouldShowInjury: boolean = true;
	_shouldShowReferral: boolean = true;
	_showValidationIconPersonal: boolean = false;
	_shouldShowBasicContact: boolean = true;
	_showValidationIconBasicContact: boolean = false;
	_shouldShowFormFiller: boolean = true;
	_showValidationIconFormFiller: boolean = false;
	_shouldShowEmergencyContact: boolean = true;
	_showValidationIconEmergencyContact: boolean = false;
	_shouldShowGuarantor: boolean = true;
	_showValidationIconGuarantor: boolean = false;
	_showValidationIconPhyInfo: boolean = false;
	_shouldShowInsurance: boolean = true;
	_showValidationIconInsurance: boolean = false;
	_shouldShowEmployer: boolean = true;
	_showValidationIconEmployer: boolean = false;
	_shouldShowAccident: boolean = true;
	_showValidationIconAccident: boolean = false;
	_shouldShowVehicle: boolean = true;
	_showValidationIconVehicle: boolean = false;
	_shouldShowHouseHoldInformation: boolean = true;
	_showValidationIconHouseholdInfo: boolean = false;
	_shouldShowMedical: boolean = true;
	_showValidationIconMedicalTreatment: boolean = false;
	_shouldShowMRI: boolean = true;
	_showValidationIconDiagnosticIntake: boolean = false;
	_personalInfoIcon: boolean = false;
	_insuranceIcon: boolean = false;
	ngOnInit() {
		this.id = this.activatedRoute.snapshot.paramMap.get('caseId');
		this.subscription.push(this.caseFlowService.onCaseUpdated.subscribe(data => {
			this._shouldShowInsuranceTab = this.shouldShowInsuranceTab()
			this._shouldShowInjury = this.shouldShowInjury()
			this._shouldShowReferral = this.shouldShowReferral()
			this._showValidationIconPersonal = this.showValidationIconPersonal()
			this._shouldShowBasicContact = this.shouldShowBasicContact()
			this._showValidationIconBasicContact = this.showValidationIconBasicContact()
			this._shouldShowFormFiller = this.shouldShowFormFiller()
			this._showValidationIconFormFiller = this.showValidationIconFormFiller()
			this._shouldShowEmergencyContact = this.shouldShowEmergencyContact()
			this._showValidationIconEmergencyContact = this.showValidationIconEmergencyContact()
			this._shouldShowGuarantor = this.shouldShowGuarantor()
			this._showValidationIconGuarantor = this.showValidationIconGuarantor()
			this._showValidationIconPhyInfo = this.showValidationIconPhyInfo()
			this._shouldShowInsurance = this.shouldShowInsurance()
			this._showValidationIconInsurance = this.showValidationIconInsurance()
			this._shouldShowEmployer = this.shouldShowEmployer()
			this._showValidationIconEmployer = this.showValidationIconEmployer()
			this._shouldShowAccident = this.shouldShowAccident()
			this._showValidationIconAccident = this.showValidationIconAccident()
			this._shouldShowVehicle = this.shouldShowVehicle();
			this._showValidationIconVehicle = this.showValidationIconVehicle()
			this._shouldShowHouseHoldInformation = this.shouldShowHouseHoldInformation()
			this._showValidationIconHouseholdInfo = this.showValidationIconHouseholdInfo()
			this._shouldShowMedical = this.shouldShowMedical()
			this._showValidationIconMedicalTreatment = this.showValidationIconMedicalTreatment()
			this._shouldShowMRI=this.shouldShowMRI()
			this._showValidationIconDiagnosticIntake = this.showValidationIconDiagnosticIntake()
			this._personalInfoIcon = this.personalInfoIcon()
			this._insuranceIcon = this.insuranceIcon()
		}))

	}
	nav(param) {
		if (!this.id) { return; }
		this.navigatToChild(true, '{id}', this.id, "Patient", "Case List", param)
	}
	
	// navigatToChild(true, '{id}', this.id, parent, child)

	openPayments(){
		// this.router.navigateByUrl('payments/payment-list');
	}
	shouldShowInsuranceTab() {
		 return this.caseFlowService.shouldShowInsurance() || this.caseFlowService.shouldShowMRI() // commented to hide mri implementation
		//return this.caseFlowService.shouldShowInsurance() 
	}
	goToMarketing() {
		if (!this.id) { return; }
		this.router.navigate([`/front-desk/cases/edit/${this.id}/marketing`])
	}

	goToErx(){
		if (!this.id) { return; }
		this.router.navigate([`/front-desk/cases/edit/${this.id}/erx`])
	}
	shouldShowInjury() {
		return this.caseFlowService.shouldShowInjury()
	}
	shouldShowReferral() {
		return !this.caseFlowService.isLawEnforcemnetAgent()
	}
	showValidationIconPersonal() {
		return this.caseFlowService.showValidationIconPersonal()
	}
	shouldShowBasicContact() {
		return this.caseFlowService.shouldShowBasicContact()
	}
	showValidationIconBasicContact() {
		return this.caseFlowService.showValidationIconBasicContact()
	}
	shouldShowFormFiller() {
		return this.caseFlowService.shouldShowFormFiller()
	}
	showValidationIconFormFiller() {
		return this.caseFlowService.showValidationIconFormFiller()
	}
	shouldShowEmergencyContact() {
		return this.caseFlowService.shouldShowEmergencyContact()
	}
	showValidationIconEmergencyContact() {
		return this.caseFlowService.showValidationIconEmergencyContact()
	}
	shouldShowGuarantor() {
		return this.caseFlowService.shouldShowGuarantor()
	}
	showValidationIconGuarantor() {
		return this.caseFlowService.showValidationIconGuarantor()
	}
	showValidationIconPhyInfo() {
		return this.caseFlowService.showValidationIconPhyInfo()
	}
	shouldShowInsurance() {
		return this.caseFlowService.shouldShowInsurance()
	}
	showValidationIconInsurance() {
		return this.caseFlowService.showValidationIconInsurance()
	}
	shouldShowEmployer() {
		return this.caseFlowService.shouldShowEmployer()
	}
	showValidationIconEmployer() {
		return this.caseFlowService.showValidationIconEmployer()
	}
	shouldShowAccident() {
		return this.caseFlowService.shouldShowAccident()
	}
	showValidationIconAccident() {
		return this.caseFlowService.showValidationIconEmployer()
	}
	shouldShowVehicle() {
		return this.caseFlowService.shouldShowVehicle()
	}
	showValidationIconVehicle() {
		return this.caseFlowService.showValidationIconVehicle()
	}
	shouldShowHouseHoldInformation() {
		return this.caseFlowService.shouldShowHouseHoldInformation()
	}
	showValidationIconHouseholdInfo() {
		return this.caseFlowService.showValidationIconHouseholdInfo()
	}
	shouldShowMedical() {
		return this.caseFlowService.shouldShowMedical()
	}
	showValidationIconMedicalTreatment() {
		return this.caseFlowService.showValidationIconMedicalTreatment()
	}
	shouldShowMRI() {
		return this.caseFlowService.shouldShowMRI()
	}
	showValidationIconDiagnosticIntake() {
		return this.caseFlowService.showValidationIconDiagnosticIntake()
	}
	personalInfoIcon() {
		if(this._showValidationIconPersonal || (this._shouldShowBasicContact && this._showValidationIconBasicContact) ||
		(this._shouldShowFormFiller && this._showValidationIconFormFiller) || (this._shouldShowEmergencyContact && this._showValidationIconEmergencyContact) ||
		(this._shouldShowGuarantor && this._showValidationIconGuarantor)) {
			return true
		}
		return false
	}
	insuranceIcon() {
		if((this._shouldShowInsurance && this._showValidationIconInsurance) || (this._shouldShowEmployer && this._showValidationIconEmployer) ||
		(this._shouldShowAccident && this._showValidationIconAccident) || (this._shouldShowVehicle && this._showValidationIconVehicle) || (this._shouldShowHouseHoldInformation && this._showValidationIconHouseholdInfo) ||
		(this._shouldShowMedical && this._showValidationIconMedicalTreatment) || (this._shouldShowMRI && this._showValidationIconDiagnosticIntake)) {
			return true
		}
		return false
	}
	goToInsurance() {
		if (this.caseFlowService.shouldShowAttorney()) {
			if(this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_insurance_tab))
			{
				this.router.navigate([`/front-desk/cases/edit/${this.id}/case-insurance/insurance`])

			}
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_attorney_tab))
			{
				this.router.navigate([`/front-desk/cases/edit/${this.id}/case-insurance/attorney`])

			}
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_employer_tab))
			{
				this.router.navigate([`/front-desk/cases/edit/${this.id}/case-insurance/employer`])

			}
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_accident_tab))
			{
				this.router.navigate([`/front-desk/cases/edit/${this.id}/case-insurance/accident`])

			}
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_vehicle_tab))
			{
				this.router.navigate([`/front-desk/cases/edit/${this.id}/case-insurance/vehicle`])

			}
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_household_tab))
			{
				this.router.navigate([`/front-desk/cases/edit/${this.id}/case-insurance/house-hold-info`])

			}
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_medical_treatment_tab))
			{
				this.router.navigate([`/front-desk/cases/edit/${this.id}/case-insurance/medical-treatment`])

			}
			
		}
		else {
				if(this.caseFlowService.shouldShowMRI())
				{
					this.router.navigate([`/front-desk/cases/edit/${this.id}/case-insurance/mri-intakes`])
				}
				else
				{
					this.router.navigate([`/front-desk/cases/edit/${this.id}/case-insurance/insurance`])
				} // commented to hide mri implementation
			
		} 
		// else
		// {
		// 	this.router.navigate([`/front-desk/cases/edit/${this.id}/case-insurance/insurance`]) // add this line when  hide mri implementation
		// }
	}
	goToPatientSummary() {
		
		this.router.navigate([`/front-desk/cases/edit/${this.id}/patient/patient_summary`])
	}

	openCaseComments() {
		debugger;
		if (!this.id) { return; }
		///this.commentComponent.toggleAllSelection();
		this.commentComponent.selectedCategories = [];
		let data = {case_id:+(this.id)};
		this.socket.emit('GETCASECOMMENTS', data);

		this.commentComponent.comments=[];
		this.commentComponent.form.reset();
		this.commentComponent.addCategoryList=[];
		this.commentComponent.presentPage=1;
		this.commentComponent.searchUsers = null;
		this.commentComponent.form.controls['object_id'].setValue(null);
		this.commentComponent.searchedUsers=[];
		this.commentComponent.selectedUserForComment=[];
		// if (this.commentComponent && this.commentComponent.searchUserElement){
		// this.commentComponent.searchUserElement.selectedItems = null;
		// this.commentComponent.searchUserElement.selectedValues = null;
		// }

		this.commentComponent.showCategory =true;
		this.caseCommentsModal.show();
		this.commentComponent.getComments();
	
	}

	setHeightDefaul() {
		debugger;
		var textarea:any = document.getElementById('textAreaComment');
		if (textarea ){
		textarea.setAttribute('style','');
		}
		if (textarea && textarea.value){
		textarea.value = "";
		}
				// this.commentComponent.inputCommentTextArea.nativeElement.style.height = '36px !important';
	}
}
