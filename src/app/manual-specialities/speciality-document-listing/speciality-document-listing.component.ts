import { DatePipeFormatService } from './../../shared/services/datePipe-format.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Page } from '@appDir/front-desk/models/page';
import { SelectionModel } from '@angular/cdk/collections';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FileUploaderModalComponent } from '../file-uploader-modal/file-uploader-modal.component';
// import { FileModel } from '@appDir/shared/components/document-manager/Models/FilesModel.Model';
import { RequestService } from '@appDir/shared/services/request.service';
import { ManualSpecialitiesUrlEnum } from '../manual-specialities-url.enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
// import { DocumentManagerServiceService } from '@appDir/shared/components/document-manager/services/document-manager-service.service';
import { Folder } from '@appDir/medical-doctor/treatment-rendered/model/folder';
import { DocumentManagerServiceService } from '@appDir/front-desk/documents/services/document-manager-service.service';
import { FileModel } from '@appDir/front-desk/documents/Models/FilesModel.Model';
// import { FileUploaderModalComponent } from '@appDir/shared/components/document-manager/components/file-uploader-modal/file-uploader-modal.component';

@Component({
	selector: 'app-speciality-document-listing',
	templateUrl: './speciality-document-listing.component.html',
	styleUrls: ['./speciality-document-listing.component.scss']
})
export class SpecialityDocumentListingComponent implements OnInit {

	constructor(private storageData: StorageData, private modalService: NgbModal, private requestService: RequestService, private documentManagerService: DocumentManagerServiceService,public datePipeService:DatePipeFormatService) { }

