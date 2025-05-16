import { Observable, of } from 'rxjs';

export class EorMockService {
	Mock_EorResp = [
		{
			status: true,
		},
	];
	pushDoSearch(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_EorResp);
	}
	pullBillFilterFormReset(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_EorResp);
	}
	updateFilterField(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_EorResp);
	}
	getAllSensationsOfCaseType(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_EorResp);
	}
	setCaseType(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_EorResp);
	}
	hasCaseType(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_EorResp);
	}
	pushResetPaymentForm(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_EorResp);
	}
	pushPaymentId(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_EorResp);
	}
	pushReloadEor(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_EorResp);
	}
	eorPushId(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_EorResp);
	}
	pushFilterFormReset(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_EorResp);
	}
	pushResetForm(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_EorResp);
	}
	pushBillFilterFormReset(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_EorResp);
	}
	pullFilterFormReset(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_EorResp);
	}
	getSpeciality(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_EorResp);
	}
	pullDoSearch(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_EorResp);
	}
	makeFilterObject(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_EorResp);
	}
	pushResetEorForm(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_EorResp);
	}
	reloadEorAfterAdd(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_EorResp);
	}
	pullReloadEor(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_EorResp);
	}
	pullEorPopupModelClose(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_EorResp);
	}
	eorTypeList(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_EorResp);
	}
	setEorType(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_EorResp);
	}
	pushEorPopupModelClose(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_EorResp);
	}
	eorPullId(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_EorResp);
	}
	getEorById(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_EorResp);
	}
	getEorStatus(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_EorResp);
	}
	setEorStatus(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_EorResp);
	}
	hasEORStatusList(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_EorResp);
	}
	pullResetForm(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_EorResp);
	}
	viewDocFile(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_EorResp);
	}
	pullResetPaymentForm(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_EorResp);
	}
	pullPaymentId(): Observable<any> {
		return of(this.Mock_EorResp);
	}
	isBillId() {
		return true;
	}
	hasEorTypeList() {
		return true;
	}
}
