import { Component, OnInit } from '@angular/core';
import { MainService } from '@shared/services/main-service';
import { MDService } from '../services/md/medical-doctor.service';
import { Router } from '@angular/router';
import { Devices } from '../models/initialEvaluation/initialEvaluationModels';
import { ReferringSpecialty, SeededBodyPart, SeededSpecalty } from '../md-shared/seededInfo';
import { planOfCareTabs } from '../models/panel/panel';
import { MdLinks } from '../models/panel/model/md-links';
import { planOfCare1 } from '../models/common/commonModels';
import { PlanOfCareSeed } from './plan-of-care-seed';
import { ReferralSeed } from './referral-seed';
import { getObjectChildValue } from '@appDir/shared/utils/utils.helpers';

@Component({
	selector: 'app-plan-of-care',
	templateUrl: './plan-of-care.component.html',
	styleUrls: ['./plan-of-care.component.scss'],
})
export class PlanOfCareComponent implements OnInit {
	public tabLinks: MdLinks[];
	public currentScreen = 'planOfCare';
	public data: planOfCare1;
	public patientGender: string;
	public visitType: string;
	public devices: Devices[];
	public referralSeeds: ReferralSeed = new ReferralSeed({});
	public referringSpecialties: ReferringSpecialty[];
	public bodyParts: SeededBodyPart[] = [];
	public icdCodes: '';
	public specialities: SeededSpecalty;
	public planeOfCareSeeds: PlanOfCareSeed = new PlanOfCareSeed({});

	/**
	 * Creates an instance of plan of care component.
	 * @param router
	 * @param MDService
	 * @param mainService
	 */
	constructor(
		private router: Router,
		private MDService: MDService,
		private mainService: MainService,
	) {
		this.mainService.setPanelData();

		let session = MDService.getCurrentSession();
		this.patientGender = session['patient']['gender'];
		this.visitType = session['visitType'];
		this.data = getObjectChildValue(session, '', ['session', 'planOfCare']);
		this.icdCodes = getObjectChildValue(
			session,
			[],
			['session', 'diagnosticImpression', 'icd10_codes'],
		);
	}

	/**
	 * on init
	 */
	ngOnInit() {
		this.tabLinks = planOfCareTabs;
		let offlineData = this.MDService.getOfflineData();
		this.bodyParts = offlineData.bodyParts;
		this.referralSeeds.setSeeds({
			goals: offlineData.goals,
			modalities: offlineData.modalities,
			manual_therapies: offlineData.tharapies,
			excercises: offlineData.excercises,
			referrals: offlineData.referrals,
		});
		this.planeOfCareSeeds.setSeeds({
			ctScans: offlineData.ctScans,
			ultrasounds: offlineData.ultrasounds,
			radiologies: offlineData.radiologies,
			ctaAngiographies: offlineData.ctaAngiographies,
			mammographies: offlineData.mammographies,
			mrAngiographies: offlineData.mrAngiographies,
			mris: offlineData.mris,
			drugs: offlineData.drugs,
			dexa: offlineData.dexa,
		});
		this.specialities = offlineData.specialities;
		this.devices = offlineData.devices;
		this.referringSpecialties = offlineData.referring_specialties;
	}

	/**
	 * on destroy
	 */
	ngOnDestroy() {
		this.mainService.resetPanelData();
	}

	/**
	 * Next page
	 */
	nextPage() {
		this.router.navigate([`medical-doctor/plan-of-care-cont`]);
	}

	/**
	 * Previous page
	 */
	previousPage() {
		this.router.navigate([`medical-doctor/diagnostic-impression`]);
	}
}
