import { ChangeDetectionStrategy, ChangeDetectorRef, HostListener, Renderer2, Component, ViewChild, OnInit, ViewEncapsulation, ElementRef, Inject } from "@angular/core";
import { DisplayGrid, GridType } from "../../shared/gridster/gridsterConfig.interface";
import { GridsterItem } from "../../shared/gridster/gridsterItem.interface";
import { LayoutService, IComponent } from "../../services/layout.service";
import { v4 as UUID } from 'uuid'
import { NgbModal, NgbModalRef, NgbModalOptions, NgbPopoverConfig } from "@ng-bootstrap/ng-bootstrap";
import { SubjectService } from "../../services/subject.service";
import { FormGroup, FormBuilder } from "@angular/forms";
import { cloneDeep } from "lodash";
import { MainServiceTemp } from "../../services/main.service";
import { GridsterItemComponentInterface } from "../../shared/gridster/gridsterItemComponent.interface";
import { GridsterComponent } from "../../shared/gridster/gridster.component";
import { ToastrService } from "ngx-toastr";
import { Router } from "@angular/router";
import { RequestService } from "@appDir/shared/services/request.service";
import { TemplateMasterUrlEnum } from "@appDir/front-desk/masters/template-master/template-master-url.enum";
import { DOCUMENT } from "@angular/common";
import { StorageData, HttpSuccessResponse } from "@appDir/pages/content-pages/login/user.class";
import { TemaplateManagerUrlsEnum } from "@appDir/template-manager/template-manager-url-enum";
import { REQUEST_SERVERS } from "@appDir/request-servers.enum";
import { HeaderFooterModalComponent } from "../../modals/header-footer-modal/header-footer-modal.component";
import { DomSanitizer } from "@angular/platform-browser";
import { Options } from '@angular-slider/ngx-slider';
import { CustomDiallogService } from "@appDir/shared/services/custom-dialog.service";

