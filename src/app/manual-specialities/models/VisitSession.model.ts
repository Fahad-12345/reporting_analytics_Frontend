export class VisitSession {
    appointment_id: number
    appointment_type_id: number
    case_id: number
    cpt_codes_comment: string
    doctor_id: number
    icd_codes_comment: string
    id: number
    patient_id: number
    speciality_id: number
    visit_date: Date
    visit_date_format: "2020-05-28"
    visit_session_state_id: VisitStateEnum;
    icd_codes: any[];
    cpt_codes: any[];
}

export enum VisitStateEnum {
    unfinalized = 1,
    finalized = 2
}
export enum VisitSessionEnum{
    Visit_Status = "bill_created"
}
