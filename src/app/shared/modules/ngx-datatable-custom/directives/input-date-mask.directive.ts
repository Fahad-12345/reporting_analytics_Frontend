import { Directive, ElementRef, OnDestroy, Input, HostListener } from '@angular/core';
import { maskInput } from '../../../vanila-text-mask/vanillaTextMask.js';
import { fromEvent } from 'rxjs';
import { Subscription } from 'rxjs';
import { createDateAsUTC } from '@appDir/shared/utils/utils.helpers';
import { DateOnlyDirective } from '@appDir/front-desk/masters/billing/codes/directives/date-only.directive.js';
import { FormControl, NgControl, Validators } from '@angular/forms';


@Directive({
  selector: '[appInputDateMask]',


})
export class InputDateMaskDirective implements  OnDestroy {
  mask = [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]; // dd/mm/yyyy
  maskedInputController;
  @Input() appMaskDate;
  eventSubscription: Subscription;

  //========================================================================================
  /*                                                                                      *
   *The Constructor is a default method of the class that is executed when the class is instantiated and ensures proper initialization of fields in the class and its subclasses*
   *                                                                                      */
  //========================================================================================

  constructor(private element: ElementRef,private control: NgControl) {
    // this.maskedInputController = textMask.maskInput({
    //   inputElement: this.element.nativeElement,
    //   mask: this.mask
    // });
    this.maskedInputController = maskInput({
      inputElement: this.element.nativeElement,
      mask: this.mask
    });
  }

  //========================================================================================
  /*                                                                                      *
   *Angular has completed initialization of a component's view. It is invoked only once when the view is instantiated.*
   *                                                                                      */
  //========================================================================================

  ngAfterViewInit() {

    // fromEvent(this.element.nativeElement, 'focusout').subscribe(current => {
    //   debugger;

    // });
    fromEvent(this.element.nativeElement, 'focus').subscribe(current => {
      this.element.nativeElement.focus();
      if (current['target'].value) {
        let arr = current['target'].value.split('/');
        if (arr &&  arr[0].length == 1) {
          arr[0] = '0' + arr[0];
        }
        if (arr && arr.length>0 && arr[1].length == 1) {
          arr[1] = '0' + arr[1];
        }
        this.element.nativeElement.value = arr.join('/');
        // this.element.nativeElement.value = createDateAsUTC(new Date(arr.join('/')));
      }
    });
    /**
  *     Turn event into observable sequence.
  */
    this.eventSubscription = fromEvent(this.element.nativeElement, 'input').subscribe(current => {

       if (this.appMaskDate && this.appMaskDate._datepickerInput){
      this.appMaskDate['_datepickerInput']._onInput(this.element.nativeElement.value ? createDateAsUTC(new Date(this.element.nativeElement.value)) : '');
       }
    });
  }

  //========================================================================================
  /*                                                                                      *
   *method that performs custom clean-up, invoked immediately after a directive,
    pipe, or service instance is destroyed.*
   *                                                                                      */
  //========================================================================================

  ngOnDestroy() {
    this.destroyRef();
  }
  @HostListener('focusout', ['$event'])

  onFocusOut(event: any) {
    let minYear: string = event.target?.value?.split('/')[2]?.split('-')[0];
    if(Number(minYear?.slice(0, 4)) < 1900){
      this.control.reset(null);
    }
   
  }
  @HostListener('keypress', ['$event'])

  onKeyPress(event: any) {
    let minYear: string = event.target?.value?.split('/')[2]?.split('-')[0];
    if (Number(minYear?.slice(0, 2)) < 19) {
      return false;
    }
  }
  //========================================================================================
  /*                                                                                      *
   *                           Destroy Description and References                          *
   *                                                                                      */
  //========================================================================================

  destroyRef() {
    this.maskedInputController.destroy();
    this.eventSubscription.unsubscribe();
  }

  ngOnInit() {
		if(this.control.control.errors && this.control.control.errors.required){
			this.control.control.setValidators([Validators.required , this.validDateValidator()])
		}else{
			this.control.control.setValidators(this.validDateValidator())
		}
	}


	validDateValidator() {
		return (control: FormControl) => {
			let initalValue: string = this.element.nativeElement.value;
			initalValue = initalValue.substr(0, 10)
			if (!initalValue) { return; }
      if (control && control.value){
        initalValue=control.value;
      }
		  let has_error =  !this.isValidDate(new Date(initalValue)) || initalValue.length < 8;
		 return has_error ? { 'invalid_date': true } : null
		}
	}
	isValidDate(d: any) {

		let result = d && d instanceof Date && !isNaN(d as any);
		return result;
	}
}

