/**
 * The Json object for to-do list data.
 */


import { BehaviorSubject } from 'rxjs';
import { PermissionItemNode } from '@appDir/front-desk/models/permission.model';

/**
 * Checklist database, it can build a tree structured Json object.
 * Each node in Json object represents a to-do item or a category.
 * If a node is a category, it has children items and new items can be added under the category.
 */
// @Injectable()
export class PermissionsListDatabaseService {
	dataChange = new BehaviorSubject<PermissionItemNode[]>([]);

	get data(): PermissionItemNode[] {
		return this.dataChange.value;
	}

	constructor(public MENU_DATA: any) {
		if (this.MENU_DATA)
			this.initialize();
	}

	initialize() {
		// Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
		//     file node as children.
		const data = this.buildFileTree(this.MENU_DATA, 0);

		// Notify the change.
		this.dataChange.next(data);
	}

	/**
	 * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
	 * The return value is the list of `TodoItemNode`.
	 */

	buildFileTree(arr: any, level: number): PermissionItemNode[] {
		return arr
			.reduce((accumulator, key) => {


				const value: any = key;
				const node = new PermissionItemNode();

				// node.item = key.name;
				node.item = value.description || value.name;
				node.description = value.description || value.name;
				node.isChecked = value.is_checked;
				node.permissions = value.permissions;
				node.submenu = value.submenu;
				node.isSelf = value.is_self;

				let self = false;

				/* filter out self permission */
				let selfPermission = [];
				if (node.permissions) {
					selfPermission = node.permissions.filter((val, index) => val.is_self === 1);
				}


				/*if (Object.keys(value).indexOf('description') !== -1) {
					node.id = value.id;
				} else if (value.permissions && selfPermission.length > 0) {
					node.id = selfPermission[0].id;
				}*/

				if (node.permissions && selfPermission.length > 0) {
					// console.log(selfPermission[0]);
					node.id = selfPermission[0].id;
					node.isChecked = selfPermission[0].is_checked;
					self = true;
				} else {
					node.id = value.id;
				}

				if (value != null) {
					if (typeof value === 'object' && (Object.keys(value).indexOf('submenu') !== -1) ||
						Object.keys(value).indexOf('permissions') !== -1) {
						// node.children = this.buildFileTree(node.submenu && node.submenu.length ? [...node.submenu, ...node.permissions] : node.permissions || [], level + 1);
						node.children = this.buildFileTree([...node.submenu || [], ...node.permissions || []], level + 1);
						if (node.children.length === 0)
							node.children = null;
						// console.log(node.children);
					} else {
						// console.log('NO SUBME');
					}
				}
				let response = accumulator;
				if (!node.isSelf) {
					response = accumulator.concat(node);
				}

				// return accumulator.concat(node);
				return response;
			}, []);
	}

}
