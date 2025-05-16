import { Injectable, OnInit } from '@angular/core';
import { Config } from './../config/config';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { StorageData, HttpSuccessResponse } from '../pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { WaitingListDocUrlsEnum } from './modules/waiting-list-doc/waiting-list-doc-urls-enum';
import { RequestService } from '@appDir/shared/services/request.service';

@Injectable()

export class DoctorService {
  public currentDoctor = new BehaviorSubject<any>([]);
  public castCurrentDoctor = this.currentDoctor.asObservable();
  public currentDeleteAppointment: any;
  public id;
  public socket;
  public deleteUnavialabilityId: any;
  public notesStartDate: Date;

  private access_token: any;
  constructor(
    protected requestService: RequestService,
    private config: Config,
    private storageData: StorageData,
  ) {
    this.refreshDoctor();

  }

  ngOnInit() {
    this.access_token = this.storageData.getToken();
    this.id = JSON.stringify(this.storageData.getUserId());
    // this.socket = io(this.config.getConfig('schedular_api_path'), {
    //   query: {
    //     "token": this.storageData.getToken(),
    //     "userId": this.id,
    //   },
    // });

  }
  getPatientStatus() {
    return Observable.create((observer) => {
      this.socket.on('statusOfPatient', (message) => {
        observer.next(message);
      })
    })
  }


  getWaitingListPatientsSocket() {
    return Observable.create((observer) => {
      this.socket.on('getWaitingListPatients', (message) => {
        observer.next(message);
      })
    })
  }

  public refreshDoctor() {
    this.requestService
      .sendRequest(
        WaitingListDocUrlsEnum.getDoctorDetails,
        'GET',
        REQUEST_SERVERS.schedulerApiUrl1,
        {
			doctor_id: this.storageData.getUserId()
        }
      ).subscribe(
        (response: HttpSuccessResponse) => {
          const facility = this.storageData.getFacilityLocations()
        //   for (let i = 0; Array.isArray(response.result.data[0].specialities) && i < response.result.data[0].specialities.length; i++) {
        //     for (let j = 0; j < facility.length; j++) {
        //       if (facility[j] === response.result.data[0].specialities[i].facilityId) {
        //         response.result.data[0]["specialities"] = response.result.data[0].specialities[i];
        //         break;
        //       }
        //     }
        //   }
          this.currentDoctor.next(response.result.data[0].speciality)
        }, error => {
        }
      )
  }


  getAppDoc() {
    return Observable.create((observer) => {
      this.socket.on('getAllAppointmentsOfDoctor', (message) => {
        observer.next(message);
      })
    })
  }
}
