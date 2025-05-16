import {
	Component,
	OnInit,
} from '@angular/core';
import {
	ActivatedRoute,
	Router,
} from '@angular/router';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';

import { customizeTabs } from './constant/constant';
import { ITab } from './interfaces/interfaces';

@Component({
	selector: 'app-scheduler-customize',
	templateUrl: './scheduler-customize.component.html',
	styleUrls: ['./scheduler-customize.component.scss'],
})
export class SchedulerCustomizeComponent extends PermissionComponent implements OnInit  {
	customizeTabs: ITab[];
	constructor(protected router?: Router, protected activatedRoute?: ActivatedRoute, public aclService?: AclService) {
		super(aclService,router);
		this.customizeTabs = customizeTabs;
	}

	ngOnInit() {
		const activatedRoute = this.activatedRoute.snapshot['_routerState'].url;
		if (activatedRoute.includes('location') && this.aclService.hasPermission(this.userPermissions.customize_facility_menu)) {
			this.activeSelectedTab(this.customizeTabs[0]);
		}
		else if (activatedRoute.includes('specialty') && this.aclService.hasPermission(this.userPermissions.customize_speciality_menu)) {
			this.activeSelectedTab(this.customizeTabs[1]);
		}
		else if (activatedRoute.includes('preferences') && this.aclService.hasPermission(this.userPermissions.customize_preference_menu)) {
			this.activeSelectedTab(this.customizeTabs[2]);
		}
		else
		{
			this.activeSelectedTab(this.customizeTabs[0]);
		}
	}
	activeSelectedTab(clickedTab: ITab) {
		let activatedTab;
		this.customizeTabs.forEach((tab) => {
			if (tab.id === clickedTab.id) {
				tab.isSelected = true;
				tab.class = 'active';
				activatedTab = tab;
			} else {
				tab.isSelected = false;
				tab.class = '';
			}
		});

		this.router.navigateByUrl(activatedTab.link);
	}
}
