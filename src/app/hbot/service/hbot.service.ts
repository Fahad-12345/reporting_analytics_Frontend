import { Injectable } from '@angular/core';

import { documentManagerUrlsEnum } from '@appDir/front-desk/documents/document-manager-Urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { Observable, Subject, map } from 'rxjs';

import {
	HBOTSeederData,
	HBOTSession,
} from '../models/seederData.model';

@Injectable({
	providedIn: 'root',
})
export class HbotService {
	private appointmentDetail: any;
	private sessionData: any;
	private seederData: HBOTSeederData;
	private hbotSession: HBOTSession;
	finalizeClickHandler = new Subject<number>();
	constructor(public requestService: RequestService) {}

	setbtnClickedVal(btnClicked){
		this.finalizeClickHandler.next(btnClicked);
	}
	getbtnClickedVal(){
		return this.finalizeClickHandler.asObservable();
	}
	initializeAppointmentDetail(app_detail) {
		this.appointmentDetail = app_detail;
	}
	getAppointmentDetail() {
		return this.appointmentDetail;
	}

	initializeSession(session) {
		this.sessionData = session;
	}
	getSession() {
		return this.sessionData;
	}

	initializeSeederData(seederData: HBOTSeederData) {
		this.seederData = seederData;
	}
	getSeederData(): HBOTSeederData {
		return this.seederData;
	}

	initializeHBOTSession(session) {
		this.hbotSession = session;
	}
	getHBOTSession() {
		return this.hbotSession;
	}

	clearSignature(body) {
		return this.requestService
			.sendRequest(
				documentManagerUrlsEnum.clearSignature,
				'post',
				REQUEST_SERVERS.document_mngr_api_path,
				body,
			).pipe(
			map((response) => {
				return response;
			}));
	}
}
