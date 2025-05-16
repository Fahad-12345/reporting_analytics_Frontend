import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder,  Validators } from '@angular/forms';
import { AssignRoomsService } from '../../assign-rooms.service';
import { FrontDeskService } from '../../../../front-desk.service';
import { SubjectService } from '../../subject.service';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { RequestService } from '@appDir/shared/services/request.service';

@Component({
  selector: 'app-doctor-room-list',
  templateUrl: './doctor-room-list.component.html',
  styleUrls: ['./doctor-room-list.component.scss']
})
export class DoctorRoomListComponent implements OnInit {
  meridian = true;
  myForm: FormGroup;
  public isCheckAvailablityOrAllList: boolean = false;
  public Rooms: any = [];
  public tempRooms: any = []
  public loadmoretemparray: any = [];
  public checkArray: any = [{ 'doctor': {} }];
  @Input() tempDoc: any = [];
  public tempTemp: any = [];
  @Input() tempClinics: any = [];
  public isClinicClicked: boolean = false;
  public isShowList: boolean = true;
  public isDoctorClicked: boolean = true;
  public isShowFilter: boolean = false;
  public isShowMore: boolean = true;
  public isShowLess: boolean = true;
  public isShowDocMore: boolean = true;
  public isShowDocLess: boolean = true;
  public isShowfilterarray: boolean = true;
  public isCheckAddMore;
  public isCheckDocAddMore;
  public clinicName;
  public clinicArea;
  public clinicAddress;
  public isCheckShowLess
  public isCheckDocShowLess
  public tempLength;
  public tempDocLength;
  public counter = 0;
  public increment = 0;
  public docCounter = 0;
  public docOffSetMore;
  public track2;
  public length1;
  public offsetMore;
  public track1;
  public length;
  public click: boolean = false;
  public isHide: boolean = true;
  public isCheckDisabled: boolean = false;
  public isShowDocFilter: boolean = false;
  public temptemp: any = [];
  public isShowDoclist: boolean = true;
  public isShowDocFilterList: boolean = true;
  public loadmoredocarray: any = [];
  public isDocCheck: boolean = false;
  public isClinicCheck: boolean = false;
  public isShowCheckArray: boolean = true;
  public docName;
  public docspec
  startdate1 = new Date()
  enddate1 = new Date()
  startTime = new Date();
  endTime = new Date();
  minTime: Date
  public minDate: Date
  public formatString: string = 'HH:mm';
  public interval: number = 30;
  @Output() selectRoom = new EventEmitter();
  @Output() selectDoctor = new EventEmitter();
  @Output() selectClinic = new EventEmitter();
  @Output() callAssign = new EventEmitter();
  @Output() checkAvailabilityDoc = new EventEmitter();

  public clinics: any = [];
  public doctors: any = [];
  public allDoctors: any = [];
  @Output() clearCalendar = new EventEmitter();
  @Output() sendClinicId = new EventEmitter();
  public localStorageId: any;
  public selectedClinicId: any;


