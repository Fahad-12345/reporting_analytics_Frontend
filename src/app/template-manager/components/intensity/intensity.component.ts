import {
	Component,
	ViewEncapsulation,
	OnInit,
	ChangeDetectorRef,
	ChangeDetectionStrategy,
} from '@angular/core';
import { Options } from '@angular-slider/ngx-slider';
import { LayoutService } from '../../services/layout.service';
import { DomSanitizer } from '@angular/platform-browser';
import { SubjectService } from '../../services/subject.service';
import { UI_COMPONENT_TYPES } from '@appDir/template-manager/common/constants';

@Component({
	selector: 'app-intensity',
	templateUrl: './intensity.component.html',
	styleUrls: ['./intensity.component.css'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntensityComponent implements OnInit {
	object: any = {};
	value: number = 100;
	boundStatement: any = '';
	subscription: any;
	paraClickCheck = false;
	options: Options = {
		floor: 0,
		ceil: 100,
	};
	editText: any = false;
	options2: Options = {
		floor: 0,
		ceil: 100,
	};
	range: any = 0;
	constructor(
		public changeDetector: ChangeDetectorRef,
		public subject: SubjectService,
		public layoutService: LayoutService,
		public sanitizer: DomSanitizer,
	) {}

	ngOnInit() {
		this.subscription = this.subject.intensityRefresh.subscribe((res) => {
			if (res.length != 0) {
				if (this.object.uicomponent_name == res.uicomponent_name) {
					this.options = { ...this.object.options}
					this.changeDetector.markForCheck();
					this.subject.objectRefreshItem('');
				}
			}
		});
		if (!this.object.instanceStatement || this.object.instanceStatement.length == 0) {
			this.object.instanceStatement = this.object.statement;
		}
		this.boundStatement = this.object.statement;
		this.options2 = Object.assign({}, this.options2, { disabled: true });
		if (!this.object.defaultChecked) {
			if (this.object.defaultValue) {
				this.object.value = this.object.defaultValue;
				this.valueChange(this.object.defaultValue);
				this.object.defaultChecked = true;
			}
		}
	}
	statementUpdate() {
		this.object.instanceStatement = this.object.statement;
		this.layoutService.updateComponents();
	}
	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	textClick() {
		let textArea = document.getElementById('inputText' + this.object.uicomponent_name);
		this.boundStatement = textArea.innerText;
		this.editText = true;
		this.paraClickCheck = true;
	}
	textAreaClick() {
		if (!this.paraClickCheck) {
			let textArea: any = document.getElementById('inputText' + this.object.uicomponent_name);
			if (textArea.innerText != this.boundStatement) {
				textArea.innerText = this.boundStatement;
			}
			this.object.statement = textArea.innerHTML;
			this.editText = false;
		} else {
			this.paraClickCheck = false;
		}
	}
	editStatement() {
		this.editText = false;
	}
	public valueChange(value: number): void {
		for (let i = 0; i < this.layoutService.template.sections.length; i++) {
			for (let j = 0; j < this.layoutService.template.sections[i].dashboard.length; j++) {
				if (this.layoutService.template.sections[i].dashboard[j].obj.type == UI_COMPONENT_TYPES.INPUT) {
					} else if (this.layoutService.template.sections[i].dashboard[j].obj.type == UI_COMPONENT_TYPES.TEXT) {
					} else if (
					this.layoutService.template.sections[i].dashboard[j].obj.type == UI_COMPONENT_TYPES.INTENSITY &&
					this.layoutService.template.sections[i].dashboard[j].obj.uicomponent_name ===
						this.object.uicomponent_name
				) {
					this.layoutService.template.sections[i].dashboard[j].obj.answers = [];
					if (this.layoutService.template.sections[i].dashboard[j].obj.linkedStatementCheck) {
						let tempAnswer =
							this.layoutService.template.sections[i].dashboard[j].obj.linkedStatement;
						tempAnswer = tempAnswer.replaceAll('#input', value);

						this.layoutService.template.sections[i].dashboard[j].obj.answers.push({
							answer: tempAnswer,
						});
					} else {
						const answer = this.layoutService.applyEditor(
							this.layoutService.template.sections[i].dashboard[j].obj,
							value.toString(),
						);
						this.layoutService.template.sections[i].dashboard[j].obj.answers.push({
							answer: answer,
						});
					}
					break;
				}
				}
		}

		this.layoutService.updateComponents();
		this.subject.instanceRefreshCheck('tick');
		}
	clearFunc() {
		this.object.value = this.object.options.floor;
	}
}
