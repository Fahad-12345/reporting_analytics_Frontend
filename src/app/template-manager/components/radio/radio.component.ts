import {
	Component,
	ViewEncapsulation,
	OnInit,
	ViewChild,
	ChangeDetectorRef,
	ChangeDetectionStrategy,
} from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import { SubjectService } from '../../services/subject.service';
import { DomSanitizer } from '@angular/platform-browser';
import emailautocomplete from 'js-email-autocomplete';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import * as moment from 'moment';
@Component({
	selector: 'app-radio',
	templateUrl: './radio.component.html',
	styleUrls: ['./radio.component.css'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioComponent implements OnInit {
	object: any = {};
	editText: any = false;
	boundStatement: any = '';
	subscriptions: any[] = [];
	subscription2: any;
	subscription1: any;
	paraClickCheck = false;
	constructor(
		public changeDetector: ChangeDetectorRef,
		public layoutService: LayoutService,
		public subject: SubjectService,
		public sanitizer: DomSanitizer,
	) {}
	@ViewChild('autosize') autosize: CdkTextareaAutosize;
	ngOnInit() {
		this.subscription1 = this.subject.radioRefresh.subscribe((res) => {
			if (res.length != 0) {
				if (this.object.uicomponent_name == res.uicomponent_name) {
					this.changeDetector.markForCheck();
					this.subject.objectRefreshItem('');
				}
			}
		});
		this.subscription2 = this.subject.refreshDefaultValue.subscribe((res) => {
			if (res && res.hasOwnProperty('index')) {
				if (this.object.uicomponent_name == res.uicomponent_name) {
					this.object.defaultChecked = true;
					this.optionSelect(this.object.options, res.index, false);
				}
				this.subject.selectByDefaultChange('');
			}
		});
		this.subscriptions.push(this.subscription1);
		this.subscriptions.push(this.subscription2);
		if (!this.object.instanceStatement || this.object.instanceStatement.length == 0) {
			this.object.instanceStatement = this.object.statement;
		}
		if (!this.object.defaultChecked) {
			for (let i = 0; i < this.object.options.length; i++) {
				if (
					!this.object.options[i].instanceLabel ||
					this.object.options[i].instanceLabel.length == 0
				) {
					this.object.options[i].instanceLabel = this.object.options[i].label;
				}
				if (this.object.options[i].defaultValue) {
					this.optionSelect(this.object.options, i, false);
					this.object.defaultChecked = true;
				}
			}
		}
	}
	statementUpdate() {
		this.object.instanceStatement = this.object.statement;
		this.layoutService.updateComponents();
	}
	ngOnDestroy() {
		this.subscriptions.forEach((subscription) => subscription.unsubscribe());
	}
	onBlur(event, index) {
		if (event.target.valueAsNumber && this.object.options[index].decimalPlacesLimit != '') {
			let result = '';
			let decimal = event.target.value.split('.');
			let limit = parseInt(this.object.options[index].decimalPlacesLimit);
			for (let i = 0; i < limit; i++) {
				if (i + 1 == limit) {
					if (decimal[1][i + 1] >= 5 && this.object.options[index].decimalRoundOff) {
						result = result.concat((parseInt(decimal[1][i]) + 1).toString());
					} else {
						result = result.concat(decimal[1][i]);
					}
				} else {
					result = result.concat(decimal[1][i]);
				}
			}
			result = decimal[0] + '.' + result;
			this.object.options[index].instanceInputValue = this.object.options[
				index
			].instanceInputValue.replace(event.target.value, result.toString());
		} else {
			this.object.options[index].inputVaue = event.target.value;
		}
		this.changeDetector.detectChanges();
	}
	editStatement() {
		this.editText = false;
		this.boundStatement = this.object.statement;
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

	public optionSelect(options, index, event) {
		for (let i = 0; i < this.object.options.length; i++) {
			if (this.object.options[i].validationValue.type == 'email') {
				const elem: any = document.getElementById(
					'commentsField' + this.object.uicomponent_name + i.toString(),
				);
				if (elem.parentNode && elem.parentNode.className != 'eac-input-wrap') {
					emailautocomplete(elem, {
						domains: ['ovada.com'],
						suggClass: 'eac-suggestion',
					});
				}
			}
		}
		if (event) {
			event.stopPropagation();
		}
		if (!this.layoutService.isShowEditor) {
			this.layoutService.scroll = 'scroll';
		}
		let sectionToHide = -1;
		let newSectionsToHide = [];
		let newUiToHide = [];
		let uiToHide = -1;
		let sectionToShow = -1;
		let uiToShow = -1;
		let linkedSectionCheck = false;
		let linkedSectionsShow = [];
		let linkedSectionsHide = [];
		let sameValueClick = false;
		for (let i = 0; i < options.length; i++) {
			if (i == index) {
				if (options[i].selected) {
					options[i].selected = false;
					if (options[i].selectedLinkSection) {
						sectionToHide = options[i].selectedLinkSection.id;
					}
					if (options[i].selectedLinkUi) {
						uiToHide = options[i].selectedLinkUi.id;
					}
				} else {
					options[i].selected = true;
					if (options[i].selectedLinkSection) {
						sectionToShow = options[i].selectedLinkSection.id;
					}
					if (options[i].selectedLinkUi) {
						uiToShow = options[i].selectedLinkUi.id;
					}
				}
			} else {
				if (options[i].selected != false) {
					options[i].selected = false;
					if (options[i].selectedLinkSection) {
						sectionToHide = options[i].selectedLinkSection.id;
					}
					if (options[i].selectedLinkUi) {
						uiToHide = options[i].selectedLinkUi.id;
					}
				}
			}
		}

		for (let i = 0; i < this.layoutService.template.sections.length; i++) {
			if (this.layoutService.template.sections[i].id == sectionToShow) {
				this.layoutService.template.sections[i].selected_linked_component++;
				if (
					this.layoutService.template.sections[i].selected_linked_component ===
					this.layoutService.template.sections[i].linked_component
				) {
					linkedSectionsShow.push(this.layoutService.template.sections[i]);
					this.layoutService.collapseSectionIndex[this.layoutService.template.sections[i].id] =
						false;
					linkedSectionCheck = true;
				}
				let currentDepth = this.layoutService.template.sections[i].secNo.split('.').length - 1;
				for (let j = i + 1; j < this.layoutService.template.sections.length; j++) {
					let tempDepth = this.layoutService.template.sections[j].secNo.split('.').length - 1;
					if (tempDepth > currentDepth) {
						this.layoutService.template.sections[j].selected_linked_component++;
					} else {
						i = j;
						i = j - 1;
						break;
					}
				}
			}
			if (this.layoutService.template.sections[i].id == sectionToHide) {
				let tempCheck = false;
				if (
					this.layoutService.template.sections[i].selected_linked_component ===
					this.layoutService.template.sections[i].linked_component
				) {
					tempCheck = true;
				}
				this.layoutService.template.sections[i].selected_linked_component--;
				if (
					this.layoutService.template.sections[i].selected_linked_component !=
						this.layoutService.template.sections[i].linked_component &&
					tempCheck
				) {
					linkedSectionsHide.push(this.layoutService.template.sections[i]);
					linkedSectionCheck = true;
				}
				let currentDepth = this.layoutService.template.sections[i].secNo.split('.').length - 1;
				for (let j = i + 1; j < this.layoutService.template.sections.length; j++) {
					let tempDepth = this.layoutService.template.sections[j].secNo.split('.').length - 1;
					if (tempDepth > currentDepth) {
						this.layoutService.template.sections[j].selected_linked_component--;
					} else {
						i = j - 1;
						break;
					}
				}
			}
			for (let j = 0; j < this.layoutService.template.sections[i].dashboard.length; j++) {
				if (this.layoutService.template.sections[i].dashboard[j].obj.uicomponent_name == uiToShow) {
					this.layoutService.template.sections[i].dashboard[j].obj.selected_linked_ui_component++;
					this.layoutService.refreshObject(
						this.layoutService.template.sections[i].dashboard[j].obj,
					);
				}
				if (
					this.layoutService.template.sections[i].dashboard[j].obj.uicomponent_name &&
					this.layoutService.template.sections[i].dashboard[j].obj.uicomponent_name == uiToHide
				) {
					this.layoutService.template.sections[i].dashboard[j].obj.selected_linked_ui_component--;
					this.layoutService.refreshObject(
						this.layoutService.template.sections[i].dashboard[j].obj,
					);

					if (!this.layoutService.template.sections[i].dashboard[j].obj.is_single_select) {
						if (this.layoutService.template.sections[i].dashboard[j].obj.options) {
							for (let eachOption of this.layoutService.template.sections[i].dashboard[j].obj
								.options) {
								if (eachOption.selected == true) {
									if (eachOption.selectedLinkSection && eachOption.selectedLinkSection.id) {
										newSectionsToHide.push(eachOption.selectedLinkSection.id);
									}
									if (eachOption.selectedLinkUi && eachOption.selectedLinkUi.id) {
										newUiToHide.push(eachOption.selectedLinkUi.id);
									}
									eachOption.selected = false;
								}
							}
						}
						this.layoutService.template.sections[i].dashboard[j].obj.answers = [];
						if ('selectedItems' in this.layoutService.template.sections[i].dashboard[j].obj) {
							this.layoutService.template.sections[i].dashboard[j].obj.selectedItems = [];
						}
						if ('defaultChecked' in this.layoutService.template.sections[i].dashboard[j].obj) {
							this.layoutService.template.sections[i].dashboard[j].obj.defaultChecked = false;
						}
						this.layoutService.template.sections[i].dashboard[j].obj.input = '';
					} else if (
						this.layoutService.template.sections[i].dashboard[j].obj.selected_linked_ui_component ==
						0
					) {
						if (this.layoutService.template.sections[i].dashboard[j].obj.options) {
							for (let eachOption of this.layoutService.template.sections[i].dashboard[j].obj
								.options) {
								if (eachOption.selected == true) {
									if (eachOption.selectedLinkSection && eachOption.selectedLinkSection.id) {
										newSectionsToHide.push(eachOption.selectedLinkSection.id);
									}
									if (eachOption.selectedLinkUi && eachOption.selectedLinkUi.id) {
										newUiToHide.push(eachOption.selectedLinkUi.id);
									}
									eachOption.selected = false;
								}
							}
						}
						this.layoutService.template.sections[i].dashboard[j].obj.answers = [];
						if ('selectedItems' in this.layoutService.template.sections[i].dashboard[j].obj) {
							this.layoutService.template.sections[i].dashboard[j].obj.selectedItems = [];
						}
						if ('defaultChecked' in this.layoutService.template.sections[i].dashboard[j].obj) {
							this.layoutService.template.sections[i].dashboard[j].obj.defaultChecked = false;
						}
						this.layoutService.template.sections[i].dashboard[j].obj.input = '';
					}
				}
			}
		}
		for (let newHideSection of newSectionsToHide) {
			for (let i = 0; i < this.layoutService.template.sections.length; i++) {
				if (this.layoutService.template.sections[i].id == newHideSection) {
					let tempCheck = false;
					if (
						this.layoutService.template.sections[i].selected_linked_component ===
						this.layoutService.template.sections[i].linked_component
					) {
						tempCheck = true;
					}
					this.layoutService.template.sections[i].selected_linked_component--;
					if (
						this.layoutService.template.sections[i].selected_linked_component !=
							this.layoutService.template.sections[i].linked_component &&
						tempCheck
					) {
						linkedSectionsHide.push(this.layoutService.template.sections[i]);
						linkedSectionCheck = true;
					}
					let currentDepth = this.layoutService.template.sections[i].secNo.split('.').length - 1;
					for (let j = i + 1; j < this.layoutService.template.sections.length; j++) {
						let tempDepth = this.layoutService.template.sections[j].secNo.split('.').length - 1;
						if (tempDepth > currentDepth) {
							this.layoutService.template.sections[j].selected_linked_component--;
						} else {
							i = j - 1;
							break;
						}
					}
				}
			}
		}
		newSectionsToHide = [];
		this.layoutService.recursiveLinkedUi(newUiToHide);
		this.object.answers = [];
		for (let newIndex = 0; newIndex < this.object.options.length; newIndex++) {
			if (this.object.options[newIndex].selected) {
				if (
					!this.object.options[newIndex].showOption &&
					!this.object.options[newIndex].linkedStatementCheck &&
					this.object.options[newIndex].input
				) {
					this.object.answers.push({ answer: this.object.options[newIndex].instanceInputValue });
				} else if (this.object.options[newIndex].linkedStatementCheck) {
					let tempAnswer = this.object.options[newIndex].linkedStatement;
					tempAnswer = this.layoutService.checkSingularPlural(this.object, newIndex, tempAnswer);
					tempAnswer = tempAnswer.replaceAll('#input', this.object.options[newIndex].label);
					tempAnswer = tempAnswer.replaceAll(
						'#comments',
						this.object.options[newIndex].instanceInputValue,
					);
					this.object.answers.push({ answer: tempAnswer, id: this.object.options[newIndex].id });
				} else {
					this.object.answers.push({
						answer:
							this.object.options[newIndex].label +
							' ' +
							this.object.options[newIndex].instanceInputValue,
					});
				}
			}
		}

		this.layoutService.refreshObject(this.object);
		this.layoutService.updateComponents();

		if (linkedSectionCheck) {
			if (this.layoutService.editorView) {
				this.subject.instanceRefreshCheck(['saad', linkedSectionsShow, true]);
				this.subject.instanceRefreshCheck(['saad', linkedSectionsHide, false]);
			}
		} else if (this.layoutService.editorView) {
			this.subject.instanceRefreshCheck('tick');
		}
	}

	isFilled() {
		if ((!(!this.layoutService.editorView && !this.layoutService.isShowEditor) &&
		this.object && this.object.is_required && this.object.answers && this.object.answers.length == 0)
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

	public addComments(e, index) {
		let objId = '';
		let target;
		if (e.target && e.target.value) {
			target = e.target.value;
		} else {
			target = e.target.innerHTML;
		}
		this.object.options[index].inputValue = target;
		if (
			this.object.options[index].validationValue.value == 'Datetime' ||
			this.object.options[index].validationValue.value == 'Date'
		) {
			target = moment.utc(target).format(this.object.options[index].formatValue['slug']);
		}
		this.object.options[index].instanceInputValue = target;

		this.object.answers = [];
		if (this.object.options[index].selected) {
			if (
				!this.object.options[index].showOption &&
				!this.object.options[index].linkedStatementCheck &&
				this.object.options[index].input
			) {
				this.object.answers.push({ answer: this.object.options[index].instanceInputValue });
			} else if (this.object.options[index].linkedStatementCheck) {
				let tempAnswer = this.object.options[index].linkedStatement;
				tempAnswer = this.layoutService.checkSingularPlural(this.object, index, tempAnswer);
				tempAnswer = tempAnswer.replaceAll('#input', this.object.options[index].label);
				tempAnswer = tempAnswer.replaceAll(
					'#comments',
					this.object.options[index].instanceInputValue,
				);
				this.object.answers.push({ answer: tempAnswer, id: this.object.options[index].id });
			} else {
				this.object.answers.push({
					answer:
						this.object.options[index].label + ' ' + this.object.options[index].instanceInputValue,
				});
			}
		}
		this.layoutService.updateComponents();
		}
	clearFunc() {
		let sectionToHide = -1;
		let uiToHide = -1;
		let linkedSectionCheck = false;

		let newSectionsToHide = [];
		let newUiToHide = [];
		let linkedSectionsHide = [];
		this.object.options.forEach((element) => {
			if (element.selected == true) {
				if (element.selectedLinkSection) {
					sectionToHide = element.selectedLinkSection.id;
				}
				if (element.selectedLinkUi) {
					uiToHide = element.selectedLinkUi.id;
				}
				for (let i = 0; i < this.layoutService.template.sections.length; i++) {
					if (this.layoutService.template.sections[i].id == sectionToHide) {
						let tempCheck = false;
						if (
							this.layoutService.template.sections[i].selected_linked_component ===
							this.layoutService.template.sections[i].linked_component
						) {
							tempCheck = true;
						}
						this.layoutService.template.sections[i].selected_linked_component--;
						if (
							this.layoutService.template.sections[i].selected_linked_component !=
								this.layoutService.template.sections[i].linked_component &&
							tempCheck
						) {
							linkedSectionsHide.push(this.layoutService.template.sections[i]);
							linkedSectionCheck = true;
						}
						let currentDepth = this.layoutService.template.sections[i].secNo.split('.').length - 1;
						for (let j = i + 1; j < this.layoutService.template.sections.length; j++) {
							let tempDepth = this.layoutService.template.sections[j].secNo.split('.').length - 1;
							if (tempDepth > currentDepth) {
								this.layoutService.template.sections[j].selected_linked_component--;
							} else {
								i = j - 1;
								break;
							}
						}
					}
					for (let j = 0; j < this.layoutService.template.sections[i].dashboard.length; j++) {
						if (
							this.layoutService.template.sections[i].dashboard[j].obj.uicomponent_name &&
							this.layoutService.template.sections[i].dashboard[j].obj.uicomponent_name == uiToHide
						) {
							this.layoutService.template.sections[i].dashboard[j].obj
								.selected_linked_ui_component--;
							this.layoutService.refreshObject(
								this.layoutService.template.sections[i].dashboard[j].obj,
							);

							if (!this.layoutService.template.sections[i].dashboard[j].obj.is_single_select) {
								if (this.layoutService.template.sections[i].dashboard[j].obj.options) {
									for (let eachOption of this.layoutService.template.sections[i].dashboard[j].obj
										.options) {
										if (eachOption.selected == true) {
											if (eachOption.selectedLinkSection && eachOption.selectedLinkSection.id) {
												newSectionsToHide.push(eachOption.selectedLinkSection.id);
											}
											if (eachOption.selectedLinkUi && eachOption.selectedLinkUi.id) {
												newUiToHide.push(eachOption.selectedLinkUi.id);
											}
											eachOption.selected = false;
										}
									}
								}
								this.layoutService.template.sections[i].dashboard[j].obj.answers = [];
								if ('selectedItems' in this.layoutService.template.sections[i].dashboard[j].obj) {
									this.layoutService.template.sections[i].dashboard[j].obj.selectedItems = [];
								}
								if ('defaultChecked' in this.layoutService.template.sections[i].dashboard[j].obj) {
									this.layoutService.template.sections[i].dashboard[j].obj.defaultChecked = false;
								}
								this.layoutService.template.sections[i].dashboard[j].obj.input = '';
							} else if (
								this.layoutService.template.sections[i].dashboard[j].obj
									.selected_linked_ui_component == 0
							) {
								if (this.layoutService.template.sections[i].dashboard[j].obj.options) {
									for (let eachOption of this.layoutService.template.sections[i].dashboard[j].obj
										.options) {
										if (eachOption.selected == true) {
											if (eachOption.selectedLinkSection && eachOption.selectedLinkSection.id) {
												newSectionsToHide.push(eachOption.selectedLinkSection.id);
											}
											if (eachOption.selectedLinkUi && eachOption.selectedLinkUi.id) {
												newUiToHide.push(eachOption.selectedLinkUi.id);
											}
											eachOption.selected = false;
										}
									}
								}
								this.layoutService.template.sections[i].dashboard[j].obj.answers = [];
								if ('selectedItems' in this.layoutService.template.sections[i].dashboard[j].obj) {
									this.layoutService.template.sections[i].dashboard[j].obj.selectedItems = [];
								}
								if ('defaultChecked' in this.layoutService.template.sections[i].dashboard[j].obj) {
									this.layoutService.template.sections[i].dashboard[j].obj.defaultChecked = false;
								}
								this.layoutService.template.sections[i].dashboard[j].obj.input = '';
							}
						}
					}
				}
				for (let newHideSection of newSectionsToHide) {
					for (let i = 0; i < this.layoutService.template.sections.length; i++) {
						if (this.layoutService.template.sections[i].id == newHideSection) {
							let tempCheck = false;
							if (
								this.layoutService.template.sections[i].selected_linked_component ===
								this.layoutService.template.sections[i].linked_component
							) {
								tempCheck = true;
							}
							this.layoutService.template.sections[i].selected_linked_component--;
							if (
								this.layoutService.template.sections[i].selected_linked_component !=
									this.layoutService.template.sections[i].linked_component &&
								tempCheck
							) {
								linkedSectionsHide.push(this.layoutService.template.sections[i]);
								linkedSectionCheck = true;
							}
							let currentDepth =
								this.layoutService.template.sections[i].secNo.split('.').length - 1;
							for (let j = i + 1; j < this.layoutService.template.sections.length; j++) {
								let tempDepth = this.layoutService.template.sections[j].secNo.split('.').length - 1;
								if (tempDepth > currentDepth) {
									this.layoutService.template.sections[j].selected_linked_component--;
								} else {
									i = j - 1;
									break;
								}
							}
						}
					}
				}
				newSectionsToHide = [];
				this.layoutService.recursiveLinkedUi(newUiToHide);

				}
			element.selected = false;
		});
		this.object.answers = [];
		this.layoutService.updateComponents();
		if (linkedSectionCheck) {
			if (this.layoutService.editorView) {
				this.subject.instanceRefreshCheck(['saad', linkedSectionsHide, false]);
			}
		}
	}
	}
