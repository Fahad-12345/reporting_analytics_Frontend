import { PaymentSplitListComponent } from './../../payment-split-listing/payment-split-listing.component';
import { Subject, Subscription } from 'rxjs';
import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild, OnDestroy, EventEmitter, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss']
})
export class PaymentFormComponent implements OnInit,OnChanges , OnDestroy {

	@Input() currentBill: any = {};
	@Input() selectedBill:any={};
	@Input () billType:any='';
	billIdFromPayment:any;
	@Input() removeEvent: Subject<any>;
	@Input() type = 'bill';
	@Input () bulkBills=[];
	addPayment: FormGroup;
	subscription: Subscription[] = [];
	@Output()  changePaymentData = new EventEmitter();
	@Output()  billListingRefreshOnPaymentAdd = new EventEmitter();
	@Output() moveToInvoiceTabEmitter = new EventEmitter();
 
	paymentSplitList : PaymentSplitListComponent;
	@ViewChild('paymentSplitList') set setEorList(content: PaymentSplitListComponent) {
	  if (content) { // initially setter gets called with undefined
		this.paymentSplitList = content;
	  }
	}


  constructor() { 
	}
  ngOnInit() {
	if(this.selectedBill['id']){
		this.billIdFromPayment=this.selectedBill['id']
	}
  }

  ngOnChanges(changes: SimpleChanges): void {
	// if (this.currentBill && Object.keys(this.currentBill).length > 0) {
	// 	let fileName = this.makeFileName(this.currentBill);
	// 	this.setFileName(fileName, this.addPayment, 'file_name');
	// }
  }

  changePaymentDataSplit($event){
	this.changePaymentData.emit($event);

  }


  moveToInvoiceTab(){
	if (this.currentBill && this.currentBill.invoice_id){
	this.moveToInvoiceTabEmitter.emit({invoice_id:this.currentBill.invoice_id});
	}
  }

  refreshBillListing($event){
	  this.billListingRefreshOnPaymentAdd.emit($event);
  }

   ngOnDestroy(): void {
	unSubAllPrevious(this.subscription);
	}
}
