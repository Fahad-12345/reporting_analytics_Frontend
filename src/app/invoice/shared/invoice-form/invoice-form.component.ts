import { Component, OnInit, ViewChild } from '@angular/core';
import { InvoiceSplitListingComponent } from '../invoice-split-listing/invoice-split-listing.component';

@Component({
  selector: 'app-invoice-form',
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.scss']
})
export class InvoiceFormComponent implements OnInit {
  invoiceSplitListing : InvoiceSplitListingComponent;
	@ViewChild('invoiceSplitListing') set setInvoiceListing(content: InvoiceSplitListingComponent) {
	  if (content) { // initially setter gets called with undefined
		this.invoiceSplitListing = content;
	  }
	}
  constructor() { }

  ngOnInit() {
  }

}
