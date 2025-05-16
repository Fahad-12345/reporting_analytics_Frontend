import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class MonthSubjectService {
  private assignments = new BehaviorSubject<any>([]);
  private cellAssignemnts = new BehaviorSubject<any>([]);
  cast = this.assignments.asObservable();
  castCellAssignments = this.cellAssignemnts.asObservable();
  private patientCalendar = new BehaviorSubject<any>([]);
  castPatientCalendar = this.patientCalendar.asObservable();
  constructor() { }
	private note = new BehaviorSubject<any>([]);
	castNote = this.note.asObservable();


	public refreshNote(assigns){
		this.note.next(assigns)
	}
  public refreshPatientCalendar(assigns){
    this.patientCalendar.next(assigns)
  }
  public refresh(assigns){
	  // console.log("here subject month")

	  this.assignments.next(assigns)
  }
  public refreshCellAssignments(assigns){
    this.cellAssignemnts.next(assigns)
  }
}
