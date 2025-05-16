export interface CaseInsurance {
    id: number
    key: number | null
    case_id: number
    insurance_id: number
    insurance_location_id: number | null
    adjustor_id: number | null
    type: string
    insured: number | null
    first_name: string
    middle_name: string
    last_name: string
    dob: string
    ssn: number | null
    claim_no: string
    policy_no: string
    wcb_no: string
    contact_person_relation_id: number | null
    member_id: number | null
    group_no: number | null
    adjustor: CaseAdjuster
    insurance: CaseCompanyInsurance
    insuranceLocation: CaseCompanyInsuranceLocation

}
export interface CaseCompanyInsurance {
    id: 34
    insurance_name: string
    insurance_code: number | null
    created_at: string
    updated_at: string
}
export interface CaseCompanyInsuranceLocation {
    id: number | null
    insurance_id: number | null
    is_main_location: string
    location_name: string
    street_address: string
    apartment_suite: string
    city: string
    state: string
    zip: string
    phone_no: string
    ext: string
    cell_number: string
    fax: string
    email: string
    contact_person_first_name: string
    contact_person_middle_name: string
    contact_person_last_name: string
    contact_person_phone_no: string
    contact_person_ext: string
    contact_person_cell_number: string
    contact_person_fax: string
    contact_person_email: string
    comments: string
    created_at: string
    updated_at: string
}

export interface CaseAdjuster {
    id: number | null
    adjuster_id: number | null
    insurance_id: number | null
    created_at: string
    updated_at: string;
    adjuster: AdjusterDetails
}

export interface AdjusterDetails {
    id: number;
    first_name: string;
    middle_name: string;
    last_name: string;
    phone_no: string | null;
    cell_no: string | null;
    ext: string | null;
    fax: string | null;
    email: string | null;
    street_address: null;
    apartment_suite: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    comments: string | null;
    created_at: string;
    updated_at: string
}

export interface InsuranceModel {
    caseId: number;
    id: number
    insuranceCompany: InsuranceCompany
    insuranceCompanyId: number
    isDeleted: boolean
    patientId: number
    type: string
    updatedAt: string
}

export interface InsuranceCompany {
    caseInsurances: CaseInsurances,
    apartment: string
    cellPhone: string
    city: string
    companyAddress: string
    companyName: string
    createdAt: string
    deletedAt: string
    email: string
    fax: string
    homePhone: string
    insuranceName: string
    isDeleted: boolean
    lat: string
    long: string
    state: string
    updatedAt: string
    workPhone: string
    zip: string
    workExt: string

    // New fields
    companyCode: string
    locationName: string
}

export interface CaseInsurances {
    adjuster: Adjuster
    adjusterId: number
    caseId: number
    claim: string
    createdAt: string
    deletedAt: string
    id: number
    insuranceCompanyId: number
    isDeleted: boolean
    policy: string
    policyHolderFirstName: string
    policyHolderLastName: string
    policyHolderMiddleName: string
    policyHolderAddress: string
    policyHolderCity: string
    PolicyHolderState: string
    policyHolderZip: string
    policyHolderEmail: string
    policyHolderPhoneNo: string
    updatedAt: string
    wcb: string

    // New fields
    policyHolderPhoneExtNo: string
    policyHolderFax: string
}

export interface Adjuster {
    createdAt: number
    deletedAt: string
    email: string
    ext: string
    fax: string
    firstName: string
    id: number
    isDeleted: boolean
    lastName: string
    middleName: string
    updatedAt: string
    workPhone: string
}