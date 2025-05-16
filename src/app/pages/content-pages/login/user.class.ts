import { Injectable } from "@angular/core";
import { Appointment } from "@appDir/medical-doctor/models/common/commonModels";
import { Menu } from "@appDir/shared/layouts/navbar/navbar.model";
import { LocalStorage } from "@appDir/shared/libs/localstorage";
import { getObjectChildValue, setDefaultTimeZone } from "@appDir/shared/utils/utils.helpers";
import { BehaviorSubject } from "rxjs";
import { Location as PracticeLocation } from '../../../front-desk/masters/practice/practice/utils/practice.class';

@Injectable({ providedIn: "root" })
export class StorageData {
	private storageData: UserData;
	private permissions: BehaviorSubject<string[]> = new BehaviorSubject<string[]>({} as string[])
	
	public defaultStorage = {
		user_id: 0,
		token: "",
		facility_id: 0,
		
		current_location_ids: [],
		speciality_id: 0,
		role: null,
		basic_info: null,
		scheduler: null,
		permissions: []
	};

	constructor(private localStorage: LocalStorage) {
		this.getLocalStorageData();
	}


	/**
	 * Clears data stored in localstorage
	 *
	 * @param void
	 * @returns {void}
	 */
	clear(): void {
		this.setPermissionsBehaviorSubject([]);
		this.localStorage.remove('data');
		this.localStorage.remove('nf2_options');
		// this.localStorage.remove('templateObj');
		// this.localStorage.remove('enableSaveRecordMedicalDoctor');
		
	}


	/**
	 * Get data from localstorage
	 *
	 * @param void
	 * @returns {void}
	 */
	private getLocalStorageData(): void {
		this.storageData = (this.localStorage.get("data")) ? JSON.parse(this.localStorage.get("data")) : this.defaultStorage;
	}


	/**
	 * Update data in localstorage
	 *
	 * @param data [UserData]
	 * @returns {void}
	 */
	updateLocalStorageData(data: UserData): void {
		this.localStorage.set('data', JSON.stringify(data));
	}

	/**
	 * set nf2_generated_by_options in localstorage
	 *
	 * @param data [UserData]
	 * @returns {void}
	 */
	set_nf2_generated_by_options_LocalStorageData(data: any): void {
		this.localStorage.set('nf2_options', JSON.stringify(data));
	}

	/**
	 * set enableSaveRecordMedicalDoctor in localstorage
	 *
	 * @param data [status]
	 * @returns {void}
	 */
	set_enableSaveRecordMedicalDoctor_LocalStorageData(status: any): void {
		this.getLocalStorageData();
		// this.storageData['currentSession']['session']['enableSaveRecordMedicalDoctor']=status
		this.storageData.enableSaveRecordMedicalDoctor=status
		this.updateLocalStorageData(this.storageData);
		
	}

	/**
	 * get enableSaveRecordMedicalDoctor in localstorage
	 *
	 * @param data [status]
	 * @returns {void}
	 */
	get_enableSaveRecordMedicalDoctor_LocalStorageData(): boolean {
		// return this.storageData&&this.storageData.currentSession&&this.storageData.currentSession.session&&this.storageData.currentSession.session.enableSaveRecordMedicalDoctor?this.storageData.currentSession.session.enableSaveRecordMedicalDoctor:false;
		
		// return	this.localStorage.get('enableSaveRecordMedicalDoctor')? JSON.parse(this.localStorage.get('enableSaveRecordMedicalDoctor')):false;
		return this.storageData && this.storageData.enableSaveRecordMedicalDoctor? this.storageData.enableSaveRecordMedicalDoctor:false
	}

	/**
	 * set enableSaveRecordManualSpeciality in localstorage
	 *
	 * @param data [status]
	 * @returns {void}
	 */
	set_enableSaveRecordManualSpeciality_LocalStorageData(status: any): void {
		this.getLocalStorageData();
		this.storageData.enableSaveRecordManualSpeciality=status;
		this.updateLocalStorageData(this.storageData);
		
	}

