export class BillingInsuranceModel {
    insurance_name: string;
    insurance_code: string;
    created_at: string;
    updated_at: string;
    insurance_locations: Array<LocationsModel>;
    id: string;
	is_verified:boolean;


    constructor(insurance_name: string, insurance_code: string, insurance_locations: Array<LocationsModel>) {
        this.insurance_name = insurance_name
        this.insurance_code = insurance_code
        this.insurance_locations = insurance_locations
    }

    public static getEmptyBillingInsurance() {
        return new BillingInsuranceModel('', '', [LocationsModel.getEmptyLocation()])
    }
}

export class LocationsModel {
    street_address: string;
    apartment_suite: string;
    city: string;
    state: string;
    zip: string;
    phone_no: string;
    ext: string
    cell_number: string;
    fax: string;
    email: string;
    contact_person_first_name: string;
    contact_person_middle_name: string;
    contact_person_last_name: string;
    contact_person_phone_no: string;
    contact_person_ext: string;
    contact_person_email: string;
    comments: string;
    contact_person_cell_number: string;
    contact_person_fax: string;
    location_name: string;
    insurance_code: string;
    id: string;
    is_main_location?: boolean
    location_code: string;
    kiosk_state_id:string;
    default_payer_id:string;
    is_associate_with_payer:boolean;
    states:any;
	is_update:boolean = false;
    constructor(street_address: string,
        apartment_suite: string,
        city: string,
        state: string,
        zip: string,
        contact_person_first_name: string,
        contact_person_middle_name: string,
        contact_person_last_name: string,
        contact_person_phone_no: string,
        contact_person_ext: string,
        contact_person_email: string,
        comments: string,
        contact_person_cell_number: string,
        contact_person_fax: string,
        location_name?: string,
        insurance_code?: string,
        kiosk_state_id?: string,
        default_payer_id?: string,
        is_associate_with_payer?: boolean,
        states?: any,
    ) {
        this.street_address = street_address;
        this.apartment_suite = apartment_suite;
        this.city = city;
        this.state = state;
        this.zip = zip;
        this.contact_person_first_name = contact_person_first_name;
        this.contact_person_middle_name = contact_person_middle_name;
        this.contact_person_last_name = contact_person_last_name;
        this.contact_person_phone_no = contact_person_phone_no;
        this.contact_person_ext = contact_person_ext;
        this.contact_person_email = contact_person_email;
        this.comments = comments;
        this.contact_person_cell_number = contact_person_cell_number;
        this.contact_person_fax = contact_person_fax;
        this.location_name = location_name || "";
        this.insurance_code = insurance_code || "";
        this.kiosk_state_id = kiosk_state_id;
        this.default_payer_id = default_payer_id;
        this.is_associate_with_payer = is_associate_with_payer;
        this.states = states
    }
    public static getEmptyLocation() {
        return new LocationsModel('', '', '', '', '', '', '', '', '', '', '', '', '', '')
    }
}
