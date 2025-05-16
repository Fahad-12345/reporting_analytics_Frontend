import {
	SubBodyPart,
	Sensation,
	Feelings,
	Radiation,
	Devices,
} from '../models/initialEvaluation/initialEvaluationModels';

/**
 * This seeded info is for reference whenever back end data is not sent we can compare
 */
export interface SensationText {
	bodyPartId: number;
	sensation_location: string;
	location: string;
}

export interface SeededBodyPartMotion {
	id: number;
	hasOrientation: number;
	body_part_id: number;
	bodyPartId: number; //this will be removed in future
}

export interface SeededBodyPartSensation {
	id: number;
	sensation: string;
	bodyPartId: number;
}

export interface SeededConditionState {
	id: number;
	state: string;
	bodyPartConditionId: number;
	body_part_condition_id: number;
}

export interface SeededBodyPartCondition {
	id: number;
	condition: string;
	bodyPartId: number; //this will be removed in future
	body_part_id: number;
	conditionStates: SeededConditionState[];
}

export interface SeededBodyPart {
	id: number;
	name: string;
	bodyPartKey: string;
	type: string;
	location: number;
	codes?: number[];
	has_comments: number;
	motion?: SeededBodyPartMotion;
	checked?: boolean;
	issue?: string;
	comment?: string;
}

export interface SeededBodyPartFeelings {
	id: number;
	bodyPartId: number;
	feeling: string;
}

export interface SeededDisease {
	id: number;
	disease: string;
}

export interface SeededBodyPartMovement {
	id: number;
	movement: string;
	normalROM: number;
	bodyPartId: number; //this will be removed in future
	body_part_id: number;
}
export interface SeededAllergy {
	id: number;
	allergy: string;
}
export interface SeededRadiology {
	id: number;
	section: string;
	name: string;
	hasLeft?: number;
	hasRight?: number;
	parentId: number;
	with?: number;
	withOut?: number;
}
export interface SeededGoal {
	id: number;
	name: string;
}
export interface SeededModality {
	id: number;
	name: string;
}
export interface SeededExcercise {
	id: number;
	name: string;
}
export interface SeededTharapy {
	id: number;
	name: string;
}
// export interface SeededDevice {
//     id: number;
//     name: string;
//     location: string;
// }
export interface SeededSpecalty {
	id: number;
	name: string;
	parentId: number;
	children?: SeededSpecalty[];
}
export interface SeededPainExcerbation {
	id: number;
	name: string;
}
export interface SeededReferral {
	id: number;
	name: string;
}

export interface ReferringSpecialty {
	id: number;
	title: string;
	specialty_key: string;
	specialty_comment_key: string;
	specialty_comment_max_length: number;
}
export interface SeededInfo {
	radiations: Radiation[];
	sensationTexts: SensationText[];
	bodyParts: SeededBodyPart[];
	bodyPartSensations: Sensation[];
	bodyPartConditions: SeededBodyPartCondition[];
	bodyPartFeelings: Feelings[];
	diseases: SeededDisease[];
	bodyPartMovements: SeededBodyPartMovement[];
	subBodyParts: SubBodyPart[];
	allergies: SeededAllergy[];
	radiologies: SeededRadiology[];
	ctScans: SeededRadiology[];
	mammographies: SeededRadiology[];
	mrAngiographies: SeededRadiology[];
	ctaAngiographies: SeededRadiology[];
	mris: SeededRadiology[];
	ultrasounds: SeededRadiology[];
	dexa: SeededRadiology[];
	drugs: any[];
	goals: SeededGoal[];
	modalities: SeededModality[];
	excercises: SeededExcercise[];
	tharapies: SeededTharapy[];
	devices: Devices[];
	specialities: SeededSpecalty[];
	painExcerbations: SeededPainExcerbation[];
	referrals: SeededReferral[];
	referring_specialties: ReferringSpecialty[];
	favourite_codes: any[];
}
/**
 * if possible ask back end team to send view control data from backend as well. Shared Physical Examination 2
 */

