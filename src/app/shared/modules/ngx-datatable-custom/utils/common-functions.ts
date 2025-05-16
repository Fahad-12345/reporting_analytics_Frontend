import { FormControl, ControlContainer, ValidatorFn, AbstractControl } from '@angular/forms';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as CryptoJS from 'crypto-js';
import { environment } from 'environments/environment';
import { BehaviorSubject } from 'rxjs';
import { isDate } from 'moment';
const SECRET_KEY: any = environment.CipherKey;
export interface LooseObject {
    [key: string]: any
}
/**=============== unCheck All checkbox on current pages ==============*/
var localStorageVar = new BehaviorSubject<Object>(false);
export var isLocalStorageChange = localStorageVar.asObservable();
export var allowDecryption = true;
/**========== get id's from array of object ===============*/
export function getIdsFromArray(array, property) {
    let result = array.map(a => a[property]);
    return result;
}


/** =========if value then retirn value otherwise empty string  ======*/
export function checkForValue(value) {
    return value ? value : ''
}
export function isEmptyObject(o) {
    return Object.keys(o).every(function (x) {
        return o[x] === '' || o[x] === null || o[x] === undefined || (o[x] && o[x].length == 0 ? true : false); // or just "return o[x];" for falsy values
    });
}

export function getExtentionOfFile(fileName) {
    var i = fileName.lastIndexOf('.');
    if (i === -1) return false;
    return fileName.slice(i)
}

/** ===========chackForEmptyObject=============*/
// export function isEmpty(obj) {
//     return Object.keys(obj).length === 0;
// }
/**
 * Checks if value is empty. Deep-checks arrays and objects
 * Note: isEmpty([]) == true, isEmpty({}) == true, isEmpty([{0:false},"",0]) == true, isEmpty({0:1}) == false
 * @param value
 * @returns {boolean}
 */
export function isEmpty(value) {
    let isEmptyObject = function (a) {
        if (typeof a.length === 'undefined') { // it's an Object, not an Array
            let hasNonempty = Object.keys(a).some(function nonEmpty(element) {
                return !isEmpty(a[element]);
            });
            return hasNonempty ? false : isEmptyObject(Object.keys(a));
        }

        return !a.some(function nonEmpty(element) { // check if array is really not empty as JS thinks
            return !isEmpty(element); // at least one element should be non-empty
        });
    };
    return (
        value == false
        || typeof value === 'undefined'
        || value == null
        || (typeof value === 'object' && isEmptyObject(value))
    );
}

/** ============make Single Name from first last middle Name============*/
export function makeSingleNameFormFIrstMiddleAndLastNames(arrayName, key) {
    let arr = arrayName;
    arr = arr.filter(function (e) { return e; }); // The filtering function returns `true` if e is not empty.
    return arr.join(key)
}


/**==================== make Deep Copy Of Array ======== */
export function makeDeepCopyArray(array) {
    return array.map(a => Object.assign({}, a));
}

/**==================== Make Deep Copy Of object ===============*/
export function makeDeepCopyObject(obj) {
    return Object.assign({}, obj);
}

/**=======Find From Array of Objects========= */
export function findFromArrayOFObjects(array, prop, value) {
    if (array) {
        let obj = array.find(x => x[prop] == value);
        return obj;
    }

}

/**============ Find From Simple Array link Array of numbers/string======= */
export function FindFromSimpleArray(value, array) {
    return array.indexOf(value) > -1;
}

export function findIndexInData(data, property, value) {
    var result = -1;
    data.some(function (item, i) {
        if (item[property] === value) {
            result = i;
            return true;
        }
    });
    return result;
}
/**============ Find From Simple Array link Array of numbers/string======= */
export function FindIndexFromSimpleArray(array, value) {
    return array.indexOf(value);
}

/**check For Null or Empty or undefined String */
export function checkNUllEmptyUndefinedANdNullString(value) {
    return (value == null || value == 'null' || value == undefined || value == '') ? '' : value
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


/**================= maximum value for control ===========  */

export function minValidation(minValue): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
        if (control.value || control.value == 0) {
            console.log('control.value', control.value && (parseFloat(moneyMasking(control.value)).toFixed(2) == parseFloat(minValue).toFixed(2)) ? { min: true } : null);
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
    return parseFloat(control.value) > 0 && parseFloat(control.value) <= 999999.99 ? null : {
        min: true
    }
}

/** ============== check in enum value ========== */
export function existValueInEnum(type: any, value: any): boolean {
    return Object.keys(type).filter(k => isNaN(Number(k))).filter(k => type[k] === value).length > 0;
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
        console.log('[year, month, day]', d, [year, month, day]);
        return [year, month, day].join('-');
    }
    return '';
}

