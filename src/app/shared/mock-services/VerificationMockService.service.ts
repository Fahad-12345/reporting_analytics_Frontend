import { Observable,throwError } from 'rxjs';
import { of } from 'rxjs';

export class VerificationMockService {
	Mock_verificationResp = [
		{
			status: true,
		},
	];
	pushReloadVerification(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_verificationResp);
	}
	pushVerificationForm(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_verificationResp);
	}
	pushVerificationId(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_verificationResp);
	}
	reloadDenialAfterAdd(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_verificationResp);
	}
	pushDenialForm(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_verificationResp);
	}
	pullReloadVerification(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_verificationResp);
	}
	pullclosedVerificationPopup(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_verificationResp);
	}
	reloadVerificationAfterAdd(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_verificationResp);
	}
	getVerificationStatus(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_verificationResp);
	}
	viewDocFile(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_verificationResp);
	}
	verificationTypeList(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_verificationResp);
	}
	pushclosedVerificationPopup(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_verificationResp);
	}
	hasVerificationTypeList(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_verificationResp);
	}
	setVerificationType(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_verificationResp);
	}
	setVerificationStatus(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_verificationResp);
	}
	hasVerificationStatusList(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_verificationResp);
	}
	isBillId() {
		return true;
	}
}
