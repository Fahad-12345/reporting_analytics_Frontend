import { Pipe, PipeTransform, NgZone, ChangeDetectorRef, OnDestroy } from "@angular/core";
import { convertDateTimeForRetrieving } from "../utils/utils.helpers";
@Pipe({
    name: 'CurrentTimeZonePipe',
    pure: true
})
export class CurrentTimeZonePipe implements PipeTransform, OnDestroy {
    constructor(private changeDetectorRef: ChangeDetectorRef, private ngZone: NgZone) { }
    transform(time: string,storageDate) {
		debugger;
		if(time)
		{
			let currentTime=new Date(time)
			let converted_time=convertDateTimeForRetrieving(storageDate, currentTime) 
	
			return (converted_time) ?converted_time:'' ;
		}
		else
		{
			return ''
		}
		
		
    }
    ngOnDestroy(): void {
    }
}
