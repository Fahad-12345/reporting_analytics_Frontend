import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { MENU } from '@appDir/shared/layouts/navbar/nav-content';
import { Menu } from '@appDir/shared/layouts/navbar/navbar.model';
import { AclService } from '@appDir/shared/services/acl.service';
import { RequestService } from '@shared/services/request.service';
import { Subscription } from 'rxjs';
import { USERPERMISSIONS } from './UserPermissions';
import { RoutesPermissions } from './route.permission';

@Component({
	template: ''
  })

export abstract class PermissionComponent {
	startLoader: boolean = false;
	RoutesPermissions = RoutesPermissions;
	subscription: Subscription[] = [];
	userPermissions = USERPERMISSIONS;
	defaultDoctorImageUrl ="assets/images/doctor-avater.png"
	public menu: Menu[] = [];
	public mainmenu: any[] = [];
	public submenu: any[] = [];
	public ssubmenu: any[] = [];
	public submenu1: any[] = [];
	public allFacilityLocaltion:any;
	constructor(
		public aclService?: AclService,
		protected router?: Router,
		protected activatedRoute?: ActivatedRoute,
		protected requestService?: RequestService,
		protected titleService?: Title,
	) {
	}

	stringify(obj) {
		return JSON.stringify(obj);
	}

	stringfy(obj) {
		return JSON.stringify(obj);
	}

	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}
	/**
	 * set title of each profile
	 */
	setTitle() {
		return this.titleService.setTitle('Ovada-' + this.activatedRoute.snapshot.data['title']);
	}
	navigatToChild(replace = false, replaceString = '', replaceValue = null, parntnav: string = '', firstlevel: string = '', secondlevel: string = '') {
		//if (param['priv_title'] == 'Billing') {
		this.mainmenu = MENU.filter(m => m.priv_title == parntnav).map(m => m.submenu);
		this.submenu = this.mainmenu[0].filter(m => m.priv_title == firstlevel).map(m => m.submenu);
		this.ssubmenu = this.submenu[0];
		if (secondlevel) {
			this.submenu1 = this.submenu[0].filter(m => m.priv_title == secondlevel).map(m => m.submenu);
			this.ssubmenu = this.submenu1[0];
		}

		for (let i in this.ssubmenu) {
			if (this.aclService.hasPermission(this.ssubmenu[i].priv_key)) {
				if (this.ssubmenu[i].submenu && this.ssubmenu[i].submenu.length > 1) {
					let data: any[] = [];
					data = this.ssubmenu[i].submenu;
					for (let x in data) {
						if (this.aclService.hasPermission(data[x].priv_key)) {
							const phrase = data[x].link;
							let stripped = data[x].link;
							if (replace) {
								stripped = phrase.toString().replace(replaceString, replaceValue);
								// stripped = phrase.replace(/replaceString/gi, replaceValue)
								// this.router.navigate([stripped]);
							}

							this.router.navigate([stripped]);
							return true;
						}
					}
				}
				else {
					const phrase = this.ssubmenu[i].link;
					let stripped = this.ssubmenu[i].link;
					if (replace) {
						stripped = phrase.toString().replace(replaceString, replaceValue);
						// stripped = phrase.replace(/replaceString/gi, replaceValue)
						// this.router.navigate([stripped]);
					}
					this.router.navigate([stripped]);
					return true;
				}
			}
		}
		// }
		// else {
		//     this.router.navigate([param.link]);
		// }
	}
}
