import { Observable, throwError } from 'rxjs';
import { of } from 'rxjs';

export class DepartmentMockService {
	Mock_departmentResp = [
		{
			status:true
		}
	]
	deleteOneDepartment(value?): Observable<any> {
		if(!value) {
			return Observable.throwError('Error in subscribe');
		} 
		return of(this.Mock_departmentResp);
	}
	deleteMultipleDepartments(value?): Observable<any> {
		if(!value) {
			return Observable.throwError('Error in subscribe');
		} 
		return of(this.Mock_departmentResp);
	}
	touchAllFields(value?): Observable<any> {
		if(!value) {
			return Observable.throwError('Error in subscribe');
		} 
		return of(this.Mock_departmentResp);
	}
}
