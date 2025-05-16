import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class InvoiceService {
	public reloadInvoice = new BehaviorSubject(0);
	public bill_ids: any;
	constructor() {}

	pushReloadInvoice(status: any) {
		this.bill_ids = status;
		this.reloadInvoice.next(status);
	}

	pullReloadInvoice() {
		return this.reloadInvoice.asObservable();
	}

	private _invoiceId = new BehaviorSubject<any>(null);
	public invoiceId = this._invoiceId.asObservable();
	getInvoiceId(invoice: any) {
		this._invoiceId.next(invoice);
	}
	
	private _newInvoice = new BehaviorSubject<any>({ status: false });
	public newInvoice = this._newInvoice.asObservable();
	getInvoice(invoice: any) {
		this._newInvoice.next(invoice);
	}
}
