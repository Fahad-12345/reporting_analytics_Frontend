import { Injectable } from '@angular/core';
export enum FormatEnum {
	signBetweenDates = ' - ',
	signBetweenDateTime = ' - ',
	signBetweenTimes = ' - ',
	hyphenDate_MM_dd_yyyy = 'MM-dd-yyyy',
	slashDate_DD_MM_YYYY = 'DD/MM/YYYY',
	slashDate_MM_DD_YYYY = 'MM/DD/YYYY',
	hyphenDateFormat_dd_M_yyyy = 'dd-M-yyyy',
	hyphenDate_MM_DD_Y = 'MM-dd-y',
	slashDate_MM_dd_yyyy = 'MM/dd/yyyy',
	slashDate_MM_dd_yy = 'MM/dd/yy',
	hourMinSecAmPm = 'hh:mm:ss aa',
	hourMinAmPm = 'h:mm a',
	hourMinSec = 'hh:mm:ss',
	DATE_FORMAT = '_/__/____', // FOR INPUT,
	DATE_FORMAT_WITHTIME = "MM/dd/yyyy h:mm a",
}
@Injectable({
	providedIn: 'root'
})
export class DatePipeFormatService {
	Format = FormatEnum;

	constructor() { }
	dateFormat(format) {
		// console.log(format);
		switch (format) {

			case this.Format.DATE_FORMAT_WITHTIME: {
				return this.Format.DATE_FORMAT_WITHTIME;
			}
			// DATE
			case this.Format.hyphenDate_MM_dd_yyyy: {
				return this.Format.hyphenDate_MM_dd_yyyy;
			}
			case this.Format.slashDate_DD_MM_YYYY: {
				return this.Format.slashDate_DD_MM_YYYY;
			}
			case this.Format.hyphenDateFormat_dd_M_yyyy: {
				return this.Format.hyphenDateFormat_dd_M_yyyy;
			}
			case this.Format.hyphenDate_MM_DD_Y: {
				return this.Format.hyphenDate_MM_DD_Y;
			}
			case this.Format.slashDate_MM_dd_yyyy: {
				return this.Format.slashDate_MM_dd_yyyy;
			}
			case this.Format.slashDate_MM_dd_yy: {
				return this.Format.slashDate_MM_dd_yy;
			}
			// Time only
			case this.Format.hourMinSecAmPm: {
				return this.Format.hourMinSecAmPm;
			}
			case this.Format.hourMinAmPm: {
				return this.Format.hourMinAmPm;
			}
			case this.Format.hourMinSec: {
				return this.Format.hourMinSec;
			}
			// DATE & TIME
			case this.Format.hyphenDate_MM_dd_yyyy.concat(' ', this.Format.hourMinSecAmPm): {
				return this.Format.hyphenDate_MM_dd_yyyy.concat(' ', this.Format.hourMinSecAmPm);
			}
			case this.Format.slashDate_MM_dd_yyyy.concat(' ', this.Format.hourMinSecAmPm): {
				return this.Format.slashDate_MM_dd_yyyy.concat(' ', this.Format.hourMinSecAmPm);
			}
			case this.Format.slashDate_MM_dd_yyyy.concat(' ', this.Format.hourMinAmPm): {
				return this.Format.slashDate_MM_dd_yyyy.concat(' ', this.Format.hourMinAmPm);
			}
			case this.Format.hyphenDate_MM_DD_Y.concat(' ', this.Format.hourMinAmPm): {
				return this.Format.hyphenDate_MM_DD_Y.concat(' ', this.Format.hourMinAmPm);
			}
		}
	}
	// DATE ONLY 
	// MM-dd-yyyy
	public hyphenDateFormat_MM_dd_yyyy() {
		return this.Format.hyphenDate_MM_dd_yyyy;
	}
	// dd-M-yyyy
	public hyphenDateFormat_dd_M_yyyy() {
		return this.Format.hyphenDateFormat_dd_M_yyyy;
	}
	// MM/dd/yy
	public slashDateFormat_MM_dd_yy() {
		return this.Format.slashDate_MM_dd_yy;
	}
	// Ex : DD/MM/YYYY
	public slashDateFormat_DD_MM_YYYY() {
		return this.Format.slashDate_DD_MM_YYYY;
	}
	// Ex : MM/DD/YYYY
	public slashDateFormat_MM_DD_YYYY() {
		return this.Format.slashDate_MM_DD_YYYY;
	}

	// MM-dd-y
	public hyphenDateFormat_MM_dd_y() {
		return this.Format.hyphenDate_MM_DD_Y;
	}
	// TIME ONLY
	// hh:mm:ss 
	public hourMinSecAmPmTimeFormat() {
		return this.Format.hourMinSecAmPm;
	}
	// hh:mm:ss
	public hourMinSecTimeFormat() {
		return this.Format.hourMinSec;
	}
	// DATE & TIME
	// MM-dd-yyyy hh:mm:ss aa
	public slashDateTimeFormat_MM_DD_YYYY() {
		return this.Format.hyphenDate_MM_dd_yyyy.concat(' ', this.Format.hourMinSecAmPm);
	}
	// MM-dd-yyyy hh:mm:ss aa
	public hyphenDateTimeFormat_MM_dd_yyyy_hh_mm_ss_AM_PM() {
		return this.Format.hyphenDate_MM_dd_yyyy.concat(' ', this.Format.hourMinSecAmPm);
	}
	// MM/dd/yyyy hh:mm:ss aa
	public slashDateTimeFormat() {
		return this.Format.slashDate_MM_dd_yyyy.concat(' ', this.Format.hourMinSecAmPm);
	}
	// MM-dd-y h:mm a
	public hyphenDateTimeFormat_MM_dd_y_h_mm_AM_PM() {
		return this.Format.hyphenDate_MM_DD_Y.concat(' ', this.Format.hourMinAmPm);
	}
	public DATE_FORMAT_WITHTIME(){
		return this.Format.DATE_FORMAT_WITHTIME;
	}

	// ==================================================================================
	// ONLY BELOW THESE FORMATS FUNCTIONS ARE USING IN WHOLE PROJECT
	// ==================================================================================

	// THIS FUN IS USING FOR DATE & TIME EVERY WHERE FOR DATE AND TIME DISPLYING
	// MM/dd/yyyy h:mm a
	public slashDateTimeFormat_MM_dd_yyyy_h_mm_AM_PM() {
		
		return this.Format.slashDate_MM_dd_yyyy.concat(' ', this.Format.hourMinAmPm);
		
	}
	// h:mm a aa 
	// THIS FUN IS USING ON EVERY WHERE FOR TIME ONLY
	public hourMinAmPmTimeFormat() {
		return this.Format.hourMinAmPm;
	}
	// THIS FUN IS USING EVERY WHERE FOR DATE ONLY
	// MM/dd/yyyy
	public slashDateFormat_MM_dd_yyyy() {
		return this.Format.slashDate_MM_dd_yyyy;
	}

	// THIS FUN IS USING FOR DATE  EVERY WHERE FOR BETWEEN TWO DATE -,/  DISPLYING
	public signBetweenDates() {
		return this.Format.signBetweenDates;
	}
	// THIS FUN IS USING FOR DATE  EVERY WHERE FOR BETWEEN DATE AND TIME -,/  DISPLYING
	public signBetweenDateTime() {
		return this.Format.signBetweenDateTime;
	}
	// THIS FUN IS USING FOR DATE  EVERY WHERE FOR BETWEEN TWO TIMES -,/  DISPLYING
	public signBetweenTimeS() {
		return this.Format.signBetweenTimes;
	}
}
