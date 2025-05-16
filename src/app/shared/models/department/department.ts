export class Department {

    private _department_id: number;
    private _department_name: string;
    private _description: string;


    private _created_at: string;
    private _updated_at: string;
    private _created_by: number;
    private _updated_by: number;



    /**
     * Creates an instance of department.
     * @param department
     */
    constructor(department) {
        this.setDepartmentData(department);
    }

    /**
     * Sets department data
     * @param department
     */
    public setDepartmentData(department) {
        if (department) {
            this._department_id = department.department_id || department.id;
            this._department_name = department.department_name || department.name;
            this._description = department.description;
            this._created_at = department.created_at;
            this._updated_at = department.updated_at;
            this._created_by = department.created_by;
            this._updated_by = department.updated_by;
        }
    }

    public getDepartmentData(): object {
        return {
            department_id: this.id,
            department_name: this.name,
            description: this.description,
            created_at: this.createdAt,
            updated_at: this.updatedAt,
            created_by: this.createdBy,
            updated_by: this.updatedBy
        };
    }
    /**
     * set id
     */
    public set id(id: number) {
        this._department_id = id
    }
    /**
     * get id
     */
    public get id(): number {
        return this._department_id
    }
    /**
 * set name
 */
    public set name(name: string) {
        this._department_name = name
    }
    /**
     * get name
     */
    public get name(): string {
        return this._department_name
    }
    /**
 * set description
 */
    public set description(description: string) {
        this._description = description
    }
    /**
     * get description
     */
    public get description(): string {
        return this._description
    }


    /**
     * Gets created at
     */
    public get createdAt(): string {
        return this._created_at;
    }

    /**
     * Sets created at
     */
    public set createdAt(created_at: string) {
        this._created_at = created_at;
    }

    /**
     * Gets updated at
     */
    public get updatedAt(): string {
        return this._updated_at;
    }

    /**
     * Sets updated at
     */
    public set updatedAt(updated_at: string) {
        this._updated_at = updated_at;
    }

    /**
     * Gets created by
     */
    public get createdBy(): number {
        return this._created_by;
    }

    /**
     * Sets created by
     */
    public set createdBy(created_by: number) {
        this._created_by = created_by;
    }

    /**
     * Gets updated by
     */
    public get updatedBy(): number {
        return this._updated_by;
    }

    /**
     * Sets updated by
     */
    public set updatedBy(updated_by: number) {
        this._updated_by = updated_by;
    }

}