	@Output() viewFile = new EventEmitter()
	// folder = {
	//   selection: new SelectionModel(),
	//   "id": 2429,
	//   "object_id": 1080,
	//   "object_type": "patientCases",
	//   "folder_name": "citimed",
	//   "actual_folder_name": "",
	//   "folder_description": "",
	//   "folder_path": "media/",
	//   "parent": null,
	//   "added_by": null,
	//   "updated_by": null,
	//   "created_at": "2020-05-14 10:09:20",
	//   "updated_at": "2020-05-14 10:09:20",
	//   "deleted_at": null,
	//   "files_count": 66,
	//   "one_tier_child_folders_count": 6,
	//   "total_files_count": 123,
	//   "has_child": 1,
	//   files: [
	//     {
	//       "id": 29154,
	//       "folder_id": 2429,
	//       "reference_id": null,
	//       "reference_type": null,
	//       "file_title": "CHIRO Consent Form",
	//       "file_name": "1589452506_19.pdf",
	//       "tags": ['null'],
	//       "is_uploaded": 1,
	//       "added_by": null,
	//       "updated_by": null,
	//       "created_at": "2020-05-14 10:35:06",
	//       "updated_at": "2020-05-14 10:35:06",
	//       "deleted_at": null,
	//       "ext": "pdf",
	//       "reason_for_not_signed": null,
	//       "provider_id": null,
	//       "case_id": 1080,
	//       "document_type_id": 8,
	//       "batch": null,
	//       "is_signed": null,
	//       "other_url": null,
	//       "description": 'asdasdasd',
	//       "link": "https://cm.ovadamd.org/api/dm/file-by-id?id=29154"
	//     },
	//     {
	//       "id": 29155,
	//       "folder_id": 2429,
	//       "reference_id": null,
	//       "reference_type": null,
	//       "file_title": "Assignment of Benefits",
	//       "file_name": "1589452506_20.pdf",
	//       "tags": null,
	//       "is_uploaded": 1,
	//       "added_by": null,
	//       "updated_by": null,
	//       "created_at": "2020-05-14 10:35:06",
	//       "updated_at": "2020-05-14 10:35:06",
	//       "deleted_at": null,
	//       "ext": "pdf",
	//       "reason_for_not_signed": null,
	//       "provider_id": null,
	//       "case_id": 1080,
	//       "document_type_id": 2,
	//       "batch": null,
	//       "is_signed": null,
	//       "other_url": null,
	//       "description": null,
	//       "link": "https://cm.ovadamd.org/api/dm/file-by-id?id=29155"
	//     },
	//     {
	//       "id": 29156,
	//       "folder_id": 2429,
	//       "reference_id": null,
	//       "reference_type": null,
	//       "file_title": "Lien Assignment Agreement",
	//       "file_name": "1589452506_21.pdf",
	//       "tags": null,
	//       "is_uploaded": 1,
	//       "added_by": null,
	//       "updated_by": null,
	//       "created_at": "2020-05-14 10:35:06",
	//       "updated_at": "2020-05-14 10:35:06",
	//       "deleted_at": null,
	//       "ext": "pdf",
	//       "reason_for_not_signed": null,
	//       "provider_id": null,
	//       "case_id": 1080,
	//       "document_type_id": 1,
	//       "batch": null,
	//       "is_signed": null,
	//       "other_url": null,
	//       "description": null,
	//       "link": "https://cm.ovadamd.org/api/dm/file-by-id?id=29156"
	//     },
	//     {
	//       "id": 29157,
	//       "folder_id": 2429,
	//       "reference_id": null,
	//       "reference_type": null,
	//       "file_title": "Patient HIPAA Awareness",
	//       "file_name": "1589452506_22.pdf",
	//       "tags": null,
	//       "is_uploaded": 1,
	//       "added_by": null,
	//       "updated_by": null,
	//       "created_at": "2020-05-14 10:35:06",
	//       "updated_at": "2020-05-14 10:35:06",
	//       "deleted_at": null,
	//       "ext": "pdf",
	//       "reason_for_not_signed": null,
	//       "provider_id": null,
	//       "case_id": 1080,
	//       "document_type_id": 6,
	//       "batch": null,
	//       "is_signed": null,
	//       "other_url": null,
	//       "description": null,
	//       "link": "https://cm.ovadamd.org/api/dm/file-by-id?id=29157"
	//     },
	//     {
	//       "id": 29158,
	//       "folder_id": 2429,
	//       "reference_id": null,
	//       "reference_type": null,
	//       "file_title": "Intake 05-14-2020 10:10:03",
	//       "file_name": "1589452506_23.pdf",
	//       "tags": null,
	//       "is_uploaded": 1,
	//       "added_by": null,
	//       "updated_by": null,
	//       "created_at": "2020-05-14 10:35:07",
	//       "updated_at": "2020-05-14 10:35:07",
	//       "deleted_at": null,
	//       "ext": "pdf",
	//       "reason_for_not_signed": null,
	//       "provider_id": null,
	//       "case_id": 1080,
	//       "document_type_id": 7,
	//       "batch": null,
	//       "is_signed": null,
	//       "other_url": null,
	//       "description": null,
	//       "link": "https://cm.ovadamd.org/api/dm/file-by-id?id=29158"
	//     },
	//     {
	//       "id": 29159,
	//       "folder_id": 2429,
	//       "reference_id": null,
	//       "reference_type": null,
	//       "file_title": "No Fault Application (NF-2) 05-14-2020 10:10:03",
	//       "file_name": "1589452507_24.pdf",
	//       "tags": null,
	//       "is_uploaded": 1,
	//       "added_by": null,
	//       "updated_by": null,
	//       "created_at": "2020-05-14 10:35:07",
	//       "updated_at": "2020-05-14 10:35:07",
	//       "deleted_at": null,
	//       "ext": "pdf",
	//       "reason_for_not_signed": null,
	//       "provider_id": null,
	//       "case_id": 1080,
	//       "document_type_id": 14,
	//       "batch": null,
	//       "is_signed": null,
	//       "other_url": null,
	//       "description": null,
	//       "link": "https://cm.ovadamd.org/api/dm/file-by-id?id=29159"
	//     },
	//     {
	//       "id": 29160,
	//       "folder_id": 2429,
	//       "reference_id": null,
	//       "reference_type": null,
	//       "file_title": "Notice of Intention to Make A Claim (MVAIC) 05-14-2020 10:10:03",
	//       "file_name": "1589452507_25.pdf",
	//       "tags": null,
	//       "is_uploaded": 1,
	//       "added_by": null,
	//       "updated_by": null,
	//       "created_at": "2020-05-14 10:35:07",
	//       "updated_at": "2020-05-14 10:35:07",
	//       "deleted_at": null,
	//       "ext": "pdf",
	//       "reason_for_not_signed": null,
	//       "provider_id": null,
	//       "case_id": 1080,
	//       "document_type_id": 16,
	//       "batch": null,
	//       "is_signed": null,
	//       "other_url": null,
	//       "description": null,
	//       "link": "https://cm.ovadamd.org/api/dm/file-by-id?id=29160"
	//     },
	//     {
	//       "id": 29161,
	//       "folder_id": 2429,
	//       "reference_id": null,
	//       "reference_type": null,
	//       "file_title": "Household Affidavit 05-14-2020 10:10:03",
	//       "file_name": "1589452507_26.pdf",
	//       "tags": null,
	//       "is_uploaded": 1,
	//       "added_by": null,
	//       "updated_by": null,
	//       "created_at": "2020-05-14 10:35:07",
	//       "updated_at": "2020-05-14 10:35:07",
	//       "deleted_at": null,
	//       "ext": "pdf",
	//       "reason_for_not_signed": null,
	//       "provider_id": null,
	//       "case_id": 1080,
	//       "document_type_id": 17,
	//       "batch": null,
	//       "is_signed": null,
	//       "other_url": null,
	//       "description": null,
	//       "link": "https://cm.ovadamd.org/api/dm/file-by-id?id=29161"
	//     },
	//     {
	//       "id": 29162,
	//       "folder_id": 2429,
	//       "reference_id": null,
	//       "reference_type": null,
	//       "file_title": "Affidavit of No Insurance 05-14-2020 10:10:03",
	//       "file_name": "1589452507_27.pdf",
	//       "tags": null,
	//       "is_uploaded": 1,
	//       "added_by": null,
	//       "updated_by": null,
	//       "created_at": "2020-05-14 10:35:08",
	//       "updated_at": "2020-05-14 10:35:08",
	//       "deleted_at": null,
	//       "ext": "pdf",
	//       "reason_for_not_signed": null,
	//       "provider_id": null,
	//       "case_id": 1080,
	//       "document_type_id": 18,
	//       "batch": null,
	//       "is_signed": null,
	//       "other_url": null,
	//       "description": null,
	//       "link": "https://cm.ovadamd.org/api/dm/file-by-id?id=29162"
	//     },
	//     {
	//       "id": 29163,
	//       "folder_id": 2429,
	//       "reference_id": null,
	//       "reference_type": null,
	//       "file_title": "Authorization For Release Of Health Information Pursuant To HIPAA 05-14-2020 10:10:03",
	//       "file_name": "1589452508_28.pdf",
	//       "tags": null,
	//       "is_uploaded": 1,
	//       "added_by": null,
	//       "updated_by": null,
	//       "created_at": "2020-05-14 10:35:08",
	//       "updated_at": "2020-05-14 10:35:08",
	//       "deleted_at": null,
	//       "ext": "pdf",
	//       "reason_for_not_signed": null,
	//       "provider_id": null,
	//       "case_id": 1080,
	//       "document_type_id": 13,
	//       "batch": null,
	//       "is_signed": null,
	//       "other_url": null,
	//       "description": null,
	//       "link": "https://cm.ovadamd.org/api/dm/file-by-id?id=29163"
	//     }
	//   ]
	// }


