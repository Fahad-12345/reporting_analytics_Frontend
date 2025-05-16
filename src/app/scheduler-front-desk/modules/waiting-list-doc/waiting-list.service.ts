import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WaitingListService {
  public waitingListToAppointment = new BehaviorSubject<any>([]);
  castingToAppointment = this.waitingListToAppointment.asObservable();
  public getAppointmentDuration = new BehaviorSubject<any>({});
  castAppointmentDuaration = this.getAppointmentDuration.asObservable();

  constructor() {
  }

  public durationOfAppointment(thisDuration) {
    this.getAppointmentDuration.next(thisDuration)
  }
  public shiftFromWaitingListToAppointment(thisArray) {
    this.waitingListToAppointment.next(thisArray)
  }

}
