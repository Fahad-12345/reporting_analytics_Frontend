
import { Pipe, PipeTransform, NgZone, ChangeDetectorRef, OnDestroy } from "@angular/core";
import { tConvert } from "../utils/utils.helpers";
@Pipe({
	name: 'toTwelveHours',
	pure: false
})
export class TwelveHoursPipe implements PipeTransform, OnDestroy {
	private timer: number;
	constructor(private changeDetectorRef: ChangeDetectorRef, private ngZone: NgZone) { }
	transform(value: string) {
		return tConvert(value);
	}
	ngOnDestroy(): void {
	}
}