  constructor(public formBuilder: FormBuilder,
    public _service: AssignRoomsService,
    protected requestService: RequestService,
    public frontDeskService: FrontDeskService,
    private storageData: StorageData,
    public subject: SubjectService,
    private cdRef: ChangeDetectorRef) {
    this.localStorageId = JSON.stringify(this.storageData.getUserId())
    this.clinicName = '';
    this.clinicArea = '';
    this.clinicAddress = '';
    this.docName = '';
    this.docspec = '';
    this.createForm();
    this.startTime = new Date(this.startdate1);
    this.enddate1.setMinutes(this.enddate1.getMinutes() + 30)
    this.endTime = new Date(this.enddate1);
    this.minTime = new Date(this.startTime);
    if (this.startdate1 === this.enddate1) {
      this.checkArray = this.doctors;
    }
    this.tempClinics = this.clinics;
    this.isHide = false;
    this.minDate = new Date(this.startdate1);
  }
  public isNgonClinic = false
  public isNgonRoom = false
  ngOnInit() {
    this.subject.castRoomChecked.subscribe(res => {
      for (var i = 0; i < this.loadmoretemparray.length; i++) {
        if (this.loadmoretemparray[i].id == res) {
          this.loadmoretemparray[i]['isChecked'] = false;
        }
      }
      for (var i = 0; i < this.Rooms.length; i++) {
        if (this.Rooms[i].id == res) {
          this.Rooms[i]['isChecked'] = false;
        }
      }
    })
    this._service.castRoom.subscribe(
      res => {
        this.Rooms = JSON.parse(JSON.stringify(res));
        this.tempRooms = JSON.parse(JSON.stringify(res));
      })
    this._service.cast.subscribe(res => {
      this.doctors = JSON.parse(JSON.stringify(res));
      this.tempDoc = JSON.parse(JSON.stringify(res));
      this.allDoctors = JSON.parse(JSON.stringify(res))
      this.intializeDocList()
      this.cdRef.markForCheck()
    })
    this._service.castClinics.subscribe(
      res => {
        this.clinics = JSON.parse(JSON.stringify(res))
        if (this.clinics.length != 0) {
          let Id: any;
          const scheduler = this.storageData.getSchedulerInfo()
          if (scheduler.front_desk_assign_rooms_clinics == undefined) {
            this.myForm.controls['clinicName'].setValue(this.clinics[0].id)
            Id = parseInt(this.myForm.controls['clinicName'].value)
          } else {
            let x = JSON.parse(scheduler.front_desk_assign_rooms_clinics)
            this.myForm.controls['clinicName'].setValue(x)
            Id = parseInt(this.myForm.controls['clinicName'].value)
          }
          this.isNgonClinic = true
          this._service.selectedClinicId = Id;
          this._service.selectedClinicName = res
          this.callAssign.emit(Id)
        }
        this.tempClinics = JSON.parse(JSON.stringify(res))

        this.cdRef.markForCheck()
      }
    )

  }

  public changeStartDate() {
    this.minDate = new Date(this.startdate1);
    if (this.startTime == null || this.endTime == null || this.startdate1 == null || this.enddate1 == null) {
      this.isHide = true;
      this.isCheckDisabled = true;
    }
    else {
      if (this.startdate1.getDate() == this.enddate1.getDate() && this.startdate1.getMonth() == this.enddate1.getMonth() && this.startdate1.getFullYear() == this.enddate1.getFullYear()) {
        this.minTime = new Date(this.startTime);
      }
      if (this.startdate1.getDate() > this.enddate1.getDate() || this.startdate1.getMonth() > this.enddate1.getMonth() || this.startdate1.getFullYear() > this.enddate1.getFullYear()) {
        this.enddate1.setDate(this.startdate1.getDate())
        this.enddate1.setMonth(this.startdate1.getMonth())
        this.enddate1.setFullYear(this.startdate1.getFullYear())
        this.minTime = new Date(this.startTime);
      }
      else {
        this.minTime = new Date(this.endTime);
        this.minTime.setHours(0);
        this.minTime.setMinutes(0);
      }
      this.isHide = false;
      this.isCheckDisabled = false;

    }
  }
  public changeEndDate() {
    this.minDate = new Date(this.startdate1);
    if (this.startTime == null || this.endTime == null || this.startdate1 == null || this.enddate1 == null) {
      this.isHide = true;
      this.isCheckDisabled = true;
    }
    else {
      if (this.startdate1.getDate() == this.enddate1.getDate() && this.startdate1.getMonth() == this.enddate1.getMonth() && this.startdate1.getFullYear() == this.enddate1.getFullYear()) {
        this.minTime = new Date(this.startTime);
      }
      else {
        this.minTime = new Date(this.endTime);
        this.minTime.setHours(0);
        this.minTime.setMinutes(0);
      }
      this.isHide = false;
      this.isCheckDisabled = false;
    }
  }
  public changeStartTime() {
    if (this.startTime == null || this.endTime == null || this.startdate1 == null || this.enddate1 == null) {
      this.isHide = true;
      this.isCheckDisabled = true;
    }
    else {
      this.startdate1.setHours(this.startTime.getHours())
      this.startdate1.setMinutes(this.startTime.getMinutes())
      this.enddate1.setHours(this.endTime.getHours())
      this.enddate1.setMinutes(this.endTime.getMinutes())
      this.minTime = new Date(this.startdate1)
      if (this.startdate1.getDate() == this.enddate1.getDate() && this.startdate1.getMonth() == this.enddate1.getMonth() && this.startdate1.getFullYear() == this.enddate1.getFullYear()) {
        this.minTime = new Date(this.startTime);
      }
      else {
        this.minTime.setHours(0);
        this.minTime.setMinutes(0);
      }
      this.isHide = false;
      this.isCheckDisabled = false;

    }
  }
  public changeEndTime() {
    if (this.startTime == null || this.endTime == null || this.startdate1 == null || this.enddate1 == null) {
      this.isHide = true;
      this.isCheckDisabled = true;
    }
    else {
      this.startdate1.setHours(this.startTime.getHours())
      this.startdate1.setMinutes(this.startTime.getMinutes())
      this.enddate1.setHours(this.endTime.getHours())
      this.enddate1.setMinutes(this.endTime.getMinutes())
      this.minTime = new Date(this.startdate1)
      if (this.startdate1.getDate() == this.enddate1.getDate() && this.startdate1.getMonth() == this.enddate1.getMonth() && this.startdate1.getFullYear() == this.enddate1.getFullYear()) {
        this.minTime = new Date(this.startTime);
      }
      else {
        this.minTime.setHours(0);
        this.minTime.setMinutes(0);
      }
      this.isHide = false;
      this.isCheckDisabled = false;

    }
  }
  public clinicClicked() {
    this.isShowCheckArray = true;
    this.isDocCheck = false;
    this.isHide = true;
    this.click = false;
    this.isShowDocFilter = false;
    this.isClinicClicked = true;
    this.isShowFilter = false;
    this.isDoctorClicked = true;
    if ((this.clinicName != '')) {
      this.isShowList = true;
      this.isShowfilterarray = false;
      this.isShowFilter = true;
      this.isClinicCheck = true;

    }
    else if ((this.clinicName === '')) {
      this.isShowList = false;
      this.isClinicCheck = false;
    }
    if (this.counter === 0) {
      this.loadmoretemparray = []
      for (var i = 0; i < this.Rooms.length; i++) {
        if (i < 5) {
          this.loadmoretemparray.push(this.Rooms[i]);
          this.isShowMore = true;
          this.isShowLess = true;
        }
        else {
          this.offsetMore = 5;
          this.isShowMore = false;
          break;
        }
      }
      this.track1 = this.Rooms.length - 1;
      this.counter++;
    }
    this.cdRef.detectChanges()
  }

