import { Component } from '@angular/core';
import { InputClass } from '../models/InputClass.class';
import { InputTypes } from '../constants/InputTypes.enum';
import { FormGroup, Validators } from '@angular/forms';
import { ButtonClass } from '../models/ButtonClass.class';
import { ButtonTypes } from '../constants/ButtonTypes.enum';

@Component({
	selector: 'app-dynamic-form',
	templateUrl: './dynamic-form.component.html',
	styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponentDemo {

	constructor() { }


	form: FormGroup;
	fieldConfig = [
		new InputClass('Enter Name', 'name', InputTypes.text,'',[{ name: 'required', message: 'This field is required', validator: Validators.required }]),
		new InputClass('Enter Date', 'date', InputTypes.date,null,[{ name: 'required', message: 'This field is required', validator: Validators.required }]),
		new ButtonClass("Button", ['btn', 'btn-primary', 'btn-block mt-0 mb-3 mb-sm-0'], ButtonTypes.submit)
	]

	onSubmit(form) {
	}

	onReady(form: FormGroup) {
	}

}
