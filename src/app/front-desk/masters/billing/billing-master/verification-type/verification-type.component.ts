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
import { VerificationTypeUrlsEnum } from '../VerificationType-Urls-Enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Location } from '@angular/common'
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { removeEmptyKeysFromObject, isEmptyObject, checkReactiveFormIsEmpty, isObjectEmpty, makeDeepCopyArray, getIdsFromArray  } from '@appDir/shared/utils/utils.helpers';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
@Component({
	selector: 'app-verification-type',
	templateUrl: './verification-type.component.html',
	styleUrls: ['./verification-type.component.scss'],
})
export class VerificationTypeComponent extends PermissionComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	loadSpin: boolean = false;
	modalRef: NgbModalRef;
	modelTitle: string = 'Add';
	modelSubmit: string = 'Save';
	verificationSearchForm: FormGroup;
	verificationTypeComingData: any[] = []; // verfication type coming data getting
	verificationSelection = new SelectionModel<Element>(true, []);
	verificationTotalRows: number;
	verificationform: FormGroup;
	verificationPage: Page;
	VerificationqueryParams: ParamQuery;
	isCollapsed: boolean = false;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('verificationTypeList') verificationTypeListTable: DatatableComponent;
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
	verificationTypeListingTable: any;

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
		private CanDeactivateService: CanDeactivateModelComponentService,
		protected storageData: StorageData,
		private localStorage: LocalStorage
	) {
		super(aclService, router, _route, requestService, titleService);
		this.verificationPage = new Page();
		this.verificationPage.pageNumber = 0;
		this.verificationPage.size = 10;
	}

	ngOnInit() {
		this.setTitle();
		// this.titleService.setTitle(this._route.snapshot.data['title']);
		this.verificationSearchForm = this.verifiacationsearch();
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.verificationSearchForm.patchValue(params);
				this.verificationPage.pageNumber = parseInt(params.page) || 1;
				this.verificationPage.size = parseInt(params.per_page) || 10;
			}),
		);
		this.VerificationsetPage({ offset: this.verificationPage.pageNumber - 1 || 0 });
		this.verificationform = this.fb.group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		this.verificationTypeListingTable = this.localStorage.getObject('verificationTypeBillingTableList' + this.storageData.getUserId());
	}

	ngAfterViewInit() {
		if (this.verificationTypeListTable?._internalColumns) {
			this.cols = makeDeepCopyArray([...this.verificationTypeListTable._internalColumns]);
			this.cols.forEach(element => {
				if(this.verificationTypeListingTable?.length) {
					let obj = this.verificationTypeListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.verificationTypeListingTable?.length) {
				const nameToIndexMap = {};
				this.verificationTypeListingTable.forEach((item, index) => {
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
	 * Initialize search form
	 * @param void
	 * @returns FormGroup
	 */
	verifiacationsearch(): FormGroup {
		return this.fb.group({
			name: [''],
			comments: [''],
			description: ['']
		});
	}

	/**
	 * Reset filter form and GET data from backend
	 * @param void
	 * @returns void
	 */
	resetVerification(): void {
		this.verificationSearchForm = this.verifiacationsearch();
		this.VerificationsetPage({ offset: 0 });
	}

	/**
	 * Compare checkbox selection and length of data coming from server and return boolean
	 * @param void
	 * @returns boolean
	 */

	isverificationAllSelected(): boolean {
		this.verificationTotalRows = this.verificationTypeComingData.length;
		const numSelected = this.verificationSelection.selected.length;
		const numRows = this.verificationTotalRows;
		return numSelected === numRows;
	}

	/**
	 * Invoke isAllSelected method and perform operation its return value
	 * @param void
	 * @returns void
	 */
	verificationmasterToggle(): void {
		this.isverificationAllSelected()
			? this.verificationSelection.clear()
			: this.verificationTypeComingData
				.slice(0, this.verificationTotalRows)
				.forEach((row) => this.verificationSelection.select(row));
	}

	/**
	 * Dropdown selection how much data user want in listing
	 * @params string
	 * @returns void
	 */
	verificationPageLimit($num: string): void {
		this.verificationPage.size = Number($num);
		this.VerificationsetPage({ offset: 0 });
	}

	/**
	 * Checked search form is empty or not and queryparams set for pagination
	 * @param pageInfo any
	 * @returns void
	 */
	VerificationsetPage(pageInfo: any): void {
		this.verificationPage.pageNumber = pageInfo.offset;
		const pageNumber = this.verificationPage.pageNumber + 1;
		const filters = checkReactiveFormIsEmpty(this.verificationSearchForm);
		this.VerificationqueryParams = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: this.verificationPage.size,
			page: pageNumber,
			pagination: true,
			order_by: 'name'
		};
		let per_page = this.verificationPage.size;
		let queryparam = { per_page, page: pageNumber }
		this.addUrlQueryParams({ ...filters, ...queryparam });
		this.displayUpdatedGetVerification({ ...this.VerificationqueryParams, ...filters });
	}

	/**
	 * Queryparams to make unique URL
	 * @param params : FormGroup
	 * @returns void
	 */
	addUrlQueryParams(params?: FormGroup): void {
		this.location.replaceState(
			this.router.createUrlTree([], { queryParams: params, }).toString()
		);
	}

	/**
	 * Invoked in VerificationsetPage and send GET request to get data from server
	 * @param queryParams
	 * @returns void
	 */
	displayUpdatedGetVerification(queryParams: any): void {
		this.loadSpin = true;
		this.verificationSelection.clear();
		this.subscription.push(
			this.requestService
				.sendRequest(
					VerificationTypeUrlsEnum.VerificationType_list_GET,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					removeEmptyKeysFromObject(queryParams),
				)
				.subscribe(
					(resp: any) => {
						if (resp['status'] == 200 || resp['status'] == true) {
							this.loadSpin = false;
							this.verificationTypeComingData = resp.result ? resp.result.data : [];
							this.verificationPage.totalElements = resp.result ? resp.result.total : 0;
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
	 * Invoked and send request to server to create new verification-type
	 * @param form: FormGroup
	 * @returns void
	 */
	createVerificationFormSubmit(form: FormGroup): void {
		if (this.verificationform.valid) {
			this.loadSpin = true;
			this.subscription.push(
				this.requestService
					.sendRequest(
						VerificationTypeUrlsEnum.VerificationType_list_POST,
						'POST',
						REQUEST_SERVERS.fd_api_url,
						form,
					)
					.subscribe(
						(resp) => {
							if (resp['status'] == 200 || resp['status'] == true) {
								this.loadSpin = false;
								this.verificationform.reset();
								this.verificationSelection.clear();
			this.modalRef.close();
								this.VerificationsetPage({ offset: this.verificationPage.pageNumber });
								this.toastrService.success('Successfully added', 'Success');
							}
						},
						(err) => {
							this.loadSpin = false;
							// const str = parseHttpErrorResponseObject(err.error.message);
							// this.toastrService.error(str);
						},
					),
			);
			// this.loadSpin = false;
			
		}
	}

	/**
	 * Invoked and patch heading and update button text
	 * @param row 
	 * @param rowIndex 
	 * @returns void
	 */
	patchEditValues(row: any, rowIndex: number): void {
		// this.verificationform.get('name').disable();
		this.modelSubmit = 'Update';
		this.modelTitle = 'Edit';
		this.verificationform.patchValue({
			id: row.id,
			name: this.verificationTypeComingData[rowIndex].name,
			description: this.verificationTypeComingData[rowIndex].description,
			comments: this.verificationTypeComingData[rowIndex].comments,
		});
	}

	/**
	 * Invoked and patch heading and save button text
	 * @param void
	 * @returns void
	 */

	patchAddValues(): void {
		this.verificationform.reset();
		this.verificationform.get('name').enable();
		this.modelSubmit = 'Save & Continue';
		this.modelTitle = 'Add';
	}

	/**
	* Open Modal and patch values new or updating
	 * @param verificationform : formReference
	 * @param row : any
	 * @param rowIndex : number
	 * @returns void
	 */

	verificationOpenModal(verificationform, row?: any, rowIndex?: number): void {
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
		this.modalRef = this.modalService.open(verificationform, ngbModalOptions);
	}

	/**
	 * Invoked method on updation
	 * @param form FormGroup
	 * @returns void
	 */

	onEditVerificationTypeSubmit(form: FormGroup): void {
		this.loadSpin = true;
		form['comments'] = this.verificationform.controls.comments.value;
		form['description'] = this.verificationform.controls.description.value;
		this.subscription.push(
			this.requestService
				.sendRequest(
					VerificationTypeUrlsEnum.VerificationType_list_PUT,
					'PUT',
					REQUEST_SERVERS.fd_api_url,
					form,
				)
				.subscribe(
					(resp) => {
						this.loadSpin = false;
						this.verificationSelection.clear();
						this.verificationform.reset();
						this.modalRef.close();
						this.VerificationsetPage({ offset: this.verificationPage.pageNumber });
						this.toastrService.success('Successfully updated', 'Success');
					},
					(err) => {
						this.loadSpin = false;
						// const str = parseHttpErrorResponseObject(err.error.message);
						// this.toastrService.error(str);
					},
				),
		);
		// this.loadSpin = false;
	}

	/**
	 * @param form FormGroup
	 * @returns void
	 */
	onVerificationTypeSubmit(form: FormGroup): void {
		if (this.modelTitle == 'Add') {
			this.createVerificationFormSubmit(removeEmptyKeysFromObject(form));
		} else {
			this.onEditVerificationTypeSubmit(removeEmptyKeysFromObject(form));
		}
	}

	/**
	 * CloseModal and ask user to fill data or not
	 * @param void
	 * @returns void | boolean
	 */
	closeModel(): void | boolean {
		if (this.verificationform.dirty && this.verificationform.touched) {
			this.CanDeactivateService.canDeactivate().then(res => {
				if (res) {
					this.verificationform.reset();
					this.modalRef.close();
				} else {
					return true;
				}
			});
		} else {
			this.verificationform.reset();
			this.modalRef.close();
		}

	}


	/**
 * A library method takes an object and converts into string and return
 * @param obj
 * @returns string
 */
	Verificationstringfy(obj: any): string {
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
		if (isEmptyObject(this.verificationSearchForm.value)) {
			return true;
		  }
		  return false;
	}

	verificationHistoryStats(row) {
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
			this.localStorage.setObject('verificationTypeBillingTableList' + this.storageData.getUserId(), data);
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
		this.verificationTypeListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.verificationTypeListTable._internalColumns.sort(function (a, b) {
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
	//   deleteVerificationTypeOneRow(row) {
	//     this.confirmService.create('Delete Confirmation?', 'Are you sure you want to delete it?').subscribe((ans: ResolveEmit) => {
	//       if (ans.resolved) {
	//    //     this.fdServices.deleteOneverificationTypeRecord(row)
	//    this.requestService.sendRequest(
	// 	VerificationTypeUrlsEnum.VerificationType_list_DELETE,
	// 		'DELETE_WITH_BODY',
	// 		REQUEST_SERVERS.fd_api_url,
	// 		row.id
	// 	)
	//   .subscribe(
	//           response => {
	//             if (response.status === 200) {
	//               this.verificationSelection.clear();
	//               this.VerificationsetPage({ offset: this.verificationPage.pageNumber });
	//               this.toastrService.success('Data Deleted successfully', 'Success');
	//             }
	//           }
	//         )
	//       }
	//     })

	//   }

	// temporary disabled used in future
	//   deleteMultipleVerificationType() {
	//     const selected = this.verificationSelection.selected;
	//     const arr: any = [];
	//     for (let p = 0; p < selected.length; p++) {
	//       arr[p] = selected[p].id;
	//     }
	//     this.confirmService.create('Delete Confirmation?', 'You want to delete all records?').subscribe(
	//       value => {
	//         if (value.resolved) {
	//       //    this.fdServices.deleteMultipleVerificationTypeRecord(arr)

	//   this.requestService.sendRequest(
	// 		VerificationTypeUrlsEnum.VerificationType_list_DELETEMultiple,
	// 			'DELETE_WITH_BODY',
	// 			REQUEST_SERVERS.fd_api_url,
	// 			arr
	// 		)
	//   .subscribe(
	//             response => {
	//               if (response.status === 200) {
	//                 this.toastrService.success('Data Deleted successfully', 'Success');
	//                 this.VerificationsetPage({ offset: this.verificationPage.pageNumber });
	//                 this.verificationSelection.clear();
	//               }
	//             }
	//           );
	//         }
	//       }
	//     )

	//   }
}
