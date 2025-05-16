export class UserFilterModel {

    name: string;
    email: string;
    role_id: number | null;
    constructor(values: object={}){
        Object.assign(this, values);
        this.role_id = this.role_id ? Number(this.role_id): null;
    }    
}