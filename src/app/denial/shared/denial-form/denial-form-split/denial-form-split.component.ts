import { OrderEnum } from './../../../../shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DenialBillEnum } from '@appDir/denial/denial-bill-enum';
import { DenialService } from '@appDir/denial/denial.service';
import { DenialModal, IDenial } from '@appDir/denial/Models/denail.model';
import { BillingEnum } from '@appDir/front-desk/billing/billing-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import {
	changeDateFormat,
	getExtentionOfFile,
	getIdsFromArray,
	makeDeepCopyObject,
	unSubAllPrevious,
} from '@appDir/shared/utils/utils.helpers';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { isEmptyObject, removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
import { InputDateMaskDirective } from '@appDir/shared/modules/ngx-datatable-custom/directives/input-date-mask.directive';
import { CustomFormValidators } from '@appDir/shared/customFormValidator/customFormValidator';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';

@Component({
	selector: 'app-denial-form-split',
	templateUrl: './denial-form-split.component.html',
	styleUrls: ['./denial-form-split.component.scss'], 
	//  hostDirectives: [{
	// 	directive: InputDateMaskDirective,
	// 	inputs: ['menuId'],
	//   }],
	
	
})
export class DenialFormSplitComponent implements OnInit, OnDestroy {
	denialForm: FormGroup;
	denialTypeData: any[] = [];
	denialStatusCommingData: any[] = [];
	bpDropdownSettingsEor: any = {};
	bpDropdownSettingsDenialStatus: any = {};
	fileToUpload: File = null;
	subscription: Subscription[] = [];
	typeClicked = false;
	disableDenial: boolean = false;
	denialModel: IDenial = new DenialModal();
	denialStatusAction = false;
	btnDisable = false;
	min = new Date('1900/01/01');
	@Input() currentBill: any = {};
	@Input() billId: number;
	@Input() denialMediaFile: boolean;
	getExtentionOfFile = getExtentionOfFile;
	@ViewChild('denialTypeSelection') denialTypeSelection: ElementRef;
	today = new Date();
	constructor(
		private fb: FormBuilder,
		private denialService: DenialService,
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
			itemsShowLimit: 5,
			allowSearchFilter: true,
		};

		this.bpDropdownSettingsDenialStatus = {
			singleSelection: true,
			idField: 'id',
			textField: 'name',
			selectAllText: 'Select All',
			unSelectAllText: 'UnSelect All',
			itemsShowLimit: 5,
			allowSearchFilter: true,
		};
	}

	ngOnInit() {
		this.denialForm = this.initializeSearchForm();
		this.editDenialDetail();
		this.getDenaialTypeList();
		this.resetDenialForm();
		var obj: any = {};
		obj = makeDeepCopyObject(this.currentBill);
		if (obj) {
			let fileName = this.makeFileName(obj);
			this.setFileName(fileName, this.denialForm, 'file_name');
		}
		let params = {
			order: OrderEnum.ASC,
			per_page: 50,
			page: 1,
			pagination: true,
			order_by: 'name',
		};
		this.getDenailStatus(params);
		this.changeTheFileName();
	}

	initializeSearchForm(): FormGroup {
		this.typeClicked = false;
		this.denialStatusAction = false;
		return this.fb.group({
			id: [null],
			date: [null, [
				Validators.required,
				Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
				Validators.maxLength(10),
			],],
			denial_type: [null, Validators.required],
			reason: [null],
			comments: [null],
			denial_status_id: [null],
			file_name: [null],
		},{validator:CustomFormValidators.futureDateValidator});
	}

	editDenialDetail() {
		this.subscription.push(
			this.denialService.pullDenialId().subscribe((id) => {
				if (id) {
					this.getDenialById(id);
				}
			}),
		);
	}

	getDenialById(id?: number) {
		this.denialService.getDenialById(id).subscribe((denial: any) => {
			if (denial.status) {
				this.typeClicked = false;
				this.denialStatusAction = false;
				this.fileToUpload = null;
				this.denialModel = new DenialModal(denial.result.data);
				this.denialForm.patchValue(this.denialModel);
				this.fileNameSetOnEdit(denial.result.data.bills , denial.result.data.patient);	 
				this.denialTypeSelection.nativeElement.click();
			}
		});
	}
	getDenailStatus(params) {
		this.subscription.push(
			this.denialService.getDenialStatus(params).subscribe(
				(resp: any) => {
					if (
						(resp['status'] == 200 || resp['status'] == true) &&
						this.denialService.hasDenialStatusList()
					) {
						this.denialStatusCommingData = resp.result ? resp.result.data : [];
						this.denialService.setDenialStatus(this.denialStatusCommingData);
					} else {
						this.denialStatusCommingData = resp;
					}
				},
				(error) => {
					this.toastrService.error(error.message || 'Something went wrong.', 'Error');
				},
			),
		);
	}
	getDenaialTypeList() {
		this.subscription.push(
			this.denialService.denialTypeList().subscribe((type: any) => {
				if (
					(type['status'] == 200 || type['status'] == true) &&
					this.denialService.hasDenialTypeList()
				) {
					this.denialTypeData = type.result ? type.result.data : [];
					this.denialService.setDenialType(this.denialTypeData);
				} else {
					this.denialTypeData = type;
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

	postDenial() {
		let param = this.denialForm.getRawValue();
		param['bill_id'] = this.currentBill['id'] ? this.currentBill['id'] : this.billId;
		param['date'] = param.date ? changeDateFormat(param.date) : null;
		param['denial_type_ids'] = getIdsFromArray(param['denial_type'], 'id');
		if (param && param.denial_status_id && param.denial_status_id.length!=0){
		param['denial_status_id'] = getIdsFromArray(param['denial_status_id'], 'id');
		 param['denial_status_id'] = param['denial_status_id'][0];
		}

		if (param && param.denial_type) {
			delete param.denial_type;
		}
		this.btnDisable = true;
		if (param.id) {
			this.editFormDenial(removeEmptyAndNullsFormObject(param));
		} else {
			delete param.id;
			this.newDataAddofDenial(removeEmptyAndNullsFormObject(param));
		}
	}

	editFormDenial(param: any) {
		if (this.fileToUpload) {
			let formData = new FormData();
			formData.append('file', this.fileToUpload);
			let fileName:string =this.denialForm.getRawValue()['file_name'].replace(/\.[^/.]+$/, "");
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
								this.editDenial(param);
							}else{
								this.btnDisable = false;
							}
						},
						(err) => {
							this.btnDisable = false;
							return false;
						},
					),
			);
		} else {
			this.editDenial(param);
		}
	}

	newDataAddofDenial(param) {
		if (this.fileToUpload) {
			let formData = new FormData();
			formData.append('file', this.fileToUpload);
			let fileName:string =this.denialForm.getRawValue()['file_name'].replace(/\.[^/.]+$/, "");
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
								this.addDenial(param);
							}else{
								this.btnDisable = false;
							}
						},
						(err) => {
							this.btnDisable = false;
							return false;
						},
					),
			);
		} else {
			this.addDenial(param);
		}
	}

	addDenial(param) {
		this.btnDisable = true;
		this.subscription.push(
			this.requestService
				.sendRequest(DenialBillEnum.DenialPost, 'POST', REQUEST_SERVERS.fd_api_url, param)
				.subscribe((comingData: any) => {
					if (comingData['status'] == 200 || comingData['status'] == true) {
						this.btnDisable = false;
						this.toastrService.success(comingData.message, 'Success');
						this.typeClicked = false;
						this.denialStatusAction = false;
						this.fileToUpload = null;
						this.denialTypeData = [...this.denialTypeData];
						this.denialStatusCommingData = [...this.denialStatusCommingData];
						this.denialService.pushclosedDenialPopup(true);
						this.denialService.reloadDenialAfterAdd();
						this.denialForm.reset();
						this.changeTheFileName();
					}
				},(err) => {
					this.btnDisable = false;
				}),
		);
	}

	editDenial(param) {
		this.btnDisable = true;
		this.subscription.push(
			this.requestService
				.sendRequest(DenialBillEnum.DenialEdit, 'PUT', REQUEST_SERVERS.fd_api_url, param)
				.subscribe(
					(comingData: any) => {
						if (comingData['status'] == 200 || comingData['status'] == true) {
							this.btnDisable = false;
							this.toastrService.success(comingData.message, 'Success');
							this.denialTypeData = [...this.denialTypeData];
							this.denialModel = new DenialModal();
							this.denialService.pushclosedDenialPopup(true);
							this.denialForm.reset();
							if (this.denialService.isBillId()) {
								this.denialService.reloadDenialAfterAdd();
							}
							this.typeClicked = false;
							this.denialStatusAction = false;
							this.denialTypeData = [...this.denialTypeData];
							this.denialStatusCommingData = [...this.denialStatusCommingData];
							this.fileToUpload = null;
							this.changeTheFileName();
						}
					},
					(err) => {
						this.btnDisable = false;
					},
				),
		);
	}

	resetDenialForm() {
		this.denialTypeData = [...this.denialTypeData];
		this.denialStatusCommingData = [...this.denialStatusCommingData];
		this.subscription.push(
			this.denialService.pullDenialForm().subscribe((action) => {
				if (action) {
					this.typeClicked = false;
					this.denialStatusAction = false;
					this.denialForm.reset();
					this.changeTheFileName();
					this.fileToUpload = null;
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

	resetDenial() {
		this.denialForm.reset();
		this.typeClicked = false;
		this.denialStatusAction = false;
		this.fileToUpload = null;
		this.changeTheFileName();
	}

	checkInputs() {
		const formObject =this.denialForm.value;
		delete  formObject['file_name'];
		if (isEmptyObject(formObject)) {
			return true;
		}
		return false;
	}

	setFileNameField() {
		if (this.currentBill) {
			let fileName = this.makeFileName(this.currentBill);
			this.setFileName(fileName, this.denialForm, 'file_name');
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
			this.setFileName(fileName, this.denialForm, 'file_name');
		}
	}
	changeTheFileNameThroughEdit(currentBill , patient ) {
			let fileName = this.makeFileNameInEdit(currentBill, patient);
			this.setFileName(fileName, this.denialForm, 'file_name');
	}
	viewDocFile(file: any) {
		this.denialService.viewDocFile(file);
	}

	denialStatusClick(){
		this.denialStatusAction = true;
	}

	makeFileName(data) {
	
		let name =`Denial_${data['label_id']}_${data['speciality_qualifier']}_${parseFloat(data['bill_amount']).toFixed(2)}`;
		return name + '.pdf';
	}


	makeFileNameInEdit(data:any  , patient: any) {
		debugger;		
		let name = `Denial_${data['label_id']}_${data['speciality_qualifier']}_${parseFloat(data['bill_amount']).toFixed(2)}`;
		return name + '.pdf';
	}

	fileNameSetOnEdit(currentBill: any , patient: any){
		if(!this.denialForm.value.file_name){
			this.changeTheFileNameThroughEdit(currentBill , patient)
		}
	}
}
