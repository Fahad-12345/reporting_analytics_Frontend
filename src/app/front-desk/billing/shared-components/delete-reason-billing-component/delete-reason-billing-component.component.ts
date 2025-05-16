import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { AssignDoctorUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-doctor/assign-doctor-urls-enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-delete-reason-billing-component',
  templateUrl: './delete-reason-billing-component.component.html',
  styleUrls: ['./delete-reason-billing-component.component.scss']
})
export class DeleteReasonBillingComponentComponent implements OnInit {

	myForm: FormGroup
	public isOtherRequired = false
	public comments: string;
	public defaultComments: any = [];
	OtherReason = 'Other';
	isSelectedOtherReason = false;
	constructor(public activeModal: NgbActiveModal,
	  protected requestService: RequestService,
	  public formBuilder: FormBuilder,
	 
	  
	) {
	  this.createForm();
  
	}
	ngOnInit() {
	  this.requestService
		.sendRequest(
		  AssignDoctorUrlsEnum.appointmentCancellationComments,
		  'GET',
		  REQUEST_SERVERS.schedulerApiUrl1,
		).subscribe(
		  (res: HttpSuccessResponse) => {
			//this.defaultComments = res.result.data;
			
			//
			  for(var i = 0 ; i<res.result.data.length; i++){  
				if(res.result.data[i]["type_id"] != undefined && (res.result.data[i]["type_id"] == 2 || res.result.data[i]["type_id"] == 3)){
				  this.defaultComments.push(res.result.data[i]);
				}
			  }
			//
		   
			this.myForm.controls['defaultComments'].setValue(this.defaultComments[0].name)
		  })
	}
	/*Form intilaization function*/
	private createForm() {
	  this.myForm = this.formBuilder.group({
		otherComments: "",
		defaultComments: ['',Validators.required]
	  });
	}
	
	/*Reason for deleting appointment*/
	public addReason() {
	  if (this.isSelectedOtherReason == true) {
		this.comments = this.myForm.get("otherComments").value
	  } else {
		this.comments = this.myForm.get("defaultComments").value
	  }
	  let data = {
		  cancelled_comments: this.comments
	  }

	  this.activeModal.close({data:data});
	}
	getSelectionchage(value) {
		if(this.OtherReason === value.target.value) {
			this.setOthersFieldConfig();
		} else {
			this.RemoveOtherFieldConfig();
		}
	}

	setOthersFieldConfig() {
		this.isSelectedOtherReason = true;
		this.myForm.controls['otherComments'].setValidators([Validators.required]);
		this.myForm.controls['otherComments'].updateValueAndValidity({emitEvent:false})
		}
		RemoveOtherFieldConfig(){
			this.isSelectedOtherReason = false;
			this.myForm.controls['otherComments'].reset('',{emitEvent:false});
			this.myForm.controls['otherComments'].clearValidators()
			this.myForm.controls['otherComments'].updateValueAndValidity({emitEvent:false})
	
}
}
