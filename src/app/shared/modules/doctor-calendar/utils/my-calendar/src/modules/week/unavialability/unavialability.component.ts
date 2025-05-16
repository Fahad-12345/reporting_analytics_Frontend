
import { OnInit } from '@angular/core';
import { Component, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarWeekService } from '../calendar-week.service';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { convertDateTimeForSending } from '@appDir/shared/utils/utils.helpers';

@Component({
  selector: 'app-unavialability',
  templateUrl: './unavialability.component.html',
  styleUrls: ['./unavialability.component.scss']
})
export class UnavialabilityComponent implements OnInit {

  meridian = true;
  myForm: FormGroup;
  submitted = false;
  public object: any = { "startDate": "", "endDate": "", "approved": 0, "subject": "", "description": "", "supId": 0, "docId": 1, "recId": 0, "clinicId": 0 }
  public tempStartDate: any = [];
  public tempclinicName: any = [];
  public tempEndDate: any = [];
  public checkRecExists: any;
  public noOfDocIsLess: Boolean = true;
  public noOfDocZero: Boolean = true;
  public formatString: string = 'HH:mm';
  public interval: number = 30;
  public speciality: any = [];
  public noOfDoc;
  public isDisable: boolean = false;
  startDate: Date;
  endDate: Date;
  startTime: Date
  endTime: Date
  minDate: Date;
  minTime: Date;
  startmin;

  //values from calendar cell
  public cellSpeciality: any;
  public cellClinic: any;
  public assignClinics: any;

  ngOnInit() {
    this.assignClinics = [];
    this.speciality = [];
    this.startDate = new Date(this.weekService.startDate);
    this.endDate = new Date(this.weekService.startDate);
    this.minDate = new Date(this.startDate);
    this.startTime = new Date(this.weekService.startDate);
    this.endTime = new Date(this.weekService.startDate)
    this.startTime.setHours(this.startDate.getHours());
    this.startTime.setMinutes(this.startDate.getMinutes())
    this.endTime.setHours(this.startDate.getHours() + 1);
    this.endTime.setMinutes(this.startDate.getMinutes());
    this.minTime = new Date(this.startTime);
    // this.myForm.controls['startdate'].setValue(this.startDate);
    // this.myForm.controls['enddate'].setValue(this.endDate);
    // this.myForm.controls['starttime'].setValue(this.startTime);
    // this.myForm.controls['endtime'].setValue(this.endTime);
  }
  constructor(
    private appointedModalService: NgbModal,
    private formBuilder: FormBuilder,
    public activeModal: NgbActiveModal,
    private storageData: StorageData,
    public weekService: CalendarWeekService) {
    this.createForm();

  }
  public changeStartDate() {
    if (this.startDate === null) {
      // this.coolDialogs.alert("Start Date is needed");
      return;
    }
    this.minDate = new Date(this.startDate);
  }

  public changeEndDate() {
    if (this.endDate === null) {
      // this.coolDialogs.alert("End Date is needed");
      return;
    }
    if (this.endDate != null) {
      if (this.endDate.getDate() <= this.minDate.getDate()) {
        // this.coolDialogs.alert("Pick end date with respect to start date");
        return;
      }
    }
  }
  public changeStartTime() {

    if (this.startTime === null) {
      // this.coolDialogs.alert("Start time is needed");
      return;
    }
    this.startTime.setDate(this.startDate.getDate());
    this.startTime.setMonth(this.startDate.getMonth());
    this.startTime.setFullYear(this.startDate.getFullYear());
    this.minTime = new Date(this.startTime);
  }
  public changeEndTime() {

    if (this.endTime != null) {
      this.endTime.setDate(this.endDate.getDate());
      this.endTime.setMonth(this.endDate.getMonth());
      this.endTime.setFullYear(this.endDate.getFullYear());
      if (this.endTime.getTime() <= this.minTime.getTime()) {
        // this.coolDialogs.alert("Pick end Time with respect to start");
        return;
      }
    }
    else {
      // this.coolDialogs.alert("End time is mandatory");
      return;
    }
  }
  private createForm() {
    this.myForm = this.formBuilder.group({
      subject: ['', [Validators.required, Validators.minLength(4)]],
      descrpition: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(512)]],
    });
  }
  get f() { return this.myForm.controls }
  public submitFormAndClose() {
    this.activeModal.close();
  }

  public submitFormAndOpen() {
    this.submitted = true;
    if (this.myForm.invalid) {
      return;
    }
    if (this.startDate === null) {
      // this.coolDialogs.alert("Start Date is needed");
      return;
    }
    if (this.endDate === null) {
      // this.coolDialogs.alert("End Date is needed");
      return;
    }
    if (this.startTime === null) {
      // this.coolDialogs.alert("Start time is needed");
      return;
    }
    if (this.endTime === null) {
      // this.coolDialogs.alert("End time is mandatory");
      return;
    }
    if (this.endDate.getDate() < this.minDate.getDate()) {
      // this.coolDialogs.alert("Pick end date with respect to start date");
      return;
    }
    if (this.endTime.getTime() <= this.minTime.getTime()) {
      // this.coolDialogs.alert("Pick end time with respect to start time");
      return;
    }
    else {
      this.startDate = new Date(this.startDate);
      this.endDate = new Date(this.endDate);
      this.startTime = new Date(this.startTime);
      this.endTime = new Date(this.endTime);
      this.startDate.setHours(this.startTime.getHours());
      this.startDate.setMinutes(this.startTime.getMinutes());
      this.endDate.setHours(this.endTime.getHours());
      this.endDate.setMinutes(this.endTime.getMinutes());
      this.object.startDate = convertDateTimeForSending(this.storageData, this.startDate);
      this.object.endDate = convertDateTimeForSending(this.storageData, this.endDate);
      this.object.subject = this.myForm.get('subject').value;
      this.object.description = this.myForm.get('descrpition').value;
      this.object.supId = 0;
      this.object.docId = JSON.parse(JSON.stringify(this.storageData.getUserId()));

    }
  }
}
