// import { Evaluation } from './evaluation/evaluation';
// import { CurrentComplaint } from './complaint/current-complaint/current-complaint';
// import { HeadInjury } from './complaint/head-injury/head-injury';
// import { Complaint2 } from '@appDir/medical-doctor/models/initialEvaluation/initialEvaluationModels';

import { getObjectChildValue } from "@appDir/shared/utils/utils.helpers";

// export class MedicalSession {

//     private _id: number;
//     private _appointment_id: number;
//     // // caseId:number;
//     // // patientId:number;
//     // // doctorId:number;
//     private _evaluation: Evaluation;
//     private _currentComplaints: CurrentComplaint[];
//     private _headInjury: HeadInjury;
//     private _currentComplaints2: Complaint2;


//     // pastMedicalHistory: PastMedicalHistory;
//     // physicalExamination1: PhysicalExamination1;
//     // physicalExamination2: PhysicalExamination2;
//     // diagnosticImpression: DiagnosticImpression;
//     // phyOccChirott: any;
//     // mriReferral: any;
//     // specialityConsultation: any;
//     // rangeOfMotion: any;
//     // visitType: string;
//     // planOfCare: planOfCare1;
//     // workStatus: WorkStatus;
//     // treatment_rendered: TreatmentRendered;
//     // synaptic: Synaptic;
//     // hbotNotes: HBOT;
//     // finalize_visit: Boolean;
//     constructor(session) {
//         // this.id = (session.id) ? session.id : null;
//         // this.appointment_id = (session.appointment_id) ? session.appointment_id : null;
//         // this.evaluation = (session.evaluation) ? session.evaluation : null;
//         // this.currentComplaints = (session.currentComplaints) ? session.currentComplaints : null;
//         // this.headInjury = session.headInjury ? new HeadInjury(session.headInjury) : null;
//         // this.currentComplaints2 = (session.currentComplaints2) ? session.currentComplaints2 : null;
//         // this.pastMedicalHistory = (session.pastMedicalHistory) ? session.pastMedicalHistory : null;
//         // this.physicalExamination1 = (session.physicalExamination1) ? new PhysicalExamination1(session.physicalExamination1) : null;
//         // this.physicalExamination2 = (session.physicalExamination2) ? session.physicalExamination2 : null;
//         // this.diagnosticImpression = (session.diagnosticImpression) ? session.diagnosticImpression : null;
//         // this.phyOccChirott = (session.phyOccChirott) ? session.phyOccChirott : null;
//         // this.mriReferral = (session.mriReferral) ? session.mriReferral : null;
//         // this.specialityConsultation = (session.specialityConsultation) ? session.specialityConsultation : null;
//         // this.rangeOfMotion = (session.rangeOfMotion) ? session.rangeOfMotion : null;
//         // this.visitType = (session.visitType) ? session.visitType : null;
//         // this.planOfCare = (session.planOfCare) ? session.planOfCare : null;
//         // this.synaptic = (session.synaptic) ? session.synaptic : null;
//         // this.hbotNotes = (session.hbotNotes) ? session.hbotNotes : null;
//         // this.finalize_visit = (session.finalize_visit) ? session.finalize_visit : false;
//         // this.workStatus = (session && session.workStatus) ? new WorkStatus(session.workStatus) : null;
//         // this.treatment_rendered = (session.treatment_rendered) ? new TreatmentRendered(session.treatment_rendered) : null;
//     }

//     /**
//      * Sets medical session
//      * @param medicalSession 
//      */
//     public setMedicalSession(medicalSession) {
//         if (medicalSession) {
//             this.id = medicalSession.id || null;
//             this.evaluation = medicalSession.evaluation || null;
//             this.appointmentId = medicalSession.appointmentId || null;
//             this.currentComplaints = medicalSession._currentComplaints || null;
//             this.headInjury = medicalSession._headInjury || null;
//         }
//     }

//     /**
//      * Gets medical session
//      * @returns  
//      */
//     public getMedicalSession() {
//         return {
//             id: this.id,
//             evaluation: this.evaluation,
//             appointmentId: this.appointmentId,
//             currentComplaints: this.currentComplaints,
//             headInjury: this.headInjury,
//         }
//     }

//     /**
//      * Gets evaluation
//      */
//     public get evaluation(): Evaluation {
//         return this._evaluation;
//     }

//     /**
//      * Sets evaluation
//      */
//     public set evaluation(evaluation: Evaluation) {
//         this._evaluation = evaluation;
//     }

//     /**
//      * Gets id
//      */
//     public get id(): number {
//         return this._id;
//     }

//     /**
//      * Sets id
//      */
//     public set id(id: number) {
//         this._id = id;
//     }


//     /**
//      * Gets appointment id
//      */
//     public get appointmentId(): number {
//         return this._appointment_id;
//     }

//     /**
//      * Sets appointment id
//      */
//     public set appointmentId(appointment_id: number) {
//         this._appointment_id = appointment_id;
//     }


//     /**
//      * Gets current complaints
//      */
//     public get currentComplaints(): CurrentComplaint[] {
//         return this._currentComplaints;
//     }

//     /**
//      * Sets current complaints
//      */
//     public set currentComplaints(currentComplaints: CurrentComplaint[]) {
//         this._currentComplaints = currentComplaints;
//     }


//     /**
//      * Gets head injury
//      */
//     public get headInjury(): HeadInjury {
//         return this._headInjury;
//     }

//     /**
//      * Sets head injury
//      */
//     public set headInjury(headInjury: HeadInjury) {
//         this._headInjury = headInjury;
//     }


//     /**
//      * Gets current complaints2
//      */
//     public get currentComplaints2(): Complaint2 {
//         return this._currentComplaints2;
//     }

//     /**
//      * Sets current complaints2
//      */
//     public set currentComplaints2(currentComplaints2: Complaint2) {
//         this._currentComplaints2 = currentComplaints2;
//     }

// }


export class Radiation {
    bodyPartId: number;
    position: string;
    location: string;
    constructor(radiation) {
        this.bodyPartId = (radiation.bodyPartId) ? radiation.bodyPartId : null;
        this.position = (radiation.position) ? radiation.position : null;
        this.location = (radiation.location) ? radiation.location : null;
    }
}

export class ComplaintLocation {

