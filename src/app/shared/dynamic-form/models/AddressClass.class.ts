import { FieldConfig } from "./fieldConfig.model";
import { Validator } from "./validator.model";
import { Configs } from "./configs.class";
// import { Config } from "@appDir/config/config";

export class AddressClass extends FieldConfig {
    constructor(
        label: string, //placeholder of the element
        name: string, // name of form control
        onSubmit: any, //function to be called when addressChanged event is called
        values?: any, //any previous value
        validations?: Validator[], //validations
        style?: string, //inline styling
        classes?: string[], //classes
        configs?: Configs //any further configurations eg. readonly
    ) {
        super();
        this.element = "address";
        this.label = label;
        this.name = name;
        this.onSubmit = onSubmit;
        this.values = values;
        this.validations = validations;
        this.style = style;
        this.classes = classes;
        this.configs = configs
    }
}