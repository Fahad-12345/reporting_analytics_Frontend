import { DatePipeFormatService } from './../../../../../shared/services/datePipe-format.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder,Validators } from '@angular/forms';
//services
import { FrontDeskService } from '../../../../front-desk.service'
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { Router } from '@angular/router';
import { convertDateTimeForRetrieving } from '@appDir/shared/utils/utils.helpers';

@Component({
  selector: 'app-cancel-appointment-details',
  templateUrl: './cancel-appointment-details.component.html',
  styleUrls: ['./cancel-appointment-details.component.scss']
})
export class CancelAppointmentDetailsComponent extends PermissionComponent implements OnInit {
  myForm: FormGroup
  public hidetitle = false;
  public title: any
  public patientfirst: any = "xyz";
  public patientlast: any = "xyz";
  public patientmiddle : any = "abc";
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
  public FDTime :any;
  cancelDateTime:any
  apptDateTime:any
  //patient name... hhh
  public patName: any;
  public compInp: any;
  //

  constructor(aclService: AclService,
    router: Router,
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    public cdr: ChangeDetectorRef,
    private frontDeskService: FrontDeskService,
    private storageData: StorageData,
	public datePipeService:DatePipeFormatService
  ) {
    super(aclService, router);
    this.details = this.frontDeskService.detailsForCancel
    this.FDTime = this.details.startDateTime;
    this.createForm()
    if (this.details.room) {
      this.selectedRoomId = this.details.room.id
    }
    this.title = this.details.appointmentTitle
    // this.chart = this.details.chartNo
    this.caseId = this.details.caseId +" "+ this.details.caseType
    this.caseId = [...this.caseId]
    var startString = "000-00-"
    var receivedString = JSON.stringify(this.details.chartNo);
    var finalStr = startString + receivedString.padStart(4, "0");
    //console.log("RECV",receivedString,finalStr);
    this.chart = finalStr;
    this.caseId = this.details.caseId
    this.patientlast = this.details.patientLastName
    this.patientfirst = this.details.patientFirstName
    this.patientmiddle = this.details.patientMiddleName;
    //
    this.patName = this.details.patientMiddleName?this.patientfirst + " "+ this.details.patientMiddleName +' '+ this.patientlast:this.patientfirst +" "+ this.patientlast;
    // if(this.details.doctorFirstName == "N/A" ){
    //   this.docName = "N/A"
    // }
    // else{
    //   this.docName = this.details.doctorMiddleName?this.details.doctorFirstName + " "+this.details.doctorMiddleName + " " + this.details.doctorLastName:this.details.doctorFirstName + " " + this.details.patientLastName;
	// }
	  this.docName = this.details.doctor
    this.compInp = this.details.complaint ? this.details.complaint : "N/A" 
    //
    // this.docName = this.details.doctorMiddleName?this.details.doctorFirstName + " "+this.details.doctorMiddleName + " " + this.details.patientLastName:this.details.doctorFirstName + " " + this.details.patientLastName;
    this.cancelDateTime = convertDateTimeForRetrieving(this.storageData, new Date(new Date(this.details.deletedAt)))
    this.apptDateTime = convertDateTimeForRetrieving(this.storageData, new Date(new Date(this.details.startDateTime)))

	// let deldate = convertDateTimeForRetrieving(this.storageData, new Date(new Date(this.details.deletedAt)))
    // let appdate = convertDateTimeForRetrieving(this.storageData, new Date(this.details.startDateTime))
    // this.appDate = appdate.toString().substring(4, 16)
    // var delTempStartHour;
    // var delTempStartMin;
    // delTempStartHour = deldate.getHours();
    // delTempStartMin = deldate.getMinutes();
    // var delDateAMPM = delTempStartHour >= 12 ? 'PM' : 'AM';
    // delTempStartHour = delTempStartHour % 12;
    // delTempStartHour = delTempStartHour ? delTempStartHour : 12;
    // delTempStartMin = delTempStartMin < 10 ? '0' + delTempStartMin : delTempStartMin;
    // this.delTime = delTempStartHour + ":" + delTempStartMin + ' ' + delDateAMPM;
    // this.delDate = deldate.toString().substring(4, 16)
    // var appTempStartHour;
    // var appTempStartMin;
    // appTempStartHour = appdate.getHours();
    // appTempStartMin = appdate.getMinutes();
    // var appDateAMPM = appTempStartHour >= 12 ? 'PM' : 'AM';
    // appTempStartHour = appTempStartHour % 12;
    // appTempStartHour = appTempStartHour ? appTempStartHour : 12;
    // appTempStartMin = appTempStartMin < 10 ? '0' + appTempStartMin : appTempStartMin;
    // this.appTime = appTempStartHour + ":" + appTempStartMin + ' ' + appDateAMPM;
    // this.appDate = appdate.toString().substring(4, 16)
    const scheduler = this.storageData.getSchedulerInfo();
    if (scheduler.front_desk_manual_calendar_speciality == undefined || scheduler.front_desk_manual_calendar_speciality == "") {
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
    this.myForm.disable();

  }
  /*Form intilaization function*/
  private createForm() {
    this.myForm = this.formBuilder.group({
      appoint_title: [this.title, Validators.required],
      patient: ['', Validators.required],
      clinicName: ['', Validators.required],
      chart: ['', Validators.required],
      caseId: ['', Validators.required],
      doctor: ['Any', Validators.required],
      priority: ['', Validators.required],
      AppDate: ['', Validators.required],
      examRoom: '',
      comment: '',
      dailyMontlyWeeklyOpt: 'Daily',
      noOfOccurence: '',
      endOccureneceDate: '',
    });
    this.myForm.controls['appoint_title'].setValue(this.title);
  }
}
