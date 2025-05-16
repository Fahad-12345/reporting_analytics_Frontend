import {Directive, ElementRef, HostListener} from '@angular/core';

@Directive({
  selector: '[appOnlyNumeric]'
})
export class OnlyNumericDirective {

  constructor(el: ElementRef) {
  }

  @HostListener('keypress', ['$event']) isNumeric(event) {

    let keyboardEvent = <KeyboardEvent> event;
    let value= keyboardEvent.key;
    let characterRegex=/^\d+$/;
    let result= characterRegex.test(value);
    if (result==true){
      return true;
    }
    else {
      return false;
    }

  }

}

