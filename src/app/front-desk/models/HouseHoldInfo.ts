export interface HouseholdInfo {
    other: string
    policy: string,
    effective_date: string,
    expiry_date: string,
    own_motor_vehicle: boolean,
    id: number | null
    case_id: number | null

    insurance_company: Insurance
    contact_information: ContactInfo
}
export interface ContactInfo {
    id: null | number
    first_name: string,
    middle_name: string,
    last_name: string,
    ssn: string,
    dob: string,
    contact_person_relation_id: null | number,
    other_relation_description: string,
    cell_phone: string
    contact_person_relation: contactPersonRelation
}
export interface contactPersonRelation {
    id: null
    name: string
}
export interface Insurance {
    id: null
    name: string
}
