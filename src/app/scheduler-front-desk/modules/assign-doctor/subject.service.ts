import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private assignments = new BehaviorSubject<any>([]);
  cast = this.assignments.asObservable();
  
  public doc_specialities = new  BehaviorSubject<any>([]);
  public filteredClinic = new BehaviorSubject<any>([]);
  public clinicList = new BehaviorSubject<any>([]);
  private update = new BehaviorSubject<any>([]);
  castUpdate = this.update.asObservable();

  private clinics = new BehaviorSubject<any>([]);
  castClinics = this.clinics.asObservable();

  private doctor = new BehaviorSubject<any>([]);
  castDoctor = this.doctor.asObservable();
  constructor() { }

  public refreshUpdate(assigns) {
    this.update.next(assigns)
  }
  public refresh(assigns) {
    this.assignments.next(assigns)
  }
  public refreshDoc(doc) {
    this.doctor.next(doc);
  }
  public refreshClinics(clinic) {
    this.clinics.next(clinic);
  }
  public Event: any;
  public spec: any;
  public updatedSpecQualifierObj: any;
  public currentSpecialityId: number;
  public clinic: any;
  public currentStartDate: Date;
  public numberOfDoc: any;
  public assignDoc = [];
  public currentEndDate: Date;
  public specAssignId: any;
  public currentEvent:any
  public result: any = [];
  public updatedEventId: any;
  public recCheckForUpdate: any;
  public available_doctor_id_ForDeleteModal: any;
  public date_list_id_ForDeleteModal: any;
  public specialityForDeleteModal: any;
  public specialityNameForDeleteModal: any;
  public specialityQualifierNameForDeleteModal: any;
  public clinicForDeleteModal: any;
  public clinicQualifierForDeleteModal: any;

  //Highlighted Cell Date
  currentSelectedDate:any =-1
  //Double Clicked Cell Date
  public currentSelectedDateDoubleClicked:any;
  //

}
