import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { SubjectService } from "../../subject.service";
import { FormBuilder, FormControl, Form, FormGroup, Validators } from '@angular/forms'
import { DoctorCalendarService } from '../../doctor-calendar.service'
import { AppSubjectService } from '../../utils/my-calendar/src/modules/month/appointments/subject.service';
import { ToastrService } from 'ngx-toastr';
import { RequestService } from '@appDir/shared/services/request.service';
import { AssignDoctorUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-doctor/assign-doctor-urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { AssignSpecialityUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
import { DetailErrorMessagePopupModalComponent } from '@appDir/shared/modules/appointment/modals/detail-error-message-popup-modal/detail-error-message-popup-modal.component';

@Component({
  selector: 'app-delete-reason',
  templateUrl: './delete-reason.component.html',
  styleUrls: ['./delete-reason.component.scss']
})
export class DeleteReasonComponent implements OnInit {
  myForm: FormGroup
  public comments: string;
  public defaultComments: any = [];
	OtherReason = 'Other';
	isSelectedOtherReason = false;
  constructor(public activeModal: NgbActiveModal,
    public SubjectService: SubjectService,
    protected requestService: RequestService,
    public formBuilder: FormBuilder,
    public DoctorCalendarService: DoctorCalendarService,
    public AppSubjectService: AppSubjectService, private toastrService: ToastrService,
	public activeModalError: NgbModal,
	
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
            for(var i = 0 ; i<res.result.data.length; i++){  
              if(res.result.data[i]["type_id"] != undefined && (res.result.data[i]["type_id"] == 2 || res.result.data[i]["type_id"] == 3)){
                this.defaultComments.push(res.result.data[i]);
              }
            }
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
		appointment_ids: this.DoctorCalendarService.deleteAppId,
		cancelled_comments: this.comments
    }
    this.requestService
      .sendRequest(
        AssignSpecialityUrlsEnum.Cancel_Appointment_new,
        'POST',
        REQUEST_SERVERS.schedulerApiUrl1,
        data
      ).subscribe(
        (res: any) => {
			debugger;
			if(res.status===true && res.result&&!res.result.data)
			{
				this.toastrService.success(res.message, 'Success');
				this.AppSubjectService.refreshDelete(this.DoctorCalendarService.appId)
				this.SubjectService.refresh("delete");
				
				this.activeModal.close()
			}
			else if(res.status==200 && res.result && res.result.data)
			{
				const ngbModalOptions: NgbModalOptions = {
					backdrop: 'static',
					keyboard: false,
					size: 'lg',
				};

				if(res.result.data.length< (data.appointment_ids && data.appointment_ids.length))
				{
					this.AppSubjectService.refreshDelete(this.DoctorCalendarService.appId)
					this.SubjectService.refresh("delete")
					this.toastrService.success("Successfully Deleted", 'Success');
				}

				let bulkEditICD10ModeModalRef=this.activeModalError.open(DetailErrorMessagePopupModalComponent, ngbModalOptions);
				bulkEditICD10ModeModalRef.componentInstance.modalRef = bulkEditICD10ModeModalRef;
				bulkEditICD10ModeModalRef.componentInstance.modelTitle="Delete Appointment";
				bulkEditICD10ModeModalRef.componentInstance.errorMessage=res.message;
				bulkEditICD10ModeModalRef.componentInstance.rows=res.result.data?res.result.data:[]
				bulkEditICD10ModeModalRef.result.then((res)=>{
					if(res)
					{
						this.activeModal.close();
					}
				});
	}
          
        })
  }
  getSelectionchage(value) {
	  debugger;
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
