import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
	selector: '[appOnlyNumeric]'
})
export class OnlyNumericDirective {
	@Input() allowedPaste: boolean = true;
	@Input() allowedDecimal: boolean = true;
	@Input() allowedNegativeSign: boolean = false;
	constructor(private el: ElementRef) {
	}

	@HostListener('keypress', ['$event']) isNumeric(event:any) {
		debugger;
		let keyboardEvent = <KeyboardEvent>event;
		if (keyboardEvent.which == 13) { return }   //don't do anything if enter is pressed; default form submission
		let value = keyboardEvent.key;
		let characterRegex = /^\d+$/;
		debugger;
		if (this.allowedDecimal) {
			event.target.value
			if (event.target.value) {	
				if (event.target.value.indexOf(".") >= 0 && keyboardEvent.which == 46) {
					return false;
				}
				

			}
			characterRegex = /^\d*\.?\d*$/;
		}
	   if (this.allowedNegativeSign){
		if (event.target.value) {	
			if (event.target.value.indexOf(".") >= 0 && keyboardEvent.which == 46) {
				return false;
			}
			let info = event.target.value.indexOf("-");
			if (event.target.value.indexOf("-") == 0 && keyboardEvent.which == 45) {
				return false;
			}
			

		}
		
			characterRegex = /^[+-]?\d*\.?\d{0,9}$/;

		
	   }
		let result = characterRegex.test(value);
		if (result == true) {
			return true;
		}
		else {
			return false;
		}


	}
	@HostListener('paste', ['$event']) blockPaste(event: ClipboardEvent) {
		if (this.allowedPaste && this.allowedDecimal) {
			let clipboardData = event.clipboardData;
			let pastedText = clipboardData.getData('text');
			let trimmedText = pastedText.replace(/[^0-9.]/g, '');
			this.el.nativeElement.value = trimmedText;
			event.preventDefault();
		}

	}
}