@Component({
	selector: "app-home-internel",
	templateUrl: "./home.component.html",
	styleUrls: ["./home.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnInit {
	@ViewChild("auto") auto;
	public activeModal: NgbModalRef;
	public templateSaved: any = false;
	@ViewChild("tagInput") tagInputRef: ElementRef;
	HeightValueHeader: any = 0;
	public dragUIComponent: any = false;
	specialties = [];
	preDefinedInputModel = "";
	showSectionProperties: any = false;
	showLineProperties: any = false;
	showImageProperties: any = false;
	showInputProperties: any = false;
	showTextProperties: any = false;
	showUIComponents: any = false;
	showCombinedProperties: any = false;
	public collapsePropertiesTab = {
		showUIComponents: false,
		showSectionProperties: false,
		showTextProperties: false,
		showCombinedProperties: false,
		showInputProperties: false,
		showLineProperties: false,
		showImageProperties: false,
	};
	sectionName: any;
	public addDelAction: any = false;
	public hideLeftSection: any = false; // Adding class using ngStyle for text Editor (Left Arrow)
	/** Template Search */
	public searchParam: any = "";
	searchData = [];
	public currentTemplate: any = [];
	public showSideSections: any = false;
	sectiontags: string[] = ["section"];
	form: FormGroup;
	showProperties = false;
	sections: any;
	HeightValue: number = 0;
	shiftPressed = false;
	get components(): IComponent[] {
		return this.components;
	}
	@HostListener("window:keyup", ["$event"])
	onKeyUp(event: KeyboardEvent) {
		console.log(event);

		this.shiftPressed = false;
	}
	@HostListener("window:keydown", ["$event"])
	onKeyDown(event: any): void {
		let userSelection;
		if (window.getSelection) {
			userSelection = window.getSelection();
		}
		if (event.getModifierState && event.getModifierState("Control") && event.getModifierState("Alt") && event.keyCode === 67) {
			if (this.layoutService.lastK != null && this.layoutService.section.dashboard[this.layoutService.lastK] && this.layoutService.section.dashboard[this.layoutService.lastK].isClick) {
				this.itemCopy(this.layoutService.lastK, this.layoutService.section.dashboard[this.layoutService.lastK]);
			}
		} else if (event.getModifierState && event.getModifierState("Control") && event.getModifierState("Alt") && event.keyCode === 86) {
			if (Object.keys(this.emptyCellItem).length > 0) {
				this.itemPaste();
			}
		} else if (event.keyCode === 16) {
			this.shiftPressed = true;
		} else if (event.getModifierState && event.getModifierState("Control") && event.getModifierState("Alt") && event.keyCode === 90) {
			this.undoTask();
		} else if (event.getModifierState && event.getModifierState("Control") && event.getModifierState("Alt") && event.keyCode === 89) {
			this.redoTask();
		}
	}
	undoTask() {
		if (this.layoutService.backupIndex == -1) {
			return;
		}
		if (this.layoutService.backupIndex == -2) {
			this.layoutService.backupIndex = this.layoutService.backupQueue.length - 1;
		}
		if (this.layoutService.backupQueue.length) {
			let tempId = this.layoutService.backupQueue[this.layoutService.backupIndex].id;
			while (this.layoutService.backupIndex != -1 && this.layoutService.backupQueue[this.layoutService.backupIndex].id == tempId) {
				this.performUndoTask(this.layoutService.backupQueue[this.layoutService.backupIndex]);
				this.layoutService.backupIndex--;
			}
		}
	}
	redoTask() {
		if (this.layoutService.backupIndex == -2 || this.layoutService.backupIndex == this.layoutService.backupQueue.length) {
			this.layoutService.backupIndex = -2;
			return;
		}
		if (this.layoutService.backupQueue.length) {
			let tempId = this.layoutService.backupQueue[this.layoutService.backupIndex + 1].id;
			while (this.layoutService.backupIndex + 1 < this.layoutService.backupQueue.length && this.layoutService.backupQueue[this.layoutService.backupIndex + 1].id == tempId) {
				this.performRedoTask(this.layoutService.backupQueue[this.layoutService.backupIndex + 1]);
				this.layoutService.backupIndex++;
			}
		}
		if (this.layoutService.backupIndex == this.layoutService.backupQueue.length - 1) {
			this.layoutService.backupIndex = -2;
		}
	}
	performUndoTask(object) {
		if (object.path == "addItem") {
			this.layoutService.section.dashboard.splice(object.dashboardIndex, 1);
			this.removeCollapsePropertiesTab();
			this.setPropertiesTab("showSectionProperties");
			this.setCollapsePropertiesTab("showSectionProperties");
			this.GetHeightValue();
			if (!this.layoutService.section.dashboard.length) {
				this.layoutService.lastK = null;
			}
		} else if (object.path == "deleteItem") {
			this.layoutService.section.dashboard.splice(object.dashboardIndex, 0, object.newObject);
			this.removeCollapsePropertiesTab();
			this.setPropertiesTab("showSectionProperties");
			this.setCollapsePropertiesTab("showSectionProperties");
			this.GetHeightValue();
		} else if (object.path == "this") {
			this[`${object.type}`] = object.oldObject;
		} else if (object.path == "layoutService") {
			this.layoutService[`${object.type}`] = object.oldObject;
		} else if (object.path == "section") {
			this.layoutService.section[`${object.type}`] = object.oldObject;
		} else if (object.path == "sectionOptions") {
			this.layoutService.section.options[`${object.type}`] = object.oldObject;
			this.optionRefresh(false, true);
		} else if (object.path == "dashboard") {
			this.layoutService.section.dashboard[object.dashboardIndex][`${object.type}`] = object.oldObject;
		} else if (object.path == "obj") {
			this.layoutService.section.dashboard[object.dashboardIndex].obj[`${object.type}`] = object.oldObject;
		} else if (object.path == "option") {
			this.layoutService.section.dashboard[object.dashboardIndex].obj.options[object.optionIndex][`${object.type}`] = object.oldObject;
		}
		this.changeDetector.detectChanges();
	}
	performRedoTask(object) {
		if (object.path == "addItem") {
			this.layoutService.section.dashboard.splice(object.dashboardIndex, 0, object.newObject);
			this.removeCollapsePropertiesTab();
			this.setPropertiesTab("showSectionProperties");
			this.setCollapsePropertiesTab("showSectionProperties");
			this.GetHeightValue();
		} else if (object.path == "deleteItem") {
			this.layoutService.section.dashboard.splice(object.dashboardIndex, 1);
			this.removeCollapsePropertiesTab();
			this.setPropertiesTab("showSectionProperties");
			this.setCollapsePropertiesTab("showSectionProperties");
			this.GetHeightValue();
			if (!this.layoutService.section.dashboard.length) {
				this.layoutService.lastK = null;
			}
		} else if (object.path == "this") {
			this[`${object.type}`] = object.newObject;
		} else if (object.path == "section") {
			this.layoutService.section[`${object.type}`] = object.newObject;
		} else if (object.path == "sectionOptions") {
			this.layoutService.section.options[`${object.type}`] = object.newObject;
			this.optionRefresh(false, true);
		} else if (object.path == "dashboard") {
			this.layoutService.section.dashboard[object.dashboardIndex][`${object.type}`] = object.newObject;
		} else if (object.path == "obj") {
			this.layoutService.section.dashboard[object.dashboardIndex].obj[`${object.type}`] = object.newObject;
		} else if (object.path == "option") {
			this.layoutService.section.dashboard[object.dashboardIndex].obj.options[object.optionIndex][`${object.type}`] = object.newObject;
		}
		this.changeDetector.detectChanges();
	}
	GetHeightValue() {
		this.HeightValue = 0;
		if (this.showUIComponents == true) {
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
		if (this.showImageProperties == true) {
			this.HeightValue = this.HeightValue + 1;
		}
		if (this.showLineProperties == true) {
			this.HeightValue = this.HeightValue + 1;
		}
		if (this.showCombinedProperties == true) {
			this.HeightValue = this.HeightValue + 1;
		}
		let x = this.HeightValue;
	}
	textObject: any = {
		showSimpleTextProperties: false,
		hidePdf: 0,
		type: "text",
		second_name: "text",
		isStatement: true,
		alignment: "center",
		statement: "Your statement goes here! ",
		textInput: " ",
		answers: [],
		tags: [],
		emptyCell: false,
		bold: false,
		underLine: false,
		isBold: false,
		isItalic: false,
		isUnderline: false,
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
		backgroundColor: "#ff0000",
		fontColor: false,
		fontColorCode: "#000000",
		fontFamily: false,
		fontFamilyValue: "",
	};
	simpleImageObject: any = {
		isStatement: false,
		statement: "",
		type: "simpleImage",
		alignment: "center",
		path: "",
		answers: [],
		width: 100,
		data: [],
		raw: "",
		tags: [],
		firstTime: true,
		emptyCell: false,
	};
	inputObject: any = {
		showSimpleTextProperties: false,
		uiBorders: false,
		leftUIBorder: 0,
		preDefind: false,
		preDefinedObj: {},
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
		backgroundColor: "#ff0000",
		fontColor: false,
		fontColorCode: "#000000",
		fontFamily: false,
		fontFamilyValue: "",
		hidePdf: 0,
		second_name: "input",
		input: "",
		alignment: "center",
		isStatement: true,
		answers: [],
		statement: "Your statement goes here! ",
		type: "input",
		isUnderLine: false,
		isItalic: false,
		isAlign: 0,
		fontSize: "3",
	};
	lineObject: any = {
		second_name: "line",
		horizontal: true,
		type: "line",
		tags: [],
		size: "1px",
		typeLine: "solid",
		answers: [],
		color: "#000000",
		statement: "This is a line",
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
		backgroundColor: "#ff0000",
		fontColor: false,
		fontColorCode: "#000000",
		fontFamily: false,
		fontFamilyValue: "",
		linked_ui: 0,
		selected_linked_ui_component: 0,
		errors: 0,
	};
	componentsService: IComponent[] = [];
	dropId: string;
	dragItem: any;
	uiObject: any;
	isSection: any;
	isSubSection: any;
	sectionId: any = 1;
	totalSection = 1;
	sectionNumber: any = 1;
	leftSection: any = true;
	rightSection: any = true;
	templateSubSections: any = [];
	selectedSection: any;
	/** Create New Template */
	templateCreated: any = false;
	sectionCreated: any = false;
	editTempName: any = true;
	editSecName: any = true;
	public PreDefinedList: any = [];
	public PreDummylist: any = [];
	public PreDefinedListText: any = [];
	public PreDefinedListDropDown: any = [];
	preDefindAllFields: any = [];
	public searchSections: any = [];
	public sectionDragStart: any;
	otherSectionDragSearchCheck = false;
	sessionOverviewTrs: any;
	public keyword = "title";
	public tagsList: any = [];

	constructor(@Inject(DOCUMENT) private document: Document, private el: ElementRef, protected route: Router, private toastrService: ToastrService, public layoutService: LayoutService, public mainService: MainServiceTemp, private renderer: Renderer2, public subjectService: SubjectService, protected requestService: RequestService, private fb: FormBuilder, private modalService: NgbModal, protected storageData: StorageData, public sanitizer: DomSanitizer,
	private customDiallogService: CustomDiallogService,
	 public changeDetector: ChangeDetectorRef,
	 config: NgbPopoverConfig
	 ) {
		config.container = 'body';

	 }

	subscriptions: any[] = [];
	subscription1: any;
	subscription2: any;
	subscription3: any;
	subscription4: any;
	emptyCellItem: any = {};
	emptyCellItemIndex: any = { dashboardIndex: -1 };
	ngOnInit() {
		this.renderer.addClass(this.document.body, "template-manager");
		this.offset = 0;
		this.emptySelectedComponents();
		this.requestService.sendRequest(TemaplateManagerUrlsEnum.fieldsControls, "GET", REQUEST_SERVERS.fd_api_url).subscribe((response: HttpSuccessResponse) => {
			this.PreDummylist = response.result.data;
			this.PreDefinedListText = this.PreDummylist.filter((x) => x.field_type == "text_field");
			this.PreDefinedListDropDown = this.PreDummylist.filter((x) => x.field_type == "multiple_dropdown");
		});
		this.requestService.sendRequest(TemplateMasterUrlEnum.specialities, "GET", REQUEST_SERVERS.fd_api_url).subscribe((response: HttpSuccessResponse) => {
			this.specialties = JSON.parse(JSON.stringify(response.result.data));
			for (let i = 0; i < this.specialties.length; i++) {
				let opt = {
					label: this.specialties[i].name,
					selected: false,
					hide: false,
					link: false,
					input: false,
					inputValue: "Type here!",
					OptionViewValue: "1",
					selectedLinkSection: {},
				};
				this.specialties[i] = { ...this.specialties[i], ...opt };
			}
		});
		if (!this.layoutService.editTemplate) {
			this.layoutService.section = {
				section_id: 0,
				uiCompIds: 0,
				section_title: name,
				is_header: 1,
				is_first_page: 0,
				is_default_header: 1,
				default_columns: 1,
				headerMarginLeft: 0,
				headerMarginRight: 0,
				mapper: [1],
				isSelected: true,
				defaultColumn: false,
				options: {},
				dashboard: [],
			};
			this.layoutService.section.options = {
				gridType: GridType.VerticalFixed,
				displayGrid: DisplayGrid.Always,
				setGridSize: true,
				pushItems: true,
				fixedRowHeight: 100,
				hasContent: true,
				fixedColWidth: 750 / 1,
				disableScrollVertical: true,
				disableScrollHorizontal: true,
				swap: true,
				minCols: 1,
				maxCols: 1,
				maxRows: 1,
				minRows: 1,
				keepFixedWidthInMobile: true,
				keepFixedHeightInMobile: true,
				enableEmptyCellContextMenu: true,
				enableEmptyCellClick: true,
				enableEmptyCellDrop: true,
				// compactType: CompactType.None,
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
					stop: HomeComponent.eventStop,
					dropOverItems: false,
				},
				resizable: {
					enabled: true,
				},
			};
		} else {
			this.componentsService = JSON.parse(JSON.stringify(this.layoutService.componentsService));
			this.sectionCreated = true;
			this.arrowLeftRight("direction");
		}
		this.form = this.fb.group({
			tag: [undefined],
		});
		this.subscription1 = this.subjectService.castItem.subscribe((res) => {
			if (res.length !== 0) {
				if (this.dragItem === null && this.sectionDragStart != null) {
					this.dropSearchSection();
				} else if (this.dragItem != null) {
					res.obj = JSON.parse(JSON.stringify(this.uiObject));
					res.id = UUID();
					let check = true;
					for (let i = 0; i < this.layoutService.section.dashboard.length; i++) {
						if (this.layoutService.section.dashboard[i].obj.emptyCell) {
							this.layoutService.section.dashboard.splice(i, 1);
							this.emptyCellItem = {};
							this.emptyCellItemIndex = {
								sectionIndex: -1,
								dashboardIndex: -1,
							};
							i--;
							continue;
						}
						if (this.layoutService.section.dashboard[i].id === res.id) {
							check = false;
						} else if (this.layoutService.section.dashboard[i].x <= res.x && this.layoutService.section.dashboard[i].cols + this.layoutService.section.dashboard[i].x > res.x && this.layoutService.section.dashboard[i].y <= res.y && this.layoutService.section.dashboard[i].rows + this.layoutService.section.dashboard[i].y > res.y) {
							check = false;
							this.toastrService.error("UI already exists");
							return;
						}
					}
					if (check) {
						this.layoutService.section.dashboard.push(res);
						this.layoutService.section.uiCompIds++;
						this.layoutService.section.dashboard[this.layoutService.section.dashboard.length - 1].obj.uicomponent_name = JSON.stringify(this.layoutService.section.uiCompIds);
						this.updateBackUpTask("type", `addItem`);
						this.updateBackUpTask("id", this.layoutService.backupId);
						this.updateIndexes(0, this.layoutService.section.dashboard.length - 1, -1, "addItem");
						this.updateBackUpTask("oldObject", null);
						this.updateBackUpTask("newObject", cloneDeep(this.layoutService.section.dashboard[this.layoutService.section.dashboard.length - 1]));
						this.dropId = res.id;
						const { componentsService } = this;
						const comp: IComponent = componentsService.find((c) => c.id === this.dropId);
						const updateIdx: number = comp ? componentsService.indexOf(comp) : componentsService.length;
						const componentItem: IComponent = {
							id: this.dropId,
							componentRef: this.dragItem,
						};
						if (!this.componentsService[updateIdx]) {
							this.componentsService = Object.assign([], this.componentsService, {
								[updateIdx]: componentItem,
							});
						}
						if (this.layoutService.section.dashboard[this.layoutService.section.dashboard.length - 1].obj.type == "input") {
							this.preDefindAllFields = this.PreDefinedListText;
							this.preDefind();
						}
					}
					this.dragItem = null;
					console.log(JSON.stringify(this.componentsService));
					this.layoutService.componentsService = JSON.parse(JSON.stringify(this.componentsService));

					this.layoutService.backupId++;
					this.subjectService.refreshItem([]);
				}
			}
		});

		this.subscription2 = this.subjectService.castPasteItem.subscribe((res) => {
			if (res.length !== 0) {
				this.dropItem(res["obj"]["type"]);
				res.isClick = false;
				res = cloneDeep(res);
				delete res.uicomponent_id;
				for (let i = 0; res.obj.options && i < res.obj.options.length; i++) {
					res.obj.options[i].selectedLinkSection = {};
				}
				res.id = UUID();
				let check = true;
				for (let i = 0; i < this.layoutService.section.dashboard.length; i++) {
					if (this.layoutService.section.dashboard[i].obj.emptyCell) {
						this.layoutService.section.dashboard.splice(i, 1);
						this.emptyCellItem = {};
						this.emptyCellItemIndex = { dashboardIndex: -1 };
						i--;
						continue;
					}
					if (this.layoutService.section.dashboard[i].id === res.id) {
						check = false;
					} else if (this.layoutService.section.dashboard[i].x <= res.x && this.layoutService.section.dashboard[i].cols + this.layoutService.section.dashboard[i].x > res.x && this.layoutService.section.dashboard[i].y <= res.y && this.layoutService.section.dashboard[i].rows + this.layoutService.section.dashboard[i].y > res.y) {
						check = false;
						this.toastrService.error("UI already exists");
						this.layoutService.backupId++;
						this.subjectService.pasteItem([]);
						return;
					}
				}
				if (check) {
					this.layoutService.section.dashboard.push(res);
					this.setSectionProperty(0, "uiCompIds", this.layoutService.section.uiCompIds+1, false);
					this.layoutService.section.dashboard[this.layoutService.section.dashboard.length - 1].obj.uicomponent_name = JSON.stringify(this.layoutService.section.uiCompIds);
					this.updateBackUpTask("type", `addItem`);
					this.updateBackUpTask("id", this.layoutService.backupId);
					this.updateIndexes(0, this.layoutService.section.dashboard.length - 1, -1, "addItem");
					this.updateBackUpTask("oldObject", null);
					this.updateBackUpTask("newObject", cloneDeep(this.layoutService.section.dashboard[this.layoutService.section.dashboard.length - 1]));
					this.dropId = res.id;
					const { componentsService } = this;
					const comp: IComponent = componentsService.find((c) => c.id === this.dropId);
					const updateIdx: number = comp ? componentsService.indexOf(comp) : componentsService.length;
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
					////console.log(JSON.stringify(this.componentsService));
					this.layoutService.backupId++;
					this.subjectService.pasteItem([]);
				}
			}
		});

		this.requestService.sendRequest(TemaplateManagerUrlsEnum.mappingKeywords, "GET", REQUEST_SERVERS.fd_api_url).subscribe((res: any) => {
			this.layoutService.section["mappingKeyWords"] = res.result.data;
		});
		this.subscription3 = this.subjectService.castEmptyCellClick.subscribe((res) => {
			if (res.length !== 0 && res != "right") {
				for (let i = 0; this.layoutService.section && i < this.layoutService.section.dashboard.length; i++) {
					let item = this.layoutService.section.dashboard[i];
					if (this.layoutService.section.dashboard[i].obj.emptyCell) {
						let tempLastK = this.layoutService.lastK;
						this.layoutService.lastK = i;
						this.removeItem(this.layoutService.section.dashboard[i], "col", false);
						i--;
						this.layoutService.lastK = tempLastK;
					}
					if (res.x >= item.x && res.x <= item.x + item.cols - 1 && res.y >= item.y && res.y <= item.y + item.rows - 1 && !item.obj.emptyCell) {
						// if (this.emptyCellItemIndex.dashboardIndex != -1) {
							// let tempLastK = this.layoutService.lastK;
							// this.layoutService.lastK = this.emptyCellItemIndex.dashboardIndex;
							// if (this.layoutService.section.dashboard[this.emptyCellItemIndex.dashboardIndex] && this.layoutService.section.dashboard[this.emptyCellItemIndex.dashboardIndex].obj.emptyCell) {
							// 	this.removeItem(this.layoutService.section.dashboard[this.emptyCellItemIndex.dashboardIndex], "col", false);
							// }
							// this.layoutService.lastK = tempLastK;
						// }
						this.itemClick(i, item);
						return;
					}
				}
				if (this.selectedComponents.length && !this.shiftPressed) {
					for (let component of this.selectedComponents) {
						if (this.layoutService.section.dashboard[component.dashboardIndex]) {
							this.layoutService.section.dashboard[component.dashboardIndex].isClick = false;
						}
					}
					this.selectedComponents = [];
				}
				if (this.emptyCellItemIndex.dashboardIndex != -1) {
					let tempCheck = false;
					if (this.emptyCellItem.x == res.x && this.emptyCellItem.y == res.y && this.emptyCellItem.cols == res.cols && this.emptyCellItem.rows == res.rows) {
						tempCheck = true;
					}
					let tempLastK = this.layoutService.lastK;

					this.layoutService.lastK = this.emptyCellItemIndex.dashboardIndex;
					if (this.layoutService.section.dashboard[this.emptyCellItemIndex.dashboardIndex] && this.layoutService.section.dashboard[this.emptyCellItemIndex.dashboardIndex].obj.emptyCell) {
						this.removeItem(this.layoutService.section.dashboard[this.emptyCellItemIndex.dashboardIndex], "col", false);
					}
					this.layoutService.lastK = tempLastK;
					if (tempCheck) {
						this.emptyCellItem = {};
						this.emptyCellItemIndex = { dashboardIndex: -1 };
						this.changeDetector.detectChanges();
						return;
					}
				}

				this.emptyCellItem = {};
				this.emptyCellItemIndex = { dashboardIndex: -1 };

				this.emptyCellItem = res;
				this.emptyCellItemIndex = { dashboardIndex: this.layoutService.section.dashboard.length };
				let tempItem = {
					x: res.x,
					y: res.y,
					cols: res.cols,
					rows: res.rows,
					dragEnabled: false,
					resizeEnabled: false,
					obj: {
						showSimpleTextProperties: false,
						hidePdf: false,
						type: "text",
						isStatement: true,
						alignment: "center",
						statement: "",
						instanceStatement: "",
						textInput: "",
						extra: true,
						answers: [],
						FontPx: 13,
						tags: [],

						bold: false,
						underLine: false,
						uiBorders: false,
						emptyCell: true,
					},
					id: UUID(),
				};
				this.dragItem = "text";

				this.layoutService.section.dashboard.push(tempItem);
				this.dropId = tempItem.id;
				const { componentsService } = this;
				const comp: IComponent = componentsService.find((c) => c.id === this.dropId);
				const updateIdx: number = comp ? componentsService.indexOf(comp) : componentsService.length;
				const componentItem: IComponent = {
					id: this.dropId,
					componentRef: this.dragItem,
				};
				if (!this.componentsService[updateIdx]) {
					this.componentsService = Object.assign([], this.componentsService, {
						[updateIdx]: componentItem,
					});
				}
				this.layoutService.section["isUpdated"] = true;
				this.changeDetector.detectChanges();
			}
		});
		this.subscription4 = this.subjectService.castGridRefresh.subscribe((res) => {
			if (res.length !== 0) {
				this.arrowLeftRight("colapse");
			}
		});
		this.removeCollapsePropertiesTab();
		this.setPropertiesTab("showSectionProperties");
		this.setCollapsePropertiesTab("showSectionProperties");

		this.subscriptions.push(this.subscription1);
		this.subscriptions.push(this.subscription2);
		this.subscriptions.push(this.subscription3);
		this.subscriptions.push(this.subscription4);
		this.GetHeightValueHeaderFooter();
	}
	ngOnDestroy() {
		this.renderer.removeClass(this.document.body, "template-manager");
		this.subscriptions.forEach((subscription) => subscription.unsubscribe());
	}
	validIds = [];
	getValidIds() {
		this.validIds = [];
		let foundIds = [];
		let maxId: number = 0;
		for (let component of this.layoutService.section.dashboard) {
			let currentId = parseInt(component.obj.uicomponent_name);
			foundIds.push(currentId);
			if (maxId < currentId) {
				maxId = currentId;
			}
		}
		this.layoutService.section.uiCompIds = maxId;
		for (let i = 1; i < this.layoutService.section.uiCompIds + 5; i++) {
			if (!foundIds.includes(i)) {
				this.validIds.push(i);
			}
		}
	}
	/** change UI item, remove row / item (val=row for row deletion and col for item) */
	combinedAlignmentValue: any = "none";
	combinedHidePdf: any = true;
	combinedHasText: any = false;
	combinedHasNonText: any = false;
	combinedHasNonInput: any = false;
	combinedRequired: any = true;
	combinedLinkedOptions: any = true;
	combinedPreDefined: any = true;
	combinedShowStatement: any = true;
	combinedUIBorders: any = true;
	combinedHasNonStatement: any = false;
	combinedDisplayOptions: any = true;
	combinedHasNonRadioCheck: any = false;
	combinedHasNonLine: any = false;
	combinedHasLine: any = false;
	combinedLineHorizontal: any = false;
	combinedHasNonMultiSelect: any = false;
	combinedShowOptionsMenu: any = true;
	combinedOptionView: any = 0;
	combinedLinkedOptionsValue: any = {
		isBold: true,
		isItalic: true,
		isUnderline: true,
		listOptions: 1,
	};

	setCombinedAlignment(value) {
		this.combinedAlignmentValue = value;
		for (let component of this.selectedComponents) {
			this.layoutService.section.dashboard[component.dashboardIndex].obj.alignment = value;
		}
	}

	SetCombinedOptionsView(value) {
		this.combinedOptionView = value;
		for (let component of this.selectedComponents) {
			this.layoutService.section.dashboard[component.dashboardIndex].obj.OptionView = value;
		}
	}
	setCombinedUIBorders() {
		this.combinedUIBorders = !this.combinedUIBorders;
		for (let component of this.selectedComponents) {
			this.layoutService.section.dashboard[component.dashboardIndex].obj.uiBorders = this.combinedUIBorders;
		}
	}

	setCombinedStatement() {
		this.combinedShowStatement = !this.combinedShowStatement;
		for (let component of this.selectedComponents) {
			this.layoutService.section.dashboard[component.dashboardIndex].obj.isStatement = this.combinedShowStatement;
		}
	}

	setCombinedLinkedOption() {
		this.combinedLinkedOptions = !this.combinedLinkedOptions;
		for (let component of this.selectedComponents) {
			this.layoutService.section.dashboard[component.dashboardIndex].obj.isLinkedOption = this.combinedLinkedOptions;
		}
	}
	setCombinedBold() {
		this.combinedLinkedOptionsValue.isBold = !this.combinedLinkedOptionsValue.isBold;
		for (let component of this.selectedComponents) {
			this.layoutService.section.dashboard[component.dashboardIndex].obj.isBold = this.combinedLinkedOptionsValue.isBold;
		}
	}
	setCombinedItalic() {
		this.combinedLinkedOptionsValue.isItalic = !this.combinedLinkedOptionsValue.isItalic;
		for (let component of this.selectedComponents) {
			this.layoutService.section.dashboard[component.dashboardIndex].obj.isItalic = this.combinedLinkedOptionsValue.isItalic;
		}
	}
	setCombinedUnderline() {
		this.combinedLinkedOptionsValue.isUnderline = !this.combinedLinkedOptionsValue.isUnderline;
		for (let component of this.selectedComponents) {
			this.layoutService.section.dashboard[component.dashboardIndex].obj.isUnderline = this.combinedLinkedOptionsValue.isUnderline;
		}
	}
	setCombinedListOptions(value) {
		if (this.combinedLinkedOptionsValue.listOptions != value) {
			this.combinedLinkedOptionsValue.listOptions = value;
		} else {
			this.combinedLinkedOptionsValue.listOptions = 0;
		}
		for (let component of this.selectedComponents) {
			this.layoutService.section.dashboard[component.dashboardIndex].obj.listOptions = this.combinedLinkedOptionsValue.listOptions;
		}
	}
	setCombinedDisplayOptions() {
		this.combinedDisplayOptions = !this.combinedDisplayOptions;
		for (let component of this.selectedComponents) {
			this.layoutService.section.dashboard[component.dashboardIndex].obj.displayOption = this.combinedDisplayOptions;
		}
	}
	setCombinedLineHorizontal(e) {
		this.combinedLineHorizontal = e;
		for (let component of this.selectedComponents) {
			this.layoutService.section.dashboard[component.dashboardIndex].obj.horizontal = this.combinedLineHorizontal;
		}
	}
	rowAddItems: number = 1;
	rowReduceItems: number = 1;
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
	addRowItem(sectionIndex, noOfRows, rowMapper?, mapperIndex?) {
		this.rowAddItems = 1;

		for (let i: number = 0; i < noOfRows; i++) {
			this.updateBackUpTask("type", `mapper`);
			this.updateBackUpTask("id", this.layoutService.backupId);
			this.updateIndexes(0, -1, -1, "section");
			this.updateBackUpTask("oldObject", cloneDeep(this.layoutService.section["mapper"]));
			this.layoutService.section["mapper"].push(1);
			this.updateBackUpTask("newObject", cloneDeep(this.layoutService.section["mapper"]));
		}

		this.updateBackUpTask("type", `minRows`);
		this.updateBackUpTask("id", this.layoutService.backupId);
		this.updateIndexes(0, -1, -1, "sectionOptions");
		this.updateBackUpTask("oldObject", this.layoutService.section.options.minRows);
		this.layoutService.section.options.minRows = this.layoutService.section.options.minRows + noOfRows;
		this.updateBackUpTask("newObject", this.layoutService.section.options.minRows);
		this.updateBackUpTask("type", `maxRows`);
		this.updateBackUpTask("id", this.layoutService.backupId);
		this.updateIndexes(0, -1, -1, "sectionOptions");
		this.updateBackUpTask("oldObject", this.layoutService.section.options.maxRows);
		this.layoutService.section.options.maxRows = this.layoutService.section.options.maxRows + noOfRows;
		this.updateBackUpTask("newObject", this.layoutService.section.options.maxRows);
		this.optionRefresh(false, true);
		this.GetHeightValue();
		this.layoutService.backupId++;
	}
	selectMultipleComponents() {
		console.log(this.selectedComponents.length);

		this.setPropertiesTab("showCombinedProperties");
		this.setCollapsePropertiesTab("showCombinedProperties");
		this.combinedAlignmentValue = "none";
		this.combinedHidePdf = true;
		this.combinedRequired = true;
		this.combinedHasText = false;
		this.combinedHasNonText = false;
		this.combinedHasNonInput = false;
		this.combinedLinkedOptions = true;
		this.combinedHasNonStatement = false;
		this.combinedShowStatement = true;
		this.combinedUIBorders = true;
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

		//link style for all text
		//all multiselect display options
		//show all options && don't display options if radio/checkbox
		//not required if text
		// no value selected if different values of alignment
		// checkboxes clear if any value false
		let tempOptionView = this.layoutService.section.dashboard[this.selectedComponents[0].dashboardIndex].obj.OptionView;
		this.combinedOptionView = tempOptionView;
		let tempAlignmentValue = this.layoutService.section.dashboard[this.selectedComponents[0].dashboardIndex].obj.alignment;
		this.combinedAlignmentValue = tempAlignmentValue;
		let tempListOptions = this.layoutService.section.dashboard[this.selectedComponents[0].dashboardIndex].obj.listOptions;
		this.combinedLinkedOptionsValue.listOptions = tempListOptions;
		for (let component of this.selectedComponents) {
			let tempComponent = this.layoutService.section.dashboard[component.dashboardIndex];
			if (tempComponent.obj.alignment != tempAlignmentValue) {
				this.combinedAlignmentValue = "none";
			}
			if (tempComponent.obj.OptionView != tempOptionView) {
				this.combinedOptionView = 0;
			}
			if (!tempComponent.obj.hidePdf) {
				this.combinedHidePdf = false;
			}
			if (tempComponent.obj.type == "text") {
				this.combinedHasText = true;
			} else {
				this.combinedHasNonText = true;
			}
			if (tempComponent.obj.type != "input") {
				this.combinedHasNonInput = true;
			} else if (!tempComponent.obj.preDefind) {
				this.combinedPreDefined = false;
			}
			if (tempComponent.obj.type != "radio" && tempComponent.obj.type != "checkBox") {
				this.combinedHasNonRadioCheck = true;
			}
			if (tempComponent.obj.type == "line") {
				if (tempComponent.obj.horizontal) {
					this.combinedLineHorizontal = true;
				}
				this.combinedHasLine = true;
			} else {
				this.combinedHasNonLine = true;
			}
			if (tempComponent.obj.type == "text" || tempComponent.obj.type == "input" || tempComponent.obj.type == "line" || tempComponent.obj.type == "simpleImage" || tempComponent.obj.type == "image" || tempComponent.obj.type == "intensity" || tempComponent.obj.type == "switch" || (tempComponent.obj.type == "dropDown" && !tempComponent.obj.isMultiSelect)) {
				this.combinedShowOptionsMenu = false;
			}
			if (tempComponent.obj.type != "checkBox" && (tempComponent.obj.type != "dropDown" || !tempComponent.obj.isMultiSelect) && tempComponent.obj.type != "intellisense") {
				this.combinedHasNonMultiSelect = true;
			}
			if (!tempComponent.obj.displayOption) {
				this.combinedDisplayOptions = false;
			}
			if (tempComponent.obj.type == "line" || tempComponent.obj.type == "text" || (tempComponent.obj.type == "input" && tempComponent.obj.preDefind) || (tempComponent.obj.type == "intellisense" && tempComponent.obj.preDefind)) {
				this.combinedHasNonStatement = true;
			} else if (!tempComponent.obj.isStatement) {
				this.combinedShowStatement = false;
			}
			if (!tempComponent.obj.uiBorders) {
				this.combinedUIBorders = false;
			}

			if (!tempComponent.obj.is_required) {
				this.combinedRequired = false;
			}

			if (!tempComponent.obj.isLinkedOption) {
				this.combinedLinkedOptions = false;
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

		this.showSectionProperties = true;

		this.GetHeightValueHeaderFooter();
	}
	changeUIBorders(event) {
		for (let component of this.selectedComponents) {
			this.layoutService.section.dashboard[component.dashboardIndex].obj.leftUIBorder = event;
			this.layoutService.section.dashboard[component.dashboardIndex].obj.rightUIBorder = event;
			this.layoutService.section.dashboard[component.dashboardIndex].obj.topUIBorder = event;
			this.layoutService.section.dashboard[component.dashboardIndex].obj.bottomUIBorder = event;
		}
	}

	changeSectionUIBorders(event) {
		this.layoutService.section.leftUIBorder = event;
		this.layoutService.section.rightUIBorder = event;
		this.layoutService.section.topUIBorder = event;
		this.layoutService.section.bottomUIBorder = event;
	}

	changeUIPaddings(event) {
		for (let component of this.selectedComponents) {
			this.layoutService.section.dashboard[component.dashboardIndex].obj.leftUIPadding = event;
			this.layoutService.section.dashboard[component.dashboardIndex].obj.rightUIPadding = event;
			this.layoutService.section.dashboard[component.dashboardIndex].obj.topUIPadding = event;
			this.layoutService.section.dashboard[component.dashboardIndex].obj.bottomUIPadding = event;
		}
	}

	changeSectionUIPaddings(event) {
		this.layoutService.section.leftUIPadding = event;
		this.layoutService.section.rightUIPadding = event;
		this.layoutService.section.topUIPadding = event;
		this.layoutService.section.bottomUIPadding = event;
	}
	changeSectionBorders(event) {
		this.layoutService.section.leftSectionBorder = event;
		this.layoutService.section.rightSectionBorder = event;
		this.layoutService.section.bottomSectionBorder = event;
		this.layoutService.section.topSectionBorder = event;
	}
	removeItem(item, val, backupIdCheck, $event?) {
		this.emptySelectedComponents();
		if (this.emptyCellItemIndex.dashboardIndex != -1 && $event) {
			let tempLastK = this.layoutService.lastK;
			this.layoutService.lastK = this.emptyCellItemIndex.dashboardIndex;
			if (this.layoutService.section.dashboard[this.emptyCellItemIndex.dashboardIndex] && this.layoutService.section.dashboard[this.emptyCellItemIndex.dashboardIndex].obj.emptyCell) {
				this.removeItem(this.layoutService.section.dashboard[this.emptyCellItemIndex.dashboardIndex], "col", false);
			}
			this.layoutService.lastK = tempLastK;
		}
		this.emptyCellItem = {};
		this.emptyCellItemIndex = { dashboardIndex: -1 };
		let removedIndex = this.layoutService.lastK;

		if (val === "col") {
			if ($event) {
				$event.preventDefault();
				$event.stopPropagation();
			}
			if (this.layoutService.section && this.layoutService.section.dashboardColCount) {
				this.layoutService.section.dashboardColCount -= this.layoutService.section.dashboard[this.layoutService.lastK].cols;
			}
			this.updateBackUpTask("type", `deleteItem`);
			this.updateBackUpTask("id", this.layoutService.backupId);
			this.updateIndexes(0, this.layoutService.lastK, -1, "deleteItem");
			this.updateBackUpTask("oldObject", null);
			this.updateBackUpTask("newObject", this.layoutService.section.dashboard[this.layoutService.lastK]);
			this.layoutService.section.dashboard.splice(this.layoutService.lastK, 1);
			this.layoutService.lastK = 0;
		}
		if (val === "row") {
			if (item.rows > 1) {
				this.hoverOutRow(item);
				this.toastrService.error("only col can be deleted as item is in multiple rows", "Error");
			} else {
				const deleteRowItems = [];
				for (let i = 0; i < this.layoutService.section.dashboard.length; i++) {
					if (item.y === this.layoutService.section.dashboard[i].y && this.layoutService.section.dashboard[i].rows === 1) {
						deleteRowItems.push({ k: i });
					} else if (item.y === this.layoutService.section.dashboard[i].y && this.layoutService.section.dashboard[i].rows > 1) {
						this.hoverOutRow(item);

						this.toastrService.error("only col can be deleted as one of the item in the row is on multiple rows", "Error");
						return;
					} else if (item.y > this.layoutService.section.dashboard[i].y && this.layoutService.section.dashboard[i].rows + this.layoutService.section.dashboard[i].y > item.y) {
						this.hoverOutRow(item);

						this.toastrService.error("only col can be deleted as one of the item in the row is on multiple rows .....", "Error");
						return;
					}
				}

				if (deleteRowItems.length > 0) {
			
				


	this.customDiallogService.confirm('Delete','Are you sure you want to delete this row?','Yes','No')
	.then((confirmed) => {
		if (confirmed){
			if (this.layoutService.section["carrySections"] && this.layoutService.section["carrySections"].length && !this.layoutService.section["isUpdated"]) {
				this.customDiallogService.confirm('Carry Forward','This section is being carry forward in other templates. Changes must be manually updated. Do you still wish to continue?','Yes','No')
				.then((confirmed) => {
					if (confirmed){
						for (let x = 0; x < deleteRowItems.length; x++) {
							if ($event) {
								$event.preventDefault();
								$event.stopPropagation();
							}
							if (this.layoutService.section.dashboardColCount) {
								this.layoutService.section.dashboardColCount -= this.layoutService.section.dashboard[deleteRowItems[x].k - x].cols;
							}
							this.updateBackUpTask("type", `deleteItem`);
							this.updateBackUpTask("id", this.layoutService.backupId);
							this.updateIndexes(0, deleteRowItems[x].k - x, -1, "deleteItem");
							this.updateBackUpTask("oldObject", null);
							this.updateBackUpTask("newObject", this.layoutService.section.dashboard[deleteRowItems[x].k - x]);

							this.layoutService.section.dashboard.splice(deleteRowItems[x].k - x, 1);
						}
						this.layoutService.section["isUpdated"] = true;
						this.changeDetector.detectChanges();
					}
					
					else if(confirmed === false){

					}else{
					}
					this.layoutService.lastK = 0;

				})
				.catch();
				
			} else {
				for (let x = 0; x < deleteRowItems.length; x++) {
					if ($event) {
						$event.preventDefault();
						$event.stopPropagation();
					}
					if (this.layoutService.section && this.layoutService.section.dashboardColCount) {
						this.layoutService.section.dashboardColCount -= this.layoutService.section.dashboard[deleteRowItems[x].k - x].cols;
					}
					this.updateBackUpTask("type", `deleteItem`);
					this.updateBackUpTask("id", this.layoutService.backupId);
					this.updateIndexes(0, deleteRowItems[x].k - x, -1, "deleteItem");
					this.updateBackUpTask("oldObject", null);
					this.updateBackUpTask("newObject", this.layoutService.section.dashboard[deleteRowItems[x].k - x]);

					this.layoutService.section.dashboard.splice(deleteRowItems[x].k - x, 1);
				}
				this.layoutService.lastK = 0;
			}

		}else if(confirmed === false){
		}else{
		}
	})
	.catch();

					
				}
			}
		}

		this.showUIComponents = true;
		this.showSectionProperties = true;
		this.showTextProperties = false;
		this.showInputProperties = false;
		this.showLineProperties = false;
		this.showImageProperties = false;
		this.optionRefresh(false, true);

		if (backupIdCheck) {
			this.layoutService.backupId++;
		}
	}

	itemCopy(dashboardIndex, item) {
		// if (dashboardIndex != null && this.layoutService.section.dashboard[dashboardIndex] && !this.layoutService.section.dashboard[dashboardIndex].obj.emptyCell) {
		// 	const selBox = document.createElement("textarea");
		// 	selBox.style.position = "fixed";
		// 	selBox.style.left = "0";
		// 	selBox.style.top = "0";
		// 	selBox.style.opacity = "0";
		// 	selBox.value = JSON.stringify(this.layoutService.section.dashboard[dashboardIndex]);
		// 	document.body.appendChild(selBox);
		// 	selBox.focus();
		// 	selBox.select();
		// 	document.execCommand("copy");
		// 	document.body.removeChild(selBox);
		// } else {
		// 	this.toastrService.error("No item selected", "Error");
		// }
		try {
			navigator["clipboard"].readText().then((item) => {});
			this.toastrService.success("Item copied.", "Success", { timeOut: 6000 });
		} catch (err) {
			this.toastrService.error("Your browser doesn't support copy/paste functionality. Try using a different browser.", "Error", { timeOut: 6000 });
			return;
		}
		if (dashboardIndex != null && this.layoutService.section.dashboard[dashboardIndex] && !this.layoutService.section.dashboard[dashboardIndex].obj.emptyCell) {
			let copiedText = "";
			copiedText = JSON.stringify(this.layoutService.section.dashboard[dashboardIndex]);
			navigator["clipboard"].writeText(copiedText);
		} else {
			this.toastrService.error("No item selected", "Error", { timeOut: 6000 });
		}
	}

	itemPaste() {
		navigator["clipboard"]
			.readText()
			.then((item: any) => {
				item = JSON.parse(item);
				if (item["obj"] && item["obj"]["uicomponent_name"]) {
					this.toastrService.info("Item linking will not be copied.", "Note", { timeOut: 6000 });
					if (item["obj"]["type"] == "text") {
						item["obj"]["linked_row"] = 0;
						item["obj"]["selected_linked_row"] = 0;
					}
					item["obj"]["selected_linked_ui_component"] = 0;
					item["obj"]["linked_ui"] = 0;
					delete item["maxItemCols"];
					delete item["minItemCols"];
					delete item["maxItemRows"];
					delete item["minItemRows"];
					item["cols"] = this.emptyCellItem.cols;
					item["rows"] = this.emptyCellItem.rows;
					item["x"] = this.emptyCellItem.x;
					item["y"] = this.emptyCellItem.y;
					this.emptySelectedComponents();
					this.layoutService.lastK = this.emptyCellItemIndex.dashboardIndex;
					if (this.layoutService.section.dashboard[this.emptyCellItemIndex.dashboardIndex] && this.layoutService.section.dashboard[this.emptyCellItemIndex.dashboardIndex].obj.emptyCell) {
						this.removeItem(this.layoutService.section.dashboard[this.emptyCellItemIndex.dashboardIndex], "col", false);
					}
					// this.layoutService.lastI = this.emptyCellItemIndex.sectionIndex;
					// this.layoutService.lastK = this.emptyCellItemIndex.dashboardIndex;
					// if (this.layoutService.template.sections[this.layoutService.lastI].is_table) {
					// 	if (this.layoutService.template.sections[this.layoutService.lastI].dashboard[this.layoutService.lastK].y == 0 && this.layoutService.template.sections[this.layoutService.lastI].dashboard[this.layoutService.lastK].obj.type != "text") {
					// 		this.toastrService.error("Kindly add a text component in the first column", "Error", {
					// 			timeOut: 6000,
					// 		});
					// 		return;
					// 	}
					// 	if (this.layoutService.template.sections[this.layoutService.lastI].dashboard[this.layoutService.lastK].x == 0 && this.layoutService.template.sections[this.layoutService.lastI].dashboard[this.layoutService.lastK].obj.type != "text") {
					// 		this.toastrService.error("Kindly add a text component in the first row", "Error", {
					// 			timeOut: 6000,
					// 		});
					// 		return;
					// 	}
					// }
					// if (this.layoutService.template.sections[this.emptyCellItemIndex.sectionIndex].dashboard[this.emptyCellItemIndex.dashboardIndex]) {
					// 	this.removeItem(this.layoutService.template.sections[this.emptyCellItemIndex.sectionIndex].dashboard[this.emptyCellItemIndex.dashboardIndex], "col", false, this.emptyCellItemIndex.sectionIndex, false);
					// }
					this.subjectService.pasteItem(item);
					this.emptyCellItem = {};
					this.emptyCellItemIndex = { sectionIndex: -1, dashboardIndex: -1 };
				}
			})
			.catch((err) => {
				this.toastrService.error("No item copied", "Error", { timeOut: 6000 });
			});
	}
	// itemPaste() {
	// 	navigator["clipboard"]
	// 		.readText()
	// 		.then((item) => {
	// 			item = JSON.parse(item);
	// 			if (item["obj"] && item["obj"]["uicomponent_name"]) {
	// 				item["cols"] = this.emptyCellItem.cols;
	// 				item["rows"] = this.emptyCellItem.rows;
	// 				item["x"] = this.emptyCellItem.x;
	// 				item["y"] = this.emptyCellItem.y;
	// 				this.emptySelectedComponents();
	// 				this.layoutService.lastK = this.emptyCellItemIndex.dashboardIndex;
	// 				if (this.layoutService.section.dashboard[this.emptyCellItemIndex.dashboardIndex] && this.layoutService.section.dashboard[this.emptyCellItemIndex.dashboardIndex].obj.emptyCell) {
	// 					this.removeItem(this.layoutService.section.dashboard[this.emptyCellItemIndex.dashboardIndex], "col", false);
	// 				}
	// 				this.subjectService.pasteItem(item);
	// 				this.emptyCellItem = {};
	// 				this.emptyCellItemIndex = { dashboardIndex: -1 };
	// 			}
	// 		})
	// 		.catch((err) => {
	// 			this.toastrService.error("No item copied", "Error");
	// 		});
	// }

	selectedComponents: any = [];
	emptySelectedComponents() {
		if (this.selectedComponents.length) {
			for (let component of this.selectedComponents) {
				if (this.layoutService.section && this.layoutService.section.dashboard[this.layoutService.lastK] && this.layoutService.section.dashboard[component.dashboardIndex]) {
					this.layoutService.section.dashboard[component.dashboardIndex].isClick = false;
				}
			}
			this.selectedComponents = [];
		} else if (this.layoutService.section && this.layoutService.section.dashboard[this.layoutService.lastK]) {
			this.layoutService.section.dashboard[this.layoutService.lastK].isClick = false;
		}
	}
	searchCodes(event) {
		this.searchData = [];
		let nameFlag = 0;
		let descriptionFlag = 0;
		event.target.value = event.target.value.toLowerCase();
		let words = event.target.value.split(" ");
		for (let i = 0; i < this.preDefindAllFields.length; i++) {
			let tempName = this.preDefindAllFields[i].title.toLowerCase();
			let tempDescription = this.preDefindAllFields[i].description.toLowerCase();
			for (let j = 0; j < words.length; j++) {
				if (tempName.includes(words[j]) && nameFlag != -1) {
					nameFlag = 1;
					tempName = tempName.replace(words[j], "");
				} else {
					nameFlag = -1;
				}
				if (tempDescription.includes(words[j]) && descriptionFlag != -1) {
					descriptionFlag = 1;
					tempDescription = tempDescription.replace(words[j], "");
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
	backToMenu() {
		this.layoutService.openTemplate = false;
		this.emptyCellItem = {};
		this.emptyCellItemIndex = { dashboardIndex: -1 };
	}

	searchDataNames = [];
	SearchNames = [];
	searchUiNames(event) {
		this.searchDataNames = [];
		let firstnameFlag = 0;
		let secondnameFlag = 0;
		let words = event.target.value.split(" ");
		for (let i = 0; i < this.SearchNames.length; i++) {
			let tempFirstName = this.SearchNames[i].firstname;
			let tempSecondName = this.SearchNames[i].secondname;
			for (let j = 0; j < words.length; j++) {
				if (tempFirstName.includes(words[j]) && firstnameFlag != -1) {
					firstnameFlag = 1;
					tempFirstName = tempFirstName.replace(words[j], "");
				} else {
					firstnameFlag = -1;
				}
				if (tempSecondName.includes(words[j]) && secondnameFlag != -1) {
					secondnameFlag = 1;
					tempSecondName = tempSecondName.replace(words[j], "");
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

	preDefind() {
		if (this.preDefindAllFields[0]) {
			this.setUIProperty(0, this.layoutService.section.dashboard.length - 1, "answers", [], false);
			this.setUIProperty(0, this.layoutService.section.dashboard.length - 1, "preDefind", true, false);
			// this.layoutService.section.dashboard[this.layoutService.section.dashboard.length - 1].obj.answers = [];
			// this.layoutService.section.dashboard[this.layoutService.section.dashboard.length - 1].obj.preDefind = true;
		} else {
			this.setUIProperty(0, this.layoutService.section.dashboard.length - 1, "answers", [], false);
			this.setUIProperty(0, this.layoutService.section.dashboard.length - 1, "preDefind", true, false);
			// this.layoutService.section.dashboard[this.layoutService.section.dashboard.length - 1].obj.answers = [];
			// this.layoutService.section.dashboard[this.layoutService.section.dashboard.length - 1].obj.preDefind = true;
			this.toastrService.error("No predefined fields exist", "Error");
			return;
		}
		this.setUIProperty(0, this.layoutService.section.dashboard.length - 1, "options", [], false);
		this.setUIProperty(0, this.layoutService.section.dashboard.length - 1, "preDefinedObj", this.preDefindAllFields[0], false);

		// this.layoutService.section.dashboard[this.layoutService.section.dashboard.length - 1].obj.options = [];
		// this.layoutService.section.dashboard[this.layoutService.section.dashboard.length - 1].obj['preDefinedObj'] = this.preDefindAllFields[0];
		this.preDefindSelect({ target: { value: this.preDefindAllFields[0].id } }, true);
	}

	preDefindSelect(e, check?) {
		let tempVariable = this.layoutService.lastK;
		if (check) {
			tempVariable = this.layoutService.section.dashboard.length - 1;
		}
		let is_exist: any = 0;
		for (let i = 0; i < this.preDefindAllFields.length; i++) {
			if (this.preDefindAllFields[i].id === parseInt(e.target.value)) {
				this.setUIProperty(0, tempVariable, "preDefinedObj", this.preDefindAllFields[i], false);
				// this.layoutService.section.dashboard[tempVariable].obj['preDefinedObj'] = this.preDefindAllFields[i]
				break;
			}
		}
		// this.layoutService.section.dashboard[tempVariable].obj['preDefinedObj'] = this.preDefindAllFields[e.target.value]
		for (let i = 0; i < this.PreDefinedList.length; i++) {
			if (this.PreDefinedList[i].objectid == this.layoutService.section.dashboard[tempVariable].id) {
				is_exist = is_exist + 1;
				this.PreDefinedList[i].predefinedvalue = e.target.value;
			}
		}
		if (is_exist == 0) {
			this.PreDefinedList.push({
				objectid: this.layoutService.section.dashboard[tempVariable].id,
				predefinedvalue: e.target.value,
			});
		}

		this.preDefinedInputModel = "";
		this.searchData = this.preDefindAllFields;
		if (!check) {
			this.layoutService.backupId++;
		}
	}
	/** store dragover section values */
	setSection(sec) {
		this.isSection = sec;
		this.otherSectionDragSearchCheck = false;
	}

	/** add UI item in the dragover section */
	addItem(item: GridsterItem) {
		item.id = UUID();
		this.layoutService.section.dashboard.push(item);
	}

	/** create box on the empty cell (default grid function) */
	emptyCellClick(event: MouseEvent, item: GridsterItem) {}

	/** add new Other type Section */
	addOtherSection(check) {
		// if(check==0){
		//   setTimeout(() => {
		//     this.addOtherSection(-1)
		//   }, 10);
		//   return;
		// }
		// this.changeDetector.detectChanges()
		this.showUIComponents = true;
		this.showTextProperties = false;
		this.showImageProperties = false;
		this.showLineProperties = false;
		this.showInputProperties = false;
		this.showSectionProperties = true;

		const secNo = this.sectionNumber++;
		let name = "Section ";
		const addobj = {
			section_id: 0,
			uiCompIds: 0,
			section_title: name,
			is_header: 1,
			is_first_page: 0,
			is_default_header: 1,
			default_columns: 1,
			headerMarginLeft: 0,
			headerMarginRight: 0,
			mapper: [1],
			isSelected: true,
			defaultColumn: false,
			options: {
				gridType: GridType.VerticalFixed,
				displayGrid: DisplayGrid.Always,
				setGridSize: true,
				pushItems: true,
				fixedRowHeight: 100,
				hasContent: true,
				fixedColWidth: 750 / 1,
				disableScrollVertical: true,
				disableScrollHorizontal: true,
				swap: true,
				minCols: 1,
				maxCols: 1,
				maxRows: 1,
				minRows: 1,
				keepFixedWidthInMobile: true,
				keepFixedHeightInMobile: true,
				enableEmptyCellContextMenu: true,
				enableEmptyCellClick: true,
				enableEmptyCellDrop: true,
				// compactType: CompactType.None,
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
					stop: HomeComponent.eventStop,
					dropOverItems: false,
				},
				resizable: {
					enabled: true,
				},
			},
			dashboard: [],
		};
		if (check === 1) {
			addobj.options = this.sectionDragStart.options;
			addobj.dashboard = this.sectionDragStart.dashboard;
		}
		this.layoutService.section = addobj;
		this.changeDetector.detectChanges();
		// let index = this.layoutService.section.default_columns
		// if (this.layoutService.section.default_columns === 6) {
		//   index = 5;
		// }
		// let x: any = document.getElementById("selectCol");
		// x.options[index].selected = true;
		this.totalSection++;
		this.sectionCreated = true;

		this.collapsePropertiesTab = {
			showUIComponents: false,
			showSectionProperties: true,
			showTextProperties: false,
			showCombinedProperties: false,
			showInputProperties: false,
			showLineProperties: false,
			showImageProperties: false,
		};
		this.changeDetector.detectChanges();

		this.GetHeightValueHeaderFooter();
		this.arrowLeftRight("new");
		this.requestService.sendRequest(TemaplateManagerUrlsEnum.mappingKeywords, "GET", REQUEST_SERVERS.fd_api_url).subscribe((res: any) => {
			this.layoutService.section["mappingKeyWords"] = res.result.data;
		});
	}

	arrowLeftRight(direction) {
		if (direction === "left") {
			if (this.leftSection === true) {
				this.leftSection = false;
				this.hideLeftSection = true;
			} else {
				this.leftSection = true;
				this.hideLeftSection = false;
			}
		} else if (direction === "right") {
			if (this.rightSection === true) {
				this.rightSection = false;
			} else {
				this.rightSection = true;
			}
		}
		this.subjectService.resizeRefreshItem("resize");
	}
	optionRefresh(event, check) {
		if (event) {
			event.preventDefault();
			event.stopPropagation();
			setTimeout(() => {
				this.optionRefresh(false, check);
			}, 10);
			return;
		}
		if (check == false) {
			this.layoutService.collapseSectionIndex = !this.layoutService.collapseSectionIndex;
		}
		this.layoutService.section.options = {
			gridType: GridType.VerticalFixed,
			displayGrid: DisplayGrid.Always,
			setGridSize: true,
			pushItems: true,
			fixedRowHeight: 100,
			fixedColWidth: 750 / this.layoutService.section.default_columns,
			disableScrollVertical: true,
			disableScrollHorizontal: true,
			swap: true,
			minCols: this.layoutService.section.options.minCols,
			maxCols: this.layoutService.section.options.maxCols,
			maxRows: this.layoutService.section.options.maxRows,
			minRows: this.layoutService.section.options.minRows,
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
			draggable: this.layoutService.section.options.draggable,
			resizable: this.layoutService.section.options.resizable,
		};
		this.changeDetector.markForCheck();
	}

	/** Gridster functions for draggeable items **/
	/** package function on drag satrt */
	static eventStart(item: GridsterItem, itemComponent: GridsterItemComponentInterface, event: MouseEvent) {}

	/** package function on drag stop */
	static eventStop(item: GridsterItem, itemComponent: GridsterItemComponentInterface, event: MouseEvent) {}

	/** package function on drop on another item */
	static overlapEvent(source: GridsterItem, target: GridsterItem, grid: GridsterComponent) {}

	/** when a UI component is clicked */
	itemClick(dashboardIndex, item) {
		// if (this.currentCollapseCheck) {
		//   setTimeout(() => {
		//     this.itemClick(dashboardIndex, item);
		//   }, 100);
		//   return;
		// }
		let tempCombinedCheck = true;
		// console.log(event.shiftKey);
		if (this.selectedComponents.length && this.shiftPressed) {
			for (let i = 0; i < this.selectedComponents.length; i++) {
				if (this.layoutService.section.dashboard[dashboardIndex] && this.selectedComponents[i].dashboardIndex == dashboardIndex) {
					this.layoutService.section.dashboard[dashboardIndex]["isClick"] = false;
					this.selectedComponents.splice(i, 1);
					tempCombinedCheck = false;
				}
			}
			if (tempCombinedCheck && this.layoutService.section.dashboard[dashboardIndex]) {
				this.selectedComponents.push({ dashboardIndex: dashboardIndex, type: item.obj.type });
				this.layoutService.section.dashboard[dashboardIndex]["isClick"] = true;
			}

			if (this.selectedComponents.length > 1) {
				this.selectMultipleComponents();
				return;
			} else if (this.selectedComponents.length > 0) {
				dashboardIndex = this.selectedComponents[0].dashboardIndex;
				item = this.layoutService.section.dashboard[this.selectedComponents[0].dashboardIndex];
			} else {
				return;
			}
		} else {
			if (this.showCombinedProperties) {
				this.showCombinedProperties = false;
				this.collapsePropertiesTab["showCombinedProperties"] = false;
				this.GetHeightValueHeaderFooter();
			}
			if (this.layoutService.section.dashboard[dashboardIndex]) {
				this.layoutService.section.dashboard[dashboardIndex]["isClick"] = true;
			}
		}
		this.selectedComponents = [];
		this.selectedComponents.push({ dashboardIndex: dashboardIndex, type: item.obj.type });
		if (this.layoutService.lastK == dashboardIndex && ((item.obj.type === "text" && this.showTextProperties && this.collapsePropertiesTab.showTextProperties) || (item.obj.type === "input" && this.showInputProperties && this.collapsePropertiesTab.showInputProperties) || (item.obj.type === "line" && this.showLineProperties && this.collapsePropertiesTab.showLineProperties) || (item.obj.type === "simpleImage" && this.showImageProperties && this.collapsePropertiesTab.showImageProperties))) {
			return;
		} else {
			for (let j = 0; j < this.layoutService.section.dashboard.length && this.layoutService.section.dashboard[j]; j++) {
				this.layoutService.section.dashboard[j]["isClick"] = false;
			}
			if (this.layoutService.section.dashboard[dashboardIndex]) {
				this.layoutService.section.dashboard[dashboardIndex]["isClick"] = true;
			}
			this.layoutService.lastK = dashboardIndex;
			this.removeCollapsePropertiesTab();
			if (item.obj.type === "text" && !this.showTextProperties) {
				this.setPropertiesTab("showTextProperties");
				this.setCollapsePropertiesTab("showTextProperties");
			}
			if (item.obj.type === "simpleImage" && !this.showImageProperties) {
				this.setPropertiesTab("showImageProperties");
				this.setCollapsePropertiesTab("showImageProperties");
			}

			if (item.obj.type === "line" && !this.showLineProperties) {
				this.setPropertiesTab("showLineProperties");
				this.setCollapsePropertiesTab("showLineProperties");
			}
			if (item.obj.type === "input" && !this.showInputProperties) {
				this.setPropertiesTab("showInputProperties");
				this.setCollapsePropertiesTab("showInputProperties");
				this.preDefindAllFields = this.PreDefinedListText;
			}
			this.setPropertiesTab("showSectionProperties");
			this.GetHeightValueHeaderFooter();
			this.changeDetector.detectChanges();
		}
	}
	backupTask: any = {};

	updateBackUpTask(property, object) {
		if (typeof object == "object") {
			this.backupTask[`${property}`] = cloneDeep(object);
		} else {
			this.backupTask[`${property}`] = object;
		}
		if (property == "newObject") {
			if (this.layoutService.backupIndex != -2) {
				if (this.layoutService.backupIndex == -1) {
					this.layoutService.backupIndex = 0;
				}
				this.layoutService.backupQueue.splice(this.layoutService.backupIndex + 1);
			}
			this.layoutService.backupQueue.push(cloneDeep(this.backupTask));
			this.backupTask = {};
			this.layoutService.backupIndex = -2;
			if (this.layoutService.backupQueue.length > 500) {
				let shiftedTask = this.layoutService.backupQueue.shift();
				while (this.layoutService.backupQueue.length && this.layoutService.backupQueue[0].id == shiftedTask.id) {
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
	/** create new template */
	createNewTemplate() {
		if (this.currentCollapseCheck) {
		  setTimeout(() => {
		    this.createNewTemplate();
		  }, 100);
		  return;
		}
		if (this.layoutService.section.dashboard.length > 0) {

			this.customDiallogService.confirm('Current Progress','Current progress will be lost. Are you sure you want to continue?','Yes','No')
		.then((confirmed) => {
			if (confirmed){
				this.emptySelectedComponents();
				this.changeDetector.detectChanges();
				this.templateSaved = false;
				this.addOtherSection(0);
				this.templateCreated = false;
				this.showSectionProperties = true;
				this.showUIComponents = false;
				this.showTextProperties = false;
				this.showLineProperties = false;
				this.showInputProperties = false;
				this.showImageProperties = false;
				this.setCollapsePropertiesTab("showSectionProperties");
				this.GetHeightValueHeaderFooter();
				this.changeDetector.detectChanges();
			}else if(confirmed === false){
			}else{
			}
		})
		.catch();
		
		} else {
		
			this.emptySelectedComponents();
			this.changeDetector.detectChanges();
			this.templateSaved = false;
			this.addOtherSection(0);
			this.templateCreated = false;
			this.showSectionProperties = true;
			this.showUIComponents = false;
			this.showTextProperties = false;
			this.showLineProperties = false;
			this.showInputProperties = false;
			this.showImageProperties = false;
			this.setCollapsePropertiesTab("showSectionProperties");
			this.GetHeightValueHeaderFooter();
			this.changeDetector.detectChanges();
		}
	}
	statementUpdate() {
		this.layoutService.refreshObject(this.layoutService.section.dashboard[this.layoutService.lastK].obj);
	}
	/** set section properties */
	sectionsProperties() {
		// if (this.currentCollapseCheck) {
		//   setTimeout(() => {
		//     this.sectionsProperties();
		//   }, 100);
		//   return;
		// }
		for (let i = 0; this.layoutService.section && i < this.layoutService.section.dashboard.length; i++) {
			let item = this.layoutService.section.dashboard[i];
			if (this.layoutService.section.dashboard[i].obj.emptyCell) {
				let tempLastK = this.layoutService.lastK;
				this.layoutService.lastK = i;
				this.removeItem(this.layoutService.section.dashboard[i], "col", false);
				i--;
				this.layoutService.lastK = tempLastK;
			}
		}

		this.emptyCellItem = {};
		this.emptyCellItemIndex = { sectionIndex: -1, dashboardIndex: -1 };
		this.emptySelectedComponents();
		this.changeDetector.detectChanges();
		this.removeCollapsePropertiesTab();
		this.setPropertiesTab("showUIComponents");
		this.setPropertiesTab("showSectionProperties");
		this.setCollapsePropertiesTab("showUIComponents");
		// if (!this.layoutService.section.defaultColumn) {
		// let index = this.layoutService.section.default_columns
		// if (this.layoutService.section.default_columns === 6) {
		//   index = 5;
		// }
		// let x: any = document.getElementById("selectCol");
		// x.options[index].selected = true;
		// }

		this.changeDetector.detectChanges();

		this.GetHeightValueHeaderFooter();
	}
	setSectionColumn(e: any, check) {
		if (check != -1) {
			this.layoutService.section.defaultColumn = true;
			this.layoutService.section.default_columns = parseInt(e.target.value);
			this.layoutService.section.options.minCols = parseInt(e.target.value);
			this.layoutService.section.options.maxCols = parseInt(e.target.value);
			this.layoutService.section.options.fixedColWidth = 750 / parseInt(e.target.value);
		} else {
			if (parseInt(e.target.value) < this.layoutService.section.options.minCols) {
				for (let i = 0; i < this.layoutService.section.dashboard.length; i++) {
					if (this.layoutService.section.dashboard[i].x + this.layoutService.section.dashboard[i].cols > parseInt(e.target.value)) {
						this.toastrService.error("Remove UI component before changing the columns !");
						if (this.layoutService.section.options.maxCols < 6) {
							e.target.selectedIndex = this.layoutService.section.options.maxCols;
						} else {
							e.target.selectedIndex = 5;
						}
						e.preventDefault();
						e.stopPropagation();

						return;
					}
				}
			}
			this.layoutService.section.defaultColumn = true;
			this.layoutService.section.default_columns = parseInt(e.target.value);
			this.layoutService.section.options.minCols = parseInt(e.target.value);
			this.layoutService.section.options.maxCols = parseInt(e.target.value);
			this.layoutService.section.options.fixedColWidth = 750 / parseInt(e.target.value);
		}
		this.optionRefresh(false, true);
	}
	/** Section Properties */

	/** hover to show the delete item */
	itemDeleteHover(item) {
		this.layoutService.section.dashboard[this.layoutService.lastK].hover = true;
	}

	/** hover out to change back item */
	hoverOut(item) {
		this.layoutService.section.dashboard[this.layoutService.lastK].hover = false;
	}

	/** hover to show the delete row items */
	itemDeleteHoverRow(item) {
		for (let i = 0; i < this.layoutService.section.dashboard.length; i++) {
			if (item.y === this.layoutService.section.dashboard[i].y) {
				this.layoutService.section.dashboard[i].hover = true;
			} else if (item.y > this.layoutService.section.dashboard[i].y && this.layoutService.section.dashboard[i].rows + this.layoutService.section.dashboard[i].y > item.y) {
				this.layoutService.section.dashboard[i].hover = true;
			}
		}
	}

	/** hover out to change back row item */
	hoverOutRow(item) {
		for (let i = 0; i < this.layoutService.section.dashboard.length; i++) {
			if (item.y === this.layoutService.section.dashboard[i].y) {
				this.layoutService.section.dashboard[i].hover = false;
			} else if (item.y > this.layoutService.section.dashboard[i].y && this.layoutService.section.dashboard[i].rows + this.layoutService.section.dashboard[i].y > item.y) {
				this.layoutService.section.dashboard[i].hover = true;
			}
		}
	}

	/** item id check on dragover */
	setDropId(dropId: string): void {
		this.dropId = dropId;
	}

	/** drop item id check on drop */
	dropItem(dragId: string): void {
		this.dragItem = dragId;
		if (dragId === "text") {
			this.uiObject = this.textObject;
		} else if (dragId === "simpleImage") {
			this.uiObject = this.simpleImageObject;
		} else if (dragId === "input") {
			this.uiObject = this.inputObject;
		} else if (dragId === "line") {
			this.uiObject = this.lineObject;
		}
		this.sectionDragStart = null;
	}

	widthOptions: Options = {
		floor: 0,
		ceil: 100,
	};

	widthChange(value: number, lastK) {
		this.layoutService.section.dashboard[lastK].obj.width = value;
	}
	/** reference of component to be added */
	getComponentRef(id: string) {
		const comp = this.componentsService.find((c) => c.id === id);
		return comp ? comp.componentRef : null;
	}

	/** Route Integration start */
	/** Save New Template */
	public addTemplate() {
		this.layoutService.section.section_title = this.layoutService.section.section_title.trim();
		if (!this.layoutService.section.section_title.length) {
			this.toastrService.error("Section name is required!");
			return;
		}
		if (this.layoutService.section.isUpdated) {
			delete this.layoutService.section.isUpdated;
		}
		for(let component of this.layoutService.section.dashboard){
			if(component.obj.statement){
				component.obj.statement = component.obj.statement.replaceAll('<font size="6">', '<div style="font-size:xx-large">');
				component.obj.statement = component.obj.statement.replaceAll('<font size="5">', '<div style="font-size:x-large">');
				component.obj.statement = component.obj.statement.replaceAll('<font size="4">', '<div style="font-size:large">');
				component.obj.statement = component.obj.statement.replaceAll('<font size="3">', '<div style="font-size:medium">');
				component.obj.statement = component.obj.statement.replaceAll('<font size="2">', '<div style="font-size:small">');
				component.obj.statement = component.obj.statement.replaceAll('<font size="1">', '<div style="font-size:x-small">');
				component.obj.statement = component.obj.statement.replaceAll('</font>', '</div>');
			}
		}
		this.requestService.sendRequest(TemplateMasterUrlEnum.addHeaderFooter, "POST", REQUEST_SERVERS.templateManagerUrl, this.layoutService.section).subscribe((res: any) => {
			this.emptySelectedComponents();
			this.templateSaved = true;
			this.toastrService.success(res.message, "Success");
			this.layoutService.section.section_id = res.data[0].section_id;
			for (let j = 0; j < this.layoutService.section.dashboard.length; j++) {
				this.layoutService.section.dashboard[j].uicomponent_id = res.data[0].dashboard[j].uicomponent_id;
			}
		});
		this.GetHeightValueHeaderFooter();
	}

	public saveNewTemplate() {
		this.layoutService.section.section_title = this.layoutService.section.section_title.trim();
		if (!this.layoutService.section.section_title.length) {
			this.toastrService.error("Section name is required!");
			return;
		}
		delete this.layoutService.section["section_id"];
		for (let j = 0; j < this.layoutService.section.dashboard.length; j++) {
			delete this.layoutService.section.dashboard[j]["uicomponent_id"];
		}
		if (this.layoutService.section.isUpdated) {
			delete this.layoutService.section.isUpdated;
		}
		this.requestService.sendRequest(TemplateMasterUrlEnum.addHeaderFooter, "POST", REQUEST_SERVERS.templateManagerUrl, this.layoutService.section).subscribe((res: any) => {
			this.templateSaved = true;
			this.toastrService.success(res.message, "Success");
			this.layoutService.section["section_id"] = res.data[0].section_id;
			for (let j = 0; j < this.layoutService.section.dashboard.length; j++) {
				this.layoutService.section.dashboard[j].uicomponent_id = res.data[0].dashboard[j].uicomponent_id;
			}
		});
	}

	offset = 0;
	sectionShowMore = true;
	/** Search  Template Route */
	public getHeaderFooter(check) {
		if (check) {
			this.offset += 10;
		} else {
			this.offset = 0;
		}
		this.showSideSections = false;
		const obj = {
			searchParams: this.searchParam, // search input
			offset: this.offset,
		};
		this.requestService.sendRequest(TemplateMasterUrlEnum.getHeaderFooter, "POST", REQUEST_SERVERS.templateManagerUrl, obj).subscribe((res: any) => {
			if (!check) {
				this.searchSections = [];
			}
			if (res.data[0].sections.length < 10) {
				this.sectionShowMore = false;
			} else {
				this.sectionShowMore = true;
			}
			this.changeDetector.detectChanges();
			this.searchSections = this.searchSections.concat(res.data[0].sections);
			this.changeDetector.markForCheck();
		});
	}
	addNewUICompOption(type) {
		const len = this.layoutService.section.dashboard[this.layoutService.lastK].obj.options.length + 1;
		this.layoutService.section.dashboard[this.layoutService.lastK].obj.options.push({
			label: "Option " + len,
			input: false,
			id: len + 1,
			link: false,
			hide: false,
			selected: false,
			inputValue: "Type here!",
			selectedLinkSection: {},
		});
	}
	/** Refresh Gridster */
	public refreshGridster() {
		this.changeDetector.detectChanges();
		this.layoutService.section.options = {
			gridType: GridType.VerticalFixed,
			displayGrid: DisplayGrid.Always,
			setGridSize: true,
			pushItems: true,
			fixedRowHeight: 100,
			fixedColWidth: 750 / this.layoutService.section.default_columns,
			disableScrollVertical: true,
			disableScrollHorizontal: true,
			swap: true,
			minCols: this.layoutService.section.options.minCols,
			maxCols: this.layoutService.section.options.maxCols,
			maxRows: this.layoutService.section.options.maxRows,
			minRows: this.layoutService.section.options.minRows,
			keepFixedWidthInMobile: true,
			keepFixedHeightInMobile: true,
			enableEmptyCellContextMenu: true,
			enableEmptyCellClick: true,
			enableEmptyCellDrop: true,
			// compactType: CompactType.None,
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
				stop: HomeComponent.eventStop,
				dropOverItems: false,
			},
			resizable: {
				enabled: true,
			},
		};
		this.changeDetector.markForCheck();
	}
	applyTempId = -1;
	public applySection(sectionId, index, search) {
		// if (this.currentCollapseCheck) {
		//   setTimeout(() => {
		//     this.createNewTemplate();
		//   }, 100);
		//   return;
		// }

		this.applyTempId = parseInt(sectionId);
		this.emptySelectedComponents();
		this.changeDetector.detectChanges();
		this.removeCollapsePropertiesTab();
		this.setPropertiesTab("showSectionProperties");
		this.setCollapsePropertiesTab("showSectionProperties");

		this.GetHeightValueHeaderFooter();
		this.changeDetector.detectChanges();
		this.sectionCreated = true;
		const data = cloneDeep(this.searchSections[index]);
		if (typeof data.options === "string") {
			data.options = JSON.parse(data.options);
		}
		for (let i = 0; i < data.dashboard.length; i++) {
			this.componentsService.push({
				id: data.dashboard[i].id,
				componentRef: data.dashboard[i].obj.type,
			});
			this.layoutService.componentsService = JSON.parse(JSON.stringify(this.componentsService));
		}
		this.layoutService.section = data;
		this.refreshGridster();
	}

	/** Apply Section */
	public viewSection(sectionId, index, search) {
		this.sectionCreated = true;
		const data = cloneDeep(this.searchSections[index]);
		if (typeof data.options === "string") {
			data.options = JSON.parse(data.options);
		}
		for (let i = 0; i < data.dashboard.length; i++) {
			this.componentsService.push({
				id: data.dashboard[i].id,
				componentRef: data.dashboard[i].obj.type,
			});
			this.layoutService.componentsService = JSON.parse(JSON.stringify(this.componentsService));
		}
		this.layoutService.sectionsSearch = { options: data.options, dashboard: data.dashboard };
		this.refreshGridster();
	}

	/** drag start of search section */
	dragSectionSearchStart(search) {
		this.dragItem = null;
		this.sectionDragStart = JSON.parse(JSON.stringify(search));
	}

	/** drop search section */
	dropSearchSection() {
		if (this.sectionDragStart && this.sectionDragStart.section_id) {
			const obj = {
				section_id: parseInt(this.sectionDragStart.section_id),
			};
			const sectionDragCopy = JSON.parse(JSON.stringify(this.sectionDragStart));
			this.sectionDragStart.section_id = null;
			this.requestService.sendRequest(TemplateMasterUrlEnum.getUIComponentsBySection, "POST", REQUEST_SERVERS.templateManagerUrl, obj).subscribe((res: any) => {
				this.sectionCreated = true;
				const data = res.data;
				for (let i = 0; i < data.length; i++) {
					// data[i].obj.statement = this.sanitizer.bypassSecurityTrustHtml(data[i].obj.statement);
					this.layoutService.section.uiCompIds++;
					data[i].obj.uicomponent_name = JSON.stringify(this.layoutService.section.uiCompIds);
					delete data[i].uicomponent_id;
					this.componentsService.push({ id: data[i].id, componentRef: data[i].obj.type });
					this.layoutService.componentsService = JSON.parse(JSON.stringify(this.componentsService));
				}
				sectionDragCopy.dashboard = data;
				this.sectionDragStart.dashboard = data;
				if (typeof sectionDragCopy.options === "string") {
					sectionDragCopy.options = JSON.parse(sectionDragCopy.options);
				}
				if (this.otherSectionDragSearchCheck) {
					sectionDragCopy.parentId = 0;
				}
				this.refreshGridster();
			});
		}
	}

	reduceRow(index, noOfRows, rowMapper?, rowMapperIndex?) {
		let rowsToBePopped: number = 0;
		if (this.layoutService.section.options.maxRows == 1 || this.layoutService.section.options.maxRows - noOfRows<=0) {
			this.toastrService.error("Cannot delete first row", "", {
				timeOut: 6000,
			});
			return;
		}
		for (let w: number = 0; w < this.layoutService.section.dashboard.length; w++) {
			if (this.layoutService.section.dashboard[w].obj.emptyCell) {
				this.layoutService.section.dashboard.splice(w, 1);
				this.emptyCellItem = {};
				this.emptyCellItemIndex = { sectionIndex: -1, dashboardIndex: -1 };
				w--;
				continue;
			}
			if (
				this.layoutService.section.dashboard[w].y + this.layoutService.section.dashboard[w].rows >
				this.layoutService.section.options.maxRows - noOfRows
			) {
				this.toastrService.error("Cannot delete non empty rows", "", {
					timeOut: 6000,
				});
				return;
			}
		}
		for (let rowIndex: number = 0; rowIndex < noOfRows && this.layoutService.section["mapper"].length; rowIndex++) {
			this.layoutService.section["mapper"].pop();
			rowsToBePopped++;
		}

		this.layoutService.section.options.maxRows -= rowsToBePopped;
		this.layoutService.section.options.minRows -= rowsToBePopped;
		for (let i: number = 0; i < this.layoutService.section.dashboard.length; i++) {
			const obj = cloneDeep(this.layoutService.section.dashboard[i]);
			if (obj.maxItemRows) {
				obj.maxItemRows = this.layoutService.section.options.minRows;
			}
			if (obj.rows + obj.y > this.layoutService.section.options.minRows) {
				if (obj.rows > 1) {
					obj.rows -= 1;
				} else {
					obj.y -= 1;
				}
			}
			this.layoutService.section.dashboard[i] = obj;
		}
		this.optionRefresh(false, true);
	}
	/** Route Integration End */
	/** Reduce height of row */
	// reduceRow() {
	//   for (let w = 0; w < this.layoutService.section.dashboard.length; w++) {
	//     if ((this.layoutService.section.dashboard[w].y + this.layoutService.section.dashboard[w].rows)
	//       > this.layoutService.section.options.maxRows - 1) {
	//       this.toastrService.error('last row contains UI, remove UI for reducing the rows')
	//       return;
	//     }
	//   }
	//   this.layoutService.section.options.maxRows -= 1;
	//   this.layoutService.section.options.minRows -= 1;
	//   this.layoutService.section['mapper'].pop()
	//   for (let i = 0; i < this.layoutService.section.dashboard.length; i++) {
	//     const obj = cloneDeep(this.layoutService.section.dashboard[i]);
	//     if (obj.maxItemRows) {
	//       obj.maxItemRows = this.layoutService.section.options.minRows;
	//     }
	//     if (obj.rows + obj.y > this.layoutService.section.options.minRows) {
	//       if (obj.rows > 1) {
	//         obj.rows -= 1;
	//       } else {
	//         obj.y -= 1;
	//       }
	//     }
	//     this.layoutService.section.dashboard[i] = obj;
	//   }
	//   this.optionRefresh(false, false);
	// }

	openPopover(popover) {
		if (popover.isOpen()) {
			popover.close();
		}
	}
	public openModel(row?) {
		if (this.layoutService.section.section_id) {
			const ngbModalOptions: NgbModalOptions = {
				backdrop: "static",
				keyboard: false,
				windowClass: "modal_extraDOc",
			};
			this.layoutService.headerFooterModal = this.modalService.open(HeaderFooterModalComponent, ngbModalOptions);
		} else {
			this.toastrService.error("Please save the template before adding permissions.", "Error");
		}
	}

	public header() {
		if (this.layoutService.section.is_header) {
			this.layoutService.section.is_header = 0;
		} else {
			this.layoutService.section.is_header = 1;
		}
	}
	public firstPageHeader() {
		if (this.layoutService.section.is_first_page) {
			this.layoutService.section.is_first_page = 0;
		} else {
			this.layoutService.section.is_first_page = 1;
		}
	}
	public defaultHeader() {
		if (this.layoutService.section.is_default_header) {
			this.layoutService.section.is_default_header = 0;
		} else {
			this.layoutService.section.is_default_header = 1;
		}
	}
	GetHeightValueHeaderFooter() {
		this.HeightValueHeader = 0;
		if (this.showUIComponents == true) {
			this.HeightValueHeader = this.HeightValueHeader + 1;
		}
		if (this.showSectionProperties == true) {
			this.HeightValueHeader = this.HeightValueHeader + 1;
		}
		if (this.showTextProperties == true) {
			this.HeightValueHeader = this.HeightValueHeader + 1;
		}
		if (this.showImageProperties == true) {
			this.HeightValueHeader = this.HeightValueHeader + 1;
		}
		if (this.showInputProperties == true) {
			this.HeightValueHeader = this.HeightValueHeader + 1;
		}

		if (this.showLineProperties == true) {
			this.HeightValueHeader = this.HeightValueHeader + 1;
		}
		if (this.showCombinedProperties == true) {
			this.HeightValueHeader = this.HeightValueHeader + 1;
		}
		let x = this.HeightValueHeader;
	}
	currentCollapseCheck = false;
	removeCollapsePropertiesTab() {
		this.showUIComponents = false;
		this.showSectionProperties = false;
		this.showTextProperties = false;
		this.showCombinedProperties = false;
		this.showInputProperties = false;
		this.showLineProperties = false;
		this.showImageProperties = false;
		this.collapsePropertiesTab["showUIComponents"] = false;
		this.collapsePropertiesTab["showSectionProperties"] = false;
		this.collapsePropertiesTab["showTextProperties"] = false;
		this.collapsePropertiesTab["showCombinedProperties"] = false;
		this.collapsePropertiesTab["showInputProperties"] = false;
		this.collapsePropertiesTab["showLineProperties"] = false;
		this.collapsePropertiesTab["showImageProperties"] = false;
	}
	setPropertiesTab(value) {
		if (value.length) {
			this[value] = true;
		}
	}
	setCollapsePropertiesTab(value) {
		if (value.length) {
			this.collapsePropertiesTab[value] = true;
		}
	}
	async collapseFunction(props) {
		let check = false;
		if (this.collapsePropertiesTab[`${props}`]) {
			check = true;
		}
		this.collapsePropertiesTab = {
			showUIComponents: false,
			showSectionProperties: false,
			showTextProperties: false,
			showCombinedProperties: false,
			showInputProperties: false,
			showLineProperties: false,
			showImageProperties: false,
		};
		if (!check) {
			this.collapsePropertiesTab[`${props}`] = true;
		}
		console.log(this.collapsePropertiesTab);
	}
	UpdateNames() {
		for (let j: number = 0; j < this.layoutService.section.dashboard.length; j++) {
			if (this.layoutService.section.dashboard[j].obj.multilinked && this.layoutService.section.dashboard[j].obj.MultiSelectObj.objectid == this.layoutService.section.dashboard[this.layoutService.lastK].id) {
				this.layoutService.section.dashboard[j].obj.MultiSelectObj.secondname = this.layoutService.section.dashboard[this.layoutService.lastK].obj.second_name;
			} else if (this.layoutService.section.dashboard[j].obj.multilinked && this.layoutService.section.dashboard[j].obj.MultiSelectObj.objectid != this.layoutService.section.dashboard[this.layoutService.lastK].id) {
				for (let ab: number = 0; ab < this.searchDataNames.length; ab++) {
					if (this.searchDataNames[ab].objectid == this.layoutService.section.dashboard[this.layoutService.lastK].id) {
						this.searchDataNames[ab].secondname = this.layoutService.section.dashboard[this.layoutService.lastK].obj.second_name;
					}
				}
			}
		}
	}
	lineSelectedProp = "Size";
	lineSize(e) {
		this.setUIProperty(0, this.layoutService.lastK, "size", e.target.value, true);
		this.changeDetector.detectChanges();
	}
	lineType(e) {
		this.setUIProperty(0, this.layoutService.lastK, "typeLine", e.target.value, true);
		this.changeDetector.detectChanges();
	}
	lineColor(color) {
		this.setUIProperty(0, this.layoutService.lastK, "color", color, true);
		this.changeDetector.detectChanges();
	}
	lineHorizontal(e) {
		this.setUIProperty(0, this.layoutService.lastK, "horizontal", e, true);
		this.changeDetector.detectChanges();
	}
	selectLineProperty(params) {
		this.lineSelectedProp = params;
		this.changeDetector.detectChanges();
	}
	/** add statement check */
	checkBoxStmt() {
		if (this.layoutService.section.dashboard[this.layoutService.lastK].obj.isStatement == true) {
			this.layoutService.section.dashboard[this.layoutService.lastK].obj.isStatement = false;
		} else {
			this.layoutService.section.dashboard[this.layoutService.lastK].obj.isStatement = true;
		}
		this.changeDetector.detectChanges();
	}

	setSectionProperty(sectionIndex, property, value, check) {
		this.updateBackUpTask("type", `${property}`);
		this.updateBackUpTask("id", this.layoutService.backupId);
		this.updateIndexes(sectionIndex, -1, -1, "section");
		this.updateBackUpTask("oldObject", this.layoutService.section[`${property}`]);
		this.layoutService.section[`${property}`] = value;
		this.updateBackUpTask("newObject", this.layoutService.section[`${property}`]);
		if (check) {
			this.layoutService.backupId++;
		}
		this.changeDetector.detectChanges();
	}
	invertSectionProperty(sectionIndex, property, check) {
		this.updateBackUpTask("type", `${property}`);
		this.updateBackUpTask("id", this.layoutService.backupId);
		this.updateIndexes(sectionIndex, -1, -1, "section");
		this.updateBackUpTask("oldObject", this.layoutService.section[`${property}`]);
		this.layoutService.section[`${property}`] = !this.layoutService.section[`${property}`];
		this.updateBackUpTask("newObject", this.layoutService.section[`${property}`]);
		if (check) {
			this.layoutService.backupId++;
		}
		this.changeDetector.detectChanges();
	}

	invertUIProperty(sectionIndex, dashboardIndex, property, check) {
		this.updateBackUpTask("type", `${property}`);
		this.updateBackUpTask("id", this.layoutService.backupId);
		this.updateIndexes(sectionIndex, dashboardIndex, -1, "obj");
		this.updateBackUpTask("oldObject", this.layoutService.section.dashboard[dashboardIndex].obj[`${property}`]);
		this.layoutService.section.dashboard[dashboardIndex].obj[`${property}`] = !this.layoutService.section.dashboard[dashboardIndex].obj[`${property}`];
		this.updateBackUpTask("newObject", this.layoutService.section.dashboard[dashboardIndex].obj[`${property}`]);
		if (check) {
			this.layoutService.backupId++;
		}

		this.layoutService.refreshObject(this.layoutService.section.dashboard[dashboardIndex].obj);
		this.changeDetector.detectChanges();
	}
	invertUIPropertyOptions(sectionIndex, dashboardIndex, property, optionIndex, check) {
		this.updateBackUpTask("type", `${property}`);
		this.updateBackUpTask("id", this.layoutService.backupId);
		this.updateIndexes(sectionIndex, dashboardIndex, optionIndex, "option");
		this.updateBackUpTask("oldObject", this.layoutService.section.dashboard[dashboardIndex].obj.options[optionIndex][`${property}`]);
		this.layoutService.section.dashboard[dashboardIndex].obj.options[optionIndex][`${property}`] = !this.layoutService.section.dashboard[dashboardIndex].obj.options[optionIndex][`${property}`];
		this.updateBackUpTask("newObject", this.layoutService.section.dashboard[dashboardIndex].obj.options[optionIndex][`${property}`]);
		if (check) {
			this.layoutService.backupId++;
		}
		this.layoutService.refreshObject(this.layoutService.section.dashboard[dashboardIndex].obj);
		this.changeDetector.detectChanges();
	}
	setUIProperty(sectionIndex, dashboardIndex, property, value, check) {
		this.updateBackUpTask("type", `${property}`);
		this.updateBackUpTask("id", this.layoutService.backupId);
		this.updateIndexes(sectionIndex, dashboardIndex, -1, "obj");
		this.updateBackUpTask("oldObject", this.layoutService.section.dashboard[dashboardIndex].obj[`${property}`]);
		this.layoutService.section.dashboard[dashboardIndex].obj[`${property}`] = value;
		this.updateBackUpTask("newObject", this.layoutService.section.dashboard[dashboardIndex].obj[`${property}`]);
		if (check) {
			this.layoutService.backupId++;
		}
		this.layoutService.refreshObject(this.layoutService.section.dashboard[dashboardIndex].obj);
		this.changeDetector.detectChanges();
	}
	setUIPropertyOptions(sectionIndex, dashboardIndex, property, value, optionIndex, check) {
		this.updateBackUpTask("type", `${property}`);
		this.updateBackUpTask("id", this.layoutService.backupId);
		this.updateIndexes(sectionIndex, dashboardIndex, optionIndex, "option");
		this.updateBackUpTask("oldObject", this.layoutService.section.dashboard[dashboardIndex].obj.options[optionIndex][`${property}`]);
		this.layoutService.section.dashboard[dashboardIndex].obj.options[optionIndex][`${property}`] = value;
		this.updateBackUpTask("newObject", this.layoutService.section.dashboard[dashboardIndex].obj.options[optionIndex][`${property}`]);
		if (check) {
			this.layoutService.backupId++;
		}
		this.layoutService.refreshObject(this.layoutService.section.dashboard[dashboardIndex].obj);
		this.changeDetector.detectChanges();
	}
	title_value: string = '';
	editSectionText = false;
	textSectionClick() {
		let textArea = document.getElementById('sectionName');
		this.layoutService.section.section_title = textArea.innerText;
		this.editSectionText = true;
		this.layoutService.section.isSelected =
			!this.layoutService.section.isSelected;
	}
	textAreaClickSection(i: number) {
		if (!this.editSectionText) {
			let textArea: any = document.getElementById('sectionName');
			textArea.firstChild.innerText = this.layoutService.section.section_title;
			textArea.firstChild.nodeValue = this.layoutService.section.section_title;
			this.title_value = textArea.innerHTML;
			this.layoutService.section.isSelected =
				!this.layoutService.section.isSelected;
			this.layoutService.section.section_title = this.title_value;
		} else {
			this.editSectionText = false;
		}
	}
}
