export class Day {
    id: number
    name: string
    isColor?: boolean
    constructor(day: Day) {
        this.id = day.id;
        this.name = day.name;
    }
}

export const DAYS = [
    new Day({ id: 0, name: 'Saturday' }),
    new Day({ id: 1, name: 'Sunday' }),
    new Day({ id: 2, name: 'Monday' }),
    new Day({ id: 3, name: 'Tuesday' }),
    new Day({ id: 4, name: 'Wednesday' }),
    new Day({ id: 5, name: 'Thursday' }),
    new Day({ id: 6, name: 'Friday' }),
]