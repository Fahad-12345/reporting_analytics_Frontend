export enum UsersUrlsEnum {
	User_Roles = 'FeeScheduleEnum.CaseType_GET',
	User_Medical_Identifier_BillingTitle = 'billing_titles',
	User_Medical_Identifier_BillEmploymentTypes = 'billing_employment_types',
	User_Basic_Info_GET = 'single_user',
	Update_User_Status_GET = 'users/change_status',
	UserListing_list_Delete = 'users/delete/',
	// UserListing_list_GET = 'users/users_list',
	UserListing_list_GET = 'users',
	// user listing search
	UserListing_search_Post = 'users/search-user',
	// User Roles
	// UserRoles_list_Get = 'all_roles',
	UserRoles_list_Get = 'roles',
	UserRolesList = 'roles_list',

	// for update
	userLIsting_list_Update = 'users/single_user',
	Update_User_PUT = 'update_user',
	// Update_Image_POST = 'uploadImage'
	Update_Image_POST = 'upload_user_image',
	User_get_users_role_GET = 'get_user_role',
	// User_timings_GET = 'get_user_timings',
	User_timings_GET = 'v2/get_user_timings',
	User_timings_PUT = 'v1/update_user_timings',
	Allow_Multiple_Assignment_POST = 'allow_multiple_assignment',

	User_Folder_Types_Get='get_user_folder_types',
	Attach_User_Folder_Type='attach_folder_types_to_user',
	search_technician_supervisor="search-technician-supervisor",
	add_technician_supervisor="add-technician-supervisor",
	delete_technician_supervisor="delete-technician-supervisor",
	assign_specialties_to_user="v2/assign_specialties",
	delete_speciality="delete_speciality",
	get_specialties_name="get_specialties_name",
	get_supervisor_name="get_supervisor_name",
	replicate_specialty_timings="v2/replicate_specialty_timings",
	replicate_supervisor_timings="v2/replicate_supervisor_timings",
	// User Epcs
	get_epcs_status="epcs-status",
	updateEpcs="user_epcs_status",
	getDoctorAppointments = "node/sch2/appointments/get-doctor-appointments-by-id", 
	//delete multiple assignments of user
	delete_multiple_assignments= "/available-specialities/delete-multiple-assignment",
}
export enum UsersChangeStatusEnum {
	INACTIVE_STATUS = 0,
	ACTIVE_STATUS = 1
}


export enum UsersRoleEnum {
	Provider = 'provider',
	Technician = 'technician'
}
