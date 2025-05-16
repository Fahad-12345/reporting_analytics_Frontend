import { Component, OnInit } from '@angular/core';
import { v4 as uuidv4 } from 'uuid'
import { FieldConfig } from '../../models/fieldConfig.model';
import { FormGroup } from '@angular/forms';
@Component({
	selector: 'app-signature-box',
	templateUrl: './signature-box.component.html',
	styleUrls: ['./signature-box.component.scss']
})
export class SignatureBoxComponent implements OnInit {

	id: string;
	constructor() {
		this.id = uuidv4()
	}

	field: FieldConfig;
	group: FormGroup;
	ngOnInit() {
	}
	onChange(event) {
		this.group.get(this.field.name).setValue(event)
	}
}
