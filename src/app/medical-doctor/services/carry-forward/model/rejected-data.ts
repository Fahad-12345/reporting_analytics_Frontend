import { MdLinks } from "@appDir/medical-doctor/models/panel/model/md-links";

export class RejectedData {
    private _rejected: boolean;
    private _link: MdLinks;


    constructor(data) {
        this.setRejectedData(data);
    }

    public setRejectedData(data) {
        if (data) {
            this.rejected = data.rejected;
            this.link = data.link;
        }
    }

    public getRejectedData() {
        return {
            rejected: this.rejected,
            link: this.link
        }
    }

    public get rejected(): boolean {
        return this._rejected;
    }

    public set rejected(rejected: boolean) {
        this._rejected = rejected;
    }

    public get link(): MdLinks {
        return this._link;
    }

    public set link(link: MdLinks) {
        this._link = link;
    }
}
