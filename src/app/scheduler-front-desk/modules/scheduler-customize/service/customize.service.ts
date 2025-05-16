import { Injectable } from '@angular/core';

import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';

import { customizeUrlsEnum } from '../customize-urls-enum';

@Injectable({
	providedIn: 'root',
})
export class CustomizeService {
	constructor(public requestService: RequestService) {}

	updateColour(data) {
		return this.requestService.sendRequest(
			customizeUrlsEnum.udpateColour,
			'PUT',
			REQUEST_SERVERS.schedulerApiUrl1,

			{ ...data },
		);
	}
	deleteColour(url, data) {
		return this.requestService.sendRequest(
			url,
			'PUT',
			REQUEST_SERVERS.schedulerApiUrl1,

			{ ...data },
		);
	}

	fetchLocations(params) {
		{
			return this.requestService.sendRequest(
				customizeUrlsEnum.fetchFacilites,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				params,
			);
		}
	}

	setDefaultColour(url, body) {
		return this.requestService.sendRequest(url, 'PUT', REQUEST_SERVERS.schedulerApiUrl1, {
			...body,
		});
	}
}
