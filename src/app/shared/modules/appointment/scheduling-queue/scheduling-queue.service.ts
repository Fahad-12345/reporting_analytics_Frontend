import { Injectable } from '@angular/core';
//http


// import { Config } from '.';
import { BehaviorSubject } from 'rxjs';

import { StorageData } from '@appDir/pages/content-pages/login/user.class';

import { environment } from '../../../../../environments/environment';

@Injectable()
export class SchedulingQueueService {
	public particularPatientInfo: any;
	public patientScheduler: any;
	public gatherAllInfoForCreateModal: any;
	public nameOfPatient: any;
	public visitHistoryChartNo: any;
	public hideFilters: any;
	private doctors = new BehaviorSubject<any>([]);
	cast = this.doctors.asObservable();

	private speciality = new BehaviorSubject<any>([]);
	castSpeciality = this.speciality.asObservable();

	private clinics = new BehaviorSubject<any>([]);
	castClinics = this.clinics.asObservable();

	public appointmentTitle: any;
	public caseId: any;
	public patientName: any;
	public chartNo: any;
	public createAppDate: any;
	//update modal
	public updateModalData: any = {};

	private access_token: any;
	public id;
	constructor(
		// private _http: Http,
		 private storageData: StorageData) {
		this.access_token = this.storageData.getToken();
		this.id = JSON.stringify(this.storageData.getUserId());
	}

	// public getAppointmentOfPatient(id, startDate, endDate) {
	// 	var data = {
	// 		patientId: id,
	// 		startDate: startDate,
	// 		endDate: endDate,
	// 	};
	// 	const httpOptions = {
	// 		headers: new Headers({
	// 			Accept: 'application/json',
	// 			Authorization: this.storageData.getToken(),
	// 			userId: JSON.stringify(this.storageData.getUserId()),
	// 		}),
	// 	};
	// 	return this._http
	// 		.post(
	// 			environment.schedulerApiUrl + 'api/patients/getAppointmentsOfAPatient',
	// 			data,
	// 			httpOptions,
	// 		)
	// 		.map((res) => res.json());
	// }

	// public checkAvailability(StartDate, EndDate) {
	// 	const httpOptions = {
	// 		headers: new Headers({
	// 			Accept: 'application/json',
	// 			Authorization: this.storageData.getToken(),
	// 			userId: JSON.stringify(this.storageData.getUserId()),
	// 		}),
	// 	};
	// 	const object = {
	// 		dateRange: [StartDate, EndDate],
	// 		clinics: this.storageData.getFacilityLocations(),
	// 	};

	// 	return this._http
	// 		.post(environment.schedulerApiUrl + 'api/user_facilities/doctorFilter', object, httpOptions)
	// 		.map((res) => res.json());
	// }

	// public refreshDoctors(docs) {
	// 	this.doctors.next(docs);
	// }
	// public refreshSpeciality(docs) {
	// 	this.speciality.next(docs);
	// }
	// public refreshClinics(data) {
	// 	this.clinics.next(data);
	// }

	// public deleteAppointment(id, startDate, endDate) {
	// 	const httpOptions = {
	// 		headers: new Headers({
	// 			Accept: 'application/json',
	// 			Authorization: this.storageData.getToken(),
	// 			userId: JSON.stringify(this.storageData.getUserId()),
	// 		}),
	// 	};
	// 	let data = {
	// 		id: id,
	// 		date: [startDate, endDate],
	// 	};
	// 	return this._http
	// 		.post(environment.schedulerApiUrl + 'api/appointments/deleteAppointment', data, httpOptions)
	// 		.map((res) => res.json());
	// }
	// public addAppointment(object) {
	// 	const httpOptions = {
	// 		headers: new Headers({
	// 			Accept: 'application/json',
	// 			Authorization: this.storageData.getToken(),
	// 			userId: JSON.stringify(this.storageData.getUserId()),
	// 		}),
	// 	};
	// 	return this._http
	// 		.post(environment.schedulerApiUrl + 'api/appointments/addAppointment', object, httpOptions)
	// 		.map((res) => res.json());
	// }

	// public getDoctorsForFrontDesk() {
	// 	const httpOptions = {
	// 		headers: new Headers({
	// 			Accept: 'application/json',
	// 			Authorization: this.storageData.getToken(),
	// 			userId: JSON.stringify(this.storageData.getUserId()),
	// 		}),
	// 	};
	// 	return this._http
	// 		.get(environment.schedulerApiUrl + 'api/front_desks/getDoctorsForFrontDesk', httpOptions)
	// 		.map((res) => res.json());
	// }