export function createDateAsUTC(date) {
    if (isValidDate(date)) {
        return date.toISOString();
    }
    return date;
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
}

export function isValidDate(dateObject) { return new Date(dateObject).toString() !== 'Invalid Date'; }

export function moneyMasking(element) {
    let data = element;
    if (element !== undefined && !Number.isNaN(element) && element !== null && element !== '' && element !== -1) {
        if (isString(element)) {
            data = (element.replace(/,/g, ''));
        }
    }
    return data;
}

export function isString(val) {
    return typeof val === 'string' || ((!!val && typeof val === 'object') && Object.prototype.toString.call(val) === '[object String]');
}

export function DaysBetween(Start, endDate) {
    var a = moment(Start ? moment(Start).format('MM-DD-YY') : Start);
    var b = moment(endDate ? moment(endDate).format('MM-DD-YY') : endDate);
    return a.diff(b, 'days') // 1
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
        link = [link]
    }

    return link
}

export function dateObjectPicker(value) {
    // let mom = <any>moment(value, "DD-MM-YYYY");
    let mom = <any>moment(value);
    let date = mom._d;
    return date;
}

export function mergeSplitDataWithOPtionalName(optionalName: string, id) {
    return `${optionalName ? optionalName.substring(0, 3).toUpperCase() : ''}${id}`
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
            && Object.prototype.toString.call(obj[key]) !== '[object Date]') {
            delete obj[key];
        }
    });
    return obj;
}

//========================================================================================
/*                                                                                      *
 *                          remove properties From Given Object                         *
 *                                                                                      */
//========================================================================================

export function removeObjectProperties(obj, props) {
    for (var i = 0; i < props.length; i++) {
        if (obj.hasOwnProperty(props[i])) {
            delete obj[props[i]];
        }
    }
    return obj;
};

//========================================================================================
/*                                                                                      *
 *                       to store data in local storage encryption                       *
 *                                                                                      */
//========================================================================================
export function encrypt(value) {
    // var encryptedData = CryptoJS.AES.encrypt((value), environment.CipherKey).toString();
    // return encryptedData;
    var message = CryptoJS ? JSON.stringify(value) : value;
    return CryptoJS ? CryptoJS.TripleDES.encrypt(message, SECRET_KEY) : JSON.stringify(value);
};

//========================================================================================
/*                                                                                      *
 *                      to get data from local storage and decrypt                      *
 *                                                                                      */
