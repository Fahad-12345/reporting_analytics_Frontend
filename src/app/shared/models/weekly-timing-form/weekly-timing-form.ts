import { Timing } from './timing/timing';

export class WeeklyTimingForm {
    timeZoneConverted?: boolean;
    selectedTimings: Timing[];
    timeRange?: Timing[];
    isValid: boolean;
	practice_location_id?:number;
	speciality_id?:number;

    /**
     * Creates an instance of weekly timing form.
     * @param timing 
     */
    constructor(timing: any) {
        this.setWeeklyTiming(timing);
    }


    /**
     * Sets weekly timing
     * @param timing 
     */
    public setWeeklyTiming(timing: any) {
        if (timing) {
            this.setTimeZoneConverted = timing.timeZoneConverted;
            this.setSelectedTimings(timing.selectedTimings);
            this.setTimeRange = timing.timeRange;
            this.setIsValid = timing.isValid;
			this.setPracticeLocationId=timing.practice_location_id;
			this.setSpecialtyId=timing.speciality_id
        }
    }

    /**
     * Gets weekly timing
     * @returns  
     */
    public get getWeeklyTiming() {
        return {
            timeZoneConverted: this.timeZoneConverted,
            selectedTimings: this.selectedTimings,
            timeRange: this.timeRange,
            isValid: this.isValid,
        }
    }


    /**
     * Sets time zone converted
     * @param timeZoneConverted 
     */
    public set setTimeZoneConverted(timeZoneConverted) {
        this.timeZoneConverted = timeZoneConverted || false;
    }

    /**
     * Sets selected timings
     * @param selectedTimings 
     */
    public setSelectedTimings(selectedTimings: any[], convertTimeZone: boolean = false) {
        this.selectedTimings = selectedTimings.map((timing) => {
            return new Timing(timing, convertTimeZone);
        }) || [];
    }

    /**
     * Sets time range
     * @param timeRange 
     */
    public set setTimeRange(timeRange: any[]) {
        this.timeRange = timeRange.map((timing) => {
            return new Timing(timing);
        }) || [];
    }


    /**
     * Gets get time range
     */
    public get getTimeRange(): Timing[] {
        return this.timeRange;
    }

	  /**
     * Gets get PracticeLocationId
     */
	   public get getPracticeLocationId(): number {
        return this.practice_location_id;
    }

	  /**
     * Gets get SpecialtyId
     */
	   public get getSpecialtyId(): number {
        return this.speciality_id;
    }

    /**
     * Sets is valid
     * @param isValid 
     */
    public set setIsValid(isValid) {
        this.isValid = isValid || false;
    }

	public set setPracticeLocationId(practice_location_id) {
        this.practice_location_id = practice_location_id || null;
    }
	public set setSpecialtyId(specialty_id) {
        this.isValid = specialty_id || null;
    }
}
