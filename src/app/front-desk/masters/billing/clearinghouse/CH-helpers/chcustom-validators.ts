import { AbstractControl, FormArray, FormGroup, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";

export class CHcustomValidators extends Validators {
    public static requiredWithDefault(defaultValue: any) {
        return (control: AbstractControl): ValidationErrors | null => {
            if (control.value == defaultValue) {
                return { defaultValue: true }
            }
            else if (control.value instanceof Array && control.value.length == 0) {
                return { defaultValue: true }
            }
            return null;
        }

    }
    public static checkDuplicatePayerIds(control: AbstractControl): any {
        if (control.parent) {
            const formArray = <FormArray>control.parent.parent;
            const totalSelected = formArray.controls
                .map(control => control.value);
            const payer_ids = totalSelected.map(value => value.payer_id)
            const hasDuplicate = payer_ids.some(
                (name, index) => payer_ids.indexOf(name, index + 1) != -1);
            return hasDuplicate ? { duplicate: true } : null
        }
    }
    public static BothNotNull(control: AbstractControl): any {
        if (control.parent) {
            const formGroup = <FormGroup>control.parent;
            const bothN = (!formGroup.controls['automotive'].value && !formGroup.controls['worker_compensation'].value) ? true : false;
            return bothN ? { bothNo: true } : null
        }
    }
}

