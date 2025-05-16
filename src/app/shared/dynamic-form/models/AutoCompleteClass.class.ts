import { InputTypes } from '../constants/InputTypes.enum';
import { Options } from './options.model';
import { Validator } from './validator.model';
import { FieldConfig } from './fieldConfig.model';
import { ComponentTypes } from '../constants/ComponentTypes.enum';
import { Validators } from '@angular/forms';
import { Config } from '@appDir/config/config';
import { Configs } from './configs.class';
import { T } from '@angular/cdk/keycodes';

export class AutoCompleteClass extends FieldConfig {

	constructor(
		label: string, // Placeholder of element
		name: string, //form control name of element
		bindLabel: string, //bind label property of ng-select
		bindValue: string, //bind value property of ng-select
		onSubmit: any, //on change event
		mulitple: any, // if autocomplete type is multiple
		values?: any, //any default value
		validations?: Validator[], //validations
		style?: string, //styling
		classes?: string[], //classes
		items?: [], //options to choose from,
		configs?: Configs,
		onFocus?:any,
		onBlur?:any,
		onClear?:any,
		qualifierBoolean? :boolean,
		bindLabelForTooltips?: string,
		bindQualifierLabel?:string,
		groupBy?: string,
		selectableGroup?: boolean,
		selectableGroupAsModel?: boolean
	) {
		super();
		this.element = ComponentTypes.autocomplete;
		this.label = label;
		this.name = name;
		this.multiple = mulitple;
		this.bindLabel = bindLabel;
		this.bindValue = bindValue;
		this.onSubmit = onSubmit;
		this.values = values;
		this.validations = validations;
		this.style = style;
		this.classes = classes;
		this.items = items;
		this.configs = configs;
		this.onFocus = onFocus;
		this.onBlur = onBlur;
		this.onClear=onClear;
		this.qualifierBoolean=qualifierBoolean;
		this.bindLabelForTooltips = bindLabelForTooltips;
		this.bindQualifierLabel = bindQualifierLabel?bindQualifierLabel:'qualifier';
		this.groupBy = groupBy;
		this.selectableGroup = selectableGroup;
		this.selectableGroupAsModel = selectableGroupAsModel;
	}
}
