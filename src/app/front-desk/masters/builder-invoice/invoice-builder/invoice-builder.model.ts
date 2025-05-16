export class InvoiceToModel {
    public invoice_to_label: string
    public invoice_to_id: string
    public invoice_to_name: string
    public street_address: string
    public suit_floor: string
    public city: string
    public state: string
    public zip: string
    public invoice_to_phone_no: string
    public realObj?: any
    constructor(values: Object = {}) {
        Object.assign(this, values)
        // this.realObj = values
    }
    get_invoice_to_id(){
        if(this.realObj){
            if(this.invoice_to_label === 'patient'){
                this.invoice_to_id = this.realObj.id    
            }else{
            this.invoice_to_id = this.realObj.id
            }
        }
        return this.invoice_to_id
    }
    get_invoice_name(){
        debugger;
        if(this.realObj){
        if(this.invoice_to_label === 'insurance'){
            this.invoice_to_name = this.realObj.insurance_name;
        }
        else if(this.invoice_to_label === 'firm'){
            this.invoice_to_name = this.realObj.location_name
        }
        else if(this.invoice_to_label === 'employer'){
            this.invoice_to_name = this.realObj.employer_name
        }else if(this.invoice_to_label === 'patient'){
            this.invoice_to_name =
            `${this.realObj.first_name} ${this.realObj.middle_name?this.realObj.middle_name+' ':''} ${this.realObj.last_name}`; 
          
        }
    }
        return this.invoice_to_name
    }
    get_street_address(){
        if(this.realObj){
        if(this.invoice_to_label === 'patient'){
            this.street_address = this.realObj.self.contact_information.mail_address.street;
        }
        else{
            this.street_address = this.realObj.street_address
        }
    }
        return this.street_address   
    }
    get_suit_floor(){
        if(this.realObj){
        if(this.invoice_to_label === 'patient'){
            this.suit_floor = this.realObj.self.contact_information.mail_address.apartment;
        }else{
            this.suit_floor = this.realObj.apartment_suite
        }
    }
        return this.suit_floor
    }
    get_city(){
        if(this.realObj){
        if(this.invoice_to_label === 'patient'){
            this.city = this.realObj.self.contact_information.mail_address.city;
        }
        else{
            this.city = this.realObj.city;
        }
    }
        return this.city;
    }
    get_state(){
        if(this.realObj){
        if(this.invoice_to_label === 'patient'){
            this.state = this.realObj.self.contact_information.mail_address.state;
        }else{
            this.state = this.realObj.state
        }
    }
        return this.state;
    }
    get_zip(){
        if(this.realObj){
        if(this.invoice_to_label === 'patient'){
            this.zip = this.realObj.self.contact_information.mail_address.zip;
        }else{
            this.zip = this.realObj.zip
        }
    }
        return this.zip
    }
    get_invoice_to_phone(){
        if(this.realObj){
        if(this.invoice_to_label === 'insurance'){
            this.invoice_to_phone_no = this.realObj.phone_no    
        }
        if(this.invoice_to_label === 'employer'){
            this.invoice_to_phone_no = this.realObj.phone_no    
        }
        else if(this.invoice_to_label === 'firm'){
            this.invoice_to_phone_no = this.realObj.phone
        }else if(this.invoice_to_label === 'patient'){
            this.invoice_to_phone_no = this.realObj.cell_phone
        }
    }
        return this.invoice_to_phone_no
    }
    getObject(){
        this.get_invoice_to_id();
        this.get_invoice_name();
        this.get_street_address();
        this.get_street_address();
        this.get_suit_floor();
        this.get_zip();
        this.get_state();
        this.get_invoice_to_phone();
        this.get_city();
        return this;
    }
}
