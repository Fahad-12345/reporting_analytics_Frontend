export interface AttorneyLocation {

	id: number;
	location_name: string;
	street_address: string;
	apartment_suite: string;
	city: string;
	state: string;
	zip: string;
	phone: string;
	cell: string;
	ext: string;
	fax: string;
	email: string;
	contact_person_first_name: string;
	contact_person_middle_name: string;
	contact_person_last_name: string;
	contact_person_phone: string;
	contact_person_cell: string;
	contact_person_ext: string;
	contact_person_fax: string;
	contact_person_email: string;
	comments: string;
	is_main: boolean | number;
}

export interface AttorneyFirms {
	id: number;
	name: string;
	// street_address: string;
	// apartment_suite: string;
	// city: string;
	// state: string;
	// zip: string;
	// phone: string;
	// cell: string;
	// ext: string;
	// fax: string;
	// email: string;
	// contact_person_first_name: string;
	// contact_person_middle_name: string;
	// contact_person_last_name: string;
	// contact_person_phone: string;
	// contact_person_cell: string;
	// contact_person_ext: string;
	// contact_person_fax: string;
	// contact_person_email: string;
	// comments: string;
	firm_locations: AttorneyLocation[];
}
