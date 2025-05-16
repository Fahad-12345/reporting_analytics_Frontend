import { InputTypes } from '../constants/InputTypes.enum';
import { Options } from './options.model';
import { Validator } from './validator.model';
import { FieldConfig } from './fieldConfig.model';
import { ComponentTypes } from '../constants/ComponentTypes.enum';
import { Validators } from '@angular/forms';
import { Configs } from './configs.class';
import { maxDateValidator, minDateValidator } from '../helper';

export class InputClass extends FieldConfig {

    constructor(
        label: string,
        name: string,

        inputType: InputTypes | string,
        values?: any,
        validations?: Validator[],
        style?: string,
        classes?: string[],
        configs?: Configs,
        id?: string,
    ) {
        super();
        this.element = ComponentTypes.input;
        this.label = label;
        this.name = name;

        this.type = inputType;
        this.values = values;
        this.validations = validations;
        this.style = style;
        this.classes = classes;
        this.configs = configs;
        this.id = id;

        if (this.type === InputTypes.date) {

            if (this.configs && this.configs.max) {
                let max_date = this.configs.max as Date
                this.validations.push({ name: 'max_date', message: `Max date should be ${max_date.getMonth() + 1}/${max_date.getDate()}/${max_date.getFullYear()}`, validator: maxDateValidator(max_date) })
            }
            if (this.configs && this.configs.min) {
                let min_date = this.configs.min as Date
                this.validations.push({ name: 'min_date', message: `Min date should be ${min_date.getMonth() + 1}/${min_date.getDate()}/${min_date.getFullYear()}`, validator: minDateValidator(min_date) })
            }
        }
    }
}