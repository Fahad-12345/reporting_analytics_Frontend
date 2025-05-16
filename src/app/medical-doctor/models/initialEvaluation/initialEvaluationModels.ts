import { getObjectChildValue } from "@appDir/shared/utils/utils.helpers";


export class Diseases {
	id: number;
	disease: string;
	constructor(disease) {
		this.id = disease.id ? disease.id : null;
		this.disease = disease.disease ? disease.disease : null;
	}
}
export class Allergies {
	id: number;
	allergy: string;
	constructor(allergy) {
		this.id = allergy.id ? allergy.id : null;
		this.allergy = allergy.allergy ? allergy.allergy : null;
	}
}

export class Complaint {
	id: number;
	medicalSessionId: number;
	comment: string;
}

export class Complaint2 {
	id: number;
	medicalSessionId: number;
	comment: string;
}

export class ComplaintLocation {
	checked: boolean;
	location: string;
	painScale: number; //Added
	painStyle: number; //Added
	feelings: number[]; //Added
	sensations: number[]; //Added
	radiations: Radiation[]; //Added
	comments: string; //Added
	constructor(complaintLocations) {
		this.checked = complaintLocations.checked ? complaintLocations.checked : false;
		this.location = complaintLocations.location ? complaintLocations.location : '';
		this.painScale = complaintLocations.painScale ? complaintLocations.painScale : null;
		this.painStyle = complaintLocations.painStyle ? complaintLocations.painStyle : null;
		this.comments = complaintLocations.comments ? complaintLocations.comments : null;
		;
		if (typeof complaintLocations.sensation)
			if (complaintLocations.sensation) {
				this.sensations = complaintLocations.sensation
					.filter(function (data) {
						if (typeof data == 'number') {
							return true;
						}
						return data.checked;
					})
					.map(function (data) {
						if (typeof data == 'number') {
							return data;
						}
						return data.id;
					});
			}
		if (complaintLocations.feelings) {
			this.feelings = complaintLocations.feelings
				.filter(function (data) {
					return data.checked == true;
				})
				.map(function (data) {
					return data.id;
				});
		}
		if (complaintLocations.radiation) {
			this.radiations = complaintLocations.radiation.filter(function (data) {
				return data.location != null;
			});
		}
	}
}

export class CurrentComplaint {
	id: number; //Added
	name: string;
	bodyPartId: number; //Added
	checked: boolean; //Not needed
	complaintsLocation: ComplaintLocation[];

	constructor(complaints) {
		this.id = complaints.id ? complaints.id : null;
		this.checked = complaints.checked ? complaints.checked : false;
		this.bodyPartId = complaints.bodyPartId ? complaints.bodyPartId : null;
		let complaintsLocation: ComplaintLocation[] = [];
		complaints.complaintsLocation;
		if (complaints.complaintsLocation && complaints.complaintsLocation.length > 0) {
			complaintsLocation = complaints.complaintsLocation
				.filter((complaint) => {
					return complaint.checked || complaints.complaintsLocation.length == 1;
				})
				.map((complaint) => {
					return new ComplaintLocation(complaint);
				});
		}
		this.complaintsLocation = complaintsLocation;
	}
}

export class BodyPartCodes {
	id: number;
	code: string;
	bodyPartId: number;
	constructor(bodyPartCode) {
		this.id = bodyPartCode.id ? bodyPartCode.id : null;
		this.code = bodyPartCode.code ? bodyPartCode.code : null;
		this.bodyPartId = bodyPartCode.bodyPartId ? bodyPartCode.bodyPartId : null;
	}
}
export class BodyPart {
	id: number;
	bodyPartKey: string;
	name: string;
	type: string;
	issue: string;
	comment: string;
	checked: boolean;
	codes: BodyPartCodes[];
	constructor(bodyPart) {
		this.id = bodyPart.id ? bodyPart.id : null;
		this.bodyPartKey = bodyPart.bodyPartKey ? bodyPart.bodyPartKey : null;
		this.name = bodyPart.name ? bodyPart.name : null;
		this.type = bodyPart.type ? bodyPart.type : null;
		this.issue = bodyPart.issue ? bodyPart.issue : null;
		this.comment = bodyPart.comment ? bodyPart.comment : null;
		this.checked = bodyPart.checked ? bodyPart.checked : null;
		if (bodyPart.codes) {
			this.codes = bodyPart.codes;
		}
	}
}

