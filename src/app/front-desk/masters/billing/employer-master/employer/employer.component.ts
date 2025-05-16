import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { NgbModalOptions, NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Page } from '@appDir/front-desk/models/page';
import { AclService } from '@appDir/shared/services/acl.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import {
	unSubAllPrevious,
} from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { EmployerUrlsEnum } from './Employer-Urls-Enum';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { Location, LocationStrategy } from '@angular/common'
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { allStatesList ,checkReactiveFormIsEmpty, isEmptyObject, isObjectEmpty, removeEmptyAndNullsFormObject, statesList, removeEmptyAndNullsArraysFormObject, makeDeepCopyArray, getIdsFromArray } from '@appDir/shared/utils/utils.helpers';
import { ZipFormatMessages } from '@appDir/shared/dynamic-form/constants/ZipFormatMessages.enum';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { environment } from 'environments/environment';
import { CustomFormValidators } from '@appDir/shared/customFormValidator/customFormValidator';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
@Component({
	selector: 'app-employer',
	templateUrl: './employer.component.html',
	styleUrls: ['./employer.component.scss'],
})
export class EmployerComponent extends PermissionComponent implements OnInit, OnDestroy {
	public form: FormGroup;
	public contactPersonForm: FormGroup;
	modalRef: NgbModalRef;
	employerData: any[] = [];
	patientRows: any[];
	totalRows: number;
	selection = new SelectionModel<Element>(true, []);
	page: Page;
	searchForm: FormGroup;
	exchangeData: any[] = [];
	queryParams: ParamQuery;
	loadSpin: boolean = false;
	modelTitle: string = 'Add';
	modelSubmit: string = 'Save';
	isCollapsed = false;
	zipFormatMessage=ZipFormatMessages;
	environment= environment;
	allStates=[];
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('employerList') employerListTable: DatatableComponent;
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
	employerListingTable: any;

	constructor(
		private toastrService: ToastrService,
		private modalService: NgbModal,
		private fb: FormBuilder,
		aclService: AclService,
		private fdService: FDServices,
		protected requestService: RequestService,
		private _route: ActivatedRoute,
		public datePipeService: DatePipeFormatService,
		router: Router,
		titleService: Title,
		private location: Location, private locationStratgy: LocationStrategy,
		private CanDeactivateModelComponentService: CanDeactivateModelComponentService,
		protected storageData: StorageData,
		private localStorage: LocalStorage
	) {
		super(aclService, router, _route, requestService, titleService);
		this.page = new Page();
		this.page.size = 10;
		this.page.pageNumber = 1;
	}

