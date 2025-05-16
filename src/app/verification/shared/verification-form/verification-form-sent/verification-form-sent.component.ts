import { HttpEventType } from '@angular/common/http';
import {
	Component,
	OnInit,
	ViewChild,
	EventEmitter,
	Output,
	Input,
	OnChanges,
	SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BillingEnum } from '@appDir/front-desk/billing/billing-enum';
import { changeDateFormat } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import {
	getExtentionOfFile,
	isEmptyObject,
	makeDeepCopyObject,
	removeEmptyKeysFromObject,
} from '@appDir/shared/utils/utils.helpers';
import { VerificationSentEditModel } from '@appDir/verification/Models/verification-sent-edit-model';
import { VerificationSentModel } from '@appDir/verification/Models/verification-sent-model';
import { VerificationBillEnum } from '@appDir/verification/verification-bill-enum';
import { VerificationService } from '@appDir/verification/verification.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { CustomFormValidators } from '@appDir/shared/customFormValidator/customFormValidator';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';

@Component({
	selector: 'app-verification-form-sent',
	templateUrl: './verification-form-sent.component.html',
	styleUrls: ['./verification-form-sent.component.scss'],
})
export class VerificationFormSentComponent implements OnInit, OnChanges {
	verificationSentForm: FormGroup;
	fileToUpload: File = null;
	subscription: Subscription[] = [];
	@ViewChild('verificationSentModel') public verificationSentModel: ModalDirective;
	@Output() saveVerificationEmitter = new EventEmitter();
	@Output() editVerificationEmitter = new EventEmitter();
	getExtentionOfFile = getExtentionOfFile;
	@Input() verificationEditDetail: any;
	@Input() currentBill: any;
	@Input() selected_bills: any;
	@Input() currentVerificationRecived;
	file_Name: string;
	previous_file_name: string;
	disabledFormBtn =false;
	verificatioEditModel = new VerificationSentEditModel();
	UploadProgress:number=0;
	today = new Date();
	minDate = new Date('1900/01/01');
	constructor(
		private fb: FormBuilder,
		public verficationService: VerificationService,
		public requestService: RequestService,
		private toastrService: ToastrService,
		private dateformateService : DatePipeFormatService
	) {}
	ngOnChanges(changes: SimpleChanges): void {
		this.verificationSentForm = this.initializeSearchForm();
		let fileNames: any = [];
		if(this.selected_bills && this.selected_bills.length) {
			for(let i=0; i<this.selected_bills.length; i++) {
				let obj = {};
				obj = makeDeepCopyObject(this.selected_bills[i]);
				if (obj) {
					let fileName = {};
					fileName = this.makeFileName(obj);
					fileNames.push(fileName);
				}
			}
		}
		else if(this.selected_bills && !this.selected_bills.length) {
			let obj = {};
			obj = makeDeepCopyObject(this.currentBill);
			if(obj) {
				let fileName = {};
				fileName = this.makeFileName(obj);
				fileNames.push(fileName);
			}
		}
		this.setFileName(fileNames, this.verificationSentForm, 'file_name');
		this.getSingleInfoVerificationSent();
	}

	ngOnInit() {
		this.verificationSentForm = this.initializeSearchForm();
	}
	initializeSearchForm(): FormGroup {
		return this.fb.group({
			id: [null],
			date: [null, [
				Validators.required,
				Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
				Validators.maxLength(10),
			],],
			description: [null,Validators.required],
			verification_received_id: [null],
			file_name: [null],
		},{validator:CustomFormValidators.futureDateValidator});
	}

	saveVerificationSent(data) {
		this.disabledFormBtn = true;
		if (this.verificationSentForm.value.id) {
			this.verificationUpdate(this.verificationSentForm.value);
		} else {
			let verificationParam = new VerificationSentModel(this.verificationSentForm.value);
			verificationParam['type'] = data
			verificationParam.setVerificationReceivedId(
				this.verficationService.getVerificationReceivedId(),
			);
			if (this.fileToUpload) {
				this.disabledFormBtn= false;
				let formData = new FormData();
				formData.append('file', this.fileToUpload);
				for(let i=0; i<this.file_Name.length; i++) {
					let fileName = this.file_Name[i].replace(/\.[^/.]+$/, "");
					formData.append('file_name[]', fileName);
				}
				this.subscription.push(
					this.requestService
						.sendRequest(
							BillingEnum.uploadMediaPaymentVerification,
							'post_file',
							REQUEST_SERVERS.fd_api_url,
							formData,
						)
						.subscribe(
							(res: any) => {
								if (res.type === HttpEventType.UploadProgress) {
									this.UploadProgress = Math.round((res.loaded / res.total) * 100);
									console.log(this.UploadProgress);
								  } else if (res.type === HttpEventType.Response) {
									this.UploadProgress = 0;
								if (res['body']['status'] == 200 || res['body']['status'] == true) {
									let ids = res['body'].data && res['body'].data.map(x => x.id)
									verificationParam.setMediaId(ids);
									this.AddVerification(verificationParam);
								}
							}
							},
							(err) => {
								this.UploadProgress = 0;
								this.disabledFormBtn= false;
								return false;
							},
						),
				);
			} else {
				this.AddVerification(verificationParam);
			}
		}
	}

