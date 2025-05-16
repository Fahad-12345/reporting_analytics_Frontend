import { FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

export const atLeastOneFieldRequired =
	(validator: ValidatorFn, controls: string[] = null) =>
	(group: FormGroup): ValidationErrors | null => {
		if (!controls) {
			controls = Object.keys(group.controls);
		}

		const hasAtLeastOne =
			group && group.controls && controls.some((k) => !validator(group.controls[k]));

		return hasAtLeastOne
			? null
			: {
        atLeastOneFieldRequired: true,
			  };
	};
