import { Injectable } from '@angular/core';
// import { Socket } from 'ng6-socket-io';
// import { WrappedSocket} from './sockets/socket-io.service';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { LocalStorage } from '@shared/libs/localstorage';
import { environment } from '../../../../environments/environment';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';

@Injectable()
export class SupervisorNotificationsService {
  private access_token: string;
  public id;

  constructor(private localStorage: LocalStorage,
    private storageData: StorageData) {
    this.id = JSON.stringify(this.storageData.getUserId());
    this.access_token = JSON.stringify(this.storageData.getToken())
    // this.socket = io(environment.schedulerApiUrl, {
    //   query: {
    //     "token": this.access_token,
    //     "userId": this.id,
    //     "role": 'supervisor'

    //   },
    // });

  }
  ngOnInit() {
    this.id = JSON.stringify(this.storageData.getUserId());
    this.access_token = JSON.stringify(this.storageData.getToken())
    // this.socket = io(environment.schedulerApiUrl, {
    //   query: {
    //     "token": this.access_token,
    //     "userId": this.id,
    //     "role": 'supervisor'

    //   },
    // });
  }
  public socket;
  getMessage() {
    return Observable.create((observer) => {
      this.socket.on('newSupervisorNotification', (message) => {
        observer.next(message);
      })
    })
  }
  getAssignDoc() {
    return Observable.create((observer) => {
      this.socket.on('getDoctorAssignments', (message) => {
        observer.next(message);
      })
    })
  }
  getStatus() {
    return Observable.create((observer) => {
      this.socket.on('approvalNotification', (message) => {
        observer.next(message);
      })
    })
  }

  getDelete() {
    return Observable.create((observer) => {
      this.socket.on('unavailabilityDeleted', (message) => {
        observer.next(message);
      })
    })
  }
}
