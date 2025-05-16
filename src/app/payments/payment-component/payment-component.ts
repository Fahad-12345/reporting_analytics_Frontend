import { Component, OnInit } from '@angular/core';
import { RequestService } from '@appDir/shared/services/request.service';


@Component({
  selector: 'app-payment',
  templateUrl: './payment-component.html',
  styleUrls: ['./payment-component.scss']
})
export class PaymentComponent implements OnInit {


  constructor(private requestService: RequestService) {

  }

  ngOnInit() {
   


  }

}
