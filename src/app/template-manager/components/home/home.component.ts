import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ViewChild,
	OnInit,
	OnDestroy,
	ViewEncapsulation,
	ElementRef,
	Renderer2,
	Inject,
	SecurityContext,
} from '@angular/core';
import {
	DisplayGrid,
	GridsterConfig,
	GridType,
} from '../../shared/gridster/gridsterConfig.interface';
import { GridsterItem } from '../../shared/gridster/gridsterItem.interface';
import { LayoutService, IComponent } from '../../services/layout.service';
import { v4 as UUID } from 'uuid'
import { NgbModal, NgbModalRef, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { SubjectService } from '../../services/subject.service';
import {
	convertDateTimeForRetrieving,
	convertDateTimeForSending,
} from '@appDir/shared/utils/utils.helpers';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { find, pull, cloneDeep } from 'lodash';
import { MainService } from '@appDir/shared/services/main-service';
import { AngularEditorConfig } from '../../shared/angular-editor/config';
import { Options } from '@angular-slider/ngx-slider';
import { SignatureServiceService } from '@appDir/shared/signature/services/signature-service.service';
import { DocumentManagerServiceService } from '@appDir/front-desk/documents/services/document-manager-service.service';
import { NestableSettings } from '../../lib/src/nestable.models';
import { GridsterComponent } from '../../shared/gridster/gridster.component';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TemplatePermissionsComponent } from '../../modals/template-permissions/template-permissions.component';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { StorageData, HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { AlignmentComponent } from '@appDir/template-manager/modals/alignment/alignment.component';
import { CarryForwardComponent } from '@appDir/template-manager/modals/carry-forward/carry-forward.component';
// import { NgxCoolDialogsService } from 'ngx-cool-dialogs';
import { HostListener } from '@angular/core';
import { HeaderComponent } from '../../modals/header/header.component';
import { RequestService } from '@appDir/shared/services/request.service';
import { TemaplateManagerUrlsEnum } from '@appDir/template-manager/template-manager-url-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { TemplateMasterUrlEnum } from '@appDir/front-desk/masters/template-master/template-master-url.enum';
import { AssignSpecialityUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
import { Config } from '@appDir/config/config';
import { AddToBeSchedulledUrlsEnum } from '@appDir/scheduler-front-desk/modules/add-to-be-scheduled/add-to-be-scheduled-list-urls-enum';
import { DoctorCalendarUrlsEnum } from '@appDir/shared/modules/doctor-calendar/doctor-calendar-urls-enum';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import * as moment from 'moment';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { DOCTOR_EVALUATION_SECTION_TYPES, GENERATE_PDF_OPTIONS, signatureTypeObject, SignatureTypesArray, SIGNATURE_TYPES, UI_COMPONENT_TYPES } from '@appDir/template-manager/common/constants';
import { imageLabelProperties, signatureProperties } from '@appDir/template-manager/common/ui-props';
import { isNil } from '@appDir/template-manager/utils/common-utils';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ConfirmationDialogComponent } from '@appDir/template-manager/modals/confirmation-dialog/confirmation-dialog.component';
import { NgbPopoverConfig } from '@ng-bootstrap/ng-bootstrap';
import { ExternalComponent } from '@appDir/template-manager/modals/external-module/external.component';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	providers: [NgbPopoverConfig]
})
export class HomeComponent implements OnInit, OnDestroy {
	public combineStatment: string = '';
	public applyTempId: number = 0;
	public sideBarSection = true;
	tableSubscription: any;
	pdfC43Source: any;
	urlSafe: SafeResourceUrl;
	@HostListener('window:keyup', ['$event'])
	onKeyUp(event: any): void {
		if (event.keyCode === 16) {
			this.shiftPressed = false;
		}
	}
	@HostListener('window:keydown', ['$event'])
	onKeyDown(event: any): void {
		let userSelection;
		if (window.getSelection) {
			userSelection = window.getSelection();
		}
		if (
			event.getModifierState &&
			event.getModifierState('Control') &&
			event.getModifierState('Alt') &&
			(event.keyCode === 67 || event.keyCode === 88)
		) {
			if (
				this.layoutService.lastI != null &&
				this.layoutService.lastK != null &&
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				] &&
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].isClick
			) {
				if (event.keyCode === 67) {
					this.itemCopy(
						this.layoutService.lastI,
						this.layoutService.lastK,
						this.layoutService.template.sections[this.layoutService.lastI].dashboard[
							this.layoutService.lastK
						],
					);
				} else {
					this.itemCut(
						this.layoutService.lastI,
						this.layoutService.lastK,
						this.layoutService.template.sections[this.layoutService.lastI].dashboard[
							this.layoutService.lastK
						],
					);
				}
			} else if (this.selectedSectionIndex != null) {
				this.sectionCopy(this.selectedSectionIndex, false);
			}
		} else if (
			event.getModifierState &&
			event.getModifierState('Control') &&
			event.getModifierState('Alt') &&
			event.keyCode === 86
		) {
			if (Object.keys(this.emptyCellItem)?.length > 0) {
				this.itemPaste(
					this.emptyCellItemIndex.sectionIndex,
					this.emptyCellItemIndex.dashboardIndex,
					this.emptyCellItem,
				);
			} else if (this.selectedSectionIndex != null) {
				this.sectionPaste(this.selectedSectionIndex);
			} else if (this.templatePasteCheck) {
				this.templateSectionPaste();
			}
		} else if (
			event.getModifierState &&
			event.getModifierState('Control') &&
			event.getModifierState('Alt') &&
			event.keyCode === 90
		) {
			this.undoTask();
		} else if (
			event.getModifierState &&
			event.getModifierState('Control') &&
			event.getModifierState('Alt') &&
			event.keyCode === 89
		) {
			this.redoTask();
		} else if (event.keyCode === 16) {
			this.shiftPressed = true;
		} else if (event.keyCode == 27) {
			for (let component of this.selectedComponents) {
				if (
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					]
				) {
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].isClick = false;
				}
			}
			this.selectedComponents = [];
		}
	}
	doctor_signature: any;
	patient_signature: any;
	signatureArr: signatureTypeObject[];
	pa_signature: any;
	templatePasteCheck = false;
	section_id_carry: number = 0;
	@ViewChild('auto') auto;
	@ViewChild('uitag') uitag;
	@ViewChild('tempvals') tempvals;
	shiftPressed = false;
	private myDiv: ElementRef;
	public activeModal: NgbModalRef;
	text = false;
	public templateSaved = false;
	rowAddItems: number = 1;
	rowReduceItems: number = 1;
	optionsList = {
		fixedDepth: false,
	} as NestableSettings;
	list = [];
	editSectionText = false;
	title_value: string = '';
	paraClickCheckSection = false;
	public dragUIComponent = false;
	public header: any;
	public footer: any;
	HeightValue: number = 0;
	showUIComponents = false;
	showSections = false;
	showSectionProperties = false;
	showLineProperties = false;
	showSignatureProperties = false;
	showTemplateProperties = true;
	showCheckBoxProperties = false;
	showRadioProperties = false;
	showImageLabelProperties = false;
	showImageProperties = false;
	showInputProperties = false;
	showTextProperties = false;
	showCombinedProperties = false;
	isCollapsed = false;
	sectionName: string;
	ppiRatio = 96 / 25.4;
	public addDelAction = false;
	public showSwitchProperties = false;
	public showIntensityProperties = false;
	public showIncrementProperties = false;
	public showDrawingProperties = false;
	public showCalculationProperties = false;
	public showDropDownProperties = false;
	public showTableDropDownProperties = false;
	public showIntellisenseProperties = false;
	public hideLeftSection = false;
	public searchTemplate: any = [];
	public searchParam: string = '';
	public searchType: string = 'All';
	public collapsePropertiesTab = {
		showTemplateProperties: false,
		showUIComponents: false,
		showSectionProperties: false,
		showSections: false,
		showDropDownProperties: false,
		showTableDropDownProperties: false,
		showTextProperties: false,
		showCombinedProperties: false,
		showSwitchProperties: false,
		showInputProperties: false,
		showIntensityProperties: false,
		showIncrementProperties: false,
		showDrawingProperties: false,
		showCalculationProperties: false,
		showLineProperties: false,
		showSignatureProperties: false,
		showIntellisenseProperties: false,
		showRadioProperties: false,
		showCheckBoxProperties: false,
		showImageLabelProperties: false,
		showImageProperties: false,
	};
	public currentTemplate: any = [];
	public showSideSections = false;
	public readonly doctorEvaluationSectionTypes = DOCTOR_EVALUATION_SECTION_TYPES;
	public readonly uicomponentTypes = UI_COMPONENT_TYPES;
	public readonly signatureTypes = SIGNATURE_TYPES;
	public readonly generatePdfOptions = GENERATE_PDF_OPTIONS;
	removeCollapsePropertiesTab() {
		this.showTemplateProperties = false;
		this.showUIComponents = false;
		this.showSectionProperties = false;
		this.showSections = false;
		this.showDropDownProperties = false;
		this.showTableDropDownProperties = false;
		this.showTextProperties = false;
		this.showCombinedProperties = false;
		this.showSwitchProperties = false;
		this.showInputProperties = false;
		this.showIncrementProperties = false;
		this.showDrawingProperties = false;
		this.showCalculationProperties = false;
		this.showIntensityProperties = false;
		this.showLineProperties = false;
		this.showSignatureProperties = false;
		this.showIntellisenseProperties = false;
		this.showRadioProperties = false;
		this.showCheckBoxProperties = false;
		this.showImageLabelProperties = false;
		this.showImageProperties = false;
		this.collapsePropertiesTab['showTemplateProperties'] = false;
		this.collapsePropertiesTab['showUIComponents'] = false;
		this.collapsePropertiesTab['showSectionProperties'] = false;
		this.collapsePropertiesTab['showSections'] = false;
		this.collapsePropertiesTab['showDropDownProperties'] = false;
		this.collapsePropertiesTab['showTableDropDownProperties'] = false;
		this.collapsePropertiesTab['showTextProperties'] = false;
		this.collapsePropertiesTab['showCombinedProperties'] = false;
		this.collapsePropertiesTab['showSwitchProperties'] = false;
		this.collapsePropertiesTab['showInputProperties'] = false;
		this.collapsePropertiesTab['showIntensityProperties'] = false;
		this.collapsePropertiesTab['showIncrementProperties'] = false;
		this.collapsePropertiesTab['showDrawingProperties'] = false;
		this.collapsePropertiesTab['showCalculationProperties'] = false;
		this.collapsePropertiesTab['showLineProperties'] = false;
		this.collapsePropertiesTab['showSignatureProperties'] = false;
		this.collapsePropertiesTab['showIntellisenseProperties'] = false;
		this.collapsePropertiesTab['showRadioProperties'] = false;
		this.collapsePropertiesTab['showCheckBoxProperties'] = false;
		this.collapsePropertiesTab['showImageLabelProperties'] = false;
		this.collapsePropertiesTab['showImageProperties'] = false;
	}
	setCollapsePropertiesTab(value) {
		if (value?.length) {
			this.collapsePropertiesTab[value] = true;
		}
	}
	setPropertiesTab(value) {
		if (value?.length) {
			this[value] = true;
		}
	}
	changeRowAddItems(check) {
		if (check) {
			if (this.rowAddItems < 10) {
				this.rowAddItems++;
			}
		} else {
			if (this.rowAddItems > 1) {
				this.rowAddItems--;
			}
		}
	}
	changeRowReduceItems(check) {
		if (check) {
			if (this.rowReduceItems < 10) {
				this.rowReduceItems++;
			}
		} else {
			if (this.rowReduceItems > 1) {
				this.rowReduceItems--;
			}
		}
	}
	sectiontags: string[] = ['section'];
	form: FormGroup;
	showProperties = false;
	sections: any;
	searchData = [];
	uiSearchData = [];
	rowSearchData = [];
	uiSearchDataComponents = [];
	rowSearchDataComponents = [];
	sectionSearchData = [];
	sectionSearchDataComponents = [];
	uiExternalSearchData = [];
	uiExternalSearchDataComponents = [];
	linkUIComponentsInput: string = '';
	linkRowComponentsInput: string = '';
	linkSectionComponentsInput: string = '';
	searchDataNames = [];
	optionsSearchData = [];
	public PreDefinedList: any = [];
	public PreDummylist: any = [];
	public allExternalSlugs: any = [];
	public PreDefinedListText: any = [];
	public PreDefinedListDropDown: any = [];
	preDefinedInputModel: string = '';
	MultiLinkedInputModel: string = '';
	searchCodes(event) {
		this.searchData = [];
		let nameFlag: number = 0;
		let descriptionFlag: number = 0;
		event.target.value = event.target.value.toLowerCase();
		let words = event.target.value.split(' ');
		for (let i: number = 0; i < this.preDefindAllFields?.length; i++) {
			let tempName = this.preDefindAllFields[i].title.toLowerCase();
			let tempDescription = this.preDefindAllFields[i].description.toLowerCase();
			for (let j: number = 0; j < words?.length; j++) {
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
				this.searchData.push(this.preDefindAllFields[i]);
			}
			nameFlag = 0;
			descriptionFlag = 0;
		}
	}
	searchChildSlugsUI(event: any) {
		this.uiExternalSearchData = [];
		let nameFlag: number = 0;
		let descriptionFlag: number = 0;
		let type: number = 0;
		if (
			this.selectedChildSlug.field_type == 'text_field' ||
			this.selectedChildSlug.field_type == 'boolean'
		) {
			type = 1;
		}
		if (this.selectedChildSlug.field_type == 'multiple_dropdown') {
			type = 2;
		}
		if (
			this.selectedChildSlug.field_type == 'number' ||
			this.selectedChildSlug.field_type == 'boolean' ||
			this.selectedChildSlug.field_type == 'email' ||
			this.selectedChildSlug.field_type == 'date' ||
			this.selectedChildSlug.field_type == 'datetime'
		) {
			type = 3;
		}
		event.target.value = event.target.value.toLowerCase();
		let words = event.target.value.split(' ');
		let externalSlugCheck = false;
		for (let i: number = 0; i < this.uiExternalSearchDataComponents?.length; i++) {
			if (
				this.uiExternalSearchDataComponents[i].type == this.uicomponentTypes.SIMPLE_IMAGE ||
				this.uiExternalSearchDataComponents[i].type == this.uicomponentTypes.LINE ||
				this.uiExternalSearchDataComponents[i].type == this.uicomponentTypes.IMAGE_LABEL ||
				this.uiExternalSearchDataComponents[i].type == this.uicomponentTypes.INTENSITY ||
				this.uiExternalSearchDataComponents[i].type == this.uicomponentTypes.INCREMENT ||
				this.uiExternalSearchDataComponents[i].type == this.uicomponentTypes.DRAWING ||
				this.uiExternalSearchDataComponents[i].type == this.uicomponentTypes.CALCULATION ||
				(this.uiExternalSearchDataComponents[i].type != this.uicomponentTypes.CHECKBOX &&
					this.uiExternalSearchDataComponents[i].type != this.uicomponentTypes.INTELLISENSE &&
					!(
						this.uiExternalSearchDataComponents[i].type == this.uicomponentTypes.DROPDOWN &&
						this.uiExternalSearchDataComponents[i].isMultiSelect
					) &&
					type == 2)
			) {
				continue;
			}
			for (let externalSlug of this.layoutService.template.allExternalSlugs) {
				if (externalSlug.selectedUI?.length) {
					for (let slug of externalSlug.selectedUI) {
						if (slug.id == this.uiExternalSearchDataComponents[i].id) {
							externalSlugCheck = true;
							break;
						}
					}
				}
			}
			if (externalSlugCheck) {
				externalSlugCheck = false;
				continue;
			}
			let tempName =
				this.uiExternalSearchDataComponents[i].id +
				'-' +
				this.uiExternalSearchDataComponents[i].name.toLowerCase();
			for (let j: number = 0; j < words?.length; j++) {
				if (tempName.includes(words[j]) && nameFlag != -1) {
					nameFlag = 1;
					tempName = tempName.replace(words[j], '');
				} else {
					nameFlag = -1;
				}
			}
			if (nameFlag == 1) {
				this.uiExternalSearchData.push(this.uiExternalSearchDataComponents[i]);
			}
			nameFlag = 0;
		}
	}
	searchExternalSlugsUI(event) {
		this.uiExternalSearchData = [];
		let nameFlag: number = 0;
		let descriptionFlag: number = 0;
		let type: number = 0;
		if (
			this.selectedExternalSlug.field_type == 'text_field' ||
			this.selectedExternalSlug.field_type == 'boolean'
		) {
			type = 1;
		}
		if (
			this.selectedExternalSlug.field_type == 'multiple_dropdown' ||
			this.selectedExternalSlug.field_type == 'parent_field'
		) {
			type = 2;
		}
		if (
			this.selectedExternalSlug.field_type == 'number' ||
			this.selectedExternalSlug.field_type == 'boolean' ||
			this.selectedExternalSlug.field_type == 'email' ||
			this.selectedExternalSlug.field_type == 'date' ||
			this.selectedExternalSlug.field_type == 'datetime'
		) {
			type = 3;
		}
		event.target.value = event.target.value.toLowerCase();
		let words = event.target.value.split(' ');
		let externalSlugCheck = false;
		for (let i: number = 0; i < this.uiExternalSearchDataComponents?.length; i++) {
			if (
				this.uiExternalSearchDataComponents[i].type == this.uicomponentTypes.SIMPLE_IMAGE ||
				this.uiExternalSearchDataComponents[i].type == this.uicomponentTypes.LINE ||
				this.uiExternalSearchDataComponents[i].type == this.uicomponentTypes.IMAGE_LABEL ||
				this.uiExternalSearchDataComponents[i].type == this.uicomponentTypes.INTENSITY ||
				this.uiExternalSearchDataComponents[i].type == this.uicomponentTypes.INCREMENT ||
				this.uiExternalSearchDataComponents[i].type == this.uicomponentTypes.DRAWING ||
				this.uiExternalSearchDataComponents[i].type == this.uicomponentTypes.CALCULATION ||
				(this.uiExternalSearchDataComponents[i].type != this.uicomponentTypes.CHECKBOX &&
					this.uiExternalSearchDataComponents[i].type != this.uicomponentTypes.INTELLISENSE &&
					!(
						this.uiExternalSearchDataComponents[i].type == this.uicomponentTypes.DROPDOWN &&
						this.uiExternalSearchDataComponents[i].isMultiSelect
					) &&
					type == 2)
			) {
				continue;
			}
			for (let externalSlug of this.layoutService.template.allExternalSlugs) {
				if (externalSlug.selectedUI?.length) {
					for (let slug of externalSlug.selectedUI) {
						if (slug.id == this.uiExternalSearchDataComponents[i].id) {
							externalSlugCheck = true;
							break;
						}
					}
				}
			}
			if (externalSlugCheck) {
				externalSlugCheck = false;
				continue;
			}
			let tempName =
				this.uiExternalSearchDataComponents[i].id +
				'-' +
				this.uiExternalSearchDataComponents[i].name.toLowerCase();
			for (let j: number = 0; j < words?.length; j++) {
				if (tempName.includes(words[j]) && nameFlag != -1) {
					nameFlag = 1;
					tempName = tempName.replace(words[j], '');
				} else {
					nameFlag = -1;
				}
			}
			if (nameFlag == 1) {
				this.uiExternalSearchData.push(this.uiExternalSearchDataComponents[i]);
			}
			nameFlag = 0;
		}
	}
	async linkExternalSlugUI(index) {
		if (
			this.selectedExternalSlug.field_type == 'parent_field' &&
			this.selectedExternalSlug.selectedUI?.length
		) {
			if (this.selectedExternalSlug.addedFields?.length) {
				for (let tempSection of this.layoutService.template.sections) {
					for (let tempUI of tempSection.dashboard) {
						if (tempUI.obj.uicomponent_name == this.selectedExternalSlug.selectedUI[0].id) {
							let tempFields = [];
							for (let addedField of this.selectedExternalSlug.addedFields) {
								let check = false;
								for (let option of tempUI.obj?.options) {
									if (option.textLabel == addedField) {
										check = true;
										break;
									}
								}
								if (!check) {
									tempFields.push(addedField);
								}
							}
							this.selectedExternalSlug.addedFields = tempFields;
						}
					}
				}
			}
		}
		if (this.selectedExternalSlug.selectedUI && this.selectedExternalSlug.selectedUI?.length) {
			if (this.selectedExternalSlug.field_type == 'multiple_dropdown') {
				for (let tempSection of this.layoutService.template.sections) {
					for (let tempUI of tempSection.dashboard) {
						if (tempUI.obj.uicomponent_name == this.selectedExternalSlug.selectedUI[0].id) {
							await this.removeAllOptions(tempUI.obj, false, false);
						}
					}
				}
			}
		}
		this.selectedExternalSlug.selectedUI = [];
		this.selectedExternalSlug.selectedUI.push(this.uiExternalSearchData[index]);
		let check = true;
		for (let slug of this.layoutService.template.allExternalSlugs) {
			if (slug.slug == this.selectedExternalSlug.slug) {
				slug.selectedUI = this.selectedExternalSlug.selectedUI;
				check = false;
				break;
			}
		}
		if (this.selectedExternalSlug.selectedUI && this.selectedExternalSlug.selectedUI?.length) {
			if (this.selectedExternalSlug.field_type == 'multiple_dropdown') {
				for (let tempSection of this.layoutService.template.sections) {
					for (let tempUI of tempSection.dashboard) {
						if (tempUI.obj.uicomponent_name == this.uiExternalSearchData[index].id) {
							await this.removeAllOptions(tempUI.obj, true, false);
						}
					}
				}
			}
		}
		if (this.selectedExternalSlug.field_type == 'parent_field') {
			for (let section of this.layoutService.template.sections) {
				for (let uicomponent of section.dashboard) {
					if (uicomponent.obj.uicomponent_name == this.uiExternalSearchData[index].id) {
						this.selectedExternalSlug.addedFields = [];
						for (let option of uicomponent.obj?.options) {
							this.selectedExternalSlug.addedFields.push(option.textLabel);
						}
						this.selectedExternalSlug['pushedOptions'] = true;
					}
				}
			}
		}
		if (check) {
			this.layoutService.template.allExternalSlugs.push(
				JSON.parse(JSON.stringify(this.selectedExternalSlug)),
			);
		}
		this.layoutService.updateComponents();
	}
	linkExternalSlugUIOnDeselect(event: any) {
		if (
			event &&
			this.layoutService.template.allExternalSlugs?.length &&
			this.layoutService.template.allExternalSlugs?.length > 0
		) {
			this.layoutService.template.allExternalSlugs[0]['onDeselect'] = event;
		}
	}
	deleteAddedField(index) {
		this.selectedExternalSlug.addedFields.splice(index, 1);
		for (let i: number = 0; i < this.childSlugs?.length; i++) {
			this.childSlugs[i].selectedUI.splice(this.selectedExternalSlug.addedFields?.length);
		}
	}
	deleteChildSelectedUI(index) {
		for (let i: number = 0; i < this.selectedChildSlug.selectedUI?.length; i++) {
			if (
				this.selectedExternalSlug.addedFields[this.selectedOptionIndex] ==
				this.selectedChildSlug.selectedUI[i].textLabel
			) {
				this.selectedChildSlug.selectedUI.splice(i, 1);
				break;
			}
		}
	}
	linkChildSlugsUI(index) {
		let tempArray = this.selectedChildSlug.selectedUI;
		for (let i: number = 0; i < this.selectedChildSlug.selectedUI?.length; i++) {
			if (
				this.selectedExternalSlug.addedFields[this.selectedOptionIndex] ==
				this.selectedChildSlug.selectedUI[i].textLabel
			) {
				this.selectedChildSlug.selectedUI.splice(i, 1);
				break;
			}
		}
		this.selectedChildSlug.selectedUI.push(this.uiExternalSearchData[index]);
		this.selectedChildSlug.selectedUI[this.selectedChildSlug.selectedUI?.length - 1].textLabel =
			this.selectedExternalSlug.addedFields[this.selectedOptionIndex];
		let check = true;
		for (let slug of this.layoutService.template.allExternalSlugs) {
			if (slug.slug == this.selectedChildSlug.slug) {
				slug.selectedUI = this.selectedChildSlug.selectedUI;
				check = false;
				break;
			}
		}
		if (check) {
			this.layoutService.template.allExternalSlugs.push(
				JSON.parse(JSON.stringify(this.selectedChildSlug)),
			);
		}
	}
	selectedChildSlugOption = '';
	childSlugs = [];
	linkChildSlugOption(index) {
		this.selectedOptionIndex = index;
		this.selectedChildSlugOption = this.selectedExternalSlug.addedFields[index];
	}
	deleteChildSlugOption() {
		this.selectedChildSlugOption = '';
	}
	linkExternalSlugParent(index) {
		this.childSlugs = [];
		for (let slug of this.allExternalSlugs) {
			if (slug.parent == this.selectedExternalSlug.id) {
				this.childSlugs.push(slug);
			}
		}
	}
	parentSlugValue = '';
	selectedOptionIndex = -1;
	addParentSlugsField(event) {
		if (event.code == 'Enter') {
			this.selectedExternalSlug.addedFields.push(this.parentSlugValue);
			let check = true;
			for (let slug of this.layoutService.template.allExternalSlugs) {
				if (slug.slug == this.selectedExternalSlug.slug) {
					slug.addedFields = this.selectedExternalSlug.addedFields;
					check = false;
					break;
				}
			}
			if (check) {
				this.layoutService.template.allExternalSlugs.push(
					JSON.parse(JSON.stringify(this.selectedExternalSlug)),
				);
			}
			this.parentSlugValue = '';
		}
	}
	searchLinkSections(event, secIndex, optionIndex) {
		this.sectionSearchData = [];
		this.linkSectionComponentsInput = '';
		let nameFlag: number = 0;
		let descriptionFlag: number = 0;
		event.target.value = event.target.value.toLowerCase();
		let words = event.target.value.split(' ');
		for (let i: number = 0; i < this.sectionSearchDataComponents?.length; i++) {
			let tempName =
				this.sectionSearchDataComponents[i].secNo +
				'-' +
				this.sectionSearchDataComponents[i].name.toLowerCase();
			for (let j: number = 0; j < words?.length; j++) {
				if (tempName.includes(words[j]) && nameFlag != -1) {
					nameFlag = 1;
					tempName = tempName.replace(words[j], '');
				} else {
					nameFlag = -1;
				}
			}
			if (nameFlag == 1) {
				this.sectionSearchData.push(this.sectionSearchDataComponents[i]);
			}
			nameFlag = 0;
		}
	}
	searchLinkUI(event, secIndex, uiIndex, optionIndex) {
		this.uiSearchData = [];
		this.linkUIComponentsInput = '';
		let nameFlag: number = 0;
		let descriptionFlag: number = 0;
		event.target.value = event.target.value.toLowerCase();
		let words = event.target.value.split(' ');
		for (let i: number = 0; i < this.uiSearchDataComponents?.length; i++) {
			let tempName =
				this.uiSearchDataComponents[i].id + '-' + this.uiSearchDataComponents[i].name.toLowerCase();
			for (let j: number = 0; j < words?.length; j++) {
				if (tempName.includes(words[j]) && nameFlag != -1) {
					nameFlag = 1;
					tempName = tempName.replace(words[j], '');
				} else {
					nameFlag = -1;
				}
			}
			if (nameFlag == 1) {
				this.uiSearchData.push(this.uiSearchDataComponents[i]);
			}
			nameFlag = 0;
		}
	}
	searchLinkRow(event, secIndex, uiIndex, optionIndex) {
		this.rowSearchDataComponents = [];
		for (let ui of this.layoutService.template.sections[secIndex].dashboard) {
			if (ui.obj.type == this.uicomponentTypes.TEXT && ui.x == 0) {
				this.rowSearchDataComponents.push({
					id: ui.obj.uicomponent_name,
					name: ui.obj.second_name,
					y: ui.y,
				});
			}
		}
		for (let x: number = 0; x < this.rowSearchDataComponents?.length; x++) {
			for (let y = x + 1; y < this.rowSearchDataComponents?.length; y++) {
				if (this.rowSearchDataComponents[x].y > this.rowSearchDataComponents[y].y) {
					let temp = this.rowSearchDataComponents[x];
					this.rowSearchDataComponents[x] = this.rowSearchDataComponents[y];
					this.rowSearchDataComponents[y] = temp;
				}
			}
		}
		let rowNumber: number = 0;
		for (let item of this.rowSearchDataComponents) {
			item.row = ++rowNumber;
		}
		for (let ui of this.layoutService.template.sections[secIndex].dashboard) {
			if (ui.obj.type == this.uicomponentTypes.TEXT && ui.x == 0 && ui.obj.linked_row > 0) {
				let tempRowSearchData = cloneDeep(this.rowSearchDataComponents);
				let index = -1;
				for (let item of tempRowSearchData) {
					index++;
					if (item.id == ui.obj.uicomponent_name) {
						this.rowSearchDataComponents.splice(index, 1);
						index--;
					}
				}
			}
		}
		this.rowSearchData = [];
		this.linkRowComponentsInput = '';
		let nameFlag: number = 0;
		let descriptionFlag: number = 0;
		event.target.value = event.target.value.toLowerCase();
		let words = event.target.value.split(' ');
		for (let i: number = 0; i < this.rowSearchDataComponents?.length; i++) {
			let tempName =
				this.rowSearchDataComponents[i].id +
				'-' +
				this.rowSearchDataComponents[i].name.toLowerCase();
			for (let j: number = 0; j < words?.length; j++) {
				if (tempName.includes(words[j]) && nameFlag != -1) {
					nameFlag = 1;
					tempName = tempName.replace(words[j], '');
				} else {
					nameFlag = -1;
				}
			}
			if (nameFlag == 1) {
				this.rowSearchData.push(this.rowSearchDataComponents[i]);
			}
			nameFlag = 0;
		}
	}
	searchUiNames(event) {
		this.searchDataNames = [];
		let firstnameFlag: number = 0;
		let secondnameFlag: number = 0;
		let words = event.target.value.split(' ');
		for (let i: number = 0; i < this.SearchNames?.length; i++) {
			let tempFirstName = this.SearchNames[i].firstname;
			let tempSecondName = this.SearchNames[i].secondname;
			for (let j: number = 0; j < words?.length; j++) {
				if (tempFirstName.includes(words[j]) && firstnameFlag != -1) {
					firstnameFlag = 1;
					tempFirstName = tempFirstName.replace(words[j], '');
				} else {
					firstnameFlag = -1;
				}
				if (tempSecondName.includes(words[j]) && secondnameFlag != -1) {
					secondnameFlag = 1;
					tempSecondName = tempSecondName.replace(words[j], '');
				} else {
					secondnameFlag = -1;
				}
			}
			if (firstnameFlag == 1 || secondnameFlag == 1) {
				this.searchDataNames.push(this.SearchNames[i]);
			}
			firstnameFlag = 0;
			secondnameFlag = 0;
		}
	}
	optionPreDefinedInputModel = '';
	optionsSearchCodes(event) {
		this.optionsSearchData = [];
		let nameFlag: number = 0;
		let words = event.target.value.split(' ');
		for (
			let i: number = 0;
			i <
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.specialities?.length;
			i++
		) {
			let tempName =
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.specialities[i].name.toLowerCase();
			for (let j: number = 0; j < words?.length; j++) {
				if (tempName.includes(words[j]) && nameFlag != -1) {
					nameFlag = 1;
					tempName = tempName.replace(words[j], '');
				} else {
					nameFlag = -1;
				}
			}
			if (nameFlag == 1) {
				this.optionsSearchData.push(
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[
						this.layoutService.lastK
					].obj.specialities[i],
				);
			}
			nameFlag = 0;
		}
	}
	get components(): IComponent[] {
		return this.components;
	}
	idCount: number = 0;
	dashboard: Array<GridsterItem> = [];
	options: GridsterConfig;
	option1: string = '<font size="3">Option 1</font>';
	option2: string = '<font size="3">Option 2</font>';
	yesOption: string = '<font size="3">Yes</font>';
	noOption: string = '<font size="3">No</font>';
	textObject: any = {
		showSimpleTextProperties: false,
		hidePdf: 0,
		type: this.uicomponentTypes.TEXT,
		second_name: this.uicomponentTypes.TEXT,
		isStatement: true,
		alignment: 'center',
		statement: 'Your statement goes here! ',
		instanceStatement: 'Your statement goes here! ',
		textInput: ' ',
		answers: [],
		tags: [],
		bold: false,
		underLine: false,
		isBold: false,
		isItalic: false,
		isUnderline: false,
		listOptions: 0,
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
		lineSpacingValue: 15,
		bgColor: false,
		backgroundColor: '#ff0000',
		fontColor: false,
		fontColorCode: '#000000',
		fontFamily: false,
		fontFamilyValue: '',
		linked_ui: 0,
		selected_linked_ui_component: 0,
		linked_row: 0,
		selected_linked_row: 0,
		errors: 0,
	};
	signatureObject: signatureProperties = {
		showSimpleTextProperties: false,
		hidePdf: 0,
		type: this.uicomponentTypes.SIGNATURE,
		second_name: this.uicomponentTypes.SIGNATURE,
		selectedSignature: SignatureTypesArray[0].name,
		displaySignatoryName: false,
		displayAtPageEnd: false,
		signatoryName: '',
		isStatement: true,
		alignment: 'center',
		instanceStatement: 'Your statement goes here! ',
		statement: 'Your statement goes here! ',
		textInput: ' ',
		answers: [],
		signature_type: this.signatureTypes.DOCTOR_SIGNATURE,
		signature_listing: [],
		signaturePoints: [],
		signaturelink: null,
		tags: [],
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
		lineSpacingValue: 15,
		bgColor: false,
		backgroundColor: '#ff0000',
		fontColor: false,
		fontColorCode: '#000000',
		fontFamily: false,
		fontFamilyValue: '',
		linked_ui: 0,
		selected_linked_ui_component: 0,
		previousSignature: false,
		signature_id: '',
		signature_path: '',
		signature: '',
		signatureLabel:  SignatureTypesArray[0].name,
		errors: 0,
		underlineSignature: false,
		width: 50,
	};
	lineObject: any = {
		second_name: this.uicomponentTypes.LINE,
		horizontal: true,
		type: this.uicomponentTypes.LINE,
		tags: [],
		size: '1px',
		typeLine: 'solid',
		answers: [],
		color: '#000000',
		statement: 'This is a line',
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
		lineSpacingValue: 15,
		bgColor: false,
		backgroundColor: '#ff0000',
		fontColor: false,
		fontColorCode: '#000000',
		fontFamily: false,
		fontFamilyValue: '',
		linked_ui: 0,
		selected_linked_ui_component: 0,
		errors: 0,
	};
	intellisenseObject: any = {
		instanceStatement: 'Your statement goes here! ',
		statement: 'Your statement goes here! ',
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
		lineSpacingValue: 15,
		bgColor: false,
		backgroundColor: '#ff0000',
		fontColor: false,
		fontColorCode: '#000000',
		fontFamily: false,
		fontFamilyValue: '',
		linked_ui: 0,
		selected_linked_ui_component: 0,
		errors: 0,
		hidePdf: 0,
		is_required: false,
		is_single_select: false,
		isStatement: true,
		manualoptions: true,
		second_name: this.uicomponentTypes.INTELLISENSE,
		answers: [],
		type: this.uicomponentTypes.INTELLISENSE,
		tags: [],
		alignment: 'center',
		displayOption: true,
		linkOptions: false,
		OptionView: 0,
		listOptions: 0,
		optionsCheck: true,
		data: [],
		defaultChecked: false,
		searchData: [],
		editable: false,
		fontSize: '3',
		options: [
			{
				instanceLabel: this.option1,
				textLabel: 'Option 1',
				label: this.option1,
				selected: false,
				fontSize: '3',
				hide: false,
				link: false,
				id: 0,
				showOption: true,
				selectedLinkSection: {},
				linkedStatement: '',
				selectedLinkUi: {},
				linkedUICheck: false,
				linkedStatementCheck: false,
				defaultValue: false,
			},
			{
				instanceLabel: this.option2,
				textLabel: 'Option 2',
				label: this.option2,
				selected: false,
				fontSize: '3',
				hide: false,
				link: false,
				id: 1,
				showOption: true,
				selectedLinkSection: {},
				linkedStatement: '',
				selectedLinkUi: {},
				linkedUICheck: false,
				linkedStatementCheck: false,
				defaultValue: false,
			},
		],
	};
	checkboxObject: any = {
		instanceStatement: 'Your statement goes here! ',
		statement: 'Your statement goes here! ',
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
		lineSpacingValue: 15,
		bgColor: false,
		backgroundColor: '#ff0000',
		fontColor: false,
		fontColorCode: '#000000',
		fontFamily: false,
		fontFamilyValue: '',
		linked_ui: 0,
		selected_linked_ui_component: 0,
		errors: 0,
		hidePdf: 0,
		second_name: this.uicomponentTypes.CHECKBOX,
		is_required: false,
		is_single_select: false,
		manualoptions: true,
		isStatement: true,
		answers: [],
		listOptions: 0,
		fontSize: '3',
		type: this.uicomponentTypes.CHECKBOX,
		displayOption: true,
		tags: [],
		alignment: 'center',
		linkOptions: false,
		OptionView: 0,
		defaultChecked: false,
		showCheckBoxes: false,
		isBold: false,
		isUnderLine: false,
		isItalic: false,
		isAlign: 0,
		options: [
			{
				instanceLabel: this.option1,
				label: this.option1,
				textLabel: 'Option 1',
				selected: false,
				hide: false,
				link: false,
				input: false,
				id: 0,
				inputValue: '',
				instanceInputValue: '',
				height: 30,
				decimalPlacesLimit: '',
				decimalRoundOff: false,
				commentsPlaceholder: 'Type Here',
				is_required: false,
				minLimit: '',
				maxLimit: '',
				validationValue: {},
				validationCheck: false,
				showOption: true,
				selectedLinkSection: {},
				linkedStatement: '',
				selectedLinkUi: {},
				linkedUICheck: false,
				linkedStatementCheck: false,
				defaultValue: false,
				isBold: false,
				isUnderLine: false,
				isItalic: false,
				isAlign: 0,
				fontSize: '3',
				minMaxCheck: false,
				formatValue: {
					slug: 'MM/DD/YYYY',
					value: 'MM/DD/YYYY',
				},
			},
			{
				instanceLabel: this.option2,
				textLabel: 'Option 2',
				label: this.option2,
				selected: false,
				hide: false,
				link: false,
				input: false,
				id: 1,
				inputValue: '',
				instanceInputValue: '',
				height: 30,
				decimalPlacesLimit: '',
				decimalRoundOff: false,
				commentsPlaceholder: 'Type Here',
				is_required: false,
				minLimit: '',
				maxLimit: '',
				validationValue: {},
				validationCheck: false,
				showOption: true,
				selectedLinkSection: {},
				linkedStatement: '',
				selectedLinkUi: {},
				linkedUICheck: false,
				linkedStatementCheck: false,
				defaultValue: false,
				isBold: false,
				isUnderLine: false,
				isItalic: false,
				isAlign: 0,
				minMaxCheck: false,
				fontSize: '3',
				formatValue: {
					slug: 'MM/DD/YYYY',
					value: 'MM/DD/YYYY',
				},
			},
		],
	};
	switchObj: any = {
		type: this.uicomponentTypes.SWITCH,
		hidePdf: 0,
		second_name: this.uicomponentTypes.SWITCH,
		is_required: false,
		is_single_select: false,
		alignment: 'center',
		instanceStatement: 'Your statement goes here! ',
		statement: 'Your statement goes here! ',
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
		fontSize: '3',
		lineSpacingValue: 15,
		fontColor: false,
		fontFamily: false,
		bgColor: false,
		backgroundColor: '#ff0000',
		fontColorCode: '#000000',
		fontFamilyValue: '',
		linked_ui: 0,
		selected_linked_ui_component: 0,
		errors: 0,
		isStatement: true,
		listOptions: 0,
		tags: [],
		answers: [],
		displayOption: true,
		defaultChecked: false,
		noOptions: false,
		options: [
			{
				instanceLabel: this.yesOption,
				textLabel: 'Yes',
				label: this.yesOption,
				selected: false,
				text: 'Type here!',
				hide: false,
				link: false,
				fontSize: '3',
				id: 0,
				selectedLinkSection: {},
				linkedStatement: '',
				selectedLinkUi: {},
				linkedUICheck: false,
				linkedStatementCheck: false,
				defaultValue: false,
			},
			{
				instanceLabel: this.noOption,
				textLabel: 'No',
				label: this.noOption,
				selected: false,
				text: 'Type here!',
				hide: false,
				fontSize: '3',
				link: false,
				id: 1,
				selectedLinkSection: {},
				linkedStatement: '',
				selectedLinkUi: {},
				linkedUICheck: false,
				linkedStatementCheck: false,
				defaultValue: false,
			},
		],
	};
	dropDownObj: any = {
		type: this.uicomponentTypes.DROPDOWN,
		instanceStatement: 'Your statement goes here! ',
		statement: 'Your statement goes here! ',
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
		lineSpacingValue: 15,
		fontColor: false,
		fontFamily: false,
		bgColor: false,
		backgroundColor: '#ff0000',
		fontColorCode: '#000000',
		fontFamilyValue: '',
		linked_ui: 0,
		selected_linked_ui_component: 0,
		errors: 0,
		hidePdf: 0,
		manualoptions: true,
		second_name: this.uicomponentTypes.DROPDOWN,
		is_required: false,
		is_single_select: false,
		isStatement: true,
		tags: [],
		alignment: 'center',
		displayOption: true,
		answers: [],
		isMultiSelect: false,
		OptionView: 0,
		listOptions: 0,
		defaultChecked: false,
		editable: false,
		fontSize: '3',
		options: [
			{
				instanceLabel: this.option1,
				textLabel: 'Option 1',
				label: this.option1,
				fontSize: '3',
				link: false,
				id: 0,
				hide: false,
				showOption: true,
				selected: false,
				selectedLinkSection: {},
				linkedStatement: '',
				selectedLinkUi: {},
				linkedUICheck: false,
				linkedStatementCheck: false,
				defaultValue: false,
			},
		],
	};
	intensityObj: any = {
		type: this.uicomponentTypes.INTENSITY,
		instanceStatement: 'Your statement goes here! ',
		statement: 'Your statement goes here! ',
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
		lineSpacingValue: 15,
		bgColor: false,
		backgroundColor: '#ff0000',
		fontColor: false,
		fontColorCode: '#000000',
		fontFamily: false,
		fontFamilyValue: '',
		linked_ui: 0,
		selected_linked_ui_component: 0,
		errors: 0,
		hidePdf: 0,
		second_name: this.uicomponentTypes.INTENSITY,
		is_required: false,
		is_single_select: false,
		isStatement: true,
		listOptions: 0,
		alignment: 'center',
		minLabel: 'min',
		answers: [{ answer: '<font size="3">0</font>' }],
		value: 0,
		linkedStatement: '',
		linkedStatementCheck: false,
		maxLabel: 'max',
		options: {
			floor: 0,
			ceil: 100,
		},
		tags: [],
		defaultValue: 0,
		defaultChecked: false,
		readOnly: false,
		isBold: false,
		isUnderLine: false,
		isItalic: false,
		isAlign: 0,
		fontSize: '3',
	};
	incrementObj: any = {
		type: this.uicomponentTypes.INCREMENT,
		instanceStatement: 'Your statement goes here! ',
		statement: 'Your statement goes here! ',
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
		lineSpacingValue: 15,
		bgColor: false,
		backgroundColor: '#ff0000',
		fontColor: false,
		fontColorCode: '#000000',
		fontFamily: false,
		fontFamilyValue: '',
		linked_ui: 0,
		selected_linked_ui_component: 0,
		errors: 0,
		hidePdf: 0,
		second_name: this.uicomponentTypes.INCREMENT,
		is_required: false,
		is_single_select: false,
		isStatement: true,
		listOptions: 0,
		alignment: 'center',
		answers: [{ answer: '<font size="3">0</font>' }],
		value: 0,
		linkedStatement: '',
		linkedStatementCheck: false,
		options: {
			floor: 0,
			ceil: 100,
		},
		tags: [],
		defaultValue: 0,
		defaultChecked: false,
		readOnly: false,
		isBold: false,
		isUnderLine: false,
		isItalic: false,
		isAlign: 0,
		fontSize: '3',
	};
	drawingObj: any = {
		type: this.uicomponentTypes.DRAWING,
		instanceStatement: 'Your statement goes here! ',
		statement: 'Your statement goes here! ',
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
		lineSpacingValue: 15,
		bgColor: false,
		fontColor: false,
		fontColorCode: '#000000',
		fontFamily: false,
		fontFamilyValue: '',
		linked_ui: 0,
		selected_linked_ui_component: 0,
		errors: 0,
		hidePdf: 0,
		second_name: this.uicomponentTypes.DRAWING,
		is_required: false,
		is_single_select: false,
		isStatement: true,
		alignment: 'center',
		answers: [{ answer: '' }],
		value: 50,
		points: null,
		penColor: '#000000',
		backgroundColor: '#ffffff',
		linkedStatement: '',
		linkedStatementCheck: false,
		tags: [],
		width: '1868',
		height: '500'
	};
	radioObject: any = {
		instanceStatement: 'Your statement goes here! ',
		statement: 'Your statement goes here! ',
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
		lineSpacingValue: 15,
		bgColor: false,
		backgroundColor: '#ff0000',
		fontColor: false,
		fontColorCode: '#000000',
		fontFamily: false,
		fontFamilyValue: '',
		linked_ui: 0,
		selected_linked_ui_component: 0,
		errors: 0,
		alignment: 'center',
		hidePdf: 0,
		second_name: this.uicomponentTypes.RADIO,
		is_required: false,
		is_single_select: false,
		isStatement: true,
		displayOption: true,
		type: this.uicomponentTypes.RADIO,
		listOptions: 0,
		answers: [],
		tags: [],
		linkOptions: false,
		defaultChecked: false,
		showCheckBoxes: false,
		fontSize: '3',
		options: [
			{
				instanceLabel: this.option1,
				textLabel: 'Option 1',
				label: this.option1,
				selected: false,
				input: false,
				hide: false,
				height: 30,
				link: false,
				inputValue: '',
				instanceInputValue: '',
				decimalPlacesLimit: '',
				decimalRoundOff: false,
				commentsPlaceholder: 'Type Here',
				is_required: false,
				minLimit: '',
				maxLimit: '',
				validationValue: {},
				validationCheck: false,
				showOption: true,
				selectedLinkSection: {},
				linkedStatement: '',
				selectedLinkUi: {},
				linkedUICheck: false,
				linkedStatementCheck: false,
				defaultValue: false,
				isBold: false,
				isUnderLine: false,
				isItalic: false,
				isAlign: 0,
				fontSize: '3',
				minMaxCheck: false,
				formatValue: {
					slug: 'MM/DD/YYYY',
					value: 'MM/DD/YYYY',
				},
			},
			{
				instanceLabel: this.option2,
				textLabel: 'Option 2',
				label: this.option2,
				selected: false,
				input: false,
				hide: false,
				link: false,
				inputValue: '',
				instanceInputValue: '',
				height: 30,
				decimalPlacesLimit: '',
				decimalRoundOff: false,
				commentsPlaceholder: 'Type Here',
				is_required: false,
				minLimit: '',
				maxLimit: '',
				minMaxCheck: false,
				validationValue: {},
				validationCheck: false,
				showOption: true,
				selectedLinkSection: {},
				linkedStatement: '',
				selectedLinkUi: {},
				linkedUICheck: false,
				linkedStatementCheck: false,
				defaultValue: false,
				isBold: false,
				isUnderLine: false,
				isItalic: false,
				isAlign: 0,
				fontSize: '3',
				formatValue: {
					slug: 'MM/DD/YYYY',
					value: 'MM/DD/YYYY',
				},
			},
		],
	};
	inputObject: any = {
		showSimpleTextProperties: false,
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
		lineSpacingValue: 15,
		bgColor: false,
		backgroundColor: '#ff0000',
		fontColor: false,
		fontColorCode: '#000000',
		fontFamily: false,
		fontFamilyValue: '',
		linked_ui: 0,
		placeholder: '',
		selected_linked_ui_component: 0,
		errors: 0,
		sameLineInput: false,
		hidePdf: 0,
		second_name: this.uicomponentTypes.INPUT,
		is_required: false,
		is_single_select: false,
		input: '',
		listOptions: 0,
		alignment: 'center',
		isStatement: true,
		answers: [],
		instanceStatement: 'Your statement goes here! ',
		statement: 'Your statement goes here! ',
		type: this.uicomponentTypes.INPUT,
		tags: [],
		bold: false,
		underLine: false,
		height: 30,
		validationCheck: false,
		validationValue: {},
		info: false,
		formatValue: {
			slug: 'MM/DD/YYYY',
			value: 'MM/DD/YYYY',
		},
		decimalPlacesLimit: '',
		linkedStatement: '',
		linkedStatementCheck: false,
		defaultValue: '',
		defaultChecked: false,
		readOnly: false,
		maxCharLength: '',
		fieldMaskProperty: '',
		fieldMaskRegex: '',
		minLimit: '',
		maxLimit: '',
		decimalRoundOff: false,
		isBold: false,
		isUnderLine: false,
		isItalic: false,
		isAlign: 0,
		fontSize: '3',
		minMaxCheck: false,
	};
	imageObject: imageLabelProperties = {
		isStatement: true,
		statement: 'Following are the selected labels:',
		instanceStatement: 'Following are the selected labels:',
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
		lineSpacingValue: 15,
		bgColor: false,
		backgroundColor: '#ff0000',
		fontColor: false,
		fontColorCode: '#000000',
		fontFamily: false,
		fontFamilyValue: '',
		linked_ui: 0,
		selected_linked_ui_component: 0,
		errors: 0,
		type: this.uicomponentTypes.IMAGE_LABEL,
		paths: [],
		width: 50,
		answers: [],
		data: [],
		raw: '',
		tags: [],
		firstTime: true,
		alignment: 'center',
		hidePdf: 0,
		second_name: this.uicomponentTypes.IMAGE_LABEL,
		is_required: false,
		is_single_select: false,
		OptionView: 0,
		enableTextInput: false,
		hideLabels: false
	};
	simpleImageObject: any = {
		isStatement: false,
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
		lineSpacingValue: 15,
		bgColor: false,
		backgroundColor: '#ff0000',
		fontColor: false,
		fontColorCode: '#000000',
		fontFamily: false,
		fontFamilyValue: '',
		linked_ui: 0,
		selected_linked_ui_component: 0,
		errors: 0,
		statement: '',
		type: this.uicomponentTypes.SIMPLE_IMAGE,
		paths: [],
		answers: [],
		data: [],
		raw: [],
		tags: [],
		alignment: 'center',
		firstTime: true,
		hidePdf: 0,
		width: 50,
		imageRange: 6,
		second_name: 'simple image',
		is_required: false,
		is_single_select: false,
	};
	date_formats = [
		{
			slug: 'MM/DD/YYYY',
			value: 'MM/DD/YYYY',
		},
		{
			value: 'YYYY/MM/DD',
			slug: 'YYYY/MM/DD',
		},
		{
			value: 'DD/MM/YYYY',
			slug: 'DD/MM/YYYY',
		},
	];
	datetime_formats = [
		{
			value: 'MM/DD/YYYY 24 hour',
			slug: 'MM/DD/YYYY HH:mm',
		},
		{
			value: 'YYYY/MM/DD 24 hour',
			slug: 'YYYY/MM/DD HH:mm',
		},
		{
			value: 'DD/MM/YYYY 24 hour',
			slug: 'DD/MM/YYYY HH:mm',
		},
		{
			value: 'MM/DD/YYYY AM/PM',
			slug: 'MM/DD/YYYY hh:mm a',
		},
		{
			value: 'YYYY/MM/DD AM/PM',
			slug: 'YYYY/MM/DD hh:mm a',
		},
		{
			value: 'DD/MM/YYYY AM/PM',
			slug: 'DD/MM/YYYY hh:mm a',
		},
	];
	time_formats = [
		{
			value: 'AM/PM',
			slug: 'hh:mm a',
		},
		{
			value: '24 hour',
			slug: 'HH:mm',
		},
	];
	calculationObj: any = {
		showSimpleTextProperties: false,
		hidePdf: 0,
		type: this.uicomponentTypes.CALCULATION,
		second_name: this.uicomponentTypes.CALCULATION,
		isStatement: true,
		alignment: 'center',
		listOptions: 0,
		instanceStatement: 'Your statement goes here! ',
		statement: 'Your statement goes here! ',
		calculation: '',
		answers: [{ answer: '<font size="3">0</font>' }],
		tags: [],
		invalidCheck: false,
		inputComponents: [],
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
		lineSpacingValue: 15,
		bgColor: false,
		backgroundColor: '#ff0000',
		fontColor: false,
		fontColorCode: '#000000',
		fontFamily: false,
		fontFamilyValue: '',
		linked_ui: 0,
		selected_linked_ui_component: 0,
		errors: 0,
		isBold: false,
		isUnderLine: false,
		isItalic: false,
		isAlign: 0,
		fontSize: '3',
	};
	tableDropDownObj: any = {
		type: this.uicomponentTypes.TABLE_DROPDOWN,
		instanceStatement: 'Your statement goes here! ',
		statement: 'Your statement goes here! ',
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
		lineSpacingValue: 15,
		fontColor: false,
		fontFamily: false,
		bgColor: false,
		backgroundColor: '#ff0000',
		fontColorCode: '#000000',
		fontFamilyValue: '',
		linked_ui: 0,
		selected_linked_ui_component: 0,
		errors: 0,
		hidePdf: 0,
		second_name: this.uicomponentTypes.TABLE_DROPDOWN,
		is_required: false,
		is_single_select: false,
		isStatement: true,
		tags: [],
		alignment: 'center',
		displayOption: true,
		answers: [],
		OptionView: 0,
		listOptions: 0,
		defaultChecked: false,
		fontSize: '3',
		options: [
			{
				instanceLabel: this.option1,
				textLabel: 'Option 1',
				label: this.option1,
				link: false,
				id: 0,
				hide: false,
				showOption: true,
				selected: false,
				selectedLinkSection: {},
				linkedStatement: '',
				fontSize: '3',
				selectedLinkUi: {},
				linkedUICheck: false,
				linkedStatementCheck: false,
				defaultValue: false,
				linkedRowCheck: false,
				linkedRowValue: {},
			},
		],
	};
	componentsService: IComponent[] = [];
	dropId: string;
	copySectionIndex: number;
	dragItem: any;
	uiObject: any;
	preDefindAllFields: any = [];
	SearchNames: any = [];
	sectionIndex: number;
	sectionId: number = 1;
	totalSection: number = 1;
	sectionNumber: number = 1;
	leftSection: boolean = true;
	rightSection: boolean = true;
	templateSubSections: any = [];
	selectedSection: number;
	lastSecIndex: number = null;
	templateCreated: boolean = false;
	sectionCreated: boolean = false;
	editTempName: boolean = true;
	editTempText: boolean = true;
	editSecName: boolean = true;
	public searchSections: any = [];
	public sectionDragStart: any;
	otherSectionDragSearchCheck: boolean = false;
	imageLoadCheck: number = 0;
	hfImages: number = 0;
	multiplePDFs: any = [];
	multiplePreviews: any = [{ title: 'Main PDF', selected: true }];
	sessionOverviewTrs: any;
	headerTrs: any;
	footerTrs: any;
	public keyword: string = 'title';
	public tagsList: any = [];
	item: number = 1;
	public appointment_idd: number;
	public visit_idd: number;
	public visit_status: any;
	public speciality_idd: number;
	public visit_type_idd: number;
	public location_idd: number;
	public case_idd: number;
	public template_idd: number;
	specialities = [];
	locations = [];
	specialitiestemp = [];
	infoInstance = {
		check: false,
		lastI: 0,
		lastK: 0,
	};
	bsModalRef: BsModalRef;

	constructor(
		@Inject(DOCUMENT) private document: Document,
		private el: ElementRef,
		public mainService: MainService,
		protected route: Router,
		private localStorage: LocalStorage,
		private toastrService: ToastrService,
		private renderer: Renderer2,
		private config2: Config,
		public layoutService: LayoutService,
		private modalService: NgbModal,
		protected requestService: RequestService,
		public sanitizer: DomSanitizer,
		public subjectService: SubjectService,
		private fb: FormBuilder,
		protected storageData: StorageData,
		private modalServiceDialog: BsModalService,
		// private coolDialogs: NgxCoolDialogsService,
		private signatureService: SignatureServiceService,
		private documentManagerService: DocumentManagerServiceService,
		public changeDetector: ChangeDetectorRef,
		config: NgbPopoverConfig
	) {
		config.container = 'body';
		this.renderer.listen(this.el.nativeElement, 'listUpdated', (e) => {
			this.list = e.detail.list;
		});
	}
	widthChange(value: number, lastI, lastK) {
		this.layoutService.template.sections[lastI].dashboard[lastK].obj.width = value;
	}
	onChangeHeight(event: any) {
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.height = event.target.value;
	}
	onChangeWidth(event: any) {
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.width = event.target.value;
	}
	rangeChange(value: number, lastI, lastK) {
		this.layoutService.template.sections[lastI].dashboard[lastK].obj.imageRange = value;
	}
	checkMaxValue() {
		if (
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.maxLimit != '' &&
			parseInt(
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.maxLimit,
			) <
				parseInt(
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[
						this.layoutService.lastK
					].obj.minLimit,
				)
		) {
			return false;
		} else {
			return true;
		}
	}
	changeUIBorders(event:any) {
		for (let component of this.selectedComponents) {
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.leftUIBorder = event;
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.rightUIBorder = event;
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.topUIBorder = event;
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.bottomUIBorder = event;
		}
	}
	changeTemplateBorders(event: any) {
		this.layoutService.template.leftUIBorder = event;
		this.layoutService.template.rightUIBorder = event;
		this.layoutService.template.topUIBorder = event;
		this.layoutService.template.bottomUIBorder = event;
	}
	changeSectionUIBorders(event: any) {
		this.layoutService.template.sections[this.selectedSection].leftUIBorder = event;
		this.layoutService.template.sections[this.selectedSection].rightUIBorder = event;
		this.layoutService.template.sections[this.selectedSection].topUIBorder = event;
		this.layoutService.template.sections[this.selectedSection].bottomUIBorder = event;
	}
	changeUIPaddings(event: any) {
		for (let component of this.selectedComponents) {
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.leftUIPadding = event;
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.rightUIPadding = event;
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.topUIPadding = event;
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.bottomUIPadding = event;
		}
	}
	changeTemplatePaddings(event: any) {
		this.layoutService.template.leftUIPadding = event;
		this.layoutService.template.rightUIPadding = event;
		this.layoutService.template.topUIPadding = event;
		this.layoutService.template.bottomUIPadding = event;
	}
	changeSectionUIPaddings(event: any) {
		this.layoutService.template.sections[this.selectedSection].leftUIPadding = event;
		this.layoutService.template.sections[this.selectedSection].rightUIPadding = event;
		this.layoutService.template.sections[this.selectedSection].topUIPadding = event;
		this.layoutService.template.sections[this.selectedSection].bottomUIPadding = event;
	}
	changeSectionBorders(event: any) {
		this.layoutService.template.sections[this.selectedSection].leftSectionBorder = event;
		this.layoutService.template.sections[this.selectedSection].rightSectionBorder = event;
		this.layoutService.template.sections[this.selectedSection].bottomSectionBorder = event;
		this.layoutService.template.sections[this.selectedSection].topSectionBorder = event;
	}
	changeTopSectionPadding(event) {
		this.layoutService.template.sections[this.selectedSection].topSectionPadding = event;
	}
	isNumber = Number;
	config: AngularEditorConfig = {
		editable: true,
		spellcheck: true,
		height: '15rem',
		sanitize: true,
		minHeight: '5rem',
		placeholder: 'Enter text here...',
		translate: 'no',
		defaultParagraphSeparator: 'p',
		defaultFontName: 'Arial',
		customClasses: [
			{
				name: 'quote',
				class: 'quote',
			},
			{
				name: 'redText',
				class: 'redText',
			},
			{
				name: 'titleText',
				class: 'titleText',
				tag: 'h1',
			},
		],
	};
	subscriptions: any[] = [];
	subscription1: any;
	subscription2: any;
	subscription3: any;
	subscription4: any;
	subscription5: any;
	subscription6: any;
	subscription7: any;
	subscription8: any;
	emptyCellItem: any = {};
	emptyCellItemIndex: any = { sectionIndex: -1, dashboardIndex: -1 };
	emptyCellRightClicked = false;
	templateObjInfo: any = {};
	offset: number = 0;
	sectionShowMore = true;
	templateShowMore = true;
	ngOnDestroy() {
		if (this.pdfPreviewWindow) {
			this.pdfPreviewWindow.close();
		}
		this.renderer.removeClass(this.document.body, 'template-manager');
		this.subscriptions.forEach((subscription) => subscription.unsubscribe());
		window.removeEventListener('scroll', this.onScroll, true);
	}
	ngOnInit() {
		this.mainService.isLoaderPending.next(false);

		this.renderer.addClass(this.document.body, 'template-manager');
		this.getClinic();
		this.getSpeciality();
		this.getCaseType();
		this.getAllAppointmentType();
		this.createForm();
		this.layoutService.specSelectedMultiple = null;
		this.layoutService.clinicSelectedMultiple = null;
		this.layoutService.visitStatusSelectedMultiple = null;
		this.layoutService.caseTypeSelectedMultiple = null;
		this.layoutService.backupQueue = [];
		this.layoutService.backupIndex = -2;
		this.layoutService.backupId = 1;
		this.layoutService.template = {
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
			lineSpacingValue: 15,
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
			sections: [],
			uiCompIds: 0,
			carryOriginalDeleted: [],
			allExternalSlugs: [],
			carryNewDeleted: [],
			pageSize: {
				width: 205,
				height: 297,
			},
			pdfMarginTop: 0,
			pdfMarginBottom: 0,
			pdfMarginLeft: 5,
			pdfMarginRight: 5,
		};
		this.signatureArr = Object.values(SignatureTypesArray)
		this.emptySelectedComponents();
		this.requestService
			.sendRequest(TemaplateManagerUrlsEnum.mappingKeywords, 'GET', REQUEST_SERVERS.fd_api_url)
			.subscribe(
				(res: any) => {
					this.layoutService.template['mappingKeyWords'] = res.result.data;
				},
				(err) => {
					console.log(err);
					this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
					this.stopLoader();
				},
			);
		this.offset = 0;
		window.addEventListener('scroll', this.onScroll, true);
		this.subscription5 = this.subjectService.alignment.subscribe(async (res) => {
			if (res?.length != 0) {
				await this.makeText(0);
				await this.saveAlignment();
				if (this.hfImages == 0) {
					await this.pdfPreview(1, '');
				}
				this.changeDetector.detectChanges();
				this.subjectService.alignmentRefresh([]);
			}
		});
		this.subscription1 = this.subjectService.castInstanceRefresh.subscribe(async (res) => {
			if (res?.length !== 0 && res == 'tick') {
				this.checkSectionsTick();
				this.removeAllTemplateErrors()
				this.checkRequiredFields(true, false, this.subLevelIndex>0 ? this.subLevelIndex:this.topLevelIndex)
				this.subjectService.instanceRefreshCheck('');
			} else if (res?.length !== 0 && (res[0] == 'saad' || res == 'saad')) {
				this.optionInstanceRefresh(res);
				this.checkSectionsTick();
				this.subjectService.instanceRefreshCheck('');
			} else if (res?.length !== 0) {
				await this.pdfPreview(0, res);
				this.subjectService.instanceRefreshCheck('');
			}
		});
		this.subscription4 = this.subjectService.castSelectPre.subscribe((res) => {
			if (res?.length !== 0) {
				this.selectPreview(res);
				this.subjectService.selectPreRefreshItem('');
			}
		});
		this.subscription2 = this.subjectService.castItem.subscribe((res) => {
			if (res?.length !== 0) {
				if (
					this.layoutService.template.sections[this.sectionIndex].is_table &&
					this.layoutService.template.sections[this.sectionIndex].dashboard?.length
				) {
					if (
						res.x > 0 &&
						res.y <=
							this.layoutService.template.sections[this.sectionIndex].dashboard[0].rows - 1 &&
						this.uiObject &&
						this.uiObject.type != this.uicomponentTypes.TEXT
					) {
						this.toastrService.error(
							"Only text component is allowed in table's first row",
							'Error',
							{ timeOut: 6000 },
						);
						this.subjectService.refreshItem([]);
						return;
					}
					if (
						res.y > 0 &&
						res.x <=
							this.layoutService.template.sections[this.sectionIndex].dashboard[0].cols - 1 &&
						this.uiObject &&
						this.uiObject.type != this.uicomponentTypes.TEXT
					) {
						this.toastrService.error(
							"Only text component is allowed in table's first column",
							'Error',
							{ timeOut: 6000 },
						);
						this.subjectService.refreshItem([]);
						return;
					}
					if (res.y == 0) {
						res.rows = this.layoutService.template.sections[this.sectionIndex].dashboard[0].rows;
					}
					if (res.x == 0) {
						res.cols = this.layoutService.template.sections[this.sectionIndex].dashboard[0].rows;
					}
					if (res.x != 0 && res.y != 0) {
						let rowFlag = false;
						let colFlag = false;
						for (let component of this.layoutService.template.sections[this.sectionIndex]
							.dashboard) {
							if (
								component.y == 0 &&
								res.x >= component.x &&
								res.x < component.x + component.cols
							) {
								colFlag = true;
								if (rowFlag) {
									break;
								}
							}
							if (
								component.x == 0 &&
								res.y >= component.y &&
								res.y < component.y + component.rows
							) {
								rowFlag = true;
								if (colFlag) {
									break;
								}
							}
						}
						if (!rowFlag) {
							this.toastrService.error('Kindly add a text component in the first column', 'Error', {
								timeOut: 6000,
							});
							this.subjectService.refreshItem([]);
							return;
						}
						if (!colFlag) {
							this.toastrService.error('Kindly add a text component in the first row', 'Error', {
								timeOut: 6000,
							});
							this.subjectService.refreshItem([]);
							return;
						}
					}
				}
				if (this.dragItem === null && this.sectionDragStart != null) {
					this.dropSearchSection();
				} else if (this.dragItem != null) {
					res.obj = cloneDeep(this.uiObject);
					res.id = UUID();
					let check = true;
					for (
						let i: number = 0;
						i < this.layoutService.template.sections[this.sectionIndex].dashboard?.length;
						i++
					) {
						if (
							this.layoutService.template.sections[this.sectionIndex].dashboard[i].obj.emptyCell
						) {
							this.layoutService.template.sections[this.sectionIndex].dashboard.splice(i, 1);
							this.emptyCellItem = {};
							this.emptyCellItemIndex = {
								sectionIndex: -1,
								dashboardIndex: -1,
							};
							i--;
							continue;
						}
						if (
							this.layoutService.template.sections[this.sectionIndex].dashboard[i].id === res.id
						) {
							check = false;
						} else if (
							this.layoutService.template.sections[this.sectionIndex].dashboard[i].x <= res.x &&
							this.layoutService.template.sections[this.sectionIndex].dashboard[i].cols +
								this.layoutService.template.sections[this.sectionIndex].dashboard[i].x >
								res.x &&
							this.layoutService.template.sections[this.sectionIndex].dashboard[i].y <= res.y &&
							this.layoutService.template.sections[this.sectionIndex].dashboard[i].rows +
								this.layoutService.template.sections[this.sectionIndex].dashboard[i].y >
								res.y
						) {
							check = false;
							this.toastrService.error('UI already exists', '', { timeOut: 6000 });
							this.subjectService.refreshItem([]);
							return;
						}
					}
					if (check) {
						if (
							this.layoutService.template.sections[this.sectionIndex]['carrySections'] &&
							this.layoutService.template.sections[this.sectionIndex]['carrySections']?.length &&
							!this.layoutService.template.sections[this.sectionIndex]['isUpdated']
						) {
							
							// this.coolDialogs
							// 	.confirm(
							// 		'This section is being carry forward in other templates. Changes must be manually updated. Do you still wish to continue?',
							// 		{
							// 			okButtonText: 'OK',
							// 			cancelButtonText: 'Cancel',
							// 		},
							// 	)
							this.bsModalRef = this.modalServiceDialog.show(ConfirmationDialogComponent, {
								initialState: {
								  message: 'This section is being carry forward in other templates. Changes must be manually updated. Do you still wish to continue?'
								},
								class: 'modal-dialog-centered'
							  });
							  this.bsModalRef.content.result
							  .subscribe((response) => {
									if (response) {
										this.setTemplateProperty('uiCompIds', this.getNextUICompId(0), false);
										this.layoutService.template.sections[this.sectionIndex].dashboard.push(res);
										this.layoutService.template.sections[this.sectionIndex].dashboard[
											this.layoutService.template.sections[this.sectionIndex].dashboard?.length - 1
										].obj.uicomponent_name = JSON.stringify(this.layoutService.template.uiCompIds);
										this.updateBackUpTask('type', `addItem`);
										this.updateBackUpTask('id', this.layoutService.backupId);
										this.updateIndexes(
											this.sectionIndex,
											this.layoutService.template.sections[this.sectionIndex].dashboard?.length - 1,
											-1,
											'addItem',
										);
										this.updateBackUpTask('oldObject', null);
										this.updateBackUpTask(
											'newObject',
											cloneDeep(
												this.layoutService.template.sections[this.sectionIndex].dashboard[
													this.layoutService.template.sections[this.sectionIndex].dashboard?.length -
														1
												],
											),
										);
										this.dropId = res.id;
										const { componentsService } = this;
										const comp: IComponent = componentsService.find((c) => c.id === this.dropId);
										const updateIdx: number = comp
											? componentsService.indexOf(comp)
											: componentsService?.length;
										const componentItem: IComponent = {
											id: this.dropId,
											componentRef: this.dragItem,
										};
										if (!this.componentsService[updateIdx]) {
											this.componentsService = Object.assign([], this.componentsService, {
												[updateIdx]: componentItem,
											});
										}
										this.updateBackUpTask('type', `isUpdated`);
										this.updateBackUpTask('id', this.layoutService.backupId);
										this.updateIndexes(this.sectionIndex, -1, -1, 'section');
										this.updateBackUpTask(
											'oldObject',
											this.layoutService.template.sections[this.sectionIndex].isUpdated,
										);
										this.layoutService.template.sections[this.sectionIndex]['isUpdated'] = true;
										this.updateBackUpTask(
											'newObject',
											this.layoutService.template.sections[this.sectionIndex].isUpdated,
										);
										this.changeDetector.detectChanges();
									}
									this.dragItem = null;
									this.subjectService.refreshItem([]);
								});
						} else {
							this.setTemplateProperty('uiCompIds', this.getNextUICompId(0), false);
							this.layoutService.template.sections[this.sectionIndex].dashboard.push(res);
							this.layoutService.template.sections[this.sectionIndex].dashboard[
								this.layoutService.template.sections[this.sectionIndex].dashboard?.length - 1
							].obj.uicomponent_name = JSON.stringify(this.layoutService.template.uiCompIds);
							this.updateBackUpTask('type', `addItem`);
							this.updateBackUpTask('id', this.layoutService.backupId);
							this.updateIndexes(
								this.sectionIndex,
								this.layoutService.template.sections[this.sectionIndex].dashboard?.length - 1,
								-1,
								'addItem',
							);
							this.updateBackUpTask('oldObject', null);
							this.updateBackUpTask(
								'newObject',
								cloneDeep(
									this.layoutService.template.sections[this.sectionIndex].dashboard[
										this.layoutService.template.sections[this.sectionIndex].dashboard?.length - 1
									],
								),
							);
							this.dropId = res.id;
							const { componentsService } = this;
							const comp: IComponent = componentsService.find((c) => c.id === this.dropId);
							const updateIdx: number = comp
								? componentsService.indexOf(comp)
								: componentsService?.length;
							const componentItem: IComponent = {
								id: this.dropId,
								componentRef: this.dragItem,
							};
							if (!this.componentsService[updateIdx]) {
								this.componentsService = Object.assign([], this.componentsService, {
									[updateIdx]: componentItem,
								});
							}
							this.dragItem = null;
						}
						this.setHorizontalTheme();
						this.setVerticalTheme();
					}
				}
				this.subjectService.refreshItem([]);
				this.layoutService.backupId++;
			}
		});
		this.subscription6 = this.subjectService.castPasteItem.subscribe((res) => {
			if (res?.length !== 0) {
				this.dropItem(res['obj']['type']);
				res.isClick = false;
				res = cloneDeep(res);
				delete res.uicomponent_id;
				for (let i: number = 0; res.obj.options && i < res.obj.options?.length; i++) {
					res.obj.options[i].selectedLinkSection = {};
					res.obj.options[i].selectedLinkUi = {};
				}
				res.id = UUID();
				let check = true;
				for (
					let i: number = 0;
					i < this.layoutService.template.sections[this.copySectionIndex].dashboard?.length;
					i++
				) {
					if (
						this.layoutService.template.sections[this.copySectionIndex].dashboard[i].obj.emptyCell
					) {
						this.layoutService.template.sections[this.copySectionIndex].dashboard.splice(i, 1);
						this.emptyCellItem = {};
						this.emptyCellItemIndex = { sectionIndex: -1, dashboardIndex: -1 };
						i--;
						continue;
					}
					if (
						this.layoutService.template.sections[this.copySectionIndex].dashboard[i].id === res.id
					) {
						check = false;
					} else if (
						this.layoutService.template.sections[this.copySectionIndex].dashboard[i].x <= res.x &&
						this.layoutService.template.sections[this.copySectionIndex].dashboard[i].cols +
							this.layoutService.template.sections[this.copySectionIndex].dashboard[i].x >
							res.x &&
						this.layoutService.template.sections[this.copySectionIndex].dashboard[i].y <= res.y &&
						this.layoutService.template.sections[this.copySectionIndex].dashboard[i].rows +
							this.layoutService.template.sections[this.copySectionIndex].dashboard[i].y >
							res.y
					) {
						check = false;
						this.toastrService.error('UI already exists', '', { timeOut: 6000 });
						this.subjectService.pasteItem([]);
						this.layoutService.backupId++;
						return;
					}
				}
				if (check) {
					this.setTemplateProperty('uiCompIds', this.getNextUICompId(0), false);
					this.layoutService.template.sections[this.copySectionIndex].dashboard.push(res);
					this.layoutService.template.sections[this.copySectionIndex].dashboard[
						this.layoutService.template.sections[this.copySectionIndex].dashboard?.length - 1
					].obj.uicomponent_name = JSON.stringify(this.layoutService.template.uiCompIds);
					this.updateBackUpTask('type', `addItem`);
					this.updateBackUpTask('id', this.layoutService.backupId);
					this.updateIndexes(
						0,
						this.layoutService.template.sections[this.copySectionIndex].dashboard?.length - 1,
						-1,
						'addItem',
					);
					this.updateBackUpTask('oldObject', null);
					this.updateBackUpTask(
						'newObject',
						cloneDeep(
							this.layoutService.template.sections[this.copySectionIndex].dashboard[
								this.layoutService.template.sections[this.copySectionIndex].dashboard?.length - 1
							],
						),
					);
					this.dropId = res.id;
					const { componentsService } = this;
					const comp: IComponent = componentsService.find((c) => c.id === this.dropId);
					const updateIdx: number = comp
						? componentsService.indexOf(comp)
						: componentsService?.length;
					const componentItem: IComponent = {
						id: this.dropId,
						componentRef: this.dragItem,
					};
					if (!this.componentsService[updateIdx]) {
						this.componentsService = Object.assign([], this.componentsService, {
							[updateIdx]: componentItem,
						});
					}
					this.changeDetector.detectChanges();
					this.dragItem = null;
					this.layoutService.backupId++;
					this.subjectService.pasteItem([]);
				}
			}
		});
		this.subscription7 = this.subjectService.castEmptyCellClick.subscribe((res) => {
			this.selectedSectionIndex = null;
			if (
				res?.length !== 0 &&
				res != 'right' &&
				!this.dragStartCheck &&
				this.layoutService.template.sections?.length
			) {
				for (
					let i: number = 0;
					this.layoutService.template.sections[this.copySectionIndex] &&
					i < this.layoutService.template.sections[this.copySectionIndex].dashboard?.length;
					i++
				) {
					let item = this.layoutService.template.sections[this.copySectionIndex].dashboard[i];
					if (
						this.layoutService.template.sections[this.copySectionIndex].dashboard[i].obj.emptyCell
					) {
						let tempLastI = this.layoutService.lastI;
						let tempLastK = this.layoutService.lastK;
						this.layoutService.lastI = this.copySectionIndex;
						this.layoutService.lastK = i;
						this.removeItem(
							this.layoutService.template.sections[this.copySectionIndex].dashboard[i],
							'col',
							false,
							this.copySectionIndex,
							false,
						);
						i--;
						this.layoutService.lastI = tempLastI;
						this.layoutService.lastK = tempLastK;
					}
					if (
						res.x >= item.x &&
						res.x <= item.x + item.cols - 1 &&
						res.y >= item.y &&
						res.y <= item.y + item.rows - 1 &&
						!item.obj.emptyCell
					) {
						this.itemClick(this.copySectionIndex, i, item);
						this.subjectService.emptyCellClickFunc([]);
						return;
					}
				}
				if (this.selectedComponents?.length && !this.shiftPressed) {
					for (let component of this.selectedComponents) {
						if (
							this.layoutService.template.sections[component.sectionIndex].dashboard[
								component.dashboardIndex
							]
						) {
							this.layoutService.template.sections[component.sectionIndex].dashboard[
								component.dashboardIndex
							].isClick = false;
						}
					}
					this.selectedComponents = [];
				}
				if (this.emptyCellItemIndex.sectionIndex != -1) {
					let tempCheck = false;
					if (
						this.emptyCellItem.x == res.x &&
						this.emptyCellItem.y == res.y &&
						this.emptyCellItem.cols == res.cols &&
						this.emptyCellItem.rows == res.rows
					) {
						tempCheck = true;
					}
					let tempLastI = this.layoutService.lastI;
					let tempLastK = this.layoutService.lastK;
					this.layoutService.lastI = this.emptyCellItemIndex.sectionIndex;
					this.layoutService.lastK = this.emptyCellItemIndex.dashboardIndex;
					if (
						this.layoutService.template.sections[this.emptyCellItemIndex.sectionIndex].dashboard[
							this.emptyCellItemIndex.dashboardIndex
						]
					) {
						this.removeItem(
							this.layoutService.template.sections[this.emptyCellItemIndex.sectionIndex].dashboard[
								this.emptyCellItemIndex.dashboardIndex
							],
							'col',
							false,
							this.emptyCellItemIndex.sectionIndex,
							false,
						);
					}
					this.layoutService.lastI = tempLastI;
					this.layoutService.lastK = tempLastK;
					if (tempCheck) {
						this.emptyCellItem = {};
						this.emptyCellItemIndex = {
							sectionIndex: -1,
							dashboardIndex: -1,
						};
						this.subjectService.emptyCellClickFunc([]);
						return;
					}
				}
				this.emptyCellItem = {};
				this.emptyCellItemIndex = { sectionIndex: -1, dashboardIndex: -1 };
				this.emptyCellItem = res;
				this.emptyCellItemIndex = {
					sectionIndex: this.copySectionIndex,
					dashboardIndex:
						this.layoutService.template.sections[this.copySectionIndex].dashboard?.length,
				};
				let tempItem = {
					x: res.x,
					y: res.y,
					cols: res.cols,
					rows: res.rows,
					obj: {
						showSimpleTextProperties: false,
						sameLineInput: false,
						hidePdf: 0,
						type: this.uicomponentTypes.TEXT,
						isStatement: true,
						instanceStatement: '',
						alignment: 'center',
						statement: ' ',
						textInput: ' ',
						extra: true,
						answers: [],
						tags: [],
						bold: false,
						underLine: false,
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
						lineSpacingValue: 15,
						bgColor: false,
						backgroundColor: '#ff0000',
						fontColor: false,
						fontColorCode: '#000000',
						fontFamily: false,
						fontFamilyValue: '',
						linked_ui: 0,
						selected_linked_ui_component: 0,
						errors: 0,
						emptyCell: true,
					},
					id: UUID(),
				};
				this.dragItem = this.uicomponentTypes.TEXT;
				this.layoutService.template.sections[this.copySectionIndex].dashboard.push(tempItem);
				this.dropId = tempItem.id;
				const { componentsService } = this;
				const comp: IComponent = componentsService.find((c) => c.id === this.dropId);
				const updateIdx: number = comp ? componentsService.indexOf(comp) : componentsService?.length;
				const componentItem: IComponent = {
					id: this.dropId,
					componentRef: this.dragItem,
				};
				if (!this.componentsService[updateIdx]) {
					this.componentsService = Object.assign([], this.componentsService, {
						[updateIdx]: componentItem,
					});
				}
				this.layoutService.template.sections[this.copySectionIndex]['isUpdated'] = true;
				this.layoutService.lastI = this.copySectionIndex;
				this.removeCollapsePropertiesTab();
				this.setPropertiesTab('showSectionProperties');
				this.setPropertiesTab('showSections');
				this.setPropertiesTab('showUIComponents');
				this.setCollapsePropertiesTab('showSectionProperties');
				this.changeDetector.detectChanges();
				this.subjectService.emptyCellClickFunc([]);
			}
		});
		this.subscription3 = this.subjectService.castGridRefresh.subscribe((res) => {
			if (res?.length !== 0) {
				this.checkSectionsTick();
				this.subjectService.gridRefreshItem('');
			}
		});
		this.subscription8 = this.subjectService.castTableDropdownItem.subscribe(async (res) => {
			if (
				res?.length !== 0 &&
				this.layoutService.template.sections[this.topLevelIndex] &&
				(this.layoutService.editorView || this.layoutService.isShowEditor)
			) {
				await this.instanceSectionChange(this.layoutService.template.sections[this.topLevelIndex]);
				this.subjectService.tableDropdownSelection('');
			}
		});
		this.subscriptions.push(this.subscription1);
		this.subscriptions.push(this.subscription2);
		this.subscriptions.push(this.subscription3);
		this.subscriptions.push(this.subscription4);
		this.subscriptions.push(this.subscription5);
		this.subscriptions.push(this.subscription6);
		this.subscriptions.push(this.subscription7);
		this.subscriptions.push(this.subscription8);
		const scheduler = this.storageData.getSchedulerInfo();
		let inst = false;
		
		let templateObj = scheduler.template_instance;
		if (!templateObj) {
			templateObj = {};
		}
		this.templateObjInfo = templateObj;
		if (this.route.url == '/template-manager/instance' && this.layoutService?.templateObj) {
			this.layoutService.editorView = true;
			inst = true;
		
			this.layoutService.templateObj['provider_doctor_name'] = templateObj?.provider_doctor_name ? templateObj.provider_doctor_name : ''
			let mid= this.templateObjInfo?.patient?.middleName ? this.templateObjInfo?.patient?.middleName + ' ' : ' ';
			this.layoutService.templateObj['patient_name'] = this.templateObjInfo?.patient?.firstName+' '+mid+this.templateObjInfo?.patient?.lastName
		}
		this.appointment_idd = templateObj.id;
		this.speciality_idd = templateObj.speciality_id;
		this.visit_type_idd = templateObj.visitId;
		this.visit_idd = templateObj.templateVisitId;
		this.visit_status = templateObj.visitStatus;
		this.location_idd = templateObj.location_id;
		this.case_idd = templateObj.case_type_id;
		this.template_idd = templateObj.template_id || this.layoutService.template.template_id;
		this.requestService
			.sendRequest(
				TemaplateManagerUrlsEnum.getUserHeaderFooters,
				'POST',
				REQUEST_SERVERS.templateManagerUrl,
				{
					location_id: this.location_idd || 35,
					speciality_id: this.speciality_idd || 1,
					visit_type_id: this.visit_type_idd || 1,
					case_type_id: this.case_idd || 1,
				},
			)
			.subscribe(
				async (res: any) => {
					this.layoutService.defaultHeadersObject = [];
					this.layoutService.defaultFootersObject = [];
					let headerCheck = false;
					let footerCheck = false;
					for (let tempHeader of res.data[0].headers) {
						if (tempHeader.is_default_header) {
							if (!this.layoutService.header) {
								this.layoutService.headerIndex = 0;
								this.layoutService.header = tempHeader;
							}
							this.layoutService.defaultHeadersObject.push(tempHeader);
							headerCheck = true;
						}
					}
					for (let tempHeader of res.data[0].footers) {
						if (tempHeader.is_default_header) {
							if (!this.layoutService.footer) {
								this.layoutService.footerIndex = 0;
								this.layoutService.footer = tempHeader;
							}
							this.layoutService.defaultFootersObject.push(tempHeader);
							footerCheck = true;
						}
					}
					if (!this.layoutService.header) {
						this.layoutService.defaultHeaderMarginLeft = 5;
						this.layoutService.defaultHeaderMarginRight = 5;
					} else {
						this.layoutService.defaultHeaderMarginLeft = this.layoutService.header.headerMarginLeft;
						this.layoutService.defaultHeaderMarginRight =
							this.layoutService.header.headerMarginRight;
					}
					if (!this.layoutService.footer) {
						this.layoutService.defaultFooterMarginLeft = 5;
						this.layoutService.defaultFooterMarginRight = 5;
					} else {
						this.layoutService.defaultFooterMarginLeft = this.layoutService.footer.headerMarginLeft;
						this.layoutService.defaultFooterMarginRight =
							this.layoutService.footer.headerMarginRight;
					}
					await this.saveAlignment();
				},
				(err) => {
					console.log(err);
					this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
					this.stopLoader();
				},
			);
		if (this.route.url == '/template-manager') {
			if (this.layoutService.template.appointment_id) {
				delete this.layoutService.template.appointment_id;
			}
			if (this.layoutService.template.visit_id) {
				delete this.layoutService.template.visit_id;
			}
			const scheduler = this.storageData.getSchedulerInfo();
			scheduler.template_instance = {};
			this.storageData.setSchedulerInfo(scheduler);
			inst = false;
			this.layoutService.isShowEditor = false;
			this.layoutService.editorView = false;
			this.requestService
				.sendRequest(TemplateMasterUrlEnum.specialities, 'GET', REQUEST_SERVERS.fd_api_url)
				.subscribe(
					(response: HttpSuccessResponse) => {
						if(response?.result?.data?.length){
							this.specialities = JSON.parse(JSON.stringify(response.result.data));
							for (let i: number = 0; i < this.specialities?.length; i++) {
								let opt = {
									instanceLabel: this.specialities[i].name,
									textLabel: this.specialities[i].name,
									label: this.specialities[i].name,
									selected: false,
									hide: false,
									link: false,
									input: false,
									inputValue: '',
									instanceInputValue: '',
									height: 30,
									decimalPlacesLimit: '',
									decimalRoundOff: false,
									commentsPlaceholder: 'Type Here',
									is_required: false,
									minLimit: '',
									maxLimit: '',
									fontSize: '3',
									minMaxCheck: false,
									validationValue: {},
									validationCheck: false,
									showOption: true,
									selectedLinkSection: {},
									linkedStatement: '',
									selectedLinkUi: {},
									linkedUICheck: false,
									linkedStatementCheck: false,
								};
								this.specialities[i] = { ...this.specialities[i], ...opt };
							}
						}
					},
					(err) => {
						console.log(err);
						this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
						this.stopLoader();
					},
				);
			this.requestService
				.sendRequest(
					TemaplateManagerUrlsEnum.fieldsControls + '?category=2',
					'GET',
					REQUEST_SERVERS.fd_api_url,
				)
				.subscribe(
					(response: HttpSuccessResponse) => {
						if(response?.result?.data?.length){
							this.allExternalSlugs = response.result.data;
							for (let item of this.allExternalSlugs) {
								(item.selectedUI = []), (item.addedFields = []);
							}
						}
					},
					(err) => {
						console.log(err);
						this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
						this.stopLoader();
					},
				);
		}
		if (inst) {
			this.layoutService.isLoaderPending.next(true);
			this.instanceCodes()
		}
		if (this.layoutService.template.sections?.length > 0) {
			this.sectionCreated = true;
			if (!this.layoutService.componentsService) {
				this.layoutService.componentsService = [];
			}
			this.componentsService = cloneDeep(this.layoutService.componentsService);
		}
		this.form = this.fb.group({
			tag: [undefined],
		});
		this.requestService
			.sendRequest(TemaplateManagerUrlsEnum.fieldsControls, 'GET', REQUEST_SERVERS.fd_api_url)
			.subscribe(
				(response: HttpSuccessResponse) => {
					if(response?.result?.data?.length) {
						this.PreDummylist = response.result.data;
						this.PreDefinedListText = this.PreDummylist.filter((x) => x.field_type == 'text_field');
						this.PreDefinedListDropDown = this.PreDummylist.filter(
							(x) => x.field_type == 'multiple_dropdown',
						);
					}
				},
				(err) => {
					console.log(err);
					this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
					this.stopLoader();
				},
			);
		this.requestService
			.sendRequest(
				TemaplateManagerUrlsEnum.getSectionTypes,
				'GET',
				REQUEST_SERVERS.templateManagerUrl,
			)
			.subscribe(
				(res: any) => {
					for (let i: number = 0; i < res.data?.length; i++) {
						if (res.data[i].name === 'Section') {
							this.layoutService.NormalSectionTypeId = res.data[i].id;
						} else if (res.data[i].name === 'Subjective') {
							this.layoutService.subjectiveSectionTypeId = res.data[i].id;
						} else if (res.data[i].name === 'Objective') {
							this.layoutService.objectiveSectionTypeId = res.data[i].id;
						} else if (res.data[i].name === 'Assessment') {
							this.layoutService.assessmentSectionTypeId = res.data[i].id;
						} else if (res.data[i].name === 'Plan Of Care') {
							this.layoutService.planSectionTypeId = res.data[i].id;
						}
					}
				},
				(err) => {
					console.log(err);
					this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
					this.stopLoader();
				},
			);
		this.removeCollapsePropertiesTab();
		this.setPropertiesTab('showTemplateProperties');
		this.setCollapsePropertiesTab('showTemplateProperties');
		this.GetHeightValue();
	}

	async instanceCodes() {
		this.layoutService.isShowEditor = false;
		await this.getInstance(0);
		this.requestService
			.sendRequest(
				TemaplateManagerUrlsEnum.getVisitTypeIcdCptCode +
					'?token=' +
					this.localStorage.get('token') +
					'&id=' +
					this.visit_idd,
				'GET',
				REQUEST_SERVERS.fd_api_url,
			)
			.subscribe(
				(res: any) => {
					let cpt_codes = res.result.data.cpt_codes;
					let icd_10_codes = res.result.data.icd_codes;
					for (let slug of this.layoutService.template.allExternalSlugs) {
						if (slug.slug == 'cpt_codes' && slug.selectedUI?.length) {
							for (
								let sectionIndex: number = 0;
								sectionIndex < this.layoutService.template.sections?.length;
								sectionIndex++
							) {
								for (
									let dashboardIndex: number = 0;
									dashboardIndex <
									this.layoutService.template.sections[sectionIndex].dashboard?.length;
									dashboardIndex++
								) {
									for (
										let slugIndex: number = 0;
										slugIndex < slug.selectedUI?.length;
										slugIndex++
									) {
										if (
											this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex]
												.obj.uicomponent_name == slug.selectedUI[slugIndex].id
										) {
											if (
												this.layoutService.template.sections[sectionIndex].dashboard[
													dashboardIndex
												].obj.preDefinedObj &&
												this.layoutService.template.sections[sectionIndex].dashboard[
													dashboardIndex
												].obj.preDefinedObj.slug == 'cpt_codes'
											) {
												if(cpt_codes.length) {
													for (let option of this.layoutService.template.sections[sectionIndex]
														.dashboard[dashboardIndex].obj?.options){
															option.selected=false
														}
														this.layoutService.template.sections[sectionIndex]
														.dashboard[dashboardIndex].obj.answers=[]
												}
												for (let code of cpt_codes) {
													this.codeSelectionCheck(code,sectionIndex,dashboardIndex)
												}
												// code for cpt pre selection from appointment data 
												// only for the first in case of not saving
												if(!this.layoutService?.template?.form_id) {
													for (let codeB of this.templateObjInfo?.appointment_cpt_codes) {
														let code= codeB.billingCode
														this.codeSelectionCheck(code,sectionIndex,dashboardIndex)
													}
												}
											}
										}
									}
								}
							}
						} else if (slug.slug == 'icd_10_codes' && slug.selectedUI?.length) {
							for (
								let sectionIndex: number = 0;
								sectionIndex < this.layoutService.template.sections?.length;
								sectionIndex++
							) {
								for (
									let dashboardIndex: number = 0;
									dashboardIndex <
									this.layoutService.template.sections[sectionIndex].dashboard?.length;
									dashboardIndex++
								) {
									for (
										let slugIndex: number = 0;
										slugIndex < slug.selectedUI?.length;
										slugIndex++
									) {
										if (
											this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex]
												.obj.uicomponent_name == slug.selectedUI[slugIndex].id
										) {
											if (
												this.layoutService.template.sections[sectionIndex].dashboard[
													dashboardIndex
												].obj.preDefinedObj &&
												this.layoutService.template.sections[sectionIndex].dashboard[
													dashboardIndex
												].obj.preDefinedObj.slug == 'icd_10_codes'
											) {
												if(icd_10_codes.length) {
													for (let option of this.layoutService.template.sections[sectionIndex]
														.dashboard[dashboardIndex].obj?.options){
															option.selected=false
														}
														this.layoutService.template.sections[sectionIndex]
														.dashboard[dashboardIndex].obj.answers=[]
												}
												for (let icd of icd_10_codes) {
													this.codeSelectionCheck(icd,sectionIndex,dashboardIndex)
													
												}
											}
										}
									}
								}
							}
						}
					}
					console.log('Retrieved ovada codes');
				},
				(err) => {
					console.log(err);
					this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
					this.stopLoader();
				},
			);
	}

	codeSelectionCheck(code:any,sectionIndex:any,dashboardIndex:any){
		let optionFound = false;
		let itemNew={
			label: code.name + '-' + code.description,
			textLabel: code.name + '-' + code.description,
			instanceLabel: code.name + '-' + code.description,
			selected: true,
			hide: false,
			id: code.id,
			link: false,
			input: false,
			inputValue: '',
			instanceInputValue: '',
			OptionViewValue: '1',
			selectedLinkSection: {},
		}
		for (let option of this.layoutService.template.sections[sectionIndex]
			.dashboard[dashboardIndex].obj?.options) {
			if (code.id == option.id) {
				optionFound = true;
				option.selected=true;
				itemNew=option;
				break;
			}
		}
		if (!optionFound) {
			code["label"] = code.name + ' - ' + code.description;
			this.layoutService.template.sections[sectionIndex].dashboard[
				dashboardIndex
			].obj.options.push(itemNew);
		}
		this.layoutService.template.sections[sectionIndex].dashboard[
			dashboardIndex].obj.answers.push(itemNew)
	}

	multiPdfSelectIntance(e) {
		this.selectPreview(e);
	}
	getNextUICompId(min) {
		let minId = min + 1;
		loop1: while (true) {
			for (let section of this.layoutService.template.sections) {
				for (let component of section.dashboard) {
					if (minId == parseInt(component.obj.uicomponent_name)) {
						minId++;
						continue loop1;
					}
				}
			}
			break;
		}
		return minId;
	}
	setHorizontalTheme() {
		if (!this.layoutService.template.sections[this.layoutService.lastI]) return;
		let tempHeight: number = 0;
		let colsLength: number = 0;
		for (let component of this.layoutService.template.sections[this.layoutService.lastI]
			.dashboard) {
			if (component.y == 0) {
				colsLength = colsLength + component.cols;
				if (!tempHeight) {
					tempHeight = component.rows;
				} else {
					if (component.rows != tempHeight) {
						this.layoutService.template.sections[this.layoutService.lastI].horizontalThemeCheck =
							false;
						if (this.layoutService.template.sections[this.layoutService.lastI].theme == 1) {
							this.layoutService.template.sections[this.layoutService.lastI].theme = 0;
						}
						return;
					}
				}
			}
		}
		if (
			colsLength == this.layoutService.template.sections[this.layoutService.lastI].options.maxCols
		) {
			this.layoutService.template.sections[this.layoutService.lastI].horizontalThemeCheck = true;
		} else {
			this.layoutService.template.sections[this.layoutService.lastI].horizontalThemeCheck = false;
			if (this.layoutService.template.sections[this.layoutService.lastI].theme == 1) {
				this.layoutService.template.sections[this.layoutService.lastI].theme = 0;
			}
			return;
		}
	}
	setVerticalTheme() {
		if (!this.layoutService.template.sections[this.layoutService.lastI]) return;
		let tempWidth: number = 0;
		let rowsLength: number = 0;
		for (let component of this.layoutService.template.sections[this.layoutService.lastI]
			.dashboard) {
			if (component.x == 0) {
				rowsLength = rowsLength + component.rows;
				if (!tempWidth) {
					tempWidth = component.cols;
				} else {
					if (component.cols != tempWidth) {
						this.layoutService.template.sections[this.layoutService.lastI].verticalThemeCheck =
							false;
						if (this.layoutService.template.sections[this.layoutService.lastI].theme == 2) {
							this.layoutService.template.sections[this.layoutService.lastI].theme = 0;
						}
						return;
					}
				}
			}
		}
		if (
			rowsLength == this.layoutService.template.sections[this.layoutService.lastI].options.maxRows
		) {
			this.layoutService.template.sections[this.layoutService.lastI].verticalThemeCheck = true;
		} else {
			this.layoutService.template.sections[this.layoutService.lastI].verticalThemeCheck = false;
			if (this.layoutService.template.sections[this.layoutService.lastI].theme == 2) {
				this.layoutService.template.sections[this.layoutService.lastI].theme = 0;
			}
			return;
		}
	}
	setBothTheme() {
		if (!this.layoutService.template.sections[this.layoutService.lastI]) return;
		let tempWidth: number = 0;
		let rowsLength: number = 0;
		for (let component of this.layoutService.template.sections[this.layoutService.lastI]
			.dashboard) {
			if (component.x == 0) {
				rowsLength = rowsLength + component.rows;
				if (!tempWidth) {
					tempWidth = component.cols;
				} else {
					if (component.cols != tempWidth) {
						this.layoutService.template.sections[this.layoutService.lastI].verticalThemeCheck =
							false;
						if (this.layoutService.template.sections[this.layoutService.lastI].theme == 3) {
							this.layoutService.template.sections[this.layoutService.lastI].theme = 0;
						}
						return;
					}
				}
			}
		}
		if (
			rowsLength == this.layoutService.template.sections[this.layoutService.lastI].options.maxRows
		) {
			this.layoutService.template.sections[this.layoutService.lastI].verticalThemeCheck = true;
		} else {
			this.layoutService.template.sections[this.layoutService.lastI].verticalThemeCheck = false;
			if (this.layoutService.template.sections[this.layoutService.lastI].theme == 3) {
				this.layoutService.template.sections[this.layoutService.lastI].theme = 0;
			}
			return;
		}
	}
	public pageNumbers = [];
	public innerWidth =
		this.layoutService.template.pageSize.width * this.ppiRatio -
		25 -
		(this.layoutService.template.pdfMarginLeft * this.ppiRatio +
			this.layoutService.template.pdfMarginRight * this.ppiRatio);
	public innerHeight =
		this.layoutService.template.pageSize.height * this.ppiRatio -
		45 -
		(this.layoutService.template.pdfMarginTop * this.ppiRatio +
			this.layoutService.template.pdfMarginBottom * this.ppiRatio);
	public innerDefaultHeaderWidth = this.layoutService.template.pageSize.width * this.ppiRatio - 25;
	public innerDefaultFooterWidth = this.layoutService.template.pageSize.width * this.ppiRatio - 25;
	async saveAlignment() {
		await this.headerEmptyCheck(this.layoutService.header, 'header');
		await this.headerEmptyCheck(this.layoutService.footer, 'footer');
		if (!this.layoutService.header) {
			this.layoutService.defaultHeaderMarginLeft = 5;
			this.layoutService.defaultHeaderMarginRight = 5;
		}
		if (!this.layoutService.footer) {
			this.layoutService.defaultFooterMarginLeft = 5;
			this.layoutService.defaultFooterMarginRight = 5;
		}
		this.innerWidth =
			this.layoutService.template.pageSize.width * this.ppiRatio -
			25 -
			(this.layoutService.template.pdfMarginLeft * this.ppiRatio +
				this.layoutService.template.pdfMarginRight * this.ppiRatio);
		this.innerHeight =
			this.layoutService.template.pageSize.height * this.ppiRatio -
			45 -
			(this.layoutService.template.pdfMarginTop * this.ppiRatio +
				this.layoutService.template.pdfMarginBottom * this.ppiRatio);
		this.innerDefaultHeaderWidth =
			this.layoutService.template.pageSize.width * this.ppiRatio -
			25 -
			(this.layoutService.defaultHeaderMarginLeft * this.ppiRatio +
				this.layoutService.defaultHeaderMarginRight * this.ppiRatio);
		this.innerDefaultFooterWidth =
			this.layoutService.template.pageSize.width * this.ppiRatio -
			25 -
			(this.layoutService.defaultFooterMarginLeft * this.ppiRatio +
				this.layoutService.defaultFooterMarginRight * this.ppiRatio);
		await this.makeHeaderText();
		this.changeDetector.detectChanges();
	}
	widthOptions: Options = {
		floor: 0,
		ceil: 100,
	};
	rangeOptions: Options = {
		floor: 1,
		ceil: 6,
	};
	changedOptions() {
		if (this.options.api && this.options.api.optionsChanged) {
			this.options.api.optionsChanged();
		}
	}
	toggleHideInstance($event) {
		$event.preventDefault();
		setTimeout(() => {
			if (this.layoutService.template.sections[this.selectedSection].parentId != 0) {
				for (let parent of this.layoutService.template.sections) {
					if (
						parent.id == this.layoutService.template.sections[this.selectedSection].parentId &&
						parent.hideInInstance
					) {
						return;
					}
				}
			}
			if (this.layoutService.template.sections[this.selectedSection].hideInInstance) {
				this.layoutService.template.sections[this.selectedSection].hideInInstance = false;
			} else {
				this.layoutService.template.sections[this.selectedSection].hideInInstance = true;
			}
			let currentDepth =
				this.layoutService.template.sections[this.selectedSection].secNo.split('.')?.length - 1;
			for (let z = this.selectedSection + 1; z < this.layoutService.template.sections?.length; z++) {
				let tempDepth = this.layoutService.template.sections[z].secNo.split('.')?.length - 1;
				if (tempDepth > currentDepth) {
					this.layoutService.template.sections[z].hideInInstance =
						this.layoutService.template.sections[this.selectedSection].hideInInstance;
				} else {
					break;
				}
			}
			this.changeDetector.detectChanges();
		}, 0);
	}
	previewLoaded = false;
	async hfImageLoad(check, type) {
		console.log(check);
		console.log(type);
		this.imageLoadCheck++;
		if (this.hfImages == this.imageLoadCheck) {
			await this.pdfPreview(1, '');
		}
	}
	headerHeight = 0;
	footerHeight = 0;
	appendHeader(check, pageDiv) {
		let headerList: any = document.getElementsByClassName('headerDiv');
		let header: any;
		if (check == 0) {
			if (headerList[1]) {
				header = headerList[1].cloneNode(true);
			} else {
				header = headerList[0].cloneNode(true);
			}
		} else {
			header = headerList[0].cloneNode(true);
		}
		header.style.visibility = 'hidden';
		header.style.marginBottom = this.layoutService.template.pdfMarginTop * this.ppiRatio + 'px';
		header.style.width = this.layoutService.template.pageSize.width * this.ppiRatio - 25 + 'px';
		header.children[0].style.width = this.innerDefaultHeaderWidth + 'px';
		header.children[0].style.marginLeft =
			this.layoutService.defaultHeaderMarginLeft * this.ppiRatio + 'px';
		header.children[0].style.marginRight =
			this.layoutService.defaultHeaderMarginRight * this.ppiRatio + 'px';
		document.body.appendChild(header);
		header.style.visibility = '';
		header.style.minHeight = header.offsetHeight + 'px';
		this.headerHeight = header.offsetHeight;
		document.body.removeChild(header);
		pageDiv.appendChild(header);
		return pageDiv;
	}
	pushElementsToEndOfPage (element: HTMLElement): HTMLElement {
		const childrenElements: NodeListOf<HTMLElement> = element.querySelectorAll(".end-of-page");
		for (let i = 0; i < childrenElements?.length; i++) {
			childrenElements[i].style.position = "absolute";
			childrenElements[i].style.bottom = "10px";
		}
		return element
	}
	appendLine(pageDiv) {
		let lineElement = document.createElement('hr');
		lineElement.setAttribute('id', 'pageEndLine');
		lineElement.setAttribute('style', 'border: 0px; background: #f7f7f7; height:1.25em;');
		pageDiv.appendChild(lineElement);
		return pageDiv;
	}
	appendFooter(check, pageDiv, remainingHeight) {
		if (remainingHeight <= 10) {
			remainingHeight = 10;
		}
		let footerList: any = document.getElementsByClassName('footerDiv');
		let footer: any;
		if (check == 0) {
			if (footerList[1]) {
				footer = footerList[1].cloneNode(true);
			} else {
				footer = footerList[0].cloneNode(true);
			}
		} else {
			footer = footerList[0].cloneNode(true);
		}
		footer.style.visibility = 'hidden';
		footer.style.width = this.layoutService.template.pageSize.width * this.ppiRatio - 25 + 'px';
		footer.style.marginTop =
			remainingHeight + this.layoutService.template.pdfMarginBottom * this.ppiRatio - 5 + 'px';
		footer.children[0].style.width = this.innerDefaultFooterWidth + 'px';
		footer.children[0].style.marginLeft =
			this.layoutService.defaultFooterMarginLeft * this.ppiRatio + 'px';
		footer.children[0].style.marginRight =
			this.layoutService.defaultFooterMarginRight * this.ppiRatio + 'px';
		document.body.appendChild(footer);
		footer.style.visibility = '';
		footer.style.minHeight = footer.offsetHeight + 'px';
		this.footerHeight = footer.offsetHeight;
		document.body.removeChild(footer);
		pageDiv.appendChild(footer);
		return pageDiv;
	}
	pdfPreview(check, innerHTML) {
		this.previewLoaded = true;
		this.pageNumbers = [];
		this.layoutService.seperateStringValue = [];
		this.layoutService.seperateMainStringValue = [];
		this.layoutService.elementHeight = false;
		this.layoutService.hfHeight = false;
		let templateName: any = document.getElementsByClassName('templateName');
		if (check == 0) {
			if (templateName[1]) {
				templateName = templateName[0].cloneNode(true);
			} else {
				templateName = templateName[0].cloneNode(true);
			}
		} else {
			templateName = templateName[0].cloneNode(true);
		}
		let pdfIndex: number = 0;
		let mainPdfCheck = false;
		let tempPdfIndex: number = 0;
		for (let i: number = 0; i < this.multiplePreviews?.length; i++) {
			if (this.multiplePreviews[i].selected) {
				pdfIndex = i;
				tempPdfIndex = i;
				if (i == 0) {
					mainPdfCheck = true;
				}
				break;
			}
		}
		for (let allPdfsIndex: number = 0; allPdfsIndex < this.multiplePDFs?.length; allPdfsIndex++) {
			if (pdfIndex != allPdfsIndex && check != 3) {
				continue;
			}
			let pageHeight = this.innerHeight;
			let tempDiv: HTMLElement = document.createElement('div');
			tempDiv.id = 'tempDiv';
			let tempChild: HTMLElement = document.createElement('div');
			tempChild.style.margin = 'auto';
			tempChild.style.fontSize = '15px';
			tempChild.style.background = '#fff';
			tempChild.style.width =
				this.layoutService.template.pageSize.width * this.ppiRatio - 25 + 'px';
			tempDiv.appendChild(tempChild);
			let tempMainDiv: HTMLElement = document.createElement('div');
			tempMainDiv.id = 'tempMainDiv';
			let tempMainChild: HTMLElement = document.createElement('div');
			tempMainChild.style.margin = 'auto';
			tempMainChild.style.fontSize = '15px';
			tempMainChild.style.background = '#fff';
			tempMainChild.style.width =
				this.layoutService.template.pageSize.width * this.ppiRatio - 25 + 'px';
			tempMainDiv.appendChild(tempMainChild);
			document.body.appendChild(templateName);
			let heightCounter: number = 0;
			let currentPage = 1;
			let remainingHeight;
			templateName.style.visibility = '';
			if (templateName.children[0].children[0].children[0].children[0]) {
				templateName.children[0].children[0].children[0].children[0].style.minHeight =
					templateName.children[0].children[0].children[0].children[0].offsetHeight + 'px';
			}
			let templateHeight = templateName.offsetHeight;
			if (!(allPdfsIndex == 0 && !this.layoutService.template.hideTemplateName)) {
				templateHeight = 0;
			}
			if (this.headerHeight + this.footerHeight + templateHeight > pageHeight) {
				this.layoutService.hfHeight = true;
			}
			document.body.removeChild(templateName);
			let pageDiv: HTMLElement = document.createElement('div');
			let pageMainDiv: HTMLElement = document.createElement('div');
			pageDiv = this.appendHeader(check, pageDiv);
			heightCounter += this.headerHeight + this.footerHeight + templateHeight;
			remainingHeight = pageHeight - heightCounter;
			if (allPdfsIndex == 0 && !this.layoutService.template.hideTemplateName) {
				pageDiv.appendChild(templateName);
				pageMainDiv.appendChild(templateName.cloneNode(true));
			}
			pdfIndex = allPdfsIndex;
			let tempTableHeight: number;
			for (let t: number = 0; t < this.multiplePDFs[pdfIndex]?.length; t++) {
				let tempTable: any = document.getElementsByClassName('tablesToPrint' + pdfIndex + t);
				if (tempTable?.length) {
					if (check == 0) {
						if (tempTable[1]) {
							tempTable = tempTable[1].cloneNode(true);
						} else {
							tempTable = tempTable[0].cloneNode(true);
						}
					} else {
						tempTable = tempTable[0].cloneNode(true);
					}
				}
				tempTable.style.visibility = 'hidden';
				tempTable.style.visibility = '';
				tempTable.style.width = this.innerWidth + 'px';
				tempTable.style.position = 'absolute';
				document.body.appendChild(tempTable);
				tempTable.style.minHeight = tempTable.style.offsetHeight + 'px';
				tempTableHeight = tempTable.offsetHeight;
				document.body.removeChild(tempTable);
				tempTable.style.removeProperty('position');
				if (
					(remainingHeight < tempTableHeight ||
						(this.multiplePDFs[pdfIndex][t].printNewPage && allPdfsIndex == 0)) &&
					t != 0
				) {
					pageDiv = this.appendFooter(check, pageDiv, remainingHeight);
					tempDiv.children[0].appendChild(pageDiv);
					pageDiv = this.appendLine(pageDiv);
					tempDiv.children[0].appendChild(pageDiv);
					pageDiv = document.createElement('div');
					pageDiv = this.appendHeader(check, pageDiv);
					heightCounter = this.headerHeight + this.footerHeight;
					currentPage++;
					heightCounter += tempTableHeight;
					pageDiv.appendChild(tempTable);
					pageMainDiv.appendChild(tempTable.cloneNode(true));
					remainingHeight = pageHeight - heightCounter;
				} else {
					heightCounter += tempTableHeight;
					pageDiv.appendChild(tempTable);
					pageMainDiv.appendChild(tempTable.cloneNode(true));
					remainingHeight = pageHeight - heightCounter;
				}
			}
			this.pageNumbers.push(currentPage);
			remainingHeight = pageHeight - heightCounter;
			pageDiv = this.appendFooter(check, pageDiv, remainingHeight);
			tempDiv.children[0].appendChild(pageDiv);
			tempMainDiv.children[0].appendChild(pageMainDiv);
			pageDiv = this.appendLine(pageDiv);
			tempDiv.children[0].appendChild(pageDiv);
			let tempString = tempDiv.innerHTML;
			let tempMainString = tempMainDiv.innerHTML;
			for (
				let keyIndex: number = 0;
				this.layoutService.template.mappingKeyWords &&
				keyIndex < this.layoutService.template.mappingKeyWords?.length;
				keyIndex++
			) {
				let tempRegex = '#' + this.layoutService.template.mappingKeyWords[keyIndex].tag;
				let re = new RegExp(tempRegex, 'g');
				if (
					this.layoutService.template.mappingKeyWords[keyIndex].slug == 'subjective_pronoun' &&
					this.templateObjInfo.gender
				) {
					if (this.templateObjInfo.gender == 'female') {
						tempString = tempString.replace(re, 'She');
						tempMainString = tempMainString.replace(re, 'She');
					} else {
						tempString = tempString.replace(re, 'He');
						tempMainString = tempMainString.replace(re, 'He');
					}
				}
				if (
					this.layoutService.template.mappingKeyWords[keyIndex].slug == 'possessive_pronoun' &&
					this.templateObjInfo.gender
				) {
					if (this.templateObjInfo.gender == 'female') {
						tempString = tempString.replace(re, 'Her');
						tempMainString = tempMainString.replace(re, 'Her');
					} else {
						tempString = tempString.replace(re, 'His');
						tempMainString = tempMainString.replace(re, 'His');
					}
				}
				if (
					this.layoutService.template.mappingKeyWords[keyIndex].field_type == 'text_field' &&
					this.templateObjInfo.hasOwnProperty(
						`${this.layoutService.template.mappingKeyWords[keyIndex].slug}`,
					)
				) {
					tempString = tempString.replace(
						re,
						this.templateObjInfo[`${this.layoutService.template.mappingKeyWords[keyIndex].slug}`],
					);
					tempMainString = tempMainString.replace(
						re,
						this.templateObjInfo[`${this.layoutService.template.mappingKeyWords[keyIndex].slug}`],
					);
				}
				if (this.layoutService.template.mappingKeyWords[keyIndex].slug == 'current_date') {
					let tempDate: any = new Date();
					tempDate = new Date(tempDate.getTime() - tempDate.getTimezoneOffset() * 60000)
						.toISOString()
						.split('T')[0];
					tempString = tempString.replace(re, tempDate);
					tempMainString = tempMainString.replace(re, tempDate);
				}
				if (this.layoutService.template.mappingKeyWords[keyIndex].slug == 'date_time') {
					let tempDate: any = new Date();
					tempDate = new Date(
						tempDate.getTime() - tempDate.getTimezoneOffset() * 60000,
					).toISOString();
					tempString = tempString.replace(re, tempDate);
					tempMainString = tempMainString.replace(re, tempDate);
				}
				if (this.layoutService.template.mappingKeyWords[keyIndex].slug == 'page') {
					const stringArray = tempString.split(
						`<hr id="pageEndLine" style="border: 0px; background: #000000a8; height:1.25em;">`,
					);
					for (let j: number = 0; j < stringArray?.length; j++) {
						stringArray[j] = stringArray[j].replace(re, `${j + 1}`);
					}
					tempString = stringArray.join(
						`<hr id="pageEndLine" style="border: 0px; background: #000000a8; height:1.25em;">`,
					);
				}
				if (this.layoutService.template.mappingKeyWords[keyIndex].slug == 'total_page') {
					const stringArray = tempString.split(
						`<hr id="pageEndLine" style="border: 0px; background: #000000a8; height:1.25em;">`,
					);
					for (let j: number = 0; j < stringArray?.length; j++) {
						stringArray[j] = stringArray[j].replace(re, `${currentPage}`);
					}
					tempString = stringArray.join(
						`<hr id="pageEndLine" style="border: 0px; background: #000000a8; height:1.25em;">`,
					);
				}
			}
			if (this.layoutService.elementHeight && innerHTML == 'random text') {
				// this.coolDialogs
				// 	.confirm(
				// 		'UI Component longer than page size. Current progress will be lost. Are you sure you want to continue? ',
				// 		{
				// 			okButtonText: 'OK',
				// 			cancelButtonText: 'Cancel',
				// 		},
				// 	)
				this.bsModalRef = this.modalServiceDialog.show(ConfirmationDialogComponent, {
					initialState: {
					  message: 'UI Component longer than page size. Current progress will be lost. Are you sure you want to continue?'
					},
					class: 'modal-dialog-centered'
				  });
				  this.bsModalRef.content.result
					.subscribe(async (response) => {
						if (response) {
							if (this.hfImages == 0) {
								await this.pdfPreview(1, '');
							}
							this.layoutService.previewEdited = false;
							this.changeDetector.detectChanges();
							return;
						} else {
							this.layoutService.previewEdited = true;
							this.changeDetector.detectChanges();
							return;
						}
					});
				this.changeDetector.detectChanges();
				return;
			} else if (this.layoutService.elementHeight) {
				this.toastrService.error('UI Component longer than page size. Cannot generate pdf', '', {
					timeOut: 6000,
				});
			}
			tempDiv.innerHTML = tempString;
			tempMainDiv.innerHTML = tempMainString;
			currentPage = 1;
			this.layoutService.seperateStringValue.push(tempDiv.innerHTML);
			this.layoutService.seperateStringValue[this.layoutService.seperateStringValue?.length - 1] =
				this.layoutService.seperateStringValue[
					this.layoutService.seperateStringValue?.length - 1
				].replace(/<!--.*?-->/g, '');
			this.layoutService.seperateStringValue[this.layoutService.seperateStringValue?.length - 1] =
				this.layoutService.seperateStringValue[
					this.layoutService.seperateStringValue?.length - 1
				].replace(/"/g, "'");
			this.layoutService.seperateMainStringValue.push(tempMainDiv.innerHTML);
			this.layoutService.seperateMainStringValue[
				this.layoutService.seperateMainStringValue?.length - 1
			] = this.layoutService.seperateMainStringValue[
				this.layoutService.seperateMainStringValue?.length - 1
			].replace(/<!--.*?-->/g, '');
			this.layoutService.seperateMainStringValue[
				this.layoutService.seperateMainStringValue?.length - 1
			] = this.layoutService.seperateMainStringValue[
				this.layoutService.seperateMainStringValue?.length - 1
			].replace(/"/g, "'");
			this.layoutService.previewEdited = false;
			if (allPdfsIndex == tempPdfIndex) {
				this.layoutService.htmlStringValue = tempDiv.innerHTML;
				this.layoutService.htmlStringValue = this.layoutService.htmlStringValue.replace(
					/<!--.*?-->/gs,
					'',
				);
				this.layoutService.htmlStringValue = this.layoutService.htmlStringValue.replace(/"/g, "'");
				if (!this.livePdfCheck) {
					this.layoutService.isShowEditor = true;
					this.layoutService.editorView = false;
					if (this.layoutService.hfHeight == true) {
						this.layoutService.htmlStringValue = '';
						this.openModel();
					}
				} else {
					if (!this.pdfPreviewWindow || this.pdfPreviewWindow.closed) {
						this.pdfPreviewWindow = window.open('', '_blank', 'width=775,height=1122');
					}
					this.pdfPreviewWindow.focus();
					this.pdfPreviewWindow.document.write(
						'<html><head>' +
							'<link rel="stylesheet" href="' +
							'https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css"/>' +
							'<style type="text/css">' +
							'</style>' +
							'</head><body onload="">' +
							this.layoutService.seperateStringValue +
							'</body></html>',
					);
					this.pdfPreviewWindow.document.close();
					this.livePdfCheck = false;
				}
			}
		}
		this.changeDetector.detectChanges();
	}
	inputValueChange(event: any, i: number) {
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.options[i].instanceInputValue = this.layoutService.template.sections[
			this.layoutService.lastI
		].dashboard[this.layoutService.lastK].obj.options[i].inputValue = this.sanitizeHTML(event);
	}
	optionChanged(event: any, i: number) {
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.options[i].label = this.sanitizeHTML(event);
	}
	defaultValueChanged(event) {
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.defaultValue = this.sanitizeHTML(event);
	}
	linkedStatementChange(event) {
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.linkedStatement = this.sanitizeHTML(event);
	}
	linkedStatementChangeOption(event: any, i: number) {
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.options[i].linkedStatement = this.sanitizeHTML(event);
	}
	sanitizeHTML(string) {
		return this.sanitizer.sanitize(SecurityContext.HTML, string);
	}
	linkedUiRemove(lastI, lastK) {
		for (
			let q: number = 0;
			this.layoutService.template.sections[lastI].dashboard[lastK].obj.options &&
			q < this.layoutService.template.sections[lastI].dashboard[lastK].obj.options?.length;
			q++
		) {
			if (
				this.layoutService.template.sections[lastI].dashboard[lastK].obj.options[q].linkedUICheck &&
				this.layoutService.template.sections[lastI].dashboard[lastK].obj.options[q].selectedLinkUi
			) {
				for (let w: number = 0; w < this.layoutService.template.sections?.length; w++) {
					for (
						let e: number = 0;
						e < this.layoutService.template.sections[w].dashboard?.length;
						e++
					) {
						if (
							this.layoutService.template.sections[lastI].dashboard[lastK].obj.options[q]
								.selectedLinkUi.id ==
							this.layoutService.template.sections[w].dashboard[e].obj.uicomponent_name
						) {
							this.layoutService.template.sections[w].dashboard[e].obj.linked_ui--;
							if (
								this.layoutService.template.sections[lastI].dashboard[lastK].obj.options[q].selected
							) {
								this.updateBackUpTask('type', `selected_linked_ui_component`);
								this.updateBackUpTask('id', this.layoutService.backupId);
								this.updateIndexes(w, e, -1, 'obj');
								this.updateIndexes(w, e, -1, 'obj');
								this.updateBackUpTask(
									'oldObject',
									this.layoutService.template.sections[w].dashboard[e].obj
										.selected_linked_ui_component,
								);
								this.layoutService.template.sections[w].dashboard[e].obj
									.selected_linked_ui_component--;
								this.changeDetector.detectChanges();
								this.updateBackUpTask(
									'newObject',
									this.layoutService.template.sections[w].dashboard[e].obj
										.selected_linked_ui_component,
								);
							}
						}
					}
				}
			}
		}
	}
	removeItem(item, val, $event, index, backupIdCheck) {
		if (item.obj.type == this.uicomponentTypes.TABLE_DROPDOWN) {
			if (backupIdCheck) {
				this.layoutService.backupId++;
			}
			this.toastrService.error('This item cannot be deleted', 'Error', { timeOut: 6000 });
			return;
		}
		this.emptySelectedComponents();
		if (this.emptyCellItemIndex.sectionIndex != -1 && $event) {
			let tempLastI = this.layoutService.lastI;
			let tempLastK = this.layoutService.lastK;
			this.layoutService.lastI = this.emptyCellItemIndex.sectionIndex;
			this.layoutService.lastK = this.emptyCellItemIndex.dashboardIndex;
			if (
				this.layoutService.template.sections[this.emptyCellItemIndex.sectionIndex].dashboard[
					this.emptyCellItemIndex.dashboardIndex
				]
			) {
				this.removeItem(
					this.layoutService.template.sections[this.emptyCellItemIndex.sectionIndex].dashboard[
						this.emptyCellItemIndex.dashboardIndex
					],
					'col',
					false,
					this.emptyCellItemIndex.sectionIndex,
					false,
				);
			}
			this.layoutService.lastI = tempLastI;
			this.layoutService.lastK = tempLastK;
		}
		this.emptyCellItem = {};
		this.emptyCellItemIndex = { sectionIndex: -1, dashboardIndex: -1 };
		for (let i: number = 0; i < this.PreDefinedList?.length && item.obj.preDefinedObj; i++) {
			if (this.PreDefinedList[i].predefinedvalue == item.obj.preDefinedObj.id) {
				this.PreDefinedList.splice(i, 1);
				break;
			}
		}
		let removedIndex = this.layoutService.lastK;
		let tempSection = this.layoutService.lastI;
		if (item.obj['options']) {
			for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
				for (let j: number = 0; j < item.obj.options?.length; j++) {
					if (item.obj.options[j].selectedLinkSection) {
						if (
							item.obj.options[j].selectedLinkSection.id ==
							this.layoutService.template.sections[i].id
						) {
							if (item.obj.options[j].selected) {
								this.updateBackUpTask('type', `selected_linked_component`);
								this.updateBackUpTask('id', this.layoutService.backupId);
								this.updateIndexes(j, -1, -1, 'section');
								this.updateBackUpTask(
									'oldObject',
									this.layoutService.template.sections[j][`selected_linked_component`],
								);
								this.layoutService.template.sections[j].selected_linked_component--;
								this.updateBackUpTask(
									'newObject',
									this.layoutService.template.sections[j][`selected_linked_component`],
								);
							}
							this.updateBackUpTask('type', `linked_component`);
							this.updateBackUpTask('id', this.layoutService.backupId);
							this.updateIndexes(j, -1, -1, 'section');
							this.updateBackUpTask(
								'oldObject',
								this.layoutService.template.sections[j][`linked_component`],
							);
							this.layoutService.template.sections[j].linked_component--;
							this.updateBackUpTask(
								'newObject',
								this.layoutService.template.sections[j][`linked_component`],
							);
							let currentDepth =
								this.layoutService.template.sections[i].secNo.split('.')?.length - 1;
							for (let z = i + 1; z < this.layoutService.template.sections?.length; z++) {
								let tempDepth = this.layoutService.template.sections[z].secNo.split('.')?.length - 1;
								if (tempDepth > currentDepth) {
									if (item.obj.options[j].selected) {
										this.updateBackUpTask('type', `selected_linked_component`);
										this.updateBackUpTask('id', this.layoutService.backupId);
										this.updateIndexes(z, -1, -1, 'section');
										this.updateBackUpTask(
											'oldObject',
											this.layoutService.template.sections[z][`selected_linked_component`],
										);
										this.layoutService.template.sections[z].selected_linked_component--;
										this.updateBackUpTask(
											'newObject',
											this.layoutService.template.sections[z][`selected_linked_component`],
										);
									}
									this.updateBackUpTask('type', `linked_component`);
									this.updateBackUpTask('id', this.layoutService.backupId);
									this.updateIndexes(z, -1, -1, 'section');
									this.updateBackUpTask(
										'oldObject',
										this.layoutService.template.sections[z][`linked_component`],
									);
									this.layoutService.template.sections[z].linked_component--;
									this.updateBackUpTask(
										'newObject',
										this.layoutService.template.sections[z][`linked_component`],
									);
								} else {
									i = z - 1;
									break;
								}
							}
						}
					}
				}
			}
			for (let ab: number = 0; ab < this.searchDataNames?.length; ab++) {
				if (this.searchDataNames[ab].objectid == item.id) {
					this.searchDataNames.splice(ab, 1);
					break;
				}
			}
			for (let x: number = 0; x < this.layoutService.template.sections?.length; x++) {
				for (let y: number = 0; y < this.layoutService.template.sections[x].dashboard?.length; y++) {
					if (
						!isNil(this.layoutService.template.sections[x].dashboard[y].obj.MultiSelectObj) &&
						this.layoutService.template.sections[x].dashboard[y].obj.MultiSelectObj.objectid ==
							item.id
					) {
						this.updateBackUpTask('type', `options`);
						this.updateBackUpTask('id', this.layoutService.backupId);
						this.updateIndexes(x, y, -1, 'obj');
						this.updateBackUpTask(
							'oldObject',
							this.layoutService.template.sections[x].dashboard[y].obj.options,
						);
						this.layoutService.template.sections[x].dashboard[y].obj.options = [];
						this.updateBackUpTask(
							'newObject',
							this.layoutService.template.sections[x].dashboard[y].obj.options,
						);
						delete this.layoutService.template.sections[x].dashboard[y].obj.MultiSelectObj;
					}
				}
			}
		}
		if (val === 'col') {
			if (
				this.layoutService.template.sections[this.layoutService.lastI]['carrySections'] &&
				this.layoutService.template.sections[this.layoutService.lastI]['carrySections']?.length &&
				!this.layoutService.template.sections[this.layoutService.lastI]['isUpdated']
			) {
				// this.coolDialogs
				// 	.confirm(
				// 		'This section is being carry forward in other templates. Changes must be manually updated. Do you still wish to continue?',
				// 		{
				// 			okButtonText: 'OK',
				// 			cancelButtonText: 'Cancel',
				// 		},
				// 	)
				this.bsModalRef = this.modalServiceDialog.show(ConfirmationDialogComponent, {
					initialState: {
					  message: 'This section is being carry forward in other templates. Changes must be manually updated. Do you still wish to continue?'
					},
					class: 'modal-dialog-centered'
				  });
				  this.bsModalRef.content.result
					.subscribe((response) => {
						if (response == true) {
							if ($event) {
								$event.preventDefault();
								$event.stopPropagation();
							}
							this.layoutService.template.sections[this.layoutService.lastI]['isUpdated'] = true;
							if (
								this.layoutService.lastI != null &&
								this.layoutService.template.sections[this.layoutService.lastI] &&
								this.layoutService.template.sections[this.layoutService.lastI].dashboardColCount
							) {
								this.updateBackUpTask('type', `dashboardColCount`);
								this.updateBackUpTask('id', this.layoutService.backupId);
								this.updateIndexes(this.layoutService.lastI, -1, -1, 'section');
								this.updateBackUpTask(
									'oldObject',
									this.layoutService.template.sections[this.layoutService.lastI].dashboardColCount,
								);
								this.layoutService.template.sections[this.layoutService.lastI].dashboardColCount -=
									this.layoutService.template.sections[this.layoutService.lastI].dashboard[
										this.layoutService.lastK
									].cols;
								this.updateBackUpTask(
									'newObject',
									this.layoutService.template.sections[this.layoutService.lastI].dashboardColCount,
								);
							}
							this.selectedLinkUiRemove(this.layoutService.lastI, this.layoutService.lastK);
							this.linkedUiRemove(this.layoutService.lastI, this.layoutService.lastK);
							this.updateBackUpTask('type', `deleteItem`);
							this.updateBackUpTask('id', this.layoutService.backupId);
							this.updateIndexes(
								this.layoutService.lastI,
								this.layoutService.lastK,
								-1,
								'deleteItem',
							);
							this.updateBackUpTask('oldObject', null);
							this.updateBackUpTask(
								'newObject',
								this.layoutService.template.sections[this.layoutService.lastI].dashboard[
									this.layoutService.lastK
								],
							);
							this.layoutService.template.sections[this.layoutService.lastI].dashboard.splice(
								this.layoutService.lastK,
								1,
							);
							this.calculateCalculationFields();
							this.editOptionsTs(this.layoutService.lastI, 0);
							if (
								this.infoInstance.lastI == this.layoutService.lastI &&
								this.infoInstance.lastK == this.layoutService.lastK
							) {
								this.infoInstance.check = false;
							}
							this.setHorizontalTheme();
							this.setVerticalTheme();
							this.changeDetector.detectChanges();
						}
						this.layoutService.lastI = 0;
						this.layoutService.lastK = 0;
					});
			} else {
				if ($event) {
					$event.preventDefault();
					$event.stopPropagation();
				}
				if (
					this.layoutService.lastI != null &&
					this.layoutService.template.sections[this.layoutService.lastI] &&
					this.layoutService.template.sections[this.layoutService.lastI].dashboardColCount
				) {
					this.updateBackUpTask('type', `dashboardColCount`);
					this.updateBackUpTask('id', this.layoutService.backupId);
					this.updateIndexes(this.layoutService.lastI, -1, -1, 'section');
					this.updateBackUpTask(
						'oldObject',
						this.layoutService.template.sections[this.layoutService.lastI].dashboardColCount,
					);
					this.layoutService.template.sections[this.layoutService.lastI].dashboardColCount -=
						this.layoutService.template.sections[this.layoutService.lastI].dashboard[
							this.layoutService.lastK
						].cols;
					this.updateBackUpTask(
						'newObject',
						this.layoutService.template.sections[this.layoutService.lastI].dashboardColCount,
					);
				}
				this.selectedLinkUiRemove(this.layoutService.lastI, this.layoutService.lastK);
				this.linkedUiRemove(this.layoutService.lastI, this.layoutService.lastK);
				this.updateBackUpTask('type', `deleteItem`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'deleteItem');
				this.updateBackUpTask('oldObject', null);
				this.updateBackUpTask(
					'newObject',
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[
						this.layoutService.lastK
					],
				);
				this.layoutService.template.sections[this.layoutService.lastI].dashboard.splice(
					this.layoutService.lastK,
					1,
				);
				this.setHorizontalTheme();
				this.setVerticalTheme();
				this.calculateCalculationFields();
				this.editOptionsTs(this.layoutService.lastI, 0);
				if (
					this.infoInstance.lastI == this.layoutService.lastI &&
					this.infoInstance.lastK == this.layoutService.lastK
				) {
					this.infoInstance.check = false;
				}
				this.layoutService.lastI = 0;
				this.layoutService.lastK = 0;
			}
		}
		if (val === 'row') {
			if (item.rows > 1) {
				this.hoverOutRow(item);
				this.toastrService.error('only col can be deleted as item is in multiple rows', 'Error', {
					timeOut: 6000,
				});
			} else {
				const deleteRowItems = [];
				for (
					let i: number = 0;
					i < this.layoutService.template.sections[this.layoutService.lastI].dashboard?.length;
					i++
				) {
					if (
						item.y ===
							this.layoutService.template.sections[this.layoutService.lastI].dashboard[i].y &&
						this.layoutService.template.sections[this.layoutService.lastI].dashboard[i].rows === 1
					) {
						deleteRowItems.push({ i: this.layoutService.lastI, k: i });
					} else if (
						item.y ===
							this.layoutService.template.sections[this.layoutService.lastI].dashboard[i].y &&
						this.layoutService.template.sections[this.layoutService.lastI].dashboard[i].rows > 1
					) {
						this.hoverOutRow(item);
						this.toastrService.error(
							'only col can be deleted as one of the item in the row is on multiple rows',
							'Error',
							{ timeOut: 6000 },
						);
						if (backupIdCheck) {
							this.layoutService.backupId++;
						}
						return;
					} else if (
						item.y >
							this.layoutService.template.sections[this.layoutService.lastI].dashboard[i].y &&
						this.layoutService.template.sections[this.layoutService.lastI].dashboard[i].rows +
							this.layoutService.template.sections[this.layoutService.lastI].dashboard[i].y >
							item.y
					) {
						this.hoverOutRow(item);
						this.toastrService.error(
							'only col can be deleted as one of the item in the row is on multiple rows .....',
							'Error',
							{ timeOut: 6000 },
						);
						if (backupIdCheck) {
							this.layoutService.backupId++;
						}
						return;
					}
				}
				if (deleteRowItems?.length > 0) {
					// this.coolDialogs
					// 	.confirm('Are you sure you want to delete this row?', {
					// 		okButtonText: 'OK',
					// 		cancelButtonText: 'Cancel',
					// 	})
					this.bsModalRef = this.modalServiceDialog.show(ConfirmationDialogComponent, {
						initialState: {
						  message: 'Are you sure you want to delete this row?'
						},
						class: 'modal-dialog-centered'
					  });
					  this.bsModalRef.content.result
						.subscribe((response) => {
							if (response == true) {
								if (
									this.layoutService.template.sections[this.layoutService.lastI]['carrySections'] &&
									this.layoutService.template.sections[this.layoutService.lastI]['carrySections']
										?.length &&
									!this.layoutService.template.sections[this.layoutService.lastI]['isUpdated']
								) {
									// this.coolDialogs
									// 	.confirm(
									// 		'This section is being carry forward in other templates. Changes must be manually updated. Do you still wish to continue?',
									// 		{
									// 			okButtonText: 'OK',
									// 			cancelButtonText: 'Cancel',
									// 		},
									// 	)
									this.bsModalRef = this.modalServiceDialog.show(ConfirmationDialogComponent, {
										initialState: {
										  message: 'This section is being carry forward in other templates. Changes must be manually updated. Do you still wish to continue?'
										},
										class: 'modal-dialog-centered'
									  });
									  this.bsModalRef.content.result
										.subscribe((response) => {
											if (response == true) {
												if (
													this.infoInstance.lastI == this.layoutService.lastI &&
													this.layoutService.template.sections[this.layoutService.lastI].dashboard[
														this.layoutService.lastK
													].y ==
														this.layoutService.template.sections[this.infoInstance.lastI].dashboard[
															this.infoInstance.lastK
														].y
												) {
													this.infoInstance.check = false;
												}
												for (let x: number = 0; x < deleteRowItems?.length; x++) {
													if ($event) {
														$event.preventDefault();
														$event.stopPropagation();
													}
													if (
														this.layoutService.lastI != null &&
														this.layoutService.template.sections[deleteRowItems[x].i] &&
														this.layoutService.template.sections[deleteRowItems[x].i]
															.dashboardColCount
													) {
														this.updateBackUpTask('type', `dashboardColCount`);
														this.updateBackUpTask('id', this.layoutService.backupId);
														this.updateIndexes(deleteRowItems[x].i, -1, -1, 'section');
														this.updateBackUpTask(
															'oldObject',
															this.layoutService.template.sections[deleteRowItems[x].i]
																.dashboardColCount,
														);
														this.layoutService.template.sections[
															deleteRowItems[x].i
														].dashboardColCount -=
															this.layoutService.template.sections[deleteRowItems[x].i].dashboard[
																deleteRowItems[x].k - x
															].cols;
														this.updateBackUpTask(
															'newObject',
															this.layoutService.template.sections[deleteRowItems[x].i]
																.dashboardColCount,
														);
													}
													this.selectedLinkUiRemove(deleteRowItems[x].i, deleteRowItems[x].k - x);
													this.linkedUiRemove(deleteRowItems[x].i, deleteRowItems[x].k - x);
													this.updateBackUpTask('type', `deleteItem`);
													this.updateBackUpTask('id', this.layoutService.backupId);
													this.updateIndexes(
														deleteRowItems[x].i,
														deleteRowItems[x].k - x,
														-1,
														'deleteItem',
													);
													this.updateBackUpTask('oldObject', null);
													this.updateBackUpTask(
														'newObject',
														this.layoutService.template.sections[deleteRowItems[x].i].dashboard[
															deleteRowItems[x].k - x
														],
													);
													this.layoutService.template.sections[
														deleteRowItems[x].i
													].dashboard.splice(deleteRowItems[x].k - x, 1);
													this.setHorizontalTheme();
													this.setVerticalTheme();
													this.calculateCalculationFields();
													this.editOptionsTs(deleteRowItems[x].i, 0);
												}
												this.updateBackUpTask('type', `isUpdated`);
												this.updateBackUpTask('id', this.layoutService.backupId);
												this.updateIndexes(this.layoutService.lastI, -1, -1, 'section');
												this.updateBackUpTask(
													'oldObject',
													this.layoutService.template.sections[this.layoutService.lastI][
														'isUpdated'
													],
												);
												this.layoutService.template.sections[this.layoutService.lastI][
													'isUpdated'
												] = true;
												this.updateBackUpTask(
													'newObject',
													this.layoutService.template.sections[this.layoutService.lastI][
														'isUpdated'
													],
												);
												this.changeDetector.detectChanges();
											}
											this.layoutService.lastI = 0;
											this.layoutService.lastK = 0;
										});
								} else {
									if (
										this.infoInstance.lastI == this.layoutService.lastI &&
										this.layoutService.template.sections[this.layoutService.lastI].dashboard[
											this.layoutService.lastK
										].y ==
											this.layoutService.template.sections[this.infoInstance.lastI].dashboard[
												this.infoInstance.lastK
											].y
									) {
										this.infoInstance.check = false;
									}
									for (let x: number = 0; x < deleteRowItems?.length; x++) {
										if ($event) {
											$event.preventDefault();
											$event.stopPropagation();
										}
										if (
											this.layoutService.lastI != null &&
											this.layoutService.template.sections[deleteRowItems[x].i] &&
											this.layoutService.template.sections[deleteRowItems[x].i].dashboardColCount
										) {
											this.updateBackUpTask('type', `dashboardColCount`);
											this.updateBackUpTask('id', this.layoutService.backupId);
											this.updateIndexes(deleteRowItems[x].i, -1, -1, 'section');
											this.updateBackUpTask(
												'oldObject',
												this.layoutService.template.sections[deleteRowItems[x].i].dashboardColCount,
											);
											this.layoutService.template.sections[deleteRowItems[x].i].dashboardColCount -=
												this.layoutService.template.sections[deleteRowItems[x].i].dashboard[
													deleteRowItems[x].k - x
												].cols;
											this.updateBackUpTask(
												'newObject',
												this.layoutService.template.sections[deleteRowItems[x].i].dashboardColCount,
											);
										}
										this.selectedLinkUiRemove(deleteRowItems[x].i, deleteRowItems[x].k - x);
										this.linkedUiRemove(deleteRowItems[x].i, deleteRowItems[x].k - x);
										this.updateBackUpTask('type', `deleteItem`);
										this.updateBackUpTask('id', this.layoutService.backupId);
										this.updateIndexes(
											deleteRowItems[x].i,
											deleteRowItems[x].k - x,
											-1,
											'deleteItem',
										);
										this.updateBackUpTask('oldObject', null);
										this.updateBackUpTask(
											'newObject',
											this.layoutService.template.sections[deleteRowItems[x].i].dashboard[
												deleteRowItems[x].k - x
											],
										);
										this.layoutService.template.sections[deleteRowItems[x].i].dashboard.splice(
											deleteRowItems[x].k - x,
											1,
										);
										this.setHorizontalTheme();
										this.setVerticalTheme();
										this.calculateCalculationFields();
										this.editOptionsTs(deleteRowItems[x].i, 0);
									}
									this.layoutService.lastI = 0;
									this.layoutService.lastK = 0;
								}
								this.showUIComponents = true;
								this.showSectionProperties = true;
								this.showSections = true;
								this.showDropDownProperties = false;
								this.showTableDropDownProperties = false;
								this.showTextProperties = false;
								this.showCombinedProperties = false;
								this.showSwitchProperties = false;
								this.showInputProperties = false;
								this.showIncrementProperties = false;
								this.showDrawingProperties = false;
								this.showCalculationProperties = false;
								this.showIntensityProperties = false;
								this.showLineProperties = false;
								this.showSignatureProperties = false;
								this.showIntellisenseProperties = false;
								this.showRadioProperties = false;
								this.showCheckBoxProperties = false;
								this.showImageLabelProperties = false;
								this.showImageProperties = false;
							}
						});
				}
			}
		}
		this.showUIComponents = true;
		this.showSectionProperties = true;
		this.showSections = true;
		this.showDropDownProperties = false;
		this.showTableDropDownProperties = false;
		this.showTextProperties = false;
		this.showCombinedProperties = false;
		this.showSwitchProperties = false;
		this.showInputProperties = false;
		this.showIncrementProperties = false;
		this.showDrawingProperties = false;
		this.showCalculationProperties = false;
		this.showIntensityProperties = false;
		this.showLineProperties = false;
		this.showSignatureProperties = false;
		this.showIntellisenseProperties = false;
		this.showRadioProperties = false;
		this.showCheckBoxProperties = false;
		this.showImageLabelProperties = false;
		this.showImageProperties = false;
		this.optionRefresh(tempSection);
		if (this.layoutService.template.sections[index].is_table && (item.x == 0 || item.y == 0)) {
			let tempDashboard = cloneDeep(this.layoutService.template.sections[index].dashboard);
			let dashboardIndex = -1;
			for (let component of tempDashboard) {
				dashboardIndex++;
				if (item.x == 0) {
					if (component.x != 0 && component.y != 0) {
						if (component.y >= item.y && component.y < item.y + item.rows) {
							this.layoutService.lastI = index;
							this.layoutService.lastK = dashboardIndex;
							this.removeItem(component, 'col', false, index, false);
							dashboardIndex--;
						}
					}
				}
				if (item.y == 0) {
					if (component.x != 0 && component.y != 0) {
						if (component.x >= item.x && component.x < item.x + item.cols) {
							this.layoutService.lastI = index;
							this.layoutService.lastK = dashboardIndex;
							this.removeItem(component, 'col', false, index, false);
							dashboardIndex--;
						}
					}
				}
			}
		}
		if (backupIdCheck) {
			this.layoutService.backupId++;
		}
	}
	selectedLinkSectionsRemove(lastI) {
		for (let i = 0; i < this.layoutService.template.sections?.length; i++) {
			for (let j = 0; j < this.layoutService.template.sections[i].dashboard?.length; j++) {
				for (
					let k = 0;
					this.layoutService.template.sections[i].dashboard[j].obj.options &&
					k < this.layoutService.template.sections[i].dashboard[j].obj.options?.length;
					k++
				) {
					if (
						this.layoutService.template.sections[i].dashboard[j].obj.options[k]
							.selectedLinkSection &&
						this.layoutService.template.sections[i].dashboard[j].obj.options[k].selectedLinkSection
							.id == this.layoutService.template.sections[lastI].id
					) {
						this.setUIPropertyOptions(i, j, 'selectedLinkSection', {}, k, false);
						this.setUIPropertyOptions(i, j, 'link', false, k, false);
						this.setUIPropertyOptions(i, j, 'hide', false, k, false);
					}
				}
			}
		}
	}
	selectedLinkUiRemove(lastI, lastK) {
		for (let i = 0; i < this.layoutService.template.sections?.length; i++) {
			for (let j = 0; j < this.layoutService.template.sections[i].dashboard?.length; j++) {
				for (
					let k = 0;
					this.layoutService.template.sections[i].dashboard[j].obj.options &&
					k < this.layoutService.template.sections[i].dashboard[j].obj.options?.length;
					k++
				) {
					if (
						this.layoutService.template.sections[i].dashboard[j].obj.options[k].selectedLinkUi &&
						this.layoutService.template.sections[i].dashboard[j].obj.options[k].selectedLinkUi.id ==
							this.layoutService.template.sections[lastI].dashboard[lastK].obj.uicomponent_name
					) {
						this.setUIPropertyOptions(i, j, 'selectedLinkUi', {}, k, false);
						this.setUIPropertyOptions(i, j, 'linkedUICheck', false, k, false);
					}
				}
			}
		}
	}
	addRowItem(sectionIndex, noOfRows, rowMapper?, mapperIndex?) {
		this.rowAddItems = 1;
		this.setVerticalTheme();
		this.setHorizontalTheme();
		for (let i: number = 0; i < noOfRows; i++) {
			this.updateBackUpTask('type', `mapper`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(sectionIndex, -1, -1, 'section');
			this.updateBackUpTask(
				'oldObject',
				cloneDeep(this.layoutService.template.sections[sectionIndex]['mapper']),
			);
			this.layoutService.template.sections[sectionIndex]['mapper'].push(1);
			this.updateBackUpTask(
				'newObject',
				cloneDeep(this.layoutService.template.sections[sectionIndex]['mapper']),
			);
		}
		this.updateBackUpTask('type', `minRows`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(sectionIndex, -1, -1, 'sectionOptions');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[sectionIndex].options.minRows,
		);
		this.layoutService.template.sections[sectionIndex].options.minRows =
			this.layoutService.template.sections[sectionIndex].options.minRows + noOfRows;
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[sectionIndex].options.minRows,
		);
		this.updateBackUpTask('type', `maxRows`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(sectionIndex, -1, -1, 'sectionOptions');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[sectionIndex].options.maxRows,
		);
		this.layoutService.template.sections[sectionIndex].options.maxRows =
			this.layoutService.template.sections[sectionIndex].options.maxRows + noOfRows;
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[sectionIndex].options.maxRows,
		);
		this.optionRefresh(sectionIndex);
		this.GetHeightValue();
		this.layoutService.backupId++;
	}
	setSection(sectionIndex, sec) {
		this.sectionIndex = sectionIndex;
		this.otherSectionDragSearchCheck = false;
	}
	dragStartCheck = false;
	onDragStop(event) {
		this.dragStartCheck = false;
	}
	onDragStart(event) {
		this.dragStartCheck = true;
		if (this.emptyCellItemIndex.sectionIndex != -1) {
			for (
				let i: number = 0;
				this.layoutService.template.sections[this.emptyCellItemIndex.sectionIndex] &&
				i <
					this.layoutService.template.sections[this.emptyCellItemIndex.sectionIndex].dashboard
						?.length;
				i++
			) {
				if (
					this.layoutService.template.sections[this.emptyCellItemIndex.sectionIndex].dashboard[i]
						.obj.emptyCell
				) {
					let tempLastI = this.layoutService.lastI;
					let tempLastK = this.layoutService.lastK;
					this.layoutService.lastI = this.emptyCellItemIndex.sectionIndex;
					this.layoutService.lastK = i;
					this.removeItem(
						this.layoutService.template.sections[this.emptyCellItemIndex.sectionIndex].dashboard[i],
						'col',
						false,
						this.emptyCellItemIndex.sectionIndex,
						false,
					);
					i--;
					this.layoutService.lastI = tempLastI;
					this.layoutService.lastK = tempLastK;
				}
			}
		}
	}
	addItem(item: GridsterItem) {
		item.id = UUID();
		this.layoutService.template.sections[this.sectionIndex].dashboard.push(item);
	}
	drop(event) {
		moveItemInArray(this.layoutService.template.sections, event.previousIndex, event.currentIndex);
		this.resetSectionNumbers();
	}
	removeUiChecksFromSection(dashboard) {
		let allIds = [];
		for (let uiComponent of dashboard) {
			if (uiComponent.obj?.options?.length) {
				for (let option of uiComponent.obj?.options) {
					if (option.selectedLinkUi && option.selectedLinkUi.id) {
						for (let uiComponent2 of dashboard) {
							if (option.selectedLinkUi.id == uiComponent2.obj.uicomponent_name) {
								option.unlinkRestrict = true;
							}
						}
						if (!option.unlinkRestrict) {
							option.unlinkRestrict = false;
						}
					}
				}
			}
		}
		for (let r: number = 0; r < dashboard?.length; r++) {
			dashboard[r].obj.linked_ui = 0;
			dashboard[r].obj.selected_linked_ui_component = 0;
			for (
				let i: number = 0;
				dashboard[r].obj.options && i < dashboard[r].obj.options?.length;
				i++
			) {
				dashboard[r].obj.options[i].selectedLinkUi &&
					allIds.push(dashboard[r].obj.options[i].selectedLinkUi.id);
				if (!dashboard[r].obj.options[i].unlinkRestrict) {
					dashboard[r].obj.options[i].linkedUICheck = false;
					dashboard[r].obj.options[i].selectedLinkUi = {};
				}
			}
		}
		for (let item of allIds) {
			for (let uiComponent of dashboard) {
				if (uiComponent.obj.uicomponent_name == item) {
					uiComponent.obj.linked_ui++;
				}
			}
		}
		return dashboard;
	}
	addOtherSection(check, type, pasteCheck) {
		if (
			this.selectedSectionIndex != null &&
			this.layoutService.template.sections[this.selectedSectionIndex]
		) {
			this.layoutService.template.sections[this.selectedSectionIndex].sectionClick = true;
		}
		if (this.lastSecIndex != null && this.layoutService.template.sections[this.lastSecIndex]) {
			this.layoutService.template.sections[this.lastSecIndex].sectionClick = false;
		}
		this.selectedSection = this.layoutService.template.sections?.length;
		this.selectedComponents = [];
		this.removeCollapsePropertiesTab();
		this.setPropertiesTab('showSectionProperties');
		this.setCollapsePropertiesTab('showSectionProperties');
		const templateSectionLength = this.layoutService.template.sections?.length;
		const secNo = this.sectionNumber++;
		let name = 'Section ';
		if (this.layoutService.subjectiveSectionTypeId === type) {
			name = 'Subjective ';
		} else if (this.layoutService.objectiveSectionTypeId === type) {
			name = 'Objective ';
		} else if (this.layoutService.assessmentSectionTypeId === type) {
			name = 'Assessment ';
		} else if (this.layoutService.planSectionTypeId === type) {
			name = 'Plan Of Care ';
		}
		if (pasteCheck) {
			this.layoutService.collapseSectionIndex[`${this.totalSection}`] = false;
		} else {
			this.layoutService.collapseSectionIndex[`${this.totalSection}`] = true;
		}
		const addobj = {
			id: this.totalSection,
			secNo,
			parentId: 0,
			subsection: 0,
			isSubSection: false,
			section_type: type,
			section_title: name,
			is_table: false,
			boundSectionStatement: name,
			isSelected: true,
			tags: [],
			defaultColumn: false,
			isFilled: false,
			requiredFilled: false,
			mapper: [1],
			options: {
				gridType: GridType.VerticalFixed,
				displayGrid: DisplayGrid.Always,
				setGridSize: true,
				pushItems: true,
				fixedRowHeight: 100,
				hasContent: true,
				fixedColWidth: 750 / this.layoutService.template.default_columns,
				disableScrollVertical: true,
				disableScrollHorizontal: true,
				swap: true,
				minCols: this.layoutService.template.default_columns,
				maxCols: this.layoutService.template.default_columns,
				maxRows: 1,
				minRows: 1,
				keepFixedWidthInMobile: true,
				keepFixedHeightInMobile: true,
				enableEmptyCellContextMenu: true,
				enableEmptyCellClick: true,
				enableEmptyCellDrop: true,
				enableEmptyCellDrag: true,
				enableOccupiedCellDrop: true,
				emptyCellClickCallback: this.emptyCellClick.bind(this),
				emptyCellContextMenuCallback: this.emptyCellClick.bind(this),
				emptyCellDropCallback: this.emptyCellClick.bind(this),
				emptyCellDragCallback: this.emptyCellClick.bind(this),
				swapWhileDragging: false,
				margin: 0,
				draggable: {
					enabled: true,
					dropOverItems: false,
				},
				resizable: {
					enabled: true,
				},
			},
			dashboard: [],
			linked_component: 0,
			selected_linked_component: 0,
			isCarried: false,
			mainPdf: true,
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
			lineSpacingValue: 15,
			bgColor: false,
			backgroundColor: '#ff0000',
			fontColor: false,
			fontColorCode: '#000000',
			fontFamily: false,
			fontFamilyValue: '',
			seperatePdf: false,
			hideInInstance: false,
			hideSectionName: false,
			theme: 0,
			horizontalThemeCheck: false,
			verticalThemeCheck: false,
			sectionBorders: false,
			completeBorder: false,
			leftSectionBorder: 0,
			rightSectionBorder: 0,
			topSectionBorder: 0,
			bottomSectionBorder: 0,
			topSectionPadding: 0,
			printNewPage: false,
			errors: 0,
			selectedModules: [],
		};
		if (check === 1) {
			addobj.defaultColumn = this.sectionDragStart.defaultColumn;
			addobj.selectedModules = this.sectionDragStart.selectedModules;
			addobj.options = this.sectionDragStart.options;
			addobj.theme = this.sectionDragStart.theme;
			addobj.sectionBorders = this.sectionDragStart.sectionBorders;
			addobj.completeBorder = this.sectionDragStart.completeBorder;
			addobj.leftSectionBorder = this.sectionDragStart.leftSectionBorder;
			addobj.topSectionPadding = this.sectionDragStart.topSectionPadding;
			addobj.rightSectionBorder = this.sectionDragStart.rightSectionBorder;
			addobj.topSectionBorder = this.sectionDragStart.topSectionBorder;
			addobj.bottomSectionBorder = this.sectionDragStart.bottomSectionBorder;
			addobj.uiBorders = this.sectionDragStart.uiBorders;
			addobj.leftUIBorder = this.sectionDragStart.leftUIBorder;
			addobj.rightUIBorder = this.sectionDragStart.rightUIBorder;
			addobj.bottomUIBorder = this.sectionDragStart.bottomUIBorder;
			addobj.topUIBorder = this.sectionDragStart.topUIBorder;
			addobj.uiPaddings = this.sectionDragStart.uiPaddings;
			addobj.leftUIPadding = this.sectionDragStart.leftUIPadding;
			addobj.rightUIPadding = this.sectionDragStart.rightUIPadding;
			addobj.topUIPadding = this.sectionDragStart.topUIPadding;
			addobj.bottomUIPadding = this.sectionDragStart.bottomUIPadding;
			addobj.bgColor = this.sectionDragStart.bgColor;
			addobj.backgroundColor = this.sectionDragStart.backgroundColor;
			addobj.fontColor = this.sectionDragStart.fontColor;
			addobj.fontColorCode = this.sectionDragStart.fontColorCode;
			addobj.fontFamily = this.sectionDragStart.fontFamily;
			addobj.fontFamilyValue = this.sectionDragStart.fontFamilyValue;
			addobj.lineSpacing = this.sectionDragStart.lineSpacing;
			addobj.lineSpacingValue = this.sectionDragStart.lineSpacingValue;
			addobj.is_table = this.sectionDragStart.is_table;
			addobj.printNewPage = this.sectionDragStart.printNewPage;
			addobj.seperatePdf = this.sectionDragStart.seperatePdf;
			addobj.mainPdf = this.sectionDragStart.mainPdf;
			addobj.hideSectionName = this.sectionDragStart.hideSectionName;
			addobj.hideInInstance = this.sectionDragStart.hideInInstance;
			addobj.errors = this.sectionDragStart.errors;
			addobj.mapper = this.sectionDragStart.mapper;
			addobj.tags = this.sectionDragStart.tags;
			addobj.section_type = this.sectionDragStart.section_type;
			addobj.dashboard = this.sectionDragStart.dashboard;
			addobj.dashboard = this.removeUiChecksFromSection(addobj.dashboard);
			addobj.section_title = this.sectionDragStart.section_title;
			addobj.boundSectionStatement = this.sectionDragStart.boundSectionStatement;
			if (
				this.sectionDragStart.section_template != this.layoutService.template.template_id &&
				!pasteCheck
			) {
				this.layoutService.carryModal = this.modalService.open(CarryForwardComponent, {
					backdrop: 'static',
					keyboard: false,
					windowClass: 'modal_extraDOc',
				});
				this.layoutService.carryModal.result.then((res) => {
					if (this.layoutService.carryDrop) {
						addobj['carryForward'] = {
							isCarryForward: true,
							sectionId: this.section_id_carry,
							originalUpdated: false,
							carryForwardCheck: false,
							carryForwardApplied: false,
							cfList: [],
							carryForwardSections: [],
						};
					}
					if (res == 'Normal' || res == 'Carry Forward') {
						this.list.push({
							id: this.totalSection,
							children: [],
							obj: cloneDeep(addobj),
						});
						this.list = [...this.list];
						this.layoutService.template.sections.push(cloneDeep(addobj));
						this.layoutService.template.sections[
							this.layoutService.template.sections?.length - 1
						].options = {
							gridType: GridType.VerticalFixed,
							displayGrid: DisplayGrid.Always,
							setGridSize: true,
							pushItems: true,
							fixedRowHeight: 100,
							fixedColWidth: 750 / this.layoutService.template.default_columns,
							disableScrollVertical: true,
							disableScrollHorizontal: true,
							swap: true,
							minCols:
								this.layoutService.template.sections[
									this.layoutService.template.sections?.length - 1
								].options.minCols,
							maxCols:
								this.layoutService.template.sections[
									this.layoutService.template.sections?.length - 1
								].options.maxCols,
							maxRows:
								this.layoutService.template.sections[
									this.layoutService.template.sections?.length - 1
								].options.maxRows,
							minRows:
								this.layoutService.template.sections[
									this.layoutService.template.sections?.length - 1
								].options.minRows,
							keepFixedWidthInMobile: true,
							keepFixedHeightInMobile: true,
							enableEmptyCellContextMenu: true,
							enableEmptyCellClick: true,
							enableEmptyCellDrop: true,
							enableEmptyCellDrag: true,
							enableOccupiedCellDrop: true,
							emptyCellClickCallback: this.emptyCellClick.bind(this),
							emptyCellContextMenuCallback: this.emptyCellClick.bind(this),
							emptyCellDropCallback: this.emptyCellClick.bind(this),
							emptyCellDragCallback: this.emptyCellClick.bind(this),
							swapWhileDragging: false,
							margin: 0,
							draggable:
								this.layoutService.template.sections[
									this.layoutService.template.sections?.length - 1
								].options.draggable,
							resizable:
								this.layoutService.template.sections[
									this.layoutService.template.sections?.length - 1
								].options.resizable,
						};
						this.changeDetector.markForCheck();
						this.totalSection++;
						this.itemClick[templateSectionLength] = true;
						this.sectionCreated = true;
						this.resetSectionNumbers();
						this.updateBackUpTask('type', `addSection`);
						this.updateBackUpTask('id', this.layoutService.backupId);
						this.updateIndexes(
							this.layoutService.template.sections?.length - 1,
							-1,
							-1,
							'addSection',
						);
						this.updateBackUpTask('oldObject', null);
						this.updateBackUpTask(
							'newObject',
							cloneDeep(
								this.layoutService.template.sections[
									this.layoutService.template.sections?.length - 1
								],
							),
						);
						this.showUIComponents = true;
						this.showSections = true;
						this.GetHeightValue();
					}
				});
			} else {
				this.list.push({
					id: this.totalSection,
					children: [],
					obj: cloneDeep(addobj),
				});
				this.list = [...this.list];
				this.layoutService.template.sections.push(cloneDeep(addobj));
				this.optionRefresh(this.layoutService.template.sections?.length - 1);
				this.totalSection++;
				this.itemClick[templateSectionLength] = true;
				this.sectionCreated = true;
				this.resetSectionNumbers();
				this.updateBackUpTask('type', `addSection`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(this.layoutService.template.sections?.length - 1, -1, -1, 'addSection');
				this.updateBackUpTask('oldObject', null);
				this.updateBackUpTask(
					'newObject',
					this.layoutService.template.sections[this.layoutService.template.sections?.length - 1],
				);
				this.showUIComponents = true;
				this.showSections = true;
				this.GetHeightValue();
				this.changeDetector.detectChanges();
			}
		} else {
			this.list.push({
				id: this.totalSection,
				children: [],
				obj: cloneDeep(addobj),
			});
			this.list = [...this.list];
			this.layoutService.template.sections.push(cloneDeep(addobj));
			this.totalSection++;
			this.itemClick[templateSectionLength] = true;
			this.sectionCreated = true;
			this.resetSectionNumbers();
			this.updateBackUpTask('type', `addSection`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(this.layoutService.template.sections?.length - 1, -1, -1, 'addSection');
			this.updateBackUpTask('oldObject', null);
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[this.layoutService.template.sections?.length - 1],
			);
			this.showUIComponents = true;
			this.showSections = true;
			this.GetHeightValue();
			this.changeDetector.detectChanges();
		}
		this.layoutService.backupId++;
	}
	emptyCellClick(event: MouseEvent, item: GridsterItem) {}
	arrowLeftRight(direction) {
		if (direction === 'left') {
			if (this.leftSection === true) {
				this.leftSection = false;
				this.hideLeftSection = true;
			} else {
				this.leftSection = true;
				this.hideLeftSection = false;
			}
		} else if (direction === 'right') {
			if (this.rightSection === true) {
				this.rightSection = false;
			} else {
				this.rightSection = true;
			}
		}
		setTimeout(() => {
			this.subjectService.resizeRefreshItem('resize');
		}, 100);
	}
	moveSideBar() {
		this.sideBarSection = !this.sideBarSection;
	}
	itemPaste(sectionIndex, dashboardIndex, item) {
		navigator['clipboard']
			.readText()
			.then((item: any) => {
				item = JSON.parse(item);
				if (item['obj'] && item['obj']['uicomponent_name']) {
					this.toastrService.info('Item linking will not be copied.', 'Note', { timeOut: 6000 });
					if (item['obj']['type'] == this.uicomponentTypes.TEXT) {
						item['obj']['linked_row'] = 0;
						item['obj']['selected_linked_row'] = 0;
					}
					item['obj']['selected_linked_ui_component'] = 0;
					item['obj']['linked_ui'] = 0;
					delete item['maxItemCols'];
					delete item['minItemCols'];
					delete item['maxItemRows'];
					delete item['minItemRows'];
					item['cols'] = this.emptyCellItem.cols;
					item['rows'] = this.emptyCellItem.rows;
					item['x'] = this.emptyCellItem.x;
					item['y'] = this.emptyCellItem.y;
					this.emptySelectedComponents();
					this.layoutService.lastI = this.emptyCellItemIndex.sectionIndex;
					this.layoutService.lastK = this.emptyCellItemIndex.dashboardIndex;
					if (this.layoutService.template.sections[this.layoutService.lastI].is_table) {
						if (
							item.x > 0 &&
							item.y <=
								this.layoutService.template.sections[this.layoutService.lastI].dashboard[0].rows -
									1 &&
							item.obj.type != this.uicomponentTypes.TEXT
						) {
							this.toastrService.error(
								"Only text component is allowed in table's first row",
								'Error',
								{ timeOut: 6000 },
							);
							this.subjectService.pasteItem([]);
							return;
						}
						if (
							item.y > 0 &&
							item.x <=
								this.layoutService.template.sections[this.layoutService.lastI].dashboard[0].cols -
									1 &&
							item.obj.type != this.uicomponentTypes.TEXT
						) {
							this.toastrService.error(
								"Only text component is allowed in table's first column",
								'Error',
								{ timeOut: 6000 },
							);
							this.subjectService.pasteItem([]);
							return;
						}
						if (item.y == 0) {
							item.rows =
								this.layoutService.template.sections[this.layoutService.lastI].dashboard[0].rows;
						}
						if (item.x == 0) {
							item.cols =
								this.layoutService.template.sections[this.layoutService.lastI].dashboard[0].rows;
						}
						if (item.x != 0 && item.y != 0) {
							let rowFlag = false;
							let colFlag = false;
							for (let component of this.layoutService.template.sections[this.layoutService.lastI]
								.dashboard) {
								if (
									component.y == 0 &&
									item.x >= component.x &&
									item.x < component.x + component.cols
								) {
									colFlag = true;
									if (rowFlag) {
										break;
									}
								}
								if (
									component.x == 0 &&
									item.y >= component.y &&
									item.y < component.y + component.rows
								) {
									rowFlag = true;
									if (colFlag) {
										break;
									}
								}
							}
							if (!rowFlag) {
								this.toastrService.error(
									'Kindly add a text component in the first column',
									'Error',
									{
										timeOut: 6000,
									},
								);
								this.subjectService.pasteItem([]);
								return;
							}
							if (!colFlag) {
								this.toastrService.error('Kindly add a text component in the first row', 'Error', {
									timeOut: 6000,
								});
								this.subjectService.pasteItem([]);
								return;
							}
						}
					}
					if (
						this.layoutService.template.sections[this.emptyCellItemIndex.sectionIndex].dashboard[
							this.emptyCellItemIndex.dashboardIndex
						]
					) {
						this.removeItem(
							this.layoutService.template.sections[this.emptyCellItemIndex.sectionIndex].dashboard[
								this.emptyCellItemIndex.dashboardIndex
							],
							'col',
							false,
							this.emptyCellItemIndex.sectionIndex,
							false,
						);
					}
					this.subjectService.pasteItem(item);
					this.emptyCellItem = {};
					this.emptyCellItemIndex = { sectionIndex: -1, dashboardIndex: -1 };
				}
			})
			.catch((err) => {
				this.toastrService.error('No item copied', 'Error', { timeOut: 6000 });
			});
	}
	itemCopy(sectionIndex, dashboardIndex, item) {
		if (item.obj.type == this.uicomponentTypes.TABLE_DROPDOWN) {
			this.toastrService.error('This item cannot be copied', 'Error', { timeOut: 6000 });
			return;
		}
		try {
			navigator['clipboard'].readText().then((item) => {});
		} catch (err) {
			this.toastrService.error(
				"Your browser doesn't support copy/paste functionality. Try using a different browser.",
				'Error',
				{ timeOut: 6000 },
			);
			return;
		}
		if (
			sectionIndex != null &&
			dashboardIndex != null &&
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex] &&
			!this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj.emptyCell
		) {
			let copiedText = '';
			copiedText = JSON.stringify(
				this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex],
			);
			navigator['clipboard'].writeText(copiedText);
			this.toastrService.success('Item copied.', 'Success', { timeOut: 6000 });
		} else {
			this.toastrService.error('No item selected', 'Error', { timeOut: 6000 });
		}
	}
	itemCut(sectionIndex, dashboardIndex, item) {
		if (item.obj.type == this.uicomponentTypes.TABLE_DROPDOWN) {
			this.toastrService.error('This item cannot be copied', 'Error', { timeOut: 6000 });
			return;
		}
		try {
			navigator['clipboard'].readText().then((item) => {});
		} catch (err) {
			this.toastrService.error(
				"Your browser doesn't support copy/paste functionality. Try using a different browser.",
				'Error',
				{ timeOut: 6000 },
			);
			return;
		}
		if (
			sectionIndex != null &&
			dashboardIndex != null &&
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex] &&
			!this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj.emptyCell
		) {
			let copiedText = '';
			copiedText = JSON.stringify(
				this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex],
			);
			navigator['clipboard'].writeText(copiedText);
			let tempLastI = this.layoutService.lastI;
			let tempLastK = this.layoutService.lastK;
			this.layoutService.lastI = sectionIndex;
			this.layoutService.lastK = dashboardIndex;
			this.removeItem(item, 'col', false, this.layoutService.lastI, false);
			this.layoutService.lastI = tempLastI;
			this.layoutService.lastK = tempLastK;
			this.toastrService.success('Item cut.', 'Success', { timeOut: 6000 });
		} else {
			this.toastrService.error('No item selected', 'Error', { timeOut: 6000 });
		}
	}
	sectionCopy(sectionIndex, check) {
		try {
			navigator['clipboard'].readText().then((item) => {});
		} catch (err) {
			this.toastrService.error(
				"Your browser doesn't support copy/paste functionality. Try using a different browser.",
				'Error',
				{ timeOut: 6000 },
			);
			return;
		}
		let copiedText = '';
		if (!check) {
			for (let uiComponent of this.layoutService.template.sections[sectionIndex].dashboard) {
				if (uiComponent.obj?.options?.length) {
					for (let option of uiComponent.obj?.options) {
						if (option.selectedLinkUi && option.selectedLinkUi.id) {
							for (let uiComponent2 of this.layoutService.template.sections[sectionIndex]
								.dashboard) {
								if (option.selectedLinkUi.id == uiComponent2.obj.uicomponent_name) {
									option.unlinkRestrict = true;
								}
							}
							if (!option.unlinkRestrict) {
								option.unlinkRestrict = false;
							}
						}
					}
				}
			}
			copiedText = JSON.stringify(this.layoutService.template.sections[sectionIndex]);
			for (let uiComponent of this.layoutService.template.sections[sectionIndex].dashboard) {
				if (uiComponent.obj?.options?.length) {
					for (let option of uiComponent.obj?.options) {
						delete option.unlinkRestrict;
						delete option.unlinkRestrictSection;
					}
				}
			}
		} else {
			let tempHierarchy = [];
			tempHierarchy.push(this.layoutService.template.sections[sectionIndex]);
			let currentDepth =
				this.layoutService.template.sections[sectionIndex].secNo.split('.')?.length - 1;
			for (let z = sectionIndex + 1; z < this.layoutService.template.sections?.length; z++) {
				let tempDepth = this.layoutService.template.sections[z].secNo.split('.')?.length - 1;
				if (tempDepth > currentDepth) {
					tempHierarchy.push(this.layoutService.template.sections[z]);
				} else {
					break;
				}
			}
			let count: number = 0;
			for (let section of tempHierarchy) {
				for (let uiComponent of section.dashboard) {
					if (uiComponent.obj?.options?.length) {
						for (let option of uiComponent.obj?.options) {
							if (option.selectedLinkUi && option.selectedLinkUi.id) {
								for (let section2 of tempHierarchy) {
									for (let uiComponent2 of section2.dashboard) {
										if (option.selectedLinkUi.id == uiComponent2.obj.uicomponent_name) {
											option.unlinkRestrict = true;
										}
									}
								}
								if (!option.unlinkRestrict) {
									option.unlinkRestrict = false;
								}
							}
							count = 0;
							if (option.selectedLinkSection && option.selectedLinkSection.id) {
								for (let section2 of tempHierarchy) {
									if (option.selectedLinkSection.id == section2.id) {
										option.unlinkRestrictSection = true;
									}
								}
								if (!option.unlinkRestrictSection) {
									option.unlinkRestrictSection = false;
								}
							}
						}
					}
				}
			}
			copiedText = JSON.stringify(tempHierarchy);
			for (let uiComponent of this.layoutService.template.sections[sectionIndex].dashboard) {
				if (uiComponent.obj?.options?.length) {
					for (let option of uiComponent.obj?.options) {
						delete option.unlinkRestrict;
						delete option.unlinkRestrictSection;
					}
				}
			}
		}
		navigator['clipboard'].writeText(copiedText);
		this.toastrService.success('Sections copied.', 'Success', { timeOut: 6000 });
	}
	sectionPaste(index) {
		this.layoutService.isLoaderPending.next(true);
		navigator['clipboard']
			.readText()
			.then((item: any) => {
				item = JSON.parse(item);
				if (item['secNo']) {
					this.toastrService.info('Section linking will not be copied outside hierarchy.', 'Note', {
						timeOut: 6000,
					});
					item.selected_linked_component = 0;
					item.linked_component = 0;
					this.sectionDragStart = item;
					const obj = {
						section_id: parseInt(this.sectionDragStart.section_id),
					};
					const sectionDragCopy = cloneDeep(this.sectionDragStart);
					this.section_id_carry = cloneDeep(this.sectionDragStart.section_id);
					this.sectionDragStart.section_id = null;
					this.sectionCreated = true;
					const data = item.dashboard;
					let allIds: any = [];
					let minIdAssigned = 1;
					for (let i: number = 0; i < data?.length; i++) {
						if (data[i].obj?.options?.length) {
							for (let option of data[i].obj?.options) {
								if (!option.unlinkRestrict) {
									option['selectedLinkUi'] = {};
								}
								if (!option.unlinkRestrictSection) {
									option['selectedLinkSection'] = {};
								}
								option.selected = false;
							}
						}
						data[i].obj['carry_uicomponent_name'] = data[i].obj.uicomponent_name;
						delete data[i].id;
						data[i]['id'] = UUID();
						this.setTemplateProperty('uiCompIds', this.getNextUICompId(minIdAssigned), false);
						minIdAssigned = this.layoutService.template.uiCompIds;
						allIds.push({
							oldId: data[i].obj.uicomponent_name,
							newId: JSON.stringify(this.layoutService.template.uiCompIds),
						});
						data[i].obj.uicomponent_name = JSON.stringify(this.layoutService.template.uiCompIds);
						delete data[i].uicomponent_id;
						if (this.uicomponentTypes.INPUT in data[i].obj) {
							data[i].obj.input = '';
						}
						if (data[i].obj.MultiSelectObj) {
							delete data[i].obj.MultiSelectObj;
							data[i].obj.manualoptions = true;
							data[i].obj.multilinked = false;
							data[i].obj.options = [];
							data[i].obj.answers = [];
						}
						if (data[i].obj.answers) {
							data[i].obj.answers = [];
						}
						this.componentsService.push({
							id: data[i].id,
							componentRef: data[i].obj.type,
						});
					}
					for (let x: number = 0; x < data?.length; x++) {
						if (data[x].obj.preDefind) {
							let is_exist: boolean = false;
							for (let i: number = 0; i < this.PreDefinedList?.length; i++) {
								if (this.PreDefinedList[i].objectid == data[x].id) {
									is_exist = true;
									this.PreDefinedList[i].predefinedvalue = data[x].obj['preDefinedObj'].id;
								}
							}
							if (!is_exist) {
								this.PreDefinedList.push({
									objectid: data[x].id,
									predefinedvalue: data[x].obj['preDefinedObj'].id,
								});
							}
						}
						if (data[x].obj.statement) {
							let tempStatement: any = '';
							tempStatement = data[x].obj.statement;
							if (data[x].obj.type == this.uicomponentTypes.TEXT) {
								let statementArray = tempStatement.match(/@[0-9]+/g);
								if (statementArray) {
									for (let arrayItem of statementArray) {
										if (arrayItem[0] == '@') {
											arrayItem = arrayItem.replace('@', '');
											for (let k: number = 0; k < allIds?.length; k++) {
												if (arrayItem == allIds[k].oldId) {
													tempStatement = tempStatement.replace(
														'@' + arrayItem,
														'@changingThisId' + allIds[k].newId,
													);
												}
											}
										}
									}
								}
								tempStatement = tempStatement.replace('/@changingThisId/g', '@');
								data[x].obj.statement = tempStatement;
								data[x].obj.instanceStatement = tempStatement;
							}
						}
					}
					sectionDragCopy.dashboard = data;
					this.sectionDragStart.dashboard = data;
					if (typeof sectionDragCopy.options === 'string') {
						sectionDragCopy.options = JSON.parse(sectionDragCopy.options);
					}
					this.sectionDragStart.section_title = this.sectionDragStart.section_title;
					this.changeDetector.detectChanges();
					this.removeCollapsePropertiesTab();
					this.setPropertiesTab('showSectionProperties');
					this.setPropertiesTab('showSections');
					this.setPropertiesTab('showUIComponents');
					this.setCollapsePropertiesTab('showUIComponents');
					this.changeDetector.detectChanges();
					item.parentId = this.layoutService.template.sections[index].id;
					let currentDepth =
						this.layoutService.template.sections[index].secNo.split('.')?.length - 1;
					let tempIndex = index + 1;
					for (; tempIndex < this.layoutService.template.sections?.length; tempIndex++) {
						let tempDepth =
							this.layoutService.template.sections[tempIndex].secNo.split('.')?.length - 1;
						if (tempDepth <= currentDepth) {
							break;
						}
					}
					this.addSubSection(item.parentId, 1, index, true);
					for (let uiComponent of this.layoutService.template.sections[tempIndex].dashboard) {
						if (uiComponent.obj?.options?.length) {
							for (let option of uiComponent.obj?.options) {
								if (option.linkedRowValue && option.linkedRowValue.id) {
									for (let idCombo of allIds) {
										if (idCombo.oldId == option.linkedRowValue.id) {
											option.linkedRowValue.id = idCombo.newId;
										}
									}
								}
								if (option.unlinkRestrict) {
									for (let idCombo of allIds) {
										if (idCombo.oldId == option.selectedLinkUi.id) {
											option.selectedLinkUi.id = idCombo.newId;
										}
									}
									for (let uiComponent of this.layoutService.template.sections[tempIndex]
										.dashboard) {
										if (option.selectedLinkUi.id == uiComponent.obj.uicomponent_name) {
											uiComponent.obj.linked_ui++;
										}
									}
								}
								delete option.unlinkRestrict;
								delete option.unlinkRestrictSection;
							}
						}
					}
				} else if (item[0] && item[0]['secNo']) {
					let firstSectionCheck = true;
					let sectionIdMapper = [];
					this.toastrService.info('Section linking will not be copied outside hierarchy.', 'Note', {
						timeOut: 6000,
					});
					let sectionsToLinkAgain = [];
					let allIds: any = [];
					for (let section of item) {
						section.selected_linked_component = 0;
						section.linked_component = 0;
						this.sectionDragStart = section;
						const obj = {
							section_id: parseInt(this.sectionDragStart.section_id),
						};
						const sectionDragCopy = cloneDeep(this.sectionDragStart);
						this.section_id_carry = cloneDeep(this.sectionDragStart.section_id);
						this.sectionDragStart.section_id = null;
						this.sectionCreated = true;
						const data = section.dashboard;
						let minIdAssigned = 1;
						for (let i: number = 0; i < data?.length; i++) {
							if (data[i].obj?.length) {
								for (let option of data[i].obj?.options) {
									if (!option.unlinkRestrictSection) {
										option['selectedLinkSection'] = {};
									}
									if (!option.unlinkRestrict) {
										option['selectedLinkUi'] = {};
									}
									option.selected = false;
								}
							}
							data[i].obj['carry_uicomponent_name'] = data[i].obj.uicomponent_name;
							delete data[i].id;
							data[i]['id'] = UUID();
							this.setTemplateProperty('uiCompIds', this.getNextUICompId(minIdAssigned), false);
							minIdAssigned = this.layoutService.template.uiCompIds;
							allIds.push({
								oldId: data[i].obj.uicomponent_name,
								newId: JSON.stringify(this.layoutService.template.uiCompIds),
							});
							data[i].obj.uicomponent_name = JSON.stringify(this.layoutService.template.uiCompIds);
							delete data[i].uicomponent_id;
							if (this.uicomponentTypes.INPUT in data[i].obj) {
								data[i].obj.input = '';
							}
							if (data[i].obj.MultiSelectObj) {
								delete data[i].obj.MultiSelectObj;
								data[i].obj.manualoptions = true;
								data[i].obj.multilinked = false;
								data[i].obj.options = [];
								data[i].obj.answers = [];
							}
							if (data[i].obj.answers) {
								data[i].obj.answers = [];
							}
							this.componentsService.push({
								id: data[i].id,
								componentRef: data[i].obj.type,
							});
						}
						for (let x: number = 0; x < data?.length; x++) {
							if (data[x].obj.preDefind) {
								let is_exist: boolean = false;
								for (let i: number = 0; i < this.PreDefinedList?.length; i++) {
									if (this.PreDefinedList[i].objectid == data[x].id) {
										is_exist = true;
										this.PreDefinedList[i].predefinedvalue = data[x].obj['preDefinedObj'].id;
									}
								}
								if (!is_exist) {
									this.PreDefinedList.push({
										objectid: data[x].id,
										predefinedvalue: data[x].obj['preDefinedObj'].id,
									});
								}
							}
							if (data[x].obj.statement) {
								let tempStatement: any = '';
								tempStatement = data[x].obj.statement;
								if (data[x].obj.type == this.uicomponentTypes.TEXT) {
									let statementArray = tempStatement.match(/@[0-9]+/g);
									if (statementArray) {
										for (let arrayItem of statementArray) {
											if (arrayItem[0] == '@') {
												arrayItem = arrayItem.replace('@', '');
												for (let k: number = 0; k < allIds?.length; k++) {
													if (arrayItem == allIds[k].oldId) {
														tempStatement = tempStatement.replace(
															'@' + arrayItem,
															'@changingThisId' + allIds[k].newId,
														);
													}
												}
											}
										}
									}
									tempStatement = tempStatement.replace(/@changingThisId/g, '@');
									data[x].obj.statement = tempStatement;
									data[x].obj.instanceStatement = tempStatement;
								}
							}
						}
						sectionDragCopy.dashboard = data;
						this.sectionDragStart.dashboard = data;
						if (typeof sectionDragCopy.options === 'string') {
							sectionDragCopy.options = JSON.parse(sectionDragCopy.options);
						}
						this.sectionDragStart.section_title = this.sectionDragStart.section_title;
						this.changeDetector.detectChanges();
						this.removeCollapsePropertiesTab();
						this.setPropertiesTab('showSectionProperties');
						this.setPropertiesTab('showSections');
						this.setPropertiesTab('showUIComponents');
						this.setCollapsePropertiesTab('showUIComponents');
						this.changeDetector.detectChanges();
						if (firstSectionCheck) {
							firstSectionCheck = false;
							let children: number = 0;
							section.parentId = this.layoutService.template.sections[index].id;
							let currentDepth =
								this.layoutService.template.sections[index].secNo.split('.')?.length - 1;
							for (let z = index + 1; z < this.layoutService.template.sections?.length; z++) {
								let tempDepth = this.layoutService.template.sections[z].secNo.split('.')?.length - 1;
								if (tempDepth > currentDepth) {
									children++;
								} else {
									break;
								}
							}
							this.addSubSection(section.parentId, 1, index, true);
							sectionIdMapper.push({
								oldId: section.id,
								newId: this.layoutService.template.sections[index + children + 1].id,
								newSecNo: this.layoutService.template.sections[index + children + 1].secNo,
								index: index + children + 1,
							});
							sectionsToLinkAgain.push(index + children + 1);
						} else {
							let children: number = 0;
							let oldSection: any = {};
							let tempParentId: number = 0;
							for (let tempSection of sectionIdMapper) {
								if (tempSection.oldId == section.parentId) {
									tempParentId = tempSection.newId;
									oldSection = tempSection;
								}
							}
							if (tempParentId) {
								section.parentId = tempParentId;
							}
							let currentDepth =
								this.layoutService.template.sections[oldSection.index].secNo.split('.')?.length - 1;
							for (
								let z = oldSection.index + 1;
								z < this.layoutService.template.sections?.length;
								z++
							) {
								let tempDepth = this.layoutService.template.sections[z].secNo.split('.')?.length - 1;
								if (tempDepth > currentDepth) {
									children++;
								} else {
									break;
								}
							}
							this.addSubSection(section.parentId, 1, oldSection.index, true);
							sectionIdMapper.push({
								oldId: section.id,
								newId: this.layoutService.template.sections[oldSection.index + children + 1].id,
								newSecNo:
									this.layoutService.template.sections[oldSection.index + children + 1].secNo,
								index: oldSection.index + children + 1,
							});
							sectionsToLinkAgain.push(oldSection.index + children + 1);
						}
					}
					for (let tempIndex of sectionsToLinkAgain) {
						for (let uiComponent of this.layoutService.template.sections[tempIndex].dashboard) {
							if (uiComponent.obj?.options?.length) {
								for (let option of uiComponent.obj?.options) {
									if (option.linkedRowValue && option.linkedRowValue.id) {
										for (let idCombo of allIds) {
											if (idCombo.oldId == option.linkedRowValue.id) {
												option.linkedRowValue.id = idCombo.newId;
											}
										}
									}
									if (option.unlinkRestrict) {
										for (let idCombo of allIds) {
											if (idCombo.oldId == option.selectedLinkUi.id) {
												option.selectedLinkUi.id = idCombo.newId;
												break;
											}
										}
										for (let tempIndex2 of sectionsToLinkAgain) {
											for (let uiComponent2 of this.layoutService.template.sections[tempIndex2]
												.dashboard) {
												if (option.selectedLinkUi.id == uiComponent2.obj.uicomponent_name) {
													uiComponent2.obj.linked_ui++;
													break;
												}
											}
										}
									}
									delete option.unlinkRestrict;
									if (option.unlinkRestrictSection) {
										for (let idCombo of sectionIdMapper) {
											if (idCombo['oldId'] == option.selectedLinkSection.id) {
												option.selectedLinkSection.id = idCombo['newId'];
												option.selectedLinkSection.secNo = idCombo['newSecNo'];
												break;
											}
										}
										for (let tempIndex2 of sectionsToLinkAgain) {
											if (
												option.selectedLinkSection.id ==
												this.layoutService.template.sections[tempIndex2].id
											) {
												this.layoutService.template.sections[tempIndex2].linked_component++;
												let currentDepth =
													this.layoutService.template.sections[tempIndex2].secNo.split('.')?.length -
													1;
												for (
													let z = tempIndex2 + 1;
													z < this.layoutService.template.sections?.length;
													z++
												) {
													let tempDepth =
														this.layoutService.template.sections[z].secNo.split('.')?.length - 1;
													if (tempDepth > currentDepth) {
														this.layoutService.template.sections[z].linked_component++;
													} else {
														break;
													}
												}
												break;
											}
										}
									}
									delete option.unlinkRestrictSection;
								}
							}
						}
					}
					this.stopLoader();
				} else {
					this.toastrService.error('No section copied', 'Error', { timeOut: 6000 });
				}
				this.stopLoader();
			})
			.catch((err) => {
				this.toastrService.error('No section copied', 'Error', { timeOut: 6000 });
				this.stopLoader();
			});
	}
	templateSectionPaste() {
		this.layoutService.isLoaderPending.next(true);
		navigator['clipboard']
			.readText()
			.then((item: any) => {
				item = JSON.parse(item);
				if (item['secNo']) {
					this.toastrService.info('Section linking will not be copied outside hierarchy.', 'Note', {
						timeOut: 6000,
					});
					item.selected_linked_component = 0;
					item.linked_component = 0;
					this.sectionDragStart = item;
					const obj = {
						section_id: parseInt(this.sectionDragStart.section_id),
					};
					const sectionDragCopy = cloneDeep(this.sectionDragStart);
					this.section_id_carry = cloneDeep(this.sectionDragStart.section_id);
					this.sectionDragStart.section_id = null;
					this.sectionCreated = true;
					const data = item.dashboard;
					let allIds: any = [];
					let minIdAssigned = 1;
					for (let i: number = 0; i < data?.length; i++) {
						if (data[i].obj?.options?.length) {
							for (let option of data[i].obj?.options) {
								if (!option.unlinkRestrictSection) {
									option['selectedLinkSection'] = {};
								}
								if (!option.unlinkRestrict) {
									option['selectedLinkUi'] = {};
								}
								option.selected = false;
							}
						}
						data[i].obj['carry_uicomponent_name'] = data[i].obj.uicomponent_name;
						delete data[i].id;
						data[i]['id'] = UUID();
						this.setTemplateProperty('uiCompIds', this.getNextUICompId(minIdAssigned), false);
						minIdAssigned = this.layoutService.template.uiCompIds;
						allIds.push({
							oldId: data[i].obj.uicomponent_name,
							newId: JSON.stringify(this.layoutService.template.uiCompIds),
						});
						data[i].obj.uicomponent_name = JSON.stringify(this.layoutService.template.uiCompIds);
						delete data[i].uicomponent_id;
						if (this.uicomponentTypes.INPUT in data[i].obj) {
							data[i].obj.input = '';
						}
						if (data[i].obj.MultiSelectObj) {
							delete data[i].obj.MultiSelectObj;
							data[i].obj.manualoptions = true;
							data[i].obj.multilinked = false;
							data[i].obj.options = [];
							data[i].obj.answers = [];
						}
						if (data[i].obj.answers) {
							data[i].obj.answers = [];
						}
						this.componentsService.push({
							id: data[i].id,
							componentRef: data[i].obj.type,
						});
					}
					for (let x: number = 0; x < data?.length; x++) {
						if (data[x].obj.preDefind) {
							let is_exist: boolean = false;
							for (let i: number = 0; i < this.PreDefinedList?.length; i++) {
								if (this.PreDefinedList[i].objectid == data[x].id) {
									is_exist = true;
									this.PreDefinedList[i].predefinedvalue = data[x].obj['preDefinedObj'].id;
								}
							}
							if (!is_exist) {
								this.PreDefinedList.push({
									objectid: data[x].id,
									predefinedvalue: data[x].obj['preDefinedObj'].id,
								});
							}
						}
						if (data[x].obj.statement) {
							let tempStatement: any = '';
							tempStatement = data[x].obj.statement;
							if (data[x].obj.type == this.uicomponentTypes.TEXT) {
								let statementArray = tempStatement.match(/@[0-9]+/g);
								if (statementArray) {
									for (let arrayItem of statementArray) {
										if (arrayItem[0] == '@') {
											arrayItem = arrayItem.replace('@', '');
											for (let k: number = 0; k < allIds?.length; k++) {
												if (arrayItem == allIds[k].oldId) {
													tempStatement = tempStatement.replace(
														'@' + arrayItem,
														'@changingThisId' + allIds[k].newId,
													);
												}
											}
										}
									}
								}
								tempStatement = tempStatement.replace(/@changingThisId/g, '@');
								data[x].obj.statement = tempStatement;
								data[x].obj.instanceStatement = tempStatement;
							}
						}
					}
					sectionDragCopy.dashboard = data;
					this.sectionDragStart.dashboard = data;
					if (typeof sectionDragCopy.options === 'string') {
						sectionDragCopy.options = JSON.parse(sectionDragCopy.options);
					}
					this.sectionDragStart.section_title = this.sectionDragStart.section_title;
					this.changeDetector.detectChanges();
					this.removeCollapsePropertiesTab();
					this.setPropertiesTab('showSectionProperties');
					this.setPropertiesTab('showSections');
					this.setPropertiesTab('showUIComponents');
					this.setCollapsePropertiesTab('showUIComponents');
					this.changeDetector.detectChanges();
					sectionDragCopy.parentId = 0;
					this.addOtherSection(1, sectionDragCopy.section_type, true);
					let tempIndex = this.layoutService.template.sections?.length - 1;
					for (let uiComponent of this.layoutService.template.sections[tempIndex].dashboard) {
						if (uiComponent.obj?.options?.length) {
							for (let option of uiComponent.obj?.options) {
								if (option.linkedRowValue && option.linkedRowValue.id) {
									for (let idCombo of allIds) {
										if (idCombo.oldId == option.linkedRowValue.id) {
											option.linkedRowValue.id = idCombo.newId;
										}
									}
								}
								if (option.unlinkRestrict) {
									for (let idCombo of allIds) {
										if (idCombo.oldId == option.selectedLinkUi.id) {
											option.selectedLinkUi.id = idCombo.newId;
										}
									}
									for (let uiComponent of this.layoutService.template.sections[tempIndex]
										.dashboard) {
										if (option.selectedLinkUi.id == uiComponent.obj.uicomponent_name) {
											uiComponent.obj.linked_ui++;
										}
									}
								}
								delete option.unlinkRestrict;
								delete option.unlinkRestrictSection;
							}
						}
					}
				} else if (item[0] && item[0]['secNo']) {
					let firstSectionCheck = true;
					let sectionIdMapper = [];
					this.toastrService.info('Section linking will not be copied outside hierarchy.', 'Note', {
						timeOut: 6000,
					});
					let sectionsToLinkAgain = [];
					let allIds: any = [];
					for (let section of item) {
						section.selected_linked_component = 0;
						section.linked_component = 0;
						this.sectionDragStart = section;
						const obj = {
							section_id: parseInt(this.sectionDragStart.section_id),
						};
						const sectionDragCopy = cloneDeep(this.sectionDragStart);
						this.section_id_carry = cloneDeep(this.sectionDragStart.section_id);
						this.sectionDragStart.section_id = null;
						this.sectionCreated = true;
						const data = section.dashboard;
						let minIdAssigned = 1;
						for (let i: number = 0; i < data?.length; i++) {
							if (data[i].obj?.options?.length) {
								for (let option of data[i].obj?.options) {
									if (!option.unlinkRestrictSection) {
										option['selectedLinkSection'] = {};
									}
									if (!option.unlinkRestrict) {
										option['selectedLinkUi'] = {};
									}
									option.selected = false;
								}
							}
							data[i].obj['carry_uicomponent_name'] = data[i].obj.uicomponent_name;
							delete data[i].id;
							data[i]['id'] = UUID();
							this.setTemplateProperty('uiCompIds', this.getNextUICompId(minIdAssigned), false);
							minIdAssigned = this.layoutService.template.uiCompIds;
							allIds.push({
								oldId: data[i].obj.uicomponent_name,
								newId: JSON.stringify(this.layoutService.template.uiCompIds),
							});
							data[i].obj.uicomponent_name = JSON.stringify(this.layoutService.template.uiCompIds);
							delete data[i].uicomponent_id;
							if (this.uicomponentTypes.INPUT in data[i].obj) {
								data[i].obj.input = '';
							}
							if (data[i].obj.MultiSelectObj) {
								delete data[i].obj.MultiSelectObj;
								data[i].obj.manualoptions = true;
								data[i].obj.multilinked = false;
								data[i].obj.options = [];
								data[i].obj.answers = [];
							}
							if (data[i].obj.answers) {
								data[i].obj.answers = [];
							}
							this.componentsService.push({
								id: data[i].id,
								componentRef: data[i].obj.type,
							});
						}
						for (let x: number = 0; x < data?.length; x++) {
							if (data[x].obj.preDefind) {
								let is_exist: boolean = false;
								for (let i: number = 0; i < this.PreDefinedList?.length; i++) {
									if (this.PreDefinedList[i].objectid == data[x].id) {
										is_exist = true;
										this.PreDefinedList[i].predefinedvalue = data[x].obj['preDefinedObj'].id;
									}
								}
								if (!is_exist) {
									this.PreDefinedList.push({
										objectid: data[x].id,
										predefinedvalue: data[x].obj['preDefinedObj'].id,
									});
								}
							}
							if (data[x].obj.statement) {
								let tempStatement: any = '';
								tempStatement = data[x].obj.statement;
								if (data[x].obj.type == this.uicomponentTypes.TEXT) {
									let statementArray = tempStatement.match(/@[0-9]+/g);
									if (statementArray) {
										for (let arrayItem of statementArray) {
											if (arrayItem[0] == '@') {
												arrayItem = arrayItem.replace('@', '');
												for (let k: number = 0; k < allIds?.length; k++) {
													if (arrayItem == allIds[k].oldId) {
														tempStatement = tempStatement.replace(
															'@' + arrayItem,
															'@changingThisId' + allIds[k].newId,
														);
													}
												}
											}
										}
									}
									tempStatement = tempStatement.replace(/@changingThisId/g, '@');
									data[x].obj.statement = tempStatement;
									data[x].obj.instanceStatement = tempStatement;
								}
							}
						}
						sectionDragCopy.dashboard = data;
						this.sectionDragStart.dashboard = data;
						if (typeof sectionDragCopy.options === 'string') {
							sectionDragCopy.options = JSON.parse(sectionDragCopy.options);
						}
						this.sectionDragStart.section_title = this.sectionDragStart.section_title;
						this.changeDetector.detectChanges();
						this.removeCollapsePropertiesTab();
						this.setPropertiesTab('showSectionProperties');
						this.setPropertiesTab('showSections');
						this.setPropertiesTab('showUIComponents');
						this.setCollapsePropertiesTab('showUIComponents');
						this.changeDetector.detectChanges();
						if (firstSectionCheck) {
							firstSectionCheck = false;
							this.addOtherSection(1, sectionDragCopy.section_type, true);
							sectionIdMapper.push({
								oldId: section.id,
								newId:
									this.layoutService.template.sections[
										this.layoutService.template.sections?.length - 1
									].id,
								newSecNo:
									this.layoutService.template.sections[
										this.layoutService.template.sections?.length - 1
									].secNo,
								index: this.layoutService.template.sections?.length - 1,
							});
							sectionsToLinkAgain.push(this.layoutService.template.sections?.length - 1);
						} else {
							let children: number = 0;
							let oldSection: any = {};
							let tempParentId: number = 0;
							for (let tempSection of sectionIdMapper) {
								if (tempSection.oldId == section.parentId) {
									tempParentId = tempSection.newId;
									oldSection = tempSection;
								}
							}
							if (tempParentId) {
								section.parentId = tempParentId;
							}
							let currentDepth =
								this.layoutService.template.sections[oldSection.index].secNo.split('.')?.length - 1;
							for (
								let z = oldSection.index + 1;
								z < this.layoutService.template.sections?.length;
								z++
							) {
								let tempDepth = this.layoutService.template.sections[z].secNo.split('.')?.length - 1;
								if (tempDepth > currentDepth) {
									children++;
								} else {
									break;
								}
							}
							this.addSubSection(section.parentId, 1, oldSection.index, true);
							sectionIdMapper.push({
								oldId: section.id,
								newId: this.layoutService.template.sections[oldSection.index + children + 1].id,
								newSecNo:
									this.layoutService.template.sections[oldSection.index + children + 1].secNo,
								index: oldSection.index + children + 1,
							});
							sectionsToLinkAgain.push(oldSection.index + children + 1);
						}
					}
					for (let tempIndex of sectionsToLinkAgain) {
						for (let uiComponent of this.layoutService.template.sections[tempIndex].dashboard) {
							if (uiComponent.obj?.options?.length) {
								for (let option of uiComponent.obj?.options) {
									if (option.linkedRowValue && option.linkedRowValue.id) {
										for (let idCombo of allIds) {
											if (idCombo.oldId == option.linkedRowValue.id) {
												option.linkedRowValue.id = idCombo.newId;
											}
										}
									}
									if (option.unlinkRestrict) {
										for (let idCombo of allIds) {
											if (idCombo.oldId == option.selectedLinkUi.id) {
												option.selectedLinkUi.id = idCombo.newId;
												break;
											}
										}
										for (let tempIndex2 of sectionsToLinkAgain) {
											for (let uiComponent2 of this.layoutService.template.sections[tempIndex2]
												.dashboard) {
												if (option.selectedLinkUi.id == uiComponent2.obj.uicomponent_name) {
													uiComponent2.obj.linked_ui++;
													break;
												}
											}
										}
									}
									delete option.unlinkRestrict;
									if (option.unlinkRestrictSection) {
										for (let idCombo of sectionIdMapper) {
											if (idCombo['oldId'] == option.selectedLinkSection.id) {
												option.selectedLinkSection.secNo = idCombo['newSecNo'];
												option.selectedLinkSection.id = idCombo['newId'];
												break;
											}
										}
										for (let tempIndex2 of sectionsToLinkAgain) {
											if (
												option.selectedLinkSection.id ==
												this.layoutService.template.sections[tempIndex2].id
											) {
												this.layoutService.template.sections[tempIndex2].linked_component++;
												let currentDepth =
													this.layoutService.template.sections[tempIndex2].secNo.split('.')?.length -
													1;
												for (
													let z = tempIndex2 + 1;
													z < this.layoutService.template.sections?.length;
													z++
												) {
													let tempDepth =
														this.layoutService.template.sections[z].secNo.split('.')?.length - 1;
													if (tempDepth > currentDepth) {
														this.layoutService.template.sections[z].linked_component++;
													} else {
														break;
													}
												}
												break;
											}
										}
									}
									delete option.unlinkRestrictSection;
								}
							}
						}
					}
				} else {
					this.toastrService.error('No section copied', 'Error', { timeOut: 6000 });
				}
				this.stopLoader();
			})
			.catch((err) => {
				this.toastrService.error('No section copied', 'Error', { timeOut: 6000 });
				this.stopLoader();
			});
	}
	selectedComponents: any = [];
	setDimensions(event) {
		let check = event;
		if (event.target) {
			check = event.target.value;
		}
		this.layoutService.selectedOption = check;
		if (check == 1) {
			this.layoutService.template.pageSize.height = 279.4;
			this.layoutService.template.pageSize.width = 215.9;
		} else if (check == 2) {
			this.layoutService.template.pageSize.height = 297;
			this.layoutService.template.pageSize.width = 210;
		} else if (check == 3) {
			this.layoutService.template.pageSize.height = 216;
			this.layoutService.template.pageSize.width = 356;
		}
		let widthLimit = Math.floor(this.layoutService.template.pageSize.width / 3);
		let heightLimit = Math.floor(this.layoutService.template.pageSize.height / 3);
		if (this.layoutService.template.pdfMarginTop > heightLimit) {
			this.layoutService.template.pdfMarginTop = heightLimit;
		}
		if (this.layoutService.template.pdfMarginBottom > heightLimit) {
			this.layoutService.template.pdfMarginBottom = heightLimit;
		}
		if (this.layoutService.template.pdfMarginRight > widthLimit) {
			this.layoutService.template.pdfMarginRight = widthLimit;
		}
		if (this.layoutService.template.pdfMarginLeft > widthLimit) {
			this.layoutService.template.pdfMarginLeft = widthLimit;
		}
		if (this.layoutService.defaultHeaderMarginLeft > widthLimit) {
			this.layoutService.defaultHeaderMarginLeft = widthLimit;
		}
		if (this.layoutService.defaultHeaderMarginRight > widthLimit) {
			this.layoutService.defaultHeaderMarginRight = widthLimit;
		}
		if (this.layoutService.defaultFooterMarginLeft > widthLimit) {
			this.layoutService.defaultFooterMarginLeft = widthLimit;
		}
		if (this.layoutService.defaultFooterMarginRight > widthLimit) {
			this.layoutService.defaultFooterMarginRight = widthLimit;
		}
		this.changeDetector.detectChanges();
	}
	setMarginTop(event) {
		let value = event.target.value;
		let limit = Math.floor(this.layoutService.template.pageSize.height / 3);
		if (value > limit) {
			value = limit;
		}
		this.layoutService.template.pdfMarginTop = value;
		this.changeDetector.detectChanges();
	}
	setMarginBottom(event) {
		let value = event.target.value;
		let limit = Math.floor(this.layoutService.template.pageSize.height / 3);
		if (value > limit) {
			value = limit;
		}
		this.layoutService.template.pdfMarginBottom = value;
		this.changeDetector.detectChanges();
	}
	setMarginLeft(event) {
		let value = event.target.value;
		let limit = Math.floor(this.layoutService.template.pageSize.width / 3);
		if (value > limit) {
			value = limit;
		}
		this.layoutService.template.pdfMarginLeft = value;
		this.changeDetector.detectChanges();
	}
	setMarginRight(event) {
		let value = event.target.value;
		let limit = Math.floor(this.layoutService.template.pageSize.width / 3);
		if (value > limit) {
			value = limit;
		}
		this.layoutService.template.pdfMarginRight = value;
		this.changeDetector.detectChanges();
	}
	selectAllUI(sectionIndex) {
		this.selectedComponents = [];
		for (
			let i: number = 0;
			i < this.layoutService.template.sections[sectionIndex].dashboard?.length - 1;
			i++
		) {
			this.layoutService.template.sections[sectionIndex].dashboard[i]['isClick'] = true;
			this.selectedComponents.push({
				sectionIndex: sectionIndex,
				dashboardIndex: i,
				type: this.layoutService.template.sections[sectionIndex].dashboard[i].obj.type,
			});
		}
		this.shiftPressed = true;
		this.itemClick(
			sectionIndex,
			this.layoutService.template.sections[sectionIndex].dashboard?.length - 1,
			this.layoutService.template.sections[sectionIndex].dashboard[
				this.layoutService.template.sections[sectionIndex].dashboard?.length - 1
			],
		);
		this.shiftPressed = false;
	}
	itemClick(sectionIndex, dashboardIndex, item) {
		this.validationChecks = [];
		this.uiExternalSearchDataComponents = [];
		this.uiExternalSearchData = [];
		let tempCombinedCheck = true;
		if (this.selectedComponents?.length && this.shiftPressed) {
			for (let i: number = 0; i < this.selectedComponents?.length; i++) {
				if (
					this.selectedComponents[i].sectionIndex == sectionIndex &&
					this.selectedComponents[i].dashboardIndex == dashboardIndex
				) {
					this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex]['isClick'] =
						false;
					this.selectedComponents.splice(i, 1);
					tempCombinedCheck = false;
				}
			}
			if (tempCombinedCheck) {
				this.selectedComponents.push({
					sectionIndex: sectionIndex,
					dashboardIndex: dashboardIndex,
					type: item.obj.type,
				});
				this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex]['isClick'] =
					true;
			}
			if (this.selectedComponents?.length > 1) {
				this.selectMultipleComponents();
				return;
			} else if (this.selectedComponents?.length > 0) {
				sectionIndex = this.selectedComponents[0].sectionIndex;
				dashboardIndex = this.selectedComponents[0].dashboardIndex;
				item =
					this.layoutService.template.sections[this.selectedComponents[0].sectionIndex].dashboard[
						this.selectedComponents[0].dashboardIndex
					];
			} else {
				return;
			}
		} else {
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex]['isClick'] =
				true;
		}
		this.selectedComponents = [];
		this.selectedComponents.push({
			sectionIndex: sectionIndex,
			dashboardIndex: dashboardIndex,
			type: item.obj.type,
		});
		const startTime = performance.now();
		if (
			this.layoutService.lastI == sectionIndex &&
			this.layoutService.lastK == dashboardIndex &&
			((item.obj.type === this.uicomponentTypes.TEXT &&
				this.showTextProperties &&
				this.collapsePropertiesTab['showTextProperties']) ||
				(item.obj.type === this.uicomponentTypes.INPUT &&
					this.showInputProperties &&
					this.collapsePropertiesTab['showInputProperties']) ||
				(item.obj.type === this.uicomponentTypes.CHECKBOX &&
					this.showCheckBoxProperties &&
					this.collapsePropertiesTab['showCheckBoxProperties']) ||
				(item.obj.type === this.uicomponentTypes.LINE &&
					this.showLineProperties &&
					this.collapsePropertiesTab['showLineProperties']) ||
				(item.obj.type === this.uicomponentTypes.SIGNATURE &&
					this.showSignatureProperties &&
					this.collapsePropertiesTab['showSignatureProperties']) ||
				(item.obj.type === this.uicomponentTypes.IMAGE_LABEL &&
					this.showImageLabelProperties &&
					this.collapsePropertiesTab['showImageLabelProperties']) ||
				(item.obj.type === this.uicomponentTypes.SIMPLE_IMAGE &&
					this.showImageProperties &&
					this.collapsePropertiesTab['showImageProperties']) ||
				(item.obj.type === this.uicomponentTypes.RADIO &&
					this.showRadioProperties &&
					this.collapsePropertiesTab['showRadioProperties']) ||
				(item.obj.type === this.uicomponentTypes.SWITCH &&
					this.showSwitchProperties &&
					this.collapsePropertiesTab['showSwitchProperties']) ||
				(item.obj.type === this.uicomponentTypes.INTELLISENSE &&
					this.showIntellisenseProperties &&
					this.collapsePropertiesTab['showIntellisenseProperties']) ||
				(item.obj.type === this.uicomponentTypes.DROPDOWN &&
					this.showDropDownProperties &&
					this.collapsePropertiesTab['showDropDownProperties']) ||
				(item.obj.type === this.uicomponentTypes.TABLE_DROPDOWN &&
					this.showTableDropDownProperties &&
					this.collapsePropertiesTab['showTableDropDownProperties']) ||
				(item.obj.type === this.uicomponentTypes.INCREMENT &&
					this.showIncrementProperties &&
					this.collapsePropertiesTab['showIncrementProperties']) ||
				(item.obj.type === this.uicomponentTypes.DRAWING &&
					this.showDrawingProperties &&
					this.collapsePropertiesTab['showDrawingProperties']) ||
				(item.obj.type === this.uicomponentTypes.CALCULATION &&
					this.showCalculationProperties &&
					this.collapsePropertiesTab['showCalculationProperties']) ||
				(item.obj.type === this.uicomponentTypes.INTENSITY &&
					this.showIntensityProperties &&
					this.collapsePropertiesTab['showIntensityProperties']))
		) {
			return;
		} else {
			for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
				for (let j: number = 0; j < this.layoutService.template.sections[i].dashboard?.length; j++) {
					this.layoutService.template.sections[i].dashboard[j]['isClick'] = false;
				}
			}
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex]['isClick'] =
				true;
			this.layoutService.lastI = sectionIndex;
			this.layoutService.lastK = dashboardIndex;
			this.removeCollapsePropertiesTab();
		}
		if (item.obj.type === this.uicomponentTypes.CHECKBOX && !this.showCheckBoxProperties) {
			this.removeCollapsePropertiesTab();
			this.setPropertiesTab('showCheckBoxProperties');
			this.setCollapsePropertiesTab('showCheckBoxProperties');
			this.uiSearchDataComponents = [];
			this.uiSearchData = [];
			this.sectionSearchData = [];
			this.sectionSearchDataComponents = [];
			this.uiSearchData = [];
			this.linkUIComponentsInput = '';
			this.linkSectionComponentsInput = '';
			for (let section of this.layoutService.template.sections) {
				for (let ui of section.dashboard) {
					if (item.obj.uicomponent_name != ui.obj.uicomponent_name) {
						this.uiSearchDataComponents.push({
							id: ui.obj.uicomponent_name,
							name: ui.obj.second_name,
						});
					}
				}
			}
			const sectionId = this.layoutService.template.sections[sectionIndex].id;
			let topLevelParent = -1;
			let temp = -1;
			for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
				if (this.layoutService.template.sections[i].parentId === 0) {
					temp = this.layoutService.template.sections[i].id;
				}
				if (this.layoutService.template.sections[i].id == sectionId) {
					topLevelParent = temp;
				}
				if (
					this.layoutService.template.sections[i].id !== sectionId &&
					(this.layoutService.template.sections[i].parentId === 0 ||
						this.layoutService.template.sections[i].parentId === sectionId)
				) {
					this.sectionSearchDataComponents.push({
						id: this.layoutService.template.sections[i].id,
						secNo: this.layoutService.template.sections[i].secNo,
						name: this.layoutService.template.sections[i].boundSectionStatement,
					});
				}
				if (this.layoutService.template.sections[i].id == sectionId) {
					topLevelParent = temp;
					for (let j: number = 0; j < this.sectionSearchDataComponents?.length; j++) {
						if (
							this.layoutService.template.sections[i].parentId ==
								this.sectionSearchDataComponents[j].id ||
							topLevelParent == this.sectionSearchDataComponents[j].id
						) {
							this.sectionSearchDataComponents.splice(j, 1);
						}
					}
				}
			}
		}
		if (item.obj.type === this.uicomponentTypes.RADIO && !this.showRadioProperties) {
			this.removeCollapsePropertiesTab();
			this.setPropertiesTab('showRadioProperties');
			this.setCollapsePropertiesTab('showRadioProperties');
			this.uiSearchDataComponents = [];
			this.uiSearchData = [];
			this.sectionSearchData = [];
			this.sectionSearchDataComponents = [];
			this.uiSearchData = [];
			this.linkUIComponentsInput = '';
			this.linkSectionComponentsInput = '';
			for (let section of this.layoutService.template.sections) {
				for (let ui of section.dashboard) {
					if (item.obj.uicomponent_name != ui.obj.uicomponent_name) {
						this.uiSearchDataComponents.push({
							id: ui.obj.uicomponent_name,
							name: ui.obj.second_name,
						});
					}
				}
			}
			this.sectionSearchDataComponents = [];
			const sectionId = this.layoutService.template.sections[sectionIndex].id;
			let topLevelParent = -1;
			let temp = -1;
			for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
				if (this.layoutService.template.sections[i].parentId === 0) {
					temp = this.layoutService.template.sections[i].id;
				}
				if (this.layoutService.template.sections[i].id == sectionId) {
					topLevelParent = temp;
				}
				if (
					this.layoutService.template.sections[i].id !== sectionId &&
					(this.layoutService.template.sections[i].parentId === 0 ||
						this.layoutService.template.sections[i].parentId === sectionId)
				) {
					this.sectionSearchDataComponents.push({
						id: this.layoutService.template.sections[i].id,
						secNo: this.layoutService.template.sections[i].secNo,
						name: this.layoutService.template.sections[i].boundSectionStatement,
					});
				}
				if (this.layoutService.template.sections[i].id == sectionId) {
					topLevelParent = temp;
					for (let j: number = 0; j < this.sectionSearchDataComponents?.length; j++) {
						if (
							this.layoutService.template.sections[i].parentId ==
								this.sectionSearchDataComponents[j].id ||
							topLevelParent == this.sectionSearchDataComponents[j].id
						) {
							this.sectionSearchDataComponents.splice(j, 1);
						}
					}
				}
			}
		}
		if (item.obj.type === this.uicomponentTypes.INPUT && !this.showInputProperties) {
			this.removeCollapsePropertiesTab();
			this.setPropertiesTab('showInputProperties');
			this.setCollapsePropertiesTab('showInputProperties');
			this.preDefindAllFields = this.PreDefinedListText;
		}
		if (item.obj.type === this.uicomponentTypes.INTELLISENSE && !this.showIntellisenseProperties) {
			this.removeCollapsePropertiesTab();
			this.setPropertiesTab('showIntellisenseProperties');
			this.setCollapsePropertiesTab('showIntellisenseProperties');
			this.preDefindAllFields = this.PreDefinedListDropDown;
			this.uiSearchDataComponents = [];
			this.uiSearchData = [];
			this.sectionSearchDataComponents = [];
			this.sectionSearchData = [];
			this.linkUIComponentsInput = '';
			this.linkSectionComponentsInput = '';
			for (let section of this.layoutService.template.sections) {
				for (let ui of section.dashboard) {
					if (item.obj.uicomponent_name != ui.obj.uicomponent_name) {
						this.uiSearchDataComponents.push({
							id: ui.obj.uicomponent_name,
							name: ui.obj.second_name,
						});
					}
				}
			}
			this.sectionSearchDataComponents = [];
			const sectionId = this.layoutService.template.sections[sectionIndex].id;
			let topLevelParent = -1;
			let temp = -1;
			for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
				if (this.layoutService.template.sections[i].parentId === 0) {
					temp = this.layoutService.template.sections[i].id;
				}
				if (this.layoutService.template.sections[i].id == sectionId) {
					topLevelParent = temp;
				}
				if (
					this.layoutService.template.sections[i].id !== sectionId &&
					(this.layoutService.template.sections[i].parentId === 0 ||
						this.layoutService.template.sections[i].parentId === sectionId)
				) {
					this.sectionSearchDataComponents.push({
						id: this.layoutService.template.sections[i].id,
						secNo: this.layoutService.template.sections[i].secNo,
						name: this.layoutService.template.sections[i].boundSectionStatement,
					});
				}
				if (this.layoutService.template.sections[i].id == sectionId) {
					topLevelParent = temp;
					for (let j: number = 0; j < this.sectionSearchDataComponents?.length; j++) {
						if (
							this.layoutService.template.sections[i].parentId ==
								this.sectionSearchDataComponents[j].id ||
							topLevelParent == this.sectionSearchDataComponents[j].id
						) {
							this.sectionSearchDataComponents.splice(j, 1);
						}
					}
				}
			}
		}
		if (item.obj.type === this.uicomponentTypes.LINE && !this.showLineProperties) {
			this.removeCollapsePropertiesTab();
			this.setPropertiesTab('showLineProperties');
			this.setCollapsePropertiesTab('showLineProperties');
		}
		if (item.obj.type === this.uicomponentTypes.SIGNATURE && !this.showSignatureProperties) {
			this.removeCollapsePropertiesTab();
			this.setPropertiesTab('showSignatureProperties');
			this.setCollapsePropertiesTab('showSignatureProperties');
		}
		if (item.obj.type === this.uicomponentTypes.TEXT && !this.showTextProperties) {
			this.removeCollapsePropertiesTab();
			this.setPropertiesTab('showTextProperties');
			this.setCollapsePropertiesTab('showTextProperties');
		}
		if (item.obj.type === this.uicomponentTypes.SWITCH && !this.showSwitchProperties) {
			this.removeCollapsePropertiesTab();
			this.setPropertiesTab('showSwitchProperties');
			this.setCollapsePropertiesTab('showSwitchProperties');
			this.showSwitchProperties = true;
			this.uiSearchDataComponents = [];
			this.uiSearchData = [];
			this.sectionSearchDataComponents = [];
			this.sectionSearchData = [];
			this.linkUIComponentsInput = '';
			this.linkSectionComponentsInput = '';
			for (let section of this.layoutService.template.sections) {
				for (let ui of section.dashboard) {
					if (item.obj.uicomponent_name != ui.obj.uicomponent_name) {
						this.uiSearchDataComponents.push({
							id: ui.obj.uicomponent_name,
							name: ui.obj.second_name,
						});
					}
				}
			}
			this.sectionSearchDataComponents = [];
			const sectionId = this.layoutService.template.sections[sectionIndex].id;
			let topLevelParent = -1;
			let temp = -1;
			for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
				if (this.layoutService.template.sections[i].parentId === 0) {
					temp = this.layoutService.template.sections[i].id;
				}
				if (this.layoutService.template.sections[i].id == sectionId) {
					topLevelParent = temp;
				}
				if (
					this.layoutService.template.sections[i].id !== sectionId &&
					(this.layoutService.template.sections[i].parentId === 0 ||
						this.layoutService.template.sections[i].parentId === sectionId)
				) {
					this.sectionSearchDataComponents.push({
						id: this.layoutService.template.sections[i].id,
						secNo: this.layoutService.template.sections[i].secNo,
						name: this.layoutService.template.sections[i].boundSectionStatement,
					});
				}
				if (this.layoutService.template.sections[i].id == sectionId) {
					topLevelParent = temp;
					for (let j: number = 0; j < this.sectionSearchDataComponents?.length; j++) {
						if (
							this.layoutService.template.sections[i].parentId ==
								this.sectionSearchDataComponents[j].id ||
							topLevelParent == this.sectionSearchDataComponents[j].id
						) {
							this.sectionSearchDataComponents.splice(j, 1);
						}
					}
				}
			}
		}
		if (item.obj.type === this.uicomponentTypes.DROPDOWN && !this.showDropDownProperties) {
			this.removeCollapsePropertiesTab();
			this.setPropertiesTab('showDropDownProperties');
			this.setCollapsePropertiesTab('showDropDownProperties');
			this.uiSearchDataComponents = [];
			this.uiSearchData = [];
			this.sectionSearchDataComponents = [];
			this.sectionSearchData = [];
			this.linkUIComponentsInput = '';
			this.linkSectionComponentsInput = '';
			for (let section of this.layoutService.template.sections) {
				for (let ui of section.dashboard) {
					if (item.obj.uicomponent_name != ui.obj.uicomponent_name) {
						this.uiSearchDataComponents.push({
							id: ui.obj.uicomponent_name,
							name: ui.obj.second_name,
						});
					}
				}
			}
			this.sectionSearchDataComponents = [];
			const sectionId = this.layoutService.template.sections[sectionIndex].id;
			let topLevelParent = -1;
			let temp = -1;
			for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
				if (this.layoutService.template.sections[i].parentId === 0) {
					temp = this.layoutService.template.sections[i].id;
				}
				if (this.layoutService.template.sections[i].id == sectionId) {
					topLevelParent = temp;
				}
				if (
					this.layoutService.template.sections[i].id !== sectionId &&
					(this.layoutService.template.sections[i].parentId === 0 ||
						this.layoutService.template.sections[i].parentId === sectionId)
				) {
					this.sectionSearchDataComponents.push({
						id: this.layoutService.template.sections[i].id,
						secNo: this.layoutService.template.sections[i].secNo,
						name: this.layoutService.template.sections[i].boundSectionStatement,
					});
				}
				if (this.layoutService.template.sections[i].id == sectionId) {
					topLevelParent = temp;
					for (let j: number = 0; j < this.sectionSearchDataComponents?.length; j++) {
						if (
							this.layoutService.template.sections[i].parentId ==
								this.sectionSearchDataComponents[j].id ||
							topLevelParent == this.sectionSearchDataComponents[j].id
						) {
							this.sectionSearchDataComponents.splice(j, 1);
						}
					}
				}
			}
		}
		if (item.obj.type === this.uicomponentTypes.INCREMENT && !this.showIncrementProperties) {
			this.removeCollapsePropertiesTab();
			this.setPropertiesTab('showIncrementProperties');
			this.setCollapsePropertiesTab('showIncrementProperties');
		}
		if (item.obj.type === this.uicomponentTypes.TABLE_DROPDOWN && !this.showTableDropDownProperties) {
			this.removeCollapsePropertiesTab();
			this.linkRowComponentsInput = '';
			this.setPropertiesTab('showTableDropDownProperties');
			this.setCollapsePropertiesTab('showTableDropDownProperties');
			for (let ui of this.layoutService.template.sections[this.layoutService.lastI].dashboard) {
				if (ui.obj.type == this.uicomponentTypes.TEXT && ui.x == 0) {
					this.rowSearchDataComponents.push({
						id: ui.obj.uicomponent_name,
						name: ui.obj.second_name,
						y: ui.y,
					});
				}
			}
			for (let x: number = 0; x < this.rowSearchDataComponents?.length; x++) {
				for (let y = x + 1; y < this.rowSearchDataComponents?.length; y++)
					if (this.rowSearchDataComponents[x].y > this.rowSearchDataComponents[y].y) {
						let temp = this.rowSearchDataComponents[x];
						this.rowSearchDataComponents[x] = this.rowSearchDataComponents[y];
						this.rowSearchDataComponents[y] = temp;
					}
			}
			let rowNumber: number = 0;
			for (let item of this.rowSearchDataComponents) {
				item.row = ++rowNumber;
			}
			for (let ui of this.layoutService.template.sections[this.layoutService.lastI].dashboard) {
				if (ui.obj.type == this.uicomponentTypes.TEXT && ui.x == 0 && ui.obj.linkedRow) {
					for (let item of this.rowSearchDataComponents) {
						if (item.id == ui.obj.uicomponent_name) {
							const index = this.rowSearchDataComponents.indexOf(item);
							this.rowSearchDataComponents.splice(index, 1);
							break;
						}
					}
				}
			}
		}
		if (item.obj.type === this.uicomponentTypes.DRAWING && !this.showDrawingProperties) {
			this.removeCollapsePropertiesTab();
			this.setPropertiesTab('showDrawingProperties');
			this.setCollapsePropertiesTab('showDrawingProperties');
		}
		if (item.obj.type === this.uicomponentTypes.CALCULATION && !this.showCalculationProperties) {
			this.removeCollapsePropertiesTab();
			this.setPropertiesTab('showCalculationProperties');
			this.setCollapsePropertiesTab('showCalculationProperties');
		}
		if (item.obj.type === this.uicomponentTypes.INTENSITY && !this.showIntensityProperties) {
			this.removeCollapsePropertiesTab();
			this.setPropertiesTab('showIntensityProperties');
			this.setCollapsePropertiesTab('showIntensityProperties');
		}
		if (item.obj.type === this.uicomponentTypes.IMAGE_LABEL && !this.showImageLabelProperties) {
			this.removeCollapsePropertiesTab();
			this.setPropertiesTab('showImageLabelProperties');
			this.setCollapsePropertiesTab('showImageLabelProperties');
			this.sectionSearchDataComponents = [];
			const sectionId = this.layoutService.template.sections[sectionIndex].id;
			let topLevelParent = -1;
			let temp = -1;
			for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
				if (this.layoutService.template.sections[i].parentId === 0) {
					temp = this.layoutService.template.sections[i].id;
				}
				if (this.layoutService.template.sections[i].id == sectionId) {
					topLevelParent = temp;
				}
				if (
					this.layoutService.template.sections[i].id !== sectionId &&
					(this.layoutService.template.sections[i].parentId === 0 ||
						this.layoutService.template.sections[i].parentId === sectionId)
				) {
					this.sectionSearchDataComponents.push({
						id: this.layoutService.template.sections[i].id,
						secNo: this.layoutService.template.sections[i].secNo,
						name: this.layoutService.template.sections[i].boundSectionStatement,
					});
				}
				if (this.layoutService.template.sections[i].id == sectionId) {
					topLevelParent = temp;
					for (let j: number = 0; j < this.sectionSearchDataComponents?.length; j++) {
						if (
							this.layoutService.template.sections[i].parentId ==
								this.sectionSearchDataComponents[j].id ||
							topLevelParent == this.sectionSearchDataComponents[j].id
						) {
							this.sectionSearchDataComponents.splice(j, 1);
						}
					}
				}
			}
		}
		if (item.obj.type === this.uicomponentTypes.SIMPLE_IMAGE) {
			this.removeCollapsePropertiesTab();
			this.setPropertiesTab('showImageProperties');
			this.setCollapsePropertiesTab('showImageProperties');
			this.sectionSearchDataComponents = [];
			const sectionId = this.layoutService.template.sections[sectionIndex].id;
			let topLevelParent = -1;
			let temp = -1;
			for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
				if (this.layoutService.template.sections[i].parentId === 0) {
					temp = this.layoutService.template.sections[i].id;
				}
				if (this.layoutService.template.sections[i].id == sectionId) {
					topLevelParent = temp;
				}
				if (
					this.layoutService.template.sections[i].id !== sectionId &&
					(this.layoutService.template.sections[i].parentId === 0 ||
						this.layoutService.template.sections[i].parentId === sectionId)
				) {
					this.sectionSearchDataComponents.push({
						id: this.layoutService.template.sections[i].id,
						secNo: this.layoutService.template.sections[i].secNo,
						name: this.layoutService.template.sections[i].boundSectionStatement,
					});
				}
				if (this.layoutService.template.sections[i].id == sectionId) {
					topLevelParent = temp;
					for (let j: number = 0; j < this.sectionSearchDataComponents?.length; j++) {
						if (
							this.layoutService.template.sections[i].parentId ==
								this.sectionSearchDataComponents[j].id ||
							topLevelParent == this.sectionSearchDataComponents[j].id
						) {
							this.sectionSearchDataComponents.splice(j, 1);
						}
					}
				}
			}
		}
		this.showSections = true;
		this.showSectionProperties = true;
		this.RefreshMulitlinkArray();
		this.GetHeightValue();
		const duration = performance.now() - startTime;
		this.changeDetector.detectChanges();
	}
	combinedAlignmentValue: string = 'none';
	combinedHidePdf: boolean = true;
	combinedLineSpacing: boolean = true;
	combinedLineSpacingValue: number = 15;
	combinedBgColor: boolean = true;
	combinedBgColorValue = '#ffffff';
	combinedFontColor: boolean = true;
	combinedFontColorValue = '#000000';
	combinedFontFamily: boolean = true;
	combinedFontFamilyValue: string = '';
	combinedSameLineInput: boolean = true;
	combinedHasText: boolean = false;
	combinedHasNonText: boolean = false;
	combinedHasNonInput: boolean = false;
	combinedRequired: boolean = true;
	combinedSingleSelection: boolean = true;
	combinedLinkedOptions: boolean = true;
	combinedPreDefined: boolean = true;
	combinedShowStatement: boolean = true;
	combinedUIBorders: boolean = true;
	combinedUIPadding: boolean = true;
	combinedHasNonStatement: boolean = false;
	combinedDisplayOptions: boolean = true;
	combinedHasNonRadioCheck: boolean = false;
	combinedComments: boolean = false;
	combinedCommentsRequired: boolean = false;
	combinedPlaceHolder: string = 'Type Here';
	combinedMaxCharLength: string = '';
	combinedHasNonLine: boolean = false;
	combinedHasLine: boolean = false;
	combinedValidationCheck: boolean = false;
	combinedValidationCheckOptions: boolean = false;
	combinedMinMaxCheck: boolean = false;
	combinedMinMaxCheckOptions: boolean = false;
	combinedLineHorizontal: boolean = false;
	combinedHasNonMultiSelect: boolean = false;
	combinedShowOptionsMenu: boolean = true;
	combinedOptionView: number = 0;
	combinedLinkedOptionsValue: any = {
		isBold: true,
		isItalic: true,
		isUnderline: true,
		listOptions: 0,
	};
	combinedValidationValueType: any = {};
	combinedDateFormatValue: any = {};
	combinedMinLimit: string = '';
	combinedMaxLimit: string = '';
	combinedDecimalRoundOff: boolean = false;
	combinedDecimalPlacesLimit: string = '';
	combinedValidationValueTypeOptions: any = {};
	combinedDateFormatValueOptions: any = {};
	combinedMinLimitOptions: string = '';
	combinedMaxLimitOptions: string = '';
	combinedDecimalRoundOffOptions: boolean = false;
	combinedDecimalPlacesLimitOptions: string = '';
	setCombinedMinLimit(event) {
		this.combinedMinLimit = event;
		for (let component of this.selectedComponents) {
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.minLimit = this.combinedMinLimit;
		}
		this.layoutService.backupId++;
	}
	setCombinedMaxLimit(event) {
		this.combinedMaxLimit = event;
		for (let component of this.selectedComponents) {
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.maxLimit = this.combinedMaxLimit;
		}
		this.layoutService.backupId++;
	}
	setCombinedDecimalRoundOff() {
		this.combinedDecimalRoundOff = !this.combinedDecimalRoundOff;
		for (let component of this.selectedComponents) {
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.decimalRoundOff = this.combinedDecimalRoundOff;
		}
		this.layoutService.backupId++;
	}
	setCombinedDecimalPlacesLimit(event) {
		this.combinedDecimalPlacesLimit = event;
		for (let component of this.selectedComponents) {
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.decimalPlacesLimit = this.combinedDecimalPlacesLimit;
		}
		this.layoutService.backupId++;
	}
	setCombinedValidationValue(index) {
		this.combinedValidationValueType = this.validationChecks[index];
		for (let component of this.selectedComponents) {
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.validationValue = this.validationChecks[index];
			if (
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.validationValue.value == 'Date'
			) {
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.formatValue = {
					slug: 'MM/DD/YYYY',
					value: 'MM/DD/YYYY',
				};
			}
			if (
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.validationValue.value == 'Datetime'
			) {
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.formatValue = {
					slug: 'MM/DD/YYYYTHH:mm',
					value: 'MM/DD/YYYY 24 hour',
				};
			}
			if (
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.validationValue.value == 'Time'
			) {
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.formatValue = {
					slug: 'HH:mm',
					value: '24 hour',
				};
			}
			this.setUIProperty(component.sectionIndex, component.dashboardIndex, 'maxLimit', '', false);
			this.setUIProperty(component.sectionIndex, component.dashboardIndex, 'minLimit', '', false);
			this.combinedMaxLimit = '';
			this.combinedMinLimit = '';
			if (
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.errors
			) {
				this.removeErrorsObj(component.sectionIndex, component.dashboardIndex);
			}
			this.calculateCalculationFields();
			this.changeDetector.detectChanges();
		}
		this.layoutService.backupId++;
	}
	setCombinedDateFormatValue(index) {
		this.combinedDateFormatValue = index;
		for (let component of this.selectedComponents) {
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.formatValue = index;
		}
		this.changeDetector.detectChanges();
		this.layoutService.backupId++;
	}
	deleteCombinedValidationValue() {
		this.combinedValidationValueType = {};
		for (let component of this.selectedComponents) {
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.validationValue = {};
		}
		this.layoutService.backupId++;
	}
	setCombinedValidationCheck() {
		this.combinedValidationCheck = !this.combinedValidationCheck;
		for (let component of this.selectedComponents) {
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.validationCheck = this.combinedValidationCheck;
			if (
				!this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.validationCheck
			) {
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.validationValue = {};
			}
			this.setUIProperty(component.sectionIndex, component.dashboardIndex, 'maxLimit', '', false);
			this.setUIProperty(component.sectionIndex, component.dashboardIndex, 'minLimit', '', false);
			this.combinedMaxLimit = '';
			this.combinedMinLimit = '';
			if (
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.errors
			) {
				this.removeErrorsObj(component.sectionIndex, component.dashboardIndex);
			}
		}
		this.calculateCalculationFields();
		this.layoutService.backupId++;
	}
	SetCombinedOptionsView(value) {
		this.combinedOptionView = value;
		for (let component of this.selectedComponents) {
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.OptionView = value;
		}
		this.layoutService.backupId++;
	}
	setCombinedAlignment(value) {
		this.combinedAlignmentValue = value;
		for (let component of this.selectedComponents) {
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.alignment = value;
		}
		this.layoutService.backupId++;
	}
	setCombinedUIBorders() {
		this.combinedUIBorders = !this.combinedUIBorders;
		for (let component of this.selectedComponents) {
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.uiBorders = this.combinedUIBorders;
		}
		this.layoutService.backupId++;
	}
	setCombinedUIPadding() {
		this.combinedUIPadding = !this.combinedUIPadding;
		for (let component of this.selectedComponents) {
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.uiPaddings = this.combinedUIPadding;
		}
		this.layoutService.backupId++;
	}
	setCombinedStatement() {
		this.combinedShowStatement = !this.combinedShowStatement;
		for (let component of this.selectedComponents) {
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.isStatement = this.combinedShowStatement;
		}
		this.layoutService.backupId++;
	}
	setCombinedBold() {
		this.combinedLinkedOptionsValue.isBold = !this.combinedLinkedOptionsValue.isBold;
		for (let component of this.selectedComponents) {
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.isBold = this.combinedLinkedOptionsValue.isBold;
		}
		this.layoutService.backupId++;
	}
	setCombinedItalic() {
		this.combinedLinkedOptionsValue.isItalic = !this.combinedLinkedOptionsValue.isItalic;
		for (let component of this.selectedComponents) {
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.isItalic = this.combinedLinkedOptionsValue.isItalic;
		}
		this.layoutService.backupId++;
	}
	setCombinedUnderline() {
		this.combinedLinkedOptionsValue.isUnderline = !this.combinedLinkedOptionsValue.isUnderline;
		for (let component of this.selectedComponents) {
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.isUnderline = this.combinedLinkedOptionsValue.isUnderline;
		}
		this.layoutService.backupId++;
	}
	setCombinedListOptions(value) {
		if (this.combinedLinkedOptionsValue.listOptions != value) {
			this.combinedLinkedOptionsValue.listOptions = value;
		} else {
			this.combinedLinkedOptionsValue.listOptions = 0;
		}
		for (let component of this.selectedComponents) {
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.listOptions = this.combinedLinkedOptionsValue.listOptions;
		}
		this.layoutService.backupId++;
	}
	setCombinedDisplayOptions() {
		this.combinedDisplayOptions = !this.combinedDisplayOptions;
		for (let component of this.selectedComponents) {
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.displayOption = this.combinedDisplayOptions;
		}
		this.layoutService.backupId++;
	}
	setCombinedLineHorizontal(e) {
		this.combinedLineHorizontal = e;
		for (let component of this.selectedComponents) {
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.horizontal = this.combinedLineHorizontal;
		}
		this.layoutService.backupId++;
	}
	selectMultipleComponents() {
		this.removeCollapsePropertiesTab();
		this.setPropertiesTab('showCombinedProperties');
		this.setCollapsePropertiesTab('showCombinedProperties');
		this.combinedAlignmentValue = 'none';
		this.combinedHidePdf = true;
		this.combinedLineSpacing = true;
		this.combinedFontColor = true;
		this.combinedBgColor = true;
		this.combinedFontFamily = true;
		this.combinedSameLineInput = true;
		this.combinedRequired = true;
		this.combinedSingleSelection = true;
		this.combinedHasText = false;
		this.combinedHasNonText = false;
		this.combinedValidationValueType = {};
		this.combinedDateFormatValue = {};
		this.combinedMinLimit = '';
		this.combinedMaxLimit = '';
		this.combinedDecimalRoundOff = false;
		this.combinedDecimalPlacesLimitOptions = '';
		this.combinedDateFormatValueOptions = {};
		this.combinedMinLimitOptions = '';
		this.combinedMaxLimitOptions = '';
		this.combinedDecimalRoundOffOptions = false;
		this.combinedDecimalPlacesLimitOptions = '';
		this.combinedValidationValueTypeOptions = {};
		this.combinedHasNonInput = false;
		this.combinedLinkedOptions = true;
		this.combinedHasNonStatement = false;
		this.combinedShowStatement = true;
		this.combinedUIBorders = true;
		this.combinedUIPadding = true;
		this.combinedPreDefined = true;
		this.combinedHasNonRadioCheck = false;
		this.combinedHasNonMultiSelect = false;
		this.combinedShowOptionsMenu = true;
		this.combinedDisplayOptions = true;
		this.combinedOptionView = 0;
		this.combinedHasNonLine = false;
		this.combinedHasLine = false;
		this.combinedLineHorizontal = false;
		this.combinedLinkedOptionsValue = {
			isBold: true,
			isItalic: true,
			isUnderline: true,
			listOptions: 0,
		};
		let tempValidationValue =
			this.layoutService.template.sections[this.selectedComponents[0].sectionIndex].dashboard[
				this.selectedComponents[0].dashboardIndex
			].obj.validationValue || {};
		this.combinedValidationValueType = tempValidationValue;
		let tempDateFormat =
			this.layoutService.template.sections[this.selectedComponents[0].sectionIndex].dashboard[
				this.selectedComponents[0].dashboardIndex
			].obj.dateFormat || {};
		this.combinedDateFormatValue = tempDateFormat;
		let tempMinLimit =
			this.layoutService.template.sections[this.selectedComponents[0].sectionIndex].dashboard[
				this.selectedComponents[0].dashboardIndex
			].obj.minLimit || '';
		this.combinedMinLimit = tempMinLimit;
		let tempMaxLimit =
			this.layoutService.template.sections[this.selectedComponents[0].sectionIndex].dashboard[
				this.selectedComponents[0].dashboardIndex
			].obj.maxLimit || '';
		this.combinedMaxLimit = tempMaxLimit;
		let tempDecimalRoundOff =
			this.layoutService.template.sections[this.selectedComponents[0].sectionIndex].dashboard[
				this.selectedComponents[0].dashboardIndex
			].obj.decimalRoundOff || false;
		this.combinedDecimalRoundOff = tempDecimalRoundOff;
		let tempDecimalPlacesLimit =
			this.layoutService.template.sections[this.selectedComponents[0].sectionIndex].dashboard[
				this.selectedComponents[0].dashboardIndex
			].obj.decimalPlacesLimit || '';
		this.combinedDecimalPlacesLimit = tempDecimalPlacesLimit;
		let tempOptionView =
			this.layoutService.template.sections[this.selectedComponents[0].sectionIndex].dashboard[
				this.selectedComponents[0].dashboardIndex
			].obj.OptionView;
		this.combinedOptionView = tempOptionView;
		let tempAlignmentValue =
			this.layoutService.template.sections[this.selectedComponents[0].sectionIndex].dashboard[
				this.selectedComponents[0].dashboardIndex
			].obj.alignment;
		this.combinedAlignmentValue = tempAlignmentValue;
		let tempListOptions =
			this.layoutService.template.sections[this.selectedComponents[0].sectionIndex].dashboard[
				this.selectedComponents[0].dashboardIndex
			].obj.listOptions;
		this.combinedLinkedOptionsValue.listOptions = tempListOptions;
		for (let component of this.selectedComponents) {
			let tempComponent =
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				];
			if (tempComponent.obj.alignment != tempAlignmentValue) {
				this.combinedAlignmentValue = 'none';
			}
			if (tempComponent.obj.OptionView != tempOptionView) {
				this.combinedOptionView = 0;
			}
			if (tempComponent.obj.validationValue != tempValidationValue) {
				this.combinedValidationValueType = {};
			}
			if (tempComponent.obj.dateFormat != tempDateFormat) {
				this.combinedDateFormatValue = {};
			}
			if (tempComponent.obj.minLimit != tempMinLimit) {
				this.combinedMinLimit = '';
			}
			if (tempComponent.obj.maxLimit != tempMaxLimit) {
				this.combinedMaxLimit = '';
			}
			if (tempComponent.obj.decimalRoundOff != tempDecimalRoundOff) {
				this.combinedDecimalRoundOff = false;
			}
			if (tempComponent.obj.decimalPlacesLimit != tempDecimalPlacesLimit) {
				this.combinedDecimalPlacesLimit = '';
			}
			if (!tempComponent.obj.hidePdf) {
				this.combinedHidePdf = false;
			}
			if (!tempComponent.obj.lineSpacing) {
				this.combinedLineSpacing = false;
			}
			if (!tempComponent.obj.fontColor) {
				this.combinedFontColor = false;
			}
			if (!tempComponent.obj.bgColor) {
				this.combinedBgColor = false;
			}
			if (!tempComponent.obj.fontFamily) {
				this.combinedFontFamily = false;
			}
			if (!tempComponent.obj.sameLineInput) {
				this.combinedSameLineInput = false;
			}
			if (tempComponent.obj.type == this.uicomponentTypes.TEXT) {
				this.combinedHasText = true;
			} else {
				this.combinedHasNonText = true;
			}
			if (tempComponent.obj.type != this.uicomponentTypes.INPUT) {
				this.combinedHasNonInput = true;
			} else if (!tempComponent.obj.preDefind) {
				this.combinedPreDefined = false;
			}
			if (tempComponent.obj.type != this.uicomponentTypes.RADIO && tempComponent.obj.type != this.uicomponentTypes.CHECKBOX) {
				this.combinedHasNonRadioCheck = true;
			}
			if (tempComponent.obj.type == this.uicomponentTypes.LINE) {
				if (tempComponent.obj.horizontal) {
					this.combinedLineHorizontal = true;
				}
				this.combinedHasLine = true;
			} else {
				this.combinedHasNonLine = true;
			}
			if (
				tempComponent.obj.type == this.uicomponentTypes.TEXT ||
				tempComponent.obj.type == this.uicomponentTypes.INPUT ||
				tempComponent.obj.type == this.uicomponentTypes.LINE ||
				tempComponent.obj.type == this.uicomponentTypes.SIMPLE_IMAGE ||
				tempComponent.obj.type == this.uicomponentTypes.IMAGE_LABEL ||
				tempComponent.obj.type == this.uicomponentTypes.INTENSITY ||
				tempComponent.obj.type == this.uicomponentTypes.DRAWING ||
				tempComponent.obj.type == this.uicomponentTypes.CALCULATION ||
				tempComponent.obj.type == this.uicomponentTypes.INCREMENT ||
				tempComponent.obj.type == this.uicomponentTypes.SWITCH ||
				(tempComponent.obj.type == this.uicomponentTypes.DROPDOWN && !tempComponent.obj.isMultiSelect)
			) {
				this.combinedShowOptionsMenu = false;
			}
			if (
				tempComponent.obj.type != this.uicomponentTypes.CHECKBOX &&
				(tempComponent.obj.type != this.uicomponentTypes.DROPDOWN || !tempComponent.obj.isMultiSelect) &&
				tempComponent.obj.type != this.uicomponentTypes.INTELLISENSE
			) {
				this.combinedHasNonMultiSelect = true;
			}
			if (!tempComponent.obj.displayOption) {
				this.combinedDisplayOptions = false;
			}
			if (
				tempComponent.obj.type == this.uicomponentTypes.LINE ||
				tempComponent.obj.type == this.uicomponentTypes.SIMPLE_IMAGE ||
				tempComponent.obj.type == this.uicomponentTypes.DRAWING ||
				tempComponent.obj.type == this.uicomponentTypes.SIGNATURE ||
				(tempComponent.obj.type == this.uicomponentTypes.INPUT && tempComponent.obj.preDefind) ||
				(tempComponent.obj.type == this.uicomponentTypes.INTELLISENSE && tempComponent.obj.preDefind)
			) {
				this.combinedHasNonStatement = true;
			} else if (!tempComponent.obj.isStatement) {
				this.combinedShowStatement = false;
			}
			if (!tempComponent.obj.uiBorders) {
				this.combinedUIBorders = false;
			}
			if (!tempComponent.obj.uiPaddings) {
				this.combinedUIPadding = false;
			}
			if (!tempComponent.obj.is_required) {
				this.combinedRequired = false;
			}
			if (!tempComponent.obj.is_single_select) {
				this.combinedSingleSelection = false;
			}
			if (tempComponent.obj.listOptions != tempListOptions) {
				this.combinedLinkedOptionsValue.listOptions = 0;
			}
			if (!tempComponent.obj.isBold) {
				this.combinedLinkedOptionsValue.isBold = false;
			}
			if (!tempComponent.obj.isItalic) {
				this.combinedLinkedOptionsValue.isItalic = false;
			}
			if (!tempComponent.obj.isUnderline) {
				this.combinedLinkedOptionsValue.isUnderline = false;
			}
		}
		this.showSections = true;
		this.showSectionProperties = true;
	}
	deleteSectionRecurse(listItem, deleteIndex, itemIndex, tempList) {
		if (listItem.id === deleteIndex) {
			tempList.splice(itemIndex, 1);
			return tempList;
		} else {
			for (let i: number = 0; i < listItem.children?.length; i++) {
				tempList[itemIndex].children = this.deleteSectionRecurse(
					listItem.children[i],
					deleteIndex,
					i,
					listItem.children,
				);
			}
			return tempList;
		}
	}
	calculateCalculationFields() {
		this.layoutService.calculationFields = [];
		for (let section of this.layoutService.template.sections) {
			for (let component of section.dashboard) {
				if (component.obj.type == this.uicomponentTypes.INPUT && component.obj.validationValue.value == 'Number') {
					this.layoutService.calculationFields.push({
						id: component.obj.uicomponent_name,
						name: component.obj.uicomponent_name.toString() + '-' + component.obj.second_name,
					});
				}
			}
		}
		this.layoutService.calculationFields = JSON.parse(
			JSON.stringify(this.layoutService.calculationFields),
		);
	}
	undoTask() {
		if (this.layoutService.backupIndex == -1) {
			return;
		}
		if (this.layoutService.backupIndex == -2) {
			this.layoutService.backupIndex = this.layoutService.backupQueue?.length - 1;
		}
		if (this.layoutService.backupQueue?.length) {
			let tempId = this.layoutService.backupQueue[this.layoutService.backupIndex].id;
			while (
				this.layoutService.backupIndex != -1 &&
				this.layoutService.backupQueue[this.layoutService.backupIndex].id == tempId
			) {
				this.performUndoTask(this.layoutService.backupQueue[this.layoutService.backupIndex]);
				this.layoutService.backupIndex--;
			}
		}
	}
	redoTask() {
		if (
			this.layoutService.backupIndex == -2 ||
			this.layoutService.backupIndex == this.layoutService.backupQueue?.length
		) {
			this.layoutService.backupIndex = -2;
			return;
		}
		if (this.layoutService.backupQueue?.length) {
			let tempId = this.layoutService.backupQueue[this.layoutService.backupIndex + 1].id;
			while (
				this.layoutService.backupIndex + 1 < this.layoutService.backupQueue?.length &&
				this.layoutService.backupQueue[this.layoutService.backupIndex + 1].id == tempId
			) {
				this.performRedoTask(this.layoutService.backupQueue[this.layoutService.backupIndex + 1]);
				this.layoutService.backupIndex++;
			}
		}
		if (this.layoutService.backupIndex == this.layoutService.backupQueue?.length - 1) {
			this.layoutService.backupIndex = -2;
		}
	}
	performUndoTask(object) {
		if (object.path == 'addSection' || object.path == 'addSubSection') {
			this.layoutService.template.sections.splice(object.sectionIndex, 1);
			this.removeCollapsePropertiesTab();
			this.setPropertiesTab('showTemplateProperties');
			this.setCollapsePropertiesTab('showTemplateProperties');
			this.GetHeightValue();
			if (!this.layoutService.template.sections?.length) {
				this.layoutService.lastI = null;
				this.layoutService.lastK = null;
			}
		} else if (object.path == 'deleteSection') {
			this.layoutService.template.sections.splice(object.sectionIndex, 0, object.newObject);
			this.removeCollapsePropertiesTab();
			this.setPropertiesTab('showTemplateProperties');
			this.setCollapsePropertiesTab('showTemplateProperties');
			this.GetHeightValue();
			this.resetSectionNumbers();
		} else if (object.path == 'addItem') {
			this.layoutService.template.sections[object.sectionIndex].dashboard.splice(
				object.dashboardIndex,
				1,
			);
			this.removeCollapsePropertiesTab();
			this.setPropertiesTab('showTemplateProperties');
			this.setCollapsePropertiesTab('showTemplateProperties');
			this.GetHeightValue();
			if (!this.layoutService.template.sections[object.sectionIndex].dashboard?.length) {
				this.layoutService.lastK = null;
			}
		} else if (object.path == 'deleteItem') {
			this.layoutService.template.sections[object.sectionIndex].dashboard.splice(
				object.dashboardIndex,
				0,
				object.newObject,
			);
			this.removeCollapsePropertiesTab();
			this.setPropertiesTab('showTemplateProperties');
			this.setCollapsePropertiesTab('showTemplateProperties');
			this.GetHeightValue();
			this.resetSectionNumbers();
		} else if (object.path == 'sectionDragDrop') {
			let tempArray = cloneDeep(this.layoutService.template.sections);
			this.layoutService.template.sections = [];
			for (let olditem of object.oldObject) {
				for (let newitem of tempArray) {
					if (olditem == newitem.id) {
						this.layoutService.template.sections.push(newitem);
						break;
					}
				}
			}
			this.sectionToList();
			this.resetSectionNumbers();
			this.refreshGridster();
		} else if (object.path == 'this') {
			this[`${object.type}`] = object.oldObject;
		} else if (object.path == 'layoutService') {
			this.layoutService[`${object.type}`] = object.oldObject;
		} else if (object.path == 'template') {
			this.layoutService.template[`${object.type}`] = object.oldObject;
		} else if (object.path == 'section') {
			this.layoutService.template.sections[object.sectionIndex][`${object.type}`] =
				object.oldObject;
		} else if (object.path == 'sectionOptions') {
			this.layoutService.template.sections[object.sectionIndex].options[`${object.type}`] =
				object.oldObject;
			this.optionRefresh(object.sectionIndex);
		} else if (object.path == 'dashboard') {
			this.layoutService.template.sections[object.sectionIndex].dashboard[object.dashboardIndex][
				`${object.type}`
			] = object.oldObject;
		} else if (object.path == 'obj') {
			this.layoutService.template.sections[object.sectionIndex].dashboard[
				object.dashboardIndex
			].obj[`${object.type}`] = object.oldObject;
		} else if (object.path == 'option') {
			if (
				object.type == 'selectedLinkSection' &&
				this.layoutService.template.sections[object.sectionIndex].dashboard[object.dashboardIndex]
					.obj.options[object.optionIndex].selected == true
			) {
				for (let section of this.layoutService.template.sections) {
					if (
						this.layoutService.template.sections[object.sectionIndex].dashboard[
							object.dashboardIndex
						].obj.options[object.optionIndex].selectedLinkSection.id == section.id
					) {
						section.selected_linked_component--;
					}
				}
			}
			if (
				object.type == 'selectedLinkUi' &&
				this.layoutService.template.sections[object.sectionIndex].dashboard[object.dashboardIndex]
					.obj.options[object.optionIndex].selected == true
			) {
				for (let section of this.layoutService.template.sections) {
					for (let component of section.dashboard) {
						if (
							this.layoutService.template.sections[object.sectionIndex].dashboard[
								object.dashboardIndex
							].obj.options[object.optionIndex].selectedLinkUi.id == component.uicomponent_name
						) {
							section.selected_linked_ui_component--;
						}
					}
				}
			}
			this.layoutService.template.sections[object.sectionIndex].dashboard[
				object.dashboardIndex
			].obj.options[object.optionIndex][`${object.type}`] = object.oldObject;
		}
		this.changeDetector.detectChanges();
	}
	performRedoTask(object) {
		if (object.path == 'addSection' || object.path == 'addSubSection') {
			this.layoutService.template.sections.splice(object.sectionIndex, 0, object.newObject);
			this.removeCollapsePropertiesTab();
			this.setPropertiesTab('showTemplateProperties');
			this.setCollapsePropertiesTab('showTemplateProperties');
			this.GetHeightValue();
			this.resetSectionNumbers();
		} else if (object.path == 'deleteSection') {
			this.layoutService.template.sections.splice(object.sectionIndex, 1);
			this.removeCollapsePropertiesTab();
			this.setPropertiesTab('showTemplateProperties');
			this.setCollapsePropertiesTab('showTemplateProperties');
			this.GetHeightValue();
			if (!this.layoutService.template.sections?.length) {
				this.layoutService.lastI = null;
				this.layoutService.lastK = null;
			}
		} else if (object.path == 'addItem') {
			this.layoutService.template.sections[object.sectionIndex].dashboard.splice(
				object.dashboardIndex,
				0,
				object.newObject,
			);
			this.removeCollapsePropertiesTab();
			this.setPropertiesTab('showTemplateProperties');
			this.setCollapsePropertiesTab('showTemplateProperties');
			this.GetHeightValue();
			this.resetSectionNumbers();
		} else if (object.path == 'deleteItem') {
			this.layoutService.template.sections[object.sectionIndex].dashboard.splice(
				object.dashboardIndex,
				1,
			);
			this.removeCollapsePropertiesTab();
			this.setPropertiesTab('showTemplateProperties');
			this.setCollapsePropertiesTab('showTemplateProperties');
			this.GetHeightValue();
			if (!this.layoutService.template.sections[object.sectionIndex].dashboard?.length) {
				this.layoutService.lastK = null;
			}
		} else if (object.path == 'sectionDragDrop') {
			let tempArray = cloneDeep(this.layoutService.template.sections);
			this.layoutService.template.sections = [];
			for (let olditem of object.newObject) {
				for (let newitem of tempArray) {
					if (olditem == newitem.id) {
						this.layoutService.template.sections.push(newitem);
						break;
					}
				}
			}
			this.sectionToList();
			this.resetSectionNumbers();
			this.refreshGridster();
		} else if (object.path == 'this') {
			this[`${object.type}`] = object.newObject;
		} else if (object.path == 'template') {
			this.layoutService.template[`${object.type}`] = object.newObject;
		} else if (object.path == 'section') {
			this.layoutService.template.sections[object.sectionIndex][`${object.type}`] =
				object.newObject;
		} else if (object.path == 'sectionOptions') {
			this.layoutService.template.sections[object.sectionIndex].options[`${object.type}`] =
				object.newObject;
			this.optionRefresh(object.sectionIndex);
		} else if (object.path == 'dashboard') {
			this.layoutService.template.sections[object.sectionIndex].dashboard[object.dashboardIndex][
				`${object.type}`
			] = object.newObject;
		} else if (object.path == 'obj') {
			this.layoutService.template.sections[object.sectionIndex].dashboard[
				object.dashboardIndex
			].obj[`${object.type}`] = object.newObject;
		} else if (object.path == 'option') {
			this.layoutService.template.sections[object.sectionIndex].dashboard[
				object.dashboardIndex
			].obj.options[object.optionIndex][`${object.type}`] = object.newObject;
		}
		this.changeDetector.detectChanges();
	}
	deleteSection(index, deleteId, rowMapper?, rowMapperIndex?) {
		if (!rowMapper) {
			// this.coolDialogs
			// 	.confirm('Are you sure you want to delete this section? ', {
			// 		okButtonText: 'OK',
			// 		cancelButtonText: 'Cancel',
			// 	})
			this.bsModalRef = this.modalServiceDialog.show(ConfirmationDialogComponent, {
				initialState: {
				  message: 'Are you sure you want to delete this section?'
				},
				class: 'modal-dialog-centered'
			  });
			  this.bsModalRef.content.result
				.subscribe((response) => {
					if (response == true) {
						this.sectionIndex = null;
						this.emptySelectedComponents();
						if (this.emptyCellItemIndex.sectionIndex != -1) {
							for (
								let i: number = 0;
								this.layoutService.template.sections[this.emptyCellItemIndex.sectionIndex] &&
								i <
									this.layoutService.template.sections[this.emptyCellItemIndex.sectionIndex]
										.dashboard?.length;
								i++
							) {
								if (
									this.layoutService.template.sections[this.emptyCellItemIndex.sectionIndex]
										.dashboard[i].obj.emptyCell
								) {
									let tempLastI = this.layoutService.lastI;
									let tempLastK = this.layoutService.lastK;
									this.layoutService.lastI = this.emptyCellItemIndex.sectionIndex;
									this.layoutService.lastK = i;
									this.removeItem(
										this.layoutService.template.sections[this.emptyCellItemIndex.sectionIndex]
											.dashboard[i],
										'col',
										false,
										this.emptyCellItemIndex.sectionIndex,
										false,
									);
									i--;
									this.layoutService.lastI = tempLastI;
									this.layoutService.lastK = tempLastK;
								}
							}
						}
						this.emptyCellItem = {};
						this.emptyCellItemIndex = { sectionIndex: -1, dashboardIndex: -1 };
						if (
							this.layoutService.template.sections[index]['carrySections'] &&
							this.layoutService.template.sections[index]['carrySections']?.length &&
							!this.layoutService.template.sections[index]['isUpdated'] &&
							!rowMapper
						) {
							// this.coolDialogs
							// 	.confirm(
							// 		'This section is being carry forward in other templates. Deleting this section will break those links. Do you still wish to continue?',
							// 		{
							// 			okButtonText: 'OK',
							// 			cancelButtonText: 'Cancel',
							// 		},
							// 	)
							this.bsModalRef = this.modalServiceDialog.show(ConfirmationDialogComponent, {
								initialState: {
								  message: 'This section is being carry forward in other templates. Deleting this section will break those links. Do you still wish to continue?'
								},
								class: 'modal-dialog-centered'
							  });
							  this.bsModalRef.content.result
								.subscribe((response) => {
									if (response == true) {
										for (let id of this.layoutService.template.sections[index]['carrySections']) {
											if (this.templateSaved) {
												this.updateBackUpTask('type', `carryOriginalDeleted`);
												this.updateBackUpTask('id', this.layoutService.backupId);
												this.updateIndexes(-1, -1, -1, 'template');
												this.updateBackUpTask(
													'oldObject',
													this.layoutService.template.carryOriginalDeleted,
												);
												this.layoutService.template.carryOriginalDeleted.push(id);
												this.updateBackUpTask(
													'newObject',
													this.layoutService.template.carryOriginalDeleted,
												);
											}
										}
										if (
											this.layoutService.template.sections[index].carryForward &&
											this.layoutService.template.sections[index].carryForward.isCarryForward &&
											this.templateSaved
										) {
											this.updateBackUpTask('type', `carryNewDeleted`);
											this.updateBackUpTask('id', this.layoutService.backupId);
											this.updateIndexes(-1, -1, -1, 'template');
											this.updateBackUpTask(
												'oldObject',
												this.layoutService.template.carryNewDeleted,
											);
											this.layoutService.template.carryNewDeleted.push({
												section_id:
													this.layoutService.template.sections[index].carryForward.sectionId,
												linked_to:
													this.layoutService.template.sections[index].section_id ||
													this.layoutService.template.sections[index].id,
											});
											this.updateBackUpTask(
												'newObject',
												this.layoutService.template.carryNewDeleted,
											);
										}
										let currentDepth =
											this.layoutService.template.sections[index].secNo.split('.')?.length - 1;
										for (let z = index + 1; z < this.layoutService.template.sections?.length; z++) {
											let tempDepth =
												this.layoutService.template.sections[z].secNo.split('.')?.length - 1;
											if (tempDepth > currentDepth) {
												if (this.layoutService.template.sections[z]['carrySections']) {
													for (let id of this.layoutService.template.sections[z]['carrySections']) {
														if (this.templateSaved) {
															this.updateBackUpTask('type', `carryOriginalDeleted`);
															this.updateBackUpTask('id', this.layoutService.backupId);
															this.updateIndexes(-1, -1, -1, 'template');
															this.updateBackUpTask(
																'oldObject',
																this.layoutService.template.carryOriginalDeleted,
															);
															this.layoutService.template.carryOriginalDeleted.push(id);
															this.updateBackUpTask(
																'newObject',
																this.layoutService.template.carryOriginalDeleted,
															);
														}
													}
												}
												if (
													this.layoutService.template.sections[z].carryForward &&
													this.layoutService.template.sections[z].carryForward.isCarryForward &&
													this.templateSaved
												) {
													this.updateBackUpTask('type', `carryNewDeleted`);
													this.updateBackUpTask('id', this.layoutService.backupId);
													this.updateIndexes(-1, -1, -1, 'template');
													this.updateBackUpTask(
														'oldObject',
														this.layoutService.template.carryNewDeleted,
													);
													this.layoutService.template.carryNewDeleted.push({
														section_id:
															this.layoutService.template.sections[z].carryForward.sectionId,
														linked_to:
															this.layoutService.template.sections[z].section_id ||
															this.layoutService.template.sections[z].id,
													});
													this.updateBackUpTask(
														'newObject',
														this.layoutService.template.carryNewDeleted,
													);
												}
											} else {
												break;
											}
										}
										if (this.infoInstance.lastI == index) {
											this.infoInstance.check = false;
										}
										for (let uiComponent of this.layoutService.template.sections[index].dashboard) {
											if (uiComponent.obj.preDefinedObj) {
												for (let i: number = 0; i < this.PreDefinedList?.length; i++) {
													if (
														this.PreDefinedList[i].predefinedvalue ==
														uiComponent.obj.preDefinedObj.id
													) {
														this.PreDefinedList.splice(i, 1);
														i--;
													}
												}
											}
										}
										for (
											let i: number = 0;
											i < this.layoutService.template.sections[index].dashboard?.length;
											i++
										) {
											this.linkedUiRemove(index, i);
											let item = this.layoutService.template.sections[index].dashboard[i];
											if (item.obj['options']) {
												for (
													let j: number = 0;
													j < this.layoutService.template.sections?.length;
													j++
												) {
													for (let k: number = 0; k < item.obj.options?.length; k++) {
														if (item.obj.options[k].selectedLinkSection) {
															if (
																item.obj.options[k].selectedLinkSection.id ==
																this.layoutService.template.sections[j].id
															) {
																if (item.obj.options[k].selected) {
																	this.updateBackUpTask('type', `selected_linked_component`);
																	this.updateBackUpTask('id', this.layoutService.backupId);
																	this.updateIndexes(j, -1, -1, 'section');
																	this.updateBackUpTask(
																		'oldObject',
																		this.layoutService.template.sections[j][
																			`selected_linked_component`
																		],
																	);
																	this.layoutService.template.sections[j]
																		.selected_linked_component--;
																	this.updateBackUpTask(
																		'newObject',
																		this.layoutService.template.sections[j][
																			`selected_linked_component`
																		],
																	);
																}
																this.updateBackUpTask('type', `linked_component`);
																this.updateBackUpTask('id', this.layoutService.backupId);
																this.updateIndexes(j, -1, -1, 'section');
																this.updateBackUpTask(
																	'oldObject',
																	this.layoutService.template.sections[j][`linked_component`],
																);
																this.layoutService.template.sections[j].linked_component--;
																this.updateBackUpTask(
																	'newObject',
																	this.layoutService.template.sections[j][`linked_component`],
																);
																let currentDepth =
																	this.layoutService.template.sections[j].secNo.split('.')?.length -
																	1;
																for (
																	let z = j + 1;
																	z < this.layoutService.template.sections?.length;
																	z++
																) {
																	let tempDepth =
																		this.layoutService.template.sections[z].secNo.split('.')
																			?.length - 1;
																	if (tempDepth > currentDepth) {
																		if (item.obj.options[k].selected) {
																			this.updateBackUpTask('type', `selected_linked_component`);
																			this.updateBackUpTask('id', this.layoutService.backupId);
																			this.updateIndexes(z, -1, -1, 'section');
																			this.updateBackUpTask(
																				'oldObject',
																				this.layoutService.template.sections[z][
																					`selected_linked_component`
																				],
																			);
																			this.layoutService.template.sections[z]
																				.selected_linked_component--;
																			this.updateBackUpTask(
																				'newObject',
																				this.layoutService.template.sections[z][
																					`selected_linked_component`
																				],
																			);
																		}
																		this.updateBackUpTask('type', `linked_component`);
																		this.updateBackUpTask('id', this.layoutService.backupId);
																		this.updateIndexes(z, -1, -1, 'section');
																		this.updateBackUpTask(
																			'oldObject',
																			this.layoutService.template.sections[z][`linked_component`],
																		);
																		this.layoutService.template.sections[z].linked_component--;
																		this.updateBackUpTask(
																			'newObject',
																			this.layoutService.template.sections[z][`linked_component`],
																		);
																	} else {
																		j = z - 1;
																		break;
																	}
																}
															}
														}
													}
												}
												for (let ab: number = 0; ab < this.searchDataNames?.length; ab++) {
													if (this.searchDataNames[ab].objectid == item.id) {
														this.searchDataNames.splice(ab, 1);
														break;
													}
												}
												for (
													let x: number = 0;
													x < this.layoutService.template.sections?.length;
													x++
												) {
													for (
														let y: number = 0;
														y < this.layoutService.template.sections[x].dashboard?.length;
														y++
													) {
														if (
															!isNil(this.layoutService.template.sections[x].dashboard[y].obj
																.MultiSelectObj) &&
															this.layoutService.template.sections[x].dashboard[y].obj
																.MultiSelectObj.objectid == item.id
														) {
															this.updateBackUpTask('type', `options`);
															this.updateBackUpTask('id', this.layoutService.backupId);
															this.updateIndexes(x, y, -1, 'obj');
															this.updateBackUpTask(
																'oldObject',
																this.layoutService.template.sections[x].dashboard[y].obj.options,
															);
															this.layoutService.template.sections[x].dashboard[y].obj.options = [];
															this.updateBackUpTask(
																'newObject',
																this.layoutService.template.sections[x].dashboard[y].obj.options,
															);
															delete this.layoutService.template.sections[x].dashboard[y].obj
																.MultiSelectObj;
														}
													}
												}
											}
										}
										this.changeDetector.detectChanges();
										let valsections = this.showSections;
										this.removeCollapsePropertiesTab();
										this.setPropertiesTab('showTemplateProperties');
										this.setCollapsePropertiesTab('showTemplateProperties');
										this.changeDetector.detectChanges();
										let tempSubSection: number = 0;
										this.updateBackUpTask('type', `templateErrors`);
										this.updateBackUpTask('id', this.layoutService.backupId);
										this.updateIndexes(-1, -1, -1, 'template');
										this.updateBackUpTask('oldObject', this.layoutService.templateErrors);
										this.layoutService.templateErrors =
											this.layoutService.templateErrors -
											this.layoutService.template.sections[index].errors;
										this.updateBackUpTask('newObject', this.layoutService.templateErrors);
										tempSubSection += this.layoutService.template.sections[index].subsection;
										for (let i: number = 0; i < this.list?.length; i++) {
											this.list = cloneDeep(
												this.deleteSectionRecurse(this.list[i], deleteId, i, this.list),
											);
										}
										this.changeDetector.detectChanges();
										for (let i = index + 1; i < index + tempSubSection + 1; i++) {
											tempSubSection += this.layoutService.template.sections[i].subsection;
										}
										this.updateBackUpTask('type', `deleteSection`);
										this.updateBackUpTask('id', this.layoutService.backupId);
										this.updateIndexes(index, -1, -1, 'deleteSection');
										this.updateBackUpTask('oldObject', null);
										this.updateBackUpTask('newObject', this.layoutService.template.sections[index]);
										this.selectedLinkSectionsRemove(index);
										for (let i = index + 1; i < index + tempSubSection + 1; i++) {
											this.selectedLinkSectionsRemove(index + i);
											this.updateBackUpTask('type', `templateErrors`);
											this.updateBackUpTask('id', this.layoutService.backupId);
											this.updateIndexes(-1, -1, -1, 'template');
											this.updateBackUpTask('oldObject', this.layoutService.templateErrors);
											this.layoutService.templateErrors =
												this.layoutService.templateErrors -
												this.layoutService.template.sections[i].errors;
											this.updateBackUpTask('newObject', this.layoutService.templateErrors);
											this.updateBackUpTask('type', `deleteSection`);
											this.updateBackUpTask('id', this.layoutService.backupId);
											this.updateIndexes(i, -1, -1, 'deleteSection');
											this.updateBackUpTask('oldObject', null);
											this.updateBackUpTask('newObject', this.layoutService.template.sections[i]);
										}
										this.layoutService.template.sections.splice(index, tempSubSection + 1);
										this.calculateCalculationFields();
										this.sectionNumber--;
										if (valsections) {
											this.showSections = true;
										}
										this.changeDetector.markForCheck();
										if (this.layoutService.template.sections?.length == 0) {
											this.removeCollapsePropertiesTab();
											this.setPropertiesTab('showTemplateProperties');
											this.setCollapsePropertiesTab('showTemplateProperties');
										}
										this.resetSectionNumbers();
										this.GetHeightValue();
										this.layoutService.lastI = 0;
										this.layoutService.lastK = null;
										this.changeDetector.detectChanges();
									}
								});
						} else {
							if (!rowMapper) {
								if (
									this.layoutService.template.sections[index].carryForward &&
									this.layoutService.template.sections[index].carryForward.isCarryForward &&
									this.templateSaved
								) {
									this.layoutService.template.carryNewDeleted.push({
										section_id: this.layoutService.template.sections[index].carryForward.sectionId,
										linked_to:
											this.layoutService.template.sections[index].section_id ||
											this.layoutService.template.sections[index].id,
									});
								}
								let currentDepth =
									this.layoutService.template.sections[index].secNo.split('.')?.length - 1;
								for (let z = index + 1; z < this.layoutService.template.sections?.length; z++) {
									let tempDepth =
										this.layoutService.template.sections[z].secNo.split('.')?.length - 1;
									if (tempDepth > currentDepth) {
										if (
											this.layoutService.template.sections[z].carryForward &&
											this.layoutService.template.sections[z].carryForward.isCarryForward &&
											this.templateSaved
										) {
											this.layoutService.template.carryNewDeleted.push({
												section_id: this.layoutService.template.sections[z].carryForward.sectionId,
												linked_to:
													this.layoutService.template.sections[z].section_id ||
													this.layoutService.template.sections[z].id,
											});
										}
									} else {
										break;
									}
								}
								if (this.infoInstance.lastI == index) {
									this.infoInstance.check = false;
								}
								for (let uiComponent of this.layoutService.template.sections[index].dashboard) {
									if (uiComponent.obj.preDefinedObj) {
										for (let i: number = 0; i < this.PreDefinedList?.length; i++) {
											if (
												this.PreDefinedList[i].predefinedvalue == uiComponent.obj.preDefinedObj.id
											) {
												this.PreDefinedList.splice(i, 1);
												i--;
											}
										}
									}
								}
							}
							for (
								let i: number = 0;
								i < this.layoutService.template.sections[index].dashboard?.length;
								i++
							) {
								this.linkedUiRemove(index, i);
								let item = this.layoutService.template.sections[index].dashboard[i];
								if (item.obj['options']) {
									for (let j: number = 0; j < this.layoutService.template.sections?.length; j++) {
										for (let k: number = 0; k < item.obj.options?.length; k++) {
											if (item.obj.options[k].selectedLinkSection) {
												if (
													item.obj.options[k].selectedLinkSection.id ==
													this.layoutService.template.sections[j].id
												) {
													if (item.obj.options[k].selected) {
														this.updateBackUpTask('type', `selected_linked_component`);
														this.updateBackUpTask('id', this.layoutService.backupId);
														this.updateIndexes(j, -1, -1, 'section');
														this.updateBackUpTask(
															'oldObject',
															this.layoutService.template.sections[j][`selected_linked_component`],
														);
														this.layoutService.template.sections[j].selected_linked_component--;
														this.updateBackUpTask(
															'newObject',
															this.layoutService.template.sections[j][`selected_linked_component`],
														);
													}
													this.updateBackUpTask('type', `linked_component`);
													this.updateBackUpTask('id', this.layoutService.backupId);
													this.updateIndexes(j, -1, -1, 'section');
													this.updateBackUpTask(
														'oldObject',
														this.layoutService.template.sections[j][`linked_component`],
													);
													this.layoutService.template.sections[j].linked_component--;
													this.updateBackUpTask(
														'newObject',
														this.layoutService.template.sections[j][`linked_component`],
													);
													let currentDepth =
														this.layoutService.template.sections[j].secNo.split('.')?.length - 1;
													for (
														let z = j + 1;
														z < this.layoutService.template.sections?.length;
														z++
													) {
														let tempDepth =
															this.layoutService.template.sections[z].secNo.split('.')?.length - 1;
														if (tempDepth > currentDepth) {
															if (item.obj.options[k].selected) {
																this.updateBackUpTask('type', `selected_linked_component`);
																this.updateBackUpTask('id', this.layoutService.backupId);
																this.updateIndexes(z, -1, -1, 'section');
																this.updateBackUpTask(
																	'oldObject',
																	this.layoutService.template.sections[z][
																		`selected_linked_component`
																	],
																);
																this.layoutService.template.sections[z].selected_linked_component--;
																this.updateBackUpTask(
																	'newObject',
																	this.layoutService.template.sections[z][
																		`selected_linked_component`
																	],
																);
															}
															this.updateBackUpTask('type', `linked_component`);
															this.updateBackUpTask('id', this.layoutService.backupId);
															this.updateIndexes(z, -1, -1, 'section');
															this.updateBackUpTask(
																'oldObject',
																this.layoutService.template.sections[z][`linked_component`],
															);
															this.layoutService.template.sections[z].linked_component--;
															this.updateBackUpTask(
																'newObject',
																this.layoutService.template.sections[z][`linked_component`],
															);
														} else {
															j = z - 1;
															break;
														}
													}
												}
											}
										}
									}
									for (let ab: number = 0; ab < this.searchDataNames?.length; ab++) {
										if (this.searchDataNames[ab].objectid == item.id) {
											this.searchDataNames.splice(ab, 1);
											break;
										}
									}
									for (let x: number = 0; x < this.layoutService.template.sections?.length; x++) {
										for (
											let y: number = 0;
											y < this.layoutService.template.sections[x].dashboard?.length;
											y++
										) {
											if (
												!isNil(this.layoutService.template.sections[x].dashboard[y].obj.MultiSelectObj) &&
												this.layoutService.template.sections[x].dashboard[y].obj.MultiSelectObj
													.objectid == item.id
											) {
												this.layoutService.template.sections[x].dashboard[y].obj.options = [];
												delete this.layoutService.template.sections[x].dashboard[y].obj
													.MultiSelectObj;
											}
										}
									}
								}
							}
							this.removeCollapsePropertiesTab();
							this.changeDetector.detectChanges();
							let valsections = this.showSections;
							this.removeCollapsePropertiesTab();
							this.setPropertiesTab('showTemplateProperties');
							this.setCollapsePropertiesTab('showTemplateProperties');
							this.changeDetector.detectChanges();
							let tempSubSection: number = 0;
							this.updateBackUpTask('type', `templateErrors`);
							this.updateBackUpTask('id', this.layoutService.backupId);
							this.updateIndexes(-1, -1, -1, 'template');
							this.updateBackUpTask('oldObject', this.layoutService.templateErrors);
							this.layoutService.templateErrors =
								this.layoutService.templateErrors -
								this.layoutService.template.sections[index].errors;
							this.updateBackUpTask('newObject', this.layoutService.templateErrors);
							tempSubSection += this.layoutService.template.sections[index].subsection;
							for (let i: number = 0; i < this.list?.length; i++) {
								this.list = cloneDeep(
									this.deleteSectionRecurse(this.list[i], deleteId, i, this.list),
								);
							}
							this.changeDetector.detectChanges();
							for (let i = index + 1; i < index + tempSubSection + 1; i++) {
								tempSubSection += this.layoutService.template.sections[i].subsection;
							}
							this.updateBackUpTask('type', `deleteSection`);
							this.updateBackUpTask('id', this.layoutService.backupId);
							this.updateIndexes(index, -1, -1, 'deleteSection');
							this.updateBackUpTask('oldObject', null);
							this.updateBackUpTask('newObject', this.layoutService.template.sections[index]);
							this.selectedLinkSectionsRemove(index);
							for (let i = index + 1; i < index + tempSubSection + 1; i++) {
								this.selectedLinkSectionsRemove(i);
								this.updateBackUpTask('type', `templateErrors`);
								this.updateBackUpTask('id', this.layoutService.backupId);
								this.updateIndexes(-1, -1, -1, 'template');
								this.updateBackUpTask('oldObject', this.layoutService.templateErrors);
								this.layoutService.templateErrors =
									this.layoutService.templateErrors -
									this.layoutService.template.sections[i].errors;
								this.updateBackUpTask('newObject', this.layoutService.templateErrors);
								this.updateBackUpTask('type', `deleteSection`);
								this.updateBackUpTask('id', this.layoutService.backupId);
								this.updateIndexes(i, -1, -1, 'deleteSection');
								this.updateBackUpTask('oldObject', null);
								this.updateBackUpTask('newObject', this.layoutService.template.sections[i]);
							}
							this.layoutService.template.sections.splice(index, tempSubSection + 1);
							this.calculateCalculationFields();
							this.sectionNumber--;
							if (valsections) {
								this.showSections = true;
							}
							this.changeDetector.markForCheck();
							if (this.layoutService.template.sections?.length == 0) {
								this.removeCollapsePropertiesTab();
								this.setPropertiesTab('showTemplateProperties');
								this.setCollapsePropertiesTab('showTemplateProperties');
							}
							this.resetSectionNumbers();
							this.GetHeightValue();
							this.layoutService.lastI = 0;
							this.layoutService.lastK = null;
							this.changeDetector.detectChanges();
						}
					}
				});
		} else {
			this.sectionIndex = null;
			this.emptySelectedComponents();
			if (this.emptyCellItemIndex.sectionIndex != -1) {
				for (
					let i: number = 0;
					this.layoutService.template.sections[this.emptyCellItemIndex.sectionIndex] &&
					i <
						this.layoutService.template.sections[this.emptyCellItemIndex.sectionIndex].dashboard
							?.length;
					i++
				) {
					if (
						this.layoutService.template.sections[this.emptyCellItemIndex.sectionIndex].dashboard[i]
							.obj.emptyCell
					) {
						let tempLastI = this.layoutService.lastI;
						let tempLastK = this.layoutService.lastK;
						this.layoutService.lastI = this.emptyCellItemIndex.sectionIndex;
						this.layoutService.lastK = i;
						this.removeItem(
							this.layoutService.template.sections[this.emptyCellItemIndex.sectionIndex].dashboard[
								i
							],
							'col',
							false,
							this.emptyCellItemIndex.sectionIndex,
							false,
						);
						i--;
						this.layoutService.lastI = tempLastI;
						this.layoutService.lastK = tempLastK;
					}
				}
			}
			this.emptyCellItem = {};
			this.emptyCellItemIndex = { sectionIndex: -1, dashboardIndex: -1 };
			if (
				this.layoutService.template.sections[index]['carrySections'] &&
				this.layoutService.template.sections[index]['carrySections']?.length &&
				!this.layoutService.template.sections[index]['isUpdated'] &&
				!rowMapper
			) {
				// this.coolDialogs
				// 	.confirm(
				// 		'This section is being carry forward in other templates. Deleting this section will break those links. Do you still wish to continue?',
				// 		{
				// 			okButtonText: 'OK',
				// 			cancelButtonText: 'Cancel',
				// 		},
				// 	)
				this.bsModalRef = this.modalServiceDialog.show(ConfirmationDialogComponent, {
					initialState: {
					  message: 'This section is being carry forward in other templates. Deleting this section will break those links. Do you still wish to continue?'
					},
					class: 'modal-dialog-centered'
				  });
				  this.bsModalRef.content.result
					.subscribe((response) => {
						if (response == true) {
							for (let id of this.layoutService.template.sections[index]['carrySections']) {
								if (this.templateSaved) {
									this.layoutService.template.carryOriginalDeleted.push(id);
								}
							}
							if (
								this.layoutService.template.sections[index].carryForward &&
								this.layoutService.template.sections[index].carryForward.isCarryForward &&
								this.templateSaved
							) {
								this.layoutService.template.carryNewDeleted.push({
									section_id: this.layoutService.template.sections[index].carryForward.sectionId,
									linked_to:
										this.layoutService.template.sections[index].section_id ||
										this.layoutService.template.sections[index].id,
								});
							}
							let currentDepth =
								this.layoutService.template.sections[index].secNo.split('.')?.length - 1;
							for (let z = index + 1; z < this.layoutService.template.sections?.length; z++) {
								let tempDepth = this.layoutService.template.sections[z].secNo.split('.')?.length - 1;
								if (tempDepth > currentDepth) {
									if (this.layoutService.template.sections[z]['carrySections']) {
										for (let id of this.layoutService.template.sections[z]['carrySections']) {
											if (this.templateSaved) {
												this.layoutService.template.carryOriginalDeleted.push(id);
											}
										}
									}
									if (
										this.layoutService.template.sections[z].carryForward &&
										this.layoutService.template.sections[z].carryForward.isCarryForward &&
										this.templateSaved
									) {
										this.layoutService.template.carryNewDeleted.push({
											section_id: this.layoutService.template.sections[z].carryForward.sectionId,
											linked_to:
												this.layoutService.template.sections[z].section_id ||
												this.layoutService.template.sections[z].id,
										});
									}
								} else {
									break;
								}
							}
							if (this.infoInstance.lastI == index) {
								this.infoInstance.check = false;
							}
							for (let uiComponent of this.layoutService.template.sections[index].dashboard) {
								if (uiComponent.obj.preDefinedObj) {
									for (let i: number = 0; i < this.PreDefinedList?.length; i++) {
										if (
											this.PreDefinedList[i].predefinedvalue == uiComponent.obj.preDefinedObj.id
										) {
											this.PreDefinedList.splice(i, 1);
											i--;
										}
									}
								}
							}
							for (
								let i: number = 0;
								i < this.layoutService.template.sections[index].dashboard?.length;
								i++
							) {
								this.linkedUiRemove(index, i);
								let item = this.layoutService.template.sections[index].dashboard[i];
								if (item.obj['options']) {
									for (let j: number = 0; j < this.layoutService.template.sections?.length; j++) {
										for (let k: number = 0; k < item.obj.options?.length; k++) {
											if (item.obj.options[k].selectedLinkSection) {
												if (
													item.obj.options[k].selectedLinkSection.id ==
													this.layoutService.template.sections[j].id
												) {
													if (item.obj.options[k].selected) {
														this.updateBackUpTask('type', `selected_linked_component`);
														this.updateBackUpTask('id', this.layoutService.backupId);
														this.updateIndexes(j, -1, -1, 'section');
														this.updateBackUpTask(
															'oldObject',
															this.layoutService.template.sections[j][`selected_linked_component`],
														);
														this.layoutService.template.sections[j].selected_linked_component--;
														this.updateBackUpTask(
															'newObject',
															this.layoutService.template.sections[j][`selected_linked_component`],
														);
													}
													this.updateBackUpTask('type', `linked_component`);
													this.updateBackUpTask('id', this.layoutService.backupId);
													this.updateIndexes(j, -1, -1, 'section');
													this.updateBackUpTask(
														'oldObject',
														this.layoutService.template.sections[j][`linked_component`],
													);
													this.layoutService.template.sections[j].linked_component--;
													this.updateBackUpTask(
														'newObject',
														this.layoutService.template.sections[j][`linked_component`],
													);
													this.layoutService.template.sections[j].linked_component--;
													let currentDepth =
														this.layoutService.template.sections[j].secNo.split('.')?.length - 1;
													for (
														let z = j + 1;
														z < this.layoutService.template.sections?.length;
														z++
													) {
														let tempDepth =
															this.layoutService.template.sections[z].secNo.split('.')?.length - 1;
														if (tempDepth > currentDepth) {
															if (item.obj.options[k].selected) {
																this.updateBackUpTask('type', `selected_linked_component`);
																this.updateBackUpTask('id', this.layoutService.backupId);
																this.updateIndexes(z, -1, -1, 'section');
																this.updateBackUpTask(
																	'oldObject',
																	this.layoutService.template.sections[z][
																		`selected_linked_component`
																	],
																);
																this.layoutService.template.sections[z].selected_linked_component--;
																this.updateBackUpTask(
																	'newObject',
																	this.layoutService.template.sections[z][
																		`selected_linked_component`
																	],
																);
															}
															this.updateBackUpTask('type', `linked_component`);
															this.updateBackUpTask('id', this.layoutService.backupId);
															this.updateIndexes(z, -1, -1, 'section');
															this.updateBackUpTask(
																'oldObject',
																this.layoutService.template.sections[z][`linked_component`],
															);
															this.layoutService.template.sections[z].linked_component--;
															this.updateBackUpTask(
																'newObject',
																this.layoutService.template.sections[z][`linked_component`],
															);
														} else {
															j = z - 1;
															break;
														}
													}
												}
											}
										}
									}
									for (let ab: number = 0; ab < this.searchDataNames?.length; ab++) {
										if (this.searchDataNames[ab].objectid == item.id) {
											this.searchDataNames.splice(ab, 1);
											break;
										}
									}
									for (let x: number = 0; x < this.layoutService.template.sections?.length; x++) {
										for (
											let y: number = 0;
											y < this.layoutService.template.sections[x].dashboard?.length;
											y++
										) {
											if (
												!isNil(this.layoutService.template.sections[x].dashboard[y].obj.MultiSelectObj) &&
												this.layoutService.template.sections[x].dashboard[y].obj.MultiSelectObj
													.objectid == item.id
											) {
												this.layoutService.template.sections[x].dashboard[y].obj.options = [];
												delete this.layoutService.template.sections[x].dashboard[y].obj
													.MultiSelectObj;
											}
										}
									}
								}
							}
							this.removeCollapsePropertiesTab();
							this.changeDetector.detectChanges();
							let valsections = this.showSections;
							this.setPropertiesTab('showTemplateProperties');
							this.setCollapsePropertiesTab('showTemplateProperties');
							this.changeDetector.detectChanges();
							let tempSubSection: number = 0;
							this.updateBackUpTask('type', `templateErrors`);
							this.updateBackUpTask('id', this.layoutService.backupId);
							this.updateIndexes(-1, -1, -1, 'template');
							this.updateBackUpTask('oldObject', this.layoutService.templateErrors);
							this.layoutService.templateErrors =
								this.layoutService.templateErrors -
								this.layoutService.template.sections[index].errors;
							this.updateBackUpTask('newObject', this.layoutService.templateErrors);
							tempSubSection += this.layoutService.template.sections[index].subsection;
							for (let i: number = 0; i < this.list?.length; i++) {
								this.list = cloneDeep(
									this.deleteSectionRecurse(this.list[i], deleteId, i, this.list),
								);
							}
							this.changeDetector.detectChanges();
							for (let i = index + 1; i < index + tempSubSection + 1; i++) {
								tempSubSection += this.layoutService.template.sections[i].subsection;
							}
							this.updateBackUpTask('type', `deleteSection`);
							this.updateBackUpTask('id', this.layoutService.backupId);
							this.updateIndexes(index, -1, -1, 'deleteSection');
							this.updateBackUpTask('oldObject', null);
							this.updateBackUpTask('newObject', this.layoutService.template.sections[index]);
							this.selectedLinkSectionsRemove(index);
							for (let i = index + 1; i < index + tempSubSection + 1; i++) {
								this.selectedLinkSectionsRemove(index + i);
								this.updateBackUpTask('type', `templateErrors`);
								this.updateBackUpTask('id', this.layoutService.backupId);
								this.updateIndexes(-1, -1, -1, 'template');
								this.updateBackUpTask('oldObject', this.layoutService.templateErrors);
								this.layoutService.templateErrors =
									this.layoutService.templateErrors -
									this.layoutService.template.sections[i].errors;
								this.updateBackUpTask('newObject', this.layoutService.templateErrors);
								this.updateBackUpTask('type', `deleteSection`);
								this.updateBackUpTask('id', this.layoutService.backupId);
								this.updateIndexes(i, -1, -1, 'deleteSection');
								this.updateBackUpTask('oldObject', null);
								this.updateBackUpTask('newObject', this.layoutService.template.sections[i]);
							}
							this.layoutService.template.sections.splice(index, tempSubSection + 1);
							this.calculateCalculationFields();
							this.sectionNumber--;
							if (valsections) {
								this.showSections = true;
							}
							this.changeDetector.markForCheck();
							if (this.layoutService.template.sections?.length == 0) {
								this.removeCollapsePropertiesTab();
								this.setPropertiesTab('showTemplateProperties');
								this.setCollapsePropertiesTab('showTemplateProperties');
							}
							this.resetSectionNumbers();
							this.GetHeightValue();
							this.layoutService.lastI = 0;
							this.layoutService.lastK = null;
							this.changeDetector.detectChanges();
						}
					});
			} else {
				if (!rowMapper) {
					if (
						this.layoutService.template.sections[index].carryForward &&
						this.layoutService.template.sections[index].carryForward.isCarryForward &&
						this.templateSaved
					) {
						this.layoutService.template.carryNewDeleted.push({
							section_id: this.layoutService.template.sections[index].carryForward.sectionId,
							linked_to:
								this.layoutService.template.sections[index].section_id ||
								this.layoutService.template.sections[index].id,
						});
					}
					let currentDepth =
						this.layoutService.template.sections[index].secNo.split('.')?.length - 1;
					for (let z = index + 1; z < this.layoutService.template.sections?.length; z++) {
						let tempDepth = this.layoutService.template.sections[z].secNo.split('.')?.length - 1;
						if (tempDepth > currentDepth) {
							if (
								this.layoutService.template.sections[z].carryForward &&
								this.layoutService.template.sections[z].carryForward.isCarryForward &&
								this.templateSaved
							) {
								this.layoutService.template.carryNewDeleted.push({
									section_id: this.layoutService.template.sections[z].carryForward.sectionId,
									linked_to:
										this.layoutService.template.sections[z].section_id ||
										this.layoutService.template.sections[z].id,
								});
							}
						} else {
							break;
						}
					}
					if (this.infoInstance.lastI == index) {
						this.infoInstance.check = false;
					}
					for (let uiComponent of this.layoutService.template.sections[index].dashboard) {
						if (uiComponent.obj.preDefinedObj) {
							for (let i: number = 0; i < this.PreDefinedList?.length; i++) {
								if (this.PreDefinedList[i].predefinedvalue == uiComponent.obj.preDefinedObj.id) {
									this.PreDefinedList.splice(i, 1);
									i--;
								}
							}
						}
					}
				}
				for (
					let i: number = 0;
					i < this.layoutService.template.sections[index].dashboard?.length;
					i++
				) {
					this.linkedUiRemove(index, i);
					let item = this.layoutService.template.sections[index].dashboard[i];
					if (item.obj['options']) {
						for (let j: number = 0; j < this.layoutService.template.sections?.length; j++) {
							for (let k: number = 0; k < item.obj.options?.length; k++) {
								if (item.obj.options[k].selectedLinkSection) {
									if (
										item.obj.options[k].selectedLinkSection.id ==
										this.layoutService.template.sections[j].id
									) {
										if (item.obj.options[k].selected) {
											this.updateBackUpTask('type', `selected_linked_component`);
											this.updateBackUpTask('id', this.layoutService.backupId);
											this.updateIndexes(j, -1, -1, 'section');
											this.updateBackUpTask(
												'oldObject',
												this.layoutService.template.sections[j][`selected_linked_component`],
											);
											this.layoutService.template.sections[j].selected_linked_component--;
											this.updateBackUpTask(
												'newObject',
												this.layoutService.template.sections[j][`selected_linked_component`],
											);
										}
										this.updateBackUpTask('type', `linked_component`);
										this.updateBackUpTask('id', this.layoutService.backupId);
										this.updateIndexes(j, -1, -1, 'section');
										this.updateBackUpTask(
											'oldObject',
											this.layoutService.template.sections[j][`linked_component`],
										);
										this.layoutService.template.sections[j].linked_component--;
										this.updateBackUpTask(
											'newObject',
											this.layoutService.template.sections[j][`linked_component`],
										);
										this.layoutService.template.sections[j].linked_component--;
										let currentDepth =
											this.layoutService.template.sections[j].secNo.split('.')?.length - 1;
										for (let z = j + 1; z < this.layoutService.template.sections?.length; z++) {
											let tempDepth =
												this.layoutService.template.sections[z].secNo.split('.')?.length - 1;
											if (tempDepth > currentDepth) {
												if (item.obj.options[k].selected) {
													this.updateBackUpTask('type', `selected_linked_component`);
													this.updateBackUpTask('id', this.layoutService.backupId);
													this.updateIndexes(z, -1, -1, 'section');
													this.updateBackUpTask(
														'oldObject',
														this.layoutService.template.sections[z][`selected_linked_component`],
													);
													this.layoutService.template.sections[z].selected_linked_component--;
													this.updateBackUpTask(
														'newObject',
														this.layoutService.template.sections[z][`selected_linked_component`],
													);
												}
												this.updateBackUpTask('type', `linked_component`);
												this.updateBackUpTask('id', this.layoutService.backupId);
												this.updateIndexes(z, -1, -1, 'section');
												this.updateBackUpTask(
													'oldObject',
													this.layoutService.template.sections[z][`linked_component`],
												);
												this.layoutService.template.sections[z].linked_component--;
												this.updateBackUpTask(
													'newObject',
													this.layoutService.template.sections[z][`linked_component`],
												);
											} else {
												j = z - 1;
												break;
											}
										}
									}
								}
							}
						}
						for (let ab: number = 0; ab < this.searchDataNames?.length; ab++) {
							if (this.searchDataNames[ab].objectid == item.id) {
								this.searchDataNames.splice(ab, 1);
								break;
							}
						}
						for (let x: number = 0; x < this.layoutService.template.sections?.length; x++) {
							for (
								let y: number = 0;
								y < this.layoutService.template.sections[x].dashboard?.length;
								y++
							) {
								if (
									!isNil(this.layoutService.template.sections[x].dashboard[y].obj.MultiSelectObj) &&
									this.layoutService.template.sections[x].dashboard[y].obj.MultiSelectObj
										.objectid == item.id
								) {
									this.layoutService.template.sections[x].dashboard[y].obj.options = [];
									delete this.layoutService.template.sections[x].dashboard[y].obj.MultiSelectObj;
								}
							}
						}
					}
				}
				this.removeCollapsePropertiesTab();
				this.changeDetector.detectChanges();
				let valsections = this.showSections;
				this.setPropertiesTab('showTemplateProperties');
				this.setCollapsePropertiesTab('showTemplateProperties');
				this.changeDetector.detectChanges();
				let tempSubSection: number = 0;
				this.updateBackUpTask('type', `templateErrors`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(-1, -1, -1, 'template');
				this.updateBackUpTask('oldObject', this.layoutService.templateErrors);
				this.layoutService.templateErrors =
					this.layoutService.templateErrors - this.layoutService.template.sections[index].errors;
				this.updateBackUpTask('newObject', this.layoutService.templateErrors);
				tempSubSection += this.layoutService.template.sections[index].subsection;
				for (let i: number = 0; i < this.list?.length; i++) {
					this.list = cloneDeep(this.deleteSectionRecurse(this.list[i], deleteId, i, this.list));
				}
				this.changeDetector.detectChanges();
				for (let i = index + 1; i < index + tempSubSection + 1; i++) {
					tempSubSection += this.layoutService.template.sections[i].subsection;
				}
				this.updateBackUpTask('type', `deleteSection`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(index, -1, -1, 'deleteSection');
				this.updateBackUpTask('oldObject', null);
				this.updateBackUpTask('newObject', this.layoutService.template.sections[index]);
				this.selectedLinkSectionsRemove(index);
				for (let i = index + 1; i < index + tempSubSection + 1; i++) {
					this.selectedLinkSectionsRemove(index + i);
					this.updateBackUpTask('type', `templateErrors`);
					this.updateBackUpTask('id', this.layoutService.backupId);
					this.updateIndexes(-1, -1, -1, 'template');
					this.updateBackUpTask('oldObject', this.layoutService.templateErrors);
					this.layoutService.templateErrors =
						this.layoutService.templateErrors - this.layoutService.template.sections[i].errors;
					this.updateBackUpTask('newObject', this.layoutService.templateErrors);
					this.updateBackUpTask('type', `deleteSection`);
					this.updateBackUpTask('id', this.layoutService.backupId);
					this.updateIndexes(i, -1, -1, 'deleteSection');
					this.updateBackUpTask('oldObject', null);
					this.updateBackUpTask('newObject', this.layoutService.template.sections[i]);
				}
				this.layoutService.template.sections.splice(index, tempSubSection + 1);
				this.calculateCalculationFields();
				this.sectionNumber--;
				if (valsections) {
					this.showSections = true;
				}
				this.changeDetector.markForCheck();
				if (this.layoutService.template.sections?.length == 0) {
					this.removeCollapsePropertiesTab();
					this.setPropertiesTab('showTemplateProperties');
					this.setCollapsePropertiesTab('showTemplateProperties');
				}
				this.resetSectionNumbers();
				this.GetHeightValue();
				this.layoutService.lastI = 0;
				this.layoutService.lastK = null;
				this.changeDetector.detectChanges();
			}
		}
		this.layoutService.backupId++;
	}
	updateCFSection(index, id) {
		// this.coolDialogs
		// 	.confirm(
		// 		'Original section has been updated. Do you want to update the changes in this section too? ',
		// 		{
		// 			okButtonText: 'OK',
		// 			cancelButtonText: 'Cancel',
		// 		},
		// 	)
		this.bsModalRef = this.modalServiceDialog.show(ConfirmationDialogComponent, {
			initialState: {
			  message: 'Original section has been updated. Do you want to update the changes in this section too?'
			},
			class: 'modal-dialog-centered'
		  });
		  this.bsModalRef.content.result
			.subscribe(async (response) => {
				if (response == true) {
					const obj = {
						section_id: parseInt(
							this.layoutService.template.sections[index].carryForward.sectionId,
						),
					};
					this.layoutService.template.sections[index].dashboard = [];
					this.requestService
						.sendRequest(
							TemaplateManagerUrlsEnum.getCarryforwardSection,
							'POST',
							REQUEST_SERVERS.templateManagerUrl,
							obj,
						)
						.subscribe(
							(res: any) => {
								const data = res.data.dashboard;
								let allIds: any = [];
								let minIdAssigned = 1;
								for (let i: number = 0; i < data?.length; i++) {
									data[i].obj['carry_uicomponent_name'] = data[i].obj.uicomponent_name;
									delete data[i].id;
									data[i]['id'] = UUID();
									this.setTemplateProperty('uiCompIds', this.getNextUICompId(minIdAssigned), false);
									minIdAssigned = this.layoutService.template.uiCompIds;
									allIds.push({
										oldId: data[i].obj.uicomponent_name,
										newId: JSON.stringify(this.layoutService.template.uiCompIds),
									});
									data[i].obj.uicomponent_name = JSON.stringify(
										this.layoutService.template.uiCompIds,
									);
									delete data[i].uicomponent_id;
									if (this.uicomponentTypes.INPUT in data[i].obj) {
										data[i].obj.input = '';
									}
									if (data[i].obj.MultiSelectObj) {
										delete data[i].obj.MultiSelectObj;
										data[i].obj.manualoptions = true;
										data[i].obj.multilinked = false;
										data[i].obj.options = [];
										data[i].obj.answers = [];
									}
									if (data[i].obj.answers) {
										data[i].obj.answers = [];
									}
									this.componentsService.push({
										id: data[i].id,
										componentRef: data[i].obj.type,
									});
								}
								for (let x: number = 0; x < data?.length; x++) {
									if (data[x].obj.statement) {
										let tempStatement: any = '';
										tempStatement = data[x].obj.statement;
										if (data[x].obj.type == this.uicomponentTypes.TEXT) {
											let statementArray = tempStatement.match(/@[0-9]+/g);
											if (statementArray) {
												for (let arrayItem of statementArray) {
													if (arrayItem[0] == '@') {
														arrayItem = arrayItem.replace('@', '');
														for (let k: number = 0; k < allIds?.length; k++) {
															if (arrayItem == allIds[k].oldId) {
																tempStatement = tempStatement.replace(
																	'@' + arrayItem,
																	'@changingThisId' + allIds[k].newId,
																);
															}
														}
													}
												}
											}
											tempStatement = tempStatement.replace(/@changingThisId/g, '@');
											data[x].obj.statement = tempStatement;
											data[x].obj.instanceStatement = tempStatement;
										}
									}
								}
								if (typeof res.data.options === 'string') {
									res.data.options = JSON.parse(res.data.options);
								}
								this.layoutService.template.sections[index].options = res.data.options;
								this.layoutService.template.sections[index].theme = res.data.theme;
								this.layoutService.template.sections[index].sectionBorders =
									res.data.sectionBorders;
								this.layoutService.template.sections[index].completeBorder =
									res.data.completeBorder;
								this.layoutService.template.sections[index].leftSectionBorder =
									res.data.leftSectionBorder;
								this.layoutService.template.sections[index].topSectionPadding =
									res.data.topSectionPadding;
								this.layoutService.template.sections[index].rightSectionBorder =
									res.data.rightSectionBorder;
								this.layoutService.template.sections[index].topSectionBorder =
									res.data.topSectionBorder;
								this.layoutService.template.sections[index].bottomSectionBorder =
									res.data.bottomSectionBorder;
								this.layoutService.template.sections[index].uiBorders = res.data.uiBorders;
								this.layoutService.template.sections[index].leftUIBorder = res.data.leftUIBorder;
								this.layoutService.template.sections[index].rightUIBorder = res.data.rightUIBorder;
								this.layoutService.template.sections[index].bottomUIBorder =
									res.data.bottomUIBorder;
								this.layoutService.template.sections[index].topUIBorder = res.data.topUIBorder;
								this.layoutService.template.sections[index].uiPaddings = res.data.uiPaddings;
								this.layoutService.template.sections[index].leftUIPadding = res.data.leftUIPadding;
								this.layoutService.template.sections[index].rightUIPadding =
									res.data.rightUIPadding;
								this.layoutService.template.sections[index].topUIPadding = res.data.topUIPadding;
								this.layoutService.template.sections[index].bottomUIPadding =
									res.data.bottomUIPadding;
								this.layoutService.template.sections[index].bgColor = res.data.bgColor;
								this.layoutService.template.sections[index].backgroundColor =
									res.data.backgroundColor;
								this.layoutService.template.sections[index].fontColor = res.data.fontColor;
								this.layoutService.template.sections[index].fontColorCode = res.data.fontColorCode;
								this.layoutService.template.sections[index].fontFamily = res.data.fontFamily;
								this.layoutService.template.sections[index].fontFamilyValue =
									res.data.fontFamilyValue;
								this.layoutService.template.sections[index].lineSpacing = res.data.lineSpacing;
								this.layoutService.template.sections[index].lineSpacingValue =
									res.data.lineSpacingValue;
								this.layoutService.template.sections[index].is_table = res.data.is_table;
								this.layoutService.template.sections[index].printNewPage = res.data.printNewPage;
								this.layoutService.template.sections[index].errors = res.data.errors;
								this.layoutService.template.sections[index].mapper = res.data.mapper;
								this.layoutService.template.sections[index].dashboard = res.data.dashboard;
								this.layoutService.template.sections[index].section_title = res.data.section_title;
								this.layoutService.template.sections[index].boundSectionStatement =
									res.data.boundSectionStatement;
								this.layoutService.template.sections[index].dashboard = data;
								this.layoutService.template.sections[index].carryForward.originalUpdated = false;
								this.changeDetector.detectChanges();
							},
							(err) => {
								console.log(err);
								this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
								this.stopLoader();
							},
						);
				}
			});
	}
	resetSectionNumbers() {
		let secNo = 1;
		for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
			if (this.layoutService.template.sections[i].parentId === 0) {
				this.layoutService.template.sections[i].secNo = secNo++;
				this.layoutService.template.sections[i].secNo = JSON.stringify(
					this.layoutService.template.sections[i].secNo,
				);
			} else {
				const parentIndex = this.layoutService.template.sections.findIndex((element) => {
					return element.id === this.layoutService.template.sections[i].parentId;
				});
				this.layoutService.template.sections[i].secNo =
					this.layoutService.template.sections[parentIndex].secNo +
					'.' +
					(this.layoutService.template.sections[parentIndex].subsection + 1);
				this.layoutService.template.sections[parentIndex].subsection++;
			}
			this.layoutService.template.sections[i].subsection = 0;
		}
		this.sectionToList();
		this.list = [...this.list];
	}
	recurseAdd(ListObj, id, obj) {
		if (ListObj.id === id) {
			ListObj.children.push({ id: this.totalSection, children: [], obj });
			return;
		} else if (ListObj.children?.length === 0) {
			return;
		} else {
			for (let i = 0; i < ListObj.children?.length; i++) {
				this.recurseAdd(ListObj.children[i], id, obj);
			}
		}
	}
	getIndex(listItem, matchId, indexObject) {
		indexObject.index++;
		if (listItem.id === matchId) {
			indexObject.check = true;
			return indexObject;
		} else {
			for (let i: number = 0; i < listItem.children?.length; i++) {
				indexObject = this.getIndex(listItem.children[i], matchId, indexObject);
				if (indexObject.check) {
					break;
				}
			}
			return indexObject;
		}
	}
	addSubSection(id, parentId, index, pasteCheck) {
		this.layoutService.lastI = null;
		this.layoutService.lastK = null;
		if (pasteCheck) {
			this.layoutService.collapseSectionIndex[`${this.totalSection}`] = false;
		} else {
			this.layoutService.collapseSectionIndex[`${this.totalSection}`] = true;
		}
		const obj = {
			id: this.totalSection,
			secNo:
				this.layoutService.template.sections[index].secNo +
				'.' +
				(this.layoutService.template.sections[index].subsection + 1),
			section_title: 'Section ',
			boundSectionStatement: 'Section ',
			subsection: 0,
			is_table: false,
			isSubSection: true,
			isSelected: true,
			parentId: id,
			section_type: this.layoutService.NormalSectionTypeId,
			tags: [],
			mapper: [1],
			defaultColumn: false,
			isFilled: false,
			requiredFilled: false,
			options: {
				gridType: GridType.VerticalFixed,
				displayGrid: DisplayGrid.Always,
				setGridSize: true,
				pushItems: true,
				fixedRowHeight: 100,
				fixedColWidth: 750 / this.layoutService.template.default_columns,
				disableScrollVertical: true,
				disableScrollHorizontal: true,
				swap: true,
				minCols: this.layoutService.template.default_columns,
				maxCols: this.layoutService.template.default_columns,
				maxRows: 1,
				minRows: 1,
				keepFixedWidthInMobile: true,
				keepFixedHeightInMobile: true,
				enableEmptyCellContextMenu: true,
				enableEmptyCellClick: true,
				enableEmptyCellDrop: true,
				enableEmptyCellDrag: true,
				enableOccupiedCellDrop: true,
				emptyCellClickCallback: this.emptyCellClick.bind(this),
				emptyCellContextMenuCallback: this.emptyCellClick.bind(this),
				emptyCellDropCallback: this.emptyCellClick.bind(this),
				emptyCellDragCallback: this.emptyCellClick.bind(this),
				swapWhileDragging: false,
				margin: 0,
				draggable: {
					enabled: true,
					dropOverItems: false,
				},
				resizable: {
					enabled: true,
				},
			},
			dashboard: [],
			linked_component: this.layoutService.template.sections[index].linked_component,
			selected_linked_component:
				this.layoutService.template.sections[index].selected_linked_component,
			mainPdf: true,
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
			lineSpacingValue: 15,
			bgColor: false,
			backgroundColor: '#ff0000',
			fontColor: false,
			fontColorCode: '#000000',
			fontFamily: false,
			fontFamilyValue: '',
			seperatePdf: false,
			isCarried: false,
			hideInInstance: this.layoutService.template.sections[index].hideInInstance,
			hideSectionName: false,
			theme: 0,
			horizontalThemeCheck: false,
			verticalThemeCheck: false,
			sectionBorders: false,
			leftSectionBorder: 0,
			topSectionPadding: 0,
			rightSectionBorder: 0,
			topSectionBorder: 0,
			bottomSectionBorder: 0,
			completeBorder: false,
			printNewPage: false,
			errors: 0,
			selectedModules: [],
		};
		if (parentId === 1) {
			obj.defaultColumn = this.sectionDragStart.defaultColumn;
			obj.selectedModules = this.sectionDragStart.selectedModules;
			obj.options = this.sectionDragStart.options;
			obj.dashboard = this.sectionDragStart.dashboard;
			obj.dashboard = this.removeUiChecksFromSection(obj.dashboard);
			obj.section_type = this.sectionDragStart.section_type;
			obj.theme = this.sectionDragStart.theme;
			obj.sectionBorders = this.sectionDragStart.sectionBorders;
			obj.completeBorder = this.sectionDragStart.completeBorder;
			obj.leftSectionBorder = this.sectionDragStart.leftSectionBorder;
			obj.topSectionPadding = this.sectionDragStart.topSectionPadding;
			obj.rightSectionBorder = this.sectionDragStart.rightSectionBorder;
			obj.topSectionBorder = this.sectionDragStart.topSectionBorder;
			obj.bottomSectionBorder = this.sectionDragStart.bottomSectionBorder;
			obj.uiBorders = this.sectionDragStart.uiBorders;
			obj.leftUIBorder = this.sectionDragStart.leftUIBorder;
			obj.rightUIBorder = this.sectionDragStart.rightUIBorder;
			obj.bottomUIBorder = this.sectionDragStart.bottomUIBorder;
			obj.topUIBorder = this.sectionDragStart.topUIBorder;
			obj.uiPaddings = this.sectionDragStart.uiPaddings;
			obj.leftUIPadding = this.sectionDragStart.leftUIPadding;
			obj.rightUIPadding = this.sectionDragStart.rightUIPadding;
			obj.topUIPadding = this.sectionDragStart.topUIPadding;
			obj.bottomUIPadding = this.sectionDragStart.bottomUIPadding;
			obj.bgColor = this.sectionDragStart.bgColor;
			obj.backgroundColor = this.sectionDragStart.backgroundColor;
			obj.fontColor = this.sectionDragStart.fontColor;
			obj.fontColorCode = this.sectionDragStart.fontColorCode;
			obj.fontFamily = this.sectionDragStart.fontFamily;
			obj.fontFamilyValue = this.sectionDragStart.fontFamilyValue;
			obj.lineSpacing = this.sectionDragStart.lineSpacing;
			obj.lineSpacingValue = this.sectionDragStart.lineSpacingValue;
			obj.is_table = this.sectionDragStart.is_table;
			obj.printNewPage = this.sectionDragStart.printNewPage;
			obj.seperatePdf = this.sectionDragStart.seperatePdf;
			obj.mainPdf = this.sectionDragStart.mainPdf;
			obj.hideSectionName = this.sectionDragStart.hideSectionName;
			obj.hideInInstance = this.sectionDragStart.hideInInstance;
			obj.tags = this.sectionDragStart.tags;
			obj.errors = this.sectionDragStart.errors;
			obj.section_title = this.sectionDragStart.section_title;
			obj.boundSectionStatement = this.sectionDragStart.boundSectionStatement;
			obj.mapper = this.sectionDragStart.mapper;
			if (
				this.sectionDragStart.section_template != this.layoutService.template.template_id &&
				!pasteCheck
			) {
				this.layoutService.carryModal = this.modalService.open(CarryForwardComponent, {
					backdrop: 'static',
					keyboard: false,
					windowClass: 'modal_extraDOc',
				});
				this.layoutService.carryModal.result.then((res) => {
					if (this.layoutService.carryDrop) {
						obj['carryForward'] = {
							isCarryForward: true,
							sectionId: this.section_id_carry,
							originalUpdated: false,
							carryForwardCheck: false,
							carryForwardApplied: false,
							cfList: [],
							carryForwardSections: [],
						};
					}
					if (res == 'Normal' || res == 'Carry Forward') {
						this.sectionToList();
						for (let i: number = 0; i < this.list?.length; i++) {
							if (obj.parentId === this.list[i].id) {
								this.list[i].children.push({
									id: this.totalSection,
									children: [],
									obj,
								});
								this.list = [...this.list];
								break;
							} else if (this.list[i].children?.length > 0) {
								this.recurseAdd(this.list[i], obj.parentId, obj);
							}
						}
						this.layoutService.template.sections = [];
						for (let i: number = 0; i < this.list?.length; i++) {
							this.list[i].obj.parentId = 0;
							this.layoutService.template.sections.push(this.list[i].obj);
							if (this.list[i].children?.length > 0) {
								this.recurseRestructureSection(this.list[i], -1);
							}
						}
						this.totalSection++;
						this.updateBackUpTask('type', `subsection`);
						this.updateBackUpTask('id', this.layoutService.backupId);
						this.updateIndexes(index, -1, -1, 'section');
						this.updateBackUpTask(
							'oldObject',
							this.layoutService.template.sections[index].subsection,
						);
						this.layoutService.template.sections[index].subsection++;
						this.updateBackUpTask(
							'newObject',
							this.layoutService.template.sections[index].subsection,
						);
						this.resetSectionNumbers();
						for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
							if (this.layoutService.template.sections[i].id == this.totalSection - 1) {
								this.layoutService.template.sections[i].options = {
									gridType: GridType.VerticalFixed,
									displayGrid: DisplayGrid.Always,
									setGridSize: true,
									pushItems: true,
									fixedRowHeight: 100,
									fixedColWidth: 750 / this.layoutService.template.default_columns,
									disableScrollVertical: true,
									disableScrollHorizontal: true,
									swap: true,
									minCols: this.layoutService.template.sections[i].options.minCols,
									maxCols: this.layoutService.template.sections[i].options.maxCols,
									maxRows: this.layoutService.template.sections[i].options.maxRows,
									minRows: this.layoutService.template.sections[i].options.minRows,
									keepFixedWidthInMobile: true,
									keepFixedHeightInMobile: true,
									enableEmptyCellContextMenu: true,
									enableEmptyCellClick: true,
									enableEmptyCellDrop: true,
									enableEmptyCellDrag: true,
									enableOccupiedCellDrop: true,
									emptyCellClickCallback: this.emptyCellClick.bind(this),
									emptyCellContextMenuCallback: this.emptyCellClick.bind(this),
									emptyCellDropCallback: this.emptyCellClick.bind(this),
									emptyCellDragCallback: this.emptyCellClick.bind(this),
									swapWhileDragging: false,
									margin: 0,
									draggable: this.layoutService.template.sections[i].options.draggable,
									resizable: this.layoutService.template.sections[i].options.resizable,
								};
								this.updateBackUpTask('type', `addSubSection`);
								this.updateBackUpTask('id', this.layoutService.backupId);
								this.updateIndexes(i, -1, -1, 'addSubSection');
								this.updateBackUpTask('oldObject', null);
								this.updateBackUpTask(
									'newObject',
									cloneDeep(this.layoutService.template.sections[i]),
								);
								this.changeDetector.markForCheck();
							}
						}
					}
				});
			} else {
				this.sectionToList();
				for (let i: number = 0; i < this.list?.length; i++) {
					if (obj.parentId === this.list[i].id) {
						this.list[i].children.push({
							id: this.totalSection,
							children: [],
							obj,
						});
						this.list = [...this.list];
						break;
					} else if (this.list[i].children?.length > 0) {
						this.recurseAdd(this.list[i], obj.parentId, obj);
					}
				}
				this.layoutService.template.sections = [];
				for (let i: number = 0; i < this.list?.length; i++) {
					this.list[i].obj.parentId = 0;
					this.layoutService.template.sections.push(this.list[i].obj);
					if (this.list[i].children?.length > 0) {
						this.recurseRestructureSection(this.list[i], -1);
					}
				}
				this.totalSection++;
				this.updateBackUpTask('type', `subsection`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(index, -1, -1, 'section');
				this.updateBackUpTask('oldObject', this.layoutService.template.sections[index].subsection);
				this.layoutService.template.sections[index].subsection++;
				this.updateBackUpTask('newObject', this.layoutService.template.sections[index].subsection);
				this.resetSectionNumbers();
				for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
					if (this.layoutService.template.sections[i]['id'] == this.totalSection - 1) {
						this.layoutService.template.sections[i].options = {
							gridType: GridType.VerticalFixed,
							displayGrid: DisplayGrid.Always,
							setGridSize: true,
							pushItems: true,
							fixedRowHeight: 100,
							fixedColWidth: 750 / this.layoutService.template.default_columns,
							disableScrollVertical: true,
							disableScrollHorizontal: true,
							swap: true,
							minCols: this.layoutService.template.sections[i].options.minCols,
							maxCols: this.layoutService.template.sections[i].options.maxCols,
							maxRows: this.layoutService.template.sections[i].options.maxRows,
							minRows: this.layoutService.template.sections[i].options.minRows,
							keepFixedWidthInMobile: true,
							keepFixedHeightInMobile: true,
							enableEmptyCellContextMenu: true,
							enableEmptyCellClick: true,
							enableEmptyCellDrop: true,
							enableEmptyCellDrag: true,
							enableOccupiedCellDrop: true,
							emptyCellClickCallback: this.emptyCellClick.bind(this),
							emptyCellContextMenuCallback: this.emptyCellClick.bind(this),
							emptyCellDropCallback: this.emptyCellClick.bind(this),
							emptyCellDragCallback: this.emptyCellClick.bind(this),
							swapWhileDragging: false,
							margin: 0,
							draggable: this.layoutService.template.sections[i].options.draggable,
							resizable: this.layoutService.template.sections[i].options.resizable,
						};
						this.updateBackUpTask('type', `addSubSection`);
						this.updateBackUpTask('id', this.layoutService.backupId);
						this.updateIndexes(i, -1, -1, 'addSubSection');
						this.updateBackUpTask('oldObject', null);
						this.updateBackUpTask('newObject', this.layoutService.template.sections[i]);
						this.changeDetector.markForCheck();
						break;
					}
				}
			}
		} else {
			this.sectionToList();
			for (let i: number = 0; i < this.list?.length; i++) {
				if (obj.parentId === this.list[i].id) {
					this.list[i].children.push({
						id: this.totalSection,
						children: [],
						obj,
					});
					this.list = [...this.list];
					break;
				} else if (this.list[i].children?.length > 0) {
					this.recurseAdd(this.list[i], obj.parentId, obj);
				}
			}
			this.layoutService.template.sections = [];
			for (let i: number = 0; i < this.list?.length; i++) {
				this.list[i].obj.parentId = 0;
				this.layoutService.template.sections.push(this.list[i].obj);
				if (this.list[i].children?.length > 0) {
					this.recurseRestructureSection(this.list[i], -1);
				}
			}
			this.totalSection++;
			this.updateBackUpTask('type', `subsection`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(index, -1, -1, 'section');
			this.updateBackUpTask('oldObject', this.layoutService.template.sections[index].subsection);
			this.layoutService.template.sections[index].subsection++;
			this.updateBackUpTask('newObject', this.layoutService.template.sections[index].subsection);
			this.resetSectionNumbers();
			for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
				if (this.layoutService.template.sections[i].id == this.totalSection - 1) {
					this.layoutService.template.sections[i].options = {
						gridType: GridType.VerticalFixed,
						displayGrid: DisplayGrid.Always,
						setGridSize: true,
						pushItems: true,
						fixedRowHeight: 100,
						fixedColWidth: 750 / this.layoutService.template.default_columns,
						disableScrollVertical: true,
						disableScrollHorizontal: true,
						swap: true,
						minCols: this.layoutService.template.sections[i].options.minCols,
						maxCols: this.layoutService.template.sections[i].options.maxCols,
						maxRows: this.layoutService.template.sections[i].options.maxRows,
						minRows: this.layoutService.template.sections[i].options.minRows,
						keepFixedWidthInMobile: true,
						keepFixedHeightInMobile: true,
						enableEmptyCellContextMenu: true,
						enableEmptyCellClick: true,
						enableEmptyCellDrop: true,
						enableEmptyCellDrag: true,
						enableOccupiedCellDrop: true,
						emptyCellClickCallback: this.emptyCellClick.bind(this),
						emptyCellContextMenuCallback: this.emptyCellClick.bind(this),
						emptyCellDropCallback: this.emptyCellClick.bind(this),
						emptyCellDragCallback: this.emptyCellClick.bind(this),
						swapWhileDragging: false,
						margin: 0,
						draggable: this.layoutService.template.sections[i].options.draggable,
						resizable: this.layoutService.template.sections[i].options.resizable,
					};
					this.updateBackUpTask('type', `addSubSection`);
					this.updateBackUpTask('id', this.layoutService.backupId);
					this.updateIndexes(i, -1, -1, 'addSubSection');
					this.updateBackUpTask('oldObject', null);
					this.updateBackUpTask('newObject', cloneDeep(this.layoutService.template.sections[i]));
					this.changeDetector.markForCheck();
				}
			}
		}
		this.layoutService.backupId++;
		this.GetHeightValue();
		this.changeDetector.detectChanges();
	}
	externalModules: any = [
		{
			id: 1,
			label: 'Doctor Calendar',
			route: '/scheduler-front-desk/doctor-calendar',
		},
		{
			id: 2,
			label: 'Assignment',
			route: '/scheduler-front-desk/speciality',
		},
		{
			id: 3,
			label: 'Re-schedule List',
			route: '/scheduler-front-desk/schedule-list',
		},
		{
			id: 4,
			label: 'ERX Prescribe',
			model: true,
		},
		{
			id: 5,
			label: 'ERX Summary',
			model: true,
		}
	];
	moduleSelect(index, event) {
		for (
			let i: number = 0;
			i < this.layoutService.template.sections[index].selectedModules?.length;
			i++
		) {
			if (event.label == this.layoutService.template.sections[index].selectedModules[i].label) {
				this.layoutService.template.sections[index].selectedModules.splice(i, 1);
				return;
			}
		}
		for (let item of this.externalModules) {
			if (event.label == this.externalModules.label) {
				this.layoutService.template.sections[index].selectedModules.push({
					id: item.id,
					label: item.label,
					selected: false,
				});
				return;
			}
		}
	}
	foundExternalSlugs = [];
	foundChildSlugs = [];
	linkedExternalSlugs = [];
	linkedChildSlugs = [];
	selectedExternalSlug: any = {};
	selectedChildSlug: any = {};
	childSlugActive: any = [];
	searchChildSlugs(event) {
		let nameFlag: number = 0;
		this.foundChildSlugs = [];
		event.target.value = event.target.value.toLowerCase();
		let words = event.target.value.split(' ');
		for (let i: number = 0; i < this.childSlugs?.length; i++) {
			let tempName = this.childSlugs[i].title.toLowerCase();
			for (let j: number = 0; j < words?.length; j++) {
				if (tempName.includes(words[j]) && nameFlag != -1) {
					nameFlag = 1;
					tempName = tempName.replace(words[j], '');
				} else {
					nameFlag = -1;
				}
			}
			if (nameFlag == 1) {
				this.foundChildSlugs.push(this.childSlugs[i]);
			}
			nameFlag = 0;
		}
		for (let i: number = 0; i < this.foundChildSlugs?.length; i++) {
			if (this.foundChildSlugs[i].selectedUI[this.selectedOptionIndex]) {
				continue;
			}
			if (this.foundChildSlugs[i].addedFields[this.selectedOptionIndex]) {
				continue;
			}
			for (let j = i + 1; j < this.foundChildSlugs?.length; j++) {
				if (this.foundChildSlugs[j].selectedUI[this.selectedOptionIndex]) {
					let temp = this.foundChildSlugs[j];
					this.foundChildSlugs[j] = this.foundChildSlugs[i];
					this.foundChildSlugs[i] = temp;
				}
				if (this.foundChildSlugs[j].addedFields[this.selectedOptionIndex]) {
					let temp = this.foundChildSlugs[j];
					this.foundChildSlugs[j] = this.foundChildSlugs[i];
					this.foundChildSlugs[i] = temp;
				}
			}
		}
	}
	searchExternalSlugs(event) {
		let nameFlag: number = 0;
		this.foundExternalSlugs = [];
		event.target.value = event.target.value.toLowerCase();
		let words = event.target.value.split(' ');
		for (let i: number = 0; i < this.allExternalSlugs?.length; i++) {
			if (this.allExternalSlugs[i].field_type == 'child_field') {
				continue;
			}
			let tempName = this.allExternalSlugs[i].title.toLowerCase();
			for (let j: number = 0; j < words?.length; j++) {
				if (tempName.includes(words[j]) && nameFlag != -1) {
					nameFlag = 1;
					tempName = tempName.replace(words[j], '');
				} else {
					nameFlag = -1;
				}
			}
			if (nameFlag == 1) {
				this.foundExternalSlugs.push(this.allExternalSlugs[i]);
			}
			nameFlag = 0;
		}
		for (let i: number = 0; i < this.foundExternalSlugs?.length; i++) {
			if (this.foundExternalSlugs[i].selectedUI?.length) {
				continue;
			}
			if (this.foundExternalSlugs[i].addedFields?.length) {
				continue;
			}
			for (let j = i + 1; j < this.foundExternalSlugs?.length; j++) {
				if (this.foundExternalSlugs[j].selectedUI?.length) {
					let temp = this.foundExternalSlugs[j];
					this.foundExternalSlugs[j] = this.foundExternalSlugs[i];
					this.foundExternalSlugs[i] = temp;
				}
				if (this.foundExternalSlugs[j].addedFields?.length) {
					let temp = this.foundExternalSlugs[j];
					this.foundExternalSlugs[j] = this.foundExternalSlugs[i];
					this.foundExternalSlugs[i] = temp;
				}
			}
		}
	}
	async deleteExternalSlug() {
		if (this.selectedExternalSlug.selectedUI && this.selectedExternalSlug.selectedUI?.length) {
			if (this.selectedExternalSlug.field_type == 'multiple_dropdown') {
				for (let tempSection of this.layoutService.template.sections) {
					for (let tempUI of tempSection.dashboard) {
						if (tempUI.obj.uicomponent_name == this.selectedExternalSlug.selectedUI[0].id) {
							await this.removeAllOptions(tempUI.obj, false, false);
						}
					}
				}
			}
		}
		for (let slug of this.allExternalSlugs) {
			if (this.selectedExternalSlug.slug == slug.slug) {
				slug.selectedUI = [];
				slug.addedFields = [];
			}
		}
		for (let i: number = 0; i < this.layoutService.template.allExternalSlugs?.length; i++) {
			if (this.selectedExternalSlug.slug == this.layoutService.template.allExternalSlugs[i].slug) {
				this.layoutService.template.allExternalSlugs.splice(i, 1);
				i--;
			}
		}
		this.selectedExternalSlug = {};
		this.childSlugs = [];
	}
	async deleteExternalSlugIndex(index) {
		if (this.selectedExternalSlug.selectedUI && this.selectedExternalSlug.selectedUI?.length) {
			if (this.selectedExternalSlug.field_type == 'multiple_dropdown') {
				for (let tempSection of this.layoutService.template.sections) {
					for (let tempUI of tempSection.dashboard) {
						if (tempUI.obj.uicomponent_name == this.selectedExternalSlug.selectedUI[0].id) {
							await this.removeAllOptions(tempUI.obj, false, false);
						}
					}
				}
			}
		}
		for (let slug of this.allExternalSlugs) {
			if (this.selectedExternalSlug.slug == slug.slug) {
				let splicedUI = slug.selectedUI.splice(index, 1);
				if (slug.addedFields?.length) {
					for (let section of this.layoutService.template.sections) {
						for (let uicomponent of section.dashboard) {
							if (uicomponent.obj.uicomponent_name == splicedUI[0].id) {
								let tempFields = [];
								for (let addedField of slug.addedFields) {
									let check = false;
									for (let option of uicomponent.obj?.options) {
										if (option.textLabel == addedField) {
											check = true;
											break;
										}
									}
									if (!check) {
										tempFields.push(addedField);
									}
								}
								slug.addedFields = tempFields;
							}
						}
					}
				}
				this.selectedExternalSlug = slug;
			}
		}
		for (let i: number = 0; i < this.layoutService.template.allExternalSlugs?.length; i++) {
			if (this.selectedExternalSlug.slug == this.layoutService.template.allExternalSlugs[i].slug) {
				this.layoutService.template.allExternalSlugs.splice(i, 1);
				i--;
			}
		}
		this.layoutService.updateComponents();
	}
	deleteChildSlug() {
		for (let slug of this.allExternalSlugs) {
			if (this.selectedChildSlug.slug == slug.slug) {
				slug.selectedUI = [];
				slug.addedFields = [];
			}
		}
		for (let i: number = 0; i < this.layoutService.template.allExternalSlugs?.length; i++) {
			if (this.selectedChildSlug.slug == this.layoutService.template.allExternalSlugs[i].slug) {
				this.layoutService.template.allExternalSlugs.splice(i, 1);
				i--;
			}
		}
		this.selectedChildSlug = {};
	}
	showSlugDetailsChild(index) {
		this.selectedChildSlug = this.foundChildSlugs[index];
	}
	showSlugDetails(index) {
		this.selectedChildSlug = {};
		this.childSlugs = [];
		this.selectedExternalSlug = this.foundExternalSlugs[index];
		this.uiExternalSearchDataComponents = [];
		this.uiExternalSearchData = [];
		for (let section of this.layoutService.template.sections) {
			for (let ui of section.dashboard) {
				let validation = '';
				if (ui.obj.validationValue && ui.obj.validationValue.type) {
					validation = ui.obj.validationValue.type;
				}
				this.uiExternalSearchDataComponents.push({
					id: ui.obj.uicomponent_name,
					name: ui.obj.uicomponent_name + '-' + ui.obj.second_name,
					type: ui.obj.type,
					isMultiSelect: ui.obj.isMultiSelect,
					validation: validation,
				});
			}
		}
	}
	resetCalculations(index) {
		this.layoutService.template.sections[index].selectedModules = [];
	}
	emptySelectedComponents() {
		if (this.selectedComponents?.length) {
			for (let component of this.selectedComponents) {
				if (
					this.layoutService.template.sections[this.layoutService.lastI] &&
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[
						this.layoutService.lastK
					] &&
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					]
				) {
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].isClick = false;
				}
			}
			this.selectedComponents = [];
		} else if (
			this.layoutService.template.sections[this.layoutService.lastI] &&
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			]
		) {
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].isClick = false;
		}
	}
	emptySingleComponent() {
		if (
			!(this.selectedComponents?.length > 1) &&
			this.layoutService.lastI != null &&
			this.layoutService.lastK != null &&
			this.layoutService.template.sections[this.layoutService.lastI] &&
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			]
		) {
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].isClick = false;
		}
	}
	createNewTemplate(check?) {
		this.sectionIndex = null;
		if (this.layoutService.template.sections?.length > 0) {
			if (!check) {
				// this.coolDialogs
				// 	.confirm('Current progress will be lost. Are you sure you want to continue? ', {
				// 		okButtonText: 'OK',
				// 		cancelButtonText: 'Cancel',
				// 	})
				this.bsModalRef = this.modalServiceDialog.show(ConfirmationDialogComponent, {
					initialState: {
					  message: 'Current progress will be lost. Are you sure you want to continue?'
					},
					class: 'modal-dialog-centered'
				  });
				  this.bsModalRef.content.result
					.subscribe((response) => {
						if (response == true) {
							this.applyTempId = 0;
							this.removeCollapsePropertiesTab();
							this.changeDetector.detectChanges();
							this.templateSaved = false;
							this.emptySelectedComponents();
							for (let item of this.allExternalSlugs) {
								item.selectedUI = [];
								item.addedFields = [];
							}
							this.layoutService.backupQueue = [];
							this.layoutService.backupIndex = -2;
							this.layoutService.backupId = 1;
							this.layoutService.template = {
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
								lineSpacingValue: 15,
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
								sections: [],
								uiCompIds: 0,
								carryOriginalDeleted: [],
								allExternalSlugs: [],
								carryNewDeleted: [],
								pageSize: {
									width: 205,
									height: 297,
								},
								pdfMarginTop: 0,
								pdfMarginBottom: 0,
								pdfMarginLeft: 5,
								pdfMarginRight: 5,
							};
							this.requestService
								.sendRequest(
									TemaplateManagerUrlsEnum.mappingKeywords,
									'GET',
									REQUEST_SERVERS.fd_api_url,
								)
								.subscribe(
									(res: any) => {
										this.layoutService.template['mappingKeyWords'] = res.result.data;
									},
									(err) => {
										console.log(err);
										this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
										this.stopLoader();
									},
								);
							this.layoutService.templateErrors = 0;
							this.removeCollapsePropertiesTab();
							this.setPropertiesTab('showTemplateProperties');
							this.setCollapsePropertiesTab('showTemplateProperties');
							this.list = [];
							this.PreDefinedList = [];
							this.GetHeightValue();
							this.changeDetector.detectChanges();
							return;
						} else {
							return;
						}
					});
			} else {
				this.applyTempId = 0;
				this.removeCollapsePropertiesTab();
				this.changeDetector.detectChanges();
				this.templateSaved = false;
				this.emptySelectedComponents();
				for (let item of this.allExternalSlugs) {
					item.selectedUI = [];
					item.addedFields = [];
				}
				this.layoutService.backupQueue = [];
				this.layoutService.backupIndex = -2;
				this.layoutService.backupId = 1;
				this.layoutService.template = {
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
					lineSpacingValue: 15,
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
					sections: [],
					uiCompIds: 0,
					carryOriginalDeleted: [],
					allExternalSlugs: [],
					carryNewDeleted: [],
					pageSize: {
						width: 205,
						height: 297,
					},
					pdfMarginTop: 0,
					pdfMarginBottom: 0,
					pdfMarginLeft: 5,
					pdfMarginRight: 5,
				};
				this.requestService
					.sendRequest(TemaplateManagerUrlsEnum.mappingKeywords, 'GET', REQUEST_SERVERS.fd_api_url)
					.subscribe(
						(res: any) => {
							this.layoutService.template['mappingKeyWords'] = res.result.data;
						},
						(err) => {
							console.log(err);
							this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
							this.stopLoader();
						},
					);
				this.layoutService.templateErrors = 0;
				this.removeCollapsePropertiesTab();
				this.setPropertiesTab('showTemplateProperties');
				this.setCollapsePropertiesTab('showTemplateProperties');
				this.list = [];
				this.PreDefinedList = [];
				this.GetHeightValue();
				this.changeDetector.detectChanges();
				return;
			}
		} else {
			this.applyTempId = 0;
			this.removeCollapsePropertiesTab();
			this.changeDetector.detectChanges();
			this.templateSaved = false;
			this.emptySelectedComponents();
			for (let item of this.allExternalSlugs) {
				item.selectedUI = [];
				item.addedFields = [];
			}
			this.layoutService.backupQueue = [];
			this.layoutService.backupIndex = -2;
			this.layoutService.backupId = 1;
			this.layoutService.template = {
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
				lineSpacingValue: 15,
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
				sections: [],
				uiCompIds: 0,
				carryOriginalDeleted: [],
				allExternalSlugs: [],
				carryNewDeleted: [],
				pageSize: {
					width: 205,
					height: 297,
				},
				pdfMarginTop: 0,
				pdfMarginBottom: 0,
				pdfMarginLeft: 5,
				pdfMarginRight: 5,
			};
			this.requestService
				.sendRequest(TemaplateManagerUrlsEnum.mappingKeywords, 'GET', REQUEST_SERVERS.fd_api_url)
				.subscribe(
					(res: any) => {
						this.layoutService.template['mappingKeyWords'] = res.result.data;
					},
					(err) => {
						console.log(err);
						this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
						this.stopLoader();
					},
				);
			this.layoutService.templateErrors = 0;
			this.removeCollapsePropertiesTab();
			this.setPropertiesTab('showTemplateProperties');
			this.setCollapsePropertiesTab('showTemplateProperties');
			this.list = [];
			this.PreDefinedList = [];
			this.GetHeightValue();
			this.changeDetector.detectChanges();
			return;
		}
	}
	setTemplateProperties(e) {
		this.layoutService.template.default_columns = parseInt(e.target.value);
		this.templateCreated = true;
	}
	setTemplatePdfTypeProperties(e) {
		this.layoutService.template.pdf_type = parseInt(e.target.value);
	}
	templateProperties() {
		this.uiExternalSearchDataComponents = [];
		this.uiExternalSearchData = [];
		for (let section of this.layoutService.template.sections) {
			for (let ui of section.dashboard) {
				let validation = '';
				if (ui.obj.validationValue && ui.obj.validationValue.type) {
					validation = ui.obj.validationValue.type;
				}
				this.uiExternalSearchDataComponents.push({
					id: ui.obj.uicomponent_name,
					name: ui.obj.uicomponent_name + '-' + ui.obj.second_name,
					type: ui.obj.type,
					isMultiSelect: ui.obj.isMultiSelect,
					validation: validation,
				});
			}
		}
		this.sectionIndex = null;
		this.templatePasteCheck = true;
		this.emptySelectedComponents();
		if (this.emptyCellItemIndex.sectionIndex != -1) {
			for (
				let i: number = 0;
				this.layoutService.template.sections[this.emptyCellItemIndex.sectionIndex] &&
				i <
					this.layoutService.template.sections[this.emptyCellItemIndex.sectionIndex].dashboard
						?.length;
				i++
			) {
				if (
					this.layoutService.template.sections[this.emptyCellItemIndex.sectionIndex].dashboard[i]
						.obj.emptyCell
				) {
					let tempLastI = this.layoutService.lastI;
					let tempLastK = this.layoutService.lastK;
					this.layoutService.lastI = this.emptyCellItemIndex.sectionIndex;
					this.layoutService.lastK = i;
					this.removeItem(
						this.layoutService.template.sections[this.emptyCellItemIndex.sectionIndex].dashboard[i],
						'col',
						false,
						this.emptyCellItemIndex.sectionIndex,
						false,
					);
					i--;
					this.layoutService.lastI = tempLastI;
					this.layoutService.lastK = tempLastK;
				}
			}
		}
		this.emptyCellItem = {};
		this.emptyCellItemIndex = { sectionIndex: -1, dashboardIndex: -1 };
		this.selectedSectionIndex = null;
		this.removeCollapsePropertiesTab();
		this.setPropertiesTab('showTemplateProperties');
		this.setCollapsePropertiesTab('showTemplateProperties');
		this.showSections = true;
		this.GetHeightValue();
	}
	public selectedSectionIndex: number = null;
	sectionsProperties(sectionIndex) {
		this.emptySelectedComponents();
		if (this.emptyCellItemIndex.sectionIndex != -1) {
			for (
				let i: number = 0;
				this.layoutService.template.sections[this.emptyCellItemIndex.sectionIndex] &&
				i <
					this.layoutService.template.sections[this.emptyCellItemIndex.sectionIndex].dashboard
						?.length;
				i++
			) {
				if (
					this.layoutService.template.sections[this.emptyCellItemIndex.sectionIndex].dashboard[i]
						.obj.emptyCell
				) {
					let tempLastI = this.layoutService.lastI;
					let tempLastK = this.layoutService.lastK;
					this.layoutService.lastI = this.emptyCellItemIndex.sectionIndex;
					this.layoutService.lastK = i;
					this.removeItem(
						this.layoutService.template.sections[this.emptyCellItemIndex.sectionIndex].dashboard[i],
						'col',
						false,
						this.emptyCellItemIndex.sectionIndex,
						false,
					);
					i--;
					this.layoutService.lastI = tempLastI;
					this.layoutService.lastK = tempLastK;
				}
			}
		}
		this.emptyCellItem = {};
		this.emptyCellItemIndex = { sectionIndex: -1, dashboardIndex: -1 };
		let tempValue = this.collapsePropertiesTab['showSectionProperties'];
		this.removeCollapsePropertiesTab();
		this.setPropertiesTab('showSectionProperties');
		this.setPropertiesTab('showSections');
		this.setPropertiesTab('showUIComponents');
		if (!tempValue) {
			this.setCollapsePropertiesTab('showUIComponents');
		} else {
			this.setCollapsePropertiesTab('showSectionProperties');
		}
		if (this.selectedSectionIndex == sectionIndex && this.layoutService.lastI != null) {
			this.GetHeightValue();
			if (!this.shiftPressed) {
				this.layoutService.template.sections[sectionIndex].sectionClick = true;
			}
			return;
		}
		if (
			this.lastSecIndex != null &&
			this.layoutService.template.sections[this.lastSecIndex] &&
			!this.shiftPressed
		) {
			this.layoutService.template.sections[sectionIndex].sectionClick = true;
		}
		this.lastSecIndex = sectionIndex;
		this.selectedSection = sectionIndex;
		this.selectedSectionIndex = sectionIndex;
		this.GetHeightValue();
		this.layoutService.lastI = sectionIndex;
		let oddRows = [];
		let evenRows = [];
		let allRowsItems = [];
		let allRows = [];
		if (this.layoutService.template.sections[this.layoutService.lastI].is_table) {
			for (let item of this.layoutService.template.sections[this.layoutService.lastI].dashboard) {
				if (item.x == 0) {
					allRows.push({ y: item.y, rows: item.rows });
				}
			}
			for (let i: number = 0; i < allRows?.length; i++) {
				for (let j = i + 1; j < allRows?.length; j++) {
					if (allRows[i] > allRows[j]) {
						let temp = allRows[i];
						allRows[i] = allRows[j];
						allRows[j] = allRows[i];
					}
				}
			}
			let oddRowCheck = true;
			for (let item of allRows) {
				if (oddRowCheck) {
					for (let i: number = 0; i < item.rows; i++) {
						oddRows.push(item.y + i);
					}
					oddRowCheck = false;
				} else {
					for (let i: number = 0; i < item.rows; i++) {
						evenRows.push(item.y + i);
					}
					oddRowCheck = true;
				}
			}
			for (let item of this.layoutService.template.sections[this.layoutService.lastI].dashboard) {
				if (item.y != 0) {
					if (oddRows.includes(item.y)) {
						item.oddRow = true;
						item.evenRow = false;
					}
					if (evenRows.includes(item.y)) {
						item.oddRow = false;
						item.evenRow = true;
					}
				}
			}
		}
	}
	editTemplateName(type) {
		if (type == 'section') {
			if (this.editSecName === true) {
				this.editSecName = false;
			} else {
				this.editSecName = true;
			}
		} else if (type == 'template') {
			if (this.editTempName === true) {
				this.editTempName = false;
			} else {
				this.editTempName = true;
			}
		}
	}
	setSectionColumn(e: any, check) {
		this.setVerticalTheme();
		this.setHorizontalTheme();
		if (check != -1) {
			this.updateBackUpTask('type', `defaultColumn`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(check, -1, -1, 'section');
			this.updateBackUpTask('oldObject', this.layoutService.template.sections[check].defaultColumn);
			this.layoutService.template.sections[check].defaultColumn = true;
			this.updateBackUpTask('newObject', this.layoutService.template.sections[check].defaultColumn);
			this.updateBackUpTask('type', `minCols`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(check, -1, -1, 'sectionOptions');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[check].options.minCols,
			);
			this.layoutService.template.sections[check].options.minCols = parseInt(e.target.value);
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[check].options.minCols,
			);
			this.updateBackUpTask('type', `maxCols`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(check, -1, -1, 'sectionOptions');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[check].options.maxCols,
			);
			this.layoutService.template.sections[check].options.maxCols = parseInt(e.target.value);
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[check].options.maxCols,
			);
			this.updateBackUpTask('type', `fixedColWidth`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(check, -1, -1, 'sectionOptions');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[check].options.fixedColWidth,
			);
			this.layoutService.template.sections[check].options.fixedColWidth =
				750 / parseInt(e.target.value);
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[check].options.fixedColWidth,
			);
		} else {
			if (
				parseInt(e.target.value) <
				this.layoutService.template.sections[this.selectedSection].options.minCols
			) {
				for (
					let i: number = 0;
					i < this.layoutService.template.sections[this.selectedSection].dashboard?.length;
					i++
				) {
					if (
						this.layoutService.template.sections[this.selectedSection].dashboard[i].x +
							this.layoutService.template.sections[this.selectedSection].dashboard[i].cols >
						parseInt(e.target.value)
					) {
						this.toastrService.error('Remove UI component before changing the columns !', '', {
							timeOut: 6000,
						});
						if (this.layoutService.template.sections[this.selectedSection].options.maxCols < 6) {
							this.updateBackUpTask('type', `maxCols`);
							this.updateBackUpTask('id', this.layoutService.backupId);
							this.updateIndexes(this.selectedSection, -1, -1, 'sectionOptions');
							this.updateBackUpTask(
								'oldObject',
								this.layoutService.template.sections[this.selectedSection].options.maxCols,
							);
							e.target.selectedIndex =
								this.layoutService.template.sections[this.selectedSection].options.maxCols;
							this.updateBackUpTask(
								'newObject',
								this.layoutService.template.sections[this.selectedSection].options.maxCols,
							);
						} else {
							e.target.selectedIndex = 5;
						}
						e.preventDefault();
						e.stopPropagation();
						return;
					}
				}
			}
			this.updateBackUpTask('type', `defaultColumn`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(this.selectedSection, -1, -1, 'section');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[this.selectedSection].defaultColumn,
			);
			this.layoutService.template.sections[this.selectedSection].defaultColumn = true;
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[this.selectedSection].defaultColumn,
			);
			this.updateBackUpTask('type', `minCols`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(this.selectedSection, -1, -1, 'sectionOptions');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[this.selectedSection].options.minCols,
			);
			this.layoutService.template.sections[this.selectedSection].options.minCols = parseInt(
				e.target.value,
			);
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[this.selectedSection].options.minCols,
			);
			this.updateBackUpTask('type', `maxCols`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(this.selectedSection, -1, -1, 'sectionOptions');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[this.selectedSection].options.maxCols,
			);
			this.layoutService.template.sections[this.selectedSection].options.maxCols = parseInt(
				e.target.value,
			);
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[this.selectedSection].options.maxCols,
			);
			this.updateBackUpTask('type', `fixedColWidth`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(this.selectedSection, -1, -1, 'sectionOptions');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[this.selectedSection].options.fixedColWidth,
			);
			this.layoutService.template.sections[this.selectedSection].options.fixedColWidth =
				750 / parseInt(e.target.value);
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[this.selectedSection].options.fixedColWidth,
			);
		}
		this.optionRefresh(this.selectedSection);
		this.layoutService.backupId++;
	}
	optionRefresh(selectedSection: any, check?) {
		if (check) {
			check.preventDefault();
			check.stopPropagation();
			setTimeout(() => {
				this.optionRefresh(selectedSection, false);
			}, 10);
			return;
		}
		if (check == false) {
			this.layoutService.collapseSectionIndex[
				`${this.layoutService.template.sections[selectedSection].id}`
			] =
				!this.layoutService.collapseSectionIndex[
					`${this.layoutService.template.sections[selectedSection].id}`
				];
		}
		this.layoutService.template.sections[selectedSection].options = {
			gridType: GridType.VerticalFixed,
			displayGrid: DisplayGrid.Always,
			setGridSize: true,
			pushItems: true,
			fixedRowHeight: 100,
			fixedColWidth: 750 / this.layoutService.template.default_columns,
			disableScrollVertical: true,
			disableScrollHorizontal: true,
			swap: true,
			minCols: this.layoutService.template.sections[selectedSection].options.minCols,
			maxCols: this.layoutService.template.sections[selectedSection].options.maxCols,
			maxRows: this.layoutService.template.sections[selectedSection].options.maxRows,
			minRows: this.layoutService.template.sections[selectedSection].options.minRows,
			keepFixedWidthInMobile: true,
			keepFixedHeightInMobile: true,
			enableEmptyCellContextMenu: true,
			enableEmptyCellClick: true,
			enableEmptyCellDrop: true,
			enableEmptyCellDrag: true,
			enableOccupiedCellDrop: true,
			emptyCellClickCallback: this.emptyCellClick.bind(this),
			emptyCellContextMenuCallback: this.emptyCellClick.bind(this),
			emptyCellDropCallback: this.emptyCellClick.bind(this),
			emptyCellDragCallback: this.emptyCellClick.bind(this),
			swapWhileDragging: false,
			margin: 0,
			draggable: this.layoutService.template.sections[selectedSection].options.draggable,
			resizable: this.layoutService.template.sections[selectedSection].options.resizable,
		};
		this.changeDetector.markForCheck();
	}
	shouldDisplayTableRow(dashboard, dropdownOptions, rowID, j) {
		let check = dashboard.is_table;
		if (dashboard.is_table && j != 0 && dropdownOptions) {
			let rowOption = dropdownOptions.find((o) => {
				return o.linkedRowValue.id === rowID;
			});
			if (rowOption) check = rowOption.selected;
		}
		return (!dashboard.is_table && !this.emptyRowCheck[j]) || check;
	}
	addNewUICompOption(type, index) {
		this.updateBackUpTask('type', `options`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options,
		);
		const len =
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options?.length + 1;
		let max: number = 0;
		for (let item of this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj?.options) {
			if (item.id > max) {
				max = item.id;
			}
		}
		const newId = max + 1;
		if (type === this.uicomponentTypes.CHECKBOX) {
			let editorLabel = `Option ${len}`;
			editorLabel = this.layoutService.applyEditor(
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj,
				editorLabel,
			);
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options.splice(index + 1, 0, {
				label: editorLabel,
				instanceLabel: editorLabel,
				textLabel: 'Option ' + len,
				input: false,
				id: newId,
				link: false,
				hide: false,
				selected: false,
				inputValue: '',
				instanceInputValue: '',
				height: 30,
				decimalPlacesLimit: '',
				decimalRoundOff: false,
				commentsPlaceholder: 'Type Here',
				is_required: false,
				minLimit: '',
				fontSize: '3',
				maxLimit: '',
				minMaxCheck: false,
				validationValue: {},
				validationCheck: false,
				showOption: true,
				selectedLinkSection: {},
				linkedStatement: '',
				selectedLinkUi: {},
				linkedUICheck: false,
				linkedStatementCheck: false,
			});
		} else if (type === this.uicomponentTypes.RADIO) {
			let editorLabel = `Option ${len}`;
			editorLabel = this.layoutService.applyEditor(
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj,
				editorLabel,
			);
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options.splice(index + 1, 0, {
				label: editorLabel,
				instanceLabel: editorLabel,
				textLabel: 'Option ' + len,
				input: false,
				selected: false,
				id: newId,
				link: false,
				hide: false,
				inputValue: '',
				instanceInputValue: '',
				height: 30,
				decimalPlacesLimit: '',
				decimalRoundOff: false,
				commentsPlaceholder: 'Type Here',
				is_required: false,
				minLimit: '',
				fontSize: '3',
				maxLimit: '',
				minMaxCheck: false,
				validationValue: {},
				validationCheck: false,
				showOption: true,
				selectedLinkSection: {},
				linkedStatement: '',
				selectedLinkUi: {},
				linkedUICheck: false,
				linkedStatementCheck: false,
			});
		} else if (type === this.uicomponentTypes.SWITCH) {
			let switchLabel = `xyz`;
			switchLabel = this.layoutService.applyEditor(
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj,
				switchLabel,
			);
			if (
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.options?.length > 2
			) {
				this.toastrService.error('Maximum three options are allowed!', '', { timeOut: 6000 });
			} else {
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.options.splice(index + 1, 0, {
					label: switchLabel,
					instanceLabel: switchLabel,
					textLabel: 'xyz',
					selected: false,
					link: false,
					hide: false,
					text: 'Type here!',
					id: newId,
					selectedLinkSection: {},
					linkedStatement: '',
					selectedLinkUi: {},
					linkedUICheck: false,
					linkedStatementCheck: false,
				});
			}
		} else if (type === this.uicomponentTypes.DROPDOWN) {
			let editorLabel = `Option ${len}`;
			editorLabel = this.layoutService.applyEditor(
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj,
				editorLabel,
			);
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options.splice(index + 1, 0, {
				label: editorLabel,
				instanceLabel: editorLabel,
				textLabel: 'Option ' + len,
				link: false,
				id: newId,
				hide: false,
				selected: false,
				showOption: true,
				defaultValue: false,
				selectedLinkSection: {},
				linkedStatement: '',
				selectedLinkUi: {},
				linkedUICheck: false,
				linkedStatementCheck: false,
			});
			this.refreshObject();
			this.changeDetector.detectChanges();
		} else if (type === this.uicomponentTypes.TABLE_DROPDOWN) {
			let editorLabel = `Option ${len}`;
			editorLabel = this.layoutService.applyEditor(
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj,
				editorLabel,
			);
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options.splice(index + 1, 0, {
				label: editorLabel,
				instanceLabel: editorLabel,
				textLabel: 'Option ' + len,
				link: false,
				id: newId,
				hide: false,
				selected: false,
				showOption: true,
				defaultValue: false,
				selectedLinkSection: {},
				linkedStatement: '',
				selectedLinkUi: {},
				linkedUICheck: false,
				linkedStatementCheck: false,
			});
			this.refreshObject();
			this.changeDetector.detectChanges();
		} else if (type == this.uicomponentTypes.INTELLISENSE) {
			let editorLabel = `Option ${len}`;
			editorLabel = this.layoutService.applyEditor(
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj,
				editorLabel,
			);
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options.splice(index + 1, 0, {
				label: editorLabel,
				instanceLabel: editorLabel,
				textLabel: 'Option ' + len,
				link: false,
				id: newId,
				hide: false,
				selected: false,
				showOption: true,
				defaultValue: false,
				selectedLinkSection: {},
				linkedStatement: '',
				selectedLinkUi: {},
				linkedUICheck: false,
				linkedStatementCheck: false,
			});
		}
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options,
		);
		this.editOptionsTs(this.layoutService.lastI, 0);
		this.layoutService.backupId++;
	}
	editedOptions = [];
	editOptionsTs(index, optionIndex, lastK?) {
		this.updateBackUpTask('type', `templateErrors`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(-1, -1, -1, 'template');
		this.updateBackUpTask('oldObject', this.layoutService.templateErrors);
		this.layoutService.templateErrors =
			this.layoutService.templateErrors - this.layoutService.template.sections[index].errors;
		this.updateBackUpTask('newObject', this.layoutService.templateErrors);
		this.layoutService.template.sections[index].errors = 0;
		for (let i: number = 0; i < this.layoutService.template.sections[index].dashboard?.length; i++) {
			if (
				this.layoutService.template.sections[index].dashboard[i].obj.options &&
				this.layoutService.template.sections[index].dashboard[i].obj.options?.length
			) {
				this.layoutService.refreshObject(
					this.layoutService.template.sections[index].dashboard[i].obj,
				);
			}
			if (
				this.layoutService.template.sections[index].dashboard[i].obj.type == this.uicomponentTypes.INTENSITY &&
				this.layoutService.template.sections[index].dashboard[i].obj.isMaxVal
			) {
				this.layoutService.template.sections[index].dashboard[i].obj.isMaxVal = false;
			}
			if (
				this.layoutService.template.sections[index].dashboard[i].obj.type == this.uicomponentTypes.INCREMENT &&
				this.layoutService.template.sections[index].dashboard[i].obj.isMaxVal
			) {
				this.layoutService.template.sections[index].dashboard[i].obj.isMaxVal = false;
			}
			for (
				let j: number = 0;
				this.layoutService.template.sections[index].dashboard[i].obj.options &&
				j < this.layoutService.template.sections[index].dashboard[i].obj.options?.length;
				j++
			) {
				if (
					this.layoutService.template.sections[index].dashboard[i].obj.options[j].errorMessage ==
					true
				) {
					this.layoutService.template.sections[index].dashboard[i].obj.options[j].errorMessage =
						false;
				}
			}
		}
		for (let k: number = 0; k < this.layoutService.template.sections[index].dashboard?.length; k++) {
			this.updateBackUpTask('type', `errors`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(index, k, -1, 'obj');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[index].dashboard[k].obj.errors,
			);
			this.layoutService.template.sections[index].dashboard[k].obj.errors = 0;
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[index].dashboard[k].obj.errors,
			);
			for (
				let i: number = 0;
				this.layoutService.template.sections[index].dashboard[k].obj.options &&
				i < this.layoutService.template.sections[index].dashboard[k].obj.options?.length;
				i++
			) {
				let tempLabel =
					this.layoutService.template.sections[index].dashboard[k].obj.options[i].label;
				this.layoutService.template.sections[index].dashboard[k].obj.options[i].instanceLabel =
					this.layoutService.template.sections[index].dashboard[k].obj.options[i].label;
				for (
					let j = i + 1;
					j < this.layoutService.template.sections[index].dashboard[k].obj.options?.length;
					j++
				) {
					if (
						this.layoutService.template.sections[index].dashboard[k].obj.options[j].label ==
						tempLabel
					) {
						this.layoutService.template.sections[index].dashboard[k].obj.options[j].errorMessage =
							true;
						this.updateBackUpTask('type', `errorMessage`);
						this.updateBackUpTask('id', this.layoutService.backupId);
						this.updateIndexes(-1, -1, -1, 'layoutService');
						this.updateBackUpTask('oldObject', this.layoutService.templateErrors);
						this.layoutService.templateErrors++;
						this.updateBackUpTask('newObject', this.layoutService.templateErrors);
						this.updateBackUpTask('type', `errors`);
						this.updateBackUpTask('id', this.layoutService.backupId);
						this.updateIndexes(index, -1, -1, 'section');
						this.updateBackUpTask('oldObject', this.layoutService.template.sections[index].errors);
						this.layoutService.template.sections[index].errors++;
						this.updateBackUpTask('newObject', this.layoutService.template.sections[index].errors);
						this.updateBackUpTask('type', `errors`);
						this.updateBackUpTask('id', this.layoutService.backupId);
						this.updateIndexes(index, k, -1, 'obj');
						this.updateBackUpTask(
							'oldObject',
							this.layoutService.template.sections[index].dashboard[k].obj.errors,
						);
						this.layoutService.template.sections[index].dashboard[k].obj.errors++;
						this.updateBackUpTask(
							'newObject',
							this.layoutService.template.sections[index].dashboard[k].obj.errors,
						);
						break;
					}
				}
			}
			if (
				this.layoutService.template.sections[index].dashboard[k].obj.type == this.uicomponentTypes.INTENSITY &&
				this.layoutService.template.sections[index].dashboard[k].obj.options.ceil <
					this.layoutService.template.sections[index].dashboard[k].obj.options.floor
			) {
				this.layoutService.template.sections[index].dashboard[k].obj.isMaxVal = true;
				this.updateBackUpTask('type', `errorMessage`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(-1, -1, -1, 'layoutService');
				this.updateBackUpTask('oldObject', this.layoutService.templateErrors);
				this.layoutService.templateErrors++;
				this.updateBackUpTask('newObject', this.layoutService.templateErrors);
				this.updateBackUpTask('type', `errors`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(index, -1, -1, 'section');
				this.updateBackUpTask('oldObject', this.layoutService.template.sections[index].errors);
				this.layoutService.template.sections[index].errors++;
				this.updateBackUpTask('newObject', this.layoutService.template.sections[index].errors);
				this.updateBackUpTask('type', `errors`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(index, k, -1, 'obj');
				this.updateBackUpTask(
					'oldObject',
					this.layoutService.template.sections[index].dashboard[k].obj.errors,
				);
				this.layoutService.template.sections[index].dashboard[k].obj.errors++;
				this.updateBackUpTask(
					'newObject',
					this.layoutService.template.sections[index].dashboard[k].obj.errors,
				);
			}
			if (
				this.layoutService.template.sections[index].dashboard[k].obj.type == this.uicomponentTypes.INCREMENT &&
				this.layoutService.template.sections[index].dashboard[k].obj.options.ceil <
					this.layoutService.template.sections[index].dashboard[k].obj.options.floor
			) {
				this.layoutService.template.sections[index].dashboard[k].obj.isMaxVal = true;
				this.updateBackUpTask('type', `errorMessage`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(-1, -1, -1, 'layoutService');
				this.updateBackUpTask('oldObject', this.layoutService.templateErrors);
				this.layoutService.templateErrors++;
				this.updateBackUpTask('newObject', this.layoutService.templateErrors);
				this.updateBackUpTask('type', `errors`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(index, -1, -1, 'section');
				this.updateBackUpTask('oldObject', this.layoutService.template.sections[index].errors);
				this.layoutService.template.sections[index].errors++;
				this.updateBackUpTask('newObject', this.layoutService.template.sections[index].errors);
				this.updateBackUpTask('type', `errors`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(index, k, -1, 'obj');
				this.updateBackUpTask(
					'oldObject',
					this.layoutService.template.sections[index].dashboard[k].obj.errors,
				);
				this.layoutService.template.sections[index].dashboard[k].obj.errors++;
				this.updateBackUpTask(
					'newObject',
					this.layoutService.template.sections[index].dashboard[k].obj.errors,
				);
			}
		}
	}
	editOptions(index, optionIndex, lastK?) {
		this.updateBackUpTask('type', `templateErrors`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(-1, -1, -1, 'template');
		this.updateBackUpTask('oldObject', this.layoutService.templateErrors);
		this.layoutService.templateErrors =
			this.layoutService.templateErrors - this.layoutService.template.sections[index].errors;
		this.updateBackUpTask('newObject', this.layoutService.templateErrors);
		this.updateBackUpTask('type', `errors`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(index, -1, -1, 'section');
		this.updateBackUpTask('oldObject', this.layoutService.template.sections[index].errors);
		this.layoutService.template.sections[index].errors = 0;
		this.updateBackUpTask('newObject', this.layoutService.template.sections[index].errors);
		for (let i: number = 0; i < this.layoutService.template.sections[index].dashboard?.length; i++) {
			if (
				this.layoutService.template.sections[index].dashboard[i].obj.type == this.uicomponentTypes.INTENSITY &&
				this.layoutService.template.sections[index].dashboard[i].obj.isMaxVal
			) {
				this.updateBackUpTask('type', `isMaxVal`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(index, i, -1, 'obj');
				this.updateBackUpTask(
					'oldObject',
					this.layoutService.template.sections[index].dashboard[i].obj.isMaxVal,
				);
				this.layoutService.template.sections[index].dashboard[i].obj.isMaxVal = false;
				this.updateBackUpTask(
					'newObject',
					this.layoutService.template.sections[index].dashboard[i].obj.isMaxVal,
				);
			}
			if (
				this.layoutService.template.sections[index].dashboard[i].obj.type == this.uicomponentTypes.INCREMENT &&
				this.layoutService.template.sections[index].dashboard[i].obj.isMaxVal
			) {
				this.updateBackUpTask('type', `isMaxVal`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(index, i, -1, 'obj');
				this.updateBackUpTask(
					'oldObject',
					this.layoutService.template.sections[index].dashboard[i].obj.isMaxVal,
				);
				this.layoutService.template.sections[index].dashboard[i].obj.isMaxVal = false;
				this.updateBackUpTask(
					'newObject',
					this.layoutService.template.sections[index].dashboard[i].obj.isMaxVal,
				);
			}
			for (
				let j: number = 0;
				this.layoutService.template.sections[index].dashboard[i].obj.options &&
				j < this.layoutService.template.sections[index].dashboard[i].obj.options?.length;
				j++
			) {
				if (
					this.layoutService.template.sections[index].dashboard[i].obj.options[j].errorMessage ==
					true
				) {
					this.updateBackUpTask('type', `errorMessage`);
					this.updateBackUpTask('id', this.layoutService.backupId);
					this.updateIndexes(index, i, j, 'option');
					this.updateBackUpTask(
						'oldObject',
						this.layoutService.template.sections[index].dashboard[i].obj.options[j].errorMessage,
					);
					this.layoutService.template.sections[index].dashboard[i].obj.options[j].errorMessage =
						false;
					this.updateBackUpTask(
						'newObject',
						this.layoutService.template.sections[index].dashboard[i].obj.options[j].errorMessage,
					);
				}
			}
		}
		for (let k: number = 0; k < this.layoutService.template.sections[index].dashboard?.length; k++) {
			this.updateBackUpTask('type', `errors`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(index, k, -1, 'obj');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[index].dashboard[k].obj.errors,
			);
			this.layoutService.template.sections[index].dashboard[k].obj.errors = 0;
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[index].dashboard[k].obj.errors,
			);
			for (
				let i: number = 0;
				this.layoutService.template.sections[index].dashboard[k].obj.options &&
				i < this.layoutService.template.sections[index].dashboard[k].obj.options?.length;
				i++
			) {
				let tempLabel =
					this.layoutService.template.sections[index].dashboard[k].obj.options[i].label;
				this.layoutService.template.sections[index].dashboard[k].obj.options[i].instanceLabel =
					tempLabel;
				this.layoutService.template.sections[index].dashboard[k].obj.options[i].textLabel =
					this.layoutService.stripHtml(
						this.layoutService.template.sections[index].dashboard[k].obj.options[i].instanceLabel,
					);
				for (
					let j = i + 1;
					j < this.layoutService.template.sections[index].dashboard[k].obj.options?.length;
					j++
				) {
					if (
						this.layoutService.template.sections[index].dashboard[k].obj.options[j].label ==
						tempLabel
					) {
						this.updateBackUpTask('type', `errorMessage`);
						this.updateBackUpTask('id', this.layoutService.backupId);
						this.updateIndexes(index, k, j, 'option');
						this.updateBackUpTask(
							'oldObject',
							this.layoutService.template.sections[index].dashboard[k].obj.options[j].errorMessage,
						);
						this.layoutService.template.sections[index].dashboard[k].obj.options[j].errorMessage =
							true;
						this.updateBackUpTask(
							'newObject',
							this.layoutService.template.sections[index].dashboard[k].obj.options[j].errorMessage,
						);
						this.updateBackUpTask('type', `errorMessage`);
						this.updateBackUpTask('id', this.layoutService.backupId);
						this.updateIndexes(-1, -1, -1, 'layoutService');
						this.updateBackUpTask('oldObject', this.layoutService.templateErrors);
						this.layoutService.templateErrors++;
						this.updateBackUpTask('newObject', this.layoutService.templateErrors);
						this.updateBackUpTask('type', `errors`);
						this.updateBackUpTask('id', this.layoutService.backupId);
						this.updateIndexes(index, -1, -1, 'section');
						this.updateBackUpTask('oldObject', this.layoutService.template.sections[index].errors);
						this.layoutService.template.sections[index].errors++;
						this.updateBackUpTask('newObject', this.layoutService.template.sections[index].errors);
						this.updateBackUpTask('type', `errors`);
						this.updateBackUpTask('id', this.layoutService.backupId);
						this.updateIndexes(index, k, -1, 'obj');
						this.updateBackUpTask(
							'oldObject',
							this.layoutService.template.sections[index].dashboard[k].obj.errors,
						);
						this.layoutService.template.sections[index].dashboard[k].obj.errors++;
						this.updateBackUpTask(
							'newObject',
							this.layoutService.template.sections[index].dashboard[k].obj.errors,
						);
						break;
					}
				}
			}
			if (
				this.layoutService.template.sections[index].dashboard[k].obj.type == this.uicomponentTypes.INTENSITY &&
				this.layoutService.template.sections[index].dashboard[k].obj.options.ceil <
					this.layoutService.template.sections[index].dashboard[k].obj.options.floor
			) {
				this.layoutService.template.sections[index].dashboard[k].obj.isMaxVal = true;
				this.updateBackUpTask('type', `errorMessage`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(-1, -1, -1, 'layoutService');
				this.updateBackUpTask('oldObject', this.layoutService.templateErrors);
				this.layoutService.templateErrors++;
				this.updateBackUpTask('newObject', this.layoutService.templateErrors);
				this.updateBackUpTask('type', `errors`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(index, -1, -1, 'section');
				this.updateBackUpTask('oldObject', this.layoutService.template.sections[index].errors);
				this.layoutService.template.sections[index].errors++;
				this.updateBackUpTask('newObject', this.layoutService.template.sections[index].errors);
				this.updateBackUpTask('type', `errors`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(index, k, -1, 'obj');
				this.updateBackUpTask(
					'oldObject',
					this.layoutService.template.sections[index].dashboard[k].obj.errors,
				);
				this.layoutService.template.sections[index].dashboard[k].obj.errors++;
				this.updateBackUpTask(
					'newObject',
					this.layoutService.template.sections[index].dashboard[k].obj.errors,
				);
			}
			if (
				this.layoutService.template.sections[index].dashboard[k].obj.type == this.uicomponentTypes.INCREMENT &&
				this.layoutService.template.sections[index].dashboard[k].obj.options.ceil <
					this.layoutService.template.sections[index].dashboard[k].obj.options.floor
			) {
				this.layoutService.template.sections[index].dashboard[k].obj.isMaxVal = true;
				this.updateBackUpTask('type', `errorMessage`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(-1, -1, -1, 'layoutService');
				this.updateBackUpTask('oldObject', this.layoutService.templateErrors);
				this.layoutService.templateErrors++;
				this.updateBackUpTask('newObject', this.layoutService.templateErrors);
				this.updateBackUpTask('type', `errors`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(index, -1, -1, 'section');
				this.updateBackUpTask('oldObject', this.layoutService.template.sections[index].errors);
				this.layoutService.template.sections[index].errors++;
				this.updateBackUpTask('newObject', this.layoutService.template.sections[index].errors);
				this.updateBackUpTask('type', `errors`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(index, k, -1, 'obj');
				this.updateBackUpTask(
					'oldObject',
					this.layoutService.template.sections[index].dashboard[k].obj.errors,
				);
				this.layoutService.template.sections[index].dashboard[k].obj.errors++;
				this.updateBackUpTask(
					'newObject',
					this.layoutService.template.sections[index].dashboard[k].obj.errors,
				);
			}
		}
		this.refreshObject();
		this.changeDetector.detectChanges();
		this.layoutService.backupId++;
	}
	public editNameField(type) {
		if (type == 'section') {
			this.editSecName = true;
		} else if (type == 'template') {
			this.editTempName = true;
		}
	}
	deleteUICompOption(type, index) {
		if (
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options?.length > 1
		) {
			for (let x: number = 0; x < this.layoutService.template.sections?.length; x++) {
				for (let r: number = 0; r < this.layoutService.template.sections[x].dashboard?.length; r++) {
					if (
						this.layoutService.template.sections[x].dashboard[r].obj.MultiSelectObj &&
						this.layoutService.template.sections[x].dashboard[r].obj.MultiSelectObj.objectid ==
							this.layoutService.template.sections[this.layoutService.lastI].dashboard[
								this.layoutService.lastK
							].id
					) {
						for (
							let c: number = 0;
							c < this.layoutService.template.sections[x].dashboard[r].obj.options?.length;
							c++
						) {
							if (
								this.layoutService.template.sections[this.layoutService.lastI].dashboard[
									this.layoutService.lastK
								].obj.options[index].id ==
								this.layoutService.template.sections[x].dashboard[r].obj.options[c].id
							) {
								this.updateBackUpTask('type', `options`);
								this.updateBackUpTask('id', this.layoutService.backupId);
								this.updateIndexes(x, r, -1, 'obj');
								this.updateBackUpTask(
									'oldObject',
									this.layoutService.template.sections[x].dashboard[r].obj.options,
								);
								this.layoutService.template.sections[x].dashboard[r].obj.options.splice(c, 1);
								let tempOptions = JSON.parse(
									JSON.stringify(this.layoutService.template.sections[x].dashboard[r].obj.options),
								);
								this.layoutService.template.sections[x].dashboard[r].obj.options = JSON.parse(
									JSON.stringify(tempOptions),
								);
								this.updateBackUpTask(
									'newObject',
									this.layoutService.template.sections[x].dashboard[r].obj.options,
								);
								break;
							}
						}
						for (
							let c: number = 0;
							c < this.layoutService.template.sections[x].dashboard[r].obj.answers?.length;
							c++
						) {
							if (
								this.layoutService.template.sections[this.layoutService.lastI].dashboard[
									this.layoutService.lastK
								].obj.options[index].id ==
								this.layoutService.template.sections[x].dashboard[r].obj.answers[c].id
							) {
								this.updateBackUpTask('type', `answers`);
								this.updateBackUpTask('id', this.layoutService.backupId);
								this.updateIndexes(x, r, -1, 'obj');
								this.updateBackUpTask(
									'oldObject',
									this.layoutService.template.sections[x].dashboard[r].obj.answers,
								);
								this.layoutService.template.sections[x].dashboard[r].obj.answers.splice(c, 1);
								let tempOptions = JSON.parse(
									JSON.stringify(this.layoutService.template.sections[x].dashboard[r].obj.answers),
								);
								this.layoutService.template.sections[x].dashboard[r].obj.answers = JSON.parse(
									JSON.stringify(tempOptions),
								);
								this.updateBackUpTask(
									'newObject',
									this.layoutService.template.sections[x].dashboard[r].obj.answers,
								);
								break;
							}
						}
						for (
							let c: number = 0;
							this.layoutService.template.sections[x].dashboard[r].obj.selectedItems &&
							c < this.layoutService.template.sections[x].dashboard[r].obj.selectedItems?.length;
							c++
						) {
							if (
								this.layoutService.template.sections[this.layoutService.lastI].dashboard[
									this.layoutService.lastK
								].obj.options[index].id ==
								this.layoutService.template.sections[x].dashboard[r].obj.selectedItems[c].id
							) {
								this.updateBackUpTask('type', `selectedItems`);
								this.updateBackUpTask('id', this.layoutService.backupId);
								this.updateIndexes(x, r, -1, 'obj');
								this.updateBackUpTask(
									'oldObject',
									this.layoutService.template.sections[x].dashboard[r].obj.selectedItems,
								);
								this.layoutService.template.sections[x].dashboard[r].obj.selectedItems.splice(c, 1);
								let tempOptions = JSON.parse(
									JSON.stringify(
										this.layoutService.template.sections[x].dashboard[r].obj.selectedItems,
									),
								);
								this.layoutService.template.sections[x].dashboard[r].obj.selectedItems = JSON.parse(
									JSON.stringify(tempOptions),
								);
								this.updateBackUpTask(
									'newObject',
									this.layoutService.template.sections[x].dashboard[r].obj.answers,
								);
								break;
							}
						}
					}
				}
			}
			if (
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.options[index].selectedLinkSection &&
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.options[index].selectedLinkSection.id
			) {
				let i: number = 0;
				for (let section of this.layoutService.template.sections) {
					if (
						section.id ==
						this.layoutService.template.sections[this.layoutService.lastI].dashboard[
							this.layoutService.lastK
						].obj.options[index].selectedLinkSection.id
					) {
						this.updateBackUpTask('type', `linked_component`);
						this.updateBackUpTask('id', this.layoutService.backupId);
						this.updateIndexes(i, -1, -1, 'section');
						this.updateBackUpTask('oldObject', section.linked_component);
						section.linked_component--;
						this.updateBackUpTask('newObject', section.linked_component);
						if (
							this.layoutService.template.sections[this.layoutService.lastI].dashboard[
								this.layoutService.lastK
							].obj.options[index].selected
						) {
							this.updateBackUpTask('type', `selected_linked_component`);
							this.updateBackUpTask('id', this.layoutService.backupId);
							this.updateIndexes(i, -1, -1, 'section');
							this.updateBackUpTask('oldObject', section.selected_linked_component);
							section.selected_linked_component--;
							this.updateBackUpTask('newObject', section.selected_linked_component);
						}
						let currentDepth = section.secNo.split('.')?.length - 1;
						for (let j = i + 1; j < this.layoutService.template.sections?.length; j++) {
							let tempDepth = this.layoutService.template.sections[j].secNo.split('.')?.length - 1;
							if (tempDepth > currentDepth) {
								this.updateBackUpTask('type', `linked_component`);
								this.updateBackUpTask('id', this.layoutService.backupId);
								this.updateIndexes(j, -1, -1, 'section');
								this.updateBackUpTask(
									'oldObject',
									this.layoutService.template.sections[j].linked_component,
								);
								this.layoutService.template.sections[j].linked_component--;
								this.updateBackUpTask(
									'newObject',
									this.layoutService.template.sections[j].linked_component,
								);
								if (
									this.layoutService.template.sections[this.layoutService.lastI].dashboard[
										this.layoutService.lastK
									].obj.options[index].selected
								) {
									this.updateBackUpTask('type', `selected_linked_component`);
									this.updateBackUpTask('id', this.layoutService.backupId);
									this.updateIndexes(j, -1, -1, 'section');
									this.updateBackUpTask(
										'oldObject',
										this.layoutService.template.sections[j].selected_linked_component,
									);
									this.layoutService.template.sections[j].selected_linked_component--;
									this.updateBackUpTask(
										'newObject',
										this.layoutService.template.sections[j].selected_linked_component,
									);
								}
							} else {
								break;
							}
						}
						break;
					}
					i++;
				}
			}
			let tempCheck = false;
			if (
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.options[index].selectedLinkUi &&
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.options[index].selectedLinkUi.id
			) {
				let sectionIndex = -1;
				for (let section of this.layoutService.template.sections) {
					sectionIndex++;
					let dashboardIndex = -1;
					for (let uicomp of section.dashboard) {
						dashboardIndex++;
						if (
							uicomp.obj.uicomponent_name ==
							this.layoutService.template.sections[this.layoutService.lastI].dashboard[
								this.layoutService.lastK
							].obj.options[index].selectedLinkUi.id
						) {
							this.updateBackUpTask('type', `linked_ui`);
							this.updateBackUpTask('id', this.layoutService.backupId);
							this.updateIndexes(sectionIndex, -dashboardIndex, -1, 'obj');
							this.updateBackUpTask('oldObject', uicomp.obj.linked_ui);
							uicomp.obj.linked_ui--;
							this.updateBackUpTask('newObject', uicomp.obj.linked_ui);
							if (
								this.layoutService.template.sections[this.layoutService.lastI].dashboard[
									this.layoutService.lastK
								].obj.options[index].selected
							) {
								this.updateBackUpTask('type', `selected_linked_ui_component`);
								this.updateBackUpTask('id', this.layoutService.backupId);
								this.updateIndexes(sectionIndex, dashboardIndex, -1, 'obj');
								this.updateBackUpTask('oldObject', uicomp.obj.selected_linked_ui_component);
								uicomp.obj.selected_linked_ui_component--;
								this.changeDetector.detectChanges();
								this.updateBackUpTask('newObject', uicomp.obj.selected_linked_ui_component);
							}
							tempCheck = true;
							break;
						}
					}
					if (tempCheck) {
						break;
					}
				}
			}
			for (
				let i: number = 0;
				i <
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.answers?.length;
				i++
			) {
				if (
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[
						this.layoutService.lastK
					].obj.answers[i].answer ==
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[
						this.layoutService.lastK
					].obj.options[index].label
				) {
					this.updateBackUpTask('type', `answers`);
					this.updateBackUpTask('id', this.layoutService.backupId);
					this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
					this.updateBackUpTask(
						'oldObject',
						this.layoutService.template.sections[this.layoutService.lastI].dashboard[
							this.layoutService.lastK
						].obj.answers,
					);
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[
						this.layoutService.lastK
					].obj.answers.splice(i, 1);
					this.updateBackUpTask(
						'newObject',
						this.layoutService.template.sections[this.layoutService.lastI].dashboard[
							this.layoutService.lastK
						].obj.answers,
					);
				}
			}
			this.updateBackUpTask('type', `options`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.options,
			);
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options.splice(index, 1);
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.options,
			);
		}
		if (
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.type == this.uicomponentTypes.DROPDOWN
		) {
			this.refreshObject();
			this.changeDetector.detectChanges();
		}
		this.editOptionsTs(this.layoutService.lastI, 0);
		this.layoutService.updateComponents();
		this.layoutService.backupId++;
	}
	toggleShowOption(index) {
		this.updateBackUpTask('type', `showOption`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, index, 'option');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options[index].showOption,
		);
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.options[index].showOption =
			!this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options[index].showOption;
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options[index].showOption,
		);
		let i = this.layoutService.lastI;
		let j = this.layoutService.lastK;
		this.updateBackUpTask('type', `answers`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[i].dashboard[j].obj.answers,
		);
		this.layoutService.template.sections[i].dashboard[j].obj.answers = [];
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[i].dashboard[j].obj.answers,
		);
		for (
			let k: number = 0;
			k < this.layoutService.template.sections[i].dashboard[j].obj.options?.length;
			k++
		) {
			if (this.layoutService.template.sections[i].dashboard[j].obj.options[k].selected == true) {
				if (
					!this.layoutService.template.sections[i].dashboard[j].obj.options[k].showOption &&
					!this.layoutService.template.sections[i].dashboard[j].obj.options[k]
						.linkedStatementCheck &&
					this.layoutService.template.sections[i].dashboard[j].obj.options[k].input
				) {
					this.updateBackUpTask('type', `answers`);
					this.updateBackUpTask('id', this.layoutService.backupId);
					this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
					this.updateBackUpTask(
						'oldObject',
						this.layoutService.template.sections[i].dashboard[j].obj.answers,
					);
					this.layoutService.template.sections[i].dashboard[j].obj.answers.push({
						answer:
							this.layoutService.template.sections[i].dashboard[j].obj.options[k]
								.instanceInputValue,
						id: k,
					});
					this.updateBackUpTask(
						'newObject',
						this.layoutService.template.sections[i].dashboard[j].obj.answers,
					);
				} else if (
					this.layoutService.template.sections[i].dashboard[j].obj.options[k].linkedStatementCheck
				) {
					let tempAnswer =
						this.layoutService.template.sections[i].dashboard[j].obj.options[k].linkedStatement;
					tempAnswer = this.layoutService.checkSingularPlural(
						this.layoutService.template.sections[i].dashboard[j].obj,
						k,
						tempAnswer,
					);
					tempAnswer = tempAnswer.replace(
						/#input/g,
						this.layoutService.template.sections[i].dashboard[j].obj.options[k].label,
					);
					tempAnswer = tempAnswer.replace(
						/#comments/g,
						this.layoutService.template.sections[i].dashboard[j].obj.options[k].instanceInputValue,
					);
					this.updateBackUpTask('type', `answers`);
					this.updateBackUpTask('id', this.layoutService.backupId);
					this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
					this.updateBackUpTask(
						'oldObject',
						this.layoutService.template.sections[i].dashboard[j].obj.answers,
					);
					this.layoutService.template.sections[i].dashboard[j].obj.answers.push({
						answer: tempAnswer,
						id: k,
					});
					this.updateBackUpTask(
						'newObject',
						this.layoutService.template.sections[i].dashboard[j].obj.answers,
					);
				} else {
					this.updateBackUpTask('type', `answers`);
					this.updateBackUpTask('id', this.layoutService.backupId);
					this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
					this.updateBackUpTask(
						'oldObject',
						this.layoutService.template.sections[i].dashboard[j].obj.answers,
					);
					this.layoutService.template.sections[i].dashboard[j].obj.answers.push({
						answer: this.layoutService.template.sections[i].dashboard[j].obj.options[k].label,
						id: k,
					});
					this.updateBackUpTask(
						'newObject',
						this.layoutService.template.sections[i].dashboard[j].obj.answers,
					);
				}
				if (
					this.layoutService.template.sections[i].dashboard[j].obj.options[k].input &&
					this.layoutService.template.sections[i].dashboard[j].obj.options[k].showOption
				) {
					this.updateBackUpTask('type', `answers`);
					this.updateBackUpTask('id', this.layoutService.backupId);
					this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
					this.updateBackUpTask(
						'oldObject',
						this.layoutService.template.sections[i].dashboard[j].obj.answers,
					);
					this.layoutService.template.sections[i].dashboard[j].obj.answers[
						this.layoutService.template.sections[i].dashboard[j].obj.answers?.length - 1
					].answer =
						this.layoutService.template.sections[i].dashboard[j].obj.answers[
							this.layoutService.template.sections[i].dashboard[j].obj.answers?.length - 1
						].answer +
						' ' +
						this.layoutService.template.sections[i].dashboard[j].obj.options[k].instanceInputValue;
					this.updateBackUpTask(
						'newObject',
						this.layoutService.template.sections[i].dashboard[j].obj.answers,
					);
				}
			}
		}
		this.layoutService.backupId++;
	}
	addUICompInput(index, type) {
		this.invertUIPropertyOptions(
			this.layoutService.lastI,
			this.layoutService.lastK,
			this.uicomponentTypes.INPUT,
			index,
			false,
		);
		if (
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options[index].input
		) {
			this.setUIPropertyOptions(
				this.layoutService.lastI,
				this.layoutService.lastK,
				'showOption',
				true,
				index,
				false,
			);
		}
		this.refreshObject();
		this.layoutService.backupId++;
	}
	addUICompInputCombined() {
		this.combinedComments = !this.combinedComments;
		for (let component of this.selectedComponents) {
			for (
				let index = 0;
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.options &&
				index <
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options?.length;
				index++
			) {
				this.setUIPropertyOptions(
					component.sectionIndex,
					component.dashboardIndex,
					this.uicomponentTypes.INPUT,
					this.combinedComments,
					index,
					false,
				);
				if (
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options[index].input
				) {
					this.setUIPropertyOptions(
						component.sectionIndex,
						component.dashboardIndex,
						'showOption',
						true,
						index,
						false,
					);
				}
				this.layoutService.refreshObject(
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj,
				);
			}
		}
		this.layoutService.backupId++;
	}
	changeCombinedPlaceholder(event) {
		for (let component of this.selectedComponents) {
			for (
				let index = 0;
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.options &&
				index <
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options?.length;
				index++
			) {
				this.setUIPropertyOptions(
					component.sectionIndex,
					component.dashboardIndex,
					'commentsPlaceholder',
					event,
					index,
					false,
				);
			}
			this.layoutService.refreshObject(
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj,
			);
		}
		this.layoutService.backupId++;
	}
	changeCombinedMaxCharLength(event) {
		for (let component of this.selectedComponents) {
			for (
				let index = 0;
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.options &&
				index <
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options?.length;
				index++
			) {
				this.setUIPropertyOptions(
					component.sectionIndex,
					component.dashboardIndex,
					'maxCharLength',
					event,
					index,
					false,
				);
			}
			this.layoutService.refreshObject(
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj,
			);
		}
		this.layoutService.backupId++;
	}
	invertCombinedPropertyRequired() {
		this.combinedCommentsRequired = !this.combinedCommentsRequired;
		for (let component of this.selectedComponents) {
			for (
				let index = 0;
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.options &&
				index <
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options?.length;
				index++
			) {
				this.setUIPropertyOptions(
					component.sectionIndex,
					component.dashboardIndex,
					'is_required',
					this.combinedCommentsRequired,
					index,
					false,
				);
				this.layoutService.refreshObject(
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj,
				);
			}
		}
		this.layoutService.backupId++;
	}
	setCombinedMinLimitOptions(event) {
		this.combinedMinLimitOptions = event;
		for (let component of this.selectedComponents) {
			for (
				let index = 0;
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.options &&
				index <
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options?.length;
				index++
			) {
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.options[index].minLimit = this.combinedMinLimit;
			}
		}
		this.layoutService.backupId++;
	}
	setCombinedMaxLimitOptions(event) {
		this.combinedMaxLimit = event;
		for (let component of this.selectedComponents) {
			for (
				let index = 0;
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.options &&
				index <
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options?.length;
				index++
			) {
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.options[index].maxLimit = this.combinedMaxLimit;
			}
		}
		this.layoutService.backupId++;
	}
	setCombinedDecimalRoundOffOptions() {
		this.combinedDecimalRoundOffOptions = !this.combinedDecimalRoundOffOptions;
		for (let component of this.selectedComponents) {
			for (
				let index = 0;
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.options &&
				index <
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options?.length;
				index++
			) {
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.options[index].decimalRoundOff = this.combinedDecimalRoundOffOptions;
			}
		}
		this.layoutService.backupId++;
	}
	setCombinedDecimalPlacesLimitOptions(event) {
		this.combinedDecimalPlacesLimitOptions = event;
		for (let component of this.selectedComponents) {
			for (
				let index = 0;
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.options &&
				index <
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options?.length;
				index++
			) {
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.options[index].decimalPlacesLimit = this.combinedDecimalPlacesLimitOptions;
			}
		}
		this.layoutService.backupId++;
	}
	setCombinedValidationValueOptions(index) {
		this.combinedValidationValueTypeOptions = this.validationChecks[index];
		for (let component of this.selectedComponents) {
			for (
				let optionIndex = 0;
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.options &&
				optionIndex <
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options?.length;
				optionIndex++
			) {
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.options[optionIndex].validationValue = this.validationChecks[index];
				if (
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options[optionIndex].validationValue.value == 'Date'
				) {
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options[optionIndex].formatValue = {
						slug: 'MM/DD/YYYY',
						value: 'MM/DD/YYYY',
					};
				}
				if (
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options[optionIndex].validationValue.value == 'Datetime'
				) {
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options[optionIndex].formatValue = {
						slug: 'MM/DD/YYYYTHH:mm',
						value: 'MM/DD/YYYY 24 hour',
					};
				}
				if (
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options[optionIndex].validationValue.value == 'Time'
				) {
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options[optionIndex].formatValue = {
						slug: 'HH:mm',
						value: '24 hour',
					};
				}
				this.setUIPropertyOptions(
					component.sectionIndex,
					component.dashboardIndex,
					'maxLimit',
					'',
					optionIndex,
					false,
				);
				this.setUIPropertyOptions(
					component.sectionIndex,
					component.dashboardIndex,
					'minLimit',
					'',
					optionIndex,
					false,
				);
				this.combinedMaxLimitOptions = '';
				this.combinedMinLimitOptions = '';
				if (
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options[optionIndex].errors
				) {
					this.removeErrorsOption(component.sectionIndex, component.dashboardIndex, optionIndex);
				}
			}
		}
		this.calculateCalculationFields();
		this.changeDetector.detectChanges();
		this.layoutService.backupId++;
	}
	setCombinedDateFormatValueOptions(index) {
		this.combinedDateFormatValueOptions = index;
		for (let component of this.selectedComponents) {
			for (
				let optionIndex = 0;
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.options &&
				optionIndex <
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options?.length;
				optionIndex++
			) {
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.options[optionIndex].formatValue = index;
			}
		}
		this.changeDetector.detectChanges();
		this.layoutService.backupId++;
	}
	deleteCombinedValidationValueOptions() {
		this.combinedValidationValueType = {};
		for (let component of this.selectedComponents) {
			for (
				let optionIndex = 0;
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.options &&
				optionIndex <
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options?.length;
				optionIndex++
			) {
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.options[optionIndex].validationValue = {};
			}
		}
		this.layoutService.backupId++;
	}
	invertInputMinMaxCombined() {
		this.combinedMinMaxCheck = !this.combinedMinMaxCheck;
		for (let component of this.selectedComponents) {
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.minMaxCheck = this.combinedMinMaxCheck;
			if (
				!this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj[`minMaxCheck`]
			) {
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj[`minLimit`] = '';
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj[`maxLimit`] = '';
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj[`placeholder`] = '';
			}
		}
		this.layoutService.backupId++;
	}
	invertInputMinMaxCombinedOptions() {
		this.combinedMinMaxCheckOptions = !this.combinedMinMaxCheckOptions;
		for (let component of this.selectedComponents) {
			for (
				let optionIndex = 0;
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.options &&
				optionIndex <
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options?.length;
				optionIndex++
			) {
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.options[optionIndex].minMaxCheck = this.combinedMinMaxCheckOptions;
				if (
					!this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options[optionIndex][`minMaxCheck`]
				) {
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options[optionIndex][`minLimit`] = '';
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options[optionIndex][`maxLimit`] = '';
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options[optionIndex][`placeholder`] = '';
				}
			}
		}
		this.layoutService.backupId++;
	}
	setCombinedValidationCheckOptions() {
		this.combinedValidationCheckOptions = !this.combinedValidationCheckOptions;
		for (let component of this.selectedComponents) {
			for (
				let optionIndex = 0;
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.options &&
				optionIndex <
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options?.length;
				optionIndex++
			) {
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.options[optionIndex].validationCheck = this.combinedValidationCheckOptions;
				if (
					!this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options[optionIndex].validationCheck
				) {
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options[optionIndex].validationValue = {};
				}
				this.setUIPropertyOptions(
					component.sectionIndex,
					component.dashboardIndex,
					'maxLimit',
					'',
					optionIndex,
					false,
				);
				this.setUIPropertyOptions(
					component.sectionIndex,
					component.dashboardIndex,
					'minLimit',
					'',
					optionIndex,
					false,
				);
				this.combinedMaxLimit = '';
				this.combinedMinLimit = '';
				if (
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options[optionIndex].errors
				) {
					this.removeErrorsOption(component.sectionIndex, component.dashboardIndex, optionIndex);
				}
			}
		}
		this.calculateCalculationFields();
		this.layoutService.backupId++;
	}
	public setNumberValueCombinedOptions(e) {
		for (let component of this.selectedComponents) {
			for (
				let optionIndex = 0;
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.options &&
				optionIndex <
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options?.length;
				optionIndex++
			) {
				if (
					!this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options[optionIndex].minLimit
				) {
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options[optionIndex].minLimit = '';
				} else {
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options[optionIndex].minLimit =
						this.layoutService.template.sections[component.sectionIndex].dashboard[
							component.dashboardIndex
						].obj.options[optionIndex].minLimit;
				}
				if (
					!this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options[optionIndex].maxLimit
				) {
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options[optionIndex].maxLimit = '';
				} else {
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.options[optionIndex].minLimit =
						this.layoutService.template.sections[component.sectionIndex].dashboard[
							component.dashboardIndex
						].obj.options[optionIndex].minLimit;
				}
				if (
					parseInt(
						this.layoutService.template.sections[component.sectionIndex].dashboard[
							component.dashboardIndex
						].obj.options[optionIndex].maxLimit,
					) <
					parseInt(
						this.layoutService.template.sections[component.sectionIndex].dashboard[
							component.dashboardIndex
						].obj.options[optionIndex].minLimit,
					)
				) {
					if (
						!this.layoutService.template.sections[component.sectionIndex].dashboard[
							component.dashboardIndex
						].obj.options[optionIndex].isMaxVal
					) {
						this.layoutService.template.sections[component.sectionIndex].dashboard[
							component.dashboardIndex
						].obj.options[optionIndex].isMaxVal = true;
						this.updateBackUpTask('type', `errorMessage`);
						this.updateBackUpTask('id', this.layoutService.backupId);
						this.updateIndexes(-1, -1, -1, 'layoutService');
						this.updateBackUpTask('oldObject', this.layoutService.templateErrors);
						this.layoutService.templateErrors++;
						this.updateBackUpTask('newObject', this.layoutService.templateErrors);
						this.layoutService.template.sections[this.layoutService.lastI].errors++;
						this.layoutService.template.sections[component.sectionIndex].dashboard[
							component.dashboardIndex
						].obj.options[optionIndex].errors++;
					}
				} else {
					if (
						this.layoutService.template.sections[component.sectionIndex].dashboard[
							component.dashboardIndex
						].obj.options[optionIndex].isMaxVal
					) {
						this.layoutService.template.sections[component.sectionIndex].dashboard[
							component.dashboardIndex
						].obj.options[optionIndex].isMaxVal = false;
						this.updateBackUpTask('type', `errorMessage`);
						this.updateBackUpTask('id', this.layoutService.backupId);
						this.updateIndexes(-1, -1, -1, 'layoutService');
						this.updateBackUpTask('oldObject', this.layoutService.templateErrors);
						this.layoutService.templateErrors--;
						this.updateBackUpTask('newObject', this.layoutService.templateErrors);
						this.layoutService.template.sections[this.layoutService.lastI].errors--;
						this.layoutService.template.sections[component.sectionIndex].dashboard[
							component.dashboardIndex
						].obj.options[optionIndex].errors--;
					}
				}
			}
		}
		this.layoutService.backupId++;
	}
	trackByFn(index, item) {
		return index;
	}
	trackBySectionId(index, dashboard) {
		return dashboard.id;
	}
	itemDeleteHover(item) {
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].hover = true;
	}
	hoverOut(item) {
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].hover = false;
	}
	itemDeleteHoverRow(item) {
		for (
			let i: number = 0;
			i < this.layoutService.template.sections[this.layoutService.lastI].dashboard?.length;
			i++
		) {
			if (
				item.y === this.layoutService.template.sections[this.layoutService.lastI].dashboard[i].y
			) {
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[i].hover = true;
			} else if (
				item.y > this.layoutService.template.sections[this.layoutService.lastI].dashboard[i].y &&
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[i].rows +
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[i].y >
					item.y
			) {
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[i].hover = true;
			}
		}
	}
	hoverOutRow(item) {
		for (
			let i: number = 0;
			i < this.layoutService.template.sections[this.layoutService.lastI].dashboard?.length;
			i++
		) {
			if (
				item.y === this.layoutService.template.sections[this.layoutService.lastI].dashboard[i].y
			) {
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[i].hover = false;
			} else if (
				item.y > this.layoutService.template.sections[this.layoutService.lastI].dashboard[i].y &&
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[i].rows +
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[i].y >
					item.y
			) {
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[i].hover = true;
			}
		}
	}
	setDropId(dropId: string): void {
		this.dropId = dropId;
	}
	dropItem(dragId: string): void {
		this.dragItem = dragId;
		if (dragId === this.uicomponentTypes.TEXT) {
			this.uiObject = this.textObject;
		} else if (dragId === this.uicomponentTypes.INPUT) {
			this.uiObject = this.inputObject;
		} else if (dragId === this.uicomponentTypes.RADIO) {
			this.uiObject = this.radioObject;
		} else if (dragId === this.uicomponentTypes.CHECKBOX) {
			this.uiObject = this.checkboxObject;
		} else if (dragId === this.uicomponentTypes.SWITCH) {
			this.uiObject = this.switchObj;
		} else if (dragId === this.uicomponentTypes.DROPDOWN) {
			this.uiObject = this.dropDownObj;
		} else if (dragId === this.uicomponentTypes.INTENSITY) {
			this.uiObject = this.intensityObj;
		} else if (dragId === this.uicomponentTypes.INCREMENT) {
			this.uiObject = this.incrementObj;
		} else if (dragId === this.uicomponentTypes.DRAWING) {
			this.uiObject = this.drawingObj;
		} else if (dragId === this.uicomponentTypes.CALCULATION) {
			this.uiObject = this.calculationObj;
		} else if (dragId === this.uicomponentTypes.IMAGE_LABEL) {
			this.uiObject = this.imageObject;
		} else if (dragId === this.uicomponentTypes.SIMPLE_IMAGE) {
			this.uiObject = this.simpleImageObject;
		} else if (dragId === this.uicomponentTypes.INTELLISENSE) {
			this.uiObject = this.intellisenseObject;
		} else if (dragId === this.uicomponentTypes.LINE) {
			this.uiObject = this.lineObject;
		} else if (dragId === this.uicomponentTypes.SIGNATURE) {
			this.uiObject = this.signatureObject;
		} else if (dragId === this.uicomponentTypes.TABLE_DROPDOWN) {
			this.uiObject = this.tableDropDownObj;
		}
		this.sectionDragStart = null;
	}
	getComponentRef(id: string) {
		const comp = this.componentsService.find((c) => c.id === id);
		return comp ? comp.componentRef : null;
	}
	public addTemplate() {
		let checkNew = false;
		if (!this.layoutService.template.sections) {
			for (let section of this.layoutService.template.sections) {
				section['carrySections'] = [];
			}
		}
		if (this.layoutService.templateErrors) {
			this.toastrService.error(
				'Template cannot be saved with errors. Please remove all existing errors!',
				'',
				{ timeOut: 6000 },
			);
			return;
		}
		this.layoutService.template.boundTemplateStatement =
			this.layoutService.template.boundTemplateStatement.replace(/<\/?[^>]+(>|$)/g, '');
		this.layoutService.template.boundTemplateStatement =
			this.layoutService.template.boundTemplateStatement.replace(/\&nbsp;/g, ' ');
		this.layoutService.template.boundTemplateStatement =
			this.layoutService.template.boundTemplateStatement.trim();
		if (!this.layoutService.template.boundTemplateStatement?.length) {
			this.toastrService.error('Template name is required!', '', { timeOut: 6000 });
			return;
		}
		this.layoutService.isLoaderPending.next(true);
		let dummytemplate = cloneDeep(this.layoutService.template);
		for (let i: number = 0; i < dummytemplate?.sections?.length; i++) {
			for (let j: number = 0; j < dummytemplate?.sections[i]?.dashboard?.length; j++) {
				if (dummytemplate.sections[i].dashboard[j].obj.type == this.uicomponentTypes.TEXT) {
					dummytemplate.sections[i].dashboard[j].obj.statement = dummytemplate.sections[
						i
					].dashboard[j].obj.statement.replace(/&nbsp;/g, ' ');
				}
				if (
					dummytemplate.sections[i].dashboard[j].obj.type == this.uicomponentTypes.INTENSITY ||
					dummytemplate.sections[i].dashboard[j].obj.type == this.uicomponentTypes.INCREMENT
				) {
					dummytemplate.sections[i].dashboard[j].obj.value =
						dummytemplate.sections[i].dashboard[j].obj.options.floor;
				}
				if(dummytemplate?.sections[i]?.dashboard[j]?.obj?.type == this.uicomponentTypes.SIGNATURE){
					dummytemplate.sections[i].dashboard[j].obj['signature']=null
					dummytemplate.sections[i].dashboard[j].obj['signature_id']=null
					dummytemplate.sections[i].dashboard[j].obj['signaturePoints']=null
					dummytemplate.sections[i].dashboard[j].obj['signaturelink']=null

				}
				if (this.uicomponentTypes.INPUT in dummytemplate.sections[i].dashboard[j].obj) {
					dummytemplate.sections[i].dashboard[j].obj.input = '';
				}
				if ('defaultChecked' in dummytemplate.sections[i].dashboard[j].obj) {
					dummytemplate.sections[i].dashboard[j].obj.defaultChecked = false;
				}
				if (dummytemplate.sections[i].dashboard[j].obj.answers) {
					if (dummytemplate.sections[i].dashboard[j].obj.answers) {
						dummytemplate.sections[i].dashboard[j].obj.answers = [];
					}
				}
				if (dummytemplate.sections[i].dashboard[j].obj?.options?.length) {
					for (
						let k: number = 0;
						k < dummytemplate.sections[i].dashboard[j].obj.options?.length;
						k++
					) {
						dummytemplate.sections[i].dashboard[j].obj.options[k].selected = false;
					}
				}
			}
		}
		dummytemplate['user_id'] = this.storageData.getUserId();
		let basicInfo = this.storageData.getBasicInfo();
		dummytemplate['user_name'] = basicInfo.middle_name
			? basicInfo.first_name + ' ' + basicInfo.middle_name + ' ' + basicInfo.last_name
			: basicInfo.first_name + ' ' + basicInfo.last_name;
		this.requestService
			.sendRequest(
				TemaplateManagerUrlsEnum.addTemplate,
				'POST',
				REQUEST_SERVERS.templateManagerUrl,
				dummytemplate,
			)
			.subscribe(
				(res: any) => {
					this.templateSaved = true;
					this.toastrService.success(res.message, 'Success', { timeOut: 6000 });
					this.emptySelectedComponents();
					this.layoutService.template.carryNewDeleted = [];
					this.layoutService.template.carryOriginalDeleted = [];
					this.layoutService.template.template_id = res.data[0].template_id;
					for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
						this.layoutService.template.sections[i].section_id = res.data[0].sections[i].section_id;
						for (
							let j: number = 0;
							j < this.layoutService.template.sections[i].dashboard?.length;
							j++
						) {
							this.layoutService.template.sections[i].dashboard[j].uicomponent_id =
								res.data[0].sections[i].dashboard[j].uicomponent_id;
						}
					}
					this.stopLoader();
				},
				(err) => {
					console.log(err);
					this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
					this.stopLoader();
				},
			);
	}
	public saveNewTemplate() {
		if (this.layoutService.templateErrors) {
			this.toastrService.error(
				'Template cannot be saved with errors. Please remove all existing errors!',
				'',
				{ timeOut: 6000 },
			);
			return;
		}
		this.bsModalRef = this.modalServiceDialog.show(ConfirmationDialogComponent, {
			initialState: {
			  message: 'Please enter template name',
			  addInput: true,
			},
			class: 'modal-dialog-centered'
		  });
		  this.bsModalRef.content.result
		// this.coolDialogs.prompt('Please enter template name')
		.subscribe((response) => {
			if (response['result']) {
				this.layoutService.template.boundTemplateStatement = response['result'];
				this.layoutService.template.boundTemplateStatement =
					this.layoutService.template.boundTemplateStatement.replace(/<\/?[^>]+(>|$)/g, '');
				this.layoutService.template.boundTemplateStatement =
					this.layoutService.template.boundTemplateStatement.replace(/\&nbsp;/g, ' ');
				this.layoutService.template.boundTemplateStatement =
					this.layoutService.template.boundTemplateStatement.trim();
				this.layoutService.template.template_name =
					this.layoutService.template.boundTemplateStatement;
				delete this.layoutService.template['template_id'];
				for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
					this.layoutService.template.sections[i]['carrySections'] = [];
					delete this.layoutService.template.sections[i]['section_id'];
					for (
						let j: number = 0;
						j < this.layoutService.template.sections[i].dashboard?.length;
						j++
					) {
						if ('defaultChecked' in this.layoutService.template.sections[i].dashboard[j].obj) {
							this.layoutService.template.sections[i].dashboard[j].obj.defaultChecked = false;
						}
						if (this.layoutService.template.sections[i].dashboard[j].obj.type == this.uicomponentTypes.TEXT) {
							this.layoutService.template.sections[i].dashboard[j].obj.statement =
								this.layoutService.template.sections[i].dashboard[j].obj.statement.replace(
									/&nbsp;/g,
									' ',
								);
						}
						if(this.layoutService.template.sections[i].dashboard[j].obj.type == this.uicomponentTypes.SIGNATURE){
							this.layoutService.template.sections[i].dashboard[j].obj.signature=null
							this.layoutService.template.sections[i].dashboard[j].obj.signature_id=null
							this.layoutService.template.sections[i].dashboard[j].obj.signaturePoints=null
							this.layoutService.template.sections[i].dashboard[j].obj.signaturelink=null
						}
						delete this.layoutService.template.sections[i].dashboard[j]['uicomponent_id'];
					}
				}
				this.layoutService.template['user_id'] = this.storageData.getUserId();
				let basicInfo = this.storageData.getBasicInfo();
				this.layoutService.template['user_name'] = basicInfo.middle_name
					? basicInfo.first_name + ' ' + basicInfo.middle_name + ' ' + basicInfo.last_name
					: basicInfo.first_name + ' ' + basicInfo.last_name;
				this.emptySelectedComponents();
				this.layoutService.template.carryNewDeleted = [];
				this.layoutService.template.carryOriginalDeleted = [];
				this.changeDetector.detectChanges();
				this.requestService
					.sendRequest(
						TemaplateManagerUrlsEnum.addTemplate,
						'POST',
						REQUEST_SERVERS.templateManagerUrl,
						this.layoutService.template,
					)
					.subscribe(
						(res: any) => {
							this.templateSaved = true;
							this.toastrService.success(res.message, 'Success', { timeOut: 6000 });
							delete this.layoutService.template['user_name'];
							this.layoutService.template.template_id = res.data[0].template_id;
							for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
								this.layoutService.template.sections[i].section_id =
									res.data[0].sections[i].section_id;
								for (
									let j: number = 0;
									j < this.layoutService.template.sections[i].dashboard?.length;
									j++
								) {
									this.layoutService.template.sections[i].dashboard[j].uicomponent_id =
										res.data[0].sections[i].dashboard[j].uicomponent_id;
								}
							}
						},
						(err) => {
							console.log(err);
							this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
							this.stopLoader();
						},
					);
			} else {
				return;
			}
		});
	}
	public selectSearchType(event) {
		this.searchType = event.target.value;
	}
	public search(check?, t_s?) {
		if (check) {
			this.offset += 10;
		} else {
			this.offset = 0;
		}
		this.showSideSections = false;
		let usersIds: Array<number> = [];
		for (let i: number = 0; i < this.selectedUsers?.length; i++) {
			usersIds.push(this.selectedUsers[i].id);
		}
		if (usersIds?.length == 0) {
			usersIds = [-1, -2];
		}
		const obj = {
			type: this.searchType,
			searchParams: this.searchParam,
			user_id: this.storageData.getUserId(),
			offset: this.offset,
			users_array: usersIds,
		};
		if (t_s) {
			obj['type'] = t_s;
		}
		this.requestService
			.sendRequest(TemaplateManagerUrlsEnum.search, 'POST', REQUEST_SERVERS.templateManagerUrl, obj)
			.subscribe(
				(res: any) => {
					if (!check) {
						this.searchSections = [];
						this.searchTemplate = [];
					}
					if (res.data[0].templates?.length < 10 && (!t_s || t_s == 'template')) {
						this.templateShowMore = false;
					} else {
						this.templateShowMore = true;
					}
					if (res.data[0].sections?.length < 10 && (!t_s || t_s == 'section')) {
						this.sectionShowMore = false;
					} else {
						this.sectionShowMore = true;
					}
					this.changeDetector.detectChanges();
					this.searchTemplate = this.searchTemplate.concat(res.data[0].templates);
					this.searchSections = this.searchSections.concat(res.data[0].sections);
					for (let i: number = 0; i < this.searchTemplate?.length; i++) {
						this.searchTemplate[i].updated_at = convertDateTimeForRetrieving(
							this.storageData,
							new Date(this.searchTemplate[i].updated_at),
						);
						this.searchTemplate[i].updated_at =
							this.searchTemplate[i].updated_at.toLocaleString('en-US');
					}
					for (let i: number = 0; i < this.searchSections?.length; i++) {}
					this.changeDetector.markForCheck();
				},
				(err) => {
					console.log(err);
					this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
					this.stopLoader();
				},
			);
	}
	public applyTemplate(templateId, userId, index, search) {
		this.layoutService.isLoaderPending.next(true);
		const obj = {
			template_id: parseInt(templateId),
		};
		this.applyTempId = parseInt(templateId);
		this.requestService
			.sendRequest(
				TemaplateManagerUrlsEnum.getSectionsByTemplate,
				'POST',
				REQUEST_SERVERS.templateManagerUrl,
				obj,
			)
			.subscribe(
				(res: any) => {
					this.layoutService.templateErrors = 0;
					this.sectionCreated = true;
					this.currentTemplate = cloneDeep(res.data);
					let changeKeywords = [];
					for (
						let t: number = 0;
						this.layoutService.template['mappingKeyWords'] &&
						t < this.layoutService.template['mappingKeyWords']?.length;
						t++
					) {
						for (let i: number = 0; i < res.template[0]['mappingKeyWords']?.length; i++) {
							if (
								this.layoutService.template['mappingKeyWords'][t].slug ==
									res.template[0]['mappingKeyWords'][i].slug &&
								this.layoutService.template['mappingKeyWords'][t].tag !=
									res.template[0]['mappingKeyWords'][i].tag
							) {
								changeKeywords.push({
									new: this.layoutService.template['mappingKeyWords'][t],
									old: res.template[0]['mappingKeyWords'][i],
								});
							}
						}
					}
					let tempObj = JSON.stringify(this.currentTemplate);
					for (let z: number = 0; z < changeKeywords?.length; z++) {
						let replace = changeKeywords[z].old.tag;
						let re = new RegExp(replace, 'g');
						tempObj = tempObj.replace(re, changeKeywords[z].new.tag);
					}
					this.currentTemplate = JSON.parse(tempObj);
					this.layoutService.template.sections = [];
					this.emptySelectedComponents();
					this.layoutService.template.carryNewDeleted = [];
					this.layoutService.template.carryOriginalDeleted = [];
					let maxcount: number = 0;
					this.layoutService.template.public = res.template[0].public;
					this.layoutService.template.shared = res.template[0].shared;
					this.layoutService.template.allExternalSlugs = res.template[0].allExternalSlugs;
					for (
						let slugIndex: number = 0;
						slugIndex < this.layoutService.template.allExternalSlugs?.length;
						slugIndex++
					) {
						for (let slug of this.allExternalSlugs) {
							if (slug.slug == this.layoutService.template.allExternalSlugs[slugIndex].slug) {
								let temp = JSON.parse(JSON.stringify(slug));
								temp.selectedUI =
									this.layoutService.template.allExternalSlugs[slugIndex].selectedUI;
								temp.addedFields =
									this.layoutService.template.allExternalSlugs[slugIndex].addedFields;
								temp.onDeselect =
									this.layoutService.template.allExternalSlugs[slugIndex].onDeselect;
								this.layoutService.template.allExternalSlugs[slugIndex] = JSON.parse(
									JSON.stringify(temp),
								);
							}
						}
					}
					this.selectedExternalSlug = res.template[0].allExternalSlugs[0];
					this.layoutService.template.template_id = parseInt(templateId);
					this.layoutService.template.tags = res.template[0].tags;
					this.layoutService.template.boundTemplateStatement =
						res.template[0].boundTemplateStatement;
					this.layoutService.template.pageSize = res.template[0].pageSize;
					this.layoutService.template.pdfMarginTop = res.template[0].pdfMarginTop;
					this.layoutService.template.pdf_type = res.template[0].pdf_type;
					this.layoutService.template.pdfMarginBottom = res.template[0].pdfMarginBottom;
					this.layoutService.template.pdfMarginLeft = res.template[0].pdfMarginLeft;
					this.layoutService.template.pdfMarginRight = res.template[0].pdfMarginRight;
					this.layoutService.template.uiCompIds = res.template[0].uiCompIds;
					this.layoutService.template.backgroundColor = res.template[0].backgroundColor;
					this.layoutService.template.bgColor = res.template[0].bgColor;
					this.layoutService.template.bottomUIBorder = res.template[0].bottomUIBorder;
					this.layoutService.template.bottomUIPadding = res.template[0].bottomUIPadding;
					this.layoutService.template.fontColor = res.template[0].fontColor;
					this.layoutService.template.fontColorCode = res.template[0].fontColorCode;
					this.layoutService.template.fontFamily = res.template[0].fontFamily;
					this.layoutService.template.fontFamilyValue = res.template[0].fontFamilyValue;
					this.layoutService.template.leftUIBorder = res.template[0].leftUIBorder;
					this.layoutService.template.leftUIPadding = res.template[0].leftUIPadding;
					this.layoutService.template.lineSpacing = res.template[0].lineSpacing;
					this.layoutService.template.lineSpacingValue = res.template[0].lineSpacingValue;
					this.layoutService.template.rightUIBorder = res.template[0].rightUIBorder;
					this.layoutService.template.rightUIPadding = res.template[0].rightUIPadding;
					this.layoutService.template.topUIBorder = res.template[0].topUIBorder;
					this.layoutService.template.topUIPadding = res.template[0].topUIPadding;
					this.layoutService.template.uiBorders = res.template[0].uiBorders;
					this.layoutService.template.uiPaddings = res.template[0].uiPaddings;
					this.layoutService.template.hideTemplateName = res.template[0].hideTemplateName;
					for (let i: number = 0; i < this.layoutService.template.allExternalSlugs?.length; i++) {
						for (let j: number = 0; j < this.allExternalSlugs?.length; j++) {
							if (
								this.layoutService.template.allExternalSlugs[i].slug ==
								this.allExternalSlugs[j].slug
							) {
								this.allExternalSlugs[j] = JSON.parse(
									JSON.stringify(this.layoutService.template.allExternalSlugs[i]),
								);
								break;
							}
						}
					}
					let tempName = '';
					tempName = res.template[0].template_name;
					this.layoutService.template.template_name = tempName;
					for (let i: number = 0; i < this.currentTemplate?.length; i++) {
						if (this.currentTemplate[i].section_id > maxcount) {
							maxcount = this.currentTemplate[i].section_id;
						}
						this.currentTemplate[i].id = this.currentTemplate[i].section_id;
						for (let x: number = 0; x < this.currentTemplate[i].dashboard?.length; x++) {
							this.componentsService.push({
								id: this.currentTemplate[i].dashboard[x].id,
								componentRef: this.currentTemplate[i].dashboard[x].obj.type,
							});
							if (this.uicomponentTypes.INPUT in this.currentTemplate[i].dashboard[x].obj) {
								this.currentTemplate[i].dashboard[x].obj.input =
									this.currentTemplate[i].dashboard[x].obj.defaultValue || '';
							}
							if (this.currentTemplate[i].dashboard[x].obj.MultiSelectObj) {
								this.currentTemplate[i].dashboard[x].obj.options = [];
								this.currentTemplate[i].dashboard[x].obj.answers = [];
							}
							if (this.currentTemplate[i].dashboard[x].obj.answers) {
								this.currentTemplate[i].dashboard[x].obj.answers = [];
							}
						}
						this.layoutService.template.sections.push(this.currentTemplate[i]);
						for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
							this.layoutService.collapseSectionIndex[
								`${this.layoutService.template.sections[i].section_id}`
							] = false;
							for (
								let j: number = 0;
								j < this.layoutService.template.sections[i].dashboard?.length;
								j++
							) {
								if (
									!isNil(this.layoutService.template.sections[i].dashboard[j].obj.preDefinedObj)
								) {
									this.layoutService.lastI = i;
									this.layoutService.lastK = j;
									this.preDefindSelect({
										target: {
											value:
												this.layoutService.template.sections[i].dashboard[j].obj.preDefinedObj.id,
										},
									});
								}
							}
						}
					}
					this.templateSaved = true;
					// if (this.storageData.getUserId() != userId) {
					// 	this.templateSaved = false;
					// 	delete this.layoutService.template.template_id;
					// 	for (let i: number = 0; i < this.layoutService.template.sections.length; i++) {
					// 		delete this.layoutService.template.sections[i].section_id;
					// 		this.layoutService.template.sections[i].carrySections = [];
					// 		for (
					// 			let j: number = 0;
					// 			j < this.layoutService.template.sections[i].dashboard.length;
					// 			j++
					// 		) {
					// 			delete this.layoutService.template.sections[i].dashboard[j].uicomponent_id;
					// 		}
					// 	}
					// }
					this.layoutService.lastI = 0;
					this.layoutService.lastK = 0;
					this.totalSection = maxcount + 1;
					if (document.getElementById('middle-scroll')) {
						let elmnt = document.getElementById('middle-scroll');
						elmnt.scrollTop = 0;
						this.layoutService.scroll = '';
					}
					this.sectionToList();
					this.resetSectionNumbers();
					this.removeCollapsePropertiesTab();
					this.setPropertiesTab('showTemplateProperties');
					this.setCollapsePropertiesTab('showTemplateProperties');
					this.GetHeightValue();
					this.refreshGridster();
					this.stopLoader();
					this.toastrService.success('Template loaded successfully', 'Success', { timeOut: 6000 });
				},
				(err) => {
					console.log(err);
					this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
					this.stopLoader();
				},
			);
	}
	public templateName: string = '';
	public templateIndex: number = null;
	public viewTemplate(templateId, index, temp_Name) {
		this.templateIndex = index;
		this.templateName = temp_Name;
		const obj = {
			template_id: parseInt(templateId),
		};
		this.requestService
			.sendRequest(
				TemaplateManagerUrlsEnum.getSectionsByTemplate,
				'POST',
				REQUEST_SERVERS.templateManagerUrl,
				obj,
			)
			.subscribe(
				(res: any) => {
					this.sectionCreated = true;
					this.currentTemplate = cloneDeep(res.data);
					this.layoutService.templateSections = [];
					for (let i: number = 0; i < this.currentTemplate?.length; i++) {
						this.currentTemplate[i].section_template = parseInt(templateId);
						this.layoutService.templateSections.push(this.currentTemplate[i]);
						for (let x: number = 0; x < this.currentTemplate[i].dashboard?.length; x++) {
							this.componentsService.push({
								id: this.currentTemplate[i].dashboard[x].id,
								componentRef: this.currentTemplate[i].dashboard[x].obj.type,
							});
						}
					}
					this.sectionToList();
					this.refreshGridster();
				},
				(err) => {
					console.log(err);
					this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
					this.stopLoader();
				},
			);
	}
	public refreshGridster() {
		for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
			this.layoutService.template.sections[i].options = {
				gridType: GridType.VerticalFixed,
				displayGrid: DisplayGrid.Always,
				setGridSize: true,
				pushItems: true,
				fixedRowHeight: 100,
				fixedColWidth: 750 / this.layoutService.template.default_columns,
				disableScrollVertical: true,
				disableScrollHorizontal: true,
				swap: true,
				minCols: this.layoutService.template.sections[i].options.minCols,
				maxCols: this.layoutService.template.sections[i].options.maxCols,
				maxRows: this.layoutService.template.sections[i].options.maxRows,
				minRows: this.layoutService.template.sections[i].options.minRows,
				keepFixedWidthInMobile: true,
				keepFixedHeightInMobile: true,
				enableEmptyCellContextMenu: true,
				enableEmptyCellClick: true,
				enableEmptyCellDrop: true,
				enableEmptyCellDrag: true,
				enableOccupiedCellDrop: true,
				emptyCellClickCallback: this.emptyCellClick.bind(this),
				emptyCellContextMenuCallback: this.emptyCellClick.bind(this),
				emptyCellDropCallback: this.emptyCellClick.bind(this),
				emptyCellDragCallback: this.emptyCellClick.bind(this),
				swapWhileDragging: false,
				margin: 0,
				draggable: this.layoutService.template.sections[i].options.draggable,
				resizable: this.layoutService.template.sections[i].options.resizable,
			};
		}
		this.changeDetector.markForCheck();
	}
	public viewCFSection: any;
	viewOriginalCFSection(index, id) {
		this.viewCFSection = {};
		const obj = {
			section_id: parseInt(this.layoutService.template.sections[index].carryForward.sectionId),
		};
		this.requestService
			.sendRequest(
				TemaplateManagerUrlsEnum.getCarryforwardSection,
				'POST',
				REQUEST_SERVERS.templateManagerUrl,
				obj,
			)
			.subscribe(
				(res: any) => {
					const data = cloneDeep(res.data);
					if (typeof data.options === 'string') {
						data.options = JSON.parse(data.options);
					}
					for (let i: number = 0; i < data.dashboard?.length; i++) {
						this.componentsService.push({
							id: data.dashboard[i].id,
							componentRef: data.dashboard[i].obj.type,
						});
					}
					this.viewCFSection = {
						options: data.options,
						dashboard: data.dashboard,
					};
				},
				(err) => {
					console.log(err);
					this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
					this.stopLoader();
				},
			);
	}
	public applySection(sectionId, index, search) {
		const obj = {
			section_id: parseInt(sectionId),
		};
		this.requestService
			.sendRequest(
				TemaplateManagerUrlsEnum.getUIComponentsBySection,
				'POST',
				REQUEST_SERVERS.templateManagerUrl,
				obj,
			)
			.subscribe(
				(res: any) => {
					this.sectionCreated = true;
					const data = cloneDeep(res.data);
					if (typeof search.options === 'string') {
						search.options = JSON.parse(search.options);
					}
					for (let i: number = 0; i < data?.length; i++) {
						this.componentsService.push({
							id: data[i].id,
							componentRef: data[i].obj.type,
						});
					}
					this.layoutService.sectionsSearch = {
						options: search.options,
						dashboard: data,
					};
				},
				(err) => {
					console.log(err);
					this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
					this.stopLoader();
				},
			);
	}
	dragSectionSearchStart(search) {
		this.dragItem = null;
		this.sectionDragStart = cloneDeep(search);
	}
	dropSearchSection() {
		if (this.sectionDragStart && this.sectionDragStart.section_id) {
			const obj = {
				section_id: parseInt(this.sectionDragStart.section_id),
			};
			const sectionDragCopy = cloneDeep(this.sectionDragStart);
			this.section_id_carry = cloneDeep(this.sectionDragStart.section_id);
			this.sectionDragStart.section_id = null;
			this.requestService
				.sendRequest(
					TemaplateManagerUrlsEnum.getUIComponentsBySection,
					'POST',
					REQUEST_SERVERS.templateManagerUrl,
					obj,
				)
				.subscribe(
					(res: any) => {
						this.sectionCreated = true;
						const data = res.data;
						let minIdAssigned = 1;
						let allIds: any = [];
						for (let i: number = 0; i < data?.length; i++) {
							data[i].obj['carry_uicomponent_name'] = data[i].obj.uicomponent_name;
							delete data[i].id;
							data[i]['id'] = UUID();
							this.setTemplateProperty('uiCompIds', this.getNextUICompId(minIdAssigned), false);
							minIdAssigned = this.layoutService.template.uiCompIds;
							allIds.push({
								oldId: data[i].obj.uicomponent_name,
								newId: JSON.stringify(this.layoutService.template.uiCompIds),
							});
							data[i].obj.uicomponent_name = JSON.stringify(this.layoutService.template.uiCompIds);
							delete data[i].uicomponent_id;
							if (this.uicomponentTypes.INPUT in data[i].obj) {
								data[i].obj.input = '';
							}
							if (data[i].obj.MultiSelectObj) {
								delete data[i].obj.MultiSelectObj;
								data[i].obj.manualoptions = true;
								data[i].obj.multilinked = false;
								data[i].obj.options = [];
								data[i].obj.answers = [];
							}
							if (data[i].obj.answers) {
								data[i].obj.answers = [];
							}
							this.componentsService.push({
								id: data[i].id,
								componentRef: data[i].obj.type,
							});
						}
						for (let x: number = 0; x < data?.length; x++) {
							if (data[x].obj.preDefind) {
								let is_exist: boolean = false;
								for (let i: number = 0; i < this.PreDefinedList?.length; i++) {
									if (this.PreDefinedList[i].objectid == data[x].id) {
										is_exist = true;
										this.PreDefinedList[i].predefinedvalue = data[x].obj['preDefinedObj'].id;
									}
								}
								if (!is_exist) {
									this.PreDefinedList.push({
										objectid: data[x].id,
										predefinedvalue: data[x].obj['preDefinedObj'].id,
									});
								}
							}
							if (data[x].obj.statement) {
								let tempStatement: any = '';
								tempStatement = data[x].obj.statement;
								if (data[x].obj.type == this.uicomponentTypes.TEXT) {
									let statementArray = tempStatement.match(/@[0-9]+/g);
									if (statementArray) {
										for (let arrayItem of statementArray) {
											if (arrayItem[0] == '@') {
												arrayItem = arrayItem.replace('@', '');
												for (let k: number = 0; k < allIds?.length; k++) {
													if (arrayItem == allIds[k].oldId) {
														tempStatement = tempStatement.replace(
															'@' + arrayItem,
															'@changingThisId' + allIds[k].newId,
														);
													}
												}
											}
										}
									}
									tempStatement = tempStatement.replace(/@changingThisId/g, '@');
									data[x].obj.statement = tempStatement;
									data[x].obj.instanceStatement = tempStatement;
								}
							}
						}
						for (let uicomponent of data) {
							if (uicomponent.obj?.options?.length) {
								for (let option of uicomponent.obj?.options) {
									if (option.selectedLinkUi && option.selectedLinkUi.id) {
										for (let k: number = 0; k < allIds?.length; k++) {
											if (option.selectedLinkUi.id == allIds[k].oldId) {
												option.selectedLinkUi.id = allIds[k].newId;
											}
										}
									}
								}
							}
						}
						sectionDragCopy.dashboard = data;
						this.sectionDragStart.dashboard = data;
						if (typeof sectionDragCopy.options === 'string') {
							sectionDragCopy.options = JSON.parse(sectionDragCopy.options);
						}
						this.changeDetector.detectChanges();
						this.removeCollapsePropertiesTab();
						this.setPropertiesTab('showSectionProperties');
						this.setPropertiesTab('showSections');
						this.setPropertiesTab('showUIComponents');
						this.setCollapsePropertiesTab('showUIComponents');
						this.changeDetector.detectChanges();
						if (this.otherSectionDragSearchCheck) {
							sectionDragCopy.parentId = 0;
							this.addOtherSection(1, sectionDragCopy.section_type, false);
						} else if (!isNil(this.sectionIndex)) {
							sectionDragCopy.parentId = this.layoutService.template.sections[this.sectionIndex].id;
							this.addSubSection(sectionDragCopy.parentId, 1, this.sectionIndex, false);
						}
					},
					(err) => {
						console.log(err);
						this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
						this.stopLoader();
					},
				);
		}
	}
	reduceRow(index, noOfRows, rowMapper?, rowMapperIndex?) {
		let rowsToBePopped: number = 0;
		if (
			this.layoutService.template.sections[index].options.maxRows == 1 ||
			this.layoutService.template.sections[index].options.maxRows - noOfRows <= 0
		) {
			this.toastrService.error('Cannot delete first row', '', {
				timeOut: 6000,
			});
			return;
		}
		for (let w: number = 0; w < this.layoutService.template.sections[index].dashboard?.length; w++) {
			if (this.layoutService.template.sections[index].dashboard[w].obj.emptyCell) {
				this.layoutService.template.sections[index].dashboard.splice(w, 1);
				this.editOptionsTs(index, 0);
				this.emptyCellItem = {};
				this.emptyCellItemIndex = { sectionIndex: -1, dashboardIndex: -1 };
				w--;
				continue;
			}
			if (
				this.layoutService.template.sections[index].dashboard[w].y +
					this.layoutService.template.sections[index].dashboard[w].rows >
				this.layoutService.template.sections[index].options.maxRows - noOfRows
			) {
				this.toastrService.error('Cannot delete non empty rows', '', {
					timeOut: 6000,
				});
				return;
			}
		}
		for (
			let rowIndex: number = 0;
			rowIndex < noOfRows && this.layoutService.template.sections[index]['mapper']?.length;
			rowIndex++
		) {
			this.layoutService.template.sections[index]['mapper'].pop();
			rowsToBePopped++;
		}
		this.layoutService.template.sections[index].options.maxRows -= rowsToBePopped;
		this.layoutService.template.sections[index].options.minRows -= rowsToBePopped;
		for (let i: number = 0; i < this.layoutService.template.sections[index].dashboard?.length; i++) {
			const obj = cloneDeep(this.layoutService.template.sections[index].dashboard[i]);
			if (obj.maxItemRows) {
				obj.maxItemRows = this.layoutService.template.sections[index].options.minRows;
			}
			if (obj.rows + obj.y > this.layoutService.template.sections[index].options.minRows) {
				if (obj.rows > 1) {
					obj.rows -= 1;
				} else {
					obj.y -= 1;
				}
			}
			this.layoutService.template.sections[index].dashboard[i] = obj;
		}
		this.optionRefresh(index);
	}
	dragList(e) {}
	unlinkList = [];
	recurseRestructureSection(ListObj, id, check?) {
		let tempCheck = false;
		if (ListObj.children?.length === 0) {
			return;
		} else {
			for (let i: number = 0; i < ListObj.children?.length; i++) {
				this.updateBackUpTask('type', `parentId`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(this.layoutService.template.sections?.length, -1, -1, 'section');
				this.updateBackUpTask('oldObject', ListObj.children[i].obj.parentId);
				ListObj.children[i].obj.parentId = ListObj.id;
				this.updateBackUpTask('newObject', ListObj.children[i].obj.parentId);
				if (ListObj.children[i].id == id || check) {
					tempCheck = true;
				}
				this.layoutService.template.sections.push(ListObj.children[i].obj);
				if (tempCheck) {
					this.recurseRestructureSection(ListObj.children[i], id, true);
				} else {
					this.recurseRestructureSection(ListObj.children[i], id);
				}
			}
		}
	}
	dropList(e) {
		this.showDropDownProperties = false;
		this.showTableDropDownProperties = false;
		this.showTextProperties = false;
		this.showCombinedProperties = false;
		this.showSwitchProperties = false;
		this.showInputProperties = false;
		this.showIntensityProperties = false;
		this.showIncrementProperties = false;
		this.showDrawingProperties = false;
		this.showCalculationProperties = false;
		this.showLineProperties = false;
		this.showSignatureProperties = false;
		this.showIntellisenseProperties = false;
		this.showRadioProperties = false;
		this.showCheckBoxProperties = false;
		this.showImageLabelProperties = false;
		this.showImageProperties = false;
		this.showUIComponents = true;
		this.showSectionProperties = false;
		this.layoutService.lastI = null;
		this.layoutService.lastK = null;
		let sectionId = e.item.id;
		let parentId = e.item.obj.parentId;
		let oldArray: any = [];
		let newArray: any = [];
		let oldParentId = 0;
		let newParentId = 0;
		for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
			oldArray.push(this.layoutService.template.sections[i].id);
			if (this.layoutService.template.sections[i].id == sectionId) {
				oldParentId = this.layoutService.template.sections[i].parentId;
			}
		}
		this.layoutService.template.sections = [];
		for (let i: number = 0; i < this.list?.length; i++) {
			this.list[i].obj.parentId = 0;
			this.layoutService.template.sections.push(this.list[i].obj);
			if (this.list[i].children?.length > 0) {
				this.recurseRestructureSection(this.list[i], e.item.id);
			}
		}
		for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
			newArray.push(this.layoutService.template.sections[i].id);
			if (this.layoutService.template.sections[i].id == sectionId) {
				newParentId = this.layoutService.template.sections[i].parentId;
			}
		}
		this.updateBackUpTask('type', `sectionDragDrop`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(-1, -1, -1, 'sectionDragDrop');
		this.updateBackUpTask('oldObject', oldArray);
		this.updateBackUpTask('newObject', newArray);
		this.resetSectionNumbers();
		if (oldParentId != newParentId) {
			this.removeLinking(sectionId, parentId, newArray);
		}
		this.updateSectionNoLinking(newArray);
		this.GetHeightValue();
		this.arrowLeftRight('a');
		this.layoutService.backupId++;
	}
	updateSectionNoLinking(newArray) {
		for (let i = 0; i < this.layoutService.template.sections?.length; i++) {
			for (let j = 0; j < this.layoutService.template.sections[i].dashboard?.length; j++) {
				for (
					let k = 0;
					this.layoutService.template.sections[i].dashboard[j].obj.options &&
					k < this.layoutService.template.sections[i].dashboard[j].obj.options?.length;
					k++
				) {
					if (
						this.layoutService.template.sections[i].dashboard[j].obj.options[k].link &&
						this.layoutService.template.sections[i].dashboard[j].obj.options[k].selectedLinkSection
							.id
					) {
						let tempIndex = newArray.indexOf(
							this.layoutService.template.sections[i].dashboard[j].obj.options[k]
								.selectedLinkSection.id,
						);
						this.setUIPropertyOptions(
							i,
							j,
							'selectedLinkSection',
							{
								id: this.layoutService.template.sections[tempIndex].id,
								secNo: this.layoutService.template.sections[tempIndex].secNo,
								name: this.layoutService.template.sections[tempIndex].boundSectionStatement,
							},
							k,
							false,
						);
					}
				}
			}
		}
	}
	removeLinking(sectionId, parentId, newArray) {
		let currentHierarchy = [sectionId];
		let topLevelRemoved = 0;
		let topLevelRemovedSelected = 0;
		for (let i = 0; i < this.layoutService.template.sections?.length; i++) {
			for (let j = 0; j < this.layoutService.template.sections[i].dashboard?.length; j++) {
				for (
					let k = 0;
					this.layoutService.template.sections[i].dashboard[j].obj.options &&
					k < this.layoutService.template.sections[i].dashboard[j].obj.options?.length;
					k++
				) {
					if (
						this.layoutService.template.sections[i].dashboard[j].obj.options[k].link &&
						this.layoutService.template.sections[i].dashboard[j].obj.options[k].selectedLinkSection
							.id == sectionId
					) {
						this.setUIPropertyOptions(i, j, 'link', false, k, false);
						this.setUIPropertyOptions(i, j, 'selectedLinkSection', {}, k, false);
						topLevelRemoved++;
						if (this.layoutService.template.sections[i].dashboard[j].obj.options[k].selected) {
							topLevelRemovedSelected++;
						}
					}
					if (currentHierarchy.includes(this.layoutService.template.sections[i].parentId)) {
						currentHierarchy.push(this.layoutService.template.sections[i].id);
					}
					if (currentHierarchy.includes(this.layoutService.template.sections[i].id)) {
						let tempIndex = newArray.indexOf(
							this.layoutService.template.sections[i].dashboard[j].obj.options[k]
								.selectedLinkSection.id,
						);
						if (
							this.layoutService.template.sections[i].dashboard[j].obj.options[k].link &&
							this.layoutService.template.sections[tempIndex].parentId == 0
						) {
							this.setSectionProperty(
								tempIndex,
								'linked_component',
								this.layoutService.template.sections[tempIndex].linked_component - 1,
								false,
							);
							if (this.layoutService.template.sections[i].dashboard[j].obj.options[k].selected) {
								this.setSectionProperty(
									tempIndex,
									'selected_linked_component',
									this.layoutService.template.sections[tempIndex].selected_linked_component - 1,
									false,
								);
							}
							this.setUIPropertyOptions(i, j, 'link', false, k, false);
							this.setUIPropertyOptions(i, j, 'selectedLinkSection', {}, k, false);
						}
					}
				}
			}
		}
		for (let i = 0; i < this.layoutService.template.sections?.length; i++) {
			if (this.layoutService.template.sections[i].id == sectionId) {
				this.setSectionProperty(i, 'selected_linked_component', 0, false);
				this.setSectionProperty(i, 'linked_component', 0, false);
				let currentDepth = this.layoutService.template.sections[i].secNo.split('.')?.length - 1;
				for (let z = i + 1; z < this.layoutService.template.sections?.length; z++) {
					let tempDepth = this.layoutService.template.sections[z].secNo.split('.')?.length - 1;
					if (tempDepth > currentDepth) {
						this.setSectionProperty(
							z,
							'selected_linked_component',
							this.layoutService.template.sections[z].selected_linked_component -
								topLevelRemovedSelected,
							false,
						);
						this.setSectionProperty(
							z,
							'linked_component',
							this.layoutService.template.sections[z].linked_component - topLevelRemoved,
							false,
						);
					} else {
						break;
					}
				}
			}
		}
	}
	dragDropLinking(sectionId, parentId) {
		let x: number = 0;
		for (let section of this.layoutService.template.sections) {
			if (section.id == sectionId) {
				if (section.linked_component == 0 && section.parentId != 0) {
					for (let y = x - 1; y >= 0; y--) {
						if (this.layoutService.template.sections[y].id == section.parentId) {
							this.updateBackUpTask('type', `linked_component`);
							this.updateBackUpTask('id', this.layoutService.backupId);
							this.updateIndexes(x, -1, -1, 'section');
							this.updateBackUpTask('oldObject', section.linked_component);
							section.linked_component = this.layoutService.template.sections[y].linked_component;
							this.updateBackUpTask('newObject', section.linked_component);
							this.updateBackUpTask('type', `selected_linked_component`);
							this.updateBackUpTask('id', this.layoutService.backupId);
							this.updateIndexes(x, -1, -1, 'section');
							this.updateBackUpTask('oldObject', section.selected_linked_component);
							section.selected_linked_component =
								this.layoutService.template.sections[y].selected_linked_component;
							this.updateBackUpTask('newObject', section.selected_linked_component);
							let currentDepth = section.secNo.split('.')?.length - 1;
							for (let z = x + 1; z < this.layoutService.template.sections?.length; z++) {
								let tempDepth = this.layoutService.template.sections[z].secNo.split('.')?.length - 1;
								if (tempDepth > currentDepth) {
									this.updateBackUpTask('type', `linked_component`);
									this.updateBackUpTask('id', this.layoutService.backupId);
									this.updateIndexes(z, -1, -1, 'section');
									this.updateBackUpTask(
										'oldObject',
										this.layoutService.template.sections[z].linked_component,
									);
									this.layoutService.template.sections[z].linked_component =
										section.linked_component;
									this.updateBackUpTask(
										'newObject',
										this.layoutService.template.sections[z].linked_component,
									);
									this.updateBackUpTask('type', `selected_linked_component`);
									this.updateBackUpTask('id', this.layoutService.backupId);
									this.updateIndexes(z, -1, -1, 'section');
									this.updateBackUpTask(
										'oldObject',
										this.layoutService.template.sections[z].selected_linked_component,
									);
									this.layoutService.template.sections[z].selected_linked_component =
										section.selected_linked_component;
									this.updateBackUpTask(
										'newObject',
										this.layoutService.template.sections[z].selected_linked_component,
									);
								} else {
									break;
								}
							}
							break;
						}
					}
				}
				break;
			}
			x++;
		}
		x = 0;
		for (let section of this.layoutService.template.sections) {
			if (section.id == sectionId) {
				if (section.linked_component) {
					for (let j = this.layoutService.template.sections?.length - 1; j >= 0; j--) {
						if (this.layoutService.template.sections[j].id == parentId) {
							if (
								section.linked_component == this.layoutService.template.sections[j].linked_component
							) {
								if (section.parentId == 0) {
									this.updateBackUpTask('type', `linked_component`);
									this.updateBackUpTask('id', this.layoutService.backupId);
									this.updateIndexes(x, -1, -1, 'section');
									this.updateBackUpTask('oldObject', section.linked_component);
									section.linked_component = 0;
									this.updateBackUpTask('newObject', section.linked_component);
									this.updateBackUpTask('type', `selected_linked_component`);
									this.updateBackUpTask('id', this.layoutService.backupId);
									this.updateIndexes(x, -1, -1, 'section');
									this.updateBackUpTask('oldObject', section.selected_linked_component);
									section.selected_linked_component = 0;
									this.updateBackUpTask('newObject', section.selected_linked_component);
									let currentDepth = section.secNo.split('.')?.length - 1;
									for (let y = x + 1; y < this.layoutService.template.sections?.length; y++) {
										let tempDepth =
											this.layoutService.template.sections[y].secNo.split('.')?.length - 1;
										if (tempDepth > currentDepth) {
											this.updateBackUpTask('type', `linked_component`);
											this.updateBackUpTask('id', this.layoutService.backupId);
											this.updateIndexes(y, -1, -1, 'section');
											this.updateBackUpTask(
												'oldObject',
												this.layoutService.template.sections[y].linked_component,
											);
											this.layoutService.template.sections[y].linked_component =
												section.linked_component;
											this.updateBackUpTask(
												'newObject',
												this.layoutService.template.sections[y].linked_component,
											);
											this.updateBackUpTask('type', `selected_linked_component`);
											this.updateBackUpTask('id', this.layoutService.backupId);
											this.updateIndexes(y, -1, -1, 'section');
											this.updateBackUpTask(
												'oldObject',
												this.layoutService.template.sections[y].selected_linked_component,
											);
											this.layoutService.template.sections[y].selected_linked_component =
												section.selected_linked_component;
											this.updateBackUpTask(
												'newObject',
												this.layoutService.template.sections[y].selected_linked_component,
											);
										} else {
											break;
										}
									}
								} else {
									for (let k = x - 1; k >= 0; k--) {
										if (this.layoutService.template.sections[k].id == section.parentId) {
											this.updateBackUpTask('type', `linked_component`);
											this.updateBackUpTask('id', this.layoutService.backupId);
											this.updateIndexes(x, -1, -1, 'section');
											this.updateBackUpTask('oldObject', section.linked_component);
											section.linked_component =
												this.layoutService.template.sections[k].linked_component;
											this.updateBackUpTask('newObject', section.linked_component);
											this.updateBackUpTask('type', `selected_linked_component`);
											this.updateBackUpTask('id', this.layoutService.backupId);
											this.updateIndexes(x, -1, -1, 'section');
											this.updateBackUpTask('oldObject', section.selected_linked_component);
											section.selected_linked_component =
												this.layoutService.template.sections[k].selected_linked_component;
											this.updateBackUpTask('newObject', section.selected_linked_component);
											let currentDepth = section.secNo.split('.')?.length - 1;
											for (let y = x + 1; y < this.layoutService.template.sections?.length; y++) {
												let tempDepth =
													this.layoutService.template.sections[y].secNo.split('.')?.length - 1;
												if (tempDepth > currentDepth) {
													this.updateBackUpTask('type', `linked_component`);
													this.updateBackUpTask('id', this.layoutService.backupId);
													this.updateIndexes(y, -1, -1, 'section');
													this.updateBackUpTask(
														'oldObject',
														this.layoutService.template.sections[y].linked_component,
													);
													this.layoutService.template.sections[y].linked_component =
														section.linked_component;
													this.updateBackUpTask(
														'newObject',
														this.layoutService.template.sections[y].linked_component,
													);
													this.updateBackUpTask('type', `selected_linked_component`);
													this.updateBackUpTask('id', this.layoutService.backupId);
													this.updateIndexes(y, -1, -1, 'section');
													this.updateBackUpTask(
														'oldObject',
														this.layoutService.template.sections[y].selected_linked_component,
													);
													this.layoutService.template.sections[y].selected_linked_component =
														section.selected_linked_component;
													this.updateBackUpTask(
														'newObject',
														this.layoutService.template.sections[y].selected_linked_component,
													);
												} else {
													break;
												}
											}
											break;
										}
									}
								}
							}
							break;
						}
					}
				}
				break;
			}
			x++;
		}
		for (
			let sectionIndex: number = 0;
			sectionIndex < this.layoutService.template.sections?.length;
			sectionIndex++
		) {
			for (
				let dashboardIndex: number = 0;
				dashboardIndex < this.layoutService.template.sections[sectionIndex].dashboard?.length;
				dashboardIndex++
			) {
				this.sectionSearchDataComponents = [];
				const sectionId = this.layoutService.template.sections[sectionIndex].id;
				let topLevelParent = -1;
				let temp = -1;
				for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
					if (this.layoutService.template.sections[i].parentId === 0) {
						temp = this.layoutService.template.sections[i].id;
					}
					if (this.layoutService.template.sections[i].id == sectionId) {
						topLevelParent = temp;
					}
					if (
						this.layoutService.template.sections[i].id !== sectionId &&
						(this.layoutService.template.sections[i].parentId === 0 ||
							this.layoutService.template.sections[i].parentId === sectionId)
					) {
						this.sectionSearchDataComponents.push({
							id: this.layoutService.template.sections[i].id,
							secNo: this.layoutService.template.sections[i].secNo,
							name: this.layoutService.template.sections[i].boundSectionStatement,
						});
					}
					if (this.layoutService.template.sections[i].id == sectionId) {
						topLevelParent = temp;
						for (let j: number = 0; j < this.sectionSearchDataComponents?.length; j++) {
							if (
								this.layoutService.template.sections[i].parentId ==
									this.sectionSearchDataComponents[j].id ||
								topLevelParent == this.sectionSearchDataComponents[j].id
							) {
								this.sectionSearchDataComponents.splice(j, 1);
							}
						}
					}
				}
			}
		}
		let i: number = 0;
		for (let section of this.layoutService.template.sections) {
			let dashboardIndex = -1;
			for (let uiComponent of section.dashboard) {
				dashboardIndex++;
				if (uiComponent.obj?.options?.length) {
					let optionIndex = -1;
					for (let option of uiComponent.obj?.options) {
						optionIndex++;
						let tempCheck = false;
						for (let linkSection of this.sectionSearchDataComponents) {
							if (option.selectedLinkSection && option.selectedLinkSection.id == linkSection.id) {
								tempCheck = true;
							}
						}
						if (!tempCheck && option.selectedLinkSection && option.selectedLinkSection.id) {
							if (option.selected) {
								this.unlinkList.push({
									id: option.selectedLinkSection.id,
									selected: true,
								});
							} else {
								this.unlinkList.push({
									id: option.selectedLinkSection.id,
									selected: false,
								});
							}
							this.updateBackUpTask('type', `selectedLinkSection`);
							this.updateBackUpTask('id', this.layoutService.backupId);
							this.updateIndexes(i, dashboardIndex, -1, 'option');
							this.updateBackUpTask('oldObject', option.selectedLinkSection);
							option.selectedLinkSection = {};
							this.updateBackUpTask('newObject', {});
							this.updateBackUpTask('type', `link`);
							this.updateBackUpTask('id', this.layoutService.backupId);
							this.updateIndexes(i, dashboardIndex, optionIndex, 'option');
							this.updateBackUpTask('oldObject', option.link);
							option.link = false;
							this.updateBackUpTask('newObject', false);
						}
					}
				}
			}
			i++;
		}
		for (let tempSection of this.unlinkList) {
			let i: number = 0;
			let tempSelectedComponent: number = 0;
			let tempComponent: number = 0;
			for (let section of this.layoutService.template.sections) {
				if (section.id == tempSection.id) {
					for (let j = i - 1; j >= 0; j--) {
						if (this.layoutService.template.sections[j].id == section.parentId) {
							tempSelectedComponent =
								this.layoutService.template.sections[j].selected_linked_component;
							tempComponent = this.layoutService.template.sections[j].linked_component;
							break;
						}
					}
					this.updateBackUpTask('type', `selected_linked_component`);
					this.updateBackUpTask('id', this.layoutService.backupId);
					this.updateIndexes(i, -1, -1, 'section');
					this.updateBackUpTask('oldObject', section.selected_linked_component);
					section.selected_linked_component = tempSelectedComponent;
					this.updateBackUpTask('newObject', section.selected_linked_component);
					this.updateBackUpTask('type', `linked_component`);
					this.updateBackUpTask('id', this.layoutService.backupId);
					this.updateIndexes(i, -1, -1, 'section');
					this.updateBackUpTask('oldObject', section.linked_component);
					section.linked_component = tempComponent;
					this.updateBackUpTask('newObject', section.linked_component);
					let currentDepth = section.secNo.split('.')?.length - 1;
					for (let j = i + 1; j < this.layoutService.template.sections?.length; j++) {
						let tempDepth = this.layoutService.template.sections[j].secNo.split('.')?.length - 1;
						if (tempDepth > currentDepth) {
							this.updateBackUpTask('type', `linked_component`);
							this.updateBackUpTask('id', this.layoutService.backupId);
							this.updateIndexes(j, -1, -1, 'section');
							this.updateBackUpTask(
								'oldObject',
								this.layoutService.template.sections[j].linked_component,
							);
							this.layoutService.template.sections[j].linked_component = section.linked_component;
							this.updateBackUpTask(
								'newObject',
								this.layoutService.template.sections[j].linked_component,
							);
							if (tempSection.selected) {
								this.updateBackUpTask('type', `selected_linked_component`);
								this.updateBackUpTask('id', this.layoutService.backupId);
								this.updateIndexes(j, -1, -1, 'section');
								this.updateBackUpTask(
									'oldObject',
									this.layoutService.template.sections[j].selected_linked_component,
								);
								this.layoutService.template.sections[j].selected_linked_component =
									section.selected_linked_component;
								this.updateBackUpTask(
									'newObject',
									this.layoutService.template.sections[j].selected_linked_component,
								);
							}
						} else {
							break;
						}
					}
				}
				i++;
			}
		}
		this.unlinkList = [];
	}
	onDisclosure(e) {}
	RecurseRestructureList(sectionItem, itemIndex, listIndex, tempList) {
		let j: number = 0;
		tempList.push({ id: sectionItem.id, children: [], obj: sectionItem });
		for (let i = itemIndex + 1; i < this.layoutService.template.sections?.length; i++) {
			if (
				this.layoutService.template.sections[i].parentId === sectionItem.id ||
				this.layoutService.template.sections[i].parentId === sectionItem.id
			) {
				tempList[listIndex].children = this.RecurseRestructureList(
					this.layoutService.template.sections[i],
					i,
					j,
					tempList[listIndex].children,
				);
				j++;
			}
		}
		return tempList;
	}
	sectionToList() {
		this.list = [];
		let j: number = 0;
		for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
			if (this.layoutService.template.sections[i].parentId === 0) {
				this.list = this.RecurseRestructureList(
					this.layoutService.template.sections[i],
					i,
					j,
					this.list,
				);
				j++;
			}
		}
	}
	otherSectionDragSearch() {
		this.otherSectionDragSearchCheck = true;
	}
	static overlapEvent(source: GridsterItem, target: GridsterItem, grid: GridsterComponent) {}
	public linkUIComponent(secIndex, dashboardIndex, optionIndex, linkIndex) {
		let prevSelected =
			this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
				optionIndex
			]['selectedLinkUi'].id;
		this.setUIPropertyOptions(
			secIndex,
			dashboardIndex,
			'selectedLinkUi',
			this.uiSearchData[linkIndex],
			optionIndex,
			false,
		);
		for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
			for (let j: number = 0; j < this.layoutService.template.sections[i].dashboard?.length; j++) {
				if (
					prevSelected == this.layoutService.template.sections[i].dashboard[j].obj.uicomponent_name
				) {
					this.setUIProperty(
						i,
						j,
						'linked_ui',
						this.layoutService.template.sections[i].dashboard[j].obj['linked_ui'] - 1,
						false,
					);
					if (
						this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
							optionIndex
						].selected
					) {
						this.setUIProperty(
							i,
							j,
							'selected_linked_ui_component',
							this.layoutService.template.sections[i].dashboard[j].obj[
								'selected_linked_ui_component'
							] - 1,
							false,
						);
					}
				}
				if (
					this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
						optionIndex
					]['selectedLinkUi'].id ==
					this.layoutService.template.sections[i].dashboard[j].obj.uicomponent_name
				) {
					this.setUIProperty(
						i,
						j,
						'linked_ui',
						this.layoutService.template.sections[i].dashboard[j].obj['linked_ui'] + 1,
						false,
					);
					if (
						this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
							optionIndex
						].selected
					) {
						this.setUIProperty(
							i,
							j,
							'selected_linked_ui_component',
							this.layoutService.template.sections[i].dashboard[j].obj[
								'selected_linked_ui_component'
							] + 1,
							false,
						);
					}
				}
			}
		}
		this.layoutService.backupId++;
		this.changeDetector.detectChanges();
	}
	removeLinkedRow(index) {
		let prevSelected =
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options[index].linkedRowValue.id;
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.options[index].linkedRowValue = {};
		for (let component of this.layoutService.template.sections[this.layoutService.lastI]
			.dashboard) {
			if (component.obj.uicomponent_name == prevSelected) {
				component.obj.linked_row--;
				if (
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[
						this.layoutService.lastK
					].obj.options[index].selected
				) {
					component.obj.selected_linked_row--;
				}
			}
		}
	}
	public linkRowComponent(secIndex, dashboardIndex, optionIndex, linkIndex) {
		let prevSelected;
		if (
			this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
				optionIndex
			]['linkedRowValue']
		) {
			prevSelected =
				this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
					optionIndex
				]['linkedRowValue'].id;
			this.rowSearchDataComponents.push(
				this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
					optionIndex
				]['linkedRowValue'],
			);
			for (let x: number = 0; x < this.rowSearchDataComponents?.length; x++) {
				for (let y = x + 1; y < this.rowSearchDataComponents?.length; y++)
					if (this.rowSearchDataComponents[x].y > this.rowSearchDataComponents[y].y) {
						let temp = this.rowSearchDataComponents[x];
						this.rowSearchDataComponents[x] = this.rowSearchDataComponents[y];
						this.rowSearchDataComponents[y] = temp;
					}
			}
		}
		this.setUIPropertyOptions(
			secIndex,
			dashboardIndex,
			'linkedRowValue',
			this.rowSearchData[linkIndex],
			optionIndex,
			false,
		);
		const index = this.rowSearchDataComponents.indexOf(this.rowSearchData[linkIndex]);
		if (index > -1) {
			this.rowSearchDataComponents.splice(index, 1);
		}
		for (
			let j: number = 0;
			j < this.layoutService.template.sections[secIndex].dashboard?.length;
			j++
		) {
			if (
				prevSelected ==
				this.layoutService.template.sections[secIndex].dashboard[j].obj.uicomponent_name
			) {
				this.setUIProperty(
					secIndex,
					j,
					'linked_row',
					this.layoutService.template.sections[secIndex].dashboard[j].obj['linked_row'] - 1,
					false,
				);
				if (
					this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
						optionIndex
					].selected
				) {
					this.setUIProperty(
						secIndex,
						j,
						'selected_linked_row',
						this.layoutService.template.sections[secIndex].dashboard[j].obj['selected_linked_row'] -
							1,
						false,
					);
				}
			}
			if (
				this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
					optionIndex
				]['linkedRowValue'].id ==
				this.layoutService.template.sections[secIndex].dashboard[j].obj.uicomponent_name
			) {
				this.setUIProperty(
					secIndex,
					j,
					'linked_row',
					this.layoutService.template.sections[secIndex].dashboard[j].obj['linked_row'] + 1,
					false,
				);
				if (
					this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
						optionIndex
					].selected
				) {
					this.setUIProperty(
						secIndex,
						j,
						'selected_linked_row',
						this.layoutService.template.sections[secIndex].dashboard[j].obj['selected_linked_row'] +
							1,
						false,
					);
				}
			}
		}
		this.layoutService.backupId++;
		this.changeDetector.detectChanges();
	}
	public linkSection(secIndex, dashboardIndex, optionIndex, linkIndex) {
		let prevSelected =
			this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
				optionIndex
			]['selectedLinkSection'].id;
		this.updateBackUpTask('type', `selectedLinkSection`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(secIndex, dashboardIndex, optionIndex, 'option');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
				optionIndex
			][`selectedLinkSection`],
		);
		this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
			optionIndex
		]['selectedLinkSection'] = this.sectionSearchData[linkIndex];
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
				optionIndex
			][`selectedLinkSection`],
		);
		for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
			if (prevSelected == this.layoutService.template.sections[i].id) {
				this.updateBackUpTask('type', `linked_component`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(i, -1, -1, 'section');
				this.updateBackUpTask(
					'oldObject',
					this.layoutService.template.sections[i][`linked_component`],
				);
				this.layoutService.template.sections[i]['linked_component']--;
				this.updateBackUpTask(
					'newObject',
					this.layoutService.template.sections[i][`linked_component`],
				);
				if (
					this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
						optionIndex
					].selected
				) {
					this.updateBackUpTask('type', `selected_linked_component`);
					this.updateBackUpTask('id', this.layoutService.backupId);
					this.updateIndexes(i, -1, -1, 'section');
					this.updateBackUpTask(
						'oldObject',
						this.layoutService.template.sections[i][`selected_linked_component`],
					);
					this.layoutService.template.sections[i]['selected_linked_component']--;
					this.updateBackUpTask(
						'newObject',
						this.layoutService.template.sections[i][`selected_linked_component`],
					);
				}
				let currentDepth = this.layoutService.template.sections[i].secNo.split('.')?.length - 1;
				for (let j = i + 1; j < this.layoutService.template.sections?.length; j++) {
					let tempDepth = this.layoutService.template.sections[j].secNo.split('.')?.length - 1;
					if (tempDepth > currentDepth) {
						this.updateBackUpTask('type', `linked_component`);
						this.updateBackUpTask('id', this.layoutService.backupId);
						this.updateIndexes(j, -1, -1, 'section');
						this.updateBackUpTask(
							'oldObject',
							this.layoutService.template.sections[j][`linked_component`],
						);
						this.layoutService.template.sections[j]['linked_component']--;
						this.updateBackUpTask(
							'newObject',
							this.layoutService.template.sections[j][`linked_component`],
						);
						if (
							this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
								optionIndex
							].selected
						) {
							this.updateBackUpTask('type', `selected_linked_component`);
							this.updateBackUpTask('id', this.layoutService.backupId);
							this.updateIndexes(j, -1, -1, 'section');
							this.updateBackUpTask(
								'oldObject',
								this.layoutService.template.sections[j][`selected_linked_component`],
							);
							this.layoutService.template.sections[j]['selected_linked_component']--;
							this.updateBackUpTask(
								'newObject',
								this.layoutService.template.sections[j][`selected_linked_component`],
							);
						}
					} else {
						break;
					}
				}
			}
			if (
				this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
					optionIndex
				]['selectedLinkSection'].id == this.layoutService.template.sections[i].id
			) {
				this.updateBackUpTask('type', `linked_component`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(i, -1, -1, 'section');
				this.updateBackUpTask(
					'oldObject',
					this.layoutService.template.sections[i][`linked_component`],
				);
				this.layoutService.template.sections[i]['linked_component']++;
				this.updateBackUpTask(
					'newObject',
					this.layoutService.template.sections[i][`linked_component`],
				);
				if (
					this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
						optionIndex
					].selected
				) {
					this.updateBackUpTask('type', `selected_linked_component`);
					this.updateBackUpTask('id', this.layoutService.backupId);
					this.updateIndexes(i, -1, -1, 'section');
					this.updateBackUpTask(
						'oldObject',
						this.layoutService.template.sections[i][`selected_linked_component`],
					);
					this.layoutService.template.sections[i]['selected_linked_component']++;
					this.updateBackUpTask(
						'newObject',
						this.layoutService.template.sections[i][`selected_linked_component`],
					);
				}
				let currentDepth = this.layoutService.template.sections[i].secNo.split('.')?.length - 1;
				for (let j = i + 1; j < this.layoutService.template.sections?.length; j++) {
					let tempDepth = this.layoutService.template.sections[j].secNo.split('.')?.length - 1;
					if (tempDepth > currentDepth) {
						this.layoutService.template.sections[j]['linked_component']++;
						if (
							this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
								optionIndex
							].selected
						) {
							this.updateBackUpTask('type', `selected_linked_component`);
							this.updateBackUpTask('id', this.layoutService.backupId);
							this.updateIndexes(j, -1, -1, 'section');
							this.updateBackUpTask(
								'oldObject',
								this.layoutService.template.sections[j][`selected_linked_component`],
							);
							this.layoutService.template.sections[j]['selected_linked_component']++;
							this.updateBackUpTask(
								'newObject',
								this.layoutService.template.sections[j][`selected_linked_component`],
							);
						}
					} else {
						break;
					}
				}
			}
		}
		this.changeDetector.detectChanges();
		this.layoutService.backupId++;
	}
	toggleLinkedStatement(secIndex, dashboardIndex, optionIndex) {
		this.invertUIPropertyOptions(
			this.layoutService.lastI,
			this.layoutService.lastK,
			'linkedStatementCheck',
			optionIndex,
			false,
		);
		if (
			this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
				optionIndex
			].linkedStatementCheck
		) {
			this.setUIPropertyOptions(
				this.layoutService.lastI,
				this.layoutService.lastK,
				'linkedStatement',
				'',
				optionIndex,
				false,
			);
		}
		this.layoutService.backupId++;
	}
	toggleDefaultValueSwitch(secIndex, dashboardIndex, optionIndex) {
		let i = -1;
		for (let option of this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj
			.options) {
			i++;
			this.updateBackUpTask('type', `defaultValue`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(secIndex, dashboardIndex, i, 'option');
			this.updateBackUpTask('oldObject', option[`defaultValue`]);
			option.defaultValue = false;
			this.updateBackUpTask('newObject', option[`defaultValue`]);
		}
		this.updateBackUpTask('type', `defaultValue`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(secIndex, dashboardIndex, optionIndex, 'option');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
				optionIndex
			][`defaultValue`],
		);
		this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
			optionIndex
		].defaultValue =
			!this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
				optionIndex
			].defaultValue;
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
				optionIndex
			][`defaultValue`],
		);
		this.subjectService.selectByDefaultChange({
			index: optionIndex,
			check:
				this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
					optionIndex
				][`defaultValue`],
			uicomponent_name:
				this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj
					.uicomponent_name,
		});
		this.refreshObject();
		this.layoutService.backupId++;
	}
	toggleDefaultValue(secIndex, dashboardIndex, optionIndex) {
		let i = -1;
		if (
			this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.type ==
				this.uicomponentTypes.DROPDOWN &&
			!this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.isMultiSelect
		) {
			for (let option of this.layoutService.template.sections[secIndex].dashboard[dashboardIndex]
				.obj?.options) {
				i++;
				if (option.defaultValue == true && i != optionIndex) {
					this.updateBackUpTask('type', `defaultValue`);
					this.updateBackUpTask('id', this.layoutService.backupId);
					this.updateIndexes(secIndex, dashboardIndex, i, 'option');
					this.updateBackUpTask('oldObject', option[`defaultValue`]);
					option.defaultValue = false;
					this.updateBackUpTask('newObject', option[`defaultValue`]);
				}
			}
		}
		this.updateBackUpTask('type', `defaultValue`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(secIndex, dashboardIndex, optionIndex, 'option');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
				optionIndex
			][`defaultValue`],
		);
		this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
			optionIndex
		].defaultValue =
			!this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
				optionIndex
			].defaultValue;
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
				optionIndex
			][`defaultValue`],
		);
		this.subjectService.selectByDefaultChange({
			index: optionIndex,
			check:
				this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
					optionIndex
				][`defaultValue`],
			uicomponent_name:
				this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj
					.uicomponent_name,
		});
		this.refreshObject();
		this.layoutService.backupId++;
	}
	toggleLinkedStatementInput(secIndex, dashboardIndex) {
		this.updateBackUpTask('type', `linkedStatementCheck`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(secIndex, dashboardIndex, -1, 'obj');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj[
				`linkedStatementCheck`
			],
		);
		this.layoutService.template.sections[secIndex].dashboard[
			dashboardIndex
		].obj.linkedStatementCheck =
			!this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj
				.linkedStatementCheck;
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj[
				`linkedStatementCheck`
			],
		);
		if (
			this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj
				.linkedStatementCheck
		) {
			this.updateBackUpTask('type', `linkedStatement`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(secIndex, dashboardIndex, -1, 'obj');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj[
					`linkedStatement`
				],
			);
			this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.linkedStatement =
				'';
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj[
					`linkedStatement`
				],
			);
		}
		this.layoutService.backupId++;
	}
	public linkSecClick(secIndex, dashboardIndex, optionIndex) {
		this.updateBackUpTask('type', `link`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(secIndex, dashboardIndex, optionIndex, 'option');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
				optionIndex
			][`link`],
		);
		this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
			optionIndex
		].link =
			!this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
				optionIndex
			].link;
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
				optionIndex
			][`link`],
		);
		if (
			!this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
				optionIndex
			].link
		) {
			for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
				if (
					this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
						optionIndex
					]['selectedLinkSection'].id == this.layoutService.template.sections[i].id
				) {
					this.updateBackUpTask('type', `selectedLinkSection`);
					this.updateBackUpTask('id', this.layoutService.backupId);
					this.updateIndexes(secIndex, dashboardIndex, optionIndex, 'option');
					this.updateBackUpTask(
						'oldObject',
						this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
							optionIndex
						][`selectedLinkSection`],
					);
					this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
						optionIndex
					]['selectedLinkSection'] = {};
					this.updateBackUpTask(
						'newObject',
						this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
							optionIndex
						][`selectedLinkSection`],
					);
					this.updateBackUpTask('type', `linked_component`);
					this.updateBackUpTask('id', this.layoutService.backupId);
					this.updateIndexes(i, -1, -1, 'section');
					this.updateBackUpTask(
						'oldObject',
						this.layoutService.template.sections[i][`linked_component`],
					);
					this.layoutService.template.sections[i]['linked_component']--;
					this.updateBackUpTask(
						'newObject',
						this.layoutService.template.sections[i][`linked_component`],
					);
					if (
						this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
							optionIndex
						].selected
					) {
						this.updateBackUpTask('type', `selected_linked_component`);
						this.updateBackUpTask('id', this.layoutService.backupId);
						this.updateIndexes(i, -1, -1, 'section');
						this.updateBackUpTask(
							'oldObject',
							this.layoutService.template.sections[i][`selected_linked_component`],
						);
						this.layoutService.template.sections[i]['selected_linked_component']--;
						this.updateBackUpTask(
							'newObject',
							this.layoutService.template.sections[i][`selected_linked_component`],
						);
					}
					for (let j = i + 1; j < this.layoutService.template.sections?.length; j++) {
						if (
							this.layoutService.template.sections[j].parentId == 0 ||
							this.layoutService.template.sections[j].parentId ==
								this.layoutService.template.sections[i].parentId
						) {
							break;
						}
						this.updateBackUpTask('type', `linked_component`);
						this.updateBackUpTask('id', this.layoutService.backupId);
						this.updateIndexes(j, -1, -1, 'section');
						this.updateBackUpTask(
							'oldObject',
							this.layoutService.template.sections[j][`linked_component`],
						);
						this.layoutService.template.sections[j]['linked_component']--;
						this.updateBackUpTask(
							'newObject',
							this.layoutService.template.sections[j][`linked_component`],
						);
						if (
							this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
								optionIndex
							].selected
						) {
							this.updateBackUpTask('type', `selected_linked_component`);
							this.updateBackUpTask('id', this.layoutService.backupId);
							this.updateIndexes(j, -1, -1, 'section');
							this.updateBackUpTask(
								'oldObject',
								this.layoutService.template.sections[j][`selected_linked_component`],
							);
							this.layoutService.template.sections[j]['selected_linked_component']--;
							this.updateBackUpTask(
								'newObject',
								this.layoutService.template.sections[j][`selected_linked_component`],
							);
						}
					}
				}
			}
		}
		this.layoutService.backupId++;
		this.changeDetector.detectChanges();
	}
	linkRowClick(secIndex, dashboardIndex, optionIndex) {
		this.invertUIPropertyOptions(
			this.layoutService.lastI,
			this.layoutService.lastK,
			'linkedRowCheck',
			optionIndex,
			false,
		);
		if (
			!this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
				optionIndex
			].linkedRowCheck
		) {
			for (
				let j: number = 0;
				j < this.layoutService.template.sections[secIndex].dashboard?.length;
				j++
			) {
				if (
					this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
						optionIndex
					]['linkedRowValue'].id ==
					this.layoutService.template.sections[secIndex].dashboard[j].obj.uicomponent_name
				) {
					this.setUIPropertyOptions(
						this.layoutService.lastI,
						this.layoutService.lastK,
						'linkedRowValue',
						{},
						optionIndex,
						false,
					);
					this.setUIProperty(
						secIndex,
						j,
						'linked_row',
						this.layoutService.template.sections[secIndex].dashboard[j].obj['linked_row'] - 1,
						false,
					);
					if (
						this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
							optionIndex
						].selected
					) {
						this.setUIProperty(
							secIndex,
							j,
							'selected_linked_row',
							this.layoutService.template.sections[secIndex].dashboard[j].obj[
								'selected_linked_row'
							] - 1,
							false,
						);
					}
				}
			}
		}
		this.layoutService.backupId++;
		this.changeDetector.detectChanges();
	}
	linkUIClick(secIndex, dashboardIndex, optionIndex) {
		this.invertUIPropertyOptions(
			this.layoutService.lastI,
			this.layoutService.lastK,
			'linkedUICheck',
			optionIndex,
			false,
		);
		if (
			!this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
				optionIndex
			].linkedUICheck
		) {
			for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
				for (let j: number = 0; j < this.layoutService.template.sections[i].dashboard?.length; j++) {
					if (
						this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
							optionIndex
						]['selectedLinkUi'].id ==
						this.layoutService.template.sections[i].dashboard[j].obj.uicomponent_name
					) {
						this.setUIPropertyOptions(
							this.layoutService.lastI,
							this.layoutService.lastK,
							'selectedLinkUi',
							{},
							optionIndex,
							false,
						);
						this.setUIProperty(
							i,
							j,
							'linked_ui',
							this.layoutService.template.sections[i].dashboard[j].obj['linked_ui'] - 1,
							false,
						);
						if (
							this.layoutService.template.sections[secIndex].dashboard[dashboardIndex].obj.options[
								optionIndex
							].selected
						) {
							this.setUIProperty(
								i,
								j,
								'selected_linked_ui_component',
								this.layoutService.template.sections[i].dashboard[j].obj[
									'selected_linked_ui_component'
								] - 1,
								false,
							);
						}
					}
				}
			}
		}
		this.layoutService.backupId++;
		this.changeDetector.detectChanges();
	}
	async removeAllOptions(obj: any, remove: boolean = true, check: boolean = true) {
		remove = Boolean(remove);
		obj['noOptions'] = remove;
		if (obj['noOptions']) {
			if (check) {
				// this.coolDialogs
				// 	.confirm('This will remove all options', {
				// 		okButtonText: 'OK',
				// 		cancelButtonText: 'Cancel',
				// 	})
				this.bsModalRef = this.modalServiceDialog.show(ConfirmationDialogComponent, {
					initialState: {
					  message: 'This will remove all options'
					},
					class: 'modal-dialog-centered'
				  });
				  this.bsModalRef.content.result
					.subscribe(async (res) => {
						if (res) {
							obj['options'] = [];
						} else {
							obj['noOptions'] = !obj['noOptions'];
						}
						this.layoutService.updateComponents();
					});
			} else {
				obj['options'] = [];
				this.layoutService.updateComponents();
			}
		} else {
			if (check) {
				// this.coolDialogs
				// 	.confirm('This will reset all options', {
				// 		okButtonText: 'OK',
				// 		cancelButtonText: 'Cancel',
				// 	})
				this.bsModalRef = this.modalServiceDialog.show(ConfirmationDialogComponent, {
					initialState: {
					  message: 'This will reset all options.'
					},
					class: 'modal-dialog-centered'
				  });
				  this.bsModalRef.content.result
					.subscribe(async (res) => {
						if (res) {
							if (obj.type === this.uicomponentTypes.RADIO) {
								obj['options'] = this.radioObject.options;
							} else if (obj.type === this.uicomponentTypes.CHECKBOX) {
								await this.SelectManualOptions();
								obj['manualoptions'] = true;
								obj['options'] = this.checkboxObject.options;
							} else if (obj.type === this.uicomponentTypes.SWITCH) {
								obj['options'] = this.switchObj.options;
							} else if (obj.type === this.uicomponentTypes.DROPDOWN) {
								await this.SelectManualOptions();
								obj['manualoptions'] = true;
								obj['options'] = this.dropDownObj.options;
							} else if (obj.type === this.uicomponentTypes.INTELLISENSE) {
								await this.SelectManualOptions();
								obj['manualoptions'] = true;
								obj['options'] = this.intellisenseObject.options;
							} else if (obj.type === this.uicomponentTypes.TABLE_DROPDOWN) {
								obj['options'] = this.tableDropDownObj.options;
							}
						} else {
							obj['noOptions'] = !obj['noOptions'];
						}
						this.layoutService.updateComponents();
					});
			} else {
				if (obj.type === this.uicomponentTypes.RADIO) {
					obj['options'] = this.radioObject.options;
				} else if (obj.type === this.uicomponentTypes.CHECKBOX) {
					await this.SelectManualOptions();
					obj['manualoptions'] = true;
					obj['options'] = this.checkboxObject.options;
				} else if (obj.type === this.uicomponentTypes.SWITCH) {
					obj['options'] = this.switchObj.options;
				} else if (obj.type === this.uicomponentTypes.DROPDOWN) {
					await this.SelectManualOptions();
					obj['manualoptions'] = true;
					obj['options'] = this.dropDownObj.options;
				} else if (obj.type === this.uicomponentTypes.INTELLISENSE) {
					await this.SelectManualOptions();
					obj['manualoptions'] = true;
					obj['options'] = this.intellisenseObject.options;
				} else if (obj.type === this.uicomponentTypes.TABLE_DROPDOWN) {
					obj['options'] = this.tableDropDownObj.options;
				}
				this.layoutService.updateComponents();
			}
		}
	}
	onChangeSearch(val: string, type) {
		val = val.trim();
		if (val == ',' || val == '') {
			this.toastrService.error('Empty tag is not allowed!', '', { timeOut: 6000 });
			return;
		}
		if (val.substr(val?.length - 1) == ',') {
			if (!val.replace(/[^a-zA-Z0-9]/g, '')?.length) {
				this.toastrService.error('Tag cannot only contain special characters!', '', {
					timeOut: 6000,
				});
				if (type == 'section') {
					this.auto.query = '';
					this.auto.initialValue = '';
					this.auto.clear();
					this.auto.close();
				} else if (type == 'template') {
					this.tempvals.query = '';
					this.tempvals.initialValue = '';
					this.tempvals.clear();
					this.tempvals.close();
				} else if (type == 'uiComp') {
					this.uitag.query = '';
					this.uitag.initialValue = '';
					this.uitag.clear();
					this.uitag.close();
				}
				return;
			}
			val = val.replace(',', '');
			this.selectEvent(val, type, true);
		}
		let req = {
			tag_title: val,
		};
		this.requestService
			.sendRequest(
				TemaplateManagerUrlsEnum.autoCompleteTags,
				'POST',
				REQUEST_SERVERS.templateManagerUrl,
				req,
			)
			.subscribe(
				(res: any) => {
					this.tagsList = res['data'];
				},
				(err) => {
					console.log(err);
					this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
					this.stopLoader();
				},
			);
	}
	onFocused(e) {}
	selectEvent(item, type, istag?: boolean) {
		let data;
		if (!istag) {
			data = item.title;
		} else {
			data = item;
		}
		if (
			type == 'section' &&
			this.layoutService.template.sections[this.selectedSection].tags.indexOf(data) === -1
		) {
			this.layoutService.template.sections[this.selectedSection].tags.push(data);
			this.auto.query = '';
			this.auto.initialValue = '';
			this.auto.clear();
			this.auto.close();
		} else if (type == 'template' && this.layoutService.template.tags.indexOf(data) === -1) {
			this.layoutService.template.tags.push(data);
			this.tempvals.query = '';
			this.tempvals.initialValue = '';
			this.tempvals.clear();
			this.tempvals.close();
		} else if (
			type == 'uiComp' &&
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.tags.indexOf(data) === -1
		) {
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.tags.push(data);
			this.uitag.query = '';
			this.uitag.initialValue = '';
			this.uitag.clear();
			this.uitag.close();
		} else {
			this.toastrService.error('tag already exist!', '', { timeOut: 6000 });
		}
	}
	tagval: boolean = false;
	onKeyUpCustom(event: KeyboardEvent, category: string, val: string): void {
		const inputValue: string = val;
		this.shiftPressed = false;
		if (event.code === 'Enter') {
			if (!val.replace(/\s/g, '')?.length) {
				this.toastrService.error('Empty tag is not allowed!', '', { timeOut: 6000 });
				if (category == 'section') {
					this.auto.query = '';
					this.auto.initialValue = '';
					this.auto.clear();
					this.auto.close();
				} else if (category == 'template') {
					this.tempvals.query = '';
					this.tempvals.initialValue = '';
					this.tempvals.clear();
					this.tempvals.close();
				} else if (category == 'uiComp') {
					this.uitag.query = '';
					this.uitag.initialValue = '';
					this.uitag.clear();
					this.uitag.close();
				}
				this.form.controls.tag.setValue('');
				return;
			} else if (!val.replace(/[^a-zA-Z0-9]/g, '')?.length) {
				this.toastrService.error('Tag cannot only contain special characters!', '', {
					timeOut: 6000,
				});
				if (category == 'section') {
					this.auto.query = '';
					this.auto.initialValue = '';
					this.auto.clear();
					this.auto.close();
				} else if (category == 'template') {
					this.tempvals.query = '';
					this.tempvals.initialValue = '';
					this.tempvals.clear();
					this.tempvals.close();
				} else if (category == 'uiComp') {
					this.uitag.query = '';
					this.uitag.initialValue = '';
					this.uitag.clear();
					this.uitag.close();
				}
				this.form.controls.tag.setValue('');
				return;
			} else {
				this.tagval = true;
				this.selectEvent(inputValue, category, this.tagval);
				this.form.controls.tag.setValue('');
			}
		}
	}
	addTag(tag: string, category): void {
		if (category == 'template') {
			if (tag[tag?.length - 1] === ',' || tag[tag?.length - 1] === ' ') {
				tag = tag.slice(0, -1);
			}
			if (tag?.length > 0 && !find(this.sectiontags, tag)) {
				this.layoutService.template.tags.push(tag);
			}
		}
		if (category == 'section') {
			if (tag[tag?.length - 1] === ',' || tag[tag?.length - 1] === ' ') {
				tag = tag.slice(0, -1);
			}
			if (tag?.length > 0 && !find(this.sectiontags, tag)) {
				this.layoutService.template.sections[this.selectedSection].tags.push(tag);
			}
		}
		if (category == 'uiComp') {
			if (tag[tag?.length - 1] === ',' || tag[tag?.length - 1] === ' ') {
				tag = tag.slice(0, -1);
			}
			if (tag?.length > 0 && !find(this.sectiontags, tag)) {
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.tags.push(tag);
			}
		}
		this.auto.clear();
	}
	removeTag(category, tag?: string): void {
		if (category == 'section') {
			if (!!tag) {
				pull(this.layoutService.template.sections[this.selectedSection].tags, tag);
			} else {
				this.layoutService.template.sections[this.selectedSection].tags.splice(-1);
			}
		} else if (category == 'template') {
			if (!!tag) {
				pull(this.layoutService.template.tags, tag);
			} else {
				this.layoutService.template.tags.splice(-1);
			}
		} else if (category == 'uiComp') {
			if (!!tag) {
				pull(
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[
						this.layoutService.lastK
					].obj.tags,
					tag,
				);
			} else {
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.tags.splice(-1);
			}
		}
	}
	emptyRowCheck = [];
	amendedAdded = false;
	async makeText(check) {
		if (!this.layoutService.template.sections?.length) {
			return;
		}
		let tableTextCoordinates = [];
		this.checkSectionsTick();
		this.text = true;
		this.topLevelId = -1;
		this.layoutService.componentsService = cloneDeep(this.componentsService);
		this.sessionOverviewTrs = [];
		let previewIndex = -1;
		let headers;
		let seperatePdfArray = [-1];
		this.multiplePDFs = [];
		this.multiplePreviews = [{ title: 'Main PDF', selected: true }];
		for (let t: number = 0; t < this.layoutService.template.sections?.length; t++) {
			if (this.layoutService.template.sections[t].seperatePdf) {
				seperatePdfArray.push(t);
			}
		}
		let instanceNow = JSON.stringify(this.layoutService.template);
		if (
			this.visit_status == 3 &&
			instanceNow != this.originalInstance &&
			!this.layoutService.isInstancePreview &&
			!this.amendedAdded
		) {
			this.layoutService.template.template_name =
				this.layoutService.template.template_name + '(Amended)';
			this.amendedAdded = true;
		}
		for (let pdfIndex: number = 0; pdfIndex < seperatePdfArray?.length; pdfIndex++) {
			let t = seperatePdfArray[pdfIndex];
			let mainPdfCheck = false;
			if (t == -1) {
				mainPdfCheck = true;
			}
			let childrenIndex = t;
			let currentDepth: number = 0;
			if (t != -1) {
				currentDepth = this.layoutService.template.sections[t].secNo.split('.')?.length - 1;
			}
			for (let j = t + 1; j < this.layoutService.template.sections?.length; j++) {
				if (t == -1) {
					childrenIndex = this.layoutService.template.sections?.length - 1;
					t = 0;
					break;
				}
				let tempDepth = this.layoutService.template.sections[j].secNo.split('.')?.length - 1;
				if (tempDepth > currentDepth) {
					childrenIndex = j;
				} else {
					break;
				}
			}
			for (; t < childrenIndex + 1; t++) {
				if (!this.layoutService.template.sections[t].mainPdf && mainPdfCheck) {
					continue;
				}
				if (
					this.layoutService.template.sections[t].linked_component > 0 &&
					this.layoutService.template.sections[t].selected_linked_component !=
						this.layoutService.template.sections[t].linked_component
				) {
					continue;
				} else {
					previewIndex++;
				}
				let sub = false;
				if (
					this.layoutService.template.sections[t].boundSectionStatement == '' ||
					this.layoutService.template.sections[t].boundSectionStatement == ' ' ||
					this.layoutService.template.sections[t].boundSectionStatement == '&nbsp;'
				) {
					sub = true;
				}
				this.sessionOverviewTrs.push({
					dashboard: new Array(this.layoutService.template.sections[t].options.maxRows),
					section_title: this.layoutService.template.sections[t].section_title,
					errors: this.layoutService.template.sections[t].errors,
					section_No: this.layoutService.template.sections[t].secNo,
					cols: this.layoutService.template.sections[t].options.maxCols,
					hideSectionName: this.layoutService.template.sections[t].hideSectionName,
					theme: this.layoutService.template.sections[t].theme,
					sectionBorders: this.layoutService.template.sections[t].sectionBorders,
					completeBorder: this.layoutService.template.sections[t].completeBorder,
					is_table: this.layoutService.template.sections[t].is_table,
					leftSectionBorder: this.layoutService.template.sections[t].leftSectionBorder,
					topSectionPadding: this.layoutService.template.sections[t].topSectionPadding,
					topSectionBorder: this.layoutService.template.sections[t].topSectionBorder,
					bottomSectionBorder: this.layoutService.template.sections[t].bottomSectionBorder,
					rightSectionBorder: this.layoutService.template.sections[t].rightSectionBorder,
					printNewPage: this.layoutService.template.sections[t].printNewPage,
				});
				for (let i: number = 0; i < this.layoutService.template.sections[t].dashboard?.length; i++) {
					let valueText: any = '';
					let options: any = null;
					let hidePdfCheck: boolean = false;
					switch (this.layoutService.template.sections[t].dashboard[i].obj.hidePdf) {
						case 0:
							break;
						case 1:
							hidePdfCheck = true;
							break;
						case 2:
							if (this.layoutService.template.sections[t].dashboard[i].obj.type == 'input') {
								if (this.layoutService.template.sections[t].dashboard[i].obj.input == '') {
									hidePdfCheck = true;
								}
							} else {
								if (
									!(
										this.layoutService.template.sections[t].dashboard[i].obj.answers[0] &&
										this.layoutService.template.sections[t].dashboard[i].obj.answers[0].answer != ''
									)
								) {
									hidePdfCheck = true;
								}
							}
							break;
						case 3:
							switch (this.layoutService.template.sections[t].dashboard[i].obj.type) {
								case this.uicomponentTypes.INPUT:
									if (
										this.layoutService.template.sections[t].dashboard[i].obj.defaultValue ==
										this.layoutService.template.sections[t].dashboard[i].obj.input
									) {
										hidePdfCheck = true;
									}
									break;
								case this.uicomponentTypes.CHECKBOX:
								case this.uicomponentTypes.DROPDOWN:
								case this.uicomponentTypes.SWITCH:
								case this.uicomponentTypes.INTELLISENSE:
								case this.uicomponentTypes.RADIO:
									hidePdfCheck = true;
									for (let option of this.layoutService.template.sections[t].dashboard[i].obj
										.options) {
										if (
											(option.selected && !option.defaultValue) ||
											(!option.selected && option.defaultValue)
										) {
											hidePdfCheck = false;
										}
									}
									break;
								case this.uicomponentTypes.INCREMENT:
								case this.uicomponentTypes.INTENSITY:
									if (
										this.layoutService.template.sections[t].dashboard[i].obj.defaultValue ==
										this.layoutService.template.sections[t].dashboard[i].obj.value
									) {
										hidePdfCheck = true;
									}
									break;
							}
							break;
						case 4:
							switch (this.layoutService.template.sections[t].dashboard[i].obj.type) {
								case this.uicomponentTypes.INPUT:
									if (
										this.layoutService.template.sections[t].dashboard[i].obj.defaultValue !=
											this.layoutService.template.sections[t].dashboard[i].obj.input &&
										this.layoutService.template.sections[t].dashboard[i].obj.input == ''
									) {
										hidePdfCheck = true;
									}
									break;
								case this.uicomponentTypes.CHECKBOX:
								case this.uicomponentTypes.DROPDOWN:
								case this.uicomponentTypes.SWITCH:
								case this.uicomponentTypes.INTELLISENSE:
								case this.uicomponentTypes.RADIO:
									let defaultCheck = false;
									let selectedCheck = false;
									for (let option of this.layoutService.template.sections[t].dashboard[i].obj
										.options) {
										if (option.defaultValue) {
											defaultCheck = true;
										}
										if (option.selected) {
											selectedCheck = true;
										}
									}
									if (defaultCheck && !selectedCheck) {
										hidePdfCheck = true;
									}
									break;
								case this.uicomponentTypes.INCREMENT:
								case this.uicomponentTypes.INTENSITY:
									if (
										this.layoutService.template.sections[t].dashboard[i].obj.defaultValue !=
											this.layoutService.template.sections[t].dashboard[i].obj.value &&
										this.layoutService.template.sections[t].dashboard[i].obj.value == ''
									) {
										hidePdfCheck = true;
									}
									break;
							}
							break;
						default:
							break;
					}
					let hideThisItem = false;
					if (this.layoutService.template.sections[t].is_table) {
						if (
							this.layoutService.template.sections[t].dashboard[i].x == 0 &&
							this.layoutService.template.sections[t].dashboard[i].obj.type == this.uicomponentTypes.TEXT
						) {
							if (
								this.layoutService.template.sections[t].dashboard[i].obj.linked_row !=
								this.layoutService.template.sections[t].dashboard[i].obj.selected_linked_row
							) {
								tableTextCoordinates.push({
									x: this.layoutService.template.sections[t].dashboard[i].x,
									y: this.layoutService.template.sections[t].dashboard[i].y,
									rows: this.layoutService.template.sections[t].dashboard[i].rows,
									cols: this.layoutService.template.sections[t].dashboard[i].cols,
								});
								hideThisItem = true;
							} else {
								hideThisItem = false;
							}
						} else if (this.layoutService.template.sections[t].dashboard[i].y != 0) {
							for (let coordinate of tableTextCoordinates) {
								if (
									this.layoutService.template.sections[t].dashboard[i].y >= coordinate.y &&
									this.layoutService.template.sections[t].dashboard[i].y <
										coordinate.y + coordinate.rows
								) {
									hideThisItem = true;
								} else {
									hideThisItem = false;
								}
							}
						}
					}
					if (
						!hidePdfCheck &&
						!hideThisItem &&
						((this.layoutService.template.sections[t].dashboard[i].obj
							.selected_linked_ui_component ==
							this.layoutService.template.sections[t].dashboard[i].obj.linked_ui &&
							!this.layoutService.template.sections[t].dashboard[i].obj.is_single_select) ||
							this.layoutService.template.sections[t].dashboard[i].obj
								.selected_linked_ui_component ||
							this.layoutService.template.sections[t].dashboard[i].obj.linked_ui == 0)
					) {
						if (this.layoutService.template.sections[t].dashboard[i].obj.type === this.uicomponentTypes.TEXT) {
							options = null;
							valueText =
								this.layoutService.template.sections[t].dashboard[i].obj.instanceStatement || '';
							valueText = valueText.replace(/(?:\r\n|\r|\n)/g, '<br>');
						} else if (
							this.layoutService.template.sections[t].dashboard[i].obj.type === this.uicomponentTypes.TABLE_DROPDOWN
						) {
							options = null;
							valueText =
								this.layoutService.template.sections[t].dashboard[i].obj.instanceStatement || '';
							valueText = valueText.replace(/(?:\r\n|\r|\n)/g, '<br>');
						} else if (
							this.layoutService.template.sections[t].dashboard[i].obj.type === this.uicomponentTypes.CALCULATION
						) {
							options = null;
							valueText =
								this.layoutService.template.sections[t].dashboard[i].obj.instanceStatement;
							if (this.layoutService.template.sections[t].dashboard[i].obj.answers[0]) {
								valueText =
									valueText +
									' ' +
									this.layoutService.template.sections[t].dashboard[i].obj.answers[0].answer;
							} else {
								valueText = '';
							}
							valueText = valueText.replace(/(?:\r\n|\r|\n)/g, '<br>');
						} else if (this.layoutService.template.sections[t].dashboard[i].obj.type === this.uicomponentTypes.INPUT) {
							options = null;
							let tempEditorString = this.layoutService.template.sections[t].dashboard[i].obj.input;
							if (
								this.layoutService.template.sections[t].dashboard[i].obj.validationValue.value ==
									'Date' ||
								this.layoutService.template.sections[t].dashboard[i].obj.validationValue.value ==
									'Datetime'
							) {
								let formattedDate = moment
									.utc(tempEditorString)
									.format(
										this.layoutService.template.sections[t].dashboard[i].obj.formatValue.slug
											? this.layoutService.template.sections[t].dashboard[i].obj.formatValue.slug
											: 'DD/MM/YYYY',
									);
								tempEditorString = formattedDate;
								this.layoutService.template.sections[t].dashboard[i].obj.input = tempEditorString;
							} else if (
								this.layoutService.template.sections[t].dashboard[i].obj.validationValue.value ==
								'Time'
							) {
								let formattedDate = moment(
									tempEditorString,
									this.layoutService.template.sections[t].dashboard[i].obj.formatValue.slug,
								);
								tempEditorString = formattedDate.format(
									this.layoutService.template.sections[t].dashboard[i].obj.formatValue.slug,
								);
								this.layoutService.template.sections[t].dashboard[i].obj.input = tempEditorString;
							}
							tempEditorString = this.layoutService.applyEditor(
								this.layoutService.template.sections[t].dashboard[i].obj,
								tempEditorString,
							);
							if (
								this.layoutService.template.sections[t].dashboard[i].obj.isStatement ||
								this.layoutService.template.sections[t].dashboard[i].obj.preDefinedObj
							) {
								let tempString = '';
								tempString =
									this.layoutService.template.sections[t].dashboard[i].obj.instanceStatement;
								if (this.layoutService.template.sections[t].dashboard[i].obj.sameLineInput) {
									valueText = tempString + ' ' + tempEditorString;
								} else {
									valueText = tempString + '\n' + tempEditorString;
								}
							} else {
								valueText = tempEditorString;
							}
							if (!tempEditorString?.length || tempEditorString == '') {
								valueText = '';
							}
							valueText = valueText.replace(/(?:\r\n|\r|\n)/g, '<br>');
						} else if (this.layoutService.template.sections[t].dashboard[i].obj.type === this.uicomponentTypes.RADIO) {
							options = [];
							if (this.layoutService.template.sections[t].dashboard[i].obj.isStatement) {
								valueText =
									(this.layoutService.template.sections[t].dashboard[i].obj.instanceStatement ||
										'') + '  ';
								valueText = valueText.replace(/(?:\r\n|\r|\n)/g, '<br>');
							}
							if (this.layoutService.template.sections[t].dashboard[i].obj.answers?.length == 0) {
								valueText = '';
							}
							for (
								let x: number = 0;
								x < this.layoutService.template.sections[t].dashboard[i].obj.options?.length;
								x++
							) {
								if (!this.layoutService.template.sections[t].dashboard[i].obj.showCheckBoxes) {
									if (
										this.layoutService.template.sections[t].dashboard[i].obj.options[x].selected &&
										!(
											this.layoutService.template.sections[t].dashboard[i].obj.options[x].link &&
											this.layoutService.template.sections[t].dashboard[i].obj.options[x].hide
										)
									) {
										let input: string = '';
										let label: string = '';
										label =
											this.layoutService.template.sections[t].dashboard[i].obj.options[x]
												.instanceLabel;
										if (!this.layoutService.template.sections[t].dashboard[i].obj.displayOption) {
											label = '&#11044';
										}
										if (this.layoutService.template.sections[t].dashboard[i].obj.options[x].input) {
											input =
												this.layoutService.template.sections[t].dashboard[i].obj.options[x]
													.instanceInputValue;
											if (
												this.layoutService.template.sections[t].dashboard[i].obj.options[x]
													.validationValue.value == 'Date' ||
												this.layoutService.template.sections[t].dashboard[i].obj.options[x]
													.validationValue.value == 'Datetime'
											) {
												let formattedDate = moment
													.utc(input)
													.format(
														this.layoutService.template.sections[t].dashboard[i].obj.options[x]
															.formatValue.slug
															? this.layoutService.template.sections[t].dashboard[i].obj.options[x]
																	.formatValue.slug
															: 'DD/MM/YYYY',
													);
												input = formattedDate;
												this.layoutService.template.sections[t].dashboard[i].obj.options[x].input =
													input;
											} else if (
												this.layoutService.template.sections[t].dashboard[i].obj.options[x]
													.validationValue.value == 'Time'
											) {
												let formattedDate = moment(
													input,
													this.layoutService.template.sections[t].dashboard[i].obj.options[x]
														.formatValue.slug,
												);
												input = formattedDate.format(
													this.layoutService.template.sections[t].dashboard[i].obj.options[x]
														.formatValue.slug,
												);
												this.layoutService.template.sections[t].dashboard[i].obj.options[x].input =
													input;
											}
											input = this.layoutService.applyEditor(
												this.layoutService.template.sections[t].dashboard[i].obj.options[x],
												input,
											);
										}
										if (
											'showOption' in
												this.layoutService.template.sections[t].dashboard[i].obj.options[x] &&
											!this.layoutService.template.sections[t].dashboard[i].obj.options[x]
												.showOption
										) {
											label = '';
										}
										input = input.replace(/(?:\r\n|\r|\n)/g, '<br>');
										options.push({ label, input, selected: true });
									}
								} else {
									if (
										!(
											this.layoutService.template.sections[t].dashboard[i].obj.options[x].link &&
											this.layoutService.template.sections[t].dashboard[i].obj.options[x].hide
										)
									) {
										let input: string = '';
										let label: string = '';
										label =
											this.layoutService.template.sections[t].dashboard[i].obj.options[x]
												.instanceLabel;
										if (!this.layoutService.template.sections[t].dashboard[i].obj.displayOption) {
											if (
												this.layoutService.template.sections[t].dashboard[i].obj.options[x].selected
											) {
												label = '&#11044';
											} else {
												label = '&#9711';
											}
										} else {
											if (
												this.layoutService.template.sections[t].dashboard[i].obj.options[x].selected
											) {
												label = '&#11044' + label;
											} else {
												label = '&#9711' + label;
											}
										}
										if (this.layoutService.template.sections[t].dashboard[i].obj.options[x].input) {
											input =
												this.layoutService.template.sections[t].dashboard[i].obj.options[x]
													.instanceInputValue;
											if (
												this.layoutService.template.sections[t].dashboard[i].obj.options[x]
													.validationValue.value == 'Date' ||
												this.layoutService.template.sections[t].dashboard[i].obj.options[x]
													.validationValue.value == 'Datetime'
											) {
												let formattedDate = moment
													.utc(input)
													.format(
														this.layoutService.template.sections[t].dashboard[i].obj.options[x]
															.formatValue.slug
															? this.layoutService.template.sections[t].dashboard[i].obj.options[x]
																	.formatValue.slug
															: 'DD/MM/YYYY',
													);
												input = formattedDate;
												this.layoutService.template.sections[t].dashboard[i].obj.options[x].input =
													input;
											} else if (
												this.layoutService.template.sections[t].dashboard[i].obj.options[x]
													.validationValue.value == 'Time'
											) {
												let formattedDate = moment(
													input,
													this.layoutService.template.sections[t].dashboard[i].obj.options[x]
														.formatValue.slug,
												);
												input = formattedDate.format(
													this.layoutService.template.sections[t].dashboard[i].obj.options[x]
														.formatValue.slug,
												);
												this.layoutService.template.sections[t].dashboard[i].obj.options[x].input =
													input;
											}
											input = this.layoutService.applyEditor(
												this.layoutService.template.sections[t].dashboard[i].obj.options[x],
												input,
											);
										}
										if (
											'showOption' in
												this.layoutService.template.sections[t].dashboard[i].obj.options[x] &&
											!this.layoutService.template.sections[t].dashboard[i].obj.options[x]
												.showOption
										) {
											label = '';
										}
										input = input.replace(/(?:\r\n|\r|\n)/g, '<br>');
										options.push({ label, input });
									}
								}
							}
						} else if (
							this.layoutService.template.sections[t].dashboard[i].obj.type === this.uicomponentTypes.CHECKBOX
						) {
							options = [];
							if (this.layoutService.template.sections[t].dashboard[i].obj.isStatement) {
								valueText =
									this.layoutService.template.sections[t].dashboard[i].obj.instanceStatement || '';
								valueText = valueText.replace(/(?:\r\n|\r|\n)/g, '<br>');
							}
							if (this.layoutService.template.sections[t].dashboard[i].obj.answers?.length == 0) {
								valueText = '';
							}
							for (
								let x: number = 0;
								x < this.layoutService.template.sections[t].dashboard[i].obj.options?.length;
								x++
							) {
								if (!this.layoutService.template.sections[t].dashboard[i].obj.showCheckBoxes) {
									if (
										this.layoutService.template.sections[t].dashboard[i].obj.options[x].selected &&
										!(
											this.layoutService.template.sections[t].dashboard[i].obj.options[x].link &&
											this.layoutService.template.sections[t].dashboard[i].obj.options[x].hide
										)
									) {
										let input: string = '';
										let label: string = '';
										label =
											this.layoutService.template.sections[t].dashboard[i].obj.options[x]
												.instanceLabel;
										if (this.layoutService.template.sections[t].dashboard[i].obj.options[x].input) {
											input =
												this.layoutService.template.sections[t].dashboard[i].obj.options[x]
													.instanceInputValue;
											if (
												this.layoutService.template.sections[t].dashboard[i].obj.options[x]
													.validationValue.value == 'Date' ||
												this.layoutService.template.sections[t].dashboard[i].obj.options[x]
													.validationValue.value == 'Datetime'
											) {
												let formattedDate = moment
													.utc(input)
													.format(
														this.layoutService.template.sections[t].dashboard[i].obj.options[x]
															.formatValue.slug
															? this.layoutService.template.sections[t].dashboard[i].obj.options[x]
																	.formatValue.slug
															: 'DD/MM/YYYY',
													);
												input = formattedDate;
												this.layoutService.template.sections[t].dashboard[i].obj.options[x].input =
													input;
											} else if (
												this.layoutService.template.sections[t].dashboard[i].obj.options[x]
													.validationValue.value == 'Time'
											) {
												let formattedDate = moment(
													input,
													this.layoutService.template.sections[t].dashboard[i].obj.options[x]
														.formatValue.slug,
												);
												input = formattedDate.format(
													this.layoutService.template.sections[t].dashboard[i].obj.options[x]
														.formatValue.slug,
												);
												this.layoutService.template.sections[t].dashboard[i].obj.options[x].input =
													input;
											}
											input = this.layoutService.applyEditor(
												this.layoutService.template.sections[t].dashboard[i].obj.options[x],
												input,
											);
										}
										if (!this.layoutService.template.sections[t].dashboard[i].obj.displayOption) {
											options.push({ displayCheck: true, selected: true });
										} else {
											if (
												'showOption' in
													this.layoutService.template.sections[t].dashboard[i].obj.options[x] &&
												!this.layoutService.template.sections[t].dashboard[i].obj.options[x]
													.showOption
											) {
												label = '';
											}
											input = input.replace(/(?:\r\n|\r|\n)/g, '<br>');
											options.push({ label, input, selected: true });
										}
									}
								} else {
									if (
										!(
											this.layoutService.template.sections[t].dashboard[i].obj.options[x].link &&
											this.layoutService.template.sections[t].dashboard[i].obj.options[x].hide
										)
									) {
										let input: string = '';
										let label: string = '';
										label =
											this.layoutService.template.sections[t].dashboard[i].obj.options[x]
												.instanceLabel;
										if (this.layoutService.template.sections[t].dashboard[i].obj.options[x].input) {
											input =
												this.layoutService.template.sections[t].dashboard[i].obj.options[x]
													.instanceInputValue;
											if (
												this.layoutService.template.sections[t].dashboard[i].obj.options[x]
													.validationValue.value == 'Date' ||
												this.layoutService.template.sections[t].dashboard[i].obj.options[x]
													.validationValue.value == 'Datetime'
											) {
												let formattedDate = moment
													.utc(input)
													.format(
														this.layoutService.template.sections[t].dashboard[i].obj.options[x]
															.formatValue.slug
															? this.layoutService.template.sections[t].dashboard[i].obj.options[x]
																	.formatValue.slug
															: 'DD/MM/YYYY',
													);
												input = formattedDate;
												this.layoutService.template.sections[t].dashboard[i].obj.options[x].input =
													input;
											} else if (
												this.layoutService.template.sections[t].dashboard[i].obj.options[x]
													.validationValue.value == 'Time'
											) {
												let formattedDate = moment(
													input,
													this.layoutService.template.sections[t].dashboard[i].obj.options[x]
														.formatValue.slug,
												);
												input = formattedDate.format(
													this.layoutService.template.sections[t].dashboard[i].obj.options[x]
														.formatValue.slug,
												);
												this.layoutService.template.sections[t].dashboard[i].obj.options[x].input =
													input;
											}
											input = this.layoutService.applyEditor(
												this.layoutService.template.sections[t].dashboard[i].obj.options[x],
												input,
											);
										}
										if (!this.layoutService.template.sections[t].dashboard[i].obj.displayOption) {
											if (
												this.layoutService.template.sections[t].dashboard[i].obj.options[x].selected
											) {
												options.push({ displayCheck: true, selected: true });
											} else {
												options.push({ displayCheck: true, selected: false });
											}
										} else {
											if (
												'showOption' in
													this.layoutService.template.sections[t].dashboard[i].obj.options[x] &&
												!this.layoutService.template.sections[t].dashboard[i].obj.options[x]
													.showOption
											) {
												label = '';
											}
											input = input.replace(/(?:\r\n|\r|\n)/g, '<br>');
											if (
												this.layoutService.template.sections[t].dashboard[i].obj.options[x].selected
											) {
												options.push({ label, input, selected: true });
											} else {
												options.push({ label, input, selected: false });
											}
										}
									}
								}
							}
						} else if (this.layoutService.template.sections[t].dashboard[i].obj.type === this.uicomponentTypes.SWITCH) {
							options = [];
							if (this.layoutService.template.sections[t].dashboard[i].obj.isStatement) {
								valueText =
									(this.layoutService.template.sections[t].dashboard[i].obj.instanceStatement ||
										'') + '  ';
								valueText = valueText.replace(/(?:\r\n|\r|\n)/g, '<br>');
							}
							if (this.layoutService.template.sections[t].dashboard[i].obj.answers?.length == 0) {
								valueText = '';
							}
							for (
								let x: number = 0;
								x < this.layoutService.template.sections[t].dashboard[i].obj.options?.length;
								x++
							) {
								if (
									this.layoutService.template.sections[t].dashboard[i].obj.options[x].selected &&
									!(
										this.layoutService.template.sections[t].dashboard[i].obj.options[x].link &&
										this.layoutService.template.sections[t].dashboard[i].obj.options[x].hide
									)
								) {
									let input: string = '';
									let label: string = '';
									label =
										this.layoutService.template.sections[t].dashboard[i].obj.options[x]
											.instanceLabel;
									options.push({ label, input, selected: true });
								}
							}
						} else if (this.layoutService.template.sections[t].dashboard[i].obj.type === this.uicomponentTypes.LINE) {
							options = [];
							valueText = '';
							options.push({
								line: true,
								object: this.layoutService.template.sections[t].dashboard[i].obj,
								selected: true,
							});
						} else if (
							this.layoutService.template.sections[t].dashboard[i].obj.type === this.uicomponentTypes.DROPDOWN
						) {
							options = [];
							if (this.layoutService.template.sections[t].dashboard[i].obj.isStatement) {
								valueText =
									(this.layoutService.template.sections[t].dashboard[i].obj.instanceStatement ||
										'') + '  ';
								valueText = valueText.replace(/(?:\r\n|\r|\n)/g, '<br>');
							}
							if (this.layoutService.template.sections[t].dashboard[i].obj.answers?.length == 0) {
								valueText = '';
							}
							for (
								let x: number = 0;
								x < this.layoutService.template.sections[t].dashboard[i].obj.options?.length;
								x++
							) {
								if (
									this.layoutService.template.sections[t].dashboard[i].obj.options[x].selected &&
									!(
										this.layoutService.template.sections[t].dashboard[i].obj.options[x].link &&
										this.layoutService.template.sections[t].dashboard[i].obj.options[x].hide
									)
								) {
									let input: string = '';
									let label: string = '';
									label =
										this.layoutService.template.sections[t].dashboard[i].obj.options[x]
											.instanceLabel;
									options.push({ label, input, selected: true });
								}
							}
						} else if (
							this.layoutService.template.sections[t].dashboard[i].obj.type === this.uicomponentTypes.INTELLISENSE
						) {
							options = [];
							if (this.layoutService.template.sections[t].dashboard[i].obj.isStatement) {
								valueText =
									this.layoutService.template.sections[t].dashboard[i].obj.instanceStatement || '';
								valueText = valueText.replace(/(?:\r\n|\r|\n)/g, '<br>');
							}
							if (this.layoutService.template.sections[t].dashboard[i].obj.answers?.length == 0) {
								valueText = '';
							}
							for (
								let x: number = 0;
								x < this.layoutService.template.sections[t].dashboard[i].obj.options?.length;
								x++
							) {
								if (
									this.layoutService.template.sections[t].dashboard[i].obj.options[x].selected &&
									!(
										this.layoutService.template.sections[t].dashboard[i].obj.options[x].link &&
										this.layoutService.template.sections[t].dashboard[i].obj.options[x].hide
									)
								) {
									let input: string = '';
									let label: string = '';
									label =
										this.layoutService.template.sections[t].dashboard[i].obj.options[x]
											.instanceLabel;
									options.push({ label, input, selected: true });
								}
							}
						} else if (
							this.layoutService.template.sections[t].dashboard[i].obj.type === this.uicomponentTypes.INTENSITY ||
							this.layoutService.template.sections[t].dashboard[i].obj.type === this.uicomponentTypes.INCREMENT
						) {
							options = null;
							if (this.layoutService.template.sections[t].dashboard[i].obj.isStatement) {
								let label = '';
								if (this.layoutService.template.sections[t].dashboard[i].obj.answers[0]) {
									label =
										this.layoutService.template.sections[t].dashboard[i].obj.answers[0].answer;
								}
								valueText =
									(this.layoutService.template.sections[t].dashboard[i].obj.instanceStatement ||
										'') +
									'   ' +
									label;
								valueText = valueText.replace(/(?:\r\n|\r|\n)/g, '<br>');
							} else {
								valueText = JSON.stringify(
									this.layoutService.template.sections[t].dashboard[i].obj.value,
								);
								if (this.layoutService.template.sections[t].dashboard[i].obj.answers[0]) {
									valueText =
										this.layoutService.template.sections[t].dashboard[i].obj.answers[0].answer ||
										'';
								}
								valueText = valueText.replace(/(?:\r\n|\r|\n)/g, '<br>');
							}
							if (this.layoutService.template.sections[t].dashboard[i].obj.answers?.length == 0) {
								valueText = '';
							}
						} else if (
							this.layoutService.template.sections[t].dashboard[i].obj.type === this.uicomponentTypes.DRAWING
						) {
							options = [];
							valueText = this.layoutService.template.sections[t].dashboard[i].obj?.answers[0]?.answer || '';
							options.push({ signature: true, selected: true });
						} else if (this.layoutService.template.sections[t].dashboard[i].obj.type === this.uicomponentTypes.IMAGE_LABEL) {
							options = [];
							if (this.layoutService.template.sections[t].dashboard[i].obj.isStatement) {
								valueText =
									this.layoutService.template.sections[t].dashboard[i].obj.instanceStatement || '';
								valueText = valueText.replace(/(?:\r\n|\r|\n)/g, '<br>');
							}
							for (
								let x: number = 0;
								x < this.layoutService.template.sections[t].dashboard[i].obj.data?.length;
								x++
							) {
								let input: string = '';
								let label: string = '';
								if(this.layoutService.template.sections[t].dashboard[i].obj.data[x].isSelected) {
									label = this.layoutService.template.sections[t].dashboard[i].obj.data[x].label;
									
									if(this.layoutService.template.sections[t].dashboard[i].obj.enableTextInput) {
										label += ` ${this.layoutService.template.sections[t].dashboard[i].obj.data[x].text}`	
									}
									options.push({ label, input, selected: true });
								}
							}
						} else if (
							this.layoutService.template.sections[t].dashboard[i].obj.type === this.uicomponentTypes.SIMPLE_IMAGE
						) {
							options = [];
							if (this.layoutService.template.sections[t].dashboard[i].obj.paths) {
								for (
									let x: number = 0;
									x < this.layoutService.template.sections[t].dashboard[i].obj.paths?.length;
									x++
								) {
									options.push({
										simpleImage: true,
										selected: true,
										imageWidth: this.layoutService.template.sections[t].dashboard[i].obj.width,
										path:
											this.config2.getConfig(REQUEST_SERVERS.templateManagerUrl) +
											this.layoutService.template.sections[t].dashboard[i].obj.paths[x],
									});
								}
							} else {
								options.push({
									simpleImage: true,
									selected: true,
									imageWidth: this.layoutService.template.sections[t].dashboard[i].obj.width,
									path: '',
								});
							}
						} else if (
							this.layoutService.template.sections[t].dashboard[i].obj.type === this.uicomponentTypes.SIGNATURE
						) {
							options = [];
							if (this.layoutService.template.sections[t].dashboard[i].obj.signature_id) {
								valueText = this.layoutService.template.sections[t].dashboard[i].obj.signature_path;
								options.push({ 
									signature: true, 
									selected: true, 
									imageWidth: this.layoutService.template.sections[t].dashboard[i].obj.width 
								});
							} else if (
								this.layoutService?.template?.sections[t]?.dashboard[i]?.obj?.signature?.signature_file &&
								this.layoutService.template.sections[t].dashboard[i].obj.signature?.signature_file
									?.type != null
							) {
								valueText = URL.createObjectURL(
									this.layoutService.template.sections[t].dashboard[i].obj.signature.signature_file,
								);
								valueText = await this.toDataUrl(valueText);
								options.push({ 
									signature: true, 
									selected: true, 
									imageWidth: this.layoutService.template.sections[t].dashboard[i].obj.width  });
							} else {
								valueText = '';
								options.push({ 
									signature: true, 
									selected: true, 
									imageWidth: this.layoutService.template.sections[t].dashboard[i].obj.width 
								});
							}
						}
					} else {
						options = null;
						valueText = '';
					}
					if (
						!this.sessionOverviewTrs[previewIndex]['dashboard'][
							this.layoutService.template.sections[t].dashboard[i].y
						]
					) {
						this.sessionOverviewTrs[previewIndex]['dashboard'][
							this.layoutService.template.sections[t].dashboard[i].y
						] = [];
						if (
							!isNil(this.layoutService.template.sections[t].dashboard[i].obj.OptionView)
						) {
							this.layoutService.template.sections[t].dashboard[i].obj.OptionView = 0;
						}
						if (valueText.replace(/\s/g, '') == '') {
							valueText = '';
						}
						let tempObj = this.convertObjTemplateProperties(
							cloneDeep(this.layoutService.template.sections[t].dashboard[i].obj),
							t,
						);
						this.sessionOverviewTrs[previewIndex]['dashboard'][
							this.layoutService.template.sections[t].dashboard[i].y
						].push({
							rowspan: this.layoutService.template.sections[t].dashboard[i].rows,
							value: valueText,
							option: options,
							colspan: this.layoutService.template.sections[t].dashboard[i].cols,
							x: this.layoutService.template.sections[t].dashboard[i].x,
							y: this.layoutService.template.sections[t].dashboard[i].y,
							obj: tempObj,
						});
					} else {
						for (
							let z: number = 0;
							z <
							this.sessionOverviewTrs[previewIndex]['dashboard'][
								this.layoutService.template.sections[t].dashboard[i].y
							]?.length;
							z++
						) {
							if (
								this.layoutService.template.sections[t].dashboard[i].x <
								this.sessionOverviewTrs[previewIndex]['dashboard'][
									this.layoutService.template.sections[t].dashboard[i].y
								][z].x
							) {
								let tempObj = this.convertObjTemplateProperties(
									cloneDeep(this.layoutService.template.sections[t].dashboard[i].obj),
									t,
								);
								this.sessionOverviewTrs[previewIndex]['dashboard'][
									this.layoutService.template.sections[t].dashboard[i].y
								].splice(z, 0, {
									rowspan: this.layoutService.template.sections[t].dashboard[i].rows,
									value: valueText,
									option: options,
									colspan: this.layoutService.template.sections[t].dashboard[i].cols,
									x: this.layoutService.template.sections[t].dashboard[i].x,
									y: this.layoutService.template.sections[t].dashboard[i].y,
									OptionView: this.layoutService.template.sections[t].dashboard[i].obj.OptionView,
									uiBorders: this.layoutService.template.sections[t].dashboard[i].obj.uiBorders,
									obj: tempObj,
								});
								break;
							} else if (
								this.sessionOverviewTrs[previewIndex]['dashboard'][
									this.layoutService.template.sections[t].dashboard[i].y
								]?.length ===
								z + 1
							) {
								let tempObj = this.convertObjTemplateProperties(
									cloneDeep(this.layoutService.template.sections[t].dashboard[i].obj),
									t,
								);
								this.sessionOverviewTrs[previewIndex]['dashboard'][
									this.layoutService.template.sections[t].dashboard[i].y
								].push({
									rowspan: this.layoutService.template.sections[t].dashboard[i].rows,
									value: valueText,
									option: options,
									colspan: this.layoutService.template.sections[t].dashboard[i].cols,
									x: this.layoutService.template.sections[t].dashboard[i].x,
									y: this.layoutService.template.sections[t].dashboard[i].y,
									OptionView: this.layoutService.template.sections[t].dashboard[i].obj.OptionView,
									uiBorders: this.layoutService.template.sections[t].dashboard[i].obj.uiBorders,
									obj: tempObj,
								});
								break;
							}
						}
					}
				}
			}
			for (let zx: number = 0; zx < this.sessionOverviewTrs?.length; zx++) {
				for (let dx: number = 0; dx < this.sessionOverviewTrs[zx].dashboard?.length; dx++) {
					if (
						!this.sessionOverviewTrs[zx].dashboard[dx] ||
						(this.sessionOverviewTrs[zx].dashboard[dx]?.length == 1 &&
							this.sessionOverviewTrs[zx].dashboard[dx][0].value == ' ')
					) {
						if (dx > 0) {
							for (let item of this.sessionOverviewTrs[zx].dashboard[dx - 1]) {
								if (item.rowspan > 1) {
									item.rowspan--;
								}
							}
						}
						this.sessionOverviewTrs[zx].dashboard.splice(dx, 1);
						dx--;
						continue;
					} else if (
						this.sessionOverviewTrs[zx].dashboard[dx] &&
						this.sessionOverviewTrs[zx].dashboard[dx]?.length != 0
					) {
						let check = false;
						for (let yo: number = 0; yo < this.sessionOverviewTrs[zx].dashboard[dx]?.length; yo++) {
							if (
								(this.sessionOverviewTrs[zx].dashboard[dx][yo].value == ' ' ||
									this.sessionOverviewTrs[zx].dashboard[dx][yo].value == '&nbsp;' ||
									this.sessionOverviewTrs[zx].dashboard[dx][yo].value == '') &&
								(!this.sessionOverviewTrs[zx].dashboard[dx][yo].option ||
									this.sessionOverviewTrs[zx].dashboard[dx][yo].option?.length == 0)
							) {
								continue;
							} else {
								check = true;
								break;
							}
						}
						if (!check) {
							if (dx > 0) {
								for (let item of this.sessionOverviewTrs[zx].dashboard[dx - 1]) {
									if (item.rowspan > 1) {
										item.rowspan--;
									}
								}
							}
							this.sessionOverviewTrs[zx].dashboard.splice(dx, 1);
							dx--;
						}
					}
				}
			}
			let rowIndex: number = 0;
			this.emptyRowCheck = [];
			for (let section of this.sessionOverviewTrs) {
				for (let row of section.dashboard) {
					this.emptyRowCheck.push(true);
					for (let i: number = 0; i < row?.length; i++) {
						if (row[i].value?.length || (row[i].option && row[i].option?.length)) {
							this.emptyRowCheck[rowIndex] = false;
							break;
						}
					}
					rowIndex++;
				}
			}
			this.multiplePDFs.push(this.sessionOverviewTrs);
			if (!mainPdfCheck) {
				this.multiplePreviews.push({
					selected: false,
					title:
						this.layoutService.template.sections[seperatePdfArray[pdfIndex]].boundSectionStatement,
				});
			}
			this.sessionOverviewTrs = [];
			previewIndex = -1;
		}
		this.changeDetector.detectChanges();
	}
	convertObjTemplateProperties(object, index) {
		if (!object.uiBorders) {
			if (this.layoutService.template.sections[index].uiBorders) {
				object.uiBorders = this.layoutService.template.sections[index].uiBorders;
				object.leftUIBorder = this.layoutService.template.sections[index].leftUIBorder;
				object.rightUIBorder = this.layoutService.template.sections[index].rightUIBorder;
				object.topUIBorder = this.layoutService.template.sections[index].topUIBorder;
				object.bottomUIBorder = this.layoutService.template.sections[index].bottomUIBorder;
			} else if (this.layoutService.template.uiBorders) {
				object.uiBorders = this.layoutService.template.uiBorders;
				object.leftUIBorder = this.layoutService.template.leftUIBorder;
				object.rightUIBorder = this.layoutService.template.rightUIBorder;
				object.topUIBorder = this.layoutService.template.topUIBorder;
				object.bottomUIBorder = this.layoutService.template.bottomUIBorder;
			}
		}
		if (!object.uiPaddings) {
			if (this.layoutService.template.sections[index].uiPaddings) {
				object.uiPaddings = this.layoutService.template.sections[index].uiPaddings;
				object.leftUIPadding = this.layoutService.template.sections[index].leftUIPadding;
				object.rightUIPadding = this.layoutService.template.sections[index].rightUIPadding;
				object.topUIPadding = this.layoutService.template.sections[index].topUIPadding;
				object.bottomUIPadding = this.layoutService.template.sections[index].bottomUIPadding;
			} else if (this.layoutService.template.uiPaddings) {
				object.uiPaddings = this.layoutService.template.uiPaddings;
				object.leftUIPadding = this.layoutService.template.leftUIPadding;
				object.rightUIPadding = this.layoutService.template.rightUIPadding;
				object.topUIPadding = this.layoutService.template.topUIPadding;
				object.bottomUIPadding = this.layoutService.template.bottomUIPadding;
			}
		}
		if (!object.lineSpacing) {
			if (this.layoutService.template.sections[index].lineSpacing) {
				object.lineSpacing = this.layoutService.template.sections[index].lineSpacing;
				object.lineSpacingValue = this.layoutService.template.sections[index].lineSpacingValue;
			} else if (this.layoutService.template.lineSpacing) {
				object.lineSpacing = this.layoutService.template.lineSpacing;
				object.lineSpacingValue = this.layoutService.template.lineSpacingValue;
			}
		}
		if (!object.bgColor) {
			if (this.layoutService.template.sections[index].bgColor) {
				object.bgColor = this.layoutService.template.sections[index].bgColor;
				object.backgroundColor = this.layoutService.template.sections[index].backgroundColor;
			} else if (this.layoutService.template.bgColor) {
				object.bgColor = this.layoutService.template.bgColor;
				object.backgroundColor = this.layoutService.template.backgroundColor;
			}
		}
		if (!object.fontColor) {
			if (this.layoutService.template.sections[index].fontColor) {
				object.fontColor = this.layoutService.template.sections[index].fontColor;
				object.fontColorCode = this.layoutService.template.sections[index].fontColorCode;
			} else if (this.layoutService.template.fontColor) {
				object.fontColor = this.layoutService.template.fontColor;
				object.fontColorCode = this.layoutService.template.fontColorCode;
			}
		}
		if (!object.fontFamily) {
			if (this.layoutService.template.sections[index].fontFamily) {
				object.fontFamily = this.layoutService.template.sections[index].fontFamily;
				object.fontFamilyValue = this.layoutService.template.sections[index].fontFamilyValue;
			} else if (this.layoutService.template.fontFamily) {
				object.fontFamily = this.layoutService.template.fontFamily;
				object.fontFamilyValue = this.layoutService.template.fontFamilyValue;
			}
		}
		return object;
	}
	async selectPreview(event: any) {
		for (let preview of this.multiplePreviews) {
			preview.selected = false;
		}
		this.multiplePreviews[event.target.value].selected = true;
		await this.pdfPreview(1, '');
	}
	livePdfCheck = false;
	livePreviewDisable = false
	async generateLivePdf() {
		this.livePreviewDisable = true
		await this.layoutService.updateComponents();
		if (this.layoutService.template.pdf_type == 2) {
			this.layoutService.isLoaderPending.next(true);
			this.livePdfCheck = true;
			await this.staticC43Generate('livePdf');
			this.changeDetector.detectChanges();
			this.livePreviewDisable = false
		} else {
			this.templateObjInfo = this.layoutService.templateObj;
			this.livePdfCheck = true;
			await this.makeText(0);
			await this.saveAlignment();
			if (this.hfImages == 0) {
				await this.pdfPreview(1, '');
				
			}
			this.changeDetector.detectChanges();
			this.livePreviewDisable = false
		}
	}
	pdfPreviewWindow: any;
	async toDataUrl(imageUrl) {
		var res = await fetch(imageUrl);
		var blob = await res.blob();
		return new Promise((resolve, reject) => {
			var reader = new FileReader();
			reader.addEventListener(
				'load',
				function () {
					resolve(reader.result);
				},
				false,
			);
			reader.onerror = () => {
				return reject(this);
			};
			reader.readAsDataURL(blob);
		});
	}
	async makeHeaderText() {
		this.text = true;
		this.headerTrs = [];
		this.footerTrs = [];
		this.hfImages = 0;
		this.imageLoadCheck = 0;
		if (this.layoutService.header) {
			this.headerTrs.push({
				dashboard: new Array(this.layoutService.header.options.maxRows),
				cols: this.layoutService.header.options.maxCols,
			});
			for (let i: number = 0; i < this.layoutService.header.dashboard?.length; i++) {
				let valueText: any = '';
				let options: any = null;
				if (this.layoutService.header.dashboard[i].obj.type === this.uicomponentTypes.TEXT) {
					options = null;
					valueText = this.layoutService.header.dashboard[i].obj.statement;
				} else if (this.layoutService.header.dashboard[i].obj.type === this.uicomponentTypes.SIMPLE_IMAGE) {
					options = [];
					if (this.layoutService.header.dashboard[i].obj.path) {
						valueText = await this.toDataUrl(
							this.config2.getConfig(REQUEST_SERVERS.templateManagerUrl) +
								this.layoutService.header.dashboard[i].obj.path,
						);
						this.hfImages++;
					}
					options.push({
						simpleImage: true,
						imageWidth: this.layoutService.header.dashboard[i].obj.width,
					});
				} else if (this.layoutService.header.dashboard[i].obj.type === this.uicomponentTypes.INPUT) {
					options = null;
					if (this.layoutService.header.dashboard[i].obj.preDefind) {
						let tempTitle =
							'<b>' + this.layoutService.header.dashboard[i].obj.preDefinedObj.title + '</b>: ';
						let ans: any = 'N/A';
						if (
							this.layoutService.header.dashboard[i].obj.preDefinedObj.slug ==
								'office_location_address' &&
							!this.layoutService.isInstancePreview &&
							this.layoutService.isShowEditor
						) {
							this.requestService
								.sendRequest(
									AssignSpecialityUrlsEnum.getUserInfobyFacility,
									'POST',
									REQUEST_SERVERS.schedulerApiUrl1,
									{
										user_id: this.storageData.getUserId(),
										facility_location_ids: [this.templateObjInfo.location_id],
									},
								)
								.subscribe(
									(response: HttpSuccessResponse) => {
										if (response?.result?.data?.docs?.length) {
											ans = response.result.data.docs[0].address;
											this.changeDetector.detectChanges();
										}
									},
									(err) => {
										console.log(err);
										this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
										this.stopLoader();
									},
								);
						} else if (
							(this.layoutService.header.dashboard[i].obj.preDefinedObj.slug == 'next_appt' ||
								this.layoutService.header.dashboard[i].obj.preDefinedObj.slug == 'last_apt') &&
							!this.layoutService.isInstancePreview &&
							this.layoutService.isShowEditor
						) {
							this.requestService
								.sendRequest(
									TemaplateManagerUrlsEnum.getNextAndLastAppointmentAgainstCase,
									'POST',
									REQUEST_SERVERS.schedulerApiUrl1,
									{ case_ids: [this.templateObjInfo.case_id] },
								)
								.subscribe(
									(response: HttpSuccessResponse) => {
										ans = 'N/A';
										if(response?.result?.data?.length){
											if (
												this.layoutService.header.dashboard[i].obj.preDefinedObj.slug ==
													'next_appt' &&
												response.result.data[0].next_appointment != null
											) {
												ans = convertDateTimeForRetrieving(
													this.storageData,
													new Date(response.result.data[0].next_appointment.scheduled_date_time),
												);
											} else {
												ans = convertDateTimeForRetrieving(
													this.storageData,
													new Date(response.result.data[0].last_appointment.evaluation_date_time),
												);
											}
										}
										this.changeDetector.detectChanges();
									},
									(err) => {
										console.log(err);
										this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
										this.stopLoader();
									},
								);
						} else if (
							this.templateObjInfo[this.layoutService.header.dashboard[i].obj.preDefinedObj.slug]
						) {
							ans =
								this.templateObjInfo[this.layoutService.header.dashboard[i].obj.preDefinedObj.slug];
						} else {
							ans = 'N/A';
						}
						if (
							this.layoutService.header.dashboard[i].obj.preDefinedObj.slug == 'npino' &&
							!this.layoutService.isInstancePreview &&
							this.layoutService.isShowEditor
						) {
							this.requestService
								.sendRequest(
									TemaplateManagerUrlsEnum.getNpinoAgainstUser + this.storageData.getUserId(),
									'GET',
									REQUEST_SERVERS.fd_api_url,
								)
								.subscribe(
									(response: HttpSuccessResponse) => {
										if (response?.result?.data?.npi) {
											ans = response.result.data.npi;
										} else {
											ans = 'N/A';
										}
										this.changeDetector.detectChanges();
									},
									(err) => {
										console.log(err);
										this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
										this.stopLoader();
									},
								);
						}
						if (
							this.layoutService.header.dashboard[i].obj.preDefinedObj.slug ==
								'dos_date_of_service' &&
							!this.layoutService.isInstancePreview &&
							this.layoutService.isShowEditor
						) {
							this.requestService
								.sendRequest(
									TemaplateManagerUrlsEnum.getVisitTypesRoute +
										this.templateObjInfo.case_id +
										'&appointment_id=' +
										this.templateObjInfo.id,
									'GET',
									REQUEST_SERVERS.fd_api_url,
								)
								.subscribe(
									(response: HttpSuccessResponse) => {
										if (response?.result?.data) {
											ans = response.result.data.visit_date;
											ans = moment(ans, 'YYYY-MM-DD').format('MM-DD-YYYY')
										} else {
											ans = 'N/A';
										}
										this.changeDetector.detectChanges();
									},
									(err) => {
										console.log(err);
										this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
										this.stopLoader();
									},
								);
						}
						valueText = tempTitle + '\n' + ans;
					} else {
						if (this.layoutService.header.dashboard[i].obj.isStatement) {
							if (this.layoutService.header.dashboard[i].obj.answers[0]) {
								valueText =
									this.layoutService.header.dashboard[i].obj.statement +
									'\n' +
									this.layoutService.header.dashboard[i].obj.answers[0].answer;
							} else {
								valueText = this.layoutService.header.dashboard[i].obj.statement;
							}
						} else {
							valueText = this.layoutService.header.dashboard[i].obj.input;
						}
					}
				} else if (this.layoutService.header.dashboard[i].obj.type === this.uicomponentTypes.LINE) {
					options = [];
					valueText = '';
					options.push({
						line: true,
						object: this.layoutService.header.dashboard[i].obj,
					});
				}
				if (!this.headerTrs[0]['dashboard'][this.layoutService.header.dashboard[i].y]) {
					this.headerTrs[0]['dashboard'][this.layoutService.header.dashboard[i].y] = [];
					if (valueText?.length != 0 || (options && options?.length != 0)) {
						this.headerTrs[0]['dashboard'][this.layoutService.header.dashboard[i].y].push({
							rowspan: this.layoutService.header.dashboard[i].rows,
							value: valueText,
							option: options,
							colspan: this.layoutService.header.dashboard[i].cols,
							x: this.layoutService.header.dashboard[i].x,
							y: this.layoutService.header.dashboard[i].y,
							obj: this.layoutService.header.dashboard[i].obj,
						});
					}
				} else {
					for (
						let z: number = 0;
						z < this.headerTrs[0]['dashboard'][this.layoutService.header.dashboard[i].y]?.length;
						z++
					) {
						if (
							this.layoutService.header.dashboard[i].x <
							this.headerTrs[0]['dashboard'][this.layoutService.header.dashboard[i].y][z].x
						) {
							if (valueText?.length != 0 || (options && options?.length != 0)) {
								this.headerTrs[0]['dashboard'][this.layoutService.header.dashboard[i].y].splice(
									z,
									0,
									{
										rowspan: this.layoutService.header.dashboard[i].rows,
										value: valueText,
										option: options,
										colspan: this.layoutService.header.dashboard[i].cols,
										x: this.layoutService.header.dashboard[i].x,
										y: this.layoutService.header.dashboard[i].y,
										obj: this.layoutService.header.dashboard[i].obj,
									},
								);
							}
							break;
						} else if (
							this.headerTrs[0]['dashboard'][this.layoutService.header.dashboard[i].y]?.length ===
							z + 1
						) {
							if (valueText?.length != 0 || (options && options?.length != 0)) {
								this.headerTrs[0]['dashboard'][this.layoutService.header.dashboard[i].y].push({
									rowspan: this.layoutService.header.dashboard[i].rows,
									value: valueText,
									option: options,
									colspan: this.layoutService.header.dashboard[i].cols,
									x: this.layoutService.header.dashboard[i].x,
									y: this.layoutService.header.dashboard[i].y,
									obj: this.layoutService.header.dashboard[i].obj,
								});
							}
							break;
						}
					}
				}
			}
		}
		if (this.layoutService.footer) {
			this.footerTrs.push({
				dashboard: new Array(this.layoutService.footer.options.maxRows),
				cols: this.layoutService.footer.options.maxCols,
			});
			for (let i: number = 0; i < this.layoutService.footer.dashboard?.length; i++) {
				let valueText: any = '';
				let options: any = null;
				if (this.layoutService.footer.dashboard[i].obj.type === this.uicomponentTypes.TEXT) {
					options = null;
					valueText = this.layoutService.footer.dashboard[i].obj.statement;
				} else if (this.layoutService.footer.dashboard[i].obj.type === this.uicomponentTypes.SIMPLE_IMAGE) {
					options = [];
					if (this.layoutService.footer.dashboard[i].obj.path) {
						valueText = await this.toDataUrl(
							this.config2.getConfig(REQUEST_SERVERS.templateManagerUrl) +
								this.layoutService.footer.dashboard[i].obj.path,
						);
						this.hfImages++;
					}
					options.push({
						simpleImage: true,
						imageWidth: this.layoutService.footer.dashboard[i].obj.width,
					});
				} else if (this.layoutService.footer.dashboard[i].obj.type === this.uicomponentTypes.INPUT) {
					options = null;
					if (this.layoutService.footer.dashboard[i].obj.preDefind) {
						let tempTitle =
							'<b>' + this.layoutService.footer.dashboard[i].obj.preDefinedObj.title + '</b>: ';
						let ans: any = 'N/A';
						if (
							this.layoutService.footer.dashboard[i].obj.preDefinedObj.slug ==
								'office_location_address' &&
							!this.layoutService.isInstancePreview &&
							this.layoutService.isShowEditor
						) {
							this.requestService
								.sendRequest(
									AssignSpecialityUrlsEnum.getUserInfobyFacility,
									'POST',
									REQUEST_SERVERS.schedulerApiUrl1,
									{
										user_id: this.storageData.getUserId(),
										facility_location_ids: [this.templateObjInfo.location_id],
									},
								)
								.subscribe(
									(response: HttpSuccessResponse) => {
										if (response?.result?.data?.docs?.length) {
											ans = response.result.data.docs[0].address;
											this.changeDetector.detectChanges();
										}
									},
									(err) => {
										console.log(err);
										this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
										this.stopLoader();
									},
								);
						} else if (
							(this.layoutService.footer.dashboard[i].obj.preDefinedObj.slug == 'next_appt' ||
								this.layoutService.footer.dashboard[i].obj.preDefinedObj.slug == 'last_apt') &&
							!this.layoutService.isInstancePreview &&
							this.layoutService.isShowEditor
						) {
							this.requestService
								.sendRequest(
									TemaplateManagerUrlsEnum.getNextAndLastAppointmentAgainstCase,
									'POST',
									REQUEST_SERVERS.schedulerApiUrl1,
									{ case_ids: [this.templateObjInfo.case_id] },
								)
								.subscribe(
									(response: HttpSuccessResponse) => {
										ans = 'N/A';
										if(response?.result?.data?.length){
											if (
												this.layoutService.footer.dashboard[i].obj.preDefinedObj.slug ==
													'next_appt' &&
												response.result.data[0].nextScheduledAppointment != null
											) {
												ans = convertDateTimeForRetrieving(
													this.storageData,
													new Date(response.result.data[0].nextScheduledAppointment.startDateTime),
												);
											} else {
												ans = convertDateTimeForRetrieving(
													this.storageData,
													new Date(response.result.data[0].lastDoneAppointment.startDateTime),
												);
											}
										}
										this.changeDetector.detectChanges();
									},
									(err) => {
										console.log(err);
										this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
										this.stopLoader();
									},
								);
						} else if (
							this.templateObjInfo[this.layoutService.footer.dashboard[i].obj.preDefinedObj.slug]
						) {
							ans =
								this.templateObjInfo[this.layoutService.footer.dashboard[i].obj.preDefinedObj.slug];
						} else {
							ans = 'N/A';
						}
						if (
							this.layoutService.footer.dashboard[i].obj.preDefinedObj.slug == 'npino' &&
							!this.layoutService.isInstancePreview &&
							this.layoutService.isShowEditor
						) {
							this.requestService
								.sendRequest(
									TemaplateManagerUrlsEnum.getNpinoAgainstUser + this.storageData.getUserId(),
									'GET',
									REQUEST_SERVERS.fd_api_url,
								)
								.subscribe(
									(response: HttpSuccessResponse) => {
										if (response?.result?.data?.npi) {
											ans = response.result.data.npi;
										} else {
											ans = 'N/A';
										}
										this.changeDetector.detectChanges();
									},
									(err) => {
										console.log(err);
										this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
										this.stopLoader();
									},
								);
						}
						if (
							this.layoutService.footer.dashboard[i].obj.preDefinedObj.slug ==
								'dos_date_of_service' &&
							!this.layoutService.isInstancePreview &&
							this.layoutService.isShowEditor
						) {
							this.requestService
								.sendRequest(
									TemaplateManagerUrlsEnum.getVisitTypesRoute +
										this.templateObjInfo.case_id +
										'&appointment_id=' +
										this.templateObjInfo.id,
									'GET',
									REQUEST_SERVERS.fd_api_url,
								)
								.subscribe(
									(response: HttpSuccessResponse) => {
										if (response?.result?.data) {
											ans = response.result.data.visit_date;
											ans = moment(ans, 'YYYY-MM-DD').format('MM-DD-YYYY')
										} else {
											ans = 'N/A';
										}
										this.changeDetector.detectChanges();
									},
									(err) => {
										console.log(err);
										this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
										this.stopLoader();
									},
								);
						}
						valueText = tempTitle + '\n' + ans;
					} else {
						if (this.layoutService.footer.dashboard[i].obj.isStatement) {
							if (this.layoutService.footer.dashboard[i].obj.answers[0]) {
								valueText =
									this.layoutService.footer.dashboard[i].obj.statement +
									'\n' +
									this.layoutService.footer.dashboard[i].obj.answers[0].answer;
							} else {
								valueText = this.layoutService.footer.dashboard[i].obj.statement;
							}
						} else {
							valueText = this.layoutService.footer.dashboard[i].obj.input;
						}
					}
				} else if (this.layoutService.footer.dashboard[i].obj.type === this.uicomponentTypes.LINE) {
					options = [];
					valueText = '';
					options.push({
						line: true,
						object: this.layoutService.footer.dashboard[i].obj,
					});
				}
				if (!this.footerTrs[0]['dashboard'][this.layoutService.footer.dashboard[i].y]) {
					this.footerTrs[0]['dashboard'][this.layoutService.footer.dashboard[i].y] = [];
					if (valueText?.length != 0 || (options && options?.length != 0)) {
						this.footerTrs[0]['dashboard'][this.layoutService.footer.dashboard[i].y].push({
							rowspan: this.layoutService.footer.dashboard[i].rows,
							value: valueText,
							option: options,
							colspan: this.layoutService.footer.dashboard[i].cols,
							x: this.layoutService.footer.dashboard[i].x,
							y: this.layoutService.footer.dashboard[i].y,
							obj: this.layoutService.footer.dashboard[i].obj,
						});
					}
				} else {
					for (
						let z: number = 0;
						z < this.footerTrs[0]['dashboard'][this.layoutService.footer.dashboard[i].y]?.length;
						z++
					) {
						if (
							this.layoutService.footer.dashboard[i].x <
							this.footerTrs[0]['dashboard'][this.layoutService.footer.dashboard[i].y][z].x
						) {
							if (valueText?.length != 0 || (options && options?.length != 0)) {
								this.footerTrs[0]['dashboard'][this.layoutService.footer.dashboard[i].y].splice(
									z,
									0,
									{
										rowspan: this.layoutService.footer.dashboard[i].rows,
										value: valueText,
										option: options,
										colspan: this.layoutService.footer.dashboard[i].cols,
										x: this.layoutService.footer.dashboard[i].x,
										y: this.layoutService.footer.dashboard[i].y,
										obj: this.layoutService.footer.dashboard[i].obj,
									},
								);
							}
							break;
						} else if (
							this.footerTrs[0]['dashboard'][this.layoutService.footer.dashboard[i].y]?.length ===
							z + 1
						) {
							if (valueText?.length != 0 || (options && options?.length != 0)) {
								this.footerTrs[0]['dashboard'][this.layoutService.footer.dashboard[i].y].push({
									rowspan: this.layoutService.footer.dashboard[i].rows,
									value: valueText,
									option: options,
									colspan: this.layoutService.footer.dashboard[i].cols,
									x: this.layoutService.footer.dashboard[i].x,
									y: this.layoutService.footer.dashboard[i].y,
									obj: this.layoutService.footer.dashboard[i].obj,
								});
							}
							break;
						}
					}
				}
				this.changeDetector.detectChanges();
			}
		}
	}
	public showTempProperties() {
		this.changeDetector.detectChanges();
		this.removeCollapsePropertiesTab();
		this.setPropertiesTab('showTemplateProperties');
		this.setCollapsePropertiesTab('showTemplateProperties');
		this.changeDetector.detectChanges();
		this.GetHeightValue();
		this.changeDetector.detectChanges();
	}
	public multipleSelect() {
		let options =
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options;
		if (
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.isMultiSelect == true
		) {
			this.updateBackUpTask('type', `isMultiSelect`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.isMultiSelect,
			);
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.isMultiSelect = false;
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.isMultiSelect,
			);
			let index = -1;
			let selectedOptionsArray = [];
			let sectionsToHide = [];
			let sectionsToShow = [];
			for (let i: number = 0; i < options?.length; i++) {
				if (options[i].selected == true && i === index) {
					options[i].selected = false;
					if (options[i].selectedLinkSection.id) {
						sectionsToHide.push(options[i].selectedLinkSection.id);
					}
				} else if (options[i].selected == false && i === index) {
					options[i].selected = true;
					if (options[i].selectedLinkSection.id) {
						sectionsToShow.push(options[i].selectedLinkSection.id);
					}
				} else if (options[i].selected == true && i != index) {
					options[i].selected = false;
					if (options[i].selectedLinkSection.id) {
						sectionsToHide.push(options[i].selectedLinkSection.id);
					}
				}
			}
			for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
				if (sectionsToHide.includes(this.layoutService.template.sections[i].id)) {
					this.layoutService.template.sections[i].selected_linked_component--;
					let currentDepth = this.layoutService.template.sections[i].secNo.split('.')?.length - 1;
					for (let j = i + 1; j < this.layoutService.template.sections?.length; j++) {
						let tempDepth = this.layoutService.template.sections[j].secNo.split('.')?.length - 1;
						if (tempDepth > currentDepth) {
							this.updateBackUpTask('type', `selected_linked_component`);
							this.updateBackUpTask('id', this.layoutService.backupId);
							this.updateIndexes(j, -1, -1, 'section');
							this.updateBackUpTask(
								'oldObject',
								this.layoutService.template.sections[j][`selected_linked_component`],
							);
							this.layoutService.template.sections[j].selected_linked_component--;
							this.updateBackUpTask(
								'newObject',
								this.layoutService.template.sections[j][`selected_linked_component`],
							);
						} else {
							i = j - 1;
							break;
						}
					}
				}
				if (sectionsToShow.includes(this.layoutService.template.sections[i].id)) {
					this.layoutService.template.sections[i].selected_linked_component++;
					let currentDepth = this.layoutService.template.sections[i].secNo.split('.')?.length - 1;
					for (let j = i + 1; j < this.layoutService.template.sections?.length; j++) {
						let tempDepth = this.layoutService.template.sections[j].secNo.split('.')?.length - 1;
						if (tempDepth > currentDepth) {
							this.updateBackUpTask('type', `selected_linked_component`);
							this.updateBackUpTask('id', this.layoutService.backupId);
							this.updateIndexes(j, -1, -1, 'section');
							this.updateBackUpTask(
								'oldObject',
								this.layoutService.template.sections[j][`selected_linked_component`],
							);
							this.layoutService.template.sections[j].selected_linked_component++;
							this.updateBackUpTask(
								'newObject',
								this.layoutService.template.sections[j][`selected_linked_component`],
							);
						} else {
							i = j - 1;
							break;
						}
					}
				}
			}
			this.refreshObject();
		} else {
			this.updateBackUpTask('type', `isMultiSelect`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.isMultiSelect,
			);
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.isMultiSelect = true;
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.isMultiSelect,
			);
			for (let i: number = 0; i < options?.length; i++) {
				if (options[i].selected) {
					let index = i;
					options[index].selected = !options[index].selected;
					if (options[index].selectedLinkSection && options[index].selectedLinkSection.id) {
						for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
							if (
								this.layoutService.template.sections[i].id == options[index].selectedLinkSection.id
							) {
								if (options[index].selected) {
									this.layoutService.template.sections[i].selected_linked_component++;
									let currentDepth =
										this.layoutService.template.sections[i].secNo.split('.')?.length - 1;
									for (let j = i + 1; j < this.layoutService.template.sections?.length; j++) {
										let tempDepth =
											this.layoutService.template.sections[j].secNo.split('.')?.length - 1;
										if (tempDepth > currentDepth) {
											this.updateBackUpTask('type', `selected_linked_component`);
											this.updateBackUpTask('id', this.layoutService.backupId);
											this.updateIndexes(j, -1, -1, 'section');
											this.updateBackUpTask(
												'oldObject',
												this.layoutService.template.sections[j][`selected_linked_component`],
											);
											this.layoutService.template.sections[j].selected_linked_component++;
											this.updateBackUpTask(
												'newObject',
												this.layoutService.template.sections[j][`selected_linked_component`],
											);
										} else {
											i = j - 1;
											break;
										}
									}
								} else {
									this.layoutService.template.sections[i].selected_linked_component--;
									let currentDepth =
										this.layoutService.template.sections[i].secNo.split('.')?.length - 1;
									for (let j = i + 1; j < this.layoutService.template.sections?.length; j++) {
										let tempDepth =
											this.layoutService.template.sections[j].secNo.split('.')?.length - 1;
										if (tempDepth > currentDepth) {
											this.updateBackUpTask('type', `selected_linked_component`);
											this.updateBackUpTask('id', this.layoutService.backupId);
											this.updateIndexes(j, -1, -1, 'section');
											this.updateBackUpTask(
												'oldObject',
												this.layoutService.template.sections[j][`selected_linked_component`],
											);
											this.layoutService.template.sections[j].selected_linked_component--;
											this.updateBackUpTask(
												'newObject',
												this.layoutService.template.sections[j][`selected_linked_component`],
											);
										} else {
											i = j - 1;
											break;
										}
									}
								}
							}
						}
					}
				}
			}
			this.refreshObject();
		}
		this.changeDetector.detectChanges();
	}
	public setIntensityValue(e) {
		if (
			!this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options.floor
		) {
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options.floor = 0;
		}
		if (
			!this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options.ceil
		) {
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options.ceil =
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.options.floor;
		}
		if (
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options.ceil <
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options.floor
		) {
			if (
				!this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.isMaxVal
			) {
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.isMaxVal = true;
				this.updateBackUpTask('type', `errorMessage`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(-1, -1, -1, 'layoutService');
				this.updateBackUpTask('oldObject', this.layoutService.templateErrors);
				this.layoutService.templateErrors++;
				this.updateBackUpTask('newObject', this.layoutService.templateErrors);
				this.layoutService.template.sections[this.layoutService.lastI].errors++;
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.errors++;
			}
		} else {
			if (
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.isMaxVal
			) {
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.isMaxVal = false;
				this.updateBackUpTask('type', `errorMessage`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(-1, -1, -1, 'layoutService');
				this.updateBackUpTask('oldObject', this.layoutService.templateErrors);
				this.layoutService.templateErrors--;
				this.updateBackUpTask('newObject', this.layoutService.templateErrors);
				this.layoutService.template.sections[this.layoutService.lastI].errors--;
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.errors--;
			}
		}
		this.IntensityChange();
		this.refreshObject();
		this.layoutService.backupId++;
	}
	public setNumberValueOptions(e, index) {
		let minPlaceholder = '';
		if (
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options[index].minLimit
		) {
			minPlaceholder += `Min Limit: ${
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.options[index].minLimit
			}`;
		}
		if (
			!this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options[index].maxLimit
		) {
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options[index].commentsPlaceholder = minPlaceholder;
		} else {
			if (minPlaceholder?.length) {
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.options[index].commentsPlaceholder =
					minPlaceholder +
					`- Max Limit: ${
						this.layoutService.template.sections[this.layoutService.lastI].dashboard[
							this.layoutService.lastK
						].obj.options[index].maxLimit
					}`;
			} else {
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.options[index].commentsPlaceholder = `Max Limit: ${
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[
						this.layoutService.lastK
					].obj.options[index].maxLimit
				}`;
			}
		}
		if (
			parseInt(
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.options[index].maxLimit,
			) <
			parseInt(
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.options[index].minLimit,
			)
		) {
			if (
				!this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.options[index].isMaxVal
			) {
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.options[index].isMaxVal = true;
				this.updateBackUpTask('type', `errorMessage`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(-1, -1, -1, 'layoutService');
				this.updateBackUpTask('oldObject', this.layoutService.templateErrors);
				this.layoutService.templateErrors++;
				this.updateBackUpTask('newObject', this.layoutService.templateErrors);
				this.layoutService.template.sections[this.layoutService.lastI].errors++;
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.options[index].errors++;
			}
		} else {
			if (
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.options[index].isMaxVal
			) {
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.options[index].isMaxVal = false;
				this.updateBackUpTask('type', `errorMessage`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(-1, -1, -1, 'layoutService');
				this.updateBackUpTask('oldObject', this.layoutService.templateErrors);
				this.layoutService.templateErrors--;
				this.updateBackUpTask('newObject', this.layoutService.templateErrors);
				this.layoutService.template.sections[this.layoutService.lastI].errors--;
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.options[index].errors--;
			}
		}
		this.refreshObject();
		this.layoutService.backupId++;
	}
	public setNumberValue(e) {
		let minPlaceholder = '';
		if (
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.minLimit
		) {
			minPlaceholder += `Min Limit: ${
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.minLimit
			}`;
		}
		if (
			!this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.maxLimit
		) {
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.placeholder = minPlaceholder;
		} else {
			if (minPlaceholder?.length) {
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.placeholder =
					minPlaceholder +
					`- Max Limit: ${
						this.layoutService.template.sections[this.layoutService.lastI].dashboard[
							this.layoutService.lastK
						].obj.maxLimit
					}`;
			} else {
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.placeholder = `Max Limit: ${
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[
						this.layoutService.lastK
					].obj.maxLimit
				}`;
			}
		}
		if (
			parseInt(
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.maxLimit,
			) <
			parseInt(
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.minLimit,
			)
		) {
			if (
				!this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.isMaxVal
			) {
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.isMaxVal = true;
				this.updateBackUpTask('type', `errorMessage`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(-1, -1, -1, 'layoutService');
				this.updateBackUpTask('oldObject', this.layoutService.templateErrors);
				this.layoutService.templateErrors++;
				this.updateBackUpTask('newObject', this.layoutService.templateErrors);
				this.layoutService.template.sections[this.layoutService.lastI].errors++;
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.errors++;
			}
		} else {
			if (
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.isMaxVal
			) {
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.isMaxVal = false;
				this.updateBackUpTask('type', `errorMessage`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(-1, -1, -1, 'layoutService');
				this.updateBackUpTask('oldObject', this.layoutService.templateErrors);
				this.layoutService.templateErrors--;
				this.updateBackUpTask('newObject', this.layoutService.templateErrors);
				this.layoutService.template.sections[this.layoutService.lastI].errors--;
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.errors--;
			}
		}
		this.refreshObject();
		this.layoutService.backupId++;
	}
	public setNumberValueCombined(e) {
		for (let component of this.selectedComponents) {
			if (
				!this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.minLimit
			) {
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.minLimit = '';
			} else {
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.minLimit =
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.minLimit;
			}
			if (
				!this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.maxLimit
			) {
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.maxLimit = '';
			} else {
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.minLimit =
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.minLimit;
			}
			if (
				parseInt(
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.maxLimit,
				) <
				parseInt(
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.minLimit,
				)
			) {
				if (
					!this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.isMaxVal
				) {
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.isMaxVal = true;
					this.updateBackUpTask('type', `errorMessage`);
					this.updateBackUpTask('id', this.layoutService.backupId);
					this.updateIndexes(-1, -1, -1, 'layoutService');
					this.updateBackUpTask('oldObject', this.layoutService.templateErrors);
					this.layoutService.templateErrors++;
					this.updateBackUpTask('newObject', this.layoutService.templateErrors);
					this.layoutService.template.sections[this.layoutService.lastI].errors++;
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.errors++;
				}
			} else {
				if (
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.isMaxVal
				) {
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.isMaxVal = false;
					this.updateBackUpTask('type', `errorMessage`);
					this.updateBackUpTask('id', this.layoutService.backupId);
					this.updateIndexes(-1, -1, -1, 'layoutService');
					this.updateBackUpTask('oldObject', this.layoutService.templateErrors);
					this.layoutService.templateErrors--;
					this.updateBackUpTask('newObject', this.layoutService.templateErrors);
					this.layoutService.template.sections[this.layoutService.lastI].errors--;
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.errors--;
				}
			}
		}
		this.layoutService.backupId++;
	}
	public setIncrementValue(e) {
		if (
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options.ceil <
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options.floor
		) {
			if (
				!this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.isMaxVal
			) {
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.isMaxVal = true;
				this.updateBackUpTask('type', `errorMessage`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(-1, -1, -1, 'layoutService');
				this.updateBackUpTask('oldObject', this.layoutService.templateErrors);
				this.layoutService.templateErrors++;
				this.updateBackUpTask('newObject', this.layoutService.templateErrors);
				this.layoutService.template.sections[this.layoutService.lastI].errors++;
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.errors++;
			}
		} else {
			if (
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.isMaxVal
			) {
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.isMaxVal = false;
				this.updateBackUpTask('type', `errorMessage`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(-1, -1, -1, 'layoutService');
				this.updateBackUpTask('oldObject', this.layoutService.templateErrors);
				this.layoutService.templateErrors--;
				this.updateBackUpTask('newObject', this.layoutService.templateErrors);
				this.layoutService.template.sections[this.layoutService.lastI].errors--;
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.errors--;
			}
		}
		this.IncrementChange();
	}
	public limitedShared = false;
	public applyPermission(event: any) {
		if (event.target.value == 'public') {
			this.limitedShared = false;
			this.layoutService.template.public = 1;
			this.layoutService.template.shared = 0;
		} else if (event.target.value == 'limited') {
			this.limitedShared = true;
			this.layoutService.template.public = 0;
			this.layoutService.template.shared = 1;
			this.managePermissions();
		} else if (event.target.value == 'private') {
			this.limitedShared = false;
			this.layoutService.template.public = 0;
			this.layoutService.template.shared = 0;
		}
		let obj = {
			public: this.layoutService.template.public,
			shared: this.layoutService.template.shared,
			template_id: this.layoutService.template.template_id,
		};
		this.requestService
			.sendRequest(
				TemaplateManagerUrlsEnum.updateTemplatePermissions,
				'POST',
				REQUEST_SERVERS.templateManagerUrl,
				obj,
			)
			.subscribe(
				(res: any) => {},
				(err) => {
					console.log(err);
					this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
					this.stopLoader();
				},
			);
	}
	public managePermissions() {
		this.activeModal = this.modalService.open(TemplatePermissionsComponent, {
			size: 'lg',
			backdrop: 'static',
			keyboard: true,
		});
		this.activeModal.componentInstance.permissionModal = this.activeModal;
		this.activeModal.result.then((result) => {});
	}
	public deleteTemplate() {
		this.sectionIndex = null;
		if (this.layoutService.template.template_id) {
			// this.coolDialogs
			// 	.confirm('Are you sure you want to delete the template? ', {
			// 		okButtonText: 'OK',
			// 		cancelButtonText: 'Cancel',
			// 	})
			this.bsModalRef = this.modalServiceDialog.show(ConfirmationDialogComponent, {
				initialState: {
				  message: 'Are you sure you want to delete the template?'
				},
				class: 'modal-dialog-centered'
			  });
			  this.bsModalRef.content.result
				.subscribe((response) => {
					if (response == true) {
						let data = {
							template_id: this.layoutService.template.template_id,
							user_id: this.storageData.getUserId(),
						};
						this.requestService
							.sendRequest(
								TemaplateManagerUrlsEnum.deleteTemplate,
								'POST',
								REQUEST_SERVERS.templateManagerUrl,
								data,
							)
							.subscribe(
								(res: any) => {
									this.toastrService.success('Deleted Successfully!', '', { timeOut: 6000 });
									this.createNewTemplate(true);
								},
								(err) => {
									console.log(err);
									this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
									this.stopLoader();
								},
							);
						return;
					} else {
						return;
					}
				});
		} else {
			this.toastrService.error('You must save a template before deleting it.', '', {
				timeOut: 6000,
			});
		}
	}
	public firstSectionCheck = true;
	public showInstance() {
		let firstSection: number = 0;
		for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
			if (
				(this.layoutService.template.sections[i].linked_component == 0 ||
					this.layoutService.template.sections[i].selected_linked_component ===
						this.layoutService.template.sections[i].linked_component) &&
				!this.layoutService.template.sections[i].hideInInstance
			) {
				firstSection = i;
				break;
			}
		}
		if (this.layoutService.editorView == false) {
			this.currentSubChildren = [];
		if (this.topLevelId == -1) {
					for (let j = this.layoutService.template.sections?.length - 1; j >= 0; j--) {
						if (
							this.layoutService.template.sections[j].parentId == 0 &&
							(this.layoutService.template.sections[j].linked_component == 0 ||
								this.layoutService.template.sections[j].selected_linked_component ===
									this.layoutService.template.sections[j].linked_component) &&
							!this.layoutService.template.sections[j].hideInInstance
						) {
							if (j == firstSection) {
								this.firstSectionCheck = true;
							} else {
								this.firstSectionCheck = false;
							}
							this.topLevelId = this.layoutService.template.sections[j].id;
							this.topLevelIndex = j;
							this.instanceSectionChange(this.layoutService.template.sections[j]);
							break;
						}
					}
				}
			for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
				this.layoutService.template.sections[i].options.swap = false;
			}
			this.instanceText();
			this.layoutService.editorView = true;
		} else {
			let tempTopLevelId = -1;
			let tempSubLevelId = -1;
			let tempTopLevelIndex = -1;
			let tempSubLevelIndex = -1;
			let check: number = 0;
			let tempCurrentIndex: number = 0;
			for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
				if (
					!check &&
					this.layoutService.template.sections[i].parentId === 0 &&
					this.layoutService.template.sections[i].id != this.topLevelId &&
					(this.layoutService.template.sections[i].linked_component == 0 ||
						this.layoutService.template.sections[i].selected_linked_component ===
							this.layoutService.template.sections[i].linked_component) &&
					!this.layoutService.template.sections[i].hideInInstance
				) {
					tempTopLevelId = this.layoutService.template.sections[i].id;
					tempTopLevelIndex = i;
					tempSubLevelIndex = -1;
				} else if (
					this.layoutService.template.sections[i].parentId === tempTopLevelId &&
					this.layoutService.template.sections[i].id != this.subLevelId &&
					this.layoutService.template.sections[i].parentId != this.topLevelId &&
					(this.layoutService.template.sections[i].linked_component == 0 ||
						this.layoutService.template.sections[i].selected_linked_component ===
							this.layoutService.template.sections[i].linked_component) &&
					!this.layoutService.template.sections[i].hideInInstance
				) {
					if (this.layoutService.template.sections[i - 1].parentId === 0) {
						tempSubLevelId = this.layoutService.template.sections[i].id;
						tempSubLevelIndex = i;
					}
				} else if (
					(!check &&
						this.layoutService.template.sections[i].id === this.topLevelId &&
						this.subLevelId === 0) ||
					this.layoutService.template.sections[i].id === this.subLevelId
				) {
					check = 1;
					tempCurrentIndex = i;
				}
				if (check) {
					while(this.layoutService.template.sections[tempCurrentIndex].id !== this.topLevelId
						&&this.layoutService.template.sections[tempCurrentIndex-1].hideInInstance){
						tempCurrentIndex=tempCurrentIndex-1
					}
					if (
						(this.layoutService.template.sections[tempCurrentIndex - 1] &&
							this.layoutService.template.sections[tempCurrentIndex - 1].id === this.topLevelId) ||
						this.layoutService.template.sections[tempCurrentIndex].id === this.topLevelId
					) {
						if (tempSubLevelIndex != -1) {
							this.instanceSectionChange(this.layoutService.template.sections[tempTopLevelIndex]);
							this.instanceSubSectionChange(
								this.layoutService.template.sections[tempSubLevelIndex],
							);
						} else if (tempTopLevelIndex != -1) {
							if (tempTopLevelIndex == firstSection) {
								this.firstSectionCheck = true;
							} else {
								this.firstSectionCheck = false;
							}
							this.instanceSectionChange(this.layoutService.template.sections[tempTopLevelIndex]);
						}
					} else {
						for (let j = i - 1; j >= 0; j--) {
							if (this.layoutService.template.sections[j].parentId === this.topLevelId) {
								if (
									(this.layoutService.template.sections[j].linked_component == 0 ||
										this.layoutService.template.sections[j].selected_linked_component ===
											this.layoutService.template.sections[j].linked_component) &&
									!this.layoutService.template.sections[i].hideInInstance
								) {
									this.instanceSubSectionChange(this.layoutService.template.sections[j]);
									break;
								}
							}
						}
					}
					break;
				}
			}
			this.instanceText();
			this.changeDetector.detectChanges();
			this.arrowLeftRight('colapse');
		}
	}
	instanceTextObj: any;
	public instanceText(chk?, sectionIndex?) {
		this.checkSectionsTick();
		let tableTextCoordinates = [];
		this.layoutService.componentsService = cloneDeep(this.componentsService);
		let children: number = 0;
		if (chk == 2 && sectionIndex != -1) {
			this.instanceTextObj.splice(sectionIndex, 0, {});
			let currentDepth = this.currentSubChildren[sectionIndex].secNo.split('.')?.length - 1;
			for (let j = sectionIndex + 1; j < this.currentSubChildren?.length; j++) {
				let tempDepth = this.currentSubChildren[j].secNo.split('.')?.length - 1;
				if (tempDepth > currentDepth) {
					children++;
					this.instanceTextObj.splice(sectionIndex, 0, {});
				} else {
					break;
				}
			}
		} else if (chk != 2) {
			this.instanceTextObj = new Array(this.currentSubChildren?.length);
		}
		for (let t: number = 0; t < this.instanceTextObj?.length; t++) {
			tableTextCoordinates = [];
			if (!this.currentSubChildren[t]) {
				this.instanceTextObj.splice(t, this.instanceTextObj?.length - t);
				break;
			}
			if (
				chk == 2 &&
				sectionIndex == -1 &&
				this.instanceTextObj[t].section_id != this.currentSubChildren[t].id
			) {
				this.instanceTextObj.splice(t, 1);
				t--;
				continue;
			} else if (chk == 2 && sectionIndex == -1) {
				continue;
			} else if ((chk == 2 && t < sectionIndex) || t > sectionIndex + children) {
				continue;
			}
			this.instanceTextObj[t] = {
				dashboard: new Array(this.currentSubChildren[t].options.maxRows),
				section_title: this.currentSubChildren[t].section_title || ' ',
				boundSectionStatement: this.currentSubChildren[t].boundSectionStatement || ' ',
				errors: this.layoutService.template.sections[t].errors,
				section_id: this.currentSubChildren[t].id,
				cols: this.currentSubChildren[t].options.maxCols,
				theme: this.currentSubChildren[t].theme,
				is_table: this.currentSubChildren[t].is_table,
				carryForward: this.currentSubChildren[t].carryForward,
				selectedModules: this.currentSubChildren[t].selectedModules,
				isCarried: this.currentSubChildren[t].isCarried,
				moduleSelected: false,
			};
			let hideThisItem = false;
			for (let i: number = 0; i < this.currentSubChildren[t].dashboard?.length; i++) {
				hideThisItem = false;
				if (this.currentSubChildren[t].is_table) {
					if (
						this.currentSubChildren[t].dashboard[i].x == 0 &&
						this.currentSubChildren[t].dashboard[i].obj.type == this.uicomponentTypes.TEXT
					) {
						if (
							this.currentSubChildren[t].dashboard[i].obj.linked_row !=
							this.currentSubChildren[t].dashboard[i].obj.selected_linked_row
						) {
							tableTextCoordinates.push({
								x: this.currentSubChildren[t].dashboard[i].x,
								y: this.currentSubChildren[t].dashboard[i].y,
								rows: this.currentSubChildren[t].dashboard[i].rows,
								cols: this.currentSubChildren[t].dashboard[i].cols,
							});
							hideThisItem = true;
						} else {
							hideThisItem = false;
						}
					} else if (this.currentSubChildren[t].dashboard[i].y != 0) {
						hideThisItem = false;
						for (let coordinate of tableTextCoordinates) {
							if (
								this.currentSubChildren[t].dashboard[i].y >= coordinate.y &&
								this.currentSubChildren[t].dashboard[i].y < coordinate.y + coordinate.rows
							) {
								hideThisItem = true;
								break;
							}
						}
					}
				}
				let valueText: any = '';
				let options: any;
				let input;
				let label;
				if (this.currentSubChildren[t].dashboard[i].obj.type === this.uicomponentTypes.TEXT) {
					options = null;
					valueText = this.currentSubChildren[t].dashboard[i].obj.instanceStatement;
				} else if (this.currentSubChildren[t].dashboard[i].obj.type === this.uicomponentTypes.CALCULATION) {
					options = null;
					valueText = this.currentSubChildren[t].dashboard[i].obj.instanceStatement;
					if (this.currentSubChildren[t].dashboard[i].obj.answers[0]) {
						valueText =
							valueText + ' ' + this.currentSubChildren[t].dashboard[i].obj.answers[0].answer;
					}
				} else if (this.currentSubChildren[t].dashboard[i].obj.type === this.uicomponentTypes.INPUT) {
					options = null;
					if (this.currentSubChildren[t].dashboard[i].obj.isStatement) {
						if (this.currentSubChildren[t].dashboard[i].obj.answers[0]) {
							valueText =
								this.currentSubChildren[t].dashboard[i].obj.instanceStatement +
								'\n' +
								this.currentSubChildren[t].dashboard[i].obj.answers[0].answer;
						} else {
							valueText = this.currentSubChildren[t].dashboard[i].obj.instanceStatement;
						}
					} else {
						valueText = this.currentSubChildren[t].dashboard[i].obj.input;
					}
				} else if (this.currentSubChildren[t].dashboard[i].obj.type === this.uicomponentTypes.RADIO) {
					options = [];
					if (this.currentSubChildren[t].dashboard[i].obj.isStatement) {
						valueText = this.currentSubChildren[t].dashboard[i].obj.instanceStatement + '  ';
					}
					for (
						let x: number = 0;
						x < this.currentSubChildren[t].dashboard[i].obj.options?.length;
						x++
					) {
						if (this.currentSubChildren[t].dashboard[i].obj.options[x].selected) {
							input = '';
							label = this.currentSubChildren[t].dashboard[i].obj.options[x].instanceLabel;
							if (!this.currentSubChildren[t].dashboard[i].obj.displayOption) {
								label = '&#11044';
							}
							if (this.currentSubChildren[t].dashboard[i].obj.options[x].input) {
								input = this.currentSubChildren[t].dashboard[i].obj.options[x].instanceInputValue;
							}
							options.push({ label, input });
						}
					}
				} else if (this.currentSubChildren[t].dashboard[i].obj.type === this.uicomponentTypes.CHECKBOX) {
					options = [];
					if (this.currentSubChildren[t].dashboard[i].obj.isStatement) {
						valueText = this.currentSubChildren[t].dashboard[i].obj.instanceStatement;
					}
					for (
						let x: number = 0;
						x < this.currentSubChildren[t].dashboard[i].obj.options?.length;
						x++
					) {
						if (this.currentSubChildren[t].dashboard[i].obj.options[x].selected) {
							input = '';
							label = this.currentSubChildren[t].dashboard[i].obj.options[x].instanceLabel;
							if (this.currentSubChildren[t].dashboard[i].obj.options[x].input) {
								input = this.currentSubChildren[t].dashboard[i].obj.options[x].instanceInputValue;
							}
							if (!this.currentSubChildren[t].dashboard[i].obj.displayOption) {
								options.push({ displayCheck: false });
							} else {
								options.push({ label, input });
							}
						}
					}
				} else if (this.currentSubChildren[t].dashboard[i].obj.type === this.uicomponentTypes.SWITCH) {
					options = [];
					if (this.currentSubChildren[t].dashboard[i].obj.isStatement) {
						valueText = this.currentSubChildren[t].dashboard[i].obj.instanceStatement + '  ';
					}
					for (
						let x: number = 0;
						x < this.currentSubChildren[t].dashboard[i].obj.options?.length;
						x++
					) {
						if (this.currentSubChildren[t].dashboard[i].obj.options[x].selected) {
							input = '';
							label = this.currentSubChildren[t].dashboard[i].obj.options[x].instanceLabel;
							options.push({ label, input });
						}
					}
				} else if (this.currentSubChildren[t].dashboard[i].obj.type === this.uicomponentTypes.DROPDOWN) {
					options = [];
					if (this.currentSubChildren[t].dashboard[i].obj.isStatement) {
						valueText = this.currentSubChildren[t].dashboard[i].obj.instanceStatement + '  ';
					}
					for (
						let x: number = 0;
						x < this.currentSubChildren[t].dashboard[i].obj.options?.length;
						x++
					) {
						if (this.currentSubChildren[t].dashboard[i].obj.options[x].selected) {
							input = '';
							label = this.currentSubChildren[t].dashboard[i].obj.options[x].instanceLabel;
							options.push({ label, input });
						}
					}
				} else if (
					this.currentSubChildren[t].dashboard[i].obj.type === this.uicomponentTypes.INTENSITY ||
					this.currentSubChildren[t].dashboard[i].obj.type === this.uicomponentTypes.INCREMENT
				) {
					options = null;
					if (this.currentSubChildren[t].dashboard[i].obj.isStatement) {
						if (this.currentSubChildren[t].dashboard[i].obj.answers[0]) {
							label = this.currentSubChildren[t].dashboard[i].obj.answers[0].answer;
						}
						valueText =
							this.currentSubChildren[t].dashboard[i].obj.instanceStatement + '  ' + label;
					} else {
						if (this.currentSubChildren[t].dashboard[i].obj.answers[0]) {
							valueText = JSON.stringify(this.currentSubChildren[t].dashboard[i].obj.value);
						}
					}
				} else if (this.currentSubChildren[t].dashboard[i].obj.type === this.uicomponentTypes.DRAWING) {
					options = null;
					if (this.currentSubChildren[t].dashboard[i].obj.isStatement) {
						valueText = this.currentSubChildren[t].dashboard[i].obj.instanceStatement + '  ';
					} else {
						valueText = JSON.stringify(this.currentSubChildren[t].dashboard[i].obj.value);
					}
				} else if (this.currentSubChildren[t].dashboard[i].obj.type === this.uicomponentTypes.IMAGE_LABEL) {
					options = [];
					if (this.currentSubChildren[t].dashboard[i].obj.isStatement) {
						valueText = this.currentSubChildren[t].dashboard[i].obj.instanceStatement + '  ';
					}
					for (
						let x: number = 0;
						x < this.currentSubChildren[t].dashboard[i].obj.data?.length;
						x++
					) {
						input = '';
						if(this.currentSubChildren[t].dashboard[i].obj.data[x].isSelected) {
							label = this.currentSubChildren[t].dashboard[i].obj.data[x].label;
							if(this.currentSubChildren[t].dashboard[i].obj.enableTextInput) {
								label += ` ${this.currentSubChildren[t].dashboard[i].obj.data[x].text}`	
							}
							options.push({ label, input });
						}
					}
				} else if (this.currentSubChildren[t].dashboard[i].obj.type === this.uicomponentTypes.SIMPLE_IMAGE) {
					options = [];
					if (this.currentSubChildren[t].dashboard[i].obj.paths[0]) {
						valueText =
							this.config2.getConfig(REQUEST_SERVERS.templateManagerUrl) +
							this.currentSubChildren[t].dashboard[i].obj.paths[0];
					}
					options.push({
						simpleImage: true,
						imageWidth: this.currentSubChildren[t].dashboard[i].obj.width,
					});
				}
				if (!hideThisItem) {
					if (!this.instanceTextObj[t]['dashboard'][this.currentSubChildren[t].dashboard[i].y]) {
						this.instanceTextObj[t]['dashboard'][this.currentSubChildren[t].dashboard[i].y] = [];
						this.instanceTextObj[t]['dashboard'][this.currentSubChildren[t].dashboard[i].y].push({
							rowspan: this.currentSubChildren[t].dashboard[i].rows,
							value: valueText,
							option: options,
							obj: this.currentSubChildren[t].dashboard[i].obj,
							id: this.currentSubChildren[t].dashboard[i].id,
							colspan: this.currentSubChildren[t].dashboard[i].cols,
							oddRow: this.currentSubChildren[t].dashboard[i].oddRow,
							evenRow: this.currentSubChildren[t].dashboard[i].evenRow,
							x: this.currentSubChildren[t].dashboard[i].x,
							y: this.currentSubChildren[t].dashboard[i].y,
						});
					} else {
						for (
							let z: number = 0;
							z <
							this.instanceTextObj[t]['dashboard'][this.currentSubChildren[t].dashboard[i].y]
								?.length;
							z++
						) {
							if (
								this.currentSubChildren[t].dashboard[i].x <
								this.instanceTextObj[t]['dashboard'][this.currentSubChildren[t].dashboard[i].y][z].x
							) {
								this.instanceTextObj[t]['dashboard'][
									this.currentSubChildren[t].dashboard[i].y
								].splice(z, 0, {
									rowspan: this.currentSubChildren[t].dashboard[i].rows,
									value: valueText,
									option: options,
									id: this.currentSubChildren[t].dashboard[i].id,
									obj: this.currentSubChildren[t].dashboard[i].obj,
									colspan: this.currentSubChildren[t].dashboard[i].cols,
									oddRow: this.currentSubChildren[t].dashboard[i].oddRow,
									evenRow: this.currentSubChildren[t].dashboard[i].evenRow,
									x: this.currentSubChildren[t].dashboard[i].x,
									y: this.currentSubChildren[t].dashboard[i].y,
								});
								break;
							} else if (
								this.instanceTextObj[t]['dashboard'][this.currentSubChildren[t].dashboard[i].y]
									?.length ===
								z + 1
							) {
								this.instanceTextObj[t]['dashboard'][
									this.currentSubChildren[t].dashboard[i].y
								].push({
									rowspan: this.currentSubChildren[t].dashboard[i].rows,
									value: valueText,
									option: options,
									id: this.currentSubChildren[t].dashboard[i].id,
									obj: this.currentSubChildren[t].dashboard[i].obj,
									colspan: this.currentSubChildren[t].dashboard[i].cols,
									oddRow: this.currentSubChildren[t].dashboard[i].oddRow,
									evenRow: this.currentSubChildren[t].dashboard[i].evenRow,
									x: this.currentSubChildren[t].dashboard[i].x,
									y: this.currentSubChildren[t].dashboard[i].y,
								});
								break;
							}
						}
					}
				}
			}
		}
	}
	public moduleSelectPreview(event: any, index) {
		for (let item of this.instanceTextObj[index].selectedModules) {
			if(item?.id==parseInt(event?.target?.value)) item.selected = true;
			else item.selected = false;
		}
		if (event.target.value === 'null') {
			this.instanceTextObj[index].moduleSelected = false;
		} else {
			this.instanceTextObj[index].moduleSelected = true;
		}
		this.layoutService.updateComponents();
	}
	public routeToModule(index) {
		for (let item of this.instanceTextObj[index].selectedModules) {
			if (item.selected == true && !item.model) {
				window.open(`${item.route}`);
			} else if (item.selected == true && item.model) {
				this.activeModal = this.modalService.open(ExternalComponent, {
					// size: "lg",
					backdrop: 'static',
					keyboard: true,
					windowClass: 'custom-modal-integration',
				});
				this.activeModal.componentInstance.module = item.label;
				this.activeModal.componentInstance.permissionModal = this.activeModal;
				this.activeModal.result.then(
					(result) => {
						// call api to fetch instance data getuserinstance
						console.log('modalll closseeeeeeee', result);
						for (let item of this.instanceTextObj[index].selectedModules) {
							item.selected = false;
						}
						this.instanceTextObj[index].moduleSelected = false;
						this.updateInstance();
					},
					(error) => {
						// on error/dismiss
						console.log('modalll closseeeeeeee', error);
						for (let item of this.instanceTextObj[index].selectedModules) {
							item.selected = false;
						}
						this.instanceTextObj[index].moduleSelected = false;
						this.updateInstance();
					},
				);
			}
		}
	}
	public checkSectionsTick() {
		let topLevelFlag = false;
		let topLevelIndex = -1;
		let subLevelFlag = false;
		let subLevelIndex = -1;
		let topLevelFlagRequired = false;
		let topLevelIndexRequired = -1;
		let subLevelFlagRequired = false;
		let subLevelIndexRequired = -1;
		for (let i: number = 0; i < this.topLevelSections?.length; i++) {
			this.topLevelSections[i].isFilled = false;
			this.topLevelSections[i].requiredFilled = false;
		}
		for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
			this.layoutService.template.sections[i].isFilled = false;
			this.layoutService.template.sections[i].requiredFilled = false;
			let currentDepth = this.layoutService.template.sections[i].secNo.split('.')?.length - 1;
			if (this.layoutService.template.sections[i].parentId == 0) {
				if (this.layoutService.template.sections[topLevelIndex] && topLevelFlag) {
					this.layoutService.template.sections[topLevelIndex].isFilled = true;
					for (let j: number = 0; j < this.topLevelSections?.length; j++) {
						if (
							this.topLevelSections[j].id == this.layoutService.template.sections[topLevelIndex].id
						) {
							this.topLevelSections[j].isFilled =
								this.layoutService.template.sections[topLevelIndex].isFilled;
						}
					}
				}
				if (this.layoutService.template.sections[topLevelIndexRequired] && topLevelFlagRequired) {
					this.layoutService.template.sections[topLevelIndexRequired].requiredFilled = true;
					for (let j: number = 0; j < this.topLevelSections?.length; j++) {
						if (
							this.topLevelSections[j].id ==
							this.layoutService.template.sections[topLevelIndexRequired].id
						) {
							this.topLevelSections[j].requiredFilled =
								this.layoutService.template.sections[topLevelIndexRequired].requiredFilled;
						}
					}
				}
				topLevelFlag = true;
				topLevelIndex = i;
				topLevelFlagRequired = true;
				topLevelIndexRequired = i;
				if (this.layoutService.template.sections[subLevelIndex] && subLevelFlag) {
					this.layoutService.template.sections[subLevelIndex].isFilled = true;
				}
				if (this.layoutService.template.sections[subLevelIndexRequired] && subLevelFlagRequired) {
					this.layoutService.template.sections[subLevelIndexRequired].requiredFilled = true;
				}
			} else if (currentDepth == 1) {
				if (this.layoutService.template.sections[subLevelIndex] && subLevelFlag) {
					this.layoutService.template.sections[subLevelIndex].isFilled = true;
					this.layoutService.template.sections[subLevelIndex].requiredFilled = true;
				}
				if (this.layoutService.template.sections[subLevelIndexRequired] && subLevelFlagRequired) {
					this.layoutService.template.sections[subLevelIndexRequired].isFilled = true;
					this.layoutService.template.sections[subLevelIndexRequired].requiredFilled = true;
				}
				subLevelFlag = true;
				subLevelIndex = i;
				subLevelFlagRequired = true;
				subLevelIndexRequired = i;
			}
			if (
				(this.layoutService.template.sections[i].parentId != 0 &&
					this.layoutService.template.sections[i].linked_component != 0 &&
					this.layoutService.template.sections[i].selected_linked_component !=
						this.layoutService.template.sections[i].linked_component) ||
				this.layoutService.template.sections[i].hideInInstance
			) {
				this.layoutService.template.sections[i].isFilled = true;
				this.layoutService.template.sections[i].requiredFilled = true;
				if (i == this.layoutService.template.sections?.length - 1) {
					if (topLevelFlag) {
						this.layoutService.template.sections[topLevelIndex].isFilled = true;
					}
					if (topLevelFlagRequired) {
						this.layoutService.template.sections[topLevelIndex].requiredFilled = true;
					}
					for (let j: number = 0; j < this.topLevelSections?.length; j++) {
						if (
							this.topLevelSections[j].id == this.layoutService.template.sections[topLevelIndex].id
						) {
							this.topLevelSections[j].isFilled =
								this.layoutService.template.sections[topLevelIndex].isFilled;
						}
						if (
							this.topLevelSections[j].id ==
							this.layoutService.template.sections[topLevelIndexRequired].id
						) {
							this.topLevelSections[j].requiredFilled =
								this.layoutService.template.sections[topLevelIndexRequired].requiredFilled;
						}
					}
					if (subLevelFlag) {
						this.layoutService.template.sections[subLevelIndex].isFilled = true;
					}
					if (subLevelFlagRequired) {
						this.layoutService.template.sections[subLevelIndexRequired].requiredFilled = true;
					}
				}
				continue;
			}
			let flag = false;
			let flagRequired = false;
			let hideRows = [];
			if (this.layoutService.template.sections[i].is_table) {
				for (let option of this.layoutService.template.sections[i].dashboard[0].obj?.options) {
					if (!option.selected && option.linkedRowValue && option.linkedRowValue.row) {
						hideRows.push(option.linkedRowValue.y);
					}
				}
			}
			for (let j: number = 0; j < this.layoutService.template.sections[i].dashboard?.length; j++) {
				if (hideRows.includes(this.layoutService.template.sections[i].dashboard[j].y)) {
					continue;
				}
				if (
					this.layoutService.template.sections[i].dashboard[j] &&
					(this.layoutService.template.sections[i].dashboard[j].obj.type == this.uicomponentTypes.SIGNATURE ||
						this.layoutService.template.sections[i].dashboard[j].obj.type == this.uicomponentTypes.SIMPLE_IMAGE ||
						this.layoutService.template.sections[i].dashboard[j].obj.type == this.uicomponentTypes.TEXT ||
						this.layoutService.template.sections[i].dashboard[j].obj.type == this.uicomponentTypes.CALCULATION ||
						this.layoutService.template.sections[i].dashboard[j].obj.type == this.uicomponentTypes.LINE ||
						(this.layoutService.template.sections[i].dashboard[j].obj.answers &&
							this.layoutService.template.sections[i].dashboard[j].obj.answers?.length &&
							!(
								this.layoutService.template.sections[i].dashboard[j].obj.type == this.uicomponentTypes.INPUT &&
								this.layoutService.template.sections[i].dashboard[j].obj.answers[0].answer == ''
							)) ||
						(this.layoutService.template.sections[i].dashboard[j].obj.options &&
							this.layoutService.template.sections[i].dashboard[j].obj.options?.length == 0) ||
						(this.layoutService.template.sections[i].dashboard[j].obj
							.selected_linked_ui_component !=
							this.layoutService.template.sections[i].dashboard[j].obj.linked_ui &&
							!this.layoutService.template.sections[i].dashboard[j].obj.is_single_select) ||
						(!this.layoutService.template.sections[i].dashboard[j].obj
							.selected_linked_ui_component &&
							this.layoutService.template.sections[i].dashboard[j].obj.linked_ui))
				) {
					let commentsCheck = false;
					if (
						this.layoutService.template.sections[i].dashboard[j].obj.type == this.uicomponentTypes.CHECKBOX ||
						this.layoutService.template.sections[i].dashboard[j].obj.type == this.uicomponentTypes.RADIO
					) {
						for (
							let optionIndex: number = 0;
							optionIndex < this.layoutService.template.sections[i].dashboard[j].obj.options?.length;
							optionIndex++
						) {
							if (
								this.layoutService.template.sections[i].dashboard[j].obj.options[optionIndex]
									.input &&
								this.layoutService.template.sections[i].dashboard[j].obj.options[optionIndex]
									.instanceInputValue?.length == 0 &&
								this.layoutService.template.sections[i].dashboard[j].obj.options[optionIndex]
									.selected
							) {
								flag = false;
								topLevelFlag = false;
								subLevelFlag = false;
								commentsCheck = true;
							}
						}
					}
					if (!commentsCheck) {
						flag = true;
					}
				} else {
					flag = false;
					topLevelFlag = false;
					subLevelFlag = false;
				}
				if (
					this.layoutService.template.sections[i].dashboard[j] &&
					(this.layoutService.template.sections[i].dashboard[j].obj.type == this.uicomponentTypes.SIGNATURE ||
						this.layoutService.template.sections[i].dashboard[j].obj.type == this.uicomponentTypes.SIMPLE_IMAGE ||
						this.layoutService.template.sections[i].dashboard[j].obj.type == this.uicomponentTypes.TEXT ||
						this.layoutService.template.sections[i].dashboard[j].obj.type == this.uicomponentTypes.CALCULATION ||
						this.layoutService.template.sections[i].dashboard[j].obj.type == this.uicomponentTypes.LINE ||
						(this.layoutService.template.sections[i].dashboard[j].obj.answers &&
							this.layoutService.template.sections[i].dashboard[j].obj.answers?.length &&
							!(
								this.layoutService.template.sections[i].dashboard[j].obj.type == this.uicomponentTypes.INPUT &&
								this.layoutService.template.sections[i].dashboard[j].obj.answers[0].answer == ''
							)) ||
						(this.layoutService.template.sections[i].dashboard[j].obj.options &&
							this.layoutService.template.sections[i].dashboard[j].obj.options?.length == 0) ||
						(this.layoutService.template.sections[i].dashboard[j].obj
							.selected_linked_ui_component !=
							this.layoutService.template.sections[i].dashboard[j].obj.linked_ui &&
							!this.layoutService.template.sections[i].dashboard[j].obj.is_single_select) ||
						(!this.layoutService.template.sections[i].dashboard[j].obj
							.selected_linked_ui_component &&
							this.layoutService.template.sections[i].dashboard[j].obj.linked_ui))
				) {
					let commentsCheck = false;
					if (
						this.layoutService.template.sections[i].dashboard[j].obj.type == this.uicomponentTypes.CHECKBOX ||
						this.layoutService.template.sections[i].dashboard[j].obj.type == this.uicomponentTypes.RADIO
					) {
						for (
							let optionIndex: number = 0;
							optionIndex < this.layoutService.template.sections[i].dashboard[j].obj.options?.length;
							optionIndex++
						) {
							if (
								this.layoutService.template.sections[i].dashboard[j].obj.options[optionIndex]
									.input &&
								this.layoutService.template.sections[i].dashboard[j].obj.options[optionIndex]
									.is_required &&
								this.layoutService.template.sections[i].dashboard[j].obj.options[optionIndex]
									.instanceInputValue?.length == 0 &&
								this.layoutService.template.sections[i].dashboard[j].obj.options[optionIndex]
									.selected
							) {
								flag = false;
								topLevelFlag = false;
								subLevelFlag = false;
								commentsCheck = true;
							}
						}
					}
					if (!commentsCheck) {
						flagRequired = true;
					}
				} else {
					if (
						this.layoutService.template.sections[i].dashboard[j] &&
						this.layoutService.template.sections[i].dashboard[j].obj.is_required
					) {
						flagRequired = false;
						topLevelFlagRequired = false;
						subLevelFlagRequired = false;
					}
				}
			}
			if (i == this.layoutService.template.sections?.length - 1) {
				if (topLevelFlag) {
					this.layoutService.template.sections[topLevelIndex].isFilled = true;
				}
				if (topLevelFlagRequired) {
					this.layoutService.template.sections[topLevelIndexRequired].requiredFilled = true;
				}
				for (let j: number = 0; j < this.topLevelSections?.length; j++) {
					if (
						this.topLevelSections[j].id == this.layoutService.template.sections[topLevelIndex].id
					) {
						this.topLevelSections[j].isFilled =
							this.layoutService.template.sections[topLevelIndex].isFilled;
					}
					if (
						this.topLevelSections[j].id ==
						this.layoutService.template.sections[topLevelIndexRequired].id
					) {
						this.topLevelSections[j].requiredFilled =
							this.layoutService.template.sections[topLevelIndexRequired].requiredFilled;
					}
				}
				if (subLevelFlag) {
					this.layoutService.template.sections[subLevelIndex].isFilled = true;
				}
				if (subLevelFlagRequired) {
					this.layoutService.template.sections[subLevelIndexRequired].requiredFilled = true;
				}
			}
		}
		this.changeDetector.markForCheck();
	}
	createSignature(object: signatureProperties) {
		let doctor_signature: { signature_file: Blob; };
		let patient_signature: { signature_file: Blob; };
		let doc_id: number;
		let patient_id: number;
		switch (object.signature_type) {
			case SIGNATURE_TYPES.DOCTOR_SIGNATURE:
				doctor_signature = object.signature;
				doc_id = parseInt(object.signature_id);
				break;
			case SIGNATURE_TYPES.PATIENT_SIGNATURE:
				patient_signature = object.signature;
				patient_id = parseInt(object.signature_id);
				break;
			default:
				break;
		}
		var type = (function (global) {
			var cache = {};
			return function (obj) {
				var key;
				return obj === null
					? 'null' // null
					: obj === global
					? 'global' // window in browser or global in nodejs
					: (key = typeof obj) !== 'object'
					? key // basic: string, boolean, number, undefined, function
					: obj.nodeType
					? 'object' // DOM element
					: cache[(key = {}.toString.call(obj))] || // cached. date, regexp, error, object, array, math
					  (cache[key] = key.slice(8, -1).toLowerCase()); // get XXXX from [object XXXX], and cache it
			};
		})(this);
		return this.signatureService.specialtyCreateSignature(
			this.visit_idd,
			patient_signature
				? type(patient_signature?.signature_file) === 'blob'
					? patient_signature.signature_file
					: null
				: null,
			'signature.png',
			doctor_signature
				? type(doctor_signature?.signature_file) === 'blob'
					? doctor_signature.signature_file
					: null
				: null,
			'signature.png',
			patient_id,
			doc_id,
		);
	}
	private calculateSectionErrors (sectionIndex: number): void {
		for(let i = 0; i < sectionIndex; i++) {
			for (const uiComponent of this.layoutService.template.sections[i].dashboard) {
				if (
					uiComponent.obj.type == this.uicomponentTypes.CHECKBOX ||
					uiComponent.obj.type == this.uicomponentTypes.RADIO
				) {
					for (
					let optionIndex: number = 0;
					optionIndex < uiComponent.obj.options.length;
					optionIndex++
					) {
					if (
						uiComponent.obj.options[optionIndex]
						.is_required &&
					uiComponent.obj.options[optionIndex]
						.instanceInputValue.length == 0 &&
					uiComponent.obj.options[optionIndex]
						.selected &&
						this.layoutService.template.sections[i].linked_component ==
						this.layoutService.template.sections[i].selected_linked_component &&
					!(
						(uiComponent.obj
						.selected_linked_ui_component !=
						uiComponent.obj.linked_ui &&
						!uiComponent.obj.is_single_select) ||
						(!uiComponent.obj
						.selected_linked_ui_component &&
						uiComponent.obj.linked_ui)
					)
					) {
						this.setTemplateErrors(this.layoutService.template, this.layoutService.template.sections[i], uiComponent)
						this.previewRequiredFieldsCheck = true
						// this.stopLoader()
						return
					}
					}
				}
				if (!this.layoutService.template.sections[i].requiredFilled) {
					for (
					let j: number = 0;
					j < this.layoutService.template.sections[i].dashboard.length;
					j++
					) {
					if (
						uiComponent.obj.is_required &&
					uiComponent.obj.answers.length == 0 &&
					this.layoutService.template.sections[i].linked_component ==
					this.layoutService.template.sections[i].selected_linked_component &&
					!(
						(uiComponent.obj
						.selected_linked_ui_component !=
						uiComponent.obj.linked_ui &&
						!uiComponent.obj.is_single_select) ||
					(!uiComponent.obj
						.selected_linked_ui_component &&
						uiComponent.obj.linked_ui)
					)
					) {
						this.previewRequiredFieldsCheck = true
						this.setTemplateErrors(this.layoutService.template, this.layoutService.template.sections[i], uiComponent)
						// this.stopLoader()
						return
					}
					}
				}
			
				if (uiComponent.obj.type == this.uicomponentTypes.INPUT && uiComponent.obj.fieldMaskProperty != '') {
					let tempString = this.layoutService.stripHtml(uiComponent.obj.input)
					tempString = tempString.replace(/\&nbsp;/g, ' ')
					if (
					tempString.length < uiComponent.obj.fieldMaskProperty.length &&
					!uiComponent.obj.fieldMaskProperty.match(new RegExp(/\*/))
					) {
					this.toastrService.error('Input is too short')
					this.setTemplateErrors(this.layoutService.template, this.layoutService.template.sections[i], uiComponent)
					// this.stopLoader()
					return
					}
					if (
					tempString.length > uiComponent.obj.fieldMaskProperty.length &&
					!uiComponent.obj.fieldMaskProperty.match(new RegExp(/\*/))
					) {
					this.toastrService.error('Input is too long')
					this.setTemplateErrors(this.layoutService.template, this.layoutService.template.sections[i], uiComponent)
					// this.stopLoader()
					return
					}
					const regexp = new RegExp(uiComponent.obj.fieldMaskRegex)
					const regexResult = tempString.match(regexp)
					let startWildCard = false
					if (!regexResult) {
					for (let i: number = 0; i < uiComponent.obj.fieldMaskProperty.length; i++) {
						const letter = uiComponent.obj.fieldMaskProperty[i]
						if (i == 0 && letter == '*') {
						startWildCard = true
						break
						}
						let testRegex = new RegExp(/[A-Za-z0-9]{1}/)
						switch (letter) {
						case 'A':
							testRegex = new RegExp(/[A-Za-z0-9]{1}/)
							if (tempString[i] && !tempString[i].match(testRegex)) {
							this.toastrService.error(
					`Invalid input. The character at postion ${
					i + 1
					} must be a number or a letter`
							)
							this.setTemplateErrors(this.layoutService.template, this.layoutService.template.sections[i], uiComponent)
							// this.stopLoader()
							return
							}
							break
						case 'a':
							testRegex = new RegExp(/[A-Za-z0-9 ]{1}/)
							if (tempString[i] && !tempString[i].match(testRegex)) {
							this.toastrService.error(
					`Invalid input. The character at postion ${
					i + 1
					} must be a number, a space or a letter`
							)
							this.setTemplateErrors(this.layoutService.template, this.layoutService.template.sections[i], uiComponent)
							// this.stopLoader()
							return
							}
							break
						case '0':
							testRegex = new RegExp(/[0-9]{1}/)
							if (tempString[i] && !tempString[i].match(testRegex)) {
							this.toastrService.error(
					`Invalid input. The character at postion ${i + 1} must be a number`
							)
							this.setTemplateErrors(this.layoutService.template, this.layoutService.template.sections[i], uiComponent)

							// this.stopLoader()
							return
							}
							break
						case '9':
							testRegex = new RegExp(/[0-9 ]{1}/)
							if (tempString[i] && !tempString[i].match(testRegex)) {
							this.toastrService.error(
					`Invalid input. The character at postion ${
					i + 1
					} must be a number or a space`
							)
							this.setTemplateErrors(this.layoutService.template, this.layoutService.template.sections[i], uiComponent)

							// this.stopLoader()
							return
							}
							break
						case 'L':
							testRegex = new RegExp(/[A-Za-z]{1}/)
							if (tempString[i] && !tempString[i].match(testRegex)) {
							this.toastrService.error(
					`Invalid input. The character at postion ${i + 1} must be a letter`
							)
							this.setTemplateErrors(this.layoutService.template, this.layoutService.template.sections[i], uiComponent)

							// this.stopLoader()
							return
							}
							break
						case 'l':
							testRegex = new RegExp(/[A-Za-z ]{1}/)
							if (tempString[i] && !tempString[i].match(testRegex)) {
							this.toastrService.error(
					`Invalid input. The character at postion ${
					i + 1
					} must be a letter or a space`
							)
							this.setTemplateErrors(this.layoutService.template, this.layoutService.template.sections[i], uiComponent)

							// this.stopLoader()
							return
							}
							break
						case '?':
							break
						}
					}
					}
					if (startWildCard) {
					let inputIndex: number = 0
					for (let i = uiComponent.obj.fieldMaskProperty.length - 1; i > 0; i--) {
						const letter = uiComponent.obj.fieldMaskProperty[i]
						inputIndex++
						let testRegex = new RegExp(/[A-Za-z0-9]{1}/)
						switch (letter) {
						case 'A':
							testRegex = new RegExp(/[A-Za-z0-9]{1}/)
							if (
							tempString[tempString.length - inputIndex] &&
					!tempString[tempString.length - inputIndex].match(testRegex)
							) {
							this.toastrService.error(
					`Invalid input. The character at postion ${
					tempString.length - inputIndex + 1
					} must be a number or a letter`
							)
							this.setTemplateErrors(this.layoutService.template, this.layoutService.template.sections[i], uiComponent)

							// this.stopLoader()
							return
							}
							break
						case 'a':
							testRegex = new RegExp(/[A-Za-z0-9 ]{1}/)
							if (
							tempString[tempString.length - inputIndex] &&
					!tempString[tempString.length - inputIndex].match(testRegex)
							) {
							this.toastrService.error(
					`Invalid input. The character at postion ${
					tempString.length - inputIndex + 1
					} must be a number, a space or a letter`
							)
							this.setTemplateErrors(this.layoutService.template, this.layoutService.template.sections[i], uiComponent)

							// this.stopLoader()
							return
							}
							break
						case '0':
							testRegex = new RegExp(/[0-9]{1}/)
							if (
							tempString[tempString.length - inputIndex] &&
					!tempString[tempString.length - inputIndex].match(testRegex)
							) {
							this.toastrService.error(
					`Invalid input. The character at postion ${
					tempString.length - inputIndex + 1
					} must be a number`
							)
							this.setTemplateErrors(this.layoutService.template, this.layoutService.template.sections[i], uiComponent)

							// this.stopLoader()
							return
							}
							break
						case '9':
							testRegex = new RegExp(/[0-9 ]{1}/)
							if (
							tempString[tempString.length - inputIndex] &&
					!tempString[tempString.length - inputIndex].match(testRegex)
							) {
							this.toastrService.error(
					`Invalid input. The character at postion ${
					tempString.length - inputIndex + 1
					} must be a number or a space`
							)
							this.setTemplateErrors(this.layoutService.template, this.layoutService.template.sections[i], uiComponent)

							// this.stopLoader()
							return
							}
							break
						case 'L':
							testRegex = new RegExp(/[A-Za-z]{1}/)
							if (
							tempString[tempString.length - inputIndex] &&
					!tempString[tempString.length - inputIndex].match(testRegex)
							) {
							this.toastrService.error(
					`Invalid input. The character at postion ${
					tempString.length - inputIndex + 1
					} must be a letter`
							)
							this.setTemplateErrors(this.layoutService.template, this.layoutService.template.sections[i], uiComponent)

							// this.stopLoader()
							return
							}
							break
						case 'l':
							testRegex = new RegExp(/[A-Za-z ]{1}/)
							if (
							tempString[tempString.length - inputIndex] &&
					!tempString[tempString.length - inputIndex].match(testRegex)
							) {
							this.toastrService.error(
					`Invalid input. The character at postion ${
					tempString.length - inputIndex + 1
					} must be a letter or a space`
							)
							this.setTemplateErrors(this.layoutService.template, this.layoutService.template.sections[i], uiComponent)

							// this.stopLoader()
							return
							}
							break
						case '?':
							break
						}
					}
					}
					if (regexResult[0] != tempString) {
					this.toastrService.error('Invalid regex', '', { timeOut: 6000 })
					this.setTemplateErrors(this.layoutService.template, this.layoutService.template.sections[i], uiComponent)

					// this.stopLoader()
					return
					}
				}
				if (
					uiComponent.obj.validationCheck &&
					uiComponent.obj.validationValue &&
					uiComponent.obj.validationValue.type == 'email' &&
					uiComponent.obj.input &&
					uiComponent.obj.input.length
				) {
					const emailRegex = new RegExp(
					/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
					)
					const res = emailRegex.test(uiComponent.obj.input)
					if (!res) {
					this.toastrService.error('Invalid email address', '', { timeOut: 6000 })
					this.setTemplateErrors(this.layoutService.template, this.layoutService.template.sections[i], uiComponent)

					// this.stopLoader()
					return
					}
				}
				if (
					uiComponent.obj.validationCheck &&
					uiComponent.obj.validationValue &&
					uiComponent.obj.validationValue.type == 'boolean' &&
					uiComponent.obj.input &&
					uiComponent.obj.input.length
				) {
					const tempValue = uiComponent.obj.input.toLowerCase()
					if (
					tempValue != '0' &&
					tempValue != '1' &&
					tempValue != 'true' &&
					tempValue != 'false' &&
					tempValue != 'yes' &&
					tempValue != 'no'
					) {
					this.toastrService.error('Invalid boolean value', '', { timeOut: 6000 })
					this.setTemplateErrors(this.layoutService.template, this.layoutService.template.sections[i], uiComponent)

					// this.stopLoader()
					return
					}
				}
				if (uiComponent.obj.type == this.uicomponentTypes.INCREMENT) {
					if (
					uiComponent.obj.value > uiComponent.obj.options.ceil ||
					uiComponent.obj.value < uiComponent.obj.options.floor
					) {
					this.toastrService.error('Invalid increment value', '', { timeOut: 6000 })
					this.setTemplateErrors(this.layoutService.template, this.layoutService.template.sections[i], uiComponent)

						// this.stopLoader()
					return
					}
				}
				if (
					uiComponent.obj.type == this.uicomponentTypes.INPUT &&
					uiComponent.obj.validationValue.value == 'Number'
				) {
					if (
					parseFloat(uiComponent.obj.input) < parseFloat(uiComponent.obj.minLimit) ||
					parseFloat(uiComponent.obj.input) > parseFloat(uiComponent.obj.maxLimit)
					) {
					this.toastrService.error('Invalid input number value', '', { timeOut: 6000 })
					this.setTemplateErrors(this.layoutService.template, this.layoutService.template.sections[i], uiComponent)
					// this.stopLoader()
					return
					}
				}
				for (
					let i: number = 0;
					uiComponent.obj.options && i < uiComponent.obj.options.length;
					i++
				) {
					if (
					uiComponent.obj.options[i].selected &&
					uiComponent.obj.options[i].validationValue &&
					uiComponent.obj.options[i].validationValue.value == 'Number'
					) {
					if (
						parseFloat(uiComponent.obj.options[i].instanceInputValue) <
					parseFloat(uiComponent.obj.options[i].minLimit) ||
					parseFloat(uiComponent.obj.options[i].instanceInputValue) >
					parseFloat(uiComponent.obj.options[i].maxLimit)
					) {
						this.toastrService.error('Invalid input number value', '', { timeOut: 6000 })
						this.setTemplateErrors(this.layoutService.template, this.layoutService.template.sections[i], uiComponent)

						// this.stopLoader()
						return
					}
					}
					if (
					uiComponent.obj.options[i].validationCheck &&
					uiComponent.obj.options[i].validationValue &&
					uiComponent.obj.options[i].validationValue.type == 'email' &&
					uiComponent.obj.options[i].instanceInputValue &&
					uiComponent.obj.options[i].instanceInputValue.length
					) {
					const emailRegex = new RegExp(
						/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
					)
					const res = emailRegex.test(uiComponent.obj.options[i].instanceInputValue)
					if (!res) {
						this.toastrService.error('Invalid email address', '', { timeOut: 6000 })
						this.setTemplateErrors(this.layoutService.template, this.layoutService.template.sections[i], uiComponent)

						// this.stopLoader()
						return
					}
					}
					if (
					uiComponent.obj.options[i].validationCheck &&
					uiComponent.obj.options[i].validationValue &&
					uiComponent.obj.options[i].validationValue.type == 'boolean' &&
					uiComponent.obj.options[i].instanceInputValue &&
					uiComponent.obj.options[i].instanceInputValue.length
					) {
					const tempValue = uiComponent.obj.options[i].instanceInputValue.toLowerCase()
					if (
						tempValue != '0' &&
					tempValue != '1' &&
					tempValue != 'true' &&
					tempValue != 'false' &&
					tempValue != 'yes' &&
					tempValue != 'no'
					) {
						this.toastrService.error('Invalid boolean value', '', { timeOut: 6000 })
						this.setTemplateErrors(this.layoutService.template, this.layoutService.template.sections[i], uiComponent)

						// this.stopLoader()
						return
					}
					}
				}
			}
		}
	  }
	  

	async saveInstance(check) {
		if (document.getElementById('scrollPosition')) {
			let elmnt = document.getElementById('scrollPosition');
			elmnt.scrollTop = 0;
			this.layoutService.scroll = '';
		}
		this.previewLoaded = false;
		let sectionIndex = -1;
		this.layoutService.isLoaderPending.next(true);
		let templateSaved = false;
		for (let section of this.layoutService.template.sections) {
			sectionIndex++;
			if (this.subLevelIndex != -1) {
				if (sectionIndex > this.subLevelIndex) {
					break;
				}
			} else {
				if (sectionIndex > this.topLevelIndex) {
					break;
				}
			}


		}
		if (!this.layoutService.isInstancePreview) {
			this.checkRequiredFields(true, false)
		}
		this.layoutService.template['appointment_id'] = this.appointment_idd;
		this.layoutService.template['visit_id'] = this.visit_idd;
		this.layoutService.template['speciality_id'] = this.speciality_idd;
		this.layoutService.template['template_id'] =
			this.template_idd || this.layoutService.template.template_id;
		this.layoutService.template['visit_type_id'] = this.visit_type_idd;
		this.layoutService.template['location_id'] = this.location_idd;
		this.layoutService.template['case_id'] = this.templateObjInfo.case_id;
		this.layoutService.template['chart_no'] = parseInt(this.templateObjInfo.chart_id);
		this.layoutService.template['appointment_date'] = convertDateTimeForSending(
			this.storageData,
			new Date(this.templateObjInfo.current_aptdate_time),
		);
		await this.sectionEmptyUncheck();
		if (this.layoutService.isInstancePreview) {
			this.stopLoader();
			let newCheck: number = 0;
			let lastSectionCheck = true;
			for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
				if (
					(this.topLevelId === this.layoutService.template.sections[i].id &&
						this.subLevelId === 0) ||
					this.subLevelId === this.layoutService.template.sections[i].id
				) {
					newCheck = 1;
				} else if (
					newCheck &&
					(this.layoutService.template.sections[i].parentId === this.topLevelId ||
						this.layoutService.template.sections[i].parentId === 0)
				) {
					if (this.layoutService.template.sections[i].parentId === 0) {
						if (
							(this.layoutService.template.sections[i].linked_component == 0 ||
								this.layoutService.template.sections[i].selected_linked_component ===
									this.layoutService.template.sections[i].linked_component) &&
							!this.layoutService.template.sections[i].hideInInstance
						) {
							this.currentSubChildren = [];
							await this.instanceSectionChange(this.layoutService.template.sections[i]);
							lastSectionCheck = false;
						} else {
							continue;
						}
					} else {
						if (
							(this.layoutService.template.sections[i].linked_component == 0 ||
								this.layoutService.template.sections[i].selected_linked_component ===
									this.layoutService.template.sections[i].linked_component) &&
							!this.layoutService.template.sections[i].hideInInstance
						) {
							this.currentSubChildren = [];
							await this.instanceSubSectionChange(this.layoutService.template.sections[i]);
							lastSectionCheck = false;
						} else {
							continue;
						}
					}
					break;
				}
			}
			if (!lastSectionCheck && check != 2) {
				await this.instanceText();
			} else {
				if (this.layoutService.template.pdf_type == 2) {
					this.highlightPreview = true;
					this.topLevelId = -1;
					await this.staticC43Generate('doctorPdf');
				} else {
					this.highlightPreview = true;
					await this.makeText(0);
					await this.saveAlignment();
					if (this.hfImages == 0) {
						await this.pdfPreview(1, '');
					}
				}
			}
			this.changeDetector.detectChanges();
			this.stopLoader();
			return;
		}
		if (!templateSaved) {
			this.requestService
				.sendRequest(
					TemaplateManagerUrlsEnum.addUserInstance,
					'POST',
					REQUEST_SERVERS.templateManagerUrl,
					this.layoutService.template,
				)
				.subscribe(
					async (res: HttpSuccessResponse) => {
						let finalizeVisitData = {
							id: this.visit_idd,
							visit_session_state_id: this.visit_status==2? 1:this.visit_status,
							warning:true
						};

						if(this.visit_status!=2){
							let	warning = false; 
							const scheduler = this.storageData.getSchedulerInfo();
							let templateObj = scheduler.template_instance;
							let appointment_slug = templateObj.appointment_slug;
							if (appointment_slug != 'fu_mmi') {
								warning = true;
							}
							finalizeVisitData = this.finaliseVisitParam(warning,true)
						}
							
						this.requestService
							.sendRequest(
								TemaplateManagerUrlsEnum.updateVisitSession,
								'PUT',
								REQUEST_SERVERS.fd_api_url,
								{...finalizeVisitData,is_not:1},
							)
							.subscribe(
								async (res2: any) => {
									delete this.layoutService.template['case_id'];
									delete this.layoutService.template['chart_no'];
									delete this.layoutService.template['visit_id'];
									delete this.layoutService.template['appointment_date'];
									if (check) {
										let lastSectionCheck = true;
										// this.layoutService.template = [];
										// this.layoutService.template = res['data'][0];
										this.toastrService.success(res.message, 'Success', { timeOut: 6000 });
										let newCheck: number = 0;
										await this.sectionEmptyCheck();
										for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
											if (
												(this.topLevelId === this.layoutService.template.sections[i].id &&
													this.subLevelId === 0) ||
												this.subLevelId === this.layoutService.template.sections[i].id
											) {
												newCheck = 1;
											} else if (
												newCheck &&
												(this.layoutService.template.sections[i].parentId === this.topLevelId ||
													this.layoutService.template.sections[i].parentId === 0)
											) {
												if (this.layoutService.template.sections[i].parentId === 0) {
													if (
														(this.layoutService.template.sections[i].linked_component == 0 ||
															this.layoutService.template.sections[i].selected_linked_component ===
																this.layoutService.template.sections[i].linked_component) &&
														!this.layoutService.template.sections[i].hideInInstance
													) {
														this.currentSubChildren = [];
														await this.instanceSectionChange(
															this.layoutService.template.sections[i],
														);
														lastSectionCheck = false;
													} else {
														continue;
													}
												} else {
													if (
														(this.layoutService.template.sections[i].linked_component == 0 ||
															this.layoutService.template.sections[i].selected_linked_component ===
																this.layoutService.template.sections[i].linked_component) &&
														!this.layoutService.template.sections[i].hideInInstance
													) {
														this.currentSubChildren = [];
														await this.instanceSubSectionChange(
															this.layoutService.template.sections[i],
														);
														lastSectionCheck = false;
													} else {
														continue;
													}
												}
												break;
											}
										}
										if (!lastSectionCheck && check != 2) {
											await this.instanceText();
											this.stopLoader();
										} else {
											if (
												this.topLevelSections &&
												this.topLevelSections?.length &&
												this.topLevelSections[this.topLevelSections?.length - 1].boundSectionStatement != DOCTOR_EVALUATION_SECTION_TYPES.EVALUATION_PREVIEW
											) {
												this.topLevelSections.push({
													boundSectionStatement: DOCTOR_EVALUATION_SECTION_TYPES.EVALUATION_PREVIEW
												});
											}
											if (this.layoutService.template.pdf_type == 2) {
												this.topLevelId = -1;
												this.highlightPreview = true;
												await this.staticC43Generate('doctorPdf');
											} else {
												this.highlightPreview = true;
												await this.makeText(0);
												await this.saveAlignment();
												if (this.hfImages == 0) {
													await this.pdfPreview(1, '');
												}
												this.stopLoader();
											}
										}
										this.changeDetector.detectChanges();
										} else {
										this.stopLoader();
										this.route.navigate([`scheduler-front-desk/doctor-calendar`]);
									}
								},
								(err) => {
									console.log(err);
									this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
									this.stopLoader();
								},
							);
					},
					(err) => {
						console.log(err);
						this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
						this.stopLoader();
					},
				);
		}
	}
	public optionInstanceRefresh(res) {
		for (let section of res[1]) {
			if (section.parentId == 0) {
				let temp: number = 0;
				if (
					this.topLevelSections[this.topLevelSections?.length - 1].boundSectionStatement == DOCTOR_EVALUATION_SECTION_TYPES.INSTANCE_PREVIEW ||
					this.topLevelSections[this.topLevelSections?.length - 1].boundSectionStatement == DOCTOR_EVALUATION_SECTION_TYPES.EVALUATION_PREVIEW
				) {
					temp = this.topLevelSections[this.topLevelSections?.length - 1];
				}
				this.topLevelSections = [];
				for (let l: number = 0; l < this.layoutService.template.sections?.length; l++) {
					if (this.layoutService.template.sections[l].parentId === 0) {
						if (
							(this.layoutService.template.sections[l].linked_component == 0 ||
								this.layoutService.template.sections[l].selected_linked_component ===
									this.layoutService.template.sections[l].linked_component) &&
							!this.layoutService.template.sections[l].hideInInstance
						) {
							this.topLevelSections.push(this.layoutService.template.sections[l]);
						}
					}
				}
				if (temp) {
					this.topLevelSections.push(temp);
				}
			} else {
				let currentNumber = section.secNo.split('.');
				let displayNumber = -1;
				displayNumber = this.layoutService.template.sections[this.topLevelIndex].secNo.split('.');
				if (
					currentNumber?.length - 1 == 1 &&
					parseInt(currentNumber[0]) == parseInt(displayNumber[0])
				) {
					for (let i: number = 0; i < this.currentSub?.length; i++) {
						let tempNumber = this.currentSub[i].secNo.split('.');
						tempNumber = parseInt(tempNumber[1]);
						if (tempNumber > currentNumber[1] && res[2]) {
							this.currentSub.splice(i, 0, section);
							break;
						} else if (i == this.currentSub?.length - 1 && res[2]) {
							this.currentSub.splice(i + 1, 0, section);
							break;
						} else if (tempNumber == currentNumber[1] && !res[2]) {
							this.currentSub.splice(i, 1);
							if (this.subLevelId == section.id) {
								this.instanceSectionChange(
									this.layoutService.template.sections[this.topLevelIndex],
								);
							}
							break;
						}
					}
					if (this.currentSub?.length == 0 && res[2] && !section.hideInInstance) {
						this.currentSub.push(section);
						this.instanceSubSectionChange(section, 2, section);
					}
				} else {
					if (this.subLevelId != 0) {
						currentNumber = section.secNo.split('.');
						currentNumber = parseFloat(currentNumber[0] + '.' + currentNumber[1]);
						let tempNumber =
							this.layoutService.template.sections[this.subLevelIndex].secNo.split('.');
						tempNumber = parseFloat(tempNumber[0] + '.' + tempNumber[1]);
						if (currentNumber == tempNumber) {
							this.instanceSubSectionChange(
								this.layoutService.template.sections[this.subLevelIndex],
								2,
								section,
							);
						}
					}
				}
			}
		}
	}
	originalInstance = '';
	topLevelSections = [];
	currentSub = [];
	showpreview = false;
	async getInstance(condition) {
		if (condition == -1) {
			this.layoutService.isInstancePreview = false;
			this.route.navigate(['/template-manager/instance']);
		} else if (condition === 0) {
			this.layoutService.isInstancePreview = false;
			let data = {
				appointment_id: this.appointment_idd,
				speciality_id: this.speciality_idd,
				visit_type_id: this.visit_type_idd,
				visit_id: this.visit_idd,
				location_id: this.location_idd,
				user_id: this.storageData.getUserId(),
				case_id: this.templateObjInfo.case_type_id,
			};
			await this.requestService
				.sendRequest(
					TemplateMasterUrlEnum.getFacilitiesLocations,
					'GET',
					REQUEST_SERVERS.fd_api_url,
				)
				.subscribe(
					(response: HttpSuccessResponse) => {
						this.locations = JSON.parse(JSON.stringify(response.result.data));
						this.requestService
							.sendRequest(TemplateMasterUrlEnum.specialities, 'GET', REQUEST_SERVERS.fd_api_url)
							.subscribe(
								(response: HttpSuccessResponse) => {
									this.specialities = JSON.parse(JSON.stringify(response.result.data));
								},
								(err) => {
									console.log(err);
									this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
									this.stopLoader();
								},
							);
					},
					(err) => {
						console.log(err);
						this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
						this.stopLoader();
					},
				);
			this.requestService
				.sendRequest(
					TemaplateManagerUrlsEnum.getTemplateByID,
					'POST',
					REQUEST_SERVERS.templateManagerUrl,
					{
						visit_id: this.visit_idd,
						template_id: this.template_idd || this.layoutService.template.template_id,
					},
				)
				.subscribe(
					async (res: any) => {
						this.infoInstance.check = false;
						if (res['data']?.length === 0) {
							for (let item of this.allExternalSlugs) {
								item.selectedUI = [];
								item.addedFields = [];
							}
							this.layoutService.backupQueue = [];
							this.layoutService.backupIndex = -2;
							this.layoutService.backupId = 1;
							this.layoutService.template = {
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
								lineSpacingValue: 15,
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
								sections: [],
								uiCompIds: 0,
								carryOriginalDeleted: [],
								allExternalSlugs: [],
								carryNewDeleted: [],
								pageSize: {
									width: 205,
									height: 297,
								},
								pdfMarginTop: 0,
								pdfMarginBottom: 0,
								pdfMarginLeft: 5,
								pdfMarginRight: 5,
							};
							this.emptySelectedComponents();
							this.requestService
								.sendRequest(
									TemaplateManagerUrlsEnum.mappingKeywords,
									'GET',
									REQUEST_SERVERS.fd_api_url,
								)
								.subscribe(
									(res: any) => {
										this.layoutService.template['mappingKeyWords'] = res.result.data;
									},
									(err) => {
										console.log(err);
										this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
										this.stopLoader();
									},
								);
						} else {
							this.layoutService.template = res['data'];
							this.removeAllTemplateErrors()
						}
						for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
							if (this.layoutService.template.sections[i].carryForward) {
								if (!this.layoutService.template.sections[i].carryForward.carryForwardApplied) {
									this.layoutService.template.sections[i].carryForward.carryForwardCheck = false;
									this.layoutService.template.sections[i].carryForward.cfList = [];
									this.layoutService.template.sections[i].carryForward.carryForwardSections = [];
								} else {
									this.layoutService.template.sections[i].carryForward.carryForwardCheck = true;
								}
							}
							for (
								let j: number = 0;
								j < this.layoutService.template.sections[i].dashboard?.length;
								j++
							) {
								if (
									!isNil(this.layoutService.template.sections[i].dashboard[j].obj.preDefinedObj)
								) {
									this.layoutService.lastI = i;
									this.layoutService.lastK = j;
									this.preDefindSelect({
										target: {
											value:
												this.layoutService.template.sections[i].dashboard[j].obj.preDefinedObj.id,
										},
									});
								}
							}
						}
						await this.sectionEmptyCheck();
						this.layoutService.editorView = true;
						this.topLevelSections = [];
						this.currentSub = [];
						this.currentSubChildren = [];
						let firstTop: number = null;
						for (let l: number = 0; l < this.layoutService.template.sections?.length; l++) {
							if (this.layoutService.template.sections[l].parentId === 0) {
								if (
									(this.layoutService.template.sections[l].linked_component == 0 ||
										this.layoutService.template.sections[l].selected_linked_component ===
											this.layoutService.template.sections[l].linked_component) &&
									!this.layoutService.template.sections[l].hideInInstance
								) {
									if (firstTop == null) firstTop = l;
									this.topLevelSections.push(this.layoutService.template.sections[l]);
								}
							}
							for (
								let x: number = 0;
								x < this.layoutService.template.sections[l].dashboard?.length;
								x++
							) {
								if (this.layoutService.template.sections[l].dashboard[x].obj.info) {
									this.infoInstance.lastI = l;
									this.infoInstance.lastK = x;
									this.infoInstance.check = true;
								}
								this.componentsService.push({
									id: this.layoutService.template.sections[l].dashboard[x].id,
									componentRef: this.layoutService.template.sections[l].dashboard[x].obj.type,
								});
							}
						}
						for (let q = firstTop + 1; q < this.layoutService.template.sections?.length; q++) {
							if (this.layoutService.template.sections[q].parentId === 0) {
								break;
							} else if (
								this.layoutService.template.sections[q].parentId ===
								this.layoutService.template.sections[firstTop ? firstTop : 0].id
							) {
								if (
									(this.layoutService.template.sections[q].linked_component == 0 ||
										this.layoutService.template.sections[q].selected_linked_component ===
											this.layoutService.template.sections[q].linked_component) &&
									!this.layoutService.template.sections[q].hideInInstance
								) {
									this.currentSub.push(this.layoutService.template.sections[q]);
								}
							}
						}
						let firstSectionIndex = -1;
						for (let x: number = 0; x < this.layoutService.template.sections?.length; x++) {
							if (
								this.layoutService.template.sections[x].parentId === 0 &&
								(this.layoutService.template.sections[x].linked_component == 0 ||
									this.layoutService.template.sections[x].selected_linked_component ===
										this.layoutService.template.sections[x].linked_component) &&
								!this.layoutService.template.sections[x].hideInInstance
							) {
								firstSectionIndex = x;
								break;
							}
						}
						if (
							firstSectionIndex != -1 &&
							this.layoutService.template.sections[firstSectionIndex + 1] &&
							this.layoutService.template.sections[firstSectionIndex + 1].parentId ===
								this.layoutService.template.sections[firstSectionIndex].id
						) {
							this.instanceSubSectionChange(
								this.layoutService.template.sections[firstSectionIndex + 1],
							);
						} else if (
							firstSectionIndex != -1 &&
							this.layoutService.template.sections[firstSectionIndex]
						) {
							this.topLevelId = this.layoutService.template.sections[firstSectionIndex].id;
							this.topLevelIndex = firstSectionIndex;
							this.currentSubChildren.push(this.layoutService.template.sections[firstSectionIndex]);
						}
						this.originalInstance = JSON.stringify(this.layoutService.template);
						this.amendedAdded = false;
						this.instanceText();
						let finalizeVisitData = {
							id: this.visit_idd,
							visit_session_state_id: this.visit_status,
							is_amended: 0,
							warning: true,
							template_id: this.template_idd || this.layoutService.template.template_id,
							template_type: 'dynamic',
							provider_id: this.templateObjInfo.provider_id ? this.templateObjInfo.provider_id : '',
							technician_id: this.templateObjInfo.technician_id ? this.templateObjInfo.technician_id : '',
							speciality: this.templateObjInfo.technician_id ? true : false,
							cpt_codes: [],
							icd_codes: [],
						};
						this.requestService
						.sendRequest(
							TemaplateManagerUrlsEnum.updateVisitSession,
							'PUT',
							REQUEST_SERVERS.fd_api_url,
							{...finalizeVisitData,is_not:1},
							).subscribe(() => {},
								//using this to update the visit on start eval for the first time
							(err) => {
								this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
								this.stopLoader();
							},
						);
						this.stopLoader();
						// this.changeDetector.detectChanges();
					},
					(err) => {
						console.log(err);
						this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
						this.stopLoader();
					},
				);
		} else {
			this.templateObjInfo = this.layoutService.templateObj;
			this.speciality_idd = 1;
			this.visit_idd = 1;
			this.case_idd = 1;
			this.location_idd = 1;
			for (let section of this.layoutService.template.sections) {
				for (let uicomponent of section.dashboard) {
					uicomponent.obj.instanceStatement = uicomponent.obj.statement;
				}
			}
			this.topLevelSections = [];
			this.currentSub = [];
			this.currentSubChildren = [];
			let firstTop: number = null;
			await this.sectionEmptyCheck();
			for (let l: number = 0; l < this.layoutService.template.sections?.length; l++) {
				if (this.layoutService.template.sections[l].parentId === 0) {
					if (
						(this.layoutService.template.sections[l].linked_component == 0 ||
							this.layoutService.template.sections[l].selected_linked_component ===
								this.layoutService.template.sections[l].linked_component) &&
						!this.layoutService.template.sections[l].hideInInstance
					) {
						if (firstTop == null) firstTop = l;
						this.topLevelSections.push(this.layoutService.template.sections[l]);
					}
				}
				for (let x: number = 0; x < this.layoutService.template.sections[l].dashboard?.length; x++) {
					if (this.layoutService.template.sections[l].dashboard[x].obj.info) {
						this.infoInstance.lastI = l;
						this.infoInstance.lastK = x;
						this.infoInstance.check = true;
					}
					this.componentsService.push({
						id: this.layoutService.template.sections[l].dashboard[x].id,
						componentRef: this.layoutService.template.sections[l].dashboard[x].obj.type,
					});
				}
			}
			this.topLevelSections.push({
				boundSectionStatement: DOCTOR_EVALUATION_SECTION_TYPES.INSTANCE_PREVIEW
			});
			for (let q = firstTop + 1; q < this.layoutService.template.sections?.length; q++) {
				if (this.layoutService.template.sections[q].parentId === 0) {
					break;
				} else if (
					this.layoutService.template.sections[q].parentId ===
					this.layoutService.template.sections[firstTop ? firstTop : 0].id
				) {
					if (
						(this.layoutService.template.sections[q].linked_component == 0 ||
							this.layoutService.template.sections[q].selected_linked_component ===
								this.layoutService.template.sections[q].linked_component) &&
						!this.layoutService.template.sections[q].hideInInstance
					) {
						this.currentSub.push(this.layoutService.template.sections[q]);
					}
				}
			}
			let firstSectionIndex = -1;
			for (let x: number = 0; x < this.layoutService.template.sections?.length; x++) {
				if (
					this.layoutService.template.sections[x].parentId === 0 &&
					(this.layoutService.template.sections[x].linked_component == 0 ||
						this.layoutService.template.sections[x].selected_linked_component ===
							this.layoutService.template.sections[x].linked_component) &&
					!this.layoutService.template.sections[x].hideInInstance
				) {
					firstSectionIndex = x;
					break;
				}
			}
			if (
				firstSectionIndex != -1 &&
				this.layoutService.template.sections[firstSectionIndex + 1] &&
				this.layoutService.template.sections[firstSectionIndex + 1].parentId ===
					this.layoutService.template.sections[firstSectionIndex].id
			) {
				this.instanceSubSectionChange(this.layoutService.template.sections[firstSectionIndex + 1]);
			} else if (
				firstSectionIndex != -1 &&
				this.layoutService.template.sections[firstSectionIndex]
			) {
				this.topLevelId = this.layoutService.template.sections[firstSectionIndex].id;
				this.topLevelIndex = firstSectionIndex;
				this.currentSubChildren.push(this.layoutService.template.sections[firstSectionIndex]);
			}
			this.layoutService.isInstancePreview = true;
			this.showpreview = true;
			this.layoutService.editorView = true;
			this.instanceText();
		}
		this.layoutService.updateComponents();
	}
	updateInstance() {
		let data = {
			visit_id: this.visit_idd,
			template_id: this.template_idd || this.layoutService.template.template_id,
		};
		this.requestService
			.sendRequest(
				TemaplateManagerUrlsEnum.getTemplateByID,
				'POST',
				REQUEST_SERVERS.templateManagerUrl,
				data,
			)
			.subscribe(
				async (res: any) => {
					this.infoInstance.check = false;
					if (res['data']?.length === 0) {
						for (let item of this.allExternalSlugs) {
							item.selectedUI = [];
							item.addedFields = [];
						}
						this.layoutService.backupQueue = [];
						this.layoutService.backupIndex = -2;
						this.layoutService.backupId = 1;
						this.layoutService.template = {
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
							lineSpacingValue: 15,
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
							sections: [],
							uiCompIds: 0,
							carryOriginalDeleted: [],
							allExternalSlugs: [],
							carryNewDeleted: [],
							pageSize: {
								width: 205,
								height: 297,
							},
							pdfMarginTop: 0,
							pdfMarginBottom: 0,
							pdfMarginLeft: 5,
							pdfMarginRight: 5,
						};
						this.emptySelectedComponents();
						this.requestService
							.sendRequest(
								TemaplateManagerUrlsEnum.mappingKeywords,
								'GET',
								REQUEST_SERVERS.fd_api_url,
							)
							.subscribe(
								(res: any) => {
									this.layoutService.template['mappingKeyWords'] = res.result.data;
								},
								(err) => {
									console.log(err);
									this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
									this.stopLoader();
								},
							);
					} else {
						this.layoutService.template = res['data'];
					}
					this.addPredefinedData()
					this.instanceSectionChange(this.layoutService.template.sections[this.topLevelIndex]);
					if (this.subLevelIndex != -1) {
						this.instanceSubSectionChange(this.layoutService.template.sections[this.subLevelIndex]);
					}
					this.changeDetector.detectChanges();
				},
				(err) => {
					console.log(err);
					this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
					this.stopLoader();
				},
			);
	}
	statementUpdate() {
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.instanceStatement =
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.statement;
		this.layoutService.updateComponents();
		this.layoutService.refreshObject(
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj,
		);
	}
	refreshObject() {
		this.layoutService.refreshObject(
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj,
		);
	}
	private removeAllTemplateErrors(){
		this.layoutService.template.sections.forEach(section => {
			section.hasError = false
			section.dashboard.forEach(component => {
				component.obj.hasError = false
			})
		})
	}

	async BackToTemplate(check? : number) {
		this.previewLoaded = false;
		this.sectionEmptyUncheck();
		this.removeAllTemplateErrors()
		if (check) {
			this.highlightPreview = false;
			this.layoutService.editorView = false;
			this.layoutService.isInstancePreview = false;
			this.layoutService.isShowEditor = false;
			this.showpreview = false;
			this.PreviewClicked = false;
			this.toastrService.success('Preview saved successfully', 'Success', { timeOut: 6000 });
			this.arrowLeftRight('');
		} else {
			// this.coolDialogs
			// 	.confirm('Changes will not be saved. Continue?', {
			// 		okButtonText: 'OK',
			// 		cancelButtonText: 'Cancel',
			// 	})
			this.bsModalRef = this.modalServiceDialog.show(ConfirmationDialogComponent, {
				initialState: {
				  message: 'Changes will not be saved. Continue?'
				},
				class: 'modal-dialog-centered'
			  });
			  this.bsModalRef.content.result
				.subscribe((response) => {
					if (response) {
						this.highlightPreview = false;
						this.layoutService.editorView = false;
						this.layoutService.isInstancePreview = false;
						this.layoutService.isShowEditor = false;
						this.showpreview = false;
						this.PreviewClicked = false;
						this.arrowLeftRight('');
						this.changeDetector.markForCheck();
					}
				});
		}
	}
	topLevelId = 0;
	subLevelId = 0;
	topLevelIndex = -1;
	subLevelIndex = -1;
	public highlightPreview = false;
	public previousSignature = false;
	public async instanceSectionChange(section, chk?) {
		this.previewLoaded = false;
		if (document.getElementById('scrollPosition') && chk == 1) {
			let elmnt = document.getElementById('scrollPosition');
			elmnt.scrollTop = 0;
			this.layoutService.scroll = '';
		}
		if (section.boundSectionStatement == DOCTOR_EVALUATION_SECTION_TYPES.EVALUATION_PREVIEW) {
			this.removeAllTemplateErrors()
			this.checkRequiredFields(true, true)
			return;
		} else if (section.boundSectionStatement == DOCTOR_EVALUATION_SECTION_TYPES.INSTANCE_PREVIEW) {
			this.removeAllTemplateErrors()
			this.checkRequiredFields(true, true)
			if (this.layoutService.template.pdf_type == 2) {
				this.layoutService.isLoaderPending.next(true);
				this.staticC43Generate('doctorPdf');
				return;
			} else {
				this.highlightPreview = true;
				await this.filterData(false);
				await this.makeText(0);
				if (this.hfImages == 0) {
					await this.pdfPreview(1, '');
				}
				return;
			}
		}
		if (this.topLevelSections[this.topLevelSections?.length - 1].boundSectionStatement == DOCTOR_EVALUATION_SECTION_TYPES.EVALUATION_PREVIEW) {
			this.topLevelSections.pop();
		}
		this.highlightPreview = false;
		this.PreviewClicked = false;
		this.layoutService.isShowEditor = false;
		this.layoutService.editorView = true;
		this.currentSubChildren = [];
		this.currentSub = [];
		let check: number = 0;
		let index: number = 0;
		let firstSubCheck = false;
		let firstSection: number = 0;
		for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
			if (
				(this.layoutService.template.sections[i].linked_component == 0 ||
					this.layoutService.template.sections[i].selected_linked_component ===
						this.layoutService.template.sections[i].linked_component) &&
				!this.layoutService.template.sections[i].hideInInstance
			) {
				firstSection = i;
				break;
			}
		}
		for (let q: number = 0; q < this.layoutService.template.sections?.length; q++) {
			if (this.layoutService.template.sections[q].id === section.id) {
				if (q == firstSection) {
					this.firstSectionCheck = true;
				} else {
					this.firstSectionCheck = false;
				}
				this.topLevelId = this.layoutService.template.sections[q].id;
				this.topLevelIndex = q;
				this.subLevelId = 0;
				this.subLevelIndex = -1;
				if (
					(this.layoutService.template.sections[q].linked_component == 0 ||
						this.layoutService.template.sections[q].selected_linked_component ===
							this.layoutService.template.sections[q].linked_component) &&
					!this.layoutService.template.sections[q].hideInInstance
				) {
					this.currentSubChildren.push(this.layoutService.template.sections[q]);
				}
				firstSubCheck = true;
				check = section.id;
			} else if (check && this.layoutService.template.sections[q].parentId === check) {
				if (
					(this.layoutService.template.sections[q].linked_component == 0 ||
						this.layoutService.template.sections[q].selected_linked_component ===
							this.layoutService.template.sections[q].linked_component) &&
					!this.layoutService.template.sections[q].hideInInstance
				) {
					this.currentSub.push(this.layoutService.template.sections[q]);
					if (firstSubCheck) {
						firstSubCheck = false;
						await this.instanceSubSectionChange(this.layoutService.template.sections[q]);
					}
				}
			}
		}
		this.removeAllTemplateErrors()
		this.calculateSectionErrors(this.topLevelIndex)
		this.checkRequiredFields(true, false, this.topLevelIndex)
		await this.instanceText();
		}
	staticC43Generate(event: any) {
		let dataToSend = {};
		let templateResults = [this.layoutService.template];
		let template: any = {};
		let parentField: any = {};
		let document_id = 0;
		label1: for (let data of this.layoutService.template.allExternalSlugs) {
			for (let subData of data.document_attached_to) {
				if (subData.slug == 'c_4_3') {
					document_id = subData.id;
					break label1;
				}
			}
		}
		if (templateResults[0]) {
			template = templateResults[0];
			for (let i = 0; i < template.sections?.length; i++) {
				for (let j = 0; j < template.sections[i].dashboard?.length; j++) {
					loop1: for (let externalSlug of template.allExternalSlugs) {
						let selectedUIIndex = -1;
						for (let selectedUi of externalSlug.selectedUI) {
							selectedUIIndex++;
							if (selectedUi.id == template.sections[i].dashboard[j].obj.uicomponent_name) {
								if (
									(template.sections[i].dashboard[j].obj.selected_linked_ui_component !=
										template.sections[i].dashboard[j].obj.linked_ui &&
										!template.sections[i].dashboard[j].obj.is_single_select) ||
									(!template.sections[i].dashboard[j].obj.selected_linked_ui_component &&
										template.sections[i].dashboard[j].obj.linked_ui)
								) {
									if (externalSlug.field_type == 'child_field') {
										continue;
									}
								}
								if (
									template.sections[i].linked_component > 0 &&
									!(
										template.sections[i].selected_linked_component ===
										template.sections[i].linked_component
									)
								) {
									if (externalSlug.field_type == 'child_field') {
										continue;
									}
								}
								if (externalSlug.field_type == 'child_field') {
									for (let tempExternalSlug of template.allExternalSlugs) {
										if (tempExternalSlug.id == externalSlug.parent) {
											parentField = tempExternalSlug;
											break;
										}
									}
								}
								if (document_id) {
									if (
										externalSlug.document_attached_to &&
										externalSlug.document_attached_to?.length
									) {
										for (let tempDoc of externalSlug.document_attached_to) {
											if (document_id == tempDoc.id) {
												let tempValueData: any = '';
												if (
													externalSlug.slug == 'icd_10_codes' ||
													externalSlug.slug == 'cpt_codes' ||
													externalSlug.slug == 'hcpcs_codes'
												) {
													tempValueData = [];
													if (
														(template.sections[i].dashboard[j].obj.preDefinedObj &&
															template.sections[i].dashboard[j].obj.preDefinedObj.slug ==
																'icd_10_codes') ||
														(template.sections[i].dashboard[j].obj.preDefinedObj &&
															template.sections[i].dashboard[j].obj.preDefinedObj.slug ==
																'cpt_codes') ||
														(template.sections[i].dashboard[j].obj.preDefinedObj &&
															template.sections[i].dashboard[j].obj.preDefinedObj.slug ==
																'hcpcs_codes')
													) {
														if (externalSlug.field_type != 'parent_field') {
															for (let answer of template.sections[i].dashboard[j].obj.answers) {
																tempValueData.push(answer.id);
															}
														} else {
															tempValueData = {};
														}
													}
												} else {
													if (template.sections[i].dashboard[j].obj.type == this.uicomponentTypes.TEXT) {
														let tempAnswer = this.layoutService.stripHtml(
															template.sections[i].dashboard[j].obj.instanceStatement,
														);
														if (
															externalSlug.field_type == 'boolean' ||
															externalSlug.field_type == 'text_field' ||
															externalSlug.field_type == 'email' ||
															externalSlug.field_type == 'date' ||
															externalSlug.field_type == 'datetime' ||
															externalSlug.field_type == 'number' ||
															externalSlug.field_type == 'child_field'
														) {
															tempValueData = tempAnswer.replace(/&nbsp;/g, ' ');
														} else {
															if (externalSlug.field_type != 'parent_field') {
																tempValueData = [];
																tempValueData.push(tempAnswer.replace(/&nbsp;/g, ' '));
															} else {
																tempValueData = {};
															}
														}
													} else {
														if (
															externalSlug.field_type == 'boolean' ||
															externalSlug.field_type == 'text_field' ||
															externalSlug.field_type == 'email' ||
															externalSlug.field_type == 'date' ||
															externalSlug.field_type == 'datetime' ||
															externalSlug.field_type == 'number' ||
															externalSlug.field_type == 'child_field'
														) {
															tempValueData = '';
															for (let answer of template.sections[i].dashboard[j].obj.answers) {
																tempValueData =
																	tempValueData.concat(
																		this.layoutService.stripHtml(answer.answer),
																	) + ' ';
																tempValueData = tempValueData.replace(/&nbsp;/g, ' ');
															}
															if (tempValueData?.length) {
																tempValueData = tempValueData.slice(0, -1);
															}
														} else {
															if (
																externalSlug.field_type == this.uicomponentTypes.IMAGE_LABEL &&
																template.sections[i].dashboard[j].obj.type == this.uicomponentTypes.SIGNATURE
															) {
																tempValueData =
																	template.sections[i].dashboard[j].obj.signature_path;
															} else {
																if (externalSlug.field_type != 'parent_field') {
																	tempValueData = [];
																	for (let answer of template.sections[i].dashboard[j].obj
																		.answers) {
																		tempValueData.push(
																			this.layoutService.stripHtml(
																				answer.answer.replace(/&nbsp;/g, ' '),
																			),
																		);
																	}
																} else {
																	tempValueData = {};
																}
															}
														}
													}
												}
												if (externalSlug.field_category) {
													if (externalSlug.field_type == 'child_field') {
														if (tempValueData?.length) {
															if (`${tempDoc.slug}` in dataToSend) {
																if (`${parentField.slug}` in dataToSend[`${tempDoc.slug}`]) {
																	if (
																		`${parentField.addedFields[selectedUIIndex]}` in
																		dataToSend[`${tempDoc.slug}`][`${parentField.slug}`]
																	) {
																		dataToSend[`${tempDoc.slug}`][`${parentField.slug}`][
																			`${parentField.addedFields[selectedUIIndex]}`
																		][`${externalSlug.slug}`] = tempValueData;
																	} else {
																		dataToSend[`${tempDoc.slug}`][`${parentField.slug}`][
																			`${parentField.addedFields[selectedUIIndex]}`
																		] = {};
																		dataToSend[`${tempDoc.slug}`][`${parentField.slug}`][
																			`${parentField.addedFields[selectedUIIndex]}`
																		][`${externalSlug.slug}`] = tempValueData;
																	}
																} else {
																	dataToSend[`${tempDoc.slug}`][`${parentField.slug}`] = {};
																	dataToSend[`${tempDoc.slug}`][`${parentField.slug}`][
																		`${parentField.addedFields[selectedUIIndex]}`
																	] = {};
																	dataToSend[`${tempDoc.slug}`][`${parentField.slug}`][
																		`${parentField.addedFields[selectedUIIndex]}`
																	][`${externalSlug.slug}`] = tempValueData;
																}
															} else {
																dataToSend[`${tempDoc.slug}`] = {};
																dataToSend[`${tempDoc.slug}`][`${parentField.slug}`] = {};
																dataToSend[`${tempDoc.slug}`][`${parentField.slug}`][
																	`${parentField.addedFields[selectedUIIndex]}`
																] = {};
																dataToSend[`${tempDoc.slug}`][`${parentField.slug}`][
																	`${parentField.addedFields[selectedUIIndex]}`
																][`${externalSlug.slug}`] = tempValueData;
															}
														}
													} else {
														if (`${tempDoc.slug}` in dataToSend) {
															if (
																`${externalSlug.field_category}` in dataToSend[`${tempDoc.slug}`]
															) {
																dataToSend[`${tempDoc.slug}`][`${externalSlug.field_category}`][
																	`${externalSlug.slug}`
																] = tempValueData;
															} else {
																dataToSend[`${tempDoc.slug}`][`${externalSlug.field_category}`] =
																	{};
																dataToSend[`${tempDoc.slug}`][`${externalSlug.field_category}`][
																	`${externalSlug.slug}`
																] = tempValueData;
															}
														} else {
															dataToSend[`${tempDoc.slug}`] = {};
															dataToSend[`${tempDoc.slug}`][`${externalSlug.field_category}`] = {};
															dataToSend[`${tempDoc.slug}`][`${externalSlug.field_category}`][
																`${externalSlug.slug}`
															] = tempValueData;
														}
													}
												} else {
													if (externalSlug.field_type == 'child_field') {
														if (tempValueData?.length) {
															if (`${tempDoc.slug}` in dataToSend) {
																if (`${parentField.slug}` in dataToSend[`${tempDoc.slug}`]) {
																	if (
																		`${parentField.addedFields[selectedUIIndex]}` in
																		dataToSend[`${tempDoc.slug}`][`${parentField.slug}`]
																	) {
																		dataToSend[`${tempDoc.slug}`][`${parentField.slug}`][
																			`${parentField.addedFields[selectedUIIndex]}`
																		][`${externalSlug.slug}`] = tempValueData;
																	} else {
																		dataToSend[`${tempDoc.slug}`][`${parentField.slug}`][
																			`${parentField.addedFields[selectedUIIndex]}`
																		] = {};
																		dataToSend[`${tempDoc.slug}`][`${parentField.slug}`][
																			`${parentField.addedFields[selectedUIIndex]}`
																		][`${externalSlug.slug}`] = tempValueData;
																	}
																} else {
																	dataToSend[`${tempDoc.slug}`][`${parentField.slug}`] = {};
																	dataToSend[`${tempDoc.slug}`][`${parentField.slug}`][
																		`${parentField.addedFields[selectedUIIndex]}`
																	] = {};
																	dataToSend[`${tempDoc.slug}`][`${parentField.slug}`][
																		`${parentField.addedFields[selectedUIIndex]}`
																	][`${externalSlug.slug}`] = tempValueData;
																}
															} else {
																dataToSend[`${tempDoc.slug}`] = {};
																dataToSend[`${tempDoc.slug}`][`${parentField.slug}`] = {};
																dataToSend[`${tempDoc.slug}`][`${parentField.slug}`][
																	`${parentField.addedFields[selectedUIIndex]}`
																] = {};
																dataToSend[`${tempDoc.slug}`][`${parentField.slug}`][
																	`${parentField.addedFields[selectedUIIndex]}`
																][`${externalSlug.slug}`] = tempValueData;
															}
														}
													} else {
														if (`${tempDoc.slug}` in dataToSend) {
															dataToSend[`${tempDoc.slug}`][`${externalSlug.slug}`] = tempValueData;
														} else {
															dataToSend[`${tempDoc.slug}`] = {};
															dataToSend[`${tempDoc.slug}`][`${externalSlug.slug}`] = tempValueData;
														}
													}
												}
												break;
											}
										}
									}
								}
								break;
							}
						}
					}
				}
			}
		}
		let apiData = {
			template_manager_data: dataToSend,
			pdf_type: 'static',
		};
		if (this.layoutService.template.allExternalSlugs?.length) {
			this.requestService
				.sendRequest(
					TemaplateManagerUrlsEnum.generateC4_3Static,
					'POST',
					REQUEST_SERVERS.fd_api_url,
					apiData,
				)
				.subscribe(
					async (res: any) => {
						let link = res.result.data.link;
						let fileURL = link + '&token=' + this.storageData.getToken();
						if (event == 'doctorPdf') {
							this.pdfC43Source = await this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
							this.highlightPreview = true;
							this.topLevelId = -1;
						} else if (event == 'livePdf') {
							window.open(fileURL, 'C4.3', 'height=1000,width=1000');
						}
						if (!this.livePdfCheck) {
							this.layoutService.isShowEditor = true;
						}
						this.livePdfCheck = false;
						this.stopLoader();
						this.changeDetector.detectChanges();
					},
					(err) => {
						console.log(err);
						this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
						this.stopLoader();
					},
				);
		} else {
			this.toastrService.error('Template is not C4.3', 'Error', { timeOut: 6000 });
			this.stopLoader();
		}
	}
	currentSubChildren = [];
	public instanceSubSectionChange(section, chk?, res?) {
		if (document.getElementById('scrollPosition') && chk == 1) {
			let elmnt = document.getElementById('scrollPosition');
			elmnt.scrollTop = 0;
			this.layoutService.scroll = '';
		}
		let tempSection = -1;
		let tempCheck = false;
		let siblingCheck = false;
		this.currentSubChildren = [];
		let check: number = 0;
		for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
			if (this.layoutService.template.sections[i].id === section.parentId) {
				if (
					(this.layoutService.template.sections[i].linked_component == 0 ||
						this.layoutService.template.sections[i].selected_linked_component ===
							this.layoutService.template.sections[i].linked_component) &&
					!this.layoutService.template.sections[i].hideInInstance
				) {
					this.topLevelId = this.layoutService.template.sections[i].id;
					this.topLevelIndex = i;
					this.currentSubChildren.push(this.layoutService.template.sections[i]);
					if (chk == 2 && res.id == this.layoutService.template.sections[i].id) {
						tempSection = this.currentSubChildren?.length - 1;
					}
				}
			} else if (this.layoutService.template.sections[i].id === section.id) {
				if (
					(this.layoutService.template.sections[i].linked_component == 0 ||
						this.layoutService.template.sections[i].selected_linked_component ===
							this.layoutService.template.sections[i].linked_component) &&
					!this.layoutService.template.sections[i].hideInInstance
				) {
					this.subLevelId = this.layoutService.template.sections[i].id;
					this.subLevelIndex = i;
					this.currentSubChildren.push(this.layoutService.template.sections[i]);
					if (chk == 2 && res.id == this.layoutService.template.sections[i].id) {
						tempSection = this.currentSubChildren?.length - 1;
					}
					siblingCheck = true;
				}
				check = section.id;
			} else if (
				check &&
				this.layoutService.template.sections[i].parentId != 0 &&
				(this.layoutService.template.sections[i].parentId != section.parentId || !siblingCheck)
			) {
				if (
					(this.layoutService.template.sections[i].linked_component == 0 ||
						this.layoutService.template.sections[i].selected_linked_component ===
							this.layoutService.template.sections[i].linked_component) &&
					!this.layoutService.template.sections[i].hideInInstance
				) {
					siblingCheck = true;
					this.currentSubChildren.push(this.layoutService.template.sections[i]);
					if (chk == 2 && res.id == this.layoutService.template.sections[i].id) {
						tempSection = this.currentSubChildren?.length - 1;
					}
					tempCheck = true;
				}
			} else if (check) {
				break;
			}
		}
		if (chk == 2) {
			this.instanceText(chk, tempSection);
		} else {
			this.instanceText();
		}
		this.removeAllTemplateErrors()
		this.calculateSectionErrors(this.subLevelIndex)

	}
	placementPop(e) {}
	IntensityChange() {
		const newOptions = Object.assign(
			{},
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options,
		);
		newOptions.ceil =
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options.ceil;
		newOptions.floor =
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options.floor;
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.options = newOptions;
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.value = newOptions.floor;
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.defaultValue = newOptions.floor;
		this.refreshObject();
	}
	IncrementChange() {
		const newOptions = Object.assign(
			{},
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options,
		);
		newOptions.ceil =
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options.ceil;
		newOptions.floor =
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options.floor;
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.options = newOptions;
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.value = newOptions.floor;
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.defaultValue = newOptions.floor;
		this.refreshObject();
	}
	onClick(event: any) {
		if (event.target.className != 'clearfix') {
			this.selectedSectionIndex = null;
		}
	}
	slideConfig = {
		slidesToShow: 1,
		slidesToScroll: 2,
		variableWidth: true,
		nextArrow: "<div class='nav-btn next-slide'><i class='icon2-chevron-right'></i></div>",
		prevArrow: "<div class='nav-btn prev-slide'><i class='icon2-chevron-left'></i></div>",
		dots: false,
		infinite: false,
	};
	title = 'ngSlick';
	slickInit(e) {}
	breakpoint(e) {}
	afterChange(e) {}
	beforeChange(e) {}
	SelectManualOptions() {
		let optionIndex = -1;
		for (let option of this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj?.options) {
			optionIndex++;
			if (option.link && option.selectedLinkSection.id) {
				let sectionIndex: number = 0;
				for (let section of this.layoutService.template.sections) {
					if (section.id == option.selectedLinkSection.id) {
						this.updateBackUpTask('type', `linked_component`);
						this.updateBackUpTask('id', this.layoutService.backupId);
						this.updateIndexes(sectionIndex, -1, -1, 'section');
						this.updateBackUpTask(
							'oldObject',
							this.layoutService.template.sections[sectionIndex][`linked_component`],
						);
						section.linked_component--;
						this.updateBackUpTask(
							'newObject',
							this.layoutService.template.sections[sectionIndex][`linked_component`],
						);
						if (option.selected) {
							this.updateBackUpTask('type', `selected_linked_component`);
							this.updateBackUpTask('id', this.layoutService.backupId);
							this.updateIndexes(sectionIndex, -1, -1, 'section');
							this.updateBackUpTask(
								'oldObject',
								this.layoutService.template.sections[sectionIndex][`selected_linked_component`],
							);
							section.selected_linked_component--;
							this.updateBackUpTask(
								'newObject',
								this.layoutService.template.sections[sectionIndex][`selected_linked_component`],
							);
						}
						let currentDepth = section.secNo.split('.')?.length - 1;
						for (let z = sectionIndex + 1; z < this.layoutService.template.sections?.length; z++) {
							let tempDepth = this.layoutService.template.sections[z].secNo.split('.')?.length - 1;
							if (tempDepth > currentDepth) {
								this.updateBackUpTask('type', `linked_component`);
								this.updateBackUpTask('id', this.layoutService.backupId);
								this.updateIndexes(z, -1, -1, 'section');
								this.updateBackUpTask(
									'oldObject',
									this.layoutService.template.sections[z][`linked_component`],
								);
								this.layoutService.template.sections[z].linked_component--;
								this.updateBackUpTask(
									'newObject',
									this.layoutService.template.sections[z][`linked_component`],
								);
								if (option.selected) {
									this.updateBackUpTask('type', `selected_linked_component`);
									this.updateBackUpTask('id', this.layoutService.backupId);
									this.updateIndexes(z, -1, -1, 'section');
									this.updateBackUpTask(
										'oldObject',
										this.layoutService.template.sections[z][`selected_linked_component`],
									);
									this.layoutService.template.sections[z].selected_linked_component--;
									this.updateBackUpTask(
										'newObject',
										this.layoutService.template.sections[z][`selected_linked_component`],
									);
								}
							} else {
								break;
							}
						}
					}
					sectionIndex++;
				}
				this.updateBackUpTask('type', `link`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(
					this.layoutService.lastI,
					this.layoutService.lastK,
					optionIndex,
					'option',
				);
				this.updateBackUpTask('oldObject', option[`link`]);
				option.link = false;
				this.updateBackUpTask('newObject', option[`link`]);
				this.updateBackUpTask('type', `selectedLinkSection`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(
					this.layoutService.lastI,
					this.layoutService.lastK,
					optionIndex,
					'option',
				);
				this.updateBackUpTask('oldObject', option[`selectedLinkSection`]);
				option.selectedLinkSection = {};
				this.updateBackUpTask('newObject', option[`selectedLinkSection`]);
			}
		}
		optionIndex = -1;
		for (let option of this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj?.options) {
			optionIndex++;
			if (option.linkedUICheck && option.selectedLinkUi.id) {
				let i: number = 0;
				for (let section of this.layoutService.template.sections) {
					for (let uicomp of section.dashboard) {
						if (uicomp.obj.uicomponent_name == option.selectedLinkUi.id) {
							this.updateBackUpTask('type', `linked_ui`);
							this.updateBackUpTask('id', this.layoutService.backupId);
							this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
							this.updateBackUpTask('oldObject', uicomp.obj.linked_ui);
							uicomp.obj.linked_ui--;
							this.updateBackUpTask('newObject', uicomp.obj.linked_ui);
							if (option.selected) {
								this.updateBackUpTask('type', `selected_linked_ui_component`);
								this.updateBackUpTask('id', this.layoutService.backupId);
								this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
								this.updateBackUpTask('oldObject', uicomp.obj.selected_linked_ui_component);
								uicomp.obj.selected_linked_ui_component--;
								this.changeDetector.detectChanges();
								this.updateBackUpTask('newObject', uicomp.obj.selected_linked_ui_component);
							}
						}
					}
					i++;
				}
				this.updateBackUpTask('type', `linkedUICheck`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(
					this.layoutService.lastI,
					this.layoutService.lastK,
					optionIndex,
					'option',
				);
				this.updateBackUpTask('oldObject', option.linkedUICheck);
				option.linkedUICheck = false;
				this.updateBackUpTask('newObject', option.linkedUICheck);
				this.updateBackUpTask('type', `selectedLinkUi`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(
					this.layoutService.lastI,
					this.layoutService.lastK,
					optionIndex,
					'option',
				);
				this.updateBackUpTask('oldObject', option.selectedLinkUi);
				option.selectedLinkUi = {};
				this.updateBackUpTask('newObject', option.selectedLinkUi);
			}
		}
		this.updateBackUpTask('type', `options`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`options`],
		);
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.options = [];
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`options`],
		);
		this.updateBackUpTask('type', `answers`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`answers`],
		);
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.answers = [];
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`answers`],
		);
		this.updateBackUpTask('type', `manualoptions`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`manualoptions`],
		);
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.manualoptions =
			!this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.manualoptions;
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`manualoptions`],
		);
		const len =
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options?.length + 1;
		this.updateBackUpTask('type', `options`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`options`],
		);
		let editorLabel = 'Option ' + len;
		editorLabel = this.layoutService.applyEditor(
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj,
			editorLabel,
		);
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.options.push({
			label: editorLabel,
			input: false,
			link: false,
			instanceLabel: editorLabel,
			textLabel: 'Option ' + len,
			hide: false,
			id: len + 1,
			selected: false,
			inputValue: '',
			instanceInputValue: '',
			height: 30,
			decimalPlacesLimit: '',
			decimalRoundOff: false,
			commentsPlaceholder: 'Type Here',
			is_required: false,
			minLimit: '',
			fontSize: '3',
			maxLimit: '',
			minMaxCheck: false,
			validationValue: {},
			validationCheck: false,
			selectedLinkSection: {},
			linkedStatement: '',
			selectedLinkUi: {},
			linkedUICheck: false,
			linkedStatementCheck: false,
		});
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`options`],
		);
		this.updateBackUpTask('type', `multilinked`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`multilinked`],
		);
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.multilinked = false;
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`multilinked`],
		);
		this.updateBackUpTask('type', `MultiSelectObj`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`MultiSelectObj`],
		);
		delete this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj['MultiSelectObj'];
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`MultiSelectObj`],
		);
		this.updateBackUpTask('type', `optionsPreDefind`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`optionsPreDefind`],
		);
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.optionsPreDefind = false;
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`optionsPreDefind`],
		);
		this.updateBackUpTask('type', `preDefinedObj`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`preDefinedObj`],
		);
		delete this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj['preDefinedObj'];
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`preDefinedObj`],
		);
		if (
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.selectedItems
		) {
			this.setUIProperty(
				this.layoutService.lastI,
				this.layoutService.lastK,
				'selectedItems',
				[],
				false,
			);
		}
		this.refreshObject();
		this.layoutService.backupId++;
		this.changeDetector.detectChanges();
	}
	updateStatementDropdown() {
		this.refreshObject();
		this.changeDetector.detectChanges();
	}
	UpdateNames() {
		for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
			for (let j: number = 0; j < this.layoutService.template.sections[i].dashboard?.length; j++) {
				if (
					this.layoutService.template.sections[i].dashboard[j].obj.multilinked &&
					this.layoutService.template.sections[i].dashboard[j].obj.MultiSelectObj.objectid ==
						this.layoutService.template.sections[this.layoutService.lastI].dashboard[
							this.layoutService.lastK
						].id
				) {
					this.layoutService.template.sections[i].dashboard[j].obj.MultiSelectObj.secondname =
						this.layoutService.template.sections[this.layoutService.lastI].dashboard[
							this.layoutService.lastK
						].obj.second_name;
				} else if (
					this.layoutService.template.sections[i].dashboard[j].obj.multilinked &&
					this.layoutService.template.sections[i].dashboard[j].obj.MultiSelectObj.objectid !=
						this.layoutService.template.sections[this.layoutService.lastI].dashboard[
							this.layoutService.lastK
						].id
				) {
					for (let ab: number = 0; ab < this.searchDataNames?.length; ab++) {
						if (
							this.searchDataNames[ab].objectid ==
							this.layoutService.template.sections[this.layoutService.lastI].dashboard[
								this.layoutService.lastK
							].id
						) {
							this.searchDataNames[ab].secondname =
								this.layoutService.template.sections[this.layoutService.lastI].dashboard[
									this.layoutService.lastK
								].obj.second_name;
						}
					}
				}
			}
		}
	}
	RefreshMulitlinkArray() {
		if (
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.multilinked
		) {
			this.SearchNames = [];
			for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
				for (let j: number = 0; j < this.layoutService.template.sections[i].dashboard?.length; j++) {
					if (
						(this.layoutService.template.sections[i].dashboard[j].obj.type == this.uicomponentTypes.CHECKBOX ||
							this.layoutService.template.sections[i].dashboard[j].obj.type == this.uicomponentTypes.INTELLISENSE ||
							(this.layoutService.template.sections[i].dashboard[j].obj.type == this.uicomponentTypes.DROPDOWN &&
								this.layoutService.template.sections[i].dashboard[j].obj.isMultiSelect == true)) &&
						!this.layoutService.template.sections[i].dashboard[j].obj.MultiSelectObj &&
						this.layoutService.template.sections[this.layoutService.lastI].dashboard[
							this.layoutService.lastK
						].id != this.layoutService.template.sections[i].dashboard[j].id
					)
						this.SearchNames.push({
							objectid: this.layoutService.template.sections[i].dashboard[j].id,
							firstname: this.layoutService.template.sections[i].dashboard[j].obj.uicomponent_name,
							secondname: this.layoutService.template.sections[i].dashboard[j].obj.second_name,
						});
				}
			}
			this.searchDataNames = this.SearchNames;
		}
	}
	MultiSelectCheckbox() {
		let optionIndex = -1;
		for (let option of this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj?.options) {
			optionIndex++;
			if (option.link && option.selectedLinkSection.id) {
				let sectionIndex: number = 0;
				for (let section of this.layoutService.template.sections) {
					if (section.id == option.selectedLinkSection.id) {
						this.updateBackUpTask('type', `linked_component`);
						this.updateBackUpTask('id', this.layoutService.backupId);
						this.updateIndexes(sectionIndex, -1, -1, 'section');
						this.updateBackUpTask(
							'oldObject',
							this.layoutService.template.sections[sectionIndex][`linked_component`],
						);
						section.linked_component--;
						this.updateBackUpTask(
							'newObject',
							this.layoutService.template.sections[sectionIndex][`linked_component`],
						);
						if (option.selected) {
							this.updateBackUpTask('type', `selected_linked_component`);
							this.updateBackUpTask('id', this.layoutService.backupId);
							this.updateIndexes(sectionIndex, -1, -1, 'section');
							this.updateBackUpTask('oldObject', section.selected_linked_component);
							section.selected_linked_component--;
							this.updateBackUpTask('newObject', section.selected_linked_component);
						}
						let currentDepth = section.secNo.split('.')?.length - 1;
						for (let z = sectionIndex + 1; z < this.layoutService.template.sections?.length; z++) {
							let tempDepth = this.layoutService.template.sections[z].secNo.split('.')?.length - 1;
							if (tempDepth > currentDepth) {
								this.updateBackUpTask('type', `linked_component`);
								this.updateBackUpTask('id', this.layoutService.backupId);
								this.updateIndexes(z, -1, -1, 'section');
								this.updateBackUpTask(
									'oldObject',
									this.layoutService.template.sections[z][`linked_component`],
								);
								this.layoutService.template.sections[z].linked_component--;
								this.updateBackUpTask(
									'newObject',
									this.layoutService.template.sections[z][`linked_component`],
								);
								if (option.selected) {
									this.updateBackUpTask('type', `selected_linked_component`);
									this.updateBackUpTask('id', this.layoutService.backupId);
									this.updateIndexes(z, -1, -1, 'section');
									this.updateBackUpTask(
										'oldObject',
										this.layoutService.template.sections[z][`selected_linked_component`],
									);
									this.layoutService.template.sections[z].selected_linked_component--;
									this.updateBackUpTask(
										'newObject',
										this.layoutService.template.sections[z][`selected_linked_component`],
									);
								}
							} else {
								break;
							}
						}
					}
					sectionIndex++;
				}
				this.updateBackUpTask('type', `link`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(
					this.layoutService.lastI,
					this.layoutService.lastK,
					optionIndex,
					'option',
				);
				this.updateBackUpTask('oldObject', option[`link`]);
				option.link = false;
				this.updateBackUpTask('newObject', option[`link`]);
				this.updateBackUpTask('type', `selectedLinkSection`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(
					this.layoutService.lastI,
					this.layoutService.lastK,
					optionIndex,
					'option',
				);
				this.updateBackUpTask('oldObject', option[`selectedLinkSection`]);
				option.selectedLinkSection = {};
				this.updateBackUpTask('newObject', option[`selectedLinkSection`]);
			}
		}
		optionIndex = -1;
		for (let option of this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj?.options) {
			optionIndex++;
			if (option.linkedUICheck && option.selectedLinkUi.id) {
				let sectionIndex: number = 0;
				for (let section of this.layoutService.template.sections) {
					for (let uicomp of section.dashboard) {
						if (uicomp.obj.uicomponent_name == option.selectedLinkUi.id) {
							uicomp.obj.linked_ui--;
							if (option.selected) {
								this.setUIProperty(
									sectionIndex,
									optionIndex,
									uicomp.obj.selected_linked_ui_component - 1,
									'selected_linked_ui_component',
									false,
								);
							}
						}
					}
				}
				this.updateBackUpTask('type', `link`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(
					this.layoutService.lastI,
					this.layoutService.lastK,
					optionIndex,
					'option',
				);
				this.updateBackUpTask('oldObject', option[`link`]);
				option.link = false;
				this.updateBackUpTask('newObject', option[`link`]);
				this.updateBackUpTask('type', `selectedLinkSection`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(
					this.layoutService.lastI,
					this.layoutService.lastK,
					optionIndex,
					'option',
				);
				this.updateBackUpTask('oldObject', option[`selectedLinkSection`]);
				option.selectedLinkSection = {};
				this.updateBackUpTask('newObject', option[`selectedLinkSection`]);
			}
		}
		this.setUIProperty(
			this.layoutService.lastI,
			this.layoutService.lastK,
			'manualoptions',
			false,
			false,
		);
		this.setUIProperty(
			this.layoutService.lastI,
			this.layoutService.lastK,
			'optionsPreDefind',
			false,
			false,
		);
		this.invertUIProperty(this.layoutService.lastI, this.layoutService.lastK, 'multilinked', false);
		if (
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.multilinked
		) {
			this.SearchNames = [];
			this.setUIProperty(this.layoutService.lastI, this.layoutService.lastK, 'options', [], false);
			this.setUIProperty(this.layoutService.lastI, this.layoutService.lastK, 'answers', [], false);
			for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
				for (let j: number = 0; j < this.layoutService.template.sections[i].dashboard?.length; j++) {
					if (
						(this.layoutService.template.sections[i].dashboard[j].obj.type == this.uicomponentTypes.CHECKBOX ||
							this.layoutService.template.sections[i].dashboard[j].obj.type == this.uicomponentTypes.INTELLISENSE ||
							(this.layoutService.template.sections[i].dashboard[j].obj.type == this.uicomponentTypes.DROPDOWN &&
								this.layoutService.template.sections[i].dashboard[j].obj.isMultiSelect == true)) &&
						!this.layoutService.template.sections[i].dashboard[j].obj.MultiSelectObj &&
						this.layoutService.template.sections[this.layoutService.lastI].dashboard[
							this.layoutService.lastK
						].id != this.layoutService.template.sections[i].dashboard[j].id
					)
						this.SearchNames.push({
							objectid: this.layoutService.template.sections[i].dashboard[j].id,
							firstname: this.layoutService.template.sections[i].dashboard[j].obj.uicomponent_name,
							secondname: this.layoutService.template.sections[i].dashboard[j].obj.second_name,
						});
				}
			}
			this.setUIProperty(
				this.layoutService.lastI,
				this.layoutService.lastK,
				'MultiSelectObj',
				this.SearchNames[0],
				false,
			);
			this.searchDataNames = this.SearchNames;
		} else if (
			!this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.multilinked
		) {
			this.setUIProperty(
				this.layoutService.lastI,
				this.layoutService.lastK,
				'MultiSelectObj',
				null,
				false,
			);
		}
		if (
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.selectedItems
		) {
			this.setUIProperty(
				this.layoutService.lastI,
				this.layoutService.lastK,
				'selectedItems',
				[],
				false,
			);
		}
		this.layoutService.backupId++;
	}
	changeValidation() {
		this.updateBackUpTask('type', `validationCheck`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`validationCheck`],
		);
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.validationCheck =
			!this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.validationCheck;
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`validationCheck`],
		);
		if (
			!this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.validationCheck
		) {
			this.updateBackUpTask('type', `validationValue`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj[`validationValue`],
			);
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.validationValue = {};
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj[`validationValue`],
			);
		}
		this.setUIProperty(this.layoutService.lastI, this.layoutService.lastK, 'maxLimit', '', false);
		this.setUIProperty(this.layoutService.lastI, this.layoutService.lastK, 'minLimit', '', false);
		if (
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.errors
		) {
			this.removeErrorsObj(this.layoutService.lastI, this.layoutService.lastK);
		}
		this.layoutService.backupId++;
		this.calculateCalculationFields();
	}
	changeValidationOption(index) {
		this.invertUIPropertyOptions(
			this.layoutService.lastI,
			this.layoutService.lastK,
			'validationCheck',
			index,
			false,
		);
		if (
			!this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options[index].validationCheck
		) {
			this.setUIPropertyOptions(
				this.layoutService.lastI,
				this.layoutService.lastK,
				'validationValue',
				{},
				index,
				false,
			);
		}
		this.setUIPropertyOptions(
			this.layoutService.lastI,
			this.layoutService.lastK,
			'maxLimit',
			'',
			index,
			false,
		);
		this.setUIPropertyOptions(
			this.layoutService.lastI,
			this.layoutService.lastK,
			'minLimit',
			'',
			index,
			false,
		);
		if (
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options[index].errors
		) {
			this.removeErrorsOption(this.layoutService.lastI, this.layoutService.lastK, index);
		}
		this.layoutService.backupId++;
	}
	validationChecks = [];
	searchValidationChecks(event: any) {
		this.validationChecks = [
			{
				type: 'number',
				value: 'Number',
			},
			{
				type: 'email',
				value: 'Email',
			},
			{
				type: 'boolean',
				value: 'Boolean',
			},
			{
				type: 'date',
				value: 'Date',
			},
			{
				type: 'datetime-local',
				value: 'Datetime',
			},
			{
				type: 'time',
				value: 'Time',
			},
		];
	}
	changeDefaultValue(event :any) {
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.defaultValue = this.sanitizeHTML(event);
		if (
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.type == this.uicomponentTypes.INPUT
		) {
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.input = event;
		} else {
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.value =
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.defaultValue;
		}
	}
	deleteValidationValue() {
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.validationValue = {};
	}
	deleteValidationValueOption(index) {
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.options[index].validationValue = {};
	}
	setValidationValue(index) {
		this.updateBackUpTask('type', `validationValue`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`validationValue`],
		);
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.validationValue = this.validationChecks[index];
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`validationValue`],
		);
		this.updateBackUpTask('type', `formatValue`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`formatValue`],
		);
		if (
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.validationValue.value == 'Date'
		) {
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.formatValue = {
				slug: 'MM/DD/YYYY',
				value: 'MM/DD/YYYY',
			};
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.minMaxCheck = false;
		}
		if (
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.validationValue.value == 'Datetime'
		) {
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.formatValue = {
				slug: 'MM/DD/YYYYTHH:mm',
				value: 'MM/DD/YYYY 24 hour',
			};
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.minMaxCheck = false;
		}
		if (
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.validationValue.value == 'Time'
		) {
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.formatValue = {
				slug: 'HH:mm',
				value: '24 hour',
			};
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.minMaxCheck = false;
		}
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`formatValue`],
		);
		this.setUIProperty(this.layoutService.lastI, this.layoutService.lastK, 'minLimit', '', false);
		this.setUIProperty(this.layoutService.lastI, this.layoutService.lastK, 'maxLimit', '', false);
		if (
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.errors
		) {
			this.removeErrorsObj(this.layoutService.lastI, this.layoutService.lastK);
		}
		this.layoutService.backupId++;
		this.calculateCalculationFields();
		this.changeDetector.detectChanges();
	}
	removeErrorsObj(sectionIndex, dashboardIndex) {
		this.updateBackUpTask('type', `templateErrors`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(-1, -1, -1, 'template');
		this.updateBackUpTask('oldObject', this.layoutService.templateErrors);
		this.layoutService.templateErrors =
			this.layoutService.templateErrors -
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj.errors;
		this.updateBackUpTask('newObject', this.layoutService.templateErrors);
		this.setSectionProperty(
			sectionIndex,
			'errors',
			this.layoutService.template.sections[sectionIndex].errors -
				this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj.errors,
			false,
		);
		this.setUIProperty(sectionIndex, dashboardIndex, 'errors', 0, false);
		this.setUIProperty(sectionIndex, dashboardIndex, 'isMaxVal', false, false);
	}
	removeErrorsOption(sectionIndex, dashboardIndex, optionIndex) {
		this.updateBackUpTask('type', `templateErrors`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(-1, -1, -1, 'template');
		this.updateBackUpTask('oldObject', this.layoutService.templateErrors);
		this.layoutService.templateErrors =
			this.layoutService.templateErrors -
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj.options[
				optionIndex
			].errors;
		this.updateBackUpTask('newObject', this.layoutService.templateErrors);
		this.setSectionProperty(
			sectionIndex,
			'errors',
			this.layoutService.template.sections[sectionIndex].errors -
				this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj.options[
					optionIndex
				].errors,
			false,
		);
		this.setUIPropertyOptions(sectionIndex, dashboardIndex, 'errors', 0, optionIndex, false);
		this.setUIPropertyOptions(sectionIndex, dashboardIndex, 'isMaxVal', false, optionIndex, false);
	}
	setValidationValueOption(optionIndex, index) {
		this.setUIPropertyOptions(
			this.layoutService.lastI,
			this.layoutService.lastK,
			'validationValue',
			this.validationChecks[index],
			optionIndex,
			false,
		);
		this.updateBackUpTask('type', `formatValue`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, optionIndex, 'option');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options[optionIndex][`formatValue`],
		);
		if (
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options[optionIndex].validationValue.value == 'Date'
		) {
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options[optionIndex].formatValue = {
				slug: 'MM/DD/YYYY',
				value: 'MM/DD/YYYY',
			};
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options[optionIndex].minMaxCheck = false;
		}
		if (
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options[optionIndex].validationValue.value == 'Datetime'
		) {
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options[optionIndex].formatValue = {
				slug: 'MM/DD/YYYYTHH:mm',
				value: 'MM/DD/YYYY 24 hour',
			};
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options[optionIndex].minMaxCheck = false;
		}
		if (
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options[optionIndex].validationValue.value == 'Time'
		) {
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options[optionIndex].formatValue = {
				slug: 'HH:mm',
				value: '24 hour',
			};
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options[optionIndex].minMaxCheck = false;
		}
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options[optionIndex][`formatValue`],
		);
		this.setUIPropertyOptions(
			this.layoutService.lastI,
			this.layoutService.lastK,
			'minLimit',
			'',
			optionIndex,
			false,
		);
		this.setUIPropertyOptions(
			this.layoutService.lastI,
			this.layoutService.lastK,
			'maxLimit',
			'',
			optionIndex,
			false,
		);
		if (
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options[optionIndex].errors
		) {
			this.removeErrorsOption(this.layoutService.lastI, this.layoutService.lastK, optionIndex);
		}
		this.layoutService.backupId++;
		this.calculateCalculationFields();
		this.changeDetector.detectChanges();
	}
	preDefind() {
		if (
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options
		) {
			let optionIndex = -1;
			for (let option of this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj?.options) {
				optionIndex++;
				if (option.link && option.selectedLinkSection.id) {
					let sectionIndex = -1;
					for (let section of this.layoutService.template.sections) {
						sectionIndex++;
						if (section.id == option.selectedLinkSection.id) {
							this.updateBackUpTask('type', `linked_component`);
							this.updateBackUpTask('id', this.layoutService.backupId);
							this.updateIndexes(sectionIndex, -1, -1, 'section');
							this.updateBackUpTask(
								'oldObject',
								this.layoutService.template.sections[sectionIndex][`linked_component`],
							);
							section.linked_component--;
							this.updateBackUpTask(
								'newObject',
								this.layoutService.template.sections[sectionIndex][`linked_component`],
							);
							if (option.selected) {
								this.updateBackUpTask('type', `selected_linked_component`);
								this.updateBackUpTask('id', this.layoutService.backupId);
								this.updateIndexes(sectionIndex, -1, -1, 'section');
								this.updateBackUpTask(
									'oldObject',
									this.layoutService.template.sections[sectionIndex][`selected_linked_component`],
								);
								section.selected_linked_component--;
								this.updateBackUpTask(
									'newObject',
									this.layoutService.template.sections[sectionIndex][`selected_linked_component`],
								);
							}
							let currentDepth = section.secNo.split('.')?.length - 1;
							for (let z = sectionIndex + 1; z < this.layoutService.template.sections?.length; z++) {
								let tempDepth = this.layoutService.template.sections[z].secNo.split('.')?.length - 1;
								if (tempDepth > currentDepth) {
									this.updateBackUpTask('type', `linked_component`);
									this.updateBackUpTask('id', this.layoutService.backupId);
									this.updateIndexes(z, -1, -1, 'section');
									this.updateBackUpTask(
										'oldObject',
										this.layoutService.template.sections[z][`linked_component`],
									);
									this.layoutService.template.sections[z].linked_component--;
									this.updateBackUpTask(
										'newObject',
										this.layoutService.template.sections[z][`linked_component`],
									);
									if (option.selected) {
										this.updateBackUpTask('type', `selected_linked_component`);
										this.updateBackUpTask('id', this.layoutService.backupId);
										this.updateIndexes(z, -1, -1, 'section');
										this.updateBackUpTask(
											'oldObject',
											this.layoutService.template.sections[z][`selected_linked_component`],
										);
										this.layoutService.template.sections[z].selected_linked_component--;
										this.updateBackUpTask(
											'newObject',
											this.layoutService.template.sections[z][`selected_linked_component`],
										);
									}
								} else {
									break;
								}
							}
						}
					}
					this.updateBackUpTask('type', `link`);
					this.updateBackUpTask('id', this.layoutService.backupId);
					this.updateIndexes(
						this.layoutService.lastI,
						this.layoutService.lastK,
						optionIndex,
						'option',
					);
					this.updateBackUpTask('oldObject', option[`link`]);
					option.link = false;
					this.updateBackUpTask('newObject', option[`link`]);
					this.updateBackUpTask('type', `selectedLinkSection`);
					this.updateBackUpTask('id', this.layoutService.backupId);
					this.updateIndexes(
						this.layoutService.lastI,
						this.layoutService.lastK,
						optionIndex,
						'option',
					);
					this.updateBackUpTask('oldObject', option[`selectedLinkSection`]);
					option.selectedLinkSection = {};
					this.updateBackUpTask('newObject', option[`selectedLinkSection`]);
				}
			}
			optionIndex = -1;
			for (let option of this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj?.options) {
				optionIndex++;
				if (option.linkedUICheck && option.selectedLinkUi.id) {
					let sectionIndex = -1;
					for (let section of this.layoutService.template.sections) {
						let dashboardIndex = -1;
						sectionIndex++;
						for (let uicomp of section.dashboard) {
							dashboardIndex++;
							if (uicomp.obj.uicomponent_name == option.selectedLinkUi.id) {
								this.updateBackUpTask('type', `linked_ui`);
								this.updateBackUpTask('id', this.layoutService.backupId);
								this.updateIndexes(sectionIndex, dashboardIndex, -1, 'obj');
								this.updateBackUpTask('oldObject', uicomp.obj.linked_ui);
								uicomp.obj.linked_ui--;
								this.updateBackUpTask('newObject', uicomp.obj.linked_ui);
								if (option.selected) {
									this.updateBackUpTask('type', `selected_linked_ui_component`);
									this.updateBackUpTask('id', this.layoutService.backupId);
									this.updateIndexes(sectionIndex, dashboardIndex, -1, 'obj');
									this.updateBackUpTask('oldObject', uicomp.obj.selected_linked_ui_component);
									uicomp.obj.selected_linked_ui_component--;
									this.changeDetector.detectChanges();
									this.updateBackUpTask('newObject', uicomp.obj.selected_linked_ui_component);
								}
							}
						}
					}
					this.updateBackUpTask('type', `linkedUICheck`);
					this.updateBackUpTask('id', this.layoutService.backupId);
					this.updateIndexes(
						this.layoutService.lastI,
						this.layoutService.lastK,
						optionIndex,
						'option',
					);
					this.updateBackUpTask('oldObject', option[`linkedUICheck`]);
					option.linkedUICheck = false;
					this.updateBackUpTask('newObject', option[`linkedUICheck`]);
					this.updateBackUpTask('type', `selectedLinkUi`);
					this.updateBackUpTask('id', this.layoutService.backupId);
					this.updateIndexes(
						this.layoutService.lastI,
						this.layoutService.lastK,
						optionIndex,
						'option',
					);
					this.updateBackUpTask('oldObject', option[`selectedLinkUi`]);
					option.selectedLinkUi = {};
					this.updateBackUpTask('newObject', option[`selectedLinkUi`]);
				}
			}
		}
		if (this.preDefindAllFields[0]) {
			this.updateBackUpTask('type', `answers`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj[`answers`],
			);
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.answers = [];
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj[`answers`],
			);
			this.updateBackUpTask('type', `preDefind`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj[`preDefind`],
			);
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.preDefind =
				!this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.preDefind;
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj[`preDefind`],
			);
		} else {
			this.updateBackUpTask('type', `preDefind`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj[`preDefind`],
			);
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.preDefind = false;
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj[`preDefind`],
			);
			this.toastrService.error('No predefined fields exist', 'Error', { timeOut: 6000 });
			return;
		}
		if (
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.preDefind
		) {
			this.updateBackUpTask('type', `options`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj[`options`],
			);
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options = [];
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj[`options`],
			);
			this.updateBackUpTask('type', `data`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj[`data`],
			);
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.data = [];
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj[`data`],
			);
			this.updateBackUpTask('type', `preDefind`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj[`preDefinedObj`],
			);
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj['preDefinedObj'] = this.preDefindAllFields[0];
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj[`preDefinedObj`],
			);
			this.preDefindSelect({
				target: { value: this.preDefindAllFields[0].id },
			});
		} else {
			this.updateBackUpTask('type', `input`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj[`input`],
			);
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.input =
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.defaultValue || '';
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj[`input`],
			);
			this.updateBackUpTask('type', `statement`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj[`statement`],
			);
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.statement = 'Your statement goes here';
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj[`statement`],
			);
			this.updateBackUpTask('type', `options`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj[`options`],
			);
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options = [
				{
					label: this.option1,
					selected: false,
					hide: false,
					instanceLabel: this.option1,
					textLabel: 'Option 1',
					link: false,
					input: false,
					inputValue: '',
					instanceInputValue: '',
					height: 30,
					decimalPlacesLimit: '',
					decimalRoundOff: false,
					commentsPlaceholder: 'Type Here',
					is_required: false,
					minLimit: '',
					fontSize: '3',
					maxLimit: '',
					minMaxCheck: false,
					validationValue: {},
					validationCheck: false,
					selectedLinkSection: {},
					linkedStatement: '',
					selectedLinkUi: {},
					linkedUICheck: false,
					linkedStatementCheck: false,
				},
				{
					label: this.option2,
					instanceLabel: this.option2,
					textLabel: 'Option 2',
					selected: false,
					hide: false,
					link: false,
					input: false,
					inputValue: '',
					instanceInputValue: '',
					height: 30,
					decimalPlacesLimit: '',
					decimalRoundOff: false,
					commentsPlaceholder: 'Type Here',
					is_required: false,
					minLimit: '',
					fontSize: '3',
					maxLimit: '',
					minMaxCheck: false,
					validationValue: {},
					validationCheck: false,
					selectedLinkSection: {},
					linkedStatement: '',
					selectedLinkUi: {},
					linkedUICheck: false,
					linkedStatementCheck: false,
				},
			];
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj[`options`],
			);
			this.refreshObject();
		}
		this.layoutService.backupId++;
	}
	optionPreDefind() {
		let optionIndex = -1;
		for (let option of this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj?.options) {
			optionIndex++;
			if (option.link && option.selectedLinkSection.id) {
				let sectionIndex: number = 0;
				for (let section of this.layoutService.template.sections) {
					if (section.id == option.selectedLinkSection.id) {
						this.updateBackUpTask('type', `linked_component`);
						this.updateBackUpTask('id', this.layoutService.backupId);
						this.updateIndexes(sectionIndex, -1, -1, 'section');
						this.updateBackUpTask(
							'oldObject',
							this.layoutService.template.sections[sectionIndex][`linked_component`],
						);
						section.linked_component--;
						this.updateBackUpTask(
							'newObject',
							this.layoutService.template.sections[sectionIndex][`linked_component`],
						);
						if (option.selected) {
							this.updateBackUpTask('type', `selected_linked_component`);
							this.updateBackUpTask('id', this.layoutService.backupId);
							this.updateIndexes(sectionIndex, -1, -1, 'section');
							this.updateBackUpTask('oldObject', section.selected_linked_component);
							section.selected_linked_component--;
							this.updateBackUpTask('newObject', section.selected_linked_component);
						}
						let currentDepth = section.secNo.split('.')?.length - 1;
						for (let z = sectionIndex + 1; z < this.layoutService.template.sections?.length; z++) {
							let tempDepth = this.layoutService.template.sections[z].secNo.split('.')?.length - 1;
							if (tempDepth > currentDepth) {
								this.updateBackUpTask('type', `linked_component`);
								this.updateBackUpTask('id', this.layoutService.backupId);
								this.updateIndexes(z, -1, -1, 'section');
								this.updateBackUpTask(
									'oldObject',
									this.layoutService.template.sections[z][`linked_component`],
								);
								this.layoutService.template.sections[z].linked_component--;
								this.updateBackUpTask(
									'newObject',
									this.layoutService.template.sections[z][`linked_component`],
								);
								if (option.selected) {
									this.updateBackUpTask('type', `selected_linked_component`);
									this.updateBackUpTask('id', this.layoutService.backupId);
									this.updateIndexes(z, -1, -1, 'section');
									this.updateBackUpTask(
										'oldObject',
										this.layoutService.template.sections[z][`selected_linked_component`],
									);
									this.layoutService.template.sections[z].selected_linked_component--;
									this.updateBackUpTask(
										'newObject',
										this.layoutService.template.sections[z][`selected_linked_component`],
									);
								}
							} else {
								break;
							}
						}
					}
					sectionIndex++;
				}
				this.updateBackUpTask('type', `link`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(
					this.layoutService.lastI,
					this.layoutService.lastK,
					optionIndex,
					'option',
				);
				this.updateBackUpTask('oldObject', option[`link`]);
				option.link = false;
				this.updateBackUpTask('newObject', option[`link`]);
				this.updateBackUpTask('type', `selectedLinkSection`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(
					this.layoutService.lastI,
					this.layoutService.lastK,
					optionIndex,
					'option',
				);
				this.updateBackUpTask('oldObject', option[`selectedLinkSection`]);
				option.selectedLinkSection = {};
				this.updateBackUpTask('newObject', option[`selectedLinkSection`]);
			}
		}
		optionIndex = -1;
		for (let option of this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj?.options) {
			optionIndex++;
			if (option.linkedUICheck && option.selectedLinkUi.id) {
				let i: number = 0;
				for (let section of this.layoutService.template.sections) {
					let uiIndex = -1;
					for (let uicomp of section.dashboard) {
						uiIndex++;
						if (uicomp.obj.uicomponent_name == option.selectedLinkUi.id) {
							this.setUIProperty(i, uiIndex, 'linked_ui', uicomp.obj.linked_ui - 1, false);
							if (option.selected) {
								this.setUIProperty(
									i,
									uiIndex,
									'selected_linked_ui_component',
									uicomp.obj.selected_linked_ui_component - 1,
									false,
								);
							}
						}
					}
					i++;
				}
				this.updateBackUpTask('type', `linkedUICheck`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(
					this.layoutService.lastI,
					this.layoutService.lastK,
					optionIndex,
					'option',
				);
				this.updateBackUpTask('oldObject', option.linkedUICheck);
				option.linkedUICheck = false;
				this.updateBackUpTask('newObject', option.linkedUICheck);
				this.updateBackUpTask('type', `selectedLinkUi`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(
					this.layoutService.lastI,
					this.layoutService.lastK,
					optionIndex,
					'option',
				);
				this.updateBackUpTask('oldObject', option.selectedLinkUi);
				option.selectedLinkUi = {};
				this.updateBackUpTask('newObject', option.selectedLinkUi);
			}
		}
		this.setUIProperty(
			this.layoutService.lastI,
			this.layoutService.lastK,
			'specialities',
			cloneDeep(this.specialities),
			false,
		);
		this.invertUIProperty(
			this.layoutService.lastI,
			this.layoutService.lastK,
			'optionsPreDefind',
			false,
		);
		if (
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.optionsPreDefind
		) {
			this.setUIProperty(this.layoutService.lastI, this.layoutService.lastK, 'options', [], false);
			this.setUIProperty(this.layoutService.lastI, this.layoutService.lastK, 'answers', [], false);
			this.setUIProperty(
				this.layoutService.lastI,
				this.layoutService.lastK,
				'manualoptions',
				false,
				false,
			);
			this.setUIProperty(
				this.layoutService.lastI,
				this.layoutService.lastK,
				'multilinked',
				false,
				false,
			);
			this.setUIProperty(
				this.layoutService.lastI,
				this.layoutService.lastK,
				'MultiSelectObj',
				null,
				false,
			);
			this.refreshObject();
			this.changeDetector.detectChanges();
		}
		if (
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.selectedItems
		) {
			this.setUIProperty(
				this.layoutService.lastI,
				this.layoutService.lastK,
				'selectedItems',
				[],
				false,
			);
		}
		this.layoutService.backupId++;
	}
	changeCombinedLineSpacingValue() {
		for (let component of this.selectedComponents) {
			this.updateBackUpTask('type', `lineSpacingValue`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(component.sectionIndex, component.dashboardIndex, -1, 'obj');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj[`lineSpacingValue`],
			);
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.lineSpacingValue = this.combinedLineSpacingValue;
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj[`lineSpacingValue`],
			);
		}
		this.layoutService.backupId++;
	}
	changeCombinedBgColorValue() {
		for (let component of this.selectedComponents) {
			this.updateBackUpTask('type', `backgroundColor`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(component.sectionIndex, component.dashboardIndex, -1, 'obj');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj[`backgroundColor`],
			);
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.backgroundColor = this.combinedBgColorValue;
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj[`backgroundColor`],
			);
		}
		this.layoutService.backupId++;
	}
	changeCombinedFontColorValue(event: any) {
		this.combinedFontColorValue = event;
		for (let component of this.selectedComponents) {
			this.updateBackUpTask('type', `fontColorCode`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(component.sectionIndex, component.dashboardIndex, -1, 'obj');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj[`fontColorCode`],
			);
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.fontColorCode = event;
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj[`fontColorCode`],
			);
		}
		this.layoutService.backupId++;
	}
	changeCombinedFontFamilyValue() {
		for (let component of this.selectedComponents) {
			this.updateBackUpTask('type', `fontFamilyValue`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(component.sectionIndex, component.dashboardIndex, -1, 'obj');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj[`fontFamilyValue`],
			);
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.fontFamilyValue = this.combinedFontFamilyValue;
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj[`fontFamilyValue`],
			);
		}
		this.layoutService.backupId++;
	}
	invertCombinedLineSpacingProperty() {
		this.combinedLineSpacing = !this.combinedLineSpacing;
		for (let component of this.selectedComponents) {
			this.updateBackUpTask('type', `lineSpacing`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(component.sectionIndex, component.dashboardIndex, -1, 'obj');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj[`lineSpacing`],
			);
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.lineSpacing = this.combinedLineSpacingValue;
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj[`lineSpacing`],
			);
		}
		this.layoutService.backupId++;
	}
	invertCombinedBgColorProperty() {
		this.combinedBgColor = !this.combinedBgColor;
		for (let component of this.selectedComponents) {
			this.updateBackUpTask('type', `bgColor`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(component.sectionIndex, component.dashboardIndex, -1, 'obj');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj[`bgColor`],
			);
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.bgColor = this.combinedBgColor;
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj[`bgColor`],
			);
			this.setUIProperty(
				component.sectionIndex,
				component.dashboardIndex,
				'backgroundColor',
				'#ffffff',
				false,
			);
		}
		this.layoutService.backupId++;
	}
	invertCombinedFontColorProperty() {
		this.combinedFontColor = !this.combinedFontColor;
		for (let component of this.selectedComponents) {
			this.updateBackUpTask('type', `fontColor`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(component.sectionIndex, component.dashboardIndex, -1, 'obj');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj[`fontColor`],
			);
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.fontColor = this.combinedFontColor;
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj[`fontColor`],
			);
			this.setUIProperty(
				component.sectionIndex,
				component.dashboardIndex,
				'fontColorCode',
				'#000000',
				false,
			);
		}
		this.layoutService.backupId++;
	}
	invertCombinedFontFamilyProperty() {
		this.combinedFontFamily = !this.combinedFontFamily;
		for (let component of this.selectedComponents) {
			this.updateBackUpTask('type', `fontFamily`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(component.sectionIndex, component.dashboardIndex, -1, 'obj');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj[`fontFamily`],
			);
			this.layoutService.template.sections[component.sectionIndex].dashboard[
				component.dashboardIndex
			].obj.fontFamily = this.combinedFontFamily;
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj[`fontFamily`],
			);
		}
		this.layoutService.backupId++;
	}
	hidePdf(event: any, check?) {
		if (check) {
			this.combinedHidePdf = !this.combinedHidePdf;
			for (let component of this.selectedComponents) {
				this.updateBackUpTask('type', `hidePdf`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(component.sectionIndex, component.dashboardIndex, -1, 'obj');
				this.updateBackUpTask(
					'oldObject',
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj[`hidePdf`],
				);
				if (this.combinedHidePdf) {
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.hidePdf = 1;
				} else {
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj.hidePdf = 0;
				}
				this.updateBackUpTask(
					'newObject',
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj[`hidePdf`],
				);
			}
		} else {
			this.updateBackUpTask('type', `hidePdf`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj[`hidePdf`],
			);
			let target = parseInt(event.target.value);
			if (event.target.checked) {
				if (target) {
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[
						this.layoutService.lastK
					].obj.hidePdf = target;
				} else {
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[
						this.layoutService.lastK
					].obj.hidePdf = 1;
				}
			} else {
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.hidePdf = 0;
			}
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj[`hidePdf`],
			);
		}
		this.layoutService.backupId++;
	}
	toggleDisplaySignee() {
		this.updateBackUpTask('type', `displaySignee`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[this.layoutService.lastK].obj[`displaySignee`],
		);
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[this.layoutService.lastK].obj.displaySignee = !this.layoutService.template.sections[this.layoutService.lastI].dashboard[this.layoutService.lastK].obj.displaySignee;
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[this.layoutService.lastK].obj[`displaySignee`],
			);
		this.layoutService.backupId++;
	}
	toggleSameLineInput(check?) {
		if (check) {
			this.combinedSameLineInput = !this.combinedSameLineInput;
			for (let component of this.selectedComponents) {
				this.updateBackUpTask('type', `sameLineInput`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(component.sectionIndex, component.dashboardIndex, -1, 'obj');
				this.updateBackUpTask(
					'oldObject',
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj[`sameLineInput`],
				);
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.sameLineInput = this.combinedSameLineInput;
				this.updateBackUpTask(
					'newObject',
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj[`sameLineInput`],
				);
			}
		} else {
			this.updateBackUpTask('type', `sameLineInput`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj[`sameLineInput`],
			);
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.sameLineInput =
				!this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.sameLineInput;
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj[`sameLineInput`],
			);
		}
		this.layoutService.backupId++;
	}
	IsRequired(check?) {
		if (check) {
			this.combinedRequired = !this.combinedRequired;
			for (let component of this.selectedComponents) {
				this.updateBackUpTask('type', `is_required`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(component.sectionIndex, component.dashboardIndex, -1, 'obj');
				this.updateBackUpTask(
					'oldObject',
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj[`is_required`],
				);
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.is_required = this.combinedRequired;
				this.updateBackUpTask(
					'newObject',
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj[`is_required`],
				);
			}
		} else {
			this.updateBackUpTask('type', `is_required`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj[`is_required`],
			);
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.is_required =
				!this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.is_required;
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj[`is_required`],
			);
		}
		this.layoutService.backupId++;
		this.layoutService.refreshObject(
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj,
		);
		this.changeDetector.detectChanges();
	}
	toggleLinkSelection(check?) {
		if (check) {
			this.combinedSingleSelection = !this.combinedSingleSelection;
			for (let component of this.selectedComponents) {
				this.updateBackUpTask('type', `is_single_select`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(component.sectionIndex, component.dashboardIndex, -1, 'obj');
				this.updateBackUpTask(
					'oldObject',
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj[`is_single_select`],
				);
				this.layoutService.template.sections[component.sectionIndex].dashboard[
					component.dashboardIndex
				].obj.is_single_select = this.combinedSingleSelection;
				this.updateBackUpTask(
					'newObject',
					this.layoutService.template.sections[component.sectionIndex].dashboard[
						component.dashboardIndex
					].obj[`is_single_select`],
				);
			}
		} else {
			this.updateBackUpTask('type', `is_single_select`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj[`is_single_select`],
			);
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.is_single_select =
				!this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.is_single_select;
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj[`is_single_select`],
			);
		}
		this.layoutService.backupId++;
		this.refreshObject();
	}
	SetOptionsViewCheckbox(a: string) {
		let value = parseInt(a);
		this.updateBackUpTask('type', `OptionView`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`OptionView`],
		);
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.OptionView = value;
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`OptionView`],
		);
		if (
			value != 5 &&
			value != 6 &&
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.type == this.uicomponentTypes.CHECKBOX
		) {
			this.updateBackUpTask('type', `showCheckBoxes`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj[`showCheckBoxes`],
			);
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.showCheckBoxes = false;
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj[`showCheckBoxes`],
			);
		}
		this.layoutService.backupId++;
	}
	SetListOptions(value: string) {
		let numberValue = parseInt(value);
		if (
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.listOptions == numberValue
		) {
			this.updateBackUpTask('type', `listOptions`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj[`listOptions`],
			);
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.listOptions = 0;
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj[`listOptions`],
			);
		} else {
			this.updateBackUpTask('type', `listOptions`);
			this.updateBackUpTask('id', this.layoutService.backupId);
			this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
			this.updateBackUpTask(
				'oldObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj[`listOptions`],
			);
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.listOptions = numberValue;
			this.updateBackUpTask(
				'newObject',
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj[`listOptions`],
			);
		}
		this.layoutService.backupId++;
	}
	textSectionClick(i: number) {
		let textArea = document.getElementById('sectionName' + i);
		this.layoutService.template.sections[i].boundSectionStatement = textArea.innerText;
		this.editSectionText = true;
		this.layoutService.template.sections[i].isSelected =
			!this.layoutService.template.sections[i].isSelected;
	}
	textAreaClickSection(i: number) {
		if (!this.editSectionText) {
			let textArea: any = document.getElementById('sectionName' + i);
			textArea.firstChild.innerText = this.layoutService.template.sections[i].boundSectionStatement;
			textArea.firstChild.nodeValue = this.layoutService.template.sections[i].boundSectionStatement;
			this.title_value = textArea.innerHTML;
			this.layoutService.template.sections[i].isSelected =
				!this.layoutService.template.sections[i].isSelected;
			this.layoutService.template.sections[i].section_title = this.title_value;
		} else {
			this.editSectionText = false;
		}
	}
	editTempNameOutside() {
		if (!this.editTempText) {
			this.title_value = this.layoutService.template.boundTemplateStatement;
			this.layoutService.template.template_name = this.title_value;
			this.editTempName = true;
		} else {
			this.editTempText = false;
		}
	}
	toggleEditTempName(i: number) {
		let textArea = document.getElementById('templatename');
		this.layoutService.template.boundTemplateStatement = textArea.innerText;
		this.editTempText = true;
		this.editTempName = !this.editTempName;
	}
	boundStatementChange() {
		this.layoutService.template.boundTemplateStatement =
			this.layoutService.template.boundTemplateStatement.replace(/<\/?[^>]+(>|$)/g, '');
		this.layoutService.template.boundTemplateStatement =
			this.layoutService.template.boundTemplateStatement.replace(/\&nbsp;/g, ' ');
		this.layoutService.template.template_name = this.layoutService.template.boundTemplateStatement;
		this.changeDetector.detectChanges();
	}
	templateNameChange(event: any) {
		this.layoutService.template.template_name = event;
		this.layoutService.template.boundTemplateStatement = this.layoutService.template.template_name;
		this.layoutService.template.boundTemplateStatement =
			this.layoutService.template.boundTemplateStatement.replace(/<\/?[^>]+(>|$)/g, '');
		this.layoutService.template.boundTemplateStatement =
			this.layoutService.template.boundTemplateStatement.replace(/\&nbsp;/g, ' ');
		this.changeDetector.detectChanges();
	}
	titleChange(event: any, i: number) {
		this.layoutService.template.sections[i].section_title = event;
		this.layoutService.template.sections[i].boundSectionStatement =
			this.layoutService.template.sections[i].section_title;
		this.layoutService.template.sections[i].boundSectionStatement =
			this.layoutService.template.sections[i].boundSectionStatement.replace(/<\/?[^>]+(>|$)/g, '');
		this.layoutService.template.sections[i].boundSectionStatement =
			this.layoutService.template.sections[i].boundSectionStatement.replace(/\&nbsp;/g, ' ');
		this.changeDetector.detectChanges();
	}
	public pdfViewer = false;
	public pdfSrc: string = '';
	previewRequiredFieldsCheck = false;
	public async generatePdf(check: GENERATE_PDF_OPTIONS) {
		if(!this.checkRequiredFields(true, true)) return;

		let pdfHTMLArray: string[] = [];
		let tempPdfArray = [];
		if (check === this.generatePdfOptions.GENERATE_ALL_REPORTS || check === this.generatePdfOptions.GENERATE_AND_FINALIZE) {
			await this.pdfPreview(3, '');
			tempPdfArray = this.layoutService.seperateMainStringValue;
		} else {
			for (let i: number = 0; i < this.multiplePreviews?.length; i++) {
				if (this.multiplePreviews[i].selected) {
					tempPdfArray.push(this.layoutService.seperateMainStringValue[0]);
				}
			}
		}
		let headerDiv: any = document.getElementsByClassName('headerDiv');
		let headerHTML = headerDiv[headerDiv?.length - 1].cloneNode(true).innerHTML;
		let footerDiv: any = document.getElementsByClassName('footerDiv');
		let footerHTML = footerDiv[footerDiv?.length - 1].cloneNode(true).innerHTML;
		for (let i: number = 0; i < tempPdfArray?.length; i++) {
			let tempString = tempPdfArray[i];
			tempString = tempString
				.split("<hr id='pageEndLine' style='border: 0px; background: #f7f7f7; height:1.25em;'>")
				.join('');
			tempString = tempString
				.split(
					"<svg class='svg-inline--fa fa-check-square fa-w-14' aria-hidden='true' data-prefix='fa' data-icon='check-square' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512' data-fa-i2svg=''><path fill='currentColor' d='M400 480H48c-26.51 0-48-21.49-48-48V80c0-26.51 21.49-48 48-48h352c26.51 0 48 21.49 48 48v352c0 26.51-21.49 48-48 48zm-204.686-98.059l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.248-16.379-6.249-22.628 0L184 302.745l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.25 16.379 6.25 22.628.001z'></path></svg>",
				)
				.join(
					"<svg class='svg-inline--fa fa-check-square fa-w-14' style='height:1em; width:0.875em;' aria-hidden='true' data-prefix='fa' data-icon='check-square' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512' data-fa-i2svg=''><path fill='currentColor' d='M400 480H48c-26.51 0-48-21.49-48-48V80c0-26.51 21.49-48 48-48h352c26.51 0 48 21.49 48 48v352c0 26.51-21.49 48-48 48zm-204.686-98.059l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.248-16.379-6.249-22.628 0L184 302.745l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.25 16.379 6.25 22.628.001z'></path></svg>",
				);
			tempString = tempString
				.split(
					'<svg class="svg-inline--fa fa-check-square fa-w-14" aria-hidden="true" data-prefix="fa" data-icon="check-square" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg=""><path fill="currentColor" d="M400 480H48c-26.51 0-48-21.49-48-48V80c0-26.51 21.49-48 48-48h352c26.51 0 48 21.49 48 48v352c0 26.51-21.49 48-48 48zm-204.686-98.059l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.248-16.379-6.249-22.628 0L184 302.745l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.25 16.379 6.25 22.628.001z"></path></svg>',
				)
				.join(
					"<svg class='svg-inline--fa fa-check-square fa-w-14' style='height:1em; width:0.875em;' aria-hidden='true' data-prefix='fa' data-icon='check-square' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512' data-fa-i2svg=''><path fill='currentColor' d='M400 480H48c-26.51 0-48-21.49-48-48V80c0-26.51 21.49-48 48-48h352c26.51 0 48 21.49 48 48v352c0 26.51-21.49 48-48 48zm-204.686-98.059l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.248-16.379-6.249-22.628 0L184 302.745l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.25 16.379 6.25 22.628.001z'></path></svg>",
				);
			pdfHTMLArray.push(tempString);
		}
		const scheduler = this.storageData.getSchedulerInfo();
		let templateObj = scheduler.template_instance;
		let appointment_slug = templateObj.appointment_slug;
		const token = JSON.parse(localStorage.getItem('cm_data')).token;
		for (let i = 0; i < pdfHTMLArray?.length; i++) {
			let pdfHTMLElement: HTMLElement = document.createElement("div");
			pdfHTMLElement.innerHTML = pdfHTMLArray[i];
			pdfHTMLElement = this.pushElementsToEndOfPage(pdfHTMLElement)
			pdfHTMLArray[i] = pdfHTMLElement.innerHTML;
		}
		let data = {
			html: pdfHTMLArray,
			headerHTML: headerHTML,
			footerHTML: footerHTML,
			headerHeight: this.headerHeight,
			footerHeight: this.footerHeight,
			pageSize: this.layoutService.template.pageSize,
			pageNumber: this.pageNumbers,
			case_id: templateObj.case_id,
			appointment_location_id: this.location_idd,
			speciality_id: this.speciality_idd,
			visit_session_id: this.visit_idd,
		};
		if (this.layoutService.isInstancePreview) {
			data.case_id = 0;
			this.finalizePreviewInstance();
			if (this.previewRequiredFieldsCheck) {
				this.previewRequiredFieldsCheck = false;
				return;
			}
		}
		if (appointment_slug == 'fu_mmi') {
			this.requestService
				.sendRequest(
					TemaplateManagerUrlsEnum.generateC4_3 +
						'?token=' +
						token +
						'&visit_session_id=' +
						this.visit_idd,
					'GET',
					REQUEST_SERVERS.fd_api_url,
				)
				.subscribe(
					(res: any) => {
						if (check !== this.generatePdfOptions.GENERATE_AND_FINALIZE) {
							let link = res.result.data.link;
							let fileURL = link + '&token=' + this.storageData.getToken();
							window.open(fileURL);
						} else {
							this.layoutService.editorView = false;
							let finalizeVisitData:any=this.finaliseVisitParam(false)
							// this.layoutService.isShowEditor = false;
							this.requestService
								.sendRequest(
									TemaplateManagerUrlsEnum.updateVisitSession,
									'PUT',
									REQUEST_SERVERS.fd_api_url,
									{...finalizeVisitData,is_not:1},
									)
								.subscribe(
									(res: any) => {
										this.route.navigate([`scheduler-front-desk/doctor-calendar`]);
									},
									(err) => {
										console.log(err);
										this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
										this.stopLoader();
									},
								);
						}
					},
					(err) => {
						console.log(err);
						this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
						this.stopLoader();
					},
				);
		} else {
			this.layoutService.isLoaderPending.next(true);
			this.requestService
				.sendRequest(
					TemaplateManagerUrlsEnum.generatePdfRoute,
					'POST',
					REQUEST_SERVERS.templateManagerUrl,
					data,
				)
				.subscribe(
					(res: any) => {
						if (check !== this.generatePdfOptions.GENERATE_AND_FINALIZE) {
							const subscription = this.requestService
								.sendRequest(
									TemaplateManagerUrlsEnum.filesByVisit + '?visit_id=' + this.visit_idd,
									'GET',
									REQUEST_SERVERS.erx_fd_api,
								)
								.subscribe((erxRes: any) => {
									res.data.pdf = [...res.data.pdf, ...erxRes.result.data];
									for (let pdf of res.data.pdf) {
										if (!this.layoutService.isInstancePreview) {
											let fileURL =
												this.config2.getConfig(REQUEST_SERVERS.fd_api_url) +
												'dm/file-by-id?id=' +
												pdf +
												'&&token=' +
												this.storageData.getToken();
											window.open(fileURL);
										} else {
											let byteArray = new Uint8Array(pdf.data);
											let blob = new Blob([byteArray], { type: 'application/pdf' });
											let fileURL = URL.createObjectURL(blob);
											window.open(fileURL);
										}
									}
								});
							this.subscriptions.push(subscription);
							this.stopLoader()
						} else {
							this.layoutService.editorView = false;
							let finalizeVisitData:any=this.finaliseVisitParam(true)	
							// this.layoutService.isShowEditor = false;
							this.requestService
								.sendRequest(
									TemaplateManagerUrlsEnum.updateVisitSession,
									'PUT',
									REQUEST_SERVERS.fd_api_url,
									{...finalizeVisitData,is_not:1},
									)
								.subscribe(
									(res: any) => {
										this.route.navigate([`scheduler-front-desk/doctor-calendar`]);
									},
									(err) => {
										console.log(err);
										this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
										this.stopLoader();
									},
								);
						}
						// this.stopLoader();
					},
					(err) => {
						console.log(err);
						this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
						this.stopLoader();
					},
				);
		}
	}

	isAnswerEmpty(obj:any) {
		if(
			(
				obj.answers && obj.answers.length && obj.type == this.uicomponentTypes.INPUT && obj.answers[0].answer == ''
			)
			||
				obj.answers.length == 0
			) {
				return true;
			} else {
				return false;
			}
			
	}

	PreviewClicked = false;
	private checkRequiredFields(shouldSetErrors: boolean, shouldShowMessage: boolean, sectionIndex?: number): boolean {
		sectionIndex = !isNil(sectionIndex) ? sectionIndex : this.layoutService.template.sections.length
		let requiredFieldMessage = 'Required field not yet filled.';
		
		for (let i: number = 0; i < sectionIndex; i++) {
			for (let j: number = 0; j < this.layoutService.template?.sections[i]?.dashboard?.length; j++) {
				if (
					this.layoutService.template.sections[i].dashboard[j].obj.type == this.uicomponentTypes.CHECKBOX ||
					this.layoutService.template.sections[i].dashboard[j].obj.type == this.uicomponentTypes.RADIO
				) {
					for (
						let optionIndex: number = 0;
						optionIndex < this.layoutService.template.sections[i].dashboard[j]?.obj?.options?.length;
						optionIndex++
					) {
						if (
							this.layoutService.template.sections[i].dashboard[j].obj.options[optionIndex]
								.is_required &&
							this.layoutService.template.sections[i].dashboard[j].obj.options[optionIndex]
								.instanceInputValue.length == 0 &&
							this.layoutService.template.sections[i].dashboard[j].obj.options[optionIndex]
								.selected &&
							this.layoutService.template.sections[i].linked_component ==
								this.layoutService.template.sections[i].selected_linked_component &&
							!(
								(this.layoutService.template.sections[i].dashboard[j].obj
									.selected_linked_ui_component !=
									this.layoutService.template.sections[i].dashboard[j].obj.linked_ui &&
									!this.layoutService.template.sections[i].dashboard[j].obj.is_single_select) ||
								(!this.layoutService.template.sections[i].dashboard[j].obj
									.selected_linked_ui_component &&
									this.layoutService.template.sections[i].dashboard[j].obj.linked_ui)
							)
						) {
							this.setTemplateErrors(this.layoutService.template, this.layoutService.template.sections[i], this.layoutService.template.sections[i].dashboard[j])
							this.previewRequiredFieldsCheck = true;
							if(shouldShowMessage) this.toastrService.error(requiredFieldMessage);
							// this.stopLoader();
							return false;
						}
					}
				}
				if(
					this.layoutService.template.sections[i].dashboard[j].obj.type == this.uicomponentTypes.INCREMENT
					&& 
					(
						(
							this.layoutService.template.sections[i].dashboard[j].obj.value<
							this.layoutService.template.sections[i].dashboard[j].obj.options.floor
						)
						||
						(
							this.layoutService.template.sections[i].dashboard[j].obj.value>
							this.layoutService.template.sections[i].dashboard[j].obj.options.ceil
						)
					)
				) {
					this.previewRequiredFieldsCheck = true;
					this.setTemplateErrors(this.layoutService.template, this.layoutService.template.sections[i], this.layoutService.template.sections[i].dashboard[j], shouldSetErrors)
					if(shouldShowMessage) this.toastrService.error("Invalid Increment Value");
				}
			}
			if (!this.layoutService.template.sections[i].requiredFilled) {
				for (let www: number = 0; www < this.layoutService?.template?.sections[i]?.dashboard?.length; www++) {
					if (
						this.layoutService.template.sections[i].dashboard[www].obj.is_required &&
						this.isAnswerEmpty(this.layoutService.template.sections[i].dashboard[www].obj) &&
						this.layoutService.template.sections[i].linked_component ==
							this.layoutService.template.sections[i].selected_linked_component &&
						!(
							(this.layoutService.template.sections[i].dashboard[www].obj
								.selected_linked_ui_component !=
								this.layoutService.template.sections[i].dashboard[www].obj.linked_ui &&
								!this.layoutService.template.sections[i].dashboard[www].obj.is_single_select) ||
							(!this.layoutService.template.sections[i].dashboard[www].obj
								.selected_linked_ui_component &&
								this.layoutService.template.sections[i].dashboard[www].obj.linked_ui)
						)
					) {
						this.previewRequiredFieldsCheck = true;
						this.setTemplateErrors(this.layoutService.template, this.layoutService.template.sections[i], this.layoutService.template.sections[i].dashboard[www], shouldSetErrors)
						if(shouldShowMessage) this.toastrService.error(requiredFieldMessage);
						// this.stopLoader();
						return false;
					}
				}
			}
		}
		return true
	}
	finalizePreviewInstance() {
		this.PreviewClicked = true;
		this.removeAllTemplateErrors()
		this.checkRequiredFields(true, true)
		return;
	}
	async finalizeInstance() {
		this.previewLoaded = false;
		this.layoutService.isLoaderPending.next(true);
		
		this.removeAllTemplateErrors()
		if (!this.checkRequiredFields(true, false)) {
			this.stopLoader();
			// this.coolDialogs
			// 	.confirm('The instance is not completely filled. Do you still wish to proceed? ', {
			// 		okButtonText: 'OK',
			// 		cancelButtonText: 'Cancel',
			// 	})
			this.bsModalRef = this.modalServiceDialog.show(ConfirmationDialogComponent, {
				initialState: {
				  message: 'The instance is not completely filled. Do you still wish to proceed?'
				},
				class: 'modal-dialog-centered'
			  });
			  this.bsModalRef.content.result
				.subscribe(async (response) => {
					if (response == true) {
						this.layoutService.isLoaderPending.next(true);
						this.changeDetector.detectChanges();
						this.highlightPreview = true;
						await this.saveInstance(2);
						return;
					} else {
						return;
					}
				});
		} else {
			this.layoutService.isLoaderPending.next(true);
			this.highlightPreview = true;
			await this.saveInstance(2);
			return;
		}
	}
	public openModel() {
		this.layoutService.alignmentModal = this.modalService.open(AlignmentComponent, {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc',
		});
		this.layoutService.alignmentModal.result.then(async (res) => {
			if (res) {
				await this.makeText(0);
				await this.saveAlignment();
				if (this.hfImages == 0) {
					await this.pdfPreview(1, '');
				}
			} else {
				await this.makeText(1);
				let tempDiv: any = document.getElementsByClassName('originalDiv');
				let innerHTML = tempDiv[1].cloneNode(true).innerHTML;
				await this.pdfPreview(0, innerHTML);
			}
		});
	}
	public openHeaderModel() {
		this.layoutService.PreDefinedListUsed = this.PreDefinedList;
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc',
		};
		this.layoutService.headerModal = this.modalService.open(HeaderComponent, ngbModalOptions);
	}
	public sectionEmptyCheck() {
		for (let t: number = 0; t < this.layoutService.template.sections?.length; t++) {
			let cols = this.layoutService.template.sections[t].options.maxCols;
			let rows = this.layoutService.template.sections[t].options.maxRows;
			let cord = Array.from({ length: rows }, () => Array.from({ length: cols }, () => false));
			for (let i: number = 0; i < this.layoutService.template.sections[t].dashboard?.length; i++) {
				for (
					let c = this.layoutService.template.sections[t].dashboard[i].y;
					c <
					this.layoutService.template.sections[t].dashboard[i].y +
						this.layoutService.template.sections[t].dashboard[i].rows;
					c++
				) {
					for (
						let k = this.layoutService.template.sections[t].dashboard[i].x;
						k <
						this.layoutService.template.sections[t].dashboard[i].x +
							this.layoutService.template.sections[t].dashboard[i].cols;
						k++
					) {
						cord[c][k] = true;
					}
				}
			}
			for (let q: number = 0; q < rows; q++) {
				for (let w: number = 0; w < cols; w++) {
					if (!cord[q][w]) {
						this.layoutService.template.sections[t].dashboard.push({
							x: w,
							y: q,
							cols: 1,
							rows: 1,
							obj: {
								showSimpleTextProperties: false,
								sameLineInput: false,
								hidePdf: 0,
								type: this.uicomponentTypes.TEXT,
								isStatement: true,
								alignment: 'center',
								statement: '',
								instanceStatement: '',
								textInput: ' ',
								extra: true,
								answers: [],
								tags: [],
								bold: false,
								underLine: false,
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
								lineSpacingValue: 15,
								bgColor: false,
								backgroundColor: '#ff0000',
								fontColor: false,
								fontColorCode: '#000000',
								fontFamily: false,
								fontFamilyValue: '',
								linked_ui: 0,
								selected_linked_ui_component: 0,
								errors: 0,
							},
							id: UUID(),
						});
					}
				}
			}
		}
	}
	public sectionEmptyUncheck() {
		for (let t: number = 0; t < this.layoutService.template.sections?.length; t++) {
			for (let i: number = 0; i < this.layoutService.template.sections[t].dashboard?.length; i++) {
				if (this.layoutService.template.sections[t].dashboard[i].obj.extra) {
					this.layoutService.template.sections[t].dashboard.splice(i, 1);
					i--;
				}
			}
		}
	}
	scroll = 0;
	onScroll(e) {
		e.preventDefault();
		this.scroll = e.srcElement.scrollTop;
		if (e.target.className != 'ng-dropdown-panel-items scroll-host') {
			let dropDownElements: any = document.getElementsByClassName('ng-select-opened');
			for (let element of dropDownElements) {
				element?.classList.remove('ng-select-opened');
			}
			let dropDownScrolls: any = document.getElementsByClassName('ng-dropdown-panel');
			for (let element of dropDownScrolls) {
				document.body.removeChild(element);
			}
		}
	}
	scrollToTop() {
		this.document.body.scrollTop = 0; // For Safari
		this.document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
	}
	public headerEmptyCheck(section, check) {
		if (!section) {
			return;
		}
		let cols = section.options.maxCols;
		let rows = section.options.maxRows;
		let cord = Array.from({ length: rows }, () => Array.from({ length: cols }, () => false));
		for (let i: number = 0; i < section.dashboard?.length; i++) {
			for (
				let c = section.dashboard[i].y;
				c < section.dashboard[i].y + section.dashboard[i].rows;
				c++
			) {
				for (
					let k = section.dashboard[i].x;
					k < section.dashboard[i].x + section.dashboard[i].cols;
					k++
				) {
					cord[c][k] = true;
				}
			}
		}
		for (let q: number = 0; q < rows; q++) {
			for (let w: number = 0; w < cols; w++) {
				if (!cord[q][w]) {
					section.dashboard.push({
						x: w,
						y: q,
						cols: 1,
						rows: 1,
						obj: {
							showSimpleTextProperties: false,
							sameLineInput: false,
							hidePdf: 0,
							type: this.uicomponentTypes.TEXT,
							isStatement: true,
							alignment: 'center',
							statement: ' ',
							instanceStatement: ' ',
							textInput: ' ',
							extra: true,
							answers: [],
							tags: [],
							bold: false,
							underLine: false,
							uiBorders: false,
							leftUIBorder: 0,
							rightUIBorder: 0,
							topUIBorder: 0,
							bottomUIBorder: 0,
							linked_ui: 0,
							selected_linked_ui_component: 0,
							errors: 0,
						},
						id: UUID(),
					});
				}
			}
		}
		if (check == 'header') {
			this.layoutService.header = section;
		} else if (check == 'footer') {
			this.layoutService.footer = section;
		}
	}
	public headerEmptyUncheck(section) {
		for (let i: number = 0; i < section.dashboard?.length; i++) {
			if (section.dashboard[i].obj.extra) {
				section.dashboard.splice(i, 1);
				i--;
			}
		}
		return section;
	}
	optionPreDefindSelect(e) {
		this.updateBackUpTask('type', `multilinked`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`multilinked`],
		);
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.multilinked = false;
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`multilinked`],
		);
		this.updateBackUpTask('type', `manualoptions`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`manualoptions`],
		);
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.manualoptions = false;
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`manualoptions`],
		);
		for (
			let i: number = 0;
			i <
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.specialities?.length;
			i++
		) {
			if (
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.specialities[i].id === parseInt(e.target.value)
			) {
				for (let option of this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj['options']) {
					if (
						option.id ==
						this.layoutService.template.sections[this.layoutService.lastI].dashboard[
							this.layoutService.lastK
						].obj.specialities[i].id
					) {
						return;
					}
				}
				let tempOption = cloneDeep(
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[
						this.layoutService.lastK
					].obj.specialities[i],
				);
				this.updateBackUpTask('type', `options`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
				this.updateBackUpTask(
					'oldObject',
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[
						this.layoutService.lastK
					].obj[`options`],
				);
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj['options'].push(
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[
						this.layoutService.lastK
					].obj.specialities[i],
				);
				this.updateBackUpTask(
					'newObject',
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[
						this.layoutService.lastK
					].obj[`options`],
				);
				break;
			}
		}
		this.refreshObject();
		this.changeDetector.detectChanges();
		this.optionPreDefinedInputModel = '';
		this.editOptionsTs(this.layoutService.lastI, 0);
		this.layoutService.backupId++;
	}
	MultiLinkedSelect(e) {
		this.updateBackUpTask('type', `optionsPreDefind`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`optionsPreDefind`],
		);
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.optionsPreDefind = false;
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`optionsPreDefind`],
		);
		this.updateBackUpTask('type', `options`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'manualoptions');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`manualoptions`],
		);
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.manualoptions = false;
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`manualoptions`],
		);
		this.updateBackUpTask('type', `options`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`MultiSelectObj`],
		);
		this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'MultiSelectObj');
		delete this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj['MultiSelectObj'];
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj['MultiSelectObj'] = e;
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`MultiSelectObj`],
		);
		this.updateBackUpTask('type', `options`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`options`],
		);
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.options = [];
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`options`],
		);
		this.updateBackUpTask('type', `answers`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`answers`],
		);
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.answers = [];
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`answers`],
		);
		this.MultiLinkedInputModel = '';
		this.refreshObject();
		this.layoutService.updateComponents();
		this.layoutService.backupId++;
	}
	deleteOption(item) {
		let tempData = [];
		for (
			let i: number = 0;
			i <
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj['options']?.length;
			i++
		) {
			if (
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj['options'][i].id == item.id
			) {
				this.specialities.push(
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[
						this.layoutService.lastK
					].obj['options'][i],
				);
				this.updateBackUpTask('type', `options`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
				this.updateBackUpTask(
					'oldObject',
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[
						this.layoutService.lastK
					].obj[`options`],
				);
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj['options'].splice(i, 1);
				this.updateBackUpTask(
					'newObject',
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[
						this.layoutService.lastK
					].obj[`options`],
				);
				break;
			}
		}
		this.layoutService.backupId++;
	}
	async preDefindSelect(e) {
		let is_exist: boolean = false;
		for (let i: number = 0; i < this.preDefindAllFields?.length; i++) {
			if (this.preDefindAllFields[i].id === parseInt(e.target.value)) {
				this.updateBackUpTask('type', `preDefinedObj`);
				this.updateBackUpTask('id', this.layoutService.backupId);
				this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
				this.updateBackUpTask(
					'oldObject',
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[
						this.layoutService.lastK
					].obj[`preDefinedObj`],
				);
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj['preDefinedObj'] = this.preDefindAllFields[i];
				this.updateBackUpTask(
					'newObject',
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[
						this.layoutService.lastK
					].obj[`preDefinedObj`],
				);
				break;
			}
		}
		for (let i: number = 0; i < this.PreDefinedList?.length; i++) {
			if (
				this.PreDefinedList[i].objectid ==
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].id
			) {
				is_exist = true;
				this.PreDefinedList[i].predefinedvalue = e.target.value;
			}
		}
		if (!is_exist) {
			this.PreDefinedList.push({
				objectid:
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[
						this.layoutService.lastK
					].id,
				predefinedvalue: e.target.value,
			});
		}
		this.preDefinedInputModel = '';
		this.searchData = this.preDefindAllFields;
		await this.addPredefinedData()
		this.refreshObject();
		this.layoutService.backupId++;
	}
	
	async addPredefinedData(){
		let tempLastI = this.layoutService.lastI;
		let tempLastK = this.layoutService.lastK;
		if (this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefind) {
			const scheduler = this.storageData.getSchedulerInfo();
			let templateObj = this.route.url == '/template-manager/instance' ? scheduler.template_instance:this.layoutService.templateObj;

			if (!templateObj) {
				templateObj = {};
			}
			this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj[
				'value'
			] = 'N/A';
			let userId = this.storageData.getUserId();
			if (
				(this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj.slug == 'next_appt' ||
					this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj.slug == 'last_apt')
					&& this.route.url == '/template-manager/instance'
			) {
				this.requestService
					.sendRequest(
						TemaplateManagerUrlsEnum.getNextAndLastAppointmentAgainstCase,
						'POST',
						REQUEST_SERVERS.schedulerApiUrl1,
						{ case_ids: [templateObj.case_id] },
					)
					.subscribe((response: HttpSuccessResponse) => {
						this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj['value'] = 'N/A';
						if (response.result.data[0]) {
							if (
								this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj.slug == 'next_appt' &&
								response.result.data[0].nextScheduledAppointment != null
							) {
								this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj['value'] = convertDateTimeForRetrieving(
									this.storageData,
									new Date(response.result.data[0].nextScheduledAppointment.startDateTime),
								);
							} else {
								this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj['value'] = convertDateTimeForRetrieving(
									this.storageData,
									new Date(response.result.data[0].lastDoneAppointment.startDateTime),
								);
							}
						}
						if (typeof this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj.value != 'string') {
							this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj.value = this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj.value.toString();
						}
						this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.statement = '<b>' + this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj.title + '</b>: ';
						let target=this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj['value']
						this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.input=target
						this.preDefindAnswerVerify(target,this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.uicomponent_name)						
						this.layoutService.updateComponents();
					});
			} else if(this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj.slug== 'chart_id') {
				this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj['value'] = templateObj[this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj.slug+'_formatted']
			} else if (this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj.slug == 'gender') {
				this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj['value'] = templateObj[this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj.slug].charAt(0).toUpperCase() + templateObj[this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj.slug].slice(1)
			} else if (
				this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj.slug == 'npino'
				&& this.route.url == '/template-manager/instance'
			) {
				this.requestService
					.sendRequest(
						TemaplateManagerUrlsEnum.getNpinoAgainstUser + userId,
						'GET',
						REQUEST_SERVERS.fd_api_url,
					)
					.subscribe((response: HttpSuccessResponse) => {
						if (response.result && response.result.data && response.result.data.npi) {
							this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj['value'] = response.result.data.npi;
							if (typeof this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj.value != 'string') {
								this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj.value = this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj.value.toString();
							}
							this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.statement = '<b>' + this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj.title + '</b>: ';
							let target=this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj['value']
							this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.input=target
							this.preDefindAnswerVerify(target,this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.uicomponent_name)						}
							this.layoutService.updateComponents();
						});
			}
			else if (
				this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj.slug == 'dos_date_of_service'
				&& this.route.url == '/template-manager/instance'
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
								this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj['value'] = date;
								
									if (typeof this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj.value != 'string') {
										this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj.value = this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj.value.toString();
									}
									this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.statement = '<b>' + this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj.title + '</b>: ';
									let target=this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj['value']
									this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.input=target
									this.preDefindAnswerVerify(target,this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.uicomponent_name)							} 
									this.layoutService.updateComponents();
						});
			}
			else if (templateObj[this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj.slug]) {
				this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj['value'] = templateObj[this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj.slug];
			} else {
				this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj['value'] = 'N/A';
			}
			if (
				typeof this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj
					.preDefinedObj.value != 'string'
			) {
				this.layoutService.template.sections[tempLastI].dashboard[
					tempLastK
				].obj.preDefinedObj.value =
					this.layoutService.template.sections[tempLastI].dashboard[
						tempLastK
					].obj.preDefinedObj.value.toString();
			}
			this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.statement =
				'<b>' +
				this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj
					.title +
				'</b>: ';
			this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.instanceStatement =
				'<b>' +
				this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj
					.title +
				'</b>: ';
			this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.input =
				this.layoutService.template.sections[tempLastI].dashboard[
					tempLastK
				].obj.preDefinedObj.value;
			this.subjectService.addAnswerChange({
				target: {
					target: {
						value:
							this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj
								.preDefinedObj['value'],
					},
				},
				uicomponent_name:
					this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.uicomponent_name,
			});
			let target=this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.preDefinedObj['value']
			this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.input=target
			this.preDefindAnswerVerify(target,this.layoutService.template.sections[tempLastI].dashboard[tempLastK].obj.uicomponent_name)
		}
		this.layoutService.updateComponents();
	}

	preDefindAnswerVerify(target:any,uicomponent_name:any) {
		for (let i = 0; i < this.layoutService.template.sections.length; i++) {
			for (let j = 0; j < this.layoutService.template.sections[i].dashboard.length; j++) {
				if (
					this.layoutService.template.sections[i].dashboard[j].obj.type == UI_COMPONENT_TYPES.INPUT &&
					this.layoutService.template.sections[i].dashboard[j].obj.uicomponent_name ===
						uicomponent_name
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
	}

	LinkedSelect(e) {
		this.updateBackUpTask('type', `MultiSelectObj`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`MultiSelectObj`],
		);
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj['MultiSelectObj'] = e;
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj[`MultiSelectObj`],
		);
		this.MultiLinkedInputModel = '';
		this.searchDataNames = this.SearchNames;
		this.layoutService.backupId++;
	}
	GetHeightValue() {
		this.HeightValue = 0;
		if (this.showUIComponents == true) {
			this.HeightValue = this.HeightValue + 1;
		}
		if (this.showSections == true) {
			this.HeightValue = this.HeightValue + 1;
		}
		if (this.showSectionProperties == true) {
			this.HeightValue = this.HeightValue + 1;
		}
		if (this.showInputProperties == true) {
			this.HeightValue = this.HeightValue + 1;
		}
		if (this.showTextProperties == true) {
			this.HeightValue = this.HeightValue + 1;
		}
		if (this.showCombinedProperties == true) {
			this.HeightValue = this.HeightValue + 1;
		}
		if (this.showSwitchProperties == true) {
			this.HeightValue = this.HeightValue + 1;
		}
		if (this.showDropDownProperties == true) {
			this.HeightValue = this.HeightValue + 1;
		}
		if (this.showTableDropDownProperties == true) {
			this.HeightValue = this.HeightValue + 1;
		}
		if (this.showIntellisenseProperties == true) {
			this.HeightValue = this.HeightValue + 1;
		}
		if (this.showIntensityProperties == true) {
			this.HeightValue = this.HeightValue + 1;
		}
		if (this.showIncrementProperties == true) {
			this.HeightValue = this.HeightValue + 1;
		}
		if (this.showDrawingProperties == true) {
			this.HeightValue = this.HeightValue + 1;
		}
		if (this.showCalculationProperties == true) {
			this.HeightValue = this.HeightValue + 1;
		}
		if (this.showTemplateProperties == true) {
			this.HeightValue = this.HeightValue + 1;
		}
		if (this.showCheckBoxProperties == true) {
			this.HeightValue = this.HeightValue + 1;
		}
		if (this.showRadioProperties == true) {
			this.HeightValue = this.HeightValue + 1;
		}
		if (this.showImageLabelProperties == true) {
			this.HeightValue = this.HeightValue + 1;
		}
		if (this.showImageProperties == true) {
			this.HeightValue = this.HeightValue + 1;
		}
		if (this.showLineProperties == true) {
			this.HeightValue = this.HeightValue + 1;
		}
		if (this.showSignatureProperties == true) {
			this.HeightValue = this.HeightValue + 1;
		}
		if (this.showCombinedProperties == true) {
			this.HeightValue = this.HeightValue + 1;
		}
		let x = this.HeightValue;
	}
	backupTask: any = {};
	updateBackUpTask(property, object) {
		if (typeof object == 'object') {
			this.backupTask[`${property}`] = cloneDeep(object);
		} else {
			this.backupTask[`${property}`] = object;
		}
		if (property == 'newObject') {
			if (this.layoutService.backupIndex != -2) {
				if (this.layoutService.backupIndex == -1) {
					this.layoutService.backupIndex = 0;
				}
				this.layoutService.backupQueue.splice(this.layoutService.backupIndex + 1);
			}
			this.layoutService.backupQueue.push(cloneDeep(this.backupTask));
			this.backupTask = {};
			this.layoutService.backupIndex = -2;
			if (this.layoutService.backupQueue?.length > 500) {
				let shiftedTask = this.layoutService.backupQueue.shift();
				while (
					this.layoutService.backupQueue?.length &&
					this.layoutService.backupQueue[0].id == shiftedTask.id
				) {
					this.layoutService.backupQueue.shift();
				}
			}
		}
	}
	updateIndexes(sectionIndex, dashboardIndex, optionIndex, type) {
		this.backupTask[`sectionIndex`] = sectionIndex;
		this.backupTask[`dashboardIndex`] = dashboardIndex;
		this.backupTask[`optionIndex`] = optionIndex;
		this.backupTask[`path`] = type;
	}
	async collapseFunction(props) {
		let check = false;
		if (this.collapsePropertiesTab[`${props}`]) {
			check = true;
		}
		this.collapsePropertiesTab = {
			showTemplateProperties: false,
			showUIComponents: false,
			showSectionProperties: false,
			showSections: false,
			showDropDownProperties: false,
			showTableDropDownProperties: false,
			showTextProperties: false,
			showCombinedProperties: false,
			showSwitchProperties: false,
			showInputProperties: false,
			showIntensityProperties: false,
			showIncrementProperties: false,
			showDrawingProperties: false,
			showCalculationProperties: false,
			showLineProperties: false,
			showSignatureProperties: false,
			showIntellisenseProperties: false,
			showRadioProperties: false,
			showCheckBoxProperties: false,
			showImageLabelProperties: false,
			showImageProperties: false,
		};
		if (!check) {
			this.collapsePropertiesTab[`${props}`] = true;
		}
	}
	lineSelectedProp = 'Size';
	lineSize(e) {
		this.setUIProperty(
			this.layoutService.lastI,
			this.layoutService.lastK,
			'size',
			e.target.value,
			true,
		);
		this.changeDetector.detectChanges();
	}
	lineType(e) {
		this.setUIProperty(
			this.layoutService.lastI,
			this.layoutService.lastK,
			'typeLine',
			e.target.value,
			true,
		);
		this.changeDetector.detectChanges();
	}
	lineColor(color) {
		this.setUIProperty(this.layoutService.lastI, this.layoutService.lastK, 'color', color, true);
		this.changeDetector.detectChanges();
	}
	lineHorizontal(e) {
		this.setUIProperty(this.layoutService.lastI, this.layoutService.lastK, 'horizontal', e, true);
		this.changeDetector.detectChanges();
	}
	selectLineProperty(params) {
		this.lineSelectedProp = params;
		this.changeDetector.detectChanges();
	}
	carryForwardSelect(event, carry_id, section_id) {
		let tempId = event.target.value;
		let tempSection: any = {};
		for (let z: number = 0; z < this.layoutService.template.sections?.length; z++) {
			if (this.layoutService.template.sections[z].section_id == section_id) {
				tempSection = this.layoutService.template.sections[z];
			}
		}
		for (let i: number = 0; i < tempSection.carryForward.carryForwardSections?.length; i++) {
			if (event.target.value == i) {
				tempSection.carryForward.cfList[i].carryCheck = true;
			} else {
				tempSection.carryForward.cfList[i].carryCheck = false;
			}
		}
		this.undoCarryInstance(carry_id, section_id);
	}
	carryForwardPopup: any = {};
	public viewCarryForwardPopup(section_id) {
		this.carryForwardPopup = {};
		let temp_section_id = -1;
		let tempSection;
		let tempCarrySection: any = {};
		for (let z: number = 0; z < this.layoutService.template.sections?.length; z++) {
			if (this.layoutService.template.sections[z].section_id == section_id) {
				tempCarrySection = this.layoutService.template.sections[z];
			}
		}
		for (let i: number = 0; i < tempCarrySection.carryForward.cfList?.length; i++) {
			if (tempCarrySection.carryForward.cfList[i].carryCheck) {
				temp_section_id = tempCarrySection.carryForward.cfList[i].id;
				tempSection = tempCarrySection.carryForward.carryForwardSections[i];
			}
		}
		const data = cloneDeep(tempSection.dashboard);
		if (typeof tempSection.options === 'string') {
			tempSection.options = JSON.parse(tempSection.options);
		}
		for (let i: number = 0; i < data?.length; i++) {
			this.componentsService.push({
				id: data[i].id,
				componentRef: data[i].obj.type,
			});
		}
		this.carryForwardPopup = { options: tempSection.options, dashboard: data };
	}
	applyCarryForward(event, section_id) {
		let temp_section_id = -1;
		let tempCarrySection: any = {};
		let tempSection;
		for (let z: number = 0; z < this.layoutService.template.sections?.length; z++) {
			if (this.layoutService.template.sections[z].section_id == section_id) {
				tempCarrySection = this.layoutService.template.sections[z];
			}
		}
		for (let i: number = 0; i < tempCarrySection.carryForward.cfList?.length; i++) {
			if (tempCarrySection.carryForward.cfList[i].carryCheck) {
				temp_section_id = tempCarrySection.carryForward.cfList[i].id;
				tempSection = tempCarrySection.carryForward.carryForwardSections[i];
			}
		}
		for (let z: number = 0; z < this.layoutService.template.sections?.length; z++) {
			if (this.layoutService.template.sections[z].section_id == section_id) {
				this.layoutService.template.sections[z].isCarried = true;
				this.layoutService.template.sections[z].carryForward.carryForwardApplied = true;
				for (let x: number = 0; x < this.layoutService.template.sections[z].dashboard?.length; x++) {
					for (let c: number = 0; c < tempSection.dashboard?.length; c++) {
						if (
							tempSection.dashboard[c].obj.uicomponent_name ==
							this.layoutService.template.sections[z].dashboard[x].obj.carry_uicomponent_name
						) {
							if (this.layoutService.template.sections[z].dashboard[x].obj.type == this.uicomponentTypes.INPUT) {
								this.layoutService.template.sections[z].dashboard[x].obj.input =
									tempSection.dashboard[c].obj.input;
								this.layoutService.template.sections[z].dashboard[x].obj.answers =
									tempSection.dashboard[c].obj.answers;
								for (let answer of this.layoutService.template.sections[z].dashboard[x].obj
									.answers) {
									delete answer.answer_id;
								}
							} else if (
								this.layoutService.template.sections[z].dashboard[x].obj.type == this.uicomponentTypes.INTENSITY &&
								tempSection.dashboard[c].obj.answers[0]
							) {
								if (
									tempSection.dashboard[c].obj.answers[0].answer <
									this.layoutService.template.sections[z].dashboard[x].obj.options.floor
								) {
									tempSection.dashboard[c].obj.answers[0].answer =
										this.layoutService.template.sections[z].dashboard[x].obj.options.floor;
								}
								if (
									tempSection.dashboard[c].obj.answers[0].answer >
									this.layoutService.template.sections[z].dashboard[x].obj.options.ceil
								) {
									tempSection.dashboard[c].obj.answers[0].answer =
										this.layoutService.template.sections[z].dashboard[x].obj.options.ceil;
								}
								this.layoutService.template.sections[z].dashboard[x].obj.value =
									tempSection.dashboard[c].obj.answers[0].answer;
								this.layoutService.template.sections[z].dashboard[x].obj.answers[0].answer =
									tempSection.dashboard[c].obj.answers[0].answer;
							} else if (
								this.layoutService.template.sections[z].dashboard[x].obj.type == this.uicomponentTypes.INCREMENT &&
								tempSection.dashboard[c].obj.answers[0]
							) {
								if (
									tempSection.dashboard[c].obj.answers[0].answer <
									this.layoutService.template.sections[z].dashboard[x].obj.options.floor
								) {
									tempSection.dashboard[c].obj.answers[0].answer =
										this.layoutService.template.sections[z].dashboard[x].obj.options.floor;
								}
								if (
									tempSection.dashboard[c].obj.answers[0].answer >
									this.layoutService.template.sections[z].dashboard[x].obj.options.ceil
								) {
									tempSection.dashboard[c].obj.answers[0].answer =
										this.layoutService.template.sections[z].dashboard[x].obj.options.ceil;
								}
								this.layoutService.template.sections[z].dashboard[x].obj.value =
									tempSection.dashboard[c].obj.answers[0].answer;
								this.layoutService.template.sections[z].dashboard[x].obj.answers[0].answer =
									tempSection.dashboard[c].obj.answers[0].answer;
							} else if (
								this.layoutService.template.sections[z].dashboard[x].obj.type == this.uicomponentTypes.RADIO ||
								(this.layoutService.template.sections[z].dashboard[x].obj.type == this.uicomponentTypes.DROPDOWN &&
									!this.layoutService.template.sections[z].dashboard[x].obj.isMultiSelect)
							) {
								for (
									let b: number = 0;
									b < this.layoutService.template.sections[z].dashboard[x].obj.options?.length;
									b++
								) {
									for (let n: number = 0; n < tempSection.dashboard[c].obj.options?.length; n++) {
										if (
											tempSection.dashboard[c].obj.options[n].label ==
											this.layoutService.template.sections[z].dashboard[x].obj.options[b].label
										) {
											let previousCheck =
												this.layoutService.template.sections[z].dashboard[x].obj.options[b]
													.selected;
											this.layoutService.template.sections[z].dashboard[x].obj.options[b].selected =
												tempSection.dashboard[c].obj.options[n].selected;
											if (tempSection.dashboard[c].obj.options[n].selected) {
												this.layoutService.template.sections[z].dashboard[x].obj.answers[0] =
													tempSection.dashboard[c].obj.answers[0];
												if (this.layoutService.template.sections[z].dashboard[x].obj.answers[0]) {
													delete this.layoutService.template.sections[z].dashboard[x].obj.answers[0]
														.answer_id;
												}
												if (
													this.layoutService.template.sections[z].dashboard[x].obj.options[b]
														.selectedLinkSection &&
													this.layoutService.template.sections[z].dashboard[x].obj.options[b]
														.selectedLinkSection.id &&
													!previousCheck
												) {
													for (
														let cd: number = 0;
														cd < this.layoutService.template.sections?.length;
														cd++
													) {
														if (
															this.layoutService.template.sections[cd].section_id ==
															this.layoutService.template.sections[z].dashboard[x].obj.options[b]
																.selectedLinkSection.id
														) {
															this.layoutService.template.sections[cd].selected_linked_component++;
														}
													}
												}
											}
										}
									}
								}
							} else if (
								this.layoutService.template.sections[z].dashboard[x].obj.type == this.uicomponentTypes.SWITCH
							) {
								for (
									let b: number = 0;
									b < this.layoutService.template.sections[z].dashboard[x].obj.options?.length;
									b++
								) {
									for (let n: number = 0; n < tempSection.dashboard[c].obj.options?.length; n++) {
										if (
											tempSection.dashboard[c].obj.options[n].label ==
											this.layoutService.template.sections[z].dashboard[x].obj.options[b].label
										) {
											let previousCheck =
												this.layoutService.template.sections[z].dashboard[x].obj.options[b]
													.selected;
											this.layoutService.template.sections[z].dashboard[x].obj.options[b].selected =
												tempSection.dashboard[c].obj.options[n].selected;
											if (tempSection.dashboard[c].obj.options[n].selected) {
												this.layoutService.template.sections[z].dashboard[x].obj.answers[0] =
													tempSection.dashboard[c].obj.answers[0];
												if (this.layoutService.template.sections[z].dashboard[x].obj.answers[0]) {
													delete this.layoutService.template.sections[z].dashboard[x].obj.answers[0]
														.answer_id;
												}
												if (
													this.layoutService.template.sections[z].dashboard[x].obj.options[b]
														.selectedLinkSection &&
													this.layoutService.template.sections[z].dashboard[x].obj.options[b]
														.selectedLinkSection.id &&
													!previousCheck
												) {
													for (
														let cd: number = 0;
														cd < this.layoutService.template.sections?.length;
														cd++
													) {
														if (
															this.layoutService.template.sections[cd].section_id ==
															this.layoutService.template.sections[z].dashboard[x].obj.options[b]
																.selectedLinkSection.id
														) {
															this.layoutService.template.sections[cd].selected_linked_component++;
														}
													}
												}
											}
										}
									}
								}
							} else if (
								this.layoutService.template.sections[z].dashboard[x].obj.type == this.uicomponentTypes.CHECKBOX ||
								(this.layoutService.template.sections[z].dashboard[x].obj.type == this.uicomponentTypes.DROPDOWN &&
									this.layoutService.template.sections[z].dashboard[x].obj.isMultiSelect)
							) {
								this.layoutService.template.sections[z].dashboard[x].obj.answers = [];
								this.layoutService.template.sections[z].dashboard[x].obj.selectedItems = [];
								for (
									let newSecIndex: number = 0;
									newSecIndex < this.layoutService.template.sections?.length;
									newSecIndex++
								) {
									for (
										let newUIIndex: number = 0;
										newUIIndex < this.layoutService.template.sections[newSecIndex].dashboard?.length;
										newUIIndex++
									) {
										if (
											this.layoutService.template.sections[newSecIndex].dashboard[newUIIndex].obj
												.MultiSelectObj &&
											this.layoutService.template.sections[newSecIndex].dashboard[newUIIndex].obj
												.MultiSelectObj.objectid ==
												this.layoutService.template.sections[z].dashboard[x].id
										) {
											this.layoutService.template.sections[newSecIndex].dashboard[
												newUIIndex
											].obj.options = [];
											this.layoutService.template.sections[newSecIndex].dashboard[
												newUIIndex
											].obj.selectedItems = [];
											this.layoutService.template.sections[newSecIndex].dashboard[
												newUIIndex
											].obj.answers = [];
										}
									}
								}
								for (
									let b: number = 0;
									b < this.layoutService.template.sections[z].dashboard[x].obj.options?.length;
									b++
								) {
									for (let n: number = 0; n < tempSection.dashboard[c].obj.options?.length; n++) {
										if (
											tempSection.dashboard[c].obj.options[n].label ==
											this.layoutService.template.sections[z].dashboard[x].obj.options[b].label
										) {
											let previousCheck =
												this.layoutService.template.sections[z].dashboard[x].obj.options[b]
													.selected;
											this.layoutService.template.sections[z].dashboard[x].obj.options[b].selected =
												tempSection.dashboard[c].obj.options[n].selected;
											if (tempSection.dashboard[c].obj.options[n].selected) {
												if (
													this.layoutService.template.sections[z].dashboard[x].obj.type ==
													this.uicomponentTypes.DROPDOWN
												) {
													this.layoutService.template.sections[z].dashboard[
														x
													].obj.selectedItems.push({
														id: this.layoutService.template.sections[z].dashboard[x].obj.options[b]
															.id,
														label:
															this.layoutService.template.sections[z].dashboard[x].obj.options[b]
																.label,
													});
												}
												if (
													!tempSection.dashboard[c].obj.options[n].showOption &&
													!tempSection.dashboard[c].obj.options[n].linkedStatementCheck &&
													tempSection.dashboard[c].obj.options[n].input
												) {
													this.layoutService.template.sections[z].dashboard[x].obj.answers.push({
														answer: tempSection.dashboard[c].obj.options[n].instanceInputValue,
														id: tempSection.dashboard[c].obj.options[n].id,
													});
												} else if (tempSection.dashboard[c].obj.options[n].linkedStatementCheck) {
													let tempAnswer = tempSection.dashboard[c].obj.options[n].linkedStatement;
													tempAnswer = this.layoutService.checkSingularPlural(
														tempSection.dashboard[c].obj,
														n,
														tempAnswer,
													);
													tempAnswer = tempAnswer.replace(
														/#input/g,
														tempSection.dashboard[c].obj.options[n].label,
													);
													tempAnswer = tempAnswer.replace(
														/#comments/g,
														tempSection.dashboard[c].obj.options[n].instanceInputValue,
													);
													this.layoutService.template.sections[z].dashboard[x].obj.answers.push({
														answer: tempAnswer,
														id: tempSection.dashboard[c].obj.options[n].id,
													});
												} else {
													this.layoutService.template.sections[z].dashboard[x].obj.answers.push({
														answer: tempSection.dashboard[c].obj.options[n].label,
														id: tempSection.dashboard[c].obj.options[n].id,
													});
												}
												if (
													tempSection.dashboard[c].obj.options[n].input &&
													tempSection.dashboard[c].obj.options[n].showOption &&
													!tempSection.dashboard[c].obj.options[n].linkedStatementCheck
												) {
													this.layoutService.template.sections[z].dashboard[x].obj.answers[
														this.layoutService.template.sections[z].dashboard[x].obj.answers
															?.length - 1
													].answer =
														this.layoutService.template.sections[z].dashboard[x].obj.answers[
															this.layoutService.template.sections[z].dashboard[x].obj.answers
																?.length - 1
														].answer +
														' ' +
														this.layoutService.template.sections[z].dashboard[x].obj.options[b]
															.instanceInputValue;
												}
												if (
													this.layoutService.template.sections[z].dashboard[x].obj.options[b]
														.selectedLinkSection &&
													this.layoutService.template.sections[z].dashboard[x].obj.options[b]
														.selectedLinkSection.id &&
													!previousCheck
												) {
													for (
														let cd: number = 0;
														cd < this.layoutService.template.sections?.length;
														cd++
													) {
														if (
															this.layoutService.template.sections[cd].section_id ==
															this.layoutService.template.sections[z].dashboard[x].obj.options[b]
																.selectedLinkSection.id
														) {
															this.layoutService.template.sections[cd].selected_linked_component++;
														}
													}
												}
											}
										}
									}
								}
							} else if (
								this.layoutService.template.sections[z].dashboard[x].obj.type == 'intellisense'
							) {
								this.layoutService.template.sections[z].dashboard[x].obj.answers = [];
								this.layoutService.template.sections[z].dashboard[x].obj.selectedItems = [];
								for (
									let b: number = 0;
									b < this.layoutService.template.sections[z].dashboard[x].obj.options?.length;
									b++
								) {
									for (let n: number = 0; n < tempSection.dashboard[c].obj.options?.length; n++) {
										if (
											tempSection.dashboard[c].obj.options[n].label ==
											this.layoutService.template.sections[z].dashboard[x].obj.options[b].label
										) {
											let previousCheck =
												this.layoutService.template.sections[z].dashboard[x].obj.options[b]
													.selected;
											this.layoutService.template.sections[z].dashboard[x].obj.options[b].selected =
												tempSection.dashboard[c].obj.options[n].selected;
											if (tempSection.dashboard[c].obj.options[n].selected) {
												if (
													this.layoutService.template.sections[z].dashboard[x].obj.options[b]
														.selectedLinkSection &&
													this.layoutService.template.sections[z].dashboard[x].obj.options[b]
														.selectedLinkSection.id &&
													!previousCheck
												) {
													for (
														let cd: number = 0;
														cd < this.layoutService.template.sections?.length;
														cd++
													) {
														if (
															this.layoutService.template.sections[cd].section_id ==
															this.layoutService.template.sections[z].dashboard[x].obj.options[b]
																.selectedLinkSection.id
														) {
															this.layoutService.template.sections[cd].selected_linked_component++;
														}
													}
												}
												this.layoutService.template.sections[z].dashboard[x].obj.answers.push(
													this.layoutService.template.sections[z].dashboard[x].obj.options[b],
												);
												for (
													let ab: number = 0;
													ab < this.layoutService.template.sections[z].dashboard[x].obj.data?.length;
													ab++
												) {
													if (
														this.layoutService.template.sections[z].dashboard[x].obj.data[ab]
															.label ==
														this.layoutService.template.sections[z].dashboard[x].obj.options[b]
															.label
													) {
														this.layoutService.template.sections[z].dashboard[x].obj.data.splice(
															ab,
															1,
														);
														break;
													}
												}
												for (
													let ab: number = 0;
													ab <
													this.layoutService.template.sections[z].dashboard[x].obj.searchData
														?.length;
													ab++
												) {
													if (
														this.layoutService.template.sections[z].dashboard[x].obj.searchData[ab]
															.label ==
														this.layoutService.template.sections[z].dashboard[x].obj.options[b]
															.label
													) {
														this.layoutService.template.sections[z].dashboard[
															x
														].obj.searchData.splice(ab, 1);
														break;
													}
												}
											}
										}
									}
								}
							}
							break;
						}
					}
				}
			}
		}
		for (
			let mainSectionIndex: number = 0;
			mainSectionIndex < this.layoutService.template.sections?.length;
			mainSectionIndex++
		) {
			if (this.layoutService.template.sections[mainSectionIndex].section_id == section_id) {
				for (
					let mainDashboardIndex: number = 0;
					mainDashboardIndex <
					this.layoutService.template.sections[mainSectionIndex].dashboard?.length;
					mainDashboardIndex++
				) {
					for (let x: number = 0; x < this.layoutService.template.sections?.length; x++) {
						for (
							let r: number = 0;
							r < this.layoutService.template.sections[x].dashboard?.length;
							r++
						) {
							if (
								this.layoutService.template.sections[x].dashboard[r].obj.MultiSelectObj &&
								this.layoutService.template.sections[x].dashboard[r].obj.MultiSelectObj.objectid ==
									this.layoutService.template.sections[mainSectionIndex].dashboard[
										mainDashboardIndex
									].id
							) {
								for (let option of this.layoutService.template.sections[mainSectionIndex].dashboard[
									mainDashboardIndex
								].obj?.options) {
									if (option.selected == true) {
										let tempOption = cloneDeep(option);
										tempOption.selected = false;
										tempOption.link = false;
										delete tempOption.selectedLinkSection;
										this.layoutService.template.sections[x].dashboard[r].obj.options.push(
											tempOption,
										);
										let cloneOptions = JSON.parse(
											JSON.stringify(
												this.layoutService.template.sections[x].dashboard[r].obj.options,
											),
										);
										this.layoutService.template.sections[x].dashboard[r].obj.options = JSON.parse(
											JSON.stringify(cloneOptions),
										);
									}
								}
							}
						}
					}
				}
			}
		}
		this.layoutService.updateComponents();
		let temp: number = 0;
		if (
			this.topLevelSections[this.topLevelSections?.length - 1].boundSectionStatement == DOCTOR_EVALUATION_SECTION_TYPES.INSTANCE_PREVIEW ||
			this.topLevelSections[this.topLevelSections?.length - 1].boundSectionStatement == DOCTOR_EVALUATION_SECTION_TYPES.EVALUATION_PREVIEW
		) {
			temp = this.topLevelSections[this.topLevelSections?.length - 1];
		}
		this.topLevelSections = [];
		for (let l: number = 0; l < this.layoutService.template.sections?.length; l++) {
			if (this.layoutService.template.sections[l].parentId === 0) {
				if (
					(this.layoutService.template.sections[l].linked_component == 0 ||
						this.layoutService.template.sections[l].selected_linked_component ===
							this.layoutService.template.sections[l].linked_component) &&
					!this.layoutService.template.sections[l].hideInInstance
				) {
					this.topLevelSections.push(this.layoutService.template.sections[l]);
				}
			}
		}
		if (temp) {
			this.topLevelSections.push(temp);
		}
		if (this.subLevelIndex != -1) {
			this.instanceSubSectionChange(this.layoutService.template.sections[this.subLevelIndex]);
		} else {
			this.instanceSectionChange(this.layoutService.template.sections[this.topLevelIndex]);
		}
	}
	getCarryInstance(carry_id, section_id) {
		let tempSection: any = {};
		for (let z: number = 0; z < this.layoutService.template.sections?.length; z++) {
			if (this.layoutService.template.sections[z].section_id == section_id) {
				tempSection = this.layoutService.template.sections[z];
			}
		}
		tempSection.carryForward.carryForwardSections = [];
		tempSection.carryForward.cfList = [];
		tempSection.carryForward.carryForwardCheck = false;
		this.requestService
			.sendRequest(
				TemaplateManagerUrlsEnum.getCarryInstance,
				'POST',
				REQUEST_SERVERS.templateManagerUrl,
				{
					section_id: carry_id,
					patient_id: parseInt(this.templateObjInfo.chart_id),
					case_id: this.templateObjInfo.case_id,
					visit_type_id: this.visit_type_idd,
					appointment_date: convertDateTimeForSending(
						this.storageData,
						new Date(this.templateObjInfo.current_aptdate_time),
					),
				},
			)
			.subscribe(
				(res: any) => {
					if (res.data?.length) {
						tempSection.carryForward.cfList = [];
						for (let i: number = 0; i < res.data?.length; i++) {
							if (this.locations?.length) {
								for (let j: number = 0; j < this.locations?.length; j++) {
									if (res.data[i].location_id == this.locations[j].id) {
										res.data[i].location_name = this.locations[j].name;
										break;
									}
								}
							}
							for (let j: number = 0; j < this.specialities?.length; j++) {
								if (res.data[i].speciality_id == this.specialities[j].id) {
									res.data[i].speciality_name = this.specialities[j].name;
									for (let k: number = 0; k < this.specialities[j].visit_types?.length; k++) {
										if (res.data[i].visit_type_id == this.specialities[j].visit_types[k].id) {
											res.data[i].visit_type_name = this.specialities[j].visit_types[k].name;
											break;
										}
									}
									break;
								}
							}
							tempSection.isCarried = true;
							tempSection.carryForward.carryForwardCheck = true;
							tempSection.carryForward.carryForwardSections.push(res.data[i]);
							if (i == 0) {
								tempSection.carryForward.cfList.push({
									carryCheck: true,
									value:
										res.data[i].location_name +
										'-' +
										res.data[i].speciality_name +
										'-' +
										res.data[i].visit_type_name,
									id: res.data[i].section_id,
								});
							} else {
								tempSection.carryForward.cfList.push({
									carryCheck: false,
									value:
										res.data[i].location_name +
										'-' +
										res.data[i].speciality_name +
										'-' +
										res.data[i].visit_type_name,
									id: res.data[i].section_id,
								});
							}
						}
					}
					this.changeDetector.detectChanges();
				},
				(err) => {
					console.log(err);
					this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
				},
			);
	}
	stopLoader() {
		this.layoutService.isLoaderPending.next(false);
		this.changeDetector.detectChanges();
	}
	undoCarryInstance(carry_id, section_id) {
		for (let z: number = 0; z < this.layoutService.template.sections?.length; z++) {
			if (this.layoutService.template.sections[z].section_id == section_id) {
				this.layoutService.template.sections[z].carryForward.carryForwardApplied = false;
				for (let x: number = 0; x < this.layoutService.template.sections[z].dashboard?.length; x++) {
					if (this.layoutService.template.sections[z].dashboard[x].obj.type == this.uicomponentTypes.INPUT) {
						this.layoutService.template.sections[z].dashboard[x].obj.input = '';
						this.layoutService.template.sections[z].dashboard[x].obj.answers = [];
					} else if (this.layoutService.template.sections[z].dashboard[x].obj.type == this.uicomponentTypes.INTENSITY) {
						this.layoutService.template.sections[z].dashboard[x].obj.value =
							this.layoutService.template.sections[z].dashboard[x].obj.options.floor;
						this.layoutService.template.sections[z].dashboard[x].obj.answers.push({
							answer: this.layoutService.template.sections[z].dashboard[x].obj.options.floor,
						});
					} else if (this.layoutService.template.sections[z].dashboard[x].obj.type == this.uicomponentTypes.INCREMENT) {
						this.layoutService.template.sections[z].dashboard[x].obj.value =
							this.layoutService.template.sections[z].dashboard[x].obj.options.floor;
						this.layoutService.template.sections[z].dashboard[x].obj.answers.push({
							answer: this.layoutService.template.sections[z].dashboard[x].obj.options.floor,
						});
					} else if (
						this.layoutService.template.sections[z].dashboard[x].obj.type == this.uicomponentTypes.RADIO ||
						this.layoutService.template.sections[z].dashboard[x].obj.type == this.uicomponentTypes.SWITCH ||
						this.layoutService.template.sections[z].dashboard[x].obj.type == this.uicomponentTypes.DROPDOWN ||
						this.layoutService.template.sections[z].dashboard[x].obj.type == this.uicomponentTypes.CHECKBOX
					) {
						if (this.layoutService.template.sections[z].dashboard[x].obj.selectedItems) {
							this.layoutService.template.sections[z].dashboard[x].obj.selectedItems = [];
						}
						this.layoutService.template.sections[z].dashboard[x].obj.answers = [];
						for (
							let b: number = 0;
							b < this.layoutService.template.sections[z].dashboard[x].obj.options?.length;
							b++
						) {
							let previousCheck =
								this.layoutService.template.sections[z].dashboard[x].obj.options[b].selected;
							this.layoutService.template.sections[z].dashboard[x].obj.options[b].selected = false;
							if (
								this.layoutService.template.sections[z].dashboard[x].obj.options[b]
									.selectedLinkSection &&
								this.layoutService.template.sections[z].dashboard[x].obj.options[b]
									.selectedLinkSection.id &&
								previousCheck
							) {
								for (let cd: number = 0; cd < this.layoutService.template.sections?.length; cd++) {
									if (
										this.layoutService.template.sections[cd].section_id ==
										this.layoutService.template.sections[z].dashboard[x].obj.options[b]
											.selectedLinkSection.id
									) {
										this.layoutService.template.sections[cd].selected_linked_component--;
									}
								}
							}
						}
					} else if (
						this.layoutService.template.sections[z].dashboard[x].obj.type == 'intellisense'
					) {
						this.layoutService.template.sections[z].dashboard[x].obj.answers = [];
						this.layoutService.template.sections[z].dashboard[x].obj.selectedItems = [];
						for (
							let b: number = 0;
							b < this.layoutService.template.sections[z].dashboard[x].obj.options?.length;
							b++
						) {
							let previousCheck =
								this.layoutService.template.sections[z].dashboard[x].obj.options[b].selected;
							this.layoutService.template.sections[z].dashboard[x].obj.options[b].selected = false;
							if (
								this.layoutService.template.sections[z].dashboard[x].obj.options[b]
									.selectedLinkSection &&
								this.layoutService.template.sections[z].dashboard[x].obj.options[b]
									.selectedLinkSection.id &&
								previousCheck
							) {
								for (let cd: number = 0; cd < this.layoutService.template.sections?.length; cd++) {
									if (
										this.layoutService.template.sections[cd].section_id ==
										this.layoutService.template.sections[z].dashboard[x].obj.options[b]
											.selectedLinkSection.id
									) {
										this.layoutService.template.sections[cd].selected_linked_component--;
									}
								}
							}
							this.layoutService.template.sections[z].dashboard[x].obj.searchData = cloneDeep(
								this.layoutService.template.sections[z].dashboard[x].obj.options,
							);
							this.layoutService.template.sections[z].dashboard[x].obj.data = cloneDeep(
								this.layoutService.template.sections[z].dashboard[x].obj.options,
							);
						}
					}
				}
			}
		}
		for (
			let mainSectionIndex: number = 0;
			mainSectionIndex < this.layoutService.template.sections?.length;
			mainSectionIndex++
		) {
			if (this.layoutService.template.sections[mainSectionIndex].section_id == section_id) {
				for (
					let mainDashboardIndex: number = 0;
					mainDashboardIndex <
					this.layoutService.template.sections[mainSectionIndex].dashboard?.length;
					mainDashboardIndex++
				) {
					for (let x: number = 0; x < this.layoutService.template.sections?.length; x++) {
						for (
							let r: number = 0;
							r < this.layoutService.template.sections[x].dashboard?.length;
							r++
						) {
							if (
								this.layoutService.template.sections[x].dashboard[r].obj.MultiSelectObj &&
								this.layoutService.template.sections[x].dashboard[r].obj.MultiSelectObj.objectid ==
									this.layoutService.template.sections[mainSectionIndex].dashboard[
										mainDashboardIndex
									].id
							) {
								this.layoutService.template.sections[x].dashboard[r].obj.options = [];
								let cloneOptions = JSON.parse(
									JSON.stringify(this.layoutService.template.sections[x].dashboard[r].obj.options),
								);
								this.layoutService.template.sections[x].dashboard[r].obj.options = JSON.parse(
									JSON.stringify(cloneOptions),
								);
							}
						}
					}
				}
			}
		}
		this.layoutService.updateComponents();
		let temp: number = 0;
		if (
			this.topLevelSections[this.topLevelSections?.length - 1].boundSectionStatement == DOCTOR_EVALUATION_SECTION_TYPES.INSTANCE_PREVIEW ||
			this.topLevelSections[this.topLevelSections?.length - 1].boundSectionStatement == DOCTOR_EVALUATION_SECTION_TYPES.EVALUATION_PREVIEW
		) {
			temp = this.topLevelSections[this.topLevelSections?.length - 1];
		}
		this.topLevelSections = [];
		for (let l: number = 0; l < this.layoutService.template.sections?.length; l++) {
			if (this.layoutService.template.sections[l].parentId === 0) {
				if (
					(this.layoutService.template.sections[l].linked_component == 0 ||
						this.layoutService.template.sections[l].selected_linked_component ===
							this.layoutService.template.sections[l].linked_component) &&
					!this.layoutService.template.sections[l].hideInInstance
				) {
					this.topLevelSections.push(this.layoutService.template.sections[l]);
				}
			}
		}
		if (temp) {
			this.topLevelSections.push(temp);
		}
		if (this.subLevelIndex != -1) {
			this.instanceSubSectionChange(this.layoutService.template.sections[this.subLevelIndex]);
		} else {
			this.instanceSectionChange(this.layoutService.template.sections[this.topLevelIndex]);
		}
		this.changeDetector.detectChanges();
	}
	infoInstanceFunc() {
		this.infoInstance.check = true;
		this.infoInstance.lastI = this.layoutService.lastI;
		this.infoInstance.lastK = this.layoutService.lastK;
		this.invertUIProperty(this.layoutService.lastI, this.layoutService.lastK, 'info', true);
		if (
			!this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.info
		) {
			this.infoInstance.check = false;
		}
		this.layoutService.backupId++;
	}
	carryPropChangeSection(e) {
		e.preventDefault();
		// this.coolDialogs
		// 	.confirm(
		// 		'All information will be lost related to carry section. Do you wish to remove the carry forward link ?',
		// 		{
		// 			okButtonText: 'OK',
		// 			cancelButtonText: 'Cancel',
		// 		},
		// 	)
		this.bsModalRef = this.modalServiceDialog.show(ConfirmationDialogComponent, {
			initialState: {
			  message: 'All information will be lost related to carry section. Do you wish to remove the carry forward link ?'
			},
			class: 'modal-dialog-centered'
		  });
		  this.bsModalRef.content.result
			.subscribe((response) => {
				if (response == true) {
					this.layoutService.template.sections[
						this.layoutService.lastI
					].carryForward.isCarryForward = false;
				}
				this.changeDetector.detectChanges();
			});
		this.changeDetector.detectChanges();
	}
	users = [];
	selectedUsers = [];
	selectUserFilter(event) {
		if (event == '') {
			this.selectedUsers = [];
		} else {
			if (event.target.value) {
				this.requestService
					.sendRequest(
						TemaplateManagerUrlsEnum.users + event.target.value,
						'GET',
						REQUEST_SERVERS.fd_api_url,
					)
					.subscribe(
						(res: any) => {
							this.users = res.result.data;
							for (let i: number = 0; i < this.users?.length; i++) {
								this.users[i]['name'] = this.users[i].middle_name
									? this.users[i].first_name +
									  ' ' +
									  this.users[i].middle_name +
									  ' ' +
									  this.users[i].last_name
									: this.users[i].first_name + ' ' + this.users[i].last_name;
							}
							this.changeDetector.detectChanges();
						},
						(err) => {
							console.log(err);
							this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
							this.stopLoader();
						},
					);
			}
		}
	}
	public allSpec = [];
	public allClinicIds: any = [];
	public allClinic = [];
	public visitType = [];
	public caseType = [];
	public visitTypeFilter: string = 'Visit Type';
	public caseTypeFilter: string = 'Case Type';
	myForm: FormGroup;
	private createForm() {
		this.myForm = this.fb.group({
			clinicName: ['Any', Validators.required],
			specialityName: ['Any', Validators.required],
			doctorName: ['Any', Validators.required],
		});
	}
	public getAllAppointmentType() {
		this.requestService
			.sendRequest(
				DoctorCalendarUrlsEnum.getAppointmentTypes,
				'GET',
				REQUEST_SERVERS.schedulerApiUrl1,
			)
			.subscribe(
				(res: HttpSuccessResponse) => {
					for (let i: number = 0, j = 1; i < res.result.data?.length; i++, j++) {
						this.visitType[i] = res.result.data[i];
					}
					this.visitTypeFilter = this.visitType[0] ? this.visitType[0].description: '';
					this.visitType = [...this.visitType];
				},
				(err) => {
					console.log(err);
					this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
					this.stopLoader();
				},
			);
	}
	public getSpeciality() {
		this.requestService
			.sendRequest(
				AssignSpecialityUrlsEnum.GetUserInfoBySpecialities,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				{ per_page: 10000, page: 1, user_id: this.storageData.getUserId() },
			)
			.subscribe(
				(response: HttpSuccessResponse) => {
					for (let i: number = 0, j = 1; i < response?.result?.data?.docs?.length; i++, j++) {
						this.allSpec[i] = response.result.data.docs[i];
					}
					this.allSpec = [...this.allSpec];
					this.myForm.controls['specialityName'].setValue(this.allSpec[0]?this.allSpec[0].id:0);
				},
				(err) => {
					console.log(err);
					this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
					this.stopLoader();
				},
			);
	}
	public getClinic() {
		this.allClinicIds = this.storageData.getFacilityLocations();
		this.requestService
			.sendRequest(
				AssignSpecialityUrlsEnum.getUserInfobyFacility,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				{
					user_id: this.storageData.getUserId(),
					facility_location_ids: this.allClinicIds,
					per_page: this.allClinicIds?.length,
					page: 1,
				},
			)
			.subscribe(
				(response: HttpSuccessResponse) => {
					for (let i: number = 0, j = 1; i < response?.result?.data?.docs?.length; i++, j++) {
						this.allClinic[i] = response.result.data.docs[i];
					}
					this.allClinic = [...this.allClinic];
					this.myForm.controls['clinicName'].setValue(this.allClinic[0]?this.allClinic[0].id:0);
				},
				(err) => {
					console.log(err);
					this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
					this.stopLoader();
				},
			);
	}
	public getCaseType() {
		this.requestService
			.sendRequest(AddToBeSchedulledUrlsEnum.caseTypes, 'GET', REQUEST_SERVERS.kios_api_path)
			.subscribe(
				(response: any) => {
					for (let i: number = 0, j = 1; i < response.result?.data?.length; i++, j++) {
						this.caseType[i] = response.result.data[i];
					}
					this.caseTypeFilter = this.caseType[0] ? this.caseType[0].name : '';
					this.caseType = [...this.caseType];
				},
				(err) => {
					console.log(err);
					this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
					this.stopLoader();
				},
			);
	}
	public filterData(check) {
		if (!check) {
			this.layoutService.caseTypeSelectedMultiple = null;
			this.layoutService.visitStatusSelectedMultiple = null;
			this.layoutService.specSelectedMultiple = null;
			this.layoutService.clinicSelectedMultiple = null;
		}
		this.requestService
			.sendRequest(
				TemaplateManagerUrlsEnum.headerFooterFilter,
				'POST',
				REQUEST_SERVERS.templateManagerUrl,
				{
					speciality_id: this.layoutService.specSelectedMultiple,
					location_id: this.layoutService.clinicSelectedMultiple,
					case_type_id: this.layoutService.caseTypeSelectedMultiple,
					visit_type_id: this.layoutService.visitStatusSelectedMultiple,
				},
			)
			.subscribe(
				async (res: any) => {
					this.layoutService.defaultHeadersObject = [];
					this.layoutService.defaultFootersObject = [];
					let headerCheck = false;
					let footerCheck = false;
					for (let tempHeader of res.data[0].headers) {
						if (tempHeader.is_default_header) {
							if (!headerCheck) {
								this.layoutService.headerIndex = 0;
								this.layoutService.header = tempHeader;
								headerCheck = true;
							}
							this.layoutService.defaultHeadersObject.push(tempHeader);
						}
					}
					for (let tempHeader of res.data[0].footers) {
						if (tempHeader.is_default_header) {
							if (!footerCheck) {
								this.layoutService.footerIndex = 0;
								this.layoutService.footer = tempHeader;
								footerCheck = true;
							}
							this.layoutService.defaultFootersObject.push(tempHeader);
						}
					}
					if (!this.layoutService.header) {
						this.layoutService.defaultHeaderMarginLeft = 5;
						this.layoutService.defaultHeaderMarginRight = 5;
					} else {
						this.layoutService.defaultHeaderMarginLeft = this.layoutService.header.headerMarginLeft;
						this.layoutService.defaultHeaderMarginRight =
							this.layoutService.header.headerMarginRight;
					}
					if (!this.layoutService.footer) {
						this.layoutService.defaultFooterMarginLeft = 5;
						this.layoutService.defaultFooterMarginRight = 5;
					} else {
						this.layoutService.defaultFooterMarginLeft = this.layoutService.footer.headerMarginLeft;
						this.layoutService.defaultFooterMarginRight =
							this.layoutService.footer.headerMarginRight;
					}
					await this.makeText(0);
					await this.saveAlignment();
					if (this.hfImages == 0) {
						if (check) {
							let tempDiv: any = document.getElementsByClassName('originalDiv');
							let innerHTML = tempDiv[1].cloneNode(true).innerHTML;
							await this.pdfPreview(0, innerHTML);
						} else {
							await this.pdfPreview(1, '');
						}
					}
				},
				(err) => {
					console.log(err);
					this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
					this.stopLoader();
				},
			);
	}
	resetComponentIds() {
		// this.coolDialogs
		// 	.confirm('This will reset all the component IDs. Continue?', {
		// 		okButtonText: 'OK',
		// 		cancelButtonText: 'Cancel',
		// 	})
		this.bsModalRef = this.modalServiceDialog.show(ConfirmationDialogComponent, {
			initialState: {
			  message: 'This will reset all the component IDs. Continue?'
			},
			class: 'modal-dialog-centered'
		  });
		  this.bsModalRef.content.result
			.subscribe((response) => {
				if (response == true) {
					let tempOldArray = [];
					let tempId = 1;
					this.layoutService.isLoaderPending.next(true);
					this.changeDetector.detectChanges();
					for (let i = 0; i < this.layoutService.template.sections?.length; i++) {
						let tempDashboardCounter = 0;
						let tempDashboard = [];
						let cloneDashboard = cloneDeep(this.layoutService.template.sections[i].dashboard);
						while (
							tempDashboardCounter < this.layoutService.template.sections[i].dashboard?.length
						) {
							let minX = 1000;
							let minY = 1000;
							let tempIndex = 0;
							let selectedItem = cloneDashboard[0];
							for (let j = 0; j < cloneDashboard?.length; j++) {
								if (cloneDashboard[j].y < minY) {
									minY = cloneDashboard[j].y;
									minX = cloneDashboard[j].x;
									tempIndex = j;
									selectedItem = cloneDashboard[j];
								} else if (cloneDashboard[j].y == minY) {
									if (cloneDashboard[j].x < minX) {
										minY = cloneDashboard[j].y;
										minX = cloneDashboard[j].x;
										tempIndex = j;
										selectedItem = cloneDashboard[j];
									}
								}
							}
							cloneDashboard.splice(tempIndex, 1);
							tempDashboardCounter++;
							tempDashboard.push(selectedItem);
						}
						this.layoutService.template.sections[i].dashboard = tempDashboard;
					}
					for (let i = 0; i < this.layoutService.template.sections?.length; i++) {
						for (let j = 0; j < this.layoutService.template.sections[i].dashboard?.length; j++) {
							tempOldArray[
								`${this.layoutService.template.sections[i].dashboard[j].obj.uicomponent_name}`
							] = tempId;
							this.layoutService.template.sections[i].dashboard[j].obj.uicomponent_name =
								JSON.stringify(tempId);
							tempId++;
						}
					}
					for (let i = 0; i < this.layoutService.template.sections?.length; i++) {
						for (let j = 0; j < this.layoutService.template.sections[i].dashboard?.length; j++) {
							let tempStatement =
								this.layoutService.template.sections[i].dashboard[j].obj.statement;
							let statementArray = tempStatement.match(/@[0-9]+/g);
							if (statementArray) {
								for (let arrayItem of statementArray) {
									if (arrayItem[0] == '@') {
										arrayItem = arrayItem.replace('@', '');
										if (tempOldArray[`${arrayItem}`]) {
											this.layoutService.template.sections[i].dashboard[j].obj.statement =
												this.layoutService.template.sections[i].dashboard[j].obj.statement.replace(
													'@' + arrayItem,
													'@changingThisId' + tempOldArray[`${arrayItem}`],
												);
										}
									}
								}
								this.layoutService.template.sections[i].dashboard[j].obj.statement =
									this.layoutService.template.sections[i].dashboard[j].obj.statement.replace(
										/@changingThisId/g,
										'@',
									);
								this.layoutService.template.sections[i].dashboard[j].obj.instanceStatement =
									this.layoutService.template.sections[i].dashboard[j].obj.statement;
							}
							for (
								let k = 0;
								this.layoutService.template.sections[i].dashboard[j].obj.options &&
								k < this.layoutService.template.sections[i].dashboard[j].obj.options?.length;
								k++
							) {
								let tempOptionStatement =
									this.layoutService.template.sections[i].dashboard[j].obj.options[k].label;
								let optionArray = tempOptionStatement.match(/@[0-9]+/g);
								if (optionArray) {
									for (let arrayItem of optionArray) {
										if (arrayItem[0] == '@') {
											arrayItem = arrayItem.replace('@', '');
											this.layoutService.template.sections[i].dashboard[j].obj.options[k].label =
												this.layoutService.template.sections[i].dashboard[j].obj.options[
													k
												].label.replace('@' + arrayItem, '@' + tempOldArray[`${arrayItem}`]);
											this.layoutService.template.sections[i].dashboard[j].obj.options[
												k
											].instanceLabel =
												this.layoutService.template.sections[i].dashboard[j].obj.options[k].label;
											this.layoutService.template.sections[i].dashboard[j].obj.options[
												k
											].instanceInputValue =
												this.layoutService.template.sections[i].dashboard[j].obj.options[
													k
												].inputValue;
											this.layoutService.template.sections[i].dashboard[j].obj.options[
												k
											].textLabel = this.layoutService.stripHtml(
												this.layoutService.template.sections[i].dashboard[j].obj.options[k].label,
											);
										}
									}
								}
								if (
									this.layoutService.template.sections[i].dashboard[j].obj.options[k]
										.selectedLinkUi &&
									this.layoutService.template.sections[i].dashboard[j].obj.options[k].selectedLinkUi
										.id
								) {
									this.layoutService.template.sections[i].dashboard[j].obj.options[
										k
									].selectedLinkUi.id =
										tempOldArray[
											`${this.layoutService.template.sections[i].dashboard[j].obj.options[k].selectedLinkUi.id}`
										];
								}
								if (
									this.layoutService.template.sections[i].dashboard[j].obj.options[k]
										.linkedRowValue &&
									this.layoutService.template.sections[i].dashboard[j].obj.options[k].linkedRowValue
										.id
								) {
									this.layoutService.template.sections[i].dashboard[j].obj.options[
										k
									].linkedRowValue.id =
										tempOldArray[
											`${this.layoutService.template.sections[i].dashboard[j].obj.options[k].linkedRowValue.id}`
										];
								}
							}
						}
					}
					this.stopLoader();
				}
			});
	}
	signatureSelect(event) {
		this.setUIProperty(
			this.layoutService.lastI,
			this.layoutService.lastK,
			'selectedSignature',
			event.name,
			false,
		);
		this.setUIProperty(
			this.layoutService.lastI,
			this.layoutService.lastK,
			'signature_type',
			event.type,
			false,
		);
		this.setUIProperty(
			this.layoutService.lastI,
			this.layoutService.lastK,
			'signatureLabel',
			event.name,
			false,
		)
		this.layoutService.backupId++;
	}
	onInputFunc(event) {
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.fieldMaskProperty = event;
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.fieldMaskRegex = '^';
		for (
			let i: number = 0;
			i <
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.fieldMaskProperty?.length;
			i++
		) {
			switch (
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[
					this.layoutService.lastK
				].obj.fieldMaskProperty.charAt(i)
			) {
				case 'A':
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[
						this.layoutService.lastK
					].obj.fieldMaskRegex =
						this.layoutService.template.sections[this.layoutService.lastI].dashboard[
							this.layoutService.lastK
						].obj.fieldMaskRegex.concat('[A-Za-z0-9]{1}');
					break;
				case 'a':
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[
						this.layoutService.lastK
					].obj.fieldMaskRegex =
						this.layoutService.template.sections[this.layoutService.lastI].dashboard[
							this.layoutService.lastK
						].obj.fieldMaskRegex.concat('[A-Za-z0-9 ]{1}');
					break;
				case 'L':
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[
						this.layoutService.lastK
					].obj.fieldMaskRegex =
						this.layoutService.template.sections[this.layoutService.lastI].dashboard[
							this.layoutService.lastK
						].obj.fieldMaskRegex.concat('[A-Za-z]{1}');
					break;
				case 'l':
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[
						this.layoutService.lastK
					].obj.fieldMaskRegex =
						this.layoutService.template.sections[this.layoutService.lastI].dashboard[
							this.layoutService.lastK
						].obj.fieldMaskRegex.concat('[A-Za-z ]{1}');
					break;
				case '0':
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[
						this.layoutService.lastK
					].obj.fieldMaskRegex =
						this.layoutService.template.sections[this.layoutService.lastI].dashboard[
							this.layoutService.lastK
						].obj.fieldMaskRegex.concat('[0-9]{1}');
					break;
				case '9':
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[
						this.layoutService.lastK
					].obj.fieldMaskRegex =
						this.layoutService.template.sections[this.layoutService.lastI].dashboard[
							this.layoutService.lastK
						].obj.fieldMaskRegex.concat('[0-9 ]{1}');
					break;
				case '?':
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[
						this.layoutService.lastK
					].obj.fieldMaskRegex =
						this.layoutService.template.sections[this.layoutService.lastI].dashboard[
							this.layoutService.lastK
						].obj.fieldMaskRegex.concat('(.){1}');
					break;
				case '*':
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[
						this.layoutService.lastK
					].obj.fieldMaskRegex =
						this.layoutService.template.sections[this.layoutService.lastI].dashboard[
							this.layoutService.lastK
						].obj.fieldMaskRegex.concat('(.)*');
					break;
				default:
					break;
			}
		}
	}
	clearSectionFunc(index) {
		this.layoutService.isLoaderPending.next(true);
		for(let section of this.layoutService.template.sections) {
			if(section.id === this.instanceTextObj[index].section_id) {
				for (let uiComponent of section.dashboard) {
					let componentType = uiComponent.obj.type;
					switch (componentType) {
						case this.uicomponentTypes.INPUT:
							uiComponent.obj.input = '';
							uiComponent.obj.answers = [];
							break;
						case this.uicomponentTypes.DRAWING:
							uiComponent.obj.answers = [];
							this.layoutService.refreshObject(uiComponent.obj);
							break;
						case this.uicomponentTypes.SIGNATURE:
							uiComponent.obj = { 
								...uiComponent.obj, 
								signature: {
									file_title: "",
									signature_file: null 
								},
								signature_id: null,
								link: null,
								signaturePoints: [], 
								answers: [] 
							};
							this.layoutService.refreshObject(uiComponent.obj);
							
							break;
						case this.uicomponentTypes.INTENSITY:
						case this.uicomponentTypes.INCREMENT:
							uiComponent.obj.value = uiComponent.obj.options.floor;
							this.layoutService.refreshObject(uiComponent.obj);
							break;
						case this.uicomponentTypes.SWITCH:
						case this.uicomponentTypes.CHECKBOX:
						case this.uicomponentTypes.DROPDOWN:
						case this.uicomponentTypes.RADIO:
						case this.uicomponentTypes.INTELLISENSE:
							this.optionsClearFunc(uiComponent);
							this.layoutService.refreshObject(uiComponent.obj);
							break;
						default:
							// code to execute when none of the cases match
							break;
					}
				}
			}
		}
		this.layoutService.updateComponents();
		this.subjectService.instanceRefreshCheck('tick');
		this.stopLoader();
	}
	optionsClearFunc(uiComponent) {
		let sectionToHide = -1;
		let uiToHide = -1;
		let linkedSectionCheck = false;
		let newSectionsToHide = [];
		let newUiToHide = [];
		let linkedSectionsHide = [];
		uiComponent.obj.options.forEach((element) => {
			if (element.selected == true) {
				if (element.selectedLinkSection) {
					sectionToHide = element.selectedLinkSection.id;
				}
				if (element.selectedLinkUi) {
					uiToHide = element.selectedLinkUi.id;
				}
				for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
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
						let currentDepth = this.layoutService.template.sections[i].secNo.split('.')?.length - 1;
						for (let j = i + 1; j < this.layoutService.template.sections?.length; j++) {
							let tempDepth = this.layoutService.template.sections[j].secNo.split('.')?.length - 1;
							if (tempDepth > currentDepth) {
								this.layoutService.template.sections[j].selected_linked_component--;
							} else {
								i = j - 1;
								break;
							}
						}
					}
					for (
						let j: number = 0;
						j < this.layoutService.template.sections[i].dashboard?.length;
						j++
					) {
						if (
							this.layoutService.template.sections[i].dashboard[j].obj.uicomponent_name &&
							this.layoutService.template.sections[i].dashboard[j].obj.uicomponent_name == uiToHide
						) {
							this.layoutService.template.sections[i].dashboard[j].obj
								.selected_linked_ui_component--;
							this.changeDetector.detectChanges();
							if (!this.layoutService.template.sections[i].dashboard[j].obj.is_single_select) {
								if (this.layoutService.template.sections[i].dashboard[j].obj?.options?.length) {
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
								if (this.layoutService.template.sections[i].dashboard[j].obj?.options?.length) {
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
					for (let i: number = 0; i < this.layoutService.template.sections?.length; i++) {
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
								this.layoutService.template.sections[i].secNo.split('.')?.length - 1;
							for (let j = i + 1; j < this.layoutService.template.sections?.length; j++) {
								let tempDepth = this.layoutService.template.sections[j].secNo.split('.')?.length - 1;
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
		for (let x = 0; x < this.layoutService.template.sections?.length; x++) {
			for (let r = 0; r < this.layoutService.template.sections[x].dashboard?.length; r++) {
				if (
					this.layoutService.template.sections[x].dashboard[r].obj.MultiSelectObj &&
					this.layoutService.template.sections[x].dashboard[r].obj.MultiSelectObj.objectid == uiComponent.id
				) {
					if (
						this.layoutService.template.sections[x].dashboard[r].obj.answers &&
						this.layoutService.template.sections[x].dashboard[r].obj.answers?.length
					) {
						this.layoutService.template.sections[x].dashboard[r].obj.answers = [];
					}
					if (
						this.layoutService.template.sections[x].dashboard[r].obj.selectedItems &&
						this.layoutService.template.sections[x].dashboard[r].obj.selectedItems?.length
					) {
						this.layoutService.template.sections[x].dashboard[r].obj.selectedItems = [];
					}
					if (
						this.layoutService.template.sections[x].dashboard[r].obj.options &&
						this.layoutService.template.sections[x].dashboard[r].obj.options?.length
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
		if (uiComponent.obj.type == this.uicomponentTypes.DROPDOWN) {
			if (uiComponent.obj.selectedItems) {
				uiComponent.obj.selectedItems = [];
				let temp = uiComponent.obj;
				uiComponent.obj = {};
				uiComponent.obj = temp;
				this.changeDetector.detectChanges();
			}
		}
		if (linkedSectionCheck) {
			if (this.layoutService.editorView) {
				this.subjectService.instanceRefreshCheck(['saad', linkedSectionsHide, false]);
			}
		}
		uiComponent.obj.answers = []
	}
	toggleTableFunction(event) {
		if (!event.target.checked) {
			this.selectedLinkUiRemove(this.layoutService.lastI, 0);
			this.layoutService.template.sections[this.layoutService.lastI].dashboard.splice(0, 1);
			this.layoutService.template.sections[this.layoutService.lastI].is_table =
				!this.layoutService.template.sections[this.layoutService.lastI].is_table;
		} else {
			if (!this.layoutService.template.sections[this.layoutService.lastI].dashboard?.length) {
				this.layoutService.template.sections[this.layoutService.lastI].is_table =
					!this.layoutService.template.sections[this.layoutService.lastI].is_table;
			} else {
				this.toastrService.error('Please ensure the section is empty for applying table', 'Error', {
					timeOut: 6000,
				});
				event.preventDefault();
				event.stopPropagation();
				return;
			}
		}
		if (this.layoutService.template.sections[this.layoutService.lastI].is_table) {
			this.sectionIndex = this.layoutService.lastI;
			if (
				this.layoutService.template.sections[this.sectionIndex]['carrySections'] &&
				this.layoutService.template.sections[this.sectionIndex]['carrySections']?.length &&
				!this.layoutService.template.sections[this.sectionIndex]['isUpdated']
			) {
				// this.coolDialogs
				// 	.confirm(
				// 		'This section is being carry forward in other templates. Changes must be manually updated. Do you still wish to continue?',
				// 		{
				// 			okButtonText: 'OK',
				// 			cancelButtonText: 'Cancel',
				// 		},
				// 	)
				this.bsModalRef = this.modalServiceDialog.show(ConfirmationDialogComponent, {
					initialState: {
					  message: 'This section is being carry forward in other templates. Changes must be manually updated. Do you still wish to continue?'
					},
					class: 'modal-dialog-centered'
				  });
				  this.bsModalRef.content.result
					.subscribe((response) => {
						if (response == true) {
							const e = { target: { value: '6' } };
							this.setSectionColumn(e, this.sectionIndex);
							this.layoutService.template.sections[this.sectionIndex].options.minRows = 1;
							this.layoutService.template.sections[this.sectionIndex].options.maxRows = 1;
							this.optionRefresh(this.sectionIndex);
							this.layoutService.template.sections[this.sectionIndex].theme = false;
							this.layoutService.template.sections[this.sectionIndex].options.fixedRowHeight = 100;
							this.layoutService.template.sections[this.sectionIndex].options.draggable = {
								enabled: true,
								dropOverItems: false,
							};
							this.layoutService.template.sections[this.sectionIndex]['mapper'] = [];
							this.layoutService.template.sections[this.sectionIndex]['mapper'].push(1);
							this.layoutService.template.sections[this.sectionIndex]['isUpdated'] = true;
							this.changeDetector.detectChanges();
						}
					});
			} else {
				const e = { target: { value: '6' } };
				this.setSectionColumn(e, this.sectionIndex);
				this.layoutService.template.sections[this.sectionIndex].options.minRows = 1;
				this.layoutService.template.sections[this.sectionIndex].options.maxRows = 1;
				this.optionRefresh(this.sectionIndex);
				this.layoutService.template.sections[this.sectionIndex].is_table = true;
				this.layoutService.template.sections[this.sectionIndex].theme = false;
				this.layoutService.template.sections[this.sectionIndex].options.fixedRowHeight = 100;
				this.layoutService.template.sections[this.sectionIndex].options.draggable = {
					enabled: true,
					dropOverItems: false,
				};
				this.layoutService.template.sections[this.sectionIndex]['mapper'] = [];
				this.layoutService.template.sections[this.sectionIndex]['mapper'].push(1);
				this.dropItem(this.uicomponentTypes.TABLE_DROPDOWN);
				this.subjectService.refreshItem({ y: 0, x: 0, rows: 1, cols: 1 });
			}
		}
	}
	openFieldMaskHelp(fieldMaskHelp) {
		this.activeModal = this.modalService.open(fieldMaskHelp, {
			size: 'lg',
			backdrop: 'static',
			keyboard: true,
		});
	}
	validIds = [];
	getValidIds() {
		this.validIds = [];
		let foundIds = [];
		let maxId: number = 0;
		for (let section of this.layoutService.template.sections) {
			for (let component of section.dashboard) {
				let currentId = parseInt(component.obj.uicomponent_name);
				foundIds.push(currentId);
				if (maxId < currentId) {
					maxId = currentId;
				}
			}
		}
		this.layoutService.template.uiCompIds = maxId;
		for (let i = 1; i < this.layoutService.template.uiCompIds + 5; i++) {
			if (!foundIds.includes(i)) {
				this.validIds.push(i);
			}
		}
	}
	setFormatValue(sectionIndex, dashboardIndex, value) {
		this.updateBackUpTask('type', `formatValue`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(sectionIndex, dashboardIndex, -1, 'obj');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj[
				`formatValue`
			],
		);
		this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj[
			`formatValue`
		] = value;
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj[
				`formatValue`
			],
		);
		this.layoutService.refreshObject(
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj,
		);
		this.layoutService.backupId++;
		this.changeDetector.detectChanges();
	}
	setLayoutProperty(property, value, check) {
		this.updateBackUpTask('type', `${property}`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(-1, -1, -1, 'obj');
		this.updateBackUpTask('oldObject', this.layoutService[`${property}`]);
		this.layoutService[`${property}`] = value;
		this.updateBackUpTask('newObject', this.layoutService[`${property}`]);
		if (check) {
			this.layoutService.backupId++;
		}
		this.changeDetector.detectChanges();
	}
	setUIProperty(sectionIndex, dashboardIndex, property, value, check) {
		this.updateBackUpTask('type', `${property}`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(sectionIndex, dashboardIndex, -1, 'obj');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj[
				`${property}`
			],
		);
		this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj[
			`${property}`
		] = value;
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj[
				`${property}`
			],
		);
		if (check) {
			this.layoutService.backupId++;
		}
		this.layoutService.refreshObject(
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj,
		);
		this.changeDetector.detectChanges();
	}
	setEditorPropertyOptions(sectionIndex, dashboardIndex, property, value, check) {
		this.updateBackUpTask('type', `${property}`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(sectionIndex, dashboardIndex, -1, 'obj');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj[
				`${property}`
			],
		);
		this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj[
			`${property}`
		] = value;
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj[
				`${property}`
			],
		);
		if (check) {
			this.layoutService.backupId++;
		}
		for (let option of this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex]
			.obj?.options) {
			option.label = this.layoutService.applyEditor(
				this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj,
				option.label,
			);
			option.instanceLabel = option.label;
		}
		this.layoutService.refreshObject(
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj,
		);
		this.changeDetector.detectChanges();
	}
	setUIPropertyOptions(sectionIndex, dashboardIndex, property, value, optionIndex, check) {
		this.updateBackUpTask('type', `${property}`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(sectionIndex, dashboardIndex, optionIndex, 'option');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj.options[
				optionIndex
			][`${property}`],
		);
		this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj.options[
			optionIndex
		][`${property}`] = value;
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj.options[
				optionIndex
			][`${property}`],
		);
		if (check) {
			this.layoutService.backupId++;
		}
		this.layoutService.refreshObject(
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj,
		);
		this.changeDetector.detectChanges();
	}
	invertEditorPropertyOptions(sectionIndex, dashboardIndex, property, check) {
		this.updateBackUpTask('type', `${property}`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(sectionIndex, dashboardIndex, -1, 'obj');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj[
				`${property}`
			],
		);
		this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj[
			`${property}`
		] =
			!this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj[
				`${property}`
			];
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj[
				`${property}`
			],
		);
		if (check) {
			this.layoutService.backupId++;
		}
		for (let option of this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex]
			.obj?.options) {
			option.label = this.layoutService.applyEditor(
				this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj,
				option.label,
			);
			option.instanceLabel = option.label;
		}
		this.layoutService.refreshObject(
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj,
		);
		this.changeDetector.detectChanges();
	}
	invertUIProperty(sectionIndex, dashboardIndex, property, check) {
		this.updateBackUpTask('type', `${property}`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(sectionIndex, dashboardIndex, -1, 'obj');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj[
				`${property}`
			],
		);
		this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj[
			`${property}`
		] =
			!this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj[
				`${property}`
			];
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj[
				`${property}`
			],
		);
		if (check) {
			this.layoutService.backupId++;
		}
		this.layoutService.refreshObject(
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj,
		);
		this.changeDetector.detectChanges();
	}
	invertInputMinMax(sectionIndex, dashboardIndex, check) {
		this.updateBackUpTask('type', `minMaxCheck`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(sectionIndex, dashboardIndex, -1, 'obj');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj[
				`minMaxCheck`
			],
		);
		this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj[
			`minMaxCheck`
		] =
			!this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj[
				`minMaxCheck`
			];
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj[
				`minMaxCheck`
			],
		);
		if (
			!this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj[
				`minMaxCheck`
			]
		) {
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj[`minLimit`] =
				'';
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj[`maxLimit`] =
				'';
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj[
				`placeholder`
			] = '';
		}
		if (check) {
			this.layoutService.backupId++;
		}
		this.layoutService.refreshObject(
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj,
		);
		this.changeDetector.detectChanges();
	}
	invertInputMinMaxOptions(sectionIndex, dashboardIndex, property, optionIndex, check) {
		this.updateBackUpTask('type', `${property}`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(sectionIndex, dashboardIndex, optionIndex, 'option');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj.options[
				optionIndex
			][`${property}`],
		);
		this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj.options[
			optionIndex
		][`${property}`] =
			!this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj.options[
				optionIndex
			][`${property}`];
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj.options[
				optionIndex
			][`${property}`],
		);
		if (
			!this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj.options[
				optionIndex
			][`minMaxCheck`]
		) {
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj.options[
				optionIndex
			][`minLimit`] = '';
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj.options[
				optionIndex
			][`maxLimit`] = '';
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj.options[
				optionIndex
			][`commentsPlaceholder`] = 'Type Here';
		} else {
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj.options[
				optionIndex
			][`commentsPlaceholder`] = '';
		}
		if (check) {
			this.layoutService.backupId++;
		}
		this.layoutService.refreshObject(
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj,
		);
		this.changeDetector.detectChanges();
	}
	invertUIPropertyOptions(sectionIndex, dashboardIndex, property, optionIndex, check) {
		this.updateBackUpTask('type', `${property}`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(sectionIndex, dashboardIndex, optionIndex, 'option');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj.options[
				optionIndex
			][`${property}`],
		);
		this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj.options[
			optionIndex
		][`${property}`] =
			!this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj.options[
				optionIndex
			][`${property}`];
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj.options[
				optionIndex
			][`${property}`],
		);
		if (check) {
			this.layoutService.backupId++;
		}
		this.layoutService.refreshObject(
			this.layoutService.template.sections[sectionIndex].dashboard[dashboardIndex].obj,
		);
		this.changeDetector.detectChanges();
	}
	checkHorizontalTheme(sectionIndex, property, value, check, event) {
		if (property == 'theme') {
			if (
				value == 1 &&
				!this.layoutService.template.sections[this.layoutService.lastI].horizontalThemeCheck
			) {
				event.preventDefault();
				event.stopPropagation();
				this.toastrService.error('Top row must be aligned to set horizontal theme', '', {
					timeOut: 6000,
				});
				return;
			}
		}
	}
	checkVerticalTheme(sectionIndex, property, value, check, event) {
		if (property == 'theme') {
			if (
				value == 1 &&
				!this.layoutService.template.sections[this.layoutService.lastI].verticalThemeCheck
			) {
				event.preventDefault();
				event.stopPropagation();
				this.toastrService.error('Left column must be aligned to set vertical theme', '', {
					timeOut: 6000,
				});
				return;
			}
		}
	}
	checkBothTheme(sectionIndex, property, value, check, event) {
		if (property == 'theme') {
			if (
				(value == 1 &&
					!this.layoutService.template.sections[this.layoutService.lastI].verticalThemeCheck) ||
				!this.layoutService.template.sections[this.layoutService.lastI].horizontalThemeCheck
			) {
				event.preventDefault();
				event.stopPropagation();
				this.toastrService.error('Testing', '', { timeOut: 6000 });
				return;
			}
		}
	}
	setSectionProperty(sectionIndex, property, value, check) {
		if (property == 'theme') {
			if (
				value == 1 &&
				!this.layoutService.template.sections[this.layoutService.lastI].horizontalThemeCheck
			) {
				this.toastrService.error('Top row must be aligned to set horizontal theme', '', {
					timeOut: 6000,
				});
				return;
			} else if (
				value == 2 &&
				!this.layoutService.template.sections[this.layoutService.lastI].verticalThemeCheck
			) {
				this.toastrService.error('Left column must be aligned to set vertical theme', '', {
					timeOut: 6000,
				});
				return;
			}
		}
		this.updateBackUpTask('type', `${property}`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(sectionIndex, -1, -1, 'section');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[sectionIndex][`${property}`],
		);
		this.layoutService.template.sections[sectionIndex][`${property}`] = value;
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[sectionIndex][`${property}`],
		);
		if (check) {
			this.layoutService.backupId++;
		}
		this.changeDetector.detectChanges();
	}
	invertSectionProperty(sectionIndex, property, check) {
		this.updateBackUpTask('type', `${property}`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(sectionIndex, -1, -1, 'section');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[sectionIndex][`${property}`],
		);
		this.layoutService.template.sections[sectionIndex][`${property}`] =
			!this.layoutService.template.sections[sectionIndex][`${property}`];
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[sectionIndex][`${property}`],
		);
		if (check) {
			this.layoutService.backupId++;
		}
		this.changeDetector.detectChanges();
	}
	setTemplateProperty(property, value, check) {
		this.updateBackUpTask('type', `${property}`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(-1, -1, -1, 'template');
		this.updateBackUpTask('oldObject', this.layoutService.template[`${property}`]);
		this.layoutService.template[`${property}`] = value;
		this.updateBackUpTask('newObject', this.layoutService.template[`${property}`]);
		if (check) {
			this.layoutService.backupId++;
		}
		this.changeDetector.detectChanges();
	}
	invertTemplateProperty(property, check) {
		this.updateBackUpTask('type', `${property}`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(-1, -1, -1, 'template');
		this.updateBackUpTask('oldObject', this.layoutService.template[`${property}`]);
		this.layoutService.template[`${property}`] = !this.layoutService.template[`${property}`];
		this.updateBackUpTask('newObject', this.layoutService.template[`${property}`]);
		if (check) {
			this.layoutService.backupId++;
		}
		this.changeDetector.detectChanges();
	}
	selectValidId(event) {
		this.updateBackUpTask('type', `uicomponent_name`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.uicomponent_name,
		);
		if (this.layoutService.template.uiCompIds < event.target.value) {
			this.layoutService.template.uiCompIds = parseInt(event.target.value);
		}
		this.layoutService.template.sections[this.layoutService.lastI].dashboard[
			this.layoutService.lastK
		].obj.uicomponent_name = event.target.value;
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.uicomponent_name,
		);
		this.layoutService.backupId++;
	}
	optionDrop(event: CdkDragDrop<string[]>) {
		this.updateBackUpTask('type', `options`);
		this.updateBackUpTask('id', this.layoutService.backupId);
		this.updateIndexes(this.layoutService.lastI, this.layoutService.lastK, -1, 'obj');
		this.updateBackUpTask(
			'oldObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options,
		);
		moveItemInArray(
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options,
			event.previousIndex,
			event.currentIndex,
		);
		this.updateBackUpTask(
			'newObject',
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj.options,
		);
		this.layoutService.backupId++;
		this.refreshObject();
	}
	sectionTrack(section) {
		return section.id;
	}
	openManulaOptionModal(event, multiSelectOptions, check) {
		event.preventDefault();
		event.stopPropagation();
		let object =
			this.layoutService.template.sections[this.layoutService.lastI].dashboard[
				this.layoutService.lastK
			].obj;
		if (
			(object.manualoptions === true && check == 1) ||
			(object.multilinked === true && check == 2) ||
			(object.preDefind === true && check == 3)
		) {
			return;
		}
		this.modalService.open(multiSelectOptions, { ariaLabelledBy: 'modal-basic-title' }).result.then(
			async (result) => {
				if (result === true) {
					switch (check) {
						case '1':
							await this.SelectManualOptions();
							break;
						case '2':
							await this.MultiSelectCheckbox();
							break;
						case '3':
							await this.optionPreDefind();
							break;
						default:
							break;
					}
				}
				this.layoutService.updateComponents();
				this.refreshObject();
			},
			(reason) => {
				console.log(reason);
			},
		);
	}
	private findTopLevelParent(template, section, subSec?): any {
		if(section.parentId === 0) return [section, subSec]
		const parentSection = this.findSectionInTemplate(template, section.parentId)
		if(subSec) subSec= section
		return this.findTopLevelParent(template, parentSection, subSec)
	}
	private findSectionInTemplate(template, id: number): any {
		for(const section of template.sections) {
			if(section.id === id) {
				return section
			}
		}
		return null
	}
	private setTemplateErrors(template, section, component, error = true) {
		section.hasError = error
		const errorSections = this.findTopLevelParent(template, section, section)
		const topLevelParentSection = errorSections[0]
		const subLevelParentSection = errorSections[1]
		topLevelParentSection.hasError = error
		subLevelParentSection.hasError = error
		for(const subb of this.currentSub) {
			if(subb.id === subLevelParentSection.id) {
				subb.hasError = error
			}
		}
		component.obj.hasError = error
	}
	finaliseVisitParam(warning?:boolean,visitCheck?:boolean)
	{
		let is_amended: number = 0;
		let instanceNow = JSON.stringify(this.layoutService.template);
		if (this.visit_status == 3 && instanceNow != this.originalInstance) {
			is_amended = 1;
		}
		if (!visitCheck && this.visit_status == 1) {
			this.visit_status = 2;
		}
		let finalizeVisitData = {
			id: this.visit_idd,
			visit_session_state_id: visitCheck && this.visit_status==2? 1: this.visit_status,
			is_amended: is_amended,
			warning: warning?true:false,
			template_id: this.template_idd || this.layoutService.template.template_id,
			template_type: 'dynamic',
			provider_id: this.templateObjInfo.provider_id
				? this.templateObjInfo.provider_id
				: '',
			technician_id: this.templateObjInfo.technician_id
				? this.templateObjInfo.technician_id
				: '',
			speciality: this.templateObjInfo.technician_id ? true : false,
			cpt_codes: [],
			icd_codes: [],
		};
		for (let slug of this.layoutService?.template?.allExternalSlugs) {
			if (slug.slug == 'cpt_codes' && slug.selectedUI?.length) {
				for (
					let sectionIndex: number = 0;
					sectionIndex < this.layoutService.template.sections?.length;
					sectionIndex++
				) {
					for (
						let dashboardIndex: number = 0;
						dashboardIndex <
						this.layoutService.template.sections[sectionIndex].dashboard?.length;
						dashboardIndex++
					) {
						for (
							let slugIndex: number = 0;
							slugIndex < slug.selectedUI?.length;
							slugIndex++
						) {
							if (
								this.layoutService.template.sections[sectionIndex].dashboard[
									dashboardIndex
								].obj.uicomponent_name == slug.selectedUI[slugIndex].id
							) {
								if (
									this.layoutService.template.sections[sectionIndex].dashboard[
										dashboardIndex
									].obj.preDefinedObj &&
									this.layoutService.template.sections[sectionIndex].dashboard[
										dashboardIndex
									].obj.preDefinedObj.slug == 'cpt_codes'
								) {
									for (let answer of this.layoutService.template.sections[sectionIndex]
										.dashboard[dashboardIndex].obj.answers) {
										finalizeVisitData['cpt_codes'].push(answer.id);
									}
								}
							}
						}
					}
				}
			}
			if (slug.slug == 'icd_10_codes' && slug.selectedUI.id != -1) {
				for (
					let sectionIndex: number = 0;
					sectionIndex < this.layoutService.template.sections?.length;
					sectionIndex++
				) {
					for (
						let dashboardIndex: number = 0;
						dashboardIndex <
						this.layoutService.template.sections[sectionIndex].dashboard?.length;
						dashboardIndex++
					) {
						for (
							let slugIndex: number = 0;
							slugIndex < slug.selectedUI?.length;
							slugIndex++
						) {
							if (
								this.layoutService.template.sections[sectionIndex].dashboard[
									dashboardIndex
								].obj.uicomponent_name == slug.selectedUI[slugIndex].id
							) {
								if (
									this.layoutService.template.sections[sectionIndex].dashboard[
										dashboardIndex
									].obj.preDefinedObj &&
									this.layoutService.template.sections[sectionIndex].dashboard[
										dashboardIndex
									].obj.preDefinedObj.slug == 'icd_10_codes'
								) {
									for (let answer of this.layoutService.template.sections[sectionIndex]
										.dashboard[dashboardIndex].obj.answers) {
										finalizeVisitData['icd_codes'].push(answer.id);
									}
								}
							}
						}
					}
				}
			}
		}
		return finalizeVisitData;
	}
}
