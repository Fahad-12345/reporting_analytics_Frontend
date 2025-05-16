export enum SpecialityUrlsEnum {
	Speciality_list_Get = 'specialities', // Get all
	// available_list_speciality_get = 'get-all-available-specialties?available_specialties=1', // used for dropdown
	available_list_speciality_get = 'specialities?available=1', // used for dropdown
	// Speciality_list_POST = 'speciality/add',
	Speciality_list_POST = 'speciality_add',
	// Speciality_list_PUT = 'speciality/update',
	Speciality_list_PUT = 'update_speciality',
	Speciality_list_Delete = 'speciality/delete', // user for both single and multiple delete,
	getUserVisitType = 'get_user_visit_type_with_fields_controls'
}
