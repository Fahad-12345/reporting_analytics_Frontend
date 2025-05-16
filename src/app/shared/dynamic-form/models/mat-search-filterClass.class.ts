import { Configs } from './configs.class';
import { FieldConfig } from './fieldConfig.model';
import { Validator } from './validator.model';

export class MatSearchFilterClass extends FieldConfig {

	constructor(
		label: string, // Placeholder of element
		name: string, //form control name of element
		bindLabel: string, //bind label property of ng-select
		bindValue: string, //bind value property of ng-select
		onSubmit: any, //on change event
		mulitple: any, // if autocomplete type is multiple
		disabled?:boolean,
		values?: any, //any default value
		validations?: Validator[], //validations
		style?: string, //styling
		classes?: string[], //classes
		items?: [], //options to choose from,
		configs?: Configs,
		onFocus?:any,
		onBlur?:any,
		onClear?:any,
		max?:any,
		selected_case_type_slug?:string,
		allowed_case_type_slugs?:string[],
		onScroll?:any,
		showDialog?:boolean,
		dialogMessage?:string,
	) {
		super();
		this.element = "searchFilter";
		this.label = label;
		this.name = name;
		this.multiple = mulitple;
		this.bindLabel = bindLabel;
		this.bindValue = bindValue;
		this.onSubmit = onSubmit;
		this.values = values;
		this.disabled = disabled;
		this.validations = validations;
		this.style = style;
		this.classes = classes;
		this.items = items;
		this.configs = configs;
		this.onFocus = onFocus;
		this.onBlur = onBlur;
		this.onClear=onClear;
		this.max=max;
		this.selected_case_type_slug=selected_case_type_slug;
		this.allowed_case_type_slugs=allowed_case_type_slugs;
		this.onScroll = onScroll;
		this.showDialog = showDialog;
		this.dialogMessage = dialogMessage;
	}
}
