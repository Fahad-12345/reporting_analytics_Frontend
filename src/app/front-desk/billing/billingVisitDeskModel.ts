export interface VisitDeskModel {
	id: number
	doctor_id: number
	icd_codes: [number]
	cpt_codes: [number]
	speciality_id: number
	appointment_type_id: number
	practices: number
	case_types: string
	insurance: number
	claim_no: number
	no_of_days: number
	visit_session_state_id: number
	visit_date_format: string
}
export interface CreateBillModel {
	id: number
	case_id: number
	patient_id: number
	doctor_id: number
	appointment_id: number
	speciality_id: number
	facility_location_id: number
	appointment_type_id: number
	attorney_firm:any
	visit_date: string
	visit_session_state_id: number
	icd_codes_comment: null
	cpt_codes_comment: null
	visit_date_format: string
	no_of_days: number
	kiosk_case: KiosModel
	visit_type: any
	facility_location: {}
	speciality: {}
	appointment_type: {}
	visit_session_state: any
	icd_codes: Array<any>
	cpt_codes: Array<any>
	bill_date: string
	doctor: {}
	cpt_fee_schedules: CPTFeeSchedule[]
	template_type:string
	specialityVisitType:{}
}
export interface KiosModel {
	id: number
	key: null
	patient_id: number
	case_type_id: number
	category_id: number
	purpose_of_visit_id: number
	practice_id: null
	is_finalize: null
	status: string
	case_types: any
	patient: any
	accident_information: any
	case_categories: any
	purpose_of_visit: any
	case_attorneys: any
	primary_insurance: any
	case_insurance: any
	case_employers: any
}
export interface FeeScheduleCalculatedData {
	id: number
	cpt_codes: FeeScheduleCptCodes[]
}


export interface FeeScheduleCptCodes {
	id: number
	fee_schedules: FeeScedule[]
}
export interface FeeScedule {
	id: number
	base_price: number
	expected_reimbursement: number
	units: number
	per_unit_price: number
	code_id: number
	cpt_code: any
	modifiers:any[];
	total_charges:number;
	fee_schedule_id:number
}
export interface CPTFeeSchedule {
	cpt_code:number;
	base_price:number;
	units:number;
	modifiers:any[];
	total_charges:number;
	fee_schedule_id:number
					// let obj = { 'cpt_code': element, 'base_price': 0, 'units': 0, 'modifiers': [], 'total_charges': 0, 'fee_schedule_id': null }
}

