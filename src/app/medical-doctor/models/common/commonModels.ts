import { Validators } from '@angular/forms';
import { getObjectChildValue } from '@appDir/shared/utils/utils.helpers';
import {
	CurrentComplaint,
	PhysicalExamination1,
	DiagnosticImpression,
	PhysicalExamination2,
	TreatmentRendered,
} from '../initialEvaluation/initialEvaluationModels';

// *****************************************************************************
// ********************************** Accident *********************************
// *****************************************************************************

export class Accident {
	public id: number;
	public accidentDate: Date;

	constructor(accident) {
		this.id = accident.id ? accident.id : null;
		this.accidentDate = accident.accidentDate ? accident.accidentDate : null;
	}
}
// *****************************************************************************
// ************************************ Case ***********************************
// *****************************************************************************

export class Case {
	public id: number;
	public accidentId: number;
	public accident: Accident;
	public caseType: string;
	public caseTypeSlug:string

	constructor(Case) {
		this.id = Case.id ? Case.id : null;
		this.accidentId = Case.accidentId ? Case.accidentId : null;
		this.accident = Case.accident ? Case.accident : null;
		this.caseType = Case.caseType ? Case.caseType : null;
		this.caseTypeSlug=Case.caseTypeSlug?Case.caseTypeSlug:null
	}
}
// *****************************************************************************
// ******************************** Appointment ********************************
// *****************************************************************************

export class Appointment {
	public id: number;
	public start: string; //Appointment start date and time
	public end: string; //Appointment end date and time
	public title: string;
	public chartNo: string;
	public status: string;
	public checkInTime: string;
	public speciality: string;
	
	public dateOfAccident: string;
	public caseId: string;
	public case_type_slug:string;
	public patientId: string;
	public doctorId: string;
	public visitType: string;
	public visitId: number;
	public isComplete: Boolean;
	public doctor: Doctor;
	public patient: Patient;
	public case: Case;
	public session: MedicalSession;
	public previousAppointmentDate: string;
	public oldVisitSessionId: number;
	public speciality_id: number;
	public location_id: number;
	public location_name: string;
	doctor_signature_id: number;
	patient_signature_id: number;
	template_id: number;
	provider_id: number;
	template_type: number;
	technician_id: number;
	appointment_type_id: number;
	reading_provider_id:number;
	cd_image:any;
	appointment_visit_state_id: any;
	constructor(appointment) {
		this.id = appointment.id ? appointment.id : null;
		this.start = appointment.start ? appointment.start : null;
		this.end = appointment.end ? appointment.end : null;
		this.title = appointment.title ? appointment.title : null;
		this.chartNo = appointment.chartNo ? appointment.chartNo : null;
		this.status = appointment.status ? appointment.status : null;
		this.speciality = appointment.speciality ? appointment.speciality : null;
		this.speciality_id=appointment.speciality_id ? appointment.speciality_id:null
		this.caseId = appointment.caseId ? appointment.caseId : null;
		this.case_type_slug=appointment.case_type_slug?appointment.case_type_slug:null
		this.patientId = appointment.patientId ? appointment.patientId : null;
		this.doctorId = appointment.doctorId ? appointment.doctorId : null;
		this.visitType = appointment.visitType ? appointment.visitType : null;
		this.visitId = appointment.visitId ? appointment.visitId : null;
		this.isComplete = appointment.isComplete ? appointment.isComplete : false;
		this.doctor = appointment.doctor ? appointment.doctor : null;
		this.patient = appointment.patient ? appointment.patient : null;
		this.case = appointment.case ? appointment.case : null;
		this.session = appointment.session ? appointment.session : null;
		this.previousAppointmentDate = appointment.previousAppointmentDate
			? appointment.previousAppointmentDate
			: null;
		this.checkInTime = appointment.checkInTime ? appointment.checkInTime : null;
		this.oldVisitSessionId = appointment.oldVisitSessionId ? appointment.oldVisitSessionId : null;
		// this.speciality_id = appointment.specId;
		this.location_id = appointment.clinicId;
		this.location_name = appointment.clinicName;
		this.reading_provider_id=appointment.reading_provider_id;
		this.cd_image=appointment.cd_image;
	}
}
// *****************************************************************************
// *********************************** Doctor **********************************
// *****************************************************************************

export class Doctor {
	public id: number;
	public firstName: string;
	public middleName: string;
	public lastName: string;
	public gender: string;

