import { Component, OnInit, OnDestroy, Input, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { HttpService } from '@appDir/front-desk/fd_shared/services/http.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import {
	unSubAllPrevious,
	parseHttpErrorResponseObject,
} from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { BillingInsuranceBackendServicesService } from '../../services/billing-insurance-backend-services.service';
import { BillingInsuranceModel, LocationsModel } from '../../models/BillingInsurance.Model';
import { BillingInsuranceDataServiceService } from '../../services/billing-insurance-data-service.service';
import { LocationEditComponentComponent } from '../location-edit-component/location-edit-component.component';
import { RequestService } from '@appDir/shared/services/request.service';
import { InsuranceUrlsEnum } from '../insurance-list/Insurance-Urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Title } from '@angular/platform-browser';
import { CanDeactivateComponentInterface } from '@appDir/shared/canDeactivateFormsComponent/CanDeactivateComponent.interface';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { makeDeepCopyObject } from '@appDir/shared/utils/utils.helpers';
import { ZipFormatMessages } from '@appDir/shared/dynamic-form/constants/ZipFormatMessages.enum';


@Component({
	selector: 'app-insurance-form',
	templateUrl: './insurance-form.component.html',
	styleUrls: ['./insurance-form.component.scss']
})
export class InsuranceFormComponent implements OnInit {

	subscription: Subscription[] = [];
	modalRef: NgbModalRef;
	constructor(
		private insuranceService: BillingInsuranceBackendServicesService,
		private fb: FormBuilder,
		private dataService: BillingInsuranceDataServiceService,
		private toaster: ToastrService,
		private router: Router,
		private fdService: FDServices,
		private modalService: NgbModal,
		private activerout: ActivatedRoute,
		protected requestService: RequestService,
		private titleService: Title,
		private CanDeactivateModelComponentService: CanDeactivateModelComponentService
	) { }

	insuranceForm: FormGroup;
	insurance: BillingInsuranceModel;
	editMode: boolean = true;
	locationForm: FormGroup;
	loading: boolean = false;
	@Input() id: any;
	@Output() childForm = new EventEmitter();
	title: any;
	locationcount: number = 0

