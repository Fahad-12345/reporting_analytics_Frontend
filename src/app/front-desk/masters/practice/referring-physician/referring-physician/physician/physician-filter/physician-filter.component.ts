import { ReferringPhysicianService } from './../../referring-physician.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, EventEmitter, OnInit, Output, OnDestroy } from '@angular/core';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { Subject, Subscription } from 'rxjs';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { checkReactiveFormIsEmpty, isEmptyObject, isObjectEmpty, removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
import { ReactionService } from '@appDir/front-desk/masters/reactions/reaction.service';
import { EnumApiPath } from '@appDir/front-desk/billing/Models/searchedKeys-modal';
import { ShareAbleFilter } from '@appDir/shared/models/share-able-filter';
import { ReferringPhysicianUrlsEnum } from '../../referringPhysicianUrlsEnum';
import { AclService } from '@appDir/shared/services/acl.service';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';

@Component({
  selector: 'app-physician-filter',
  templateUrl: './physician-filter.component.html',
  styleUrls: ['./physician-filter.component.scss']
})
export class PhysicianFilterComponent implements OnInit, OnDestroy {
	@Output() onFilterPhysicianList = new EventEmitter<any>();
	subscription: Subscription[] = [];
	isCollapsed = false;
	physicianDetailForm: FormGroup;
	loadSpin = false;
	eventsSubject: Subject<any> = new Subject<any>();
	EnumApiPath = EnumApiPath;
	EnumApiPath_Referring = ReferringPhysicianUrlsEnum;
	userPermissions = USERPERMISSIONS;

	constructor(
		private fb: FormBuilder, 
		private reactionService: ReactionService, 
		private _route: ActivatedRoute,
		private referrringPhysicianService:ReferringPhysicianService,
		public aclService: AclService
	) {
	}

	ngOnInit() {
		this.getQueryParams();
	}
	getQueryParams() {
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.physicianFilterFormInit(); // INIT FORM
				this.setQueryParams(params);
			}),
		);
	}
	setQueryParams(queryParams) {
		this.physicianDetailForm.patchValue(queryParams);
		if (!isEmptyObject(queryParams)) {
			this.filterPhysician(queryParams);
			this.reactionService.addUrlQueryParams(queryParams);
		}
	}
	// INITITALIZE PHYSICIAN FILTER FORM
	physicianFilterFormInit() {
		this.physicianDetailForm = this.fb.group({
			name: [''],
			npi_no: [''],
			concept_type: [''],
			license_no: [''],
			speciality_ids:[''],
			clinic_ids:['']
		})
	}

	// FILTERED PHYSICIAN
	filterPhysician(params?) {
		const filters = checkReactiveFormIsEmpty(this.physicianDetailForm);
		const queryParams = {
			filter: !isObjectEmpty(filters),
			page: params.page ? params.page : 1,
			per_page: params.per_page ? params.per_page : 10,
			order: OrderEnum.DEC,
			pagination: true
		}
		this.reactionService.addUrlQueryParams({ ...queryParams, ...filters });
		this.get_filtered_data({ ...queryParams, ...filters });
	}
	
	// GET FILTERED DATA
	get_filtered_data(queryParams) {
		this.loadSpin = true;
		this.subscription.push(
			this.referrringPhysicianService.getPhysicianLists(queryParams).subscribe((PhysicianList: any) => {
				if (PhysicianList.status) {
					this.loadSpin = false;
					PhysicianList['filterValues'] = this.physicianDetailForm.value
					this.onFilterPhysicianList.emit(PhysicianList);
				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);
	}
	// RESET PHYSICIAN LIST ON PHYSICIAN LIST COMPONENT
	resetPhysicianList() {
		this.physicianFilterFormInit();
		this.eventsSubject.next(true);
		this.physicianDetailForm.markAsUntouched();
		const queryParams = {
			page: 1,
			per_page: 10,
			order: OrderEnum.DEC,
			pagination: true
		}
		this.reactionService.addUrlQueryParams(queryParams);
		this.get_filtered_data(queryParams);
	}
	// PHYSICIAN RESET BUTTON DISALBED OR ENABLED
	physicianFilterResetDisabledCheck() {
		if (isEmptyObject(this.physicianDetailForm.value)) {
			return true;
		}
		return false;
	}
	selectionOnValueChange(e: any,Type?) {
		const info = new ShareAbleFilter(e);
		this.physicianDetailForm.patchValue(removeEmptyAndNullsFormObject(info));
		if(e.data && e.data.length == 0) {
			this.physicianDetailForm.controls[Type].setValue(null);
		}
	}
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}
}

