import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BillingInsuranceModel } from '../models/BillingInsurance.Model';

@Injectable({
	providedIn: 'root',
})
export class BillingInsuranceDataServiceService {
	constructor() {}

	private billingInsurance: BillingInsuranceModel = null;

	setBillingInsurance(billingInsurance: BillingInsuranceModel) {
		this.billingInsurance = billingInsurance;
	}

	getCurrentBillingInsurance() {
		var billingInsurance = this.billingInsurance;
		this.billingInsurance = null;
		return billingInsurance;
	}
}
