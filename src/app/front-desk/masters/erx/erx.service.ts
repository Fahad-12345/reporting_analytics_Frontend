import { queryParams } from '@syncfusion/ej2-base';
import { RequestService } from '@appDir/shared/services/request.service';
import { Injectable } from '@angular/core';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { VerificationTypeUrlsEnum } from '../billing/billing-master/VerificationType-Urls-Enum';
import { ErxEnum } from './erxEnum';
import { Subject, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
@Injectable({
	providedIn: 'root'
})
export class ErxService {
	isLicenseAttached = new Subject<any>(); // CHECK WHEN ATTACHED PROVIDER/DOCTOR
	isUserStatusActive = new BehaviorSubject(false); // CHECK WHEN USER STATUS IS ACTIVE THEN DISPLAY MANAGE ACCOUNT
	constructor(private requestService: RequestService, private location: Location, private router: Router) { }
	// DISPLAY PARAMS IN URL
	addUrlQueryParams(params?) {
		this.location.replaceState(
			this.router.createUrlTree([], { queryParams: params, }).toString()
		);
	}
	// ------------------------------------------ LISTS ------------------------------------------------
	// LIST OF PHARMACY / FILTER OF PHARMACY
	get_pharmacy_lists(queryParams) {
		return this.requestService.sendRequest(
			ErxEnum.Pharmacy_Lists,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			queryParams
		);
	}
	// LIST OF PROOFING LICENSE / FILTER OF PROOFING LICENSE
	getProofingLicenseLists(queryParams) {
		return this.requestService.sendRequest(
			ErxEnum.Proofing_License_Lists,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			queryParams
		);
	}
	// LIST OF PHARMACY TYPES
	getPharmacyTypesLists() {
		return this.requestService.sendRequest(
			ErxEnum.PharmacytTypesLists,
			'GET',
			REQUEST_SERVERS.fd_api_url,
		);
	}
	// LIST OF PHARMACY SERVICE LEVELS
	getPharmacyLevelsLists() {
		return this.requestService.sendRequest(
			ErxEnum.PharmacyServiceLevelsLists,
			'GET',
			REQUEST_SERVERS.fd_api_url,
		);
	}
	// LIST OF MEDICAL DOCTORS
	getMedicalDoctorsLists(queryParams) {
		return this.requestService.sendRequest(
			ErxEnum.Medical_Doctors_Lists_By_Proofing_License_ID,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			queryParams
		);
	}
	// LIST OF USER LICENSE STATUS
	get_licenseLists(queryParams) {
		return this.requestService.sendRequest(
			ErxEnum.User_License_Lists_Status,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			queryParams
		);
	}
	// LIST OF HISTORY IN ID PROOFING IN USER MODULE
	get_historyLists(queryParams) {
		return this.requestService.sendRequest(
			ErxEnum.IdProofingHistory,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			queryParams
		);
	}
	// ------------------------------------------ ADD NEW ------------------------------------------------
	// GET NEW LICENSE
	getNewLicense() {
		return this.requestService.sendRequest(
			ErxEnum.Get_New_Proofing_License,
			'GET',
			REQUEST_SERVERS.fd_api_url,
		);
	}
	getUserLicenseStatusLists() {
		return this.requestService.sendRequest(
			ErxEnum.User_License_Lists_Status,
			'GET',
			REQUEST_SERVERS.fd_api_url,
		);
	}
	// ------------------------------------------ GET BY ID ------------------------------------------------
	// SINGLE PHARMACY / PHARMACY BY ID
	getPharmacyByID(queryParams) {

		return this.requestService.sendRequest(
			ErxEnum.Pharmacy_By_ID + '?id=' + queryParams,
			'GET',
			REQUEST_SERVERS.fd_api_url,

		);
	}
	// SINGLE PHARMACY / PHARMACY BY ID
	getProofingLicenseByID(queryParams) {
		return this.requestService.sendRequest(
			ErxEnum.Proofing_License_By_ID + '?id=' + queryParams,
			'GET',
			REQUEST_SERVERS.fd_api_url,
		);
	}
	// ------------------------------------------ ASSIGN ------------------------------------------------
	// ASSIGN DOCTOR
	assignDoctor(queryParms) {
		return this.requestService.sendRequest(
			ErxEnum.Attach_License_Doctor,
			'POST',
			REQUEST_SERVERS.fd_api_url,
			queryParms
		);
	}
	// ------------------------------------------ PROOFING ------------------------------------------------
	// START PROOFING
	startProofing(queryParams) {
		return this.requestService.sendRequest(
			ErxEnum.Start_Proofing,
			'POST',
			REQUEST_SERVERS.fd_api_url,
			queryParams
		);
	}
	// RESUME PROOFING
	resumeProofing() {
		return this.requestService.sendRequest(
			ErxEnum.Resume_Proofing,
			'GET',
			REQUEST_SERVERS.fd_api_url
		);
	}
	// CANCEL PROOFING
	cancelProofing() {
		return this.requestService.sendRequest(
			ErxEnum.Cancel_Proofing,
			'GET',
			REQUEST_SERVERS.fd_api_url
		);
	}
	// CURRENT PROOFING
	currentProofing() {
		return this.requestService.sendRequest(
			ErxEnum.Current_Proofing,
			'GET',
			REQUEST_SERVERS.fd_api_url
		);
	}
	// REVOKE PROOFING
	revokeProofing(queryParams?) {
		return this.requestService.sendRequest(
			ErxEnum.Revoke_Proofing,
			'POST',
			REQUEST_SERVERS.fd_api_url,
			queryParams
		);
	}
	// RENEWAL PROOFING
	renewalProofing(queryParams) {
		return this.requestService.sendRequest(
			ErxEnum.Renewal_Proofing,
			'POST',
			REQUEST_SERVERS.fd_api_url,
			queryParams
		);
	}
	// ALLOWED TYPES ERX
	getErxAllowedTypes() {
		return this.requestService.sendRequest(
			ErxEnum.Erx_Allowed_Types,
			'GET',
			REQUEST_SERVERS.fd_api_url
		);
	}
	// LAUNCH SESSION IN PROOFING / MANAGE ACCOUNT
	launchSession(queryParams) {
		return this.requestService.sendRequest(
			ErxEnum.Launch_Session_Manage_Account,
			'POST',
			REQUEST_SERVERS.fd_api_url,
			queryParams
		);
	}
	// Check status of dea records before id proofing

	checkDeaStatus(id) {
		return this.requestService.sendRequest(
			ErxEnum.check_dea_record+'?user_id='+id,
			'get',
			REQUEST_SERVERS.erx_fd_api,
			queryParams
		);
	}

}
