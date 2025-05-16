import { Component, OnInit } from '@angular/core';
import { MainService } from '@shared/services/main-service';
import { FRONT_DESK_LINKS } from '../models/leftPanel/leftPanel';
import { Title } from '@angular/platform-browser';
import { LocalStorage } from '@shared/libs/localstorage';
import { FDServices } from '../fd_shared/services/fd-services.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { AclService } from '../../shared/services/acl.service';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Logger } from '@nsalaun/ng-logger';
import { Subscription } from 'rxjs';
import { CaseFlowServiceService } from '../fd_shared/services/case-flow-service.service';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
@Component({
	selector: 'app-bodyparts',
	templateUrl: './bodyparts.component.html',
})
export class BodypartsComponent implements OnInit {
	subscription: Subscription[] = [];

	public caseId: number;
	public caseData: any;
	public bodyParts: any[] = [];

	selection = new SelectionModel<Element>(true, []);
	constructor(
		private route: ActivatedRoute,
		public aclService: AclService,
		private router: Router,
		private mainService: MainService,
		private titleService: Title,
		private localStorage: LocalStorage,
		private fd_services: FDServices,
		private logger: Logger,
		private caseFlowService: CaseFlowServiceService,
		private customDiallogService : CustomDiallogService 

	) {

		this.titleService.setTitle(this.route.snapshot.data['title']);
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
				}
			}),
		);
	}

	ngOnInit() {
		this.mainService.setLeftPanel(FRONT_DESK_LINKS);
		this.titleService.setTitle('BodyParts');
		this.getCase();
	}

	ngOnChnages() {
		this.getCase();
	}

	getCase() {
		this.subscription.push(
			this.caseFlowService.getCase(this.caseId, 'injury').subscribe((res) => {
				if (res.status == 200) {
					this.caseData = res.result.data;
					this.assignValues();
				}
			}),
		);
	}
	onEdit(id) {
		this.router.navigate([`front-desk/cases/edit/${this.caseId}/injury/${id}`]);
	}
	assignValues() {
		this.bodyParts = this.caseData.body_parts;
	}

	deleteSelected(id?: number) {
		let ids: any = [];
		if (id) {
			ids.push(id);
		} else {
			this.selection.selected.forEach(function (obj) {
				ids.push(obj.id);
			});
		}

		let requestData = {
			ids: ids,
		};

	}

	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.bodyParts.length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle(event) {
		this.isAllSelected()
			? this.selection.clear()
			: this.bodyParts.forEach((row) => this.selection.select(row));
	}

	confirmDel(id?: number) {

		this.customDiallogService.confirm('Delete Confirmation?', 'Do you really want to delete it.','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				this.deleteSelected(id);
			}else if(confirmed === false){
				
			}else{
				
			}
		})
		.catch();

		
	}
	stringfy(obj) {
		return JSON.stringify(obj);
	}
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
		this.logger.log('body parts Ondestroy Called');
	}
}
