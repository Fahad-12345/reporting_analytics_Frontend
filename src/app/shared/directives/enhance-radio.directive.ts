import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: 'input[appEnhanceRadio]'
})
export class EnhanceRadioDirective {

  @Input('oldValue') oldValue: string ='';
  @Input('value') value: string='';
  constructor(private control: NgControl) { }

  compareValueAndSet() {
  }

  @HostListener('click', ['$event.target'])
  onClick() {
    if (this.value === this.oldValue || typeof (this.value) == 'object' && typeof (this.oldValue) == 'object' && (JSON.stringify(this.value) === JSON.stringify(this.oldValue))) {
      this.control.control.setValue(null);
    }
  }

}
