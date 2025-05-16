import { DatePipeFormatService } from './../../../shared/services/datePipe-format.service';
import { CustomDiallogService } from './../../../shared/services/custom-dialog.service';
import { ToastrService } from 'ngx-toastr';
import { DenialBillEnum } from './../../denial-bill-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { Page } from './../../../shared/models/listing/page';
import { Subscription, take } from 'rxjs';
import { Component, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild, EventEmitter } from '@angular/core';
import { RequestService } from '@appDir/shared/services/request.service';
import { EORService } from '@appDir/eor/shared/eor.service';
import { DenialService } from '@appDir/denial/denial.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { BillFilterModelQueryPassInApi } from '@appDir/front-desk/billing/Models/bill-filter-model-query-pass-in-api';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { changeDateFormat, getIdsFromArray, getObjectChildValue, makeDeepCopyArray, removeEmptyAndNullsFormObject, removeEmptyKeysFromObject, unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
import * as $ from 'jquery';
import { SelectionModel } from '@angular/cdk/collections';
import { EorFilterComponent } from '@appDir/eor/shared/eor-filters/eor-filter.component';
import { BillingEnum } from '@appDir/front-desk/billing/billing-enum';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { LocalStorage } from '@appDir/shared/libs/localstorage';

@Component({
	selector: 'app-denial-list-split',
	templateUrl: './denial-split-listing.component.html',
	styleUrls: ['./denial-split-listing.component.scss']
})
export class DenialSplitListComponent implements OnInit, OnDestroy {
	denialData: any[] = [];
	subscription: Subscription[] = [];
	limit: number = 10;
	page: Page = new Page();
	billId: number;
	bill_ids: number;
	case_ids: any[];
	@Input() denialFormSplit: boolean;
	@Input() denialColumnHide: boolean = false;
	@Input() adminBilling: boolean = false;
	@Input() denialbillFilterComponent: EorFilterComponent;
	@ViewChild('denialEditModal') public denialEditModal: ModalDirective;
	@Output() onChangeDataDenial = new EventEmitter();
	denialEditModelClosed: NgbModalRef;
	@ViewChild('denialEditContent') denialEditContent: any;
	billSelection = new SelectionModel<Element>(true, []);
	loadSpin: boolean = false;
	billingReciptentdata: any[] = [];
	currentBill: any;
	isItComeTofilter = true;
	actionNameOfGenrate: string;
	caseId: number;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('denialList') denialListTable: DatatableComponent;
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
	denialListingTable: any;
	selCols: any[] = [];
	facilityFilter: any;

	constructor(private requestService: RequestService,
		private storageData: StorageData,
		private eorService: EORService,
		private toastrService: ToastrService,
		private denailService: DenialService,
		private modalService: NgbModal,
		private customDiallogService: CustomDiallogService,
		public commonService: DatePipeFormatService,
		public _router: Router,
		private _route: ActivatedRoute,
		public location: Location,
		private toaster: ToastrService,
		private localStorage: LocalStorage
	) {

	}

	ngOnInit() {
		// this.page.size = this.limit;
		// this.page.pageNumber = 0;
		this.eorService.pullDoSearch().subscribe(s => {
			if (s.status && s.componet === 'Denial') {
				this.isItComeTofilter = true;
				this.page.pageNumber = 1;
				const result: any = this.eorService.makeFilterObject(this.eorService.params);
				this.facilityFilter = result?.facility_ids;
				let params = {
					...result,
					pagination: 1,
					per_page: this.page.size,
					page: 1,
					tabs:'denial'
				}
				this.page.offset = 0;
				this.onChangeDataDenial.emit(params);
			}
		});
		this._route.snapshot.pathFromRoot.forEach((path) => {
			!this.caseId ? (this.caseId = getObjectChildValue(path, null, ['params', 'caseId'])) : null;
		});
		this.closeDenialPopup();
		this.denialInfoThroughSubject();
		if(this.adminBilling) {
			this.denialListingTable = this.localStorage.getObject('denialTableList' + this.storageData.getUserId());
		}
		else {
			this.denialListingTable = this.localStorage.getObject('denialCaseTableList' + this.storageData.getUserId());
		}
	}

