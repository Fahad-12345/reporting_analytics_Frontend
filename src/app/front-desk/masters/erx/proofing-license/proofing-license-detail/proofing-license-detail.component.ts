import { isEmptyObject, unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, Input, OnInit, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {  Subscription } from 'rxjs';
import { ErxService } from '../../erx.service';
import { ToastrService } from 'ngx-toastr';

@Component({
	selector: 'app-proofing-license-detail',
	templateUrl: './proofing-license-detail.component.html',
	styleUrls: ['./proofing-license-detail.component.scss']
})
export class ProofingLicenseDetailComponent implements OnInit, AfterViewInit {
	@Input() proofingLicenseDetail;
	@Output() onLicenseAttachedSuccessfully: EventEmitter<any> = new EventEmitter();
	proofingLicenseDetailForm: FormGroup;
	isReadOnlyproofingLicenseDetailFormControls = false;
	subscription: Subscription[] = [];
	loadSpin = false;
	medicalDoctorsLists: any;
	constructor(private fb: FormBuilder, private erxService: ErxService, private toastrService: ToastrService, private modalService: NgbModal) { }

	ngOnInit() {
		this.proofingLicenseDetailFormInit();

	}
	// INITIALIZING PHARMACY DETAIL FORM
	proofingLicenseDetailFormInit() {
		this.proofingLicenseDetailForm = this.fb.group({
			order_id: [''],
			license_key: [''],
			expiry_date: [''],
			id: [''], // ID OF PROOFING LICENSE 
			// user_id: ['', Validators.required], // ID OF DOCTOR SELECTED
			doc_id: ['', Validators.required], // ID OF DOCTOR SELECTED
		});
	}
	ngAfterViewInit() {
		this.proofingLicenseDetailForm.patchValue(this.proofingLicenseDetail.proofingLicenseDetail);
		if (this.proofingLicenseDetail.action == 'Assign User') {
			this.isReadOnlyproofingLicenseDetailFormControls = true;
		}
	}
	// CHECK FORM IS ENABLE OR DISABLED
	assignUserSaveButtonDisabled() {
		if (isEmptyObject(this.proofingLicenseDetailForm.value)) {
			return true;
		}
		return false;
	}
	// Assign Doctor / Attach Doctor
	saveAndContinue() {
		const queryParams = {
			"id": this.proofingLicenseDetail.proofingLicenseDetail.id,
			"user_id": this.proofingLicenseDetailForm.controls.doc_id.value
		}
		this.loadSpin = true;
		this.subscription.push(
			this.erxService.assignDoctor(queryParams).subscribe((res: any) => {
				if (res.status) {
					this.loadSpin = false;
					this.proofingLicenseDetailFormInit();
					this.toastrService.success(res.message, 'Success');
					this.onLicenseAttachedSuccessfully.emit();
					this.closeModal();
				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);
	}
	// TRIM THE STRING
	trim(el) {
		const search = el.
			replace(/(^\s*)|(\s*$)/gi, "").replace(/[ ]{2,}/gi, " ").replace(/\n +/, "\n");
		return search;
	}
	// SEARCH HERE MEDICAL DOCTORS
	searchMedicalDoctor(event: any) {
		const value: any = this.trim(event.target.value);
		if (value && value.length > 0) {
			const queryParams = {
				name: value
			}
			this.loadSpin = true;
			this.erxService.getMedicalDoctorsLists(queryParams).subscribe((eor: any) => {
				if (eor['status'] == true) {
					this.loadSpin = false;
					this.medicalDoctorsLists = eor.result.data;
				}
			},
				(error) => {
					this.loadSpin = false;
				});
		}
	}
	// DOCTORS SELECTED
	SelectDoctor(event) {
		this.proofingLicenseDetailForm.controls.doc_id.setValue(event);
	}
	medicalDoctorsListsEmtpy() {
		this.medicalDoctorsLists = [];
	}
	// CLOSE MODAL
	closeModal() {
		this.modalService.dismissAll();
	}
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}

}
