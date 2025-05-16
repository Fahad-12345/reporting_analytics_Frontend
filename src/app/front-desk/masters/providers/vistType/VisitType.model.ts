export class VisitType {
    id: number;
    name: string;
	qualifier:string;
    description: string;
	code_ids:CptCodes[];
	enable_cpt_codes:boolean;
	is_all_cpt_codes:boolean;
	is_editable:any;
	avoid_checkedin:boolean;
	is_reading_provider:boolean;
}
export class CptCodes{

	comments:string
	description:string;
	id:number;
	name:string;
	slug:string;
	code_id:number;
	created_at:string;
	created_by:number;
	deleted_at:number;
	updated_at:string;
	updated_by:number;
	visit_type_id:number;
}

