import { Component, OnInit } from '@angular/core';
// import { LocalStorage } from '@shared/libs/localstorage';

@Component({
	selector: 'app-medical-doctor',
	templateUrl: './medical-doctor.component.html',
	styleUrls: ['./medical-doctor.component.scss']
})
export class MedicalDoctorComponent implements OnInit {
	// public localStorageId: string;
	// public can_access_doctor_calendar = false;
	// public can_access_notification = false;
	// public can_access_waiting_list_doctor = false;
	// public can_access_customize = false;
	// public can_access_cancelled_appointment = false;
	// public can_access_waiting_list = false;
	// public can_access_room = false;
	// public can_access_appointment_list = false;
	// public can_access_assignment = false;
	// public is_super_admin: boolean = false;
	// public can_access_schedule_list = false;

	constructor(
		// private localStorage: LocalStorage

	) {
		// this.localStorageId = window.localStorage.getItem('userId')

	}

	ngOnInit() {

	}

	isSideNavClosed: boolean = false;
	onSideNavChange($event) {
		// this.isSideNavClosed = $event;
		setTimeout(()=>{
			this.isSideNavClosed = $event;
		},0)
	}	



}
