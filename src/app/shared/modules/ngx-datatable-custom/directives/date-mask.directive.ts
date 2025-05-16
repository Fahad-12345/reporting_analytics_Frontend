import {
	Directive,
	ElementRef,
	Input,
	OnDestroy,
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { Subscription } from 'rxjs';

@Directive({
	selector: '[appMaskDate]',
})
export class MaskDateDirective implements OnDestroy {
	mask = [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]; // dd/mm/yyyy
	maskedInputController;
	@Input() appMaskDate;
	eventSubscription: Subscription;

	//========================================================================================
	/*                                                                                      *
	 *The Constructor is a default method of the class that is executed when the class is instantiated and ensures proper initialization of fields in the class and its subclasses*
	 *                                                                                      */
	//========================================================================================

	constructor(private element: ElementRef) {
		// this.maskedInputController = textMask.maskInput({
		//   inputElement: this.element.nativeElement,
		//   mask: this.mask
		// });
		// this.maskedInputController = maskInput({
		//   inputElement: this.element.nativeElement,
		//   mask: this.mask
		// });
	}

	//========================================================================================
	/*                                                                                      *
	 *Angular has completed initialization of a component's view. It is invoked only once when the view is instantiated.*
	 *                                                                                      */
	//========================================================================================

	ngAfterViewInit() {
		fromEvent(this.element.nativeElement, 'focus').subscribe((current) => {
			if (current['target'].value) {
				let arr = current['target'].value.split('/');
				if (arr[0].length == 1) {
					arr[0] = '0' + arr[0];
				}
				if (arr[1].length == 1) {
					arr[1] = '0' + arr[1];
				}
				this.element.nativeElement.value = arr.join('/');
			}
		});
		/**
		 *     Turn event into observable sequence.
		 */
		// this.eventSubscription = fromEvent(this.element.nativeElement, 'input').subscribe(current => {
		//   this.appMaskDate['_datepickerInput']._onInput(this.element.nativeElement.value ? createDateAsUTC(new Date(this.element.nativeElement.value)) : '');
		// });
	}

	//========================================================================================
	/*                                                                                      *
   *method that performs custom clean-up, invoked immediately after a directive,
    pipe, or service instance is destroyed.*
   *                                                                                      */
	//========================================================================================

	ngOnDestroy() {
		console.log('ngOnDestroy Date Directive');
		this.destroyRef();
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
}
