import { Patient } from "@appDir/medical-doctor/models/common/commonModels";

export class PatientInfo extends Patient {
    age: string;
    accidentDate: string;
    chiefComplaints: string;
    illnessHistory: string;
    alleviation: string;
    headaches: string;
    painAreas: string;
    constructor(patient) {
        super(patient);
        this.age = (patient.age) ? patient.age : null;
        this.accidentDate = (patient.accidentDate) ? patient.accidentDate : null;
        this.chiefComplaints = (patient.chiefComplaints) ? patient.chiefComplaints : null;
        this.illnessHistory = (patient.illnessHistory) ? patient.illnessHistory : null;
        this.alleviation = (patient.alleviation) ? patient.alleviation : null;
        this.headaches = (patient.headaches) ? patient.headaches : null;
        this.painAreas = (patient.painAreas) ? patient.painAreas : null;
    }
}
