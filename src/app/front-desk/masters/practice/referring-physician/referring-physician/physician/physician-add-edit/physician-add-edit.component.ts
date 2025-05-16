import { ReferringPhysicianService } from './../../referring-physician.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, Input, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import {
	getIdsFromArray,
	removeEmptyAndNullsFormObject,
	unSubAllPrevious,
} from '@appDir/shared/utils/utils.helpers';
import { ActionEnum } from '@appDir/front-desk/masters/reason-code/reasonCodeEnum';
import { ReactionService } from '@appDir/front-desk/masters/reactions/reaction.service';
import { ShareAbleFilter } from '@appDir/shared/models/share-able-filter';
import { EnumApiPath } from '@appDir/front-desk/billing/Models/searchedKeys-modal';
import { Validator } from '@appDir/shared/dynamic-form/models/validator.model';
import { ReferringPhysicianUrlsEnum } from '../../referringPhysicianUrlsEnum';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import _ from "lodash"
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { Physician } from './phyiscian';

@Component({
	selector: 'app-physician-add-edit',
	templateUrl: './physician-add-edit.component.html',
	styleUrls: ['./physician-add-edit.component.scss'],
})
export class PhysicianAddEditComponent implements OnInit, AfterViewInit {
	@Input() physicianDetail;
	action = ActionEnum;
	physicianDetailForm: FormGroup;
	subscription: Subscription[] = [];
	loadSpin = false;
	referalInfo:any;
	EnumApiPath = EnumApiPath;

