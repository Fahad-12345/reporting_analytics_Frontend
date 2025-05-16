import { formatDate } from '@angular/common';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';

export function makeSelectedOptionsChecked(checkboxes, selectedOptions, value?) {
	if (checkboxes) {
		checkboxes.forEach((exc) => {
			Object.assign(exc, { checked: false });
			// console.log(`index of ${exc.id} is ${this.phyOccChirott.phyOccChirott[RefFormConf.Referral_Exercises].indexOf(exc.id)}`);
			if (value) {
				if (exc.value.toLowerCase() === value.toLowerCase()) {
					Object.assign(exc, { checked: true });
					return true;
				}
			} else if (selectedOptions && selectedOptions.length > 0) {
				if (selectedOptions.indexOf(exc.id) > -1) {
					Object.assign(exc, { checked: true });
				}
			}
		});
	}
	// console.log(checkboxes);
}

export function getCurrentDate() {
	return formatDate(new Date().getTime(), 'mediumDate', 'en-US');
	//  console.log(date);
	//  return date;
}

export function calculateAge(birthday: Date) {
	if (birthday) {
		const ageDifMs = Date.now() - birthday.getTime();
		const ageDate = new Date(ageDifMs); // miliseconds from epoch
		const ageNumber = Math.abs(ageDate.getUTCFullYear() - 1970);
		let age = <any>ageNumber + ' Year';
		if (ageNumber > 1) {
			age += 's';
		}
		return {
			ageNumber: ageNumber,
			age: age,
		};
	}
	return false;
}

export function changeStringToBoolean(str) {
	const str1 = str.toLowerCase();
	if (str1 === 'yes') {
		return true;
	} else if (str1 === 'no') {
		return false;
	}
}

export function changeBooleanToString(bool) {
	if (bool) {
		return 'Yes';
	} else {
		return 'No';
	}
}

export function dateObjectPicker(value) {
	// let mom = <any>moment(value, "DD-MM-YYYY");
	let mom = <any>moment(value);
	let date = mom._d;
	return date;
}


export function changeDateFormat(date) {
	if(date){
		if(!isoFormatedDate(date)){
		var d = new Date(date),
			month = '' + (d.getMonth() + 1),
			day = '' + d.getDate(),
			year = d.getFullYear();

		if (month.length < 2) month = '0' + month;
		if (day.length < 2) day = '0' + day;

		return [year, month, day].join('-');
		}else{
			return date;
		}
	}
	return '';
}
function isoFormatedDate(dateString) {
	const isoDateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
	const longDateFormatRegex = /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat) [A-Za-z]{3} \d{2} \d{4} \d{2}:\d{2}:\d{2} GMT[+-]\d{4} \(.+\)$/;
	if (isoDateFormatRegex.test(dateString)) {
	  return true;
	} else if (longDateFormatRegex.test(dateString)) {
	  return false;
	} 
  }

export function dateFormatterMDY(date) {
	if (date) {
		return date.split('T')[0];
	}
	return null;
}

export function unSubAllPrevious(subscription: Subscription[]) {
	if (subscription.length) {
		subscription.forEach((sub) => {
			// this.logger.log('unsubscribe');
			sub.unsubscribe();
		});
	}
}

export function parseHttpErrorResponseObject(error) {
	let errorString = '';
	if (Array.isArray(error)) {
		error.forEach((er) => {
			errorString += er + '\n';
		});
	} else {
		errorString = error;
	}
	return errorString;
}

export function MDY(birthday: Date) {
	if (birthday) {
		const ageDifMs = Date.now() - birthday.getTime();
		const ageDate = new Date(ageDifMs); // miliseconds from epoch
		const ageNumber = Math.abs(ageDate.getUTCFullYear() - 1970);
		let age = <any>ageNumber + ' Year';
		if (ageNumber > 1) {
			age += 's';
		}
		return {
			ageNumber: ageNumber,
			age: age,
		};
	}
	return false;
}


/**
 * Gets date difference
 * @param oldDate 
 * @param newDate 
 * @returns date difference 
 */
export function getDateDifference(oldDate, newDate): any {
	var oldDateMoment, newDateMoment, numYears, numMonths, numDays;

	oldDateMoment = moment(oldDate);
	newDateMoment = moment(newDate);

	numYears = newDateMoment.diff(oldDateMoment, 'years');
	oldDateMoment = oldDateMoment.add(numYears, 'years');
	numMonths = newDateMoment.diff(oldDateMoment, 'months');
	oldDateMoment = oldDateMoment.add(numMonths, 'months');
	numDays = newDateMoment.diff(oldDateMoment, 'days');

	return { months: numMonths, days: numDays, years: numYears }
	//  numYears + " years, " + numMonths + " months, " + numDays + " days.";
}

export function getAge(dob: Date, format: string = 'short') { // Copy and generate by Fahad
	let years: any = 0;
	let months: any = 0;
	let days: any = 0;
	let difference = getDateDifference(dob, new Date());
	if (difference.years > 0) {
		// console.log(`${difference.years} Year${(difference.years > 1) ? 's' : ''}`);
		years = `${difference.years} Year${(difference.years > 1) ? 's' : ''}`;
		// return `${difference.years} Year${(difference.years > 1) ? 's' : ''}`;

	}
	else {
		years = '';
	}
	if (difference.months > 0) {
		// return (format == 'short') ? `${difference.months}M ${difference.days}D` :
		// 	`${difference.months} Month${(difference.months > 1) ? 's' : ''}, ${difference.days} Day${(difference.days > 1) ? 's' : ''} `;;
		months = (format == 'short') ? ` ${difference.months}M` :
			` ${difference.months} Month${(difference.months > 1) ? 's' : ''}`;
		// return (format == 'short') ? `${difference.months}M` :
		// `${difference.months} Month${(difference.months > 1) ? 's' : ''}`;
	} else {
		months = '';
	}
	if (difference.days > 0) {
		days = (format == 'short') ? ` ${difference.days}D` :
			` ${difference.days} Day${(difference.days > 1) ? 's' : ''} `;
		// return (format == 'short') ? `${difference.days}D` :
		// 	`${difference.days} Day${(difference.days > 1) ? 's' : ''} `;
	} else {
		days = '';
	}

	if(years != ''){
		return years;
	}

	if(months != ''){
		return months;
	}

	if(days != ''){
		return days;
	}

	// return years + days;

}
