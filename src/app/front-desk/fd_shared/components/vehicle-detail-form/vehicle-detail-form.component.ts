import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FDServices } from '../../services/fd-services.service';
import { Logger } from '@nsalaun/ng-logger';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-vehicle-detail-form',
  templateUrl: './vehicle-detail-form.component.html',
})
export class VehicleDetailFormComponent implements OnInit {

  public form: FormGroup
  @Input() title = 'Edit'
  @Input() caseId: number;
  @Input() accidentId: number;
  @Input() patientId: number;
  @Input() caseData: any;
  public vehicleNo: string = 'Vehicle 1'
  public colors: any[];
  @Input() vehicleData: any;
  @Output() getCase = new EventEmitter();
  private vehicleCount: number;
  public vehicles: any[] = []
  disableBtn = false

  constructor(private fb: FormBuilder, private logger: Logger, private route: ActivatedRoute, private fd_services: FDServices, private router: Router, private toastrService: ToastrService) {
    this.setForm()
  }

  ngOnInit() {
    this.colors = ['aqua', 'black', 'blue', 'fuchsia', 'gray', 'green', 'lime', 'maroon', 'navy', 'olive', 'orange', 'purple', 'red', 'silver', 'teal', 'white', 'yellow'];
  }

  ngOnChanges(changes: SimpleChanges) {
    // ;
    if (changes && changes['vehicleData']) {
      if (!this.fd_services.isEmpty(changes['vehicleData'].currentValue)) {
        this.patientId = this.caseData.patient.id
        this.setValues();
      }
    }

    if (changes && changes['caseData']) {
      if (!this.fd_services.isEmpty(changes['caseData'].currentValue)) {
        this.form.patchValue({
          patientId: this.caseData.patient.id,
          accidentId: this.caseData.accident.id
        })
        // 
        this.vehicleCount = this.caseData.accident.patientSituationsVehicles.accidentedVehicleCount
        this.countVehicle(this.vehicleCount)
      }
    }
  }

  setValues() {


    if (this.vehicleData != null) {
      this.form.patchValue({
        id: this.vehicleData.id,
        year: this.vehicleData.year,
        make: this.vehicleData.make,
        model: this.vehicleData.model,
        color: this.vehicleData.color,
        state: this.vehicleData.state,
        licensePlateNo: this.vehicleData.licensePlateNo,
        policyNumber: this.vehicleData.policyNumber,
        vehicleNo: this.vehicleData.vehicleNo,
        driverFirstName: this.vehicleData.driverFirstName,
        driverMiddleName: this.vehicleData.driverMiddleName,
        driverLastName: this.vehicleData.driverLastName,
        driverAddress: this.vehicleData.driverAddress,
        driverLat: this.vehicleData.driverLat,
        driverLong: this.vehicleData.driverLong,
        driverCity: this.vehicleData.driverCity,
        driverState: this.vehicleData.driverState,
        driverZip: this.vehicleData.driverZip,
        ownerFirstName: this.vehicleData.ownerFirstName,
        ownerMiddleName: this.vehicleData.ownerMiddleName,
        ownerLastName: this.vehicleData.ownerLastName,
        ownerAddress: this.vehicleData.ownerAddress,
        ownerLat: this.vehicleData.ownerLat,
        ownerLong: this.vehicleData.ownerLong,
        ownerCity: this.vehicleData.ownerCity,
        ownerState: this.vehicleData.ownerState,
        ownerZip: this.vehicleData.ownerZip,
        insuranceCompanyName: this.vehicleData.insuranceCompanyName,
        effectiveDate: this.vehicleData.effectiveDate != null ? this.vehicleData.effectiveDate.split('T')[0] : null,
        expirationDate: this.vehicleData.expirationDate != null ? this.vehicleData.expirationDate.split('T')[0] : null,
        accidentId: this.accidentId,
        patientId: this.patientId,
      })
    }
  }

  public countVehicle(value) {
    this.vehicles = [];
    for (var i = 1; i <= value; i++) {
      this.vehicles.push('Vehicle ' + i);
    }
  }


  setForm() {
    this.form = this.fb.group({
      id: null,
      year: ['', [Validators.maxLength(4)]],
      make: ['', [Validators.maxLength(20)]],
      model: ['', [Validators.maxLength(20)]],
      color: [''],
      state: [''],
      licensePlateNo: ['', [Validators.maxLength(7)]],
      policyNumber: ['', [Validators.maxLength(25)]],
      vehicleNo: this.vehicleNo,
      driverFirstName: ['', [Validators.maxLength(20)]],
      driverMiddleName: ['', [Validators.maxLength(20)]],
      driverLastName: ['', [Validators.maxLength(20)]],
      driverAddress: [''],
      driverLat: "",
      driverLong: "",
      driverCity: [''],
      driverState: [''],
      driverZip: [''],
      ownerFirstName: ['', [Validators.maxLength(20)]],
      ownerMiddleName: ['', [Validators.maxLength(20)]],
      ownerLastName: ['', [Validators.maxLength(20)]],
      ownerAddress: [''],
      ownerLat: "",
      ownerLong: "",
      ownerCity: [''],
      ownerState: [''],
      ownerZip: [''],
      insuranceCompanyName: [''],
      effectiveDate: '',
      expirationDate: '',
      accidentId: this.accidentId,
      patientId: this.patientId,
    });

    this.form.disable()
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
    this.fd_services.addVehicleInfosData(form).subscribe(res => {
      if (res.statusCode == 200) {
        this.form.markAsUntouched();
        this.form.markAsPristine();
        this.form.disable()
        this.disableBtn = false
        this.getCase.emit()
        this.toastrService.success('Vehicle Info Data Added Successfully', 'Success')
      } else {
        this.toastrService.error('Something went wrong', 'Error')
      }
    }, err => {
      this.disableBtn = false
      this.toastrService.error(err.error.error.message, 'Error')

    })
  }

  update(form) {
    this.fd_services.updateVehicleInfosData(form).subscribe(res => {
      if (res.statusCode == 200) {
        this.form.markAsUntouched();
        this.form.markAsPristine();
        this.form.disable()
        this.disableBtn = false
        this.getCase.emit()
        this.toastrService.success('Vehicle Info Data Updated Successfully', 'Success')
      } else {
        this.toastrService.error(res.error.message, 'Error')
      }
    }, err => {
      this.disableBtn = false
      this.toastrService.error(err.error.error.message, 'Error')

    })
  }
  public handleAddressChange(address: Address, type: string) {

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
        [type + 'Address']: address,
        [type + 'City']: city.long_name,
        [type + 'State']: state.long_name,
        [type + 'Zip']: postal_code.long_name,
        [type + 'Lat']: lat,
        [type + 'Long']: lng
      })
    } else {
      this.form.patchValue({
        [type + 'Address']: '',
        [type + 'City']: '',
        [type + 'State']: '',
        [type + 'Zip']: '',
        [type + 'Lat']: '',
        [type + 'Long']: ''
      })
    }
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  goBack() {
    this.router.navigate(['vehicles'], { relativeTo: this.route.parent.parent.parent })
  }
}
