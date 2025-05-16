import { Pipe, PipeTransform, NgZone, ChangeDetectorRef, OnDestroy } from "@angular/core";
@Pipe({
    name: 'AddBillingTitle',
    pure: true
})
export class BillingTitlePipe implements PipeTransform, OnDestroy {
    constructor(private changeDetectorRef: ChangeDetectorRef, private ngZone: NgZone) { }
    transform(billing_title: string) {
        return (billing_title) ? ', ' + billing_title : '';
    }
    ngOnDestroy(): void {
    }
}
