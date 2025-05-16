import { DatePipeFormatService } from './../../../../../shared/services/datePipe-format.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

//service
import { FrontDeskService } from '../../../../front-desk.service'
import { AssignRoomsService } from '../../assign-rooms.service'
import { SubjectService } from '../../subject.service';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { AssignRoomsUrlsEnum } from '../../assign-rooms-urls-enum';
import { AddToBeSchedulledUrlsEnum } from '@appDir/scheduler-front-desk/modules/add-to-be-scheduled/add-to-be-scheduled-list-urls-enum';
import { convertDateTimeForRetrieving, convertDateTimeForSending } from '@appDir/shared/utils/utils.helpers';

@Component({
  selector: 'app-delete-room-assign-modal',
  templateUrl: './delete-room-assign-modal.component.html',
  styleUrls: ['./delete-room-assign-modal.component.scss']
})
export class DeleteRoomAssignModalComponent1 implements OnInit {
  public selectAll: any;
  public otherPage: any = 0;
  public data = []
  public rec: any = false;
  public recId: any
  public isEnableButtons = true
  public numSelected: any = 0
  public counter: any = 10;
  public lastPage: any;
  public entriesOnLastPage: any;
  public counterChecked = 0;
  public pageNumber = 1;
  public selectedRoomId: any
  public ApplyCheck: any = false
  public roomList = []
  public appointmentArray = []
  public roomForDisplay: any
  public clinic: any
  public doctor: any
  public allChecked: any = false
  public diffrenciator: any = "this"
  private localStorageId: any;
  constructor(
    public activeModal: NgbActiveModal,
    public FrontDeskService: FrontDeskService,
    public cdr: ChangeDetectorRef,
    public AssignRoomsService: AssignRoomsService,
    private storageData: StorageData,
    protected requestService: RequestService,
    public _subject: SubjectService, public toastrService: ToastrService,
	public datePipeService:DatePipeFormatService
  ) {
    this.localStorageId = JSON.stringify(this.storageData.getUserId())
    this.roomForDisplay = this.AssignRoomsService.requirementForDeleteModal.room.name

    for (let d = 0; d < this.AssignRoomsService.selectedClinicName.length; d++) {
      if (this.AssignRoomsService.selectedClinicName[d].id == this.AssignRoomsService.selectedClinicId) {
        this.clinic = this.AssignRoomsService.selectedClinicName[d].name
      }
    }
    this.requestService
      .sendRequest(
        AddToBeSchedulledUrlsEnum.getDoctorsForUsers,
        'POST',
        REQUEST_SERVERS.schedulerApiUrl,
        { 'clinics': [this.AssignRoomsService.selectedClinicId] }
      ).subscribe(
        (res: HttpSuccessResponse) => {
          for (let i = 0; i < res.result.data.length; i++) {
            for (let x = 0; Array.isArray(res.result.data[i].doctor.specialities) && x < res.result.data[i].doctor.specialities.length; x++) {
              if (this.AssignRoomsService.selectedClinicId === res.result.data[i].doctor.specialities[x].facilityId) {
                res.result.data[i].doctor.specialities = res.result.data[i].doctor.specialities[x];
                break;
              }
            }
          }
          for (let m = 0; m < res.result.data.length; m++) {
            if (res.result.data[m].docId == this.AssignRoomsService.requirementForDeleteModal.docId) {
              this.doctor = res.result.data[m].doctor.first_name + " " + res.result.data[m].doctor.last_name
            }
          }
        })
    if (this.AssignRoomsService.requirementForDeleteModal.recId == 0 ||
      this.AssignRoomsService.requirementForDeleteModal.recId == null) {
      this.rec = true
      this.recId = true

    }
    this.getAppointmentForRoom()

    var reqObj = {
      "docId": [this.AssignRoomsService.requirementForDeleteModal.docId],
      "startDate": convertDateTimeForSending(this.storageData, new Date(this.AssignRoomsService.requirementForDeleteModal.start)),
      "endDate": convertDateTimeForSending(this.storageData, new Date(this.AssignRoomsService.requirementForDeleteModal.end))
    }
    this.requestService
      .sendRequest(
        AssignRoomsUrlsEnum.getAvailableRoomsForDoctor,
        'POST',
        REQUEST_SERVERS.schedulerApiUrl,
        reqObj
      ).subscribe(
        (res: HttpSuccessResponse) => {
          let result = res.result.data.filter(function (a) {
            var key = a.roomId;
            if (!this[key]) {
              this[key] = true;
              return true;
            }
          }, Object.create(null));


          this.roomList = result
          this.selectedRoomId = this.roomList[0].roomId
        }
      )
  }

