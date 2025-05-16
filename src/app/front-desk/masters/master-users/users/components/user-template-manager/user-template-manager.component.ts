import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { RequestService } from '@appDir/shared/services/request.service';
import { UserTemplateManagerService } from '../../services/user-template-manager-service';
import { CaseType, UserTemplate, UserTemplateSpecialityModel, VisitTypesModel } from '../../models/templateManager.model';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { UserTemplateManagerFormComponent } from '../user-template-manager-form/user-template-manager-form.component';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
@Component({
  selector: 'app-user-template-manager',
  templateUrl: './user-template-manager.component.html',
  styleUrls: ['./user-template-manager.component.scss']
})
export class UserTemplateManagerComponent implements OnInit, OnChanges {
	@Input() practice_location_id: number; 
	@Input() speciality_id: number; 
	userId
	lstSpeciality:UserTemplateSpecialityModel=new UserTemplateSpecialityModel();
	modalRef: NgbModalRef;
  constructor(private customDiallogService : CustomDiallogService,protected requestService: RequestService, private activatedRoute: ActivatedRoute,
	public usertemplatemanagerService:UserTemplateManagerService,private toastrService: ToastrService,
	private storageData: StorageData,private modalService: NgbModal,) {
		this.userId = this.activatedRoute.parent.snapshot.params.id;
	  
   }

  ngOnInit() {
	
  }


  ngOnChanges(changes: SimpleChanges)
  {
	this.get_VisitTypeBySpeciality();
  }

  get_VisitTypeBySpeciality()
  {
	  this.lstSpeciality=new UserTemplateSpecialityModel() 
	  if(this.speciality_id)
	  {
		let queryParam:any={
			id:this.speciality_id
		}
		this.usertemplatemanagerService.getVisitTypesBySpeciality(queryParam).subscribe((res:any)=>{
		this.lstSpeciality=res.result.data;
  
		},err=>{
			this.toastrService.error(err, 'Error');

		})
	  }
	 
	 
  }

  toggleOpen(row:VisitTypesModel)
  {
    if (row.is_open == null) {
      row.is_open = false
    }
    row.is_open = !row.is_open

    if (row.is_open) {
      this.getUserCaseWithTemplate(row)
    }
  }
  edit(row:any)
  {

  }

  openTemplateForm(visitType:VisitTypesModel) {
	const ngbModalOptions: NgbModalOptions = {
		backdrop: 'static',
		keyboard: false,
		windowClass: 'modal_extraDOc',
	};
	this.modalRef = this.modalService.open(UserTemplateManagerFormComponent, ngbModalOptions);
	this.modalRef.componentInstance.template_form_object={
		user_id:this.userId,
		facility_location_id:this.practice_location_id,
		speciality_id:this.speciality_id,
		visit_type_id:visitType.id,
		visit_type:visitType.name,
		template_id:null,
		case_type_ids:[]

	}
	this.modalRef.componentInstance.visitType.id=visitType.id
	this.modalRef.componentInstance.visitType.name=visitType.name
	this.modalRef.componentInstance.Edit=false
	this.modalRef.result.then((data: any) => {

		console.log(data)
		if(data)
		{
			this.getUserCaseWithTemplate(visitType)

		}
	

	})

}

  getUserCaseWithTemplate(row: VisitTypesModel) {
	// let queryParams:any={
	// 	user_id:this.storageData.getUserId(),
	// 	facility_location_id:this.practice_location_id,
	// 	speciality_id:this.speciality_id,
	// 	visit_type_id:row.id
	// }

	let queryParams:any={
		user_id:this.userId,
		facility_location_id:this.practice_location_id,
		speciality_id:this.speciality_id,
		visit_type_id:row.id
	}
    this.usertemplatemanagerService.getUserCaseTypeWithTemplate(queryParams).subscribe((data:any) => {
      console.log(data)
      row.user_template=data.result.data; 
    //   let arr: SpecialityModel[] = data['result']['data']
    //   row.specialities = arr
    //   arr.forEach(speciality => {
    //     if (speciality.visit_types.length > 0) {
    //       speciality.visit_types.forEach(visittype => {
    //         let _speciality: SpecialityModel = { ...speciality, visit_types: [visittype] }
    //         row._specialities.push(_speciality)
    //       })

    //     } else {
    //       row.specialities = arr
    //     }
    //   })
      console.log(row)
      // row.specialities = data['result']['data']
    })
  }

  editVisitType(visitType:VisitTypesModel,usertemplate:UserTemplate, casetype: CaseType[])
  {
	const ngbModalOptions: NgbModalOptions = {
		backdrop: 'static',
		keyboard: false,
		windowClass: 'modal_extraDOc',
	};
	this.modalRef = this.modalService.open(UserTemplateManagerFormComponent, ngbModalOptions);
	// let casetypes=casetype.filter(casetype=>{return casetype.id})
	let casetypes=casetype.map(function(casetype) {return casetype.id;});
	this.modalRef.componentInstance.template_form_object={
		user_id:this.userId,
		facility_location_id:this.practice_location_id,
		speciality_id:this.speciality_id,
		visit_type_id:visitType.id,
		visit_type:visitType.name,
		template_id:usertemplate.template_id,
		case_type_ids:casetypes

	}
	this.modalRef.componentInstance.visitType.id=visitType.id
	this.modalRef.componentInstance.visitType.name=visitType.name
	this.modalRef.componentInstance.Edit=true
	this.modalRef.result.then((data: any) => {
		console.log(data)
		if(data)
		{
			this.getUserCaseWithTemplate(visitType)

		}
		
	})
  }
  deleteTemplate(row: VisitTypesModel,usertemplate:UserTemplate)
  {

	let queryParams:any={
		user_id:this.userId,
		facility_location_id:this.practice_location_id,
		speciality_id:this.speciality_id,
		visit_type_id:row.id,
		template_id:usertemplate.template_id
	}
	this.customDiallogService.confirm('Delete Record ', 'Do you want to delete the record?','Yes','No')
	.then((confirmed) => {
		
		if (confirmed){
			this.usertemplatemanagerService.deleteUserTemplate(queryParams).subscribe((data:any) => {
				console.log(data);
				if(data.status)
				{
					this.toastrService.success('Successfully Deleted', 'Success');
					this.getUserCaseWithTemplate(row)

				}
			
			  },err=>{
				this.toastrService.error(err, 'Error');
			  })
			
		}
	})
	.catch();

	
  }



}
