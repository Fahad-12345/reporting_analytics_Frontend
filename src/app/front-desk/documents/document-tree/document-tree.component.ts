import { ToastrService } from 'ngx-toastr';
import { CollectionViewer, SelectionChange, DataSource } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Injectable, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DocumentManagerServiceService } from '../services/document-manager-service.service';
import { FolderModel } from '../Models/FolderModel.Model';
import { AclService } from '@appDir/shared/services/acl.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';

/** Flat node with expandable and level information */
export class DynamicFlatNode {
	constructor(public item: FolderModel, public level = 1, public expandable = true,
		public isLoading = false, public hovered: boolean = false) { }
}

/**
 * Database for dynamic data. When expanding a node in the tree, the data source will need to fetch
 * the descendants data from the database.
 */
@Injectable({ providedIn: 'root' })
export class DynamicDatabase {

	constructor(private documentManagerService: DocumentManagerServiceService) {

	}
	rootLevelNodes: string[] = ['Fruits', 'Vegetables'];

	/** Initial data from database */
	initialData(caseId: number): Observable<any> {
		return this.documentManagerService.getAllFoldersV1(caseId, ["patientCases", "erx"]).pipe(
		map(response => {
			return response['data']
		}));
	}

	getChildren(node: DynamicFlatNode): Promise<any> {

		// ;
		if (node.item['children_recursive'] && node.item['children_recursive'].length > 0) {
			return new Promise((res, rej) => {
				node.item.child = node.item['children_recursive'].filter(folder => folder != null)
				node.item.child.map(folder => {
					folder.tree_path ? null : folder.tree_path = [];
					folder.tree_path = [...node.item.tree_path ? node.item.tree_path : [], { id: node.item.id, name: node.item.folder_name,qualifier:node.item.facility_qualifier }]
					// folder.tree_path.push({ id: node.item.id, name: node.item.folder_name })
				})
				res(node.item.child)
			})
		}
		// } else
		// 	return new Promise((res, rej) => {
		// 		   this.documentManagerService.getAllChildFoldersByFolderId(node.item.id).subscribe(response => {
		// 			// node.item = response['data']
		// 			node.item['child'] = response['data']
		// 			node.item.child.map(folder => {
		// 				folder.tree_path ? null : folder.tree_path = [];
		// 				folder.tree_path = [...node.item.tree_path ? node.item.tree_path : [], { id: node.item.id, name: node.item.folder_name, qualifier:node.item.facility_qualifier}]
		// 				// folder.tree_path.push({ id: node.item.id, name: node.item.folder_name })
		// 			})
		// 			// node.item.child.push(response['data'])
		// 			res(node.item.child)
		// 		}, err => rej(err));
		// 	})
	}

	isExpandable(node: DynamicFlatNode): boolean {
		return node.item.has_child || node.item['children_recursive'] && node.item['children_recursive'].length > 0;
	}
}
/**
 * File database, it can build a tree structured Json object from string.
 * Each node in Json object represents a file or a directory. For a file, it has filename and type.
 * For a directory, it has filename and children (a list of files or directories).
 * The input will be a json object string, and the output is a list of `FileNode` with nested
 * structure.
 */
export class DynamicDataSource implements DataSource<DynamicFlatNode> {

	dataChange = new BehaviorSubject<DynamicFlatNode[]>([]);

	get data(): DynamicFlatNode[] { return this.dataChange.value; }
	set data(value: DynamicFlatNode[]) {
		this._treeControl.dataNodes = value;
		this.dataChange.next(value);
	}

	expandedNodes: DynamicFlatNode[] = []
	constructor(public _treeControl: FlatTreeControl<DynamicFlatNode>,
		private _database: DynamicDatabase) { }

	connect(collectionViewer: CollectionViewer): Observable<DynamicFlatNode[]> {
		this._treeControl.expansionModel.changed.subscribe(change => {
			if ((change as SelectionChange<DynamicFlatNode>).added ||
				(change as SelectionChange<DynamicFlatNode>).removed) {
				this.handleTreeControl(change as SelectionChange<DynamicFlatNode>);
			}
		});

		return merge(collectionViewer.viewChange, this.dataChange).pipe(map(() => this.data));
	}

	disconnect(collectionViewer: CollectionViewer): void { }

	/** Handle expand/collapse behaviors */
	handleTreeControl(change: SelectionChange<DynamicFlatNode>) {
		if (change.added) {
			change.added.forEach(node => this.toggleNode(node, true));
		}
		if (change.removed) {
			change.removed.slice().reverse().forEach(node => this.toggleNode(node, false));
		}
	}
	saveExpandedNodes() {
		// this.expandedNodes = new Array<DynamicFlatNode>();
		this._treeControl.dataNodes.forEach(node => {
			if (node.expandable && this._treeControl.isExpanded(node)) {
				this.expandedNodes.push(node);
			}
		});

		this.expandedNodes = Array.from(new Set(this.expandedNodes))
	}

