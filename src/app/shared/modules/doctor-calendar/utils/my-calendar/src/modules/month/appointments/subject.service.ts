import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AppSubjectService {
  private delete = new BehaviorSubject<any>([]);
  castDelete = this.delete.asObservable();
  private update = new BehaviorSubject<any>([]);
  castUpdate = this.update.asObservable();

  constructor() { }

  public refreshDelete(assigns){
    this.delete.next(assigns)
  }
  public refreshUpdate(assigns){
    this.update.next(assigns)
  }
}
