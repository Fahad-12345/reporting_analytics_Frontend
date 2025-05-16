import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CheckBoxModel} from '@appDir/medical-doctor/referal-forms/models/referral-forms-models';
import {FormBuilder, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-dynamic-radiobuttons',
  templateUrl: './dynamic-radiobuttons.component.html',
  styleUrls: ['./dynamic-radiobuttons.component.scss']
})
export class DynamicRadiobuttonsComponent implements OnInit {

  @Input() checkBoxesData: CheckBoxModel[];
  @Input() fieldName: string;
  @Input() selectedValue: string;
  @Input() isDisabled?: string = '';
  @Output() emitSelectedCheckBoxes: EventEmitter<any> = new EventEmitter();
  checkboxGroup: FormGroup;

  constructor(public fb: FormBuilder) {}

  ngOnInit() {
  /*  console.log(this.selectedValue);
    console.log(this.isDisabled);
    console.log(this.checkBoxesData);*/
    this.checkboxGroup = this.fb.group({
       [this.fieldName]: [this.selectedValue.toString() || ''],
     // [this.fieldName]: {value: 'Male'},
    })
    this.emitData();
    this.checkboxGroup.valueChanges.subscribe((res) => {
      this.emitData();
    });
  }

  emitData() {
    const data = this.checkboxGroup.getRawValue();
  //  console.log(data[this.fieldName]);
    this.emitSelectedCheckBoxes.emit(data[this.fieldName]);
  }

}
