export class CustomUrlBuilder {
	public static buildUrl(url, object: ParamQuery) {
		if (object == undefined || object == null) {
			return url;
		}
		var keys = Object.keys(object);
		url = url + '?';
		keys.forEach((key, index) => {
			if (object[key] === undefined || object[key] === null || object[key] === '') {
				delete object[key];
				return;
			}
			url = url + key + '=' + object[key];
			if (index != keys.length - 1) {
				url = url + '&';
			}
		});
		return url;
	}
}

export interface ParamQuery {
	pagination: boolean;
	// per_page?: number;
	per_page?: number;
	page?: number;
	order: OrderEnum;
	filter: boolean;
	dropDownFilter?:boolean;
	firm_id?: number;
	order_by?: string;
	bill_date_range1?: string;
	bill_date_range2?: string;
}
export enum OrderEnum {
	ASC = 'ASC',
	DEC = 'DESC',
}

export interface GetLocationsToAttachAttorneyQueryI {
	firm_dropdown?: boolean;
}