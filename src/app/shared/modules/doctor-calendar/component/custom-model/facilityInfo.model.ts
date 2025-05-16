export class FacilityInfo{
	constructor(id?)
	{
		this.facility_name=null
		this.address=null
		this.cell_no=null
		this.city=null
		this.created_at=null
		this.created_by=null
		this.day_list=null
		this.deleted_at=null
		this.email=null
		this.ext_no=null
		this.facility_id=null
		this.fax=null
		this.floor=null
		this.id=id==0?id :null
		this.is_main=null
		this.lat=null
		this.long=null
		this.name=null
		this.office_hours_end=null
		this.office_hours_start=null
		this.phone=null
		this.place_of_service_id=null
		this.region_id=null
		this.same_as_provider=null
		this.state=null
		this.is_active=false,
		this.updated_at=null
		this.updated_by=null
		this.zip=null
		this.color=null
		this.faciltyTiming=[];
		this.facility=null;
		this.is_checked=false

	}
	facility_name: string;
	address: string;
	cell_no: number;
	city: string;
	created_at: string;
	created_by: number;
	day_list: string;
	deleted_at: string;
	email: string;
	is_active:boolean;
	ext_no:string;
	facility_id:number;
	fax: string;
	floor:string;
	id:number;
	is_main:boolean;
	lat: number;
	long: number;
	name: string;
	office_hours_end:string;
	office_hours_start:string;
	phone: string;
	place_of_service_id: number
	region_id: string;
	same_as_provider: number;
	state: string;
	updated_at: string;
	updated_by: number;
	zip: string;
	color: string;
	faciltyTiming:FacilityTiming[];
	facility:Facility;
	is_checked:boolean;

}
export class Facility{
	constructor()
	{
		this.created_at=null;
		this.created_by=null;
		this.deleted_at=null;
		this.id=null;
		this.is_active=false;
		this.name=null;
		this.slug=null;
		this.updated_at=null;
		this.updated_by=null;
		this.qualifier = null;
	}
	created_at: string;
	created_by: number;
	deleted_at:  string;
	id: number;
	name:  string;
	is_active:boolean;
	slug:  string;
	updated_at: string;
	updated_by: number;
	qualifier: string;
}

export class FacilityTiming{
	constructor()
	{
		this.created_at=null
		this.created_by=null
		this.day_id=null
		this.deleted_at=null
		this.end_time=null
		this. end_time_isb=null
		this. facility_location_id=null
		this.id=null
		this.start_time=null
		this. start_time_isb=null
		this.time_zone=null
		this. time_zone_string=null
		this.updated_at=null
		this.updated_by=null
	}
	created_at: string;
    created_by: number;
    day_id: number;
    deleted_at:string;
    end_time:string;
    end_time_isb: string;
    facility_location_id:number;
    id: number;
    start_time: string;
    start_time_isb: string;
    time_zone: number;
    time_zone_string: string;
    updated_at: string;
    updated_by:number;
}
