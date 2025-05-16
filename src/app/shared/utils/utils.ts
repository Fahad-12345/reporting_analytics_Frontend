export class Utils {
    constructor() {

    }

    protected findById = <T>(rows: T[], identifier: number): T => {
        return rows.find((r: any) => r.id === identifier);
    }

    protected filterById = <T>(rows: T[], identifier: number): T[] => {
        return rows.filter((x: any) => x.id !== identifier);
    }
}