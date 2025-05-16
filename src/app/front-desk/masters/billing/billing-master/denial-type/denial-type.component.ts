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
import { DenialUrlsEnum } from '../Denial-Urls-Enum';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Location } from '@angular/common'
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { removeEmptyKeysFromObject, isEmptyObject, checkReactiveFormIsEmpty, isObjectEmpty, makeDeepCopyArray, getIdsFromArray } from '@appDir/shared/utils/utils.helpers';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';

@Component({
	selector: 'app-denial-type',
	templateUrl: './denial-type.component.html',
	styleUrls: ['./denial-type.component.scss'],
})
export class DenialTypeComponent extends PermissionComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	denial: boolean = true;
	loadSpin: boolean = false;
	modalRef: NgbModalRef;
	disableBtn: boolean = false;
	modelTitle: string = 'Add';
	modelSubmit: string = 'Save';
	denialSerarchForm: FormGroup;
	denialComingData: any[] = []; // denial coming data from backend
	denialSelection = new SelectionModel<Element>(true, []);
	denialTotalRows: number;
	denialform: FormGroup; // edit form
	denialPage: Page;
	DenialqueryParams: ParamQuery;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('denialTypeList') denialTypeListTable: DatatableComponent;
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
	denialTypeListingTable: any;


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
		this.denialPage = new Page();
		this.denialPage.pageNumber = 0;
		this.denialPage.size = 10;
	}

	ngOnInit() {
		this.setTitle();
		// this.titleService.setTitle(this._route.snapshot.data['title']);
		this.denialSerarchForm = this.denialFormSearch();
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.denialSerarchForm.patchValue(params);
				this.denialPage.pageNumber = parseInt(params.page) || 1;
				this.denialPage.size = parseInt(params.per_page) || 10;
			}),
		);
		this.denialSetPage({ offset: this.denialPage.pageNumber - 1 || 0 });
		this.denialform = this.fb.group({
			id: [''],
			name: ['', Validators.required],
			description: [''],
			comments: [''],
		});
		this.denialTypeListingTable = this.localStorage.getObject('denialTypeBillingTableList' + this.storageData.getUserId());
	}

	ngAfterViewInit() {
		if (this.denialTypeListTable?._internalColumns) {
			this.cols = makeDeepCopyArray([...this.denialTypeListTable._internalColumns]);
			this.cols.forEach(element => {
				if(this.denialTypeListingTable?.length) {
					let obj = this.denialTypeListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.denialTypeListingTable?.length) {
				const nameToIndexMap = {};
				this.denialTypeListingTable.forEach((item, index) => {
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
	denialFormSearch(): FormGroup {
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
		this.denialSerarchForm = this.denialFormSearch();
		this.denialSetPage({ offset: 0 });
		this.denialform = this.fb.group({
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
		this.denialTotalRows = this.denialComingData.length;
		const numSelected = this.denialSelection.selected.length;
		const numRows = this.denialTotalRows;
		return numSelected === numRows;
	}

	/**
	 * Invoke isAllSelected method and perform operation its return value
	 * @param void
	 * @returns void
	 */

	denialmasterToggle(): void {
		this.isDenialAllSelected()
			? this.denialSelection.clear()
			: this.denialComingData
				.slice(0, this.denialTotalRows)
				.forEach((row) => this.denialSelection.select(row));
	}


	/**
	 * Checked search form is empty or not and queryparams set for pagination
	 * @param pageInfo 
	 * @returns void
	 */
	denialSetPage(pageInfo: any): void {
		this.denialPage.pageNumber = pageInfo.offset;
		const pageNumber = this.denialPage.pageNumber + 1;
		this.denialSelection.clear();
		const filters = checkReactiveFormIsEmpty(this.denialSerarchForm);
		this.DenialqueryParams = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: this.denialPage.size,
			page: pageNumber,
			pagination: true,
			order_by: 'name'
		};
		let per_page = this.denialPage.size;
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
	denialPageLimit($num: string): void {
		this.denialPage.size = Number($num);
		this.denialSelection.clear();
		this.denialSetPage({ offset: 0 });
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
					DenialUrlsEnum.Denial_list_GET,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					queryParams,
				)
				.subscribe(
					(comingData: any) => {
						this.loadSpin = false;
						if (comingData['status'] == 200 || comingData['status'] == true) {
							this.denialComingData = comingData.result ? comingData.result.data : [];
							this.denialPage.totalElements = comingData.result ? comingData.result.total : 0;
							this.denialPage.totalPages = this.denialPage.totalElements / this.denialPage.size;
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

	creatDeniatSubmit(form: FormGroup): void {
		if (this.denialform.valid) {
			this.loadSpin = true;
			this.subscription.push(
				this.requestService
					.sendRequest(
						DenialUrlsEnum.Denial_list_POST,
						'POST',
						REQUEST_SERVERS.fd_api_url,
						removeEmptyKeysFromObject(form),
					)
					.subscribe(
						(response: any) => {
							if (response.status === 200 ||  response.status == true) { 
								this.loadSpin = false;
								this.denialSelection.clear();
								this.denialform.reset();
								this.modalRef.close();
								this.denialSetPage({ offset: this.denialPage.pageNumber });
								this.toastrService.success('Successfully added', 'Success');
							}
						},
						(err) => {
							this.loadSpin = false;
							// this.toastrService.error(error.message || 'Something went wrong.', 'Error');
							// const str = parseHttpErrorResponseObject(err.error.message);
							// this.toastrService.error(str);
						},
					),
			);
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
		// this.denialform.get('name').disable();

		this.denialform.patchValue({
			id: row.id,
			name: this.denialComingData[rowIndex].name,
			description: this.denialComingData[rowIndex].description,
			comments: this.denialComingData[rowIndex].comments,
		});
	}

	/**
	 * Patch heading and save button text
	 * @param void
	 * @returns void
	 */
	patchAddValues(): void {
		this.denialform.reset();
		this.denialform.get('name').enable();
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

	openDenialModal(denialModel, row?: any, rowIndex?: number): void {
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
	onSaveDeniatSubmit(form: FormGroup): void {
		if (this.modelTitle == 'Add') {
			this.creatDeniatSubmit(form);
		} else {
			this.updateDeniatSubmit(form);
		}
	}

	/**
	 * Update denial
	 * @param form: FormGroup
	 * @returns void
	 */
	updateDeniatSubmit(form: FormGroup): void {
		if (this.denialform.valid) {
			this.loadSpin = true;
			this.subscription.push(
				this.requestService
					.sendRequest(
						DenialUrlsEnum.Denial_list_PUT,
						'PUT',
						REQUEST_SERVERS.fd_api_url,
						form,
					)
					.subscribe(
						(response: any) => {
							if (response.status === 200 || response.status == true) {
								this.loadSpin = false;
								this.denialSelection.clear();
								this.modalRef.close();
								this.denialform.reset();
								this.denialSetPage({ offset: this.denialPage.pageNumber });
								this.toastrService.success('Successfully updated', 'Success');
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
		if (this.denialform.dirty && this.denialform.touched) {
			this.CanDeactivateService.canDeactivate().then(res => {
				if (res) {
					this.denialform.reset();
					this.modalRef.close();
				} else {
					return true;
				}
			});
		} else {
			this.denialform.reset();
			this.modalRef.close();
		}
	}

	checkInputs(){
			if (isEmptyObject(this.denialSerarchForm.value)) {
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
	denialTypeHistoryStats(row) {
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
			this.localStorage.setObject('denialTypeBillingTableList' + this.storageData.getUserId(), data);
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
		this.denialTypeListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.denialTypeListTable._internalColumns.sort(function (a, b) {
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