    checked: boolean;
    location: string;
    painScale: number; //Added
    painStyle: number; //Added
    feelings: number[]; //Added
    sensations: number[]; //Added
    radiations: Radiation[]; //Added
    comments: string; //Added
    constructor(complaintLocations) {

        this.checked = (complaintLocations.checked) ? complaintLocations.checked : false;
        this.location = (complaintLocations.location) ? complaintLocations.location : "";
        this.painScale = (complaintLocations.painScale) ? complaintLocations.painScale : null;
        this.painStyle = (complaintLocations.painStyle) ? complaintLocations.painStyle : null;
        this.comments = (complaintLocations.comments) ? complaintLocations.comments : null;
        
        if (typeof (complaintLocations.sensation))
            if (complaintLocations.sensation) {
                this.sensations = complaintLocations.sensation.filter(function (data) {
                    if (typeof (data) == 'number') {
                        return true;
                    }
                    return data.checked;
                }).map(function (data) {
                    if (typeof (data) == 'number') {
                        return data;
                    }
                    return data.id;
                });
            }
        if (complaintLocations.feelings) {
            this.feelings = complaintLocations.feelings.filter(function (data) {
                return data.checked == true;
            }).map(function (data) {
                return data.id;
            });
        }
        if (complaintLocations.radiation) {
            this.radiations = complaintLocations.radiation.filter(function (data) {
                return data.location != null;
            });
        }

    }
}

export class CurrentComplaint {
    id: number; //Added
    name: string;
    bodyPartId: number; //Added
    checked: boolean; //Not needed
    complaintsLocation: ComplaintLocation[];

    constructor(complaints) {
        this.id = (complaints.id) ? complaints.id : null;
        this.checked = (complaints.checked) ? complaints.checked : false;
        this.bodyPartId = (complaints.bodyPartId) ? complaints.bodyPartId : null;
        let complaintsLocation: ComplaintLocation[] = [];
        complaints.complaintsLocation
        if (complaints.complaintsLocation && complaints.complaintsLocation.length > 0) {
            complaintsLocation = complaints.complaintsLocation.filter((complaint) => {
                return complaint.checked || complaints.complaintsLocation.length == 1
            }).map((complaint) => {
                return new ComplaintLocation(complaint);
            });
        }
        this.complaintsLocation = complaintsLocation;
    }
}


export class BodyPartCodes {
    id: number;
    code: string;
    bodyPartId: number;
    constructor(bodyPartCode) {
        this.id = (bodyPartCode.id) ? bodyPartCode.id : null;
        this.code = (bodyPartCode.code) ? bodyPartCode.code : null;
        this.bodyPartId = (bodyPartCode.bodyPartId) ? bodyPartCode.bodyPartId : null;
    }

}

export class ConditionState {
    id: number;
    name: string;
    constructor(condition) {
        this.id = (condition.id) ? condition.id : null;
        this.name = (condition.name) ? condition.name : null;
    }
}

export class BodyPartConditionAPI { //Temporary
    id: number;
    state: ConditionState;
    name: string;
    constructor(bodyPartCondition) {
        
        this.id = (bodyPartCondition.id) ? bodyPartCondition.id : null;
        this.name = (bodyPartCondition.name) ? bodyPartCondition.name : null;
        bodyPartCondition.state = (typeof (bodyPartCondition.state) == "string") ? JSON.parse(bodyPartCondition.state) : bodyPartCondition.state;
        this.state = (bodyPartCondition.state) ? new ConditionState(bodyPartCondition.state) : null;
    }
}
export class BodyPartExamination {
    id: number;
    conditions: BodyPartConditionAPI[];
    comment: string;
    // state:string;
    constructor(examination) {
        this.id = (examination.id) ? examination.id : null;
        this.comment = (examination.comment) ? examination.comment : "";
        if (examination.condition) {
            this.conditions = examination.condition.filter(function (data) {
                return data.checked == true;
            }).map(function (data) {
                ;
                return new BodyPartConditionAPI({
                    id: data.id,
                    state: data.state,
                    name: data.name
                });
            });
        }
    }
}

export class PhysicalExamination1 {
    id: number;
    wellDeveloped: boolean;
    wellNourished: boolean;
    alert: boolean;
    oriented: boolean;
    painLevel: string;
    bodyPartExaminations: BodyPartExamination[];
    constructor(examination) {
        this.id = (examination.id) ? examination.id : null;
        this.wellDeveloped = (examination.wellDeveloped) ? examination.wellDeveloped : false;
        this.wellNourished = (examination.wellNourished) ? examination.wellNourished : false;
        this.alert = (examination.alert) ? examination.alert : false;
        this.oriented = (examination.oriented) ? examination.oriented : false;
        this.painLevel = (examination.painLevel) ? examination.painLevel : null;
        ;
        this.bodyPartExaminations = (examination.bodyPartExaminations) ? examination.bodyPartExaminations : false;

    }
}

export class BodyPartMovements {
    id: number;
    bodyPartId: number;
    orientation: string;
    measuredROM: number;
    leftMeasuredROM: number;
    rightMeasuredROM: number;
    // comment:string;
    movementId: number;

    // state:string;
    constructor(bodyPartMovement, bodyPartId) {
        this.id = (bodyPartMovement.id) ? bodyPartMovement.id : null;
        this.bodyPartId = bodyPartId;//(bodyPartMovement.bodyPartId) ? bodyPartMovement.bodyPartId : null;
        this.orientation = (bodyPartMovement.orientation) ? bodyPartMovement.orientation : null;
        this.measuredROM = (bodyPartMovement && !isNaN(parseInt(bodyPartMovement.measuredROM))) ? bodyPartMovement.measuredROM : null;
        this.leftMeasuredROM = (bodyPartMovement && !isNaN(parseInt(bodyPartMovement.leftMeasuredROM))) ? bodyPartMovement.leftMeasuredROM : null;
        this.rightMeasuredROM = (bodyPartMovement && !isNaN(parseInt(bodyPartMovement.rightMeasuredROM))) ? bodyPartMovement.rightMeasuredROM : null;
        // this.comment = (bodyPartMovement.comment)?bodyPartMovement.comment:null;
        this.movementId = (bodyPartMovement.movementId) ? bodyPartMovement.movementId : null;
    }
}


