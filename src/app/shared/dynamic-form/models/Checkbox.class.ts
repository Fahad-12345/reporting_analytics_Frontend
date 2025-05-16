import { InputTypes } from '../constants/InputTypes.enum';
import { Options } from './options.model';
import { Validator } from './validator.model';
import { FieldConfig } from './fieldConfig.model';
import { ComponentTypes } from '../constants/ComponentTypes.enum';
import { Validators } from '@angular/forms';

export class CheckboxClass extends FieldConfig {

    constructor(
        label: string,
        name: string,
        inputType: InputTypes | string,
        values?: any,
        validations?: Validator[],
        style?: string,
        classes?: string[]
    ) {
        super();
        this.element = ComponentTypes.checkbox;
        this.label = label;
        this.name = name;
        this.type = inputType;
        this.values = values;
        this.validations = validations;
        this.style = style;
        this.classes = classes;
    }
}