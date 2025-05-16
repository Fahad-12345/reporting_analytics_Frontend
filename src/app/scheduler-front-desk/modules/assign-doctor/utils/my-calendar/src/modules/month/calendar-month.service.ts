import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class CalendarMonthService {

    public speciality: any; 
    public clinic: any;
    public specAssignId:any;
    public currentStartDate: Date;
    public currentEndDate: Date; 
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
    public recCheckForUpdate:any
    constructor() {
    }

}
