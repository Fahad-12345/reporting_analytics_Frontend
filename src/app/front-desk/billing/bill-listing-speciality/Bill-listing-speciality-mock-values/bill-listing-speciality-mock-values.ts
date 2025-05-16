export class BillListingMockValues  {
	getSpecialityBillResp = {
		status:200,
		result:{
			data:[],
			total:100,
			last_page:10
		}
	}
	filteredObjectWithBillReceiptLengthGreaterZero = {
		bill_recipient_type_ids:[10],
		attorney_ids:[10],
		insurance_ids:[10],
		employer_ids:[10],
		patient_ids:[10],
		bill_ids:[10],
		case_type_ids:[10],
		case_ids:[10],
		created_by_ids:[10], 
		bill_date:'2021-17-25',
		facility_ids:1,
		bill_date_range1:'2021-17-25',
		bill_date_range2:'2021-17-27',
		
	}
	filteredObjectWithBillReceiptLengthZero = {
		bill_recipient_type_ids:[],
		attorney_ids:[10],
		insurance_ids:[10],
		employer_ids:[10],
		patient_ids:[10],
		bill_ids:[10],
		case_type_ids:[10],
		case_ids:[10],
		created_by_ids:[10], 
		bill_date:'2021-17-25',
		facility_ids:1,
		bill_date_range1:'2021-17-25',
		bill_date_range2:'2021-17-27',
		
	}
}
