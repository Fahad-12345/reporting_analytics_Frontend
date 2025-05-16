export class MappingFilterObject {
	constructor(
		public id: number,
		public name: string,
		public full_Name: string,
		public facility_full_name: string,
		public label_id: any,
		public insurance_name: string,
		public employer_name?: string,
		public created_by_name?: string,
		public updated_by_name?: string,
		

	) {
		this.id = id;
		this.name = name;
		this.full_Name = full_Name;
		this.facility_full_name = facility_full_name;
		this.label_id = label_id;
		this.insurance_name = insurance_name;
		this.employer_name = employer_name;
		this.created_by_name = created_by_name;
		this.updated_by_name = updated_by_name;
		
	}
}


export class MappingFilterShareableObject {
	constructor(
		public isConcate:any,
		public concateRoleQualifier:boolean,
		public updatedOb:any,
		public id: any,
		public template_id: any,
		public name: string,
		public full_name: string,
		public facility_full_name: string,
		public label_id: any,
		public insurance_name: string,
		public employer_name: string,
		public first_name: string,
		public middle_name: string,
		public last_name: string,
		public plan_name: string,
		public template_name: string,
		public template_type: string,
		public bindlabelName: string,
		public bindIdName: string,
		public qualifier: string,
		public realObj?:any
		
	) {
		this.isConcate = isConcate;
		this.concateRoleQualifier = concateRoleQualifier;
		this.updatedOb = updatedOb;
		this.id = id;
		this.template_id = template_id;
		this.name = name;
		this.full_name = full_name;
		this.facility_full_name = facility_full_name;
		this.label_id = label_id;
		this.insurance_name = insurance_name;
		this.employer_name = employer_name;
		this.first_name = first_name;
		this.middle_name = middle_name;
		this.last_name = last_name;
		this.plan_name = plan_name;
		this.template_type = template_type
		this.bindlabelName = bindlabelName;
		this.bindIdName = bindIdName;
		this.realObj = realObj;
		this.qualifier = qualifier;
		this.bindName();
		this.bindId();
		this.getRoleQualifierTooltip();
	}
	bindId() {
		if(this.bindIdName == this.bindlabelName) {
			this.id = this.name;
		} else {
			if(this.bindIdName){
				this.id = this.realObj && this.realObj[this.bindIdName];
				return;
			}
			this.id = this.id;
		}
	}
	bindName(){
		if(this.bindlabelName === 'id'){
			return this.name = this.id;
		}
		if(this.bindlabelName === 'name'){

			return this.name;
		}
		if(this.bindlabelName === 'place_of_service_name'){
			return  this.name = this.name +' '+ this.realObj?.code;
		}
		if(this.bindlabelName === 'facility_full_name'){
			return this.name = this.facility_full_name ? this.facility_full_name : this.name;
		}

		if(this.bindlabelName === 'label_id'){
			return this.name = this.label_id ? this.label_id : this.name;
		}

		if(this.bindlabelName === 'insurance_name'){
			return this.name = this.insurance_name ? this.insurance_name : this.name ;
		}
		
		if(this.bindlabelName === 'employer_name'){
			return	this.name = this.employer_name ? this.employer_name : this.name;
		}
		if(this.bindlabelName === 'full_name'){
			return this.name = this.getFullName().length !=2  ? this.getFullName(): this.name;
		}
		if (this.bindlabelName ==='template_facility_full_name'){
			debugger;
			this.realObj;
			console.log('called Template ')
			return 'Hamza'
			
			// return this.name = `${this.realObj.first_name} ${this.realObj.middle_name?this.realObj.middle_name:''} ${this.realObj.last_name}${this.realObj.street_address?' - '+this.realObj.street_address+",":''} 
			// ${this.realObj.floor?this.realObj.floor+",":''} ${this.realObj.city?this.realObj.city+",":''} ${this.realObj.state?this.realObj.state:''} ${this.realObj.zip?this.realObj.zip:''} `;
		}
		if (this.bindlabelName ==='refferingOfficeName'){
			if(this.realObj?.clinic_id){
				return this.name = `${this.realObj?.name ? this.realObj?.name+' - ' : this.realObj?.clinic_name ? this.realObj?.clinic_name+' - ':''} ${this.realObj?.first_name} ${this.realObj?.middle_name ? this.realObj?.middle_name:''} ${this.realObj?.last_name} ${this.realObj?.physician_specialty_name ? ' - ' +this.realObj?.physician_specialty_name:''} ${this.realObj?.referring_physician_speciality?.name ? ' - ' +this.realObj?.referring_physician_speciality?.name:''} ${this.realObj?.physician_speciality_name ? ' - ' +this.realObj?.physician_speciality_name:''}  ${this.realObj?.clinic_street_address ? ' - '+this.realObj?.clinic_street_address+",": this.realObj?.street_address ? ' - '+this.realObj?.street_address+' - ':''} 
				${this.realObj?.clinic_floor ? this.realObj?.clinic_floor+",": this.realObj?.floor ? this.realObj?.floor+",":''} ${this.realObj?.clinic_city ? this.realObj?.clinic_city+",": this.realObj?.city ? this.realObj?.city+",":'' } ${this.realObj?.clinic_state ? this.realObj?.clinic_state: this.realObj?.state ? this.realObj?.state:''} ${this.realObj?.clinic_zip ? this.realObj?.clinic_zip: this.realObj?.zip ? this.realObj?.zip:''} `;
			}
			else if(this.realObj?.facility_id){
				return this.name = `${this.realObj?.name ? this.realObj?.name+' - ' : this.realObj?.facility_name ? this.realObj?.facility_name+' - ':''} ${this.realObj?.first_name} ${this.realObj?.middle_name ? this.realObj?.middle_name:''} ${this.realObj?.last_name} ${this.realObj?.physician_specialty_name ? ' - ' +this.realObj?.physician_specialty_name:''} ${this.realObj?.referring_physician_speciality?.name ? ' - ' +this.realObj?.referring_physician_speciality?.name:''} ${this.realObj?.physician_speciality_name ? ' - ' +this.realObj?.physician_speciality_name:''}  ${this.realObj?.facility_address?' - '+this.realObj?.facility_address+",":''} 
				${this.realObj?.floor ? this.realObj?.floor+",":this.realObj?.facility_floor ? this.realObj?.facility_floor+",":''} ${this.realObj?.facility_city ? this.realObj?.facility_city+",":''} ${this.realObj?.facility_state ? this.realObj?.facility_state:''} ${this.realObj?.facility_zip ? this.realObj?.facility_zip:''} `;
			}
		}
		if (this.bindlabelName ==='clinicLocation'){
			return this.name = `${this.realObj.name}${this.realObj.street_address?', '+this.realObj.street_address+",":''} 
			${this.realObj.floor?this.realObj.floor+",":''} ${this.realObj.city?this.realObj.city+",":''} ${this.realObj.state?this.realObj.state:''} ${this.realObj.zip?this.realObj.zip:''} `;
		}
		if (this.bindlabelName ==='provider_with_billing_title'){
			return this.name = `${this.realObj.first_name} ${this.realObj.middle_name?this.realObj.middle_name:''} ${this.realObj.last_name}${this.realObj.medical_identifier && this.realObj.medical_identifier.billing_title && this.realObj.medical_identifier.billing_title.name ?', '+this.realObj.medical_identifier.billing_title.name:''}`;
		}
		if(this.bindlabelName === 'plan_name'){
			return this.name = this.plan_name ? this.plan_name : this.name;
		}
		if(this.bindlabelName === 'template_name') {
			return this.name = this.template_name ? this.template_name : this.name;
		}
		
		if(this.bindlabelName === 'NameDescription'){
			if(!this.isConcate) {
				return this.name  = `${this.realObj.name ? this.realObj.name : null} ${this.realObj.description ? '- '+ this.realObj.description : ''}`;
			} else {
				if(this.updatedOb.length == 1) {
					return this.name  = `${this.updatedOb[0].name ? this.updatedOb[0].name : null} ${this.updatedOb[0].description ? '- ' + this.updatedOb[0].description : ''}`;
				}
			
			}
		}
		
		if(this.bindlabelName){
			this.name = this.realObj && this.realObj[this.bindlabelName];
			return;
		}
	}

