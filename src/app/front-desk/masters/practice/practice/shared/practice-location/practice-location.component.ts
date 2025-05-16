import { Component, OnInit, Input, EventEmitter, Output, OnChanges, DoCheck, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { Subscription, Observable, concat, of, Subject } from 'rxjs';
import { RequestService } from '@appDir/shared/services/request.service';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { PlaceOfServiceUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/PlaceOfService-Urls-Enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Location, Timing, WeeklyTimingForm } from '../../utils/practice.class';
import { FacilityUrlsEnum } from '../../utils/facility-urls-enum';
import { StorageData, HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { catchError,distinctUntilChanged, map, switchMap, take, tap } from 'rxjs/operators';
import { RegionUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/Region-Urls-Enum';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { ZipFormatMessages } from '@appDir/shared/dynamic-form/constants/ZipFormatMessages.enum';
import { EnumApiPath } from '@appDir/front-desk/billing/Models/searchedKeys-modal';
import { ShareAbleFilter } from '@appDir/shared/models/share-able-filter';
import { getObjectChildValue, removeEmptyAndNullsFormObject, statesList ,allStatesList  } from '@appDir/shared/utils/utils.helpers';
import { ToastrService } from 'ngx-toastr';

@Component({
	selector: 'practice-location',
	templateUrl: './practice-location.component.html',
	styleUrls: ['./practice-location.component.scss']
})
export class PracticeLocationComponent implements OnInit, OnChanges {

	@Input() locationData: Location;
	@Input() mainFacility:any = {};
	@Input() dropDownRegion: any = [];
	@Input() disableForm: boolean = false;
	@Input() shortNameFlag: boolean = false;
	@Input() addLocationFlag: boolean = false;
	@Input() flowFlag: string;
	// dropDownRegion1: any = [{ id: 1, name: "asdf" }];
	@Output() closeModal = new EventEmitter();
	@Output() updateMainFacility = new EventEmitter();
	@Output() updateButtonClicked = new EventEmitter<void>();
	childValues: WeeklyTimingForm = {
		selectedTimings: [] as Timing[],
		isValid: true
	};
	locationForm: FormGroup;
	title: string;
	title_button: string;
	
	lstPlaceOfService: Observable<Object | any[]>;
	placeOfServiceInput = new Subject<string>();
	posLoading: boolean = false;
	public modalRef: NgbModalRef;
	public subscription: Subscription[] = [];
	savedTimeZone = null;
	selectedRegion:string = 'All Region';
	zipFormatMessage=ZipFormatMessages;
	EnumApiPath = EnumApiPath;
	placeOfServicesList;
	stateList:any;
	states:any = [];
	stateId:number;
	hitDefaultAPIPOS:boolean = false;
	@ViewChild('selectedDropDown') selectedDropDown;
	@Input() practiceLocationUpdated: EventEmitter<void>;
	practiceLocationData: any;

	constructor(
		private fb: FormBuilder,
		private customDiallogService : CustomDiallogService,
		private fdService: FDServices,
		private toasterService: ToastrService,
		protected requestService: RequestService,
		private canDeactivateModelComponentService: CanDeactivateModelComponentService,
		private storageData: StorageData,
		private toastrService: ToastrService,
	) {
	}

	ngOnChanges() {
		this.locationForm = this.createSingleLocation(false);
		if (this.locationData) {
			this.requestService.sendRequest(FacilityUrlsEnum.Get_Single_Facility_Location, 'get', REQUEST_SERVERS.fd_api_url, { id: this.locationData.id }).subscribe(data => {
				this.placeOfServicesList = data['result']['data']?.place_of_service;
				this.placeOfServicesList['name'] = this.placeOfServicesList['name'] +' '+ this.placeOfServicesList?.['code'];
				this.locationForm.patchValue(this.locationData);
				this.locationForm.patchValue(
					{ lat_and_long: `${this.locationData.lat}, ${this.locationData.long}`,
					  lat : this.locationData.lat,
					  long: this.locationData.long,
					  qualifier:this.locationData.facility_location_qualifer
				}
				);
				this.locationData.ActionType == 'Update' || this.locationData.ActionType == 'View' ? this.locationForm.get('place_of_service_id').setValue([data['result']['data'].place_of_service.id]) : null;
				this.locationData.ActionType == 'Update' || this.locationData.ActionType == 'View' ? this.selectedDropDown['lists'] = [this.placeOfServicesList] : [];
				this.selectedDropDown.searchForm.patchValue({ common_ids: this.locationForm.get('place_of_service_id').value[0] });
				this.disableForm ? this.locationForm.disable() : null
			});
			debugger;
			this.childValues.selectedTimings = [...this.locationData.timing];
			this.savedTimeZone = getObjectChildValue(this.childValues, '', ['selectedTimings', '0', 'time_zone_string']);
			if (this.locationData.ActionType == 'View') {
				this.title = 'View';

			} else if (this.locationData.ActionType == 'Update') {
				this.title = 'Update';
				this.title_button = 'Update';
				this.hitDefaultAPIPOS = true;
			}
		} else {
			this.title = 'Add';
			this.title_button = 'Save & Continue';
		}
	}


	/**
	 * Address change handler. Loads the values in the form according to its type
	 * @param {Address} address
	 * @param {string?} type
	 */
	public handleAddressChange(address: Address) {
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
				address: _address,
				city: city.long_name,
				state: state.long_name,
				zip: postal_code.long_name,
				lat: lat,
				long: lng,
				lat_and_long: `${lat},${lng}`
			}));
			this.stateChange(state.short_name);
	}

	/**
	 * Returns provider billing form
	 * @return    {FormGroup}    New form group
	 */
	private createProviderBilling = (): FormGroup => {
		return this.fb.group({
			id: [''],
			provider_name: [''],
			city: [''],
			address: ['',[Validators.maxLength(40)]],
			state: ['',[Validators.maxLength(40)]],
			zip: [''],
			floor: [''],
			phone: [''],
			ext_no: [''],
			cell_no: [''],
			fax: [''],
			email: ['', [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
			npi: [''],
			tin: [''],
		});
	};


	/**
	 * Returns array of forms for Provider Billing
	 * @param    void
	 * @return    {FormArray}    New form group
	 */
	private createProviderBillingArray = (): FormArray => {
		let formArray:any = this.fb.array([]);
		formArray.push(this.createProviderBilling());
		return formArray;
	};

	/**
	 * Returns a newly created formgroup for location
	 * @param    {boolean}    isMain    if this is going to be a main location or not
	 * @return    {FormGroup}    New form group
	 */
	private createSingleLocation = (isMain: boolean = false): FormGroup => {
		let name = (isMain) ? [''] : ['', [Validators.required,Validators.maxLength(70) ]];
		let formgroup = this.fb.group({
			id: [null],
			name: name,
			qualifier:['',[Validators.required]],
			address: ['',Validators.maxLength(40)],
			city: ['',Validators.maxLength(35)],
			state: [],
			state_id:[null],
			stateName:[''],
			zip: ['',[Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')]],
			dean:['',[Validators.minLength(9)]],
			floor: ['',Validators.maxLength(40)],
			phone: [''],
			ext_no: [''],
			cell_no: [''],
			fax: [''],
			email: ['', [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
			office_hours_start: [''],
			office_hours_end: [''],
			region_id: ['', [Validators.required]],
			lat: [''],
			long: [''],
			lat_and_long: [''],
			place_of_service_id: [null, [Validators.required]],
			is_main: [(isMain) ? true : false],
			// same_as_provider: [false],
			billing: this.createProviderBillingArray(),
			timing: this.createTimingsArray()
		});
	
		return formgroup;
	};

	selectMessage = 'Please enter more than 1 characters to search.';

	trackByFn(item: any) {
		return item.id;
	}

	mapPlaceOfServices(record) {

		/*	const code = record && 'code' in record && record.code || '';
			const name = record && 'name' in record && code ? ` - ${record.name}` : record.name;*/
		if (record) {
			const code = record.code || '';
			const name = code ? ` - ${record.name}` : record.name;
			return {
				id: record.id,
				name: `${code}${name}`
			};
		} else {
			return;
		}
	}
	loadPlace() {
		if(this.title == 'Update') {
			this.lstPlaceOfService = concat(
				of([]), // default items
				this.placeOfServiceInput.pipe(
					distinctUntilChanged(),
					tap(() => this.posLoading = true),
					switchMap((term) => {
						// if (!term || term.length <= 1) {
						// 	this.selectMessage = 'Please enter more than 1 characters to search.';
						// 	this.posLoading = false;
						// 	return Observable.of(null);
						// } 
						this.selectMessage = 'No record found';
						return this.searchPlace(term)
						.pipe(
						map((response: HttpSuccessResponse) => {
							return response.result.data.map((record) => {
								return this.mapPlaceOfServices(record);
							});
						})).pipe(
							catchError(() => of([])), // empty list on error
							tap(() => this.posLoading = false)
						);
					})
				)
			);
		} else {
			this.getplaces();
		}
	
	
	}
	getStateList(){
		this.requestService
				.sendRequest(
					RegionUrlsEnum.State_list_GET,
					'GET',
					REQUEST_SERVERS.erx_fd_api,
				).subscribe((res)=>{
					let state=[];
					this.stateList=res.result.data;
					this.stateList.forEach(element => {
						if(element && element.code){
						state.push(element.code)
						}
					});
					this.states=state;
				})
	}
	stateChange(event)
	{
		this.stateList.find(e=>{
			if(e.code==event)
			{
				this.locationForm.get("state_id").patchValue(e.id);
				this.locationForm.get("stateName").patchValue(e.name);
			}
		});

		
		
	}
	getplaces() {
		this.lstPlaceOfService = undefined;
		this.lstPlaceOfService = this.searchPlace(undefined)
		.pipe(
		map((response: HttpSuccessResponse) => {
			return response.result.data.map((record) => {
				return this.mapPlaceOfServices(record);
			});
		})).pipe(
			catchError(() => of([])), // empty list on error
			tap(() => this.posLoading = false)
		);
	}

	searchPlace(term) {
		var queryParams: ParamQuery = {
			filter: true,
			order: OrderEnum.ASC,
			pagination: false,
			per_page: null,
			page: null,
			// intelliscence: term,
			search: term,
			// name: term,
			// code: term
		} as any;
		if(!queryParams['search']) {
			delete queryParams['search'];
		}
		return this.requestService
			.sendRequest(
				PlaceOfServiceUrlsEnum.Place_list_GET,
				'GET',
				REQUEST_SERVERS.fd_api_url,
				queryParams,
			);
	}


	/**
	 * Returns a newly created form array for timing
	 * @param    void
	 * @return    {FormArray}    New form array for timing
	 */
	private createTimingsArray = (): FormArray => {
		let formArray = this.fb.array([]);
		// 
		// this.weekday.forEach((day) => {
		//   formArray.push(this.createTiming(day.id, day.name));
		// });

		return formArray;
	};




	isChecked() {

	}

	ngOnInit() {
		this.regionDropDown();
		this.getStateList();
		this.practiceLocationUpdated.pipe(
			take(1)
		  ).subscribe(() => {
			this.onLocationSubmit();
		  });
	}

	regionDropDown() {
		this.subscription.push(
			this.requestService
				.sendRequest(
					RegionUrlsEnum.Region_list_dropdown_GET,
					'GET',
					REQUEST_SERVERS.fd_api_url,
				)
				.subscribe(
					(res) => {
						if (res['status'] == true || res['status'] == 200) {
							this.dropDownRegion = res['result']['data'];
						}
					},
					(err) => {
					},

					
				)
		);

	}

	validateDEANumber(deaNumber: string): boolean {
		const regex = /^[A-Za-z]{2}\d{7}$/;
		return regex.test(deaNumber);
	}

	shortFlagApiCall(locationData){
		if(this.shortNameFlag){
			let request= { method: 'POST', API_URL: FacilityUrlsEnum.Facility_SHORT_NAME_VALIDATION }
			this.subscription.push(
			  this.requestService
				.sendRequest(request.API_URL, request.method, REQUEST_SERVERS.fd_api_url, locationData)
				.subscribe(
				  (res) => {
					if ((res['status'] == true || res['status'] == 200)) {
						this.closeModal.emit(locationData as Location);
					}
				  },
				  (err) => {

				  },
				),
			);

		}else{
			this.closeModal.emit(locationData as Location);
		}
	}

	onUpdateLocation() {
		this.practiceLocationData = this.locationForm.getRawValue();
		this.practiceLocationData.lat_and_long = `${this.practiceLocationData.lat},${this.practiceLocationData.long}`;
    	this.practiceLocationData.timing = this.childValues.selectedTimings;
		this.title == 'Update' ? this.updateButtonClicked.emit(this.practiceLocationData.timing) : this.onLocationSubmit();
	}

	onLocationSubmit() {
		if(this.locationForm.get('dean').value && !this.validateDEANumber(this.locationForm.get('dean').value)) {
			this.toasterService.error('Institutional DEA Number is inavlid', 'Error');
			return false;
		}
		if (typeof (this.practiceLocationData?.place_of_service_id) == 'object') {
			this.practiceLocationData.place_of_service_id = this.practiceLocationData?.place_of_service_id.length > 0 ? this.practiceLocationData?.place_of_service_id[0] : null;
		}
		if(this.addLocationFlag){
			if(!this.mainFacility?.is_active){
				let reqData:any={};
				reqData['active']=true;
				reqData['is_parent']=false;
				reqData['id']=this.mainFacility?.id;
				reqData['main_facility']=false;
				reqData['parent_active'] = true;
				reqData['practice_status']=true;
				this.customDiallogService.confirm('Alert', 'Main practice is currently inactive for this location. By clicking Yes, the main practice will also activate. By clicking No, the location will be added with an inactive status ?','Yes','No')
							.then((confirmed) => {
							  if(confirmed){
								let request= { method: 'PUT', API_URL: FacilityUrlsEnum.Facility_Status_Update }
								this.subscription.push(
									this.requestService
									  .sendRequest(request.API_URL, request.method, REQUEST_SERVERS.fd_api_url, reqData)
									  .subscribe(
										(res) => {
											this.practiceLocationData.is_active=true;
										  if ((res['status'] == true || res['status'] == 200)) {
											this.shortFlagApiCall(this.practiceLocationData);
										   this.updateMainFacility.emit(this.mainFacility)
								
										  }
										},
										(err) => {
					  
										},
									  ),
								  );
							 }else{
								this.practiceLocationData.is_active=false;
							 this.shortFlagApiCall(this.practiceLocationData);
							  return;
							 }
							})
							.catch(); 
			}else{
				this.practiceLocationData.is_active=true;
				this.shortFlagApiCall(this.practiceLocationData);
				return;
			}
		}else{
			this.shortFlagApiCall(this.practiceLocationData);
		}
	}

	public dismissModal() {
		if ((this.locationForm.dirty && this.locationForm.touched)) {
			this.canDeactivateModelComponentService.canDeactivate().then(res => {
				let result = res;
				if (res) {
					this.locationForm.reset();
					this.closeModal.emit();
					this.modalRef?this.modalRef.close():null;
				}
				else {
					return true;
				}
			});
		}
		else {
			this.locationForm.reset();
			this.closeModal.emit();
			this.modalRef?this.modalRef.close():null;

		}
	}

	dismissModalByCross(){
		this.locationForm.reset();
		this.closeModal.emit();
	}

	handleLatLng(){
		if(!this.locationForm.get('address').value){
			this.locationForm.patchValue({'lat_and_long': '', city: [''], state: [], zip: ['']  });
		}
	}

	

	regionChange($event) {
		if ($event && $event.selectedIndex){
			this.selectedRegion = this.dropDownRegion[$event.selectedIndex-1].name;
		}
	 }
	 selectionOnValueChange(e: any,Type?) {
		const info = new ShareAbleFilter(e);
		this.locationForm.patchValue(removeEmptyAndNullsFormObject(info));	
		if(Type == 'placeService') {
			if(!e.data) {
				this.locationForm.controls.place_of_service_id.setValue(null);
			}
		}	
	}
	touchedNgSelect(Type?) {
		if(Type == 'placeService') {
			this.locationForm.controls.place_of_service_id.markAsTouched();
		}
	}

}
