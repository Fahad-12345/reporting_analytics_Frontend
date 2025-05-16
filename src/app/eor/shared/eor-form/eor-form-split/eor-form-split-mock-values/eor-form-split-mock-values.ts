export class EorFormSplitMockValues {
	initializeSearchFromValues = {
		amount: null,
		date: null,
		description: '',
		eor_status_id: null,
		eor_type_id: null,
		file_name: null,
		id: null,
	};
	eorTypeList = {
		status: 200,
		result: {
			data: [],
		},
	};
	eorIdThroughSubjectResp = {
		result: {
			data: {
				bills: 'bills',
				patient: 'patient',
				amount: '1210',
			},
		},
	};
	getEorStatusResp = {
		status: 200,
		result: {
			data: [],
		},
	};
}
