
export interface MedicalTreatment {
    id: number | null
    key: number | null
    date_of_first_treatment: string
    treated_on_site: boolean
    treated_on_site_date: string
    treated_off_site: boolean
    first_off_site_treatment_location: string
    date_of_admission: string
    same_injury_body_part: boolean
    is_prev_injury_work_related: boolean
    same_employer: boolean
    had_ime: boolean
    have_any_first_treatment: boolean
    case_id: null
    hospital_id: null
    created_by: null
    updated_by: null
    created_at: string
    updated_at: string
    deleted_at: string
    hospitals: Hospital
    contact_information: ContactInformation
}
export interface ContactInformation {
    current_treated_by: CurrentTreatedBy
    previous_treated_by: PreviousTreatedBy


}
export interface CurrentTreatedBy {
    current_treated_by_dialog: any
    case_id: null,
    contact_person_type_id: null,
    contact_person_relation_id: null,
    other_relation_description: null,
    first_name: string
    middle_name: string,
    last_name: string,
    ssn: string,
    dob: string,
    age: string,
    gender: string,
    email: string,
    fax: string,
    cell_phone: string,
    home_phone: string,
    work_phone: string,
    ext: string,
    height_in: string,
    height_ft: string,
    weight_lbs: string,
    weight_kg: string,
    marital_status: string,
    is_resedential_same: string,
    is_emergency: boolean,
    is_guarantor: boolean,
    workplace_name: string,
    Object_id: null | number,

    // deleted_at: string,
    mail_address: MailAddress
    residential_address: null
}
export interface PreviousTreatedBy {
    previous_treated_by_dialog: any
    case_id: null,
    contact_person_type_id: null,
    contact_person_relation_id: null,
    other_relation_description: null,
    first_name: string
    middle_name: string,
    last_name: string,
    ssn: string,
    dob: string,
    age: string,
    gender: string,
    email: string,
    fax: string,
    cell_phone: string,
    home_phone: string,
    work_phone: string,
    ext: string,
    height_in: string,
    height_ft: string,
    weight_lbs: string,
    weight_kg: string,
    marital_status: string,
    is_resedential_same: string,
    is_emergency: boolean,
    is_guarantor: boolean,
    workplace_name: string,
    Object_id: null | number,

    // deleted_at: string,
    mail_address: MailAddress
    residential_address: null
}
export interface MailAddress {
    contact_person_id: null | number,
    type: string,
    street: string,
    apartment: string,
    latitude: string,
    longitude: string,
    city: string,
    state: string,
    zip: string,

}
export interface Hospital {
    id: null
    name: string
    street_address: string
    apartment: string
    city: string
    state: string
    zip: string
    work_phone: string
    email: string
    fax: string
    lat: string
    long: string

}
export interface GeneralDetails {
    id: null
    injury_covered: null
    injury_still_treated: number
    injury_covered_insurance_id: number
    eligible_for_payments: string
    worker_compensation_insurance_id: number | null
    amount_of_bills: number | null
    same_injury: boolean
    more_health_treatment: boolean
    other_expenses: boolean
    expense_description: string
    were_you_treated: boolean
    case_id: null | number

}