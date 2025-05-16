import { FilterFieldHtmlModel } from './filter-field-html-model';

export class PacketFilterFieldModel extends FilterFieldHtmlModel {
	constructor() {
		super();
	}
	showSpecialtyField() {
		return true;
	}
	// showCaseTypeField() {
	// 	return true;
	// }
	showCreatedAtField() {
		return true;
	}
	showJobStatus() {
		return true;
	}
	showCreatedBy() {
		return true;
	}
	showPracticeLocationIdFilter() {
		return true;
	}
	showPracticeLocationFilter() {
		return false;
	}
	showBillIds(){
		return true;
	}
}
