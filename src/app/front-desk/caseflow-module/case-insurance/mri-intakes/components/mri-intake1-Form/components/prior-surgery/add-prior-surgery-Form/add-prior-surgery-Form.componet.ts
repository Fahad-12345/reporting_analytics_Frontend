import { removeEmptyAndNullsFormObject, WithoutTime } from '@shared/utils/utils.helpers';

import { Component, Input, OnChanges } from "@angular/core";
import { changeDateFormat, unSubAllPrevious } from "@appDir/shared/utils/utils.helpers";
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { NgSelectClass } from '@appDir/shared/dynamic-form/models/NgSelectClass.class';
import { RadioButtonClass } from '@appDir/shared/dynamic-form/models/RadioButtonClass.class';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { Validators, FormGroup } from '@angular/forms';
import { DynamicControl } from '@appDir/shared/dynamic-form/models/DynamicControl.class';
import { ButtonClass } from '@appDir/shared/dynamic-form/models/ButtonClass.class';
import { ButtonTypes } from '@appDir/shared/dynamic-form/constants/ButtonTypes.enum';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { Observable, Subject, Subscription } from "rxjs";
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import {MriIntakeService} from '@appDir/front-desk/caseflow-module/case-insurance/mri-intakes/services/mri-intake-service'
import { SearchFilterClass } from '@appDir/front-desk/caseflow-module/case-insurance/mri-intakes/models/search-filter.model';
import { getFieldControlByName } from '@appDir/shared/dynamic-form/helper';
import { ToastrService } from 'ngx-toastr';
@Component({
	selector: 'app-add-prior-surgey-form',
	templateUrl: './add-prior-surgery-Form.componet.html',
	styleUrls:['./add-prior-surgery-Form.componet.scss']
})
export class AddPriorSurgeryFormComponent  implements OnChanges {
	subscription:Subscription[]=[]
	fieldConfig: FieldConfig[] = [];
	form:FormGroup;
	Surgery_list:any[]=[];
	@Input() data;
	@Input() title="Add";
	@Input() mri_intake_id=null;
	@Input() mri_id=null
	@Input() caseId;
	startLoader:boolean=false;
	surgeryTypeFilter:SearchFilterClass=new SearchFilterClass();

	// @Input() mri_intake_id;
	searchTypeHead$:Subject<any>=new Subject<any>();
	constructor(private activeModal: NgbActiveModal,private toastrService: ToastrService,
		private requestService: RequestService,private MriIntakeService:MriIntakeService,
		private caseFlowService: CaseFlowServiceService,)
	{
		
	}
	ngOnInit() {
		this.setfieldConfig();
	}

