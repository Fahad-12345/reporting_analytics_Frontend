import { Component, OnInit } from '@angular/core';
import { AclService } from '@appDir/shared/services/acl.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { Router, ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-erx-menu',
  templateUrl: './erx-menu.component.html',
  styleUrls: ['./erx-menu.component.scss']
})
export class ErxMenuComponent extends PermissionComponent implements OnInit {
	constructor(
		router: Router,
		aclService: AclService,
		protected activatedRoute: ActivatedRoute,
		
	  ) { super(aclService, router); }

  ngOnInit() {
	//   this.setRouterParamsPermission();
  }

  setRouterParamsPermission(){
	 if(!this.aclService.hasPermission(this.userPermissions.master_erx_tab)){
		this.onClickLink('pharmacy/list');
	}
  }

  onClickLink(link) {
	let ro=this.activatedRoute.parent.url;
	this.router.navigate([link], { relativeTo: this.activatedRoute.parent });
  }
}
