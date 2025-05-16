export class BillingLocation {
    private id: number;
    private provider_name: string;
    private city: string;
    private state: string;
    private floor: string;
    private zip: string;
    private address: string;
    private phone: string;
    private ext_no: string;
    private cell_no: string;
    private email: string;
    private fax: string;
    private npi: string;
    private tin: string;
constructor(billinglocation:BillingLocation)
{
this.setBillingLocation(billinglocation)
}
/**
 * set Provider Billing Location
 */
setBillingLocation(billinglocation:BillingLocation)
{
if(billinglocation)
{
    this.id=billinglocation.id;
    this.provider_name=billinglocation.provider_name;
    this.city=billinglocation.city;
    this.state=billinglocation.state;
    this.floor=billinglocation.floor;
    this.zip=billinglocation.zip;
    this.address=billinglocation.address;
    this.phone=billinglocation.phone;
    this.ext_no=billinglocation.ext_no;
    this.cell_no=billinglocation.cell_no;
    this.email=billinglocation.email;
    this.fax=billinglocation.fax;
    this.npi=billinglocation.npi;
    this.tin=billinglocation.tin;
}
}
/**
 * get Provider Billing Location
 */
public getBillingLocation():object
{
    return {
    id:this.id,
    provider_name:this.provider_name,
    city:this.city,
    state:this.state,
    floor:this.floor,
    zip:this.zip,
    address:this.address,
    phone:this.phone,
    ext_no:this.ext_no,
    cell_no:this.cell_no,
    email:this.email,
    fax:this.fax,
    npi:this.npi,
    tin:this.tin,
    };
}
}



