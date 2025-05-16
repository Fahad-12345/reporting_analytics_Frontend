import { FieldConfig } from './fieldConfig.model';
import { InputTypes } from '../constants/InputTypes.enum';
import { ComponentTypes } from '../constants/ComponentTypes.enum';
import { ButtonTypes } from '../constants/ButtonTypes.enum';
import { Configs } from './configs.class';

export class ButtonClass extends FieldConfig {
    constructor(
        label,
        classes?: any[],
        type?: ButtonTypes,
        onSubmit?: any,
        configs?: Configs
    ) {
        super();
        this.element = ComponentTypes.button;
        this.label = label;
        this.classes = classes;
        this.type = type;
        this.configs = configs;
        this.onSubmit = onSubmit;
        this.configs = configs
    }
}