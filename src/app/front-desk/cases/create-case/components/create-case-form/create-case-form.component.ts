import { CheckboxClass } from './../../../../../shared/dynamic-form/models/Checkbox.class';
import { Validator } from './../../../../../shared/dynamic-form/models/validator.model';
import { commentsMaxLength } from './../../../../../medical-doctor/current-complaints/complaints.configs';
import { Component, OnInit, OnDestroy, Output, EventEmitter, AfterViewInit, Input, ViewChild, OnChanges } from '@angular/core';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { SelectClass } from '@appDir/shared/dynamic-form/models/SelectClass.class';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { ButtonClass } from '@appDir/shared/dynamic-form/models/ButtonClass.class';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonTypes } from '@appDir/shared/dynamic-form/constants/ButtonTypes.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { CaseFlowUrlsEnum } from '@appDir/front-desk/fd_shared/models/CaseFlowUrlsEnum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { DynamicControl } from '@appDir/shared/dynamic-form/models/DynamicControl.class';
import { ToastrService } from 'ngx-toastr';
import { PatientListingUrlsEnum } from '@appDir/front-desk/patient/patient-listing/PatientListing-Urls-Enum';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { Location } from '@angular/common';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { getFieldControlByName } from '@appDir/shared/dynamic-form/helper';
import { Options } from '@appDir/shared/dynamic-form/models/options.model';
import { AutoCompleteClass } from '@appDir/shared/dynamic-form/models/AutoCompleteClass.class';
import { FormGroup, Validators } from '@angular/forms';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { CaseModel } from '@appDir/front-desk/fd_shared/models/Case.model';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { zip } from 'rxjs'
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { isThisTypeNode } from 'typescript';
import { CategoryOptionSlugEnum, PurposeOfVisitOptionSlugEnum } from '@appDir/shared/components/general.enum';
import { CaseTypeEnum } from '@appDir/front-desk/fd_shared/models/CaseTypeEnums';
import { WithoutTime } from '@appDir/shared/utils/utils.helpers';
import {checkSelectedLocationsForInactive } from '@appDir/shared/utils/utils.helpers';

@Component({
	selector: 'app-create-case-form',
	templateUrl: './create-case-form.component.html',
	styleUrls: ['./create-case-form.component.scss']
})
export class CreateCaseFormComponent extends PermissionComponent implements OnInit, OnDestroy, OnChanges {

	ngOnDestroy() {
		unSubAllPrevious(this.subscription)
	}
	@Output() submit = new EventEmitter()
	@Input() case: CaseModel;
	@Input() disableBtn: boolean
	@ViewChild(DynamicFormComponent) component: DynamicFormComponent

	constructor(public aclService: AclService, router: Router,  route: ActivatedRoute,  requestService: RequestService, 
		private toasterService: ToastrService, private location: Location, public caseFlowService: CaseFlowServiceService,
		public storageData: StorageData) {
			super(aclService);
		this.initializeform()
	}
	fieldConfigs: FieldConfig[] = []
	caseLists: Options[] = []
	subscription: any[] = []
	practice_loc: any[] = []
	home_loc: any[] = []
	practicelocationForm: FormGroup
	homelocationForm: FormGroup
	masters:any={}
	lat_log = {
		"latitude": null,
		"longitude": null
	}
	selectedLocations: any = [];
	citimedLocationSelected  = false;
	addCategorySlug: string;

	ngOnChanges() {
		this.getfacilitylocationsWithoutLatLong()
		this.getPosition();
			// let ids = this.case['casePracticeLocations'].map(item => item.practice_location_id)
			// // ids = [16, 17, 18]


			// this.caseFlowService.getfacilitylocationsNames(this.lat_log).subscribe(res => {
			// 	if (res) {
			// 		this.practice_loc = res['result']['data']
			// 		this.practice_loc.map(practice => practice.facility_name = practice.facility_full_name.split(' ')[0])
			// 		this.selectedLocations = this.practice_loc ? this.practice_loc.map(item => {
			// 			return { label: item.facility_full_name, name: item.facility_full_name, value: item.id } as Options
			// 		}) : []
			// 		getFieldControlByName(this.fieldConfigs, 'practice_locations').items = this.selectedLocations
			// 		this.practicelocationForm.patchValue(ids)
			// 	}
			// })
		// }
		// else
	}
	getPosition(): Promise<any> {
		return new Promise((resolve, reject) => {
			navigator.geolocation.getCurrentPosition(resp => {
				this.lat_log = { longitude: resp.coords.longitude, latitude: resp.coords.latitude }
				// this.lat_log = {
				//   longitude: 74.3047168,
				//   latitude: 31.473664
				// }
				this.getfacilitylocations(this.lat_log)
				resolve({ lng: resp.coords.longitude, lat: resp.coords.latitude });
				
			},
				err => {
					reject(err);
				});
		});
	}
	facilityloc: any = []
	facilitylocwithoutlatlong: any = []
	
