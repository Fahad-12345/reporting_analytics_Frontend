import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appBlockedCopyPaste]'
})
export class BlockedCopyPasteDirective {
  constructor() { }

  @HostListener('paste', ['$event']) blockPaste(e: KeyboardEvent) {
	  debugger;
    e.preventDefault();
  }

  @HostListener('copy', ['$event']) blockCopy(e: KeyboardEvent) {
    e.preventDefault();
  }

  @HostListener('cut', ['$event']) blockCut(e: KeyboardEvent) {
    e.preventDefault();
  }
  @HostListener('drag', ['$event']) blockDrag(e: KeyboardEvent) {
    e.preventDefault();
  }
  @HostListener('drop', ['$event']) blockDrop(e: KeyboardEvent) {
    e.preventDefault();
  }
}
