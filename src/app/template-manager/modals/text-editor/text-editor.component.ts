import { Component, OnInit, Input, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { MainServiceTemp } from '../../services/main.service';
import { Router } from '@angular/router';
import { LayoutService } from '../../services/layout.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';

@Component({
	selector: 'app-text-editor',
	templateUrl: './text-editor.component.html',
	styleUrls: ['./text-editor.component.css'],
	encapsulation: ViewEncapsulation.None,
})
export class TextEditorComponent implements OnInit {
	@Input() multiplePreviews: any;
	@Output() multiPdfSelectIntance = new EventEmitter();
	constructor(
		public mainService: MainServiceTemp,
		public router: Router,
		public layoutService: LayoutService,
	) {}

	ngOnInit() {}
	public closeEditor() {
		this.layoutService.editorView = true;
		this.layoutService.isShowEditor = false;
	}
}
