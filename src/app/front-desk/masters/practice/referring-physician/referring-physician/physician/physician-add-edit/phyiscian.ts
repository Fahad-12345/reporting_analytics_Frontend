export class Physician {
    first_name: string;
    middle_name: string;
    last_name: string;
    billing_title_id: string;
    speciality_ids: number[];
    cell_no: string;
    email: string;
    npi_no: string;
    license_no: string;
    source: any[];
    realObject: any;

    constructor(values: Object = {}) {
        Object.assign(this, values)
    }
    checkEquality() {
        
        return this.getFirstName && this.getMiddleName && this.getLastName && this.getBillingTitleId &&
            this.getSpecialityId && this.getCellNo && this.getEmail && this.getNpiNo && this.licenseNo
            && this.getSource;
    }
    get getFirstName(): boolean {
        return this.first_name === this.realObject.first_name
    }
    get getMiddleName(): boolean {
        return this.middle_name === this.realObject.middle_name
    }
    get getLastName(): boolean {
        return this.last_name === this.realObject.last_name
    }
    get getBillingTitleId(): boolean {
        return this.billing_title_id === this.realObject.billing_title_id
    }
    get getSpecialityId(): boolean {
        return JSON.stringify(this.speciality_ids?.sort()) === JSON.stringify(this.realObject?.speciality_ids?.sort())
    }
    get getCellNo(): boolean {
        return this.cell_no === this.realObject.cell_no
    }
    get getEmail(): boolean {
        return this.email === this.realObject.email
    }
    get getNpiNo(): boolean {
        return this.npi_no === this.realObject.npi_no
    }
    get licenseNo(): boolean {
        return this.license_no === this.realObject.license_no
    }
    get getSource(): boolean {
        return this.source === this.realObject.source
    }
}