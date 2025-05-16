import { phoneFormat } from "@appDir/shared/utils/utils.helpers";

export class User {
    private id?: number;
    private first_name: string;
    private middle_name: string;
    private last_name: string;
    private email: string;
    private role_id: number;
    private status: boolean;
    private date_of_birth: string;
    private gender: string;
    private address: string;
    private city: string;
    private state: string;
    private zip: string;
    private fax: string;
    private extension: string;
    private social_security: string;
    private work_phone: string;
    private title: string;
    private cell_no: string;
    private ssn: string;
    private primary_facility_id: number;
    private affiliated_facility_ids: any[];
    private employed_by: string;
    private emergency_phone: string;
    private designation_id: string;
    private department_id: string;
    private employment_type_id: string;
    private biography: string;
    private hiring_date: string;
    private to: string;
    private from: string;
    private profile_pic_url: string;
    private isMedicalIdentifier: boolean = false;
    private apartment_suite: string;
    private employed_by_id: number;

    /**
     * Creates an instance of user.
     * @param user
     */
    constructor(user: User) {
        this.setUserDetails = user;
    }

    /**
     * Sets user details
     * @param user
     */
    public set setUserDetails(user: User) {
        if (user) {
            this.id = user.id;
            this.first_name = user.first_name || '';
            this.middle_name = user.middle_name || '';
            this.last_name = user.last_name || '';
            this.email = user.email;
            this.role_id = user.role_id;
            this.status = user.status;
            this.date_of_birth = user.date_of_birth;
            this.gender = user.gender;
            this.address = user.address;
            this.city = user.city;
            this.state = user.state;
            this.zip = user.zip;
            this.fax = user.fax;
            this.extension = user.extension;
            this.social_security = user.social_security;
            this.work_phone = user.work_phone;
            this.title = user.title;
            this.cell_no = user.cell_no;
            this.ssn = user.ssn;
            this.primary_facility_id = user.primary_facility_id;
            this.affiliated_facility_ids = user.affiliated_facility_ids;
            this.employed_by = user.employed_by;
            this.emergency_phone = user.emergency_phone;
            this.designation_id = user.designation_id;
            this.department_id = user.department_id;
            this.employment_type_id = user.employment_type_id;
            this.biography = user.biography;
            this.hiring_date = user.hiring_date;
            this.to = user.to;
            this.from = user.from;
            this.profile_pic_url = user.profile_pic_url;
            this.isMedicalIdentifier = user.isMedicalIdentifier;
            this.apartment_suite = user.apartment_suite;
            this.employed_by_id = user.employed_by_id;
        }
    }

    /**
     * Gets user details
     */
    public get getUser(): object {
        return {
            id: this.id,
            first_name: this.first_name,
            middle_name: this.middle_name,
            last_name: this.last_name,
            email: this.email,
            role_id: this.role_id,
            status: this.status,
            date_of_birth: this.date_of_birth,
            gender: this.gender,
            address: this.address,
            city: this.city,
            state: this.state,
            zip: this.zip,
            fax: this.fax,
            extension: this.extension,
            social_security: this.social_security,
            work_phone: this.work_phone,
            title: this.title,
            cell_no: this.cell_no,
            ssn: this.ssn,
            primary_facility_id: this.primary_facility_id,
            affiliated_facility_ids: this.affiliated_facility_ids,
            employed_by: this.employed_by,
            emergency_phone: this.emergency_phone,
            designation_id: this.designation_id,
            department_id: this.department_id,
            employment_type_id: this.employment_type_id,
            biography: this.biography,
            hiring_date: this.hiring_date,
            to: this.to,
            from: this.from,
            profile_pic_url: this.profile_pic_url,
            isMedicalIdentifier: this.isMedicalIdentifier,
            apartment_suite: this.apartment_suite,
            employed_by_id: this.employed_by_id
        };
    }

    /**
     * Gets user id
     * @returns user id
     */
    public get getUserId(): number {

        return this.id || null;

    }

    /**
     * Sets user id
     * @param id
     */
    public set setUserId(id: number) {

        this.id = id;

    }

    /**
     * Determines whether id is in affiliated facility ids
     * @param id
     * @returns true if id in affiliated facility
     */
    public isIdInAffiliatedFacility(id: number): boolean {

        return this.affiliated_facility_ids.includes(id);

    }

    /**
     * Gets profile image url
     * @returns profile image url
     */
    public get getProfileImageUrl(): string {

        return this.profile_pic_url || '';

    }

    /**
     * Gets date of birth
     * @returns date of birth
     */
    public get getDateOfBirth(): string {

        return this.date_of_birth;

    }

    /**
     * Gets date of birth
     * @returns date of birth
     */
    public get getFullName(): string {

        const first_name = this.first_name ? this.first_name : ``;
        const middle_name = this.middle_name ? ` ${this.middle_name}` : ``;
        const last_name = this.last_name ? ` ${this.last_name}` : ``;
        return `${first_name}${middle_name}${last_name}`;

    }

    /**
     * Gets gender
     * @param [format]
     * @returns
     */
    public getGender(format = 'full') {
        switch (format) {
            case 'full':
                return (this.gender === 'M') ? 'Male' : ((this.gender === 'F') ? 'Female' : ((this.gender === 'X') ? 'X' : 'N/A'));
        }
    }

    /**
     * Gets cell number
     * @returns cell number
     */
    public getCellNumber(): string {
        return this.cell_no ? phoneFormat(this.cell_no) : 'N/A';
    }

    /**
     * Gets email
     * @returns email
     */
    public getEmail(): string {
        return this.email || 'N/A';
    }

    /**
     * Determines whether amedical identifier is
     * @returns true if amedical identifier
     */
    public isAMedicalIdentifier(): boolean {
        return this.isMedicalIdentifier;
    }

    /**
     * Gets primary practice id
     * @returns primary practice id
     */
    public getPrimaryPracticeId(): number {
        return this.primary_facility_id;
    }
}
