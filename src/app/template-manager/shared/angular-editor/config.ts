export interface CustomClass {
	name: string;
	class: string;
	tag?: string;
}
export interface Font {
	name: string;
	class: string;
}

export interface AngularEditorConfig {
	editable?: boolean;
	spellcheck?: boolean;
	height?: 'auto' | string;
	minHeight?: '0' | string;
	maxHeight?: 'auto' | string;
	width?: 'auto' | string;
	minWidth?: '0' | string;
	translate?: 'yes' | 'now' | string;
	enableToolbar?: boolean;
	showToolbar?: boolean;
	placeholder?: string;
	placeholder_calculation?: string;
	defaultParagraphSeparator?: string;
	defaultFontName?: string;
	defaultFontSize?: '1' | '2' | '3' | '4' | '5' | '6' | '7' | string;
	uploadUrl?: string;
	uploadWithCredentials?: boolean;
	fonts?: Font[];
	customClasses?: CustomClass[];
	sanitize?: boolean;
	toolbarPosition?: 'top' | 'bottom';
	outline?: boolean;
	}
export const angularEditorConfig: AngularEditorConfig = {
	editable: true,
	spellcheck: true,
	height: 'auto',
	minHeight: '0',
	maxHeight: 'auto',
	width: 'auto',
	minWidth: '0',
	translate: 'yes',
	enableToolbar: true,
	showToolbar: true,
	placeholder: 'Enter text here...',
	placeholder_calculation: 'Enter calculation here...',
	defaultParagraphSeparator: '',
	defaultFontName: '',
	defaultFontSize: '',
	fonts: [
		{ class: 'arial', name: 'Arial' },
		{ class: 'times-new-roman', name: 'Times New Roman' },
		{ class: 'calibri', name: 'Calibri' },
		{ class: 'comic-sans-ms', name: 'Comic Sans MS' },
	],
	uploadUrl: 'v1/image',
	uploadWithCredentials: false,
	sanitize: true,
	toolbarPosition: 'top',
	outline: true,
	/*toolbarHiddenButtons: [
    ['bold', 'italic', 'underline', 'strikeThrough', 'superscript', 'subscript'],
    ['heading', 'fontName', 'fontSize', 'color'],
    ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', 'indent', 'outdent'],
    ['cut', 'copy', 'delete', 'removeFormat', 'undo', 'redo'],
    ['paragraph', 'blockquote', 'removeBlockquote', 'horizontalLine', 'orderedList', 'unorderedList'],
    ['link', 'unlink', 'image', 'video']
  ]*/
};
