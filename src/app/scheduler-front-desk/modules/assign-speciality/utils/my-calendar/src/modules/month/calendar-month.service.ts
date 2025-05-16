import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';

@Injectable({
  providedIn: 'root'
})
export class CalendarMonthService {
  public result: any = [];
  public assignDoc: any = [];
  public speciality: any;
  public clinic: any;
  public numberOfDoc: any;
  public specAssignId: any;
  public currentStartDate: Date;
  public currentEndDate: Date;
  public specialityForDeleteModal: any;
  public specialityQualifierForDeleteModal: any;
  public clinicForDeleteModal: any;
  public clinicQualifierForDeleteModal: any;
  public allClinics: any;
  public allSpeciality: any;
  public available_spec_Id_ForDeleteModal: any;
  public date_list_id_ForDeleteModal: any;

  private access_token: string;
  constructor(private storageData: StorageData,
   ) {
  }
  ngOnInit() {
    this.access_token = JSON.stringify(this.storageData.getToken())

  }


}
