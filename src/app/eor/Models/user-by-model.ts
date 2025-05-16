export interface IUser {
	id: number;
	first_name: string;
	middle_name: string;
	last_name: string;
	full_Name: string;
}

export class UserByModel implements IUser {
	id: number;
	first_name: string;
	middle_name: string;
	last_name: string;
	full_Name: string;
	constructor(value: Object = {}) {
		Object.assign(this, value);
		this.full_Name = this.getFullName();
	}

	getFirstName(){
		return this.first_name ? this.first_name : '';
	}

	getMiddleName(){
		return this.middle_name ? this.middle_name : '';
	}

	getLastName(){
		return this.last_name ? this.last_name : '';
	}

	getFullName(){
		return this.getFirstName() + ' ' + this.getMiddleName() + ' '+ this.getLastName();
	}

}
