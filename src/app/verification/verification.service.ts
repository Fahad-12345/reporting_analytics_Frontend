
import { Injectable } from '@angular/core';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { BehaviorSubject, of } from 'rxjs';
import { VerificationTypeUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/VerificationType-Urls-Enum';
import { VerificationUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/verification-status.enum';
import { VerificationBillEnum } from './verification-bill-enum';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';

@Injectable({
	providedIn: 'root',
})
export class VerificationService {
  public verificationId = new BehaviorSubject(null);
  public resetVerificationForm = new BehaviorSubject(false);
  public closedVerificationPopup = new BehaviorSubject(false);
  public reloadVerification = new BehaviorSubject(0);
  public reloadVerificationFilterList = new BehaviorSubject(false);
  public bill_ids: number;
  verificationTypeData:any[]=[];
  verificationStatusComingData:any[] = [];
  verification_received_id: any[];
	constructor(private requestService: RequestService, private storageData: StorageData) {}

	getVerificationById(id: number) {
		return this.requestService.sendRequest(
			VerificationBillEnum.VerificationGet + '/' + id,
			'GET',
			REQUEST_SERVERS.fd_api_url,
    );
	}

	verificationTypeList() {
    if(this.hasVerificationTypeList()){
      return	this.requestService.sendRequest(
        VerificationTypeUrlsEnum.VerificationType_list_GET,
        'GET',
        REQUEST_SERVERS.fd_api_url
      ); 
    }else{
      return of(this.verificationTypeData)
    }
  }
  
  pushVerificationId(id: number){
    this.verificationId.next(id);
  }

  pullVerificationId(){
    return this.verificationId.asObservable();
  }

  hasVerificationStatusList(): boolean {
	return this.verificationStatusComingData.length === 0;
}

setVerificationStatus(verificationStatusComingData: any[]) {
	this.verificationStatusComingData = verificationStatusComingData;
}

getVerificationStatus(params) {
	if (this.hasVerificationStatusList()) {
		return this.requestService.sendRequest(
			VerificationUrlsEnum.Verification_list_Status_GET,		
			'GET',
			REQUEST_SERVERS.fd_api_url,
			params,
		);
	} else {
		return of(this.verificationStatusComingData);
	}
}

  pushVerificationForm(status: boolean){
    this.resetVerificationForm.next(status);
  }

  pullVerificationForm(){
    return this.resetVerificationForm.asObservable();
  }

  pushclosedVerificationPopup(status: boolean){
    this.closedVerificationPopup.next(status);
  }

  pullclosedVerificationPopup(){
    return this.closedVerificationPopup.asObservable();
  }

  pushReloadVerification(id: number){
    this.bill_ids = id;
    this.reloadVerification.next(id);
  }

  pullReloadVerification(){
    return this.reloadVerification.asObservable();
  }

  setVerificationType(verificationType: any[]){
       this.verificationTypeData = verificationType;
	}


  hasVerificationTypeList(): boolean {
    return this.verificationTypeData.length === 0 ;
  }

  reloadVerificationAfterAdd(){
		this.reloadVerification.next(this.bill_ids);
	}

	isBillId(): boolean{
		return this.bill_ids != 0 ? true: false; 
  }
  
  setVerificationReceivedId(id: any[]){
    this.verification_received_id = id;
  }

  getVerificationReceivedId(){  
    return this.verification_received_id;
  }

  getSingleInfoVerification(id: number){
    return this.requestService
				.sendRequest(
					VerificationBillEnum.VerificationSentGet + '/' + id,
					'GET',
					REQUEST_SERVERS.fd_api_url
				)
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

  pushVerificationViewFilterListReload(status: boolean){
    this.reloadVerificationFilterList.next(status);
  }

  pullVerificationViewFilterListReload(){
    return this.reloadVerificationFilterList.asObservable();
  }

  


}