	open() {
		this.verificationSentModel.show();
	}

	closePopup() {
		this.verificationSentModel.hide();
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

	AddVerification(verificationParam: VerificationSentModel) {
		delete verificationParam['id'];
		delete verificationParam['file_name'];
		this.saveVerificationEmitter.emit(verificationParam);
		setTimeout(() => {
			this.disabledFormBtn = false;
			this.verficationService.pushVerificationViewFilterListReload(true);
		},1500);
	}

	checkInputs() {
		if (isEmptyObject(this.verificationSentForm.value)) {
			return true;
		}
		return false;
	}

	verificationUpdate(verificationUpdateData: any) {
		if (this.fileToUpload) {
			let formData = new FormData();
			formData.append('file', this.fileToUpload);
			let fileName = this.verificationSentForm.getRawValue()['file_name'].replace(/\.[^/.]+$/, "");
			formData.append('file_name[]',fileName);
			this.subscription.push(
				this.requestService
					.sendRequest(
						BillingEnum.uploadMediaPaymentVerification,
						'POST',
						REQUEST_SERVERS.fd_api_url,
						formData,
					)
					.subscribe(
						(comingData: any) => {
							if (comingData['status'] == 200 || comingData['status'] == true) {
								// verificationParam.setMediaId(comingData.data.id);
								verificationUpdateData['media_id'] = comingData.data.id;
								this.verificationUpdateApi(verificationUpdateData);
							}
						},
						(err) => {
							this.disabledFormBtn = false;
							return false;
						},
					),
			);
		} else {
			this.verificationUpdateApi(verificationUpdateData);
		}
	}

	verificationUpdateApi(formValue: any) {
		formValue['date'] = changeDateFormat(formValue['date']);
		this.subscription.push(
			this.requestService
				.sendRequest(
					VerificationBillEnum.Verification_Sent_EDIT,
					'PUT',
					REQUEST_SERVERS.fd_api_url,
					removeEmptyKeysFromObject(formValue),
				)
				.subscribe((comingData: any) => {
					if (comingData['status'] == 200 || comingData['status'] == true) {
						this.toastrService.success(comingData.message, 'Success');
						this.editVerificationEmitter.emit(true);
						this.disabledFormBtn = false;
						this.verificationSentForm.reset();
						this.fileToUpload = null;
					}
				}, err => {
					this.disabledFormBtn = false;
				}),
		);
	}

	editForm() {
		this.verificationSentForm.patchValue({
			id: this.verificationEditDetail.id,
			date: this.verificationEditDetail.date,
			description: this.verificationEditDetail.description,
			verification_received_id: this.verificationEditDetail.verification_received_id,
		});
	}

	setFileName(name, form, control) {
		if (form) {
			form.get(control).setValue(name);
			this.file_Name = name;
			this.previous_file_name = name;
		}
	}

	makeFileName(data) {

		let name =`Ver_Sent_${data['label_id']}_${data['speciality_qualifier']}`;
		if (data['amount']) {
			name = `${name}_${parseFloat(data['amount']).toFixed(2)}`;

		}else{
			name = `${name}_${parseFloat(data['bill_amount']).toFixed(2)}`;

		}
		return name + '.pdf';
	}

	getSingleInfoVerificationSent() {
		if (this.verificationEditDetail) {
			this.file_Name = '';
			this.subscription.push(
				this.verficationService
					.getSingleInfoVerification(this.verificationEditDetail.id)
					.subscribe((info) => {
						this.verificationSentForm
						.get('date')
						.setValidators([
							Validators.compose([Validators.required,
								Validators.maxLength(10)]),
						]);
						this.verificatioEditModel = new VerificationSentEditModel(info['result']['data']);
						this.verificationSentForm.patchValue(this.verificatioEditModel);
						this.fileNameSetOnEdit(info['result']['data']['verification']['bills'], info['result']['data']['patient']);
					}),
			);
		}
	}

	fileNameSetOnEdit(currentBill: any, patient: any) {
		if (!this.verificationSentForm.value.file_name) {
			this.changeTheFileNameThroughEdit(currentBill, patient);
		}
	}

	changeTheFileNameThroughEdit(currentBill, patient) {
		let fileName = this.makeFileNameInEdit(currentBill, patient);
		this.setFileName(fileName, this.verificationSentForm, 'file_name');
		this.file_Name = fileName;
		this.previous_file_name = fileName;
	}

	makeFileNameInEdit(data:any  , patient: any) {
	
		let name = `Ver_Sent_${data['label_id']}_${data['speciality_qualifier']}_${
			parseFloat(data['bill_amount']).toFixed(2)}`;
		return name + '.pdf';
	}

	resetForm() {
		this.verificationSentForm.reset();
		this.fileToUpload = null;
		this.checkInputs();
		let obj = makeDeepCopyObject(this.currentBill);
		if (obj) {
			let fileName = this.makeFileName(obj);
			this.setFileName(fileName, this.verificationSentForm, 'file_name');
		}
	}

	viewDocFile(files: any){
		this.verficationService.viewDocFile(files);
	   }
}
