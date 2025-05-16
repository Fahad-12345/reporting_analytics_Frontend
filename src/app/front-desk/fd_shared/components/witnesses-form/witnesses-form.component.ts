import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
import { FDServices } from '../../services/fd-services.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-witnesses-form',
  templateUrl: './witnesses-form.component.html',
})
export class WitnessesFormComponent implements OnInit {

  public form: FormGroup
  @Input() title = 'Edit'
  @Input() caseId: any;
  @Input() caseData: any
  @Input() injuryWitness: any;
  @Output() getCase = new EventEmitter()

  @Input() patientId: number;
  disableBtn = false
  constructor(private fb: FormBuilder, private route: ActivatedRoute, private logger: Logger, private fd_services: FDServices, private router: Router, private toastrService: ToastrService) {
    this.setForm()

  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    // ;
    if (changes && changes['injuryWitness']) {
      if (!this.fd_services.isEmpty(changes['injuryWitness'].currentValue)) {
        this.setValues()
      }
    }

    if (changes && changes['caseData']) {
      if (!this.fd_services.isEmpty(changes['caseData'].currentValue)) {
        this.patientId = this.caseData.patient.id
        this.form.patchValue({
          caseId: this.caseData.id,
          patientId: this.caseData.patient.id
        })
      }
    }
  }

  setValues() {
    this.form.patchValue({
      id: this.injuryWitness.id,
      firstName: this.injuryWitness.firstName,
      middleName: this.injuryWitness.middleName,
      lastName: this.injuryWitness.lastName,
      address: this.injuryWitness.address,
      lat: this.injuryWitness.lat,
      long: this.injuryWitness.long,
      city: this.injuryWitness.city,
      state: this.injuryWitness.state,
      zip: this.injuryWitness.zip,
      cellPhone: this.injuryWitness.cellPhone,
      injuryId: this.injuryWitness.injuryId,
      caseId: this.caseId,
      patientId: this.patientId
    })
  }

  setForm() {
    this.form = this.fb.group({
      id: null,
      firstName: ['', [Validators.required, Validators.maxLength(20)]],
      middleName: ['', [Validators.maxLength(20)]],
      lastName: ['', [Validators.required, Validators.maxLength(20)]],
      address: ['', [Validators.required]],
      lat: "",
      long: "",
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zip: ['', [Validators.required]],
      cellPhone: ['', [Validators.required, Validators.minLength(10)]],
      injuryId: 0,
      caseId: this.caseId,
      patientId: this.patientId
    });
  }

  onSubmit(form) {
    this.logger.log(form);
    if (this.form.valid) {
      this.disableBtn = true
      this.logger.log('form is valid')
      if (form.id == null) {
        this.add(form)
      } else {
        this.update(form)
      }
    } else {
      this.logger.log('form is invalid');
      this.fd_services.touchAllFields(this.form);
    }
  }

  add(form) {
    this.fd_services.addInjuryWitnesses(form).subscribe(res => {
      this.disableBtn = false
      if (res.statusCode == 200) {
        this.injuryWitness = res.data
        this.setValues()
        this.getCase.emit()
        this.toastrService.success('Witnesses Data Added Successfully', 'Success')
      } else {
        this.toastrService.error('Something went wrong', 'Error')
      }
    }, err => {
      this.disableBtn = false
      this.toastrService.error(err.error.error.message, 'Error')
    })
  }

  update(form) {
    this.fd_services.updateInjuryWitnesses(form).subscribe(res => {
      this.disableBtn = false
      if (res.statusCode == 200) {
        this.getCase.emit()
        this.toastrService.success('Successfully Updated', 'Success')
      } else {
        this.toastrService.error(res.error.message, 'Error')
      }
    }, err => {
      this.disableBtn = false
      this.toastrService.error(err.error.error.message, 'Error')
    })
  }

  public handleAddressChange(address: Address) {

    let street_number = this.fd_services.getComponentByType(address, "street_number");
    let route = this.fd_services.getComponentByType(address, "route");
    let city = this.fd_services.getComponentByType(address, "locality");
    let state = this.fd_services.getComponentByType(address, "administrative_area_level_1");
    let postal_code = this.fd_services.getComponentByType(address, "postal_code");
    let lat = address.geometry.location.lat();
    let lng = address.geometry.location.lng();

    if (street_number != null) {
      let address: any;
      address = street_number.long_name + ' ' + route.long_name

      this.form.patchValue({
        'address': address,
        'city': city.long_name,
        'state': state.long_name,
        'zip': postal_code.long_name,
        'lat': lat,
        'long': lng,
      })
    } else {
      this.form.patchValue({
        'address': "",
        'city': "",
        'state': "",
        'zip': "",
        'lat': "",
        'long': "",
      })
    }
  }

  goBack() {
    this.router.navigate(['injury'], { relativeTo: this.route.parent.parent.parent })
  }

}
