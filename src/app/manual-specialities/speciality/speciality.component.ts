import { AssignRoomsUrlsEnum } from './../../scheduler-front-desk/modules/assign-rooms/assign-rooms-urls-enum';
import { Component, OnInit } from '@angular/core';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RequestService } from '@appDir/shared/services/request.service';
import { sharedUrlsEnum } from '@appDir/front-desk/fd_shared/components/shareFileUpload/shared-file-upload/shared-file-Urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { ToastrService } from 'ngx-toastr';
import { ManualSpecialitiesUrlEnum } from '../manual-specialities-url.enum';
import { DocumentManagerServiceService } from '@appDir/front-desk/documents/services/document-manager-service.service';
import { FolderModel } from '@appDir/front-desk/documents/Models/FolderModel.Model';
import { FileModel } from '@appDir/front-desk/documents/Models/FilesModel.Model';
import { MainService } from '@appDir/shared/services/main-service';
import { makeDeepCopyObject } from '@appDir/shared/utils/utils.helpers';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
declare var PDFObject: any;
@Component({
	selector: 'app-speciality',
	templateUrl: './speciality.component.html',
	styleUrls: ['./speciality.component.scss']
})
export class SpecialityComponent implements OnInit {

	visitSessionId:any;

	constructor(private fd_services: FDServices, private fb: FormBuilder, private storageData: StorageData,
		 private modalService: NgbModal, private requestService: RequestService, 
		 private toastrService: ToastrService, private documentManagerService: DocumentManagerServiceService,
		 public mainService:MainService,private customDiallogService : CustomDiallogService) { }




	showFile: boolean = false
	imageSourceLink: string = ''
	pdfSourceLink: string = ''

	folder: FolderModel
	editTagForm: FormGroup
	form: FormGroup
	templateObj: any
	addTagForm: FormGroup
	ngOnInit() {
		this.templateObj = JSON.parse(localStorage.getItem('templateObj'));
		debugger;
		this.getFolder()
		this.form = this.fb.group({
			option: [''],
		});

		this.addTagForm = this.fb.group({
			id: '',
			tags: [''],
		});

		this.editTagForm = this.fb.group({
			id: '',
			tags: [''],
			file_title: '',
			description: ['']
		});
	}

	getSessionDocument(appointment_ids,case_id){
		debugger;
		this.requestService
				.sendRequest(AssignRoomsUrlsEnum.getVisitSession, 'POST', REQUEST_SERVERS.fd_api_url, 
					{appointment_ids: [appointment_ids]}
				)
				.subscribe((response: any) => {
					debugger;
					if (response && response.result && response.result.data && response.result.data.length!=0){
					let params = {
						reference_id:response &&
						response.result && response.result.data 
						&& response.result.data[0].visit_session_id?response.result.data[0].visit_session_id:null,
						// case_id:case_id,
						id:this.folder && this.folder.id
					}
					this.visitSessionId = response.result && response.result.data 
					&& response.result.data[0].visit_session_id?response.result.data[0].visit_session_id:null,
				    this.getFiles(params);
					}

				});
	}
	showFilePreview(bool) { this.showFile = bool; }
	ext;
	previewUrl;
	file;

	showMedia($event: { files: string, type: string }) {
		this.showFile = true;
		this.ext = $event.type
		if (this.ext == "pdf" || this.ext == "PDF") {
			this.imageSourceLink = null;
			this.pdfSourceLink = `${$event.files}`;
			this.file = $event;
			PDFObject.embed(this.pdfSourceLink, "#pdf");
			this.previewUrl = $event.files
		}
		else {
			this.pdfSourceLink = null;
			this.imageSourceLink = `${$event.files}`;
			this.previewUrl = $event.files
		}



	}
	modalRef
	editDocModal = (editTag, file): void => {
		const option: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc',
		};
		var tags = [];
		if (file.tags) {
			tags = file.tags.split(',');
		}
		this.editTagForm['controls']['id'].setValue(file.id);
		this.editTagForm['controls']['file_title'].setValue(file.file_title);
		this.editTagForm['controls']['tags'].setValue(tags);
		this.editTagForm['controls']['description'].setValue(file.description);
		this.modalRef = this.modalService.open(editTag, option);
	}
	disableBtn: boolean = false;
	file_id: number
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

	startLoader: boolean = false;

	deleteForFiles(data) {
		this.startLoader = true;
		this.customDiallogService.confirm('Delete File', 'Are you sure you want to delete this file?','Yes','No')
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
				
			}
		})
		.catch();
	}

	onFileDelete(file: FileModel) {

		if (file.link == this.pdfSourceLink || file.link == this.imageSourceLink) {
			this.pdfSourceLink = null;
			this.imageSourceLink = null;
		}
	}

	updateDisableBtn: boolean = false;
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

			const id = this.editTagForm.value.id;
			const file_title = this.editTagForm.value.file_title;
			formValue.id = id;
			formValue.fileTitle = file_title;
			this.saveDocument(formValue);
			this.disableBtn = false;
		}

	}
	saveDocument(formValue) {
		this.startLoader = true;
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
						this.toastrService.success('Tag Added Successfully', 'Success');
					}
				},
				(err) => {
					this.disableBtn = true;
					this.toastrService.error(err.error.error.message, 'Error');
				},
			);
	}
	showFolder: boolean = true;
	getAllDocuments() {
		this.showFolder = false;
		setTimeout(() => {
			this.showFolder = true
		}, 300);
	}
	onSubmitAddTag() {
		this.disableBtn = true;
		if (this.addTagForm.valid) {
			const formValue = this.addTagForm.getRawValue();
			let tagsStr = '';
			if (formValue && formValue.tags && formValue.tags.length) {
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

			formValue.id = this.file_id;
			this.saveDocument(formValue);
		}
	}


	getFolder() {
		let templateObj = JSON.parse(localStorage.getItem('templateObj'))
		let { case_id, patientId, doctorId,speciality_id, appointment_id, visitId, id, checkInTime, speciality } = templateObj;


		this.requestService.sendRequest(ManualSpecialitiesUrlEnum.getFiles, 'get', REQUEST_SERVERS.document_mngr_api_path, { case_id: case_id, speciality_id: speciality_id }).subscribe(data => {
			this.folder = data['result']['data']
			debugger;
			if(this.folder && this.folder.id) {
				this.getSessionDocument(id,case_id);
			}			
		})
	}
	getFiles(params) {
		debugger;

		this.requestService.sendRequest(
			ManualSpecialitiesUrlEnum.getFolderDocumentApi,
			'post',
			REQUEST_SERVERS.document_mngr_api_path,
			params,
		).subscribe(data=>{
			this.folder.files = data['data']
			this.folder = makeDeepCopyObject(this.folder);
		})
		
	}
}
