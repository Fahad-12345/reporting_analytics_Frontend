import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldConfig } from './../../models/fieldConfig.model';
import { v4 as uuidv4 } from 'uuid'
@Component({
  selector: 'app-radiobutton',
  templateUrl: './radiobutton.component.html',
  styleUrls: ['./radiobutton.component.css']
})
export class RadiobuttonComponent implements OnInit {

  id: string;
  constructor() {
    this.id = uuidv4()
  }
  field: FieldConfig;
  group: FormGroup;
  ngOnInit() {
  }

}
