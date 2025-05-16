import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { AclService } from '@appDir/shared/services/acl.service';
import { HttpService } from '@appDir/front-desk/fd_shared/services/http.service';
import { Page } from '@appDir/front-desk/models/page';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { NgbModalOptions, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { AttorneyServiceService } from '../../firm/firm/attorney-service.service';
import { Router } from '@angular/router';
import { Attorney } from '../../attorney';
import { AttorneyAPIServiceService } from '../../services/attorney-service.service';
import { Subscription } from 'rxjs';
import { environment } from 'environments/environment';
import {
	unSubAllPrevious,
} from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { OrderEnum, ParamQuery, GetLocationsToAttachAttorneyQueryI } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { AttorneyUrlsEnum } from '../Attorney-Urls-enum';
import { FirmUrlsEnum } from '../../firm/Firm-Urls-enum';
import { AttorneyFirms } from '../../firm/firm/attorney';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Location, LocationStrategy } from '@angular/common';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import {allStatesList, checkReactiveFormIsEmpty, getIdsFromArray, isEmptyObject, isObjectEmpty, makeDeepCopyArray, removeEmptyAndNullsFormObject, statesList, touchAllFields, whitespaceFormValidation } from '@appDir/shared/utils/utils.helpers';
import { ZipFormatMessages } from '@appDir/shared/dynamic-form/constants/ZipFormatMessages.enum';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { CustomFormValidators } from '@appDir/shared/customFormValidator/customFormValidator';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';

@Component({
	selector: 'app-attorney',
	templateUrl: './attorney.component.html',
	styleUrls: ['./attorney.component.scss'],
})
export class AttorneyComponent extends PermissionComponent implements OnInit, OnDestroy {
	isCollapsed = false;
	environment= environment;
	subscription: Subscription[] = [];
	bool: boolean = true;
	attorneyBtnDisable: boolean = false;
	attorneyPage = new Page();
	is_reset_button_disable = true;
	totalRows: number;
	totalLocationRows: number;
	selection = new SelectionModel<Element>(true, []);
	selecting = new SelectionModel<Element>(true, []);
	selectionAttorney = new SelectionModel<Attorney>(true, []);
	attorneyRows: number;
	states = []
	allFirms: any[] = [];
	page: Page;
	loadSpin: boolean = false;
	public opened = {};
	locationForm: FormGroup;
	modalRef: NgbModalRef;
	boolValue: boolean = false;
	firmId: number;
	attorneyForm: FormGroup;
	firmSearchForm: FormGroup;
	exchangeData: any[] = [];
	firmLocations: any[] = [];
	dropdownSettings = {};
	attorneyAttachFirmForm: FormGroup;
	attorney: Attorney;
	allAttorney: Attorney[];
	fullName: string;
	currentTab = 'firm';
	queryParams: ParamQuery;
	firmQueryParams: ParamQuery;
	attorneyFilterForm: FormGroup;
	zipFormatMessage=ZipFormatMessages;
	allStates=[];
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('attorneyList') attorneyListTable: DatatableComponent;
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
	attorneyListingTable: any;


	constructor(	
		private customDiallogService : CustomDiallogService,
		aclService: AclService,
		private http: HttpService,
		private fb: FormBuilder,
		private fdService: FDServices,
		private toastrService: ToastrService,
		private modalService: NgbModal,
		private attorneyService: AttorneyServiceService,
		router: Router,
		private attorneyAPIService: AttorneyAPIServiceService,
		protected requestService: RequestService,
		private _route: ActivatedRoute,
		titleService: Title,
		public datePipeService:DatePipeFormatService,
		private location: Location, private locationStratgy: LocationStrategy,
		private CanDeactivateModelComponentService: CanDeactivateModelComponentService,
		protected storageData: StorageData,
		private localStorage: LocalStorage
	) {
		super(aclService, router, _route, requestService, titleService);
		this.page = new Page();
		this.page.pageNumber = 0;
		this.page.size = 10;

		this.attorneyPage = new Page();
		this.attorneyPage.size = 10;
		this.attorneyPage.pageNumber = 0;

		// getting firm locations that we want to attach with attorney
		this.getLocationsToAttachAttorney();
		this.initAttorneyFilterForm();
		this.locationForm = this.initializationLocationForm();

		this.attorneyForm = this.initializeAttorney();
		// form that is we attaching with firms
		this.attorneyAttachFirmForm = this.attachAttorneyFirmForm();
	}

