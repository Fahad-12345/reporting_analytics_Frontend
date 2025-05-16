export enum AddToBeSchedulledUrlsEnum {
	GetAllStatus = 'case-patient-session-statuses',
	getAppointmentTypes = '/appointment-types/get-appointment-types',
	caseTypes = 'case-types/get-all',
	getDoctorsForUsers = '/users/getDoctorsForUsers',
	getproviderForUsers='/users/get-doctors-info',
	getAllToBeScheduledPatients = '/users/getAllToBeScheduledPatients',
	deleteToBeScheduledAppointment = '/toBeScheduledAppointments/deleteToBeScheduledAppointment',
	GetAptStatus = '/sch_appointment_statuses/getAppointmentStatus',
	GetVisitStatus = '/kiosk_case_patient_session_statuses/getVisitStatus',
	Get_providers = '/users/get-doctors-info',
	getAppointmentStatus="/appointment-status/get-appointment-status",
	deleteAppointment='/appointments',
	manuallyUpdateStatus = '/appointments/manually-update-status',
	//revamp API
	getReschuledList = "/appointments/get-all-pushed-appointment-to-front-desk-v1",
	get_master_provider="/master/doctors",
	getproviderForUsersWithoutSlash=""
}
