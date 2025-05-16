import { Observable, throwError } from 'rxjs';
import { of } from 'rxjs';

export class SignatureMockService {
	Mock_SignatureResp = [
		{
			status:true
		}
	]
	getSignature(value?): Observable<any> {
		if(!value) {
			return Observable.throwError('Error in subscribe');
		} 
		return of(this.Mock_SignatureResp);
	}
	createSignature(value?): Observable<any> {
		if(!value) {
			return Observable.throwError('Error in subscribe');
		} 
		return of(this.Mock_SignatureResp);
	}
}
