import { BehaviorSubject, map, Subject } from 'rxjs';
import { Injectable } from "@angular/core";
import { REQUEST_SERVERS } from "@appDir/request-servers.enum";
import { AddToBeSchedulledUrlsEnum } from "@appDir/scheduler-front-desk/modules/add-to-be-scheduled/add-to-be-scheduled-list-urls-enum";
import { AssignSpecialityUrlsEnum } from "@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum";
import { OrderEnum, ParamQuery } from "@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class";
import { RequestService } from "@appDir/shared/services/request.service";
import { removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';

@Injectable({
	providedIn: 'root',
})
export class SoftPatientService {

	addSoftPatientProviderCalandar:boolean=false;
	selectCaseInfoTab = new Subject<number>();
	addNewSoftPatientThroughPatientProfile = new BehaviorSubject<number>(0);
	patientProfileRoute = false;
	patientFormValidation = false;
	closePopUp = new BehaviorSubject<boolean>(false);
	closeSoftPatinetPopUpProviderCalender=new Subject<any>()
	patientCaseInfo=new Subject<any>()
	constructor(private requestService: RequestService,)
	{

	}	
	getMasterProviders(queryParams?) {
			return this.requestService.sendRequest(
				AddToBeSchedulledUrlsEnum.get_master_provider,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				queryParams,
			).pipe(map(response=>{
				response.result.data.map(provider=>{
					if(provider && provider.userBasicInfo)
					{
						provider['full_name']=provider && provider.userBasicInfo?`${provider.userBasicInfo.first_name}${provider.userBasicInfo.middle_name?+' '+provider.userBasicInfo.middle_name:''} ${provider.userBasicInfo.last_name}`:null
						provider['doctor_id']=provider && provider.userBasicInfo?provider.userBasicInfo.user_id:null
					}
					
				})
				return response
			}));
			// return this.requestService.sendRequest('search_clinic', 'get', REQUEST_SERVERS.fd_api_url, params)
		}

		getMasterSpecialities(queryParams) 
		{
			return this.requestService
			.sendRequest(
				AssignSpecialityUrlsEnum.get_master_specialities,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				removeEmptyAndNullsFormObject(queryParams),
			)
		}
	
	pushCaseInfoTab(data: any){
		this.selectCaseInfoTab.next(data);
	}

	pullCaseInfoTab(){
		return this.selectCaseInfoTab.asObservable();
	}

	pushAddNewSoftPatientThroughPatientProfile(data: any){
		this.addNewSoftPatientThroughPatientProfile.next(data);
	}

	pullAddNewSoftPatientThroughPatientProfile(){
		return this.addNewSoftPatientThroughPatientProfile.asObservable();
	}
	pushPatientCaseInfo(data: any){
		this.patientCaseInfo.next(data);
	}

	pullPatientCaseInfo(){
		return this.patientCaseInfo.asObservable();
	}
	pushClosePopup(data: any){
		this.closePopUp.next(data);
	}

	pullClosePopup(){
		return this.closePopUp.asObservable();
	}
	

}
