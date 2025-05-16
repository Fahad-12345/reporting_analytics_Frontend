import { ReactionEnum } from './reactionsEnum';
import { Injectable } from '@angular/core';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Subject } from 'rxjs';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
@Injectable({
	providedIn: 'root'
})
export class ReactionService {
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
			ReactionEnum.ErxReaction,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			queryParams
		);
	}
	// ------------------------------------------ ADD NEW ------------------------------------------------
	// ADD NEW REACTION
	addNewReaction(queryParams) {
		return this.requestService.sendRequest(
			ReactionEnum.ErxReaction.concat(ReactionEnum.ReactionsAdd),
			'POST',
			REQUEST_SERVERS.fd_api_url,
			queryParams
		);
	}
	// ------------------------------------------ GET BY ID ------------------------------------------------
	// SINGLE REACTION / REACTION BY ID
	getReactionByID(queryParams) {
		return this.requestService.sendRequest(
			ReactionEnum.ErxReaction.concat(ReactionEnum.ReactionsGet) + '?id=' + queryParams,
			'GET',
			REQUEST_SERVERS.fd_api_url,
		);
	}
	// ------------------------------------------ DELETE BY ID ------------------------------------------------
	// DELETE REACTION
	deleteReactionByID(queryParams) {
		return this.requestService.sendRequest(
			ReactionEnum.ReactionsDelete + '?id=' + queryParams,
			'POST',
			REQUEST_SERVERS.fd_api_url,
		);
	}
}
