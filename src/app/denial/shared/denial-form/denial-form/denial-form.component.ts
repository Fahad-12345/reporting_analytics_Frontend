import { DenialFormSplitComponent } from './../denial-form-split/denial-form-split.component';
import { DenialSplitListComponent } from './../../denial-split-listing/denial-split-listing.component';
import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild, EventEmitter, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
@Component({
  selector: 'app-denial-form',
  templateUrl: './denial-form.component.html',
  styleUrls: ['./denial-form.component.scss']
})
export class DenialFormComponent implements OnInit,OnChanges {


	@Input() currentBill: any = {};

	denialForm: FormGroup;
	denialListingComponent : DenialSplitListComponent;
	@Output() getChangePageDataDenial = new EventEmitter();
	
	@ViewChild('denialSplitListComponent') set setdenialList(content: DenialSplitListComponent) {
	  if (content) { // initially setter gets called with undefined
		this.denialListingComponent = content;
	  }
	}
	denailFormComponent : DenialFormSplitComponent;
	@ViewChild('denailFormComponent') set setdenialForm(content: DenialFormSplitComponent) {
		if (content) { // initially setter gets called with undefined
		  this.denailFormComponent = content;
		}
	  }
	

  constructor() { }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
	// if (this.currentBill && Object.keys(this.currentBill).length > 0) {
	// 	let fileName = this.makeFileName(this.currentBill);
	// 	this.setFileName(fileName, this.denialForm, 'file_name');
	// }
  }

  onChangeDataDenial($event){
	  this.denailFormComponent.resetDenialForm();
	this.getChangePageDataDenial.emit($event);
}
}
