export const rows = [
	{
		status: 'asdasdasd',
		atttorny: 'asdasdsad',
		caseNo: 'Austin',
		caseType: 'Male',
		patient_Name: 'Swimlane',
		doa: 'asdasad',
		insurance: 'insurance',
		claim: 'asdasd',
		policy: 'asdasd',
		nod: 'asdasd',
	},
	{
		status: 'asdasdasd',
		atttorny: 'asdasdsad',
		caseNo: 'Austin',
		caseType: 'Male',
		patient_Name: 'Swimlane',
		doa: 'asdasad',
		insurance: 'insurance',
		claim: 'asdasd',
		policy: 'asdasd',
		nod: 'asdasd',
	},
	{
		status: 'asdasdasd',
		atttorny: 'asdasdsad',
		caseNo: 'Austin',
		caseType: 'Male',
		patient_Name: 'Swimlane',
		doa: 'asdasad',
		insurance: 'insurance',
		claim: 'asdasd',
		policy: 'asdasd',
		nod: 'asdasd',
	},
	{
		status: 'asdasdasd',
		atttorny: 'asdasdsad',
		caseNo: 'Austin',
		caseType: 'Male',
		patient_Name: 'Swimlane',
		doa: 'asdasad',
		insurance: 'insurance',
		claim: 'asdasd',
		policy: 'asdasd',
		nod: 'asdasd',
	},
];

export const filterConfig = [
	'caseNo',
	'caseType',
	'patientName',
	'dateOfAccidentFrom',
	'dateOfAccidentTo',
	'address',
	'insuranceName',
	'Claim#',
	'policy#',
	'attornyName',
	'noOfDays',
	'status',
	'days_from',
	'days_to',
	'createdBy',
	'updatedBy',
	'createdAt',
	'updatedAt'

];
export const filterArReportsConfig = [
	'caseType',
	'patientName',
	'address',
	'insuranceName',
	'attornyName',
	'dateRange',
	'providerName',
	'speciality',
	'billRecipientType'
];
export const NF2_LIST_REPORTS = `case/nf2-list`;

export const reportsListColumn = [
	{
		field: 'id',
		header: 'caseNo',
		type: 'string',
		sortHead: true,
		searchable: false,
		hasTemplate: false,
		canAutoResize: false,
		draggable: false,
		resizeable: false,
	},
	{
		field: 'case_type',
		header: 'Case Type',
		type: 'string',

		sortHead: true,
		searchable: false,
		hasTemplate: true,

		canAutoResize: false,
		draggable: false,
		resizeable: false,
	},
	{
		field: 'patientName',
		header: 'Patient Name',
		type: 'string',
		//	objectRequiredValues: 'patient_lastname, patient_middlename',
		//	link: '/patients/view/:',
		//	linkKey: 'id',
		sortHead: false,
		searchable: false,
		hasTemplate: true,
		canAutoResize: false,
		draggable: false,
		resizeable: false,
	},
	{
		field: 'date_of_accident',
		header: 'DOA',
		type: 'string',
		sortHead: true,
		searchable: false,
		hasTemplate: false,
		canAutoResize: false,
		draggable: false,
		resizeable: false,
	},
	{
		field: 'insuranceNameAndAddress',
		header: 'Insurance Name & Address',
		type: 'string',
		sortHead: true,
		searchable: false,
		hasTemplate: false,
		canAutoResize: false,
		draggable: false,
		resizeable: false,
	},
	{
		field: 'claim_no',
		header: 'Claim#',
		type: 'string',
		sortHead: true,
		searchable: false,
		hasTemplate: false,
		canAutoResize: false,
		draggable: false,
		resizeable: false,
	},
	{
		field: 'policy_no',
		header: 'policy#',
		type: 'string',
		sortHead: true,
		searchable: false,
		hasTemplate: false,
		canAutoResize: false,
		draggable: false,
		resizeable: false,
	},
	{
		field: 'no_of_days',
		header: 'No.of days#',
		type: 'string',
		sortHead: true,
		searchable: false,
		hasTemplate: false,
		canAutoResize: false,
		draggable: false,
		resizeable: false,
	},
	{
		field: 'attorney_firstname',
		header: 'Atttorny',
		type: 'string',
		sortHead: true,
		searchable: false,
		hasTemplate: false,
		canAutoResize: false,
		draggable: false,
		resizeable: false,
	},
	{
		field: 'status',
		header: 'Status',
		type: 'string',
		sortHead: true,
		searchable: false,
		hasTemplate: false,
		canAutoResize: false,
		draggable: false,
		resizeable: false,
	},
];