	getfacilitylocations(lat_log) {
		this.caseFlowService.allFacilityLocationsAgainstPatientLocation(lat_log).subscribe(res => {
			let data :any[]=[]= res['result']['data']['locations'];
			debugger;
			if (this.case && this.case.casePracticeLocations){
		    this.case.casePracticeLocations.forEach((value)=>
			{
				data.push({
				id:value.practice_location_id,
				facility_full_name:value.facility_full_name,
				slug : value.slug
				});	
			});
			}
			this.facilityloc = data;
			this.facilityloc.map(practice =>{ practice.facility_name = practice && practice.facility_full_name?practice.facility_full_name.split(' ')[0]:console.log()}
			)

			// this.practice_loc.length > 0 ? data.push(this.practice_loc) : ''
			// data = this.practice_loc
			// let seleetdids = this.selectedLocations.map(m => m.value)
			// data = data ? data.filter(function (item) {
			//   return seleetdids.indexOf(item.id) !== -1;
			// }) : []

			// this.selectedLocations = [...this.case.casePracticeLocations]; 
			getFieldControlByName(this.fieldConfigs, 'practice_locations').items = data.length > 0 ? data.map(item => {
				const qulifierName = `${item.facility && item.facility.qualifier ? item.facility.qualifier : ''} - ${item.qualifier ? item.qualifier: ''}`;
				return { label: item.facility_full_name, name: item.facility_full_name, value: item.id, qualifier: qulifierName} as Options
			}) : this.selectedLocations;

			if (this.case && this.case['casePracticeLocations'] && this.fieldConfigs) {
				let values = 	this.case.casePracticeLocations.map(item => {
						return 	item.practice_location_id;	
					});
				getFieldControlByName(this.fieldConfigs, 'practice_locations').form.controls['practice_locations'].setValue([...values]);
				}

		
		})
	}
	getfacilitylocationsWithoutLatLong() {
		this.caseFlowService.allFacilityLocations().subscribe(res => {
			let data :any[]=[]= res['result']['data'];
			this.facilitylocwithoutlatlong = data;
			this.facilitylocwithoutlatlong.map(home =>{ home.facility_name = home && home.facility_full_name?home.facility_full_name.split(' ')[0]:console.log()}
			)
			getFieldControlByName(this.fieldConfigs, 'home_locations').items = data.length > 0 ? data.map(item => {
				const qulifierName = `${item.facility && item.facility.qualifier ? item.facility.qualifier : ''} - ${item.facility_location_qualifer ? item.facility_location_qualifer: ''}`;
				return { label: item.facility_full_name, name: item.facility_full_name, value: item.id, qualifier: qulifierName} as Options
			}) : this.selectedLocations;

			if (this.case && this.case['caseHomeLocations'] && this.fieldConfigs) {
				let values = 	this.case.caseHomeLocations.map(item => {
						return 	item.home_location_id;	
					});
				getFieldControlByName(this.fieldConfigs, 'home_locations').form.controls['home_locations'].setValue([...values]);
				}

		
		})
	}
	onClearPracticeLocation($event){
	}
	onClearHomeLocation($event){
	}
	initializeform() {
		this.case;
		this.fieldConfigs = [
			new DivClass([
				new DynamicControl('request_from_front_desk', true),
				new AutoCompleteClass('Practice*', 'practice_locations', 'qualifier', 'value', null, true, '', [
					{ name: 'required', message: 'This field is required', validator: Validators.required }
				], '',
					['col-sm-4'],null,null,null,null,this.onClearPracticeLocation.bind(this),true, 'name'
				),

				new AutoCompleteClass('Home', 'home_locations', 'qualifier', 'value', null, true, '', [
					
				], '',
					['col-sm-4'],null,null,null,null,this.onClearHomeLocation.bind(this),true, 'name'
				),

				new SelectClass('Category*', 'category_id',
					[

					],
					'',
					[
						{ name: 'required', message: 'This field is required', validator: Validators.required }
					],
					['col-sm-4']
				),
				new SelectClass('Purpose of Visit*', 'purpose_of_visit_id',
					[],
					'',
					[{ name: 'required', message: 'This field is required', validator: Validators.required }],
					['col-sm-6']
				),
				new SelectClass('Case Type*', 'case_type_id',
					[],
					'',
					[
						{ name: 'required', message: 'This field is required', validator: Validators.required }
					],
					['col-sm-6'],
				),
				new InputClass('DOA* (mm/dd/yyyy)', 'accident_date', InputTypes.date, '', [
					{ name: 'required', message: 'This field is required', validator: Validators.required }
				], '', ['col-sm-6'], { max: new Date() }),
				new InputClass('Date of Admission* (mm/dd/yyyy)', 'date_of_admission', InputTypes.date, '', [
					{ name: 'required', message: 'This field is required', validator: Validators.required }
				], '', ['col-sm-6'], { max: new Date() })
				,
				new CheckboxClass('Transferred Case', 'is_transferring_case', InputTypes.checkbox, false, [], '', ['col-sm-5 col-md-4 col-lg-3 col-xl-2 mb-2']),

			// 	new CheckboxClass(' ', 'case_referral_id',
			// 	[],
			// 	'',
			// 	[],
			// 	['col-sm-6'],
			// 	false
			// ),
			], ['row']),
			
		
			
			new DivClass([
				new ButtonClass('Back', ['btn', 'btn-primary', 'btn-block float-right mt-2 mt-sm-0'], ButtonTypes.button, this.cancel.bind(this), { icon: 'icon-left-arrow me-2', button_classes: [''], }),
				new ButtonClass('Save & Continue', ['btn', 'btn-success', 'btn-block mt-2 mt-sm-0'], ButtonTypes.submit, null, { icon: 'icon-save-continue me-2', button_classes: [''], name: 'save-btn' }),
			], ['row', 'justify-content-center form-btn'], '', '', { name: 'button-div' })

		]
	}

