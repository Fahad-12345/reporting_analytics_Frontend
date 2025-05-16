export interface IDenial {
	id: number;
	date: string;
	denial_type: any[];
	reason: string;
	comments: string;
	media: any;
	file_name: string;
	getId(): number;
	getDate(): string;
	getDenialType(): any[];
	getReason(): string;
	getComments(): string;
	getMediaExist(): boolean;
	getMediaLink(): string;
}

export class DenialModal implements IDenial {
	id: number;
	date: string;
	denial_type: any[];
	reason: string;
	comments: string;
	media: any;
	file_name: string;
	denial_status_id;
	denial_status;

	constructor(value: Object = {}) {
		Object.assign(this, value);
		this.file_name = this.setFileName();
		this.denial_status_id = [this.denial_status];

	}
	getId(): number {
		return this.id;
	}
	getDate(): string {
		return this.date;
	}
	getDenialType(): any[] {
		return this.denial_type;
	}
	getReason(): string {
		return this.reason;
	}
	getComments(): string {
		return this.comments;
	}
	getMediaExist(): boolean {
		return this.media? true: false;
	}
	getMediaLink(): string {
		return this.media.pre_signed_url;
	}

	setFileName(){
        if(this.media){
           const name =  this.media.file_name.split('_');
           name.shift();
           return name.join('_');
        }else{
            return '';
        }
    }
}
