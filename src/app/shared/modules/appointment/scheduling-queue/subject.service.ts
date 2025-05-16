import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private assignments = new BehaviorSubject<any>([]);
  
  castAssign = this.assignments.asObservable();
  
  constructor() { }

  public refreshAssign(assigns){
    this.assignments.next(assigns)
  }
}