	/**
	 * get enableSaveRecordManualSpeciality in localstorage
	 *
	 * @param data [status]
	 * @returns {void}
	 */
	get_enableSaveRecordManualSpeciality_LocalStorageData(): boolean {
		return this.storageData && this.storageData.enableSaveRecordManualSpeciality? this.storageData.enableSaveRecordManualSpeciality:false
		// return	this.localStorage.get('enableSaveRecordMedicalDoctor')? JSON.parse(this.localStorage.get('enableSaveRecordMedicalDoctor')):false;
	}

	/**
	 * set enableSaveRecordManualSpeciality in localstorage
	 *
	 * @param data [status]
	 * @returns {void}
	 */
	set_enableSaveRecordHbot_LocalStorageData(status: any): void {
		// let templateObj=JSON.parse(localStorage.getItem('templateObj'))
		// templateObj.enableSaveRecordHbot=status;
		// localStorage.setItem('templateObj',templateObj);
		this.getLocalStorageData();
		this.storageData.enableSaveRecordHbot=status;
		this.updateLocalStorageData(this.storageData);
		
	}

	/**
	 * get enableSaveRecordManualSpeciality in localstorage
	 *
	 * @param data [status]
	 * @returns {void}
	 */
	get_enableSaveRecordHbot_LocalStorageData(): boolean {
		// let templateObj=JSON.parse(localStorage.getItem('templateObj'))
		// return templateObj&&templateObj.enableSaveRecordHbot&&templateObj.enableSaveRecordHbot?templateObj.enableSaveRecordHbot:false;
		return	this.storageData && this.storageData.enableSaveRecordHbot? this.storageData.enableSaveRecordHbot:false
	}



	



	/**
	 * get nf2_generated_by_options in localstorage
	 *
	
	 * @returns {any}
	 */
	get_nf2_generated_by_options_LocalStorageData(): any {
		let nf2_options=this.localStorage.get('nf2_options')? JSON.parse(this.localStorage.get('nf2_options')):[];
		return nf2_options
	}




	/**
	 * Save/Update users auth token
	 *
	 * @param token [string]
	 * @returns {void}
	 */
	setToken(token: string): void {
		this.getLocalStorageData();
		this.storageData.token = token;
		this.storageData.facility_location_ids
		this.updateLocalStorageData(this.storageData);
	}

	setSelectedFacilityLocationIds(practiceLocation:any)
	{
		this.getLocalStorageData();
		this.storageData.selected_facility_location_ids=practiceLocation;
		this.updateLocalStorageData(this.storageData);
	}

	getSelectedFacilityLocationIds()
	{
		this.getLocalStorageData();
		return this.storageData.selected_facility_location_ids || []
	}

	/**
	 * Get current user email address
	 *
	 * @param void
	 * @returns {string} logged in user's email address
	 */
	getEmail(): string {
		this.getLocalStorageData();
		return this.storageData.basic_info.email || '';
	}

	/**
	 * Returns saved user's auth token
	 *
	 * @param void
	 * @returns {string | boolean}
	 */
	getToken(): string | boolean {
		this.getLocalStorageData();
		return this.storageData.token || false;
	}

	isUserLoggedIn(): boolean {
		return (this.getToken() && this.getEmail()) ? true : false;
	}

	getBillingTitle():string{
		this.getLocalStorageData();
		return this.storageData.billing_title || '';
	}
	/**
	 * Returns current user's basic info object
	 *
	 * @param void
	 * @returns {BasicInfo}
	 */
	getPatientsComplaints(): string {
		this.getLocalStorageData();
		return getObjectChildValue(this.storageData, '', ['currentSession', 'session', 'evaluation', 'chiefComplaints']);
	}



	/**
	 * Determines whether storage debugging on is
	 * @returns true if storage debugging on 
	 */
	isStorageDebuggingOn(): boolean {
		this.getLocalStorageData();
		return this.storageData.debugging || false;
	}

