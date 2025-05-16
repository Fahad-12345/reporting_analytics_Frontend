// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

// Old code

export const environment: { [task_mngr_api_dev: string]: any } = {
	production: true,
	isServer: false,
	host: 'http://localhost:4000',
	apiUrl: '',
	billing_api_url: 'https://billing.dev-sch.ovadamd.org/api/',
	fd_api_url: 'https://cm.dev-sch.ovadamd.org/api/',
	md_api_url: 'https://md.dev-sch.ovadamd.org/api/',
	schedulerApiUrl: 'https://cm.dev-sch.ovadamd.org/api/sch2',
	fd_api_url_vd: 'https://cm.dev-sch.ovadamd.org/api/vd/',
	schedulerApiUrl1: 'https://cm.dev-sch.ovadamd.org/api/sch2',
	health_app_api_url : ' https://health.dev-sch.ovadamd.org/api/',
	// schedulerApiUrl: "https://sch.dev-sch.ovadamd.org/",
	// schedulerApiUrl18: 'http://18.216.104.240:3000/',

	whitelistedDomains: ['localhost', '*.dev-sch.ovadamd.org'],
	// kiosk_api_path: 'https://192.168.1.194:5000/api/',
	kiosk_api_path: 'https://rk.dev-sch.ovadamd.org/api/',

	// kiosk_api_path: 'https://rk.dev-sch.ovadamd.org/api/',
	schedular_api_path: 'https://fd.dev-sch.ovadamd.org/api/',
	// document_mngr_api_path: 'https://dm.dev-sch.ovadamd.org/api/',
	document_mngr_api_path: 'https://cm.dev-sch.ovadamd.org/api/dm/',
	userManagementUrl: 'https://fd.dev-sch.ovadamd.org/api',
	billing_api_path: 'https://billing.dev-sch.ovadamd.org/api/',
	// task_mngr_api_dev: 'https://localhost:3000/api',
	task_mngr_api_dev: 'https://tm.dev-sch.ovadamd.org/api',
	gooleIncludedCountries: ['us', 'pk'],
  templateManagerUrl: 'https://templateapi.dev-sch.ovadamd.org/',
	// env for ringcentral
	RCSDK_VERSION: '3.2.2',
	username: 'qaiser.a@quickbillsmd.com',
	ext: '101',
	password: 'quickbills@123',
	appKey: 'tjxahW1YR7u0ATi_a037Vw',
	appSecret: 'jDbSyxalRT - idsNIO2 - fQQwXWVcTKdR2WBFqSuOkS83g',
	task_socketUrl: 'https://tm.dev-sch.ovadamd.org/',
	socketUrl: "https://socket.dev-sch.ovadamd.org/",

};

// Waseem Code
// export const environment: { [name: string]: any } = {
//   production: false,
//   isServer: false,
//   host: 'http://localhost:4000',
//   apiUrl: "",
//   fd_api_url: "https://www2.ovadamd.ml/api/",
//   md_api_url: "https://www3.ovadamd.ml/ovada_cm_md_backend/api/",
//   schedulerApiUrl: "https://sch.ovadamd.ml/",
//   whitelistedDomains: ['54.157.104.184', '172.16.1.129', "localhost", 'https://staging.ovadamd.com'],
//   // kiosk_api_path: 'http://192.168.1.194:5000/api/',
//   kiosk_api_path: 'https://kb.ovadamd.ml/api/',
//   schedular_api_path: 'https://sch.ovadamd.ml/',
//   document_mngr_api_path: 'https://www3.ovadamd.ml/document-manager/api/',
//   userManagementUrl: 'https://www2.ovadamd.ml/api',
//   billing_api_path: 'https://billing.ovadamd.ml/api/',
//   // task_mngr_api_dev: 'http://localhost:3000/api',
//   task_mngr_api_dev: 'http://35.170.182.165:3000/api',
//   gooleIncludedCountries: ['us', 'pk'],
//   task_socketUrl: "http://35.170.182.165:3000/",
// };
