import { Component, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
import { FDServices } from '../../services/fd-services.service';

@Component({
  selector: 'app-advertisement-form',
  templateUrl: './advertisement-form.component.html',
})
export class AdvertisementFormComponent implements OnInit {

  public form: FormGroup
  public caseId: any;
  public advertisments: FormArray;
  public allAds: any[];

  constructor(private fb: FormBuilder, private logger: Logger, private fd_services: FDServices) {
      this.setForm()
      this.getAdvertisments()
  }
  
  ngOnInit() {
  }


  setForm() {
      this.form = this.fb.group({
        id: null,
        advertisments: this.fb.array([ this.createAdvertisement() ]),
        caseId: this.caseId
      });
  }

  createAdvertisement() : FormGroup {
    return this.fb.group({
      id: '',
      description: ''
    })
  }

  addReferral() : void {
      this.advertisments = this.form.get('advertisments') as FormArray;
      this.advertisments.push(this.createAdvertisement());
  }

  getAdvertisments() : void {
    this.fd_services.getAdvertisements().subscribe(res => {
      if(res.statusCode == 200) {
        this.allAds = res.data;
      }
    })
  }

  onSubmit(form) {
    this.logger.log(form);
    if(this.form.valid) {
      this.logger.log('form is valid')
    } else {
      this.logger.log('form is invalid');
      this.fd_services.touchAllFields(this.form);
    }
  }


}
