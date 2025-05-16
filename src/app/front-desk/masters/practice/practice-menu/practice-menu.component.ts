import { Component, OnInit } from '@angular/core';
import { AclService } from '@appDir/shared/services/acl.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-practice-menu',
  templateUrl: './practice-menu.component.html',
  styleUrls: ['./practice-menu.component.scss']
})
export class PracticeMenuComponent extends PermissionComponent implements OnInit {

	constructor(
		router: Router,
		aclService: AclService,
		protected activatedRoute: ActivatedRoute,
		
	  ) { super(aclService, router); }

  ngOnInit() {
	//   this.setRouterParamsPermission();
  }

  nav(param) {
	this.navigatToChild(false, '', '', 'Master', 'Practice', param);
  }

  setRouterParamsPermission(){
	 if(!this.aclService.hasPermission(this.userPermissions.master_practice_tab) && this.aclService.hasPermission(this.userPermissions.master_hospital_tab)){
		this.onClickLink('hospital');
	}
	else if(this.aclService.hasPermission(this.userPermissions.master_practice_tab) && !this.aclService.hasPermission(this.userPermissions.master_hospital_tab)){
		this.onClickLink('practice/list');
	}
	else if (this.aclService.hasPermission(this.userPermissions.master_practice_referring_physician_menu) ) {
		this.onClickLink('referral');
	}
  }

  onClickLink(link) {
	  let ro=this.activatedRoute.parent.url;
	this.router.navigate([link], { relativeTo: this.activatedRoute.parent });
  }

}
