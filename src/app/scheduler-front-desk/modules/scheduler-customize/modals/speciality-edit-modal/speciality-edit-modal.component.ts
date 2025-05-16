import {
	Component,
	EventEmitter,
	OnInit,
} from '@angular/core';

import { BsModalRef } from 'ngx-bootstrap/modal';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { CustomizeService } from '../../service/customize.service';

@Component({
	selector: 'app-speciality-edit-modal',
	templateUrl: './speciality-edit-modal.component.html',
	styleUrls: ['./speciality-edit-modal.component.scss'],
})
export class SpecialityEditModalComponent implements OnInit {
	selectedRow;
	linkColor: string;
	public event: EventEmitter<any> = new EventEmitter();

	constructor(
		public activeModal: NgbActiveModal,
		public bsModalRef: BsModalRef,
		public customizeService: CustomizeService,
	) {}

	ngOnInit() {
		this.linkColor = this.selectedRow.color;
	}
	setColor(params) {
		this.linkColor = params;
	}

	triggerEvent() {
		// this.selectedRow.linkColor;
		if ( this.selectedRow.color !== this.linkColor) {
			this.event.emit({ data: this.selectedRow, color: this.linkColor });
		}
		this.bsModalRef.hide();
	}
}
