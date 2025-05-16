import { Pipe, PipeTransform, NgZone, ChangeDetectorRef, OnDestroy } from "@angular/core";
@Pipe({
    name: 'FullName',
    pure: true
})
export class FullNamePipe implements PipeTransform, OnDestroy {
    constructor(private changeDetectorRef: ChangeDetectorRef, private ngZone: NgZone) { }
    transform(first_name: string,middle_name: string,last_name:string) {
		debugger;
		if(!first_name && !middle_name && !last_name)
		{
			return ''
		}
		let fullName=`${first_name}${middle_name?' '+middle_name:''} ${last_name}`;
		if(!fullName)
		{
			fullName=""
		}
        return fullName
    }
    ngOnDestroy(): void {
    }
}
