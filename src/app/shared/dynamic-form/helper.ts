import { FieldConfig } from "./models/fieldConfig.model";
import { ValidatorFn, FormControl, AbstractControl } from "@angular/forms";
import { Validator } from "./models/validator.model";
export function getFieldControlByName(fieldConfig: FieldConfig[], name: string): FieldConfig {
    // return fieldConfig.find(field => {
    //     if (field.name) {
    //         return field.name == name
    //     } else if (field.children) {
    //         return getFieldControlByName(field.children, name)
    //     }
    // }

    // );
    let result;
    fieldConfig.forEach(field => {
        if (field.name == name || (field.configs && field.configs.name && field.configs.name === name) || (field.configs && field.configs.formControlName && field.configs.formControlName === name)) {
            result = field;
        } else if (field.children && field.children.length > 0) {
            let _result = getFieldControlByName(field.children, name)
            if (_result) {
                result = _result
            }
        }
    })
    return result as FieldConfig;
}

export function updateControlValidations(validations: Validator[], formControl:AbstractControl) {

	formControl.clearValidators();

	formControl.updateValueAndValidity({emitEvent:false});

    if (validations && validations.length > 0) {

      validations.forEach(valid => {

		  if(valid.validator)

		  {

			formControl.setValidators(valid.validator);

		  }

		formControl.updateValueAndValidity({emitEvent:false});

      });

    }

  }
export function getHiddenControls(fieldConfig: FieldConfig[]) {
    let result = [];
    fieldConfig.forEach(field => {
        if (field.classes && field.classes.length > 0 && field.classes.filter(className => className == 'hidden').length > 0) {
            result.push(field)
        }
        if (field.children && field.children.length > 0) {
            result = [...result, ...getHiddenControls(field.children)]
        }

    })
    return result;
}

export function getAllControls(fieldConfig: FieldConfig[]): FieldConfig[] {
    let result = [];
    fieldConfig.forEach(field => {
        result.push(field)
        if (field.children && field.children.length > 0) {
            result = [...result, ...getAllControls(field.children)]
        }

    })
    return result;
}

export function maxDateValidator(max_date: Date): ValidatorFn {
    return (control: FormControl) => {
        if (!control.value || max_date > new Date(control.value))
            return null;
        else return { 'max_date': true }
    }
}

export function minDateValidator(min_date: Date): ValidatorFn {
    return (control: FormControl) => {
        if (!control.value || min_date < new Date(control.value)) {
            return null;
        } else {
            return { 'min_date': true }
        }
    }
}
