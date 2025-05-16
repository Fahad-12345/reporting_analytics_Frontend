import { Component, OnInit } from '@angular/core';
import { AclService } from '@appDir/shared/services/acl.service';
import { MENU } from '@appDir/shared/layouts/navbar/nav-content';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { Router, ActivatedRoute, Params } from '@angular/router';
@Component({
	selector: 'app-codes',
	templateUrl: './codes.component.html',
	styleUrls: ['./codes.component.scss'],
})
export class CodesComponent extends PermissionComponent implements OnInit {
	constructor(
		aclService: AclService,
		router: Router,
		activatedRoute: ActivatedRoute
	) {
		super(aclService, router);
	}
	public menu: any[] = [];
	public submenu: any[] = [];
	public ssubmenu: any[] = [];
	public submenu1: any[] = [];
	ngOnInit() {
		//this.navigatToChild(false, '', '', "Master", "Billing", "Codes");
	}
}
