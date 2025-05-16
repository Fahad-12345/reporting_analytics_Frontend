export interface IPaymentEdit{
    id: number;
    bill_id: number;
	action_type_id: number | any[];
	types: any[];
	by_id: number | any[];
	media_id: number;
	check_date: string;
	check_no: string;
	check_amount: number;
	description: string;
	interest_amount: number;
	status_id: number | any[];
	case_id: number;
    file_name: string;
    action_type: any;
    by: any;
    media: any;
    status: any;
    type: any;
    getMediaExist(): boolean;
    getMediaFileLink(): string;
    getBillId(): number;
}
export class PaymentEditModel implements IPaymentEdit {
    id: number;
    bill_id: number;
	action_type_id: number | any[];
	types: any[] = [];
	by_id: number | any[];
	media_id: number;
	check_date: string;
	check_no: string;
	check_amount: number;
	description: string;
	interest_amount: number;
	status_id: number | any[];
	case_id: number;
    file_name: string;
    action_type: any;
    by: any;
    media: any;
    status: any;
    type: any;
    recipient_id:any;
    recipient_slug:any;
    recipient_name:any;
    constructor(values: Object={}){
        Object.assign(this, values);
        this.action_type_id = this.action_type ? [this.action_type] : null;
        this.by_id = this.by ? [this.by] : null;
        this.file_name = this.setFileName();
        this.status_id = this.status ? [this.status]: null;
        this.types = [this.type];
        this.recipient_id=this.getRecipientData();
    }
    getRecipientData(){
        return [{
            recipient_id: this.recipient_id || '',
            recipient_name:this.recipient_name || '',
            recipient_slug:this.recipient_slug || ''
        }]
    }
    getBillId(): number {
       return this.bill_id;
    }
    getMediaExist(): boolean {
        return this.media ? true : false;
    }
    getMediaFileLink(): string {
        return this.media ? this.media.pre_signed_url : '';
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
