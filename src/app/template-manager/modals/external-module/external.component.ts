import { Component, OnInit, Input } from '@angular/core';

@Component({
	selector: 'app-external',
	templateUrl: './external.component.html',
	styleUrls: ['./external.component.css'],
})
export class ExternalComponent implements OnInit {
	constructor() {}
	@Input() module;
	@Input() templateData;
	ngOnInit() {}
}