	// /**
	//  * Returns user's facility id
	//  *
	//  * @param void
	//  * @returns {number}
	//  */
	// getFacilityId(): number {
	// 	this.getLocalStorageData();
	// 	return this.storageData.facility_id;
	// }



	setFacilityId(id: number) {
		this.getLocalStorageData();
		this.storageData.facility_id = id;
		this.updateLocalStorageData(this.storageData);
	}

	/**
	 * @param void
	 * @returns {Array}
	 */
	getFacilityLocations() {
		this.getLocalStorageData();
		return this.storageData.current_location_ids || []
	}

	getFacilityLocations_ids() {
		this.getLocalStorageData();
		// return this.storageData['facility_location_ids'] || []
		return this.storageData.facility_location_ids || []
	}
	/**
	 * 
	 * @param {Array<number>} facilityLocations 
	 * @returns void
	 */
	setFacilityLocations(facilityLocationsIds: Array<number>) {
		this.getLocalStorageData()
		this.storageData.current_location_ids = facilityLocationsIds
		this.updateLocalStorageData(this.storageData)
	}

	/**
	 * Returns current user id
	 *
	 * @param void
	 * @returns {number}
	 */
	getUserId(): number {
		this.getLocalStorageData();
		return this.storageData.user_id;
	}


	/**
	 * Returns speciality id of current user
	 *
	 * @param void
	 * @returns {number}
	 */
	getSpecialityId(): number {
		this.getLocalStorageData();
		return this.storageData.speciality_id;
	}


	/**
	 * Returns current user's basic info object
	 *
	 * @param void
	 * @returns {BasicInfo}
	 */
	getBasicInfo(): BasicInfo {
		this.getLocalStorageData();
		return this.storageData.basic_info;
	}


	/**
	 * Returns current user's role object
	 *
	 * @param void
	 * @returns {Role}
	 */
	getRole(): Role {
		this.getLocalStorageData();
		return this.storageData.role;
	}

	getRoleSlug() {
		this.getLocalStorageData();
		let role:any = this.storageData.role;
		return role && role.slug ? role.slug : '';
	}

	isTechnicianLoggedIn() {
		this.getLocalStorageData();
		if(this.storageData.role.medical_identifier && this.storageData.role.has_supervisor) {
			return true;
		} else if(!this.storageData.role.medical_identifier && this.storageData.role.has_supervisor) {
			return true;
		} else {
			return false;
		}
	}
	isOtherLoggedIn() {
		if(!this.storageData.role.medical_identifier && !this.storageData.role.has_supervisor) {
			return true;
		} else {
			return false;
		}
	}
	loggedInUser() {
		if(this.storageData.role.medical_identifier && this.storageData.role.has_supervisor) {
			return UsersType.TECHNICIAN;
		} else if(!this.storageData.role.medical_identifier && this.storageData.role.has_supervisor) {
			return UsersType.TECHNICIAN;
		} else if(!this.storageData.role.medical_identifier && !this.storageData.role.has_supervisor) {
			return UsersType.OTHER;
		} else if(this.storageData.role.medical_identifier) {
			return UsersType.PROVIDER
		}
	}



	/**
	 * Gets user practice locations
	 * @returns user practice locations 
	 */
	getUserPracticeLocationsData() {
		this.getLocalStorageData();
		return this.storageData.userPracticeLocations;
	}

	/**
	 * Sets user practice locations
	 * @param userPracticeLocations 
	 */
	setUserPracticeLocationsData(userPracticeLocations) {
		this.getLocalStorageData();
		this.storageData.userPracticeLocations = userPracticeLocations
		this.updateLocalStorageData(this.storageData)
	}



	/**
	 * Returns current user's role object
	 *
	 * @param void
	 * @returns {Role}
	 */
	isDoctor(): boolean {
		this.getLocalStorageData();
		return (this.storageData.role.medical_identifier) ? true : false;
	}

