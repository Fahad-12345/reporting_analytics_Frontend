import {
	Component,
	OnInit,
	Input,
	EventEmitter,
	Output,
	OnChanges,
	ElementRef,
	NgZone,
	ViewChild,
	Injectable,
	ViewEncapsulation,
	SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Logger } from '@nsalaun/ng-logger';
import { EmailValidator } from '@angular/forms';

import { MapsAPILoader } from '@agm/core';
import { debug } from 'util';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject, Subscription } from 'rxjs';

import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import {permissionModel} from '@appDir/front-desk/masters/master-users/users/models/permission-model.model';
import {TodoItemFlatNode, TodoItemNode} from '@appDir/front-desk/masters/master-users/users/models/permission.model';
import {ChecklistDatabase} from '@appDir/front-desk/masters/master-users/users/services/check-list-database.service';

enum Icon {
	view = 'fa fa-eye',
	edit = 'fa fa-edit',
	delete = 'fa fa-trash',
	task = 'fa fa-tasks',
}
@Component({
	selector: 'app-user-privileges',
	templateUrl: './user-privileges.component.html',
	styleUrls: ['./user-privileges.component.scss'],
})
export class UserPrivilegesComponent implements OnInit, OnChanges {
	subscription: Subscription[] = [];
	roles = [];
	specalities = [];
	disabledButton: boolean = false;
	isFacilitySupervisior: boolean = false;
	selection = [];
	permission_model = new permissionModel();
	database = null;

	@Input() isSuperAdmin;
	@Input() userPermissonData = [];

	@Input() facilityId: number;

	@Input() role_id = '';
	@Input() speciality_id = '';

	@Input() rolePermission;
	@Output() userPermissionUpdate = new EventEmitter();
	@Output() userModuleSelectAll = new EventEmitter();

	@Output() userFieldSelectAll = new EventEmitter();

	@Output() require_medical_identifiers = new EventEmitter();
	role: any = '';
	val_require_medical_identifier: any;
	/** Map from flat node to nested node. This helps us finding the nested node to be modified */
	flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();

	/** Map from nested node to flattened node. This helps us to keep the same object for selection */
	nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();

	/** A selected parent node to be inserted */
	selectedParent: TodoItemFlatNode | null = null;

	/** The new item's name */
	newItemName = '';

	treeControl: FlatTreeControl<TodoItemFlatNode>;

	treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;

	dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;

