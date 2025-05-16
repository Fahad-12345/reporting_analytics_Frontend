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
import { PlaceOfServiceUrlsEnum } from '../PlaceOfService-Urls-Enum';
import { Router, ActivatedRoute } from '@angular/router';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { Location, LocationStrategy } from '@angular/common';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { Title } from '@angular/platform-browser';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { removeEmptyKeysFromObject, isEmptyObject, checkReactiveFormIsEmpty, isObjectEmpty, makeDeepCopyArray, getIdsFromArray  } from '@appDir/shared/utils/utils.helpers';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
@Component({
	selector: 'app-place-of-service',
	templateUrl: './place-of-service.component.html',
	styleUrls: ['./place-of-service.component.scss'],
})
export class PlaceOfServiceComponent extends PermissionComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	place: boolean = true;
	loadSpin: boolean = false;
	modalRef: NgbModalRef;
	disableBtn: boolean = false;
	modelTitle: string = 'Add';
	modelSubmit: string = 'Save';
	placeSearchForm: FormGroup;
	placeComingData: any[] = []; // place coming data from backend
	placeSelection = new SelectionModel<Element>(true, []);
	placetotalRows: number;
	// createPlaceform: FormGroup; // create form for place of services
	placeForm: FormGroup; // edit form for place of services
	placePage: Page;
	placeQueryParams: ParamQuery;
	errorMessage: string;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('placeOfServiceList') placeOfServiceListTable: DatatableComponent;
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
	placeOfServiceListingTable: any;

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
		private locationStratgy: LocationStrategy,
		private CanDeactivateModelComponentService: CanDeactivateModelComponentService,
		protected storageData: StorageData,
		private localStorage: LocalStorage
	) {
		super(aclService, router, _route, requestService, titleService);
		this.placePage = new Page();
		this.placePage.pageNumber = 0;
		this.placePage.size = 10;
	}

	ngOnInit() {
		this.setTitle();
		this.placeSearchForm = this.initializePlaceForm();
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.placeSearchForm.patchValue(params);
				this.placePage.pageNumber = parseInt(params.page) || 1;
				this.placePage.size = parseInt(params.per_page) || 10;
			}),
		);
		this.placeSetpage({ offset: this.placePage.pageNumber - 1 || 0 });

		this.placeForm = this.fb.group({
			id: [''],
			code: ['', Validators.required],
			name: ['', Validators.required],
			description: [''],
			comments: [''],
		});
		this.placeOfServiceListingTable = this.localStorage.getObject('placeOfServiceBillingTableList' + this.storageData.getUserId());
	}

	ngAfterViewInit() {
		if (this.placeOfServiceListTable?._internalColumns) {
			this.cols = makeDeepCopyArray([...this.placeOfServiceListTable._internalColumns]);
			this.cols.forEach(element => {
				if(this.placeOfServiceListingTable?.length) {
					let obj = this.placeOfServiceListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.placeOfServiceListingTable?.length) {
				const nameToIndexMap = {};
				this.placeOfServiceListingTable.forEach((item, index) => {
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
 * Initialize 'Place of service' search form
 * @param void
 * @returns FormGroup
 */
	initializePlaceForm(): FormGroup {
		return this.fb.group({
			code: [''],
			name: [''],
			description: [''],
			comments: ['']
		});
	}


	/**
	 * Reset filters
	 * @param void
	 * @returns void
	 */

	resetPlace(): void {
		this.placeSearchForm = this.initializePlaceForm();
		this.placeSetpage({ offset: 0 });
		this.placeForm = this.fb.group({
			id: [''],
			code: ['', Validators.required],
			name: ['', Validators.required],
			description: [''],
			comments: [''],
		});
	}

	/**
 * Compare checkbox selection and length of data coming from server and return boolean
 * @param void
 * @returns boolean
 */

	isPlaceAllSelected(): boolean {
		this.placetotalRows = this.placeComingData.length;
		const numSelected = this.placeSelection.selected.length;
		const numRows = this.placetotalRows;
		return numSelected === numRows;
	}

	/**
	 * Invoke isPlaceAllSelected method and perform operation its return value
	 * @param void
	 * @returns void
	 */
	PlacemasterToggle() {
		this.isPlaceAllSelected()
			? this.placeSelection.clear()
			: this.placeComingData
				.slice(0, this.placetotalRows)
				.forEach((row) => this.placeSelection.select(row));
	}

	/**
	 * Checked search form is empty or not and set queryparams for pagination
	 * @param pageInfo : any
	 * @returns void
	 */

	placeSetpage(pageInfo: any): void {
		this.placeSelection.clear();
		this.placePage.pageNumber = pageInfo.offset;
		const pageNumber = this.placePage.pageNumber + 1;

		const filters = checkReactiveFormIsEmpty(this.placeSearchForm);
		this.placeQueryParams = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: this.placePage.size,
			page: pageNumber,
			pagination: true,
			order_by: 'name'
		};
		let per_page = this.placePage.size;
		let queryparam = { per_page, page: pageNumber }
		this.addUrlQueryParams({ ...filters, ...queryparam });
		this.displayUpdatedPlace({ ...this.placeQueryParams, ...filters });
	}


	/**
	 * Queryparams to make unique URL
	 * @param params
	 * @returns void
	 */
	addUrlQueryParams(params?: FormGroup) {
		this.location.replaceState(
			this.router.createUrlTree([], { queryParams: params, }).toString()
		);
	}

	/**
		 * Dropdown selection how much data user want in listing
		 * @params $num: string
		 * @returns void
		 */
	placePageLimit($num: string): void {
		this.placePage.size = Number($num);
		this.placeSelection.clear();
		this.placeSetpage({ offset: 0 });
	}

	/**
	 * Used method in placeSetpage and perform GET request to receive data
	 * @param queryParams: any
	 * @returns void
	 */

	displayUpdatedPlace(queryParams: any): void {
		this.loadSpin = true;
		this.subscription.push(
			this.requestService
				.sendRequest(
					PlaceOfServiceUrlsEnum.Place_list_GET,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					removeEmptyKeysFromObject(queryParams),
				)
				.subscribe(
					(comingData: any) => {
						if (comingData['status'] == 200 || comingData['status'] == true) {
							this.loadSpin = false;
							this.placeComingData = comingData.result ? comingData.result.data : [];
							this.placePage.totalElements = comingData.result ? comingData.result.total : 0;
							this.placePage.totalPages = this.placePage.totalElements / this.placePage.size;
						}
					},

					(error) => {
						this.loadSpin = false;
						this.errorMessage = error;
					},
				),
		);
	}

	/**
	 * Create new place of service
	 * @param form  FormGroup
	 * @returns void
	 */
	createPlaceSubmit(form: FormGroup) {
		if (this.placeForm.valid) {
			this.loadSpin = true;
			this.subscription.push(
				this.requestService
					.sendRequest(
						PlaceOfServiceUrlsEnum.Place_list_POST,
						'POST',
						REQUEST_SERVERS.fd_api_url,
						form,
					)
					.subscribe(
						(response: any) => {
							if (response.status === 200 || response.status === true) {
								this.loadSpin = false;
								this.placeSelection.clear();
								this.placeForm.reset();
								this.modalRef.close();
								this.placeSetpage({ offset: this.placePage.pageNumber });
								this.toastrService.success('Successfully added', 'Success');
							} else {
								this.loadSpin = false;
								this.toastrService.error(response.message, 'Failed');
							}
						},
						(err) => {
							this.loadSpin = false;
						}
					)
			);
		}
	}


	/**
	 * CloseModal and ask user to fill data or not
	 * @param void
	 * @returns void | boolean
	 */
	closeModel() {
		if (this.placeForm.dirty && this.placeForm.touched) {
			this.CanDeactivateModelComponentService.canDeactivate().then(res => {
				if (res) {
					this.placeForm.reset();
					this.modalRef.close();
				} else {
					return true;
				}
			});
		} else {
			this.placeForm.reset();
			this.modalRef.close();
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
		// this.placeForm.get('code').disable();
		this.placeForm.patchValue({
			id: row.id,
			code: this.placeComingData[rowIndex].code,
			name: this.placeComingData[rowIndex].name,
			description: this.placeComingData[rowIndex].description,
			comments: this.placeComingData[rowIndex].comments,
		});
	}

	/**
	* Patch heading and save button text
	 * @param void
	 * @returns void
	 */
	patchAddValues(): void {
		this.placeForm.reset();
		this.placeForm.get('code').enable();
		this.modelSubmit = 'Save & Continue';
		this.modelTitle = 'Add';
	}

	/**
	 * Open Modal and patch values new or updating
	 * @param placemodle ModalReference
	 * @param row any (optional)
	 * @param rowIndex: number (optional)
	 * @returns void
	 */
	openPlaceOfSercesModal(placemodle, row?: any, rowIndex?: number): void {
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

		this.modalRef = this.modalService.open(placemodle, ngbModalOptions);
	}

	/**
	 * Invoked method on updation
	 * @param form FormGroup
	 * @returns void
	 */

	updatePlaceSubmit(form: FormGroup): void {
		if (this.placeForm.valid) {
			this.loadSpin = true;
			this.subscription.push(
				this.requestService
					.sendRequest(
						PlaceOfServiceUrlsEnum.Place_list_PUT,
						'PUT',
						REQUEST_SERVERS.fd_api_url,
						form,
					)
					.subscribe(
						(response: any) => {
							if (response.status === 200 || response.status === true) {
								this.loadSpin = false;
								this.placeSelection.clear();
								this.modalRef.close();
								this.placeForm.reset();
								this.placeSetpage({ offset: this.placePage.pageNumber });
								this.toastrService.success('Successfully updated', 'Success');
							} else {
								this.loadSpin = false;
								this.toastrService.error(response?.message, 'Failed');
							}
						},
						(err) => {
							this.loadSpin = false;
						},
					),
			);
		}
	}

	/**
 * Send request to server new creating and updating
 * @param form FormGroup
 * @returns void
 */

	onPlaceSubmit(form: FormGroup): void {
		if (this.modelTitle == 'Add') {
			this.createPlaceSubmit(form);
		} else {
			this.updatePlaceSubmit(form);
		}
	}

	/**
	 * A library method takes an object and converts into string and return
	 * @param obj
	 * @returns string
	 */

	Placestringfy(obj: any): string {
		return JSON.stringify(obj);
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
		if (isEmptyObject(this.placeSearchForm.value)) {
			return true;
		  }
		  return false;
	}

	posHistoryStats(row) {
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
			this.localStorage.setObject('placeOfServiceBillingTableList' + this.storageData.getUserId(), data);
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
		this.placeOfServiceListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.placeOfServiceListTable._internalColumns.sort(function (a, b) {
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


	//   onePlaceRecordDeleted(row) {
	//     this.confirmService.create('Delete Confirmation?', 'Are you sure you want to delete it?').subscribe((ans: ResolveEmit) => {
	//       if (ans.resolved) {
	//       //  this.fdServices.deleteOnePlaceOfService(row)
	//  this.requestService.sendRequest(
	// 	PlaceOfServiceUrlsEnum.Place_list_DELETE,
	// 		'DELETE_WITH_BODY',
	// 		REQUEST_SERVERS.fd_api_url,
	// 		row.id
	// 	)
	//   .subscribe(
	//           response => {
	//             if (response.status === 200) {
	//               this.placeSelection.clear();
	//               this.placeSetpage({ offset: this.placePage.pageNumber })
	//               this.toastrService.success('Record Deleted Successfully')
	//             } else {
	//               this.toastrService.error(response.message)
	//             }
	//           }
	//         )
	//       }
	//     })

	//   }

	//   deleteMultiplePlaceRecord() {
	//     const selected = this.placeSelection.selected;
	//     const arr: any = [];
	//     for (let p = 0; p < selected.length; p++) {
	//       arr[p] = selected[p].id;
	//     }
	//     console.log('arr', arr)
	//     this.confirmService.create('Delete Confirmation?', 'You want to delete all records?').subscribe(
	//       value => {
	//         if (value.resolved) {
	//        //   this.fdServices.deleteMultiplePlaceOfService(arr)
	//   this.requestService.sendRequest(
	// 	PlaceOfServiceUrlsEnum.Place_list_DELETEMultiple,
	// 		'DELETE_WITH_BODY',
	// 		REQUEST_SERVERS.fd_api_url,
	// 		arr
	// 	)
	//   .subscribe(
	//             response => {
	//               if (response.status === 200) {
	//                 this.placeSetpage({ offset: this.placePage.pageNumber })
	//                 this.placeSelection.clear();
	//               }
	//             }
	//           );
	//         }
	//       }
	//     )

	//   }
}
