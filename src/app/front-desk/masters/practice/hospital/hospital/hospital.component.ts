import { DatePipeFormatService } from './../../../../../shared/services/datePipe-format.service';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { NgbModalRef, NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SelectionModel } from '@angular/cdk/collections';
import { Page } from '@appDir/front-desk/models/page';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { Location } from '@angular/common';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Hospital } from '../model/hospital';
import { HospitalURLs } from '../hospital-urls.enum';
import { HttpSuccessResponse, StorageData } from '@appDir/pages/content-pages/login/user.class';
import { ToastrService } from 'ngx-toastr';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { dropDownSettings } from './settings';
import { DepartmentUrlsEnum } from '@appDir/front-desk/masters/master-users/departments/department/Departments-urls-enum';
import { Department } from '@appDir/shared/models/department/department';
import { environment } from 'environments/environment';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { checkReactiveFormIsEmpty, getComponentByType, isEmptyObject, isObjectEmpty, statesList,allStatesList, makeDeepCopyArray, getIdsFromArray  } from '@appDir/shared/utils/utils.helpers';
import { ZipFormatMessages } from '@appDir/shared/dynamic-form/constants/ZipFormatMessages.enum';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
@Component({
	selector: 'app-hospital',
	templateUrl: './hospital.component.html',
	styleUrls: ['./hospital.component.scss']
})
export class HospitalComponent extends PermissionComponent implements OnInit, OnDestroy {

	public form: FormGroup;
	public contactPersonForm: FormGroup;
	public modalRef: NgbModalRef;
	public hospitalData: Hospital[] = [];
	public departments: Department[];
	public dropDownSettings = dropDownSettings;
	public totalRows: number;
	public selection = new SelectionModel<Hospital>(true, []);
	public page: Page;
	public searchForm: FormGroup;
	public mode: string = 'create';
	public states = [];
	public allStates=[];
	public queryParams: ParamQuery;
	public isCollapsed = false;
	zipFormatMessage=ZipFormatMessages;
	environment= environment;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('hospitalList') hospitalListTable: DatatableComponent;
	customizedColumnComp: CustomizeColumnComponent;
	@ViewChild(CustomizeColumnComponent) set con(con: CustomizeColumnComponent) {
		if (con) { // initially setter gets called with undefined
		  this.customizedColumnComp = con;
		}
	}
	modalCols :any[] = [];
	columns: any[] = [];
	alphabeticColumns:any[] =[];
	colSelected: boolean = true;
  	isAllFalse: boolean = false;
	hospitalListingTable: any;

	constructor(
		private toastrService: ToastrService,
		private modalService: NgbModal,
		private fb: FormBuilder,
		public aclService: AclService,
		protected requestService: RequestService,
		private _route: ActivatedRoute,
		public _router: Router,
		public _titleService: Title,
		private location: Location,
		public datePipeService: DatePipeFormatService,
		private CanDeactivateModelComponentService: CanDeactivateModelComponentService,
		private toaster: ToastrService,
		private storageData: StorageData,
		private localStorage: LocalStorage
	) {
		super(aclService, _router, _route, requestService, _titleService);
		this.page = new Page();
		this.page.size = 10;
		this.page.pageNumber = 1;
	}

