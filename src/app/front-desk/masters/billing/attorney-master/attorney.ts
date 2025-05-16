export interface Attorney {
	id?: number;
	first_name: string;
	middle_name: string;
	last_name: string;
	street_address: string;
	suite: number;
	city: string;
	state: string;
	zip: string;
	contact_person_first_name: string;
	contact_person_middle_name: string;
	contact_person_last_name: string;
	// contact_no: string;
	phone_no: string;
	cell_no: string;
	fax: string;
	email: string;
	comments: string;
	firmLocationIds: number[];
}
