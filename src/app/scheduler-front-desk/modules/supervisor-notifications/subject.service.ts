import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private assignments = new BehaviorSubject<any>([]);
  cast = this.assignments.asObservable();

  //This is the behaviour subject that is going to update the page and call the api
   apiUpdate = new BehaviorSubject<any>([]);
  //  castAPI = this.apiUpdate.asObservable();

  private update = new BehaviorSubject<any>([]);
  castUpdate = this.update.asObservable();
  constructor() { }

  public refreshUpdate(assigns) {
    this.update.next(assigns)
  }
  public refresh(assigns) {
    this.assignments.next(assigns)
  }
  public spec = [];
  public clinic = [];
  public currentStartDate: Date;
  public numberOfDoc: any;
  public assignDoc = [];
  public currentEndDate: Date;
  public specAssignId: any;
  public result: any = [];
  public docAssignId: any;
  public speciality: any;
  public specialityForDeleteModal: any;
  public clinicForDeleteModal: any;
  public clinicQualifierForDeleteModal: any;
  public allClinics: any;
  public allSpeciality: any;
  public specIdForDeleteModal: any;
  public recIdForDeleteModal: any;
  public clinicIdForDeleteModal: any;
}