	canFinalize() : boolean {
		this.getLocalStorageData();
		return (this.storageData.role.can_finalize) ? true : false;
	}

	/**
	 * Returns stored permissions from localstorage
	 *
	 * @param void
	 * @returns {string[]} permissions
	 */
	getPermissions(): string[] {
		this.getLocalStorageData();
		return this.storageData.permissions || [];
	}


	/**
	 * Returns true if user is superadmin
	 *
	 * @param void
	 * @returns {boolean} permissions
	 */
	isSuperAdmin(): boolean {
		this.getLocalStorageData();
		return (getObjectChildValue(this.storageData, false, ['role', 'id']) === 1) ? true : false;
	}

	setDashboardNavigation(targetDashboard : string): void {
		this.getLocalStorageData();
		this.storageData.targetDashboard = targetDashboard;
		this.updateLocalStorageData(this.storageData);
	}
	getDashboardNavigation(): string {
		this.getLocalStorageData();
		return this.storageData.targetDashboard || '';
	}


	/**
	 * Saves permissions in localstorage
	 *
	 * @param permissions [string[]]
	 * @returns {void}
	 */
	setPermissions(permissions: string[]): void {
		this.getLocalStorageData();
		this.storageData.permissions = permissions;
		this.setPermissionsBehaviorSubject(permissions);
		this.updateLocalStorageData(this.storageData);
	}


	setMenu(menu: Menu[]): void {
		this.getLocalStorageData();
		this.storageData.menu = menu;
		// this.setPermissionsBehaviorSubject(permissions);
		this.updateLocalStorageData(this.storageData);
	}

	getMenu(): Menu[] {
		this.getLocalStorageData();
		return this.storageData.menu || [];
	}
	checkIfReportsExists(menu : any) {
		for (let i = 0; i < menu?.length; i++) {
		  if (menu[i].name === "Reports") {
			return true;
		  }
		}
		return false;
	  }
	  
	IsReportShowAble(): Boolean {
		this.getLocalStorageData();
		return (this.checkIfReportsExists(this.storageData?.menu)) ? true : false;
	}



	/**
	 * Returns current user's Scheduler object
	 *
	 * @param void
	 * @returns {Scheduler}
	 */
	getSchedulerInfo(): Scheduler {
		this.getLocalStorageData();
		if (!this.storageData.scheduler) {
			const IObject: Scheduler = {
				template_instance: undefined,
				patientData: undefined,
				toDelAppId: undefined,
				toDelCheck: undefined,
				toDelAppIdWL: undefined,
				toDelCheckWL: undefined,
				front_desk_doctor_calendar_patient: undefined,
				front_desk_doctor_calendar_doctors: undefined,
				front_desk_doctor_calendar_clinics: undefined,
				front_desk_doctor_calendar_view: undefined,
				doctor_view_calendar_view: undefined,
				front_desk_manual_calendar_speciality: undefined,
				supervisor_assign_doctor_all_clinics: undefined,
				supervisor_assign_doctor_all_doctors: undefined,
				supervisor_assign_doctor_is_swapped: undefined,
				supervisor_assign_doctor_view: undefined,
				front_desk_assign_rooms_clinics: undefined,
				front_desk_assign_rooms_doctors: undefined,
				front_desk_assign_rooms_rooms: undefined,
				front_desk_assign_rooms_swaps: undefined,
				front_desk_assign_rooms_view: undefined,
				supervisor_assign_speciality_is_swapped: undefined,
				supervisor_assign_speciality_all_clinics: undefined,
				supervisor_assign_speciality_all_speciality: undefined,
				supervisor_assign_speciality_view: undefined,
				scrollRight:undefined
			}
			this.storageData.scheduler = IObject;
		}
		return this.storageData.scheduler;
	}

	/**
	 * Saves scheduler info in localstorage
	 *
	 * @param {Scheduler}
	 * @returns {void}
	 */
	setSchedulerInfo(scheduler: Scheduler) {
		this.getLocalStorageData();
		this.storageData.scheduler = scheduler;
		this.updateLocalStorageData(this.storageData);
	}

