import { Component, OnInit } from '@angular/core';
import { FieldConfig } from './../../models/fieldConfig.model';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css']
})
export class ButtonComponent implements OnInit {

  constructor() { }

  field: FieldConfig;
  group: FormGroup;
  ngOnInit() {
  }

}
