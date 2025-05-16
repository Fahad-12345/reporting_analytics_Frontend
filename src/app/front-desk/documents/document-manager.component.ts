import { Component, OnInit,  SimpleChanges, ViewChild, ElementRef, DoCheck, HostListener, TemplateRef } from '@angular/core';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
import { ToastrService } from 'ngx-toastr';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ActivatedRoute} from '@angular/router';
import { AclService } from '@appDir/shared/services/acl.service';
// import { scan } from 'assets/js/scan.js';
import { FolderModel } from './Models/FolderModel.Model';
import { DocumentManagerServiceService } from './services/document-manager-service.service';
import { SelectionModel } from '@angular/cdk/collections';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { StorageData, HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { DocumentUploaderModalComponent } from './components/document-uploader-modal/document-uploader-modal.component';
import { NewFolderModalComponent } from './components/modals/new-folder-modal/new-folder-modal.component';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { ScrollToService, ScrollToConfigOptions } from '@nicky-lenaers/ngx-scroll-to';
import { getObjectChildValue, makeDeepCopyArray } from '@appDir/shared/utils/utils.helpers';
import { SignatureURLEnum } from '@appDir/shared/signature/SignatureURLEnums.enum';
import { MainService } from '@appDir/shared/services/main-service';
import { Socket } from 'ngx-socket-io';
import { DocumentTreeComponent } from './document-tree/document-tree.component';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';

declare var PDFObject: any;

@Component({
	selector: 'app-document-manager',
	templateUrl: './document-manager.component.html',
	styleUrls: ['./document-manager.component.scss'],
	animations: [
		trigger('fadeInOut', [
			state('void', style({
				opacity: 0
			})),
			transition('void <=> *', animate(1000)),
		])
	]
})


export class DocumentManagerComponent extends PermissionComponent implements OnInit, DoCheck {
	public opened = {};
	public previewUrl = ""
	title: "Medcical History"
	public foldersData: Array<FolderModel> = [];
	public folderList: any = [];
	public addFolderForm: FormGroup;
	public searchForm: FormGroup;
	public selectedFiles: any = [];
	modalRef: NgbModalRef;
	caseId: any;
	ext: any;
	tagsList: any = [];
	showTagView: boolean = false;
	subfolders: any = [];
	file: any;
	disableBtn: boolean = false;
	public loadSpin: boolean = false;
	@ViewChild('printFile') printFile: ElementRef;
	@ViewChild('newFolder') newFolder: TemplateRef<any>;
	@ViewChild('DocumentTreeComponent') documentTreeComponent: DocumentTreeComponent;
	selectedTags = new Set();
	pdfSourceLink: any = 'xyz';
	imageSourceLink: any = null;
	patientId: number;
	path: any;
	caseData: any;
	showFile: boolean = true;
	finalCount: number = 0;
	parentSelection = new SelectionModel<any>(true, []);
	kioskPin: string;
	selectedFoldersId: any = []
	folderIdToPasss: any = []
	folderTittle: any[]
	selectedFolders: FolderModel[] = [];
	showRefreshButton : boolean =false;
	isFilterContent: any; 
	selectedDocumentIds: any = [];
	foldersSequence: any = [];

	constructor(
		aclService: AclService,
		private route: ActivatedRoute,
		private spinner: NgxSpinnerService,
		private modalService: NgbModal,
		private fd_services: FDServices,
		private socket:Socket,
		private fb: FormBuilder,
		private logger: Logger,
		private toasterService: ToastrService,
		private documentManagerService: DocumentManagerServiceService,
		private storageData: StorageData,
		protected requestService: RequestService,
		private caseFlowService: CaseFlowServiceService,
		private mainService: MainService,
		private scrollToService: ScrollToService) {
		super(aclService);
		this.route.snapshot.pathFromRoot.forEach(path => {
			(!this.caseId) ? (this.caseId = getObjectChildValue(path, null, ["params", "caseId"])) : null;
		})
		this.fd_services.createFolderOb.subscribe((content: any) => {
			this.creatFolderModal(content.parentId);
		});
		this.getCase()
		this.addFolderForm = this.fb.group({
			folder: ['', [Validators.required]],
			parentId: ''

		});
		this.searchForm = this.fb.group({
			searchField: ''
		});
		let data = { case_id: Number(this.caseId) };
		let socketInfo= this.socket.emit('DOCUMENTMANAGERROOM', data);
		// this.socket.con
		this.caseFlowService.documentSocketId;		
		this.socket.on('CHANGEINDOCUMENTS', (message) => {
			if (!this.removeSocketEvent){
				this.showRefreshButton=true;			
			}
									
		});
	}
	clearSelection() {
		this.selectedFiles = []
		this.selectedFoldersId = []
		this.parentSelection.clear();
		for (let folder of this.folderList) {
			this.clearSelections(folder);
		}
	}
	

	refreshFoldersFiles($event){
		this.getAllFolderList(null,true);
		if (this.documentTreeComponent && this.documentTreeComponent.selectedFolders.length!=0){
			this.documentTreeComponent.selectedFolders.forEach((value,index)=>{
			     this.findAndReplaceFiles(this.foldersData,value.id,index);
			});
		}
	}

	searchResultReset(){
	// this.folderList = []
	this.unselectAllDocumentTree = false;
	this.getAllFolderList();
	this.selectedTags.clear()
	this.clearSelection();
	this.updateCount();


	}
	removeSocketEvent :boolean = false;
	ngOnInit() {
		// this.folderTittle = this.folderTittleArray.map(x => x).join(">")
		this.getAllFolderList(null,true);
		this.selectedDocumentIds = [];
		this.route.snapshot.pathFromRoot.forEach(path => {
			if (path && path.params && path.params.caseId) {
				if (!this.caseId) {
					this.caseId = path.params.caseId;
				}
			}
		})
		// this.getUpdatedDocument();
		this.subscription.push(this.documentManagerService.onFoldersUpdate.subscribe((res?) => {
			res;
			// this.getAllFolderList(null,true);
		}));

		this.subscription.push(this.documentManagerService.onFileUpload.subscribe((res?) => {
			res;
			if (res ==='uploadFileFolder'){

				this.getAllFolderList();
			}
		}));

		this.subscription.push(
			this.documentManagerService.successfullyMerged.subscribe((isSuccessful: boolean) => {
				if (isSuccessful){
					this.folderIdToPasss = [];
					this.selectedDocumentIds = [];
				}
			})
		);
	

		// this.getAllTagsList();

		window.onscroll = function () {
		}

	}

	isSticky: boolean = false;

	@HostListener('window:scroll', ['$scrollevent'])
	checkScroll() {
		this.isSticky = window.pageYOffset >= 150;
	}

	is_Sticky() {
		return window.pageYOffset >= 150;
	}

	refreshNow(editFun?){
	this.showRefreshButton=false;
	// this.selectedFolder=[];
	this.documentTreeComponent.selectedFolders.forEach((value,index)=>{
		this.findAndReplaceFiles(this.foldersData,value.id,index);
   });
	this.getAllFolderList(null,editFun);
	}


	addnewtag: any
	onRemoving($event){
	}
	removeElementRefesh(item,$event){
	}
	onTextChange(event) {
		if (event) {
			let tags = this.searchForm.get('tags').value
			let match = tags && tags.length > 0 ? tags.find(res => { event == res }) : ''
			!match ? this.addnewtag = event : this.addnewtag = ''
		}
		else
			this.addnewtag = ''
	}

	ngDoCheck() {
		this.updateCount();
	}

	getCase() {
		this.caseFlowService.getPersonalInformation(this.caseId).subscribe((res: HttpSuccessResponse) => {
			this.fd_services.setCase(res.result.data.case)
			this.caseData = res.result.data.case;
			this.patientId = res.result.data.patient_id;
			// }
		})
		//,
		//  err => {
		//   this.toastrService.error(err.message, 'Error')
		// })
	}

	creatFolderModal = (parentId?): void => {
		let ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false, windowClass: 'modal_extraDOc create-folder-size doc-modal'
		};
		this.modalRef = this.modalService.open(NewFolderModalComponent, ngbModalOptions);
		this.modalRef.componentInstance.caseId = this.caseId;
		this.modalRef.componentInstance.patientId = this.patientId;
		this.modalRef.componentInstance.lstFolder = this.folderDetailDataForSearched;
		this.modalRef.componentInstance.folder = this.folderList.find((folder: FolderModel) => folder.id == parentId);
		this.modalRef.componentInstance.refreshModelFolders.subscribe((value) => {
			this.getAllFolderList();
		});
	};
	selectedFolder: FolderModel
	getChildrenFolders(id, folder?) {
		this.documentManagerService.getFilesFromFolderId(id, 1, 10, this.selectedTags).subscribe(res => {
			folder = res['data']
			this.selectedFolder = res['data']
		})
	}
	getSubfolder(id) {
		this.documentManagerService.getFilesFromFolderId(id).subscribe(data => {
			if (data['data']['child']) {
				this.subfolders = data['data']['child']
			}
		})
	}
	onSubmitAddFolder(addFolderForm) {
		let id = null;
		if (addFolderForm.parentId) {
			id = addFolderForm.parentId;
		}
		let folderId = addFolderForm.parentId ? addFolderForm.parentId : '';
		let requestData = {
			'module': 'patientCases',
			'caseId': this.caseId,
			'patientId': this.patientId,
			'folder': addFolderForm.folder,
		};
		requestData['parent'] = folderId;
		this.disableBtn = true;
		this.fd_services.addDirector(requestData).subscribe(res => {
			if (res.status == true) {

				this.documentManagerService.resetNewFolder();
				this.getAllFolderList(addFolderForm.parentId);
				this.getUpdatedDocument();
				if (id) {
					this.documentManagerService.getFilesFromFolderId(id, 1, 10, this.selectedTags).subscribe(data => {
						this.selectedFolder = data['data'];
					});
				}

				this.addFolderForm.reset();
				if (this.modalRef) {
					this.modalRef.close();
				}

				this.disableBtn = false;

				this.toasterService.success('Successfully added', 'Success');
				this.addFolderForm.controls['parentId'].enable();
			} else {
				if (res.errors[0]) {
					this.toasterService.error(res.errors[0], 'Error');
				}
			}
		}, (err: any) => {
			this.toasterService.error(getObjectChildValue(err, '', ['error', 'errors']), 'Error');
			this.disableBtn = false;
			this.addFolderForm.controls['parentId'].enable();
		});

	}

	clickTagSearch(tag) {
		this.selectedTags.has(tag) ? this.selectedTags.delete(tag) : this.selectedTags.add(tag);
		this.searchForm.patchValue({ 'searchField': Array.from(this.selectedTags).join() });
		let formData = this.searchForm.getRawValue();
		this.onSubmitSeachForm(formData);
	}
	unselectAllDocumentTree: boolean = false;
	
	searchRecursive(folder,tagsToSearch?) {
		
		tagsToSearch? tagsToSearch = tagsToSearch.map(tag => tag.toLowerCase()):null;
		let folderFilesCount = 0;
		if (folder.files && folder.files.length > 0) {
		  const matchingFiles = folder.files.filter(file => {
			if (file.tags_array && file.tags_array.length > 0) {
			  const lowerCaseTags = file.tags_array.map(tag => tag.toLowerCase());
			  const foundTags = lowerCaseTags.filter(tag => tagsToSearch.includes(tag.toLowerCase()));
			  return foundTags.length > 0;
			}
			return false;
		  });
	
		   folder.files = matchingFiles;
		  folderFilesCount += matchingFiles.length;
		}
	
		if (folder.children_recursive && folder.children_recursive.length > 0) {
		  const filteredChildFolders = folder.children_recursive.filter(child => {
			const childFilesCount = this.searchRecursive(child,tagsToSearch);
			folderFilesCount += childFilesCount;
			return childFilesCount > 0;
		  });
	
		  folder.children_recursive = filteredChildFolders;
		}
	
		folder.total_files_count = folderFilesCount;
	
		return folderFilesCount;
	  }

	  searchTags(folders, tagsToSearch) {
		const lowerCaseTagsToSearch = tagsToSearch.map(tag => tag.toLowerCase());
		const filteredFolders = folders.filter(folder => {
		  const folderFilesCount = this.searchRecursive(folder,tagsToSearch);
		  return folderFilesCount > 0 || folder.files.length > 0;
		});
		return filteredFolders;
	  }

	  documentUpdate($event){
		this.refreshNow(true);

	  }
	  refreshContent($event){
		this.refreshNow();
	  }

	onSubmitSeachForm(searchForm,clicked?) {
		this.unselectAllDocumentTree = true;
		this.isFilterContent=searchForm;
		this.selectedFolders=[];
		if (searchForm.searchField != '' && searchForm.searchField != null) {
			if (!clicked){
			return false;
			}
			
			this.loadSpin = true;
			let tags = [];
			this.isFilterContent.searchField.forEach(val => tags.push(val.display))
			this.selectedTags.clear();
			this.isFilterContent.searchField.forEach(val => this.selectedTags.add(val.display))
			this.clearSelection();
			let files:any[]=[] = this.searchTags(JSON.parse(JSON.stringify(this.folderDetailDataForSearched)), tags);
			this.updateCount();
			this.foldersData && this.foldersData.length ? this.foldersData.filter(m => m['toggle'] = false) : '';
			files.forEach(file=>{
				file['selectedchild']=[];
			});
			this.folderList = [...files];
			this.foldersData=[...files];
			 let defaultFiles =JSON.parse(JSON.stringify([...this.folderDetailDataForSearched]));
			if (files && files.length==0){
				// this.toasterService.error("No Files Found", 'Error');
				defaultFiles.forEach(file=>{
				file['children_recursive']=[];
				file['total_files_count']=0;
				file['files_count']=0;
				file['files']=[];
				file['has_child']=0;
				file['toggle']=false;
			 });
			 this.folderList = [...defaultFiles];	
			 if (this.documentTreeComponent){
				this.documentTreeComponent.selectedFolders=[];
			 }
		
			}
		}
		else {			
			this.foldersData= this.folderDetailDataForSearched;
			this.foldersData && this.foldersData.length ? this.foldersData.filter(m => m['toggle'] = false) : '';
			this.foldersData= [...this.foldersData];
			this.folderList=[...this.foldersData];
			this.updateCount();
			this.clearSelection();
			//this.treeSelectionChange([]);
		}
		if (this.documentTreeComponent){
			// this.documentTreeComponent.treeControl.expandAll();
			// this.documentTreeComponent.dataSource._treeControl.expandAll();
			// console.log(this.documentTreeComponent.dataSource._treeControl.getLevel(this.documentTreeComponent.dataSource._treeControl.dataNodes[0]));
		if (this.documentTreeComponent && this.documentTreeComponent.selectedFolders.length!=0){
			this.documentTreeComponent.selectedFolders.forEach((value,index)=>{
				if (!this.findAndReplaceFiles(this.foldersData,value.id,index)){
					this.documentTreeComponent.selectedFolders.splice(index,1);			
				}
			
		   });
		}

		}

		if (this.foldersData.length!=0){
			let  selectedChild = this.foldersData[0]['selectedchild'];
			if (this.documentTreeComponent && this.documentTreeComponent.selectedFolders && this.documentTreeComponent.selectedFolders.length!=0){
			this.foldersData[0]['selectedchild'] =  selectedChild.filter(item =>
				this.documentTreeComponent?.selectedFolders.some(selection => selection.id === item.id)
			  );
			}
		}
	}

	
	findAndReplaceFiles(folders:FolderModel[], id,index){
		for (let item of folders){
			if (item.id == id){
				this.documentTreeComponent.selectedFolders[index].files = item.files;

				return true;
			}
			if (item.children_recursive && item.children_recursive.length > 0) {
				if (this.findAndReplaceFiles(item.children_recursive, id,index)) {
					return true;
				}
			}
		}
		return false;
	}
	showMoreTags(showTagView) {
		this.showTagView = !showTagView;
	}
	showFilePreview(showFile) {
		this.showFile = showFile;
		if (this.showFile) {
			if (this.ext == "pdf" || this.ext == "PDF") {
				this.showMedia(this.file)
			}
		}
	}

	getUpdatedDocument(): any {

		this.loadSpin = true;
		let data = {
			"objectId": this.caseId,
			"objectType": "patientCases"
		}

		this.spinner.show();
		this.documentManagerService.getAllFoldersV1(this.caseId, ["patientCases", "erx"]).subscribe((res: any) => {
			this.loadSpin = false;
			if (res.status == true) {
				this.selectedTags = new Set();
				this.searchForm.reset();
				if (!res.data) { return; }
				let oldData = this.foldersData;
				this.foldersData = res.data;
				this.foldersData = [...this.foldersData];
				this.folderList = this.foldersData
				if (oldData) {
					for (let i = 0; i < this.foldersData.length; i++) {

						if (oldData[i] != undefined && oldData[i]['show'] == true) {
							this.foldersData[i]['show'] = true;
						}
						if (this.foldersData[i].child) {
							if (this.foldersData[i].child.length) {
								for (let j = 0; j < this.foldersData[i].child.length; j++) {
									if (oldData[i] != undefined && oldData[i].child[j] != undefined && oldData[i].child[j]['show'] == true) {
										this.foldersData[i].child[j]['show'] = true;
									}
								}
							}
						}

					}
				}

			}
		}, err => {
			this.loadSpin = false;
			this.toasterService.error(err.message, 'Error')
		});

	}

	folderDetailDataForSearched : any; 
	onRemoveTag($event){
		let allTagValue:any[]=this.searchForm?.value?.searchField;
		let index = allTagValue?.findIndex(item => item.value === $event.value);
        if (index !== -1) {
            allTagValue.splice(index, 1);
         }
		this.onSubmitSeachForm({searchField:allTagValue},true);
	}
	getAllFolderList(parentId?,editFunc?) {
		this.loadSpin = true;
		this.showRefreshButton=false;
		this.documentManagerService.getAllFoldersV1(this.caseId, ["patientCases", "erx"]).subscribe(res => {

			this.loadSpin = false;
			if (res['data']) {
				this.folderList = [...res['data']];
				this.folderDetailDataForSearched= res['data'];
				if (this.isFilterContent){
					this.onSubmitSeachForm({searchField:this.isFilterContent?.searchField},editFunc?true:false);
				}
				else {
				this.onSubmitSeachForm({searchField:this.searchForm.value.searchField},editFunc?true:false);
				}
					this.documentTreeComponent?.selectedFolders?.forEach((value,index)=>{
					this.findAndReplaceFiles(this.folderList,value.id,index);
			   });
				// if (this.documentTreeComponent){
				// 	this.documentTreeComponent.selectedFolders=[];
				// }
				// this.foldersData = this.folderList
				this.selectedFiles = []

				// this.folderList = res['data'];
				// // this.foldersData = this.folderList
				// this.selectedFiles = []
				// this.selectedFoldersId = []
				// this.clearSelection();
				// this.updateCount()
				// if (parentId) {
				// 	this.getSubfolder(parentId);
				// }
			} else {
				// this.foldersData = []
				// this.folderList = []
			}
		}, err => {
			this.loadSpin = false;
			// this.toasterService.error(err.message, 'Error')
		})
	}
	
	showMedia($event: { link: string,pre_signed_url:string, ext: string ,id:any}) {
		this.ext = $event.ext
		if (this.ext == "pdf" || this.ext == "PDF") {
			this.imageSourceLink = null;
			this.pdfSourceLink = $event.pre_signed_url
			// `${$event.link}&&authorization=Bearer ${this.storageData.getToken()}`;
			this.file = $event.pre_signed_url;
			PDFObject.embed(this.pdfSourceLink, "#pdf");
			this.previewUrl = $event.pre_signed_url
		}
		else {
			this.pdfSourceLink = null;
			this.mainService.openDocSingature(SignatureURLEnum.tempSingturUrlPreDefined,$event.id).subscribe(res=>{
				if (res && res.data ){
					let link = res?.data[0]?.pre_signed_url;
					// window.open(link, '_blank');
					this.imageSourceLink = `${res?.data[0]?.pre_signed_url}`;
					this.previewUrl = `${res?.data[0]?.pre_signed_url}`
				}
		});
		}


		this.triggerScrollTo('preview-tab')

	}

	public triggerScrollTo(target) {
		const config: ScrollToConfigOptions = {
			container: 'ngx-scroll-to',
			target: target,
			duration: 1000,
			easing: 'easeOutElastic',
			offset: 0
		};
		this.scrollToService.scrollTo(config);
		// setTimeout(() => {
		//   this.scrollToService.scrollTo(config);
		// }, 100);
	}

	selectedFilesList: any[]
	updateCount() {
		this.selectedFiles = [];
		this.selectedFoldersId = []
		this.finalCount = 0;
		// this.fileCount = this.parentSelection.selected.length;
		for (let folder of this.foldersData) {
			if (folder.isFolderSelected) {
				this.finalCount += folder['total_files_count'] || 0;
				this.selectedFoldersId.push(folder.id);
			}
			if (folder && !folder.isFolderSelected && folder.child) {
				let allfolder = folder['selectedchild'] ? folder['selectedchild'] : folder['child']
				for (let subFolder of allfolder) {
					subFolder ? (this.finalCount += subFolder.isFolderSelected ? subFolder['files_count'] || 0 : 0) : ''
				}
			}
		}
		this.finalCount += this.parentSelection.selected.length;
		this.selectedFiles = this.parentSelection.selected.map(childFiles => childFiles.id);
		this.selectedFilesList = this.parentSelection.selected.map(childFiles => childFiles);
		this.updateSelectedFolders();
	}
	  
	updateSelectedFolders() {
		const folderIds = new Set<number>();
		this.selectedFilesList.forEach((file) => {
		  if (!folderIds.has(file?.folder_id)) {
			folderIds.add(file?.folder_id);
		  }
		});
		this.foldersSequence = Array.from(folderIds);
	}
	clearSelections(folder: FolderModel) {
		if (folder && folder.selection) {
			folder.selection.clear();
		}
		if (folder.child && folder.child.length) {
			folder.child.forEach((folderChild: FolderModel) => {
				this.clearSelections(folderChild);
			})
		} else {
			return
		}
	}
	scan() {
		// scan();
	}
	testRegex(text) {
		let regex: RegExp = new RegExp(/^[.&a-zA-Z0-9-_ ]+$/)
		var bool = regex.test(text)
		return bool
	}

	getFilesFromFolderId(data, pageSize, pageNumber, shouldShowAfterLoad?) {
		this.documentManagerService.getFilesFromFolderId(data.id, pageSize, pageNumber, this.selectedTags).subscribe(res => {
			data['files'] = res['data']['files']
			data['child'] = res['data']['child']
			data['show'] = shouldShowAfterLoad
			if (res['data']['files_count']) {
				data['files_count'] = res['data']['files_count']
			} else {
				if (res['data']['files'])
					data['files_count'] = res['data']['files'].length
			}
			if (res['data']['total_files_count']) {
				data['total_files_count'] = res['data']['total_files_count']
			} else {
				data['total_files_count'] = res['data']['total']
			}
			
			let toggleindex: number
			this.foldersData.filter(function (item, index) {
				if (item.id == data.parent) {
					toggleindex = index
				}
			})
			this.toggle(toggleindex)
		})
	}
	ngOnChanges(simpleChanges: SimpleChanges) {
	}
	updateAllSelection(event, folder) {
		let parentIndex = this.foldersData.findIndex(x => x.id == folder?.tree_path && folder?.tree_path[0].id || x.id == folder.parent);
		if (parentIndex >= 0) {
			let childIndex = this.foldersData[parentIndex]['selectedchild'].findIndex(x => x.id == folder.id);
			if (childIndex >= 0) {
				this.foldersData[parentIndex]['selectedchild'][childIndex]['isFolderSelected'] = event ? folder.isFolderSelected : false;
				this.updateCount();
			}
		}
		// this.selectedFoldersId.push(folder.id)
		// event ? this.folderIdToPasss.push(folder.id) : this.folderIdToPasss = this.folderIdToPasss.filter(m => m.id == folder.id)
		let data = this.foldersData;
		// Remove elements from folderIdsToPasss array if not present in any selectedchild array
		this.folderIdToPasss = this.folderIdToPasss.filter(id => {
			return data.some(folderData => {
			return folderData['selectedchild'].some(child => child.id === id);
			});
		});
		const index = this.selectedDocumentIds.indexOf(folder?.id);
		if (event) {
			this.folderIdToPasss.push(folder?.id);		
			if (!this.selectedDocumentIds.includes(folder?.id)){
				this.selectedDocumentIds.push(folder?.id); // Add the document ID if it's not already selected		
			}
		} else {
			this.folderIdToPasss = this.folderIdToPasss.filter(m => m !== folder?.id);
			if (index !== -1) {
				this.selectedDocumentIds.splice(index, 1);
			}
		}		
	}
	treeSelectionChange(selectedFolders) {
		this.selectedFolders = makeDeepCopyArray(selectedFolders.selectedFolders);
		let ids = this.selectedFolders.map(m => m['tree_path'] && m['tree_path'][0].id ? m['tree_path'][0].id : m.id)
		if (!selectedFolders.deselectedNode) {
			this.foldersData = this.folderList.map((folder: FolderModel) => { folder.files ? folder.files : folder.files = []; return folder }).filter((item) => ids.includes(item.id))
			this.ShowFolder(this.selectedFolders)
		}
		else {
			this.removeRecord(selectedFolders.deselectedNode)
		}
	}

	removeItem: FolderModel;
	/**
	 * remove record
	 * @param removed 
	 */
	removeRecord(removed) {
		this.removeItem = removed
		let toggleindex: number
		let folder;
		let self = this
		let calltoggle
		let parentId = removed.tree_path ? removed.tree_path[0].id : null
		!parentId ? parentId = removed.parent : ''
		removed.tree_path ? removed.tree_path = removed.tree_path.filter(m => m.id != removed.id) : ''
		this.updateAllSelection(false, removed)
		this.foldersData.filter(function (item, index) {

			if (parentId == null && item.folder_name == removed.folder_name) {
				toggleindex = index
				item['rootlevel'] = false
				item['selectedchild'] && item['selectedchild'].length > 0 ? calltoggle = false : calltoggle = true
				folder = item
			}
			if (item.id == parentId) {
				toggleindex = index
				item['selectedchild'] = item['selectedchild'].filter(m => m.id != removed.id)
				item['selectedchild'].length > 0 ? calltoggle = false : calltoggle = true
				item['rootlevel'] && item['rootlevel'] == true ? calltoggle = false : ''
				folder = item
			}
			item['selectedchild'] && item['selectedchild'].length < 1 && item.files.length < 1 && self.selectedFolders.length ? self.selectedFolders = self.selectedFolders.filter(m => m['tree_path'] ? m['tree_path'][0].id != parentId : []) : ''

		})
		let ids = this.selectedFolders.map(m => m['tree_path'] && m['tree_path'][0].id ? m['tree_path'][0].id : m.id)
		this.foldersData = this.folderList.filter((item) => ids.includes(item.id))
		calltoggle ? this.toggle(toggleindex, folder) : ''
		this.documentManagerService.folderIds = this.selectedFolders.map(m => m.id)
		// this.parentSelection.clear();

		this.selectedFolders = makeDeepCopyArray(this.selectedFolders)
	}
	/**
	 * show folder 
	 * @param selectedFolders 
	 */
	showPrentFiles: boolean
	rootlevelIndex: any
	ShowFolder(selectedFolders) {
		let toggleindex: number
		let folder;
		let parentId
		let self = this;
		selectedFolders.forEach(element => {
			parentId = element.tree_path ? element.tree_path[0].id : null
			!parentId ? parentId = element.parent : ''
			this.foldersData.filter(function (item, index) {
				if (parentId == null && item.folder_name == element.folder_name) {
					self.rootlevelIndex = index
					self.showPrentFiles = true
					item['rootlevel'] = true
					item['toggle'] = true
					toggleindex = index
					folder = item
				}
				if (item.id == parentId) {
					self.showPrentFiles = false
					toggleindex = index
					!item['selectedchild'] ? item['selectedchild'] = [] : ''
					let isInclude = item['selectedchild'].length > 0 ? item['selectedchild'].filter(m => m.id == element.id) : []
					isInclude.length < 1 ? item['selectedchild'].push(element) : ''
					item['toggle'] = true
					folder = item
				}
			})
			this.updateAllSelection(false, folder)
			!this.opened[toggleindex] ? this.toggle(toggleindex, folder) : ''
		});
		this.documentManagerService.folderIds = selectedFolders.map(m => m.id)
	}

	/**
	 * expend folder
	 * @param index 
	 * @param folder 
	 */
	toggle(index?, folder?): void {
		if (this.isOpenedUndefined(index)) {
			this.opened[index] = false;
		}
		this.opened[index] = !this.opened[index];
		if (this.opened[index]) {
			folder['toggle'] = true
		}
		else {
			folder['toggle'] = false
		}
		if (this.parentSelection && this.parentSelection.hasValue()){
		this.parentSelection.deselect(...folder);
		}
	}

	/**
	 * change toggle icon
	 * @param index 
	 */
	icon(index): string {
		if (this.isOpenedUndefined(index)) {
			return 'plus';
		}
		return this.opened[index] ? 'minus' : 'plus';
	}
	/**
	 * folder has index
	 * @param index 
	 */
	isOpenedUndefined(index): boolean {
		return this.opened[index] === undefined;
	}

	onFileChange(event) {
		if (event.target.files) {

			const files = event.target.files
			if (!this.areFilesValid(files)) {
				this.toasterService.error(`Only files with extension JPG, JPEG, PNG or PDF are allowed.`);
				return
			}

			 let modalRef = this.modalService.open(DocumentUploaderModalComponent)
			modalRef.componentInstance.caseId = this.caseId
			modalRef.componentInstance.files = event.target.files;
			modalRef.componentInstance['lstFolder'] = this.folderDetailDataForSearched;
			modalRef.componentInstance.patientId = this.patientId;
			
			modalRef.result.then(_ => { event.target.value = '' })
		}
	}

	areFilesValid(files) {
		for (const file of files) {
			let ext = file.type.split('/');
			switch (ext[1] ? ext[1].toLocaleLowerCase() : '') {
				case 'jpg':
				case 'jpeg':
				case 'png':
				case 'pdf':


					break;
				default:

					// this.activeModal.close()
					return false;
			}

		}
		return true
	}

	showFolders: boolean = true;
	sideNavClosed: boolean = false;
	width: string = '350px'
	onClose() {
		this.loadSpin = true
		this.showFolders = false;
		this.sideNavClosed = !this.sideNavClosed
		setTimeout(_ => { this.showFolders = true; this.loadSpin = false; this.sideNavClosed ? this.width = '0px' : '350px' }, 0)


	}

	ngOnDestroy(): void {
		this.documentManagerService.onFileUpload.next('uploadFile');
		unSubAllPrevious(this.subscription);
		let data = { case_id: Number(this.caseId) };
		this.socket.emit('REMOVEFROMDOCUMENTMAGERCHANGESROOM', data);;
	}
}


