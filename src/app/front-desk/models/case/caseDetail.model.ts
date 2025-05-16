import { Patient } from "app/front-desk/patient/patient.model";

export interface CaseDetail {
    data: Case;
    error: GenericError;
    statusCode: number
}

export interface GenericError {
    message: string;
    name: string;
    statusCode: number
}

export interface Case {
    patient: Patient
}