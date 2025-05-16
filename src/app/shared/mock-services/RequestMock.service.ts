import { Observable, throwError } from 'rxjs';
import { of } from 'rxjs';

export class RequestMockService {
	Mock_requestResp = [
		{
			status:true
		}
	]
	sendRequest(value?): Observable<any> {
		if(!value) {
			return Observable.throwError('Error in subscribe');
		} 
		return of(this.Mock_requestResp);
	}
}