  public doctorClicked() {
    this.isShowCheckArray = true;
    this.isDoctorClicked = false;
    this.isClinicClicked = false;
    this.click = true;
    this.isShowFilter = false;
    this.isShowList = true;
    this.isShowfilterarray = true;
    this.isClinicCheck = true;
    this.tempDoc = this.doctors;

    if (this.startdate1 === null || this.enddate1 === null) {
      this.isHide = true;
    }
    else {
      this.isHide = false;
    }
    if ((this.docName != '') || (this.docspec != '')) {
      this.isShowDoclist = true;
      this.isShowCheckArray = true;
      this.isShowDocFilterList = false;
      this.isDocCheck = true;
      this.isShowDocFilter = true;

    }
    else if ((this.docName === '') || (this.docspec === '')) {
      if (this.isCheckAvailablityOrAllList === true) {
        this.isShowCheckArray = false;
        this.isShowDoclist = true;
      }
      else {
        this.isShowDoclist = false;
        this.isShowCheckArray = true;
      }
      // this.isShowDoclist = false;
      this.isDocCheck = false;
      this.isShowDocFilterList = true;
    }
    if (this.docCounter === 0) {
      this.loadmoredocarray = []
      for (var i = 0; i < this.doctors.length; i++) {
        if (i < 5) {
          this.loadmoredocarray.push(this.doctors[i]);
          this.isShowDocMore = true;
          this.isShowDocLess = true;
        }
        else {
          this.docOffSetMore = 5;
          this.isShowDocMore = false;
          break;
        }
      }
      this.track2 = this.doctors.length - 1;
      this.docCounter++;
    }
  }
  public checkAvailability() {
    this.startdate1.setSeconds(0)
    this.enddate1.setSeconds(0)
    let newTemp1 = new Date(this.startdate1)
    let newTemp2 = new Date(this.enddate1)
    this.localStorageId = JSON.stringify(this.storageData.getUserId())

    // this.requestService
    //   .sendRequest(
    //     AssignRoomsUrlsEnum.doctorFilter,
    //     'POST',
    //     REQUEST_SERVERS.schedulerApiUrl,
    //     {
    //       'dateRange': [convertDateTimeForSending(this.storageData, newTemp1), convertDateTimeForSending(this.storageData, newTemp2)],
    //       'clinics': [this._service.selectedClinicId]
    //     }
    //   ).subscribe(
    //     (response: HttpSuccessResponse) => {
    //       const facility = this.storageData.getFacilityLocations()
    //       for (let p = 0; p < response.result.data.length; p++) {
    //         for (let x = 0; Array.isArray(response.result.data[p].doctor.specialities) && x < response.result.data[p].doctor.specialities.length; x++) {
    //           for (let j = 0; j < facility.length; j++) {
    //             if (facility[j] === response.result.data[p].doctor.specialities[x].facilityId) {
    //               response.result.data[p].doctor.specialities = response.result.data[p].doctor.specialities[x];
    //               break;
    //             }
    //           }
    //         }
    //       }
    //       this.checkArray = response.result.data;
    //       for (var i = 0; i < this.checkArray.length; i++) {
    //         this.checkArray[i].id = this.checkArray[i].doctor.user_id;
    //         this.checkArray[i]['doctor']['specialities'].color = "#" + this.checkArray[i]['doctor']['specialities'].color;
    //         this.checkArray[i]['isChecked'] = false;
    //       }
    //       this.tempDoc = this.checkArray;
    //       this.isHide = false;

    //       this.loadmoredocarray = [];
    //       this.isShowCheckArray = false;
    //       this.isShowDoclist = true;
    //       this.localStorageId = JSON.stringify(this.storageData.getUserId())
    //       const scheduler = this.storageData.getSchedulerInfo()
    //       let x = JSON.parse(scheduler.front_desk_assign_rooms_doctors)
    //       let y = JSON.parse(scheduler.front_desk_assign_rooms_rooms)
    //       let swap = scheduler.front_desk_assign_rooms_swaps
    //       for (var j = 0; j < this.checkArray.length; j++) {
    //         if (swap) {
    //           if (x.length > 1) {
    //             for (var f = 0; f < x.length; f++) {
    //               if (this.checkArray[j].doctor.user_id == x[f].docId || this.checkArray[j].doctor.user_id == x[f].id) {
    //                 this.checkArray[j]['isChecked'] = x[f]['isChecked'];
    //               }
    //             }
    //           }
    //           else {
    //             if (this.checkArray[j].doctor.user_id == x[0].docId || this.checkArray[j].doctor.user_id == x[0].id) {
    //               this.checkArray[j]['isChecked'] = x[0]['isChecked'];
    //             }
    //           }
    //         }
    //         else {
    //           if (y.length > 1) {
    //             for (var f = 0; f < y.length; f++) {
    //               if (this.checkArray[j].doctor.user_id == y[f].docId || this.checkArray[j].doctor.user_id == y[f].id) {
    //                 this.checkArray[j]['isChecked'] = y[f]['isChecked'];
    //               }
    //             }
    //           }
    //           else {
    //             if (this.checkArray[j].doctor.user_id == y[0].docId || this.checkArray[j].doctor.user_id == y[0].id) {
    //               this.checkArray[j]['isChecked'] = y[0]['isChecked'];
    //             }
    //           }
    //         }

    //       }
    //       this.checkAvailabilityDoc.emit(this.checkArray);
    //       for (var i = 0; i < this.checkArray.length; i++) {
    //         if (i < 5) {
    //           this.loadmoredocarray.push(this.checkArray[i]);
    //           this.isShowDocMore = true;
    //           this.isShowDocLess = true;
    //         }
    //         else {
    //           this.docOffSetMore = 5;
    //           this.isShowDocMore = false;
    //           break;
    //         }
    //       }
    //       this.isCheckAvailablityOrAllList = true;
    //       this.cdRef.detectChanges()
    //     }, error => {
    //       console.log('error', error);
    //     });
    // this.loadmoredocarray=this.loadmoredocarray;
  }
  public loadMoreClinicItems() {
    for (var i = this.offsetMore; i < this.offsetMore + 5; i++) {
      if (this.Rooms[i] != undefined) {
        this.isCheckAddMore = true;
        this.loadmoretemparray.push(this.Rooms[i]);
      }
      else {
        this.isShowMore = true;
        break;
      }
    }
    if (this.isCheckAddMore) {
      this.isShowLess = false;
    }
    this.offsetMore += 5;
    this.length = this.loadmoretemparray.length;
  }
  public checkAvailabilityIntializeList() {

  }
  public loadMoreAvaiableDocItems() {
    for (var i = this.docOffSetMore; i < this.docOffSetMore + 5; i++) {
      if (this.checkArray[i] != undefined) {
        this.isCheckDocAddMore = true;
        if (this.checkArray[i]['doctor']['specialities'].color.includes('#')) { }
        else {
          this.checkArray[i]['doctor']['specialities'].color = "#" + this.checkArray[i]['doctor']['specialities'].color;
        }
        this.loadmoredocarray.push(this.checkArray[i]);
        this.loadmoredocarray = Array.from(new Set(this.loadmoredocarray));
      }
      else {
        this.isShowDocMore = true;
        break;
      }
    }
    if (this.isCheckDocAddMore) {
      this.isShowDocLess = false;
    }
    this.docOffSetMore += 5;
    this.length1 = this.loadmoredocarray.length;
  }

