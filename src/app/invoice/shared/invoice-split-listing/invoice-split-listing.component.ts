import { OrderEnum } from './../../../shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { SelectionModel } from '@angular/cdk/collections';
import { Location } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { EORService } from '@appDir/eor/shared/eor.service';
import { BillFilterModelQueryPassInApi } from '@appDir/front-desk/billing/Models/bill-filter-model-query-pass-in-api';
import { Page } from '@appDir/front-desk/models/page';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { PaymentService } from '@appDir/payments/payment.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { CommentsModalComponent } from '@appDir/shared/components/case-comments/case-comments.component';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { getIdsFromArray, makeDeepCopyArray, removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Socket } from 'ngx-socket-io';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { InvoiceBillEnum } from '../invoice-bill-enum';
import { InvoiceService } from '../invoice.service';
import { CommentsComponent } from './comments/comments.component';
import { InvoiceFormatLoadComponent } from './invoice-format-load/invoice-format-load.component';
import {environment} from 'environments/environment';
import { InvoiceBuilderComponent } from '@appDir/front-desk/masters/builder-invoice/invoice-builder/invoice-builder.component';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';

@Component({
	selector: 'app-invoice-split-listing',
	templateUrl: './invoice-split-listing.component.html',
	styleUrls: ['./invoice-split-listing.component.scss']
})
export class InvoiceSplitListingComponent implements OnInit {
	currentInvoice: any = {};
	environment= environment;
	templateId:any;
	invoiceId:'';
	invoice_type:any='';
	invoice:any;
	activationMessage='invoice';
	loadPage=this._router.url.split("/");
	@Output() changeInvoiceData = new EventEmitter();
	@Input() showInvoiceColumn: boolean = false;
	@Input() type:any='';
	@Input() adminBilling: boolean = false;
	@Output() openPaymentModalEvent = new EventEmitter();
 	@Input() editForm: boolean;
	currentCaseId: number;
	currentInvoiceId:number;
	isUnitButtonEnable:boolean=false;
	@ViewChild('caseCommentsModal') caseCommentsModal: ModalDirective;
	commentComponent: CommentsModalComponent;
	@ViewChild('caseComments') set caseCommentsContent(content: CommentsModalComponent) {
		if (content) {
			// initially setter gets called with undefined
			this.commentComponent = content;
		}
	}
	@ViewChild('invoiceFormatsModal') invoiceFormatLoadModal: ModalDirective;
	invoiceFormatLoadComponent: InvoiceFormatLoadComponent;
	invoiceBuilderComponent: InvoiceBuilderComponent;
	@ViewChild('invoiceBuilderComponent') set setInvoiceBuilderCo(content: InvoiceBuilderComponent) {
		if (content) {
			// initially setter gets called with undefined
			this.invoiceBuilderComponent = content;
		}
	}
	@ViewChild('invoiceFormatLoad') set invoiceFormatLoadContent(content: InvoiceFormatLoadComponent) {
		if (content) {
			// initially setter gets called with undefined
			this.invoiceFormatLoadComponent = content;
		}
	}
 	bill_ids: number;
	loadSpin: boolean = false;
	page: Page;
	limit: number = 10;
	subscription: Subscription[] = [];
	invoiceData: any[] = [];
	invoiceTotalRows:number;
	invoiceBuilderPopupTittle: string= 'Generate Invoice';
	updateModalInstance: any;
	selection = new SelectionModel<Element>(true, []);
	isEdit: boolean = false;
	invoice_id;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('invoiceList') invoiceListTable: DatatableComponent;
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
	invoiceListingTable: any;

	constructor(private requestService: RequestService,
		private toastrService: ToastrService,
		private storageData: StorageData,
		private eorService: EORService,
		private invoiceService: InvoiceService,
		private paymentService: PaymentService,
		private modalService: NgbModal,
		private customDiallogService: CustomDiallogService,
		public commonService: DatePipeFormatService,
		private _router: Router,
		private location: Location,
		public socket: Socket,
		private toaster: ToastrService,
		private localStorage: LocalStorage
		) 
		{
		this.page = new Page()
		this.page.size = 10;
		this.page.pageNumber = 0;
		
	}

