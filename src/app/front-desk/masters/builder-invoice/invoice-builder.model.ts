export class InvoiceBuilder {
    invoice_name: "Omar Invoice Test"
    is_enable_bill_id:Boolean = true
    is_enable_case_type:Boolean = true
    is_enable_chart_id:Boolean = true
    is_enable_claim_number:Boolean = true
    is_enable_current_date:Boolean = true
    is_enable_date_of_loss:Boolean = true
    is_enable_date_of_service:Boolean = true
    is_enable_dob:Boolean = true
    is_enable_footer:Boolean = true
    is_enable_invoice_to:Boolean = true
    is_enable_invoice_to_address:Boolean = true
    is_enable_invoice_to_name:Boolean = true
    is_enable_invoice_to_phone_number:Boolean = true
    is_enable_logo:Boolean = true
    is_enable_p_address:Boolean = true
    is_enable_p_email:Boolean = true
    is_enable_p_fax_number:Boolean = true
    is_enable_p_phone_number:Boolean = true
    is_enable_p_tax_identification_number:Boolean = true
    is_enable_patient_detail:Boolean = true
    is_enable_patient_name:Boolean = true
    is_enable_provider:Boolean = true
    is_enable_quantity:Boolean = true
    is_enable_shipping:Boolean = true
    is_enable_tax:Boolean = true
    is_enable_unit_price:Boolean = true
    p_address:Boolean = true
    p_email:Boolean = true
    p_fax_number:Boolean = true
    p_phone_number:Boolean = true
    p_tax_identification_number:Boolean = true
    quantity:Boolean = true
    shipping:Boolean = true
    tax:Boolean = true
    unit_price:Boolean = true
	invoice_category?:any;
    constructor(values: object = {}) {
        Object.assign(this, values);
    }
}
export class PatientServicesDetail {
    description: string
    unit_price: number
    quantity: number
    total_amount: number
}

