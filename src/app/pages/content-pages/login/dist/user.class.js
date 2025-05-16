"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.StorageData = void 0;
var core_1 = require("@angular/core");
var helpers_1 = require("@appDir/shared/utils/helpers");
var rxjs_1 = require("rxjs");
var StorageData = /** @class */ (function () {
    function StorageData(localStorage) {
        this.localStorage = localStorage;
        this.permissions = new rxjs_1.BehaviorSubject({});
        this.defaultStorage = {
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
        this.getLocalStorageData();
    }
    /**
     * Clears data stored in localstorage
     *
     * @param void
     * @returns {void}
     */
    StorageData.prototype.clear = function () {
        this.setPermissionsBehaviorSubject([]);
        this.localStorage.remove('data');
        this.localStorage.remove('nf2_options');
    };
    /**
     * Get data from localstorage
     *
     * @param void
     * @returns {void}
     */
    StorageData.prototype.getLocalStorageData = function () {
        this.storageData = (this.localStorage.get("data")) ? JSON.parse(this.localStorage.get("data")) : this.defaultStorage;
    };
    /**
     * Update data in localstorage
     *
     * @param data [UserData]
     * @returns {void}
     */
    StorageData.prototype.updateLocalStorageData = function (data) {
        this.localStorage.set('data', JSON.stringify(data));
    };
    /**
     * set nf2_generated_by_options in localstorage
     *
     * @param data [UserData]
     * @returns {void}
     */
    StorageData.prototype.set_nf2_generated_by_options_LocalStorageData = function (data) {
        this.localStorage.set('nf2_options', JSON.stringify(data));
    };
    /**
     * set nf2_generated_by_options in localstorage
     *
     * @param data [UserData]
     * @returns {void}
     */
    StorageData.prototype.get_nf2_generated_by_options_LocalStorageData = function () {
        var nf2_options = this.localStorage.get('nf2_options') ? JSON.parse(this.localStorage.get('nf2_options')) : [];
        return nf2_options;
    };
    /**
     * Save/Update users auth token
     *
     * @param token [string]
     * @returns {void}
     */
    StorageData.prototype.setToken = function (token) {
        this.getLocalStorageData();
        this.storageData.token = token;
        this.storageData.facility_location_ids;
        this.updateLocalStorageData(this.storageData);
    };
    StorageData.prototype.setSelectedFacilityLocationIds = function (practiceLocation) {
        this.getLocalStorageData();
        this.storageData.selected_facility_location_ids = practiceLocation;
        this.updateLocalStorageData(this.storageData);
    };
    StorageData.prototype.getSelectedFacilityLocationIds = function () {
        this.getLocalStorageData();
        return this.storageData.selected_facility_location_ids || [];
    };
    /**
     * Get current user email address
     *
     * @param void
     * @returns {string} logged in user's email address
     */
    StorageData.prototype.getEmail = function () {
        this.getLocalStorageData();
        return this.storageData.basic_info.email || '';
    };
    /**
     * Returns saved user's auth token
     *
     * @param void
     * @returns {string | boolean}
     */
    StorageData.prototype.getToken = function () {
        this.getLocalStorageData();
        return this.storageData.token || false;
    };
    StorageData.prototype.isUserLoggedIn = function () {
        return (this.getToken() && this.getEmail()) ? true : false;
    };
    /**
     * Returns current user's basic info object
     *
     * @param void
     * @returns {BasicInfo}
     */
    StorageData.prototype.getPatientsComplaints = function () {
        this.getLocalStorageData();
        return helpers_1.getObjectChildValue(this.storageData, '', ['currentSession', 'session', 'evaluation', 'chiefComplaints']);
    };
    /**
     * Determines whether storage debugging on is
     * @returns true if storage debugging on
     */
    StorageData.prototype.isStorageDebuggingOn = function () {
        this.getLocalStorageData();
        return this.storageData.debugging || false;
    };
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
    StorageData.prototype.setFacilityId = function (id) {
        this.getLocalStorageData();
        this.storageData.facility_id = id;
        this.updateLocalStorageData(this.storageData);
    };
    /**
     * @param void
     * @returns {Array}
     */
    StorageData.prototype.getFacilityLocations = function () {
        this.getLocalStorageData();
        return this.storageData.current_location_ids || [];
    };
    StorageData.prototype.getFacilityLocations_ids = function () {
        this.getLocalStorageData();
        // return this.storageData['facility_location_ids'] || []
        return this.storageData.facility_location_ids || [];
    };
    /**
     *
     * @param {Array<number>} facilityLocations
     * @returns void
     */
    StorageData.prototype.setFacilityLocations = function (facilityLocationsIds) {
        this.getLocalStorageData();
        this.storageData.current_location_ids = facilityLocationsIds;
        this.updateLocalStorageData(this.storageData);
    };
    // /**
    //  * Returns user's facility id
    //  *
    //  * @param void
    //  * @returns {number}
    //  */
    // getFacilityLocationId(): number {
    // 	this.getLocalStorageData();
    // 	return (this.storageData.current_location_id) ? this.storageData.current_location_id : null;
    // }
    // setFacilityLocationId(id: number) {
    // 	this.getLocalStorageData();
    // 	this.storageData.current_location_id = id;
    // 	this.updateLocalStorageData(this.storageData);
    // }
    /**
     * Returns current user id
     *
     * @param void
     * @returns {number}
     */
    StorageData.prototype.getUserId = function () {
        this.getLocalStorageData();
        return this.storageData.user_id;
    };
    /**
     * Returns speciality id of current user
     *
     * @param void
     * @returns {number}
     */
    StorageData.prototype.getSpecialityId = function () {
        this.getLocalStorageData();
        return this.storageData.speciality_id;
    };
    /**
     * Returns current user's basic info object
     *
     * @param void
     * @returns {BasicInfo}
     */
    StorageData.prototype.getBasicInfo = function () {
        this.getLocalStorageData();
        return this.storageData.basic_info;
    };
    /**
     * Returns current user's role object
     *
     * @param void
     * @returns {Role}
     */
    StorageData.prototype.getRole = function () {
        this.getLocalStorageData();
        return this.storageData.role;
    };
    /**
     * Gets user practice locations
     * @returns user practice locations
     */
    StorageData.prototype.getUserPracticeLocationsData = function () {
        this.getLocalStorageData();
        return this.storageData.userPracticeLocations;
    };
    /**
     * Sets user practice locations
     * @param userPracticeLocations
     */
    StorageData.prototype.setUserPracticeLocationsData = function (userPracticeLocations) {
        this.getLocalStorageData();
        this.storageData.userPracticeLocations = userPracticeLocations;
        this.updateLocalStorageData(this.storageData);
    };
    // /**
    //  * Gets user practice locations
    //  * @returns user practice locations 
    //  */
    // getUserSimilerLocations(): any {
    // 	this.getLocalStorageData();
    // 	return this.storageData.userSimilerLocations || [];
    // }
    // /**
    //  * Sets user practice locations
    //  * @param userSimilerLocations 
    //  */
    // setUserSimilerLocations(userSimilerLocations: any) {
    // 	this.getLocalStorageData();
    // 	this.storageData.userSimilerLocations = userSimilerLocations || []
    // 	this.updateLocalStorageData(this.storageData)
    // }
    /**
     * Returns current user's role object
     *
     * @param void
     * @returns {Role}
     */
    StorageData.prototype.isDoctor = function () {
        this.getLocalStorageData();
        return (this.storageData.role.medical_identifier) ? true : false;
    };
    /**
     * Returns stored permissions from localstorage
     *
     * @param void
     * @returns {string[]} permissions
     */
    StorageData.prototype.getPermissions = function () {
        this.getLocalStorageData();
        return this.storageData.permissions || [];
    };
    /**
     * Returns true if user is superadmin
     *
     * @param void
     * @returns {boolean} permissions
     */
    StorageData.prototype.isSuperAdmin = function () {
        this.getLocalStorageData();
        return (helpers_1.getObjectChildValue(this.storageData, false, ['role', 'id']) === 1) ? true : false;
    };
    /**
     * Saves permissions in localstorage
     *
     * @param permissions [string[]]
     * @returns {void}
     */
    StorageData.prototype.setPermissions = function (permissions) {
        this.getLocalStorageData();
        this.storageData.permissions = permissions;
        this.setPermissionsBehaviorSubject(permissions);
        this.updateLocalStorageData(this.storageData);
    };
    /**
     * Returns current user's Scheduler object
     *
     * @param void
     * @returns {Scheduler}
     */
    StorageData.prototype.getSchedulerInfo = function () {
        this.getLocalStorageData();
        if (!this.storageData.scheduler) {
            var IObject = {
                template_instance: undefined,
                patientData: undefined,
                toDelAppId: undefined,
                toDelCheck: undefined,
                toDelAppIdWL: undefined,
                toDelCheckWL: undefined,
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
                supervisor_assign_speciality_view: undefined
            };
            this.storageData.scheduler = IObject;
        }
        return this.storageData.scheduler;
    };
    /**
     * Saves scheduler info in localstorage
     *
     * @param {Scheduler}
     * @returns {void}
     */
    StorageData.prototype.setSchedulerInfo = function (scheduler) {
        this.getLocalStorageData();
        this.storageData.scheduler = scheduler;
        this.updateLocalStorageData(this.storageData);
    };
    /**
     * New code
     */
    /**
*
* @param currentSession
* @returns {void}
* set user current session data
*/
    StorageData.prototype.setcurrentSession = function (currentSession) {
        this.getLocalStorageData();
        this.storageData.currentSession = currentSession;
        this.updateLocalStorageData(this.storageData);
    };
    /**
    * @returns {StorageData}
    * get current session
    */
    StorageData.prototype.getcurrentSession = function () {
        return this.storageData.currentSession;
    };
    /**
    * set seendinfo
    * @param seededInfo
    */
    StorageData.prototype.setSeededInfo = function (seededInfo) {
        this.getLocalStorageData();
        this.storageData.seededInfo = seededInfo;
        this.updateLocalStorageData(this.storageData);
    };
    /**
    * getting seedinfo
    */
    StorageData.prototype.getSeededInfo = function () {
        return this.storageData.seededInfo;
    };
    StorageData.prototype.setOfflineSchedules = function (offlineSchedules) {
        this.getLocalStorageData();
        this.storageData.offlineSchedules = offlineSchedules;
        this.updateLocalStorageData(this.storageData);
    };
    StorageData.prototype.setOfflineData = function (offlineData) {
        this.getLocalStorageData();
        this.storageData.offlineData = offlineData;
        this.updateLocalStorageData(this.storageData);
    };
    StorageData.prototype.getOfflineData = function () {
        this.getLocalStorageData();
        return this.storageData.offlineData;
    };
    StorageData.prototype.getOfflineSchedules = function () {
        this.getLocalStorageData();
        return this.storageData.offlineSchedules;
    };
    StorageData.prototype.setCompletedSchedules = function (completedSchedules) {
        this.getLocalStorageData();
        this.storageData.completedSchedules = completedSchedules;
        this.updateLocalStorageData(this.storageData);
    };
    StorageData.prototype.getCompletedSchedules = function () {
        this.getLocalStorageData();
        return this.storageData.completedSchedules;
    };
    /**
     * sets user TimeZone
     * @param timeZone
     */
    StorageData.prototype.setUserTimeZone = function (timeZone) {
        this.getLocalStorageData();
        this.storageData.currentTimeZone = timeZone;
        this.updateLocalStorageData(this.storageData);
    };
    /**
     * returns previously set timezone or null
     * @returns {string} current Time Zone
     */
    StorageData.prototype.getUserTimeZone = function () {
        this.getLocalStorageData();
        (!this.storageData.currentTimeZone) ? this.setUserTimeZone(helpers_1.setDefaultTimeZone()) : null;
        return this.storageData.currentTimeZone;
    };
    /**
     * returns previously set timezone or null
     * @returns {string} current Time Zone
     */
    StorageData.prototype.getUserTimeZoneOffset = function () {
        this.getLocalStorageData();
        return this.storageData.currentTimeZone ? this.storageData.currentTimeZone.offset : null;
    };
    /**
     * Saves cm_offlineData in localstorage
     *
     * @param {Object}
     * @returns {void}
     */
    StorageData.prototype.setCMOfflineData = function (cm_offlineData) {
    };
    /**
     * Set permissions in behavior subject;
     * @param {<string[]} permissions
     */
    StorageData.prototype.setPermissionsBehaviorSubject = function (permissions) {
        this.permissions.next(permissions);
    };
    /**
     * listen to permissions change
     * @return {BehaviorSubject<<string[]>} userInfoChangeSubject
     */
    StorageData.prototype.getPermissionsBehaviorSubject = function () {
        return this.permissions;
    };
    /**
     * @returns current selected appointment
    */
    StorageData.prototype.getcurrentAppointment = function () {
        this.getLocalStorageData();
        return this.storageData.currentSession || null;
    };
    StorageData = __decorate([
        core_1.Injectable({ providedIn: "root" })
    ], StorageData);
    return StorageData;
}());
exports.StorageData = StorageData;
