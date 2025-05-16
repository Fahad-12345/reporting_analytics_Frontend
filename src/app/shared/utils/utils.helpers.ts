import {
	AbstractControl,
	FormControl,
	FormGroup,
	ValidationErrors,
	ValidatorFn,
} from '@angular/forms';

import { HttpParams } from '@angular/common/http';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import * as CryptoJS from 'crypto-js';
import * as _ from 'lodash';
import * as moment from 'moment';
import { isDate } from 'moment';
import 'moment-timezone';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { AddressComponent } from 'ngx-google-places-autocomplete/objects/addressComponent';
import { BehaviorSubject, Observable, Subscription, endWith, filter, flatMap, interval, of, takeUntil, takeWhile, timer } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageData } from '../../pages/content-pages/login/user.class';
const SECRET_KEY: any = environment['CipherKey'];
export function changeBooleanToNumber(bool) {
	return bool ? 1 : 0;
}

export function getLengthOfAnObject(object) {
	return Object.keys(object).length;
}

export function isValidDate(date) {
	return date instanceof Date && !isNaN(date.getTime());
}

export function recursiveRemoveEmptyAndNullsFormObject(obj: any) {
	Object.keys(obj).forEach(key => {

		if (obj[key] === null || obj[key] === '') {
			delete obj[key]
		} else if (typeof obj[key] === 'object') {
			recursiveRemoveEmptyAndNullsFormObject(obj[key])
		}
	});

	return obj
}

export function touchAllFields(form: FormGroup) {
	// touch all fields to show the error
	Object.keys(form.controls).forEach((field) => {
		const control = form.get(field);
		control.markAsTouched({ onlySelf: true });
	});
}

export function createDateAsUTC(date) {
    if (isValidDate(date)) {
        return date.toISOString();
    }
    return date;
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
}
export function convertTimeToUserTimeZone(storageData: StorageData, time: string) {
	;
	let date = new Date();
	time = (time.split(" ").length == 2) ? convertTimeTo24Hours(time) : time;
	let [hour, minute, second] = time.split(':')
	// if (!(isNaN(parseInt(hour)) && isNaN(parseInt(minute)) && isNaN(parseInt(second)))) {
	date.setHours((isNaN(parseInt(hour)) ? 0 : parseInt(hour)));
	date.setMinutes((isNaN(parseInt(minute)) ? 0 : parseInt(minute)));
	date.setSeconds((isNaN(parseInt(second)) ? 0 : parseInt(second)));

	let newDate = new Date(convertDateToUserTimeZone(storageData, date))
	let hours = newDate.getHours()

	// return newDate.getTime()
	return `${('0' + newDate.getHours()).slice(-2)}:${('0' + newDate.getMinutes()).slice(-2)}:${('0' + newDate.getSeconds()).slice(-2)}`;
	// } else {
	// 	return time
	// }
}


export function getTimeArray(interval) {
	var times = [];
	var startTime = new Date(2023, 3, 11, 0, 0); // April 11, 2023, 12:00 AM
	var endTime = new Date(2023, 3, 11, 12, 0); // April 11, 2023, 12:00 PM
	var currentTime = startTime;
  
	while (currentTime <= endTime) {
	  var hours = currentTime.getHours();
	  var minutes:any = currentTime.getMinutes();
	  var ampm = hours >= 12 ? 'PM' : 'AM';
	  hours = hours % 12;
	  hours = hours ? hours : 12; // the hour '0' should be '12'
	  minutes = minutes < 10 ? '0'+minutes : minutes;
	  var timeString = hours + ':' + minutes + ' ' + ampm;
	  var dateTime = new Date(currentTime);
	  var timeObj = {
		time: timeString,
		dateTime: dateTime,
		hour: hours,
		minute: minutes,
		ampm: ampm
	  };
	  times.push(timeObj);
	  var nextTime = new Date(currentTime.getTime() + interval * 60000);
	  currentTime = nextTime;
	}
  
	return times;
  }


export function convertUTCDateToUserTimeZone(storageData: StorageData, date: any, returnObject = false): any {
	;
	(!storageData.getUserTimeZone()) ? storageData.setUserTimeZone(setDefaultTimeZone()) : null
	var timeZone = getTimeZone(storageData.getUserTimeZone().timeZone)
	const momentDate = date.tz(timeZone, false);
	if (returnObject) {
		return momentDate;
	}
	const newDate = momentDate.format('MM DD YYYY HH:mm:ss')
	return newDate
}
export function convertUTCTimeToUserTimeZone(storageData: StorageData, time: string) {
	time = (time.split(" ").length == 2) ? convertTimeTo24Hours(time) : time;
	(!storageData.getUserTimeZone()) ? storageData.setUserTimeZone(setDefaultTimeZone()) : null
	var timeZone = getTimeZone(storageData.getUserTimeZone().timeZone)
	return moment.utc(time, 'HH:mm').tz(timeZone).format('HH:mm:ss');
}

export function convertUTCTimeToUserTimeZoneByOffset(storageData: StorageData, time: string,date:any,assigment?:boolean) {
	(!storageData.getUserTimeZone()) ? storageData.setUserTimeZone(setDefaultTimeZone()) : null
	let timeZone = getTimeZone(storageData.getUserTimeZone().timeZone)
	let offset; 
	if (assigment){
	 offset=stdTimezoneOffset()*-1;
	}
	else {
		offset=moment.tz(date, timeZone).utcOffset();
	}

	console.log('Test Time zone ',offset); 
	time = (time.split(" ").length == 2) ? convertTimeTo24Hours(time) : time;
	console.log(moment.utc(time, 'HH:mm').utcOffset((offset)).format('HH:mm:ss'));
	return moment.utc(time, 'HH:mm').utcOffset((offset)).format('HH:mm:ss');
}

export function getOffsetByTimeZoneString(storageData: StorageData, ) {
	(!storageData.getUserTimeZone()) ? storageData.setUserTimeZone(setDefaultTimeZone()) : null
	let timeZone = getTimeZone(storageData.getUserTimeZone().timeZone)
	let offset=moment.tz(timeZone).utcOffset()*-1
	
	return offset
}


export function ConvertToISOWithoutChangingDateTime(storageData: StorageData, date: Date)
{
	return new Date(date.getTime()-storageData.getUserTimeZoneOffset()*60000).toISOString()
}

export function convertDateTimeForRetrieving(storageDate, date: Date) {
	let newdate;
	if (moment(date).isDST()){
		newdate =  moment(date).add(-1, 'hours').utc().toDate();
		return newdate;
	}
	else {
		return newdate= moment(date).utc().toDate();
	}
	return moment(date).utc().utcOffset(stdTimezoneOffset());
	date.setMinutes(date.getMinutes() + new Date().getTimezoneOffset())
	date.setMinutes(date.getMinutes() - storageDate.getUserTimeZoneOffset())
	return date;
}
export function convertDateTimeForRetrievingNotes(storageDate, date: Date) {
    let newdate;
    if (moment(date).isDST()){
        newdate =  moment(date).utcOffset(moment().isDST() ? '-0400' : '-0500').toDate();
    }
    else {
        newdate = moment(date).utc().toDate();
    }
    return date;
}

