import { Accident } from './accident/accident';

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
