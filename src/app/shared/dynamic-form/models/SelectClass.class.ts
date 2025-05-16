import { FieldConfig } from './fieldConfig.model';
import { ComponentTypes } from '../constants/ComponentTypes.enum';
import { Options } from './options.model';
import { Validator } from './validator.model';

export class SelectClass extends FieldConfig{
    constructor(
        label:string,
        name:string,
        options:Options[],
        values?:any,
        validations?:Validator[],
		classes?:any[],
		disabled?:boolean,
		qualifierBoolean? : boolean,
        input_type_status:string='default'){
        super();
		this.element=ComponentTypes.select;
        this.label=label;
		this.name=name;
		this.disabled=disabled;
        this.options=options;
        this.values=values;
        this.validations=validations;
        this.classes=classes;
		this.qualifierBoolean = qualifierBoolean;
        this.input_type_status=input_type_status;

    }
} 
