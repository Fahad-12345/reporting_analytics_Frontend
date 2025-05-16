import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'app-signature-view',
	templateUrl: './signature-view.component.html',
	styleUrls: ['./signature-view.component.scss']
})
export class SignatureViewComponent implements OnInit {

	constructor(private activeModal: NgbActiveModal) { }
	link: string;
	file_title: string;
	ngOnInit() {

	}

	ngOnChanges() {

	}
	close() {
		this.activeModal.close()
	}
}
