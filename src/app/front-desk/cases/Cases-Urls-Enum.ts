export enum CasesUrlsEnum {
	Cases_Filtered_GET = 'patients/fd/searchCases-v3',

	Cases_list_DELETE = 'cases/fd/remove-cases',
	Cases_list_GET = 'Cases/caseDetail?caseId=',

	// Case Search
	Cases_Search_GET = 'patients/fd/searchCases',
	CaseStatusUpdate = 'case/status',
	CaseExportExcel = "export/caselist-report",
	CaseDeleteURL ="case/by-ids", 
	CaseBulkComment = "case/bulk-create-comment",
	
}
