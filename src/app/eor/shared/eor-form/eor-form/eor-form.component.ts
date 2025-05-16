import { EorSplitListComponent } from './../../eor-split-listing/eor-split-listing.component';
import { Component, Input,Output, OnInit, OnChanges, SimpleChanges, ViewChild, EventEmitter } from '@angular/core';
import {
	FormGroup
} from '@angular/forms';
@Component({
	selector: 'app-eor-form',
	templateUrl: './eor-form.component.html',
	styleUrls: ['./eor-form.component.scss'],
})
export class EorFormComponent implements OnInit, OnChanges {
	@Input() currentBill: any = {};
	eorForm: FormGroup;
	eorListingComponent: EorSplitListComponent;
	@ViewChild('eOrListingComponent') set setEorList(content: EorSplitListComponent) {
		if (content) {
			// initially setter gets called with undefined
			this.eorListingComponent = content;
		}
	}

	@Output() getChangePageDataEor = new EventEmitter();
	constructor() {}

	ngOnInit() {}

	ngOnChanges(changes: SimpleChanges): void {
		// if (this.currentBill && Object.keys(this.currentBill).length > 0) {
		// 	let fileName = this.makeFileName(this.currentBill);
		// 	this.setFileName(fileName, this.eorForm, 'file_name');
		// }
	}

	onEditEor($event) {
	}

	getChangePageData($event){
		this.getChangePageDataEor.emit($event);
	}
}
