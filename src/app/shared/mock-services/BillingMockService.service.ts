import { Observable, throwError } from 'rxjs';
import { of } from 'rxjs';

export class BillingMockService {
	Mock_billingResp = [
		{
			status:true
		}
	]
	getListOfSpecialityBill(value?): Observable<any> {
		if(!value) {
			return Observable.throwError('Error in subscribe');
		} 
		return of(this.Mock_billingResp);
	}
	getCalculatedFeeSchedule(): Observable<any> {
		return of(true)
	}
	updateMultipleVisitbills(): Observable<any> {
		return of(true)
	}
	getAllVisits(): Observable<any> {
		return of(true)
	}
	setBillListing(): Observable<any> {
		return of(true)
	}
}
