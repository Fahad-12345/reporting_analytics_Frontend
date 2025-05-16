import { InvoiceFormatLoadComponent } from './../../../invoice/shared/invoice-split-listing/invoice-format-load/invoice-format-load.component';
import { Socket } from 'ngx-socket-io';
import { BillistingFilterComponent } from './../billisting-filter/billisting-filter.component';
import { CustomDiallogService } from './../../../shared/services/custom-dialog.service';
import { StorageData } from './../../../pages/content-pages/login/user.class';
import { PaymentFormComponent } from './../../../payments/shared/payment-form/payment-form/payment-form.component';
import { DenialSplitListComponent } from './../../../denial/shared/denial-split-listing/denial-split-listing.component';
import { DenialFormComponent } from './../../../denial/shared/denial-form/denial-form/denial-form.component';
import { EorFormComponent } from './../../../eor/shared/eor-form/eor-form/eor-form.component';
import { EorSplitListComponent } from './../../../eor/shared/eor-split-listing/eor-split-listing.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import {
	Component,
	OnInit,
	ViewChild,
	OnDestroy,
	EventEmitter,
	Input,
	Output,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { NgbModalRef, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators, NgModelGroup } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { Page } from '@appDir/front-desk/models/page';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';;
import { ToastrService } from 'ngx-toastr';
import { AclService } from '@appDir/shared/services/acl.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';

import { CaseStatusUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/CaseStatus-Urls-Enum';
import {
	removeEmptyKeysFromObject,
	changeDateFormat,
	allTheSame,
	makeDeepCopyObject,
	getIdsFromArray,
	removeDups,
	removeObjectProperties,
	getObjectChildValue,
	unSubAllPrevious,
	removeEmptyAndNullsArraysFormObject,
	checkReactiveFormIsEmpty,
	isObjectEmpty,
	removeDuplicates,
	makeDeepCopyArray,
} from '@appDir/shared/utils/utils.helpers';
import { Location, LocationStrategy } from '@angular/common';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { BillingEnum, ch_billing_typs_enum } from '../billing-enum';
import { CreateBillModalComponent } from '../shared-components/create-bill-modal/create-bill-modal.component';
import { CommentsModalComponent } from '@appDir/shared/components/case-comments/case-comments.component';
import { EORService } from '@appDir/eor/shared/eor.service';
import { DenialService } from '@appDir/denial/denial.service';
import { isEmptyObject } from '@appDir/shared/utils/utils.helpers';
import { PaymentSplitListComponent } from '@appDir/payments/shared/payment-split-listing/payment-split-listing.component';
import { PaymentService } from '@appDir/payments/payment.service';
import { VerificationService } from '@appDir/verification/verification.service';
import { VerificationBillEnum } from '@appDir/verification/verification-bill-enum';
import { VerificationFilterListingViewComponent } from '@appDir/verification/verification-filter-listing-view/verification-filter-listing-view.component';
import { findIndexInData, isObject } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { EorBillUrlsEnum } from '@appDir/eor/eor-bill.url.enum';
import { UserByModel } from '@appDir/eor/Models/user-by-model';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { BillingFilterModel } from '../Models/billing-filter-model';
import { BillRecptent } from '../Models/billing.model';
import { BillFilterModelQueryParamField } from '../Models/bill-filter-model-query-param-field';
import { BillFilterModelQueryPassInApi } from '../Models/bill-filter-model-query-pass-in-api';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { BillingService } from '../service/billing.service';
import { InvoiceSplitListingComponent } from '@appDir/invoice/shared/invoice-split-listing/invoice-split-listing.component';
import { InvoiceFormComponent } from '@appDir/invoice/shared/invoice-form/invoice-form.component';
import { environment } from 'environments/environment';
import { EorFilterComponent } from '@appDir/eor/shared/eor-filters/eor-filter.component';
import { InvoiceBuilderComponent } from '@appDir/front-desk/masters/builder-invoice/invoice-builder/invoice-builder.component';
import { InvoiceBillEnum } from '@appDir/invoice/shared/invoice-bill-enum';
import { InvoiceService } from '@appDir/invoice/shared/invoice.service';
import { take } from 'rxjs/operators';
import { sharedUrlsEnum } from '@appDir/front-desk/fd_shared/components/shareFileUpload/shared-file-upload/shared-file-Urls-enum';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { ClearinghouseEnum } from '@appDir/front-desk/masters/billing/clearinghouse/CH-helpers/clearinghouse';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { HttpResponse } from '@angular/common/http';

@Component({
	selector: 'app-bill-listing',
	templateUrl: './bill-listing.component.html',
	styleUrls: ['./bill-listing.component.scss'],
})
export class BillListingComponent extends PermissionComponent implements OnInit, OnDestroy {
	currentVerificationRecived: any = {};
	@ViewChild('invoiceFormatsModal') invoiceFormatLoadModal: ModalDirective;
	// @ViewChild('InvoiceBuilderContent') InvoiceBuilderContentModal:ModalDirective;
	@ViewChild('pdfViewModal') invoiceShowsPdfDetails: any;
	@ViewChild('caseCommentsModal') caseCommentsModal: ModalDirective;
	eventOnRemoveBill = new Subject<any>();
	commentComponent: CommentsModalComponent;
	templateId: any;
	billType = '';
	latestBills: any;
	environment = environment;
	// bills: any[] = [];
	@ViewChild('caseComments') set caseCommentsContent(content: CommentsModalComponent) {
		if (content) {
			// initially setter gets called with undefined
			this.commentComponent = content;
		}
	}

	eorSplitListComponent: EorSplitListComponent;
	@ViewChild('eorSplitListComponent') set setEorComp(content: EorSplitListComponent) {
		if (content) {
			// initially setter gets called with undefined
			this.eorSplitListComponent = content;
		}
	}
	invoiceBuilderComponent: InvoiceBuilderComponent;
	@ViewChild('invoiceBuilderComponentDetailsComponent') set setInvoiceBuilderCo(
		content: InvoiceBuilderComponent,
	) {
		if (content) {
			// initially setter gets called with undefined
			this.invoiceBuilderComponent = content;
		}
	}

	paymentSplitList: PaymentSplitListComponent;
	@ViewChild('paymentSplitList') set setPaymentComp(content: PaymentSplitListComponent) {
		if (content) {
			// initially setter gets called with undefined
			this.paymentSplitList = content;
		}
	}

	denailListComponent: DenialSplitListComponent;
	@ViewChild('denailListComponent') set setDenialComp(content: DenialSplitListComponent) {
		if (content) {
			// initially setter gets called with undefined
			this.denailListComponent = content;
		}
	}
	invoiceListingComponent: InvoiceSplitListingComponent;
	@ViewChild('invoiceListingComponent') set setInvoiceComp(content: InvoiceSplitListingComponent) {
		if (content) {
			// initially setter gets called with undefined
			this.invoiceListingComponent = content;
		}
	}
	invoiceFormComponent: InvoiceFormComponent;
	@ViewChild('invoiceFormComponent') set setinvoiceForm(content: InvoiceFormComponent) {
		if (content) {
			// initially setter gets called with undefined
			this.invoiceFormComponent = content;
		}
	}
	invoiceFormatLoadComponent: InvoiceFormatLoadComponent;
	@ViewChild('invoiceFormatLoad') set invoiceFormatLoadContent(
		content: InvoiceFormatLoadComponent,
	) {
		if (content) {
			// initially setter gets called with undefined
			this.invoiceFormatLoadComponent = content;
		}
	}

	eorFormComponent: EorFormComponent;
	@ViewChild('eorFormComponent') set setEorForm(content: EorFormComponent) {
		if (content) {
			// initially setter gets called with undefined
			this.eorFormComponent = content;
		}
	}

	paymentFormComponent: PaymentFormComponent;
	@ViewChild('paymentFormComponent') set setPaymentForm(content: PaymentFormComponent) {
		if (content) {
			// initially setter gets called with undefined
			this.paymentFormComponent = content;
		}
	}

	denialFormComponent: DenialFormComponent;
	@ViewChild('denialFormComponent') set setdenialForm(content: DenialFormComponent) {
		if (content) {
			// initially setter gets called with undefined
			this.denialFormComponent = content;
		}
	}

	billListFilterComponent: BillistingFilterComponent;
	@ViewChild('billListFilterComponent') set setBillListFilter(content: BillistingFilterComponent) {
		if (content) {
			// initially setter gets called with undefined
			this.billListFilterComponent = content;
		}
	}

	verificationListComponent: VerificationFilterListingViewComponent;
	@ViewChild('verificationListComponent') set setVerificationComp(
		content: VerificationFilterListingViewComponent,
	) {
		if (content) {
			// initially setter gets called with undefined
			this.verificationListComponent = content;
		}
	}

	billingFilterComponents: BillistingFilterComponent;
	@ViewChild('billingFilterComponents') set setBillingFilterComponent(
		content: BillistingFilterComponent,
	) {
		if (content) {
			// initially setter gets called with undefined
			this.billingFilterComponents = content;
		}
	}
	eorbillFilterComponent: EorFilterComponent;
	@ViewChild('eorbillFilterComponent') set setEorbillFilterComponent(content: EorFilterComponent) {
		if (content) {
			// initially setter gets called with undefined
			this.eorbillFilterComponent = content;
		}
	}
	denialbillFilterComponent: EorFilterComponent;
	@ViewChild('denialbillFilterComponent') set setDenialbillFilterComponent(
		content: EorFilterComponent,
	) {
		if (content) {
			// initially setter gets called with undefined
			this.denialbillFilterComponent = content;
		}
	}
	paymentbillFilterComponent: EorFilterComponent;
	@ViewChild('paymentbillFilterComponent') set setPaymentbillFilterComponent(
		content: EorFilterComponent,
	) {
		if (content) {
			// initially setter gets called with undefined
			this.paymentbillFilterComponent = content;
		}
	}
	verificationbillFilterComponent: EorFilterComponent;
	@ViewChild('verificationbillFilterComponent') set setVerificationbillFilterComponent(
		content: EorFilterComponent,
	) {
		if (content) {
			// initially setter gets called with undefined
			this.verificationbillFilterComponent = content;
		}
	}
	currentBill: any = {};
	selectedBill: any = {};
	billDetailTotal: any;
	allBillEventData: any[] = [];
	overAllTableChecked: boolean = false;

	@ViewChild('paymentModal') paymentModal: ModalDirective;
	@ViewChild('denialModal') denialModal: ModalDirective;
	@ViewChild('eorModal') eorModal: ModalDirective;
	@ViewChild('recipientsModal') recipientsModal: any;
	@ViewChild('verificaitionSentContent') verificaitionSentContent: any;
	verificationModelClosed: NgbModalRef;
	@ViewChild('tabset') tabset: TabsetComponent;
	currentCaseId: number;
	facilityId;
	billingReciptentdata: any[] = [];
	bill_ids: any[] = [];
	selectedRecpitents: BillRecptent[] = [];
	updateBillListOfDetails: any[] = [];
	@Input() adminBilling: boolean = false;
	@Output() updateGenertePacket = new EventEmitter();
	selectedInvoiceObject: any;
	paymentInstanceType: string = 'bill';

	subscription: Subscription[] = [];
	status: boolean = true;
	loadSpin: boolean = false;
	modalRef: NgbModalRef;
	disableBtn: boolean = false;
	modelTitle: string = 'Add';
	modelSubmit: string = 'Save';
	searchForm: FormGroup;
	billComingData: any[] = [];
	billSelection: any = new SelectionModel<Element>(true, []);
	billTotalRows: number;
	billform: FormGroup; // edit form for bill Status
	page: Page;
	BillDetailpage: Page;
	billQueryParams: ParamQuery;
	isCollapsed = false;
	errorMessage: string;
	urlParams: any;
	rows: [];
	exchangeData: any[] = [];
	billingDetails: any[] = [];
	caseId: number;
	ispatient: boolean = false;
	isEmployer: boolean = false;
	isInsurance: boolean = false;
	isLawyer: boolean = false;
	patienDocument: any;
	employerDocument: any = [];
	currentBills: any = [];
	InsuranceDocument: any;
	AttorneyDocument: any;
	multipleInsuranceDocument: any = [];
	lstInsurance: any[] = [];
	lstspecalities: any = [];
	lstAttorney: any = [];
	lstUser: any = [];
	lstBillstate: any = [];
	caseIds: any = [];
	denialStatusList: any[] = [];
	eorStatusList: any[] = [];
	verificationStatusList: any[] = [];
	paymentStatusList: any[] = [];
	providerList: any[] = [];
	caseTypeLists: any[] = [];
	patientNameLists: any[] = [];
	patientIdLists: any[] = [];
	@ViewChild('documenttable') documenttable: CreateBillModalComponent;
	DATEFORMAT = EorBillUrlsEnum.DATE_FORMAT;
	lstpractiseLocation: any[] = [];
	genertePacketScreen: boolean = false;
	filterResponse: any;
	invoiceIdFromPayment;
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
	formFiledValue: any;
	formFiledListOfValue: any;
	tabsAction: string;
	tabsQueryParam: any;
	removeQueryParam: boolean;
	actionNameOfGenrate: string;
	attorney_firm_name;
	invoiceId: number;
	selected_bills: any[] = [];
	e_bills_list: any[] = [];
	manual_selected = false;
	getFieldAction(status: boolean, name: string) {
		this.eorService.updateFilterField(status, name);
	}

	currentBillId: number;
	selectedBills: any[] = [];
	selectedFacilityId: any;
	dateRangeValidator: any[] = [
		Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
		Validators.maxLength(10),
	];
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal: ModalDirective;
	@ViewChild('maintable') billingListTable: DatatableComponent;
	customizedColumnComp: CustomizeColumnComponent;
	@ViewChild(CustomizeColumnComponent) set con(con: CustomizeColumnComponent) {
		if (con) { // initially setter gets called with undefined
			this.customizedColumnComp = con;
		}
	}
	modalCols: any[] = [];
	columns: any[] = [];
	columnsBill: any[] = [];
	columnsBillReports: any[] = [];
	alphabeticColumns: any[] = [];
	colSelected: boolean = true;
	isAllFalse: boolean = false;
	billListTable: any;
	skipLoader: boolean = false;
	sharedData: any;
	queryParam: any[] = [];
	disablePat: boolean = true;
	disableEmp: boolean = true;
	disableIns: boolean = true;
	disableFirm: boolean = true;
	disableDateRange: boolean = false;
	includesAny: boolean = false;
	selCols: any[] = [];
	facilityFilter: any;
	eBillEnum: number;
	source: string = "./../../../../../assets/icons/move-bill.svg";
	
	constructor(
		private fb: FormBuilder,
		private modalService: NgbModal,
		private storageData: StorageData,
		private toastrService: ToastrService,
		public aclService: AclService,
		protected requestService: RequestService,
		private _route: ActivatedRoute,
		private _router: Router,
		titleService: Title,
		private location: Location,
		private locationStratgy: LocationStrategy,
		public eorService: EORService,
		private denialService: DenialService,
		private paymentService: PaymentService,
		private verificationService: VerificationService,
		private CanDeactivateModelComponentService: CanDeactivateModelComponentService,
		public commonService: DatePipeFormatService,
		private customDiallogService: CustomDiallogService,
		private billingService: BillingService,
		public socket: Socket,
		public invoiceService: InvoiceService,
		private localStorage: LocalStorage
	) {
		super(aclService, _router, _route, requestService, titleService);
		this.page = new Page();
		this.page.pageNumber = 0;
		this.page.size = 10;
		const routeId = Number(this.router.url.split('/')[4]);
		this.caseId = routeId ? routeId : null;
	}

	ngOnInit() {
		this.eBillEnum = ch_billing_typs_enum.e_bill;
		this.setTitle();
		this.searchForm = this.initializeSearchForm();
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				const tabs = params['tabs'];
				if (typeof tabs === 'string') {
					this.includesAny = ['eor', 'denial', 'verification', 'payment', 'invoice'].some(term => tabs.includes(term));
				}else{
					this.includesAny = false;
				}
				this.genertePacketScreen = params.generate_packet ? params.generate_packet : false;
				this.updateGenertePacket.emit(this.genertePacketScreen);
				this.formFiledListOfValue = new BillFilterModelQueryParamField(params);
				this.formFiledValue = new BillFilterModelQueryPassInApi(params);
				const billingFilter = new BillingFilterModel(params);
				this.selectedRecpitents = billingFilter.recipients;
				this.urlParams = params;
				this.searchForm = this.initializeSearchForm();
				this.searchForm.patchValue(this.formFiledValue);
				this.page.pageNumber = parseInt(params.page) || 1;
				this.page.size = parseInt(params.per_page) || 10;
				let removeProps = ['recipients'];
				params = removeObjectProperties(makeDeepCopyObject(params), removeProps);
				this.setpage({ offset: this.page.pageNumber - 1 || 0 }, params, true);
			}),
		);
		this._route.snapshot.pathFromRoot.forEach((path) => {
			!this.caseId ? (this.caseId = getObjectChildValue(path, null, ['params', 'caseId'])) : null;
		});
		this.billform = this.fb.group({
			id: [''],
			name: ['', Validators.required],
			description: [''],
			comments: [''],
		});
		this.socket.on('PUSHEDINOTIFICATION', (message) => {
			if (message) {
				if (message?.status_code === 406)
					this.toastrService.error(message?.message, 'Error');
				else
					this.toastrService.success(message?.message, 'Success');
				if (message?.refresh) {
					this.setpage({ offset: this.page.pageNumber });
				}
			}
		});
		if (this.adminBilling) {
			if (!this.genertePacketScreen) {
				this.billListTable = this.localStorage.getObject('billTableList' + this.storageData.getUserId());
			}
			else if (this.genertePacketScreen) {
				this.billListTable = this.localStorage.getObject('billSpecialtyReportTableList' + this.storageData.getUserId());
			}
		}
		else {
			this.billListTable = this.localStorage.getObject('billCaseTableList' + this.storageData.getUserId());
		}
	}

	updateDateFields(): void {
		const currentDate = new Date();
		const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
		this.searchForm.patchValue({
		  bill_date_range1: this.formatDate(firstDayOfMonth),
		  bill_date_range2: this.formatDate(currentDate),
		});
		this.sharedData = this.searchForm;
	}
	
	formatDate(date: Date): string {
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const day = date.getDate().toString().padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	infoMessage(){
		if(this.adminBilling && !this.genertePacketScreen){
			this.toastrService.info("Displaying current month's bills. Use filters to change `Bill Date` range.",'Info');
		}
	}

	showTable: boolean = false;
	ngAfterViewInit() {
		this.showTable = true;
		this._route.queryParams.subscribe((params) => {
			this.formFiledListOfValue = new BillFilterModelQueryParamField(params);
			this.formFiledValue = new BillFilterModelQueryPassInApi(params);
			this.tabsQueryParam = '';
			this.removeQueryParam = false;
			if (params.tabs && params.tabs === 'eor') {
				this.tabsAction = 'eor';
				this.tabsQueryParam = params;
				this.goto(1);
			} else if (params.tabs && params.tabs === 'denial') {
				this.tabsAction = 'denial';
				this.tabsQueryParam = params;
				this.goto(2);
			} else if (params.tabs && params.tabs === 'verification') {
				this.tabsAction = 'verification';
				this.tabsQueryParam = params;
				this.goto(3);
			} else if (params.tabs && params.tabs === 'payment') {
				this.tabsAction = 'payment';
				this.tabsQueryParam = params;
				this.goto(4);
			} else if (params.tabs && params.tabs === 'invoice') {
				this.tabsAction = 'invoice';
				this.tabsQueryParam = params;
				this.goto(5);
			} else {
				this.removeQueryParam = true;
				this.goto(0);
				this.billingFilterComponents ? this.billingFilterComponents.getCaseTypeList() : null;
			}
		});
		this.tableColumns();
	}

	tableColumns() {
		if (this.adminBilling) {
			if (!this.genertePacketScreen) {
				this.billListTable = this.localStorage.getObject('billTableList' + this.storageData.getUserId());
			}
			else if (this.genertePacketScreen) {
				this.billListTable = this.localStorage.getObject('billSpecialtyReportTableList' + this.storageData.getUserId());
			}
		}
		else {
			this.billListTable = this.localStorage.getObject('billCaseTableList' + this.storageData.getUserId());
		}
		if (this.billingListTable?._internalColumns) {
			if (this.adminBilling) {
				if (!this.genertePacketScreen) {
					this.columnsBill = makeDeepCopyArray(this.columnsBill?.length ? [...this.columnsBill] : [...this.billingListTable._internalColumns]);
					this.columnsBill.forEach(element => {
						if (this.billListTable.length) {
							let obj = this.billListTable.find(x => x?.header === element?.name);
							obj ? element['checked'] = true : element['checked'] = false;
						}
						else {
							element['checked'] = true;
						}
					});
					if (this.billListTable.length) {
						const nameToIndexMap = {};
						this.billListTable.forEach((item, index) => {
							nameToIndexMap[item?.header] = index;
						});
						this.columnsBill.sort((a, b) => nameToIndexMap[a?.name] - nameToIndexMap[b?.name]);
					}
					let columns = makeDeepCopyArray(this.columnsBill);
					this.alphabeticColumns = columns.sort(function (a, b) {
						if (a.name < b.name) { return -1; }
						if (a.name > b.name) { return 1; }
						return 0;
					});
				}
				else if (this.genertePacketScreen) {
					this.columnsBillReports = makeDeepCopyArray(this.columnsBillReports?.length ? [...this.columnsBillReports] : [...this.billingListTable._internalColumns]);
					this.columnsBillReports.forEach(element => {
						if (this.billListTable.length) {
							let obj = this.billListTable.find(x => x?.header === element?.name);
							obj ? element['checked'] = true : element['checked'] = false;
						}
						else {
							element['checked'] = true;
						}
					});
					if (this.billListTable.length) {
						const nameToIndexMap = {};
						this.billListTable.forEach((item, index) => {
							nameToIndexMap[item?.header] = index;
						});
						this.columnsBillReports.sort((a, b) => nameToIndexMap[a?.name] - nameToIndexMap[b?.name]);
					}
					let columns = makeDeepCopyArray(this.columnsBillReports);
					this.alphabeticColumns = columns.sort(function (a, b) {
						if (a.name < b.name) { return -1; }
						if (a.name > b.name) { return 1; }
						return 0;
					});
				}
			}
			else {
				this.columns = makeDeepCopyArray(this.columns?.length ? [...this.columns] : [...this.billingListTable._internalColumns]);
				this.columns.forEach(element => {
					if (this.billListTable.length) {
						let obj = this.billListTable.find(x => x?.header === element?.name);
						obj ? element['checked'] = true : element['checked'] = false;
					}
					else {
						element['checked'] = true;
					}
				});
				if (this.billListTable.length) {
					const nameToIndexMap = {};
					this.billListTable.forEach((item, index) => {
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
			}
			this.selCols = this.billListTable?.length ? this.billListTable : [];
			this.customizeColumnsForCSV();
			this.onConfirm(false);
		}
	}
	/**
	 * Initialize 'case status' search form
	 * @param void
	 * @returns FormGroup
	 */
	initializeSearchForm(): FormGroup {
		return this.fb.group({
			// case_id: [null],
			provider_ids: [null],
			denial_status_ids: [null],
			denial_type_ids: [null],
			eor_status_ids: [null],
			verification_status_ids: [null],
			payment_status_ids: [null],
			bill_amount_from: [null],
			bill_amount_to: [null],
			bill_ids: null,
			case_ids: [null],
			doctor_ids: [null],
			bill_date: [null, this.dateRangeValidator],
			date_of_accident_from: [null, this.dateRangeValidator],
			date_of_accident_to: [null, this.dateRangeValidator],
			speciality_ids: [null],
			insurance_ids: [null],
			claim_no: [null],
			attorney_ids: [null],
			bill_amount: [null],
			bill_status_ids: [null],
			created_by_ids: [null],
			updated_by_ids: [null],
			patient_ids: [null],
			patient_name: [null],
			case_type_ids: [null],
			appointment_type_ids: [null],
			facility_ids: [null],
			firm_ids: [null],
			bill_recipient_type_ids: [null],
			employer_ids: [null],
			bill_date_range2: [null, this.dateRangeValidator],
			bill_date_range1: [null, this.dateRangeValidator],
			name: [null],
			created_at: [null, this.dateRangeValidator],
			updated_at: [null, this.dateRangeValidator],
			visit_date_range_2: [null, this.dateRangeValidator],
			visit_date_range_1: [null, this.dateRangeValidator],
			clearing_house_ids: [null],
			payer_ids: [null],
			ebill_status_ids: [null],
			bill_type_ids: [null]
		});
	}

	resetCase() {
		this.searchForm = this.initializeSearchForm();
		this.billSelection.clear();
		this.setpage({ offset: 0 },null,true);
		this.billform = this.fb.group({
			id: [''],
			name: ['', Validators.required],
			description: ['', Validators.required],
			comments: [''],
		});
	}

	checkInputs() {
		if (isEmptyObject(this.searchForm.value)) {
			return true;
		}
		return false;
	}
	/**
	 * Compare checkbox selection and length of data coming from server and return boolean
	 * @param void
	 * @returns boolean
	 */

	isbillAllSelected(): boolean {
		this.billTotalRows = this.billComingData.length;
		const numSelected = this.allBillEventData.length;
		const numRows = this.billTotalRows;
		return numSelected === numRows;
	}
	recipientValidation() {
		let bills = [];
		let getBills = [];
		for (let item of this.allBillEventData) {
			if (item && item['bill_recipients']) {
				getBills = item.bill_recipients.map((x) => x.recipient_type_slug);
				bills.push(getBills);
			}
		}
		let result = bills.reduce((x, y) => x.filter((z) => y.includes(z)));
		this.billingService.recipients = result;
		return result && result.length ? true : false;
	}

	resetSelectedRecord($event?) {
		if (this.adminBilling) {
			this.caseId = null;
		}
		this.allBillEventData = [];
		this.overAllTableChecked = false;
		this.facilityFilter = null;
	}
	restoreBills(event) {
		if (event && this.allBillEventData) {
			let index = this.allBillEventData.findIndex(bill => bill['id'] == event['id']);
			if (index > -1) {
				this.allBillEventData.splice(index, 1);
				this.eventOnRemoveBill.next(event);
			}
		}
	}

	updateBillCount($event) {
		let valuesBills: any[] = $event
		this.billComingData.forEach((value, index) => {
			if (valuesBills.filter(bill => bill.id == value.id).length > 0) {
				value['checkBoxChecked'] = true;
			}
			else {
				value['checkBoxChecked'] = false;
			}

		});
	}
	generatePacket() {
				this.loadSpin = true;
				const queryParams = {};
				queryParams['bill_ids'] = this.allBillEventData.map(bill => bill.id)
				this.subscription.push(
					this.requestService
						.sendRequest(
							BillingEnum.GeneartePacket,
							'GET',
							REQUEST_SERVERS.fd_api_url,
							removeEmptyKeysFromObject(queryParams)
						).subscribe(res => {
							if (res.status == 200) {
								this.loadSpin = false;
								this.toastrService.success(res?.message, 'Success')
							}
						}, err => {
							this.loadSpin = false;
						})
				)
	}
	getEmitData(event) {
		let param = {
			order: OrderEnum.ASC,
			pagination: 1,
			per_page: this.page.size,
			page: this.page.pageNumber,
			// case_ids:this.caseId?[this.caseId]:null,
		}
		const paramDataFilter = new BillFilterModelQueryPassInApi(this.searchForm.value);
		param = {
			...param,
			...paramDataFilter
		}
		this.dispalyUpdatedbill(param);
	}
	addBulkPayment(bulkPaymentModel) {
		if (this.allBillEventData && this.allBillEventData.length > 1 && this.allBillEventData.some(bill => bill['facility_id'] != this.allBillEventData[0]['facility_id'])) {
			this.toastrService.error(
				'Practice should be same for selected bills to add bulk payment',
				'Error',
			);
			return;
		}
		let bills = this.allBillEventData.filter(bill => bill['invoice_id']);
		if (bills && bills['length']) {
			this.toastrService.error(
				`Invoice is already generated for these bills ${bills.map(x => x['label_id'])}, Please unselect this bill to add bulk payment`,
				'Error',
			);
			return;
		}
		if (!this.recipientValidation()) {
			this.toastrService.error(
				'Recipient should be same for selected bills to add bulk payment',
				'Error',
			);
			return;
		}
		this.billingService.getBillType({ billType: 'bulkPayment' });
		this.currentBills = this.allBillEventData;
		this.billingService.triggerEvent(false)
		this.billType = 'bulkPayment';
		this.paymentInstanceType = 'bill';
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc payment-modal body-scroll payment-specific-wrapper',
		};
		this.modalService.open(bulkPaymentModel, ngbModalOptions);
	}


	selectBill(row) {
		// const bill = this.bills.find((bill) => bill.id === row.id);
		// if (bill) {
		// 	this.bills.splice(this.bills.indexOf(row), 1);
		// } else {
		// 	this.bills.push(row);
		// }
		// this.billingService.getBills(this.bills);
	}
	getSelectedBills() {
		// this.subscription.push(
		// 	this.latestBills=this.billingService.bills$.subscribe((res) => {
		// 		this.billSelection['_selected'] = res['length'] ? res : this.billSelection['_selected'];
		// 		this.bills = res ? res : this.bills;
		// 		this.billingService['selected_bills'] = this.billSelection['_selected'];
		// 		this.billComingData.forEach((row) => {
		// 			if (this.bills.some((res) => row.id === res.id)) {
		// 				this.billSelection.select(row);
		// 			}
		// 		});
		// 		this.billSelection['_selected'] = this.bills;
		// 	}),
		// );
	}
	/**
	 * Invoke isbillAllSelected method and perform operation its return value
	 * @param void
	 * @returns void
	 */


	removeDuplicatesObject(arr, key): Array<any> {

		if (key && typeof key === 'string') {
			return arr.filter(function (obj, index, arr) {
				return arr.map(function (mapObj) {
					return mapObj[key];
				}).indexOf(obj[key]) === index;
			});
		} else {
			return arr.filter(function (item, index, arr) {
				return arr.indexOf(item) == index;
			});
		}
	}
	checkedProp = 'checkBoxChecked';
	filterProp = "id";
	checkedSingle($event, row, rowIndex) {
		let self = this;
		this.overAllTableChecked = false;

		if ($event.target.checked == true) {
			this.allBillEventData.push(row);
			row.checkBoxChecked = false;
			this.billComingData[rowIndex][self.checkedProp] = true;
			this.allBillEventData = this.removeDuplicatesObject(this.allBillEventData, this.filterProp);
			this.add_Remove_E_Bills(row, true);
		}
		else {
			this.billComingData[rowIndex].checkBoxChecked = false;
			for (let i = 0; i < this.allBillEventData.length; i++) {
				if (this.allBillEventData[i][this.filterProp] == row[this.filterProp]) {
					this.allBillEventData.splice(i, 1);
					this.e_bills_list.splice(i, 1);
					this.add_Remove_E_Bills(null, true)
				}
			}

			// for (let i = 0; i < this.selectedDocumentCollection.length; i++) {
			//   if (this.selectedDocumentCollection[i][this.filterProp] == row[this.filterProp]) {
			//     this.selectedDocumentCollection.splice(i, 1);
			//   }
			// }

		}
		this.allBillEventData = this.removeDuplicatesObject(this.allBillEventData, this.filterProp);
		this.billingService.getBills(this.allBillEventData);
		this.billingService['selected_bills'] = this.allBillEventData;
		// this.emitEvent('selectedRows', this.allBillEventData);
	}
	add_Remove_E_Bills(bill?, single?: boolean) {
		if (bill) {
			this.e_bills_list.push(bill);
		}
		else if (!single) {
			this.e_bills_list = [...this.allBillEventData];
		}
		this.manual_selected = this.e_bills_list.every(bill => bill.bill_type == ch_billing_typs_enum.e_bill);
	}
	PushToClearinghouse(row?, isEbill?: boolean, ev?) {
		if (isEbill == false) {
			ev.stopPropagation();
			return;
		}
		let bills = row ? this.formatBills([row]) : this.formatBills(this.e_bills_list)
		let body = {
			bills: bills
		}
		if (bills.length) {
			this.SendToCh(body);
		}
	}
	formatBills(bills) {
		bills?.forEach(obj => {
			obj['insurance_id'] = obj?.bill_recipients?.map(bill_reciept => bill_reciept?.bill_recipient_id)[0]
		});
		return bills.map(element => {
			return {
				bill_id: element?.id,
				bill_recipient_id: element?.insurance_id
			}
		});

	}
	SendToCh(queryParams?) {
		this.loadSpin = true;
		this.subscription.push(
			this.requestService.sendRequest(
				ClearinghouseEnum.Push_To_Clearinghouse, 'post', REQUEST_SERVERS.fd_api_url, { socket_id: this.socket?.ioSocket?.id, ...queryParams })
				.subscribe((res) => {
					this.loadSpin = false;
					if (res['status']) {
						this.toastrService.success(res['message'], 'Success');
					}
				}, err => {
					this.loadSpin = false;
				})
		)
	}
	bulkMoveToManual(row?, isEbill?: boolean, ev?) {		
		if (isEbill == false) {
			ev.stopPropagation();
			return;
		}
		if (row?.e_bill_status === 'Sent'){
			this.toastrService.error('The selected E-Bill have sent status.', 'Error');
			return;
		}
		if (this.e_bills_list.some(obj => obj?.e_bill_status === 'Sent')) {
			this.toastrService.error('One or more E-Bills have sent status.', 'Error');
			return;
		}
		let bills = row ? [row?.id] : this.e_bills_list.map(obj => obj?.id);
		let body = bills;

		if (bills.length) {
			this.bulkMoveToManualApi(body);
		}
	}
	bulkMoveToManualApi(queryParams?) {
		this.loadSpin = true;
		let body = {
			bill_ids: queryParams
		}
		this.subscription.push(
			this.requestService.sendRequest(
				ClearinghouseEnum.Update_Bills_Status, 'put', REQUEST_SERVERS.fd_api_url, body )
				.subscribe((res) => {
					this.loadSpin = false;
					if (res['status']) {
						this.toastrService.success(res['message'], 'Success');
						res['result']['data'].forEach((dataObject) => {
							this.billComingData.forEach((billComingObject) => {
							  if (dataObject?.id === billComingObject?.id) {
								billComingObject.bill_status_name = dataObject?.bill_status; // update the bill status
								billComingObject.bill_status_id = dataObject?.bill_status_id;
								billComingObject.bill_type = dataObject?.bill_type;
								billComingObject.checkBoxChecked = false;
								this.e_bills_list = [];
								this.allBillEventData = [];

							  }
							});
						  });
					}
				}, err => {
					this.loadSpin = false;
				})
		)
	}
	billsmasterToggle(event): void {
		// this.isbillAllSelected()
		// 	? this.billSelection.clear()
		// 	: this.billComingData
		// 			.slice(0, this.billTotalRows)
		// 			.forEach((row) => this.billSelection.select(row));
		// if (event.checked) {
		// 	this.billComingData.forEach((res) => {
		// 		let bill = this.bills.find((bil) => bil.id === res.id);
		// 		if (!bill) {
		// 			this.bills.push(res);
		// 		}
		// 	});
		// } else {
		// 	this.billComingData.forEach((res) => {
		// 		let index = this.bills.findIndex((bill) => bill.id === res.id);
		// 		if (index > -1) {
		// 			this.bills.splice(index, 1);
		// 		}
		// 	});
		// }
		// this.billingService.getBills(this.bills);
	}
	/**
	 * Checked search form is empty or not and queryparams set for pagination
	 * @param pageInfo : any
	 * @returns void
	 */
	setpage(pageInfo: any, paramInfo?: any, showMessage?: boolean): void {
		this.removeQueryParam = true;
		this.overAllTableChecked = false;
		this.selected_bills = [];
		this.e_bills_list = [];
		this.billSelection.clear();
		this.page.pageNumber = pageInfo.offset;
		const pageNumber = this.page.pageNumber + 1;
		const filters = paramInfo ? paramInfo : checkReactiveFormIsEmpty(this.searchForm);
		this.caseId;
		if (!this.adminBilling) {
			this.getBillDetailTotalCase();
		}
		if(this.adminBilling && !this.genertePacketScreen && !this.disableDateRange && showMessage && !this.includesAny){
			this.infoMessage();
			this.updateDateFields();
			this.allBillEventData = [];
		}
		this.billQueryParams = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.DEC,
			per_page: this.page.size || 10,
			page: pageNumber,
			pagination: true,
			bill_date_range1: this.searchForm.get('bill_date_range1').value || null,
			bill_date_range2: this.searchForm.get('bill_date_range2').value || null
		};
		let per_page = this.page.size;
		let queryparam = { per_page, page: pageNumber };
		if (!(pageInfo?.generate_packet)) {
			this.addUrlQueryParams({ ...filters, ...queryparam });
		}
		const paramDataFilter = new BillFilterModelQueryPassInApi(filters);
		if (!this.adminBilling) {
			this.billQueryParams['case_ids[]'] = this.caseId;
		}
		this.dispalyUpdatedbill({
			...this.billQueryParams,
			...removeEmptyAndNullsArraysFormObject(paramDataFilter),
		});
	}

	/**
	 * Queryparams to make unique URL
	 * @param params
	 * @returns void
	 */
	addUrlQueryParams(params: any): void {
		this.location.replaceState(this._router.createUrlTree([], { queryParams: params }).toString());
	}

	/**
	 * Dropdown selection how much data user want in listing
	 * @params $num: string
	 * @returns void
	 */
	pageLimit($num: string): void {
		this.page.size = Number($num);
		this.billSelection.clear();
		this.setpage({ offset: 0 });
	}

	/**
	 * Used method in setPage and perform GET request to receive data
	 * @param queryParams: any
	 * @returns void
	 */
	openInvoiceBuilderEvent($event, invoiceContent) {
		this.templateId = $event.id;
		this.selectedBills = $event.bill_ids;
		this.selectedFacilityId = $event.facility_id;
		this.currentCaseId = $event.case_id;
		this.invoiceFormatLoadModal.hide();
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc payment-modal body-scroll',
		};
		this.modalService.open(invoiceContent, ngbModalOptions);
	}

	dispalyUpdatedbill(queryParams: any): void {
		this.genertePacketScreen ? queryParams['bill_to'] = 'bill_to' : queryParams['created_bill'] = true;
		this.loadSpin = this.skipLoader ? false : true;
		this.disableDateRange = false;
		this.subscription.push(
			this.requestService
				.sendRequest(
					BillingEnum.getBillListing,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					removeEmptyKeysFromObject(queryParams),
				)
				.subscribe(
					(comingData: any) => {
						this.loadSpin = false;
						this.skipLoader = false;
						if (comingData['status'] == 200 || comingData['status'] == true) {
							this.billComingData = comingData.result ? comingData.result.data : [];
							this.billComingData.forEach(row => {
								for (let i of this.allBillEventData) {
									if (i.id == row.id) {
										row.checkBoxChecked = true;
									}
									else {

									}									//	row.checkBoxChecked = false;
								}
								row.visit_sessions = row?.visit_sessions?.filter(
									(obj, index, self) => index === self.findIndex((key) => key?.appointment_type?.id === obj?.appointment_type?.id)
								);

								if(this.genertePacketScreen){
									const createdByFullName = [
										row.created_by_name?.first_name,
										row.created_by_name?.middle_name,
										row.created_by_name?.last_name
									].filter(namePart => namePart).join(' ');
									
									row.created_by_full_name = createdByFullName;
								}
							})
							this.page.totalElements = comingData.result.total;
							this.page.totalPages = this.page.totalElements / this.page.size;
							//this.getSelectedBills();
						}
						setTimeout(() => {
							$('datatable-body').scrollLeft(1);
						}, 50);
						this.tableColumns();
					},
					(error) => {
						this.loadSpin = false;
						this.toastrService.error(error.message || 'Something went wrong.', 'Failed');
					},
				),
		);
	}
	/**
	 * Create new payment-type
	 * @param form  FormGroup
	 * @returns void
	 */
	createbillFormSubmit(form: FormGroup): void {
		this.loadSpin = true;
		if (this.billform.valid) {
			this.subscription.push(
				this.requestService
					.sendRequest(
						CaseStatusUrlsEnum.CaseStatus_list_POST,
						'POST',
						REQUEST_SERVERS.fd_api_url,
						form,
					)
					.subscribe(
						(response: any) => {
							this.loadSpin = false;
							if (response.status === 200 || response.status == true) {
								this.billSelection.clear();
								this.billform.reset();
								this.setpage({ offset: this.page.pageNumber });
								this.toastrService.success('Record Created Successfully!', 'Success');
							} else {
								this.loadSpin = false;
								this.toastrService.error(response.message, 'Failed');
							}
						},
						(err) => {
							this.loadSpin = false;
							// const str = parseHttpErrorResponseObject(err.error.message);
							// this.toastrService.error(str);
						},
					),
			);
			this.billform.reset();
			this.modalRef.close();
		}
	}

	/**
	 * Patch values on edit click
	 * @param row : any
	 * @param rowIndex : number
	 * @returns void
	 */

	patchEditValues(row: any, rowIndex: number): void {
		this.modelSubmit = 'Update';
		this.modelTitle = 'Edit';
		// this.billform.get('name').disable();
		this.billform.patchValue({
			id: row.id,
			name: this.billComingData[rowIndex].name,
			description: this.billComingData[rowIndex].description,
			comments: this.billComingData[rowIndex].comments,
		});
	}

	/**
	 * Patch heading and save button text
	 * @param void
	 * @returns void
	 */
	patchAddValues(): void {
		this.billform.reset();
		this.billform.get('name').enable();
		this.modelSubmit = 'Save';
		this.modelTitle = 'Add';
	}

	/**
	 * Open Modal and patch values new or updating
	 * @param editablebillform ModalReference
	 * @param row any (optional)
	 * @param rowIndex: number (optional)
	 * @returns void
	 */
	openbillModal(editablebillform, row: any, rowIndex: number) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc',
		};
		if (row == undefined || row == null) {
			this.patchAddValues();
		} else {
			this.patchEditValues(row, rowIndex);
		}
		this.modalRef = this.modalService.open(editablebillform, ngbModalOptions);
	}

	/**
	 * Method to Update
	 * @param form FormGroup
	 * @returns void
	 */
	updatebillFormSubmit(form: FormGroup): void {
		if (this.billform.valid) {
			this.loadSpin = true;
			this.subscription.push(
				this.requestService
					.sendRequest(
						CaseStatusUrlsEnum.CaseStatus_list_PUT,
						'PUT',
						REQUEST_SERVERS.fd_api_url,
						form,
					)
					.subscribe((response: any) => {
						if (response.status === 200 || response.status == true) {
							this.loadSpin = false;
							this.billSelection.clear();
							this.billform.reset();
							this.setpage({ offset: this.page.pageNumber });
							this.toastrService.success('Record Updated Successfully!', 'Success');
						} else {
							this.loadSpin = false;
							this.toastrService.error(response.message, 'Failed');
						}
					}),
			);
			this.modalRef.close();
		}
	}

	/**
	 * Send request to server new creating and updating
	 * @param form FormGroup
	 * @returns void
	 */

	onCaseSubmit(form: FormGroup): void {
		if (this.modelTitle == 'Add') {
			this.createbillFormSubmit(removeEmptyKeysFromObject(form));
		} else {
			this.updatebillFormSubmit(removeEmptyKeysFromObject(form));
		}
	}

	/**
	 * CloseModal and ask user to fill data or not
	 * @param void
	 * @returns void | boolean
	 */
	closeModel(): void | boolean {
		if (this.billform.dirty && this.billform.touched) {
			this.CanDeactivateModelComponentService.canDeactivate().then((res) => {
				if (res) {
					this.billform.reset();
					this.modalRef.close();
				} else {
					return true;
				}
			});
		} else {
			this.billform.reset();
			this.modalRef.close();
		}
	}

	/**
	 * A library method takes an object and converts into string and return
	 * @param obj
	 * @returns string
	 */
	billstringfy(obj: any): string {
		return JSON.stringify(obj);
	}

	/**
	 * LifeCycle hook method unsubscribe all Observables to prevent from memory leakage
	 * @param void
	 * @returns void
	 */
	ngOnDestroy(): void {
		this.billingDetails = [];
		this.billingService.getBills([]);
		this.multipleInsuranceDocument = [];
		this.employerDocument = [];
		unSubAllPrevious(this.subscription);
		this.socket.removeListener('PUSHEDINOTIFICATION')
	}

	getCommentsBilling(row, actions?) {

		let billingCommentCategoryObject = this.commentComponent.categories.find(category => category.slug === "billing");
		this.commentComponent.selectedCategories = [billingCommentCategoryObject];
		let selectedCategory = billingCommentCategoryObject;
		if (selectedCategory && selectedCategory.id) {
			this.commentComponent.addCategoryList = [selectedCategory.id];
		}

		this.commentComponent.presentPage = 1;
		this.commentComponent.showCategory = true;
		this.commentComponent.form.controls['object_id'].setValue(row.id);
		this.commentComponent.objectId = row.id;
		this.commentComponent.label = row?.label_id;
		this.currentBillId = row.id;
		this.commentComponent.comments = [];
		this.currentCaseId = row.case_id;
		this.commentComponent.slug = 'billing';
		this.commentComponent.getComments(1, this.currentCaseId);
		let data = { bill_id: row.id };
		this.socket.emit('GETCASECOMMENTS', data);
		this.caseCommentsModal.show();
	}

	getSingleBill(row, model?: NgbModalRef, action?: string) {
		if (row?.e_bill_status === 'Sent' && action === 'edit') {
			this.toastrService.error(`Unable to update E-Bill with status ${row?.e_bill_status}`, 'Error');
			return
		}
		this.loadSpin = true;
		this.subscription.push(
			this.requestService
				.sendRequest(BillingEnum.getSingleBill, 'get', REQUEST_SERVERS.fd_api_url, { id: row.id, isCPT: action == 'edit' ? true : false })
				.subscribe((response: any) => {
					if (response.status === 200 || response.status == true) {
						let row = response['result']['data'];
						this.caseId = row.case_id;
						if (row['visit_sessions'] && row['visit_sessions'].length) {
							let formate = row['visit_sessions'].filter((m) => (m['kiosk_case'] = row.kiosk_case));
							formate = formate.filter((m) => (m['speciality'] = row.speciality));
							model ? this.billDetailsModel(model, formate, row) : '';
							action ? this.billEditModel(formate, row) : '';
							!model && !action ? this.createBill(formate, row) : '';
						}
					}
					else {
						this.loadSpin = false;

						this.toastrService.error(response.message, 'Failed');
					}
					this.loadSpin = false;
				}),
		);
	}
	id: number;
	getBillDocuments(row) {
		this.loadSpin = true;
		this.subscription.push(
			this.requestService
				.sendRequest(BillingEnum.getBillDocuments, 'get', REQUEST_SERVERS.fd_api_url, {
					id: row.id,
				})
				.subscribe((response: any) => {
					if (response.status === 200 || response.status == true) {
						this.id = response['result']['data']['label_id'];
						this.openBillPdfListing(
							response['result']['data'] && response['result']['data']['bill_recipients']
								? response['result']['data']['bill_recipients']
								: [],
							response['result'] && response['result']['data'] ? response['result']['data'] : {},
						);
					}
					else {
						this.loadSpin = false;
						this.toastrService.error(response.message, 'Failed');
					}
					this.loadSpin = false;
				}),
		);
	}
	createBill(visitlisting, billDetail) {
		let ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			size: 'lg',
			windowClass: 'modal_extraDOc create-bill-modal body-scroll',
		};
		let modalRef = this.modalService.open(CreateBillModalComponent, ngbModalOptions);
		modalRef.componentInstance.visitList = visitlisting;
		this.billingService.setBillListing(visitlisting);
		modalRef.componentInstance.billDetail = billDetail;
		modalRef.componentInstance.modalRef = modalRef;
		modalRef.componentInstance.caseId = this.caseId;
		modalRef.componentInstance.isBillingDetail = true;
	}
	billEditModel(visitlisting, billDetail) {
		let ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			size: 'lg',
			windowClass: 'modal_extraDOc create-bill-modal body-scroll',
		};
		let modalRef = this.modalService.open(CreateBillModalComponent, ngbModalOptions);
		modalRef.componentInstance.visitList = visitlisting;
		this.billingService.setBillListing(visitlisting);
		modalRef.componentInstance.billDetail = billDetail;
		modalRef.componentInstance.modalRef = modalRef;
		modalRef.componentInstance.caseId = this.caseId;
		modalRef.componentInstance.editBill = true;
		// modalRef.result.then(res => { this.setpage({ offset: this.page.pageNumber }); })
		modalRef.result.then((result) => {
			if (result) {
				this.setpage({ offset: this.page.pageNumber });
			}
		});
	}
	modalReference: NgbModalRef;
	/**
	 * open listing
	 * @param model
	 */
	openBillPdfListing(data, billDocumentObj?) {
		this.setTabs(data, billDocumentObj);
		let ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			size: 'lg',
			windowClass: 'modal_extraDOc create-bill-modal',
		};
		this.modalReference = this.modalService.open(this.documenttable, ngbModalOptions);
	}
	setTabs(Data, billDocumentObj?) {
		Data.forEach((element) => {
			element['recipient_type_name'] == 'patient' ? (this.patienDocument = element) : '';
			element['recipient_type_name'] == 'patient' ? (this.ispatient = true) : false;
			element['recipient_type_name'] == 'employer' ? this.employerDocument.push(element) : '';
			element['recipient_type_name'] == 'employer' ? (this.isEmployer = true) : false;
			element['recipient_type_name'] == 'attorney' ? (this.AttorneyDocument = element) : '';
			element['recipient_type_name'] == 'attorney' ? this.setLawerInfo(billDocumentObj) : false;
			element['recipient_type_name'] == 'insurance' ? (this.InsuranceDocument = element) : '';
			element['recipient_type_name'] == 'insurance' ? (this.isInsurance = true) : false;
			element['recipient_type_name'] == 'insurance'
				? this.multipleInsuranceDocument.push(element)
				: '';
		});
	}
	setLawerInfo(billDocumentObj) {
		this.isLawyer = true;
		this.attorney_firm_name =
			billDocumentObj && billDocumentObj['firm_name'] ? billDocumentObj['firm_name'] : '';
	}
	billDetailmodalReference: NgbModalRef;
	alllist: any;
	totalAmount: number = 0;
	/**
	 * open listing
	 * @param model
	 */
	billDetailsModel(model, visitliating, alldetail) {
		this.alllist = alldetail;
		this.billingDetails = visitliating;
		visitliating.filter((m) => {
			this.totalAmount = this.totalAmount + m['visit_charges'];
		});

		let ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			size: 'lg',
			windowClass: 'modal_extraDOc create-bill-modal',
		};
		this.billDetailmodalReference = this.modalService.open(model, ngbModalOptions);
		// this.expandAllRows()
	}
	/**
	 *  BELOW UN USED CODE
	 */
	deleteBillRecord(row) {
		this.subscription.push(
			this.requestService
				.sendRequest(BillingEnum.deleteBillListing, 'Delete', REQUEST_SERVERS.fd_api_url, {
					id: row.id,
				})
				.subscribe((response: any) => {
					if (response.status === 200 || response.status == true) {
						this.toastrService.error(response.message, 'Delete');
						this.setpage({ offset: this.page.pageNumber });
					} else {
						this.loadSpin = false;
						this.toastrService.error(response.message, 'Failed');
					}
				}),
		);
	}
	@ViewChild('myTable') table: any;
	/**
	 *  BELOW UN USED CODE
	 */
	toggleExpandRow(row) {
		this.table.rowDetail.toggleExpandRow(row);
	}
	/**
	 * API method to expand all the rows.
	 */

	/**
	 *  BELOW UN USED CODE
	 */
	expandAllRows(): void {
		this.table.rowDetail.expandAllRows();
	}
	onDetailToggle(event) { }
	changeDocumentPageNumber() { }
	generatePDF() { }
	generateBillEnvelopePacketPom($event, packetContent?) {
		let facility_id;
		let type: string = '';
		let billIds: any[] = [];
		let speciality_id;
		let speciality_name;
		let doctor_id;
		let bill_status_id: number;
		let case_type_id: number;
		let billUpdateStatus: boolean = false;
		let case_id;
		let updatedBillList: any[] = [];
		if (isObject($event) && $event?.fromVerification) {
			this.allBillEventData = [];
			this.allBillEventData.push({ ...$event });
		}
		if (isObject($event)) {
			type = $event.type;
			billIds = [$event.bill_id];
			facility_id = [$event.facility_id];
			speciality_id = [$event.speciality_id];
			doctor_id = [$event.doctor_id];
			billUpdateStatus = $event.is_info_updated == true ? true : false;
			this.actionNameOfGenrate = String(type);
			updatedBillList = [$event.currentBillHistory];
		}
		else {
			this.actionNameOfGenrate = String($event);
			type = $event;
			billIds = getIdsFromArray(this.allBillEventData, 'id');
			case_id = getIdsFromArray(this.allBillEventData, 'case_id');
			facility_id = getIdsFromArray(this.allBillEventData, 'facility_id');
			speciality_id = getIdsFromArray(this.allBillEventData, 'speciality_id');
			speciality_name = getIdsFromArray(this.allBillEventData, 'speciality_name');
			doctor_id = getIdsFromArray(this.allBillEventData, 'doctor_id');
			bill_status_id = getIdsFromArray(this.allBillEventData, 'bill_status_id');
			case_type_id = getIdsFromArray(this.allBillEventData, 'case_type_id');
			billUpdateStatus = this.allBillEventData.some(
				(item: any) => item.is_info_updated == true,
			);
			updatedBillList = this.allBillEventData.filter(
				(item: any) => item.is_info_updated == true,
			);
		}
		if (type != 'excel' && billUpdateStatus) {
			if (packetContent) {
				this.openListOfUpdateBillModalThroughGeneratePacket(updatedBillList, packetContent);
				return false;
			}
			else {
				this.generteAfterBillProcess(
					type,
					billIds,
					facility_id,
					speciality_id,
					doctor_id,
					bill_status_id,
					case_type_id,
					speciality_name,
					case_id,
				);
			}
		} else {
			this.generteAfterBillProcess(
				type,
				billIds,
				facility_id,
				speciality_id,
				doctor_id,
				bill_status_id,
				case_type_id,
				speciality_name,
				case_id,
			);
		}
	}

	generteAfterBillProcess(
		type,
		billIds,
		facility_id,
		speciality_id,
		doctor_id,
		bill_status_id,
		case_type_id,
		speciality_name,
		case_id,
	) {
		switch (type) {
			case 'envelope': {
				this.generteEnvelope({ bill_ids: billIds });
				break;
			}
			case 'pom': {
				this.genertePom(this.allBillEventData);
				break;
			}
			case 'packet': {
				this.genertePacket(
					{ bill_ids: billIds },
					facility_id,
					speciality_id,
					bill_status_id,
					case_type_id,
					speciality_name,
					this.allBillEventData
				);
				break;
			}

			case 'invoice': {
				this.generteInvoice(facility_id, case_id, billIds);
				break;
			}
			case 'excel': {
				this.generteExcel();
				break;
			}
			case 'delete-bill': {
				this.onDeleteBill({ ids: billIds }, this.allBillEventData);
				break;
			}
		}
	}

	generteExcel() {
		let paramDataFilter: any = {};
		if (this.billListFilterComponent) {
			let filters = this.billListFilterComponent.searchForm.value;
			filters = removeEmptyKeysFromObject(filters);
			paramDataFilter = new BillFilterModelQueryPassInApi(filters);
			paramDataFilter = {
				...removeEmptyKeysFromObject(paramDataFilter),
				...{ case_ids: paramDataFilter.case_ids ? [paramDataFilter.case_ids] : this.adminBilling ? [] : [this.caseId] },
				order_by: OrderEnum.DEC,
				order: 'id',
				created_bill: true
			}
		}
		// if(this.adminBilling && !this.facilityFilter) {
		// 	this.toastrService.info('Practice-Location filter is required before exporting to CSV', 'Info');
		// 	return;
		// }
		let cols: any[] = [];
		if(this.selCols?.length) {
			this.selCols?.map(ele => {
				if(ele?.prop == 'actions') {
					cols.push('created_at')
					cols.push('updated_at')
					cols.push('created_by')
					cols.push('updated_by')
				}
				else {
					cols.push(ele?.prop)
				}
			})
		}
		paramDataFilter = {
			...paramDataFilter,
			custom_columns: JSON.stringify(cols)
		}
		this.subscription.push(this.requestService.sendRequest(BillingEnum.createdBillExcel + "?token=" + this.storageData.getToken(), 'get', REQUEST_SERVERS.fd_api_url,
			paramDataFilter,
		).subscribe((res) => {
			this.toastrService.success(res?.message, 'Success');
		},
			err => {
				if (err?.error?.message) {
					this.toastrService.error(err?.error?.message, 'Error');
				}
				else {
					this.toastrService.error(err?.error?.error?.message, 'Error');
				}
			}
		));
	}

	closePayment() {
		if (this.paymentInstanceType === 'bill') {
			this.setpage({ offset: this.page.pageNumber });
		} else {
			setTimeout(() => {
				let params = {
					pagination: 1,
					per_page: 10,
					page: 1,
					offset: 0,
					tabs: 'invoice',
					...this.tabsQueryParam,
				};
				this.invoiceListingComponent.selection.clear();
				let bill_id;
				if (bill_id) {
					params['bill_ids'] = [bill_id];
					setTimeout(() => {
						this.invoiceFormComponent && this.invoiceFormComponent.invoiceSplitListing
							? this.invoiceFormComponent.invoiceSplitListing.getInvoiceInfo(params)
							: null;
					});
				} else {
					if (this.caseId) {
						params['case_ids'] = [this.caseId];
					}
					this.invoiceListingComponent ? this.invoiceListingComponent.getInvoiceInfo(params) : null;
				}
				this.removeQueryParam = true;
			});
		}
		this.resetSelectedRecord()
		this.billingService.triggerEvent(true);
		this.billingService.verifiedPayment(false);
		this.billingService.getBills([]);
	}

	openPaymentModal(row, paymentContent, type?) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc payment-modal body-scroll payment-specific-wrapper',
		};
		this.selectedBill = row;
		this.currentBill = row;
		this.modalService.open(paymentContent, ngbModalOptions);
		if (type === 'invoice') {
			this.paymentInstanceType = 'invoice';
			this.currentBill = row;
			if (this.currentBill && this.currentBill.case_id) {
				this.currentCaseId = this.currentBill.case_id;
			}
		} else {
			this.requestService
				.sendRequest(BillingEnum.GETBillInvoiceId, 'GET', REQUEST_SERVERS.fd_api_url, {
					bill_id: row.id,
				})
				.subscribe((res) => {
					this.paymentInstanceType = 'bill';
					this.currentBill = row;
					if (res.invoice_id) {
						this.currentBill['invoice_id'] = res.invoice_id;
					}
					if (this.currentBill && this.currentBill.case_id) {
						this.currentCaseId = this.currentBill.case_id;
					}
				});
		}
		this.paymentService.pushReloadPayment(
			JSON.stringify([{ id: this.currentBill.id, label_id: this.currentBill.label_id }]),
		);
		this.eorService.pushResetPaymentForm(true);
		this.eorService.pushPaymentId(0);
	}
	/**
	 *  BELOW UN USED CODE
	 */
	openReciptentModal(row, reciptentModal) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: '',
		};
		this.modalService.open(reciptentModal, ngbModalOptions);
		this.currentBill = row;
		this.billingReciptentdata = row.bill_recipients;
	}

	openDenialModal(row, denialContent) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc payment-modal body-scroll',
		};
		this.modalService.open(denialContent, ngbModalOptions);
		this.currentBill = row;
		if (this.currentBill && this.currentBill.case_id) {
			this.currentCaseId = this.currentBill.case_id;
		}
		this.denialService.pushReloadDenial(this.currentBill.id);
		this.denialService.pushDenialForm(true);
		this.denialService.pushDenialId(0);
	}
	moveToInvoiceTabEmitter($event) {
		this.modalService.dismissAll();
		this.goto(5);
		this.invoiceIdFromPayment = $event.invoice_id;
		this.formFiledListOfValue = new BillFilterModelQueryParamField({
			invoice_ids: [$event.invoice_id],
		});
		this.formFiledValue = new BillFilterModelQueryPassInApi({ invoice_ids: [$event.invoice_id] });
		const billingFilter = new BillingFilterModel({ invoice_ids: [$event.invoice_id] });
		this.selectedRecpitents = billingFilter.recipients;
		this.tabsQueryParam = { invoice_ids: [$event.invoice_id] };
		this.searchForm.patchValue(this.formFiledValue);
		this.selectInvoice();
	}
	openVerificationModal(row, verificaitionContent) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc payment-modal body-scroll',
		};
		this.currentBill = row;
		if (this.currentBill && this.currentBill.case_id) {
			this.currentCaseId = this.currentBill.case_id;
		}
		this.modalService.open(verificaitionContent, ngbModalOptions);
		this.verificationService.pushReloadVerification(this.currentBill.id);
		this.verificationService.pushVerificationForm(true);
		this.verificationService.pushVerificationId(0);

		// this.eorService.pushReloadEor(this.currentBill.id);
		// this.eorService.eorPushId(0);
	}
	openEorModal(row, eorContent) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc payment-modal body-scroll',
		};
		this.currentBill = row;
		if (this.currentBill && this.currentBill.case_id) {
			this.currentCaseId = this.currentBill.case_id;
		}
		this.modalService.open(eorContent, ngbModalOptions);
		this.eorService.pushReloadEor(this.currentBill.id);
		this.eorService.eorPushId(0);
	}

	selectPayments(bill_id?) {
		this.resetSelectedRecord()
		if (this.removeQueryParam) {
			this.tabsQueryParam = {};
			this.eorService.pushFilterFormReset(true);
		}
		if (!this.adminBilling) {
			this.getBillDetailTotalCase();
		}
		this.eorService.pushResetForm(true);
		setTimeout(() => {
			let params = {
				pagination: 1,
				per_page: 10,
				page: 1,
				offset: 0,
				tabs: 'payment',
				...this.tabsQueryParam,
			};
			this.billingService.getBills([]);
			if (bill_id) {
				params['bill_ids'] = [bill_id];
				setTimeout(() => {
					this.paymentFormComponent && this.paymentFormComponent.paymentSplitList
						? this.paymentFormComponent.paymentSplitList.getPaymentInfo(params)
						: null;
				});
			} else {
				if (this.caseId) {
					params['case_ids'] = [this.caseId];
				}
				this.paymentSplitList ? this.paymentSplitList.getPaymentInfo(params) : null;
			}
			this.removeQueryParam = true;
		});
		this.paymentbillFilterComponent ? this.paymentbillFilterComponent.getCaseTypeList() : null;
	}
	selectInvoice(bill_id?) {
		this.resetSelectedRecord()
		if (this.removeQueryParam) {
			this.tabsQueryParam = {};
			this.eorService.pushFilterFormReset(true);
		}
		this.eorService.pushResetForm(true);
		setTimeout(() => {
			let params = {
				pagination: 1,
				per_page: 10,
				page: 1,
				offset: 0,
				tabs: 'invoice',
				...this.tabsQueryParam,
			};
			this.billingService.getBills([])
			this.invoiceListingComponent.selection.clear();
			if (bill_id) {
				params['bill_ids'] = [bill_id];
				setTimeout(() => {
					this.invoiceFormComponent && this.invoiceFormComponent.invoiceSplitListing
						? this.invoiceFormComponent.invoiceSplitListing.getInvoiceInfo(params)
						: null;
				});
			} else {
				if (this.caseId) {
					params['case_ids'] = [this.caseId];
				}
				if (this.invoiceIdFromPayment) {
					params['invoice_ids'] = [this.invoiceIdFromPayment];
				}
				this.invoiceListingComponent ? this.invoiceListingComponent.getInvoiceInfo(params) : null;
			}
			this.removeQueryParam = true;
		});
	}
	unselectbills() {
		this.resetSelectedRecord();
	}

	getChangePageDataEor($event) {
		let params = {
			...$event,
			bill_ids: [this.currentBill.id],
		};
		// setTimeout(() => {
		this.eorFormComponent && this.eorFormComponent.eorListingComponent
			? this.eorFormComponent.eorListingComponent.getEorInfo(params)
			: null;
		// });
	}

	getBillDetailTotalCase() {
		this.requestService
			.sendRequest(BillingEnum.getCaseBillTotalDetail, 'GET', REQUEST_SERVERS.fd_api_url, {
				case_id: this.caseId,
			})
			.subscribe((comingData: any) => {
				if (comingData['status'] == 200 || comingData['status'] == true) {
					this.billDetailTotal =
						comingData && comingData.result && comingData.result.data
							? comingData.result.data
							: null;
				}
			});
	}

	selectEor(bill_id?) {
		this.resetSelectedRecord()
		this.allBillEventData = [];
		if (this.removeQueryParam) {
			this.tabsQueryParam = {};
			this.formFiledValue = {};
			this.formFiledListOfValue = {};
			this.eorService.pushFilterFormReset(true);
		}
		if (!this.adminBilling) {
			this.getBillDetailTotalCase();
		}
		setTimeout(() => {
			let params = {
				pagination: 1,
				per_page: 10,
				page: 1,
				offset: 0,
				tabs: 'eor',
				...this.tabsQueryParam,
			};
			this.billingService.getBills([])
			if (bill_id) {
				params['bill_ids'] = [bill_id];
				setTimeout(() => {
					this.eorFormComponent && this.eorFormComponent.eorListingComponent
						? this.eorFormComponent.eorListingComponent.getEorInfo(params)
						: null;
				});
			} else {
				if (this.caseId) {
					params['case_ids'] = [this.caseId];
				}
				this.eorSplitListComponent ? this.eorSplitListComponent.getEorInfo(params) : null;
			}
			this.removeQueryParam = true;
		});
		this.eorbillFilterComponent ? this.eorbillFilterComponent.getCaseTypeList() : null;
	}

	getChangePageData($event) {
		setTimeout(() => {
			let params = {
				pagination: 1,
				...$event,
			};
			if (this.caseId && !params.case_ids) {
				params['case_ids'] = [this.caseId];
			}
			this.eorSplitListComponent ? this.eorSplitListComponent.getEorInfo(params) : null;
		});
	}

	onChangeDataDenial($event) {
		setTimeout(() => {
			let params = {
				pagination: 1,
				...$event,
			};
			if (this.caseId && !params.case_ids) {
				params['case_ids'] = [this.caseId];
			}
			this.denailListComponent ? this.denailListComponent.getDenialInfo(params) : null;
		});
	}

	onChangeDataVerification($event) {
		setTimeout(() => {
			let params = {
				pagination: 1,
				...$event,
			};
			if (this.caseId) {
				params['case_ids'] = [this.caseId];
			}
			this.verificationListComponent
				? this.verificationListComponent.getVerificationViewInfo(params)
				: null;
		});
	}
	changePaymentDataCase($event) {
		setTimeout(() => {
			let params = {
				pagination: 1,
				...$event,
			};
			if (this.caseId && !params.case_ids) {
				params['case_ids'] = [this.caseId];
			}
			this.paymentSplitList ? this.paymentSplitList.getPaymentInfo(params) : null;
			if (!this.adminBilling) {
				this.getBillDetailTotalCase();
			}
		});
	}
	changeInvoiceDataCase($event) {
		if ($event && $event.case_ids && Array.isArray($event.case_ids)) {
			$event.case_ids = $event.case_ids && $event.case_ids.flat(1);
		}
		setTimeout(() => {
			let params = {
				pagination: 1,
				...$event,
			};
			// if (this.caseId && !params.case_ids) {
			// 	params['case_ids'] = [this.caseId];
			// }
			this.invoiceListingComponent ? this.invoiceListingComponent.getInvoiceInfo(params) : null;
		});
	}

	changePaymentData($event) {
		debugger;
		let params = {
			...$event,
			bill_ids: [this.currentBill.id],
		};
		// setTimeout(() => {
		this.paymentFormComponent && this.paymentFormComponent.paymentSplitList
			? this.paymentFormComponent.paymentSplitList.getPaymentInfo(params)
			: null;
		// });
	}

	getChangePageDataDenial($event) {
		let params = {
			...$event,
			bill_ids: [this.currentBill.id],
		};
		// setTimeout(() => {
		this.denialFormComponent && this.denialFormComponent.denialListingComponent
			? this.denialFormComponent.denialListingComponent.getDenialInfo(params)
			: null;
		// });
	}

	selectVerification(bill_id?) {
		this.resetSelectedRecord()
		if (this.removeQueryParam) {
			this.tabsQueryParam = {};
			this.eorService.pushFilterFormReset(true);
		}
		if (!this.adminBilling) {
			this.getBillDetailTotalCase();
		}
		this.eorService.pushResetForm(true);
		setTimeout(() => {
			let params = {
				pagination: 1,
				per_page: 10,
				page: 1,
				tabs: 'verification',
				...this.tabsQueryParam,
			};
			this.billingService.getBills([])
			if (bill_id) {
				// params ['bill_ids'] = [bill_id];
				// setTimeout(() => {
				// 	this.verificationListComponent && this.denialFormComponent.denialListingComponent?this.denialFormComponent.denialListingComponent.getDenialInfo(params):null;
				// });
			} else {
				if (this.caseId) {
					params['case_ids'] = [this.caseId];
				}

				if (this.verificationListComponent) {
					this.verificationListComponent.page.offset = 0;
				}

				this.verificationListComponent
					? this.verificationListComponent.getVerificationViewInfo(params)
					: null;
			}
			this.removeQueryParam = true;
		});
		this.verificationbillFilterComponent
			? this.verificationbillFilterComponent.getCaseTypeList()
			: null;
	}

	selectDenial(bill_id?) {
		this.resetSelectedRecord()
		if (this.removeQueryParam) {
			this.tabsQueryParam = {};
			this.eorService.pushFilterFormReset(true);
		}
		if (!this.adminBilling) {
			this.getBillDetailTotalCase();
		}
		this.eorService.pushResetForm(true);
		setTimeout(() => {
			let params = {
				pagination: 1,
				per_page: 10,
				page: 1,
				offset: 0,
				tabs: 'denial',
				...this.tabsQueryParam,
			};
			this.billingService.getBills([])
			if (bill_id) {
				params['bill_ids'] = [bill_id];
				setTimeout(() => {
					this.denialFormComponent && this.denialFormComponent.denialListingComponent
						? this.denialFormComponent.denialListingComponent.getDenialInfo(params)
						: null;
				});
			} else {
				if (this.caseId) {
					params['case_ids'] = [this.caseId];
				}
				this.denailListComponent ? this.denailListComponent.getDenialInfo(params) : null;
			}
			this.removeQueryParam = true;
		});
		this.denialbillFilterComponent ? this.denialbillFilterComponent.getCaseTypeList() : null;
	}

	addManualAppealVerificationView($event) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc',
		};

		this.verificationModelClosed = this.modalService.open(
			this.verificaitionSentContent,
			ngbModalOptions,
		);
		this.currentVerificationRecived = $event;
	}
	addManualAppeal($event) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc',
		};
		this.selected_bills = [];
		for (let i = 0; i < $event.length; i++) {
			this.currentBill = {};
			this.currentBill['patient_last_name'] = $event && $event[i].patient_last_name ? $event[i].patient_last_name : '';
			this.currentBill['patient_first_name'] = $event && $event[i].patient_first_name ? $event[i].patient_first_name : '';
			this.currentBill['label_id'] = $event && $event[i].bill && $event[i].bill.label_id ? $event[i].bill.label_id : '';
			this.currentBill['speciality_qualifier'] = $event && $event[i].speciality_qualifier ? $event[i].speciality_qualifier : '';
			this.currentBill['bill_amount'] = $event && $event[i].bill_amount ? $event[i].bill_amount : '';
			this.currentBill['addBulkReply'] = $event?.addBulkReply;
			this.selected_bills.push(this.currentBill)
		}
		this.verificationModelClosed = this.modalService.open(
			this.verificaitionSentContent,
			ngbModalOptions,
		);
		this.currentVerificationRecived = $event;
	}

	saveVerificationEmitter($event) {
		if ($event && $event.verification_received_id && $event.verification_received_id.length) {
			$event.verification_received_id = $event.verification_received_id.filter(function (item, pos, self) { return self.indexOf(item) == pos; })
		}
		$event.type == 'pom' ? $event['addBulkReply'] = true : '';
		delete $event['type'];
		this.subscription.push(
			this.requestService
				.sendRequest(
					VerificationBillEnum.Verification_Sent_Post,
					'POST',
					REQUEST_SERVERS.fd_api_url,
					$event,
				)
				.subscribe((comingData: any) => {
					if (comingData['status'] == 200 || comingData['status'] == true) {
						this.verificationModelClosed.close();
						this.verificationService.pushReloadVerification(this.currentBill.id);
						this.toastrService.success(comingData.message, 'Success');
					}
				}),
		);
	}

	generteInvoice(facility_id, caseId, billIds) {
		let allSameFaclityId = allTheSame(facility_id);
		let allSameCaseId = allTheSame(caseId);
		if (this.allBillEventData && this.allBillEventData['length'] > 0) {
			let bills = this.allBillEventData.filter(bill => Number(bill['outstanding_amount']) === 0)
			if (bills && bills['length']) {
				this.toastrService.error(
					`Invoice Generation Alert: Unable to Generate Invoice for ${bills.map(bill => bill.label_id)} with $0.00 Outstanding`,
					'Error',
				);
				return;
			}
		}
		if (this.allBillEventData && this.allBillEventData['length'] > 0) {
			let bills = this.allBillEventData.filter(bill => Number(bill['invoice_id']))
			if (bills && bills['length']) {
				this.toastrService.error(
					`Invoice is already generated for selected bills ${bills.map(bill => bill.label_id)}`,
					'Error',
				);
				return;
			}
		}
		if (!allSameFaclityId || !allSameCaseId) {
			this.toastrService.error('Case ID & Practice must be same', 'Error');
			return false;
		}
		let queryParams = {
			invoice_category_slug: 'invoice_for_bill',
		};
		this.invoiceFormatLoadComponent.getInvoiceFormatList(queryParams);
		this.selectedInvoiceObject = {
			facility_id: facility_id[0],
			bill_ids: billIds,
			case_id: caseId[0],
			invoice_from_bill: true,
		};
		this.invoiceFormatLoadComponent && this.invoiceFormatLoadComponent.searchForm
			? this.invoiceFormatLoadComponent.searchForm.reset()
			: null;
		this.invoiceFormatLoadModal.show();
	}
	genertePacket(params, facility_id, speciality_id, bill_status_id, case_type_id, speciality_name, row) {
		let ebills = this.allBillEventData.filter(bill => bill.bill_type == ch_billing_typs_enum.e_bill).map(x => x.label_id)
		if(ebills.length){
			this.toastrService.error(`Unable to create packet for E-bills(${ebills.join(',')})`,'Error');
			return
		}
		let allSameFaclityId = allTheSame(facility_id);
		let allSameSpecialityId = allTheSame(speciality_id);
		let allbillstatusId = allTheSame(bill_status_id);
		if (this.genertePacketScreen && (!allSameFaclityId || !allSameSpecialityId || !allbillstatusId)) {
			this.toastrService.error(
				'Cannot Generate Packet Against Different Practices, Specialties and Bill Status',
				'Error',
			);
			return false;
		}
		params['speciality_id'] = speciality_id[0];
		params['speciality_name'] = speciality_name[0];
		params['bill_status_id'] = bill_status_id[0];
		params['facility_id'] = facility_id[0];
		params['case_type_ids'] = removeDups(case_type_id);
		params['bill_recipient_id'] = row?.[0]?.bill_recipients?.[0]?.bill_recipient_id;
		this.queryParam = params;
		let recipient: any[] = [];
		let qualifiers: any[] = [];
		let allrecipientTypeId = false;
		row?.forEach(ele => {
			if(qualifiers?.length) {
				let i = qualifiers.findIndex(key => key === ele?.speciality_qualifier);
				if(i != -1) {
					qualifiers[i] = ele?.speciality_qualifier.replace(/\s+/g, '-');
				}
				else {
					qualifiers.push(ele?.speciality_qualifier.replace(/\s+/g, '-'));
				}
			}
			else {
				qualifiers.push(ele?.speciality_qualifier.replace(/\s+/g, '-'));
			}
			ele?.bill_recipients?.map(inner => {
				if(inner?.bill_recipient_type_id) {
					recipient.push(inner?.bill_recipient_type_id);
				}
			})
		})
		params['speciality_qualifier'] = qualifiers;
		if(recipient?.length) {
			allrecipientTypeId = allTheSame(recipient);
			if(allrecipientTypeId && !this.genertePacketScreen && !this.adminBilling) {
				let typeId: any = {
					type_id: Number(recipient[0])
				}
				if(this.selectedRecpitents?.length) {
					let i = this.selectedRecpitents.findIndex(key => key?.type_id == typeId?.type_id);
					if(i != -1) {
						this.selectedRecpitents[i] = typeId;
					}
					else {
						this.selectedRecpitents.push(typeId);
					}
				}
				else {
					this.selectedRecpitents.push(typeId);
				}
			}
			if(!allrecipientTypeId && !this.genertePacketScreen && !this.adminBilling) {
				this.disablePat = true;
				this.disableIns = true;
				this.disableEmp = true;
				this.disableFirm = true;
				// Mapping object to associate each value with the corresponding property
				const disableMapping = {
					1: 'disablePat',
					2: 'disableEmp',
					3: 'disableIns',
					4: 'disableFirm'
				};
				// Iterate over recipient array and set the corresponding property to false
				recipient.forEach(ele => {
					const property = disableMapping[ele];
					if (property !== undefined) {
					this[property] = false;
					}
				});
				this.queryParam['recipients'] = [];
				this.selectedRecpitents = [];
				const ngbModalOptions: NgbModalOptions = {
					backdrop: 'static',
					keyboard: false,
					windowClass: 'modal_extraDOc body-scroll',
				};
				this.modalService.open(this.recipientsModal, ngbModalOptions);
			}
			else {
				params['recipients'] = removeEmptyKeysFromObject(this.selectedRecpitents);
				this.attachCoverSheetWithBills(params)
			}
		}
		else {
			this.toastrService.error("Select Bill Recipients", "Error")
			return false;
		}
	}

	onSelectRecipients(value, id) {
		if(value) {
			let typeId:any = {
				type_id: Number(id)
		  	};
		  	this.selectedRecpitents.push(typeId)
		}
		else {
			if(this.selectedRecpitents?.length) {
				this.selectedRecpitents = this.selectedRecpitents.filter(item => item?.type_id !== id);
			}
		}
	}

	onSaveRecipients() {
		if(!this.selectedRecpitents?.length) {
			this.toastrService.error("Select Bill Recipients", "Error")
			return false;
		}
		this.modalService.dismissAll();
		this.queryParam['recipients'] = removeEmptyKeysFromObject(this.selectedRecpitents);
		this.attachCoverSheetWithBills(this.queryParam);
	}

	attachCoverSheetWithBills(params) {
		this.customDiallogService
				.confirm(
					'Generate Packet',
					'Do you want to attach Cover Sheet with the Bill files?',
					'Yes',
					'No',
				)
				.then((confirmed) => {
					this.loadSpin = true;
					console.log(this.urlParams?.bill_recipient_type_ids,'this.urlParams?.bill_recipient_type_ids');
					if(this.selectedRecpitents?.length<1 && this.urlParams?.bill_recipient_type_ids){
						if(Array.isArray(this.urlParams?.bill_recipient_type_ids)){
							this.urlParams?.bill_recipient_type_ids?.forEach(id=>{
								let typeId:any  = {
									type_id: Number(id),
							  };
							  this.selectedRecpitents.push(typeId)
							});	
						}else{
							let typeId:any={
								type_id:Number(this.urlParams?.bill_recipient_type_ids),
							}
							this.selectedRecpitents[0]=typeId;
						}
					}
					if (confirmed) {
						params['is_cover_sheet'] = 1;
						this.packetGeneration(params);
					} else if (confirmed === false) {
						params['is_cover_sheet'] = 0;
						this.packetGeneration(params);
					} else {
						this.loadSpin = false;
					}
				})
				.catch();
	}
	packetGeneration(params) {
		if(!this.adminBilling) {
			this.requestService.sendRequestBlob(BillingEnum.createPacketWithinCase, params, REQUEST_SERVERS.fd_api_url)
			.subscribe(
				(res: HttpResponse<ArrayBuffer>) => {
					this.loadSpin = false;
					if (res?.body) {
						const contentDisposition = res?.headers.get('Content-Disposition');
						let fileName = 'download.zip'; // Default filename if not found
						if (contentDisposition) {
							const matches = /filename="?([^"]*)"?/i.exec(contentDisposition);
							if (matches && matches.length > 1) {
								fileName = matches[1];
							}
						}
						else {
							const { speciality_qualifier } = params;
							let specialityQualifierStr = '';
							// Join array elements with '-'
							specialityQualifierStr = speciality_qualifier.join('-');
							// Generate random time (using current timestamp as an example)
							const randomTime = new Date().getTime().toString();
							// Format current date as mm-dd-yy
							const currentDate = new Date().toLocaleDateString('en-US', {
								year: 'numeric',
								month: '2-digit',
								day: '2-digit'
							}).replace(/\//g, '-');
							fileName = `${specialityQualifierStr}_${currentDate}_${randomTime}.zip`;
						}
						this.toastrService.success('Packet created successfully', 'Success');
						this.billSelection.clear();
						this.allBillEventData = [];
						this.disablePat = true;
						this.disableIns = true;
						this.disableEmp = true;
						this.disableFirm = true;
						this.setpage({ offset: this.page.pageNumber, generate_packet: true });
						this.downloadFile(res.body, fileName);
					} else {
						this.queryParam['recipients'] = [];
						this.selectedRecpitents = [];
					}
				},
				(error) => {
					this.loadSpin = false;
					this.queryParam['recipients'] = [];
					this.selectedRecpitents = [];
					if (error?.error?.message) {
						this.toastrService.error(error?.error?.message || 'Something went wrong.', 'Error');
					} else {
						this.toastrService.error(error?.error?.error?.message || 'Something went wrong.', 'Error');
					}
				}
			);
		}
		else {
			delete params['bill_recipient_id'];
			delete params['speciality_qualifier'];
			this.requestService
				.sendRequest(BillingEnum.createPacket, 'post', REQUEST_SERVERS.fd_api_url, params)
				.subscribe(
					(res) => {
						this.loadSpin = false;
						if (res?.status) {
							this.toastrService.success(res?.message, 'Success');
							this.billSelection.clear();
							this.allBillEventData = [];
							this.disablePat = true;
							this.disableIns = true;
							this.disableEmp = true;
							this.disableFirm = true;
							this.setpage({ offset: this.page.pageNumber, generate_packet: true });
						}
						else {
							this.queryParam['recipients'] = [];
							this.selectedRecpitents = [];
						}
					},
					(error) => {
						this.loadSpin = false;
						this.queryParam['recipients'] = [];
						this.selectedRecpitents = [];
						if(error?.error?.message) {
							this.toastrService.error(error?.error?.message || 'Something went wrong.', 'Error');
						}
						else {
							this.toastrService.error(error?.error?.error?.message || 'Something went wrong.', 'Error');
						}
					},
				);
			}
	}

	downloadFile(data: ArrayBuffer, fileName: string) {
		const blob = new Blob([data], { type: 'application/zip' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	}

	genertePom(params) {
		let row: any = {};
		let bill_ids: any = [];
		let facility_id: any = [];
		let speciality_id: any = [];
		let doctor_id: any = [];
		params.forEach(ele => {
			if (ele?.bill_recipients) {
				ele?.bill_recipients.map(key => {
					bill_ids.push(key?.bill_id)
				})
			}
			if (ele?.facility_id) {
				facility_id.push(ele?.facility_id);
			}
			if (ele?.speciality_id) {
				speciality_id.push(ele?.speciality_id);
			}
			if (ele?.doctor_id) {
				doctor_id.push(ele?.doctor_id);
			}
		})
		bill_ids = removeDuplicates(bill_ids);
		let allSameFaclityId = allTheSame(facility_id);
		let allSameSpecialityId = allTheSame(speciality_id);
		let allSameDoctoreId = allTheSame(doctor_id);
		let ebills = this.allBillEventData.filter(bill => bill.bill_type === ch_billing_typs_enum.e_bill).map(x => x.label_id)
		if (ebills.length) {
			this.toastrService.error(`Unable to generate POM for E-bills(${ebills.join(',')})`, 'Error');
			return
		}
		if (!allSameFaclityId || !allSameSpecialityId || !allSameDoctoreId) {
			this.toastrService.error(
				'Cannot Generate POM Against Different Practices, Specialties and Providers',
				'POM',
			);
			return false;
		}
		row['bill_ids'] = bill_ids;
		row['facility_id'] = facility_id;
		row['is_packet'] = 2;
		this.subscription.push(
			this.requestService
				.sendRequest(BillingEnum.genertePOM, 'get', REQUEST_SERVERS.fd_api_url, row)
				.subscribe(
					(res) => {
						this.skipLoader = true;
						this.toastrService.success(res?.message, 'Success');
						this.billSelection.clear();
						this.setpage({ offset: this.page.pageNumber });
					},
					(err) => {
						if (err?.error?.message) {
							this.toastrService.error(err?.error?.message, 'Error');
						}
						else {
							this.toastrService.error(err?.error?.error?.message, 'Error');
						}
					},
				),
		);
		// if (params && params.bill_ids && params.bill_ids.length != 0) {
		// 	params.bill_ids.forEach((bills, index) => {
		// 		url = `${url}bill_ids[]=${bills}${params.bill_ids.length - 1 == index ? '' : '&'}`;
		// 		if (params.bill_ids.length - 1 === index) {
		// 			window.open(url);
		// 		}
		// 	});
		// }
	}

	generteEnvelope(params) {
		let ebills = this.allBillEventData.filter(bill => bill.bill_type == ch_billing_typs_enum.e_bill).map(x => x.label_id)
		if (ebills.length) {
			this.toastrService.error(`Unable to generate envelope for E-bills(${ebills.join(',')})`, 'Error');
			return
		}
		let url;
		this.loadSpin = true;
		this.requestService
			.sendRequest(BillingEnum.genereteEnvelope, 'url_base_with_token', REQUEST_SERVERS.fd_api_url)
			.subscribe(
				(res) => {
					url = res + '&';
					this.loadSpin = false;
				},
				(err) => {
					this.loadSpin = false;
				},
			);

		if (params && params.bill_ids && params.bill_ids.length != 0) {
			params.bill_ids.forEach((bills, index) => {
				url = `${url}bill_ids[]=${bills}${params.bill_ids.length - 1 == index ? '' : '&'}`;
				if (params.bill_ids.length - 1 === index) {
					window.open(url);
				}
			});
		}
	}
	/**
	 *  BELOW UN USED CODE
	 */
	viewDocFile(row) {
		if (row && row.media_id && row.media_id.pre_signed_url) {
			window.open(row.media_id.pre_signed_url);
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

	billListingRefreshOnPaymentAdd($event) {
		if ($event === 'bill') {
			this.currentBill;
			this.billApiHitForAllRecords(this.currentBill.id);
		} else {
			this.invoiceApiHitForAllRecords(this.currentBill.id);
		}
	}
	invoiceApiHitForAllRecords(invoice_id) {
		this.loadSpin = true;
		let queryParams = {
			filter: false,
			order: OrderEnum.ASC,
			per_page: 1,
			page: 1,
			pagination: true,
			invoice_ids: [invoice_id],
		};
		this.subscription.push(
			this.requestService
				.sendRequest(
					InvoiceBillEnum.Invoice_Bill_List_Get,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					removeEmptyKeysFromObject(queryParams),
				)
				.subscribe((comingData: any) => {
					if (comingData['status'] == 200 || comingData['status'] == true) {
						const billListCollection: any[] = comingData.result ? comingData.result.data : [];
						if (billListCollection && billListCollection.length != 0) {
							this.currentBill = billListCollection[0];
						}
						this.loadSpin = false;
					}
				}),
		);
		this.loadSpin = false;
	}

	billApiHitForAllRecords(bill_id?) {
		this.loadSpin = true;
		let queryParams: any = {
			filter: false,
			order: OrderEnum.ASC,
			per_page: 10,
			page: 1,
			pagination: true,

		};

		// const paramDataFilter = new BillFilterModelQueryPassInApi(this.searchForm.value);
		queryParams = {
			...queryParams,
			// ...paramDataFilter,
			case_ids: [this.caseId],
			bill_ids: [bill_id],
		}
		this.subscription.push(
			this.requestService
				.sendRequest(
					BillingEnum.getBillListing,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					removeEmptyKeysFromObject(queryParams),
				)
				.subscribe((comingData: any) => {
					if (comingData['status'] == 200 || comingData['status'] == true) {
						const billListCollection = comingData.result ? comingData.result.data : [];
						if (billListCollection && billListCollection.length != 0) {
							this.currentBill = billListCollection[0];
						}
						// this.currentBill = billListCollection.find(
						// 	(billComing) => billComing.id === this.currentBill.id,
						// );
						this.loadSpin = false;
					}
					this.tableColumns();
				}),
		);
		this.loadSpin = false;
	}

	selectBillsList() {
		this.includesAny = false;
		this.eorService.pushBillFilterFormReset(true);
		this.billListFilterComponent.eventsSubject.next(true);
		this.resetCase();
		if (this.adminBilling) {
			this.caseId = null;
		}
	}

	getRecipatentIndex(value: any[] = []) {
		let recpitentIndex = value.findIndex((x) => x.bill_recipient_type_id === 3);
		let recpient = recpitentIndex != -1 ? recpitentIndex : 0;
		return recpient;
	}

	getRecipatentName(row, singleRow?) {
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
	/**
	 *  BELOW UN USED CODE
	 */
	getCaseTypeList() {
		this.eorService.getAllSensationsOfCaseType().subscribe((res) => {
			if (res['status'] == 200) {
				this.caseTypeLists =
					res['result'] && res['result'].data && res['result'].data.type
						? res['result'].data.type
						: [];
			}
		});
	}

	filterData($event) {
		this.disableDateRange = true;
		this.facilityFilter = $event?.facility_ids;
		this.searchForm = this.initializeSearchForm();
		$event.bill_date = $event.bill_date ? changeDateFormat($event.bill_date) : null;
		$event.date_of_accident_from = $event.date_of_accident_from
			? changeDateFormat($event.date_of_accident_from)
			: null;
		$event.date_of_accident_to = $event.date_of_accident_to
			? changeDateFormat($event.date_of_accident_to)
			: null;
		this.searchForm.patchValue(removeEmptyKeysFromObject($event));
		this.setpage({ offset: 0 });
	}
	/**
	 * intelecience for search Case
	 * @param event
	 */

	/**
	 *  BELOW UN USED CODE
	 */
	searchPatientName({ target }, search: string) {
		if (search === 'patientName') {
			const value = target.value;
			if (value) {
				const query = {
					filter: true,
					name: value,
				};
				this.eorService.searchPatientName(query).subscribe((data) => {
					if (data['status']) {
						const result = [...data['result']['data']];
						this.patientNameLists = result.map((t) => {
							return new UserByModel(t);
						});
					}
				});
			}
		} else {
			const value = target.value;
			if (value) {
				const query = {
					filter: true,
					id: value,
				};
				this.eorService.searchPatientName(query).subscribe((data) => {
					if (data['status']) {
						const result = [...data['result']['data']];
						this.patientIdLists = result;
					}
				});
			}
		}
	}

	/**
	 *
	 *  intellisense for practice location
	 */
	/**
	 *  BELOW UN USED CODE
	 */
	searchPractice({ target }) {
		if (target.value) {
			this.eorService.searchOfPractice(target.value).subscribe((data) => {
				this.lstpractiseLocation = [...data['result']['data']];
			});
		}
	}

	goto(id) {
		this.tabset.tabs[id].active = true;
	}

	onDeleteBill(param, data) {
		let file_ids = [];
		if (Array.isArray(data)) {
			data.forEach(x => {
				if (x?.bill_recipients?.[0]?.get_documents) {
					x.bill_recipients[0].get_documents.map(y => {
						file_ids.push(y.id);
					});
				}
			});
		}
		else {
			if (data?.bill_recipients?.[0]?.get_documents) {
				data.bill_recipients[0].get_documents.map(x => {
					file_ids.push(x.id);
				})
			}
		}
		this.customDiallogService
			.confirm(
				'Delete Bill',
				`Do you really want to delete ${param && param.ids && param.ids.length == 1
					? 'this bill?'
					: `these ${param && param.ids && param.ids.length} bills?`
				}`,
			)
			.then((confirmed) => {
				if (confirmed) {
					this.loadSpin = true;
					this.subscription.push(
						this.requestService
							.sendRequest(BillingEnum.DeleteBill, 'delete', REQUEST_SERVERS.fd_api_url, param)
							.subscribe(
								(res: any) => {
									if (res.status) {
										this.requestService.sendRequest(
											sharedUrlsEnum.shartedFile_list_DELETE,
											'POST',
											REQUEST_SERVERS.document_mngr_api_path,
											{ ids: file_ids }
										).subscribe((resp: any) => {
											this.loadSpin = false;
											this.setpage({ offset: this.page.pageNumber });
											this.toastrService.success(res.message, 'Success');
										}, (err: any) => {
											this.loadSpin = false;
										})
										this.allBillEventData = [];
									} else {
										this.loadSpin = false;
									}
								},
								(error) => {
									this.loadSpin = false;
								},
							),
					);
				}
			})
			.catch();
	}

	openListOfUpdateBillModalThroughGeneratePacket(row, packetContent) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal-lg-package-generate',
		};
		this.modalService.open(packetContent, ngbModalOptions);
		this.updateBillListOfDetails = row;
	}

	moveToCaseInfo(row) {
		this._router.navigate([`front-desk/cases/edit/${row}/patient/case-info`]);
		this.modalService.dismissAll();
	}

	selectAll($event) {
		let self = this;
		this.overAllTableChecked = !this.overAllTableChecked;
		if ($event.srcElement.checked) {
			for (let i in this.billComingData) {
				this.billComingData[i][self.checkedProp] = this.overAllTableChecked;
				if (this.overAllTableChecked) {
					this.allBillEventData.push(this.billComingData[i]);
				}
			}
			this.allBillEventData = this.removeDuplicatesObject(this.allBillEventData, this.filterProp);
			this.add_Remove_E_Bills(null, false)
		}
		else {
			let filteredRows = this.billComingData.filter(function (event) {
				return event[self.checkedProp] == true;
			});
			let ids = getIdsFromArray(filteredRows, this.filterProp);
			this.allBillEventData.reduceRight(function (acc, obj, idx) {
				if (ids.indexOf(obj[self.filterProp]) > -1)
					self.allBillEventData.splice(idx, 1);
			}, 0);
			for (let i in this.billComingData) {
				this.billComingData[i][self.checkedProp] = false;
				this.overAllTableChecked = false;
			}
			this.add_Remove_E_Bills(null, false)
		}
	}

	moveToBill(row) {
		const filterParam = {};
		const newObj = [
			{
				label_id: row.label_id,
				id: row.id,
				name: row.label_id,
			},
		];
		filterParam['bill_ids'] = JSON.stringify(newObj);
		this.router.navigate([`front-desk/cases/edit/${row.case_id}/billing`], {
			queryParams: filterParam,
		});
		this.modalService.dismissAll();
	}

	refreshComponent($event) {
		this.invoiceId = $event;
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			size: 'lg',
			windowClass: 'modal_extraDOc',
		};

		this.modalService.open(this.invoiceShowsPdfDetails, ngbModalOptions);
	}

	billingHistoryStats(row, isEbill?: boolean) {
		if(isEbill){
			const ngbModalOptions: NgbModalOptions = {
				backdrop: 'static',
				size: 'xl',
				keyboard: false,
				windowClass: 'modal_extraDOc create-bill-modal',
			};
			let modelRef = this.modalService.open(CreatedHistoryComponent, ngbModalOptions);
			modelRef.componentInstance.createdInformation = [row];
			modelRef.componentInstance.isEbill = isEbill;
		}else{
			const ngbModalOptions: NgbModalOptions = {
				backdrop: 'static',
				keyboard: false,
				windowClass: 'modal_extraDOc body-scroll history-modal',
				modalDialogClass: 'modal-lg'
			};
			let modelRef = this.modalService.open(CreatedHistoryComponent, ngbModalOptions);
			modelRef.componentInstance.createdInformation = [row];
		}
	}
	openCustomoizeColumn(CustomizeColumnModal) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal-lg-package-generate',
		};
		this.modalCols = [];
		let self = this;
		if (this.adminBilling) {
			if (!this.genertePacketScreen) {
				this.columnsBill.forEach(element => {
					let obj = self.alphabeticColumns.find(x => x?.name === element?.name);
					if (obj) {
						this.modalCols.push({ header: element?.name, checked: obj?.checked });
					}
				});
			}
			else if (this.genertePacketScreen) {
				this.columnsBillReports.forEach(element => {
					let obj = self.alphabeticColumns.find(x => x?.name === element?.name);
					if (obj) {
						this.modalCols.push({ header: element?.name, checked: obj?.checked });
					}
				});
			}
		}
		else {
			this.columns.forEach(element => {
				let obj = self.alphabeticColumns.find(x => x?.name === element?.name);
				if (obj) {
					this.modalCols.push({ header: element?.name, checked: obj?.checked });
				}
			});
		}
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
				if (!this.genertePacketScreen) {
					this.localStorage.setObject('billTableList' + this.storageData.getUserId(), data);
				}
				else if (this.genertePacketScreen) {
					this.localStorage.setObject('billSpecialtyReportTableList' + this.storageData.getUserId(), data);
				}
			}
			else {
				this.localStorage.setObject('billCaseTableList' + this.storageData.getUserId(), data);
			}
			this.selCols = data;
			let selCustCols: any[] = [];
			this.selCols.map(key => {
				this.alphabeticColumns.map(inner => {
					if(key?.header == inner?.name) {
						selCustCols.push({prop: inner?.prop});
					}
				})
			})
			this.selCols = selCustCols;
		}
		if (this.adminBilling) {
			if (!this.genertePacketScreen) {
				const nameToIndexMap = {};
				this.modalCols.forEach((item, index) => {
					nameToIndexMap[item?.header] = index;
				});
				this.columnsBill.sort((a, b) => nameToIndexMap[a?.name] - nameToIndexMap[b?.name]);
			}
			else if (this.genertePacketScreen) {
				const nameToIndexMap = {};
				this.modalCols.forEach((item, index) => {
					nameToIndexMap[item?.header] = index;
				});
				this.columnsBillReports.sort((a, b) => nameToIndexMap[a?.name] - nameToIndexMap[b?.name]);
			}
		}
		else {
			const nameToIndexMap = {};
			this.modalCols.forEach((item, index) => {
				nameToIndexMap[item?.header] = index;
			});
			this.columns.sort((a, b) => nameToIndexMap[a?.name] - nameToIndexMap[b?.name]);
		}
		//set checked and unchecked on the base modal columns in alphabeticals columns
		this.alphabeticColumns.forEach(element => {
			if (this.adminBilling) {
				if (!this.genertePacketScreen) {
					let currentColumnIndex = findIndexInData(this.columnsBill, 'name', element.name);
					if (currentColumnIndex != -1) {
						this.columnsBill[currentColumnIndex]['checked'] = element.checked;
						this.columnsBill = [...this.columnsBill];
					}
				}
				else if (this.genertePacketScreen) {
					let currentColumnIndex = findIndexInData(this.columnsBillReports, 'name', element.name);
					if (currentColumnIndex != -1) {
						this.columnsBillReports[currentColumnIndex]['checked'] = element.checked;
						this.columnsBillReports = [...this.columnsBillReports];
					}
				}
			}
			else {
				let currentColumnIndex = findIndexInData(this.columns, 'name', element.name);
				if (currentColumnIndex != -1) {
					this.columns[currentColumnIndex]['checked'] = element.checked;
					this.columns = [...this.columns];
				}
			}
		});
		// show only those columns which is checked
		if (this.adminBilling) {
			if (!this.genertePacketScreen) {
				let columnsBody = makeDeepCopyArray(this.columnsBill);
				this.billingListTable._internalColumns = columnsBody.filter(c => {
					return c.checked == true;
				});
				const nameToIndexMap = {};
				this.modalCols.forEach((item, index) => {
					nameToIndexMap[item?.header] = index;
				});
				this.billingListTable._internalColumns.sort((a, b) => nameToIndexMap[a?.name] - nameToIndexMap[b?.name]);
			}
			else if (this.genertePacketScreen) {
				let columnsBody = makeDeepCopyArray(this.columnsBillReports);
				this.billingListTable._internalColumns = columnsBody.filter(c => {
					return c.checked == true;
				});
				const nameToIndexMap = {};
				this.modalCols.forEach((item, index) => {
					nameToIndexMap[item?.header] = index;
				});
				this.billingListTable._internalColumns.sort((a, b) => nameToIndexMap[a?.name] - nameToIndexMap[b?.name]);
			}
		}
		else {
			let columnsBody = makeDeepCopyArray(this.columns);
			this.billingListTable._internalColumns = columnsBody.filter(c => {
				return c.checked == true;
			});
			const nameToIndexMap = {};
			this.modalCols.forEach((item, index) => {
				nameToIndexMap[item?.header] = index;
			});
			this.billingListTable._internalColumns.sort((a, b) => nameToIndexMap[a?.name] - nameToIndexMap[b?.name]);
		}
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

	customizeColumnsForCSV() {
		let csvColumns: any[] = [];
		csvColumns = (this.adminBilling && !this.genertePacketScreen) ? this.columnsBill : !this.adminBilling ? this.columns : this.columnsBillReports;
		csvColumns.map(ele => {
			if(ele?.checked) {
				if(this.selCols.length) {
					let i = this.selCols.findIndex(key => key?.header == ele?.name);
					if(i != -1) {
						this.selCols[i] = {prop: ele?.prop};
					}
					else {
						this.selCols.push({prop: ele?.prop});
					}
				}
				else {
					this.selCols.push({prop: ele?.prop});
				}
			}
		})
	}
}