  ngOnInit() {
  }
  public submit() {
    var reqObj;
    let roomAssignId = this.AssignRoomsService.requirementForDeleteModal.id
    if (this.diffrenciator == "this") {
      reqObj =
        {
          "id": roomAssignId
        }
    } else {
      reqObj =
        {
          "recId": this.AssignRoomsService.requirementForDeleteModal.recId
        }
    }

    this.requestService
      .sendRequest(
        AssignRoomsUrlsEnum.deleteRoomAssignment,
        'POST',
        REQUEST_SERVERS.schedulerApiUrl,
        reqObj
      ).subscribe(
        (res: HttpSuccessResponse) => {
          this._subject.refreshAssign("delete")
          this.toastrService.success('Successfully Deleted', 'Success')
          this.activeModal.close()
        }
      )

  }

  public assignRoom() {
    let tmp = []
    if (this.AssignRoomsService.deleteAll == undefined || this.AssignRoomsService.deleteAll == '') {
      tmp = JSON.parse(JSON.stringify(this.AssignRoomsService.deleteSelected))
    }
    if (this.AssignRoomsService.deleteSelected == undefined || this.AssignRoomsService.deleteSelected == '') {
      tmp = this.AssignRoomsService.deleteAll
    }
    if ((this.AssignRoomsService.deleteAll == undefined || this.AssignRoomsService.deleteAll == '') &&
      (this.AssignRoomsService.deleteSelected == undefined || this.AssignRoomsService.deleteSelected == '')) {
      return
    } else {
      var req = {
        "appointmentId": tmp,
        "roomId": this.selectedRoomId
      }
      this.requestService
        .sendRequest(
          AssignRoomsUrlsEnum.changeRoomAssignmentOfAppointments,
          'POST',
          REQUEST_SERVERS.schedulerApiUrl,
          req
        ).subscribe(
          (res: HttpSuccessResponse) => {
            if (res.result.data[0].subject) {
              for (let y = 0; y < res.result.data.length; y++) {
                for (let z = 0; z < this.data.length; z++) {
                  if (res.result.data[y].id == this.data[z].id && this.roomForDisplay != res.result.data[y].roomName) {
                    this.data.splice(z, 1)
                  }
                }
              }
              this.allChecked = false
              this.AssignRoomsService.deleteAll = []
              this.AssignRoomsService.deleteSelected = []
              this.singleSelection = []
              for (let n = 0; n < this.data.length; n++) {
                this.data[n].isChecked = false
              }
              if (this.data.length == 0) {
                this.isEnableButtons = true
              }
              this.toastrService.success('Room changed successfully', 'Success')
              this.cdr.detectChanges()
            }

          })

    }
    // this.AssignRoomsService.deleteSelected = []

  }
  public getRoomId(e) {
    for (let i = 0; i < this.roomList.length; i++) {
      if (this.roomList[i].room.name === e.target.value) {
        this.selectedRoomId = this.roomList[i].roomId
      }
    }
  }
  public getAppointmentForRoom() {
    let roomAssignId = this.AssignRoomsService.requirementForDeleteModal.id
    var object;
    if (this.diffrenciator == "this") {
      object = {
        "roomAssignId": roomAssignId
      }
    } else {
      if (this.AssignRoomsService.requirementForDeleteModal.recId != null) {
        object = { "recId": this.AssignRoomsService.requirementForDeleteModal.recId }
      }
    }
    this.requestService
      .sendRequest(
        AssignRoomsUrlsEnum.getAppointmentsForRoomAssign,
        'POST',
        REQUEST_SERVERS.schedulerApiUrl,
        object
      ).subscribe(
        (res: HttpSuccessResponse) => {
          this.numSelected = 0;
          this.isEnableButtons = true;
          this.allChecked = false;
          this.pageNumber = 1;
          this.lastPage = Math.ceil(this.data.length / parseInt(this.counter));
          this.entriesOnLastPage = this.data.length % parseInt(this.counter);
          for (let i = 0; i < res.result.data.length; i++) {
            res.result.data[i]['dateTime'] = convertDateTimeForRetrieving(this.storageData, new Date(res.result.data[i].startDateTime))
            res.result.data[i]['isChecked'] = false

          }
          this.data = res.result.data
          this.lastPage = Math.ceil(this.data.length / parseInt(this.counter));
          this.entriesOnLastPage = this.data.length % parseInt(this.counter);
          this.numSelected = 0
        })
  }
  public deleteIds: any = []
  onSelectionChange(event) {
    this.deleteIds = new Array();
    if (event.target.checked) {
      this.allChecked = true
      for (var i = 0; i < this.data.length; i++) {
        this.data[i].isChecked = true;
        this.deleteIds[i] = this.data[i].id;
      }
    }
    else {
      for (var i = 0; i < this.data.length; i++) {
        this.data[i].isChecked = false;

      }
    }
    this.AssignRoomsService.deleteAll = this.deleteIds;
  }



