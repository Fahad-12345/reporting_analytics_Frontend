import { OnInit} from '@angular/core';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder,  Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DoctorCalendarService } from '../../doctor-calendar.service';
import { SubjectService } from "../../subject.service"
import { ToastrService } from 'ngx-toastr';
import { StorageData, HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { Router } from '@angular/router';
import { RequestService } from '@appDir/shared/services/request.service';
import { AssignSpecialityUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { DoctorCalendarUrlsEnum } from '../../doctor-calendar-urls-enum';
import { Pagination } from '@appDir/shared/models/pagination';
import { convertDateTimeForRetrievingNotes, convertDateTimeForSending } from '@appDir/shared/utils/utils.helpers';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent extends PermissionComponent implements OnInit {
  myForm: FormGroup;
  public startDate: Date;
  public endDate: Date;
  public doc: any;
  public minDate: Date;
  public assignClinics: any = [];
  public instructionData: any = [];
  public allClinicIds = []
  public doctorName: any;
  ngOnInit() {
    if (this.aclService.hasPermission(this.userPermissions.note)) {
      this.allClinicIds = this.storageData.getFacilityLocations()
    }
    if (!this.doctorService.doctorName) {
      this.doctorService.doctorName = "Any"
    }
    this.doc = this.doctorService.doctorName;
    this.doctorName = this.doc.doctor.info.first_name + " "+ (this.doc.doctor.info.middle_name ? this.doc.doctor.info.middle_name : "") +" "+ this.doc.doctor.info.last_name
    this.startDate = new Date(this.doctorService.notesStartDate);
    this.startDate.setHours(0);
    this.startDate.setMinutes(0)
    this.startDate.setSeconds(0)
    this.endDate = new Date(this.doctorService.notesStartDate);
    this.endDate.setHours(23);
    this.endDate.setMinutes(59)
    this.endDate.setSeconds(0)
    this.minDate = new Date(this.startDate);
    this.requestService
      .sendRequest(
        AssignSpecialityUrlsEnum.getUserInfobyFacility,
        'POST',
        REQUEST_SERVERS.schedulerApiUrl1,
		{ 'facility_location_ids': this.allClinicIds ,
		per_page: Pagination.per_page,
		// filters: '',
		page: 1,
	pagination:true}
      ).subscribe(
        (response: HttpSuccessResponse) => {
          this.assignClinics = response.result.data.docs;
		  this.myForm.controls['clinicname'].setValue(this.doc.facility_location_id)
        //   this.myForm.controls['clinicname'].setValue(this.assignClinics[0].id)
        })
    this.requestService
      .sendRequest(
        DoctorCalendarUrlsEnum.getDoctorInstructions,
        'POST',
        REQUEST_SERVERS.schedulerApiUrl1,
        {
          'start_date': convertDateTimeForRetrievingNotes(this.storageData, this.startDate),
          'end_date': convertDateTimeForRetrievingNotes(this.storageData, this.endDate),
          'doctor_ids': [this.doc.user_id]
        }
      ).subscribe(
        (res: HttpSuccessResponse) => {
          this.instructionData = res.result.data;
          for (var i = 0; i < this.instructionData.length; i++) {
            if (parseInt(this.myForm.get('clinicname').value) == this.instructionData[i].facility_location_id) {
              this.myForm.controls['comments'].setValue(this.instructionData[i].instruction);
              break;
            }
          }
        })
  }
  constructor(aclService: AclService,
    router: Router,
    protected requestService: RequestService,
    private storageData: StorageData,
    private toastrService: ToastrService, public activeModal: NgbActiveModal,  private formBuilder: FormBuilder, public doctorService: DoctorCalendarService, public _subjectService: SubjectService) {
    super(aclService, router);
    this.createForm()
  }
  private createForm() {
    this.myForm = this.formBuilder.group({
      comments: ['', [Validators.required, Validators.maxLength(160)]],
      clinicname: '',
      doctor: []
    });
  }
  get f() { return this.myForm.controls }
  public changeClinic() {
    this.myForm.controls['comments'].setValue(' ');
    for (var i = 0; i < this.instructionData.length; i++) {
      if (parseInt(this.myForm.get('clinicname').value) == this.instructionData[i].facility_location_id) {
        this.myForm.controls['comments'].setValue(this.instructionData[i].instruction);
        break;
      }
    }
  }
}
