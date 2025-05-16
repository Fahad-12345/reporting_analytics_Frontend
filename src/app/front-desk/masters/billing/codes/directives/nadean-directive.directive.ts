
import { Directive, ElementRef, HostListener, Input } from '@angular/core';
@Directive({
  selector: 'input[appNadeanDirective]'
})
export class NadeanDirectiveDirective {


  constructor(private _el: ElementRef) { }

  @HostListener('input', ['$event']) onInputChange(event) {
    const initalValue: string = this._el.nativeElement.value;
    let alphaNumeric = initalValue.substr(0, 2);  
    let numeric = initalValue.substr(2);
    var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/; // Add by Fahad For prevent entering special characters
    if (format.test(alphaNumeric)) { // Add by Fahad For prevent entering special characters
    // if (/\d/.test(alphaNumeric)) {
      alphaNumeric = alphaNumeric.replace(alphaNumeric, '')
    }



    numeric = numeric.replace(/[^0-9]*/g, '')



    this._el.nativeElement.value = alphaNumeric + numeric

    if (this._el.nativeElement.value.length > 7) {
      this._el.nativeElement.value = this._el.nativeElement.value.substr(0, 9)
    }
    if (initalValue !== this._el.nativeElement.value) {
      event.stopPropagation();
    }
  }
}
