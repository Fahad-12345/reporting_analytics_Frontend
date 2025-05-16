import { FormGroup } from "@angular/forms";

export class EorFilterMockValues {
	initializeSearchFormResp = {
		action_type_ids: null,
		appeal_status: null,
		appeal_status_ids: null,
		attorney_ids: null,
		bill_amount: null,
		bill_date_range1: null,
		bill_date_range2: null,
		bill_ids: null,
		bill_status_ids: null,
		by_ids: null,
		case_ids: null,
		case_type_ids: null,
		check_amount: null,
		check_date: null,
		claim_no: null,
		comments: null,
		created_by_ids: "",
		date_of_accident_from: null,
		date_of_accident_to: null,
		denial_date_from: null,
		denial_date_to: null,
		denial_status_ids: null,
		denial_type_ids: null,
		description: null,
		doctor_ids: null,
		eor_amount: null,
		eor_date_from: null,
		eor_date_to: null,
		eor_status_ids: null,
		eor_type_ids: null,
		facility_ids: null,
		insurance_ids: null,
		patient_ids: null,
		patient_name_ids: null,
		payment_status_ids: null,
		posted_date_from: null,
		posted_date_to: null,
		reason: null,
		sent_date: null,
		sent_description: null,
		sent_posted_date: null,
		speciality_ids: null,
		status_name: null,
		type_ids: null,
		updated_by_ids: null,
		verification_date_from: null,
		verification_date_to: null,
		verification_status_ids: null,
		verification_type_ids: null
	};
	selectedMultipleFilter = {
		speciality_ids: 1,
		job_status: 1,
		created_by_ids: 1,
		facility_ids: 1,
		bill_ids: 1,
		doctor_ids: 1,
		denial_type_ids:[54],
		action_type_ids:[65],
		type_ids:[32],
		verification_type_ids:[11],
		patient_name_ids:[84],
		attorney_ids: 1,
		insurance_ids: 1,
		payment_status_ids:5,
		bill_status_ids:91,
		denial_status_ids:70,
		eor_status_ids:44,
		eor_type_ids:32,
		updated_by_ids:70,
		patient_ids:89,
		facility_location_ids: 1,
		employer_ids: 1,
		bill_date_range1:'2021-07-25',
		bill_date_range2:'2021-07-25'
	};
	setSearchFormValues(searchForm: FormGroup) {
		debugger;
		searchForm.controls.speciality_ids.setValue([1]);
		// searchForm.controls.job_status.setValue([1]);
		searchForm.controls.created_by_ids.setValue([1]);
		searchForm.controls.facility_ids.setValue([1]);
		searchForm.controls.bill_ids.setValue([1]);
		searchForm.controls.doctor_ids.setValue([1]);
		searchForm.controls.attorney_ids.setValue([1]);
		searchForm.controls.insurance_ids.setValue([1]);
		searchForm.controls.bill_status_ids.setValue([1]);
		searchForm.controls.denial_type_ids.setValue([1]);
		searchForm.controls.action_type_ids.setValue([1]);
		searchForm.controls.type_ids.setValue([1]);
		searchForm.controls.by_ids.setValue([1]);
		searchForm.controls.verification_type_ids.setValue([1]);
		searchForm.controls.patient_name_ids.setValue([1]);
		searchForm.controls.attorney_ids.setValue([1]);
		searchForm.controls.insurance_ids.setValue([1]);
		searchForm.controls.payment_status_ids.setValue([1]);
		searchForm.controls.denial_status_ids.setValue([1]);
		searchForm.controls.eor_status_ids.setValue([1]);
		searchForm.controls.eor_type_ids.setValue([1]);
		searchForm.controls.updated_by_ids.setValue([1]);
		searchForm.controls.patient_ids.setValue([1]);
		return searchForm;
	};
	caseTypeList = {
		status: 200,
		result: {
			data: {
				type: 'Mock Type',
			},
		},
	};
	selectedMultipleFieldFiter = {
		speciality_ids: [1],
		job_status: 1,
		created_by_ids: [10],
		updated_by_ids: [10],
		facility_ids: [10],
		bill_ids: [10],
		doctor_ids: [10],
		insurance_ids: [10],
		attorney_ids: [10],
		denial_status_ids: [10],
		eor_status_ids: [10],
		verification_status_ids: [10],
		payment_status_ids: [10],
		patient_ids: [10],
	};
}
