export enum ICDUrlsEnum {
	ICD_list_POST = 'codes/create',
	ICD_list_PATCH = 'codes/update',
	ICD_list_DELETE = 'codes/destroy',
	ICD_list_DELETEMultiple = 'codes/destroyAll',
	ICD_list_GET = 'billing/code',
	// get url is below one
	// codes/${pageNumber}/${pageSize}/ICD

	// Search FOr ICD Codes
	ICD_Search_GET = 'codes/search',
}
