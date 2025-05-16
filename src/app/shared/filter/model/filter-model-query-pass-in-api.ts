import { FilterModelQuery } from "./filter-model-query";

export class FilterModelQueryPassInApi extends FilterModelQuery {

    constructor(values: object = {}){
        super(values);

    }

    setFieldValueOfMultipleSelection(info: any, field: string) {
		if(info && typeof(info) != 'object' ){
		const data  = JSON.parse(info);
            if (data.length > 1) {
				data.map(value =>  this[field].push(Number(value.id)));
            } else {
                this[field].push(data[0] ? Number(data[0].id) : Number(data));
            }
		}else{
            if(info){
                if (info.length > 1) {
                    info.map(value =>  this[field].push(Number(value)));
                } else {
                    this[field].push(Number(info));
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
