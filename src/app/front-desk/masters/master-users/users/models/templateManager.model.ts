export class UserTemplateSpecialityModel{

	id: number;
	name: string;
	description: string;
	time_slot: number;
	over_booking: number;
	has_app: boolean;
	speciality_key: string;
	comments: string;
	default_name: string;
	is_defualt: number;
	is_available: boolean;
	is_create_appointment: boolean;
	created_by: number;
	updated_by: number;
	created_at: string;
	updated_at: string;
	deleted_at: string;
	visit_types: VisitTypesModel[];

}
export class VisitTypesModel{
	 id: number;
    name: string;
    slug: string;
    description: string;
    created_by: number;
	updated_by: number;
	is_open: boolean=false;
	user_template:UserTemplate
}

export class UserTemplate{
	template_id:number;
	template_name:string;
	case_types:CaseType[];
}
export class CaseType{
	id:number;
	name:string
}

export class TemplateFormModel{
	user_id:number;
	facility_location_id:number;
	speciality_id: number;
	visit_type_id:number;
	visit_type:string;
	template_id:number;
	case_type_ids:number[];

}
// export class TemplateManagerModel {

//     id:number;
//     name:string;
// 	is_open:false;
// 	_specialities:CaseTemplateModel[];

// }


