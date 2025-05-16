export class Complaint {
    private _id: number;
    private _medicalSessionId: number;
    private _comment: string;

    constructor(complaint) {
        this.setComplaint(complaint);
    }

    public setComplaint(complaint) {
        if (complaint) {
            this.id = complaint.id;
            this.medicalSessionId = complaint.medicalSessionId;
            this.comment = complaint.comment;
        }
    }

    public getComplaint() {
        return {
            id: this.id,
            medicalSessionId: this.medicalSessionId,
            comment: this.comment
        }
    }

    public get id(): number {
        return this._id;
    }

    public set id(id: number) {
        this._id = id;
    }

    public get medicalSessionId(): number {
        return this._medicalSessionId;
    }

    public set medicalSessionId(medicalSessionId: number) {
        this._medicalSessionId = medicalSessionId;
    }

    public get comment(): string {
        return this._comment;
    }

    public set comment(comment: string) {
        this._comment = comment;
    }


}

