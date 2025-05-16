import { Component, OnInit, Input, SimpleChanges, OnChanges, ViewChild } from '@angular/core';
import { Logger } from '@nsalaun/ng-logger';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Address } from 'ngx-google-places-autocomplete/objects/address';

@Component({
  selector: 'app-insurance-master-form',
  templateUrl: './insurance-master-form.component.html',
  styleUrls: ['./insurance-master-form.component.scss']
})
export class InsuranceMasterFormComponent implements OnChanges {

  @Input() title: string;
  @Input() insurance: any;


  form: FormGroup;

  constructor(private logger: Logger, private fb: FormBuilder, private fd_services: FDServices, private route: ActivatedRoute, private router: Router, private toastrService: ToastrService) {
    this.setForm()
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes['insurance']) {
      if (!this.fd_services.isEmpty(changes['insurance']) && changes['insurance'].currentValue) {
        this.assignValues()
      }
    }
  }

  assignValues() {
    this.form.patchValue({
      id: this.insurance.id,
      name: this.insurance.name,
      address: this.insurance.address,
      email: this.insurance.email,
      fax: this.insurance.fax,
      city: this.insurance.city,
      state: this.insurance.state,
      zip: this.insurance.zip,
    })
  }

  setForm() {
    this.form = this.fb.group({
      id: null,
      name: ['', [Validators.required, Validators.maxLength(20)]],
      address: [''],
      email: ['', [Validators.email]],
      fax: ['', [Validators.maxLength(11)]],
      city: '',
      state: '',
      zip: '',
    })
  }

  public handleAddressChange(address: Address) {

    let street_number = this.fd_services.getComponentByType(address, "street_number");
    let route = this.fd_services.getComponentByType(address, "route");
    let city = this.fd_services.getComponentByType(address, "locality");
    let state = this.fd_services.getComponentByType(address, "administrative_area_level_1");
    let postal_code = this.fd_services.getComponentByType(address, "postal_code");

    if (street_number != null) {
      let address: any;
      address = street_number.long_name + ' ' + route.long_name
      this.form.patchValue({
        'address': address,
        'city': city.long_name,
        'state': state.long_name,
        'zip': postal_code.long_name
      })
    } else {
      this.form.patchValue({
        'city': '',
        'state': '',
        'zip': ''
      })
    }
  }

  onSubmit(form) {
    this.logger.log(form);
    if (this.form.valid) {
      this.logger.log('valid')
      if (form.id == null) {
        this.add(form)
      } else {
        this.update(form)
      }
    } else {
      this.logger.log('invalid')
      this.fd_services.touchAllFields(this.form);
    }
  }

  //Add Master Insurance
  add(form) {
    this.fd_services.add_insurance(form).subscribe(
      res => {
        if (res.status) {
          this.toastrService.success(res.message, 'Success')
        }
      },
      err => {
        this.toastrService.error(err.message, 'Error')
      }
    )
  }

  //update Master Insurance
  update(form) {
    this.fd_services.updated_insurance(form).subscribe(
      res => {
        if (res.status) {
          this.toastrService.success(res.message, 'Success')
        }
      },
      err => {
        this.toastrService.error(err.message, 'Error')
      }
    )
  }

  goBack() {
    this.router.navigate(['insurance'], { relativeTo: this.route.parent })
  }

}
