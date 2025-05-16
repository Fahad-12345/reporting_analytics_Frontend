import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import * as _ from 'lodash';
import { LayoutService } from './services/layout.service';
@Component({
	selector: 'app-template-manager',
	templateUrl: './template-manager.component.html',
	styleUrls: ['./template-manager.component.scss'],
	providers: [{ provide: APP_BASE_HREF, useValue: '/' }],
	encapsulation: ViewEncapsulation.None,
})
export class TemplateManagerComponent implements OnInit {
	constructor(public layoutService: LayoutService) {}
	async ngOnInit() {
	}
}
