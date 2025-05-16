import { ContactPerson } from "./contact-person";
import { Department } from "@appDir/shared/models/department/department";

export class Hospital {

    private _id: number;
    private _name: string;
    private _street_address: string;
    private _apartment: string;
    private _city: string;
    private _state: string;
    private _zip: number;
    private _work_phone: string;
    private _ext: string;
    private _fax: string;
    private _email: string;
    private _department_ids: Array<number>;
    private _departments: Array<Department>;
    private _contact_person: ContactPerson;

    /**
     * Creates an instance of hospital.
     * @param hospital 
     */
    constructor(hospital) {
        this.setHospital = hospital;
    }


    /**
     * Sets set hospital
     */
    public set setHospital(hospital) {
        if (hospital) {
            this.id = hospital.id;
            this.name = hospital.name;
            this.streetaddress = hospital.street_address;
            this.apartment = hospital.apartment;
            this.city = hospital.city;
            this.state = hospital.state;
            this.zip = hospital.zip;
            this.workPhone = hospital.work_phone;
            this.extension = hospital.ext;
            this.fax = hospital.fax;
            this.email = hospital.email;
            this.departmentids = hospital.department_ids;
            this.contactPerson = hospital.contact_person;
        }
    }

    /**
     * Gets get hospital
     */
    public get getHospital(): any {
        return {
            id: this.id,
            name: this.name,
            street_address: this.streetAddress,
            apartment: this.apartment,
            city: this.city,
            state: this.state,
            zip: this.zip,
            work_phone: this.workPhone,
            ext: this.extension,
            fax: this.fax,
            email: this.email,
            department_ids: this.departmentids,
            contact_person: this.contactPerson.getContactPerson
        }
    }

    public get multiDropdownDepartments() {
        return this.departments.map((department) => {
            return {
                id: department.id,
                name: department.name
            }
        });
    }

    /**
     * Gets contactPerson
     */
    public get contactPerson(): ContactPerson {
        return this._contact_person;
    }

    /**
     * Sets contactPerson
     */
    public set contactPerson(contactPerson: ContactPerson) {
        this._contact_person = new ContactPerson(contactPerson);
    }

    /**
     * Gets id
     */
    public get id(): number {
        return this._id;
    }

    /**
     * Sets id
     */
    public set id(id: number) {
        this._id = id;
    }

    /**
     * Gets name
     */
    public get name(): string {
        return this._name;
    }

    /**
     * Sets name
     */
    public set name(name: string) {
        this._name = name;
    }

    /**
     * Gets street address
     */
    public get streetAddress(): string {
        return this._street_address;
    }

    /**
     * Sets streetaddress
     */
    public set streetaddress(streetaddress: string) {
        this._street_address = streetaddress;
    }

    /**
     * Gets apartment
     */
    public get apartment(): string {
        return this._apartment;
    }

    /**
     * Sets apartment
     */
    public set apartment(apartment: string) {
        this._apartment = apartment;
    }

    /**
     * Gets city
     */
    public get city(): string {
        return this._city;
    }

    /**
     * Sets city
     */
    public set city(city: string) {
        this._city = city;
    }

    /**
     * Gets state
     */
    public get state(): string {
        return this._state;
    }

    /**
     * Sets state
     */
    public set state(state: string) {
        this._state = state;
    }

    /**
     * Gets zip
     */
    public get zip(): number {
        return this._zip;
    }

    /**
     * Sets zip
     */
    public set zip(zip: number) {
        this._zip = zip;
    }

    public get workPhone(): string {
        return this._work_phone;
    }

    /**
     * Sets work phone
     */
    public set workPhone(workphone: string) {
        this._work_phone = workphone;
    }

    /**
     * Gets extension
     */
    public get extension(): string {
        return this._ext;
    }

    /**
     * Sets extension
     */
    public set extension(ext: string) {
        this._ext = ext;
    }

    /**
     * Gets fax
     */
    public get fax(): string {
        return this._fax;
    }

    /**
     * Sets fax
     */
    public set fax(fax: string) {
        this._fax = fax;
    }

    /**
     * Gets email
     */
    public get email(): string {
        return this._email;
    }

    /**
     * Sets email
     */
    public set email(email: string) {
        this._email = email;
    }

    /**
     * Gets departmentids
     */
    public get departmentids(): Array<number> {
        return this._department_ids || [];
    }

    /**
     * Sets departmentids
     */
    public set departmentids(departmentids: Array<number>) {
        this._department_ids = departmentids;
    }

    public set departments(departments) {
        if (departments) {
            this._departments = departments.filter((department) => {
                return this.departmentids.includes(department.id);
            }).map((department) => {
                return new Department(department);
            });
        }
    }

    public get departments(): Department[] {
        return this._departments || [];
    }

    public get dummyData() {
        return {
            id: 1,
            name: 'name',
            street_address: 'streetAddress',
            apartment: 'apartment',
            city: 'city',
            state: 'state',
            zip: '12312',
            work_phone: '1234567890',
            ext: '12345',
            fax: '1231231231',
            email: 'email@ovada.com',
            department_ids: [1, 2],
            contact_person: this.contactPerson.dummyData
        }
    }

}

