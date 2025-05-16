import { Injectable } from '@angular/core';
import { Config } from '../config/config';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';

@Injectable()

export class FrontDeskService {
	public patientScheduller: any = false;
	private access_token: any;
	public nameOfPatient: any;
	public unavailabilityId: any;
	public visitHistoryChartNo: any
	public id;
	public detailsForCancel: any;

	public particularPatientInfo: any;
	public socket;

	public gatherAllInfoForCreateModal: any = {}
	isClinic: boolean;
	customizeData: any;

	constructor(
		private storageData: StorageData) {

	}

	ngOnInit() {
		this.access_token = this.storageData.getToken();
		this.id = JSON.stringify(this.storageData.getUserId());
		// this.socket = io(environment.schedulerApiUrl, {
		// 	query: {
		// 		"token": this.storageData.getToken(),
		// 		"userId": this.id,
		// 	},
		// });
	}
	getPatientStatus() {
		return Observable.create((observer) => {
			this.socket.on('statusOfPatient', (message) => {
				observer.next(message);
			})
		})
	}

	getAppointmentsOfAPatient() {
		return Observable.create((observer) => {
			this.socket.on('getAppointmentsOfAPatient', (message) => {
				observer.next(message);
			})
		})
	}

	getAllAppointmentsOfDoctor() {
		return Observable.create((observer) => {
			this.socket.on('getAllAppointmentsOfDoctor', (message) => {
				observer.next(message);
			})
		})
	}

	getAllWaitingListPatientsWithFreeSlotsSocket() {
		return Observable.create((observer) => {
			this.socket.on('getAllWaitingListPatientsWithFreeSlots', (message) => {
				observer.next(message);
			})
		})
	}

	// getAppointmentOfAllPatientsSocket() {
	// 	return Observable.create((observer) => {
	// 		this.socket.on('getAppointmentOfAllPatients', (message) => {
	// 			observer.next(message);
	// 		})
	// 	})
	// }

	getAvailableRoomsForDoctorSocket() {
		return Observable.create((observer) => {
			this.socket.on('getAvailableRoomsForDoctor', (message) => {
				observer.next(message);
			})
		})
	}

	getAllToBeScheduledPatientsSocket() {
		return Observable.create((observer) => {
			this.socket.on('getAllToBeScheduledPatients', (message) => {
				observer.next(message);
			})
		})
	}

}
