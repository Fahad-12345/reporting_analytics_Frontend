import { FilterFieldHtmlModel } from './filter-field-html-model';

export class PomFilterFieldModel extends FilterFieldHtmlModel {
	constructor() {
		super();
	}

	showBillIDFiled() {
		return true;
	}
	showBillDateField() {
		return true;
	}
	showPatientNameField() {
		return true;
	}
	showSpecialtyField() {
		return true;
	}
	showPomIDField() {
		return true;
	}
	showScamPomDateField() {
		return true;
	}
	showCaseIDFiled() {
		return false;
	}
}
