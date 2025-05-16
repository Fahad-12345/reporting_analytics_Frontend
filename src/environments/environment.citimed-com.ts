/**
 * Environment for CitiMed
 */
export const environment: { [task_mngr_api_dev: string]: any } = {
	production: true,
	isServer: false,
	host: 'http://localhost:4000',
	billing_api_url: 'https://citimed.cm.ovadamd.com/api/node/billing/',
	// fd_api_url: "https://revampfd.ovadamd.tk/api/",

	fd_api_url: 'https://citimed.cm.ovadamd.com/api/',
	fd_api_url_vd: "https://citimed.cm.ovadamd.com/api/vd/",
	md_api_url: 'https://citimed.cm.ovadamd.com/api/md/',
	schedulerApiUrl: 'https://citimed.cm.ovadamd.com/api/node/sch',
	schedulerApiUrl1: 'https://citimed.cm.ovadamd.com/api/node/sch',
	whitelistedDomains: ['localhost', '*.ovadamd.org', '*.ovadamd.com', '*.ovadamd.tk'],
	kiosk_api_path: 'https://citimed.cm.ovadamd.com/api/node/kiosk/',

	//'https://kiosk.ovadamd.org/api/',
	// kiosk_api_path: 'https://cm.ovadamd.net/api/',
	schedular_api_path: 'https://citimed.cm.ovadamd.com/api/node/sch',
	document_mngr_api_path: 'https://citimed.cm.ovadamd.com/api/dm/',
	userManagementUrl: 'https://citimed.fd.ovadamd.com/api',
	billing_api_path: 'https://citimed.cm.ovadamd.com/api/node/billing/',
	// task_mngr_api_dev: 'https://localhost:3000/api',
	task_mngr_api_dev: 'https://citimed.tm.ovadamd.com/api',
	templateManagerUrl: 'https://citimed.templateapi.ovadamd.com/',
	erx_api_url: `https://citimed.cm.ovadamd.com/api/node/erx/`,
	analytics_api_url:`https://citimed.cm.ovadamd.com/api/node/analytics/`,
	erx_fd_api: 'https://citimed.cm.ovadamd.com/api/',
	gooleIncludedCountries: ['us', 'pk'],
	is_prod: true,
	configEnv: 'production',
	// env for ringcentral
	RCSDK_VERSION: '3.2.2',
	username: 'qaiser.a@quickbillsmd.com',
	ext: '101',
	password: 'quickbills@123',
	appKey: 'tjxahW1YR7u0ATi_a037Vw',
	appSecret: 'jDbSyxalRT - idsNIO2 - fQQwXWVcTKdR2WBFqSuOkS83g',
	task_socketUrl: 'https://citimed.tm.ovadamd.com/', //"https://tm.ovadamd.org/",
	socketUrl: 'https://citimed.socket.ovadamd.com/',
	removeUnusedCode: true,
	timeZone: ' UTC',


};

// Ovadamd Prod Environment
// clinic_mgmt_front_build	https://citimed.ovadamd.com
// document-manager	https://citimed.dm.ovadamd.com
// ovada_cm_fd_backend	https://citimed.fd.ovadamd.com
// ovada_cm_md_backend	https://citimed.md.ovadamd.com
// ovada-cm-baby	https://citimed.ocmb.ovadamd.com
// ovadahealth_backend	https://citimed.ohb.ovadamd.com
// pdf_generator	https://citimed.pdf.ovadamd.com

// Billing	9000	https://citimed.billing.ovadamd.com
// Clinic Management	5000	https://citimed.cm.ovadamd.com
// SCH	3500	https://citimed.sch.ovadamd.com
// kiosk	2000	https://citimed.kiosk.ovadamd.com
// pt	4000	https://citimed.pt.ovadamd.com
// accu	8000	https://citimed.accu.ovadamd.com
// chiro	3000	https://citimed.chiro.ovadamd.com
// Task-Manager	6000	https://citimed.tm.ovadamd.com

// DB Host: cm-production.culcnqyn18ni.us-east-1.rds.amazonaws.com
// VPN IP: 34.201.167.31
