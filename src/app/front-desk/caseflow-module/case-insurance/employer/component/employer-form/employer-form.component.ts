import { find } from 'lodash';
import {
	Component,
	OnInit,
	Input,
	Output,
	EventEmitter,
	OnChanges,
	SimpleChange,
	SimpleChanges,
	AfterViewInit,
	ViewChild,
	OnDestroy
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
import { FDServices } from '../../../../../fd_shared/services/fd-services.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import {
	changeDateFormat,
	dateObjectPicker,
	dateFormatterMDY,
	unSubAllPrevious,
} from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Observable, Subject, Subscription } from 'rxjs';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { AddressClass } from '@appDir/shared/dynamic-form/models/AddressClass.class';
import { ButtonClass } from '@appDir/shared/dynamic-form/models/ButtonClass.class';
import { ButtonTypes } from '@appDir/shared/dynamic-form/constants/ButtonTypes.enum';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { RadioButtonClass } from '@appDir/shared/dynamic-form/models/RadioButtonClass.class';
import { CaseFlowServiceService } from '../../../../../fd_shared/services/case-flow-service.service';
import { CaseEmployer, CaseEmployerTypeEnum, caseType } from '../../../../../fd_shared/models/Case.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SelectClass } from '@appDir/shared/dynamic-form/models/SelectClass.class';
import { getFieldControlByName, updateControlValidations } from '@appDir/shared/dynamic-form/helper';
import { DynamicControl } from '@appDir/shared/dynamic-form/models/DynamicControl.class';
import { AutoCompleteClass } from '@appDir/shared/dynamic-form/models/AutoCompleteClass.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { EmployerUrlsEnum } from '@appDir/front-desk/masters/billing/employer-master/employer/Employer-Urls-Enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { CaseTypeEnum } from '@appDir/front-desk/fd_shared/models/CaseTypeEnums';
import { removeEmptyAndNullsFormObject, removeEmptyKeysFromObject, statesList, WithoutTime,allStatesList } from '@appDir/shared/utils/utils.helpers';
import { ZipFormatMessages } from '@appDir/shared/dynamic-form/constants/ZipFormatMessages.enum';
import { NgSelectClass } from '@appDir/shared/dynamic-form/models/NgSelectClass.class';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { BillingInsuranceModel } from '@appDir/front-desk/masters/billing/insurance-master/models/BillingInsurance.Model';
import { InsuranceUrlsEnum } from '@appDir/front-desk/masters/billing/insurance-master/Insurance/insurance-list/Insurance-Urls-enum';
import { EmpInsuLinkageEnum } from '@appDir/front-desk/masters/billing/emp-insu-linkage/emp-insu-linkage';
import { NF2Urls } from '../../../insurance/insuranceUrls';
import { ClearinghouseEnum } from '@appDir/front-desk/masters/billing/clearinghouse/CH-helpers/clearinghouse';
import { type } from 'jquery';
@Component({
	selector: 'app-employer-form',
	templateUrl: './employer-form.component.html',
})
export class EmployerFormComponent implements OnChanges {
	subscription: Subscription[] = [];
	public form: FormGroup;
	@Input() title;
	@Input() employer: CaseEmployer;
	// @Input() caseData: CaseModel;
	@Output() getCase = new EventEmitter();
	@Output() closeModal = new EventEmitter();
	public insuranceType: string = 'major medical';
	insurance_manual_add : boolean = false;
	employer_manual_add : boolean = false;
	startLoader : boolean = false;
	@Input() caseId: any;
	@Input() case_type:caseType;
	@Input() patientId: any;
	@Output() submit = new EventEmitter()
	@ViewChild(DynamicFormComponent) component: DynamicFormComponent
	public relations: any[];
	@Input() empCaseTypeId: CaseEmployerTypeEnum;
	allStates = allStatesList;
	disableBtn = false;
	employerCaseTypes: any[] = [];
	employer_filter={
		page:0,
		searchKey:'',
		lastPage:2,
		per_page:10
	};
	states = statesList;
	insurance_last_page:boolean;
	insurance_page:number = 1;
	searchKey = '';
	lstInsurance = [];
	searchTypeHead$:Subject<any>=new Subject<any>();
	emplId:any;
	constructor(
		private fb: FormBuilder,
		private logger: Logger,
		private fd_services: FDServices,
		private toastrService: ToastrService,
		private router: Router,
		private route: ActivatedRoute,
		private caseFlowService: CaseFlowServiceService,
		private activeModal: NgbActiveModal,
		private requestService: RequestService,
		private customDiallogService : CustomDiallogService
	) {
		this.setForm();
	}
	fieldConfig: FieldConfig[] = [];

