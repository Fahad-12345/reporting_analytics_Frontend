export enum FirmUrlsEnum {
	// new APi
	firm_single_ByID_GET = 'single_firm?&id=',

	// new API's of firm 
	AllFirms_list_GET = 'all_firms',
	Firm_list_PUT = 'edit_firm',


	// new FIrm locations Api
	Location_list_ByFIrmId_GET = 'get_firm_locations_by_firmId',


	// old APi's fo firm
	Firm_list_GET = 'all_firms_with_locations',
	Firm_list_DELETE = 'delete_firms',
	Firm_list_POST = 'add_firm',
	// Firm_list_PUT = 'edit_firm',

	// For Location that is attached with firm
	Location_list_PUT = 'edit_firm_location_byId',
	Location_list_POST = 'add_firm_location_by_firmId',
	Location_list_DELETE = 'delete_firm_locations_byIds',

	// search filterfor firm
	Firm_Search_GET = 'search_firm',
}
