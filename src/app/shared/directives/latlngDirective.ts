import { Directive, ElementRef, HostListener, Input } from '@angular/core';


@Directive({
  selector: 'input[latLngOnly]'
})
export class LatLngDirective {

  


constructor(el: ElementRef) {
}

@HostListener('keypress', ['$event']) isLatLng(event) {
	debugger;

	let keyboardEvent = <KeyboardEvent> event;
	let value= keyboardEvent.key;
	let characterRegex = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/ ;
	let result= characterRegex.test(value);
	if (result==true){
		return true;
	}
	else {
		return false;
	} 
	

}
}
