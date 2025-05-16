export class VerificationMockValues {
	initializeSearchFromValues = {
		date: null,
		description: null,
		file_name: null,
		id: null,
		verification_status_id: null,
		verification_type_ids: null,
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
