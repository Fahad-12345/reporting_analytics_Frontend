import { Component, OnInit, ViewChild } from '@angular/core';
import { MainService } from '@shared/services/main-service';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { FRONT_DESK_LINKS } from 'app/front-desk/models/leftPanel/leftPanel';
import { FDServices } from 'app/front-desk/fd_shared/services/fd-services.service';
import { Logger } from '@nsalaun/ng-logger';
import { LocalStorage } from '@shared/libs/localstorage';
import { CanDeactivateComponentInterface } from '@appDir/shared/canDeactivateFormsComponent/CanDeactivateComponent.interface';
import { FormGroup } from '@angular/forms';
import { BodypartsFormComponent } from '@appDir/front-desk/fd_shared/components/bodyparts-form/bodyparts-form.component';
import { Subscription } from 'rxjs';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';

@Component({
	selector: 'app-bodypart-edit',
	templateUrl: './bodypart-edit.component.html',
})
export class BodypartEditComponent implements OnInit, CanDeactivateComponentInterface {

	public title: string;
	public caseData: any;
	public caseId: number;
	public bodyparts: any[] = []

	constructor(private titleService: Title,
		private caseFlowService: CaseFlowServiceService, private mainService: MainService, private logger: Logger, private route: ActivatedRoute, private localStorate: LocalStorage,
		private fd_services: FDServices) {
		// this.caseId = +this.localStorate.get('caseId')
		// this.fd_services.currentCase.subscribe(c => this.caseData = c)
		this.titleService.setTitle(this.route.snapshot.data['title']);
		this.route.snapshot.pathFromRoot.forEach(path => {
			if (path && path.params && path.params.caseId) {
				// alert('before if not'+this.caseId);
				if (!this.caseId) {
					this.caseId = path.params.caseId;
					// alert('in if not'+this.caseId);
				}
			}
		})

		// this.fd_services.currentCase.subscribe(c => {
		//   this.caseData = c;
		//   if (!this.caseData.id) {
		//     this.getCase()
		//   }
		// })
	}
	public bodyartchange: any;
	@ViewChild(BodypartsFormComponent) BodypartsFormComponent: BodypartsFormComponent;
	ngAfterViewInit() {
		this.getChildProperty();
	}
	getChildProperty() {
		this.bodyartchange = this.BodypartsFormComponent.bodyartchange;
	}

	ngOnInit() {
		this.mainService.setLeftPanel(FRONT_DESK_LINKS)
		this.titleService.setTitle(this.route.snapshot.data["title"]);
		this.title = "Edit " + this.route.snapshot.data["title"]
		this.getCase()
	}
	subscription: Subscription[] = [];
	getCase() {
		let rout = "injury"
		this.subscription.push(
			this.caseFlowService.getCase(this.caseId, rout).subscribe((res) => {
				if (res.status == 200) {
					this.bodyparts = res.data && res.data.body_parts ? res.data.body_parts : []
				}
			}))
	}


	canDeactivate() {
		return (this.bodyartchange);
	}
}
