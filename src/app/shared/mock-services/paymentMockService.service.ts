import { Observable } from 'rxjs';
import { of } from 'rxjs';

export class PaymentMockService {
	Mock_verificationResp = [
		{
			status: true,
		},
	];
	pullPaymentEditPopup(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_verificationResp);
	}
	reloadPaymentAfterAdd(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_verificationResp);
	}
	pushResetForm(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_verificationResp);
	}
	pullReloadPayment(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_verificationResp);
	}
	pullResetForm(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_verificationResp);
	}
	getActionType(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_verificationResp);
	}
	paymentType(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_verificationResp);
	}
	hasActionType(){};
	hasPaymentTypeList(){};
	setPaymentType(){};
	hasPaymentByList(){};
	hasPaymentStatusList(){};
	setPaymentStatus(){};
	pushPaymentEditPopup(){};
	viewDocFile(){};
	setActionType(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_verificationResp);
	}
	getPaymentBy(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_verificationResp);
	}
	getPaymentStatus(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_verificationResp);
	}
	setPaymentBy(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_verificationResp);
	}
	getPaymentByInfo(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_verificationResp);
	}
}