	restoreExpandedNodes() {
		this.expandedNodes.forEach(node => {
			let isExpanded = this._treeControl.isExpanded(node)
			// if (!isExpanded)
			this._treeControl.expand(this._treeControl.dataNodes.find(n => n.item.id === node.item.id));
		});
	}
	/**
	 * Toggle the node, remove from display list
	 */
	toggleNode(node: DynamicFlatNode, expand: boolean) {
		if (!node) { return; }
		if (expand) {
			//node.isLoading = true;

			this._database?.getChildren(node)?.then((data: FolderModel[]) => {
				const index = this.data.indexOf(node);
				const children = data
				const nodes = children.map(folder =>
					new DynamicFlatNode(folder, node.level + 1, this._database.isExpandable({ item: folder } as any)));
				this.data.splice(index + 1, 0, ...nodes);

				// this.data = makeDeepCopyArray(this.data)
				// notify the change
				this.dataChange.next(this.data);
				node.isLoading = false;
				this.saveExpandedNodes()
				this.restoreExpandedNodes()
			})
		} else {
			const index = this.data.indexOf(node);

			let count = 0;
			for (let i = index + 1; i < this.data.length
				&& this.data[i].level > node.level; i++, count++) { }
			this.data.splice(index + 1, count);
			this.dataChange.next(this.data);
			this.expandedNodes = this.expandedNodes.filter(_node => node.item.id != _node.item.id)
		}


	}
}

/**
 * @title Tree with dynamic data
 */
@Component({
	selector: 'document-tree',
	templateUrl: 'document-tree.component.html',
	styleUrls: ['document-tree.component.scss']
})
export class DocumentTreeComponent extends PermissionComponent {

	@Input() caseId: number;
	@Input() patientId: number;
	@Output() onSelectionChange = new EventEmitter<{ selectedFolders: FolderModel[], deselectedNode: FolderModel }>()
	@Input() folders: FolderModel[] = []
	constructor(
		private toastrService: ToastrService,
		private database: DynamicDatabase, private documentManagerService: DocumentManagerServiceService,
		aclService: AclService) {
			super(aclService);
		this.treeControl = new FlatTreeControl<DynamicFlatNode>(this.getLevel, this.isExpandable);
		this.dataSource = new DynamicDataSource(this.treeControl, database);
		

		this.dataSource.data = []

	}

	treeControl: FlatTreeControl<DynamicFlatNode>;

	dataSource: DynamicDataSource;

	@Input() removeItem: FolderModel;
	@Input() unselectAll: boolean = false;
	selectedFolders: FolderModel[] = []

	ngOnChanges(changes: SimpleChanges) {
		if (changes.unselectAll) {
			this.selectedFolders = []
			this.onSelectionChange.emit({ selectedFolders: this.selectedFolders, deselectedNode: null })
		}
		if (changes.folders) {
			// this.treeControl.collapseAll()
			this.dataSource.data = this.folders.map(folder => {
				return new DynamicFlatNode(folder, 1, folder.has_child || folder['children_recursive'] && folder['children_recursive'].length > 0)
			})
			this.dataSource.restoreExpandedNodes();
			this.selectedFolders;
			// this.selectedFolders= this.folders;
			//this.selectedFolders = this.selectedFolders.filter(folder => this.folders.includes(folder))
			this.onSelectionChange.emit({ selectedFolders: this.selectedFolders, deselectedNode: null })
		}

		if (changes.selectedFolders) {
		}

		if (changes.removeItem) {
			this.selectedFolders = this.selectedFolders.filter(folder => folder.id != this.removeItem.id)
		}
	}


	todoLeafItemSelectionToggle(node: DynamicFlatNode, event) {
		debugger;
		if (!node.item.has_file_permission){
			this.toastrService.error('User has no permission', 'Error');
			return false;
		}
		let deselect
		if (event.checked) {
			this.selectedFolders.push(node.item)

		// 	const descendants = this.treeControl.getDescendants(node);
    	// 	if( descendants.length > 0){
		// 		descendants.forEach(child => {
		// 			this.selectedFolders.push(child.item);
		// 	});				
		// }
		} else {
			this.selectedFolders = this.selectedFolders.filter(folder => folder.id != node.item.id)
			deselect = node.item
		}
		this.onSelectionChange.emit({ selectedFolders: this.selectedFolders, deselectedNode: deselect })

	}
	expandrecord(node: DynamicFlatNode) {
		let result = this.selectedFolders.find(folder => folder.id == node.item.id)
		if (result) {
			this.todoLeafItemSelectionToggle(node, { checked: false })
		}
		else {
			this.todoLeafItemSelectionToggle(node, { checked: true })
		}
	}

	expandNode(node: FolderModel, level: number): void {
		if (level <= 0) return;
		 this.treeControl.expandAll();
		if (node.children_recursive) {
		  node.children_recursive.forEach((child) => this.expandNode(child, level - 1));
		}
	  }
	
	

	getLevel = (node: DynamicFlatNode) => node.level;

	isExpandable = (node: DynamicFlatNode) => node.expandable;

	hasChild = (_: number, _nodeData: DynamicFlatNode) => _nodeData.expandable;

	isFolderSelected(id: number) {

		let folder = this.selectedFolders.find(folder => id == folder.id)
		return folder ? true : false
	}
	onHovered(event: boolean, node: DynamicFlatNode) {
		node.hovered = event
	}
}