export class SubBodyPart {
	id: number;
	name: string;
	checked?: boolean; //only for development. Not needed for seeded data
	location?: string; //only for development. Not needed for seeded data
	bodyPartId: number; //this will be removed in future
	body_part_id: number;
	constructor(subBodyPart) {
		this.id = subBodyPart.id ? subBodyPart.id : null;
		this.name = subBodyPart.name ? subBodyPart.name : null;
		this.checked = subBodyPart.checked ? subBodyPart.checked : null;
		this.location = subBodyPart.location ? subBodyPart.location : null;
		this.bodyPartId = subBodyPart.bodyPartId ? subBodyPart.bodyPartId : null;
		this.body_part_id = subBodyPart.body_part_id ? subBodyPart.body_part_id : null;
	}
}

export class Feelings {
	id: number;
	feeling: string;
	checked?: string; //only for development. Not for seeded data
	bodyPartId?: number; //this will be removed in future
	body_part_id?: number; //only for seeded info. Not needed for development
	constructor(feeling) {
		this.id = feeling.id ? feeling.id : null;
		this.feeling = feeling.feeling ? feeling.feeling : null;
		this.checked = feeling.checked ? feeling.checked : false;
	}
}

export class BodyPartFeeling {
	id: number;
	feelingId: number;
	bodyPartId: number;
}

export class Sensation {
	id: number;
	sensation: string;
	checked?: string;
	bodyPartId: number;
	body_part_id?: number;
	constructor(sensation: Sensation) {
		this.id = sensation.id ? sensation.id : null;
		this.sensation = sensation.sensation ? sensation.sensation : null;
		this.checked = sensation.checked ? sensation.checked : null;
		this.bodyPartId = sensation.bodyPartId ? sensation.bodyPartId : null;
	}
}

export class BodyPartSensation {
	id: number;
	sensationId: number;
	bodyPartId: number;
}

export class Radiation {
	bodyPartId: number;
	position: string;
	location: string;
	constructor(radiation) {
		this.bodyPartId = radiation.bodyPartId ? radiation.bodyPartId : null;
		this.position = radiation.position ? radiation.position : null;
		this.location = radiation.location ? radiation.location : null;
	}
}
export class PainExacerbationReasons {
	id: number;
	name: string;
	checked?: string;
	constructor(reason) {
		this.id = reason.id ? reason.id : null;
		this.name = reason.name ? reason.name : null;
		this.checked = reason.checked ? reason.checked : false;
	}
}

//************************************************
//**************Physical Examination**************
//************************************************
export class ConditionStates {
	//Seeded info
	id: number;
	state: string;
	bodyPartConditionId: number;
	constructor(states) {
		this.id = states.id ? states.id : null;
		this.state = states.state ? states.state : null;
		this.bodyPartConditionId = states.bodyPartConditionId ? states.bodyPartConditionId : null;
	}
}
export class BodyPartCondition {
	//Seeder
	id: number;
	bodyPartId: number;
	condition: string;
	conditionStates: ConditionStates[];
	constructor(bodyPartCondition) {
		this.id = bodyPartCondition.id ? bodyPartCondition.id : null;
		this.bodyPartId = bodyPartCondition.bodyPartId ? bodyPartCondition.bodyPartId : null;
		this.condition = bodyPartCondition.condition ? bodyPartCondition.condition : null;

		if (bodyPartCondition.conditionStates) {
			this.conditionStates = bodyPartCondition.conditionStates.filter(function (data) {
				return new ConditionStates(data);
			});
		}
		this.conditionStates = bodyPartCondition.conditionStates
			? bodyPartCondition.conditionStates
			: null;
	}
}
// "id": 5,
//     "state": {
//     "id": 1,
//         "name": "negative tenderness to palpation"
// },
// "name": "There are no deformities"
export class ConditionState {
	id: number;
	name: string;
	constructor(condition) {
		this.id = condition.id ? condition.id : null;
		this.name = condition.name ? condition.name : null;
	}
}
export class BodyPartConditionAPI {
	//Temporary
	id: number;
	state: ConditionState;
	name: string;
	constructor(bodyPartCondition) {
		;
		this.id = bodyPartCondition.id ? bodyPartCondition.id : null;
		this.name = bodyPartCondition.name ? bodyPartCondition.name : null;
		bodyPartCondition.state =
			typeof bodyPartCondition.state == 'string'
				? JSON.parse(bodyPartCondition.state)
				: bodyPartCondition.state;
		this.state = bodyPartCondition.state ? new ConditionState(bodyPartCondition.state) : null;
	}
}
export class PhysicalExamination1 {
	id: number;
	wellDeveloped: boolean;
	wellNourished: boolean;
	alert: boolean;
	oriented: boolean;
	painLevel: string;
	bodyPartExaminations: BodyPartExamination[];
	constructor(examination) {
		this.id = examination.id ? examination.id : null;
		this.wellDeveloped = examination.wellDeveloped ? examination.wellDeveloped : false;
		this.wellNourished = examination.wellNourished ? examination.wellNourished : false;
		this.alert = examination.alert ? examination.alert : false;
		this.oriented = examination.oriented ? examination.oriented : false;
		this.painLevel = examination.painLevel ? examination.painLevel : null;
		;
		this.bodyPartExaminations = examination.bodyPartExaminations
			? examination.bodyPartExaminations
			: false;
	}
}

