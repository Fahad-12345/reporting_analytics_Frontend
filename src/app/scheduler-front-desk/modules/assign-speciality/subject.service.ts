import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private assignments = new BehaviorSubject<any>([]);
  cast = this.assignments.asObservable();
  private clinics = new BehaviorSubject<any>([]);
  castClinics = this.clinics.asObservable();
  private update = new BehaviorSubject<any>([]);
  castUpdate = this.update.asObservable();
  constructor() { }

  public refreshUpdate(assigns) {
    this.update.next(assigns)
  }
  public refresh(assigns) {
    this.assignments.next(assigns)
  }
  public refreshClinic(assigns) {
    this.clinics.next(assigns)
  }
  public spec = [];
  public clinic = [];
  public currentStartDate: Date;
  public currentEvent:any;
  public numberOfDoc: any;
  public assignDoc = [];
  public assignDoctorData = [];
  public currentEndDate: Date;
  public specAssignId: any;
  public result: any = [];

  //Highlighted Cell Date
  currentSelectedDate:any =-1
  //Double Clicked Cell Date
  currentSelectedDateDoubleClicked:any;
  //

}
