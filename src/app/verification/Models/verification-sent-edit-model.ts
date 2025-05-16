export class VerificationSentEditModel {
    id: number;
	date: string;
	description: string;
	media_id: number;
    verification_received_id: number;
    file_name: string;
    media: any;
    link: string;
	constructor(values: Object = {}) {
        Object.assign(this, values);
        this.file_name = this.setFileName();
    }
    getFileName(){
       return this.media ? this.media.file_name : '';
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

    getLink(){
        return this.media ? this.media?.pre_signed_url: null;
    }





}
