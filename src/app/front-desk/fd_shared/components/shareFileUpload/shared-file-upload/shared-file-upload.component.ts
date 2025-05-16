import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import {
	FileSystemFileEntry,
	FileSystemDirectoryEntry,
} from 'ngx-file-drop';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { ActivatedRoute, Params } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgbModalOptions, NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SelectionModel } from '@angular/cdk/collections';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { sharedUrlsEnum } from './shared-file-Urls-enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { FolderModel } from '@appDir/front-desk/documents/Models/FolderModel.Model';
import { DocumentManagerServiceService } from '@appDir/front-desk/documents/services/document-manager-service.service';
import { FileModel } from '@appDir/front-desk/documents/Models/FilesModel.Model';
import { isSameLoginUser } from '@appDir/shared/utils/utils.helpers';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';

declare var PDFObject: any;

@Component({
	selector: 'app-shared-file-upload',
	templateUrl: './shared-file-upload.component.html',
	styleUrls: ['./shared-file-upload.component.scss'],
	animations: [
		trigger('fadeInOut', [
			state(
				'void',
				style({
					opacity: 0,
				}),
			),
			transition('void <=> *', animate(1000)),
		]),
	],
})
export class SharedFileUploadComponent extends PermissionComponent implements OnInit {


	@Input() visitSessionId:any;
	private documents: any[];
	PDFObject:any;
	private imageSrc: string = '';
	private imageIndex: number;
	newUserId: any;
	isUploading = false;
	showingFiles: boolean = false; // added to hide if ther is no file
	modalRef: NgbModalRef;

	selection = new SelectionModel<any>(true, []);
	educationalSelection = new SelectionModel<any>(true, []);
	personalSelection = new SelectionModel<any>(true, []);
	professionalSelection = new SelectionModel<any>(true, []);
	has_document_files = false;
	fileExtension: any;
	imageSourceLink: any = null;
	pdfSourceLink: any = 'xyz';
	file: any;
	showFile: boolean = true;
	folderFiles: any[] = [];
	educationalFiles: any[] = [];
	personalFiles: any[] = [];
	professionalFiles: any[] = [];
	documentsShown: FolderModel[] = [];
	form: FormGroup;
	addTagForm: FormGroup;
	disableBtn: boolean = false;
	updateDisableBtn: boolean = false;
	file_id: number;
	editTagForm: FormGroup;
	totalRows: number;
	educationalRows: number;
	personalRows: number;
	professionalRows: number;
	id;
	@Input() currentUser: number;
	@Input() objectType: string;

	constructor(
		private fd_services: FDServices,
		private route: ActivatedRoute,
		private toastrService: ToastrService,
		private modalService: NgbModal,
		private customDiallogService: CustomDiallogService,
		private fb: FormBuilder,
		protected requestService: RequestService,
		private documentManagerService: DocumentManagerServiceService,
		private cdr: ChangeDetectorRef
	) {
		super()
		this.documents = [];
		this.imageIndex = 0;
	}

	ngOnInit() {
		this.form = this.fb.group({
			option: ['', Validators.required],
		});

		this.addTagForm = this.fb.group({
			id: '',
			tags: ['', Validators.required],
		});

		this.editTagForm = this.fb.group({
			id: '',
			tags: [''],
			file_title: ['', Validators.required],
		});
		// ;
		if (this.currentUser != null || this.currentUser != undefined) {
			this.getAllDocuments();
		}
		this.getUserId();
	}
	// getpdf() {
	// 	console.log(this.pdfSourceLink);
	// 	return this.pdfSourceLink;
	// }
	public fileOver = (event): void => console.log(event);

