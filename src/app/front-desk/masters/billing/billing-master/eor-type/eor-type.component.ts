import { EORUrlsEnum } from './../eor-type.enum';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModalRef, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Page } from '@appDir/front-desk/models/page';
import { ToastrService } from 'ngx-toastr';
import { AclService } from '@appDir/shared/services/acl.service';
import { Subscription } from 'rxjs';
import {
	unSubAllPrevious,
} from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Location } from '@angular/common'
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { removeEmptyKeysFromObject, isEmptyObject, isObjectEmpty, checkReactiveFormIsEmpty, makeDeepCopyArray, getIdsFromArray } from '@appDir/shared/utils/utils.helpers';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';

@Component({
	selector: 'app-eor-type',
	templateUrl: './eor-type.component.html',
	styleUrls: ['./eor-type.component.scss'],
})
export class EORTypeComponent extends PermissionComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	denial: boolean = true;
	loadSpin: boolean = false;
	modalRef: NgbModalRef;
	disableBtn: boolean = false;
	modelTitle: string = 'Add';
	modelSubmit: string = 'Save';
	eorSerarchForm: FormGroup;
	eorComingData: any[] = []; 
	eorSelection = new SelectionModel<Element>(true, []);
	eorTotalRows: number;
	eorform: FormGroup; // edit form
	eorPage: Page;
	DenialqueryParams: ParamQuery;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('eorTypeList') eorTypeListTable: DatatableComponent;
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
	eorTypeListingTable: any;


	constructor(
		private fb: FormBuilder,
		private modalService: NgbModal,
		private toastrService: ToastrService,
		aclService: AclService,
		protected requestService: RequestService,
		private _route: ActivatedRoute,
		_router: Router,
		titleService: Title,
		private location: Location,
		private CanDeactivateService: CanDeactivateModelComponentService,
		protected storageData: StorageData,
		private localStorage: LocalStorage
	) {
		super(aclService, _router, _route, requestService, titleService);
		this.eorPage = new Page();
		this.eorPage.pageNumber = 0;
		this.eorPage.size = 10;
	}

	ngOnInit() {
		this.setTitle();
		// this.titleService.setTitle(this._route.snapshot.data['title']);
		this.eorSerarchForm = this.eorFormSearch();
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.eorSerarchForm.patchValue(params);
				this.eorPage.pageNumber = parseInt(params.page) || 1;
				this.eorPage.size = parseInt(params.per_page) || 10;
			}),
		);
		this.eORSetPage({ offset: this.eorPage.pageNumber - 1 || 0 });
		this.eorform = this.fb.group({
			id: [''],
			name: ['', Validators.required],
			description: [''],
			comments: [''],
		});
		this.eorTypeListingTable = this.localStorage.getObject('eorTypeBillingTableList' + this.storageData.getUserId());
	}

	ngAfterViewInit() {
		if (this.eorTypeListTable?._internalColumns) {
			this.cols = makeDeepCopyArray([...this.eorTypeListTable._internalColumns]);
			this.cols.forEach(element => {
				if(this.eorTypeListingTable?.length) {
					let obj = this.eorTypeListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.eorTypeListingTable?.length) {
				const nameToIndexMap = {};
				this.eorTypeListingTable.forEach((item, index) => {
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
	 * Initialize 'Denial' search form
	 * @param void
	 * @returns FormGroup
	 */
	eorFormSearch(): FormGroup {
		return this.fb.group({
			name: ['', Validators.required],
			comments: [''],
			description: ['']
		});
	}


	/**
	 * Reset filter and GET request to get data from server
	 * @param void
	 * @returns void
	 */
	resetDenial(): void {
		this.eorSerarchForm = this.eorFormSearch();
		this.eORSetPage({ offset: 0 });
		this.eorform = this.fb.group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
	}

	/**
	 * Compare checkbox selection and length of data coming from server and return boolean
	 * @param void
	 * @returns boolean
	 */
	isDenialAllSelected(): boolean {
		this.eorTotalRows = this.eorComingData.length;
		const numSelected = this.eorSelection.selected.length;
		const numRows = this.eorTotalRows;
		return numSelected === numRows;
	}

	/**
	 * Invoke isAllSelected method and perform operation its return value
	 * @param void
	 * @returns void
	 */

	eormasterToggle(): void {
		this.isDenialAllSelected()
			? this.eorSelection.clear()
			: this.eorComingData
				.slice(0, this.eorTotalRows)
				.forEach((row) => this.eorSelection.select(row));
	}


	/**
	 * Checked search form is empty or not and queryparams set for pagination
	 * @param pageInfo 
	 * @returns void
	 */
	eORSetPage(pageInfo: any): void {
		this.eorPage.pageNumber = pageInfo.offset;
		const pageNumber = this.eorPage.pageNumber + 1;
		this.eorSelection.clear();
		const filters = checkReactiveFormIsEmpty(this.eorSerarchForm);
		this.DenialqueryParams = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: this.eorPage.size,
			page: pageNumber,
			pagination: true,
			order_by: 'name'
		};
		let per_page = this.eorPage.size;
		let queryparam = { per_page, page: pageNumber }
		this.addUrlQueryParams({ ...filters, ...queryparam });
		this.displayEORUpdated({ ...this.DenialqueryParams, ...filters });
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
	 * @param $num :string
	 * @returns void
	 */
	eorPageLimit($num: string): void {
		this.eorPage.size = Number($num);
		this.eorSelection.clear();
		this.eORSetPage({ offset: 0 });
	}

	/**
	 * Used method in setPage and perform GET request to receive data
	 * @param queryParams
	 * @returns void
	 */
	displayEORUpdated(queryParams: any): void {
		this.loadSpin = true;
		this.subscription.push(
			this.requestService
				.sendRequest(
					EORUrlsEnum.EOR_list_GET,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					queryParams,
				)
				.subscribe(
					(comingData: any) => {
						this.loadSpin = false;
						if (comingData['status'] == 200 || comingData['status'] == true) {
							this.eorComingData = comingData.result ? comingData.result.data : [];
							this.eorPage.totalElements = comingData.result ? comingData.result.total : 0;
							this.eorPage.totalPages = this.eorPage.totalElements / this.eorPage.size;
						}
					},
					(err) => {
						this.loadSpin = false;
						// const str = parseHttpErrorResponseObject(err.error.message);
						// this.toastrService.error(str);
					},
				),
		);
	}



	createEorSubmit(form: FormGroup): void {
		this.loadSpin = true;
		this.disableBtn = true;
		if (this.eorform.valid) {
			this.subscription.push(
				this.requestService
					.sendRequest(
						EORUrlsEnum.EOR_list_POST,
						'POST',
						REQUEST_SERVERS.fd_api_url,
						removeEmptyKeysFromObject(form),
					)
					.subscribe(
						(response: any) => {
							if (response.status === 200 ||  response.status == true) { 
								this.loadSpin = false;
								this.disableBtn = false;
								this.eorSelection.clear();
								this.eorform.reset();
								this.modalRef.close();
								this.eORSetPage({ offset: this.eorPage.pageNumber });
								this.toastrService.success('Successfully added', 'Success');
							}
						},
						(err) => {
							this.loadSpin = false;
							this.disableBtn = false;
							// this.toastrService.error(error.message || 'Something went wrong.', 'Error');
							// const str = parseHttpErrorResponseObject(err.error.message);
							// this.toastrService.error(str);
						},
					),
			);
			this.loadSpin = false;
		
		}
	}

	/**
	 * Patch values on edit click
	 * @param row: any
	 * @param rowIndex: number
	 * @returns void
	 */
	patchEditValues(row: any, rowIndex: number): void {
		this.modelSubmit = 'Update';
		this.modelTitle = 'Edit';

		this.eorform.patchValue({
			id: row.id,
			name: this.eorComingData[rowIndex].name,
			description: this.eorComingData[rowIndex].description,
			comments: this.eorComingData[rowIndex].comments,
		});
	}

	/**
	 * Patch heading and save button text
	 * @param void
	 * @returns void
	 */
	patchAddValues(): void {
		this.eorform.reset();
		this.eorform.get('name').enable();
		this.modelSubmit = 'Save & Continue';
		this.modelTitle = 'Add';
	}


	openEORModal(eorModel, row?: any, rowIndex?: number): void {
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

		this.modalRef = this.modalService.open(eorModel, ngbModalOptions);
	}

	/**
	 * Send request to server new creating and updating
	 * @param form : FormGroup
	 * @returns void
	 */
	onSaveEORSubmit(form: FormGroup): void {
		if (this.modelTitle == 'Add') {
			this.createEorSubmit(form);
		} else {
			this.updateEORSubmit(form);
		}
	}

	updateEORSubmit(form: FormGroup): void {
		this.loadSpin = false;
		this.disableBtn = true;
		if (this.eorform.valid) {
			this.subscription.push(
				this.requestService
					.sendRequest(
						EORUrlsEnum.EOR_list_PUT,
						'PUT',
						REQUEST_SERVERS.fd_api_url,
						form,
					)
					.subscribe(
						(response: any) => {
							if (response.status === 200 || response.status == true) {
								this.disableBtn = false;
								this.loadSpin = false;
								this.eorSelection.clear();
								this.modalRef.close();
								this.eorform.reset();
								this.eORSetPage({ offset: this.eorPage.pageNumber });
								this.toastrService.success('Successfully updated', 'Success');
							}
						},
						(err) => {
							this.loadSpin = false;
							this.disableBtn = false;
							// const str = parseHttpErrorResponseObject(err.error.message);
							// this.toastrService.error(str);
						},
					),
			);
		}
		this.loadSpin = false;

	}

	/**
	 * Converts object in to string and return its value
	 * @param obj: any
	 * @returns string
	 */
	Denialstringfy(obj: any): string {
		return JSON.stringify(obj);
	}


	/**
	  * LifeCycle hook method unsubscribe all Observables to prevent from memory leakage
	 * @param void 
	 * @returns void
	 */
	ngOnDestroy(): void {
		unSubAllPrevious(this.subscription);
	}

	/**
	 * CloseModal and ask user to fill data or not
	* @param void
	 * @returns void | boolean
	 */
	closeModel(): void | boolean {
		if (this.eorform.dirty && this.eorform.touched) {
			this.CanDeactivateService.canDeactivate().then(res => {
				if (res) {
					this.eorform.reset();
					this.modalRef.close();
				} else {
					return true;
				}
			});
		} else {
			this.eorform.reset();
			this.modalRef.close();
		}
	}

	checkInputs(){
			if (isEmptyObject(this.eorSerarchForm.value)) {
				return true;
			  }
			  return false;
	}
	eorTypeHistoryStats(row) {
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
			this.localStorage.setObject('eorTypeBillingTableList' + this.storageData.getUserId(), data);
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
		this.eorTypeListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.eorTypeListTable._internalColumns.sort(function (a, b) {
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
