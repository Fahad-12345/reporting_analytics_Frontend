import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
// import { FileModel } from '@appDir/shared/components/document-manager/Models/FilesModel.Model';
import { RequestService } from '@appDir/shared/services/request.service';
import { ManualSpecialitiesUrlEnum } from '../manual-specialities-url.enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
// import { FileModel } from '../../Models/FilesModel.Model';
import { zip } from 'rxjs'
import { FileModel } from '@appDir/front-desk/documents/Models/FilesModel.Model';
@Component({
	selector: 'app-file-uploader-modal',
	templateUrl: './file-uploader-modal.component.html',
	styleUrls: ['./file-uploader-modal.component.scss']
})
export class FileUploaderModalComponent implements OnInit {

	form: FormGroup;
	disableBtn: boolean = false;
	files: any[] = []
	uploadFiles: any[] = []
	file: FileModel;
	editMode: boolean = false
	case_id: number;
	specialty_name: string
	speciality_id: number;
	appointment_location_id: string;
	visit_session_id:number;
	constructor(private fb: FormBuilder, private activeModal: NgbActiveModal, private toasterService: ToastrService, private requestService: RequestService) { }

	ngOnInit() {
		this.initForm()
		this.form.patchValue({
			case_id: this.case_id,
			specialty_name: this.specialty_name,
			speciality_id: this.speciality_id,
			visit_session_id:this.visit_session_id?this.visit_session_id:null
		})
		if (!this.editMode) {
			this.handleFiles()
			if (this.files.length == 1) {
				this.form.patchValue({ file_title: this.files[0].name })
				this.form.controls['file_title'].setValidators(Validators.required)
			}
		} else {
			this.form.patchValue({
				file_title: this.file.file_name,
				ext: this.file.ext,
				description: this.file.description,
				tags: this.file.tags
			})
		}
	}

	initForm() {
		this.form = this.fb.group({
			// file_title: ['', [Validators.required]],
			file_title: [''],
			tags: [[]],
			description: [''],
			ext: [''],
			case_id: [''],
			specialty_name: [''],
			speciality_id: [''],
			visit_session_id:[],
		});
	}
	handleFiles() {
		for (const file of this.files) {
			let ext = file.type.split('/');
			switch (ext[1] ? ext[1].toLocaleLowerCase() : '') {
				case 'jpg':
				case 'jpeg':
				case 'png':
				case 'pdf':

					const reader = new FileReader();
					reader.onload = this.handleReaderLoaded.bind(this);
					reader.readAsDataURL(file);
					break;
				default:
					this.toasterService.error(`Only files with extension JPG, JPEG, PNG or PDF are allowed.`);
					// this.activeModal.close()
					return;
			}
		}
	}
	handleReaderLoaded(e, id) {
		let reader = e.target;
		let imageSrc = reader.result;
		let filecode = imageSrc.split(',');
		imageSrc = filecode[1]
		let ext = filecode[0].split('/');
		let ext1 = ext[1].split(';')



		this.uploadFiles.push({ file: imageSrc, ext: ext1[0] })

	}
	close(val=false) { this.activeModal.close(val) }
	submitForm(form) {
		
		let tags = ''
		form.tags.forEach((tag, index) => tags = `${tags}${index != 0 ? ',' : ''}${tag.value}`)

		let $request = []

		this.uploadFiles.forEach((element, index) => {

			let formData = new FormData()
			formData.append('file', this.files[index])
			formData.append('file_title', this.uploadFiles.length == 1 ? form.file_title : this.files[index].name)
			formData.append('case_id', this.form.get('case_id').value)
			formData.append('specialty_name', this.form.get('specialty_name').value)
			formData.append('speciality_id', this.form.get('speciality_id').value)
			formData.append('appointment_location_id', this.appointment_location_id)
			formData.append('tags', tags)
			formData.append('description', form.description)			
			formData.append('visit_session_id', form.visit_session_id);
			let req = this.requestService.sendRequest(ManualSpecialitiesUrlEnum.uploadFile, 'post', REQUEST_SERVERS.document_mngr_api_path, formData)
			$request.push(req)
		})
		// let formData = new FormData()
		// formData.append('file', this.files[0]);
		// formData.append('file_title', this.form.get('file_title').value)
		// formData.append('case_id', this.form.get('case_id').value)
		// formData.append('specialty_name', this.form.get('specialty_name').value)
		// formData.append('speciality_id', this.form.get('speciality_id').value)
		this.disableBtn = true
		// console.log(formData.getAll('file'))

		zip(...$request).subscribe(data => {
			this.disableBtn = false
			this.toasterService.success('document uploaded successfully', 'Success')
			this.close(true)
		}, err => this.disableBtn = false)
		// this.requestService.sendRequest(ManualSpecialitiesUrlEnum.uploadFile, 'post', REQUEST_SERVERS.document_mngr_api_path, formData).subscribe(data => {
		//   this.disableBtn = false
		//   this.toasterService.success('document uploaded successfully', 'Success')
		//   this.close()
		// }, err => this.disableBtn = false)
	}

}
