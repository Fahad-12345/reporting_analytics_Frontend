import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from "@angular/router";
import { NgProgress } from 'ngx-progressbar';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { ForgotPasswordUrlEnum } from './ForgotPasswordUrlEnums';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  form: FormGroup;
  token: string;
  passwordReset: boolean = false;
  constructor(
    public ngProgress: NgProgress,
    protected requestService: RequestService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.token = route.snapshot.queryParams.token
  }
  ngOnInit() {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm_password: ['', [Validators.required, Validators.minLength(8)]]
    })
  }

  onSubmit() {

    if (this.form.valid) {
      let form = this.form.value
      this.requestService.sendRequest(ForgotPasswordUrlEnum.ResetPassword, 'post', REQUEST_SERVERS.fd_api_url, {
        new_password: form.password,
        new_password_confirmation: form.confirm_password,
        token: this.token
      }).subscribe(data => this.passwordReset = true)
    } else {
      this.form.markAsTouched()
    }
  }
}
