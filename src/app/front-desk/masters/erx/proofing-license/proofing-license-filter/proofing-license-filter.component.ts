import { ActivatedRoute } from '@angular/router';

import { ErxService } from './../../erx.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, EventEmitter, OnInit, Output, OnDestroy } from '@angular/core';
import { Page } from '@appDir/front-desk/models/page';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { Subscription } from 'rxjs';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { changeDateFormat, checkReactiveFormIsEmpty, isEmptyObject, isObjectEmpty } from '@appDir/shared/utils/utils.helpers';

@Component({
	selector: 'app-proofing-license-filter',
	templateUrl: './proofing-license-filter.component.html',
	styleUrls: ['./proofing-license-filter.component.scss']
})
export class ProofingLicenseFilterComponent implements OnInit, OnDestroy {
	@Output() onFilterProofingLicenseList = new EventEmitter<any>();
	subscription: Subscription[] = [];
	isCollapsed;
	proofingLicenseFilterForm: FormGroup;
	proofingLicensePage: Page; // USED PAGE FOR PROOFING LICENSE PAGINATION
	loadSpin = false;
	userStatusLists;
	min = new Date('1900/01/01');
	// selectedLicenseStatus;
	licenseStatuses = [{
		id: 1,
		name: 'Active'
	}, {
		id: 0,
		name: 'Deactive'
	}];
	constructor(private fb: FormBuilder, private erxService: ErxService, private _route: ActivatedRoute) {
	}

	ngOnInit() {
		this.getQueryParams();
	}
	getQueryParams() {
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.proofingLicenseFilterFormInit();
				this.getUserStatusLists(); // GET USER LICENSE STATUSES
				this.setQueryParams(params);
			}),
		);
	}
	setQueryParams(queryParams) {
		this.proofingLicenseFilterForm.patchValue(queryParams);
		if (!isEmptyObject(queryParams)) {
			this.erxService.addUrlQueryParams(queryParams);
			this.filterProofingLicense(queryParams);
		}
	}
	// INITITALIZE PROOFING LICENSE FILTER FORM
	proofingLicenseFilterFormInit() {
		this.proofingLicenseFilterForm = this.fb.group({
			exp_date: [''],
			license_status: [null],
			user_status: [null],
		})
	}
	// GET USER STATUSES
	getUserStatusLists() {
		this.loadSpin = true;
		this.subscription.push(
			this.erxService.getUserLicenseStatusLists().subscribe((userLicenseList: any) => {
				if (userLicenseList.status) {
					this.loadSpin = false;
					this.userStatusLists = userLicenseList.result.data;
				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);
	}
	// FILTERED PROOFING LICENSE
	filterProofingLicense(params?) {
		const filters = checkReactiveFormIsEmpty(this.proofingLicenseFilterForm);
		const queryParams = {
			filter: !isObjectEmpty(filters),
			page: params.page ? params.page : 1,
			per_page: params.per_page ? params.per_page : 10,
			order: OrderEnum.DEC,
			pagination: true
		}
		this.erxService.addUrlQueryParams({ ...queryParams, ...filters });
		this.get_filtered_data({ ...queryParams, ...filters });
	}
	// GET FILTERED DATA
	get_filtered_data(queryParams) {
		this.loadSpin = true;
		this.subscription.push(
			this.erxService.getProofingLicenseLists(queryParams).subscribe((proofingLicenseList: any) => {
				if (proofingLicenseList.status) {
					this.loadSpin = false;
					proofingLicenseList['filterValues'] = this.proofingLicenseFilterForm.value
					this.onFilterProofingLicenseList.emit(proofingLicenseList);
				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);
	}
	// RESET PROOFING LICENSE LIST ON PROOFING LICENSE LIST COMPONENT
	reset_proofingLicense_list() {
		this.proofingLicenseFilterFormInit();
		this.proofingLicenseFilterForm.markAsUntouched();
		const queryParams = {
			page: 1,
			per_page: 10,
			order: OrderEnum.DEC,
			pagination: true
		}
		this.erxService.addUrlQueryParams(queryParams);
		this.get_filtered_data(queryParams);
	}
	// PROOFING LICENSE RESET BUTTON DISALBED OR ENABLED
	proofingLicense_reset_disabled() {
		if (isEmptyObject(this.proofingLicenseFilterForm.value)) {
			return true;
		}
		return false;
	}
	// CLOSE LICENSE STATUS
	closeLicenseStatus() {
		this.proofingLicenseFilterForm.controls.license_status.setValue('');
	}
	// CLOSE USER STATUS
	closeUserStatus() {
		this.proofingLicenseFilterForm.controls.user_status.setValue('');
	}
	// CHANGE FORMAT OF EXPIRY DATE FILTER
	seelctExpiryDate() {
		this.proofingLicenseFilterForm.controls.exp_date.setValue(changeDateFormat(this.proofingLicenseFilterForm.controls.exp_date.value));
	}
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}
}
