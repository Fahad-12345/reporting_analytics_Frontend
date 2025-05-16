export enum MriIntakeUrlsEnum {
	// mri use with surgeries
	Mri_surgeries_GET = 'TypeOfSurgeries',

	// Mri used with body Parts
	Mri_bodyParts_GET = 'BodyParts',

	// Mri used with visit session
	Mri_Visit_POST = 'VisitSessions/createVisitSessionKiosk',

	// Mri used wirth surgical details
	Mri_Surgical_PUT = 'SurgicalDetails',
	Mri_Surgical_POST = 'SurgicalDetails',
}
