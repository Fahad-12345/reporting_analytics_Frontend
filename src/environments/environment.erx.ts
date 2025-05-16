


const envIntial = "ovadamd.org";
const serverIntial = `cm.${envIntial}`;
const erxInitial = `cm.backup.${envIntial}`;
const billingIntial = `billing.${envIntial}`;
const healthIntial = `health.${envIntial}`;
const templateMangerIntial = `tm.${envIntial}`;
const socketIntial = `socket.${envIntial}`

export const environment: { [task_mngr_api_dev: string]: any } = {
	production: false,
	isServer: false,
	host: `http://localhost:4000`,
	apiUrl: ``,
	billing_api_url:  `https://${serverIntial}/api/node/billing/`,
	fd_api_url: `https://${erxInitial}/api/`,
	payment_url: `https://${serverIntial}/api/`,
	md_api_url: `https://${serverIntial}/api/md/`,
	schedulerApiUrl: `https://${serverIntial}/api/node/sch`,
	fd_api_url_vd: `https://${serverIntial}/api/vd/`,
	schedulerApiUrl1: `https://${serverIntial}/api/node/sch`,
	health_app_api_url : ` https://${healthIntial}/api/`,
	whitelistedDomains: [`localhost`, `*.${envIntial}`],
	kiosk_api_path: `https://${erxInitial}/api/node/kiosk/`,
	document_mngr_api_path: `https://${serverIntial}/api/dm/`,
	billing_api_path: `https://${serverIntial}/api/node/billing/`,
	task_mngr_api_dev: `https://${templateMangerIntial}/api`,
	gooleIncludedCountries: [`us`, `pk`],
    templateManagerUrl: `https://templateapi.${envIntial}/`,
	erx_api_url: `https://${erxInitial}/api/node/erx/`,
	erx_fd_api: `https://${serverIntial}/api/`,
    is_prod: false,
	RCSDK_VERSION: `3.2.2`,
	task_socketUrl: `https://${templateMangerIntial}/`,
	socketUrl: `https://${socketIntial}/`,
	timeZone: ' UTC',
	CipherKey:''
};

