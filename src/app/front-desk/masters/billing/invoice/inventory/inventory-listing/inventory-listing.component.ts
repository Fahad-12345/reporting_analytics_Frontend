import { InventoryEnumUrls } from './../inventory-enum-urls';
import { SelectionModel } from '@angular/cdk/collections';
import { Location } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Page } from '@appDir/front-desk/models/page';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { AclService } from '@appDir/shared/services/acl.service';
import { isEmptyObject, checkReactiveFormIsEmpty, isObjectEmpty, makeDeepCopyArray, getIdsFromArray } from '@appDir/shared/utils/utils.helpers';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { HttpSuccessResponse, StorageData } from '@appDir/pages/content-pages/login/user.class';
import { ToastrService } from 'ngx-toastr';
import { RequestService } from '@appDir/shared/services/request.service';
import { InventoryDetailModel } from '../inventory.model';
import * as CryptoJS from 'crypto-js';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';

@Component({
	selector: 'app-inventory-listing',
	templateUrl: './inventory-listing.component.html',
	styleUrls: ['./inventory-listing.component.scss']
})
export class InventoryListingComponent extends PermissionComponent implements OnInit, AfterViewInit {
	selection = new SelectionModel<Element>(true, []);
	isCollapsed = false;
	modalRef: NgbModalRef;
	hasId = false;
	page: Page;
	totalRows: number;
	inventorydetail: InventoryDetailModel;
	queryParams: ParamQuery;
	showTable: Boolean = false;
	inventories: any[] = [];
	public loadSpin: boolean = false;
	public searchForm: FormGroup;
	@ViewChild('content') modelClose: ElementRef;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('inventoryList') inventoryListTable: DatatableComponent;
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
	inventoryListtingTable: any;


	constructor(private fb: FormBuilder, 
		public aclService: AclService, 
		private rou: Router, 
		private modalService: NgbModal, 
		protected requestService: RequestService,
		public route: ActivatedRoute, 
		public commonService: DatePipeFormatService,
		private location: Location, 
		private customDiallogService : CustomDiallogService, 
		private toastrService: ToastrService,
		private storageData: StorageData,
		private localStorage: LocalStorage
		) {
		super(aclService, rou);
		this.page = new Page();
		this.page.pageNumber = 0;
		this.page.size = 10;
	}

	ngOnInit() {
		this.totalRows = this.inventories.length;
		this.inventories = this.inventories;
		this.searchForm = this.fb.group({
			name: [''],
			description: [''],
			unit_price: [''],
			quantity: [''],
			comment: ['']
		})
		this.subscription.push(
			this.route.queryParams.subscribe((params) => {
				this.searchForm.patchValue(params);
				this.page.size = parseInt(params.per_page) || 10;
				this.page.pageNumber = parseInt(params.page) || 1;
				this.page.size = parseInt(params.per_page) || 10;
			}),
		);
		this.setPage({ offset: this.page.pageNumber - 1 || 0 });
		this.inventoryListtingTable = this.localStorage.getObject('inventoryTableList' + this.storageData.getUserId());
	}