	ngAfterViewInit() {
		this.form = this.component.form;
		let disableControlNames = ['phone_no', 'ext', 'email', 'fax', 'street_address','apartment_suite', 'city', 'state', 'zip']
		disableControlNames.forEach(name => { this.form.get(name).disable() })
		if (this.employer) {
			debugger;
			this.form.patchValue(removeEmptyAndNullsFormObject(this.employer))
			// if(this.employer.id && this.employer.is_verified)
			// {
				// let body = {
				// 	filter:this.employer.employer_name?true:false,
				// 	order:OrderEnum.ASC,
				// 	per_page: this.employer_filter.per_page,
				// 	page: this.employer_filter.page||1,
				// 	pagination:1,
				// };
				// if(body.filter)
				// {
				// 	body['name']=this.employer.employer_name;
				// }
				this.getEmployer(this.employer.employer_name, this.employer && this.employer.employer_id?this.employer.employer_id:null,this.caseId,0).subscribe(data => {
					let employer =(data&& data['result']&& data['result']['data']&& data['result']['data'].length>0)?data['result']['data'][0]:null;
					this.form.patchValue({
						employer_id: employer.id
					})
					this.lstEmployer = employer?[employer]:[];
					getFieldControlByName(this.fieldConfig, 'employer_id').items = this.lstEmployer;
					if(employer?.case_employer?.length){
						employer['insurance_information'] = employer?.case_employer[employer?.case_employer?.length -1];
						let insurance_location = employer?.insurance_information?.insurance?.insurance_location;
						insurance_location = insurance_location?.filter(locat => locat.id == employer?.insurance_information?.insurance_location_id)?.[0];
						if(insurance_location && employer?.insurance_information?.payer && employer?.insurance_information?.payer_id){
							let control = getFieldControlByName(this.fieldConfig, 'payer_id') as AutoCompleteClass;
							if(insurance_location?.is_associate_with_payer){
								this.getPayerInfo(insurance_location?.kiosk_state_id,insurance_location?.insurance_id)?.subscribe((res)=>{
									let payer_list = res?.result?.data;
									control.classes = control.classes.filter((cls) => cls != 'hidden');
									if(res?.result?.data.length){
										payer_list.forEach(res =>{
											res['ch_payer_id'] = res['clearinghouse']['name'] +'-'+ res['payer_id']
										});
										if(control){
											control.items = [...payer_list];
										}
									}else{
										control.items = [...payer_list];
									}
								})
							}else{
								control.classes.push('hidden');
							}
						}
						this.form.patchValue({
							employer_id: employer.id,
							insurance_information:employer['insurance_information']
						})
						if(insurance_location?.is_associate_with_payer){
							if(employer['insurance_information']['payer']){
								employer['insurance_information']['payer']['ch_payer_id'] = employer?.insurance_information?.payer?.clearinghouse?.name +' - '+employer?.insurance_information?.payer?.payer_id;
								getFieldControlByName(this.fieldConfig, 'payer_id').classes = getFieldControlByName(this.fieldConfig, 'payer_id').classes.filter(clas => clas != 'hidden');
								getFieldControlByName(this.fieldConfig, 'payer_id').items = employer['insurance_information']['payer']?[employer['insurance_information']['payer']]:[];
							}
						}
					}
					if(this.empCaseTypeId === CaseEmployerTypeEnum.primary){
						getFieldControlByName(this.fieldConfig, 'insurance_id').items = (employer?.insurance_information?.insurance) ? [employer?.insurance_information?.insurance]:[];
						this.lstInsurance = (employer?.insurance_information?.insurance) ? [employer?.insurance_information?.insurance]:[];
						getFieldControlByName(this.fieldConfig, 'insurance_location_id').items = (employer?.insurance_information?.insurance?.insurance_location) ? employer?.insurance_information?.insurance?.insurance_location : [];
					}
				})
		}
		if (this.empCaseTypeId) {
			getFieldControlByName(this.fieldConfig, 'employer_type_id').classes.push('hidden');
			if (this.empCaseTypeId == CaseEmployerTypeEnum.primary) {
				getFieldControlByName(this.fieldConfig, 'end_Date').classes.push('hidden')
				getFieldControlByName(this.fieldConfig, 'date_hired').classes=['col-xl-4 col-sm-6 parent-horizontal-label'];
				getFieldControlByName(this.fieldConfig, 'email').classes=['col-xl-4 col-sm-6'];
				getFieldControlByName(this.fieldConfig, 'fax').classes=['col-xl-4 col-sm-6'];
			} else {
				getFieldControlByName(this.fieldConfig, 'contact_information').classes.push('hidden')
				getFieldControlByName(this.fieldConfig, 'is_time_looses').classes.push('hidden')

			}
			this.form.patchValue({ employer_type_id: this.empCaseTypeId })
		} else {
			getFieldControlByName(this.fieldConfig, 'contact_information').classes.push('hidden')
			getFieldControlByName(this.fieldConfig, 'is_time_looses').classes.push('hidden')
		}
		switch (this.empCaseTypeId) {
			case CaseEmployerTypeEnum.primary:
				this.title = 'Primary';
				break;
			case CaseEmployerTypeEnum.secondary:
				this.title = 'Secondary';
				break;
			case CaseEmployerTypeEnum.yearly:
				this.title = 'Yearly';
				break;
		}
		this.bindEmployerChange();
		this.isDateOfHiredMax();
		this.isDateOfEndMax();
		this.bindInsuranceChange();
		this.bindLocationChange();
		// this.bindEmployerNameChange();
	}