export class BodyPartExamination {
	id: number;
	conditions: BodyPartConditionAPI[];
	comment: string;
	// state:string;
	constructor(examination) {
		this.id = examination.id ? examination.id : null;
		this.comment = examination.comment ? examination.comment : '';
		if (examination.condition) {
			this.conditions = examination.condition
				.filter(function (data) {
					return data.checked == true;
				})
				.map(function (data) {
					;
					return new BodyPartConditionAPI({
						id: data.id,
						state: data.state,
						name: data.name,
					});
				});
		}
	}
}

export class Movement {
	//Seeded Info
	id: number;
	movement: string;
	normalROM: number;
	bodyPartId: number;
	// state:string;
	constructor(movement) {
		this.id = movement.id ? movement.id : null;
		this.movement = movement.movement ? movement.movement : '';
		this.normalROM = movement.normalROM ? movement.normalROM : null;
		this.bodyPartId = movement.bodyPartId ? movement.bodyPartId : null;
	}
}

export class BodyPartMovements {
	id: number;
	bodyPartId: number;
	orientation: string;
	measuredROM: number;
	leftMeasuredROM: number;
	rightMeasuredROM: number;
	// comment:string;
	movementId: number;

	// state:string;
	constructor(bodyPartMovement, bodyPartId) {
		this.id = bodyPartMovement.id ? bodyPartMovement.id : null;
		this.bodyPartId = bodyPartId; //(bodyPartMovement.bodyPartId) ? bodyPartMovement.bodyPartId : null;
		this.orientation = bodyPartMovement.orientation ? bodyPartMovement.orientation : null;
		this.measuredROM =
			bodyPartMovement && !isNaN(parseInt(bodyPartMovement.measuredROM))
				? bodyPartMovement.measuredROM
				: null;
		this.leftMeasuredROM =
			bodyPartMovement && !isNaN(parseInt(bodyPartMovement.leftMeasuredROM))
				? bodyPartMovement.leftMeasuredROM
				: null;
		this.rightMeasuredROM =
			bodyPartMovement && !isNaN(parseInt(bodyPartMovement.rightMeasuredROM))
				? bodyPartMovement.rightMeasuredROM
				: null;
		// this.comment = (bodyPartMovement.comment)?bodyPartMovement.comment:null;
		this.movementId = bodyPartMovement.movementId ? bodyPartMovement.movementId : null;
	}
}

