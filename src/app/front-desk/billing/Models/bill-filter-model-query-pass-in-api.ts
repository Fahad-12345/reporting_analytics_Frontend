import { BillingFilterModel } from "./billing-filter-model";

export class BillFilterModelQueryPassInApi  extends BillingFilterModel {
    constructor(values: object={}){
        super(values);
    }

    setFieldValueOfMultipleSelection(info: any, field: string) {
		if(info && typeof(info) != 'object' ){
		const data  = JSON.parse(info);
            if (data.length > 1) {
				data.map(value =>  this[field].push( typeof (value?.id) === 'string'? value?.id : Number(value?.id)));
            } else {
                this[field].push(data[0] ? typeof (data[0]?.id) === 'string'? data[0]?.id : Number(data[0]?.id) :typeof (data[0]?.id) === 'string'? data : Number(data));
            }
		}else{
            if(info){
                if (info.length > 1) {
                    info.map(value =>  this[field].push(typeof value === 'string'? value: Number(value)));
                } else {
                    this[field].push(typeof info === 'string'? info : Number(info));
                }
            }
        }
	}

    setFiledValueOfTextOrDate(data: any, field: string){
       if(data){
        this[field] = data;
       }
    }
}
