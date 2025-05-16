import { Directive, ElementRef,HostListener, Input } from '@angular/core';

@Directive({  selector: "[spaceNotAllowed]" })
export class spaceNotAllowedDirective {
  

    constructor(el: ElementRef) {
    }

    @HostListener('keypress', ['$event']) spaceNotAllowed(event) {
      		let keyboardEvent = <KeyboardEvent> event;
        let value= keyboardEvent.key;
        let characterRegex=  /\s/g;
        let result= characterRegex.test(value);
        if (result==true){
            return false;
        }
        else {
            return true;
        }
    }
}

