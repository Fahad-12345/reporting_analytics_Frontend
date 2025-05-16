export enum FacilityUrlsEnum {
	// Facility
	Facility_list_GET = 'facilities',
	Facility_list_POST = 'v1/facility_add',
	Facility_list_GET_ById = 'facility',
	Facility_list_Delete_MultipleFacility = 'facility/delete/multiple',
	Facility_list_Delete_SingleFacility = 'facility/delete/',
	Facility_PUT = 'v1/facility_update',
	Facility_Locations_Appointments = '/appointments/get-facility-locations-appointments',
	appointmentCancellationComments='/appointment-cancellation-comments',
    updateAppointmentAndAssigment='/appointments/update-appointments-delete-assigments-facilitylocation',
	// Location
	Get_Single_Facility_Location = "facility_location",
	// facility_location?token={{token}}&id=13
	Facility_List_Location_Get = "facility_locations",
	Facility_Status_Update = "facility/is_active_update",
	Facility_Location_Post = 'v1/facility_location_add',
	Facility_Location_Put = 'v1/facility_location_update',
	Facility_list_Location_DeleteSingle = 'facility/delete/location/',
	Facility_list_Location_DeleteMultiple = 'facility/delete/multiple-location',
	Facility_SHORT_NAME_VALIDATION = 'facility_locations/short_name_validation',
	// Search Facility
	Facility_list_Search_Post = 'facility/search-facility',

	// dropdown used in user
	// Facility_list_dropdown_GET = 'facility/locations-with-facility-name',
	// Facility_list_dropdown_GET = 'facility_locations',
	Facility_list_dropdown_GET = 'facilities_locations',
	get_master_facilities='/master/facilities'
}
