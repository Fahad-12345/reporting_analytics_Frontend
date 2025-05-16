export class MDParams {
    caseId: number;
    doctorId: number;
    finalize_visit: boolean;
    id: number;
    patientId: number;
    visitType: string;
    constructor(params: MDParams) {
        this.caseId = params.caseId
        this.doctorId = params.doctorId
        this.finalize_visit = params.finalize_visit
        this.id = params.id
        this.patientId = params.patientId
        this.visitType = params.visitType
    }
}
