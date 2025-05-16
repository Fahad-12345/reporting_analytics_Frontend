import { convertUTCTimeToTimeZone } from "@appDir/shared/utils/utils.helpers";

export class Timing {
    private id?: number;
    private start_time?: string;
    private end_time?: string;
    private day_id?: number;
    private facility_location_id?: number;
    private created_at?: string;
    private updated_at?: string;
    private deleted_at?: string;
    private created_by?: number;
    private updated_by?: number;
    private time_zone?: number;
    private time_zone_string?: string;
    private start_time_isb?: string;
    private end_time_isb?: string;
    private checked?: boolean;
    private name?: string;  //Only for development
    private replicate?: boolean | string; //Only for development


    /**
     * Creates an instance of timing.
     * @param timing 
     * @param [convertTimeZone] 
     */
    constructor(timing: any, convertTimeZone: boolean = false) {
        this.setTiming(timing, convertTimeZone);
    }

    /**
     * Gets day id
     * @returns day id 
     */
    public get getDayId() {
        return this.day_id;
    }
    /**
     * get checked 
     */
    public get getChecked(): boolean {
        return this.checked;
    }
    /**
     * set checked 
     */
    public set setChecked(checked) {
        this.checked = checked
    }
    /**
     * get start time 
     */
    public get getStartTime(): string {
        return this.start_time;
    }
    /**
     * set start time 
     */
    public set setStartTime(starttime) {
        this.start_time = starttime;
    }
    /**
     * get end time 
     */
    public get getEndTime(): string {
        return this.end_time;
    }
    /**
     * set end time 
     */
    public set setEndTime(end) {
        this.end_time = end
    }
    /**
     * get replicate
     */
    public get getReplicate() {
        return this.replicate;
    }
    /**
     * set replicate
     */
    public set setReplicate(rep) {
        this.replicate = rep
    }
    /**
     * get end time 
     */
    public get getTimeZoneString(): string {
        return this.time_zone_string;
    }
    /**
     * get name
     */
    public get getName(): string {
        return this.name
    }
    /**
     * set name
     */
    public set setName(name) {
        this.name = name
    }
    /**
     * Sets timing
     * @param timing
     */
    public setTiming(timing: any, convertTimeZone: boolean = false) {
        if (timing) {
            this.id = timing.id;
            this.start_time = (convertTimeZone) ? convertUTCTimeToTimeZone(timing.start_time, timing.time_zone_string) : timing.start_time;
            this.end_time = (convertTimeZone) ? convertUTCTimeToTimeZone(timing.end_time, timing.time_zone_string) : timing.end_time;
            this.day_id = timing.day_id;
            this.facility_location_id = timing.facility_location_id;
            this.created_at = timing.created_at;
            this.updated_at = timing.updated_at;
            this.deleted_at = timing.deleted_at;
            this.created_by = timing.created_by;
            this.updated_by = timing.updated_by;
            this.time_zone = timing.time_zone;
            this.time_zone_string = timing.time_zone_string;
            this.start_time_isb = timing.start_time_isb;
            this.end_time_isb = timing.end_time_isb;
            this.checked = timing.checked;
            this.name = timing.name;
            this.replicate = timing.replicate;
        }
    }

    /**
     * Gets timing
     * @returns timing
     */
    public get getTiming(): object {
        return {
            id: this.id,
            start_time: this.start_time,
            end_time: this.end_time,
            day_id: this.day_id,
            facility_location_id: this.facility_location_id,
            created_at: this.created_at,
            updated_at: this.updated_at,
            deleted_at: this.deleted_at,
            created_by: this.created_by,
            updated_by: this.updated_by,
            time_zone: this.time_zone,
            time_zone_string: this.time_zone_string,
            start_time_isb: this.start_time_isb,
            end_time_isb: this.end_time_isb,
            checked: this.checked,
            name: this.name,
            replicate: this.replicate,
        };
    }
}
