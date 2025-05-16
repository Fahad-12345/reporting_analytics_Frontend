export enum InsuranceUrlsEnum {
	// Insurance ENUM
	Insurance_list_POST = 'insurances/create',
	Insurance_list_GET = 'insurances/get',
	insurance_bill_Get ='node/billing/insurances/get',

	Insurance_list_DELETE_ById = 'insurances/destroy',
	Insurance_list_DELETEMultiple = 'insurances/destroyAll',

	// below Url used for location creation and updating checked via network
	Insurance_list_PUT = 'insurances/update',

	// search for insurance
	Insurance_Search_GET = 'insurances/search',

	Get_Insurances = "insurances"
}