export class MovementDetails {
	id: number;
	testName: string;
	testResult: string;
	normal_range: string;
	orientation: string;
	tenderness: string;
	consistency: string;
	conjunction: string;
	with: boolean;
	painLevel: string;
	spasm: string;
	comment: string;
	painInJoint: string;
	painAcrossShoulder: string;
	limitationOfMovement: string;
	bodyPartId: number;
	bodyPartMovement: BodyPartMovements[];
	testReports: TestReports[];
	position: number[];
	constructor(movementDetails) {
		this.id = movementDetails.id ? movementDetails.id : null;
		this.testName = movementDetails.testName ? movementDetails.testName : null;
		let positions = getObjectChildValue(movementDetails, [], ['position']);
		this.position = positions
			.filter((position) => {
				return position.checked;
			})
			.map((position) => {
				return position.id;
			});

		// this.position = movementDetails.position ? movementDetails.position : null;

		this.testResult = movementDetails.testResult ? movementDetails.testResult : null;
		this.normal_range = movementDetails ? movementDetails.normal_range : null;
		this.orientation = movementDetails.orientation ? movementDetails.orientation : null;
		this.tenderness = movementDetails.tenderness ? movementDetails.tenderness : null;
		this.consistency = movementDetails.consistency ? movementDetails.consistency : null;
		this.conjunction = movementDetails.conjunction ? movementDetails.conjunction : null;
		this.with = movementDetails.with ? movementDetails.with : null;
		this.painLevel = movementDetails.painLevel ? movementDetails.painLevel : null;
		this.spasm = movementDetails.spasm ? movementDetails.spasm : null;
		this.comment = movementDetails.comment ? movementDetails.comment : null;
		this.painInJoint = movementDetails.painInJoint ? movementDetails.painInJoint : null;
		this.painAcrossShoulder = movementDetails.painAcrossShoulder
			? movementDetails.painAcrossShoulder
			: null;
		this.limitationOfMovement = movementDetails.limitationOfMovement
			? movementDetails.limitationOfMovement
			: null;
		this.bodyPartId = movementDetails.bodyPartId ? movementDetails.bodyPartId : null;

		// this.testReports = (movementDetails.testReports)?movementDetails.testReports:null;
		if (movementDetails.bodyPartMovements) {
			;
			this.bodyPartMovement = movementDetails.bodyPartMovements
				.filter((data) => {
					return data.orientation === '' &&
						data.measuredROM === '' &&
						data.leftMeasuredROM === '' &&
						data.rightMeasuredROM === ''
						? false
						: true;
				})
				.map((data) => {
					return new BodyPartMovements(data, this.bodyPartId);
				});
		}
		if (movementDetails.bodyPartTests) {
			;
			this.testReports = movementDetails.bodyPartTests.filter((data) => {
				return !(
					data.Degree === null &&
					data.Sign === null &&
					data.leftDegree === null &&
					data.leftSign === null &&
					data.rightDegree === null &&
					data.rightSign === null
				);
			});
			this.testReports = this.testReports.map((data) => {
				return new TestReports(data);
			});
		}
	}
}
export class TestReports {
	id: number;
	leftSign: string;
	leftDegree: string;
	rightSign: string;
	rightDegree: string;
	sign: string;
	degree: string;
	name: string;
	bodyPartId: number;
	constructor(movementDetails) {
		this.id = movementDetails.id ? movementDetails.id : null;
		this.leftSign = movementDetails.leftSign ? movementDetails.leftSign : null;
		this.leftDegree = movementDetails.leftDegree ? movementDetails.leftDegree : null;
		this.rightSign = movementDetails.rightSign ? movementDetails.rightSign : null;
		this.rightDegree = movementDetails.rightDegree ? movementDetails.rightDegree : null;
		this.sign = movementDetails.Sign ? movementDetails.Sign : null;
		this.degree = movementDetails.Degree ? movementDetails.Degree : null;
		this.name = movementDetails.name ? movementDetails.name : null;
		this.bodyPartId = movementDetails.bodyPartId ? movementDetails.bodyPartId : null;
	}
}
export class PhysicalExamination2 {
	movementDetails: MovementDetails[];
	// testReports:TestReports;
	painLevel?: string;
	alert?: boolean;
	oriented?: boolean;
	painComment?: string;
	gait: any[];
	gaitComment: string;
	neurologicComment: string;
	neurologic: boolean;
	general?: string;
	generalComment?: string;
	constructor(physicalExamination2) {
		this.movementDetails = physicalExamination2.movementDetails
			.filter((data) => {
				return data.checked == true;
			})
			.map((data) => {
				return new MovementDetails(data);
			});
		// this.movementDetails = (physicalExamination2.movementDetails) ? physicalExamination2.movementDetails : null;
		this.painLevel = physicalExamination2.painLevel;
		this.alert = physicalExamination2.alert;
		this.oriented = physicalExamination2.oriented;
		this.painComment = physicalExamination2.painComment;
		this.gait = physicalExamination2.gait
			.filter((gait) => {
				return gait.checked;
			})
			.map((gait) => {
				return gait.id;
			});
		this.gaitComment = physicalExamination2.gaitComment;
		this.general = physicalExamination2.general;
		this.generalComment = physicalExamination2.generalComment;
		this.neurologicComment = physicalExamination2.neurologicComment;
		this.neurologic = physicalExamination2.neurologic;
	}
}
export class SelectedBodyPartCodes {
	id: number;
	bodyPart: number;
	codes: number[];
	constructor(data) {
		if (data.codes) {
			this.codes = data.codes.map(function (data) {
				return data.id;
			});
		}
		if (data.id) {
			this.bodyPart = data.id;
		}
	}
}
export class DiagnosticImpression {
	comments: string;
	// bodyPartCodes: SelectedBodyPartCodes[];
	cpt_codes?: any[];
	icd10_codes?: any[];
	constructor(di) {
		this.comments = di.comments ? di.comments : null;
		// this.bodyPartCodes = di.bodyPartCodes;
		this.cpt_codes = di.cpt_codes;
		this.icd10_codes = di.icd10_codes;
	}
}
export class TreatmentRendered {
	cpt_codes: any[];
	constructor(treatment_rendered) {
		;
		this.cpt_codes = treatment_rendered.cpt_codes;
	}
}

