
import { Component, Input, OnChanges } from "@angular/core";
import { FormGroup, Validators } from "@angular/forms";
import { SearchFilterClass } from "@appDir/front-desk/caseflow-module/case-insurance/mri-intakes/models/search-filter.model";
import { CaseFlowServiceService } from "@appDir/front-desk/fd_shared/services/case-flow-service.service";
import { ButtonTypes } from "@appDir/shared/dynamic-form/constants/ButtonTypes.enum";
import { ButtonClass } from "@appDir/shared/dynamic-form/models/ButtonClass.class";
import { DivClass } from "@appDir/shared/dynamic-form/models/DivClass.class";
import { DynamicControl } from "@appDir/shared/dynamic-form/models/DynamicControl.class";
import { FieldConfig } from "@appDir/shared/dynamic-form/models/fieldConfig.model";
import { NgSelectClass } from "@appDir/shared/dynamic-form/models/NgSelectClass.class";
import { RequestService } from "@appDir/shared/services/request.service";
import { removeEmptyAndNullsFormObject, unSubAllPrevious } from "@appDir/shared/utils/utils.helpers";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Observable, Subject, Subscription } from "rxjs";
import {MriIntakeService} from '@appDir/front-desk/caseflow-module/case-insurance/mri-intakes/services/mri-intake-service'
import { getFieldControlByName } from "@appDir/shared/dynamic-form/helper";
import { ToastrService } from "ngx-toastr";
import { InputClass } from "@appDir/shared/dynamic-form/models/InputClass.class";
import { InputTypes } from "@appDir/shared/dynamic-form/constants/InputTypes.enum";

