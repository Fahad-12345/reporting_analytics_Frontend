import {
	EventEmitter,
	Injectable,
} from '@angular/core';

import { BehaviorSubject } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class CasesServiceService {
	updateCase: BehaviorSubject<boolean> = new BehaviorSubject(false);

	constructor() {
		this.caseServiceEventEmitter.subscribe((data) => {
			this.updateCaseObsevable(true);
		});
	}
	private patient: any;
	private accident: any;
	private caseId: any;
	private contactInfo: any;

	getUpdatedData: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

	private patientDetail: any;
	getContactInfo() {
		return this.contactInfo;
	}
	caseServiceEventEmitter = new EventEmitter();
	getCaseEventEmitter() {
		return this.caseServiceEventEmitter;
	}
	setContactInfo(contactInfo) {
		this.contactInfo = contactInfo;
		this.getUpdatedData.next(true);
	}
	getCaseObservable() {
		return this.updateCase;
	}

	getCaseId() {
		return this.caseId;
	}
	setCaseId(caseId) {
		this.caseId = caseId;
		this.getUpdatedData.next(true);
	}

	getPatient() {
		return this.patient;
	}
	setPatient(patient) {
		this.patient = patient;
		this.getUpdatedData.next(true);
	}
	getAccident() {
		return this.accident;
	}
	setAccident(accident) {
		this.accident = accident;
		this.getUpdatedData.next(true);
	}
	updateCaseObsevable(bool: boolean) {
		this.updateCase.next(bool);
	}
	getPatientDetail() {
		return this.patientDetail;
	}
	setPatientDetail(patientDetail) {
		this.patientDetail = patientDetail;
		this.getUpdatedData.next(true);
	}
}