	public fileLeave = (event): void => console.log(event);


	
	public dropped = (event: any, isImage?: boolean, typeContent?: any): void => {
	

		let isSupported = event.files.every(file => {
			let arr = file.fileEntry.name.split('.');
			return arr[arr.length - 1] == "jpeg" || arr[arr.length - 1] == "png" || arr[arr.length - 1] == "pdf"
		})
		if (!isSupported) {
			this.toastrService.error(`The File format must be of PDF, Jpeg or Png type.`, 'Error')
			return;
		}
		this.isUploading = true;
		if (this.objectType !== 'staff') {
			this.openModal(typeContent);
		}

		this.showingFiles = true;
		// console.log('isImage', isImage, event.files.length);

		// console.log('deopped', this.dropped);

		if (isImage && event.files.length < 2) {
			const droppedImage: any = event.files[0];

			// console.log('droppedImage', droppedImage);

			this.formatFile(droppedImage, isImage);

			// console.log('doddddddddddddddddddd', this.documents[this.documents.length - 1]);

			return;
		}

		if (!isImage) {
			for (const droppedFile of event.files) {
				// Is it a file?
				this.formatFile(droppedFile, isImage);

			}

			return;
		}
	};

	private formatFile = (droppedFile, isImage?: boolean): void => {
		// console.log('droppedFile', droppedFile);
		if (droppedFile.fileEntry.isFile) {
			const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;

			fileEntry.file((file: File) => {
				// console.log('file', file);

				// Here you can access the real file
				// console.log(droppedFile.relativePath, file);
				// Get Extension from file

				const ext = file.type.split('/');
				// console.log('ext', ext);

				if (isImage) {
					this.documents.push({ tags: 'profile_picture', fileTitle: file.name, ext: ext[1] });
				} else {
					this.documents.push({ tags: '', fileTitle: file.name, ext: ext[1] });
				}

				// Convert file to base64

				const reader = new FileReader();

				reader.onload = this.handleReaderLoaded.bind(this);

				reader.readAsDataURL(file);
			});
		} else {
			// It was a directory (empty directories are added, otherwise only files)
			const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
			// console.log(droppedFile.relativePath, fileEntry);
		}
	};

	handleReaderLoaded(e): void {
		console.log('handleReaderLoaded method called');
		// this.isUploading = true;
		const reader = e.target;

		this.imageSrc = reader.result;

		const filecode = this.imageSrc.split(',');
		// console.log('fileCode', filecode);
		this.imageSrc = filecode[1];

		this.documents[this.imageIndex].file = filecode[1];
		++this.imageIndex;
		// ;
		console.log(this.documents, this.imageIndex);

		if (this.objectType === 'staff') {
			this.afterSelectionFolder();
		}

		
		return;

		// console.log('form', this.form.controls.get("files"));
	}

	addTagModal = (content, row?, rowIndex?): void => {
		this.disableBtn = false;
		if (!row['tags']) {
			this.addTagForm.reset();
		}
		else {
			var tags = [];
			if (row.tags) {
				tags = row.tags.split(',');
			}
			this.addTagForm['controls']['tags'].setValue(tags);
		}
		this.file_id = row.id;
	
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc',
		};

