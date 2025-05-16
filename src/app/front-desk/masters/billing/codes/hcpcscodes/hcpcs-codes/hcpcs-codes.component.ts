import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { Page } from '@appDir/front-desk/models/page';
import { NgbModalOptions, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { CodesUrl } from '../../codes-url.enum';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { checkReactiveFormIsEmpty, getIdsFromArray, isObjectEmpty, makeDeepCopyArray } from '@appDir/shared/utils/utils.helpers';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';

@Component({
	selector: 'app-hcpcs-codes',
	templateUrl: './hcpcs-codes.component.html',
	styleUrls: ['./hcpcs-codes.component.scss']
})
export class HCPCSCodesComponent extends PermissionComponent implements OnInit, OnDestroy {
	createIcdCodesform: FormGroup; // create form for ICD-10-Codes
	selection = new SelectionModel<Element>(true, []);
	totalRows: number;
	subscription: Subscription[] = [];
	modalRef: NgbModalRef;
	exchangeData: any[] = [];
	loadSpin: boolean = false;
	getIcdCodes: any = [];
	errorMessage: any;
	modelTitle: string = 'Add';
	modelSubmit: string = 'Save';
	HcpcsForm: FormGroup; // Edit form for HCPCS
	HcpcsSelection = new SelectionModel<Element>(true, []);
	hcpcsRows: number;
	HcpcsData: any = [];
	HCPCSpage: Page;
	HCPCSSearchForm: FormGroup;
	HCPqueryParams: ParamQuery;
	typeId = 3;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('hcpcsList') hcpcsListTable: DatatableComponent;
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
	hcpcsCodesListingTable: any;

	constructor(
		private fb: FormBuilder,
		private modalService: NgbModal,
		private toastrService: ToastrService,
		protected requestService: RequestService,
		private _route: ActivatedRoute,
		aclService: AclService,
		router: Router,
		titleService: Title,
		private location: Location,
		private CanDeactivateModelComponentService: CanDeactivateModelComponentService,
		protected storageData: StorageData,
		private localStorage: LocalStorage
		) {
		super(aclService, router, _route, requestService, titleService);
		this.HCPCSpage = new Page();
		this.HCPCSpage.pageNumber = 0;
		this.HCPCSpage.size = 10;
	}

	ngOnInit() {
		this.setTitle();
		// this.titleService.setTitle(this._route.snapshot.data['title']);
		this.HCPCSSearchForm = this.fb.group({
			name: ['', Validators.required],
			type: ['HCPCS'],
			comments: [''],
			description: [''],
			short_description: [''],
			medium_description: [''],
			long_description: [''],
		});
		this._route.queryParams.subscribe(params => {
			this.HCPCSpage.size = parseInt(params.per_page) || 10
			this.HCPCSSearchForm.patchValue(params);
		});
		this.HCPCSInitialization(); // initializing form of HCPCS
		this.HCPCSsetPage({ offset: 0 });
		this.hcpcsCodesListingTable = this.localStorage.getObject('hcpcsCodesMasterTableList' + this.storageData.getUserId());
	}

	ngAfterViewInit() {
		if (this.hcpcsListTable?._internalColumns) {
			this.cols = makeDeepCopyArray([...this.hcpcsListTable._internalColumns]);
			this.cols.forEach(element => {
				if(this.hcpcsCodesListingTable?.length) {
					let obj = this.hcpcsCodesListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.hcpcsCodesListingTable?.length) {
				const nameToIndexMap = {};
				this.hcpcsCodesListingTable.forEach((item, index) => {
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
	 * Initialize 'HCPCS' form
	 * @param void
	 * @returns void
	 */
	HCPCSInitialization() {
		this.HcpcsForm = this.fb.group({
			id: [''],
			name: ['', Validators.required],
			type: ['HCPCS'],
			description: [''],
			short_description: [''],
			medium_description: [''],
			long_description: [''],
			comments: [''],
		});
	}


	/**
	 * Reset filter
	 * @param void
	 * @returns void
	 */
	resetHCPCS(): void {
		this.HcpcsSelection.clear();
		this.HCPCSSearchForm.reset();
		this.HCPCSSearchForm = this.fb.group({
			name: [''],
			type: ['HCPCS'],
			comments: [''],
			description: [''],
			short_description: [''],
			medium_description: [''],
			long_description: [''],
		});
		this.HCPCSsetPage({ offset: 0 });
	}


	HCPCSstringfy(obj) {
		return JSON.stringify(obj);
	}

	/**
	 * Dropdown selection how much data user want in listing
	 * @params $num: string
	 * @returns void
	 */

	HCPCSPageLimit($num: string): void {
		this.HCPCSpage.size = Number($num);
		this.HCPCSsetPage({ offset: 0 });
	}

	/**
		 * Checked search form is empty or not and queryparams set for pagination
		 * @param pageInfo : any
		 * @returns void
		 */
	HCPCSsetPage(pageInfo: any): void {

		this.HcpcsSelection.clear();
		this.HCPCSpage.pageNumber = pageInfo.offset;
		const pageNumber = this.HCPCSpage.pageNumber + 1;
		const filters = checkReactiveFormIsEmpty(this.HCPCSSearchForm);
		this.HCPqueryParams = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: this.HCPCSpage.size,
			page: pageNumber,
			pagination: true,
			order_by: 'name'
		};
		let name = this.HCPCSSearchForm.value.name;
		let per_page = this.HCPCSpage.size;
		let queryParam = { name, per_page, page: pageNumber }
		this.HCPqueryParams['code_type_id'] = this.typeId;
		this.addUrlQueryParams(queryParam);
		this.getHCPCSdata({ ...this.HCPqueryParams, ...filters });
	}

	/**
	 * Queryparams to make unique URL
	 * @param params
	 * @returns void
	 */
	addUrlQueryParams(params: any): void {
		this.location.replaceState(
			this.router.createUrlTree([], { queryParams: params, }).toString()
		);
	}

	/**
	 * Used method in HCPCSsetPage and perform GET request to receive data
	 * @param queryParams: any
	 * @returns void
	 */
	getHCPCSdata(queryParams: any): void {
		this.loadSpin = true;
		this.subscription.push(
			this.requestService
				.sendRequest(
					CodesUrl.CODES_SINGLE_GET,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					queryParams,
				)
				.subscribe(
					(data: any) => {
						if (data.status) {
							this.loadSpin = false;
							this.HcpcsData = data.result ? data.result.data : [];
							// data && data['data'].docs && data['data'].docs ? data['data'].docs : [];
							// this.HCPCSpage = (data && data['data'].docs && data['data'].docs) ? data['data'].docs : [];
							this.HCPCSpage.totalElements = data.result.total;
							// this.HCPCSpage.totalPages = this.HCPCSpage.totalElements / this.HCPCSpage.size;
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

	/**
	* Compare checkbox selection and length of data coming from server and return boolean
	* @param void
	* @returns boolean
	*/

	isHcpcsAllSelected(): boolean {
		this.hcpcsRows = this.HcpcsData.length;
		const numSelected = this.HcpcsSelection.selected.length;
		const numRows = this.hcpcsRows;
		return numSelected === numRows;
	}

	/**
	 * Invoke HcpcsmasterToggle method and perform operation its return value
	 * @param void
	 * @returns void
	 */

	HcpcsmasterToggle() {
		this.isHcpcsAllSelected()
			? this.HcpcsSelection.clear()
			: this.HcpcsData.slice(0, this.hcpcsRows).forEach((row) => this.HcpcsSelection.select(row));
	}

	/**
		 * Create new ICD code
		 * @param form  FormGroup
		 * @returns void
		 */
	onSubmitHcpcsform(form: FormGroup): void {
		form['code_type_id'] = this.typeId;
		this.loadSpin = true;
		this.subscription.push(
			this.requestService
				.sendRequest(CodesUrl.CODES_list_POST, 'POST', REQUEST_SERVERS.fd_api_url, form)
				.subscribe(
					(data: any) => {
						if (data['status'] === 200 || data['status'] === true) {
							this.loadSpin = false;
							this.HCPCSInitialization();
							this.HCPCSsetPage({ offset: this.HCPCSpage.pageNumber });
							this.HcpcsSelection.clear();
							this.toastrService.success('Successfully added', 'Success');
							this.modalRef.close();
						}
					},
					(error) => {
						this.loadSpin = false;
						// const str = parseHttpErrorResponseObject(error.error.message);
						// this.toastrService.error(str);
					},
				),
		);
	}


	/**
	 * Method to Update
	 * @param form FormGroup
	 * @returns void
	 */
	onEditHcpcsSubmit(form: FormGroup): void {
		form['code_type_id'] = this.typeId;
		this.loadSpin = true;
		this.subscription.push(
			this.requestService
				.sendRequest(CodesUrl.CODES_list_PATCH, 'PUT', REQUEST_SERVERS.fd_api_url, form)
				.subscribe(
					(data: any) => {
						if (data['status'] === 200 || data['status'] === true) {
							this.loadSpin = false;
							this.HCPCSInitialization();
							this.HCPCSsetPage({ offset: this.HCPCSpage.pageNumber });
							this.HcpcsSelection.clear();
							this.toastrService.success('Successfully updated', 'Success');
							this.modalRef.close();
						}
					},
					(error) => {
						this.loadSpin = false;
						// const str = parseHttpErrorResponseObject(error.error.message);
						// this.toastrService.error(str);
					},
				),
		);
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
		// this.HcpcsForm.get('name').disable();
		this.HcpcsForm.patchValue({
			id: row.id,
			name: this.HcpcsData[rowIndex].name,
			description: this.HcpcsData[rowIndex].description,
			short_description: this.HcpcsData[rowIndex].short_description,
			medium_description: this.HcpcsData[rowIndex].medium_description,
			long_description: this.HcpcsData[rowIndex].long_description,
			comments: this.HcpcsData[rowIndex].comments,
		});
	}

	/**
	* Patch heading and save button text
	* @param void
	* @returns void
	*/

	patchAddValues(): void {
		this.HCPCSInitialization();
		this.HcpcsForm.get('name').enable();
		this.modelSubmit = 'Save & Continue';
		this.modelTitle = 'Add';
	}


	/**
	 * Open Modal and patch values new or updating
	 * @param editHCPCS ModalReference
	 * @param row any (optional)
	 * @param rowIndex: number (optional)
	 * @returns void
	 */
	openHCPCSModal(editHCPCS, row?: any, rowIndex?: number): void {
		const ngbOPtions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc',
		};
		if (row == undefined || row == null) {
			this.patchAddValues();
		} else {
			this.patchEditValues(row, rowIndex);
		}

		this.modalRef = this.modalService.open(editHCPCS, ngbOPtions);
	}


	/**
	 * Send request to server new creating and updating
	 * @param form FormGroup
	 * @returns void
	 */
	onHCPCSCodeSubmit(form: FormGroup): void {
		if (this.modelTitle == 'Add') {
			this.onSubmitHcpcsform(form);
		} else {
			this.onEditHcpcsSubmit(form);
		}
	}


	/**
	 * Clear selection of checkboxes
	 * @param void
	 * @returns void
	 */
	HCPCSClear(): void {
		this.HcpcsSelection.clear();
	}


	/**
	 * CloseModal and ask user to fill data or not
	 * @param void
	 * @returns void | boolean
	 */
	HCPCSClose(): void | boolean {
		if (this.HcpcsForm.dirty && this.HcpcsForm.touched) {
			this.CanDeactivateModelComponentService.canDeactivate().then(res => {
				if (res) {
					this.modalRef.close();
					this.HCPCSInitialization();
				} else {
					return true;
				}
			});
		} else {
			this.modalRef.close();
			this.HCPCSInitialization();
		}

	}

	/**
	 * LifeCycle hook method unsubscribe all Observables to prevent from memory leakage
	 * @param void
	 * @returns void
	 */
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}

	checkInputs() {
		console.log(this.HCPCSSearchForm.value);
		if (this.HCPCSSearchForm.controls.comments.value == '' && this.HCPCSSearchForm.controls.description.value == '' && this.HCPCSSearchForm.controls.name.value == '') {
			return true;
		  }
		  return false;
	}
	hcpcsCodeHistoryStats(row) {
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
			this.localStorage.setObject('hcpcsCodesMasterTableList' + this.storageData.getUserId(), data);
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
		this.hcpcsListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.hcpcsListTable._internalColumns.sort(function (a, b) {
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
