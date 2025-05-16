import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MainService } from '@shared/services/main-service';
// import { FRONT_DESK_LINKS } from '../models/leftPanel/leftPanel';
import { ToastrService } from 'ngx-toastr';
// import { FDServices } from '../fd_shared/services/fd-services.service';
import { LocalStorage } from '@shared/libs/localstorage';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Logger } from '@nsalaun/ng-logger';
import { PhysicianInformation, AddressInfo } from './models/referrals.models';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Subscription } from 'rxjs';
import { CanDeactivateComponentInterface } from '@appDir/shared/canDeactivateFormsComponent/CanDeactivateComponent.interface';
// import { ReferringFormComponent } from '../fd_shared/components/referring-form/referring-form.component';
import { FormGroup } from '@angular/forms';
import { ReferrEditComponent } from './components/referr-edit/referr-edit.component';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { ReferringFormComponent } from '@appDir/front-desk/caseflow-module/referrals/components/referring-form/referring-form.component';
import { FRONT_DESK_LINKS } from '@appDir/front-desk/models/leftPanel/leftPanel';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';

@Component({
	selector: 'app-referrals',
	templateUrl: './referrals.component.html',
})
export class ReferralsComponent implements OnInit, OnDestroy, CanDeactivateComponentInterface {
	subscription: Subscription[] = [];
	public referrals: any[];
	public advertisement: any[];
	public isReferralEdit: Boolean = false;
	public isAdvertisment: Boolean = false;
	_showValidationIconPhyInfo: boolean = false;
	source: string = "./../../../../../assets/images/alert.png";
	public title: string;
	public caseData: any;
	public caseId: number;
	public referring: PhysicianInformation;
	public primaryCare: PhysicianInformation;
	public form1: FormGroup;
	// public form2: FormGroup;
	public deactiveSubscription: Subscription;

	constructor(
		private mainService: MainService,
		private toastrService: ToastrService,
		private fd_services: FDServices,
		private localStorage: LocalStorage,
		private titleService: Title,
		private route: ActivatedRoute,
		private logger: Logger,
		public caseFlowService: CaseFlowServiceService
	) {
		this.route.snapshot.pathFromRoot.forEach((path) => {
			if (path && path.params && path.params.caseId) {
				if (!this.caseId) {
					this.caseId = path.params.caseId;
				}
			}
		});

		this.subscription.push(
			this.fd_services.currentCase.subscribe((c) => {
				this.caseData = c;
				if (!this.caseData.id) {
					this.getCase();
				} else {
					let referrer = this.caseData.referringDoctors;
					if (referrer) {
						for (let x in referrer) {
							if (referrer[x].type == 'Referring') {
								this.referring = referrer[x];
								this.referring.caseId = this.caseId;
							} else if (!referrer.type) {
								this.primaryCare = referrer[x];
								this.primaryCare.caseId = this.caseId;
							}
						}
						if (!this.referring) {
							this.referring = this.initReferringData();
						}
						if (!this.primaryCare) {
							this.primaryCare = this.initReferringData();
						}
					} else {
						this.referring = this.initReferringData();
						this.primaryCare = this.initReferringData();
					}
				}
			}),
		);
	}

	@ViewChild('form1') childReferring1: ReferringFormComponent;
	// @ViewChild('form2') childReferring2: ReferringFormComponent;
	ngAfterViewInit() {
		this.getChildProperty();
	}
	getChildProperty() {
		this.form1 = this.childReferring1.form;
		// this.form2 = this.childReferring2.form;
	}
	initReferringData() {
		return new PhysicianInformation({
			caseId: this.caseId,
			firstName: '',
			middleName: '',
			lastName: '',
			clinicName: '',
			referringDoctorAddressInfos: new AddressInfo({
				mailingStreet: '',
				mailingApartment: '',
				mailingCity: '',
				mailingState: '',
				mailingZip: '',
				email: '',
				cellPhone: '',
			}),
		});
	}
	ngOnInit() {
		this.caseFlowService.onCaseUpdated.subscribe(data => {
			this._showValidationIconPhyInfo = this.showValidationIconPhyInfo()
		})
		this.mainService.setLeftPanel(FRONT_DESK_LINKS);
		this.titleService.setTitle(this.route.snapshot.data['title']);
		this.title = this.route.snapshot.data['title'];
		this.getCase();
	}

	getCase() {
		this.subscription.push(
			this.fd_services.getCaseDetail(this.caseId).subscribe(
				(res) => {
					// this.logger.log('case', res);
					if (res.statusCode == 200) {
						this.fd_services.setCase(res.data.case);
						this.caseData = res.data.case;
						this.assignValues();
					}
				},
				(err) => {
					// this.toastrService.error(err.message, 'Error');
				},
			),
		);
	}

	assignValues() {
		this.referrals = this.caseData.refferedBies;
		this.advertisement = this.caseData.advertisements;
	}

	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
		this.logger.log('referrals On Destroy Called');
	}
	canDeactivate() {
		return ((this.form1.dirty && this.form1.touched));
	}
	showValidationIconPhyInfo() {
		return this.caseFlowService.showValidationIconPhyInfo()
	}
}