	constructor(doctor) {
		this.id = doctor.id ? doctor.id : null;
		this.firstName = doctor.firstName ? doctor.firstName : null;
		this.middleName = doctor.middleName ? doctor.middleName : null;
		this.lastName = doctor.lastName ? doctor.lastName : null;
		this.gender = doctor.gender ? doctor.gender : null;
	}
}
// *****************************************************************************
// ********************************** Insurance ********************************
// *****************************************************************************

export class Insurance {
	public id: number;
	public patientId: number;
	public companyName: number;

	constructor(insurance) {
		this.id = insurance.id ? insurance.id : null;
		this.patientId = insurance.patientId ? insurance.patientId : null;
		this.companyName = insurance.companyName ? insurance.companyName : null;
	}
}

// *****************************************************************************
// ********************************** Patient **********************************
// *****************************************************************************

export class Patient {
	public id: number;
	public firstName: string;
	public middleName: string;
	public lastName: string;
	public dob: string;
	public imagePath: string;
	public weight: string;
	public height: string;
	public gender: string;
	public maritalStatus: string;
	public location: string;
	public occupation: string;
	public insurance: Insurance;

	constructor(patient) {
		this.id = patient.id ? patient.id : null;
		this.firstName = patient.firstName ? patient.firstName : null;
		this.middleName = patient.middleName ? patient.middleName : null;
		this.lastName = patient.lastName ? patient.lastName : null;
		this.dob = patient.dob ? patient.dob : null;
		this.imagePath = patient.imagePath ? patient.imagePath : null;
		this.weight = patient.weight ? patient.weight : null;
		this.height = patient.height ? patient.height : null;
		this.gender = patient.gender ? patient.gender : null;
		this.maritalStatus = patient.maritalStatus ? patient.maritalStatus : null;
		this.location = patient.location ? patient.location : null;
		this.occupation = patient.occupation ? patient.occupation : null;
		this.insurance = patient.insurance ? patient.insurance : null;
	}
}

// *****************************************************************************
// ****************************** Medical Session ******************************
// *****************************************************************************

export class Evaluation {
	chiefComplaints: string;
	illnessHistory: string;
	alleviation: string;
	headaches: string;
	painAreas: string;

	constructor(session = {}) {
		this.setEvaluation(session);
	}

	/**
	 * Sets evaluation
	 * @param session
	 */
	public setEvaluation(session) {
		this.chiefComplaints = session.chiefComplaints ? session.chiefComplaints : null;
		this.illnessHistory = session.illnessHistory ? session.illnessHistory : null;
		this.alleviation = session.alleviation ? session.alleviation : null;
		this.headaches = session.headaches ? session.headaches : null;
		this.painAreas = session.painAreas ? session.painAreas : null;
	}
}
export class HeadInjury {
	headInjury: boolean;
	headInjuryComments: string;
	constructor(injury) {
		;
		if (injury) {
			this.headInjury = injury.headInjury;
			this.headInjuryComments = this.headInjury ? injury.headInjuryComments : '';
		}
	}
}

export class SubBodyParts {
	subBodyPartId: number;
	location: string;

	constructor(data) {
		this.subBodyPartId = data.subBodyPartId;
		this.location = data.location;
	}
}
export class Location {
	checked: boolean;
	comments: string;
	compDescId: number;
	id: number;
	name: string;
	subBodyParts: SubBodyParts[];
	constructor(location) {
		this.checked = location.checked ? true : false;

		this.comments = location.comments;
		this.compDescId = location.compDescId;
		this.id = location.id;
		this.name = location.name;
		this.subBodyParts = location.subBodyParts;
	}
}
export class PatientComplaintDescription {
	id: number;
	name: string;
	locations: Location[];
	// issue: string;
	// subBodyParts: SubBodyParts[];
	// comment: string;
	checked: boolean;
	constructor(description) {
		this.id = description.id;
		this.name = description.name;
		this.locations = description.locations;
		// this.issue = description.issue;
		// this.subBodyParts = description.subBodyParts;
		// this.comment = description.comment;
		this.checked = description.checked ? true : false;
	}
}
export class PainExacerbation {
	id: number;
	reason: number[];
	comment: string;
}

export class Complaints2 {
	patientComplaintDescription: PatientComplaintDescription[];
	painExacerbation: PainExacerbation;
	comment: string;

