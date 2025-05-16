import { find } from 'lodash';
import {
	Component,
	OnInit,
} from '@angular/core';
import {
	FormControl,
	FormGroup,
} from '@angular/forms';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';

import { HttpSuccessResponse, StorageData } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import {
	AssignSpecialityUrlsEnum,
} from '@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
import {
	CustomizationUrlsEnum,
} from '@appDir/scheduler-front-desk/modules/customize/customization-urls-enum';
import { AclService } from '@appDir/shared/services/acl.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Observable } from 'rxjs';


import { CustomizeService } from '../../service/customize.service';

@Component({
	selector: 'app-preferences',
	templateUrl: './preferences.component.html',
	styleUrls: ['./preferences.component.scss'],
})
export class PreferencesComponent extends PermissionComponent implements OnInit {
	constructor(
		public request: RequestService,
		public customize: CustomizeService,
		public storageData: StorageData,
		private toastrService: ToastrService,
		public aclService?: AclService
	) {
		super(aclService);
	}
	preferenceTypes;
	allClinicIds;
	selectedPreferences;
	preferencesForm: FormGroup;
	locations;
	defaultActionPreferences:any;
	selectedClinic:any;
	preferenceLocation = [
		{ id: 0, name: 'Same Location' },
		{ id: 1, name: 'Any Location' },
	];

	ngOnInit() {
		this.allClinicIds = this.storageData.getFacilityLocations();
		this.preferencesForm = new FormGroup({
			type: new FormControl(''),
			preferenceLocation: new FormControl(''),
			targetedFascilityLocation: new FormControl(''),
		});
		this.bindOnChangeTargetFacilityLocation();
		if(!this.aclService.hasPermission(this.userPermissions.customize_preference_edit))
		{
			this.preferencesForm.disable();
		}
		// this.fetchActionPreferences();
		
		// let params = this.createDefaultParams();
		// this.customize.fetchLocations(params).subscribe((data) => {
		// 	this.locations = data['result']['data']['docs'];
		// 	console.log(this.locations);
			
		// });

		forkJoin([this.fetchActionPreferences(),this.GetBydefaultActionPreferences(),this.getCustomizationLocation()]).subscribe((response)=>{
			debugger;
			if(this.defaultActionPreferences)
			{
				this.setBydefaultPreferences();
			}
			else
			{
				let default_cancel_Preference=this.preferenceTypes.find(preference=>preference.slug=='cancel');
				if(default_cancel_Preference)
				{
					this.preferencesForm.patchValue({
						'type':default_cancel_Preference.id
					})
				}
				
			}
		})
		
	}

	setSelectedClinic(clinicId)
	{
	 let selectedClinic= this.locations.find(clinic=>clinic.id==clinicId);
	 if(selectedClinic)
	 {
	   this.selectedClinic=selectedClinic;
	 }
	 else
	 {
	  this.selectedClinic=null
	 }
  
	}
	bindOnChangeTargetFacilityLocation()
	{
		this.preferencesForm.get('targetedFascilityLocation').valueChanges.subscribe(val=>{
			this.setSelectedClinic(val)
		})
	}
	getCustomizationLocation():Observable<any>
	{
		let params = this.createDefaultParams();
		return new Observable(subscriber=>{
			this.customize.fetchLocations(params).subscribe((data) => {
				this.locations = data['result']['data']['docs'];
				 subscriber.next(true);
				 subscriber.complete()
				
			},
			error=>{
				subscriber.error();
			});

		})
	}

	fetchActionPreferences():Observable<any> {
		return new Observable(subscriber => {
		this.request
			.sendRequest(
				AssignSpecialityUrlsEnum.ActionPreferencesTypes,
				'GET',
				REQUEST_SERVERS.schedulerApiUrl1,
			)
			.subscribe((res) => {
				this.preferenceTypes = res['result'].data;
				// this.preferencesForm.patchValue({type:this.preferenceTypes[0].id})
				subscriber.next(true);
				subscriber.complete()
             	
			},error=>{
				subscriber.error();
			});
			
	})
}
	createDefaultParams() {
		const params = {
			facility_location_ids: this.allClinicIds,
			page: 1,
			per_page: 20,
		};
		return params;
	}
	 get selectedpreferenceType() {
		return this.preferencesForm.get('type').value;
	}

