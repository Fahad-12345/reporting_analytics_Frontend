import { Component, OnInit } from '@angular/core';
import { RequestService } from '@appDir/shared/services/request.service';
import { FormGroup, FormBuilder, Validators, NgModelGroup } from '@angular/forms';
@Component({
  selector: 'app-bill-main',
  templateUrl: './bill-specality.component.html',
  styleUrls: ['./bill-specality.component.scss']
})
export class BillingSpecalityComponent implements OnInit {


  constructor(private requestService: RequestService, private fb: FormBuilder,) {

  }

  ngOnInit() {
  }





}
