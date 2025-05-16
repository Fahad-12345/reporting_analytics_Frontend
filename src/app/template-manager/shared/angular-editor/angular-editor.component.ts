import {
	AfterViewInit,
	Attribute,
	ChangeDetectorRef,
	Component,
	ElementRef,
	ChangeDetectionStrategy,
	EventEmitter,
	forwardRef,
	HostBinding,
	HostListener,
	Inject,
	Input,
	OnDestroy,
	OnInit,
	Output,
	Renderer2,
	SecurityContext,
	ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AngularEditorConfig, angularEditorConfig } from './config';
import { AngularEditorToolbarComponent } from './angular-editor-toolbar.component';
import { AngularEditorService } from './angular-editor.service';
import { DOCUMENT } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { cloneDeep } from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { isDefined, predefinedMappingComponents } from './utils';
import { MainServiceTemp } from '../../services/main.service';
import { LayoutService } from '@appDir/template-manager/services/layout.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { TemaplateManagerUrlsEnum } from '@appDir/template-manager/template-manager-url-enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { UI_COMPONENT_TYPES } from '@appDir/template-manager/common/constants';
import { NgbPopoverConfig } from '@ng-bootstrap/ng-bootstrap';

interface DataSourceType {
	id: number;
	name: string;
	region: string;
}

