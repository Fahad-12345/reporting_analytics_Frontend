import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class CalendarWeekService {
    public result:any=[];
    public assignDoc:any=[];
    public speciality: any;
    public clinic: any;
    public numberOfDoc:any;
    public currentStartDate: Date;
    public currentEndDate: Date;
    public specAssignId:any;
    public specialityForDeleteModal:any;
	public specialityQualifierForDeleteModal:any;
    public clinicForDeleteModal:any;
	public clinicQualifierForDeleteModal:any;

    public allClinics: any;
    public allSpeciality: any;
    public available_speciality_ForDeleteModal:any;
    public date_list_id_ForDeleteModal:any;
    constructor() {
    }

}
