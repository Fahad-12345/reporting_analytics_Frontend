import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { Page } from '@appDir/front-desk/models/page';
import { NgbModalOptions, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AclService } from '@appDir/shared/services/acl.service';
import { Subscription } from 'rxjs';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { parseHttpErrorResponseObject, unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Router, ActivatedRoute } from '@angular/router'
import { Title } from '@angular/platform-browser';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { Location } from '@angular/common'
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { removeEmptyKeysFromObject, isEmptyObject, checkReactiveFormIsEmpty, isObjectEmpty, makeDeepCopyArray, getIdsFromArray } from '@appDir/shared/utils/utils.helpers';
import { CodeTypeUrl } from '../CodeType.enum';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
@Component({
	selector: 'app-code-type',
	templateUrl: './code-type.component.html',
	styleUrls: ['./code-type.component.scss']
})
export class CodeTypeComponent extends PermissionComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	modalRef: NgbModalRef;
	exchangeData: any[] = [];
	loadSpin: boolean = false;
	errorMessage: any;
	modelTitle: string = 'Add';
	modelSubmit: string = 'Save';
	form: FormGroup;
	selection = new SelectionModel<Element>(true, []);
	rows: number;
	CodeListig: any = [];
	page: Page;
	SearchForm: FormGroup;
	queryParams: ParamQuery;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('codeTypeList') codeTypeListTable: DatatableComponent;
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
	codeTypeListingTable: any;


	constructor(
		private fb: FormBuilder,
		private modalService: NgbModal,
		private toastrService: ToastrService,
		aclService: AclService,
		protected requestService: RequestService,
		private _route: ActivatedRoute,
		router: Router,
		private location: Location,
		titleService: Title,
		private CanDeactivateModelComponentService: CanDeactivateModelComponentService,
		protected storageData: StorageData,
		private localStorage: LocalStorage
		) {
		super(aclService, router, _route, requestService, titleService);
		this.page = new Page();
		this.page.pageNumber = 0;
		this.page.size = 10;
	}

	ngOnInit() {
		this.setTitle();
		// this.titleService.setTitle(this._route.snapshot.data['title']);
		this.SearchForm = this.fb.group({
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		this._route.queryParams.subscribe(params => {
			this.SearchForm.patchValue(params);
			this.page.pageNumber = parseInt(params.page) || 1;
			this.page.size = parseInt(params.per_page) || 10;
		});
		this.FormInitialization();
		this.setPage({ offset: this.page.pageNumber - 1 || 0 });
		this.codeTypeListingTable = this.localStorage.getObject('codeTypeMasterTableList' + this.storageData.getUserId());
	}

	ngAfterViewInit() {
		if (this.codeTypeListTable?._internalColumns) {
			this.cols = makeDeepCopyArray([...this.codeTypeListTable._internalColumns]);
			this.cols.forEach(element => {
				if(this.codeTypeListingTable?.length) {
					let obj = this.codeTypeListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.codeTypeListingTable?.length) {
				const nameToIndexMap = {};
				this.codeTypeListingTable.forEach((item, index) => {
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
	 * Initialize form
	 * @param void
	 * @returns void
	 */
	FormInitialization(): void {
		this.form = this.fb.group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
			// slug: ['']
		});
	}


	/**
	 * Reset filter
	 * @param void
	 * @returns void
	 */
	resetFilter(): void {
		this.SearchForm.reset();
		this.selection.clear();
		this.setPage({ offset: 0 });
	}

	/**
	 * Dropdown selection how much data user want in listing
	 * @params $num: string
	 * @returns void
	 */
	pageLimit($num: string): void {
		this.page.size = Number($num);
		this.selection.clear();
		this.setPage({ offset: 0 });
	}

	/**
	 * Used method in regionSetPage and perform GET request to receive data
	 * @param queryParams: any
	 * @returns void
	 */

	getCodeTypedata(queryParams: any): void {
		this.loadSpin = true;
		this.subscription.push(
			this.requestService
				.sendRequest(CodeTypeUrl.CODE_TYPE_list_GET, 'GET', REQUEST_SERVERS.fd_api_url, removeEmptyKeysFromObject(queryParams))
				.subscribe(
					(data: any) => {
						if (data.status) {
							this.loadSpin = false;
							this.CodeListig = data.result ? data.result.data : [];
							this.page.totalElements = data.result.total;
							this.selection.clear();
						}
					},
					(err) => {
						this.loadSpin = false;
						const str = parseHttpErrorResponseObject(err.error.message);
						this.toastrService.error(str);
					},
				),
		);
	}

	/**
	 * Checked search form is empty or not and queryparams set for pagination
	 * @param pageInfo : any
	 * @returns void
	 */
	setPage(pageInfo: any): void {
		this.selection.clear();
		this.page.pageNumber = pageInfo.offset;
		const pageNumber = this.page.pageNumber + 1;
		const filters = checkReactiveFormIsEmpty(this.SearchForm);
		this.queryParams = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: this.page.size,
			page: pageNumber,
			pagination: true,
			order_by: 'name'
		};
		let comments = this.SearchForm.value.comments;
		let name = this.SearchForm.value.name;
		let description = this.SearchForm.value.description;
		let per_page = this.page.size;
		let queryparam = { name, comments, description, per_page, page: pageNumber }
		this.addUrlQueryParams(queryparam);
		this.getCodeTypedata({ ...this.queryParams, ...filters });
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
	 * Compare checkbox selection and length of data coming from server and return boolean
	 * @param void
	 * @returns boolean
	 */
	isAllSelected(): boolean {
		this.rows = this.CodeListig.length;
		const numSelected = this.selection.selected.length;
		const numRows = this.rows;
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
			: this.CodeListig.slice(0, this.rows).forEach((row) => this.selection.select(row));
	}

	/**
	 * Create new code Type
	 * @param form  FormGroup
	 * @returns void
	 */
	OncreateCodeTypeform(form) {
		this.loadSpin = true;
		this.requestService
			.sendRequest(CodeTypeUrl.CODE_TYPE_list_POST, 'POST', REQUEST_SERVERS.fd_api_url, form)
			.subscribe(
				(data) => {
					if (data['status']) {
						this.loadSpin = false;
						this.toastrService.success('Successfully added', 'Success');
						this.modalRef.close();
						this.setPage({ offset: 0 });
						this.clearCode();
						this.form.reset();
						this.FormInitialization();
						this.modalRef.close();
					}
				},
				(error) => {
					const str = parseHttpErrorResponseObject(error.error.message);
					// this.toastrService.error(str);
					this.loadSpin = false;
				},
			);
	}

	/**
	 * Send request to server new creating and updating
	 * @param form FormGroup
	 * @returns void
	 */
	onSubmitForm(form: FormGroup): void {
		if (this.modelTitle == 'Add') {
			this.OncreateCodeTypeform(removeEmptyKeysFromObject(form));
		} else {
			this.onEditSubmitCodetype(removeEmptyKeysFromObject(form));
		}
	}

	/**
	 * Method to Update
	 * @param form FormGroup
	 * @returns void
	 */
	onEditSubmitCodetype(form: FormGroup): void {
		const body = {
			id:this.form.controls.id.value,
			name: this.form.controls.name.value,
			comments: this.form.controls.comments.value,
			description:this.form.controls.description.value,
		}
		this.loadSpin = true;
		this.requestService
			.sendRequest(CodeTypeUrl.CODE_TYPE_list_PATCH, 'PUT', REQUEST_SERVERS.fd_api_url, body)
			.subscribe(
				(data) => {
					if (data['status']) {
						this.loadSpin = false;
						this.form.reset();
						this.toastrService.success('Successfully updated', 'Success');
						this.setPage({ offset: 0 });
						this.clearCode();
						this.modalRef.close();
					}
				},
				(error) => {
					this.loadSpin = false;
					const str = parseHttpErrorResponseObject(error.error.message);
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
		// this.form.get('name').disable();
		this.form.patchValue({
			id: row.id,
			name: this.CodeListig[rowIndex].name,
			comments: this.CodeListig[rowIndex].comments,
			description: this.CodeListig[rowIndex].description,
			// slug: this.CodeListig[rowIndex].slug,
		});
	}

	/**
	* Patch heading and save button text
	* @param void
	* @returns void
	*/
	patchAddValues(): void {
		this.FormInitialization();
		this.form.get('name').enable();
		this.modelSubmit = 'Save & Continue';
		this.modelTitle = 'Add';
	}

	/**
	 * Open Modal and patch values new or updating
	 * @param openModal ModalReference
	 * @param row any (optional)
	 * @param rowIndex: number (optional)
	 * @returns void
	 */
	openCodeTypeModal(openModal, row?: any, rowIndex?: number) {
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
		this.modalRef = this.modalService.open(openModal, ngbOPtions);
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

	modalClose(): void {
		if (this.form.dirty && this.form.touched) {
			this.CanDeactivateModelComponentService.canDeactivate().then(res => {
				if (res) {
					this.resetData();
				} else {
					return true;
				}
			});
		} else {
			this.resetData();
		}
	}

	/**
	 * Close Modal and reset form
	 * @param void
	 * @returns void
	 */
	resetData(): void {
		this.modalRef.close();
		this.form.reset();
		this.FormInitialization();
	}

	/**
	 * Clear selected checkbox
	 * @param void
	 * @returns void
	 */
	clearCode(): void {
		this.selection.clear();
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
		if (isEmptyObject(this.SearchForm.value)) {
			return true;
		  }
		  return false;
	}

	codeTypeHistoryStats(row) {
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
			this.localStorage.setObject('codeTypeMasterTableList' + this.storageData.getUserId(), data);
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
		this.codeTypeListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.codeTypeListTable._internalColumns.sort(function (a, b) {
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
