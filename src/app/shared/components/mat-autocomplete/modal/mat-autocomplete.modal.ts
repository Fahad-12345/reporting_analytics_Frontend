export interface IMatAutoCompleteSpinnerShowIntellicense {
	icd_10;
	cpt_codes;
	diagnosis_codes;
}


export class MatAutoCompleteSpinnerShowIntellicenseModal implements IMatAutoCompleteSpinnerShowIntellicense {
	constructor() { }
	icd_10 = false;
	cpt_codes = false;
	diagnosis_codes = false;
}
