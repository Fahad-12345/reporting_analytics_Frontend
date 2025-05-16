import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FDServices } from 'app/front-desk/fd_shared/services/fd-services.service';
import { Logger } from '@nsalaun/ng-logger';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-provider-form',
  templateUrl: './provider-form.component.html',
  styleUrls: ['./provider-form.component.scss']
})
export class ProviderFormComponent implements OnChanges {

  @Input() provider: any;
  @Input() title: string;
  
  public form: FormGroup

  constructor(private logger: Logger,private router: Router, private route: ActivatedRoute, private toastrService: ToastrService, private fd_services: FDServices, private fb: FormBuilder) { 
    this.form = this.fb.group({
      id: null,
      name: ['', [Validators.required]]
    })
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes && changes['provider']) {
      if(changes['provider'].currentValue) {
        this.assignValues()
      }
    }
  }

  assignValues() {
    this.form.patchValue({
      id: this.provider.id,
      name: this.provider.name
    })
  }

  onSubmit(form) {
    if(form.valid) {
      this.logger.log('valid')
      if(form.id == null) {
        this.add(form)
      } else {
        this.update(form)
      }
    } else {
      this.logger.log('invalid')
      this.fd_services.touchAllFields(this.form)
    }
  }

  add(form) {
    this.fd_services.addProvider(form).subscribe(res => {
      this.toastrService.success(res.message, 'Success')
    }, err => {
      this.toastrService.error(err.message, 'Error')
    })
  }

  update(form) {
    this.fd_services.updateProvider(form).subscribe(res => {
      this.toastrService.success(res.message, 'Success')
    }, err => {
      this.toastrService.error(err.message, 'Error')
    })
  }

  goBack() {
    this.router.navigate(['providers'], { relativeTo: this.route.parent})
  }

}
