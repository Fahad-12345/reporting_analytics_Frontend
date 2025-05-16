import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MDService } from '../services/md/medical-doctor.service';
import { MainService } from '@shared/services/main-service';
import { BodyPart, Movement } from '../models/initialEvaluation/initialEvaluationModels';
import { physicalExaminationTabs } from '../models/panel/panel';
import { MdLinks } from '../models/panel/model/md-links';
import { unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
@Component({
	selector: 'app-physical-examination-cont',
	templateUrl: './physical-examination-cont.component.html',
	styleUrls: ['./physical-examination-cont.component.scss'],
})
export class PhysicalExaminationContComponent implements OnInit {
	public currentScreen = 'physicalExamination2';
	public tabLinks: MdLinks[];
	data: object;
	bodyParts;
	examination2BodyParts: BodyPart[] = [];
	movements: Movement[];
	visitType;

	constructor(
		private router: Router,
		private MDService: MDService,
		private mainService: MainService,
	) {
		this.mainService.setPanelData();
		////////////Initialize data from localstorage if there is any/////////////////////
		//////////////////////////////////////////////////////////////////////////////////
		let session = this.MDService.getCurrentSession();
		if (session['session'] && session['session']['physicalExamination2']) {
			this.data = session['session']['physicalExamination2'];
		}
		//////////////////////////////////////////////////////////////////////////////////
	}

	ngOnInit() {
		this.tabLinks = physicalExaminationTabs;
		let offlineData = this.MDService.getOfflineData();
		let session = this.MDService.getCurrentSession();
		this.bodyParts = offlineData.bodyParts;
		// this.bodyParts = BODYPART;
		this.movements = offlineData.bodyPartMovements;
		for (let i in this.bodyParts) {
			if (this.bodyParts[i]['type'] == 'physicalExm2') {
				this.examination2BodyParts.push(new BodyPart(this.bodyParts[i]));
			}
		}

		this.visitType = session['visitType'];
	}

	ngOnDestroy() {
		this.mainService.resetPanelData();
		unSubAllPrevious(this.subscriptions)
	}

	subscriptions:any[]=[]
	nextPage() {
			this.subscriptions.push(
			this.mainService.panelLeft.subscribe((links: MdLinks[]) => {
				// this.links = links;
				if(Array.isArray(links) && links.length > 0) {
					let index = links.findIndex(link => link.slug == 'physical-examination-main')
					this.router.navigate([links[index + 1].link])
				}
			
				// obs.unsubscribe()
			}))
	}

	previousPage() {

		this.router.navigate([`medical-doctor/physical-examination`]);
	}
}
