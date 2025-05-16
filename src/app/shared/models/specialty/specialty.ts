export class Specialty {
    private id: number;
    private name: string;
    private description: string;
    private time_slot: number;
    private created_at: string;
    private updated_at: string;
    private created_by: number;
    private updated_by: number;
    private over_booking: number;
    private has_app: number; //numeric boolean
    private speciality_key: string;
    private deleted_at: string;
    private comments: string;
    private default_name: string;
    private is_defualt: number; //numeric boolean
    private is_available: number; //numeric boolean

    /**
     * Creates an instance of specialty.
     * @param specialty 
     */
    constructor(specialty: any) {
        this.setSpecialty(specialty);
    }

    /**
     * Sets specialty
     * @param specialty 
     */
    setSpecialty(specialty: any) {
        if (specialty) {
            this.id = specialty.id
            this.name = specialty.name
            this.description = specialty.description
            this.time_slot = specialty.time_slot
            this.created_at = specialty.created_at
            this.updated_at = specialty.updated_at
            this.created_by = specialty.created_by
            this.updated_by = specialty.updated_by
            this.over_booking = specialty.over_booking
            this.has_app = specialty.has_app
            this.speciality_key = specialty.speciality_key
            this.deleted_at = specialty.deleted_at
            this.comments = specialty.comments
            this.default_name = specialty.default_name
            this.is_defualt = specialty.is_defualt
            this.is_available = specialty.is_available
        }
    }

    /**
     * Gets id
     * @returns id 
     */
    getId(): number {
        return this.id;
    }

    /**
     * Gets name
     * @returns name 
     */
    getName(): string {
        return this.name;
    }
}
