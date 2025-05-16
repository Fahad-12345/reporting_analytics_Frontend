import { FilterFieldHtmlModel } from './filter-field-html-model';

export class VisitDetailReportFilterFieldModel extends FilterFieldHtmlModel {
	constructor() {
		super();
	}	
	showSpecialtyField() {
		return true;
	}
	showCaseTypeField(): boolean {
        return true;
    }
    showPracticeLocationFilter(): boolean {
        return true;
    }
    showProvider(): boolean {
        return true;
    }
    showBillStatus(): boolean {
        return true;
    }
    showVisitType(): boolean {
        return true;
    }
    showDateRange(): boolean {
        return true;
    }
}
