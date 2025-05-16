import {
	ComponentFactoryResolver,
	ComponentRef,
	Directive,
	Input,
	Renderer2,
	ViewContainerRef,
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import { AddressComponent } from '../components/address/address.component';
import { AutoCompleteComponent } from '../components/auto-complete/auto-complete.component';
import { ButtonComponent } from '../components/button/button.component';
import { CheckboxComponent } from '../components/checkbox/checkbox.component';
import { DivComponent } from '../components/div/div.component';
// import { DateComponent } from '../components/date/date.component';
import { InputComponent } from '../components/input/input.component';
import {
	MatSearchFilterComponent,
} from '../components/mat-search-filter/mat-search-filter.component';
import { NgSelectFilterComponent } from '../components/ng-select-filter/ng-select-filter.component';
import { RadiobuttonComponent } from '../components/radiobutton/radiobutton.component';
import { SelectComponent } from '../components/select/select.component';
import { SignatureBoxComponent } from '../components/signature-box/signature-box.component';
import { FieldConfig } from '../models/fieldConfig.model';

@Directive({
	selector: '[dynamicField]'
})
export class DynamicFieldDirective {

	//maps components according to the field type.
	componentMapper = {
		button: ButtonComponent,
		checkbox: CheckboxComponent,
		input: InputComponent,
		radiobutton: RadiobuttonComponent,
		select: SelectComponent,
		div: DivComponent,
		autocomplete: AutoCompleteComponent,
		address: AddressComponent,
		signaturebox: SignatureBoxComponent,
		searchFilter:MatSearchFilterComponent,
		ngselect:NgSelectFilterComponent
	}
	constructor(private resolver: ComponentFactoryResolver,
		private container: ViewContainerRef, private renderer: Renderer2) { }
	@Input() field: FieldConfig;
	@Input() group: FormGroup;
	componentRef: ComponentRef<any>;
	ngOnInit() {
		// If there is no element do nothing and return.
		if (!this.field.element) {
			return;
		}

		let element = this.componentMapper[this.field.element]

		if (!element) {
			return;
		}
		// get field element and map it to its respective component from 'contentMapper'

		const factory = this.resolver.resolveComponentFactory(element);

		// create component
		this.componentRef = this.container.createComponent(factory);

		//assign property field property and the form group to the component it is associated to.
		this.componentRef.instance.field = this.field;
		this.componentRef.instance.group = this.group;

		//adds class to the generated components. 'display-contents' gives the component no property of its own and the child element will 
		//dictate it's style. Take it as a wrapper element which wraps what is inside
		this.renderer.addClass(this.componentRef.location.nativeElement, 'display-contents')


	}
}
