import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { SelectionModel } from '@angular/cdk/collections';
import { FormGroup, FormBuilder, Validators, Form } from '@angular/forms';
import { NgbModalRef, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Page } from '@appDir/front-desk/models/page';
import { ToastrService } from 'ngx-toastr';
import { AclService } from '@appDir/shared/services/acl.service';
import { EventValidationErrorMessage } from 'calendar-utils';
import { HttpService } from '@appDir/front-desk/fd_shared/services/http.service';
import { Subscription } from 'rxjs';
import {
	unSubAllPrevious,} from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { CaseStatusUrlsEnum } from '../CaseStatus-Urls-Enum';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Location, LocationStrategy } from '@angular/common'
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { removeEmptyKeysFromObject, isEmptyObject, whitespaceFormValidation, checkReactiveFormIsEmpty, isObjectEmpty, makeDeepCopyArray, getIdsFromArray  } from '@appDir/shared/utils/utils.helpers';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';

@Component({
	selector: 'app-case-status',
	templateUrl: './case-status.component.html',
	styleUrls: ['./case-status.component.scss'],
})
export class CaseStatusComponent extends PermissionComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	isCollapsed:boolean =false;
	status: boolean = true;
	loadSpin: boolean = false;
	modalRef: NgbModalRef;
	disableBtn: boolean = false;
	modelTitle: string = 'Add';
	modelSubmit: string = 'Save';
	caseSearchForm: FormGroup;
	caseStatusComingData: any[] = [];
	caseStatusSelection = new SelectionModel<Element>(true, []);
	caseStatusTotalRows: number;
	caseStatusform: FormGroup; // edit form for Case Status
	casePage: Page;
	caseStatusQueryParams: ParamQuery;
	errorMessage: string;
	rows: [];
	columns: [];
	exchangeData: any[] = [];
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('caseStatusList') caseStatusListTable: DatatableComponent;
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
	caseStatusListingTable: any;

	constructor(
		private fb: FormBuilder,
		private modalService: NgbModal,
		private toastrService: ToastrService,
		public aclService: AclService,
		private http: HttpService,
		protected requestService: RequestService,
		private _route: ActivatedRoute,
		private _router: Router,
		titleService: Title,
		private location: Location, 
		private locationStratgy: LocationStrategy,
		private CanDeactivateModelComponentService: CanDeactivateModelComponentService,
		protected storageData: StorageData,
		private localStorage: LocalStorage
	) {
		super(aclService, _router, _route, requestService, titleService);
		this.casePage = new Page();
		this.casePage.pageNumber = 0;
		this.casePage.size = 10;
	}

	ngOnInit() {
		// this.titleService.setTitle(this._route.snapshot.data['title']);
		this.setTitle();
		this.caseSearchForm = this.initializeCaseForm();
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.caseSearchForm.patchValue(params);
				this.casePage.pageNumber = parseInt(params.page) || 1;
				this.casePage.size = parseInt(params.per_page) || 10;
			}),
		);
		this.caseSetPgae({ offset: this.casePage.pageNumber - 1 || 0 });
		this.caseStatusform = this.fb.group({
			id: [''],
			name: ['', [Validators.required, whitespaceFormValidation()]],
			description: [''],
			comments: [''],
		});
		this.caseStatusListingTable = this.localStorage.getObject('caseStatusBillingTableList' + this.storageData.getUserId());
	}

	ngAfterViewInit() {
		if (this.caseStatusListTable?._internalColumns) {
			this.cols = makeDeepCopyArray([...this.caseStatusListTable._internalColumns]);
			this.cols.forEach(element => {
				if(this.caseStatusListingTable?.length) {
					let obj = this.caseStatusListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.caseStatusListingTable?.length) {
				const nameToIndexMap = {};
				this.caseStatusListingTable.forEach((item, index) => {
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
	 * Initialize 'case status' search form
	 * @param void
	 * @returns FormGroup
	 */
	initializeCaseForm(): FormGroup {
		return this.fb.group({
			name: [''],
			comments: [''],
			description: ['']
		});
	}

	// caseFilter() {
	// 	this.exchangeData = this.caseStatusComingData;
	// 	if (this.caseSearchForm.valid) {
	// 		this.subscription.push(
	// 			this.http.postSearch('case-status/search', this.caseSearchForm.value).subscribe((resp) => {
	// 				if (resp['status'] === 200 || resp['status']) {
	// 					this.caseStatusComingData = resp['data'];
	// 					this.casePage.totalElements = this.caseStatusComingData.length;
	// 				}
	// 			}),
	// 		);
	// 	}
	// }

	/**
	 * Reset filter
	 * @param void
	 * @returns void
	 */

	resetCase() {
		this.caseSearchForm = this.initializeCaseForm();
		this.caseStatusSelection.clear();
		this.caseSetPgae({ offset: 0 });
		this.caseStatusform = this.fb.group({
			id: [''],
			name: ['', [Validators.required, whitespaceFormValidation()]],
			description: ['', Validators.required],
			comments: [''],
		});
	}

	/**
 * Compare checkbox selection and length of data coming from server and return boolean
 * @param void
 * @returns boolean
 */

	isCaseStatusAllSelected(): boolean {
		this.caseStatusTotalRows = this.caseStatusComingData.length;
		const numSelected = this.caseStatusSelection.selected.length;
		const numRows = this.caseStatusTotalRows;
		return numSelected === numRows;
	}

	/**
	 * Invoke isCaseStatusAllSelected method and perform operation its return value
	 * @param void
	 * @returns void
	 */
	CaseStatussmasterToggle(): void {
		this.isCaseStatusAllSelected()
			? this.caseStatusSelection.clear()
			: this.caseStatusComingData
				.slice(0, this.caseStatusTotalRows)
				.forEach((row) => this.caseStatusSelection.select(row));
	}

	/**
	 * Checked search form is empty or not and queryparams set for pagination
	 * @param pageInfo : any
	 * @returns void
	 */
	caseSetPgae(pageInfo: any): void {
		this.caseStatusSelection.clear();
		this.casePage.pageNumber = pageInfo.offset;
		const pageNumber = this.casePage.pageNumber + 1;
		const filters = checkReactiveFormIsEmpty(this.caseSearchForm);
		this.caseStatusQueryParams = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: this.casePage.size,
			page: pageNumber,
			pagination: true,
			order_by: 'name'
		};
		let per_page = this.casePage.size;
		let queryparam = { per_page, page: pageNumber }
		this.addUrlQueryParams({ ...filters, ...queryparam });
		this.dispalyUpdatedCaseStatus({ ...this.caseStatusQueryParams, ...filters });
	}

	/**
	 * Queryparams to make unique URL
	 * @param params
	 * @returns void
	 */
	addUrlQueryParams(params?: FormGroup): void {
		this.location.replaceState(
			this._router.createUrlTree([], { queryParams: params, }).toString()
		);
	}

	/**
 * Dropdown selection how much data user want in listing
 * @params $num: string
 * @returns void
 */
	casePageLimit($num: string): void {
		this.casePage.size = Number($num);
		this.caseStatusSelection.clear();
		this.caseSetPgae({ offset: 0 });
	}

	/**
	 * Used method in setPage and perform GET request to receive data
	 * @param queryParams: any
	 * @returns void
	 */

	dispalyUpdatedCaseStatus(queryParams: any): void {
		this.loadSpin = true;
		this.disableBtn = true;
		this.subscription.push(
			this.requestService
				.sendRequest(
					CaseStatusUrlsEnum.CaseStatus_list_GET,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					removeEmptyKeysFromObject(queryParams),
				)
				.subscribe(
					(comingData: any) => {
						this.disableBtn = false;
						this.loadSpin = false;
						if (comingData['status'] == 200 || comingData['status'] == true) {
							this.caseStatusComingData = comingData.result ? comingData.result.data : [];
							this.casePage.totalElements = comingData.result ? comingData.result.total : 0;
							this.casePage.totalPages = this.casePage.totalElements / this.casePage.size;
						}
					},
					(error) => {
						this.loadSpin = false;
						this.disableBtn = false;
						this.toastrService.error(error.message || 'Something went wrong.', 'Failed');
					},
				),
		);
	}


	/**
	 * Create new payment-type
	 * @param form  FormGroup
	 * @returns void
	 */
	createCaseStatusFormSubmit(form: FormGroup): void {
		if (this.caseStatusform.valid) {
			this.loadSpin = true;
			this.disableBtn = true;
			this.subscription.push(
				this.requestService
					.sendRequest(
						CaseStatusUrlsEnum.CaseStatus_list_POST,
						'POST',
						REQUEST_SERVERS.fd_api_url,
						form,
					)
					.subscribe(
						(response: any) => {
						this.disableBtn = false;

							this.loadSpin = false;
							if (response.status === 200 || response.status == true) {
								this.caseStatusSelection.clear();
								this.caseStatusform.reset();
								this.caseSetPgae({ offset: this.casePage.pageNumber });
								this.modalRef.close();
								this.toastrService.success(response.message, 'Success');
							} else {
								this.loadSpin = false;
								this.toastrService.error(response.message, 'Failed');
							}
						},
						(err) => {
							this.disableBtn = false;
							this.loadSpin = false;
							// const str = parseHttpErrorResponseObject(err.error.message);
							// this.toastrService.error(str);
						},
					),
			);
		
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
		this.disableBtn = false;
		// this.caseStatusform.get('name').disable();
		this.caseStatusform.patchValue({
			id: row.id,
			name: this.caseStatusComingData[rowIndex].name,
			description: this.caseStatusComingData[rowIndex].description,
			comments: this.caseStatusComingData[rowIndex].comments,
		});
	}

	/**
	* Patch heading and save button text
	 * @param void
	 * @returns void
	 */
	patchAddValues(): void {
		this.caseStatusform.reset();
		this.caseStatusform.get('name').enable();
		this.modelSubmit = 'Save & Continue';
		this.modelTitle = 'Add';
		this.disableBtn = false;

	}

	/**
	 * Open Modal and patch values new or updating
	 * @param editableCaseStatusform ModalReference
	 * @param row any (optional)
	 * @param rowIndex: number (optional)
	 * @returns void
	 */
	openCaseStatusModal(editableCaseStatusform, row: any, rowIndex: number) {
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
		this.modalRef = this.modalService.open(editableCaseStatusform, ngbModalOptions);
	}

	/**
	 * Method to Update
	 * @param form FormGroup
	 * @returns void
	 */
	updateCaseStatusFormSubmit(form: FormGroup): void {
		if (this.caseStatusform.valid) {
			this.loadSpin = true;
			this.subscription.push(
				this.requestService
					.sendRequest(
						CaseStatusUrlsEnum.CaseStatus_list_PUT,
						'PUT',
						REQUEST_SERVERS.fd_api_url,
						form,
					)
					.subscribe((response: any) => {
						if (response.status === 200 || response.status == true) {
							this.loadSpin = false;
							this.caseStatusSelection.clear();
							this.caseStatusform.reset();
							this.caseSetPgae({ offset: this.casePage.pageNumber });
							this.toastrService.success(response.message, 'Success');
							this.modalRef.close();
						} else {
							this.loadSpin = false;
							this.toastrService.error(response.message, 'Failed');
						}
					},
					(err) => {
						this.loadSpin = false;
					}),
			);
		
		}
	}

	/**
	 * Send request to server new creating and updating
	 * @param form FormGroup
	 * @returns void
	 */

	onCaseSubmit(form: FormGroup): void {
		if (this.modelTitle == 'Add') {
			this.createCaseStatusFormSubmit(form);
		} else {
			this.updateCaseStatusFormSubmit(form);
		}
	}

	/**
	 * CloseModal and ask user to fill data or not
	 * @param void
	 * @returns void | boolean
	 */
	closeModel(): void | boolean {
		if (this.caseStatusform.dirty && this.caseStatusform.touched) {
			this.CanDeactivateModelComponentService.canDeactivate().then(res => {
				if (res) {
					this.caseStatusform.reset();
					this.modalRef.close();
				} else {
					return true;
				}
			});
		} else {
			this.caseStatusform.reset();
			this.modalRef.close();
		}
	}

	/**
	 * A library method takes an object and converts into string and return
	 * @param obj
	 * @returns string
	 */
	caseStatusstringfy(obj: any): string {
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
		if (isEmptyObject(this.caseSearchForm.value)) {
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
			this.localStorage.setObject('caseStatusBillingTableList' + this.storageData.getUserId(), data);
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
		this.caseStatusListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.caseStatusListTable._internalColumns.sort(function (a, b) {
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

	caseStatusHistoryStats(row) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc body-scroll history-modal',
			modalDialogClass: 'modal-lg'
		};
		let modelRef = this.modalService.open(CreatedHistoryComponent,ngbModalOptions);
		modelRef.componentInstance.createdInformation = [row];
	}

	//   oneCaseStatusRecordDeleted(row) {
	//     this.confirmService.create('Delete Confirmation?', 'Are you sure you want to delete it?').subscribe((ans: ResolveEmit) => {
	//       if (ans.resolved) {
	//     //    this.fdServices.deleteOneCaseStatus(row)
	//   this.requestService
	//   .sendRequest(
	// 	CaseStatusUrlsEnum.CaseStatus_list_DELETE,
	// 	  'DELETE_WITH_BODY',
	// 	  REQUEST_SERVERS.fd_api_url,
	// 	  row.id
	//   )
	//   .subscribe(
	//           response => {
	//             if (response.status === 200) {
	//               this.caseStatusSelection.clear();
	//               this.caseSetPgae({ offset: this.casePage.pageNumber });
	//               this.toastrService.success('Record Deleted Successfully!')
	//             } else {
	//               this.toastrService.error(response.message)
	//             }

	//           }
	//         )
	//       }
	//     })

	//   }

	// temporary disabled used in future
	//   deleteMultipleCaseStatus() {
	//     const selected = this.caseStatusSelection.selected;
	//     const arr: any = [];
	//     for (let p = 0; p < selected.length; p++) {
	//       arr[p] = selected[p].id;
	//     }
	//     console.log('arr', arr)
	//     this.confirmService.create('Delete Confirmation?', 'You want to delete all records?').subscribe(
	//       value => {
	//         if (value.resolved) {
	//           this.fdServices.deleteMultipleCaseStatus(arr)
	//   this.requestService
	//   .sendRequest(
	// 	CaseStatusUrlsEnum.CaseStatus_list_DELETEMultiple,
	// 	  'DELETE_WITH_BODY',
	// 	  REQUEST_SERVERS.fd_api_url,
	// 	  arr
	//   )
	//   .subscribe(
	//             response => {
	//               if (response.status === 200) {
	//                 this.caseSetPgae({ offset: this.casePage.pageNumber });
	//                 this.caseStatusSelection.clear();
	//                 this.toastrService.success('Records Deleted Successfully!')
	//               } else {
	//                 this.toastrService.error(response.message)

	//               }
	//             }
	//           );
	//         }
	//       }
	//     )

	//   }
}
