import { Observable, throwError } from 'rxjs';
import { of } from 'rxjs';

export class DocumentManagerMockService {
	Mock_documentManagerResp = [
		{
			status:true
		}
	]
	editDocument(value?): Observable<any> {
		if(!value) {
			return Observable.throwError('Error in subscribe');
		} 
		return of(this.Mock_documentManagerResp);
	}
}
