export class ShareAbleFilter {
	speciality_ids: any[] = [];
	source: any[] = [];
	facility_ids: any[] = [];
	bill_ids: any[] = [];
	case_ids: any[] = [];
	patient_ids: any[] = [];
	pom_ids: any[] = [];
	packet_ids: any[] = [];
	case_type_ids: any[] = [];
	job_status: any[] = [];
	created_by_ids: any[] = [];
	created_at: any[] = [];
	updated_at: any[] = [];
	bill_recipient_type_ids: any[] = [];
	attorney_ids: any[] = [];
	firm_ids:any[] = [];
	doctor_ids: any[] = [];
	employer_ids: any[] = [];
	insurance_ids: any[] = [];
	patient_name: any[] = [];
	document_type_ids:any[] =[];
	primary_facility_id:any[]=[];
	facility_location_ids:any[]=[];
	report_upload_status:any[]=[];
	payer_ids:any[]=[];
	clearing_house_ids:any[]=[];
	ebill_status_ids:any[]=[];
	bill_type_ids:any[]=[];
	clinic_or_facility_id:any[]=[];
    constructor(values: object={}){
         this[values['label']] = values['formValue'];
         // Object.assign(this, values);
    }
}
