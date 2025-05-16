export enum DenialUrlsEnum {
	Denial_list_GET = 'bill-response/master/denial-type',
	Denial_list_POST = 'bill-response/master/denial-type/add',
	Denial_list_PUT = 'bill-response/master/denial-type/edit',
	DENIAL_SINGLE_GET = "bill-response/master/denial-type/",

	Denial_list_DELETE = 'denial/destroy',
	Denial_list_DELETEMultiple = 'denial/destroyAll',
	// search for denial
	Denial_search_GET = 'denial/search',
}
