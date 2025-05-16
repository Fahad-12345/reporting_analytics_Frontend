import { Component, HostListener, OnInit } from '@angular/core';
import { FieldConfig } from '../../models/fieldConfig.model';
import { FormGroup } from '@angular/forms';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { v4 as uuidv4 } from 'uuid'
@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit  {

  id: string;
  constructor() {
    this.id = uuidv4()
  }
  field: FieldConfig;
  group: FormGroup;
  ngOnInit() {
  }
  handleAddressChange(event) {
    this.field.onSubmit(event)
  }
  @HostListener('window:wheel',['$event'])
  onScroll(event:WheelEvent){
    const inputField=document.getElementById(this.id);
    inputField.blur();
  }
  handInputfield(){
    let element:any=document.querySelectorAll('.accident-google-places > .form-group');
    if(element){
      let ele:any=document.querySelectorAll('.pac-container');
      if(ele.length>0 && element.length>0){
        element[0].appendChild(ele[ele.length-1])
      }
    }
  }
}
