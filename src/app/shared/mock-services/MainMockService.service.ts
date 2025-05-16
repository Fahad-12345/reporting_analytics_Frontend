import { Observable, throwError } from 'rxjs';
import { of } from 'rxjs';

export class MainMockService {
	Mock_billingResp = [
		{
			status:true
		}
	]
	setLeftPanel(value?): Observable<any> {
		return of(this.Mock_billingResp);
	}
}
