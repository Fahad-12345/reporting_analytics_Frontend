import { Component, Input, OnChanges, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { RequestService } from '@shared/services/request.service';
import { FrontDeskUrls } from '@appDir/front-desk/front-desk-urls.enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';

import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { SelectionModel } from '@angular/cdk/collections';
// import EventEmitter = NodeJS.EventEmitter;

import { PermissionsListDatabaseService } from '@appDir/shared/components/role-privilliges/permissions-list-database.service';
import { PermissionItemFlatNode, PermissionItemNode } from '@appDir/front-desk/models/permission.model';
import { Router } from '@angular/router';
import { Logger } from '@nsalaun/ng-logger';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { UserInfoChangeService } from '@appDir/front-desk/masters/master-users/users/services/user-info-change.service';

// import {Logger} from 'jasmine-spec-reporter/built/display/logger';

@Component({
	selector: 'app-role-privileges',
	templateUrl: './role-privileges.component.html',
	styleUrls: ['./role-privileges.component.scss']
})
export class RolePrivilegesComponent extends PermissionComponent implements OnInit, OnChanges {

	@Input() userPermissonData = [];
	@Output() submitData = new EventEmitter()
	disabledButton: boolean = false;
	@Input() rolePermission;
	@Input() disablebtn;
	@Output() userPermissionUpdate = new EventEmitter();
	@Output() userModuleSelectAll = new EventEmitter();
	@Output() userFieldSelectAll = new EventEmitter();
	@Input() permissionTableConfFromParent = {};
	@Input() rolePriviligesInputData = { submit: false, hideButtons: false }

	@Input() dataObj: any
	selected = [];
	selectedPermissions:any;
	selection = [];
	database = null;


	/** Map from flat node to nested node. This helps us finding the nested node to be modified */
	flatNodeMap = new Map<PermissionItemFlatNode, PermissionItemNode>();

	/** Map from nested node to flattened node. This helps us to keep the same object for selection */
	nestedNodeMap = new Map<PermissionItemNode, PermissionItemFlatNode>();

	/** A selected parent node to be inserted */
	selectedParent: PermissionItemFlatNode | null = null;

	treeControl: FlatTreeControl<PermissionItemFlatNode>;

	treeFlattener: MatTreeFlattener<PermissionItemNode, PermissionItemFlatNode>;

	dataSource: MatTreeFlatDataSource<PermissionItemNode, PermissionItemFlatNode>;

	/** The selection for checklist */
	permissionListSelection = new SelectionModel<PermissionItemFlatNode>(true /* multiple */);

	parentlistSelection = new SelectionModel<PermissionItemFlatNode>(true /* multiple */);


	getLevel = (node: PermissionItemFlatNode) => node.level;

	isExpandable = (node: PermissionItemFlatNode) => node.expandable;

	getChildren = (node: PermissionItemNode): PermissionItemNode[] => node.children;

	hasChild = (_: number, _nodeData: PermissionItemFlatNode) => _nodeData.expandable;

	hasNoContent = (_: number, _nodeData: PermissionItemFlatNode) => _nodeData.item === '';

	constructor(
		router: Router,
		/*private route: ActivatedRoute,
		private toastrService: ToastrService,
		private caseService: CasesService,
		private mainService: MainService,
		private ngZone: NgZone,
		private mapsAPILoader: MapsAPILoader,
	private localStorage: LocalStorage,*/
	private userInfoService:UserInfoChangeService,
		private logger: Logger,
		aclService: AclService,
		reqService: RequestService) {
		super(aclService, router, null, reqService);

	}




	setTree() {
		this.database = new PermissionsListDatabaseService(this.userPermissonData);
		this.database.MENU_DATA = this.userPermissonData;

		this.database.dataChange.subscribe((data111: any[]) => {
			if (data111 && data111.length && this.dataSource) {
				this.dataSource.data = data111;
				if (data111) {
					this.selectAllIntial();
				}
			}
		});
	}

	getRoles() {
		this.requestService
			.sendRequest(FrontDeskUrls.ModulesPermissions_GET, 'GET', REQUEST_SERVERS.fd_api_url, {})
			.subscribe((data: any) => {
				this.userPermissonData = data.result.data;
				this.setTree()
			});
	}






	ngOnChanges() {
		// this.logger.log(this.userPermissonData);

		//needed in user priviliges screen to force emit event
		if (this.rolePriviligesInputData && this.rolePriviligesInputData.submit) {
			this.submit()
			this.rolePriviligesInputData.submit = false;
		} else {
			if (this.userPermissonData && this.userPermissonData.length) {
				this.permissionListSelection.clear()
				this.parentlistSelection.clear()
				this.setTree()
			}
		}



	}


	/**
	 * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
	 */
	transformer = (node: PermissionItemNode, level: number) => {
		const existingNode = this.nestedNodeMap.get(node);
		// const flatNode = existingNode && existingNode.item === node.item
		const flatNode = existingNode && existingNode.description === node.description
			? existingNode
			: new PermissionItemFlatNode();
		flatNode.item = node.description;
		flatNode.description = node.description;
		flatNode.permissions = node.permissions;
		flatNode.isChecked = node.isChecked;
		flatNode.id = node.id;
		flatNode.level = level;
		flatNode.expandable = !!node.children;
		this.flatNodeMap.set(flatNode, node);
		this.nestedNodeMap.set(node, flatNode);
		return flatNode;
	};

	/** Whether all the descendants of the node are selected. */
	descendantsAllSelected(node: PermissionItemFlatNode): boolean {
		const descendants = this.treeControl.getDescendants(node);
		return descendants.length && descendants.every(child =>
			this.permissionListSelection.isSelected(child)
		);
	}
	/** Whether part of the descendants are selected */
	descendantsPartiallySelected(node: PermissionItemFlatNode): boolean {
		const descendants = this.treeControl.getDescendants(node);
		const result = descendants.some(child => this.permissionListSelection.isSelected(child));
		return result && !this.descendantsAllSelected(node);
	}

	/** Toggle the to-do item selection. Select/deselect all the descendants node */
	todoItemSelectionToggle(node: PermissionItemFlatNode): void {
		this.userInfoService.sendMessage('1');
		this.permissionListSelection.toggle(node);
		const descendants = this.treeControl.getDescendants(node);
	
		if (this.permissionListSelection.isSelected(node)) {
			this.permissionListSelection.select(...descendants);
		} else {
			this.permissionListSelection.deselect(...descendants);
		}
		this.checkAllParentsSelection(node);
	}

	/** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
	todoLeafItemSelectionToggle(node: PermissionItemFlatNode): void {
		this.userInfoService.sendMessage('1');
		this.permissionListSelection.toggle(node);
		this.checkAllParentsSelection(node);
	}

	removeEmptyAndNullsFormObject(obj) {
		Object.keys(obj).forEach((key) => (obj[key] == null || obj[key] === '') && delete obj[key]);
		return obj;
	}

	/* Checks all the parents when a leaf node is selected/unselected   pass checked leaf*/
	checkAllParentsSelection(node: PermissionItemFlatNode): void {
		let parent: PermissionItemFlatNode | null = this.getParentNode(node);
		while (parent) {
			this.checkRootNodeSelection(parent);
			parent = this.getParentNode(parent);
		}
	}

	/** Check root node checked state and change it accordingly */
	checkRootNodeSelection(node: PermissionItemFlatNode): void {
		const nodeSelected = this.permissionListSelection.isSelected(node);
		const descendants = this.treeControl.getDescendants(node);

		const descAllSelected = descendants.every(child =>
			this.permissionListSelection.isSelected(child)
		);

		const descPartiallySelected = descendants.some(child =>
			this.permissionListSelection.isSelected(child)
		);

		const descNotSelected = descendants.every(child =>
			!this.permissionListSelection.isSelected(child)
		);

		if (nodeSelected && !descAllSelected) {
			this.permissionListSelection.deselect(node);
		} else if (!nodeSelected && descAllSelected) {
			this.permissionListSelection.select(node);
		}

	}

	/* Get the parent node of a node */
	getParentNode(node: PermissionItemFlatNode): PermissionItemFlatNode | null {
		const currentLevel = this.getLevel(node);

		if (currentLevel < 1) {
			return null;
		}

		const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

		for (let i = startIndex; i >= 0; i--) {
			const currentNode = this.treeControl.dataNodes[i];

			if (this.getLevel(currentNode) < currentLevel) {
				return currentNode;
			}
		}
		return null;
	}

	  submit() {
		this.parentlistSelection = new SelectionModel<PermissionItemFlatNode>(true /* multiple */);

		let checked: number[] = this.permissionListSelection.selected.map(val => val.id);

		if (this.permissionListSelection.selected.length)
			this.permissionListSelection.selected.forEach(node => {
				let par: PermissionItemFlatNode | null = this.getParentNode(node);
				this.parentlistSelection.select(par);
				while (par) {
					if (par = this.getParentNode(par)) {
						this.parentlistSelection.select(par);
					}
				}
			});

		let parent: number[] = [];
		if (this.parentlistSelection.selected.length) {
			parent = this.removeEmptyAndNullsFormObject(this.parentlistSelection.selected)
				.map(val => val.id)
				.filter(v => v);
		}

		if (parent.length) {
			checked = checked.concat(parent).filter(v => v);
			checked = checked.filter((item, index) => checked.indexOf(item) === index).sort((a, b) => b - a);
		}
		let data: any = {
			permissions: checked,
		};
		this.selectedPermissions = data;
		this.submitData.emit(data)
		// var requestData = { role_id: 5, permissions: data }


	}

	resetDataBase() {
		this.database.MENU_DATA = [];
		this.dataSource.data = [];
		this.selectAllIntial();
		this.permissionListSelection.clear();
	}

	selectAllIntial() {
		for (const node in this.dataSource.data) {
			const nodeData = this.transformer(this.dataSource.data[node], 0);
			const desendants = this.treeControl.getDescendants(nodeData);
			if (desendants.length) {
				desendants.forEach(val => {
					// ;
					// console.log(val);
					if (val.isChecked) {
						if (!this.treeControl.getDescendants(val).length) {
							this.permissionListSelection.select(val);
							this.checkAllParentsSelection(val);
						}
					}
				});
			} else {
				nodeData.isChecked ? this.permissionListSelection.select(nodeData) : null;
			}
		}
	}


	cancel() {
		this.router.navigate(['/front-desk']);
	}

	ngOnInit() {
		this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);

		this.treeControl = new FlatTreeControl<PermissionItemFlatNode>(this.getLevel, this.isExpandable);
		this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
		this.permissionListSelection = new SelectionModel<PermissionItemFlatNode>(true);
		this.parentlistSelection = new SelectionModel<PermissionItemFlatNode>(true);
		// this.getRoles();
	}

}
