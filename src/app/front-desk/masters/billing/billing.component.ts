import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AclService } from '@appDir/shared/services/acl.service';
import { Subscription } from 'rxjs';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Logger } from '@nsalaun/ng-logger';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { environment } from 'environments/environment';
@Component({
	selector: 'app-master-billing',
	templateUrl: './billing.component.html',
})
export class MasterBillingComponent extends PermissionComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	public links: any[] = [];
	environment = environment;

	constructor(
		router: Router,
		aclService: AclService,
		activatedRoute: ActivatedRoute,
		private logger: Logger,
	) {
		super(aclService, router, activatedRoute);
	}

	public menu: any[] = [];
	public submenu: any[] = [];
	public ssubmenu: any[] = [];

	ngOnInit() {
		this.links = this.aclService.getSubMenuOf('front-desk/masters/billing');

		this.subscription.push(
			this.activatedRoute.params.subscribe((params: Params) => {
				const caseId = +params['caseId'];
				this.links = this.links.map((row) => {
					let link = row.link;
					link = link.replace(/{id}/g, caseId);
					return { ...row, link };
				});
			}),
		);
	
	}

	nav(param) {
		this.navigatToChild(false, '', '', 'Master', 'Billing', param);
	}

	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
		this.logger.log();
	}

	setRouterParamsPermission(){
		debugger;
		if (this.aclService.hasPermission(this.userPermissions.master_billing_insurance_menu) ){
			this.onClickLink('insurance/insurance');
		}
		else if (this.aclService.hasPermission(this.userPermissions.master_billing_attorney_menu) ){
			this.onClickLink('attorney/firm');
		}
		else if (this.aclService.hasPermission(this.userPermissions.master_billing_employer_menu) ){
			this.onClickLink('employer');
		}
		else if (this.aclService.hasPermission(this.userPermissions.master_billing_codes_menu) ){
			this.onClickLink('codes/Icd-codes');
		}
		else if (this.aclService.hasPermission(this.userPermissions.master_billing_billing_menu) ){
			this.onClickLink('billing-master/payment-type');
		}
		else if (this.userPermissions.master_clearinghouse_menu){
			this.onClickLink('clearinghouse');
		}
		else if (this.userPermissions.master_employer_insurance_linkage_menu){
			this.onClickLink('emp-ins-linkage');
		}
	  }
	
	
	  onClickLink(link) {
		  let ro=this.activatedRoute.parent.url;
		  debugger;
		this.router.navigate([link], { relativeTo: this.activatedRoute.parent });
	  }
	
}
