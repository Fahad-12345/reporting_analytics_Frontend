export class ContactPerson {
    private _first_name: string;
    private _middle_name: string;
    private _last_name: string;
    private _phone_no: string;
    private _extension: string;
    private _cell_no: string;
    private _fax: string;
    private _email: string;


    public get cellNo(): string {
        return this._cell_no;
    }

    public set cellNo(cell_no: string) {
        this._cell_no = cell_no;
    }

    public get fullName(): string {
        return `${this.firstName || ''} ${this.middleName || ''} ${this.lastName || ''}`.replace(/\s\s+/g, ' ')
    }

    public get firstName(): string {
        return this._first_name;
    }

    public set firstName(firstname: string) {
        this._first_name = firstname;
    }

    public get middleName(): string {
        return this._middle_name;
    }

    public set middleName(middlename: string) {
        this._middle_name = middlename;
    }

    public get lastName(): string {
        return this._last_name;
    }

    public set lastName(lastname: string) {
        this._last_name = lastname;
    }

    public get phoneNo(): string {
        return this._phone_no;
    }

    public set phoneNo(phoneno: string) {
        this._phone_no = phoneno;
    }

    public get extension(): string {
        return this._extension;
    }

    public set extension(extension: string) {
        this._extension = extension;
    }

    public get fax(): string {
        return this._fax;
    }

    public set fax(fax: string) {
        this._fax = fax;
    }

    public get email(): string {
        return this._email;
    }

    public set email(email: string) {
        this._email = email;
    }

    constructor(contactPerson: any) {
        this.contactPerson = contactPerson;
    }

    public set contactPerson(contactPerson) {
        if (contactPerson) {
            this.firstName = contactPerson.first_name;
            this.middleName = contactPerson.middle_name;
            this.lastName = contactPerson.last_name;
            this.phoneNo = contactPerson.phone_no;
            this.extension = contactPerson.extension;
            this.cellNo = contactPerson.cell_no;
            this.fax = contactPerson.fax;
            this.email = contactPerson.email;
        }
    }

    public get getContactPerson() {
        return {
            first_name: this.firstName,
            middle_name: this.middleName,
            last_name: this.lastName,
            phone_no: this.phoneNo,
            extension: this.extension,
            cell_no: this.cellNo,
            fax: this.fax,
            email: this.email
        }
    }

    public get dummyData() {
        return {
            first_name: 'first',
            middle_name: 'middle',
            last_name: 'last',
            phone_no: '1111111111',
            extension: '1111111111',
            cell_no: '1111111111',
            fax: '1111111111',
            email: 'email@email.com'
        }
    }
}
