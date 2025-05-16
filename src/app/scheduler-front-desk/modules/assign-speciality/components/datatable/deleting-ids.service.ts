import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SchedulerSupervisorService } from '../../../../scheduler-supervisor.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { AssignSpecialityUrlsEnum } from '../../assign-speciality-urls-enum';

@Injectable({
  providedIn: 'root'
})
export class DeletingIdsService {
  public deleteAll: any;
  public deleteSelected: any = [];
  public assignmentCheck: any;
  public recId: any;
  public emptyArray: any = false;
  public specId: any;
  public getAllAssignments: any;
  private changeStatus = new BehaviorSubject<Boolean>(false);
  public selectAllCheckForApplyChangeButton: any;
  public deleteButtonStatus = new BehaviorSubject<boolean>(false);
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
  constructor(public SupervisorService: SchedulerSupervisorService,
    protected requestService: RequestService,
  ) {

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
//   UpdatedSpecIds() {
//     this.requestService
//       .sendRequest(
//         AssignSpecialityUrlsEnum.getAppointmentsForAssignment,
//         'POST',
//         REQUEST_SERVERS.schedulerApiUrl,
//         {
//           "specAssignId": this.SupervisorService.currentDeleteAppointment.id
//         }
//       ).subscribe(
//         (response: HttpSuccessResponse) => {
//           this.updatedSpecAppointments.next(response.result.data)
//           if (response.result.data == '' || response.result.data == null || response.result.data == undefined) {
//             this.deleteStatus(false)
//           } else {
//             this.deleteStatus(true)
//           }
//         }, error => {

//         }
//       )
//   }
//   UpdatedRecIds() {
//     this.requestService
//       .sendRequest(
//         AssignSpecialityUrlsEnum.getAppointmentsForAssignment,
//         'POST',
//         REQUEST_SERVERS.schedulerApiUrl,
//         {
//           "recId": this.SupervisorService.currentDeleteAppointment.recId
//         }
//       ).subscribe(
//         (response: HttpSuccessResponse) => {
//           this.updatedRecAppointments.next(response.result.data)
//           if (response.result.data == '' || response.result.data == null || response.result.data == undefined) {
//             this.deleteStatus(false)
//           } else {
//             this.deleteStatus(true)
//           }
//         }, error => {

//         }
//       )
//   }



}
