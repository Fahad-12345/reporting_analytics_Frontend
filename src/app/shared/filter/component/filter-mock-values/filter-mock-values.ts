import { FormGroup, NgForm } from '@angular/forms';

export class FilterMockValues {
	EmptyFormInitValues = {
		attorney_ids: null,
		bill_date: null,
		bill_date_range1: null,
		bill_date_range2: null,
		bill_ids: null,
		bill_recipient_type_ids: null,
		bill_status_ids: null,
		case_ids: null,
		case_type_ids: null,
		created_at: null,
		created_by_ids: null,
		doctor_ids: null,
		employer_ids: null,
		facility_ids: null,
		facility_location_ids: null,
		insurance_ids: null,
		job_status: null,
		packet_ids: null,
		patient_ids: null,
		pom_date: null,
		pom_ids: null,
		scan_upload_date: null,
		speciality_ids: null,
	};
	selectedMultipleFilter = {
		speciality_ids: 1,
		job_status: 1,
		created_by_ids: 1,
		facility_ids: 1,
		bill_ids: 1,
		case_ids: 1,
		doctor_ids: 1,
		facility_location_ids: 1,
		employer_ids: 1,
		attorney_ids: 1,
		insurance_ids: 1,
		bill_status_ids: 1,
	};
	caseTypeList = {
		status: 200,
		result: {
			data: {
				type: 'Mock Type',
			},
		},
	};
	searchPatientName = {
		status: true,
		result: {
			data: [
				{
					first_name: 'first_name',
					middle_name: 'middle_name',
					last_name: 'last_name',
				},
			],
		},
	};
	searchAttorney = {
		result: {
			data: [
				{
					id: 10,
					first_name: 'first_name',
					middle_name: 'middle_name',
					last_name: 'last_name',
				},
			],
		},
	};
	getSpeciality = {
		result: {
			data: [
				{
					first_name: 'first_name',
					middle_name: 'middle_name',
					last_name: 'last_name',
				},
			],
			last_page: 2,
		},
	};
	generalResp = {
		status: 200,
		result: {
			data: [],
		},
	};
	getChangeForSingalSelection = {
		id: 10,
		name: 'name',
		full_Name: 'full_Name',
		facility_full_name: 'facility_full_name',
		label_id: 11,
		insurance_name: 'insurance_name',
		employer_name: 'employer_name',
	};
	valueAssignGivenParams = {
		speciality_ids: [1],
		job_status: [11],
		created_by_ids: [10],
		facility_ids: [2, 3],
		bill_ids: [12],
		case_ids: [10],
		doctor_ids: [8],
		bill_status_ids: [20],
		facility_location_ids: [2, 4],
		patient_ids: [10],
		employer_ids: [12],
		insurance_ids: [10],
		attorney_ids: [21],
	};
	setSearchFormValues(searchForm: FormGroup) {
		searchForm.controls.speciality_ids.setValue([1]);
		searchForm.controls.job_status.setValue([1]);
		searchForm.controls.created_by_ids.setValue([1]);
		searchForm.controls.facility_ids.setValue([1]);
		searchForm.controls.bill_ids.setValue([1]);
		searchForm.controls.case_ids.setValue([1]);
		searchForm.controls.doctor_ids.setValue([1]);
		searchForm.controls.facility_location_ids.setValue([1]);
		searchForm.controls.employer_ids.setValue([1]);
		searchForm.controls.attorney_ids.setValue([1]);
		searchForm.controls.insurance_ids.setValue([1]);
		searchForm.controls.bill_status_ids.setValue([1]);
		return searchForm;
	}
}