@Component({
	selector: 'app-add-diagnostic-imaging-form',
	templateUrl: './add-prior-diagnostic-imaging-Form.componet.html',
	styleUrls:['./add-prior-diagnostic-imaging-Form.componet.scss']
})
export class AddPriorDiagnosticImagingFormComponent implements OnChanges {
	subscription:Subscription[]=[]
	fieldConfig: FieldConfig[] = [];
	form:FormGroup;
	@Input() data;
	@Input() title="Add";
	@Input() mri_intake_id;
	@Input() mri_id;
	@Input() caseId;
	startLoader:boolean=false;
	searchTypeHeadTypeOfStudy$:Subject<any>=new Subject<any>();
	searchTypeHeadBodyParts$:Subject<any>=new Subject<any>();
	studyTypeList:any[]=[]
	bodyPartList:any[]=[]
	studyTypeFilter:SearchFilterClass=new SearchFilterClass();
	bodypartsFilter:SearchFilterClass=new SearchFilterClass();
	constructor(private activeModal: NgbActiveModal,	
	private toastrService: ToastrService,
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
			this.getByDefaultTypeOfStudy(this.data.type_of_study_id?this.data.type_of_study_id:null);
			this.getByDefaultBodyParts(this.data.body_part_id?this.data.body_part_id:null);
			let other_study_type_control = getFieldControlByName(this.fieldConfig,'other_type_of_study_name');
			let other_body_parts_control = getFieldControlByName(this.fieldConfig,'other_body_part_name');
			if(this.data?.type_of_study?.slug == 'other') {
				other_study_type_control.classes = other_study_type_control.classes.filter(className => className != 'hidden');
			}
			if(this.data?.mri_body_part?.body_part?.slug == 'other') {
				other_body_parts_control.classes = other_body_parts_control.classes.filter(className => className != 'hidden');
			}
		}
		

	}

	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
		
	}

	onReady(event) {
		this.form = event;
		this.bindOtherStudyType();
		this.bindOtherBodyParts();
	}

	bindOtherStudyType() {
		this.subscription.push(this.form && this.form.controls['type_of_study_id'].valueChanges.subscribe(value => {
			let other_study_type_control = getFieldControlByName(this.fieldConfig,'other_type_of_study_name');
			let staudyType = this.studyTypeList.find(ele => ele?.id == value);
			if(staudyType?.slug == 'other')
			{	
				other_study_type_control.classes = other_study_type_control.classes.filter(className => className != 'hidden');
			}
			else
			{
				other_study_type_control.classes.push('hidden');
				this.form.controls['other_type_of_study_name'].reset('',{emitEvent:false})
			}
		}))
	}

	bindOtherBodyParts() {
		this.subscription.push(this.form && this.form.controls['body_part_id'].valueChanges.subscribe(value => {
			let other_body_parts_control = getFieldControlByName(this.fieldConfig,'other_body_part_name');
			let bodyParts = this.bodyPartList.find(ele => ele?.id == value);
			if(bodyParts?.slug == 'other')
			{	
				other_body_parts_control.classes = other_body_parts_control.classes.filter(className => className != 'hidden');
			}
			else
			{
				other_body_parts_control.classes.push('hidden');
				this.form.controls['other_body_part_name'].reset('',{emitEvent:false})
			}
		}))
	}

	setFormValues(data)
	{
		debugger;
		this.form.patchValue({
			id:data.id?data.id:null,
			type_of_study_id:data?data.type_of_study_id:null,
			body_part_id:data? data.body_part_id:null,
			other_type_of_study_name: data ? data.other_type_of_study_name : null,
			other_body_part_name: data ? data.other_body_part_name : null
		})
	}

	onSubmit(form) {
		this.startLoader=true;
		debugger;
		let value = { ...form };
	
		value = removeEmptyAndNullsFormObject(value);
		let obj = {
			mri:{
				id:this.mri_id,
				mri_intake_1: {
					id: this.mri_intake_id,
				
					is_imaging_study: true,
					imaging_study_details: [value],
				},
				
			},
			request_from_front_desk: true,
			
		};
		obj = removeEmptyAndNullsFormObject(obj);
		
		this.caseFlowService.updateCase(this.caseId,obj).subscribe(res => {
			this.startLoader=false;
			this.toastrService.success('Successfully Updated', 'Success');
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
				new NgSelectClass("Type of Study*", 'type_of_study_id', 'name', 'id', null, false, '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-12 col-lg-6'],[],null,null,null,null,this.onFocusTypeOfStudy.bind(this),this.searchTypeOfStudyScrollToEnd.bind(this),this.searchTypeHeadTypeOfStudy$,this.searchTypeHeadTypeOfStudy.bind(this)),

				new NgSelectClass("Body Parts*", 'body_part_id', 'name', 'id', null, false, '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-12 col-lg-6'],[],null,null,null,null,this.onFocusBodyParts.bind(this),this.searchBodyPartsScrollToEnd.bind(this),this.searchTypeHeadBodyParts$,this.searchTypeHeadBodyParts.bind(this)),
			], ['row']),

			new DivClass([
				new DynamicControl('id', null),
				// new DynamicControl('is_deleted', false),
				new InputClass(
					'Please specify*',
					'other_type_of_study_name',
					InputTypes.text,
					'',
					[{ name: 'required', message: 'This field is required', validator: Validators.required }],
					'',
					['col-12 col-lg-6', 'hidden'],
				),
	
				new InputClass(
					'Please specify*',
					'other_body_part_name',
					InputTypes.text,
					'',
					[{ name: 'required', message: 'This field is required', validator: Validators.required }],
					'',
					['col-12 col-lg-6', 'hidden'],
				),
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

	onFocusTypeOfStudy(name) {
		return new Observable((res) => {
			
			if (this.studyTypeList.length == 0) {
				this.studyTypeFilter.page+=1;
				let body = {
					page: this.studyTypeFilter.page,
					name: this.studyTypeFilter.searchKey,
					per_page: this.studyTypeFilter.per_page,
	
				};
				this.MriIntakeService.getStudyType(body).subscribe((data) => {
					debugger;
					this.resetTypeOfStudyListing();
					let result = [...data['result']['data']];
	
					this.studyTypeFilter.searchKey = '';
	
					this.studyTypeFilter.lastPage = data.result.last_page;
	
					this.studyTypeList = [...this.studyTypeList, ...result];
					res.next(this.studyTypeList);
	
				},error=>{
				});
	
			}
		})
	}

	getByDefaultTypeOfStudy(id?)
	{
		let data={
			id:id?id:null
		}
		this.MriIntakeService.getStudyType(data).subscribe((data) => {
			debugger;
			let result = [...data['result']['data']];
			let type_of_study_control = getFieldControlByName(
				this.fieldConfig,
				'type_of_study_id',
			);
			type_of_study_control.items=result
				this.studyTypeList=result;
			// this.studyTypeFilter.searchKey = '';

			// this.studyTypeFilter.lastPage = data.result.last_page;

			// this.studyTypeList = [...this.studyTypeList, ...result];

			// res(this.studyTypeList);

		});
	}

	getByDefaultBodyParts(id?)
	{
		let data={
			id:id?id:null
		}
		this.MriIntakeService.getBodyParts(data).subscribe((data) => {
			debugger;
			let result = [...data['result']['data']];

			let b0dy_part_control = getFieldControlByName(
				this.fieldConfig,
				'body_part_id',
			);
			b0dy_part_control.items=result
				this.bodyPartList=result;
		});
	}

	searchTypeOfStudyScrollToEnd()
	{
		return new Observable((res) => {
			
			if (this.studyTypeFilter.page < this.studyTypeFilter.lastPage) {
				this.studyTypeFilter.page += 1
				this.studyTypeFilter.page = this.studyTypeFilter.page;
				let body = {
					page: this.studyTypeFilter.page,
					name: this.studyTypeFilter.searchKey,
					per_page: this.studyTypeFilter.per_page,
				
	
				};
				this.MriIntakeService.getStudyType(body).subscribe((data) => {
					let result = [...data['result']['data']];		
					this.studyTypeFilter.lastPage = data.result.last_page;
	
					this.studyTypeList = [...this.studyTypeList, ...result];
					res.next(this.studyTypeList);
				},error=>{
				});
	
			}
	
		})
			
	}

	searchTypeHeadTypeOfStudy(filter)
	{
		this.studyTypeFilter.searchKey=filter;
		this.studyTypeFilter.lastPage=2
		return new Observable((res) => {
			let body = {
	
				page: 1,

				name: this.studyTypeFilter.searchKey,
				
				per_page: this.studyTypeFilter.per_page,

			};
			this.MriIntakeService.getStudyType(body).subscribe((data) => {
				this.resetTypeOfStudyListing();
					let result = [...data['result']['data']];
	
					this.studyTypeFilter.lastPage = data.result.last_page;
	
					this.studyTypeList = [ ...this.studyTypeList,...result];
					this.studyTypeFilter.page=0;
					console.log(this.studyTypeList);

					res.next(this.studyTypeList);
				});
		})
	}

	onFocusBodyParts(name) {
		return new Observable((res) => {
			
			if (this.bodyPartList.length == 0) {
				this.bodypartsFilter.page+=1;
				let body = {
					page: this.bodypartsFilter.page,
					name: this.bodypartsFilter.searchKey,
					per_page: this.bodypartsFilter.per_page,
	
				};
				this.MriIntakeService.getBodyParts(body).subscribe((data) => {
					this.resetBodypartsListing();
	
					let result = [...data['result']['data']];
	
					this.bodypartsFilter.searchKey = '';
	
					this.bodypartsFilter.lastPage = data.result.last_page;
	
					this.bodyPartList = [...this.bodyPartList, ...result];
					res.next(this.bodyPartList);
	
				},error=>{
				});
	
			}
		})
	}

	searchBodyPartsScrollToEnd()
	{
		return new Observable((res) => {
			
			
			if (this.bodypartsFilter.page < this.bodypartsFilter.lastPage) {
				this.bodypartsFilter.page += 1
				this.bodypartsFilter.page = this.bodypartsFilter.page;
				let body = {
					page: this.bodypartsFilter.page,
					name: this.bodypartsFilter.searchKey,
					per_page: this.bodypartsFilter.per_page,
				
	
				};
				this.MriIntakeService.getBodyParts(body).subscribe((data) => {
	
					let result = [...data['result']['data']];
	
					this.bodypartsFilter.lastPage = data.result.last_page;
	
					this.bodyPartList = [...this.bodyPartList, ...result];
					res.next(this.bodyPartList);
				},error=>{
				});
	
			}
	
		})
			
	}

	searchTypeHeadBodyParts(filter)
	{
		this.bodypartsFilter.searchKey=filter;
		this.bodypartsFilter.lastPage=2
		
		return new Observable((res) => {
			let body = {
	
				page: 1,

				name: this.bodypartsFilter.searchKey,
				
				per_page: this.bodypartsFilter.per_page,

			};
			this.MriIntakeService.getBodyParts(body).subscribe((data) => {
				this.resetBodypartsListing();
					let result = [...data['result']['data']];
	
					this.bodypartsFilter.lastPage = data.result.last_page;
	
					this.bodyPartList = [...this.bodyPartList, ...result];
					this.bodypartsFilter.page=0
					res.next(this.bodyPartList);
				});
		})
	}

	resetBodypartsListing()
	{
		this.bodyPartList=[]
		let body_part_id_control = getFieldControlByName(
			this.fieldConfig,
			'body_part_id',
		);
		body_part_id_control.items=[];
	}

	resetTypeOfStudyListing()
	{
		this.studyTypeList=[]
		let type_of_study_id_control = getFieldControlByName(
			this.fieldConfig,
			'type_of_study_id',
		);
		type_of_study_id_control.items=[];
	}

	

}
