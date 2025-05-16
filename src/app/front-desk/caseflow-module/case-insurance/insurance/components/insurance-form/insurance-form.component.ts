import { Component, Input, OnChanges, Output, EventEmitter,  ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FDServices } from '../../../../../fd_shared/services/fd-services.service';
import { Logger } from '@nsalaun/ng-logger';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import {  map, pairwise } from 'rxjs/operators';
import { AclService } from '@appDir/shared/services/acl.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { InsuranceUrlsEnum } from '@appDir/front-desk/masters/billing/insurance-master/Insurance/insurance-list/Insurance-Urls-enum';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { Title } from '@angular/platform-browser';
import { PlanNameUrlsEnum } from '@appDir/front-desk/masters/billing/insurance-master/PlanName/PlanName-Urls-enum';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { AddressClass } from '@appDir/shared/dynamic-form/models/AddressClass.class';
import { AutoCompleteClass } from '@appDir/shared/dynamic-form/models/AutoCompleteClass.class';
import { DynamicControl } from '@appDir/shared/dynamic-form/models/DynamicControl.class';
import { getFieldControlByName, updateControlValidations } from '@appDir/shared/dynamic-form/helper';
import { InsuranceModel, DialogEnum } from '../../../../../fd_shared/models/Case.model';
import { BillingInsuranceModel } from '@appDir/front-desk/masters/billing/insurance-master/models/BillingInsurance.Model';
import { AdjusterInformationModel } from '@appDir/front-desk/masters/billing/models/AdjusterInformation.Model';
import { CaseFlowServiceService } from '../../../../../fd_shared/services/case-flow-service.service';
import { RadioButtonClass } from '@appDir/shared/dynamic-form/models/RadioButtonClass.class';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { CaseTypeEnum } from '../../../../../fd_shared/models/CaseTypeEnums';
import { CheckboxClass } from '@appDir/shared/dynamic-form/models/Checkbox.class';
import { AdjusterInformationUrlsEnum } from '@appDir/front-desk/masters/billing/insurance-master/adjuster/adjuster-information/adjuster-information-urls-enum';
import { ZipFormatMessages } from '@appDir/shared/dynamic-form/constants/ZipFormatMessages.enum';
import { removeEmptyKeysFromObject } from '@appDir/shared/utils/utils.helpers';
import { NgSelectClass } from '@appDir/shared/dynamic-form/models/NgSelectClass.class';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { ButtonClass } from '@appDir/shared/dynamic-form/models/ButtonClass.class';
import { ButtonTypes } from '@appDir/shared/dynamic-form/constants/ButtonTypes.enum';
import { ClearinghouseEnum } from '@appDir/front-desk/masters/billing/clearinghouse/CH-helpers/clearinghouse';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SelectPayerInfoComponent } from '../select-payer-info/select-payer-info.component';
import { Observable } from 'rxjs';
@Component({
	selector: 'app-insurance-form',
	templateUrl: './insurance-form.component.html',
})
export class InsuranceFormComponent implements OnChanges, OnDestroy {

	public form: FormGroup
	@Input() title
	@Input() insuranceType: string
	@Input() caseId: any;
	@Input() insurance: any;
	@Output() getCase = new EventEmitter
	@Output() onComponentReady = new EventEmitter()
	@Output() confirmedForBillingChange = new EventEmitter()
	@Output() resetTertiaryForm = new EventEmitter();
	loadSpin: boolean = false;
	adjustor: FormGroup;
	insurance_company: FormGroup;
	lstInsurance: BillingInsuranceModel[] = [];
	lstAdjusterInformation: AdjusterInformationModel[] = [];
	insurance_filter={
		page:0,
		searchKey:'',
		lastPage:2,
		per_page:10
	};
	insurance_last_page:boolean;
	insurance_page:number = 1;
	searchKey = ''
	payer_info_list = [];
	constructor(private fb: FormBuilder,
		public aclService: AclService, private logger: Logger,private modalService: NgbModal,private changeDetectorRef:ChangeDetectorRef, private fd_services: FDServices, private toastrService: ToastrService, private router: Router, private _route: ActivatedRoute, protected requestService: RequestService,
		private titleService: Title, private caseFlowService: CaseFlowServiceService, private customDiallogService : CustomDiallogService ) {
		this.setConfigration();
	}
	subscription: any[] = []
	ngOnDestroy() {
		unSubAllPrevious(this.subscription)
	}
	@ViewChild(DynamicFormComponent) dynamiccomponent: DynamicFormComponent;

	setDrugTestingForm() {
		let control_name = this.insuranceType == 'secondary_health' ? 'secondary_dialog' : 'tertiary_dialog'
		let control = getFieldControlByName(this.fieldConfig, control_name);
		if (control)
			control.options.push({ name: 'Skip', label: 'Skip', value: DialogEnum.skip })
	}

	setAutoInsuranceForm() {
		let control = getFieldControlByName(this.fieldConfig, 'is_policy_holder');
		if (control) {
			control.classes = control.classes.filter(className => className != 'hidden')
		}

		let form_control = this.form.controls['is_policy_holder']

		if (form_control) {
			form_control.valueChanges.subscribe(value => {
				if (value === DialogEnum.one) {
					let patient = this.caseFlowService.case.patient;
					this.form.patchValue({
						first_name: patient.first_name,
						middle_name: patient.middle_name,
						last_name: patient.last_name
					}, { emitEvent: false })
				}
				else {
					this.form.patchValue({
						first_name: '',
						middle_name: '',
						last_name: ''
					}, { emitEvent: false })
				}
			})
		}
	}

	


