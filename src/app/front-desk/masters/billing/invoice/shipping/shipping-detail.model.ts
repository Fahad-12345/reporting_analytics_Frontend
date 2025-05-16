export class ShippingDetail {
    id:Number
    shipping_detail : string
    unit_price : string
    comment:string
    realObject?:any = {}

    constructor(values:object = {}){
        Object.assign(this,values)
    }
    getId(){
        this.id
        return;
    }
    getShippingDetail(){
        if(this.shipping_detail && this.shipping_detail === this.realObject.shipping_detail){
            delete this.shipping_detail
            return;
        }
    }
    getUnitPrice(){
        if(this.unit_price && this.unit_price === this.realObject.unit_price){
            delete this.unit_price;
            return;
        }
    }
    getComment(){
        if(this.comment && this.comment === this.realObject.comment){
            delete this.comment;
            return;
        }
    }
    getObject(){
        this.getId();
        this.getShippingDetail();
        this.getUnitPrice();
        this.getComment();
        delete this.realObject;
        return this;
    }
}
