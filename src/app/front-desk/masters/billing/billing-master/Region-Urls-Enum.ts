export enum RegionUrlsEnum {
	Region_list_GET = 'billing/region',
	Region_list_POST = 'billing/region/add',
	Region_list_PUT = 'billing/region/edit',
	REGION_SINGLE_GET = "billing/region/",
	Region_list_DELETE = 'region/destroy',
	Region_list_DELETEMultiple = 'region/destroyAll',

	// Region search below url
	Region_search_GET = 'region/search',

	// for dropdown used in facility
	Region_list_dropdown_GET = 'billing/region',
	// for state list dropdown
	State_list_GET='states_list',

	factilties_List_GET='facilities_locations',
	add_spi_POST='add_spi',
	get_spi_dea_POST='get_dea_record'
}