	ngOnChanges() {
		let control = getFieldControlByName(this.fieldConfig, 'form')


		if (this.insurance) {
			if (this.form) {
				this.form.patchValue(this.insurance, {emitEvent: false, onlySelf: false})
			}
			if (this.insurance&&this.insurance.insurance_company) {
				if(this.insurance?.payer || (this.insurance?.insurance_company?.insurance_locations?.is_associate_with_payer && !(this.insurance?.insurance_company?.is_mapped_in == 'employer_tab'))){
					let clearinghouse_name=getFieldControlByName(this.fieldConfig, 'clearinghouse_name');
					clearinghouse_name.classes = clearinghouse_name.classes.filter(className => className != 'hidden');
					let payer_info=getFieldControlByName(this.fieldConfig, 'payer_info');
					payer_info.classes = payer_info.classes.filter(className => className != 'hidden');
					let select_payer=getFieldControlByName(this.fieldConfig, 'select_payer');
					select_payer.classes = select_payer.classes.filter(className => className != 'hidden');
					this.insurance.insurance_company['clearinghouse_name'] = (this.insurance?.payer?.clearingHouse?.name || this.insurance?.insurance_company?.insurance_locations?.defaul_payer?.clearingHouse?.name);
					this.insurance.insurance_company['payer_info'] = (this.insurance?.payer?.payer_id || this.insurance?.insurance_company?.insurance_locations?.defaul_payer?.payer_id);
					this.insurance.insurance_company['payer_id'] = (this.insurance?.payer?.id ||  this.insurance?.insurance_company?.insurance_locations?.defaul_payer?.id);
					this.insurance.insurance_company['state_id'] = this.insurance?.insurance_company?.insurance_locations?.kiosk_state_id;
				}
				this.getBydefaultInsurance(this.insurance.insurance_company);
				if(this.form)
				{
					this.form.patchValue({ ...this.insurance },{emitEvent: false, onlySelf: false})
				}
					
				// })
			}
			if (this.insurance&&this.insurance.adjustor && this.insurance.adjustor.id) {
				this.insurance.adjustor['full_name'] = `${this.insurance.adjustor.first_name ? this.insurance.adjustor.first_name : ''} ${this.insurance.adjustor.middle_name ? this.insurance.adjustor.middle_name : ''} ${this.insurance.adjustor.last_name ? this.insurance.adjustor.last_name : ''}`
				this.lstAdjusterInformation = [this.insurance.adjustor] as any;
				// let _control = getFieldControlByName(this.fieldConfig, 'adjustor_id');
				let _control = this.fieldConfig[1].children[3].children[0]
				if (_control) {
					_control.items = this.lstAdjusterInformation;
					if(this.form)
					{
						this.form.patchValue({ adjustor: { id: this.insurance.adjustor.adjustor_id } })

					}
				}

			}
			if (this.insurance&&this.insurance.insurance_plan_name_id) {
			this.getPlanName(null, this.insurance.insurance_plan_name_id).subscribe(data => {
				this.lstPlanName = this.insurance.insurance_plan_name_id ? [data['result']] : data['result']['data']
				getFieldControlByName(this.fieldConfig, 'insurance_plan_name_id').items = this.lstPlanName
			})
		}
			
		} else {
			control && this.insuranceType != 'primary_health' ? control.classes.push('hidden') : null
		}
	}

	getBydefaultInsurance(Insurance_company)
	{
		debugger;
		let insurance: BillingInsuranceModel = {...Insurance_company};
		insurance.insurance_name=Insurance_company.name;
		insurance.insurance_locations=Insurance_company && Insurance_company.insurance_locations?[Insurance_company.insurance_locations]:[]
		this.lstInsurance = insurance?[insurance]:[]
		let control = getFieldControlByName(this.fieldConfig[1].children[0].children[2].children, 'id')
		let location_control = getFieldControlByName(this.fieldConfig, 'location_id')
		if (control)
			control.items = [...this.lstInsurance]
		if (location_control && insurance)
			location_control.items = [...insurance.insurance_locations]
		


	}

	


	onFocusGetInsurance()
	{
		return new Observable((res) => {
				if(!(this.lstInsurance?.length>1)){
					let adjustorid=this.form.value.adjustor? this.form.value.adjustor.id:null;
					this.insurance_page = 1;
					this.searchKey = '';	
					this.getInsurances(null,null,adjustorid).subscribe(data => {						
						let insurance: BillingInsuranceModel[] = data['result']['data']?data['result']['data']:[]
						this.insurance_last_page = data['result']&&data['result']['is_last_page']?data['result']['is_last_page']:false;
						this.lstInsurance = [...insurance];	
							res.next(this.lstInsurance);

					})
				}			
		else{
		res.next(this.lstInsurance);
		}
	})	
	}

	SearchInsurance(name) {
		return new Observable((res) => {
			this.searchKey = name;
			let adjustorid=this.form.value.adjustor? this.form.value.adjustor.id:null;
				let insuranceid=this.form.value.insurance_company?this.form.value.insurance_company.id:null;
				this.insurance_page = 1
			this.getInsurances(name,null,adjustorid).subscribe(data => {
				this.lstInsurance = data['result'].data?data['result'].data:[]
				this.insurance_last_page = data['result']&&data['result']['is_last_page']?data['result']['is_last_page']:false;
				res.next(this.lstInsurance)
			})
		})
	}


	searchAdjusterInformation(name) {
		return new Observable((res) => {
			let insuranceid=this.form.value.insurance_company?this.form.value.insurance_company.id:null;
			this.getAdjustor(name,null,insuranceid).subscribe(data => {
				if (data) {
					this.lstAdjusterInformation = data['result'].data?data['result'].data:[];
					res.next(this.lstAdjusterInformation)
				} else {
					this.lstAdjusterInformation=[]
					res.next(this.lstAdjusterInformation)
				}
			})
		})
	}