	constructor(complaint) {
		if (complaint) {
			let des = getObjectChildValue(complaint, [], ['patientComplaintDescription']);
			;
			if (des) {
				this.patientComplaintDescription = des.map((description) => {
					return new PatientComplaintDescription(description);
				});
			}
			this.painExacerbation = complaint.painExacerbation;
			this.comment = complaint.comment;
		}
	}
}
export class PastMedicalHistory {
	diseases: number[];
	diseasesComment: string;
	previousInjuries: string;
	allergies: number[];
	hasOtherAllergies: boolean;
	otherAllergies: string;
	medications: string;
	noMedications: Boolean;
	previousSurgeries: string;
	noPreviousSurgeries: Boolean;
	familyHistory: string;
	socialHistory: string;
	familyHistoryNoncontributory: boolean;

	constructor(medicalHistory) {
		;
		if (medicalHistory) {
			this.diseases = medicalHistory.diseases;
			this.diseasesComment = medicalHistory.diseasesComment;
			this.previousInjuries = medicalHistory.previousInjuries;
			this.allergies = medicalHistory.allergies;
			this.otherAllergies = medicalHistory.otherAllergies;
			this.hasOtherAllergies = medicalHistory.hasOtherAllergies ? true : false;
			this.noMedications = medicalHistory.noMedications;
			// this.medications = (!medicalHistory.noMedications) ? medicalHistory.medications : '';
			this.medications = this.noMedications ? null : medicalHistory.medications;
			this.noPreviousSurgeries = medicalHistory.noPreviousSurgeries;
			this.previousSurgeries = !medicalHistory.noPreviousSurgeries
				? medicalHistory.previousSurgeries
				: '';
			this.previousSurgeries = this.noPreviousSurgeries ? null : medicalHistory.previousSurgeries;
			this.familyHistory = medicalHistory.familyHistory;
			this.socialHistory = medicalHistory.socialHistory;
			this.familyHistoryNoncontributory = medicalHistory.familyHistoryNoncontributory;
		}
	}
}

// Plan of care classes
export class PlanOfCare {
	id: number;
	orthopedic: string;
	painManagement: string;
	pmr: string;
	spineSpecialist: string;
	handSpecialist: string;
	podiatry: string;
	other: string;
	extermities: string;
	andOr: string;
	comment: string;
	device: number[];
	followUpVisit: string;
	patientPrognosis: string;
	patientPrognosisVal: string;
	temporarilyImpaired: number;
	temporarilyImpairedComment: string;
}

export class Speciality {
	id: number;
	name: string;
	checked: Boolean;
	dropped: Boolean;
	comment: string;
	children: Speciality;
	constructor(speciality) {
		this.id = speciality.id ? speciality.id : null;
		this.name = speciality.name ? speciality.name : null;
		this.checked = speciality.checked ? speciality.checked : null;
		this.dropped = speciality.dropped ? speciality.dropped : null;
		this.comment = speciality.comment ? speciality.comment : null;
		this.children = speciality.children ? speciality.children : null;
	}
}

export class Device {
	id: number;
	left: Boolean;
	right: Boolean;
	name: string;
	comments: string;
	constructor(device) {
		this.id = device.id ? device.id : null;
		this.left = device.left ? device.left : false;
		this.right = device.right ? device.right : false;
		this.name = device.heading ? device.heading : '';
		this.comments = device.comments ? device.comments : '';
	}
}

export class MRIs {
	id: number;
	left: Boolean;
	right: Boolean;
	heading: string;
	withValue: Boolean;
	childId: number;
	childChecked: Boolean;
	otherComment: number;
	callStatReport: Boolean;
	sendPhysicianFilms: Boolean;
	constructor(mri) {
		this.id = mri.id ? mri.id : null;
		this.left = mri.left ? mri.left : false;
		this.right = mri.right ? mri.right : false;
		this.heading = mri.heading ? mri.heading : '';
		this.withValue = mri.withValue ? mri.withValue : '';
		// this.without = (mri.withoutValue)?mri.withoutValue:false;
		this.childId = mri.childId ? mri.childId : null;
		this.childChecked = mri.childChecked ? mri.childChecked : false;
		this.otherComment = mri.otherComment ? mri.otherComment : null;
		this.callStatReport = mri.callStatReport ? mri.callStatReport : null;
		this.sendPhysicianFilms = mri.sendPhysicianFilms ? mri.sendPhysicianFilms : null;
	}
}
export class OtherMRIs {
	other: MRIs[];
	mrAngiographies: MRIs[];
	ctaAngiographies: MRIs[];
	mammographies: MRIs[];
	ultrasounds: MRIs[];
	dexa: MRIs[];

