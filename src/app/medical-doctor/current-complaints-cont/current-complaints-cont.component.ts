import { Component, OnInit } from '@angular/core';
import {
	SubBodyPart,
	PainExacerbationReasons,
} from '../models/initialEvaluation/initialEvaluationModels';
import { Router, ActivatedRoute } from '@angular/router';
import { MDService } from '../services/md/medical-doctor.service';
import { MainService } from '@shared/services/main-service';
import { complaintTabs } from '../models/panel/panel';
import { MdLinks } from '../models/panel/model/md-links';
import { SeededInfo, SeededBodyPart } from '../md-shared/seededInfo';
import { getObjectChildValue, unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';

@Component({
	selector: 'app-current-complaints-cont',
	templateUrl: './current-complaints-cont.component.html',
	styleUrls: ['./current-complaints-cont.component.scss'],
})
export class CurrentComplaintsContComponent implements OnInit {
	public tabLinks: MdLinks[];
	public descriptionBodyParts: SeededBodyPart[] = [];
	public subBodyParts: SubBodyPart[];
	public visitType: string;
	public painReasons: PainExacerbationReasons[];
	public data: any;
	public currentScreen = 'currentComplaints2';

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private MDService: MDService,
		private mainService: MainService,
	) {
		this.mainService.setPanelData();
		let session = this.MDService.getCurrentSession();
		this.data = getObjectChildValue(session, null, ['session', 'currentComplaints2']);
		this.visitType = session['visitType'];
	}

	ngOnInit() {
		this.tabLinks = complaintTabs;
		let offlineData: SeededInfo = this.MDService.getOfflineData();
		this.subBodyParts = offlineData.subBodyParts;
		this.painReasons = offlineData.painExcerbations;

		let bodyParts: SeededBodyPart[] = offlineData.bodyParts;
		this.descriptionBodyParts = bodyParts
			.filter((bodyPart) => {
				return bodyPart.type == 'description';
			})
			.map((bodyPart) => {
				bodyPart.checked = true;
				return bodyPart as SeededBodyPart;
			});
	}

	ngOnDestroy() {
		this.mainService.resetPanelData();
		unSubAllPrevious(this.subscriptions)

	}

	subscriptions:any[]=[]
	nextPage() {
		this.subscriptions.push(this.mainService.panelLeft.subscribe((links: MdLinks[]) => {
			if(Array.isArray(links) && links.length > 0) {
				let index = links.findIndex(link => link.slug == 'current-complaints')
				this.router.navigate([links[index + 1].link])
			}

		}))
		
	}

	previousPage() {
		this.router.navigate([`medical-doctor/current-complaints`]);
	}
}
