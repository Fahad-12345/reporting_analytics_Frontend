import { OrderEnum } from './../../../../shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BillingEnum } from '@appDir/front-desk/billing/billing-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import {
	changeDateFormat,
	getExtentionOfFile,
	getIdsFromArray,
	makeDeepCopyObject,
	removeEmptyKeysFromObject,
	unSubAllPrevious,
} from '@appDir/shared/utils/utils.helpers';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { isEmptyObject, removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
import { VerificationService } from '@appDir/verification/verification.service';
import { VerificationBillEnum } from '@appDir/verification/verification-bill-enum';
import { IVerificationEdit, VerificationEditModel } from '@appDir/verification/Models/verification-edit-model';
import { CustomFormValidators } from '@appDir/shared/customFormValidator/customFormValidator';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';

@Component({
	selector: 'app-verification-form-split',
	templateUrl: './verification-form-split.component.html',
	styleUrls: ['./verification-form-split.component.scss'],
})
export class VerificationFormSplitComponent implements OnInit, OnDestroy {
	verificationForm: FormGroup;
	verificationTypeData: any[] = [];
	verificationStatusCommingData: any[] = [];
	bpDropdownSettingsEor: any = {};
	bpDropdownSettingsDenialStatus: any = {};
	fileToUpload: File = null;
	subscription: Subscription[] = [];
	typeClicked = false;
	disableDenial = false;
	verificationStatusCheck= false;
	disabledFormBtn = false;
	@Input() currentBill: any = {};
	@Input() billId: number;
	getExtentionOfFile = getExtentionOfFile;
	@ViewChild('denialTypeSelection') denialTypeSelection: ElementRef;
	Verification_Edit_Model: IVerificationEdit = new VerificationEditModel();
	@Output('verificationRecivedEdit') verificationRecivedEdit = new EventEmitter();
	@Input() verificationMediaFile: boolean;
	today = new Date();
	min: Date= new Date('1900/01/01');
	constructor(
		private fb: FormBuilder,
		private verificationService: VerificationService,
		private toastrService: ToastrService,
		private requestService: RequestService,
		private dateformateService : DatePipeFormatService
	) {
		this.bpDropdownSettingsEor = {
			singleSelection: false,
			idField: 'id',
			textField: 'name',
			selectAllText: 'Select All',
			unSelectAllText: 'UnSelect All',
			itemsShowLimit: 6,
			allowSearchFilter: true,
		};

		this.bpDropdownSettingsDenialStatus = {
			singleSelection: true,
			idField: 'id',
			textField: 'name',
			selectAllText: 'Select All',
			unSelectAllText: 'UnSelect All',
			itemsShowLimit: 6,
			allowSearchFilter: true,
		};
	}
	ngOnInit() {
		this.verificationForm = this.initializeSearchForm();
		this.editVerificationDetail();
		this.getVerificationTypeList();
		this.resetDenialForm();
		var obj: any = {};
		obj = makeDeepCopyObject(this.currentBill);
		if (obj) {
			let fileName = this.makeFileName(obj);
			this.setFileName(fileName, this.verificationForm, 'file_name');
		}
		let params = {
			order: OrderEnum.ASC,
			per_page: 50,
			page: 1,
			pagination: true,
			order_by: 'name',
		};
		this.getVerificationStatus(params);
		this.changeTheFileName();
	}

	initializeSearchForm(): FormGroup {
		this.typeClicked = false;
		this.verificationStatusCheck = false;
		return this.fb.group({
			id: [null],
			date: [null,[
				Validators.required,
				Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
				Validators.maxLength(10)
			],],
			verification_type_ids: [null, Validators.required],
			description: [null],
			verification_status_id: [null],
			file_name: [null],
		},{validator:CustomFormValidators.futureDateValidator});
	}

	editVerificationDetail() {
		this.subscription.push(
			this.verificationService.pullVerificationId().subscribe((id) => {
				if (id) {
					this.fileToUpload = null;
					this.getVerificationById(id);
				}
			}),
		);
	}

	getVerificationById(id?: number) {
		this.verificationService.getVerificationById(id).subscribe((verification: any) => {
			if (verification.status) {
				this.typeClicked = false;
				this.verificationStatusCheck = false;
				this.Verification_Edit_Model = new VerificationEditModel(verification.result.data);
				this.verificationForm.patchValue(this.Verification_Edit_Model);
				this.fileNameSetOnEdit(verification.result.data.bills , verification.result.data.patient);	 
				this.denialTypeSelection.nativeElement.click();
			}
		});
	}

	getVerificationStatus(params) {
		this.subscription.push(
			this.verificationService.getVerificationStatus(params).subscribe(
				(resp: any) => {
					if (
						(resp['status'] == 200 || resp['status'] == true) &&
						this.verificationService.hasVerificationStatusList()
					) {
						this.verificationStatusCommingData = resp.result ? resp.result.data : [];
						this.verificationService.setVerificationStatus(this.verificationStatusCommingData);
					} else {
						this.verificationStatusCommingData = resp;
					}
				},
				(error) => {
					this.toastrService.error(error.message || 'Something went wrong.', 'Error');
				},
			),
		);
	}
	getVerificationTypeList() {
		this.subscription.push(
			this.verificationService.verificationTypeList().subscribe((type: any) => {
				if (
					(type['status'] == 200 || type['status'] == true) &&
					this.verificationService.hasVerificationTypeList()
				) {
					this.verificationTypeData = type.result ? type.result.data : [];
					this.verificationService.setVerificationType(this.verificationTypeData);
				} else {
					this.verificationTypeData = type;
				}
			}),
		);
	}

	handleFileInput(files: FileList) {
		if (files.length > 0) {
			if (this.getExtentionOfFile(files.item(0).name) == '.pdf') {
				this.fileToUpload = files.item(0);
			} else {
				this.toastrService.error('Please select  pdf file');
			}
		}
	}

	postVerification() {
		this.disabledFormBtn = true;
		let param = this.verificationForm.getRawValue();
		param['bill_id'] = this.currentBill['id'] ? this.currentBill['id'] : this.billId;
		param['date'] = param.date ? changeDateFormat(param.date) : null;
		param['verification_type_ids'] = getIdsFromArray(param['verification_type_ids'], 'id');
		if (param && param.verification_status_id && param.verification_status_id.length!=0){
			param['verification_status_id'] = getIdsFromArray(param['verification_status_id'], 'id');
			param['verification_status_id'] = param['verification_status_id'][0];
			}

		if (param && param.denial_type) {
			delete param.denial_type;
		}
		if (param.id) {
			this.editFormVerification(removeEmptyAndNullsFormObject(param));
		} else {
			delete param.id;
			this.newDataAddofVerification(removeEmptyAndNullsFormObject(param));
		}
	}

	editFormVerification(param: any) {
		debugger;
		if (this.fileToUpload) {
			let formData = new FormData();
			formData.append('file', this.fileToUpload);
			let fileName:string =
			this.verificationForm.getRawValue()['file_name'].replace(/\.[^/.]+$/, "");
			formData.append('file_name',fileName);
			this.subscription.push(
				this.requestService
					.sendRequest(
						BillingEnum.uploadMediaPayment,
						'POST',
						REQUEST_SERVERS.fd_api_url,
						formData,
					)
					.subscribe(
						(comingData: any) => {
							if (comingData['status'] == 200 || comingData['status'] == true) {
								param['media_id'] = comingData.data.id;
								this.editVerification(param);
							}
						},
						(err) => {
							this.disabledFormBtn = false;
							return false;
						},
					),
			);
		} else {
			this.editVerification(param);
		}
	}

	newDataAddofVerification(param) {
		if (this.fileToUpload) {
			let formData = new FormData();
			formData.append('file', this.fileToUpload);
			let fileName:string =this.verificationForm.getRawValue()['file_name'].replace(/\.[^/.]+$/, "");
			formData.append('file_name',fileName);
			this.subscription.push(
				this.requestService
					.sendRequest(
						BillingEnum.uploadMediaPayment,
						'POST',
						REQUEST_SERVERS.fd_api_url,
						formData,
					)
					.subscribe(
						(comingData: any) => {
							if (comingData['status'] == 200 || comingData['status'] == true) {
								param['media_id'] = comingData.data.id;
								this.addVerification(param);
							}
						},
						(err) => {
							this.disabledFormBtn = false;
							return false;
						},
					),
			);
		} else {
			this.addVerification(param);
		}
	}

	addVerification(param) {
		this.subscription.push(
			this.requestService
				.sendRequest(VerificationBillEnum.VerificationPost, 'POST', REQUEST_SERVERS.fd_api_url, param)
				.subscribe((comingData: any) => {
					this.disabledFormBtn = false;
					if (comingData['status'] == 200 || comingData['status'] == true) {
						this.verificationForm.reset();
						this.toastrService.success(comingData.message, 'Success');
						this.typeClicked = false;
						this.verificationStatusCheck = false;
						this.fileToUpload = null;
						this.verificationTypeData = [...this.verificationTypeData];
						this.verificationStatusCommingData = [...this.verificationStatusCommingData];
						this.verificationService.pushclosedVerificationPopup(true);
						this.verificationService.reloadVerificationAfterAdd();
						this.changeTheFileName();
					}
				}, (error) => {
					this.disabledFormBtn = false;
				}),
		);
	}

	editVerification(param) {
		this.subscription.push(
			this.requestService
				.sendRequest(VerificationBillEnum.Verification_Received_Edit, 'PUT', REQUEST_SERVERS.fd_api_url, removeEmptyKeysFromObject(param))
				.subscribe(
					(comingData: any) => {
						this.disabledFormBtn = false;
						if (comingData['status'] == 200 || comingData['status'] == true) {
							this.toastrService.success(comingData.message, 'Success');
							this.Verification_Edit_Model = new VerificationEditModel();
							this.verificationTypeData = [...this.verificationTypeData];
							this.verificationRecivedEdit.emit(true);
							this.verificationService.pushclosedVerificationPopup(true);
							this.verificationForm.reset();
							if (this.verificationService.isBillId()) {
								this.verificationService.reloadVerificationAfterAdd();
							}
							this.typeClicked = false;
							this.verificationStatusCheck = false;
							this.verificationTypeData = [...this.verificationTypeData];
							this.verificationStatusCommingData = [...this.verificationStatusCommingData];
							this.fileToUpload = null;
							this.changeTheFileName();
						}
					},
					(err) => {
						this.disabledFormBtn = false;
					},
				),
		);
	}

	resetDenialForm() {
		this.verificationTypeData = [...this.verificationTypeData];
		this.verificationStatusCommingData = [...this.verificationStatusCommingData];
		this.subscription.push(
			this.verificationService.pullVerificationForm().subscribe((action) => {
				if (action) {
					this.typeClicked = false;
					this.verificationStatusCheck = false;
					this.verificationStatusCheck = false;
					this.verificationForm.reset();
					this.changeTheFileName();
				}
			}),
		);
	}

	typeClick() {
		this.typeClicked = true;
	}

	ngOnDestroy(): void {
		unSubAllPrevious(this.subscription);
	}

	reset() {
		this.verificationForm.reset();
		this.typeClicked = false;
		this.verificationStatusCheck = false;
		this.fileToUpload = null;
		this.changeTheFileName();
	}

	checkInputs() {
		const formObject =this.verificationForm.value;
		delete  formObject['file_name'];
		if (isEmptyObject(formObject)) {
			return true;
		}
		return false;
	}

	setFileNameField() {
		if (this.currentBill) {
			let fileName = this.makeFileName(this.currentBill);
			this.setFileName(fileName, this.verificationForm, 'file_name');
		}
	}

	setFileName(name, form, control) {
		if (form) {
			form.get(control).setValue(name);
		}
	}

	changeTheFileName() {
		var obj: any = {};
		obj = makeDeepCopyObject(this.currentBill);
		if (obj) {
			let fileName = this.makeFileName(obj);
			this.setFileName(fileName, this.verificationForm, 'file_name');
		}
	}

	makeFileName(data) {

		let name = `Ver_${data['label_id']}_${data['speciality_qualifier']}_${parseFloat(data['bill_amount']).toFixed(2)}`;
		return name + '.pdf';
	}

	changeTheFileNameThroughEdit(currentBill , patient ) {
		let fileName = this.makeFileNameInEdit(currentBill, patient);
		this.setFileName(fileName, this.verificationForm, 'file_name');
	}

	makeFileNameInEdit(data:any  , patient: any) {
		let name = `Ver_${data['label_id']}_${data['speciality_qualifier']}_${parseFloat(data['bill_amount']).toFixed(2)}`;
		return name + '.pdf';
	}

	
	fileNameSetOnEdit(currentBill: any , patient: any){
		if(!this.verificationForm.value.file_name){
			this.changeTheFileNameThroughEdit(currentBill , patient)
		}
	}

	verificationStatus() {
		this.verificationStatusCheck = true;
	}

	viewDocFile(file: any) {
		this.verificationService.viewDocFile(file);
	}

}
