import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldConfig } from './../../models/fieldConfig.model';

@Component({
  selector: 'app-div',
  templateUrl: './div.component.html',
  styleUrls: ['./div.component.css']
})
export class DivComponent implements OnInit {

  constructor() { }
  group: FormGroup;
  field: FieldConfig;
  formGroupName = ""
  ngOnInit() {

    //in case of nested forms
    this.formGroupName = this.field && this.field.configs && this.field.configs.formControlName ? this.field.configs.formControlName : null
  }

}
