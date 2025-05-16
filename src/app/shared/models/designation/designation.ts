export class Designation {
    private designation_id: number;
    private designation_name: string;
    private description: string;
    private created_at: string;
    private updated_at: string;
    private created_by: number;
    private updated_by: number;

    /**
     * Creates an instance of designation.
     * @param designation
     */
    constructor(designation: Designation) {
        this.setDesignation(designation);
    }

    /**
     * Sets designation
     * @param designation
     */
    public setDesignation(designation: Designation) {
        if (designation) {
            this.designation_id = designation.designation_id;
            this.designation_name = designation.designation_name;
            this.description = designation.description;
            this.created_at = designation.created_at;
            this.updated_at = designation.updated_at;
            this.created_by = designation.created_by;
            this.updated_by = designation.updated_by;
        }
    }
    /**
     * get designation 
     */
    public getDesignation(): object {
        return {
            designation_id: this.designation_id,
            designation_name: this.designation_name,
            description: this.description,
            created_at: this.created_at,
            updated_at: this.updated_at,
            created_by: this.created_by,
            updated_by: this.updated_by
        };
    }
    /**
     * set id
     */
    public set setID(id: number) {
        this.designation_id = id
    }
    /**
     * get id
     */
    public get getID():number{
        return this.designation_id
    }
        /**
     * set name
     */
    public set setname(name: string) {
        this.designation_name = name
    }
    /**
     * get name
     */
    public get getname():string{
        return this.designation_name
    }
        /**
     * set description
     */
    public set setdescription(description: string) {
        this.description = description
    }
    /**
     * get description
     */
    public get getdescription():string{
        return this.description
    }
}
