import { getObjectChildValue } from "@appDir/shared/utils/utils.helpers";

export class CurrentComplaint2 {
    private _patientComplaintDescription: PatientComplaintDescription[];
    private _painExacerbation: PainExacerbation;
    private _comment: string;


    constructor(complaints) {
        this.setCurrentComplaint2(complaints)

    }

    setCurrentComplaint2(complaint) {
        if (complaint) {
            let des = getObjectChildValue(complaint, [], ['patientComplaintDescription']);
            if (des) {
                this.patientComplaintDescription = des.map((description) => {
                    return new PatientComplaintDescription(description);
                });
            }
            this.painExacerbation = complaint.painExacerbation;
            this.comment = complaint.comment;
        }
    }

    public get patientComplaintDescription(): PatientComplaintDescription[] {
        return this._patientComplaintDescription;
    }

    public set patientComplaintDescription(patientComplaintDescription: PatientComplaintDescription[]) {
        this._patientComplaintDescription = patientComplaintDescription;
    }

    public get painExacerbation(): PainExacerbation {
        return this._painExacerbation;
    }

    public set painExacerbation(painExacerbation: PainExacerbation) {
        this._painExacerbation = painExacerbation;
    }

    public get comment(): string {
        return this._comment;
    }

    public set comment(comment: string) {
        this._comment = comment;
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