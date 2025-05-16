import { MdLinks } from './model/md-links';

// import {LocalStorage} from '@shared/libs/localstorage';

export const complaintTabs: MdLinks[] = [
	new MdLinks({
		link: '/medical-doctor/current-complaints',
		name: 'Current Complaints',
		drop: false,
		carryForwarded: false, //Mostly used in re-evaluation
		slug: 'currentComplaints', //Mostly used in re-evaluation
	}),
	new MdLinks({
		link: '/medical-doctor/current-complaints-cont',
		name: 'Current Complaints Cont.',
		drop: false,
		carryForwarded: false, //Mostly used in re-evaluation
		slug: 'currentComplaints2', //Mostly used in re-evaluation
	}),
];

export const physicalExaminationTabs: MdLinks[] = [
	new MdLinks({
		link: '/medical-doctor/physical-examination',
		name: 'Physical Examination',
		drop: false,
		carryForwarded: false, //Mostly used in re-evaluation
		slug: 'physicalExamination1', //Mostly used in re-evaluation
	}),
	new MdLinks({
		link: '/medical-doctor/physical-examination-cont',
		name: 'Physical Examination Cont.',
		drop: false,
		carryForwarded: false, //Mostly used in re-evaluation
		slug: 'physicalExamination2', //Mostly used in re-evaluation
	}),
];

export const planOfCareTabs: MdLinks[] = [
	new MdLinks({
		link: '/medical-doctor/plan-of-care',
		name: 'Plan of Care',
		drop: false,
		carryForwarded: false, //Mostly used in re-evaluation
		slug: 'planOfCare', //Mostly used in re-evaluation
	}),
	new MdLinks({
		link: '/medical-doctor/plan-of-care-cont',
		name: 'Work Status',
		drop: false,
		carryForwarded: false, //Mostly used in re-evaluation
		slug: 'workStatus', //Mostly used in re-evaluation
	}),
	new MdLinks({
		link: '/medical-doctor/treatment-rendered',
		name: 'Treatment Rendered',
		drop: false,
		carryForwarded: false, //Mostly used in re-evaluation
		slug: 'treatment_rendered', //Mostly used in re-evaluation
	}),
];

export const leftPanelRE: MdLinks[] = [
	new MdLinks({
		link: '/medical-doctor/evaluation',
		name: 'Follow-up',
		// name: 'Re-evaluon',
		hasCarryForwardButton: true,
		drop: false,
		carryForwarded: false, //Mostly used in re-evaluation
		slug: 'evaluation', //Mostly used in re-evaluation
	}),
	new MdLinks({
		link: '/medical-doctor/current-complaints',
		name: 'Current Complaints',
		hasCarryForwardButton: false,
		drop: false,
		carryForwarded: false, //Mostly used in re-evaluation
		slug: 'current-complaints', //Mostly used in re-evaluation
	}),
	// new MdLinks({
	// 	link: '/medical-doctor/past-medical-history',
	// 	name: 'Medical History',
	// 	hasCarryForwardButton: true,
	// 	carryForwarded: false, //Mostly used in re-evaluation
	// 	slug: 'pastMedicalHistory', //Mostly used in re-evaluation
	// }),

	new MdLinks({
		link: '/medical-doctor/physical-examination',
		name: 'Physical Examination',
		hasCarryForwardButton: false,
		drop: false,
		carryForwarded: false, //Mostly used in re-evaluation
		slug: 'physical-examination-main', //Mostly used in re-evaluation
	}),
	new MdLinks({
		link: '/medical-doctor/test-results',
		name: 'Test Results',
		hasCarryForwardButton: true,
		drop: false,
		carryForwarded: true, //Mostly used in re-evaluation
		slug: 'test_results', //Mostly used in re-evaluation
	}),	
	// {
	// 	link: '/medical-doctor/physical-examination-cont',
	// 	name: 'Physical Examination',
	// 	drop: false,
	// 	carryForwarded: false, //Mostly used in re-evaluation
	// 	slug:'physical-examination-cont' //Mostly used in re-evaluation
	// },
	// {
	// 	link: '/medical-doctor/test-results',
	// 	name: 'Test Results',
	// 	drop: false,
	// 	carryForwarded: false,
	// },

	new MdLinks({
		link: '/medical-doctor/diagnostic-impression',
		name: 'Diagnostic Impression',
		hasCarryForwardButton: true,
		drop: false,
		carryForwarded: false, //Mostly used in re-evaluation
		slug: 'diagnosticImpression', //Mostly used in re-evaluation
	}),
	new MdLinks({
		link: '/medical-doctor/plan-of-care',
		name: 'Plan of Care',
		hasCarryForwardButton: false,
		drop: false,
		carryForwarded: false, //Mostly used in re-evaluation
		slug: 'plan-of-care-main', //Mostly used in re-evaluation
	}),
];

