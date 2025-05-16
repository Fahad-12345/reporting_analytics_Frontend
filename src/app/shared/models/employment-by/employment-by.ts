export class EmploymentBy {
    private id: number;
    private name: string;
    private comments: string;
    private created_at: string;
    private updated_at: string;
    private deleted_at: string;

    /**
     * Creates an instance of employment by.
     * @param employmentBy
     */
    constructor(employmentBy: EmploymentBy) {
        this.setEmploymentBy(employmentBy);
    }

    /**
     * Sets employment by
     * @param employmentBy
     */
    public setEmploymentBy(employmentBy: EmploymentBy) {
        if (employmentBy) {
            this.id = employmentBy.id;
            this.name = employmentBy.name;
            this.comments = employmentBy.comments;
            this.created_at = employmentBy.created_at;
            this.updated_at = employmentBy.updated_at;
            this.deleted_at = employmentBy.deleted_at;
        }
    }

    /**
     * Gets employment by
     * @returns employment by
     */
    public getEmploymentBy(): object {
        return {
            id: this.id,
            name: this.name,
            comments: this.comments,
            created_at: this.created_at,
            updated_at: this.updated_at,
            deleted_at: this.deleted_at
        };
    }
}
