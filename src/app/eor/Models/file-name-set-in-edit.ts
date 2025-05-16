export class FileNameSetInEdit {
    bills: any;
    patient: any; 
    amount: any;

    constructor(values: object={}){
        Object.assign(this, values);
    }

    getBills(){
        return this.bills;
    }

    getPatient(){
        return this.patient;
    }

    getAmount(){
        return this.amount;
    }
}
