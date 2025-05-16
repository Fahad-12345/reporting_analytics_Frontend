import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CalendarWeekService {
    public speciality: any;
    public clinic: any;
    public specAssignId:any;
    public currentStartDate: Date;
    public currentEndDate: Date;
    public startDate:Date;
  public eventsDay:any=[];

  public specialityForDeleteModal:any;
    public clinicForDeleteModal:any;
    public allClinics: any;
    public Event:any;
    public allSpeciality: any;
    public specIdForDeleteModal:any;
    public recIdForDeleteModal:any;
    public docName: any;
    public clinicName: any;
    public result:any = [];
    public updatedEventId:any;
    constructor() {
    }

}
