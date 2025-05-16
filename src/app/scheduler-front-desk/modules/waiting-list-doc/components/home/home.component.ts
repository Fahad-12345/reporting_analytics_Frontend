import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { DoctorService } from '../../../../doctor.service';
import { WaitingListService } from '../../waiting-list.service';
import { DaySubjectService } from '../../utils/my-calendar/src/modules/daySub/daySubject.service';
import { Subject } from 'rxjs';
import { WeekDaySubjectService } from '../../utils/my-calendar/src/modules/week-new/subject.service';
import { WeekSubjectService } from '../../utils/my-calendar/src/modules/daySub/subject.service';
import { SubjectService } from '../../subject.service';
import { FrontDeskService } from '../../../../front-desk.service';
import { ToastrService } from 'ngx-toastr';
import { StorageData, HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { Router } from '@angular/router';
import { AclService } from '@appDir/shared/services/acl.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { WaitingListDocUrlsEnum } from '../../waiting-list-doc-urls-enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { AssignSpecialityUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
import { convertDateTimeForRetrieving, convertDateTimeForSending } from '@appDir/shared/utils/utils.helpers';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent extends PermissionComponent implements OnInit {
  public eventsDay = { "clinics": [], "unavailabilities": [] }
  public weekEvents: any = []
  public notifications: any = [];
  public isOpenFilters = true;
  public startTime: Date;
  public date = new Date();
  public tempPriorityFilter: any = [];
  public isShowMore: boolean = true;
  public length: number;
  public loginDoctor: any = JSON.stringify(this.storageData.getUserId())
  public appointmentDuration: any = 20;
  public temprorayArrayForDisplay = [];
  public viewDate: any = new Date();
  public clinicId: any = [];
  public rangeOfDisplayList: any = 5;
  public time: any;
  public events: any = [];
  refresh: Subject<any> = new Subject();
  myForm: FormGroup;
  public doctorName: any;
  public changeTimeByDoctor: any;
  public doctorFilter: any = "Any Doctor";
  public clinics: any = [];
  public showError: boolean = false;
  public hourSegments: any = 3;
  public localStorageId: any;
  public moveToRightApp: boolean = false;
  public allClinicIds: any = [];
  public assignmentStartTime: any;
  public brakIfCheck: boolean = false
  public priorityFilter: any = "All";
  public showCalendar = true;
  intervalID: any;

  constructor(aclService: AclService,
    router: Router,
    private customDiallogService: CustomDiallogService,
    protected requestService: RequestService,
    public _DoctorService: DoctorService,
    public cdr: ChangeDetectorRef,
    public waitingListService: WaitingListService,
    public sub: WeekDaySubjectService,
    public weekSubject: WeekSubjectService,
    public SubjectService: SubjectService,
    private storageData: StorageData,
    public frontdeskservice: FrontDeskService,
    public DaySubjectService: DaySubjectService,
    public formBuilder: FormBuilder, private toastrService: ToastrService,
  ) {
    super(aclService, router);

    this.localStorageId = JSON.stringify(this.storageData.getUserId())
    this.createForm();
  }
  ngOnInit() {
    if (this.aclService.hasPermission(this.userPermissions.scheduler_waiting_list_doctor_view)
      || this.storageData.isSuperAdmin()) {

      this.sub.castScroll.subscribe(
        resp => {
          if (resp.length != 0) {
            this.triggerScrollToWeek()
          }
        }
      )
      if (this.aclService.hasPermission(this.userPermissions.waiting_list_appointment_add)
        || this.storageData.isSuperAdmin()) {
        this.moveToRightApp = true
      }
      this.getClinics();

      this.weekSubject.castCalendar.subscribe(res => {
        if (res.length != 0) {
          this.getAllAppointmentForDoctor()
        }
      })

      this.requestService
        .sendRequest(
          WaitingListDocUrlsEnum.getDoctorDetails,
          'POST',
          REQUEST_SERVERS.schedulerApiUrl,
          {
            docId: this.localStorageId
          }
        ).subscribe(
          (response: HttpSuccessResponse) => {
            const facility = this.storageData.getFacilityLocations()
            for (let i = 0; Array.isArray(response.result.data[0].specialities) && i < response.result.data[0].specialities.length; i++) {
              for (let j = 0; j < facility.length; j++) {
                if (facility[j] === response.result.data[0].specialities[i].facilityId) {
                  response.result.data[0]["specialities"] = response.result.data[0].specialities[i];
                  break;
                }
              }
            }
            this.appointmentDuration = response.result.data[0].specialities.timeSlot
            let time = response.result.data[0].specialities.timeSlot;
            if (time > 60) {
              this.hourSegments = 1;
            }
            else if (60 % time === 0 && time >= 10) {
              this.hourSegments = 60 / time;
            } else {
              for (let i = 0; i < 60; i++) {
                time = time + 1;
                if (60 % time === 0 && time >= 10) {
                  this.hourSegments = 60 / time;
                  this.cdr.detectChanges()
                  break;
                }
              }
            }
            this.SubjectService.refreshHour(this.hourSegments)
            this.doctorName = response.result.data[0].middle_name?response.result.data[0].first_name + " " + response.result.data[0].middle_name + " " + response.result.data[0].last_name:response.result.data[0].first_name + " "  + response.result.data[0].last_name
            this.waitingListService.durationOfAppointment(this.appointmentDuration)

            var reqObj = {
              "docId": parseInt(JSON.stringify(this.storageData.getUserId())),
              "dateTime": convertDateTimeForSending(this.storageData, new Date())
            }
            reqObj.dateTime.setSeconds(0)
            this.requestService
              .sendRequest(
                WaitingListDocUrlsEnum.getWaitingListPatients,
                'POST',
                REQUEST_SERVERS.schedulerApiUrl,
                reqObj
              ).subscribe(
                (responseList: HttpSuccessResponse) => {
                  this.notifications = []
                  let stringyfyResponse = responseList.result.data;
                  this.startTime = convertDateTimeForRetrieving(this.storageData, new Date());
                  this.startTime.getHours();
                  this.startTime.getMinutes();
                  for (let i = 0; i < this.appointmentDuration; i++) {
                    if (((this.startTime.getHours() * 60) + this.startTime.getMinutes()) % this.appointmentDuration === 0) {
                      break;
                    }
                    else {
                      this.startTime.setMinutes(this.startTime.getMinutes() - 1)
                    }
                  }
                  this.startTime.setSeconds(0)
                  for (let i = 0; i < stringyfyResponse.length; i++) {
                    stringyfyResponse[i].timeStamp = convertDateTimeForRetrieving(this.storageData, new Date(stringyfyResponse[i].timeStamp))
                    stringyfyResponse[i]["timeToMove"] = JSON.parse(JSON.stringify(this.startTime))
                    if (stringyfyResponse[i]['picture']== null) {
                      stringyfyResponse[i]['picture'] = this.defaultDoctorImageUrl;
                    }
                    this.notifications.push(JSON.parse(JSON.stringify(stringyfyResponse[i])))
                  }
                  if (this.notifications.length > 5) {
                    for (let i = 0; i < this.rangeOfDisplayList; i++)
                      this.temprorayArrayForDisplay.push(this.notifications[i])
                    this.isShowMore = false;
                  } else {
                    for (let i = 0; i < this.notifications.length; i++)
                      this.temprorayArrayForDisplay.push(this.notifications[i])
                    this.isShowMore = true;
                  }
                  this.tempPriorityFilter = this.notifications

                })
          })
      this.viewDate = new Date()
      this.viewDate.setHours(0)
      this.viewDate.setMilliseconds(0)
      this.viewDate.setMinutes(0)
      this.viewDate.setSeconds(0)
      this._DoctorService.castCurrentDoctor.subscribe(res => {
        if (res && res.length != 0 && res.timeSlot) {
          this.appointmentDuration = res.timeSlot;
          this.getAllAppointmentForDoctor();
        }
      })

      this.intervalID = setInterval(() => {
        this.startTime = convertDateTimeForRetrieving(this.storageData, new Date());
        if (this.assignmentStartTime && this.notifications.length != 0) {
          let tempAssignStart = new Date(this.assignmentStartTime)
          for (let i = 0; 1; i++) {
            if (this.startTime <= this.assignmentStartTime) {
              this.notifications[i].timeToMove = this.assignmentStartTime;
              this.startTime = this.assignmentStartTime
              break;
            } else {
              tempAssignStart.setMinutes(tempAssignStart.getMinutes() + this.appointmentDuration)
              if (this.startTime < tempAssignStart) {
                this.notifications[i].timeToMove = tempAssignStart;
                this.startTime = tempAssignStart
                break;
              } else {
                i--;
              }
            }
          }
        }
        this.startTime.setSeconds(0)
        for (let i = 0; i < this.temprorayArrayForDisplay.length; i++) {
          this.temprorayArrayForDisplay[i].timeToMove = this.startTime
        }
        for (let i = 0; i < this.notifications.length; i++) {
          this.notifications[i].timeToMove = this.startTime
        }
      }, 60000)
    }
  }


  ngOnDestroy() {
    if (this.intervalID) {
      clearInterval(this.intervalID);
    }
  }

  /*Form intilaization function*/
  private createForm() {
    this.myForm = this.formBuilder.group({
      clinicName: ['Any', Validators.required],
      specialityName: ['Any', Validators.required],
      doctorName: ['Any', Validators.required],
      priorityName: ['Any', Validators.required]
    });
  }
  /*Get appointments of a logined doctor*/
  public getAllAppointmentForDoctor() {
    let stDate = new Date()
    stDate.getTime()
    let enDate = new Date()
    enDate.getTime()
    stDate.setHours(0)
    stDate.setMinutes(0)
    stDate.setSeconds(0)
    enDate.setHours(23)
    enDate.setMinutes(59)
    enDate.setSeconds(59)
    if (this.clinicId.length !== 0) {
      this.requestService
        .sendRequest(
          WaitingListDocUrlsEnum.getAllAppointmentsOfDoctor,
          'POST',
          REQUEST_SERVERS.schedulerApiUrl,
          {
            "clinics": this.clinicId,
            "docId": [parseInt(JSON.stringify(this.storageData.getUserId()))],
            "dateTimeRange": [convertDateTimeForSending(this.storageData, new Date(stDate)).toISOString(), convertDateTimeForSending(this.storageData, new Date(enDate)).toISOString()]
          }
        ).subscribe(
          (response: HttpSuccessResponse) => {
            this.events = [];
            this.weekEvents = response.result.data
            let startOfAssignments = []
            let endOfAssignments = []
            for (let i = 0; i < this.weekEvents.clinics.length; i++) {
              for (let j = 0; j < this.weekEvents.clinics[i]["assignments"].length; j++) {
                this.weekEvents.clinics[i]["assignments"][j]["start"] = convertDateTimeForRetrieving(this.storageData, new Date(this.weekEvents.clinics[i]["assignments"][j]["start"]))
                this.weekEvents.clinics[i]["assignments"][j]["end"] = convertDateTimeForRetrieving(this.storageData, new Date(this.weekEvents.clinics[i]["assignments"][j]["end"]))
                this.assignmentStartTime = response.result.data.clinics[0].assignments[0].start

                var firstStart = new Date(this.weekEvents.clinics[i]["assignments"][j]["start"])
                let startTim = new Date(firstStart).toString().substring(16, 21)
                startTim = this.formatAMPM(startTim)
                var firstEnd = new Date(firstStart.getTime() + 60000)
                const assignEnd = new Date(this.weekEvents.clinics[i]['assignments'][j]['end']);
                startOfAssignments.push(firstStart)
                this.events.push({
                  start: firstStart,
                  end: firstEnd,
                  color: this.weekEvents.clinics[i].color,
                  clinicName: "",
                  patientName: "",
                  firstName: "",
                  title: "",
                  comments: "",
                  picture: "",
                  chartNo: "",
                  priority: "",
                  status: "",
                  approved: "",
                  appId: "",
                  startTime: startTim,
                  endTime: "",
                  isAppointment: false,
                  isStart: true,
                  isUnavailablility: false,
                })
                for (let k = 0; k < this.weekEvents.clinics[i]["assignments"][j]["appointments"].length; k++) {
                  this.weekEvents.clinics[i]["assignments"][j]["appointments"][k]["startDateTime"] = convertDateTimeForRetrieving(this.storageData, new Date(this.weekEvents.clinics[i]["assignments"][j]["appointments"][k]["startDateTime"]))
                  var start = new Date(this.weekEvents.clinics[i]["assignments"][j]["appointments"][k]["startDateTime"])
                  let timeSpan = this.weekEvents.clinics[i]["assignments"][j]["appointments"][k]["appointmentDuration"]
                  var end = new Date(start.getTime() + (timeSpan * 60000))
                  let startTime = new Date(start).toString().substring(16, 21)
                  let endTime = new Date(end).toString().substring(16, 21)
                  startTime = this.formatAMPM(startTime)
                  endTime = this.formatAMPM(endTime)
                  if (start.toString() == firstStart.toString()) {
                    start = new Date(start.getTime() + (2 * 60000))
                  }
                  if (end.toString() == assignEnd.toString()) {
                    end = new Date(end.getTime() - (2 * 60000));

                  }
                  let newDay = start.toString().substring(0, 3);
                  let placement: any;
                  if (newDay == "Wed" || newDay == "Thu" || newDay == "Fri") {
                    placement = "left";
                  }
                  else {
                    placement = "right";
                  }
                  this.events.push({
                    start: start,
                    end: end,
                    color: this.weekEvents.clinics[i].color,
                    clinicName: this.weekEvents.clinics[i].clinicName,
                    patientName: this.weekEvents.clinics[i]["assignments"][j]["appointments"][k]["lastName"],
                    firstName: this.weekEvents.clinics[i]["assignments"][j]["appointments"][k]["firstName"],
                    title: this.weekEvents.clinics[i]["assignments"][j]["appointments"][k]["lastName"],
                    picture: this.weekEvents.clinics[i]["assignments"][j]["appointments"][k]["picture"],
                    chartNo: this.weekEvents.clinics[i]["assignments"][j]["appointments"][k]["chartNo"],
                    priority: this.weekEvents.clinics[i]["assignments"][j]["appointments"][k]["priority"],
                    status: this.weekEvents.clinics[i]["assignments"][j]["appointments"][k]["status"],
                    comments: this.weekEvents.clinics[i]["assignments"][j]["appointments"][k]["comments"],
                    statusDescription: this.weekEvents.clinics[i]["assignments"][j]["appointments"][k]["statusDescription"],
                    approved: undefined,
                    appId: this.weekEvents.clinics[i]["assignments"][j]["appointments"][k]["id"],
                    startTime: startTime,
                    endTime: endTime,
                    isAppointment: true,
                    placement: placement,
                    assignmentId: this.weekEvents.clinics[i]["assignments"][j]["appointments"][k]["assignmentId"],
                    appointmentType: this.weekEvents.clinics[i]["assignments"][j]["appointments"][k]["appointmentTypeDescription"],
                    priorityDescription: this.weekEvents.clinics[i]["assignments"][j]["appointments"][k]["priorityDescription"],
                    confirm: this.weekEvents.clinics[i]["assignments"][j]["appointments"][k]["confirm"],
                    visitId: this.weekEvents.clinics[i]["assignments"][j]["appointments"][k]["visitId"],
                    caseId: this.weekEvents.clinics[i]["assignments"][j]["appointments"][k]["caseId"],
                    room: this.weekEvents.clinics[i]["assignments"][j]["appointments"][k]["roomName"]
                  })
                }

                var endStart = new Date(this.weekEvents.clinics[i]["assignments"][j]["end"])
                endStart = new Date(endStart.getTime() - 60000)
                var endEnd = new Date(endStart.getTime() + (1 * 60000))
                let startT = new Date(endEnd).toString().substring(16, 21)
                startT = this.formatAMPM(startT)
                endOfAssignments.push(endEnd)
                this.events.push({
                  start: endStart,
                  end: endEnd,
                  color: this.weekEvents.clinics[i].color,
                  clinicName: "",
                  patientName: "",
                  firstName: "",
                  title: "",
                  picture: "",
                  comments: "",
                  chartNo: "",
                  priority: "",
                  status: "",
                  approved: "",
                  appId: "",
                  startTime: startT,
                  endTime: "",
                  isAppointment: false,
                  isStart: false,
                  isUnavailablility: false,
                })
              }
            }
            for (let i = 0; i < this.weekEvents.unavailabilities.length; i++) {
              this.weekEvents.unavailabilities[i]["startDate"] = convertDateTimeForRetrieving(this.storageData, new Date(this.weekEvents.unavailabilities[i]["startDate"]))
              this.weekEvents.unavailabilities[i]["endDate"] = convertDateTimeForRetrieving(this.storageData, new Date(this.weekEvents.unavailabilities[i]["endDate"]))

              var start = new Date(this.weekEvents.unavailabilities[i]["startDate"])
              var end = new Date(this.weekEvents.unavailabilities[i]["endDate"])
              let startTime = new Date(start).toString().substring(16, 21)
              let endTime = new Date(end).toString().substring(16, 21)
              startTime = this.formatAMPM(startTime)
              endTime = this.formatAMPM(endTime)
              let approved = this.weekEvents.unavailabilities[i]["approvalStatus"]
              let color: any;
              if (approved == 1) {
                color = 'd3d3d3'
              }
              let newDay = start.toString().substring(0, 3);
              let placement: any;
              if (newDay == "Wed" || newDay == "Thu" || newDay == "Fri") {
                placement = "left";
              }
              else {
                placement = "right";
              }
              this.events.push({
                start: start,
                end: end,
                startDate: this.weekEvents.unavailabilities[i]["startDate"],
                endDate: this.weekEvents.unavailabilities[i]["endDate"],
                id: this.weekEvents.unavailabilities[i].id,
                placement: placement,
                subject: this.weekEvents.unavailabilities[i]["subject"],
                realStart: response.result.data.unavailabilities[i]["startDate"],
                realEnd: response.result.data.unavailabilities[i]["endDate"],
                approved: approved,
                color: color,
                startTime: startTime,
                endTime: endTime,
                isUnavailablility: true,
                isAppointment: false,
              })
              // last day events ends
            }
            this.weekSubject.refresh(this.events)
            //week events ends
          },
          error => {
            this.events = [];
            this.weekSubject.refresh(this.events)
          }
        )
    } else {
      this.events = [];
      this.weekSubject.refresh(this.events)
    }
  }
  /*Get all clinics*/
  public getClinics() {
    this.allClinicIds = this.storageData.getFacilityLocations()
    this.requestService
      .sendRequest(
        AssignSpecialityUrlsEnum.Facility_list_Post,
        'POST',
        REQUEST_SERVERS.schedulerApiUrl,
        { 'clinics': this.allClinicIds }
      ).subscribe(
        (response: HttpSuccessResponse) => {
          let stringArray = JSON.stringify(response.result.data)

          let data = JSON.parse(stringArray)
          for (let i = 0; i < data.length; i++) {
            this.clinicId.push(data[i].id)
          }
          this.getAllAppointmentForDoctor();
          this.viewDate = new Date()
          this.viewDate.setHours(0)
          this.viewDate.setMilliseconds(0)
          this.viewDate.setMinutes(0)
          this.viewDate.setSeconds(0)
        })
  }
  /*Scroll function for calendar view*/
  public triggerScrollToWeek() {
    let off = (8 * (30 * 3))
    if (document.getElementById("test-scroll")) {
      document.getElementById("test-scroll").scrollTop = off;
    }
  }
  /*Change time in waiting list view*/
  public changeTime(w, i) {
    this.temprorayArrayForDisplay[i].timeToMove = w.value
    if (w.text === "") {
      this.showError = true;
    } else {
      this.showError = false;
    }
    this.changeTimeByDoctor = w.value
  }
  /*See more functionality in waiting list*/
  public loadMoreItems() {

    let tmp = this.temprorayArrayForDisplay.length
    for (let i = this.temprorayArrayForDisplay.length; i < this.rangeOfDisplayList + tmp; i++) {
      if (this.notifications.length > i) {
        this.temprorayArrayForDisplay.push(this.notifications[i])
      }
      if (this.notifications.length === this.temprorayArrayForDisplay.length) {
        this.isShowMore = true;
      }
    }

  }
  /*Filter functionality in waiting list*/
  public applyFilter() {
    if (this.priorityFilter == 'All' && this.doctorFilter == this.doctorName) {
      this.temprorayArrayForDisplay = [];
      for (let i = 0; i < this.notifications.length; i++) {

        if (this.notifications[i].docId == this.loginDoctor) {
          this.temprorayArrayForDisplay.push(this.notifications[i])
          this.isShowMore = true
        }
      }
    }
    else if (this.priorityFilter == 'All' && this.doctorFilter == "Any Doctor") {
      this.temprorayArrayForDisplay = this.notifications
    }
    else {
      this.isShowMore = true
      let docFilter = this.doctorFilter
      if (docFilter == 'Any Doctor') {
        let x = this.notifications.filter((element) => {
          return this.priorityFilter == element.priorityDescription
        })
        this.temprorayArrayForDisplay = x;
      }
      else {
        docFilter = JSON.stringify(this.storageData.getUserId())
        let x = this.notifications.filter((element) => {
          return this.priorityFilter == element.priorityDescription && docFilter == element.docId
        })
        this.temprorayArrayForDisplay = x;

      }
    }

  }
  /*Reset functionality in waiting list*/
  public resetFilter() {
    this.doctorFilter = 'Any Doctor'
    this.priorityFilter = 'All'
    var reqObj = {
      "docId": parseInt(JSON.stringify(this.storageData.getUserId())),
      "dateTime": convertDateTimeForSending(this.storageData, new Date())
    }

    this.requestService
      .sendRequest(
        WaitingListDocUrlsEnum.getWaitingListPatients,
        'POST',
        REQUEST_SERVERS.schedulerApiUrl,
        reqObj
      ).subscribe(
        (response: HttpSuccessResponse) => {
          this.notifications = [];
          this.temprorayArrayForDisplay = []
          let stringyfyResponse = response.result.data;
          this.startTime = convertDateTimeForRetrieving(this.storageData, new Date());


          this.startTime.setSeconds(0)
          for (let i = 0; i < stringyfyResponse.length; i++) {
            stringyfyResponse[i].timeStamp = convertDateTimeForRetrieving(this.storageData, new Date(stringyfyResponse[i].timeStamp))
            stringyfyResponse[i]["timeToMove"] = JSON.parse(JSON.stringify(this.startTime))
            this.notifications.push(JSON.parse(JSON.stringify(stringyfyResponse[i])))
          }
          if (this.notifications.length > 5) {
            for (let i = 0; i < this.rangeOfDisplayList; i++)
              this.temprorayArrayForDisplay.push(this.notifications[i])
            this.isShowMore = false;
          } else {
            for (let i = 0; i < this.notifications.length; i++)
              this.temprorayArrayForDisplay.push(this.notifications[i])
            this.isShowMore = true;
          }
          this.tempPriorityFilter = this.notifications
        })


  }
  /*Time convertion to 12 hour format*/
  public formatAMPM(str) {
    let result: string = ""
    let h1 = str[0];
    let h2 = str[1];
    let hh = parseInt(h1) * 10 + parseInt(h2);
    let Meridien: string;
    if (hh < 12) {
      Meridien = "AM";
    } else {
      Meridien = "PM";
    }
    hh %= 12;
    // Handle 00 and 12 case separately
    if (hh == 0) {
      result = "12";
      // Printing minutes and seconds
      for (let i = 2; i < str.length; ++i) {
        result = result + str[i];
      }
    }
    else {
      result = JSON.stringify(hh);
      // Printing minutes and seconds
      for (let i = 2; i < str.length; ++i) {
        result = result + str[i];
      }
    }
    result = result + " " + Meridien;
    return result;
  }
  /*Function for moving waiting list entry in calendar */
  public moveToCalendar(n) {
    if (this.moveToRightApp) {
      if (n.timeToMove == undefined || n.timeToMove == '') {
        n.timeToMove = new Date(this.startTime)

      }
      n.timeToMove = convertDateTimeForSending(this.storageData, new Date(n.timeToMove))
      n.timeToMove.setSeconds(0);

      let zero = JSON.stringify(n.timeToMove.getMinutes())
      if (n.timeToMove.getMinutes() === 0) {
        zero = '00'
      }
      let middle=n.middleName?n.middleName:' ';

      this.customDiallogService.confirm('Update',this.doctorName + " are you sure to move " + n.firstName + " " + middle + " " + n.lastName + " at slot " + this.formatAMPM(n.timeToMove.toString().substring(16, 21)),'Yes','No')
		.then((confirmed) => {
			if (confirmed){
        var reqObj = {
          "id": n.id,
          "docId": parseInt(JSON.stringify(this.storageData.getUserId())),
          "appointmentStartTime": new Date(n.timeToMove)
        }
        this.requestService
          .sendRequest(
            WaitingListDocUrlsEnum.moveFromWaitingList,
            'POST',
            REQUEST_SERVERS.schedulerApiUrl,
            reqObj
          ).subscribe(
            (response: HttpSuccessResponse) => {
              this.toastrService.success(response.message)
              this.getAllAppointmentForDoctor()
              for (let i = 0; i < this.temprorayArrayForDisplay.length; i++) {
                if (n.id == this.temprorayArrayForDisplay[i]["id"]) {
                  this.temprorayArrayForDisplay.splice(i, 1)
                  this.tempPriorityFilter = this.temprorayArrayForDisplay
                }
              }
              this.changeTimeByDoctor = new Date(JSON.parse(JSON.stringify(this.assignmentStartTime)))
              this.temprorayArrayForDisplay = JSON.parse(JSON.stringify(this.temprorayArrayForDisplay))
              this.cdr.detectChanges()
            }, error => {
              this.changeTimeByDoctor = new Date(JSON.parse(JSON.stringify(this.assignmentStartTime)))
              this.temprorayArrayForDisplay = JSON.parse(JSON.stringify(this.temprorayArrayForDisplay))
              this.cdr.detectChanges()
            }
          )
			}else if(confirmed === false){
			}else{
			}
		})
		.catch();
   
    } else {
      this.toastrService.error("User don't have the privellege to add appointment from waiting list ")
    }
  }
  /*See more and less functionality for filters*/
  public openAndCloseFilters() {
    this.isOpenFilters = !this.isOpenFilters;
  }
}
