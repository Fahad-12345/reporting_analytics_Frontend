



export class BillReciptent {
	

	id: number; 
	insurance_id?: number; 
	first_name?:string;
	middle_name?:string;
	last_name?:string;
	employer_name?:string;
	insurance_name?:string;
	document_type_ids:any[] = [];
	type_ids?: any[];
	checked?:boolean = false;
	case_insurance_id?: number;
	case_employer_id?: number;
	document_type_with_object?: any[] =[];
	constructor(){
		this.document_type_ids=[];
	}


}
