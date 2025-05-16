import { FilterFieldHtmlModel } from "./filter-field-html-model";

export class SpecialityFilterFieldModel extends FilterFieldHtmlModel {
	constructor() {
		super();
	}

	showBillIDFiled() {
		return true;
	}
    // showBillDateField() {
	// 	return true;
	// }
    showCaseIDFiled(){
        return true;
    }
	showSpecialtyField() {
		return true;
	}
	showCaseTypeField() {
		return true;
	}

	showBillStatus(){
		return true;
	}
	showCreatedBillStatus()
	{
		return true;
	}
	showRangeFromDateField()
	{
		return true;
	}
	showRangeToDateField()
	{
		return true;
	}
	showProvider(){
		return true;
	}
	showAttorney() {
        return true;
    }
    showEmployer() {
        return true;
    }
    showInsurance() {
        return true;
    }
	showBillIds(){
		return false;
	}
    showPatientNameFieldInSpeciality() {
        return true;
    }

	showAttorneyCheckInBillSpeciality(action = true) {
        return action;
    }
    showEmployerCheckInBillSpeciality(action = true) {
        return action;
    }
    showInsuranceCheckInBillSpeciality(action = true) {
        return action;
    }

    showPatientCheckInBillSpeciality(action = true) {
        return action;
    }
    showCreatedBy(){
        return true;
    }

}