	// public getClinicsByIds(reqObj) {
	// 	const httpOptions = {
	// 		headers: new Headers({
	// 			Accept: 'application/json',
	// 			Authorization: this.storageData.getToken(),
	// 			userId: JSON.stringify(this.storageData.getUserId()),
	// 		}),
	// 	};
	// 	const object = {
	// 		clinics: reqObj,
	// 	};
	// 	return this._http
	// 		.post(environment.schedulerApiUrl + 'api/users/getFacilities', object, httpOptions)
	// 		.map((res) => res.json());
	// }
	// public getDoctorsByClinics(reqObj) {
	// 	const httpOptions = {
	// 		headers: new Headers({
	// 			Accept: 'application/json',
	// 			Authorization: this.storageData.getToken(),
	// 			userId: JSON.stringify(this.storageData.getUserId()),
	// 		}),
	// 	};
	// 	const object = {
	// 		clinics: reqObj,
	// 	};
	// 	return this._http
	// 		.post(environment.schedulerApiUrl + 'api/users/getDoctorsForUsers', object, httpOptions)
	// 		.map((res) => res.json());
	// }
	// public getAllSpeciality() {
	// 	const httpOptions = {
	// 		headers: new Headers({
	// 			Accept: 'application/json',
	// 			Authorization: this.storageData.getToken(),
	// 			userId: JSON.stringify(this.storageData.getUserId()),
	// 		}),
	// 	};
	// 	return this._http
	// 		.get(environment.schedulerApiUrl + 'api/users/getSpecialities', httpOptions)
	// 		.map((res) => res.json());
	// }
	// public getClinicsForFrontDesk() {
	// 	const httpOptions = {
	// 		headers: new Headers({
	// 			Accept: 'application/json',
	// 			Authorization: this.storageData.getToken(),
	// 			userId: JSON.stringify(this.storageData.getUserId()),
	// 		}),
	// 	};
	// 	return this._http
	// 		.get(environment.schedulerApiUrl + 'api/front_desks/getClinicsForFrontDesk', httpOptions)
	// 		.map((res) => res.json());
	// }
	// public getSpecialitiesForFrontDesk() {
	// 	const httpOptions = {
	// 		headers: new Headers({
	// 			Accept: 'application/json',
	// 			Authorization: this.storageData.getToken(),
	// 			userId: JSON.stringify(this.storageData.getUserId()),
	// 		}),
	// 	};
	// 	return this._http
	// 		.get(environment.schedulerApiUrl + 'api/front_desks/getSpecialitiesForFrontDesk', httpOptions)
	// 		.map((res) => res.json());
	// }
	// public suggestAppointment(object) {
	// 	const httpOptions = {
	// 		headers: new Headers({
	// 			Accept: 'application/json',
	// 			Authorization: this.storageData.getToken(),
	// 			userId: JSON.stringify(this.storageData.getUserId()),
	// 		}),
	// 	};
	// 	return this._http
	// 		.post(
	// 			environment.schedulerApiUrl + 'api/appointments/suggestAppointment',
	// 			object,
	// 			httpOptions,
	// 		)
	// 		.map((res) => res.json());
	// }
	// public getWaitingListPriority() {
	// 	const httpOptions = {
	// 		headers: new Headers({
	// 			Accept: 'application/json',
	// 			Authorization: this.storageData.getToken(),
	// 			userId: JSON.stringify(this.storageData.getUserId()),
	// 		}),
	// 	};
	// 	return this._http
	// 		.get(
	// 			environment.schedulerApiUrl + 'api/waitingListPriorities/getWaitingListPriority',
	// 			httpOptions,
	// 		)
	// 		.map((res) => res.json());
	// }
	// public getAppointmentPriority() {
	// 	const httpOptions = {
	// 		headers: new Headers({
	// 			Accept: 'application/json',
	// 			Authorization: this.storageData.getToken(),
	// 			userId: JSON.stringify(this.storageData.getUserId()),
	// 		}),
	// 	};
	// 	return this._http
	// 		.get(
	// 			environment.schedulerApiUrl + 'api/appointment_priorities/getAppointmentPriority',
	// 			httpOptions,
	// 		)
	// 		.map((res) => res.json());
	// }
	// public getAppointmentType() {
	// 	const httpOptions = {
	// 		headers: new Headers({
	// 			Accept: 'application/json',
	// 			Authorization: this.storageData.getToken(),
	// 			userId: JSON.stringify(this.storageData.getUserId()),
	// 		}),
	// 	};
	// 	return this._http
	// 		.get(environment.schedulerApiUrl + 'api/appointment_types/getAppointmentTypes', httpOptions)
	// 		.map((res) => res.json());
	// }
	// public getDoctorAssigned(cId, sId, sDate, eDate) {
	// 	const httpOptions = {
	// 		headers: new Headers({
	// 			Accept: 'application/json',
	// 			Authorization: this.storageData.getToken(),
	// 			userId: JSON.stringify(this.storageData.getUserId()),
	// 		}),
	// 	};
	// 	const reqObj = {
	// 		clinicId: cId,
	// 		specId: sId,
	// 		start: sDate,
	// 		end: eDate,
	// 	};
	// 	return this._http
	// 		.post(environment.schedulerApiUrl + 'api/docAssigns/getDoctorAssigned', reqObj, httpOptions)
	// 		.map((res) => res.json());
	// }
	// public getFreeSlotsAndEntriesCount(dId, cId, sId, date, eDate) {
	// 	const httpOptions = {
	// 		headers: new Headers({
	// 			Accept: 'application/json',
	// 			Authorization: this.storageData.getToken(),
	// 			userId: JSON.stringify(this.storageData.getUserId()),
	// 		}),
	// 	};
	// 	let reqObj: any;
	// 	if (dId !== 0) {
	// 		reqObj = {
	// 			docId: dId,
	// 			specId: sId,
	// 			clinicId: cId,
	// 			currentDateTime: date,
	// 			endDate: eDate,
	// 		};
	// 	} else {
	// 		reqObj = {
	// 			specId: sId,
	// 			clinicId: cId,
	// 			currentDateTime: date,
	// 			endDate: eDate,
	// 		};
	// 	}
	// 	return this._http
	// 		.post(
	// 			environment.schedulerApiUrl + 'api/waitingLists/getFreeSlotsAndEntriesCount',
	// 			reqObj,
	// 			httpOptions,
	// 		)
	// 		.map((res) => res.json());
	// }
	// public getAllToBeScheduledPatients() {
	// 	const httpOptions = {
	// 		headers: new Headers({
	// 			Accept: 'application/json',
	// 			Authorization: this.storageData.getToken(),
	// 			userId: JSON.stringify(this.storageData.getUserId()),
	// 		}),
	// 	};
	// 	let obj = {
	// 		facilityIds: this.storageData.getFacilityLocations(),
	// 	};
	// 	return this._http
	// 		.post(
	// 			environment.schedulerApiUrl + 'api/patients/getAllToBeScheduledPatients',
	// 			obj,
	// 			httpOptions,
	// 		)
	// 		.map((res) => res.json());
	// }

