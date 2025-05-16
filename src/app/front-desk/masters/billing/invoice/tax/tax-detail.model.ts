export class TaxDetail {
    id:string
    tax_name:string
    unit_price:string
    description:string
    comment:string
    realObject:any

    constructor(values:Object = {}){
        Object.assign(this,values)
    }
    getId(){
        this.id
        return
    }
    getTaxName(){
        if(this.tax_name && this.tax_name === this.realObject.tax_name){
            delete this.tax_name
            return;
        }
    }
    getUnitPrice(){
        if(this.unit_price && this.unit_price === this.realObject.unit_price){
            delete this.unit_price
            return;
        }
    }
    getDescription(){
        if(this.description && this.description === this.realObject.description){
            delete this.description
            return;
        }
    }
    getComment(){
        if(this.comment && this.comment === this.realObject.comment){
            delete this.comment
            return
        }
    }
    getObject(){
        this.getId();
        this.getTaxName();
        this.getDescription();
        this.getUnitPrice();
        this.getComment();
        return this;
    }
}
