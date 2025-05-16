import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class WeekDaySubjectService {
  private assignments = new BehaviorSubject<any>([]);
  cast = this.assignments.asObservable();
	private scroll = new BehaviorSubject<any>("");
	castScroll = this.scroll.asObservable();
	constructor() { }
  private assignmentsCalendar = new BehaviorSubject<any>([]);
  castCalendar = this.assignmentsCalendar.asObservable();

  public refreshCalendar(assigns){
    this.assignmentsCalendar.next(assigns)
  }
  public refresh(assigns){
    this.assignments.next(assigns)
  }
	public refreshScroll(scroll1) {
		this.scroll.next(scroll1)
	}
}
