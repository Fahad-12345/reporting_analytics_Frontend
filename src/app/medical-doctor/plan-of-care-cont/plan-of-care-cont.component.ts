import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MDService } from '../services/md/medical-doctor.service';
import { MainService } from '@shared/services/main-service';
import { MdLinks } from '../models/panel/model/md-links';
import { planOfCareTabs } from '../models/panel/panel';

@Component({
	selector: 'app-plan-of-care-cont',
	templateUrl: './plan-of-care-cont.component.html',
	styleUrls: ['./plan-of-care-cont.component.scss'],
})
export class PlanOfCareContComponent implements OnInit {
	public tabLinks: MdLinks[];
	patientGender;
	visitType: string;
	data;
	public currentScreen = 'workStatus';
	constructor(
		private router: Router,
		private MDService: MDService,
		private mainService: MainService,
	) {
		this.mainService.setPanelData();
		let session = MDService.getCurrentSession();
		this.patientGender = session['patient']['gender'];
		this.visitType = session['visitType'];
		// this.visitType = 'reEvaluation';
		////////////Initialize data from localstorage if there is any/////////////////////
		//////////////////////////////////////////////////////////////////////////////////
		if (session['session'] && session['session']['workStatus']) {
			this.data = session['session']['workStatus'];
		}
		//////////////////////////////////////////////////////////////////////////////////
	}
	ngOnInit() {
		this.tabLinks = planOfCareTabs;
	}

	ngOnDestroy() {
		this.mainService.resetPanelData();
	}

	nextPage() {
		this.router.navigate([`medical-doctor/treatment-rendered`]);
	}
	previousPage() {
		this.router.navigate([`medical-doctor/plan-of-care`]);
	}
}
