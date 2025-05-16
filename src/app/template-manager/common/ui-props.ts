import { SIGNATURE_TYPES, uiAnswer } from "./constants";

interface commonProperties {
	alignment: string
	answers: answer[]
	backgroundColor: string
	bgColor: boolean
	bottomUIBorder: number
	bottomUIPadding: number
	errors: number
	fontColor: boolean
	fontColorCode: string
	fontFamily: boolean
	fontFamilyValue: ''
	hidePdf: number
	instanceStatement: string
	isStatement: boolean
	leftUIBorder: number
	leftUIPadding: number
	lineSpacing: boolean
	lineSpacingValue: number
	linked_ui: number
	rightUIBorder: number
	rightUIPadding: number
	second_name: string
	selected_linked_ui_component: number
	statement: string
	tags: string[]
	topUIBorder: number
	topUIPadding: number
	type: string
	uiBorders: boolean
	uicomponent_name?: string
	uiPaddings: boolean
}

export interface imageLabelProperties extends commonProperties {
	OptionView: number
	data: imageLabelPoint[]
	enableTextInput: boolean
	firstTime: boolean
	height?: number
	is_required: boolean
	is_single_select: boolean
	paths: string[]
	penColor?: string
	hideLabels: boolean
	raw: string
	width: number
}

export interface signatureProperties extends commonProperties {
	displaySignatoryName: boolean
	displayAtPageEnd: boolean
	previousSignature: boolean
	selectedSignature: string
	showSimpleTextProperties: boolean
	signatoryName: string
	signature: any
	signatureLabel: string
	signaturePoints: any
	signature_id: string
	signature_listing: any
	signature_path: string
	signature_type: SIGNATURE_TYPES
	textInput: string
	signaturelink: string
	underlineSignature: boolean
	width: number
}

export interface imageLabelPoint {
	offsetX: number
	offsetY: number
	ratio: number
	isSelected: boolean
	label: string
	text: string
	linkedStatement: string
	linkedStatementCheck: boolean
}

type answer = {
	answer: string
}
