import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModalRef, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Page } from '@appDir/front-desk/models/page';
import { ToastrService } from 'ngx-toastr';
import { AclService } from '@appDir/shared/services/acl.service';
import { Subscription } from 'rxjs';
import {
	unSubAllPrevious
} from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { PaymentTypeUrlsEnum } from '../PaymentType-Urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Location } from '@angular/common'
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { removeEmptyKeysFromObject, isEmptyObject, checkReactiveFormIsEmpty, isObjectEmpty, makeDeepCopyArray, getIdsFromArray } from '@appDir/shared/utils/utils.helpers';
import { atLeastOneFieldRequired } from '../atLeast-one-field-required.validators';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';

@Component({
	selector: 'app-payment-type',
	templateUrl: './payment-type.component.html',
	styleUrls: ['./payment-type.component.scss'],
})
export class PaymentTypeComponent extends PermissionComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	isCollapsed:boolean =false;
	loadSpin: boolean = false;
	modalRef: NgbModalRef;
	modelTitle: string = 'Add';
	modelSubmit: string = 'Save';
	paymentSearch: FormGroup;
	paymentTypeComingData: any[] = []
	selection = new SelectionModel<Element>(true, []);
	totalRows: number;
	paymentform: FormGroup;
	page: Page;
	queryParams: ParamQuery;
	disableBtn: boolean = false; 
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('paymentTypeList') paymentTypeListTable: DatatableComponent;
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
	paymentTypeListingTable: any;

	constructor(
		public fb: FormBuilder,
		private modalService: NgbModal,
		private toastrService: ToastrService,
		aclService: AclService,
		protected requestService: RequestService,
		private _route: ActivatedRoute,
		router: Router,
		titleService: Title,
		private location: Location,
		private CanDeactivateService: CanDeactivateModelComponentService,
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
		this.paymentSearch = this.PaymentSearchForm();
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.paymentSearch.patchValue(params);
				this.page.pageNumber = parseInt(params.page) || 1;
				this.page.size = parseInt(params.per_page) || 10;
			}),
		);
		this.setPage({ offset: this.page.pageNumber - 1 || 0 });
		this.paymentform = this.fb.group({
			id: [''],
			name: ['', Validators.required],
			use_for_bill : [''],
			use_for_invoice: [''],
			comments: [''],
			description: ['']
		},
		{ validator: atLeastOneFieldRequired(Validators.required, ['use_for_bill','use_for_invoice']) }
		);
		this.paymentTypeListingTable = this.localStorage.getObject('paymentTypeBillingTableList' + this.storageData.getUserId());
	}

	ngAfterViewInit() {
		if (this.paymentTypeListTable?._internalColumns) {
			this.cols = makeDeepCopyArray([...this.paymentTypeListTable._internalColumns]);
			this.cols.forEach(element => {
				if(this.paymentTypeListingTable?.length) {
					let obj = this.paymentTypeListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.paymentTypeListingTable?.length) {
				const nameToIndexMap = {};
				this.paymentTypeListingTable.forEach((item, index) => {
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
	 * Initialize 'Payment-type' search form
	 * @param void
	 * @returns FormGroup
	 */

	PaymentSearchForm(): FormGroup {
		return this.fb.group({
			name: [''],
			comments: [''],
			description: ['']
		});
	}

	/**
	 * Create new payment-type
	 * @param form  FormGroup
	 * @returns void
	 */

	createPaymentForm(form: FormGroup): void {	
		this.loadSpin = true;
		this.disableBtn = true;
		if (this.paymentform.valid) {
			this.subscription.push(
				this.requestService
					.sendRequest(
						PaymentTypeUrlsEnum.PaymentType_list_POST,
						'POST',
						REQUEST_SERVERS.fd_api_url,
						form,
					)
					.subscribe(
						(resp) => {
							if (resp['status'] == 200 || resp['status'] == true) {
								this.loadSpin = false;
								this.disableBtn = false;
								this.paymentform.reset();
								this.modalRef.close();
								this.selection.clear();
								this.paymentform.reset();
								this.setPage({ offset: 0 });
								this.toastrService.success('Successfully added', 'Success');
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
			// this.paymentform.reset();
			// this.modalRef.close();
		}
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
		const filters = checkReactiveFormIsEmpty(this.paymentSearch);
		this.queryParams = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: this.page.size || 10,
			page: pageNumber,
			pagination: true,
			order_by: 'name'
		};
		let per_page = this.page.size;
		let queryparam = { per_page, page: pageNumber }
		this.addUrlQueryParams({ ...filters, ...queryparam });
		this.diplsayUpdatedGetPayment({ ...this.queryParams, ...filters });
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
	 * Compare checkbox selection and length of data coming from server and return boolean
	 * @param void
	 * @returns boolean
	 */
	isAllSelected(): boolean {
		this.totalRows = this.paymentTypeComingData.length;
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
			: this.paymentTypeComingData
				.slice(0, this.totalRows)
				.forEach((row) => this.selection.select(row));
	}

	/**
	 * Dropdown selection how much data user want in listing
	 * @params $num: string
	 * @returns void
	 */
	pageLimit($num: string): void {
		this.page.size = Number($num);
		this.setPage({ offset: 0 });
	}

	/**
	 * Used method in setPage and perform GET request to receive data
	 * @param queryParams: any
	 * @returns void
	 */
	diplsayUpdatedGetPayment(queryParams: any): void {
		this.loadSpin = true;
		this.subscription.push(
			this.requestService
				.sendRequest(
					PaymentTypeUrlsEnum.PaymentType_list_GET,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					removeEmptyKeysFromObject(queryParams),
				)
				.subscribe(
					(resp: any) => {
						if (resp['status'] == 200 || resp['status'] == true) {
							this.loadSpin = false;
							this.paymentTypeComingData = resp.result ? resp.result.data : [];
							this.page.totalElements = resp.result ? resp.result.total : 0;
							this.page.totalPages = this.page.totalElements / this.page.size;
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
	 * Patch values on edit click
	 * @param row : any
	 * @param rowIndex : number
	 * @returns void
	 */

	patchEditValues(row: any, rowIndex: number) {
		
		if (this.paymentTypeComingData[rowIndex].slug == 'bill' ||this.paymentTypeComingData[rowIndex].slug == 'invoice' ||this.paymentTypeComingData[rowIndex].slug == 'overpayment' ||this.paymentTypeComingData[rowIndex].slug == 'interest') {
			this.paymentform.get('name').disable();
		  } else {
			this.paymentform.get('name').enable();
		  }
		
		this.modelSubmit = 'Update';
		this.modelTitle = 'Edit';
		this.paymentform.patchValue({
			id: row.id,
			name: this.paymentTypeComingData[rowIndex].name,
			comments: this.paymentTypeComingData[rowIndex].comments,
			description: this.paymentTypeComingData[rowIndex].description,
			use_for_bill:(this.paymentTypeComingData[rowIndex].use_for_bill==1)?true:false,
			use_for_invoice:(this.paymentTypeComingData[rowIndex].use_for_invoice==1)?true:false,
		});
	
	}

	/**
	 * Patch heading and save button text
	 * @param void
	 * @returns void
	 */
	patchAddValues(): void {
		this.paymentform.reset();
		this.paymentform.get('name').enable();
		this.modelSubmit = 'Save & Continue';
		this.modelTitle = 'Add';
	}

	/**
	 * Open Modal and patch values new or updating
	 * @param paymentType ModalReference
	 * @param row any (optional)
	 * @param rowIndex: number (optional)
	 * @returns void
	 */
	paymentTypeOpenModal(paymentType, row?: any, rowIndex?: number): void {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		if (row == undefined || row == null) {
			this.patchAddValues();
		} else {
			this.patchEditValues(row, rowIndex);
		}
		this.modalRef = this.modalService.open(paymentType, ngbModalOptions);
	}

	/**
	 * Send request to server new creating and updating
	 * @param form FormGroup
	 * @returns void
	 */

	savePaymentTypeForm(form: FormGroup): void {
		if (this.modelTitle == 'Add') {
			this.createPaymentForm(removeEmptyKeysFromObject(form));
		} else {
			this.editPaymentTypeForm(removeEmptyKeysFromObject(form));
		}
	}

	/**
	 * Method to Update
	 * @param form FormGroup
	 * @returns void
	 */

	editPaymentTypeForm(form: FormGroup): void {
		this.disableBtn = true;
		this.loadSpin = true;
		this.subscription.push(
			this.requestService
				.sendRequest(
					PaymentTypeUrlsEnum.PaymentType_list_PATCH,
					'PUT',
					REQUEST_SERVERS.fd_api_url,
					form,
				)
				.subscribe(
					(resp) => {
						if (resp['status'] == 200 || resp['status'] == true) {
							this.loadSpin = false;
							this.disableBtn = false;
							this.selection.clear();
							this.paymentform.reset();
							this.modalRef.close();
							this.setPage({ offset: this.page.pageNumber });
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
	/**
	 * Reset filter
	 * @param void
	 * @returns void
	 */
	resetPayment(): void {
		this.paymentSearch = this.PaymentSearchForm();
		this.setPage({ offset: 0 });
		this.paymentform = this.fb.group({
			id: [''],
			name: ['', Validators.required],
			use_for_bill : [''],
			use_for_invoice: [''],
			comments: [''],
			description: ['']
		});
	}

	/**
	 * CloseModal and ask user to fill data or not
	 * @param void
	 * @returns void | boolean
	 */
	closeModel(): void | boolean {
		if (this.paymentform.dirty && this.paymentform.touched) {
			this.CanDeactivateService.canDeactivate().then(res => {
				if (res) {
					this.paymentform.reset();
					this.modalRef.close();
				} else {
					return true;
				}
			});
		} else {
			this.paymentform.reset();
			this.modalRef.close();
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
	 * LifeCycle hook method unsubscribe all Observables to prevent from memory leakage
	 * @param void
	 * @returns void
	 */
	ngOnDestroy(): void {
		unSubAllPrevious(this.subscription);
	}

	checkInputs(){
		if (isEmptyObject(this.paymentSearch.value)) {
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
			this.localStorage.setObject('paymentTypeBillingTableList' + this.storageData.getUserId(), data);
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
		this.paymentTypeListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.paymentTypeListTable._internalColumns.sort(function (a, b) {
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
	//   deleteOnePaymentRecord(row: any) {
	//     this.confirmService.create('Delete Confirmation?', 'Are you sure you want to delete it?').subscribe((ans: ResolveEmit) => {
	//       if (ans.resolved) {
	//  //       this.fdServices.deleteOnePaymentTypeRecord(row)
	// this.requestService.sendRequest(
	// 	PaymentTypeUrlsEnum.PaymentType_list_DELETE,
	// 	'DELETE_WITH_BODY',
	// 	REQUEST_SERVERS.fd_api_url,
	// 	row.id
	// )
	// .subscribe(
	//           response => {
	//             if (response.status === 200) {
	//               this.selection.clear();
	//               this.setPage({ offset: this.page.pageNumber })
	//               this.toastrService.success('Deleted Successfully', 'Success');
	//             }
	//           }
	//         )
	//       }
	//     })

	//   }

	// temporary disabled used in future
	//   deleteMultiplePaymentType() {
	//     const selected = this.selection.selected;
	//     const arr: any = [];
	//     for (let p = 0; p < selected.length; p++) {
	//       arr[p] = selected[p].id;
	//     }
	//     console.log('arr', arr)
	//     this.confirmService.create('All Delete Confirmation', 'You want to delete all records?').subscribe(
	//       value => {
	//         if (value.resolved) {
	//      //     this.fdServices.deleteMultiplePaymentTypeRecord(arr)
	// this.requestService.sendRequest(
	// 	PaymentTypeUrlsEnum.PaymentType_list_DELETEMultiple,
	// 	'DELETE_WITH_BODY',
	// 	REQUEST_SERVERS.fd_api_url,
	// 	arr
	// )
	// .subscribe(
	//             response => {
	//               if (response.status === 200) {
	//                 this.setPage({ offset: this.page.pageNumber });
	//                 this.selection.clear();
	//                 this.paymentSearch = this.PaymentSearchForm();
	//                 this.setPage({ offset: 0 });
	//                 this.toastrService.success('Data Updated successfully', 'Success');
	//               }
	//             }
	//           );
	//         }
	//       }
	//     )

	//   }

	paymentTypeHistoryStats(row) {
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
