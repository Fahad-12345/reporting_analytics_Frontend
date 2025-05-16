import { FieldConfig } from './fieldConfig.model';
import { Options } from './options.model';
import { Validators } from '@angular/forms';
import { Validator } from './validator.model';
import { ComponentTypes } from '../constants/ComponentTypes.enum';

export class RadioButtonClass extends FieldConfig {
    constructor(label: string, name: string, options: Options[], values?: any, validations?: Validator[], classes?: any[]) {
        super();
        this.element = ComponentTypes.radioButton;
        this.label = label;
        this.name = name;
        this.options = options;
        this.values = values;
        this.validations = validations;
        this.classes = classes;
    }
}