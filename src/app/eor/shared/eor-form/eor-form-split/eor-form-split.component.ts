import {
	Component,
	ElementRef,
	Input,
	OnInit,
	ViewChild,
	EventEmitter,
	Output,
	OnDestroy,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { EorBillUrlsEnum } from '@appDir/eor/eor-bill.url.enum';
import { EORMODEL, IEOR } from '@appDir/eor/Models/eor.model';
import { BillingEnum } from '@appDir/front-desk/billing/billing-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import {
	changeDateFormat,
	getExtentionOfFile,
	getIdsFromArray,
	makeDeepCopyObject,
	minValidation,
	moneyMasking,
	removeEmptyKeysFromObject,
	unSubAllPrevious,
} from '@appDir/shared/utils/utils.helpers';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { EORService } from '../../eor.service';
import { isEmptyObject } from '@appDir/shared/utils/utils.helpers';
import { FileNameSetInEdit } from '@appDir/eor/Models/file-name-set-in-edit';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { CustomFormValidators } from '@appDir/shared/customFormValidator/customFormValidator';

@Component({
	selector: 'app-eor-form-split',
	templateUrl: './eor-form-split.component.html',
	styleUrls: ['./eor-form-split.component.scss'],
})
export class EorFormSplitComponent implements OnInit , OnDestroy {
	@Input() currentBill: any = {};
	@Input() resetTitle: string = 'Clear';
	@Output() formSubmited = new EventEmitter();
	@Input() eorMediaFile: boolean;
	@ViewChild('eorTypeSelection') eorTypeSelection: ElementRef;
	eorForm: FormGroup;
	bpDropdownSettingsEor: any = {};
	bpDropdownSettingsEorStatus:any = {};
	eorStatusCommingData:any[] = [];
	disableEor: boolean = false;
	minValidation = minValidation;
	moneyMasking = moneyMasking;
	getExtentionOfFile = getExtentionOfFile;
	eorTypeData: any[] = [];
	subscription: Subscription[] = [];
	page_size_master: number = 50;
	fileToUpload: File = null;
	typeClicked = false;
	eorStatusAction = false;
	eorModel: IEOR = new EORMODEL();
	min = new Date('1900/01/01');
	fileNameSetInEditObject = new FileNameSetInEdit();
	fileNameSaveForEdit: string;
	today = new Date();
	params = {
		order: OrderEnum.ASC,
		per_page: this.page_size_master,
		page: 1,
		pagination: true,
		order_by: 'name',
	};
	customCurrencyMaskConfig = {
		align: 'left',
		allowNegative: false,
		allowZero: true,
		decimal: '.',
		precision: 2,
		prefix: '',
		suffix: '',
		thousands: ',',
		nullable: true,
	};
	constructor(
		private fb: FormBuilder,
		public eorService: EORService,
		private requestService: RequestService,
		private toastrService: ToastrService,
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

		this.bpDropdownSettingsEorStatus = {
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
		this.eorForm = this.initializeSearchForm();
		this.eorIdThroughSubject();
		this.resetTheEorFormAfterDeleteAction();
		let params = {
			order: OrderEnum.ASC,
			per_page: this.page_size_master,
			page: 1,
			pagination: true,
			order_by: 'name',
		};
	
		this.eorAmountSubscription();
		this.changeFileName();
		this.eorTypeList(params);
		this.getEorStatus(params);
	
		
	}

	ngOnChanges(): void {
		//Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
		//Add '${implements OnChanges}' to the class.
		 
		
	}
	initializeSearchForm(): FormGroup {
		this.typeClicked = false;
		this.eorStatusAction = false;
		return this.fb.group({
			id: [null],
			date: [null, [
				Validators.required,
				Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
				Validators.maxLength(10),
			],],
			amount: [null, Validators.compose([Validators.required, this.max(999999.99),this.minValidation(0)])],
			eor_type_id: [null, Validators.required],
			description: [''],
			file_name: [null],
			eor_status_id: [null],
		},{validator:CustomFormValidators.futureDateValidator});
	}

	max(maxValue): ValidatorFn {
		return (control: AbstractControl): { [key: string]: boolean } | null => {
			if (control.value) {
				return control.value && parseFloat(moneyMasking(control.value)) <= maxValue
					? null
					: {
							max: true,
					  };
			} else {
				return null;
			}
		};
	}

	eorTypeList(queryParams: any): void {
		this.eorService.eorTypeList(queryParams).subscribe(
			(comingData: any) => {
				if (
					(comingData['status'] == 200 || comingData['status'] == true) &&
					this.eorService.hasEorTypeList()
				) {
					this.eorTypeData = comingData.result ? comingData.result.data : [];
					this.eorService.setEorType(this.eorTypeData);
				} else {
					this.eorTypeData = comingData;
				}
			},
			(err) => {
				// const str = parseHttpErrorResponseObject(err.error.message);
				// this.toastrService.error(str);
			},
		);
	}

	handleFileInput(files: FileList) {
		debugger;
		if (files.length > 0) {
			debugger;
			if (this.getExtentionOfFile(files.item(0).name) == '.pdf') {
				this.fileToUpload = files.item(0);
			} else {
				this.toastrService.error('Please select  pdf file');
			}
		}
		// this.fileToUpload = files.item(0);
	}

	postEor() {
		let param = this.eorForm.value;
		param['bill_id'] = this.currentBill['id'];
		param['date'] = param.date ? changeDateFormat(param.date) : null;
		param['eor_type_ids'] = getIdsFromArray(param['eor_type_id'], 'id');
		if (param && param.eor_status_id && param.eor_status_id.length!=0){
		param['eor_status_id'] = getIdsFromArray(param['eor_status_id'], 'id');
		param['eor_status_id'] = param['eor_status_id'][0];
		}
		debugger;
		if (param && param.eor_type_id) {
			delete param.eor_type_id;
		}
		if (param.id) {
			this.editFormEor(param);
		} else {
			delete param.id;
			this.addFormEor(param);
		}
	}

	addFormEor(param) {
		if (this.fileToUpload) {
			let formData = new FormData();
			formData.append('file', this.fileToUpload);
			let fileName:string =this.eorForm.getRawValue()['file_name'].replace(/\.[^/.]+$/, "");
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
								this.typeClicked = false;
								this.eorStatusAction = false;
								// this.eorTypeData = comingData.result ? comingData.result.data : [];
								param['media_id'] = comingData.data.id;
								this.fileToUpload = null;
								this.addEor(param);
								this.formSubmited.emit(true);
								this.eorTypeSelection.nativeElement.click();
							}
						},
						(err) => {
							return false;
						},
					),
			);
		} else {
			this.addEor(param);
		}
	}

	editFormEor(param) {
		if (this.fileToUpload) {
			let formData = new FormData();
			formData.append('file', this.fileToUpload);
			let fileName:string =this.eorForm.getRawValue()['file_name'].replace(/\.[^/.]+$/, "");
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
								this.typeClicked = false;
								this.eorStatusAction = false;
								// this.eorTypeData = comingData.result ? comingData.result.data : [];
								param['media_id'] = comingData.data.id;
								this.editEor(param);
								this.formSubmited.emit(true);
								this.eorTypeSelection.nativeElement.click();
							}
						},
						(err) => {
							return false;
						},
					),
			);
		} else {
			param['media_id'] = this.eorModel.getMediaId();
			this.editEor(param);
		}
	}

	editEor(param) {
		this.subscription.push(
			this.requestService
				.sendRequest(EorBillUrlsEnum.EOR_Edit, 'PUT', REQUEST_SERVERS.fd_api_url, removeEmptyKeysFromObject(param))
				.subscribe(
					(comingData: any) => {
						if (comingData['status'] == 200 || comingData['status'] == true) {
							this.resetEor();
							this.eorModel = new EORMODEL();
							this.eorService.pushEorPopupModelClose(true);
							this.eorTypeData= [...this.eorTypeData];
							this.eorStatusCommingData= [...this.eorStatusCommingData];
							this.fileToUpload = null;
							if(this.eorService.isBillId()){
								this.eorService.reloadEorAfterAdd();
							}
							this.changeFileName();
							this.toastrService.success(comingData.message, 'Success');
						}
					},
					(err) => {},
				),
		);
	}

	addEor(param) {
		console.log(param);
		this.subscription.push(
			this.requestService
				.sendRequest(EorBillUrlsEnum.EOR_POST, 'POST', REQUEST_SERVERS.fd_api_url, removeEmptyKeysFromObject(param))
				.subscribe(
					(comingData: any) => {
						if (comingData['status'] == 200 || comingData['status'] == true) {
							this.resetEor();
							this.eorTypeData= [...this.eorTypeData];
							this.eorStatusCommingData= [...this.eorStatusCommingData];
							this.fileToUpload = null;
							this.eorService.reloadEorAfterAdd();
							this.changeFileName();
							this.toastrService.success(comingData.message, 'Success');
						}
					},
					(err) => {},
				),
		);
	}

	resetEor() {
		this.eorForm.reset();
		this.typeClicked = false;
		this.eorStatusAction = false;
		this.fileToUpload = null;
		this.changeFileName();
		}

	changeFileName(){
		var obj: any = {};
		obj = makeDeepCopyObject(this.currentBill);
		if (obj) {
		  let fileName = this.makeFileName(obj);
		  this.setFileName(fileName, this.eorForm, 'file_name');
		}
	}

	checkInputs() {
		const formObject =this.eorForm.value;
		delete  formObject['file_name'];
		if (isEmptyObject(formObject)) {
			return true;
		}
		return false;
	}
	eorIdThroughSubject(){
		this.subscription.push(
			this.eorService.eorPullId().subscribe((id) => {
				debugger;
				if (id != 0) {
					this.eorForm.reset();
					this.subscription.push(
					this.eorService.getEorById(id).subscribe((data) => {
						this.typeClicked = false;
						this.eorStatusAction = false;
						this.fileToUpload = null;
						this.eorModel = new EORMODEL(data['result']['data']);
						this.eorForm.patchValue(this.eorModel);
						this.fileNameSetOnEdit(data['result']['data']['bills'] , data['result']['data']['patient'] , data['result']['data']['amount']);
						this.fileNameSetInEditObject = new FileNameSetInEdit(data['result']['data']);
						this.eorTypeSelection.nativeElement.click();
					}));
				}
			}));
	}

	setFileNameField() {
		if (this.currentBill) {
		  let fileName = this.makeFileName(this.currentBill);
		  this.setFileName(fileName, this.eorForm, 'file_name');
		}
	  }
	
	  setFileName(name, form, control) {
		  if (form){
		form.get(control).setValue(name);
		  }
	  }
	
	  makeFileName(data) {
		  debugger;
	
		let name =`EOR_${data['label_id']}_${data['speciality_qualifier']}`;	
			if (data['bill_amount']) {
				name = `${name}_${parseFloat(data['bill_amount']).toFixed(2)}`;
				}
		return name + '.pdf';
	  }

	  getEorStatus(params) {
		this.subscription.push(
			this.eorService.getEorStatus(params).subscribe(
				(resp: any) => {
					if (
						(resp['status'] == 200 || resp['status'] == true) &&
						this.eorService.hasEORStatusList()
					) {
						this.eorStatusCommingData = resp.result ? resp.result.data : [];
						this.eorService.setEorStatus(this.eorStatusCommingData);
					} else {
						this.eorStatusCommingData = resp;
					}
				},
				(error) => {
					this.toastrService.error(error.message || 'Something went wrong.', 'Error');
				},
			),
		);
	}
		

	  typeClick(){
		this.typeClicked = true;
	   }
	   eorStatusClick(){
		this.eorStatusAction = true;
	   }
	   viewDocFile(files: any){
		this.eorService.viewDocFile(files);
	   }
	   resetTheEorFormAfterDeleteAction(){
		this.subscription.push(
			this.eorService.pullResetForm().subscribe((reset) => {
				if (reset) {
					this.eorTypeData = [...this.eorTypeData];
					this.eorStatusCommingData = [...this.eorStatusCommingData];
					this.eorForm.reset();
					this.changeFileName();
					this.fileToUpload = null;
				}
			}));
	   }
	   
	fileNameSetOnEdit(currentBill: any , patient: any , amount: any){
		if(!this.eorForm.value.file_name){
			this.changeTheFileNameThroughEdit(currentBill , patient , amount);
		}else{
			this.fileNameSaveForEdit = this.eorForm.value.file_name;
		}
	}

	changeTheFileNameThroughEdit(currentBill , patient , amount ) {
		debugger;
		let fileName = this.makeFileNameInEdit(currentBill, patient , amount);
		this.setFileName(fileName, this.eorForm, 'file_name');
	}
	
	makeFileNameInEdit(data:any  , patient: any, amount: any) {
		let name = `EOR_${data['label_id']}_${data['speciality_qualifier']}_${data['bill_amount']}`;
		return name + '.pdf';
	}

	eorAmountSubscription() {
		debugger;
		this.eorForm.get('amount').valueChanges.subscribe((val) => {
			debugger;
			if (this.eorForm.value.id) {
				this.changeTheFileNameThroughEdit(
					this.fileNameSetInEditObject.getBills(),
					this.fileNameSetInEditObject.getPatient(),
					val,
				);
			} else {
				var obj: any = {};
				obj = makeDeepCopyObject(this.currentBill);
				obj['amount'] = val;
				if (obj) {
					let fileName = this.makeFileName(obj);
					this.setFileName(fileName, this.eorForm, 'file_name');
				}
			}
		});
	}


	ngOnDestroy(): void {
		unSubAllPrevious(this.subscription);
	}
}
