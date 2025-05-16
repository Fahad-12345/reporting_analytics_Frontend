import { CustomDiallogService } from './../../../shared/services/custom-dialog.service';
import { ToastrService } from 'ngx-toastr';
import { StorageData } from './../../../pages/content-pages/login/user.class';
import { Page } from './../../../shared/models/listing/page';
import { REQUEST_SERVERS } from './../../../request-servers.enum';
import { EorBillUrlsEnum } from './../../eor-bill.url.enum';
import { Subscription, take } from 'rxjs';
import {
	Component,
	Output,
	OnInit,
	EventEmitter,
	ViewChild,
	Input,
	OnDestroy,
} from '@angular/core';
import { RequestService } from '@appDir/shared/services/request.service';
import { EORService } from '../eor.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SelectionModel } from '@angular/cdk/collections';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { BillFilterModelQueryParamField } from '@appDir/front-desk/billing/Models/bill-filter-model-query-param-field';
import { BillFilterModelQueryPassInApi } from '@appDir/front-desk/billing/Models/bill-filter-model-query-pass-in-api';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { changeDateFormat, getIdsFromArray, getObjectChildValue, makeDeepCopyArray, removeEmptyAndNullsFormObject, removeEmptyKeysFromObject, unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
import * as $ from 'jquery';
import { EorFilterComponent } from '../eor-filters/eor-filter.component';
import { BillingEnum } from '@appDir/front-desk/billing/billing-enum';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
@Component({
	selector: 'app-eor-list-split',
	templateUrl: './eor-split-listing.component.html',
	styleUrls: ['./eor-split-listing.component.scss'],
})
export class EorSplitListComponent implements OnInit, OnDestroy {
	eorData: any[] = [];
	subscription: Subscription[] = [];
	limit: number = 10;
	page: Page = new Page();
	currentBill: any;
	bill_ids: number;
	case_ids: any[];
	@Input() eorFormSplit: boolean;
	@Input() eorHideColumn: boolean = false;
	@Input() adminBilling: boolean = false;
	@Input() eorbillFilterComponent: EorFilterComponent
	@ViewChild('eoreditModal') public eoreditModal: ModalDirective;
	@Output() onEditEor = new EventEmitter();
	@Output() getChangePageData = new EventEmitter();
	eorEditModelClosed: NgbModalRef;
	@ViewChild('eorEditContent') eorEditContent: any;
	loadSpin: boolean = false;
	billingReciptentdata: any[] = [];
	billSelection = new SelectionModel<Element>(true, []);
	formFiledValue: any;
	formFiledListOfValue: any;
	isItComeTofilter = true;
	actionNameOfGenrate: string;
	caseId: number;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('eorList') eorListTable: DatatableComponent;
	customizedColumnComp: CustomizeColumnComponent;
	@ViewChild(CustomizeColumnComponent) set con(con: CustomizeColumnComponent) {
		if (con) { // initially setter gets called with undefined
		  this.customizedColumnComp = con;
		}
	}
	modalCols :any[] = [];
	columns: any[] = [];
	alphabeticColumns:any[] =[];
	colSelected: boolean = true;
	isAllFalse: boolean = false;
	eorListingTable: any;
	selCols: any[] = [];
	facilityFilter: any;

	constructor(
		private requestService: RequestService,
		private storageData: StorageData,
		private eorService: EORService,
		private toastrService: ToastrService,
		private modalService: NgbModal,
		private customDiallogService: CustomDiallogService,
		public commonService: DatePipeFormatService,
		public _router: Router,
		private _route: ActivatedRoute,
		public location: Location,
		private toaster: ToastrService,
		private localStorage: LocalStorage
	) { }

	ngOnInit() {
		// this.page.size = this.limit;
		this.page.pageNumber = 0;
		this.subscription.push(
			this.eorService.pullDoSearch().subscribe((s) => {
				if (s.status && s.componet === 'EOR') {
					this.page.pageNumber = 1;
					this.isItComeTofilter = true;
					const result: any = this.eorService.makeFilterObject(this.eorService.params);
					this.facilityFilter = result?.facility_ids;
					let params = {
						...result,
						pagination: 1,
						per_page: this.page.size,
						page: 1,
						tabs: 'eor'
					};
					this.formFiledListOfValue = new BillFilterModelQueryParamField(params);
					this.formFiledValue = new BillFilterModelQueryPassInApi(params);
					this.page.offset = 0;
					this.getChangePageData.emit(params);
				}
			}));
		this._route.snapshot.pathFromRoot.forEach((path) => {
			!this.caseId ? (this.caseId = getObjectChildValue(path, null, ['params', 'caseId'])) : null;
		});
		this.getEorThroghSubject();
		this.closePopup();
		if(this.adminBilling) {
			this.eorListingTable = this.localStorage.getObject('eorTableList' + this.storageData.getUserId());
		}
		else {
			this.eorListingTable = this.localStorage.getObject('eorCaseTableList' + this.storageData.getUserId());
		}
	}

	ngAfterViewInit() {
		if (this.eorListTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.eorListTable._internalColumns]);
			this.columns.forEach(element => {
				if(this.eorListingTable.length) {
					let obj = this.eorListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.eorListingTable.length) {
				const nameToIndexMap = {};
				this.eorListingTable.forEach((item, index) => {
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
			this.selCols = this.eorListingTable?.length ? this.eorListingTable : [];
			this.customizeColumnsForCSV();
			this.onConfirm(false);
		}
	}

	getEorInfo(params) {
		this.loadSpin = true;
		this.case_ids = params['case_ids'] ? params['case_ids'] : null;
		const param = removeEmptyAndNullsFormObject(params);
		this.addUrlQueryParams({
			pagination: param.pagination,
			per_page: param.per_page,
			offset: param.offset,
			tabs: param.tabs
		});
		const paramData = new BillFilterModelQueryPassInApi(param);
		this.page.size = paramData['per_page'];
		this.subscription.push(
			this.requestService
				.sendRequest(EorBillUrlsEnum.EOR_GET_ALL, 'GET', REQUEST_SERVERS.fd_api_url, removeEmptyAndNullsFormObject(paramData))
				.subscribe(
					(comingData: any) => {
						if (comingData['status'] == 200 || comingData['status'] == true) {
							this.loadSpin = false;
							this.eorData = comingData.result.data ? [...comingData.result.data] : [];
							this.page.totalElements = comingData.result.total;
							this.page.totalPages = comingData.result.page;
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

	onPageChange(pageInfo) {
		this.page.offset = pageInfo.offset;
		this.page.pageNumber = pageInfo.offset + 1;
		// const result = this.eorService.makeFilterObject(this.eorService.params);
		// let params = {
		// 	per_page: this.page.size,
		// 	pagination: 1,
		// 	page: this.page.pageNumber,
		// 	...result,
		// };
		// this.getChangePageData.emit(params);
		this.getEorInfo(this.paramsObject());
	}

	onEOREdit(row) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc body-scroll',
		};
		this.eorService.eorPushId(row.eor_id);
		this.eorService.pushResetEorForm(true);
		row['id'] = row.bill_id;
		this.currentBill = row;
		this.isItComeTofilter = false;
		if (this.eorFormSplit) {
			this.eorEditModelClosed = this.modalService.open(
				this.eorEditContent,
				ngbModalOptions,
			);
		}
	}

	viewDocFile(row) {
		if (row && row.media && row.media.pre_signed_url) {
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

	pageLimit($event) {
		this.page.size = Number($event);
		this.page.offset = 0;
		this.page.pageNumber = 1;
		this.getEorInfo(this.paramsObject());
	}

	generateExcel() {
		let paramDataFilter: any = {};
		if (this.eorbillFilterComponent) {
			let filters = this.eorbillFilterComponent.searchForm.value;
			this.filterData(filters);
			filters = removeEmptyAndNullsFormObject(filters);
			paramDataFilter = new BillFilterModelQueryPassInApi(filters);
			paramDataFilter = {
				...removeEmptyKeysFromObject(paramDataFilter),
				...{ case_ids: filters.case_ids ? [filters.case_ids] : this.adminBilling ? [] : [this.caseId] },
				order_by: OrderEnum.DEC,
				order: 'id'
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
		this.subscription.push(this.requestService.sendRequest(BillingEnum.eorExcel + "?token=" + this.storageData.getToken(), 'get', REQUEST_SERVERS.fd_api_url,
			paramDataFilter,
		).subscribe((res) => {
			this.toastrService.success(res?.message, 'Success');
		},
		err => {
			if(err?.error?.message) {
				this.toastrService.error(err?.error?.message, 'Error');
			}
			else {
				this.toastrService.error(err?.error?.error?.message, 'Error');
			}
		}
	));
	}

	filterData(formData: any) {
		formData['bill_date_range1'] = formData.bill_date_range1 ? changeDateFormat(formData.bill_date_range1) : null;
		formData['bill_date_range2'] = formData.bill_date_range2 ? changeDateFormat(formData.bill_date_range2) : null;
		formData['created_at'] = formData.created_at ? changeDateFormat(formData.created_at) : null;
		formData['updated_at'] = formData.updated_at ? changeDateFormat(formData.updated_at) : null;
		formData['date_of_accident_from'] = formData.date_of_accident_from ? changeDateFormat(formData.date_of_accident_from) : null;
		formData['date_of_accident_to'] = formData.date_of_accident_to ? changeDateFormat(formData.date_of_accident_to) : null;
		formData['posted_date_from'] = formData.posted_date_from ? changeDateFormat(formData.posted_date_from) : null;
		formData['posted_date_to'] = formData.posted_date_to ? changeDateFormat(formData.posted_date_to) : null;
		formData['eor_date_from'] = formData.eor_date_from ? changeDateFormat(formData.eor_date_from) : null;
		formData['eor_date_to'] = formData.eor_date_to ? changeDateFormat(formData.eor_date_to) : null;
	}

	formSubmited($event) {
		// this.eoreditModal.hide();
	}

	onDeleteEOR(row) {
		let param = {
			ids: [row.eor_id],
		};
		this.isItComeTofilter = false;
		this.customDiallogService.confirm('Delete EOR', 'Do you really want to delete this EOR?')
			.then((confirmed) => {
				if (confirmed) {
					this.loadSpin = true;
					this.subscription.push(
						this.requestService
							.sendRequest(
								EorBillUrlsEnum.deleteEor,
								'delete_with_body',
								REQUEST_SERVERS.fd_api_url,
								param,
							)
							.subscribe(
								(res: any) => {
									const result = this.eorService.makeFilterObject(this.eorService.params);
									if (res.status) {
										this.loadSpin = false;
										let params = {
											...result,
											pagination: 1,
											per_page: this.page.size,
											page: this.page.pageNumber,
										};
										this.getChangePageData.emit(params);
										if (this.eorService.isBillId()) {
											// this.page.offset = 0;
											this.eorService.reloadEorAfterAdd();
											this.eorService.pushResetForm(true);
										}
										this.toastrService.success(res.message, 'Success');
									}
								},
								(error) => {
									this.loadSpin = false;
									this.toastrService.error(error.error.message, 'Error');
								},
							),
					);
				}
			})
			.catch();
	}

	getEorThroghSubject() {
		if (!this.eorFormSplit) {
			this.subscription.push(
				this.eorService.pullReloadEor().subscribe((id) => {
					this.bill_ids = id != 0 ? id : null;
					if (id != 0) {
						this.getEorInfo({ pagination: 1, per_page: 10, page: 1, bill_ids: [id] });
						this.page.offset = 0;
					}
				}));
		}
	}

	paramsObject() {
		const result = this.eorService.makeFilterObject(this.eorService.params);
		let params = {
			tabs: 'eor',
			per_page: this.page.size,
			pagination: 1,
			page: this.page.pageNumber,
			order: this.page.order,
			column: this.page.column,
			...result
		}
		if (this.bill_ids) {
			params['bill_ids'] = [this.bill_ids];
		}
		if (this.case_ids) {
			params['case_ids'] = this.case_ids;
		}
		return params;
	}

	closePopup() {
		this.subscription.push(
			this.eorService.pullEorPopupModelClose().subscribe(status => {
				if (status && this.eorFormSplit) {
					// this.closeEorModal.nativeElement.click();
					// this.eoreditModal.hide();
					this.eorEditModelClosed.close();
					this.refreshAfterUpdateDataByTab();
				}
			}));
	}

	refreshAfterUpdateDataByTab() {
		const result = this.eorService.makeFilterObject(this.eorService.params);
		let params = {
			...result,
			pagination: 1,
			per_page: this.page.size || 10,
			page: this.isItComeTofilter ? 1 : this.page.pageNumber,
		};
		this.getChangePageData.emit(params);
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

		if (row.recipient && (row.bill_recipient_type_id === 4)) {
			return `${(row.bill_recipient_type_id === 4 && singleRow.firm_name) ? singleRow.firm_name : ''}`;
		}
		else if (row.recipient && (row.bill_recipient_type_id === 1)) {
			return `${row.recipient.first_name} ${row.recipient.middle_name ? row.recipient.middle_name : ''
				} ${row.recipient.last_name}`;
		}
		else if (row.recipient && row.bill_recipient_type_id === 2) {
			return row.recipient.employer_name;
		} else {
			return row.recipient ? row.recipient.insurance_name : '';
		}
	}

	sorting({ sorts }) {
		debugger;
		this.page.column = 'eor_date';
		this.page.order = sorts[0].dir;
		this.getEorInfo(this.paramsObject());
	}

	ngOnDestroy(): void {
		unSubAllPrevious(this.subscription);
	}

	/**
	 * Queryparams to make unique URL
	 * @param params
	 * @returns void
	 */
	addUrlQueryParams(params: any): void {
		this.location.replaceState(this._router.createUrlTree([], { queryParams: params }).toString());
	}
	
	eorHistoryStats(row) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc body-scroll history-modal',
			modalDialogClass: 'modal-lg'
		};
		let modelRef = this.modalService.open(CreatedHistoryComponent,ngbModalOptions);
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
			if(obj) {
				this.modalCols.push({ header: element?.name, checked: obj?.checked });
			}
		});
		this.CustomizeColumnModal.show();
	}

	onConfirm(click) {
		if (this.isAllFalse && !this.colSelected){
			this.toastrService.error('At Least 1 Column is Required.','Error');
			return false;
		}
		if(click) {
			this.customizedColumnComp;
			this.modalCols = makeDeepCopyArray(this.customizedColumnComp?.modalCols)
			let data: any = [];
			this.modalCols.forEach(element => {
				if(element?.checked) {
					data.push(element);
				}
				let obj = this.alphabeticColumns.find(x => x?.name === element?.header);
				if (obj) {
					if (obj.name == element.header) {
						obj.checked = element.checked;
					}
				}
			});
			if(this.adminBilling) {
				this.localStorage.setObject('eorTableList' + this.storageData.getUserId(), data);
			}
			else {
				this.localStorage.setObject('eorCaseTableList' + this.storageData.getUserId(), data);
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
		this.eorListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.eorListTable._internalColumns.sort(function (a, b) {
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
		if(!isChecked) {
			this.isAllFalse = true;
		}
	}

	onSingleSelection(isChecked) {
		this.isAllFalse = isChecked;
		if(isChecked) {
			this.colSelected = false;
		}
	}

	customizeColumnsForCSV() {
		this.columns.map(ele => {
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
