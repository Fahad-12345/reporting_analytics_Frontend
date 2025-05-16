import { Component, OnInit } from '@angular/core';
import { FieldConfig } from './../../models/fieldConfig.model';
import { FormGroup } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid'
@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.css']
})
export class SelectComponent implements OnInit {

  id: string;
  selectedField:string = '';

  constructor() {
    this.id = uuidv4()
  }

  field: FieldConfig;
  group: FormGroup;
  ngOnInit() {
  }

  reset() {
    ;
    // this.field.
    this.group.controls[this.field.name].reset({}, { emitEvent: false })
  }

  removeData(){
	  if (this.field.disabled){
		  return;
	  }
	this.group.get(this.field.name).reset();
  }

  fieldChange($event) {
	if ($event && $event.selectedIndex){
		this.selectedField = this.field.options[$event.selectedIndex-1].label;
	}
  else{
    this.selectedField=$event.fullName;
  }
 }

}
