import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FieldConfig } from './../../models/fieldConfig.model';
import { FormGroup } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { changeDateFormat } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class InputComponent implements OnInit {

  // minDate: Date;
  // maxDate: Date;

  id: string;
  datePickerId: string;
  min: Date= new Date('1900/01/01');
  constructor() {
    this.id = uuidv4()
    this.datePickerId = uuidv4()

    // const currentYear = new Date().getFullYear();
    // const currentmonth = new Date().getMonth();
    // // const currentDay = new Date().getDay();
    // console.log('currentmonth', currentmonth)
    // // this.minDate = new Date(currentYear - 30, 0, 1);
    // this.maxDate = new Date(currentYear, currentmonth, 29);
  }

  field: FieldConfig;
  group: FormGroup;
  ngOnInit() {
  }

  getTimeFormat(date: Date) {
    if (date)
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
  }
  addEvent(a, b) {
    this.group.get(this.field.name).setValue(changeDateFormat(b.value), { emitEvent: false })
  }
  keyuprightarrow($event) {
    let value = $event.target.value
    if (value.length == 1) {
      $event.target.value = `0${value}:`
    }
  }
  changeValue($event) {
    let value = $event.target.value as string
    value = value.replace(/[^0-9]*/g, '');
    if (value.length > 2) {
      value = value.replace(':', '')
      value = `${value.substr(0, 2)}:${value.substr(2, 2)}`
      // this.group.patchValue({ [this.field.name]: value }, { emitEvent: false })
    }   // this.group.get(this.field.name).setValue(value)

    this.group.patchValue({ [this.field.name]: value }, { emitEvent: false })
  }
matDateInput(event:any){
  let minYear:string = event.target?.value?.split('/')[2]?.split('-')[0];
     console.log(minYear?.slice(0, 2));
     if(Number(minYear?.slice(0, 2)) < 19){
     return false;
    }
}
onFocusOut(event){
  let year = new Date(event.target.value)?.getFullYear();
  if(year < 1900){
    this.group.get(this.field.name).setValue(null);
  }
}
  onInputChange(value: string): void {
    const upperCaseValue = value?.toUpperCase() ?? '';
    this.group.get(this.field.name).setValue(upperCaseValue);
  }
  keyPress(event: any) {
    if(this.field?.configs?.isNumberOnly){
      const pattern = /[0-9\+\-\ ]/;
      let inputChar = String.fromCharCode(event.charCode);
  
          if (!pattern.test(inputChar) && event.charCode != '0') {
              event.preventDefault();
          }
    }
  
}
}
