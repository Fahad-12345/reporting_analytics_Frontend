import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appTaxonomycode]'
})
export class TaxonomycodeDirective {

  constructor(private _el: ElementRef) { }
  @HostListener('input', ['$event']) onInputChange(event) {
    const initalValue: string = this._el.nativeElement.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    let X = initalValue.substr(9,9);
    let alphaNumeric = initalValue.substr(0, 9);  
    
    var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/; 
    if (format.test(alphaNumeric)) {
      alphaNumeric = alphaNumeric.replace(alphaNumeric, '')
    }

    X = X.replace(/[^X]/g, '')
    alphaNumeric += X; 
    this._el.nativeElement.value = alphaNumeric.substr(0,10);
    if (initalValue !== this._el.nativeElement.value) {
      event.stopPropagation();
    }
  }
}
