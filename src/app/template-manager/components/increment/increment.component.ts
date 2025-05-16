import {
	Component,
	ChangeDetectorRef,
	ViewEncapsulation,
	OnInit,
	ChangeDetectionStrategy,
} from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import { DomSanitizer } from '@angular/platform-browser';
import { SubjectService } from '../../services/subject.service';
import { UI_COMPONENT_TYPES } from '@appDir/template-manager/common/constants';

@Component({
	selector: 'app-increment',
	templateUrl: './increment.component.html',
	styleUrls: ['./increment.component.css'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncrementComponent implements OnInit {
	object: any = {};
	boundStatement: any = '';
	paraClickCheck = false;
	subscription: any;
	editText: any = false;

	constructor(
		public changeDetector: ChangeDetectorRef,
		public subject: SubjectService,
		public layoutService: LayoutService,
		public sanitizer: DomSanitizer,
	) {}

	ngOnInit() {
		this.subscription = this.subject.incrementRefresh.subscribe((res) => {
			if (res.length != 0) {
				if (this.object.uicomponent_name == res.uicomponent_name) {
					this.changeDetector.markForCheck();
					this.subject.objectRefreshItem('');
				}
			}
		});
		if (!this.object.instanceStatement || this.object.instanceStatement.length == 0) {
			this.object.instanceStatement = this.object.statement;
		}
		this.boundStatement = this.object.statement;
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

	isFilled() {
		if (
				(
					!
					(!this.layoutService.editorView && !this.layoutService.isShowEditor) 
				&&
					this.object && 
					(
						this.object.is_required && this.object.answers && this.object.answers.length == 0
						||
						this.object.value<this.object.options.floor
						||
						this.object.value>this.object.options.ceil
					)
				)
			&& 
			!(
				(this.object.selected_linked_ui_component != this.object.linked_ui &&
					!this.object.is_single_select) ||
				(!this.object.selected_linked_ui_component && this.object.linked_ui)
			)
		) { 
				return false
		}
		return true;
	}

	public valueChange(value: any): void {
		value = Number(value);
		// if (value > this.object.options.ceil) {
		// 	value = this.object.options.ceil;
		// }
		// if (value < this.object.options.floor || value == null || isNaN(value)) {
		// 	value = this.object.options.floor;
		// }
		this.object.value = value;
		for (let i = 0; i < this.layoutService.template.sections.length; i++) {
			for (let j = 0; j < this.layoutService.template.sections[i].dashboard.length; j++) {
				if (
					this.layoutService.template.sections[i].dashboard[j].obj.type == UI_COMPONENT_TYPES.INCREMENT &&
					this.layoutService.template.sections[i].dashboard[j].obj.uicomponent_name ===
						this.object.uicomponent_name
				) {
					this.layoutService.template.sections[i].dashboard[j].obj.answers = [];
					if (this.layoutService.template.sections[i].dashboard[j].obj.linkedStatementCheck) {
						let tempAnswer =
							this.layoutService.template.sections[i].dashboard[j].obj.linkedStatement;
						tempAnswer = tempAnswer.replaceAll('#input', value ? value : 0);
						this.layoutService.template.sections[i].dashboard[j].obj.answers.push({
							answer: tempAnswer,
						});
					} else {
						let valueInString = JSON.stringify(value);
						if (valueInString == 'null') {
							valueInString = '0';
						}
						this.layoutService.template.sections[i].dashboard[j].obj.answers.push({
							answer: value,
						});
					}
					break;
				}
			}
		}
		this.layoutService.updateComponents();
		}
	clearFunc() {
		this.object.value = this.object.options.floor;
		this.object.answers = [];
		this.layoutService.updateComponents();
	}
	operatorsFunc(operator) {
		if (operator == '+') {
			if (this.object.value < this.object.options.ceil) {
				this.object.value = this.object.value + 1;
				this.valueChange(this.object.value);
			}
		} else {
			if (this.object.value > this.object.options.floor) {
				this.object.value = this.object.value - 1;
				this.valueChange(this.object.value);
			}
		}
	}
}
