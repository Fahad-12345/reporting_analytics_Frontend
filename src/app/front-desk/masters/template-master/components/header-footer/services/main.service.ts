import { FacilityUrlsEnum } from '@appDir/front-desk/masters/practice/practice/utils/facility-urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { TemplateMasterUrlEnum } from '@appDir/front-desk/masters/template-master/template-master-url.enum';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MainServiceTemp {
	constructor(private requestService: RequestService){}

	get_facility_location() {
	  var params: ParamQuery = { filter: true, order: OrderEnum.ASC, pagination: false } as any
  
	  return this.requestService.sendRequest(TemplateMasterUrlEnum.Facility_list_dropdown_GET, 'get', REQUEST_SERVERS.fd_api_url, params)
	  // return this.requestService.sendRequest('search_clinic', 'get', REQUEST_SERVERS.fd_api_url, params)
  }
}
