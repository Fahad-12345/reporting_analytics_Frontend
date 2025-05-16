export enum reportsUrlsEnum {
	reportsNf2_Excel_list_GET = 'export/nf2-report',
	TRANPORTATION_REPORT_LIST = 'node/reports/reports/transportations-v1',
	AppointmentStatus_REPORT_LIST = 'node/reports/reports/get-status-report-list-v1',
  
	TRANSPORTATION_REPORT_PDF = 'export/node/reports/reports/transportations-pdf-report',
	Summary_REPORT_PDF = 'node/reports/reports/export-summary-pdf',
	Status_REPORT_PDF = 'export/node/reports/reports/export-status-report-pdf',
  }
  export enum ArReportType {
	Detail = 1,
	Summary = 2,
  }
  export enum BillRecepientType {
	Patient = 1,
	Employer = 2,
	Insurance = 3,
	LawFirm = 4,
  }
  
  export enum DateRangeType {
	Last_month = 1,
	Last_Quarter = 2,
	Six_Months = 3,
	Three_Quarters = 4,
	Yearly = 5,
	Custom = 6,
  }
  export enum ReportType {
	Payment_Detail_Report = 1,
	Payment_Summary_Report = 2,
	Account_Receivable_Report = 3,
	Denial_Report = 4,
	Denial_Detail_Report = 5,
	Appointment_Status_Report = 6,
	Appointment_Summary_Report = 7,
  }
  export enum GroupByTypes {
	Practice_Location = '1',
	Speciality = '2',
	Provider = '3',
	Insurance = '6',
	Case_Type = '10',
	Denial_Reason = '11',
	Visit_Type = '14',
	Appointment_Status = '15',
	Practice = '16'
  }
  export enum SubgroupBy {
	None = 'none',
	SubgroupById = 'subgroup_by_id',
  }
  export enum groupBy {
	None = 'none',
	groupById = 'group_by_id',
  }
  export enum billRecTyp {
	None = 'none',
	bilRec = 'bill_recipient_name',
  }
  export enum ViewBy {
	None = 'none',
	ViewById = 'view_by_id',
  }
  
  export enum REPORT {
	Aggregate = 4,
  }
  
  export enum LeftMarginValues {
	Total = 2,
	Balance0To29Days = 13.4,
	Balance30To59Days = 24,
	Balance60To89Days = 34.8,
	Balance90To119Days = 45.5,
	Balance120To149Days = 56.6,
	Balance150To179Days = 67.2,
	Balance180PlusDays = 78.4,
	TotalDeniedAmount = 88.5,
  }
	export enum valuewithsubgroupBy {
	  Total = -1,
	  billed_amount = 21, 
	check_amount = 29,  
	write_off_amount = 35.5, 
	  Balance0To29Days = 42.6, 
	  Balance30To59Days = 50.5, 
	  Balance60To89Days = 58, 
	  Balance90To119Days = 65.0, 
	  Balance120To149Days = 71.9, 
	  Balance150PlusDays = 80.0,
	  TotalDeniedAmount = 88,
	}
	export enum valuewithgroupSubgroupByANDBilRec {
	  Total = -1,  
	  billed_amount = 25,  
	check_amount = 32,  
	write_off_amount = 39.5, 
	  Balance0To29Days = 45.6, 
	  Balance30To59Days = 52.5, 
	  Balance60To89Days = 59, 
	  Balance90To119Days = 65.5, 
	  Balance120To149Days = 72.5, 
	  Balance150PlusDays = 79.5,
	  TotalDeniedAmount = 87,
	}
	export enum ArSpacing {
	  resulttype = -1, 
	billed_amount = 15,  
	check_amount = 24, 
	write_off_amount = 31.5,
	  Balance0To29Days = 39.6, 
	  Balance30To59Days = 47, 
	  Balance60To89Days = 55, 
	  Balance90To119Days = 63.6, 
	  Balance120To149Days = 71.5, 
	  Balance150PlusDays = 79.5,
	  TotalDeniedAmount = 87.5,
	}
  
  export enum LeftMarginValuesWithSubgroup {
	Total = 2,
	Balance0To29Days = 22.5,
	Balance30To59Days = 32.5,
	Balance60To89Days = 41,
	Balance90To119Days = 50,
	Balance120To149Days = 60.5,
	Balance150To179Days = 69.7,
	Balance180PlusDays = 79.6,
	TotalDeniedAmount = 88.8,
  }
  
  export enum PayLeftMarginValues {
	GroupBy = 3.5,
	BilledAmount = 16.5,
	PaidAmount = 30.6,
	OutStandingAmount = 44.3,
	WriteOffAmount = 60,
	OverPayment = 73.5,
	InterestAmount = 88,
  }
  
  export enum PayLeftMarginValuesWSubGrp {
	GroupBy = 2.8,
	BilledAmount = 26.5,
	PaidAmount = 38.8,
	OutStandingAmount = 50.8,
	WriteOffAmount = 64.5,
	OverPayment = 76,
	InterestAmount = 88.5,
  }
  
  export enum ApptLeftMarginValuesWSubGrp {
	grandTotal = 3,
	VC = 37.3,
	SC = 54.0,
	NS = 70.1,
	Total = 86.2,
  }
  
  export enum ApptLeftMarginValues {
	grandTotal = 4.7,
	VC = 25.9,
	SC = 45.6,
	NS = 65.1,
	Total = 84.6,
  }
  
  export enum ApptLeftMarginValuesWViewByandSubgroup {
	grandTotal = 2.4,
	VC = 45.6,
	SC = 59.7,
	NS = 73.6,
	Total = 87.6,
  }
  
  export enum PayLeftMarginValuesWViewByandSubgroup {
	GroupBy = 2,
	BilledAmount = 33.6,
	PaidAmount = 44.5,
	OutStandingAmount = 55.5,
	WriteOffAmount = 67.5,
	OverPayment = 78.4,
	InterestAmount = 89,
  }
  
  export enum Aggregate {
	Count = 4
  }
  
  export enum ViewBySummary {
	Month = 1,
	Specilaity = 2,
	VisitType = 14,
	Offices = 25
  }
