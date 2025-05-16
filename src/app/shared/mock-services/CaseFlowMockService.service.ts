import { Observable, throwError } from 'rxjs';
import { of } from 'rxjs';

export class CaseFlowMockService {
	Mock_caseFlowResp = [
		{
			status: true,
		},
	];
	getCase(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_caseFlowResp);
	}
	getNF2Info(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_caseFlowResp);
	}
	setNf2Status(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_caseFlowResp);
	}
	updateCase(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_caseFlowResp);
	}
	goToNextStep(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_caseFlowResp);
	}
	allFacilityLocationsAgainstPatientLocation(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_caseFlowResp);
	}
	getCaseMasters(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_caseFlowResp);
	}
}
