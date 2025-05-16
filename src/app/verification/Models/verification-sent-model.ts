import { changeDateFormat } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';

export class VerificationSentModel {
    id: number;
	date: string;
	description: string;
	media_id: any[];
	verification_received_id: any[];

	constructor(values: Object = {}) {
		Object.assign(this, values);
		this.dateFormetSet();
	}

	setVerificationReceivedId(id: any[]) {
		this.verification_received_id = Array.isArray(id) ? id : [id];
	}

	setMediaId(id: any[]) {
		this.media_id = id;
	}

	dateFormetSet() {
		this.date = changeDateFormat(this.date);
	}
}
