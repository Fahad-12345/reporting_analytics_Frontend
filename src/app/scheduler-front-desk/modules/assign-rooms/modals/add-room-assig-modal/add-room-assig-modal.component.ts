
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FrontDeskService } from '../../../../front-desk.service';
import { AssignRoomsService } from '../../assign-rooms.service';
import { SubjectService } from '../../subject.service';
import { ToastrService } from 'ngx-toastr';
import { AddToBeSchedulledUrlsEnum } from '@appDir/scheduler-front-desk/modules/add-to-be-scheduled/add-to-be-scheduled-list-urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { HttpSuccessResponse, StorageData } from '@appDir/pages/content-pages/login/user.class';
import { AssignRoomsUrlsEnum } from '../../assign-rooms-urls-enum';
import { convertDateTimeForSending } from '@appDir/shared/utils/utils.helpers';

@Component({
  selector: 'app-add-room-assig-modal',
  templateUrl: './add-room-assig-modal.component.html',
  styleUrls: ['./add-room-assig-modal.component.scss']
})
export class AddRoomAssigModalComponent implements OnInit {

  meridian = true;
  myForm: FormGroup;
  public addToWaitingList: any
  public postObjWithoutRecuurence: any = {
    "roomAssign": {
      "startDate": "2018-01-04T05:00:00.000Z",
      "endDate": "2018-01-20T10:59:00.000Z",
      "facilityId": 1,
      "roomId": 1,
      "docId": 101
    }
  }
  public postObjWithRecurrenceEndDate: any = {
    "roomAssign": {
      "startDate": "2018-01-04T05:00:00.000Z",
      "endDate": "2018-01-04T10:59:00.000Z",
      "facilityId": 1,
      "roomId": 1,
      "docId": 101
    },
    "recurrence": {
      "startDate": "2018-01-04T10:00:00.000Z",
      "endDate": "2018-01-15T18:00:00.000Z",
      "daysList": [
        "4"
      ],
      "endingCriteria": "weekly"
    }
  }
  public postObjWithRecurrenceEndAfterWeeks: any = {
    "roomAssign": {
      "startDate": "2018-01-04T05:00:00.000Z",
      "endDate": "2018-01-04T10:59:00.000Z",
      "facilityId": 1,
      "roomId": 1,
      "docId": 101
    },
    "recurrence": {
      "startDate": "2018-01-04T10:00:00.000Z",
      "endAfterOccurences": "",
      "daysList": [
        "4"
      ],
      "endingCriteria": "weekly"
    }
  }
  public isWeekError: boolean = true;
  public isDisableOption: boolean = true;
  public errorCode;
  public errorRecurrenceCode;
  public isUnSuccess: boolean = true;
  public isError: boolean = true;
  public isRecurrenceError: boolean = true;
  public temp: any = [];
  public assignRooms: any = []
  public dayListArray: any = [];
  public tempStartDate: any = [];
  public tempclinicName: any = [];
  public tempEndDate: any = [];
  public checkRecExists: any;
  public isRecuurenceBefore: boolean = false;
  public isShowRecuurenceBefore: boolean = true;
  public formatString: string = 'HH:mm';
  public interval: number = 30;
  public option: any = [];
  public endByDate: Date;
  public endAfterCheck: any = true;
  public endByCheck: any
  public count = 0;
  public speciality: any = [];
  public doctors: any = [];
  public isRangeRec: boolean = true;
  public hideRangeRec: boolean = true;
  public status: boolean = true;
  public isDisable: boolean = false;
  startDate: Date;
  public access_token: string;
  endDate: Date;
  startTime: Date;
  endTime: Date;
  endOccurenceEndDate: Date;
  public minTime: Date;
  ampm = "AM";
  startmin;
  public clinic;
  public spec;
  public Confirm: boolean = false;
  public minDate: Date
  public weekday: any = [];
  public specTimeSlot = 0
  //values from calendar cell
  public cellSpeciality: any;
  public cellClinic: any;
  public assignClinics: any;

