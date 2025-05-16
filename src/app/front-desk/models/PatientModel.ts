export interface Patient {
    id: null
    first_name: string
    middle_name: string
    last_name: string
    dob: string
    gender: string
    age: null
    ssn: string
    cell_phone: string
    home_phone: string
    work_phone: string
    height_ft: null | number
    height_in: null | number
    weight_lbs: null | number
    weight_kg: null | number
    meritial_status: null | number
    profile_avatar: null | number
    need_translator: null | number
    language: null | number
    is_pregnant: null | number
    is_law_enforcement_agent: null | number
    status: string
    chart_id: string
    self: Self
    emergency: Emergency
    allergy_status_id: string | null
    allergy_types : []
}
export interface Self {
    contact_information: ContactInformation
    id: null | number
    key: null | number
    case_id: null | number
    contact_person_type_id: null | number
    contact_person_relation_id: null | number
    other_relation_description: null | number
    first_name: null | number
    middle_name: null | number
    last_name: null | number
    ssn: null | number
    dob: null | number
    age: null | number
    gender: null | number
    email: string
    fax: null | number
    cell_phone: string
    home_phone: string
    work_phone: string
    ext: null | number
    height_in: null | number
    height_ft: null | number
    weight_lbs: null | number
    weight_kg: null | number
    marital_status: null | number
    is_resedential_same: null | number
    is_form_filler: null | number
    is_emergency: null | number
    is_guarantor: null | number
    workplace_name: null | number
    object_id: number | null

}
export interface Emergency {

}
export interface ContactInformation {
    mail_address: MailAddress
    residential_address: any
}
export interface MailAddress {
    id: null | number
    key: null | number
    contact_person_id: null | number
    type: string
    street: string
    apartment: string
    latitude: null | number
    longitude: null | number
    city: string
    state: string
    zip: string
}
export interface ResidentialAddress {

} 


export class AllergyTypes{
    allergiesArr:any[] = [];
    selectedReactions:any[] = [];
    selectedAllergies:any[] = [];
    constructor(allergies:any[]){
        this.allergiesArr = allergies;
    }
    formatAllergiesforEdit(){
        this.allergiesArr && this.allergiesArr.forEach((obj,indx)=>{
            obj['name'] = obj['allergy_type'] && obj['allergy_type'].name;
            obj['allergies'] && obj['allergies'].forEach((allergy,index)=>{

                allergy['reaction_ids'] = allergy['reactions'] && allergy['reactions'].map(x => x.reaction_id);

                this.selectedAllergies.push(allergy['allergy']);

                allergy['reactions'] && allergy['reactions'].map(x => this.selectedReactions.push(x.reaction));
                
                allergy['selectedReactionsTooltipDisp'] = allergy['reactions']&&allergy['reactions'].map(x => x.reaction.name).join(', ');
            })
        })
    }
    getAllReactions(){
        return this.selectedReactions
    }
    getAllallergies(){
        return this.selectedAllergies
    }
    getAllergyTypesIds(){
        let getIds = this.allergiesArr.map(x => x.allergy_type_id)
        return getIds;
    }

}
