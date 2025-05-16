import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class DaySubjectService {
  public assignments = new BehaviorSubject<any>([]);
  public castDay = this.assignments.asObservable();
  public separations = new BehaviorSubject<any>([]);
  public castseparation = this.separations.asObservable();

  public unavailability = new BehaviorSubject<any>([]);
  public castDayUnavailability = this.unavailability.asObservable();

  constructor() { }
  public refreshUnavailability(assigns){
    this.unavailability.next(assigns)
    this.castDayUnavailability.subscribe(res=>{

    })
  }

  public refreshDay(assigns){
    this.assignments.next(assigns)
    this.castDay.subscribe(res=>{

    })
  }

  public refreshSeparations(sep){
    this.separations.next(sep)
    this.castseparation.subscribe(res=>{

    })
  }
}