	constructor(others) {
		let mris = {
			other: [],
			mrAngiographies: [],
			ctaAngiographies: [],
			mammographies: [],
			ultrasounds: [],
			dexa: [],
		};
		for (let x in others) {
			mris[others[x].heading].push(new MRIs(others[x]));
		}

		this.other = mris.other ? mris.other : null;
		this.mrAngiographies = mris.mrAngiographies ? mris.mrAngiographies : null;
		this.ctaAngiographies = mris.ctaAngiographies ? mris.ctaAngiographies : null;
		this.mammographies = mris.mammographies ? mris.mammographies : null;
		this.ultrasounds = mris.ultrasounds ? mris.ultrasounds : null;
		this.dexa = mris.dexa ? mris.dexa : null;
	}
}

export class Drugs {
	id: number;
	display: string;
	value: string;
	constructor(drug) {
		this.id = drug.id ? drug.id : null;
		this.display = drug.display ? drug.display : null;
		this.value = drug.value ? drug.value : null;
	}
}
export class Exercise {
	id: number;
	name: string;
	checked?: boolean;
	constructor(exercise) {
		this.id = exercise.id ? exercise.id : null;
		this.name = exercise.name ? exercise.name : null;
		this.checked = exercise.checked ? exercise.checked : null;
	}
}
export class Modality {
	id: number;
	name: string;
	checked?: boolean;
	constructor(modality) {
		this.id = modality.id ? modality.id : null;
		this.name = modality.display ? modality.name : null;
		this.checked = modality.checked ? modality.checked : null;
	}
}
export class Goal {
	id: number;
	name: string;
	constructor(goal) {
		this.id = goal.id ? goal.id : null;
		this.name = goal.display ? goal.name : null;
	}
}
export class Tharapy {
	id: number;
	name: string;
	checked?: boolean;
	constructor(tharapy) {
		this.id = tharapy.id ? tharapy.id : null;
		this.name = tharapy.display ? tharapy.name : null;
		this.checked = tharapy.checked ? tharapy.checked : null;
	}
}
export class WeightBearing {
	id: number;
	name: string;
	constructor(weightBear) {
		this.id = weightBear.id ? weightBear.id : null;
		this.name = weightBear.display ? weightBear.name : null;
	}
}
export class Medication {
	prescribedDrugs: Drugs[];
	usePrescribed: Boolean;
	useOld: Boolean;
	workEffect: Boolean;
	constructor(medications) {
		this.prescribedDrugs = medications.prescribedDrugs ? medications.prescribedDrugs : null;
		this.usePrescribed = medications.usePrescribed ? medications.usePrescribed : null;
		this.useOld = medications.useOld ? medications.useOld : null;
		this.workEffect = medications.workEffect ? medications.workEffect : null;
	}
}
export class BodyPart {
	id: number;
	name: string;
	orientation: string;
	constructor(bodyPart) {
		this.id = bodyPart.id ? bodyPart.id : null;
		this.name = bodyPart.name ? bodyPart.name : null;
		this.orientation = bodyPart.orientation ? bodyPart.orientation : null;
	}
}
export class Referral {
	id: number;
	checked: Boolean;
	comment: string;
	improvement: string;
	intervalName: string;
	noOfWeeks: string;
	perWeek: string;
	periodName: string;
	precautions: string;
	specialty: string;
	diagnosis: any;
	weightBearings: Exercise[];
	exercises: Exercise[];
	modalities: Modality[];
	goals: Goal;
	tharapies: Tharapy[];
	constructor(referral) {
		this.id = referral.id ? referral.id : null;
		this.checked = referral.checked ? referral.checked : null;
		this.comment = referral.comment ? referral.comment : null;
		this.intervalName = referral.intervalName ? referral.intervalName : null;
		this.improvement = referral.improvement ? referral.improvement : null;
		this.noOfWeeks = referral.noOfWeeks ? referral.noOfWeeks : null;
		this.perWeek = referral.perWeek ? referral.perWeek : null;
		this.periodName = referral.periodName ? referral.periodName : null;
		this.precautions = referral.precaution ? referral.precaution : null;
		this.specialty = referral.specialty ? referral.specialty : null;
		this.exercises = referral.exercises ? referral.exercises : null;
		this.modalities = referral.modalities ? referral.modalities : null;
		this.goals = referral.goals ? referral.goals : null;
		this.tharapies = referral.tharapies ? referral.tharapies : null;
		let diagnosis = getObjectChildValue(referral, [], ['diagnosis']) || [];
		;
		this.diagnosis = diagnosis
			.filter((code) => {
				return code.checked;
			})
			.map((code) => {
				return code.id;
			}); //{ return { id: code.id } })
		let weightBearings = getObjectChildValue(referral, [], ['weightBearings']) || [];
		// ;
		// alert();
		this.weightBearings = weightBearings.filter((weightBearing) => {
			return weightBearing.checked;
		});
		// .map((weightBearing) => {
		// 	return weightBearing.id;
		// });
	}
}