	ngOnInit() {
		const tempData = JSON.parse(localStorage.getItem('cm_data'));
		const roleSlug = tempData?.role?.slug;
		const allow_transfered_case = tempData?.permissions.includes('patient-case-list-transferred-case');
		this.form;
		this.caseFlowService.getCaseMasters().subscribe(res => {
			let data = res['result']['data'];
			this.masters=data?{...data}:{}
			console.log(data);
			let nf2_generated_by_options=data['nf2_generated_by_options']?data['nf2_generated_by_options']:[]
			if(nf2_generated_by_options.length)
			{
				this.storageData.set_nf2_generated_by_options_LocalStorageData(nf2_generated_by_options);
			}
			getFieldControlByName(this.fieldConfigs, 'category_id').options = data.categories.map(category => {
				return { label: category.name, name: category.name, value: category.id } as Options
			})
			if(this.form && this.form.controls['category_id'].value)
			{
				let category= this.masters&& this.masters.categories &&this.masters.categories.find(category=>category.id==this.form.controls['category_id'].value);
				if(category)
				{
					this.addCategorySlug = category.slug ? category.slug : '';
					this.setPurposeOfVisit(category,false);
					this.filterCasetypeOnPurposeOfVisit(this.form.controls['purpose_of_visit_id'].value)
				}
			}
			else
			{
			getFieldControlByName(this.fieldConfigs, 'purpose_of_visit_id').options = data.purpose_of_visit.map(purpose => {
				return { label: purpose.name, value: purpose.id, name: purpose.name } as Options
			})
			this.caseLists = data.type.map(type => {
				return { label: type.name, name: type.name, value: type.id } as Options
			})
			getFieldControlByName(this.fieldConfigs, 'case_type_id').options = this.caseLists
			}
			this.setDateOfAccidentAndEnableField();
			if (this.form && this.form.controls['is_transferring_case']) {
				this.form.controls['is_transferring_case'].enable({emitEvent:false});
			}
			if(roleSlug != 'super_admin' && !allow_transfered_case) {
				let control = getFieldControlByName(this.fieldConfigs, 'is_transferring_case');
				control.classes.push('hidden');
			}
		})
	}

