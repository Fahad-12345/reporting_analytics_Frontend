import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private assignmentsDoc = new BehaviorSubject<any>([]);
  castDoc = this.assignmentsDoc.asObservable();
  private assignmentsRoom = new BehaviorSubject<any>([]);
  castRoom = this.assignmentsRoom.asObservable();
  private assignmentsRoomChecked = new BehaviorSubject<any>([]);
  castRoomChecked = this.assignmentsRoomChecked.asObservable();
  private assignments = new BehaviorSubject<any>([]);
  castAssign = this.assignments.asObservable();
  constructor() { }

  public refreshDoc(assigns){
    this.assignmentsDoc.next(assigns)
  }

  public refreshRoom(assigns){
    this.assignmentsRoom.next(assigns)
  }
  public refreshAssign(assigns){
    this.assignments.next(assigns)
  }
  public refreshCheckedRoom(assigns){
    this.assignmentsRoomChecked.next(assigns)
  }
}
