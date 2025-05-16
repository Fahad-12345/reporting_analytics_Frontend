import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModalRef, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Page } from '@appDir/front-desk/models/page';
import { ToastrService } from 'ngx-toastr';
import { AclService } from '@appDir/shared/services/acl.service';
import { Subscription } from 'rxjs';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { ModifiersUrlsEnum } from '../Modifiers-Urls-Enum';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { Location } from '@angular/common';
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
	selector: 'app-modifiers',
	templateUrl: './modifiers.component.html',
	styleUrls: ['./modifiers.component.scss'],
})
export class ModifiersComponent extends PermissionComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	loadSpin: boolean = false;
	modalRef: NgbModalRef;
	modelTitle: string = 'Add';
	modelSubmit: string = 'Save';
	modifierSearchForm: FormGroup;
	modifiersComingData: any[] = []; // modifier coming data from back end
	modifierSelection = new SelectionModel<Element>(true, []);
	modifiertotalRows: number;
	modifierform: FormGroup; // edit form for modifiers
	modifierPage: Page;
	modifiersQueryParams: ParamQuery;
	isCollapsed: boolean = false;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('modifiersList') modifiersListTable: DatatableComponent;
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
	modifiersListingTable: any;


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
		private CanDeactivateModelComponentService: CanDeactivateModelComponentService,
		private customDiallogService : CustomDiallogService,
		protected storageData: StorageData,
		private localStorage: LocalStorage
	) {
		super(aclService, router, _route, requestService, titleService);
		this.modifierPage = new Page();
		this.modifierPage.pageNumber = 0;
		this.modifierPage.size = 10;
	}

	ngOnInit() {
		this.setTitle();
		// this.titleService.setTitle(this._route.snapshot.data['title']);
		this.modifierSearchForm = this.initializeModifierForm();
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.modifierSearchForm.patchValue(params);
				this.modifierPage.pageNumber = parseInt(params.page) || 1;
				this.modifierPage.size = parseInt(params.per_page) || 10;

			}),
		);
		this.modifierSetpage({ offset: this.modifierPage.pageNumber - 1 || 0 });

		this.modifierform = this.fb.group({
			id: [''],
			name: ['', Validators.required],
			code: [''],
			description: [''],
			comments: [''],
		});
		this.modifiersListingTable = this.localStorage.getObject('modifiersBillingTableList' + this.storageData.getUserId());
	}

	ngAfterViewInit() {
		if (this.modifiersListTable?._internalColumns) {
			this.cols = makeDeepCopyArray([...this.modifiersListTable._internalColumns]);
			this.cols.forEach(element => {
				if(this.modifiersListingTable?.length) {
					let obj = this.modifiersListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.modifiersListingTable?.length) {
				const nameToIndexMap = {};
				this.modifiersListingTable.forEach((item, index) => {
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
	 * Initialize 'modifier' search form
	 * @param void
	 * @returns FormGroup
	 */

	initializeModifierForm(): FormGroup {
		return this.fb.group({
			name: [''],
			code: [''],
			description: [''],
			comments: ['']
		});
	}


	/**
		 * Reset filter
		 * @param void
		 * @returns void
		 */
	resetModifier(): void {
		this.modifierSearchForm = this.initializeModifierForm();
		this.modifierSetpage({ offset: 0 });
		this.modifierform = this.fb.group({
			id: [''],
			name: ['', Validators.required],
			code: [''],
			description: ['', Validators.required],
			comments: [''],
		});
	}

	/**
	 * Compare checkbox selection and length of data coming from server and return boolean
	 * @param void
	 * @returns boolean
	 */

	isModifiersAllSelected(): boolean {
		this.modifiertotalRows = this.modifiersComingData.length;
		const numSelected = this.modifierSelection.selected.length;
		const numRows = this.modifiertotalRows; // this.patientRows.length;
		return numSelected === numRows;
	}

	/**
	 * Invoke isModifiersAllSelected method and perform operation its return value
	 * @param void
	 * @returns void
	 */
	ModifiersmasterToggle(): void {
		this.isModifiersAllSelected()
			? this.modifierSelection.clear()
			: this.modifiersComingData
				.slice(0, this.modifiertotalRows)
				.forEach((row) => this.modifierSelection.select(row));
	}

	/**
		 * Checked search form is empty or not and queryparams set for pagination
		 * @param pageInfo : any
		 * @returns void
		 */

	modifierSetpage(pageInfo: any): void {
		this.modifierSelection.clear();
		this.modifierPage.pageNumber = pageInfo.offset;
		const pageNumber = this.modifierPage.pageNumber + 1;

		const filters = checkReactiveFormIsEmpty(this.modifierSearchForm);
		this.modifiersQueryParams = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: this.modifierPage.size,
			page: pageNumber,
			pagination: true,
			order_by: 'code'
		};
		let per_page = this.modifierPage.size;
		let queryparam = { per_page, page: pageNumber }
		this.addUrlQueryParams({ ...filters, ...queryparam });
		this.displayModifierUpdated({ ...this.modifiersQueryParams, ...filters });
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
	modifierPageLimit($num) {
		this.modifierSelection.clear();
		this.modifierPage.size = Number($num);
		this.modifierSetpage({ offset: 0 });
	}

	/**
	 * Used method in modifierSetpage and perform GET request to receive data
	 * @param queryParams: any
	 * @returns void
	 */

	displayModifierUpdated(queryParams: any): void {
		this.loadSpin = true;
		this.subscription.push(
			this.requestService
				.sendRequest(
					ModifiersUrlsEnum.Modifiers_list_GET,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					removeEmptyKeysFromObject(queryParams),
				)
				.subscribe(
					(comingData: any) => {
						if (comingData['status'] == 200 || comingData['status'] == true) {
							this.loadSpin = false;
							this.modifiersComingData = comingData.result ? comingData.result.data : [];
							this.modifierPage.totalElements = comingData.result ? comingData.result.total : 0;
							this.modifierPage.totalPages =
								this.modifierPage.totalElements / this.modifierPage.size;
						} else {
							this.loadSpin = false;
						}
					},
					(error) => {
						this.loadSpin = false;
						this.toastrService.error(error.message || 'Something went wrong.', 'Error');
					},
				),
		);
	}

	/**
 * Create new modifier
 * @param form  FormGroup
 * @returns void
 */

	createModifierSubmit(form: FormGroup): void {
		if (this.modifierform.valid) {
			this.loadSpin = true;
			this.subscription.push(
				this.requestService
					.sendRequest(
						ModifiersUrlsEnum.Modifiers_list_POST,
						'POST',
						REQUEST_SERVERS.fd_api_url,
						form,
					)
					.subscribe((response: any) => {
						if (response.status === 200 || response.status === true) {
							this.loadSpin = false;
							this.modifierSelection.clear();
							this.modifierform.reset();
							this.modalRef.close()
							this.modifierSetpage({ offset: this.modifierPage.pageNumber });
							this.toastrService.success('Successfully added', 'Success');
						} else {
							this.loadSpin = false;
							this.toastrService.error(response.message);
						}
					},(error) => {
						this.loadSpin = false;
					})
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

		// this.modifierform.get('name').disable();
		// this.modifierform.get('code').disable();
		this.modifierform.patchValue({
			id: row.id,
			name: this.modifiersComingData[rowIndex].name,
			code: this.modifiersComingData[rowIndex].code,
			description: this.modifiersComingData[rowIndex].description,
			comments: this.modifiersComingData[rowIndex].comments,
		});
	}

	/**
	* Patch heading and save button text
	 * @param void
	 * @returns void
	 */
	patchAddValues(): void {
		this.modifierform.reset();
		this.modifierform.get('name').enable();
		// this.modifierform.get('code').enable();
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
	openModifierModal(modifierModel, row?: any, rowIndex?: number): void {
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

		this.modalRef = this.modalService.open(modifierModel, ngbModalOptions);
	}

	/**
	 * Method to Update
	 * @param form FormGroup
	 * @returns void
	 */

	updateModifierSubmit(form: FormGroup): void {
		if (this.modifierform.valid) {
			this.loadSpin = true;
			this.subscription.push(
				this.requestService
					.sendRequest(
						ModifiersUrlsEnum.Modifiers_list_PUT,
						'PUT',
						REQUEST_SERVERS.fd_api_url,
						form,
					)
					.subscribe((response: any) => {
						if (response.status === 200 || response.status === true) {
							this.loadSpin = false;
							this.modifierSelection.clear();
							this.modifierform.reset();
							this.modalRef.close();
							this.modifierSetpage({ offset: this.modifierPage.pageNumber });
							this.toastrService.success('Successfully updated', 'Success');
						} else {
							this.loadSpin = false;
							this.toastrService.error(response.message);
						}
					},(error) => {
						this.loadSpin = false;
					})
			);
			
		}
	}

	/**
	 * Send request to server new creating and updating
	 * @param form FormGroup
	 * @returns void
	 */
	onModifierSubmit(form: FormGroup): void {
		if (this.modelTitle == 'Add') {
			this.createModifierSubmit(form);
		} else {
			this.updateModifierSubmit(form);
		}
	}

	/**
	 * CloseModal and ask user to fill data or not
	 * @param void
	 * @returns void | boolean
	 */
	closeModalWithFormReset(): void | boolean {
		if (this.modifierform.dirty && this.modifierform.touched) {
			this.CanDeactivateModelComponentService.canDeactivate().then(res => {
				if (res) {
					this.modifierform.reset();
					this.modalRef.close();
				} else {
					return true;
				}
			});
		} else {
			this.modifierform.reset();
			this.modalRef.close();
		}
	}


	/**
	 * A library method takes an object and converts into string and return
	 * @param obj
	 * @returns string
	 */

	Modifierstringfy(obj: any): string {
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

	// temporary disabled used in future
	oneMpdifierRecordDeleted(row) {

		this.customDiallogService.confirm('Delete Confirmation?', 'Are you sure you want to delete it?','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
					//     this.fdServices.deleteOneModifier(row)
					this.requestService.sendRequest(
						ModifiersUrlsEnum.Modifiers_list_DELETE,
						'DELETE_WITH_BODY',
						REQUEST_SERVERS.fd_api_url,
						row.id
					)
						.subscribe(
							(response: any) => {
								if (response.status === 200) {
									this.modifierSelection.clear();
									this.modifierSetpage({ offset: this.modifierPage.pageNumber });
									this.toastrService.success('One modifier deleted  successfully', 'Success');
								}
							}
						)
			}
		})
		.catch();
	}

	checkInputs(){
		if (isEmptyObject(this.modifierSearchForm.value)) {
			return true;
		  }
		  return false;
	}

	modifierHistoryStats(row) {
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
			this.localStorage.setObject('modifiersBillingTableList' + this.storageData.getUserId(), data);
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
		this.modifiersListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.modifiersListTable._internalColumns.sort(function (a, b) {
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
	//   deleteMultipleModifiers() {
	//     const selected = this.modifierSelection.selected;
	//     const arr: any = [];
	//     for (let p = 0; p < selected.length; p++) {
	//       arr[p] = selected[p].id;
	//     }
	//     console.log('arr', arr)
	//     this.confirmService.create('Delete Confirmation?', 'You want to delete all records?').subscribe(
	//       value => {
	//         if (value.resolved) {
	//           this.fdServices.deleteMultipleModifiers(arr)
	//   this.requestService.sendRequest(
	// 	ModifiersUrlsEnum.Modifiers_list_DELETEMultiple,
	// 	'DELETE_WITH_BODY',
	// 	REQUEST_SERVERS.fd_api_url,
	// 	arr
	// )
	//   .subscribe(
	//             response => {
	//               if (response.status === 200) {
	//                 this.modifierSetpage({ offset: this.modifierPage.pageNumber });
	//                 this.modifierSelection.clear();
	//                 this.toastrService.success('All modifiers deleted successfully', 'Success');
	//               }
	//             }
	//           );
	//         }
	//       }
	//     )

	//   }
}
