import { Component, OnInit, Input, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { FDServices } from 'app/front-desk/fd_shared/services/fd-services.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { Logger } from '@nsalaun/ng-logger';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';

@Component({
  selector: 'app-attorney-master-form',
  templateUrl: './attorney-master-form.component.html',
  styleUrls: ['./attorney-master-form.component.scss']
})
export class AttorneyMasterFormComponent implements OnChanges {

  @Input() title: string;
  @Input() attorney: any;

  form: FormGroup;
  public modules: any[];
  public roles: any[];
  @ViewChild("placesRef") placesRef : GooglePlaceDirective;

  constructor(private logger: Logger, private fb: FormBuilder, private fd_services: FDServices, private route: ActivatedRoute, private router: Router,
     private toastrService: ToastrService) { 
    this.setForm()
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes && changes['attorney']) {
      if(!this.fd_services.isEmpty(changes['attorney']) && changes['attorney'].currentValue) {
        this.assignValues()
      }
    }
  }

  assignValues() {
    this.form.patchValue({
      'id': this.attorney.id,
      'title': this.attorney.title,
      'email1': this.attorney.email1,
      'email2': this.attorney.email2,
      'first_name': this.attorney.first_name,
      'middle_name': this.attorney.middle_name,
      'last_name': this.attorney.last_name,
      'firm_name': this.attorney.firm_name,
      'address': this.attorney.address,
      'apartment': this.attorney.apartment,
      'city': this.attorney.state,
      'state': this.attorney.state,
      'zip': this.attorney.zip,
      'lat': this.attorney.lat,
      'lng': this.attorney.lng,
      'licenseNo': this.attorney.licenseNo,			
      'fax': this.attorney.fax,
      'workFax': this.attorney.workFax,
      'personalPhone': this.attorney.personalPhone,
      'homePhone': this.attorney.homePhone,
      'workPhone': this.attorney.workPhone,
    })
  }

  setForm() {
    this.form = this.fb.group({
      'id': null,
      'title': '',
      'email1': ['', [Validators.required, Validators.email]],
      'email2': ['', [Validators.email]],
      'first_name': ['', [Validators.required, Validators.maxLength(25)]],
      'middle_name': [''],
      'last_name': ['', [Validators.required, Validators.maxLength(25)]],
      'firm_name': ['', [Validators.maxLength(50)]],
      'address': [''],
      'apartment': ['', [Validators.maxLength(20)]],
      'city': [''],
      'state': [''],
      'zip': [''],
      'lat': '',
      'lng': '',
      'licenseNo': ['', [Validators.maxLength(7)]],			
      'fax': ['', [Validators.minLength(10)]],
      'workFax': ['', [Validators.minLength(10)]],
      'personalPhone': ['', [Validators.minLength(10)]],
      'homePhone': ['', [Validators.minLength(10)]],
      'workPhone': ['', [Validators.minLength(10)]],
    })
  }


  public handleAddressChange(address: Address) {

    let street_number = this.fd_services.getComponentByType(address,"street_number");
    let route = this.fd_services.getComponentByType(address,"route");
    let city = this.fd_services.getComponentByType(address,"locality");
    let state = this.fd_services.getComponentByType(address,"administrative_area_level_1");
    let postal_code = this.fd_services.getComponentByType(address,"postal_code");

    if(street_number != null) {
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
    if(this.form.valid) {
      this.logger.log('valid')
      if(form.id == null) {
        this.add(form)
      } else {
        this.update(form)
      }
    } else {
      this.logger.log('invalid')
      this.fd_services.touchAllFields(this.form);
    }
  }

  add(form) {
    this.fd_services.addMastertorney(form).subscribe(
      res => {
          if(res.status) {
            this.toastrService.success(res.message, 'Success')
          }
      },
      err => {
        this.toastrService.error(err.message, 'Error')
      }
    )
  }

  //updateMastertorney
  update(form) {
    this.fd_services.updateMastertorney(form).subscribe(
      res => {
          if(res.status) {
            this.toastrService.success(res.message, 'Success')
          }
      },
      err => {
        this.toastrService.error(err.message, 'Error')
      }
    )
  }

  goBack() {
    this.router.navigate(['attorney-list'], { relativeTo: this.route.parent})
  }

}
