import { Component, ViewChild, Input, OnDestroy, OnInit, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DeletingIdsService } from './deleting-ids.service';
import { Config } from '../../../../../config/config';
// import {SchedulerSupervisorService} from "../../../../../../../../scheduler-supervisor.service";
import { SelectionModel } from '@angular/cdk/collections';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';

@Component({
  selector: 'app-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.css']
})
export class DatatableComponent implements OnInit {
  public data: any;
  public deleteAll: any;
  public accessToken: any;
  public totalRows: any;
  public isOpenFilters = true;
  public isEnableButtons: any = true;
  public numSelected: any
  selection = new SelectionModel<Element>(true, []);
  public isSelectable: boolean = false;
  public selectAll: any;
  public singleSelection: any = [];
  public select: any;
  public deleteIds: number[];
  public rec_id: any;
  public sepc_id: any;
  public status: any;
  public deleteStatus: any;
  public getAllAppointmentWithRecId: any;
  constructor(
    public http: HttpClient,
    // private SupervisorService : SchedulerSupervisorService,
    private config: Config,
    private storageData: StorageData,
    public _service: DeletingIdsService) {
    this.accessToken = JSON.stringify(this.storageData.getToken())
    this.pickAllAppointmentOfThisSpecId();

  }
  public pickAllAppointmentOfThisSpecId() {
    // this.rec_id=this.SupervisorService.currentDeleteAppointment.recId;
    // this.sepc_id =this.SupervisorService.currentDeleteAppointment.specId;
    // this.SupervisorService.getAllDocAssignment().subscribe(
    //    response=>{
    //      if(response==undefined || response=='' || response==null){
    //       this.deleteStatus=false;
    //       this._service.deleteStatus(this.deleteStatus)
    //     }else{
    //       this.deleteStatus=true;
    //       this._service.deleteStatus(this.deleteStatus)
    //     }
    //      this.data=response
    //    },error=>{
    //      console.log("error " ,error);
    //    }
    // );
  }
  onSelectionChange(event) {
    this.deleteIds = new Array();
    if (event.target.checked) {
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
    this.isSelectable = this.selectAll;
    this._service.editStatus(this.isSelectable)
    this._service.deleteAll = this.deleteIds;
    this._service.assignmentCheck = this.data;
  }



  getId(e, u) {
    var pushCheck;
    var singleSelectionStatus;
    if (this._service.emptyArray == true) {
      this.singleSelection = []
      this._service.emptyArray = false
    }
    if (e.target.checked) {
      if (this.singleSelection.length > 0) {
        for (var k = 0; k < this.singleSelection.length; k++) {

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
    this._service.deleteSelected = this.singleSelection;
    if (this.singleSelection == undefined || this.singleSelection == '' || this.singleSelection == null) {
      singleSelectionStatus = true;
    } else {
      singleSelectionStatus = false;
    }
    this._service.editStatus(!singleSelectionStatus)
  }
  ngOnInit() {
    this._service.cast.subscribe(
      status => this.status = status
    );
    this._service.castDeleteButton.subscribe(
      status => this.deleteStatus = status
    )
    this._service.castArrayOfAppointment.subscribe(
      status => this.data = status
    );
    this._service.castArraySpecId.subscribe(
      status => this.data = status
    )
    this._service.castUpdatedSpec.subscribe(
      status => this.data = status
    )
    this._service.castUpdatedRec.subscribe(
      status => this.data = status
    )


  }
  public masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.data.slice(0, this.totalRows).forEach(row => this.selection.select(row));
  }
  isAllSelected() {
    this.isEnableButtons = false;
    const numSelected = this.selection.selected.length;
    this.numSelected = numSelected;
    const numRows = this.totalRows;
    return numSelected === numRows;
  }

}