export function getAvailableDoctorCurrentDateList(dateList,date:Date):any
{
	let currentdateList=dateList.find(datelist=>new Date(datelist.start_date).toString().substring(0, 15)==date.toString().substring(0, 15));
	if(currentdateList)
	{
		return currentdateList
	}
	return null
}

export function convertTimeAndDateToUSA(visitDate) {
  const utcTime = new Date(visitDate);
  const estTime = new Date(utcTime);
  if (moment(estTime).isDST()) {
    estTime.setHours(utcTime.getHours() - 4);
  } else {
    estTime.setHours(utcTime.getHours() - 5);
  }

  const year =
    estTime.getFullYear() < 10
      ? `0${estTime.getFullYear()}`
      : estTime.getFullYear();
  const month =
    estTime.getMonth() + 1 < 10
      ? `0${estTime.getMonth() + 1}`
      : estTime.getMonth() + 1;
  const day =
    estTime.getDate() < 10 ? `0${estTime.getDate()}` : estTime.getDate();
  const hours =
    estTime.getHours() < 10 ? `0${estTime.getHours()}` : estTime.getHours();
  const minutes =
    estTime.getMinutes() < 10
      ? `0${estTime.getMinutes()}`
      : estTime.getMinutes();
  const seconds =
    estTime.getSeconds() < 10
      ? `0${estTime.getSeconds()}`
      : estTime.getSeconds();
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function convertDateTimeForSendingversion1(storageDate, date: Date,checkString?) {
// let dateOffset = stdTimezoneOffset() * 60000;
	// let calculateoffsetOfSelected = date.getTime() - dateOffset;

	// return new Date(calculateoffsetOfSelected);
	if (moment(date).isDST()){
		return moment(date).add(1, 'hours').utc().toDate();
	}
	else {
		return moment(date).utc().toDate();
	}
}
export function endDateToGetAssignments(storage,date:Date){
	return moment(date).add(4, 'hours').utc().toDate();
}
export function startDateToGetAssignments(storage,date:Date){
	return moment(date).add(5, 'hours').utc().toDate();
}
export function convertDateTimeForSending(storageDate, date: Date) {
	if (moment(date).isDST()){
		return moment(date).add(1, 'hours').utc().toDate();
	}
	else {
		return moment(date).utc().toDate();
	}
	
	let of=new Date().getTimezoneOffset();
	let d=date.getMinutes();
	let s=storageDate.getUserTimeZoneOffset()
	date.setMinutes(date.getMinutes() - new Date().getTimezoneOffset())
	date.setMinutes(date.getMinutes() + storageDate.getUserTimeZoneOffset())
	return date;
}

export function convert12(str) {
	let result: string = '';
	let h1: any = str[0];
	let h2: any = str[1];
	let hh = parseInt(h1) * 10 + parseInt(h2);
	let Meridien: string;
	if (hh < 12) {
		Meridien = 'AM';
	} else {
		Meridien = 'PM';
	}
	hh %= 12;
	// Handle 00 and 12 case separately
	if (hh == 0) {
		result = '12';
		// Printing minutes and seconds
		for (let i = 2; i < str.length; ++i) {
			result = result + str[i];
		}
	} else {
		result = JSON.stringify(hh);
		// Printing minutes and seconds
		for (let i = 2; i < str.length; ++i) {
			result = result + str[i];
		}
	}
	result = result + ' ' + Meridien;
	return result;
}

export function convertFacilityToPracticeLocationArray(facilityArr)
{
var data = this.StorageData.getUserPracticeLocationsData();
data = data['facility_locations'];
var result : any;
for(var i = 0 ;i<facilityArr.length;i++)
{
	for (var j = 0; j<data.length;j++ )
	{
		if (facilityArr[i]['facilityId'] == data[j]['facility_id'])
		{
			// result[i] = {
			// 	facility_id : data[j]['facility_id'],
			// 	facility_name : data[j]['facility_full_name']
			// }
			facilityArr[i]['facility_full_name'] = data[j]['facility_full_name'];

		}
	}
	return facilityArr;
}

}
export function convertFacilityToPracticeLocation(facilityId)
{
	var data = this.storageData.getUserPracticeLocationsData();
	for(var i = 0 ;i<data['facility_locations'].length;i++)
{
		if (facilityId == data['facility_locations'][i]['facility_id'])
		{
			return data['facility_locations'][i]['facility_full_name'];
		}
	}
}


/**
 * remove duplicate recods from array
 * @param arr 
 * @param key 
 */
export function removeDuplicatesObject(arr, key): Array<any> {

	if (key && typeof key === 'string') {
		return arr.filter(function (obj, index, arr) {
			return arr.map(function (mapObj) {
				return mapObj[key];
			}).indexOf(obj[key]) === index;
		});
	} else {
		return arr.filter(function (item, index, arr) {
			return arr.indexOf(item) == index;
		});
	}
}


/**
 * remove properties  from object
 * @param obj
 * @param props 
 */

export function removeObjectProperties(obj, props) {
    for (var i = 0; i < props.length; i++) {
        if (obj.hasOwnProperty(props[i])) {
            delete obj[props[i]];
        }
    }
    return obj;
};


export function removeDuplicates(arr) {
	return arr.filter((item,index) => arr.indexOf(item) === index);
}



/**
 * Parses http error response object
 * @param error
 * @returns
 */
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

/**
 * Sets default time zone
 * @returns
 */
export function setDefaultTimeZone() {
	let 	timeZone: string= '(GMT' + moment.tz(moment.tz.guess()).format('Z') + ') ' + moment.tz.guess();
	return {
		timeZone: '(GMT' + moment.tz(moment.tz.guess()).format('Z') + ') ' + moment.tz.guess(),
		offset: ((parseInt(moment.tz(moment.tz.guess()).format('ZZ')) / 100) * 60) * -1
	};
}

/**
 * Makes params from form data
 * @param formData
 * @returns
 */
export function makeParamsFromFormData(formData: object,requriedUtfEncode?) {
	let params = new HttpParams();
	if (Object.keys(formData).length) {
		Object.keys(formData).forEach((key) => {
			if (Array.isArray(formData[key])) {
				formData[key].forEach((k) => {
					if (requriedUtfEncode){
					params = params.append(key + '[]', encodeURIComponent(k));
					}
					else {
						params = params.append(key + '[]', k);
					}
				});
			} else {
				if (requriedUtfEncode){
				params = params.append(key, encodeURIComponent(formData[key]));
				}
				else {
					params = params.append(key, formData[key]);

				}
			}
		});
	}
	return params;
}

/**
 * Gets the users time zone
 * @param string
 * @returns
 */
export function getTimeZone(string: string) {
	return string.split(' ')[1];
}

/**
 * Determines whether object is empty or not
 * @param [obj]
 * @returns
 */
export function isObjectEmpty(obj = {}) {
	return Object.entries(obj).length === 0 && obj.constructor === Object;
}

/**
 * Converts date to user time zone
 * @param storageData
 * @param date
 * @returns
 */
export function convertDateToUserTimeZone(storageData: StorageData, date: Date) {
	const timeZone = getTimeZone(storageData.getUserTimeZone().timeZone);
	const newDate = moment(date).tz(timeZone, false).format('MM DD YYYY HH:mm:ss');
	return newDate;
}

export function generteRandomPassword(length){

  const numberChars = "0123456789";
  const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowerChars = "abcdefghijklmnopqrstuvwxyz";
  const specialChar = "!@#$%^^&*())_+/*";

  let allChars = numberChars + upperChars + specialChar +numberChars;
  let randPasswordArray = Array(length);
  randPasswordArray[0] = numberChars;
  randPasswordArray[1] = lowerChars;
  randPasswordArray[2] = upperChars;
  randPasswordArray[3] = numberChars;
  randPasswordArray[2] = upperChars;
  randPasswordArray[4] = specialChar;

  randPasswordArray = randPasswordArray.fill(allChars, 5);
  return shuffleArray(randPasswordArray.map(function(x) { return x[Math.floor(Math.random() * x.length)] })).join('');
}
export function shuffleArray(array) {
	for (var i = array.length - 1; i > 0; i--) {
	  var j = Math.floor(Math.random() * (i + 1));
	  var temp = array[i];
	  array[i] = array[j];
	  array[j] = temp;
	}
	return array;
  }
export function getTimeDifferenceOfDates(date1:Date, date2: Date) {
	// const differenceDate1= moment(date1);
	// const differenceDate2 = moment(date2);
	// let seconds = differenceDate1.seconds();
	// let secofdifferenceDate2.seconds();
	// console.log(differenceDate1.seconds());
	// console.log(differenceDate2.seconds());

}
/**
 * Removes empty and nulls form object
 * @param obj
 * @returns
 */
export function removeEmptyAndNullsFormObject(obj) {
	Object.keys(obj).forEach((key) => (obj[key] == null || obj[key] === '' || obj[key].length === 0 || obj[key] === "[]" ) && delete obj[key]);
	return obj;
}
/**
 * Removes empty and nulls form Array in object
 * @param obj
 * @returns
 */
export function removeEmptyAndNullsArraysFormObject(obj) {
	Object.keys(obj).forEach((key) => (obj[key] && obj[key].length < 1) && delete obj[key]);
	return obj;
}
/**
 * Removes nulls key value in comma spereted Array
 * @param array
 * @returns
 */
 export function removeNullKeyValueFromCommaSepratedArray(array:[]) {
	return array.filter(x => x != null || x != undefined);
}

/**
 * Checks whether reactive form is empty or not by removing empty and null form objects.
 * @param form
 * @returns
 */
export function checkReactiveFormIsEmpty(form) {
	return form && 'value' in form ? removeEmptyAndNullsFormObject(form.value) : {};
}

/**
 * Returns the object's child value. If there is any error (like null or or child of undefined) it returns a default response passed.
 * @param object
 * @param defaultResponse
 * @param child
 * @returns child value / default response
 */
export function getObjectChildValue(object, defaultResponse, ...child) {
	child = child[0];
	if (object == null) {
		return defaultResponse;
	}
	switch (typeof (object)) {
		case 'object':
			if (child.length > 1) {
				return getObjectChildValue(object[child[0]], defaultResponse, ((child.shift()) ? ([...child]) : null));
			} else {
				return object[child[0]];
			}
		case 'string':
		case 'number':
			return object;
		default:
			return defaultResponse;
	}
}

/**
 * unsubscribe all subscriptions passed
 * @param subscription
 */
export function unSubAllPrevious(subscription: Subscription[]) {
	if (subscription.length) {
		subscription.forEach((sub) => {
			// this.logger.log('unsubscribe');
			sub.unsubscribe();
		});
	}
}

/**
 * Calculates age from birthday
 * @param birthday
 * @returns
 */
export function calculateAge(birthday: Date) {

	const ageDifMs = Date.now() - birthday.getTime();
	const ageDate = new Date(ageDifMs); // miliseconds from epoch
	return Math.abs(ageDate.getUTCFullYear() - 1970);
}

/**
 * Gets date difference
 * @param oldDate
 * @param newDate
 * @returns date difference
 */
export function getDateDifference(oldDate, newDate): any {
	let oldDateMoment, newDateMoment, numYears, numMonths, numDays;

	oldDateMoment = moment(oldDate);
	newDateMoment = moment(newDate);

	numYears = newDateMoment.diff(oldDateMoment, 'years');
	oldDateMoment = oldDateMoment.add(numYears, 'years');
	numMonths = newDateMoment.diff(oldDateMoment, 'months');
	oldDateMoment = oldDateMoment.add(numMonths, 'months');
	numDays = newDateMoment.diff(oldDateMoment, 'days');

	return { months: numMonths, days: numDays, years: numYears };
	//  numYears + " years, " + numMonths + " months, " + numDays + " days.";
}

/**
 * Gets age
 * @param dob date of birth
 * @param format format will be short or long
 * @returns returns age in the form of string
 */
export function getAge(dob: Date, format: string = 'short') {
	const difference = getDateDifference(dob, new Date());
	if (difference.years > 0) {
		return `${difference.years} Year${(difference.years > 1) ? 's' : ''}`;
	} else if (difference.months > 0) {
		return (format == 'short') ? `${difference.months}M ${difference.days}D` :
			`${difference.months} Month${(difference.months > 1) ? 's' : ''}, ${difference.days} Day${(difference.days > 1) ? 's' : ''} `;
	} else {
		return (format == 'short') ? `${difference.days}D` : `${difference.days} Day${(difference.days > 1) ? 's' : ''} `;
	}
}
/**
 * convert UTC Time to Timezone
 * @param time
 * @param timeZone
 */

export function stdTimezoneOffset() 
 {
    let date = new Date ();
	let jan = new Date(date.getFullYear(), 0, 1);
    let jul = new Date(date.getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}
export function convertUTCTimeToTimeZone(time: string, timeZone: string,offset?:number) {
	if (!timeZone) { return time; }
	time = (time.split(' ').length == 2) ? convertTimeTo24Hours(time) : time;
	return moment.utc(time, 'HH:mm').utcOffset(stdTimezoneOffset() * -1).format('HH:mm');

	if (!offset){
	return moment.utc(time, 'HH:mm').tz(timeZone).format('HH:mm');
	}
	else {
		return moment.utc(time, 'HH:mm').utcOffset(stdTimezoneOffset() * -1).format('HH:mm');
	}
}

/**
 *  Converts 12 hours time in to 24 hours time.
 * convertTimeTo24Hours('6:00 PM') returns 18:00
 * @param {string} time 12 hour time in string
 * @returns {string} 24 hours converted time
*/
export function convertTimeTo24Hours(time: string): string {
	let hours = Number(time?.match(/^(\d+)/)[1]);
	const minutes = Number(time?.match(/:(\d+)/)[1]);
	const AMPM = time?.match(/\s(.*)$/)[1];
	if (AMPM == 'PM' && hours < 12) { hours = hours + 12; }
	if (AMPM == 'AM' && hours == 12) { hours = hours - 12; }
	let sHours = hours?.toString();
	let sMinutes = minutes?.toString();
	if (hours < 10) { sHours = '0' + sHours; }
	if (minutes < 10) { sMinutes = '0' + sMinutes; }
	return sHours + ':' + sMinutes;
}
/**
 * all the states
 */
// export let statesList = ['Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Federated States of Micronesia', 'Florida', 'Georgia', 'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Marshall Islands', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virgin Island', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
export let statesList = ['AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY'];
export let allStatesList=[ { name: 'AL', fullName: 'Alabama' },{ name: 'AK', fullName: 'Alaska' },{ name: 'AS', fullName: 'American Samoa' },{ name: 'AZ', fullName: 'Arizona' },{ name: 'AR', fullName: 'Arkansas' },{ name: 'CA', fullName: 'California' },{ name: 'CO', fullName: 'Colorado' },{ name: 'CT', fullName: 'Connecticut' },{ name: 'DE', fullName: 'Delaware' },{ name: 'DC', fullName: 'District of Columbia' },{ name: 'FM', fullName: 'Federated States of Micronesia' },{ name: 'FL', fullName: 'Florida' },{ name: 'GA', fullName: 'Georgia' },{ name: 'GU', fullName: 'Guam' },{ name: 'HI', fullName: 'Hawaii' },{ name: 'ID', fullName: 'Idaho' },{ name: 'IL', fullName: 'Illinois' },{ name: 'IN', fullName: 'Indiana' },{ name: 'IA', fullName: 'Iowa' },{ name: 'KS', fullName: 'Kansas' },{ name: 'KY', fullName: 'Kentucky' },{ name: 'LA', fullName: 'Louisiana' },{ name: 'ME', fullName: 'Maine' },{ name: 'MH', fullName: 'Marshall Islands' },{ name: 'MD', fullName: 'Maryland' },{ name: 'MA', fullName: 'Massachusetts' },{ name: 'MI', fullName: 'Michigan' },{ name: 'MN', fullName: 'Minnesota' },{ name: 'MS', fullName: 'Mississippi' },{ name: 'MO', fullName: 'Missouri' },{ name: 'MT', fullName: 'Montana' },{ name: 'NE', fullName: 'Nebraska' },{ name: 'NV', fullName: 'Nevada' },{ name: 'NH', fullName: 'New Hampshire' },{ name: 'NJ', fullName: 'New Jersey' },{ name: 'NM', fullName: 'New Mexico' },{ name: 'NY', fullName: 'New York' },{ name: 'NC', fullName: 'North Carolina' },{ name: 'ND', fullName: 'North Dakota' },{ name: 'MP', fullName: 'Northern Mariana Islands' },{ name: 'OH', fullName: 'Ohio' },{ name: 'OK', fullName: 'Oklahoma' },{ name: 'OR', fullName: 'Oregon' },{ name: 'PW', fullName: 'Palau' },{ name: 'PA', fullName: 'Pennsylvania' },{ name: 'PR', fullName: 'Puerto Rico' },{ name: 'RI', fullName: 'Rhode Island' },{ name: 'SC', fullName: 'South Carolina' },{ name: 'SD', fullName: 'South Dakota' },{ name: 'TN', fullName: 'Tennessee' },{ name: 'TX', fullName: 'Texas' },{ name: 'UT', fullName: 'Utah' },{ name: 'VT', fullName: 'Vermont' },{ name: 'VI', fullName: 'Virgin Island' },{ name: 'VA', fullName: 'Virginia' },{ name: 'WA', fullName: 'Washington' },{ name: 'WV', fullName: 'West Virginia' },{ name: 'WI', fullName: 'Wisconsin' },{ name: 'WY', fullName: 'Wyoming' } ]

/**
 * Show addresses from google intellicience
 * @param address
 * @param type
 * @returns component by type
 */
export function getComponentByType(address: Address, type: string): AddressComponent {
	const default_address = { long_name: '', short_name: '', types: [] };
	if (!type || !address || !address.address_components || address.address_components.length == 0) {
		return default_address;
	}
	type = type.toLowerCase();
	if (type == 'locality') {
		const array = ['sublocality_level_1', 'locality', 'administrative_area_level_3', 'administrative_area_level_2'];
		let result = null;
		address.address_components.forEach((comp) => {
			if ((comp.types && comp.types.length > 0) && (comp.types.includes(array[0]) || comp.types.includes(array[1]) || comp.types.includes(array[2]) || comp.types.includes(array[3])) && !result) {
				result = comp;
			}
		});
		if (result) {
			(result.long_name as string).toLowerCase() == 'the bronx' ? result.long_name = 'Bronx' : null
			return result;
		} else {
			return default_address;
		}
	} else {
		for (const comp of address.address_components) {
			if (!comp.types || comp.types.length == 0) {
				continue;
			}

			if (comp.types.findIndex((x) => x.toLowerCase() == type) > -1) {
				return comp;
			}
		}
	}
	return default_address;
}

/**
 * Phones format
 * @param phone
 * @returns format
 */
export function phoneFormat(phone: string): string {
	if (phone == null || phone == 'null') {
		return '';
	}
	if (phone.length != 10) {
		return phone;
	}
	phone = phone.substring(0, 3) + '-' + phone.substring(3, 6) + '-' + phone.substring(6);
	return phone;
}


export function whitespaceFormValidation() {

	return (control: AbstractControl): ValidationErrors => {

		if (control && control.value && control.value.trim && !control['value'].trim().length) {
			return { 'required': true };
		}
		return null;
	};
}

export function isObjectFalsy(obj: any) {
	return Object.values(obj).every(value => value == null || value == '')
}

export function mapCodesWithFullName(data: any[]) {
	data.length && data.map(code => code.full_name = `${code.name}${code.description ? ' - ' + code.description : ''}`)
	return data
}
	// CHECK IF LOGIN USER IS SAME WHO IS ACCESSING THE INFORMATION IN DIFFERENT TABS
	export function isSameLoginUser(UserID) {
		let loginUserID = JSON.parse(localStorage.getItem('cm_data')).basic_info.id;
		if (UserID == loginUserID) {
			return true;
		}
	}

export function getLoginUserObject() {
	let userObject =  JSON.parse(localStorage.getItem('cm_data')).basic_info;
	return userObject;
}

  export function addBillingTitleWithProviderName(billing_title)
  {
	let billing_title_with_Provider_Name=billing_title?`, ${billing_title}`:''
	  return billing_title_with_Provider_Name;
  }

  /**
 * Removes empty and nulls form object
 * @param obj
 * @returns
 */
export function removeEmptyAndNullsFormObjectAndBindLable(obj) {
	Object.keys(obj).forEach((key) => (obj[key] == null || obj[key] === '' || obj[key].length === 0 || obj[key] === "[]" || key === "bindLable" ) && delete obj[key]);
	return obj;
}
export function ListOfDays(): Array<string> {
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thrusday', 'Friday', 'Saturday'];
}
export function ListOfMonths(): Array<string> {
    return [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
    ];
}
export function getLastRecordsIndexFromList(array: any[] = [], recordNumber: number = 0) {
    return array.indexOf(array[array.length - recordNumber]);
  }
export function ListOfWeeks(): Array<string> {
    return ['Week1', 'Week2', 'Week3', 'Week4'];
}
export function GeneratePreviousMonthList(): Array<string> {
    var previousMonthsList: any[] = [];

    //for last 6 month list from current month;
    let n = 0;
    for (; n < 6; n++) {
        previousMonthsList.push(moment().subtract(n, 'months').format('MMMM'));

    }
    return previousMonthsList.reverse();

}
export function GeneratePreviousOneYearMonthList(): Array<string> {
    var previousMonthsList: any[] = [];
    let n = 0;
    for (; n < 12; n++) {
        previousMonthsList.push(moment().subtract(n, 'months').format('MMM'));

    }
    return previousMonthsList.reverse();

}
// export function GenerateMonths(): Array<string> {
//     var previousMonthsList: any[] = [];
//     let n = 0;
//     for (; n < 12; n++) {
//         previousMonthsList.push({name:moment().subtract(n, 'months').format('MMMM'),id:Number(moment().month(moment().subtract(n, 'months').format('MMMM')).format("M"))});

//     }
// 	console.log("monthss",previousMonthsList)
//     return previousMonthsList.reverse();

// }

export function GenerateMonths(): Array<string> {
    const currentMonth = moment().month(); // Get the current month (0-indexed)
    const currentYear = moment().year(); // Get the current year

    const previousMonthsList: any[] = [];
    for (let n = 0; n <= currentMonth; n++) {
        const monthDate = moment().subtract(n, 'months');
        if (monthDate.year() === currentYear) {
            previousMonthsList.push({
                name: monthDate.format('MMMM'),
                id: monthDate.month() + 1 // Adding 1 to convert from 0-indexed to 1-indexed
            });
        }
    }
    return previousMonthsList.reverse();
}
export function GenerateRandomDataList(dataLength:number){
   
    
    return [...Array(dataLength)].map(() => Math.floor((100) + Math.random() * (900)));
}























/** =========get Filter Data on the base of selected ======*/
export function getFilterDataFromIds(array, ids, prop) {
    let filtered_selected = array.filter(function (req) {
        return ids.includes(+req[prop]);
    });
    return filtered_selected;
}

export function encrypt(value) {
    // var encryptedData = CryptoJS.AES.encrypt((value), environment.CipherKey).toString();
    // return encryptedData;
    var message = CryptoJS ? JSON.stringify(value) : value;
    return CryptoJS ? CryptoJS.TripleDES.encrypt(message, SECRET_KEY) : JSON.stringify(value);
};

//========================================================================================
//
//to get data from local storage and decrypt
//
//========================================================================================
export function decrypt(key) {
    var encryptedData = null;
    var decrypted;
    if (key) {
        if ((CryptoJS && CryptoJS.TripleDES)) {
            try {
                decrypted = CryptoJS.TripleDES.decrypt(key, SECRET_KEY)
            } catch (ex) {
                return null;;
            }
        }
        else {
            try {
                decrypted = JSON.parse(key);
            } catch (e) {
                return null;;
            }
        }
        if (CryptoJS && CryptoJS.TripleDES && key) {
            try {
                encryptedData = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
            } catch (e) {
                allowDecryption = false;
                return null;
            }
        } else {
            encryptedData = decrypted;
        }
    }
    if (!_.isNull(encryptedData)) {
        return encryptedData;
    }
    return null;
};

export function removeDups(names) {
	let unique = {};
	return unique = names.filter((c, index) => {return names.indexOf(c) === index;});

}








/**=============== unCheck All checkbox on current pages ==============*/
var localStorageVar = new BehaviorSubject<Object>(false);
export var isLocalStorageChange = localStorageVar.asObservable();
export var allowDecryption = true;
export function makeUnselectAllRows(array, property) {
	array.forEach((row) => {
		row[property] = false;
	});
}

/**========== get id's from array of object ===============*/
export function getIdsFromArray(array, property) {
	
	let result = array.map((a) => a && a[property] ? a[property]:null);
	return result;
}

/** =========if value then retirn value otherwise empty string  ======*/
export function checkForValue(value) {
	return value ? value : '';
}
export function isEmptyObject(o) {
	return Object.keys(o).every(function (x) {
		return o[x] === '' || !o[x] || (Array.isArray(o[x]) && !o[x].length) ; // or just "return o[x];" for falsy values
	});
}

export function mustHaveValueObject(o) {
	let condition:boolean;
	return Object.keys(o).every(function (x) {
		if(o[x] == '' || o[x] == null) {
			condition = false;
		} else {
			condition = true;
		}
		return condition;
	});
}

export function getExtentionOfFile(fileName) {
	var i = fileName.lastIndexOf('.');
	if (i === -1) return false;
	return fileName.slice(i);
}

/**
 * Checks if value is empty. Deep-checks arrays and objects
 * Note: isEmpty([]) == true, isEmpty({}) == true, isEmpty([{0:false},"",0]) == true, isEmpty({0:1}) == false
 * @param value
 * @returns {boolean}
 */
export function isEmpty(value) {
	let isEmptyObject = function (a) {
		if (typeof a.length === 'undefined') {
			// it's an Object, not an Array
			let hasNonempty = Object.keys(a).some(function nonEmpty(element) {
				return !isEmpty(a[element]);
			});
			return hasNonempty ? false : isEmptyObject(Object.keys(a));
		}

		return !a.some(function nonEmpty(element) {
			// check if array is really not empty as JS thinks
			return !isEmpty(element); // at least one element should be non-empty
		});
	};
	return (
		value == false ||
		typeof value === 'undefined' ||
		value == null ||
		(typeof value === 'object' && isEmptyObject(value))
	);
}

/** ============make Single Name from first last middle Name============*/
export function makeSingleNameFormFIrstMiddleAndLastNames(arrayName, key) {
	let arr = arrayName;
	arr = arr.filter(function (e) {
		return e;
	}); // The filtering function returns `true` if e is not empty.
	return arr.join(key);
}

/**==================== make Deep Copy Of Array ======== */
export function makeDeepCopyArray(array = []) {
	return array.map((a) => Object.assign({}, a));
}

/**==================== Make Deep Copy Of object ===============*/
export function makeDeepCopyObject(obj = {}) {
	return JSON.parse(JSON.stringify(obj)); //
	// return Object.assign({}, obj);
}

/**=======Find From Array of Objects========= */
export function findFromArrayOFObjects(array, prop, value) {
	if (array) {
		let obj = array.find((x) => x[prop] == value);
		return obj;
	}
}

/**============ Find From Simple Array link Array of numbers/string======= */
export function FindFromSimpleArray(value, array) {
	return array.indexOf(value) > -1;
}

/**============ Find From Simple Array link Array of numbers/string======= */
export function FindIndexFromSimpleArray(array, value) {
	return array.indexOf(value);
}

/**check For Null or Empty or undefined String */
export function checkNUllEmptyUndefinedANdNullString(value) {
	return value == null || value == 'null' || value == undefined || value == '' ? '' : value;
}

/**=========== get keys value from inner array========== */
export function getInnerArrayKeyValue(array, keyValue) {
	const ids = [];
	JSON.stringify(array, (key, value) => {
		if (key === keyValue) ids.push(value);
		return value;
	});
	return ids;
}

/**============ Generate random Color======= */
export function get_rand_color() {
	let color = Math.floor(Math.random() * Math.pow(256, 3)).toString(16);
	while (color.length < 6) {
		color = '0' + color;
	}
	return '#' + color;
}

/**=========== All value in array are same ====== */
export function allTheSame(array) {
	var first = array[0];
	return array.every(function (element) {
		return element === first;
	});
}

export function max(maxValue): ValidatorFn {
	return (control: AbstractControl): { [key: string]: boolean } | null => {
		if (control.value) {
			return control.value && parseFloat(moneyMasking(control.value)) <= maxValue ? null : {
				max: true
			}
		} else {
			return null;
		}
	};
}

export function indexInSet(set1: Set<any>, findValue) {
	let index = -1;
	set1.forEach((value, i) => {
		if (findValue == value) {
			index = i;
		}
	});
	return index;
}

/**================= maximum value for control ===========  */

export function minValidation(minValue): ValidatorFn {
	return (control: AbstractControl): { [key: string]: boolean } | null => {
		if (control.value || control.value == 0) {
			return (parseFloat(moneyMasking(control.value)).toFixed(2) == parseFloat(minValue).toFixed(2) || parseFloat(moneyMasking(control.value)).toFixed(2) < parseFloat(minValue).toFixed(2)) ? {
				min: true
			} : null;
		} else {
			return null;
		}
	};
}
/**================= manimum value for control ===========  */
export function min(control: FormControl) {
	return parseFloat(control.value) > 0 && parseFloat(control.value) <= 999999.99
		? null
		: {
				min: true,
		  };
}

/** ============== check in enum value ========== */
export function existValueInEnum(type: any, value: any): boolean {
	return (
		Object.keys(type)
			.filter((k) => isNaN(Number(k)))
			.filter((k) => type[k] === value).length > 0
	);
}

export function WithoutTime(dateTime:Date) {
	if (dateTime && isDate(dateTime)){
    var date = new Date(dateTime);
    date.setHours(0, 0, 0, 0);
    return date;
	}
}

export function changeDateFormat(date) {
	if (date) {
		let mom = <any>moment(date);
		var d = mom._d,
			month = '' + (d.getMonth() + 1),
			day = '' + d.getDate(),
			year = d.getFullYear();

		if (month.length < 2) month = '0' + month;
		if (day.length < 2) day = '0' + day;
		return [year, month, day].join('-');
	}
	return '';
}

export function customizedLabels(filters : any, ylabels: any) {
	const allXValuesExceptLast : number[] = ylabels.slice(0, -1).map(label => parseInt(label));
    const maxXValueToShow : number = Math.max(...allXValuesExceptLast);
    const nearestLabel : string = ylabels.find(label => parseInt(label) >= maxXValueToShow);
    const dynamicMaxXValue : number = nearestLabel ? parseInt(nearestLabel) : maxXValueToShow;
    const truncatedData : any[]= ylabels.slice();
    let customDatecondition =  null;
    if(filters?.toDate){
      const newDate : Date =  new Date()
      const endDate : Date = new Date(filters?.toDate)
      const difference : number = newDate.getTime() - endDate.getTime();
      const daysDifference : number = Math.round(difference/(1000*3600*24));
      if(daysDifference < 89){
        customDatecondition = ((filters?.time_span_id == null) && (filters?.month_id == null));
      }
    }
    const result : Boolean = ylabels?.slice(0, -1).every((element?) => element === 0) && ylabels?.slice(-1)[0] !== 0;
    if((((filters?.month_id == null) && (filters?.fromDate ==  null)) || (customDatecondition ? customDatecondition : false)) && !result) {
      const lastXValue : number = parseInt(truncatedData[truncatedData.length - 1]);
      if (lastXValue > dynamicMaxXValue) {
        const difference : number = lastXValue - dynamicMaxXValue;
        truncatedData[truncatedData.length - 1] -= difference;
      }
    }
    const tooltipLabels : string[] = ylabels.slice(); 
    const lastTooltipLabelIndex : number = tooltipLabels.length - 1;
    const lastTooltipLabel : number = parseInt(tooltipLabels[lastTooltipLabelIndex]);

    if (lastTooltipLabel > dynamicMaxXValue) {
        tooltipLabels[lastTooltipLabelIndex] = ylabels[ylabels.length-1];
    }

	return {truncatedData , tooltipLabels};
}
export function changeDateToNextDay(date){
	if(date){
		let mom = <any>moment(date);
		var d = mom._d,
			month = '' + (d.getMonth() + 1),
			day = '' + (d.getDate()+1),
			year = d.getFullYear();

		if (month.length < 2) month = '0' + month;
		if (day.length < 2) day = '0' + day;
		return [year, month, day].join('-');
	}
}

export function moneyMasking(element) {
	let data = element;
	if (
		element !== undefined &&
		!Number.isNaN(element) &&
		element !== null &&
		element !== '' &&
		element !== -1
	) {
		if (isString(element)) {
			data = element.replace(/,/g, '');
		}
	}
	return data;
}

export function isString(val) {
	return (
		typeof val === 'string' ||
		(!!val && typeof val === 'object' && Object.prototype.toString.call(val) === '[object String]')
	);
}

export function DaysBetween(Start, endDate) {
	var a = moment(Start);
	var b = moment(endDate);
	return a.diff(b, 'days'); // 1
	let StartDate = new Date(Start);
	let EndDate = new Date(endDate);
	// The number of milliseconds in all UTC days (no DST)
	const oneDay = 1000 * 60 * 60 * 24;

	// A day in UTC always lasts 24 hours (unlike in other time formats)
	const start = Date.UTC(EndDate.getFullYear(), EndDate.getMonth(), EndDate.getDate());
	const end = Date.UTC(StartDate.getFullYear(), StartDate.getMonth(), StartDate.getDate());

	// so it's safe to divide by 24 hours
	return (start - end) / oneDay;
}

export function isArray(o) {
	return Object.prototype.toString.call(o) === '[object Array]';
}

export function getLink(link) {
	if (!_.isArray(link)) {
		link = [link];
	}

	return link;
}

export function dateObjectPicker(value) {
	// let mom = <any>moment(value, "DD-MM-YYYY");
	let mom = <any>moment(value);
	let date = mom._d;
	return date;
}

//========================================================================================
/*                                                                                      *
 *        remove Empty Keys Like null value, Invalid dateObjectPicker, undefined        *
 *                                                                                      */
//========================================================================================

export function removeEmptyKeysFromObject(obj) {
	Object.keys(obj).forEach(key => {
        if (Object.prototype.toString.call(obj[key]) === '[object Date]' && (obj[key].toString().length === 0 || obj[key].toString() === 'Invalid Date')) {
            delete obj[key];
        } else if (obj[key] && typeof obj[key] === 'object') {
            removeEmptyKeysFromObject(obj[key]);
        } else if (obj[key] && Array.isArray(obj[key]) && obj[key].length == 0) {
            removeEmptyKeysFromObject(obj[key]);
        }
        else if (obj[key] == null || obj[key] === '' || obj[key] === undefined) {
            delete obj[key];
        }

        if (obj[key]
            && typeof obj[key] === 'object'
            && Object.keys(obj[key]).length === 0
            && Object.prototype.toString.call(obj[key]) !== '[object Date]'
            && Object.prototype.toString.call(obj[key]) !== '[object File]') {
            delete obj[key];
        }
    });
    return obj;
}


/**
 * Converts 24 hours time in to 12 hours time.
 * Convert('18:00') returns 6:00 PM
 * @param {string} time 24 hour time in string
 * @returns {string} 12 hours converted time
 */
export function tConvert(time: string, seconds: boolean = true) {
	if (time) {
		// Check correct time format and split into components
		let final_time: string | string[] = '';
		let split_time =
			time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) ||
			([time] as string[] | number[]);
		if (split_time.length > 1) {
			// If time format correct
			split_time = split_time.slice(1); // Remove full string match value
			split_time[5] = +split_time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
			split_time[0] = +split_time[0] % 12 || 12; // Adjust hours
			final_time = split_time.join('');
		}
		if (!seconds) {
			final_time = final_time.split(':');
			final_time[2] = final_time[2].split(' ').slice(1).join();
			final_time = `${final_time[0]}:${final_time[1]} ${final_time[2]}`;
		}
		return final_time; // return adjusted time or original string
	}
	return '';
}

/**
 * Disable all the fields from the form that are passed in params
 * @param {FormGroup} form form from which fields are to be disabled.
 * @param {string[]} fields fields to be disabled in the form.
 */
export function disableFormFields(form: FormGroup, ...fields: string[]) {
	fields.forEach((field) => {
		form.controls[field].disable();
	});
}

/**
 * Enables all the fields from the form that are passed in params
 * @param {FormGroup} form form from which fields are to be enabled.
 * @param {string[]} fields fields to be enabled in the form.
 */
export function enableFormFields(form: FormGroup, ...fields: string[]) {
	fields.forEach((field) => {
		form.controls[field].enable();
	});
}

/**
 * Finds a value in array and removes the first index of the element found
 * @param {any[]} array array from which value needs to be removed.
 * @param {any} item item that needs to be removed from array.
 * @param {any[]} array array after removing the item.
 */
export function removeArrayItem(array: any[], item: any): any[] {
	let y = array.indexOf(item);
	y >= 0 ? array.splice(y, 1) : null;
	return array;
}

export function getExtension(fileName) {
	var i = fileName.lastIndexOf('.');
	if (i === -1) return false;
	return fileName.slice(i);
}

export function mergeRecursive(obj1, obj2) {
	if (Array.isArray(obj2)) {
		return obj1.concat(obj2);
	}
	for (var p in obj2) {
		try {
			// Property in destination object set; update its value.
			if (obj2[p].constructor == Object) {
				obj1[p] = mergeRecursive(obj1[p], obj2[p]);
			} else if (Array.isArray(obj2[p])) {
				obj1[p] = obj1[p].concat(obj2[p]);
			} else {
				obj1[p] = obj2[p];
			}
		} catch (e) {
			// Property in destination object not set; create it and set its value.
			obj1[p] = obj2[p];
		}
	}
	return obj1;
}

export function parseBool(value) {
	if (typeof value === 'boolean') {
		return value === true ? 1 : 0;
	}
	return value;
}

export function parseIntToBool(value) {
	if (typeof value === 'number') {
		return value === 1 ? true : false;
	}
	return value;
}

export function dataURLtoFile(dataUrl, filename) {
	var arr = dataUrl.split(',');

	var arr = dataUrl.split(','),
		mime = arr[0].match(/:(.*?);/),
		bstr = atob(arr[1]),
		n = bstr.length,
		u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new File([u8arr], filename, { type: mime });
}

/**if already not checked then checked and push in selected array */
export function ifNotCheckedAlreadyAndSelect(
	currentRow,
	currentPageItems,
	SelectedItemsArray,
	matchProp,
) {
	let index = currentPageItems.findIndex((x) => x[matchProp] == currentRow[matchProp]);
	let indexInSelected = SelectedItemsArray.findIndex((x) => x[matchProp] == currentRow[matchProp]);
	if (indexInSelected == -1) {
		SelectedItemsArray.push(currentRow);
		currentPageItems[index]['checkBoxChecked'] = true;
	}
}
/**=================Check First array contain all elements of second================= */
export function containAll(a, b) {
	return b.every(function (e) {
		return e === this.splice(this.indexOf(e), 1)[0];
	}, a.slice()); // a.slice() is the "this" in the every method
}

/**=================UnCheck All Checkbox and remove from Selected Array================= */

export function UnCheckAllCheckBoxAndRemoveCurrentUnselect(
	currentRow,
	selectedArray,
	matchProp,
	self,
	checkBoxCheckedField,
) {
	currentRow.checkBoxChecked = false;
	self[checkBoxCheckedField] = false;
	let index = selectedArray.findIndex((x) => x[matchProp] == currentRow[matchProp]);
	if (index > -1) {
		selectedArray.splice(index, 1);
	}
}

/**=================On Select All checkOnly those items who are unChecked================== */
export function SelectUnCheckItemsOnly(currentPageItems, SelectedItemsArray, matchProp) {
	let s = this;
	let tempArray = [];
	currentPageItems.forEach((element) => {
		let indexInSelected = SelectedItemsArray.findIndex((x) => x[matchProp] == element[matchProp]);
		if (indexInSelected == -1) {
			element.checkBoxChecked = true;
			tempArray.push(element);
		}
	});
	SelectedItemsArray = SelectedItemsArray.concat(tempArray);
	return SelectedItemsArray;
}

/**=========UnCheck All on unselect All From Action Column on Current page============= */
export function unCheckCurrentPageItems(array) {
	array.forEach((current) => {
		current.checkBoxChecked = false;
	});
}

/**============================ on unCheck All Remove from Selected Arrays ====================== */
export function removeCurrentPageSelectionFromSelected(currentPageItems, selectedArray, matchProp) {
	let result = currentPageItems.map((a) => a[matchProp]);
	let tempArray = [...selectedArray];
	for (var i = tempArray.length - 1; i >= 0; i--) {
		for (var j = 0; j < result.length; j++) {
			if (tempArray[i][matchProp] === result[j]) {
				selectedArray.splice(i, 1);
			}
		}
	}
}
export function arrayContainsArray(superset, subset) {
	return _.isEqual(_.intersection(superset.sort(), subset.sort()), subset.sort());
}

export function lTrim(str) {
	if (!str) return str;
	return str.replace(/^\s+/g, '');
}

export function removeSpecialCharacters(fileName = '') {
	return (fileName = fileName.replace(/[&\/\\#,+@()$~%'":*!^=?<>{}]/g, ''));
}

export function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function cleanArray(arr) {
	return arr.filter((i) => i);
}
export function haspProperty(objArr, string) {
	return (
		objArr.findIndex(
			// Is the string contained in the object keys?
			(obj) => Object.keys(obj).includes(string),
		) !== -1
	);
}

export function isEmptyObjectKeys(o) {
	return Object.keys(o).every(function (x) {
		return o[x] === '' || o[x] === null; // or just "return o[x];" for falsy values
	});
}

export function waitWhileViewChildIsReady(
	parent: any,
	viewChildName: string,
	refreshRateSec: number = 50,
	maxWaitTime: number = 3000,
): Observable<any> {
	return interval(refreshRateSec).pipe(
		takeWhile(() => !isDefined(parent[viewChildName])),
		filter((x) => x === undefined),
		takeUntil(timer(maxWaitTime)),
		endWith(parent[viewChildName]),
		flatMap((v) => {
			if (!parent[viewChildName]) throw new Error(`ViewChild "${viewChildName}" is never ready`);
			return of(!parent[viewChildName]);
		}),
	);

	// Now you can do it in any place of your code
	waitWhileViewChildIsReady(this, 'yourViewChildName').subscribe(() => {
		// your logic here
	});
}

function isDefined<T>(value: T | undefined | null): value is T {
	return <T>value !== undefined && <T>value !== null;
}

export function isAllWhitespace(valueToCheck) {
	if (valueToCheck.match(/^ *$/) !== null) {
		// Is all whitespace!
		return true;
	} else {
		// Is not all whitespace!
		return false;
	}
}

export function isEmptyArray(valueToCheck) {
	if (Array.isArray(valueToCheck) && !valueToCheck.length) {
		// Array is empty!
		return true;
	} else {
		// Array is not empty!
		return false;
	}
}

export function removeEmptyKeysFromObjectArrays(obj) {
	Object.keys(obj).forEach((key) => {
		if (
			Object.prototype.toString.call(obj[key]) === '[object Date]' &&
			(obj[key].toString().length === 0 || obj[key].toString() === 'Invalid Date')
		) {
			delete obj[key];
		} else if (obj[key] && typeof obj[key] === 'object') {
			removeEmptyKeysFromObject(obj[key]);
		} else if (obj[key] && Array.isArray(obj[key]) && obj[key].length == 0) {
			removeEmptyKeysFromObject(obj[key]);
		} else if (obj[key] == null || obj[key] === '' || obj[key] === undefined) {
			delete obj[key];
		}

		if (
			obj[key] &&
			typeof obj[key] === 'object' &&
			Object.keys(obj[key]).length === 0 &&
			Object.prototype.toString.call(obj[key]) !== '[object Date]' &&
			Object.prototype.toString.call(obj[key]) !== '[object File]'
		) {
			delete obj[key];
		}
	});
	return obj;
}
export function isPDF(type) {
    if (type != "application/pdf") {
        return false;
    }
    return true;
}

  export function formatBytes(bytes) {
    var kb = 1024;
    var ndx = Math.floor(Math.log(bytes) / Math.log(kb));
    var fileSizeTypes = ["bytes", "kb", "mb", "gb", "tb", "pb", "eb", "zb", "yb"];

    return {
        size: +(bytes / kb / kb).toFixed(2),
        type: fileSizeTypes[ndx]
    };
}

export function ConvertDateTimeToUserTimeDate(storageData: StorageData, date:Date,returnDate:boolean=false)
{
	let now = moment(date);
	let timeZone = getTimeZone(storageData.getUserTimeZone().timeZone)
// change the time zone of the new moment - passing true to keep the local time
	now.tz(timeZone,true); // or whatever time zone you desire
	if(returnDate)
	{
		let convertedDate=now.utc().format('MM-DD-YYYY');
		return convertedDate
	}
	else
	{
		let convertedTime=now.utc().format('HH:mm:ss');
		return convertedTime
	}	
}

export function compareArrOfNumbers(arr1, arr2){
    arr1 && arr1.sort()
    arr2 && arr2.sort()
    return arr1 + "" == arr2 + ""
}
export function validateAllFormFields(formGroup: FormGroup) {
	Object.keys(formGroup.controls).forEach(field => {
	  const control = formGroup.get(field);
	  control.markAsTouched({ onlySelf: true });
	  if (control instanceof FormGroup) {
		this.validateAllFormFields(control as FormGroup)
	  }
	});
}

export function allAreEqual(arr) {
	const res = arr.every(el => {
	  if (el === arr[0]) {
		return true;
	  }
	});
	return res;
}

export function checkSelectedLocationsForInactive(selectedLocationIds: number[], facilityloc: any[]): boolean {
	const inactiveLocations = facilityloc.filter(facilityLocation => {
	  return (selectedLocationIds.includes(facilityLocation.id) && (facilityLocation.is_active==0 || facilityLocation?.facility?.is_active ==0))
	});
	return !(inactiveLocations?.length > 0); 
  }
export function history(createdHistory, modalService) {
	const ngbModalOptions: NgbModalOptions = {
		backdrop: 'static',
		keyboard: false,
		windowClass: 'modal_extraDOc body-scroll history-modal',
		modalDialogClass: 'modal-lg'
	};
	modalService.open(createdHistory,ngbModalOptions);
}


export function addRecipientOfCase(selectedRecipient:any[],caseRecipient:any[],recipientType:string){
	const uniqueIds = selectedRecipient.map(obj => obj?.invoice_to_id);
	for (let recipient of caseRecipient) {
		if (!uniqueIds.includes(recipient.id)) {
			selectedRecipient.push({
				...recipient?.detail,
				...recipient?.case_location,
				invoice_to_label:recipientType,
				case_recipient:true,
				...recipient,
				id:recipient?.insurance_id??recipient?.id??recipient?.detail?.id});
		}
	  }
	  return selectedRecipient;
}

export function GetOnlyUniqueValues(arr:any[],key:string = 'id') : [] {
	if(!arr?.length){
		return [];
	}
	return _.uniqBy(arr,key);
} 

export function changeTimeFormate(dateTime) {
	if(dateTime){
		const offset : number = -5 * 60 * 60 * 1000;
		const estDate : Date  = new Date(new Date(dateTime).getTime() + offset);
		const hours = estDate.getUTCHours();
		const adjustedHours = (hours % 12) || 12; 
		const minutes = estDate.getUTCMinutes();
		const period = hours >= 12 ? 'PM' : 'AM'; 
		const formattedTime = `${adjustedHours < 10 ? '0' + adjustedHours : adjustedHours}:${minutes < 10 ? '0' + minutes : minutes} ${period}`;
		return formattedTime;
	}
	return null	
}

export function normalized(value: string | number): string | number {
    // Convert value to number if it is a string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    // Check if the value is a number and if it's zero, return 0
    return numValue === 0 ? 0 : value;
}
