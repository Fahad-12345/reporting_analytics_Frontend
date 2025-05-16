import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModalRef, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Page } from '@appDir/front-desk/models/page';
import { ToastrService } from 'ngx-toastr';
import { AclService } from '@appDir/shared/services/acl.service';
import { HttpService } from '@appDir/front-desk/fd_shared/services/http.service';
import { Subscription } from 'rxjs';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { Location } from '@angular/common';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RegionUrlsEnum } from '../Region-Urls-Enum';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { removeEmptyKeysFromObject, isEmptyObject, touchAllFields, checkReactiveFormIsEmpty, isObjectEmpty, unSubAllPrevious, makeDeepCopyArray, getIdsFromArray  } from '@appDir/shared/utils/utils.helpers';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
@Component({
	selector: 'app-region',
	templateUrl: './region.component.html',
	styleUrls: ['./region.component.scss'],
})

export class RegionComponent extends PermissionComponent implements OnInit, OnDestroy {

	subscription: Subscription[] = [];
	region: boolean = true;
	loadSpin: boolean = false;
	modalRef: NgbModalRef;
	disableBtn: boolean = false;
	modelTitle: string = 'Add';
	modelSubmit: string = 'Save';
	regionSearchForm: FormGroup;
	regioncomingData: any[] = []; // region coming data from backend
	regionSelection = new SelectionModel<Element>(true, []);
	regionTotalRows: number;
	regionForm: FormGroup; // edit form for region
	regionPage: Page;
	regionQueryParams: ParamQuery;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('regionList') regionListTable: DatatableComponent;
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
	regionListingTable: any;

	constructor(
		private fb: FormBuilder,
		private modalService: NgbModal,
		private toastrService: ToastrService,
		private customDiallogService : CustomDiallogService,
		aclService: AclService,
		private http: HttpService,
		protected requestService: RequestService,
		private _route: ActivatedRoute,
		router: Router,
		titleService: Title,
		private location: Location,
		private CanDeactivateModelComponentService: CanDeactivateModelComponentService,
		protected storageData: StorageData,
		private localStorage: LocalStorage
	) {

		super(aclService, router, _route, requestService, titleService);
		this.regionPage = new Page();
		this.regionPage.pageNumber = 0;
		this.regionPage.size = 10;

	}

