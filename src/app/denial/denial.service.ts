import { DenialStatusUrlsEnum } from './../front-desk/masters/billing/billing-master/denial.status.enum';
import { Injectable } from '@angular/core';
import { DenialUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/Denial-Urls-Enum';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { BehaviorSubject, of } from 'rxjs';
import { DenialBillEnum } from './denial-bill-enum';

@Injectable({
	providedIn: 'root',
})
export class DenialService {
  public denialId = new BehaviorSubject(null);
  public resetDenialForm = new BehaviorSubject(false);
  public closedDenialPopup = new BehaviorSubject(false);
  public reloadDenial = new BehaviorSubject(0);
  public bill_ids: number;
  denialTypeData:any[]=[];
  denialStatusComingData:any[] = [];
	constructor(private requestService: RequestService, private storageData: StorageData) {}

	getDenialById(id: number) {
		return this.requestService.sendRequest(
			DenialBillEnum.DenialGet + '/' + id,
			'GET',
			REQUEST_SERVERS.fd_api_url,
		);
	}

	denialTypeList() {
    if(this.hasDenialTypeList()){
      return	this.requestService.sendRequest(
        DenialUrlsEnum.Denial_list_GET,
        'GET',
        REQUEST_SERVERS.fd_api_url
      ); 
    }else{
      return of(this.denialTypeData)
    }
  }
  
  pushDenialId(id: number){
    this.denialId.next(id);
  }

  pullDenialId(){
    return this.denialId.asObservable();
  }

  hasDenialStatusList(): boolean {
	return this.denialStatusComingData.length === 0;
}

setDenialStatus(denialStatusComingData: any[]) {
	this.denialStatusComingData = denialStatusComingData;
}

getDenialStatus(params) {
	if (this.hasDenialStatusList()) {
		return this.requestService.sendRequest(
			DenialStatusUrlsEnum.DenialStatus_list_GET,		
			'GET',
			REQUEST_SERVERS.fd_api_url,
			params,
		);
	} else {
		return of(this.denialStatusComingData);
	}
}

  pushDenialForm(status: boolean){
    this.resetDenialForm.next(status);
  }

  pullDenialForm(){
    return this.resetDenialForm.asObservable();
  }

  pushclosedDenialPopup(status: boolean){
    this.closedDenialPopup.next(status);
  }

  pullclosedDenialPopup(){
    return this.closedDenialPopup.asObservable();
  }

  pushReloadDenial(id: number){
    this.bill_ids = id;
    this.reloadDenial.next(id);
  }

  pullReloadDenial(){
    return this.reloadDenial.asObservable();
  }

  setDenialType(denialType: any[]){
       this.denialTypeData = denialType;
	}


  hasDenialTypeList(): boolean {
    return this.denialTypeData.length === 0 ;
  }

  reloadDenialAfterAdd(){
		this.reloadDenial.next(this.bill_ids);
	}

	isBillId(): boolean{
		return this.bill_ids != 0 ? true: false; 
  }
  
  viewDocFile(link) {
		if (link) {
			window.open(link);
		}
	}
	getLinkwithAuthToken(link) {
		let token = this.storageData.getToken();
		if (token) {
			return `${link}&token=${token}`;
		} else {
			return link;
		}
	}

}
