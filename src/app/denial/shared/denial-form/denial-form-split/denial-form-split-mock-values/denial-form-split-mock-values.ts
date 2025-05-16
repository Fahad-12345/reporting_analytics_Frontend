export class DenialFormSplitMockValues {
	initializeSearchFromValues = {
		comments: null,
		date: null,
		denial_status_id: null,
		denial_type: null,
		file_name: null,
		id: null,
		reason: null,
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
