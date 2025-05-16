import { DenialTypeComponent } from './../../../front-desk/masters/billing/billing-master/denial-type/denial-type.component';
export enum AssignDoctorUrlsEnum {
	automateDoctorAssignment = '/docAssigns/automateDoctorAssignment',
	automateDoctorAssignment_New = '/available-doctors/automate',
	automateDoctorAssignment_MultiSpecality = '/available-doctors/automate-v1',


	// deleteDoctorAssignment = '/docAssigns/deleteDoctorAssignment',
	deleteDoctorAssignment='/available-doctors?',
	preChecksForDoctorAssignmentUpdation = '/docAssigns/preChecksForDoctorAssignmentUpdation',
	  preChecksForDoctorAssignmentUpdation_new = '/available-doctors/pre-updation-check',
	// automaticResolveForDoctorAssignment = '/appointments/automaticResolveForDoctorAssignment',
	automaticResolveForDoctorAppointments="/appointments/resolve-doctor-appointments",
    // appointmentCancellationComments = '/appointment_cancellation_comments/getAppointmentCancellationComments',
	// createDoctorAssignment = '/docAssigns/createDoctorAssignment',
	appointmentCancellationComments='/appointment-cancellation-comments',
	createDoctorAssignment = '/available-doctors',
	updateDoctorAssignment = '/docAssigns/updateDoctorAssignment',
	updateDoctorAssigments = "/available-doctors",
	updateDoctorAssigments_v2 = "/available-specialities/update-doctor-assignment",
	createDoctorAssigmentV1 = "/available-specialities/v1",
	createDoctorAssigment_v1 = "/available-specialities/create-doctor-assignments"
}

export enum RecurrenceRepeatOptionEnum {
    daily = 1,
    Weekly = 2,
    Monthly = 3,
 
}


