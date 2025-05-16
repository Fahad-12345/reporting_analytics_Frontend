import { Component, OnInit } from '@angular/core';
import { AclService } from '@appDir/shared/services/acl.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { UserInfoChangeService } from './users/services/user-info-change.service';
import { isSameLoginUser } from '@appDir/shared/utils/utils.helpers';
@Component({
	selector: 'app-users',
	templateUrl: './master-users.component.html',
	styleUrls: ['./master-users.component.scss'],
})
export class MasterUsersComponent extends PermissionComponent implements OnInit {
	public links: any[] = [];
	public menu: any[] = [];
	public submenu: any[] = [];
	public ssubmenu: any[] = [];
	isSameUser = true;
	user_id;
	constructor(
		router: Router,
		aclService: AclService,
		protected activatedRoute: ActivatedRoute,
		protected userInfoChangeService?: UserInfoChangeService,
	) {
		super(aclService, router);
		this.userInfoChangeService.isClickedOnUserPic.subscribe((responce: any) => {
			this.user_id = responce.id;
			this.isSameUserLogin();
		});
	}
	ngOnInit() {
		this.isMenuDisplay();
		this.links = this.aclService
			.getSubMenuOf('front-desk/masters/users');
		this.activatedRoute.params.subscribe((params: Params) => {
			const caseId = +params['caseId'];
			this.links = this.links.map(row => {
				let link = row.link;
				link = link.replace(/{id}/g, caseId);

				return { ...row, link };
			});
		});

	}
	isMenuDisplay() {
		this.getUserID();
		this.isSameUserLogin();
	}
	getUserID() {
		this.user_id = this.activatedRoute.parent.parent.parent.snapshot.firstChild.children[0].firstChild.firstChild.children[0].children[0].params.id;
	}
	isSameUserLogin() {
		this.isSameUser = isSameLoginUser(this.user_id);
	}
	setRouterParamsPermission() {

		let master_user_list_tab = this.aclService.hasPermission(this.userPermissions.master_user_list_tab);
		let master_user_roles_tab = this.aclService.hasPermission(this.userPermissions.master_user_roles_tab)
		let master_user_designation_tab = this.aclService.hasPermission(this.userPermissions.master_user_designation_tab)
		let master_user_department_tab = this.aclService.hasPermission(this.userPermissions.master_user_department_tab)
		let master_user_emp_type_tab = this.aclService.hasPermission(this.userPermissions.master_user_emp_type_tab)
		let master_user_emp_by_tab = this.aclService.hasPermission(this.userPermissions.master_user_emp_by_tab)

		if (this.aclService.hasPermission(this.userPermissions.master_user_list_tab)

		) {
			this.onClickLink('creation/list');
		}
		else if (this.aclService.hasPermission(this.userPermissions.master_user_roles_tab)
			&& !this.aclService.hasPermission(this.userPermissions.master_user_list_tab)

		) {
			this.onClickLink('role');
		}
		else if (this.aclService.hasPermission(this.userPermissions.master_user_designation_tab)
			&& !this.aclService.hasPermission(this.userPermissions.master_user_list_tab)
			&& !this.aclService.hasPermission(this.userPermissions.master_user_roles_tab)

		) {
			this.onClickLink('designation');
		}
		else if (this.aclService.hasPermission(this.userPermissions.master_user_department_tab)
			&& !this.aclService.hasPermission(this.userPermissions.master_user_list_tab)
			&& !this.aclService.hasPermission(this.userPermissions.master_user_roles_tab)
			&& !this.aclService.hasPermission(this.userPermissions.master_user_designation_tab)

		) {
			this.onClickLink('department');
		}
		else if (this.aclService.hasPermission(this.userPermissions.master_user_emp_type_tab)
			&& !this.aclService.hasPermission(this.userPermissions.master_user_list_tab)
			&& !this.aclService.hasPermission(this.userPermissions.master_user_roles_tab)
			&& !this.aclService.hasPermission(this.userPermissions.master_user_designation_tab)
			&& !this.aclService.hasPermission(this.userPermissions.master_user_department_tab)

		) {
			this.onClickLink('employment-type');
		}
		else if (this.aclService.hasPermission(this.userPermissions.master_user_emp_by_tab)
			&& !this.aclService.hasPermission(this.userPermissions.master_user_list_tab)
			&& !this.aclService.hasPermission(this.userPermissions.master_user_roles_tab)
			&& !this.aclService.hasPermission(this.userPermissions.master_user_designation_tab)
			&& !this.aclService.hasPermission(this.userPermissions.master_user_department_tab)
			&& !this.aclService.hasPermission(this.userPermissions.master_user_emp_type_tab)
		) {
			this.onClickLink('employment-by');
		}


	}


	onClickLink(link) {
		let ro = this.activatedRoute.parent.url;
		this.router.navigate([link], { relativeTo: this.activatedRoute.parent });
	}

}
