import { Component, OnInit } from '@angular/core';
import { FieldConfig } from './../../models/fieldConfig.model';
import { FormGroup } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid'
@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.css']
})
export class CheckboxComponent implements OnInit {

  constructor() {
    this.id = uuidv4()
  }

  id: string;
  field: FieldConfig;
  group: FormGroup;
  ngOnInit() {
  }

}
