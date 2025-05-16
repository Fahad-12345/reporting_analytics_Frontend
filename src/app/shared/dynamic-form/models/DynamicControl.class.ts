import { FieldConfig } from "./fieldConfig.model";

export class DynamicControl extends FieldConfig {
    constructor(name: string, value: any) {
        super();
        this.name = name;
        this.values = value;
        this.element = 'control'
    }
}