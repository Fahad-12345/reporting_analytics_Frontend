import { Component, OnInit } from '@angular/core';
import { FrontDeskUrls } from '@appDir/front-desk/front-desk-urls.enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { RolesServiceService } from '../service/roles-service.service';
import { RoleServiceUrlEnums } from '../service/RoleServiceUrlEnums';
import { ToastrService } from 'ngx-toastr';
import { AutoGeneratedFolder } from '../models/AutoGeneratedFolder.model';
import { PermissionModel } from '../models/Permission.model';
import { AclService } from '@appDir/shared/services/acl.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { Router, ActivatedRoute } from '@angular/router';
import { makeDeepCopyObject } from '@appDir/shared/utils/utils.helpers';

@Component({
	selector: 'app-roles-component',
	templateUrl: './roles-component.component.html',
	styleUrls: ['./roles-component.component.scss']
})
export class RolesComponentComponent extends PermissionComponent implements OnInit {

	constructor(private roleService: RolesServiceService,
		private toasterService: ToastrService,
		router: Router,
		activatedRoute: ActivatedRoute,
		aclService: AclService,) {
		super(aclService, router, activatedRoute);
	}

	userPermissonData: PermissionModel[]
	roles = []
	selectedRoleId: any
	disablebtn: boolean = true;
	// folders:AutoGeneratedFolder[]=[]
	// selectedFolders:{item:AutoGeneratedFolder}[]=[]
	dataObj: { data: AutoGeneratedFolder[], result: { item: AutoGeneratedFolder }[] } = {} as any;
	loadSpin: boolean = false;

	ngOnInit() {
		this.getRoles();
		// this.getFolderPermissions()
	}
	
	defaultval: any = [];
	getRoles() {
		this.loadSpin = true;
		this.roleService.getAllRoles().subscribe(data => {
			this.loadSpin = false;
			this.roles = [...data['result']['data']];
			// this.defaultval = this.roles[0].id;
			// this.getRolePermissions(this.roles[0].id);
			// this.getFolderPermissions(this.roles[0].id);
			// this.getRoleFolderType(this.roles[0].id).subscribe(data=>console.log('FOLDER TYPE',data))
		})
	}

	getRoleFolderType(role_id: number) {
		return this.roleService.getRoleFolderType({ role_id })
	}

	getRolePermissions(id) {
		this.loadSpin = true;
		this.selectedRoleId = id
		this.selectedRoleId ? (this.disablebtn = false) : (this.disablebtn = true);
		this.userPermissonData = undefined
		this.roleService.getRolePermissions(id).subscribe(data => {
			this.userPermissonData = data['result']['data']['tree'];
			//   this.getDocumentManagerTaskPermissions()
		})
		this.getFolderPermissions(id)
		// this.getRoleFolderType(id).subscribe(data=>console.log(data))
	}

	getFolderPermissions(id) {
		this.getRoleFolderType(id).subscribe(data => {
			this.loadSpin = false;
			this.dataObj.data = data['result']['data'];
			this.dataObj = makeDeepCopyObject(this.dataObj);
		})
	}

	submitData(data) {
		this.loadSpin = true;
		var requestData = { role_id: this.selectedRoleId, permissions: data.permissions }
		this.roleService.submitPersmissions(requestData).subscribe(data => {
			this.loadSpin = false;
			if (data['status']) {
				this.toasterService.success('Permissions Attached successfully', 'Success')
			}
		})
		let folder_req = this.dataObj.result.map(item => {
			let { folder_type_id, facility_id, speciality_id, show_files } = item.item
			return { folder_type_id, facility_id, speciality_id, show_files: show_files ? 1 : 0 }
		})
		this.roleService.submitAttachFolderToRole({ folder_types: folder_req, role_id: this.selectedRoleId }).subscribe(data => {
			this.toasterService.success(data['message'], 'success')
		})

	}

	getDocumentManagerTaskPermissions() {

		let doc = this.userPermissonData.find(menu => menu.slug === 'patient').submenu.find(menu => menu.slug === 'case_list').submenu.find(menu => menu.slug === 'edit_case').submenu.find(menu => menu.slug === 'documents')

		this.userPermissonData.push(doc)
		this.userPermissonData.find(menu => menu.slug === 'patient').submenu.find(menu => menu.slug === 'case_list').submenu.find(menu => menu.slug === 'edit_case').submenu = this.userPermissonData.find(menu => menu.slug === 'patient').submenu.find(menu => menu.slug === 'case_list').submenu.find(menu => menu.slug === 'edit_case').submenu.filter(menu => menu.slug != 'documents')
	}

}
