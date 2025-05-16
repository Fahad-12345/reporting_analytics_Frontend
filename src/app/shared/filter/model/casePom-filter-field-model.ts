import { FilterFieldHtmlModel } from './filter-field-html-model';

export class CasePomFilterFieldModel extends FilterFieldHtmlModel {
	constructor() {
		super();
	}

	showBillIDFiled() {
		return false;
	}
	showBillDateField() {
		return false;
	}
	showPatientNameField() {
		return true;
	}
	showPomIDField() {
		return true;
	}
	showScamPomDateField() {
		return true;
	}
	showCaseIDFiled() {
		return true;
	}
}
