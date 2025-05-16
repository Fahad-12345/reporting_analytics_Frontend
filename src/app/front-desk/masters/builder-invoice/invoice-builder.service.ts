import { Injectable } from '@angular/core';
import { EnumApiPath } from '@appDir/front-desk/billing/Models/searchedKeys-modal';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InvoiceBuilderService {
  EnumApiPath = EnumApiPath;
  constructor(protected requestService: RequestService) {}

  getBillsAgainstSpecility(queryParams) {
    return this.requestService.sendRequest(
      EnumApiPath.get_bills_of_specilities,
      'GET',
      REQUEST_SERVERS.fd_api_url,
      queryParams
    );
  }
}