  public ShowLessAvailableDocItems() {
    this.tempDocLength = this.length1 % 5;
    if (this.tempDocLength === 0) {
      for (var i = this.docOffSetMore; i > this.docOffSetMore - 5 && this.checkArray.length; i--) {
        if (this.docOffSetMore > 5) {
          this.isCheckDocShowLess = true;
          this.loadmoredocarray.pop();
        }
        else {
          break;
        }
      }
      if (this.isCheckDocShowLess) {
        this.isShowDocMore = false;
      }
      this.docOffSetMore -= 5;
      if (this.docOffSetMore === 5) {
        this.isShowDocLess = true;
      }
    }
    else {
      for (var o = 0; o < this.tempDocLength; o++) {
        this.loadmoredocarray.pop();
        this.length1--;
      }
      this.docOffSetMore -= 5;
      this.isShowDocMore = false;
      if (this.docOffSetMore === 5) {
        this.isShowDocLess = true;
      }
    }
  }


  public ShowLessClinicItems() {
    this.tempLength = this.length % 5;
    if (this.tempLength === 0) {
      for (var i = this.offsetMore; i > this.offsetMore - 5 && this.Rooms.length; i--) {
        if (this.offsetMore > 5) {
          this.isCheckShowLess = true;
          this.loadmoretemparray.pop();
        }
        else {
          break;
        }
      }
      if (this.isCheckShowLess) {
        this.isShowMore = false;
      }
      this.offsetMore -= 5;
      if (this.offsetMore === 5) {
        this.isShowLess = true;
      }
    }
    else {
      for (var o = 0; o < this.tempLength; o++) {
        this.loadmoretemparray.pop();
        this.length--;
      }
      this.offsetMore -= 5;
      this.isShowMore = false;
      if (this.offsetMore === 5) {
        this.isShowLess = true;
      }

    }
  }

