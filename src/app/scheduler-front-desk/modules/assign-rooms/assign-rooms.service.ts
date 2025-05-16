import { Injectable } from '@angular/core';

//http

import { Config } from '../../../config/config';
import { LocalStorage } from "../../../shared/libs/localstorage";
import { environment } from '../../../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
@Injectable()

export class AssignRoomsService {
    public roomForModal: any = [];
    public deleteAll: any = []
    public deleteSelected: any = []
    public selectedClinicName: any
    public requirementForDeleteModal: any
    private doctors = new BehaviorSubject<any>([]);
    cast = this.doctors.asObservable();

    private room = new BehaviorSubject<any>([]);
    castRoom = this.room.asObservable();

    private clinics = new BehaviorSubject<any>([]);
    castClinics = this.clinics.asObservable();
    public selectedClinicId; any;
    private access_token: any;
    currentStartDate: Date;
    currentEndDate: Date;
    isSwap: any;
    selectedData: any;

    constructor(
        private storageData: StorageData,
        private localStorage: LocalStorage) {
        this.access_token = JSON.stringify(this.storageData.getToken())
    }


    public refreshDoctors(docs) {
        this.doctors.next(docs)
    }
    public refreshClinics(data) {
        this.clinics.next(data)
    }
    public refreshRoom(data) {
        this.room.next(data)
    }
}
