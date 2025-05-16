import { OnInit, destroyPlatform } from '@angular/core';
import { Component, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { WeekSubjectService } from '../../utils/my-calendar/src/modules/week/subject.service';
import { DoctorCalendarService } from '../../doctor-calendar.service'
import { SubjectService } from '../../subject.service';
import { ToastrService } from 'ngx-toastr';
import { DoctorCalendarUrlsEnum } from '../../doctor-calendar-urls-enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';

@Component({
  selector: 'app-unavailability-delete-reason',
  templateUrl: './unavailability-delete-reason.component.html',
  styleUrls: ['./unavailability-delete-reason.component.scss']
})
export class UnavailabilityDeleteReasonComponent implements OnInit {
  myForm: FormGroup;
  ngOnInit() { }
  constructor(public activeModal: NgbActiveModal,
    protected requestService: RequestService,
    public DoctorCalendarService: DoctorCalendarService,
    public _subjectService: SubjectService, private toastrService: ToastrService,
    private formBuilder: FormBuilder) {
    this.createForm()
  }
  /*Reason for deleting unavailability*/
  public addReasonForUnavialabilty() {
    if (this.myForm.get('comments').value == '') {
      this.myForm.controls['comments'].setValue('N/A')
    }
    let obj = {
      "id": this.DoctorCalendarService.unavailabilityId,
      "comments": this.myForm.get('comments').value
    }
    this.requestService
      .sendRequest(
        DoctorCalendarUrlsEnum.deleteDoctorUnavailability,
        'delete_with_body',
        REQUEST_SERVERS.schedulerApiUrl1,
        obj
      ).subscribe(
        (res: HttpSuccessResponse) => {
          this.toastrService.success(res.message, 'Success');
          this.activeModal.close(this.myForm.value);
          this._subjectService.refresh("delete Un")
        },
		error=>{
		  this.toastrService.success(error.error.message, 'Error')
		})
  }
  /*Form intilaization function*/
  private createForm() {
    this.myForm = this.formBuilder.group({
      comments: ['', [Validators.required]]
    });
  }
}
