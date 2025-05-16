import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	Inject,
	Input,
	Output,
	Renderer2,
	ViewChild,
} from '@angular/core';
import { AngularEditorService } from './angular-editor.service';
import { HttpResponse } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { CustomClass } from './config';
import { SelectOption } from './ae-select/ae-select.component';
import { LayoutService } from '../../services/layout.service';
import { AlignmentComponent } from '@appDir/template-manager/modals/alignment/alignment.component';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SubjectService } from '../../services/subject.service';
@Component({
	selector: 'angular-editor-toolbar',
	templateUrl: './angular-editor-toolbar.component.html',
	styleUrls: ['./angular-editor-toolbar.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AngularEditorToolbarComponent {
	@Output() multiPdfSelectIntance = new EventEmitter();
	@Input() imageModal;
	@Input() multiplePreviews: any;
	modalRef: NgbModalRef;
	htmlMode = false;
	linkSelected = false;
	block = 'default';
	fontName = 'Times New Roman';
	fontSize = '3';
	foreColour: string;
	backColor: string;
	url: any = 'https://';
	textUrl: any = 'https://';
	headings: SelectOption[] = [
		{
			label: 'Heading 1',
			value: 'h1',
		},
		{
			label: 'Heading 2',
			value: 'h2',
		},
		{
			label: 'Heading 3',
			value: 'h3',
		},
		{
			label: 'Heading 4',
			value: 'h4',
		},
		{
			label: 'Heading 5',
			value: 'h5',
		},
		{
			label: 'Heading 6',
			value: 'h6',
		},
		{
			label: 'Heading 7',
			value: 'h7',
		},
		{
			label: 'Paragraph',
			value: 'p',
		},
		{
			label: 'Predefined',
			value: 'pre',
		},
		{
			label: 'Standard',
			value: 'div',
		},
		{
			label: 'default',
			value: 'default',
		},
	];
	fontSizes: SelectOption[] = [
		{
			label: '1',
			value: '1',
		},
		{
			label: '2',
			value: '2',
		},
		{
			label: '3',
			value: '3',
		},
		{
			label: '4',
			value: '4',
		},
		{
			label: '5',
			value: '5',
		},
		{
			label: '6',
			value: '6',
		},
	];
	customClassId = '-1';
	_customClasses: CustomClass[];
	customClassList: SelectOption[] = [{ label: '', value: '' }];
	tagMap = {
		BLOCKQUOTE: 'indent',
		A: 'link',
	};
	select = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'PRE', 'DIV'];
	buttons = [
		'bold',
		'italic',
		'underline',
		'strikeThrough',
		'subscript',
		'superscript',
		'justifyLeft',
		'justifyCenter',
		'justifyRight',
		'justifyFull',
		'indent',
		'outdent',
		'insertUnorderedList',
		'insertOrderedList',
		'link',
	];
	@Input() id: string;
	@Input() bold: any;
	@Input() uploadUrl: string;
	@Input() showToolbar: boolean;
	@Input() fonts: SelectOption[] = [{ label: '', value: '' }];
	@Input()
	set customClasses(classes: CustomClass[]) {
		if (classes) {
			this._customClasses = classes;
			this.customClassList = this._customClasses.map((x, i) => ({
				label: x.name,
				value: i.toString(),
			}));
			this.customClassList.unshift({ label: 'Clear Class', value: '-1' });
		}
	}
	@Input()
	set defaultFontName(value: string) {
		if (value) {
			this.fontName = value;
		}
	}
	@Input()
	set defaultFontSize(value: string) {
		if (value) {
			this.fontSize = value;
		}
	}
	@Output() execute: EventEmitter<string> = new EventEmitter<string>();
	@Output() executeSelection: EventEmitter<string> = new EventEmitter<string>();
	@ViewChild('fileInput') myInputFile: ElementRef;
	public get isLinkButtonDisabled(): boolean {
		return this.htmlMode || !Boolean(this.editorService.selectedText);
	}
	constructor(
		public openModal: NgbModal,
		private r: Renderer2,
		private el: ElementRef,
		private editorService: AngularEditorService,
		public layoutService: LayoutService,
		private modalService: NgbModal,
		public subject: SubjectService,
		@Inject(DOCUMENT) private doc: any,
		public changeDetector: ChangeDetectorRef,
	) {}
	
	/**
	 * Trigger command from editor header buttons
	 * @param command string from toolbar buttons
	 */
	triggerCommand(command: string) {
		this.execute.emit(command);
	}
	/**
	 * highlight editor buttons when cursor moved or positioning
	 */
	triggerButtons() {
		if (!this.showToolbar) {
			return;
		}
		this.buttons.forEach((e) => {
			if (this.id == 'combinePro') {
				const elementById = this.doc.getElementById(e + '-' + this.id);
				if (
					(e == 'bold' && this.bold.buttonBold) ||
					(e == 'italic' && this.bold.buttonItalic) ||
					(e == 'underline' && this.bold.buttonUnderline) ||
					(e == 'justifyLeft' && this.bold.buttonJustifyLeft) ||
					(e == 'justifyCenter' && this.bold.buttonJustifyCenter) ||
					(e == 'justifyRight' && this.bold.buttonJustifyRight) ||
					(e == 'justifyFull' && this.bold.buttonJustifyFull)
				) {
					if (elementById) {
						this.r.addClass(elementById, 'active');
					}
				} else if (
					(e == 'bold' && !this.bold.buttonBold) ||
					(e == 'italic' && !this.bold.buttonItalic) ||
					(e == 'underline' && !this.bold.buttonUnderline) ||
					(e == 'justifyLeft' && !this.bold.buttonJustifyLeft) ||
					(e == 'justifyCenter' && !this.bold.buttonJustifyCenter) ||
					(e == 'justifyRight' && !this.bold.buttonJustifyRight) ||
					(e == 'justifyFull' && !this.bold.buttonJustifyFull)
				) {
					if (elementById) {
						this.r.removeClass(elementById, 'active');
					}
				}
				return;
			}
			const result = this.doc.queryCommandState(e);
			const elementById = this.doc.getElementById(e + '-' + this.id);
			if (elementById) {
				if (result) {
					this.r.addClass(elementById, 'active');
				} else {
					this.r.removeClass(elementById, 'active');
				}
			}
		});
	}
	triggerButtonsOutside() {
		if (!this.showToolbar) {
			return;
		}
		this.buttons.forEach((e) => {
			const elementById = this.doc.getElementById(e + '-' + this.id);
			if (elementById) {
				this.r.removeClass(elementById, 'active');
			}
		});
	}
	/**
	 * trigger highlight editor buttons when cursor moved or positioning in block
	 */
	triggerBlocks(nodes: Node[]) {
		if (!this.showToolbar) {
			return;
		}
		this.linkSelected = nodes.findIndex((x) => x.nodeName === 'A') > -1;
		let found = false;
		this.select.forEach((y) => {
			const node = nodes.find((x) => x.nodeName === y);
			if (node !== undefined && y === node.nodeName) {
				if (found === false) {
					this.block = node.nodeName.toLowerCase();
					found = true;
				}
			} else if (found === false) {
				this.block = 'default';
			}
		});
		found = false;
		if (this._customClasses) {
			this._customClasses.forEach((y, index) => {
				const node = nodes.find((x) => {
					if (x instanceof Element) {
						return x.className === y.class;
					}
				});
				if (node !== undefined) {
					if (found === false) {
						this.customClassId = index.toString();
						found = true;
					}
				} else if (found === false) {
					this.customClassId = '-1';
				}
			});
		}
		Object.keys(this.tagMap).map((e) => {
			const elementById = this.doc.getElementById(this.tagMap[e] + '-' + this.id);
			const node = nodes.find((x) => x.nodeName === e);
			if (node !== undefined && e === node.nodeName) {
				if (elementById) {
					this.r.addClass(elementById, 'active');
				}
			} else {
				if (elementById) {
					this.r.removeClass(elementById, 'active');
				}
			}
		});
		this.foreColour = this.doc.queryCommandValue('ForeColor');
		this.fontSize = this.doc.queryCommandValue('FontSize');
		this.fontName = this.doc.queryCommandValue('FontName').replace(/"/g, '');
		this.backColor = this.doc.queryCommandValue('backColor');
	}
	/**
	 * insert URL link
	 */
	insertModalOpen(insertLink) {
		this.editorService.saveSelection();
		this.modalRef = this.openModal.open(insertLink, {
			size: 'sm',
			backdrop: 'static',
			keyboard: true,
		});
	}
	insertUrl() {
		

		const selection = this.editorService.savedSelection;
		if (selection && selection.commonAncestorContainer.parentElement.nodeName === 'A') {
			const parent = selection.commonAncestorContainer.parentElement as HTMLAnchorElement;
			if (parent.href !== '') {
				this.textUrl = parent.href;
			}
		}
		this.modalRef.close();
		this.editorService.restoreSelection();
		this.editorService.createLink(this.textUrl);
		}
	changeUrl(event) {
		this.textUrl = event;
	}
	/**
	 * insert Video link
	 */
	insertVideo() {
		this.execute.emit('');
		const url = prompt('Insert Video link', `https://`);
		if (url && url !== '' && url !== `https://`) {
			this.editorService.insertVideo(url);
		}
	}
	/** insert color */
	insertColor(color: string, where: string) {
		this.editorService.insertColor(color, where);
		this.execute.emit('');
	}
	/**
	 * set font Name/family
	 * @param foreColor string
	 */
	setFontName(foreColor: string): void {
		this.editorService.setFontName(foreColor);
		this.execute.emit('');
	}
	/**
	 * set font Size
	 * @param fontSize string
	 */
	async setFontSize(fontSize: string): Promise<void> {
		await this.executeSelection.emit('FontSize');
		this.editorService.setFontSize(fontSize);
		this.execute.emit('FontSize');
	}
	/**
	 * toggle editor mode (WYSIWYG or SOURCE)
	 * @param m boolean
	 */
	setEditorMode(m: boolean) {
		const toggleEditorModeButton = this.doc.getElementById('toggleEditorMode' + '-' + this.id);
		if (m) {
			this.r.addClass(toggleEditorModeButton, 'active');
		} else {
			this.r.removeClass(toggleEditorModeButton, 'active');
		}
		this.htmlMode = m;
	}
	/**
	 * Upload image when file is selected
	 */
	onFileChanged(event) {
		const file = event.target.files[0];
		if (file.type.includes('image/')) {
			if (this.uploadUrl) {
				this.editorService.uploadImage(file).subscribe((e) => {
					if (e instanceof HttpResponse) {
						this.editorService.insertImage(e.body.imageUrl);
						this.fileReset();
					}
				});
			} else {
				const reader = new FileReader();
				reader.onload = (e: ProgressEvent) => {
					const fr = e.currentTarget as FileReader;
					this.editorService.insertImage(fr.result.toString());
				};
				reader.readAsDataURL(file);
			}
		}
	}
	/**
	 * Reset Input
	 */
	fileReset() {
		this.myInputFile.nativeElement.value = '';
	}
	/**
	 * Set custom class
	 */
	setCustomClass(classId: string) {
		if (classId === '-1') {
			this.execute.emit('clear');
		} else {
			this.editorService.createCustomClass(this._customClasses[+classId]);
		}
	}
	selectPreview(e) {
		this.multiPdfSelectIntance.emit(e);
		}
	refreshPreview() {
		let tempDiv: any = document.getElementById('tempDiv');
		let innerHTML = 'some random text';
		this.subject.instanceRefreshCheck(innerHTML);
		this.changeDetector.detectChanges();
	}
}
