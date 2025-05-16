export interface IVerificationEdit {
	id: number;
	date: string;
	verification_type: any[];
	verification_status: any;
	description: string;
	media: any;
	file_name: string;
	verification_status_id: any;
	verification_type_ids: any[];
	getId(): number;
	getDate(): string;
	getVerificationType(): any[];
	getDescription(): string;
	getMediaExist(): boolean;
	getMediaLink(): string;
}

export class VerificationEditModel implements IVerificationEdit {
	id: number;
	date: string;
	verification_type: any[];
	verification_status: any;
	description: string;
	media: any;
	verification_status_id: any;
	file_name: string;
	verification_type_ids: any[];

	constructor(values: Object = {}) {
		Object.assign(this, values);
		this.file_name = this.setFileName();
		this.verification_status_id = [this.verification_status];
		this.verification_type_ids = this.verification_type;
	}
	getId(): number {
		return this.id;
	}
	getDate(): string {
		return this.date;
	}
	getVerificationType(): any[] {
		return this.verification_type;
	}
	getDescription(): string {
		return this.description;
	}
	getMediaExist(): boolean {
		return this.media ? true : false;
	}
	getMediaLink(): string {
		return this.media.pre_signed_url;
	}

	setFileName() {
		if (this.media) {
			const name = this.media.file_name.split('_');
			name.shift();
			return name.join('_');
		} else {
			return '';
		}
	}
}
