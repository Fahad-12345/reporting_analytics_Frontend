import { OnDestroy, OnInit, destroyPlatform } from '@angular/core';
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
import { SoftPatientService } from '@appDir/front-desk/soft-patient/services/soft-patient-service';
import { Subscription } from 'rxjs';
import { unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';

@Component({
  selector: 'app-soft-patient-visit-component-modal',
  templateUrl: './soft-patient-visit-modal.component.html',
  styleUrls: ['./soft-patient-visit-modal.component.scss']
})
export class SoftPatientVisitComponentModal implements OnInit, OnDestroy{
  myForm: FormGroup;
  @Input() addSoftPatientProviderCalandar:boolean=false
  subscription: Subscription[] = [];
  ngOnInit() { 
    this.subscription.push(this.softCaseService.pullClosePopup().subscribe(res => {
      if(res){
        this.close();
      }
    }));
  }
  constructor(public activeModal: NgbActiveModal,
    public softCaseService: SoftPatientService
   ) {
   
  }
  closeModalEmitter(event)
  {

	this.activeModal.close({caseId:event.caseId})
  }
  /*Reason for deleting unavailability*/
  close()
  {
	this.activeModal.close();
  this.softCaseService.patientProfileRoute = false;
  this.softCaseService.patientFormValidation = false;
  }
  ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}
}
