import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class CalendarWeekService { 
    public docAssignId:any;
    public speciality: any;
    public clinic: any;
    public specAssignId:any;
    public currentStartDate: Date;
    public specialityForDeleteModal:any;
    public clinicForDeleteModal:any;
    public allClinics: any;
    public allSpeciality: any;
    public specIdForDeleteModal:any;
    public recIdForDeleteModal:any;
    public clinicIdForDeleteModal:any;
    constructor() {
    }

}
