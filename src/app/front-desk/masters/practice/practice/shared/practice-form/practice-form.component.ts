import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { SignatureComponent } from './../../../../../../shared/signature/components/signature/signature.component';
import { Component, OnInit, Input, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { RequestService } from '@appDir/shared/services/request.service';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { FacilityUrlsEnum } from '@appDir/front-desk/masters/practice/practice/utils/facility-urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RegionUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/Region-Urls-Enum';
import { HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { makeDeepCopyObject, disableFormFields, enableFormFields, removeEmptyAndNullsFormObject, convertUTCTimeToTimeZone, statesList, makeDeepCopyArray,allStatesList } from '@appDir/shared/utils/utils.helpers';
import { Location, Practice } from '../../utils/practice.class';
import { DAYS } from '../../utils/days.enum';
import { Page } from '@appDir/front-desk/models/page';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { SignatureServiceService } from '@appDir/shared/signature/services/signature-service.service';
import { DocTypeEnum } from '@appDir/shared/signature/DocTypeEnum.enum';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { ZipFormatMessages } from '@appDir/shared/dynamic-form/constants/ZipFormatMessages.enum';

@Component({
	selector: 'app-practice-form',
	templateUrl: './practice-form.component.html',
	styleUrls: ['./practice-form.component.scss']
})
export class PracticeFormComponent extends PermissionComponent implements OnInit, OnChanges {
	public subscription: Subscription[] = [];
	public practiceForm: FormGroup;
	signature: any;
	listSignature: any[] = []
	@Input() practiceId: number;
	linkSingature:string;

	locationOption = {
		openModal: false,
		hideAddLocation: true
	}
	states = [];
	allStates=[];
	facilityPage: Page;
	zipFormatMessage=ZipFormatMessages;
	selectedState:string='';
	// public locationForm: FormGroup;
	public weekday = DAYS;
	public modalRef: NgbModalRef;
	public dropDownRegion: any[];
	public showLocation = true;
	public practiceLocations = {
		data: [] as Location[],
		total: 1 as number
	};
	stateList:any;
	
	@ViewChild('signatureComponent') signatureComponent :SignatureComponent; 
	constructor(
		aclService: AclService,
		private fb: FormBuilder,
		private fdService: FDServices,
		router: Router,
		private toastrService: ToastrService,
		private modalService: NgbModal,
		requestService: RequestService,
		titleService: Title,
		private _route: ActivatedRoute,
		private signatureService: SignatureServiceService,
		private el:ElementRef,
		private caseFlowService:CaseFlowServiceService,
		private canDeactivateModelComponentService: CanDeactivateModelComponentService) {
		super(aclService, router, _route, requestService, titleService);
		this.facilityPage = new Page();
		this.facilityPage.pageNumber = 0;
		this.facilityPage.size = 10;
		
	}

	disableAddLocationBtn: boolean = false
	selectedId: number;
	getSignature() {
		this.signatureService.getSignature(this.practiceId, DocTypeEnum.facilitySignature).subscribe(data => { this.listSignature = data['result']['data']; this.listSignature[0] ? this.selectedId = this.listSignature[0].id : null })
	}

	openLocationModal() {

		this.locationOption.openModal = true;
		this.disableAddLocationBtn = true;
		setTimeout(() => {
			this.disableAddLocationBtn = false;
			// this.locationOption.openModal = true;

		}, 300)
		this.locationOption = makeDeepCopyObject(this.locationOption)
	}
	getRegions() {
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
				),
		);
	}
	// openModal(facilityLocation) {
	//   // this.office_hours_start = null;
	//   // this.office_hours_end = null;
	//   const ngbModalOptions: NgbModalOptions = {
	//     backdrop: 'static',
	//     size: 'lg',
	//     keyboard: false,
	//     windowClass: 'modal_extraDOc',
	//   };
	//   this.modalRef = this.modalService.open(facilityLocation, ngbModalOptions);
	// }

	addLocation(formData) {

		let request = { method: 'POST', API_URL: FacilityUrlsEnum.Facility_Location_Post }
		formData.facility_id = this.practiceId;

		this.subscription.push(
			this.requestService
				.sendRequest(request.API_URL, request.method, REQUEST_SERVERS.fd_api_url, formData)
				.subscribe(
					(resp) => {
						this.toastrService.success('Successfully added', 'Success');
						this.getPracticeLocation();
						this.router.navigate(['/front-desk/masters/practice/practice/list']);
					},
					(err) => {
					},
				),
		);

	}
	updateListing() {
		// this.practiceLocations = makeDeepCopyObject(this.practiceLocations);
		this.onSubmit();
	}
	onAddLocation(formData) {
		if (this.practiceId) {
			this.addLocation(formData);

		} else {
			this.practiceLocations.data.push(formData);
			this.practiceLocations.total++;
			this.updateListing();

			// const practiceLocations = {
			//   data: data,
			//   total: total
			// }
			// this.practiceLocations = practiceLocations;
		}
	}

	
	selectedPracticeState:string='';
	practiceStateChange(event)
	{
		this.selectedPracticeState=event.fullName;		
	}

	onEditLocation(formData) {

		let request = { method: 'PUT', API_URL: FacilityUrlsEnum.Facility_Location_Put }
		// formData.facility_id = this.practiceId;
		// formData.id = formData.formData && formData.formData.id;
		this.subscription.push(
			this.requestService
				.sendRequest(request.API_URL, request.method, REQUEST_SERVERS.fd_api_url, formData.formData ? formData.formData : formData )
				.subscribe(
					(resp) => {
						this.toastrService.success('Successfully updated', 'Success');
						this.getPracticeLocation()
					},
					(err) => {
					},
				),
		);

	}



	/**
	* Returns location formgroup. This is for html 
	* @param	{number} index 
	* @return	{FormGroup}	Location Formgroup 
	*/
	public getLocationForm = (index: number): FormGroup => {
		return this.practiceForm.controls.locations['controls'][index];
	}


	/**
	* Returns location formgroup. This is for html 
	* @param	{number} locationIndex {number} billingIndex  
	* @return	{FormGroup}	Billing Formgroup
	*/
	public getBillingForm = (locationIndex: number, billingIndex: number): FormGroup => {
		return this.practiceForm.controls.locations['controls'][locationIndex]['controls']['billing']['controls'][billingIndex];
	}

	public toggleShow = () => {
		this.showLocation = !this.showLocation;

	}
	public cancel = () => {
			if ((this.practiceForm.dirty && this.practiceForm.touched)) {
				this.canDeactivateModelComponentService.canDeactivate().then(res => {
					let result = res;
					if (res) {
						this.router.navigate(['front-desk/masters/practice']);
						this.modalRef.close();
					}
					else {
						return true;
					}
				});
			}
			else {
				this.router.navigate(['front-desk/masters/practice']);
				this.modalRef.close();
			}
		
	}

	/**
  * Address change handler. Loads the values in the form according to its type
  * @param {Address} address 
  * @param {string?} type 
	*/
	public handleAddressChange(address: Address, type?: string) {
		const street_number = this.fdService.getComponentByType(address, 'street_number');
		const route = this.fdService.getComponentByType(address, 'route');
		const city = this.fdService.getComponentByType(address, 'locality');
		const state = this.fdService.getComponentByType(address, 'administrative_area_level_1');
		const postal_code = this.fdService.getComponentByType(address, 'postal_code');
		const lat = address.geometry.location.lat();
		const lng = address.geometry.location.lng();
		const _address = (street_number.long_name ? street_number.long_name + ' ' : '') + route.long_name;
		switch (type) {
			case 'biller':
				this.getBillingForm(0, 0).patchValue(
					removeEmptyAndNullsFormObject({
						address: _address,
						city: city.long_name,
						state: state.long_name,
						zip: postal_code.long_name,
					}));
					this.stateBillingChange(state.short_name);
				break;
			case 'practice':
				this.getLocationForm(0).patchValue(
					removeEmptyAndNullsFormObject({
						address: _address,
						city: city.long_name,
						state: state.long_name,
						zip: postal_code.long_name,
					}));
					this.stateChange(state.short_name);
				break;
		}
	}


	/**
	* toggles same_as_provider value in location form 
	*/
	onCopyProvider = () => {
		this.getLocationForm(0).controls['same_as_provider'].setValue(!this.getLocationForm(0).controls['same_as_provider'].value)
		this.selectedPracticeState='';
	}

	/**
	* Sets or unsets billing form values same as practice  
	* @param	{FormControl} billingControl    Form control for billing form
	* @param	{?FormControl} locationControl  Form control for location form    
	* @return	{void}
	*/
	setBillingSameAsProvider(billingControl, locationControl?, notEmitEvent?) {
		billingControl.patchValue({
			provider_name: (locationControl) ? this.practiceForm.get('name').value : '',
			city: (locationControl) ? locationControl.get('city').value : '',
			address: (locationControl) ? locationControl.get('address').value : '',
			state: (locationControl) ? locationControl.get('state').value : '',
			zip: (locationControl) ? locationControl.get('zip').value : '',
			stateName:(locationControl) ? locationControl.get('stateName').value : '',
			state_id:(locationControl) ? locationControl.get('state_id').value : '',
			floor: (locationControl) ? locationControl.get('floor').value : '',
			phone: (locationControl) ? locationControl.get('phone').value : '',
			ext_no: (locationControl) ? locationControl.get('ext_no').value : '',
			cell_no: (locationControl) ? locationControl.get('cell_no').value : '',
			fax: (locationControl) ? locationControl.get('fax').value : '',
			email: (locationControl) ? locationControl.get('email').value : '',

		}, { emitEvent: !notEmitEvent });
	}


	/**
	* Returns provider billing form 
	* @param	void	if this is going to be a main location or not   
	* @return	{FormGroup}	New form group
	*/
	private createProviderBilling():any {
		return this.fb.group({
			id: [''],
			provider_name: [''],
			city: [''],
			address: [''],
			state: [''],
			stateName:[''],
			state_id:[null],
			zip: ['',[Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')]],
			floor: [''],
			phone: [''],
			ext_no: [''],
			cell_no: [''],
			fax: [''],
			email: [null,[Validators.pattern(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]],
			npi: [''],
			tin: [''],
			ssn: [''],
			tax_id_check: [''],
			generate_document_using: [''],
			dean:[''],
			dol: [''],
		});
	}


	/**
	* Returns array of forms for Provider Billing 
	* @param	void 
	* @return	{FormArray}	New form group
	*/
	private createProviderBillingArray = (): FormArray => {
		let formArray = this.fb.array([]);
		formArray.push(this.createProviderBilling());
		return formArray;
	}


	/**
	* Returns a newly created form group for timing
	* @param	void   
	* @return	{FormGroup}	New form group for timing
	*/
	private createTiming = (day_id): FormGroup => {
		return this.fb.group({
			day_id: [day_id],
			start_time: [''],
			end_time: [''],
		});
	}


	/**
	* Returns a newly created form array for timing
	* @param	void   
	* @return	{FormArray}	New form array for timing
	*/
	private createTimingsArray = (): FormArray => {
		let formArray = this.fb.array([]);

		// this.weekday.forEach((day) => {
		//   formArray.push(this.createTiming(day.id));
		// });
		return formArray;
	}



	/**
	* Returns a newly created formgroup for location
	* @param	{boolean}	isMain	if this is going to be a main location or not   
	* @return	{FormGroup}	New form group
	*/
	private createSingleLocation (isMain: boolean = false):any {
		let name = (isMain) ? [''] : ['', [Validators.required]];
		let formgroup = this.fb.group({
			id: [''],
			name: name,
			address: [''],
			city: [''],
			state: [''],
			stateName:[''],
			state_id:[null],
			zip: ['',[Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')]],
			floor: [''],
			phone: [''],
			ext_no: [''],
			cell_no: [''],
			fax: [''],
			email: [null,[Validators.pattern(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]],
			office_hours_start: [''],
			office_hours_end: [''],
			region_id: [''],
			lat: [''],
			qualifier: [''],
			long: [''],
			place_of_service_id: [''],
			is_main: [(isMain) ? true : false],
			same_as_provider: [false],
			billing: this.createProviderBillingArray(),
			timing: this.createTimingsArray(),
			dean:[''],
		});
		this.subscription.push(
			formgroup.controls['same_as_provider'].valueChanges.subscribe(val => {
				debugger;
				let billingControl = this.getBillingForm(0, 0);
				let locationControl = this.getLocationForm(0);
				if (val) {
					this.setBillingSameAsProvider(billingControl, locationControl)
					disableFormFields(billingControl, 'provider_name', 'city', 'address', 'state', 'zip', 'floor', 'phone', 'ext_no', 'ext_no', 'cell_no', 'fax', 'email');
				} else {
					enableFormFields(billingControl, 'provider_name', 'city', 'address', 'state', 'zip', 'floor', 'phone', 'ext_no', 'ext_no', 'cell_no', 'fax', 'email');
				}
				// val ?  : null;//this.setBillingSameAsProvider(billingControl);
			})
		);
		return formgroup;
	}
	// disableFormFields(form: FormGroup, ...fields: string[]) {
	// 	fields.forEach(field => {
	// 		;
	// 		form.controls[field].disable();
	// 	})
	// }

	// enableFormFields(form: FormGroup, ...fields: string[]) {
	// 	fields.forEach(field => {
	// 		form.controls[field].disable();
	// 	})
	// }


	/**
	* Returns array of forms for locations 
	* @param	void 
	* @return	{FormArray}	New form group
	*/
	private createLocationsArray() :any {
		let formArray = this.fb.array([]);
		formArray.push(this.createSingleLocation(true));
		return formArray;
	}


	/**
	* Returns newly initialized form for practice 
	* @param	void 
	* @return	{FormGroup}	Formgroup
	*/
	private initializePracticeForm = (): FormGroup => {
		return this.fb.group({
			name: ['', [Validators.required]],
			qualifier: ['', [Validators.required]],
			generate_document_using: [''],
			locations: this.createLocationsArray(),
		});
	}

	getPracticeLocation(event?) {
		let paginationQueryParam;
		if(this.practiceId) {
			if(event) {
				paginationQueryParam =  { pagination: true, order: OrderEnum.ASC, filter: false, id: this.practiceId, per_page: event.size, page: this.facilityPage.pageNumber }
			} else {
				paginationQueryParam =  { pagination: true, order: OrderEnum.ASC, filter: false, id: this.practiceId, per_page: 10, page: this.facilityPage.pageNumber }
			}
		} else {
			paginationQueryParam =  { pagination: true, order: OrderEnum.ASC, filter: false,per_page: event.size, page: this.facilityPage.pageNumber }
		}
		this.startLoader = true;
		this.requestService.sendRequest(FacilityUrlsEnum.Facility_List_Location_Get, 'get', REQUEST_SERVERS.fd_api_url,paginationQueryParam)
			.subscribe((response: HttpSuccessResponse) => {
				debugger;
				this.startLoader = false;
				response.result.data.forEach(location => {
					location.timing.map((timing) => {
						debugger;
						location;
						console.log("location" ,location);
						console.log("location" ,timing);

						timing.start_time = convertUTCTimeToTimeZone(timing.start_time, timing.time_zone_string,timing.time_zone);
						timing.end_time = convertUTCTimeToTimeZone(timing.end_time, timing.time_zone_string,timing.time_zone);
						return timing;
					});
				});
				this.practiceLocations.data = response.result.data;
				this.practiceLocations.total = response.result.total;

				// this.practiceLocations.data.map(facility => {
				// 	response['result']['data'].forEach(location => {
				// 		location.timing.map((timing) => {
				// 		  timing.start_time = convertUTCTimeToTimeZone(timing.start_time, timing.time_zone_string);
				// 		  timing.end_time = convertUTCTimeToTimeZone(timing.end_time, timing.time_zone_string);
				// 		  return timing;
				// 		});
				// 	  });

				// 	  facility.data = [...data['result']['data']]


				//   })
			}, err => {
				this.startLoader = false;
			})
	}


	/**
	* Saves or updates the data submitted by user 
	*
	* @param	void 
	* @return	void
	*/
	onSubmit = (): void => {
		if(!this.practiceForm.valid) {
			let firstInvalidControl: HTMLElement =
			this.el.nativeElement.querySelector('form .ng-invalid');
			if(firstInvalidControl) {
				this.caseFlowService.scrollToFirstInvalidControl(firstInvalidControl);
				return;
			}
		}
		let formValues: Practice = this.practiceForm.getRawValue();
		formValues['generate_document_using'] = this.getBillingForm(0, 0).get('generate_document_using').value;
		let request = { method: 'POST', API_URL: FacilityUrlsEnum.Facility_list_POST }
		if (this.practiceId) {
			request = { method: 'PUT', API_URL: FacilityUrlsEnum.Facility_PUT }
			formValues.id = this.practiceId;
		} else {
			formValues.locations = [formValues.locations[0], ...this.practiceLocations.data];
		}
		this.startLoader = true;
		this.subscription.push(
			// this.fdService.regionUsedFacilityDropDown()
			this.requestService
				.sendRequest(request.API_URL, request.method, REQUEST_SERVERS.fd_api_url, formValues)
				.subscribe(
					(resp:any) => {

						let id = resp['result']['data']['id']
						this.signatureService.createSignature(id, this.signature.signature_file, DocTypeEnum.facilitySignature, this.signature.file_title).subscribe(data => {
							this.startLoader = false;
							this.practiceForm.reset();
							this.toastrService.success(resp.message, 'Success');
							this.router.navigate(['/front-desk/masters/practice/practice/list']);
						}, err => {
							// this.toastrService.error(err);
							this.startLoader = false;
						})


					},
					(err) => {
						// this.toastrService.error(err);
						this.practiceLocations.data= [] as Location[];
						this.practiceLocations.total=1
						this.startLoader = false;
					},
				),
		);
	}


	ngOnDestroy() {
		this.caseFlowService.removeScrollClasses();
		unSubAllPrevious(this.subscription);

	}

	updateBillingForm(form, control1, control2) {

		form.get(control1).valueChanges.subscribe(value => {
			if (this.getLocationForm(0).controls['same_as_provider'].value) {
				let obj = {};
				obj[control2] = value
				this.getBillingForm(0, 0).patchValue(obj);
			}
		});
	}
	ngOnInit() {

		this.getStateList();
		this.practiceForm = this.initializePracticeForm();
		this.practiceForm.get('name').valueChanges.subscribe(value => {
			if (this.getLocationForm(0).controls['same_as_provider'].value) {
				this.getBillingForm(0, 0).patchValue(
					{
						provider_name: value
					}
				);
			}
		});
		this.updateBillingForm(this.getLocationForm(0), 'address', 'address');
		this.updateBillingForm(this.getLocationForm(0), 'floor', 'floor');
		this.updateBillingForm(this.getLocationForm(0), 'city', 'city');
		this.updateBillingForm(this.getLocationForm(0), 'state', 'state');
		this.updateBillingForm(this.getLocationForm(0), 'zip', 'zip');
		this.updateBillingForm(this.getLocationForm(0), 'phone', 'phone');
		this.updateBillingForm(this.getLocationForm(0), 'cell_no', 'cell_no');
		this.updateBillingForm(this.getLocationForm(0), 'fax', 'fax');
		this.updateBillingForm(this.getLocationForm(0), 'ext_no', 'ext_no');
		this.updateBillingForm(this.getLocationForm(0), 'email', 'email');
		this.getRegions();
		this.caseFlowService.addScrollClasses();
		// this.getLocationForm(0).valueChanges.subscribe(value => {
		// 	console.log(this.practiceForm.get('name'));
		// 	if (this.getLocationForm(0).controls['same_as_provider'].value) {
		// 		this.getBillingForm(0, 0).patchValue(
		// 			{
		// 				address: value.address,
		// 				floor: value.floor,
		// 				city: value.city,
		// 				state: value.state,
		// 				zip: value.zip,
		// 				// phone: value.phone,
		// 				// cell_no: value.cell_no,
		// 				// fax: value.fax,
		// 				// ext_no: value.ext_no,
		// 				email: value.email
		// 			}
		// 			, {
		// 				onlySelf: true,
		// 				emitEvent: false
		// 			})
		// 	}
		// })
	}

	getSinglePractice() {
		this.startLoader = true;
		this.subscription.push(
			this.requestService
				.sendRequest(FacilityUrlsEnum.Facility_list_GET_ById, 'GET', REQUEST_SERVERS.fd_api_url, { id: this.practiceId })
				.subscribe(
					(resp: HttpSuccessResponse) => {
						this.practiceForm.patchValue(resp.result.data);
						this.startLoader = false;
						if (resp.result.data.locations[0].same_as_provider) {
							let billingControl = this.getBillingForm(0, 0);
							disableFormFields(billingControl, 'provider_name', 'city', 'address', 'state', 'zip', 'floor', 'phone', 'ext_no', 'ext_no', 'cell_no', 'fax', 'email');
						}
					},
					(err) => {
						this.practiceForm.enable();
						this.startLoader = false;
					},
				),
		);
	}
	ngOnChanges() {
		if (this.practiceId) {
			this.getSinglePractice();
			this.getPracticeLocation();
			this.getSignature();
		}

	}
	onDeleteSignature($event){

		if ($event === this.selectedId){
			this.signatureComponent.clearLink();
		}

		
	}
	onSignatureDelete(event) {
		this.listSignature = makeDeepCopyArray(this.listSignature)
	}

	getStateList(){
		this.requestService
				.sendRequest(
					RegionUrlsEnum.State_list_GET,
					'GET',
					REQUEST_SERVERS.fd_api_url,
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
	stateBillingChange(event)
	{
		const control = <FormArray>this.practiceForm.controls['locations'];
		const bill= <FormArray> control.at(0).get("billing")
		this.stateList.find(e=>{
			if(e.code==event)
			{
				bill.at(0).get("state_id").patchValue(e.id);
				bill.at(0).get("stateName").patchValue(e.name);
			}
		});

		
		
	}
	stateChange(event)
	{
		const control = <FormArray>this.practiceForm.controls['locations'];
		this.stateList.find(e=>{
			if(e.code==event)
			{
				control.at(0).get("state_id").patchValue(e.id);
				control.at(0).get("stateName").patchValue(e.name);
			}
		});
	
		
		
	}
}