export class TestReports {
    id: number;
    leftSign: string;
    leftDegree: string;
    rightSign: string;
    rightDegree: string;
    sign: string;
    degree: string;
    name: string;
    bodyPartId: number;
    constructor(movementDetails) {
        this.id = (movementDetails.id) ? movementDetails.id : null;
        this.leftSign = (movementDetails.leftSign) ? movementDetails.leftSign : null;
        this.leftDegree = (movementDetails.leftDegree) ? movementDetails.leftDegree : null;
        this.rightSign = (movementDetails.rightSign) ? movementDetails.rightSign : null;
        this.rightDegree = (movementDetails.rightDegree) ? movementDetails.rightDegree : null;
        this.sign = (movementDetails.Sign) ? movementDetails.Sign : null;
        this.degree = (movementDetails.Degree) ? movementDetails.Degree : null;
        this.name = (movementDetails.name) ? movementDetails.name : null;
        this.bodyPartId = (movementDetails.bodyPartId) ? movementDetails.bodyPartId : null;
    }
}
export class MovementDetails {
    id: number;
    testName: string;
    testResult: string;
    normal_range: string;
    orientation: string;
    tenderness: string;
    consistency: string;
    conjunction: string;
    with: boolean;
    painLevel: string;
    spasm: string;
    comment: string;
    painInJoint: string;
    painAcrossShoulder: string;
    limitationOfMovement: string;
    bodyPartId: number;
    bodyPartMovement: BodyPartMovements[];
    testReports: TestReports[];
    position: string;
    constructor(movementDetails) {
        this.id = (movementDetails.id) ? movementDetails.id : null;
        this.testName = (movementDetails.testName) ? movementDetails.testName : null;
        this.position = (movementDetails.position) ? movementDetails.position : null;
        this.testResult = (movementDetails.testResult) ? movementDetails.testResult : null;
        this.normal_range = (movementDetails) ? movementDetails.normal_range : null;
        this.orientation = (movementDetails.orientation) ? movementDetails.orientation : null;
        this.tenderness = (movementDetails.tenderness) ? movementDetails.tenderness : null;
        this.consistency = (movementDetails.consistency) ? movementDetails.consistency : null;
        this.conjunction = (movementDetails.conjunction) ? movementDetails.conjunction : null;
        this.with = (movementDetails.with) ? movementDetails.with : null;
        this.painLevel = (movementDetails.painLevel) ? movementDetails.painLevel : null;
        this.spasm = (movementDetails.spasm) ? movementDetails.spasm : null;
        this.comment = (movementDetails.comment) ? movementDetails.comment : null;
        this.painInJoint = (movementDetails.painInJoint) ? movementDetails.painInJoint : null;
        this.painAcrossShoulder = (movementDetails.painAcrossShoulder) ? movementDetails.painAcrossShoulder : null;
        this.limitationOfMovement = (movementDetails.limitationOfMovement) ? movementDetails.limitationOfMovement : null;
        this.bodyPartId = (movementDetails.bodyPartId) ? movementDetails.bodyPartId : null;

        // this.testReports = (movementDetails.testReports)?movementDetails.testReports:null;
        if (movementDetails.bodyPartMovements) {
            ;
            this.bodyPartMovement = movementDetails.bodyPartMovements.filter((data) => {
                return (data.orientation === '' && data.measuredROM === '' && data.leftMeasuredROM === '' && data.rightMeasuredROM === '') ? false : true;
            }).map((data) => {
                return new BodyPartMovements(data, this.bodyPartId);
            });
        }
        if (movementDetails.bodyPartTests) {
            ;
            this.testReports = movementDetails.bodyPartTests.filter((data) => {
                return (!(data.Degree === null && data.Sign === null && data.leftDegree === null && data.leftSign === null && data.rightDegree === null && data.rightSign === null));

            })
            this.testReports = this.testReports.map((data) => {
                return new TestReports(data);
            });
        }
    }
}
export class PhysicalExamination2 {
    movementDetails: MovementDetails[];
    // testReports:TestReports;
    painLevel?: string;
    alert?: boolean;
    oriented?: boolean;
    painComment?: string;
    gait: any[];
    gaitComment: string;
    neurologicComment: string;
    neurologic: boolean;
    general?: string;
    generalComment?: string;
    constructor(physicalExamination2) {
        this.movementDetails = physicalExamination2.movementDetails.filter((data) => {
            return data.checked == true;
        }).map((data) => {
            return new MovementDetails(data);
        });
        // this.movementDetails = (physicalExamination2.movementDetails) ? physicalExamination2.movementDetails : null;
        this.painLevel = physicalExamination2.painLevel;
        this.alert = physicalExamination2.alert;
        this.oriented = physicalExamination2.oriented;
        this.painComment = physicalExamination2.painComment;
        this.gait = physicalExamination2.gait.filter((gait) => {
            return gait.checked;
        }).map((gait) => {
            return gait.id
        });
        this.gaitComment = physicalExamination2.gaitComment;
        this.general = physicalExamination2.general;
        this.generalComment = physicalExamination2.generalComment;
        this.neurologicComment = physicalExamination2.neurologicComment;
        this.neurologic = physicalExamination2.neurologic;
    }
}
export class DiagnosticImpression {
    comments: string;
    // bodyPartCodes: SelectedBodyPartCodes[];
    cpt_codes: any[]
    icd10_codes: any[]
    constructor(di) {
        this.comments = (di.comments) ? di.comments : null;
        // this.bodyPartCodes = di.bodyPartCodes;
        this.cpt_codes = di.cpt_codes;
        this.icd10_codes = di.icd10_codes;
    }
}
export class TreatmentRendered {
    cpt_codes: any[]
    constructor(treatment_rendered) {
        ;
        this.cpt_codes = treatment_rendered.cpt_codes;
    }
}


export class DeviceBodyPart {
    id: number;
    name: string;
    hasLocation?: boolean;
    has_comments?: boolean | number;
    bodyPartKey?: string;   //Only for seeded info not required in development
    type?: string;          //Only for seeded info not required in development
    location?: string;
    comments?: string;
    constructor(bodyPart) {
        this.id = bodyPart.id;
        this.name = bodyPart.name;
        this.hasLocation = bodyPart.hasLocation;
        this.has_comments = bodyPart.has_comments;
        this.location = bodyPart.location;
        this.comments = bodyPart.comments;
    }

}
export class Devices {
    id: number;
    name: string;
    location: boolean;
    has_comments?: boolean;
    lengths_of_need: number[];
    usage: string[];
    bodyParts: DeviceBodyPart[];
    constructor(device: Devices) {
        this.id = device.id;
        this.name = device.name;
        this.location = device.location;
        this.lengths_of_need = device.lengths_of_need;
        this.usage = device.usage;
        this.bodyParts = device.bodyParts;
        this.has_comments = (device.has_comments) ? true : false;
    }
}

