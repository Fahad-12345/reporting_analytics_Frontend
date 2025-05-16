import { Directive, HostListener, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appTitleCase]'
})
export class TitleCaseDirective {

  @Input() appTitleCase: boolean = false
  constructor(private _el: ElementRef) { }
  @HostListener('input', ['$event']) onInputChange(event) {
    let initalValue: string = this._el.nativeElement.value;

    if (this.appTitleCase)
      this._el.nativeElement.value = this.toTitleCase(initalValue)

  }

  toTitleCase(str) {
    return str.replace(
      /\w\S*/g,
      function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
  }
}