	setPurposeOfVisit(category,resetformfield)
	{
		switch(category.slug)
		{
			
			case CategoryOptionSlugEnum.Diagnostic:
				let purposeOfVisits:any[]=this.masters.purpose_of_visit.filter(purpose => {
					return purpose.slug!==PurposeOfVisitOptionSlugEnum.drug_testing;
					
				});
				getFieldControlByName(this.fieldConfigs, 'purpose_of_visit_id').options=purposeOfVisits.map(purpose => {
					return { label: purpose.name, value: purpose.id, name: purpose.name } as Options
				})
				if(resetformfield)
				{
					this.form.patchValue({ purpose_of_visit_id: '' }, { emitEvent: false });
					this.form.patchValue({ case_type_id: '' }, { emitEvent: false });
				}
				else
				{
					
					// let caselist=this.masters&& this.masters.type&&this.masters.type.filter(_case => {
					// 	if (_case.slug != CaseTypeEnum.corporate) { return { _case }  }
					// })
					// this.caseLists=this.masters&& this.masters.type&&this.masters.type.map(type => {
					// 	if (type.slug != CaseTypeEnum.corporate)
					// 	{
					// 		return { label: type.name, name: type.name, value: type.id } as Options
					// 	}
						
					// })
					this.caseLists=[];
					this.masters&& this.masters.type&&this.masters.type.forEach(caseType => {
						if (caseType.slug != CaseTypeEnum.corporate)
						{
							this.caseLists.push( { label: caseType.name, name: caseType.name, value: caseType.id } as Options)
						}
					});
					getFieldControlByName(this.fieldConfigs, 'case_type_id').options = this.caseLists
					
				}
				
				break;
			case CategoryOptionSlugEnum.surgical:

				getFieldControlByName(this.fieldConfigs, 'purpose_of_visit_id').options = this.masters.purpose_of_visit.map(purpose => {
					return { label: purpose.name, value: purpose.id, name: purpose.name } as Options
				});
				// if(resetformfield)
				// {
				// 	this.form.patchValue({ purpose_of_visit_id: '' }, { emitEvent: false });
				// 	this.form.patchValue({ case_type_id: '' }, { emitEvent: false });
				// }

				break;
			case CategoryOptionSlugEnum.medical:
				getFieldControlByName(this.fieldConfigs, 'purpose_of_visit_id').options = this.masters.purpose_of_visit.map(purpose => {
					return { label: purpose.name, value: purpose.id, name: purpose.name } as Options
				})
				if(resetformfield)
				{
					this.form.patchValue({ purpose_of_visit_id: '' }, { emitEvent: false });
					// this.form.patchValue({ case_type_id: '' }, { emitEvent: false });
				}
				break;
		}
	}

	cancel() {
		debugger;
		if(this.case)
		{
			this.caseFlowService.goBack();
		}
		else
		{
			this.location.back()

		}
	}
	enableForm() {
		let buttonDiv = getFieldControlByName(this.fieldConfigs, 'button-div')
		console.log(this.form.value);
		if (this.form.disabled) {
			this.form.enable();
			buttonDiv.classes = buttonDiv.classes.filter(className => className != 'hidden');
		} else {
			this.form.disable();
			buttonDiv.classes.push('hidden');
		}
	}

