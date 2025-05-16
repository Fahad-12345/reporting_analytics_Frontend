import { CustomDiallogService } from './../../../shared/services/custom-dialog.service';
import { StorageData } from './../../../pages/content-pages/login/user.class';
import { ToastrService } from 'ngx-toastr';
import { Page } from '@appDir/front-desk/models/page';
import { PaymentBillUrlsEnum } from '@appDir/payments/payment.enum.urls';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import {
	Component,
	Input,
	OnDestroy,
	OnInit,
	ViewChild,
	EventEmitter,
	Output,
	AfterViewChecked,
	ElementRef,
} from '@angular/core';
import { RequestService } from '@appDir/shared/services/request.service';
import { BillingEnum } from '@appDir/front-desk/billing/billing-enum';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { EORService } from '@appDir/eor/shared/eor.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { PaymentService } from '@appDir/payments/payment.service';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { BillFilterModelQueryPassInApi } from '@appDir/front-desk/billing/Models/bill-filter-model-query-pass-in-api';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { Location } from '@angular/common';
import { removeEmptyAndNullsFormObject, unSubAllPrevious, getExtentionOfFile, isPDF, makeDeepCopyArray, getIdsFromArray } from '@appDir/shared/utils/utils.helpers';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import * as $ from 'jquery';
import { BillingService } from '@appDir/front-desk/billing/service/billing.service';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { calculateTotalAmount } from '@appDir/front-desk/reports/shared/helper';

@Component({
	selector: 'app-payment-list-split',
	templateUrl: './payment-split-listing.component.html',
	styleUrls: ['./payment-split-listing.component.scss'],
})
export class PaymentSplitListComponent implements OnInit, OnDestroy, AfterViewChecked {
	paymentData: any[] = [];
	paymentListTable = true;
	page: Page = new Page();
	amount_calculation: any = {};
	paymentEditList = false;
	paymentEditBulk = false;
	paymentBulkList = true;
	isButton_disable = false;
	selectedBulkBillAmount: any = {};
	limit: number = 10;
	bulkPaymentList: any[] = [];
	subscription: Subscription[] = [];
	bill_ids: number;
	case_ids: any[];
	bulkPayments: any[] = [];
	paymentBill = '';
	paymentId = null;
	types = [];
	bulkBillIndex = 0;
	totalAmountCount: any = {};
	@Input() editForm: boolean;
	@Input() billType = '';
	@Input() type = 'bill';
	@Input() showPaymentColumn: boolean = false;
	@Input() InvoicePaymentColumns: boolean = false;
	@Input() adminBilling: boolean = false;
	@Output() changePaymentData = new EventEmitter();
	@ViewChild('paymenteditModal') public paymenteditModal: ModalDirective;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal: ModalDirective;
	paymentEditModelClosed: NgbModalRef;
	@ViewChild('paymentEditContent') paymentEditContent: any;
	billedPaymentIndex: number = 0;
	@ViewChild('verficationSentTable') verficationSentTable: DatatableComponent;
	loadSpin: boolean = false;
	billingReciptentdata: any[] = [];
	currentBill: any;
	isPaymentTableShow = false;
	@Input() selectedBill: any = {};
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
	isItComeTofilter = true;
	customizedColumnComp: CustomizeColumnComponent;
	@ViewChild(CustomizeColumnComponent) set con(con: CustomizeColumnComponent) {
		if (con) { // initially setter gets called with undefined
			this.customizedColumnComp = con;
		}
	}
	modalCols: any[] = [];
	columns: any[] = [];
	alphabeticColumns: any[] = [];
	colSelected: boolean = true;
	isAllFalse: boolean = false;
	paymentListingTable: any;
	isAmountExceeded = false;
	isAdjustedAmounts = false;
	private paymentAmount = new BehaviorSubject<any>(null);
	enterAmount$ = this.paymentAmount.asObservable()
		.pipe(
			debounceTime(1000)
		);

	constructor(
		private requestService: RequestService,
		private billingService: BillingService,
		private toastrService: ToastrService,
		private storageData: StorageData,
		private eorService: EORService,
		private elementRef: ElementRef,
		private paymentService: PaymentService,
		private modalService: NgbModal,
		private customDiallogService: CustomDiallogService,
		public commonService: DatePipeFormatService,
		private _router: Router,
		private location: Location,
		private toaster: ToastrService,
		private localStorage: LocalStorage
	) { }

