import { Injectable } from '@angular/core';
import { LocalStorage } from '@shared/libs/localstorage';
import { Config } from 'app/config/config';
import { HttpHeaders, HttpParams, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError, Subject } from 'rxjs';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { AddressComponent } from 'ngx-google-places-autocomplete/objects/addressComponent';
import { map, tap, catchError } from 'rxjs/operators';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Router } from '@angular/router';
import { RequestService } from '@appDir/shared/services/request.service';
import { CaseFlowServiceService } from './case-flow-service.service';
import { HBOTUrlEnums } from '@appDir/hbot/HBOTUrlEnums.enum';
import { SpecialityUrlsEnum } from '@appDir/front-desk/masters/providers/speciality/specialities-listing/Speciality-urls-enum';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';


@Injectable({
	providedIn: 'root'
})
export class FDServices {
	constructor(private http: HttpClient, private localStorage: LocalStorage, private config: Config, private storageData: StorageData, private router: Router, private requestService: RequestService, private caseFlowService: CaseFlowServiceService) {
		this.setUserCapabilities();
	}

	public url: string;
	private userCapabilities = new BehaviorSubject<Object>({});
	current_UserCapabilities = this.userCapabilities.asObservable();

	public case = new BehaviorSubject<Object>({});
	public currentCase = this.case.asObservable();

	public caseId = new BehaviorSubject<any>(0);
	currentCaseId = this.caseId.asObservable();
	public start: any;
	public end: any;
	public patients: any[];

	// billing service starts from here
	// hcpcs functions ends here
	// ----------------------------------------------------------------


	// region related function ends here ----------------------------------------------

	// employer related function starts from here
	private createNewFolderSubject = new Subject();
	createFolderOb = this.createNewFolderSubject.asObservable();

	isEmpty(obj) {
		for (let key in obj) {
			if (obj.hasOwnProperty(key)) {
				return false;
			}
		}
		return true;
	}

	setUserCapabilities() {
		const token = this.localStorage.get('token');
		//  const tokenPayload = decode(token);
		//  this.userCapabilities.next(tokenPayload);
	}

	getUserCapabilities() {
		this.userCapabilities;
	}

	setCase(obj) {
		// console.log("setCase",obj);
		// if("id" in obj){
		//   this.caseId.next(obj.id);
		// }
		this.case.next(obj);
	}


	getCase() {
		return this.case;
	}

	createFolder(folderData: any) {
		this.createNewFolderSubject.next(folderData);
	}

	getCaseTypes(): Observable<any> {
		const filter = `{"order": "position ASC"}`;
		this.url = this.config.getConfig('kiosk_api_path') + 'CaseTypes?filter=' + encodeURIComponent(filter);
		return this.http.get(this.url);
	}

	getPurposeOfVisits(): Observable<any> {
		const filter = `{"order": "position ASC"}`;
		this.url = this.config.getConfig('kiosk_api_path') + 'PurposeOfVisits?filter=' + encodeURIComponent(filter);
		return this.http.get(this.url);
	}

