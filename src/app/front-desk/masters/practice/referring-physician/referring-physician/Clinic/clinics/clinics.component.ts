import { CustomDiallogService } from './../../../../../../../shared/services/custom-dialog.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { Page } from '@appDir/front-desk/models/page';
import {FormGroup } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ScrollToConfigOptions, ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { FirmComponent } from '@appDir/front-desk/masters/billing/attorney-master/firm/firm/add-attorney.component';
import { ReferringPhysicianService } from '../../referring-physician.service';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';
import { AclService } from '@appDir/shared/services/acl.service';

@Component({
	selector: 'app-clinics',
	templateUrl: './clinics.component.html',
	styleUrls: ['./clinics.component.scss'],
})
export class ClinicsComponent implements OnInit {
	subscription: Subscription[] = [];
	totalRows: number;
	opened = {};
	modalRef: NgbModalRef;
	currentPage: number;
	isAddNewClinicTrue = false;
	clinicPage: Page = new Page();
	allClinics;
	clinicFilterValues;
	loading;
	isEditMood;
	getEditClinicData;
	singleClinicLocations:any = [];
	@ViewChild('firm') ChildFirmFormComponent: FirmComponent;
	userPermissions = USERPERMISSIONS;
	
	constructor(
		private toastrService: ToastrService,
		private router: Router,
		protected requestService: RequestService,
		private _route: ActivatedRoute,
		private location: Location,
		private _scrollToService: ScrollToService,
		private refferingPhysicianServce: ReferringPhysicianService,
		private customDiallogService:CustomDiallogService,
		public aclService: AclService
	) {}

	ngOnInit() {
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.clinicPage.size = parseInt(params.per_page) || 10;
				this.clinicPage.pageNumber = parseInt(params.page) || 1;
				this.currentPage = this.clinicPage.pageNumber;
			}),
		);
		debugger;
		this.setClinicPagesObj();
		this.getClinics();
		this.getClinicsOnAddNewClinic();
	}
	addUrlQueryParams(params?) {
		this.location.replaceState(this.router.createUrlTree([], { queryParams: params }).toString());
	}
	icon(id): string {
		if (this.isOpenedUndefined(id)) {
			return 'plus';
		}
		return this.opened[id] ? 'minus' : 'plus';
	}

	hidden(id) {
		if (this.isOpenedUndefined(id)) {
			return true;
		}
		return !this.opened[id];
	}

	isOpenedUndefined(id): boolean {
		return this.opened[id] === undefined;
	}
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}
	ngAfterViewInit() {
	}
	setClinicPagesObj() {
		this.clinicPage.pageNumber = 1;
		this.clinicPage.size = 10;
	}
	addNewClinicOpen() {
		this.isAddNewClinicTrue = true;
		this.isEditMood = false;
		this.getEditClinicData = {};
	}
	addNewClinicClose(value) {
		debugger;
		this.isAddNewClinicTrue = value;
	}
	applyFilter(values) {
		debugger;
		this.clinicFilterValues = values;
		this.clinicPage.size = 10;
		this.clinicPage.pageNumber = 1;
		this.getClinics();
		this.opened = {};
	}

	getClinics() {
		let getClinicsObject = {
			per_page: this.clinicPage.size,
			page: this.clinicPage.pageNumber,
			pagination: 1,
			filter: this.clinicFilterValues ? true : false,
			...this.clinicFilterValues,
		};
		this.loading = true;
		this.refferingPhysicianServce.GetClinics(getClinicsObject).subscribe((result) => {
			if (result && result.status) {
				this.loading = false;
				this.allClinics = result && result.result && result.result.data ? result.result.data : [];
				this.clinicPage.totalElements = result && result.result && result.result.total ? result.result.total : null;
			}
		},err => {
			this.loading = false;
		});
	}
	getClinicWithLocation(clinic,type?) {
		let clinicObject = {
			clinic_id: clinic.id,
		};
		this.refferingPhysicianServce.GetClinicsWithLocation(clinicObject).subscribe((res) => {
			if (res && res.status) {
				debugger;
				this.isEditMood = true;
				this.isAddNewClinicTrue = true;
				this.getEditClinicData =
					res && res.result && res.result.data ? res.result && res.result.data : {};
			}
		});
	}
	getSingleClinicWithLocation(clinic) {
		let clinicObject = {
			clinic_id: clinic.id,
		};
		this.refferingPhysicianServce.GetClinicsWithLocation(clinicObject).subscribe((res) => {
			if (res && res.status) {
				debugger;
				this.singleClinicLocations =
					res && res.result && res.result.data ? res.result && res.result.data : [];
			}
		});
	}
	clinicUpdated(event) {
		debugger;
		if (event) {
			this.clinicFilterValues = {};
			this.isAddNewClinicTrue = false;
			this.isEditMood = false;
			this.getEditClinicData = {};
			this.clinicPage.size = 10;
			this.getClinics();
		}
	}
	public triggerScrollToClinic(target) {
		const config: ScrollToConfigOptions = {
			target: target,
			duration: 200,
			easing: 'easeOutElastic',
			offset: 0,
		};
		setTimeout(() => {
			this._scrollToService.scrollTo(config);
		}, 100);
	}
	toggleClinic(id, clinics,isOpen): void {
		if(Object.values(this.opened).some((res:any,index) => res == true)) {
			let open = Object.keys(this.opened)
			open.forEach((key, index) => {
				this.opened[key] = false;
			
			});
			if(isOpen == true) {
				this.opened = {};
				return;
			}
		}
		if(Object.values(this.opened).every((res:any) => res == false)) {
			debugger;
			this.opened[id] ? null : this.getSingleClinicWithLocation({id:clinics.id});
			if (this.isOpenedUndefined(id)) {
				this.opened[id] = false;
			}
			var that = this;
			that.opened[id] = !that.opened[id];
		}
	}
	isSecondayLocationAdded(clinic_id) {
		debugger;
		this.getSingleClinicWithLocation({id:clinic_id});
	}
	deleteClinic(index,clinic) {
		debugger;
		this.customDiallogService
		.confirm('Delete Clinic', 'Do you really want to delete the clinic?')
		.then((confirmed) => {
			debugger;
			if (confirmed) {
				this.loading = true;
				let deleteObj = {
					clinic_ids:[clinic.id]
				}
				this.refferingPhysicianServce.deleteClinic(deleteObj).subscribe(res =>{
					if(res && res.status) {
						this.loading = false;
						if(this.opened[index] == true) {
							this.opened = {};
						}
						this.toastrService.success(res.message,'Success');
						this.getClinics();
					}
				});
			}
		})
		.catch();
				
	}
	getClinicsOnAddNewClinic() {
		debugger;
		this.subscription.push(
		this.refferingPhysicianServce.nowGetAllClinics$.subscribe(res => {
			debugger;
			if(res) {
				debugger;
				this.getClinics();
			}
		}));
	}
	clinicPageLimit($num, $event) {
		this.clinicPage.size = Number($num);
		this.clinicPage.pageNumber = 1;
		this.getClinics();
	}
	pageChangedClinic(event) {
		debugger;
		this.clinicPage.size = event && event.itemsPerPage ? event.itemsPerPage : 10;
		this.clinicPage.pageNumber = event && event.page ? event.page : 1;
		this.opened = {};
		this.getClinics();
	}
}
