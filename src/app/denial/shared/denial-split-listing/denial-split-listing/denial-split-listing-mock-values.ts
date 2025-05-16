import { FormGroup } from "@angular/forms";

export class DenialSplitListingMockValues {
	getDenialInfo = {
		status: true,
		result: {
			data: [
				{
					bill_amount: '1000.00',
					bill_date: '2021-04-08',
					bill_id: 133,
					bill_status_id: 1,
					bill_status_name: 'Billed',
					billing_title: '',
					case_id: 210,
					case_type_id: 2,
					case_type_name: 'NF',
					created_by: 1,
					created_by_first_name: 'Super',
					created_by_id: 1,
					created_by_last_name: 'Admin',
					created_by_middle_name: null,
					denial_status_id: 5,
					denial_status_name: 'Five',
					description: 'EOR Description testing 12345',
					doctor_id: 61,
					doctor_name: 'Mr medical pro',
					duration: 0,
					eor_amount: '100.00',
					eor_date: '2021-04-08',
					eor_id: 17,
					eor_status_id: 3,
				},
			],
			total: 20,
			last_page: 2,
		},
	};
	paramsObject = {
		bill_ids: [10],
		case_ids: [10],
		column: undefined,
		order: undefined,
		page: 0,
		pagination: 1,
		per_page: 10,
		tabs: 'denial'
	};
	getRecipatentNameWithBillRecipientTypeId_1_Resp = {
		recipient:{
			first_name:"first_Name_Mock_value",
			middle_name:"middle_name_Mock_value",
			last_name:"last_name_Mock_value",
		},
		bill_recipient_type_id:1
	}
	getRecipatentNameWithBillRecipientTypeId_3_Resp = {
		recipient:{
			insurance_name:"insurance_name_Mock_value"
		}
	}
	getRecipatentNameWithBillRecipientTypeId_2_Resp = {
		recipient:{
			employer_name:"employer_name_Mock_value",
		},
		bill_recipient_type_id:2
	}
}
