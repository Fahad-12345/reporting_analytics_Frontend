export class EmploymentType {
    private id: number;
    private name: string;
    private description: string;
    private created_at: string;
    private updated_at: string;
    private created_by: string;
    private updated_by: string;
    private deleted_at: string;

    /**
     * Creates an instance of employment type.
     * @param employmentType
     */
    constructor(employmentType: EmploymentType) {
        this.setEmploymentType(employmentType);
    }

    /**
     * Sets employment type
     * @param employmentType
     */
    public setEmploymentType(employmentType: EmploymentType) {
        if (employmentType) {
            this.id = employmentType.id;
            this.name = employmentType.name;
            this.description = employmentType.description;
            this.created_at = employmentType.created_at;
            this.updated_at = employmentType.updated_at;
            this.created_by = employmentType.created_by;
            this.updated_by = employmentType.updated_by;
            this.deleted_at = employmentType.deleted_at;
        }
    }
    public getEmploymentType(): object {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            created_at: this.created_at,
            updated_at: this.updated_at,
            created_by: this.created_by,
            updated_by: this.updated_by,
            deleted_at: this.deleted_at
        };
    }
    /**
     * set id
     */
    public set setID(id: number) {
        this.id = id
    }
    /**
     * get id
     */
    public get getID():number{
        return this.id
    }
        /**
     * set name
     */
    public set setname(name: string) {
        this.name = name
    }
    /**
     * get name
     */
    public get getname():string{
        return this.name
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
