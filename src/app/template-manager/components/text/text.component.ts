import {
	Component,
	OnInit,
	ViewEncapsulation,
	ChangeDetectorRef,
	ChangeDetectionStrategy,
} from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import { SubjectService } from '../../services/subject.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
	selector: 'app-text',
	templateUrl: './text.component.html',
	styleUrls: ['./text.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextComponent implements OnInit {
	object: any = {};
	item: any = {};
	subscription: any;
	editText: any = false;
	boundStatement: any = '';
	constructor(
		public changeDetector: ChangeDetectorRef,
		public layoutService: LayoutService,
		public sanitizer: DomSanitizer,
		public subject: SubjectService,
	) {}
	public uiComponents: any = [];
	ngOnInit() {
		this.subscription = this.subject.textRefresh.subscribe((res) => {
			if (res.length != 0) {
				if (this.object.uicomponent_name == res.uicomponent_name) {
					this.changeDetector.markForCheck();
				}
			}
		});
		if (!this.object.instanceStatement || this.object.instanceStatement.length == 0) {
			this.object.instanceStatement = this.object.statement;
		}
		this.boundStatement = this.object.statement;

		let finalStatement: string = '';
		let isHTMLTag = false;
		for (let char of this.object.statement) {
			if (char == ' ' && !isHTMLTag) {
				finalStatement = finalStatement + '&nbsp;';
			} else if (char == '<') {
				isHTMLTag = true;
				finalStatement = finalStatement + char;
			} else if (char == '>' && isHTMLTag) {
				isHTMLTag = false;
				finalStatement = finalStatement + char;
			} else {
				finalStatement = finalStatement + char;
			}
		}
		this.object.statement = finalStatement;
	}
	statementUpdate() {
		this.object.instanceStatement = this.object.statement;
		this.layoutService.updateComponents();
	}
	ngOnDestroy() {
		this.subscription.unsubscribe();
	}
}
