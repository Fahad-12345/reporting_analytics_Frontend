import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, EventEmitter, OnInit, Output, OnDestroy } from '@angular/core';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { Subscription } from 'rxjs';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import {checkReactiveFormIsEmpty, isEmptyObject, isObjectEmpty } from '@appDir/shared/utils/utils.helpers';
import { DeaSchedulerCodenService } from '../../dea.schedule.code.service';

@Component({
	selector: 'app-deaScheduleCodeEnum-filter',
	templateUrl: './dea.schedule.code-filter.component.html',
	styleUrls: ['./dea.schedule.code-filter.component.scss']
})
export class DeaScheduleCodeFilterComponent implements OnInit, OnDestroy {
	@Output() onFilterDeaSchedulerCodeList = new EventEmitter<any>();
	subscription: Subscription[] = [];
	isCollapsed = false;
	deaSchedulerCodeForm: FormGroup;
	loadSpin = false;
	constructor(private fb: FormBuilder, private _route: ActivatedRoute, private deaSchedulerCodeService: DeaSchedulerCodenService) {
	}

	ngOnInit() {
		this.getQueryParams();
	}
	getQueryParams() {
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.setDeaSchedulerCodeFilterFormInit(); // INIT FORM
				this.setQueryParams(params);
			})
		);
	}
	setQueryParams(queryParams) {
		this.deaSchedulerCodeForm.patchValue(queryParams);
		if (!isEmptyObject(queryParams)) {
			this.deaSchedulerCodeService.addUrlQueryParams(queryParams);
			this.filterDeaSchedulerCode(queryParams);
		}
	}
	// INITITALIZE DEA SCHEDULER CODE FILTER FORM
	setDeaSchedulerCodeFilterFormInit() {
		this.deaSchedulerCodeForm = this.fb.group({
			ncit_code: [''],
			ncpdp_preferred_term: [''],
			federal_dea_class_code: [''],
			federal_dea_class_code_desc: ['']
		})
	}

	// FILTERED DEA SCHEDULER CODE
	filterDeaSchedulerCode(params?) {
		const filters = checkReactiveFormIsEmpty(this.deaSchedulerCodeForm);
		const queryParams = {
			filter: !isObjectEmpty(filters),
			page: params.page ? params.page : 1,
			per_page: params.per_page ? params.per_page : 10,
			order: OrderEnum.DEC,
			pagination: true
		}
		this.deaSchedulerCodeService.addUrlQueryParams({ ...queryParams, ...filters });
		this.get_filtered_data({ ...queryParams, ...filters });
	}
	// GET FILTERED DATA
	get_filtered_data(queryParams) {
		this.loadSpin = true;
		this.subscription.push(
			this.deaSchedulerCodeService.getReactionists(queryParams).subscribe((onFilterDeaSchedulerCodeList: any) => {
				if (onFilterDeaSchedulerCodeList.status) {
					this.loadSpin = false;
					onFilterDeaSchedulerCodeList['filterValues'] = this.deaSchedulerCodeForm.value
					this.onFilterDeaSchedulerCodeList.emit(onFilterDeaSchedulerCodeList);
				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);
	}
	// RESET DEA SCHEDULER CODE LIST ON DEA SCHEDULER CODE LIST COMPONENT
	resetDeaSchedulerCodeList() {
		this.setDeaSchedulerCodeFilterFormInit();
		this.deaSchedulerCodeForm.markAsUntouched();
		const queryParams = {
			page: 1,
			per_page: 10,
			order: OrderEnum.DEC,
			pagination: true
		}
		this.deaSchedulerCodeService.addUrlQueryParams(queryParams);
		this.get_filtered_data(queryParams);
	}
	// DEA SCHEDULER CODE RESET BUTTON DISALBED OR ENABLED
	resetDeaSchedulerCodeFilterResetDisabledCheck() {
		if (isEmptyObject(this.deaSchedulerCodeForm.value)) {
			return true;
		}
		return false;
	}
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}
}
