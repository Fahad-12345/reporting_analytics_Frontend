export class NF2Info
{
attorney_id: number
case_id: number
created_at: string
created_by: number
date: string
deleted_at: string
generated_by_id: number;
is_nf2_generated: boolean;
id: number
updated_at: string
updated_by: number
user_id: number
user_name: string
envelope_providers:envelope_providers[];
status_id:number;
status: status;
userInfo: any;

}

export class envelope_providers
{
	location_id: number;
	id:number
}
export class status
{
	created_at: string
	created_by: number
	deleted_at: string
	id: number
	name: string
	slug: string
	updated_at: string
	updated_by: number
}
