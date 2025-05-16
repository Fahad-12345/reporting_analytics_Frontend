import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { AclService } from '@appDir/shared/services/acl.service';
import { HttpService } from '@appDir/front-desk/fd_shared/services/http.service';
import { Page } from '@appDir/front-desk/models/page';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { NgbModalOptions, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { AttorneyServiceService } from '../firm/attorney-service.service';
import { Router } from '@angular/router';
import { AttorneyAPIServiceService } from '../../services/attorney-service.service';
import { Subscription } from 'rxjs';
import {
	unSubAllPrevious,
} from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { FirmUrlsEnum } from '../Firm-Urls-enum';
import { ActivatedRoute } from '@angular/router';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { FirmComponent } from '../firm/add-attorney.component';
import { Location } from '@angular/common';
import { checkReactiveFormIsEmpty, isEmptyObject, isObjectEmpty } from '@appDir/shared/utils/utils.helpers';
import { Title } from '@angular/platform-browser';
import { ScrollToConfigOptions, ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
@Component({
	selector: 'app-firm',
	templateUrl: './firm.component.html',
	styleUrls: ['./firm.component.scss']
})
export class FirmListingComponent extends PermissionComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	selection = new SelectionModel<Element>(true, []);
	selecting = new SelectionModel<Element>(true, []);
	allFirms: any[] = [];
	boolValue: boolean = false;
	firmId: number;
	bool: boolean = true;
	firmSearchForm: FormGroup;
	exchangeData: any[] = [];
	firmLocations: any[] = [];
	dropdownSettings = {};
	attorneyAttachFirmForm: FormGroup;
	firmPage: Page;
	totalRows: number;
	totalLocationRows: number;
	public opened = {};
	locationForm: FormGroup;
	modalRef: NgbModalRef;
	firmQueryParams: ParamQuery;
	presentFirmsLocation: any;
	locationParams: ParamQuery;
	allLocationsBYFIrmId = [];
	allFirmData: any;
	totalElements: number;
	listingFirmId: number;
	public loadSpin: boolean = false;
	// showMoreFilters = false;
	isCollapsed = false;
	result = 'No data to display';
	addFirmLocations: any[] = [];
	showform: boolean = false;
	insForm: FormGroup;
	firmIndex: any;
	addbool: any;
	showAddbool: any;
	hideAddButton: boolean = true;
	public id: any;
	singlefirm: any;
	currentPage: number;
	@ViewChild('firm') ChildFirmFormComponent: FirmComponent;
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
		private CanDeactivateModelComponentService: CanDeactivateModelComponentService,
		private location: Location,
		private _scrollToService: ScrollToService
	) {
		super(aclService, router, _route, requestService, titleService);
		this.firmPage = new Page();
		this.firmPage.pageNumber = 0;
		this.firmPage.size = 10;
	}

	ngOnInit() {
		this.setTitle();
		this.firmSearchForm = this.fb.group({
			name: [''],
			phone: [''],
			location: [''],
			fax: [''],
			email: [''],
			street_address: [''],
			city: [''],
			state: [''],
			zip: ['']
			// pageNumber: [this.page.pageNumber],
			// pageSize: [this.page.size],
		});
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.firmSearchForm.patchValue(params);
				this.firmPage.size = parseInt(params.per_page) || 10;
				this.firmPage.pageNumber = parseInt(params.page) || 1;
				this.currentPage = this.firmPage.pageNumber;
				// setTimeout(() => {
				// 	this.currentPage = this.firmPage.pageNumber;
				// },1000);
			}),
		);
		this.setFirms({ offset: this.firmPage.pageNumber - 1 || 0 });
		this.locationForm = this.initializationLocationForm();
		this.dropdownSettings = {
			singleSelection: false,
			idField: 'id',
			textField: 'name',
			selectAllText: 'Select All',
			unSelectAllText: 'UnSelect All',
			itemsShowLimit: 1,
			allowSearchFilter: true,
		};
	}
	addLocation(firm_locations, firms) {
		this.presentFirmsLocation = firms.firm_locations;
		this.firmId = firms.id;
		//this.locationForm.reset();
		// this.initializationLocationForm();
		this.locationModalOpen(firm_locations);
	}
	setFirms(pageInfo, extendreord?) {
		if (extendreord) { this.firmIndex = null }
		this.opened = {};
		this.selection.clear();
		this.firmPage.pageNumber = pageInfo.offset;
		// this.currentPage=this.firmPage.pageNumber;
		const pageNumber = this.firmPage.pageNumber + 1;

		const filters = checkReactiveFormIsEmpty(this.firmSearchForm);
		this.firmQueryParams = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: this.firmPage.size || 10,
			page: pageNumber,
			pagination: true,
		};

		// if (Object.entries(this.firmSearchForm.value).length != 0) {
		const name = this.firmSearchForm.value.name;
		const phone = this.firmSearchForm.value.phone;
		const location = this.firmSearchForm.value.location;
		const fax = this.firmSearchForm.value.fax;
		const email = this.firmSearchForm.value.email;
		const street_address = this.firmSearchForm.value.street_address;
		const city = this.firmSearchForm.value.city;
		const state = this.firmSearchForm.value.state;
		const zip = this.firmSearchForm.value.zip;
		let per_page = this.firmPage.size;
		// this.router.navigate([`/front-desk/masters/billing/attorney/firm`], {
		// 	queryParams: { name: name, phone: phone, location: location, fax: fax, email: email },
		// });
		let queryParams = { name, phone, location, street_address, fax, email, city, state, zip, per_page, page: pageNumber }
		this.addUrlQueryParams(queryParams);
		// }

		if (this.firmSearchForm.value.name && this.firmSearchForm.value.location) {
			this.opened = {};
			// this.requestServiceURL({ offset: 0 });
		}
		this.getAllFirms({ ...this.firmQueryParams, ...filters });
	}
	addUrlQueryParams(params?) {
		this.location.replaceState(
			this.router.createUrlTree([], { queryParams: params, }).toString()
		);
	}
	attachAttorneyFirmForm() {
		return this.fb.group({
			id: [''],
			first_name: ['', Validators.required],
			middle_name: [''],
			last_name: [''],
			street_address: [''],
			suit_floor: [''],
			city: [''],
			state: [''],
			zip: [''],
			contact_person_first_name: [''],
			contact_person_middle_name: [''],
			contact_person_last_name: [''],
			phone_no: [''],
			ext: [''],
			cell_no: [''],
			fax: [''],
			email: ['', [Validators.email]],
			comments: [''],
			firm_location_ids: ['', Validators.required],
		});
	}
	resetFilter() {
		// this.router.navigate([`/front-desk/masters/billing/attorney/firm`]);
		this.addUrlQueryParams();
		this.opened = {};
		this.firmSearchForm.reset();
		this.firmIndex = null;
		this.addbool = null;
		this.setFirms({ offset: 0 });
	}
	initializationLocationForm() {
		return this.fb.group({
			is_main: [''],
			location_name: ['', Validators.required],
			street_address: [''],
			apartment_suite: [''],
			city: [''],
			state: [''],
			zip: [''],
			phone: [''],
			cell: [''],
			ext: [''],
			fax: [''],
			email: ['', Validators.email],
			contact_person_first_name: [''],
			contact_person_middle_name: [''],
			contact_person_last_name: [''],
			contact_person_phone: [''],
			contact_person_cell: [''],
			contact_person_ext: [''],
			contact_person_fax: [''],
			contact_person_email: ['', Validators.email],
			comments: [''],
			firm_id: [''],
			id: [''],
		});
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
				// .sendRequest(FirmUrlsEnum.Firm_list_GET, 'GET', REQUEST_SERVERS.fd_api_url, queryParams)
				.sendRequest(FirmUrlsEnum.AllFirms_list_GET, 'GET', REQUEST_SERVERS.fd_api_url, queryParams)
				.subscribe(
					(resp: any) => {
						if (resp['status']) {
							this.loadSpin = false;
							this.allFirms =
								resp['result'] && resp['result']['data'] ? resp['result']['data'] : [];
							this.firmPage.totalElements = resp['result']['total'];
							if (this.allFirms.length > 0) {
								if (this.firmIndex || this.firmIndex == 0) {
									setTimeout(() => {
										this.toggle(this.firmIndex, this.allFirms[this.firmIndex]);
									}, 100);
								}
								else if (this.addbool) {
									setTimeout(() => {
										// this.toggle(0, this.allFirms[0]);
									}, 100);

								}
							}

							// console.log('new this.allFirms', this.allFirms);
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

	pageChanged(event, param?) {
		this.selection.clear();
		if (param == 'firm') {
			this.setFirms({ offset: 0 });
		}
		else {
			event.itemsPerPage = this.firmPage.size;
			this.setFirms({ offset: event.page - 1 });

		}

	}
	stringfy(obj) {
		return JSON.stringify(obj);
	}

	PageLimit($num, firm) {
		firm['pageLimit'] = Number($num);
	}

	toggle(id, firms): void {
		this.firmIndex = id;
		this.singlefirm = firms;
		this.opened[id] ?
			null : this.requestServiceURL({ offset: 0 }, firms);
		// this.getLocationsByFirmId(obj, firms)
		if (this.isOpenedUndefined(id)) {
			this.opened[id] = false;
		}
		var that = this;
		// setTimeout(function () {
		that.opened[id] = !that.opened[id];
		// }, 100);
	}

	getLocationsByFirmId(locationParams, firms?) {
		this.requestService.sendRequest(
			FirmUrlsEnum.Location_list_ByFIrmId_GET,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			locationParams ,
		).subscribe((res: any) => {
			if (res.status) {
				// console.log('loc', res);
				this.allLocationsBYFIrmId = res.result ? res.result.data : [];
				firms.firm_locations = [...this.allLocationsBYFIrmId];
				this.allLocationsBYFIrmId = firms.firm_locations;
				firms['totalElements'] = res.result.total;
				this.allFirms[this.firmIndex] = firms;
				// firms = makeDeepCopyObject(firms);

			}
		});
	}

	requestServiceURL(pageInfo, firms?) {
		if (firms.id) {
			this.listingFirmId = firms.id;
		}
		// this.page.pageNumber = pageInfo.offset;
		// const pageNumber = this.page.pageNumber + 1;
		// let pageNumber=pageInfo.offset;
		const pageNumber = pageInfo.offset + 1;
		if (this.firmSearchForm.value.location) {
			delete this.firmSearchForm.value.name;
			delete this.firmSearchForm.value.phone;
			delete this.firmSearchForm.value.fax;
			delete this.firmSearchForm.value.email;
		}
		const filters = checkReactiveFormIsEmpty(this.firmSearchForm);
		this.locationParams = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: this.firmPage.size,
			page: pageNumber,
			pagination: true,
			firm_id: firms.id
		};
		this.getLocationsByFirmId({ ...this.locationParams, ...filters }, firms);
	}

	icon(id): string {
		if (this.isOpenedUndefined(id)) {
			return 'plus';
		}

		return this.opened[id] ? 'minus' : 'plus';
	}

	hidden(id) {
		// return this.opened.includes(id)
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
	updateAttorney(firms, index?, callAPI?) {
		// this.attorneyService.updateAttorney(firms);
		//this.router.navigate(['front-desk/masters/billing/attorney/edit' + '/' + `${firms.id}`]);
		this.hideAddButton = true;
		this.addbool = false;
		this.firmIndex = index;
		if (this.showform) {
			let childdata = this;
			this.insForm = childdata.ChildFirmFormComponent.addAttornetForm;
			if (this.insForm.dirty && this.insForm.touched) {
				this.CanDeactivateModelComponentService.canDeactivate().then(res => {
					if (res) {
						this.forUpdateChanges(firms, index);
					}
					else {
						return true;
					}
				});
			}
			else {
				this.forUpdateChanges(firms, index, callAPI);
			}
		}
		else {
			this.forUpdateChanges(firms, index, callAPI);
		}
	}

	public triggerScrollTo(target) {
		const config: ScrollToConfigOptions = {
			// container: 'ngx-scroll-to',
			target: target,
			duration: 200,
			easing: 'easeOutElastic',
			offset: 0
		};
		setTimeout(() => {
			this._scrollToService.scrollTo(config);
		}, 100);
	}
	/**
 * setup to update Insurance record
 */
	forUpdateChanges(firms, index?, callAPI?) {
		this.id = firms ? firms.id : null;
		this.attorneyService.updateAttorney(firms);
		if (this.showform) {
			this.showform = !this.showform;
			setTimeout(() => {
				this.showform = !this.showform;
			}, 100);
		}
		else { this.showform = !this.showform; }
		this.closeAlltoggle(index)
		// console.log(callAPI);
		// (!callAPI || !this.opened[index]) ? this.toggle(index, firms) : null;
		this.toggle(index, firms);
	}
	// getLocationWithoutMainLocation(firm: AttorneyFirms) {
	// 	return firm.firm_locations.filter((location) => {
	// 		return !location.is_main || location.is_main == (0 as any);
	// 	});
	// }
	public handleAddressChange(address: Address, type?: string) {
		const street_number = this.fdService.getComponentByType(address, 'street_number');
		const route = this.fdService.getComponentByType(address, 'route');
		const city = this.fdService.getComponentByType(address, 'locality');
		const state = this.fdService.getComponentByType(address, 'administrative_area_level_1');
		const postal_code = this.fdService.getComponentByType(address, 'postal_code');
		// const lat = address.geometry.location.lat();
		// const lng = address.geometry.location.lng();
		const _address = street_number.long_name + ' ' + route.long_name;

		if (type === 'location') {
			this.locationForm.patchValue({
				street_address: _address,
				city: city.long_name,
				state: state.long_name,
				zip: postal_code.long_name,
			});
			return;
		}

		if (type === 'attorney') {
			this.attorneyAttachFirmForm.patchValue({
				street_address: _address,
				city: city.long_name,
				state: state.long_name,
				zip: postal_code.long_name,
			});
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
		if (row.is_main == 1) {
			row.is_main = true;
		} else {
			row.is_main = false;
		}
		this.locationForm.patchValue({
			id: row.id,
			is_main: row.is_main,
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
	
	deleteOneLocation(id: number) {
		const arr = [];
		arr[0] = id;
		const temp = {
			ids: arr,
		};
		this.customDiallogService.confirm('Delete Confirmation?', `Are you sure you want to delete?`,'Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				this.loadSpin = true;
				this.requestService
					.sendRequest(
						FirmUrlsEnum.Location_list_DELETE,
						'Post',
						REQUEST_SERVERS.fd_api_url,
						temp,
					)
					.subscribe(
						(resp) => {
							if (resp['status']) {
								this.loadSpin = false;
								// this.getAllFirms();
								this.setFirms({ offset: 0 });
								this.toastrService.success('Successfully deleted', 'Success');
							}
						},
						(err) => {
							this.loadSpin = false;
							// const str = parseHttpErrorResponseObject(err.error.message);
							// this.toastrService.error(str);
						},
					);
			}
		})
		.catch();

	}

	deleteMultipleLocations(firms) {
		var filtered_arr = firms.firm_locations.filter((location) => {
			return location['checked'];
		});

		var arr = [];
		filtered_arr.forEach((location) => {
			arr.push(location.id);
		});
		const temp = {
			ids: arr,
		};

		this.customDiallogService.confirm('ALL Delete Confirmation', 'Are you sure you want to delete all records?','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				this.requestService
							.sendRequest(
								FirmUrlsEnum.Location_list_DELETE,
								'Post',
								REQUEST_SERVERS.fd_api_url,
								temp,
							)
							.subscribe(
								(response) => {
									if (response['status']) {
										// this.getAllFirms();
										this.setFirms({ offset: 0 });
										this.selecting.clear();
										this.toastrService.success('Successfully deleted', 'Success');
									}
								},
								(err) => {
									// const str = parseHttpErrorResponseObject(err.error.message);
									// this.toastrService.error(str);
								},
							);
			}
		})
		.catch();

	
	}
	deletingFirm(temp) {
		this.customDiallogService.confirm('ALL Delete Confirmation', 'Are you sure you want to delete all records?','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				this.http.post('delete-firms', temp).subscribe(
					(resp) => {
						if (resp['status']) {
							// this.getAllFirms();
							this.setFirms({ offset: 0 });
							this.toastrService.success('Successfully deleted', 'Success');
							this.selection.clear();
						}
					},
					(err) => {
						// const str = parseHttpErrorResponseObject(err.error.message);
						// this.toastrService.error(str);
					},
				);	
			}
		})
		.catch();
	}

	deleteMultipleFirm() {
		const selected = this.selection.selected;
		const arr: any = [];
		for (let p = 0; p < selected.length; p++) {
			arr[p] = selected[p].id;
		}
		const temp = {
			ids: arr,
		};
		this.deletingFirm(temp);
	}
	addAttorneyFirm(attorney) {
		this.attorneyAttachFirmForm.reset();
		this.locationModalOpen(attorney);
	}
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}
	closeModal() {
		this.locationForm.reset();
		this.modalRef.close();
	}
	firmPageLimit($num, $event) {
		this.firmPage.size = Number($num);
		this.selection.clear();
		// this.setPage({ offset: 0 });
		this.pageChanged($event, 'firm')
	}

	setPrimaryLocation(event) {
		// console.log('event', event.target.checked);
		// this.locationForm.value.is_main = !this.locationForm.value.is_main;
		this.locationForm.value.is_main = event.target.checked;
		if (this.locationForm.value.is_main) {
			this.customDiallogService.confirm('Set Primary Location', 'You want to change primary location?','Yes','No')
			.then((confirmed) => {
				
				if (confirmed){
					this.locationForm.value.is_main = event.target.checked;
						// this.setLocationsOfFirm(event.target.checked)
					} else {
						event.target.checked = false;
						this.locationForm.value.is_main = event.target.checked;
					}
			})
			.catch();
		}
	}


	// toggleShow = () => {
	// 	this.showMoreFilters = !this.showMoreFilters;
	// };

	// setLocationsOfFirm(value) {
	// 	this.presentFirmsLocation
	// 	// console.log('this.allFirms', this.firmsLoc);

	// 	// // const firms = this.allFirms;
	// 	// let index;
	// 	// if(value == true){
	// 	// 	for (index in this.firmsLoc.firm_locations) {
	// 	// 		this.firmsLoc.firm_locations[index].is_main = 1
	// 	// 	}
	// 	// }else{
	// 	// 	for (index in this.firmsLoc.firm_locations) {
	// 	// 		this.firmsLoc.firm_locations[index].is_main = 0
	// 	// 	}
	// 	// }

	// 	// console.log('aaa',  this.firmsLoc.firm_locations);
	// }

	checkboxData(event) {
	}

	firmLocationValue(event, id) {
		event.id ? this.updateLocation(event, id) : this.addNewLocation(event, id);
	}

	addNewLocation(Formvalue, id) {
		Formvalue.firm_id = id;
		this.subscription.push(
			this.requestService.sendRequest(
				FirmUrlsEnum.Location_list_POST,
				'POST',
				REQUEST_SERVERS.fd_api_url,
				Formvalue
			)
				.subscribe(
					(resp: any) => {
						if (resp.status || resp.status === 200) {
							this.getAllLocations({ offset: 0 }, id);
							this.toastrService.success('Successfully Added', 'Success');
							this.modalService.dismissAll();
							this.getDataFromChild();
						}
					},
					(err: any) => {
						// this.loadSpin = false;
						// const str = parseHttpErrorResponseObject(err.error.message);
						// this.toastrService.error(str);
					},
				),
		);
	}

	getAllLocations(pageInfo, id?: number, dropdown?: string) {
		if (dropdown == 'dropdown') {
			this.firmPage.size = pageInfo.pageSize;
			pageInfo.offset = 0;
		}
		// this.firmPage.pageNumber = pageInfo.offset;
		// const pageNumber = this.firmPage.pageNumber + 1;
		// let locationPageNumber = pageInfo.offset;
		const pageNumber = pageInfo.offset + 1;
		if (id) {
			const filters = checkReactiveFormIsEmpty(null);
			this.locationParams = {
				filter: !isObjectEmpty(filters),
				order: OrderEnum.ASC,
				per_page: this.firmPage.size || 10,
				page: pageNumber,
				pagination: true,
				firm_id: id
			};
			this.getLocationsByFirm({ ...this.locationParams, ...filters }, id)
		}
	}

	getLocationsByFirm(params, id) {
		this.requestService.sendRequest(
			FirmUrlsEnum.Location_list_ByFIrmId_GET,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			params ,
		).subscribe((res: any) => {
			if (res.status || res.status === 200) {
				let location = res.result ? res.result.data : []
				this.allFirms.map(firm => {
					if (firm.id == id) {
						firm.firm_locations = location;
						firm.totalElements = res.result.total;
					}
				});
			}
		});
	}

	updateLocation(Formvalue, id) {
		this.requestService.sendRequest(
			FirmUrlsEnum.Location_list_PUT,
			'POST',
			REQUEST_SERVERS.fd_api_url,
			Formvalue
		)
			.subscribe((resp: any) => {
				if (resp['status']) {
					this.getAllLocations({ offset: 0 }, id);
					this.toastrService.success('Successfully updated', 'Success');
					this.boolValue = false;
					this.modalService.dismissAll();
					this.getDataFromChild();
				}
			});
	}

	locationPagination(event) {
		this.getAllLocations(event, event.id);
	}

	dropdownSelectedValue(event) {
		this.getAllLocations(event, event.id, 'dropdown');
	}
	/**
	 * confirmation popup before leaving add form
	 */
	addFirmModal() {
		if (this.showform) {
			let childdata = this;
			this.insForm = childdata.ChildFirmFormComponent.addAttornetForm;
			if (this.insForm.dirty && this.insForm.touched) {
				this.CanDeactivateModelComponentService.canDeactivate().then(res => {
					if (res) {
						this.forAddChanges();
					}
					else { return true; }
				});
			}
			else {
				this.forAddChanges();
			}
		}
		else {
			this.forAddChanges();
		}
	}
	/**
	 * setup to add new Record for firm
	 */
	forAddChanges() {

		this.hideAddButton = false;
		this.id = null;
		this.closeAlltoggle();
		if (this.showform) {
			this.showform = !this.showform;
			setTimeout(() => {
				this.showform = !this.showform;
			}, 100);
		}
		else { this.showform = !this.showform; }
	}
	/**
 * close all extended records
 */
	closeAlltoggle(index?) {
		// this.opened.forEach(element => {
		// 	element['isOpen'] = false;
		// });
		this.opened = {};
		// for (var key of Object.keys(this.opened)) {
		// 	(index == key) ? this.opened[index] = true : this.opened[index] = false;
		// }

	}

	/**
	 * to check the child form changes
	 */
	ngAfterViewInit() {
		if (this.showform) {
			this.insForm = this.ChildFirmFormComponent.addAttornetForm;
		}
	}
	/**
	 * get data from child Component
	 * @param $event 
	 */
	getDataFromChild($event?) {
		if ($event == 'Add') { this.addbool = true; this.firmIndex = null; this.currentPage=1;  }
		if ($event == 'cancel') { this.firmIndex = null; }
		this.hideAddButton = true;
		this.showform = false;
		// this.firmIndex = null;
		this.closeAlltoggle();
		this.setFirms({ offset: $event == 'Add'?0:this.firmPage.pageNumber });
	}

	checkInputs(){
		if (isEmptyObject(this.firmSearchForm.value)) {
			return true;
		  }
		  return false;
	}
}