	ngAfterViewInit() {
		if (this.denialListTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.denialListTable._internalColumns]);
			this.columns.forEach(element => {
				if(this.denialListingTable.length) {
					let obj = this.denialListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.denialListingTable.length) {
				const nameToIndexMap = {};
				this.denialListingTable.forEach((item, index) => {
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
			this.selCols = this.denialListingTable?.length ? this.denialListingTable : [];
			this.customizeColumnsForCSV();
			this.onConfirm(false);
		}
	}

	getDenialInfo(params) {
		this.loadSpin = true;
		this.case_ids = params['case_ids'] ? params['case_ids'] : null;
		const param = removeEmptyAndNullsFormObject(params);
		// this.addUrlQueryParams(param);
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
				.sendRequest(
					DenialBillEnum.DenialGet,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					removeEmptyAndNullsFormObject(paramData),
				)
				.subscribe(
					(comingData: any) => {
						if (comingData['status'] == 200 || comingData['status'] == true) {
							this.loadSpin = false;
							console.log([...comingData.result.data])
							this.denialData = comingData.result ? [...comingData.result.data] : [];
							this.page.totalElements = comingData.result.total;
							this.page.totalPages = comingData.result.last_page;
							if (param['offset'] === 0) {
								this.page.offset = 0;
							}
							//  this.page.totalPages = this.page.totalElements / this.page.size;
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

	generateExcel(){
		let paramDataFilter: any = {};
		if (this.denialbillFilterComponent){
			let filters = this.denialbillFilterComponent.searchForm.value;
			this.filterData(filters);
			filters = removeEmptyAndNullsFormObject(filters);
			paramDataFilter = new BillFilterModelQueryPassInApi(filters);
			paramDataFilter={
				...removeEmptyKeysFromObject(paramDataFilter),	
				...{ case_ids: filters.case_ids ? [filters.case_ids] : this.adminBilling ? [] : [this.caseId]},
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
		this.subscription.push(this.requestService.sendRequest(BillingEnum.denialExcel + "?token=" + this.storageData.getToken(), 'get', REQUEST_SERVERS.fd_api_url,
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
		formData['bill_date_range1'] = formData.bill_date_range1 ? changeDateFormat(formData.bill_date_range1): null;
		formData['bill_date_range2'] = formData.bill_date_range2 ? changeDateFormat(formData.bill_date_range2): null;
		formData['created_at'] = formData.created_at ? changeDateFormat(formData.created_at): null;
		formData['updated_at'] = formData.updated_at ? changeDateFormat(formData.updated_at): null;
		formData['date_of_accident_from'] = formData.date_of_accident_from ? changeDateFormat(formData.date_of_accident_from): null;
		formData['date_of_accident_to'] = formData.date_of_accident_to ? changeDateFormat(formData.date_of_accident_to): null;
		formData['posted_date_from'] = formData.posted_date_from ? changeDateFormat(formData.posted_date_from): null;
		formData['posted_date_to'] = formData.posted_date_to ? changeDateFormat(formData.posted_date_to): null;
		formData['denial_date_from'] = formData.denial_date_from ? changeDateFormat(formData.denial_date_from): null;
		formData['denial_date_to'] = formData.denial_date_to ? changeDateFormat(formData.denial_date_to): null;
	}

	pageLimit($event) {
		this.page.offset = 0;
		this.page.size = Number($event);
		this.page.pageNumber = 1;
		this.getDenialInfo(this.paramsObject());
	}

	onPageChange(pageInfo) {
		this.page.offset = pageInfo.offset;
		this.page.pageNumber = pageInfo.offset + 1;

		//  this.onChangeDataDenial.emit(params);
		this.getDenialInfo(this.paramsObject());
	}

	onDenialEdit(row) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc body-scroll',
		};
		this.billId = row.bill_id;
		this.denailService.pushDenialId(row.id);
		this.isItComeTofilter = false;
		this.denailService.pushDenialForm(true);
		if (this.denialFormSplit) {
			this.denialEditModelClosed = this.modalService.open(
				this.denialEditContent,
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
		let token = this.storageData.getToken()
		if (token) {
			return `${link}&token=${token}`
		}
		else { return link }
	}

	onDeleteDeinal(row) {

		let param = {
			ids: [row.id]
		};
		let option = { overlay: false };
		this.isItComeTofilter = false;
		this.customDiallogService.confirm('Delete Denial', 'Do you really want to delete this Denial?')
			.then((confirmed) => {
				if (confirmed) {
					this.loadSpin = true;
					this.subscription.push(
						this.requestService.sendRequest(
							DenialBillEnum.DenialDelete,
							'delete_with_body',
							REQUEST_SERVERS.fd_api_url,
							param).subscribe((res: any) => {
								// this.page.pageNumber = 0;
								const result = this.eorService.makeFilterObject(this.eorService.params);
								this.loadSpin = false;
								if (res.status) {
									let params = {
										...result,
										pagination: 1,
										per_page: this.page.size,
										page: this.page.pageNumber,
									}
									this.onChangeDataDenial.emit(params);
									if (this.denailService.isBillId()) {
										this.page.offset = this.page.pageNumber;
										this.denailService.reloadDenialAfterAdd();
										this.denailService.pushDenialForm(true);
									}
									this.toastrService.success(res.message, "Success");
								}
							}, error => {
								this.toastrService.error(error.error.message, "Error");
								this.loadSpin = false;
							})
					);
				}
			})
			.catch();

		//   this.confirmation.create('Delete Denial', 'Do you really want to delete this Denial?',option)
		// 	.subscribe((ans: ResolveEmit) => {
		// 	  if ("resolved" in ans && ans.resolved) {

		// 	  }
		// 	});
	}


	closePopup() {
		// this.denialEditModal.hide();
		this.denialEditModelClosed ? this.denialEditModelClosed.close() : null;
		this.reloadAfterDenialUpdateByTab();
		this.ngOnDestroy();
	}

	closeDenialPopup() {
		this.denailService.pullclosedDenialPopup().subscribe(closed => {
			if (closed && this.denialFormSplit) {
				this.closePopup();
			}
		});
	}

	denialInfoThroughSubject() {
		if (!this.denialFormSplit)
			this.subscription.push(
				this.denailService.pullReloadDenial().subscribe(id => {
					this.bill_ids = id != 0 ? id : null;
					if (id != 0) {
						this.getDenialInfo({ pagination: 1, per_page: 10, page: 1, bill_ids: [id] });
						this.page.offset = 0;
					}
				}));
	}

	paramsObject() {
		const result = this.eorService.makeFilterObject(this.eorService.params);
		let params = {
			tabs:'denial',
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

	reloadAfterDenialUpdateByTab() {
		const result = this.eorService.makeFilterObject(this.eorService.params);
		// this.page.pageNumber = 1;
		// this.page.offset = 0;
		debugger;
		let params = {
			...result,
			pagination: 1,
			per_page: this.page.size,
			page: this.isItComeTofilter ? 1 : this.page.pageNumber,
			tabs:'denial'
		}
		this.onChangeDataDenial.emit(params);
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

	getRecipatentName(row,singleRow?) {
	
		if (row.recipient && (row.bill_recipient_type_id === 4)) {
			return `${(row.bill_recipient_type_id === 4 && singleRow.firm_name) ? singleRow.firm_name : ''}`;
		}
		else if (row.recipient && (row.bill_recipient_type_id === 1)){
			return `${row.recipient.first_name} ${
				row.recipient.middle_name ? row.recipient.middle_name : ''
			} ${row.recipient.last_name}`;
		}
		else if (row.recipient && row.bill_recipient_type_id === 2) {
			return row.recipient.employer_name;
		} else {
			return row.recipient ? row.recipient.insurance_name : '';
		}
	}

	sorting({sorts}){
		this.page.column = 'denial_date';
		this.page.order = sorts[0].dir;
		this.getDenialInfo(this.paramsObject());
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
		unSubAllPrevious(this.subscription);
	}
	
	denialHistoryStats(row) {
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
				this.localStorage.setObject('denialTableList' + this.storageData.getUserId(), data);
			}
			else {
				this.localStorage.setObject('denialCaseTableList' + this.storageData.getUserId(), data);
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
		this.denialListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.denialListTable._internalColumns.sort(function (a, b) {
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
