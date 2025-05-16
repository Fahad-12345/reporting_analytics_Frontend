import { Injectable } from '@angular/core';
import { HttpService } from '@appDir/front-desk/fd_shared/services/http.service';
// import { UMResponse } from '../models/um.response.model';
import { Department } from './department.model';
import { UMResponse } from '../../models/um.response.model';

@Injectable()
export class DepartmentService {
	constructor(private http: HttpService) {}

	/*async fetchDepartments(): Promise<Department[]> {
		const { data } = await this.http.get<UMResponse<Department[]>>('all_department').toPromise();

		return data;
	}*/

	async deleteOneDepartment(id): Promise<boolean> {
		const { data, status } = await this.http
			.delete<UMResponse<Department>>(`delete_department/${id}`)
			.toPromise();
		return status;
	}
	async deleteMultipleDepartments(ids): Promise<boolean> {
		const { status } = await this.http
			.deleteMultiple(`delete_multiple_department`, ids)
			.toPromise();
		return status;
	}

	// old code that written and below commented new code
	// async upsert(_data: Department, isEdit: boolean): Promise<UMResponse<Department>> {
	// 	return this.httpVerb(this.getUrl(isEdit), _data, isEdit).toPromise();
	// }

	upsert(_data: Department, isEdit: boolean) {
		return this.httpVerb(this.getUrl(isEdit), _data, isEdit);
	}

	private getUrl(isEdit): string {
		return isEdit ? 'update_department' : 'add_department';
	}

	private httpVerb(url, data, isEdit = false) {
		return isEdit
			? this.http.put<UMResponse<Department>>(url, data)
			: this.http.post<UMResponse<Department>>(url, data);
	}

	touchAllFields(form) {
		// touch all fields to show the error
		Object.keys(form.controls).forEach((field) => {
			const control = form.get(field);
			control.markAsTouched({ onlySelf: true });
		});
	}
}