// ***************************************************************************** 
// ********************************** Accident ********************************* 
// ***************************************************************************** 

export class Accident {
    public id: number;
    public accidentDate: Date;

    constructor(accident) {
        this.id = (accident.id) ? accident.id : null;
        this.accidentDate = (accident.accidentDate) ? accident.accidentDate : null;
    }
}
// ***************************************************************************** 
// ************************************ Case *********************************** 
// ***************************************************************************** 

export class Case {
    public id: number;
    public accidentId: number;
    public accident: Accident;
    public caseType: string;

    constructor(Case) {
        this.id = (Case.id) ? Case.id : null;
        this.accidentId = (Case.accidentId) ? Case.accidentId : null;
        this.accident = (Case.accident) ? Case.accident : null;
        this.caseType = (Case.caseType) ? Case.caseType : null;
    }

}
// ***************************************************************************** 
// ******************************** Appointment ******************************** 
// ***************************************************************************** 

export class Appointment {
    public id: number;
    public start: string;//Appointment start date and time 
    public end: string;//Appointment end date and time
    public title: string;
    public chartNo: string;
    public status: string;
    public checkInTime: string;
    public speciality: string;
    public dateOfAccident: string;
    public caseId: string;
    public patientId: string;
    public doctorId: string;
    public visitType: string;
    public visitId: number;
    public isComplete: Boolean;
    public doctor: Doctor;
    public patient: Patient;
    public case: Case;
    public session: MedicalSession;
    public previousAppointmentDate: string;

    constructor(appointment) {
        this.id = (appointment.id) ? appointment.id : null;
        this.start = (appointment.start) ? appointment.start : null;
        this.end = (appointment.end) ? appointment.end : null;
        this.title = (appointment.title) ? appointment.title : null;
        this.chartNo = (appointment.chartNo) ? appointment.chartNo : null;
        this.status = (appointment.status) ? appointment.status : null;
        this.speciality = (appointment.speciality) ? appointment.speciality : null;
        this.caseId = (appointment.caseId) ? appointment.caseId : null;
        this.patientId = (appointment.patientId) ? appointment.patientId : null;
        this.doctorId = (appointment.doctorId) ? appointment.doctorId : null;
        this.visitType = (appointment.visitType) ? appointment.visitType : null;
        this.visitId = (appointment.visitId) ? appointment.visitId : null;
        this.isComplete = (appointment.isComplete) ? appointment.isComplete : false;
        this.doctor = (appointment.doctor) ? appointment.doctor : null;
        this.patient = (appointment.patient) ? appointment.patient : null;
        this.case = (appointment.case) ? appointment.case : null;
        this.session = (appointment.session) ? appointment.session : null;
        this.previousAppointmentDate = (appointment.previousAppointmentDate) ? appointment.previousAppointmentDate : null;
        this.checkInTime = (appointment.checkInTime) ? appointment.checkInTime : null;

    }
}
// ***************************************************************************** 
// *********************************** Doctor **********************************
// ***************************************************************************** 

export class Doctor {
    public id: number;
    public firstName: string;
    public middleName: string;
    public lastName: string;
    public gender: string;

    constructor(doctor) {
        this.id = (doctor.id) ? doctor.id : null;
        this.firstName = (doctor.firstName) ? doctor.firstName : null;
        this.middleName = (doctor.middleName) ? doctor.middleName : null;
        this.lastName = (doctor.lastName) ? doctor.lastName : null;
        this.gender = (doctor.gender) ? doctor.gender : null;
    }

}
// ***************************************************************************** 
// ********************************** Insurance ******************************** 
// ***************************************************************************** 

export class Insurance {
    public id: number;
    public patientId: number;
    public companyName: number;

    constructor(insurance) {
        this.id = (insurance.id) ? insurance.id : null;
        this.patientId = (insurance.patientId) ? insurance.patientId : null;
        this.companyName = (insurance.companyName) ? insurance.companyName : null;
    }
}

// ***************************************************************************** 
// ********************************** Patient ********************************** 
// ***************************************************************************** 

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

// ***************************************************************************** 
// ****************************** Medical Session ****************************** 
// ***************************************************************************** 

export class Evaluation {
    chiefComplaints: string;
    illnessHistory: string;
    alleviation: string;
    headaches: string;
    painAreas: string;

    constructor(session = {}) {
        this.setEvaluation(session);
    }

    /**
     * Sets evaluation
     * @param session 
     */
    public setEvaluation(session) {
        this.chiefComplaints = (session.chiefComplaints) ? session.chiefComplaints : null;
        this.illnessHistory = (session.illnessHistory) ? session.illnessHistory : null;
        this.alleviation = (session.alleviation) ? session.alleviation : null;
        this.headaches = (session.headaches) ? session.headaches : null;
        this.painAreas = (session.painAreas) ? session.painAreas : null;
    }
}
export class HeadInjury {
    headInjury: boolean;
    headInjuryComments: string;
    constructor(injury) {
        
        if (injury) {
            this.headInjury = injury.headInjury;
            this.headInjuryComments = (this.headInjury) ? injury.headInjuryComments : '';
        }
    }
}
// export class Complaints {
//     currentComplaint:CurrentComplaint[];

//     constructor(complaint){
//         if(complaint!=null){
//             let currentComplaint:CurrentComplaint[]=[];
//             for(let i in complaint.complaints){
//                 if(complaint.complaints[i].checked)
//                 currentComplaint.push(new CurrentComplaint(complaint.complaints[i]));
//             }
//             this.currentComplaint = currentComplaint;
//             // this.currentComplaint = (complaint.currentComplaint)?complaint.currentComplaint:null;
//         }
//     }
// setCurrentComplaints= (complaints)=>{
// }
// getCurrentComplaints = ()=>{
//     return {
//         currentComplaint:this.currentComplaint,
//         headInjury:this.headInjury,
//         headInjuryComments:this.headInjuryComments,
//     };
// }
// }
export class SubBodyParts {
    subBodyPartId: number;
    location: string;

