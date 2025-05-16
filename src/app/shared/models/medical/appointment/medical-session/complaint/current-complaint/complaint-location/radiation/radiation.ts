export class Radiation {
    bodyPartId: number;
    position: string;
    location: string;
    constructor(radiation) {
        this.bodyPartId = (radiation.bodyPartId) ? radiation.bodyPartId : null;
        this.position = (radiation.position) ? radiation.position : null;
        this.location = (radiation.location) ? radiation.location : null;
    }
}
