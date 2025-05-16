import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Page } from '@appDir/front-desk/models/page';
import { SelectionModel } from '@angular/cdk/collections';
import { RequestService } from '@appDir/shared/services/request.service';
import { sharedUrlsEnum } from '../../shared-file-upload/shared-file-Urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { ToastrService } from 'ngx-toastr';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { DocumentManagerServiceService } from '@appDir/front-desk/documents/services/document-manager-service.service';
import { FolderModel } from '@appDir/front-desk/documents/Models/FolderModel.Model';
import * as _ from 'lodash';
import { Params, ActivatedRoute } from '@angular/router';
import { isSameLoginUser } from '@appDir/shared/utils/utils.helpers';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';

@Component({
	selector: 'app-folder-component',
	templateUrl: './folder-component.component.html',
	styleUrls: ['./folder-component.component.scss']
})
export class FolderComponentComponent extends PermissionComponent implements OnInit {

	constructor(
		private documentManagerService: DocumentManagerServiceService,
		protected requestService: RequestService,
		public storageDate: StorageData,
		private ActivatedRoute: ActivatedRoute,
		private customDiallogService: CustomDiallogService,
		private toastrService: ToastrService) {
		super()
	}
	@Input() editable: boolean = true
	@Input() folder: FolderModel;
	@Input() objectType: string;
	@Output() getAllDocuments = new EventEmitter();
	@Input() pdfSourceLink: any;
	@Input() title: string
	@Input() imageSourceLink: any;
	@Input() visitSessionId:any;
	@Output() showMedia = new EventEmitter();
	@Output() editDocModal = new EventEmitter();
	@Output() addTagModal = new EventEmitter();
	@Output() deleteMultipleFiles = new EventEmitter();
	@Output() onFileDelete = new EventEmitter();

	page: Page = new Page();
	selection = new SelectionModel<any>(true, []);
	selectedRow: number;
	existing_page_size = 0;
	id;
	isSameUser = true;
	ngOnInit() {
		if (this.folder.files_count) {
			this.page.totalElements = this.folder.files_count;
		} else {
			this.page.totalElements = 0;
		}
		this.page.size = 10;
		this.getId();
		this.toggleFolderShow(this.folder);
	}
	folderShown: boolean = false;
	toggleFolderShow(folder: FolderModel) {
		// folder.show = !folder.show;
		this.folderShown = !this.folderShown
		if (this.folderShown && this.visitSessionId) { 
			this.getfilesFromFolderId(folder).subscribe(data => {
				// console.log(data)
				// folder = data['data']
				folder['files'] = data['data']
				// folder['child'] = data['data']['child'];
				if (folder && folder.files && folder.files[0]) {
					this._showMedia({ files: folder.files[0].pre_signed_url, type: folder.files[0].ext })
				}
				// folder['files_count'] = data['data']['files_count'];
				// folder['total_files_count'] = data['data']['total_files_count'];
				this.page.totalElements = data['count']

			});
		}
	}
	getfilesFromFolderId(folder: FolderModel) {
		debugger;
		if (this.existing_page_size < this.page.size) {
			this.page.pageNumber = 1;
			this.existing_page_size = this.page.size;
		} {
			this.existing_page_size = 10;
		}
        if (this.visitSessionId){
		return this.documentManagerService.getFilesFromFolderId(folder.id, this.page.size, this.page.pageNumber, new Set(),this.visitSessionId);
		}
		// else {
		// 	return this.documentManagerService.getFilesFromFolderId(folder.id, this.page.size, this.page.pageNumber, new Set());

		// }
	}
	SingleSelect(row) {
		if(_.some(this.selection.selected, row)) {
			_.remove(this.selection.selected, item => item.id == row.id);
			this.selection.selected.forEach(file => {
				this.selection.toggle(file);
			});
		} 
		else {
			this.selection.toggle(row);
		}
	}
	masterToggle(event) {
		if(event.checked) {
			this.folder.files.forEach(file => {
				this.selection.toggle(file);
				this.selectionData.push(file);
				this.isCheckedSingle(file);
			});
		} else if(!event.checked) {
			this.selectionData = [];
			this.selection.clear();
		}
	}
	isCheckedSingle(row) {
		this.selectionData.forEach(element => {
			if(element.id == row.id) {
				return true;
			} else {
				return false;
			}
			
	});
	}
	deleteFile(row) {
		const id = [];
		id.push(row.id);
		const data = {
			ids: id,
		};
		this.deleteForFiles(data);

	}
	deleteForFiles(data) {
		this.customDiallogService
		.confirm('Delete File', 'Are you sure you want to delete this file?')
		.then((confirmed) => {
			if (confirmed) {
				this.startLoader = true;
				// this.fd_services.deleteDocument(data)
				this.requestService
					.sendRequest(
						sharedUrlsEnum.shartedFile_list_DELETE,
						'POST',
						REQUEST_SERVERS.document_mngr_api_path,
						data
					)
					.subscribe((resp: any) => {
						this.startLoader = false;
						if (resp.status === true) {
							this.onFileDelete.emit(this.folder.files.find(file => file.id == data.ids[0]))
							this.pdfSourceLink = 'xyz';
							this.imageSourceLink = null;
							// this.getAllDocuments();
							this.getAllDocuments.emit()
							this.toastrService.success('Deleted successfully','Success');
							
						}
					});
			}
		})
		.catch();
	}

