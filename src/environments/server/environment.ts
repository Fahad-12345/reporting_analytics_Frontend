// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.


// Waseem Code
export const environment: { [name: string]: any } = {
  production: false,
  isServer: false,
  host: 'http://localhost:4000',
  apiUrl: "",
  // fd_api_url: "http://192.168.1.59/cm-repo/public/api/",
  fd_api_url: "https://www2.ovadamd.ml/api/",
  md_api_url: "https://www3.ovadamd.ml/ovada_cm_md_backend/api/",
  schedulerApiUrl: "https://cm.ovadamd.org/api/sch",
  // schedulerApiUrl18: 'http://18.216.104.240:3000/',
  whitelistedDomains: ['54.157.104.184', 'https://staging.ovadamd.com', "localhost", '172.16.1.129'],
  kiosk_api_path: 'https://kb.ovadamd.ml/', // Live
  task_mngr_api_dev: 'http://35.170.182.165:3000/api',
  // kiosk_api_path: 'http://192.168.1.194:2000/api/' //Saad

  // env for ringcentral
  RCSDK_VERSION: '3.2.2',
  username: 'qaiser.a@quickbillsmd.com',
  ext: '101',
  password: 'quickbills@123',
  appKey: 'tjxahW1YR7u0ATi_a037Vw',
  appSecret: 'jDbSyxalRT - idsNIO2 - fQQwXWVcTKdR2WBFqSuOkS83g',
  task_socketUrl: "http://35.170.182.165:3000/",
};
