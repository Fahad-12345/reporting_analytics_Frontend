import { DisplayGrid, GridsterConfig, GridType } from '../shared/gridster/gridsterConfig.interface';
import { SubjectService } from './subject.service';
import { BehaviorSubject } from 'rxjs';
import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { imageLabelPoint, imageLabelProperties } from '../common/ui-props';
import { UI_COMPONENT_TYPES } from '../common/constants';
export interface IComponent {
	id: string;
	componentRef: string;
}
interface imageObj {
	paths: string[],
	data: imageLabelPoint[],
	raw: string | string[],
}
@Injectable({
	providedIn: 'root',
})
export class LayoutService {
	constructor(@Inject(DOCUMENT) private doc: any, public subjectService: SubjectService) {}
	public caseTypeSelectedMultiple = null;
	public visitStatusSelectedMultiple = null;
	public specSelectedMultiple = null;
	public clinicSelectedMultiple = null;
	public carryModal: any;
	public carryDrop = false;
	public collapseSectionIndex = {};
	public calculationFields: any = [];
	updateDropdown = { i: -1, j: -1, check: false };
	public scroll: any = '';
	public templateErrors = 0;
	public templateObj: any = {
		first_name: 'Saad',
		middle_name: 'M.',
		last_name: 'Sohail',
		dob: '1998-06-02T00:00:00.000Z',
		age: 23,
		gender: 'male',
		ssn: '222222222',
		meritial_status: null,
		profile_avatar: null,
		status: 'In Session',
		deleted_at: null,
		height_in: 165,
		height_ft: null,
		weight_kg: 60,
		weight_lbs: null,
		created_at: '2020-05-04T04:22:33.000Z',
		id: 1240,
		contact_info: {
			case_id: null,
			email: '',
			cell_phone: 3333333333,
			work_phone: 0,
			home_phone: 0,
			ext: null,
			fax: null,
			deleted_at: null,
			id: 1,
			object_id: 1,
			contact_person_type_id: 1,
			patientAddress: [
				{
					type: 'mailing',
					street: '223 North Van Dien Avenue',
					apartment: '',
					latitude: null,
					longitude: null,
					city: 'Ridgewood',
					state: 'New Jersey',
					zip: '07450',
					deleted_at: null,
					id: 1,
					contact_person_id: 1,
				},
			],
		},
		patient_name: 'Mr Test Patient',
		marital_status: null,
		social_secuirty_no: '222222222',
		date_of_admission: '04-04-20',
		dob_date_of_birth: '02-31-20',
		patient_age: 1,
		weight: 'nulllbs',
		height_in_feet: null,
		height_in_inches: null,
		home_phone: 0,
		cell_phone: 3333333333,
		work_phone: 0,
		mailing_city: 'Ridgewood',
		mailing_state: 'New Jersey',
		mailing_zip: '07450',
		mailing_address:
			'Apartment:, Street:223 North Van Dien Avenue, City:Ridgewood, State:New Jersey, Zip:07450',
		resendtial_city: 'N/A',
		resendtial_state: 'N/A',
		resendtial_zip: 'N/A',
		resendtial_addrees: 'N/A',
		patient_mailing_address:
			'Apartment:, Street:223 North Van Dien Avenue, City:Ridgewood, State:New Jersey, Zip:07450',
		today_date: '03-02-21',
		case_id: 1,
		case_type_id: 4,
		patientId: 1,
		doctorId: 55,
		visit_type: 'reEvaluation',
		visit_type_id: 3,
		current_aptdate_time: '2021-04-02T10:20:00.000Z',
		end: '2021-04-02T11:00:00.000Z',
		apt_title: null,
		chart_id: '1',
		chart_id_formatted: '1',
		checked_in_time: null,
		checkInTime: '2021-04-02T10:34:10.486Z',
		speciality: 'Dermatology',
		provider_doctor_name: 'David ISB Thomas',
		patient: {
			id: 1,
			firstName: 'Mr',
			middleName: 'Test',
			lastName: 'Patient',
			dob: '2020-03-31T00:00:00.000Z',
			imagePath: null,
			weight: 'N/A',
			height: 'N/A',
			gender: 'male',
			maritalStatus: null,
			location: null,
			occupation: null,
			insurance: null,
		},
		office_location_name: 'TM Location_1',
		session: null,
		case_type: 'Self',
		insurance: 'N/A',
		doa_date_of_accident: null,
		current_date: '2021-04-02T10:34:10.486Z',
		location_id: 26,
		speciality_id: 10,
	};
	public isShowEditor = false;
	public isInstancePreview = false;
	public hfHeight = false;
	public elementHeight = false;
	multiDropdownOpen = false;
	public sectionsSearch: any;
	public editorView = false;
	isLoaderPending: BehaviorSubject<boolean> = new BehaviorSubject(false);
	public previewEdited = false;
	public defaultHeadersObject = [];
	public defaultFootersObject = [];
	public header: any;
	public footer: any;
	public tableSectionTypeId = 2;
	public NormalSectionTypeId = 1;
	public tableSubSectionTypeId = 3;
	public objectiveSectionTypeId = 7;
	public subjectiveSectionTypeId = 6;
	public assessmentSectionTypeId = 8;
	public planSectionTypeId = 9;
	public headerIndex = 0;
	public footerIndex = 0;
	public htmlStringValue = '';
	public seperateStringValue: any = [];
	public seperateMainStringValue: any = [];
	public headers: any;
	selectedOption = 0;
	public defaultHeaderMarginLeft = 0;
	public defaultHeaderMarginRight = 0;
	public defaultFooterMarginLeft = 0;
	public defaultFooterMarginRight = 0;
	backupQueue: any = [];
	backupId = 1;
	backupIndex = -2;
	public template: any = {
		template_name: 'New Template',
		boundTemplateStatement: 'New Template',
		uiBorders: false,
		leftUIBorder: 0,
		rightUIBorder: 0,
		topUIBorder: 0,
		bottomUIBorder: 0,
		uiPaddings: false,
		leftUIPadding: 0,
		rightUIPadding: 0,
		topUIPadding: 0,
		bottomUIPadding: 0,
		lineSpacing: false,
		lineSpacingValue: 25,
		bgColor: false,
		backgroundColor: '#ff0000',
		fontColor: false,
		fontColorCode: '#000000',
		fontFamily: false,
		fontFamilyValue: '',
		tags: [],
		public: 0,
		shared: 0,
		default_columns: 1,
		pdf_type: 1,
		signatureAdded: false,
		sections: [],
		uiCompIds: 0,
		doctorSignatureCheck: false,
		patientSignatureCheck: false,
		paSignatureCheck: false,
		hideTemplateName: false,
		allExternalSlugs: [],

		carryOriginalDeleted: [],
		carryNewDeleted: [],
		pageSize: {
			width: 205,
			height: 297,
		},
		pdfMarginTop: 0,
		pdfMarginBottom: 0,
		pdfMarginLeft: 10,
		pdfMarginRight: 10,
		mappingKeyWords: [
			{
				value: ['#He/She'],
				slug: '#He/She',
			},
			{
				value: ['#His/Her'],
				slug: '#His/Her',
			},
			{
				value: ['#Him/Her'],
				slug: '#Him/Her',
			},
			{
				value: ['#Page'],
				slug: '#Page',
			},
			{
				value: ['#TotalPage'],
				slug: '#TotalPage',
			},
			{
				value: ['#DateToday'],
				slug: '#Date',
			},
			{
				value: ['#DateTimeToday'],
				slug: '#DateTime',
			},
			{
				value: ['#PatientName'],
				slug: '#PatientName',
			},
		],
	};
	lastI = 0;
	lastK = 0;
	templateSections: any[];
	imageModal: any;
	imageObj: imageObj
	componentsService: any = [];
	alignmentModal: any;
	externalModal: any;
	public headerModal: any;
	PreDefinedListUsed: any = [];
	rreplace(str, word, newWord) {
		var n = str.lastIndexOf(word);

		str = str.slice(0, n) + str.slice(n).replace(word, newWord);
		return str;
	}
	stripHtml(html) {
		let tmp = document.createElement('DIV');
		tmp.innerHTML = html;
		return tmp.textContent || tmp.innerText || '';
	}
	refreshObject(object) {
		this.subjectService.objectRefreshItem(object);
	}
	recursiveLinkedUi(uiToHide) {
		if (uiToHide.length == 0) {
			return;
		}
		let newUiToHide = [];
		let newSectionsToHide = [];
		for (let uiComponentId of uiToHide) {
			for (let i = 0; i < this.template.sections.length; i++) {
				for (let j = 0; j < this.template.sections[i].dashboard.length; j++) {
					if (
						this.template.sections[i].dashboard[j].obj.uicomponent_name &&
						uiComponentId == this.template.sections[i].dashboard[j].obj.uicomponent_name
					) {
						this.template.sections[i].dashboard[j].obj.selected_linked_ui_component--;
						this.refreshObject(this.template.sections[i].dashboard[j].obj);
						if (!this.template.sections[i].dashboard[j].obj.is_single_select) {
							if (this.template.sections[i].dashboard[j]?.obj?.options?.length) {
								for (let eachOption of this.template.sections[i].dashboard[j].obj.options) {
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
							this.template.sections[i].dashboard[j].obj.answers = [];
							this.template.sections[i].dashboard[j].obj.input = '';
							if ('selectedItems' in this.template.sections[i].dashboard[j].obj) {
								this.template.sections[i].dashboard[j].obj.selectedItems = [];
							}
							if ('defaultChecked' in this.template.sections[i].dashboard[j].obj) {
								this.template.sections[i].dashboard[j].obj.defaultChecked = false;
							}
						} else if (
							this.template.sections[i].dashboard[j].obj.selected_linked_ui_component == 0
						) {
							if (this.template.sections[i].dashboard[j]?.obj?.options?.length) {
								for (let eachOption of this.template.sections[i].dashboard[j].obj.options) {
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
							this.template.sections[i].dashboard[j].obj.answers = [];
							if ('selectedItems' in this.template.sections[i].dashboard[j].obj) {
								this.template.sections[i].dashboard[j].obj.selectedItems = [];
							}
							if ('defaultChecked' in this.template.sections[i].dashboard[j].obj) {
								this.template.sections[i].dashboard[j].obj.defaultChecked = false;
							}
							this.template.sections[i].dashboard[j].obj.input = '';
						}
					}
				}
			}
		}
		for (let newHideSection of newSectionsToHide) {
			for (let i = 0; i < this.template.sections.length; i++) {
				if (this.template.sections[i].id == newHideSection) {
					this.template.sections[i].selected_linked_component--;
					let currentDepth = this.template.sections[i].secNo.split('.').length - 1;
					for (let j = i + 1; j < this.template.sections.length; j++) {
						let tempDepth = this.template.sections[j].secNo.split('.').length - 1;
						if (tempDepth > currentDepth) {
							this.template.sections[j].selected_linked_component--;
						} else {
							i = j - 1;
							break;
						}
					}
				}
			}
		}
		newSectionsToHide = [];
		this.recursiveLinkedUi(newUiToHide);
	}
	checkSingularPlural(object, index, value) {
		const matchFound = value.match(/#singularPlural:[^\n ]*:[^\n ]*/g);
		if (matchFound) {
			for (let match of matchFound) {
				const values = match.split(':');
				if (
					parseInt(object.options[index].instanceInputValue) === 0 ||
					parseInt(object.options[index].instanceInputValue) === 1
				) {
					value = value.replaceAll(match, values[1]);
				} else if (object.options[index].instanceInputValue.length) {
					value = value.replaceAll(match, values[2]);
				} else {
					value = value.replaceAll(match, '');
				}
			}
		}
		return value;
	}
	updateComponents() {
		var that = this;
		let commaAdded = false;
		for (let textIndex = 0; textIndex < that.template.sections.length; textIndex++) {
			for (let i = 0; i < that.template.sections[textIndex].dashboard.length; i++) {
				let tempStatement = that.template.sections[textIndex].dashboard[i].obj.statement || '';
				that.template.sections[textIndex].dashboard[i].obj['instanceStatement'] = tempStatement;
				let arr = tempStatement.match(/@[0-9]+/g);
				let orderedListCount = 1;
				let bulletListCount = 1;
				let simpleListCount = 1;
				let lastItem = '';
				let foundElements = [];
				for (let j = 0; arr && j < arr.length; j++) {
					let intermediateStringCheck = false;
					if (arr[j][0] == '@') {
						foundElements.push(arr[j]);
						let tempArrayString = `${arr[j]}`;
						let tempArrayRE = new RegExp(tempArrayString, 'g');
						let tempArray = tempStatement.split(tempArrayRE);
						let foundCounter = 0;
						for (let foundItem of foundElements) {
							if (foundItem == arr[j]) {
								foundCounter++;
							}
						}
						let tempStringMatcher = tempArray[foundCounter];
						if (tempStringMatcher) {
							tempStringMatcher = this.stripHtml(tempStringMatcher);
							tempStringMatcher = tempStringMatcher.trim();
							if (tempStringMatcher == '') {
								intermediateStringCheck = false;
							} else {
								intermediateStringCheck = true;
							}
							let nextItems = tempStringMatcher.match(/@[0-9]+/g);
							if (nextItems && nextItems.length && nextItems[0].length) {
								let nextItemCheck = true;
								for (let itemIndex = 0; itemIndex < nextItems[0].length; itemIndex++) {
									if (tempStringMatcher[itemIndex] != nextItems[0][itemIndex]) {
										nextItemCheck = false;
									}
								}
								if (!nextItemCheck) {
									intermediateStringCheck = true;
								} else {
									intermediateStringCheck = false;
								}
							} else {
								intermediateStringCheck = true;
							}
						}
						arr[j] = arr[j].replace('@', '');
						let orderedListAnswer = '';
						for (let checkIndex = 0; checkIndex < that.template.sections.length; checkIndex++) {
							for (let k = 0; k < that.template.sections[checkIndex].dashboard.length; k++) {
								let orderedListCountComponent = 1;
								let simpleListCountComponent = 1;
								let bulletListCountComponent = 1;
								if (
									arr[j] == that.template.sections[checkIndex].dashboard[k].obj.uicomponent_name &&
									(that.template.sections[checkIndex].linked_component == 0 ||
										that.template.sections[checkIndex].selected_linked_component ===
											that.template.sections[checkIndex].linked_component) &&
									!(checkIndex == textIndex && i == k)
								) {
									let answer = '';
									if (!that.template.sections[checkIndex].dashboard[k].obj.OptionView) {
										if (
											that.template.sections[textIndex].dashboard[i].obj.listOptions == 1 ||
											that.template.sections[textIndex].dashboard[i].obj.listOptions == 3
										) {
										}
										if (that.template.sections[textIndex].dashboard[i].obj.listOptions == 2) {
										}
									} else {
										if (
											that.template.sections[checkIndex].dashboard[k].obj.OptionView == 1 ||
											that.template.sections[checkIndex].dashboard[k].obj.OptionView == 3
										) {
										}
										if (that.template.sections[checkIndex].dashboard[k].obj.OptionView == 2) {
										}
									}
									if (that.template.sections[checkIndex].dashboard[k].obj.type != 'text') {
										for (
											let l = 0;
											l < that.template.sections[checkIndex].dashboard[k].obj.answers.length;
											l++
										) {
											const extractedAnswer = this.extractAnswerFromComponent(that.template.sections[checkIndex].dashboard[k], that.template.sections[checkIndex].dashboard[k].obj.answers[l]?.answer ?? '')
											if (!that.template.sections[checkIndex].dashboard[k].obj.OptionView) {
												if (that.template.sections[textIndex].dashboard[i].obj.listOptions == 1) {
													if (simpleListCount == 1) {
														answer =
															answer +
															extractedAnswer;
													} else {
														answer =
															answer +
															'<br>' +
															extractedAnswer;
													}
													simpleListCount++;
												} else if (
													that.template.sections[textIndex].dashboard[i].obj.listOptions == 2
												) {
													if (bulletListCount == 1) {
														answer =
															answer +
															'\u2022 ' +
															extractedAnswer;
													} else {
														answer =
															answer +
															'<br>' +
															'\u2022 ' +
															extractedAnswer;
													}
													bulletListCount++;
												} else if (
													that.template.sections[textIndex].dashboard[i].obj.listOptions == 3
												) {
													if (orderedListCount == 1) {
														answer =
															answer +
															orderedListCount +
															'. ' +
															extractedAnswer;
													} else {
														answer =
															answer +
															'<br>' +
															orderedListCount +
															'. ' +
															extractedAnswer;
													}
													orderedListCount++;
												} else if (
													that.template.sections[textIndex].dashboard[i].obj.listOptions == 4
												) {
													if (
														!intermediateStringCheck ||
														l <
															that.template.sections[checkIndex].dashboard[k].obj.answers.length - 1
													) {
														commaAdded = true;
														answer =
															answer +
															extractedAnswer +
															', ';
														lastItem =
															extractedAnswer + ', ';
													} else {
														commaAdded = false;
														answer =
															answer +
															extractedAnswer;
														lastItem =
															extractedAnswer;
													}
												} else if (
													that.template.sections[textIndex].dashboard[i].obj.listOptions == 5
												) {
													answer =
														answer +
														'<br>' +
														'<i class="fa fa-check-square fa-w-14" style="height: 20px;  width: 20px; vertical-align: middle;"   aria-hidden="true"></i> ' +
														'&nbsp;' +
														extractedAnswer;
												} else if (
													that.template.sections[textIndex].dashboard[i].obj.listOptions == 6
												) {
													answer =
														answer +
														'<i class="fa fa-check-square fa-w-14" style="height: 20px;  width: 20px; vertical-align: middle;"  aria-hidden="true"></i>' +
														'&nbsp;' +
														extractedAnswer +
														'&nbsp;&nbsp;&nbsp;';
												} else {
													answer =
														answer +
														extractedAnswer +
														' ';
												}
											} else {
												if (that.template.sections[checkIndex].dashboard[k].obj.OptionView == 1) {
													if (simpleListCountComponent == 1) {
														answer =
															answer +
															extractedAnswer;
													} else {
														answer =
															answer +
															'<br>' +
															extractedAnswer;
													}
													simpleListCountComponent++;
												} else if (
													that.template.sections[checkIndex].dashboard[k].obj.OptionView == 2
												) {
													if (bulletListCountComponent == 1) {
														answer =
															answer +
															'\u2022 ' +
															extractedAnswer;
													} else {
														answer =
															answer +
															'<br>' +
															'\u2022 ' +
															extractedAnswer;
													}
													bulletListCountComponent++;
												} else if (
													that.template.sections[checkIndex].dashboard[k].obj.OptionView == 3
												) {
													if (orderedListCountComponent == 1) {
														answer =
															answer +
															orderedListCountComponent +
															'. ' +
															extractedAnswer;
													} else {
														answer =
															answer +
															'<br>' +
															orderedListCountComponent +
															'. ' +
															extractedAnswer;
													}
													orderedListCountComponent++;
												} else if (
													that.template.sections[checkIndex].dashboard[k].obj.OptionView == 4
												) {
													if (
														l <
														that.template.sections[checkIndex].dashboard[k].obj.answers.length - 1
													) {
														answer =
															answer +
															extractedAnswer +
															', ';
													} else {
														answer =
															answer +
															extractedAnswer;
													}
												} else if (
													that.template.sections[checkIndex].dashboard[k].obj.OptionView == 5
												) {
													answer =
														answer +
														'<br>' +
														'<i class="fa fa-check-square fa-w-14" style="height: 20px;  width: 20px; vertical-align: middle;"   aria-hidden="true"></i> ' +
														'&nbsp;' +
														extractedAnswer;
												} else if (
													that.template.sections[checkIndex].dashboard[k].obj.OptionView == 6
												) {
													answer =
														answer +
														'<i class="fa fa-check-square fa-w-14" style="height: 20px;  width: 20px; vertical-align: middle;"  aria-hidden="true"></i>' +
														'&nbsp;' +
														extractedAnswer +
														'&nbsp;&nbsp;&nbsp;';
												} else {
													answer =
														answer +
														extractedAnswer +
														' ';
												}
											}
										}
									} else {
										let tempTextAnswer =
											that.template.sections[checkIndex].dashboard[k].obj.instanceStatement;
										if (!that.template.sections[checkIndex].dashboard[k].obj.OptionView) {
											if (that.template.sections[textIndex].dashboard[i].obj.listOptions == 1) {
												if (simpleListCount == 1) {
													answer = answer + tempTextAnswer;
												} else {
													answer = answer + '<br>' + tempTextAnswer;
												}
												simpleListCount++;
											} else if (
												that.template.sections[textIndex].dashboard[i].obj.listOptions == 2
											) {
												if (bulletListCount == 1) {
													answer = answer + '\u2022 ' + tempTextAnswer;
												} else {
													answer = answer + '<br>' + '\u2022 ' + tempTextAnswer;
												}
												bulletListCount++;
											} else if (
												that.template.sections[textIndex].dashboard[i].obj.listOptions == 3
											) {
												if (orderedListCount == 1) {
													answer = answer + orderedListCount + '. ' + tempTextAnswer;
												} else {
													answer = answer + '<br>' + orderedListCount + '. ' + tempTextAnswer;
												}
												orderedListCount++;
											} else if (
												that.template.sections[textIndex].dashboard[i].obj.listOptions == 4
											) {
												if (!intermediateStringCheck) {
													commaAdded = true;
													answer = answer + tempTextAnswer + ', ';
													lastItem = answer + tempTextAnswer + ', ';
												} else {
													commaAdded = false;
													answer = answer + tempTextAnswer;
												}
											} else if (
												that.template.sections[textIndex].dashboard[i].obj.listOptions == 5
											) {
												answer =
													answer +
													'<br>' +
													'<i class="fa fa-check-square fa-w-14" style="height: 20px;  width: 20px; vertical-align: middle;"   aria-hidden="true"></i> ' +
													'&nbsp;' +
													tempTextAnswer;
											} else if (
												that.template.sections[textIndex].dashboard[i].obj.listOptions == 6
											) {
												answer =
													answer +
													'<i class="fa fa-check-square fa-w-14" style="height: 20px;  width: 20px; vertical-align: middle;"  aria-hidden="true"></i>' +
													'&nbsp;' +
													tempTextAnswer +
													'&nbsp;&nbsp;&nbsp;';
											} else {
												answer = answer + tempTextAnswer + ' ';
											}
										} else {
											if (that.template.sections[checkIndex].dashboard[k].obj.OptionView == 1) {
												if (simpleListCountComponent == 1) {
													answer = answer + tempTextAnswer;
												} else {
													answer = answer + '<br>' + tempTextAnswer;
												}
												simpleListCountComponent++;
											} else if (
												that.template.sections[checkIndex].dashboard[k].obj.OptionView == 2
											) {
												if (bulletListCountComponent == 1) {
													answer = answer + '\u2022 ' + tempTextAnswer;
												} else {
													answer = answer + '<br>' + '\u2022 ' + tempTextAnswer;
												}
												bulletListCountComponent++;
											} else if (
												that.template.sections[checkIndex].dashboard[k].obj.OptionView == 3
											) {
												if (orderedListCountComponent == 1) {
													answer = answer + orderedListCountComponent + '. ' + tempTextAnswer;
												} else {
													answer =
														answer + '<br>' + orderedListCountComponent + '. ' + tempTextAnswer;
												}
												orderedListCountComponent++;
											} else if (
												that.template.sections[checkIndex].dashboard[k].obj.OptionView == 4
											) {
												answer = answer + tempTextAnswer;
											} else if (
												that.template.sections[checkIndex].dashboard[k].obj.OptionView == 5
											) {
												answer =
													answer +
													'<br>' +
													'<i class="fa fa-check-square fa-w-14" style="height: 20px;  width: 20px; vertical-align: middle;"   aria-hidden="true"></i> ' +
													'&nbsp;' +
													tempTextAnswer;
											} else if (
												that.template.sections[checkIndex].dashboard[k].obj.OptionView == 6
											) {
												answer =
													answer +
													'<i class="fa fa-check-square fa-w-14" style="height: 20px;  width: 20px; vertical-align: middle;"  aria-hidden="true"></i>' +
													'&nbsp;' +
													tempTextAnswer +
													'&nbsp;&nbsp;&nbsp;';
											} else {
												answer = answer + tempTextAnswer + ' ';
											}
										}
									}

									if (!that.template.sections[checkIndex].dashboard[k].obj.OptionView) {
										if (that.template.sections[textIndex].dashboard[i].obj.listOptions == 2) {
											answer = answer + '</ul>';
										}
									} else {
										if (that.template.sections[checkIndex].dashboard[k].obj.listOptions == 2) {
											answer = answer + '</ul>';
										}
									}

									arr[j] = answer;
									if (that.template.sections[textIndex].dashboard[i].obj.isBold) {
										arr[j] = '<b>' + arr[j] + '</b>';
									}
									if (that.template.sections[textIndex].dashboard[i].obj.isItalic) {
										arr[j] = '<i>' + arr[j] + '</i>';
									}
									if (that.template.sections[textIndex].dashboard[i].obj.isUnderline) {
										arr[j] = '<u>' + arr[j] + '</u>';
									}

									that.template.sections[textIndex].dashboard[i].obj['instanceStatement'] =
										that.template.sections[textIndex].dashboard[i].obj['instanceStatement'].replace(
											'@' + that.template.sections[checkIndex].dashboard[k].obj.uicomponent_name,
											arr[j],
										);
									this.refreshObject(that.template.sections[textIndex].dashboard[i].obj);
								} else if (
									arr[j] == that.template.sections[checkIndex].dashboard[k].obj.uicomponent_name &&
									!(
										that.template.sections[checkIndex].linked_component == 0 ||
										that.template.sections[checkIndex].selected_linked_component ===
											that.template.sections[checkIndex].linked_component
									)
								) {
									arr[j] = '';

									that.template.sections[textIndex].dashboard[i].obj['instanceStatement'] =
										that.template.sections[textIndex].dashboard[i].obj['instanceStatement'].replace(
											'@' + that.template.sections[checkIndex].dashboard[k].obj.uicomponent_name,
											arr[j],
										);
									this.refreshObject(that.template.sections[textIndex].dashboard[i].obj);
								}
							}
						}
					}
				}
				if (lastItem.length && commaAdded) {
					let tempReplacement = lastItem.slice(0, -2);
					that.template.sections[textIndex].dashboard[i].obj['instanceStatement'] = this.rreplace(
						that.template.sections[textIndex].dashboard[i].obj['instanceStatement'],
						lastItem,
						tempReplacement
					);
					this.refreshObject(that.template.sections[textIndex].dashboard[i].obj);
				}
				if (that.template.sections[textIndex].dashboard[i]?.obj?.options?.length) {
					for (let option of that.template.sections[textIndex].dashboard[i].obj.options) {
						let tempStatementOption = option.label || '';
						option['instanceLabel'] = tempStatementOption;
						arr = tempStatementOption.match(/@[0-9]+/g);

						let tempStatementComment = option.inputValue || '';
						option['instanceInputValue'] = tempStatementComment;
						let arrComments = tempStatementComment.match(/@[0-9]+/g);
						let orderedListCountOption = 1;
						let bulletListCountOption = 1;
						let simpleListCountOption = 1;
						let lastItemOption = '';
						let firstItemOptionCheck = true;
						for (let j = 0; arr && j < arr.length; j++) {
							let intermediateStringCheck = false;
							if (arr[j][0] == '@') {
								arr[j] = arr[j].replace('@', '');
								for (let checkIndex = 0; checkIndex < that.template.sections.length; checkIndex++) {
									for (let k = 0; k < that.template.sections[checkIndex].dashboard.length; k++) {
										let orderedListCountComponent = 1;
										let simpleListCountComponent = 1;
										let bulletListCountComponent = 1;
										if (
											arr[j] ==
												that.template.sections[checkIndex].dashboard[k].obj.uicomponent_name &&
											(that.template.sections[checkIndex].linked_component == 0 ||
												that.template.sections[checkIndex].selected_linked_component ===
													that.template.sections[checkIndex].linked_component) &&
											!(checkIndex == textIndex && i == k)
										) {
											let answer = '';
											if (that.template.sections[checkIndex].dashboard[k].obj.OptionView) {
												if (
													that.template.sections[checkIndex].dashboard[k].obj.OptionView == 1 ||
													that.template.sections[checkIndex].dashboard[k].obj.OptionView == 3
												) {
													answer = '<br>';
												}
												if (that.template.sections[checkIndex].dashboard[k].obj.OptionView == 2) {
													answer =
														'<ul style="line-height:1.3;padding:0em 0em 0em 0em; margin:0px 0px 0px 20px;">';
												}
											}
											if (that.template.sections[checkIndex].dashboard[k].obj.type != 'text') {
												for (
													let l = 0;
													l < that.template.sections[checkIndex].dashboard[k].obj.answers.length;
													l++
												) {
													const extractedAnswer = this.extractAnswerFromComponent(that.template.sections[checkIndex].dashboard[k], that.template.sections[checkIndex].dashboard[k].obj.answers[l]?.answer ?? '')
													if (!that.template.sections[checkIndex].dashboard[k].obj.OptionView) {
														if (
															that.template.sections[textIndex].dashboard[i].obj.listOptions == 1
														) {
															if (simpleListCountOption == 1) {
																answer =
																	answer +
																	extractedAnswer;
															} else {
																answer =
																	answer +
																	'<br>' +
																	extractedAnswer;
															}
															simpleListCountOption++;
														} else if (
															that.template.sections[textIndex].dashboard[i].obj.listOptions == 2
														) {
															if (bulletListCountOption == 1) {
																answer =
																	answer +
																	'\u2022 ' +
																	extractedAnswer;
															} else {
																answer =
																	answer +
																	'<br>' +
																	'\u2022 ' +
																	extractedAnswer;
															}
															bulletListCountOption++;
														} else if (
															that.template.sections[textIndex].dashboard[i].obj.listOptions == 3
														) {
															if (orderedListCountOption == 1) {
																answer =
																	answer +
																	orderedListCountOption +
																	'. ' +
																	extractedAnswer;
															} else {
																answer =
																	answer +
																	'<br>' +
																	orderedListCountOption +
																	'. ' +
																	extractedAnswer;
															}
															orderedListCountOption++;
														} else if (
															that.template.sections[textIndex].dashboard[i].obj.listOptions == 4
														) {
															if (
																!intermediateStringCheck ||
																l <
																	that.template.sections[checkIndex].dashboard[k].obj.answers
																		.length -
																		1
															) {
																commaAdded = true;
																answer =
																	answer +
																	extractedAnswer +
																	', ';
																lastItemOption =
																	extractedAnswer + ', ';
															} else {
																commaAdded = false;
																answer =
																	answer +
																	extractedAnswer;
																lastItemOption =
																	extractedAnswer;
															}
														} else if (
															that.template.sections[textIndex].dashboard[i].obj.listOptions == 5
														) {
															answer =
																answer +
																'<br>' +
																'<i class="fa fa-check-square fa-w-14" style="height: 20px;  width: 20px; vertical-align: middle;"   aria-hidden="true"></i> ' +
																'&nbsp;' +
																extractedAnswer;
														} else if (
															that.template.sections[textIndex].dashboard[i].obj.listOptions == 6
														) {
															answer =
																answer +
																'<i class="fa fa-check-square fa-w-14" style="height: 20px;  width: 20px; vertical-align: middle;"  aria-hidden="true"></i>' +
																'&nbsp;' +
																extractedAnswer +
																'&nbsp;&nbsp;&nbsp;';
														} else {
															answer =
																answer +
																extractedAnswer +
																' ';
														}
													} else {
														if (
															that.template.sections[checkIndex].dashboard[k].obj.OptionView == 1
														) {
															if (simpleListCountComponent == 1) {
																answer =
																	answer +
																	extractedAnswer;
															} else {
																answer =
																	answer +
																	'<br>' +
																	extractedAnswer;
															}
															simpleListCountComponent++;
														} else if (
															that.template.sections[checkIndex].dashboard[k].obj.OptionView == 2
														) {
															answer =
																answer +
																'<li>' +
																extractedAnswer +
																'</li>';
															if (bulletListCountComponent == 1) {
																answer =
																	answer +
																	'\u2022 ' +
																	extractedAnswer;
															} else {
																answer =
																	answer +
																	'<br>' +
																	'\u2022 ' +
																	extractedAnswer;
															}
															bulletListCountComponent++;
														} else if (
															that.template.sections[checkIndex].dashboard[k].obj.OptionView == 3
														) {
															if (orderedListCountComponent == 1) {
																answer =
																	answer +
																	orderedListCountComponent +
																	'. ' +
																	extractedAnswer;
															} else {
																answer =
																	answer +
																	'<br>' +
																	orderedListCountComponent +
																	'. ' +
																	extractedAnswer;
															}
															orderedListCountComponent++;
														} else if (
															that.template.sections[checkIndex].dashboard[k].obj.OptionView == 4
														) {
															if (
																l <
																that.template.sections[checkIndex].dashboard[k].obj.answers.length -
																	1
															) {
																answer =
																	answer +
																	extractedAnswer +
																	', ';
															} else {
																answer =
																	answer +
																	extractedAnswer;
															}
														} else if (
															that.template.sections[checkIndex].dashboard[k].obj.OptionView == 5
														) {
															answer =
																answer +
																'<br>' +
																'<i class="fa fa-check-square fa-w-14" style="height: 20px;  width: 20px; vertical-align: middle;"   aria-hidden="true"></i> ' +
																'&nbsp;' +
																extractedAnswer;
														} else if (
															that.template.sections[checkIndex].dashboard[k].obj.OptionView == 6
														) {
															answer =
																answer +
																'<i class="fa fa-check-square fa-w-14" style="height: 20px;  width: 20px; vertical-align: middle;"  aria-hidden="true"></i>' +
																'&nbsp;' +
																extractedAnswer +
																'&nbsp;&nbsp;&nbsp;';
														} else {
															answer =
																answer +
																extractedAnswer +
																' ';
														}
													}
												}
											} else {
												let tempTextAnswer =
													that.template.sections[checkIndex].dashboard[k].obj.instanceStatement ||
													'';
												if (!that.template.sections[checkIndex].dashboard[k].obj.OptionView) {
													if (that.template.sections[textIndex].dashboard[i].obj.listOptions == 1) {
														if (simpleListCountOption == 1) {
															answer = answer + tempTextAnswer;
														} else {
															answer = answer + '<br>' + tempTextAnswer;
														}
														simpleListCountOption++;
													} else if (
														that.template.sections[textIndex].dashboard[i].obj.listOptions == 2
													) {
														if (bulletListCountOption == 1) {
															answer = answer + '\u2022 ' + tempTextAnswer;
														} else {
															answer = answer + '<br>' + '\u2022 ' + tempTextAnswer;
														}
														bulletListCountOption++;
													} else if (
														that.template.sections[textIndex].dashboard[i].obj.listOptions == 3
													) {
														if (orderedListCountOption == 1) {
															answer = answer + orderedListCountOption + '. ' + tempTextAnswer;
														} else {
															answer =
																answer + '<br>' + orderedListCountOption + '. ' + tempTextAnswer;
														}
														orderedListCountOption++;
													} else if (
														that.template.sections[textIndex].dashboard[i].obj.listOptions == 4
													) {
														if (!intermediateStringCheck) {
															commaAdded = true;
															answer = answer + tempTextAnswer + ', ';
															lastItemOption = answer + tempTextAnswer + ', ';
														} else {
															commaAdded = false;
															answer = answer + tempTextAnswer;
														}
													} else if (
														that.template.sections[textIndex].dashboard[i].obj.listOptions == 5
													) {
														answer =
															answer +
															'<br>' +
															'<i class="fa fa-check-square fa-w-14" style="height: 20px;  width: 20px; vertical-align: middle;"   aria-hidden="true"></i> ' +
															'&nbsp;' +
															tempTextAnswer;
													} else if (
														that.template.sections[textIndex].dashboard[i].obj.listOptions == 6
													) {
														answer =
															answer +
															'<i class="fa fa-check-square fa-w-14" style="height: 20px;  width: 20px; vertical-align: middle;"  aria-hidden="true"></i>' +
															'&nbsp;' +
															tempTextAnswer +
															'&nbsp;&nbsp;&nbsp;';
													} else {
														answer = answer + tempTextAnswer + ' ';
													}
												} else {
													if (that.template.sections[checkIndex].dashboard[k].obj.OptionView == 1) {
														if (simpleListCountComponent == 1) {
															answer = answer + tempTextAnswer;
														} else {
															answer = answer + '<br>' + tempTextAnswer;
														}
														simpleListCountComponent++;
													} else if (
														that.template.sections[checkIndex].dashboard[k].obj.OptionView == 2
													) {
														if (bulletListCountComponent == 1) {
															answer = answer + '\u2022 ' + tempTextAnswer;
														} else {
															answer = answer + '<br>' + '\u2022 ' + tempTextAnswer;
														}
														bulletListCountComponent++;
													} else if (
														that.template.sections[checkIndex].dashboard[k].obj.OptionView == 3
													) {
														if (orderedListCountComponent == 1) {
															answer = answer + orderedListCountComponent + '. ' + tempTextAnswer;
														} else {
															answer =
																answer + '<br>' + orderedListCountComponent + '. ' + tempTextAnswer;
														}
														orderedListCountComponent++;
													} else if (
														that.template.sections[checkIndex].dashboard[k].obj.OptionView == 4
													) {
														answer = answer + tempTextAnswer;
													} else if (
														that.template.sections[checkIndex].dashboard[k].obj.OptionView == 5
													) {
														answer =
															answer +
															'<br>' +
															'<i class="fa fa-check-square fa-w-14" style="height: 20px;  width: 20px; vertical-align: middle;"   aria-hidden="true"></i> ' +
															'&nbsp;' +
															tempTextAnswer;
													} else if (
														that.template.sections[checkIndex].dashboard[k].obj.OptionView == 6
													) {
														answer =
															answer +
															'<i class="fa fa-check-square fa-w-14" style="height: 20px;  width: 20px; vertical-align: middle;"  aria-hidden="true"></i>' +
															'&nbsp;' +
															tempTextAnswer +
															'&nbsp;&nbsp;&nbsp;';
													} else {
														answer = answer + tempTextAnswer + ' ';
													}
												}
											}
											if (that.template.sections[textIndex].dashboard[i].obj.listOptions == 2) {
												answer = answer + '</ul>';
											}

											arr[j] = answer;
											if (option.isBold) {
												arr[j] = '<b>' + arr[j] + '</b>';
											}
											if (option.isItalic) {
												arr[j] = '<i>' + arr[j] + '</i>';
											}
											if (option.isUnderline) {
												arr[j] = '<u>' + arr[j] + '</u>';
											}

											option['instanceLabel'] = option['instanceLabel'].replace(
												'@' + that.template.sections[checkIndex].dashboard[k].obj.uicomponent_name,
												arr[j],
											);
											this.refreshObject(that.template.sections[textIndex].dashboard[i].obj);
										} else if (
											arr[j] ==
												that.template.sections[checkIndex].dashboard[k].obj.uicomponent_name &&
											!(
												that.template.sections[checkIndex].linked_component == 0 ||
												that.template.sections[checkIndex].selected_linked_component ===
													that.template.sections[checkIndex].linked_component
											)
										) {
											arr[j] = '';

											option['instanceLabel'] = option['instanceLabel'].replace(
												'@' + that.template.sections[checkIndex].dashboard[k].obj.uicomponent_name,
												arr[j],
											);
											this.refreshObject(that.template.sections[textIndex].dashboard[i].obj);
										}
									}
								}
							}
						}

						for (
							let commentsItemIndex = 0;
							arrComments && commentsItemIndex < arrComments.length;
							commentsItemIndex++
						) {
							let intermediateStringCheck = false;
							if (arrComments[commentsItemIndex][0] == '@') {
								arrComments[commentsItemIndex] = arrComments[commentsItemIndex].replace('@', '');
								for (let checkIndex = 0; checkIndex < that.template.sections.length; checkIndex++) {
									for (let k = 0; k < that.template.sections[checkIndex].dashboard.length; k++) {
										let orderedListCountComponent = 1;
										let simpleListCountComponent = 1;
										let bulletListCountComponent = 1;
										if (
											arrComments[commentsItemIndex] ==
												that.template.sections[checkIndex].dashboard[k].obj.uicomponent_name &&
											(that.template.sections[checkIndex].linked_component == 0 ||
												that.template.sections[checkIndex].selected_linked_component ===
													that.template.sections[checkIndex].linked_component) &&
											!(checkIndex == textIndex && i == k)
										) {
											let answer = '';
											if (that.template.sections[checkIndex].dashboard[k].obj.OptionView) {
												if (
													that.template.sections[checkIndex].dashboard[k].obj.OptionView == 1 ||
													that.template.sections[checkIndex].dashboard[k].obj.OptionView == 3
												) {
													answer = '<br>';
												}
												if (that.template.sections[checkIndex].dashboard[k].obj.OptionView == 2) {
													answer =
														'<ul style="line-height:1.3;padding:0em 0em 0em 0em; margin:0px 0px 0px 20px;">';
												}
											}
											if (that.template.sections[checkIndex].dashboard[k].obj.type != 'text') {
												for (
													let l = 0;
													l < that.template.sections[checkIndex].dashboard[k].obj.answers.length;
													l++
												) {
													const extractedAnswer = this.extractAnswerFromComponent(that.template.sections[checkIndex].dashboard[k], that.template.sections[checkIndex].dashboard[k].obj.answers[l]?.answer ?? '')
													if (!that.template.sections[checkIndex].dashboard[k].obj.OptionView) {
														if (
															that.template.sections[textIndex].dashboard[i].obj.listOptions == 1
														) {
															if (simpleListCountOption == 1) {
																answer = answer + extractedAnswer;
															} else {
																answer =
																	answer +
																	'<br>' +
																	extractedAnswer;
															}
															simpleListCountOption++;
														} else if (
															that.template.sections[textIndex].dashboard[i].obj.listOptions == 2
														) {
															if (bulletListCountOption == 1) {
																answer =
																	answer +
																	'\u2022 ' +
																	extractedAnswer;
															} else {
																answer =
																	answer +
																	'<br>' +
																	'\u2022 ' +
																	extractedAnswer;
															}
															bulletListCountOption++;
														} else if (
															that.template.sections[textIndex].dashboard[i].obj.listOptions == 3
														) {
															if (orderedListCountOption == 1) {
																answer =
																	answer +
																	orderedListCountOption +
																	'. ' +
																	extractedAnswer;
															} else {
																answer =
																	answer +
																	'<br>' +
																	orderedListCountOption +
																	'. ' +
																	extractedAnswer;
															}
															orderedListCountOption++;
														} else if (
															that.template.sections[textIndex].dashboard[i].obj.listOptions == 4
														) {
															if (
																!intermediateStringCheck ||
																l <
																	that.template.sections[checkIndex].dashboard[k].obj.answers
																		.length -
																		1
															) {
																commaAdded = true;
																answer =
																	answer +
																	extractedAnswer +
																	', ';
																lastItemOption =
																extractedAnswer + ', ';
															} else {
																commaAdded = false;
																answer = answer + extractedAnswer;
																lastItemOption = extractedAnswer;
															}
														} else if (
															that.template.sections[textIndex].dashboard[i].obj.listOptions == 5
														) {
															answer =
																answer +
																'<br>' +
																'<i class="fa fa-check-square fa-w-14" style="height: 20px;  width: 20px; vertical-align: middle;"   aria-hidden="true"></i> ' +
																'&nbsp;' + extractedAnswer;
														} else if (
															that.template.sections[textIndex].dashboard[i].obj.listOptions == 6
														) {
															answer =
																answer +
																'<i class="fa fa-check-square fa-w-14" style="height: 20px;  width: 20px; vertical-align: middle;"  aria-hidden="true"></i>' +
																'&nbsp;' +
																extractedAnswer +
																'&nbsp;&nbsp;&nbsp;';
														} else {
															answer =
																answer +
																extractedAnswer +
																' ';
														}
													} else {
														if (
															that.template.sections[checkIndex].dashboard[k].obj.OptionView == 1
														) {
															if (simpleListCountComponent == 1) {
																answer =
																	answer +
																	extractedAnswer;
															} else {
																answer =
																	answer +
																	'<br>' +
																	extractedAnswer;
															}
															simpleListCountComponent++;
														} else if (
															that.template.sections[checkIndex].dashboard[k].obj.OptionView == 2
														) {
															answer =
																answer +
																'<li>' +
																extractedAnswer +
																'</li>';
															if (bulletListCountComponent == 1) {
																answer =
																	answer +
																	'\u2022 ' +
																	extractedAnswer;
															} else {
																answer =
																	answer +
																	'<br>' +
																	'\u2022 ' +
																	extractedAnswer;
															}
															bulletListCountComponent++;
														} else if (
															that.template.sections[checkIndex].dashboard[k].obj.OptionView == 3
														) {
															if (orderedListCountComponent == 1) {
																answer =
																	answer +
																	orderedListCountComponent +
																	'. ' +
																	extractedAnswer;
															} else {
																answer =
																	answer +
																	'<br>' +
																	orderedListCountComponent +
																	'. ' +
																	extractedAnswer;
															}
															orderedListCountComponent++;
														} else if (
															that.template.sections[checkIndex].dashboard[k].obj.OptionView == 4
														) {
															if (
																l <
																that.template.sections[checkIndex].dashboard[k].obj.answers.length -
																	1
															) {
																answer =
																	answer +
																	extractedAnswer +
																	', ';
															} else {
																answer =
																	answer +
																	extractedAnswer;
															}
														} else if (
															that.template.sections[checkIndex].dashboard[k].obj.OptionView == 5
														) {
															answer =
																answer +
																'<br>' +
																'<i class="fa fa-check-square fa-w-14" style="height: 20px;  width: 20px; vertical-align: middle;"   aria-hidden="true"></i> ' +
																'&nbsp;' +
																extractedAnswer;
														} else if (
															that.template.sections[checkIndex].dashboard[k].obj.OptionView == 6
														) {
															answer =
																answer +
																'<i class="fa fa-check-square fa-w-14" style="height: 20px;  width: 20px; vertical-align: middle;"  aria-hidden="true"></i>' +
																'&nbsp;' +
																extractedAnswer +
																'&nbsp;&nbsp;&nbsp;';
														} else {
															answer =
																answer +
																extractedAnswer +
																' ';
														}
													}
												}
											} else {
												let tempTextAnswer =
													that.template.sections[checkIndex].dashboard[k].obj.instanceStatement;
												if (!that.template.sections[checkIndex].dashboard[k].obj.OptionView) {
													if (that.template.sections[textIndex].dashboard[i].obj.listOptions == 1) {
														if (simpleListCountOption == 1) {
															answer = answer + tempTextAnswer;
														} else {
															answer = answer + '<br>' + tempTextAnswer;
														}
														simpleListCountOption++;
													} else if (
														that.template.sections[textIndex].dashboard[i].obj.listOptions == 2
													) {
														if (bulletListCountOption == 1) {
															answer = answer + '\u2022 ' + tempTextAnswer;
														} else {
															answer = answer + '<br>' + '\u2022 ' + tempTextAnswer;
														}
														bulletListCountOption++;
													} else if (
														that.template.sections[textIndex].dashboard[i].obj.listOptions == 3
													) {
														if (orderedListCountOption == 1) {
															answer = answer + orderedListCountOption + '. ' + tempTextAnswer;
														} else {
															answer =
																answer + '<br>' + orderedListCountOption + '. ' + tempTextAnswer;
														}
														orderedListCountOption++;
													} else if (
														that.template.sections[textIndex].dashboard[i].obj.listOptions == 4
													) {
														if (!intermediateStringCheck) {
															commaAdded = true;
															answer = answer + tempTextAnswer + ', ';
															lastItemOption = answer + tempTextAnswer + ', ';
														} else {
															commaAdded = false;
															answer = answer + tempTextAnswer;
														}
													} else if (
														that.template.sections[textIndex].dashboard[i].obj.listOptions == 5
													) {
														answer =
															answer +
															'<br>' +
															'<i class="fa fa-check-square fa-w-14" style="height: 20px;  width: 20px; vertical-align: middle;"   aria-hidden="true"></i> ' +
															'&nbsp;' +
															tempTextAnswer;
													} else if (
														that.template.sections[textIndex].dashboard[i].obj.listOptions == 6
													) {
														answer =
															answer +
															'<i class="fa fa-check-square fa-w-14" style="height: 20px;  width: 20px; vertical-align: middle;"  aria-hidden="true"></i>' +
															'&nbsp;' +
															tempTextAnswer +
															'&nbsp;&nbsp;&nbsp;';
													} else {
														answer = answer + tempTextAnswer + ' ';
													}
												} else {
													if (that.template.sections[checkIndex].dashboard[k].obj.OptionView == 1) {
														if (simpleListCountComponent == 1) {
															answer = answer + tempTextAnswer;
														} else {
															answer = answer + '<br>' + tempTextAnswer;
														}
														simpleListCountComponent++;
													} else if (
														that.template.sections[checkIndex].dashboard[k].obj.OptionView == 2
													) {
														if (bulletListCountComponent == 1) {
															answer = answer + '\u2022 ' + tempTextAnswer;
														} else {
															answer = answer + '<br>' + '\u2022 ' + tempTextAnswer;
														}
														bulletListCountComponent++;
													} else if (
														that.template.sections[checkIndex].dashboard[k].obj.OptionView == 3
													) {
														if (orderedListCountComponent == 1) {
															answer = answer + orderedListCountComponent + '. ' + tempTextAnswer;
														} else {
															answer =
																answer + '<br>' + orderedListCountComponent + '. ' + tempTextAnswer;
														}
														orderedListCountComponent++;
													} else if (
														that.template.sections[checkIndex].dashboard[k].obj.OptionView == 4
													) {
														answer = answer + tempTextAnswer;
													} else if (
														that.template.sections[checkIndex].dashboard[k].obj.OptionView == 5
													) {
														answer =
															answer +
															'<br>' +
															'<i class="fa fa-check-square fa-w-14" style="height: 20px;  width: 20px; vertical-align: middle;"   aria-hidden="true"></i> ' +
															'&nbsp;' +
															tempTextAnswer;
													} else if (
														that.template.sections[checkIndex].dashboard[k].obj.OptionView == 6
													) {
														answer =
															answer +
															'<i class="fa fa-check-square fa-w-14" style="height: 20px;  width: 20px; vertical-align: middle;"  aria-hidden="true"></i>' +
															'&nbsp;' +
															tempTextAnswer +
															'&nbsp;&nbsp;&nbsp;';
													} else {
														answer = answer + tempTextAnswer + ' ';
													}
												}
											}
											if (that.template.sections[textIndex].dashboard[i].obj.listOptions == 2) {
												answer = answer + '</ul>';
											}

											arrComments[commentsItemIndex] = answer;
											if (option.isBold) {
												arrComments[commentsItemIndex] =
													'<b>' + arrComments[commentsItemIndex] + '</b>';
											}
											if (option.isItalic) {
												arrComments[commentsItemIndex] =
													'<i>' + arrComments[commentsItemIndex] + '</i>';
											}
											if (option.isUnderline) {
												arrComments[commentsItemIndex] =
													'<u>' + arrComments[commentsItemIndex] + '</u>';
											}

											option['instanceInputValue'] = option['instanceInputValue'].replace(
												'@' + that.template.sections[checkIndex].dashboard[k].obj.uicomponent_name,
												arrComments[commentsItemIndex],
											);
											this.refreshObject(that.template.sections[textIndex].dashboard[i].obj);
										} else if (
											arrComments[commentsItemIndex] ==
												that.template.sections[checkIndex].dashboard[k].obj.uicomponent_name &&
											!(
												that.template.sections[checkIndex].linked_component == 0 ||
												that.template.sections[checkIndex].selected_linked_component ===
													that.template.sections[checkIndex].linked_component
											)
										) {
											arrComments[commentsItemIndex] = '';

											option['instanceInputValue'] = option['instanceInputValue'].replace(
												'@' + that.template.sections[checkIndex].dashboard[k].obj.uicomponent_name,
												arrComments[commentsItemIndex],
											);
											this.refreshObject(that.template.sections[textIndex].dashboard[i].obj);
										}
									}
								}
							}
						}
						if (lastItemOption.length && commaAdded) {
							let tempReplacement = lastItemOption.slice(0, -2);
							that.template.sections[textIndex].dashboard[i].obj['instanceStatement'] =
								this.rreplace(
									that.template.sections[textIndex].dashboard[i].obj['instanceStatement'],
									lastItemOption,
									tempReplacement
								);
							this.refreshObject(that.template.sections[textIndex].dashboard[i].obj);
						}
					}
				}
				this.refreshObject(that.template.sections[textIndex].dashboard[i].obj);
			}
		}
	}

	private getImageStyling(shouldUnderline: boolean, width: number): string {
		const widthString = width>=0 ? `width: ${width}%; height: auto;`: "width: 100%;" 
		const underlineString = shouldUnderline ? 'border-bottom: 1px solid black;': ''
		return `class="align-self-center" style="${widthString} ${underlineString}"`
	}

	private extractAnswerFromComponent(component: any, answer: string){
		if([UI_COMPONENT_TYPES.SIGNATURE, UI_COMPONENT_TYPES.DRAWING].includes(component.obj.type)) {
			return `<img ${this.getImageStyling(component.obj.underlineSignature, component.obj.width)} src=${answer}>`
		}
		return answer

	}

	delay(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	stripBlankLines(statement: string) {
		statement = statement.replace(/(<div><br><\/div>)+$|(<br>)+$|(&nbsp;)+$|( )+$/g, '');
		return statement.replace(/^\s*[\r\n]/g, '');
	}

	stripEditorHTML(st) {
		for (let q = 1; q < 8; q++) {
			st = st.replaceAll('<font size="' + q + '">', '');
		}
		st = st.replaceAll(/<\/?[biu]>/g, '');
		st = st.replaceAll('<span style="text-align: left;">', '');
		st = st.replaceAll('</span>', '');
		st = st.replaceAll('<span style="text-align: right;">', '');
		st = st.replaceAll('<span style="text-align: center;">', '');
		st = st.replaceAll('<span style="text-align: justify;">', '');

		st = st.replaceAll('<div style="text-align: left;">', '');
		st = st.replaceAll('</div>', '');
		st = st.replaceAll('<div style="text-align: right;">', '');
		st = st.replaceAll('<div style="text-align: center;">', '');
		st = st.replaceAll('<div style="text-align: justify;">', '');
		return st;
	}

	applyEditor(object, st) {
		if ('textLabel' in object) {
			object.textLabel = this.stripHtml(object.instanceLabel);
		} else if (object.isStatement === false && st.length === 0) {
			return st;
		}
		st = this.stripEditorHTML(st);
		if (object.fontSize) {
			if (object.fontSize) {
				st = '<font size="' + object.fontSize + '">' + st + '</font>';
			}
		}
		if (object.isBold) {
			st = '<b>' + st + '</b>';
		}
		if (object.isItalic) {
			st = '<i>' + st + '</i>';
		}
		if (object.isUnderLine) {
			st = '<u>' + st + '</u>';
		}
		if (object.isAlign == 1) {
			st = '<span style="text-align: left;">' + st + '</span>';
		}
		if (object.isAlign == 2) {
			st = '<span style="text-align: center;">' + st + '</span>';
		}
		if (object.isAlign == 3) {
			st = '<span style="text-align: right;">' + st + '</span>';
		}
		if (object.isJustify) {
			st = '<span style="text-align: justify;">' + st + '</span>';
		}
		if (object.type === UI_COMPONENT_TYPES.INTENSITY) {
			st = st.replaceAll('span', 'div');
		}
		return st;
	}
}