  public loadMoreDocItems() {
    for (var i = this.docOffSetMore; i < this.docOffSetMore + 5; i++) {
      if (this.doctors[i] != undefined) {
        this.isCheckDocAddMore = true;
        this.loadmoredocarray.push(this.doctors[i]);
        this.loadmoredocarray = Array.from(new Set(this.loadmoredocarray));
      }
      else {
        this.isShowDocMore = true;
        break;
      }
    }
    if (this.isCheckDocAddMore) {
      this.isShowDocLess = false;
    }
    this.docOffSetMore += 5;
    this.length1 = this.loadmoredocarray.length;
  }

  public ShowLessDocItems() {
    this.tempDocLength = this.length1 % 5;
    if (this.tempDocLength === 0) {
      for (var i = this.docOffSetMore; i > this.docOffSetMore - 5 && this.doctors.length; i--) {
        if (this.docOffSetMore > 5) {
          this.isCheckDocShowLess = true;
          this.loadmoredocarray.pop();
        }
        else {
          break;
        }
      }
      if (this.isCheckDocShowLess) {
        this.isShowDocMore = false;
      }
      this.docOffSetMore -= 5;
      if (this.docOffSetMore === 5) {
        this.isShowDocLess = true;
      }
    }
    else {
      for (var o = 0; o < this.tempDocLength; o++) {
        this.loadmoredocarray.pop();
        this.length1--;
      }
      this.docOffSetMore -= 5;
      this.isShowDocMore = false;
      if (this.docOffSetMore === 5) {
        this.isShowDocLess = true;
      }
    }
  }

