import {
	Component,
	ViewEncapsulation,
	OnInit,
	ChangeDetectorRef,
	Inject,
	OnDestroy,
	ChangeDetectionStrategy,
} from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import { AngularEditorService } from '../../shared/angular-editor/angular-editor.service';
import { DomSanitizer } from '@angular/platform-browser';
import { TemaplateManagerUrlsEnum } from '@appDir/template-manager/template-manager-url-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { ToastrService } from 'ngx-toastr';
import { HttpSuccessResponse, StorageData } from '@appDir/pages/content-pages/login/user.class';
import { SubjectService } from '../../services/subject.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { convertDateTimeForRetrieving } from '@appDir/shared/utils/utils.helpers';
import emailautocomplete from 'js-email-autocomplete';

import { FormControl, FormGroup } from '@angular/forms';

import { DOCUMENT } from '@angular/common';
import { UI_COMPONENT_TYPES } from '@appDir/template-manager/common/constants';
import * as moment from 'moment';
@Component({
	selector: 'app-input',
	templateUrl: './input.component.html',
	styleUrls: ['./input.component.css'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent implements OnInit, OnDestroy {
	searchCaseType: FormGroup;
	object: any = {};
	subscription1: any;
	subscription2: any;
	editText: any = false;
	boundStatement: any = '';
	paraClickCheck = false;
	user_id: any = '';
	data: any = [];
	savedSelection: any;
	constructor(
		public changeDetector: ChangeDetectorRef,
		public layoutService: LayoutService,
		public editorService: AngularEditorService,
		protected requestService: RequestService,
		private storageData: StorageData,
		public subject: SubjectService,
		public sanitizer: DomSanitizer,
		private toastrService: ToastrService,
		@Inject(DOCUMENT) private doc: any,
	) {}
	ngOnInit() {
		this.subscription1 = this.subject.inputRefresh.subscribe((res) => {
			if (res.length != 0) {
				if (this.object.uicomponent_name == res.uicomponent_name) {
					this.changeDetector.markForCheck();
					this.subject.objectRefreshItem('');
				}
			}
		});
		this.subscription2 = this.subject.addAnswerObservable.subscribe((res) => {
			if (res.length != 0) {
				if (this.object.uicomponent_name == res.uicomponent_name) {
					this.object.instanceStatement = this.object.statement;
					this.boundStatement = this.object.statement;
					this.addAnswer(res.target);
					this.subject.addAnswerChange('');
				}
			}
		});

		this.searchCaseType = new FormGroup({
			date_input: new FormControl(''),
		});
		if (!this.object.defaultChecked) {
			if (this.object.defaultValue.length) {
				this.addAnswer({ target: { value: this.object.defaultValue } });
				this.object.defaultChecked = true;
			}
		}
		
		if (!this.object.instanceStatement || this.object.instanceStatement.length == 0) {
			this.object.instanceStatement = this.object.statement;
		}
		this.user_id = this.storageData.getUserId();
		this.boundStatement = this.object.statement;
		if (this.layoutService.editorView && this.object.preDefind) {
			const scheduler = this.storageData.getSchedulerInfo();
			let templateObj = scheduler.template_instance;
			if (this.layoutService.isInstancePreview) {
				templateObj = this.layoutService.templateObj;
			}
			if (!templateObj) {
				templateObj = {};
			}
			this.object.preDefinedObj['value'] = 'N/A';

			if (
				(this.object.preDefinedObj.slug == 'next_appt' ||
					this.object.preDefinedObj.slug == 'last_apt') &&
				!this.layoutService.isInstancePreview &&
				!this.layoutService.isShowEditor
			) {
				this.requestService
					.sendRequest(
						TemaplateManagerUrlsEnum.getNextAndLastAppointmentAgainstCase,
						'POST',
						REQUEST_SERVERS.schedulerApiUrl1,
						{ case_ids: [templateObj.case_id] },
					)
					.subscribe((response: HttpSuccessResponse) => {
						this.object.preDefinedObj['value'] = 'N/A';
						if (response.result.data[0]) {
							if (
								this.object.preDefinedObj.slug == 'next_appt' &&
								response.result.data[0].nextScheduledAppointment != null
							) {
								this.object.preDefinedObj['value'] = convertDateTimeForRetrieving(
									this.storageData,
									new Date(response.result.data[0].nextScheduledAppointment.startDateTime),
								);
							} else {
								this.object.preDefinedObj['value'] = convertDateTimeForRetrieving(
									this.storageData,
									new Date(response.result.data[0].lastDoneAppointment.startDateTime),
								);
							}
						}
						if (typeof this.object.preDefinedObj.value != 'string') {
							this.object.preDefinedObj.value = this.object.preDefinedObj.value.toString();
						}
						this.object.statement = '<b>' + this.object.preDefinedObj.title + '</b>: ';
						this.object.input = this.object.preDefinedObj.value;
						this.addAnswer({ target: { value: this.object.preDefinedObj['value'] } });
						this.changeDetector.detectChanges();
					});
			} else if(this.object.preDefinedObj.slug== 'chart_id') {
				this.object.preDefinedObj['value'] = templateObj[this.object.preDefinedObj.slug+'_formatted']
			} else if (this.object.preDefinedObj.slug == 'gender') {
				this.object.preDefinedObj['value'] = templateObj[this.object.preDefinedObj.slug].charAt(0).toUpperCase() + templateObj[this.object.preDefinedObj.slug].slice(1)
			} else if (templateObj[this.object.preDefinedObj.slug]) {
				this.object.preDefinedObj['value'] = templateObj[this.object.preDefinedObj.slug];
			} else {
				this.object.preDefinedObj['value'] = 'N/A';
			}
			if (
				this.object.preDefinedObj.slug == 'npino' &&
				!this.layoutService.isInstancePreview &&
				!this.layoutService.isShowEditor
			) {
				this.requestService
					.sendRequest(
						TemaplateManagerUrlsEnum.getNpinoAgainstUser + this.user_id,
						'GET',
						REQUEST_SERVERS.fd_api_url,
					)
					.subscribe((response: HttpSuccessResponse) => {
						if (response.result && response.result.data && response.result.data.npi) {
							this.object.preDefinedObj['value'] = response.result.data.npi;
							if (typeof this.object.preDefinedObj.value != 'string') {
								this.object.preDefinedObj.value = this.object.preDefinedObj.value.toString();
							}
							this.object.statement = '<b>' + this.object.preDefinedObj.title + '</b>: ';
							this.object.input = this.object.preDefinedObj.value;
							this.addAnswer({ target: { value: this.object.preDefinedObj['value'] } });
						}
						this.changeDetector.detectChanges();
					});
			}
			else if (
				this.object.preDefinedObj.slug == 'dos_date_of_service' &&
				!this.layoutService.isInstancePreview &&
				!this.layoutService.isShowEditor
			) {
				this.requestService
					.sendRequest(
						TemaplateManagerUrlsEnum.getVisitTypesRoute +
							templateObj.case_id +
							'&appointment_id=' +
							templateObj.id,
						'GET',
						REQUEST_SERVERS.fd_api_url,
					)
					.subscribe((response: HttpSuccessResponse) => {
							if (response.result && response.result.data) {
								var date:any = moment(response.result.data.visit_date, 'YYYY-MM-DD').format('MM-DD-YYYY')
								this.object.preDefinedObj['value'] = date;
									if (typeof this.object.preDefinedObj.value != 'string') {
										this.object.preDefinedObj.value = this.object.preDefinedObj.value.toString();
									}
									this.object.statement = '<b>' + this.object.preDefinedObj.title + '</b>: ';
									this.object.input = this.object.preDefinedObj.value;
									this.addAnswer({ target: { value: this.object.preDefinedObj['value'] } });
							} 
						});
			}
			if (typeof this.object.preDefinedObj.value != 'string') {
				this.object.preDefinedObj.value = this.object.preDefinedObj.value.toString();
			}
			this.object.statement = '<b>' + this.object.preDefinedObj.title + '</b>: ';
			this.object.input = this.object.preDefinedObj.value;
			this.addAnswer({ target: { value: this.object.preDefinedObj['value'] } });
		}
		this.changeDetector.detectChanges();
		this.subject.instanceRefreshCheck('tick');
	}
	statementUpdate() {
		this.object.instanceStatement = this.object.statement;
		this.layoutService.updateComponents();
	}
	ngOnDestroy() {
		this.subscription1.unsubscribe();
		this.subscription2.unsubscribe();
	}
	textClick() {
		let textArea = document.getElementById('inputText' + this.object.uicomponent_name);
		this.boundStatement = textArea.innerText;
		this.editText = true;
		this.paraClickCheck = true;
	}
	textClickInput() {
		let textArea = document.getElementById('inputTextt' + this.object.uicomponent_name);
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
	onBlur(event) {
		if (event.target.valueAsNumber && this.object.decimalPlacesLimit != '') {
			let result = '';
			let decimal = event.target.value.split('.');
			let limit = parseInt(this.object.decimalPlacesLimit);
			for (let i = 0; i < limit; i++) {
				if (i + 1 == limit) {
					if (decimal[1][i + 1] >= 5 && this.object.decimalRoundOff) {
						result = result.concat((parseInt(decimal[1][i]) + 1).toString());
					} else {
						result = result.concat(decimal[1][i]);
					}
				} else {
					result = result.concat(decimal[1][i]);
				}
			}
			result = decimal[0] + '.' + result;
			this.object.input = this.object.input.replace(event.target.value, result.toString());
		} else {
			this.object.input = event.target.value;
		}
		for (let i = 0; i < this.layoutService.template.sections.length; i++) {
			for (let j = 0; j < this.layoutService.template.sections[i].dashboard.length; j++) {
				if (this.layoutService.template.sections[i].dashboard[j].obj.type == UI_COMPONENT_TYPES.CALCULATION) {
					this.calculateResult(i, j);
				}
			}
		}
		this.changeDetector.detectChanges();
	}

	calculateResult(i, j) {
		let result = '0';

		this.layoutService.updateComponents();
		let temp = this.layoutService.template.sections[i].dashboard[j].obj.calculation;
		temp = temp.replace(/\&nbsp;/g, '');
		temp = temp.replace(/ /g, '');
		temp = temp.split(/(\+|\-|\*|\/|\)|\(| |&nbsp;)/g);
		temp = temp.filter((n) => n.trim());
		let check = this.validateExpression(temp);
		if (check) {
			let output = this.infixToPostfix(temp.join(''));
			let outputArray = output.split(' ');
			let operandsStack = [];
			outputArray = outputArray.filter((n) => n.trim());
			for (let item of outputArray) {
				if (item.match(/@[0-9]+/g)) {
					let arr = item.match(/@[0-9]+/g);
					for (let x = 0; arr && x < arr.length; x++) {
						if (arr[x][0] == '@') {
							arr[x] = arr[x].replace('@', '');
							item = '0';
							for (
								let checkIndex = 0;
								checkIndex < this.layoutService.template.sections.length;
								checkIndex++
							) {
								for (
									let k = 0;
									k < this.layoutService.template.sections[checkIndex].dashboard.length;
									k++
								) {
									if (
										arr[x] ==
											this.layoutService.template.sections[checkIndex].dashboard[k].obj
												.uicomponent_name &&
										(this.layoutService.template.sections[checkIndex].linked_component == 0 ||
											this.layoutService.template.sections[checkIndex].selected_linked_component ===
												this.layoutService.template.sections[checkIndex].linked_component)
									) {
										item = this.layoutService.template.sections[checkIndex].dashboard[k].obj.input;
									}
								}
							}
						}
					}
				}
				if (isNaN(parseFloat(item))) {
					let op1 = operandsStack.pop();
					let op2 = operandsStack.pop();
					switch (item) {
						case '+':
							operandsStack.push(op2 + op1);
							break;
						case '-':
							operandsStack.push(op2 - op1);
							break;
						case '*':
							operandsStack.push(op2 * op1);
							break;
						case '/':
							operandsStack.push(op2 / op1);
							break;
						default:
							break;
					}
				} else {
					operandsStack.push(parseFloat(item));
				}
			}
			result = operandsStack.pop();
			this.layoutService.template.sections[i].dashboard[j].obj.invalidCheck = false;
			this.layoutService.template.sections[i].dashboard[j].obj.answers[0] = { answer: result };
			return parseFloat(result);
		} else {
			this.layoutService.template.sections[i].dashboard[j].obj.invalidCheck = true;
			this.layoutService.template.sections[i].dashboard[j].obj.answers[0] = { answer: 0 };
			return 0;
		}
	}

	isNumeric(token) {
		return !isNaN(parseFloat(token)) && isFinite(token);
	}

	isValidMinMax(){
		if((this.object && this.object.validationValue &&
			this.object.validationValue.value == 'Number' && this.object.input!='' && this.object.input!=null &&
				(parseFloat(this.object.input) < parseFloat(this.object.minLimit) ||
				parseFloat(this.object.input) > parseFloat(this.object.maxLimit))
		)){
			return true
		}
		return false
	}

	clean(token) {
		for (var i = 0; i < token.length; i++) {
			if (token[i] === '') {
				token.splice(i, 1);
			}
		}
		return token;
	}
	infixToPostfix(infix) {
		var outputQueue = '';
		var operatorStack = [];
		var operators = {
			'^': {
				precedence: 4,
				associativity: 'Right',
			},
			'/': {
				precedence: 3,
				associativity: 'Left',
			},
			'*': {
				precedence: 3,
				associativity: 'Left',
			},
			'+': {
				precedence: 2,
				associativity: 'Left',
			},
			'-': {
				precedence: 2,
				associativity: 'Left',
			},
		};
		infix = infix.replace(/\s+/g, '');
		infix = infix.split(/([\+\-\*\/\^\(\)])/);
		infix = this.clean(infix);
		for (var i = 0; i < infix.length; i++) {
			var token = infix[i];
			if (this.isNumeric(token) || token.match(/@[0-9]+/g)) {
				outputQueue += token + ' ';
			} else if ('^*/+-'.indexOf(token) !== -1) {
				var o1 = token;
				var o2 = operatorStack[operatorStack.length - 1];
				while (
					'^*/+-'.indexOf(o2) !== -1 &&
					((operators[o1].associativity === 'Left' &&
						operators[o1].precedence <= operators[o2].precedence) ||
						(operators[o1].associativity === 'Right' &&
							operators[o1].precedence < operators[o2].precedence))
				) {
					outputQueue += operatorStack.pop() + ' ';
					o2 = operatorStack[operatorStack.length - 1];
				}
				operatorStack.push(o1);
			} else if (token === '(') {
				operatorStack.push(token);
			} else if (token === ')') {
				while (operatorStack[operatorStack.length - 1] !== '(') {
					outputQueue += operatorStack.pop() + ' ';
				}
				operatorStack.pop();
			}
		}
		while (operatorStack.length > 0) {
			outputQueue += operatorStack.pop() + ' ';
		}
		return outputQueue;
	}
	validateExpression(exp) {
		let operatorCheck = true;
		let bracketsOpen = 0;
		let openingBracketCheck = false;
		let closingBracketCheck = false;
		for (let item of exp) {
			switch (item) {
				case '+':
					if (operatorCheck) {
						return false;
					}
					operatorCheck = true;
					break;
				case '-':
					if (operatorCheck) {
						return false;
					}
					operatorCheck = true;
					break;
				case '*':
					if (operatorCheck) {
						return false;
					}
					operatorCheck = true;
					break;
				case '/':
					if (operatorCheck) {
						return false;
					}
					operatorCheck = true;
					break;
				case ')':
					if (bracketsOpen == 0 || operatorCheck) {
						return false;
					}
					bracketsOpen--;
					break;
				case '(':
					if (!operatorCheck) {
						return false;
					}
					bracketsOpen++;

					break;
				default:
					if (isNaN(parseFloat(item)) || !operatorCheck) {
						if (item.match(/@[0-9]+/g)) {
							return true;
						} else {
							return false;
						}
					}
					operatorCheck = false;
					break;
			}
		}
		if (bracketsOpen || operatorCheck) {
			return false;
		}
		return true;
	}

	isFilled() {
		if ((!(!this.layoutService.editorView && !this.layoutService.isShowEditor) &&
			this.object.is_required && 
			(
				(this.object.answers && this.object.answers.length 
				&& this.object.answers[0].answer == '') ||
				this.object.answers.length == 0
			) ) &&
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

	async addAnswer(e) {
		let target;
		if (e.target && e.target.value) {
			target = e.target.value;
		} else {
			target = e.target.innerHTML;
		}
		if (target == null || target == undefined || target === '<br>') {
			target = '';
		}
		this.object.input = target;
		if (this.object.validationValue.type == 'email') {
			const elem: any = document.getElementById('textAreaBottom' + this.object.uicomponent_name);
			if (elem.parentNode && elem.parentNode.className != 'eac-input-wrap') {
				emailautocomplete(elem, {
					domains: ['ovada.com'],
					suggClass: 'eac-suggestion',
				});
			}
		}
		for (let i = 0; i < this.layoutService.template.sections.length; i++) {
			for (let j = 0; j < this.layoutService.template.sections[i].dashboard.length; j++) {
				if (
					this.layoutService.template.sections[i].dashboard[j].obj.type == UI_COMPONENT_TYPES.INPUT &&
					this.layoutService.template.sections[i].dashboard[j].obj.uicomponent_name ===
						this.object.uicomponent_name
				) {
					if (this.layoutService.template.sections[i].dashboard[j].obj.linkedStatementCheck) {
						this.layoutService.template.sections[i].dashboard[j].obj.answers = [];
						let tempAnswer =
							this.layoutService.template.sections[i].dashboard[j].obj.linkedStatement;
						tempAnswer = tempAnswer.replaceAll('#input', target);
						if (!target.length) {
							tempAnswer = '';
						}
						this.layoutService.template.sections[i].dashboard[j].obj.answers.push({
							answer: tempAnswer,
						});
						break;
					}

					this.layoutService.template.sections[i].dashboard[j].obj.answers = [];
					if (target != '') {
						if (this.layoutService.template.sections[i].dashboard[j].obj.linkedStatementCheck) {
							let tempAnswer =
								this.layoutService.template.sections[i].dashboard[j].obj.linkedStatement;
							tempAnswer = tempAnswer.replaceAll('#input', target);
							this.layoutService.template.sections[i].dashboard[j].obj.answers.push({
								answer: tempAnswer,
							});
						} else {
							this.layoutService.template.sections[i].dashboard[j].obj.answers.push({
								answer: target,
							});
						}
					}
					break;
				}
			}
		}
		this.layoutService.updateComponents();
		this.subject.instanceRefreshCheck('tick');
	}

	clearFunc() {
		this.object.input = '';
		this.object.answers = [];
		this.layoutService.updateComponents();
	}
}
