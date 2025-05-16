import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
@Injectable({
	providedIn: 'root'
})
export class SubjectService {
	public docId: any;
	public docName: any;
	public startDate: any;
	public updateAppointment = new BehaviorSubject<any>([]);
	private assignments = new BehaviorSubject<any>([]);
	cast = this.assignments.asObservable();
	private patientProfile = new BehaviorSubject<any>([]);
	castPatientProfile = this.patientProfile.asObservable();
	private starteval = new BehaviorSubject<any>([]);
	castStartEval = this.starteval.asObservable();
	private AppModal = new BehaviorSubject<any>([]);
	castAppModal = this.AppModal.asObservable();
	private doctors = new BehaviorSubject<any>([]);
	castDoctors = this.doctors.asObservable();
	public castPatient:Subject<any>=new Subject<any>();
	private clinics = new BehaviorSubject<any>([]);
	castClinics = this.clinics.asObservable();
	private specialities = new BehaviorSubject<any>([]);
	castSpecialities = this.specialities.asObservable();
	public calendar_refresher = new BehaviorSubject<any>([]);
	private remove = new BehaviorSubject<any>([]);
	castRemove = this.remove.asObservable();
	clearPatientData$=new Subject<boolean>();
	private appointmentDetails = new BehaviorSubject<any>({});
	_appointmentDetails = this.appointmentDetails.asObservable();
	getUpdateAppointments = new Subject<any>();
	// appointmentsData = this.getUpdateAppointments.asObservable();
	sendOnUpdate$ = new Subject<boolean>(); 
	public refreshRemove(assigns) {
		this.remove.next(assigns);
	}

	public refreshSpecialities(assigns) {
		this.specialities.next(assigns);
	}
	public refreshDoctors(assigns) {
		this.doctors.next(assigns);
	}
	public refreshSelectedPatient(patient) {
		this.castPatient.next(patient);
	}
	public refreshClinic(assigns) {
		this.clinics.next(assigns)
	}
	constructor() { }
	public refreshStartEval(data) {
		this.starteval.next(data);
	}
	public refreshPatientProfile(data) {
		this.patientProfile.next(data);
	}
	public refreshAppModal(assigns) {
		this.AppModal.next(assigns)
	}
	public refresh(assigns) {
		debugger
		this.assignments.next(assigns)
	}

	public clearPatientData()
	{
		this.clearPatientData$.next(true)
	}
	setAppointmentDetails(assigns){
		this.appointmentDetails.next(assigns);
	}
	setUpdateAppointments(appointments){
		this.getUpdateAppointments.next(appointments);
	}
}
