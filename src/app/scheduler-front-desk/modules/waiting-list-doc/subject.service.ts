import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private assignmentsCalendar = new BehaviorSubject<any>([]);
  castCalendar = this.assignmentsCalendar.asObservable();

  private assignments = new BehaviorSubject<any>([]);
  cast = this.assignments.asObservable();
	private hour = new BehaviorSubject<any>([]);
	castHour = this.hour.asObservable();
	constructor() { }

	public refreshHour(assigns){
		this.hour.next(assigns)
	}
  public refresh(assigns){
    this.assignments.next(assigns)
  }
  public refreshCalendar(assigns){
    this.assignmentsCalendar.next(assigns)
  }
}
