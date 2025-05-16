export class PaymentFormSplitMockValues {
	initializeForm = {
		id: null,
		check_date: '',
		action_type_id: '',
		check_no: '',
		check_amount: null,
		by_id: '',
		types: '',
		interest_amount: null,
		bill_amount: null,
		description: '',
		comments: '',
		file_name: '',
		status_id: '',
		over_amount: null,
	};
	getEorStatusResp = {
		status: 200,
		result: {
			data: [],
		},
	};
	addBillPaymentFP_Resp = {
		status: 200,
		data: {
			id: 120,
		},
	};
	eorTypeList = {
		status: 200,
		result: {
			data: [],
		},
	};
	addPaymentFormValid = {
		action_type_id: [
			{
				comments: null,
				created_by: 1,
				description: null,
				id: 1,
				name: 'Save',
				slug: 'save',
				updated_by: null,
			},
		],
		by_id: [
			{
				comments: null,
				created_by: 1,
				description: null,
				id: 2,
				name: 'Insurance',
				slug: 'insurance',
				updated_by: null,
			},
		],
		check_amount: '100.00',
		check_date: '02/01/2022',
		check_no: 'ABC1122',
		comments: '',
		description: 'Test',
		id: 109,
		interest_amount: 0,
		over_amount: undefined,
		status_id: [
			{
				comments: null,
				created_by: 1,
				description: null,
				id: 1,
				name: 'Partially Paid',
				slug: 'partially_paid',
				updated_by: null,
			},
		],
		types: [
			{
				comments: null,
				created_by: 1,
				description: null,
				id: 1,
				name: 'Bill',
				slug: 'bill',
			},
		],
		bill_amount: 0,
	};
	addPaymentFormValidWithoutID = {
		action_type_id: [
			{
				comments: null,
				created_by: 1,
				description: null,
				id: 1,
				name: 'Save',
				slug: 'save',
				updated_by: null,
			},
		],
		by_id: [
			{
				comments: null,
				created_by: 1,
				description: null,
				id: 2,
				name: 'Insurance',
				slug: 'insurance',
				updated_by: null,
			},
		],
		check_amount: '100.00',
		check_date: '04/01/2021',
		check_no: 'ABC1122',
		comments: '',
		description: 'Test',
		interest_amount: 0,
		over_amount: undefined,
		status_id: [
			{
				comments: null,
				created_by: 1,
				description: null,
				id: 1,
				name: 'Partially Paid',
				slug: 'partially_paid',
				updated_by: null,
			},
		],
		types: [
			{
				comments: null,
				created_by: 1,
				description: null,
				id: 1,
				name: 'Bill',
				slug: 'bill',
			},
		],
		bill_amount: 0,
	};
	getSignalPaymentIdResp = {
		status: true,
		result: {
			data: {},
		},
	};
}
