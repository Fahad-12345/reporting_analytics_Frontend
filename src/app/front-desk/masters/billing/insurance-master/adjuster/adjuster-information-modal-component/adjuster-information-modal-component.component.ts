import { ChangeDetectorRef } from '@angular/core';
import { Component, OnInit, Input } from '@angular/core';
import { AdjusterInformationModel } from '../../../models/AdjusterInformation.Model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {  NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BillingInsuranceModel, LocationsModel } from '../../models/BillingInsurance.Model';
import { AdjusterInformationServiceService } from '../../../services/adjuster-information-service.service';
import { ToastrService } from 'ngx-toastr';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { AdjusterInformationUrlsEnum } from '../adjuster-information/adjuster-information-urls-enum';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { InsuranceUrlsEnum } from '../../Insurance/insurance-list/Insurance-Urls-enum';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { ZipFormatMessages } from '@appDir/shared/dynamic-form/constants/ZipFormatMessages.enum';
import { removeEmptyAndNullsFormObject, statesList, whitespaceFormValidation,allStatesList  } from '@appDir/shared/utils/utils.helpers';

@Component({
	selector: 'app-adjuster-information-modal-component',
	templateUrl: './adjuster-information-modal-component.component.html',
	styleUrls: ['./adjuster-information-modal-component.component.scss']
})
export class AdjusterInformationModalComponentComponent implements OnInit {

	constructor(private cdr: ChangeDetectorRef, private fb: FormBuilder, private modalService: NgbActiveModal, private adjusterService: AdjusterInformationServiceService
		, private toaster: ToastrService, private fdService: FDServices, protected requestService: RequestService,
		private CanDeactivateModelComponentService: CanDeactivateModelComponentService) { }

	@Input() editMode: boolean;
	@Input() adjuster: AdjusterInformationModel
	adjusterForm: FormGroup
	lstInsurances: Array<BillingInsuranceModel> = []
	loadSpin: boolean = false;
	states = [];
	dropDownData = [];
	queryParams: ParamQuery = { order: OrderEnum.ASC, pagination: true, filter: false, per_page: 10, page: 1 } as any
	disableBtn: boolean = false;
	zipFormatMessage=ZipFormatMessages;
	allStates=[];
	page = 1;


	ngOnInit() {
		this.initForm()
		this.states = statesList;
		this.allStates=allStatesList;
		let paramQuery: ParamQuery = { order: OrderEnum.ASC, pagination: true, filter: false, per_page: 10, page: 1, order_by: 'insurance_name' }
		this.requestService
			.sendRequest(
				InsuranceUrlsEnum.Insurance_list_GET,
				'GET',
				REQUEST_SERVERS.billing_api_url,
				{ ...paramQuery },
			)
			.subscribe(
				(resp: any) => {
				    this.lstInsurances = resp?.result?.data;
					this.initDropDownData();
				}
			)
		if (this.editMode) {
			this.updateForm(this.adjuster)
		}
		else {
			this.adjuster = {} as AdjusterInformationModel
			this.initForm()
		}
	}
	dropdownSettings = {
		singleSelection: false,
		idField: 'id',
		textField: 'insurance_name',
		selectAllText: 'Select All',
		unSelectAllText: 'UnSelect All',
		itemsShowLimit: 1,
		allowSearchFilter: true,
	};

		selectedState:string='';
	stateChange(event)
	{
		this.selectedState=event.fullName;
	}
	
