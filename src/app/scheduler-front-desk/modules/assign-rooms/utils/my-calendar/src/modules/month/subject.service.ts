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
  constructor() { }

  public refresh(assigns){
    this.assignments.next(assigns)
  }
  public refreshCellAssignments(assigns){
    this.cellAssignemnts.next(assigns)
  }
}