	ngOnInit() {
		this.titleService.setTitle(this.activerout.snapshot.data['title']);
		this.initInsuranceForm();
		this.initLocationForm();
		this.addEditMode();
	}
	ngOnChanges() {
		this.addEditMode();
	}
	addEditMode() {
		if (!this.id) {
			this.insurance = BillingInsuranceModel.getEmptyBillingInsurance();
			this.insurance.insurance_locations = [];
			this.editMode = false;
			this.title = 'Add';
		}
		else {
			this.getInsuranceData(this.id);
			this.editMode = true;
			this.title = 'Edit';
		}
	}
	getInsuranceData(id) {
		let parm = { id: id };
		this.subscription.push(this.requestService.sendRequest(InsuranceUrlsEnum.Insurance_list_GET,
			'GET',
			REQUEST_SERVERS.billing_api_url, parm
		).subscribe(
			(resp) => {
				this.insurance = resp['result'];
				this.updateInsuranceForm(this.insurance);
			}, err => {
				const str = parseHttpErrorResponseObject(err.error.message);
				this.toaster.error(str);
			}))
	}
	initLocationForm() {
		this.locationForm = this.fb.group({
			location_name: ['', Validators.required],
			streetAddress: [''],
			apartmentSuite: [''],
			city: [''],
			state: [''],
			zip: ['',[Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')]],
			phoneNo: [''],
			ext: [''],
			cellNumber: [''],
			fax: [''],
			email: ['', [Validators.email]],
			contact_person_first_name: [''],
			contact_person_middle_name: [''],
			contact_person_last_name: [''],
			contact_person_phone_no: [''],
			contact_person_ext: [''],
			contact_person_cell_number: [''],
			contact_person_fax: [''],
			contact_person_email: ['', [Validators.email]],
			comments: [''],
			is_main_location: [false]
		});
	}
	locationEditMode: boolean = false;
	locationEditId = '';
	onCloseLocationModal() {
		this.locationEditMode = false;
		this.locationForm.reset();
		this.modalService.dismissAll();
	}


	updateLocationForm(location?: LocationsModel, index?) {
		this.locationEditMode = true;
		if (location) { this.locationEditId = location.id; }
		var modalRef = this.modalService.open(LocationEditComponentComponent, {
			backdrop: 'static',
			keyboard: false,
			size: 'lg',
			windowClass: 'modal_extraDOc body-scroll',
		});
		modalRef.componentInstance.insurance = this.insurance;
		if (location) {
			modalRef.componentInstance.location = location;
		}
		var that = this;
		modalRef.result.then((result) => {
			this.locationEditMode = true;
			if (!this.insurance.id) { this.addnewLocation(result); }
			this.locationEditMode = false;
		});
	}
	openLocationForm(location?: LocationsModel, index?) {
		this.subscription.push(
			this.insuranceService.createBillingInstance({...this.insuranceForm.getRawValue()}).subscribe(
				(data:any) => {
					if(data['status'] == 200){
						this.locationcount = this.insurance && this.insurance.insurance_locations ? this.insurance.insurance_locations.length : 0
						this.locationEditMode = true;
						if (this.popupLocationData) {
							location = makeDeepCopyObject(this.popupLocationData)
							this.popupLocationData = null;
						}
						if (location) { this.locationEditId = location.id; }
						this.modalRef = this.modalService.open(LocationEditComponentComponent, {
							backdrop: 'static',
							keyboard: false,
							size: 'xl',
							windowClass: 'modal_extraDOc body-scroll',
						});
				
						if (location) {
							this.modalRef.componentInstance.location = location;
						}
						if (this.insurance.insurance_locations) {
							this.modalRef.componentInstance.alllocations = this.insurance;
						}
						var that = this;
						this.modalRef.componentInstance.subject.subscribe((result) => {
							if (!result) {
								this.modalService.dismissAll();
							}
							this.locationEditMode = true;
							this.addnewLocation(result);
							this.locationEditMode = false;
						})
					}
				}
			),
		);
	}
	initInsuranceForm() {
		this.insuranceForm = this.fb.group({
			insurance_name: ['', [Validators.required]],
			insurance_code: [''],
		});
	}
	setPrimaryLocation() {
		this.locationForm.value.is_main_location = !this.locationForm.value.is_main_location;
	}
	updateInsuranceForm(billingInsurance: BillingInsuranceModel) {
		if (billingInsurance && billingInsurance.insurance_locations.length > 0) {

			var location = billingInsurance.insurance_locations.find((location) => {
				return location.is_main_location == true;
			});

		}
		if (billingInsurance && billingInsurance.insurance_name) {
			this.insuranceForm = this.fb.group({
				insurance_name: [billingInsurance.insurance_name],
				insurance_code: [billingInsurance.insurance_code],
			});
		}
	}
	PageLimit(a) { }
	popupLocationData: LocationsModel;
	popupSubmitTest;
	submit(form) {
		this.insurance.insurance_code = form.insurance_code;
		this.insurance.insurance_name = form.insurance_name;
		if (this.insurance && this.insurance.insurance_locations.length > 0) {
			var hasMainLocation = this.insurance.insurance_locations.find((location) => {
				return location.is_main_location == true;
			});

			if (!hasMainLocation) {
				this.insurance.insurance_locations[0].is_main_location = true;
			}
			//   this.insurance.insurance_locations.map((location) => {
			//     delete location.id;
			//   });
		}
		if (!this.editMode) {
			//create mode
			this.loading = true;
			delete this.insurance.created_at;
			delete this.insurance.updated_at;
			this.subscription.push(
				this.insuranceService.createBillingInstance(this.insurance).subscribe(
					(data:any) => {
						this.loading = false;
						if (data['status'] == 200) {
							this.insuranceForm.reset();
							this.modalService.dismissAll();
							this.toaster.success(data.message, 'Success');
							this.childForm.emit('added');
						}
					},
					(err) => {
						this.loading = false;
						this.popupSubmitTest = "Save For Later";
						this.modalRef.componentInstance.loading = false;
						this.modalRef.componentInstance.submitbtn = this.popupSubmitTest
						this.popupLocationData = this.insurance.insurance_locations[0]
						this.insurance.insurance_locations = [];

					},
				),
			);

		}
		else {
			//update mode
			delete this.insurance.created_at;
			delete this.insurance.updated_at;
			this.loading = true;
			this.subscription.push(
				this.insuranceService.updateInsurance(this.insurance).subscribe(
					(data:any) => {
						this.insuranceForm.reset()
						this.loading = false;
						this.modalService.dismissAll();
						this.toaster.success(data.message,'Success');
						this.childForm.emit();
					},
					(err) => {
						this.loading = false;

					},
				),
			);
		}
	}
	addnewLocation(location: LocationsModel) {
		if (!location) {
			this.locationEditMode = false;
			return;
		}
		if (this.locationEditMode && location.id) {
			this.insurance.insurance_locations.map((_location) => {
				if (this.locationEditId == _location['id']) {
					_location.location_name = location.location_name;

					_location.street_address = location.street_address;
					_location.apartment_suite = location.apartment_suite;
					_location.city = location.city;
					_location.state = location.state;
					_location.zip = location.zip;
					_location.phone_no = location.phone_no;
					_location.ext = location.ext;
					_location.email = location.email;
					_location.cell_number = location.cell_number;
					_location.fax = location.fax;
					_location.contact_person_phone_no = location.contact_person_phone_no;
					_location.contact_person_ext = location.contact_person_ext;
					_location.contact_person_cell_number = location.contact_person_cell_number;
					_location.contact_person_fax = location.contact_person_fax;
					_location.contact_person_email = location.contact_person_email;
					_location.contact_person_first_name = location.contact_person_first_name;
					_location.contact_person_middle_name = location.contact_person_middle_name;
					_location.contact_person_last_name = location.contact_person_last_name;
					_location.comments = location.comments;
					_location.is_main_location = location.is_main_location;
				}

			});
			this.locationEditMode = false;
			this.locationEditId = '';
			this.toaster.warning('Data will be saved on submitting the Insurance form');
			this.modalService.dismissAll();
		}
		else {

			location.id = this.insurance && this.insurance.insurance_locations ? this.insurance.insurance_locations.length + '' : '0';
			this.insurance.insurance_locations.push(location as LocationsModel);
			//this.toaster.warning('Data will be saved on submitting the Insurance form');
			// this.modalService.dismissAll();
			this.submit(this.insuranceForm.value)
		}
		this.initLocationForm();
	}
	onLocationChecked($event, index) {
		this.insurance.insurance_locations[index]['isChecked'] = $event.target.checked;
		this.allLocationsChecked = false;
	}
	deleteMultipleLocations() {
		this.insurance.insurance_locations = this.insurance.insurance_locations.filter((insurance) => {
			if (insurance['isChecked']) {
			} else {
				return insurance;
			}
		});
		this.toaster.success('Locations Removed!');
	}

	locationTabVisible = true;
	getCheckedLocations() {
		//if(this.insurance && this.insurance.insurance_locations){
		return this.insurance.insurance_locations.filter((insurance) => {
			//if (index > 0) {
			if (insurance['isChecked']) {
				return insurance;
			}
			//}
		});
		//}
	}
	allLocationsChecked: boolean = false;
	checkallLocations(event) {
		this.allLocationsChecked = event.target.checked;
		this.insurance.insurance_locations.map((insurance) => {
			insurance['isChecked'] = event.target.checked;
		});
	}

	deleteLocation(index) {
		this.insurance.insurance_locations.splice(index, 1);
	}
	cancelForm() {
		//this.router.navigate(['front-desk/masters/billing/insurance/insurance']);
		if (this.insuranceForm.dirty && this.insuranceForm.touched) {
			this.CanDeactivateModelComponentService.canDeactivate().then(res => {
				if (res) {
					this.childForm.emit();
				}
				else {
					return true;
				}
			});
		}
		else {
			this.childForm.emit();
		}

	}
	is_first_character_space() {
		if(this.insuranceForm.controls.insurance_name.value.substring(0,1) == ' ') {
			// this.insuranceForm.setValue['insurance_name'] = 'f';
			this.insuranceForm.controls.insurance_name.markAsTouched();
			this.insuranceForm.controls['insurance_name'].setErrors({'incorrect': true});
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
			this.insuranceForm.patchValue({
				address: _address,
				city: city.long_name,
				state: state.long_name,
				zip: postal_code.long_name,
				streetAddress: _address,
			});
			return;
		}

		if (type === 'location') {
			this.locationForm.patchValue({
				// street_address: _address,
				city: city.long_name,
				state: state.long_name,
				zip: postal_code.long_name,
				streetAddress: _address,
			});
		}
	}

	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}

}
