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
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { Location } from '@angular/common';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { CodesUrl } from '../../codes-url.enum';
import { checkReactiveFormIsEmpty, getIdsFromArray, isEmptyObject, isObjectEmpty, makeDeepCopyArray } from '@appDir/shared/utils/utils.helpers';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { environment } from 'environments/environment';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
@Component({
	selector: 'app-icd-codes',
	templateUrl: './icd-codes.component.html',
	styleUrls: ['./icd-codes.component.scss']
})
export class ICDCodesComponent extends PermissionComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	icd: boolean = true;
	modalRef: NgbModalRef;
	disabledReset = true;
	loadSpin: boolean = false;
	icdCodeform: FormGroup;
	selection = new SelectionModel<Element>(true, []);
	totalRows: number;
	ICDPage: Page;
	ICDSearch: FormGroup;
	ICDLoading = false;
	ICDUpdate = false;
	ICDqueryParams: ParamQuery;
	modelTitle: string = 'Add';
	modelSubmit: string = 'Save';
	getIcdCodes: any[];
	errorMessage: any;
	currentTab = 'icd';

	typeId = 1;
	environment= environment;
	isCollapsed:boolean = false;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('icdCodesList') icdCodesListTable: DatatableComponent;
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
	icdCodesListingTable: any;

	constructor(
		private fb: FormBuilder,
		private modalService: NgbModal,
		private toastrService: ToastrService,
		aclService: AclService,
		protected requestService: RequestService,
		private _route: ActivatedRoute,
		router: Router,
		titleService: Title,
		private location: Location,
		public datePipeService:DatePipeFormatService,
		private CanDeactivateModelComponentService: CanDeactivateModelComponentService,
		protected storageData: StorageData,
		private localStorage: LocalStorage
		) {
		super(aclService, router, _route, requestService, titleService);
		this.ICDPage = new Page();
		this.ICDPage.pageNumber = 0;
		this.ICDPage.size = 10;
	}

	ngOnInit() {
		this.setTitle();
		// this.titleService.setTitle(this._route.snapshot.data['title']);
		this.ICDSearch = this.fb.group({
			name: [''],
			type: ['ICD'],
			comments: [''],
			description: [''],
			short_description: [''],
			medium_description: [''],
			long_description: [''],
		});
		this._route.queryParams.subscribe(params => {
			this.ICDSearch.patchValue(params);
			this.ICDPage.pageNumber = parseInt(params.page) || 1;
			this.ICDPage.size = parseInt(params.per_page) || 10;
		});
		this.ICDnitialization();
		this.ICDSetPage({ offset: this.ICDPage.pageNumber - 1 || 0 });
		this.icdCodesListingTable = this.localStorage.getObject('icdCodesMasterTableList' + this.storageData.getUserId());
	}

	ngAfterViewInit() {
		if (this.icdCodesListTable?._internalColumns) {
			this.cols = makeDeepCopyArray([...this.icdCodesListTable._internalColumns]);
			this.cols.forEach(element => {
				if(this.icdCodesListingTable?.length) {
					let obj = this.icdCodesListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.icdCodesListingTable?.length) {
				const nameToIndexMap = {};
				this.icdCodesListingTable.forEach((item, index) => {
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
	 * Initialize 'ICD' form
	 * @param void
	 * @returns FormGroup
	 */
	ICDCodeInitialization(): FormGroup {
		return this.fb.group({
			id: [''],
			name: ['', Validators.required],
			type: ['ICD'],
			description: [''],
			short_description: [''],
			medium_description: [''],
			long_description: [''],
			comments: [''],
		});
	}

	/**
	 * Initialize 'ICD' form assign to form
	 * @param void
	 * @returns void
	 */
	ICDnitialization() {
		this.icdCodeform = this.ICDCodeInitialization();
	}


	/**
	 * Reset filter
	 * @param void
	 * @returns void
	 */
	isResetDisables() {
		if (this.ICDSearch.controls.comments.value == '' && this.ICDSearch.controls.description.value == '' && this.ICDSearch.controls.name.value == '') {
			this.disabledReset = false;
			return true;
		} else {
			this.disabledReset = true;
			return false;
		}
	}
	resetICD(): void {
		this.ICDSearch.reset();
		this.ICDSearch = this.fb.group({
			name: [''],
			type: ['ICD'],
			comments: [''],
			description: [''],
			short_description: [''],
			medium_description: [''],
			long_description: [''],
		});
		this.selection.clear();
		this.ICDSetPage({ offset: 0 });
	}

	/**
	 * Compare checkbox selection and length of data coming from server and return boolean
	 * @param void
	 * @returns boolean
	 */

	isAllSelected(): boolean {
		this.totalRows = this.getIcdCodes.length;
		const numSelected = this.selection.selected.length;
		const numRows = this.totalRows;
		return numSelected === numRows;
	}

	/**
	 * Invoke isAllSelected method and perform operation its return value
	 * @param void
	 * @returns void
	 */
	masterToggle(): void {
		this.isAllSelected()
			? this.selection.clear()
			: this.getIcdCodes.slice(0, this.totalRows).forEach((row) => this.selection.select(row));
	}

	/**
		 * Create new ICD code
		 * @param form  FormGroup
		 * @returns void
		 */

	createIcdCodes(form: FormGroup): void {
		form['code_type_id'] = this.typeId;
		this.loadSpin = true;
		this.requestService
			.sendRequest(CodesUrl.CODES_list_POST, 'POST', REQUEST_SERVERS.fd_api_url, form)
			.subscribe(
				(data) => {
					if (data['status'] === 200 || data['status'] === true) {
						this.loadSpin = false;
						this.modalRef.close();
						this.ICDSetPage({ offset: this.ICDPage.pageNumber });
						this.toastrService.success('Successfully added', 'Success');
						this.ICDnitialization();
					}
				},
				(error) => {
					this.loadSpin = false;
					// const str = parseHttpErrorResponseObject(error.error.message);
					// this.toastrService.error(str);
				},
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
		// this.icdCodeform.get('name').disable();
		this.icdCodeform.patchValue({
			id: row.id,
			name: this.getIcdCodes[rowIndex].name,
			description: this.getIcdCodes[rowIndex].description,
			short_description: this.getIcdCodes[rowIndex].short_description,
			medium_description: this.getIcdCodes[rowIndex].medium_description,
			long_description: this.getIcdCodes[rowIndex].long_description,
			comments: this.getIcdCodes[rowIndex].comments,
		});
	}


	/**
	* Patch heading and save button text
	* @param void
	* @returns void
	*/
	patchAddValues() {
		this.ICDnitialization();
		this.icdCodeform.get('name').enable();
		this.modelSubmit = 'Save & Continue';
		this.modelTitle = 'Add';
	}

	/**
	 * Open Modal and patch values new or updating
	 * @param ICDModal ModalReference
	 * @param row any (optional)
	 * @param rowIndex: number (optional)
	 * @returns void
	 */
	openModalICD(ICDModal, row?: any, rowIndex?: number) {
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
		this.modalRef = this.modalService.open(ICDModal, ngbModalOptions);
	}

	/**
	 * Method to Update
	 * @param form FormGroup
	 * @returns void
	 */

	updateIcdCodes(form: FormGroup): void {
		form['code_type_id'] = this.typeId;
		this.loadSpin = true;
		this.requestService
			.sendRequest(CodesUrl.CODES_list_PATCH, 'PUT', REQUEST_SERVERS.fd_api_url, form)
			.subscribe((data) => {
				if (data['status'] === 200 || data['status'] === true) {
					this.modalRef.close();
					this.loadSpin = false;
					this.icdCodeform.reset();
					this.ICDnitialization();
					this.toastrService.success('Successfully updated', 'Success');
					this.ICDSetPage({ offset: this.ICDPage.pageNumber });
				}
			}),
			(error) => {
				this.loadSpin = false;
				this.toastrService.error(error, 'Something wrong happened');
			};
	}

	/**
	 * Used method in ICDSetPage and perform GET request to receive data
	 * @param queryParams: any
	 * @returns void
	 */
	getICD(queryParams: any): void {
		this.loadSpin = true;
		this.subscription.push(
			this.requestService
				.sendRequest(CodesUrl.CODES_SINGLE_GET, 'GET', REQUEST_SERVERS.fd_api_url, queryParams)
				.subscribe(
					(data: any) => {
						if (data.status) {
							this.loadSpin = false;
							this.getIcdCodes = data.result ? data.result.data : [];
							this.ICDPage.totalElements = data.result.total;
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
	 * Dropdown selection how much data user want in listing
	 * @params $num: string
	 * @returns void
	 */
	ICDPageLimit($num: string): void {
		this.ICDPage.size = Number($num);
		this.ICDSetPage({ offset: 0 });
	}


	/**
	 * Checked search form is empty or not and queryparams set for pagination
	 * @param pageInfo : any
	 * @returns void
	 */
	ICDSetPage(pageInfo: any): void {
		this.selection.clear();
		this.ICDPage.pageNumber = pageInfo.offset;
		const pageNumber = this.ICDPage.pageNumber + 1;
		const filters = checkReactiveFormIsEmpty(this.ICDSearch);
		this.ICDqueryParams = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: this.ICDPage.size,
			page: pageNumber,
			pagination: true,
			order_by: 'name'
		};
		let name = this.ICDSearch.value.name;
		let per_page = this.ICDPage.size;
		let queryParam = { name, per_page, page: pageNumber };
		this.addUrlQueryParams(queryParam);
		this.ICDqueryParams['code_type_id'] = this.typeId;
		this.getICD({ ...this.ICDqueryParams, ...filters });
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
		 * Send request to server new creating and updating
		 * @param form FormGroup
		 * @returns void
		 */
	onIcdCodeSubmit(form: FormGroup): void {
		if (this.modelTitle == 'Add') {
			this.createIcdCodes(form);
		} else {
			this.updateIcdCodes(form);
		}
	}

	/**
	 * A library method takes an object and converts into string and return
	 * @param obj
	 * @returns string
	 */
	stringfy(obj: any): string {
		return JSON.stringify(obj);
	}

	/**
	 * CloseModal and ask user to fill data or not
	 * @param void
	 * @returns void | boolean
	 */

	clearICDForm() {
		if (this.icdCodeform.dirty && this.icdCodeform.touched) {
			this.CanDeactivateModelComponentService.canDeactivate().then(res => {
				if (res) {
					this.modalRef.close();
					this.icdCodeform.reset();
					this.ICDnitialization();
				} else {
					return true;
				}
			});
		} else {
			this.modalRef.close();
			this.icdCodeform.reset();
			this.ICDnitialization();
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

	checkInputs(){
		if (isEmptyObject(this.ICDSearch.value)) {
			return true;
		} else {
			return false;
		}
	}
	isDisabledBtn() {
		if(this.icdCodeform.invalid || this.ICDUpdate || this.loadSpin) {
			return true;
		}
		return false;
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
			this.localStorage.setObject('icdCodesMasterTableList' + this.storageData.getUserId(), data);
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
		this.icdCodesListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.icdCodesListTable._internalColumns.sort(function (a, b) {
			return groupByHeader.indexOf(a.name) - groupByHeader.indexOf(b.name);
		});
		window.dispatchEvent(new Event('resize'));
		this.CustomizeColumnModal.hide();
	}

	icdCodeHistoryStats(row) {
		const ngbModalOptions: NgbModalOptions = {
		  backdrop: 'static',
		  keyboard: false,
		  windowClass: 'modal_extraDOc body-scroll history-modal',
		  modalDialogClass: 'modal-lg'
		};
		let modelRef = this.modalService.open(CreatedHistoryComponent,ngbModalOptions);
		modelRef.componentInstance.createdInformation = [row];
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