		/**
	 * Delete scheduler info from localstorage
	 *
	 * @param {Scheduler}
	 * @returns {void}
	 */
		 deleteSchedulerInfo() {
			this.getLocalStorageData();
			this.storageData.scheduler = null;
			this.updateLocalStorageData(this.storageData);
		}

	/**
	 * New code
	 */



	/**
* 
* @param currentSession 
* @returns {void}
* set user current session data
*/
	setcurrentSession(currentSession) {
		this.getLocalStorageData();
		this.storageData.currentSession = currentSession;
		this.updateLocalStorageData(this.storageData);
	}

	/**
	* @returns {StorageData} 
	* get current session
	*/
	getcurrentSession() {
		return this.storageData.currentSession;
	}

	/**
	* set seendinfo
	* @param seededInfo 
	*/
	setSeededInfo(seededInfo) {
		this.getLocalStorageData();
		this.storageData.seededInfo = seededInfo;
		this.updateLocalStorageData(this.storageData);
	}

	/**
	* getting seedinfo
	*/
	getSeededInfo() {
		return this.storageData.seededInfo;
	}

	setOfflineSchedules(offlineSchedules) {
		this.getLocalStorageData();
		this.storageData.offlineSchedules = offlineSchedules;
		this.updateLocalStorageData(this.storageData);
	}




	setOfflineData(offlineData) {
		this.getLocalStorageData();
		this.storageData.offlineData = offlineData;
		this.updateLocalStorageData(this.storageData);
	}
	getOfflineData() {
		this.getLocalStorageData();
		return this.storageData.offlineData
	}
	getOfflineSchedules() {
		this.getLocalStorageData();
		return this.storageData.offlineSchedules
	}
	setCompletedSchedules(completedSchedules) {
		this.getLocalStorageData();
		this.storageData.completedSchedules = completedSchedules;
		this.updateLocalStorageData(this.storageData);
	}
	getCompletedSchedules() {
		this.getLocalStorageData();
		return this.storageData.completedSchedules;
	}


	/**
	 * sets user TimeZone 
	 * @param timeZone 
	 */

	setUserTimeZone(timeZone: { timeZone: string, offset: number }) {

		this.getLocalStorageData();
		this.storageData.currentTimeZone = timeZone;
		this.updateLocalStorageData(this.storageData);
	}

	/**
	 * returns previously set timezone or null
	 * @returns {string} current Time Zone 
	 */
	getUserTimeZone() {
		this.getLocalStorageData();
		(!this.storageData.currentTimeZone) ? this.setUserTimeZone(setDefaultTimeZone()) : null;
		return this.storageData.currentTimeZone
	}

	/**
	 * returns previously set timezone or null
	 * @returns {string} current Time Zone 
	 */
	getUserTimeZoneOffset() {
		this.getLocalStorageData()
		return this.storageData.currentTimeZone ? this.storageData.currentTimeZone.offset : null
	}


	/**
	 * Saves cm_offlineData in localstorage
	 *
	 * @param {Object}
	 * @returns {void}
	 */
	setCMOfflineData(cm_offlineData: Object) {
	}


    /**
     * Set permissions in behavior subject;
     * @param {<string[]} permissions 
     */
	setPermissionsBehaviorSubject(permissions: string[]): void {
		this.permissions.next(permissions)
	}

    /**
     * listen to permissions change 
     * @return {BehaviorSubject<<string[]>} userInfoChangeSubject
     */
	getPermissionsBehaviorSubject() {
		return this.permissions
	}
	/** 
	 * @returns current selected appointment 
	*/
	getcurrentAppointment() {
		this.getLocalStorageData();
		return this.storageData.currentSession || null;
	}

	setAnalyticsPermission(permissions:any){
		this.getLocalStorageData();
		this.storageData.analyticsPermissions = permissions;
		this.updateLocalStorageData(this.storageData);
	}