export const GroupByList:any[] = [{id:1,name:'Practice Location'},{id:16,name:'Practice'},{id:2,name:'Specialty'},
{id:3,name:'Provider'},{id:4,name:'Patient'},{id:12,name:'Law Firm'},
{id:6,name:'Insurance'},{id:7,name:'Attorney'},{id:13,name:'Employer'},
// {id:8,name:'Bill Status'},
// {id:9,name:'Payment Status'},
{id:10,name:'Case Type'},{id:11,name:'Denial Reason'}];


export const SubGroupByList:any[] = [{id:3,name:'Provider'},{id:4,name:'Patient'}];
 export const ARsubgroupbyList :any[] = [{id:1,name:'Practice Location'},{id:2,name:'Specialty'},
 {id:3,name:'Provider'},{id:10,name:'Case Type'},{id:5,name:'Bill Recipient Type'}]

 export const appointmentGroupByList : any[] = [{id: 1, name: 'Practice Location'}, {id:2, name: 'Specialty'}, {id:14, name: 'Visit Type'}, {id: 3, name: 'Provider'}, {id : 25, name: 'Offices'}];
 export const appointmentSubGroupByList : any[] = [ {id:2, name: 'Specialty'}, {id:14, name: 'Visit Type'}];

// ,{id:11,name:'Denial_Reason'
export const DateTypes:any[] = [{id:1,name:'DOS'},{id:2,name:'Billed Date'},{id:3,name:'Check Date'},{id:4,name:'Posted Date'}];
export const AggregateFunctions:any[] = [{id:1,name:'Sum'},{id:2,name:'Average'},
{id:4,name:'Count'},{id:6,name:'Maximum'},{id:7,name:'Minimum'}];
// {id:3,name:'Standard Deviation'},
export const RecipientList:any[] = [{id:1,name:'Patient'},{id:2,name:'Employer'},{id:3,name:'Insurance'},{id:4,name:'LawFirm'},{id:5,name:'Other'}];
export const paymentRecipientList:any [] = [{id:1,name:'Patient'},{id:2,name:'Insurance'},{id:3,name:'LawFirm'},{id:4,name:'Employer'},{ id:5, name: 'Other'}];
export const ViewByList:any[] = [{id:1,name:'Monthly'},{id:2,name:'Quarterly'},{id:3,name:'Yearly'}];
export const ViewByListForApptSummaryReport: any[] = [ {id: 2, name: 'Specialty'}, {id: 14,name: 'Visit Type'}];
export const DateRangeTypeList:any[] = [{id:1,name:'Last month'},{id:2,name:'Last Quarter'},{id:3,name:'6 Months'},{id:4,name:'Three- Quarters'},{id:5,name:'Yearly'},{id:6,name:'Custom'}];
export const ReferalType:any[] = [{id:'in_house',name:'In House'}, {id:'is_referral',name:'Outside Referral'},];
export function DownloadReport(reportData:any,reportName:string){
	const a = document.createElement("a");
	a.href = "data:text/csv," + reportData;
	let filename = reportName;
	a.setAttribute("download", filename + ".csv");
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}
export function convertToNumber(param, key) {
	if (param[key]) {
	  param[key] = Number(param[key]);
	}
  }
