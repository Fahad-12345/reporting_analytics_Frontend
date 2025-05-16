import { Observable, of } from 'rxjs';

export class DenialMockService {
	Mock_EorResp = [
		{
			status: true,
		},
	];
	reloadDenialAfterAdd(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_EorResp);
	}
	pushDenialForm(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_EorResp);
	}
}
