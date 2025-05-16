import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
import { FDServices } from '../../services/fd-services.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
// import { AlertsService } from '@jaspero/ng-alerts';
import { Router, ActivatedRoute } from '@angular/router';
import { Config } from 'app/config/config';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-doctors-form',
  templateUrl: './doctors-form.component.html',
  styleUrls: ['./doctors-form.component.scss']
})
export class DoctorsFormComponent implements OnInit {

  form: FormGroup;
  public modules: any[];
  public specialities: any[];
  
  @Input() title: string = 'Edit';
  @Input() doctor: any;
  @ViewChild("placesRef") placesRef : GooglePlaceDirective;

  constructor(private fb: FormBuilder,private logger: Logger, private fd_services: FDServices,
    //  private _alert: AlertsService, 
     private router: Router, private route: ActivatedRoute,
    private config: Config, private toastrService: ToastrService
    ) { 
    this.setForm();
  }

  ngOnInit() {
    this.getSpecialities();
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
            'address': '',
            'city': '',
            'state': '',
            'zip': ''
          })
        }
  }



  ngOnChanges() {
    this.logger.log('user data:', this.doctor);
    if(this.doctor) {
      this.form.patchValue({
        'clinic_name': this.doctor.clinic_name,
        'first_name': this.doctor.first_name,
        'middle_name': this.doctor.middle_name,
        'last_name': this.doctor.last_name,
        // 'gender': this.doctor.gender,
        'ssn': this.doctor.ssn,
        'cell_phone_no': this.doctor.cell_phone_no,
        'fax': this.doctor.fax,
        'address': this.doctor.address,
        'city': this.doctor.city,
        'state': this.doctor.state,
        'zip': this.doctor.zip,
        'phone_extension': this.doctor.phone_extension,
        'speciality_id': this.doctor.speciality_id,
        'npi': this.doctor.npi,
        'URI': this.doctor.URI,
        'colorCode': this.doctor.colorCode,
        'doc_email': this.doctor.email,
        'id': this.doctor.id
      });
    }
  }

  setForm() {
    this.form = this.fb.group({
      'id': null,
      'clinic_name': ['', [Validators.required, Validators.maxLength(50)]],
      'first_name': ['', [Validators.required, Validators.maxLength(25)]],
      'middle_name': [''],
      'last_name': ['', [Validators.required, Validators.maxLength(25)]],
      'cell_phone_no': ['', [Validators.minLength(10)]],
      'phone_extension': ['', [Validators.minLength(1), Validators.maxLength(5)]],
      'doc_email': ['', [Validators.required, Validators.email]],
      'fax': ['', [Validators.required, Validators.minLength(10)]],
      'address': ['', [Validators.required]],
      'ssn': ['', [Validators.required, Validators.minLength(9)]],
      'city': [''],
      'state': [''],
      'zip': ['', [Validators.maxLength(5)]],			
      'npi': ['', [Validators.maxLength(20)]],
      'URI': [''],
      'colorCode': [''],
      'speciality_id': ['', [Validators.required]],
      // 'gender': ['', [Validators.required]],
    });

  }

  onSubmit(form) {
      this.logger.log(form);
      if(this.form.valid) {
        this.logger.log('valid')
        if(form.id == null) {
          this.addDoctor(form)
        } else {
          this.updateDoctor(form);
        }
      } else {
        this.logger.log('invalid')

        this.fd_services.touchAllFields(this.form);
      }
  }

  addDoctor(formData) {
    this.fd_services.addDoctor(formData).subscribe(res => {
      if(res.status) {
        // this._alert.create('success', res.message);
        this.router.navigate(['/front-desk/doctors'], { relativeTo: this.route.parent});
      } else{
        this.toastrService.error(res.errors, res.error);
      }
    }, err => {
      this.toastrService.error(err.errors, 'Error');
    })
  }

  updateDoctor(formData) {
    this.fd_services.updateDoctor(formData).subscribe(res => {
      if(res.status) {
          // this._alert.create('success', res.message);
          this.router.navigate(['/front-desk/doctors'], { relativeTo: this.route.parent});
      } else{
        this.toastrService.error(res.errors, res.message);
      }
    }, err => {
      this.toastrService.error(err.errors, 'Error');
    }) 
  }


  getSpecialities() {
    this.fd_services.getSpecialities().subscribe(res => {
      if(res.status) {
        this.specialities = res.data;
      }
    })
  }

  goBack() {
    this.router.navigate(['doctors'], {relativeTo:this.route.parent.parent.parent})
  }
}