  public thisAssignment(e) {
    if (e.target.checked) {
      this.diffrenciator = "this"
      this.getAppointmentForRoom()
    }
  }
  public allSubsequent(e) {
    if (e.target.checked) {
      this.diffrenciator = "All"
      this.getAppointmentForRoom()
    }
  }
  public singleSelection: any = []
  public getId(e, u) {
    var pushCheck;
    var pushed;
    if (e.checked) {
      this.isEnableButtons = false;
      this.numSelected = this.numSelected + 1;

      for (var i = 0; i < this.data.length; i++) {
        if (u.id == this.data[i].id) {
          u.isChecked = true;
          this.data[i]['isChecked'] = true;
          this.counterChecked++;
          break;
        }
      }
      if (this.pageNumber == this.lastPage && this.counterChecked == this.entriesOnLastPage && this.entriesOnLastPage != 0) {
        this.allChecked = true;
      }
      else if (this.counterChecked == this.counter || this.data.length == this.counterChecked) {
        this.allChecked = true;
      }
      else {
        this.allChecked = false
      }
      if (this.singleSelection.length > 0) {
        for (var k = 0; k < this.data.length; k++) {

          if (pushCheck = this.singleSelection.includes(u.id)) {
          } else {
            this.singleSelection.push(u.id);
          }
        }
      }
      else {
        this.singleSelection.push(u.id);
      }
      u.isChecked = true;

    }
    else {
      this.numSelected = this.numSelected - 1;
      this.allChecked = false
      if (this.numSelected <= 0) {
        this.isEnableButtons = true;
        this.numSelected = 0;
      }
      for (var i = 0; i < this.data.length; i++) {
        if (u.id == this.data[i].id) {
          u.isChecked = false;
          this.data[i]['isChecked'] = false;
          this.counterChecked--;
          break;
        }
      }
      if (this.singleSelection.length == 1) {
        this.singleSelection.pop(u.id);
      } else if (u.id == this.singleSelection[this.singleSelection.length - 1]) {
        this.singleSelection.pop(u.id);
      }
      else {
        for (var i = 0; i < this.singleSelection.length - 1; i++) {
          if (this.singleSelection[i] == u.id) {
            this.singleSelection.splice(i, 1);
          }
        }
      }
      u.isChecked = false;
    }
    this.AssignRoomsService.deleteSelected = JSON.parse(JSON.stringify(this.singleSelection));

  }

