import { NgControl } from '@angular/forms';
import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[disableControl]'
})
export class DisableControlDirective {


  constructor( private ngControl : NgControl ) {
    
  }

  
  @Input() set disableControl( condition : boolean ) {
    if(condition && this.ngControl && this.ngControl?.control){
      this.ngControl?.control?.disable()    
    }
    if(!condition && this.ngControl && this.ngControl?.control){
      this.ngControl?.control?.enable()    
    }
  }

}