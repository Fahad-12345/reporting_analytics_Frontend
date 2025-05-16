import { Component, OnInit, OnDestroy } from '@angular/core';
import { MainService } from '@shared/services/main-service';
// import { FRONT_DESK_LINKS } from '../models/leftPanel/leftPanel';
import { Title } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
// import { FDServices } from '../fd_shared/services/fd-services.service';
import { LocalStorage } from '@shared/libs/localstorage';
import { AclService } from '@appDir/shared/services/acl.service';
// import { PermissionComponent } from '../permission.abstract.component';
import { MENU } from '@appDir/shared/layouts/navbar/nav-content';
// import { CaseFlowServiceService } from '../fd_shared/services/case-flow-service.service';
// import { CaseTypeIdEnum } from '../fd_shared/models/CaseTypeEnums';
import { Subscription } from 'rxjs';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { FRONT_DESK_LINKS } from '@appDir/front-desk/models/leftPanel/leftPanel';
@Component({
	selector: 'app-case-insurance',
	templateUrl: './case-insurance.component.html',
	styleUrls: ['./case-insurance.component.scss']
})
export class CaseInsuranceComponent extends PermissionComponent implements OnInit, OnDestroy {
	public caseData: any;
	public caseId;
	public patientInsuranceCompanies: any = []
	subscription: Subscription[] = []
	_showValidationIconInsurance: boolean = false;
	_showValidationIconEmployer: boolean = false;
	_showValidationIconAccident: boolean = false;
	_showValidationIconVehicle: boolean = false;
	_showValidationIconHouseholdInfo: boolean = false;
	_showValidationIconMedicalTreatment: boolean = false;
	_showValidationIconDiagnosticIntake: boolean = false;
	source: string = "./../../../../../assets/images/alert.png";

	constructor(private mainService: MainService,
		aclService: AclService,
		private localStorage: LocalStorage, router: Router, private fd_services: FDServices,
		//  private titleService: Title,
		private toastrService: ToastrService, private route: ActivatedRoute,
		public caseFlowService: CaseFlowServiceService) {
		super(aclService, router);
		this.route.snapshot.pathFromRoot.forEach(path => {
			if (path && path.params && path.params.caseId) {
				if (!this.caseId) {
					this.caseId = path.params.caseId;
				}
			}
		})
	}
	public menu: any[] = [];
	public submenu: any[] = [];
	public ssubmenu: any[] = [];
	public submenu1: any[] = [];
	ngOnDestroy() {
		unSubAllPrevious(this.subscription)
	}
	ngOnInit() {
		//;
		this.mainService.setLeftPanel(FRONT_DESK_LINKS);
		this.subscription.push(this.caseFlowService.onCaseUpdated.subscribe(data => {
			this._shouldShowInsurance = this.shouldShowInsurance()
			this._shouldShowAttorney = this.shouldShowAttorney();
			this._shouldShowEmployer = this.shouldShowEmployer()
			this._shouldShowAccident = this.shouldShowAccident();
			this._shouldShowVehicle = this.shouldShowVehicle();
			this._shouldShowMedical = this.shouldShowMedical();
			this._shouldShowHouseHoldInformation = this.shouldShowHouseHoldInformation();
			this._shouldShowMRI=this.shouldShowMRI(); // commented to hide MRI intake implementation
			this._showValidationIconInsurance = this.showValidationIconInsurance()
			this._showValidationIconEmployer = this.showValidationIconEmployer()
			this._showValidationIconAccident = this.showValidationIconAccident()
			this._showValidationIconVehicle = this.showValidationIconVehicle()
			this._showValidationIconHouseholdInfo = this.showValidationIconHouseholdInfo()
			this._showValidationIconMedicalTreatment = this.showValidationIconMedicalTreatment()
			this._showValidationIconDiagnosticIntake = this.showValidationIconDiagnosticIntake()
		}))
		// this.menu = MENU.filter(m => m.priv_title == "Patient").map(m => m.submenu);
		// this.submenu = this.menu[0].filter(m => m.priv_title == "Case List").map(m => m.submenu);
		// this.submenu1 = this.submenu[0].filter(m => m.priv_title == "Insurance").map(m => m.submenu);
		// this.ssubmenu = this.submenu1[0];
		// for (let i in this.ssubmenu) {
		//   if (this.aclService.hasPermission(this.ssubmenu[i].priv_key)) {
		//     const phrase = this.ssubmenu[i].link;
		//     const stripped = phrase.replace(/{id}/gi, this.caseId)
		//     this.router.navigate([stripped]);

		//     return true;
		//   }
		// }
		// this.titleService.setTitle('Insurance')

		// if(this.fd_services.isEmpty(this.caseData)) {
		//   this.getCase()
		// } else {
		//   this.assignValues()
		// }
	}
	// shouldShowVehicleTab() {
	//   return this.caseFlowService.shouldShowVehicleTab()
	// }
	// shouldShowHouseHoldTab() {
	//   return this.caseFlowService.shouldShowHouseHoldTab()
	// }
	// shouldShowMedicalTreatmentTab() {
	//   return this.caseFlowService.shouldShowMedicalTreatmentTab()
	// }
	// getCase() {
	//   this.fd_services.getCaseDetail(this.caseId).subscribe(res =>  {
	//     if(res.statusCode == 200) {
	//       this.caseData = res.data.case
	//       this.assignValues()
	//     }
	//   })
	// }

	// assignValues() {
	//   this.patientInsuranceCompanies = this.caseData.patientInsuranceCompanies
	// }

	_shouldShowInsurance: boolean = true;
	shouldShowInsurance() {
		// return true;
		return this.caseFlowService.shouldShowInsurance()
	}
	_shouldShowAttorney: boolean = true;
	shouldShowAttorney() {
		return this.caseFlowService.shouldShowAttorney()
	}
	_shouldShowEmployer: boolean = true;
	shouldShowEmployer() {
		return this.caseFlowService.shouldShowEmployer()
	}
	_shouldShowAccident: boolean = true;
	shouldShowAccident() {
		return this.caseFlowService.shouldShowAccident()
	}
	_shouldShowVehicle: boolean = true;
	shouldShowVehicle() {
		return this.caseFlowService.shouldShowVehicle()
	}
	_shouldShowMedical: boolean = true;
	shouldShowMedical() {
		return this.caseFlowService.shouldShowMedical()
	}
	_shouldShowHouseHoldInformation: boolean = true;
	shouldShowHouseHoldInformation() {
		return this.caseFlowService.shouldShowHouseHoldInformation()
	}
	_shouldShowMRI: boolean = true;
	shouldShowMRI() {
		return this.caseFlowService.shouldShowMRI()
	}
	showValidationIconInsurance() {
		return this.caseFlowService.showValidationIconInsurance()
	}
	showValidationIconEmployer() {
		return this.caseFlowService.showValidationIconEmployer()
	}
	showValidationIconAccident() {
		return this.caseFlowService.showValidationIconAccident()
	}
	showValidationIconVehicle() {
		return this.caseFlowService.showValidationIconVehicle()
	}
	showValidationIconHouseholdInfo() {
		return this.caseFlowService.showValidationIconHouseholdInfo()
	}
	showValidationIconMedicalTreatment() {
		return this.caseFlowService.showValidationIconMedicalTreatment()
	}
	showValidationIconDiagnosticIntake() {
		return this.caseFlowService.showValidationIconDiagnosticIntake()
	}
}
