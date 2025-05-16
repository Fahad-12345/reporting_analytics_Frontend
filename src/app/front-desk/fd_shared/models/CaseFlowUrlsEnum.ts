export enum CaseFlowUrlsEnum {
    CreateSession = "session",
    UpdateSession = "session/update",
	sessionMri = "session/mri",
	addEditMedication = "session/mri/intake-medication",
    GetRelations = "relations/get-all?page=1&per_page=10",
    GetCaseList = "case?",
    GetCaseDetail = "case/details",
	GetCaseDetailMedication = "case/details",
    GetMedicationRoute = "medicines",
    GetCasePractices = "case-practices/get-all?page=1&per_page=10&order=id",
    GetCaseType = "case-types/get-all?page=1&per_page=10&order=id",
    GetCaseMasters = "session/masters",
    GetCaseCategories = "categories/get-all?page=1&per_page=10&order=id&order_by=DESC",
    allFacilityLocationsAgainstPatientLocation = 'all_facility_locations_against_patient_location',
	allFacilityLocations = 'facilities_locations',
	allFacilityLocationsNames = 'facility_locations',
	getCommentsCategories="comment-categories",
	createComment="case/create-comments",
	caseGetComments="case/get-comments",
	updateComment = "case/update-comment" , 

	getSingleComment = "case/get-single-comment",
	CaseFlowReferralInfo = "case-referral"

	
	
}
