import { Component, ViewEncapsulation, OnInit } from '@angular/core';

@Component({
	selector: 'app-template-instance',
	templateUrl: './template-instance.component.html',
	styleUrls: ['./template-instance.component.css'],
	encapsulation: ViewEncapsulation.None,
})
export class TemplateInstanceComponent implements OnInit {
	constructor() {}

	ngOnInit() {}
}
