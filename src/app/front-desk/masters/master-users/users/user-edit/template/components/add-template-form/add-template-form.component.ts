import { ReferringPhysicianService } from './../../../../../../practice/referring-physician/referring-physician/referring-physician.service';
import { ChangeDetectorRef, OnChanges, ViewChild } from '@angular/core';
import { map } from 'rxjs/operators';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import {  NgbModal,  NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { AclService } from '@appDir/shared/services/acl.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import {  unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Title } from '@angular/platform-browser';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';

import { SpecialityUrlsEnum } from '@appDir/front-desk/masters/providers/speciality/specialities-listing/Speciality-urls-enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { getIdsFromArray, removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
import { HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { EnumApiPath } from '@appDir/front-desk/billing/Models/searchedKeys-modal';
import { VisitTypeUrlsEnum } from '@appDir/front-desk/masters/providers/vistType/visit.type.enum';
import { VisitType } from '@appDir/front-desk/masters/providers/vistType/VisitType.model';
import { CaseTypeUrlsEnum } from '@appDir/front-desk/masters/providers/caseType/case.type.enum';
import { FacilityUrlsEnum } from '@appDir/front-desk/masters/practice/practice/utils/facility-urls-enum';
import { TemplateUrlsEnum } from '../../template-urls-enum';
import { data } from 'jquery';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { ShareAbleFilter } from '@appDir/shared/models/share-able-filter';
import { NgSelectShareableComponent } from '@appDir/shared/ng-select-shareable/ng-select-shareable.component';
import { FormControlNameEnum } from '@appDir/shared/dynamic-form/constants/form-control-name.enum';
@Component({
	selector: 'app-add-template-form',
	templateUrl: './add-template-form.component.html',
	styleUrls: ['./add-template-form.component.scss']
})
export class AddTemplateFormComponent extends PermissionComponent implements OnInit,OnChanges, OnDestroy {
	subscription: Subscription[] = [];
	loadSpin: boolean = false;
	templateForm: FormGroup;
	disableBtn: boolean = false;
	@Input() title: string="Add New";
	@Input() buttonTitle: string="Save & Continue";
	@Input() userId:number;
	@Input() is_multiple:boolean=true;
	@Input() data:any;
	@Input() editRecord:any;
	isDisabledFormControls:boolean=false
	disableFieldSpecialty:boolean = true;
	disableFieldVisitType:boolean = true;
	conditionalExtraApiParams = {};
	eventsSubject: Subject<any> = new Subject<any>();
	eventsSubjectTemplate: Subject<any> = new Subject<any>();
	selectedMultipleFieldFiter: any = {
		'case_type_ids': [],
		'facility_location_id':[],
		'specialty_id':[],
		'visit_type_ids':[]
	};
	showSelectFieldList: any = {
	
		'template_ids':[]
	};
	EnumApiPath = SpecialityUrlsEnum;
	requestServerpath = REQUEST_SERVERS;
	predefinedSpecialties:any[]=[]
	TemplateUrlsEnum = TemplateUrlsEnum;
	mainApi = REQUEST_SERVERS;
	templateUrls = TemplateUrlsEnum.get_templates;
	lstVisitTypes: VisitType[] = []
	CaseTypeUrlsEnum=CaseTypeUrlsEnum;
	lstFacilities: Array<any> = [];
	lstSpecialties:any[]=[];
	lstTemplates:any[]=[];
	Facility_list_dropdown_GET=FacilityUrlsEnum.Facility_list_dropdown_GET;
	@ViewChild('caseTypes') caseTypes:any = {};
	@ViewChild('facilityLocation') facilityLocation:any = {};
	@ViewChild('specialtyDropDown') specialtyDropDown:any = {};
	@ViewChild('visitTypeDropDown') visitTypeDropDown:any = {};
	@ViewChild('templates') templatesApi: NgSelectShareableComponent;
	constructor(
		private activeModal: NgbActiveModal,
		aclService: AclService,
		private fb: FormBuilder,
		private modalService: NgbModal,
		router: Router,
		private toaster: ToastrService,
		protected requestService: RequestService,
		private _route: ActivatedRoute,
		titleService: Title,
		private referringPhyscianService:ReferringPhysicianService,
		public customDiallogService: CustomDiallogService,
		private cdr : ChangeDetectorRef
		) {
		super(aclService, router, _route, requestService, titleService);


	}

	ngOnInit() {
		this.templateForm = this.initializeVisitType();
		if(!this.editRecord) {
			this.getFacitiesOfUser();
		}

		if(this.editRecord)
		{this.getFacitiesOfUser();
			this.setRowValuesOnForm();
			
			this.getSpecialtiesOfUserAgainstPractice();
			
			this.getvisitsOfUserAgainstSpecialty();

		}
	
	}

	ngOnChanges()
	{

	}
	 setRowValuesOnForm() {
		if(this.editRecord) {
			this.templateForm.enable();
			this.bindDropDownValuesOnEdit();
			if (this.editRecord?.is_editable === 1) {
				this.templateForm.get('is_static').disable();
			}

			this.templateForm.patchValue(
				{
					case_type_ids:this.editRecord.case_type_id,
					
					facility_location_id:this.editRecord.facility_location_id,
					specialty_id:(this.editRecord.specialty_id),
					visit_type_ids:this.editRecord.visit_type_id,
					template_ids:this.editRecord.template_type === 'dynamic' ? this.editRecord.template_id : null,
					is_default:this.editRecord.is_default,
					is_manual:this.editRecord.is_manual,
					is_static:this.editRecord.is_static,
					
				}
				);
		    this.caseTypeControl.clearValidators();
			// this.getFacitiesOfUser();
			this.bindtemplateListOnEdit();
			this.getTemplatesOfUser();
			

			
		
			 this.cdr.detectChanges();
		}
	}

	bindtemplateListOnEdit()
	{
		if(this.editRecord && this.editRecord.template_type === 'dynamic')
	{
		let selectedtemplates=
		{
			template_name:this.editRecord.template_name,
		template_id:this.editRecord.template_id
		}
		
		this.showSelectFieldList.template_ids= [{...selectedtemplates}]

		
	}
}

bindDropDownValuesOnEdit()
{
	if(this.editRecord)
	{
		this.disableFieldSpecialty = false;
		this.disableFieldVisitType = false;
		this.caseTypes['lists'] = [{id: this.editRecord.case_type_id,name:this.editRecord.case_type_name}];
		this.facilityLocation['lists'] = [{id: this.editRecord.facility_location_id,facility_full_name:this.editRecord.practice_location_name,qualifier:this.editRecord.facility_qualifier +'-' +this.editRecord.facility_location_qualifier}];
		// this.facilityLocation['lists'] =[this.lstFacilities.find(x =>x.id == this.editRecord.facility_location_id)];
		this.selectedMultipleFieldFiter['case_type_ids'] = this.caseTypes['lists'];
		this.selectedMultipleFieldFiter['facility_location_id'] = this.facilityLocation['lists'];
		this.specialtyDropDown['lists'] = [{id: this.editRecord.specialty_id,name:this.editRecord.specialty_name,qualifier:this.editRecord.specialty_qualifier}];
		this.selectedMultipleFieldFiter['specialty_id'] = this.specialtyDropDown['lists'];
		this.visitTypeDropDown['lists'] = [{id: this.editRecord.visit_type_id,name:this.editRecord.visit_type_name,qualifier:this.editRecord.visit_type_qualifier}];
		this.selectedMultipleFieldFiter['visit_type_ids'] = this.visitTypeDropDown['lists'];
	}
	
}
	close() {
		
		this.templateForm.reset();
		this.activeModal.close();
	}
	
	/**
	 * set search form
	 */
	initializeVisitType() {
		return this.fb.group({
			predefined_speciality:[''],
			facility_location_id:[{value:null},Validators.required],
			specialty_id:[{value:null,disabled: this.isDisabledFormControls},Validators.required],
			visit_type_ids:[{value:null,disabled: this.isDisabledFormControls},Validators.required],
			case_type_ids:['',Validators.required],
			template_ids:[{value:null,disabled: this.isDisabledFormControls},Validators.required],
			is_default:[0],
			is_manual:[0],
			is_static:[0],
			
		});
	}

	setFormControlValidator()
	{
		this.specialityControl.setValidators([Validators.required])
		this.visitTypeControl.setValidators([Validators.required])
		this.caseTypeControl.setValidators([Validators.required])
		this.templateControl.setValidators([Validators.required])
		this.templateForm.updateValueAndValidity({emitEvent:false});
	}

	removeFormControlValidator()
	{
		this.specialityControl.clearValidators()
		this.visitTypeControl.clearValidators()
		this.caseTypeControl.clearValidators()
		this.templateControl.clearValidators();
		this.templateControl.updateValueAndValidity({emitEvent:false});
	}

	getPredefinedSpecialities(ids?:any[]) {
		let params={
			order:OrderEnum.ASC,
			ids:ids && ids.length?ids:null
		}
		params=removeEmptyAndNullsFormObject(params);
		this.subscription.push(
			this.requestService
				.sendRequest(
					SpecialityUrlsEnum.pre_defined_specialities,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					params
				)
				.subscribe(
					(res: HttpSuccessResponse) => {
						this.predefinedSpecialties = res.result.data;
						

					},
					(err) => {
					},
				),
		);

	}

	onchangeFacilityLocation(event)
	{
		this.refreshTemplateList();
		this.specialityControl.disable();
		this.resetspecialty();
		this.resetVisitTypes();
		this.resetTemplate();
		if(event )
		{
			this.specialityControl.enable();
			this.specialityControl.updateValueAndValidity({emitEvent:false});
		}	
	}
	selectAllForDropdownItems(items: any[]) {
		let allSelect = items => {
		  items.forEach(element => {
			element.selected = false;
			element['is_select'] = 'all';
		  });
		};

	return	allSelect(items);
	  }
	getFacitiesOfUser() {
		 
		this.loadSpin = true;
		this.requestService.sendRequest(FacilityUrlsEnum.Facility_list_dropdown_GET, 'GET', REQUEST_SERVERS.fd_api_url, { user_id: this.userId })
			.subscribe(data => {
				 
				this.loadSpin = false;
				let locations = data['result']['data'];
				this.lstFacilities = locations;
				
				if(this.editRecord) {
					this.getSpecialtiesOfUserAgainstPractice();
				}
				this.selectAllForDropdownItems(this.lstFacilities)
			}, error => {
				this.loadSpin = false;
			});

	}
	onOpenSpecialty()
	{	
		 
		if(this.lstSpecialties.length==0)
		{
			this.getSpecialtiesOfUserAgainstPractice();
		}
	}

	getSpecialtiesOfUserAgainstPractice() {
		 
		this.loadSpin = true;
		this.requestService.sendRequest(TemplateUrlsEnum.facility_specialties, 
			'GET', 
			REQUEST_SERVERS.fd_api_url, 
			{ 
				user_id: this.userId ,
				facility_location_id:this.templateForm.get('facility_location_id').value
			})
			.subscribe(data => {
				 
				this.loadSpin = false;
				let specialties =data['result']&& data['result']['data']?data['result']['data']:[];
				this.lstSpecialties = specialties;
				
			//	this.setRowValuesOnForm();
				this.selectAllForDropdownItems(this.lstSpecialties);
				// if(this.editRecord) {
				// 	// this.templateForm.controls['specialty_id'].setValue(this.editRecord && this.editRecord.specialty_id ? this.editRecord.specialty_id : null);
				// 	this.getvisitsOfUserAgainstSpecialty();
				// }
			}, error => {
				this.loadSpin = false;
			});

	}
	onChangeSpecialty(event)
	{
		if (this.editRecord) {
			const shouldDisable = event ? event.is_editable : false;
			this.templateForm.get('is_static')[shouldDisable ? 'disable' : 'enable']();
		} else {
			const shouldDisable = event?.length === 1 ? event[0]?.is_editable : false;
			this.templateForm.get('is_static')[shouldDisable ? 'disable' : 'enable']();
		}

		this.resetVisitTypes();
		this.visitTypeControl.disable();
		this.resetTemplate();
		this.refreshTemplateList();
		if(event )
		{
			this.visitTypeControl.enable();
			this.visitTypeControl.updateValueAndValidity({emitEvent:false});
			this.getTemplatesOfUser();
		}		
				
	}

	getvisitsOfUserAgainstSpecialty() {
		 
		this.loadSpin = true;
		this.requestService.sendRequest(TemplateUrlsEnum.specialty_visit_types, 
			'GET', 
			REQUEST_SERVERS.fd_api_url, 
			{ 
				
				specialty_id:this.templateForm.get('specialty_id').value
			})
			.subscribe(data => {
				 
				this.loadSpin = false;

				let visits =data['result']&& data['result']['data']?data['result']['data']:[];
				this.lstVisitTypes = visits && visits.map(dta => dta.visit_types[dta.visit_types.length -1]);
				

				if(this.templateForm.get('specialty_id').value?.length > 1){
					this.lstVisitTypes = this.lstVisitTypes.filter((value, index, self) =>
						index === self.findIndex(item => item.id === value.id)
					);
					
				}
				
				this.selectAllForDropdownItems(this.lstVisitTypes);
					if(this.editRecord) {
						// this.templateForm.controls['specialty_id'].setValue(this.editRecord && this.editRecord.specialty_id ? this.editRecord.specialty_id : null);
						// this.templateForm.controls['visit_type_ids'].setValue(this.editRecord && this.editRecord.visit_type_id ? this.editRecord.visit_type_id : null);
						// this.templateForm.controls['case_type_ids'].setValue(this.editRecord && this.editRecord.case_type_id ? this.editRecord.case_type_id : null);
						// let specialities_ids = this.editRecord.case_type_id;
						// this.caseTypes['lists'] = [{id: this.editRecord.case_type_id,name:this.editRecord.case_type_name}];
						// this.selectedMultipleFieldFiter['case_type_ids'] = this.caseTypes['lists'];
						// this.templateForm && specialities_ids
						// 	? this.caseTypes.searchForm.patchValue({ common_ids: specialities_ids })
						// 	: null;
						// this.templateForm.controls['case_type_ids'].setValue(specialities_ids);
						if(this.editRecord && (this.editRecord.is_manual || this.editRecord.is_static)) {
							this.templateForm.controls['template_ids'].clearValidators();
							this.templateForm.get('template_ids').updateValueAndValidity();
						}
						this.getTemplatesOfUser();
					}
			}, error => {
				this.loadSpin = false;
			});

	}

	onChangeVisitType(event)
	{
		 
		this.refreshTemplateList();
	
			this.resetTemplate();
		if((event && !this.is_multiple) ||( event&& event.length>0 &&this.is_multiple))
		{

			if(this.caseTypeControl.value)
			{
				this.templateControl.enable();
				this.templateControl.updateValueAndValidity({emitEvent:false});
				this.getTemplatesOfUser();
				this.templatesApi.conditionalExtraApiParams = this.conditionalExtraApiParams
				this.templatesApi.selectedItemAPICallBydefault();
			}
			
		}	
				
	}

	onChangeCaseTypes(event)
	{
		 
		this.refreshTemplateList();
		this.resetTemplate();
		if((event && !this.is_multiple) ||( event&& event.length>0 &&this.is_multiple))
		{
			if(this.facilityLocationControl.value&&this.caseTypeControl.value && this.specialityControl.value && this.visitTypeDropDown?.searchForm.get('common_ids')?.value )
			{
				this.templateControl.enable();
				this.templateControl.updateValueAndValidity({emitEvent:false});
				this.conditionalExtraApiParams={
					user_id:this.userId ? this.userId : null,
					location_id: this.templateForm && this.templateForm.controls['facility_location_id'] && this.templateForm.get('facility_location_id').value ? this.templateForm.get('facility_location_id').value : null,
					speciality_id: this.templateForm && this.templateForm.controls['specialty_id'] && this.templateForm.get('specialty_id').value ? this.templateForm.get('specialty_id').value : null,
					visit_id: this.templateForm && this.templateForm.controls['visit_type_ids'] && this.templateForm.get('visit_type_ids').value ? this.templateForm.get('visit_type_ids').value : null,
					case_type_id:this.templateForm && this.templateForm.controls['case_type_ids'] && this.templateForm.get('case_type_ids').value ? this.templateForm.get('case_type_ids').value : null,
					page:1,
					per_page:10
				}
				this.getTemplatesOfUser();
			}
			
		}
		else
		{
			this.getTemplatesOfUser();
			this.resetTemplate();
			this.templateControl.disable();
		}
	}
	@ViewChild('templates') templates;
	getTemplatesOfUser() {
		 
		// this.loadSpin = true;
		let req={
			user_id:this.userId,
			location_id:this.templateForm.get('facility_location_id').value,
			speciality_id:this.templateForm.get('specialty_id').value,
			visit_id:this.templateForm.get('visit_type_ids').value,
			case_type_id:this.templateForm.get('case_type_ids').value,
			page:1,
			per_page:10
		}
		this.conditionalExtraApiParams = req;
		// this.requestService.sendRequest(TemplateUrlsEnum.get_templates, 
		// 	'GET', 
		// 	REQUEST_SERVERS.templateManagerUrl, 
		// 	req
		// 	)
		// 	.subscribe(data => {
		// 		 
		// 		this.loadSpin = false;
		// 		let templates =data['data']?data['data']:[];
		// 		this.lstTemplates = templates  && templates.length>0?templates:[] ;
		// 		this.lstTemplates = this.lstTemplates.map(res => {
		// 			return {
		// 				id:res.template_id,
		// 				name:res.name
		// 			}
		// 		})
		// 		this.templates['lists'] = this.lstTemplates ? this.lstTemplates : [];
		// 		this.templateForm && this.templateForm.get('template_ids').value ? this.templates.searchForm.patchValue({ common_ids: this.templateForm.get('template_ids').value }) : null;
		// 	}, error => {
		// 		this.loadSpin = false;
		// 	});

	}

	onOpenVisitTypes(isOpen:any)
	{
		if(this.lstVisitTypes.length==0 && isOpen && this.templateForm.get('specialty_id')?.value)
		{
			this.getvisitsOfUserAgainstSpecialty();
		}
	}

	changePredefinedSpecialities(event) { 
		 
		console.log(event.target.value);
	



	}

	resetspecialty()
	{
		this.lstSpecialties=[];
		this.specialityControl.reset();
		this.visitTypeControl.reset();
		this.visitTypeControl.disable();
		// this.specialityControl.disable();
	}

	resetVisitTypes()
	{
		this.lstVisitTypes=[];
		this.visitTypeControl.reset();
		this.templateControl.disable();
		this.templateControl.reset();
		// this.visitTypeControl.disable();
	}

	resetCaseType()
	{
		// this.lstSpecialties=[];
		this.caseTypeControl.reset();
		// this.caseTypeControl.reset();
		this.templateControl.reset();
	
		this.templateControl.disable();
	}

	resetTemplate()
	{
		this.lstTemplates=[];
		this.templateControl.reset();
		// this.templateControl.disable();
	}

	refreshTemplateList()
	{
		this.eventsSubjectTemplate.next(true);
	}
	get facilityLocationControl () {
		return this.templateForm.get('facility_location_id')
	  }

	get specialityControl () {
		return this.templateForm.get('specialty_id')
	  }

	  get visitTypeControl () {
		return this.templateForm.get('visit_type_ids')
	  }

	  get caseTypeControl () {
		return this.templateForm.get('case_type_ids')
	  }

	  get templateControl () {
		return this.templateForm.get('template_ids')
	  }

	

	/**set table action checkbox */
	
	
	/**
	 * submiting form to add/update
	 * @param form 
	 */
	onSubmit(form) {
			if(this.editRecord) {
				form['visit_type_id'] = this.visitTypeDropDown?.searchForm.get('common_ids')?.value
				form['id'] = this.editRecord.id;
				delete form['visit_type_ids'];
				form['visit_type_ids'] = form['case_type_ids'] ? form['case_type_ids'] : form['case_type_id'];
				delete form['case_type_ids'];
				form['template_id'] = form['template_ids'] ? form['template_ids'] : form['template_id'];
				delete form['template_ids'];
				this.updateForm(form);
			} else {
				form['visit_type_ids'] = this.visitTypeDropDown?.searchForm.get('common_ids')?.value
				this.addForm(form);
			}
			
		
		
	}
	/**
	 * add form
	 * @param form 
	 */
	addForm(form) {
		this.loadSpin = true;
		this.disableBtn = true;
		if (this.templateForm.valid) {
			let req={
			
				...form,
				// supervisor_ids:form.supervisor_ids,
				user_id:this.userId
			}
			 req= removeEmptyAndNullsFormObject(req);
			if (form?.is_default && form?.is_manual && form?.is_static){
				this.toaster.error('Two templates cannot have the same set of default criteria.', 'Error');
				this.loadSpin = false;
				this.disableBtn = false;
				return;
			}
			if (form?.visit_type_ids.includes(10) && form?.is_static===true){
				this.toaster.error('You can not assign static template to Depo visit type.', 'Error');
				this.loadSpin = false;
				this.disableBtn = false;
				return;
			}
			this.subscription.push(
				this.requestService
					.sendRequest(
						TemplateUrlsEnum.attach_template_to_user,
						'POST',
						REQUEST_SERVERS.fd_api_url,
						req,
					)
					.subscribe(
						(data: any) => {
							if (data.status) {
								this.disableBtn = false;
								
								this.toaster.success('Successfully added', 'Success');
								this.loadSpin = false;
							
								this.activeModal.close({data:data.result && data.result.data?data.result.data:null});
								this.referringPhyscianService.isAddOrUpdateUserTemplate$.next(true);
							}
						},
						(err) => {
							this.loadSpin = false;
							this.disableBtn = false;
							// const str = parseHttpErrorResponseObject(err.error.message);
							// this.toaster.error(str);
						},
					),
			);

		}
	}
	/**
	 * update form
	 * @param form 
	 */
	 updateForm(form) {
		this.loadSpin = true;
		this.disableBtn = true;
		if (this.templateForm.valid) {
			let req={
			
				...form,
				// supervisor_ids:form.supervisor_ids,
				user_id:this.userId
			}
			 
			 req= removeEmptyAndNullsFormObject(req);
			if (form?.is_default && form?.is_manual && form?.is_static){
				this.toaster.error('Two templates cannot have the same set of default criteria.', 'Error');
				this.loadSpin = false;
				this.disableBtn = false;
				return;
			}
			this.subscription.push(
				this.requestService
					.sendRequest(
						TemplateUrlsEnum.edit_template_user,
						'POST',
						REQUEST_SERVERS.fd_api_url,
						req,
					)
					.subscribe(
						(data: any) => {
							if (data.status) {
								this.disableBtn = false;
								
								this.toaster.success('Successfully added', 'Success');
								this.loadSpin = false;
							
								this.activeModal.close({data:data.result && data.result.data?data.result.data:null});
								this.referringPhyscianService.isAddOrUpdateUserTemplate$.next(true);
							}
						},
						(err) => {
							this.loadSpin = false;
							this.disableBtn = false;
							// const str = parseHttpErrorResponseObject(err.error.message);
							// this.toaster.error(str);
						},
					),
			);

		}
	}
	
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}
	isSetDefaultConfirmation(event) {
		console.log(event.target.checked);
		if(event.target.checked) {
			if(!this.templateForm.get('is_manual').value && !this.templateForm.get('is_static').value && !this.templateForm.get('template_ids').value){
				this.toaster.error('Please choose template.', 'Error');
				this.templateForm.get('is_default').setValue(0);
				return;
			}
		this.customDiallogService
		.confirm('Default Template', 'Do you really want to set this template as Default ?')
		.then((confirmed) => {
			if (confirmed) {
				this.templateForm.get('is_default').setValue(1);
				console.log(this.templateForm.get('is_default').value);
			} else {
				this.templateForm.get('is_default').setValue(0);
				console.log(this.templateForm.get('is_default').value);
			}
		})
		.catch((error)=>{
			this.templateForm.get('is_default').setValue(0);
		});
	
	}
	}
	selectionOnValueChange(e: any,_form:FormGroup,controlName) {
		this.templateForm.get(controlName).setValue(e &&e.formValue?e.formValue:null);
		switch (controlName) {
			case FormControlNameEnum.FacilityLocationId: {
				this.refreshTemplateList();
				this.specialityControl.disable();
				this.resetspecialty();
				this.specialtyDropDown?.searchForm?.get('common_ids')?.reset();
				this.caseTypes?.searchForm.get('common_ids')?.reset();
				this.resetVisitTypes();
				this.resetTemplate();
				if(e?.formValue )
				{
					this.disableFieldSpecialty = false;
					this.specialityControl.enable();
					this.specialityControl.updateValueAndValidity({emitEvent:false});
				}
				break;
			}
			case FormControlNameEnum.SpecialityId: {
				if (this.editRecord) {
					const shouldDisable = e ? e.data?.realObj?.is_editable : false;
					this.templateForm.get('is_static')[shouldDisable ? 'disable' : 'enable']();
				} else {
					const shouldDisable = e?.data?.length === 1 ? e.data[0]?.realObj?.is_editable : false;
					this.templateForm.get('is_static')[shouldDisable ? 'disable' : 'enable']();
				}
		
				this.resetCaseType();
				this.resetVisitTypes();
				this.visitTypeDropDown?.searchForm?.get('common_ids')?.reset();
				this.resetTemplate();
				this.refreshTemplateList();
				if(e?.formValue )
				{
					
					this.disableFieldVisitType = false;
					this.getTemplatesOfUser();
				}
				break;
			}
			case FormControlNameEnum.VisitTypeId: {
				this.refreshTemplateList();
				this.resetTemplate();
			if((e && !this.is_multiple) ||( e&& e.length>0 &&this.is_multiple))
			{
	
				if(this.caseTypeControl.value)
				{
					this.templateControl.enable();
					this.templateControl.updateValueAndValidity({emitEvent:false});
					this.getTemplatesOfUser();
				}
				
			}
				break;
			}
			case FormControlNameEnum.CaseTypeId: {
				this.setFormControlValidator();
				this.onChangeCaseTypes(e.formValue);
			    this.refreshTemplateList();
				break;
			}
				
		}
	}
	selectionOnValueChangeOther(e: any,Type?) {
		const info = new ShareAbleFilter(e);
		this.templateForm.patchValue(removeEmptyAndNullsFormObject(info));
		if(e.data && e.data.length == 0) {
			this.templateForm.controls[Type].setValue(null);
		}
	}
	setManualForm(event) {
		 
		if(event.target.checked) {
			this.templateForm.controls['template_ids'].clearValidators();
			this.templateForm.get('template_ids').updateValueAndValidity();

		} else {
			this.templateForm.controls['template_ids'].setValidators(Validators.required);
			this.templateForm.get('template_ids').updateValueAndValidity();
		}
		 
	}
	templateTouched(event) {
		 
		if(event && event.is_touched && !this.templateForm.controls['template_ids'].value) {
			this.templateForm.controls['template_ids'].markAsTouched();
			this.templateForm.controls['template_ids'].markAsPristine();
		}

		if(this.templatesApi.searchForm.get('common_ids').value === null){
			this.templateForm.get('template_ids').setValue(null);
		}
	}
	isDisabled() {
		this.disableBtn = false;
		if (this.templateForm.get('is_manual').value || this.templateForm.get('is_static').value){
			this.templateForm.controls['template_ids'].clearValidators();
			this.templateForm.get('template_ids').updateValueAndValidity();
			this.disableBtn = false;
		}else if(this.editRecord && (!this.templateForm.get('is_manual').value && 
				!this.templateForm.get('is_static').value &&
				!this.templateForm.get('template_ids').value))
				{
			this.disableBtn = true;
		}

		if(this.templateForm.invalid || this.disableBtn) {
			return true;
		}
		return false;
	}

}