	getFirstName(): string{
		return this.first_name ? this.first_name : '';
	}

	getMiddleName(){
		return this.middle_name ? this.middle_name : '';
	}

	getLastName(){
		return this.last_name ? this.last_name : '';
	}

	getBillingTitle(){
		return this.concateRoleQualifier
            ? this.realObj?.billing_titles_name ? `, ${this.realObj?.billing_titles_name}` : ''
            : this.realObj && this.realObj.medical_identifier && this.realObj.medical_identifier.billing_title
            ? `, ${this.realObj.medical_identifier.billing_title.name}`
            : '';
	}
	getRoleQualifier(key:string){
		return this.concateRoleQualifier
        ? this.getBillingTitle()
        ? `${this.realObj?.[key] ?' ('+this.realObj?.[key]+')':''}`
        :this.realObj?.[key] ? `, ${this.realObj?.[key]}` : ''
        : '';
	}
	getFullName(){
		return this.getFirstName() + ' ' + this.getMiddleName() + ' '+ this.getLastName() + this.getBillingTitle() + this.getRoleQualifier('role_qualifier');
	}
	getRoleQualifierTooltip(){
		this.realObj['roleQualifierName'] = this.getFirstName() + ' ' + this.getMiddleName() + ' '+ this.getLastName() + this.getBillingTitle() + this.getRoleQualifier('role_name');
	}
	
}
