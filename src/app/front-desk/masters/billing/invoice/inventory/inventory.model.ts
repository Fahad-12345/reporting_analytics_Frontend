export class InventoryDetailModel {
    id:Number;
    name : string
    description: string
    unit_price : string
    quantity : string
    comment : string
    realObject?: any = {};
    constructor(values: object={}){
        Object.assign(this, values);        
    }
    getId(){
        this.id
        return;
    }

    getName(){
        if(this.name && this.name === this.realObject.name){
            delete this.name;
            return;
        }
    }

    getDescription(){
        if(this.description && this.description === this.realObject.description){
            delete this.description;
            return;
        }
    }

    getUnitPrice(){
        if(this.unit_price && this.unit_price === this.realObject.unit_price){
            delete this.unit_price;
            return;
        }
    }

    getQuantity(){
        if(this.quantity && this.quantity === this.realObject.quantity){
            delete this.quantity;
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
       this.getComment();
       this.getQuantity();
       this.getUnitPrice();
       this.getDescription();
       this.getName();
       delete this.realObject;
       return this;
    }

}
