import { DatePipeFormatService } from './../../../../shared/services/datePipe-format.service';
import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { FolderModel } from '../../Models/FolderModel.Model';
import { Config } from '@appDir/config/config';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { DocumentManagerServiceService } from '../../services/document-manager-service.service';
import { Page } from '@appDir/front-desk/models/page';
import { SelectionModel } from '@angular/cdk/collections';
import { Subscription } from 'rxjs';
import { FileModel } from '../../Models/FilesModel.Model';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { SignatureURLEnum } from '@appDir/shared/signature/SignatureURLEnums.enum';
import { MainService } from '@appDir/shared/services/main-service';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { Socket } from 'ngx-socket-io';
var printJs = require("print-js");
@Component({
	selector: 'app-document-shared-listing',
	templateUrl: './document-shared-listing.component.html',
	styleUrls: ['./document-shared-listing.component.scss'],
	//   changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentSharedListingComponent extends PermissionComponent implements OnInit {

	@Input() PreviewedFile: { link: string, ext: any, pre_signed_url:any }
	@Input() folder: FolderModel;
	@Input() folderList: any[];
	@Input() parentSelection: any;
	@Output() documentUpdated = new EventEmitter();
	@Output() viewFile = new EventEmitter<{ pre_signed_url:string,link: string, ext: string ,id:any}>();
	@Output() refreshFolderFiles = new EventEmitter();
	@Input() selectedTags: Set<any>
	@Input() folderId: any;
	@Input() showFolders: boolean = true;
	@Input() selectedFilesList: any[] =[];
	@Input() caseId: number;
	@Input() folders:any;
	page: Page = new Page()
	selection = new SelectionModel<any>(true, []);
	subscription: Subscription[] = [];
	editForm: FormGroup;
	emailForm: FormGroup;
	mergeForm: FormGroup;
	addTagForm: FormGroup;
	file: any;
	foldersData: any[]
	finalCount: any
	selectedFiles: any
	modalRef: NgbModalRef;
	disableBtn: boolean = false;
	disableMoveBtn: boolean = false;
	disableCopyBtn: boolean = false;
	addtags: string
	public url = '';
	public subfolders: any = [];
	userEmail: string;

	@Input() lstFolder: FolderModel[] = []
	lstSubFolders: FolderModel[][] = [];
	folder_id: number;
	notMoveAbleFolder:FolderModel;
	constructor(
		private config: Config,
		// // private _http: HttpClient,
		// // private _FileSaverService: FileSaverService,
		// // private http: HttpClient,
		// // private localStorate: LocalStorage,
		private modalService: NgbModal,
		private fb: FormBuilder,
		private fd_services: FDServices,
		private toasterService: ToastrService,
		private customDiallogService : CustomDiallogService,
		private storageData: StorageData,
		private mainService: MainService,
		// private logger: Logger,
		private documentManagerService: DocumentManagerServiceService,
		public datePipeServie:DatePipeFormatService,
		private socket:Socket,
		aclService:AclService
	) { 
		super(aclService);
		this.initializeEditDocModal();
	 }

	ngOnInit() {
		 this.bindFolderChange();
		if (this.folder.files_count){ 
			this.page.totalElements = this.folder.files_count;
			this.page.offset =this.folder.files_count;
		}
		else {        
		this.page.totalElements = 0
		}
		this.page.size = 10
		this.page.pageNumber = 1;
		
		this.folder.selection = new SelectionModel<any>(true, []);
	
			// this.documentManagerService.getAllFolders(this.caseId, 'patientCases').subscribe(data => {
			//   this.lstFolder = data['data']
			// })
		  
		if (this.folder && this.folder.child) {
			this.folder.child.map((child) => {
				return child['selection'] = new SelectionModel<any>(true, []);
			});
		}
		this.setTagForm()
		this.documentManagerService.isRefresh.subscribe(res => {
			if (this.parentSelection && this.parentSelection.hasValue()){
			this.parentSelection.deselect(...this.folder.files);
			}
			if (this.folder){
			this.folder.isFolderSelected = false;
			}

			if (this.documentManagerService && this.documentManagerService.folderIds &&  this.documentManagerService.folderIds.includes(this.folder.id)) {
				this.getfilesByfolderId(this.folder.id)
			}
		})
	}

	removeFromIndex(index, form: FormArray) {
		while (form.at(index + 1)) {
		  form.removeAt(index + 1)
		  this.lstSubFolders.splice(index + 1, 1)
		}
	  }

	
	bindSubFolderChange(_form: FormGroup, index) {
		_form.controls['id'].valueChanges.subscribe(value => {
	
		  // if (!value) {
		  let sFoldersForm: FormArray = <FormArray>this.editForm.get('sfolderId');

		  this.removeFromIndex(index, sFoldersForm);
		  let folder = this.lstSubFolders[index].find(folder => folder.id == value);
		//   this.documentManagerService.getAllChildFoldersByFolderId(value).subscribe(data => {
			folder['child'] = folder?.children_recursive?.filter(values=>values.parent ==value);
			if (folder.child && folder.child.length > 0) {
			  let sFoldersForm: FormArray = <FormArray>this.editForm.get('sfolderId')
			  let form = this.fb.group({ id: '' })
			  this.lstSubFolders[index + 1] = (folder.child)
			  // this.clearFormArray(sFoldersForm)
			  sFoldersForm.push(form)
			  this.bindSubFolderChange(form, sFoldersForm.length - 1)
			}
		//   })
		  // }
		})
	  }

	  clearFormArray = (formArray: FormArray) => {
		while (formArray.length !== 0) {
		  formArray.removeAt(0)
		}
	  }
	

	bindFolderChange() {
		this.editForm.controls['parentId'].valueChanges.subscribe(value => {
		value;
		  let sFoldersForm: FormArray = <FormArray>this.editForm.get('sfolderId')
		  this.removeFromIndex(0, sFoldersForm)
		  let folder = this.lstFolder.find(folder => folder.id == value)
		  if (folder && folder.child && folder.child.length > 0) {
			this.lstSubFolders[0] = (folder.child)
			let sFoldersForm: FormArray = <FormArray>this.editForm.get('sfolderId')
			this.clearFormArray(sFoldersForm)
			let form = this.fb.group({ id: '' })
	
			sFoldersForm.push(form)
			this.bindSubFolderChange(form, sFoldersForm.length - 1)
		  } else if (folder && !folder.child) {
			// this.documentManagerService.getAllChildFoldersByFolderId(value).subscribe(data => {
			  folder['child'] = folder?.children_recursive?.filter(values=>values.parent ==value);
			  if (folder.child && folder.child.length > 0) {
				let sFoldersForm: FormArray = <FormArray>this.editForm.get('sfolderId')
				let form = this.fb.group({ id: '' })
				this.lstSubFolders[0] = (folder.child)
				this.clearFormArray(sFoldersForm)
				sFoldersForm.push(form)
				this.bindSubFolderChange(form, sFoldersForm.length - 1)
			  }
			// })
		  }
		  else {
			this.lstFolder = this.folderList;
		  }
		})
	  }

	print(url) {
		printJs({ printable: url, type: 'pdf', showModal: true, modalMessage: 'Loading...' });
	}
	setFolderId(id) {
		this.getfilesByfolderId(id)
		this.refreshFolderFiles.emit(true);
	}
	ngOnChanges(simpleChanges: SimpleChanges) {
		if (this.folderId) {
			this.folder.files_count ? this.page.totalElements = this.folder.files_count : this.page.totalElements = 0
			this.getfilesByfolderId(this.folderId)
		}
		if (simpleChanges.PreviewedFile) {
			this.folder && this.folder.files ? this.folder.files = [...this.folder.files] : null
		}
		this.folder && this.folder.selection &&  this.folder.selection?.selected  ? this.parentSelection.select(...this.folder.selection?.selected) : ''
	}
	getfilesByfolderId(id, pagesize?, pageNumber?, selectedtag?) {
		this.startLoader = false;
		id = id ? id : this.folder_id;
		if (this.folder && this.folder.selection && this.folder.selection.hasValue()){
		this.folder.selection.deselect(...this.folder.files);
		}
		if (this.parentSelection && this.parentSelection.hasValue()) {
		this.parentSelection.deselect(...this.folder.files);
		}
		// this.folder['files'] = [];
		// this.documentManagerService.getFilesFromFolderId(id, this.page.size, this.page.pageNumber, this.selectedTags).subscribe(res => {
		// 	this.startLoader = false;
		// 	this.folder['files'] = []
		// 	this.folder['files'] = res['data']
		// 	this.page.totalElements = res['count']
		// }, err => {
		// 	this.startLoader = false;
		// })
	}
	changeDocumentPageNumber(folder, number) {
		this.clearSelections(folder);
		this.page.pageNumber = number + 1;
		this.getfilesByfolderId(folder.id, this.page.size, this.page.pageNumber, true)
	}
	openInWindow(row) {
		if (row?.ext == "pdf" || row?.ext == "PDF") {
			// window.open(`${row.link}&&authorization=Bearer ${this.storageData.getToken()}`);
			 window.open(`${row?.pre_signed_url}`);
		}
		else {
			this.mainService.openDocSingature(SignatureURLEnum.tempSingturUrlPreDefined,row?.id).subscribe(res=>{
				if (res?.data){
					let link = res?.data?.[0]?.pre_signed_url;
					window.open(`${link}`);
				}
		});
		}
	}
	getLinkwithAuthToken(link) {
		{ return link };
		let token = this.storageData.getToken()
		if (token) {
			return `${link}&token=${token}`
		}
		else { return link }
	}
	getCount(folder) {

		return folder.isFolderSelected ? folder.total_files_count ? folder.total_files_count : folder.files_count : folder.selection.selected.length;
	}
	onActionChange(selection, files, event) {
		if (event.checked) {
			this.selectAllFiles(selection, files)
			// this.folder.isFolderSelected = true
		} else {
			this.parentSelection.deselect(...this.folder.selection.selected)
			this.folder.selection.clear()
			this.folder.selection.isSelected(false)
			files.forEach(row => {
				selection.deselect(row);
				this.parentSelection.deselect(row)
			})
		}
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
	getRowClass = (row) => {
		// console.log('this.folder.selection.isSelected(row)', this.folder.selection.isSelected(row))
		return {
			'row-color': this.PreviewedFile && this.PreviewedFile.pre_signed_url === row.pre_signed_url
		};
	}
	clearSelections(folder: FolderModel) {
		if (folder && folder.selection) {
			folder.isFolderSelected = false;
			folder.selection.deselect(...folder.files);
			this.parentSelection.deselect(...folder.files)
		}
		if (folder.child && folder.child.length) {
			folder.child.forEach((folderChild: FolderModel) => {
				this.clearSelections(folderChild);
			})
		} else {
			return
		}
	}
	toggleRows(row) {
		this.folder.selection.toggle(row)
		this.parentSelection.toggle(row);
	}
	checkedAll() {

		if ((this.folder.selection.selected.length > 0 && this.folder.selection.selected.length == this.folder.files.length && this.folder.files.length > 0) || this.folder.isFolderSelected) {
			// this.folder.isFolderSelected = true;
			return true;
		}
		else {
			// this.folder.isFolderSelected = false;
			return false;
		}
	}
	/**
	 * initialize document filder form
	 */
	initializeEditDocModal() {
		this.editForm = this.fb.group({
			id: '',
			fileTitle: ['', [Validators.required]],
			tags: '',
			description: '',
			parentId: '',
			sfolderId: this.fb.array([]),
		});
	}
	/**
	 * open document folder modal
	 */
	editDocModal = (file, content): void => {
		let ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false, windowClass: 'modal_extraDOc doc-modal'
		};
		this.disableBtn = false;
		this.file = file;
		var tags = []
		if (file.tags) {

			tags = file.tags.split(',')
		}
		let sFoldersForm: FormArray = <FormArray>this.editForm.get('sfolderId');
		while (sFoldersForm.length !== 0) {
			sFoldersForm.removeAt(0)
		  }
		this.editForm['controls']['id'].setValue(file.id);
		this.editForm['controls']['fileTitle'].setValue(file.file_title);
		this.editForm['controls']['description'].setValue(file.description);
		this.editForm['controls']['tags'].setValue(tags);
		this.editForm['controls']['parentId'].setValue('');
	
		this.modalRef = this.modalService.open(content, ngbModalOptions);

	}
	processFolders(folderList:FolderModel[],parent_id:number) {
		//this function finds a folder with child's parent_id
		folderList.forEach((folder) =>{

		  if(folder?.id === parent_id){

			this.notMoveAbleFolder = {...folder};
			return;
		  }
		  if (folder && folder.child) {
			this.processFolders(folder.child,parent_id);
		  }
	  });
	}
	onMoveDocument() {

		this.processFolders(this.folders,this.folder?.parent);
		
		//check parent folder has rights to move file either is_editable property exists and is false
		if(this.notMoveAbleFolder?.is_editable === false || this.folder?.is_editable === false){
			this.toasterService.error("This selection includes Visit, Bill, POM, EOR, Denial, Verification, and Payment files cannot be moved.",'Error');
	        return;
		}
		this.disableMoveBtn = true;
		let formValue = this.editForm.getRawValue();
		
		if (formValue.sfolderId || formValue.parentId) {
			let sFolderValue:any[] = formValue.sfolderId;
			let selectedFolderValue ; 
			 sFolderValue.forEach(subfolder => {
				if (subfolder.id) {
				  selectedFolderValue = subfolder.id
				}
			  })
			let folderId;
			(selectedFolderValue) ? folderId = selectedFolderValue : folderId = formValue.parentId;
			let requestData = {};
			requestData['to_folder_id'] = folderId;
			requestData['ids'] = [formValue.id];
			requestData ['socket_id'] = this.socket?.ioSocket?.id;
			this.documentManagerService.moveDocument(requestData).subscribe(res => {
				this.editForm.reset();
				this.modalRef.close();
				this.disableMoveBtn = false;
				this.refreshFolderFiles.emit(true);
				this.toasterService.success('Successfully Updated ', 'Success');
			},error=>{
				this.disableMoveBtn = false;
			})
		}
		else { this.disableMoveBtn = false; }
	}
	onCopyDocument() {
		this.disableCopyBtn = true;
		let formValue = this.editForm.getRawValue();
	
		if (formValue.sfolderId || formValue.parentId) {
			let sFolderValues:any[] = formValue.sfolderId;
			let selectedFolderValue ; 
			sFolderValues.forEach(subfolder => {
				if (subfolder.id) {
				  selectedFolderValue = subfolder.id
				}
			  })
			let folderId;
				
			(formValue.sfolderId) ? folderId = selectedFolderValue : folderId = formValue.parentId;
			let requestData = {};
			requestData['to_folder_id'] = folderId;
			requestData['ids'] = [formValue.id];
			requestData ['socket_id'] = this.socket?.ioSocket?.id;
			this.documentManagerService.copyDocument(requestData).subscribe(res => {
				this.editForm.reset();
				this.modalRef.close();
				this.refreshFolderFiles.emit(true);
				this.toasterService.success('Successfully Updated ', 'Success');
				this.disableCopyBtn = false;
			},err=>{
				this.disableCopyBtn = false;
			})
		}
		else { this.disableCopyBtn = false; }
	}
	/**
	 * submit Document form
	 */
	refreshContent($event){
		this.refreshFolderFiles.emit(true);
			
	}
	onSubmitDocument() {
		let selectedFolderValue; 
		this.socket;
		if (this.editForm.valid) {
			this.disableBtn = true;
			let formValue = this.editForm.getRawValue();
			let sFolderValue:any[] = formValue.sfolderId;
			 sFolderValue.forEach(subfolder => {
				if (subfolder.id) {
				  selectedFolderValue = subfolder.id
				}
			  })
			formValue['sfolderId'] = selectedFolderValue;
			var tagsStr = '';
			if (formValue.tags.length) {
				this.disableBtn = true;
				var i = 0;
				for (let tag of formValue.tags) {
					let comma = i > 0 ? ',' : '';
					if (typeof (tag) == 'object') {
						tagsStr = tagsStr + comma + tag.display;
					} else {
						tagsStr = tagsStr + comma + tag;
					}
					i++;
				}
			}
			this.addnewtag ? tagsStr = tagsStr ? tagsStr + ',' + this.addnewtag : this.addnewtag : '';
			formValue['tags'] = tagsStr;
			formValue ['socket_id'] = this.socket?.ioSocket?.id;
			setTimeout(() => {
				this.subscription.push(
					this.documentManagerService.editDocument(formValue).subscribe((res:any) => {
						;
						if (res.status === true) {
							this.folder_id = res && res.data && res.data.folder_id;
							this.getfilesByfolderId(selectedFolderValue?selectedFolderValue:formValue.parentId);
							 this.documentManagerService.Refresh();
							// this.refreshFolderFiles.emit(true);
	
							this.editForm.reset();
							this.modalRef.close();
							this.reset(true, true, true)
							this.toasterService.success('Successfully Updated ', 'Success');
							let index = this.folder.files.findIndex(folder=>folder.id === formValue.id);
						
							if (index>-1){
							   this.folder.files[index]['file_title'] = res?.data?.file_title;
							   this.folder.files[index]['tags'] = res?.data?.tags;
							   if (res?.data?.tags != '' || !res?.data?.tags ){
								this.folder.files[index]['tags_array'] = res?.data?.tags.split(',');
								}
								else {
									this.folder.files[index]['tags_array'] =[];
								}
							   this.folder.files[index]['description'] = res?.data?.description;
							   this.folder.files[index]['pre_signed_url'] = res?.data?.pre_signed_url;
							    this.documentUpdated.emit(this.folder.files[index]);
							}

						}
						this.disableBtn = false;
					}, err => {
						this.disableBtn = false;
						this.toasterService.error(err.error.error.message, 'Error')
					})
				);
			}, 0);

		} else {
			this.fd_services.touchAllFields(this.editForm);
		}

	}


	/**
	 * set tag form
	 */
	setTagForm() {
		this.addTagForm = this.fb.group({
			id: '',
			tags: [],
		});
	}
	/**
	 * open tag modal
	 */
	addTagModal = (file, content): void => {
		let ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false, windowClass: 'modal_extraDOc doc-modal'
		};
		var tags = []
		if (file.tags) {

			tags = file.tags.split(',')
		}
		this.addTagForm['controls']['id'].setValue(file.id);
		this.addTagForm['controls']['tags'].setValue(tags);
		this.modalRef = this.modalService.open(content, ngbModalOptions);
	}
	addnewtag: any
	onTextChange(event) {
		if (event) {
			let tags = this.addTagForm.get('tags').value
			let match = tags && tags.length > 0 ? tags.find(res => { event == res }) : ''
			!match ? this.addnewtag = event : this.addnewtag = ''
		}
	}
	/**
	 * submit tag form
	 * @param form 
	 */
	onSubmitAddTag(form) {
		if (this.addTagForm.valid) {
			let formValue = this.addTagForm.getRawValue();
			var tagsStr = '';
			this.disableBtn = true;
			if (formValue.tags.length) {
				var i = 0;
				for (let tag of formValue.tags) {
					let comma = i > 0 ? ',' : '';
					if (typeof (tag) == 'object') {
						tagsStr = tagsStr + comma + tag.display;
					} else {
						tagsStr = tagsStr + comma + tag;
					}
					i++;
				}

			}
			this.addnewtag ? tagsStr = tagsStr ? tagsStr + ',' + this.addnewtag : this.addnewtag : '';
			formValue['tags'] = tagsStr;
			formValue ['socket_id'] = this.socket?.ioSocket?.id;
			this.documentManagerService.editDocument(formValue).subscribe(res => {
				if (res.status === true) {
					// this.setVisibility(this.folder, true)
					this.getfilesByfolderId(this.folder.id);
					this.addnewtag = ''
					this.reset(true, true, true);
					this.addTagForm.reset();
					this.modalRef.close();
					this.toasterService.success('Tags Updated Successfully', 'Success');
					let index = this.folder.files.findIndex(folder=>folder.id === formValue.id);
					if (index>-1){
					   this.folder.files[index]['file_title'] = res?.data?.file_title;
					   this.folder.files[index]['tags'] = res?.data?.tags;
					   this.folder.files[index]['description'] = res?.data?.description;
					   this.folder.files[index]['pre_signed_url'] = res?.data?.pre_signed_url;
					   if (res?.data?.tags != '' || !res?.data?.tags ){
						this.folder.files[index]['tags_array'] = res?.data?.tags.split(',');
						}
						else {
							this.folder.files[index]['tags_array'] =[];
						}
						this.documentUpdated.emit(this.folder.files[index]);
					}


				}
				this.disableBtn = false;
			}, err => {
				this.disableBtn = false;
				this.toasterService.error(err.error.error.message, 'Error')
			})

		} else {
			this.disableBtn = false;
			this.fd_services.touchAllFields(this.addTagForm);
		}
	}
	selectedFolder: any
	getChildrenFolders(folder) {
		// this.documentManagerService.getAllChildFoldersByFolderId(folder.id).subscribe(res => {
			folder = folder?.children_recursive;
			this.selectedFolder =folder?.children_recursive;
		// })
	}
	getSubfolders(id) {
		this.subfolders = []
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

	viewDocFile(file: FileModel): void {
		this.viewFile.emit({link: file.link, ext: file.ext, id:file.id ,
			pre_signed_url:file.pre_signed_url});
	}
	reset(clearSelection: boolean, updateDocument: boolean, updateTags: boolean) {

		// (updateDocument) ? this.getUpdatedDocument.emit() : null; //Fetches latest folders from parent
		// (updateTags) ? this.getUpdatedTags.emit() : null;

		if (clearSelection) {
			// this.resetCounters.emit();//To clear all selections from parent
			// Will remain in child
			this.folder.selection.clear(); //To clear the current folders selection
			this.folder.isFolderSelected = false;

			// Fetches latest tags from server. This is useless but for now keeping to avoid ripple effects
			// this.updateAllSelection.emit(this.folder.selection.selected);
		}
	}
	confirmDel(file?: any) {
		let ids = [];
		(file) ? ids.push(file.id) : null;

		ids = (!file) ? this.folder.selection.selected.map(file => file.id) : [...ids];

		let requestData;
		if (this.folder['isFolderSelected']) {
			requestData = { 'folderIds': [this.folder.id] };
		} else {
			requestData = { 'ids': ids };
		}
		// this.deleteFilesOrFilders.emit(requestData);
		// if (this.selectedTags.size) {
		//   var tagStr = ""
		//   tagStr = Array.from(this.selectedTags).join();
		//   requestData['tags'] = tagStr
		// }

		if (ids.length || this.folder['isFolderSelected']) {
			this.customDiallogService.confirm('Delete Confirmation?', 'Do you really want to delete it.','Yes','No')
			.then((confirmed) => {
				if (confirmed){
					requestData ['socket_id'] = this.socket?.ioSocket?.id;
					this.documentManagerService.deleteDocument(requestData).subscribe(res => {
						if (res['status'] == true) {
							this.getfilesByfolderId(this.folder.id);
							this.refreshFolderFiles.emit(true);
							// this.reset(true, true, true);
							this.toasterService.success('Document Deleted Successfully', 'Success');
							// requestData.ids.forEach(fileId=>{
								// let index = this.folder.files.findIndex(folder=>folder.id === fileId);
								// if (index>-1){
								// 	this.folder.files.splice(index,1);
								// }

							// });
							
					
						}
					}, err => {
						// this.toasterService.error(err.error.error.message, 'Error')
					})
				}
			})
			.catch();
		}
	}
	changeDocumentPageSize(folder: FolderModel, event) {
		this.page.size = event;
		// this.page.size = event.target.value;
		this.page.pageNumber = 1
		this.parentSelection.clear();
		this.clearSelections(folder);
		this.getfilesByfolderId(folder.id, this.page.size, this.page.pageNumber, true)
		// this.documentManagerService.getFilesFromFolderId(folder.id, this.page.size, this.page.pageNumber)
	}

}
