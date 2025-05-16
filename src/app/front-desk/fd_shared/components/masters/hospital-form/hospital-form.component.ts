import { Component, OnInit, ViewChild, Input, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Logger } from '@nsalaun/ng-logger';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-hospital-form',
  templateUrl: './hospital-form.component.html',
  styleUrls: ['./hospital-form.component.scss']
})
export class HospitalFormComponent implements OnChanges {

  form: FormGroup
  @ViewChild("placesRef") placesRef : GooglePlaceDirective;
  dayListItems: any[] = []
  facilityTypes: any[] = []
  @Input() title: any;
  @Input() hospital: any;
  areas = []
  constructor(private titleService: Title, private fb: FormBuilder, private fd_services: FDServices, private route: ActivatedRoute, private logger: Logger, private modalService: NgbModal, private router: Router,
    private toastrService: ToastrService) {
    this.setForm()
 }

ngOnInit() {
  this.titleService.setTitle(this.route.snapshot.data['title']);
  this.getDayList()
  this.getFacilityTypes()
  // this.logger.log('dayList', this.dayListItems)
}

ngOnChanges(changes: SimpleChanges) {
  if(changes && changes['hospital']) {
    if(!this.fd_services.isEmpty(changes['hospital'].currentValue)) {
      this.setValues()
    }
  }
}

setValues() {
  this.form.patchValue({
    id: this.hospital.id,
    name: this.hospital.name,
    address: this.hospital.address,
    area: this.hospital.area,
    city: this.hospital.city,
    state: this.hospital.state,
    zip: this.hospital.zip,
    lat: this.hospital.lat,
    long: this.hospital.long,
    facilityTypeId: this.hospital.facilityTypeId,
    // dayList: this.hospital
  })

  let dayList = this.hospital.dayList 
  for(var i = 0; i < dayList.length; i++) {

  }
}

getDayList() {
  this.dayListItems = [
    {
      value: 1,
      display: 'Monday'
    },
    {
      value: 2,
      display: 'Tuesday'
    },
    {
      value: 3,
      display: 'Wednesday'
    },
    {
      value: 4,
      display: 'Thursday'
    },
    {
      value: 5,
      display: 'Friday'
    },
    {
      value: 6,
      display: 'Saturday'
    },
    {
      value: 7,
      display: 'Sunday'
    }
  ]
}


setForm() {
  this.form = this.fb.group({
    id: null,
    name: ['', [Validators.required, Validators.maxLength(50)]],
    address: ['', [Validators.required]],
    area: '',
    city: '',
    state: '',
    zip: '',
    lat: '',
    long: '',
    facilityTypeId: '',
    dayList: ''
  });
}

onItemAdded(ev) {
  // this.logger.log(ev)
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

  onSubmit(form) {
    this.logger.log('form', form)
    if(this.form.valid) {
      this.logger.log('form is valid')
      let dayList = []
      if(form.dayList != '') {
        form.dayList.forEach((element, index) => {
          dayList.push(element.value)

          if(form.dayList.length-1 == index) {
            form.dayList = dayList 
            if(form.id == null) {
             this.add(form)
            } else {
              this.update(form)
            }
          }
        });
      }
    
    } else {
      this.logger.log('form is invalid')
      this.fd_services.touchAllFields(this.form)
    }
  }

  add(form) {
    this.fd_services.addFacility(form).subscribe(res => {
      this.toastrService.success(res.message, 'Success')
      this.router.navigate(['hospitals'], { relativeTo: this.route.parent.parent});
    }, err => {
      this.toastrService.error(err.message, 'Error')
    })
  }

  update(form) {
    this.fd_services.updateFacility(form).subscribe(res => {
      this.toastrService.success(res.message, 'Success')
    }, err => {
      this.toastrService.error(err.message, 'Error')
    })
  }


  goBack() {
    this.router.navigate(['hospitals'], { relativeTo: this.route.parent.parent})
  }

  getFacilityTypes() {
    this.fd_services.getFacilityTypes().subscribe(res => {
      this.facilityTypes = res.data
    }, err => {
      this.toastrService.error(err.message, 'Error')
    })
  }

  getAreas() {
    this.fd_services.getAreas().subscribe(res => {
      this.areas = res.data
    }, err => {
      this.toastrService.error(err.error.message, 'Error')
    })
  }
  
}