	getSpecialitiesByPuposeOfVisit(id: number): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'PurposeOfVisits/' + id + '/specialities';
		return this.http.get(this.url);
	}

	updateCase(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'Cases/' + formData['caseId'];
		return this.http.patch(this.url, formData);
	}

	searchPatients(formData): Observable<any> {

		this.url = this.config.getConfig('kiosk_api_path') + 'patients/fd/patient-listing';
		return this.http.post(this.url, formData);
	}
	createpatient(formData): Observable<any> {

		this.url = this.config.getConfig('kiosk_api_path') + 'session';
		return this.http.post(this.url, formData);
	}

	/*	createVisit(formData): Observable<any> {
			this.url = this.config.getConfig('kiosk_api_path') + 'Visits';
			return this.http.post(this.url, formData);
		}*/

	createVisitSession(formData): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'VisitSessions/createVisitSessionKiosk';
		return this.http.post(this.url, formData);
	}

	saveNotes(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'PatientAddressInfos';
		return this.http.patch(this.url, formData);
	}

	getPatienCount() {
		this.url = this.config.getConfig('kiosk_api_path') + 'patients/count';
		return this.http.get(this.url);

	}

	getPatients(): Observable<any> {
		// let filter = `filter[limit]=10&filter[skip]=0&filter[order]=id+DESC`
		const filter = `filter[order]=id+DESC`;
		this.url = this.config.getConfig('kiosk_api_path') + 'patients/all?' + filter;
		return this.http.get(this.url);
	}

	deletePatients(formData: any): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'patients/fd/remove-patient';
		return this.http.post(this.url, formData);
	}

	getPatientSummaryPDF(id: number): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'GeneratePdfs/createPdf?data={"caseId": ' + id + ',"name": "patientSummary", "provider": "","multiple": false}';
		return this.http.post(this.url, '');
	}

	deleteInjuryWitness(formData: any): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'InjuryWitnesses/fd/removeInjuryWitness';
		return this.http.post(this.url, formData);
	}

	deleteCases(formData: any): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'cases/fd/remove-cases';
		return this.http.post(this.url, formData);
	}

	getCasesWithLimit(patientId, start, end): Observable<any> {
		const filter = '?filter[limit]=' + end + '&filter[skip]=' + start + '&filter[include]=attorney&filter[include]=patientInsuranceCompanies&filter[include]=insuranceCompany&filter[include]=caseInsurances&filter[include]=caseType&filter[where][type]=WC&filter[include]=accident';
		this.url = this.config.getConfig('kiosk_api_path') + 'patients/' + patientId + '/cases' + filter;
		return this.http.get(this.url);
	}

	getFilteredCases(formData?: any): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'patients/fd/searchCases-v3';
		return this.http.post(this.url, formData);
	}

	searchCases(pageNumber, pageSize, patientId, formData?: any): Observable<any> {
		// let filters =  '?pageSize='+ pageSize +'&pageNumber='+ pageNumber + '&patientId='+patientId;
		// if(formData){
		//   filters = filters  +'&caseType='+formData.caseType+'&claimNo='+formData.claimNo+'&insurance='+formData.insurance+'&dateOfAccident='+formData.dateOfAccident+'&caseId='+formData.caseId;
		// }
		this.url = this.config.getConfig('kiosk_api_path') + 'patients/fd/searchCases';
		return this.http.post(this.url, formData);
	}

	getCaseCount(pateintId) {
		this.url = this.config.getConfig('kiosk_api_path') + 'patients/' + pateintId + '/cases/count';
		return this.http.get(this.url);

	}

	getCasesbyPatientId(patientId: number): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'patients/fd/patientAllCases?patientId=' + patientId;
		return this.http.get(this.url);
	}

	getPatient(id: number): Observable<any> {
		// let filter = '?filter[include]=patientAddressInfos'; //&filter[include]=contactPersons
		this.url = this.config.getConfig('kiosk_api_path') + 'patients/fd/patient-contact-person?patientId=' + id;
		return this.http.get(this.url);
	}



	updatePatient(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'patients/' + formData['id'];
		return this.http.patch(this.url, formData);
	}

	addPatientAddress(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'PatientAddressInfos';
		return this.http.post(this.url, formData);
	}

	updatePatientAddress(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'PatientAddressInfos/' + formData['id'];
		return this.http.patch(this.url, formData);
	}

	// ********************************************************************************
	/**
	 * All User API's
	 */
	// ********************************************************************************

	getUsers(): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'users/get_all_users';
		const token = this.localStorage.get('token');
		this.url += '?token=' + token;
		return this.http.get(this.url);
	}

	getAllPrivaleges(): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'all_privileges';
		const token = this.localStorage.get('token');
		this.url += '?token=' + token;
		return this.http.get(this.url);
	}


	getUserSearch(formData: Object): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'users/search_user';
		const token = this.localStorage.get('token');
		this.url += '?token=' + token;
		let params = new HttpParams();
		if (Object.keys(formData).length) {
			Object.keys(formData).forEach(key => {
				params = params.append(key, formData[key]);
			});
			return this.http.get(this.url, { params: params });
		}
	}

	searchICDIct(query, type, code_type_id,page=1,speciality_id?) {
		const formData = {
			name: query,
			type: type,
			code_type_id,
			order: OrderEnum.ASC,
			pagination: true,
			filter: false,
			per_page: 10,
			page: page,
			speciality_id:speciality_id
		};
	let newFormData = removeEmptyAndNullsFormObject(formData);
		return this.requestService.sendRequest(HBOTUrlEnums.GETCODES, 'get', REQUEST_SERVERS.fd_api_url, newFormData)


	}

	getUser(id: number): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'users/' + id;
		this.url += '?token=' + this.localStorage.get('token');
		return this.http.get(this.url);
	}

	deleteUser(id: number, appointment_action): Observable<any> {
		//   console.log('answer', answer);
		if (appointment_action === null) {
			this.url = this.config.getConfig('fd_api_url') + 'users/delete/' + id;
			this.url += '?token=' + this.localStorage.get('token');
			return this.http.delete(this.url);
		}
		if (appointment_action == true || appointment_action === false) {
			if (appointment_action == true) {
				appointment_action = 1;
			} else if (appointment_action == false) {
				appointment_action = 0;
			}
			this.url = this.config.getConfig('fd_api_url') + 'users/delete/' + id + appointment_action;
			this.url += '?token=' + this.localStorage.get('token');
			return this.http.delete(this.url);
		}
	}

	addUser(formData: any): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'users/register';
		const token = this.localStorage.get('token');
		this.url += '?token=' + token;
		return this.http.post(this.url, formData);
	}

	updateUser(formData: any): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'users/update';
		this.url += '?token=' + this.localStorage.get('token');
		return this.http.put(this.url, formData);
	}

	
	getRoles(): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'roles';
		this.url += '?token=' + this.localStorage.get('token');
		return this.http.get(this.url);
	}

	public getComponentByType(address: Address, type: string): AddressComponent {
		if (!type) {
			return { long_name: '', short_name: '', types: [] };
		}


		if (!address || !address.address_components || address.address_components.length == 0) {
			return { long_name: '', short_name: '', types: [] };
		}

		type = type.toLowerCase();

		if (type == 'locality') {
			var array = ['sublocality_level_1', 'locality', 'administrative_area_level_3', 'administrative_area_level_2'];
			var result = null;
			address.address_components.forEach(comp => {


				if (comp.types) {
					if (comp.types.length > 0) {
						if (comp.types.includes(array[0]) || comp.types.includes(array[1]) || comp.types.includes(array[2]) || comp.types.includes(array[3])) {
							if (!result) {
								result = comp;
							}

						}
					}
				}


				// for (const comp of address.address_components) {
				//   if (!comp.types || comp.types.length == 0) {
				//     continue;
				//   }

				//   console.log('debug here!!!!!!!!!')
				//   if (comp.types.findIndex(x => x.toLowerCase() == _type) > -1) {

				//     return comp;
				//   }
				// }
			});
			if (result) {
				(result.long_name as string).toLowerCase() == 'the bronx' ? result.long_name = 'Bronx' : null
				result.long_name = result.short_name
				return result;
			} else {
				return { long_name: '', short_name: '', types: [] };
			}
		} else {
			for (const comp of address.address_components) {
				if (!comp.types || comp.types.length == 0) {
					continue;
				}

				if (comp.types.findIndex(x => x.toLowerCase() == type) > -1) {
					(comp.long_name as string).toLowerCase() == 'the bronx' ? comp.long_name = 'Bronx' : null
					comp.long_name = comp.short_name
					return comp;
				}
			}
		}


		return { long_name: '', short_name: '', types: [] };
	}

	touchAllFields(form) {
		// touch all fields to show the error
		debugger;
		Object.keys(form.controls).forEach(field => {
			const control = form.get(field);
			debugger;
			control.markAsTouched({ onlySelf: true });
		});
	}

	getPatientListing(): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'Patients/fd/getPatientCase';
		return this.http.get(this.url);
	}


	// Get RElationships from Kiosk DB
	getRelations(): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'relations/get-all';
		return this.http.get(this.url);
	}

	// Get RElationships from Kiosk DB
	getContactPersonTypes(): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'ContactPersonTypes';
		return this.http.get(this.url);
	}

	getReferrals(): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'RefferedBies';
		return this.http.get(this.url);
	}

	getAdvertisements(): Observable<any> {
		const filter = '{"where":{"parentId": 0}}';
		this.url = this.config.getConfig('kiosk_api_path') + 'Advertisements';
		return this.http.get(this.url);
	}

	getBodyParts(formData?:any): Observable<any> {
		let params = new HttpParams();
		if (Object.keys(formData).length) {
			Object.keys(formData).forEach(key => {
				params = params.append(key, formData[key]);
			});
		}
		this.url = this.config.getConfig('kiosk_api_path') + 'body-parts/get-sensations';
		return this.http.get(this.url, { params: params});
	}
	
	

	getSensations(id: number): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'BodyParts/' + id + '/sensations';
		return this.http.get(this.url);
	}

	// ********************************************************************************
	/**
	 * All Document Upload API
	 */
	// ********************************************************************************

	uploadDocument(formData): Observable<any> {
		this.url = this.config.getConfig('document_mngr_api_path') + 'upload-files-by-folder';
		return this.http.post(this.url, formData);
	}


	addDirector(formData): Observable<any> {
		this.url = this.config.getConfig('document_mngr_api_path') + 'create-patient-case-directory-by-document-manager';

		// ;
		return this.http.post(this.url, formData);

		// return this.requestService.sendRequest('create-patient-case-directory-by-document-manager', 'post', REQUEST_SERVERS.document_mngr_api_path, formData)
	}

	emailDocument(formData): Observable<any> {
		this.url = this.config.getConfig('document_mngr_api_path') + 'email';
		return this.http.post(this.url, formData);
	}

	mergeDocuments(formData): Observable<any> {
		this.url = this.config.getConfig('document_mngr_api_path') + 'merge-files';
		return this.http.post(this.url, formData);
	}

	copyDocument(formData): Observable<any> {
		this.url = this.config.getConfig('document_mngr_api_path') + 'copy-file';
		return this.http.post(this.url, formData);
	}

	moveDocument(formData): Observable<any> {
		this.url = this.config.getConfig('document_mngr_api_path') + 'move-file';
		return this.http.post(this.url, formData);
	}

	deleteDocument(formData): Observable<any> {
		this.url = this.config.getConfig('document_mngr_api_path') + 'delete-file-by-ids';
		return this.http.post(this.url, formData);
	}

	downloadDocument(id) {
		this.url = this.config.getConfig('document_mngr_api_path') + 'download/' + id;

		window.open(this.url);
		// return this.http.get(this.url);
	}

	getAllFoldersAndFilesByCase(formData): Observable<any> {
		this.url = this.config.getConfig('document_mngr_api_path') + 'get-all-folders-and-files-by-objectId';
		return this.http.post(this.url, formData);
	}

	getAllFoldersList(formData): Observable<any> {
		this.url = this.config.getConfig('document_mngr_api_path') + 'get-all-folders-by-objectId';
		return this.http.post(this.url, formData);
	}

	getAllComonTags(formData): Observable<any> {
		this.url = this.config.getConfig('document_mngr_api_path') + 'get-common-tags';
		return this.http.post(this.url, formData);
	}

	addNewTag(formData): Observable<any> {
		this.url = this.config.getConfig('document_mngr_api_path') + 'add-tag';
		return this.http.post(this.url, formData);
	}

	updatedFiles(formData): Observable<any> {
		console.log('Update API', formData);
		this.url = this.config.getConfig('document_mngr_api_path') + 'get-all-files-by-folder-id';
		return this.http.post(this.url, formData);
	}

	searchFiles(formData): Observable<any> {
		// console.log('formData', formData);
		this.url = this.config.getConfig('document_mngr_api_path') + 'search-file';
		return this.http.post(this.url, formData);
	}

	getDocuments(caseId: number): Observable<any> {
		const filter = '{"where":{"caseId" : ' + caseId + ', "type": {"neq": "pdf"}}}';
		this.url = this.config.getConfig('kiosk_api_path') + 'Media?filter=' + encodeURIComponent(filter);
		return this.http.get(this.url);
	}

	getSurgicalTypes(): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'TypeOfSurgeries';
		return this.http.get(this.url);
	}

	// ********************************************************************************
	/**
	 * All Doctors API
	 */
	// ********************************************************************************

	getDoctors(docId?: number): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'doctors';

		if (docId != null) {
			this.url += '/speciality/' + docId;
		}
		const token = this.localStorage.get('token');
		this.url += '?token=' + token;
		return this.http.get(this.url);
	}

	addDoctor(formData: object): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'doctors/add';
		const token = this.localStorage.get('token');
		this.url += '?token=' + token;
		return this.http.post(this.url, formData);
	}

	getSingleDoctor(id: number): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'doctors/' + id;
		const token = this.localStorage.get('token');
		this.url += '?token=' + token;
		return this.http.get(this.url);
	}

	updateDoctor(formData: object): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'doctors/update';
		const token = this.localStorage.get('token');
		this.url += '?token=' + token;
		return this.http.put(this.url, formData);
	}

	deleteDoctor(id: number): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'doctors/delete/' + id;
		const token = this.localStorage.get('token');
		this.url += '?token=' + token;
		return this.http.delete(this.url);
	}

	// ********************************************************************************
	/**
	 * All Specialities API
	 */
	// ********************************************************************************
	private getHeader() {
		return {
			headers: new HttpHeaders({
				'Authorization': 'Bearer ' + this.storageData.getToken(),

			})
		};
	}


	getSpecialities(pageNumber?, pageSize?): Observable<any> {
		// this.url = this.config.getConfig('fd_api_url') + 'speciality';
		if (pageNumber > 0 || pageSize > 0) {
			this.url = this.config.getConfig('fd_api_url') + SpecialityUrlsEnum.Speciality_list_Get + `?page=${pageNumber}&per_page=${pageSize}`;
			const token = this.localStorage.get('token');
			this.url += '&token=' + token;
		} else {
			this.url = this.config.getConfig('fd_api_url') + SpecialityUrlsEnum.Speciality_list_Get;
			const token = this.localStorage.get('token');
			this.url += '?token=' + token;
		}
		// const token = this.localStorage.get('token');
		// this.url += '&token=' + token;
		return this.http.get(this.url);
	}


	// specialities/add
	addSpecialities(formData: any): Observable<any> {
		// this.url = this.config.getConfig('fd_api_url') + 'speciality/add';
		this.url = this.config.getConfig('fd_api_url') + SpecialityUrlsEnum.Speciality_list_POST;
		const token = this.localStorage.get('token');
		this.url += '?token=' + token;
		return this.http.post(this.url, formData);
	}

	// Speciality/delete/
	deleteSpeciality(id: number): Observable<any> {
		// this.url = this.config.getConfig('fd_api_url') + 'speciality/delete/' + id;
		this.url = this.config.getConfig('fd_api_url') + SpecialityUrlsEnum.Speciality_list_Delete + id;
		const token = this.localStorage.get('token');
		this.url += '?token=' + token;
		return this.http.delete(this.url);
	}

	// Speciality/update
	updateSpeciality(formData: any): Observable<any> {
		// this.url = this.config.getConfig('fd_api_url') + 'speciality/update';
		this.url = this.config.getConfig('fd_api_url') + SpecialityUrlsEnum.Speciality_list_PUT;
		const token = this.localStorage.get('token');
		this.url += '?token=' + token;
		return this.http.put(this.url, formData);
	}

	searchSpecialityByName(name): Observable<any> {
		this.url = this.config.getConfig('fd_api_url');
		const token = this.localStorage.get('token');
		return this.http.get(`${this.url}search_speciality?name=${name}&token=${token}`);
	}


	// ********************************************************************************
	/**
	 * All Case APIs
	 */
	// ********************************************************************************


	getCaseDetail(caseId: number): Observable<any> {
		return this.caseFlowService.getCase(caseId)
	}

	// private handleError(error: Response) {
	//   return observableThrowError(error.statusText);
	// }

	// ********************************************************************************
	/**
	 * All Attorney API's
	 */
	// ********************************************************************************

	updateAttorney(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'Attorneys';
		return this.http.patch(this.url, formData);
	}

	addAttorney(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'Attorneys';
		return this.http.post(this.url, formData);
	}

	// ********************************************************************************
	/**
	 * All Referring API's
	 */
	// ********************************************************************************

	addReferring(formData): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'ReferringDoctors';
		return this.http.post(this.url, formData);
	}

	updateReferring(formData, id): Observable<any> {
		// let id = formData['reffering_physician'] ? formData['reffering_physician']['case_id'] : formData['primary_physician']['case_id']
		this.url = this.config.getConfig('kiosk_api_path') + 'session/update/' + id;
		return this.http.put(this.url, formData);
	}

	// ********************************************************************************
	/**
	 * All Insurance API's
	 */
	// ********************************************************************************


	addInsuranceCompany(formData: any): Observable<any> {
		// InsuranceCompanies
		this.url = this.config.getConfig('kiosk_api_path') + 'InsuranceCompanies';
		return this.http.post(this.url, formData);
	}

	updateInsuranceCompany(formData: any): Observable<any> {
		// InsuranceCompanies
		this.url = this.config.getConfig('kiosk_api_path') + 'InsuranceCompanies/' + formData['id'];
		return this.http.patch(this.url, formData);
	}

	getAllInsurancesCompanies(term): Observable<any> {
		// this.config.getConfig('fd_api_url') + "users/" + id;

		if (term === '') {
			return of([]);
		}

		this.url = 'https://apps.webarthub.com/ovada_md/api/insurance';

		const params = new HttpParams();

		return this.http
			.get(this.url, { params: params.set('name', term) }).pipe(
				map((res: Response) => {
					return res['result']['data'];
				})
			);
	}

	insurance_details(): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'insurance_details';
		const token = this.localStorage.get('token');
		this.url += '?token=' + token;
		return this.http.get(this.url);
	}

	// delete_insurance
	delete_insurance(id: number): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'delete_insurance/' + id;
		const token = this.localStorage.get('token');
		this.url += '?token=' + token;
		return this.http.delete(this.url);
	}

	// add_insurance
	add_insurance(formData: object): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'add_insurance';
		const token = this.localStorage.get('token');
		this.url += '?token=' + token;
		return this.http.post(this.url, formData);
	}

	updated_insurance(formData: object): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'updated_insurance';
		const token = this.localStorage.get('token');
		this.url += '?token=' + token;
		return this.http.put(this.url, formData);
	}

	// ********************************************************************************
	/**
	 * All Employers API's
	 */
	// ********************************************************************************

	addEmployer(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'Employers';
		return this.http.post(this.url, formData);
	}

	updateEmployer(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'Employers/' + formData['id'];
		return this.http.patch(this.url, formData);
	}

	addEmploymentInfo(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'PatientJobs';
		return this.http.post(this.url, formData);
	}

	updateEmploymentInfo(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'PatientJobs/' + formData['id'];
		return this.http.patch(this.url, formData);
	}

	getEmployerCaseTypes(): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'EmployerCaseTypes';
		return this.http.get(this.url);
	}

	deleteEmployer(formData: any): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'Employers/bulk-remove';
		return this.http.post(this.url, formData);
	}

	// ********************************************************************************
	/**
	 * All Injury API's
	 */
	// ********************************************************************************

	addInjury(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'Accidents';
		return this.http.post(this.url, formData);
	}

	updateInjury(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'Accidents/' + formData['id'];
		return this.http.patch(this.url, formData);
	}

	addPatientWorkDetails(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'PatientWorkDetails';
		return this.http.post(this.url, formData);
	}

	updatePatientWorkDetails(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'PatientWorkDetails/' + formData['id'];
		return this.http.patch(this.url, formData);
	}

	// AccidentDetails
	addAccidentDetails(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'AccidentDetails';
		return this.http.post(this.url, formData);
	}

	updateAccidentDetails(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'AccidentDetails/' + formData['id'];
		return this.http.patch(this.url, formData);
	}

	// PatientFirstTreatments
	addPatientFirstTreatment(formData: object, caseid: any): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'session/update/' + caseid;
		return this.http.post(this.url, formData);
	}

	updatePatientFirstTreatment(formData: object, caseid: any): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'session/update/' + caseid;
		return this.http.put(this.url, formData);
	}

	// OtherTreatments
	addOtherTreatments(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'OtherTreatments';
		return this.http.post(this.url, formData);
	}

	updateOtherTreatments(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'OtherTreatments/' + formData['id'];
		return this.http.patch(this.url, formData);
	}

	// InjuryWitnesses
	addInjuryWitnesses(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'InjuryWitnesses';
		return this.http.post(this.url, formData);
	}

	updateInjuryWitnesses(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'InjuryWitnesses/' + formData['id'];
		return this.http.patch(this.url, formData);
	}

	// OtherTreatmentDoctors
	addOtherTreatmentDoctors(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'OtherTreatmentDoctors';
		return this.http.post(this.url, formData);
	}

	updateOtherTreatmentDoctors(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'OtherTreatmentDoctors/' + formData['id'];
		return this.http.patch(this.url, formData);
	}

	// delete vehicle indos
	deleteOtherTreatmentDoctor(formData: any): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'OtherTreatmentDoctors/fd/removeOtherTreatmentDoctor';
		return this.http.post(this.url, formData);
	}

	// AccidentReports
	addAccidentReports(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'AccidentReports';
		return this.http.post(this.url, formData);
	}

	updateAccidentReports(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'AccidentReports/' + formData['id'];
		return this.http.patch(this.url, formData);
	}

	// delete vehicle indos
	deleteVehicleInfos(formData: any): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'VehicleInfos/bulk-remove';
		return this.http.post(this.url, formData);
	}

	// VehicleInfos
	addVehicleInfosData(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'VehicleInfos';
		return this.http.post(this.url, formData);
	}

	updateVehicleInfosData(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'VehicleInfos/' + formData['id'];
		return this.http.patch(this.url, formData);
	}

	// PeopleLivingWithPatients
	addPeopleLivingWithPatients(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'PeopleLivingWithPatients';
		return this.http.post(this.url, formData);
	}

	updatePeopleLivingWithPatients(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'PeopleLivingWithPatients/' + formData['id'];
		return this.http.patch(this.url, formData);
	}

	deletePeopleLivingWithPaient(formData: any): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'PeopleLivingWithPatients/bulk-remove';
		return this.http.post(this.url, formData);
	}

	addContactPeople(formData: object): Observable<any> {
		// ContactPeople
		this.url = this.config.getConfig('kiosk_api_path') + 'ContactPeople';
		return this.http.post(this.url, formData);
	}

	updateContactPeople(formData: object): Observable<any> {
		// ContactPeople
		this.url = this.config.getConfig('kiosk_api_path') + 'ContactPeople/' + formData['id'];
		return this.http.patch(this.url, formData);
	}

	// PatientSituationsVehicles
	addPatientSituationsVehicles(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'session';
		return this.http.post(this.url, formData);
	}

	updatePatientSituationsVehicles(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'session/' + formData['id'];
		return this.http.patch(this.url, formData);
	}

	// Get States
	getStates(): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'states';
		return this.http.get(this.url);
	}

	getCities(stateId: any): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'states/' + stateId + '/cities';
		return this.http.get(this.url);
	}

	// get cities by state name
	getCitiesByStateName(formDat: any): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'states/city-by-state-name';
		return this.http.post(this.url, formDat);
	}

	// Counties
	getCounties(): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'Counties';
		return this.http.get(this.url);
	}

	// get all symptoms
	getSymptoms(): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'Symptoms';
		return this.http.get(this.url);
	}

	// Save Case Symptoms
	saveCaseSymptoms(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'CaseSymptoms/saveCaseSymptoms';
		return this.http.post(this.url, formData);
	}

	// Cases/ReferredByAdvertisementBy
	addReferredByAdvertisementBy(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'Cases/ReferredByAdvertisementBy';
		return this.http.post(this.url, formData);
	}

	// Injuries/saveBodyPartsSensations
	saveBodyPartsSensations(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'Injuries/saveBodyPartsSensations';
		return this.http.post(this.url, formData);
	}

	// ********************************************************************************
	/**
	 * All Attorney API's
	 */
	// ********************************************************************************

	getAttornies(): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'attorney_details';
		const token = this.localStorage.get('token');
		this.url += '?token=' + token;
		return this.http.get(this.url);
	}

	// add_attorney
	addMastertorney(formData: any): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'add_attorney';
		const token = this.localStorage.get('token');
		this.url += '?token=' + token;
		return this.http.post(this.url, formData);
	}

	// add_attorney
	updateMastertorney(formData: any): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'update_attorney';
		const token = this.localStorage.get('token');
		this.url += '?token=' + token;
		return this.http.put(this.url, formData);
	}

	// add_attorney
	deleteMasterAttorney(id: number): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'delete_attorney/' + id;
		const token = this.localStorage.get('token');
		this.url += '?token=' + token;

		return this.http.delete(this.url);
	}

	// Schedular API
	exportExcelUrl(id) {
		this.url = this.config.getConfig('fd_api_url') + '/patient/' + id + '/export';
		return this.url;
	}

	registerUser(formData: object): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'users/register';
		this.url += '?token=' + this.localStorage.get('token');
		return this.http.post(this.url, formData);
	}

	deleteUsers(formData): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'users/delete';
		const token = this.localStorage.get('token');
		this.url += '?token=' + token;
		const options = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
			}),
			body: formData,
		};
		return this.http.delete<any>(this.url, options);
	}

	// ********************************************************************************
	/**
	 * All Providers API's
	 */
	// ********************************************************************************

	getProviders(): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'providers';
		const token = this.localStorage.get('token');
		this.url += '?token=' + token;
		return this.http.get(this.url);
	}

	// providers/delete/
	deleteProvider(id: number): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'providers/delete/' + id;
		const token = this.localStorage.get('token');
		this.url += '?token=' + token;
		return this.http.delete(this.url);
	}

	// providers/add
	addProvider(formData: any): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'providers/add';
		const token = this.localStorage.get('token');
		this.url += '?token=' + token;
		return this.http.post(this.url, formData);
	}

	// providers/1
	getProvider(id: number): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'providers/' + id;
		const token = this.localStorage.get('token');
		this.url += '?token=' + token;
		return this.http.get(this.url);
	}

	// providers/update
	updateProvider(formData: any): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'providers/update';
		const token = this.localStorage.get('token');
		this.url += '?token=' + token;
		return this.http.put(this.url, formData);
	}


	// ********************************************************************************
	/**
	 * All Diagnostic API's
	 */
	// ********************************************************************************
	updateSurgicalDetails(formData: object): Observable<any> {
		// SurgicalDetails
		this.url = this.config.getConfig('kiosk_api_path') + 'SurgicalDetails';
		return this.http.patch(this.url, formData);
	}

	addSurgicalDetails(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'SurgicalDetails';
		return this.http.post(this.url, formData);
	}

	// MedicalHistories
	addMedicalHistories(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'MedicalHistories';
		return this.http.post(this.url, formData);
	}

	updateMedicalHistories(formData: object): Observable<any> {
		this.url = this.config.getConfig('kiosk_api_path') + 'MedicalHistories/' + formData['id'];
		return this.http.patch(this.url, formData);
	}

	// http://18.216.104.240:4000/api/appointments/addAppointment
	addAppointment(formData: object): Observable<any> {
		this.url = this.config.getConfig('schedular_api_path') + 'appointments/addAppointment';
		return this.http.post(this.url, formData);
	}

	// http://18.216.104.240:4000/api/docAssigns/getDoctorAssigned
	getDoctorAssigned(formData: object): Observable<any> {
		this.url = this.config.getConfig('schedular_api_path') + 'docAssigns/getDoctorAssigned';
		return this.http.post(this.url, formData);
	}

	getAppointmentTypes(): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'appointments/types';
		const token = this.localStorage.get('token');
		this.url += '?token=' + token;
		return this.http.get(this.url);
	}

	getAppointmentPriorities(): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'appointments/priorities';
		const token = this.localStorage.get('token');
		this.url += '?token=' + token;
		return this.http.get(this.url);
	}

	getRooms(): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'rooms/all';
		const token = this.localStorage.get('token');
		this.url += '?token=' + token;
		return this.http.get(this.url);
	}

	// get_facility
	getFacilities(): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'clinics';
		return this.http.get(this.url);
	}

	// add_facility
	addFacility(formData: object): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'add_facility';
		this.url += '?token=' + this.localStorage.get('token');
		return this.http.post(this.url, formData);
	}

	updateFacility(formData: object): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'update_facility';
		this.url += '?token=' + this.localStorage.get('token');
		return this.http.put(this.url, formData);
	}

	// get_facility_type
	getFacilityTypes(): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'get_facility_type';
		this.url += '?token=' + this.localStorage.get('token');
		return this.http.get(this.url);
	}

	// delete_facility/:id
	deleteFacility(id: number): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'delete_facility/' + id;
		this.url += '?token=' + this.localStorage.get('token');
		return this.http.delete(this.url);
	}

	//// areas
	getAreas(): Observable<any> {
		this.url = this.config.getConfig('fd_apifd_api_url_url') + 'areas';
		this.url += '?token=' + this.localStorage.get('token');
		return this.http.get(this.url);
	}

	// create


	createInsurance(obj: any): Observable<any> {
		return this.http.post<any>(this.config.getConfig('billing_api_url') + 'insurances/create', obj, {
			headers: new HttpHeaders(
				{ 'Content-Type': 'application/json' }
			)
		});

	}

	// make ssn with dashes
	formatSSN(ssn: string): string {
		const str1 = ssn.substring(0, 3);
		const str2 = ssn.substring(3, 5);
		const str3 = ssn.substring(5);
		return str1 + '-' + str2 + '-' + str3;
	}

	// Format Phone No with dashes
	formatPhoneNo(phoneNo: string) {
		const str1 = phoneNo.substring(0, 3);
		const str2 = phoneNo.substring(3, 6);
		const str3 = phoneNo.substring(6);
		return str1 + '-' + str2 + '-' + str3;
	}

	// get method loc al
	//  getInsuranceData(): Observable<any> {
	//    return this.http.get<any>("http://localhost:9000/api/insurances").pipe(
	//      tap(data => console.log("get Data", data)),
	//      catchError(this.handleErrors)
	//    );
	//  }

	// get method on live server
	forPaginationOnly(pageNmber, paginate): Observable<any> {
		return this.http.get<any>(this.config.getConfig('billing_api_url') + pageNmber + '/' + paginate, {
			headers: new HttpHeaders({
				'Content-Type': 'application/json'
			})
		}).pipe(catchError(this.handleErrors));
	}

	getInsuranceData(pageNmber?: number, paginate?: number): Observable<any> {
		return this.http.get<any>(this.config.getConfig('billing_api_url') + `insurances/${pageNmber}/${paginate}`, {
			headers: new HttpHeaders(
				{ 'Content-Type': 'application/json' })
		}).pipe(
			// tap(data => console.log("get Data from live ", data)),
			catchError(this.handleErrors)
		);
	}

	getAllFacilities(): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'facility';
		const token = this.localStorage.get('token');
		this.url += '?token=' + token;
		return this.http.get(this.url);
	}

	getAllFacilitieLocation(): Observable<any> {
		this.url = this.config.getConfig('fd_api_url') + 'facility/locations-with-facility-name';
		const token = this.localStorage.get('token');
		this.url += '?token=' + token;
		return this.http.get(this.url);
	}

	// delete by id
	deleteInsuranceRecordById(row: any): Observable<any> {

		const options = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
			}),
			body: {
				id: row.id
			},
		};

		//  console.log("id is deleting", row.id);
		return this.http.delete<any>(this.config.getConfig('billing_api_url') + `insurances/destroy`, options);

	}


	deleteInsuranceMultiplerecord(rows: any): Observable<any> {
		const options = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
			}),
			body: {
				id: rows
			},
		};
		return this.http.delete<any>(this.config.getConfig('billing_api_url') + `insurances/destroyAll`, options);

	}

	private handleErrors(err: HttpErrorResponse) {
		let errorMessage = '';
		if (err.error instanceof ErrorEvent) {
			errorMessage = `An error occcured ${err.error.message}`;
		} else {
			errorMessage = `Server returned code  ${err.status} and error Message is ${err.message}`;
		}
		return throwError(errorMessage);
	}

	// update insurance record
	updateInsuranceRecord(form): Observable<any> {
		this.url = this.config.getConfig('billing_api_url') + `insurances/update`;
		// this.url = this.config.getConfig('fd_api_url') + "insurances/update";
		// this.url = this.config.getConfig('fd_api_url') + "insurances/update";
		//    return this.http.patch<void>(`http://localhost:9000/api/insurances/update`, options)
		this.url += '?token=' + this.localStorage.get('token');
		return this.http.patch(this.url, form);
	}


	

	// plan name in insurance starts here
	createPlanName(obj: any): Observable<any> {
		return this.http.post<any>(this.config.getConfig('billing_api_url') + `plan-name/create`, obj, {
			headers: new HttpHeaders(
				{ 'Content-Type': 'application/json' }
			)
		});

	}


	getPlanName(pageNumber?, pageSize?): Observable<any> {
		return this.http.get<any>(this.config.getConfig('billing_api_url') + `plan-name/${pageNumber}/${pageSize}`).pipe(
			tap(data => console.log('plan name data', data)),
			catchError(this.handleErrors)
		);
	}


	deletePlanNameById(row: any): Observable<any> {

		const options = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
			}),
			body: {
				id: row.id
			},
		};
		return this.http.delete<any>(this.config.getConfig('billing_api_url') + `plan-name/destroy`, options);

	}


	updatePlanName(form): Observable<any> {
		return this.http.patch<any>(this.config.getConfig('billing_api_url') + `plan-name/update`, form);
	}

	deleteMultiplePlanNameRecord(rows: any): Observable<any> {
		const options = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
			}),
			body: {
				id: rows
			},
		};
		return this.http.delete<any>(this.config.getConfig('billing_api_url') + `plan-name/destroyAll`, options);


	}

	
	uploadUserDocument(data: any): Observable<any> {
		this.url = this.config.getConfig('document_mngr_api_path') + 'staff-files-upload-by-document-manager';
		return this.http.post(this.url, data);
	}


	regionUsedFacilityDropDown(): Observable<any> {
		return this.http.get<any>(this.config.getConfig('billing_api_url') + 'region').pipe(
			tap(data => console.log('regionUsedFacilityDropDown', data)),
			catchError(this.handleErrors)
		);
	}
}
