export class RolesModel {
    id: number;
    name: string;
    guard_name: string
    medical_identifier: boolean
    comment: string
    default: boolean
    created_at: Date
    updated_at: Date
    deleted_at: Date
    is_open: boolean = false;
    specialities: SpecialityModel[]
    _specialities: SpecialityModel[]
}

export class FacilityModel {
    id: number;
    name: string;
	address: string;
	state:string;
	city: boolean;
	facility_full_name:string;
	facility_id:number
    floor: string
	place_of_service_id: number;
	region_id:string;
    created_at: Date
    updated_at: Date
    deleted_at: Date
    is_open: boolean = false;
	timing:TimingModel[];
}

export class TimingModel
{
	created_at: string
created_by: number
day_id: number
deleted_at: null
end_time: string
end_time_isb: string
facility_location_id:number
id: number
start_time: string
start_time_isb: string
time_zone: number
time_zone_string: string
updated_at: string
updated_by: number
}

export class SpecialityModel {
    id: number
    name: string
    description: string
    time_slot: number
    created_at: Date
    updated_at: Date
    created_by: Date
    updated_by: Date
    over_booking: number
    has_app: boolean
    speciality_key: number
    deleted_at: Date
    comments: string
    default_name: string
    is_defualt: boolean
    is_available: boolean
    visit_types: VisitTypeModel[]
}

export class VisitTypeModel {
    id: number
    name: string
    slug: string
    description: string
    created_by: Date
    updated_by: Date
    fields_controls: number[]
}