	onFocusSearchAdjusterInformation(name) {
	
		return new Observable((res) => {
			if((!this.lstAdjusterInformation.length))
			{
				
				let adjustorid=this.form.value.adjustor? this.form.value.adjustor.id:null;
				let insuranceid=this.form.value.insurance_company?this.form.value.insurance_company.id:null;
				this.getAdjustor(name,adjustorid,insuranceid).subscribe(data => {
					if (data) {
						this.lstAdjusterInformation = data['result'].data;
						res.next(this.lstAdjusterInformation)
					} else {
						res.next(this.lstAdjusterInformation)
					}
				})
			}
			else
			{
				
				res.next(this.lstAdjusterInformation);
			}
			
		})
	}



	lstPlanName: any[] = []
	searchPlanName(name) {
		return new Observable((res) => {
			this.getPlanName(name).subscribe(data => {
				this.lstPlanName = data['result'].data;
				res.next(this.lstPlanName)
			})
		})
	}

	getPlanName(name?, id?) {
		let paramQuery: ParamQuery = { order: OrderEnum.ASC, pagination: true, filter: false, page: 1, per_page: 10, order_by: 'plan_name' }
		let filter = {}
		if (id) {
			paramQuery.filter = true;
			filter['id'] = id
		}
		if (name) {
			paramQuery.filter = true;
			filter['plan_name'] = name
		}
		return this.requestService.sendRequest(PlanNameUrlsEnum.PlanNAme_list_GET, 'get', REQUEST_SERVERS.billing_api_url, { ...paramQuery, ...filter })
	}

	getInsurances(name?, Insuranceid?,adjustorid?) {
	
		let order_by;
		let order;
		if(name)
		{
			order_by='insurance_name';
			order=OrderEnum.ASC	;
		
		}
		else
		{
			order_by='count';
			order=OrderEnum.DEC	
			
		}
		let paramQuery: any = { order: order, pagination: true, filter: false, page: this.insurance_page, per_page: 10, dropDownFilter:true,
			order_by: order_by,adjustor_id: adjustorid?adjustorid:null }
			paramQuery = removeEmptyKeysFromObject(paramQuery);
		let filter = {}
		if (Insuranceid) {
			paramQuery.filter = true;
			filter['id'] = Insuranceid
		}
		if (name) {
			paramQuery.filter = true;
			filter['insurance_name'] = name
		}
		return this.requestService.sendRequest(InsuranceUrlsEnum.Insurance_list_GET, 'get', REQUEST_SERVERS.billing_api_url, { ...paramQuery, ...filter })
	}


	getAdjustor(name?, adjustorid?,insuranceid?) {
		// /adjuster/get-adjustor?insurance_id=192&name=shasna&pagination=true&page=1&per_page=1
	
		let order_by;
		let order;
		if(name)
		{
			order_by=null;
			order=OrderEnum.ASC	
		}
		else
		{
			order_by='count';
			order=OrderEnum.DEC	
		}

		let url = AdjusterInformationUrlsEnum.insurance_adjuster_list_Get;
		// let paramQuery: ParamQuery = { order: OrderEnum.ASC, pagination: true, filter: false, per_page: 10, page: 1 }
		let paramQuery: any = { order: order, pagination: true, filter: false, page: 1, per_page: 10, 
			order_by: order_by,insurance_id:insuranceid?insuranceid:null }

			paramQuery = removeEmptyKeysFromObject(paramQuery);


		let filter = {}
		if (adjustorid) {
			paramQuery.filter = true;
			filter['adjuster_id'] = adjustorid
			url = AdjusterInformationUrlsEnum.adjuster_list_GET
		}
		if (name) {
			paramQuery.filter = true;
			filter['name'] = name


		}

		return this.requestService.sendRequest(url, 'get', REQUEST_SERVERS.billing_api_url, { ...paramQuery, ...filter })
		.pipe(
		map(response => {
			let lst: any[] = response['result']['data']
			lst = lst.map(adjuster => {
				return { ...adjuster, full_name: `${adjuster.first_name ? adjuster.first_name : ''} ${adjuster.middle_name ? adjuster.middle_name : ''} ${adjuster.last_name ? adjuster.last_name : ''}` }
			})

			response['result']['data'] = lst;
			
			return response

		}));
	}


