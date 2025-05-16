import { Injectable } from '@angular/core';

import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';

@Injectable({
	providedIn: 'root'
})
export class AssignDoctorService {
	private accessToken: any;
	public id;
	public socket;

	constructor(
		private storageData: StorageData,) {

		this.accessToken = this.storageData.getToken()
		this.id = JSON.stringify(this.storageData.getUserId());
		this.accessToken = this.storageData.getToken()
		// this.socket = io(environment.schedulerApiUrl, {
		// 	query: {
		// 		"token": this.accessToken,
		// 		"userId": this.id,
		// 	},
		// });
	}

	getAssignDoc() {
		return Observable.create((observer) => {
			this.socket.on('getDoctorAssignments', (message) => {
				observer.next(message);
			})
		})
	}

}
