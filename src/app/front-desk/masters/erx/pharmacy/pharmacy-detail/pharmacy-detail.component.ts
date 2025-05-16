import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
	selector: 'app-pharmacy-detail',
	templateUrl: './pharmacy-detail.component.html',
	styleUrls: ['./pharmacy-detail.component.scss']
})
export class PharmacyDetailComponent implements OnInit, AfterViewInit {
	alternateNumberDropdownSettings = {
		singleSelection: true,
		idField: 'id',
		textField: 'phone_number',
		selectAllText: 'Select All',
		unSelectAllText:'UnSelect All',
		itemsShowLimit:  5,
		allowSearchFilter:true
	};
	@Input() pharmacy_detail;
	pharmacy_detailForm: FormGroup;
	phoneNumberLists: [] = [];
	constructor(private fb: FormBuilder) { }

	ngOnInit() {
		this.pharmacy_detailForm_init();
		// this.fun(true, 'id', 'phone_number', 'Select All', 'UnSelect All', 5, true);
	}
	fun(singleSelection, id, textField, selectAllText, unSelectAllText, itemsShowLimit, allowSearchFilter) {
		this.alternateNumberDropdownSettings = {
			singleSelection: singleSelection,
			idField: id,
			textField: textField,
			selectAllText: selectAllText,
			unSelectAllText: unSelectAllText,
			itemsShowLimit: itemsShowLimit,
			allowSearchFilter: allowSearchFilter,
		}
	}
	// INITIALIZING PHARMACY DETAIL FORM
	pharmacy_detailForm_init() {
		this.pharmacy_detailForm = this.fb.group({
			ncpdp_id: [''],
			store_no: [''],
			organization_name: [''],
			address_line1: [''],
			address_line2: [''],
			city: [''],
			state_province: [''],
			postal_code: [''],
			country_code: [''],
			standardized_address_line1: [''],
			standardized_address_line2: [''],
			standardized_city: [''],
			standardized_state_province: [''],
			standardized_postal: [''],
			primary_telephone: [''],
			fax: [''],
			electronic_mail: [''],
			alternate_phones: [''],
			active_start_time: [''],
			active_end_time: [''],
			erx_service_levels: [''],
			partner_account: [''],
			last_modified_date: [''],
			record_change: [''],
			old_service_level: [''],
			version: [''],
			npi: [''],
			erx_organization_types: [''], //
			replace_ncpdp_id: [''],
			state_license_number: [''],
			upin: [''],
			facility_id: [''],
			medicare_number: [''],
			medicaid_number: [''],
			payer_id: [''],
			dea_number: [''],
			hin: [''],
			mutually_defined: [''],
			direct_address: [''],
			organization_type: [''],
			organization_id: [''],
			parent_organization_id: [''],
			latitude: [''],
			longitude: [''],
			precise: [''],
			use_case: [''],
		});
	}
	ngAfterViewInit() {
		this.pharmacy_detailForm.patchValue(this.pharmacy_detail);
		this.phoneNumberLists = this.pharmacy_detailForm.controls.alternate_phones.value;
		if (this.pharmacy_detail.action == 'view') {
			this.pharmacy_detailForm.disable();
		}
	}

}
