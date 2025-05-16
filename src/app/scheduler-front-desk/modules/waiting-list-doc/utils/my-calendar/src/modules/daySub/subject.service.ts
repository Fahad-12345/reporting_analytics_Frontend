import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class WeekSubjectService {
  private assignments = new BehaviorSubject<any>([]);
  cast = this.assignments.asObservable();
  constructor() { }
  private assignmentsCalendar = new BehaviorSubject<any>([]);
  castCalendar = this.assignmentsCalendar.asObservable();

  public refreshCalendar(assigns){
    this.assignmentsCalendar.next(assigns)
  }
  public refresh(assigns){
    this.assignments.next(assigns)
  }
}