const leftPanel: MdLinks[] = [
	new MdLinks({
		link: '/medical-doctor/evaluation',
		name: 'Initial Evaluation',
		drop: false,
		hasCarryForwardButton: true,
		carryForwarded: false, //Mostly used in re-evaluation
		slug: 'evaluation', //Mostly used in re-evaluation
	}),
	new MdLinks({
		link: '/medical-doctor/current-complaints',
		name: 'Current Complaints',
		drop: false,
		hasCarryForwardButton: false,
		carryForwarded: false, //Mostly used in re-evaluation
		slug: 'current-complaints', //Mostly used in re-evaluation
	}),
	new MdLinks({
		link: '/medical-doctor/past-medical-history',
		name: 'Medical History',
		hasCarryForwardButton: true,
		carryForwarded: false, //Mostly used in re-evaluation
		slug: 'pastMedicalHistory', //Mostly used in re-evaluation
	}),
	new MdLinks({
		link: '/medical-doctor/physical-examination',
		name: 'Physical Examination',
		hasCarryForwardButton: false,
		drop: false,
		carryForwarded: false, //Mostly used in re-evaluation
		slug: 'physical-examination-main', //Mostly used in re-evaluation
	}),
	new MdLinks({
		link: '/medical-doctor/diagnostic-impression',
		name: 'Diagnostic Impression',
		hasCarryForwardButton: true,
		carryForwarded: false, //Mostly used in re-evaluation
		slug: 'diagnosticImpression', //Mostly used in re-evaluation
	}),
	new MdLinks({
		link: '/medical-doctor/plan-of-care',
		name: 'Plan of Care',
		hasCarryForwardButton: false,
		drop: false,
		carryForwarded: false, //Mostly used in re-evaluation
		slug: 'plan-of-care', //Mostly used in re-evaluation
	}),
];

export const panelLinks: any = {
	md: {
		rightPanel: {
			type: 'md',
			search: true,
			links: [
				{
					name: 'Diagnostics',
					icon: 'icon-stethoscope position-absolute',
					link: 'http://www.google.com',
					subLinks: [
						{
							name: 'MRI Reports',
							icon: 'icon-mri-reports position-absolute',
							subLinks: [
								{
									name: 'Report 1',
									link: 'http://www.google.com',
								},
							],
						},
						{
							name: 'CT Scan',
							icon: 'icon-ct-scans position-absolute',
							subLinks: [
								{
									name: 'Report 2',
									link: 'http://www.facebook.com',
								},
							],
						},
						{
							name: 'MRI Reports',
							icon: 'icon-xray position-absolute',
							subLinks: [
								{
									name: 'Report 3',
									link: 'http://www.facebook.com',
								},
							],
						},
					],
				},
				{
					name: 'Ortho Reports',
					icon: 'icon-bone position-absolute',
					link: 'http://www.google.com',
					subLinks: [
						{
							name: 'MRI Reports',
							icon: 'icon-diagnostics position-absolute',
							subLinks: [
								{
									name: 'Report 1',
									icon: 'icon-diagnostics position-absolute',
									link: 'http://www.google.com',
								},
							],
						},
					],
				},
				{
					name: 'PT Reports',
					icon: 'icon-reports position-absolute',
					link: 'http://www.google.com',
					subLinks: [
						{
							name: 'MRI Reports',
							icon: 'icon-diagnostics position-absolute',
							link: 'http://www.google.com',
						},
					],
				},
			],
			class: 'icon-Help-svg',
			text: '',
		},
		leftPanel: leftPanel,
		leftPanelRE: leftPanelRE,
	},
};
