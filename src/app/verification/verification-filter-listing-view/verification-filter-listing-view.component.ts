import { DatePipeFormatService } from './../../shared/services/datePipe-format.service';
import {
	Component,
	EventEmitter,
	Input,
	OnDestroy,
	OnInit,
	Output,
	ViewChild
} from '@angular/core';
import { CustomDiallogService } from './../../shared/services/custom-dialog.service';
import { EORService } from '@appDir/eor/shared/eor.service';
import { Page } from '@appDir/front-desk/models/page';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription, take } from 'rxjs';
import { VerificationBillEnum } from '../verification-bill-enum';
import { VerificationService } from '../verification.service';
import { DataTableColumnDirective, DatatableComponent, DatatableRowDetailDirective } from '@swimlane/ngx-datatable';
import { BillFilterModelQueryPassInApi } from '@appDir/front-desk/billing/Models/bill-filter-model-query-pass-in-api';
import { ActivatedRoute, Router } from '@angular/router';
import { Location, LocationStrategy } from '@angular/common';
import { changeDateFormat, getIdsFromArray, getObjectChildValue, makeDeepCopyArray, removeEmptyAndNullsFormObject, removeEmptyKeysFromObject, unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
import * as $ from 'jquery';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { EorFilterComponent } from '@appDir/eor/shared/eor-filters/eor-filter.component';
import { BillingEnum } from '@appDir/front-desk/billing/billing-enum';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { LocalStorage } from '@appDir/shared/libs/localstorage';

@Component({
	selector: 'app-verification-filter-listing-view',
	templateUrl: './verification-filter-listing-view.component.html',
	styleUrls: ['./verification-filter-listing-view.component.scss'],
})
export class VerificationFilterListingViewComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	limit: number = 10;
	page: Page = new Page();
	billId: number;
	bill_ids: number;
	case_ids: any[];
	@Input() currentBill: any;
	@Input() adminBilling: boolean = false;
	@Input() verificationbillFilterComponent: EorFilterComponent
	@Input() currentVerificationRecived:any;
	@Output() onChangeDataVerification = new EventEmitter();
    chekedItems: boolean[][] = [];
	verificationModelClosed: NgbModalRef;
	verificaitionEditModelClosed: NgbModalRef;
	verificaitionSentEditModelClosed: NgbModalRef;
	verificaitionSentReceivedModelClosed: NgbModalRef;
	selectAll:boolean=false;
	@ViewChild('verificaitionSentContent') verificaitionSentContent: any;
	@ViewChild('verificaitionEditContent') verificaitionEditContent: any;
	@ViewChild('verificaitionSentEditContent') verificaitionSentEditContent:any;
	@ViewChild('verificaitionSentReceivedContent') verificaitionSentReceivedContent:any;
	loadSpin: boolean = false;
	billingReciptentdata: any[] = [];
	@ViewChild('verficationSentTable') verficationSentTable: DatatableComponent;
	verficationSentIndex:number = 0;
	verficiationSentOffset:number = 0;
	verificationSentData:any[] = [];
	@Output() addManualAppealEmitter = new EventEmitter();
	verificationSentInfo:any;
	isItComeTofilter = true;
	SelectionType = SelectionType;
	selected = [];
	caseId: number;
	verfSent: boolean = false;
	verfReceived: boolean = false;
	verificationSent: boolean;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('verificationList') verificationListTable: DatatableComponent;
	@ViewChild('myDetailRow') myDetailRow: DatatableRowDetailDirective;
  	@ViewChild('innerTable') innerTable: DatatableComponent;
	customizedColumnComp: CustomizeColumnComponent;
	@ViewChild(CustomizeColumnComponent) set con(con: CustomizeColumnComponent) {
		if (con) { // initially setter gets called with undefined
		  this.customizedColumnComp = con;
		}
	}
	modalCols :any[] = [];
	modalColsSent :any[] = [];
	columns: any[] = [];
	alphabeticColumns:any[] =[];
	colSelected: boolean = true;
  	isAllFalse: boolean = false;
	colSelectedSent: boolean = true;
  	isAllFalseSent: boolean = false;
	verificationListingTable: any;
	selCols: any[] = [];
	verfSentData: any[] = [];
	facilityFilter: any;

	constructor(
		private requestService: RequestService,
		private storageData: StorageData,
		private eorService: EORService,
		private toastrService: ToastrService,
		private modalService: NgbModal,
		public verificationService: VerificationService,
  		private customDiallogService: CustomDiallogService,
		public commonService:DatePipeFormatService,
		public _router: Router,
		private _route: ActivatedRoute,
		public location: Location,
		private toaster: ToastrService,
		private localStorage: LocalStorage
	) {}

	OpenBulkVarificationModal() {
		if(!this.isSameSeleted) {
			this.toastrService.error('You cannot reply verification as case ids are not same', "Error");
			return false;
		}
		let tump: any[] = [];
		this.selected.forEach((e) => {
			tump.push(e);
		});
		this.addmanualAppeal(tump, true);
		this.selected.length = 0;
	}

	get isSameSeleted() {
		if (this.selected.length == 0 || this.selected.length == 1)
			return false;
		let tump: any[] = [];
		let fistOne = this.selected[0];
		tump.push(fistOne);
		for (let i = 1; i < this.selected.length; i++) {
			if (!(this.selected[i].case_id == fistOne.case_id))
				return false;
		}
		return true;
	}

	checkAll(){
		this.selectAll = !this.selectAll;
		this.selected=this.selectAll?[...this.verificationSentData]:[]
	}

	onCheckboxChangeFn(event, row) {
		if(event.target.checked) {
			this.selected.push(row);
		}
		if(!event.target.checked) {
			const index = this.selected.indexOf(row);
			this.selected.splice(index, 1);
		}
		this.isSameSeleted;
		this.selectAll=this.selected.length==this.verificationSentData.length;
	}

	ngOnInit() {
		this.page.size = this.limit;
		this.page.pageNumber = 0;
		this.eorService.pullDoSearch().subscribe((s) => {
			if (s.status && s.componet === 'Verification') {
				const result: any = this.eorService.makeFilterObject(this.eorService.params);
				this.facilityFilter = result?.facility_ids;
				this.page.pageNumber = 1;
				this.isItComeTofilter = true;
				let params = {
					...result,
					pagination: 1,
					per_page: this.page.size || 10,
					page: 1,
					tabs:'verification',
					case_ids: result['case_ids'] ? result['case_ids'] : this.case_ids,
				};
				this.page.offset = 0;
				this.getVerificationViewInfo(params, true);
			}
		});
		this._route.snapshot.pathFromRoot.forEach((path) => {
			!this.caseId ? (this.caseId = getObjectChildValue(path, null, ['params', 'caseId'])) : null;
		});
		this.reloadVerificationList();
		if(this.adminBilling) {
			this.verificationListingTable = this.localStorage.getObject('verificationTableList' + this.storageData.getUserId());
		}
		else {
			this.verificationListingTable = this.localStorage.getObject('verificationCaseTableList' + this.storageData.getUserId());
		}
	}

	ngAfterViewInit() {
		if (this.verificationListTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.verificationListTable._internalColumns]);
			this.columns.forEach(element => {
				if(this.verificationListingTable.length) {
					let obj = this.verificationListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.verificationListingTable.length) {
				const nameToIndexMap = {};
				this.verificationListingTable.forEach((item, index) => {
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
			this.selCols = this.verificationListingTable?.length ? this.verificationListingTable : [];
			this.customizeColumnsForCSV();
			this.onConfirm(false);
		}
	}

	getVerificationViewInfo(param, search?) {

		this.loadSpin =true;
		this.selected = [];
		if(!search){
			this.case_ids = param['case_ids'] ? param['case_ids'] : null;
		}
		const params = removeEmptyAndNullsFormObject(param);
		// this.addUrlQueryParams(params);
		this.addUrlQueryParams({
			pagination: param.pagination,
			per_page: param.per_page,
			offset: param.offset,
			tabs: param.tabs
		});
		const paramData = new BillFilterModelQueryPassInApi(params);
		this.page.size = paramData['per_page'];
		this.selectAll=false;
		this.subscription.push(
			this.requestService
				.sendRequest(
					VerificationBillEnum.Verification_View,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					removeEmptyAndNullsFormObject(paramData),
				)
				.subscribe(
					(comingData: any) => {
						if (comingData['status'] == 200 || comingData['status'] == true) {
							this.loadSpin =false;
							this.verificationSentData = comingData.result ? [...comingData.result.data] : [];
							this.page.totalElements = comingData.result.total;
							this.page.totalPages = comingData.result.last_page;
							//  this.page.totalPages = this.page.totalElements / this.page.size;
						}
						setTimeout(() => {
							$('datatable-body').scrollLeft(1);
						}, 50);
					},
					(err) => {
						this.loadSpin =false;
					},
				),
		);
	}

	verificationModal() {
		// if(this.adminBilling && !this.facilityFilter) {
		// 	this.toastrService.info('Practice-Location filter is required before exporting to CSV', 'Info');
		// 	return;
		// }
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc body-scroll',
		};
		this.verificaitionSentReceivedModelClosed = this.modalService.open(
			this.verificaitionSentReceivedContent,
			ngbModalOptions,
		);
	}

	closeVerificationModal() {
		this.verificaitionSentReceivedModelClosed.close();
		this.verfSent = false;
		this.verfReceived = false;
	}

	onVerificationSent(value: boolean) {
		this.verfSent = value;
	}

	onVerificationReceived(value: boolean) {
		this.verfReceived = value;
	}

	generateExcel() {
		if(!this.verfSent && !this.verfReceived) {
			this.toastrService.error('Verification Sent or Verification Received not selected', "Error");
			return false;
		}
		let paramDataFilter: any = {};
		if (this.verificationbillFilterComponent){
			let filters = this.verificationbillFilterComponent.searchForm.value;
			this.filterData(filters);
			filters=removeEmptyAndNullsFormObject(filters);
			paramDataFilter = new BillFilterModelQueryPassInApi(filters);
			paramDataFilter={
				...removeEmptyKeysFromObject(paramDataFilter),	
				...{ case_ids: filters.case_ids ? [filters.case_ids] : this.adminBilling ? [] : [this.caseId]},
				order_by: OrderEnum.DEC,
				order: 'id'
			}
		}
		let verfReceivedCols: any[] = [];
		let verfSentCols: any[] = [];
		if(this.selCols?.length) {
			this.selCols?.map(ele => {
				if(ele?.prop == 'actions') {
					verfReceivedCols.push('created_at')
					verfReceivedCols.push('updated_at')
					verfReceivedCols.push('created_by')
					verfReceivedCols.push('updated_by')
				}
				else {
					if(ele?.prop == 'appeal_status' || ele?.prop == 'verification_received_date' || 
					ele?.prop == 'verification_received_description' || ele?.prop == 'no_of_days' || 
					ele?.prop == 'verification_type' || ele?.prop == 'no_of_days_appeal') {
						verfReceivedCols.push(ele?.prop)
					}
					else if(ele?.prop == 'verification_received_file') {}
					else {
						verfReceivedCols.push(ele?.prop)
						verfSentCols.push(ele?.prop)
					}
				}
			})
		}
		if(this.verfSentData?.length) {
			this.verfSentData?.map(key => {
				if(key?.prop == 'actions') {
					verfSentCols.push('created_at')
					verfSentCols.push('updated_at')
					verfSentCols.push('created_by')
					verfSentCols.push('updated_by')
				}
				else {
					verfSentCols.push(key?.prop)
				}
			})
		}
		let paramDataFilterReceived = {
			...paramDataFilter,
			custom_columns: JSON.stringify(verfReceivedCols)
		}
		let paramDataFilterSent = {
			...paramDataFilter,
			custom_columns: JSON.stringify(verfSentCols)
		}
		if(this.verfSent) {
			this.subscription.push(this.requestService.sendRequest(BillingEnum.verificationSentExcel + "?token=" + this.storageData.getToken(), 'get', REQUEST_SERVERS.fd_api_url,
			paramDataFilterSent,
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
		if(this.verfReceived) {
			this.subscription.push(this.requestService.sendRequest(BillingEnum.verificationReceivedExcel + "?token=" + this.storageData.getToken(), 'get', REQUEST_SERVERS.fd_api_url,
			paramDataFilterReceived,
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
		this.closeVerificationModal();
	}
	
	filterData(formData: any) {
		formData['verification_date_from'] = formData.verification_date_from ? changeDateFormat(formData.verification_date_from): null;
		formData['verification_date_to'] = formData.verification_date_to ? changeDateFormat(formData.verification_date_to): null;
		formData['sent_date'] = formData.sent_date ? changeDateFormat(formData.sent_date): null;
	}

	onPageChange(pageInfo) {
		this.page.offset = pageInfo.offset;
		this.page.pageNumber = pageInfo.offset + 1;
		this.getVerificationViewInfo(this.paramsObject());
	}

	pageLimit(e) {
		this.page.offset = 0;
		this.page.size = Number(e);
		this.page.pageNumber = 1;
		this.getVerificationViewInfo(this.paramsObject());
	}

	viewDocFile(row, fieldName?) {
		debugger;
		if (fieldName === 'sent') {
			if (row && row.sent_media && row.sent_media.pre_signed_url) {
				window.open(row.media.pre_signed_url);

			}
		} else {
			if (row && row.media && row.media.pre_signed_url) {
				window.open(row.media.pre_signed_url);
			}
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

	paramsObject() {
		const result = this.eorService.makeFilterObject(this.eorService.params);

		let params = {
			...result,
			tabs:'verification',
			per_page: this.page.size || 10,
			pagination: 1,
			page: this.page.pageNumber,
			case_ids: this.case_ids,
			order: this.page.order,
			column: this.page.column,
		};
		return params;
	}

	onDeleteVerficiationSentData(row){
		this.onDeleteVerificationSent(row.id , row.verification_received_id);
	}

	onDelete(row) {
		debugger;
		if (row.sent_id) {
			this.onDeleteVerificationSent(row.sent_id , row.verification_received_id);
		} else {
			this.onDeleteVerficationRecived(row.verification_received_id);
		}
	}

	onDeleteVerficationRecived(id) {
		let param = {
			ids: [id],
		};
		
		let option = { overlay: false };
		this.isItComeTofilter = false;
		this.customDiallogService.confirm('Delete Verification Received',
		'Do you really want to delete this Verification Received?')
		.then((confirmed) => {
			if (confirmed){
				this.loadSpin = true;
				this.subscription.push(
					this.requestService
						.sendRequest(
							VerificationBillEnum.VerificationRecivedDelete,
							'delete_with_body',
							REQUEST_SERVERS.fd_api_url,
							param,
						)
						.subscribe(
							(res: any) => {
								if (res.status) {
									this.loadSpin = false;
									this.verificationViewApiCallByOnePage();
									this.toastrService.success(res.message, 'Success');
								}
							},
							(error) => {
								this.loadSpin = false;
								//  this.toastrService.error(error.error.message, "Error");
							},
						),
				);
			}
		})
		.catch();
	}

		
		
	addmanualAppeal(row: any[], bulkReply) {
		row['addBulkReply'] = bulkReply;
		this.addManualAppealEmitter.emit(row);
		let ids: any[] = row.map( i => i.id );
		this.verificationService.setVerificationReceivedId(ids);
	}

	onDeleteVerificationSent(id, verificationId) {
		let param = {
			ids: [id],
			verification_id:verificationId
		};
		let option = { overlay: false };
		this.isItComeTofilter = false;
		this.customDiallogService.confirm('Delete Verification Sent',
		'Do you really want to delete this Verification Sent?')
		.then((confirmed) => {
			if (confirmed){
				
				this.subscription.push(
					this.requestService
						.sendRequest(
							VerificationBillEnum.VerificationSentDelete,
							'delete_with_body',
							REQUEST_SERVERS.fd_api_url,
							param,
						)
						.subscribe((res: any) => {
							this.verificationViewApiCallByOnePage();
							this.toastrService.success(res.message, 'Success');
						}),
				);
			}
		})
		.catch();
	}

	replyVerification(row) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc body-scroll',
		};
		this.currentBill = row;
		this.isItComeTofilter = false;
		this.verificationService.setVerificationReceivedId(row.verification_id);
		this.verificationModelClosed = this.modalService.open(
			this.verificaitionSentContent,
			ngbModalOptions,
		);
	}

	verificationSentDelete() {}

	saveVerificationEmitter($event) {
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
						this.toastrService.success(comingData.message, 'Success');
					}
				}),
		);
	}

	setCurrentBill(bill) {
		this.currentBill = bill;
	}

	verificationRecivedEdit(e){
		if(e){
			this.verificaitionEditModelClosed.close();
			this.verificationViewApiCallByOnePage();
		}
	}

	editVerificationEmitter(e) {
		
		if (e){
		this.verificaitionSentEditModelClosed.close();
		this.verificationViewApiCallByOnePage();
		}

	}

	onVerificationSentEdit(row) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc body-scroll',
		};
		this.billId = row.bill_id || row.verification.bill_id;
		this.verificationSentInfo= row;

		this.verificationService.pushVerificationId(row.id);
		this.verificationService.pushVerificationForm(true);

		this.verificaitionSentEditModelClosed = this.modalService.open(
			this.verificaitionSentEditContent,
			ngbModalOptions,
		);
	}

	onVerificationReceivedEdit(row) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc body-scroll',
		};
		debugger;
		this.billId = row.bill_id;
		this.verificationService.pushVerificationId(row.id);
		this.verificationService.pushVerificationForm(true);
		this.isItComeTofilter = false;
		this.verificaitionEditModelClosed = this.modalService.open(
			this.verificaitionEditContent,
			ngbModalOptions,
		);
	}

	verificationViewApiCallByOnePage(){
	
		// this.page.offset = 0;
		const result = this.verificationbillFilterComponent?.searchForm?.value;
		this.getVerificationViewInfo({...result,...this.paramsObject()});
	}

	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}

	reloadVerificationList(){
		this.verificationService.pullVerificationViewFilterListReload().subscribe(reload => {
			if(reload){
				let params = {
					pagination: 1,
					per_page: this.page.size,
					page: this.isItComeTofilter ? 1 : this.page.pageNumber,
					case_ids: this.case_ids,
				};
				// this.page.offset = 0;
				const result = this.verificationbillFilterComponent?.searchForm?.value;
				this.getVerificationViewInfo({...result,...params},true);
				
			}
		});
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

	viewVerificationSent(row, rowIndex, expanded) {
		row['expanded'] = !expanded;
		this.verficationSentIndex = rowIndex;
		this.verficationSentTable.rowDetail.toggleExpandRow(row);
		}


		verificationsentPagination(pageInfo,row){
			this.verficiationSentOffset = pageInfo.offset;
			//  this.verificationsentDetail(row);
		}
	

		verificationsentDetail($event) {
			// if ($event.value && !$event.value['expanded']) {
			// 	return false;
			// }
			if ($event.value || $event.id) {
				let data = {
					verification_received_id: $event.id || $event.value.id ,
					pagination: 1,
					per_page:10,
					page: this.verficiationSentOffset+1,
				};
				this.subscription.push(
					this.requestService.sendRequest(VerificationBillEnum.VerificationSentGet, 'get', REQUEST_SERVERS.fd_api_url, data).subscribe(
						(res: any) => {
							if (res.status && res.result && res.result.data) {
								this.verificationSentData[this.verficationSentIndex].verifySentResponse = res.result && res.result.data ? res.result.data : res.data;
								this.verificationSentData[this.verficationSentIndex].verifySentResponse = [...this.verificationSentData[this.verficationSentIndex].verifySentResponse];
								this.verificationSentData[this.verficationSentIndex]['totalChildRecord'] = res.result && res.result.total ? res.result.total : res.result.data.length;
						
							}
							else {
								this.toastrService.error(res.message, "Error");
							}
						},
						err => {
						})
				);
		
			}
		
		}

		sorting({sorts}){
			this.page.column = 'verification_date';
			this.page.order = sorts[0].dir;
			this.getVerificationViewInfo(this.paramsObject());
		}
	
		/**
	 * Queryparams to make unique URL
	 * @param params
	 * @returns void
	 */
	addUrlQueryParams(params: any): void {
		this.location.replaceState(this._router.createUrlTree([], { queryParams: params }).toString());
	}

	openCustomoizeColumn(CustomizeColumnModal) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal-lg-package-generate',
		};
		this.modalCols = [];
		this.modalColsSent = [];
		let self = this;
		this.columns.forEach(element => {
			let obj = self.alphabeticColumns.find(x => x?.name === element?.name);
			if(obj) {
				this.modalCols.push({ header: element?.name, checked: obj?.checked });
			}
		});
		this.modalColsSent.push(
			{
			header: 'Verification Sent Date',
			prop: 'verification_sent_date',
			checked: true
			},
			{
			header: 'No. Of Days',
			prop: 'no_of_days',
			checked: true
			},
			{
			header: 'Verification Sent Description',
			prop: 'description',
			checked: true
			},
			{
			header: 'Actions',
			prop: 'actions',
			checked: true
			}
		)
		this.CustomizeColumnModal.show();
	}

	onConfirm(click) {
		if ((this.isAllFalse && !this.colSelected) || (this.isAllFalseSent && !this.colSelectedSent)) {
			this.toastrService.error('At Least 1 Column is Required From Each Side.','Error');
			return false;
		}
		this.verfSentData = [];
		if(click) {
			this.customizedColumnComp;
			this.modalCols = makeDeepCopyArray(this.customizedColumnComp?.modalCols)
			this.modalColsSent = makeDeepCopyArray(this.customizedColumnComp?.modalColsSent)
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
			this.modalColsSent.forEach(ele => {
				if(ele?.checked) {
					this.verfSentData.push({
						prop: ele?.prop
					})
				}
			})
			if(this.adminBilling) {
				this.localStorage.setObject('verificationTableList' + this.storageData.getUserId(), data);
			}
			else {
				this.localStorage.setObject('verificationCaseTableList' + this.storageData.getUserId(), data);
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
		else {
			this.verfSentData.push(
				{
				prop: 'verification_sent_date'
				},
				{
				prop: 'no_of_days'
				},
				{
				prop: 'description'
				},
				{
				prop: 'actions'
				}
			)
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
		this.verificationListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.verificationListTable._internalColumns.sort(function (a, b) {
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
	
	onSelectSentHeaders(isChecked) {
		this.colSelectedSent = isChecked;
		if(!isChecked) {
			this.isAllFalseSent = true;
		}
	}

	onSingleSelection(isChecked) {
		this.isAllFalse = isChecked;
		if(isChecked) {
			this.colSelected = false;
		}
	}
		onSingleSelectionSent(isChecked) {
		this.isAllFalseSent = isChecked;
		if(isChecked) {
			this.colSelectedSent = false;
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

	historyStats(row) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop:'static',
			keyboard: false,
			windowClass: 'modal_extraDOc body-scroll history-modal',
			modalDialogClass: 'modal-lg'
		};
		let modelRef = this.modalService.open(CreatedHistoryComponent,ngbModalOptions);
		modelRef.componentInstance.createdInformation = [row];
	}
	verficationReplies:any[]=[]
	generatePom(POMModal) {
	this.getReplies(POMModal)
	}

	getReplies(POMModal:any) {
		this.loadSpin = true;
		const verification_ids = this.selected.map(verification => verification.id);
		const paramData = {};
		paramData['verification_ids'] = verification_ids;
		this.subscription.push(
		  this.requestService
			.sendRequest(
			  VerificationBillEnum.Get_verification_reply,
			  'GET',
			  REQUEST_SERVERS.fd_api_url,
			  removeEmptyAndNullsFormObject(paramData),
			).subscribe((res: any) => {
			  if (res?.status) {
				this.verficationReplies=[];
				let verficationReplies = res?.result?.data || [];
				verficationReplies.forEach((reply:any)=>{
					reply?.verification_sent?.forEach((repsend:any)=>{
						this.verficationReplies.push({
							recieve_date:reply?.date,
							recieve_description:reply?.description,
							...reply,
							...repsend
						})
					})
				})
				if(this.verficationReplies.length){
					const ngbModalOptions: NgbModalOptions = {
						backdrop: 'static',
						keyboard: false,
						modalDialogClass: 'modal-width-xxl'
					};
					this.modalService.open(POMModal, ngbModalOptions);
					
				}
				this.loadSpin = false;
			  }
			}, (err) => {
			  this.loadSpin = false;
			})
		)
	  }
	

}