	states = []
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
		this.setPage({ offset: this.page.pageNumber - 1 || 0 });
		this.employerListingTable = this.localStorage.getObject('employerMasterTableList' + this.storageData.getUserId());
	}

	ngAfterViewInit() {
		if (this.employerListTable?._internalColumns) {
			this.cols = makeDeepCopyArray([...this.employerListTable._internalColumns]);
			this.cols.forEach(element => {
				if(this.employerListingTable?.length) {
					let obj = this.employerListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.employerListingTable?.length) {
				const nameToIndexMap = {};
				this.employerListingTable.forEach((item, index) => {
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
	 * Checked search form is empty or not and queryparams set for pagination
	 * @param pageInfo : any
	 * @returns void
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
		// }
		let varifiedEmplyer={
			is_verified_employer:1
		}
		
		this.displayGetAllEmployers({ ...this.queryParams, ...filters,...varifiedEmplyer });
	}
	pasteEvent(event) {
		// console.log(event.clipboardData.getData('Text'));
		let totalStringLength = this.searchForm.controls.ext.value.length;
		let getValue = totalStringLength/2;
		let getString = totalStringLength.substr(0,getValue);
		this.searchForm.controls.ext.setValue[getString];
	}
	/**
	 * Queryparams to make unique URL
	 * @param params
	 * @returns void
	 */
	addUrlQueryParams(params?): void {
		this.location.replaceState(
			this.router.createUrlTree([], { queryParams: params, }).toString()
		);
	}

	/**
	 * Initialize 'Employer' search form
	 * @param void
	 * @returns FormGroup
	 */
	initializeSearchForm(): FormGroup {
		return this.fb.group({
			name: [''],
			street_address: [''],
			city: [''],
			state: [''],
			zip: [''],
			fax: [''],
			email: [''],
			phone_no: [''],
			ext: [''],
			contact_person_name: [''],
			apartment_suite: [''],
		})
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


	createForm(): FormGroup {
		this.contactPersonForm = this.fb.group({
			id: [null],
			first_name: [''],
			middle_name: [''],
			last_name: [''],
			phone_no: [''],
			extension: [''],
			email: ['', [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
			fax: [''],
		});
		return this.fb.group({
			id: [null],
			employer_name: ['', Validators.required],
			street_address: ['',[Validators.required,CustomFormValidators.hasOnlyWhitespace]],
			apartment_suite: [''],
			city: ['',[Validators.required,CustomFormValidators.hasOnlyWhitespace]],
			state: ['',Validators.required],
			zip: ['',[Validators.required,Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')]],
			phone_no: ['',Validators.required],
			ext: [''],
			email: ['', [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
			fax: [''],
			contact_person: this.contactPersonForm,
		});
	}

	/**
	 * Compare checkbox selection and length of data coming from server and return boolean
	 * @param void
	 * @returns boolean
	 */
	isAllSelected(): boolean {
		this.totalRows = this.employerData.length;
		const numSelected = this.selection.selected.length;
		const numRows = this.totalRows;
		return numSelected === numRows;
	}

	/**
	 * Invoke isCaseStatusAllSelected method and perform operation its return value
	 * @param void
	 * @returns void
	 */
	masterToggle(): void {
		this.isAllSelected()
			? this.selection.clear()
			: this.employerData.slice(0, this.totalRows).forEach((row) => this.selection.select(row));
	}

	/**
	 * Dropdown selection how much data user want in listing
	 * @params $num: string
	 * @returns void
	 */
	onResultPerPageChange(event) {
		this.page.size = event.target.value;
		this.setPage({ offset: 0 });
	}
	selectedState:string='';
	stateChange(event)
	{
		if(!event){
			this.selectedState = '';
			return
		}
		this.selectedState=event.fullName;		
	}

	/**
	 * Used method in setPage and perform GET request to receive data
	 * @param queryParams: any
	 * @returns void
	 */

	displayGetAllEmployers(queryParams: any): void {
		this.loadSpin = true;
		this.subscription.push(
			this.requestService
				.sendRequest(
					EmployerUrlsEnum.Employer_list_GET,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					queryParams,
				)
				.subscribe(
					(data: any) => {
						if (data.status) {
							this.loadSpin = false;
							this.employerData = data.result ? data.result.data : [];
							this.page.totalElements =
								data && data.result && data.result.total ? data.result.total : 0;
							this.page.totalPages = this.page.totalElements / this.page.size;
						}
					},
					(err) => {
						this.loadSpin = false;
					},
				),
		);
	}
	onSubmit(value: any): void {
		this.loadSpin = true;
		delete value.id;
		this.subscription.push(
			this.requestService
				.sendRequest(EmployerUrlsEnum.Employer_list_POST, 'POST', REQUEST_SERVERS.fd_api_url, value)
				.subscribe(
					(response: any) => {
						if (response) {
							this.form.reset();
							this.loadSpin = false;
							this.selection.clear();
							this.setPage({ offset: 0 });
							this.modalRef.close();
							this.toastrService.success('Successfully added', 'Success');
						}
					},
					(err) => {
						this.loadSpin = false;
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


	patchEditValues(row: any): void {
		this.modelSubmit = 'Update';
		this.modelTitle = 'Edit';
		if (row) {
			row['contact_person']= row['contact_person']?removeEmptyAndNullsFormObject(row['contact_person']):'';
			if(row['state']){
				let obj = this.allStates.filter(x => x.name == row['state'])?.[0];
				this.selectedState = obj['fullName'];
			}else{
				this.selectedState = '';
			}
			this.form.patchValue(row);
		}
	}

	/**
	* Patch heading and save button text
	 * @param void
	 * @returns void
	 */
	resetCreateForm(): void {
		this.form.reset();
		this.form.get('employer_name').enable();
		this.modelSubmit = 'Save & Continue';
		this.modelTitle = 'Add';
	}

	/**
	 * Open Modal and patch values new or updating
	 * @param editEmployer ModalReference
	 * @param row any (optional)
	 * @param rowIndex: number (optional)
	 * @returns void
	 */
	openModal(editEmployer, row?: any) {
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
		this.modalRef = this.modalService.open(editEmployer, ngbModalOptions);
	}


	/**
	 * Create new employer
	 * @param form  FormGroup
	 * @returns void
	 */
	onSubmitEmployer(form: any): void {
		form['contact_person']= form['contact_person']?removeEmptyAndNullsFormObject(form['contact_person']):'';
		form['employer_name']= form['employer_name'] && form['employer_name'].split(' ').filter(e => e !='').join(' ');
		if (this.modelTitle == 'Add') {
			this.onSubmit(
				removeEmptyAndNullsArraysFormObject(
				form));
		}
		else {
			this.onUpdate( 
				removeEmptyAndNullsArraysFormObject(
				form));
		}
	}

	getAddress(row) {
		return `${row.street_address || ''}${(row.apartment_suite) ? `, ${row.apartment_suite}` : ``}`;
	}
	/**
	 * Method to Update
	 * @param form any
	 * @returns void
	 */
	onUpdate(value: any): void {
		this.loadSpin = true;
		this.subscription.push(
			this.requestService
				.sendRequest(EmployerUrlsEnum.Employer_list_PUT, 'PUT', REQUEST_SERVERS.fd_api_url, value)
				.subscribe(
					(response) => {
						if (response) {
							this.form.reset();
							this.loadSpin = false;
							this.setPage({ offset: this.page.pageNumber });
							this.toastrService.success('Successfully updated', 'Success');
							this.selection.clear();
							this.modalRef.close();
						}
					},
					(err) => {
						this.loadSpin = false;
					},
				),
		);
		
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
	 * Dropdown selection how much data user want in listing
	 * @params $num: string
	 * @returns void
	 */
	PageLimit($num) {
		this.page.size = Number($num);
		this.setPage({ offset: 0 });
	}

	/**
	 * THis method get address from API 
	 * @param address : Address
	 * @param type: string
	 * @returns void
	 */
	public handleAddressChange(address: Address, type?: string): void {

		const street_number = this.fdService.getComponentByType(address, 'street_number');
		const route = this.fdService.getComponentByType(address, 'route');
		const city = this.fdService.getComponentByType(address, 'locality');
		const state = this.fdService.getComponentByType(address, 'administrative_area_level_1');
		const postal_code = this.fdService.getComponentByType(address, 'postal_code');
		const _address = street_number.long_name + (street_number.long_name ? ' ' : '') + route.long_name;
		if (type === 'form') {
			this.form.patchValue(
				{
					address: _address,
					city: city.long_name,
					state: state.long_name,
					zip: postal_code.long_name,
					street_address: _address,
				}
			);
			return;
		}

		if (type === 'form') {
			const value = removeEmptyAndNullsFormObject(
				{
					city: city.long_name,
					state: state.long_name,
					zip: postal_code.long_name,
					street_address: _address,
				}
			)
			this.form.patchValue(
				value
			);
		}
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
	 * Closes modal
	 */
	closeModal() {
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

	checkInputs(){
		if (isEmptyObject(this.searchForm.value)) {
			return true;
		  }
		  return false;
	}
	isDisabledSaveContinue() {
		if(this.form.invalid || this.loadSpin) {
			return true;
		} 
		return false;
	}

	contactPersonNameShow(row: any){
		let personname = '';
		if( row.contact_person && row.contact_person.first_name){
			personname += row.contact_person.first_name;
		}

		if( row.contact_person && row.contact_person.middle_name){
			personname += ' ' + row.contact_person.middle_name;
		}

		if( row.contact_person && row.contact_person.last_name){
			personname += ' ' + row.contact_person.last_name;
		}

		return personname ?  personname : 'N/A';
	}

	employerHistoryStats(row) {
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
			this.localStorage.setObject('employerMasterTableList' + this.storageData.getUserId(), data);
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
		this.employerListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.employerListTable._internalColumns.sort(function (a, b) {
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