// export const REFFERING_SPECIALTIES = [
// ];
// Below object will be fetched from back end and will be discarded from front end.
export const seededInfo: SeededInfo = {
	referring_specialties: [
		//These are not added in the back end and are required
		{
			id: 1,
			title: 'Orthopedics',
			specialty_key: 'orthopedic_checked',
			specialty_comment_key: 'orthopedic',
			specialty_comment_max_length: 511,
		},
		{
			id: 2,
			title: 'Pain Management',
			specialty_key: 'painManagement_checked',
			specialty_comment_key: 'painManagement',
			specialty_comment_max_length: 511,
		},
		{
			id: 3,
			title: 'PMR',
			specialty_key: 'pmr_checked',
			specialty_comment_key: 'pmr',
			specialty_comment_max_length: 511,
		},
		{
			id: 4,
			title: 'Spine specialist',
			specialty_key: 'spineSpecialist_checked',
			specialty_comment_key: 'spineSpecialist',
			specialty_comment_max_length: 511,
		},
		{
			id: 5,
			title: 'Hand specialist',
			specialty_key: 'handSpecialist_checked',
			specialty_comment_key: 'handSpecialist',
			specialty_comment_max_length: 511,
		},
		{
			id: 6,
			title: 'Podiatry',
			specialty_key: 'podiatry_checked',
			specialty_comment_key: 'podiatry',
			specialty_comment_max_length: 511,
		},
		{
			id: 7,
			title: 'Neurology',
			specialty_key: 'neurology_checked',
			specialty_comment_key: 'neurology',
			specialty_comment_max_length: 511,
		},
		{
			id: 8,
			title: 'Other',
			specialty_key: 'other_checked',
			specialty_comment_key: 'other',
			specialty_comment_max_length: 511,
		},
	],
	radiations: [
		//These are not added in the back end and are required
		/**************************
		 **********Neck************
		 ************************** */
		{ bodyPartId: 1, position: 'shoulder', location: '' },
		{ bodyPartId: 1, position: 'upper extremities', location: '' },
		/**************************
		 ********Upper Back********
		 ************************** */
		{ bodyPartId: 2, position: 'shoulder', location: 'upper' },
		{ bodyPartId: 2, position: 'upper extremities', location: 'upper' },
		/**************************
		 ********* Mid Back********
		 ************************** */
		{ bodyPartId: 2, position: 'buttocks', location: 'mid' },

		{ bodyPartId: 2, position: 'lower extremities', location: 'mid' },
		/**************************
		 ******* Lower Back *******
		 ************************** */
		{ bodyPartId: 2, position: 'buttocks', location: 'lower' },
		{ bodyPartId: 2, position: 'lower extremities', location: 'lower' },
		/**************************
		 *****Right Shoulder*******
		 ************************** */
		{ bodyPartId: 3, position: 'upper extremity', location: 'right' },
		/**************************
		 ******Left Shoulder*******
		 ************************** */
		{ bodyPartId: 3, position: 'upper extremity', location: 'left' },
		/**************************
		 ********Right Hip*********
		 ************************** */
		{ bodyPartId: 4, position: 'lower extremity', location: 'right' },
		/**************************
		 *********Left Hip*********
		 ************************** */
		{ bodyPartId: 4, position: 'lower extremity', location: 'left' },
		/**************************
		 ********Right Knee********
		 ************************** */
		{ bodyPartId: 5, position: 'lower extremity', location: 'right' },
		/**************************
		 ********Left Knee*********
		 ************************** */
		{ bodyPartId: 5, position: 'lower extremity', location: 'left' },
	], //These are not added in the back end and are required
	sensationTexts: [
		//These are not added in the back end and are required
		/**************************
		 **********Neck************
		 ************************** */
		{ bodyPartId: 1, sensation_location: 'in upper extremities', location: '' },
		/**************************
		 *******Upper Back*********
		 ************************** */
		{ bodyPartId: 2, sensation_location: 'in upper extremities', location: 'upper' },
		/**************************
		 ********Mid Back**********
		 ************************** */
		{ bodyPartId: 2, sensation_location: 'in lower extremities', location: 'mid' },
		/**************************
		 *******Lower Back*********
		 ************************** */
		{ bodyPartId: 2, sensation_location: 'in lower extremities', location: 'lower' },
		/**************************
		 *****Right Shoulder*******
		 ************************** */
		{ bodyPartId: 3, sensation_location: 'in upper extremity', location: 'right' },
		/**************************
		 ******Left Shoulder*******
		 ************************** */
		{ bodyPartId: 3, sensation_location: 'in upper extremity', location: 'left' },
		/**************************
		 ****** Right Hip *********
		 ************************** */
		{ bodyPartId: 4, sensation_location: 'in lower extremity', location: 'right' },
		/**************************
		 ****** Left Hip *********
		 ************************** */
		{ bodyPartId: 4, sensation_location: 'in lower extremity', location: 'left' },
		/**************************
		 ****** Left Knee *********
		 ************************** */
		{ bodyPartId: 5, sensation_location: 'in lower extremity', location: 'left' },
		/**************************
		 ****** Right Knee ********
		 ************************** */
		{ bodyPartId: 5, sensation_location: 'in lower extremity', location: 'right' },
	],

	bodyParts: [
		{
			id: 1,
			name: 'Neck',
			bodyPartKey: null,
			type: 'complaints',
			location: 0,
			has_comments: 0,
		},
		{
			id: 2,
			name: 'Back',
			bodyPartKey: null,
			type: 'complaints',
			location: 0,
			has_comments: 0,
		},
		{
			id: 3,
			name: 'Shoulder',
			bodyPartKey: null,
			type: 'complaints',
			location: 1,
			has_comments: 0,
		},
		{
			id: 4,
			name: 'Hip',
			bodyPartKey: null,
			type: 'complaints',
			location: 1,
			has_comments: 0,
		},
		{
			id: 5,
			name: 'Knee',
			bodyPartKey: null,
			type: 'complaints',
			location: 1,
			has_comments: 0,
		},
		{
			id: 6,
			name: 'Arm',
			bodyPartKey: null,
			type: 'description',
			location: 1,
			has_comments: 0,
		},
		{
			id: 7,
			name: 'Leg',
			bodyPartKey: null,
			type: 'description',
			location: 1,
			has_comments: 0,
		},
		{
			id: 8,
			name: 'Head',
			bodyPartKey: 'head',
			type: 'physicalExamination',
			location: null,
			has_comments: 0,
		},
		{
			id: 9,
			name: 'Eyes',
			bodyPartKey: 'eyes',
			type: 'physicalExamination',
			location: null,
			has_comments: 0,
		},
		{
			id: 10,
			name: 'Chest',
			bodyPartKey: 'chest',
			type: 'physicalExamination',
			location: null,
			has_comments: 0,
		},
		{
			id: 11,
			name: 'Heart',
			bodyPartKey: 'heart',
			type: 'physicalExamination',
			location: null,
			has_comments: 0,
		},
		{
			id: 12,
			name: 'Lungs',
			bodyPartKey: 'lungs',
			type: 'physicalExamination',
			location: null,
			has_comments: 0,
		},
		{
			id: 13,
			name: 'Abdomen',
			bodyPartKey: 'abdomen',
			type: 'physicalExamination',
			location: null,
			has_comments: 0,
		},
		{
			id: 14,
			name: 'Back',
			bodyPartKey: 'back',
			type: 'physicalExamination',
			location: null,
			has_comments: 0,
		},
		{
			id: 15,
			name: 'Extremities',
			bodyPartKey: 'extremities',
			type: 'physicalExamination',
			location: null,
			has_comments: 0,
		},
		// Sequence changed
		{
			id: 16,
			name: 'Cervical spine',
			bodyPartKey: 'cervical-spine',
			type: 'physicalExm2',
			location: 0,
			has_comments: 0,
		},
		{
			id: 17,
			name: 'Thoracic spine',
			bodyPartKey: 'thoracic-spine',
			type: 'physicalExm2',
			location: 0,
			has_comments: 0,
		},
		{
			id: 18,
			name: 'Lumbosacral spine',
			bodyPartKey: 'lumbosacral-spine',
			type: 'physicalExm2',
			location: 0,
			has_comments: 0,
		},
		{
			id: 19,
			name: 'Shoulder',
			bodyPartKey: 'shoulder',
			type: 'physicalExm2',
			location: 1,
			has_comments: 0,
		},
		{
			id: 20,
			name: 'Elbow',
			bodyPartKey: 'elbow',
			type: 'physicalExm2',
			location: 1,
			has_comments: 0,
		},
		{
			id: 21,
			name: 'Wrist',
			bodyPartKey: 'wrist',
			type: 'physicalExm2',
			location: 1,
			has_comments: 0,
		},
		{
			//This one is new
			id: 22,
			name: 'Hand',
			bodyPartKey: 'hand',
			type: 'physicalExm2',
			location: 0,
			has_comments: 0,
		},
		{
			id: 23,
			name: 'Hip',
			bodyPartKey: 'hip',
			type: 'physicalExm2',
			location: 1,
			has_comments: 0,
		},
		{
			id: 24,
			name: 'Knee',
			bodyPartKey: 'knee',
			type: 'physicalExm2',
			location: 1,
			has_comments: 0,
		},
		{
			id: 25,
			name: 'Ankle',
			bodyPartKey: 'ankle',
			type: 'physicalExm2',
			location: 1,
			has_comments: 0,
		},
		// This is also new
		{
			id: 26,
			name: 'Foot',
			bodyPartKey: 'foot',
			type: 'physicalExm2',
			location: 0,
			has_comments: 0,
		},
		// C.Spine,Th. Spine,L.Spine,Shoulder,Elbow, Wrist, Hand, Hip, Knee, ankle, Foot
		{
			id: 27,
			name: 'Arm',
			bodyPartKey: 'arm',
			type: 'diagnosticImp',
			location: null,
			has_comments: 0,
			codes: [],
		},
		{
			id: 28,
			name: 'Leg',
			bodyPartKey: 'leg',
			type: 'diagnosticImp',
			location: null,
			has_comments: 0,
			codes: [],
		},
		{
			id: 29,
			name: 'Neck',
			bodyPartKey: 'neck',
			type: 'diagnosticImp',
			location: null,
			has_comments: 0,
			codes: [],
		},
		{
			id: 30,
			name: 'Cervical Spine',
			bodyPartKey: null,
			type: 'rangeOfMotion',
			location: null,
			has_comments: 0,
			motion: {
				id: 1,
				hasOrientation: 0,
				bodyPartId: 30,
				body_part_id: null,
			},
		},
		{
			id: 31,
			name: 'Shoulder',
			bodyPartKey: null,
			type: 'rangeOfMotion',
			location: null,
			has_comments: 0,
			motion: {
				id: 2,
				hasOrientation: 1,
				bodyPartId: 31,
				body_part_id: null,
			},
		},
		{
			id: 32,
			name: 'Elbow',
			bodyPartKey: null,
			type: 'rangeOfMotion',
			location: null,
			has_comments: 0,
			motion: {
				id: 3,
				hasOrientation: 1,
				bodyPartId: 32,
				body_part_id: null,
			},
		},
		{
			id: 33,
			name: 'Thoracic Spine',
			bodyPartKey: null,
			type: 'rangeOfMotion',
			location: null,
			has_comments: 0,
			motion: {
				id: 4,
				hasOrientation: 0,
				bodyPartId: 33,
				body_part_id: null,
			},
		},
		{
			id: 34,
			name: 'Wrist',
			bodyPartKey: null,
			type: 'rangeOfMotion',
			location: null,
			has_comments: 0,
			motion: {
				id: 5,
				hasOrientation: 1,
				bodyPartId: 34,
				body_part_id: null,
			},
		},
		{
			id: 35,
			name: 'Hip',
			bodyPartKey: null,
			type: 'rangeOfMotion',
			location: null,
			has_comments: 0,
			motion: {
				id: 6,
				hasOrientation: 1,
				bodyPartId: 35,
				body_part_id: null,
			},
		},
		{
			id: 36,
			name: 'Lumbar Spine',
			bodyPartKey: null,
			type: 'rangeOfMotion',
			location: null,
			has_comments: 0,
			motion: {
				id: 7,
				hasOrientation: 0,
				bodyPartId: 36,
				body_part_id: null,
			},
		},
		{
			id: 37,
			name: 'Knee',
			bodyPartKey: null,
			type: 'rangeOfMotion',
			location: null,
			has_comments: 0,
			motion: {
				id: 8,
				hasOrientation: 1,
				bodyPartId: 37,
				body_part_id: null,
			},
		},
		{
			id: 38,
			name: 'Ankle',
			bodyPartKey: null,
			type: 'rangeOfMotion',
			location: null,
			has_comments: 0,
			motion: {
				id: 9,
				hasOrientation: 1,
				bodyPartId: 38,
				body_part_id: null,
			},
		},
		{
			id: 39,
			name: 'Cervical Spine',
			bodyPartKey: null,
			type: 'ultrasound',
			location: 0,
			has_comments: 0,
		},
		{
			id: 40,
			name: 'Thoracic Spine',
			bodyPartKey: null,
			type: 'ultrasound',
			location: 0,
			has_comments: 0,
		},
		{
			id: 41,
			name: 'Lumbar Spine',
			bodyPartKey: null,
			type: 'ultrasound',
			location: 0,
			has_comments: 0,
		},
		{
			id: 42,
			name: 'Shoulder',
			bodyPartKey: null,
			type: 'ultrasound',
			location: 1,
			has_comments: 0,
		},
		{
			id: 43,
			name: 'Elbow',
			bodyPartKey: null,
			type: 'ultrasound',
			location: 1,
			has_comments: 0,
		},
		{
			id: 44,
			name: 'Hand/Wrist',
			bodyPartKey: null,
			type: 'ultrasound',
			location: 1,
			has_comments: 0,
		},
		{
			id: 45,
			name: 'Hip/Groin',
			bodyPartKey: null,
			type: 'ultrasound',
			location: 1,
			has_comments: 0,
		},
		{
			id: 46,
			name: 'Knee',
			bodyPartKey: null,
			type: 'ultrasound',
			location: 1,
			has_comments: 0,
		},
		{
			id: 47,
			name: 'Ankle',
			bodyPartKey: null,
			type: 'ultrasound',
			location: 1,
			has_comments: 0,
		},
		{
			id: 48,
			name: 'Cervical Spine',
			bodyPartKey: null,
			type: 'coldTharapy',
			location: 0,
			has_comments: 0,
		},
		{
			id: 49,
			name: 'Thoracic Spine',
			bodyPartKey: null,
			type: 'coldTharapy',
			location: 0,
			has_comments: 0,
		},
		{
			id: 50,
			name: 'Lumbar Spine',
			bodyPartKey: null,
			type: 'coldTharapy',
			location: 0,
			has_comments: 0,
		},
		{
			id: 51,
			name: 'Shoulder',
			bodyPartKey: null,
			type: 'coldTharapy',
			location: 1,
			has_comments: 0,
		},
		{
			id: 52,
			name: 'Elbow',
			bodyPartKey: null,
			type: 'coldTharapy',
			location: 1,
			has_comments: 0,
		},
		{
			id: 53,
			name: 'Hand/Wrist',
			bodyPartKey: null,
			type: 'coldTharapy',
			location: 1,
			has_comments: 0,
		},
		{
			id: 54,
			name: 'Hip/Groin',
			bodyPartKey: null,
			type: 'coldTharapy',
			location: 1,
			has_comments: 0,
		},
		{
			id: 55,
			name: 'Knee',
			bodyPartKey: null,
			type: 'coldTharapy',
			location: 1,
			has_comments: 0,
		},
		{
			id: 56,
			name: 'Ankle',
			bodyPartKey: null,
			type: 'coldTharapy',
			location: 1,
			has_comments: 0,
		},
	],
	bodyPartSensations: [
		{
			id: 1,
			sensation: 'Tingling',
			bodyPartId: 1,
			body_part_id: 1,
		},
		{
			id: 2,
			sensation: 'Numbness',
			bodyPartId: 1,
			body_part_id: 1,
		},
		{
			id: 3,
			sensation: 'Tingling',
			bodyPartId: 2,
			body_part_id: 2,
		},
		{
			id: 4,
			sensation: 'Numbness',
			bodyPartId: 2,
			body_part_id: 2,
		},
		{
			id: 5,
			sensation: 'Tingling',
			bodyPartId: 4,
			body_part_id: 4,
		},
		{
			id: 6,
			sensation: 'Numbness',
			bodyPartId: 4,
			body_part_id: 4,
		},
		{
			id: 7,
			sensation: 'Tingling',
			bodyPartId: 3,
			body_part_id: 3,
		},
		{
			id: 8,
			sensation: 'Numbness',
			bodyPartId: 3,
			body_part_id: 3,
		},
		{
			id: 9,
			sensation: 'Tingling',
			bodyPartId: 5,
			body_part_id: 5,
		},
		{
			id: 10,
			sensation: 'Numbness',
			bodyPartId: 5,
			body_part_id: 5,
		},
	],
	bodyPartConditions: [
		{
			id: 1,
			condition: 'Normocephalic',
			bodyPartId: 8,
			body_part_id: 8,
			conditionStates: [],
		},
		{
			id: 2,
			condition: 'Atraumatic',
			bodyPartId: 8,
			body_part_id: 8,
			conditionStates: [],
		},
		{
			id: 3,
			condition: 'Pupils are equally round and reactive to light and accommodation',
			bodyPartId: 9,
			body_part_id: 9,
			conditionStates: [],
		},
		{
			id: 4,
			condition: 'Extraocular Muscles are intact',
			bodyPartId: 9,
			body_part_id: 9,
			conditionStates: [],
		},
		{
			id: 5,
			condition: 'There are no deformities',
			bodyPartId: 10,
			body_part_id: 10,
			conditionStates: [
				{
					id: 1,
					state: 'negative tenderness to palpation',
					bodyPartConditionId: 5,
					body_part_condition_id: 5,
				},
				{
					id: 2,
					state: 'positive tenderness to palpation',
					bodyPartConditionId: 5,
					body_part_condition_id: 5,
				},
			],
		},
		{
			id: 6,
			condition: 'Regular rate & rhythm',
			bodyPartId: 11,
			body_part_id: 11,
			conditionStates: [],
		},
		{
			id: 7,
			condition: 'Normal S1 & S2',
			bodyPartId: 11,
			body_part_id: 11,
			conditionStates: [],
		},
		{
			id: 8,
			condition: 'Clear to auscultation bilaterally',
			bodyPartId: 12,
			body_part_id: 12,
			conditionStates: [],
		},
		{
			id: 9,
			condition: 'Soft and nontender with normoactive bowel sounds present',
			bodyPartId: 13,
			body_part_id: 13,
			conditionStates: [],
		},
		{
			id: 10,
			condition: 'Back exhibited',
			bodyPartId: 14,
			body_part_id: 14,
			conditionStates: [
				{
					id: 3,
					state: 'normal lumbar lordosis',
					bodyPartConditionId: 10,
					body_part_condition_id: 10,
				},
				{
					id: 4,
					state: 'increased lumbar lordosis',
					bodyPartConditionId: 10,
					body_part_condition_id: 10,
				},
			],
		},
		{
			id: 11,
			condition: 'There is no edema noted',
			bodyPartId: 15,
			body_part_id: 15,
			conditionStates: [],
		},
		{
			id: 12,
			condition: 'Pulses are 2+ throughout',
			bodyPartId: 15,
			body_part_id: 15,
			conditionStates: [],
		},
	],
	bodyPartFeelings: [
		{
			id: 1,
			bodyPartId: 1,
			feeling: 'Sharp',
			body_part_id: null,
		},
		{
			id: 2,
			bodyPartId: 1,
			feeling: 'Stabbing',
			body_part_id: null,
		},
		{
			id: 3,
			bodyPartId: 1,
			feeling: 'Burning',
			body_part_id: null,
		},
		{
			id: 4,
			bodyPartId: 1,
			feeling: 'Dull',
			body_part_id: null,
		},
		{
			id: 5,
			bodyPartId: 1,
			feeling: 'Achy',
			body_part_id: null,
		},
		{
			id: 6,
			bodyPartId: 1,
			feeling: 'Throbbing',
			body_part_id: null,
		},
		{
			id: 7,
			bodyPartId: 1,
			feeling: 'Shooting',
			body_part_id: null,
		},
		{
			id: 8,
			bodyPartId: 2,
			feeling: 'Sharp',
			body_part_id: null,
		},
		{
			id: 9,
			bodyPartId: 2,
			feeling: 'Stabbing',
			body_part_id: null,
		},
		{
			id: 10,
			bodyPartId: 2,
			feeling: 'Burning',
			body_part_id: null,
		},
		{
			id: 11,
			bodyPartId: 2,
			feeling: 'Dull',
			body_part_id: null,
		},
		{
			id: 12,
			bodyPartId: 2,
			feeling: 'Achy',
			body_part_id: null,
		},
		{
			id: 13,
			bodyPartId: 2,
			feeling: 'Throbbing',
			body_part_id: null,
		},
		{
			id: 14,
			bodyPartId: 2,
			feeling: 'Shooting',
			body_part_id: null,
		},
		{
			id: 15,
			bodyPartId: 4,
			feeling: 'Sharp',
			body_part_id: null,
		},
		{
			id: 16,
			bodyPartId: 4,
			feeling: 'Stabbing',
			body_part_id: null,
		},
		{
			id: 17,
			bodyPartId: 4,
			feeling: 'Burning',
			body_part_id: null,
		},
		{
			id: 18,
			bodyPartId: 4,
			feeling: 'Dull',
			body_part_id: null,
		},
		{
			id: 19,
			bodyPartId: 4,
			feeling: 'Achy',
			body_part_id: null,
		},
		{
			id: 20,
			bodyPartId: 4,
			feeling: 'Throbbing',
			body_part_id: null,
		},
		{
			id: 21,
			bodyPartId: 4,
			feeling: 'Shooting',
			body_part_id: null,
		},
		{
			id: 22,
			bodyPartId: 3,
			feeling: 'Sharp',
			body_part_id: null,
		},
		{
			id: 23,
			bodyPartId: 3,
			feeling: 'Stabbing',
			body_part_id: null,
		},
		{
			id: 24,
			bodyPartId: 3,
			feeling: 'Burning',
			body_part_id: null,
		},
		{
			id: 25,
			bodyPartId: 3,
			feeling: 'Dull',
			body_part_id: null,
		},
		{
			id: 26,
			bodyPartId: 3,
			feeling: 'Achy',
			body_part_id: null,
		},
		{
			id: 27,
			bodyPartId: 3,
			feeling: 'Throbbing',
			body_part_id: null,
		},
		{
			id: 28,
			bodyPartId: 3,
			feeling: 'Shooting',
			body_part_id: null,
		},
		{
			id: 29,
			bodyPartId: 5,
			feeling: 'Sharp',
			body_part_id: null,
		},
		{
			id: 30,
			bodyPartId: 5,
			feeling: 'Stabbing',
			body_part_id: null,
		},
		{
			id: 31,
			bodyPartId: 5,
			feeling: 'Burning',
			body_part_id: null,
		},
		{
			id: 32,
			bodyPartId: 5,
			feeling: 'Dull',
			body_part_id: null,
		},
		{
			id: 33,
			bodyPartId: 5,
			feeling: 'Achy',
			body_part_id: null,
		},
		{
			id: 34,
			bodyPartId: 5,
			feeling: 'Throbbing',
			body_part_id: null,
		},
		{
			id: 35,
			bodyPartId: 5,
			feeling: 'Shooting',
			body_part_id: null,
		},
	],
	diseases: [
		{
			id: 1,
			disease: 'Diabetes',
		},
		{
			id: 2,
			disease: 'Seizures',
		},
		{
			id: 3,
			disease: 'Thyroid Disorder',
		},
		{
			id: 4,
			disease: 'Bleeding Disorder',
		},
		{
			id: 5,
			disease: 'Hiatal Hernia',
		},
		{
			id: 6,
			disease: 'Osteoporosis',
		},
		{
			id: 7,
			disease: 'Dyslipidemia',
		},
		{
			id: 8,
			disease: 'High Blood Pressure',
		},
		{
			id: 9,
			disease: 'Stroke/TIA’s',
		},
		{
			id: 10,
			disease: 'Mitral Valve Prolapse',
		},
		{
			id: 11,
			disease: 'Ulcers',
		},
		{
			id: 12,
			disease: 'Cirrhosis',
		},
		{
			id: 13,
			disease: 'Depression/Anxiety',
		},
		{
			id: 14,
			disease: 'Angina/Chest Pain',
		},
		{
			id: 15,
			disease: 'Asthma',
		},
		{
			id: 16,
			disease: 'Angioplasty',
		},
		{
			id: 17,
			disease: 'Circulation Disorder',
		},
		{
			id: 18,
			disease: 'Back Pain',
		},
		{
			id: 19,
			disease: 'DVT/PE',
		},
		{
			id: 20,
			disease: 'Heart Attack',
		},
		{
			id: 21,
			disease: 'Hepatitis',
		},
		{
			id: 22,
			disease: 'Kidney Disorder ',
		},
		{
			id: 23,
			disease: 'Anemia',
		},
		{
			id: 24,
			disease: 'Arthritis',
		},
		{
			id: 25,
			disease: 'Cancer',
		},
	],
	bodyPartMovements: [
		{
			id: 1,
			movement: 'Flexion',
			normalROM: 60,
			bodyPartId: 16,
			body_part_id: 16,
		},
		{
			id: 2,
			movement: 'Extension',
			normalROM: 50,
			bodyPartId: 16,
			body_part_id: 16,
		},
		{
			id: 3,
			movement: 'Left Rotation',
			normalROM: 80,
			bodyPartId: 16,
			body_part_id: 16,
		},
		{
			id: 4,
			movement: 'Right Rotation',
			normalROM: 80,
			bodyPartId: 16,
			body_part_id: 16,
		},
		{
			id: 5,
			movement: 'LT Lateral Flexion',
			normalROM: 40,
			bodyPartId: 16,
			body_part_id: 16,
		},
		{
			id: 6,
			movement: 'RT Lateral Flexion',
			normalROM: 40,
			bodyPartId: 16,
			body_part_id: 16,
		},
		{
			id: 7,
			movement: 'Flexion',
			normalROM: 90,
			bodyPartId: 18,
			body_part_id: 18,
		},
		{
			id: 8,
			movement: 'Extension',
			normalROM: 25,
			bodyPartId: 18,
			body_part_id: 18,
		},
		{
			id: 9,
			movement: 'Left Rotation',
			normalROM: 40,
			bodyPartId: 18,
			body_part_id: 18,
		},
		{
			id: 10,
			movement: 'Right Rotation',
			normalROM: 40,
			bodyPartId: 18,
			body_part_id: 18,
		},
		{
			id: 11,
			movement: 'LT Lateral Flexion',
			normalROM: 25,
			bodyPartId: 18,
			body_part_id: 18,
		},
		{
			id: 12,
			movement: 'RT Lateral Flexion',
			normalROM: 25,
			bodyPartId: 18,
			body_part_id: 18,
		},
		{
			id: 13,
			movement: 'Flexion',
			normalROM: 150,
			bodyPartId: 20,
			body_part_id: 20,
		},
		{
			id: 14,
			movement: 'Extension',
			normalROM: 0,
			bodyPartId: 20,
			body_part_id: 20,
		},
		{
			id: 15,
			movement: 'Full supination',
			normalROM: 90,
			bodyPartId: 20,
			body_part_id: 20,
		},
		{
			id: 16,
			movement: 'Full pronation',
			normalROM: 90,
			bodyPartId: 20,
			body_part_id: 20,
		},
		{
			id: 17,
			movement: 'Dorsiflexion',
			normalROM: 70,
			bodyPartId: 21,
			body_part_id: 21,
		},
		{
			id: 18,
			movement: 'Plantar flexion',
			normalROM: 80,
			bodyPartId: 21,
			body_part_id: 21,
		},
		{
			id: 19,
			movement: 'Dinar flexion',
			normalROM: 30,
			bodyPartId: 21,
			body_part_id: 21,
		},
		{
			id: 20,
			movement: 'Radial flexion',
			normalROM: 20,
			bodyPartId: 21,
			body_part_id: 21,
		},
		{
			id: 21,
			movement: 'Flexion',
			normalROM: 180,
			bodyPartId: 19,
			body_part_id: 19,
		},
		{
			id: 22,
			movement: 'Extension',
			normalROM: 50,
			bodyPartId: 19,
			body_part_id: 19,
		},
		{
			id: 23,
			movement: 'Abduction',
			normalROM: 180,
			bodyPartId: 19,
			body_part_id: 19,
		},
		{
			id: 24,
			movement: 'Adduction',
			normalROM: 50,
			bodyPartId: 19,
			body_part_id: 19,
		},
		{
			id: 25,
			movement: 'Internal rotation',
			normalROM: 70,
			bodyPartId: 19,
			body_part_id: 19,
		},
		{
			id: 26,
			movement: 'External rotation',
			normalROM: 90,
			bodyPartId: 19,
			body_part_id: 19,
		},
		{
			id: 27,
			movement: 'Flexion',
			normalROM: 120,
			bodyPartId: 22,
			body_part_id: 22,
		},
		{
			id: 28,
			movement: 'Extension',
			normalROM: 30,
			bodyPartId: 22,
			body_part_id: 22,
		},
		{
			id: 29,
			movement: 'Abduction',
			normalROM: 40,
			bodyPartId: 22,
			body_part_id: 22,
		},
		{
			id: 30,
			movement: 'Adduction',
			normalROM: 30,
			bodyPartId: 22,
			body_part_id: 22,
		},
		{
			id: 31,
			movement: 'Internal rotation',
			normalROM: 45,
			bodyPartId: 22,
			body_part_id: 22,
		},
		{
			id: 32,
			movement: 'External rotation',
			normalROM: 45,
			bodyPartId: 22,
			body_part_id: 22,
		},
		{
			id: 33,
			movement: 'Flexion',
			normalROM: 135,
			bodyPartId: 23,
			body_part_id: 23,
		},
		{
			id: 34,
			movement: 'Extension',
			normalROM: 0,
			bodyPartId: 23,
			body_part_id: 23,
		},
		{
			id: 35,
			movement: 'Dorsiflexion',
			normalROM: 20,
			bodyPartId: 24,
			body_part_id: 24,
		},
		{
			id: 36,
			movement: 'Plantar flexion',
			normalROM: 40,
			bodyPartId: 24,
			body_part_id: 24,
		},
		{
			id: 37,
			movement: 'Inversion',
			normalROM: 30,
			bodyPartId: 24,
			body_part_id: 24,
		},
		{
			id: 38,
			movement: 'Eversion',
			normalROM: 20,
			bodyPartId: 24,
			body_part_id: 24,
		},
	],
	subBodyParts: [
		{
			id: 1,
			name: 'Arm',
			bodyPartId: 6,
			body_part_id: 6,
		},
		{
			id: 2,
			name: 'Elbow',
			bodyPartId: 6,
			body_part_id: 6,
		},
		{
			id: 3,
			name: 'Forearm',
			bodyPartId: 6,
			body_part_id: 6,
		},
		{
			id: 4,
			name: 'Wrist',
			bodyPartId: 6,
			body_part_id: 6,
		},
		{
			id: 5,
			name: 'Hand',
			bodyPartId: 6,
			body_part_id: 6,
		},
		{
			id: 6,
			name: 'Leg',
			bodyPartId: 7,
			body_part_id: 7,
		},
		{
			id: 7,
			name: 'Ankle',
			bodyPartId: 7,
			body_part_id: 7,
		},
		{
			id: 8,
			name: 'Foot',
			bodyPartId: 7,
			body_part_id: 7,
		},
	],
	allergies: [
		{
			id: 1,
			allergy: 'NKDA',
		},
		{
			id: 2,
			allergy: 'Novocaine',
		},
		{
			id: 3,
			allergy: 'Penicillin',
		},
		{
			id: 4,
			allergy: 'Iodine',
		},
		{
			id: 5,
			allergy: 'Aspirin',
		},
		{
			id: 6,
			allergy: 'Tape',
		},
		{
			id: 7,
			allergy: 'Codeine',
		},
	],
	radiologies: [
		{
			id: 1,
			section: 'Skeletal',
			name: 'Skull',
			hasLeft: 0,
			hasRight: 0,
			parentId: 0,
		},
		{
			id: 2,
			section: 'Skeletal',
			name: 'Cervical Spine',
			hasLeft: 0,
			hasRight: 0,
			parentId: 0,
		},
		{
			id: 3,
			section: 'Skeletal',
			name: 'Thoracic Spine',
			hasLeft: 0,
			hasRight: 0,
			parentId: 0,
		},
		{
			id: 4,
			section: 'Skeletal',
			name: 'Lumbar Spine',
			hasLeft: 0,
			hasRight: 0,
			parentId: 0,
		},
		{
			id: 5,
			section: 'Skeletal',
			name: 'Pelvis',
			hasLeft: 0,
			hasRight: 0,
			parentId: 0,
		},
		{
			id: 6,
			section: 'Skeletal',
			name: 'Sacrum/Coccyx',
			hasLeft: 0,
			hasRight: 0,
			parentId: 5,
		},
		{
			id: 7,
			section: 'Extremities',
			name: 'Clavicle',
			hasLeft: 1,
			hasRight: 1,
			parentId: 0,
		},
		{
			id: 8,
			section: 'Extremities',
			name: 'Shoulder',
			hasLeft: 1,
			hasRight: 1,
			parentId: 0,
		},
		{
			id: 9,
			section: 'Extremities',
			name: 'Arm',
			hasLeft: 1,
			hasRight: 1,
			parentId: 0,
		},
		{
			id: 10,
			section: 'Extremities',
			name: 'Elbow',
			hasLeft: 1,
			hasRight: 1,
			parentId: 0,
		},
		{
			id: 11,
			section: 'Extremities',
			name: 'Forearm',
			hasLeft: 1,
			hasRight: 1,
			parentId: 0,
		},
		{
			id: 12,
			section: 'Extremities',
			name: 'Wrist',
			hasLeft: 1,
			hasRight: 1,
			parentId: 0,
		},
		{
			id: 13,
			section: 'Extremities',
			name: 'Hand',
			hasLeft: 1,
			hasRight: 1,
			parentId: 0,
		},
		{
			id: 14,
			section: 'Extremities',
			name: 'Hip',
			hasLeft: 1,
			hasRight: 1,
			parentId: 0,
		},
		{
			id: 15,
			section: 'Extremities',
			name: 'Femur',
			hasLeft: 1,
			hasRight: 1,
			parentId: 0,
		},
		{
			id: 16,
			section: 'Extremities',
			name: 'Knee',
			hasLeft: 1,
			hasRight: 1,
			parentId: 0,
		},
		{
			id: 17,
			section: 'Extremities',
			name: 'Tibia/Fibula',
			hasLeft: 1,
			hasRight: 1,
			parentId: 0,
		},
		{
			id: 18,
			section: 'Extremities',
			name: 'Foot',
			hasLeft: 1,
			hasRight: 1,
			parentId: 0,
		},
		{
			id: 19,
			section: 'ENT',
			name: 'Paranasal Sinuses',
			hasLeft: 0,
			hasRight: 0,
			parentId: 0,
		},
		{
			id: 20,
			section: 'ENT',
			name: 'Nasopharynx',
			hasLeft: 0,
			hasRight: 0,
			parentId: 0,
		},
		{
			id: 21,
			section: 'ENT',
			name: 'Facial Bones',
			hasLeft: 0,
			hasRight: 0,
			parentId: 0,
		},
		{
			id: 22,
			section: 'ENT',
			name: 'Neck Soft Tissue',
			hasLeft: 0,
			hasRight: 0,
			parentId: 0,
		},
		{
			id: 23,
			section: 'ENT',
			name: 'Nasal Bones',
			hasLeft: 0,
			hasRight: 0,
			parentId: 0,
		},
		{
			id: 24,
			section: 'Abdomen',
			name: 'KUB',
			hasLeft: 0,
			hasRight: 0,
			parentId: 0,
		},
		{
			id: 25,
			section: 'Abdomen',
			name: 'Flat/Erect',
			hasLeft: 0,
			hasRight: 0,
			parentId: 0,
		},
		{
			id: 26,
			section: 'Abdomen',
			name: 'IVP',
			hasLeft: 0,
			hasRight: 0,
			parentId: 0,
		},
		{
			id: 27,
			section: 'Abdomen',
			name: 'Other',
			hasLeft: 0,
			hasRight: 0,
			parentId: 0,
		},
		{
			id: 28,
			section: 'Chest',
			name: 'Pa/Lat',
			hasLeft: 0,
			hasRight: 0,
			parentId: 0,
		},
		{
			id: 29,
			section: 'Chest',
			name: 'Ribs',
			hasLeft: 0,
			hasRight: 0,
			parentId: 0,
		},
		{
			id: 30,
			section: '',
			name: 'Rule out Fracture',
			hasLeft: 0,
			hasRight: 0,
			parentId: 0,
		},
		{
			id: 31,
			section: '',
			name: 'Rule out Osseous pathology',
			hasLeft: 0,
			hasRight: 0,
			parentId: 0,
		},
	],
	ctScans: [
		{
			id: 1,
			section: '',
			name: 'Brain',
			hasLeft: 0,
			hasRight: 0,
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 2,
			section: '',
			name: 'Pituitary',
			hasLeft: 0,
			hasRight: 0,
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 3,
			section: '',
			name: 'Orbits',
			hasLeft: 0,
			hasRight: 0,
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 4,
			section: '',
			name: 'Sinuses',
			hasLeft: 0,
			hasRight: 0,
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 5,
			section: '',
			name: 'Neck Soft Tissue',
			hasLeft: 0,
			hasRight: 0,
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 6,
			section: '',
			name: 'Chest',
			hasLeft: 0,
			hasRight: 0,
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 7,
			section: '',
			name: 'Pelvis',
			hasLeft: 0,
			hasRight: 0,
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 8,
			section: '',
			name: 'Hip',
			hasLeft: 1,
			hasRight: 1,
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 9,
			section: '',
			name: 'Cervical Spine',
			hasLeft: 0,
			hasRight: 0,
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 10,
			section: '',
			name: 'Thoracic Spine',
			hasLeft: 0,
			hasRight: 0,
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 11,
			section: '',
			name: 'Lumbar Spine',
			hasLeft: 0,
			hasRight: 0,
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 12,
			section: '',
			name: 'With Multi-Planner Reconstruction Unless Checked',
			hasLeft: 0,
			hasRight: 0,
			with: 0,
			withOut: 0,
			parentId: 0,
		},
		{
			id: 13,
			section: '',
			name: 'Other',
			hasLeft: 0,
			hasRight: 0,
			with: 0,
			withOut: 0,
			parentId: 0,
		},
	],
	mammographies: [
		{
			id: 1,
			section: '',
			name: 'Annual Screening',
			hasLeft: 0,
			hasRight: 0,
			parentId: 0,
		},
		{
			id: 2,
			section: '',
			name: 'Bilateral Diagnostic',
			hasLeft: 0,
			hasRight: 0,
			parentId: 0,
		},
		{
			id: 3,
			section: '',
			name: 'Unilateral Diagnostic',
			hasLeft: 0,
			hasRight: 0,
			parentId: 0,
		},
		{
			id: 4,
			section: '',
			name: 'Stereotactic Localization',
			hasLeft: 0,
			hasRight: 0,
			parentId: 0,
		},
		{
			id: 5,
			section: '',
			name: 'Mammographic Localization',
			hasLeft: 0,
			hasRight: 0,
			parentId: 0,
		},
		{
			id: 6,
			section: '',
			name: 'Spot Compression',
			hasLeft: 0,
			hasRight: 0,
			parentId: 0,
		},
		{
			id: 7,
			section: '',
			name: 'Magnification Views',
			hasLeft: 0,
			hasRight: 0,
			parentId: 0,
		},
		{
			id: 8,
			section: '',
			name: 'Implants',
			hasLeft: 0,
			hasRight: 0,
			parentId: 7,
		},
		{
			id: 9,
			section: '',
			name: 'Breast MRI',
			hasLeft: 1,
			hasRight: 1,
			parentId: 0,
		},
		{
			id: 10,
			section: '',
			name: 'Breast Sono',
			hasLeft: 1,
			hasRight: 1,
			parentId: 0,
		},
	],
	mrAngiographies: [
		{
			id: 1,
			section: '',
			name: 'Brain',
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 2,
			section: '',
			name: 'Neck',
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 3,
			section: '',
			name: 'Thoracic Aorta',
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 4,
			section: '',
			name: 'Abdominal Aorta',
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 5,
			section: '',
			name: 'Renal',
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 6,
			section: '',
			name: 'Upper Extremity',
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 7,
			section: '',
			name: 'Lower Extremity',
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 8,
			section: '',
			name: 'w/3D',
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 9,
			section: '',
			name: 'Other',
			with: 0,
			withOut: 0,
			parentId: 0,
		},
	],
	ctaAngiographies: [
		{
			id: 1,
			section: '',
			name: 'Head Intracranial Vessels',
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 2,
			section: '',
			name: 'Neck Carotid Arteries',
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 3,
			section: '',
			name: 'Chest',
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 4,
			section: '',
			name: 'Abdominal Aorta',
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 5,
			section: '',
			name: 'Pelvis',
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 6,
			section: '',
			name: 'Upper Extremity',
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 7,
			section: '',
			name: 'Lower Extremity',
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 8,
			section: '',
			name: 'Aorto-Iliofemoral Runoff',
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 9,
			section: '',
			name: 'With Multi-Planner Reconstruction Unless Checked',
			with: 0,
			withOut: 0,
			parentId: 0,
		},
		{
			id: 10,
			section: '',
			name: 'Other',
			with: 0,
			withOut: 0,
			parentId: 0,
		},
	],
	mris: [
		{
			id: 1,
			section: 'Brain/Head',
			name: 'Brain',
			hasLeft: 0,
			hasRight: 0,
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 2,
			section: 'Brain/Head',
			name: 'Pituitary',
			hasLeft: 0,
			hasRight: 0,
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 3,
			section: 'Brain/Head',
			name: 'IACs',
			hasLeft: 0,
			hasRight: 0,
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 4,
			section: 'Brain/Head',
			name: 'Orbits',
			hasLeft: 0,
			hasRight: 0,
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 5,
			section: 'Brain/Head',
			name: 'Sinuses',
			hasLeft: 0,
			hasRight: 0,
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 6,
			section: 'Brain/Head',
			name: 'TMJ',
			hasLeft: 1,
			hasRight: 1,
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 7,
			section: 'Brain/Head',
			name: 'Neck Soft Tissue',
			hasLeft: 0,
			hasRight: 0,
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 8,
			section: 'Spine',
			name: 'Cervical Spine',
			hasLeft: 0,
			hasRight: 0,
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 9,
			section: 'Spine',
			name: 'Thoracic Spine',
			hasLeft: 0,
			hasRight: 0,
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 10,
			section: 'Spine',
			name: 'Lumbar Spine',
			hasLeft: 0,
			hasRight: 0,
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 11,
			section: 'Body',
			name: 'Chest',
			hasLeft: 0,
			hasRight: 0,
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 12,
			section: 'Body',
			name: 'Abdomen',
			hasLeft: 0,
			hasRight: 0,
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 13,
			section: 'Body',
			name: 'Pelvis',
			hasLeft: 0,
			hasRight: 0,
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 14,
			section: 'Extremities',
			name: 'Shoulder',
			hasLeft: 1,
			hasRight: 1,
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 15,
			section: 'Extremities',
			name: 'Elbow',
			hasLeft: 1,
			hasRight: 1,
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 16,
			section: 'Extremities',
			name: 'Wrist',
			hasLeft: 1,
			hasRight: 1,
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 17,
			section: 'Extremities',
			name: 'Hand',
			hasLeft: 1,
			hasRight: 1,
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 18,
			section: 'Extremities',
			name: 'Hip',
			hasLeft: 1,
			hasRight: 1,
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 19,
			section: 'Extremities',
			name: 'Knee',
			hasLeft: 1,
			hasRight: 1,
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 20,
			section: 'Extremities',
			name: 'Ankle',
			hasLeft: 1,
			hasRight: 1,
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 21,
			section: 'Extremities',
			name: 'Foot',
			hasLeft: 1,
			hasRight: 1,
			with: 1,
			withOut: 1,
			parentId: 0,
		},
		{
			id: 22,
			section: 'Extremities',
			name: 'Other',
			hasLeft: 1,
			hasRight: 1,
			with: 1,
			withOut: 1,
			parentId: 0,
		},
	],
	ultrasounds: [
		{
			id: 1,
			section: '',
			name: 'Thyroid',
			parentId: 0,
		},
		{
			id: 2,
			section: '',
			name: 'Abdomen/Liver',
			parentId: 0,
		},
		{
			id: 3,
			section: '',
			name: 'Carotid Duplex',
			parentId: 0,
		},
		{
			id: 4,
			section: '',
			name: 'Venous Doppler',
			parentId: 0,
		},
		{
			id: 5,
			section: '',
			name: 'Aorta/Kidney',
			parentId: 0,
		},
		{
			id: 6,
			section: '',
			name: 'Pregnancy Evaluation',
			parentId: 0,
		},
		{
			id: 7,
			section: '',
			name: 'After 1st Tri',
			parentId: 6,
		},
		{
			id: 8,
			section: '',
			name: 'Pelvis',
			parentId: 0,
		},
		{
			id: 9,
			section: '',
			name: 'Testicular',
			parentId: 0,
		},
		{
			id: 10,
			section: '',
			name: 'Breast',
			parentId: 0,
		},
		{
			id: 11,
			section: '',
			name: 'Other',
			parentId: 0,
		},
	],
	dexa: [
		{
			id: 1,
			section: '',
			name: 'Baseline',
			parentId: 0,
		},
		{
			id: 2,
			section: '',
			name: 'Follow-Up',
			parentId: 0,
		},
	],
	drugs: [],
	goals: [
		{
			id: 1,
			name: 'Decrease Pain',
		},
		{
			id: 2,
			name: 'Decrease Swelling',
		},
		{
			id: 3,
			name: 'Improve Mobility/ROM',
		},
		{
			id: 4,
			name: 'Improve Function',
		},
		{
			id: 5,
			name: 'Increase Strength',
		},
	],
	modalities: [
		{
			id: 1,
			name: 'Us',
		},
		{
			id: 2,
			name: 'Tens',
		},
		{
			id: 3,
			name: 'Paraffin Bath',
		},
		{
			id: 4,
			name: 'Taping',
		},
		{
			id: 5,
			name: 'Moist Heat',
		},
		{
			id: 6,
			name: 'Ice',
		},
		{
			id: 7,
			name: 'Electrical Stimulation',
		},
		{
			id: 8,
			name: 'Traction  ',
		},
		{
			id: 9,
			name: 'Interferential',
		},
		{
			id: 10,
			name: "At The Therapist's Discretion",
		},
	],
	excercises: [
		{
			id: 1,
			name: 'Rom',
		},
		{
			id: 2,
			name: 'Isometrics',
		},
		{
			id: 3,
			name: 'Mckenzie Extension Exercise',
		},
		{
			id: 4,
			name: 'Biomechanics Training',
		},
		{
			id: 5,
			name: 'Baps/Balance Exercise/Trianing',
		},
		{
			id: 6,
			name: 'Strengthening Exercise',
		},
		{
			id: 7,
			name: 'Therapeutic Exercises',
		},
		{
			id: 8,
			name: 'Gait Training/Ambulation',
		},
		{
			id: 9,
			name: 'Plyometrics',
		},
		{
			id: 10,
			name: 'Neuromuscular Re Education',
		},
		{
			id: 11,
			name: 'Stretching (Functional)',
		},
		{
			id: 12,
			name: 'Home Exercise Program',
		},
		{
			id: 13,
			name: 'Postural Correction Exercise',
		},
		{
			id: 14,
			name: 'Williams Flexion Exercise',
		},
		{
			id: 15,
			name: 'Pnf',
		},
		{
			id: 16,
			name: 'Proprioception Training Exercise',
		},
		{
			id: 17,
			name: 'Endurance Exercise',
		},
		{
			id: 18,
			name: 'Home Safety Evaluation',
		},
		{
			id: 19,
			name: 'Home Equipment Modification',
		},
		{
			id: 20,
			name: 'Assessment & Trainging',
		},
		{
			id: 21,
			name: 'Transfer / Community Training',
		},
		{
			id: 22,
			name: 'Orthotics Fit Training',
		},
		{
			id: 23,
			name: 'Self Care/Home Management',
		},
		{
			id: 24,
			name: 'Flexibility Exercise',
		},
		{
			id: 25,
			name: 'Met (Muscle Energy Techniques)',
		},
	],
	tharapies: [
		{
			id: 1,
			name: 'Gentle Massage/Soft Tissue',
		},
		{
			id: 2,
			name: 'Myofacial Release',
		},
		{
			id: 3,
			name: 'Joint Mobilization',
		},
		{
			id: 4,
			name: 'Joint/Spinal Isometric Stabilization ',
		},
		{
			id: 5,
			name: 'Cervical',
		},
		{
			id: 6,
			name: 'Lumber',
		},
	],
	referrals: [
		{
			id: 1,
			name: 'Physical Therapy',
		},
		{
			id: 2,
			name: 'Occupational',
		},
		{
			id: 3,
			name: 'Chiropractor',
		},
	],
	devices: [
		{
			id: 1,
			name: 'Lumbar cushion',
			location: false,
			lengths_of_need: null,
			usage: null,
			bodyParts: null,
		},
		{
			id: 2,
			name: 'Knee Brace',
			location: true,
			lengths_of_need: null,
			usage: null,
			bodyParts: null,
		},
		{
			id: 3,
			name: 'Cervical pillow',
			location: false,
			lengths_of_need: null,
			usage: null,
			bodyParts: null,
		},
		{
			id: 4,
			name: 'LSO',
			location: false,
			lengths_of_need: null,
			usage: null,
			bodyParts: null,
		},
		{
			id: 5,
			name: 'Wrist Brace',
			location: true,
			lengths_of_need: null,
			usage: null,
			bodyParts: null,
		},
		{
			id: 6,
			name: 'Cervical collar',
			location: false,
			lengths_of_need: null,
			usage: null,
			bodyParts: null,
		},
		{
			id: 7,
			name: 'Elbow Brace',
			location: true,
			lengths_of_need: null,
			usage: null,
			bodyParts: null,
		},
		{
			id: 8,
			name: 'Ankle Brace',
			location: true,
			lengths_of_need: null,
			usage: null,
			bodyParts: null,
		},
		{
			id: 9,
			name: 'Hot/cold pack',
			location: false,
			lengths_of_need: null,
			usage: null,
			bodyParts: null,
		},
		{
			id: 10,
			name: 'Cane',
			location: false,
			lengths_of_need: null,
			usage: null,
			bodyParts: null,
		},
		{
			id: 11,
			name: 'Ultrasound unit',
			location: false,
			lengths_of_need: [28, 42, 56],
			usage: ['use_in_control_unit', 'time', 'hour'],
			bodyParts: [
				{
					id: 37,
					name: 'Cervical Spine',
					bodyPartKey: null,
					type: 'ultrasound',
					has_comments: 0,
					hasLocation: false,
				},
				{
					id: 38,
					name: 'Thoracic Spine',
					bodyPartKey: null,
					type: 'ultrasound',
					has_comments: 0,
					hasLocation: false,
				},
				{
					id: 39,
					name: 'Lumbar Spine',
					bodyPartKey: null,
					type: 'ultrasound',
					has_comments: 0,
					hasLocation: false,
				},
				{
					id: 40,
					name: 'Shoulder',
					bodyPartKey: null,
					type: 'ultrasound',
					has_comments: 0,
					hasLocation: true,
				},
				{
					id: 41,
					name: 'Elbow',
					bodyPartKey: null,
					type: 'ultrasound',
					has_comments: 0,
					hasLocation: true,
				},
				{
					id: 42,
					name: 'Hand/Wrist',
					bodyPartKey: null,
					type: 'ultrasound',
					has_comments: 0,
					hasLocation: true,
				},
				{
					id: 43,
					name: 'Hip/Groin',
					bodyPartKey: null,
					type: 'ultrasound',
					has_comments: 0,
					hasLocation: true,
				},
				{
					id: 44,
					name: 'Knee',
					bodyPartKey: null,
					type: 'ultrasound',
					has_comments: 0,
					hasLocation: true,
				},
				{
					id: 45,
					name: 'Ankle',
					bodyPartKey: null,
					type: 'ultrasound',
					has_comments: 0,
					hasLocation: true,
				},
			],
		},
		{
			id: 12,
			name: 'Cervical Traction',
			location: false,
			lengths_of_need: null,
			usage: null,
			bodyParts: null,
		},
		{
			id: 13,
			name: 'Intermittent Cold Therapy',
			location: false,
			lengths_of_need: [14, 21, 28],
			usage: ['use_in_control_unit', 'frequency', 'pressure', 'time', 'minutes'],
			bodyParts: [
				{
					id: 46,
					name: 'Cervical Spine',
					bodyPartKey: null,
					type: 'coldTharapy',
					has_comments: 0,
					hasLocation: false,
				},
				{
					id: 47,
					name: 'Thoracic Spine',
					bodyPartKey: null,
					type: 'coldTharapy',
					has_comments: 0,
					hasLocation: false,
				},
				{
					id: 48,
					name: 'Lumbar Spine',
					bodyPartKey: null,
					type: 'coldTharapy',
					has_comments: 0,
					hasLocation: false,
				},
				{
					id: 49,
					name: 'Shoulder',
					bodyPartKey: null,
					type: 'coldTharapy',
					has_comments: 0,
					hasLocation: true,
				},
				{
					id: 50,
					name: 'Elbow',
					bodyPartKey: null,
					type: 'coldTharapy',
					has_comments: 0,
					hasLocation: true,
				},
				{
					id: 51,
					name: 'Hand/Wrist',
					bodyPartKey: null,
					type: 'coldTharapy',
					has_comments: 0,
					hasLocation: true,
				},
				{
					id: 52,
					name: 'Hip/Groin',
					bodyPartKey: null,
					type: 'coldTharapy',
					has_comments: 0,
					hasLocation: true,
				},
				{
					id: 53,
					name: 'Knee',
					bodyPartKey: null,
					type: 'coldTharapy',
					has_comments: 0,
					hasLocation: true,
				},
				{
					id: 54,
					name: 'Ankle',
					bodyPartKey: null,
					type: 'coldTharapy',
					has_comments: 0,
					hasLocation: true,
				},
			],
		},
		{
			id: 14,
			name: 'TLSO',
			location: false,
			lengths_of_need: null,
			usage: null,
			bodyParts: null,
		},
		{
			id: 15,
			name: 'Tens Unit',
			location: false,
			lengths_of_need: null,
			usage: null,
			bodyParts: null,
		},
		{
			id: 16,
			name: 'Ergonomic pillow',
			location: false,
			lengths_of_need: null,
			usage: null,
			bodyParts: null,
		},
		{
			id: 17,
			name: 'Shoulder brace with abduction',
			location: true,
			lengths_of_need: null,
			usage: null,
			bodyParts: null,
		},
		{
			id: 18,
			name: 'Shoulder Sling',
			location: true,
			lengths_of_need: null,
			usage: null,
			bodyParts: null,
		},
		{
			id: 19,
			name: 'Cam both',
			location: true,
			lengths_of_need: null,
			usage: null,
			bodyParts: null,
		},
		{
			id: 20,
			name: 'Massager',
			location: false,
			lengths_of_need: null,
			usage: null,
			bodyParts: null,
		},
		{
			id: 21,
			name: 'Other',
			location: true,
			lengths_of_need: null,
			usage: null,
			bodyParts: null,
		},
	],
	specialities: [
		{
			id: 1,
			parentId: null,
			name: 'ALLERGY & IMMUNOLOGY',
			children: [],
		},
		{
			id: 2,
			parentId: null,
			name: 'ANESTHESIOLOGY',
			children: [
				{
					id: 3,
					parentId: 2,
					name: 'Critical care medicine',
					children: [],
				},
				{
					id: 4,
					parentId: 2,
					name: 'Hospice and palliative care',
					children: [],
				},
				{
					id: 5,
					parentId: 2,
					name: 'Pain medicine',
					children: [],
				},
				{
					id: 6,
					parentId: 2,
					name: 'Pediatric anesthesiology',
					children: [],
				},
				{
					id: 7,
					parentId: 2,
					name: 'Sleep medicine',
					children: [],
				},
			],
		},
		{
			id: 8,
			parentId: null,
			name: 'DERMATOLOGY',
			children: [
				{
					id: 9,
					parentId: 8,
					name: 'Dermatopathology',
					children: [],
				},
				{
					id: 10,
					parentId: 8,
					name: 'Pediatric dermatology',
					children: [],
				},
			],
		},
		{
			id: 11,
			parentId: null,
			name: 'DIAGNOSTIC RADIOLOGY',
			children: [
				{
					id: 12,
					parentId: 11,
					name: 'Abdominal radiology',
					children: [],
				},
				{
					id: 13,
					parentId: 11,
					name: 'Breast imaging',
					children: [],
				},
				{
					id: 14,
					parentId: 11,
					name: 'Cardiothoracic radiology',
					children: [],
				},
				{
					id: 15,
					parentId: 11,
					name: 'Cardiovascular radiology',
					children: [],
				},
				{
					id: 16,
					parentId: 11,
					name: 'Chest radiology',
					children: [],
				},
				{
					id: 17,
					parentId: 11,
					name: 'Emergency radiology',
					children: [],
				},
				{
					id: 18,
					parentId: 11,
					name: 'Endovascular surgical neuroradiology',
					children: [],
				},
				{
					id: 19,
					parentId: 11,
					name: 'Gastrointestinal radiology',
					children: [],
				},
				{
					id: 20,
					parentId: 11,
					name: 'Genitourinary radiology',
					children: [],
				},
				{
					id: 21,
					parentId: 11,
					name: 'Head and neck radiology',
					children: [],
				},
				{
					id: 22,
					parentId: 11,
					name: 'Interventional radiology',
					children: [],
				},
				{
					id: 23,
					parentId: 11,
					name: 'Musculoskeletal radiology',
					children: [],
				},
				{
					id: 24,
					parentId: 11,
					name: 'Neuroradiology',
					children: [],
				},
				{
					id: 25,
					parentId: 11,
					name: 'Nuclear radiology',
					children: [],
				},
				{
					id: 26,
					parentId: 11,
					name: 'Pediatric radiology',
					children: [],
				},
				{
					id: 27,
					parentId: 11,
					name: 'Radiation oncology',
					children: [],
				},
				{
					id: 28,
					parentId: 11,
					name: 'Vascular and interventional radiology',
					children: [],
				},
			],
		},
		{
			id: 29,
			parentId: null,
			name: 'EMERGENCY MEDICINE',
			children: [
				{
					id: 30,
					parentId: 29,
					name: 'Anesthesiology critical care medicine',
					children: [],
				},
				{
					id: 31,
					parentId: 29,
					name: 'Emergency medical services',
					children: [],
				},
				{
					id: 32,
					parentId: 29,
					name: 'Hospice and palliative medicine',
					children: [],
				},
				{
					id: 33,
					parentId: 29,
					name: 'Internal medicine / Critical care medicine',
					children: [],
				},
				{
					id: 34,
					parentId: 29,
					name: 'Medical toxicology',
					children: [],
				},
				{
					id: 35,
					parentId: 29,
					name: 'Pediatric emergency medicine',
					children: [],
				},
				{
					id: 36,
					parentId: 29,
					name: 'Sports medicine',
					children: [],
				},
				{
					id: 37,
					parentId: 29,
					name: 'Undersea and hyperbaric medicine',
					children: [],
				},
			],
		},
		{
			id: 38,
			parentId: null,
			name: 'FAMILY MEDICINE',
			children: [
				{
					id: 39,
					parentId: 38,
					name: 'Adolescent medicine',
					children: [],
				},
				{
					id: 40,
					parentId: 38,
					name: 'Geriatric medicine',
					children: [],
				},
			],
		},
		{
			id: 41,
			parentId: null,
			name: 'INTERNAL MEDICINE',
			children: [
				{
					id: 42,
					parentId: 41,
					name: 'Advanced heart failure and transplant cardiology',
					children: [],
				},
				{
					id: 43,
					parentId: 41,
					name: 'Cardiovascular disease',
					children: [],
				},
				{
					id: 44,
					parentId: 41,
					name: 'Clinical cardiac electrophysiology',
					children: [],
				},
				{
					id: 45,
					parentId: 41,
					name: 'Endocrinology diabetes, and metabolism',
					children: [],
				},
				{
					id: 46,
					parentId: 41,
					name: 'Gastroenterology',
					children: [],
				},
				{
					id: 47,
					parentId: 41,
					name: 'Hematology',
					children: [],
				},
				{
					id: 48,
					parentId: 41,
					name: 'Hematology and oncology',
					children: [],
				},
				{
					id: 49,
					parentId: 41,
					name: 'Interventional cardiology',
					children: [],
				},
				{
					id: 50,
					parentId: 41,
					name: 'Nephrology',
					children: [],
				},
				{
					id: 51,
					parentId: 41,
					name: 'Oncology',
					children: [],
				},
				{
					id: 52,
					parentId: 41,
					name: 'Pulmonary disease and critical care medicine',
					children: [],
				},
				{
					id: 53,
					parentId: 41,
					name: 'Rheumatology',
					children: [],
				},
				{
					id: 54,
					parentId: 41,
					name: 'Transplant hepatology',
					children: [],
				},
			],
		},
		{
			id: 55,
			parentId: null,
			name: 'MEDICAL GENETICS',
			children: [
				{
					id: 56,
					parentId: 55,
					name: 'Biochemical genetics',
					children: [],
				},
				{
					id: 57,
					parentId: 55,
					name: 'Clinical cytogenetics',
					children: [],
				},
				{
					id: 58,
					parentId: 55,
					name: 'Clinical genetics',
					children: [],
				},
				{
					id: 59,
					parentId: 55,
					name: 'Molecular genetic pathology',
					children: [],
				},
			],
		},
		{
			id: 60,
			parentId: null,
			name: 'NEUROLOGY',
			children: [
				{
					id: 61,
					parentId: 60,
					name: 'Brain injury medicine',
					children: [],
				},
				{
					id: 62,
					parentId: 60,
					name: 'Child neurology',
					children: [],
				},
				{
					id: 63,
					parentId: 60,
					name: 'Clinical neurophysiology',
					children: [],
				},
				{
					id: 64,
					parentId: 60,
					name: 'Neurodevelopmental disabilities',
					children: [],
				},
				{
					id: 65,
					parentId: 60,
					name: 'Neuromuscular medicine',
					children: [],
				},
				{
					id: 66,
					parentId: 60,
					name: 'Vascular neurology',
					children: [],
				},
			],
		},
		{
			id: 67,
			parentId: null,
			name: 'NUCLEAR MEDICINE',
			children: [],
		},
		{
			id: 68,
			parentId: null,
			name: 'OBSTETRICS AND GYNECOLOGY',
			children: [
				{
					id: 69,
					parentId: 68,
					name: 'Female pelvic medicine and reconstructive surgery',
					children: [],
				},
				{
					id: 70,
					parentId: 68,
					name: 'Gynecologic oncology',
					children: [],
				},
				{
					id: 71,
					parentId: 68,
					name: 'Maternal-fetal medicine',
					children: [],
				},
				{
					id: 72,
					parentId: 68,
					name: 'Reproductive endocrinologists and infertility',
					children: [],
				},
			],
		},
		{
			id: 73,
			parentId: null,
			name: 'OPHTHALMOLOGY',
			children: [
				{
					id: 74,
					parentId: 73,
					name: 'Anterior segment/cornea ophthalmology',
					children: [],
				},
				{
					id: 75,
					parentId: 73,
					name: 'Glaucoma ophthalmology',
					children: [],
				},
				{
					id: 76,
					parentId: 73,
					name: 'Neuro-ophthalmology',
					children: [],
				},
				{
					id: 77,
					parentId: 73,
					name: 'Ocular oncology',
					children: [],
				},
				{
					id: 78,
					parentId: 73,
					name: 'Oculoplastics/orbit',
					children: [],
				},
				{
					id: 79,
					parentId: 73,
					name: 'Ophthalmic Plastic & Reconstructive Surgery',
					children: [],
				},
				{
					id: 80,
					parentId: 73,
					name: 'Retina/uveitis',
					children: [],
				},
				{
					id: 81,
					parentId: 73,
					name: 'Strabismus/pediatric ophthalmology',
					children: [],
				},
			],
		},
		{
			id: 82,
			parentId: null,
			name: 'PATHOLOGY',
			children: [
				{
					id: 83,
					parentId: 82,
					name: 'Anatomical pathology',
					children: [],
				},
				{
					id: 84,
					parentId: 82,
					name: 'Blood banking and transfusion medicine',
					children: [],
				},
				{
					id: 85,
					parentId: 82,
					name: 'Chemical pathology',
					children: [],
				},
				{
					id: 86,
					parentId: 82,
					name: 'Clinical pathology',
					children: [],
				},
				{
					id: 87,
					parentId: 82,
					name: 'Cytopathology',
					children: [],
				},
				{
					id: 88,
					parentId: 82,
					name: 'Forensic pathology',
					children: [],
				},
				{
					id: 89,
					parentId: 82,
					name: 'Genetic pathology',
					children: [],
				},
				{
					id: 90,
					parentId: 82,
					name: 'Immunopathology',
					children: [],
				},
				{
					id: 91,
					parentId: 82,
					name: 'Medical microbiology',
					children: [],
				},
				{
					id: 92,
					parentId: 82,
					name: 'Molecular pathology',
					children: [],
				},
				{
					id: 93,
					parentId: 82,
					name: 'Neuropathology',
					children: [],
				},
				{
					id: 94,
					parentId: 82,
					name: 'Pediatric pathology',
					children: [],
				},
			],
		},
		{
			id: 95,
			parentId: null,
			name: 'PEDIATRICS',
			children: [
				{
					id: 96,
					parentId: 95,
					name: 'Child abuse pediatrics',
					children: [],
				},
				{
					id: 97,
					parentId: 95,
					name: 'Developmental-behavioral pediatrics',
					children: [],
				},
				{
					id: 98,
					parentId: 95,
					name: 'Neonatal-perinatal medicine',
					children: [],
				},
				{
					id: 99,
					parentId: 95,
					name: 'Pediatric cardiology',
					children: [],
				},
				{
					id: 100,
					parentId: 95,
					name: 'Pediatric critical care medicine',
					children: [],
				},
				{
					id: 101,
					parentId: 95,
					name: 'Pediatric endocrinology',
					children: [],
				},
				{
					id: 102,
					parentId: 95,
					name: 'Pediatric gastroenterology',
					children: [],
				},
				{
					id: 103,
					parentId: 95,
					name: 'Pediatric hematology-oncology',
					children: [],
				},
				{
					id: 104,
					parentId: 95,
					name: 'Pediatric infectious diseases',
					children: [],
				},
				{
					id: 105,
					parentId: 95,
					name: 'Pediatric nephrology',
					children: [],
				},
				{
					id: 106,
					parentId: 95,
					name: 'Pediatric pulmonology',
					children: [],
				},
				{
					id: 107,
					parentId: 95,
					name: 'Pediatric rheumatology',
					children: [],
				},
				{
					id: 108,
					parentId: 95,
					name: 'Pediatric sports medicine',
					children: [],
				},
				{
					id: 109,
					parentId: 95,
					name: 'Pediatric transplant hepatology',
					children: [],
				},
			],
		},
		{
			id: 110,
			parentId: null,
			name: 'PHYSICAL MEDICINE & REHABILITATION',
			children: [
				{
					id: 111,
					parentId: 110,
					name: 'Pediatric rehabilitation medicine',
					children: [],
				},
				{
					id: 112,
					parentId: 110,
					name: 'Spinal cord injury medicine',
					children: [],
				},
			],
		},
		{
			id: 113,
			parentId: null,
			name: 'PREVENTIVE MEDICINE',
			children: [
				{
					id: 114,
					parentId: 113,
					name: 'Addiction psychiatry',
					children: [],
				},
				{
					id: 115,
					parentId: 113,
					name: 'Administrative psychiatry',
					children: [],
				},
				{
					id: 116,
					parentId: 113,
					name: 'Child and adolescent psychiatry',
					children: [],
				},
				{
					id: 117,
					parentId: 113,
					name: 'Community psychiatry',
					children: [],
				},
				{
					id: 118,
					parentId: 113,
					name: 'Consultation/liaison psychiatry',
					children: [],
				},
				{
					id: 119,
					parentId: 113,
					name: 'Emergency psychiatry',
					children: [],
				},
				{
					id: 120,
					parentId: 113,
					name: 'Forensic psychiatry',
					children: [],
				},
				{
					id: 121,
					parentId: 113,
					name: 'Geriatric psychiatry',
					children: [],
				},
				{
					id: 122,
					parentId: 113,
					name: 'Mental retardation psychiatry',
					children: [],
				},
				{
					id: 123,
					parentId: 113,
					name: 'Military psychiatry',
					children: [],
				},
				{
					id: 124,
					parentId: 113,
					name: 'Psychiatric research',
					children: [],
				},
			],
		},
		{
			id: 125,
			parentId: null,
			name: 'SURGERY',
			children: [
				{
					id: 126,
					parentId: 125,
					name: 'Colon and rectal surgery',
					children: [],
				},
				{
					id: 127,
					parentId: 125,
					name: 'General surgery',
					children: [
						{
							id: 128,
							parentId: 127,
							name: 'Surgical critical care',
						},
					],
				},
				{
					id: 129,
					parentId: 125,
					name: 'Plastic surgery',
					children: [
						{
							id: 130,
							parentId: 129,
							name: 'Craniofacial surgery',
						},
						{
							id: 131,
							parentId: 129,
							name: 'Hand surgery',
						},
					],
				},
				{
					id: 132,
					parentId: 125,
					name: 'Neurological surgery',
					children: [],
				},
				{
					id: 133,
					parentId: 125,
					name: 'Ophthalmic surgery',
					children: [],
				},
				{
					id: 134,
					parentId: 125,
					name: 'Oral and maxillofacial surgery',
					children: [],
				},
				{
					id: 135,
					parentId: 125,
					name: 'Orthopaedic surgery',
					children: [
						{
							id: 136,
							parentId: 135,
							name: 'Adult reconstructive orthopaedics',
						},
						{
							id: 137,
							parentId: 135,
							name: 'Foot and ankle orthopaedics',
						},
						{
							id: 138,
							parentId: 135,
							name: 'Musculoskeletal oncology',
						},
						{
							id: 139,
							parentId: 135,
							name: 'Orthopaedic sports medicine',
						},
						{
							id: 140,
							parentId: 135,
							name: 'Orthopaedic surgery of the spine',
						},
						{
							id: 141,
							parentId: 135,
							name: 'Orthopaedic trauma',
						},
						{
							id: 142,
							parentId: 135,
							name: 'Pediatric orthopaedics',
						},
					],
				},
				{
					id: 143,
					parentId: 125,
					name: 'Otolaryngology',
					children: [
						{
							id: 144,
							parentId: 143,
							name: 'Pediatric otolaryngology',
						},
					],
				},
				{
					id: 145,
					parentId: 125,
					name: 'Otology neurotology',
					children: [],
				},
				{
					id: 146,
					parentId: 125,
					name: 'Pediatric surgery',
					children: [
						{
							id: 147,
							parentId: 146,
							name: 'Neonatal',
						},
						{
							id: 148,
							parentId: 146,
							name: 'Prenatal',
						},
						{
							id: 149,
							parentId: 146,
							name: 'Trauma',
						},
						{
							id: 150,
							parentId: 146,
							name: 'Pediatric oncology',
						},
					],
				},
				{
					id: 151,
					parentId: 125,
					name: 'Thoracic Surgery',
					children: [
						{
							id: 152,
							parentId: 151,
							name: 'Congenital cardiac surgery',
						},
						{
							id: 153,
							parentId: 151,
							name: 'Thoracic surgery-integrated',
						},
					],
				},
				{
					id: 154,
					parentId: 125,
					name: 'Vascular surgery',
					children: [],
				},
			],
		},
		{
			id: 155,
			parentId: null,
			name: 'UROLOGY',
			children: [
				{
					id: 156,
					parentId: 155,
					name: 'Pediatric urology',
					children: [],
				},
				{
					id: 157,
					parentId: 155,
					name: 'Urologic oncology',
					children: [],
				},
				{
					id: 158,
					parentId: 155,
					name: 'Renal transplant',
					children: [],
				},
				{
					id: 159,
					parentId: 155,
					name: 'Male infertility',
					children: [],
				},
				{
					id: 160,
					parentId: 155,
					name: 'Calculi',
					children: [],
				},
				{
					id: 161,
					parentId: 155,
					name: 'Female urology',
					children: [],
				},
				{
					id: 162,
					parentId: 155,
					name: 'Neurourology',
					children: [],
				},
			],
		},
	],
	painExcerbations: [
		{
			id: 1,
			name: 'Going up/down stairs',
		},
		{
			id: 2,
			name: 'Bending down',
		},
		{
			id: 3,
			name: 'Squatting',
		},
		{
			id: 4,
			name: 'Pushing',
		},
		{
			id: 5,
			name: 'Lifting',
		},
		{
			id: 6,
			name: 'Pulling',
		},
		{
			id: 7,
			name: 'Prolonged walking',
		},
		{
			id: 8,
			name: 'Lying down',
		},
		{
			id: 9,
			name: 'Deep breathing',
		},
		{
			id: 10,
			name: 'Carrying heavy objects',
		},
		{
			id: 11,
			name: 'Prolonged sitting',
		},
		{
			id: 12,
			name: 'Weather change',
		},
		{
			id: 13,
			name: 'Standing up from a sitting position',
		},
	],
	favourite_codes: [],
};
