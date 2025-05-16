import { Observable, throwError } from 'rxjs';
import { of } from 'rxjs';
export class CanDeactiveMockService {
	Mock_canDeactiveResp = [
		{
			status:true
		}
	]
	canDeactivate(value?): Observable<any> {
		if(!value) {
			return throwError('Error Coming');
		} else if(value == 'empty') {
			return null;
		}
		return of(this.Mock_canDeactiveResp);
	}
}