	onTabChange(visibleTab) {
		let self = this;
		setTimeout(function () {
			self.currentTab = visibleTab;
		}, 200);
	}
	ngOnInit() {
		this.states = statesList;
		this.allStates=allStatesList;
		this.setTitle();
		this.attorneyService.isEdit = false;
		

		this.dropdownSettings = {
			singleSelection: false,
			idField: 'id',
			textField: 'name',
			selectAllText: 'Select All',
			unSelectAllText: 'UnSelect All',
			itemsShowLimit: 1,
			allowSearchFilter: true,
		};
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.attorneyFilterForm.patchValue(params);
				this.page.pageNumber = parseInt(params.page) || 1;
				this.page.size = parseInt(params.per_page) || 10;
				this.attorneyPage.pageNumber = parseInt(params.page) || 1;
				this.attorneyPage.size = parseInt(params.per_page) || 10;
			}),
		);
		this.setPage({ offset: this.page.pageNumber - 1 || 0 });
		this.attorneyListingTable = this.localStorage.getObject('attorneyMasterTableList' + this.storageData.getUserId());
	}

	ngAfterViewInit() {
		if (this.attorneyListTable?._internalColumns) {
			this.cols = makeDeepCopyArray([...this.attorneyListTable._internalColumns]);
			this.cols.forEach(element => {
				if(this.attorneyListingTable?.length) {
					let obj = this.attorneyListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.attorneyListingTable?.length) {
				const nameToIndexMap = {};
				this.attorneyListingTable.forEach((item, index) => {
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

	selectedState:string='';
	stateChange(event)
	{
		this.selectedState=event.fullName;		
	}

	setPage(pageInfo) {
		// let pageNum;
		this.selection.clear();
		// pageNum = pageInfo.offset;
		this.attorneyPage.pageNumber = pageInfo.offset;
		this.page.pageNumber = pageInfo.offset;
		const pageNumber = this.attorneyPage.pageNumber + 1;
		const filters = checkReactiveFormIsEmpty(this.attorneyFilterForm);
		this.queryParams = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: this.attorneyPage.size,
			page: pageNumber,
			pagination: true,
		};
		let per_page = this.attorneyPage.size;
		let queryparam = { per_page, page: pageNumber }
		this.addUrlQueryParams({ ...filters, ...queryparam });
		this.getAllAttorney({ ...this.queryParams, ...filters });
	}
	addUrlQueryParams(params?) {
		this.location.replaceState(
			this.router.createUrlTree([], { queryParams: params, }).toString()
		);
	}
	attachAttorneyFirmForm() {
		return this.fb.group({
			id: [''],
			first_name: ['', [Validators.required, whitespaceFormValidation()]],
			middle_name: [''],
			last_name: ['', [Validators.required, whitespaceFormValidation()]],
			street_address: ['',[Validators.required,CustomFormValidators.hasOnlyWhitespace]],
			suit_floor: [''],
			city: ['',[Validators.required,CustomFormValidators.hasOnlyWhitespace]],
			state: ['',Validators.required],
			// zip: ['', Validators.minLength(5)],
			zip: ['', [Validators.required,Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')]],
			phone_no: ['',Validators.minLength(10)],
			ext: [''],
			cell_no: ['',Validators.minLength(10)],
			fax: ['',Validators.minLength(10)],
			email: ['', [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
			comments: [''],
			firm_ids: ['', [Validators.required, whitespaceFormValidation()]],
			'contact_person': this.fb.group({
				first_name: [''],
				last_name: [''],
				middle_name: [''],
				phone_no: ['',[Validators.minLength(10)]],
				extension: [''],
				cell_no: ['',[Validators.minLength(10)]],
				fax: ['',[Validators.minLength(10)]],
				email: ['', [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
			})
		});
	}


	getLocationsToAttachAttorney() {
		const paramQuery: GetLocationsToAttachAttorneyQueryI = {
			firm_dropdown: true
		};
		this.subscription.push(
			// this.http.get('get-firm-locations-with-firm-name').subscribe(
			// this.http.get('get_firm_locations_with_firm_name').subscribe(
			// this.http.get('all_firms').subscribe(

			this.requestService.sendRequest(
				AttorneyUrlsEnum.attorney_dropDownList_GET,
				'GET',
				REQUEST_SERVERS.fd_api_url,
				{
					...paramQuery
				}
			).subscribe(
				(resp: any) => {
					if (resp['status'] || resp['status'] === 200) {
						// this.firmLocations = resp['data'];
						this.firmLocations = resp.result.data;
					}
				},
				(err) => {
					// const str = parseHttpErrorResponseObject(err.error.message);
					// this.toastrService.error('something went wrong');
				},
			),
		);
	}


	initAttorneyFilterForm() {
		this.attorneyFilterForm = this.fb.group({
			firm_name: [''],
			phone_no: [''],
			name: [''],
			email: ['', [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
			fax: ['']
			// address: ['']
			// pageSize: [this.page.size],
			// pageNumber: [this.page.pageNumber],
		});
	}
	resetAttorneyFilters() {
		this.attorneyFilterForm.reset();
		this.selection.clear();
		this.setPage({ offset: 0 });
	}



	initializationLocationForm() {
		return this.fb.group({
			location_name: ['', Validators.required],
			street_address: [''],
			apartment_suite: [''],
			city: [''],
			state: [''],
			zip: ['',[Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')]],
			phone: [''],
			cell: [''],
			ext: [''],
			fax: [''],
			email: ['', [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
			contact_person_first_name: [''],
			contact_person_middle_name: [''],
			contact_person_last_name: [''],
			contact_person_phone: [''],
			contact_person_cell: [''],
			contact_person_ext: [''],
			contact_person_fax: [''],
			contact_person_email: ['', [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
			comments: [''],
			firm_id: [''],
			id: [''],
		},{ updateOn: 'blur' } );
	}

	plusShown() {
		this.bool = !this.bool;
	}
	selectAllFirmLocations(event, firm) {
		firm.firm_locations.forEach((location) => {
			location['checked'] = event.checked;
		});
	}

	checkLocation(event, location) {
		location['checked'] = event.checked;
	}

	getCheckedLocations(firm) {
		if (!firm.firm_locations || firm.firm_locations.length == 0) {
			return [];
		}
		return firm.firm_locations.filter((location) => {
			return location['checked'];
		});
	}

	minusShown() {
		this.bool = !this.bool;
	}

	// for inner locations against one firm
	isAllSelectedLocations(length, loc) {
		this.totalLocationRows = length;
		const numSelected = this.selecting.selected.length;
		const numRows = this.totalLocationRows;
		return numSelected === numRows;
	}
	masterLocationsToggle(length, loc) {
		this.isAllSelectedLocations(length, loc)
			? this.selecting.clear()
			: loc.slice(0, this.totalLocationRows).forEach((row) => this.selecting.select(row));
	}

	// for outer firms displaying
	isAllSelected() {
		this.totalRows = this.allFirms.length;
		const numSelected = this.selection.selected.length;
		const numRows = this.totalRows;
		return numSelected === numRows;
	}
	masterToggle() {
		this.isAllSelected()
			? this.selection.clear()
			: this.allFirms.slice(0, this.totalRows).forEach((row) => this.selection.select(row));
	}

	getAllFirms(queryParams) {
		this.loadSpin = true;
		this.subscription.push(
			// this.http.get('all-firms-with-locations')
			this.requestService
				.sendRequest(FirmUrlsEnum.Firm_list_GET, 'GET', REQUEST_SERVERS.fd_api_url, queryParams)
				.subscribe(
					(resp) => {
						if (resp['status']) {
							this.loadSpin = false;
							this.allFirms =
								resp['result'] && resp['result']['data'] ? resp['result']['data'] : [];
							this.page.totalElements = resp['result']['total'];
							// this.page.totalPages = this.page.totalElements / this.page.size;
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


	stringfy(obj) {
		return JSON.stringify(obj);
	}

	PageLimit($num, firm) {
		firm['pageLimit'] = Number($num);
	}
	toggle(id): void {
		if (this.isOpenedUndefined(id)) {
			this.opened[id] = false;
		}
		var that = this;
		setTimeout(function () {
			that.opened[id] = !that.opened[id];
		}, 300);
	}

	icon(id): string {
		if (this.isOpenedUndefined(id)) {
			return 'plus';
		}

		return this.opened[id] ? 'minus' : 'plus';
	}

	hidden(id) {
		if (this.isOpenedUndefined(id)) {
			return true;
		}
		return !this.opened[id];
	}

	isOpenedUndefined(id): boolean {
		return this.opened[id] === undefined;
	}

	iconClasses(i) {
		const classes = {
			btn: true,
			'slide-btn': true,
		};
		this.opened[i] ? (classes['btn-success'] = true) : (classes['btn-primary'] = true);
		return classes;
	}

	public handleAddressChange(address: Address, type?: string) {
		const street_number = this.fdService.getComponentByType(address, 'street_number');
		const route = this.fdService.getComponentByType(address, 'route');
		const city = this.fdService.getComponentByType(address, 'locality');
		const state = this.fdService.getComponentByType(address, 'administrative_area_level_1');
		const postal_code = this.fdService.getComponentByType(address, 'postal_code');
		// const lat = address.geometry.location.lat();
		// const lng = address.geometry.location.lng();
		const _address = (street_number.long_name ? street_number.long_name + ' ' : '') + route.long_name;

		if (type === 'location') {
			this.locationForm.patchValue(
				removeEmptyAndNullsFormObject({
					street_address: _address,
					city: city.long_name,
					state: state.long_name,
					zip: postal_code.long_name,
				}));
			return;
		}

		if (type === 'attorney') {
			this.attorneyAttachFirmForm.patchValue(
				removeEmptyAndNullsFormObject({
					street_address: _address,
					city: city.long_name,
					state: state.long_name,
					zip: postal_code.long_name,
				}));
			return;
		}
	}

	locationModalOpen(firm_location) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			size: 'lg',
			windowClass: 'modal_extraDOc',
		};

		this.modalRef = this.modalService.open(firm_location, ngbModalOptions);
	}

	editLocation(firm_locations, rowIndex, row) {
		this.locationForm.patchValue({
			id: row.id,
			location_name: row.location_name,
			street_address: row.street_address,
			apartment_suite: row.apartment_suite,
			city: row.city,
			state: row.state,
			zip: row.zip,
			phone: row.phone,
			cell: row.cell,
			ext: row.ext,
			fax: row.fax,
			email: row.email,
			contact_person_first_name: row.contact_person_first_name,
			contact_person_middle_name: row.contact_person_middle_name,
			contact_person_last_name: row.contact_person_last_name,
			contact_person_phone: row.contact_person_phone,
			contact_person_cell: row.contact_person_cell,
			contact_person_ext: row.contact_person_ext,
			contact_person_fax: row.contact_person_fax,
			contact_person_email: row.contact_person_email,
			comments: row.comments,
		});

		this.boolValue = true;
		this.locationModalOpen(firm_locations);
	}
	convertSsnToNumber(value: string) {
		if (value) {
			value = value + '';
			value = value.replace('-', '');
			value = value.replace('-', '');
			return parseInt(value);
		} else {
			return null;
		}
	}


	updateAttorney(firms) {
		this.attorneyService.updateAttorney(firms);
		this.router.navigate(['front-desk/masters/billing/attorney/add']);
	}

	addLocation(firm_locations, firms) {
		this.firmId = firms.id;
		//this.locationForm.reset();
		// this.initializationLocationForm();
		this.locationModalOpen(firm_locations);
	}


	initializeAttorney() {
		return this.fb.group({
			office_name: [''],
			first_name: [''],
			middle_name: [''],
			last_name: [''],
			cell_no: [''],
			phone_no: [''],
			email: ['', [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
			fax: [''],
			address: [''],
			city: [''],
			state: [''],
			zip: ['',[Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')]],
			gender: [''],
			type: [''],
			contact_name: [''],
			contact_no: [''],
			contact_extension: [''],
			contact_email: ['', [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
			lat: [''],
			lng: [''],
			firmLocationIds: [''],
		}, { updateOn: 'blur' });
	}

	addAttorneyFirm(attorney) {
		this.attorneyBtnDisable = false;
		this.attorneyAttachFirmForm.reset();
		this.locationModalOpen(attorney);
	}

	isEdit: boolean = false;
	onSubmitAttorney(modal, boolAttorney = false) {
		debugger;
		if (!this.attorneyAttachFirmForm.valid) return;
		let array = [];
		this.attorneyBtnDisable = true;
		this.loadSpin = true;
		this.attorneyAttachFirmForm.value.firm_ids.map(firms => {
			// array.push(firms.id);
			array.push(firms);
		});
		if (this.attorneyAttachFirmForm.valid) {
			if (!this.isEdit) {
				this.requestService
					.sendRequest(
						// AttorneyUrlsEnum.Attorney_list_POST,
						AttorneyUrlsEnum.attorney_list_POST,
						'POST',
						REQUEST_SERVERS.fd_api_url,
						this.attorneyAttachFirmForm.value,
					)
					.subscribe(
						(resp) => {
							this.attorneyBtnDisable = false;
						
							if (resp['status'] === 200 || resp['status']) {
								this.loadSpin = false;
								this.modalRef.close();
								this.setPage({ offset: 0 });
								this.attorneyAttachFirmForm.reset();
								this.toastrService.success('Successfully added', 'Success');
								modal.dismiss();
							}
						},
						(err) => {
							this.loadSpin = false;
						
						},
					);
			} else {

				this.requestService
					.sendRequest(
						AttorneyUrlsEnum.attorney_list_PUT,
						'PUT',
						REQUEST_SERVERS.fd_api_url,
						 this.attorneyAttachFirmForm.value,
					)
					.subscribe(
						(resp) => {
							this.attorneyBtnDisable = false;
							if (resp['status'] === 200 || resp['status']) {
								this.loadSpin = false;
								this.modalRef.close();
								this.setPage({ offset: this.attorneyPage.pageNumber ? this.attorneyPage.pageNumber : 0 });
								this.attorneyAttachFirmForm.reset();
								this.toastrService.success('Successfully updated', 'Success');
								this.isEdit = false;
								modal.dismiss();
							}
						},
						(err) => {
							this.loadSpin = false;
						},
					);
			}
			this.attorneyFilterForm.reset()
		}

		if (boolAttorney) {
			this.setPage({ offset: 0 });
			this.attorneyAttachFirmForm.reset();
		}
	}

	resetFilters(){
		this.attorneyFilterForm.reset();
		this.setPage({ offset: 0 });
	}


	getAllAttorney(queryParams) {
		this.loadSpin = true;
		this.subscription.push(
			this.requestService
				.sendRequest(
					AttorneyUrlsEnum.attorney_list_GET,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					queryParams,
				)
				.subscribe(
					(data: any) => {
						if (data.status) {
							this.loadSpin = false;
							this.allAttorney = data.result && data.result.data ? data.result.data : [];
							this.attorneyPage.totalElements = data.result.total;
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

	isAllSelectedAttorney() {
		this.attorneyRows = this.allAttorney.length;
		const numSelected = this.selectionAttorney.selected.length;
		const numRows = this.attorneyRows;
		return numSelected === numRows;
	}
	masterToggleAttorney() {
		this.isAllSelectedAttorney()
			? this.selectionAttorney.clear()
			: this.allAttorney
				.slice(0, this.attorneyRows)
				.forEach((row) => this.selectionAttorney.select(row));
	}

	editAttorneyFirm(attorney, row) {
		this.attorneyAttachFirmForm.patchValue({
			id: row.id,
			first_name: row.first_name,
			middle_name: row.middle_name,
			last_name: row.last_name,
			street_address: row.street_address,
			suit_floor: row.suit_floor,
			city: row.city,
			state: row.state,
			zip: row.zip,
			phone_no: row.phone_no,
			ext: row.ext,
			cell_no: row.cell_no,
			fax: row.fax,
			email: row.email,
			comments: row.comments,
			firm_ids: row.firms.map(m => m.id)
		});


		if (row.contact_person)
			this.attorneyAttachFirmForm.get('contact_person').patchValue(row.contact_person);
		this.isEdit = true;
		this.locationModalOpen(attorney);
		touchAllFields(this.attorneyAttachFirmForm);
	}

	deleteAttorney(id: number) {
	
		// arr[0] = id;
		// let obj = {
		// 	id: arr,
		// };
		let obj = {
			id: id,
		};
		this.customDiallogService.confirm('Delete Confirmation?', 'You want to delete all records?','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				this.http.deleteMultiple('delete_attorney', obj).subscribe((resp) => {
					if (resp['status'] === 200 || resp['status']) {
						this.allAttorney = resp['data'];
						this.setPage({ offset: 0 });
					}
				});
			}
		})
		.catch();
	}

	deleteMultipleAttorney() {
		const selected = this.selectionAttorney.selected;
		const arr: any = [];
		for (let p = 0; p < selected.length; p++) {
			arr[p] = selected[p].id;
		}

		this.customDiallogService.confirm('All Delete Confirmation', 'You want to delete all records?','Yes','No')
		.then((confirmed) => {
			if (confirmed){
				this.http.deleteMultiple('delete_attorney', arr).subscribe((response) => {
					if (response.status === 200 || response.status) {
						this.selectionAttorney.clear();
					}
				});
			}
		})
		.catch();

	}

	AttorneyPageLimit($num) {
		this.attorneyPage.size = Number($num);
		this.setPage({ offset: 0 });
	}

	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}
	onPageChange(page) {
		this.attorneyPage.pageNumber = page + 1;
		this.setPage({ offset: 0 });
	}
	getLocationWithoutMainLocation(firm: AttorneyFirms) {
		return firm.firm_locations.filter((location) => {
			return !location.is_main || location.is_main == (0 as any);
		});
	}

	closeModalDiscard(){
		if (this.attorneyAttachFirmForm.dirty || this.attorneyAttachFirmForm.touched) {
			this.CanDeactivateModelComponentService.canDeactivate().then(res => {
			  if (res) {
				  this.modalRef.dismiss();
				  this.isEdit=!this.isEdit;
				  this.attorneyBtnDisable = false
				// this.resetData();
			  } else {
				return true;
			  }
			});
		  } else {
			  this.closeModal();
		  }
	}
	closeModal() {
		this.locationForm.reset();
		this.modalRef.close();
	}


	// showMoreFilters: Boolean = false;
	// toggleShow = () => {
	// 	this.showMoreFilters = !this.showMoreFilters;
	// }

	checkInputs(){
		if (isEmptyObject(this.attorneyFilterForm.value)) {
			return true;
		  }
		  return false;
	}

	attorneyHistoryStats(row) {
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
			this.localStorage.setObject('attorneyMasterTableList' + this.storageData.getUserId(), data);
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
		this.attorneyListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.attorneyListTable._internalColumns.sort(function (a, b) {
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
