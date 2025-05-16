import { Observable } from 'rxjs';
import { of,throwError } from 'rxjs';

export class CustomDiallogMockService {
	Mock_CustomResp = [
		{
			status:true
		}
	]
	confirm(value?): Observable<any> {
		if(!value) {
			return throwError('Error in subscribe');
		} 
		return of(this.Mock_CustomResp);
	}
}
