import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorage } from '@shared/libs/localstorage';
import { FDServices } from 'app/front-desk/fd_shared/services/fd-services.service';
import { ToastrService } from 'ngx-toastr';
import { MainService } from '@shared/services/main-service';
import { FRONT_DESK_LINKS } from 'app/front-desk/models/leftPanel/leftPanel';
import { CanDeactivateComponentInterface } from '@appDir/shared/canDeactivateFormsComponent/CanDeactivateComponent.interface';
import { FormGroup } from '@angular/forms';
import { MedicalTreatmentFormComponent } from '@appDir/front-desk/caseflow-module/case-insurance/medical-treatment/components/medical-treatment-form/medical-treatment-form.component';
import { TreatmentGeneralFormComponent } from '@appDir/front-desk/fd_shared/components/treatment-general-form/treatment-general-form.component';
import { Subscription } from 'rxjs';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';

@Component({
	selector: 'app-medical-treatment',
	templateUrl: './medical-treatment.component.html',
	styleUrls: ['./medical-treatment.component.scss']
})
export class MedicalTreatmentComponent extends PermissionComponent implements OnInit, CanDeactivateComponentInterface {

	public caseData: any;
	public caseId;
	public form1: FormGroup;
	subscription: Subscription[] = [];
	// public form2: FormGroup;
	loaderSpin = true;
	@ViewChild(MedicalTreatmentFormComponent) MedicalTreatmentFormComponent: MedicalTreatmentFormComponent;
	@ViewChild(TreatmentGeneralFormComponent) TreatmentGeneralFormComponent: TreatmentGeneralFormComponent;
	ngAfterViewInit() {
		this.getChildProperty();
	}
	getChildProperty() {
		this.form1 = this.MedicalTreatmentFormComponent.form;
		// this.form2 = this.TreatmentGeneralFormComponent.form;
	}
	constructor(router: Router,
		private caseFlowService: CaseFlowServiceService, private mainService: MainService, private route: ActivatedRoute, private localStorage: LocalStorage, private fd_services: FDServices, private toastrService: ToastrService, titleService: Title, aclService: AclService,
	) {
		super(aclService);
		titleService.setTitle(this.route.snapshot.data['title']);

		this.route.snapshot.pathFromRoot.forEach(path => {
			if (path && path.params && path.params.caseId) {
				if (!this.caseId) {
					this.caseId = path.params.caseId;
				}
			}
		})
		// this.fd_services.currentCase.subscribe(c => {
		//   this.caseData = c;
		//   if(!this.caseData.id){
		//       this.getCase() 
		//   }
		// })
		this.getCase()
	}

	ngOnInit() {
		this.mainService.setLeftPanel(FRONT_DESK_LINKS)
		this.getCase()
	}

	getCase() {
		// let route = 'medical_treatment'
		this.loaderSpin = true;
		this.subscription.push(
			this.caseFlowService.getCase(this.caseId).subscribe((res) => {
				if (res.status == 200) {
					this.caseData = res.result.data
					this.fd_services.setCase(res.data)
					setTimeout(() => {
						this.loaderSpin = false;
					},1000)
				}
			}))
	}
	canDeactivate() {
		if (this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_medical_treatment_view))
			return ((this.form1.dirty && this.form1.touched));
	}
}