	ngOnInit() {
		this.setTitle();
		// this.titleService.setTitle(this._route.snapshot.data['title']);
		this.regionSearchForm = this.initializeRegionSearch();
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.regionSearchForm.patchValue(params);
				this.regionPage.pageNumber = parseInt(params.page) || 1;
				this.regionPage.size = parseInt(params.per_page) || 10;
			}),
		);
		this.regionSetPage({ offset: this.regionPage.pageNumber - 1 || 0 });
		this.regionForm = this.fb.group({
			id: [''],
			name: ['', Validators.required],
			description: [''],
			comments: [''],
		});
		this.regionListingTable = this.localStorage.getObject('regionBillingTableList' + this.storageData.getUserId());
	}

	ngAfterViewInit() {
		if (this.regionListTable?._internalColumns) {
			this.cols = makeDeepCopyArray([...this.regionListTable._internalColumns]);
			this.cols.forEach(element => {
				if(this.regionListingTable?.length) {
					let obj = this.regionListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.regionListingTable?.length) {
				const nameToIndexMap = {};
				this.regionListingTable.forEach((item, index) => {
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
	 * Initialize 'Region' search form
	 * @param void
	 * @returns FormGroup
	 */
	initializeRegionSearch(): FormGroup {
		return this.fb.group({
			name: [''],
			comments: [''],
			description: [''],
		});
	}

	/**
	 * Reset filter
	 * @param void
	 * @returns void
	 */

	resetRegion(): void {
		this.regionSearchForm = this.initializeRegionSearch();
		this.regionSetPage({ offset: 0 });
		this.regionSelection.clear();
		this.regionForm = this.fb.group({
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

	isRegionAllSelected(): boolean {
		this.regionTotalRows = this.regioncomingData.length;
		const numSelected = this.regionSelection.selected.length;
		const numRows = this.regionTotalRows;
		return numSelected === numRows;
	}

	/**
	 * Invoke isRegionAllSelected method and perform operation its return value
	 * @param void
	 * @returns void
	 */
	RegionsmasterToggle(): void {
		this.isRegionAllSelected()
			? this.regionSelection.clear()
			: this.regioncomingData
				.slice(0, this.regionTotalRows)
				.forEach((row) => this.regionSelection.select(row));
	}

	/**
	 * Checked search form is empty or not and queryparams set for pagination
	 * @param pageInfo : any
	 * @returns void
	 */

	regionSetPage(pageInfo: any): void {
		this.regionPage.pageNumber = pageInfo.offset;
		const pageNumber = this.regionPage.pageNumber + 1;

		const filters = checkReactiveFormIsEmpty(this.regionSearchForm);
		this.regionQueryParams = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: this.regionPage.size,
			page: pageNumber,
			pagination: true,
			order_by: 'name'
		};
		let per_page = this.regionPage.size;
		let queryParam = { per_page, page: pageNumber }

		this.addUrlQueryParams({ ...filters, ...queryParam });
		this.displayRegionUpdated({ ...this.regionQueryParams, ...filters });
		this.regionSelection.clear();
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
	 * @params $num: string
	 * @returns void
	 */
	regionPageLimit($num: string): void {
		this.regionPage.size = Number($num);
		this.regionSetPage({ offset: 0 });
		this.regionSelection.clear();
	}

	/**
	 * Used method in regionSetPage and perform GET request to receive data
	 * @param queryParams: any
	 * @returns void
	 */
	displayRegionUpdated(queryParams: any): void {
		this.loadSpin = true;
		this.subscription.push(
			this.requestService
				.sendRequest(
					RegionUrlsEnum.Region_list_GET,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					removeEmptyKeysFromObject(queryParams),
				)
				.subscribe(
					(comingData: any) => {
						this.loadSpin = false;
						if (comingData['status'] == true || comingData['status'] == 200) {
							this.regioncomingData = comingData.result ? comingData.result.data : [];
							this.regionPage.totalElements = comingData.result ? comingData.result.total : 0;
							this.regionPage.totalPages = this.regionPage.totalElements / this.regionPage.size;
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
	 * Create new region
	 * @param form  FormGroup
	 * @returns void
	 */

	createRegionFormSubmit(form: FormGroup): void {
		if (this.regionForm.valid) {
			this.disableBtn = true;
			this.subscription.push(
				this.requestService
					.sendRequest(
						RegionUrlsEnum.Region_list_POST,
						'POST',
						REQUEST_SERVERS.fd_api_url,
						form,
					)
					.subscribe(
						(response: any) => {
							this.disableBtn = false;
							if (response.status === 200 || response.status === true) {
								this.regionSelection.clear();
								this.regionForm.reset();
								this.regionSearchForm.reset();
								this.modalRef.close();
								this.regionSetPage({ offset: this.regionPage.pageNumber });
								this.toastrService.success('Successfully added', 'Success');
							}
						},
						(err) => {
							this.disableBtn = false;
							// const str = parseHttpErrorResponseObject(err.error.message);
							// this.toastrService.error(str);
						},
					),
			);
		} else {
			touchAllFields(this.regionForm);
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
		// this.regionForm.get('name').disable();
		this.regionForm.patchValue({
			id: row.id,
			name: this.regioncomingData[rowIndex].name,
			comments: this.regioncomingData[rowIndex].comments,
			description: this.regioncomingData[rowIndex].description,
		});
	}

	/**
* Patch heading and save button text
 * @param void
 * @returns void
 */
	patchAddValues(): void {
		this.regionForm.reset();
		this.regionForm.get('name').enable();
		this.modelSubmit = 'Save & Continue';
		this.modelTitle = 'Add';
	}

	/**
	 * Open Modal and patch values new or updating
	 * @param regionModal ModalReference
	 * @param row any (optional)
	 * @param rowIndex: number (optional)
	 * @returns void
	 */
	openModalForRegion(regionModal, row: any, rowIndex: number) {
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

		this.modalRef = this.modalService.open(regionModal, ngbModalOptions);
	}

	/**
	 * Method to Update
	 * @param form FormGroup
	 * @returns void
	 */
	updateRegionForm(form: FormGroup): void {
		if (this.regionForm.valid) {
			this.disableBtn = true;
			this.subscription.push(
				this.requestService
					.sendRequest(
						RegionUrlsEnum.Region_list_PUT,
						'PUT',
						REQUEST_SERVERS.fd_api_url,
						form,
					)
					.subscribe(
						(response: any) => {
							this.disableBtn = false;
							if (response.status === 200 || response.status === true) {
								this.regionSelection.clear();
								this.regionForm.reset();
								this.modalRef.close();
								this.regionSetPage({ offset: this.regionPage.pageNumber });
								this.toastrService.success('Successfully updated', 'Success');
							}
						},
						(err) => {
							this.disableBtn = false;
							// const str = parseHttpErrorResponseObject(err.error.message);
							// this.toastrService.error(str);
						},
					),
			);
		} else {
			touchAllFields(this.regionForm);
		}
	}

	/**
	 * CloseModal and ask user to fill data or not
	 * @param void
	 * @returns void | boolean
	 */

	closeModel(): void | boolean {
		if (this.regionForm.dirty && this.regionForm.touched) {
			this.CanDeactivateModelComponentService.canDeactivate().then(res => {
				if (res) {
					this.regionForm.reset();
					this.modalRef.close();
					this.disableBtn = false;
				} else {
					return true;
				}
			});
		} else {
			this.regionForm.reset();
			this.modalRef.close();
		}

	}

	/**
	 * A library method takes an object and converts into string and return
	 * @param obj
	 * @returns string
	 */
	regionstringfy(obj: any): string {
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
		 * Send request to server new creating and updating
		 * @param form FormGroup
		 * @returns void
		 */
	onRegionForm(form: FormGroup): void {
		if (this.modelTitle == 'Add') {
			this.createRegionFormSubmit(form);
		} else {
			this.updateRegionForm(form);
		}
	}

	// temporary disabled used in future
	oneRegionRecordDeleted(row) {
		this.customDiallogService
      .confirm(
        'Delete Confirmation?',
        'Are you sure you want to delete it?',
        'Yes',
        'No'
      )
      .then((confirmed) => {
        if (confirmed) {
          //    this.fdServices.deleteOneRegion(row)
          this.requestService
            .sendRequest(
              RegionUrlsEnum.Region_list_DELETE,
              'DELETE_WITH_BODY',
              REQUEST_SERVERS.billing_api_url,
              row.id
            )
            .subscribe((response: any) => {
              if (response.status === 200) {
                this.regionSelection.clear();
                this.regionSetPage({ offset: this.regionPage.pageNumber });
                this.toastrService.success(
                  'Region deleted successfully.',
                  'Success'
                );
              }
            });
        }
      })
      .catch();


	}

	// temporary disabled used in future
	deleteMultipleRegion() {
		const selected = this.regionSelection.selected;
		const arr: any = [];
		for (let p = 0; p < selected.length; p++) {
			arr[p] = selected[p].id;
		}
		this.customDiallogService.confirm('Delete Confirmation?', 'You want to delete all records?','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				//   this.fdServices.deleteMultipleRegion(arr)
				this.requestService.sendRequest(
					RegionUrlsEnum.Region_list_DELETEMultiple,
					'DELETE_WITH_BODY',
					REQUEST_SERVERS.billing_api_url,
					arr
				)
					.subscribe(
						(response: any) => {
							if (response.status === 200) {
								this.regionSetPage({ offset: this.regionPage.pageNumber });
								this.regionSelection.clear();
								this.toastrService.success('Selected Region deleted successfully.', 'Success');
							}
						}
					);	
			}
		})
		.catch();

	}

	checkInputs(){
		if (isEmptyObject(this.regionSearchForm.value)) {
			return true;
		  }
		  return false;
	}

	regionHistoryStats(row) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			windowClass: 'modal_extraDOc body-scroll history-modal',
			modalDialogClass: 'modal-lg'
		};
		let modelRef = this.modalService.open(CreatedHistoryComponent,ngbModalOptions);
		modelRef.componentInstance.createdInformation = [row];
	}
	openCustomoizeColumn(CustomizeColumnModal) {
		const ngbModalOptions: NgbModalOptions = {
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
			this.localStorage.setObject('regionBillingTableList' + this.storageData.getUserId(), data);
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
		this.regionListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.regionListTable._internalColumns.sort(function (a, b) {
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
