import { VerificationUrlsEnum } from './../verification-status.enum';
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
import { removeEmptyKeysFromObject, isEmptyObject, checkReactiveFormIsEmpty, isObjectEmpty, makeDeepCopyArray, getIdsFromArray } from '@appDir/shared/utils/utils.helpers';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';

@Component({
	selector: 'verification-status',
	templateUrl: './verification.status.component.html',
	styleUrls: ['./verification.status.component.scss'],
})
export class BillVerifcationStatusComponent extends PermissionComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	isCollapsed:boolean =false;
	denial: boolean = true;
	loadSpin: boolean = false;
	modalRef: NgbModalRef;
	disableBtn: boolean = false;
	modelTitle: string = 'Add';
	modelSubmit: string = 'Save';
	verificationStatusSerarchForm: FormGroup;
	verificationStatusComingData: any[] = []; // denial coming data from backend
	verificationStatusSelection = new SelectionModel<Element>(true, []);
	verificationStatusTotalRows: number;
	verificationStatusform: FormGroup; // edit form
	VerificationStatusPage: Page;
	DenialqueryParams: ParamQuery;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('verificationStatusList') verificationStatusListTable: DatatableComponent;
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
	verfStatusListingTable: any;


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
		private customDiallogService : CustomDiallogService,
		protected storageData: StorageData,
		private localStorage: LocalStorage
	) {
		super(aclService, _router, _route, requestService, titleService);
		this.VerificationStatusPage = new Page();
		this.VerificationStatusPage.pageNumber = 0;
		this.VerificationStatusPage.size = 10;
	}

	ngOnInit() {
		this.setTitle();
		// this.titleService.setTitle(this._route.snapshot.data['title']);
		this.verificationStatusSerarchForm = this.verificationFormSearch();
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.verificationStatusSerarchForm.patchValue(params);
				this.VerificationStatusPage.pageNumber = parseInt(params.page) || 1;
				this.VerificationStatusPage.size = parseInt(params.per_page) || 10;
			}),
		);
		this.verificationStatusSetPage({ offset: this.VerificationStatusPage.pageNumber - 1 || 0 });
		this.verificationStatusform = this.fb.group({
			id: [''],
			name: ['', Validators.required],
			description: [''],
			comments: [''],
		});
		this.verfStatusListingTable = this.localStorage.getObject('verfStatusBillingTableList' + this.storageData.getUserId());
	}

	ngAfterViewInit() {
		if (this.verificationStatusListTable?._internalColumns) {
			this.cols = makeDeepCopyArray([...this.verificationStatusListTable._internalColumns]);
			this.cols.forEach(element => {
				if(this.verfStatusListingTable?.length) {
					let obj = this.verfStatusListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.verfStatusListingTable?.length) {
				const nameToIndexMap = {};
				this.verfStatusListingTable.forEach((item, index) => {
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
	 verificationFormSearch(): FormGroup {
		return this.fb.group({
			name: ['', Validators.required],
			comments: [''],
			description:['']
		});
	}


	/**
	 * Reset filter and GET request to get data from server
	 * @param void
	 * @returns void
	 */
	resetverificationStatus(): void {
		this.verificationStatusSerarchForm = this.verificationFormSearch();
		this.verificationStatusSetPage({ offset: 0 });
		this.verificationStatusform = this.fb.group({
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
	isverificationStatusAllSelected(): boolean {
		this.verificationStatusTotalRows = this.verificationStatusComingData.length;
		const numSelected = this.verificationStatusSelection.selected.length;
		const numRows = this.verificationStatusTotalRows;
		return numSelected === numRows;
	}

	/**
	 * Invoke isAllSelected method and perform operation its return value
	 * @param void
	 * @returns void
	 */

	verifcationStatusmasterToggle(): void {
		this.isverificationStatusAllSelected()
			? this.verificationStatusSelection.clear()
			: this.verificationStatusComingData
				.slice(0, this.verificationStatusTotalRows)
				.forEach((row) => this.verificationStatusSelection.select(row));
	}


	/**
	 * Checked search form is empty or not and queryparams set for pagination
	 * @param pageInfo 
	 * @returns void
	 */
	verificationStatusSetPage(pageInfo: any): void {
		this.VerificationStatusPage.pageNumber = pageInfo.offset;
		const pageNumber = this.VerificationStatusPage.pageNumber + 1;
		this.verificationStatusSelection.clear();
		const filters = checkReactiveFormIsEmpty(this.verificationStatusSerarchForm);
		this.DenialqueryParams = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: this.VerificationStatusPage.size,
			page: pageNumber,
			pagination: true,
			order_by: 'name'
		};
		let per_page = this.VerificationStatusPage.size;
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
	verificationStatusPageLimit($num: string): void {
		this.VerificationStatusPage.size = Number($num);
		this.verificationStatusSelection.clear();
		this.verificationStatusSetPage({ offset: 0 });
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
					VerificationUrlsEnum.Verification_list_Status_GET,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					queryParams,
				)
				.subscribe(
					(comingData: any) => {
						this.loadSpin = false;
						if (comingData['status'] == 200 || comingData['status'] == true) {
							this.verificationStatusComingData = comingData.result ? comingData.result.data : [];
							this.VerificationStatusPage.totalElements = comingData.result ? comingData.result.total : 0;
							this.VerificationStatusPage.totalPages = this.VerificationStatusPage.totalElements / this.VerificationStatusPage.size;
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

	createVerificationStatusSubmit(form: FormGroup): void {
		this.loadSpin = true;
		if (this.verificationStatusform.valid) {
			this.disableBtn = true;
			this.subscription.push(
				this.requestService
					.sendRequest(
						VerificationUrlsEnum.Verification_list_Status_POST,
						'POST',
						REQUEST_SERVERS.fd_api_url,
						removeEmptyKeysFromObject(form),
					)
					.subscribe(
						(response: any) => {
							this.disableBtn = false;
							if (response.status === 200 ||  response.status == true) { 
								this.loadSpin = false;
								this.verificationStatusSelection.clear();
								this.verificationStatusform.reset();
								this.modalRef.close();
								this.verificationStatusSetPage({ offset: this.VerificationStatusPage.pageNumber });
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
		// this.denialform.get('name').disable();
		this.disableBtn = false;
		this.verificationStatusform.patchValue({
			id: row.id,
			name: this.verificationStatusComingData[rowIndex].name,
			description: this.verificationStatusComingData[rowIndex].description,
			comments: this.verificationStatusComingData[rowIndex].comments,
		});
	}

	/**
	 * Patch heading and save button text
	 * @param void
	 * @returns void
	 */
	patchAddValues(): void {
		this.disableBtn = false;
		this.verificationStatusform.reset();
		this.verificationStatusform.get('name').enable();
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

	openVerificaitionStatusModal(denialModel, row?: any, rowIndex?: number): void {
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
	onSaveVerificationStatusSubmit(form: FormGroup): void {
		if (this.modelTitle == 'Add') {
			this.createVerificationStatusSubmit(form);
		} else {
			this.updateVerificationSubmit(form);
		}
	}

	/**
	 * Update denial
	 * @param form: FormGroup
	 * @returns void
	 */
	updateVerificationSubmit(form: FormGroup): void {
		this.loadSpin = false;
		if (this.verificationStatusform.valid) {
			this.disableBtn = true;
			this.subscription.push(
				this.requestService
					.sendRequest(
						VerificationUrlsEnum.Verification_list_Status_PUT,
						'PUT',
						REQUEST_SERVERS.fd_api_url,
						form,
					)
					.subscribe(
						(response: any) => {
							this.disableBtn = false;
							if (response.status === 200 || response.status == true) {
								this.loadSpin = false;
								this.verificationStatusSelection.clear();
								this.modalRef.close();
								this.verificationStatusform.reset();
								this.verificationStatusSetPage({ offset: this.VerificationStatusPage.pageNumber });
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
		if (this.verificationStatusform.dirty && this.verificationStatusform.touched) {
			this.CanDeactivateService.canDeactivate().then(res => {
				if (res) {
					this.verificationStatusform.reset();
					this.modalRef.close();
				} else {
					return true;
				}
			});
		} else {
			this.verificationStatusform.reset();
			this.modalRef.close();
		}
	}

	checkInputs(){
			if (isEmptyObject(this.verificationStatusSerarchForm.value)) {
				return true;
			  }
			  return false;
		}

		
		onDeleteVerification(row) {
			let param = {
				ids: [row.id],
			};
			let option ={overlay:false};
			this.customDiallogService.confirm('Delete Verification Status', 'Do you really want to delete this Verification Status?','Yes','No')
			.then((confirmed) => {
				
				if (confirmed){
					this.subscription.push(
						this.requestService
							.sendRequest(
								VerificationUrlsEnum.VerificationStatus_Delete,
								'delete_with_body',
								REQUEST_SERVERS.fd_api_url,
								param,
							)
							.subscribe(
								(res: any) => {
									this.VerificationStatusPage.pageNumber = 0;
									if (res.status) {
										this.verificationStatusSetPage({ offset: 0 });
										this.toastrService.success(res.message, 'Success');
									}
								},
								(error) => {
									// this.toastrService.error(error.error.message, 'Error');
								},
							),
					);	
				}
			})
			.catch();
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
				this.localStorage.setObject('verfStatusBillingTableList' + this.storageData.getUserId(), data);
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
			this.verificationStatusListTable._internalColumns = columnsBody.filter(c => {
				return c.checked == true;
			});
			let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
			this.verificationStatusListTable._internalColumns.sort(function (a, b) {
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

		verificationStatusHistoryStats(row) {
			const ngbModalOptions: NgbModalOptions = {
				backdrop: 'static',
				keyboard: false,
				windowClass: 'modal_extraDOc body-scroll history-modal',
				modalDialogClass: 'modal-lg'
			};
			let modelRef = this.modalService.open(CreatedHistoryComponent,ngbModalOptions);
			modelRef.componentInstance.createdInformation = [row];
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
