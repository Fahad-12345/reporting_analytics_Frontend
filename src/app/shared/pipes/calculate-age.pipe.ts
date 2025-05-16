import { Pipe, PipeTransform, NgZone, ChangeDetectorRef, OnDestroy } from "@angular/core";
import { getAge } from "@appDir/medical-doctor/referal-forms/shared/utils/helpers";
@Pipe({
    name: 'calculateAge',
    pure: false
})
export class CalculateAgePipe implements PipeTransform, OnDestroy {
    private timer: number;
    constructor(private changeDetectorRef: ChangeDetectorRef, private ngZone: NgZone) { }
    transform(date: string) {

        return (date) ? getAge(new Date(date), 'long') : 'N/A';
    }
    ngOnDestroy(): void {
    }
}