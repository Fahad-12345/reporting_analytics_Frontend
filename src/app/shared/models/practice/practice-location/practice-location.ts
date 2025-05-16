import { Timing } from '../../weekly-timing-form/timing/timing';
import { Day } from '../../day/day';
import { BillingLocation } from '../billing-location/billing-location';

export class PracticeLocation {
    private _id: number;
    private _facility_id: number;
    private _name: string;
    private _city: string;
    private _state: string;
    private _zip: string;
    private _region_id: number;
    private _address: string;
    private _phone: string;
    private _fax: string;
    private _email: string;
    private _office_hours_start: string;
    private _office_hours_end: string;
    private _lat: string;
    private _long: string;
    private _created_at: string;
    private _updated_at: string;
    private _deleted_at: string;
    private _created_by: number;
    private _updated_by: number;
    private _day_list: string;
    private _floor: string;
    private _place_of_service_id: number;
    private _ext_no: string;
    private _cell_no: string;
    private _is_main: number;    // numeric boolean
    private _same_as_provider: number; // numeric boolean
    private _facility_full_name: string;
    private _timing: Timing[] = [];
    private _billing: BillingLocation[];
    /**
     * Creates an instance of practice location.
     * @param practiceLocation
     */
    constructor(practiceLocation: PracticeLocation) {
        this.setPracticeLocation = practiceLocation;
    }

    /**
     * Gets title
     * @returns title
     */
    public get getTitle(): string {
        const address = (this.address) ? this.address : ``;
        const floor = (this.floor) ? `, ${this.floor}` : ``;
        const city = (this.city) ? `, ${this.city}` : ``;
        const state = (this.state) ? `, ${this.state}` : ``;
        const zip = (this.zip) ? `, ${this.zip}` : ``;
        return `${address}${floor}${city}${state}${zip}`;
    }

    /**
     * Finds time
     * @param day 
     * @returns  
     */
    public findTime(day: Day) {
        return this.timing.find((time: Timing) => {
            return day.getId === time.getDayId;
        });
    }

    /**
     * Sets practice location
     * @param practiceLocation
     */
    public set setPracticeLocation(practiceLocation) {
        if (practiceLocation) {
            this.id = practiceLocation.id;
            this.facilityId = practiceLocation.facility_id;
            this.name = practiceLocation.name;
            this.city = practiceLocation.city;
            this.state = practiceLocation.state;
            this.zip = practiceLocation.zip;
            this.regionId = practiceLocation.region_id;
            this.address = practiceLocation.address;
            this.phone = practiceLocation.phone;
            this.fax = practiceLocation.fax;
            this.email = practiceLocation.email;
            this.officeHoursStart = practiceLocation.office_hours_start;
            this.officeHoursEnd = practiceLocation.office_hours_end;
            this.lat = practiceLocation.lat;
            this.long = practiceLocation.long;
            this.createdAt = practiceLocation.created_at;
            this.updatedAt = practiceLocation.updated_at;
            this.deletedAt = practiceLocation.deleted_at;
            this.createdBy = practiceLocation.created_by;
            this.updatedBy = practiceLocation.updated_by;
            this.dayList = practiceLocation.day_list;
            this.floor = practiceLocation.floor;
            this.placeOfServiceId = practiceLocation.place_of_service_id;
            this.extension = practiceLocation.ext_no;
            this.cellNo = practiceLocation.cell_no;
            this.isMain = practiceLocation.is_main;
            this.sameAsProvider = practiceLocation.same_as_provider;
            this.facilityFullName = practiceLocation.facility_full_name;
            this.timing = [];
            let practiceTimings = practiceLocation.timing || [];
            practiceTimings.forEach((day: Timing) => {
                this.timing.push(new Timing(day));
            });
            this.billing = practiceLocation.billing ? practiceLocation.billing : []
        }
    }

    /**
     * Gets practice location
     * @returns practice location
     */
    public get getPracticeLocation(): object {
        return {
            id: this.id,
            facility_id: this.facilityId,
            name: this.name,
            city: this.city,
            state: this.state,
            zip: this.zip,
            region_id: this.regionId,
            address: this.address,
            phone: this.phone,
            fax: this.fax,
            email: this.email,
            office_hours_start: this.officeHoursStart,
            office_hours_end: this.officeHoursEnd,
            lat: this.lat,
            long: this.long,
            created_at: this.createdAt,
            updated_at: this.updatedAt,
            deleted_at: this.deletedAt,
            created_by: this.createdBy,
            updated_by: this.updatedBy,
            day_list: this.dayList,
            floor: this.floor,
            place_of_service_id: this.placeOfServiceId,
            ext_no: this.extension,
            cell_no: this.cellNo,
            is_main: this.isMain,
            same_as_provider: this.sameAsProvider,
            facility_full_name: this.facilityFullName,
            timing: this.timing,
            billing: this.billing
        };
    }


