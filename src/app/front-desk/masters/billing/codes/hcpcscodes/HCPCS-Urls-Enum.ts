export enum HCPCSUrlsEnum {
	HCPCS_list_GET = 'billing/code',
	HCPCS_list_POST = 'codes/create',
	HCPCS_list_PATCH = 'codes/update',
	HCPCS_list_DELETE = 'codes/destroy',
	HCPCS_list_DELETEMultiple = 'codes/destroyAll',

	// Search for HCPCS
	HCPCS_Search_GET = 'codes/search',
}