	initDropDownData() {
		this.lstInsurances.forEach(_insurance => {

			this.dropDownData.push({ id: _insurance.id, insurance_name: (_insurance as any).insurance_name })

		})
	}
	onItemSelect(val) {  }
	initForm() {
		this.adjusterForm = this.fb.group({
			first_name: ['', [Validators.required,whitespaceFormValidation()]],
			middle_name: [''],
			last_name: ['', [Validators.required,whitespaceFormValidation()]],
			phone_no: [''],
			ext: [''],
			fax: [''],
			cell_no: [''],
			email: ['', Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')],
			street_address: [''],
			apartment_suite: [''],
			city: [''],
			state: [''],
			zip: ['',[Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')]],
			comments: [''],
			contact_person_first_name: [''],
			contact_person_middle_name: [''],
			contact_person_last_name: [''],
			contact_person_phone_no: [''],
			contact_person_ext: [''],
			contact_person_cell_number: [''],
			contact_person_fax: [''],
			contact_person_email: ['', [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
			insurance_and_location: ['', [Validators.required,whitespaceFormValidation()]]
		})
	}
	

	updateForm(adjuster: AdjusterInformationModel) {
		this.adjusterForm.patchValue(removeEmptyAndNullsFormObject(
			{ ...this.adjuster, insurance_and_location: this.getInitInsuranceArray(this.adjuster['insurance']).map(res => { return res.id }) }))
		this.lstInsurances = this.getInitInsuranceArray(this.adjuster['insurance'])
	}
	getInitInsuranceArray(insuranceAndLocation: Array<BillingInsuranceModel>) {
		var array = []
		insuranceAndLocation.forEach(insurance => {
			array.push({ id: insurance.id, insurance_name: (insurance as any).insurance_name })
		})
		return array;
	}
	add() {
		this.searchInsurance('');
	}
	submit(adjuster) {
		this.disableBtn = true;
		this.loadSpin = true;
		if (this.editMode) {
			this.adjuster.first_name = adjuster.first_name
			this.adjuster.middle_name = adjuster.middle_name
			this.adjuster.last_name = adjuster.last_name
			this.adjuster.phone_no = adjuster.phone_no
			this.adjuster.ext = adjuster.ext
			this.adjuster.fax = adjuster.fax
			this.adjuster.email = adjuster.email
			this.adjuster.street_address = adjuster.street_address
			this.adjuster.apartment_suite = adjuster.apartment_suite
			this.adjuster.city = adjuster.city
			this.adjuster.state = adjuster.state
			this.adjuster.zip = adjuster.zip
			this.adjuster.cell_no = adjuster.cell_no
			this.adjuster.comments = adjuster.comments
			this.adjuster.contact_person_first_name = adjuster.contact_person_first_name,
				this.adjuster.contact_person_middle_name = adjuster.contact_person_middle_name,
				this.adjuster.contact_person_last_name = adjuster.contact_person_last_name,
				this.adjuster.contact_person_phone_no = adjuster.contact_person_phone_no,
				this.adjuster.contact_person_ext = adjuster.contact_person_ext,
				this.adjuster.contact_person_cell_number = adjuster.contact_person_cell_number,
				this.adjuster.contact_person_fax = adjuster.contact_person_fax,
				this.adjuster.contact_person_email = adjuster.contact_person_email,
				this.adjuster['insurance_and_locations'] = this.initAdjusterLocationObject(adjuster.insurance_and_location)
			this.requestService.sendRequest(AdjusterInformationUrlsEnum.adjuster_list_PATCH, 'PATCH', REQUEST_SERVERS.billing_api_url, this.adjuster).subscribe(data => {
				//this.adjusterService.updateAdjuster(this.adjuster).subscribe(data => {
				if (data['status'] == 200) {
					this.toaster.success('Successfully updated', 'Success')
					this.loadSpin = false;
					this.modalService.close(this.adjuster)
				} else {
					this.loadSpin = false;
					this.toaster.error(data['message'])
				}
			})

		}
		else {
			// this.modalService.close(adjuster)
			adjuster.insurance_and_locations = this.initAdjusterLocationObject(adjuster.insurance_and_location)
			this.requestService.sendRequest(AdjusterInformationUrlsEnum.adjuster_list_POST, 'POST', REQUEST_SERVERS.billing_api_url, adjuster).subscribe(data => {
				//this.adjusterService.createAdjusterInformation(adjuster).subscribe(data => {
				if (data['status'] == 200) {
					this.loadSpin = false;
					this.toaster.success('Successfully added', 'Success')
					this.modalService.close(adjuster)
				} else {
					this.loadSpin = false;
					this.toaster.error(data['message'])
				}
			})
		}
		this.loadSpin = false;
	}
	initAdjusterLocationObject(insuranceAndLocation: Array<{ id, insurance_name }>) {
		let array: {};

		array = insuranceAndLocation.map((x) => {
			return { id: x };
		});
		return array
	}
	close() {
		if ((this.adjusterForm.dirty && this.adjusterForm.touched)) {
			this.CanDeactivateModelComponentService.canDeactivate().then(res => {
				let result = res;
				if (res) {
					this.modalService.close(null)
				}
				else {
					return true;
				}
			});
		}
		else {
			this.modalService.close(null)
		}


		// this.adjuster.insuranceAndLocation.forEach(insurance => {
		//   insurance.selectedLocations.forEach(location => { })
		// })
	}



	optionSelected($event, insurance: BillingInsuranceModel, location: LocationsModel) {


		var index: number = null

		if ($event.target.selected) {
			this.adjuster.insurance_and_location.forEach((_insurance, i) => {
				if (_insurance.id == insurance['id']) {
					index = i
				}
			})

			if (index) {
				//already exists
				this.adjuster.insurance_and_location[index].selectedLocations.push(location.id)
			} else {
				//does not exist
				this.adjuster.insurance_and_location.push({ id: insurance['id'], selectedLocations: [location.id] })
			}
		} else {
			this.adjuster.insurance_and_location.forEach((_insurance, index1) => {
				if (insurance['id'] == _insurance.id) {
					_insurance.selectedLocations.forEach((_location, index) => {
						if (location.id == _location) {
							this.adjuster.insurance_and_location[index1].selectedLocations.splice(index, 1)
						}
					})
				}
			})
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
		const _address = (street_number.long_name ? street_number.long_name + ' ' : '') + route.long_name;
		// if (type === 'Firm') {
		//   this.insuranceForm.patchValue({
		//     'address': _address,
		//     'city': city.long_name,
		//     'state': state.long_name,
		//     'zip': postal_code.long_name,

		//   });
		//   return;
		// }

		if (type === 'location') {
			this.adjusterForm.patchValue(
				removeEmptyAndNullsFormObject({
					'street_address': _address,
					'city': city.long_name,
					'state': state.long_name,
					'zip': postal_code.long_name,
				}));
		}
	}
	/**
	 * search Insurance
	 * @param event 
	 */
	searchInsurance(event) {
		// console.log(event);
		return new Promise((res, rej) => {
			this.getInsurance(event).subscribe(data => {
				this.lstInsurances = data['result'].data
				res(this.lstInsurances);
			
			})
		})
	}
	/**
	 * get Insurance listing
	 */
	getInsurance(name?, id?,page = 1) {
		let paramQuery: ParamQuery = { order: OrderEnum.ASC, pagination: true, filter: false, per_page: 10, page: page, order_by: 'insurance_name' }
		let filter = {}
		id ? filter['id'] = id : name ? filter['insurance_name'] = name : ''
		id || name ? paramQuery.filter = true : ''
		return this.requestService.sendRequest(InsuranceUrlsEnum.Insurance_list_GET, 'GET', REQUEST_SERVERS.billing_api_url, { ...paramQuery, ...filter })
	}
	fetchMoreInsurances() {
		this.page++;
		this.getInsurance('', '', this.page).subscribe(data => {
		  this.lstInsurances = [...this.lstInsurances, ...data['result'].data];
		});
	  }
}
