import { BillingInsuranceModel } from "../insurance-master/models/BillingInsurance.Model";

export class AdjusterInformationModel {
    first_name: string;
    middle_name: string;
    last_name: string;
    phone_no: string;
    ext: string;
    fax: string;
    email: string;
    street_address: string;
    apartment_suite: string;
    city: string;
    state: string;
    zip: string;
    comments: string;
    insurances: Array<BillingInsuranceModel>;
    insurance_and_location: Array<InsuranceAndLocationsModel>;
    id: string;
    cell_no: string;
	is_verified:boolean;

    contact_person_first_name: string;
    contact_person_middle_name: string;
    contact_person_last_name: string;
    contact_person_phone_no: string;
    contact_person_ext: string;
    contact_person_cell_number: string;
    contact_person_fax: string;
    contact_person_email: string;
}

export class InsuranceAndLocationsModel {
    id: string;
    selectedLocations: Array<string> = [];
}