	 get SelectedpreferenceLocation() {
		return this.preferencesForm.get('preferenceLocation').value;
	}

	 get getTargetFascilityLocation() {
		return this.preferencesForm.get('targetedFascilityLocation').value;
	}

	applyPrefenceAction() {
		let s=this.selectedpreferenceType;
		switch (this.selectedpreferenceType) {
			case 1: {
				const body = {
					action_preference_id:(this.defaultActionPreferences&&this.defaultActionPreferences.id)?this.defaultActionPreferences.id:null ,
					type_id:this.selectedpreferenceType
				};
				this.submitActionPreferences(body);

				break;
			}
			case 2:
				const body = {
					facility_location_type: this.SelectedpreferenceLocation,
					action_preference_id: (this.defaultActionPreferences&&this.defaultActionPreferences.id)?this.defaultActionPreferences.id:null,
					type_id:this.selectedpreferenceType
				};
				this.submitActionPreferences(body);

				break;
			case 3:
				let bodyObject = [];
				this.locations.forEach((element) => {
					bodyObject.push({
						origin_id: element.id,
						target_id: this.getTargetFascilityLocation,
					});
					
				});
				let bodyobj={
					action_preference_id:(this.defaultActionPreferences&&this.defaultActionPreferences.id)?this.defaultActionPreferences.id:null,
					type_id:this.selectedpreferenceType,
					facility_location:bodyObject
				}

				this.submitActionPreferences(bodyobj);
				break;
			default: {
				break;
			}
		}
	}

	submitActionPreferences(body) {
		this.request
			.sendRequest(
				CustomizationUrlsEnum.updateActionPreferences,
				'PUT',
				REQUEST_SERVERS.schedulerApiUrl1,
				body,
			)
			.subscribe((res:HttpSuccessResponse) => {
				this.toastrService.success(res.message,'Success')
			});
	}

	GetBydefaultActionPreferences():Observable<any> {
		return new Observable(subscriber=>{
			this.request
			.sendRequest(
				CustomizationUrlsEnum.getActionPreferences,
				'GET',
				REQUEST_SERVERS.schedulerApiUrl1,
				
			)
			.subscribe((res:HttpSuccessResponse) => {
				debugger;
				this.defaultActionPreferences=res.result.data;
				// if(this.defaultActionPreferences)
				// {
				// 	this.setBydefaultPreferences();
				// }
				// this.preferencesForm.patchValue({
				// 	'type':this.defaultActionPreferences.type_id
				// })
				// this.toastrService.success(res.message,'Success')
				subscriber.next(true);
				subscriber.complete()
			},
			error=>{
				subscriber.error()
			});

		})
	}

	
	onChangePreferenceType()
	{
		let preferenceType=this.selectedpreferenceType;
		if(preferenceType==this.preferenceTypes[0].id)
		{

		}
		else if(preferenceType==this.preferenceTypes[1].id)
		{
			this.preferencesForm.patchValue({preferenceLocation:this.preferenceLocation[0].id})	
		}
		else if(preferenceType==this.preferenceTypes[2].id)
		{
			this.preferencesForm.patchValue({targetedFascilityLocation:this.locations[0].id})
		}
	}
	setBydefaultPreferences()
	{
		debugger;
		if(this.defaultActionPreferences.type_id==this.preferenceTypes[0].id)
		{
			this.preferencesForm.patchValue({
				'type':this.defaultActionPreferences.type_id
			})
		}
		else if(this.defaultActionPreferences.type_id==this.preferenceTypes[1].id)
		{
			this.preferencesForm.patchValue({
				type:this.defaultActionPreferences.type_id,
				preferenceLocation:this.defaultActionPreferences.facility_location_type
			});
			this.preferencesForm.updateValueAndValidity();
		}
		else if(this.defaultActionPreferences.type_id==this.preferenceTypes[2].id)
		{
			this.preferencesForm.patchValue({
				type:this.defaultActionPreferences.type_id,
				targetedFascilityLocation:(this.defaultActionPreferences.actionPreferencesFacilityLocations && 
											this.defaultActionPreferences.actionPreferencesFacilityLocations.length>0)?this.defaultActionPreferences.actionPreferencesFacilityLocations[0].target_id:this.locations[0].id
			})
		}
		else
		{
			this.preferencesForm.patchValue({
					'type':this.defaultActionPreferences.type_id
				})
		}
	}

	check(params) {
	}
}
