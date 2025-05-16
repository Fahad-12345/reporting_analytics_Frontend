import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AppointmentSubjectService {
	public particularPatientInfo:any;
	public waitingList = new BehaviorSubject<any>([]);
	public refresher = new BehaviorSubject<any>([]);
	public appointment_list_refresher = new BehaviorSubject<any>([]);
	public waiting_list_refresher = new BehaviorSubject<any>([]);
	castWaititngList = this.waitingList.asObservable();
	private scheduler = new BehaviorSubject<any>("default");
	castScheduler = this.scheduler.asObservable();
	public loadLahore =new BehaviorSubject<boolean>(true);
	public castLahore=this.loadLahore.asObservable();
	private assignments = new BehaviorSubject<any>([]);
	castAppointment = this.assignments.asObservable();
	private inst = new BehaviorSubject<any>([]);
	castInst = this.inst.asObservable();
	private patient = new BehaviorSubject<any>([]);
	castPatient = this.patient.asObservable();
	constructor() { }
	public refreshPatient(assigns){
		this.patient.next(assigns)
	}
	public refreshAssignment(assigns){
		this.assignments.next(assigns)
	  }
	public refreshScheduler(assigns){
	this.scheduler.next(assigns)
	}
	public refreshWaitingList(assigns){
		this.waitingList.next(assigns)
		}
	public jutiSediay(loaded){
		this.loadLahore.next(loaded)
	}	
}
