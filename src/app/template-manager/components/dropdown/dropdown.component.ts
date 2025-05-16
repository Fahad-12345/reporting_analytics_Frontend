import {
	Component,
	ViewEncapsulation,
	OnInit,
	ViewChild,
	ChangeDetectorRef,
	ChangeDetectionStrategy,
} from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import { DomSanitizer } from '@angular/platform-browser';
import { SubjectService } from '../../services/subject.service';
import { cloneDeep } from 'lodash';
import { NgSelectComponent } from '@ng-select/ng-select';
import { UI_COMPONENT_TYPES } from '@appDir/template-manager/common/constants';

@Component({
	selector: 'app-dropdown',
	templateUrl: './dropdown.component.html',
	styleUrls: ['./dropdown.component.css'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownComponent implements OnInit {
	@ViewChild('selectSingle') selectSingle: NgSelectComponent;
	object: any = {};
	dropdownOpened: boolean = false;
	subscriptions: any[] = [];
	subscription1: any;
	subscription2: any;
	editText: any = false;
	boundStatement: any = '';
	paraClickCheck = false;
	constructor(
		public layoutService: LayoutService,
		public sanitizer: DomSanitizer,
		public subject: SubjectService,
		public changeDetector: ChangeDetectorRef,
	) {}
	dropdownList = [];
	selectedItems = [];

	ngOnInit() {
		this.subscription1 = this.subject.refreshDefaultValue.subscribe((res) => {
			if (
				res &&
				res.hasOwnProperty('index') &&
				this.object.uicomponent_name == res.uicomponent_name
			) {
				this.object.defaultChecked = true;
				if (res.check) {
					if (!this.object.isMultiSelect) {
						if (!this.object.options[res.index].selected) {
							this.object.selectedItems = [];
							this.object.selectedItems.push(this.object.options[res.index]);
							this.optionSelect(
								this.object.options,
								{ label: this.object.options[res.index].label },
								this.object.isMultiSelect,
							);
						}
					} else {
						if (!this.object.options[res.index].selected) {
							this.object.selectedItems.push(this.object.options[res.index]);
							this.optionSelect(
								this.object.options,
								this.object.options[res.index],
								this.object.isMultiSelect,
							);
						}
						this.object.selectedItems = [...this.object.selectedItems];
					}
				} else {
					if (!this.object.isMultiSelect) {
						if (this.object.options[res.index].selected) {
							this.object.options[res.index].selected = false;
							this.object.selectedItems = [];
						}
					} else {
						if (this.object.options[res.index].selected) {
							for (let i = 0; i < this.object.selectedItems.length; i++) {
								if (this.object.selectedItems[i].label == this.object.options[res.index].label) {
									this.object.selectedItems.splice(i, 1);
								}
							}
							this.optionSelect(
								this.object.options,
								this.object.options[res.index],
								this.object.isMultiSelect,
							);
							this.object.selectedItems = [...this.object.selectedItems];
						}
					}
				}

				this.changeDetector.markForCheck();
				this.subject.selectByDefaultChange('');
			}
		});
		this.subscription2 = this.subject.dropDownRefresh.subscribe((res) => {
			if (res.length != 0) {
				if (this.object.uicomponent_name == res.uicomponent_name) {
					this.changeDetector.markForCheck();
					this.subject.objectRefreshItem('');
				}
			}
		});

		this.subscriptions.push(this.subscription1);
		this.subscriptions.push(this.subscription2);
		this.object.selectedItems = [];

		if (!this.object.instanceStatement || this.object.instanceStatement.length == 0) {
			this.object.instanceStatement = this.object.statement;
		}
		this.boundStatement = this.object.statement;

		let isMultipleCheck = false;
		if (this.object.isMultiSelect) {
			isMultipleCheck = true;
		}
		if (!this.object.defaultChecked) {
			for (let i = 0; i < this.object.options.length; i++) {
				if (this.object.options[i].defaultValue) {
					this.optionSelect(
						this.object.options,
						{ label: this.object.options[i].label },
						isMultipleCheck,
					);
					this.object.defaultChecked = true;
				}
			}
		}
		for (let i = 0; i < this.object.options.length; i++) {
			if (
				!this.object.options[i].instanceLabel ||
				this.object.options[i].instanceLabel.length == 0
			) {
				this.object.options[i].instanceLabel = this.object.options[i].label;
			}
			if (this.object.options[i].selected) {
				this.object.selectedItems.push({
					id: this.object.options[i].id,
					label: this.object.options[i].label,
					instanceLabel: this.object.options[i].label,
				});
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
	refreshCheck() {
		this.object.options = [...this.object.options];
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
	trackByFn(item) {
		return item.id;
	}
	async optionSelect(options, event, isMultipleCheck) {
		if (!event) {
			this.resetCalculations(options);
			return;
		}
		if (!this.layoutService.isShowEditor) {
			this.layoutService.scroll = 'scroll';
		}
		let index = 0;
		let newSectionsToHide = [];
		let newUiToHide = [];
		let linkedSectionCheck = false;
		let linkedSectionsShow = [];
		let linkedSectionsHide = [];
		if (!isMultipleCheck) {
			let selectedOptionsArray = [];
			let sectionsToHide = [];
			let sectionsToShow = [];
			let uiToShow = [];
			let uiToHide = [];
			for (let i = 0; i < options.length; i++) {
				if (options[i].selected == true && options[i].label != event.label) {
					options[i].selected = false;
					if (options[i].selectedLinkSection && options[i].selectedLinkSection.id) {
						sectionsToHide.push(options[i].selectedLinkSection.id);
					}
					if (options[i].selectedLinkUi && options[i].selectedLinkUi.id) {
						uiToHide.push(options[i].selectedLinkUi.id);
					}
				} else if (options[i].selected == false && options[i].label === event.label) {
					options[i].selected = true;
					if (options[i].selectedLinkSection && options[i].selectedLinkSection.id) {
						sectionsToShow.push(options[i].selectedLinkSection.id);
					}
					if (options[i].selectedLinkUi && options[i].selectedLinkUi.id) {
						uiToShow.push(options[i].selectedLinkUi.id);
					}
				}
			}
			this.object.options = options;
			for (let i = 0; i < this.layoutService.template.sections.length; i++) {
				if (sectionsToHide.includes(this.layoutService.template.sections[i].id)) {
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
				if (sectionsToShow.includes(this.layoutService.template.sections[i].id)) {
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
							i = j - 1;
							break;
						}
					}
				}
				for (let j = 0; j < this.layoutService.template.sections[i].dashboard.length; j++) {
					if (
						uiToShow.includes(
							this.layoutService.template.sections[i].dashboard[j].obj.uicomponent_name,
						)
					) {
						this.layoutService.template.sections[i].dashboard[j].obj.selected_linked_ui_component++;
						this.layoutService.refreshObject(
							this.layoutService.template.sections[i].dashboard[j].obj,
						);
					}
					if (
						uiToHide.includes(
							this.layoutService.template.sections[i].dashboard[j].obj.uicomponent_name,
						)
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
		} else {
			for (let j = 0; j < options.length; j++) {
				if (
					options[j].label === event.label ||
					(event.value && options[j].label === event.value.label)
				) {
					index = j;
					options[index].selected = !options[index].selected;
					for (let i = 0; i < this.layoutService.template.sections.length; i++) {
						if (options[index].selectedLinkSection && options[index].selectedLinkSection.id) {
							if (
								this.layoutService.template.sections[i].id == options[index].selectedLinkSection.id
							) {
								if (options[index].selected) {
									this.layoutService.template.sections[i].selected_linked_component++;
									if (
										this.layoutService.template.sections[i].selected_linked_component ===
										this.layoutService.template.sections[i].linked_component
									) {
										linkedSectionsShow.push(this.layoutService.template.sections[i]);
										this.layoutService.collapseSectionIndex[
											this.layoutService.template.sections[i].id
										] = false;
										linkedSectionCheck = true;
									}
									let currentDepth =
										this.layoutService.template.sections[i].secNo.split('.').length - 1;
									for (let j = i + 1; j < this.layoutService.template.sections.length; j++) {
										let tempDepth =
											this.layoutService.template.sections[j].secNo.split('.').length - 1;
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
										linkedSectionsHide.push(this.layoutService.template.sections[i]);
										linkedSectionCheck = true;
									}
									let currentDepth =
										this.layoutService.template.sections[i].secNo.split('.').length - 1;
									for (let j = i + 1; j < this.layoutService.template.sections.length; j++) {
										let tempDepth =
											this.layoutService.template.sections[j].secNo.split('.').length - 1;
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
									this.layoutService.template.sections[i].dashboard[j].obj
										.selected_linked_ui_component--;
									this.layoutService.refreshObject(
										this.layoutService.template.sections[i].dashboard[j].obj,
									);

									if (!this.layoutService.template.sections[i].dashboard[j].obj.is_single_select) {
										if (this.layoutService.template.sections[i].dashboard[j].obj.options) {
											for (let eachOption of this.layoutService.template.sections[i].dashboard[j]
												.obj.options) {
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
										if (
											'selectedItems' in this.layoutService.template.sections[i].dashboard[j].obj
										) {
											this.layoutService.template.sections[i].dashboard[j].obj.selectedItems = [];
										}
										if (
											'defaultChecked' in this.layoutService.template.sections[i].dashboard[j].obj
										) {
											this.layoutService.template.sections[i].dashboard[j].obj.defaultChecked =
												false;
										}
										this.layoutService.template.sections[i].dashboard[j].obj.input = '';
									} else if (
										this.layoutService.template.sections[i].dashboard[j].obj
											.selected_linked_ui_component == 0
									) {
										if (this.layoutService.template.sections[i].dashboard[j].obj.options) {
											for (let eachOption of this.layoutService.template.sections[i].dashboard[j]
												.obj.options) {
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
										if (
											'selectedItems' in this.layoutService.template.sections[i].dashboard[j].obj
										) {
											this.layoutService.template.sections[i].dashboard[j].obj.selectedItems = [];
										}
										if (
											'defaultChecked' in this.layoutService.template.sections[i].dashboard[j].obj
										) {
											this.layoutService.template.sections[i].dashboard[j].obj.defaultChecked =
												false;
										}
										this.layoutService.template.sections[i].dashboard[j].obj.input = '';
									}
								} else {
									this.layoutService.template.sections[i].dashboard[j].obj
										.selected_linked_ui_component++;
									this.layoutService.refreshObject(
										this.layoutService.template.sections[i].dashboard[j].obj,
									);
								}
							}
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
		}

		this.object.options = [...this.object.options];
		let objId = '';
		for (let i = 0; i < this.layoutService.template.sections.length; i++) {
			for (let j = 0; j < this.layoutService.template.sections[i].dashboard.length; j++) {
				if (
					this.layoutService.template.sections[i].dashboard[j].obj.type == UI_COMPONENT_TYPES.DROPDOWN &&
					this.layoutService.template.sections[i].dashboard[j].obj.uicomponent_name ===
						this.object.uicomponent_name
				) {
					objId = this.layoutService.template.sections[i].dashboard[j].id;
					this.layoutService.template.sections[i].dashboard[j].obj.answers = [];
					this.layoutService.template.sections[i].dashboard[j].obj.input = '';
					for (
						let k = 0;
						k < this.layoutService.template.sections[i].dashboard[j].obj.options.length;
						k++
					) {
						if (
							this.layoutService.template.sections[i].dashboard[j].obj.options[k].selected == true
						) {
							if (
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
						}
					}
					break;
				}
			}
		}

		for (let x = 0; x < this.layoutService.template.sections.length; x++) {
			for (let r = 0; r < this.layoutService.template.sections[x].dashboard.length; r++) {
				if (
					this.layoutService.template.sections[x].dashboard[r].obj.uicomponent_name ==
					this.object.uicomponent_name
				) {
					}
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

		let selected = false;
		if (index != -1) {
			selected = options[index].selected;
		}
		this.layoutService.updateComponents();

		if (linkedSectionCheck) {
			if (this.layoutService.editorView) {
				this.subject.instanceRefreshCheck(['saad', linkedSectionsShow, true]);
				this.subject.instanceRefreshCheck(['saad', linkedSectionsHide, false]);
			}
			} else if (this.layoutService.editorView) {
			this.subject.instanceRefreshCheck('tick');
		}
		if(!this.object.isMultiSelect) {
			// this.dropdownOpened= false
			this.selectSingle.element.blur();
			this.selectSingle.close();
		}
	}
	editStatement() {
		this.editText = false;
	}

	multiDropdownOpen() {
		var x: any = document.getElementsByClassName('dropdown-list');
		if (!x[0].hidden) {
			this.layoutService.multiDropdownOpen = true;
		} else {
			this.layoutService.multiDropdownOpen = false;
		}
	}

	async resetCalculations(options) {
		let objId = '';
		let selectedOptionsArray = [];
		let sectionsToHide = [];
		let newSectionsToHide = [];
		let newUiToHide = [];
		let uiToHide = [];
		let linkedSectionCheck = false;
		let linkedSections = [];
		for (let i = 0; i < options.length; i++) {
			if (options[i].selected == true) {
				if (options[i].selectedLinkSection && options[i].selectedLinkSection.id) {
					sectionsToHide.push(options[i].selectedLinkSection.id);
				}
				if (options[i].selectedLinkUi && options[i].selectedLinkUi.id) {
					uiToHide.push(options[i].selectedLinkUi.id);
				}
			}
		}
		for (let j = 0; j < options.length; j++) {
			let index = j;
			options[index].selected = false;
			for (let i = 0; i < this.layoutService.template.sections.length; i++) {
				if (options[index].selectedLinkSection && options[index].selectedLinkSection.id) {
					if (sectionsToHide.includes(this.layoutService.template.sections[i].id)) {
						if (
							this.layoutService.template.sections[i].id == options[index].selectedLinkSection.id
						) {
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
				for (let jk = 0; jk < this.layoutService.template.sections[i].dashboard.length; jk++) {
					if (
						uiToHide.includes(
							this.layoutService.template.sections[i].dashboard[jk].obj.uicomponent_name,
						) &&
						this.layoutService.template.sections[i].dashboard[jk].obj.uicomponent_name ==
							options[index].selectedLinkUi.id
					) {
						this.layoutService.template.sections[i].dashboard[jk].obj
							.selected_linked_ui_component--;
						this.layoutService.refreshObject(
							this.layoutService.template.sections[i].dashboard[jk].obj,
						);

						if (!this.layoutService.template.sections[i].dashboard[jk].obj.is_single_select) {
							if (this.layoutService.template.sections[i].dashboard[jk].obj.options) {
								for (let eachOption of this.layoutService.template.sections[i].dashboard[jk].obj
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
							this.layoutService.template.sections[i].dashboard[jk].obj.answers = [];
							if ('selectedItems' in this.layoutService.template.sections[i].dashboard[jk].obj) {
								this.layoutService.template.sections[i].dashboard[jk].obj.selectedItems = [];
							}
							if ('defaultChecked' in this.layoutService.template.sections[i].dashboard[jk].obj) {
								this.layoutService.template.sections[i].dashboard[jk].obj.defaultChecked = false;
							}
							this.layoutService.template.sections[i].dashboard[jk].obj.input = '';
						} else if (
							this.layoutService.template.sections[i].dashboard[jk].obj
								.selected_linked_ui_component == 0
						) {
							if (this.layoutService.template.sections[i].dashboard[jk].obj.options) {
								for (let eachOption of this.layoutService.template.sections[i].dashboard[jk].obj
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
							this.layoutService.template.sections[i].dashboard[jk].obj.answers = [];
							if ('selectedItems' in this.layoutService.template.sections[i].dashboard[jk].obj) {
								this.layoutService.template.sections[i].dashboard[jk].obj.selectedItems = [];
							}
							if ('defaultChecked' in this.layoutService.template.sections[i].dashboard[jk].obj) {
								this.layoutService.template.sections[i].dashboard[jk].obj.defaultChecked = false;
							}
							this.layoutService.template.sections[i].dashboard[jk].obj.input = '';
						}
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
		for (let i = 0; i < this.layoutService.template.sections.length; i++) {
			for (let j = 0; j < this.layoutService.template.sections[i].dashboard.length; j++) {
				if (
					this.layoutService.template.sections[i].dashboard[j].obj.type == UI_COMPONENT_TYPES.DROPDOWN &&
					this.layoutService.template.sections[i].dashboard[j].obj.uicomponent_name ===
						this.object.uicomponent_name
				) {
					objId = this.layoutService.template.sections[i].dashboard[j].id;
					this.layoutService.template.sections[i].dashboard[j].obj.answers = [];
					this.layoutService.template.sections[i].dashboard[j].obj.input = '';
					for (let k = 0; k < options.length; k++) {
						options[k].selected = false;
					}
					this.layoutService.template.sections[i].dashboard[j].obj.options = options;
				}
			}
		}

		for (let x = 0; x < this.layoutService.template.sections.length; x++) {
			for (let r = 0; r < this.layoutService.template.sections[x].dashboard.length; r++) {
				if (
					this.layoutService.template.sections[x].dashboard[r].obj.MultiSelectObj &&
					this.layoutService.template.sections[x].dashboard[r].obj.MultiSelectObj.objectid == objId
				) {
					this.layoutService.template.sections[x].dashboard[r].obj.options = [];
					this.layoutService.template.sections[x].dashboard[r].obj.answers = [];
					this.layoutService.template.sections[x].dashboard[r].obj.selectedItems = [];
				}
			}
		}
		this.layoutService.updateComponents();
		if (linkedSectionCheck) {
			if (this.layoutService.editorView) {
				this.subject.instanceRefreshCheck(['saad', linkedSections, false]);
			}
		} else {
			}
	}
	
	isFilled() {
		if ((!(!this.layoutService.editorView && !this.layoutService.isShowEditor) &&
		this.object && this.object.is_required && this.object.answers && this.object.answers.length == 0	 )
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


	addOption(event) {
		let tempValue = event.target.value.trim();
		if (event.key == 'Enter' && tempValue != '' && this.object.editable) {
			let optionValue = event.target.value;
			event.srcElement.value = '';
			let sameCheck = false;
			for (let option of this.object.options) {
				if (optionValue == option.label) {
					sameCheck = true;
				}
			}
			let editorOptionValue = this.layoutService.applyEditor(this.object, optionValue);

			if (!sameCheck) {
				let item = {
					label: editorOptionValue,
					instanceLabel: editorOptionValue,
					textLabel: optionValue,
					selected: false,
					hide: false,
					link: false,
					id: this.object.options.length + 1,
					showOption: true,
					defaultValue: false,
					selectedLinkSection: {},
					linkedStatement: '',
					selectedLinkUi: {},
					linkedUICheck: false,
					linkedStatementCheck: false,
				};
				this.object.options.push(item);
				this.optionSelect(
					this.object.options,
					{
						target: { selectedIndex: this.object.options.length - 1 },
						label: this.object.options[this.object.options.length - 1].label,
					},
					this.object.isMultiSelect,
				);
				this.refreshCheck();

				}
		}
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
			this.object.selectedItems = [];
		});
		this.object.options = [...this.object.options];
		this.object.answers = [];
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
