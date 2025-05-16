import { Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { RequestService } from '@appDir/shared/services/request.service';
import { LoginInformationUrlEnums } from './login-information-urls.enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { generteRandomPassword } from '@appDir/shared/utils/utils.helpers';

@Component({
  selector: 'app-login-information',
  templateUrl: './login-information.component.html',
  styleUrls: ['./login-information.component.scss']
})
export class LoginInformationComponent implements OnInit {
  which_action;
  isValidPassword:boolean = false;
  constructor(private fb: FormBuilder, private requestService: RequestService, private router: ActivatedRoute, private toastrService: ToastrService) { }
  loginForm: FormGroup
  ngOnInit() {
    this.loginForm = this.fb.group({
      password: ['', Validators.required],
      password_confirmation: ['', Validators.required]
    })
    // console.log(this.router.snapshot.parent.id)
  }
  disableBtn: boolean = false;
  submit(form , action) {
    // this.disableBtn = true;

    if (action == 'submit') {
      this.disableBtn = true;
      this.requestService.sendRequest(LoginInformationUrlEnums.changeUserPassword, 'post', REQUEST_SERVERS.fd_api_url, {
        user_id: this.router.snapshot.parent.params['id'],
        new_password: form.password,
        new_password_confirmation: form.password_confirmation
      }).subscribe(data => {
        this.toastrService.success(data['message'], 'Success');
        this.disableBtn = false;

      })
    }
  }
  generatePassword() {
    // this.which_action = 'generate';
    // if (this.which_action == 'generate') {
      let randomPassword = generteRandomPassword(10);
      this.loginForm.patchValue({ password_confirmation: randomPassword, password: randomPassword });
    // }
  }

  passwordValid($event){

	this.isValidPassword= $event;
  }
  copyToClipBoard(inputElement) {

    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);

  }
  passwordToggle(elem) {
    if (!elem.value) {
      return;
    }
    if (elem.type == "password") {
      elem.type = "text"
    } else {
      elem.type = "password"
    }
  }

}
