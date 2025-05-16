import { Directive, ElementRef, Output, EventEmitter, OnDestroy } from '@angular/core';

@Directive({
  selector: '[clickOutside]'
})
export class ClickOutsideDirective implements OnDestroy {
  @Output() clickOutside = new EventEmitter<void>();

  private handleClick = (event: MouseEvent) => {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.clickOutside.emit();
    }
  }

  constructor(private elementRef: ElementRef) {
    document.addEventListener('click', this.handleClick);
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.handleClick);
  }
}
