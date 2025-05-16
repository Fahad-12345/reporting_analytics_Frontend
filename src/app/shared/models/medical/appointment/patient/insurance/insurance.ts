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
