import { Injectable } from '@angular/core';
export enum FormatEnum {
	hyphenDate_MM_dd_yyyy = 'MM-dd-yyyy',
	slashDate_DD_MM_YYYY = 'DD/MM/YYYY',
	hyphenDateFormat_dd_M_yyyy = 'dd-M-yyyy',
	hyphenDate_MM_DD_Y = 'MM-dd-y',
	slashDate_MM_dd_yyyy = 'MM/dd/yyyy',
	slashDate_MM_dd_yy = 'MM/dd/yy',
	hourMinSecAmPm = 'hh:mm:ss aa',
	hourMinAmPm = 'h:mm a',
	hourMinSec = 'hh:mm:ss', 
	DATE_FORMAT_WITHTIME="MM/dd/yyyy h:mm a",
}
@Injectable({
	providedIn: 'root'
})
export class CommonFunctionService {
	Format = FormatEnum;

	constructor() { }
	dateFormat(format) {
		debugger;
		// console.log(format);
		switch (format) {
			// DATE
			case this.Format.DATE_FORMAT_WITHTIME: {
				return this.Format.DATE_FORMAT_WITHTIME;
			}

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
	// Ex : DD/MM/YYYY
	public slashDateFormat_DD_MM_YYYY() {
		return this.Format.slashDate_DD_MM_YYYY;
	}
	// dd-M-yyyy
	public hyphenDateFormat_dd_M_yyyy() {
		return this.Format.hyphenDateFormat_dd_M_yyyy;
	}
	// MM/dd/yyyy
	public slashDateFormat_MM_dd_yyyy() {
		return this.Format.slashDate_MM_dd_yyyy;
	}
	// MM/dd/yy
	public slashDateFormat_MM_dd_yy() {
		return this.Format.slashDate_MM_dd_yy;
	}
	// MM-dd-y
	public hyphenDateFormat_MM_dd_y() {
		return this.Format.hyphenDate_MM_DD_Y;
	}
	public DATE_FORMAT_WITHTIME () {
		return this.Format.DATE_FORMAT_WITHTIME;
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
	// MM/dd/yyyy h:mm a
	public slashDateTimeFormat_MM_dd_yyyy_h_mm_AM_PM() {
		return this.Format.slashDate_MM_dd_yyyy.concat(' ', this.Format.hourMinAmPm);
	}

	// ==================================================================================
	// ONLY BELOW THESE FORMATS FUNCTIONS ARE USING IN WHOLE PROJECT
	// ==================================================================================

	// MM-dd-y h:mm a
	// THIS FUN IS USING FOR DATE & TIME EVERY WHERE FOR DATE AND TIME DISPLYING
	public hyphenDateTimeFormat_MM_dd_y_h_mm_AM_PM() {
		return this.Format.hyphenDate_MM_DD_Y.concat(' ', this.Format.hourMinAmPm);
	}
	// h:mm a aa 
	// THIS FUN IS USING ON EVERY WHERE FOR TIME ONLY
	public hourMinAmPmTimeFormat() {
		return this.Format.hourMinAmPm;
	}
	//  MM-dd-yyyy
	// THIS FUN IS USING EVERY WHERE FOR DATE ONLY
	public hyphenDateFormat_MM_dd_yyyy() {
		return this.Format.hyphenDate_MM_dd_yyyy;
	}
	
}