	/** The selection for checklist */
	checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);

	getLevel = (node: TodoItemFlatNode) => node.level;

	isExpandable = (node: TodoItemFlatNode) => node.expandable;

	getChildren = (node: TodoItemNode): TodoItemNode[] => node.children;

	hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;

	hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.item === '';

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private fb: FormBuilder,
		private toastrService: ToastrService,
		private logger: Logger,
		private ngZone: NgZone,
		private fdService: FDServices,
	) { }

	ngOnChanges(changes: SimpleChanges) {

		this.loadContent();
		this.getRoles();
		this.subscription.push(
			this.fdService.getSpecialities().subscribe((res) => {
				this.specalities = res.data;
			}),
		);
	}

	ngOnInit() {
		// this.loadContent();
		// this.getRoles();
		// this.subscription.push(
		// 	this.fdService.getSpecialities().subscribe(res => {
		// 		this.specalities = res.data;
		// 	})
		// );
	}

	loadContent() {
		// console.log('[userPermissionData]', this.userPermissonData);
		// for (let x in this.userPermissonData) {
		// 	this.userPermissonData[x].submenu = this.userPermissonData[x].submenu || [];
		// }

		this.database = new ChecklistDatabase(this.userPermissonData);
		this.database.MENU_DATA = this.userPermissonData;
		this.treeFlattener = new MatTreeFlattener(
			this.transformer,
			this.getLevel,
			this.isExpandable,
			this.getChildren,
		);
		this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
		this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
		this.subscription.push(
			this.database.dataChange.subscribe((data) => {
				this.dataSource.data = data;
				// console.table(this.dataSource.data);
				// console.log('[dataSource]', this.dataSource.data);
				if (data) {
					this.selectAllIntial();
				}
			}),
		);
	}

	// ngOnChanges() {
	// }
	getIcon(node) {
		if (node.icon == 'view') {
			return Icon.view;
		} else if (node.icon == 'edit') {
			return Icon.edit;
		} else if (node.icon == 'delete') {
			return Icon.delete;
		} else {
			return Icon.task;
		}
	}

	transformer = (node: TodoItemNode, level: number) => {
		const existingNode = this.nestedNodeMap.get(node);
		// const flatNode = existingNode && existingNode.item === node.item
		const flatNode =
			existingNode && existingNode.description === node.description
				? existingNode
				: new TodoItemFlatNode();
		// flatNode.item = node.item;
		flatNode.item = node.description;
		flatNode.description = node.description;
		flatNode.permissions = node.permissions;
		flatNode.isChecked = node.isChecked;
		flatNode.priv_key = node.priv_key;
		flatNode.icon = node.icon;
		flatNode.id = node.id;
		flatNode.level = level;
		flatNode.expandable = !!node.children;
		this.flatNodeMap.set(flatNode, node);
		this.nestedNodeMap.set(node, flatNode);
		return flatNode;
	};

	descendantsAllSelected(node: TodoItemFlatNode): boolean {
		const descendants = this.treeControl.getDescendants(node);
		const descAllSelected = descendants.every((child) => this.checklistSelection.isSelected(child));
		// console.log(node.item, descAllSelected);
		return descAllSelected;
	}

	/** Whether part of the descendants are selected */
	descendantsPartiallySelected(node: TodoItemFlatNode): boolean {
		// console.log('node----', node);
		const descendants = this.treeControl.getDescendants(node);
		const result = descendants.some((child) => this.checklistSelection.isSelected(child));
		if (node.item == 'Patient') {
			// console.log(node.item + ' Result', result);
			// console.log(node.item + ' All not selected', !this.descendantsAllSelected(node));
		}
		return result && !this.descendantsAllSelected(node);
	}

	/** Toggle the to-do item selection. Select/deselect all the descendants node */
	todoItemSelectionToggle(node: TodoItemFlatNode): void {
		// console.log("todoItemSelectionToggle");
		// this.logger.log(node);
		// this.logger.log('Sorted Arraysfdsf', this.checklistSelection.selected.map(val => val.id).sort((a, b) => b - a));
		this.checklistSelection.toggle(node);
		const descendants = this.treeControl.getDescendants(node);
		this.checklistSelection.isSelected(node)
			? this.checklistSelection.select(...descendants)
			: this.checklistSelection.deselect(...descendants);

		// this.logger.log('Sorted Selected', this.checklistSelection.selected.map(val => val.id).sort((a, b) => b - a));

		this.checkAllParentsSelection(node);

		// Force update for the parent
		/*  descendants.every(child =>
            this.checklistSelection.isSelected(child)
          );*/

		/*   if (node.level !== 0) {
             if (this.checklistSelection.isSelected(node)) {
               let parent: TodoItemFlatNode | null = this.getParentNode(node);
               ;
               if(parent)
               this.checklistSelection.select(parent);
               while (parent) {
                 ;
                 if (parent = this.getParentNode(parent)) {
                   this.checklistSelection.select(parent);
                 }
               }
             }
           }*/

		/*  const allDesc = descendants.every(child =>
            this.checklistSelection.isSelected(child)
          );
          console.log('allDesc ' + allDesc);
         // this.logger.log('DESC', descendants.length)
         // this.logger.log('DESC', descendants.length)
          if(!allDesc && node.level === 0){
            alert('un')
            this.checklistSelection.deselect(node);
          }*/

		// console.table(this.checklistSelection.selected);
		// this.logger.log('Sorted Array', this.checklistSelection.selected.map(val => val.id).sort((a, b) => b - a));
	}

	/** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
	todoLeafItemSelectionToggle(node: TodoItemFlatNode): void {
		// this.logger.log(node);
		this.checklistSelection.toggle(node);
		this.checkAllParentsSelection(node);

		if (this.checklistSelection.isSelected(node)) {
			let parent: TodoItemFlatNode | null = this.getParentNode(node);
			while (parent) {
				if ((parent = this.getParentNode(parent))) {
					this.checklistSelection.select(parent);
				}
			}
		}
		this.logger.log(
			'Sorted Array',
			this.checklistSelection.selected
				.map((val) => {
					return {
						id: val.id,
						name: val.item,
					};
				})
				.sort((a, b) => b.id - a.id),
		);
	}

	/* Checks all the parents when a leaf node is selected/unselected */
	checkAllParentsSelection(node: TodoItemFlatNode): void {
		let parent: TodoItemFlatNode | null = this.getParentNode(node);
		while (parent) {
			this.checkRootNodeSelection(parent);
			parent = this.getParentNode(parent);
			// console.log(parent);
		}
	}

	/** Check root node checked state and change it accordingly */
	checkRootNodeSelection(node: TodoItemFlatNode): void {
		const nodeSelected = this.checklistSelection.isSelected(node);
		const descendants = this.treeControl.getDescendants(node);
		/*const descAllSelected = descendants.every(child =>
          this.checklistSelection.isSelected(child)
        );*/
		const descAllSelected = descendants.some((child) => this.checklistSelection.isSelected(child));
		this.logger.log('descAllSelected -> ' + descAllSelected);
		if (nodeSelected && !descAllSelected) {
			this.checklistSelection.deselect(node);
		} else if (!nodeSelected && descAllSelected) {
			this.checklistSelection.select(node);
		}
	}

	/* Get the parent node of a node */
	getParentNode(node: TodoItemFlatNode): TodoItemFlatNode | null {
		// ;
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
		const checked: any[] = this.checklistSelection.selected.map((val) => val.priv_key);
		this.logger.log('Check in modue');
		// this.userPermissionUpdate.emit(checked);
		this.logger.log('checked', checked);
	}

	resetDataBase() {
		this.database.MENU_DATA = [];
		this.dataSource.data = [];
		this.selectAllIntial();
		this.checklistSelection.clear();
	}

	selectAllIntial() {
		// tslint:disable-next-line: forin
		for (const node in this.dataSource.data) {
			const desendants = this.treeControl.getDescendants(
				this.transformer(this.dataSource.data[node], 0),
			);
			desendants.forEach((val) => {
				//
				if (val.isChecked) {
					this.logger.log(val);
					this.checklistSelection.select(val);
					this.checkAllParentsSelection(val);

					let parent: TodoItemFlatNode | null = this.getParentNode(val);
					// this.checklistSelection.select(...parent.permissions);
					while (parent) {
						// ;
						this.logger.log(parent);

						if ((parent = this.getParentNode(parent))) {
							this.checklistSelection.select(parent);
						}
					}
					// console.log(this.checklistSelection);
					// console.log(this.checklistSelection.selected.map(as => as.id));
				}
			});
			// console.log(this.treeControl.getDescendants(node));
			// this.checklistSelection.select(node);
		}
		/*    console.log(this.dataSource.data);
            console.log(this.checklistSelection.selected);*/
	}

	cancel() {
		this.router.navigate(['/dashboard']);
	}

	selectedPermisison() {
		this.logger.log(this.checklistSelection.selected);
		this.logger.log(this.selection);
	}

	getRoles() {
		this.subscription.push(
			this.fdService.getRoles().subscribe((res) => {
				if (res.status) {
					this.roles = res.data;
					for (const role of this.roles) {
						let z = role.require_medical_identifiers;
						if (this.role_id === role.id) {
							this.role = role;
						}
						if (z > 0) {
							this.val_require_medical_identifier = true;
						}
					}
					// console.log('	this.val_require_medical_identifier', this.val_require_medical_identifier);
					if (this.val_require_medical_identifier) {
						this.require_medical_identifiers.emit(this.val_require_medical_identifier);
					}
				}
			}),
		);
	}

	updateRole(event) {
		if (this.role) {
			this.require_medical_identifiers.emit(this.role.require_medical_identifiers);
			this.role_id = this.role.id;
		}
	}
	ngOnDestroy(): void {
		unSubAllPrevious(this.subscription);
	}
}