	bindInsuranceChange() {
		let form = this.form.controls['insurance_company'] as FormGroup
		this.subscription.push(form.controls['id'].valueChanges.subscribe(value => {
			let insurance_div = getFieldControlByName(this.fieldConfig, 'insurance_company');
			let insurance_control = getFieldControlByName(insurance_div.children,'id')
			let adjustor_div = getFieldControlByName(this.fieldConfig, 'adjustor');
			let adjustor_control = getFieldControlByName(adjustor_div.children,'id');
			let control = getFieldControlByName(this.fieldConfig, 'location_id') as AutoCompleteClass;
			let locationControlForm=(this.form.controls['insurance_company'] as FormGroup).controls['location_id']

				control.validations=[];
				control.label="Location Name"
			// form.reset({}, { emitEvent: false });
			if (!value) {
				form.reset({}, { emitEvent: false });
				this.lstInsurance=[];
				insurance_control.items = this.lstInsurance;
				let clearinghouse_name=getFieldControlByName(this.fieldConfig, 'clearinghouse_name');
			    clearinghouse_name.classes.push('hidden');
			    let payer_info=getFieldControlByName(this.fieldConfig, 'payer_info');
			    payer_info.classes.push('hidden');
			    let select_payer=getFieldControlByName(this.fieldConfig, 'select_payer');
			    select_payer.classes.push('hidden');
				if(!(this.form.value.adjustor&& this.form.value.adjustor.id))
				{
					this.lstAdjusterInformation=[];
				adjustor_control.items=this.lstAdjusterInformation;
				}
				control.items = [];
				updateControlValidations(control.validations,locationControlForm)
				return;
			}
			control.label="Location Name*"
			control.validations.push({ name: 'required', message: 'This field is required', validator: Validators.required })
			updateControlValidations(control.validations,locationControlForm)
			let insurance = this.lstInsurance.find(insurance => insurance.id === value)
			this.lstInsurance=this.lstInsurance.filter(insurance => insurance.id === value);
			insurance_control.items = this.lstInsurance
			
			if (!insurance) { return }

			(this.form.controls['insurance_company'] as FormGroup).patchValue({
				insurance_code: insurance.insurance_code,
				name: insurance.insurance_name
			})
			if (control) {
				control.items = insurance.insurance_locations
				if (insurance && insurance.insurance_locations  && insurance.insurance_locations.length) {
					insurance.insurance_locations.length == 1   && insurance.insurance_locations[0].id? (this.form.controls['insurance_company'] as FormGroup).patchValue({ location_id: insurance.insurance_locations[0].id }) : this.glowAndResetFormValues()
				}
			}

			if(!(this.form.value.adjustor&& this.form.value.adjustor.id))
			{
				let adjustorForm = this.form.controls['adjustor'] as FormGroup
				adjustorForm.reset({},{ emitEvent: false })
					this.lstAdjusterInformation=[];
					let adjustor_div = getFieldControlByName(this.fieldConfig, 'adjustor');
					let adjustor_control = getFieldControlByName(adjustor_div.children,'id')
					adjustor_control.items = this.lstAdjusterInformation
			}
		}))


	}

	glowAndResetFormValues()
	{
		(this.form.controls['insurance_company'] as FormGroup).patchValue({ location_id: null })
		let control=getFieldControlByName(this.fieldConfig, 'location_id');
		control.classes = control.classes.filter(className => className != 'glow')
		control.classes.push('glow');
		// getFieldControlByName(this.fieldConfig, 'location_id').classes.push('glow')

	}
	bindLocationChange()
	 {
		let form = this.form.controls['insurance_company'] as FormGroup;
		this.subscription.push(form.controls['location_id'].valueChanges.subscribe((id: number) => {
			if (!id) {
				form.patchValue({
					street_address: '',
					apartment_suite: '',
					city: '',
					state: '',
					zip: '',
					phone_no: '',
					cell_no: '',
					ext: '',
					fax: '',
					location_code: '',
					email: ''
				}, { emitEvent: false })
				form.controls['payer_id'].setValue(null);
				return;
			}
			let insurance = this.lstInsurance.find(insurance => {
				return insurance.id == (this.form && this.form.value &&  this.form.value.insurance_company&& this.form.value.insurance_company.id)
			});
			if (!insurance) return;
			let value: any = insurance.insurance_locations.find(location => parseInt(location.id) === id);
			if(value?.kiosk_state_id && value?.is_associate_with_payer){
				this.getPayerInfo(value?.kiosk_state_id,value?.insurance_id,value?.default_payer_id,false)
			}else{
				this.payer_info_list = [];
				this.hideFields();
			}
			(this.form.controls['insurance_company'] as FormGroup).patchValue({
				street_address: value.street_address,
				apartment_suite: value.apartment_suite,
				city: value.city,
				state: value.state,
				zip: value.zip,
				phone_no: value.phone_no,
				cell_no: value.cell_number,
				ext: value.ext,
				fax: value.fax,
				location_code: value.location_code,
				email: value.email,
				state_id:value.kiosk_state_id
			})
		}))
	}
	getPayerInfo(state_ids,insurance_id,default_payer_id,editMode:boolean) {
		if(state_ids && insurance_id){
			this.subscription.push(
				this.requestService.sendRequest(
					ClearinghouseEnum.Get_Payers_Info, 'get', REQUEST_SERVERS.fd_api_url, { state_ids: [state_ids],insurance_ids : [insurance_id]})
					.subscribe((res) => {
						this.loadSpin = false;
						if (res && res['result'] && res['result']['data'] && res['result']['data'].length) {
							let insurance_company = this.form?.controls['insurance_company'] as FormGroup;
							let select_payer=getFieldControlByName(this.fieldConfig, 'select_payer');
						if(!editMode){
						let clearinghouse_name=getFieldControlByName(this.fieldConfig, 'clearinghouse_name');
						clearinghouse_name.classes = clearinghouse_name.classes.filter(className => className != 'hidden');
						let payer_info=getFieldControlByName(this.fieldConfig, 'payer_info');
						payer_info.classes = payer_info.classes.filter(className => className != 'hidden');
						
						select_payer.classes = select_payer.classes.filter(className => className != 'hidden');
						this.payer_info_list = [];
						this.payer_info_list.push(...res['result']['data']);
						this.changeDetectorRef.detectChanges();
						this.payer_info_list = [...this.payer_info_list];
						if(this.payer_info_list?.length)
						{
							this.payer_info_list?.forEach(obj =>{
								if((obj['id'] == default_payer_id)){
									obj['is_default_payer'] = true;
								}
								else if((this.payer_info_list.length == 1)){
									obj['is_default_payer'] = true;
								}
								else{
									obj['is_default_payer'] = false;
								}
							});
							this.populateSelectedPayer(this.payer_info_list,insurance_company);
						}
					}
					else{
						this.payer_info_list = [];
						this.payer_info_list.push(...res['result']['data']);
						this.changeDetectorRef.detectChanges();
						this.payer_info_list = [...this.payer_info_list];
						if(this.payer_info_list?.length)
							{
								this.payer_info_list?.forEach(obj =>{
									if((obj['id'] == default_payer_id)){
										obj['is_default_payer'] = true;
									}
									else if((this.payer_info_list.length == 1)){
										obj['is_default_payer'] = true;
									}
									else{
										obj['is_default_payer'] = false;
									}
								});
							}
							let activeModel = this.modalService.open(SelectPayerInfoComponent,{
								backdrop: 'static',
								keyboard: false,
								size: 'xl',
								windowClass: 'modal_extraDOc',
							});
							activeModel.componentInstance.payer_info_list = [...this.payer_info_list];
							activeModel.result.then(res =>{
								if(res){
									this.populateSelectedPayer(res,insurance_company);
								}
							})
					}
				}
			})
		)
	}
}
	populateSelectedPayer(payer_info_list:any[], form:FormGroup){
		payer_info_list?.forEach(obj =>{
			if(obj.is_default_payer){
				form.controls['clearinghouse_name'].setValue(obj?.clearinghouse?.name);
			    form.controls['payer_info'].setValue(obj?.payer_id);
			    form.controls['payer_id'].setValue(obj?.id);
			}
		})
	}
	bindAdjusterInformationChange() {
		let form = this.form.controls['adjustor'] as FormGroup
		this.subscription.push(form.controls['id'].valueChanges.subscribe(id => {
			let insurance_div = getFieldControlByName(this.fieldConfig, 'insurance_company');
			let insurance_control = getFieldControlByName(insurance_div.children,'id')
			let adjustor_div = getFieldControlByName(this.fieldConfig, 'adjustor');
			let adjustor_control = getFieldControlByName(adjustor_div.children,'id')
			if (!id) {				
				form.reset({}, { emitEvent: false });
				this.lstAdjusterInformation=[];
				adjustor_control.items=this.lstAdjusterInformation;
				if(!(this.form.value.insurance_company&&this.form.value.insurance_company.id))
			{
				this.lstInsurance=[];			
				insurance_control.items = this.lstInsurance	
			}

				  return;
			}
			let adjuster = this.lstAdjusterInformation.find(adjuster => adjuster && adjuster['id'] == id);
			if (!adjuster) return;
			this.form.patchValue({ adjustor: { ...adjuster, id: adjuster['id'] } }, { emitEvent: false });
			let adjustorlist=this.lstAdjusterInformation.filter(adjustor=>adjustor && adjustor.id === id)
			this.lstAdjusterInformation=adjustorlist
			adjustor_control.items = this.lstAdjusterInformation
			if(!(this.form.value.insurance_company&&this.form.value.insurance_company.id))
			{
				this.lstInsurance=[];				
				insurance_control.items = this.lstInsurance

			}
		}))
	}
	public model: any;
	searching = false;
	searchFailed = false;
	ngOnInit() {
		this.titleService.setTitle(this._route.snapshot.data['title']);
		this.setConfigration();

	}


