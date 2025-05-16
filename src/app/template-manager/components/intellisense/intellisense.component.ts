import {
	Component,
	ViewEncapsulation,
	OnInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
} from '@angular/core';
import { RequestService } from '@appDir/shared/services/request.service';
import { TemaplateManagerUrlsEnum } from '@appDir/template-manager/template-manager-url-enum';
import { LayoutService } from '../../services/layout.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { SubjectService } from '../../services/subject.service';
import { HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { DomSanitizer } from '@angular/platform-browser';
import { cloneDeep } from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { UI_COMPONENT_TYPES } from '@appDir/template-manager/common/constants';

@Component({
	selector: 'app-intellisense',
	templateUrl: './intellisense.component.html',
	styleUrls: ['./intellisense.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntellisenseComponent implements OnInit {
	object: any = {};
	options: any = [];
	data: any = [];
	editText: any = false;
	boundStatement: any = '';
	subscriptions: any[] = [];
	subscription1: any;
	subscription2: any;
	paraClickCheck = false;
	searchData: any = [];
	resultClose = true;
	constructor(
		private toastrService: ToastrService,
		public changeDetector: ChangeDetectorRef,
		public layoutService: LayoutService,
		public subject: SubjectService,
		protected requestService: RequestService,
		public sanitizer: DomSanitizer,
	) {}

	ngOnInit() {
		this.subscription1 = this.subject.intellisenseRefresh.subscribe((res) => {
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
					if (res.check) {
						if (!this.object.options[res.index].selected) {
							this.selectOption(this.object.options[res.index]);
						}
					} else {
						if (this.object.options[res.index].selected) {
							this.deleteOption(this.object.options[res.index]);
						}
					}
					this.subject.objectRefreshItem('');
				}
			}
		});
		let clonedOptions = cloneDeep(this.object.options);
		for (let answer of this.object.answers) {
			this.deleteOption(answer);
		}
		for (let item of clonedOptions) {
			if (item.selected) {
				this.selectOption(item);
			}
		}
		console.log('Set TM codes');

		this.subscriptions.push(this.subscription1);
		this.subscriptions.push(this.subscription2);

		if (!this.object.instanceStatement || this.object.instanceStatement.length == 0) {
			this.object.instanceStatement = this.object.statement;
		}
		if (!this.object.defaultChecked && !this.object.preDefind) {
			for (let i = 0; i < this.object.options.length; i++) {
				if (
					!this.object.options[i].instanceLabel ||
					this.object.options[i].instanceLabel.length == 0
				) {
					this.object.options[i].instanceLabel = this.object.options[i].label;
				}
				if (this.object.options[i].defaultValue) {
					this.selectOption(this.object.options[i]);
					this.object.defaultChecked = true;
				}
			}
		}
		this.searchICTCodes('');
		this.boundStatement = this.object.statement;
	}
	statementUpdate() {
		this.object.instanceStatement = this.object.statement;
		this.layoutService.updateComponents();
	}
	ngOnDestroy() {
		this.subscriptions.forEach((subscription) => subscription.unsubscribe());
	}
	closeResults() {
		this.resultClose = true;
	}
	searchICTCodes(name) {
		if (this.object.preDefind && this.object.options) {
			if (this.object.preDefinedObj.slug == 'hcpcs_codes') {
				this.requestService
					.sendRequest(
						TemaplateManagerUrlsEnum.hcpcs_codes + '&name=' + name,
						'GET',
						REQUEST_SERVERS.billing_api_url,
					)
					.subscribe(
						(response: HttpSuccessResponse) => {
							let tempOptions = [];
							for (let i = 0; i < this.object.options.length; i++) {
								if (!this.object.options[i].selected) {
									this.object.options.splice(i, 1);
									i--;
								}
							}
							for (let data of response.result.data) {
								let optionExistCheck = false;
								let tempOption: any = {};
								for (let option of this.object.options) {
									if (option.id == data.id) {
										optionExistCheck = true;
										tempOption = option;
										break;
									}
								}
								if (!optionExistCheck) {
									data.label = data.name + ' - ' + data.description;
									this.object.options.push({
										label: data.name + '-' + data.description,
										textLabel: data.name + '-' + data.description,
										instanceLabel: data.name + '-' + data.description,
										selected: false,
										hide: false,
										id: data.id,
										link: false,
										input: false,
										inputValue: '',
										instanceInputValue: '',
										OptionViewValue: '1',
										selectedLinkSection: {},
									});
								}
							}
							this.object.data = cloneDeep(this.object.options);
							this.object.searchData = cloneDeep(this.object.options);
							this.layoutService.refreshObject(this.object);
						},
						(err) => {
							console.log(err);
							this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
							this.layoutService.isLoaderPending.next(false);
						},
					);
			} else if (this.object.preDefinedObj.slug == 'cpt_codes') {
				this.requestService
					.sendRequest(
						TemaplateManagerUrlsEnum.cpt_codes + '&name=' + name,
						'GET',
						REQUEST_SERVERS.billing_api_url,
					)
					.subscribe((response: HttpSuccessResponse) => {
						let tempOptions = [];
						for (let i = 0; i < this.object.options.length; i++) {
							if (!this.object.options[i].selected) {
								this.object.options.splice(i, 1);
								i--;
							}
						}
						for (let data of response.result.data) {
							let optionExistCheck = false;
							let tempOption: any = {};
							for (let option of this.object.options) {
								if (option.id == data.id) {
									optionExistCheck = true;
									tempOption = option;
									break;
								}
							}
							if (!optionExistCheck) {
								data.label = data.name + ' - ' + data.description;
								this.object.options.push({
									textLabel: data.name + '-' + data.description,
									instanceLabel: data.name + '-' + data.description,
									label: data.name + '-' + data.description,
									selected: false,
									hide: false,
									id: data.id,
									link: false,
									input: false,
									inputValue: '',
									instanceInputValue: '',
									OptionViewValue: '1',
									selectedLinkSection: {},
								});
							}
						}
						this.object.data = cloneDeep(this.object.options);
						this.object.searchData = cloneDeep(this.object.options);
						this.layoutService.refreshObject(this.object);
					});
			} else if (this.object.preDefinedObj.slug == 'icd_10_codes') {
				this.requestService
					.sendRequest(
						TemaplateManagerUrlsEnum.icd_10_codes + '&name=' + name,
						'GET',
						REQUEST_SERVERS.billing_api_url,
					)
					.subscribe((response: HttpSuccessResponse) => {
						let tempOptions = [];
						for (let i = 0; i < this.object.options.length; i++) {
							if (!this.object.options[i].selected) {
								this.object.options.splice(i, 1);
								i--;
							}
						}
						for (let data of response.result.data) {
							let optionExistCheck = false;
							let tempOption: any = {};
							for (let option of this.object.options) {
								if (option.id == data.id) {
									optionExistCheck = true;
									tempOption = option;
									break;
								}
							}
							if (!optionExistCheck) {
								data.label = data.name + ' - ' + data.description;
								this.object.options.push({
									label: data.name + '-' + data.description,
									textLabel: data.name + '-' + data.description,
									instanceLabel: data.name + '-' + data.description,
									selected: false,
									hide: false,
									id: data.id,
									link: false,
									input: false,
									inputValue: '',
									instanceInputValue: '',
									OptionViewValue: '1',
									selectedLinkSection: {},
								});
							}
						}

						this.object.data = cloneDeep(this.object.options);
						this.object.searchData = cloneDeep(this.object.options);
						this.layoutService.refreshObject(this.object);
					});
			}
		}
	}
	searchCodes(event) {
		this.resultClose = false;
		this.object.searchData = [];
		let nameFlag = 0;
		let descriptionFlag = 0;
		event.target.value = event.target.value.toLowerCase();
		let words = event.target.value.split(' ');

		for (let i = 0; i < this.object.data.length; i++) {
			let tempName = '';
			let tempDescription = '';
			if (this.object.data[i].name != null && this.object.data[i].name != undefined) {
				tempName = this.object.data[i].name.toLowerCase();
			}
			if (this.object.data[i].description != null && this.object.data[i].description != undefined) {
				tempDescription = this.object.data[i].description.toLowerCase();
			}
			for (let j = 0; j < words.length; j++) {
				if (tempName.includes(words[j]) && nameFlag != -1) {
					nameFlag = 1;
					tempName = tempName.replace(words[j], '');
				} else {
					nameFlag = -1;
				}
				if (tempDescription.includes(words[j]) && descriptionFlag != -1) {
					descriptionFlag = 1;
					tempDescription = tempDescription.replace(words[j], '');
				} else {
					descriptionFlag = -1;
				}
			}
			if (nameFlag == 1 || descriptionFlag == 1) {
				this.object.searchData.push(this.object.data[i]);
			}
			nameFlag = 0;
			descriptionFlag = 0;
		}
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
					selectedLinkSection: {},
					linkedStatement: '',
					selectedLinkUi: {},
					linkedUICheck: false,
					linkedStatementCheck: false,
					defaultValue: false,
				};
				this.object.options.push(item);
				this.selectOption(item);
			}
		}
	}

	searchOptions(event) {
		this.searchICTCodes(event.target.value);
		this.resultClose = false;
		this.object.searchData = [];
		this.object.data = [];
		let nameFlag = 0;
		let words = event.target.value.split(' ');
		for (let i = 0; i < this.object.options.length; i++) {
			if (!this.object.options[i].selected) {
				this.object.data.push(this.object.options[i]);
			}
		}
		for (let i = 0; i < this.object.data.length; i++) {
			let tempName = this.object.data[i].label.toLowerCase();
			for (let j = 0; j < words.length; j++) {
				words[j] = words[j].toLowerCase();
				if (tempName.includes(words[j]) && nameFlag != -1) {
					nameFlag = 1;
					tempName = tempName.replace(words[j], '');
				} else {
					nameFlag = -1;
				}
			}
			if (nameFlag == 1) {
				this.object.searchData.push(this.object.data[i]);
			}
			nameFlag = 0;
		}
	}

	selectOption(item) {
		item.selected = true;
		for (let option of this.object.options) {
			if (item.label == option.label) {
				option.selected = true;
			}
		}
		let tempData = [];
		for (let searchItem of this.object.searchData) {
			if (searchItem.label != item.label) {
				tempData.push(searchItem);
			}
		}
		this.object.searchData = JSON.parse(JSON.stringify(tempData));
		tempData = [];
		for (let tempItem of this.object.data) {
			if (tempItem.label != item.label) {
				tempData.push(tempItem);
			}
		}
		this.object.data = tempData;
		if (item.linkedStatementCheck) {
			let tempAnswer = item.linkedStatement;
			tempAnswer = tempAnswer.replaceAll('#input', item.label);

			item.answer = tempAnswer;
			this.object.answers.push(item);
		} else {
			item.answer = item.label;
			this.object.answers.push(item);
		}

		let tempItem = cloneDeep(item);
		let objId = '';
		for (let i = 0; i < this.layoutService.template.sections.length; i++) {
			for (let j = 0; j < this.layoutService.template.sections[i].dashboard.length; j++) {
				if (
					this.layoutService.template.sections[i].dashboard[j].obj.type == UI_COMPONENT_TYPES.INTELLISENSE &&
					this.layoutService.template.sections[i].dashboard[j].obj.uicomponent_name ===
						this.object.uicomponent_name
				) {
					objId = this.layoutService.template.sections[i].dashboard[j].id;
					break;
				}
			}
		}
		for (let x = 0; x < this.layoutService.template.sections.length; x++) {
			for (let r = 0; r < this.layoutService.template.sections[x].dashboard.length; r++) {
				if (
					this.layoutService.template.sections[x].dashboard[r].obj.MultiSelectObj &&
					this.layoutService.template.sections[x].dashboard[r].obj.MultiSelectObj.objectid == objId
				) {
					let tempSelectedOption = cloneDeep(tempItem);
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
				}
			}
		}

		this.layoutService.updateComponents();
		if (item && item.selectedLinkSection) {
			this.optionSelect(item);
		} else {
			this.subject.instanceRefreshCheck('tick');
		}
	}

	deleteOption(item) {
		item.selected = false;
		for (let option of this.object.options) {
			if (item.label == option.label) {
				option.selected = false;
				this.object.searchData.push(option);
			}
		}
		let tempItem = cloneDeep(item);
		let objId = '';
		for (let i = 0; i < this.layoutService.template.sections.length; i++) {
			for (let j = 0; j < this.layoutService.template.sections[i].dashboard.length; j++) {
				if (
					this.layoutService.template.sections[i].dashboard[j].obj.type == UI_COMPONENT_TYPES.INTELLISENSE &&
					this.layoutService.template.sections[i].dashboard[j].obj.uicomponent_name ===
						this.object.uicomponent_name
				) {
					objId = this.layoutService.template.sections[i].dashboard[j].id;
					break;
				}
			}
		}
		for (let x = 0; x < this.layoutService.template.sections.length; x++) {
			for (let r = 0; r < this.layoutService.template.sections[x].dashboard.length; r++) {
				if (
					this.layoutService.template.sections[x].dashboard[r].obj.MultiSelectObj &&
					this.layoutService.template.sections[x].dashboard[r].obj.MultiSelectObj.objectid == objId
				) {
					for (
						let c = 0;
						this.layoutService.template.sections[x].dashboard[r].obj.options &&
						c < this.layoutService.template.sections[x].dashboard[r].obj.options.length;
						c++
					) {
						if (
							this.layoutService.template.sections[x].dashboard[r].obj.options[c].id == tempItem.id
						) {
							this.layoutService.template.sections[x].dashboard[r].obj.options.splice(c, 1);
							break;
						}
					}
					for (
						let c = 0;
						c < this.layoutService.template.sections[x].dashboard[r].obj.answers.length;
						c++
					) {
						if (
							tempItem.id == this.layoutService.template.sections[x].dashboard[r].obj.answers[c].id
						) {
							this.layoutService.template.sections[x].dashboard[r].obj.answers.splice(c, 1);
							break;
						}
					}
					this.layoutService.refreshObject(
						this.layoutService.template.sections[x].dashboard[r].obj,
					);
				}
			}
		}
		let tempData = [];
		for (let selectedItem of this.object.answers) {
			if (selectedItem.label != item.label) {
				tempData.push(selectedItem);
			}
		}
		this.object.answers = tempData;

		this.layoutService.updateComponents();

		if (this.object.options[0] && this.object.options[0].selectedLinkSection) {
			this.optionSelect(item);
		} else {
			this.subject.instanceRefreshCheck('tick');
		}
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

	optionSelect(item) {
		if (!this.layoutService.isShowEditor) {
			this.layoutService.scroll = 'scroll';
		}
		let linkedSectionCheck = false;
		let linkedSections = [];
		let options = this.object.options;
		let index = 0;
		for (let i = 0; i < this.object.options.length; i++) {
			if (this.object.options[i].id == item.id) {
				index = i;
			}
		}
		let sectionsToHide = [];
		let newSectionsToHide = [];
		let newUiToHide = [];
		let sectionsToShow = [];

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
					this.layoutService.template.sections[i].dashboard[j].obj.uicomponent_name &&
					options[index].selectedLinkUi &&
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

		if (linkedSectionCheck) {
			if (this.layoutService.editorView) {
				this.subject.instanceRefreshCheck(['saad', linkedSections, options[index].selected]);
			}
		} else if (this.layoutService.editorView) {
			this.subject.instanceRefreshCheck('tick');
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