    constructor(data) {
        this.subBodyPartId = data.subBodyPartId;
        this.location = data.location;
    }
}
export class Location {
    checked: boolean;
    comments: string;
    compDescId: number;
    id: number;
    name: string;
    subBodyParts: SubBodyParts[];
    constructor(location) {
        this.checked = (location.checked) ? true : false;

        this.comments = location.comments;
        this.compDescId = location.compDescId;
        this.id = location.id;
        this.name = location.name;
        this.subBodyParts = location.subBodyParts;
    }
}
export class PatientComplaintDescription {
    id: number;
    name: string;
    locations: Location[];
    // issue: string;
    // subBodyParts: SubBodyParts[];
    // comment: string;
    checked: boolean;
    constructor(description) {
        this.id = description.id;
        this.name = description.name;
        this.locations = description.locations;
        // this.issue = description.issue;
        // this.subBodyParts = description.subBodyParts;
        // this.comment = description.comment;
        this.checked = (description.checked) ? true : false;

    }
}
export class PainExacerbation {
    id: number;
    reason: number[];
    comment: string;
}

export class Complaints2 {
    patientComplaintDescription: PatientComplaintDescription[];
    painExacerbation: PainExacerbation;
    comment: string;

    constructor(complaint) {
        if (complaint) {
            let des = getObjectChildValue(complaint, [], ['patientComplaintDescription']);
            ;
            if (des) {

                this.patientComplaintDescription = des.map((description) => {
                    return new PatientComplaintDescription(description);
                });
            }
            this.painExacerbation = complaint.painExacerbation;
            this.comment = complaint.comment;
        }
    }

}
export class PastMedicalHistory {

    diseases: number[];
    diseasesComment: string;
    previousInjuries: string;
    allergies: number[];
    hasOtherAllergies: boolean;
    otherAllergies: string;
    medications: string;
    noMedications: Boolean;
    previousSurgeries: string;
    noPreviousSurgeries: Boolean;
    familyHistory: string;
    socialHistory: string;
    familyHistoryNoncontributory: boolean;

    constructor(medicalHistory) {
        
        if (medicalHistory) {
            this.diseases = medicalHistory.diseases;
            this.diseasesComment = medicalHistory.diseasesComment;
            this.previousInjuries = medicalHistory.previousInjuries;
            this.allergies = medicalHistory.allergies;
            this.otherAllergies = medicalHistory.otherAllergies;
            this.hasOtherAllergies = (medicalHistory.hasOtherAllergies) ? true : false;
            this.noMedications = medicalHistory.noMedications;
            // this.medications = (!medicalHistory.noMedications) ? medicalHistory.medications : '';
            this.medications = (this.noMedications) ? null : medicalHistory.medications;
            this.noPreviousSurgeries = medicalHistory.noPreviousSurgeries;
            this.previousSurgeries = (!medicalHistory.noPreviousSurgeries) ? medicalHistory.previousSurgeries : '';
            this.previousSurgeries = (this.noPreviousSurgeries) ? null : medicalHistory.previousSurgeries;
            this.familyHistory = medicalHistory.familyHistory;
            this.socialHistory = medicalHistory.socialHistory;
            this.familyHistoryNoncontributory = medicalHistory.familyHistoryNoncontributory;
        }
    }

}

// Plan of care classes
export class PlanOfCare {
    id: number;
    orthopedic: string;
    painManagement: string;
    pmr: string;
    spineSpecialist: string;
    handSpecialist: string;
    podiatry: string;
    other: string;
    extermities: string;
    andOr: string;
    comment: string;
    device: number[];
    followUpVisit: string;
    patientPrognosis: string;
    patientPrognosisVal: string;
    temporarilyImpaired: number;
    temporarilyImpairedComment: string;
}

export class Speciality {
    id: number;
    name: string;
    checked: Boolean;
    dropped: Boolean;
    comment: string;
    children: Speciality;
    constructor(speciality) {
        this.id = (speciality.id) ? speciality.id : null;
        this.name = (speciality.name) ? speciality.name : null;
        this.checked = (speciality.checked) ? speciality.checked : null;
        this.dropped = (speciality.dropped) ? speciality.dropped : null;
        this.comment = (speciality.comment) ? speciality.comment : null;
        this.children = (speciality.children) ? speciality.children : null;
    }
}

export class Device {
    id: number;
    left: Boolean;
    right: Boolean;
    name: string;
    comments: string;
    constructor(device) {
        this.id = (device.id) ? device.id : null;
        this.left = (device.left) ? device.left : false;
        this.right = (device.right) ? device.right : false;
        this.name = (device.heading) ? device.heading : "";
        this.comments = (device.comments) ? device.comments : "";
    }
}

export class MRIs {
    id: number;
    left: Boolean;
    right: Boolean;
    heading: string;
    withValue: Boolean;
    childId: number;
    childChecked: Boolean;
    otherComment: number;
    callStatReport: Boolean;
    sendPhysicianFilms: Boolean;
    constructor(mri) {
        this.id = (mri.id) ? mri.id : null;
        this.left = (mri.left) ? mri.left : false;
        this.right = (mri.right) ? mri.right : false;
        this.heading = (mri.heading) ? mri.heading : "";
        this.withValue = (mri.withValue) ? mri.withValue : "";
        // this.without = (mri.withoutValue)?mri.withoutValue:false;
        this.childId = (mri.childId) ? mri.childId : null;
        this.childChecked = (mri.childChecked) ? mri.childChecked : false;
        this.otherComment = (mri.otherComment) ? mri.otherComment : null;
        this.callStatReport = (mri.callStatReport) ? mri.callStatReport : null;
        this.sendPhysicianFilms = (mri.sendPhysicianFilms) ? mri.sendPhysicianFilms : null;
    }
}
export class OtherMRIs {
    other: MRIs[];
    mrAngiographies: MRIs[];
    ctaAngiographies: MRIs[];
    mammographies: MRIs[];
    ultrasounds: MRIs[];
    dexa: MRIs[];

