import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private assignments = new BehaviorSubject<any>([]);
  cast = this.assignments.asObservable();
  public Changed = new BehaviorSubject<any>([]);
  constructor() { }

  public refresh(assigns){
    this.assignments.next(assigns)
  }
 


}