	// public getAppointmentHistoryAgainstCase(chNo, cId, specIds) {
	// 	const httpOptions = {
	// 		headers: new Headers({
	// 			Accept: 'application/json',
	// 			Authorization: this.storageData.getToken(),
	// 			userId: JSON.stringify(this.storageData.getUserId()),
	// 		}),
	// 	};
	// 	const reqObj = {
	// 		chartNo: chNo,
	// 		caseId: cId,
	// 		specs: specIds,
	// 	};

	// 	return this._http
	// 		.post(
	// 			environment.schedulerApiUrl + 'api/appointments/getAppointmentHistoryAgainstCase',
	// 			reqObj,
	// 			httpOptions,
	// 		)
	// 		.map((res) => res.json());
	// }
	// public deleteToBeSchedulled(Id) {
	// 	const httpOptions = {
	// 		headers: new Headers({
	// 			Accept: 'application/json',
	// 			Authorization: this.storageData.getToken(),
	// 			userId: JSON.stringify(this.storageData.getUserId()),
	// 		}),
	// 	};
	// 	const reqObj = {
	// 		id: Id,
	// 	};
	// 	return this._http
	// 		.post(
	// 			environment.schedulerApiUrl +
	// 				'api/toBeScheduledAppointments/deleteToBeScheduledAppointment',
	// 			reqObj,
	// 			httpOptions,
	// 		)
	// 		.map((res) => res.json());
	// }
	// public addToBeScheduledAppointment(chartNo, tC_Id, oC_Id, status) {
	// 	const httpOptions = {
	// 		headers: new Headers({
	// 			Accept: 'application/json',
	// 			Authorization: this.storageData.getToken(),
	// 			userId: JSON.stringify(this.storageData.getUserId()),
	// 		}),
	// 	};
	// 	const reqObj = {
	// 		chartNo: chartNo,
	// 		targetFacilityId: tC_Id,
	// 		originFacilityId: oC_Id,
	// 		schedulingStatus: status,
	// 	};
	// 	return this._http
	// 		.post(
	// 			environment.schedulerApiUrl + 'api/toBeScheduledAppointments/addToBeScheduledAppointment',
	// 			reqObj,
	// 			httpOptions,
	// 		)
	// 		.map((res) => res.json());
	// }
	// public addToWaitingList(caseType, dId, sId, cId, pId, cNo, sDate, aPId, aTId, aT, caseId) {
	// 	const httpOptions = {
	// 		headers: new Headers({
	// 			Accept: 'application/json',
	// 			Authorization: this.storageData.getToken(),
	// 			userId: JSON.stringify(this.storageData.getUserId()),
	// 		}),
	// 	};
	// 	let reqObj: any;
	// 	if (dId !== 0) {
	// 		reqObj = {
	// 			docId: dId,
	// 			specId: sId,
	// 			clinicId: cId,
	// 			priorityId: pId,
	// 			caseType: caseType,
	// 			chartNo: cNo,
	// 			currentDateTime: sDate,
	// 			appointmentPriorityId: aPId,
	// 			appointmentTypeId: aTId,
	// 			appointmentTitle: aT,
	// 			caseId: parseInt(caseId),
	// 		};
	// 	} else {
	// 		reqObj = {
	// 			specId: sId,
	// 			clinicId: cId,
	// 			priorityId: pId,
	// 			chartNo: cNo,
	// 			caseType: caseType,
	// 			currentDateTime: sDate,
	// 			appointmentPriorityId: aPId,
	// 			appointmentTypeId: aTId,
	// 			appointmentTitle: aT,
	// 			caseId: parseInt(caseId),
	// 		};
	// 	}
	// 	return this._http
	// 		.post(environment.schedulerApiUrl + 'api/waitingLists/addToWaitingList', reqObj, httpOptions)
	// 		.map((res) => res.json());
	// }
	// public getAvailableRoomsForDoctor(dIds, cId, st, ed) {
	// 	const httpOptions = {
	// 		headers: new Headers({
	// 			Accept: 'application/json',
	// 			Authorization: this.storageData.getToken(),
	// 			userId: JSON.stringify(this.storageData.getUserId()),
	// 		}),
	// 	};
	// 	const reqObj = {
	// 		docId: dIds,
	// 		clinicId: cId,
	// 		startDate: st,
	// 		endDate: ed,
	// 	};
	// 	return this._http
	// 		.post(
	// 			environment.schedulerApiUrl + 'api/roomAssigns/getAvailableRoomsForDoctor',
	// 			reqObj,
	// 			httpOptions,
	// 		)
	// 		.map((res) => res.json());
	// }
	// public availableRoom(reqObj) {
	// 	const httpOptions = {
	// 		headers: new Headers({
	// 			Accept: 'application/json',
	// 			Authorization: this.storageData.getToken(),
	// 			userId: JSON.stringify(this.storageData.getUserId()),
	// 		}),
	// 	};
	// 	return this._http
	// 		.post(
	// 			environment.schedulerApiUrl + 'api/roomAssigns/getAvailableRoomsForDoctor',
	// 			reqObj,
	// 			httpOptions,
	// 		)
	// 		.map((res) => res.json());
	// }
	// public updateAppointment(object) {
	// 	const httpOptions = {
	// 		headers: new Headers({
	// 			Accept: 'application/json',
	// 			Authorization: this.storageData.getToken(),
	// 			userId: JSON.stringify(this.storageData.getUserId()),
	// 		}),
	// 	};
	// 	return this._http
	// 		.post(environment.schedulerApiUrl + 'api/appointments/updateAppointment', object, httpOptions)
	// 		.map((res) => res.json());
	// }
	// public getAppointmentsOfAPatient(reqObj) {
	// 	const httpOptions = {
	// 		headers: new Headers({
	// 			Accept: 'application/json',
	// 			Authorization: this.storageData.getToken(),
	// 			userId: JSON.stringify(this.storageData.getUserId()),
	// 		}),
	// 	};
	// 	return this._http
	// 		.post(
	// 			environment.schedulerApiUrl + 'api/users/getAppointmentsOfAPatient',
	// 			reqObj,
	// 			httpOptions,
	// 		)
	// 		.map((res) => res.json());
	// }
}
