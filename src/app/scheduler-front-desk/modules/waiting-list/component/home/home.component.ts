import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FrontDeskService } from '../../../../front-desk.service';
import { ToastrService } from 'ngx-toastr';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { AclService } from '@appDir/shared/services/acl.service';
import { Router } from '@angular/router';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { RequestService } from '@appDir/shared/services/request.service';
import { HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { AssignSpecialityUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
import { AddToBeSchedulledUrlsEnum } from '@appDir/scheduler-front-desk/modules/add-to-be-scheduled/add-to-be-scheduled-list-urls-enum';
import { WaitingListUrlsEnum } from '../../waiting-list-urls-enum';
import { convertDateTimeForRetrieving, convertDateTimeForSending } from '@appDir/shared/utils/utils.helpers';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent extends PermissionComponent implements OnInit {
  public allData: any = []
  public deleteAll: any = []
  public isEnableButtons: any = true;
  public numSelected = 0;
  public counterChecked = 0;
  public lastPage: any;
  public entriesOnLastPage: any;
  public pageNumber = 1
  public isOpenFilters = true;
  public allChecked = false;
  public deleteObj: any = { 'ids': [] }
  public postObject: any = { 'currentDate': '', 'endDate': '', 'clinicId': {} }
  public assignClinics = [{ id: 0, name: "Location" }]
  public assignSpecialities = [{ id: 0, name: "Specialty" }]
  public assignDoctor = [{ user_id: 0, last_name: "Provider" }]
  public selectedDoc: any = {}
  public assignPriority = [{ id: 0, description: "Priority" }]
  public startDate: Date;
  public endDate: Date;
  public isFilterData: boolean = false;
  public filterData: any = []
  public data: any = []
  myForm: FormGroup;
  public allClinicIds: any;
  public counter: any = 10;
  public delay: any
  intervalID: any;
  constructor(aclService: AclService,
    router: Router,
    protected requestService: RequestService,
    private customDiallogService: CustomDiallogService,
    private toasterService: ToastrService,
    private storageData: StorageData,
    public formBuilder: FormBuilder,
    public frontDeskService: FrontDeskService,) {
    super(aclService, router);
    this.createForm();
  }
  ngOnInit() {
    if (this.aclService.hasPermission(this.userPermissions.schedule_waiting_list_front_desk_view)
      || this.storageData.isSuperAdmin()) {

      this.requestService
        .sendRequest(
          AssignSpecialityUrlsEnum.Speciality_list,
          'POST',
          REQUEST_SERVERS.schedulerApiUrl,
        ).subscribe(
          (specialityRes: HttpSuccessResponse) => {
            specialityRes.result.data.filter(element => {
              this.assignSpecialities.push(element)
            }, error => {
            })
            this.myForm.controls['clinicName'].setValue(this.assignClinics[0].id)
            this.myForm.controls['priorityName'].setValue(this.assignPriority[0].id)
            this.myForm.controls['doctorName'].setValue(this.assignDoctor[0].user_id)
            this.myForm.controls['specialityName'].setValue(this.assignSpecialities[0].id)
          });
      this.allClinicIds = this.storageData.getFacilityLocations()
      this.requestService
        .sendRequest(
          AddToBeSchedulledUrlsEnum.getDoctorsForUsers,
          'POST',
          REQUEST_SERVERS.schedulerApiUrl,
          { 'clinics': this.allClinicIds }
        ).subscribe(
          (res: HttpSuccessResponse) => {
            const facility = this.storageData.getFacilityLocations()
            for (let i = 0; i < res.result.data.length; i++) {
              for (let x = 0; Array.isArray(res.result.data[i].doctor.specialities) && x < res.result.data[i].doctor.specialities.length; x++) {
                for (let j = 0; j < facility.length; j++) {
                  if (facility[j] === res.result.data[i].doctor.specialities[x].facilityId) {
                    res.result.data[i].doctor.specialities = res.result.data[i].doctor.specialities[x];
                    break;
                  }
                }
              }
            }
            for (var i = 0, j = 1; i < res.result.data.length; i++ , j++) {
              this.assignDoctor[j] = res.result.data[i].doctor;
            }
          })
      this.allClinicIds = this.storageData.getFacilityLocations()
      this.requestService
        .sendRequest(
          AssignSpecialityUrlsEnum.Facility_list_Post,
          'POST',
          REQUEST_SERVERS.schedulerApiUrl,
          { 'clinics': this.allClinicIds }
        ).subscribe(
          (res: HttpSuccessResponse) => {
            this.selectedDoc = JSON.parse(JSON.stringify(res.result.data));
            for (var i = 0, j = 1; i < res.result.data.length; i++ , j++) {
              this.assignClinics[j] = res.result.data[i];
            }
            this.myForm.controls['clinicName'].setValue(this.assignClinics[0].id)
            this.startDate.setHours(0);
            this.startDate.setMinutes(0);
            this.endDate.setHours(23);
            this.endDate.setMinutes(59);
            this.getFreeSlotsAndWaiting();
          });
      this.startDate = new Date();
      this.endDate = new Date(this.startDate);
      this.intervalID = setInterval(() => {
        let now = convertDateTimeForRetrieving(this.storageData, new Date());
        for (let p = 0; p < this.data.length; p++) {
          let delayDate = convertDateTimeForRetrieving(this.storageData, new Date(this.data[p].timeStamp))
          // this.delay = parseInt(this.data[p].timeStamp)
          this.delay = delayDate.getTime()
          var diff = now.getTime() - this.delay;
          var diffDays = Math.floor(diff / 86400000); // days
          if (diffDays != 0) {
            diffDays = diffDays * 24
          }
          var diffHrs = Math.floor((diff % 86400000) / 3600000); // hours
          diffHrs = diffDays + diffHrs
          var diffMins = Math.abs(Math.floor(((diff % 86400000) % 3600000) / 60000));
          let totalHourMins;
          if (now < this.delay) {
            totalHourMins = '-' + diffHrs + ' hour' + ':' + diffMins + ' min'
          }
          else {
            totalHourMins = diffHrs + ' hour' + ':' + diffMins + ' min'
          }
          this.data[p]["delay"] = totalHourMins
        }
      }, 1000)
      this.requestService
        .sendRequest(
          WaitingListUrlsEnum.getWaitingListPriority,
          'GET',
          REQUEST_SERVERS.schedulerApiUrl,
        ).subscribe(
          (res: HttpSuccessResponse) => {
            for (var i = 0, j = 1; i < res.result.data.length; i++ , j++) {
              this.assignPriority[j] = res.result.data[i];
            }
          })
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
  /*Get all free slots and waiting list data*/
  public getFreeSlotsAndWaiting() {
    this.postObject.currentDate = convertDateTimeForSending(this.storageData, this.startDate)
    this.postObject.endDate = convertDateTimeForSending(this.storageData, this.endDate)
    let clinics = []
    for (var i = 0; i < this.selectedDoc.length; i++) {
      clinics.push(this.selectedDoc[i].id);
    }
    this.postObject.clinicId = clinics
    this.requestService
      .sendRequest(
        WaitingListUrlsEnum.getAllWaitingListPatientsWithFreeSlots,
        'POST',
        REQUEST_SERVERS.schedulerApiUrl,
        this.postObject
      ).subscribe(
        (res: HttpSuccessResponse) => {
          this.data = res.result.data
          this.numSelected = 0
          this.deleteAll = [];
          this.isEnableButtons = true;
          this.allChecked = false;
          this.lastPage = Math.ceil(this.data.length / this.counter);
          this.entriesOnLastPage = this.data.length % this.counter;
          let now = convertDateTimeForRetrieving(this.storageData, new Date());
          for (let p = 0; p < this.data.length; p++) {
            this.data[p]['isChecked'] = false;
            this.data[p]['id'] = this.data[p]['waitingListId']
            let clinicId = this.data[p].clinicId

            if (this.aclService.hasPermission(this.userPermissions.waiting_list_delete)
              || this.storageData.isSuperAdmin()) {
              this.data[p]['deleteDisable'] = false
            }
            else {
              this.data[p]['deleteDisable'] = true
            }
            var diff = 0;
            let delayDate = convertDateTimeForRetrieving(this.storageData, new Date(this.data[p].timeStamp))
            this.delay = delayDate.getTime()

            if (now.getTime() > this.delay) {
              diff = now.getTime() - this.delay;
            }
            else if (this.delay.getTime() > now.getTime()) {
              diff = this.delay.getTime() - now.getTime();
            }
            var diffDays = Math.floor(diff / 86400000); // days
            if (diffDays != 0) {
              diffDays = diffDays * 24
            }
            var diffHrs = Math.floor((diff % 86400000) / 3600000); // hours
            diffHrs = diffDays + diffHrs
            var diffMins = Math.floor(((diff % 86400000) % 3600000) / 60000); // minutes
            let totalHourMins;
            if (now < this.delay) {
              totalHourMins = '-' + diffHrs + 'hour' + ':' + diffMins + 'min'
            }
            else {
              totalHourMins = diffHrs + 'hour' + ':' + diffMins + 'min'
            }
            this.data[p]["delay"] = totalHourMins
          }
          this.allData = res.result.data;
          for (var i = 0; i < this.data.length; i++) {
            if (this.data[i]['docId'] == null || this.data[i]['docId'] == 0) {
              this.data[i]['docName'] = 'Any';
              this.allData[i]['docName'] = 'Any';
            }
          }
        }, error => {
          this.data = [];
          this.deleteAll = [];
          this.numSelected = 0
          this.isEnableButtons = true;
          this.allChecked = false;
        })
  }
  /*Apply  filters*/
  public applyFilter() {
    this.data = this.allData;
    if (this.myForm.get('specialityName').value != 0) {
      let temporaryOne = []
      for (var i = 0; i < this.data.length; i++) {
        if (this.data[i]['specId'] === parseInt(this.myForm.get('specialityName').value)) {
          temporaryOne.push(this.data[i])
        }
      }
      this.data = temporaryOne
    }
    if (this.myForm.get('doctorName').value != 0) {
      let temporaryOne = []
      for (var i = 0; i < this.data.length; i++) {
        if (this.data[i]['docId'] != null) {
          if (this.data[i]['docId'] === parseInt(this.myForm.get('doctorName').value)) {
            temporaryOne.push(this.data[i])
          }
        }
      }
      this.data = temporaryOne
    }
    if (this.myForm.get('clinicName').value != 0) {
      let temporaryOne = []
      for (var i = 0; i < this.data.length; i++) {
        if (this.data[i]['clinicId'] === parseInt(this.myForm.get('clinicName').value)) {
          temporaryOne.push(this.data[i])
        }
      }
      this.data = temporaryOne
    }
    if (this.myForm.get('priorityName').value != 0) {
      let temporaryOne = []
      for (var i = 0; i < this.data.length; i++) {
        if (this.data[i].waitingListPriorityId === parseInt(this.myForm.get('priorityName').value)) {
          temporaryOne.push(this.data[i])
        }
      }
      this.data = temporaryOne
    }
    for (var i = 0; i < this.data.length; i++) {
      this.data[i]['isChecked'] = false;

    }
    for (var i = 0; i < this.allData.length; i++) {
      this.allData[i]['isChecked'] = false;
    }
    this.deleteObj.ids = [];
    this.isEnableButtons = true;
    this.numSelected = 0;
    this.allChecked = false;
    this.counterChecked = 0;
    this.changeNoOfEntries(this.counter);
  }
  /*Reset  filters*/
  public resetFilters() {
    this.data = this.allData;
    this.deleteObj.ids = [];
    for (var i = 0; i < this.data.length; i++) {
      this.data[i]['isChecked'] = false;
    }
    this.isEnableButtons = true;
    this.allChecked = false;
    this.numSelected = 0;
    this.counterChecked = 0;
    this.myForm.controls['clinicName'].setValue(this.assignClinics[0].id)
    this.myForm.controls['doctorName'].setValue(this.assignDoctor[0].user_id)
    this.myForm.controls['specialityName'].setValue(this.assignSpecialities[0].id)
    this.myForm.controls['priorityName'].setValue(this.assignPriority[0].id)
  }
  /*Delete particular  patient*/
  public deletePatient(data) {
    this.customDiallogService.confirm('Delete','Are you sure you want to delete','Yes','No')
		.then((confirmed) => {
      this.deleteObj.ids = [];
      let ids = []
      if (this.isFilterData === true) {
        ids = this.filterData.filter(element => {
          if (element.waitingListId == data.waitingListId) {
            return element.waitingListId;
          }
        });
        this.deleteObj.ids.push(ids[0].waitingListId)
      }
      else {
        ids = this.data.filter(element => {
          if (element.waitingListId == data.waitingListId) {
            return element;
          }
        });
        this.deleteObj.ids.push(ids[0].waitingListId)
      }
      this.requestService
        .sendRequest(
          WaitingListUrlsEnum.deleteFromWaitingList,
          'POST',
          REQUEST_SERVERS.schedulerApiUrl,
          this.deleteObj
        ).subscribe(
          (res: HttpSuccessResponse) => {
            this.data = this.data.filter(element => {
              if (element.waitingListId != data.waitingListId) {
                return element
              }
            });
            this.toasterService.success("Successfully Deleted", 'Success')
            this.getFreeSlotsAndWaiting();
          }, error => {
            this.data = this.data.filter(element => {
              if (element.waitingListId != data.waitingListId) {
                return element
              }
            });
          });
		
		})
		.catch();

   
  }
  /*Delete all  patient*/
  public deleteAllPatients() {
    if (this.deleteObj.ids.length != 0) {
      this.customDiallogService.confirm('Delete','Are you sure you want to delete','Yes','No')
		.then((confirmed) => {
			if (confirmed){
        this.requestService
            .sendRequest(
              WaitingListUrlsEnum.deleteFromWaitingList,
              'POST',
              REQUEST_SERVERS.schedulerApiUrl,
              this.deleteObj
            ).subscribe(
              (res: HttpSuccessResponse) => {
                this.toasterService.success("Successfully Deleted", 'Success')
                this.getFreeSlotsAndWaiting();
                this.deleteObj.ids = [];
                this.deleteAll = [];
              });
			}else if(confirmed === false){
			}else{
			}
		})
		.catch();

    }
  }
  /*See more and less functionality  filters*/
  public openAndCloseFilters() {
    this.isOpenFilters = !this.isOpenFilters;
  }
  /*No of entries to show in  table*/
  public changeNoOfEntries(e) {
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
  /*Particular patient selected from table to perform  certain action*/
  public particularSelected(data, e) {
    if (e.checked) {
      this.isEnableButtons = false;
      this.numSelected = this.numSelected + 1;
      for (var i = 0; i < this.data.length; i++) {
        if (data.id == this.data[i].id) {
          data.isChecked = true;
          this.data[i]['isChecked'] = true;
          this.deleteObj.ids.push(this.data[i].waitingListId)
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
    }
    else {
      this.numSelected = this.numSelected - 1;
      this.allChecked = false
      if (this.numSelected <= 0) {
        this.isEnableButtons = true;
        this.numSelected = 0;
      }
      for (var i = 0; i < this.data.length; i++) {
        if (data.id == this.data[i].id) {
          data.isChecked = false;
          this.data[i]['isChecked'] = false;
          this.deleteObj.ids.splice(this.deleteAll.indexOf(this.data[i].waitingListId), 1)
          this.counterChecked--;
          break;
        }
      }
    }
  }
  /*All patients selected from table to perform  certain action*/
  public allSelected(e) {
    this.counterChecked = 0;
    if (e.checked) {
      this.isEnableButtons = false;
      this.allChecked = true;
      let start = this.counter * (this.pageNumber - 1);
      for (var i = start; i < (start + this.counter); i++) {
        if (this.data[i] != undefined) {
          if (this.data[i]['isChecked'] == false) {
            this.data[i]['isChecked'] = true;
            this.deleteObj.ids.push(this.data[i].waitingListId)
            this.numSelected++;
            this.counterChecked++;
          }
        }
      }
    }
    else {
      this.allChecked = false;
      let start = this.counter * (this.pageNumber - 1);
      for (var i = start; i < (start + this.counter); i++) {
        if (this.data[i] != undefined) {
          if (this.data[i]['isChecked'] == true) {
            this.data[i]['isChecked'] = false;
            this.deleteObj.ids.splice(this.deleteAll.indexOf(this.data[i].waitingListId), 1)
            this.numSelected--;
            this.counterChecked--;
          }
        }
      }
      if (this.data.length == 0) {
        this.isEnableButtons = true;
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
  }
  /*Change page function*/
  public changePage(e) {
    this.counterChecked = 0;
    this.pageNumber = e.offset + 1;
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
