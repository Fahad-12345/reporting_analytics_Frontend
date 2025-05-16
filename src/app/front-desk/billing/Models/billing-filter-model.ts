export class BillingFilterModel {
	denial_status_ids: any = [];
	eor_status_ids: any = [];
	verification_status_ids: any = [];
	payment_status_ids: any = [];
	bill_amount_from: number;
	bill_amount_to: number;
	bill_no: any = [];
	case_ids: any = [];
	doctor_ids: any = [];
	invoice_ids: any = [];
	bill_date: string;
	date_of_accident_from: string;
	date_of_accident_to: string;
	speciality_ids: any = [];
	insurance_ids: any = [];
	claim_no: number;
	attorney_ids: any = [];
	clearing_house_ids: any = [];
	bill_type_ids: any = [];
	ebill_status_ids: any = [];
	payer_ids: any = [];
	firm_ids:any = [];
	bill_amount: number;
	bill_status_ids: any = [];
	created_by_ids: any = [];
	updated_by_ids: any = [];
	patient_ids: any = [];
	patient_name: any = [];
	case_type_ids: any = [];
	facility_ids: any = [];
	bill_recipient_type_ids: any = [];
	bill_ids: any = [];
	recipients:any[] = [];
	employer_ids: any[] = [];
	tabs: string;
	eor_type_ids: any =[];
	description: string;
	posted_date_from: string;
	posted_date_to: string;
	eor_amount: string;
	denial_type_ids:any =[];
	comments: string;
	denial_date_from: string;
	denial_date_to: string;
	reason: string;
	action_type_ids:any=[];
	type_ids: any=[];
	check_date: string;
	by_ids:any=[];
	check_amount: string;
	invoice_patient_name: string;
	createdBy: string;
	verification_type_ids: any = [];
	verification_date_from: string;
	verification_date_to: string;
	sent_date: string;
	sent_posted_date: string;
	sent_description: string;
	appeal_status:string;
	patient_name_ids: any=[];
	per_page: number;
	pagination: number;
	page:number;
	offset: number;
	billable: any;
	report_upload_status: any;
	visit_status_ids: any[]=[];
	facility_location_ids: any[] = [];
	provider_ids: any[] =[];
	no_of_days: string;
	visit_date: string;
	doa:string; 
	appointment_type_ids: any[]=[];
	bill_date_range1: string;
	bill_date_range2: string;
	visit_date_range1: string;
	visit_date_range2: string;
	created_at : string;
	updated_at : string;
	name : string;
	no_of_days_to: any;
	no_of_days_from: any;
	column_name:any; 
	order:any;
	appeal_status_ids: any = [];
	constructor(values: object = {}) {

		this.setFiledValueOfTextOrDate(values['column'], 'column_name');
		this.setFiledValueOfTextOrDate(values['order'], 'order');

		this.setFieldValueOfMultipleSelection(values['speciality_ids'], 'speciality_ids');
		this.setFieldValueOfMultipleSelection(values['denial_status_ids'], 'denial_status_ids');
		this.setFieldValueOfMultipleSelection(values['eor_status_ids'], 'eor_status_ids');
		this.setFieldValueOfMultipleSelection(
			values['verification_status_ids'],
			'verification_status_ids',
		);

		this.setFieldValueOfMultipleSelection(values['payment_status_ids'], 'payment_status_ids');
		this.setFieldValueOfMultipleSelection(values['case_ids'], 'case_ids');
		this.setFieldValueOfMultipleSelection(values['doctor_ids'], 'doctor_ids');
		this.setFieldValueOfMultipleSelection(values['invoice_ids'], 'invoice_ids');
		this.setFieldValueOfMultipleSelection(values['insurance_ids'], 'insurance_ids');
		this.setFieldValueOfMultipleSelection(values['payer_ids'], 'payer_ids');
		this.setFieldValueOfMultipleSelection(values['clearing_house_ids'], 'clearing_house_ids');
		this.setFieldValueOfMultipleSelection(values['ebill_status_ids'], 'ebill_status_ids');
		this.setFieldValueOfMultipleSelection(values['bill_type_ids'], 'bill_type_ids');
		this.setFieldValueOfMultipleSelection(values['attorney_ids'], 'attorney_ids');
		this.setFieldValueOfMultipleSelection(values['firm_ids'], 'firm_ids');
		this.setFieldValueOfMultipleSelection(values['bill_status_ids'], 'bill_status_ids');
		this.setFieldValueOfMultipleSelection(values['created_by_ids'], 'created_by_ids');
		this.setFieldValueOfMultipleSelection(values['updated_by_ids'], 'updated_by_ids');
		this.setFieldValueOfMultipleSelection(values['patient_ids'], 'patient_ids');
		this.setFieldValueOfMultipleSelection(values['patient_name'], 'patient_name');
		this.setFieldValueOfMultipleSelection(values['case_type_ids'], 'case_type_ids');
		this.setFieldValueOfMultipleSelection(values['facility_ids'], 'facility_ids');
		this.setFieldValueOfMultipleSelection(
			values['bill_recipient_type_ids'],
			'bill_recipient_type_ids',
		);
		this.setFieldValueOfMultipleSelection(values['bill_ids'], 'bill_ids');
		this.setFieldValueOfMultipleSelection(values['eor_type_ids'], 'eor_type_ids');
		this.setFieldValueOfMultipleSelection(values['denial_type_ids'], 'denial_type_ids');
		this.setFieldValueOfMultipleSelection(values['action_type_ids'], 'action_type_ids');
		this.setFieldValueOfMultipleSelection(values['type_ids'], 'type_ids');
		this.setFieldValueOfMultipleSelection(values['by_ids'], 'by_ids');
		this.setFieldValueOfMultipleSelection(values['verification_type_ids'], 'verification_type_ids');
		this.setFieldValueOfMultipleSelection(values['patient_name_ids'], 'patient_name_ids');
		this.setFieldValueOfMultipleSelection(values['visit_status_ids'], 'visit_status_ids');
		this.setFieldValueOfMultipleSelection(values['facility_location_ids'], 'facility_location_ids');
		this.setFieldValueOfMultipleSelection(values['appointment_type_ids'], 'appointment_type_ids');
		this.setFieldValueOfMultipleSelection(values['provider_ids'], 'provider_ids');
		this.setFieldValueOfMultipleSelection(values['appeal_status_ids'], 'appeal_status_ids');

		
        this.setFiledValueOfTextOrDate(values['bill_amount_from'], 'bill_amount_from');
        this.setFiledValueOfTextOrDate(values['bill_amount_to'], 'bill_amount_to');
        this.setFiledValueOfTextOrDate(values['claim_no'], 'claim_no');
        this.setFiledValueOfTextOrDate(values['bill_amount'], 'bill_amount');
        this.setFiledValueOfTextOrDate(values['date_of_accident_from'], 'date_of_accident_from');
        this.setFiledValueOfTextOrDate(values['date_of_accident_to'], 'date_of_accident_to');
		this.setFiledValueOfArrayOfObject(values['recipients'],'recipients');
		this.setFieldValueOfMultipleSelection(values['employer_ids'], 'employer_ids');
		this.setFiledValueOfTextOrDate(values['bill_date'], 'bill_date');
		// this.setFiledValueOfTextOrDate(values['date_of_accident'], 'date_of_accident');
		this.setFiledValueOfTextOrDate(values['tabs'], 'tabs');
		this.setFiledValueOfTextOrDate(values['description'], 'description');
		this.setFiledValueOfTextOrDate(values['posted_date_from'], 'posted_date_from');
		this.setFiledValueOfTextOrDate(values['posted_date_to'], 'posted_date_to');
		this.setFiledValueOfTextOrDate(values['eor_date_from'], 'eor_date_from');
		this.setFiledValueOfTextOrDate(values['eor_date_to'], 'eor_date_to');
		this.setFiledValueOfTextOrDate(values['eor_amount'], 'eor_amount');
		this.setFiledValueOfTextOrDate(values['comments'], 'comments');
		this.setFiledValueOfTextOrDate(values['denial_date_from'], 'denial_date_from');
		this.setFiledValueOfTextOrDate(values['denial_date_to'], 'denial_date_to');
		this.setFiledValueOfTextOrDate(values['reason'], 'reason');
		this.setFiledValueOfTextOrDate(values['check_date'], 'check_date');
		this.setFiledValueOfTextOrDate(values['check_amount'], 'check_amount');
		this.setFiledValueOfTextOrDate(values['verification_date_from'], 'verification_date_from');
		this.setFiledValueOfTextOrDate(values['verification_date_to'], 'verification_date_to');
		this.setFiledValueOfTextOrDate(values['sent_date'], 'sent_date');
		this.setFiledValueOfTextOrDate(values['sent_posted_date'], 'sent_posted_date');
		this.setFiledValueOfTextOrDate(values['sent_description'], 'sent_description');
		this.setFiledValueOfTextOrDate(values['appeal_status'], 'appeal_status');
		this.setFiledValueOfTextOrDate(values['per_page'], 'per_page');
		this.setFiledValueOfTextOrDate(values['pagination'], 'pagination');
		this.setFiledValueOfTextOrDate(values['page'], 'page');
		this.setFiledValueOfTextOrDate(values['offset'], 'offset');
		this.setFiledValueOfTextOrDate(values['no_of_days'], 'no_of_days');
		this.setFiledValueOfTextOrDate(values['visit_date'], 'visit_date');
		this.setFiledValueOfTextOrDate(values['doa'], 'doa');
		this.setFiledValueOfTextOrDate(values['billable'], 'billable');
		this.setFiledValueOfTextOrDate(values['report_upload_status'], 'report_upload_status');
		this.setFiledValueOfTextOrDate(values['bill_date_range1'], 'bill_date_range1');
		this.setFiledValueOfTextOrDate(values['bill_date_range2'], 'bill_date_range2');
		this.setFiledValueOfTextOrDate(values['invoice_date_range1'], 'invoice_date_range1');
		this.setFiledValueOfTextOrDate(values['invoice_date_range2'], 'invoice_date_range2');
		this.setFiledValueOfTextOrDate(values['visit_date_range1'], 'visit_date_range1');
		this.setFiledValueOfTextOrDate(values['visit_date_range2'], 'visit_date_range2');
		this.setFiledValueOfTextOrDate(values['visit_date_range_1'], 'visit_date_range_1');
		this.setFiledValueOfTextOrDate(values['created_at'], 'created_at');
		this.setFiledValueOfTextOrDate(values['updated_at'], 'updated_at');
		this.setFiledValueOfTextOrDate(values['visit_date_range_2'], 'visit_date_range_2');
		this.setFiledValueOfTextOrDate(values['no_of_days_to'], 'no_of_days_to');
		this.setFiledValueOfTextOrDate(values['no_of_days_from'], 'no_of_days_from');
		this.setFiledValueOfTextOrDate(values['invoice_patient_name'], 'invoice_patient_name');
		this.setFiledValueOfTextOrDate(values['createdBy'], 'createdBy');
		this.setFiledValueOfTextOrDate(values['name'], 'name');
	}

	setFieldValueOfMultipleSelection(info: any, field: string) {
		if(info && typeof info === 'string'){ 
		const data = JSON.parse(info);
			this[field] = data;
        }
	}

    setFiledValueOfTextOrDate(data: any, field: string){
       if(data){
        this[field] = data;
       }
    }

	setFiledValueOfArray(data: any, field: string){
		if(data){
		 this[field] = [data];
		}
	 }

	setFiledValueOfArrayOfObject(data: any, field: string){
		if(data){
		 this[field] = JSON.parse(data);
		}
	 }
}