    public get id(): number {
        return this._id;
    }

    public set id(id: number) {
        this._id = id;
    }

    public get facilityId(): number {
        return this._facility_id;
    }

    public set facilityId(facility_id: number) {
        this._facility_id = facility_id;
    }

    public get name(): string {
        return this._name;
    }

    public set name(name: string) {
        this._name = name;
    }

    public get city(): string {
        return this._city;
    }

    public set city(city: string) {
        this._city = city;
    }

    public get state(): string {
        return this._state;
    }

    public set state(state: string) {
        this._state = state;
    }

    public get zip(): string {
        return this._zip;
    }

    public set zip(zip: string) {
        this._zip = zip;
    }

    public get regionId(): number {
        return this._region_id;
    }

    public set regionId(region_id: number) {
        this._region_id = region_id;
    }

    public get address(): string {
        return this._address;
    }

    public set address(address: string) {
        this._address = address;
    }

    public get phone(): string {
        return this._phone;
    }

    public set phone(phone: string) {
        this._phone = phone;
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

    public get officeHoursStart(): string {
        return this._office_hours_start;
    }

    public set officeHoursStart(office_hours_start: string) {
        this._office_hours_start = office_hours_start;
    }

    public get officeHoursEnd(): string {
        return this._office_hours_end;
    }

    public set officeHoursEnd(office_hours_end: string) {
        this._office_hours_end = office_hours_end;
    }

    public get lat(): string {
        return this._lat;
    }

    public set lat(lat: string) {
        this._lat = lat;
    }

    public get long(): string {
        return this._long;
    }

    public set long(long: string) {
        this._long = long;
    }

    public get createdAt(): string {
        return this._created_at;
    }

    public set createdAt(created_at: string) {
        this._created_at = created_at;
    }

    public get updatedAt(): string {
        return this._updated_at;
    }

    public set updatedAt(updated_at: string) {
        this._updated_at = updated_at;
    }

    public get deletedAt(): string {
        return this._deleted_at;
    }

    public set deletedAt(deleted_at: string) {
        this._deleted_at = deleted_at;
    }

    public get createdBy(): number {
        return this._created_by;
    }

    public set createdBy(created_by: number) {
        this._created_by = created_by;
    }

    public get updatedBy(): number {
        return this._updated_by;
    }

    public set updatedBy(updated_by: number) {
        this._updated_by = updated_by;
    }

    public get dayList(): string {
        return this._day_list;
    }

    public set dayList(day_list: string) {
        this._day_list = day_list;
    }

    public get floor(): string {
        return this._floor;
    }

    public set floor(floor: string) {
        this._floor = floor;
    }

    public get placeOfServiceId(): number {
        return this._place_of_service_id;
    }

    public set placeOfServiceId(place_of_service_id: number) {
        this._place_of_service_id = place_of_service_id;
    }

    public get extension(): string {
        return this._ext_no;
    }

    public set extension(ext_no: string) {
        this._ext_no = ext_no;
    }

    public get cellNo(): string {
        return this._cell_no;
    }

    public set cellNo(cell_no: string) {
        this._cell_no = cell_no;
    }


    public get isMain(): number {
        return this._is_main;
    }

    public set isMain(is_main: number) {
        this._is_main = is_main;
    }

    public get sameAsProvider(): number {
        return this._same_as_provider;
    }

    public set sameAsProvider(same_as_provider: number) {
        this._same_as_provider = same_as_provider;
    }

    public get facilityFullName(): string {
        return this._facility_full_name;
    }

    public set facilityFullName(facility_full_name: string) {
        this._facility_full_name = facility_full_name;
    }

    public get timing(): Timing[] {
        return this._timing;
    }

    public set timing(timing: Timing[]) {
        this._timing = timing;
    }

    public get billing(): BillingLocation[] {
        return this._billing;
    }

    public set billing(billing: BillingLocation[]) {
        this._billing = billing;
    }

    public get fullAddress(): string {
        return ((this.address) ? (this.floor ? `${this.address}, ${this.floor}` : `${this.address}`) : this.floor) || 'N/A';
    }
}
