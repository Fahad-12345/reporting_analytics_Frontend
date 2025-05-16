export enum PatientListingUrlsEnum {
	// below is KIOS api Path
	PatientLisitng_list_GET_Count = 'patients/count',
	PatientListing_list_GET = 'patients/all?',
	PatientListing_list_DELETE = 'patients/fd/remove-patient',

	// search url for patient listing
	PatientListing_search_GET = 'patients/fd/patient-listing',
	Patient_Get = "patient?",
	Patient_Allergies="patient/allergies",
	Patient_V1_Get = "patient/v1?",
	Patient_Delete = "patient/delete"
}
