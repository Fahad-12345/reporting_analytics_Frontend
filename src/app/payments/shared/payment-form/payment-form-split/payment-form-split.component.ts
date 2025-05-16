import { BillingEnum } from '@appDir/front-desk/billing/billing-enum';
import {
	Component,
	ElementRef,
	Input,
	OnInit,
	Output,
	SimpleChanges,
	ViewChild,
	EventEmitter,
	OnDestroy,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { EORService } from '@appDir/eor/shared/eor.service';
import { IPaymentEdit, PaymentEditModel } from '@appDir/payments/Models/payment-edit-model';
import { PaymentModal } from '@appDir/payments/Models/payment.model';
import { PaymentBillUrlsEnum } from '@appDir/payments/payment.enum.urls';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import {
	changeDateFormat,
	findFromArrayOFObjects,
	getExtentionOfFile,
	isPDF,
	minValidation,
	moneyMasking,
	removeEmptyKeysFromObject,
	unSubAllPrevious,
} from '@appDir/shared/utils/utils.helpers';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { isEmptyObject } from '@appDir/shared/utils/utils.helpers';
import { PaymentService } from '@appDir/payments/payment.service';
import {
	ISelectPaymentType,
	SelectPaymentTypeModel,
} from '@appDir/payments/Models/select-payment-type-model';
import { EnumApiPath } from '@appDir/front-desk/billing/Models/searchedKeys-modal';
import { BillingService } from '@appDir/front-desk/billing/service/billing.service';
import { paymentSlugsHandler } from '@appDir/front-desk/reports/shared/helper';
import { payment_status } from '../../../../../app/analytics/helpers/CaseWise.enum';

@Component({
	selector: 'app-payment-form-split',
	templateUrl: './payment-form-split.component.html',
	styleUrls: ['./payment-form-split.component.scss'],
})
export class PaymentFormSplitComponent implements OnInit, OnDestroy {
	@Input() currentBill: any = {};
	@Input() type: any = 'bill';
	paymentBill='';
	@Input() billIdFromPayment=[];
	@Input() removeEvent:any={};
	checkAmountBulk = 0;
	@Input() bulkBills = [];
	@Input() billType: any = '';
	@Input() paymentMediaFile: boolean;
	@ViewChild('paymentTypeRef') paymentTypeRef: ElementRef;
	@ViewChild('paymentByRef') paymentByRef: ElementRef;
	@ViewChild('paymentStatusRef') paymentStatusRef: ElementRef;
	@ViewChild('actionTypeRef') actionTypeRef: ElementRef;
	@Output() billListingRefresh = new EventEmitter();

	addPayment: FormGroup;
	isCallChange = true;
	bulkDataOnEdit = false;
	selected_bill_ids: any[] = [];
	bill_ids: any[] = [];
	loadSpin: boolean = false;
	recipientsList:any[]=[];
	disablePayment = false;
	actionTypeSelectedOption: any;
	paidBySelectedOption: any;
	payment_id: number;
	page_size_master: number = 100;
	min: Date= new Date('1900/01/01');
	bpDropdownSettingsPayment: any = {};
	bpDropdownSettingsPaymentType: any = {};
	bpDropdownSettingsPaymentAction: any = {};
	bpDropdownSettingsPaymentRecipient:any={}
	fileToUpload: File = null;
	paymentEditModel: IPaymentEdit = new PaymentEditModel();
	paymentTypes: any[] = [];
	paidbyComingData: any[] = [];
	actionTypeData: any[] = [];
	paymentByData: any[] = [];
	subscription: Subscription[] = [];
	paymentReceptionTypes = [];
	paymentBillUrlsEnum=PaymentBillUrlsEnum;
	paymentStatusComingData = [];
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
	params = {
		order: OrderEnum.ASC,
		per_page: this.page_size_master,
		page: 1,
		pagination: true,
		order_by: 'name',
	};
	paymentTypeParams = {
		order: OrderEnum.ASC,
		per_page: this.page_size_master,
		page: 1,
		pagination: true,
		order_by: 'name',
		excluded_keys: this.type == 'invoice' || this.type == 'bill' ? ['overpayment'] : [],
	};

	minValidation = minValidation;
	moneyMasking = moneyMasking;
	getExtentionOfFile = getExtentionOfFile;

	payment_TypeClick: boolean = false;
	payment_ByClick: boolean = false;
	payment_statusClick: boolean = false;
	payment_actionClick: boolean = false;
	actionTypeDisabled = false;
	billAmountShow = false;
	interestAmountShow = false;
	overAmountShow = false;
	btnDisable = false;
	submitted = false;
	bill_id = '';
	paymentId: any;
	selectPaymentTypeAction: ISelectPaymentType = new SelectPaymentTypeModel();
	paymentByInfoMesg: any;
	billsList = [];
	today = new Date();
	constructor(
		public fb: FormBuilder,
		public requestService: RequestService,
		public toastrService: ToastrService,
		public eorService: EORService,
		public paymentService: PaymentService,
		private billingService?: BillingService,
	) {
		this.bpDropdownSettingsPayment = {
			singleSelection: true,
			idField: 'id',
			textField: 'name',
			selectAllText: 'Select All',
			unSelectAllText: 'UnSelect All',
			allowSearchFilter: true,
		};
		this.bpDropdownSettingsPaymentType = {
			singleSelection: false,
			idField: 'id',
			textField: 'name',
			selectAllText: 'Select All',
			unSelectAllText: 'UnSelect All',
			itemsShowLimit: 5,
			allowSearchFilter: true,
		};
		this.bpDropdownSettingsPaymentAction = {
			singleSelection: false,
			idField: 'id',
			textField: 'name',
			selectAllText: 'Select All',
			unSelectAllText: 'UnSelect All',
			itemsShowLimit: 5,
			allowSearchFilter: true,
		};
		this.bpDropdownSettingsPaymentRecipient = {
			singleSelection: true,
			idField: 'recipient_id',
			textField: 'recipient_name',
			selectAllText: 'Select All',
			unSelectAllText: 'UnSelect All',
			allowSearchFilter: true,
		};
	}
	EnumApiPath = EnumApiPath;
	requestServerpath = REQUEST_SERVERS;
	conditionalExtraApiParams: any = {};
	ngOnInit() {
		this.conditionalExtraApiParams['invoice_id'] = this.currentBill.id;
		this.addPayment = this.initializeSearchForm();
		this.addPayment.controls['file_name'].disable();

		this.addPayment.markAsPristine();
		this.addPayment.markAsUntouched();
		this.addPayment.get('check_amount').valueChanges.subscribe((val) => {
			this.selectPaymentTypeAction.setAmount('check_amount', val);
			this.addPayment.patchValue({ bill_amount: 0.0 }, { emitEvent: false, onlySelf: true });
			this.addPayment.patchValue({ over_amount: 0.0 }, { emitEvent: false, onlySelf: true });
			this.addPayment.patchValue({ interest_amount: 0.0 }, { emitEvent: false, onlySelf: true });
			let fileName =
				this.billType === 'bulkPayment' && this.paymentBill!='singleBill'
					? this.makeBulkFileName(this.bulkBills)
					: this.makeFileName(this.currentBill);
			this.setFileName(fileName, this.addPayment, 'file_name');
		});
		this.addPayment.get('interest_amount').valueChanges.subscribe((val) => {
			this.selectPaymentTypeAction.setInterestAmount(
				val,
				this.getCurrentBillAmount(),
				this.currentBill.paid_amount,
			);
			this.addPayment.patchValue(
				{ bill_amount: this.selectPaymentTypeAction.getAmount('bill_amount') },
				{ emitEvent: false, onlySelf: true },
			);
			this.addPayment.patchValue(
				{ over_amount: this.selectPaymentTypeAction.getAmount('over_amount') },
				{ emitEvent: false, onlySelf: true },
			);
		});
		this.eorService.pullResetPaymentForm().subscribe((reset) => {
			if (reset) {
				this.addPayment.reset();
				this.isUploadDisable=false;
				this.payment_TypeClick = false;
				this.payment_ByClick = false;
				this.payment_statusClick = false;
				this.payment_actionClick = false;
			}
		});
		this.resetSpecificFields();
		this.getPaymentBy(this.params);
		this.getActionType(this.params);
		this.getPaymentStatus({ ...this.params });
		this.paymentType({
			flag: this.type,
			direction: this.type == 'invoice' ? true : false,
			...this.paymentTypeParams,
		});
		this.editFormInitialize();
		this.addPayment.reset();
		this.isUploadDisable=false;
		this.paymentService.pullResetForm().subscribe((status) => {
			if (status) {
				this.formCleanAfterupdateAndSavePayment();
			}
		});
		this.subscription.push(
		this.billingService.billTypes$.subscribe((res) => {
			if (res['billType']=='bulkPayment' && res['paymentType']=='singleBill') {
				this.billType='bulkPayment';
				this.paymentBill='singleBill'
			}else{
				if(res['billType']=='bulkPayment'){
					this.billType='bulkPayment'
				}
				if(this.paymentBill=='singleBill'){
					this.billType='';
					this.paymentBill='';
				}else if(this.paymentBill!='singleBill' && this.billType=='bulkPayment'){
					this.paymentBill='';
					this.billType='bulkPayment'
				}else{
					this.paymentBill='';
					this.billType='';
				}	
				this.formCleanAfterupdateAndSavePayment();
			}
		})
		)
		this.detectDeletedBill()
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (this.currentBill && Object.keys(this.currentBill).length > 0) {
			let fileName =
				this.billType === 'bulkPayment' && this.paymentBill!='singleBill'
					? this.makeBulkFileName(this.bulkBills)
					: this.makeFileName(this.currentBill);
			this.setFileName(fileName, this.addPayment, 'file_name');
			
		}
		if (
			changes.type &&
			changes.type.previousValue &&
			changes.type.previousValue == 'invoice' &&
			changes.type.currentValue == 'bill'
		) {
			this.paymentType({
				flag: this.type,
				direction: this.type == 'invoice' ? true : false,
				...this.paymentTypeParams,
			});
		}
	}
	detectDeletedBill(){
		this.subscription.push(
		this.removeEvent.subscribe((event: any) => {
			if(event?.id){
				this.resetPayment();
				this.paymentService.reloadPaymentAfterAdd();
			}
	  })
	)
	}
	// removeEvent()
	 dateLessThanToday(control?: FormControl): any {
        let today : Date = new Date();
		let validator:boolean=false;
       if (this.addPayment.get('check_date').value > today){
		validator=true;
	   }

       return validator;
   }
	initializeSearchForm(): FormGroup {
		return this.fb.group({
			id: [null],
			check_date: [
				'',
				[
					Validators.required,
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
				],
			],
			action_type_id: ['', Validators.required],
			check_no: [
				'',
				[Validators.required, Validators.maxLength(50), Validators.pattern('^[a-zA-Z0-9_]*$')],
			],
			check_amount: [null],
			by_id: ['', Validators.required],
			types: ['', Validators.required],
			interest_amount: [null],
			bill_amount: [null],
			description: [''],
			comments: [''],
			file_name: [''],
			status_id: [''],
			status_slug:[''],
			over_amount: [null],
			bill_id: [''],
			invoice_bills_payment: [''],
			recipient_id:[null,[Validators.required]],
		});
	}
	resetSpecificFields(id?: any) {
		this.addPayment.patchValue({
			check_date: '',
			check_no: '',
			check_amount: null,
			interest_amount: null,
			bill_amount: null,
			types: '',
			paid_by_id: '',
			description: '',
			comments: '',
		});
		this.setFileNameField();
		this.payment_TypeClick = false;
		this.payment_ByClick = false;
		this.payment_statusClick = false;
		this.payment_actionClick = false;
	}
	changePaymentStatus(event?){
		let paymentStatus:any={}
			if(event)
				paymentStatus=this.paymentStatusComingData.find(status=>status?.id==event?.id)
			if(paymentStatus?.slug=='write_off' && this.billType != 'bulkPayment' && event?.id){
				this.addPayment.get('check_amount').clearValidators();
				this.addPayment.get('check_amount').updateValueAndValidity();
			}else{
				this.addPayment
					.get('check_amount')
					.setValidators([Validators.required, this.max(999999.99), this.minValidation(0)]);
				this.addPayment.get('check_amount').updateValueAndValidity();
			}
	}
	getActionType(params) {
		this.subscription.push(
			this.paymentService.getActionType(params).subscribe(
				(resp: any) => {
					if (
						(resp?.status == 200 || resp?.status == true) &&
						this.paymentService.hasActionType()
					) {
						this.actionTypeData = resp.result ? resp.result.data : [];
						this.paymentService.setActionType(this.actionTypeData);
					} else {
						this.actionTypeData = resp;
					}
				},
				(error) => {
					this.toastrService.error(error.message || 'Something went wrong.', 'Error');
				},
			),
		);
	}

	onSelectActionType($event) {
		if ($event && $event.length != 0) {
			this.addPayment.controls['types'].setValue($event[0].id);
		}
	}
	onSelectPaymentBy($event) {
		if ($event && $event.length != 0) {
			this.addPayment.controls['types'].setValue($event[0].id);
		}
	}

	onItemSelectReception(item) {
		this.selectPaymentTypeAction.setFieldNameShowOnSingalAction(item.name, true);
		if (this.addPayment.controls['types']['value']['length'] > 1) {
			const selectedTypes: any[] = this.addPayment.controls['types'].value;
			selectedTypes.forEach((type) => {
				this.implementValidationOfAmount(type);
			});
		}
	}

	onItemDeSelectReception(item) {
		this.selectPaymentTypeAction.setFieldNameShowOnSingalAction(item.name, false);
		const nameOfField = String(item.name).toLocaleLowerCase();
		if (this.addPayment.controls['types'].value.length === 1) {
			this.addPayment.patchValue({ interest_amount: 0.0 });
			this.addPayment.get('interest_amount').clearValidators();
			this.addPayment.get('interest_amount').updateValueAndValidity();
		}
		if (nameOfField === PaymentBillUrlsEnum.INTEREST) {
			this.addPayment.patchValue({ interest_amount: 0.0 });
			this.addPayment.get('interest_amount').clearValidators();
			this.addPayment.get('interest_amount').updateValueAndValidity();
		}
	}

	onSelectAllReception(item) {
		this.selectPaymentTypeAction.setFieldNameShowOnMultipleAction(true);
		this.addPayment
			.get('interest_amount')
			.setValidators([
				Validators.compose([Validators.required, this.max(999999.99), this.minValidation(0)]),
			]);
	}

	onItemDeSelectAllReception(e?: any) {
		this.selectPaymentTypeAction.setFieldNameShowOnMultipleAction(false);
		this.addPayment.patchValue({ over_amount: 0.0 });
		this.addPayment.patchValue({ interest_amount: 0.0 });
		this.addPayment.patchValue({ bill_amount: 0.0 });
		this.addPayment.get('over_amount').clearValidators();
		this.addPayment.get('over_amount').updateValueAndValidity();
		this.addPayment.get('interest_amount').clearValidators();
		this.addPayment.get('interest_amount').updateValueAndValidity();
		this.addPayment.get('bill_amount').clearValidators();
		this.addPayment.get('bill_amount').updateValueAndValidity();
	}

	addRequiredInterestBill() {
		this.addPayment.get('bill_amount').setValidators([Validators.required]);
		this.addPayment.get('bill_amount').updateValueAndValidity();
		this.addPayment
			.get('interest_amount')
			.setValidators([this.minValidation(0), this.max(999999.99)]);
		this.addPayment.get('interest_amount').updateValueAndValidity();
		this.addPayment.get('bill_amount').disable();
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
	/* BELOW UN_USED CODE */
	findSaveAndSelect(fromReception = false) {
		if (
			Array.isArray(this.addPayment.controls['types'].value) &&
			this.addPayment.controls['types'].value.length == 1
		) {
			let isInterest = findFromArrayOFObjects(
				this.addPayment.controls['types'].value ? this.addPayment.controls['types'].value : [],
				'value',
				2,
			);
			if (isInterest) {
				let save = findFromArrayOFObjects(this.paymentTypes, 'id', 3);
				let isSaveSelected = findFromArrayOFObjects(
					this.addPayment.get('action_type_id').value,
					'id',
					1,
				);
				if (!isSaveSelected) {
					let selectedVal = [
						...(this.addPayment.get('action_type_id').value
							? this.addPayment.get('action_type_id').value
							: []),
					];
					if (save) {
						selectedVal.push(save);
						this.addPayment.get('action_type_id').setValue(selectedVal);
					}
				}
			}
		}
		if (
			Array.isArray(this.addPayment.controls['types'].value) &&
			this.addPayment.controls['types'].value.length == 1
		) {
			let isBill = findFromArrayOFObjects(
				this.addPayment.controls['types'].value ? this.addPayment.controls['types'].value : [],
				'value',
				1,
			);
			if (isBill) {
				let save = findFromArrayOFObjects(
					this.addPayment.get('action_type_id').value
						? this.addPayment.get('action_type_id').value
						: [],
					'id',
					3,
				);
				if (save && fromReception && this.isCallChange) {
					this.addPayment.get('action_type_id').setValue(null);
					Object.keys(this.addPayment.controls).forEach((controlKey) => {
						this.addPayment.controls[controlKey].markAsDirty();
					});
					this.addPayment.markAsPristine();
					this.addPayment.markAsUntouched();
				}
			}
		}
		if (
			Array.isArray(this.addPayment.controls['types'].value) &&
			this.addPayment.controls['types'].value.length == 1
		) {
			let isInsurance = findFromArrayOFObjects(
				this.addPayment.controls['types'].value ? this.addPayment.controls['types'].value : [],
				'value',
				2,
			);
			if (isInsurance) {
				let selectedVal = [];
				let save = findFromArrayOFObjects(this.paymentTypes, 'id', 3);

				if (save) {
					selectedVal.push(save);
					this.addPayment.get('action_type_id').setValue(selectedVal);
					Object.keys(this.addPayment.controls).forEach((controlKey) => {
						this.addPayment.controls[controlKey].markAsDirty();
					});
					this.addPayment.markAsPristine();
					this.addPayment.markAsUntouched();
				}
			}
		}
	}
	/* BELOW UN_USED CODE */
	notAllow(e) {
		let d = parseFloat(moneyMasking(this.addPayment.get('interest_amount').value));
		if (d == -1) {
			// this.form.get('interest_amount').setValue(parseFloat('0'));
		}
		if (
			this.addPayment.controls['types'].value &&
			this.addPayment.controls['types'].value.length == 2
		) {
			if (
				parseFloat(moneyMasking(this.addPayment.get('interest_amount').value)) >=
					parseFloat(moneyMasking(this.addPayment.get('check_amount').value)) &&
				!Number.isNaN(d)
			) {
				// this.form.get('interest_amount').setValue(parseFloat(this.form.get('cheque_amount').value) - 0.01);
				// this.changeInterestAmount();
			}
		}
	}
	/* BELOW UN_USED CODE */
	changeInterestAmount() {
		if (
			this.addPayment.controls['types'].value &&
			this.addPayment.controls['types'].value.length == 2
		) {
			if (
				parseFloat(this.addPayment.get('interest_amount').value) <
				parseFloat(this.addPayment.get('check_amount').value)
			) {
				let bill_amount =
					parseFloat(moneyMasking(this.addPayment.get('check_amount').value)) -
					parseFloat(moneyMasking(this.addPayment.get('interest_amount').value));
				this.addPayment.get('bill_amount').setValue(bill_amount.toFixed(2));
			}
		}
		if (
			this.addPayment.controls['types'].value &&
			this.addPayment.controls['types'].value.length == 2
		) {
			if (
				parseFloat(moneyMasking(this.addPayment.get('interest_amount').value)) ==
				parseFloat(moneyMasking(this.addPayment.get('check_amount').value))
			) {
				let bill_amount = 0;
				this.addPayment.get('bill_amount').setValue(bill_amount.toFixed(2));
			}
		}
		if (
			this.addPayment.controls['types'].value &&
			this.addPayment.controls['types'].value.length == 2
		) {
			if (
				!this.addPayment.get('interest_amount').value &&
				!this.addPayment.get('check_amount').value
			) {
				let bill_amount = 0;
				this.addPayment.get('bill_amount').setValue(bill_amount.toFixed(2));
			}
		}
		if (
			this.addPayment.controls['types'].value &&
			this.addPayment.controls['types'].value.length == 2
		) {
			if (
				!this.addPayment.get('interest_amount').value &&
				this.addPayment.get('check_amount').value
			) {
				let bill_amount = 0;
				this.addPayment.get('bill_amount').setValue(bill_amount.toFixed(2));
			}
		}
	}

	setFileNameField() {
		if (this.billType === 'bulkPayment') {
			let fileName = this.makeBulkFileName(this.bulkBills);
			this.setFileName(fileName, this.addPayment, 'file_name');
		} else {
			if (this.currentBill) {
				let fileName = this.makeFileName(this.currentBill);
				this.setFileName(fileName, this.addPayment, 'file_name');
			}
		}
	}
	setFileName(name, form, control) {
		if (form) {
			form.get(control).setValue(name);
		}
	}

	makeBulkFileName(data) {
		if (this.billType === 'bulkPayment') {
			if(!this.bill_details['length']){
				var name = 'Payment';
			this.bulkBills.forEach((bulkBill) => {
				name = `${name}_${bulkBill['label_id']}_${bulkBill['speciality_qualifier']}_${
					bulkBill['bill_amount']
				}${this.bulkBills.length === this.bulkBills.indexOf(bulkBill) + 1 ? '' : '_Payment'}`;
			});
			}
			else if(this.bill_details['length']){
				var name = 'Payment';
				this.bill_details.forEach((bulkBill) => {
					name = `${name}_${bulkBill['label_id']}_${bulkBill['speciality_qualifier']}_${
						bulkBill['bill_amount']
					}${this.bill_details.length === this.bill_details.indexOf(bulkBill) + 1 ? '' : '_Payment'}`;
				});
			}
			else{
				var name = 'Payment';
				this.bulkBills.forEach((bulkBill) => {
					name = `${name}_${bulkBill['label_id']}_${bulkBill['speciality_qualifier']}_${
						bulkBill['bill_amount']
					}${this.bulkBills.length === this.bulkBills.indexOf(bulkBill) + 1 ? '' : '_Payment'}`;
				});
			}
		}
		return `${name}.pdf`;
	}

	makeFileName(data) {
		let name;
		if (this.type == 'bill') {
			name = `Payment_${data['label_id']}_${data['speciality_qualifier']}`;
		} else {
			name = `Payment_${data['invoice_id']}_${data['amount_due']}`;
		}

		if (data['bill_amount'] && this.type == 'bill') {
			name = `${name}_${parseFloat(data['bill_amount']).toFixed(2)}`;
		}
		return name + '.pdf';
	}

	handleFileInput(files: FileList) {
		if (files.length > 0) {
			if (this.getExtentionOfFile(files.item(0).name) == '.pdf') {
				this.fileToUpload = files.item(0);
			} else {
				this.toastrService.error('Please select  pdf file');
			}
		}
		// this.fileToUpload = files.item(0);
	}

	changeBill(event) {
		this.bill_id = event.formValue ? event.formValue : '';
		if (this.addPayment.value.invoice_bills_payment == '1' && this.bill_id && event) {
			this.btnDisable = false;
		} else {
			this.btnDisable = true;
		}
	}
	postPayments() {
		if(!this.addPayment.getRawValue()?.status_id && this.billType!='bulkPayment'){
			this.addPayment
			.get('check_amount')
			.setValidators([Validators.required, this.max(999999.99), this.minValidation(0)]);
		this.addPayment.get('check_amount').updateValueAndValidity();
		}
		if (this.type === 'bill' && this.currentBill.invoice_id && this.billType!='bulkPayment') {
			this.submitted = true;
			this.toastrService.error(
				'The invoice is already generated against the bill, please post payment through the invoice',
				'Error',
			);
			return false;
		}
		if (
      !this.addPayment.valid ||
      (this.addPayment.valid &&
        this.addPayment.value.invoice_bills_payment != true &&
        this.addPayment.value.invoice_bills_payment != false &&
        !this.addPayment?.value?.id &&
        this.currentBill.invoice_category == 'invoice_for_bill') ||
        this.dateLessThanToday()
    ) {
      this.submitted = true;
      this.toastrService.error('Please fill the all required field.', 'Error');
      return false;
    }

		
		this.submitted = false;
		let post = this.addPayment.getRawValue();
		if (this.type === 'bill') {
			post['bill_id'] = this.currentBill['id']
				? this.currentBill['id']
				: this.paymentEditModel.getBillId();
		} else {
			post['invoice_id'] = this.currentBill['id']
				? this.paymentMediaFile
					? this.currentBill['invoice_id']
					: this.currentBill['id']
				: this.paymentEditModel.getBillId();
			post['bill_amount'] = this.currentBill['amount_due'];
			this.currentBill['bill_amount'] = this.currentBill['amount_due'];
			post['invoice_bills_payment'] =
				this.addPayment.value.invoice_bills_payment == '1' &&
				this.currentBill.invoice_category == 'invoice_for_bill'
					? true
					: false;
			if (this.currentBill.invoice_category == 'invoice_for_bill') {
				post['bill_id'] =
					this.bill_id && this.addPayment.value.invoice_bills_payment == '1' ? this.bill_id : '';
			}
		}
		if (post['check_amount']>0 && post['check_amount'] <= post['interest_amount']) {
			this.toastrService.error('Interest amount cannot be equal or greater check amount', 'Error');
			return false;
		}
		if (post && post.types.length > 1) {
			post['check_amount'] = moneyMasking(post['check_amount'] - post['interest_amount']);
			this.selectPaymentTypeAction.setAmount('check_amount', post['check_amount']);
		} else {
			post['check_amount'] = moneyMasking(post['check_amount']);
		}

		post['interest_amount'] = moneyMasking(
			this.selectPaymentTypeAction.setFunctionOnInterest(
				post['types'],
				post['interest_amount'],
				PaymentBillUrlsEnum.INTEREST,
			),
		);
		let type;
		type = this.type == 'invoice' ? PaymentBillUrlsEnum.INVOICE : PaymentBillUrlsEnum.BILL;
		post['bill_amount'] = moneyMasking(
			this.selectPaymentTypeAction.setFunctionOnBill(
				post['types'],
				post['bill_amount'],
				type,
				this.getCurrentBillAmount(),
				this.addOverPayment(post['check_amount']),
				{
					bill: type === 'bill' ? this.currentBill.bill_amount : this.currentBill.amount_due,
					paid: this.currentBill.paid_amount,
					checkoutAmount: this.paymentEditModel.check_amount,
				},
				post['id'],
			),
		);
		if (this.billType !== 'bulkPayment') {
			post['over_amount'] = moneyMasking(
				this.selectPaymentTypeAction.setFunctionOnOverAmount(
					post['types'],
					post['over_amount'],
					PaymentBillUrlsEnum.OVER_PAYMENT,
					{
						billAmount: post['bill_amount'],
						interestAmount: post['interest_amount'],
						checkAmount: post['check_amount'],
					},
					{
						bill: this.currentBill.bill_amount,
						paid: this.currentBill.paid_amount,
					},
				),
			);
		}
		post['check_date'] = changeDateFormat(post['check_date']);
		post['case_id'] = null;
		let paymentModel = new PaymentModal(post);
		paymentModel=paymentSlugsHandler(paymentModel,this.paymentStatusComingData)
		if (!paymentModel.types.some(this.verifyOverPayment) && this.billType !== 'bulkPayment') {
			paymentModel.types.push('overpayment');
		}
		if (post['id']) {
			if (this.getFullyPaidOfBill() && post['bill_amount'] === 0) {
				type == 'invoice'
					? (paymentModel.types = paymentModel.types.filter((type) => type != 'invoice'))
					: (paymentModel.types = paymentModel.types.filter((type) => type != 'bill'));
			}
		} else {
			if (this.getFullyPaidOfBill()) {
				type == 'invoice'
					? (paymentModel.types = paymentModel.types.filter((type) => type != 'invoice'))
					: (paymentModel.types = paymentModel.types.filter((type) => type != 'bill'));
			}
		}
		if (
			post['over_amount'] === null ||
			post['over_amount'] === 0 ||
			(post['over_amount'] < 0 && this.billType !== 'bulkPayment')
		) {
			paymentModel.types = paymentModel.types.filter((type) => type != 'overpayment');
			post['over_amount'] = 0;
			paymentModel['over_amount'] = 0;
		}
		if(post['types']['length']>1 && post['status_id'].some(x=>x.id=== payment_status.writeOff ) && this.billType!='bulkPayment'){
			this.toastrService.error('Sorry, You can only select one paymemnt type with write off status','Error')
			return;
		}
		if(type=='invoice' && this.billType!='bulkPayment' && paymentModel.id){
			if(post['interest_amount']==post['check_amount']){
				paymentModel['types']=[];
				paymentModel['bill_amount']=paymentModel['check_amount'];
				paymentModel['over_amount']=null;
				paymentModel['types'].push('interest')
			}
		}
		if (this.billType === 'bulkPayment') {
			this.paymentTypeBulkPayment(paymentModel);
			this.addBillPaymentFP(paymentModel);
			return;
		}
		if (paymentModel.id) {
			paymentModel.id === paymentModel.bill_id
				? (paymentModel.bill_id = this.currentBill.bill_id)
				: '';
			this.editBillPaymentFP(paymentModel);
			this.paymentId = null;
		} else {
			this.addBillPaymentFP(paymentModel);
		}
	}

	verifyOverPayment(type: any) {
		return type === 'overpayment';
	}
	paymentType(params) {
		this.subscription.push(
			this.paymentService.paymentType(params).subscribe((resp: any) => {
				if (
					resp?.status == 200 ||
					resp?.status == true
					// &&
					// this.paymentService.hasPaymentTypeList()
				) {
					this.paymentReceptionTypes = resp.result ? resp.result.data : [];
					this.paymentService.setPaymentType(this.paymentReceptionTypes);
				} else {
					this.paymentReceptionTypes = resp;
				}
			}),
		);
	}
	bill_recipient_type_id: any;
	paidby=[];
	@Input () fromPaymentList=false;
	getPaymentBy(queryParams: any): void {
		debugger;
		this.subscription.push(
			this.paymentService.getPaymentBy(queryParams).subscribe(
				(resp: any) => {
					if (
						(resp?.status == 200 || resp?.status == true) 
					) {
						if (this.billType == 'bulkPayment' && !this.fromPaymentList) {
							this.paidbyComingData = resp.result ? resp.result.data : [];
							let slugs = [];
							if(this.bulkBills && this.bulkBills[0] && this.bulkBills[0]['bill_recipients']){
								let recipientId = this.bulkBills[0]['bill_recipients'].map(
									(x) => x.bill_recipient_type_id,
								);
								for (let item of this.bulkBills[0]['bill_recipients']) {
									if (
										this.bulkBills[0]['bill_recipients'].some((recip) =>
											recipientId.includes(recip['bill_recipient_type_id']),
										)
									) {
										item['recipient_type_slug'] =
											item['recipient_type_slug'] == 'lawyer'
												? 'attorney'
												: item['recipient_type_slug'];
										slugs.push(item['recipient_type_slug']);
									}
								}
							}
							
							this.paidbyComingData = this.paidbyComingData.filter((x) => slugs.includes(x.slug));
						} else {
							this.paidbyComingData = resp.result ? resp.result.data : [];
						}
					} else {
						this.paidbyComingData = resp;
					}
					if(this.currentBill?.invoice_category !== 'invoice_for_inventory')
					  this.paidbyComingData=this.paidbyComingData.filter(paymentBy=>paymentBy?.slug!=='other');
				},
				(error) => {
					this.toastrService.error(error.message || 'Something went wrong.', 'Error');
				},
			),
		);
	}

	getPaymentStatus(params) {
		this.subscription.push(
			this.paymentService.getPaymentStatus(params).subscribe(
				(resp: any) => {
					if (
						(resp['status'] == 200 || resp['status'] == true) &&
						this.paymentService.hasPaymentStatusList()
					) {
						this.paymentStatusComingData = resp.result ? resp.result.data : [];
						this.paymentService.setPaymentStatus(this.paymentStatusComingData);
					} else {
						this.paymentStatusComingData = resp;
					}
				},
				(error) => {
					this.toastrService.error(error.message || 'Something went wrong.', 'Error');
				},
			),
		);
	}
	upload='';
	isUploadDisable=false;
	addBillPaymentFP(params) {
		this.loadSpin = true;
		this.upload='';
		if (this.fileToUpload && !isPDF(this.fileToUpload['type'])) {
			this.toastrService.error('Upload only Pdf File');
			this.loadSpin = false;
			return false;
		}
	
		if (this.fileToUpload) {
			let formData: any = new FormData();
			formData.append('file', this.fileToUpload);
			let fileName: string = this.addPayment.getRawValue()['file_name'].replace(/\.[^/.]+$/, '');
			formData.append('file_name', fileName);

			if (this.billType === 'bulkPayment') {
				var bill_ids: any[] = this.bulkBills['length']?this.bulkBills.map((bill) => bill['id']):this.bill_details.map((bill) => bill['id']);
				formData.append('bill_ids', bill_ids);
				this.upload='auto';
			}
			this.subscription.push(
				this.requestService
					.sendRequest(BillingEnum.uploadMediaPayment, 'POST', REQUEST_SERVERS.fd_api_url, formData)
					.subscribe(
						(comingData: any) => {
							if (comingData['status'] == 200 || comingData['status'] == true) {
								// this.eorTypeData = comingData.result ? comingData.result.data : [];
								this.loadSpin = false;
								params['media_id'] = comingData.data.id;
								this.addBillPaymentApiHit(params);
								if (this.billType === 'bulkPayment') {
									this.bulkBillParams = this.bulkBillParams + params;
									this.paymentService.getBulkObj(params);
								}
							}
						},
						(err) => {
							this.btnDisable = false;
							this.loadSpin = false;
							return false;
						},
					),
			);
		} else {
			delete params.file_name;
			this.addBillPaymentApiHit(params);
		}
	}
	editBillPaymentFP(params) {
		if (this.fileToUpload && !isPDF(this.fileToUpload['type'])) {
			this.toastrService.error('Upload only Pdf File');
			return false;
		}
		if (this.fileToUpload) {
			let formData = new FormData();
			formData.append('file', this.fileToUpload);
			let fileName: string = this.addPayment.getRawValue()['file_name'].replace(/\.[^/.]+$/, '');
			formData.append('file_name', fileName);
			this.subscription.push(
				this.requestService
					.sendRequest(BillingEnum.uploadMediaPayment, 'POST', REQUEST_SERVERS.fd_api_url, formData)
					.subscribe(
						(comingData: any) => {
							if (comingData['status'] == 200 || comingData['status'] == true) {
								// this.eorTypeData = comingData.result ? comingData.result.data : [];
								params['media_id'] = comingData.data.id;
								this.editBillPaymentApiHit(params);
							}
						},
						(err) => {
							return false;
						},
					),
			);
		} else {
			delete params.file_name;
			this.editBillPaymentApiHit(params);
		}
	}

	/**
	 * Add payment api hit
	 *
	 */
	bulkBillParams = {};
	paymentTypeBulkPayment(params) {
		debugger;
		let formData=this.addPayment.getRawValue();
		this.checkAmountBulk =
			this.billType === 'bulkPayment' ? this.addPayment.value.check_amount : null;
		let totalOutstanding = 0;
		params['over_amount']=null;
		let bill_ids = this.bulkBills.map((item) => item.id);
		params['bill_ids'] = bill_ids;
		params['bill_ids'] = this.bill_ids['length'] && this.bill_ids['length']==bill_ids['length']? this.bill_ids : bill_ids;
		params['types'] = [];
		for (let item of this.bulkBills) {
			totalOutstanding += Number(item['outstanding_amount']);
		}
		totalOutstanding=Number(totalOutstanding.toFixed(2))
		this.checkAmountBulk = params['interest_amount']
			? this.checkAmountBulk - Number(params['interest_amount'])
			: this.checkAmountBulk;
		params['types'] = params['interest_amount'] ? ['interest'] : params['types'];
		params['id'] = this.paymentEditModel['id'] ? this.paymentEditModel['id']:
	    (params['id']?params.id:null);
		let billAmount = 0;
		if (this.bill_details['length']) {
			for (let item of this.bill_details) {
				billAmount += Number(item['bill_amount']);
			}
			params['media_id']=this.media_id?this.media_id:null;
			params['bill_amount'] = Number(billAmount.toFixed(2));
			let checkAmount = Number(this.addPayment['value']['check_amount']);
			let check=Number(checkAmount)-Number(this.addPayment['value']['interest_amount']);
			if (Number(checkAmount.toFixed(2)) <= Number(params['bill_amount'].toFixed(2)) || Number(check.toFixed(2))<=totalOutstanding) {
				params['bill_amount'] = checkAmount - Number(this.addPayment['value']['interest_amount']);
				params['check_amount'] = params['bill_amount'];
				if(Number(params['bill_amount']!=0)){
				params['types'].push('bill');
				}
			} else if (checkAmount > Number(params['bill_amount'].toFixed(2))) {
				params['check_amount'] = checkAmount - params['interest_amount'];
				params['bill_amount'] =totalOutstanding?totalOutstanding: params['bill_amount'];
				params['over_amount']=(formData['check_amount']-formData['interest_amount'])-params['bill_amount']
				params['check_amount'] > params['bill_amount']?
				params['check_amount'] - params['bill_amount']: 0;
				if(Number(params['over_amount'])!=0){
					params['types'].push('overpayment');
				}
				if(Number(params['bill_amount']!=0)){
					params['types'].push('bill');
				}
			}
		} else {
			params['id']=null;
			if (this.checkAmountBulk > Number(totalOutstanding.toFixed(2))) {
				params['bill_amount'] = Number(totalOutstanding);
				params['over_amount'] = this.checkAmountBulk - Number(totalOutstanding);
				if(Number(params['over_amount'])!=0){
				params['types'].push('overpayment');
				}
				Number(totalOutstanding) !== 0 ? params['types'].push('bill') : null;
			} else {
				params['bill_amount'] = this.checkAmountBulk;
				params['over_amount'] = null;
				if(Number(params['bill_amount']!=0)){
				params['types'].push('bill');
				}
			}
		}
		params['bill_amount']=params['bill_amount']<0?params['check_amount']:params['bill_amount'];
		if(params['bill_amount']==params['interest_amount'] && params['interest_amount']==params['check_amount']){
			params['types']=[];
			params['types'].push('interest');
			params['bill_amount']=null;
		}
		
		if(params['interest_amount']==params['check_amount']){
			if(formData['check_amount']>params['interest_amount']){
				params['bill_amount']=Number(formData['check_amount'])-Number(params['interest_amount']);
			}
		}
		if((params['bill_amount']==params['interest_amount'] && params['types']['length']==3) || (params['types']['length']==3 && params['bill_amount']==0) ){
			params['bill_amount']=totalOutstanding?totalOutstanding:billAmount;
			params['over_amount']=Number(params['bill_amount'])-Number(params['check_amount']);
			if(Number(params['over_amount'])<0){
				params['over_amount']=-Number(params['over_amount']);
			}
		}
		else if(params['bill_amount']==params['interest_amount']){
			params['types'].push('bill');
		}
		let amount = params['bill_amount']
      ? params['bill_amount']
      : 0 + params['interest_amount']
      ? params['interest_amount']
      : 0 + params['over_amount']
      ? params['over_amount']
      : 0;
		amount=Number(amount)
		if(amount.toFixed(2)>Number(formData['check_amount']) && params['id']){
			params['check_amount']=Number(formData['check_amount'])-Number(formData['interest_amount']);
			params['interest_amount']=formData['interest_amount'];
			params['bill_amount']=formData['check_amount'];
		}
		if(formData['types'] && formData['types']['length']==1 && formData['types'][0]['name']=='Interest'){
			params['types']=[];
			params['types'].push('interest');
			params['check_amount']=formData['check_amount'];
			params['bill_amount']=null;
			params['interest_amount']=params['check_amount'];
		}
		if(params['types']['length']==2 && !(params['types'].some(x=>x=='overpayment'))){
			params['bill_amount']=formData['bill_amount'];
			params['interest_amount']=formData['interest_amount'];
		}else if((params['types'].some(x=>x=='overpayment'))){
			params['bill_amount']=totalOutstanding?totalOutstanding:billAmount;
		}

		params['bill_amount']=params['bill_amount']?+(params['bill_amount'].toFixed(2)):params['bill_amount'];
		params['over_amount']=params['over_amount']?(+params['over_amount'].toFixed(2)):params['over_amount'];
		params['check_amount']=params['check_amount']?(+Number(params['check_amount']).toFixed(2)):params['check_amount'];
		let interstAmount: number = +params['interest_amount'];
		params['interest_amount']=params['interest_amount']?(interstAmount.toFixed(2)):params['interest_amount'];
		if(params['id']){
			let response={};
			this.billingService.allpayments$.subscribe(res=>{
				response=res?res:{};
				if(response && response['status']){
					params['id']=null;
					this.billingService.getPayments({payments:[],status:false})
				}
			});
		}
		if(params['check_amount']!=params['bill_amount'] && (params['types'].some(x=>x=='bill'))){
			if(!(params['types'].some(x=>x=='overpayment'))){
				params['bill_amount']=params['check_amount'];
			}
		}
		if(params['over_amount']==0 && params['types'].some(x=>x=='overpayment')){
			params['types'].splice(params['types'].indexOf('overpayment'),1)
		}
		if(params['over_amount']<0 &&  params['types'].some(x=>x=='overpayment')){
			params['bill_amount']=Number(formData['check_amount'])-Number(formData['interest_amount']);
			params['over_amount']=0;
			params['types'].splice(params['types'].indexOf('overpayment'),1)
			if(params['bill_amount']<0){
				params['bill_amount']=-params['bill_amount'];
			}
		}
		if (this.fileToUpload) {
			params['upload']='auto';
		}
		this.bulkBillParams = params;
		this.paymentService.getBulkObj(params);
		this.billingService.triggerEvent(false);
		this.billingService.isEventTrigger$.subscribe((res) => {
			if (res) {
				this.formCleanAfterupdateAndSavePayment();
				this.addPayment.reset();
				this.isUploadDisable=false;
				this.isInterest=false;
				this.addPayment.get('interest_amount').clearValidators();
 				this.addPayment.get('interest_amount').updateValueAndValidity();
			}
		});
		params['bill_id']=params['bill_ids']['length']?null:params['bill_id']
		return params;
	}
	addBillPaymentApiHit(params: any) {
		this.actionTypeDisabled = false;
		if (
      this.currentBill &&
      this.currentBill.invoice_category != 'invoice_for_bill' &&
      this.billType != 'bulkPayment'
    ) {
      params['bill_id'] = this.billIdFromPayment
        ? this.billIdFromPayment
        : params['bill_id'];
		if(this.currentBill && this.currentBill.invoice_category == 'invoice_for_inventory'){
			params['bill_id']=null;
		}
    }
		this.subscription.push(
			this.requestService
				.sendRequest(
					this.billType === 'bulkPayment'
						? PaymentBillUrlsEnum.bulkPaymentUrl
						: PaymentBillUrlsEnum.AddPaymentUrl,
					'POST',
					REQUEST_SERVERS.fd_api_url,
					removeEmptyKeysFromObject(params),
				)
				.subscribe(
					(comingData: any) => {
						if (comingData['status'] == 200 || comingData['status'] == true) {
							this.loadSpin=false;
							if (this.billType === 'bulkPayment') {
								this.paymentService.getBills(comingData['result']['data']);
								if(this.addPayment && this.addPayment?.value?.id){
									this.billingService.verifiedPayment(true)
								}
								this.addPayment && this.addPayment.value.id?this.addPayment.value.id=null:null;
								
								this.paymentEditModel['id']=null;
							}
							this.toastrService.success(comingData.message, 'Success');
							if (this.billType !== 'bulkPayment') {
								this.bill_ids = [];
								this.bill_details = [];
								this.formCleanAfterupdateAndSavePayment();
								if(this.paymentBill=='singleBill'){
									this.bulkBills=comingData['result']['data'];
								}
							}
							if(this.billType!='bulkPayment'){
								this.onItemDeSelectAllReception();
							}
							this.billType === 'bulkPayment' && this.upload != 'auto'
							? (this.isUploadDisable = true)
							: (this.isUploadDisable = false);
						
						} else {
							this.btnDisable = false;
							this.loadSpin=false;
							// this.toastrService.error(comingData.message || 'Something went wrong.', 'Error');
						}
					},
					(error) => {
						this.btnDisable = false;
						this.loadSpin = false;
						// error.status!=406?this.toastrService.error(error.message || 'Something went wrong.', 'Error'):'';
					},
				),
		);
	}

	editBillPaymentApiHit(params) {
		this.actionTypeDisabled = false;
		this.subscription.push(
			this.requestService
				.sendRequest(
					PaymentBillUrlsEnum.editPayment,
					'PUT',
					REQUEST_SERVERS.fd_api_url,
					removeEmptyKeysFromObject(params),
				)
				.subscribe(
					(comingData: any) => {
						if (comingData['status'] == 200 || comingData['status'] == true) {
							this.toastrService.success(comingData.message, 'Success');
							this.paymentEditModel = new PaymentEditModel();
							this.formCleanAfterupdateAndSavePayment();
							this.onItemDeSelectAllReception();
							this.paymentService.pushPaymentEditPopup(true);
						} else {
							this.btnDisable = false;
							// this.toastrService.error(comingData.message || 'Something went wrong.', 'Error');
						}
					},
					(error) => {
						this.btnDisable = false;
						// this.loadSpin = false;
						// error.status!=406?this.toastrService.error(error.message || 'Something went wrong.', 'Error'):'';
					},
				),
		);
	}

	getSignalPaymentId(ID: number) {
		this.subscription.push(
			this.requestService
				.sendRequest(PaymentBillUrlsEnum.getSinglePayment + ID, 'GET', REQUEST_SERVERS.fd_api_url)
				.subscribe((comingData: any) => {
					this.actionTypeDisabled = false;
					this.paymentEditModel = comingData['result']['data']['payments'] 
						? this.editBulkPayment(comingData, ID)
						: new PaymentEditModel(comingData['result']['data']);
					this.addPayment.patchValue(this.paymentEditModel);
					this.addPayment.updateValueAndValidity();
					this.getPaymentByInfo({name:this.paymentEditModel?.by?.name})
					
					this.ngSelectionClick();
					if (this.billType !== 'bulkPayment') {
						if (this.addPayment.getRawValue()?.status_id!== payment_status.writeOff) {
							this.addPayment
								.get('check_amount')
								.setValidators([Validators.required, this.max(999999.99), this.minValidation(0)]);
							this.addPayment.get('check_amount').updateValueAndValidity();
						}
						this.onItemDeSelectAllReception();
						if (!this.paymentEditModel.file_name) {
							this.fileNameSetOnEdit(
								this.type === 'bill' ? comingData.result.data.bill : comingData.result.data.invoice,
								comingData.result.data.patient,
							);
						}
					}else{
						if(this.payments['length'] && this.payments[0]['media'] && this.payments[0]['media']['file_name']){
							let n = this.payments[0]['media']['file_name'].indexOf('_');
							let name = this.payments[0]['media']['file_name'].substring(n + 1);
							this.setFileName(name, this.addPayment, 'file_name');
							this.payments[0]['media']['file_name']=null;
						}else{
							let fileName =
								this.billType === 'bulkPayment' && this.paymentBill != 'singleBill'
									? this.makeBulkFileName(this.bulkBills)
									: this.makeFileName(this.currentBill);
							if(fileName){
							this.setFileName(fileName, this.addPayment, 'file_name');
							}
						}
					}
				}),
		);
	}

	editFormInitialize() {
		this.subscription.push(
			this.eorService.pullPaymentId().subscribe((paymentId) => {
				
				if (paymentId != 0) {
					this.paymentId = paymentId;
					this.getSignalPaymentId(paymentId);
					this.eorService.pushPaymentId(0)
				}
			}),
		);
	}
	bills: any[] = [];
	bill_details = [];
	isInterest = false;
	media_id:any;
	payments:any=[];
	editBulkPayment(data, id) {
		this.bulkDataOnEdit = true;
		let res = data['result']['data']['payments'];
		this.media_id=res[0]['media_id']?res[0]['media_id']:null;
		res[0]['id']=id;
		this.bill_ids = data['result']['data']['bill_ids'] ? data['result']['data']['bill_ids'] : [];
		this.bill_details = data['result']['data']['bills'] ? data['result']['data']['bills'] : [];
		this.payments = data['result']['data']['payments'] ? data['result']['data']['payments'] : [];
		if(this.payments && this.payments.some(payment=>payment['type_id']==3)){
			this.toastrService.error('Sorry, please delete recent overpayment first, if you want to update this payment.','Error');
			this.btnDisable=true;
		}else{
			this.btnDisable=false;
		}
		if (res && res['length'] == 1) {
			res[0]['interest_amount'] = res[0]['interest_amount']
				? Number(res[0]['interest_amount'])
				: null;
			return new PaymentEditModel(res[0]);
		} else {
			let paymentObj = data['result']['data']['payments'][0];
			let payment = new PaymentEditModel(paymentObj);
			let checkAmount = res.map((res) => Number(res['check_amount']));
			let totalAmount = checkAmount.reduce((a, b) => a + b);
			this.bills = data['result']['data']['bills'];
			payment['id'] = id;
			payment['check_amount'] = totalAmount;
			payment['types'] = [];
			res.filter((obj) => {
				if (obj['type_id'] !== 3) {
					payment['types'].push(obj['type']);
				}
				if (obj['type_id'] == 2) {
					this.isInterest = true;
					payment['interest_amount'] = Number(obj['check_amount']);
				}
			});
			return payment;
		}
	}

	ngSelectionClick() {
		this.paymentTypeRef.nativeElement.click();
		this.paymentByRef.nativeElement.click();
		this.paymentStatusRef.nativeElement.click();
		this.actionTypeRef.nativeElement.click();
	}

	resetPayment() {
		this.addPayment.reset();
		this.payment_TypeClick = false;
		this.payment_ByClick = false;
		this.payment_statusClick = false;
		this.payment_actionClick = false;
		this.fileToUpload = null;
		this.isUploadDisable=false;
		this.btnDisable = false;
		this.paymentId = null;
		let fileName =
			this.billType === 'bulkPayment'
				? this.makeBulkFileName(this.bulkBills)
				: this.makeFileName(this.currentBill);
		this.paymentEditModel = new PaymentEditModel();
		this.setFileName(fileName, this.addPayment, 'file_name');
		if(this.paymentBill=='singleBill'){
			this.billingService.getBillType({})
			this.billType='';
			this.paymentBill='';
			this.isInterest=false;
		}
	}

	viewDocFile(file: any) {
		this.paymentService.viewDocFile(file);
	}
	paymentFormValidation(paymentValidation) {
		switch (paymentValidation) {
			case 'paymentType': {
				this.payment_TypeClick = true;
				break;
			}
			case 'paymentBy': {
				this.payment_ByClick = true;
				break;
			}
			case 'paymentStatus': {
				this.payment_statusClick = true;
				break;
			}
			case 'actionType': {
				this.payment_actionClick = true;
			}
		}
	}

	checkInputs() {
		if (isEmptyObject(this.addPayment.value)) {
			return true;
		}
		return false;
	}

	onItemSelect(item) {}

	formCleanAfterupdateAndSavePayment() {
		this.addPayment.reset();
		this.isUploadDisable=false;
		this.billListingRefresh.next(this.type);
		this.payment_TypeClick = false;
		this.payment_ByClick = false;
		this.payment_statusClick = false;
		this.payment_actionClick = false;
		this.paymentReceptionTypes = [...this.paymentReceptionTypes];
		this.paidbyComingData = [...this.paidbyComingData];
		this.paymentStatusComingData = [...this.paymentStatusComingData];
		this.actionTypeData = [...this.actionTypeData];
		this.fileToUpload = null;
		this.billAmountShow = false;
		this.interestAmountShow = false;
		this.btnDisable = false;
		this.paymentService.reloadPaymentAfterAdd();
	}

	showFieldAction(action: boolean) {
		const types = this.addPayment.get('types').value
			? this.addPayment.get('types').value.length
			: [];
		return this.selectPaymentTypeAction.setActiveFieldBylistOfTypeAndAction(types, action);
	}

	implementValidationOfAmount(item: any) {
		const nameOfField = String(item.name).toLocaleLowerCase();
		if (nameOfField === PaymentBillUrlsEnum.INTEREST) {
			this.addPayment
				.get('interest_amount')
				.setValidators([
					Validators.compose([Validators.required, this.max(999999.99), this.minValidation(0)]),
				]);
		}
	}
	makeFileNameInEdit(data: any, patient: any) {
		if (this.billType !== 'bulkPayment') {
			let name;
			if (this.type === 'bill') {
				name = `Payment_${data['label_id']}_${data['speciality_qualifier']}_${parseFloat(
					data['bill_amount'],
				).toFixed(2)}`;
			} else {
				name = `Payment_${data['invoice_id']}_${data['amount_due']}`;
			}

			return name + '.pdf';
		} 
	}

	changeTheFileNameThroughEdit(currentBill, patient) {
		let fileName = this.makeFileNameInEdit(currentBill, patient);
		this.setFileName(fileName, this.addPayment, 'file_name');
	}
	fileNameSetOnEdit(currentBill: any, patient: any) {
		if (!this.addPayment.value.file_name) {
			this.changeTheFileNameThroughEdit(currentBill, patient);
		}
	}

	getCurrentBillAmount() {
		return this.currentBill.paid_amount != '0.00'
			? this.currentBill.paid_amount
			: this.currentBill.bill_amount;
	}

	getFullyPaidOfBill() {
		return this.currentBill.paid_amount === this.currentBill.bill_amount;
	}

	addOverPayment(currentAmount: number) {
		return (
			this.currentBill.paid_amount != this.currentBill.bill_amount &&
			(currentAmount < this.currentBill.bill_amount || currentAmount < this.currentBill.paid_amount)
		);
	}
	onPaymentInfoDeselect(status){
		if(status=='payment_by'){
		this.addPayment.controls['recipient_id'].setValue(null);
		this.recipientsList=[]
		}
	}
	getPaymentByInfo($event,status?) {
		console.log($event,'event')
		console.log(this.currentBill,'current bill')
		if(status)
			this.onPaymentInfoDeselect('payment_by');
		let data={
			recipient:$event?.name?.toLowerCase()=='attorney'?'firm':$event?.name?.toLowerCase(),
			bill_ids: this.billType=='bulkPayment' && this.paymentBill!='singleBill'? this.bulkBills.map(bill=>bill?.id):(this.type != 'invoice'?[this.paymentBill=='singleBill'?this.bill_ids:(this.currentBill?.bill_id??this.currentBill?.id)]:[]),
			invoice_ids:this.billType!='bulkPayment' && this.type == 'invoice'?[this.currentBill?.invoice_id && !this.currentBill?.invoice_id?.toString().startsWith("INV")  ?this.currentBill?.invoice_id:this.currentBill?.id]:[]
		}
		if(data?.invoice_ids.length){
			delete data?.bill_ids
		}else{
			delete data?.invoice_ids
		}
		this.subscription.push(
		this.paymentService.getPaymentRecipient(data).subscribe((res) => {
			if(res?.status){
				this.recipientsList=res?.result?.data;
				if(this.recipientsList.length==1){
					this.addPayment.controls['recipient_id'].setValue(this.recipientsList);
				}
			}
		})
	)
	}
	getRecipatentName(typeId, paymentByInfoMesg) {
		if (typeId === 1) {
			if (paymentByInfoMesg.first_name) {
				return `${paymentByInfoMesg.first_name} ${
					paymentByInfoMesg.middle_name ? paymentByInfoMesg.middle_name : ''
				} ${paymentByInfoMesg.last_name}`;
			}
		} else if (typeId === 4) {
			return paymentByInfoMesg[0] ? paymentByInfoMesg[0].employer_name : '';
		} else if (typeId === 3) {
			if (paymentByInfoMesg && paymentByInfoMesg.length>0 && paymentByInfoMesg[0]['name']) {
				return `${paymentByInfoMesg[0]['name']}`;
			}
		}
		{
			return paymentByInfoMesg[0] ? paymentByInfoMesg[0].insurance_name : '';
		}
	}
	ngOnDestroy(): void {
		this.bulkBills = [];
		this.billingService.getBillType({});
		// this.resetPayment();
		this.billType = '';
		unSubAllPrevious(this.subscription);
	}
}