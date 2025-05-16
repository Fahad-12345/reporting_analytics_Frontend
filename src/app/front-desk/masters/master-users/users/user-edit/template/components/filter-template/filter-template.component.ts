import { ActivatedRoute } from '@angular/router';
import { removeEmptyAndNullsFormObject } from '@shared/utils/utils.helpers';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { TemplateUrlsEnum } from '../../template-urls-enum';
import { ShareAbleFilter } from '@appDir/shared/models/share-able-filter';
import { EnumApiPath } from '@appDir/front-desk/billing/Models/searchedKeys-modal';
import { CaseTypeUrlsEnum } from '@appDir/front-desk/masters/providers/caseType/case.type.enum';
import { VisitTypeUrlsEnum } from '@appDir/front-desk/masters/providers/vistType/visit.type.enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';

@Component({
  selector: 'app-filter-template',
  templateUrl: './filter-template.component.html',
  styleUrls: ['./filter-template.component.scss']
})
export class FilterTemplateComponent implements OnInit {
	public isCollapsed = false;
	templateFilterForm: FormGroup;
	eventsSubject: Subject<any> = new Subject<any>();
	@Output() applyFilterValues = new EventEmitter();
	@Input() loading:boolean = false;
	EnumApiPath = EnumApiPath;
	CaseTypeUrls = CaseTypeUrlsEnum;
	visitTypeUrls = VisitTypeUrlsEnum;
	templateUrls = TemplateUrlsEnum.get_template_filter;
	mainApi = REQUEST_SERVERS;
	conditionalExtraApiParams = {
		user_id: this.route.parent.snapshot.params.id
	}
	constructor(private fb: FormBuilder,public route:ActivatedRoute) {}

	ngOnInit() {
		this.initClinicFilter();
	}
	initClinicFilter() {
		this.templateFilterForm = this.fb.group({
			specialty_id: [''],
			facility_location_id: [''],
			visit_type_id: [''],
			case_type_id: [''],
			template_name: [''],
		});
	}
	applyFilter() {
		this.loading = true;
		this.applyFilterValues.emit(removeEmptyAndNullsFormObject(this.templateFilterForm.value));
	}
	resetFilter() {
		this.templateFilterForm.reset();
		this.initClinicFilter();
		this.eventsSubject.next(true);
		this.applyFilterValues.emit({});
	}
	selectionOnValueChange(e: any,Type?) {
		const info = new ShareAbleFilter(e);
		this.templateFilterForm.patchValue(removeEmptyAndNullsFormObject(info));
		((e.data && e.data.length == 0) || !e.data) ? this.templateFilterForm.controls[Type].setValue(null) : null;		
	}
}
