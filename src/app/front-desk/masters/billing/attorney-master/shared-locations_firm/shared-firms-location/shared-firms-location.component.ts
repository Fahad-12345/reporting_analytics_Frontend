import { AclService } from '@appDir/shared/services/acl.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { Component, OnInit, Input, OnChanges, Output, EventEmitter, SimpleChanges, ViewChild } from '@angular/core';
import { NgbModalOptions, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { Subscription } from 'rxjs';
import { RequestService } from '@appDir/shared/services/request.service';
import { FirmUrlsEnum } from '../../firm/Firm-Urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Page } from '@appDir/front-desk/models/page';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { SelectionModel } from '@angular/cdk/collections';
import { Router } from '@angular/router';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { ZipFormatMessages } from '@appDir/shared/dynamic-form/constants/ZipFormatMessages.enum';
import { allStatesList,checkReactiveFormIsEmpty, getObjectChildValue, isObjectEmpty, removeEmptyAndNullsFormObject, statesList, touchAllFields } from '@appDir/shared/utils/utils.helpers';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { environment } from 'environments/environment';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { CustomFormValidators } from '@appDir/shared/customFormValidator/customFormValidator';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
@Component({
	selector: 'app-shared-firms-location',
	templateUrl: './shared-firms-location.component.html',
	styleUrls: ['./shared-firms-location.component.scss']
})
export class SharedFirmsLocationComponent extends PermissionComponent implements OnInit, OnChanges {
	@Input() allLocations; // use for firm.component
	@Input() loadSpinner; // use for firm.component
	@Input() locationPopUp; // use for firm.component used as context
	@Input() totalLocations;
	@Input() externalPagination: boolean;
	@Input() requiredFields: [];
	@Output() sendLocation = new EventEmitter(); // used for add-attorney when adding new firm
	// @Input() firmLocationsOnupdate; // used for add-attorney
	@Input() addFirmcontext; // used for add-attorney
	@Input() btnhide; // used for hide buttons in add/edit form
	@Input() childData; // used for hide buttons in add/edit form
	@Input() submitbtn; // used for show submit button in case of Add form
	@Output() onSelectionUpdate = new EventEmitter();


	@Output() locationFormValue = new EventEmitter();


	@Output() paginationLocation = new EventEmitter(); // for pagination

	@Output() dropdownSelectionValue = new EventEmitter();

	@Output() boolforLocalLocations = new EventEmitter();
	@ViewChild("firm_locations") contentModal: any;

	subscription: Subscription[] = [];
	environment= environment;
	modalRef: NgbModalRef;
	locationForm: FormGroup;
	firmID: number;
	boolValue = false;
	headerText = 'Add Location';
	saveData = 'Save & Continue';
	page: Page;
	locationSearchForm: FormGroup;
	locationParams: ParamQuery;
	firmBool = false;
	OnUpdateFirmId: number;
	addFirmLocationbool = false;
	indexforAddFirm: number;
	selection = new SelectionModel<Element>(true, []);
	totalRows: number;
	addFirmSelection = new SelectionModel<Element>(true, []);
	totalFirmRows: number;
	newAddFirmSelection = new SelectionModel<Element>(true, []);
	newAddFirmRows: number;
	allLocationsRowIndex: number;
	states = []
	zipFormatMessage=ZipFormatMessages;
	requriedTrue=false;

	allStates=[];
	constructor(
		private modalService: NgbModal,
		private fb: FormBuilder,
		private toastrService: ToastrService,
		private fdService: FDServices,
		protected requestService: RequestService,
		public datePipeService : DatePipeFormatService,
		public router: Router,
		private CanDeactivateModelComponentService: CanDeactivateModelComponentService,
		aclService: AclService,
		private customDiallogService : CustomDiallogService
	) {
		super(aclService, router); 
	}

	ngOnInit() {
		this.states = statesList;
		this.allStates=allStatesList;

		this.locationForm = this.initializationLocationForm();
		
		if(this.requiredFields?.length > 1){
			this.setRequiredFields(this.requiredFields);
			this.requriedTrue = true;
		}

	
		this.page = new Page();
		this.page.pageNumber = 0;
		this.page.size = 10;
		if (this.submitbtn == 'Submit') {
			this.saveData = 'Save & Continue';
		}
	}
	selectedState:string='';
	stateChange(event)
	{
		this.selectedState=event.fullName;		
	}

	paginateLocation(pageInfo, id) {
		this.page.pageNumber = 1;
		// if (true) {
		// 	return;
		// }
		if (id) {
			pageInfo.id = id;
		}
		this.paginationLocation.emit(pageInfo);
	}

	setRequiredFields(fields: any[]){
		fields.forEach(field =>{		
			const control=this.locationForm.get(field);
			if(control){
				const existValidation= control.validator ? [control.validator] : [];
				const validatorsWithRequired = [Validators.required,...existValidation];
				control.setValidators(validatorsWithRequired);
				control.updateValueAndValidity();
			}
		})
	}

	getAllLocations(pageInfo, id?: number) {
		if (this.locationPopUp == 'firm') {
			this.page.totalElements = this.totalLocations;
		}
		this.page.pageNumber = pageInfo.offset;
		const pageNumber = this.page.pageNumber + 1;
		if (id) {
			
			const filters = checkReactiveFormIsEmpty(this.locationSearchForm);
			this.locationParams = {
				filter: !isObjectEmpty(filters),
				order: OrderEnum.ASC,
				per_page: this.page.size || 10,
				page: pageNumber,
				pagination: true,
				firm_id: id
			};
			this.getLocationsByFirmID({ ...this.locationParams, ...filters })
		} else {

		}
	}

	getLocationsByFirmID(params) {
		this.requestService.sendRequest(
			FirmUrlsEnum.Location_list_ByFIrmId_GET,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			params ,
		).subscribe((res: any) => {
			if (res.status || res.status === 200) {
				this.allLocations = res.result ? res.result.data.data : [];
			}
		});
	}

	initializationLocationForm() {
		return this.fb.group({
			is_main: [0],
			location_name: ['', Validators.required],
			street_address: ['',CustomFormValidators.hasOnlyWhitespace],
			apartment_suite: [''],
			city: ['',CustomFormValidators.hasOnlyWhitespace],
			state: [''],
			// zip: ['',Validators.minLength(5)],
			zip: ['',[Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')]],
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
		// }, { updateOn: 'blur' });
		});
	}

	ngOnChanges(changes: SimpleChanges) {
	
		if (getObjectChildValue(changes, false, ['childData', 'currentValue', 'modalOpen'])) {
			this.addLocation(this.contentModal);
			this.childData.modalOpen = false;
			if (this.childData.popupLocation) {
				this.locationForm.patchValue(this.childData.popupLocation);

			}

		}
		if (this.childData && this.childData.popupLocationSubmitText) {
			this.saveData = this.childData.popupLocationSubmitText;
		}

	}


	selectAllFirmLocations(event, firm) {
		firm.firm_locations.forEach((location) => {
			location['checked'] = event.checked;
		});
	}


	checkLocation(event, location) {
		location['checked'] = event.checked;
	}

	addLocation(firm_locations) {
		
		this.locationModalOpen(firm_locations);
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
	/**
	 * comfirmation popup before leaving form
	 */
	closeModal() {
		this.loadSpinner = false;
		if ((this.locationForm.dirty && this.locationForm.touched)) {
			this.CanDeactivateModelComponentService.canDeactivate().then(res => {
				let result = res;
				if (res) {
					this.resetall();
				}
				else {
					return true;
				}
			});
		}
		else {
			this.resetall();
		}
	}
	resetall() {
		this.headerText = 'Add Location';
		this.saveData = 'Save & Continue';
		this.locationForm = this.initializationLocationForm()
		this.modalRef.close();
	}
	

	locationSubmit(formValue) {
		if (this.saveData == "Save For Later") {
			this.locationForm.markAsUntouched()
			this.locationForm.markAsPristine()
			this.closeModal()
			this.saveData = "Save & Continue"
			this.childData.popupLocationSubmitText = "Save & Continue"
		}
		if (this.locationForm.valid) {
			this.loadSpinner = true;
			this.locationFormValue.emit(formValue);
			// this.resetall('reset');
		} else {
			touchAllFields(this.locationForm);

		}
	}

	is_first_character_space(event) {
		if(event.target.value.substring(0,1) == ' ') {
			// this.insuranceForm.setValue['location_name'] = 'f';
			this.locationForm.controls.location_name.markAsTouched();
			this.locationForm.controls['location_name'].setErrors({'incorrect': true});
		}
	}
	addNewLocation(Formvalue) {
		this.subscription.push(
			// 		// this.http.post(FirmUrlsEnum.Location_list_POST, Formvalue)
			this.requestService.sendRequest(
				FirmUrlsEnum.Location_list_POST,
				'POST',
				REQUEST_SERVERS.fd_api_url,
				Formvalue
			)
				.subscribe(
					(resp: any) => {
						if (resp.status || resp.status === 200) {
							// 					// this.loadSpin = false;
							// 					// this.getAllFirms();
							// 					this.locationForm.reset();
							// 					// this.setFirms({ offset: 0 });
							this.getAllLocations({ offset: 0 }, this.allLocations[0].firm_id);
							this.resetall();
							this.toastrService.success('Successfully added', 'Success');
						}
					},
					(err: any) => {
					
					},
				),
		);
	}

	updateLocation(Formvalue) {
		this.requestService.sendRequest(
			FirmUrlsEnum.Location_list_PUT,
			'POST',
			REQUEST_SERVERS.fd_api_url,
			Formvalue
		)
			.subscribe((resp: any) => {
				if (resp['status']) {
				
					this.getAllLocations({ offset: 0 }, this.allLocations[0].firm_id);
					this.resetall();
					this.toastrService.success('Successfully updated', 'Success');
					this.boolValue = false;
					this.headerText = 'Add Location';
					this.saveData = 'Save & Continue';
				}
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

	setPrimaryLocation(event) {
		let data = 0;
		for (let p = 0; p < this.allLocations.length; p++) {
			if (this.allLocations[p].is_main == true || this.allLocations[p].is_main == 1) {
				data++;
			}
		}

		this.locationForm.value.is_main = event.target.checked;
		// console.log('this.locationForm.value.is_main', this.locationForm.value.is_main);
		if (this.locationForm.value.is_main == true && data != this.allLocations.length ||
			this.locationForm.value.is_main == true && this.allLocations.length == 1) {
			this.confirmPrimaryLocation();
		
		}
	}

	confirmPrimaryLocation() {
		
		this.customDiallogService.confirm('Set Primary Location', 'You want to change primary location?','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
			// this.locationForm.value.is_main = 1;
			this.locationForm.value.is_main = true; // SET BY FAHAD AS TRUE AND ABOVE COMMENT
			for (let p = 0; p < this.allLocations.length; p++) {
				if (p == this.allLocationsRowIndex) {
					this.allLocations[p].is_main = 1;
				} else if (p != this.allLocationsRowIndex) {
					this.allLocations[p].is_main = 0;
				}
			}
		} else {
			// this.locationForm.value.is_main = 0;
			this.locationForm.controls['is_main'].setValue(false); // SET BY FAHAD AS FALSE AND ABOVE COMMENT
		}
		})
		.catch();
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

	}

	editLocation(firm_locations, rowIndex, row) {
		this.allLocationsRowIndex = rowIndex;
		if (row.is_main == 1) {
			row.is_main = true;
		} else {
			row.is_main = false;
		}
		this.locationForm.patchValue({
			id: row.id,
			firm_id: row.firm_id,
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

		this.headerText = 'Update Location';
		this.saveData = 'Update';
		// in listing firm component
		if (this.locationPopUp == 'firm' && row.firm_id) {
			this.boolValue = true;
			this.firmID = row.firm_id;
		}
		// used when update firm and add new location
		if (this.addFirmcontext == 'addFirm' && row.firm_id) {
			this.firmBool = true;
			this.OnUpdateFirmId = row.firm_id;
		}
		// used when regestring a new firm
		if (row.firm_id == undefined || row.firm_id == '') {
			this.indexforAddFirm = rowIndex;
			this.addFirmLocationbool = true;
			const obj = {
				value: true,
				index: rowIndex
			}
			this.boolforLocalLocations.emit(obj);
		}
		this.locationModalOpen(firm_locations);
	}
	// $num
	displayLimitLocation(value, id: number) {
		// value.id = id;
		this.page.pageNumber = 0;
		// this.setPage({ offset: 0 });
		if (id) {
			this.page.size = value;
			const sendParam = {
				id: id,
				pageSize: Number(value)
			};
			this.dropdownSelectionValue.emit(sendParam);
		} else {
			this.page.size = Number(value)
			const sendParam = {
				id: id,
				pageSize: Number(value)
			};
			if (true) {
				return;
			}

			this.dropdownSelectionValue.emit(sendParam);
		}
		// if (id) {
		// 	this.getAllLocations({ offset: 0 }, id);
		// }

		// this.page.size = Number($num);
	}


	// use checkbox to add firm 
	isNewaddFIrmAllSelected() {
		this.newAddFirmRows = this.allLocations.length;
		const numSelected = this.newAddFirmSelection.selected.length;
		const numRows = this.newAddFirmRows;
		return numSelected === numRows;
	}
	newAddfirmMasterToggle() {
		this.isNewaddFIrmAllSelected()
			? this.newAddFirmSelection.clear()
			: this.allLocations
				.slice(0, this.newAddFirmRows)
				.forEach((row) => this.newAddFirmSelection.select(row));

		this.onSelectionUpdate.emit(this.newAddFirmSelection.selected)
	}

	stringfy(obj) {
		return JSON.stringify(obj);
	}

	
	firmHistoryStats(row) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc body-scroll history-modal',
			modalDialogClass: 'modal-lg'
		};
		let modelRef = this.modalService.open(CreatedHistoryComponent,ngbModalOptions);
		modelRef.componentInstance.createdInformation = [row];
	}
}