    constructor(others) {
        let mris = {
            other: [],
            mrAngiographies: [],
            ctaAngiographies: [],
            mammographies: [],
            ultrasounds: [],
            dexa: [],
        }
        for (let x in others) {
            mris[others[x].heading].push(new MRIs(others[x]));
        }

        this.other = (mris.other) ? mris.other : null;
        this.mrAngiographies = (mris.mrAngiographies) ? mris.mrAngiographies : null;
        this.ctaAngiographies = (mris.ctaAngiographies) ? mris.ctaAngiographies : null;
        this.mammographies = (mris.mammographies) ? mris.mammographies : null;
        this.ultrasounds = (mris.ultrasounds) ? mris.ultrasounds : null;
        this.dexa = (mris.dexa) ? mris.dexa : null;

    }

}
// export class imagingStudy {
//     XRay:Boolean;
//     CTScan:Boolean;
//     MRI:Boolean;
//     XRays:MRIs[];
//     ctScans:MRIs[];
//     mris:MRIs[];
//     ctaAngiographies:MRIs[];
//     mrAngiographies:MRIs[];
//     constructor(imaging){
//         this.XRay = (imaging.XRay)?imaging.XRay:null;
//         this.CTScan = (imaging.CTScan)?imaging.CTScan:null;
//         this.MRI = (imaging.MRI)?imaging.MRI:null;
//         this.XRays = (imaging.XRays)?imaging.XRays:null;
//         this.ctScans = (imaging.ctScans)?imaging.ctScans:null;
//         this.mris = (imaging.mris)?imaging.mris:null;
//     }
// }
export class Drugs {
    id: number;
    display: string;
    value: string;
    constructor(drug) {
        this.id = (drug.id) ? drug.id : null;
        this.display = (drug.display) ? drug.display : null;
        this.value = (drug.value) ? drug.value : null;
    }
}
export class Exercise {
    id: number;
    name: string;
    constructor(exercise) {
        this.id = (exercise.id) ? exercise.id : null;
        this.name = (exercise.display) ? exercise.name : null;
    }
}
export class Modality {
    id: number;
    name: string;
    constructor(modality) {
        this.id = (modality.id) ? modality.id : null;
        this.name = (modality.display) ? modality.name : null;
    }
}
export class Goal {
    id: number;
    name: string;
    constructor(goal) {
        this.id = (goal.id) ? goal.id : null;
        this.name = (goal.display) ? goal.name : null;
    }
}
export class Tharapy {
    id: number;
    name: string;
    constructor(tharapy) {
        this.id = (tharapy.id) ? tharapy.id : null;
        this.name = (tharapy.display) ? tharapy.name : null;
    }
}
export class WeightBearing {
    id: number;
    name: string;
    constructor(weightBear) {
        this.id = (weightBear.id) ? weightBear.id : null;
        this.name = (weightBear.display) ? weightBear.name : null;
    }
}
export class Medication {

    prescribedDrugs: Drugs[];
    usePrescribed: Boolean;
    useOld: Boolean;
    workEffect: Boolean;
    constructor(medications) {
        this.prescribedDrugs = (medications.prescribedDrugs) ? medications.prescribedDrugs : null;
        this.usePrescribed = (medications.usePrescribed) ? medications.usePrescribed : null;
        this.useOld = (medications.useOld) ? medications.useOld : null;
        this.workEffect = (medications.workEffect) ? medications.workEffect : null;
    }

}
export class BodyPart {
    id: number;
    name: string;
    orientation: string;
    constructor(bodyPart) {
        this.id = (bodyPart.id) ? bodyPart.id : null;
        this.name = (bodyPart.name) ? bodyPart.name : null;
        this.orientation = (bodyPart.orientation) ? bodyPart.orientation : null;
    }
}
export class Referral {

    checked: Boolean;
    comment: string;
    improvement: string;
    intervalName: string;
    noOfWeeks: string;
    perWeek: string;
    periodName: string;
    precautions: string;
    specialty: string;
    diagnosis: any;
    weightBearings: Exercise;
    exercises: Exercise;
    modalities: Modality;
    goals: Goal;
    tharapies: Tharapy;
    constructor(referral) {
        this.checked = (referral.checked) ? referral.checked : null;
        this.comment = (referral.comment) ? referral.comment : null;
        this.intervalName = (referral.intervalName) ? referral.intervalName : null;
        this.improvement = (referral.improvement) ? referral.improvement : null;
        this.noOfWeeks = (referral.noOfWeeks) ? referral.noOfWeeks : null;
        this.perWeek = (referral.perWeek) ? referral.perWeek : null;
        this.periodName = (referral.periodName) ? referral.periodName : null;
        this.precautions = (referral.precaution) ? referral.precaution : null;
        this.specialty = (referral.specialty) ? referral.specialty : null;
        this.exercises = (referral.exercises) ? referral.exercises : null;
        this.modalities = (referral.modalities) ? referral.modalities : null;
        this.goals = (referral.goals) ? referral.goals : null;
        this.tharapies = (referral.tharapies) ? referral.tharapies : null;
        this.tharapies = (referral.tharapies) ? referral.tharapies : null;
        let diagnosis = getObjectChildValue(referral, [], ['diagnosis']) || [];
        ;
        this.diagnosis = diagnosis.filter((code) => { return code.checked; }).map((code) => { return code.id }) //{ return { id: code.id } })

    }

}

