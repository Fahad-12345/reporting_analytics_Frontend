import { USERPERMISSIONS } from "@appDir/front-desk/UserPermissions";

export const customizeTabs = [
	{
		id: 1,
		name: 'Practice-Location ',
		isSelected: false,
		link: 'scheduler-front-desk/customize/location',
		class: '',
		permission:USERPERMISSIONS.customize_facility_menu
	},
	{
		id: 2,
		name: 'Specialty',
		isSelected: false,
		link: 'scheduler-front-desk/customize/specialty',
		class: '',
		permission: USERPERMISSIONS.customize_speciality_menu
	},
	{
		id: 3,
		name: 'Preferences',
		isSelected: false,
		link: 'scheduler-front-desk/customize/preferences',
		class: '',
		permission:USERPERMISSIONS.customize_preference_menu
	},
];

export const locationListColumn = [
	{
		field: 'name',
		header: 'Name',
		type: 'string',
		sortHead: true,
		searchable: false,
		hasTemplate: false,
		canAutoResize: false,
		draggable: false,
		resizeable: false,
	},
	{
		field: 'address',
		header: 'Address',
		type: 'string',
		sortHead: true,
		searchable: false,
		hasTemplate: false,
		canAutoResize: false,
		draggable: false,
		resizeable: false,
	},
	{
		field: 'color',
		header: 'Color',
		type: 'color',
		sortHead: true,
		searchable: false,
		hasTemplate: false,
		canAutoResize: false,
		draggable: false,
		resizeable: false,
	},
];

export const filterConfig = ['speciality', 'timeslot', 'overbooking'];

export const locationFilterConfig = ['selectLocation', 'address'];
