export class Evaluation {
    public chiefComplaints: string;
    public illnessHistory: string;
    public alleviation: string;
    public headaches: string;
    public painAreas: string;

    constructor(session = null) {
        this.chiefComplaints = (session.chiefComplaints) ? session.chiefComplaints : null;
        this.illnessHistory = (session.illnessHistory) ? session.illnessHistory : null;
        this.alleviation = (session.alleviation) ? session.alleviation : null;
        this.headaches = (session.headaches) ? session.headaches : null;
        this.painAreas = (session.painAreas) ? session.painAreas : null;
    }
}
