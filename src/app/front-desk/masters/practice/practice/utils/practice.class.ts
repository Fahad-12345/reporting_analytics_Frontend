export class Practice {
    id: number;
    name: string;
    locations: Location[];
    constructor(id: number = null, name: string, locations: Location[]) {
        this.id = id;
        this.name = name;
        this.locations = locations.map(location => new Location(location));
    }
}

export class Location {
    ActionType?: string = '';
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    floor: string;
    zip: string;
    phone: string;
    ext_no: string;
    cell_no: string;
    fax: string;
    email: string;
    region_id: number;
    // day_list: string;
    office_hours_end: string;
    office_hours_start: string;
    lat: string;
    long: string;
    place_of_service_id: number;
    is_main: boolean;
    billing: BillingLocation[];
    timing: Timing[];
	facility_location_qualifer:string
    constructor(data) {
        this.id = data.facility_locations_id;
        this.name = data.name
        this.address = data.address
        this.city = data.city
        this.state = data.state
        this.floor = data.floor
        this.zip = data.zip
        this.phone = data.phone
        this.fax = data.fax
        this.region_id = data.region_id
        this.email = data.email
        this.place_of_service_id = data.place_of_service_id
        this.office_hours_start = data.office_hours_start
        this.office_hours_end = data.office_hours_end
        this.long = data.long
        this.lat = data.lat
        // this.day_list = data.dayList
        this.is_main = data.is_main
        this.timing = data.timing
        this.cell_no = data.cell_no,
		this.facility_location_qualifer=data.facility_location_qualifer
    }
}
export interface BillingLocation {
    id: number;
    provider_name: string;
    city: string;
    state: string;
    floor: string;
    zip: string;
    address: string;
    phone: string;
    ext_no: string;
    cell_no: string;
    email: string;
    fax: string;
    npi: string;
    tin: string;
}
export interface WeeklyTimingForm {
    timeZoneConverted?: boolean,
    selectedTimings: Timing[],
    timeRange?: TimeRangeInterface[],
    isValid: boolean,
	practice_location_id?:number;
	speciality_id?:number;
	supervisor_id?:number;
}

export interface Timing {
    name: string;
    time_zone_string: string;
    checked: boolean;
    replicate: boolean | string;
    start_time: string;
    end_time: string;
    day_id: number;
	time_zone:number;
}
export interface TimeRangeInterface {
    time_zone_string: string;
    start_time: string;
    end_time: string;
    day_id: number;
    checked?: boolean;
}
// {
//     name: testwrfdsff,
//     locations: [
//     {
//     name: sdfNew,
//     address: 11313 West Washington Boulevard,
//     city: Los Angeles,
//     state: California,
//     floor: ,
//     zip: 90066,
//     phone: ,
//     ext_no: ,
//     cell_no: ,
//     fax: ,
//     email: ,
//     region: 3,
//     day_list: [0],
//     office_hours_end: 2019-09-27T21:30:00.000Z,
//     office_hours_start: 2019-09-27T20:00:00.000Z,
//     lat: ,
//     long: ,
//     place_of_service_id: ,
//     is_main: 1,
//     billing: [
//     {
//     provider_name: billing provider,
//     city: NY,
//     state: ,
//     floor: ,
//     zip: ,
//     address: ,
//     phone: ,
//     ext_no: ,
//     cell_no: ,
//     email: ,
//     fax: ,
//     npi: 123,
//     tin: 33322
//     }
//     ],
//     timing: [
//     {
//     start_time: 10:00 AM,
//     end_time: 10:00 PM,
//     day_id: 1
//     }
//     ]
//     }
//     ]
//     }

