import { Component, ViewEncapsulation, OnInit, ChangeDetectorRef } from '@angular/core';

import { LayoutService } from '../../services/layout.service';
@Component({
	selector: 'app-line',
	templateUrl: './line.component.html',
	styleUrls: ['./line.component.css'],
	encapsulation: ViewEncapsulation.None,
})
export class LineComponent implements OnInit {
	object: any = {};
	constructor(public layoutService: LayoutService) {}
	ngOnInit() {}
}
