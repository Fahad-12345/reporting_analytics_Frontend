import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BillingEnum } from '@appDir/front-desk/billing/billing-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { getExtentionOfFile } from '@appDir/shared/utils/utils.helpers';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { StorageData } from '../login/user.class';

@Component({
	selector: 'app-bill-file-upload',
	templateUrl: './bill-file-upload.component.html',
	styleUrls: ['./bill-file-upload.component.scss'],
})
export class BillFileUploadComponent implements OnInit {
	billFileUploadForm: FormGroup;
	subscription: Subscription[] = [];
	fileToUpload: File = null;
  @ViewChild('pFile') pFile: ElementRef;
	constructor(
		private requestService: RequestService,
		private toastrService: ToastrService,
		private storageData: StorageData,
	) {}

	ngOnInit() {
		this.billFileUploadForm = new FormGroup({
			bill_file: new FormControl(null, [Validators.required]),
			file_id: new FormControl(null, [Validators.required]),
		});
	}

	handleFileInput(files: FileList) {
		if (files.length > 0) {
			if (getExtentionOfFile(files.item(0).name) == '.pdf') {
				this.fileToUpload = files.item(0);
        this.billFileUploadForm.patchValue({bill_file: this.fileToUpload}, {emitEvent: false});
			} else {
        this.billFileUploadForm.patchValue({bill_file: null}, {emitEvent: false});
				this.toastrService.error('Please select  pdf file');
			}
		}
	}

	onSubmit() {
		if (this.billFileUploadForm.valid) {
			let formData = new FormData();
			formData.append('bill_file', this.fileToUpload);
			formData.append('file_id', this.billFileUploadForm.getRawValue()['file_id']);
			const apiUrl = `${BillingEnum.billFileUploadForCitimed}?token=${this.storageData.getToken()}`;
			this.subscription.push(
				this.requestService
					.sendRequest(apiUrl, 'POST', REQUEST_SERVERS.fd_api_url, formData)
					.subscribe(
						(comingData: any) => {
							if (comingData['previous_object']  || comingData['new_url']) {
                this.toastrService.success('Form successfully submitted!');
                this.billFileUploadForm.reset();
                this.fileToUpload = null;
                this.pFile.nativeElement.value = null;
							}
						},
						(err) => {
							return false;
						},
					),
			);
		}else{
      this.toastrService.error('Please fill the all required fields!');
    }
	}
}
