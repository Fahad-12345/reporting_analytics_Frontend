import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Logger } from '@nsalaun/ng-logger';
import { Subscription } from 'rxjs';
import { FileModel } from '../Models/FilesModel.Model';
import { Page } from '@appDir/front-desk/models/page';
import { DocumentManagerServiceService } from '../services/document-manager-service.service';
import { FolderModel } from '../Models/FolderModel.Model';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';

@Component({
	selector: 'app-document-list',
	templateUrl: './document-list.component.html',
	styleUrls: ['./document-list.component.scss']
})
export class DocumentListComponent extends PermissionComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	emailForm: FormGroup;
	public addFolderForm: FormGroup;
	form: FormGroup;
	mergeForm: FormGroup;
	editForm: FormGroup;
	addTagForm: FormGroup;
	modalRef: NgbModalRef;
	uploadmodalRef: NgbModalRef;
	fileTitle: '';
	tags: '';
	file: any;
	showCreateFolderLink: boolean = true;
	// counter: any = 0;
	totalSelected: number = 0;
	selectedFiles: any[] = [];
	private imageSrc: string = '';
	selection = new SelectionModel<any>(true, []);
	levelTwoSelections = [];
	disableBtnUploadDocument = false;
	selectAll: boolean = false;
	public subfolders: any = [];
	disableBtn: boolean = false;
	public url = '';
	public uploadFiles = [];
	userEmail: string;
	uploadCount: number;
	// @Input() folder:Object<any>;

	@Input() PreviewedFile: { link: string, ext: any }
	@Input() folders:any;
	@Input() caseId: any;
	@Input() parentSelection: any;
	@Input() patientId: any;
	@Input() folder: FolderModel;
	@Input() folderList: any[];
	@Input() parentId: any
	@Input() selectedTags: Set<any>
	@Input() isParentChecked: boolean;
	@Input() folderTittle: any[];
	@Input() showFolders: boolean = true
	@Output() getAllFolderList = new EventEmitter();
	@Output() dropped = new EventEmitter();
	@Output() filePreview = new EventEmitter<{ pre_signed_url:string,link: string, ext: string ,id:any}>();
	@Output() getUpdatedDocument: any = new EventEmitter();
	@Output() updateAllSelection: EventEmitter<any> = new EventEmitter();
	@Output() getUpdatedTags: EventEmitter<any> = new EventEmitter();
	@Output() deleteFilesOrFilders: EventEmitter<any> = new EventEmitter();
	@Output() resetCounters: EventEmitter<any> = new EventEmitter();
	@Output() changePrint: EventEmitter<any> = new EventEmitter();
	@Output() removeRecord = new EventEmitter();
	@Output() refreshFoldersFiles = new EventEmitter();
	// @Output() folderIds = new EventEmitter()
	@Input() previewUrl: string;
	@Input() 	selectedFilesList: any[];

	constructor(
		private fb: FormBuilder,
		private storageData: StorageData,
		private logger: Logger,
		private documentManagerService: DocumentManagerServiceService,
		aclService:AclService
	) {
		super(aclService)
		this.form = this.fb.group({
			fileTitle: ['', [Validators.required]],
			tags: '',
			caseId: this.caseId,
			file: '',
			parentId: ['', [Validators.required]],
			sfolderId: '',
			ext: '',
			description: ['', [Validators.maxLength(100)]]
		})

	}

	getCount(folder) {
		return folder.isFolderSelected ? folder.total_files_count ? folder.total_files_count : folder.files_count : folder.selection.selected.length;
	}

	refreshFolderFile($event){
		this.refreshFoldersFiles.emit($event);
	}

	@Output() documentUpdate = new EventEmitter();
	documentUpdated($event){
		this.documentUpdate.emit($event);
		
	}

	page: Page = new Page()
	treepathlength: number
	ngOnInit() {
		this.folder['tree_path'] = this.folder['tree_path'].filter(m => m.id != this.folder.id)
		this.folder['tree_path'].push({ id: this.folder.id, name: this.folder.folder_name ,qualifier:this.folder.facility_qualifier})
		this.treepathlength = this.folder['tree_path'].length - 1
		if (this.folder.files_count) {
			this.page.totalElements = this.folder.files_count
		} else {
			this.page.totalElements = 0
		}
		this.page.size = 10
		this.folder.selection = new SelectionModel<any>(true, []);
		if (this.folder && this.folder.child) {
			this.folder.child.map((child) => {
				return child['selection'] = new SelectionModel<any>(true, []);
			});
		}

		this.subscription.push(
			this.folder.selection.changed.subscribe(event => {
				// this.updateSelection(this.folder.selection.selected);
				this.updateAllSelection.emit(this.folder.selection.selected);
			}));
	}

	viewFile(file: FileModel): void {
		this.filePreview.emit({pre_signed_url:file.pre_signed_url, link: file.link, ext: file.ext, id:file.id });
	}

	isAllSelected(selection, child, files) {
		if (selection) {
			let numSelected = selection.selected.length;
			let numRows = (files) ? files.length : 0;
			let secondLevelFiesCount = 0;
			if (child && child.length > 0) {
				for (let x in child) {
					if (child[x].files) {
						secondLevelFiesCount += child[x].files.length;
					}
				}
				// child.foreach(child => {
				//   secondLevelFiesCount += child.files.length;
				// });
			}
			return numSelected == numRows + secondLevelFiesCount;
		}
		return 0;
	}



	selectAllFiles(selection, files: any[]) {
		try {
			files.forEach(row => {
				selection.select(row);
				this.parentSelection.select(row)
			})
		} catch (e) {
		}
	}
	ngOnDestroy() {
		this.folder['tree_path'] = this.folder['tree_path'].filter(m => m.id != this.folder.id)
		this.folder.selection ? this.folder.selection.deselect(...this.folder.files) : ''
		this.parentSelection.deselect(...this.folder.files);
		this.folder.isFolderSelected = false
		unSubAllPrevious(this.subscription);
		this.logger.log('document-list OnDestroy Called');
	}

	clearSelections(folder: FolderModel) {
		if (folder && folder.selection) {
			folder.isFolderSelected = false;
			folder.selection.deselect(...folder.files);
			this.parentSelection.deselect(...folder.files)
			// folder.selection.clear();
			// this.parentSelection.deselect(folder.files);
		}
		if (folder.child && folder.child.length) {
			folder.child.forEach((folderChild: FolderModel) => {
				this.clearSelections(folderChild);
			})
		} else {
			return
		}
	}
	selectedFolderid: any[] = []
	deepCheckFile(event) {
		this.parentSelection.deselect(...this.folder.selection.selected)
		this.folder.selection.clear();
		this.folder.isFolderSelected = (event.checked) ? true : false;

		this.folder.child ? this.folder.child.forEach((subFilder) => {
			this.parentSelection.deselect(...subFilder.selection.selected)
			subFilder.selection.clear();
			subFilder.isFolderSelected = (event.checked) ? true : false;
		}) : null;
		// this.folder.isFolderSelected ? this.selectedFolderid.push(this.folder.id) : this.selectedFolderid = this.selectedFolderid.filter(m => m.id != this.folder.id)
		// this.folderId = this.folder.id
		this.updateAllSelection.emit(this.folder.isFolderSelected);
	}

	onActionChange(selection, files, event) {
		if (event.checked) {
			this.selectAllFiles(selection, files)
		} else {
			this.parentSelection.deselect(...this.folder.selection.selected)
			//this.folder.selection.selected.forEach(val => this.parentSelection.dese)
			this.folder.selection.clear()
		}
	}
	getSubfoldersFromId() {
		return this.folder.child || []
	}
	folderId: any
	getselectedFolderFiles($event) {
		this.folderId = $event.id
	}
	getSubfolders(id) {
		if (!id) { return [] }
		var folder = this.folderList.find(folder => {
			if (folder.id == id) {
				return folder
			}
		})
		if (!folder) return []
		this.documentManagerService.getFilesFromFolderId(id).subscribe(data => {
			this.subfolders = data['data'].child
		})
	}
	toggleRows(row) {
		this.folder.selection.toggle(row)
		this.parentSelection.toggle(row);
	}
	getLinkwithAuthToken(link) {
		let token = this.storageData.getToken()
		if (token) {
			return `${link}&token=${token}`
		}
		else { return link }

	}
	removeFolder(folder) {
		this.removeRecord.emit(folder)
	}
}
