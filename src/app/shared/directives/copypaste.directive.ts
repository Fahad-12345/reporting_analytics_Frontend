import { Directive, HostListener, Input, ElementRef } from '@angular/core';

@Directive({
  selector: '[appBlockCopyPaste]'
})
export class BlockCopyPasteDirective {
	
	@Input() currentValue:string = '';
    @Input() allowedLength : number =0;

    constructor(el: ElementRef) {
    }

    @HostListener('paste', ['$event']) appBlockCopyPaste(event:any) {
		if (event && event.clipboardData){
	    let value = event.clipboardData.getData('text/plain');
        if (value.length>(this.allowedLength+1)){
			///event.preventDefault();
			
            return false;
        }
        else {
			// event.preventDefault();)
            return true;
		}
	}

}
	

	
}


