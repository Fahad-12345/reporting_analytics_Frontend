import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';

import { environment } from 'environments/environment';
import { Options } from 'ngx-chips/core/providers/options-provider';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

import { NF2Urls } from '@appDir/front-desk/caseflow-module/case-insurance/insurance/insuranceUrls';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { ButtonTypes } from '@appDir/shared/dynamic-form/constants/ButtonTypes.enum';
import { getFieldControlByName } from '@appDir/shared/dynamic-form/helper';
import { ButtonClass } from '@appDir/shared/dynamic-form/models/ButtonClass.class';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { DynamicControl } from '@appDir/shared/dynamic-form/models/DynamicControl.class';
import { SelectClass } from '@appDir/shared/dynamic-form/models/SelectClass.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { envelope_providers } from '@appDir/shared/models/nf2/nf2Info';
import { unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';

@Component({
	selector: 'app-envelop-form',
	templateUrl: './envelop-form.component.html',
})
export class EnvelopFormComponent  implements OnInit,AfterViewInit, OnDestroy {
	envelopProvider:envelope_providers[];
	lat_log = {
		latitude: null,
		longitude: null,
	};
	@Input() caseId: any;
	subscription: Subscription[] = [];

	envelopform: FormGroup;
	facility_location_ids:any[];
	constructor(private storageData: StorageData,private requestService: RequestService
		,public caseFlowService: CaseFlowServiceService, 	private toastrService: ToastrService,) {
		;

	}
	ngOnInit()
	{
		this.caseFlowService.envelopeProviders.subscribe(data=>{
			this.envelopProvider=data;

			if(this.envelopProvider&& this.envelopProvider.length)
			{
this.setFormValue()
			}
			
		})


	}

	setFormValue()
	{
		let selectedProvider:envelope_providers;
		selectedProvider=this.envelopProvider.length?this.envelopProvider[0]:null;
		this.envelopform.controls['NF2_Envelop'].patchValue({ facility_id:selectedProvider.id })
		
	}
	

	fieldConfig = [
		new DynamicControl('id', ''),
		
			
				new DivClass([
					new SelectClass('Practice Location','facility_id',[],'',[
						{ name: 'required', message: 'This field is required', validator: Validators.required }
					],['col-sm-9 col-lg-8 col-xl-9' ],false,true),	
					new DivClass([
						new ButtonClass('Envelope', ['btn text-primary mb-1'], ButtonTypes.submit)
					],['col-sm-3 col-lg-4 col-xl-3 text-lg-end']),				
					

				],['row enevlop-block mb-2'],'','',{formControlName: 'NF2_Envelop'})

	
	];
	ngAfterViewInit() {
		this.facility_location_ids=this.storageData.getSelectedFacilityLocationIds();
		this.getfacilitylocations(this.facility_location_ids);
		// this.getPosition();
	}
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}

	onSubmit(form) {
		this.facilityloc;
		let NF2_Envelop_form=this.envelopform.controls['NF2_Envelop'] as FormGroup;
		let facilityLocation = this.facilityloc.filter(a=>a.id ==NF2_Envelop_form.controls['facility_id'].value);
		
		let data_NF2={
			name:'envelope',
			case_id:this.caseId,
			pdf_name:'envelope',
			provider: [{
				"location_id": facilityLocation[0].location_id,
    			 "id": facilityLocation[0].id,
      			 "name": facilityLocation[0]? facilityLocation[0].name:null,
      			"slug": facilityLocation[0]?facilityLocation[0].slug:null,
			}]
		}
		this.envelopNF2(data_NF2);
	}

	facilityloc: any = [];
	getfacilitylocations(_facility_location_ids) {
		this.caseFlowService.getCaseFromBackend(  this.caseId,'nf2_provider_form_info' ).subscribe((res) => {
			let data = res['result']['data'];
			this.facilityloc = data.case_practice_locations;
			let NF2_envelopFormDiv = getFieldControlByName(this.fieldConfig, 'NF2_Envelop');
			let attornyControl = getFieldControlByName(NF2_envelopFormDiv.children, 'facility_id');
			console.log("Facilitiy location",this.facilityloc);
			attornyControl.options = this.facilityloc.map((option) => {
				let label=option.location_name?'-' +option.location_name:''
				return {
					label: option.name+label,
					name:  option.name+label,
					value: option.id,
					qualifier_name :`${option.facility_qualifier?option.facility_qualifier:''}-${option.facility_location_qualifier?option.facility_location_qualifier:''}`
				} as Options;
			});
		});
	}

	openNF2InNewWindow(link) {
		this.getLinkwithAuthToken(link);
	}
	getLinkwithAuthToken(link) {
		let token = this.storageData.getToken();
		if (token) {
			return `${link}&token=${token}`;
		} else {
			return link;
		}
	}

	envelopNF2(data)
	{
		this.caseFlowService.envelopNF2(data).subscribe(data => {
		   this.toastrService.success('Successfully Updated', 'Success')
		   let fileid=data['result']['data'][0]['id'];
		   let fileUrl = data['result']['data'][0]['pre_signed_url'];
		//    let fileurl=environment.document_mngr_api_path+NF2Urls.NF2_Info_File_by_Id+fileid;
		   this.openInWindow(fileUrl);

	   }, err => this.toastrService.error(err.error.message, 'Error'))

	}

	openInWindow(url) {
		window.open(url);
	}

	onReady(form: FormGroup) {
		this.envelopform = form;
	}
}