  ngOnInit() {


    this.startDate = new Date(this._service.currentStartDate);
    this.endDate = new Date(this._service.currentEndDate);
    this.minDate = new Date(this.startDate);
    this.startTime = new Date(this.startDate);
    this.endTime = new Date(this.endDate);
    // this.minTime = new Date(this.startTime);
    this.startTime.setDate(this.startDate.getDate());
    this.startTime.setMonth(this.startDate.getMonth());
    this.startTime.setFullYear(this.startDate.getFullYear());

    this.endTime.setDate(this.endDate.getDate());
    this.endTime.setMonth(this.endDate.getMonth());
    this.endTime.setFullYear(this.endDate.getFullYear());
    this.endTime.setHours(this.startTime.getHours())
    this.endTime.setMinutes(this.startTime.getMinutes() + 30)
    this.startDate.setHours(this.startTime.getHours());
    this.startDate.setMinutes(this.startTime.getMinutes())
    this.endDate.setHours(this.endTime.getHours());
    this.endDate.setMinutes(this.endTime.getMinutes())
    this.endByDate = new Date(this.startDate);
    this.myForm.controls['noOfOccurence'].setValue(1);
  }
  constructor(@Inject(DOCUMENT) document,
    protected requestService: RequestService,
    private appointedModalService: NgbModal,
    private storageData: StorageData,
    public _http: HttpClient,
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    public subject: SubjectService, public toastrService: ToastrService,
    public frontDeskService: FrontDeskService,
    public _service: AssignRoomsService) {
    this.startDate = new Date(this._service.currentStartDate);
    this.endDate = new Date(this._service.currentEndDate);
    this.minDate = new Date(this.startDate);
    this.startTime = new Date(this.startDate);
    this.endTime = new Date(this.endDate);
    // this.minTime = new Date(this.startTime);
    this.startTime.setDate(this.startDate.getDate());
    this.startTime.setMonth(this.startDate.getMonth());
    this.startTime.setFullYear(this.startDate.getFullYear());

    this.endTime.setDate(this.endDate.getDate());
    this.endTime.setMonth(this.endDate.getMonth());
    this.endTime.setFullYear(this.endDate.getFullYear());
    this.endTime.setHours(this.startTime.getHours())
    this.endTime.setMinutes(this.startTime.getMinutes() + 30)
    this.startDate.setHours(this.startTime.getHours());
    this.startDate.setMinutes(this.startTime.getMinutes())
    this.endDate.setHours(this.endTime.getHours());
    this.endDate.setMinutes(this.endTime.getMinutes())
    this.endByDate = new Date(this.startDate);
    this.createForm();
    this.option = [
      "Daily", "Weekly", "Monthly"
    ]
    this._service.cast.subscribe(res => {
      this.doctors = JSON.parse(JSON.stringify(res));
      if (res.length != 0) {
        if ((this._service.isSwap == "true" && this._service.selectedData && this._service.selectedData.user_id != 0) || this._service.isSwap == undefined) {
          this.myForm.controls['doctorName'].setValue(this._service.selectedData.user_id);
          this.specTimeSlot = this._service.selectedData.specialities.time_slot
          this.interval = this.specTimeSlot
        }
        else {
          this.specTimeSlot = 0
        }

      }
    })
    this._service.castClinics.subscribe(
      res => {
        this.assignClinics = JSON.parse(JSON.stringify(res))
        for (var i = 0; i < this.assignClinics.length; i++) {
          if (this.assignClinics[i].id == this._service.selectedClinicId) {
            this.myForm.controls['clinicName'].setValue(this.assignClinics[i].id);
          }
        }
      })
    this.assignRooms = this._service.roomForModal
    if (this.assignRooms.length != 0) {
      if ((this._service.isSwap == "false" && this._service.selectedData.id != 0) || this._service.isSwap == undefined) {
        this.myForm.controls['roomName'].setValue(this._service.selectedData.id);
      }
      else {
        // this.myForm.controls['roomName'].setValue(this.assignRooms[0].id);
      }
    }
    this.changeStartTime()
  }
  public changeClinic() {
    this.intializeWeek()
    this.getAvailableRooms();
    this.requestService
      .sendRequest(
        AddToBeSchedulledUrlsEnum.getDoctorsForUsers,
        'POST',
        REQUEST_SERVERS.schedulerApiUrl,
        {
          "clinics": [parseInt(this.myForm.controls['clinicName'].value)]
        }
      ).subscribe(
        (response: HttpSuccessResponse) => {
          for (let i = 0; i < response.result.data.length; i++) {
            for (let x = 0; Array.isArray(response.result.data[i].doctor.specialities) && x < response.result.data[i].doctor.specialities.length; x++) {
              if (parseInt(this.myForm.controls['clinicName'].value) === response.result.data[i].doctor.specialities[x].facilityId) {
                response.result.data[i].doctor.specialities = response.result.data[i].doctor.specialities[x];
                break;
              }
            }
          }
          this.doctors = response.result.data
          for (var i = 0; i < this.doctors.length; i++) {
            this.doctors[i]["color"] = "#" + this.doctors[i]["doctor"]["specialities"]["color"];
            this.doctors[i]["name"] = this.doctors[i]["doctor"]['last_name']
            this.doctors[i]["isChecked"] = false;
            this.doctors[i]["id"] = this.doctors[i].docId
          }
          this.myForm.controls['doctorName'].setValue(this.doctors[0].id);

        })




    if (this.myForm.get('dailyMontlyWeeklyOpt').value === "Daily") {
      this.isWeekError = true;
      this.isDisableOption = true;
    }
    else {
      for (var i = 0; i < this.assignClinics.length; i++) {
        let tempDayList = this.assignClinics[i].daysList;
        if (this.assignClinics[i].id == parseInt(this.myForm.controls['clinicName'].value)) {
          for (var j = 0; j < this.weekday.length; j++) {
            for (var x = 0; x < tempDayList.length; x++) {
              if (this.weekday[j][0].id == tempDayList[x]) {
                this.weekday[j][0].isColor = true;
              }
            }
          }
        }
      }
      for (var i = 0; i < this.weekday.length; i++) {
        if (this.weekday[i][0].isColor == "false") {
          this.weekday.splice(i, 1);
          i--;
        }
      }
      this.isDisableOption = false;
    }
  }
  public changeDoc() {
    for (var i = 0; i < this.doctors.length; i++) {
      if (this.doctors[i].doctor.user_id == parseInt(this.myForm.get('doctorName').value)) {
        this.specTimeSlot = this.doctors[i].doctor.specialities.time_slot
        this.interval = this.doctors[i].doctor.specialities.time_slot
        this.changeStartTime()
        break;
      }
    }
  }
  public changeStartDate() {
    if (this.startDate === null) {
      this.toastrService.error("Start Date is needed", 'Error')
      return;
    }
    this.minDate = new Date(this.startDate);
    this.endByDate = new Date(this.startDate);
    if (this.endDate < this.minDate) {
      this.endDate = this.minDate;
    }
  }
  public changeEndDate() {
    if (this.endDate === null) {
      this.toastrService.error("End Date is needed", 'Error')
      return;
    }
    if ((this.startDate.getDate() == this.endDate.getDate()) && (this.startDate.getMonth() == this.endDate.getMonth()) && (this.startDate.getFullYear() == this.endDate.getFullYear())) {
      this.startTime.setDate(this.startDate.getDate());
      this.startTime.setMonth(this.startDate.getMonth());
      this.startTime.setFullYear(this.startDate.getFullYear());
      this.endDate.setHours(this.startDate.getHours() + 1)
      this.endDate.setMinutes(this.startDate.getMinutes())
      this.minTime = new Date(this.startTime);
      if (this.endDate != null) {
        if (this.endDate.getTime() < this.minDate.getTime()) {
          this.toastrService.error("Pick end date with respect to start date", 'Error')
          return;
        }
      }
    }
    else {
      this.endDate.setHours(0)
      this.endDate.setMinutes(0)
      this.endTime.setDate(this.endDate.getDate());
      this.endTime.setMonth(this.endDate.getMonth());
      this.endTime.setFullYear(this.endDate.getFullYear());
      this.minTime = new Date(this.endDate);
      if (this.endDate != null) {
        if (this.endDate.getTime() < this.minDate.getTime()) {
          this.toastrService.error("Pick end date with respect to start date", 'Error')
          return;
        }
      }
    }
  }
  public changeStartTime() {
    if (this.startTime === null) {
      this.toastrService.error("Start time is needed", 'Error')
      return;
    }
    this.startTime.setDate(this.startDate.getDate());
    this.startTime.setMonth(this.startDate.getMonth());
    this.startTime.setFullYear(this.startDate.getFullYear());
    this.startDate.setHours(this.startTime.getHours());
    this.startDate.setMinutes(this.startTime.getMinutes());
    this.endDate.setHours(this.endTime.getHours());
    this.endDate.setMinutes(this.endTime.getMinutes());
    if ((this.startDate.getDate() == this.endDate.getDate()) && (this.startDate.getMonth() == this.endDate.getMonth()) && (this.startDate.getFullYear() == this.endDate.getFullYear())) {
      this.minTime = new Date(this.startTime.getTime() + (this.specTimeSlot * 1000 * 60))
    }
    else {
      this.minTime.setHours(0);
      this.minTime.setMinutes(0);
    }
  }
  public changeEndTime() {

    if (this.endTime != null) {
      this.endTime.setDate(this.endDate.getDate());
      this.endTime.setMonth(this.endDate.getMonth());
      this.endTime.setFullYear(this.endDate.getFullYear());
      this.startDate.setHours(this.startTime.getHours());
      this.startDate.setMinutes(this.startTime.getMinutes());
      this.endDate.setHours(this.endTime.getHours());
      this.endDate.setMinutes(this.endTime.getMinutes());
      if (this.endTime.getTime() < this.minTime.getTime()) {
        this.toastrService.error("Pick end Time with respect to start", 'Error')
        return;
      }
    }
    else {
      this.toastrService.error("End time is mandatory", 'Error')
      return;
    }
  }
  public changeEndOcurrenceDate() {

  }
  public changeRepeatEvery() {
    this.intializeWeek()
    if (this.myForm.get('dailyMontlyWeeklyOpt').value === "Daily") {
      this.isWeekError = true;
      this.isDisableOption = true;
    }
    else {
      for (var i = 0; i < this.assignClinics.length; i++) {
        let tempDayList = this.assignClinics[i].daysList;
        if (this.assignClinics[i].id == parseInt(this.myForm.controls['clinicName'].value)) {
          for (var j = 0; j < this.weekday.length; j++) {
            for (var x = 0; x < tempDayList.length; x++) {
              if (this.weekday[j][0].id == tempDayList[x]) {
                this.weekday[j][0].isColor = true;
              }
            }

          }
        }
      }
      for (var i = 0; i < this.weekday.length; i++) {
        if (this.weekday[i][0].isColor == "false") {
          this.weekday.splice(i, 1);
          i--;
        }
      }
      this.isDisableOption = false;
    }
  }
  private createForm() {
    this.myForm = this.formBuilder.group({
      clinicName: ['', Validators.required],
      doctorName: ['', Validators.required],
      roomName: ['', Validators.required],
      noOfOccurence: '',
      dailyMontlyWeeklyOpt: 'Daily',
      endOccureneceDate: '',
    });
  }
  public submitFormAndClose() {
    this.isRecurrenceError = true;
    this.startDate.setHours(this.startTime.getHours());
    this.startDate.setMinutes(this.startTime.getMinutes());
    this.endDate.setHours(this.endTime.getHours());
    this.endDate.setMinutes(this.endTime.getMinutes());
    let startDate = new Date(this.startDate);
    let endDate = new Date(this.endDate);
    if (this.myForm.invalid) {
      return;
    }
    this.activeModal.close(this.myForm.value);
  }
  public submitFormAndOpen() {
    if (this.myForm.get('roomName').value != undefined) {
      this.toastrService.error("Kindly select atleast one room", 'Error')
    }
    if (this.myForm.get('clinicName').value != undefined) {
      this.toastrService.error("Kindly select atleast one clinic", 'Error')
    }
    if (this.specTimeSlot == 0) {
      this.toastrService.error("Kindly select atleast one doctor", 'Error')
    }
    if (this.myForm.invalid) {
      return;
    }
    if (this.endDate === null || this.startDate === null) {
      this.toastrService.error("Date is needed", 'Error')
      return;
    }
    if (this.startTime === null) {
      this.toastrService.error("Start time is needed", 'Error')
      return;
    }
    if (this.endTime === null) {
      this.toastrService.error("End time is mandatory", 'Error')
      return;
    }
    this.startDate.setHours(this.startTime.getHours());
    this.startDate.setMinutes(this.startTime.getMinutes());
    this.endDate.setHours(this.endTime.getHours());
    this.endDate.setMinutes(this.endTime.getMinutes());
    let startDate = new Date(this.startDate);
    let endDate = new Date(this.endDate);
    startDate.setSeconds(0)
    endDate.setSeconds(0)
    if (this.endDate.getTime() <= this.minDate.getTime()) {
      this.toastrService.error("Pick end date with respect to start date", 'Error')
      return;
    }
    if (this.endTime.getTime() <= this.minTime.getTime()) {
      this.toastrService.error("Pick end Time with respect to start time", 'Error')
      return;
    }

    if ((<HTMLInputElement>document.getElementById('rangeRecurrence')).checked === false) {
      this.postObjWithoutRecuurence.roomAssign.startDate = convertDateTimeForSending(this.storageData, startDate);
      this.postObjWithoutRecuurence.roomAssign.endDate = convertDateTimeForSending(this.storageData, endDate);
      this.postObjWithoutRecuurence.roomAssign.facilityId = this.myForm.controls['clinicName'].value;
      this.postObjWithoutRecuurence.roomAssign.roomId = parseInt(this.myForm.controls['roomName'].value);
      this.postObjWithoutRecuurence.roomAssign.docId = this.myForm.controls['doctorName'].value;
      this.postObjWithoutRecuurence['timeZone'] = this.storageData.getUserTimeZoneOffset()
      this.requestService
        .sendRequest(
          AssignRoomsUrlsEnum.addRoomAssignment,
          'POST',
          REQUEST_SERVERS.schedulerApiUrl,
          this.postObjWithoutRecuurence
        ).subscribe(
          (resp: HttpSuccessResponse) => {
            this.toastrService.success("Successfully Added", 'Success')
            this.subject.refreshAssign("add")
            this.activeModal.close();
          }, error => {
            this.isRecurrenceError = false;
            this.isUnSuccess = true;
            this.isError = true;
          });
    }
    else if (((<HTMLInputElement>document.getElementById('rangeRecurrence')).checked === true) && ((<HTMLInputElement>document.getElementById('rangeRecOption2')).checked === true)) {
      this.endOccurenceEndDate = this.endByDate;
      if (this.endOccurenceEndDate === null) {
        this.toastrService.error("Choose other option or choose end occurence date", 'Error')
        return;
      }
      let date = new Date(this.endOccurenceEndDate);
      date.setSeconds(0);
      startDate = convertDateTimeForSending(this.storageData, startDate)
      endDate = convertDateTimeForSending(this.storageData, endDate)
      this.postObjWithRecurrenceEndDate.roomAssign.startDate = startDate;
      this.postObjWithRecurrenceEndDate.roomAssign.endDate = endDate;
      this.postObjWithRecurrenceEndDate.roomAssign.facilityId = this.myForm.controls['clinicName'].value;
      this.postObjWithRecurrenceEndDate.roomAssign.roomId = parseInt(this.myForm.controls['roomName'].value);
      this.postObjWithRecurrenceEndDate.roomAssign.docId = this.myForm.controls['doctorName'].value;
      this.postObjWithRecurrenceEndDate.recurrence.startDate = startDate;
      this.postObjWithRecurrenceEndDate.recurrence.endDate = date;
      this.postObjWithRecurrenceEndDate.recurrence.endDate.setHours(23);
      this.postObjWithRecurrenceEndDate.recurrence.endDate.setMinutes(59);
      this.postObjWithRecurrenceEndDate.recurrence.endDate.setSeconds(59);
      this.postObjWithRecurrenceEndDate.recurrence.endDate = convertDateTimeForSending(this.storageData, this.postObjWithRecurrenceEndDate.recurrence.endDate)

      this.postObjWithRecurrenceEndDate['timeZone'] = this.storageData.getUserTimeZoneOffset()
      this.postObjWithRecurrenceEndDate.recurrence.endingCriteria = this.myForm.get('dailyMontlyWeeklyOpt').value;

      if (this.postObjWithRecurrenceEndDate.recurrence.endingCriteria === "Weekly" || this.postObjWithRecurrenceEndDate.recurrence.endingCriteria === "Monthly") {
        if (this.dayListArray.length === 0) {
          this.isWeekError = false;
          return;
        }
        else {
          this.isWeekError = true;
        }
      }
      else {
        this.dayListArray = []
      }
      this.postObjWithRecurrenceEndDate.recurrence.daysList = this.dayListArray;
      if (this.postObjWithRecurrenceEndDate.recurrence.endingCriteria == "Daily" || this.postObjWithRecurrenceEndDate.recurrence.endingCriteria == "daily") {
        delete this.postObjWithRecurrenceEndDate.recurrence.daysList
      }
      this.requestService
        .sendRequest(
          AssignRoomsUrlsEnum.addRoomAssignment,
          'POST',
          REQUEST_SERVERS.schedulerApiUrl,
          this.postObjWithRecurrenceEndDate
        ).subscribe(
          (resp: HttpSuccessResponse) => {
            this.toastrService.success("Successfully Added", 'Success')
            this.subject.refreshAssign("add")
            this.activeModal.close();
          }, error => {
            this.isRecurrenceError = false;
            this.isUnSuccess = true;
            this.isError = true;
          });

    }

    else if (((<HTMLInputElement>document.getElementById('rangeRecurrence')).checked === true) && ((<HTMLInputElement>document.getElementById('rangeRecOption1')).checked === true)) {
      let endAfter = this.myForm.get('noOfOccurence').value;
      this.postObjWithRecurrenceEndAfterWeeks.roomAssign.startDate = startDate;
      this.postObjWithRecurrenceEndAfterWeeks.roomAssign.endDate = endDate;
      this.postObjWithRecurrenceEndAfterWeeks.roomAssign.facilityId = this.myForm.controls['clinicName'].value;
      this.postObjWithRecurrenceEndAfterWeeks.roomAssign.roomId = parseInt(this.myForm.controls['roomName'].value);
      this.postObjWithRecurrenceEndAfterWeeks.roomAssign.docId = this.myForm.controls['doctorName'].value;
      this.postObjWithRecurrenceEndAfterWeeks.recurrence.startDate = startDate;
      this.postObjWithRecurrenceEndAfterWeeks.recurrence.endAfterOccurences = endAfter;
      this.postObjWithRecurrenceEndAfterWeeks.recurrence.endingCriteria = this.myForm.get('dailyMontlyWeeklyOpt').value;
      this.postObjWithRecurrenceEndAfterWeeks['timeZone'] = this.storageData.getUserTimeZoneOffset()
      if (this.postObjWithRecurrenceEndAfterWeeks.recurrence.endingCriteria === "Weekly" || this.postObjWithRecurrenceEndAfterWeeks.recurrence.endingCriteria === "Monthly") {
        if (this.dayListArray.length === 0) {
          this.isWeekError = false;
          return;
        }
        else {
          this.isWeekError = true;
        }
      }
      else {
        this.dayListArray = []
      }
      this.postObjWithRecurrenceEndAfterWeeks.recurrence.daysList = this.dayListArray;
      if (this.postObjWithRecurrenceEndAfterWeeks.recurrence.endingCriteria == "Daily" || this.postObjWithRecurrenceEndAfterWeeks.recurrence.endingCriteria == "daily") {
        delete this.postObjWithRecurrenceEndAfterWeeks.recurrence.daysList
      }

      this.requestService
        .sendRequest(
          AssignRoomsUrlsEnum.addRoomAssignment,
          'POST',
          REQUEST_SERVERS.schedulerApiUrl,
          this.postObjWithRecurrenceEndAfterWeeks
        ).subscribe(
          (resp: HttpSuccessResponse) => {
            this.toastrService.success("Successfully Added", 'Success')
            this.subject.refreshAssign("add")
            this.activeModal.close();
          }, error => {
            this.isRecurrenceError = false;
            this.isUnSuccess = true;
            this.isError = true;
          });
    }
    else if (((<HTMLInputElement>document.getElementById('rangeRecOption2')).checked === false) && ((<HTMLInputElement>document.getElementById('rangeRecOption1')).checked === false)) {
      this.isUnSuccess = false;
      this.isError = true;
      this.isRecurrenceError = true;
    }
  }
  public changeWeek(event, val) {
    val = val.id
    if (event.target.checked) {
      this.dayListArray = Array.from(new Set(this.dayListArray));
      val = JSON.stringify(val);
      this.dayListArray.push(val);
      this.isWeekError = true;
    }
    else {
      this.dayListArray = Array.from(new Set(this.dayListArray));
      val = JSON.stringify(val);
      for (var i = 0; i < this.dayListArray.length; i++) {
        if (this.dayListArray[i] === val) {
          this.dayListArray.splice(i, 1);
        }
      }
    }
  }
  public endAfter(e) {
    if (e.target.checked) {
      this.endAfterCheck = true;
      this.endByCheck = false;

    } else {
      this.endAfterCheck = false;

    }
  }
  public endBy(e) {
    if (e.target.checked) {
      this.endByCheck = true;
      this.endAfterCheck = false;
    } else {
      this.endByCheck = false;

    }
  }
  public RecurrenceDoc(event) {
    if (event.target.checked) {
      this.checkRecExists = true;
    } else {
      this.checkRecExists = false;
    }
    if (this.myForm.get('dailyMontlyWeeklyOpt').value === "Daily") {
      this.isDisableOption = true;
    }
    else {
      this.isDisableOption = false;
    }
    if ((<HTMLInputElement>document.getElementById('rangeRecurrence')).checked === true) {
      this.isRangeRec = false;
      this.myForm.controls['endOccureneceDate'].enable();
      this.myForm.controls['noOfOccurence'].enable();
      if (event.target.checked) {
        this.isShowRecuurenceBefore = false;
        this.hideRangeRec = false;
      }
      else {
        this.isShowRecuurenceBefore = true;
        this.hideRangeRec = true;
      }
    }
    else {

      this.isRangeRec = true;
      this.myForm.controls['endOccureneceDate'].disable();
      this.myForm.controls['noOfOccurence'].disable();
      if (event.target.checked) {
        this.isShowRecuurenceBefore = false;
        this.hideRangeRec = false;
      }
      else {
        this.isShowRecuurenceBefore = true;
        this.hideRangeRec = true;
      }
    }

  }
  public rangeRecuurence(event) {
    this.isError = true;
    this.isUnSuccess = true;
    this.minDate = new Date(this.startDate);
    if ((<HTMLInputElement>document.getElementById('rangeRecurrence')).checked === true) {
      this.isRangeRec = false;
      this.myForm.controls['endOccureneceDate'].enable();
      this.myForm.controls['noOfOccurence'].enable();
    }
    if (event.target.checked) {
      this.isRangeRec = false;
      this.myForm.controls['endOccureneceDate'].enable();
      this.myForm.controls['noOfOccurence'].enable();
      // (<HTMLInputElement>document.getElementById('automaticassign')).checked=true;
      this.isDisable = true;
    }
    else {
      this.myForm.controls['endOccureneceDate'].disable();
      this.myForm.controls['noOfOccurence'].disable();
      this.isDisable = false;
      this.isRangeRec = true;
    }
    this.hideRangeRec = false;
  }
  removeDuplicates(originalArray) {
    var trimmedArray = [];
    var values = [];
    var value;
    for (var i = 0; i < originalArray.length; i++) {
      value = originalArray[i]['id'];

      if (values.indexOf(value) === -1) {
        trimmedArray.push(originalArray[i]);
        values.push(value);
      }
    }
    return trimmedArray;
  }
  public getAvailableRooms() {
    this.assignRooms = []
    let Id = parseInt(this.myForm.controls['clinicName'].value)
    this.requestService
      .sendRequest(
        AssignRoomsUrlsEnum.getAllRoomsOfClinic,
        'POST',
        REQUEST_SERVERS.schedulerApiUrl,
        {
          "clinicId": Id
        }
      ).subscribe(
        (res: HttpSuccessResponse) => {
          this.assignRooms = res.result.data;
          this.assignRooms = this.removeDuplicates(this.assignRooms);
          if (res.result.data.length != 0) {
            this.myForm.controls['roomName'].setValue(this.assignRooms[0].id);
          }
        });
  }
  public intializeWeek() {
    this.weekday[0] = [{ id: 0, 'name': 'Sunday', isColor: 'false' }];
    this.weekday[1] = [{ id: 1, 'name': 'Monday', isColor: 'false' }];
    this.weekday[2] = [{ id: 2, 'name': 'Tuesday', isColor: 'false' }];
    this.weekday[3] = [{ id: 3, 'name': 'Wednesday', isColor: 'false' }];
    this.weekday[4] = [{ id: 4, 'name': 'Thursday', isColor: 'false' }];
    this.weekday[5] = [{ id: 5, 'name': 'Friday', isColor: 'false' }];
    this.weekday[6] = [{ id: 6, 'name': 'Saturday', isColor: 'false' }];
  }
}
