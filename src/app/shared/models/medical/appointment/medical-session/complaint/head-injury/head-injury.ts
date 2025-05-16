export class HeadInjury {
    headInjury: boolean;
    headInjuryComments: string;
    constructor(injury) {
        
        if (injury) {
            this.headInjury = injury.headInjury;
            this.headInjuryComments = (this.headInjury) ? injury.headInjuryComments : '';
        }
    }
}