	EnumApiPath_Referring = ReferringPhysicianUrlsEnum;
	ngSelectValues = {
		speciality: [],
		clinics: [],
	};
	@ViewChild('clinicData') clinicData;
	@ViewChild('specialityData') specialityData;
	@ViewChild('BillingTitle') BillingTitle;
	lstBillingTitle: any = [];
	constructor(
		private fb: FormBuilder,
		private reactionService: ReactionService,
		private toastrService: ToastrService,
		private modalService: NgbModal,
		private referringPhysicianService: ReferringPhysicianService,
		private customDiallogService: CustomDiallogService,
		protected requestService: RequestService,
		public cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.initPhysicianDetailForm();
	}
	// INITIALIZING PHYSICIAN DETAIL FORM
	initPhysicianDetailForm() {
		this.physicianDetailForm = this.fb.group({
			id: [''], // ID OF PHYSICIAN
			speciality_ids: [''],
			clinic_or_facility_id: [''],
			source: ['', Validators.required],
			first_name: ['', Validators.required],
			middle_name: [''],
			last_name: ['', Validators.required],
			billing_title_id: [''],
			cell_no: ['', Validators.required],
			email: ['', [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
			npi_no: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
			license_no: [''],
		});
	}
	// SAVE & CONTINUE PHYSICIAN
	saveContinue(duplicatePhysician?,isPhysician?) {

		if(this.checkFormState()){
			this.closeModal();
			return
		}

		let physicianObj = removeEmptyAndNullsFormObject(this.physicianDetailForm.value);
		if (!physicianObj['speciality_ids']) {
			physicianObj['speciality_ids'] = [];
		}
		debugger;
		if (this.physicianDetail.action == this.action.ADD) {
			this.addNewPhysician(this.physicianDetailForm.value,duplicatePhysician,isPhysician);
		} else if (this.physicianDetail.action == this.action.EDIT) {
			debugger;
			let edit_object = this.physicianDetailForm.value;
			edit_object['email'] = this.physicianDetailForm.controls['email'].value;
			edit_object['npi_no'] = this.physicianDetailForm.controls['npi_no'].value;
			edit_object['license_no'] = this.physicianDetailForm.controls['license_no'].value;
			edit_object['physician_id'] =
				this.physicianDetailForm &&
				this.physicianDetailForm.value &&
				this.physicianDetailForm.value.id
					? this.physicianDetailForm.value.id
					: null;
			this.editPhysician(edit_object,duplicatePhysician,isPhysician);
		}
	}
	// ADD NEW PHYSICIAN
	addNewPhysician(queryParams,duplicatePhysician?,isPhysician?) {
		this.loadSpin = true;
		if(isPhysician){
			queryParams['new_physician']=isPhysician;
		}
		this.subscription.push(
			this.referringPhysicianService.addNewReffringPhysician(queryParams).subscribe(
				(res: any) => {
					if (res.status) {
						this.loadSpin = false;
						this.initPhysicianDetailForm();
						this.toastrService.success(res.message, 'Success');
						this.closeModal();
						this.reactionService.isActionComplete.next(true);
					}
				},
				(error) => {
					this.loadSpin = false;
					if(error?.error?.is_duplicate){
						this.referringPhysician(duplicatePhysician)
					}
				},
			),
		);
	}
	// EDIT PHYSICIAN
	editPhysician(queryParams,duplicatePhysician?,isPhysician?) {
		this.loadSpin = true;
		if(isPhysician){
			queryParams['new_physician']=isPhysician;
		}
		const uniqueAuthors = _.uniqWith(queryParams['clinic_or_facility_id'], (arrVal, othVal) => arrVal === othVal);
		queryParams['clinic_or_facility_id'] = uniqueAuthors ? uniqueAuthors : queryParams['clinic_or_facility_id'];
		this.subscription.push(
			this.referringPhysicianService.UpdateReffering(queryParams).subscribe(
				(res: any) => {
					if (res.status) {
						this.loadSpin = false;
						this.initPhysicianDetailForm();
						this.toastrService.success(res.message, 'Success');
						this.closeModal();
						this.reactionService.isActionComplete.next(true);
					}
				},
				(error) => {
					this.loadSpin = false;
					if(error?.error?.is_duplicate){
						this.referringPhysician(duplicatePhysician)
					}
				},
			),
		);
	}

	referringPhysician(duplicatePhysician) {
		this.customDiallogService
			.confirm(
				'Duplicate Referring Physician',
				'A Referring Physician with the same information already exists. Proceed anyway?',
			)
			.then((confirmed) => {
				if(confirmed) {
					this.saveContinue(false,true)
				}
			});
	}
	ngAfterViewInit() {

		this.physicianDetailForm.patchValue(this.physicianDetail.physicianDetail);
		if (this.physicianDetail.action == this.action.VIEW) {
			this.physicianDetailForm.disable();
		}
		if (this.physicianDetail.action == this.action.EDIT) {
			this.setSpecialities_ids_toFormControl();
			this.setClinics_ids_toFormControl();
			this.getBillingTitles();
		}
	}
	// CLOSE MODAL
	closeModal() {
		this.modalService.dismissAll();
	}
	setSpecialities_ids_toFormControl() {
		debugger;
		this.ngSelectValues.speciality =
			this.physicianDetail.physicianDetail && this.physicianDetail.physicianDetail.specialities
				? this.physicianDetail.physicianDetail.specialities.map((res) => {
						debugger;
						return {
							id: res.speciality_id,
							name: res && res.speciality_name ? res.speciality_name : '',
						};
				  })
				: [];
		let specialities_ids = getIdsFromArray(this.ngSelectValues.speciality, 'id');
		this.specialityData['lists'] = this.ngSelectValues.speciality;
		this.physicianDetailForm && specialities_ids
			? this.specialityData.searchForm.patchValue({ common_ids: specialities_ids })
			: null;
		this.physicianDetailForm.controls['speciality_ids'].setValue(specialities_ids);
	}
	clinic_ids;
	setClinics_ids_toFormControl() {
		this.ngSelectValues.clinics =
			this.physicianDetail.physicianDetail && this.physicianDetail.physicianDetail.clinics
				? this.physicianDetail.physicianDetail.clinics.map((res) => {
						return { id: res.clinic_id, name: res && res.clinic.name ? res.clinic.name : '',realObj:{id:res?.clinic_id, source:'clinic'} };
				  })
				: [];
    const faclities = this.physicianDetail?.physicianDetail?.facilities?.map((res) =>({id: res?.facility?.id, name: res?.facility?.name,realObj:{id:res?.facility?.id,source:'facility'}}));

    this.ngSelectValues.clinics = [...this.ngSelectValues.clinics,...faclities];

    const sources = this.ngSelectValues.clinics?.map((x) => ({id: x?.id,source:x?.realObj?.source}));

		this.clinic_ids = getIdsFromArray(this.ngSelectValues.clinics, 'id');

		this.clinicData['lists'] = this.ngSelectValues.clinics;
		this.physicianDetailForm && this.clinic_ids
			? this.clinicData.searchForm.patchValue({ common_ids: this.clinic_ids })
			: null;
		this.physicianDetailForm.controls['clinic_or_facility_id'].setValue(this.clinic_ids);
		this.physicianDetailForm.controls['source'].setValue(sources);
		this.physicianDetail.physicianDetail['source'] = sources;
	}
	selectionOnValueChange(e: any, Type?) {
		
		const info = new ShareAbleFilter(e);
		this.physicianDetailForm.patchValue(removeEmptyAndNullsFormObject(info));
		if(Type === 'clinic_or_facility_id'){
			this.physicianDetailForm.controls['source'].setValue(this.getSourceAndIds(e?.data));
			this.physicianDetailForm.get('source').markAsTouched();
		}
		if (e.data && e.data.length == 0) {
			this.physicianDetailForm.controls[Type].setValue(null);
			if(Type === 'clinic_or_facility_id'){
				this.physicianDetailForm.controls['source'].setValue(null);
			}
		}
	}
  getSourceAndIds(sourceArr = []){

    return sourceArr?.map((x) => ({id: x?.realObj?.id,source: x?.realObj?.source}));
  }
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}

	getBillingTitles() {
		this.subscription.push(
			this.requestService
		.sendRequest(EnumApiPath.medicalIdentifierBillingTitle, 'get', REQUEST_SERVERS.fd_api_url)
		.subscribe((data) => {
			this.lstBillingTitle = data?.result?.data;
			this.setValuesNgSelectShareableBillingTitle();
		}));
	}

	setValuesNgSelectShareableBillingTitle() {
		this.BillingTitle['lists'] = this.lstBillingTitle ? this.lstBillingTitle : [];
	 	this.physicianDetailForm && this.physicianDetailForm.get('billing_title_id').value ? this.BillingTitle.searchForm.patchValue({ common_ids: this.physicianDetailForm.get('billing_title_id').value }) : null;
		this.cdr.detectChanges();
	}

	getParamForFacility(){
		return {
			add_facility: true
		  }
	}
	checkFormState():boolean{

		const prevPhysicianState = this.physicianDetail?.physicianDetail;

		return new Physician({
			first_name: prevPhysicianState?.first_name,
			middle_name : prevPhysicianState?.middle_name,
			last_name: prevPhysicianState?.last_name,
			billing_title_id: prevPhysicianState?.billing_title_id,
			speciality_ids : prevPhysicianState?.specialities?.map(x => x?.speciality_id),
			cell_no : prevPhysicianState?.cell_no,
			email : prevPhysicianState?.email,
			npi_no : prevPhysicianState?.npi_no,
			license_no :  prevPhysicianState?.license_no,
			source : prevPhysicianState?.source,
			realObject:this.physicianDetailForm.value
		}).checkEquality();
	}
}
