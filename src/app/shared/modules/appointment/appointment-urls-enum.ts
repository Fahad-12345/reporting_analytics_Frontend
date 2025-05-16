export enum AppointmentUrlsEnum {
    remove_patient_status = 'case-patient-session/remove-patient-status',
	getAppointmentList = '/appointments/getAppointmentList',
	getAppointmentList_new = '/appointments/get-appointment-list-v1',
	getAppointmentListV2 = "/appointments/get-appointment-list-v2",
	getAppointmentListV1 = "/appointments/get-appointment-list-v1",
	getAppointmentAllDetailsList = '/appointments/get-appointments',
    getAppointmentHistoryAgainstCase = '/appointments/getAppointmentHistoryAgainstCase',
	getDoctorAssigned = '/docAssigns/getDoctorAssigned',
	getDoctorAssignment="/available-doctors/get-doctor-assignments-v1",
	getAvailabilitiesOfAvailableDoctor='/available-doctors/get-availabilities',
    getFreeSlotsAndEntriesCount = '/waitingLists/getFreeSlotsAndEntriesCount',
    addToWaitingList = '/waitingLists/addToWaitingList',
    suggestAppointment = '/appointments/suggest', //updated

    //only checked in patients for waiting list
	getAppointmentListWL = 'case-patient-session/checked-in-patient',
	getAppointmentListByCase="/appointments/get-appointment-list-by-case",
	getAppointmentStatus = '/appointment-status/get-appointment-status',
	getAppointmentCount='/appointments/get-count', 
	getAppointmentDetails = "/appointments/get-appointment-by-id",
	gettasklists = "task-list",
	getListAppointmentsDetails = "/appointments/get-appointments-by-datelist-id",
	getAppointmentCptCodes = "/appointments/get-appointment-cpt-codes"
}
