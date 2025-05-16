import { Component, OnInit, OnDestroy, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { ToastrService } from 'ngx-toastr';
import { NgbModalOptions, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SelectionModel } from '@angular/cdk/collections';
import { Page } from '@appDir/front-desk/models/page';
import { AttorneyServiceService } from './attorney-service.service';
import { AttorneyFirms, AttorneyLocation } from './attorney';
import { Router, ActivatedRoute } from '@angular/router';
import {
	unSubAllPrevious,
	parseHttpErrorResponseObject,
} from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Subscription } from 'rxjs';
import { RequestService } from '@appDir/shared/services/request.service';
import { FirmUrlsEnum } from '../Firm-Urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { checkReactiveFormIsEmpty, isObjectEmpty, makeDeepCopyObject, statesList } from '@appDir/shared/utils/utils.helpers';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { Title } from '@angular/platform-browser';
import { AclService } from '@appDir/shared/services/acl.service';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
@Component({
	selector: 'app-add-attorney',
	templateUrl: './add-attorney.component.html',
	styleUrls: ['./add-attorney.component.scss'],
})
export class FirmComponent extends PermissionComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	addAttornetForm: FormGroup;
	firmForm: FormGroup;
	locationForm: FormGroup;
	locading: boolean = false;
	modalRef: NgbModalRef;
	locations: any[] = [];
	selection = new SelectionModel<any>(true, []);
	totalRows: number;
	boolValue: boolean = false;
	index: number;
	page: Page;
	isEdit = false;
	submitText = 'Update';
	submitbtn: string;
	public editAbleAttorney: AttorneyFirms;
	headerText: string;
	locationTitle = 'Add';
	buttonTitle = 'Save & Continue';
	isChecked = false;
	forvalidation = false;
	singleFirmData: any;
	locationTabVisible = false;
	firmId: number;
	loadSpin = false;
	getlocationParams: ParamQuery;
	allLocations: any[] = [];
	totalElements: number;
	locationParams: ParamQuery;
	temporaryLocations: any[] = [];
	tempLocationUpdate: boolean;
	tempIndex: number;
	btnhide: boolean;
	@Input() id: any;
	@Output() childForm = new EventEmitter();
	firmLocationsTable: boolean = true;
	childData = {
		modalOpen: false,
		popupLocation: null,
		popupLocationSubmitText: ''
	};
	states = []
	constructor(
		private fb: FormBuilder,
		aclService: AclService,
		private fdService: FDServices,
		private toastrService: ToastrService,
		private modalService: NgbModal,
		private customDiallogService : CustomDiallogService,
		private attorneyService: AttorneyServiceService,
		router: Router,
		protected requestService: RequestService,
		route: ActivatedRoute,
		titleService: Title,
		private CanDeactivateModelComponentService: CanDeactivateModelComponentService
	) {
		super(aclService, router, route, requestService, titleService);
		this.page = new Page();
		this.page.size = 10;
	}

	ngOnInit() {
		this.setTitle();
		this.states = statesList
		this.addAttornetForm = this.initializationForm();
		this.locationForm = this.initializationLocationForm();
		this.firmId = this.id;
		this.addEditMode();
	}
	ngOnChanges(simpleChanges: SimpleChanges) {
		if (simpleChanges.id) {
			this.firmId = this.id
		}
		this.addEditMode();
	}
	// PROTECT FROM FIRST SPACE ENTER
	handleInput(event) {
		if (event.which === 32 && !this.addAttornetForm.controls.name.value.length)
			event.preventDefault();
	}
	addEditMode() {
		if (this.firmId) {
			this.getFirmDataByID();
			this.isChecked = true;
			this.headerText = 'Update';
			this.submitText = 'Update';
		} else {
			this.headerText = 'Add';
			this.submitbtn = 'Submit';
			this.submitText = 'Save';
			this.locationTabVisible = false;
		}

		this.locationTabVisible == false && this.firmId ? this.requestServiceURL({ offset: 0 }) : null
	}
	openAddLocation() {
		this.childData.modalOpen = true;
		this.childData = makeDeepCopyObject(this.childData);
	}
	getFirmDataByID() {
		this.requestService.sendRequest(
			FirmUrlsEnum.firm_single_ByID_GET + this.firmId,
			'GET',
			REQUEST_SERVERS.fd_api_url
		).subscribe((res: any) => {
			if (res.status || res.status === 200) {
				this.singleFirmData = res.result.data[0];
				this.addAttornetForm.patchValue(this.singleFirmData);
				this.allLocations.length = 1;
				this.submitText = 'Update';
				this.headerText = 'Update';
			}
		});
	}

	initializationForm() {
		return this.fb.group({
			id: [''],
			name: ['', [Validators.required]],
		});
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



	onFirmSubmit() {
		debugger;
		if (this.firmId && this.addAttornetForm.valid) {
			let data = this.allLocations.filter((x) => { x.is_main == true });
			if (data.length < 1 && this.allLocations.length) { this.allLocations[0].is_main = 1; }
			this.loadSpin = true;
			this.requestService.sendRequest(
				FirmUrlsEnum.Firm_list_PUT,
				'PUT',
				REQUEST_SERVERS.fd_api_url,
				this.addAttornetForm.value
			).subscribe((res: any) => {
				if (res.status || res.status === 200) {
					// this.navigateOnAttorney();
					this.loadSpin = false;
					this.addAttornetForm.reset();
					this.toastrService.success('Successfully updated', 'Success');
					this.submitText = 'Save';
					this.allLocations = [];
					this.modalService.dismissAll();
					this.childForm.emit();
				}
			}, (err) => {
				this.loadSpin = false;
				// const str = parseHttpErrorResponseObject(err.error.message);
				// this.toastrService.error(str);
			},

			);
		}
		else {
			if (this.addAttornetForm.valid) {
				delete this.addAttornetForm.value.id;
				let data = this.allLocations.filter((x) => { x.is_main == true });
				if (data.length < 1 && this.allLocations.length) { this.allLocations[0].is_main = 1; }
				this.addAttornetForm.value.locations = this.allLocations;
				this.loadSpin = true;
				this.requestService.sendRequest(
					FirmUrlsEnum.Firm_list_POST,
					'POST',
					REQUEST_SERVERS.fd_api_url,
					this.addAttornetForm.value).subscribe(
						(res: any) => {
							if (res.status || res.status === 200) {
								// this.navigateOnAttorney();
								this.loadSpin = false;
								this.addAttornetForm.reset();
								this.allLocations = [];
								this.childForm.emit('Add');
								this.modalService.dismissAll();
								this.toastrService.success('Successfully added', 'Success');

							}
						}, (err) => {
							this.loadSpin = false;
							console.error(err.error.message.includes('The name has already been taken.'))
							if (err.error.message.includes('The name has already been taken.')) {
								this.childData.popupLocation = makeDeepCopyObject(this.allLocations[0]);
								this.allLocations = []
								this.childData.popupLocationSubmitText = "Save For Later"
								this.childData = makeDeepCopyObject(this.childData)
							}
							// const str = parseHttpErrorResponseObject(err.error.message);
							// this.toastrService.error(str);
						}
					)
			}
		}
	}

	// navigateOnAttorney() {
	// 	this.router.navigate(['front-desk/masters/billing/attorney']);
	// 	this.addAttornetForm.reset();
	// }

	onSubmit() {
		if (this.addAttornetForm.valid) {
			// this.forvalidation = false;
			if (this.isChecked === false) {
				this.addAttornetForm.value.zip = this.convertSsnToNumber(this.addAttornetForm.value.zip);
				this.addAttornetForm.value.phone = this.convertSsnToNumber(
					this.addAttornetForm.value.phone,
				);
				this.addAttornetForm.value.ext = this.convertSsnToNumber(this.addAttornetForm.value.ext);
				this.addAttornetForm.value.cell = this.convertSsnToNumber(this.addAttornetForm.value.cell);
				this.addAttornetForm.value.fax = this.convertSsnToNumber(this.addAttornetForm.value.fax);
				this.addAttornetForm.value.contact_person_phone = this.convertSsnToNumber(
					this.addAttornetForm.value.contact_person_phone,
				);
				this.addAttornetForm.value.contact_person_ext = this.convertSsnToNumber(
					this.addAttornetForm.value.contact_person_ext,
				);
				this.addAttornetForm.value.contact_person_cell = this.convertSsnToNumber(
					this.addAttornetForm.value.contact_person_cell,
				);
				this.addAttornetForm.value.contact_person_fax = this.convertSsnToNumber(
					this.addAttornetForm.value.contact_person_fax,
				);

				// var location: AttorneyLocation = this.addAttornetForm.value

				// var name = location['name']
				var name = this.addAttornetForm.value.name;
				// var id = location['id']
				var id = this.addAttornetForm.value.id;

				// location.is_main = true;
				// delete location['name']
				// delete location['id']

				var formValue = { name: name, id: id, locations: [...this.locations] }

				// const formValue = {
				// 	...this.addAttornetForm.value,
				// 	locations: this.locations,
				// };
				if (formValue.locations.length == 1) {
					formValue.locations[0].is_main = 1;
				}
				// return;
				this.subscription.push(
					this.requestService.sendRequest(FirmUrlsEnum.Firm_list_POST, 'POST', REQUEST_SERVERS.fd_api_url, formValue)
						.subscribe(
							(resp) => {
								if (resp['status']) {
									// this.router.navigate(['front-desk/masters/billing/attorney']);
									this.toastrService.success('Success', 'Firm has been created');
									this.modalService.dismissAll();
									this.addAttornetForm.reset();

								} else {
									// this.toastrService.error(resp['message']);
									const str = parseHttpErrorResponseObject(resp['message']);
									this.toastrService.error(str);
								}
							},
							(err) => {
								// const str = parseHttpErrorResponseObject(err.error.message);
								// this.toastrService.error(str);
							},
						),
				);
			}

			if (this.isChecked === true) {
				var location: AttorneyLocation = this.addAttornetForm.value

				// var name = location['name']
				// var id = location['id']
				var name = this.addAttornetForm.value.name;
				var id = this.addAttornetForm.value.id;
				// delete location['name']


				var formValue = { name: name, id: id, locations: [...this.locations] }

				formValue.name = this.editAbleAttorney.name;
				const addAttornetFormValue = this.addAttornetForm.getRawValue();
				location = addAttornetFormValue;
				// console.log('updating ', this.addAttornetForm.value);
				// console.log('formvalue', formValue);
				// console.log('locations', location)
				// location.name = this.addAttornetForm.value.name;
				// return;
				this.subscription.push(
					this.requestService.sendRequest(FirmUrlsEnum.Location_list_PUT, 'POST', REQUEST_SERVERS.fd_api_url, location)
						.subscribe(
							(resp) => {
								if (resp['status']) {
									this.router.navigate(['front-desk/masters/billing/attorney']);
									this.toastrService.success('Success', 'Firm has been Updated');
									this.addAttornetForm.reset();
									this.submitText = 'Save';
								} else {
									// this.toastrService.error('Error', resp['message']);
									const str = parseHttpErrorResponseObject(resp['message']);
									this.toastrService.error(str);
								}
							},
							(err) => {
								// const str = parseHttpErrorResponseObject(err.error.message);
								// this.toastrService.error(str);
							},
						),
				);
			}
		}
	}

	public handleAddressChange(address: Address, type?: string) {
		const street_number = this.fdService.getComponentByType(address, 'street_number');
		const route = this.fdService.getComponentByType(address, 'route');
		const city = this.fdService.getComponentByType(address, 'locality');
		const state = this.fdService.getComponentByType(address, 'administrative_area_level_1');
		const postal_code = this.fdService.getComponentByType(address, 'postal_code');
		// const lat = address.geometry.location.lat();
		// const lng = address.geometry.location.lng();
		const _address = street_number.long_name + ' ' + route.long_name;
		if (type === 'Firm') {
			this.addAttornetForm.patchValue({
				street_address: _address,
				city: city.long_name,
				state: state.long_name,
				zip: postal_code.long_name,
			});
			return;
		}

		if (type === 'location') {
			this.locationForm.patchValue({
				street_address: _address,
				city: city.long_name,
				state: state.long_name,
				zip: postal_code.long_name,
			});
		}
	}
	locationChange(firm_location) {
		this.locationTitle = 'Add';
		this.buttonTitle = 'Save & Continue';
		this.locationModalOpen(firm_location);
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

	onLocationSubmit(Formvalue) {
		if (this.locationForm.value.is_main == true) {
			this.locationForm.value.is_main = 1;
		} else {
			this.locationForm.value.is_main = 0;
		}
		if (this.locationForm.valid) {
			// this.forvalidation = true;
			this.locationForm.value.zip = this.convertSsnToNumber(this.locationForm.value.zip);
			this.locationForm.value.phone = this.convertSsnToNumber(this.locationForm.value.phone);
			this.locationForm.value.ext = this.convertSsnToNumber(this.locationForm.value.ext);
			this.locationForm.value.cell = this.convertSsnToNumber(this.locationForm.value.cell);
			this.locationForm.value.fax = this.convertSsnToNumber(this.locationForm.value.fax);
			this.locationForm.value.contact_person_phone = this.convertSsnToNumber(
				this.locationForm.value.contact_person_phone,
			);
			this.locationForm.value.contact_person_ext = this.convertSsnToNumber(
				this.locationForm.value.contact_person_ext,
			);
			this.locationForm.value.contact_person_cell = this.convertSsnToNumber(
				this.locationForm.value.contact_person_cell,
			);
			this.locationForm.value.contact_person_fax = this.convertSsnToNumber(
				this.locationForm.value.contact_person_fax,
			);

			if (this.boolValue === false) {

				if (this.isEdit) {
					this.requestService.sendRequest(FirmUrlsEnum.Location_list_POST, 'POST', REQUEST_SERVERS.fd_api_url, { ...this.locationForm.value, firm_id: this.editAbleAttorney.id }).subscribe(data => {
						this.locations = [
							...this.locations,
							{
								...data['result']['data'],
							},
						];
						this.toastrService.success('Location added successfully');
						this.locationForm.reset();
						this.modalRef.close();
					})

				} else {
					this.locations = [
						...this.locations,
						{
							...this.locationForm.value,
						},
					];
					this.toastrService.warning('Location will be saved on submitting the attorney form');
					this.locationForm.reset();
					this.modalRef.close();
				}

			}

			if (this.boolValue === true) {
				const location = this.locations;

				if (this.isEdit) {
					this.requestService.sendRequest(FirmUrlsEnum.Location_list_PUT, 'Post', REQUEST_SERVERS.fd_api_url, this.locationForm.value).subscribe(data => {
						location[this.index] = {
							...data['result']['data']
						};
						this.locations = location;
						this.locations = this.locations.slice();
						this.toastrService.success('Data updated successfully', 'Success');
						this.modalRef.close();
						this.boolValue = false;
					})
				} else {
					location[this.index] = {
						...this.locationForm.value,
					};
					this.locations = location;
					this.locations = this.locations.slice();
					this.toastrService.success('Data updated successfully', 'Success');
					this.modalRef.close();
					this.boolValue = false;
				}

			}
		}
	}

	stringfy(obj) {
		return JSON.stringify(obj);
	}

	isAllSelected() {
		this.totalRows = this.locations.length;
		const numSelected = this.selection.selected.length;
		const numRows = this.totalRows;
		return numSelected === numRows;
	}
	masterToggle() {
		this.isAllSelected()
			? this.selection.clear()
			: this.locations.slice(0, this.totalRows).forEach((row) => this.selection.select(row));
	}

	onEdit(firm_location, rowIndex) {
		this.locationTitle = 'Edit';
		this.buttonTitle = 'Update';
		this.index = rowIndex;
		const location = { ...this.locations[rowIndex] };
		this.locationForm.patchValue({
			is_main: location.is_main,
			id: location.id,
			location_name: location.location_name,
			street_address: location.street_address,
			apartment_suite: location.apartment_suite,
			city: location.city,
			state: location.state,
			zip: location.zip,
			phone: location.phone,
			cell: location.cell,
			ext: location.ext,
			fax: location.fax,
			email: location.email,
			contact_person_first_name: location.contact_person_first_name,
			contact_person_middle_name: location.contact_person_middle_name,
			contact_person_last_name: location.contact_person_last_name,
			contact_person_phone: location.contact_person_phone,
			contact_person_cell: location.contact_person_cell,
			contact_person_ext: location.contact_person_ext,
			contact_person_fax: location.contact_person_fax,
			contact_person_email: location.contact_person_email,
			comments: location.comments,
		});
		this.boolValue = true;
		this.locationModalOpen(firm_location);
	}

	deleteOneLocation(rowIndex) {

		this.customDiallogService.confirm('Delete Confirmation?', `Are you sure you want to delete?`,'Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				var _location = this.locations[this.index]
				this.requestService.sendRequest(FirmUrlsEnum.Location_list_DELETE, 'Post', REQUEST_SERVERS.fd_api_url, { ids: [_location.id] }).subscribe(data => {
					const location = [...this.locations];
					location.splice(rowIndex, 1);
					this.locations = location;
					this.locations = this.locations.slice();
				})
			}
		})
		.catch();
	}

	deleteMultipleLocations() {
		const selected = this.selection.selected;
		let locations = [...this.locations];
		this.customDiallogService.confirm('Delete Confirmation?', `Are you sure you want to delete?`,'Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				var ids = []
				selected.forEach(location => {
					ids.push(location.id)
				})
				this.requestService.sendRequest(FirmUrlsEnum.Location_list_DELETE, 'Post', REQUEST_SERVERS.fd_api_url, { ids: ids }).subscribe(data => {
					for (const location of selected) {
						locations = locations.filter((loc) => loc !== location);
					}
					this.locations = locations;
					this.selection.clear();
					this.locations = this.locations.slice();
				})
			}
		})
		.catch();
	}

	PageLimit($num) {
		this.page.size = Number($num);
	}

	onUpdateAttorney(firms: AttorneyFirms) {

		// this.addAttornetForm.get('name').disable();
		this.addAttornetForm.patchValue({
			is_main: firms && firms.firm_locations ? firms.firm_locations[0].is_main : 0,
			id: firms.firm_locations[0].id,
			name: firms.name,
			street_address: firms.firm_locations[0].street_address,
			apartment_suite: firms.firm_locations[0].apartment_suite,
			city: firms.firm_locations[0].city,
			state: firms.firm_locations[0].state,
			zip: firms.firm_locations[0].zip,
			phone: firms.firm_locations[0].phone,
			cell: firms.firm_locations[0].cell,
			ext: firms.firm_locations[0].ext,
			fax: firms.firm_locations[0].fax,
			email: firms.firm_locations[0].email,
			contact_person_first_name: firms.firm_locations[0].contact_person_first_name,
			contact_person_middle_name: firms.firm_locations[0].contact_person_middle_name,
			contact_person_last_name: firms.firm_locations[0].contact_person_last_name,
			contact_person_phone: firms.firm_locations[0].contact_person_phone,
			contact_person_cell: firms.firm_locations[0].contact_person_cell,
			contact_person_ext: firms.firm_locations[0].contact_person_ext,
			contact_person_fax: firms.firm_locations[0].contact_person_fax,
			contact_person_email: firms.firm_locations[0].contact_person_email,
			comments: firms.firm_locations[0].comments,

		});
		// firms.firm_locations.splice(0, 1)
	}
	/***
	 * Conformation popup to leave form
	 */
	CancleForm() {
		//this.router.navigate(['front-desk/masters/billing/attorney']);
		if (this.addAttornetForm.dirty && this.addAttornetForm.touched) {
			this.CanDeactivateModelComponentService.canDeactivate().then(res => {
				if (res) {
					this.childForm.emit('cancel');
				}
				else {
					return;
				}
			});
		}
		else {
			this.childForm.emit('cancel');
		}
	}

	shownButton() {
		this.locationTabVisible = !this.locationTabVisible;
		this.locationTabVisible == false && this.firmId ? this.requestServiceURL({ offset: 0 }) : null

	}

	requestServiceURL(pageInfo) {
		this.page.pageNumber = pageInfo.offset;
		const pageNumber = this.page.pageNumber + 1;

		const filters = checkReactiveFormIsEmpty(null);
		this.getlocationParams = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: this.page.size,
			page: pageNumber,
			pagination: true,
			firm_id: this.firmId
		};
		this.getLocationsByFirmId({ ...this.getlocationParams, ...filters });
	}

	getLocationsByFirmId(locationParams) {
		this.requestService.sendRequest(
			FirmUrlsEnum.Location_list_ByFIrmId_GET,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			locationParams ,
		).subscribe((res: any) => {
			if (res.status) {
				this.modalService.dismissAll();
				this.allLocations = res.result ? res.result.data : [];
				this.totalElements = res.result.total;

				// firms.firm_locations = [...this.allLocations];
				// console.log('firms.firm_locations', firms.firm_locations);
				// this.allLocationsBYFIrmId = firms.firm_locations;
			}
		});
	}



	// locationTabVisible = true;

	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}
	closeLoacationModel() {
		this.modalRef.close();
		this.boolValue = false;
		this.locationForm.reset();
	}

	setPrimaryLocation($event) {
		// console.log('event', event.target.checked);
		// this.locationForm.value.is_main = !this.locationForm.value.is_main;
		this.locationForm.value.is_main = $event.target.checked;
		if (this.locationForm.value.is_main) {
			this.customDiallogService.confirm('Set Primary Location', 'You want to change primary location?','Yes','No')
			.then((confirmed) => {
				if (confirmed){
					this.locationForm.value.is_main = $event.target.checked;
					// this.setLocationsOfFirm(event.target.checked)
				} else {
					$event.target.checked = false;
					this.locationForm.value.is_main = $event.target.checked;
				}
			})
			.catch();
		}
	}

	getLOcationsFromChild(value) {
		// console.log('aaaaa', value);
		this.locations = [...this.locations, { ...value }]
	}

	checkboXData(event) {
	}

	addFIrmLocation(event) {
		if (this.firmId) {
			event.firm_id = this.firmId;
			event.id ? this.updateLocation(event) : this.addNewLocation(event);
		}
		else {
			// console.log('ff', event);
			this.tempLocationUpdate ? this.updateTempLocation(event) : this.createFirmLocalLocations(event);
		}
	}
	updateTempLocation(event) {
		this.allLocations[this.tempIndex] = event;
		this.allLocations = [...this.allLocations]
		this.totalElements = this.allLocations.length;
		this.tempLocationUpdate = false;
	}

	createFirmLocalLocations(event) {
		this.allLocations = [];
		this.allLocations.push(event);
		this.allLocations = [...this.allLocations];
		this.totalElements = this.allLocations.length;
		this.onFirmSubmit();
	}

	addNewLocation(Formvalue) {
		this.loadSpin = true;
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
							this.loadSpin = false;
							this.getAllLocations({ offset: 0 }, this.firmId);
							this.modalService.dismissAll();
							this.toastrService.success('Success', 'Location Added successfully');
						}
					},
					(err: any) => {
						this.loadSpin = false;
						// const str = parseHttpErrorResponseObject(err.error.message);
						// this.toastrService.error(str);
					},
				),
		);
	}


	getAllLocations(pageInfo, id?: number, dropdown?: string) {

		if (dropdown == 'dropdown') {
			this.page.size = pageInfo.pageSize;
			pageInfo.offset = 0;
		}
		this.page.pageNumber = pageInfo.offset;
		const pageNumber = this.page.pageNumber + 1;
		if (id) {
			// this.page.pageNumber = pageInfo.offset;
			// const pageNumber = this.page.pageNumber + 1;

			const filters = checkReactiveFormIsEmpty(null);
			this.locationParams = {
				filter: !isObjectEmpty(filters),
				order: OrderEnum.ASC,
				per_page: this.page.size || 10,
				page: pageNumber,
				pagination: true,
				firm_id: id
			};
			this.getLocationsByFirmId({ ...this.locationParams, ...filters })
		}
	}

	updateLocation(Formvalue) {
		this.loadSpin = true;
		this.requestService.sendRequest(
			FirmUrlsEnum.Location_list_PUT,
			'POST',
			REQUEST_SERVERS.fd_api_url,
			Formvalue
		)
			.subscribe((resp: any) => {
				if (resp['status']) {
					// 			// this.getAllFirms();
					// 			this.loadSpin = false;
					// 			this.setFirms({ offset: 0 });
					this.loadSpin = false;
					this.modalService.dismissAll();
					this.getAllLocations({ offset: 0 }, this.firmId);
					this.toastrService.success('Successfully updated', 'Success');
					this.boolValue = false;
				}
			},(error) => {
				this.loadSpin = false;
			});
	}

	editAddFIrmpagination(event) {
		this.getAllLocations(event, event.id);
	}

	dropDownValues(event) {
		this.getAllLocations(event, event.id, 'dropdown');
	}

	temporayLocations(event) {
		this.tempLocationUpdate = event.value;
		this.tempIndex = event.index;
	}
}
