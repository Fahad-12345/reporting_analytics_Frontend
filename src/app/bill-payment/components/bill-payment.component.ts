import { Component, OnInit } from '@angular/core';
import { RequestService } from '@appDir/shared/services/request.service';
import { FormGroup, FormBuilder, Validators, NgModelGroup } from '@angular/forms';
@Component({
  selector: 'app-bill-main',
  templateUrl: './bill-payment.component.html',
  styleUrls: ['./bill-payment.component.scss']
})
export class BillingBulkComponent implements OnInit {

	changeTextBulk:boolean = false;
  constructor(private requestService: RequestService, private fb: FormBuilder,) {

  }

  ngOnInit() {
  }


  updateGenertePacket($event){
	  this.changeTextBulk = $event;
	debugger;
  }




}