export class planOfCare1 {
	ptPerWeek: number;
	ptNoOfWeeks: number;
	ptImprovement: Boolean;
	ptComment: string;
	radiologies: MRIs[];
	radiologyOn: Boolean;
	radiologyComments: string;
	ctScans: MRIs[];
	CTScanOn: Boolean;
	ctComments: string;
	MRI: MRIs[];
	MRIOn: Boolean;
	mriComments: string;
	others: MRIs[];
	otherOn: Boolean;
	otherComments: string;
	devices: any[];
	otherDeviceschecked: Boolean;
	otherDevices: string;
	followUpVisit: string;
	next_follow_up_visit_comments:string;
	followUpOther: string;
	orthopedic: boolean;
	orthopedic_checked: string;
	painManagement: boolean;
	painManagement_checked: string;
	pmr: boolean;
	pmr_checked: string;
	spineSpecialist: boolean;
	spineSpecialist_checked: string;
	handSpecialist: boolean;
	handSpecialist_checked: string;
	podiatry: boolean;
	podiatry_checked: string;
	neurology: boolean;
	neurology_checked: string;
	extremities: boolean;
	extremities_checked: string;
	other: boolean;
	other_checked: string;
	comment: string;
	casualityComments: string;
	temporarilyImpairedComment: string;
	temporarilyImpaired: number;
	medications: Medication;
	prognosisCheck: boolean;
	prognosis: boolean;
	// ptPeriodName: string;
	// ptIntervalName: string;
	specialities: Speciality[];
	referrals: Referral[];
	hbotPrescription: string;
	synapticTreatment: string;
	orientedBodyParts: BodyPart[];
	nonOrientedBodyParts: BodyPart[];
	rangeOfMotion: any; //boolean;
	// diagnostic_codes: any[];
	constructor(plan) {
		this.radiologyOn = getObjectChildValue(plan, null, ['radiologyOn']);
		this.radiologies = this.radiologyOn ? getObjectChildValue(plan, null, ['radiologies']) : null;
		this.radiologyComments = this.radiologyOn
			? getObjectChildValue(plan, null, ['radiologyComments'])
			: null;

		this.CTScanOn = getObjectChildValue(plan, null, ['CTScanOn']);
		this.ctScans = this.CTScanOn ? getObjectChildValue(plan, null, ['ctScans']) : null;
		this.ctComments = this.CTScanOn ? getObjectChildValue(plan, null, ['ctComments']) : null;

		this.MRIOn = getObjectChildValue(plan, null, ['MRIOn']);
		this.MRI = this.MRIOn ? getObjectChildValue(plan, null, ['MRI']) : null;
		this.mriComments = this.MRIOn ? getObjectChildValue(plan, null, ['mriComments']) : null;

		this.otherOn = getObjectChildValue(plan, null, ['otherOn']);
		this.others = this.otherOn ? getObjectChildValue(plan, null, ['others']) : null;
		this.otherComments = this.otherOn ? getObjectChildValue(plan, null, ['otherComments']) : null;

		this.devices = getObjectChildValue(plan, null, ['devices']);
		this.devices = this.devices.filter((device) => {
			return device.checked;
		});
		this.followUpVisit = getObjectChildValue(plan, null, ['followUpVisit']);
		this.next_follow_up_visit_comments = getObjectChildValue(plan, null, ['next_follow_up_visit_comments']);
		this.followUpOther = getObjectChildValue(plan, null, ['followUpOther']);
		this.orthopedic = getObjectChildValue(plan, null, ['orthopedic']);
		this.orthopedic_checked = getObjectChildValue(plan, null, ['orthopedic_checked']);
		this.painManagement = getObjectChildValue(plan, null, ['painManagement']);
		this.painManagement_checked = getObjectChildValue(plan, null, ['painManagement_checked']);
		this.pmr = getObjectChildValue(plan, null, ['pmr']);
		this.pmr_checked = getObjectChildValue(plan, null, ['pmr_checked']);
		this.spineSpecialist = getObjectChildValue(plan, null, ['spineSpecialist']);
		this.spineSpecialist_checked = getObjectChildValue(plan, null, ['spineSpecialist_checked']);
		this.handSpecialist = getObjectChildValue(plan, null, ['handSpecialist']);
		this.handSpecialist_checked = getObjectChildValue(plan, null, ['handSpecialist_checked']);
		this.podiatry = getObjectChildValue(plan, null, ['podiatry']);
		this.podiatry_checked = getObjectChildValue(plan, null, ['podiatry_checked']);
		this.neurology = getObjectChildValue(plan, null, ['neurology']);
		this.neurology_checked = getObjectChildValue(plan, null, ['neurology_checked']);
		this.extremities = getObjectChildValue(plan, null, ['extremities']);
		this.extremities_checked = getObjectChildValue(plan, null, ['extremities_checked']);
		this.other = getObjectChildValue(plan, null, ['other']);
		this.other_checked = getObjectChildValue(plan, null, ['other_checked']);
		this.otherDevices = getObjectChildValue(plan, null, ['otherDevices']);
		this.otherDeviceschecked = getObjectChildValue(plan, null, ['otherDeviceschecked']);
		this.comment = getObjectChildValue(plan, null, ['comment']);
		this.casualityComments = getObjectChildValue(plan, null, ['casualityComments']);
		this.temporarilyImpairedComment = getObjectChildValue(plan, null, [
			'temporarilyImpairedComment',
		]);
		this.temporarilyImpaired = getObjectChildValue(plan, null, ['temporarilyImpaired']);
		this.medications = getObjectChildValue(plan, null, ['medications']);
		this.prognosisCheck = getObjectChildValue(plan, null, ['prognosisCheck']);
		this.prognosis = getObjectChildValue(plan, null, ['prognosis']);
		// this.ptPeriodName = getObjectChildValue(plan, null, ['ptPeriodName']);
		// this.ptIntervalName = getObjectChildValue(plan, null, ['ptIntervalName']);
		this.specialities = getObjectChildValue(plan, null, ['specialities']);
		this.referrals = getObjectChildValue(plan, null, ['referrals']);
		this.hbotPrescription = getObjectChildValue(plan, false, ['hbotPrescription']);
		this.synapticTreatment = getObjectChildValue(plan, false, ['synapticTreatment']);
		this.rangeOfMotion = getObjectChildValue(plan, false, ['rangeOfMotion']);
		this.orientedBodyParts = this.rangeOfMotion
			? getObjectChildValue(plan, [], ['orientedBodyParts'])
			: [];
		this.nonOrientedBodyParts = this.rangeOfMotion
			? getObjectChildValue(plan, [], ['nonOrientedBodyParts'])
			: [];
		// let diagnostic_codes = getObjectChildValue(plan, [], ['diagnostic_codes']) || [];
		// this.diagnostic_codes = diagnostic_codes.filter((code) => { return code.checked; }).map((code) => { return { id: code.id } })
	}
}
export class Values {
	outOfWorkDate: string;
	returnedToWorkDate: string;
	limitations: string;
	constructor(value) {
		this.outOfWorkDate = value && value.outOfWorkDate ? value.outOfWorkDate : null;
		this.returnedToWorkDate = value && value.returnedToWorkDate ? value.returnedToWorkDate : null;
		this.limitations = value && value.limitations ? value.limitations : null;
	}
}
export class WorkStatus {
	case: string;
	values: Values;
	comments: string;
	constructor(plan) {
		this.case = plan && plan.case ? plan.case : null;
		this.values = new Values(plan && plan.values ? plan.values : null);
		this.comments = plan && plan.comments ? plan.comments : null;
	}
}
// Referrals Synaptic Details