export class DeviceBodyPart {
	id: number;
	name: string;
	hasLocation?: boolean;
	has_comments?: boolean | number;
	bodyPartKey?: string; //Only for seeded info not required in development
	type?: string; //Only for seeded info not required in development
	location?: string;
	comments?: string;
	constructor(bodyPart) {
		this.id = bodyPart.id;
		this.name = bodyPart.name;
		this.hasLocation = bodyPart.hasLocation;
		this.has_comments = bodyPart.has_comments;
		this.location = bodyPart.location;
		this.comments = bodyPart.comments;
	}
}
export class Devices {
	id: number;
	name: string;
	location: boolean;
	has_comments?: boolean;
	lengths_of_need: number[];
	usage: string[];
	bodyParts: DeviceBodyPart[];
	constructor(device: Devices) {
		this.id = device.id;
		this.name = device.name;
		this.location = device.location;
		this.lengths_of_need = device.lengths_of_need;
		this.usage = device.usage;
		this.bodyParts = device.bodyParts;
		this.has_comments = device.has_comments ? true : false;
	}
}

// physicalExamination2:
// [
//     {
//     "movementDetails" : {
//         "bodyPartId": 12,
//         "testName":"abc",
//         "testResult":"asdfas",
//         "tenderness":"asdfsd",
//         "consistency":"asdfas",
//         "with":true,
//         "painLevel":"mild",
//         "spasm":"asdfasd",
//         "comment":"asdfasd",
//         "painInJoint":"gwergerg",
//         "painAcrossShoulder":"asdfasf",
//         "limitationOfMovement":"asdfasf",
//         "bodyPartMovements" :[
//             {
//                 "orientation":"asdfas",
//                 "measuredROM":123,
//                 "leftMeasuredROM":231,
//                 "rightMeasuredROM":231,
//                 "movementId":1
//             },
//             {
//                 "orientation":"asdfas",
//                 "measuredROM":123,
//                 "leftMeasuredROM":231,
//                 "rightMeasuredROM":231,
//                 "comment":"asdfas",
//                 "movementId":1
//             },
//             {
//                 "orientation":"asdfas",
//                 "measuredROM":123,
//                 "leftMeasuredROM":231,
//                 "rightMeasuredROM":231,
//                 "comment":"asdfas",
//                 "movementId":1
//             }
//         ]
//     },
//     "testReports" : [
//         {
//             "leftSign":"abc",
//             "leftDegree":"asdfas",
//             "rightSign":"asdfsd",
//             "rightDegree":"asdfas",
//             "sign":true,
//             "degree":"mild",
//             "name":"asdfasd",
//             "bodyPartId":"1",
//         },
//         {
//             "leftSign":"abc",
//             "leftDegree":"asdfas",
//             "rightSign":"asdfsd",
//             "rightDegree":"asdfas",
//             "sign":true,
//             "degree":"mild",
//             "name":"asdfasd",
//             "bodyPartId":"1",
//         }
//     ]
//     }
// ]
