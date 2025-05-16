import { Directive, ElementRef,HostListener } from '@angular/core';

@Directive({  selector: "[alphabaticOnly]" })
export class alphabaticOnly {

    constructor(el: ElementRef) {
    }

    @HostListener('keypress', ['$event']) isAlphabatic(event) {

        let keyboardEvent = <KeyboardEvent> event;
        let value= keyboardEvent.key;
        let characterRegex=/^[a-zA-Z ]*$/;
        let result= characterRegex.test(value);
        if (result==true){
            return true;
        }
        else {
            return false;
        } 

    }
}
