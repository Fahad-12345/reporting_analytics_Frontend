import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MainService } from '@shared/services/main-service';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { FRONT_DESK_LINKS } from 'app/front-desk/models/leftPanel/leftPanel';
import { Logger } from '@nsalaun/ng-logger';
import { LocalStorage } from '@shared/libs/localstorage';
import { FDServices } from 'app/front-desk/fd_shared/services/fd-services.service';
import { Subscription } from 'rxjs';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { CanDeactivateComponentInterface } from '@appDir/shared/canDeactivateFormsComponent/CanDeactivateComponent.interface';
import { ReportFormComponent } from '@appDir/front-desk/fd_shared/components/report-form/report-form.component';
import { VehicleInfoFormComponent } from '@appDir/front-desk/caseflow-module/case-insurance/vehicle/components/vehicle-info-form/vehicle-info-form.component';
import { FormGroup } from '@angular/forms';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { ToastrService } from 'ngx-toastr';
@Component({
	selector: 'app-vehicle',
	templateUrl: './vehicle.component.html',
	styleUrls: ['./vehicle.component.scss'],
})
export class VehicleComponent implements OnInit, OnDestroy, CanDeactivateComponentInterface {
	subscription: Subscription[] = [];
	public title: string;
	public caseData: any;
	public caseId: number;
	vehicleInfos = [];
	constructor(
		private router: Router,
		private mainService: MainService,
		private titleService: Title,
		private route: ActivatedRoute,
		private localStorage: LocalStorage,
		private fd_services: FDServices,
		private logger: Logger,
		private caseFlowService: CaseFlowServiceService,
		private toastrService: ToastrService,

	) {
		this.titleService.setTitle(this.route.snapshot.data['title']);
		this.route.snapshot.pathFromRoot.forEach((path) => {
			if (path && path.params && path.params.caseId) {
				if (!this.caseId) {
					this.caseId = path.params.caseId;
				}
			}
		});
		// this.subscription.push(
		// 	this.fd_services.currentCase.subscribe((c) => {
		// 		if (c) {
		// 			this.caseData = c;
		// 			if (!this.caseData.id) {
		// 				this.getCase();
		// 			}
		// 		}
		// 	}),
		// );
		this.getCase();

	}
	public form1: FormGroup;
	public form2: FormGroup;
	// @ViewChild(ReportFormComponent) ReportFormComponent: ReportFormComponent;
	@ViewChild(VehicleInfoFormComponent) VehicleInfoFormComponent: VehicleInfoFormComponent;
	ngAfterViewInit() {
		this.getChildProperty();
	}
	getChildProperty() {
		// this.form1 = this.ReportFormComponent.reportForm;
		this.form2 = this.VehicleInfoFormComponent.vehicleForm;
	}
	ngOnInit() {
		this.mainService.setLeftPanel(FRONT_DESK_LINKS);
		this.titleService.setTitle(this.route.snapshot.data['title']);
		this.title = this.route.snapshot.data['title'];

		this.getCase();
	}

	getCase() {
		this.subscription.push(
			this.caseFlowService.getCase(this.caseId).subscribe((res) => {
				if (res.status == 200) {
					// this.fd_services.setCase(res.data.case);
					this.caseData = res.result.data;
					if (this.caseData) {
						this.vehicleInfos = this.caseData.vehicle_information;
					}
				}

			}, err => {
				this.toastrService.error(err.error, 'Error')
			}),
		);
	}

	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
		this.logger.log('Vahicle.component OnDestroy Called');
	}
	canDeactivate() {
		return ((this.form2.dirty && this.form2.touched));
	}
}
