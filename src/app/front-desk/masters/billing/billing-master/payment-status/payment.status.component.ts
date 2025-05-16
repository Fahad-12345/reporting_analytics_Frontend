import { PaymentStatusUrlsEnum } from './../payment.status.url';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { FormGroup, FormBuilder, Validators, Form } from '@angular/forms';
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
import {allStatesList, removeEmptyKeysFromObject, isEmptyObject, checkReactiveFormIsEmpty, isObjectEmpty, makeDeepCopyArray, getIdsFromArray } from '@appDir/shared/utils/utils.helpers';
import { atLeastOneFieldRequired } from '../atLeast-one-field-required.validators';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';

@Component({
	selector: 'payment-status',
	templateUrl: './payment.status.component.html',
	styleUrls: ['./payment.status.component.scss'],
})
export class BillPaymentStatusComponent extends PermissionComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	allStates=[];
	isCollapsed:boolean =false;
	denial: boolean = true;
	loadSpin: boolean = false;
	modalRef: NgbModalRef;
	disableBtn: boolean = false;
	modelTitle: string = 'Add';
	modelSubmit: string = 'Save';
	paymentStatusSerarchForm: FormGroup;
	paymentStatusComingData: any[] = []; // denial coming data from backend
	paymentStatusSelection = new SelectionModel<Element>(true, []);
	paymentStatusTotalRows: number;
	paymentStatusform: FormGroup; // edit form
	PaymentStatusPage: Page;
	DenialqueryParams: ParamQuery;
	//
	is_use_for_bill:Boolean = false ;
	is_use_for_invoice:Boolean = false ;
	showerr:Boolean	= false;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('paymentStatusList') paymentStatusListTable: DatatableComponent;
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
	paymentStatusListingTable: any;

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
		this.PaymentStatusPage = new Page();
		this.PaymentStatusPage.pageNumber = 0;
		this.PaymentStatusPage.size = 10;
	}

	ngOnInit() {
		this.setTitle();
		this.allStates=allStatesList;
		// this.titleService.setTitle(this._route.snapshot.data['title']);
		this.paymentStatusSerarchForm = this.paymentFormSearch();
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.paymentStatusSerarchForm.patchValue(params);
				this.PaymentStatusPage.pageNumber = parseInt(params.page) || 1;
				this.PaymentStatusPage.size = parseInt(params.per_page) || 10;
			}),
		);
		this.paymentStatusSetPage({ offset: this.PaymentStatusPage.pageNumber - 1 || 0 });
		this.paymentStatusform = this.fb.group({
			id: [''],
			name: ['', Validators.required],
			use_for_bill:[''],
			use_for_invoice:[''],
			description: [''],
			comments: [''],
		},
		{ validator: atLeastOneFieldRequired(Validators.required, ['use_for_bill','use_for_invoice']) }
		);
		this.paymentStatusListingTable = this.localStorage.getObject('paymentStatusBillingTableList' + this.storageData.getUserId());
	}

	ngAfterViewInit() {
		if (this.paymentStatusListTable?._internalColumns) {
			this.cols = makeDeepCopyArray([...this.paymentStatusListTable._internalColumns]);
			this.cols.forEach(element => {
				if(this.paymentStatusListingTable?.length) {
					let obj = this.paymentStatusListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.paymentStatusListingTable?.length) {
				const nameToIndexMap = {};
				this.paymentStatusListingTable.forEach((item, index) => {
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

	selectedState:string='';
	stateChange(event)
	{
		this.selectedState=event.fullName;		
	}

	/**
	 * Initialize 'Denial' search form
	 * @param void
	 * @returns FormGroup
	 */
	 paymentFormSearch(): FormGroup {
		return this.fb.group({
			name: ['', Validators.required],
			comments: [''],
			use_for_bill: [''],
			use_for_invoice: [''],
			description:['']
		});
	}


	/**
	 * Reset filter and GET request to get data from server
	 * @param void
	 * @returns void
	 */
	resetPaymentStatus(): void {
		this.paymentStatusSerarchForm = this.paymentFormSearch();
		this.paymentStatusSetPage({ offset: 0 });
		this.paymentStatusform = this.fb.group({
			id: [''],
			name: ['', Validators.required],
			use_for_bill:[''],
			use_for_invoice:[''],
			comments: [''],
			description: [''],
		});
	}

	/**
	 * Compare checkbox selection and length of data coming from server and return boolean
	 * @param void
	 * @returns boolean
	 */
	isPaymentStatusAllSelected(): boolean {
		this.paymentStatusTotalRows = this.paymentStatusComingData.length;
		const numSelected = this.paymentStatusSelection.selected.length;
		const numRows = this.paymentStatusTotalRows;
		return numSelected === numRows;
	}

	/**
	 * Invoke isAllSelected method and perform operation its return value
	 * @param void
	 * @returns void
	 */

	paymentStatusmasterToggle(): void {
		this.isPaymentStatusAllSelected()
			? this.paymentStatusSelection.clear()
			: this.paymentStatusComingData
				.slice(0, this.paymentStatusTotalRows)
				.forEach((row) => this.paymentStatusSelection.select(row));
	}


	/**
	 * Checked search form is empty or not and queryparams set for pagination
	 * @param pageInfo 
	 * @returns void
	 */
	paymentStatusSetPage(pageInfo: any): void {
		this.PaymentStatusPage.pageNumber = pageInfo.offset;
		const pageNumber = this.PaymentStatusPage.pageNumber + 1;
		this.paymentStatusSelection.clear();
		const filters = checkReactiveFormIsEmpty(this.paymentStatusSerarchForm);
		this.DenialqueryParams = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.DEC,
			per_page: this.PaymentStatusPage.size,
			page: pageNumber,
			pagination: true,
			order_by: 'name'
		};
		let per_page = this.PaymentStatusPage.size;
		let queryparam = { per_page, page: pageNumber }
		this.addUrlQueryParams({ ...filters, ...queryparam });
		this.displayDenialUpdated({ ...this.DenialqueryParams, ...filters });
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
	paymentStatusPageLimit($num: string): void {
		this.PaymentStatusPage.size = Number($num);
		this.paymentStatusSelection.clear();
		this.paymentStatusSetPage({ offset: 0 });
	}

	/**
	 * Used method in setPage and perform GET request to receive data
	 * @param queryParams
	 * @returns void
	 */
	displayDenialUpdated(queryParams: any): void {
		this.loadSpin = true;
		this.subscription.push(
			this.requestService
				.sendRequest(
					PaymentStatusUrlsEnum.PaymentStatus_list_GET,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					queryParams,
				)
				.subscribe(
					(comingData: any) => {
						this.loadSpin = false;
						if (comingData['status'] == 200 || comingData['status'] == true) {
							this.paymentStatusComingData = comingData.result ? comingData.result.data : [];
							this.PaymentStatusPage.totalElements = comingData.result ? comingData.result.total :0;
							this.PaymentStatusPage.totalPages = this.PaymentStatusPage.totalElements / this.PaymentStatusPage.size;
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
	 * Create new denial
	 * @param form
	 * @returns void
	 */

	createPaymentStatusSubmit(form: FormGroup): void {
		this.loadSpin = true; 
		if (this.paymentStatusform.valid) {
			this.disableBtn = true;
			this.subscription.push(
				this.requestService
					.sendRequest(
						PaymentStatusUrlsEnum.PaymentStatus_list_POST,
						'POST',
						REQUEST_SERVERS.fd_api_url,
						removeEmptyKeysFromObject(form),
					)
					.subscribe(
						(response: any) => {
							this.disableBtn = false;
							if (response.status === 200 ||  response.status == true) { 
								this.loadSpin = false;
								this.paymentStatusSelection.clear();
								this.paymentStatusform.reset();
								this.modalRef.close();
								this.paymentStatusSetPage({ offset: this.PaymentStatusPage.pageNumber });
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
		if(row.use_for_bill == false || row.use_for_bill == false){
			this.is_use_for_bill = false;
		}
		else{
			this.is_use_for_bill = true;
		}
		if(row.use_for_invoice == false || row.use_for_invoice == false){
			this.is_use_for_invoice = false;
		}
		else{
			this.is_use_for_invoice = true;
		}
		// this.denialform.get('name').disable();
		
		this.disableBtn = false;
		this.paymentStatusform.patchValue({
			id: row.id,
			use_for_bill:row.use_for_bill,
			use_for_invoice:row.use_for_invoice,
			name: this.paymentStatusComingData[rowIndex].name,
			description: this.paymentStatusComingData[rowIndex].description,
			comments: this.paymentStatusComingData[rowIndex].comments,
		});
	}

	/**
	 * Patch heading and save button text
	 * @param void
	 * @returns void
	 */
	patchAddValues(): void {
		this.disableBtn = false;
		this.is_use_for_bill = false;
		this.is_use_for_invoice = false;
		this.paymentStatusform.reset();
		this.paymentStatusform.get('name').enable();
		this.modelSubmit = 'Save & Continue';
		this.modelTitle = 'Add';
	}

	/**
	 * Open Modal and patch values new or updating
	 * @param denialModel :formReference
	 * @param row : any
	 * @param  rowIndex: number
	 * @returns void
	 */

	openPaymentStatusModal(denialModel, row?: any, rowIndex?: number): void {
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

		this.modalRef = this.modalService.open(denialModel, ngbModalOptions);
	}

	/**
	 * Send request to server new creating and updating
	 * @param form : FormGroup
	 * @returns void
	 */
	onSavePaymentStatusSubmit(form: FormGroup): void {
		if(form.controls['use_for_bill'].value == null && form.controls['use_for_invoice'].value == null){
			debugger
			this.showerr = true;
		}
		else if(form.controls['use_for_bill'].value == false && form.controls['use_for_invoice'].value == false){
			this.showerr = true;
		}
		else{
			this.showerr = false;
		}
		if(form.controls['use_for_bill'].value == null){
			form.controls['use_for_bill'].setValue(false)
		}
		if(form.controls['use_for_invoice'].value == null){
			form.controls['use_for_invoice'].setValue(false)
		}
		let saveform = { ...form.getRawValue() }
		if(!this.showerr){
			if (this.modelTitle == 'Add') {
				this.createPaymentStatusSubmit(saveform);
			} else {
				this.updateDeniatSubmit(saveform);
			}
		}
	}

	/**
	 * Update denial
	 * @param form: FormGroup
	 * @returns void
	 */
	updateDeniatSubmit(form: FormGroup): void {
		console.log(form)
		this.loadSpin = false;
		if (this.paymentStatusform.valid) {
			this.disableBtn = true;
			this.subscription.push(
				this.requestService
					.sendRequest(
						PaymentStatusUrlsEnum.PaymentStatus_list_PUT,
						'PUT',
						REQUEST_SERVERS.fd_api_url,
						form,
					)
					.subscribe(
						(response: any) => {
							this.disableBtn = false;
							if (response.status === 200 || response.status == true) {
								this.loadSpin = false;
								this.paymentStatusSelection.clear();
								this.modalRef.close();
								this.paymentStatusform.reset();
								this.paymentStatusSetPage({ offset: this.PaymentStatusPage.pageNumber });
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
		if (this.paymentStatusform.dirty && this.paymentStatusform.touched) {
			this.CanDeactivateService.canDeactivate().then(res => {
				if (res) {
					this.paymentStatusform.reset();
					this.modalRef.close();
				} else {
					return true;
				}
			});
		} else {
			this.paymentStatusform.reset();
			this.modalRef.close();
		}
	}

	checkInputs(){
			if (isEmptyObject(this.paymentStatusSerarchForm.value)) {
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
	
	paymentStatusHistoryStats(row) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc body-scroll history-modal',
			modalDialogClass: 'modal-lg'
		};
		let modelRef = this.modalService.open(CreatedHistoryComponent,ngbModalOptions);
		modelRef.componentInstance.createdInformation = [row];
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
			this.localStorage.setObject('paymentStatusBillingTableList' + this.storageData.getUserId(), data);
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
		this.paymentStatusListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.paymentStatusListTable._internalColumns.sort(function (a, b) {
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
	

	// temporary disabled used in future
	//   deleteOneDenial(row) {
	//     this.confirmService.create('Delete Confirmation?', 'Are you sure you want to delete it?').subscribe((ans: ResolveEmit) => {
	//       if (ans.resolved) {
	//         this.fdServices.deleteOneverDenialRecord(row)
	//    this.requestService.sendRequest(
	// 	DenialUrlsEnum.Denial_list_DELETE,
	// 		'DELETE_WITH_BODY',
	// 		REQUEST_SERVERS.fd_api_url,
	// 		row.id
	// 	)
	//   .subscribe(
	//           response => {
	//             if (response.status === 200) {
	//               this.denialSelection.clear();
	//               this.denialSetPage({ offset: this.denialPage.pageNumber });
	//               this.toastrService.success('Data Deleted successfully', 'Success');
	//             }
	//           }
	//         )
	//       }
	//     })

	//   }

	// temporary disabled used in future
	//   deleteMultipleDenialRecord() {
	//     const selected = this.denialSelection.selected;
	//     const arr: any = [];
	//     for (let p = 0; p < selected.length; p++) {
	//       arr[p] = selected[p].id;
	//     }
	//     console.log('arr', arr)

	//     this.confirmService.create('Delete Confirmation?', 'You want to delete all records').subscribe(
	//       value => {
	//         if (value.resolved) {
	//           this.fdServices.deleteMultipleDenialRecord(arr)
	//   this.requestService.sendRequest(
	// 		DenialUrlsEnum.Denial_list_DELETEMultiple,
	// 			'DELETE_WITH_BODY',
	// 			REQUEST_SERVERS.fd_api_url,
	// 			arr
	// 		)
	//   .subscribe(
	//             response => {
	//               if (response.status === 200) {
	//                 this.denialSetPage({ offset: this.denialPage.pageNumber });
	//                 this.denialSelection.clear();
	//                 this.toastrService.success('Data Deleted successfully', 'Success');
	//                 this.caseSearchForm.reset();
	//               }
	//             }
	//           );
	//         }
	//       }
	//     )

	//   }
}