	ngOnInit() {
		this.page.size = this.limit;
		this.page.pageNumber = 0;
		this.eorService.pullDoSearch().subscribe((s) => {
			if (s.status && s.componet === 'Invoice') {
				const result = this.eorService.makeFilterObject(this.eorService.params);
				let param = {
					...result,
					pagination: 1,
					per_page: this.page.size || 10,
					page: 1,
					tabs: 'invoice',
				};
				this.page.offset = 0;
				this.changeInvoiceData.emit(param);
			}
		});
		if(this.type!='bill')
		this.getInvoiceThroghSubject();
		if(this.adminBilling) {
			this.invoiceListingTable = this.localStorage.getObject('invoiceTableList' + this.storageData.getUserId());
		}
		else {
			this.invoiceListingTable = this.localStorage.getObject('invoiceCaseTableList' + this.storageData.getUserId());
		}
	}
	ngAfterViewInit() {
		if (this.invoiceListTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.invoiceListTable._internalColumns]);
			this.columns.forEach(element => {
				if(this.invoiceListingTable.length) {
					let obj = this.invoiceListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.invoiceListingTable.length) {
				const nameToIndexMap = {};
				this.invoiceListingTable.forEach((item, index) => {
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
	pageLimit($event) {
		this.page.size = Number($event);
		this.page.pageNumber = 1;
		this.page.offset = 0;
		this.selection.clear();
		this.getInvoiceInfo(this.paramsObject());
	}
	onPageChange(pageInfo) {
		this.page.offset = pageInfo.offset;
		this.page.pageNumber = pageInfo.offset + 1;
		this.getInvoiceInfo(this.paramsObject());
	}
	paramsObject() {
		const result = this.eorService.makeFilterObject(this.eorService.params);
		let params = {
			per_page: this.page.size,
			pagination: 1,
			tabs: 'invoice',
			page: this.page.pageNumber,
			order: this.page.order,
			column: this.page.column,
			...result,
		};
		// if (this.bill_ids) {
		// 	params['bill_ids'] = this.bill_ids;
		// }
		// if (this.case_ids) {
		// 	params['case_ids'] = this.case_ids;
		// }
		return params;
	}
	
	getInvoiceInfo(params) {
		this.loadSpin = true;
		// let param1 = {
		// 	pagination: 1,
		// 	per_page: this.page.size,
		// 	page: this.page.pageNumber + 1,
		// };
		const param = removeEmptyAndNullsFormObject(params);
		this.currentCaseId=param['case_ids']?param['case_ids'][0]:this.currentCaseId;
		if(this.loadPage[1]!="bills"){
			params['case_ids']=this.currentCaseId?[this.currentCaseId]:[this.loadPage[4]]
		}
		this.addUrlQueryParams(param);
		const paramData = new BillFilterModelQueryPassInApi(param);
		this.page.size = paramData['per_page'];
		this.subscription.push(
			this.requestService
				.sendRequest(InvoiceBillEnum.Invoice_Bill_List_Get, 'GET', REQUEST_SERVERS.fd_api_url,
					removeEmptyAndNullsFormObject(paramData))
				.subscribe(
					(comingData: any) => {
						if (comingData['status'] == 200 || comingData['status'] == true) {
							this.loadSpin = false;
							this.invoiceData = comingData.result ? [...comingData.result.data] : [];
							this.page.totalElements = comingData.result.total;
							this.selection.clear();
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

	resetList(){
		this.setPage();
	}

	generteEnvelope() {
		let url;
		const selected = this.selection.selected;
		const ids = selected.map((row) => row.id);
		let params :any=  {
			invoice_ids:ids
		}
		this.loadSpin = true;
		this.requestService
			.sendRequest(InvoiceBillEnum.Invoice_Generte_Envelope, 'url_base_with_token', REQUEST_SERVERS.fd_api_url)
			.subscribe((res) => {
				url = res + '&';
				this.loadSpin = false;

			},err=>{
				this.loadSpin = false;
			});

		if (params && params.invoice_ids && params.invoice_ids.length != 0) {
			params.invoice_ids.forEach((invoice, index) => {
				url = `${url}invoice_ids[]=${invoice}${params.invoice_ids.length - 1 == index ? '' : '&'}`;
				if (params.invoice_ids.length - 1 === index) {
					window.open(url);
				}
			});
		}
	} 
	

	
	getInvoiceLink(row) {

		let link1 = `${this.environment.fd_api_url}invoice/get/pdf?id='${row.id}`;
		if (row && row.id) {
			window.open(this.getLinkwithAuthToken(link1));
		}
	}
	getLinkwithAuthToken(link) {
		let token = this.storageData.getToken()
		if (token) {
			return `${link}&token=${token}`
		}
		else { return link }
	}
	// getInvoiceLink(row){
	// 	this.subscription.push(
	// 		this.requestService
	// 			.sendRequest(InvoiceBillEnum.Invoice_PDF_Link, 'get', REQUEST_SERVERS.fd_api_url, {
	// 				id: row.id,
	// 			})
	// 			.subscribe((response: any) => {
	// 				if (response.status === 200 || response.status == true) {
	// 					// this.id = response['result']['data']['label_id'];
	// 					// this.openBillPdfListing(
	// 					// 	response['result']['data'] && response['result']['data']['bill_recipients']
	// 					// 		? response['result']['data']['bill_recipients']
	// 					// 		: [],
	// 					// 		response['result'] && response['result']['data'] ? response['result']['data'] : {}
	// 					// );
	// 				} else {
	// 					this.loadSpin = false;
	// 					this.toastrService.error(response.message, 'Failed');
	// 				}
	// 			}),
	// 	);
	// }
	getInvoiceThroghSubject() {
			this.subscription.push(
				this.invoiceService.pullReloadInvoice().subscribe((id) => {
					// this.bill_ids = id ? id : null;
					// if (id != 0) {
						this.getInvoiceInfo({ pagination: 1, per_page: 10, page: 1});
						this.page.offset = 0;
					// }
				}),
			);
		// }
	}
	// getInvoiceToIndex(value:any[]=[]){
	// 	return 0
	// }
	invoicesformatlist;
	setPage($event?){
		this.getInvoiceInfo({ pagination: 1, per_page: 10, page: 1});

	}

	onResetFilters(){
		
	}
	saveUpdateInvoiceBuilder($event?){

	}
	getInvoiceToName(row,singleRow?){
		let concatedNames:string = ''
		if(row){
			for(var i = 0; i<row.length; i++){
				concatedNames += `${row[i].name}${row.length!=i? 
					row[i] && row[i].name && row[i].name.length<10?
					row.length>1?", ":'':'  ':''}`; 
			}
		}
		return concatedNames
	}
	onDeleteInvoice(selectId?){
		const temp = [selectId];
		const selected = this.selection.selected;
		const ids =selectId?temp:selected.map((row) => row.id);

		this.customDiallogService.confirm('Delete Confirmation?', `Are you sure you want to delete?`,'Yes','No')
		.then((confirmed) => {
			if (confirmed){
				this.subscription.push(
					this.requestService.sendRequest(InvoiceBillEnum.Invoice_Bill_List_Delete,'DELETE',REQUEST_SERVERS.fd_api_url,{id:ids}).subscribe(
						(res)=>{
							this.selection.clear();
							// this.setPage({ offset: this.page.pageNumber});
							this.invoiceData = this.removeMultipleFromArr(this.invoiceData,ids,'id');
							this.invoiceData = this.invoiceData;
							this.toastrService.success('Successfully Deleted', 'Success');
						}
					)
				)
			}else if(confirmed === false){
				
			}else{
				
			}
		})
		.catch();

	
	}
	private removeMultipleFromArr<T>(data: T[], toBeDeleted: Array<T>, key): T[] {
		return data.filter(
			(row) => row[`${key}`] !== toBeDeleted.find((element) => row[`${key}`] === element),
		);
	}
	getCommentsBilling(row, actions?) {
		this.caseCommentsModal.show();
		let billingCommentCategoryObject=this.commentComponent.categories.find(category => category.slug === "invoice");
		this.commentComponent.selectedCategories = [billingCommentCategoryObject];
		let selectedCategory=billingCommentCategoryObject;
		if (selectedCategory && selectedCategory.id) {
			this.commentComponent.addCategoryList = [selectedCategory.id];
		}
		this.commentComponent.presentPage = 1;
		this.commentComponent.showCategory = true;
		this.commentComponent.form.controls['object_id'].setValue(row.id);
		this.commentComponent.objectId=row.id;
		this.currentInvoiceId = row.id;
		this.commentComponent.label = row?.invoice_id;
		this.commentComponent.comments = [];
		this.currentCaseId = row.case_id;
		this.commentComponent.slug='invoice';
		this.commentComponent.getComments(1, this.currentCaseId);
		let data = {invoice_id: row.id};
		this.socket.emit('GETCASECOMMENTS', data);
	}
	LoadInvoiceFormats() {
		let queryParams = {
			// order: OrderEnum.ASC,
			// per_page: this.page.size,
			// page: 1,
			// pagination: 1
		  }
		this.invoiceFormatLoadComponent.getInvoiceFormatList({});
		this.invoiceFormatLoadComponent && this.invoiceFormatLoadComponent.searchForm?this.invoiceFormatLoadComponent.searchForm.reset():null;
		this.invoiceFormatLoadComponent?this.invoiceFormatLoadComponent.resetDataFilter():null;
		this.invoiceFormatLoadModal.show();
	}
	editInvoice(row,invoiceBuilderContentModal){
		this.invoiceBuilderPopupTittle = 'Update INV-' + row.id;
		this.isEdit = true;
		this.invoiceBuilderComponent;
		
		this.templateId = row.invoice_template_id;
		this.invoice_id = row.id;
		this.currentCaseId = row.case_id;
		this.invoice_type=row?.invoice_category;
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc payment-modal body-scroll',
		};
		this.updateModalInstance = invoiceBuilderContentModal;
		this.modalService.open(invoiceBuilderContentModal, ngbModalOptions);

	}
	openInvoiceBuilderEvent($event,invoiceContent){
		this.invoiceBuilderPopupTittle = 'Generate Invoice';
		this.isEdit = false;
		this.templateId = $event.id;
		this.isUnitButtonEnable =
      $event && $event.isUnitButtonEnable ? true : false;
		this.invoiceFormatLoadModal.hide();
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc payment-modal body-scroll',
		};
		this.modalService.open(invoiceContent, ngbModalOptions);	
	 }
	isInvoiceAllSelected(){
		this.invoiceTotalRows = this.invoiceData.length;
		const numSelected = this.selection.selected.length;
		const numRows = this.invoiceTotalRows;
		return numSelected === numRows
	}
	invoicesmasterToggle(): void {
		this.isInvoiceAllSelected()
			? this.selection.clear()
			: this.invoiceData
					.slice(0, this.invoiceTotalRows)
					.forEach((row) => this.selection.select(row));
	}
	addUrlQueryParams(params: any): void {
		this.location.replaceState(this._router.createUrlTree([], { queryParams: params }).toString());
	}
	openPaymentModal(row, paymentContent) {
		debugger;
		row['bill_amount'] = row['amount_due'];
		this.openPaymentModalEvent.emit(row);
	
	}
	openInvoicePdfViewModal(row, pdfViewModal) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc payment-modal body-scroll',
		};
		this.modalService.open(pdfViewModal, ngbModalOptions);
		this.invoiceId = row.id?row.id:null;
		this.invoice=row;
	}

	updateInvoice($event){
		this.modalService.dismissAll();
	}

	refreshComponent($event,pdfViewModal){
		this.invoiceId=$event;
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'pdf-view-custom body-scroll',
			};
		this.modalService.open(pdfViewModal, ngbModalOptions);
		this.getInvoiceInfo(this.paramsObject());
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
				this.localStorage.setObject('invoiceTableList' + this.storageData.getUserId(), data);
			}
			else {
				this.localStorage.setObject('invoiceCaseTableList' + this.storageData.getUserId(), data);
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
		this.invoiceListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.invoiceListTable._internalColumns.sort(function (a, b) {
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

	historyStats(row) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc body-scroll history-modal',
			modalDialogClass: 'modal-lg'
		};
		let modelRef = this.modalService.open(CreatedHistoryComponent,ngbModalOptions);
		modelRef.componentInstance.createdInformation = [row];
	}
}
