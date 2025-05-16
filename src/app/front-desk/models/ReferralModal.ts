export interface Referral {
    reffer_by_physician_dialog: string
    primary_care_physician_dialog: string
    reffering_physician: RefferingReferralInfo
    primary_physician: PrimaryReferralInfo
}
export interface RefferingReferralInfo {
	clinic_location: any;
	clinic_id;
    reffer_by_physician_dialog: any
    id: number | null
    case_id: number | null
    contact_person_type_id: number | null
    contact_person_relation_id: number | null
    other_relation_description: number | null
    first_name: string
    middle_name: string
    last_name: string
    ssn: string
    dob: string
    age: string
    gender: string
    email: string
    fax: string
    cell_phone: string
    home_phone: string
    work_phone: string
    ext: string
    is_resedential_same: string
    is_emergency: string
    is_guarantor: string
    workplace_name: string
    contactPersonType: contactPersonType
    mail_address: MailAddress;
	clinic:any;
	physician:any;
	physician_id;
}
export interface PrimaryReferralInfo {
    primary_care_physician_dialog: any
    id: number | null
    case_id: number | null
    contact_person_type_id: number | null
    contact_person_relation_id: number | null
    other_relation_description: number | null
    first_name: string
    middle_name: string
    last_name: string
    ssn: string
    dob: string
    age: string
    gender: string
    email: string
    fax: string
    cell_phone: string
    home_phone: string
    work_phone: string
    ext: string
    is_resedential_same: string
    is_emergency: string
    is_guarantor: string
    workplace_name: string
    contactPersonType: contactPersonType
    mail_address: MailAddress;
	clinic_location:any;

}
export interface contactPersonType {
    id: null | number
    key: null | number
    name: string
    slug: string
    created_by: string
    updated_by: string
    created_at: string
    updated_at: string
    deleted_at: null
}
export interface MailAddress {
    id: null | number
    key: number
    contact_person_id: string
    type: string
    street: string
    apartment: string
    latitude: string
    longitude: string
    city: string
    state: string
    zip: string
    created_by: string
    updated_by: string
    created_at: string
    updated_at: string
    deleted_at: string
}