	ngOnInit() {
		this.page.size = this.limit;
		this.page.pageNumber = 0;
		this.eorService.pullDoSearch().subscribe((s) => {
			if (s?.status && s?.componet === 'Payment') {
				this.page.pageNumber = 1;
				this.isItComeTofilter = true;
				const result = this.eorService.makeFilterObject(this.eorService.params);
				let param = {
					...result,
					pagination: 1,
					per_page: this.page.size || 10,
					page: 1,
					tabs: 'payment',
				};
				this.page.offset = 0;
				this.changePaymentData.emit(param);
			}
		});

		this.getPaymentThroghSubject();
		this.closePopup();
		this.getBulkBillsData();
		this.bulkPaymentList = [];
		this.bulkPayments = [];
		this.paymentData = [];
		this.subscription.push(
			this.paymentService.bulkObj$.subscribe((response) => {
				this.amount_calculation = response;
				this.paymentId = response['id'];
				this.types = response['types'];
			}),
		);
		if (this.adminBilling) {
			this.paymentListingTable = this.localStorage.getObject('paymentTableList' + this.storageData.getUserId());
		}
		else {
			this.paymentListingTable = this.localStorage.getObject('paymentCaseTableList' + this.storageData.getUserId());
		}
	}
	ngAfterViewInit() {
		if (this.verficationSentTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.verficationSentTable._internalColumns]);
			this.columns.forEach(element => {
				if (this.paymentListingTable.length) {
					let obj = this.paymentListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if (this.paymentListingTable.length) {
				const nameToIndexMap = {};
				this.paymentListingTable.forEach((item, index) => {
					nameToIndexMap[item?.header] = index;
				});
				this.columns.sort((a, b) => nameToIndexMap[a?.name] - nameToIndexMap[b?.name]);
			}
			let columns = makeDeepCopyArray(this.columns);
			this.alphabeticColumns = columns.sort(function (a, b) {
				if (a.name < b.name) { return -1; }
				if (a.name > b.name) { return 1; }
				return 0;
			});
			this.onConfirm(false);
		}
	}
	totalCheckAmount = 0;
	totalInterestAmount = 0;
	runOnce = false;
	ngAfterViewChecked() {
		if (!this.runOnce) {
			const element = this.elementRef.nativeElement.querySelector('.datatable-header-cell[title="Check Balance"]');
			if (element && this.bulkPayments['length']) {
				this.manageCheckAmount();
				this.runOnce = true;
			}
		}
	}
	setFileName() {
		for (let index in this.bulkPayments) {
			if (!this.bulkPayments[index]['file_name']) {
				this.bulkPayments[index]['file_name'] = `payment_${this.bulkPayments[index]['bill_label']}_${this.bulkPayments[index]['outstanding_amount']}`;
			}
		}
	}
	getBulkBillsData() {
		if (this.paymentBill != 'singleBill') {
			this.paymentBulkList = false;
		}
		this.subscription.push(
			this.paymentService.bulkObj$.subscribe((res) => {
				this.selectedBulkBillAmount = res ? res : {};
				if (
					Number(res['check_amount']) == Number(res['interest_amount']) &&
					res['types']['length'] == 1 &&
					res['types'][0] == 'interest'
				) {
					this.totalAmountCount['check_amount'] = Number(res['interest_amount']);
				} else {
					this.totalAmountCount['check_amount'] =
						Number(res['check_amount']) + Number(res['interest_amount']);
				}

				if (this.totalAmountCount?.['types']?.includes('overpayment')) {
					this.totalAmountCount['over_amount'] = Number(res['over_amount']);
				}
			}),
		);
		this.totalAmountCount['check_amount'] = 0;
		this.subscription.push(
			this.paymentService.bulkData$.subscribe((res) => {
				if (res['length']) {
					this.bulkPayments = [];
					for (let item of res) {
						item['over_payment'] = Number(item['over_amount'].toFixed(2))
						item['interest_amount'] = Number(item['interest_amount']).toFixed(2);
						item['paid_amount'] = Number(item['paid_amount']).toFixed(2);
						this.bulkPayments.push(item);
					}
					this.runOnce = false;
				}
				if (this.isPaymentTableShow && this.bulkPayments['length']) {
					this.billType = 'bulkPayment';
					this.isPaymentTableShow = false;
					this.isEditableTableShow = true;
				}
				if (this.bulkPayments['length']) {
					this.paymentBulkList = false;
					this.paymentEditList = true;
					this.paymentListTable = false;
					this.paymentEditBulk = true;
					this.setFileName()
					let checkAmount = this.bulkPayments.map((res) => Number(res.paid_amount));
					let interestAmount = this.bulkPayments.map((res) => Number(res.interest_amount));
					this.totalCheckAmount = checkAmount.reduce((totalAmount, amount) => totalAmount + amount);
					this.totalInterestAmount = interestAmount.reduce(
						(totalAmount, amount) => totalAmount + amount,
					);
				}
			}),
		);
	}

	@Output() moveToInvoiceEmitter = new EventEmitter();
	moveToInvoiceTab() {
		if (this.invicedBill && this.invicedBill['invoice_id']) {
			this.moveToInvoiceEmitter.emit({ invoice_id: this.invicedBill['invoice_id'] });
		}
	}
	changeAmount(type, event?, row?) {
		this.paymentAmount.next(event?.target?.value);
		this.subscription.push(
			this.enterAmount$.subscribe((amount) => {
				if (amount) {
					if (Number(row['paid_amount']) > Number(row['outstanding_amount'])) {
						this.toastrService.error(
							'You can not enter more than outstanding amount',
							'Error'
						);
						let index = this.bulkPayments.findIndex(
							(payment) => payment?.bill_id == row?.bill_id
						);
						if (index > -1) {
							this.bulkPayments[index]['paid_amount'] = 0.0;
						}
					}
				}
				this.manageCheckAmount()
			})
		)
	}

	manageCheckAmount() {
		this.isAmountExceeded = false;
		this.isAdjustedAmounts = false;
		let check = +calculateTotalAmount(this.bulkPayments, 'paid_amount');
		let interest = +calculateTotalAmount(this.bulkPayments, 'interest_amount');
		let overPayment = +calculateTotalAmount(this.bulkPayments, 'over_amount');
		let outstandingAmount = +calculateTotalAmount(this.bulkPayments, 'outstanding_amount');
		this.totalAmountCount['remaining_amount'] =
			this.totalAmountCount['check_amount'] - (check + interest + overPayment);
		this.totalAmountCount['remaining_amount'] = this.totalAmountCount['remaining_amount'].toFixed(2);
		let element = document.querySelector<HTMLElement>('datatable-header-cell[title="Check Balance"]');
		if (Number(this.totalAmountCount['remaining_amount']) == 0) {
			element.setAttribute('style', 'background: #34c3ee!important;width:50%');
			this.selectedBulkBillAmount['interest_amount'] =
				this.selectedBulkBillAmount['interest_amount'] == undefined
					? 0
					: this.selectedBulkBillAmount['interest_amount'];
			this.selectedBulkBillAmount['check_amount'] =
				this.selectedBulkBillAmount['check_amount'] == undefined
					? 0
					: this.selectedBulkBillAmount['check_amount'];
			let totalAmount = check + overPayment;
			if ((this.selectedBulkBillAmount['interest_amount'] != interest.toFixed(2)
				|| this.selectedBulkBillAmount['check_amount'].toFixed(2) != Number(totalAmount.toFixed(2)))
				&& check != 0) {
				this.isButton_disable = true;
				this.isAdjustedAmounts = true;
			}
			else {
				this.isButton_disable = false;
			}
		} else if (Number(this.totalAmountCount['remaining_amount']) < 0) {
			element.setAttribute('style', 'background: red!important;width:50%');
			this.isAmountExceeded = true;
			this.isButton_disable = true;
			this.totalAmountCount['remaining_amount'] = -Number(this.totalAmountCount['remaining_amount']);
		}
		else if (Number(this.totalAmountCount['remaining_amount']) > 0) {
			element.setAttribute('style', 'background: green!important;width:50%');
			this.isButton_disable = true;
		}
	}
	billToPayment: any[] = [];
	bill_id = [];
	invicedBill: any = {};
	getselectedBulkBills(param?) {
		let formData = {};
		formData['bill_ids'] = [];
		if (param) {
			formData['bill_ids'] = [param];
		} else {
			this.subscription.push(
				this.billingService.bills$.subscribe((res) => {
					formData['bill_ids'] = res.map((bill) => bill.id);
				}),
			);
		}
		if (this.bulkPaymentObject['bill_ids'] && this.bulkPaymentObject['bill_ids']['length']) {
			formData['bill_ids'] = this.bulkPaymentObject['bill_ids'];
		}
		this.subscription.push(
			this.requestService
				.sendRequest(PaymentBillUrlsEnum.getBulkBills, 'GET', REQUEST_SERVERS.fd_api_url, formData)
				.subscribe((comingData: any) => {
					if (comingData?.status) {
						let result = comingData['result']['data'];
						if (result && result.length == 1) {
							this.invicedBill = result[0]
						}
						this.billToPayment = result;
						this.bill_id = this.billToPayment[0]['id'];
						this.billingService.getBills(result);
					}
				}),
		),
			(error) => {
				this.toastrService.error(error, 'Error');
			};
	}
	bulkPaymentObject = {};

	fileValidator() {
		let billedBills = [];
		for (let item of this.bulkPayments) {
			let totalAmount = Number(item.over_amount) + Number(item.interest_amount) + Number(item.paid_amount);
			if (item && !item.media_id && totalAmount) {
				billedBills.push(item);
			}
		}
		return billedBills && billedBills.length > 0 ? true : false;
	}


	addBulkPayment(status?) {
		this.loadSpin = true;
		this.isButton_disable = true;
		let updatedPayment: any = {};
		let formData: any = {};
		formData['bills_detail'] = [];
		formData['types'] = [];
		formData['over_amount'] = [];
		if (this.bulkPayments.some(bill => Number(bill?.over_amount) && Number(bill?.paid_amount) < Number(bill?.outstanding_amount))) {
			this.toastrService.error(`Overpayment cannot be added against any bill that has an outstanding amount.`, 'Error');
			this.loadSpin = false;
			return;
		}
		if (this.bulkPayments.every(bill => !Number(bill?.write_off_amount)) && this.amount_calculation?.status_slug == 'write_off') {
			this.toastrService.error(`Write Off amount should be added for at least one bill`, 'Error');
			this.loadSpin = false;
			return;
		}
		if (this.amount_calculation?.status_slug == 'write_off' && this.bulkPayments.some(bill => Number(bill?.write_off_amount) > 0.001 && Number(bill?.outstanding_amount) != +((Number(bill.paid_amount) + Number(bill.write_off_amount)).toFixed(2)))) {
			this.toastrService.error(`The Write Off and Paid amount must be equal to the Outstanding amount.`, 'Error');
			this.loadSpin = false;
			return;
		}
		this.bulkPayments.forEach((payment) => {
			updatedPayment = payment;
			let obj = {
				bill_id: payment.bill_id,
				paid_amount: payment.paid_amount,
				interest_amount: payment.interest_amount,
				over_amount: payment.over_amount,
				write_off_amount: payment?.write_off_amount
			};
			if (!(this.selectedBulkBillAmount && this.selectedBulkBillAmount['media_id'])) {
				obj['media_id'] = payment['media_id']
			} else if (this.bulkPayments.length > 0 && this.bulkPayments[0]['media_id']) {
				obj['media_id'] = payment['media_id'];
			}
			formData['bills_detail'].push(obj);
		});
		formData['upload'] =
			this.selectedBulkBillAmount &&
				this.selectedBulkBillAmount.media_id &&
				!(this.bulkPayments.length > 0 && this.bulkPayments[0]['media_id'])
				? 'auto'
				: 'manual';
		if (formData['upload'] == 'manual' && this.fileValidator()) {
			this.toastrService.error(`Please upload file against bills`, 'Error');
			this.loadSpin = false;
			return;
		}
		this.paymentService.bulkObj$.subscribe((response: any) => {
			this.bulkPaymentObject = response;
			if (Number(updatedPayment?.outstanding_amount) < 1 && response['types'].includes('bill') && !response['types'].includes('overpayment')) {
				formData['types'] = ['overpayment'];
				if (Number(response?.interest_amount) && !response['types'].includes('interest')) {
					formData['types'].push('interest');
				}
				formData['over_amount'] = response['check_amount'];
				formData['check_amount'] = 0;
			} else {
				formData['types'] = response['types'];
				formData['over_amount'] = response['over_amount'];
				formData['check_amount'] = response['check_amount'];
			}
			formData['check_date'] = response['check_date'];
			formData['action_type_id'] = response['action_type_id'];
			formData['check_no'] = response['check_no'];
			formData['by_id'] = response['by_id'];
			formData['interest_amount'] = response['interest_amount'];
			formData['bill_amount'] = response['bill_amount'];
			formData['status_id'] = response['status_id'];
			formData['bill_ids'] = response['bill_ids'];
			formData['current_location_id'] = response['current_location_id'];
			formData['file_name'] = response['file_name'];
			formData['media_id'] = response['media_id'];
			formData['description'] = response['description'];
			formData['recipient_id'] = response['recipient_id'];
			formData['recipient_name'] = response['recipient_name'];
			formData['recipient_slug'] = response['recipient_slug'];
			formData['id'] = response['id'];
			this.bulkPaymentList = [];
			if (Number(formData?.bill_amount) < 1 && formData['types'].includes('bill')) {
				formData['types'].splice(formData['types'].indexOf('bill'), 1);
			}
			if (this.bulkPayments.some(payment => Number(payment?.over_amount) > 0 && !formData['types'].includes('overpayment'))) {
				formData['types'].push('overpayment');
			}
			if (formData['types'].includes('overpayment')) {
				formData['over_amount'] = +calculateTotalAmount(this.bulkPayments, 'over_amount');
			}
		});
		formData['bill_amount']=+calculateTotalAmount(formData['bills_detail'], 'paid_amount');
		if(!formData?.over_amount && formData['types']?.includes('overpayment')){
			const index=formData['types']?.findIndex(type=>type=='overpayment');
			if(index>-1){
				formData['types']?.splice(index,1)
			}
		}
		this.subscription.push(
			this.requestService
				.sendRequest(
					PaymentBillUrlsEnum.addBulkPaymentURL,
					'POST',
					REQUEST_SERVERS.fd_api_url,
					formData,
				)
				.subscribe((comingData: any) => {
					if (comingData?.status) {
						this.toastrService.success(comingData['message'], 'Success');
						this.bulkPaymentList = comingData['result']['data'];
						this.selectedPayments = this.bulkPaymentList;
						this.loadSpin = false;
						this.isButton_disable = false;
						if (this.isEditableTableShow) {
							this.isEditableTableShow = false;
							this.billingService.getBillType({});
							this.billingService.triggerEvent(true);
							this.billType = '';
						}
						this.billingService.triggerEvent(true);
						this.paymentListTable = true;
						this.paymentEditList = false;
						this.paymentEditBulk = false;
						this.paymentBulkList = true;
						this.getselectedBulkBills();
						this.billingService.triggerEvent(true);
						if (status === 'fromPaymentlist') {
							this.paymentEditContent.dismissAll();
						}
						if (status === 'fromPayment') {
							this.showPaymentBills = true;
							this.getPaymentOfBill({
								bill_ids: [this.bill_id],
								per_page: 10,
								pagination: 1,
								page: 1,
							});
						}
					}
				}, (err) => {
					this.loadSpin = false;
				}),
		),
			(error) => {
				this.loadSpin = false;
				this.toastrService.error(error, 'Error');
			};
	}
	resetForm() {
		this.billingService.triggerEvent(true);
		this.billingService.verifiedPayment(false);
		this.billingService.billTypes$.subscribe((res) => {
			this.paymentBill = res['paymentType'];
		});
		if (
			(this.selectedPayments && this.selectedPayments['length']) ||
			(this.paymentsOfBill && this.paymentsOfBill['length'])
		) {
			this.billingService.triggerEvent(true);
		} else {
			this.billingService.triggerEvent(false);
		}
		if (this.paymentBill == 'singleBill') {
			this.billingService.getBillType({});
			this.billType = '';
			this.paymentBill = '';
			this.paymentEditList = false;
			this.paymentListTable = true;
		} else if (this.paymentId) {
			this.paymentBulkList = true;
			this.bulkPaymentList = this.selectedPayments;
			this.paymentsOfBill = this.selectedPayments;
		}
		this.bulkPayments = [];
	}
	sorting({ sorts }) {
		this.page.column = 'check_date';
		this.page.order = sorts[0].dir;
		this.getPaymentInfo(this.paramsObject());
	}
	isEditableTableShow = false;
	paymentsOfBill = [];
	selectedPayments = [];
	getPaymentOfBill(params) {
		this.loadSpin = true;
		this.case_ids = params['case_ids'] ? params['case_ids'] : null;
		const param = removeEmptyAndNullsFormObject(params);
		this.addUrlQueryParams({
			pagination: param.pagination,
			per_page: param.per_page,
			offset: param.offset,
			tabs: param.tabs,
		});

		const paramData = new BillFilterModelQueryPassInApi(param);
		this.page.size = paramData['per_page'];
		paramData['direction'] = this.type == 'invoice' && this.selectedBill.invoice_to ? true : false;
		this.subscription.push(
			this.requestService
				.sendRequest(
					PaymentBillUrlsEnum.getAllPayments,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					removeEmptyAndNullsFormObject(paramData),
				)
				.subscribe(
					(comingData: any) => {
						if (comingData?.status == 200 || comingData?.status == true) {
							this.loadSpin = false;
							this.paymentsOfBill = comingData.result ? [...comingData.result.data] : [];
							this.selectedPayments = this.paymentsOfBill;
							this.page.totalElements = comingData.result.total;
							if (param['offset'] === 0) {
								this.page.offset = 0;
							}
						}
						setTimeout(() => {
							$('datatable-body').scrollLeft(1);
						}, 50);
					},
					(err) => {
						this.loadSpin = false;
					},
				),
		);
	}

	getPaymentInfo(params) {
		this.loadSpin = true;
		this.case_ids = params['case_ids'] ? params['case_ids'] : null;
		const param = removeEmptyAndNullsFormObject(params);
		this.addUrlQueryParams({
			pagination: param.pagination,
			per_page: param.per_page,
			offset: param.offset,
			tabs: param.tabs,
		});
		const paramData = new BillFilterModelQueryPassInApi(param);
		paramData['check_no'] = param['check_no'] ? param['check_no'] : null;
		this.page.size = paramData['per_page'];
		paramData['direction'] = this.type == 'invoice' && this.selectedBill.invoice_to ? true : false;
		this.subscription.push(
			this.requestService
				.sendRequest(
					PaymentBillUrlsEnum.getAllPayments,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					removeEmptyAndNullsFormObject(paramData),
				)
				.subscribe(
					(comingData: any) => {
						if (comingData?.status == 200 || comingData?.status == true) {
							this.loadSpin = false;
							this.paymentData = comingData.result ? [...comingData.result.data] : [];
							this.paymentEditBulk = false;
							this.page.totalElements = comingData.result.total;
							if (param['offset'] === 0) {
								this.page.offset = 0;
							}
						}
						setTimeout(() => {
							$('datatable-body').scrollLeft(1);
						}, 50);
					},
					(err) => {
						this.loadSpin = false;
					},
				),
		);
	}
	showPaymentBills = false;
	closePayment() {
		this.loadSpin = true;
		// this.paymentEditBulk=false;
		// this.paymentEditList=false;
		this.billingService.triggerEvent(true);
		let route = this._router.url.split('/');
		this.getPaymentInfo({ tabs: 'payment', per_page: 10, pagination: 1, page: 1, case_ids: route && route[4] ? [route[4]] : null });
		this.loadSpin = false;
	}
	billId: any;
	onPaymentEdit(row, paymentType?, showBill?, bulkPaymentContent?) {
		this.paymentEditList = false;
		this.paymentListTable = true;
		this.billId = row['bill_id'];
		if (paymentType == 'singleBill' && row['bulk_payment']) {
			this.billingService.getBillType({ billType: 'bulkPayment', paymentType: 'singleBill' });
			this.isPaymentTableShow = true;
		}
		if ((row['bulk_payment'] || paymentType == 'insideBillPayment') && showBill) {
			if (paymentType == 'insideBillPayment') {
				if (row['bulk_payment']) {
					this.billingService.getBillType({ billType: 'bulkPayment', paymentType: 'singleBill' });
				} else {
					this.billingService.getBillType({});
				}
				this.eorService.pushPaymentId(row.id ? row.id : row.payment_id);
				this.getPaymentOfBill({ bill_ids: [row['bill_id']], per_page: 10, pagination: 1, page: 1 });
				this.getselectedBulkBills(row['bill_id']);
			} else {
				const ngbModalOptions: NgbModalOptions = {
					backdrop: 'static',
					keyboard: false,
					windowClass: 'modal_extraDOc payment-modal body-scroll payment-specific-wrapper',
				};
				this.currentBill = row;
				this.modalService.open(bulkPaymentContent, ngbModalOptions);
				this.eorService.pushPaymentId(row.id ? row.id : row.payment_id);
				// this.billingService.getBillType({});
				this.getPaymentOfBill({ bill_ids: [row['bill_id']], per_page: 10, pagination: 1, page: 1 });
				this.getselectedBulkBills(row['bill_id']);
			}
		} else {
			const ngbModalOptions: NgbModalOptions = {
				backdrop: 'static',
				keyboard: false,
				windowClass: 'modal_extraDOc body-scroll',
			};
			this.isItComeTofilter = false;
			row.invoice_id ? (this.type = 'invoice') : (this.type = 'bill');
			this.eorService.pushPaymentId(row.id ? row.id : row.payment_id);
			if (this.editForm) {
				this.currentBill = row;
				this.paymentEditModelClosed = this.modalService.open(
					this.paymentEditContent,
					ngbModalOptions,
				);
			}
			// this.eorService.pushPaymentId(0);
		}
	}

	viewDocFile(row) {
		if (row && row.media && row.media.pre_signed_url) {
			window.open(row.media.pre_signed_url);
		}
	}
	ViewDocBulkPayment(row) {
		if (row && row?.media_id && row?.media?.pre_signed_url) {
			window.open(row.media.pre_signed_url);
		}
	}

	getLinkwithAuthToken(link) {
		let token = this.storageData.getToken();
		if (token) {
			return `${link}&token=${token}`;
		} else {
			return link;
		}
	}


	getExtentionOfFile = getExtentionOfFile;
	fileToUpload: File = null;
	handleFileInput(files: FileList, row) {
		if (files.length > 0) {
			if (this.getExtentionOfFile(files.item(0).name) == '.pdf') {
				this.fileToUpload = files.item(0);
				this.uploadFileOfBill(row);
			} else {
				this.toastrService.error('Please select  pdf file');
			}
		}
	}
	uploadFileDetail: any;
	uploadFileOfBill(params?) {
		this.loadSpin = true;
		if (this.fileToUpload && !isPDF(this.fileToUpload['type'])) {
			this.toastrService.error('Upload only Pdf File');
			this.loadSpin = false;
			return false;
		}

		if (this.fileToUpload) {
			let formData: any = new FormData();
			formData.append('file', this.fileToUpload);
			formData.append('bill_ids', params['bill_id']);
			this.subscription.push(
				this.requestService
					.sendRequest(BillingEnum.uploadMediaPayment, 'POST', REQUEST_SERVERS.fd_api_url, formData)
					.subscribe(
						(comingData: any) => {
							if (comingData?.status == 200 || comingData?.status == true) {
								this.uploadFileDetail = comingData['data'];
								this.loadSpin = false
								for (let index in this.bulkPayments) {
									if (
										params['bill_id'] == this.bulkPayments[index]['bill_id']
									) {
										this.bulkPayments[index]['media_id'] =
											this.uploadFileDetail['id'];
									}
								}
							}
						},
						(err) => {
							this.loadSpin = false;
							return false;
						},
					),
			);
		}
		else {
			this.loadSpin = false;
		}
	}
	onDeletePayment(row, status?) {
		let param = {
			ids: this.billType === 'bulkPayment' ? [row.id] : [row.payment_id],
		};
		this.isItComeTofilter = false;
		if (row['bulk_payment']) {
			param['flag'] = 1;
			this.subscription.push(
				this.requestService
					.sendRequest(
						PaymentBillUrlsEnum.PaymentDelete,
						'delete_with_body',
						REQUEST_SERVERS.fd_api_url,
						param,
					)
					.subscribe(
						(res: any) => {
							this.customDiallogService
								.confirm('Delete Payment', res['message'])
								.then((confirmed) => {
									if (confirmed) {
										param['flag'] = 0;
										this.subscription.push(
											this.requestService
												.sendRequest(
													PaymentBillUrlsEnum.PaymentDelete,
													'delete_with_body',
													REQUEST_SERVERS.fd_api_url,
													param,
												)
												.subscribe(
													(res: any) => {
														const result = this.eorService.makeFilterObject(this.eorService.params);
														if (res?.status) {
															let params = {
																...result,
																pagination: 1,
																per_page: this.page.size,
																page: this.page.pageNumber,
															};
															this.resetForm();
															this.changePaymentData.emit(params);
															this.paymentService.reloadPaymentAfterAdd();
															this.paymentService.pushResetForm(true);
															this.eorService.pushPaymentId(0);
															this.getselectedBulkBills();
															this.toastrService.success(res.message, 'Success');
															this.paymentListTable = false;
															this.paymentEditBulk = false;
															this.paymentBulkList = false;
															if (this.billType === 'bulkPayment') {
																this.bulkPaymentList = [];
																this.paymentsOfBill = [];
																this.billingService.getPayments({ payments: this.bulkPaymentList, status: true })
																this.billingService.triggerEvent(false);
															}
															if (status == 'formpaymentBill') {
																this.getPaymentOfBill({
																	bill_ids: [this.bill_id],
																	per_page: 10,
																	pagination: 1,
																	page: 1,
																});
															}
														}
													},
													(error) => {
														// this.toastrService.error(error.error.message, 'Error');
													},
												),
										);
									}
								})
								.catch();
						},
						(error) => {
							// this.toastrService.error(error.error.message, 'Error');
						},
					),
			);
			return;
		} else {
			this.customDiallogService
				.confirm(
					'Delete Payment',
					'All payments against this cheque will be deleted, are you sure you want to delete this?',
				)
				.then((confirmed) => {
					if (confirmed) {
						this.subscription.push(
							this.requestService
								.sendRequest(
									PaymentBillUrlsEnum.PaymentDelete,
									'delete_with_body',
									REQUEST_SERVERS.fd_api_url,
									param,
								)
								.subscribe(
									(res: any) => {
										const result = this.eorService.makeFilterObject(this.eorService.params);
										if (res?.status) {
											let params = {
												...result,
												pagination: 1,
												per_page: this.page.size,
												page: this.page.pageNumber,
											};
											// this.page.offset = 0;
											this.changePaymentData.emit(params);
											this.paymentService.reloadPaymentAfterAdd();
											this.paymentService.pushResetForm(true);
											this.getselectedBulkBills();
											this.toastrService.success(res.message, 'Success');
											if (this.billType === 'bulkPayment') {
												this.bulkPaymentList = [];
												this.bulkPayments = [];
											}
										}
									},
									(error) => {
										// this.toastrService.error(error.error.message, 'Error');
									},
								),
						);
					}
				})
				.catch();
		}
	}

	pageLimit($event) {
		this.page.size = Number($event);
		this.page.pageNumber = 1;
		this.page.offset = 0;
		this.getPaymentInfo(this.paramsObject());
	}

	onPageChange(pageInfo) {
		this.page.offset = pageInfo.offset;
		this.page.pageNumber = pageInfo.offset + 1;
		this.loadSpin = true;
		this.getPaymentInfo(this.paramsObject());
	}

	getPaymentThroghSubject() {
		this.loadSpin = true;
		if (!this.editForm) {
			this.subscription.push(
				this.paymentService.pullReloadPayment().subscribe((id) => {
					this.bill_ids = id ? id : null;
					if (id != 0) {
						this.type === 'bill' ||
							this.selectedBill.bill_recipients ||
							(this.type === 'bill' && this.selectedBill.bill_recipients)
							? this.getPaymentInfo({
								pagination: 1,
								per_page: 10,
								page: 1,
								bill_ids: this.selectedBill.id ? this.selectedBill.id : id,
							})
							: this.getPaymentInfo({ pagination: 1, per_page: 10, page: 1, invoice_ids: id });
						this.page.offset = 0;
					}
				}),
			);
		}
	}

	paramsObject() {
		const result = this.eorService.makeFilterObject(this.eorService.params);
		let params = {
			per_page: this.page.size,
			pagination: 1,
			tabs: 'payment',
			page: this.page.pageNumber,
			order: this.page.order,
			column: this.page.column,
			...result,
		};
		if (this.bill_ids) {
			params['bill_ids'] = this.bill_ids;
		}
		if (this.case_ids) {
			params['case_ids'] = this.case_ids;
		}
		return params;
	}

	closePopup() {
		this.subscription.push(
			this.paymentService.pullPaymentEditPopup().subscribe((status) => {
				if (status) {
					this.refreshAfterUpdateDataByTab();
					// this.paymentEditModelClosed?this.paymentEditModelClosed.dismiss():'';
				}
			}),
		);
	}

	refreshAfterUpdateDataByTab() {
		this.loadSpin = true;
		// this.page.pageNumber = 1;
		// this.page.offset = 0;
		const result = this.eorService.makeFilterObject(this.eorService.params);
		let params = {
			...result,
			pagination: 1,
			per_page: this.page.size,
			page: this.isItComeTofilter ? 1 : this.page.pageNumber,
		};
		this.paymentEditModelClosed ? this.paymentEditModelClosed.dismiss() : '';
		this.changePaymentData.emit(params);
		this.loadSpin = false;
	}

	openReciptentModal(row, reciptentModal) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: '',
		};
		this.modalService.open(reciptentModal, ngbModalOptions);
		this.currentBill = row;
		this.billingReciptentdata = row.bill.bill_recipients;
	}

	getRecipatentName(row, singleRow?) {
		if (row.invoice_id) {
			return `${row.name}`;
		} else {
			if (row.recipient && row.bill_recipient_type_id === 4) {
				return `${row.bill_recipient_type_id === 4 && singleRow.firm_name ? singleRow.firm_name : ''
					}`;
			} else if (row.recipient && row.bill_recipient_type_id === 1) {
				return `${row.recipient.first_name} ${row.recipient.middle_name ? row.recipient.middle_name : ''
					} ${row.recipient.last_name}`;
			} else if (row.recipient && row.bill_recipient_type_id === 2) {
				return row.recipient.employer_name;
			} else {
				return row.recipient ? row.recipient.insurance_name : '';
			}
		}
	}

	expandBulkTable(row, rowIndex, expanded) {
		row['expanded'] = !expanded;
		this.bulkBillIndex = rowIndex;
		this.verficationSentTable.rowDetail.toggleExpandRow(row);
	}
	getBulkBills(event) {
		this.loadSpin = true;
		let params = {
			id: this.bulkPaymentList[this.bulkBillIndex]['id'],
		};
		this.subscription.push(
			this.requestService
				.sendRequest(
					PaymentBillUrlsEnum.getBulkchildBills,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					params,
				)
				.subscribe((res) => {
					if (res?.status) {
						this.bulkPaymentList[this.bulkBillIndex].bulkBills =
							res.result && res.result.data ? res.result.data : res.result;
						this.loadSpin = false;
					}
				}),
		),
			(error) => {
				this.loadSpin = false;
				this.toastrService.error(error, 'Error');
			};
	}
	getBillsPayment($event) {
		this.loadSpin = true;
		let params = {
			check_no:
				$event &&
					$event.value &&
					$event.value.invoice &&
					$event.value.invoice.invoice_category == 'invoice_for_bill'
					? $event.value.check_no
					: null,
			invoice_id: $event.value.invoice.id,
			type_id: $event.value.type_id,
			pagination: 1,
			per_page: 10,
		};
		this.subscription.push(
			this.requestService
				.sendRequest(
					PaymentBillUrlsEnum.getPaymentsOfBill,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					params,
				)
				.subscribe((res) => {
					if (res?.status) {
						this.paymentData[this.billedPaymentIndex].paidBills =
							res.result && res.result.data ? res.result.data : res.result;
						this.loadSpin = false;
					}
				}),
		),
			(error) => {
				this.loadSpin = false;
				this.toastrService.error(error, 'Error');
			};
	}
	paymentSubTable(row, rowIndex, expanded) {
		row['expanded'] = !expanded;
		this.billedPaymentIndex = rowIndex;
		this.verficationSentTable.rowDetail.toggleExpandRow(row);
	}
	// BELOW UN_USED CODE
	paymentEditActiveOnNotActive(row) {
		if (row.payment_status_name != 'Write-Off') {
			return false;
		} else {
			return true;
		}
	}
	// BELOW UN_USED CODE
	paymentEditToolTipMessage(row) {
		if (row.payment_status_name != 'Write-Off') {
			return 'Edit';
		} else {
			return 'You are unable to edit this bill please delete it and add a new payment.';
		}
	}

	/**
	 * Queryparams to make unique URL
	 * @param params
	 * @returns void
	 */
	addUrlQueryParams(params: any): void {
		this.location.replaceState(this._router.createUrlTree([], { queryParams: params }).toString());
	}
	ngOnDestroy(): void {
		this.paymentData = [];
		this.paymentId = null;
		unSubAllPrevious(this.subscription);
	}


	historyStats(row) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc body-scroll history-modal',
			modalDialogClass: 'modal-lg'
		};
		let modelRef = this.modalService.open(CreatedHistoryComponent, ngbModalOptions);
		modelRef.componentInstance.createdInformation = [row];
		modelRef.componentInstance.modalInstance = modelRef;
	}
	openCustomoizeColumn(CustomizeColumnModal) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal-lg-package-generate',
		};
		this.modalCols = [];
		let self = this;
		this.columns.forEach(element => {
			let obj = self.alphabeticColumns.find(x => x?.name === element?.name);
			if (obj) {
				this.modalCols.push({ header: element?.name, checked: obj?.checked });
			}
		});
		this.CustomizeColumnModal.show();
	}

	onConfirm(click) {
		if (this.isAllFalse && !this.colSelected) {
			this.toastrService.error('At Least 1 Column is Required.', 'Error');
			return false;
		}
		if (click) {
			this.customizedColumnComp;
			this.modalCols = makeDeepCopyArray(this.customizedColumnComp?.modalCols)
			let data: any = [];
			this.modalCols.forEach(element => {
				if (element?.checked) {
					data.push(element);
				}
				let obj = this.alphabeticColumns.find(x => x?.name === element?.header);
				if (obj) {
					if (obj.name == element.header) {
						obj.checked = element.checked;
					}
				}
			});
			if (this.adminBilling) {
				this.localStorage.setObject('paymentTableList' + this.storageData.getUserId(), data);
			}
			else {
				this.localStorage.setObject('paymentCaseTableList' + this.storageData.getUserId(), data);
			}
		}
		let groupByHeaderCol = getIdsFromArray(this.modalCols, 'header'); // pick header
		this.columns.sort(function (a, b) {
			return groupByHeaderCol.indexOf(a.name) - groupByHeaderCol.indexOf(b.name);
		});
		//set checked and unchecked on the base modal columns in alphabeticals columns
		this.alphabeticColumns.forEach(element => {
			let currentColumnIndex = findIndexInData(this.columns, 'name', element.name)
			if (currentColumnIndex != -1) {
				this.columns[currentColumnIndex]['checked'] = element.checked;
				this.columns = [...this.columns];
			}
		});
		// show only those columns which is checked
		let columnsBody = makeDeepCopyArray(this.columns);
		this.verficationSentTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.verficationSentTable._internalColumns.sort(function (a, b) {
			return groupByHeader.indexOf(a.name) - groupByHeader.indexOf(b.name);
		});
		window.dispatchEvent(new Event('resize'));
		this.CustomizeColumnModal.hide();
	}

	onCancel() {
		this.CustomizeColumnModal.hide();
	}

	onSelectHeaders(isChecked) {
		this.colSelected = isChecked;
		if (!isChecked) {
			this.isAllFalse = true;
		}
	}

	onSingleSelection(isChecked) {
		this.isAllFalse = isChecked;
		if (isChecked) {
			this.colSelected = false;
		}
	}
}