		this.modalRef = this.modalService.open(content, ngbModalOptions);
	};

	showMedia({ files, type }): void {
		
		this.fileExtension = type
		if (this.fileExtension == 'pdf' || this.fileExtension == 'PDF') {
			this.imageSourceLink = null;
			this.pdfSourceLink = files;
			this.cdr.detectChanges();
			this.file = files;
		
			if (this.objectType != 'staff') {
				
				PDFObject.embed(this.pdfSourceLink, '#pdf');
			
			} else {
		
				PDFObject.embed(this.pdfSourceLink, '#pdfMD');
				
			}
		} else {
			this.pdfSourceLink = null;
			// console.log('this.pdfSourceLink', this.pdfSourceLink);
			this.imageSourceLink = files;
			// console.log('this.imageSourceLink', this.imageSourceLink);
		}
	}

	onFileDelete(file: FileModel) {

		if (file.link == this.pdfSourceLink || file.link == this.imageSourceLink) {
			this.pdfSourceLink = null;
			this.imageSourceLink = null;
		}
	}

	editDocModal = (editTag, file): void => {
		const option: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc',
		};
		// this.file = file;
		// console.log('file', file)
		var tags = [];
		if (file.tags) {
			tags = file.tags.split(',');
		}
		this.editTagForm['controls']['id'].setValue(file.id);
		this.editTagForm['controls']['file_title'].setValue(file.file_title);
		this.editTagForm['controls']['tags'].setValue(tags);
		this.modalRef = this.modalService.open(editTag, option);
	}

	deleteFile(row) {
		const id = [];
		id.push(row.id);
		const data = {
			ids: id,
		};
		this.deleteForFiles(data);
		
	}

	showFilePreview(showFile) {
		this.showFile = showFile;
		if (this.showFile) {
			if (this.fileExtension == 'pdf' || this.fileExtension == 'PDF') {
		
				this.showMedia({ files: this.file, type: 'pdf' });
			}
		}
	}
	getAllDocuments() {
		let data = {
			objectId: this.currentUser, // this is Current userID that shown in url  and taking as an INPUT
			objectType: this.objectType, // this is object type that is using and taking as an INPUT
		};

		// this.fd_services.getAllFoldersAndFilesByCase(data)
		this.requestService
			.sendRequest(
				sharedUrlsEnum.sharedFile_list_GET,
				'POST',
				REQUEST_SERVERS.document_mngr_api_path,
				data,
			)
			.subscribe((res: any) => {
				if (res.status === 200 || res.status) {
					this.showingFiles = true;
					this.documentsShown = res.data;
					// let documentation_has_files = 
					this.slectionClear();
					if (this.documentsShown.length > 0) {
						// this.folderFiles = this.documentsShown[0]['files'];
						if (res.data[0].files_count > 0) {
							this.has_document_files = true;
						}
						if (res.data[0].files_count < 1) {
							this.has_document_files = false;
						}
						for (let file of this.documentsShown) {
							if (file.files) {
								for (let f of file.files) {
									// console.log('f', f)
									this.folderFiles.push(f);
								}
							}

							// this.folderFiles = file;
							// console.log('-----', this.folderFiles);
						}
						if (this.objectType !== 'staff') {
							this.professionalFiles[0] = this.folderFiles[0];
							this.educationalFiles[0] = this.folderFiles[1];
							this.personalFiles[0] = this.folderFiles[2];
							// console.log('personal', this.professionalFiles);
						}
						if(this.documentsShown.some(item => item.files_count > 0)) {
							this.has_document_files = true;
						}
					}

					// console.log('getting ', this.folderFiles);
				}
			});
	}

	openModal(typeContent) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc body-scroll',
		};

		this.modalRef = this.modalService.open(typeContent, ngbModalOptions);
	}

	onSubmit(form) {
		this.modalRef.close();
		this.afterSelectionFolder();
	}

	afterSelectionFolder() {

		let arr = this.documents.filter(docs => {
			if (docs.file) {
				return docs
			}
		})
		if (arr.length !== this.documents.length) {
			return;
		}
		let latestDocument = this.documents.reverse(); // For Get the latest file.
		if (this.objectType !== 'staff') {			
			const temp = {
				doctorId: this.currentUser, // this is Current userID that shown in url  and taking as an INPUT
				module: this.objectType,
				folder: this.form.get('option').value,
				filesData: [latestDocument[0]],
			};
			this.isUploading = true;
			this.doctorFilesUploading(temp);
		} else {
			const temp = {
				staffId: this.currentUser,
				module: this.objectType,
				filesData: [latestDocument[0]],
			};
			this.isUploading = true;
			this.staffFilesUploading(temp);
		}
	}

	//
	doctorFilesUploading(temp) {
		this.startLoader = true;
		// this.fd_services.uploadDoctorDocument(temp)
		this.requestService
			.sendRequest(
				sharedUrlsEnum.sharedFile_Upload_doctor_POST,
				'POST',
				REQUEST_SERVERS.document_mngr_api_path,
				temp,
			)
			.subscribe(
				(resp) => {
					this.startLoader = false;
					if (resp['status']) {
						this.showingFiles = true;
						this.toastrService.success(resp['message'], 'Success');
						// this.documentsShown = resp['data'];
						// this.folderFiles = this.documentsShown;
						this.getAllDocuments();
						this.isUploading = false;
					}
					if (!resp['status']) {
						this.toastrService.error(resp['message'], 'Error');
					}

					this.documents = [];
					this.imageIndex = 0;
				},
				(err) => { },
			);
		return;
	}

	// below method just to upload files for staff and it hits different URL
	staffFilesUploading(temp) {
		this.startLoader = true;
		// this.fd_services.uploadUserDocument(temp)
		this.requestService
			.sendRequest(
				sharedUrlsEnum.sharedFile_Upload_staff_POST,
				'POST',
				REQUEST_SERVERS.document_mngr_api_path,
				temp,
			)
			.subscribe(
				(resp: any) => {
					this.startLoader = false;
					if (resp.status) {
						this.getAllDocuments();
						this.toastrService.success(resp.message, 'Success');
						// this.documentsShown = resp.data;
						// console.log('this.documentsShown', this.documentsShown);
						this.isUploading = false;
					}
					if (!resp.status) {
						this.toastrService.error(resp.message, 'Error');
					}

					this.documents = [];
					this.imageIndex = 0;
				},
				(err) => { },
			);
	}

	onSubmitAddTag() {
		this.disableBtn = true;
		if (this.addTagForm.valid) {
			const formValue = this.addTagForm.getRawValue();
			let tagsStr = '';
			// this.disableBtn = true;
			if (formValue.tags.length) {
				let i = 0;
				for (const tag of formValue.tags) {
					const comma = i > 0 ? ',' : '';
					if (typeof tag === 'object') {
						tagsStr = tagsStr + comma + tag.display;
					} else {
						tagsStr = tagsStr + comma + tag;
					}
					i++;
				}
			}

			this.addnewtag ? tagsStr = tagsStr ? tagsStr + ',' + this.addnewtag : this.addnewtag : '';
			formValue['tags'] = tagsStr;

			formValue.id = this.file_id;
			this.saveDocument(formValue);
		}
	}

	saveDocument(formValue) {
		this.startLoader = true;
		// this.fd_services.editDocument(formValue)
		this.requestService
			.sendRequest(
				sharedUrlsEnum.sharedFile_EditByID_POST,
				'POST',
				REQUEST_SERVERS.document_mngr_api_path,
				formValue,
			)
			.subscribe(
				(res: any) => {
					this.startLoader = false;
					if (res.status === true) {
						// this.documentResposne[0] = res.data;
						// console.log('response --> ', res);

						if (this.editTagForm.valid) {
							this.editTagForm.reset();
							this.getAllDocuments();
							this.updateDisableBtn = false;
						} else if (this.addTagForm.valid) {
							this.addTagForm.reset();
							this.getAllDocuments();
							this.disableBtn = false;
						}

						this.modalRef.close();
						this.toastrService.success(res.message, 'Success');
					}
					// this.disableBtn = false;
				},
				(err) => {
					this.disableBtn = true;
					this.toastrService.error(err.error.error.message, 'Error');
				},
			);
	}

	editTagSubmit() {
		this.updateDisableBtn = true;
		if (this.editTagForm.valid) {
			const formValue = this.editTagForm.getRawValue();
			let tagsStr = '';
			this.disableBtn = true;
			if (formValue.tags.length) {
				let i = 0;
				for (const tag of formValue.tags) {
					const comma = i > 0 ? ',' : '';
					if (typeof tag === 'object') {
						tagsStr = tagsStr + comma + tag.display;
					} else {
						tagsStr = tagsStr + comma + tag;
					}
					i++;
				}
			}

			formValue['tags'] = tagsStr;

			// for (const folder of this.documentsShown) {
			const id = this.editTagForm.value.id;
			const file_title = this.editTagForm.value.file_title;
			// console.log('folder  ', folder);
			formValue.id = id;
			formValue.fileTitle = file_title;
			// }
			this.saveDocument(formValue);
			this.disableBtn = false;
		}

	}

	isAllSelected() {
		this.totalRows = this.folderFiles.length;
		const numSelected = this.selection.selected.length;
		const numRows = this.totalRows;
		return numSelected === numRows;
	}
	masterToggle() {
		// console.log('folderfiles', this.folderFiles);
		this.isAllSelected()
			? this.selection.clear()
			: this.folderFiles.slice(0, this.totalRows).forEach((row) => this.selection.select(row))
	}

	// this is for Professional document Check-boxes
	isAllSelectedProfessional() {
		this.professionalRows = this.professionalFiles.length;
		const numSelected = this.professionalSelection.selected.length;
		const numRows = this.professionalRows;
		return numSelected === numRows;
	}
	masterToggleProfessional() {
		this.isAllSelectedProfessional()
			? this.professionalSelection.clear()
			: this.professionalFiles
				.slice(0, this.professionalRows)
				.forEach((row) => this.professionalSelection.select(row));
	}

	isAllSelectedEducational() {
		this.educationalRows = this.educationalFiles.length;
		const numSelected = this.educationalSelection.selected.length;
		const numRows = this.educationalRows;
		return numSelected === numRows;
	}

	masterToggleEducational() {
		this.isAllSelectedEducational()
			? this.educationalSelection.clear()
			: this.educationalFiles
				.slice(0, this.educationalRows)
				.forEach((row) => this.educationalSelection.select(row));
	}

	isAllSelectedPersonal() {
		this.personalRows = this.personalFiles.length;
		const numSelected = this.personalSelection.selected.length;
		const numRows = this.personalRows;
		return numSelected === numRows;
	}
	masterTogglePersonal() {
		this.isAllSelectedPersonal()
			? this.personalSelection.clear()
			: this.personalFiles
				.slice(0, this.personalRows)
				.forEach((row) => this.personalSelection.select(row));
	}

	deleteForFiles(data) {
		this.startLoader = true;
		this.customDiallogService.confirm('Delete File','Are you sure you want to delete this file?','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				this.requestService
						.sendRequest(
							sharedUrlsEnum.shartedFile_list_DELETE,
							'POST',
							REQUEST_SERVERS.document_mngr_api_path,
							{ ids: data }
						)
						.subscribe((resp: any) => {
							this.startLoader = false;
							if (resp.status === true) {
								this.pdfSourceLink = 'xyz';
								this.imageSourceLink = null;
								this.getAllDocuments();
								this.toastrService.success('Success', 'deleted successfully');
							}
						});
				
			}else if(confirmed === false){
				
			}else{
				
			}
		})
		.catch();
	}

	slectionClear() {
		this.selection.clear();
	}
	toggleFolderShow(folder: FolderModel) {
		folder.show = !folder.show
		if (folder.show) {
			this.getfilesFromFolderId(folder).subscribe(data => {
				// console.log(data)
				// folder = data['data']
				folder['files'] = data['data']['files']
				folder['child'] = data['data']['child']
				folder['files_count'] = data['data']['files_count']
				folder['total_files_count'] = data['data']['total_files_count']

				for (let f of folder.files) {
					// console.log('f', f)
					this.folderFiles.push(f);
				}
			})
		}
	}
	getfilesFromFolderId(folder: FolderModel) {
		return this.documentManagerService.getFilesFromFolderId(folder.id, 10, 1, new Set())
	}
	addnewtag: any
	onTextChange(event) {
		if (event) {
			let tags = this.addTagForm.get('tags').value
			let match = tags && tags.length > 0 ? tags.find(res => { event == res }) : ''
			!match ? this.addnewtag = event : this.addnewtag = ''
		}
		else
			this.addnewtag = ''
	}
	getUserId() {
		this.route.params.subscribe((params: Params) => {
			this.id = params['id'];
		  });
	}
	isSameLoginUser() {
		return isSameLoginUser(this.id);
	}
}
