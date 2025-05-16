export enum ReferringPhysicianUrlsEnum {
	// <=> CLINIC URLS <=>
	ADD_NEW_CLINIC_WITH_PRIMARY_LOCATION = 'add/clinic',
	ADD_NEW_SECONDARY_LOCATION = 'add/clinic/location',
	GET_CLINICS = 'get/clinics',
	GET_CLINICS_Physican = 'get/clinics',
	GET_CLINICS_REFERRING_PHYSICIAN = 'get/physician/clinics',
	GET_CLINICS_FACILITIES_REFERRING_PHYSICIAN = 'get/physician/clinics_and_facilities',
	
	UPDATE_CLINIC = 'update/clinic',
	GET_CLINIC_WITH_LOCATIONS = 'clinic/single',
	DELETE_CLINIC = 'delete/clinic',
	GET_SINGLE_CLINIC_WITH_SINGLE_LOCATION = 'get/clinic/location',
	UPDATE_SINGLE_LOCATION = 'update/clinic/location',
	CHANGE_STATUS = 'change/clinic/status',
	// <=> PHYSICIAN URLS <=>
	PHYSICIAN_LISTING = 'get/physicians',
	ADD_NEW_PHYSICIAN = 'add/physician',
	DELETE_PHYSICIAN = 'delete/physicians',
	GET_SINGLE_PHYSICIAN = 'physician/single',
	UPDATE_SINGLE_PHYSICIAN = 'update/physician',	
	UPDATE_SINGLE_PHYSICIAN_CLINIC = 'update/physician-clinics',
	
	GET_PHYSICIANS_LIST='physician-list',
	GET_Physican_CLINICS = 'get/Physican',

	GET_CLINIC_BY_LOCATION = "get/clinics/byLocation",
}
