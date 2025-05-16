import { ClassLicenseStatus, ClassUserLicenseStatus } from "./userLicneseStatus.modal";

export class Proofing {
	userLicenseStatus = new ClassUserLicenseStatus();
	LicenseStatus = new ClassLicenseStatus();
	proofingEnum = ProofingEnum;
	//STATUS OF PROOFING
	status: string = this.proofingEnum.STATUS_INITIAL;
	//RESULT OF PROOFING
	result: string = this.proofingEnum.RESULT_INITIAL;
	// USER LICENSE STATUS ID
	user_license_status_id: any = this.proofingEnum.RESULT_INITIAL;
	// LICENSE STATUS 
	license_status: any = this.proofingEnum.RESULT_INITIAL;
	// ==========================================WHICH BUTTON DISPLA ====================================
	START_BUTTON = false;
	WEB_CAM_BUTTON = false;
	RESUME_BUTTON = false;
	CANCEL_BUTTON = false;
	displayOrHideButton() {
		debugger;
		if (this.status == this.proofingEnum.STATUS_EMPTY && this.result == this.proofingEnum.RESULT_EMPTY) {
			this.START_BUTTON = true;
			this.WEB_CAM_BUTTON = false;
			this.RESUME_BUTTON = false;
			this.CANCEL_BUTTON = false;
		} else if (this.status == this.proofingEnum.STATUS_COMPLETE && this.result == this.proofingEnum.RESULT_SUCCESS && this.user_license_status_id == this.userLicenseStatus.Dead_User_Status_ID && this.license_status == this.LicenseStatus.License_Status_One) {
			this.START_BUTTON = true;
			this.WEB_CAM_BUTTON = false;
			this.RESUME_BUTTON = false;
			this.CANCEL_BUTTON = false;
		} else if (this.status == this.proofingEnum.STATUS_COMPLETE && this.result == this.proofingEnum.RESULT_FAIL) {
			this.START_BUTTON = true;
			this.WEB_CAM_BUTTON = false;
			this.RESUME_BUTTON = false;
			this.CANCEL_BUTTON = false;
		} else if (this.status == this.proofingEnum.STATUS_START_DONE && this.result == this.proofingEnum.RESULT_START_DONE) {
			this.CANCEL_BUTTON = true;
			this.WEB_CAM_BUTTON = false;
			this.RESUME_BUTTON = false;
			this.START_BUTTON = false;
		} else if (this.status == this.proofingEnum.STATUS_ACTIVE) {
			this.CANCEL_BUTTON = true;
			this.WEB_CAM_BUTTON = false;
			this.RESUME_BUTTON = false;
			this.START_BUTTON = false;
		} else if (this.status == this.proofingEnum.STATUS_WTG_PROOFER) {
			this.WEB_CAM_BUTTON = true;
			this.RESUME_BUTTON = false;
			this.START_BUTTON = false;
			this.CANCEL_BUTTON = false;
		}
		else if (this.status == this.proofingEnum.STATUS_WTG_RESUME && this.result == this.proofingEnum.RESULT_NULL) {
			this.RESUME_BUTTON = true;
			this.START_BUTTON = false;
			this.WEB_CAM_BUTTON = false;
			this.CANCEL_BUTTON = false;
		} else if (this.status == this.proofingEnum.STATUS_WTG_RESUME && this.result == this.proofingEnum.RESULT_INITIAL) {
			this.RESUME_BUTTON = true;
			this.START_BUTTON = false;
			this.WEB_CAM_BUTTON = false;
			this.CANCEL_BUTTON = false;
		}
		else if (this.status == this.proofingEnum.STATUS_COMPLETE && this.result == this.proofingEnum.RESULT_SUCCESS) {
			this.WEB_CAM_BUTTON = false;
			this.RESUME_BUTTON = false;
			this.START_BUTTON = false;
			this.CANCEL_BUTTON = false;
		} else {
			this.CANCEL_BUTTON = false;
			this.WEB_CAM_BUTTON = false;
			this.RESUME_BUTTON = false;
			this.START_BUTTON = false;
		}
		let response = {
			WEB_CAM_BUTTON: this.WEB_CAM_BUTTON,
			RESUME_BUTTON: this.RESUME_BUTTON,
			START_BUTTON: this.START_BUTTON,
			CANCEL_BUTTON: this.CANCEL_BUTTON
		}
		return response;
	}
}
export class DisableButton {
	START_BUTTON = false;
	WEB_CAM_BUTTON = false;
	RESUME_BUTTON = false;
	CANCEL_BUTTON = false;
}
export enum ProofingEnum {
	USER_LICENSE_STATUS_ID_INITIAL = 'initial', // INITIAL SET WHEN NULL RECEIVE OR WHEN NOT USING SET AS INITAL
	LICENSE_STATUS_ID_INITIAL = 'initial', // INITIAL SET WHEN NULL RECEIVE OR WHEN NOT USING SET AS INITAL
	STATUS_INITIAL = 'initial', // INITIAL SET WHEN NULL RECEIVE
	STATUS_EMPTY = 'empty',
	STATUS_ACTIVE = 'active',
	STATUS_START_DONE = 'start',
	STATUS_COMPLETE = 'complete',
	STATUS_WTG_PROOFER = 'wtg_proofer',
	STATUS_WTG_RESUME = 'wtg_resume',
	RESULT_INITIAL = 'initial', // INITIAL SET WHEN NULL RECEIVE MEANS I HAVE SET THIS ON WHERE I'M NOT GETTING KEY VALUE
	RESULT_EMPTY = 'empty',
	RESULT_SUCCESS = 'success',
	RESULT_START_DONE = 'start',
	RESULT_NULL = 'null',
	RESULT_FAIL = 'fail',
	WEB_CAME_URL = 'https://portal.exostartest.com/l3xopbcalendar'
}



