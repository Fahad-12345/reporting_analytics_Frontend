// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.



// Old code
export const environment: { [task_mngr_api_dev: string]: any } = {
  production: false,
  isServer: false,
  host: 'http://localhost:4000',
  apiUrl: "",
  billing_api_url: 'http://alpha.ovadamd.com/ovada_cm_fd_backend/api/',
  fd_api_url: "http://alpha.ovadamd.com/ovada_cm_fd_backend/api/",
  md_api_url: "http://alpha.ovadamd.com/ovada_cm_fd_backend/api/",
  schedulerApiUrl: "https://cm.ovadamd.com/api/sch",
  // schedulerApiUrl18: 'http://18.216.104.240:3000/',
  whitelistedDomains: ["localhost", 'http://demo.ovadamd.com', "http://alpha.ovadamd.com"],
  // kiosk_api_path: 'http://192.168.1.194:5000/api/',
  kiosk_api_path: 'http://alpha.ovadamd.com/ovada_cm_fd_backend',
  schedular_api_path: 'http://alpha.ovadamd.com/ovada_cm_fd_backend',
  document_mngr_api_path: 'http://alpha.ovadamd.com/ovada_cm_fd_backend/api/',
  userManagementUrl: 'http://alpha.ovadamd.com/ovada_cm_fd_backend/api',
  billing_api_path: 'http://alpha.ovadamd.com/ovada_cm_fd_backend',
  // task_mngr_api_dev: 'http://localhost:3000/api',
  task_mngr_api_dev: 'http://alpha.ovadamd.com/ovada_cm_fd_backend/api',
  gooleIncludedCountries: ['us', 'pk'],

  // env for ringcentral
  RCSDK_VERSION: '3.2.2',
  username: 'qaiser.a@quickbillsmd.com',
  ext: '101',
  password: 'quickbills@123',
  appKey: 'tjxahW1YR7u0ATi_a037Vw',
  appSecret: 'jDbSyxalRT - idsNIO2 - fQQwXWVcTKdR2WBFqSuOkS83g',
  task_socketUrl: "http://alpha.ovadamd.com/ovada_cm_fd_backend/",
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