	ngAfterViewInit() {
		if (this.inventoryListTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.inventoryListTable._internalColumns]);
			this.columns.forEach(element => {
				if(this.inventoryListtingTable.length) {
					let obj = this.inventoryListtingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.inventoryListtingTable.length) {
				const nameToIndexMap = {};
				this.inventoryListtingTable.forEach((item, index) => {
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

	setPage(pageInfo) {
		let pageNum;
		this.selection.clear();
		pageNum = pageInfo.offset;
		this.page.pageNumber = pageInfo.offset;
		const pageNumber = this.page.pageNumber + 1;
		let filters = checkReactiveFormIsEmpty(this.searchForm);
		this.queryParams = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: this.page.size,
			page: pageNumber,
			pagination: true,
		};
		let per_page = this.page.size;
		let queryparam = { per_page, page: pageNumber }

		this.addUrlQueryParams(({ ...filters, ...queryparam }))
		this.getInventoryList({ ...this.queryParams, ...filters })
	}
	addUrlQueryParams(params?) {
		this.location.replaceState(
			this.router.createUrlTree([], { queryParams: params, }).toString()
		);
	}
	onResetFilters() {
		this.searchForm.reset();
		this.setPage({ offset: 0 });
	}
	checkInputs() {
		if (isEmptyObject(this.searchForm.value)) {
			return true;
		}
		return false;
	}
	pageLimit($num) {
		this.page.size = Number($num);
		this.setPage({ offset: 0 });
	}
	masterToggle(event) {
		this.isAllSelected()
			? this.selection.clear()
			: this.inventories.slice(0, this.totalRows).forEach((row) => this.selection.select(row));
	}

	isAllSelected() {
		this.totalRows = this.inventories.length;
		const numSelected = this.selection.selected.length;
		const numRows = this.totalRows;
		return numSelected === numRows;
	}
	addUpdateInventory(content, row) {
		if (row == null) {
			this.hasId = false;
			this.inventorydetail = null;
		}
		else {
			this.hasId = true;
			this.inventorydetail = row;
		}
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc',
			size: 'lg'
		};
		this.modalService.open(content, ngbModalOptions)
	}
	getInventoryList(queryParams) {
		this.loadSpin = true;
		this.subscription.push(
			this.requestService
				.sendRequest(
					InventoryEnumUrls.Inventory_List_Get,
					'POST',
					REQUEST_SERVERS.fd_api_url,
					queryParams,
					false, true

				)
				.subscribe(
					(data: HttpSuccessResponse) => {
						if (data.status) {
							this.loadSpin = false;
							this.inventories = data.result && data.result.data ? data.result.data : [];
							this.page.totalElements = data.result && data.result.total ? data.result.total : 0;
							console.log(this.inventories);
						}
					},
					(err) => {
						this.loadSpin = false;
					},
				),
		);
	}
	formSubmited($event) {
		this.modalService.dismissAll();
		this.setPage({ offset: this.page.pageNumber - 1 || 0 });
	}
	onDeleteInventory(id?) {
		const temp = [id]
		const selected = this.selection.selected;
		console.log(this.selection.selected.length)
		const ids = selected.map((row) => row.id);
		this.customDiallogService.confirm('Delete Confirmation?', `Are you sure you want to delete?`,'Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				this.subscription.push(
					this.requestService.sendRequest(InventoryEnumUrls.Inventory_List_Delete, 'DELETE', REQUEST_SERVERS.fd_api_url, { id: ids }).subscribe(
						(res) => {
							this.selection.clear();
							this.setPage({ offset: this.page.pageNumber });
							this.inventories = this.removeMultipleFromArr(this.inventories, ids, 'id');
							this.inventories = this.inventories
							this.toastrService.success('Successfully Deleted', 'Success');
						}
					)
				)	
			}
		})
		.catch();
	}
	private removeMultipleFromArr<T>(data: T[], toBeDeleted: Array<T>, key): T[] {
		return data.filter(
			(row) => row[`${key}`] !== toBeDeleted.find((element) => row[`${key}`] === element),
		);
	}
	unsubscribeSubscriptions() {
		this.subscription.forEach(sub => {
			sub.unsubscribe()
		});
	}
	ngOnDestroy(): void {
		this.unsubscribeSubscriptions()
	}
	encrypt = (text) => {
		return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text));
	};
	decrypt = (data) => {
		return CryptoJS.enc.Base64.parse(data).toString(CryptoJS.enc.Utf8);
	};

	inventoryHistoryStats(row) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc body-scroll history-modal',
			modalDialogClass: 'modal-lg'
		};
		let modelRef = this.modalService.open(CreatedHistoryComponent,ngbModalOptions);
		modelRef.componentInstance.createdInformation = [row];
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
			this.localStorage.setObject('inventoryTableList' + this.storageData.getUserId(), data);
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
		this.inventoryListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.inventoryListTable._internalColumns.sort(function (a, b) {
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
}
