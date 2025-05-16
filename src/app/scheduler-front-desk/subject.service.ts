import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SubjectService {
    private cancelledAppointment = new BehaviorSubject<any>([]);
	castCancelledAppointment = this.cancelledAppointment.asObservable();
	private inst = new BehaviorSubject<any>([]);
	castInst = this.inst.asObservable();
	private changeClinicCustomization = new BehaviorSubject<any>([]);
	castClinicCustomization = this.changeClinicCustomization.asObservable();
	constructor() { }
	public refreshInst(assigns){
		this.inst.next(assigns)
	}
	public refreshClinicCustomization(assigns){
		this.changeClinicCustomization.next(assigns)
	}
	public refreshCancelledAppointment(assigns){
		this.cancelledAppointment.next(assigns)
	}
}