	// folder: Folder;
	folder

	files: any[] = []
	page: Page = new Page()
	ngOnInit() {
		// this.getFolder()
		this.page.pageNumber = 1
		this.page.size = 10
		this.page.totalElements = 10
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
	editDocModal(file) {
		let modalRef = this.modalService.open(FileUploaderModalComponent);
		modalRef.componentInstance.editMode = true;
		modalRef.componentInstance.file = file
	}
	viewDocFile(file: FileModel): void {
		this.viewFile.emit({ link: file.link, ext: file.ext });
	}
	getFolder() {
		let templateObj = JSON.parse(localStorage.getItem('templateObj'))
		let { case_id, patientId, doctorId, speciality_id, appointment_id, visitId, id, checkInTime, speciality } = templateObj;

		this.requestService.sendRequest(ManualSpecialitiesUrlEnum.getFiles, 'get', REQUEST_SERVERS.document_mngr_api_path, { case_id: case_id, speciality_id: speciality_id }).subscribe(data => {
			this.folder = data['result']['data']
			debugger;
			if (this.folder && this.folder.id)
				this.getFiles(this.folder.id)
		})
	}

	getFiles(folder_id: number) {
		debugger;
		this.documentManagerService.getFilesFromFolderId(folder_id).subscribe(data => {
		})
	}
}
