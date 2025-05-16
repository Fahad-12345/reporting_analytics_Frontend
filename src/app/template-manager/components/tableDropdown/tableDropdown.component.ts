import { Component, ViewEncapsulation, OnInit, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { UI_COMPONENT_TYPES } from '@appDir/template-manager/common/constants';
import { LayoutService } from '@appDir/template-manager/services/layout.service';
import { SubjectService } from '@appDir/template-manager/services/subject.service';
import { cloneDeep } from 'lodash';
@Component({
	selector: 'app-tableDropdown',
	templateUrl: './tableDropdown.component.html',
	styleUrls: ['./tableDropdown.component.css'],
	encapsulation: ViewEncapsulation.None,
})
export class TableDropdownComponent implements OnInit {
	object: any = {};

	subscriptions: any[] = [];
	subscription1: any;
	editText: any = false;
	boundStatement: any = '';
	paraClickCheck = false;
	cities = [
		{ id: 1, name: 'Vilnius' },
		{ id: 2, name: 'Kaunas' },
		{ id: 3, name: 'Pavilnys', disabled: true },
		{ id: 4, name: 'Pabradė' },
		{ id: 5, name: 'Klaipėda' },
	];
	selectedCityIds: string[];
	constructor(
		public layoutService: LayoutService,
		public sanitizer: DomSanitizer,
		public changeDetector: ChangeDetectorRef,
		public subject: SubjectService,
	) {}
	ngOnInit() {
		this.subscription1 = this.subject.dropDownRefresh.subscribe((res) => {
			if (res.length != 0) {
				if (this.object.uicomponent_name == res.uicomponent_name) {
					this.changeDetector.markForCheck();
					this.subject.objectRefreshItem('');
				}
			}
		});
		this.subscriptions.push(this.subscription1);

		this.object.selectedItems = [];

		if (!this.object.instanceStatement || this.object.instanceStatement.length == 0) {
			this.object.instanceStatement = this.object.statement;
		}
		this.boundStatement = this.object.statement;

		if (!this.object.defaultChecked) {
			for (let i = 0; i < this.object.options.length; i++) {
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
	ngOnDestroy() {
		this.subscriptions.forEach((subscription) => subscription.unsubscribe());
	}
	textClick() {
		let textArea = document.getElementById('inputText' + this.object.uicomponent_name);
		this.boundStatement = textArea.innerText;
		this.editText = true;
		this.paraClickCheck = true;
	}
	refreshCheck() {
		this.object.options = [...this.object.options];
		this.changeDetector.detectChanges();
		}
	statementUpdate() {
		this.object.instanceStatement = this.object.statement;
		this.layoutService.updateComponents();
	}
	async optionSelect(options, event) {
		if (!this.layoutService.isShowEditor) {
			this.layoutService.scroll = 'scroll';
		}
		let index = 0;
		let newSectionsToHide = [];
		let newUiToHide = [];
		let linkedSectionCheck = false;
		let linkedSectionsShow = [];
		let linkedSectionsHide = [];
		for (let x = 0; x < options.length; x++) {
			if (
				options[x].label === event.label ||
				(event.value && options[x].label === event.value.label)
			) {
				index = x;
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
									if (
										'defaultChecked' in this.layoutService.template.sections[i].dashboard[j].obj
									) {
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
									if (
										'defaultChecked' in this.layoutService.template.sections[i].dashboard[j].obj
									) {
										this.layoutService.template.sections[i].dashboard[j].obj.defaultChecked = false;
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
						if (
							options[index].linkedRowValue &&
							this.layoutService.template.sections[i].dashboard[j].obj.uicomponent_name &&
							this.layoutService.template.sections[i].dashboard[j].obj.uicomponent_name ==
								options[index].linkedRowValue.id
						) {
							if (!options[index].selected) {
								this.layoutService.template.sections[i].dashboard[j].obj.selected_linked_row--;
								this.layoutService.refreshObject(
									this.layoutService.template.sections[i].dashboard[j].obj,
								);
								if (
									this.layoutService.template.sections[i].dashboard[j].obj.selected_linked_row == 0
								) {
									this.layoutService.template.sections[i].dashboard[j].obj.answers = [];
									if ('selectedItems' in this.layoutService.template.sections[i].dashboard[j].obj) {
										this.layoutService.template.sections[i].dashboard[j].obj.selectedItems = [];
									}
									if (
										'defaultChecked' in this.layoutService.template.sections[i].dashboard[j].obj
									) {
										this.layoutService.template.sections[i].dashboard[j].obj.defaultChecked = false;
									}
									this.layoutService.template.sections[i].dashboard[j].obj.input = '';
								}
							} else {
								this.layoutService.template.sections[i].dashboard[j].obj.selected_linked_row++;
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

		this.object.options = [...this.object.options];
		let objId = '';
		for (let i = 0; i < this.layoutService.template.sections.length; i++) {
			for (let j = 0; j < this.layoutService.template.sections[i].dashboard.length; j++) {
				if (
					this.layoutService.template.sections[i].dashboard[j].obj.type == UI_COMPONENT_TYPES.TABLE_DROPDOWN &&
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
								this.layoutService.template.sections[i].dashboard[j].obj.options[
									k
								].instanceInputValue =
									this.layoutService.template.sections[i].dashboard[j].obj.options[k].inputValue;
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

		let selected = false;
		if (index != -1) {
			selected = options[index].selected;
		}
		this.layoutService.updateComponents();
		if (linkedSectionCheck) {
			if (this.layoutService.editorView) {
				this.subject.instanceRefreshCheck(['saad', linkedSectionsShow, true]);
				this.subject.instanceRefreshCheck(['saad', linkedSectionsHide, false]);
			} else {
				}
		} else if (this.layoutService.editorView) {
			this.subject.instanceRefreshCheck('tick');
		}
	}
	closeDropdown() {
		this.subject.tableDropdownSelection([true]);
	}
}
