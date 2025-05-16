import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-manual-specialities',
	templateUrl: './manual-specialities.component.html',
	styleUrls: ['./manual-specialities.component.scss']
})
export class ManualSpecialitiesComponent implements OnInit {

	constructor() { }
	appointmentDetail: any
	ngOnInit() {
		this.appointmentDetail = JSON.parse(localStorage.getItem('templateObj'))
	}

}
