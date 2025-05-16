import { Injectable } from '@angular/core';
import { LocalStorage } from "../../../shared/libs/localstorage";
import { Config } from './../../../config/config';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';

@Injectable({
  providedIn: 'root'
})
export class AssignSpecialityService {

  private accessToken: any;
  public id;
  public socket;

  constructor(private config: Config,
    private storageData: StorageData,
    private localStorage: LocalStorage) {


  }
  ngOnInit() {
    this.accessToken = this.storageData.getToken()
    this.id = JSON.stringify(this.storageData.getUserId());
    // this.socket = io(environment.schedulerApiUrl, {
    //   query: {
    //     "token": this.storageData.getToken(),
    //     "userId": this.id,
    //   },
    // });
  }
  getAssignSpec() {
    return Observable.create((observer) => {
      this.socket.on('getSpecialityAssignments', (message) => {
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
  
  events: Subject<Array<any>> = new BehaviorSubject<Array<any>>([]);


}
