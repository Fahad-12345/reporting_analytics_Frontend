export class BillistingFilterMockValues {
	searchFormEmptyResp = {
		attorney_ids: null,
		bill_amount: null,
		bill_amount_from: null,
		bill_amount_to: null,
		bill_date_range1: null,
		bill_date_range2: null,
		bill_ids: null,
		bill_recipient_type_ids: null,
		bill_status_ids: null,
		case_ids: null,
		case_type_ids: null,
		claim_no: null,
		created_by_ids: null,
		date_of_accident: null,
		denial_status_ids: null,
		doctor_ids: null,
		eor_status_ids: null,
		facility_ids: null,
		insurance_ids: null,
		patient_ids: null,
		patient_name: null,
		payment_status_ids: null,
		provider_ids: null,
		speciality_ids: null,
		updated_by_ids: null,
		verification_status_ids: null,
	};
	basicResp = {
		result: {
			data: [],
		},
	};
	getCaseTypeList = {
		status: 200,
		result: {
			data: {
				type: [],
			},
		},
	};
	getCaseTypeListWithFalseStatus = {
		status: false,
		result: {
			data: {
				type: [],
			},
		},
	};
	searchFormSetMockValues = {
		attorney_ids: [10],
		bill_amount: null,
		bill_amount_from: null,
		bill_amount_to: null,
		bill_date_range1: null,
		bill_date_range2: null,
		bill_ids: [10],
		bill_recipient_type_ids: [10],
		bill_status_ids: [10],
		case_ids: [10],
		case_type_ids: [10],
		claim_no: [10],
		created_by_ids: [10],
		date_of_accident: [10],
		denial_status_ids: [10],
		doctor_ids: [10],
		eor_status_ids: [10],
		facility_ids: [10],
		insurance_ids: [10],
		patient_ids: [10],
		patient_name: [10],
		payment_status_ids: [10],
		provider_ids: [10],
		speciality_ids: [10],
		updated_by_ids: [10],
		verification_status_ids: [10],
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
	filterRespGivenMockValue = {
		bill_date_range1:'2021-09-14',
		bill_date_range2:'2021-09-14',
		scan_upload_date:'2021-09-14',
		pom_date:'2021-09-14',
		created_at:'2021-09-14'
	}
}
