import { ComplaintLocation } from "./complaint-location/complaint-location";

export class CurrentComplaint {
    _id: number; //Added
    _name: string;
    _bodyPartId: number; //Added
    _checked: boolean; //Not needed
    _complaintsLocation: ComplaintLocation[];

    constructor(complaints) {
        this.id = (complaints.id) ? complaints.id : null;
        this.checked = (complaints.checked) ? complaints.checked : false;
        this.bodyPartId = (complaints.bodyPartId) ? complaints.bodyPartId : null;
        let complaintsLocation: ComplaintLocation[] = [];
        complaints.complaintsLocation
        if (complaints.complaintsLocation && complaints.complaintsLocation.length > 0) {
            complaintsLocation = complaints.complaintsLocation.filter((complaint) => {
                return complaint.checked || complaints.complaintsLocation.length == 1
            }).map((complaint) => {
                return new ComplaintLocation(complaint);
            });
        }
        this.complaintsLocation = complaintsLocation;
    }

    public setCurrentComplaints(complaints) {
        if (complaints) {
            this.id = complaints.id || null;
            this.checked = complaints.checked || false;
            this.bodyPartId = complaints.bodyPartId || null;
            let complaintsLocation: ComplaintLocation[] = [];

            if (complaints.complaintsLocation) {
                complaintsLocation = complaints.complaintsLocation.filter((complaint) => {
                    return complaint.checked || complaints.complaintsLocation.length == 1
                }).map((complaint) => {
                    return new ComplaintLocation(complaint);
                });
            }

            this.complaintsLocation = complaintsLocation;
        }

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

    public get bodyPartId(): number {
        return this._bodyPartId;
    }

    public set bodyPartId(bodyPartId: number) {
        this._bodyPartId = bodyPartId;
    }

    public get checked(): boolean {
        return this._checked;
    }

    public set checked(checked: boolean) {
        this._checked = checked;
    }

    public get complaintsLocation(): ComplaintLocation[] {
        return this._complaintsLocation;
    }

    public set complaintsLocation(complaintsLocation: ComplaintLocation[]) {
        this._complaintsLocation = complaintsLocation;
    }

}