	ngOnChanges()
	{

	}
	ngAfterViewInit() {
		if(this.data)
		{
			this.title='Edit'
			this.setFormValues(this.data);
			this.getByDefaultTypeOfSurgery(this.data.surgery_type_id?this.data.surgery_type_id:null);
			let other_surgery_type_control = getFieldControlByName(this.fieldConfig,'other_surgery_type_name');
			if(this.data?.surgery_type?.slug == 'other') {
				other_surgery_type_control.classes = other_surgery_type_control.classes.filter(className => className != 'hidden');
			}
		}
		this.isDateOfSurgeryMax();

	}

	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
		
	}

	onReady(event) {
		this.form = event;
		this.bindOtherSurgeryType();
	}

	bindOtherSurgeryType() {
		this.subscription.push(this.form && this.form.controls['surgery_type_id'].valueChanges.subscribe(value => {
			let other_surgery_type_control = getFieldControlByName(this.fieldConfig,'other_surgery_type_name');
			let surgeryType = this.Surgery_list.find(ele => ele?.id === value);
			if(surgeryType?.slug == 'other')
			{	
				other_surgery_type_control.classes = other_surgery_type_control.classes.filter(className => className != 'hidden');
			}
			else
			{
				other_surgery_type_control.classes.push('hidden');
				this.form.controls['other_surgery_type_name'].reset('',{emitEvent:false})
			}
		}))
	}

	setFormValues(data)
	{
		debugger;
		this.form.patchValue({
			id:data.id?data.id:null,
			date:data.date,
			surgery_type_id:data && data.surgery_type_id,
			is_body_part:data && data.is_body_part,
			other_surgery_type_name: data && data.other_surgery_type_name
		})
	}

	getByDefaultTypeOfSurgery(id?)
	{
		let data={
			id:id?id:null
		}
		this.MriIntakeService.getTypeOfSurgery(data).subscribe((data) => {
			debugger;
			let result = [...data['result']['data']];

			let b0dy_part_control = getFieldControlByName(
				this.fieldConfig,
				'surgery_type_id',
			);
			b0dy_part_control.items=result
				this.Surgery_list=result;
			// this.studyTypeFilter.searchKey = '';

			// this.studyTypeFilter.lastPage = data.result.last_page;

			// this.studyTypeList = [...this.studyTypeList, ...result];

			// res(this.studyTypeList);

		});
	}
	onSubmit(form) {
		this.startLoader=true;
		debugger;
		let value = { ...form };
		value.date = form.date ? changeDateFormat(form.date) : null;
		value = removeEmptyAndNullsFormObject(value);
		let obj = {
			mri:{
				id:this.mri_id,
				mri_intake_1: {
					id: this.mri_intake_id,
					is_deleted: false,
					is_prior_surgery: true,
					prior_surgery_details: [value],
				},
			},
			request_from_front_desk: true,

			
		};
		obj = removeEmptyAndNullsFormObject(obj);
		
		this.caseFlowService.updateCase(this.caseId,obj).subscribe(res => {
			this.startLoader=false;
			this.toastrService.success('Successfully Updated', 'Success')
			let data=res && res.result &&res.result.data?res.result.data:null
			this.activeModal.close(data.mri?data.mri:null)
		},err=>{
			this.startLoader=false;
			this.toastrService.error(err.error.message, 'Error');
		})
			// let employer_id=form.employer_id;
			// let emp=this.lstEmployer.find(employer=>employer.id===employer_id);
			// if(!emp )
			// {
			// 	form.employer_name=employer_id;
			// 	form.employer_id=null;
				
			// }
		
			
		
		
		
	}

	setfieldConfig()
	{
		this.fieldConfig = [
			new DivClass([
				new DynamicControl('id', null),
				// new DynamicControl('is_deleted', false),
				new InputClass('Date of Surgery * (mm/dd/yyyy)', 'date', InputTypes.date, '', [
					{ name: 'required', message: 'This field is required', validator: Validators.required }
				], '', ['col-12 col-lg-6 parent-horizontal-label'], { max: new Date() }),
				new NgSelectClass("Type of Surgery*", 'surgery_type_id', 'name', 'id',null, false, '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-12 col-lg-6'],[],null,null,null,null,this.onFocusTypeOfSurgery.bind(this),this.searchTypeOfSurgeryScrollToEnd.bind(this),this.searchTypeHead$,this.searchTypeHead.bind(this)),
				new InputClass(
					'Please specify*',
					'other_surgery_type_name',
					InputTypes.text,
					'',
					[{ name: 'required', message: 'This field is required', validator: Validators.required }],
					'',
					['col-12 col-lg-6', 'hidden'],
				),
	
				
				new RadioButtonClass('Was this surgery related to the body part being tested today? *', 'is_body_part', [
					{ label: 'Yes', name: 'yes', value: true },
					{ label: 'No', name: 'no', value: false }
				], '', [
					{ name: 'required', message: 'This field is required', validator: Validators.required }
				], ['col-12'])
			], ['row']),
	
		
	
			new DivClass([
				new ButtonClass('Cancel', ['btn', 'btn-primary', 'btn-block', 'mt-1 mt-sm-0 mb-1 mb-sm-0'], ButtonTypes.button, this.close.bind(this), { icon: 'icon-left-arrow me-2', button_classes: [''] }),
				new ButtonClass('Save & Continue', ['btn', 'btn-success', 'btn-block', 'mt-1 mt-sm-0'], ButtonTypes.submit, null, { icon: 'icon-save-continue me-2', button_classes: [''] })
			], ['row', 'form-btn', 'justify-content-center'])
		]
	}

	

	close() {
		// if (this.empCaseTypeId === CaseEmployerTypeEnum.primary && ( this.caseFlowService.case&& this.caseFlowService.case.case_type&&this.caseFlowService.case.case_type.slug === CaseTypeEnum.worker_compensation)
		// 	 && !this.employer) {
			// this.confirmation_service.create('Discard Changes', 'Discarding Primary Employer will redirect you to previous screen?').subscribe(ans => {
			// 	if (ans.resolved) {
					this.activeModal.close()
					// this.caseFlowService.goBack()
			// 	}
			// })
			// this.activeModal.close()
		// }

		// else if (this.form.dirty && this.form.touched) {
			// this.confirmation_service.create('Discard Changes', 'Do you want to discard changes?').subscribe(ans => {
			// 	if (ans.resolved) {
			// 		this.activeModal.close()
			// 	}
			// })
		// } 
		// else {
			this.activeModal.close()
		// }
	}
	onFocusTypeOfSurgery(name) {
		return new Observable((res) => {
				if (this.Surgery_list.length == 0) {
				this.surgeryTypeFilter.page+=1;
				let body = {
					page: this.surgeryTypeFilter.page,
					name: this.surgeryTypeFilter.searchKey,
					per_page: this.surgeryTypeFilter.per_page,
	
				};
				this.MriIntakeService.getTypeOfSurgery(body).subscribe((data) => {
					debugger;
					let result = [...data['result']['data']];
	
					this.surgeryTypeFilter.searchKey = '';
	
					this.surgeryTypeFilter.lastPage = data.result.last_page;
	
					this.Surgery_list = [...this.Surgery_list, ...result];

					res.next(this.Surgery_list);
	
				});
	
			}
		})
	}

	searchTypeOfSurgeryScrollToEnd()
	{
		return new Observable((res) => {
			
			if (this.surgeryTypeFilter.page < this.surgeryTypeFilter.lastPage) {
				this.surgeryTypeFilter.page += 1
				this.surgeryTypeFilter.page = this.surgeryTypeFilter.page;

			
				let body = {
					page: this.surgeryTypeFilter.page,
					name: this.surgeryTypeFilter.searchKey,
					per_page: this.surgeryTypeFilter.per_page,
				
	
				};
				this.MriIntakeService.getTypeOfSurgery(body).subscribe((data) => {
					let result = [...data['result']['data']];
	
					this.surgeryTypeFilter.searchKey = '';
	
					this.surgeryTypeFilter.lastPage = data.result.last_page;
	
					this.Surgery_list = [...this.Surgery_list, ...result];

					res.next(this.Surgery_list);
	
				
				});
	
			}
	
		})
			
	}

	searchTypeHead(filter)
	{
		
		this.surgeryTypeFilter.searchKey=filter;
		this.surgeryTypeFilter.page=1;
		this.surgeryTypeFilter.lastPage=2
		this.Surgery_list=[]
		return new Observable((res) => {

			let body = {
	
				page: this.surgeryTypeFilter.page,

				name: this.surgeryTypeFilter.searchKey,
				
				per_page: this.surgeryTypeFilter.per_page,

			};
				this.MriIntakeService.getTypeOfSurgery(body).subscribe((data) => {
	
					let result = [...data['result']['data']];
	
					this.surgeryTypeFilter.lastPage = data.result.last_page;
	
					this.Surgery_list = [ ...result];
					res.next(this.Surgery_list);
				});
		})
	}
	isDateOfSurgeryMax() {
		if(this.form) {
		this.subscription.push(this.form.controls['date'].valueChanges.subscribe((value) => {
			if(WithoutTime(new Date(value)) > WithoutTime(new Date)) {
				this.form.controls['date'].setErrors({max_date:true});
			} else {
				this.form.controls['date'].setErrors(null);
			}
			if(!value) {
				this.form.controls['date'].setErrors({required:true});
			}
		}))
	}
	}
	

}
