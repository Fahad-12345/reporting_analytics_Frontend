import { Observable, throwError } from 'rxjs';
import { of } from 'rxjs';

export class ToastertMockService {
	Mock_toasterResp = [
		{
			status:true
		}
	]
	error(value?): Observable<any> {
		if(!value) {
			return Observable.throwError('Error in subscribe');
		} 
		return of(this.Mock_toasterResp);
	}
	success(value?): Observable<any> {
		if(!value) {
			return Observable.throwError('Error in subscribe');
		} 
		return of(this.Mock_toasterResp);
	}
}
