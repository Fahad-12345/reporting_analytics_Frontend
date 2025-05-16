import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SubjectService } from '../../subject.service'
import { SchedulerSupervisorService } from '../../../../scheduler-supervisor.service';
import { AssignDoctorSubjectService } from '../../assign-doctor-subject.service';
import { ToastrService } from 'ngx-toastr';
import { RequestService } from '@appDir/shared/services/request.service';
import { AssignDoctorUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-doctor/assign-doctor-urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { HttpSuccessResponse, StorageData } from '@appDir/pages/content-pages/login/user.class';
import { convertDateTimeForRetrieving, convertDateTimeForSending, convertUTCTimeToUserTimeZoneByOffset, getTimeZone, stdTimezoneOffset } from '@appDir/shared/utils/utils.helpers';
import { AclService } from '@appDir/shared/services/acl.service';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';
@Component({
  selector: 'app-update-doc-assignment-modal',
  templateUrl: './update-doc-assignment-modal.component.html',
  styleUrls: ['./update-doc-assignment-modal.component.scss']
})
export class UpdateDocAssignmentModalComponent implements OnInit {
  meridian = true;
  myForm: FormGroup;
  public replaceObj: any = { "specAssign": { "startDate": "", "endDate": "", "specId": "" }, "doctorMethod": "", "doctors": [{ "docId": "", "docName": "" }] };
  public postObj: any = { "specAssign": { "startDate": "", "endDate": "", "noOfDoctors": "", "supId": "", "specId": "", "clinicId": "" }, "doctorMethod": "", "doctors": [{ "docId": "", "doctorName": "" }] }
  public docName: any = [];
  public interval: number = 5;
  public preCheckDate: any = false;
  public minTime: Date;
  public maxTime: Date;
  public startDate: Date;
  public endDate: Date;
  public startTime: Date;
  public endTime: Date;
  minStart: Date;
  maxEnd: Date;
  minStartTime: any;
  maxEndTime: any;
  public cellSpeciality: any;
  public cellClinic: any;
  public specTimeSlot;
  public currentEvent:any;
  disableBtnOnUpdate:boolean=false;
  private dateIdToDay = { 0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat" };
  userPermissions = USERPERMISSIONS;


  ngOnInit() {
    this.cellClinic = this._subjectService.clinic
    this.cellSpeciality = this._subjectService.spec
    let tempDayString = this._subjectService.currentSelectedDate.split(" ");
    let tempDay = tempDayString[0];
    for (let key in this.dateIdToDay) {
      if (this.dateIdToDay[key] === tempDay) {
        if (this.cellSpeciality.doctor !== undefined) {
          let startDate = new Date(this._subjectService.currentStartDate)
          let endDate = new Date(this._subjectService.currentStartDate)
          let user_timings = this.cellSpeciality.doctor['user_timings'].find(timing => timing.facility_location_id == this.cellSpeciality.facility_location_id && timing.day_id == key);
          let start_time = user_timings['start_time'];
          let end_time = user_timings['end_time'];
          let docTimeStart: any = convertUTCTimeToUserTimeZoneByOffset(this.storageData, start_time, startDate, true);
          let docTimeEnd: any = convertUTCTimeToUserTimeZoneByOffset(this.storageData, end_time, endDate, true);
          let stDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), docTimeStart[0] + docTimeStart[1], docTimeStart[3] + docTimeStart[4]);
          this.minStart = stDate;
          let edDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), docTimeEnd[0] + docTimeEnd[1], docTimeEnd[3] + docTimeEnd[4]);
          this.maxEnd = edDate;
        }
      }
    }
    this.startDate = new Date(this._subjectService.currentStartDate)
    this.endDate = new Date(this._subjectService.currentStartDate)
    this.startTime = new Date(this._subjectService.currentStartDate);
    this.endTime = new Date(this._subjectService.currentEndDate);
    this.startTime.getHours();
    this.startTime.getMinutes();
    this.endTime.setHours((this.endTime.getHours()));
    this.endTime.setMinutes(this.endTime.getMinutes());
    this.endDate.setHours((this.endTime.getHours()));
    this.minStartTime = new Date(this.startTime.getTime());
		this.maxEndTime = new Date(this.endTime.getTime());
	  this.myForm.controls['clinicname'].setValue(this.cellClinic.facility.qualifier+'-'+this.cellClinic.qualifier);
    let docName = this.cellSpeciality.doctor.info.first_name + ' ' + (this.cellSpeciality.doctor.info.middle_name?this.cellSpeciality.doctor.info.middle_name+' ':'') + this.cellSpeciality.doctor.info.last_name
    this.specTimeSlot = this.cellSpeciality.doctor.specialities.time_slot;
    this.minTime = new Date(this.startTime.getTime() + (this.interval * 1000 * 60));
    this.maxTime = new Date(this.endTime.getTime() - (this.interval * 1000 * 60));
    this.myForm.controls['speciality'].setValue(docName);
	  this.myForm.controls['speciality_name'].setValue( this._subjectService.updatedSpecQualifierObj && this._subjectService.updatedSpecQualifierObj.qualifier ?  this._subjectService.updatedSpecQualifierObj.qualifier:  this.cellSpeciality.speciality);
    this.myForm.controls['clinicname'].disable();
    this.myForm.controls['speciality'].disable();
	  this.myForm.controls['speciality_name'].disable();
  }
  constructor(
    public _supervisorService: SchedulerSupervisorService,
    protected requestService: RequestService,
    public _subjectService: SubjectService,
    private storageData: StorageData,
    public activeModal: NgbActiveModal, 
    private toastrService: ToastrService,
    public AssignDoctorSubjectService: AssignDoctorSubjectService,
    private formBuilder: FormBuilder,
    public aclService: AclService
  ) {
    this.createForm();
    this.currentEvent=this._subjectService.currentEvent
    const object =
    {
      "available_doctor_id": this.currentEvent.current_dateList_event.available_doctor_id
    }
    this.requestService
      .sendRequest(
        AssignDoctorUrlsEnum.preChecksForDoctorAssignmentUpdation_new,
        'POST',
        REQUEST_SERVERS.schedulerApiUrl1,
        object
      ).subscribe(
        (responseInJSON: HttpSuccessResponse) => {
          this.minTime = convertDateTimeForRetrieving(this.storageData, new Date(responseInJSON.result.data.start_time))
          this.maxTime = convertDateTimeForRetrieving(this.storageData, new Date(responseInJSON.result.data.end_time))
          if (responseInJSON.result.data.start_time == null && responseInJSON.result.data.end_time == null) {
            this.minTime = null;
            this.maxTime = null;
            this.minTime = new Date(this.startTime.getTime() + (this.specTimeSlot * 1000 * 60))
            this.maxTime = new Date(this.endTime.getTime() - (this.specTimeSlot * 1000 * 60));
            if (this._subjectService.recCheckForUpdate != null) {
              this.preCheckDate = true
            }
          }
          if (responseInJSON.result.data.start_time != null && responseInJSON.result.data.end_time != null) {
            this.preCheckDate = true
          }
        })
  }
  /*Form intilaization function*/
  private createForm() {
    this.myForm = this.formBuilder.group({
      clinicname: ['', Validators.required],
      speciality: ['', Validators.required],
	    speciality_name: ['', Validators.required],
      startdate: ['', Validators.required],
      enddate: ['', Validators.required],
      starttime: ['', Validators.required],
      endtime: ['', Validators.required],
    });
  }
  /*Change Start Date function*/
  public changeStartDate() {
    this.endDate = this.startDate;
  }
  /*Change End Date function*/
  public changeEndDate() {
    this.startDate = this.endDate;
  }

  /*Change Start Time function*/
  startTimeRequired = false;
  endTimewrtStart = false;

  public changeStartTime() {
    this.startTimeRequired = false;
    this.endTimewrtStart = false;
    if (this.startTime == undefined || this.startTime.getTime() == null) {
      this.startTimeRequired = true;
      return
    }
    else if (this.startTime != null && this.endTime != null) {
      this.startTimeRequired = false;
      if (this.endTime.getTime() <= this.startTime.getTime()) {
				this.endTimewrtStart = true;
				this.toastrService.error("Pick end Time with respect to start", 'Error')
				return;
			}
    } 
    else {
      if (this.preCheckDate && (this.startTime != null && this.endTime != null)) {
        if (this.minTime != null && this.startTime > this.minTime) {
          this.startTimeRequired = false;
          this.toastrService.error("Already appointed on this time", 'Error')
          return;
        }
      }
      else {
        this.startTimeRequired = false;
      }
    }
  }

  /*Change End Time function*/
  endTimeRequired = false;

  public changeEndTime() {
    this.endTimeRequired = false;
    this.endTimewrtStart = false;
    if (this.endTime == undefined || this.endTime.getTime() == null) {
      this.endTimeRequired = true;
      return
    }
    else if (this.startTime != null && this.endTime != null) {
      this.endTimeRequired = false;
      if (this.endTime.getTime() <= this.startTime.getTime()) {
				this.endTimewrtStart = true;
				this.toastrService.error("Pick end Time with respect to start", 'Error')
				return;
			}
    } 
    else {
      if (this.preCheckDate && (this.startTime != null && this.endTime != null)) {
        if (this.maxTime != null && this.endTime < this.maxTime) {
          this.endTimeRequired = false;
          this.toastrService.error("Already appointed on this time", 'Error')
          return;
        }
      }
      else {
        this.endTimeRequired = false;
      }
    }
  }

  public onChangeStartDate(event)
	{
		if(event.dateValue)
		{
			this.startDate=(new Date(event.dateValue));
			this.changeStartDate();
			
		 
		} 
		else
		{
			this.startDate=null
			this.changeStartDate();
		}
	}
  /*Form submitation function*/
  public submitFormAndOpen() {
	  this.disableBtnOnUpdate=true
    if (this.startDate == undefined || this.startDate == null) {
	  this.toastrService.error("Date is required", 'Error');
	  this.disableBtnOnUpdate=false
      return
    }
    if (this.startTime == undefined || this.startTime == null ||
      this.endTime == undefined || this.endTime == null) {
	  this.toastrService.error("Start and End time is mandatory", 'Error');
	  this.disableBtnOnUpdate=false
      return
    }
    let st = new Date(this.startDate)
    st.setHours(this.startTime.getHours())
    st.setMinutes(this.startTime.getMinutes())
    let en = new Date(this.endDate)
    en.setHours(this.endTime.getHours())
    en.setMinutes(this.endTime.getMinutes())
    if (this.preCheckDate && (this.startTime != null && this.endTime != null)) {
      if (this.minTime != null && this.startTime > this.minTime) {
		this.toastrService.error("Already appointed on this time", 'Error')
		this.disableBtnOnUpdate=false
        return;
      }
    }
    if (this.preCheckDate && (this.startTime != null && this.endTime != null)) {
      if (this.maxTime != null && this.endTime < this.maxTime) {
		this.toastrService.error("Already appointed on this time", 'Error')
		this.disableBtnOnUpdate=false
        return;
      }
    }

    if (st > en) {
	  this.toastrService.error("End time can't less than Start time", 'Error')
	  this.disableBtnOnUpdate=false
      return
    }
    else if (this.startDate == undefined || this.endDate == undefined) {
	  this.toastrService.error("Date is required", 'Error')
	  this.disableBtnOnUpdate=false
      return
    }
    else if (this.startTime == undefined || this.endTime == undefined) {
	  this.toastrService.error("Start and End time is mandatory", 'Error')
	  this.disableBtnOnUpdate=false
      return
    }
    else if (this.startTime.getTime() == null || this.endTime.getTime() == null) {
	  this.toastrService.error("Start and End time is mandatory", 'Error')
	  this.disableBtnOnUpdate=false
      return
    }
    else if (this.startTime.getTime() == this.endTime.getTime()) {
	  this.toastrService.error("Start and End time can't be same", 'Error')
	  this.disableBtnOnUpdate=false
      return
    }
    else {

      let sd = new Date(this.startDate);
      let ed = new Date(this.endDate);
      sd.setHours(this.startTime.getHours())
      sd.setMinutes(this.startTime.getMinutes())
      ed.setHours(this.endTime.getHours())
      ed.setMinutes(this.endTime.getMinutes())
	
    //   const reqObj = {
    //     "id": this._subjectService.updatedEventId,
    //     "doctor_id": this._subjectService.spec.id,
    //     "facility_location_id": this._subjectService.clinic.id,
    //     "start_date": convertDateTimeForSending(this.storageData, sd),
    //     "end_date": convertDateTimeForSending(this.storageData, ed),
    //     "time_zone": this.storageData.getUserTimeZoneOffset()
	//   }
    let time_zone_string = getTimeZone(this.storageData.getUserTimeZone().timeZone);
	  let reqObj={
		 available_doctor:{
			 id:this.currentEvent.current_dateList_event.available_doctor_id,
			 date_list_id:this.currentEvent.current_dateList_event.id,
			 facility_location_id:this._subjectService.clinic.id,
			 doctor_id:this.currentEvent.doctor_id,
			 start_date:convertDateTimeForSending(this.storageData, sd),
			 end_date: convertDateTimeForSending(this.storageData, ed),
		 },
     time_zone : {
      time_zone: stdTimezoneOffset(),
      time_zone_string: time_zone_string
     }
	  }


      this.requestService
        .sendRequest(
          AssignDoctorUrlsEnum.updateDoctorAssigments_v2,
          'PUT',
          REQUEST_SERVERS.schedulerApiUrl1,
		  reqObj
        ).subscribe(
          (response: HttpSuccessResponse) => {
            var data = response.result.data
            this.toastrService.success("Successfully Updated", 'Success')
            this.activeModal.close();
			this.AssignDoctorSubjectService.refreshUpdate("update");
			this.disableBtnOnUpdate=false
		  }, error => {;
			this.disableBtnOnUpdate=false
          }
        )
    }
  }
}
