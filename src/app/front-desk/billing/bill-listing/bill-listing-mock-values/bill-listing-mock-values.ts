export class BillistingMockValues {
	searchFormInitRespWithEmpty = {
		attorney_ids: null,
		bill_amount: null,
		bill_amount_from: null,
		bill_amount_to: null,
		bill_date: null,
		bill_date_range1: null,
		bill_date_range2: null,
		bill_ids: null,
		bill_recipient_type_ids: null,
		bill_status_ids: null,
		case_ids: null,
		case_type_ids: null,
		claim_no: null,
		created_by_ids: null,
		date_of_accident: null,
		denial_status_ids: null,
		doctor_ids: null,
		employer_ids: null,
		eor_status_ids: null,
		facility_ids: null,
		insurance_ids: null,
		patient_ids: null,
		patient_name: null,
		payment_status_ids: null,
		provider_ids: null,
		speciality_ids: null,
		updated_by_ids: null,
		verification_status_ids: null,
	};
	billFormInitializationEmtpy = {
		id: '',
		name: '',
		description: '',
		comments: '',
	};
	dispalyUpdatedbillResp = {
		status: 200,
		result: {
			data: [{ bill_id: 25 }],
			total: 1,
		},
	};
	saveVerificationEmitterResp = {
		status:200,
		message:'Success'
	}
	singleBillResp = {
		status: 200,
		message: 'Mock_Message',
		result: {
			data: {
				case_id: 1,
				visit_sessions: [
					{
						kiosk_case: 'case',
					},
				],
				kiosk_case: 'case',
				speciality: 'speciality',
			},
		},
	};
	getBillDocuments = {
		status: 200,
		result: {
			data: {
				label_id: 10,
				bill_recipients: null,
			},
		},
	};
	createBillResp = {
		componentInstance: {
			visitList: [],
			billDetail: [],
			modalRef: 'ModalRef',
			caseId: 1,
			isBillingDetail: true,
			result: {
				then: function () {
					return true;
				},
			},
		},
	};
	givenSetTabPatientArray = [
		{
			bill_id: 376,
			bill_recipient_id: 1794,
			bill_recipient_type_id: 1,
			created_by: null,
			documents: [
				{
					bill_recipient_id: 2724,
					fileFolderType: null,
					file_name: '1631104039_65_nf_3_2310_376.pdf',
					file_title: 'NF-3',
					id: 45288,
					link: 'https://cm.ovadamd.net/api/dm/file-by-id?id=45288',
				},
			],
			id: 2724,
			recipient: {
				first_name: 'Test Tuesday',
				id: 1794,
				last_name: 'Patient',
				middle_name: 'M',
			},
			recipient_type_name: 'patient',
			type_ids: [
				{
					bill_recipient_id: 2724,
					created_at: null,
					document_type_id: 206,
					id: 5567,
					updated_at: null,
				},
			],
			updated_by: null,
		},
	];
	givenSetTabemployerArray = [
		{
			bill_id: 376,
			bill_recipient_id: 1794,
			bill_recipient_type_id: 1,
			created_by: null,
			documents: [
				{
					bill_recipient_id: 2724,
					fileFolderType: null,
					file_name: '1631104039_65_nf_3_2310_376.pdf',
					file_title: 'NF-3',
					id: 45288,
					link: 'https://cm.ovadamd.net/api/dm/file-by-id?id=45288',
				},
			],
			id: 2724,
			recipient: {
				first_name: 'Test Tuesday',
				id: 1794,
				last_name: 'Patient',
				middle_name: 'M',
			},
			recipient_type_name: 'employer',
			type_ids: [
				{
					bill_recipient_id: 2724,
					created_at: null,
					document_type_id: 206,
					id: 5567,
					updated_at: null,
				},
			],
			updated_by: null,
		},
	];
	givenSetTabattorneyArray = [
		{
			bill_id: 376,
			bill_recipient_id: 1794,
			bill_recipient_type_id: 1,
			created_by: null,
			documents: [
				{
					bill_recipient_id: 2724,
					fileFolderType: null,
					file_name: '1631104039_65_nf_3_2310_376.pdf',
					file_title: 'NF-3',
					id: 45288,
					link: 'https://cm.ovadamd.net/api/dm/file-by-id?id=45288',
				},
			],
			id: 2724,
			recipient: {
				first_name: 'Test Tuesday',
				id: 1794,
				last_name: 'attorney',
				middle_name: 'M',
			},
			recipient_type_name: 'attorney',
			type_ids: [
				{
					bill_recipient_id: 2724,
					created_at: null,
					document_type_id: 206,
					id: 5567,
					updated_at: null,
				},
			],
			updated_by: null,
		},
	];
	givenSetTabinsuranceArray = [
		{
			bill_id: 376,
			bill_recipient_id: 1794,
			bill_recipient_type_id: 1,
			created_by: null,
			documents: [
				{
					bill_recipient_id: 2724,
					fileFolderType: null,
					file_name: '1631104039_65_nf_3_2310_376.pdf',
					file_title: 'NF-3',
					id: 45288,
					link: 'https://cm.ovadamd.net/api/dm/file-by-id?id=45288',
				},
			],
			id: 2724,
			recipient: {
				first_name: 'Test Tuesday',
				id: 1794,
				last_name: 'attorney',
				middle_name: 'M',
			},
			recipient_type_name: 'insurance',
			type_ids: [
				{
					bill_recipient_id: 2724,
					created_at: null,
					document_type_id: 206,
					id: 5567,
					updated_at: null,
				},
			],
			updated_by: null,
		},
	];
	generateBillEnvelopePacketPomFirstParam = {
		type: 'pdf',
		bill_id: 10,
		facility_id: 12,
		speciality_id: 15,
		doctor_id: 210,
		is_info_updated: true,
		currentBillHistory: [],
	};
	generateBillEnvelopePacketPomFirstParamWithTypeExcel = {
		type: 'excel',
		bill_id: 10,
		facility_id: 12,
		speciality_id: 15,
		doctor_id: 210,
		is_info_updated: false,
		currentBillHistory: [],
	};
	paymentFormComponentObj = {
		paymentSplitList: {
			getPaymentInfo: function () {
				return true;
			},
		},
	};
	denialFormComponentObj = {
		denialListingComponent: {
			getDenialInfo: function () {
				return true;
			},
		},
	};
	eorFormComponentObj = {
		eorListingComponent: {
			getEorInfo: function () {
				return true;
			},
		},
	};

	denailListComponentObj = {
			getDenialInfo: function () {
				return true;
			},
	};
	verificationListComponentObj = {
			getVerificationViewInfo: function () {
				return true;
			},
			page: {
				offset: 0,
			},
	};
	paymentSplitListObj = {
			getPaymentInfo: function () {
				return true;
			},
	};
	genertePomResp = {
		result:{
			data:{
				pom_media:{
					link:'pom_media_link_fake'
				}
			}
		}
	}
}