	onSubmit(form) {
		this.isDateOfAdmissionMax(this.form);
		if (!checkSelectedLocationsForInactive(this.form.value['practice_locations'], this.facilityloc)) {
			this.toasterService.error("Selected location(s) is/are inactive, please contact your supervisor","Error");
			return;
		}
		if(this.addCategorySlug === "diagnostic"){
			let arr = this.form.value['practice_locations'].map(id => this.facilityloc.find(fac => fac.id == id))
		arr = arr.filter((item, index) => arr.findIndex(_item => _item.facility_name == item.facility_name) === index)
		this.citimedLocationSelected = arr.every(l => (l && l.facility &&  l.facility.slug) ? l.facility.slug === "citimed" :false) || arr.every(l => (l &&  l.slug) ? l.slug === "citimed" :false) ;		
			if(!this.citimedLocationSelected){
			   this.toasterService.error('Diagnostic is only available at Citimed right now, please select one of Citimed locations to use the diagnostic flow.', 'Error');
			   return;
		   }
		}
		this.addCategorySlug === "";
		this.citimedLocationSelected = false;
		let selected_practice_locations= form.practice_locations?form.practice_locations:[];
		this.storageData.setSelectedFacilityLocationIds(selected_practice_locations);
		form.home_locations=form.home_locations||[];
		this.submit.emit(form)

	}

	
	form: FormGroup

	facilityNameCondition(value: any[]) {
		if (!this.facilityloc || !this.facilityloc.length) { return value }
		let arr = value.map(id => this.facilityloc.find(fac => fac.id == id))
		arr = arr.filter((item, index) => arr.findIndex(_item => _item.facility_name == item.facility_name) === index)
		this.citimedLocationSelected = arr.every(l => (l && l.slug) ? l.slug === "citimed" : false);
		if (value.length !== arr.length) {
			this.toasterService.info('You can only select location of one facility at a time', 'Info')
		}
		this.form.patchValue({ home_locations: value })
		return arr.map(item => item.id)
	}

	facilityNameConditionForHomeLocations(value: any[]) {
		if (!this.facilitylocwithoutlatlong || !this.facilitylocwithoutlatlong.length) { return value }
		let arr = value.map(id => this.facilitylocwithoutlatlong.find(fac => fac.id == id))
		arr = arr.filter((item, index) => arr.findIndex(_item => _item.facility_name == item.facility_name) === index)
		this.citimedLocationSelected = arr.every(l => (l && l.slug) ? l.slug === "citimed" : false);
		if (value.length !== arr.length) {
			this.toasterService.info('You can only select location of one facility at a time', 'Info')
		}
		return arr.map(item => item.id)
	}

