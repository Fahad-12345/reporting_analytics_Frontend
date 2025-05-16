import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { MdLinks } from '@appDir/medical-doctor/models/panel/model/md-links';
import { Subscription } from 'rxjs';
import { CarryForwardService } from '@appDir/medical-doctor/services/carry-forward/carry-forward.service';
import { AcceptedData } from '@appDir/medical-doctor/services/carry-forward/model/accepted-data';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { MainService } from '@appDir/shared/services/main-service';
import { unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';

@Component({
	selector: 'app-md-sub-tab',
	templateUrl: './md-sub-tab.component.html',
	styleUrls: ['./md-sub-tab.component.scss'],
})
export class MdSubTabComponent implements OnInit {
	@Input() tabLinks: MdLinks[] = [];
	@Input() currentScreen: string = '';
	public subscriptions: Subscription[] = [];
	public visitType: string;
	constructor(private carryForwardService: CarryForwardService, private storageData: StorageData, public mainService: MainService) {}

	ngOnInit() {
		this.visitType = this.storageData.getcurrentSession().visitType;
		this.subscriptions.push(
			this.carryForwardService.acceptCarryForward.subscribe((acceptedData: AcceptedData) => {
				let link = this.tabLinks.find((link) => {
					return link.slug == acceptedData.link.slug;
				});
				if (link && acceptedData.accepted == true) {
					link.carryForwarded = !link.carryForwarded;
				}
			}),
		);
	}

	public toggleCarryForward(link) {
		this.carryForwardService.carryForwardClicked(link.carryForwarded);
	}

	public ngOnDestroy() {
		unSubAllPrevious(this.subscriptions);
	}
}
