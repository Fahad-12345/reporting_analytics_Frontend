import { Directive, ElementRef,HostListener, Input } from '@angular/core';

@Directive({  selector: "[specficCharacterLengthDirective]" })
export class specficCharacterLengthDirective {
    @Input() currentValue:string;
    @Input() allowedLength : number =5;

    constructor(el: ElementRef) {
    }

    @HostListener('keypress', ['$event']) specficCharacterDirective(event) {
        var  stringValue: string[] = this.currentValue?this.currentValue.substring(1, this.currentValue.length-1).split(""):[];
        if (this.currentValue && this.currentValue.length>this.allowedLength){
			event.preventDefault();
            return false;
        }
        else {
            return true;
        }

    }
}
