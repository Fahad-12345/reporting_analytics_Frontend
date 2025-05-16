export class AddressInfo {

    mailingStreet:string;
    mailingApartment:string;
    mailingCity:string;
    mailingState:string;
    mailingZip:string;
    email:string;
    cellPhone:string;
    constructor(address){
        this.mailingStreet=address.mailingStreet;
        this.mailingApartment=address.mailingApartment;
        this.mailingCity=address.mailingCity;
        this.mailingState=address.mailingState;
        this.mailingZip=address.mailingZip;
        this.email=address.email;
        this.cellPhone=address.cellPhone;
    }

}
  
export class PhysicianInformation {

    caseId:number;
    firstName:string;
    middleName:string;
    lastName:string;
    clinicName:string;
    referringDoctorAddressInfos:AddressInfo;

    constructor( physicianInfo? ){

        if(physicianInfo){ 
            this.caseId = physicianInfo.caseId;
            this.firstName = physicianInfo.firstName;
            this.middleName = physicianInfo.middleName;
            this.lastName = physicianInfo.lastName;
            this.clinicName = physicianInfo.clinicName;
            this.referringDoctorAddressInfos = physicianInfo.referringDoctorAddressInfos;
        }

    }

}
  