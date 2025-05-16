import { AfterViewInit, Component, Input, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { environment } from 'environments/environment';
import { isEmpty } from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { map, Observable, Subscription } from 'rxjs';

import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { AttorneyUrlsEnum } from '@appDir/front-desk/masters/billing/attorney-master/attorney/Attorney-Urls-enum';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { ButtonTypes } from '@appDir/shared/dynamic-form/constants/ButtonTypes.enum';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { getFieldControlByName } from '@appDir/shared/dynamic-form/helper';
import { AutoCompleteClass } from '@appDir/shared/dynamic-form/models/AutoCompleteClass.class';
import { ButtonClass } from '@appDir/shared/dynamic-form/models/ButtonClass.class';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { DynamicControl } from '@appDir/shared/dynamic-form/models/DynamicControl.class';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { RadioButtonClass } from '@appDir/shared/dynamic-form/models/RadioButtonClass.class';
import { SelectClass } from '@appDir/shared/dynamic-form/models/SelectClass.class';
import { NF2Info } from '@appDir/shared/models/nf2/nf2Info';
import { RequestService } from '@appDir/shared/services/request.service';

import { BasicInfo } from '../../../../../../pages/content-pages/login/user.class';
import { NF2Urls } from '../../insuranceUrls';
import { unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';

@Component({
	selector: 'app-nf2-form',
	templateUrl: './nf2-form.component.html',
})
export class Nf2FormComponent implements AfterViewInit, OnDestroy {
	constructor(
		private customDiallogService : CustomDiallogService,
		private storageData: StorageData,
		private requestService: RequestService,
		private caseFlowService: CaseFlowServiceService,
		private toastrService: ToastrService,
	) {
		this.basicInfo = this.storageData.getBasicInfo();
		this.getNF2options();
	}

	lat_log = {
		latitude: null,
		longitude: null,
	};
	@Input() caseId: any;
	subscription: Subscription[] = [];
	basicInfo: BasicInfo;
	nf2Statuses:any=[];
	userDetail: any = {};
	lstAttorney: any[] = [];
	nf2form: FormGroup;
	nf2_Info: NF2Info;
	nf2_Options: any[] = [];
	fieldConfig = [
		new DynamicControl('id', ''),
		new DivClass(
			[
				new DivClass([
					new DivClass([
						new DivClass(
							[new ButtonClass('NF2', ['btn text-primary'], ButtonTypes.button, this.generateNF2PDFFrontDesk.bind(this))],
							['col-2 col-sm-2 col-lg-2'],
						),
						new RadioButtonClass('','NF2',[
							{ name: 'Yes', value: 'Yes', label: 'Yes' },
							{ name: 'no', value: 'No', label: 'No' },
						],'',[
							{ name: 'required', message: 'This field is required', validator: Validators.required },

							//   { name: 'dialogError', message: 'This field is required', validator: this.caseFlowService.DialogEnumValidator() }
						],['col-10 col-sm-10 col-lg-10 col-xl-7'],)

					],['row'])

				],['col-12']),

				new DivClass([
					new DivClass([
						new SelectClass('Sent By','nf2_option',[],null,[{ name: 'required', message: 'This field is required', validator: Validators.required }],['col-12 col-sm-6 col-md-6 col-lg-12 col-xl-6','hidden', ],),						
						new AutoCompleteClass('Attorney', 'attorney_id', 'full_name', 'id',this.searchAttornies.bind(this),false,null,[
							{ name: 'required', message: 'This field is required', validator: Validators.required }
						],null,			
						
							['col-12 col-sm-6 col-md-6 col-lg-12 col-xl-6','hidden'],[],{},this.onFocusSearchAttornies.bind(this)),
						new InputClass('User Name', 'loginUser', InputTypes.text, '', 
							[{ name: 'required', message: 'This field is required', validator: Validators.required }], null, ['col-12 col-sm-6 col-md-6 col-lg-12 col-xl-6','hidden']),
						new InputClass('Enter User Name', 'userName', InputTypes.text, '', 
							[{ name: 'required', message: 'This field is required', validator: Validators.required }], null, ['col-12 col-sm-6 col-md-6 col-lg-12 col-xl-6','hidden']),
				new InputClass('MM/DD/YYYY','sent_date',InputTypes.date,'',[],null,	['col-12 col-sm-6 col-md-6 col-lg-12 col-xl-6','hidden'],{ max: new Date() },),		
					],['row'])
				],['col-12']),
				new DivClass([
		
					new DivClass([
						new ButtonClass('Submit', ['btn btn-success'], ButtonTypes.submit)],['text-center'])
					
						],['col-12'])
			
			],['row'],'','',{ name: 'NF2-form', formControlName: 'NF2_information' },),	
		
		// new DivClass([
		
		// 	new DivClass([
		// 		new ButtonClass('Submit', ['btn btn-success'], ButtonTypes.submit)],['col-12 text-center'])
			
		// 		],['row'])
	
	];



	ngAfterViewInit() {
		this.bindWithNF2();
		
		this.getNF2Info();
		this.getMasters()
	}
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}

	getMasters()
	{
		this.caseFlowService.getCaseMasters().subscribe(res=>{
		let data=res.result && res.result.data?res.result.data:null;

		 this.nf2Statuses=data.nf2_status?data.nf2_status:[];
		

		})
		
	}

	onSubmit(form) {
		let data_NF2 = {

			clean_nf2_info:false,
		
			case_id: null,
			date:  null,
			generated_by_id:null,
			user_name: null,
			user_id: null,
			attorney_id: null,
			id:null,
		};
		data_NF2 = {

			clean_nf2_info:form['NF2_information'].NF2 == 'No'?true:false,
		
			case_id: this.caseId,
			date: form['NF2_information'].sent_date ? form['NF2_information'].sent_date : null,
			generated_by_id: form['NF2_information'].nf2_option
				? form['NF2_information'].nf2_option
				: null,
			user_name: form['NF2_information'].userName ? form['NF2_information'].userName : null,
			user_id: this.nf2_Info?.userInfo?.id ? this.nf2_Info.userInfo.id : this.storageData.getUserId(),
			attorney_id: form['NF2_information'].attorney_id ? form['NF2_information'].attorney_id : null,
			id: this.nf2_Info ? this.nf2_Info.id : null,
		};	
			// data_NF2 = removeEmptyAndNullsFormObject(data_NF2);
			this.saveNf2(data_NF2);

	
	}

	

	
	
	

	saveNf2(data_NF2)
	{
		this.caseFlowService.submitNF2(data_NF2).subscribe(
			(data) => {
				this.toastrService.success('Successfully Updated', 'Success');
				let _nf2=data['result']['data'];
				this.getNF2Info();
				// if(	(!isEmpty(_nf2)))
				// {
				// 	let date=_nf2['date'];
				// 	this.caseFlowService.setNf2Status({status:_nf2.is_nf2_generated?'Yes':'No',date:date});
				// 	this.nf2_Info.id=_nf2.id?_nf2.id:null
				// 	this.nf2_Info.case_id=_nf2.case_id? _nf2.case_id:null
				// 	this.nf2_Info.created_at= _nf2.created_at? _nf2.created_at:null
				// 	this.nf2_Info.created_by= _nf2.created_by? _nf2.created_by:null
				// 	this.nf2_Info.date= _nf2.date?_nf2.date:null
				// 	this.nf2_Info.deleted_at= _nf2.deleted_at?_nf2.deleted_at:null
				// 	this.nf2_Info.generated_by_id=_nf2.generated_by_id?_nf2.generated_by_id:null
				// 	this.nf2_Info.updated_at=_nf2.updated_at ? _nf2.updated_at : null
				// 	this.nf2_Info.updated_by=_nf2.updated_by ? _nf2.updated_by : null
				// 	this.nf2_Info.user_id=_nf2.user_id?_nf2.user_id:null
				// 	this.nf2_Info.attorney_id=_nf2.attorney_id?_nf2.attorney_id:null;
				// 	this.nf2_Info.user_name=_nf2.user_name?_nf2.user_name:null
				// 	this.nf2_Info.is_nf2_generated=_nf2.is_nf2_generated	
				// }
				// else{
				// 	this.caseFlowService.setNf2Status({status:'N/A',date:null});
				// 	this.nf2_Info.id=null
				// 	this.nf2_Info.case_id=null
				// 	this.nf2_Info.created_at= null;
				// 	this.nf2_Info.created_by= null
				// 	this.nf2_Info.date= null;
				// 	this.nf2_Info.deleted_at= null
				// 	this.nf2_Info.generated_by_id=null
				// 	this.nf2_Info.updated_at= null;
				// 	this.nf2_Info.updated_by=null
				// 	this.nf2_Info.user_id=null;
				// 	this.nf2_Info.attorney_id=null;
				// 	this.nf2_Info.user_name=null,
				// 	this.nf2_Info.is_nf2_generated=null	
				// }
			},
			(err) => this.toastrService.error(err.error.message, 'Error'),
		);
	}

	generateNF2PDFFrontDesk() {
		// if(this.nf2_Info.id || (this.nf2form.value.NF2_information&&this.nf2form.value.NF2_information.NF2))
		// {
			let data_NF2 = {
				case_id: this.caseId,
				pdf_type: 'nf2',
			};
			this.caseFlowService.get_nf2_latest_files_by_caseId(data_NF2).subscribe(
				(data) => {
					let oldFiles = data['data'];
					let data_generatenf2 = {
						case_id: this.caseId,
						old_file_ids: oldFiles,
					};
					//    this.toastrService.success('Successfully NF2 pdf generated', 'Success');
					// 	let fileid=data['result']['data']['id']
					//    let fileurl=environment.document_mngr_api_path+NF2Urls.NF2_Info_File_by_Id+fileid;
					//    this.openInWindow(fileurl)
					this.updateNf2Status();
					this.caseFlowService.generateNF2PDFFrontDesk(data_generatenf2).subscribe(
						(data) => {
							this.toastrService.success('Successfully NF2 pdf generated', 'Success');
							
							let fileid = data['result']['data']['id'];
							let fileurl = data['result']['data']['pre_signed_url']; 
							
							//environment.document_mngr_api_path + NF2Urls.NF2_Info_File_by_Id + fileid;

							this.openInWindow(fileurl);
						},
						(err) => this.toastrService.error(err.error.message, 'Error'),
					);
				},
				(err) => this.toastrService.error(err.error.message, 'Error'),
			);
	
		
	}
 updateNf2Status()
 {
	 let nf2Status= this.nf2Statuses.find(status=>status.slug==="nf2_created");
	let paramUpdateStatus={
		case_id: this.caseId?[parseInt(this.caseId)]:[],
		status_id: nf2Status?nf2Status.id:null
	}
	this.caseFlowService.updateNF2Status(paramUpdateStatus).subscribe(
		(data) => {
			this.toastrService.success('Successfully NF2 status updated', 'Success');
			this.getNF2Info()
			
		},
		(err) => this.toastrService.error(err.error.message, 'Error'),
	);
 }


	getNF2Info()
	{
		this.caseFlowService.getNF2Info(this.caseId).subscribe(data => {
		   this.nf2_Info=data['result']['data'];
		   if (!this.nf2_Info.id) {
			   
			this.caseFlowService.setNf2Status({status:'N/A',date : this.nf2_Info.date});
			// this.caseFlowService.setNf2Status({status:'Unsent',date : null});

		} else {
			
			// this.caseFlowService.setNf2Status({status:this.nf2_Info.is_nf2_generated==true?'Yes':'No',date : this.nf2_Info.date});
			// this.caseFlowService.setNf2Status({status:(this.nf2_Info.id &&   this.nf2_Info.status)?this.nf2_Info.status.name:'Unsent',date:this.nf2_Info.date});
			this.caseFlowService.setNf2Status({status:this.nf2_Info.id ?this.nf2_Info.is_nf2_generated==true?'Yes':this.nf2_Info.is_nf2_generated==false?'No':'N/A':'N/A',date:this.nf2_Info.date})

		}
			
		   this.caseFlowService.envelopeProviders.next(this.nf2_Info.envelope_providers);

		   if(this.nf2_Info)
		   {
			   this.setNF2InfoFormValues();
		   }
		//    this.toastrService.success('Successfully Updated', 'Success')
		   // this.form.reset({}, { emitEvent: false })
		   // this.caseFlowService.goToNextStep()
		//    this.getLinkwithAuthToken()

	   }, err => this.toastrService.error(err.error.message, 'Error'))

	}

	setNF2InfoFormValues() {
		this.nf2form.controls['NF2_information'].patchValue(
			{
				NF2: this.nf2_Info.id ?this.nf2_Info.is_nf2_generated==true?'Yes':this.nf2_Info.is_nf2_generated==false?'No':'':'',
				nf2_option: this.nf2_Info.generated_by_id,
				attorney_id: this.nf2_Info.attorney_id,
				loginUser: this.nf2_Info.user_id,
				userName: this.nf2_Info.user_name,
				sent_date: this.nf2_Info.date,
			},
			{ emitEvent: false },
		);

		this.bindWithNF2InfoEdit(this.nf2_Info);
	}

	getLinkwithAuthToken(link) {
		let token = this.storageData.getToken();
		if (token) {
			return `${link}&token=${token}`;
		} else {
			return link;
		}
	}

	openInWindow(url) {
		window.open(url);
	}

	onReady(form: FormGroup) {
		this.nf2form = form;

		// this.bindNF2Options();
	}

	bindNF2Options() {
		// this.nf2_Options = this.storageData.get_nf2_generated_by_options_LocalStorageData();
		// console.log(this.nf2_Options);
		let attorneyControl = getFieldControlByName(this.fieldConfig, 'nf2_option');
		// attorneyControl.options = this.nf2_Options.map((option) => {
		// 	return { label: option.name, name: option.name, value: option.id } as Options;
		// });
		attorneyControl.options = this.nf2_Options;
	}

	getNF2options()
	{
		this.nf2_Options = this.storageData.get_nf2_generated_by_options_LocalStorageData();
		if(!this.nf2_Options.length)
		{
			this.caseFlowService.getCaseMasters().subscribe(res => {
				let data = res['result']['data'];
				 this.nf2_Options=data['nf2_generated_by_options']?data['nf2_generated_by_options']:[]
				 if(this.nf2_Options.length)
				{
					this.storageData.set_nf2_generated_by_options_LocalStorageData(this.nf2_Options);
				}
				this.nf2_Options.map((option) => {
					{ option.label= option.name, option.name= option.name, option.value= option.id }})
					this.bindNF2Options();
				
				
			})

		}
		else
		{
			
			this.nf2_Options.map((option) => {
				 { option.label= option.name, option.name= option.name, option.value= option.id }})
			this.bindNF2Options();
		}

	}

hideAllControl(nf2_option,attorney_id_Control,sentDate,userName,loginUser)
{
					nf2_option.classes = nf2_option.classes.filter((className) => className != 'hidden');
					attorney_id_Control.classes = attorney_id_Control.classes.filter((className) => className != 'hidden');
					sentDate.classes = sentDate.classes.filter((className) => className != 'hidden');
					userName.classes = userName.classes.filter((className) => className != 'hidden');
					loginUser.classes = loginUser.classes.filter((className) => className != 'hidden');

					nf2_option.classes.push('hidden');
					attorney_id_Control.classes.push('hidden');
					sentDate.classes.push('hidden');
					userName.classes.push('hidden');
					loginUser.classes.push('hidden');
}

bindWithNF2() {
	let nf2_information_Form = this.nf2form.controls['NF2_information'] as FormGroup;
	let nf2Control = nf2_information_Form.controls['NF2'] as FormControl;
	let nf2_optionControl = nf2_information_Form.controls['nf2_option'] as FormControl;
	let nf2_option = getFieldControlByName(this.fieldConfig, 'nf2_option');
	let attorney_id_Control = getFieldControlByName(this.fieldConfig, 'attorney_id');
	let loginUser = getFieldControlByName(this.fieldConfig, 'loginUser');
	let userName = getFieldControlByName(this.fieldConfig, 'userName');
	let sentDate = getFieldControlByName(this.fieldConfig, 'sent_date');

	// on NF2 value Changes
	this.subscription.push(
		nf2Control.valueChanges.subscribe((value) => {
			if (value == 'No') {
				if((this.nf2form&&this.nf2form.value && this.nf2form.value.NF2_information.nf2_option))
				{
					this.customDiallogService
            .confirm(
			  'Are you sure?', 'You want to discard the information',
              'Yes',
              'No'
            )
            .then((confirmed) => {
              if (confirmed) {
				nf2_information_Form.reset({},{emitEvent: false});
				nf2_information_Form.patchValue(
					{ NF2:'No' },
					{ emitEvent: false },);
					if((this.nf2_Info && this.nf2_Info.id))
					{
						this.onSubmit(this.nf2form.value)
					}
					
				
				this.hideAllControl(nf2_option,attorney_id_Control,sentDate,userName,loginUser)
					} 
					else {
						nf2_information_Form.patchValue(
							{ NF2:'Yes' },
							{ emitEvent: false },
						);
						
					}
            })
            .catch();
				}
				else
				{
					nf2_information_Form.reset({},{emitEvent: false});
					nf2_information_Form.patchValue(
						{ NF2:'No' },
						{ emitEvent: false },);
						this.hideAllControl(nf2_option,attorney_id_Control,sentDate,userName,loginUser)
				}
				
									
			
			} else if (value == 'Yes') {				
				if(!(isEmpty(this.nf2_Info)) && this.nf2_Info.id && this.nf2_Info.is_nf2_generated )
					{
						this.setNF2InfoFormValues();
					}
					else
					{
						nf2_option.classes = nf2_option.classes.filter((className) => className != 'hidden');
				
						sentDate.classes = sentDate.classes.filter((className) => className != 'hidden');
						
						nf2_information_Form.controls['nf2_option'].enable();
						nf2_information_Form.controls['attorney_id'].disable();
						nf2_information_Form.controls['sent_date'].disable();
					}
					
				
			} else {
				nf2_information_Form.reset({},{emitEvent: false});
				this.hideAllControl(nf2_option,attorney_id_Control,sentDate,userName,loginUser)					
			}
		}),
	);

	// on NF2 Option Changes
	this.subscription.push(
		nf2_optionControl.valueChanges.subscribe((get_nf2_generated_by_options_id) => {
			if (!get_nf2_generated_by_options_id) {
			}
			if (get_nf2_generated_by_options_id == 1) {
				this.userDetail = {
					id: this.storageData.getUserId,
					userName: `${this.basicInfo.first_name ? this.basicInfo.first_name : ''} ${
						this.basicInfo.middle_name ? this.basicInfo.middle_name : ''
					} ${this.basicInfo.last_name ? this.basicInfo.last_name : ''}`,
				};
			
				loginUser.classes = loginUser.classes.filter((className) => className != 'hidden');
				nf2_information_Form.patchValue(
					{ loginUser: this.userDetail.userName, sent_name: '',userName: '', sent_date: new Date(), attorney_id:null},
					{ emitEvent: false },
				);
				userName.classes.push('hidden');
				attorney_id_Control.classes.push('hidden');
				nf2_information_Form.controls['loginUser'].disable();
				nf2_information_Form.controls['sent_date'].enable();
			} else if (get_nf2_generated_by_options_id == 2) {
				attorney_id_Control.classes = attorney_id_Control.classes.filter(
					(className) => className != 'hidden',
				);

				loginUser.classes.push('hidden');
				userName.classes.push('hidden');
				nf2_information_Form.patchValue(
					{ loginUser: '', userName: '', sent_date: new Date() },
					{ emitEvent: false },
				);
				nf2_information_Form.controls['sent_date'].enable();
				nf2_information_Form.controls['attorney_id'].enable();
			} else if (get_nf2_generated_by_options_id == 3) {
				userName.classes = userName.classes.filter((className) => className != 'hidden');
				loginUser.classes.push('hidden');
				attorney_id_Control.classes.push('hidden');
				nf2_information_Form.patchValue(
					{ loginUser: '', userName: '', sent_date: new Date() ,attorney_id:null},
					{ emitEvent: false },
				);
				nf2_information_Form.controls['sent_date'].enable();
			} else {
				nf2_information_Form.patchValue(
					{ loginUser: null, userName: null, sent_date: null, attorney_id: null },
					{ emitEvent: false },
				);
				attorney_id_Control.classes = attorney_id_Control.classes.filter(
					(className) => className != 'hidden',
				);
				loginUser.classes.push('hidden');
				userName.classes.push('hidden');
				attorney_id_Control.classes.push('hidden');
				nf2_information_Form.controls['attorney_id'].disable();
				nf2_information_Form.controls['sent_date'].disable();
			}
		}),
	);
}


bindWithNF2InfoEdit(nf2Info: NF2Info) {
		
	let nf2_information_Form = this.nf2form.controls['NF2_information'] as FormGroup;
	let nf2_option = getFieldControlByName(this.fieldConfig, 'nf2_option');
	let attorney_id_Control = getFieldControlByName(this.fieldConfig, 'attorney_id');
	let loginUser = getFieldControlByName(this.fieldConfig, 'loginUser');
	let userName = getFieldControlByName(this.fieldConfig, 'userName');
	let sentDate = getFieldControlByName(this.fieldConfig, 'sent_date');
	nf2_option.classes = nf2_option.classes.filter((className) => className != 'hidden');
	attorney_id_Control.classes = attorney_id_Control.classes.filter(
		(className) => className != 'hidden',
	);
	sentDate.classes = sentDate.classes.filter((className) => className != 'hidden');

	if (nf2Info.generated_by_id == 1) {
		
		this.userDetail = {
			id: nf2Info.user_id,
			userName: this.nf2_Info?.userInfo?.userBasicInfo ? `${this.nf2_Info.userInfo.userBasicInfo.first_name ? this.nf2_Info.userInfo.userBasicInfo.first_name : ''} ${
				this.nf2_Info.userInfo.userBasicInfo?.middle_name ? this.nf2_Info.userInfo.userBasicInfo.middle_name : ''
			} ${this.nf2_Info.userInfo.userBasicInfo.last_name ? this.nf2_Info.userInfo.userBasicInfo.last_name : ''}` : `${this.basicInfo.first_name ? this.basicInfo.first_name : ''} ${
				this.basicInfo.middle_name ? this.basicInfo.middle_name : ''
			} ${this.basicInfo.last_name ? this.basicInfo.last_name : ''}`,
		};
		this.nf2form.controls['NF2_information'].patchValue(
			{
				loginUser: this.userDetail.userName,
			},
			{ emitEvent: false },
		);
		loginUser.classes = loginUser.classes.filter((className) => className != 'hidden');
		userName.classes.push('hidden');
		attorney_id_Control.classes.push('hidden');
		nf2_information_Form.controls['loginUser'].disable();
		nf2_information_Form.controls['sent_date'].enable();
	} else if (nf2Info.generated_by_id == 2) {
		
		attorney_id_Control.classes = attorney_id_Control.classes.filter(
			(className) => className != 'hidden',
		);
		loginUser.classes.push('hidden');
		userName.classes.push('hidden');
		nf2_information_Form.controls['sent_date'].enable();
		nf2_information_Form.controls['attorney_id'].enable();
		this.getAttorneyDataAndBindWithControl('NF2_information', 'attorney_id');
	} else if (nf2Info.generated_by_id == 3) {
		
		userName.classes = userName.classes.filter((className) => className != 'hidden');
		loginUser.classes.push('hidden');
		attorney_id_Control.classes.push('hidden');
		nf2_information_Form.controls['sent_date'].enable();
		nf2_information_Form.controls['userName'].enable();
	} else {
		
		nf2_information_Form.patchValue(
			{ loginUser: '', userName: '', sent_date: null, attorney_id: '' },
			{ emitEvent: false },
		);
		attorney_id_Control.classes = attorney_id_Control.classes.filter(
			(className) => className != 'hidden',
		);
		
		nf2_option.classes = nf2_option.classes.filter((className) => className != 'hidden');
		attorney_id_Control.classes = attorney_id_Control.classes.filter((className) => className != 'hidden');
		sentDate.classes = sentDate.classes.filter((className) => className != 'hidden');
		userName.classes = userName.classes.filter((className) => className != 'hidden');
		loginUser.classes = loginUser.classes.filter((className) => className != 'hidden');
		loginUser.classes.push('hidden');
		userName.classes.push('hidden');
		attorney_id_Control.classes.push('hidden');
		sentDate.classes.push('hidden');
		nf2_option.classes.push('hidden');
		nf2_information_Form.controls['attorney_id'].disable();
		nf2_information_Form.controls['sent_date'].disable();
	}
}

	bindAttorneyChange() {
		let nf2_information_Form = this.nf2form.controls['NF2_information'] as FormGroup;
		this.subscription.push(
			nf2_information_Form.get('attorney_id').valueChanges.subscribe((id) => {
				if (!id) {
					this.getAttorneyDataAndBindWithControl('NF2_information', 'attorney_id');
					return;
				}
			}),
		);
	}

	getAttorneyDataAndBindWithControl(formControlName?, controlName?) {
		this.getAttorniesbyCase().subscribe((data) => {
			let attorney = data['result']['data'];
			this.lstAttorney=attorney?[attorney]:[];
			let NF2_informationFormDiv = getFieldControlByName(this.fieldConfig, formControlName);
			let attornyControl = getFieldControlByName(NF2_informationFormDiv.children, controlName);
			attornyControl.items = this.lstAttorney;
		});
	}

	

	searchAttornies(name) {
		return new Observable((res) => {
			this.getAttorniesbyCase().subscribe((data) => {
			
				let attorney = data['result']['data'];
				this.lstAttorney=attorney?[attorney]:[];

				res.next(this.lstAttorney);
			});
		});
	}

	onFocusSearchAttornies(name) {
		return new Observable((res) => {
			if (!this.lstAttorney.length) {
				this.getAttorniesbyCase().subscribe((data) => {
					let attorney = data['result']['data'];
					this.lstAttorney=attorney?[attorney]:[]
					res.next(this.lstAttorney);
				});
			} else {
				res.next(this.lstAttorney);
			}
		});
	}

	getAttorniesbyCase() {
		// do something with selected item
		let paramQuery:any={
			id:this.caseId,
			route:'attorney'

		}
	
		return this.requestService
		  .sendRequest(
			AttorneyUrlsEnum.getAttoney_list_ByCase ,
			'GET',
			REQUEST_SERVERS.kios_api_path,{...paramQuery}
		  ).pipe(map((response) => {
			 
			let attorney:any = response['result']['data']&&response['result']['data']['attorney']&&response['result']['data']['attorney']['attorney'] ;
			if(attorney)
			{
				attorney =  
					 {
						...attorney,
						full_name: `${attorney.first_name} ${
							attorney.middle_name ? attorney.middle_name : ''
						} ${attorney.last_name}`,
					};
			}
			
			response['result']['data'] = attorney;
			return response;
		}));
	  }
}
