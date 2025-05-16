import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { NgControl, FormControl, Validators } from '@angular/forms';

@Directive({
	selector: '[appDateOnly]'
})
export class DateOnlyDirective implements OnInit {

	constructor(private _el: ElementRef, private control: NgControl) {

	}


	ngOnInit() {
		// console.log('on init')
		if(this.control.control.errors && this.control.control.errors.required){
			this.control.control.setValidators([Validators.required , this.validDateValidator()])
		}else{
			this.control.control.setValidators(this.validDateValidator())
		}
		// this.control.control.setValidators(this.validDateValidator())
	}

	@HostListener('input', ['$event']) onInputChange(event) {
		let initalValue: string = this._el.nativeElement.value;


		let result = initalValue.replace(/[^0-9]*/g, '').substr(0, 8)



		if (event.data && this.isValidDate(new Date(initalValue))) {


			let date = `${result.substr(0, 2)}${result.length > 1 ? '/' : ''}${result.substr(2, 2)}${result.length > 3 ? '/' : ''}${result.substr(4, 4)}`

			this._el.nativeElement.value = date
		} else {
			this._el.nativeElement.value = result
		}
		if (initalValue !== this._el.nativeElement.value) {
			event.stopPropagation();
		}
	}

	validDateValidator() {
		return (control: FormControl) => {
			let initalValue: string = this._el.nativeElement.value;
			initalValue = initalValue.substr(0, 10)
			if (!initalValue) { return; }
			let has_error = !this.isValidDate(new Date(initalValue)) || initalValue.length < 8;
			return has_error ? { 'invalid_date': true } : null
		}
	}
	isValidDate(d: any) {

		let result = d && d instanceof Date && !isNaN(d as any)
		return result;
	}

	@HostListener('focus', ['$event']) OnFocus(event) {
		// this._el.nativeElement.value = '';
	}
}