@Component({
	selector: 'angular-editor',
	templateUrl: './angular-editor.component.html',
	styleUrls: ['./angular-editor.component.scss'],
	changeDetection: ChangeDetectionStrategy.Default,
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => AngularEditorComponent),
			multi: true,
		},
		NgbPopoverConfig
	],
})
export class AngularEditorComponent
	implements OnInit, ControlValueAccessor, AfterViewInit, OnDestroy
{
	@Output() multiPdfSelectIntance = new EventEmitter();
	@ViewChild('uiAction') public uiPopover: any;
	@ViewChild('keyAction') public keyPopover: any;
	@Input() multiplePreviews: any;
	private onChange: (value: any) => void;
	private onTouched: () => void;
	modeVisual = true;
	showPlaceholder = false;
	disabled = false;
	focused = false;
	touched = false;
	changed = false;
	keyword = 'label';
	focusInstance: any;
	blurInstance: any;
	asyncSelected: any;

	@Input() uiComponentsCombine: any;
	@Input() id = '';
	@Input() text: any = '';
	@Input() obj: any = {};

	@Input() config: AngularEditorConfig = angularEditorConfig;
	@Input() placeholder = '';
	@Input() tabIndex: number | null;
	@Output() html;
	@ViewChild('editor') textArea: ElementRef;
	@ViewChild('tableData') myDiv: ElementRef;
	@ViewChild('editorWrapper') editorWrapper: ElementRef;
	@ViewChild('editorToolbar') editorToolbar: AngularEditorToolbarComponent;
	@Output() viewMode = new EventEmitter<boolean>();
	/** emits `blur` event when focused out from the textarea */

	@Output('blur') blurEvent: EventEmitter<FocusEvent> = new EventEmitter<FocusEvent>();
	/** emits `focus` event when focused in to the textarea */

	@Output('focus') focusEvent: EventEmitter<FocusEvent> = new EventEmitter<FocusEvent>();
	@HostBinding('attr.tabindex') tabindex = -1;
	editableComponent: string[] = [];
	editableMappingComponent: string[] = [];
	@HostListener('focus')
	onFocus() {
		this.focus();
	}
	@HostListener('click')
	onClick() {
		this.dropOpen = false;
		this.keywordDropOpen = false;
	}
	constructor(
		private r: Renderer2,
		private editorService: AngularEditorService,
		private toastrService: ToastrService,
		public layoutService: LayoutService,
		@Inject(DOCUMENT) private doc: any,
		private sanitizer: DomSanitizer,
		private cdRef: ChangeDetectorRef,
		protected requestService: RequestService,
		public mainService: MainServiceTemp,
		@Attribute('tabindex') defaultTabIndex: string,
		@Attribute('autofocus') private autoFocus: any,
		config: NgbPopoverConfig
	) {
		config.container = 'body';
		const parsedTabIndex = Number(defaultTabIndex);
		this.tabIndex = parsedTabIndex || parsedTabIndex === 0 ? parsedTabIndex : null;
	}
	ngOnInit() {
		this.config.toolbarPosition = this.config.toolbarPosition
			? this.config.toolbarPosition
			: angularEditorConfig.toolbarPosition;
	}
	ngAfterViewInit() {
		if (isDefined(this.autoFocus)) {
			this.focus();
		}
	}
	bold = {
		buttonBold: false,
		buttonItalic: false,
		buttonUnderline: false,
		buttonJustifyLeft: false,
		buttonJustifyCenter: false,
		buttonJustifyRight: false,
		buttonJustifyFull: false,
		buttonFontSize: false,
	};
	/**
	 * Executed command from editor header buttons
	 * @param command string from triggerCommand
	 */
	executeCommand(command: string) {
		if (this.id == 'combinePro') {
			for (let i = 0; i < this.uiComponentsCombine.length; i++) {
				if (command == 'FontSize') {
					let st =
						this.layoutService.template.sections[this.uiComponentsCombine[i].sectionIndex]
							.dashboard[this.uiComponentsCombine[i].dashboardIndex].obj.statement;
					for (let q = 1; q < 8; q++) {
						st = st.replaceAll('<font size="' + q + '">', '');
					}
					st = st.replaceAll('</font>', '');
					if (this.editorService['currentFontSize']) {
						st = '<font size="' + this.editorService['currentFontSize'] + '">' + st + '</font>';
						if (i == this.uiComponentsCombine.length - 1) {
						}
					}

					this.layoutService.template.sections[this.uiComponentsCombine[i].sectionIndex].dashboard[
						this.uiComponentsCombine[i].dashboardIndex
					].obj.statement = st;
				}
				if (command == 'bold') {
					let st =
						this.layoutService.template.sections[this.uiComponentsCombine[i].sectionIndex]
							.dashboard[this.uiComponentsCombine[i].dashboardIndex].obj.statement;
					st = st.replaceAll('<b>', '');
					st = st.replaceAll('</b>', '');
					if (!this.bold.buttonBold) {
						st = '<b>' + st + '</b>';
						if (i == this.uiComponentsCombine.length - 1) {
							this.bold.buttonBold = true;
						}
					} else if (i == this.uiComponentsCombine.length - 1) {
						this.bold.buttonBold = false;
					}
					this.layoutService.template.sections[this.uiComponentsCombine[i].sectionIndex].dashboard[
						this.uiComponentsCombine[i].dashboardIndex
					].obj.statement = st;
				} else if (command == 'italic') {
					let st =
						this.layoutService.template.sections[this.uiComponentsCombine[i].sectionIndex]
							.dashboard[this.uiComponentsCombine[i].dashboardIndex].obj.statement;

					st = st.replaceAll('<i>', '');
					st = st.replaceAll('</i>', '');
					if (!this.bold.buttonItalic) {
						st = '<i>' + st + '</i>';
						if (i == this.uiComponentsCombine.length - 1) {
							this.bold.buttonItalic = true;
						}
					} else if (i == this.uiComponentsCombine.length - 1) {
						this.bold.buttonItalic = false;
					}
					this.layoutService.template.sections[this.uiComponentsCombine[i].sectionIndex].dashboard[
						this.uiComponentsCombine[i].dashboardIndex
					].obj.statement = st;
				} else if (command == 'underline') {
					let st =
						this.layoutService.template.sections[this.uiComponentsCombine[i].sectionIndex]
							.dashboard[this.uiComponentsCombine[i].dashboardIndex].obj.statement;

					st = st.replaceAll('<u>', '');
					st = st.replaceAll('</u>', '');
					if (!this.bold.buttonUnderline) {
						st = '<u>' + st + '</u>';
						if (i == this.uiComponentsCombine.length - 1) {
							this.bold.buttonUnderline = true;
						}
					} else if (i == this.uiComponentsCombine.length - 1) {
						this.bold.buttonUnderline = false;
					}
					this.layoutService.template.sections[this.uiComponentsCombine[i].sectionIndex].dashboard[
						this.uiComponentsCombine[i].dashboardIndex
					].obj.statement = st;
				} else if (command == 'justifyLeft') {
					let st =
						this.layoutService.template.sections[this.uiComponentsCombine[i].sectionIndex]
							.dashboard[this.uiComponentsCombine[i].dashboardIndex].obj.statement;

					st = st.replaceAll('<div style="text-align: left;">', '<div>');

					if (!this.bold.buttonJustifyLeft) {
						st = st.replaceAll(
							'<div style="text-align: right;">',
							'<div style="text-align: left;">',
						);
						st = st.replaceAll(
							'<div style="text-align: center;">',
							'<div style="text-align: left;">',
						);
						st = st.replaceAll(
							'<div style="text-align: justify;">',
							'<div style="text-align: left;">',
						);
						st = st.replaceAll('<div>', '<div style="text-align: left;">');
						st = '<div style="text-align: left;">' + st + '</div>';

						if (i == this.uiComponentsCombine.length - 1) {
							this.bold.buttonJustifyLeft = true;
						}
					} else if (i == this.uiComponentsCombine.length - 1) {
						this.bold.buttonJustifyLeft = false;
					}
					this.layoutService.template.sections[this.uiComponentsCombine[i].sectionIndex].dashboard[
						this.uiComponentsCombine[i].dashboardIndex
					].obj.statement = st;
				} else if (command == 'justifyCenter') {
					let st =
						this.layoutService.template.sections[this.uiComponentsCombine[i].sectionIndex]
							.dashboard[this.uiComponentsCombine[i].dashboardIndex].obj.statement;

					st = st.replaceAll('<div style="text-align: center;">', '<div>');

					if (!this.bold.buttonJustifyCenter) {
						st = st.replaceAll(
							'<div style="text-align: right;">',
							'<div style="text-align: center;">',
						);
						st = st.replaceAll(
							'<div style="text-align: left;">',
							'<div style="text-align: center;">',
						);
						st = st.replaceAll(
							'<div style="text-align: justify;">',
							'<div style="text-align: center;">',
						);
						st = st.replaceAll('<div>', '<div style="text-align: center;">');
						st = '<div style="text-align: center;">' + st + '</div>';

						if (i == this.uiComponentsCombine.length - 1) {
							this.bold.buttonJustifyCenter = true;
						}
					} else if (i == this.uiComponentsCombine.length - 1) {
						this.bold.buttonJustifyCenter = false;
					}
					this.layoutService.template.sections[this.uiComponentsCombine[i].sectionIndex].dashboard[
						this.uiComponentsCombine[i].dashboardIndex
					].obj.statement = st;
				} else if (command == 'justifyRight') {
					let st =
						this.layoutService.template.sections[this.uiComponentsCombine[i].sectionIndex]
							.dashboard[this.uiComponentsCombine[i].dashboardIndex].obj.statement;

					st = st.replaceAll('<div style="text-align: right;">', '<div>');

					if (!this.bold.buttonJustifyRight) {
						st = st.replaceAll(
							'<div style="text-align: center;">',
							'<div style="text-align: right;">',
						);
						st = st.replaceAll(
							'<div style="text-align: left;">',
							'<div style="text-align: right;">',
						);
						st = st.replaceAll(
							'<div style="text-align: justify;">',
							'<div style="text-align: right;">',
						);
						st = st.replaceAll('<div>', '<div style="text-align: right;">');
						st = '<div style="text-align: right;">' + st + '</div>';

						if (i == this.uiComponentsCombine.length - 1) {
							this.bold.buttonJustifyRight = true;
						}
					} else if (i == this.uiComponentsCombine.length - 1) {
						this.bold.buttonJustifyRight = false;
					}
					this.layoutService.template.sections[this.uiComponentsCombine[i].sectionIndex].dashboard[
						this.uiComponentsCombine[i].dashboardIndex
					].obj.statement = st;
				} else if (command == 'justifyFull') {
					let st =
						this.layoutService.template.sections[this.uiComponentsCombine[i].sectionIndex]
							.dashboard[this.uiComponentsCombine[i].dashboardIndex].obj.statement;

					st = st.replaceAll('<div style="text-align: justify;">', '<div>');

					if (!this.bold.buttonJustifyFull) {
						st = st.replaceAll(
							'<div style="text-align: right;">',
							'<div style="text-align: justify;">',
						);
						st = st.replaceAll(
							'<div style="text-align: left;">',
							'<div style="text-align: justify;">',
						);
						st = st.replaceAll(
							'<div style="text-align: center;">',
							'<div style="text-align: justify;">',
						);
						st = st.replaceAll('<div>', '<div style="text-align: justify;">');
						st = '<div style="text-align: justify;">' + st + '</div>';

						if (i == this.uiComponentsCombine.length - 1) {
							this.bold.buttonJustifyFull = true;
						}
					} else if (i == this.uiComponentsCombine.length - 1) {
						this.bold.buttonJustifyFull = false;
					}
					this.layoutService.template.sections[this.uiComponentsCombine[i].sectionIndex].dashboard[
						this.uiComponentsCombine[i].dashboardIndex
					].obj.statement = st;
				}
				this.layoutService.refreshObject(
					this.layoutService.template.sections[this.uiComponentsCombine[i].sectionIndex].dashboard[
						this.uiComponentsCombine[i].dashboardIndex
					].obj,
				);
			}
			this.editorToolbar.triggerButtons();
			return;
		}
		if (this.id != 'preview') {
			var xyz = this.doc.getSelection();

			if (xyz.anchorOffset == xyz.focusOffset) {
				if(!this.textArea?.nativeElement) return;
				var element = this.textArea.nativeElement;
				var selection = window.getSelection();
				var range = document.createRange();
				range.selectNodeContents(element);
				selection.removeAllRanges();
				selection.addRange(range);
			}
		}
		this.focus();
		if (command === 'toggleEditorMode') {
			this.toggleEditorMode(this.modeVisual);
		} else if (command !== '' && command != 'FontSize') {
			if(!this.textArea?.nativeElement) return;
			if (command === 'clear') {
				this.editorService.removeSelectedElements(this.getCustomTags());
				this.onContentChange(this.textArea.nativeElement);
			} else if (command === 'default') {
				this.editorService.removeSelectedElements('h1,h2,h3,h4,h5,h6,p,pre');
				this.onContentChange(this.textArea.nativeElement);
			} else {
				this.editorService.executeCommand(command);
			}
			this.exec();
		}
	}
	executeSelection(event) {
		if (event == 'FontSize' && this.id != 'preview') {
			var xyz = this.doc.getSelection();
			if(!this.textArea?.nativeElement) return;

			if (xyz.anchorOffset == xyz.focusOffset) {
				var element = this.textArea.nativeElement;
				var selection = window.getSelection();
				var range = document.createRange();
				range.selectNodeContents(element);
				selection.removeAllRanges();
				selection.addRange(range);
			}
			this.focus();
		}
	}
	getCaretCoordinates(element, position) {
		var properties = [
			'boxSizing',
			'width',
			'height',
			'overflowX',
			'overflowY',
			'borderTopWidth',
			'borderRightWidth',
			'borderBottomWidth',
			'borderLeftWidth',
			'paddingTop',
			'paddingRight',
			'paddingBottom',
			'paddingLeft',

			'fontStyle',
			'fontVariant',
			'fontWeight',
			'fontStretch',
			'fontSize',
			'lineHeight',
			'fontFamily',
			'textAlign',
			'textTransform',
			'textIndent',
			'textDecoration',
			'letterSpacing',
			'wordSpacing',
		];
		var isFirefox = !((Window as any).mozInnerScreenX == null);
		var div: any = document.getElementsByClassName('angular-editor-textarea');
		var mirrorDivDisplayCheckbox: any = div[0].cloneNode(true);
		var mirrorDiv, computed, style;
		mirrorDiv = document.getElementById(element.nodeName + '--mirror-div');
		if (!mirrorDiv) {
			mirrorDiv = document.createElement('div');
			mirrorDiv.id = element.nodeName + '--mirror-div';
			document.body.appendChild(mirrorDiv);
		}
		style = mirrorDiv.style;
		computed = getComputedStyle(element);

		style.whiteSpace = 'pre-wrap';
		if (element.nodeName !== 'INPUT') style.wordWrap = 'break-word';

		style.position = 'absolute';
		style.top = element.offsetTop + parseInt(computed.borderTopWidth) + 'px';
		style.left = '400px';
		style.visibility = mirrorDivDisplayCheckbox.checked ? 'visible' : 'hidden';

		properties.forEach(function (prop) {
			style[prop] = computed[prop];
		});
		if (isFirefox) {
			style.width = parseInt(computed.width) - 2 + 'px';

			if (element.scrollHeight > parseInt(computed.height)) style.overflowY = 'scroll';
		} else {
			style.overflow = 'hidden';
		}
		mirrorDiv.textContent = element.innerText.substring(0, position);

		if (element.nodeName === 'INPUT')
			mirrorDiv.textContent = mirrorDiv.textContent.replace(/\s/g, '\u00a0');
		var span = document.createElement('span');

		span.textContent = element.innerText.substring(position) || '.';
		span.style.backgroundColor = 'lightgrey';
		mirrorDiv.appendChild(span);
		var coordinates = {
			top: span.offsetTop + parseInt(computed['borderTopWidth']),
			left: span.offsetLeft + parseInt(computed['borderLeftWidth']),
		};
		return coordinates;
	}
	/**
	 * focus event
	 */
	onTextAreaFocus(event: FocusEvent): void {
		if (this.focused) {
			event.stopPropagation();
			return;
		}
		this.focused = true;
		this.focusEvent.emit(event);
		if (!this.touched || !this.changed) {
			this.editorService.executeInNextQueueIteration(() => {
				this.configure();
				this.touched = true;
			});
		}
	}
	/**
	 * @description fires when cursor leaves textarea
	 */
	public onTextAreaMouseOut(event: MouseEvent): void {}
	public onTextAreaMouseOutSide(): void {}
	/**
	 * blur event
	 */
	onTextAreaBlur(event: FocusEvent) {
		/**
		 * save selection if focussed out
		 */
		this.editorService.executeInNextQueueIteration(this.editorService.saveSelection);
		if (typeof this.onTouched === 'function') {
			this.onTouched();
		}
		if (event.relatedTarget !== null) {
			const parent = (event.relatedTarget as HTMLElement).parentElement;
			if (
				!parent.classList?.contains('angular-editor-toolbar-set') &&
				!parent.classList?.contains('ae-picker')
			) {
				this.blurEvent.emit(event);
				this.focused = false;
			}
		}
		this.editorToolbar.triggerButtonsOutside();
	}
	/**
	 *  focus the text area when the editor is focused
	 */
	focus() {
		if (this.modeVisual) {
			if(!this.textArea?.nativeElement) return;
			this.textArea.nativeElement.focus();
		} else {
			const sourceText = this.doc.getElementById('sourceText' + this.id);
			sourceText.focus();
			this.focused = true;
		}
	}
	/**
	 * Executed from the contenteditable section while the input property changes
	 * @param element html element from contenteditable
	 */
	xDrop = 0;
	yDrop = 0;
	dropOpen = false;
	keywordDropOpen = false;
	keywords = [];
	uiComponents = [];
	calculateTotalOffset(node, offset) {
		let total = 0;
		let curNode = node;
		while (curNode.className != 'angular-editor-textarea') {
			if (curNode.previousSibling) {
				total++;
				curNode = curNode.previousSibling;
			} else {
				curNode = curNode.parentElement;
			}
		}
		return total;
	}
	doubleSpaces = 0;
	getCaretCharacterOffsetWithin(element) {
		var start = 0;
		var end = 0;
		var doc = element.ownerDocument || element.document;
		var win = doc.defaultView || doc.parentWindow;
		var sel;
		if (typeof win.getSelection != 'undefined') {
			sel = win.getSelection();
			if (sel.rangeCount > 0) {
				var range = win.getSelection().getRangeAt(0);
				var preCaretRange = range.cloneRange();
				preCaretRange.selectNodeContents(element);
				preCaretRange.setEnd(range.endContainer, range.endOffset);
				end = preCaretRange.toString().length - 1;
				let spaces = 0,
					tempOffset = 0;
				let prev = false;
				this.doubleSpaces = 0;
				for (let tempIndex = 0; tempIndex < element.innerText.length; tempIndex++) {
					if (tempOffset == end + 1) {
						break;
					}
					if (
						element.innerText.charAt(tempIndex) == '\r' ||
						element.innerText.charAt(tempIndex) == '\n' ||
						element.innerText.charAt(tempIndex) == '\r\n'
					) {
						if (!prev) {
							prev = true;
							spaces++;
						} else {
							this.doubleSpaces++;
							prev = false;
						}
					} else {
						prev = false;
						tempOffset++;
					}
				}
				end += spaces;
			}
		} else if ((sel = doc.selection) && sel.type != 'Control') {
			var textRange = sel.createRange();
			var preCaretTextRange = doc.body.createTextRange();
			preCaretTextRange.moveToElementText(element);
			preCaretTextRange.setEndPoint('EndToStart', textRange);
			start = preCaretTextRange.text.length;
			preCaretTextRange.setEndPoint('EndToEnd', textRange);
			end = preCaretTextRange.text.length;
		}
		return end;
	}
	public sanitizedHtml;
	public currentCaretPosition = 0;
	atIndex = -1;
	word = '';
	mappingWord = '';
	onContentChange(element: any, e?: any): void {
		if (e && e.data) {
			if (e && e.data === '@') {
				this.dropOpen = true;
				this.keywordDropOpen = false;
				this.uiPopover.open();
				this.keyPopover.close();
			} else if (e && e.data === '#') {
				this.dropOpen = false;
				this.keywordDropOpen = true;
				this.uiPopover.close();
				this.keyPopover.open();
			}
			if (this.obj && this.obj.type == UI_COMPONENT_TYPES.INPUT) {
				this.editorService.saveSelection();
			}
			if (this.obj && this.obj.type == UI_COMPONENT_TYPES.INPUT && this.obj.maxCharLength) {
				let tempString = this.obj.input.replace(/<.*?>/g, '');
				if (tempString.length >= parseInt(this.obj.maxCharLength) && e.inputType != 'historyUndo') {
					this.executeCommand('undo');
					return;
				}
			}
			if (
				this.obj &&
				this.obj.type == UI_COMPONENT_TYPES.CALCULATION &&
				(!e.data.match(/[0-9+\-*/.()@ ]+/g) || (e && e.inputType == 'insertParagraph'))
			) {
				this.executeCommand('undo');
				return;
			}

			if (this.obj && (this.obj.type == UI_COMPONENT_TYPES.CHECKBOX || this.obj.type == UI_COMPONENT_TYPES.RADIO)) {
				for (let option of this.obj.options) {
					if (option.selected && option.input) {
						let tempString = option.inputValue.replace(/<.*?>/g, '');
						if (
							option.maxCharLength &&
							tempString.length >= parseInt(option.maxCharLength) &&
							e.inputType != 'historyUndo'
						) {
							this.executeCommand('undo');
							return;
						}
					}
				}
			}
		}
		if(!this.textArea?.nativeElement) return;

		let ele = this.textArea.nativeElement.getBoundingClientRect();
		var caretPos = this.getCaretCharacterOffsetWithin(this.textArea.nativeElement) + 1;
		if (this.id != 'preview') {
			this.currentCaretPosition = caretPos;
			let coord = this.getCaretCoordinates(this.textArea.nativeElement, caretPos);
		}
		let html = '';
		if (this.layoutService.isShowEditor && !this.layoutService.editorView) {
			this.layoutService.previewEdited = true;
		}
		let innerText = element.textContent;
		if (
			this.obj &&
			this.obj.section_type &&
			this.obj.section_type == this.layoutService.subjectiveSectionTypeId &&
			innerText != 'Subjective'
		) {
			element['innerText'] = 'Subjective';
		} else if (
			this.obj &&
			this.obj.section_type &&
			this.obj.section_type == this.layoutService.objectiveSectionTypeId &&
			innerText != 'Objective'
		) {
			element['innerText'] = 'Objective';
		} else if (
			this.obj &&
			this.obj.section_type &&
			this.obj.section_type == this.layoutService.planSectionTypeId &&
			innerText != 'Plan Of Care'
		) {
			element['innerText'] = 'Plan Of Care';
		}
		if (this.modeVisual) {
			html = element.innerHTML;
		} else {
			html = element.innerText;
		}
		if (!html || html === '<br>') {
			html = '';
		}

		this.sanitizedHtml = html;
		if (typeof this.onChange === 'function') {
			this.onChange(this.sanitizedHtml);
			if (!html !== this.showPlaceholder) {
				this.togglePlaceholder(this.showPlaceholder);
			}
		}
		this.changed = true;
		if (this.obj.type == UI_COMPONENT_TYPES.INPUT) {
			this.editorService.restoreSelection();
		}
	}

	copyToClipboard(item: string, isMappingKeyword: boolean) {
		let popover
		if(isMappingKeyword) {
			item = '#' + item
			popover = this.keyPopover;
		} else {
			item = '@' + item.split('-')[0]
			popover = this.uiPopover;
		}
		let that = this
		navigator.clipboard.writeText(item).then(function() {
			that.toastrService.success('Copied sucessfully.', 'Success', { timeOut: 6000 });
			popover.close()
		});
	}
	

	stopAutocomplete(event) {
		event.preventDefault()
		event.stopPropagation()
	}
	
	/**
	 * Set the function to be called
	 * when the control receives a change event.
	 *
	 * @param fn a function
	 */
	registerOnChange(fn: any): void {
		this.onChange = (e) => (e === '<br>' ? fn('') : fn(e));
	}
	/**
	 * Set the function to be called
	 * when the control receives a touch event.
	 *
	 * @param fn a function
	 */
	registerOnTouched(fn: any): void {
		this.onTouched = fn;
	}
	/**
	 * Write a new value to the element.
	 *
	 * @param value value to be executed when there is a change in contenteditable
	 */
	writeValue(value: any): void {
		if ((!value || value === '<br>' || value === '') !== this.showPlaceholder) {
			this.togglePlaceholder(this.showPlaceholder);
		}
		if (value === undefined || value === '' || value === '<br>') {
			value = null;
		}
		this.refreshView(value);
	}
	/**
	 * refresh view/HTML of the editor
	 *
	 * @param value html string from the editor
	 */
	refreshView(value: string): void {
		const normalizedValue: any = value === null ? '' : value;

		this.textArea?.nativeElement && this.r.setProperty(this.textArea.nativeElement, 'innerHTML', normalizedValue);

		return;
	}
	/**
	 * toggles placeholder based on input string
	 *
	 * @param value A HTML string from the editor
	 */
	togglePlaceholder(value: boolean): void {
		if(!this.editorWrapper?.nativeElement) return;

		if (!value) {
			this.r.addClass(this.editorWrapper.nativeElement, 'show-placeholder');
			this.showPlaceholder = true;
		} else {
			this.r.removeClass(this.editorWrapper.nativeElement, 'show-placeholder');
			this.showPlaceholder = false;
		}
	}
	/**
	 * Implements disabled state for this element
	 *
	 * @param isDisabled Disabled flag
	 */
	setDisabledState(isDisabled: boolean): void {
		if(!this.textArea?.nativeElement) return;
		const div = this.textArea.nativeElement;
		const action = isDisabled ? 'addClass' : 'removeClass';
		this.r[action](div, 'disabled');
		this.disabled = isDisabled;
	}
	/**
	 * toggles editor mode based on bToSource bool
	 *
	 * @param bToSource A boolean value from the editor
	 */
	toggleEditorMode(bToSource: boolean) {
		if(!this.textArea?.nativeElement) return;
		let oContent: any;
		const editableElement = this.textArea.nativeElement;
		if (bToSource) {
			oContent = this.r.createText(editableElement.innerHTML);
			this.r.setProperty(editableElement, 'innerHTML', '');
			this.r.setProperty(editableElement, 'contentEditable', false);
			const oPre = this.r.createElement('pre');
			this.r.setStyle(oPre, 'margin', '0');
			this.r.setStyle(oPre, 'outline', 'none');
			const oCode = this.r.createElement('code');
			this.r.setProperty(oCode, 'id', 'sourceText' + this.id);
			this.r.setStyle(oCode, 'display', 'block');
			this.r.setStyle(oCode, 'white-space', 'pre-wrap');
			this.r.setStyle(oCode, 'word-break', 'keep-all');
			this.r.setStyle(oCode, 'outline', 'none');
			this.r.setStyle(oCode, 'margin', '0');
			this.r.setStyle(oCode, 'background-color', '#fff5b9');
			this.r.setProperty(oCode, 'contentEditable', true);
			this.r.appendChild(oCode, oContent);
			this.focusInstance = this.r.listen(oCode, 'focus', (event) => this.onTextAreaFocus(event));
			this.blurInstance = this.r.listen(oCode, 'blur', (event) => this.onTextAreaBlur(event));
			this.r.appendChild(oPre, oCode);
			this.r.appendChild(editableElement, oPre);

			this.doc.execCommand('defaultParagraphSeparator', false, 'div');
			this.modeVisual = false;
			this.viewMode.emit(false);
			oCode.focus();
		} else {
			if (this.doc.querySelectorAll) {
				this.r.setProperty(editableElement, 'innerHTML', editableElement.innerText);
			} else {
				oContent = this.doc.createRange();
				oContent.selectNodeContents(editableElement.firstChild);
				this.r.setProperty(editableElement, 'innerHTML', oContent.toString());
			}
			this.r.setProperty(editableElement, 'contentEditable', true);
			this.modeVisual = true;
			this.viewMode.emit(true);
			this.onContentChange(editableElement);
			editableElement.focus();
		}
		this.editorToolbar.setEditorMode(!this.modeVisual);
	}
	/**
	 * toggles editor buttons when cursor moved or positioning
	 *
	 * Send a node array from the contentEditable of the editor
	 */
	exec(check?) {
		this.editorToolbar.triggerButtons();

		let userSelection;
		let focusNode;
		if (this.doc.getSelection) {
			userSelection = this.doc.getSelection();
			this.editorService.executeInNextQueueIteration(this.editorService.saveSelection);
		}
		if (check) {
			let tempRange = userSelection.getRangeAt(0);
			let preCaretRange = tempRange.cloneRange();
			this.currentCaretPosition = preCaretRange.endOffset;
			let tempPos = 0;
			if (this.dropOpen) {
				tempPos = this.currentCaretPosition + check.length + 1;
				if (this.currentCaretPosition > 0) {
					userSelection.focusNode.data =
						userSelection.focusNode.data.substring(0, this.currentCaretPosition) +
						'@' +
						check +
						userSelection.focusNode.data.substring(this.currentCaretPosition);
				} else {
					if (!userSelection.focusNode.data) {
						let tempNode = document.createTextNode('@' + check);
						userSelection.focusNode.appendChild(tempNode);
						for (let item of userSelection.focusNode.childNodes) {
							if (item.nodeName == 'BR') {
								userSelection.focusNode.removeChild(item);
							}
							if (item.nodeName == '#text') {
								focusNode = item;
								break;
							}
						}
					} else {
						userSelection.focusNode.data =
							'@' + check + userSelection.focusNode.data.substring(this.currentCaretPosition);
						focusNode = userSelection.focusNode;
					}
				}
				this.dropOpen = false;
				this.uiPopover.close();
				this.uiComponents = [];
			}
			if (this.keywordDropOpen) {
				tempPos = this.currentCaretPosition + check.length + 1;
				if (this.currentCaretPosition > 0) {
					userSelection.focusNode.data =
						userSelection.focusNode.data.substring(0, this.currentCaretPosition) +
						'#' +
						check +
						userSelection.focusNode.data.substring(this.currentCaretPosition);
					focusNode = userSelection.focusNode;
				} else {
					if (!userSelection.focusNode.data) {
						let tempNode = document.createTextNode('#' + check);
						userSelection.focusNode.appendChild(tempNode);
						for (let item of userSelection.focusNode.childNodes) {
							if (item.nodeName == 'BR') {
								userSelection.focusNode.removeChild(item);
							}
							if (item.nodeName == '#text') {
								focusNode = item;
								break;
							}
						}
					} else {
						userSelection.focusNode.data =
							'#' + check + userSelection.focusNode.data.substring(this.currentCaretPosition);
						focusNode = userSelection.focusNode;
					}
				}
				this.keywordDropOpen = false;
				this.keyPopover.close();
				this.keywords = [];
			}
			var range = document.createRange();
			if (focusNode && focusNode.nodeName == '#text') {
				range.setStart(focusNode, tempPos);
				range.collapse(true);
				userSelection.removeAllRanges();
				userSelection.addRange(range);
			}
		}
		let a = userSelection.focusNode;
		const els = [];
		while (a && a.id !== 'editor') {
			els.unshift(a);
			a = a.parentNode;
		}
		this.editorToolbar.triggerBlocks(els);
	}
	private configure() {
		this.editorService.uploadUrl = this.config.uploadUrl;
		this.editorService.uploadWithCredentials = this.config.uploadWithCredentials;
		if (this.config.defaultParagraphSeparator) {
			this.editorService.setDefaultParagraphSeparator(this.config.defaultParagraphSeparator);
		}
		if (this.config.defaultFontName) {
			this.editorService.setFontName(this.config.defaultFontName);
		}
		if (this.config.defaultFontSize) {
			this.editorService.setFontSize(this.config.defaultFontSize);
		}
	}
	getFonts() {
		const fonts = this.config.fonts ? this.config.fonts : angularEditorConfig.fonts;
		return fonts.map((x) => {
			return { label: x.name, value: x.name };
		});
	}
	getCustomTags() {
		const tags = ['span'];
		this.config.customClasses.forEach((x) => {
			if (x.tag !== undefined) {
				if (!tags.includes(x.tag)) {
					tags.push(x.tag);
				}
			}
		});
		return tags.join(',');
	}
	ngOnDestroy() {
		if (this.blurInstance) {
			this.blurInstance();
		}
		if (this.focusInstance) {
			this.focusInstance();
		}
	}
	filterStyles(html: string): string {
		html = html.replace('position: fixed;', '');
		return html;
	}
	searchUIList() {
		if(!this.textArea?.nativeElement) return;
		var caretPos = this.getCaretCharacterOffsetWithin(this.textArea.nativeElement) + 1;
		let shortName = '';
		this.atIndex = caretPos - 1;
		for (let i = 0; i < this.layoutService.template.sections.length; i++) {
			for (let j = 0; j < this.layoutService.template.sections[i].dashboard.length; j++) {
				if (
					this.layoutService.template.sections[i].dashboard[j].obj.uicomponent_name ===
					this.obj.uicomponent_name
				) {
					for (let x = 0; x < this.layoutService.template.sections.length; x++) {
						for (let z = 0; z < this.layoutService.template.sections[x].dashboard.length; z++) {
							if (
								this.obj &&
								this.layoutService.template.sections[x].dashboard[z].obj['uicomponent_name'] !=
									this.obj.uicomponent_name &&
								this.layoutService.template.sections[x].dashboard[z].obj.type != UI_COMPONENT_TYPES.LINE &&
								this.layoutService.template.sections[x].dashboard[z].obj.type != UI_COMPONENT_TYPES.SIMPLE_IMAGE
							) {
								shortName = this.layoutService.template.sections[x].dashboard[z].obj['second_name'];
								if (shortName.length > 16) {
									shortName = shortName.slice(0, 15);
								}
								this.uiComponents.push(
									this.layoutService.template.sections[x].dashboard[z].obj['uicomponent_name'] +
										'-' +
										shortName,
								);
							}
						}
					}
					break;
				}
			}
		}
	}
	searchMappingList() {
		if(!this.textArea?.nativeElement) return;
		var caretPos = this.getCaretCharacterOffsetWithin(this.textArea.nativeElement) + 1;
		this.atIndex = caretPos - 1;
	}
	async addMappingComponent(item: string) {
		if(!this.textArea?.nativeElement) return;
		let tempName = item.split('-');
		this.searchMappingList();
		this.keywordDropOpen = true;
		this.dropOpen = false;
		this.editorService.restoreSelection();
		await this.exec(tempName[0]);
		await this.onContentChange(this.textArea.nativeElement);
		this.dropOpen = false;
		this.keywordDropOpen = false;
	}
	async addComponent(item) {
		if(!this.textArea?.nativeElement) return;
		let tempName = item.split('-');
		this.searchUIList();
		this.keywordDropOpen = false;
		this.dropOpen = true;
		this.editorService.restoreSelection();
		await this.exec(tempName[0]);
		await this.onContentChange(this.textArea.nativeElement);
		this.dropOpen = false;
		this.keywordDropOpen = false;
	}
	mappingKeywordsDropdown() {
		this.editorService.saveSelection();
		this.editableMappingComponent = [];

		let abc: string[] = [];
		for (let i = 0; i < this.layoutService.template?.mappingKeyWords?.length; i++) {
			abc.push(this.layoutService.template.mappingKeyWords[i].tag);
		}
		abc = abc.filter((item) => item != null);
		for (let item of predefinedMappingComponents) {
			abc.push(item);
		}
		abc.sort((a, b) => a.localeCompare(b));
		this.editableMappingComponent = abc;
	}
	uiComponentsDropdown() {
		this.editorService.saveSelection();
		this.editableComponent = [];
		for (let i = 0; i < this.layoutService.template.sections?.length; i++) {
			for (let j = 0; j < this.layoutService.template.sections[i].dashboard?.length; j++) {
				if (
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[
						this.layoutService.lastK
					].obj.uicomponent_name !=
					this.layoutService.template.sections[i].dashboard[j].obj.uicomponent_name
				) {
					this.editableComponent.push(
						this.layoutService.template.sections[i].dashboard[j].obj.uicomponent_name +
							'-' +
							this.layoutService.template.sections[i].dashboard[j].obj.second_name,
					);
				}
			}
		}
	}
}
