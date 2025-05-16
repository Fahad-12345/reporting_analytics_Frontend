import { Injectable } from '@angular/core';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { BehaviorSubject } from 'rxjs';

@Injectable()

export class DoctorCalendarService {
	public gatherAllInfoForCreateModal: any;
	public loadSpin: boolean = false;
	public chartNo = 1;
	public updateModalData: any;
	public appId: any;
	public deleteAppId: any = [];
	public startDate: any;
	public endDate: any;
	public unavailabilityId: any;
	public notesStartDate: any;
	public patientName: any;
	public doctorName: any;
	public id;
	public updateModalObject: any;
	public access_token: any = '';
	createAppDate: Date;
	appointmentTitle: any;
	appointmentsModal: any;
	appointmentsOne: any;
	appointmentsTwo: any;
	currentDoc: any=[];
	//selected specialtites and/or doctors
	currentDocAndSpec: any;  
	
	//selected Clinic/location
	selectedClinic: any;

	//Highlighted Date Cell
	currentSelectedDate: any = -1;


	//To check which Calender to Load (Manual or Provider)
	//true incase of Manual Calendar
	public PatientSchedulingCalendar: boolean;
	walkinNotSeen: { caseId: any; notSeen: any;patient_not_seen_reason:any; };
	//

	timeOfFacility = new BehaviorSubject({status: false});

	constructor(
		private storageData: StorageData) {
	}
	ngOnInit() {
		this.access_token = this.storageData.getToken();
		this.id = JSON.stringify(this.storageData.getUserId());
	}
	setTimeofFacility(event: any){
		this.timeOfFacility.next(event);
	}

	getTimeofFacility(){
		return this.timeOfFacility.asObservable();
	}
}
