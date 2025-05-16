import { OnDestroy } from '@angular/core';
import { OnChanges } from '@angular/core';
import { unSubAllPrevious } from '@shared/utils/utils.helpers';
import { Observable, Subscription } from 'rxjs';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';


import { AclService } from '@appDir/shared/services/acl.service';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { removeEmptyAndNullsFormObject, statesList } from '@appDir/shared/utils/utils.helpers';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { ZipFormatMessages } from '@appDir/shared/dynamic-form/constants/ZipFormatMessages.enum';
import { DoctorCalendarEnum } from '../../doctor-calendar-transportation-enum';
import { HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { DoctorCalendarUrlsEnum } from '../../doctor-calendar-urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { ToastrService } from 'ngx-toastr';


@Component({
	selector: 'app-transportation-modal ',
	templateUrl: './transportation-modal.component.html',
	styleUrls: ['./transportation-modal.component.scss'],
	
})
export class TransportationModalComponent   implements OnInit,OnChanges,OnDestroy {
	@Input() patientId:number
	@Input() physician_id:number;
	@Input() clinic_location_id:number;
	transportationForm: FormGroup;
	loadSpin:boolean=false
	states:any[]=[];
	zipFormatMessage = ZipFormatMessages;
	DoctorCalendarEnum=DoctorCalendarEnum;
	selectedPatient:any;
	selectedPhysician:any;
	subscription: Subscription[] = [];
	@Input()transportationFormObj :any;
	@Input() onlyView:boolean=false;
	@Input() openAsModal:boolean=true;
	@Input() openFrom:string;
	@Input() updateOnRunTime: Observable<Boolean>;
	constructor(
		aclService: AclService,
		router: Router,
		protected requestService: RequestService,
		public activeModal: NgbActiveModal, 
		private formBuilder: FormBuilder, 
		private toastrService: ToastrService,
		private fdService: FDServices,
		) {
		// super(aclService, router);
		this.createForm()
	}
	ngOnInit() {
		debugger;
		
		this.states = statesList;
		
		if(this.transportationFormObj)
		{
			this.setvaluesToForm();
		}
		this.bindPickupTransportation();
		this.bindDropOffTransportation();
		if(this.onlyView)
		{
			this.disableForm();
		}
		
		
		
	}
	bindValuesOnRunTime(obj){
				this.transportationFormObj = {...obj}
				if(this.transportationFormObj){
					this.setvaluesToForm();
				}
	}
	setvaluesToForm(){
		if(this.transportationFormObj.pickupForm)
			{
				this.pickUpForm.patchValue(this.transportationFormObj.pickupForm,{emitEvent: false, onlySelf: false});
				if(this.transportationFormObj.pickupForm.type=='from_home')
				{
					this.getPatientDetails(this.pickUpForm,true);
				}
				else if(this.transportationFormObj.pickupForm.type=='from_medical_office')
				{
					this.getPhysiciansDetails(this.pickUpForm,true)
				}

				
			}
			if(this.transportationFormObj.dropoffForm)
			{
				this.dropOffForm.patchValue(this.transportationFormObj.dropoffForm,{emitEvent: false, onlySelf: false});
				if(this.transportationFormObj.dropoffForm.type=='from_home')
				{
					this.getPatientDetails(this.dropOffForm,false);
				}
				else if(this.transportationFormObj.dropoffForm.type=='from_medical_office')
				{
					this.getPhysiciansDetails(this.dropOffForm,false)
				}
			}
	}
	ngOnChanges(changes: SimpleChanges): void {
		console.log(changes);
		if(!this.openAsModal &&  changes.patientId && !changes.patientId.currentValue)
		{
			debugger;
			this.resetTransportationForm();
			let pickType= this.pickUpForm.get('type').value
			this.onPickupTypeChange(pickType);
			let dropOffType=this.dropOffForm.get('type').value
			this.ondropOffTypeChange(dropOffType);
		}
		else if(!this.openAsModal && changes.patientId && changes.patientId.currentValue)
		{
			debugger;
			let pickType= this.pickUpForm.get('type').value
			this.onPickupTypeChange(pickType);
			let dropOffType=this.dropOffForm.get('type').value
			this.ondropOffTypeChange(dropOffType);
			// this.enableForm();
		}

		if(!this.openAsModal &&  changes.physician_id && !changes.physician_id.currentValue)
		{
			debugger;
			// this.resetTransportationForm();
			let pickType= this.pickUpForm.get('type').value
			this.onPickupTypeChange(pickType);
			let dropOffType=this.dropOffForm.get('type').value
			this.ondropOffTypeChange(dropOffType);
		}

		else if(!this.openAsModal && changes.physician_id && changes.physician_id.currentValue)
		{
			let pickType= this.pickUpForm.get('type').value
			this.onPickupTypeChange(pickType);
			let dropOffType=this.dropOffForm.get('type').value
			this.ondropOffTypeChange(dropOffType);
		}
	
	}

	ngOnDestroy(): void {
		//Called once, before the instance is destroyed.
		//Add 'implements OnDestroy' to the class.
		unSubAllPrevious(this.subscription);
		
	}
	
	private createForm() {
		this.transportationForm = this.formBuilder.group({
			pickupForm : this.formBuilder.group({
				id:[''],
			is_pickup:[true],
			type: ['', ],
			comments: ['', ],
			pick_up_address: [{value:'',disabled:true}, ],
			street_address: [''],
			suit: [''],
			city: [''],
			state: [''],
			zip: [''],
			phone:['']
			}),
			dropoffForm : this.formBuilder.group({
				id:[''],
				is_dropoff:[true],
				type: ['', ],
				comments: ['', ],
				dropoff_address:[{value:'',disabled:true}],
				street_address: [''],
				suit: [''],
				city: [''],
				state: [''],
				zip: [''],
				phone:['']
				})
		});
	}
	get pickUpForm() { return this.transportationForm.get('pickupForm') as FormGroup }
	get dropOffForm() { return this.transportationForm.get('dropoffForm') as FormGroup }

	
	
	onSubmit(form:any) {
		console.log(form);

		this.activeModal.close({data:form.value});

	}

	closeModel()
	{
	this.activeModal.close()
	}

	public handleAddressChange(address: Address, formgroup:FormGroup) {
		const street_number = this.fdService.getComponentByType(address, 'street_number');
		const route = this.fdService.getComponentByType(address, 'route');
		const city = this.fdService.getComponentByType(address, 'locality');
		const state = this.fdService.getComponentByType(address, 'administrative_area_level_1');
		const postal_code = this.fdService.getComponentByType(address, 'postal_code');
		const lat = address.geometry.location.lat();
		const lng = address.geometry.location.lng();
		const _address = (street_number.long_name ? street_number.long_name + ' ' : '') + route.long_name;
		formgroup.patchValue(
			removeEmptyAndNullsFormObject({
				street_address: _address,
				city: city.long_name,
				state: state.long_name,
				zip: postal_code.long_name,
			}));
	}


	bindPickupTransportation()
	{
		this.subscription.push(this.pickUpForm.get('type').valueChanges.subscribe(type=>{
			debugger;
			this.onPickupTypeChange(type)


		})
		);
	}

	onPickupTypeChange(type)
	{
		debugger;
		let allAddressField:any[]=['pick_up_address','street_address','suit','city','state','zip','phone'];
		switch(type)
		{
			case DoctorCalendarEnum.no_pick_up:{
				this.resetFormControl(this.pickUpForm,allAddressField);
				this.removeFormControlValidation(this.pickUpForm,['street_address','city','state','zip'])
				break;

			}
			case DoctorCalendarEnum.from_home:{

				if(!this.patientId)
				{
					 
					this.toastrService.error('Please add case Id first','Error');
					this.pickUpForm.get('type').patchValue(null,{emitEvent:false})
					break;
				}

				this.resetFormControl(this.pickUpForm,['street_address','suit','city','state','zip','phone']);
				this.removeFormControlValidation(this.pickUpForm,['street_address','city','state','zip'])
				this.getPatientDetails(this.pickUpForm,true);
				break;
				
			}
			case DoctorCalendarEnum.from_medical_office:{
				this.resetFormControl(this.pickUpForm,['street_address','suit','city','state','zip','phone']);
				this.removeFormControlValidation(this.pickUpForm,['street_address','city','state','zip']);
				if(!this.physician_id)
				{
					// this.setFormControlValidation(this.pickUpForm,['street_address','city','state','zip'])
					this.pickUpForm.patchValue({type: ''});
				}
				this.getPhysiciansDetails(this.pickUpForm,true);
				break;

			}

			case DoctorCalendarEnum.other:{
				this.resetFormControl(this.pickUpForm,['pick_up_address','street_address','suit','city','state','zip','phone']);
				// this.setFormControlValidation(this.pickUpForm,['street_address','city','state','zip'])
				break;
				
			}
			default:{

				this.resetFormControl(this.pickUpForm,allAddressField);	
				this.removeFormControlValidation(this.pickUpForm,['street_address','city','state','zip']);
				}
		}
	}



	bindDropOffTransportation()
	{
		this.subscription.push(this.dropOffForm.get('type').valueChanges.subscribe(type=>{
			this.ondropOffTypeChange(type)

		})
		);
	}

	ondropOffTypeChange(type)
	{
		let allAddressField:any[]=['dropoff_address','street_address','suit','city','state','phone','zip'];
			switch(type)
			{
				case DoctorCalendarEnum.no_drop_off :{
					this.resetFormControl(this.dropOffForm,allAddressField);
					this.removeFormControlValidation(this.dropOffForm,['street_address','city','state','phone','zip'])

					break;
				}
				case DoctorCalendarEnum.from_home:{
					if(!this.patientId)
					{
						
						this.toastrService.error('Please add case Id first','Error');
						this.dropOffForm.get('type').patchValue(null,{emitEvent:false})
						break;
					}
					this.resetFormControl(this.dropOffForm,['street_address','suit','city','state','zip']);
					this.removeFormControlValidation(this.dropOffForm,['street_address','city','state','zip'])
					this.getPatientDetails(this.dropOffForm,false);
					break;
				}
				case DoctorCalendarEnum.from_medical_office:{
					this.resetFormControl(this.dropOffForm,['street_address','suit','city','state','zip']);
					if(!this.physician_id)
					{
						// this.setFormControlValidation(this.dropOffForm,['street_address','city','state','zip'])
						this.dropOffForm.patchValue({type: ''});
					}
					this.getPhysiciansDetails(this.dropOffForm,false);
					break;
				}

				case DoctorCalendarEnum.other:{
					this.resetFormControl(this.dropOffForm,['dropoff_address','street_address','suit','city','phone','state','zip']);
					// this.setFormControlValidation(this.dropOffForm,['street_address','city','state','zip'])

					break;
					
				}
				default:{
					
					this.resetFormControl(this.dropOffForm,allAddressField);
					this.removeFormControlValidation(this.dropOffForm,['street_address','city','phone','state','zip'])
					}
			}
	}

	resetFormControl(formgroup:FormGroup,resetControl:any[])
	{
		resetControl.map(name => {
				formgroup.get(name).reset(null,{emitEvent:false}) ;
			})
	}

	disableForm()
	{
		this.pickUpForm.disable({emitEvent: false, onlySelf: true});
		this.dropOffForm.disable({emitEvent: false, onlySelf: true});
	}

	enableForm()
	{
		this.pickUpForm.enable({emitEvent: false, onlySelf: true});
		this.dropOffForm.enable({emitEvent: false, onlySelf: true});
	}


	setFormControlValidation(formgroup:FormGroup,resetControl:any[])
	{
		resetControl.map(name => {
				formgroup.get(name).setValidators([Validators.required]) ;
				if(name='zip')
				{
					formgroup.get(name).setValidators([Validators.required,Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')]) ;
				}
				formgroup.get(name).updateValueAndValidity({emitEvent:false});
			})
	}

	removeFormControlValidation(formgroup:FormGroup,resetControl:any[])
	{
		resetControl.map(name => {
				formgroup.get(name).clearValidators();
				formgroup.get(name).updateValueAndValidity({emitEvent:false});
			})
	}



	getPatientDetails(formGroup:FormGroup,isPickupForm)
	{

		debugger;
		let req={
			ids:this.patientId
		}
		this.loadSpin=true
		this.requestService
			.sendRequest(
				DoctorCalendarUrlsEnum.getpatientDetails,
				'GET',
				REQUEST_SERVERS.kios_api_path,
				req
	
			)
			.subscribe((res: HttpSuccessResponse) => {
				this.loadSpin=false
				this.selectedPatient=res && res.result && res.result.data && res.result.data[0];
				let patientSelfAddress= this.selectedPatient && this.selectedPatient.self &&
				this.selectedPatient.self.contact_information &&  this.selectedPatient.self.contact_information.mail_address
				if(patientSelfAddress)
				{
					let pick_up_address=`${patientSelfAddress.street||''}${patientSelfAddress.apartment?', '+patientSelfAddress.apartment:''}, ${patientSelfAddress.city||''}, ${patientSelfAddress.state||''} ${patientSelfAddress.zip||''}`
					formGroup.patchValue({
						street_address: patientSelfAddress.street||'' ,
						suit:patientSelfAddress.apartment||'' ,
						city: patientSelfAddress.city||'' ,
						state: patientSelfAddress.state||'' ,
						zip: patientSelfAddress.zip ||'',
						})
						if(isPickupForm)
						{
							formGroup.patchValue({
								pick_up_address:pick_up_address||'' ,
							
							})
						}
						else
						{
							formGroup.patchValue({
								dropoff_address:pick_up_address||'' ,
							
							})
						}
				}
				
				},err=>{
					this.loadSpin=false;
					formGroup.patchValue({
						street_address: '' ,
						suit:'' ,
						city: '' ,
						state: '' ,
						zip: '',
						})
						if(isPickupForm)
						{
							formGroup.patchValue({
								pick_up_address:'' ,
							
							})
						}
						else
						{
							formGroup.patchValue({
								dropoff_address:'' ,
							
							})
						}
				})
	}

	getPhysiciansDetails(formGroup:FormGroup,isPickupForm)
	{
		if(!this.physician_id)
		{
			return ;
		}
		let req={
			physician_id:this.physician_id,
			clinic_location_id: this.clinic_location_id
		}
		this.loadSpin=true
		this.requestService
			.sendRequest(
				DoctorCalendarUrlsEnum.get_physician_address,
				'GET',
				REQUEST_SERVERS.fd_api_url,
				req
	
			)
			.subscribe((res: HttpSuccessResponse) => {
				this.loadSpin=false
				console.log(res)
				this.selectedPhysician=res && res.result && res.result.data && res.result.data;
				let pick_up_address=`${this.selectedPhysician.address}${this.selectedPhysician.floor?', '+this.selectedPhysician.floor:''}, ${this.selectedPhysician.city||''}, ${this.selectedPhysician.state||''} ${this.selectedPhysician.zip||''}`
				formGroup.patchValue({
				street_address: this.selectedPhysician.address||'' ,
				suit:this.selectedPhysician.floor ||'' ,
				city: this.selectedPhysician.city ||'',
				state: this.selectedPhysician.state ||'',
				zip: this.selectedPhysician.zip||'' ,
				phone:this.selectedPhysician.phone||''
				})
				if(isPickupForm)
				{
					formGroup.patchValue({
						pick_up_address:pick_up_address||'' ,
						phone:this.selectedPhysician.phone||''
					
					})
				}
				else
				{
					formGroup.patchValue({
						dropoff_address:pick_up_address||'' ,
					})
				}
			},err=>{
				this.loadSpin=false;
				formGroup.patchValue({
					street_address: '' ,
					suit:'' ,
					city: '' ,
					state: '' ,
					zip: '' ,
					});
					if(isPickupForm)
				{
					formGroup.patchValue({
						pick_up_address:'' ,
						phone:''
					
					})
				}
				else
				{
					formGroup.patchValue({
						dropoff_address:'' ,
					
					})
				}
			})
	}

	resetTransportationForm()
	{
		let allAddressFieldPickup:any[]=['type','pick_up_address','street_address','suit','city','state','zip','phone'];
		this.resetFormControl(this.pickUpForm,allAddressFieldPickup);
		this.removeFormControlValidation(this.pickUpForm,['street_address','city','state','zip'])
		let allAddressFieldDropoff:any[]=['type','dropoff_address','street_address','suit','city','state','zip'];
		this.resetFormControl(this.dropOffForm,allAddressFieldDropoff);
		this.removeFormControlValidation(this.pickUpForm,['street_address','city','state','zip']);
		// this.disableForm();
	}

	markFormGroupTouched(formGroup: FormGroup) {
		(<any>Object).values(formGroup.controls).forEach(control => {
		  if (control.controls) { // control is a FormGroup
			this.markFormGroupTouched(control);
		  } else { // control is a FormControl
			control.markAsTouched();
		  }
		});
	   }
}
