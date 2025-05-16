import { Component, OnInit } from '@angular/core';
import { RequestService } from '@appDir/shared/services/request.service';
import { FormGroup, FormBuilder, Validators, NgModelGroup } from '@angular/forms';
@Component({
  selector: 'app-bill-visit',
  templateUrl: './bill-vists.component.html',
  styleUrls: ['./bill-vists.component.scss']
})
export class BillingVisitComponent implements OnInit {


  constructor(private requestService: RequestService, private fb: FormBuilder,) {

  }

  ngOnInit() {
  }





}
