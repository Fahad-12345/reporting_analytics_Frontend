import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
import { FDServices } from '../../services/fd-services.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-treatment-doctors-form',
  templateUrl: './treatment-doctors-form.component.html',
})
export class TreatmentDoctorsFormComponent implements OnChanges {

  public form: FormGroup
  @Input() title = 'Edit'
  @Input() caseId: any;
  @Input() caseData: any;
  @Input() otherTreatments: any;
  @Output() getCase = new EventEmitter()

  private patientId: any;
  private doctorType = 'Current'
  disableBtn = false
  constructor(private fb: FormBuilder, private logger: Logger, private route: ActivatedRoute, private fd_services: FDServices, private router: Router, private toastrService: ToastrService) {
      this.setForm()
  }
  
  ngOnInit() {
    if(this.caseId) {
      this.form.patchValue({ caseId: this.caseId})
    }

  }

  ngOnChanges(changes: SimpleChanges) {
    // ;
    if(changes && changes['otherTreatments']) {
      if(!this.fd_services.isEmpty(changes['otherTreatments'].currentValue)) {
        this.patientId = this.caseData.patient.id
        this.setValues();
      }      
    }

    if(changes && changes['caseData']) {
      if(!this.fd_services.isEmpty(changes['caseData'].currentValue)) {
        this.form.patchValue({ patientId: this.caseData.patient.id })
      }
    }
  }

  setValues() {
      this.form.patchValue({
        id: this.otherTreatments.id,
        firstName: this.otherTreatments.firstName,
        lastName: this.otherTreatments.lastName,
        doctorType: this.doctorType,
        street: this.otherTreatments.street,
        lat: this.otherTreatments.lat,
        lng: this.otherTreatments.lng,
        apartment: this.otherTreatments.apartment,
        city: this.otherTreatments.city,
        state: this.otherTreatments.state,
        zip: this.otherTreatments.zip,
        cellPhone: this.otherTreatments.cellPhone,
        caseId: this.caseId,
        patientId: this.patientId
      })
  }

  setForm() {
      this.form = this.fb.group({
        id: null,
        firstName: ['', [Validators.required, Validators.maxLength(20)]],
        lastName: ['', [Validators.required, Validators.maxLength(20)]],
        doctorType: this.doctorType,
        street: ['', [Validators.required]],
        lat: "",
        lng: "",
        apartment: ['', [Validators.required]],
        city: ['', [Validators.required]],
        state: ['', [Validators.required]],
        zip: ['', [Validators.required]],
        cellPhone: ['', [Validators.required, Validators.minLength(10)]],
        caseId: this.caseId,
        patientId: this.patientId
      });
  }

  onSubmit(form) {
    this.logger.log(form);
    if(this.form.valid) {
      this.disableBtn = true
      this.logger.log('form is valid')
      if(form.id == null) {
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
    this.fd_services.addOtherTreatmentDoctors(form).subscribe(res =>  {
      this.disableBtn = false
      if(res.statusCode == 200) {
        this.otherTreatments = res.data
        this.setValues();
        this.getCase.emit()
        this.toastrService.success('Data Added Successfully', 'Success')
      } else {
        this.toastrService.error('Something went wrong', 'Error')
      }
    }, err =>  {
      this.disableBtn = false
      this.toastrService.error(err.error.error.message, 'Error')
    })
  }

  update(form) {
    this.fd_services.updateOtherTreatmentDoctors(form).subscribe(res =>  {
      this.disableBtn = false
      if(res.statusCode == 200) {
        this.getCase.emit()
        this.toastrService.success('Data Updated Successfully', 'Success')
      } else {
        this.disableBtn = false
        this.toastrService.error(res.error.message, 'Error')
      }
    })
  }
  public handleAddressChange(address: Address) {

      let street_number = this.fd_services.getComponentByType(address,"street_number");
      let route = this.fd_services.getComponentByType(address,"route");
      let city = this.fd_services.getComponentByType(address,"locality");
      let state = this.fd_services.getComponentByType(address,"administrative_area_level_1");
      let postal_code = this.fd_services.getComponentByType(address,"postal_code");
      let lat = address.geometry.location.lat();
      let lng = address.geometry.location.lng();

      if(street_number != null) {
        let address: any;
        address = street_number.long_name + ' ' + route.long_name
        
        this.form.patchValue({
            'street': address,
            'city': city.long_name,
            'state': state.long_name,
            'zip': postal_code.long_name,
            'lat': lat,
            'lng': lng,
          })
        } else {
          this.form.patchValue({
            'street': "",
            'city': "",
            'state': "",
            'zip': "",
            'lat': "",
            'lng': "",
          })
        }
    }
    
 goBack() {
      this.router.navigate(['injury'],  { relativeTo: this.route.parent.parent.parent})
  }

}
