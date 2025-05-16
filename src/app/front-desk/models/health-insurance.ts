export interface HealthInsuranceModel {
    caseId: number;
    id: number
    insuranceCompany: InsuranceCompany
    insuranceCompanyId: number
    isDeleted: boolean
    patientId: number
    groupNo: string
    insuredTo: string 
    memberId: string
    insuredToId: string
    contactPerson: ContactPerson
    type: string
    updatedAt: string
}

export interface InsuranceCompany {
    apartment: string
    cellPhone: string
    city: string
    companyAddress: string
    companyName: string
    companyCode:string
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
}

export interface ContactPerson {
    age: number
    contactPersonAddressInfos: []
    createdAt: string
    deletedAt: string
    dob: string
    firstName: string
    gender: string
    height: string
    id: number
    isDeleted: boolean
    lastName: string
    maritalStatus: string
    middleName: string
    relationships: [Relationships]
    socialSecurity: string
    updatedAt: string
    weight: string
}

export interface Relationships {
    createdAt: string
    deletedAt: string
    id: number
    isDeleted: boolean
    type: string
    updatedAt: string
}