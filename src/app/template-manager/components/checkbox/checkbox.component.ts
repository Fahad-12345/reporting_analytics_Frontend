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
import { cloneDeep } from 'lodash';
import emailautocomplete from 'js-email-autocomplete';
import * as moment from 'moment';
import { UI_COMPONENT_TYPES } from '@appDir/template-manager/common/constants';
import { ExternalComponent } from '@appDir/template-manager/modals/external-module/external.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ConfirmationDialogComponent } from '@appDir/template-manager/modals/confirmation-dialog/confirmation-dialog.component';
@Component({
	selector: 'app-checkbox',
	templateUrl: './checkbox.component.html',
	styleUrls: ['./checkbox.component.css'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxComponent implements OnInit {
	object: any = {};
	editText: any = false;
	subscriptions: any[] = [];
	subscription1: any;
	subscription2: any;
	boundStatement: any = '';
	paraClickCheck = false;
	bsModalRef: BsModalRef;
	constructor(
		public changeDetector: ChangeDetectorRef,
		public layoutService: LayoutService,
		public subject: SubjectService,
		public sanitizer: DomSanitizer,
		private modalService: NgbModal,
		private modalServiceDialog: BsModalService,
	) { }
	ngOnInit() {
		this.subscription1 = this.subject.refreshDefaultValue.subscribe((res) => {
			if (res && res.hasOwnProperty('index')) {
				if (this.object.uicomponent_name == res.uicomponent_name) {
					this.object.defaultChecked = true;
					if (res.check) {
						if (!this.object.options[res.index].selected) {
							this.optionSelect(this.object.options, res.index, false);
						}
					} else {
						if (this.object.options[res.index].selected) {
							this.optionSelect(this.object.options, res.index, false);
						}
					}
				}
				this.subject.selectByDefaultChange('');
			}
		});
		this.subscription2 = this.subject.checkBoxRefresh.subscribe((res) => {
			if (res.length != 0) {
				if (this.object.uicomponent_name == res.uicomponent_name) {
					this.changeDetector.markForCheck();
					this.subject.objectRefreshItem('');
				}
			}
		});
		this.subscriptions.push(this.subscription1);
		this.subscriptions.push(this.subscription2);
		if (!this.object.instanceStatement || this.object.instanceStatement.length == 0) {
			this.object.instanceStatement = this.object.statement;
		}
		this.boundStatement = this.object.statement;
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
			this.object.options[index].inputValue = this.object.options[index].inputValue.replace(
				event.target.value,
				result.toString(),
			);
			this.object.options[index].instanceInputValue = this.object.options[index].inputValue;
		} else {
			this.object.options[index].inputVaue = event.target.value;
		}
		this.changeDetector.detectChanges();
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
	private handleCommentsValue() {
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
		this.handleCommentsValue();
		this.layoutService.updateComponents();
	}
	public updateComponent(options, index, event) {
		let sectionsToHide = [];
		let newSectionsToHide = [];
		let newUiToHide = [];
		let linkedSectionCheck = false;
		let linkedSections = [];
		for (let i = 0; i < this.layoutService.template.sections.length; i++) {
			if (options[index].selectedLinkSection && options[index].selectedLinkSection.id) {
				if (this.layoutService.template.sections[i].id == options[index].selectedLinkSection.id) {
					if (options[index].selected) {
						this.layoutService.template.sections[i].selected_linked_component++;
						if (
							this.layoutService.template.sections[i].selected_linked_component ===
							this.layoutService.template.sections[i].linked_component
						) {
							linkedSections.push(this.layoutService.template.sections[i]);
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
								i = j - 1;
								break;
							}
						}
					} else {
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
							linkedSections.push(this.layoutService.template.sections[i]);
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
			for (let j = 0; j < this.layoutService.template.sections[i].dashboard.length; j++) {
				if (
					options[index].selectedLinkUi &&
					this.layoutService.template.sections[i].dashboard[j].obj.uicomponent_name &&
					this.layoutService.template.sections[i].dashboard[j].obj.uicomponent_name ==
					options[index].selectedLinkUi.id
				) {
					if (!options[index].selected) {
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
					} else {
						this.layoutService.template.sections[i].dashboard[j].obj.selected_linked_ui_component++;
						this.layoutService.refreshObject(
							this.layoutService.template.sections[i].dashboard[j].obj,
						);
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
						linkedSections.push(this.layoutService.template.sections[i]);
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
		let objId = '';
		for (let i = 0; i < this.layoutService.template.sections.length; i++) {
			for (let j = 0; j < this.layoutService.template.sections[i].dashboard.length; j++) {
				if (
					this.layoutService.template.sections[i].dashboard[j].obj.type == UI_COMPONENT_TYPES.CHECKBOX &&
					this.layoutService.template.sections[i].dashboard[j].obj.uicomponent_name ===
					this.object.uicomponent_name
				) {
					objId = this.layoutService.template.sections[i].dashboard[j].id;
					this.layoutService.template.sections[i].dashboard[j].obj.answers = [];
					for (
						let k = 0;
						k < this.layoutService.template.sections[i].dashboard[j].obj.options.length;
						k++
					) {
						if (
							this.layoutService.template.sections[i].dashboard[j].obj.options[k].selected == true
						) {
							if (
								!this.layoutService.template.sections[i].dashboard[j].obj.options[k].showOption &&
								!this.layoutService.template.sections[i].dashboard[j].obj.options[k]
									.linkedStatementCheck &&
								this.layoutService.template.sections[i].dashboard[j].obj.options[k].input
							) {
								this.layoutService.template.sections[i].dashboard[j].obj.answers.push({
									answer:
										this.layoutService.template.sections[i].dashboard[j].obj.options[k]
											.instanceInputValue,
									id: this.layoutService.template.sections[i].dashboard[j].obj.options[k].id,
								});
							} else if (
								this.layoutService.template.sections[i].dashboard[j].obj.options[k]
									.linkedStatementCheck
							) {
								let tempAnswer =
									this.layoutService.template.sections[i].dashboard[j].obj.options[k]
										.linkedStatement;
								tempAnswer = this.layoutService.checkSingularPlural(
									this.layoutService.template.sections[i].dashboard[j].obj,
									k,
									tempAnswer,
								);

								tempAnswer = tempAnswer.replaceAll(
									'#input',
									this.layoutService.template.sections[i].dashboard[j].obj.options[k].label,
								);
								tempAnswer = tempAnswer.replaceAll(
									'#comments',
									this.layoutService.template.sections[i].dashboard[j].obj.options[k]
										.instanceInputValue,
								);
								this.layoutService.template.sections[i].dashboard[j].obj.answers.push({
									answer: tempAnswer,
									id: this.layoutService.template.sections[i].dashboard[j].obj.options[k].id,
								});
							} else {
								this.layoutService.template.sections[i].dashboard[j].obj.answers.push({
									answer: this.layoutService.template.sections[i].dashboard[j].obj.options[k].label,
									id: this.layoutService.template.sections[i].dashboard[j].obj.options[k].id,
								});
							}
							if (
								this.layoutService.template.sections[i].dashboard[j].obj.options[k].input &&
								this.layoutService.template.sections[i].dashboard[j].obj.options[k].showOption &&
								!this.layoutService.template.sections[i].dashboard[j].obj.options[k]
									.linkedStatementCheck
							) {
								this.layoutService.template.sections[i].dashboard[j].obj.answers[
									this.layoutService.template.sections[i].dashboard[j].obj.answers.length - 1
								].answer =
									this.layoutService.template.sections[i].dashboard[j].obj.answers[
										this.layoutService.template.sections[i].dashboard[j].obj.answers.length - 1
									].answer +
									' ' +
									this.layoutService.template.sections[i].dashboard[j].obj.options[k]
										.instanceInputValue;
							}
						}
					}
					break;
				}
			}
		}
		for (let x = 0; x < this.layoutService.template.sections.length; x++) {
			for (let r = 0; r < this.layoutService.template.sections[x].dashboard.length; r++) {
				if (
					this.layoutService.template.sections[x].dashboard[r].obj.MultiSelectObj &&
					this.layoutService.template.sections[x].dashboard[r].obj.MultiSelectObj.objectid ==
					objId &&
					options[index].selected
				) {
					let tempSelectedOption = cloneDeep(options[index]);
					tempSelectedOption.selected = false;
					delete tempSelectedOption.selectedLinkSection;
					tempSelectedOption.link = false;
					delete tempSelectedOption.selectedLinkUi;
					tempSelectedOption.linkedUICheck = false;
					this.layoutService.template.sections[x].dashboard[r].obj.options.push({
						...tempSelectedOption,
					});
					let tempOptions = JSON.parse(
						JSON.stringify(this.layoutService.template.sections[x].dashboard[r].obj.options),
					);
					this.layoutService.template.sections[x].dashboard[r].obj.options = JSON.parse(
						JSON.stringify(tempOptions),
					);
					this.layoutService.refreshObject(
						this.layoutService.template.sections[x].dashboard[r].obj,
					);
				} else if (
					this.layoutService.template.sections[x].dashboard[r].obj.MultiSelectObj &&
					this.layoutService.template.sections[x].dashboard[r].obj.MultiSelectObj.objectid ==
					objId &&
					!options[index].selected
				) {
					for (
						let c = 0;
						c < this.layoutService.template.sections[x].dashboard[r].obj.options.length;
						c++
					) {
						if (
							options[index].id ==
							this.layoutService.template.sections[x].dashboard[r].obj.options[c].id
						) {
							this.layoutService.template.sections[x].dashboard[r].obj.options.splice(c, 1);
							let tempOptions = JSON.parse(
								JSON.stringify(this.layoutService.template.sections[x].dashboard[r].obj.options),
							);
							this.layoutService.template.sections[x].dashboard[r].obj.options = JSON.parse(
								JSON.stringify(tempOptions),
							);
							break;
						}
					}
					for (
						let c = 0;
						c < this.layoutService.template.sections[x].dashboard[r].obj.answers.length;
						c++
					) {
						if (
							options[index].id ==
							this.layoutService.template.sections[x].dashboard[r].obj.answers[c].id
						) {
							this.layoutService.template.sections[x].dashboard[r].obj.answers.splice(c, 1);
							let tempOptions = JSON.parse(
								JSON.stringify(this.layoutService.template.sections[x].dashboard[r].obj.answers),
							);
							this.layoutService.template.sections[x].dashboard[r].obj.answers = JSON.parse(
								JSON.stringify(tempOptions),
							);
							break;
						}
					}
					for (
						let c = 0;
						this.layoutService.template.sections[x].dashboard[r].obj.selectedItems &&
						c < this.layoutService.template.sections[x].dashboard[r].obj.selectedItems.length;
						c++
					) {
						if (
							options[index].id ==
							this.layoutService.template.sections[x].dashboard[r].obj.selectedItems[c].id
						) {
							this.layoutService.template.sections[x].dashboard[r].obj.selectedItems.splice(c, 1);
							let tempOptions = JSON.parse(
								JSON.stringify(
									this.layoutService.template.sections[x].dashboard[r].obj.selectedItems,
								),
							);
							this.layoutService.template.sections[x].dashboard[r].obj.selectedItems = JSON.parse(
								JSON.stringify(tempOptions),
							);
							break;
						}
					}
					this.layoutService.refreshObject(
						this.layoutService.template.sections[x].dashboard[r].obj,
					);
				}
			}
		}

		this.layoutService.refreshObject(this.object);
		this.layoutService.updateComponents();
		if (linkedSectionCheck) {
			if (this.layoutService.editorView) {
				this.subject.instanceRefreshCheck(['saad', linkedSections, options[index].selected]);
			}
		} else if (this.layoutService.editorView) {
			this.subject.instanceRefreshCheck('tick');
		}
	}

	public optionSelect(options, index, event) {
		for (let i = 0; i < this.object.options.length; i++) {
			if (
				this.object.options[i].validationValu &&
				this.object.options[i].validationValue.type == 'email'
			) {
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
		// this.layoutService.scroll = 'test' + this.object.uicomponent_name
		// var elmnt = document.getElementById("scrollPosition");
		if (!this.layoutService.isShowEditor) {
			this.layoutService.scroll = 'scroll';
		}
		////
		options[index].selected = !options[index].selected;
		let shouldUpdate = true;
		if (options[index].metadata && !options[index].selected) {
			for (const externalSlug of this.layoutService.template.allExternalSlugs) {
				if (externalSlug.onDeselect) {
					shouldUpdate = false;
					this.bsModalRef = this.modalServiceDialog.show(ConfirmationDialogComponent, {
						initialState: {
							message: `This will open ${externalSlug.onDeselect.label} module. Continue?`
						},
						class: 'modal-dialog-centered'
					});
					this.bsModalRef.content.result
						.subscribe(async (response) => {
							if (response) {
								if (!externalSlug.onDeselect.model) {
									window.open(`${externalSlug.onDeselect.route}`);
								} else if (externalSlug.onDeselect.model) {
									const activeModal = this.modalService.open(ExternalComponent, {
										// size: "lg",
										backdrop: 'static',
										keyboard: true,
										windowClass: 'custom-modal-integration',
									});
									activeModal.componentInstance.module = externalSlug.onDeselect.label;
									activeModal.componentInstance.templateData = options?.[index]?.metadata;
									activeModal.componentInstance.permissionModal = activeModal;
									activeModal.result
										.then((res) => {
											this.layoutService.refreshObject(this.object);
										})
										.catch((res) => {
											if(res) {
												if(index) {
													options.splice(index,1)
												}
												this.layoutService.refreshObject(this.object);
											} else {
												options[index].selected = !options?.[index]?.selected;
												this.changeDetector.detectChanges();
												return;
											}
										});
								}
								this.updateComponent(options, index, event);
							} else {
								options[index].selected = !options?.[index]?.selected;
								this.changeDetector.detectChanges();
							}
						});
				}
			}
		} else if (shouldUpdate) {
			this.updateComponent(options, index, event);
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

	clearFunc() {
		let sectionToHide = -1;
		let uiToHide = -1;
		let linkedSectionCheck = false;
		let newSectionsToHide = [];
		let newUiToHide = [];
		let linkedSectionsHide = [];
		this.object.answers = [];
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
		let objId;
		for (let x = 0; x < this.layoutService.template.sections.length; x++) {
			for (let r = 0; r < this.layoutService.template.sections[x].dashboard.length; r++) {
				if (
					this.layoutService.template.sections[x].dashboard[r].obj.uicomponent_name ==
					this.object.uicomponent_name
				) {
					objId = this.layoutService.template.sections[x].dashboard[r].id;
				}
			}
		}
		for (let x = 0; x < this.layoutService.template.sections.length; x++) {
			for (let r = 0; r < this.layoutService.template.sections[x].dashboard.length; r++) {
				if (
					this.layoutService.template.sections[x].dashboard[r].obj.MultiSelectObj &&
					this.layoutService.template.sections[x].dashboard[r].obj.MultiSelectObj.objectid == objId
				) {
					if (
						this.layoutService.template.sections[x].dashboard[r].obj.answers &&
						this.layoutService.template.sections[x].dashboard[r].obj.answers.length
					) {
						this.layoutService.template.sections[x].dashboard[r].obj.answers = [];
					}
					if (
						this.layoutService.template.sections[x].dashboard[r].obj.selectedItems &&
						this.layoutService.template.sections[x].dashboard[r].obj.selectedItems.length
					) {
						this.layoutService.template.sections[x].dashboard[r].obj.selectedItems = [];
					}
					if (
						this.layoutService.template.sections[x].dashboard[r].obj.options &&
						this.layoutService.template.sections[x].dashboard[r].obj.options.length
					) {
						this.layoutService.template.sections[x].dashboard[r].obj.options = [];
					}
					this.layoutService.refreshObject(
						this.layoutService.template.sections[x].dashboard[r].obj,
					);
				}
			}
		}
		this.layoutService.updateComponents();
		if (linkedSectionCheck) {
			if (this.layoutService.editorView) {
				this.subject.instanceRefreshCheck(['saad', linkedSectionsHide, false]);
			}
		}
	}
}