	onReady(event?: FormGroup) {
		debugger;
		console.log(event);
		if(!this.case)
		{
			this.caseFlowService.setNf2Status({status:'N/A',date:null});
		}
		this.form = event as FormGroup;
		// this.form.controls['is_transferring_case'].enable();
		this.subscription.push(this.form.controls['category_id'].valueChanges.subscribe(categoryId=>{
			let category= this.masters&& this.masters.categories &&this.masters.categories.find(category=>category.id==categoryId);
			if(category)
			{
				if(category.slug == 'surgical') {
					getFieldControlByName(this.fieldConfigs, 'case_type_id').options = this.caseLists.filter(_case => {
						if (_case.value != 728) { return _case }
					})
					event.patchValue({ case_type_id: '' }, { emitEvent: false })
				}
				this.addCategorySlug = category.slug ? category.slug: '';
				this.setPurposeOfVisit(category,true)
			}
		
			
		})
		);
		debugger;
		if (this.case) {
			this.form = event as FormGroup
			//edit mode 
			event.patchValue(this.case);
			this.isDateOfAdmissionMax(event);
			if(!this.aclService.hasPermission(this.userPermissions.patient_case_list_case_info_edit))
			{this.enableForm();
	
			}
			event.controls['accident_date'].setValue(this.case.accident && this.case.accident.accident_information?this.case.accident.accident_information.accident_date:null);
			this.setDateOfAccidentAndEnableField();
			event.controls['accident_date'].disable({ emitEvent: false });
			this.case.accident && this.case.accident.accident_information && this.case.accident.accident_information.accident_date && event.controls['accident_date'].disabled ? getFieldControlByName(this.fieldConfigs, 'accident_date').classes.push('pointer-none'):null;
			this.practicelocationForm = event.get('practice_locations') as FormGroup
			this.homelocationForm = event.get('home_locations') as FormGroup
			// const fixed_practices = this.case.practice
			//   const fixed_practices = this.practice_loc
			// event.controls['practice'].patchValue(fixed_practices, { emitEvent: false })
			this.subscription.push(event.controls['practice_locations'].valueChanges.subscribe((value: number[]) => {
				const fixed_practices = this.case.casePracticeLocations.map(_=>{return _.practice_location_id});
				let new_value = [...value, ...fixed_practices]
				new_value = new_value.filter((item, index) => new_value.indexOf(item) === index)
				new_value = this.facilityNameCondition(new_value)
				event.controls['practice_locations'].patchValue(new_value, { emitEvent: false })
			}))
			this.subscription.push(event.controls['home_locations'].valueChanges.subscribe((value: number[]) => {
				value = this.facilityNameConditionForHomeLocations(value)
				event.controls['home_locations'].patchValue(value, { emitEvent: false })
			}))
			// event.controls['practice'].disable()
			this.subscription.push(event.controls['purpose_of_visit_id'].valueChanges.subscribe(value => {
				debugger;
				switch (value) {
					case 1:
						getFieldControlByName(this.fieldConfigs, 'case_type_id').options = this.caseLists.filter(_case => {
							if (_case.value != 6) { return _case }
						})
						event.patchValue({ case_type_id: '' }, { emitEvent: false })
						break;
					case 2:
						getFieldControlByName(this.fieldConfigs, 'case_type_id').options = this.caseLists.filter(_case => {
							if (_case.value == 3) { return _case }
						})
						event.patchValue({ case_type_id: 3 }, { emitEvent: false })
						break;
					case 3:
						getFieldControlByName(this.fieldConfigs, 'case_type_id').options = this.caseLists.filter(_case => {
							if (_case.value == 6) { return _case }
						})
						event.patchValue({ case_type_id: 6 }, { emitEvent: false })
						break;
					case 4:
						getFieldControlByName(this.fieldConfigs, 'case_type_id').options = this.caseLists.filter(_case => {
							if (_case.value != 6 && _case.value != 728) { return _case }
						})
						event.patchValue({ case_type_id: '' }, { emitEvent: false })
						break;
						case 5:
							getFieldControlByName(this.fieldConfigs, 'case_type_id').options = this.caseLists.filter(_case => {
								if (_case.value != 6 && _case.value != 728) { return _case }
							})
							event.patchValue({ case_type_id: '' }, { emitEvent: false })
							break;
						default:
								this.caseLists=this.masters&& this.masters.type&&this.masters.type.map(type => {
									return { label: type.name, name: type.name, value: type.id } as Options	})
							getFieldControlByName(this.fieldConfigs, 'case_type_id').options=this.caseLists

				}
			}))
		} else {
			//create mode
			event.disable({ emitEvent: false });
			event.controls['practice_locations'].enable({ emitEvent: false });
			event.controls['home_locations'].enable({ emitEvent: false });

			this.subscription.push(
				event.valueChanges.subscribe(data => {
					setTimeout(()=>{
						if(this.form) {
							if(WithoutTime(new Date(data.accident_date)) > WithoutTime(new Date)) {
								event.controls['accident_date'].setErrors({max_date:true});
							} else {
								event.controls['accident_date'].setErrors(null);
							}
							if(!data.accident_date) {
								event.controls['accident_date'].setErrors({required:true});
							}
						}
					}, 20);
					if (data.practice_locations && data.practice_locations.length > 0) {
						event.controls['category_id'].enable({ emitEvent: false });
						event.controls['accident_date'].enable({ emitEvent: false })
					} else {
						event.controls['category_id'].disable({ emitEvent: false });
						event.controls['purpose_of_visit_id'].disable({ emitEvent: false });
						event.controls['case_type_id'].disable({ emitEvent: false });
						event.controls['case_type_id'].disable({ emitEvent: false });

					}
					if (data.category_id) {
						event.controls['purpose_of_visit_id'].enable({ emitEvent: false });
						// event.controls['case_type_id'].enable();
					} else {
						event.controls['purpose_of_visit_id'].disable({ emitEvent: false });
						event.controls['case_type_id'].disable({ emitEvent: false });
					}
					if (data.purpose_of_visit_id) {
						event.controls['case_type_id'].enable({ emitEvent: false });

					} else {
						event.controls['case_type_id'].disable({ emitEvent: false });
					}
					// if (data.case_type_id) {

					// }
				}))

			this.subscription.push(event.controls['purpose_of_visit_id'].valueChanges.subscribe(value => {
				switch (value) {
					case 1:
						getFieldControlByName(this.fieldConfigs, 'case_type_id').options = this.caseLists.filter(_case => {
							if (_case.value != 6) { return _case }
						})
						event.patchValue({ case_type_id: '' }, { emitEvent: false })
						break;
					case 2:
						getFieldControlByName(this.fieldConfigs, 'case_type_id').options = this.caseLists.filter(_case => {
							if (_case.value == 3) { return _case }
						})
						event.patchValue({ case_type_id: 3 }, { emitEvent: false })
						break;
					case 3:
						getFieldControlByName(this.fieldConfigs, 'case_type_id').options = this.caseLists.filter(_case => {
							if (_case.value == 6) { return _case }
						})
						event.patchValue({ case_type_id: 6 }, { emitEvent: false })
						break;
					case 4:
						getFieldControlByName(this.fieldConfigs, 'case_type_id').options = this.caseLists.filter(_case => {
							if (_case.value != 6) { return _case }
						})
						event.patchValue({ case_type_id: '' }, { emitEvent: false })
						break;
				}
			}))
			this.subscription.push(event.controls['practice_locations'].valueChanges.subscribe((value: number[]) => {
				debugger;
				const fixed_practices = this.practice_loc.map(_ => _.id)
				// let new_value = [...value, ...fixed_practices]
				// new_value = new_value.filter((item, index) => new_value.indexOf(item) === index)
				value = this.facilityNameCondition(value)
				event.controls['practice_locations'].patchValue(value, { emitEvent: false })
			}))
			this.subscription.push(event.controls['home_locations'].valueChanges.subscribe((value: number[]) => {
				const fixed_homes = this.home_loc.map(_ => _.id)
				value = this.facilityNameConditionForHomeLocations(value)
				event.controls['home_locations'].patchValue(value, { emitEvent: false })
			}))
			this.isDateOfAdmissionMax(event);
		}




	}

