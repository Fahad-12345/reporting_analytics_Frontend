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
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Router, ActivatedRoute } from '@angular/router'
import { Title } from '@angular/platform-browser';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { Location} from '@angular/common'
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { CodesUrl } from '../../codes-url.enum';
import { checkReactiveFormIsEmpty, getIdsFromArray, isEmptyObject, isObjectEmpty, makeDeepCopyArray } from '@appDir/shared/utils/utils.helpers';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { environment } from 'environments/environment';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';

@Component({
	selector: 'app-cpt-codes',
	templateUrl: './cpt-codes.component.html',
	styleUrls: ['./cpt-codes.component.scss']
})
export class CPTCodesComponent extends PermissionComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	isCollapsed:boolean = false;
	CPT: boolean = true;
	modalRef: NgbModalRef;
	exchangeData: any[] = [];
	loadSpin: boolean = false;
	getIcdCodes: any = [];
	errorMessage: any;
	modelTitle: string = 'Add';
	modelSubmit: string = 'Save';
	cptCodesform: FormGroup; // create form for Cpt-Codes
	CptSelection = new SelectionModel<Element>(true, []); // cpt selection for checkbox
	cptRows: number;
	CptData: any[];
	CPTpage: Page;
	CPTSearchForm: FormGroup;
	cptUpdate = false;
	CPTqueryParams: ParamQuery;
	environment= environment;
	typeId = 2;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('cptCodesList') cptCodesListTable: DatatableComponent;
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
	cptCodesListingTable: any;

	constructor(
		private fb: FormBuilder,
		private modalService: NgbModal,
		private toastrService: ToastrService,
		aclService: AclService,
		protected requestService: RequestService,
		private _route: ActivatedRoute,
		router: Router,
		private location: Location,
		public datePipeService: DatePipeFormatService,
		titleService: Title,
		private CanDeactivateModelComponentService: CanDeactivateModelComponentService,
		protected storageData: StorageData,
		private localStorage: LocalStorage
		) {
		super(aclService, router, _route, requestService, titleService);
		this.CPTpage = new Page();
		this.CPTpage.pageNumber = 0;
		this.CPTpage.size = 10;
	}

	ngOnInit() {
		// this.titleService.setTitle(this._route.snapshot.data['title']);
		this.setTitle();
		this.CPTSearchForm = this.fb.group({
			name: ['', Validators.required],
			type: ['CPT'],
			description: [''],
			short_description: [''],
			medium_description: [''],
			long_description: [''],
			comments: ['']
		});
		this._route.queryParams.subscribe(params => {
			this.CPTSearchForm.patchValue(params);
			this.CPTpage.pageNumber = parseInt(params.page) || 1
			this.CPTpage.size = parseInt(params.per_page) || 10
		});
		this.CPTInitialization();
		this.CPTsetPage({ offset: this.CPTpage.pageNumber - 1 || 0 });
		this.cptCodesListingTable = this.localStorage.getObject('cptCodesMasterTableList' + this.storageData.getUserId());
	}

	ngAfterViewInit() {
		if (this.cptCodesListTable?._internalColumns) {
			this.cols = makeDeepCopyArray([...this.cptCodesListTable._internalColumns]);
			this.cols.forEach(element => {
				if(this.cptCodesListingTable?.length) {
					let obj = this.cptCodesListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.cptCodesListingTable?.length) {
				const nameToIndexMap = {};
				this.cptCodesListingTable.forEach((item, index) => {
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
	 * Initialize 'CPT' form
	 * @param void
	 * @returns void
	 */
	CPTInitialization(): void {
		this.cptCodesform = this.fb.group({
			id: [''],
			name: ['', Validators.required],
			type: ['CPT'],
			description: [''],
			short_description: [''],
			medium_description: [''],
			long_description: [''],
			comments: [''],
			with_contrast: [0], 
			without_contrast: [0], 
			with_without_contrast: [0]
		});
		 this.cptCodesform.get('with_contrast').valueChanges.subscribe(value => {
			this.cptCodesform.patchValue({ with_contrast: value ? 1 : 0 }, { emitEvent: false });
		});
	
		this.cptCodesform.get('without_contrast').valueChanges.subscribe(value => {
			this.cptCodesform.patchValue({ without_contrast: value ? 1 : 0 }, { emitEvent: false });
		});
		this.cptCodesform.get('with_without_contrast').valueChanges.subscribe(value => {
			this.cptCodesform.patchValue({ with_without_contrast: value ? 1 : 0 }, { emitEvent: false });
		});
	}


	/**
	 * Reset filter
	 * @param void
	 * @returns void
	 */
	resetCPT(): void {
		this.CPTSearchForm.reset();
		this.CPTSearchForm.controls.comments.setValue[''];
		this.CPTSearchForm.controls.description.setValue[''];
		this.CPTSearchForm.controls.name.setValue[''];
		this.CptSelection.clear();
		this.CPTsetPage({ offset: 0 });
	}

	/**
	 * Dropdown selection how much data user want in listing
	 * @params $num: string
	 * @returns void
	 */
	CPTpageLimit($num: string): void {
		this.CPTpage.size = Number($num);
		this.CptSelection.clear();
		this.CPTsetPage({ offset: 0 });
	}

	/**
	 * Used method in regionSetPage and perform GET request to receive data
	 * @param queryParams: any
	 * @returns void
	 */

	getCPTdata(queryParams: any): void {
		this.loadSpin = true;
		this.subscription.push(
			this.requestService
				.sendRequest(CodesUrl.CODES_SINGLE_GET, 'GET', REQUEST_SERVERS.fd_api_url, queryParams)
				.subscribe(
					(data: any) => {
						if (data.status) {
							this.loadSpin = false;
							this.CptData = data.result ? data.result.data : [];
							this.CPTpage.totalElements = data.result.total;
							this.CptSelection.clear();
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
	 * Checked search form is empty or not and queryparams set for pagination
	 * @param pageInfo : any
	 * @returns void
	 */
	CPTsetPage(pageInfo: any): void {
		this.CptSelection.clear();
		this.CPTpage.pageNumber = pageInfo.offset;
		const pageNumber = this.CPTpage.pageNumber + 1;
		const filters = checkReactiveFormIsEmpty(this.CPTSearchForm);
		this.CPTqueryParams = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: this.CPTpage.size,
			page: pageNumber,
			pagination: true,
			order_by: 'name'
		};
		let name = this.CPTSearchForm.value && this.CPTSearchForm.value.name ? this.CPTSearchForm.value.name : '';
		let per_page = this.CPTpage.size;
		let queryparam = { name, per_page, page: pageNumber };
		this.CPTqueryParams['code_type_id'] = this.typeId;
		this.addUrlQueryParams(queryparam);
		this.getCPTdata({ ...this.CPTqueryParams, ...filters });
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
	isCptAllSelected(): boolean {
		this.cptRows = this.CptData.length;
		const numSelected = this.CptSelection.selected.length;
		const numRows = this.cptRows;
		return numSelected === numRows;
	}

	/**
	 * Invoke isAllSelected method and perform operation its return value
	 * @param void
	 * @returns void
	 */
	CptmasterToggle(): void {
		this.isCptAllSelected()
			? this.CptSelection.clear()
			: this.CptData.slice(0, this.cptRows).forEach((row) => this.CptSelection.select(row));
	}

	/**
	 * Create new ICD code
	 * @param form  FormGroup
	 * @returns void
	 */
	OncreateCptCodesform(form) {
		this.loadSpin = true;
		this.cptUpdate = true;
		form['code_type_id'] = this.typeId;
		this.requestService
			.sendRequest(CodesUrl.CODES_list_POST, 'POST', REQUEST_SERVERS.fd_api_url, form)
			.subscribe(
				(data) => {
					if (data['status'] === 200 || data['status'] === true) {
						this.loadSpin = false;
						this.cptUpdate = false;
						this.toastrService.success('Successfully added', 'Success');
						this.modalRef.close();
						this.CPTsetPage({ offset: 0 });
						this.clearCPT();
						this.cptCodesform.reset();

						this.CPTInitialization();
						this.modalRef.close();
					}
				},
				(error) => {
					// const str = parseHttpErrorResponseObject(error.error.message);
					// this.toastrService.error(str);
					this.loadSpin = false;
					this.cptUpdate = false;
				},
			);
	}

	/**
	 * Send request to server new creating and updating
	 * @param form FormGroup
	 * @returns void
	 */
	onSubmitCptCodes(form): void {
		form['type'] = "CPT"
		if (this.modelTitle == 'Add') {
			this.OncreateCptCodesform(form);
		} else {
			this.onEditSubmitCptCodes(form);
		}
	}

	/**
	 * Method to Update
	 * @param form FormGroup
	 * @returns void
	 */
	onEditSubmitCptCodes(form: FormGroup): void {
		form['code_type_id'] = this.typeId;
		this.loadSpin = true;
		this.cptUpdate = true;
		this.requestService
			.sendRequest(CodesUrl.CODES_list_PATCH, 'PUT', REQUEST_SERVERS.fd_api_url, form)
			.subscribe(
				(data) => {
					if (data['status'] === 200 || data['status'] === true) {
						this.cptUpdate = false;
						this.loadSpin = false;
						this.cptCodesform.reset();
						this.toastrService.success('Successfully updated', 'Success');
						this.CPTsetPage({ offset: this.CPTpage.pageNumber ? this.CPTpage.pageNumber  : 0 });
						this.clearCPT();
						this.modalRef.close();
					}
				},
				(error) => {
					this.loadSpin = false;
					// const str = parseHttpErrorResponseObject(error.error.message);
					// this.toastrService.error(str);
					this.cptUpdate = false;
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
		// this.cptCodesform.get('name').disable();
		this.cptCodesform.patchValue({
			id: row.id,
			name: this.CptData[rowIndex].name,
			description: this.CptData[rowIndex].description,
			short_description: this.CptData[rowIndex].short_description,
			medium_description: this.CptData[rowIndex].medium_description,
			long_description: this.CptData[rowIndex].long_description,
			comments: this.CptData[rowIndex].comments,
			with_contrast: this.CptData[rowIndex].with_contrast,
			without_contrast: this.CptData[rowIndex].without_contrast,
			with_without_contrast: this.CptData[rowIndex].with_without_contrast
		});
	}

	/**
	* Patch heading and save button text
	* @param void
	* @returns void
	*/
	patchAddValues(): void {
		this.CPTInitialization();
		this.cptCodesform.get('name').enable();
		this.modelSubmit = 'Save & Continue';
		this.modelTitle = 'Add';
	}

	/**
	 * Open Modal and patch values new or updating
	 * @param editCPT ModalReference
	 * @param row any (optional)
	 * @param rowIndex: number (optional)
	 * @returns void
	 */
	openModalCPT(editCPT, row?: any, rowIndex?: number) {
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
		this.modalRef = this.modalService.open(editCPT, ngbOPtions);
	}

	// temporary disabled used in future
	// deleteOneCptCode(row) {
	// 	this.confirmService
	// 		.create('Delete Confirmation?', 'You want to delete the record')
	// 		.subscribe((value: ResolveEmit) => {
	// 			if (value.resolved) {
	// 				this.fdSevices.deleteOneCptCodesRecord(row).subscribe(
	// 					(res) => {
	// 						const { message } = res;
	// 						this.CptData = this.CptData.filter((CPTid) => CPTid.id !== row.id);
	// 						this.toastrService.success('Record delted successfully', 'Success');
	// 						this.clearCPT();
	// 					},
	// 					(err) => {
	// 						this.toastrService.error(err.message, 'Error');
	// 					},
	// 				);
	// 			}
	// 		});
	// }

	// temporary disabled used in future
	// deleteMultipleCptCode() {
	// 	const selected = this.CptSelection.selected;
	// 	const arr: any = [];
	// 	for (let p = 0; p < selected.length; p++) {
	// 		arr[p] = selected[p].id;
	// 	}
	// 	console.log('arr', arr);
	// 	this.confirmService
	// 		.create('Delete Confirmation?', 'Are you sure you want to delete all records?')
	// 		.subscribe((value: ResolveEmit) => {
	// 			if (value.resolved) {
	// 				this.fdSevices.deleteMultipleCptCodesRecord(arr).subscribe((res) => {
	// 					if (res.status === 200) {
	// 						this.CPTsetPage({ offset: this.CPTpage.pageNumber });
	// 						this.clearCPT();
	// 						this.toastrService.success('Selected data deleted successfully', 'Success');
	// 					}
	// 				});
	// 			}
	// 		});
	// }


	/**
	 * A library method takes an object and converts into string and return
	 * @param obj
	 * @returns string
	 */
	CPTstringfy(obj: any): string {
		return JSON.stringify(obj);
	}

	/**
	 * CloseModal and ask user to fill data or not
	 * @param void
	 * @returns void | boolean
	 */

	CPTClose(): void {
		if (this.cptCodesform.dirty && this.cptCodesform.touched) {
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
		this.cptCodesform.reset();
		this.CPTInitialization();
	}

	/**
	 * Clear selected checkbox
	 * @param void
	 * @returns void
	 */
	clearCPT(): void {
		this.CptSelection.clear();
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
		if(this.CPTSearchForm.controls.comments.value == '' && this.CPTSearchForm.controls.description.value == '' && this.CPTSearchForm.controls.name.value == '' || isEmptyObject(this.CPTSearchForm.value)) {
			return true;
		} else {
			return false;
		}
	}

	cptCodeHistoryStats(row) {
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
			this.localStorage.setObject('cptCodesMasterTableList' + this.storageData.getUserId(), data);
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
		this.cptCodesListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.cptCodesListTable._internalColumns.sort(function (a, b) {
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
