import { Component, OnInit } from '@angular/core';
import { MainService } from '@shared/services/main-service';
import { Router } from '@angular/router';
import { MDService } from '../services/md/medical-doctor.service';
import { BodyPart, BodyPartCondition } from '../models/initialEvaluation/initialEvaluationModels';
import { Patient } from '../models/common/commonModels';
import { MdLinks } from '../models/panel/model/md-links';
import { physicalExaminationTabs, } from '../models/panel/panel';
import { unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';


@Component({
	selector: 'app-physical-examination',
	templateUrl: './physical-examination.component.html',
	styleUrls: ['./physical-examination.component.scss'],
})
export class PhysicalExaminationComponent implements OnInit {
	public tabLinks: MdLinks[];
	public currentScreen = 'physicalExamination1';
	public bodyParts;
	public data: object;
	public patient: Patient;
	public bodyPartConditions: BodyPartCondition[];
	public examinationBodyParts: BodyPart[] = [];
	constructor(
		private router: Router,
		private MDService: MDService,
		private mainService: MainService,
	) {
		this.mainService.setPanelData();
		////////////Initialize data from localstorage if there is any/////////////////////
		//////////////////////////////////////////////////////////////////////////////////
		let session = this.MDService.getCurrentSession();
		if (session['session'] && session['session']['physicalExamination1']) {
			this.data = session['session']['physicalExamination1'];
		}
		if (session && session['patient']) {
			this.patient = session['patient'];
		}
		//////////////////////////////////////////////////////////////////////////////////
	}

	public ngOnInit() {
		this.tabLinks = physicalExaminationTabs;
		let offlineData = this.MDService.getOfflineData();
		this.bodyParts = offlineData.bodyParts;
		this.bodyPartConditions = offlineData.bodyPartConditions;
		// this.bodyPartConditions = BODYPARTCONDITIONS;
		for (let i in this.bodyParts) {
			if (this.bodyParts[i]['type'] == 'physicalExamination') {
				this.examinationBodyParts.push(new BodyPart(this.bodyParts[i]));
			}
		}
	}

	public ngOnDestroy() {
		this.mainService.resetPanelData();
		unSubAllPrevious(this.subscriptions)
	}

	public nextPage() {
		this.router.navigate([`medical-doctor/physical-examination-cont`]);

	}

	subscriptions: any[] = []
	public previousPage() {
		this.subscriptions.push(
			this.mainService.panelLeft.subscribe((links: MdLinks[]) => {
				if(Array.isArray(links) && links.length > 0) {
					let index = links.findIndex(link => link && link.slug && link.slug == 'physical-examination-main')
					this.router.navigate([links[index - 1].link])
				}
			}))



	}
}
