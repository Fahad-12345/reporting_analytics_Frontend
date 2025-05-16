import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, EventEmitter, OnInit, Output, OnDestroy } from '@angular/core';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { Subscription } from 'rxjs';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { checkReactiveFormIsEmpty, isEmptyObject, isObjectEmpty } from '@appDir/shared/utils/utils.helpers';
import { ErxOverrideReasonService } from '../../erx-override-reason.service';
import { Location } from '@angular/common';
@Component({
	selector: 'app-erx-override-reason-filter',
	templateUrl: './erx-override-reason-filter.component.html',
	styleUrls: ['./erx-override-reason-filter.component.scss']
})
export class ErxOverrideReasonFilterComponent implements OnInit, OnDestroy {
	@Output() onFilterErxOverrideReasonList = new EventEmitter<any>();
	subscription: Subscription[] = [];
	isCollapsed = false;
	erxOverrideReasonDetailForm: FormGroup;
	loadSpin = false;
	constructor(private fb: FormBuilder, private erxOverrideReasonService: ErxOverrideReasonService, private location: Location, private router: Router, private _route: ActivatedRoute) {
	}

	ngOnInit() {
		this.getQueryParams();
	}
	getQueryParams() {
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.erxOverrideReasonFilterFormInit(); // INIT FORM
				this.setQueryParams(params);
			}),
		);
	}
	setQueryParams(queryParams?) {
		this.erxOverrideReasonDetailForm.patchValue(queryParams);
		if (!isEmptyObject(queryParams)) {
			this.erxOverrideReasonService.addUrlQueryParams(queryParams);
			this.filterErxOverrideReason(queryParams);
		}
	}
	// INITITALIZE ERX OVERRIDE REASON FILTER FORM
	erxOverrideReasonFilterFormInit() {
		this.erxOverrideReasonDetailForm = this.fb.group({
			reason: ['']
		})
	}

	// FILTERED ERX OVERRIDE REASON
	filterErxOverrideReason(params) {
		const filters = checkReactiveFormIsEmpty(this.erxOverrideReasonDetailForm);
		const queryParams = {
			filter: !isObjectEmpty(filters),
			page: params.page ? params.page : 1,
			per_page: params.per_page ? params.per_page : 10,
			order: OrderEnum.DEC,
			pagination: true
		}
		this.erxOverrideReasonService.addUrlQueryParams({ ...queryParams, ...filters });
		this.get_filtered_data({ ...queryParams, ...filters });
	}
	// GET FILTERED DATA
	get_filtered_data(queryParams) {
		this.loadSpin = true;
		this.subscription.push(
			this.erxOverrideReasonService.getErxOverrideReason(queryParams).subscribe((erxOverrideReasonList: any) => {
				if (erxOverrideReasonList.status) {
					this.loadSpin = false;
					erxOverrideReasonList['filterValues'] = this.erxOverrideReasonDetailForm.value
					this.onFilterErxOverrideReasonList.emit(erxOverrideReasonList);
				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);
	}
	// RESET ERX OVERRIDE REASON ON ERX OVERRIDE REASON COMPONENT
	resetErxOverrideReasonList() {
		this.erxOverrideReasonFilterFormInit();
		this.erxOverrideReasonDetailForm.markAsUntouched();
		const queryParams = {
			page: 1,
			per_page: 10,
			order: OrderEnum.DEC,
			pagination: true
		}
		this.erxOverrideReasonService.addUrlQueryParams(queryParams);
		this.get_filtered_data(queryParams);
	}
	// ERX OVERRIDE REASON RESET BUTTON DISALBED OR ENABLED
	erxOverrideReasonFilterResetDisabledCheck() {
		if (isEmptyObject(this.erxOverrideReasonDetailForm.value)) {
			return true;
		}
		return false;
	}
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}
}
