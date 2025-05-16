export enum PatientFormUrlsEnum {
    Patient_Add_POST = 'session',
    Patient_Update_PATCH = 'session/update',
    PatientListing_list_GET = 'patients/all?',
    Patient_caselisting = 'patient/cases',
    Patient_Get = "patient?",
	Patient_Verificaiton_API = "session/verify-duplicate-patient", 
    Allergies_Severity_Status = 'session/masters',
    Allergy_GET = "erx/allergy",
    Reactions_GET = "erx/reaction",
    Pom_types="bill/pom_types",
}
