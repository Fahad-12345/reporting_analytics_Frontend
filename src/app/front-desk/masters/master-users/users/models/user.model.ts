export interface UserProfile {
	id?: number;
	email: string;
	status: boolean;
	first_name: string;
	middle_name: string;
	last_name: string;
	date_of_birth: string;
	gender: string;
	address: string;
	city: string;
	state: string;
	zip: string;
	fax: string;
	extension: string;
	social_security: string;
	work_phone: string;
	module_id: string;
	title: string;
	cell_no: string;
	ssn: string;
	primary_facility_id: number;
	affiliated_facility_ids: any[];
	employed_by: string;
	emergency_phone: string;
	designation_id: string;
	department_id: string;
	employment_type_id: string;
	biography: string;
	hiring_date: string;
	biogrfromaphy: string;
	to: string;
	from: string;
	image: string;
	profile_pic_url: string;
}

export interface User {
	user_profile: UserProfile;
}

export interface UserRelatedData {
	UserProfileData: any;
	practicesDropDownData: any[];
	employedByDropDownData: any;
	designationDropDownData: any;
	departmentDropDownData: any;
	employmentTypeDropDownData: any;
	rolesData: any;

}
