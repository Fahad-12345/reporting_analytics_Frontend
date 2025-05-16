
const envIntial = "ovadamd.net";
const serverIntial = `invoice-builder.cm.${envIntial}`;
const billingIntial = `invoice-builder.billing.${envIntial}`;
const healthIntial = `health.${envIntial}`;
const templateMangerIntial = `invoice-builder.tm.${envIntial}`;
const socketIntial = `invoice-builder.socket.${envIntial}`

export const environment: { [task_mngr_api_dev: string]: any } = {
	production: true,
	isServer: false,
	host: `http://localhost:4000`,
	apiUrl: ``,
	billing_api_url: `https://${billingIntial}/api/`,
	fd_api_url: `https://${serverIntial}/api/`,
	payment_url: `https://${serverIntial}/api/`,
	md_api_url: `https://${serverIntial}/api/md/`,
	schedulerApiUrl: `https://${serverIntial}/api/node/sch`,
	fd_api_url_vd: `https://${serverIntial}/api/vd/`,
	schedulerApiUrl1: `https://${serverIntial}/api/node/sch`,
	health_app_api_url : ` https://${healthIntial}/api/`,
	whitelistedDomains: [`localhost`, `*.${envIntial}`],
	kiosk_api_path: `https://${serverIntial}/api/node/kiosk/`,
	document_mngr_api_path: `https://${serverIntial}/api/dm/`,
	billing_api_path: `https://${billingIntial}/api/`,
	task_mngr_api_dev: `https://${templateMangerIntial}/api`,
	gooleIncludedCountries: [`us`, `pk`],
    templateManagerUrl: `https://templateapi.${envIntial}/`,
    is_prod: false,
	RCSDK_VERSION: `3.2.2`,
	task_socketUrl: `https://${templateMangerIntial}/`,
	socketUrl: `https://${socketIntial}/`,
	timeZone: ' UTC',

};





