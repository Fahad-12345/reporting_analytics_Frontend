import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
	selector: 'app-dialogue',
	templateUrl: './dialogue.component.html',
	styleUrls: ['./dialogue.component.css'],
})
export class DialogueComponent implements OnInit {
	constructor(public activeModal: NgbActiveModal) {}

	ngOnInit() {}
}
