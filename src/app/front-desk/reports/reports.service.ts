import { reportsUrlsEnum } from './report.enum';
import { Injectable } from '@angular/core';

import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { BillingEnum } from '../billing/billing-enum';
import { CaseTypeUrlsEnum } from '../masters/providers/caseType/case.type.enum';

@Injectable({
	providedIn: 'root',
})
export class ReportsService {
	constructor(public requestService: RequestService) {}

	getNf2ReportsCollection(url, filterParam?) {
		return this.requestService.sendRequest(url, 'GET', REQUEST_SERVERS.kios_api_path, filterParam);
	}
	generateCasePOM(params) {
		return this.requestService.sendRequest(BillingEnum.generteCasePOM, 'post', REQUEST_SERVERS.fd_api_url,params);
	}
	getCaseTypes(params) {
		return this.requestService.sendRequest(CaseTypeUrlsEnum.CaseType_list_GET, 'GET', REQUEST_SERVERS.fd_api_url,params);
	}

	getStatuses() {
		return this.requestService.sendRequest(
			'session/masters',
			'get',
			REQUEST_SERVERS.kios_api_path,
		);
	}

	getTransportationReportListing(params){
		return this.requestService.sendRequest(reportsUrlsEnum.TRANPORTATION_REPORT_LIST, 'POST', REQUEST_SERVERS.fd_api_url,params);

	}

	getAppointmentStatusReportListing(params){
		return this.requestService.sendRequest(reportsUrlsEnum.AppointmentStatus_REPORT_LIST, 'POST', REQUEST_SERVERS.fd_api_url,params);

	}

	getTransportationReportListingPDF(params){
		return this.requestService.sendRequest(reportsUrlsEnum.TRANSPORTATION_REPORT_PDF, 'POST', REQUEST_SERVERS.fd_api_url,params);

	}

	getSummaryReportListingPDF(params){
		return this.requestService.sendRequest(reportsUrlsEnum.Summary_REPORT_PDF, 'POST', REQUEST_SERVERS.fd_api_url,params);

	}
	
	getStatusReportListingPDF(params){
		return this.requestService.sendRequest(reportsUrlsEnum.Status_REPORT_PDF, 'POST', REQUEST_SERVERS.fd_api_url,params);

	}
}
