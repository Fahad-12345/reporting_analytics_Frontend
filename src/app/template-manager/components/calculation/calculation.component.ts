import {
	Component,
	ViewEncapsulation,
	OnInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SubjectService } from '../../services/subject.service';
import { LayoutService } from '@appDir/template-manager/services/layout.service';

@Component({
	selector: 'app-calculation',
	templateUrl: './calculation.component.html',
	styleUrls: ['./calculation.component.css'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculationComponent implements OnInit {
	object: any = {};
	subscription: any;
	item: any = {};
	editText: any = false;
	boundStatement: any = '';
	constructor(
		public changeDetector: ChangeDetectorRef,
		public layoutService: LayoutService,
		public sanitizer: DomSanitizer,
		public subject: SubjectService,
	) {}
	public uiComponents: any = [];
	paraClickCheck = false;
	ngOnInit() {
		this.subscription = this.subject.calculationRefresh.subscribe((res) => {
			if (res.length != 0) {
				if (this.object.uicomponent_name == res.uicomponent_name) {
					this.changeDetector.markForCheck();
					this.subject.objectRefreshItem('');
				}
			}
		});
		this.boundStatement = this.object.statement;
		if (!this.object.instanceStatement || this.object.instanceStatement.length == 0) {
			this.object.instanceStatement = this.object.statement;
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
	formControlValue = '';
	isNumeric(token) {
		return !isNaN(parseFloat(token)) && isFinite(token);
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
	calculateResult(event?) {
		let result = '0';
		this.layoutService.updateComponents();
		let temp = event.target.innerHTML;
		temp = temp.replace(/\&nbsp;/g, '');
		temp = temp.replace(/ /g, '');
		temp = temp.split(/(\+|\-|\*|\/|\)|\(| |&nbsp;)/g);
		temp = temp.filter((n) => n.trim());
		let check = this.validateExpression(temp);
		if (check.length) {
			let output = this.infixToPostfix(check.join(''));
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
							if (op2) {
								operandsStack.push(op2 + op1);
							} else {
								operandsStack.push(op1);
							}
							break;
						case '-':
							if (op2) {
								operandsStack.push(op2 - op1);
							} else {
								operandsStack.push(0 - op1);
							}
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
			this.object.invalidCheck = false;
			this.object.answers = [];
			if (this.object.linkedStatementCheck) {
				let tempAnswer = this.object.linkedStatement;
				tempAnswer = tempAnswer.replaceAll('#input', result);

				this.object.answers.push({ answer: tempAnswer });
			} else {
				let stringValue = JSON.stringify(result);

				this.object.answers.push({ answer: result });
			}
			this.layoutService.updateComponents();
			return parseFloat(result);
		} else {
			if (temp != '') {
				this.object.invalidCheck = true;
			}
			result = '0';
			if (this.object.linkedStatementCheck) {
				let tempAnswer = this.object.linkedStatement;
				tempAnswer = tempAnswer.replaceAll('#input', result);
				this.object.answers.push({ answer: tempAnswer });
			} else {
				this.object.answers.push({ answer: result });
			}
			this.layoutService.updateComponents();

			return 0;
		}
	}
	validateExpression(exp) {
		let doubleCheck = false;
		let lastItem = '(';
		let operatorCheck = true;
		let bracketsOpen = 0;
		let openingBracketCheck = false;
		let closingBracketCheck = false;

		let tempExp = [];
		
		let index = -1;
		for (let item of exp) {
			index++;
			switch (item) {
				case '+':
					if (lastItem == '(') {
						tempExp.push('0');
					}
					if (operatorCheck && doubleCheck) {
						return [];
					}
					if (lastItem == '+' || lastItem == '-' || lastItem == '*' || lastItem == '/') {
						doubleCheck = true;
					}
					operatorCheck = true;
					break;
				case '-':
					if (lastItem == '(') {
						tempExp.push('0');
					}
					if (operatorCheck && doubleCheck) {
						return [];
					}
					if (lastItem == '+' || lastItem == '-' || lastItem == '*' || lastItem == '/') {
						doubleCheck = true;
					}
					operatorCheck = true;
					break;
				case '*':
					if (lastItem == '+' || lastItem == '-' || lastItem == '*' || lastItem == '/') {
						doubleCheck = true;
					}
					if (operatorCheck) {
						return [];
					}
					operatorCheck = true;
					break;
				case '/':
					if (lastItem == '+' || lastItem == '-' || lastItem == '*' || lastItem == '/') {
						doubleCheck = true;
					}
					if (operatorCheck) {
						return [];
					}
					operatorCheck = true;
					break;
				case ')':
					doubleCheck = false;
					if (bracketsOpen == 0 || operatorCheck) {
					}
					bracketsOpen--;
					break;
				case '(':
					doubleCheck = false;
					if (!operatorCheck) {
						return [];
					}
					bracketsOpen++;

					break;
				default:
					doubleCheck = false;

					if (isNaN(parseFloat(item)) || item != parseFloat(item).toString() || !operatorCheck) {
						if (item.match(/@[0-9]+/g)) {
							break;
						} else {
							return [];
						}
					}
					operatorCheck = false;
					break;
			}
			lastItem = item;
			tempExp.push(item);
		}
		if (bracketsOpen || operatorCheck) {
			return [];
		}
		return tempExp;
	}
	clearFunc() {
		this.object.answers[0].answer = 0;
		this.layoutService.updateComponents();
	}
}
