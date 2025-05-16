import { Observable, throwError } from 'rxjs';
import { of } from 'rxjs';

export class FDMockService {
	Mock_requestResp = [
		{
			status: true,
		},
	];
	exportExcelUrl() {
		return 'excel path';
	}
	getPatientSummaryPDF(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_requestResp);
	}
	emailDocument(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_requestResp);
	}
	touchAllFields(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
	}
	uploadUserDocument(value?): Observable<any> {
		if(!value) {
			return Observable.throwError('Error in subscribe');
		} 
		return of(this.Mock_requestResp);
	}
	deleteUser(value?): Observable<any> {
		debugger;
		if(!value) {
			return Observable.throwError('Error in subscribe');
		} 
		return of(this.Mock_requestResp);
	}
	addUser(value?): Observable<any> {
		if(!value) {
			return Observable.throwError('Error in subscribe');
		} 
		return of(this.Mock_requestResp);
	}
	getAllFoldersAndFilesByCase(value?): Observable<any> {
		if(!value) {
			return Observable.throwError('Error in subscribe');
		} 
		return of(this.Mock_requestResp);
	}
	deleteDocument(value?): Observable<any> {
		if(!value) {
			return Observable.throwError('Error in subscribe');
		} 
		return of(this.Mock_requestResp);
	}
	addInsuranceCompany(value?): Observable<any> {
		if(!value) {
			return Observable.throwError('Error in subscribe');
		} 
		return of(this.Mock_requestResp);
	}
	updateInsuranceCompany(value?): Observable<any> {
		if(!value) {
			return Observable.throwError('Error in subscribe');
		} 
		return of(this.Mock_requestResp);
	}
	searchICDIct(value?): Observable<any> {
		if(!value) {
			return Observable.throwError('Error in subscribe');
		} 
		return of(this.Mock_requestResp);
	}
	deleteUsers(value?): Observable<any> {
		debugger;
		if(!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_requestResp);
	}
	deleteCases(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_requestResp);
	}
	getRelations(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_requestResp);
	}
	getComponentByType(value?): Observable<any> {
		if (!value) {
			return Observable.throwError('Error in subscribe');
		}
		return of(this.Mock_requestResp);
	}
	current_UserCapabilities: Observable<any> =  of(this.Mock_requestResp);
}
