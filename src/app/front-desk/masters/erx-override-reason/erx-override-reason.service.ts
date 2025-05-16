import { ErxOverrideReasonEnum } from './erx-override-reasonEnum';
import { Injectable } from '@angular/core';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Subject } from 'rxjs';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
@Injectable({
	providedIn: 'root'
})
export class ErxOverrideReasonService {
	isActionComplete = new Subject<any>(); // CHECK WHEN ANY ACTION
	constructor(private requestService: RequestService, private location: Location, private router: Router) { }
	// DISPLAY PARAMS IN URL
	addUrlQueryParams(params?) {
		this.location.replaceState(
			this.router.createUrlTree([], { queryParams: params, }).toString()
		);
	}
	// ------------------------------------------ LISTS ------------------------------------------------
	// LIST OF ERX OVERRIDE REASON / FILTER OF ERX OVERRIDE REASON
	getErxOverrideReason(queryParams) {
		return this.requestService.sendRequest(
			ErxOverrideReasonEnum.ErxOverrideReason.concat(ErxOverrideReasonEnum.ErxOverrideReasonLists),
			'GET',
			REQUEST_SERVERS.fd_api_url,
			queryParams
		);
	}
	// ------------------------------------------ ADD NEW ------------------------------------------------
	// ADD NEW ERX OVERRIDE REASON
	addNewErxOverrideReason(queryParams) {
		return this.requestService.sendRequest(
			ErxOverrideReasonEnum.ErxOverrideReason.concat(ErxOverrideReasonEnum.ErxOverrideReasonAdd),
			'POST',
			REQUEST_SERVERS.fd_api_url,
			queryParams
		);
	}

	editErxOverrideReason(queryParams) {
		return this.requestService.sendRequest(
			ErxOverrideReasonEnum.ErxOverrideReason.concat(ErxOverrideReasonEnum.ErxOverrideReasonUpdate),
			'POST',
			REQUEST_SERVERS.fd_api_url,
			queryParams
		);
	}
	// ------------------------------------------ GET BY ID ------------------------------------------------
	// SINGLE ERX OVERRIDE REASON / ERX OVERRIDE REASON BY ID
	getErxOverrideReasonByID(queryParams) {
		return this.requestService.sendRequest(
			ErxOverrideReasonEnum.ErxOverrideReason.concat(ErxOverrideReasonEnum.ErxOverrideReasonGet) + '?id=' + queryParams,
			'GET',
			REQUEST_SERVERS.fd_api_url,
		);
	}
	// ------------------------------------------ DELETE BY ID ------------------------------------------------
	// DELETE ERX OVERRIDE REASON
	deleteErxOverrideReasonByID(queryParams) {
		return this.requestService.sendRequest(
			ErxOverrideReasonEnum.ErxOverrideReason.concat(ErxOverrideReasonEnum.ErxOverrideReasonDelete) ,
			'POST',
			REQUEST_SERVERS.fd_api_url,
			queryParams
		);
	}
}
