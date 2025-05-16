import { ReferringPhysicianService } from './../../referring-physician.service';
import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ViewChild } from '@angular/core';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { RequestService } from '@appDir/shared/services/request.service';
import { Router } from '@angular/router';
import { unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
import { AddClinicLocationComponent } from '../add-clinic-location/add-clinic-location.component';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { environment } from 'environments/environment';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';
import { AclService } from '@appDir/shared/services/acl.service';
@Component({
  selector: 'app-clinics-location-list',
  templateUrl: './clinics-location-list.component.html',
  styleUrls: ['./clinics-location-list.component.scss']
})
export class ClinicsLocationListComponent implements OnInit {
	@Input() btnhide; // used for hide buttons in add/edit form
	@Input() allLocationsOfClinic; // used for show submit button in case of Add form
	@Input() clinic_id; // used for show submit button in case of Add form
	@Output() addedSecondaryLocation = new EventEmitter();
	subscription: Subscription[] = [];
	modalRef: NgbModalRef;
	loading = false;
	environment= environment;
	userPermissions = USERPERMISSIONS;


	constructor(
		private modalService: NgbModal,
		private toastrService: ToastrService,
		protected requestService: RequestService,
		public router: Router,
		private refferingPhysicianService:ReferringPhysicianService,
		public datePipeService: DatePipeFormatService,
		public aclService: AclService
	) { 
	}

	ngOnInit() {
		this.closeClinicLocationModal();
		this.closeModalAfterSecondaryLocationAdded();
	}
	ngOnChanges(changes: SimpleChanges) {
	}
	addSecondayLocation() {
		this.modalRef = this.modalService.open(AddClinicLocationComponent, {
			backdrop: 'static',
			keyboard: false,
			size: 'lg',
			windowClass: 'modal_extraDOc'
		});
		this.modalRef.componentInstance.isSecondaryAddLocation = true;
		this.modalRef.componentInstance.clinic_id = this.clinic_id;
		this.modalRef.result.then((res) => {
			debugger;
			this.addedSecondaryLocation.emit(this.clinic_id);
			this.clinic_id;
		});
	}
	closeClinicLocationModal() {
		this.subscription.push(
		this.refferingPhysicianService.locationModalClose$.subscribe(res =>{
			if(res) {
				if(this.modalRef) {
				this.modalRef.close();
			}
		}
		}));
	}
	closeModalAfterSecondaryLocationAdded() {
		this.subscription.push(
		this.refferingPhysicianService.nowCloseSecondaryLocationModal$.subscribe(res =>{
			debugger;
			if(res) {
				debugger;
				if(this.modalRef) {
					this.modalRef.close();
				}
			}
		}));
	}
	getSingleClinicWithSingleLocation(clinic) {
		let clinicObject = {
			clinic_id: clinic.clinic_id,
			clinic_location_id:clinic.id
		};
		this.refferingPhysicianService.GetSingleClinicsWithSingleLocation(clinicObject).subscribe((res) => {
			if (res && res.status) {
				let getSingleLocationOfSingleClinic = res && res.result && res.result.data ? res.result && res.result.data[0] : {};
				this.modalRef = this.modalService.open(AddClinicLocationComponent, {
					backdrop: 'static',
					keyboard: false,
					size: 'lg',
					windowClass: 'modal_extraDOc'
				});
				this.modalRef.componentInstance.getLocationDataOnEditLocation = getSingleLocationOfSingleClinic;
				this.modalRef.componentInstance.setUpdatedLocationOnForm();
				this.modalRef.result.then((res) => {
					this.addedSecondaryLocation.emit(this.clinic_id);
				});
			}
		});
	}
	changeStatus(row,event) {
		let obj = {
			clinic_location_id: row.id,
			status:event.checked ? 1 : 0
		}
		this.loading = true;
		this.refferingPhysicianService.changeStatusClinicLocation(obj).subscribe(res =>{
			if(res.status) {
				this.toastrService.success(res.message,'Success');
				this.loading = false;
				this.addedSecondaryLocation.emit(this.clinic_id);
			}
		});
	}
	ngOnDestroy(): void {
		unSubAllPrevious(this.subscription);
	}

	clinicHistoryStats(row) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc body-scroll history-modal',
			modalDialogClass: 'modal-lg'
		};
		let modelRef = this.modalService.open(CreatedHistoryComponent,ngbModalOptions);
		modelRef.componentInstance.createdInformation = [row];
	}
}
