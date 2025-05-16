import { removeEmptyAndNullsFormObject } from '@shared/utils/utils.helpers';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';
import { AclService } from '@appDir/shared/services/acl.service';

@Component({
	selector: 'app-clinic-filter',
	templateUrl: './clinic-filter.component.html',
	styleUrls: ['./clinic-filter.component.scss'],
})
export class ClinicFilterComponent implements OnInit {
	isCollapsed = false;
	clinicFilterForm: FormGroup;
	@Output() applyFilterValues = new EventEmitter();
	@Input() loading:boolean = false;
	userPermissions = USERPERMISSIONS;

	constructor(
		private fb: FormBuilder, 
		public aclService: AclService
	) {}

	ngOnInit() {
		this.initClinicFilter();
	}
	initClinicFilter() {
		this.clinicFilterForm = this.fb.group({
			clinic_name: [''],
			floor: [''],
			city: [''],
			state: [''],
			zip: [''],
			street_address: [''],
		});
	}
	applyFilter() {
		this.loading = true;
		this.applyFilterValues.emit(removeEmptyAndNullsFormObject(this.clinicFilterForm.value));
	}
	resetFilter() {
		this.initClinicFilter();
		this.applyFilterValues.emit({});
	}
}
