import { DeaScheduleCodeEnum } from './dea.schedule.codeEnum';
import { Injectable } from '@angular/core';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
@Injectable({
	providedIn: 'root'
})
export class DeaSchedulerCodenService {
	isActionComplete = new Subject<any>(); // CHECK WHEN ANY ACTION
	constructor(private requestService: RequestService, private location: Location, private router: Router) { }
	// DISPLAY PARAMS IN URL
	addUrlQueryParams(params?) {
		this.location.replaceState(
			this.router.createUrlTree([], { queryParams: params, }).toString()
		);
	}
	// ------------------------------------------ LISTS ------------------------------------------------
	// LIST OF REACTIONS / FILTER OF REACTIONS
	getReactionists(queryParams) {
		return this.requestService.sendRequest(
			DeaScheduleCodeEnum.ErxDeaSchedulerCode.concat(DeaScheduleCodeEnum.DeaSchedulerCodeLists),
			'GET',
			REQUEST_SERVERS.fd_api_url,
			queryParams
		);
	}
	// ------------------------------------------ ADD NEW ------------------------------------------------
	// ADD NEW ERX DEA SCHEDULER CODE
	addNewReaction(queryParams) {
		return this.requestService.sendRequest(
			DeaScheduleCodeEnum.ErxDeaSchedulerCode.concat(DeaScheduleCodeEnum.DeaSchedulerCodeAdd),
			'POST',
			REQUEST_SERVERS.fd_api_url,
			queryParams
		);
	}
	// ------------------------------------------ GET BY ID ------------------------------------------------
	// SINGLE ERX DEA SCHEDULER CODE / ERX DEA SCHEDULER CODE BY ID
	getReactionByID(queryParams) {
		return this.requestService.sendRequest(
			DeaScheduleCodeEnum.ErxDeaSchedulerCode.concat(DeaScheduleCodeEnum.DeaSchedulerCodeGet) + '?id=' + queryParams,
			'GET',
			REQUEST_SERVERS.fd_api_url,
		);
	}
	// ------------------------------------------ DELETE BY ID ------------------------------------------------
	// DELETE ERX DEA SCHEDULER CODE
	deleteReactionByID(queryParams) {
		return this.requestService.sendRequest(
			DeaScheduleCodeEnum.DeaSchedulerCodeDelete + '?id=' + queryParams,
			'POST',
			REQUEST_SERVERS.fd_api_url,
		);
	}
}
