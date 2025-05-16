import { Injectable } from '@angular/core';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';

@Injectable({
  providedIn: 'root'
})
export class CalendarMonthService {
  private access_token: any;
  public eventsDay: any = [];
  public startDate: Date;
  public appointments: any = [];
  constructor(private storageData: StorageData,
    ) {
    this.access_token = this.storageData.getToken()
  }


}