  public allSelected(e) {
    this.counterChecked = 0;
    if (e.checked) {
      this.deleteIds = new Array();
      this.isEnableButtons = false;
      this.allChecked = true;
      let start = this.counter * (this.pageNumber - 1);
      for (var i = start; i < (start + this.counter); i++) {
        if (this.data[i] != undefined) {
          if (this.data[i]['isChecked'] == false) {
            this.data[i]['isChecked'] = true;
            this.deleteIds[this.numSelected] = this.data[i].id;
            this.numSelected++;
            this.counterChecked++;
          }
        }
      }
    }
    else {
      this.allChecked = false;
      this.deleteIds = [];
      let start = this.counter * (this.pageNumber - 1);
      for (var i = start; i < (start + this.counter); i++) {
        if (this.data[i] != undefined) {
          if (this.data[i]['isChecked'] == true) {
            this.data[i]['isChecked'] = false;
            this.numSelected--;
            this.counterChecked--;
          }
        }
      }
      for (var i = 0; i < this.data.length; i++) {
        if (this.data[i]['isChecked'] == true) {
          this.isEnableButtons = false;
          break;
        }
        else {
          this.isEnableButtons = true;
        }
      }
    }
    this.AssignRoomsService.deleteAll = this.deleteIds;

  }
  public checkRows(e) {
    this.counter = e;
    this.counter = parseInt(this.counter);
    this.lastPage = Math.ceil(this.data.length / this.counter);
    this.entriesOnLastPage = this.data.length % this.counter;
    if (this.counter >= this.data.length) {
      this.pageNumber = 1;
    }
    else {
      if (this.lastPage <= this.pageNumber) {
        this.pageNumber = this.lastPage;
      }
      else {
        this.pageNumber = this.pageNumber;
      }
      // this.pageNumber = this.otherPage
      this.counterChecked = 0;
      this.allChecked = false;
      if (this.numSelected > 0) {
        this.isEnableButtons = false;
      }
      else {
        this.isEnableButtons = true;
      }
      let start = this.counter * (this.pageNumber - 1);
      for (var i = start; i < (this.counter + start); i++) {
        if (this.data[i] != undefined) {
          if (this.data[i]['isChecked'] == true) {
            this.counterChecked++;
          }
        }
      }
      if (this.pageNumber == this.lastPage && this.counterChecked == this.entriesOnLastPage && this.entriesOnLastPage != 0) {
        this.allChecked = true;
      }
      else if (this.counterChecked == this.counter || this.data.length == this.counterChecked) {
        this.allChecked = true;
      }
      else {
        this.allChecked = false
      }
    }

  }
  public pageEvent(e) {
    this.counterChecked = 0;
    this.pageNumber = e.offset + 1;
    this.otherPage = e.offset + 1;
    this.allChecked = false;
    if (this.numSelected > 0) {
      this.isEnableButtons = false;
    }
    else {
      this.isEnableButtons = true;
    }
    let start = this.counter * (this.pageNumber - 1);
    for (var i = start; i < (this.counter + start); i++) {
      if (this.data[i] != undefined) {
        if (this.data[i]['isChecked'] == true) {
          this.counterChecked++;
        }
      }
    }
    if (this.pageNumber == this.lastPage && this.counterChecked == this.entriesOnLastPage && this.entriesOnLastPage != 0) {
      this.allChecked = true;
    }
    else if (this.counterChecked == this.counter || this.data.length == this.counterChecked) {
      this.allChecked = true;
    }
    else {
      this.allChecked = false
    }
  }

}
