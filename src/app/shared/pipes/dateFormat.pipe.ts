import { Pipe, PipeTransform, NgZone, ChangeDetectorRef, OnDestroy } from "@angular/core";
import * as moment from 'moment';

@Pipe({
    name: 'dateFormat',
    pure: true
})

export class dateFormatPipe implements PipeTransform, OnDestroy {
    constructor(private changeDetectorRef: ChangeDetectorRef, private ngZone: NgZone) { }
    transform(value,format:string) {
		if (!moment.utc(value).isValid()){
			return '';
		}
		if (format==='dateWithTime'){
		return moment.utc(value).local().format('MM/DD/YYYY h:mm A');  
		}
		else if (format==="noTimeZone"){
			return moment(value).local().format('MM/DD/YYYY'); 
		}
		else {
		 	return moment.utc(value).local().format('MM/DD/YYYY'); 
		}
    }
    ngOnDestroy(): void {
    }


}
