import { ActivatedRoute } from '@angular/router';
import { ErxService } from './../../erx.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, EventEmitter, OnInit, Output, OnDestroy } from '@angular/core';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { Subscription } from 'rxjs';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { checkReactiveFormIsEmpty, isEmptyObject, isObjectEmpty } from '@appDir/shared/utils/utils.helpers';
import * as _ from 'lodash';
@Component({
	selector: 'app-pharmacy-filter',
	templateUrl: './pharmacy-filter.component.html',
	styleUrls: ['./pharmacy-filter.component.scss']
})
export class PharmacyFilterComponent implements OnInit, OnDestroy {
	@Output() onFilterPharmacyList = new EventEmitter<any>();
	subscription: Subscription[] = [];
	isCollapsed;
	pharmacyFilterForm: FormGroup;
	pharmacyTypeLists; // USED FOR SAVE LISTS OF PHARMACY TYPE
	pharmacyTypeSelected; // USED FOR SAVE WHICH PHARMCY TYPE SELECTED
	pharmacyServiceLevelsLists; // USED FOR SAVE PHARMCY SERVICE LEVELS LISTS
	loadSpin = false;
	selectedServiceLevels = []; // USED FOR SAVE WHICH PHARMCY SERVICE LEVELS SELECTED
	constructor(private fb: FormBuilder, private erxService: ErxService, private _route: ActivatedRoute) {
	}
	ngOnInit() {
		this.getQueryParams();
	}
	getQueryParams() {
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.pharmacy_filterForm_init(); // INIT FORM
				this.pharmacyTypesLists(); // GET LIST OF PHARMACY TYPES
				this.pharmacyAllServicesLevelsLists(); // GET LIST OF ALL SERVICE
				this.setQueryParams(params);
			}),
		);
	}
	setQueryParams(queryParams) {
		this.pharmacyFilterForm.patchValue(queryParams);
		if (!isEmptyObject(queryParams)) {
			this.filter_pharmacy(queryParams);
			this.erxService.addUrlQueryParams(queryParams);
		}
	}
	// INITITALIZE PHARMACY FILTER FORM
	pharmacy_filterForm_init() {
		this.pharmacyFilterForm = this.fb.group({
			organization_name: [''],
			address_line1: [''],
			zip_code: [''],
			city: [''],
			pharmacy_type_id: [''],
			version: [''],
			erx_service_levels: [null],
			npi:['']
		})
	}
	// FILTERED PHARMACY
	filter_pharmacy(params?) {
		const filters = checkReactiveFormIsEmpty(this.pharmacyFilterForm);
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
			this.erxService.get_pharmacy_lists(queryParams).subscribe((pharmacyList: any) => {
				if (pharmacyList.status) {
					this.loadSpin = false;
					pharmacyList['filterValues'] = this.pharmacyFilterForm.value
					this.onFilterPharmacyList.emit(pharmacyList);
				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);
	}
	// CLEAR PHARMACY TYPE ID
	clear() {
		this.pharmacyFilterForm.controls.pharmacy_type_id.setValue('');
	}
	// RESET PHARMACY LIST ON PHARMACY LIST COMPONENT
	reset_pharmacy_list() {
		this.emptySelectedServiceArray();
		this.pharmacy_filterForm_init();
		this.pharmacyFilterForm.markAsUntouched();
		const queryParams = {
			page: 1,
			per_page: 10,
			order: OrderEnum.DEC,
			pagination: true
		}
		this.erxService.addUrlQueryParams(queryParams);
		this.get_filtered_data(queryParams);
	}
	// GET ALL PHARMACY TYPES
	pharmacyTypesLists() {
		this.loadSpin = true;
		this.subscription.push(
			this.erxService.getPharmacyTypesLists().subscribe((pharmacyTypeList: any) => {
				if (pharmacyTypeList.status) {
					this.loadSpin = false;
					this.pharmacyTypeLists = pharmacyTypeList.result.data;
				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);
	}
	// GET ALL PHARMACY SERVICES LEVELS
	pharmacyAllServicesLevelsLists() {
		this.loadSpin = true;
		this.subscription.push(
			this.erxService.getPharmacyLevelsLists().subscribe((pharmacyServiceList: any) => {
				if (pharmacyServiceList.status) {
					this.loadSpin = false;
					this.pharmacyServiceLevelsLists = pharmacyServiceList.result.data;
				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);
	}
	// SELECT SINGLE SERVICE LEVEL & STORED IN AN ARRAY
	selectServiceLevel($event) {
		this.selectedServiceLevels.push($event.id);
	}
	// REMOVED SINGLE SELECTED LEVEL FROM ARRAY
	removedServiceLevel(event) {
		let newArray;
		if (_.includes(this.selectedServiceLevels, event.value.id)) {
			newArray = _.remove(this.selectedServiceLevels, function (n) {
				return n != event.value.id;
			});
			this.emptySelectedServiceArray();
		}
		this.selectedServiceLevels.push(...newArray);
		this.pharmacyFilterForm.controls.erx_service_levels.setValue(this.selectedServiceLevels);
		// IF THE LAST INDEX IN ARRAY THEN WE SEND NULL TO CONTROL BECAUSE IT'S A LAST INDEX
		if (this.pharmacyFilterForm.controls.erx_service_levels.value.length < 1) {
			this.setErxServiceLevelControlNull();
		}
	}
	// EMPTY SELECTED PHARMACY SERVICES LEVELS ARRAY
	emptySelectedServiceArray() {
		this.selectedServiceLevels = [];
	}
	// CLEARD SERVICE LEVEL CONTROL AS NULL & EMPTY ARRAY 
	clearedServiceLevelsSelcted() {
		this.emptySelectedServiceArray();
		this.setErxServiceLevelControlNull();
	}
	// SET CONTROL OF SERVICE LEVEL AS NULL
	setErxServiceLevelControlNull() {
		this.pharmacyFilterForm.controls.erx_service_levels.setValue(null);
	}
	// SELECTED PHARMACY TYPE
	pharmacyTypeChange($event) {
		if ($event && $event.selectedIndex) {
			this.pharmacyTypeSelected = this.pharmacyTypeLists[$event.selectedIndex - 1].name;
		}
	}
	// PHARMACY RESET BUTTON DISALBED OR ENABLED
	pharmacy_reset_disabled() {
		if (isEmptyObject(this.pharmacyFilterForm.value)) {
			return true;
		}
		return false;
	}
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}
}