export class planOfCare1 {
    ptPerWeek: number;
    ptNoOfWeeks: number;
    ptImprovement: Boolean;
    ptComment: string;
    radiologies: MRIs[];
    radiologyOn: Boolean;
    radiologyComments: string;
    ctScans: MRIs[];
    CTScanOn: Boolean;
    ctComments: string;
    MRI: MRIs[];
    MRIOn: Boolean;
    mriComments: string;
    others: MRIs[];
    otherOn: Boolean;
    otherComments: string;
    devices: any[];
    otherDeviceschecked: Boolean;
    otherDevices: string;
    followUpVisit: string;
    followUpOther: string;
    orthopedic: boolean;
    orthopedic_checked: string;
    painManagement: boolean;
    painManagement_checked: string;
    pmr: boolean;
    pmr_checked: string;
    spineSpecialist: boolean;
    spineSpecialist_checked: string;
    handSpecialist: boolean;
    handSpecialist_checked: string;
    podiatry: boolean;
    podiatry_checked: string;
    extremities: boolean;
    extremities_checked: string;
    other: boolean;
    other_checked: string;
    comment: string;
    casualityComments: string;
    temporarilyImpairedComment: string;
    temporarilyImpaired: number;
    medications: Medication;
    prognosisCheck: boolean;
    prognosis: boolean;
    // ptPeriodName: string;
    // ptIntervalName: string;
    specialities: Speciality[];
    referrals: Referral[];
    hbotPrescription: string;
    synapticTreatment: string;
    orientedBodyParts: BodyPart;
    nonOrientedBodyParts: BodyPart;
    rangeOfMotion: boolean;
    // diagnostic_codes: any[];
    constructor(plan) {

        this.radiologyOn = getObjectChildValue(plan, null, ['radiologyOn']);
        this.radiologies = (this.radiologyOn) ? getObjectChildValue(plan, null, ['radiologies']) : null;
        this.radiologyComments = (this.radiologyOn) ? getObjectChildValue(plan, null, ['radiologyComments']) : null;

        this.CTScanOn = getObjectChildValue(plan, null, ['CTScanOn']);
        this.ctScans = (this.CTScanOn) ? getObjectChildValue(plan, null, ['ctScans']) : null;
        this.ctComments = (this.CTScanOn) ? getObjectChildValue(plan, null, ['ctComments']) : null;

        this.MRIOn = getObjectChildValue(plan, null, ['MRIOn']);
        this.MRI = (this.MRIOn) ? getObjectChildValue(plan, null, ['MRI']) : null;
        this.mriComments = (this.MRIOn) ? getObjectChildValue(plan, null, ['mriComments']) : null;

        this.otherOn = getObjectChildValue(plan, null, ['otherOn']);
        this.others = (this.otherOn) ? getObjectChildValue(plan, null, ['others']) : null;
        this.otherComments = (this.otherOn) ? getObjectChildValue(plan, null, ['otherComments']) : null;

        this.devices = getObjectChildValue(plan, null, ['devices']);
        this.devices = this.devices.filter((device) => {
            return device.checked;
        });
        this.followUpVisit = getObjectChildValue(plan, null, ['followUpVisit']);
        this.followUpOther = getObjectChildValue(plan, null, ['followUpOther']);
        this.orthopedic = getObjectChildValue(plan, null, ['orthopedic']);
        this.orthopedic_checked = getObjectChildValue(plan, null, ['orthopedic_checked']);
        this.painManagement = getObjectChildValue(plan, null, ['painManagement']);
        this.painManagement_checked = getObjectChildValue(plan, null, ['painManagement_checked']);
        this.pmr = getObjectChildValue(plan, null, ['pmr']);
        this.pmr_checked = getObjectChildValue(plan, null, ['pmr_checked']);
        this.spineSpecialist = getObjectChildValue(plan, null, ['spineSpecialist']);
        this.spineSpecialist_checked = getObjectChildValue(plan, null, ['spineSpecialist_checked']);
        this.handSpecialist = getObjectChildValue(plan, null, ['handSpecialist']);
        this.handSpecialist_checked = getObjectChildValue(plan, null, ['handSpecialist_checked']);
        this.podiatry = getObjectChildValue(plan, null, ['podiatry']);
        this.podiatry_checked = getObjectChildValue(plan, null, ['podiatry_checked']);
        this.extremities = getObjectChildValue(plan, null, ['extremities']);
        this.extremities_checked = getObjectChildValue(plan, null, ['extremities_checked']);
        this.other = getObjectChildValue(plan, null, ['other']);
        this.other_checked = getObjectChildValue(plan, null, ['other_checked']);
        this.otherDevices = getObjectChildValue(plan, null, ['otherDevices']);
        this.otherDeviceschecked = getObjectChildValue(plan, null, ['otherDeviceschecked']);
        this.comment = getObjectChildValue(plan, null, ['comment']);
        this.casualityComments = getObjectChildValue(plan, null, ['casualityComments']);
        this.temporarilyImpairedComment = getObjectChildValue(plan, null, ['temporarilyImpairedComment']);
        this.temporarilyImpaired = getObjectChildValue(plan, null, ['temporarilyImpaired']);
        this.medications = getObjectChildValue(plan, null, ['medications']);
        this.prognosisCheck = getObjectChildValue(plan, null, ['prognosisCheck']);
        this.prognosis = getObjectChildValue(plan, null, ['prognosis']);
        // this.ptPeriodName = getObjectChildValue(plan, null, ['ptPeriodName']);
        // this.ptIntervalName = getObjectChildValue(plan, null, ['ptIntervalName']);
        this.specialities = getObjectChildValue(plan, null, ['specialities']);
        this.referrals = getObjectChildValue(plan, null, ['referrals']);
        this.hbotPrescription = getObjectChildValue(plan, false, ['hbotPrescription']);
        this.synapticTreatment = getObjectChildValue(plan, false, ['synapticTreatment']);
        this.rangeOfMotion = getObjectChildValue(plan, false, ['rangeOfMotion']);
        this.orientedBodyParts = (this.rangeOfMotion) ? getObjectChildValue(plan, [], ['orientedBodyParts']) : [];
        this.nonOrientedBodyParts = (this.rangeOfMotion) ? getObjectChildValue(plan, [], ['nonOrientedBodyParts']) : [];
        // let diagnostic_codes = getObjectChildValue(plan, [], ['diagnostic_codes']) || [];
        // this.diagnostic_codes = diagnostic_codes.filter((code) => { return code.checked; }).map((code) => { return { id: code.id } })

    }
}
export class Values {
    outOfWorkDate: string;
    returnedToWorkDate: string;
    limitations: string;
    constructor(value) {
        this.outOfWorkDate = (value && value.outOfWorkDate) ? value.outOfWorkDate : null;
        this.returnedToWorkDate = (value && value.returnedToWorkDate) ? value.returnedToWorkDate : null;
        this.limitations = (value && value.limitations) ? value.limitations : null;
    }
}
export class WorkStatus {
    case: string;
    values: Values;
    comments: string;
    constructor(plan) {
        this.case = (plan && plan.case) ? plan.case : null;
        this.values = new Values((plan && plan.values) ? plan.values : null);
        this.comments = (plan && plan.comments) ? plan.comments : null;
    }
}
// Referrals Synaptic Details

export class PainScaleScore {
    private treatmentDay: string;
    private beforeTreatment: string;
    private afterTreatment: string;

    constructor(painScaleScore) {
        this.treatmentDay = (painScaleScore.treatmentDay) ? painScaleScore.treatmentDay : null;
        this.beforeTreatment = (painScaleScore.beforeTreatment) ? painScaleScore.beforeTreatment : null;
        this.afterTreatment = (painScaleScore.afterTreatment) ? painScaleScore.afterTreatment : null;
    }

}
export class SynapticDetails {

    private treatmentDay: string;
    private area: string;
    private treatmentTime: string;
    private bias: string;
    private dosageLevel: string;
    private designedElectrodes: string;