export class PainScaleScore {
	private treatmentDay: string;
	private beforeTreatment: string;
	private afterTreatment: string;

	constructor(painScaleScore) {
		this.treatmentDay = painScaleScore.treatmentDay ? painScaleScore.treatmentDay : null;
		this.beforeTreatment = painScaleScore.beforeTreatment ? painScaleScore.beforeTreatment : null;
		this.afterTreatment = painScaleScore.afterTreatment ? painScaleScore.afterTreatment : null;
	}
}
export class SynapticDetails {
	private treatmentDay: string;
	private area: string;
	private treatmentTime: string;
	private bias: string;
	private dosageLevel: string;
	private designedElectrodes: string;

	constructor(synapticDetails) {
		this.treatmentDay = synapticDetails.treatmentDay ? synapticDetails.treatmentDay : null;
		this.area = synapticDetails.area ? synapticDetails.area : null;
		this.treatmentTime = synapticDetails.treatmentTime ? synapticDetails.treatmentTime : null;
		this.bias = synapticDetails.bias ? synapticDetails.bias : null;
		this.dosageLevel = synapticDetails.dosageLevel ? synapticDetails.dosageLevel : null;
		this.designedElectrodes = synapticDetails.designedElectrodes
			? synapticDetails.designedElectrodes
			: null;
	}
}
export class Synaptic {
	private comments: string;
	private painScaleScore: PainScaleScore[];
	private synapticDetails: SynapticDetails[];
	private treatmentDiagnosis: string;
	private treatmentInterval: string;
	private treatmentIntervalName: string;
	private treatmentNoOfTimes: string;
	private treatmentPeriodName: string;

