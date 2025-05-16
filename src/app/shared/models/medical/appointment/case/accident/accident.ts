export class Accident {
    public id: number;
    public accidentDate: Date;

    constructor(accident) {
        this.id = (accident.id) ? accident.id : null;
        this.accidentDate = (accident.accidentDate) ? accident.accidentDate : null;
    }
}
