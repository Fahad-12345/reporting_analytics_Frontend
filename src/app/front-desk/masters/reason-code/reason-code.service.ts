import { ReasonCodeEnum } from './reasonCodeEnum';
import { Injectable } from '@angular/core';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Subject } from 'rxjs';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
@Injectable({
	providedIn: 'root'
})
export class ReasonCodeService {
	isActionComplete = new Subject<any>(); // CHECK WHEN ANY ACTION
	constructor(private requestService: RequestService, private location: Location, private router: Router) { }
	// DISPLAY PARAMS IN URL
	addUrlQueryParams(params?) {
		this.location.replaceState(
			this.router.createUrlTree([], { queryParams: params, }).toString()
		);
	}
	// ------------------------------------------ LISTS ------------------------------------------------
	// LIST OF REASON CODE / FILTER OF REASON CODE
	getReasonCodeLists(queryParams) {
		return this.requestService.sendRequest(
			ReasonCodeEnum.ErxReasonCode.concat(ReasonCodeEnum.ReasonCodeLists),
			'GET',
			REQUEST_SERVERS.fd_api_url,
			queryParams
		);
	}
	// LIST OF REASON CODE CATEGORIES / FILTER OF REASON CODE CATEGORIES
	getReasonCodeCategoriesLists(queryParams) {
		return this.requestService.sendRequest(
			ReasonCodeEnum.ErxReasonCodeCategory.concat(ReasonCodeEnum.ErxReasonCodeCategoryLists),
			'GET',
			REQUEST_SERVERS.fd_api_url,
			queryParams
		);
	}
	// ------------------------------------------ ADD NEW ------------------------------------------------
	// ADD NEW REASON CODE
	addNewReasonCode(queryParams) {
		return this.requestService.sendRequest(
			ReasonCodeEnum.ErxReasonCode.concat(ReasonCodeEnum.ReasonCodeAdd),
			'POST',
			REQUEST_SERVERS.fd_api_url,
			queryParams
		);
	}
	// ------------------------------------------ GET BY ID ------------------------------------------------
	// SINGLE REASON CODE / REASON CODE BY ID
	getReasonByID(queryParams) {
		return this.requestService.sendRequest(
			ReasonCodeEnum.ErxReasonCode.concat(ReasonCodeEnum.ReasonCodeGet) + '?id=' + queryParams,
			'GET',
			REQUEST_SERVERS.fd_api_url,
		);
	}
	// ------------------------------------------ DELETE BY ID ------------------------------------------------
	// DELETE REASON CODE
	deleteReasonByID(queryParams) {
		return this.requestService.sendRequest(
			ReasonCodeEnum.ErxReasonCode.concat(ReasonCodeEnum.ReasonCodeDelete) + '?id=' + queryParams,
			'POST',
			REQUEST_SERVERS.fd_api_url,
		);
	}
}
