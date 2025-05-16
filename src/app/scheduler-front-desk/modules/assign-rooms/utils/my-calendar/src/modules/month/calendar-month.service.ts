import { Injectable } from '@angular/core';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';

@Injectable({
  providedIn: 'root'
})
export class CalendarMonthService {
  private access_token: string;
  public eventsDay: any = [];
  public startDate: Date;
  public currentStartDate: Date;
  public currentEndDate: Date;
  public selectedData: any = [];
  public isSwap: any;
  public appointments: any = [];
  constructor(private storageData: StorageData,
   ) {
    this.access_token = JSON.stringify(this.storageData.getToken())
  }


}