	showEmployerName(show)
	{
		let employerNameControl=getFieldControlByName(this.fieldConfig, 'employer_name')
		if(show)
		{
			employerNameControl.classes = employerNameControl.classes = employerNameControl.classes = employerNameControl.classes.filter(className => {
				return className != "hidden"
			})
			let disableControlNames = ['phone_no', 'ext', 'email', 'fax', 'street_address','apartment_suite', 'city', 'state', 'zip']
		disableControlNames.forEach(name => { this.form.get(name).enable() })
		this.form.patchValue({
			employer_name:this.employer.employer_name
		})
			
		}
		else
		{
			employerNameControl.classes.push('hidden');
		}
		// this.form.patchValue({
		// 	employer_name:this.employer.employer_name
		// })
	}

	showEmployerNameDropdown(show)
	{
		let employerNameControl=getFieldControlByName(this.fieldConfig, 'employer_id')
		if(show)
		{
			employerNameControl.classes = employerNameControl.classes = employerNameControl.classes = employerNameControl.classes.filter(className => {
				return className != "hidden"
			})
			let disableControlNames = ['phone_no', 'ext', 'email', 'fax', 'street_address','apartment_suite', 'city', 'state', 'zip']
			disableControlNames.forEach(name => { this.form.get(name).disable() })
			
		}
		else
		{
			employerNameControl.classes.push('hidden');
		}
		
	}

	bindEmployerChange() {
	this.subscription.push(	this.form.get('employer_id').valueChanges.subscribe(id => {
		let insurance_information=getFieldControlByName(this.fieldConfig, 'insurance_information');
		let insur_inf_form =  this.form.get('insurance_information') as FormGroup;
			if(!id)
			{
				insurance_information.classes.push('hidden');
				insur_inf_form.reset({});
				getFieldControlByName(this.fieldConfig, 'insurance_location_id').items = [];
				getFieldControlByName(this.fieldConfig, 'payer_id').items = [];
				// this.getEmployer().subscribe(data => {
				// this.lstEmployer=[]
				// 		this.lstEmployer = data['result'].data;
						
				// 		let employer_name_control = getFieldControlByName(this.fieldConfig, 'employer_id');
							
				// 		employer_name_control.items = this.lstEmployer;
						this.form.patchValue({
							// employer_name:null,
							phone_no: '',
							ext: '',
							email: '',
							fax: '',
							street_address: '',
							apartment_suite: '',
							city: '',
							state: '',
							zip: '',
							is_time_looses:'',
							first_name:'',
							middle_name:'',
							last_name:''
			
						},{emitEvent:false})
						// thicontact_information
						// this.form.patchValue({
						// 	employer_name:null,
						// },{emitEvent:false})

						let disableControlNames = ['phone_no', 'ext', 'email', 'fax', 'street_address','apartment_suite', 'city', 'state', 'zip']
						disableControlNames.forEach(name => { this.form.get(name).enable() })

					return;
				// })
			}

			else{
				let employer = this.lstEmployer.find(employer => employer.id == id);
				if(typeof id == 'string'){
					this.employer_manual_add = true;
				}
				else{
					this.employer_manual_add = false;
					if((this.case_type.slug === 'worker_compensation' || this.case_type.slug === 'nf_wc') && this.empCaseTypeId == CaseEmployerTypeEnum.primary){
						if(employer?.is_verified)
						insurance_information.classes = insurance_information.classes.filter(className => className != 'hidden');
						this.emplId = id;
						insur_inf_form.reset({});
						getFieldControlByName(this.fieldConfig, 'insurance_location_id').items = [];
						getFieldControlByName(this.fieldConfig, 'payer_id').items = [];
					}
				} 
				if(employer)
				{
					this.form.patchValue({
						phone_no: employer.phone_no,
						ext: employer.ext,
						email: employer.email,
						fax: employer.fax,
						street_address: employer.street_address,
						apartment_suite: employer.apartment_suite,
						city: employer.city,
						state: employer.state,
						zip: employer.zip
		
					},{emitEvent:false})
					let disableControlNames = ['phone_no', 'ext', 'email', 'fax', 'street_address','apartment_suite', 'city', 'state', 'zip']
							disableControlNames.forEach(name => { this.form.get(name).disable() })
				}
				else
				{
					let disableControlNames = ['phone_no', 'ext', 'email', 'fax', 'street_address','apartment_suite', 'city', 'state', 'zip']
						disableControlNames.forEach(name => { this.form.get(name).enable() })
				}
				
			}
		
			
				
			
			
		})
	);
	}

