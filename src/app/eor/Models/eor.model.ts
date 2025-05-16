import { toArray } from "rxjs/operators";

export interface IEOR {
    date: string;
    amount: string;
    eor_type: any[];
    description: string;
    media: any[];
    file_name: string;
    eor_type_id:any[];
    files:any;
    getEorMediaLink(): string;
    getMediaExist(): boolean;
    getMediaId(): number;
	
}

export class EORMODEL implements IEOR {
    date: string;
    amount: string;
	eor_type: any[] = [];
	eor_status: any;
    description: string;
    media: any[]=[];
    file_name: string;
	eor_type_id: any[] = [];
	eor_status_id;
	files:any;
    id:number;
    media_id: number;

    constructor(values: Object={}){
        Object.assign(this, values);
		this.eor_type_id = this.eor_type;
		this.eor_status_id = [this.eor_status];
        this.file_name =  this.setFileName();

    }
    getEorMediaLink(): string {
        return this.files ? this.files.pre_signed_url: '';
    }
    getMediaExist(): boolean {
        return this.file_name ? true : false;
    }

    setFileName(){
        if(this.files){
           const name =  this.files.file_name.split('_');
           name.shift();
           return name.join('_');
        }else{
            return '';
        }
    }
    
    getMediaId(){
        return this.media_id;
    }
}