//========================================================================================
export function decrypt(key) {
    var encryptedData = null;
    var decrypted;
    if (key) {
        if ((CryptoJS && CryptoJS.TripleDES)) {
            try {
                decrypted = CryptoJS.TripleDES.decrypt(key, SECRET_KEY)
            } catch (ex) {
                console.log('failed');
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

//========================================================================================
/*                                                                                      *
 *                                     To parse Json                                    *
 *                                                                                      */
//========================================================================================

export function parseJson(input) {
    try {
        let obj = JSON.parse(input);
        return obj;
        console.error(obj)
    } catch (e) {
        return input;
        // conversion fails
        console.error(e)
    }
};
//========================================================================================
/*                                                                                      *
 *                                to stringify an Object                                *
 *                                                                                      */
//========================================================================================

export function JsonStringify(data) {
    return JSON.stringify(data)
};

export function enc(plainText) {
    try {
        return CryptoJS.AES.encrypt(JSON.stringify(plainText), SECRET_KEY).toString();
    } catch (e) {
        return null;
        console.log(e);
    }
    // var b64 = CryptoJS.AES.encrypt(JsonStringify(plainText), SECRET_KEY).toString();
    // var e64 = CryptoJS.enc.Base64.parse(b64);
    // var eHex = e64.toString(CryptoJS.enc.Hex);
    // return eHex;
}

export function dec(cipherText) {
    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
        if (bytes.toString()) {
            return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        }
        return cipherText;
    } catch (e) {
        return null;
        console.log(e);
    }
    // var reb64 = CryptoJS.enc.Hex.parse(cipherText);
    // var bytes = reb64.toString(CryptoJS.enc.Base64);
    // var decrypt = CryptoJS.AES.decrypt(bytes, SECRET_KEY);
    // var plain = decrypt.toString(CryptoJS.enc.Utf8);
    // return plain;
}
export function replaceKeySandValues(object, type = 'encryption') {
    var obj: LooseObject = {};
    obj = makeDeepCopyObject(object);
    Object.keys(obj).forEach(function (key) {
        if (type == 'encryption') {
            var newKey = enc(key);
            obj[newKey] = enc(obj[key])
            delete obj[key];
        }
        if (type == 'decryption') {
            // var newKeyDec = dec(key).replace(/\"/g, "");
            var newKeyDec = dec(key);
            obj[newKeyDec] = dec(obj[key])
            delete obj[key];
        }
        console.log(key, obj[key]);
    });
    return obj;
    console.log('obj', obj);
}

export function isObject(val) {
    if (val === null) { return false; }
    return ((typeof val === 'function') || (typeof val === 'object'));
}

export function isPDF(type) {
    if (type != "application/pdf") {
        return false;
    }
    return true;
}

export function specificDateFormat(dateVAl, format) {
    if (dateVAl == null || dateVAl == '' || dateVAl == undefined) {
        return;
    }
    let mom = <any>moment(dateVAl).format(format);
    return mom;
}

export function convertDateFormatUS(pstDate: string, format: string) {
    if (pstDate == null || pstDate == '' || pstDate == undefined) {
        return;
    }
    let date = dateObjectPicker(pstDate);
    var year = date.getFullYear();

    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;

    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    return (month + format + day + format + year);

}

export function calculateAge(dob: string) {
    let birthday: Date = new Date();
    if (dob != null && dob != undefined && isString(dob)) {
        var birthDateString: string = dob;
        var birthDateArray: string[] = birthDateString.split("-");
        if (birthDateArray.length != 0) {
            birthday.setFullYear(+birthDateArray[0]);
            birthday.setMonth(+birthDateArray[1] - 1);
            birthday.setDate(+birthDateArray[2]);
            const age: number = moment().diff(birthday, 'years', true);
            let ageString = age.toString();
            let AgeArray: string[] = [];
            AgeArray = ageString.split(".");
            return AgeArray[0];
            // let ageDifMs = Date.now() - birthday.getTime();
            // if (ageDifMs>0){
            // let ageDate = new Date(ageDifMs); // miliseconds from epoch
            // let val = Math.abs(ageDate.getUTCFullYear() - 1970);
            // return Math.abs((ageDate.getUTCFullYear()+1) - 1970);
            // }
            // else {
            //     return 0;
            // }
        }

    }
    else {
        if (dob != null && dob != undefined && isDate
            (dob)) {
            let age: number = moment().diff(dob, 'years', true);
            let ageString = age.toString();
            let AgeArray: string[] = [];
            AgeArray = ageString.split(".");
            return AgeArray[0];
        }
    }
}

export function checkDuplicateInArray(array: any[]) {
    if (new Set(array).size < array.length) {
        return true;
    } else {
        return false;
    }

}



export const applyDrag = (arr, dragResult) => {
    const { removedIndex, addedIndex, payload } = dragResult;
    if (removedIndex === null && addedIndex === null) return arr;

    const result = [...arr];
    let itemToAdd = payload;

    if (removedIndex !== null) {
        itemToAdd = result.splice(removedIndex, 1)[0];
    }
    if (addedIndex !== null) {
        result.splice(addedIndex, 0, itemToAdd);
    }

    return result;
};

export const generateItems = (count, creator) => {
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(creator(i));
    }
    return result;
};

//========================================================================================
/*                                                                                      *
 *                 In case someone needs to rename a list of properties:                *
 *                                                                                      */
//========================================================================================

export function renameKeys(obj, newKeys) {
    const keyValues = Object.keys(obj).map(key => {
        const newKey = newKeys[key] || key;
        return { [newKey]: obj[key] };
    });
    return Object.assign({}, ...keyValues);

    // ========== usage of this function
    // const obj = { a: "1", b: "2" };
    // const newKeys = { a: "A", c: "C" };
    // const renamedObj = renameKeys(obj, newKeys);
    // console.log(renamedObj);
    // {A:"1", b:"2"}
}

export function isPositive(num) {
    // if something is true return true; else return false is redundant.
    return num >= 0;
}

export function removeAllButLast(str, pOld, pNew) {
    var parts = str.split(pOld)
    if (parts.length === 1) return str
    return parts.slice(0, -1).join(pNew) + pOld + parts.slice(-1)
}

export function convertPropertyValues(myObj, value, replaceValue) {
    return _.mapValues(myObj, v => v === value ? replaceValue : v)
}


export function mergeRecursive(obj1, obj2) {
    if (Array.isArray(obj2)) { return obj1.concat(obj2); }
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

export function dataURLtoFile(dataUrl, filename) {

  var arr = dataUrl.split(',');
  // console.log('arr', arr);


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
