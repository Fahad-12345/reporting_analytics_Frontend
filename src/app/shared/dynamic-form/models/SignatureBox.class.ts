import { ComponentTypes } from '../constants/ComponentTypes.enum';
// import { Options } from 'ngx-chips/core/providers/options-provider';
import { Validator } from './validator.model';
import { FieldConfig } from './fieldConfig.model';
import { Options } from './options.model';
export class SignatureBoxClass extends FieldConfig {
	constructor(
		name: string,
		validations?: Validator[],
		classes?: any[]
	) {
		super()
		this.element = ComponentTypes.signaturebox;
		this.name = name;
		this.validations = validations;
		this.classes = classes;
	}
}
