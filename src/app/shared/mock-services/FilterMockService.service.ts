import { Observable } from 'rxjs';
import { of } from 'rxjs';

export class FilterMockService {
	Mock_filterResp = [
		{
			status:true
		}
	]
	commonBody(value?): Observable<any> {
		if(!value) {
			return Observable.throwError('Error in subscribe');
		} 
		return of(this.Mock_filterResp);
	}
	searchBillIds(value?): Observable<any> {
		return this.commonBody(value);
	}
	searchCaseIds(value?): Observable<any> {
		return this.commonBody(value);
	}
	getAllSensationsOfCaseType(value?): Observable<any> {
		return this.commonBody(value);
	}
	searchPatientName(value?): Observable<any> {
		return this.commonBody(value);
	}
	getSpeciality(value?): Observable<any> {
		return this.commonBody(value);
	}
	searchOfPractice(value?): Observable<any> {
		return this.commonBody(value);
	}
	searchUserList(value?): Observable<any> {
		return this.commonBody(value);
	}
	getBillRecipient(value?): Observable<any> {
		return this.commonBody(value);
	}
	getJobStatus(value?): Observable<any> {
		return this.commonBody(value);
	}
	getInsurance(value?): Observable<any> {
		return this.commonBody(value);
	}
	searchEmployer(value?): Observable<any> {
		return this.commonBody(value);
	}
	getAttorney(value?): Observable<any> {
		return this.commonBody(value);
	}
	updateFilterField(value?): Observable<any> {
		return this.commonBody(value);
	}
	getProvider(value?): Observable<any> {
		return this.commonBody(value);
	}
	makeSingleNameFormFIrstMiddleAndLastNames(value?): Observable<any> {
		return this.commonBody(value);
	}
	filterResponse(value?): Observable<any> {
		return this.commonBody(value);
	}
	searchPomIds(value?): Observable<any> {
		return this.commonBody(value);
	}
}