	_showMedia(file, id?: any) {
		this.selectedRow = id;
		this.showMedia.emit(file)
	}
	_editDocModal(row) {
		this.selectedRow = null;
		this.editDocModal.emit(row)
	}
	_addTagModal(row) {
		this.selectedRow = null;
		this.addTagModal.emit(row);
	}
	_deleteMultipleFiles() {
		this.selectedRow = null;
		let selected = this.selectionData;
		let ids = [];
		selected.forEach(selected => {
			ids.push(selected.id)
		});
		this.deleteMultipleFiles.emit(ids)
	}
	_print(){
		this.selectedRow = null;
	}
	changeDocumentPageSize(folder, event) {
		this.page.size = event.target.value;
		// this.page.existingPageNumber = event.target.value;

		this.getfilesFromFolderId(folder).subscribe(data => {
			// console.log(data)
			// folder = data['data']
			// console.log(data)
			// folder = data['data']
			folder['files'] = data['data'];
			folder['child'] = data['data'];
			// folder['files_count'] = data['count'];
			folder['total_files_count'] = data['data']['total_files_count'];
			this.page.totalElements = data['count']


		});
	}
	changeDocumentPageNumber(folder, offset) {
		this.page.pageNumber = 1 + offset;
		this.getfilesFromFolderId(folder).subscribe(data => {
			// console.log(data)
			// folder = data['data']
			folder['files'] = data['data'];
			folder['child'] = data['data'];
			// folder['files_count'] = data['count'];
			folder['total_files_count'] = data['data']['total_files_count'];
			this.page.totalElements = data['count']

		});
	}
	ngOnChanges(simpleChanges: SimpleChanges) {
		if (simpleChanges.folder && this.visitSessionId) {
			this.getfilesFromFolderId(this.folder).subscribe(data => {
				// console.log(data)
				// folder = data['data']
				this.folder['files'] = data['data']
				// folder['child'] = data['data']['child'];
				if (this.folder && this.folder.files && this.folder.files[0]) {
					this._showMedia({ files: this.folder.files[0].pre_signed_url , type: this.folder.files[0].ext })
				}
				this.page.totalElements = data['count']

			});
		}
	}
	  isallComplete() {
		//   console.log(this.selection.selected.length);
		//   console.log(this.folder.files.length);

		if(this.folder.files && (this.selectionData.length == this.folder.files.length)) {
			return true;
		} else{
			return false;
		}
	  }
	  selectionData:any[] = [];
	  getData(row) {
		if(this.selectionData.length < 1) {
			this.selectionData.push(row);
		} else {
			if(this.selectionData.some(data => data.id == row.id)){
				_.remove(this.selectionData, function(currentObject) {
					return currentObject.id === row.id;
				});
			} else {
				this.selectionData.push(row);
						}
		}
	  }
	  getId() {
		this.ActivatedRoute.parent.params.subscribe((params: Params) => {
			this.id = params['id'];
		  });
		  this.isSameUser = isSameLoginUser(this.id);
	  }
}
