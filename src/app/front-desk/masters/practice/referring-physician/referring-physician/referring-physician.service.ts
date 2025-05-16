import { removeEmptyAndNullsFormObject } from '@shared/utils/utils.helpers';
import { Injectable } from '@angular/core';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { BehaviorSubject } from 'rxjs';
import { ReferringPhysicianUrlsEnum } from './referringPhysicianUrlsEnum';

@Injectable({
	providedIn: 'root',
})
export class ReferringPhysicianService {
	locationModalClose$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	locationModalSave$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isAdd_Update_Location$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	nowGetAllClinics$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	nowCloseSecondaryLocationModal$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isAddOrUpdateUserTemplate$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	constructor(private requestService: RequestService) {}
	AddNewClinicWithPrimaryLocation(params) {
		return this.requestService.sendRequest(
			ReferringPhysicianUrlsEnum.ADD_NEW_CLINIC_WITH_PRIMARY_LOCATION,
			'post',
			REQUEST_SERVERS.fd_api_url,
			removeEmptyAndNullsFormObject(params),
		);
	}
	AddNewClinicWithSecondaryLocation(params) {
		return this.requestService.sendRequest(
			ReferringPhysicianUrlsEnum.ADD_NEW_SECONDARY_LOCATION,
			'post',
			REQUEST_SERVERS.fd_api_url,
			removeEmptyAndNullsFormObject(params),
		);
	}
	GetClinics(params) {
		return this.requestService.sendRequest(
			ReferringPhysicianUrlsEnum.GET_CLINICS,
			'get',
			REQUEST_SERVERS.fd_api_url,
			removeEmptyAndNullsFormObject(params),
		);
	}
	GetClinicsWithLocation(params) {
		return this.requestService.sendRequest(
			ReferringPhysicianUrlsEnum.GET_CLINIC_WITH_LOCATIONS,
			'get',
			REQUEST_SERVERS.fd_api_url,
			removeEmptyAndNullsFormObject(params),
		);
	}
	deleteClinic(params) {
		return this.requestService.sendRequest(
			ReferringPhysicianUrlsEnum.DELETE_CLINIC,
			'delete',
			REQUEST_SERVERS.fd_api_url,
			removeEmptyAndNullsFormObject(params),
		);
	}
	UpdateClinic(params) {
		return this.requestService.sendRequest(
			ReferringPhysicianUrlsEnum.UPDATE_CLINIC,
			'put',
			REQUEST_SERVERS.fd_api_url,
			removeEmptyAndNullsFormObject(params),
		);
	}
	UpdateSingleClinicLocation(params) {
		return this.requestService.sendRequest(
			ReferringPhysicianUrlsEnum.UPDATE_SINGLE_LOCATION,
			'put',
			REQUEST_SERVERS.fd_api_url,
			params,
		);
	}
	changeStatusClinicLocation(params) {
		return this.requestService.sendRequest(
			ReferringPhysicianUrlsEnum.CHANGE_STATUS,
			'get',
			REQUEST_SERVERS.fd_api_url,
			removeEmptyAndNullsFormObject(params),
		);
	}
	GetSingleClinicsWithSingleLocation(params) {
		return this.requestService.sendRequest(
			ReferringPhysicianUrlsEnum.GET_SINGLE_CLINIC_WITH_SINGLE_LOCATION,
			'get',
			REQUEST_SERVERS.fd_api_url,
			removeEmptyAndNullsFormObject(params),
		);
	}
	getPhysicianLists(queryParams) {
		return this.requestService.sendRequest(
			ReferringPhysicianUrlsEnum.PHYSICIAN_LISTING,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			queryParams,
		);
	}
	addNewReffringPhysician(queryParams) {
		return this.requestService.sendRequest(
			ReferringPhysicianUrlsEnum.ADD_NEW_PHYSICIAN,
			'POST',
			REQUEST_SERVERS.fd_api_url,
			queryParams,
		);
	}
	deletePhysicianByIDs(queryParams) {
		return this.requestService.sendRequest(
			ReferringPhysicianUrlsEnum.DELETE_PHYSICIAN,
			'delete',
			REQUEST_SERVERS.fd_api_url,
			queryParams,
		);
	}
	getRefferingPhysicianByID(queryParams) {
		return this.requestService.sendRequest(
			ReferringPhysicianUrlsEnum.GET_SINGLE_PHYSICIAN,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			queryParams,
		);
	}
	UpdateReffering(queryParams) {
		return this.requestService.sendRequest(
			ReferringPhysicianUrlsEnum.UPDATE_SINGLE_PHYSICIAN,
			'PUT',
			REQUEST_SERVERS.fd_api_url,
			queryParams,
		);
	}
	UpdateRefferingPhysicianClinic(queryParams) {
		return this.requestService.sendRequest(
			ReferringPhysicianUrlsEnum.UPDATE_SINGLE_PHYSICIAN_CLINIC,
			'PUT',
			REQUEST_SERVERS.fd_api_url,
			queryParams,
		);
	}
}
