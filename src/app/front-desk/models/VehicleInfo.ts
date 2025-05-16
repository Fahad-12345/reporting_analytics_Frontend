export interface VehicleInfo {
    object_involved: ObjectInvolved
    vehicle: Vehicle
}
export interface ObjectInvolved {
    id: null | number
    object_involved: false,
    object_involved_description: string,
    vehicle_involved: true,
    vehicle_belongs_to: string,
    driver_was: string,
    accident_reported: true,
    reporting_date: string
    precinct: string,
    state: string,
    city: string,
    county: string,
    was_this: string,
    was_this_description: string,
    vehicle_was: string,
    no_of_vehicle_involved: null | number,
    vehicle_patient_were_in: null | number,
    was_this_car: string,
    also_owner_of_vehicle: false
}
export interface Vehicle {
    year: string,
    make: string,
    model: string,
    color: string,
    license_plate_number: string,
    state: string,
    vehicle_no: number,
    // insurance_company: { insurance_id: any, name: string }
    effective_date: string
    expiry_date: string
    policy_no: string
    contact_information: ContactInfo
    insurance: InsuranceModel
}
export interface InsuranceModel {
    insurance_name: string;
    insurance_code: string;
    id: number;
}
export interface ContactInfo {
    driver: Driver_Owner
    owner: Driver_Owner
}
export interface Driver_Owner {
    first_name: string,
    last_name: string,
    middle_name: string,
    mail_address: MailAddress
}
export interface MailAddress {
    street: string,
    city: string,
    state: string,
    zip: string
}