  public showClinicFilter(event) {
    if (event.target.checked) {
      this.isShowFilter = true;
    }
    else {
      this.isShowFilter = false;
    }
    this.clinicName = this.clinicName;
  }
  public showDocFilter(event) {
    if (event.target.checked) {
      this.isShowDocFilter = true;
    }
    else {
      this.isShowDocFilter = false;
    }
    this.docName = this.docName;
    this.docspec = this.docspec;
  }
  public searchRoomByName(event) {
    if ((this.clinicName == '' || this.clinicName == undefined)) {
      this.Rooms = this.Rooms;
      this.isShowList = false;
      this.isShowfilterarray = true;
      return
    }
    else (this.clinicName != '' || this.clinicName != undefined)
    {
      this.clinicName = this.clinicName.toLowerCase();
      let a = this.tempRooms.filter((element) => {
        return element.name.toLowerCase().includes(this.clinicName.toLowerCase())
      });
      this.tempTemp = a;
    }
    this.isShowList = true;
    this.isShowfilterarray = false;
    return
  }
  public Remove() {
    this.isCheckAvailablityOrAllList = false;
    this.startdate1 = null;
    this.enddate1 = null;
    this.startTime = null;
    this.endTime = null;
    this.isHide = true;
    this.isShowCheckArray = true;
    this.isShowDoclist = false;
    this.loadmoredocarray = [];
    this.tempDoc = this.doctors;
    if (this.docName != '' || this.docspec != '') {
      if (this.docName != '') {
        this.searchDocByName(this.docName);
      }
      if (this.docspec != '') {
        this.searchDocBySpec(this.docspec);
      }
    }
    else {
      if (this.checkArray.length != 0) {
        for (var j = 0; j < this.doctors.length; j++) {
          if (this.checkArray.length > 1) {
            for (var f = 0; f < this.checkArray.length; f++) {
              if (this.doctors[j].doctor.user_id == this.checkArray[f].doctor.user_id) {
                this.doctors[j]['isChecked'] = this.checkArray[f]['isChecked'];
              }
              // else
              // {
              //   this.doctors[j]['isChecked'] =false;
              // }
            }
          }
          else {
            if (this.doctors[j].doctor.user_id == this.checkArray[0].doctor.user_id) {
              this.doctors[j]['isChecked'] = this.checkArray[0]['isChecked'];
            }
          }
        }
      }
      for (var i = 0; i < this.doctors.length; i++) {
        if (i < 5) {
          this.loadmoredocarray.push(this.doctors[i]);
          this.isShowDocMore = true;
          this.isShowDocLess = true;
        }
        else {
          this.docOffSetMore = 5;
          this.isShowDocMore = false;
          break;
        }
      }
    }
    this.checkAvailabilityDoc.emit(this.doctors);
    this.track2 = this.doctors.length - 1;
    this.docCounter++;
  }
  public intializeDocList() {
    this.loadmoredocarray = []
    for (var i = 0; i < this.doctors.length; i++) {
      if (i < 5) {
        this.loadmoredocarray.push(this.doctors[i]);
        this.isShowDocMore = true;
        this.isShowDocLess = true;
      }
      else {
        this.docOffSetMore = 5;
        this.isShowDocMore = false;
        break;
      }
      this.cdRef.markForCheck()

    }

  }

