import { BillingInsuranceModel } from "../../insurance-master/models/BillingInsurance.Model";


export class FeeScheduleModel {
	id: number;
	base_price: number;
	expected_reimbursement: number;
	code_id: string
	code_type_id: number
	description: string;
	plan_id: number
	units: number
	fee_type_id: number;
	region: number
	place_of_service_id: number
	type_of_service: number
	pick_list_category: number
	insurance_id: Array<{ insurance: { id: number }, from: Date, to: Date }> = [];
	employer_id: Array<number> = [];
	employer_start_date: Date
	employer_end_date: Date
	modifier: Array<{ modifier: { id: number }, position: number }> = [];
	speciality_ids: Array<number> = [];
	practice_ids: Array<{ practice: { id: number }, location: { id: number } }> = [];
	provider_ids: Array<number> = [];
	comments: string;
	case_type_ids: number;
	visit_type_ids: number
}
export class FeeScheduleFormModel {
	id: number;
	case_type_ids: number;
	visit_type_ids: number;
	code_id: string;
	code_type_id: number;
	description: string;
	base_price: number;
	expected_reimbursement: number;
	units: number;
	fee_type_id: number;
	modifier1: number;
	modifier2: number;
	modifier3: number;
	modifier4: number;
	practice_ids: Array<{ practice: { id: number }, location: { id: number } }> = [];
	provider_ids: Array<number> = [];
	speciality_ids: Array<any> = [];
	region: number;
	type_of_service: number;
	place_of_service_id: number;
	employer_id: Array<number> = [];
	employer_start_date: Date
	employer_end_date: Date
	insurances: Array<number> = [];
	insurance_from_date: Date;
	insurance_to_date: Date;
	plan_id: number;
	pick_list_category: number;
	comments: string;
}

export enum FeeType {
	oneTime = "One Time",
	invoice = "Invoice",
	rental = "Rental"
}
export enum CodeType {
	cpt = "CPT",
	hcpcs = "HCPCS",
	ndc = "NDC"
}

export interface FeeScheduleEmployer {
	employer: { id: number };
	from: Date;
	to: Date;
}
export interface FeeScheduleInsurance {
	insurance: BillingInsuranceModel;
	from: Date;
	to: Date;
}


