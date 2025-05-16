import { PracticeLocation } from './practice-location/practice-location';

export class Practice {
    private _id: number;
    private _name: string;
    private _created_by: number;
    private _updated_by: number;
    private _total: number;
    private _locations: PracticeLocation[];

    /**
     * Creates an instance of practice.
     * @param practice
     */
    constructor(practice: any) {
        this.practice = practice;
    }

    /**
     * Sets practice
     * @param practice
     */
    public set practice(practice: any) {
        if (practice) {
            this.id = practice.id;
            this.name = practice.name;
            this.createdBy = practice.created_by;
            this.updatedBy = practice.updated_by;
            this.locations = [];
            practice.locations.forEach((locations) => {
                this.locations.push(new PracticeLocation(locations));
            });
        }
    }
    /**
     * set practice id
     * @param id 
     */
    public set setPracticeId(id) {
        this.id = id
    }
    /**
     * 
     * @param id 
     */
    public get getPracticeId() {
        return this.id
    }
    /**
     * set practice locations
     * @param loc1 
     * @param loc2 
     */
    public set setLocations(loc) {
        // this.locations = [ ...loc1, ...loc2 ]
        this.locations = loc
    }
    /**
     * get location
     */
    public get getLocations() {
        return this.locations
    }
    /**
     * Gets practice
     * @returns
     */
    public getPractice(): object {
        return {
            id: this.id,
            name: this.name,
            created_by: this.createdBy,
            updated_by: this.updatedBy,
            locations: this.locations
        };
    }

    public get id(): number {
        return this._id;
    }

    public set id(id: number) {
        this._id = id;
    }

    public get name(): string {
        return this._name;
    }

    public set name(name: string) {
        this._name = name;
    }

    public get createdBy(): number {
        return this._created_by;
    }

    public set createdBy(created_by: number) {
        this._created_by = created_by;
    }

    public get updatedBy(): number {
        return this._updated_by;
    }

    public set updatedBy(updated_by: number) {
        this._updated_by = updated_by;
    }

    public get total(): number {
        return this._total;
    }

    public set total(total: number) {
        this._total = total;
    }


    public get locations(): PracticeLocation[] {
        return this._locations;
    }

    public set locations(locations: PracticeLocation[]) {
        this._locations = locations;
    }

}
