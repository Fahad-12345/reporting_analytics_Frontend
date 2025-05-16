import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class WeekSubjectService {
  private assignments = new BehaviorSubject<any>([]);
  cast = this.assignments.asObservable();
	private scroll = new BehaviorSubject<any>([]);
	castScroll = this.scroll.asObservable();
	private patientCalendar = new BehaviorSubject<any>([]);
	castPatientCalendar = this.patientCalendar.asObservable();

	constructor() { }
  // private assignmentsCalendar = new BehaviorSubject<any>([]);
  // castCalendar = this.assignmentsCalendar.asObservable();
	private note = new BehaviorSubject<any>([]);
	castNote = this.note.asObservable();
	public refreshPatientCalendar(assigns){
		this.patientCalendar.next(assigns)
	}
	public refreshNote(assigns){
		this.note.next(assigns)
	}
  // public refreshCalendar(assigns){
  //   this.assignmentsCalendar.next(assigns)
  // }
  public refresh(assigns){
    this.assignments.next(assigns)
  }
	public refreshScroll(scroll1) {
		this.scroll.next(scroll1)
	}
}
