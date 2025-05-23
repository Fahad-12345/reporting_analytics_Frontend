
import {Pipe, PipeTransform, NgZone, ChangeDetectorRef, OnDestroy} from "@angular/core";
@Pipe({
	name:'timeAgo',
	pure:false
})
export class TimeAgoPipe implements PipeTransform, OnDestroy {
	private timer: number;
	constructor(private changeDetectorRef: ChangeDetectorRef, private ngZone: NgZone) {}
	transform(value:string) {
		this.removeTimer();
		// Split timestamp into [ Y, M, D, h, m, s ]
		let t = value.split(/[- :]/);
		// Apply each element to the Date function
		var d = new Date(Date.UTC(+t[0], +t[1]-1, +t[2], +t[3], +t[4], +t[5]));

		//let d = new Date(value);
		let now = new Date();
		let seconds = Math.round(Math.abs((now.getTime() - d.getTime())/1000));
		let timeToUpdate = (Number.isNaN(seconds)) ? 1000 : this.getSecondsUntilUpdate(seconds) *1000;
		this.timer = this.ngZone.runOutsideAngular(() => {
			if (typeof window !== 'undefined') {
				return window.setTimeout(() => {
					this.ngZone.run(() => this.changeDetectorRef.markForCheck());
				}, timeToUpdate);
			}
			return null;
		});
		let minutes = Math.round(Math.abs(seconds / 60));
		let hours = Math.round(Math.abs(minutes / 60));
		let days = Math.round(Math.abs(hours / 24));
		let months = Math.round(Math.abs(days/30.416));
		let years = Math.round(Math.abs(days/365));
		if (Number.isNaN(seconds)){
			return '';
		} else if (seconds <= 45) {
			return 'a few seconds';
		} else if (seconds <= 90) {
			return 'a minute ago';
		} else if (minutes <= 45) {
			return minutes + ' minutes';
		} else if (minutes <= 90) {
			return 'an hour ago';
		} else if (hours <= 22) {
			return hours + ' hours';
		} else if (hours <= 36) {
			return 'a day ago';
		} else if (days <= 25) {
			return days + ' days';
		} else if (days <= 45) {
			return 'a month ago';
		} else if (days <= 345) {
			return months + ' months';
		} else if (days <= 545) {
			return 'a year';
		} else { // (days > 545)
			return years + ' years';
		}
	}
	ngOnDestroy(): void {
		this.removeTimer();
	}
	private removeTimer() {
		if (this.timer) {
			window.clearTimeout(this.timer);
			this.timer = null;
		}
	}
	private getSecondsUntilUpdate(seconds:number) {
		let min = 60;
		let hr = min * 60;
		let day = hr * 24;
		if (seconds < min) { // less than 1 min, update every 2 secs
			return 2;
		} else if (seconds < hr) { // less than an hour, update every 30 secs
			return 30;
		} else if (seconds < day) { // less then a day, update every 5 mins
			return 300;
		} else { // update every hour
			return 3600;
		}
	}
}