import { USERPERMISSIONS } from './../../../UserPermissions';

import { Component, OnInit } from '@angular/core';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { Router, ActivatedRoute } from '@angular/router';
@Component({
  selector: 'provider-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class ProvidersNavBarComponent extends PermissionComponent implements OnInit {

	userPermissions = USERPERMISSIONS;

  constructor(aclService: AclService, router: Router, protected requestService: RequestService, 
	private route: ActivatedRoute,
	) { 
      super(aclService, router); 
  }

  ngOnInit() {
	 
  }


  setRouterParamsPermission(){
	if (this.aclService.hasPermission(this.userPermissions.master_speciality_tab) && this.aclService.hasPermission(this.userPermissions.master_case_type_tab) && this.aclService.hasPermission(this.userPermissions.master_visit_type_tab)){
		this.onClickLink('speciality');
	}
	else if (!this.aclService.hasPermission(this.userPermissions.master_speciality_tab) && this.aclService.hasPermission(this.userPermissions.master_case_type_tab) && this.aclService.hasPermission(this.userPermissions.master_visit_type_tab)){
		this.onClickLink('case-type');
	}
	else if (!this.aclService.hasPermission(this.userPermissions.master_speciality_tab) && !this.aclService.hasPermission(this.userPermissions.master_case_type_tab) && this.aclService.hasPermission(this.userPermissions.master_visit_type_tab)){
		this.onClickLink('visit-type');
	}
	else if (!this.aclService.hasPermission(this.userPermissions.master_speciality_tab) && this.aclService.hasPermission(this.userPermissions.master_case_type_tab) && this.aclService.hasPermission(this.userPermissions.master_visit_type_tab)){
		this.onClickLink('case-type');
	}
	else if (this.aclService.hasPermission(this.userPermissions.master_speciality_tab) && !this.aclService.hasPermission(this.userPermissions.master_case_type_tab) && this.aclService.hasPermission(this.userPermissions.master_visit_type_tab)){
		this.onClickLink('speciality');
	}

	else if (this.aclService.hasPermission(this.userPermissions.master_speciality_tab) && !this.aclService.hasPermission(this.userPermissions.master_case_type_tab) && !this.aclService.hasPermission(this.userPermissions.master_visit_type_tab)){
		this.onClickLink('speciality');
	}
	else if (!this.aclService.hasPermission(this.userPermissions.master_speciality_tab) && !this.aclService.hasPermission(this.userPermissions.master_case_type_tab) && this.aclService.hasPermission(this.userPermissions.master_visit_type_tab)){
		this.onClickLink('visit-type');
	}
	else if (this.aclService.hasPermission(this.userPermissions.master_speciality_tab) && !this.aclService.hasPermission(this.userPermissions.master_case_type_tab) && !this.aclService.hasPermission(this.userPermissions.master_visit_type_tab)){
		this.onClickLink('speciality');
	}

  }

  onClickLink(link) {
    this.router.navigate([link], { relativeTo: this.route.parent });
  }


}