	constructor(synaptic) {
		this.comments = synaptic.comments ? synaptic.comments : null;
		this.painScaleScore = synaptic.painScaleScore ? synaptic.painScaleScore : null;
		this.synapticDetails = synaptic.synapticDetails ? synaptic.synapticDetails : null;
		this.treatmentDiagnosis = synaptic.treatmentDiagnosis ? synaptic.treatmentDiagnosis : null;
		this.treatmentInterval = synaptic.treatmentInterval ? synaptic.treatmentInterval : null;
		this.treatmentIntervalName = synaptic.treatmentIntervalName
			? synaptic.treatmentIntervalName
			: null;
		this.treatmentNoOfTimes = synaptic.treatmentNoOfTimes ? synaptic.treatmentNoOfTimes : null;
		this.treatmentPeriodName = synaptic.treatmentPeriodName ? synaptic.treatmentPeriodName : null;
	}
}
export class TimeReport {
	private timeSet: string;
	private timeStarted: string;
	private timeEnd: string;
	constructor(data) {
		this.timeSet = data.timeSet ? data.timeSet : '';
		this.timeStarted = data.timeStarted ? data.timeStarted : '';
		this.timeEnd = data.timeEnd ? data.timeEnd : '';
	}
}
export class HBOT {
	private psi: string;
	private ata: string;
	private mask: string;
	private earPlanes: string;
	private timeStarted: string;
	private psiEarsPressurized: string;
	private timeToMaxPsi: string;
	private timeStartedDown: string;
	private timeSpentAtMax: string;
	private timeToZero: string;
	private totalTimeInChamber: string;
	private timeReports: TimeReport[];
	private technician: string;
	private doctorReviewed: string;
	private comment: string;
	constructor(data) {
		this.psi = data.psi ? data.psi : '';
		this.ata = data.ata ? data.ata : '';
		this.mask = data.mask ? data.mask : '';
		this.earPlanes = data.earPlanes ? data.earPlanes : '';
		this.timeStarted = data.timeStarted ? data.timeStarted : '';
		this.psiEarsPressurized = data.psiEarsPressurized ? data.psiEarsPressurized : '';
		this.timeToMaxPsi = data.timeToMaxPsi ? data.timeToMaxPsi : '';
		this.timeStartedDown = data.timeStartedDown ? data.timeStartedDown : '';
		this.timeSpentAtMax = data.timeSpentAtMax ? data.timeSpentAtMax : '';
		this.timeToZero = data.timeToZero ? data.timeToZero : '';
		this.totalTimeInChamber = data.totalTimeInChamber ? data.totalTimeInChamber : '';
		this.timeReports = data.timeReports ? data.timeReports : null;
		this.technician = data.technician ? data.technician : '';
		this.doctorReviewed = data.doctorReviewed ? data.doctorReviewed : '';
		this.comment = data.comment ? data.comment : '';
	}
}
export class MedicalSession {
	id: number;
	appointment_id: number;

