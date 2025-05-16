export class UserRole {
    private id: number;
    private name: string;
    private guard_name: string;
    private medical_identifier: number; // numeric boolean
    private comment: string;
    private created_at: string;
    private updated_at: string;
    private deleted_at: string;

    /**
     * Creates an instance of user role.
     * @param userRole
     */
    constructor(userRole: UserRole) {
        this.setUserRole(userRole);
    }

    /**
     * Sets user role
     * @param userRole
     */
    public setUserRole(userRole: any) {
        if (userRole) {
            this.id = userRole.id;
            this.name = userRole.name;
            this.guard_name = userRole.guard_name;
            this.medical_identifier = userRole.medical_identifier; // numeric boolean
            this.comment = userRole.comment;
            this.created_at = userRole.created_at;
            this.updated_at = userRole.updated_at;
            this.deleted_at = userRole.deleted_at;
        }
    }

    /**
     * Gets user role
     * @returns user role
     */
    public get getUserRole(): object {
        return {
            id: this.id,
            name: this.name,
            guard_name: this.guard_name,
            medical_identifier: this.medical_identifier, // numeric boolean
            comment: this.comment,
            created_at: this.created_at,
            updated_at: this.updated_at,
            deleted_at: this.deleted_at
        };
    }
    /**
     * get medical identifier
     */
    public get getMedicalIdentifier() :number|boolean{
        return this.medical_identifier;
    }
    /**
     * set medical identifier
     */
    public set setMedicalIdentifier(medical_identifier:any) {
        this.medical_identifier = medical_identifier
    }
    /**
     * get id
     */
    public get getID():number {
        return this.id
    }
    /**
     * set id
     */
    public set setID(id:number){
        this.id=id
    }
    /**
     * get name
     */
    public get getName():string {
        return this.name
    }
    /**
     * set name
     */
    public set setName(name:string){
        this.name=name
    }
    /**
     * get comment
     */
    public get getcomment():string {
        return this.comment
    }
    /**
     * set comment
     */
    public set setcomment(comment:string){
        this.comment=comment
    }
}
