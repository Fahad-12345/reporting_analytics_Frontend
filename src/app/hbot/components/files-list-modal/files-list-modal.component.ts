import {
	Component,
	OnInit,
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Config } from '@appDir/config/config';
import { HBOTUrlEnums } from '@appDir/hbot/HBOTUrlEnums.enum';
import { HbotService } from '@appDir/hbot/service/hbot.service';
// import { FolderModel } from '@appDir/shared/components/document-manager/Models/FolderModel.Model';
// import { FileModel } from '@appDir/shared/components/document-manager/Models/FilesModel.Model';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'app-files-list-modal',
	templateUrl: './files-list-modal.component.html',
	styleUrls: ['./files-list-modal.component.scss'],
})
export class FilesListModalComponent implements OnInit {
	constructor(
		private storageData: StorageData,
		private config: Config,
		private activeModal: NgbActiveModal,
		private requestService: RequestService,
		private hbotService: HbotService,
	) {}

	// page = new Page()
	// folder:FolderModel
	editable:boolean=true
	disableBtn: boolean = false;
	form: FormGroup;
	files: any[] = [
		// {
		//   added_by: null,
		//   batch: null,
		//   case_id: 9,
		//   created_at: "2020-06-03 14:46:11",
		//   deleted_at: null
		//   , description: null
		//   , document_type_id: 29
		//   , ext: "pdf"
		//   , file_name: "1591195571_manualSpecialty_9.pdf"
		//   , file_title: "Leave & Holiday Policy-1.1.pdf"
		//   , folder_id: 65
		//   , id: 305
		//   , is_signed: null
		//   , is_uploaded: 1
		//   , link: "https://cm.ovadamd.org/api/dm/file-by-id?id=305"
		//   , other_url: null
		//   , provider_id: null
		//   , reason_for_not_signed: null
		//   , reference_id: null
		//   , reference_type: "manualSpecialty"
		//   , tags: null
		//   , updated_at: "2020-06-03 14:46:11"
		//   , updated_by: null
		// }
	];
	ngOnInit() {
		this.disableBtn = true;
		let appointment = this.hbotService.getAppointmentDetail();
		let session = this.hbotService.getSession();
		this.requestService
			.sendRequest(HBOTUrlEnums.UploadFiles, 'post', REQUEST_SERVERS.document_mngr_api_path, {
				session_id: session.id,
				case_id: appointment.case_id,
				patient_id: appointment.patient.id,
				appointment_location_id: appointment.location_id,
				appointment_id: appointment.id,
				speciality_name: appointment.speciality,
				preview_report: true
			})
			.subscribe(
				(data) => {
					this.disableBtn = false;
					this.files = [data['data']];
				},
				(err) => (this.disableBtn = false),
			);
	}

	openWindow(link) {
		window.open(link);
	}
	getLinkwithAuthToken(link) {
		let token = this.storageData.getToken();
		if (token) {
			return `${link}&token=${token}`;
		} else {
			return link;
		}
	}

	downloadFile(id) {
		let url = this.config.getConfig('document_mngr_api_path') + 'download/' + id + '?';
		url = this.getLinkwithAuthToken(url);
		window.open(url);
	}
	// disableBtn: boolean = false;
	close() {
		this.activeModal.close();
	}
	submit(session_status) {
		session_status === 2 ? this.hbotService.setbtnClickedVal(session_status) : this.activeModal.close(session_status);
	}
}
