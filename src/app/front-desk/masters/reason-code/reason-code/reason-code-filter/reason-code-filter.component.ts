import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, EventEmitter, OnInit, Output, OnDestroy } from '@angular/core';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { Subscription } from 'rxjs';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { checkReactiveFormIsEmpty, isEmptyObject, isObjectEmpty } from '@appDir/shared/utils/utils.helpers';
import { ReasonCodeService } from '../../reason-code.service';

@Component({
	selector: 'app-reasonCode-filter',
	templateUrl: './reason-code-filter.component.html',
	styleUrls: ['./reason-code-filter.component.scss']
})
export class ReasonCodeFilterComponent implements OnInit, OnDestroy {
	@Output() onFilterReasonList = new EventEmitter<any>();
	subscription: Subscription[] = [];
	isCollapsed = false;
	reasonDetailForm: FormGroup;
	loadSpin = false;
	reasonCodeCategoriesLists;
	constructor(private fb: FormBuilder, private reasonService: ReasonCodeService, private _route: ActivatedRoute) {
	}

	ngOnInit() {
		this.getQueryParams();
	}
	getQueryParams() {
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.reasonDetailFilterFormInit(); // INIT FORM
				this.setQueryParams(params);
			}),
		);
	}
	setQueryParams(queryParams) {
		this.reasonDetailForm.patchValue(queryParams);
		if (!isEmptyObject(queryParams)) {
			this.filterReason(queryParams);
			this.reasonService.addUrlQueryParams(queryParams);
		}
	}
	// INITITALIZE REASON CODE FILTER FORM
	reasonDetailFilterFormInit() {
		this.reasonDetailForm = this.fb.group({
			code: [''],
			description: [''],
			reason_code_category_id: [''],
		})
	}
	searchReasonCodeCategory(event) {
		this.loadSpin = true;
		let queryParams = {
			name: event.target.value
		}
		this.subscription.push(
			this.reasonService.getReasonCodeCategoriesLists(queryParams).subscribe((reasonList: any) => {
				if (reasonList.status) {
					this.loadSpin = false;
					this.reasonCodeCategoriesLists = reasonList.result.data;
				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);
	}
	selectReasonCodeCategoryID(event) {
		this.reasonDetailForm.controls.reason_code_category_id.setValue(event);
	}
	reasonCodeCategoryListsEmtpy() {
		this.reasonCodeCategoriesLists = [];
	}
	// FILTERED REASON CODE
	filterReason(params?) {
		const filters = checkReactiveFormIsEmpty(this.reasonDetailForm);
		const queryParams = {
			filter: !isObjectEmpty(filters),
			page: params.page ? params.page : 1,
			per_page: params.per_page ? params.per_page : 10,
			order: OrderEnum.DEC,
			pagination: true
		}
		this.reasonService.addUrlQueryParams({ ...queryParams, ...filters });
		this.get_filtered_data({ ...queryParams, ...filters });
	}
	// GET FILTERED DATA
	get_filtered_data(queryParams) {
		this.loadSpin = true;
		this.subscription.push(
			this.reasonService.getReasonCodeLists(queryParams).subscribe((reasonList: any) => {
				if (reasonList.status) {
					this.loadSpin = false;
					reasonList['filterValues'] = this.reasonDetailForm.value
					this.onFilterReasonList.emit(reasonList);
				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);
	}
	// RESET REASON CODE LIST ON REASON CODE LIST COMPONENT
	resetReasonCodeList() {
		this.reasonDetailFilterFormInit();
		this.reasonDetailForm.markAsUntouched();
		const queryParams = {
			page: 1,
			per_page: 10,
			order: OrderEnum.DEC,
			pagination: true
		}
		this.reasonService.addUrlQueryParams(queryParams);
		this.get_filtered_data(queryParams);
	}
	// REASON CODE RESET BUTTON DISALBED OR ENABLED
	reasonCodeFilterResetDisabledCheck() {
		if (isEmptyObject(this.reasonDetailForm.value)) {
			return true;
		}
		return false;
	}
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}
}
