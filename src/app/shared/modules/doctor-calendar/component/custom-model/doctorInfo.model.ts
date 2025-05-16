export class DoctorInfo
{
	// constructor();
	// constructor()
	// {
	// 	this.created_at=null;
	// 	this.created_by=null;
	// 	this.deleted_at=null;
	// 	this.facility_location_id=null;
	// 	this.id=id==0?id:null;
	// 	this.is_manual_specialty=null;
	// 	this.is_primary=null;
	// 	this.speciality_id=null;
	// 	this.updated_at=null;
	// 	this.updated_by=null;
	// 	this.user_id=null;
	// 	this.color=null;
	// 	this.is_checked=false;
	// 	this.doctor=null;
	// 	this.URI='http://icons.iconarchive.com/icons/icons8/ios7/256/Users-User-Male-icon.png'
		
	// };
	constructor(data?:any)
	{
		this.created_at=data&& data.created_at ?data.created_at:null;
		this.created_by=data&& data.created_by?data.created_by:null;
		this.deleted_at=data && data.deleted_at?data.deleted_at:null;
		this.facility_location_id=data && data.facility_location_id?data.facility_location_id:null;
		this.id=data && data.id>-1?data.id:null;;
		this.is_manual_specialty=data && data.is_manual_specialty?data.is_manual_specialty:null;;
		this.is_primary=data && data.is_primary?data.is_primary:null;
		this.speciality_id=data && data.speciality_id?data.speciality_id:null;
		this.updated_at=data && data.updated_at?data.updated_at:null;
		this.updated_by=data && data.updated_by?data.updated_by:null;
		this.user_id=data && data.user_id?data.user_id:null;
		this.color=data && data.color?data.color:null;
		this.is_checked=data && data.is_checked ?data.is_checked:false;
		this.doctor=data && data.doctor?data.doctor:null;
		this.facility_location=data && data.facility_location?data.facility_location:null;
		this.URI='assets/images/doctor-avater.png'
		
	};
	// constructor()
	// {
	// 	this.created_at=null;
	// 	this.created_by=null;
	// 	this.deleted_at=null;
	// 	this.facility_location_id=null;
	// 	this.id=id==0?id:null;
	// 	this.is_manual_specialty=null;
	// 	this.is_primary=null;
	// 	this.speciality_id=null;
	// 	this.updated_at=null;
	// 	this.updated_by=null;
	// 	this.user_id=null;
	// 	this.color=null;
	// 	this.is_checked=false;
	// 	this.doctor=null;
	// 	this.URI='http://icons.iconarchive.com/icons/icons8/ios7/256/Users-User-Male-icon.png'
		
	// }
	created_at: string;
    created_by: number;
    deleted_at: string;
    facility_location_id: number;;
	id: number
    is_manual_specialty: boolean;
    is_primary: boolean;
    speciality_id: number;
    updated_at: string;
    updated_by:number;
    user_id: number;
	color: string;
	is_checked:boolean;
	URI:string;
    doctor: {
            info:Info,
            specialities:Specialities ;
            user_timings:User_Timings []
                    
		};
	facility_location:any = {}

}

// export class Doctor{
// 	info:Info;
// 	specialities:Specialities
// 	user_timings:User_Timings;
// }
export  class Info
{
	constructor()
	{
		this.address=null
		this.apartment_suite=null
		this.area_id=null
		this.biography=null
		this.cell_no=null
		this.city=null
		this.created_at=null
		this.created_by=null
		this.date_of_birth=null
		this.deleted_at=null
		this.department_id=null
		this.designation_id=null
		this.emergency_phone=null
		this.employed_by_id=null
		this.employment_type_id=null
		this.extension=null
		this.fax=null
		this.file_id=null
		this.first_name=null
		this.from=null
		this.gender=null
		this.hiring_date=null
		this.id=null
		this.last_name=null
		this.middle_name=null
		this.profile_pic=null
		this.profile_pic_url=null
		this.social_security=null
		this.state=null
		this.title=null
		this.to=null
		this.updated_at=null
		this.updated_by=null
		this.user_id=null
		this.work_phone=null
		this.zip=null
	}
	address: string;
	apartment_suite: string;
	area_id: number;
	biography: string;
	cell_no: number;
	city: number;
	created_at: string;
	created_by: number;
	date_of_birth: string;
	deleted_at: string;
	department_id: number;
	designation_id: number;
	emergency_phone: number;
	employed_by_id: number;
	employment_type_id: number;
	extension: number;
	fax: number;
	file_id: number;
	first_name: string;
	from: string;
	gender: string;
	hiring_date: string;
	id: number;
	last_name: string;
	middle_name:string;
	profile_pic: string;
	profile_pic_url: string;
	social_security: string;
	state: string;
	title: string;
	to: string;
	updated_at: string;
	updated_by: number;
	user_id: number;
	work_phone: number;
	zip: number;
}

export  class Specialities
{
	constructor()
	{
	this.comments= null;
	this.created_at= null;
	this.created_by= null;
	this.default_name= null;
	this.deleted_at= null;
	this.description= null;
	this.has_app= null;
	this.id= null;
	this.is_available= null;
	this.is_create_appointment= null;
	this.is_defualt= null;
	this.name= null;
	this.over_booking= null;
	this.speciality_key= null;
	this.time_slot= null;
	this.updated_at= null;
	this.updated_by= null;
	this.qualifier = null;
	}
	comments: string;
	created_at: string;
	created_by: number;
	default_name: string;
	deleted_at:string;
	description: string;
	has_app: boolean;
	id: number;
	is_available: boolean;
	is_create_appointment: boolean;
	is_defualt: boolean
	name: string;
	over_booking: number;
	speciality_key: number
	time_slot: number
	updated_at: string;
	updated_by: number;
	qualifier: string;
}

export  class User_Timings
{
	constructor()
	{
		this.created_at=null;
		this.created_by=null;
		this.day_id=null;
		this.deleted_at=null;
		this.end_time =null;
		this.end_time_isb=null;
		this.facility_location_id=null;
		this.id=null;
		this.start_time=null;
		this.start_time_isb=null;
		this.time_zone=null;
		this.time_zone_string=null;
		this.updated_at=null;
		this.updated_by=null;
		this.user_id=null;
	}
	created_at: string;
	created_by:number;
	day_id:number;
	deleted_at: string;
	end_time : string;
	end_time_isb: string;
	facility_location_id:number;
	id:number;
	start_time: string;
	start_time_isb: string;
	time_zone:number;
	time_zone_string: string;
	updated_at: string;
	updated_by:number;
	user_id:number;
}