	bindEmployerNameChange() {
		this.subscription.push(this.form.get('employer_name').valueChanges.subscribe(id => {
			debugger;
			if(!id)
			{
			
				this.getEmployer().subscribe(data => {
				this.lstEmployer=[]
						this.lstEmployer = data['result'].data;
						this.showEmployerNameDropdown(true);
						this.showEmployerName(false);
						let employer_name_control = getFieldControlByName(this.fieldConfig, 'employer_id');
					
						employer_name_control.items = this.lstEmployer;
						this.form.patchValue({
							// employer_name:null,
							employer_id:null,
							phone_no: '',
							ext: '',
							email: '',
							fax: '',
							street_address: '',
							apartment_suite: '',
							city: '',
							state: '',
							zip: '',

			
						},{ emitEvent: false })

						// let disableControlNames = ['phone_no', 'ext', 'email', 'fax', 'street_address','apartment_suite', 'city', 'state', 'zip']
						// disableControlNames.forEach(name => { this.form.get(name).enable() })

					return;
				})
			}

			else{
				// let employer = this.lstEmployer.find(employer => employer.id == id);
				// if(employer)
				// {
				// 	this.form.patchValue({
				// 		phone_no: employer.phone_no,
				// 		ext: employer.ext,
				// 		email: employer.email,
				// 		fax: employer.fax,
				// 		street_address: employer.street_address,
				// 		apartment_suite: employer.apartment_suite,
				// 		city: employer.city,
				// 		state: employer.state,
				// 		zip: employer.zip
		
				// 	})
				// 	let disableControlNames = ['phone_no', 'ext', 'email', 'fax', 'street_address','apartment_suite', 'city', 'state', 'zip']
				// 			disableControlNames.forEach(name => { this.form.get(name).disable() })
				// }
				// else
				// {
					// let disableControlNames = ['phone_no', 'ext', 'email', 'fax', 'street_address','apartment_suite', 'city', 'state', 'zip']
					// 	disableControlNames.forEach(name => { this.form.get(name).enable() })
				// }
				
			}
		
			
				
			
			
		})
		);
	}
	ngOnInit() {
		this.fieldConfig = [
			new DivClass([
				new DynamicControl('id', null),
				// new DynamicControl('id', ''),
				new SelectClass('Employer Type', 'employer_type_id', [
					{ name: 'secondary', label: 'Secondary Employer', value: 2 },
					{ name: 'yearly', label: 'Yearly Employer', value: 3 }
				], 2, [], ['col-12']),
				// new AutoCompleteClass('Employer Name*', 'employer_id', 'employer_name', 'id', this.searchEmployer.bind(this), false, '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-sm-6'],[],{add_tag:true},this.onFocusSearchEmployer.bind(this)),
				new NgSelectClass("Employer Name*", 'employer_id', 'employer_name', 'id', null, false, '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-sm-6'],[],{add_tag:true},null,null,null,this.onFocusSearchEmployer.bind(this),this.searchPracticeLocationsScrollToEnd.bind(this),this.searchTypeHead$,this.searchTypeHead.bind(this)),

				// new InputClass('Employer Name*', 'employer_name', InputTypes.text, '', [
				// 	{ name: 'required', message: 'Employer Name is required', validator: Validators.required },
				// 	{ name: 'maxlength', message: 'Max Length Cannot be greater than 30', validator: Validators.maxLength(30) }
				// ], '', ['col-6','hidden']),
				new InputClass("Patient's Occupation", 'occupation', InputTypes.text, '', [
					// { name: 'maxlength', message: 'Max Length Cannot be greater than 30', validator: Validators.required }
				], '', ['col-sm-6']),
				new InputClass('Phone No*', 'phone_no', InputTypes.text, '', [
					{ name: 'required', message: 'This field is required', validator: Validators.required },
					// { name: 'minlength', message: 'Phone length cannot be less than 10', validator: Validators.minLength(10) }
				], '', ['col-sm-6'], { mask: '000-000-0000' }),
				new InputClass('Extension', 'ext', InputTypes.text, '', [
					{ name: 'maxlength', message: 'Ext length cannot be greater than 15', validator: Validators.maxLength(15) },
					// { name: 'minlength', message: 'Ext length cannot be less than 2', validator: Validators.minLength(1) }
				], '', ['col-sm-6'], { mask: '000000000000000', skip_validation: true }),
				new InputClass('Hiring Date', 'date_hired', InputTypes.date, null, [], '', ['col-sm-6', 'col-lg-3', 'parent-horizontal-label'], { max: new Date() }),
				new InputClass('End Date', 'end_Date', InputTypes.date, null, [], '', ['col-sm-6', 'col-lg-3', 'parent-horizontal-label'], { max: new Date() }),
				new InputClass('Email', 'email', InputTypes.email, '', [
					{ name: 'pattern', message: 'Email is not valid', validator: Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$') }
				], '', ['col-sm-6', 'col-lg-3']),
				new InputClass('Fax', 'fax', InputTypes.text, '', [
					// { name: 'minlength', message: 'Fax length cannot be less than 10', validator: Validators.minLength(10) }
				], '', ['col-sm-6', 'col-lg-3'], { mask: '000-000-0000' }),

				new AddressClass('Street Address*', 'street_address', this.handleAddressChange.bind(this), '', [
					{ name: 'required', message: 'This field is required', validator: Validators.required }
				], '', ['col-sm-6']),
				new InputClass('Suite / Floor', 'apartment_suite', InputTypes.text, '', [], '', ['col-sm-6']),
				new InputClass('City*', 'city', InputTypes.text, '', [	{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-sm-6', 'col-lg-4']),
				// new InputClass('State', 'state', InputTypes.text, '', [], '', ['col-sm-6', 'col-lg-4']),
				new SelectClass('State*', 'state', this.allStates.map(res => {
					return { name: res.name, label: res.name, value: res.name,fullName:res.fullName  }
				  }), '', [	{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-sm-6', 'col-lg-4'],false,false,'selectState'),
				// new InputClass('Zip', 'zip', InputTypes.text, '', [], '', ['col-sm-6', 'col-lg-4'], { mask: '00000' }),
				new InputClass('Zip*', 'zip', InputTypes.text, '', [{name:'pattern', message:ZipFormatMessages.format_usa,validator:Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')},	{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-sm-6', 'col-lg-4'], ),
				new RadioButtonClass('Did you loose time from work at other employments as a result of your injury?*', 'is_time_looses', [
					{ label: 'Yes', name: 'yes', value: 1 },
					{ label: 'No', name: 'no', value: 0 }
				], '', [
					{ name: 'required', message: 'This field is required', validator: Validators.required }
				], ['col-12'])
			], ['row']),

			new DivClass([
				new DynamicControl('id', null),

				new InputClass('First Name', 'first_name', InputTypes.text, '', [
					// { name: 'required', message: 'First Name is required', validator: Validators.required },
					{ name: 'maxlength', message: 'Max Length Cannot be greater than 30', validator: Validators.maxLength(30) }
				], '', ['col-sm-6', 'col-lg-4'], { title_case: true }),
				new InputClass('Middle Name', 'middle_name', InputTypes.text, '', [
					{ name: 'maxlength', message: 'Max Length Cannot be greater than 30', validator: Validators.maxLength(30) }
				], '', ['col-sm-6', 'col-lg-4'], { title_case: true }),
				new InputClass('Last Name', 'last_name', InputTypes.text, '', [
					// { name: 'required', message: 'Last Name is required', validator: Validators.required },
					{ name: 'maxlength', message: 'Max Length Cannot be greater than 30', validator: Validators.maxLength(30) }
				], '', ['col-sm-6', 'col-lg-4'], { title_case: true })
			], ['row'], "Supervisor's information", '', { formControlName: 'contact_information', name: 'contact_information' }),
			new DivClass([
				new DynamicControl('id', null),
				new DynamicControl('insurance_name', null),
				new NgSelectClass("Insurance Name", 'insurance_id', 'insurance_name', 'id', this.SearchInsurance.bind(this), false, null, [], '', ['col-sm-6', 'col-md-4', 'col-xl-3'],[],{add_tag:true},this.onFocusGetInsurance.bind(this),null,this.SearchInsurance.bind(this),this.onFocusGetInsurance.bind(this),this.searchInsuranceScrollToEnd.bind(this)),
				new AutoCompleteClass('Insurance Location', 'insurance_location_id', 'location_name', 'id', null, false, null, [], '', ['col-sm-6', 'col-md-4', 'col-xl-3'],[],null,'','',this.OnclearLocation.bind(this)),
				new InputClass('Location Name', 'insurance_location_name', InputTypes.text, '', [
					{ name: 'maxlength', message: 'Max Length Cannot be greater than 30', validator: Validators.maxLength(30) }
				], '', ['col-sm-6', 'col-md-4', 'col-xl-3','hidden'], { title_case: true }),
				new AutoCompleteClass('Payer ID', 'payer_id', 'ch_payer_id', 'id', null, false, null, [], '', ['col-sm-6', 'col-md-4', 'col-xl-3','hidden'],[],null,'','',null)
			],['row','hidden'], "Inurance Information", '', { formControlName: 'insurance_information', name: 'insurance_information' }),

			new DivClass([
				new ButtonClass('Cancel', ['btn', 'btn-primary', 'btn-block', 'mt-1 mt-sm-0 mb-1 mb-sm-0'], ButtonTypes.button, this.close.bind(this), { icon: 'icon-left-arrow me-2', button_classes: [''] }),
				new ButtonClass('Save & Continue', ['btn', 'btn-success', 'btn-block', 'mt-1 mt-sm-0'], ButtonTypes.submit, null, { icon: 'icon-save-continue me-2', button_classes: [''] })
			], ['row', 'form-btn', 'justify-content-center'])
		]
		// this.getEmpCaseTypes();
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes && changes['employer']) {

		}

	}

	lstEmployer: any = []

	searchEmployer(name) {
		return new Observable((res) => {
			this.getEmployer(name).subscribe(data => {
				if (data) {
					this.lstEmployer = data['result'].data;
					res.next(this.lstEmployer)
				} else {
					res.next([])
				}
			})
		})
	}

	// onFocusSearchEmployer(name) {
	// 	return new Promise((res, rej) => {
	// 		if(!this.lstEmployer.length)
	// 		{
	// 			this.getEmployer(name).subscribe(data => {
	// 				if (data) {
	// 					this.lstEmployer = data['result'].data;
	// 					res(this.lstEmployer)
	// 				} else {
	// 					res([])
	// 				}
	// 			})
	// 		}
	// 		else
	// 		{
	// 			res(this.lstEmployer)
	// 		}
			
	// 	})
	// }

	onFocusSearchEmployer(name) {
		return new Observable((res) => {
			if (this.lstEmployer.length == 0 || this.emplId) {
				this.employer_filter.page+=1;
				this.getEmployer(name).subscribe((data) => {
					let result = [...data['result']['data']];
	
					this.employer_filter.searchKey = '';
	
					this.employer_filter.lastPage = data.result.last_page;
	
					this.lstEmployer = [...this.lstEmployer, ...result];

					res.next(this.lstEmployer);
	
				});
	
			}
		})
	}

	searchPracticeLocationsScrollToEnd()
	{
		return new Observable((res) => {
			
			if (this.employer_filter.page < this.employer_filter.lastPage) {
				this.employer_filter.page += 1
				this.employer_filter.page = this.employer_filter.page;
				this.getEmployer(this.employer_filter.searchKey).subscribe((data) => {
	
					let result = [...data['result']['data']];
	
					this.employer_filter.lastPage = data.result.last_page;
	
					this.lstEmployer = [...this.lstEmployer, ...result];
					res.next(this.lstEmployer);
				});
	
			}
	
		})
			
	}

	searchTypeHead(filter)
	{
		this.employer_filter.searchKey=filter;
		this.employer_filter.page=1;
		this.employer_filter.lastPage=2
		this.lstEmployer=[]
		return new Observable((res) => {
				this.getEmployer(filter).subscribe((data) => {
	
					let result = [...data['result']['data']];
					this.employer_filter.lastPage = data.result.last_page;
					this.lstEmployer = [ ...result];
					res.next(this.lstEmployer);
				});
		})
	}
	getEmployer(name?, id?,case_id?,is_verified_employer?) {
		let body = (is_verified_employer == 0) ? {
			filter:name?true:false,
			order:OrderEnum.ASC,
			per_page: this.employer_filter.per_page,
			page: this.employer_filter.page||1,
			pagination:1
		} : {
			filter:name?true:false,
			dropDownFilter:true,
			order:OrderEnum.ASC,
			per_page: this.employer_filter.per_page,
			page: this.employer_filter.page||1,
			pagination:1,
			is_verified_employer: 1
		};
		if(body.filter)
		{
			body['name']=name;
		}
		if(id)
		{
			body['id']=id
		}
		if(case_id){
			body['case_id']= case_id
		}
		return this.requestService.sendRequest(EmployerUrlsEnum.Employer_list_GET, 'get', REQUEST_SERVERS.fd_api_url, body)
	}


	setForm() {
		this.form = this.fb.group({
			id: null,
			name: ['', [Validators.required, Validators.maxLength(30)]],
			email: ['', [Validators.email]],
			supervisorFirstName: ['', [Validators.required, Validators.maxLength(20)]],
			supervisorMiddleName: ['', [Validators.maxLength(20)]],
			supervisorLastName: ['', [Validators.required, Validators.maxLength(20)]],
			occupation: ['', [Validators.maxLength(100)]],
			hiringDate: [''],
			// companyName: ['', [Validators.required, Validators.maxLength(100)]],
			address: ['', [Validators.required]],
			lat: '',
			lng: '',
			apartment: ['', [Validators.maxLength(20)]],
			city: [''],
			state: [''],
			zip: [''],
			fax: ['', [Validators.minLength(10)]],
			phone: ['', [Validators.required, Validators.minLength(10)]],
			extNo: ['', [Validators.minLength(2)]],
			caseId: this.caseId,
			patientId: this.patientId,
		});
	}


	onSubmit(form) {
			let employer_id=form.employer_id;
			if(this.employer_manual_add)
			{
				form.employer_name=employer_id;
				form.employer_id=null;
			}
		if(this.insurance_manual_add){
			form['insurance_information']['insurance_id'] = null;
		}
		if(form?.employer_type_id === CaseEmployerTypeEnum.primary){
			form['update_call_from_primary'] = true;
		}
		this.closeModal.emit(form);
	}



	handleAddressChange(address: Address) {
		let street_number = this.fd_services.getComponentByType(address, 'street_number');
		let route = this.fd_services.getComponentByType(address, 'route');
		let city = this.fd_services.getComponentByType(address, 'locality');
		let state = this.fd_services.getComponentByType(address, 'administrative_area_level_1');
		let postal_code = this.fd_services.getComponentByType(address, 'postal_code');
		let lat = address.geometry.location.lat();
		let lng = address.geometry.location.lng();

		if (street_number != null) {
			let _address: any;
			_address = street_number.long_name + ' ' + route.long_name;

			this.form.patchValue({
				street_address: _address,
				city: city.long_name,
				state: state.long_name,
				zip: postal_code.long_name,
				lat: lat,
				lng: lng,
			});
		} else {
			this.form.patchValue({
				address: '',
				city: '',
				state: '',
				zip: '',
				lat: '',
				lng: '',
			});
		}
	}

	cancel() {
		// this.getCase.emit('form cancelled');
		this.closeModal.emit(false);
	}
	dismissModel() {
		this.closeModal.emit();
	}

	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
		this.logger.log('employer-form OnDestroy Called');
		this.employer = null;
	}
	close() {
		if (this.empCaseTypeId === CaseEmployerTypeEnum.primary && ( this.caseFlowService.case&& this.caseFlowService.case.case_type&&(this.caseFlowService.case.case_type.slug === CaseTypeEnum.worker_compensation || this.caseFlowService.case.case_type.slug === CaseTypeEnum.worker_compensation_employer))
			 && !this.employer) {
				this.customDiallogService.confirm('Discard Changes', 'Discarding Primary Employer will redirect you to previous screen?','Yes','No')
				.then((confirmed) => {
					
					if (confirmed){
						this.closeModal.emit(false);
						this.caseFlowService.goBack()	
					}
				})
				.catch();	
		
			// this.closeModal.emit(false);
		}

		else if (this.form.dirty && this.form.touched) {
			this.customDiallogService.confirm('Discard Changes', 'Do you want to discard changes?','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				this.closeModal.emit(false);
			}
		})
		.catch();
		} else {
			this.closeModal.emit(false);
		}
	}
	isDateOfHiredMax() {
		if(this.form) {
		this.subscription.push(this.form.controls['date_hired'].valueChanges.subscribe((value) => {
			if(WithoutTime(new Date(value)) > WithoutTime(new Date)) {
				this.form.controls['date_hired'].setErrors({max_date:true});
			} else {
				this.form.controls['date_hired'].setErrors(null);
			}
		}))
	}
	}
	isDateOfEndMax() {
		if(this.form) {
		this.subscription.push(this.form.controls['end_Date'].valueChanges.subscribe((value) => {
			if(WithoutTime(new Date(value)) > WithoutTime(new Date)) {
				this.form.controls['end_Date'].setErrors({max_date:true});
			} else {
				this.form.controls['end_Date'].setErrors(null);
			}
		}))
	}
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
	let paramQuery: any = { order: order, pagination: true, filter: false, page: this.insurance_page, per_page: 10, 
		order_by: order_by,adjustor_id: adjustorid?adjustorid:null ,dropDownFilter:true}
		paramQuery = removeEmptyKeysFromObject(paramQuery);
	let filter = {}
	if(this.emplId){
		filter['employer_id'] = this.emplId
	}
	if (Insuranceid) {
		paramQuery.filter = true;
		filter['id'] = Insuranceid
	}
	if (name) {
		paramQuery.filter = true;
		filter['insurance_name'] = name;
		delete filter['employer_id']
	}
	return this.requestService.sendRequest(InsuranceUrlsEnum.Get_Insurances, 'get', REQUEST_SERVERS.fd_api_url, { ...paramQuery, ...filter })
}

onFocusGetInsurance()
	{
		return new Observable((res) => {
					let adjustorid=this.form.value.adjustor? this.form.value.adjustor.id:null;
					let insuranceid=this.form.value.insurance_company?this.form.value.insurance_company.id:null;
					this.insurance_page = 1;
					this.searchKey = '';	
					this.getInsurances(null,insuranceid,adjustorid).subscribe(data => {						
						let insurance: BillingInsuranceModel[] = data['result']['data']?data['result']['data']:[]
						this.insurance_last_page = data['result']&&data['result']['is_last_page']?data['result']['is_last_page']:false;
						this.lstInsurance = [...insurance];	
							res.next(this.lstInsurance);
					});
	});
}
OnclearLocation(){
	return new Observable((res) => {
		let payer_id=getFieldControlByName(this.fieldConfig, 'payer_id');
		payer_id.classes.push('hidden');
		payer_id.items = [];
		let InsuranceLocations = [];
		this.insurance_page = 1;
		this.searchKey = '';
		let insuranceid=this.form.value.insurance_information?this.form.value.insurance_information.insurance_id:null;
		let currentInsur =  this.lstInsurance?.find(insur => insur.id == insuranceid);
		InsuranceLocations = currentInsur['insurance_location'];
		res.next(InsuranceLocations);
	})
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
	bindLocationChange(){
		let form = this.form.controls['insurance_information'] as FormGroup;
		this.subscription.push(form.controls['insurance_location_id'].valueChanges.subscribe((id:number)=>{
			let insurance = this.lstInsurance?.find(insurance =>{
				return insurance.id == (form?.controls?.insurance_id?.value)
			});
			let value:any = insurance?.insurance_location?.find(location => parseInt(location.id) === id);
			let control = getFieldControlByName(this.fieldConfig, 'payer_id') as AutoCompleteClass;
			if(value){
				if(value?.is_associate_with_payer){
					form.controls['payer_id'].reset();
					this.getPayerInfo(value?.kiosk_state_id,insurance?.id)?.subscribe((res)=>{
						let payer_list = res?.result?.data;
						control.classes = control.classes.filter((cls) => cls != 'hidden');
						if(res?.result?.data.length){
							payer_list.forEach(res =>{
								res['ch_payer_id'] = res['clearinghouse']['name'] +'-'+ res['payer_id']
							});
							if(payer_list.length == 1){
								form.controls['payer_id'].setValue(payer_list[payer_list.length - 1]['id']);
							}
							if(control){
								control.items = [...payer_list];
							}
						}else{
							control.items = [...payer_list];
						}
					})
				}else{
					control.classes.push('hidden');
					form.controls['payer_id'].setValue(null);
				}
			}
		}))
	}
	bindInsuranceChange() {
		let form = this.form.controls['insurance_information'] as FormGroup
		this.subscription.push(form.controls['insurance_id'].valueChanges.subscribe(value => {
			let insurance_div = getFieldControlByName(this.fieldConfig, 'insurance_information');
			let insurance_control = getFieldControlByName(insurance_div.children,'insurance_id');
			let payer_id_control = getFieldControlByName(this.fieldConfig, 'payer_id') as AutoCompleteClass;
			let insurance_location_id_control = getFieldControlByName(this.fieldConfig, 'insurance_location_id') as AutoCompleteClass;
			let insurance_location_name_control = getFieldControlByName(this.fieldConfig, 'insurance_location_name') as InputClass;
			let locationControlForm=(this.form.controls['insurance_information'] as FormGroup).controls['insurance_location_id'];
			let locationNameControlForm=(this.form.controls['insurance_information'] as FormGroup).controls['insurance_location_name'];
			insurance_location_id_control.validations=[];
			insurance_location_id_control.label="Location Name"
			if(value && !(typeof value == 'number')){
				this.insurance_manual_add = true;
				form.controls['insurance_name'].setValue(value);
				form.controls['payer_id'].setValue(null);
				locationControlForm.reset(null);
				insurance_location_id_control.items = [];
				insurance_location_name_control.classes = insurance_location_name_control.classes.filter(className => className != 'hidden');
				payer_id_control.classes.push('hidden');
				insurance_location_id_control.classes.push('hidden');
				insurance_location_name_control.label="Location Name*"
			    insurance_location_name_control.validations.push({ name: 'required', message: 'This field is required', validator: Validators.required });
				updateControlValidations(insurance_location_name_control.validations,locationNameControlForm)
				return
			}else{
				this.insurance_manual_add = false;
				insurance_location_id_control.classes = insurance_location_id_control.classes.filter(className => className != 'hidden');
				insurance_location_name_control.classes.push('hidden');
				locationControlForm.reset(null);
				locationNameControlForm.reset(null);
				insurance_location_id_control.items = [];
				payer_id_control.classes.push('hidden');
			}
			if (!value) {
				form.reset({}, { emitEvent: false });
				this.lstInsurance=[];
				insurance_control.items = this.lstInsurance
				
				updateControlValidations(insurance_location_id_control.validations,locationControlForm);
				form.controls['payer_id'].setValue(null);
				payer_id_control.classes.push('hidden');
				this.insurance_manual_add = false;
				insurance_location_id_control.items = [];
				return;
			}
			insurance_location_id_control.label="Location Name*"
			insurance_location_id_control.validations.push({ name: 'required', message: 'This field is required', validator: Validators.required })
			updateControlValidations(insurance_location_id_control.validations,locationControlForm)
			let insurance = this.lstInsurance.find(insurance => insurance.id === value)
			this.lstInsurance=this.lstInsurance.filter(insurance => insurance.id === value);
			insurance_control.items = this.lstInsurance
			
			if (!insurance) { return }

			if (insurance_location_id_control) {
				insurance_location_id_control.items = insurance.insurance_location
			}
		}))
	}
	getPayerInfo(state_ids,insurance_id) {
		if(state_ids && insurance_id){
			return	this.requestService.sendRequest(
					ClearinghouseEnum.Get_Payers_Info, 'get', REQUEST_SERVERS.fd_api_url, { state_ids: [state_ids],insurance_ids : [insurance_id]})
	}
}
}
