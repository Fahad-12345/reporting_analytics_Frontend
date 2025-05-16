import { MdLinks } from "@appDir/medical-doctor/models/panel/model/md-links";

export class AcceptedData {
    private _accepted: boolean;
    private _link: MdLinks;


    constructor(data) {
        this.setAcceptedData(data);
    }

    public setAcceptedData(data) {
        if (data) {
            this.accepted = data.accepted;
            this.link = data.link;
        }
    }

    public getAcceptedData() {
        return {
            accepted: this.accepted,
            link: this.link
        }
    }

    public get accepted(): boolean {
        return this._accepted;
    }

    public set accepted(accepted: boolean) {
        this._accepted = accepted;
    }

    public get link(): MdLinks {
        return this._link;
    }

    public set link(link: MdLinks) {
        this._link = link;
    }
}
