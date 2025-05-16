import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MainService } from '@shared/services/main-service';
import { MDService } from '@appDir/medical-doctor/services/md/medical-doctor.service';
import { CarryForwardService } from '@appDir/medical-doctor/services/carry-forward/carry-forward.service';
import { AcceptedData } from '@appDir/medical-doctor/services/carry-forward/model/accepted-data';
import { Subscription } from 'rxjs';
import { PatientInfo } from './patient-info.class';
import { Evaluation } from '@appDir/medical-doctor/models/common/commonModels';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { calculateAge, getObjectChildValue, unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';

@Component({
	selector: 'app-sidebar-left',
	templateUrl: './sidebar-left.component.html',
})
export class SidebarLeftComponent implements OnInit, OnDestroy {
	public subscriptions: Subscription[] = [];
	public visitType: string;
	public imagePath: string;
	public gender: string;
	public data: PatientInfo;
	public links: any[] = [];

	/**
	 * Creates an instance of sidebar left component.
	 * @param router
	 * @param mainService
	 * @param MDService
	 * @param carryForwardService
	 */
	constructor(
		protected router: Router,
		public mainService: MainService,
		private MDService: MDService,
		private carryForwardService: CarryForwardService,
		private storageData:StorageData
	) {
		this.mainService.setPanelData();
		let session = this.MDService.getCurrentSession();
		if (session) {
			let data = new PatientInfo({});
			for (var key in data) {
				if (data.hasOwnProperty(key) && session['patient']) {
					data[key] = session['patient'][key];
				}
			}
			let age1 = calculateAge(new Date(session['patient']['dob']));
			let age = <any>age1 + ' Year';
			if (age1 > 1) {
				age += 's';
			}
			data.age = age + ' Old';
			if (session['session']) {
				data.alleviation = getObjectChildValue(session, null, [
					'session',
					'evaluation',
					'alleviation',
				]);
				data.headaches = getObjectChildValue(session, null, ['session', 'evaluation', 'headaches']);
				data.painAreas = getObjectChildValue(session, null, ['session', 'evaluation', 'painAreas']);
				data.chiefComplaints = getObjectChildValue(session, null, [
					'session',
					'evaluation',
					'chiefComplaints',
				]);
				data.illnessHistory = getObjectChildValue(session, null, [
					'session',
					'evaluation',
					'illnessHistory',
				]);
				data.accidentDate = getObjectChildValue(session, '', ['case', 'accident', 'accidentDate']);
			}
			this.imagePath = getObjectChildValue(session, '', ['patient', 'imagePath']);
			this.gender = getObjectChildValue(session, '', ['patient', 'gender']);
			this.visitType = getObjectChildValue(session, '', ['visitType']);
			this.data = data;
		}
	}

	/**
	 * Toggles carry forward
	 * @param link
	 */
	public toggleCarryForward(link) {
		this.carryForwardService.carryForwardClicked(link.carryForwarded);
	}

	/**
	 * on init
	 */
	public ngOnInit(): void {
		this.subscriptions.push(
			this.mainService.panelLeft.subscribe((links) => {
				this.links = links;
				if((this.storageData.getcurrentSession().visitType=='reEvaluation' || this.storageData.getcurrentSession().visitType=='followUp') && this.links.length){
					this.links=this.links.filter(link=>link._slug!='pastMedicalHistory')
				}
			}),
		);
		this.subscriptions.push(
			this.MDService.chiefComplaints.subscribe((evaluation: Evaluation) => {
				this.data.chiefComplaints = evaluation.chiefComplaints;
			}),
		);
		this.subscriptions.push(
			this.carryForwardService.acceptCarryForward.subscribe((acceptedData: AcceptedData) => {
				let link = this.links.find((link) => {
					return link.slug == acceptedData.link.slug;
				});
				if (link && acceptedData.accepted == true) {
					link.carryForwarded = !link.carryForwarded;
				}
			}),
		);
	}

	/**
	 * on changes
	 */
	ngOnChanges(): void {
		this.subscriptions.push(
			this.mainService.panelLeft.subscribe((links) => {
				this.links = links;
			}),
		);
	}

	/**
	 * Toggles drop
	 * @param link
	 */
	toggleDrop(link) {
		for (let x in this.links) {
			if (link.name != this.links[x].name) {
				this.links[x].drop = false;
			}
		}
		this.links = [...this.links];
		link.drop = !link.drop;
	}

	/**
	 * Resets link
	 */
	resetLink() {
		for (let x in this.links) {
			this.links[x].drop = false;
		}
		this.links = [...this.links];
	}

	/**
	 * Routes sidebar left component
	 * @param path
	 */
	route(path) {
		this.router.navigate([path]);
	}

	/**
	 * Finds in link
	 * @param links
	 * @param link
	 * @returns
	 */
	findInLink(links, link) {
		let found = false;
		if (links.subLinks) {
			for (let x in links.subLinks) {
				if (links.subLinks[x].link == link) {
					found = true;
				}
			}
		}
		return found;
	}

	/**
	 * Determines whether active is
	 * @param link
	 * @returns
	 */
	isActive(link) {
		switch (link.link) {
			case this.router.url:
				return true;
				break;

			case '/medical-doctor/current-complaints':
				if (this.router.url == '/medical-doctor/current-complaints-cont') {
					return true;
				}
				break;

			case '/medical-doctor/physical-examination':
				if (this.router.url == '/medical-doctor/physical-examination-cont') {
					return true;
				}
				break;

			case '/medical-doctor/plan-of-care':
				switch (this.router.url) {
					case '/medical-doctor/plan-of-care-cont':
					case '/medical-doctor/treatment-rendered':
						return true;
				}
				break;

			default:
				return false;
		}
	}

	/**
	 * on destroy
	 */
	ngOnDestroy() {
		unSubAllPrevious(this.subscriptions);
	}
}