    constructor(synapticDetails) {
        this.treatmentDay = (synapticDetails.treatmentDay) ? synapticDetails.treatmentDay : null;
        this.area = (synapticDetails.area) ? synapticDetails.area : null;
        this.treatmentTime = (synapticDetails.treatmentTime) ? synapticDetails.treatmentTime : null;
        this.bias = (synapticDetails.bias) ? synapticDetails.bias : null;
        this.dosageLevel = (synapticDetails.dosageLevel) ? synapticDetails.dosageLevel : null;
        this.designedElectrodes = (synapticDetails.designedElectrodes) ? synapticDetails.designedElectrodes : null;
    }
}
export class Synaptic {
    private comments: string;
    private painScaleScore: PainScaleScore[];
    private synapticDetails: SynapticDetails[];
    private treatmentDiagnosis: string;
    private treatmentInterval: string;
    private treatmentIntervalName: string;
    private treatmentNoOfTimes: string;
    private treatmentPeriodName: string;

    constructor(synaptic) {
        this.comments = (synaptic.comments) ? synaptic.comments : null;
        this.painScaleScore = (synaptic.painScaleScore) ? synaptic.painScaleScore : null;
        this.synapticDetails = (synaptic.synapticDetails) ? synaptic.synapticDetails : null;
        this.treatmentDiagnosis = (synaptic.treatmentDiagnosis) ? synaptic.treatmentDiagnosis : null;
        this.treatmentInterval = (synaptic.treatmentInterval) ? synaptic.treatmentInterval : null;
        this.treatmentIntervalName = (synaptic.treatmentIntervalName) ? synaptic.treatmentIntervalName : null;
        this.treatmentNoOfTimes = (synaptic.treatmentNoOfTimes) ? synaptic.treatmentNoOfTimes : null;
        this.treatmentPeriodName = (synaptic.treatmentPeriodName) ? synaptic.treatmentPeriodName : null;
    }
}
export class TimeReport {
    private timeSet: string;
    private timeStarted: string;
    private timeEnd: string;
    constructor(data) {
        this.timeSet = (data.timeSet) ? data.timeSet : '';
        this.timeStarted = (data.timeStarted) ? data.timeStarted : '';
        this.timeEnd = (data.timeEnd) ? data.timeEnd : '';
    }
}
export class HBOT {
    private psi: string;
    private ata: string;
    private mask: string;
    private earPlanes: string;
    private timeStarted: string;
    private psiEarsPressurized: string;
    private timeToMaxPsi: string;
    private timeStartedDown: string;
    private timeSpentAtMax: string;
    private timeToZero: string;
    private totalTimeInChamber: string;
    private timeReports: TimeReport[];
    private technician: string;
    private doctorReviewed: string;
    private comment: string;
    constructor(data) {
        this.psi = (data.psi) ? data.psi : '';
        this.ata = (data.ata) ? data.ata : '';
        this.mask = (data.mask) ? data.mask : '';
        this.earPlanes = (data.earPlanes) ? data.earPlanes : '';
        this.timeStarted = (data.timeStarted) ? data.timeStarted : '';
        this.psiEarsPressurized = (data.psiEarsPressurized) ? data.psiEarsPressurized : '';
        this.timeToMaxPsi = (data.timeToMaxPsi) ? data.timeToMaxPsi : '';
        this.timeStartedDown = (data.timeStartedDown) ? data.timeStartedDown : '';
        this.timeSpentAtMax = (data.timeSpentAtMax) ? data.timeSpentAtMax : '';
        this.timeToZero = (data.timeToZero) ? data.timeToZero : '';
        this.totalTimeInChamber = (data.totalTimeInChamber) ? data.totalTimeInChamber : '';
        this.timeReports = (data.timeReports) ? data.timeReports : null;
        this.technician = (data.technician) ? data.technician : '';
        this.doctorReviewed = (data.doctorReviewed) ? data.doctorReviewed : '';
        this.comment = (data.comment) ? data.comment : '';
    }
}
export class MedicalSession {

    id: number;
    appointment_id: number;
    // caseId:number;
    // patientId:number;
    // doctorId:number;
    evaluation: Evaluation;
    currentComplaints: CurrentComplaint[];
    headInjury: HeadInjury;
    currentComplaints2: Complaints2;
    pastMedicalHistory: PastMedicalHistory;
    physicalExamination1: PhysicalExamination1;
    physicalExamination2: PhysicalExamination2;
    diagnosticImpression: DiagnosticImpression;
    phyOccChirott: any;
    mriReferral: any;
    specialityConsultation: any;
    rangeOfMotion: any;
    visitType: string;
    planOfCare: planOfCare1;
    workStatus: WorkStatus;
    treatment_rendered: TreatmentRendered;
    synaptic: Synaptic;
    hbotNotes: HBOT;
    finalize_visit: Boolean;
    constructor(session) {
        ;
        this.id = (session.id) ? session.id : null;
        this.appointment_id = (session.appointment_id) ? session.appointment_id : null;
        this.evaluation = (session.evaluation) ? session.evaluation : null;
        this.currentComplaints = (session.currentComplaints) ? session.currentComplaints : null;
        this.headInjury = session.headInjury ? new HeadInjury(session.headInjury) : null;
        this.currentComplaints2 = (session.currentComplaints2) ? session.currentComplaints2 : null;
        this.pastMedicalHistory = (session.pastMedicalHistory) ? session.pastMedicalHistory : null;
        this.physicalExamination1 = (session.physicalExamination1) ? new PhysicalExamination1(session.physicalExamination1) : null;
        this.physicalExamination2 = (session.physicalExamination2) ? session.physicalExamination2 : null;
        this.diagnosticImpression = (session.diagnosticImpression) ? session.diagnosticImpression : null;
        this.phyOccChirott = (session.phyOccChirott) ? session.phyOccChirott : null;
        this.mriReferral = (session.mriReferral) ? session.mriReferral : null;
        this.specialityConsultation = (session.specialityConsultation) ? session.specialityConsultation : null;
        this.rangeOfMotion = (session.rangeOfMotion) ? session.rangeOfMotion : null;
        this.visitType = (session.visitType) ? session.visitType : null;
        this.planOfCare = (session.planOfCare) ? session.planOfCare : null;
        this.synaptic = (session.synaptic) ? session.synaptic : null;
        this.hbotNotes = (session.hbotNotes) ? session.hbotNotes : null;
        this.finalize_visit = (session.finalize_visit) ? session.finalize_visit : false;
        this.workStatus = (session && session.workStatus) ? new WorkStatus(session.workStatus) : null;
        this.treatment_rendered = (session.treatment_rendered) ? new TreatmentRendered(session.treatment_rendered) : null;
    }
}








