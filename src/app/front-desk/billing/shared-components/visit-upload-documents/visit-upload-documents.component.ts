import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BillingService } from '../../service/billing.service';
import { ToastrService } from 'ngx-toastr';
import { RequestService } from '@appDir/shared/services/request.service';
import { BillingEnum } from '../../billing-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { zip } from 'rxjs'
@Component({
	selector: 'app-visit-upload-documents',
	templateUrl: './visit-upload-documents.component.html',
	styleUrls: ['./visit-upload-documents.component.scss']
})
export class VisitUploadDocumentsComponent implements OnInit, OnChanges {
	public uploadForm: FormGroup;
	constructor(private fb: FormBuilder, private billingService: BillingService, private toastrService: ToastrService, private requestService: RequestService) { }
	@Input() files;
	@Input() uploadFiles;
	@Input() folder;
	@Output() closeModal = new EventEmitter();
	@Output() startLoader=new EventEmitter();
	@Output() formSubmited = new EventEmitter();
	disableBtn: boolean = false
	start_Loader:boolean=false;
	@Input() shareVisitDesk;
	ngOnInit() {
		// this.initializeUploadDocument()
	}
	addnewtag: any
	onTextChange(event) {
		if (event) {
			let tags = this.uploadForm.get('tags').value
			let match = tags && tags.length > 0 ? tags.find(res => { event == res }) : ''
			!match ? this.addnewtag = event : this.addnewtag = ''
		}
	}
	_closeModal(file_name) {
		debugger;
		this.uploadForm.reset()
		this.closeModal.emit(file_name)
	}
	ngOnChanges(simpleChanges: SimpleChanges) {
		debugger;
		this.initializeUploadDocument();
		if (this.folder)
		this.uploadForm ? this.uploadForm.controls['folder_name'].setValue(this.folder && this.folder.folder_name ? this.folder.folder_name : '') : ''
		// this.uploadForm? this.uploadForm.controls
	}
	initializeUploadDocument() {
		this.uploadForm = this.fb.group({
			file_title: ['', Validators.required],
			tags: [''],
			folder_id: [''],
			folder_name: ['', Validators.required],
		})
		if (this.files.length > 1) {
			this.uploadForm.get('file_title').clearValidators()
		} else if (this.files.length == 1) {
			this.uploadForm.patchValue({ file_title: this.files[0].name })
		}
	}
	onSubmitUploadForm(form) {
		this.start_Loader=true;
		this.startLoader.emit(this.start_Loader);
		let formValue = this.uploadForm.getRawValue();
		var tagsStr = '';
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
		let $request = []
		this.disableBtn = true
		setTimeout(() => {
			this.uploadFiles.forEach((element, index) => {
				let formData = new FormData()
				formData.append('file', this.files[index]);
				debugger;
				// formData.append('file_title', this.uploadForm.get('file_title').value)
				formData.append('file_title', this.uploadFiles.length == 1 ? this.uploadForm.get('file_title').value : this.files[index].name)
				formData.append('folder_id', this.folder.id)
				formData.append('tags', this.addnewtag ? tagsStr = tagsStr ? tagsStr + ',' + this.addnewtag : this.addnewtag : tagsStr);
				formData.append('reference_id', this.shareVisitDesk.visit_session_id || this.shareVisitDesk.id);
				formData.append('case_id', this.shareVisitDesk.case_id);
				this.addnewtag = ''
				let req = this.requestService.sendRequest(BillingEnum.uploadFolder, 'POST', REQUEST_SERVERS.fd_api_url, formData)
				$request.push(req)
			})
			zip(...$request).subscribe(data => {
				this.start_Loader=false;
				this.startLoader.emit(this.start_Loader);
				this.disableBtn = false
				debugger;
				this._closeModal(this.uploadForm.get('file_title').value ? [this.uploadForm.get('file_title').value] : Object.values(this.files).map((file: any) => file.name))
				this.toastrService.success('Successfully Added', 'Success');
			}, err => {
				this.disableBtn = false
				this.start_Loader=false
				this.startLoader.emit(this.start_Loader)
			})
		}, 1000);
	}
}

