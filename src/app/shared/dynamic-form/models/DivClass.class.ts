import { FieldConfig } from './fieldConfig.model';
import { Configs } from './configs.class'
export class DivClass extends FieldConfig {

    constructor(children: FieldConfig[], classes?: any[], values?: any, style?: any, config?: Configs) {
        super()
        this.element = "div"
        this.children = children;
        this.classes = classes;
        this.values = values;
        this.style = style
        this.configs = config;
    }
}