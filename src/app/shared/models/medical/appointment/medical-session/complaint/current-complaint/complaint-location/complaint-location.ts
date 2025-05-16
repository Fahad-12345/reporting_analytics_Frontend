import { Radiation } from "@appDir/medical-doctor/models/initialEvaluation/initialEvaluationModels";

export class ComplaintLocation {
    checked: boolean;
    location: string;
    painScale: number; //Added
    painStyle: number; //Added
    feelings: number[]; //Added
    sensations: number[]; //Added
    radiations: Radiation[]; //Added
    comments: string; //Added
    constructor(complaintLocations) {

        this.checked = (complaintLocations.checked) ? complaintLocations.checked : false;
        this.location = (complaintLocations.location) ? complaintLocations.location : "";
        this.painScale = (complaintLocations.painScale) ? complaintLocations.painScale : null;
        this.painStyle = (complaintLocations.painStyle) ? complaintLocations.painStyle : null;
        this.comments = (complaintLocations.comments) ? complaintLocations.comments : null;
        
        if (typeof (complaintLocations.sensation))
            if (complaintLocations.sensation) {
                this.sensations = complaintLocations.sensation.filter(function (data) {
                    if (typeof (data) == 'number') {
                        return true;
                    }
                    return data.checked;
                }).map(function (data) {
                    if (typeof (data) == 'number') {
                        return data;
                    }
                    return data.id;
                });
            }
        if (complaintLocations.feelings) {
            this.feelings = complaintLocations.feelings.filter(function (data) {
                return data.checked == true;
            }).map(function (data) {
                return data.id;
            });
        }
        if (complaintLocations.radiation) {
            this.radiations = complaintLocations.radiation.filter(function (data) {
                return data.location != null;
            });
        }

    }
}