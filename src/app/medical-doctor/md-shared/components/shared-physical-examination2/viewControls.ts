export const viewControl = {
	foot: {
		movements: null,
		comment: true,
	},
	hand: {
		movements: null,
		comment: true,
	},
	'cervical-spine': {
		movements: {
			movementName: true,
			normalROM: true,
			measuredROM: true,
			leftMeasuredROM: false,
			rightMeasuredROM: false,
		},
		test: true,
		tendernessCheckBox: true,
		tendernessRadio: false,
		comment: true,
	},
	'thoracic-spine': {
		movements: null,
		tendernessCheckBox: false,
		tendernessRadio: true,
		comment: true,
	},
	'lumbosacral-spine': {
		movements: {
			normalROM: true,
			movementName: true,
			measuredROM: true,
			leftMeasuredROM: false,
			rightMeasuredROM: false,
		},
		test: true,
		testReports: {
			leftSign: true,
			leftDegree: true,
			rightSign: true,
			rightDegree: true,
			tests: [
				{
					name: 'Straight leg raising test supine:',
					hasOrientation: true,
				},
			],
		},
		tendernessCheckBox: true,
		// tendernessRadio:false,
		comment: true,
	},
	elbow: {
		movements: {
			movementName: true,
			normalROM: true,
			measuredROM: false,
			leftMeasuredROM: true,
			rightMeasuredROM: true,
		},
		comment: true,
	},
	shoulder: {
		movements: {
			movementName: true,
			normalROM: true,
			measuredROM: false,
			leftMeasuredROM: true,
			rightMeasuredROM: true,
		},
		test: true,
		testReports: {
			leftSign: false,
			leftDegree: false,
			rightSign: false,
			rightDegree: false,
			Sign: true,
			Degree: false,
			tests: [
				{
					name: 'Crepitus present',
					hasOrientation: true,
				},
				{
					name: 'Drop arm test',
					hasOrientation: true,
				},
				{
					name: 'Apprehension sign',
					hasOrientation: true,
				},
				{
					name: 'Painful arc/Impingement sign',
					hasOrientation: true,
				},
			],
		},
		comment: true,
	},
	wrist: {
		movements: {
			movementName: true,
			normalROM: true,
			measuredROM: false,
			leftMeasuredROM: true,
			rightMeasuredROM: true,
		},
		comment: true,
	},
	hip: {
		movements: {
			movementName: true,
			normalROM: true,
			measuredROM: false,
			leftMeasuredROM: true,
			rightMeasuredROM: true,
		},
		position: true,
		comment: true,
	},
	knee: {
		movements: {
			movementName: true,
			normalROM: true,
			measuredROM: false,
			leftMeasuredROM: true,
			rightMeasuredROM: true,
		},
		testReports: {
			leftSign: true,
			leftDegree: false,
			rightSign: true,
			rightDegree: false,
			Sign: false,
			Degree: false,
			tests: [
				{
					name: 'Point tenderness',
					hasOrientation: false,
				},
				{
					name: 'Crepitus',
					hasOrientation: false,
				},
				{
					name: 'Effusion',
					hasOrientation: false,
				},
				{
					name: 'Joint line pain',
					hasOrientation: false,
				},
				{
					name: 'Swelling',
					hasOrientation: false,
				},
				{
					name: 'Valgus test',
					hasOrientation: true,
				},
				{
					name: 'Varus test',
					hasOrientation: true,
				},
				{
					name: "Mcmurray's test",
					hasOrientation: true,
				},
				{
					name: 'Anterior drawer sign',
					hasOrientation: true,
				},
				{
					name: 'Posterior drawer sign',
					hasOrientation: true,
				},
			],
		},
		comment: true,
	},
	ankle: {
		movements: {
			movementName: true,
			normalROM: true,
			measuredROM: false,
			leftMeasuredROM: true,
			rightMeasuredROM: true,
		},
		comment: true,
		// testReports:{
		//     leftSign:true,
		//     leftDegree:false,
		//     rightSign:true,
		//     rightDegree:false,
		//     Sign:false,
		//     Degree:false,
		//     tests:[
		//         "Point tenderness",
		//         "Crepitus",
		//         "Effusion",
		//         "Joint line pain",
		//         "Swelling",
		//         "Valgus test",
		//         "Varus test",
		//         "Mcmurray's test",
		//         "Anterior drawer sign",
		//         "Posterior drawer sign"
		//     ]

		// },
	},
};
export const GAIT = [
	{ id: 1, name: 'intact' },
	{ id: 2, name: 'slow' },
	{ id: 3, name: 'antalgic' },
];

export const POSITION = [
	{ id: 1, name: 'anterior' },
	{ id: 2, name: 'lateral' },
	{ id: 3, name: 'posterior' },
];
