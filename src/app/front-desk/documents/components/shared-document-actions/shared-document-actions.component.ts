import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { ToastrService } from 'ngx-toastr';
import { StorageData, HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { DocumentManagerServiceService } from '../../services/document-manager-service.service';
import { SelectionModel } from '@angular/cdk/collections';
import { BehaviorSubject, Subscription } from 'rxjs';
import { FolderModel } from '../../Models/FolderModel.Model';
import { Config } from '@appDir/config/config';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { FileModel } from '../../Models/FilesModel.Model';
import { documentManagerUrlsEnum } from '../../document-manager-Urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { KioskModalComponent } from '@appDir/front-desk/masters/template-master/components/kiosk-modal/kiosk-modal.component';
import { RequestService } from '@appDir/shared/services/request.service';
import { MergeModalComponent } from '../modals/merge-modal/merge-modal.component';
import { ActivatedRoute } from '@angular/router';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { MoveFileModalComponent } from '../modals/move-file-modal/move-file-modal.component';
import { getObjectChildValue } from '@appDir/shared/utils/utils.helpers';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { Socket } from 'ngx-socket-io';
var printJs = require("print-js");
@Component({
	selector: 'app-shared-document-actions',
	templateUrl: './shared-document-actions.component.html',
	styleUrls: ['./shared-document-actions.component.scss'],

})
export class SharedDocumentActionsComponent extends PermissionComponent implements OnInit {
	@Input() folder: FolderModel;
	@Input() folders: FolderModel;
	@Input() folderList: any[];
	@Input() finalCount: any[];
	@Input() foldersData: any[];
	@Input() selectedFoldersId: any[];
	@Input() selectedFiles: any;
	@Input() selectedFilesList: any;
	@Input() caseId: any;
	@Input() selectedDocumentIds: any[];
	@Input() foldersSequence: any[];
	@Output() refreshContent = new EventEmitter();
	emailForm: FormGroup;
	mergeForm: FormGroup;
	addTagForm: FormGroup;
	copyFileForm: FormGroup;
	moveFileForm: FormGroup;
	file: any;
	modalRef: NgbModalRef;
	disableBtn: boolean = false;
	selection = new SelectionModel<any>(true, []);
	subscription: Subscription[] = [];
	userEmail: string;
	public subfolders: any = [];
	ids: any = [];
	public url = '';
	@Output() setFolderId = new EventEmitter()
	@Output() viewFile = new EventEmitter<{ link: string, ext: string }>();
	matchedIdsArray:any = [];
  notMoveAble = [];
  files_selected = [];
	constructor(private modalService: NgbModal,
		private fb: FormBuilder,
		private config: Config,
		private fd_services: FDServices,
		private toasterService: ToastrService,
		private customDiallogService : CustomDiallogService,
		private storageData: StorageData,
		aclService: AclService,
		protected requestService: RequestService,
		private socket: Socket,
		// private logger: Logger,
		private route: ActivatedRoute,
		private documentManagerService: DocumentManagerServiceService,
		private caseflowService: CaseFlowServiceService) { super(aclService, null, null, requestService); }

	ngOnInit() {
		this.route.snapshot.pathFromRoot.forEach(path => {
			(!this.caseId) ? (this.caseId = getObjectChildValue(path, null, ["params", "caseId"])) : null;
		})
		// this.caseId = this.caseflowService.getCaseIdFromRoute()
		this.initializeEmailForm()
		this.setUserEmailInEmailModal()
		this.setMergeForm();
		this.InitializecopyFileForm()
		this.initializemoveFileForm()
	}

	getCount(folder) {
		if (folder && folder.files && (folder.files_count === 0 || folder.files_count < folder.files.length)) {
			const filesCount = folder?.files?.length;
			folder.files_count = filesCount;
			folder.total_files_count = filesCount;
		}
		return folder?.isFolderSelected ? folder?.files_count ? folder?.files_count : folder?.total_files_count : folder?.selection?.selected?.length;
	}
	/**
	 * initialise Email Form
	 */
	initializeEmailForm() {
		this.emailForm = this.fb.group({
			fileIds: '',
			to: ['', [Validators.required, Validators.email]],
			message: ['', [Validators.required, Validators.minLength(10)]],
		});
	}
	/**
	 * get user email address
	 */
	setUserEmailInEmailModal() {
		this.userEmail = this.storageData.getEmail();
	}

	/**
	 * Open Email Modal
	 */
	openEmailModal = (content): void => {
		this.emailForm.reset();
		if ((this.folder && this.folder.selection.selected.length > 0 || this.folder && this.folder['isFolderSelected'] || (this.selectedFiles || this.selectedFoldersId))) {
			let ngbModalOptions: NgbModalOptions = {
				backdrop: 'static',
				keyboard: false, windowClass: 'modal_extraDOc doc-modal'
			};
			this.modalRef = this.modalService.open(content, ngbModalOptions);
		}
	}
	/**
	 * submit email form
	 * @param emailForm
	 */
	onSubmitEmailForm(emailForm) {
		if (this.emailForm.valid) {
			this.disableBtn = true;
			let ids = [];
			let files
			let requestData = {
				// 'fileIds': ids,
				'to': emailForm.to,
				'message': emailForm.message
			};
			if (this.folder && this.folder.selection.selected) {
				files = this.folder.selection.selected;
				for (let file of files) {
					ids.push(file.id)
				}
			}
			if (this.selectedFiles && this.selectedFiles.length && this.selectedFiles.length > 0) {
				ids = this.selectedFiles;
			}
			if (this.selectedFoldersId && this.selectedFoldersId.length > 0) {
				requestData['folderIds'] = this.selectedFoldersId
			}
			var count = 0
			if (ids.length > 0) {
				requestData['fileIds'] = ids
				count = count + ids.length
			}
			if (this.folder && this.folder['isFolderSelected']) {
				count = count + this.folder['total_files_count']
				requestData['folderIds'] = [this.folder.id]
			}
			// if (count > 20) {
			// 	// this.toasterService.error("Max file count limit is 20. Please select again")
			// 	return;
			// }
			this.documentManagerService.emailDocument(requestData).subscribe(res => {
				if (res) {
					// this.getfilesByfolderId(this.folder.id)
					this.folder ? this.setFolderId.emit(this.folder.id) : ''
					this.parentSelection ? this.parentSelection.clear() : ''
					this.emailForm.reset();
					this.modalRef.close();
					this.toasterService.success('Document Emailed Successfully', 'Success');

				}
				this.disableBtn = false;
			}, err => {
				this.disableBtn = false;
				this.toasterService.error(err.message, 'Error')
			})
		} else {
			this.disableBtn = false;
			this.toasterService.error("Please select files first!", 'Error')
		}

	}
	/**
	 * set merger form
	 */
	setMergeForm() {
		this.mergeForm = this.fb.group({
			fileIds: '',
			parentId: ['', [Validators.required]],
			sfolderId: '',
			fileName: ['', [Validators.required]]
		});
	}
	/**
	 * open merge modal
	 */
	openMergeModal = (content, files): void => {
		if ((this.selectedFoldersId && this.selectedFoldersId.length > 0) || (this.folder && (this.folder.selection.selected.length > 0 || this.folder['isFolderSelected'])) || this.selectedFiles.length > 0) {
			let ngbModalOptions: NgbModalOptions = {
				backdrop: 'static',
				keyboard: false, windowClass: 'modal_extraDOc doc-modal'
			};
			this.mergeForm.reset()
			this.disableBtn = false
			// Preserve Selected Files
			this.GolobalFileIds = this.getSeletedFiles();
			this.modalRef = this.modalService.open(MergeModalComponent, ngbModalOptions);
			this.modalRef.componentInstance.lstFolder = this.folders;
			this.modalRef.componentInstance.selectedFiles = files;
			this.modalRef.componentInstance.caseId = this.caseId;
			this.modalRef.componentInstance.patientId = this.caseflowService.case.patient_id
			// Merge Documnets API call with Jobs
			this.modalRef.componentInstance.onsubmit = (form) => { this.onSubmitMoveAndMergeForm(form) }
			// Merge Documents API call without Jobs
			// this.modalRef.componentInstance.onsubmit = (form) => { this.onSubmitMergeForm(form) }
		}
	}

	GolobalFileIds : any[] = [];

	getSeletedFiles() : any[]{
		let ids = [];
		if (this.folder) {
			let files = this.folder ? this.folder.selection.selected : ''
			for (let file of files) {
				ids.push(file.id)
			}
		}

		else {
			ids = this.selectedFiles;
		}

		return ids;
	}

	/**
	 * Submit Merge Form Without Jobs
	 */
	onSubmitMergeForm({ fileName, folderId }) {
		if (true) {
			this.disableBtn = true;
			let ids = []
			let folderSequenceIds = [];
			folderSequenceIds.push(folderId)
			if(this.GolobalFileIds.length > 0)
				ids = this.GolobalFileIds;
			else
				ids = this.getSeletedFiles();

			// var folderId = form.parentId
			// if (form.sfolderId) {
			//   folderId = form.sfolderId;
			// }
			let requestData = {}
			if ((this.folder && this.folder['isFolderSelected']) || (this.selectedFoldersId && this.selectedFoldersId.length > 0)) {
				requestData = {
					'folderIds': this.selectedFoldersId ? this.selectedFoldersId : [this.folder.id],
					'fileIds': ids,
					'folderId': folderId,
					'fileName': fileName,
					'folder_sequence': this.selectedDocumentIds,
					'nestedMerge': false
				}
			} else {
				requestData = {
					'fileIds': ids,
					'folderId': folderId,
					'fileName': fileName,
					'folder_sequence': this.foldersSequence ? this.foldersSequence : folderSequenceIds
				}
				requestData ['socket_id'] = this.socket?.ioSocket?.id;
			}
			requestData ['socket_id'] = this.socket?.ioSocket?.id;
			this.documentManagerService.mergeDocuments(requestData).subscribe(
				res => {
					if (res['status'] == true) {
						this.disableBtn = false;
						this.refreshContent.emit(true);
						// this.getfilesByfolderId(this.folder.id)
						if (res['data']) {
							this.viewFile.emit({ link: res['data'], ext: 'pdf' });
						}
						// this.reset(true, true, false);

						this.modalRef.close()
						this.mergeForm.reset()
						// this.setVisibility(this.folder, true)
						// this.page.pageNumber = 0
						// this.getUpdatedTags.emit();
						this.toasterService.success('Document(s) Merged Successfully', 'Success');
						this.documentManagerService.successfullyMerged.next(true);
						// this.folder.selection.clear();
					} else {
						this.disableBtn = false;
						this.modalRef.componentInstance.disableBtn = false;
						this.toasterService.error(res['message'], 'Error')
					}
					this.mergeForm.reset()
				}, err => {
					this.disableBtn = false;

					this.toasterService.error(err.message, 'Error')
				});
		} else {
			// this.fd_services.touchAllFields(this.form);
		}
	}
	/**
	 * Submit Merge Form With Jobs
	 */
	onSubmitMoveAndMergeForm({ fileName, folderId, files }) {
		this.disableBtn = true;
		let requestData = {}
		if ((this.folder && this.folder['isFolderSelected']) || this.selectedFoldersId?.length) {
			requestData = {
				'folderIds': this.selectedFoldersId ? this.selectedFoldersId : [this.folder.id],
				'fileIds': files,
				'folderId': folderId,
				'fileName': fileName
			}
		} 
		else {
			requestData = {
				'fileIds': files,
				'folderId': folderId,
				'fileName': fileName
			}
		}
		this.documentManagerService.mergeDocumentsWithJobs(requestData).subscribe(
			res => {
				if (res['status'] == 200 || res['status'] == true) {
					this.disableBtn = false;
					this.refreshContent.emit(true);
					if (res['data']) {
						this.viewFile.emit({ link: res['data'], ext: 'pdf' });
					}
					this.modalRef.close();
					this.mergeForm.reset();
					this.toasterService.success(res['message'], 'Success');
					this.documentManagerService.successfullyMerged.next(true);
				} 
				else {
					this.disableBtn = false;
					this.mergeForm.reset();
					this.modalRef.componentInstance.disableBtn = false;
					this.toasterService.error(res['message'], 'Error');
				}
			}, err => {
				this.disableBtn = false;
				this.modalRef.componentInstance.disableBtn = false;
			}
		);
	}

	reset(clearSelection: boolean, updateDocument: boolean, updateTags: boolean) {
		if (clearSelection) {
			this.folder.selection.clear(); //To clear the current folders selection
			this.folder.isFolderSelected = false;
		}
	}
	getChildArchiveFolder() :any[] {

	 return this.selectedFilesList.filter(files =>
			files.fileFolderType === 'archived');
	}
	downloadFile(zipFile) {
		if (this.folder && this.folder['isFolderSelected']) {
			this.documentManagerService.getAllChildFolderFilesIdAndFilesByFolderId([this.folder.id + '']).subscribe(data => {
				var fileIds = data['data'] as Array<number>
				let ids = [];
				fileIds.forEach(id => {
					ids.push(id)
				})
				let queryparam: any = {
					ids: ids,
					case_id: this.caseId
				  }
					this.url = 'export/downloadfolder';
					this.subscription.push(this.requestService.sendRequest(this.url + "?authorization=Bearer" + this.storageData.getToken(), 'get', REQUEST_SERVERS.fd_api_url,queryparam)
					.subscribe(res => {
						this.toasterService.success(res?.message, 'Success');
						},
						err => {
							if(err?.error?.message) {
								this.toasterService.error(err?.error?.message, 'Error');
							}
							else {
								this.toasterService.error(err?.error?.error?.message, 'Error');
							}
						}
					));
			})
		}
		if (this.folder && this.folder.selection.selected.length > 0) {
			let ids: number[] = [];
			for (let file of this.folder.selection.selected) {
				ids.push(file?.id);
				  if(!zipFile) {
					this.url = 'export/download/' + file.id;
					this.subscription.push(this.requestService.sendRequest(this.url + "?authorization=Bearer" + this.storageData.getToken(), 'get', REQUEST_SERVERS.fd_api_url)
						.subscribe(res => {
							this.toasterService.success(res?.message, 'Success');
						},
						err => {
							if(err?.error?.message) {
								this.toasterService.error(err?.error?.message, 'Error');
							}
							else {
								this.toasterService.error(err?.error?.error?.message, 'Error');
							}
						}
					));
				}
			}

			if(zipFile) {
				ids = ids?.filter(
					(obj, index, self) => index === self.findIndex((key) => key === obj)
					);
				  let queryparam: any = {
					ids: ids
				  }
				this.url = 'export/downloadwithzip';
				this.subscription.push(this.requestService.sendRequest(this.url + "?authorization=Bearer" + this.storageData.getToken(), 'get', REQUEST_SERVERS.fd_api_url, queryparam)
						.subscribe(res => {
							this.toasterService.success(res?.message, 'Success');
						},
						err => {
							if(err?.error?.message) {
								this.toasterService.error(err?.error?.message, 'Error');
							}
							else {
								this.toasterService.error(err?.error?.error?.message, 'Error');
							}
						}
				));
			}
		}
		// For files
		if (this.selectedFiles && this.selectedFiles.length > 0) {
			let ids: number[] = [];
			var files = this.selectedFiles

			files.forEach(file => {
				ids.push(files);
				if(!zipFile) {
					var url = 'export/download/' + file;
					this.subscription.push(this.requestService.sendRequest(url + "?authorization=Bearer" + this.storageData.getToken(), 'get', REQUEST_SERVERS.fd_api_url)
						.subscribe(res => {
							this.toasterService.success(res?.message, 'Success');
						},
						err => {
							if(err?.error?.message) {
								this.toasterService.error(err?.error?.message, 'Error');
							}
							else {
								this.toasterService.error(err?.error?.error?.message, 'Error');
							}
						}
					));
				}
			})
			if(zipFile) {
				ids = ids?.filter(
					(obj, index, self) => index === self.findIndex((key) => key === obj)
					);
				  let queryparam: any = {
					ids: ids
				  }
				let url = 'export/downloadwithzip';
				this.subscription.push(this.requestService.sendRequest(url + "?authorization=Bearer" + this.storageData.getToken(), 'get', REQUEST_SERVERS.fd_api_url, queryparam)
						.subscribe(res => {
							this.toasterService.success(res?.message, 'Success');
						},
						err => {
							if(err?.error?.message) {
								this.toasterService.error(err?.error?.message, 'Error');
							}
							else {
								this.toasterService.error(err?.error?.error?.message, 'Error');
							}
						}
				));
			}
		}
		// For folders
		if (this.selectedFoldersId && this.selectedFoldersId.length > 0) {
			this.documentManagerService.getAllChildFolderFilesIdAndFilesByFolderId(this.selectedFoldersId).subscribe(data => {
				var folderIds = data['data'] as Array<number>
				let ids = [];
				folderIds.forEach(id => {
					ids.push(id)
				})
				let queryparam: any = {
					ids: ids,
					case_id: this.caseId
				  }
					var url = 'export/downloadfolder';
					this.subscription.push(this.requestService.sendRequest(url + "?authorization=Bearer" + this.storageData.getToken(), 'get', REQUEST_SERVERS.fd_api_url,queryparam)
						.subscribe(res => {
							this.toasterService.success(res?.message, 'Success');
						},
						err => {
							if(err?.error?.message) {
								this.toasterService.error(err?.error?.message, 'Error');
							}
							else {
								this.toasterService.error(err?.error?.error?.message, 'Error');
							}
						}
					));
			})
		}
	}
	confirmDel() {
		let requestData
		let ids = this.folder ? this.folder.selection.selected.map(file => file.id) : this.selectedFiles;
		let folderIds = this.folder && this.folder['isFolderSelected'] ? [this.folder.id] : this.selectedFoldersId && this.selectedFoldersId.length > 0 ? this.selectedFoldersId : null

		if (folderIds && folderIds.length > 0) {
			requestData = { 'folderIds': folderIds };
		} else {
			requestData = { 'ids': ids };
		}
		if (ids.length || folderIds.length) {

			this.customDiallogService.confirm('Delete Confirmation?', 'Do you really want to delete it.','Yes','No')
		.then((confirmed) => {

			if (confirmed){
				if(requestData?.ids && !requestData?.ids.includes(this.folder?.id) ){
					requestData ['socket_id'] = this.socket?.ioSocket?.id;
					this.deleteFilesOrFilders(requestData);
				}else {
					const isSystemFolder = this.isSystemGeneratedFolder(requestData, this.folder, this.folderList);
					if (isSystemFolder) {
						if (requestData?.folderIds.length === this.matchedIdsArray?.length) {
								// Proceed with the deletion logic
								const arraysAreEqual = requestData.folderIds.every(id => this.matchedIdsArray.includes(id)) &&
                      			this.matchedIdsArray.every(id => requestData.folderIds.includes(id));
								  requestData ['socket_id'] = this.socket?.ioSocket?.id;
								arraysAreEqual && this.deleteFilesOrFilders(requestData);
						} else {
								this.toasterService.error("You've selected system-generated folder(s) that cannot be deleted. Please deselect them to proceed.",'Error')
							}
					} else {
						this.toasterService.error('This folder is system generated and cannot be deleted.','Error')
					}
				}
			}
		})
		.catch();

		}
	}


	isSystemGeneratedFolder(folderIds: any[] | { folderIds: number[] }, folder: any, folderData: any[]): boolean {
		let idsArray: number[];
		this.matchedIdsArray = [];
		if (Array.isArray(folderIds)) {
			// If folderIds is a simple array, use it directly
			idsArray = folderIds;
		} else if (folderIds && Array.isArray(folderIds.folderIds)) {
			// If folderIds is an object with a 'folderIds' property, use that array
			idsArray = folderIds.folderIds;
		} else {
			// Invalid folderIds format
			return false;
		}

		if(folder === undefined || folder === null){
			//check if folderData is array before calling forEach on it.
			if (Array.isArray(folderData)) {
				folderData.forEach(insidefolder => {
					if (insidefolder && Array.isArray(insidefolder?.selectedchild)) {
						insidefolder?.selectedchild.forEach(selectedChild => {
							if (idsArray.includes(selectedChild?.id) && !selectedChild?.is_folder_system_generated) {
								this.matchedIdsArray.push(selectedChild?.id);
							}
						});
					}
				});
			}
			
			return this.matchedIdsArray.length > 0;
		}else{
			for (const folderId of idsArray) {
				if (folder.id === folderId) {
					this.matchedIdsArray.push(folderId);
					return !folder.is_folder_system_generated
				}
			}
		}
		// If no match is found, return false
		return false;
	}

	@Input() parentSelection: any;
	deleteFilesOrFilders(requestData) {
		this.documentManagerService.deleteDocument(requestData).subscribe(res => {
			if (res['status'] == true) {
				this.folder ? this.setFolderId
				.emit(this.folder.id) : ''
				this.parentSelection ? this.parentSelection.clear() : '';
				this.refreshContent.emit(true);
				this.toasterService.success('Document Deleted Successfully', 'Success');
			}
		}, err => {
			this.toasterService.error(err.error.error.message, 'Error')
		})
	}
	print(url) {
		// let type
		// url = 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png'
		// url = 'http://pu.edu.pk/downloads/Departmental-Contacts.pdf'
		// let isPdf = url.indexOf('.pdf')
		// console.log('isPdf', isPdf)
		// isPdf != -1 ? type = 'pdf' : type = 'image'
		// console.log(printJs);
		this.startLoader = false;

		printJs({ printable: url, type: 'pdf', showModal: true,modalMessage:'Loading...' });
	}
	disablePrint: boolean = false;
	_printMultipleFiles() {
		let files: FileModel[] = []
		this.disablePrint = true;
		// let requestData = {}
		if (this.selectedFilesList && this.selectedFilesList.length > 0) {
			this.selectedFilesList.forEach(file => {
				window.open(this.getLinkwithAuthToken(file.link))
			})
		}
		if (this.folder) {
			this.folder.selection.selected.forEach(file => {
				window.open(this.getLinkwithAuthToken(file.link))
			})
			if (this.folder.selection.selected.length < 1) {
				this.folder.files.forEach(file => {
					window.open(this.getLinkwithAuthToken(file.link))
				})
			}
		}

		else {
			// if (this.selectedFiles.length) {
			//   requestData['fileIds'] = this.selectedFiles;
			// }
			// if (this.selectedFoldersId.length > 0) {
			//   requestData['folderIds'] = this.selectedFoldersId
			// }
			this.foldersData.forEach(folder => {
				if (this.selectedFoldersId.length > 0) {
					if (folder.files && this.selectedFoldersId.includes(folder.id)) {
						folder.files.forEach(file => {
							files.push(file)
						})
					}
					if (folder.child) {
						folder.child.forEach(folder => {
							if (this.selectedFoldersId.includes(folder.id)) {
								this.documentManagerService.getFilesFromFolderId(folder.id).subscribe(res => {
									res['data'].forEach(file => {
										window.open(file.pre_signed_url);
										//window.open(`${file.link}&token=${this.storageData.getToken()}`)
									})
								})
							}
						})
					}
				}
				// else {
				//   if (folder.child) {
				//     let childfolder = folder.selectedchild ? folder.selectedchild : folder.child
				//     childfolder.forEach(folder => {
				//       if (this.selectedFoldersId.includes(folder.id)) {
				//         folder.files.forEach(file => {
				//           files.push(file)
				//         })
				//       } else {
				//         folder.files.forEach(file => {
				//           if (this.selectedFiles.includes(file.id)) {
				//             files.push(file)
				//           }
				//         })
				//       }

				//     })
				//   }
				//   if (folder.files) {
				//     folder.files.forEach(file => {
				//       if (this.selectedFiles.includes(file.id)) {
				//         files.push(file)
				//       }
				//     })
				//   }
				// }
			})
			files.forEach(file => {
				window.open(file.pre_signed_url);
				// window.open(`${file.link}&token=${this.storageData.getToken()}`)
			})
		}
		this.disablePrint = false;
		this.toasterService.info("Your request is being processed. This may take a while depending on the size of the content.", 'In process');

	}
	printMultipleFiles() {
		this.startLoader = true;
		let fileIds = [];
		let files: FileModel[] = []
		this.disablePrint = true;
		// let requestData = {}
		if (this.selectedFilesList && this.selectedFilesList.length > 0) {
			this.selectedFilesList.forEach(file => {
				fileIds.push(file.id)
				// window.open(this.getLinkwithAuthToken(file.link))
			})
		}
		if (this.folder) {
			this.folder.selection.selected.forEach(file => {
				fileIds.push(file.id)
				// window.open(this.getLinkwithAuthToken(file.link))
			})
			if (this.folder.selection.selected.length < 1) {
				this.folder.files.forEach(file => {
					fileIds.push(file.id)
					// window.open(this.getLinkwithAuthToken(file.link))
				})
			}
		}

		else {
			// if (this.selectedFiles.length) {
			//   requestData['fileIds'] = this.selectedFiles;
			// }
			// if (this.selectedFoldersId.length > 0) {
			//   requestData['folderIds'] = this.selectedFoldersId
			// }
			this.foldersData.forEach(folder => {
				if (this.selectedFoldersId.length > 0) {
					if (folder.files && this.selectedFoldersId.includes(folder.id)) {
						folder.files.forEach(file => {
							// files.push(file)
							fileIds.push(file.id)
						})
					}
					if (folder.child) {
						folder.child.forEach(folder => {
							if (this.selectedFoldersId.includes(folder.id)) {
								this.documentManagerService.getFilesFromFolderId(folder.id).subscribe(res => {
									res['data'].forEach(file => {
										fileIds.push(file.id)
										// window.open(`${file.link}&token=${this.storageData.getToken()}`)
									})
								})
							}
						})
					}
				}
			})
		}

		// this.print(this.getLinkwithAuthToken('https://cm.ovadamd.org/api/dm/v1/print-files?fileIds=504&fileIds=505'))

		this.documentManagerService._printFiles({ fileIds: fileIds }, this.print.bind(this))
		this.disablePrint = false;
		this.toasterService.info("Your request is being processed. This may take a while depending on the size of the content.", 'In process');
	}

	openInWindow(url) {
		return `${url}&&authorization=Bearer ${this.storageData.getToken()}`;
	}
	getLinkwithAuthToken(link) {
		let token = this.storageData.getToken()
		if (token) {
			return `${link}&token=${token}`
		}
		else { return link }
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
	clearSelections(folder: FolderModel) {
		if (folder && folder.selection) {
			folder.isFolderSelected = false;
			folder.selection.deselect(...folder.files);
			this.parentSelection ? this.parentSelection.deselect(...folder.files) : ''
		}
		if (folder.child && folder.child.length) {
			folder.child.forEach((folderChild: FolderModel) => {
				this.clearSelections(folderChild);
			})
		} else {
			return
		}
	}
	InitializecopyFileForm() {
		this.copyFileForm = this.fb.group({
			ids: '',
			parentId: ['', [Validators.required]],
			sfolderId: '',
		});
	}
	copyDocModal = (file, content): void => {
		this.copyFileForm.reset();
		let ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false, windowClass: 'modal_extraDOc doc-modal'
		};

		let ids = [];
		if (this.selectedFoldersId.length > 0) {
			this.documentManagerService.getAllChildFolderFilesIdAndFilesByFolderId(this.selectedFoldersId).subscribe(data => {
				var idArr = data['data'] as Array<any>

				let files:any[] = this.selectedFiles[0] ? this.selectedFiles[0] : [];
				for (let file of files) {
					ids.push(file.id)
				}
				ids = [...ids, ...idArr]
				this.copyFileForm['controls']['ids'].setValue(ids);
				this.modalRef = this.modalService.open(content, ngbModalOptions);
			})
		} else {
			if (this.selectedFiles.length > 0) {
				let files = this.selectedFiles[0];
				// for (let file of files) {
				// 	if (file && file.id){
				// 	ids.push(
				// 		file.id)
				// 	}
				// 	else {
				// 		ids.push(
				// 			file);
				// 	}
				// }
				this.copyFileForm['controls']['ids'].setValue(ids);
			}
			this.modalRef = this.modalService.open(MoveFileModalComponent, ngbModalOptions);
			this.modalRef.componentInstance.caseId = this.caseflowService.case.id;
			this.modalRef.componentInstance.caseId = this.caseflowService.case.id;
			this.modalRef.componentInstance.patientId = this.caseflowService.case.patient_id;
			this.modalRef.componentInstance.folders = this.folders;
			this.modalRef.componentInstance.onsubmit = (form) => { this.onSubmitCopyFile(form) }
			this.modalRef.componentInstance.refreshModelFolders.subscribe((value) => {
				this.refreshContent.emit(true);
			});
		}

	}
	selectedFolder: FolderModel
	getChildrenFolders(folder) {
		this.documentManagerService.getAllChildFoldersByFolderId(folder.id).subscribe(res => {
			folder = res['data']
			this.selectedFolder = res['data']
		})
	}
	onSubmitCopyFile({ folderId }) {
		if (true) {
			// let formValue = this.copyFileForm.getRawValue();
			// let folderId;
			// (form.sfolderId) ? folderId = formValue.sfolderId : folderId = formValue.parentId;

			let requestData = {};
			requestData['to_folder_id'] = folderId;
			(this.selectedFoldersId.length) ? requestData['folderIds'] = this.selectedFoldersId : null;
			(this.selectedFiles.length) ? requestData['ids'] = this.selectedFiles : null;

			this.disableBtn = true;
			requestData ['socket_id'] = this.socket?.ioSocket?.id;
			this.documentManagerService.copyDocument(requestData).subscribe(res => {
				if (res['status'] == true) {
					this.parentSelection ? this.parentSelection.clear() : ''
					// this.getUpdatedDocument();
					// this.getAllTagsList();
					this.copyFileForm.reset();
					this.modalRef.close();
					this.toasterService.success('Document(s) copied successfully', 'Success');
					this.disableBtn = false;
				    this.refreshContent.emit(true);
					// this.clearSelection()
				}
			}, err => {
				// this.toasterService.error(err.error.error.message, 'Error')
				this.disableBtn = false;
			})

		} else {
			// this.fd_services.touchAllFields(this.copyFileForm);
		}
	}
	initializemoveFileForm() {
		this.moveFileForm = this.fb.group({
			ids: '',
			parentId: ['', [Validators.required]],
			sfolderId: '',
		});
	}
  processFolders(folderList) {
    const isEditAble = [];
    folderList?.forEach((folder, index) =>{
      if(folder?.is_editable === false){
        isEditAble.push(folder);
        this.notMoveAble.push(folder);
      }
      if (folder && folder.child) {
        this.processFolders(folder.child);
      }
  });
}
findFile(folderList, file_id:number){
  folderList?.forEach(folder =>{
    if(folder?.files?.find(x => x.id === file_id)){
      this.files_selected.push(folder?.files?.find(x => x.id === file_id))
    }
    if(folder && folder?.child){
      this.findFile(folder?.child,file_id)
    }
  });
}
	movDocModal = (file, content): void => {
		this.notMoveAble = [];
		this.files_selected = [];
		const folderList = this.folderList?.[0]?.child;
		this.processFolders(folderList);
		this.moveFileForm.reset();
		let ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false, windowClass: 'modal_extraDOc doc-modal'
		};
		let ids = [];
		if (this.selectedFoldersId.length > 0) {
			this.documentManagerService.getAllChildFolderFilesIdAndFilesByFolderId(this.selectedFoldersId).subscribe(data => {
			var idArr = data['data']
			let files = this.selectedFiles.length ? this.selectedFiles : [];
			for (let file of files) {
				ids.push(file)
			}
			ids = [...ids, ...idArr]
			this.moveFileForm['controls']['ids'].setValue(ids);
			ids?.forEach(file_id =>{
				this.findFile(this.notMoveAble,file_id)
			});
			if(this.files_selected?.length) {
				const hasUnuploadedFile = this.files_selected?.some(file => file?.is_uploaded === 0);
				if(hasUnuploadedFile) {
					this.toasterService.error("This selection includes Visit, Bill, POM, EOR, Denial, Verification, and Payment files cannot be moved.",'Error');
					return;
				}
			}
			this.modalRef = this.modalService.open(MoveFileModalComponent, ngbModalOptions);
			})
		} 
		else {
			if (this.selectedFiles.length > 0) {
				this.selectedFiles?.forEach(file_id =>{
					this.findFile(this.notMoveAble,file_id)
				});
				this.moveFileForm['controls']['ids'].setValue(ids);
			}
			if(this.files_selected?.length) {
				const hasUnuploadedFile = this.files_selected?.some(file => file?.is_uploaded === 0);
				if(hasUnuploadedFile) {
					this.toasterService.error("This selection includes Visit, Bill, POM, EOR, Denial, Verification, and Payment files cannot be moved.",'Error');
					return;
				}
			}
			this.modalRef = this.modalService.open(MoveFileModalComponent, ngbModalOptions);
			this.modalRef.componentInstance.caseId = this.caseflowService.case.id;
			this.modalRef.componentInstance.patientId = this.caseflowService.case.patient_id;
			this.modalRef.componentInstance.folders = this.folders;
			this.modalRef.componentInstance.onsubmit = (form) => { console.log('submitted', form); this.onSubmitMoveFile(form) }
		}
	}

	onSubmitMoveFile({ folderId }) {

		if (true) {
			let formValue = this.moveFileForm.getRawValue();
			// let folderId;
			// (formValue.sfolderId) ? folderId = formValue.sfolderId : folderId = formValue.parentId;

			let requestData = {};
			requestData['to_folder_id'] = folderId;
			(this.selectedFoldersId.length) ? requestData['folderIds'] = this.selectedFoldersId : null;
			(this.selectedFiles.length) ? requestData['ids'] = this.selectedFiles : null;

			this.disableBtn = true;
			requestData ['socket_id'] = this.socket?.ioSocket?.id;
			this.documentManagerService.moveDocument(requestData).subscribe(res => {
				if (res['status'] == true) {
					// this.getUpdatedDocument();
					// this.getAllTagsList();
					this.moveFileForm.reset();
					this.parentSelection ? this.parentSelection.clear() : '';
					this.refreshContent.emit(true);
					this.modalRef.close();
					this.toasterService.success('Document(s) moved successfully', 'Success');
					this.disableBtn = false;
					// this.refreshContent.emit(true);
					// this.clearSelection()
				}
			}, err => {
				// this.toasterService.error(err.error.error.message, 'Error')
				this.disableBtn = false;
			})

		} else {
			// this.fd_services.touchAllFields(this.moveFileForm);
		}
	}
	kioskPin: string
	pushToKiosk = (): void => {
		this.customDiallogService.confirm('Push to KIOSK?', 'Do you really want to push the selected document(s) to KOISK for signature?','Yes','No')
		.then((confirmed) => {
			if (confirmed){
				let requestData = {
					"ids": this.selectedFiles,
					"case_id": this.caseId
				}
				requestData ['socket_id'] = this.socket?.ioSocket?.id;
				this.startLoader = true;
				this.subscription.push(
					this.requestService
						.sendRequest(documentManagerUrlsEnum.DocumentManager_push_to_kiosk_POST,
							'POST',
							REQUEST_SERVERS.document_mngr_api_path, requestData)
						.subscribe(
							(response: HttpSuccessResponse) => {
								if (response.status) {
									this.kioskPin = response.result.data.pin;
									let ngbModalOptions: NgbModalOptions = {
										backdrop: 'static',
										keyboard: false, windowClass: 'modal_extraDOc doc-modal'
									};

									this.modalRef = this.modalService.open(KioskModalComponent, ngbModalOptions);
									this.modalRef.componentInstance.pinNumber = this.kioskPin;
									this.modalRef.componentInstance.caseId = this.caseId;
								}
								this.startLoader = false;
							},
							(err) => {
								this.startLoader = false;
							},
						),
				);
			}
		})
		.catch();
	}
}
