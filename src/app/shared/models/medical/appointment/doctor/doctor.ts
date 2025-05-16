export class Doctor {
    public id: number;
    public firstName: string;
    public middleName: string;
    public lastName: string;
    public gender: string;

    constructor(doctor) {
        this.id = (doctor.id) ? doctor.id : null;
        this.firstName = (doctor.firstName) ? doctor.firstName : null;
        this.middleName = (doctor.middleName) ? doctor.middleName : null;
        this.lastName = (doctor.lastName) ? doctor.lastName : null;
        this.gender = (doctor.gender) ? doctor.gender : null;
    }

}
