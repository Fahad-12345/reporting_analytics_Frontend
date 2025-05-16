import { Observable, throwError } from 'rxjs';
import { of } from 'rxjs';

export class ConfirmMockService {
	Mock_confirmResp = [
		{
			status:true
		}
	]
	create(value?): Observable<any> {
		if(!value) {
			return Observable.throwError('Error in subscribe');
		} 
		return of(this.Mock_confirmResp);
	}
}
