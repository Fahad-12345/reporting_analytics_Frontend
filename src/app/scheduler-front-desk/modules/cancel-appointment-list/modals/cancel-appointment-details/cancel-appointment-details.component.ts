import { DatePipeFormatService } from './../../../../../shared/services/datePipe-format.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
//services
import { FrontDeskService } from '../../../../front-desk.service'
import { SubjectService } from '../../../../subject.service'
import { StorageData, HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { Router } from '@angular/router';
import { RequestService } from '@appDir/shared/services/request.service';
import { CancelAppointmentListUrlsEnum } from '../../cancel-appointmnet-list-urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import {AclServiceCustom} from '../../../../../acl-custom.service'
@Component({
  selector: 'app-cancel-appointment-details',
  templateUrl: './cancel-appointment-details.component.html',
  styleUrls: ['./cancel-appointment-details.component.scss']
})
export class CancelAppointmentDetailsComponent extends PermissionComponent implements OnInit {
  myForm: FormGroup
  public title: any
  public patientfirst: any = "xyz";
  public patientlast: any = "xyz";
  public chart: any;
  public caseId: any;
  public selectedRoomId: any = 0;
  public selectSpId: any;
  public appDate: any;
  public delDate: any;
  public appTime: any;
  public docName: any;
  public delTime: any;
  public canUndo: boolean = true;
  public details: any;
  patientName: any='';
  constructor(aclService: AclService,
    router: Router,
    public aclCustom :AclServiceCustom ,
    protected requestService: RequestService,
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    public cdr: ChangeDetectorRef,
    private storageData: StorageData,
    private frontDeskService: FrontDeskService,
	public datePipeService: DatePipeFormatService,
    private subject: SubjectService, private toastrService: ToastrService,
  ) {
    super(aclService, router);
	this.details = this.frontDeskService.detailsForCancel
    this.createForm()
  
    this.title = this.details.appointmentTitle;
    this.chart = this.details.patient_id;
    var startString = "000-00-"
    var receivedString = JSON.stringify(this.details.patient_id);
    var finalStr = startString + receivedString.padStart(4, "0");
     this.chart = finalStr
    this.caseId = this.details.caseId
     this.patientName = this.details.patient.middle_name?this.details.patient.first_name+' '+this.details.patient.middle_name+' '+this.details.patient.last_name:this.details.patient.first_name+' '+this.details.patient.last_name
     this.details.startDateTime = new Date(this.details.startDateTime)
     this.appDate = this.details.startDateTime.toString()
     this.appTime = this.details.startDateTime.toString().substring(16, 21)
     this.details.deletedAt = new Date(this.details.updated_at)
     this.delDate = this.details.deletedAt.toString()
     this.delTime = this.details.deletedAt.toString().substring(16, 21)


    const scheduler = this.storageData.getSchedulerInfo()
    if (scheduler.front_desk_manual_calendar_speciality == undefined
      || scheduler.front_desk_manual_calendar_speciality == "") {
      scheduler.front_desk_manual_calendar_speciality = '0';
    }
    this.selectSpId = scheduler.front_desk_manual_calendar_speciality;
    this.storageData.setSchedulerInfo(scheduler)
  }
  ngOnInit() {

    if (this.aclService.hasPermission(this.userPermissions.appointment_add) ||
      this.storageData.isSuperAdmin()) {
      this.canUndo = false
    }
    this.patchFormValues();
  }
  /*Form intilaization function*/
  private createForm() {
    this.myForm = this.formBuilder.group({
      appoint_title: [this.title, Validators.required],
      patient: [{value:'',disabled: true}, Validators.required],
      clinicName: ['', Validators.required],
      chart: [{value:'',disabled: true}, Validators.required],
      caseId: [{value:'',disabled: true}, Validators.required],
      doctor: ['Any', Validators.required],
      priority: ['', Validators.required],
      AppDate: ['', Validators.required],
      examRoom: '',
      comment: [{value:'',disabled: true}],
      dailyMontlyWeeklyOpt: 'Daily',
      noOfOccurence: '',
      endOccureneceDate: '',
    });
    this.myForm.controls['appoint_title'].setValue(this.title);
  }

  patchFormValues(){
    this.myForm.patchValue({
      patient: this.patientName,
      chart: this.chart,
      caseId: this.caseId,
      comment: this.details.cancelled_comments
    })
  }
}