  public searchDocByName(event) {
    this.loadmoredocarray = [];
    if ((this.docName == '' || this.docName == undefined) && (this.docspec == '' || this.docspec == undefined)) {
      this.isShowDocFilterList = true;
      if (this.isCheckAvailablityOrAllList === true) {
        this.isShowDoclist = true;
        this.isShowCheckArray = false;
        for (var i = 0; i < this.checkArray.length; i++) {
          if (i < 5) {
            // this.checkArray[i].colorCode = "#" + this.checkArray[i].colorCode
            this.loadmoredocarray.push(this.checkArray[i]);
            this.isShowDocMore = true;
            this.isShowDocLess = true;
          }
          else {
            this.docOffSetMore = 5;
            this.isShowDocMore = false;
            break;
          }
        }
        return
      }
      else {
        this.isShowDoclist = false;
        this.isShowCheckArray = true;
        this.intializeDocList();
        // console.log("loadtemparray",this.loadmoredocarray);

      }
      return;
    }
    if (this.docName === '' || this.docName === undefined) {
      if (this.docspec != '') {
        this.docspec = this.docspec.toLowerCase();
        let a = this.tempDoc.filter((element) => {
          return element.doctor.specialities.name.toLowerCase().includes(this.docspec.toLowerCase())
        });
        this.temptemp = a;
      }
      this.isShowDoclist = true;
      this.isShowCheckArray = true;
      this.isShowDocFilterList = false;
      return
    }
    else {
      this.docName = this.docName.toLowerCase();
      if (this.docspec === '') {
        this.isShowDoclist = true;
        this.isShowDocFilterList = false;
        this.isShowCheckArray = true;

        let d = this.tempDoc.filter((element) => {
          return element.doctor.first_name.toLowerCase().includes(this.docName.toLowerCase())
        });
        this.temptemp = d;
      }
      else if (this.docspec != '') {
        this.docspec = this.docspec.toLowerCase();
        let o = this.tempDoc.filter((element) => {
          return element.doctor.first_name.toLowerCase().includes(this.docName.toLowerCase())
        });
        this.temptemp = o.filter((element) => {
          return element.doctor.specialities.name.toLowerCase().includes(this.docspec.toLowerCase())
        });
      }
      this.isShowDoclist = true;
      this.isShowDocFilterList = false;
      this.isShowCheckArray = true;
    }

  }

  public searchDocBySpec(event) {
    this.loadmoredocarray = [];

    if ((this.docspec === '' || this.docspec === undefined) && (this.docName === '' || this.docName === undefined)) {
      this.isShowDocFilterList = true;
      if (this.isCheckAvailablityOrAllList === true) {
        this.isShowDoclist = true;
        this.isShowCheckArray = false;
        for (var i = 0; i < this.checkArray.length; i++) {
          if (i < 5) {
            this.loadmoredocarray.push(this.checkArray[i]);
            this.isShowDocMore = true;
            this.isShowDocLess = true;
          }
          else {
            this.docOffSetMore = 5;
            this.isShowDocMore = false;
            break;
          }
        }
        return
      }
      else {
        this.isShowDoclist = false;
        this.isShowCheckArray = true;
        this.intializeDocList();
      }

      return;
    }
    if (this.docspec === '' || this.docspec === undefined) {
      if (this.docName != '') {
        this.docName = this.docName.toLowerCase();
        this.temptemp = this.tempDoc.filter((element) => {
          return element.doctor.first_name.toLowerCase().includes(this.docName.toLowerCase())
        });

      }
      this.isShowDoclist = true;
      this.isShowDocFilterList = false;
      this.isShowCheckArray = true;
      return
    }
    else {
      this.docspec = this.docspec.toLowerCase();
      if (this.docName === '') {
        this.isShowDoclist = true;
        this.isShowDocFilterList = false;
        this.isShowCheckArray = true;
        let i = this.tempDoc.filter((element) => {
          return element.doctor.specialities.name.toLowerCase().includes(this.docspec.toLowerCase())
        });
        this.temptemp = i;
      }
      else {
        if (this.docName != '') {
          this.docName = this.docName.toLowerCase();
          let o = this.tempDoc.filter((element) => {
            return element.doctor.first_name.toLowerCase().includes(this.docName.toLowerCase())
          });
          this.temptemp = o.filter((element) => {
            return element.doctor.specialities.name.toLowerCase().includes(this.docspec.toLowerCase())
          });
        }
        this.isShowDoclist = true;
        this.isShowDocFilterList = false;
        this.isShowCheckArray = true;
      }
    }
    this.cdRef.detectChanges()
  }
  public selectClinicS(event) {
    this.clearCalendar.emit("clear")
    this.loadmoretemparray = []
    this.Rooms = []
    this.clinics.filter((element) => {
      element.isChecked = false
    })
    let Id = parseInt(this.myForm.controls['clinicName'].value)
    this._service.selectedClinicId = Id;
    this.sendClinicId.emit(Id)
    const scheduler = this.storageData.getSchedulerInfo()
    scheduler.front_desk_assign_rooms_clinics = JSON.stringify(Id)
    this.storageData.setSchedulerInfo(scheduler)
  }
  public submitFormAndClose() { }
  private createForm() {
    this.myForm = this.formBuilder.group({
      clinicName: ['', Validators.required],
    });
  }
}
