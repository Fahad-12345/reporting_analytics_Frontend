import {
	Component,
	OnInit,
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import { v4 as uuidv4 } from 'uuid';

import { FieldConfig } from '../../models/fieldConfig.model';

@Component({
	selector: 'app-auto-complete',
	templateUrl: './auto-complete.component.html',
	styleUrls: ['./auto-complete.component.scss']
})
export class AutoCompleteComponent implements OnInit {



	constructor() {
		

		this.id = uuidv4()
	}

	field: FieldConfig;
	group: FormGroup;
	id: string;
	labelCheck = false;

	ngOnChanges() {

	}
	// items: [] = []
	ngOnInit() {
		// this.keyDownEvent({ target: { value: '' } })
		// this.items = this.field.items
	}
	keyDownEvent(event) {
		if (this.field.onSubmit)
			this.field.onSubmit(event.target.value).subscribe(items => {
				this.field.items = items
			})
	}

	onBlurEvent(event) {
		
		if (this.field.onBlur)
			this.field.onBlur(event.target.value).subscribe(items => {
				this.field.items = items
			})
	}

	onFocusEvent(event) {
	
		if (this.field.onFocus)
			this.field.onFocus(event.target.value).subscribe(items => {
				this.field.items = items
			})
	}

	onClearEvent(event) {
		if (this.field.onClear)
			this.field.onClear().subscribe(items => {
				this.field.items = items
			})
	}
	feildAction(e: any){
		this.labelCheck = e;
	}

	addTagFn(name) {
		debugger;
        return {id:name, employer_name: name, tag: true };
    }
}
