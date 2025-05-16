export interface IFilterFieldHtml{
    showBillIDFiled();
    showCaseIDFiled();
    showBillDateField();
    showPatientNameField();
    showPacketIDField();
    showSpecialtyField();
    showCaseTypeField();
    showPomIDField();
    showCreatedAtField();
    showScamPomDateField();
    showJobStatus();
    showCreatedBy();
    showBillStatus();
	showCreatedBillStatus();
	showProvider();
    showAttorney();
    showEmployer();
    showInsurance();
    showPracticeLocationIdFilter();
    showPracticeLocationFilter();
    showPatientNameFieldInSpeciality();
	showRangeFromDateField()
	showRangeToDateField()
    showAttorneyCheckInBillSpeciality(action?: boolean);
    showEmployerCheckInBillSpeciality(action?: boolean);
    showInsuranceCheckInBillSpeciality(action?: boolean);
    showPatientCheckInBillSpeciality(action?: boolean);
    showBillIds();
    showDateRange();
    showGroupBy();
    showVisitType();
}

export abstract class FilterFieldHtmlModel implements IFilterFieldHtml {

    constructor(){}

    showBillIDFiled() {
       return false;
    }
    showBillDateField() {
        return false;
    }
    showPatientNameField() {
        return true;
    }
    showPacketIDField() {
        return true;
    }
    showSpecialtyField() {
        return false;
    }
    showCaseTypeField() {
        return false;
    }
    showPomIDField() {
        return false;
    }
    showCreatedAtField() {
        return false;
    }
    showScamPomDateField() {
        return false;
    }
    showCaseIDFiled() {
        return true;
    }

    showJobStatus() {
        return false;
    }
    showCreatedBy() {
        return false;
    }
    showBillStatus(){
        return false;
    }
	showCreatedBillStatus(){
        return false;
    }
	showProvider(){
		return false;
	}
    showAttorney() {
        return false;
    }
    showEmployer() {
        return false;
    }
    showInsurance() {
        return false;
    }
	showRangeFromDateField()
	{
		return false;
	}
	showRangeToDateField()
	{
		return false;
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

    showPatientNameFieldInSpeciality() {
        return false;
    }
    showPracticeLocationIdFilter() {
       return false;
    }
    showPracticeLocationFilter() {
        return true;
    }
    showBillIds(){
		return false;
	}
    showDateRange(){
        return false;
    }
    showGroupBy(){
        return false;
    }
    showVisitType(){
        return false;
    }
}
