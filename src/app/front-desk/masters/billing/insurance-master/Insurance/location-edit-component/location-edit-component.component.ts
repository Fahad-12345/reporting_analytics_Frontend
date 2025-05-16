import { Component, OnInit, Input, ChangeDetectorRef, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LocationsModel, BillingInsuranceModel } from '../../models/BillingInsurance.Model';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { BillingInsuranceBackendServicesService } from '../../services/billing-insurance-backend-services.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription, Subject } from 'rxjs';
import {
	unSubAllPrevious,
	parseHttpErrorResponseObject,
} from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { ZipFormatMessages } from '@appDir/shared/dynamic-form/constants/ZipFormatMessages.enum';
import {	allStatesList, removeEmptyAndNullsFormObject, statesList } from '@appDir/shared/utils/utils.helpers';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { EnumApiPath } from '@appDir/front-desk/billing/Models/searchedKeys-modal';
import { RequestService } from '@appDir/shared/services/request.service';
import { ClearinghouseEnum } from '../../../clearinghouse/CH-helpers/clearinghouse';
import { CustomFormValidators } from '@appDir/shared/customFormValidator/customFormValidator';
@Component({
	selector: 'app-location-edit-component',
	templateUrl: './location-edit-component.component.html',
	styleUrls: ['./location-edit-component.component.scss'],
})
export class LocationEditComponentComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	allStates=[];
	@Input() hideShowUpdateInsuranceButton : boolean = false;
	constructor(
		protected requestService: RequestService,
		private customDiallogService : CustomDiallogService,
		public activeModal?: NgbActiveModal,
		private insuranceService?: BillingInsuranceBackendServicesService,
		private fb?: FormBuilder,
		private fdService?: FDServices,
		private toaster?: ToastrService,
		private changeDetectorRef?:ChangeDetectorRef,private el?: ElementRef,
		private CanDeactivateModelComponentService?: CanDeactivateModelComponentService
	) { 
		

	}

	is_main_location: boolean = false;
	hideshowPayers: boolean = false;
	hideshowPayersTooltip: boolean = false;
	selectState:any
	loadSpin: boolean = false;
	@ViewChild('states') ngSlelectState:any
	@Input() location: LocationsModel;
	@Input() insurance: BillingInsuranceModel;
	@Input() alllocations;
	isEditMode: boolean = false;
	title: string = 'Add';
	@Input() submitbtn: string = 'Save & Continue';
	loading: boolean = false;
	states = []
	dynamicStates = [];
	subject = new Subject();
	zipFormatMessage=ZipFormatMessages;
	eventsSubject: Subject<any> = new Subject<any>();
	payer_info_list = [];
	requestServerpath = REQUEST_SERVERS;
    EnumApiPath = EnumApiPath;
	previous_prime_idx = -1;
	ngSelectState: Subject<any> = new Subject<any>();
	ngOnInit() {
		this.states = statesList;
		this.allStates=allStatesList;
		this.getStateList();
		this.initLocationForm();
		this.loading = false;
		if (this.insurance) {
			this.title = 'Add'
			this.submitbtn = 'Save & Continue'
		}
		if (this.location && this.insurance) {
			this.isEditMode = true;
			this.title = this.hideShowUpdateInsuranceButton?'View':'Edit';
			this.submitbtn = 'Update'
			this.updateLocationForm(this.location);
		}
		// this.insuranceDataService.getCurrentBillingInsurance
		if (this.hideShowUpdateInsuranceButton){
			this.locationForm.disable();
			this.locationForm.updateValueAndValidity();
		}
		else {
			this.locationForm.enable();
			this.locationForm.updateValueAndValidity();
		}
		this.getValueAccessesPayer();
	}
	getStateList() {
		this.subscription.push(
		  this.requestService.sendRequest(
			ClearinghouseEnum.get_States_List, 'get', REQUEST_SERVERS.fd_api_url)
			.subscribe((res) => {
				if(res?.status){
					this.dynamicStates = (res?.result?.data) ? [...res?.result?.data] :[];
				}
			})
		)
	}
	getValueAccessesPayer(){
		this.subscription.push(this.locationForm.controls['is_associate_with_payer'].valueChanges.subscribe((hanlder)=>{
			this.hideshowPayers = hanlder == '1' ? true : false;
			if(hanlder == '1'){
				if(this.payer_info_list?.length === 1){
					this.locationForm.controls['default_payer_id'].setValue(this.payer_info_list[this.payer_info_list.length - 1]['id']);
				}else{
					this.locationForm.controls['default_payer_id'].setValue('');
				}
			}else{
				this.locationForm.controls['default_payer_id'].setValue('');
			}
		}))
	}
	getPayers(val){
		if(this.payer_info_list?.length){
			if(this.payer_info_list?.length == 1){
				this.payer_info_list?.forEach(obj =>{
					obj['is_default_payer'] = true;
				});
			}
			else{
				this.payer_info_list?.forEach(obj =>{
					obj['is_default_payer'] = false;
				});
			}
		}
	}
	locationEditMode = false;

	locationForm: FormGroup;
	selectedState:string='';
	stateChange(event)
	{
		this.selectedState=event.fullName;		
	}
	updateLocationForm(location: LocationsModel, index?) {
		this.locationEditMode = true;
		this.is_main_location = location.is_main_location;
		if(location?.states)
		this.selectState = [location.states];
		if(location.kiosk_state_id)
		this.getPayerInfo(location.kiosk_state_id,location)
		this.locationForm = this.fb.group({
			id: [location.id],
			location_name: [location.location_name, Validators.required],
			insurance_code: [location.location_code],
			street_address: [location.street_address, Validators.required],
			apartment_suite: [location.apartment_suite],
			city: [location.city,Validators.required],
			state: [location.state,Validators.required],
			zip: [location.zip,[Validators.required,Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')]],
			phone_no: [location.phone_no],
			ext: [location.ext],
			cell_number: [location.cell_number],
			fax: [location.fax],
			email: [location.email, [Validators.email]],
			contact_person_first_name: [location.contact_person_first_name],
			contact_person_middle_name: [location.contact_person_middle_name],
			contact_person_last_name: [location.contact_person_last_name],
			contact_person_phone_no: [location.contact_person_phone_no],
			contact_person_ext: [location.contact_person_ext],
			contact_person_cell_number: [location.contact_person_cell_number],
			contact_person_fax: [location.contact_person_fax],
			contact_person_email: [location.contact_person_email, [Validators.email]],
			comments: [location.comments],
			is_main_location: [location.is_main_location],
			location_code: [location.location_code],
			kiosk_state_id: [location.kiosk_state_id || ''],
			is_associate_with_payer:[{value:location.is_associate_with_payer?'1':location.is_associate_with_payer == false?'0':'',disabled:this.hideShowUpdateInsuranceButton} ,Validators.required],
			default_payer_id:[location.default_payer_id]
		});
	}

	initLocationForm() {
		this.locationForm = this.fb.group({
			id: [''],
			location_name: ['', Validators.required],
			insurance_code: [''],
			street_address: ['',[Validators.required,CustomFormValidators.hasOnlyWhitespace]],
			apartment_suite: [''],
			city: ['',[Validators.required,CustomFormValidators.hasOnlyWhitespace]],
			state: ['',Validators.required],
			zip: ['',[Validators.required,Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')]],
			phone_no: [''],
			ext: [''],
			cell_number: [''],
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
			is_main_location: [false],
			location_code: [''],
			kiosk_state_id: [''],
			is_associate_with_payer:['',Validators.required],
			default_payer_id:['']
		});
	}
	setEditLocation(location,update?) {
		this.insurance.insurance_locations.map((locat,index) => {
			this.insurance.insurance_locations[index].is_update=false;
			if(this.previous_prime_idx==index){
				this.insurance.insurance_locations[index].is_update=true;
			}
			if (locat.id == this.location.id) {
				
				this.location.location_name = location.location_name;
				this.location.insurance_code = location.insurance_code;
				this.location.street_address = location.street_address;
				this.location.apartment_suite = location.apartment_suite;
				this.location.city = location.city;
				this.location.state = location.state;
				this.location.zip = location.zip;
				this.location.phone_no = location.phone_no;
				this.location.email = location.email;
				this.location.ext = location.ext;
				this.location.fax = location.fax;
				this.location.cell_number = location.cell_number;
				this.location.contact_person_phone_no = location.contact_person_phone_no;
				this.location.contact_person_ext = location.contact_person_ext;
				this.location.contact_person_cell_number = location.contact_person_cell_number;
				this.location.contact_person_fax = location.contact_person_fax;
				this.location.contact_person_email = location.contact_person_email;
				this.location.contact_person_first_name = location.contact_person_first_name;
				this.location.contact_person_middle_name = location.contact_person_middle_name;
				this.location.contact_person_last_name = location.contact_person_last_name;
				this.location.comments = location.comments;
				this.location.is_main_location = location.is_main_location;
				this.location.location_code = location.location_code;
				this.location.is_update=location.is_update?location.is_update:false;
				this.location.kiosk_state_id=location.kiosk_state_id;
				this.location.default_payer_id = location.default_payer_id;
				this.location.is_associate_with_payer = location.is_associate_with_payer;
			}
		});
	}



	SubmitLocation(location) {
		this.subscription.push(
			this.insuranceService.updateInsurance(this.insurance).subscribe(
				(data) => {
					if (data['status'] == 200) {
						if (location.id)
							this.toaster.success('Successfully updated', 'Success');
						else
							this.toaster.success('Successfully added', 'Success');
						// this.subject.next(location)
						this.activeModal.close(location);
					} else {
						// this.subject.next(location)
						this.activeModal.close(location);
						// this.toaster.error(data['message']);
						const str = parseHttpErrorResponseObject(data['message']);
				
						this.toaster.error(str);
					}
					this.loading = false;
				},
				(err) => {
					if(err['status'] === 406 && !this.isEditMode){
						this.insurance.insurance_locations.pop();
					}
					this.loading = false;
				},
			),
		);
	}
	resetAllMainLocations(insurance) {
		for (let x in insurance.insurance_locations) {
			insurance.insurance_locations[x].is_main_location = false;
		}
	}
	resetForNewInsurance(insurance) {

		if (insurance && insurance.insurance_locations) {
			for (let x in insurance.insurance_locations) {
				insurance.insurance_locations[x].is_main_location = false;
			}
		}
	}
	save(locationForm:FormGroup) {
		if(this.locationForm.invalid){
			this.locationForm.markAllAsTouched();
			this.scrollToFirstInvalidControl();
			return;
		}
		let location = this.locationForm.getRawValue();
		if (this.submitbtn == "Save For Later") {
			this.activeModal.close();
			return;
		}
		if(this.locationForm.controls['is_associate_with_payer'].value == '1' && !this.locationForm.controls['default_payer_id'].value){
			this.toaster.error('Please set atleast one payer as default.','Error');
			return
		}
		this.loading = true;
		if (this.insurance && this.insurance.id) {
			if (location.is_main_location == true) {
				this.resetAllMainLocations(this.insurance);
			}

			this.updateInsurance(location)
		}
		else {
			if (location.is_main_location == true) {
				this.resetForNewInsurance(this.alllocations);
			}
			this.subject.next(location);
			// this.activeModal.close(location);
		}
	}
	updateInsurance(location) {
		location['is_update']=true;
		if (this.insurance) {
			if (this.isEditMode) {
				this.setEditLocation(location);
			}
			else {
				if(this.previous_prime_idx!=-1){
					this.insurance.insurance_locations[this.previous_prime_idx].is_update=true;
				}
				this.insurance.insurance_locations.push(location);
			}
			this.SubmitLocation(location)
		}
	}

	addNewInsuranceLocation() {

	}
	cancel() {
		if ((this.locationForm.dirty && this.locationForm.touched)) {
			this.CanDeactivateModelComponentService.canDeactivate().then(res => {
				let result = res;
				if (res) {
					this.activeModal.close(null);
				}
				else {
					return true;
				}
			});
		}
		else {
			this.activeModal.close(null);
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
		if(!_address){
			this.locationForm.controls['street_address'].setValue(null);
			this.locationForm.controls['street_address'].markAllAsTouched();
			return
		}
		let dynamicState = this.dynamicStates?.find(element => element?.code === state?.long_name);
		this.selectState = [];
		if(dynamicState){
			let value = dynamicState?.id
			this.ngSelectState?.next({
				status:true,
				value
			})
			this.selectState?.push(dynamicState);
			this.selectionOnValueChange({data :dynamicState, formValue: dynamicState?.id},'state');
		}
		if (type === 'location') {
			this.locationForm.patchValue(
				removeEmptyAndNullsFormObject({
					street_address: _address,
					city: city.long_name,
					state: dynamicState?.code,
					kiosk_state_id:dynamicState?.id,
					zip: postal_code.long_name,
				}));
		}
	}
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}
	setPrimaryLocation(event) {

		this.locationForm.controls["is_main_location"].setValue(!this.locationForm.controls["is_main_location"].value);
		let flag: boolean = true;
		flag = this.alllocations && this.alllocations.insurance_locations.length == 0 ? false : true

		if (this.locationForm.controls["is_main_location"].value && flag) {
			this.customDiallogService.confirm('Primary Location Confirmation?', 'Do you want to change Primary Location.','Yes','No')
			.then((confirmed) => {
				
				if (confirmed){
					
					this.locationForm.controls["is_main_location"].setValue(true);
							this.is_main_location = true;
							event.target.checked = true;
							this.insurance?.insurance_locations?.map((e,index)=>{
								if (e?.is_main_location)this.previous_prime_idx = index})
						}
						else {
							this.locationForm.controls["is_main_location"].setValue(false);
							this.is_main_location = false;
							event.target.checked = false;
							this.previous_prime_idx = -1
						}
			})
			.catch();

		}
	}
	selectionOnValueChange(ev, formControl){
		if(ev && ev['data']){
			this.locationForm.controls[formControl].setValue(ev?.data?.code || ev?.data?.realObj?.code);
			this.locationForm.controls['kiosk_state_id'].setValue(ev['formValue']);
			this.hideshowPayers = false;
			this.payer_info_list = [];
			this.locationForm.controls['is_associate_with_payer'].setValue('');
			this.locationForm.controls['is_associate_with_payer'].updateValueAndValidity();
		    this.getPayerInfo(ev['formValue']);
			this.getStateList();
		}else{
			this.locationForm.controls[formControl].setValue('');
			this.locationForm.controls[formControl].markAsTouched();
			this.locationForm.controls['kiosk_state_id'].setValue('');
			this.hideshowPayers = false;
			this.payer_info_list = [];
			this.hideshowPayersTooltip = false;
			this.locationForm.controls['is_associate_with_payer'].setValue('');
			this.locationForm.controls['is_associate_with_payer'].updateValueAndValidity();
			this.locationForm.controls['is_associate_with_payer'].enable();
		}
	}
	getPayerInfo(state_ids,location?: LocationsModel) {
		this.loadSpin = true;
		let insur_id:any;
		if(!this.insurance){
			insur_id = [0];
		}else{
			insur_id = [this.insurance.id];
		}
		this.subscription.push(
		  this.requestService.sendRequest(
			ClearinghouseEnum.Get_Payers_Info, 'get', REQUEST_SERVERS.fd_api_url, { state_ids: [state_ids],insurance_ids : insur_id})
			.subscribe((res) => {
			  this.loadSpin = false;
			  if (res && res['result'] && res['result']['data']) {
				this.payer_info_list.push(...res['result']['data']);
				this.changeDetectorRef.detectChanges();
				this.payer_info_list = [...this.payer_info_list];
				if(!this.payer_info_list?.length){
					this.locationForm.controls['is_associate_with_payer'].setValue('0');
					this.locationForm.controls['is_associate_with_payer'].disable();
					this.hideshowPayersTooltip = true;
				}else{
					this.hideshowPayersTooltip = false;
					if(!this.hideShowUpdateInsuranceButton){
						this.locationForm.controls['is_associate_with_payer'].enable();
					}
					if(this.payer_info_list?.length == 1){
						this.payer_info_list?.forEach(obj =>{
							obj['is_default_payer'] = true;
						});
					}else if(this.isEditMode && location){
						this.payer_info_list?.forEach(obj =>{
							if(obj['id'] == location.default_payer_id){
								obj['is_default_payer'] = true;
								this.locationForm.controls['default_payer_id'].setValue(obj['id']);
							}else{
								obj['is_default_payer'] = false;
							}
						});
					}
					else{
						this.payer_info_list?.forEach(obj =>{
							obj['is_default_payer'] = false;
						});
					}
				}
			}
			}, (err) => {
			  this.loadSpin = false;
			})
		)
	}
	setDefaultPayer(row){
		this.locationForm.controls['default_payer_id'].setValue(row.id);
	}
	private scrollToFirstInvalidControl() {
		const firstInvalidControl: HTMLElement = this.el.nativeElement.querySelector(
		  "form .ng-invalid"
		);
		if(!firstInvalidControl && this.locationForm.controls['state'].invalid){
			let scrollto =  this.ngSlelectState?.nativeElement as HTMLElement;
			scrollto?.scrollIntoView();
		}
		if(firstInvalidControl)
		firstInvalidControl?.focus();
	  }
}