	ngAfterViewInit() {
		
	}


	goBack() {
		this.caseFlowService.goBack()
		// this.router.navigate(['insurance'], { relativeTo: this._route.parent.parent.parent })
	}

	formToggle() {
		let control = getFieldControlByName(this.fieldConfig, 'button-div')
		if (this.form.disabled) {
			this.form.enable()
			control.classes = control.classes.filter(className => className != 'hidden')
		} else {
			this.form.disable()
			control.classes.push('hidden')
		}
	}


	data: any[] = null;
	fieldConfig: FieldConfig[] = [];

	bindConfirmedForBilling() {
		this.form?.controls['confirmed_for_billing'].valueChanges.subscribe(value => {
			this.confirmedForBillingChange.emit(value)
		})
	}
	setConfigration(data?) {
		// console.log('this.planNameData', data);
		this.fieldConfig = [

			new DivClass([
				new DivClass([
					new DivClass([
						new CheckboxClass('Set as primary', 'confirmed_for_billing', InputTypes.checkbox, false, [], '', ['set-primary-btn']),
					], ['row set-primary-outer']),
				], ['col-12']),
				this.insuranceType != 'primary_health' ? new RadioButtonClass(`Do you have ${this.insuranceType == 'secondary_health' ? 'secondary insurance?*' : 'tertiary insurance?*'}`, this.insuranceType == 'secondary_health' ? 'secondary_dialog' : 'tertiary_dialog', [
					{ name: 'yes', label: 'Yes', value: DialogEnum.yes },
					{ name: 'no', label: 'No', value: DialogEnum.no }
				], DialogEnum.none, [
					{ name: 'required', message: 'This field is required', validator: Validators.required },
					{ name: 'dialogError', message: 'This field is required', validator: this.caseFlowService.DialogEnumValidator() }
				], ['col-lg-6']) : new RadioButtonClass('Are you the Policy holder for the vehicle that was in the accident?', 'is_policy_holder', [
					{ name: 'yes', label: 'Yes', value: DialogEnum.one },
					{ name: 'no', label: 'No', value: DialogEnum.zero }
				], DialogEnum.none, [], ['col-xl-8', 'hidden'])
			], ['row'], '', ''),
			new DivClass([
				new DivClass([
					new DynamicControl('id', null),
					new DivClass([], []),

					new DivClass([
						// new DynamicControl('id', ''),
						new NgSelectClass("Insurance Name", 'id', 'insurance_name', 'id', this.SearchInsurance.bind(this), false, null, [], '', ['col-sm-6', 'col-md-4', 'col-xl-3'],[],null,this.onFocusGetInsurance.bind(this),null,this.SearchInsurance.bind(this),null,this.searchInsuranceScrollToEnd.bind(this)),
						new InputClass('Insurance Code', 'insurance_code', InputTypes.text, data && data['insurance_code'] ? data['insurance_code'] : '', [], '', ['col-sm-6', 'col-md-4', 'col-xl-3'], { readonly: true }),
						new DynamicControl('name', null),
						new AutoCompleteClass('Insurance Location', 'location_id', 'location_name', 'id', null, false, null, [], '', ['col-sm-6', 'col-md-4', 'col-xl-3'],[],null,this.OnFocusLocation.bind(this),'',this.OnclearLocation.bind(this)),
						new InputClass('Location Code', 'location_code', InputTypes.text, '', [], '', ['col-sm-6', 'col-md-4', 'col-xl-3'], { readonly: true }),
						new InputClass('Clearinghouse Name', 'clearinghouse_name', InputTypes.text, data && data['companyCode'] ? data['companyCode'] : '', [
							// { name: 'required', message: 'Code is required', validator: Validators.required }
						], '', ['col-sm-6', 'col-md-4', 'col-xl-3','hidden'], { readonly: true }),
						new InputClass('Payer ID ', 'payer_info', InputTypes.text, data && data['companyCode'] ? data['companyCode'] : '', [
						], '', ['col-sm-6', 'col-md-4', 'col-xl-3','hidden'], { readonly: true }),
						new DynamicControl('payer_id', null),
						new DynamicControl('state_id', null),
						new ButtonClass('Select Payer Info', ['btn', 'btn-primary', 'btn-block','hidden'],ButtonTypes.button,this.showPayerSelect.bind(this),{name:'select_payer'}),
						// new SelectClass('Plan name', 'planName', [], '', [], ['col-md-4', 'col-sm-3']),
						new AddressClass('Street Address', 'street_address', null, '', [], '', ['col-sm-6', 'col-md-4', 'col-xl-6'], { readonly: true }),
						new InputClass('Suite Floor', 'apartment_suite', InputTypes.text, data && data['apartment'] ? data['apartment'] : '', [], '', ['col-sm-6', 'col-md-4', 'col-xl-3'], { readonly: true }),
						new InputClass('Email', 'email', InputTypes.text, '', [], '', ['col-sm-6', 'col-md-4', 'col-xl-3'], { readonly: true }),

						new InputClass('City', 'city', InputTypes.text, data && data['city'] ? data['city'] : '', [], '', ['col-sm-6', 'col-md-4', 'col-xl-3'], { readonly: true }),
						new InputClass('State', 'state', InputTypes.text, data && data['state'] ? data['state'] : '', [], '', ['col-sm-6', 'col-md-4', 'col-xl-3'], { readonly: true }),
						// new InputClass('Zip', 'zip', InputTypes.text, data && data['zip'] ? data['zip'] : '', [], '', ['col-sm-6', 'col-md-4', 'col-xl-3'], { readonly: true }),
						new InputClass('Zip', 'zip', InputTypes.text, data && data['zip'] ? data['zip'] : '', [{name:'pattern', message:ZipFormatMessages.format_usa,validator:Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')}], '', ['col-sm-6', 'col-md-4', 'col-xl-3'], { readonly: true }),
						new InputClass('Fax', 'fax', InputTypes.text, data && data['fax'] ? data['fax'] : '', [
							// { name: 'minlength', message: 'Length can not be less then 10', validator: Validators.minLength(10) }
						], '', ['col-sm-6', 'col-md-4', 'col-xl-3'], { mask: '000-000-0000', readonly: true }),

						new InputClass('Phone Number', 'phone_no', InputTypes.text, data && data['workPhone'] ? data['workPhone'] : '', [
							// { name: 'minlength', message: 'Length can not be less then 10', validator: Validators.minLength(10) }
						], '', ['col-sm-6', 'col-md-4', 'col-xl-3'], { mask: '000-000-0000', readonly: true }),
						new InputClass('Extension', 'ext', InputTypes.text, data && data['workExt'] ? data['workExt'] : '', [
							// { name: 'minlength', message: 'Length can not be less then 10', validator: Validators.minLength(10) }
						], '', ['col-sm-6', 'col-md-4', 'col-xl-3'], { readonly: true }),
						new InputClass('Cell No.', 'cell_no', InputTypes.text, data && data['cellPhone'] ? data['cellPhone'] : '', [
							// { name: 'minlength', message: 'Length can not be less then 10', validator: Validators.minLength(10) }
						], '', ['col-sm-6', 'col-md-4', 'col-xl-3'], { mask: '000-000-0000', readonly: true }),

					], ['display-contents'], '', '', { formControlName: 'insurance_company' }),

					new AutoCompleteClass('Plan Name', 'insurance_plan_name_id', 'plan_name', 'id', this.searchPlanName.bind(this), false, null, [], '', ['col-sm-6', 'col-md-4', 'col-xl-3']),

				], ['row']),
				new DivClass([
					new InputClass('First Name', 'first_name', InputTypes.text, data && data['policyHolderFirstName'] ? data['policyHolderFirstName'] : '',
						[
							//  { name: 'required', message: 'First name is required', validator: Validators.required }
						], '', ['col-sm-6', 'col-md-4'], { title_case: true }),
					new InputClass('Middle Name', 'middle_name', InputTypes.text, data && data['policyHolderMiddleName'] ? data['policyHolderMiddleName'] : '', [], '', ['col-sm-6', 'col-md-4'], { title_case: true }),
					new InputClass('Last Name', 'last_name', InputTypes.text, data && data['policyHolderLastName'] ? data['policyHolderLastName'] : '', [
						// { name: 'required', message: 'Last Name is required', validator: Validators.required }
					], '', ['col-sm-6', 'col-md-4'], { title_case: true }),

				], ['row'], "Policy Holder's Information"),
				new DivClass([
					new InputClass('Claim No', 'claim_no', InputTypes.claim_no, data && data['claim_no'] ? data['claim_no'] : '', [ { name: 'maxlength', message: 'Length cannot be greater than 45', validator: Validators.maxLength(45) }, 
					{ name: 'pattern', message: 'Claim No. must only contain capital letters and numbers', validator: Validators.pattern('^[0-9A-Za-z]*$') }], '', ['col-sm-6', 'col-md-4']),
					new InputClass('Policy No', 'policy_no', InputTypes.text, data && data['policy_no'] ? data['policy_no'] : '', [], '', ['col-sm-6', 'col-md-4']),
					new InputClass('WCB No (G0000000/00000000)', 'wcb_no', InputTypes.wcb, data && data['wcb_no'] ? data['wcb_no'] : '', [{ name: 'pattern', message: 'Please enter a valid WCB No. (e.g. G0000000/00000000)', validator: Validators.pattern(/^(G\d{7}|\d{8})$/) }], '', ['col-sm-6', 'col-md-4'], { mask: 'A0000000' }),
					new InputClass('Prior Authorization No', 'prior_authorization_no', InputTypes.text, data && data['prior_authorization_no'] ? data['prior_authorization_no'] : '', [], '', ['col-sm-6', 'col-md-4']),
				], ['row']),
				new DivClass([
					// new DynamicControl('id', null),
					// new DynamicControl('adjustor_id', ''),
					new AutoCompleteClass('Name', 'id', 'full_name', 'id', this.searchAdjusterInformation.bind(this), false, null, [], '', ['col-sm-6', 'col-md-4'],[],null, this.onFocusSearchAdjusterInformation.bind(this),null,this.searchAdjusterInformation.bind(this)),
					// new InputClass('Middle Name', 'middle_name', InputTypes.text, data && data['middle_name'] ? data['middle_name'] : '', [], '', ['col-md-4', 'col-sm-3'], { readonly: true }),
					// new InputClass('Last Name', 'last_name', InputTypes.text, data && data['last_name'] ? data['last_name'] : '', [
					//   // { name: 'required', message: 'Last Name is required', validator: Validators.required }
					// ], '', ['col-md-4', 'col-sm-3'], { readonly: true }),
					new DynamicControl('first_name', null),
					new DynamicControl('middle_name', null),
					new DynamicControl('last_name', null),
					new InputClass('Email', 'email', InputTypes.email, data && data['email'] ? data['email'] : '', [
						// { name: 'email', message: 'Email is not valid', validator: Validators.email }
						{ name: 'pattern', message: 'Email is not valid', validator: Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$') }
					], '', ['col-sm-6', 'col-md-4'], { readonly: true }),

					new InputClass('Fax', 'fax', InputTypes.text, data && data['fax'] ? data['fax'] : '', [
						// { name: 'minlength', message: 'Length can not be less then 10', validator: Validators.minLength(10) }
					], '', ['col-sm-6', 'col-md-4'], { mask: '000-000-0000', readonly: true }),

					new InputClass('Phone No.', 'phone_no', InputTypes.text, data && data['phone_no'] ? data['phone_no'] : '', [
						// { name: 'minlength', message: 'Length can not be less then 10', validator: Validators.minLength(10) }
					], '', ['col-sm-6', 'col-md-4'], { mask: '000-000-0000', readonly: true }),
					new InputClass('Extension', 'ext', InputTypes.text, data && data['ext'] ? data['ext'] : '', [
						// { name: 'minlength', message: 'Length can not be less then 10', validator: Validators.minLength(10) }
					], '', ['col-sm-6', 'col-md-4'], { readonly: true }),
					new InputClass('Cell No.', 'cell_no', InputTypes.text, data && data['cell_no'] ? data['cell_no'] : '', [
						// { name: 'minlength', message: 'Length can not be less then 10', validator: Validators.minLength(10) }
					], '', ['col-sm-6', 'col-md-4'], { mask: '000-000-0000', readonly: true }),
				], ['row'], "Adjuster's Information", '', { formControlName: 'adjustor' }),
				new DivClass([
					//   new ButtonClass('Reset', ['btn', 'btn-primary', 'btn-block'], ButtonTypes.reset, this.formToggle.bind(this), { icon: 'icon-left-arrow me-2' }),
					//   new ButtonClass('Save & Continue', ['btn', 'btn-success', 'btn-block'], ButtonTypes.submit, null, { icon: 'icon-save-continue me-2' })
				], ['row', 'form-btn', 'justify-content-center'], '', '', { name: 'button-div' })
			], ['display-contents'], '', '', { name: 'form' }),
			new DynamicControl('is_deleted', false),
		]
	}
	onReady(event) {
		this.form = event


		this.bindConfirmedForBilling()
		this.bindInsuranceChange()
		this.bindAdjusterInformationChange()
		this.bindLocationChange()
		this.bindHasInsuranceChange()
		this.ngOnChanges()
		this.onComponentReady.emit(event)


		if (this.caseFlowService.case &&this.caseFlowService.case.case_type && ( this.caseFlowService.case.case_type.slug === CaseTypeEnum.corporate)) {
			this.setDrugTestingForm()
		}
		else if (this.caseFlowService.case &&this.caseFlowService.case.case_type && ((this.caseFlowService.case &&this.caseFlowService.case.case_type && this.caseFlowService.case.case_type.slug === CaseTypeEnum.auto_insurance) 
		|| ( this.caseFlowService.case &&this.caseFlowService.case.case_type &&this.caseFlowService.case.case_type.slug === CaseTypeEnum.auto_insurance_worker_compensation))) {
			this.setAutoInsuranceForm()
		}

		let insurance_type = this.insuranceType == 'secondary_health' ? 'secondary_dialog' : 'tertiary_dialog'

		this.insurance ? this.form.patchValue({ [insurance_type]: this.insurance[insurance_type] }) : null



	}



	bindHasInsuranceChange() {
		if (this.insuranceType == 'primary_health') {
			return;
		}
		this.adjustor = this.form.get('adjustor') as FormGroup
		this.insurance_company = this.form.get('insurance_company') as FormGroup
		this.subscription.push(this.form.controls[this.insuranceType == 'secondary_health' ? 'secondary_dialog' : 'tertiary_dialog'].valueChanges.pipe(pairwise())
		.subscribe(([preval, value]: [any, any]) => { 
			if (this.insuranceType == 'primary_health') { return; }
			let control = getFieldControlByName(this.fieldConfig, 'form')
			if (value == DialogEnum.yes) {
				this.form.patchValue({ is_deleted: false }, { emitEvent: false })
				control.classes = control.classes.filter(className => className != 'hidden')
			}
			else if (value == DialogEnum.no) {
				if(value!=preval && (preval && preval!=='none')&& (this.adjustor.dirty || this.insurance_company.dirty
					|| this.form.value.first_name || this.form.value.middle_name || this.form.value.last_name || this.form.value.policy_no || this.form.value.prior_authorization_no || this.form.value.claim_no || this.form.value.insurance_plan_name_id || this.form.value.wcb_no)) 
				{
          this.customDiallogService
            .confirm(
              'Discard Changes',
              'Are you sure you want to discard the changes?',
              'Yes',
              'No'
            )
            .then((confirmed) => {
              if (confirmed) {
                debugger;
                control.classes.push('hidden');
                this.form.controls['insurance_company'].reset({
                  emitEvent: true,
                });
                this.form.controls['adjustor'].reset({ emitEvent: false });
                this.form.controls['insurance_plan_name_id'].reset();
                this.form.controls['claim_no'].reset();
                this.form.controls['policy_no'].reset();
                this.form.controls['wcb_no'].reset();
                this.form.controls['prior_authorization_no'].reset();
                this.form.controls['first_name'].reset();
                this.form.controls['last_name'].reset();
                this.form.controls['middle_name'].reset();

                // return;

                this.insurance && this.insurance.id
                  ? this.form.patchValue(
                      { is_deleted: true },
                      { emitEvent: false }
                    )
                  : null;
                if (this.insuranceType == 'secondary_health') {
                  this.resetTertiaryForm.emit(true);
                }
              } else {
                this.form.controls[
                  this.insuranceType == 'secondary_health'
                    ? 'secondary_dialog'
                    : 'tertiary_dialog'
                ].patchValue('yes');
              }
            })
            .catch();
        }
				else
				{
					control.classes.push('hidden');
					this.insurance&&this.insurance.id ? this.form.patchValue({ is_deleted: true }, { emitEvent: false }) : null

				}


				
			}
			else{
				control.classes.push('hidden');
				this.insurance&&this.insurance.id ? this.form.patchValue({ is_deleted: true }, { emitEvent: false }) : null
	
			}
		}))
	}
	searchInsuranceScrollToEnd()
	{
		return new Observable((res) => {
			if(!this.insurance_last_page){
				this.insurance_page += 1;
				this.getInsurances(this.searchKey,null,null,).subscribe((data)=>{
					let result = [...data['result']['data']];
					this.lstInsurance = [...this.lstInsurance,...result]
					this.insurance_last_page = data['result']&&data['result']['is_last_page']?data['result']['is_last_page']:false;
					res.next(this.lstInsurance);
				})
			}
		});
	}
	OnclearLocation(){
		return new Observable((res) => {
			this.hideFields();
			let InsuranceLocations = []
			this.insurance_page = 1;
			this.searchKey = '';
			let insuranceid=this.form.value.insurance_company?this.form.value.insurance_company.id:null;
			this.getInsurances('',insuranceid,null).subscribe(data => {
				this.lstInsurance = data['result']?[data['result']]:[]
				InsuranceLocations = data['result']?data['result']['insurance_locations']:[];
				this.insurance_last_page = data['result']&&data['result']['is_last_page']?data['result']['is_last_page']:false;
				res.next(InsuranceLocations)
			})
		})
	}
	OnFocusLocation(){
		return new Observable((res) => {
			let InsuranceLocations = []
			this.insurance_page = 1;
			this.searchKey = '';
			let insuranceid=this.form.value.insurance_company?this.form.value.insurance_company.id:null;
			this.getInsurances('',insuranceid,null).subscribe(data => {
				this.lstInsurance = data['result']?[data['result']]:[]
				InsuranceLocations = data['result']?data['result']['insurance_locations']:[];
				this.insurance_last_page = data['result']&&data['result']['is_last_page']?data['result']['is_last_page']:false;
				res.next(InsuranceLocations)
			})
		})
	}
	hideFields(){
		let insurance_company = this.form?.controls['insurance_company'] as FormGroup;
		insurance_company.controls['clearinghouse_name'].setValue(null);
		insurance_company.controls['payer_info'].setValue(null);
		insurance_company.controls['payer_id'].setValue(null);
		let clearinghouse_name=getFieldControlByName(this.fieldConfig, 'clearinghouse_name');
		clearinghouse_name.classes.push('hidden');
		let payer_info=getFieldControlByName(this.fieldConfig, 'payer_info');
		payer_info.classes.push('hidden');
		let select_payer=getFieldControlByName(this.fieldConfig, 'select_payer');
		select_payer.classes.push('hidden');
	}
	submit(form) {
	}
	showPayerSelect(event){
		this.loadSpin = false
		let insurance_company = this.form.controls['insurance_company'] as FormGroup;
		let formData = insurance_company.getRawValue();
		this.getPayerInfo(formData['state_id'],formData['id'],formData['payer_id'],true);
	}
}
