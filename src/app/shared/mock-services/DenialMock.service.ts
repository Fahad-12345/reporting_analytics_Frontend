import { Observable } from 'rxjs';
import { of } from 'rxjs';

export class DenialMockService {
	Mock_denialResp = [
		{
			status: true,
		},
	];
	pushReloadDenial(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_denialResp);
	}
	pushDenialForm(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_denialResp);
	}
	pushDenialId(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_denialResp);
	}
	pullReloadDenial(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_denialResp);
	}
	reloadDenialAfterAdd(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_denialResp);
	}
	denialTypeList(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_denialResp);
	}
	pushclosedDenialPopup(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_denialResp);
	}
	hasDenialStatusList(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_denialResp);
	}
	getDenialStatus(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_denialResp);
	}
	setDenialStatus(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_denialResp);
	}
	hasDenialTypeList(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_denialResp);
	}
	setDenialType(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_denialResp);
	}
	pullDenialForm(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_denialResp);
	}
	getDenialById() {}
	pullDenialId() {}
	viewDocFile() {}
	isBillId() {
		return true;
	}
}
