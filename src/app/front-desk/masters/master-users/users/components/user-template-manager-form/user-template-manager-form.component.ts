import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UserTemplateManagerService } from '../../services/user-template-manager-service';
import { TemplateFormModel } from '../../models/templateManager.model';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { ToastrService } from 'ngx-toastr';
import { removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';

@Component({
  selector: 'app-user-template-manager-form',
  templateUrl: './user-template-manager-form.component.html',
  styleUrls: ['./user-template-manager-form.component.scss']
})
export class UserTemplateManagerFormComponent implements OnInit {
	isLoading:boolean=false
	templateManagerForm:FormGroup;
	visitType:any={id:0,name:''}
	userId:number;
	template_form_object:TemplateFormModel;
	caseTypeData: any[] = [];
	filteredTemplateOptions: [];
	Edit:boolean=false
  constructor(private activeModal: NgbActiveModal,
	private customDiallogService : CustomDiallogService,
	public usertemplatemanagerService:UserTemplateManagerService,
	private toastrService: ToastrService,) {
	this.getCaseTypes();
	
	 
   }

  ngOnInit() {
	//   this.getTemplates();
	  this.createForm();
	  if(this.Edit)
	  {
		
		  this.setFormvalues();
		
	  }
	  this.getTemplates();
	
  }

  createForm()
  {
	this.templateManagerForm=new FormGroup({
		visit_type:new FormControl(this.template_form_object.visit_type,[Validators.required]),
		case_type_ids:new FormControl([]),
		template_id:new FormControl('',[Validators.required])
	})  
  }

  setFormvalues()
  {
	this.templateManagerForm.patchValue({
		case_type_ids:this.template_form_object.case_type_ids,
		template_id:this.template_form_object.template_id
	})
  }

  close() {
	if (this.templateManagerForm.dirty && this.templateManagerForm.touched) {
		this.customDiallogService.confirm('Discard Changes', 'Do you want to discard changes?','Yes','No')
		.then((confirmed) => {
			if (confirmed){
				this.activeModal.close()
			}
		})
		.catch();
	} else {
		this.activeModal.close()
	}
}



onSubmit(form) {
	if(this.templateManagerForm.valid)
	{
		this.isLoading=true
		
		if(this.Edit)
		{
			this.update(form);
		}
		else
		{
			this.AddTemplateToUser(form);
		}
		
	  }
	 
	}

	AddTemplateToUser(form)
	{
		let queryParams:any={
			user_id : this.template_form_object.user_id,
			facility_location_id : this.template_form_object.facility_location_id,
			speciality_id : this.template_form_object.speciality_id,
			visit_type_id : this.template_form_object.visit_type_id,
			template_id :form.template_id,
			case_type_ids:form.case_type_ids
		}
		this.usertemplatemanagerService.AttachTemplateToUser(queryParams).subscribe((data:any) => {
			console.log(data);
			if(data.status)
			{
				this.isLoading=true
			  this.toastrService.success('Successfully Updated', 'Success');
			  this.activeModal.close(data.status)
			}
		  },err=>{
			  this.isLoading=false;
			  this.toastrService.error(err, 'Error');
  
		  })
	}

	update(form)
	{
		let checked_case_type_ids=form.case_type_ids;
		let unchecked_case_type_ids=this.template_form_object.case_type_ids.filter(x=>!form.case_type_ids.includes(x))
		let queryParams:any={
			user_id : this.template_form_object.user_id,
			facility_location_id : this.template_form_object.facility_location_id,
			speciality_id : this.template_form_object.speciality_id,
			visit_type_id : this.template_form_object.visit_type_id,
			template_id :form.template_id,
			
			checked_case_type_ids:checked_case_type_ids,
			unchecked_case_type_ids:unchecked_case_type_ids
		}

		this.usertemplatemanagerService.editTemplateToUser(queryParams).subscribe((data:any) => {
			console.log(data);
			if(data.status)
			{
				this.isLoading=true
			  this.toastrService.success('Successfully Updated', 'Success');
			  this.activeModal.close(data.status)
			}
		  },err=>{
			  this.isLoading=false;
			  this.toastrService.error(err, 'Error');
  
		  })
	

	}

	getCaseTypes() {
		let queryParams:any = {
			filter: false,
			order: OrderEnum.ASC,
			per_page: 100,
			page: 1,
			pagination: false,
		  };
			
			this.usertemplatemanagerService.getUserCaseType(queryParams).subscribe((data:any) => {
				console.log(data)
			  this.caseTypeData =data && data.result ? data.result.data : [];
			})

		}

		getTemplates() {
		
				let queryParams:any={
					user_id : this.template_form_object.user_id,
					location_id : this.template_form_object.facility_location_id,
					speciality_id  : this.template_form_object.speciality_id,
					visit_id : [this.template_form_object.visit_type_id],
					case_type_id:this.templateManagerForm.value.case_type_ids?this.templateManagerForm.value.case_type_ids:null
					
					// case_id:this.template_form_object.case_type_ids?this.template_form_object.case_type_ids:null
				}
				queryParams=removeEmptyAndNullsFormObject(queryParams);
					
					
					this.usertemplatemanagerService.getTemplates(queryParams).subscribe((result:any) => {
						console.log(result)
						this.filteredTemplateOptions=result && result.data?result.data:[];
					
					})
				  
			
			
			
			
			}

	


}
