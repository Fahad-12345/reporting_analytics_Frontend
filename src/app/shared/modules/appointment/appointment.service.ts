import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';

@Injectable()

export class AppointmentService {
  public patientId: any;
  public patientInfo: any;
  public appointment_id: any
  public hideFilters: any;
  public specId: any
  public completeObject: any
  public particularPatientInfo; any;
  public caseId: any;
  public appointmentTitle: any;
  public specForWaitingModal: any;
  public clinicForWaitingModal: any
  private changeStatus = new BehaviorSubject<any>([])
  castNew = this.changeStatus.asObservable();
  private access_token: any;

  public id;
  public appointmentListForm = {
    'specialties': false,
    'providers': false,
    'appointmentTypes': false,
    'caseTypes': false,
    'visitStatus': false,
    'appointment_Status': false,
    'practicelocation': false
  };
  constructor(
    private storageData: StorageData) {
    this.access_token = this.storageData.getToken()
    this.id = JSON.stringify(this.storageData.getUserId());

  }

  public testing(res) {
    this.changeStatus.next(res)
  }
  getPatientStatus() {
  }


  applyFoucssedClass(filedName: string , status: boolean){
   return this.appointmentListForm[filedName] = status;
  }

 
}
