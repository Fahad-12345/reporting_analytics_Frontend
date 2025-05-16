import { ToastrService } from 'ngx-toastr';
import { ErxService } from './../../../../../erx/erx.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { changeDateFormat, getLoginUserObject } from '@appDir/shared/utils/utils.helpers';
import { DisableButton, Proofing } from './proofing.class';
import { Router } from '@angular/router';
import { ClassUserLicenseStatus } from './userLicneseStatus.modal';
import { ModalDismissReasons, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
@Component({
	selector: 'app-proofing-information',
	templateUrl: './proofing-information.component.html',
	styleUrls: ['./proofing-information.component.scss']
})
export class ProofingInformationComponent implements OnInit {
	proofingInformationForm: FormGroup; // FORM VARIABLE
	subscription: Subscription[] = [];
	user_id;
	licenseLists: any = {};
	currentProofingDetail: any;
	erxAllowedTypes: any;
	whichButtonDisplay: any = {};
	proofingInfoStatus: Proofing = new Proofing();
	isHideButton: DisableButton = new DisableButton();
	userLicenseStatus = new ClassUserLicenseStatus();
	loadSpin = false;
	proofingDisclaimer=false;
	modalOption: NgbModalOptions = {};
	closeResult: string;
	containsDea:boolean=false;
	scrollcheck=false;
	constructor(
		private modalService: NgbModal,
		private fb: FormBuilder, private erxService: ErxService, private router: Router, private toaster: ToastrService) { }

	ngOnInit() {
		this.getUserID();
		this.initProofingInformationForm(); //INITIALIZE PROOFING INFORMATION FORM
	}
	// INIT PROOFING INFORMATION FORM
	initProofingInformationForm() {
		this.proofingInformationForm = this.fb.group({
			order_id: [''],
			license_key: [''],
			expiry_date: [''],
			user_status: [''],
			proofing_status: [''],
			result: [''],
			failReason: [''],
			noOf_tries: [''],
			status: [''],
		});
		this.get_license_data(); // GET LICENSE DETAIL
	}
	// GET USER ID
	getUserID() {
		this.user_id = getLoginUserObject().id;
	}
	// GET LISTS OF LICENSE ID PROOFING IN USER TAB  
	get_license_data() {
		const queryParams = {
			user_id: this.user_id,
			license_status: 1 // IT'S SENDING FOR GET THE ONLY ACTIVE
		}
		this.loadSpin = true;
		this.subscription.push(
			this.erxService.getProofingLicenseLists(queryParams).subscribe((licenseList: any) => {
				if (licenseList.status) {
					this.loadSpin = false;
						this.licenseLists = licenseList.result.data[0];
						if(this.licenseLists) {
						this.WhatisUserStatus();
						this.getErxAllowedTypes(); // GET ERX ALLOWED TYPES FOR THE NO. OF TRIES
					}
				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);
	}
	// CHECK WHAT IS THE USER STATUS (IF STATUS IS ACTIVE THEN DIPSLAY MANAGE ACCOUNT BUTTON)
	WhatisUserStatus() {
		if(this.licenseLists) {
			if(this.licenseLists.user_license_status.id == this.userLicenseStatus.Active_User_Status_ID) {
				this.erxService.isUserStatusActive.next(true);
			}
		}
	}
	// SET VALUES IN FORM 
	// BECAUSE OF EXPIRY DATE NOT IN EXPECTED FORMAT THAT'S WHY BELOW THIS FUNC IS BUILD
	setValuestoForm() {
		let formValue = {
			account_id: this.licenseLists ? this.licenseLists.account_id : undefined,
			expiry_date: this.licenseLists ? changeDateFormat(this.licenseLists.expiry_date) : undefined,
			id: this.licenseLists ? this.licenseLists.id : undefined,
			license_key: this.licenseLists ? this.licenseLists.license_key : undefined,
			user_status: this.licenseLists ? this.licenseLists.user_license_status.name : undefined,
			order_id: this.licenseLists ? this.licenseLists.order_id : undefined,
			// ==== GET FROM CURRENT STATUS DETAIL BELOW ====
			failReason: this.currentProofingDetail ? this.currentProofingDetail.failReason : undefined,
			result: this.currentProofingDetail ? this.currentProofingDetail.result : undefined,
			status: this.currentProofingDetail ? this.currentProofingDetail.status : undefined,
			// ==== GET FROM ALLOWED TYPES DETAIL BELOW ====
			noOf_tries: String(this.erxAllowedTypes),
		}
		this.proofingInformationForm.patchValue(formValue);
		this.proofingInformationForm.disable();
	}
	// GET CURRENT PROOFING FOR FURTHUR PROCEES LIKE (SHOW OR HIDE BUTTON)
	getCurrentProofing() {
		this.loadSpin = true;
		this.subscription.push(
			this.erxService.currentProofing().subscribe((currentProof: any) => {
				if (currentProof.status) {
					this.loadSpin = false;
					debugger;
					this.currentProofingDetail = currentProof.result.data;
					if (this.currentProofingDetail != null) {
						this.isDisplayButton(this.currentProofingDetail.status, this.currentProofingDetail.result, this.licenseLists.user_license_status.id, this.licenseLists.license_status); // CHECK WHICH BUTTON DISPLAY WHEN CURRENT OBJECT NOT EMPTY
					} else {
						this.isDisplayButton(this.proofingInfoStatus.proofingEnum.STATUS_EMPTY, this.proofingInfoStatus.proofingEnum.RESULT_EMPTY, this.licenseLists.user_license_status.id, this.licenseLists.license_status); // CHECK WHICH BUTTON DISPLAY WHEN RESPONCE EMPTY OBJECT/NULL & WILL DISPLAY START BUTTON
					}
				}
				this.setValuestoForm();
				// this.setValuestoForm({...this.licenseLists,...this.currentProofingDetail});
			},
				(error) => {
					this.loadSpin = false;
				})
		);
	}
	// GET ERX ALLOWED TYPES FOR NO OF TRIES
	getErxAllowedTypes() {
		this.loadSpin = true;
		this.subscription.push(
			this.erxService.getErxAllowedTypes().subscribe((allowedTypes: any) => {
				if (allowedTypes.status) {
					this.loadSpin = false;
					this.erxAllowedTypes = allowedTypes.result;
					this.CalculateNoOfTries(); // GET NO OF TRIES
				}
				this.getCurrentProofing(); // GET CURRENT PROOFING FOR CHECK THE CURRENT STATUS OF PROOFING
			},
				(error) => {
					this.loadSpin = false;
				})
		);
	}
	// CALCULATE NO OF TRIES
	CalculateNoOfTries() {
		if (this.erxAllowedTypes.length > 1) {
			this.erxAllowedTypes = this.erxAllowedTypes.reduce((accumulator, current) => parseInt(accumulator) + parseInt(current.isAbandonedCount), 0);
		} else if (this.erxAllowedTypes.length == 1) {
			this.erxAllowedTypes = 3 + parseInt(this.erxAllowedTypes[0].isAbandonedCount);
		} else {
			this.erxAllowedTypes = 0;
		}
	}
	// CHECK HERE WHEN & WHICH BUTTON WILL DISPLAY
	isDisplayButton(status, result, user_license_status_id, license_status) {
		this.proofingInfoStatus.status = status ? status : this.proofingInfoStatus.proofingEnum.STATUS_INITIAL;
		this.proofingInfoStatus.result = result ? result : this.proofingInfoStatus.proofingEnum.RESULT_INITIAL;
		this.proofingInfoStatus.user_license_status_id = user_license_status_id ? user_license_status_id : this.proofingInfoStatus.proofingEnum.USER_LICENSE_STATUS_ID_INITIAL;
		this.proofingInfoStatus.license_status = license_status;
		debugger;
		this.whichButtonDisplay = this.proofingInfoStatus.displayOrHideButton();
	}
	AcceptDisclaimer(){
		this.proofingDisclaimer=true;
	}
	// START PROOFING
	async OpenProofingDisclaimer(contentOpt)
	{
		this.checkDeaStatusBeforeProofing(contentOpt);
		
	}

	startProofing() {
		// IF LICENCE EXISTS THEN START PROOFING
		if (this.licenseLists) {
			let queryParams = {
				return_url: window.location.href,
				license_key: this.licenseLists.license_key
			}
			this.isHideButton.START_BUTTON = true;
			this.loadSpin = true;
			this.subscription.push(
				this.erxService.startProofing(queryParams).subscribe((startProof: any) => {
					if (startProof.status) {
						this.loadSpin = false;
						this.toaster.success(startProof.message, 'Success');
						this.isDisplayButton(this.proofingInfoStatus.proofingEnum.STATUS_START_DONE, this.proofingInfoStatus.proofingEnum.RESULT_START_DONE, this.licenseLists.user_license_status.id, this.licenseLists.license_status);
						this.openReturnUrl(startProof.result.data.redirectUrl);
						this.isHideButton.START_BUTTON = false;
					}
				},
					(error) => {
						this.loadSpin = false;
						this.isHideButton.START_BUTTON = false;
					})
			);
		} else {
			this.toaster.error('Attach User License', 'Error');
		}
	}
	// OPEN A NEW WINDOW TAB WHEN START PROOF SUCCESSFULL
	openReturnUrl(redirectURL) {
		window.open(redirectURL, "_blank");
	}
	// RESUME PROOFING
	resumeProofing() {
		this.loadSpin = true;
		this.isHideButton.RESUME_BUTTON = true;
		this.subscription.push(
			this.erxService.resumeProofing().subscribe((resume: any) => {
				if (resume.status) {
					this.loadSpin = false;
					this.toaster.success(resume.message, 'Success');
					this.openReturnUrl(resume.result.data.redirectUrl);
					this.isHideButton.RESUME_BUTTON = false;
					this.hideAllButtonExceptCancel();
				}
			},
				(error) => {
					this.loadSpin = false;
					this.isHideButton.RESUME_BUTTON = false;
				})
		);
	}
	// HIDE RESUME BUTTON & DISPLAY CANCEL BUTTON WHEN RESUME SUCCESSFULLY AT OUR SIDE
	hideAllButtonExceptCancel() {
		this.whichButtonDisplay = {
			WEB_CAM_BUTTON: false,
			RESUME_BUTTON: false,
			START_BUTTON: false,
			CANCEL_BUTTON: true
		}
	}
	// CANCEL PROOFING
	cancelProofing() {
		this.loadSpin = true;
		this.isHideButton.CANCEL_BUTTON = true;
		this.subscription.push(
			this.erxService.cancelProofing().subscribe((cancelProof: any) => {
				if (cancelProof.status) {
					this.loadSpin = false;
					this.toaster.success(cancelProof.message, 'Success');
					this.isDisplayButton(cancelProof.result.data.status, cancelProof.result.data.result, this.licenseLists.user_license_status.id, this.licenseLists.license_status);
					this.isHideButton.CANCEL_BUTTON = false;
				}
			},
				(error) => {
					this.loadSpin = false;
					this.isHideButton.CANCEL_BUTTON = false;
				})
		);
	}
	// WEB_CAM PROOFING
	webCamProofing() {
		window.open(this.proofingInfoStatus.proofingEnum.WEB_CAME_URL, "_blank");
	}

	checkDeaStatusBeforeProofing(contentOpt)
	{
		
		this.erxService.checkDeaStatus(this.user_id).subscribe(res=>{
			
			console.log('data',res)
			if(res.result.data.deaExists==true)
			{
				this.containsDea=true;
				this.modalService.open(contentOpt, {
					backdrop: 'static',
					keyboard: false,
					size: 'lg' 
				}).result.then((result) => {
					this.scrollcheck=false;
					if(result=='Save click')
					{
					
					
					}
					this.closeResult = `Closed with: ${result}`;
				  }, (reason) => {
					
				  });
				
			}
			else
			{
				this.containsDea=false;
				if(res.result.data.facilityLocationNames && res.result.data.facilityLocationNames.length>0)
				{
					let faci="";
					for(let r=1;r<=res.result.data.facilityLocationNames.length;r++)
					{
						faci=faci+('\n'+r+'. '+res.result.data.facilityLocationNames[r-1]);
						console.log('res',res.result.data.facilityLocationNames[r-1]);
						console.log('faci',faci);
					}

					this.toaster.error(`Please add Dea record against one of the following practice locations:  ${faci}`, 'Error');
				}
				if(res.result.data.stateNames && res.result.data.stateNames.length>0)
				{
					let faci="";
					for(let r=1;r<=res.result.data.stateNames.length;r++)
					{
						faci=faci+('\n'+r+'. '+res.result.data.stateNames[r-1]);
						console.log('res',res.result.data.stateNames[r-1]);
						console.log('faci',faci);
					}

					this.toaster.error(`Please add Dea record against one of the following states:  ${faci}`, 'Error');
				}
			}
			
		})
	}
	
	onModalClose(event){
		console.log('close',event);
		this.modalService.hasOpenModals()
		{
			this.modalService.dismissAll();
		}
		if(event=='approve')
		{
			this.startProofing();	
		}
	}
}