	getAnalyticsPermission() {
		this.getLocalStorageData();
		return this.storageData.analyticsPermissions || null;
	}
}

export interface UserData {
	targetDashboard: string,
	debugging: boolean;
	user_id: number;
	token: string;
	facility_id: number;
	current_location_ids: number[]; //facility location id
	facility_location_ids:number[];
	menu:Menu[];
	speciality_id: number;
	role: Role;
	basic_info: BasicInfo;
	scheduler: Scheduler;
	permissions: string[];
	facility_locations: number[];
	offlineSchedules: any;
	completedSchedules: any;
	offlineData: any;
	currentSession: Appointment;
	seededInfo: any;
	currentTimeZone: { timeZone: string, offset: number };
	userPracticeLocations: PracticeLocation[];
	userSimilerLocations: any;
	selected_facility_location_ids: number[];
	enableSaveRecordManualSpeciality:boolean;
	enableSaveRecordHbot:boolean;
	enableSaveRecordMedicalDoctor:boolean;
	billing_title:string
	analyticsPermissions:AnalyticsPermissions;


}

export interface AnalyticsPermissions{
	dashboard_type : [],
	report_type: []
}


export interface Role {
	id: number;
	name: string;
	qualifier: string;
	guard_name: string;
	created_at: string;
	medical_identifier: number;
	has_supervisor:number;
	can_finalize:number;
	updated_at: string;
	deleted_at: string;
}

export interface BasicInfo {
	first_name: string;
	middle_name: string;
	last_name: string;
	date_of_birth: string;
	gender: string;
	area_id: number;
	title: string;
	cell_no: string;
	address: string;
	work_phone: string;
	fax: string;
	extension: string;
	emergency_phone: string;
	biography: string;
	hiring_date: string;
	from: string;
	to: string;
	profile_pic: string;
	created_at: string;
	created_by: string;
	updated_at: string;
	updated_by: string;
	city: string;
	state: string;
	zip: string;
	social_security: string;
	profile_pic_url: string;
	apartment_suite: string;
	employed_by_id: number;
	designation_id: number;
	department_id: number;
	employment_type_id: number;
	deleted_at: string;
	id: number;
	email: string;
	status: number;
}
export enum UsersType {
	PROVIDER='provider',
	TECHNICIAN='technician',
	OTHER='other',
	SUPER_ADMIN='super_admin',
}

export interface HttpSuccessResponse {
	message: string;
	result: HttpResult;
	status: boolean;
}

export interface HttpResult {
	data: any[] | any;
	total?: number;
	per_page?: number;
}

// export interface HttpErrorResponse {
//     message: string;
//     result: any;
//     status: boolean;
// }

export interface Scheduler {
	template_instance: any,
	patientData: string;
	toDelAppId: string;
	toDelCheck: boolean;
	toDelAppIdWL: string;
	toDelCheckWL: boolean;
	front_desk_doctor_calendar_patient: string;
	front_desk_doctor_calendar_doctors: string;
	front_desk_doctor_calendar_clinics: string;
	front_desk_doctor_calendar_view: string;
	doctor_view_calendar_view: string;
	front_desk_manual_calendar_speciality: string;
	supervisor_assign_doctor_all_clinics: string;
	supervisor_assign_doctor_all_doctors: string;
	supervisor_assign_doctor_is_swapped: string;
	supervisor_assign_doctor_view: string;
	front_desk_assign_rooms_clinics: string;
	front_desk_assign_rooms_doctors: string;
	front_desk_assign_rooms_rooms: string;
	front_desk_assign_rooms_swaps: string;
	front_desk_assign_rooms_view: string;
	supervisor_assign_speciality_is_swapped: string;
	supervisor_assign_speciality_all_clinics: string;
	supervisor_assign_speciality_all_speciality: string;
	supervisor_assign_speciality_view: string;
	scrollRight:boolean
}
