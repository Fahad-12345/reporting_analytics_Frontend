import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModalRef, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Page } from '@appDir/front-desk/models/page';
import { ToastrService } from 'ngx-toastr';
import { AclService } from '@appDir/shared/services/acl.service';
import { HttpService } from '@appDir/front-desk/fd_shared/services/http.service';
import { Subscription } from 'rxjs';
import {
	unSubAllPrevious,
} from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { PaidByUrlsEnum } from '../PaidBy-Urls-Enum';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { Location, LocationStrategy } from '@angular/common';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { removeEmptyKeysFromObject, isEmptyObject, checkReactiveFormIsEmpty, isObjectEmpty, makeDeepCopyArray, getIdsFromArray } from '@appDir/shared/utils/utils.helpers';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';

@Component({
	selector: 'app-paid-by',
	templateUrl: './paid-by.component.html',
	styleUrls: ['./paid-by.component.scss'],
})
export class PaidByComponent extends PermissionComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	loadSpin: boolean = false;
	modalRef: NgbModalRef;
	disableBtn: boolean = false;
	paidSearchForm: FormGroup;
	paidComingData: any[] = []; // denial coming data from backend
	paidSelection = new SelectionModel<Element>(true, []);
	paidTotalRows: number;
	paidForm: FormGroup; // edit form
	paidPage: Page;
	paidQueryParams: ParamQuery;
	errorMessage: string;
	modelTitle: string = 'Add';
	modelSubmit: string = 'Save';
	isCollapsed: boolean = false;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('paidByList') paidByListTable: DatatableComponent;
	customizedColumnComp: CustomizeColumnComponent;
	@ViewChild(CustomizeColumnComponent) set con(con: CustomizeColumnComponent) {
		if (con) { // initially setter gets called with undefined
		  this.customizedColumnComp = con;
		}
	}
	modalCols :any[] = [];
	cols: any[] = [];
	alphabeticColumns:any[] =[];
	colSelected: boolean = true;
  	isAllFalse: boolean = false;
	paidByListingTable: any;


	constructor(
		private fb: FormBuilder,
		private modalService: NgbModal,
		private toastrService: ToastrService,
		aclService: AclService,
		private http: HttpService,
		protected requestService: RequestService,
		private _route: ActivatedRoute,
		router: Router,
		titleService: Title,
		private location: Location, 
		private locationStratgy: LocationStrategy,
		private CanDeactivateModelComponentService: CanDeactivateModelComponentService,
		protected storageData: StorageData,
		private localStorage: LocalStorage
	) {
		super(aclService, router, _route, requestService, titleService);
		this.paidPage = new Page();
		this.paidPage.pageNumber = 0;
		this.paidPage.size = 10;
	}

	ngOnInit() {
		this.setTitle();
		// this.titleService.setTitle(this._route.snapshot.data['title']);
		this.paidSearchForm = this.initializePaidSearch();
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.paidSearchForm.patchValue(params);
				this.paidPage.pageNumber = parseInt(params.page) || 1;
				this.paidPage.size = parseInt(params.per_page) || 10;
			}),
		);
		this.paidSetPage({ offset: this.paidPage.pageNumber - 1 || 0 });
		this.paidForm = this.fb.group({
			id: [''],
			description: [''],
			name: ['', Validators.required],
			comments: [''],
		});
		this.paidByListingTable = this.localStorage.getObject('paidByBillingTableList' + this.storageData.getUserId());
	}

	ngAfterViewInit() {
		if (this.paidByListTable?._internalColumns) {
			this.cols = makeDeepCopyArray([...this.paidByListTable._internalColumns]);
			this.cols.forEach(element => {
				if(this.paidByListingTable?.length) {
					let obj = this.paidByListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.paidByListingTable?.length) {
				const nameToIndexMap = {};
				this.paidByListingTable.forEach((item, index) => {
					nameToIndexMap[item?.header] = index;
				});
				this.cols.sort((a, b) => nameToIndexMap[a?.name] - nameToIndexMap[b?.name]);
			}
			let cols = makeDeepCopyArray(this.cols);
			this.alphabeticColumns = cols.sort(function (a, b) {
				if (a.name < b.name) { return -1; }
				if (a.name > b.name) { return 1; }
				return 0;
			});
			this.onConfirm(false);
		}
	}

	/**
	 * Initialize 'Paid-by' search form
	 * @param void
	 * @returns FormGroup
	 */
	initializePaidSearch(): FormGroup {
		return this.fb.group({
			name: [''],
			comments: [''],
			description: [''],
		});
	}

	/**Reset filter
	 * @param void
	 * @returns void
	 */
	resetPaid() {
		this.paidSearchForm = this.initializePaidSearch();
		this.paidSetPage({ offset: 0 });
		this.paidForm = this.fb.group({
			id: [''],
			name: ['', Validators.required],
			description: [''],
			comments: [''],
		});
	}

	/**
	 * Compare checkbox selection and length of data coming from server and return boolean
	 * @param void
	 * @returns boolean
	 */

	isPaidAllSelected(): boolean {
		this.paidTotalRows = this.paidComingData.length;
		const numSelected = this.paidSelection.selected.length;
		const numRows = this.paidTotalRows;
		return numSelected === numRows;
	}


	/**
	 * Invoke isAllSelected method and perform operation its return value
	 * @param void
	 * @returns void
	 */
	PaidmasterToggle(): void {
		this.isPaidAllSelected()
			? this.paidSelection.clear()
			: this.paidComingData
				.slice(0, this.paidTotalRows)
				.forEach((row) => this.paidSelection.select(row));
	}

	/**
	 * Checked search form is empty or not and queryparams set for pagination
	 * @param pageInfo : any
	 * @returns void
	 */

	paidSetPage(pageInfo: any): void {
		this.paidSelection.clear();
		this.paidPage.pageNumber = pageInfo.offset;
		const pageNumber = this.paidPage.pageNumber + 1;
		const filters = checkReactiveFormIsEmpty(this.paidSearchForm);
		this.paidQueryParams = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: this.paidPage.size,
			page: pageNumber,
			pagination: true,
			order_by: 'name'
		};
		let per_page = this.paidPage.size;
		let queryparam = { per_page, page: pageNumber }
		this.addUrlQueryParams({ ...filters, ...queryparam });
		this.displayUpdatedPaid({ ...this.paidQueryParams, ...filters });
	}

	/**
	 * Queryparams to make unique URL
	 * @param params
	 * @returns void
	 */
	addUrlQueryParams(params?: FormGroup): void {
		this.location.replaceState(
			this.router.createUrlTree([], { queryParams: params, }).toString()
		);
	}

	/**
 * Dropdown selection how much data user want in listing
 * @params $num: string
 * @returns void
 */
	paidPageLimit($num: string): void {
		this.paidPage.size = Number($num);
		this.paidSelection.clear();
		this.paidSetPage({ offset: 0 });
	}

	/**
	 * Used method in paidSetPage and perform GET request to receive data
	 * @param queryParams: any
	 * @returns void
	 */
	displayUpdatedPaid(queryParams: any): void {
		this.loadSpin = true;
		this.subscription.push(
			this.requestService
				.sendRequest(
					PaidByUrlsEnum.PaidBy_list_GET,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					removeEmptyKeysFromObject(queryParams),
				)
				.subscribe(
					(comingData: any) => {
						if (comingData['status'] == 200 || comingData['status'] == true) {
							this.loadSpin = false;
							this.paidComingData = comingData.result ? comingData.result.data : [];
							this.paidPage.totalElements = comingData.result ? comingData.result.total : 0;
							this.paidPage.totalPages = this.paidPage.totalElements / this.paidPage.size;
						}
					},
					(error) => {
						this.loadSpin = false;
						this.toastrService.error(error.message || 'Something went wrong.', 'Error');
					},
				),
		);
	}

	/**
		 * Create new paid-by
		 * @param form  FormGroup
		 * @returns void
		 */
	onCreatePaidSubmit(form: FormGroup): void {

		if (this.paidForm.valid) {
			this.loadSpin = true;
			this.subscription.push(
				this.requestService
					.sendRequest(
						PaidByUrlsEnum.PaidBy_list_POST,
						'POST',
						REQUEST_SERVERS.fd_api_url,
						form,
					)
					.subscribe((response: any) => {
						if (response.status === 200 || response['status'] == true) {
							this.loadSpin = false;
							this.paidSelection.clear();
							this.paidForm.reset();
							this.modalRef.close();
							this.paidSetPage({ offset: this.paidPage.pageNumber });
							this.toastrService.success('Successfully added', 'Success');
						} else {
							this.loadSpin = false;
							this.toastrService.error(response.message);
						}
					},(err)=>{
						this.loadSpin = false;
					}),
			);
			// this.loadSpin = false;
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
		if (this.paidComingData[rowIndex].slug == 'patient' || this.paidComingData[rowIndex].slug == 'insurance' || this.paidComingData[rowIndex].slug == 'attorney' || this.paidComingData[rowIndex].slug == 'employer' || this.paidComingData[rowIndex].slug == 'other') {
			this.paidForm.get('name').disable();
		  } else {
			this.paidForm.get('name').enable();
		  }
		  
		this.paidForm.patchValue({
			id: row.id,
			name: this.paidComingData[rowIndex].name,
			description: this.paidComingData[rowIndex].description,
			comments: this.paidComingData[rowIndex].comments,
		});
	}


	/**
	* Patch heading and save button text
	 * @param void
	 * @returns void
	 */

	patchAddValues(): void {
		this.paidForm.reset();
		this.paidForm.get('name').enable();
		this.modelSubmit = 'Save & Continue';
		this.modelTitle = 'Add';
	}

	/**
 * Open Modal and patch values new or updating
 * @param paymentType ModalReference
 * @param row FormGroup (optional)
 * @param rowIndex: number (optional)
 * @returns void
 */

	paidOpenModal(editPaid, row: FormGroup, rowIndex: number) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc body-scroll',
		};
		if (row == undefined || row == null) {
			this.patchAddValues();
		} else {
			this.patchEditValues(row, rowIndex);
		}
		this.modalRef = this.modalService.open(editPaid, ngbModalOptions);
	}

	/**
	* Patch heading and save button text
	 * @param void
	 * @returns void
	 */

	onPaidSubmit(form) {
		if (this.modelTitle == 'Add') {
			this.onCreatePaidSubmit(form);
		} else {
			this.updateEditPaidSubmit(form);
		}
	}

	/**
	 * Update Data
	 * @param form : FormGroup
	 * @treturns void
	 */

	updateEditPaidSubmit(form: FormGroup): void {
		if (this.paidForm.valid) {
			this.loadSpin = true;
			this.subscription.push(
				// this.fdServices.updatePaid(form)
				this.requestService
					.sendRequest(
						PaidByUrlsEnum.PaidBy_list_PUT,
						'PUT',
						REQUEST_SERVERS.fd_api_url,
						form,
					)
					.subscribe(
						(response: any) => {
							if (response.status) {
								this.loadSpin = false;
								this.paidSelection.clear();
								this.paidForm.reset();
								this.modalRef.close();
								this.paidSetPage({ offset: this.paidPage.pageNumber });
								this.toastrService.success('Successfully updated', 'Success');
							} else {
								this.loadSpin = false;
								this.toastrService.error(response.message);
							}
						},
						(err) => {
							this.loadSpin = false;
						},
					),
			);
		}
	}

	/**
	 * CloseModal and ask user to fill data or not
	 * @param void
	 * @returns void | boolean
	 */
	closeModel(): void | boolean {
		if (this.paidForm.dirty && this.paidForm.touched) {
			this.CanDeactivateModelComponentService.canDeactivate().then(res => {
				if (res) {
					this.paidForm.reset();
					this.modalRef.close();
				} else {
					return true;
				}
			});
		} else {
			this.paidForm.reset();
			this.modalRef.close();
		}

	}
	/**
	 * A library method takes an object and converts into string and return
	 * @param obj
	 * @returns string
	 */

	Paidstringfy(obj) {
		return JSON.stringify(obj);
	}

	/**
	 * LifeCycle hook method unsubscribe all Observables to prevent from memory leakage
	 * @param void
	 * @returns void
	 */
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}

	checkInputs(){
		if (isEmptyObject(this.paidSearchForm.value)) {
			return true;
		  }
		  return false;
	}

	paidByHistoryStats(row) {
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
		this.cols.forEach(element => {
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
			this.localStorage.setObject('paidByBillingTableList' + this.storageData.getUserId(), data);
		}
		let groupByHeaderCol = getIdsFromArray(this.modalCols, 'header'); // pick header
		this.cols.sort(function (a, b) {
			return groupByHeaderCol.indexOf(a.name) - groupByHeaderCol.indexOf(b.name);
		});
		//set checked and unchecked on the base modal columns in alphabeticals columns
		this.alphabeticColumns.forEach(element => {
		let currentColumnIndex = findIndexInData(this.cols, 'name', element.name)
			if (currentColumnIndex != -1) {
				this.cols[currentColumnIndex]['checked'] = element.checked;
				this.cols = [...this.cols];
			}
		});
		// show only those columns which is checked
		let columnsBody = makeDeepCopyArray(this.cols);
		this.paidByListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.paidByListTable._internalColumns.sort(function (a, b) {
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
