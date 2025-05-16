export class PaymentModal {
	id: number;
	bill_id: number;
	action_type_id: number | any[];
	types: any | string[] = [];
	by_id: number;
	media_id: number;
	check_date: string;
	check_no: string;
	check_amount: number;
	description: string;
	interest_amount: number;
	status_id: number;
	case_id: number;
	file_name: string;
	recipient_id:any[]=[];
	recipient_name:any[]=[];
	recipient_slug:any;

	constructor(values: Object = {}) {
		Object.assign(this, values);
		this.action_type_id = this.getActionType();
		this.recipient_slug = this.by_id;
		this.by_id = this.getBuyId();
		this.status_id = this.getStatusId();
		this.types = this.getTypes();
		this.recipient_name=this.recipient_id;
		this.recipient_id=this.getRecipientId();
		this.recipient_name=this.getRecipientName();
		this.recipient_slug=this.getRecipientSlug();
	}

	getRecipientSlug(){
		return this.recipient_slug?.length>0 && this.recipient_slug[0]?.name?.toLowerCase()=='attorney'?'firm':this.recipient_slug[0]?.name?.toLowerCase(); 
	}

	getRecipientId(){
		return this.recipient_id?.length>0 ? this.recipient_id[0]?.recipient_id: null;
	}
	getRecipientName(){
		return this.recipient_name?.length>0 ? this.recipient_name[0]?.recipient_name:null;
	}
	getActionType() {
		return this.action_type_id[0] ? this.action_type_id[0]['id']: null;
	}
	getBuyId() {
		return this.by_id[0] ? this.by_id[0]['id']: null;
	}
	getStatusId(): number {
		if(this.status_id){
			return this.status_id[0] ? this.status_id[0]['id'] : null;
		} 
	}

	getTypes() {
		return this.types.map((data) => this.conversionToString(data.name));
	}

	conversionToString(name: string){
		return name.toLocaleLowerCase();
	}
}
