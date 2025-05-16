import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SchedulerSupervisorService } from '../../../../scheduler-supervisor.service';
@Injectable({
  providedIn: 'root'
})
export class DeletingIdsService {
  public deleteAll: any;
  public deleteSelected: any = [];
  public assignmentCheck: any;
  public recId: any;
  public emptyArray: any = false
  public specId: any;
  public getAllAssignments: any;
  private changeStatus = new BehaviorSubject<Boolean>(false);
  public selectAllCheckForApplyChangeButton: any;
  public deleteButtonStatus = new BehaviorSubject<boolean>(true);
  public allAppointmentWithRecId = new BehaviorSubject<any>([]);
  public allAppointmentOfSpecId = new BehaviorSubject<any>([]);
  public updatedSpecAppointments = new BehaviorSubject<any>([]);
  public updatedRecAppointments = new BehaviorSubject<any>([]);
  castUpdatedSpec = this.updatedSpecAppointments.asObservable();
  castUpdatedRec = this.updatedRecAppointments.asObservable();
  cast = this.changeStatus.asObservable();
  castDeleteButton = this.deleteButtonStatus.asObservable();
  castArraySpecId = this.allAppointmentOfSpecId.asObservable();
  castArrayOfAppointment = this.allAppointmentWithRecId.asObservable();
  public nothing: any;
  constructor(public supervisorService: SchedulerSupervisorService) {

  }
  AppointmentWithSpecId(thisArray) {
    this.allAppointmentOfSpecId.next(thisArray)
  }
  AppointmentWithRecId(thisArray) {
    this.allAppointmentWithRecId.next(thisArray)
  }

  editStatus(newStatus) {
    this.changeStatus.next(newStatus)
  }
  deleteStatus(thisStatus) {
    this.deleteButtonStatus.next(thisStatus)
  }
  UpdatedSpecIds() {
    // this.supervisorService.getAllDocAssignment().subscribe(
    //   response => {
    //     this.updatedSpecAppointments.next(response)
    //     if (response == '' || response == null || response == undefined) {
    //       this.deleteStatus(false)
    //     } else {
    //       this.deleteStatus(true)
    //     }
    //   }, error => {
    //   }
    // )
  }
  UpdateDocAppointments() {
    // this.supervisorService.getAllDocAssignment().subscribe(
    //   response => {
    //     this.updatedSpecAppointments.next(response)
    //   }, error => {
    //   }
    // )
  }
  UpdatedRecIds() {
    let id = this.supervisorService.currentDeleteAppointment.recId
    // this.supervisorService.getAllRecAppointments(id).subscribe(
    //   respose => {
    //     this.updatedRecAppointments.next(respose)
    //     if (respose == '' || respose == null || respose == undefined) {
    //       this.deleteStatus(false)
    //     } else {
    //       this.deleteStatus(true)
    //     }
    //   }, error => {

    //   }
    // )
  }
}