	// caseId:number;
	// patientId:number;
	// doctorId:number;
	evaluation: Evaluation;
	currentComplaints: CurrentComplaint[];
	headInjury: HeadInjury;
	currentComplaints2: Complaints2;
	pastMedicalHistory: PastMedicalHistory;
	physicalExamination1: PhysicalExamination1;
	physicalExamination2: PhysicalExamination2;
	diagnosticImpression: DiagnosticImpression;
	phyOccChirott: any;
	mriReferral: any;
	specialityConsultation: any;
	rangeOfMotion: any;
	visitType: string;
	planOfCare: planOfCare1;
	workStatus: WorkStatus;
	treatment_rendered: TreatmentRendered;
	synaptic: Synaptic;
	hbotNotes: HBOT;
	finalize_visit: Boolean;
	test_results: TestResults;
	enableSaveRecordMedicalDoctor:boolean;
	constructor(session) {
		;
		this.id = session.id ? session.id : null;
		this.appointment_id = session.appointment_id ? session.appointment_id : null;
		this.evaluation = session.evaluation ? session.evaluation : null;
		this.currentComplaints = session.currentComplaints ? session.currentComplaints : null;
		this.headInjury = session.headInjury ? new HeadInjury(session.headInjury) : null;
		this.currentComplaints2 = session.currentComplaints2 ? session.currentComplaints2 : null;
		this.pastMedicalHistory = session.pastMedicalHistory ? session.pastMedicalHistory : null;
		this.physicalExamination1 = session.physicalExamination1
			? new PhysicalExamination1(session.physicalExamination1)
			: null;
		this.physicalExamination2 = session.physicalExamination2 ? session.physicalExamination2 : null;
		this.diagnosticImpression = session.diagnosticImpression ? session.diagnosticImpression : null;
		this.phyOccChirott = session.phyOccChirott ? session.phyOccChirott : null;
		this.mriReferral = session.mriReferral ? session.mriReferral : null;
		this.specialityConsultation = session.specialityConsultation
			? session.specialityConsultation
			: null;
		this.rangeOfMotion = session.rangeOfMotion ? session.rangeOfMotion : null;
		this.visitType = session.visitType ? session.visitType : null;
		this.planOfCare = session.planOfCare ? session.planOfCare : null;
		this.synaptic = session.synaptic ? session.synaptic : null;
		this.hbotNotes = session.hbotNotes ? session.hbotNotes : null;
		this.finalize_visit = session.finalize_visit ? session.finalize_visit : false;
		this.workStatus = session && session.workStatus ? new WorkStatus(session.workStatus) : null;
		this.treatment_rendered = session.treatment_rendered
			? new TreatmentRendered(session.treatment_rendered)
			: null;
		this.test_results = session.test_results;
		this.enableSaveRecordMedicalDoctor=session.enableSaveRecordMedicalDoctor?session.enableSaveRecordMedicalDoctor:null
	}
}

export class TestResultObj {
	callStatReport: boolean;
	id: number;
	left: string;
	// mriId:number;
	otherComment: string;
	right: string;
	sendPhysicalFilms: boolean;
	withValue: string;
	test_result_comment: string;
	name: string;
}

export class OtherComments{
	test_result_comment:string = "";
}
export class TestResults {
	MRI: TestResultMRIObj[];
	ctScans: TestResultCTScanObj[];
	others: TestResultOther;
	radiologies: TestResultObj[];
	other_comments:OtherComments= new OtherComments() ;
	extremities: any={};
	cleanDataFromTestResult?:boolean;

	constructor(MRI: TestResultMRIObj[],
		ctScans: TestResultCTScanObj[],
		others: TestResultOther,
		radiologies: TestResultObj[],
		other_comments:any,
		extremities: any){
		this.MRI = MRI;
		this.ctScans = ctScans;
		this.others = others;
		this.radiologies=radiologies;
		this.other_comments =other_comments;
		this.extremities = extremities;


	}
}
export class TestResultMRIObj extends TestResultObj {
	mriId: number;
}
export class TestResultCTScanObj extends TestResultObj {
	multiDetectId: number;
}
export class TestResultRadiologyObj extends TestResultObj {
	radiologyId: number;
}
export class TestResultCTAngioObj extends TestResultObj {
	cTAngioId: number;
}
export class TestResultdexaObj extends TestResultObj {
	dexaId: number;
}
export class TestResultmammographiesObj extends TestResultObj {
	mammographyId: number;
}
export class TestResultmrAngiographiesObj extends TestResultObj {
	mRAngioId: number;
}
export class TestResultultrasoundsObj extends TestResultObj {
	ultrasoundId: number;
}
export class TestResultOther {
	ctaAngiographies: TestResultCTAngioObj[];
	dexa: TestResultdexaObj[];
	mammographies: TestResultmammographiesObj[];
	mrAngiographies: TestResultmrAngiographiesObj[];
	ultrasounds: TestResultultrasoundsObj[];
}
