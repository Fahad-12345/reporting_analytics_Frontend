import { Insurance } from './insurance/insurance';

export class Patient {
    public id: number;
    public firstName: string;
    public middleName: string;
    public lastName: string;
    public dob: string;
    public imagePath: string;
    public weight: string;
    public height: string;
    public gender: string;
    public maritalStatus: string;
    public location: string;
    public occupation: string;
    public insurance: Insurance;

    constructor(patient) {
        this.id = (patient.id) ? patient.id : null;
        this.firstName = (patient.firstName) ? patient.firstName : null;
        this.middleName = (patient.middleName) ? patient.middleName : null;
        this.lastName = (patient.lastName) ? patient.lastName : null;
        this.dob = (patient.dob) ? patient.dob : null;
        this.imagePath = (patient.imagePath) ? patient.imagePath : null;
        this.weight = (patient.weight) ? patient.weight : null;
        this.height = (patient.height) ? patient.height : null;
        this.gender = (patient.gender) ? patient.gender : null;
        this.maritalStatus = (patient.maritalStatus) ? patient.maritalStatus : null;
        this.location = (patient.location) ? patient.location : null;
        this.occupation = (patient.occupation) ? patient.occupation : null;
        this.insurance = (patient.insurance) ? patient.insurance : null;
    }

}
