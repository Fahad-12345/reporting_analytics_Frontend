import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RequestService } from '@appDir/shared/services/request.service';
import { LoginInformationComponent } from '../login-information.component';
import { LoginInformationUrlEnums } from '../login-information-urls.enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Router, ActivatedRoute } from '@angular/router';
import { LogInUrlsEnum } from '@appDir/pages/content-pages/login/logIn-Urls-Enum';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { isEmptyObject } from '@appDir/shared/utils/utils.helpers';

@Component({
	selector: 'app-confirm-password-modal',
	templateUrl: './confirm-password-modal.component.html',
	styleUrls: ['./confirm-password-modal.component.scss']
})
export class ConfirmPasswordModalComponent implements OnInit {

	constructor(private modal: NgbActiveModal, private fb: FormBuilder, private requestService: RequestService, private storageData: StorageData) { }

	form: FormGroup
	ngOnInit() {
		this.form = this.fb.group({
			email: [''],
			password: ['' , Validators.required]
		})
		this.form.patchValue({
			email: this.storageData.getEmail()
		})
	}
	disableBtn: boolean = false;
	submit(form) {
		this.disableBtn = true;
		this.requestService.sendRequest(LogInUrlsEnum.LogIn_POST, 'post', REQUEST_SERVERS.fd_api_url, {
			...this.form.value
		}).subscribe(res => {
			this.disableBtn = false;
			this.modal.close(true)
		}, err => {
			this.disableBtn = false;
			// this.close()
		})
	}

	close() {
		this.modal.close(false)

	}
	checkInputs() {
		if (isEmptyObject(this.form.value)) {
			return true;
		  }
		  return false;
	}
}