	/**
	 * on init
	 */
	selectedState:string='';
	ngOnInit() {

		this.states = statesList;
		this.allStates=allStatesList;
		this.setTitle();
		this.form = this.createForm();
		this.searchForm = this.initializeSearchForm();
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.searchForm.patchValue(params);
				this.page.pageNumber = parseInt(params.page) || 1;
				this.page.size = parseInt(params.per_page) || 10;
			}),
		);
		this.getDepartment();
		this.hospitalListingTable = this.localStorage.getObject('hospitalMasterTableList' + this.storageData.getUserId());
	}

	ngAfterViewInit() {
		if (this.hospitalListTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.hospitalListTable._internalColumns]);
			this.columns.forEach(element => {
				if(this.hospitalListingTable.length) {
					let obj = this.hospitalListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.hospitalListingTable.length) {
				const nameToIndexMap = {};
				this.hospitalListingTable.forEach((item, index) => {
					nameToIndexMap[item?.header] = index;
				});
				this.columns.sort((a, b) => nameToIndexMap[a?.name] - nameToIndexMap[b?.name]);
			}
			let columns = makeDeepCopyArray(this.columns);
			this.alphabeticColumns = columns.sort(function (a, b) {
				if (a.name < b.name) { return -1; }
				if (a.name > b.name) { return 1; }
				return 0;
			});
			this.onConfirm(false);
		}
	}

	/**
	 * Sets page
	 * @param pageInfo 
	 */
	setPage(pageInfo: any): void {

		this.selection.clear();
		this.page.pageNumber = pageInfo.offset;
		const pageNumber = this.page.pageNumber + 1;
		const filters = checkReactiveFormIsEmpty(this.searchForm);

		this.queryParams = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: this.page.size || 10,
			page: pageNumber,
			pagination: true,
		};

		let name = this.searchForm.value.name;
		let street_address = this.searchForm.value.street_address;
		let city = this.searchForm.value.city;
		let state = this.searchForm.value.state;
		let zip = this.searchForm.value.zip;
		let contact_person_fax = this.searchForm.value.street_address;
		let contact_person_email = this.searchForm.value.contact_person_email;
		let contact_person_name = this.searchForm.value.contact_person_name;
		let per_page = this.page.size;
		let queryParam = { name, street_address, city, state, zip, contact_person_fax, contact_person_email, contact_person_name, per_page, page: pageNumber };
		this.addUrlQueryParams(queryParam);
		this.getHospitals({ ...this.queryParams, ...filters });
	}

	/**
	 * Adds url query params
	 * @param [params] 
	 */
	addUrlQueryParams(params?): void {
		this.location.replaceState(
			this.router.createUrlTree([], { queryParams: params, }).toString()
		);
	}

	stateChange(event)
	{
		this.selectedState=event.fullName;		
	}

	/**
	 * Initializes search form
	 * @returns search form 
	 */
	initializeSearchForm(): FormGroup {
		return this.fb.group({
			name: [''],
			work_phone: [''],
			street_address: [''],
			email: [''],
			fax: [''],
			contact_person_name: [''],
		})
	}

	/**
	 * Creates form
	 * @returns form 
	 */
	createForm(): FormGroup {
		this.contactPersonForm = this.fb.group({
			id: [null],
			first_name: [''],
			middle_name: [''],
			last_name: [''],
			phone_no: [''],
			extension: [''],
			cell_no: [''],
			email: ['', [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
			fax: [''],
		});
		return this.fb.group({
			id: [null],
			name: ['', Validators.required],
			street_address: [''],
			apartment: [''],
			city: [''],
			state: [''],
			zip: ['',[Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')]],
			work_phone: [''],
			ext: [''],
			email: ['', [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
			fax: [''],
			department_ids: [null],
			contact_person: this.contactPersonForm,
		});
	}


	/**
	 * Is all selected
	 * @returns true if all selected 
	 */
	isAllSelected(): boolean {
		this.totalRows = this.hospitalData.length;
		const numSelected = this.selection.selected.length;
		const numRows = this.totalRows;
		return numSelected === numRows;
	}

	/**
	 * Masters toggle
	 */
	masterToggle(): void {
		this.isAllSelected()
			? this.selection.clear()
			: this.hospitalData.slice(0, this.totalRows).forEach((row) => this.selection.select(row));
	}


	/**
	 * On result per page change event 
	 * @param event 
	 */
	onResultPerPageChange(event) {
		this.page.size = event.target.value;
		this.setPage({ offset: 0 });
	}


	/**
	 * Gets hospitals
	 * @param queryParams 
	 */
	getHospitals(queryParams: any): void {
		this.startLoader = true;
		this.subscription.push(
			this.requestService
				.sendRequest(
					HospitalURLs.Hospital_List_GET,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					queryParams,
				)
				.subscribe(
					(response: HttpSuccessResponse) => {
						if (response.status) {
							this.startLoader = false;
							this.hospitalData = response.result ? response.result.data : [];

							// this.hospitalData = hospitals.map((hospital) => {
							// 	let _hospital = new Hospital(hospital);
							// 	_hospital.departments = this.departments;
							// 	return _hospital
							// });
							this.page.totalElements =
								response && response.result && response.result.total ? response.result.total : 0;
							this.page.totalPages = this.page.totalElements / this.page.size;


							// this.hospitalData = [new Hospital({})];
							// this.hospitalData = this.hospitalData.map((hospital: Hospital) => {
							//   ;
							//   hospital.setHospital = hospital.dummyData;
							//   hospital.departments = this.departments;
							//   return hospital;
							//   // let _hospital = new Hospital(hospital);
							//   // _hospital.departments = this.departments;
							//   // return _hospital
							// });
							// this.page.totalElements = 1;
							// this.page.totalPages = 1;
							// this.page.pageNumber = 1;
							// console.log(this.page);
						}
					},
					(err) => {
						this.startLoader = false;
					},
				),
		);
	}

	/**
	 * Gets department
	 */
	getDepartment(): void {
		this.startLoader = true;
		this.subscription.push(
			this.requestService
				.sendRequest(
					DepartmentUrlsEnum.Departments_list_GET,
					'GET',
					REQUEST_SERVERS.fd_api_url,
				)
				.subscribe(
					(response: HttpSuccessResponse) => {
						this.startLoader = false;
						this.departments = response.result ? response.result.data : [];
						this.departments = this.departments.map((department) => {
							return new Department(department);
						})
						this.setPage({ offset: this.page.pageNumber - 1 || 0 });
					},
					(err) => {
						this.startLoader = false;
					},
				),
		);
	}
	/**
	 * On Submit
	 * @param value 
	 */
	onSubmit(value: any): void {
		this.startLoader = true;
		delete value.id;
		this.subscription.push(
			this.requestService
				.sendRequest(HospitalURLs.Hospital_List_POST, 'POST', REQUEST_SERVERS.fd_api_url, value)
				.subscribe(
					(response: any) => {
						if (response) {
							this.form.reset();
							this.selection.clear();
							this.setPage({ offset: 0 });
							this.startLoader = false;
							this.toastrService.success('Successfully added', 'Success');
							this.modalRef.close();
						}
					},
					(err) => {
						this.startLoader = false;
					},
				),
		);
	
	}

	/**
	 * Patchs edit values
	 * @param row 
	 */
	patchEditValues(row: Hospital): void {
		this.mode = 'update';
		if (row) {
			this.form.get('name');
			this.form.patchValue(row);
			this.form.patchValue({ department_ids: row.departments });
		}
	}

	/**
	 * Reset filter
	 * @param void
	 * @returns void
	 */
	resetFilter(): void {
		this.searchForm.reset();
		this.setPage({ offset: 0 });
	}


	/**
	 * Resets create form
	 */
	resetCreateForm(): void {
		this.form.reset();
		this.form.get('name').enable();
		this.mode = 'create';
	}

	/**
	 * Opens modal
	 * @param modal 
	 * @param [row] 
	 */
	openModal(modal, row?: any) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			size: 'lg',
			keyboard: false,
			windowClass: 'modal_extraDOc',
		};
		if (row == undefined || row == null) {
			this.resetCreateForm();
		} else {
			this.patchEditValues(row);
		}
		this.modalRef = this.modalService.open(modal, ngbModalOptions);
	}

	/**
	 * On form submit
	 * @param form 
	 */
	onFormSubmit(form: any): void {
		if (form.department_ids && form.department_ids.length) {
			if(form.department_ids.every(department => department.id > 0)) {
				form.department_ids = form.department_ids.map((department) => { return department.id })
			} else {
				this.form.controls.department_ids.setValue[this.form.controls.department_ids.value];
			}
		}
		if (this.mode == 'create') {
			this.onSubmit(form);
		}
		else {
			this.onUpdate(form);
		}
	}

	/**
	 * Gets address
	 * @param row 
	 * @returns  
	 */
	getAddress(row) {
		return `${row.streetAddress || ''}${(row.apartment) ? `, ${row.apartment}` : ``}`;
	}


	/**
	 * On hospital Update
	 * @param value 
	 */
	onUpdate(value: any): void {

		this.startLoader = true;
		this.subscription.push(
			this.requestService
				.sendRequest(HospitalURLs.Hospital_List_PUT, 'PUT', REQUEST_SERVERS.fd_api_url, value)
				.subscribe(
					(response) => {
						if (response) {
							this.form.reset()
							this.startLoader = false;
							this.setPage({ offset: this.page.pageNumber });
							this.toastrService.success('Successfully updated', 'Success');
							this.selection.clear();
							this.modalRef.close();
						}
					},
					(err) => {
						this.startLoader = false;
					},
				),
		);
	
	}

	/**
	 * Handles address change
	 * @param address 
	 * @param [type] 
	 */
	public handleAddressChange(address: Address, type?: string): void {

		const street_number = getComponentByType(address, 'street_number');
		const route = getComponentByType(address, 'route');
		const city = getComponentByType(address, 'locality');
		const state = getComponentByType(address, 'administrative_area_level_1');
		const postal_code = getComponentByType(address, 'postal_code');
		const _address = street_number.long_name + (street_number.long_name ? ' ' : '') + route.long_name;
		if (type === 'form') {
			this.form.patchValue(
				{city: city.long_name,
					state: state.long_name,
					zip: postal_code.long_name,
					street_address: _address,}
			);
		}
	}


	// /**
	//  * LifeCycle hook method unsubscribe all Observables to prevent from memory leakage
	//  * @param void
	//  * @returns void
	//  */

	public ngOnDestroy(): void {
		unSubAllPrevious(this.subscription);
	}


	/**
	 * Closes modal
	 */
	public closeModal() {
		if ((this.form.dirty && this.form.touched)) {
			this.CanDeactivateModelComponentService.canDeactivate().then(res => {
				if (res) {
					this.modalRef.close();
					this.form.reset();
				} else {
					return true;
				}
			});
		} else {
			this.modalRef.close();
			this.form.reset();
		}

	}
	isDisableSaveContinue() {
		if(this.form.invalid || this.startLoader) {
			return true;
		}
		return false;
	}
	checkInputs(){
		if (isEmptyObject(this.searchForm.value)) {
			return true;
		  }
		  return false;
	}

	hospitalHistoryStats(row) {
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
		this.columns.forEach(element => {
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
			this.localStorage.setObject('hospitalMasterTableList' + this.storageData.getUserId(), data);
		}
		let groupByHeaderCol = getIdsFromArray(this.modalCols, 'header'); // pick header
		this.columns.sort(function (a, b) {
			return groupByHeaderCol.indexOf(a.name) - groupByHeaderCol.indexOf(b.name);
		});
		//set checked and unchecked on the base modal columns in alphabeticals columns
		this.alphabeticColumns.forEach(element => {
		let currentColumnIndex = findIndexInData(this.columns, 'name', element.name)
			if (currentColumnIndex != -1) {
				this.columns[currentColumnIndex]['checked'] = element.checked;
				this.columns = [...this.columns];
			}
		});
		// show only those columns which is checked
		let columnsBody = makeDeepCopyArray(this.columns);
		this.hospitalListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.hospitalListTable._internalColumns.sort(function (a, b) {
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
