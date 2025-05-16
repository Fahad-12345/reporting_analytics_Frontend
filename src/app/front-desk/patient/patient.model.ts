export interface Patient {
    id: number,
    firstName: string,
    middleName: string,
    lastName: string,
    dob: string,
    age: number,
    gender: string,
    maritalStatus: string,
    socialSecurity: string,
    height: string,
    heightInches: string,
    weight: string,
    patientAddressInfos: any[]

}

export interface BodyPartsModel {
    level: string,
    bodyPartId: number,
    bodyPartName: string,
    sensations: [SensationModel]
}

export interface SensationModel {
    sensationId: number,
    sensationName: string
}