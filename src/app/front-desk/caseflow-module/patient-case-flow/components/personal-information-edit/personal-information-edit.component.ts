import { Component, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { Logger } from '@nsalaun/ng-logger';
import { FDServices } from 'app/front-desk/fd_shared/services/fd-services.service';
import { MainService } from '@shared/services/main-service';
import { FRONT_DESK_LINKS } from 'app/front-desk/models/leftPanel/leftPanel';
import { Patient } from 'app/medical-doctor/models/common/commonModels';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { LocalStorage } from '@shared/libs/localstorage';
import { Title } from '@angular/platform-browser';
import { trackByHourSegment } from '@appDir/scheduler-front-desk/modules/assign-speciality/utils/my-calendar/src/modules/common/util';
import { AclService } from '@appDir/shared/services/acl.service';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Subscription } from 'rxjs';
import { CasesServiceService } from '@appDir/front-desk/cases/cases-service.service';
import { MENU } from '@appDir/shared/layouts/navbar/nav-content';
import { CaseModel } from '@appDir/front-desk/fd_shared/models/Case.model';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { RequestService } from '@appDir/shared/services/request.service';

@Component({
	selector: 'app-personal-information-edit',
	templateUrl: './personal-information-edit.component.html',
})
export class PersonalInformationEditComponent extends PermissionComponent implements OnChanges, OnDestroy {
	subscription: Subscription[] = [];

	public patient: Patient;
	public accident: any;
	public caseData: any;
	public patientId: number;
	public caseId: number;
	public contactInfo: any;
	public caseType: number;
	public casePatientDetails: any[] = [];
	public formFiller: any = {};
	public emergencyContact: any = {};
	public legalGuardian: any = {};
	public guarantor: any = {};
	_showValidationIconPersonal: boolean = false;
	_showValidationIconBasicContact: boolean = false;
	_showValidationIconFormFiller: boolean = false;
	_showValidationIconEmergencyContact: boolean = false;
	_showValidationIconGuarantor: boolean = false;
	source: string = "./../../../../../assets/images/alert.png";

	constructor(
		titleService: Title,
		public aclService: AclService,
		private logger: Logger,
		route: ActivatedRoute,
		private fd_services: FDServices,
		private mainServices: MainService,
		private toastrService: ToastrService,
		private localStorage: LocalStorage,
		public router: Router,
		private _route: ActivatedRoute,
		private caseService: CasesServiceService,
		public caseFlowService: CaseFlowServiceService,
		protected requestService: RequestService,
		
	) {
		super(aclService, router, _route, requestService, titleService);
		titleService.setTitle(route.snapshot.data['title']);
		route.snapshot.pathFromRoot.forEach((path) => {
			if (path && path.params && path.params.caseId) {
				if (!this.caseId) {
					this.caseId = path.params.caseId;
				}
			}
		});
	}

	case: CaseModel;
	ngOnInit() {
		this.caseFlowService.onCaseUpdated.subscribe(data => {
			this._shouldShowBasicContact = this.shouldShowBasicContact()
			this._shouldShowEmergencyContact = this.shouldShowEmergencyContact()
			this._shouldShowFormFiller = this.shouldShowFormFiller()
			this._shouldShowGuarantor = this.shouldShowGuarantor()
			this._showValidationIconPersonal = this.showValidationIconPersonal()
			this._showValidationIconBasicContact = this.showValidationIconBasicContact()
			this._showValidationIconFormFiller = this.showValidationIconFormFiller()
			this._showValidationIconEmergencyContact = this.showValidationIconEmergencyContact()
			this._showValidationIconGuarantor = this.showValidationIconGuarantor()
		})
		this.mainServices.setLeftPanel(FRONT_DESK_LINKS);
		// this.titleService.setTitle(this.route.snapshot.data['title']);

		// this.fd_services.getCaseDetail(this.caseId).subscribe(data => {
		// 	this.case = data.result.data
		// })

	}



	ngOnChanges() {}



	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}

	onTabClick(url) {
		var route = "front-desk/cases/edit/" + this.caseId + "/patient/personal-information"
		this.router.navigate([route + url])
	}

	_shouldShowGuarantor: boolean = true;
	shouldShowGuarantor() {

		return this.caseFlowService.shouldShowGuarantor()
		// if (this.case) {
		// 	return this.case && this.case.patient && this.case.patient.age && this.case.patient.age < 18 ? true : false
		// }
		// else false;
	}
	_shouldShowFormFiller: boolean = true;
	shouldShowFormFiller() {
		// return true;

		return this.caseFlowService.shouldShowFormFiller()
	}

	_shouldShowEmergencyContact: boolean = true;
	shouldShowEmergencyContact() {

		return this.caseFlowService.shouldShowEmergencyContact()
	}

	_shouldShowBasicContact: boolean = true;
	shouldShowBasicContact() {

		return this.caseFlowService.shouldShowBasicContact()
	}

	isActive(route) {
		return this.router.url.includes(route)
	}

	showValidationIconPersonal() {
		return this.caseFlowService.showValidationIconPersonal()
	}

	showValidationIconBasicContact() {
		return this.caseFlowService.showValidationIconBasicContact()
	}

	showValidationIconFormFiller() {
		return this.caseFlowService.showValidationIconFormFiller()
	}

	showValidationIconEmergencyContact() {
		return this.caseFlowService.showValidationIconEmergencyContact()
	}

	showValidationIconGuarantor() {
		return this.caseFlowService.showValidationIconGuarantor()
	}
}