	filterCasetypeOnPurposeOfVisit(value)
	{
		this.caseLists = this.masters.type.map(type => {
			return { label: type.name, name: type.name, value: type.id } as Options
		})
		switch (value) {
			case 1:
				getFieldControlByName(this.fieldConfigs, 'case_type_id').options = this.caseLists.filter(_case => {
					if (_case.value != 6) { return _case }
				})
				break;
			case 2:
				getFieldControlByName(this.fieldConfigs, 'case_type_id').options = this.caseLists.filter(_case => {
					if (_case.value == 3) { return _case }
				})
				break;
			case 3:
				getFieldControlByName(this.fieldConfigs, 'case_type_id').options = this.caseLists.filter(_case => {
					if (_case.value == 6) { return _case }
				})
				break;
			case 4:
				getFieldControlByName(this.fieldConfigs, 'case_type_id').options = this.caseLists.filter(_case => {
					if (_case.value != 6) { return _case }
				})
				break;

			case 5:
					getFieldControlByName(this.fieldConfigs, 'case_type_id').options = this.caseLists.filter(_case => {
						if (_case.value != 6) { return _case }
					})
					break;
				default:{
					getFieldControlByName(this.fieldConfigs, 'case_type_id').options = this.caseLists.filter(_case => {
					 return _case;
					})
					break;
				}
			
		   
		}
	}
	setDateOfAccidentAndEnableField() {
		this.form.controls['date_of_admission'].enable({ emitEvent: false });
		if(this.case && this.case.date_of_admission) {
			this.form.controls['date_of_admission'].setValue(this.case && this.case.date_of_admission?this.case.date_of_admission:null);
		} else {
			this.form.controls['date_of_admission'].setValue(new Date());
		}
	}
	isDateOfAdmissionMax(event) {
		this.subscription.push(event.controls['date_of_admission'].valueChanges.subscribe((value) => {
			if(WithoutTime(new Date(value)) > WithoutTime(new Date)) {
				this.form.controls['date_of_admission'].setErrors({max_date:true});
			} else {
				this.form.controls['date_of_admission'].setErrors(null);
			}
			if(!value) {
				this.form.controls['date_of_admission'].setErrors({required:true});
			}
		}))
	}
		
		}
	
