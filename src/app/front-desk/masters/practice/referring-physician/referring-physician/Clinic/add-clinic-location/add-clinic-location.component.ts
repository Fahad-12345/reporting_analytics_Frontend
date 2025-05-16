import { Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ReferringPhysicianService } from './../../referring-physician.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as _ from "lodash";
import { removeEmptyAndNullsFormObject, statesList, unSubAllPrevious ,allStatesList } from '@appDir/shared/utils/utils.helpers';
import { Subscription } from 'rxjs';
import { ZipFormatMessages } from '@appDir/shared/dynamic-form/constants/ZipFormatMessages.enum';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
@Component({
	selector: 'app-add-clinic-location',
	templateUrl: './add-clinic-location.component.html',
	styleUrls: ['./add-clinic-location.component.scss'],
})
export class AddClinicLocationComponent implements OnInit {
	locationType = 'Add';
	loading = false;
	locationForm: FormGroup;
	states = [];
	isSecondaryAddLocation:boolean = false;
	clinic_id;
	getLocationDataOnEditLocation:any = {};
	subscription: Subscription[] = [];
	zipFormatMessage = ZipFormatMessages;
	allStates=[];
	selectedState:string='';


	constructor(private fb:FormBuilder,private CanDeactivateModelComponent: CanDeactivateModelComponentService, private referringService:ReferringPhysicianService,private toasterService: ToastrService,private fdService: FDServices,) {}

	ngOnInit() {
		this.states = statesList;
		this.allStates=allStatesList;
		this.initLocationForm();
		this.isAddNewClinicWithLocation();
	}
	stateChange(event)
	{
		this.selectedState=event.fullName;		
	}
	
	initLocationForm() {
		this.locationForm = this.fb.group({
			id: [''],
			clinic_id: [''],
			is_primary: [''],
			floor: [''],
			city: ['',[Validators.required]],
			state: ['',[Validators.required]],
			zip: ['',[Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$'),Validators.required]],
			email: ['',[Validators.pattern(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]],
			phone: [''],
			extension: [''],
			fax: [''],
			street_address:['',Validators.required]
		});
	}
	cancel(){
		if (this.locationForm.dirty && this.locationForm.touched) {
			this.CanDeactivateModelComponent.canDeactivate().then(res => {
				if (res) {
					this.locationForm.reset();
					this.referringService.locationModalClose$.next(true);
				}
			});
		} else {
			this.referringService.locationModalClose$.next(true);
		}
	}
	isAddNewClinicWithLocation(){
		this.subscription.push(
		this.referringService.isAdd_Update_Location$.subscribe(res =>{
				this.loading = res;
		}));
	}
	save() {
		if(this.isSecondaryAddLocation) {
			this.addNewSecondaryLocation();
		} else if(!_.isEmpty(this.getLocationDataOnEditLocation)) {
			this.UpdateClinicLocation();
		}
		 else {
			this.referringService.locationModalSave$.next(this.locationForm.value);
		}
	}
	addNewSecondaryLocation() {
		let addNewLocationSecondary = {
			...removeEmptyAndNullsFormObject(this.locationForm.value),
			clinic_id:this.clinic_id
		}
		this.loading = true;
		this.referringService.AddNewClinicWithSecondaryLocation(addNewLocationSecondary).subscribe(res =>{

			if(res && res.status) {
				let id = {
					clinic_id: res && res.result && res.result.data ? res.result.data.id : null
				}
				const locations = res?.result?.data ? res.result.data?.locations : [];
				const new_clinic_location_id = locations?.length ? locations[locations.length - 1]?.id : null;
				id['new_clinic_location_id'] = new_clinic_location_id;

				this.loading = false;
				this.locationForm.reset();
				this.isSecondaryAddLocation = false;
				this.clinic_id = null;
				this.referringService.nowCloseSecondaryLocationModal$.next(true);
				this.referringService.locationModalClose$.next(false);
				this.toasterService.success(res.message,'Success');
				this.referringService.UpdateRefferingPhysicianClinic(id).subscribe(resp =>{
				}, error => {
					this.loading = false;
				})
			} else {
				this.loading = false;
			}
		},(err) =>{
			this.loading = false;
		});
	}
	UpdateClinicLocation() {
		this.loading = true;
		let addNewLocationSecondary = {
			...this.locationForm.value,
			clinic_id:this.getLocationDataOnEditLocation.clinic_id,
			clinic_location_id:this.getLocationDataOnEditLocation.id
		}
		this.referringService.UpdateSingleClinicLocation(addNewLocationSecondary).subscribe(res =>{
			if(res && res.status) {
				this.locationForm.reset();
				this.getLocationDataOnEditLocation = null;
				this.referringService.locationModalClose$.next(true);
				this.loading = false;
				this.toasterService.success(res.message,'Success');
			} else {
				this.loading = false;
			}
		},(err) =>{
			this.loading = false;
		});
	}
	setUpdatedLocationOnForm() {
		this.initLocationForm();
		if(this.getLocationDataOnEditLocation) {
		this.locationType = 'Update';
		let location = this.getLocationDataOnEditLocation;
		setTimeout(()=>{
			this.locationForm.patchValue(location);
		},200);
	}
	}
	public handleAddressChange(address: Address) {
		debugger;
		const street_number = this.fdService.getComponentByType(address, 'street_number');
		const route = this.fdService.getComponentByType(address, 'route');
		const city = this.fdService.getComponentByType(address, 'locality');
		const state = this.fdService.getComponentByType(address, 'administrative_area_level_1');
		const postal_code = this.fdService.getComponentByType(address, 'postal_code');
		const lat = address.geometry.location.lat();
		const lng = address.geometry.location.lng();
		const _address = (street_number.long_name ? street_number.long_name + ' ' : '') + route.long_name;
		this.locationForm.patchValue(
			removeEmptyAndNullsFormObject({
				street_address: _address,
				city: city.long_name,
				state: state.long_name,
				zip: postal_code.long_name,
				lat: lat,
				long: lng,
				lat_and_long: `${lat},${lng}`
			}));
	}
	ngOnDestroy(): void {
		unSubAllPrevious(this.subscription);
	}
}
