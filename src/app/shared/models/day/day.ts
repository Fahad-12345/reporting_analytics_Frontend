export class Day {
    private id: number
    private name: string
    private isColor?: boolean

    /**
     * Creates an instance of day.
     * @param day 
     */
    constructor(day: any) {
        this.setDay=day;
    }

    /**
     * Sets day
     * @param day 
     */
    public set setDay(day: any) {
        if (day) {
            this.id = day.id;
            this.name = day.name;
            this.isColor = day.isColor;
        }
    }

    /**
     * Gets day
     * @returns day 
     */
    public get getDay(): any {
        return {
            id: this.id,
            name: this.name,
            isColor: this.isColor
        };
    }
    /**
     * Gets day name
     * @returns day 
     */
    public get getDayName(): string {
        return  this.name
    }

    /**
     * Gets id
     * @returns id 
     */
    public get getId(): number {
        return this.id;
    }
}
