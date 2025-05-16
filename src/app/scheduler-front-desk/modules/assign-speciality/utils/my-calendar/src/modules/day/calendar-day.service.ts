import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class CalendarDayService {
    public result:any=[];
    public assignDoc:any=[];
    public speciality: any;
    public clinic: any;
    public numberOfDoc:any;
    public currentStartDate: Date;
    public currentEndDate: Date;
    public specAssignId:any;
    public specialityForDeleteModal:any;
    public clinicForDeleteModal:any;
    public allClinics: any;
    public allSpeciality: any;
    public specIdForDeleteModal:any;
    public recIdForDeleteModal:any;
    constructor() {
    }

}
