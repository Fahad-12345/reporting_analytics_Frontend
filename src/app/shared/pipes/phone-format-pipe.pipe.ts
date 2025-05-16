import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'phoneFormatPipe'
})
export class PhoneFormatPipe implements PipeTransform {

	transform(value: any, args?: any): any {
		if (value == 'N/A' || !value) {
			return value;
		}

		return this.phoneFormat('' + value);
	}
	phoneFormat = (id) => {

		if (id == null || id == "null") {
			return ""
		}

		if (id.length != 10) {
			return id
		}
		id = id.substring(0, 3) + "-" + id.substring(3, 6) + "-" + id.substring(6);

		return id
	}
}
