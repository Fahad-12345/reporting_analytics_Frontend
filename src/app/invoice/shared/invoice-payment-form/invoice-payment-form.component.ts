import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { PaymentSplitListComponent } from '@appDir/payments/shared/payment-split-listing/payment-split-listing.component';

@Component({
  selector: 'app-invoice-payment-form',
  templateUrl: './invoice-payment-form.component.html',
  styleUrls: ['./invoice-payment-form.component.scss']
})
export class InvoicePaymentFormComponent implements OnInit {
  @Input() currentInvoice: any = {};
  paymentSplitList : PaymentSplitListComponent;
  @ViewChild('paymentSplitList') set setEorList(content: PaymentSplitListComponent) {
	if (content) { // initially setter gets called with undefined
	  this.paymentSplitList = content;
	}
  }
  constructor() { }

  ngOnInit() {
  }
}
