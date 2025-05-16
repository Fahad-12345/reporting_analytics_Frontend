import { AbstractControl, FormControl, FormGroup,ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { DialogEnum } from "@appDir/front-desk/fd_shared/models/Case.model";
export class CustomFormValidators extends Validators {
	static validateDefaultNoneSelectedError(control: FormControl) {
	  if (control.value && control.value==DialogEnum.none) {
		
		return {
			defaultnoneSelectedError: true
		  };
		
	  } else {
		return null;
	  }
	}
	static noWhitespace(control:FormControl){
		if(!control.value){
			return
		}
		let isWhitespace = ((control.value).trim().length === 0 || control.value.charAt(0) == ' ');
        let isValid = !isWhitespace;
         return isValid ? null : { 'whitespace': true }
	}

  static futureDateValidator(formGroup:FormGroup) {
		let date=new Date(formGroup?.controls['date']?.value);
		if(!date){
			return null;
		}
		let today=new Date()
		return (date>today)?{'futureDate': true} : null;
	}
	static hasOnlyWhitespace(control: AbstractControl): ValidationErrors | null {
		if (control && control.value) {
		  const value = control.value as string;
		  return value.trim().length === 0 ? { 'whitespace': true } : null;
		}
		return null;
	  }


}