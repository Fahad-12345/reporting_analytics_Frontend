export  class FilterModelQuery {
	denial_status_ids: any = [];
	eor_status_ids: any = [];
	verification_status_ids: any = [];
	payment_status_ids: any = [];
	bill_amount_from: number;
	bill_amount_to: number;
	bill_no: any = [];
	case_ids: any = [];
	doctor_ids: any = [];
	bill_date_from: string;
	bill_date_to: string;
	bill_date_range1:string;
	bill_date_range2:string;
	visit_date_range_1:string;
	visit_date_range_2:string;
	date_of_accident: string;
	speciality_ids: any = [];
	insurance_ids: any = [];
	claim_no: number;
	attorney_ids: any = [];
	firm_ids: any = [] ;
	bill_amount: number;
	bill_status_ids: any = [];
	created_by_ids: any = [];
	updated_by_ids: any = [];
	patient_ids: any;
	patient_name: any = [];
	case_type_ids: any = [];
	facility_ids: any = [];
	bill_recipient_type_ids: any = [];
	bill_ids: any = [];
    created_at: string;
    updated_at: string;
    name: string;
    scan_upload_date: string;
    scan_upload_date_from: string;
    scan_upload_date_to: string;
	job_status: any[] =[];
	per_page: number;
	pagination: number;
	page: number;
	offset: number;
	recipients:any[] =[];
	type_id: number;
	facility_location_ids: any[] =[];
	employer_ids: any [] =[];
	pom_ids: any[] = [];
	packet_ids: any[] =[];
	type_ids:any[]=[]
	constructor(values: object = {}) {
	
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
		this.setFieldValueOfMultipleSelection(values['insurance_ids'], 'insurance_ids');
		this.setFieldValueOfMultipleSelection(values['attorney_ids'], 'attorney_ids');
		this.setFieldValueOfMultipleSelection(values['firm_ids'], 'firm_ids');
		this.setFieldValueOfMultipleSelection(values['bill_status_ids'], 'bill_status_ids');
		this.setFieldValueOfMultipleSelection(values['created_by_ids'], 'created_by_ids');
		this.setFieldValueOfMultipleSelection(values['updated_by_ids'], 'updated_by_ids');
		this.setFieldValueOfMultipleSelection(values['patient_name'], 'patient_name');

		this.setFieldValueOfMultipleSelection(values['case_type_ids'], 'case_type_ids');
		this.setFieldValueOfMultipleSelection(values['facility_ids'], 'facility_ids');
		this.setFieldValueOfMultipleSelection(values['facility_location_ids'], 'facility_location_ids');
		this.setFieldValueOfMultipleSelection(
			values['bill_recipient_type_ids'],
			'bill_recipient_type_ids',
		);
		this.setFieldValueOfMultipleSelection(values['bill_ids'], 'bill_ids');
		this.setFieldValueOfMultipleSelection(values['job_status'], 'job_status');

        this.setFiledValueOfTextOrDate(values['bill_amount_from'], 'bill_amount_from');
        this.setFiledValueOfTextOrDate(values['bill_amount_to'], 'bill_amount_to');
        this.setFiledValueOfTextOrDate(values['claim_no'], 'claim_no');
        this.setFiledValueOfTextOrDate(values['bill_amount'], 'bill_amount');
        this.setFiledValueOfTextOrDate(values['date_of_accident'], 'date_of_accident');
        this.setFiledValueOfTextOrDate(values['created_at'], 'created_at');
		this.setFiledValueOfTextOrDate(values['updated_at'], 'updated_at');
		this.setFiledValueOfTextOrDate(values['name'], 'name');
        this.setFiledValueOfTextOrDate(values['scan_upload_date'], 'scan_upload_date');
        this.setFiledValueOfTextOrDate(values['scan_upload_date_from'], 'scan_upload_date_from');
        this.setFiledValueOfTextOrDate(values['scan_upload_date_to'], 'scan_upload_date_to');
        this.setFiledValueOfTextOrDate(values['per_page'], 'per_page');
		this.setFiledValueOfTextOrDate(values['pagination'], 'pagination');
		this.setFiledValueOfTextOrDate(values['page'], 'page');
		this.setFiledValueOfTextOrDate(values['offset'], 'offset');
        this.setFiledValueOfTextOrDate(values['bill_date_from'], 'bill_date_from');
        this.setFiledValueOfTextOrDate(values['bill_date_to'], 'bill_date_to');
		this.setFiledValueOfTextOrDate(values['bill_date_range1'], 'bill_date_range1');
		this.setFiledValueOfTextOrDate(values['bill_date_range2'], 'bill_date_range2');
		this.setFiledValueOfTextOrDate(values['visit_date_range_1'], 'visit_date_range_1');
		this.setFiledValueOfTextOrDate(values['visit_date_range_2'], 'visit_date_range_2');
		this.setFiledValueOfTextOrDate(values['type_id'], 'type_id');
		this.setFiledValueOfArray(values['patient_ids'], 'patient_ids');
		this.setFiledValueOfArrayOfObject(values['recipients'],'recipients');

		this.setFieldValueOfMultipleSelection(values['employer_ids'], 'employer_ids');
		this.setFieldValueOfMultipleSelection(values['pom_ids'], 'pom_ids');
		this.setFieldValueOfMultipleSelection(values['packet_ids'], 'packet_ids');
		 this.setFieldValueOfMultipleSelection(values['type_ids'], 'type_ids');
		// this.setFiledValueOfArray(values['insurance_ids'], 'insurance_ids');
		// this.setFiledValueOfArray(values['attorney_ids'], 'attorney_ids');
	}

	  setFieldValueOfMultipleSelection(info: any, field: string) {
		if(info && typeof info === 'string'){ 
		const data = JSON.parse(info);
			this[field] = data;
        }
	}

    setFiledValueOfTextOrDate(data: any, field: any){
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
