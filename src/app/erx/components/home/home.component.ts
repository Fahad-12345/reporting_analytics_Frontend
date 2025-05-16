import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { ErxService } from '@appDir/erx/erx.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { erx_url } from '../erx-url.enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import * as moment from 'moment';
import { Subject, Subscription } from 'rxjs';
import { environment } from 'environments/environment';
import { E } from '@angular/cdk/keycodes';
import { getIdsFromArray, makeDeepCopyArray, unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
import { SignatureURLEnum } from '@appDir/shared/signature/SignatureURLEnums.enum';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-home-erx',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() patientEmit = new EventEmitter();
  @Input() refresh: Subject<boolean> = new Subject<boolean>();
  subscription: Subscription[] = [];
  viewSummaryCheck: any = false
  @Input() patientIn: any;
  caseIn: any;
  public isOpenFilters: any = false;
  taskListData: any = [];
  totalCount: any = [];
  offset: any = 1
  limit: any = 10;
  // filters
  date: any = '';
  caseId: any = '';
  error: any = '';
  type: any = '';
  patientName: any = '';
  medDesc: any = '';
  status: any = '';
  loadSpin: boolean;
  visitDate: any ;
  @ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('taskList') taskListTable: DatatableComponent;
	customizedColumnComp: CustomizeColumnComponent;
	@ViewChild(CustomizeColumnComponent) set con(con: CustomizeColumnComponent) {
		if (con) { // initially setter gets called with undefined
		  this.customizedColumnComp = con;
		}
	}
	modalCols :any[] = [];
	columns: any[] = [];
	alphabeticColumns:any[] =[];
	colSelected: boolean = true;
	isAllFalse: boolean = false;
	taskListtingTable: any;

  
  constructor(
    private toastrService: ToastrService, 
    private activatedRoute: ActivatedRoute,
    private storageData: StorageData, 
    public _service: ErxService, 
    public _router: Router, 
    protected requestService: RequestService,
		private localStorage: LocalStorage
    ) { }

  ngOnInit() {
    this._service.redirectfrom= '';
    this._service.med_id= [];
    this._service.updated=false;
    this._service.denyChange=false;
    this._service.neededReadySign=0;
    this._service.readySigned=false;
    this._service.data={};
    this.refresh.subscribe(response => {
      if (response) {
        // Or do whatever operations you need.
        this.caseIn = null
        this.activatedRoute.snapshot.pathFromRoot.forEach((path) => {
          if (path && path.params && path.params.caseId) {
            if (!this.caseIn) {
              this.caseIn = path.params.caseId;
            }
          }
        });
        this._service.data = { 'task_list': true }
        this._service.erxCheck = 0
        this.taskList();
      }
    })
    this.caseIn = null
    this.activatedRoute.snapshot.pathFromRoot.forEach((path) => {
      if (path && path.params && path.params.caseId) {
        if (!this.caseIn) {
          this.caseIn = path.params.caseId;
        }
      }
    });
    this._service.data = { 'task_list': true }
    this._service.erxCheck = 0
    this.taskList();
    this.taskListtingTable = this.localStorage.getObject('taskTableList' + this.storageData.getUserId());
  }

  ngAfterViewInit() {
		if (this.taskListTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.taskListTable._internalColumns]);
			this.columns.forEach(element => {
				if(this.taskListtingTable.length) {
					let obj = this.taskListtingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.taskListtingTable.length) {
				const nameToIndexMap = {};
				this.taskListtingTable.forEach((item, index) => {
					nameToIndexMap[item?.header] = index;
				});
				this.columns.sort((a, b) => nameToIndexMap[a?.name] - nameToIndexMap[b?.name]);
			}
			let columns = makeDeepCopyArray(this.columns);
			this.alphabeticColumns = columns.sort(function (a, b) {
				if (a.name < b.name) { return -1; }
				if (a.name > b.name) { return 1; }
				return 0;
			});
			this.onConfirm(false);
		}
	}

  taskListRoute(pId) {
    let body =
    {
      "offset": this.offset,
      "limit": this.limit,
      "prescriberId": this.storageData.getUserId(),
      "typeId": this.type == '' ? null : this.type,
      "statusId": this.status == '' ? null : this.status,
      "patientIds": this.patientIn ? [this.patientIn] : pId,
      "medName": this.medDesc,
      "caseId": this.caseIn ? this.caseIn : this.caseId == "" ? null : this.caseId,
      "visitDate":  this.visitDate
    }
    const tempData = JSON.parse(localStorage.getItem('cm_data'));
    if(tempData.role.can_finalize==0 && tempData.role.has_supervisor==1)
    {
      body['isDelegator']=true;
    }
    this.loadSpin=true;
    this._service.tasklist('', body).subscribe((response: any = []) => {
      this.loadSpin=false;
      this.taskListData = response.result;
    }, err => {
      this.loadSpin=false;

    });
  }

 taskList() {
    let pId = []
    if (this.patientName != "") {
      let param = {
        filter: true,
        per_page: 10,
        page: 1,
        pagination: 1,
        name: this.patientName
      }
      this.loadSpin=true;
      this.subscription.push(
        this.requestService
					.sendRequest(
						erx_url.patient_search,
						'get',
						REQUEST_SERVERS.kios_api_path,
            param
					)
					.subscribe((res) => {
            this.loadSpin=false;

          let data = res['result']['data'];
          
          for (let i = 0; i < data.length; i++) {
              pId.push(data[i].id)
          }
        
          this.taskListRoute(pId)
          },err=>{
            this.loadSpin=false;
          })
      )
    } else {
      this.taskListRoute(pId)
    }
  }

  onPageChange(event) {
   
    this.offset = event.offset + 1;
    this.taskList();
  }

  limitChange(event) {
    this.limit = event;
    this.taskList();
  }

  ChangeDate(e) {
    this.date = e.value
  }

  resetFilters() {
    this.date = '';
    this.caseId = '';
    this.error = '';
    this.type = '';
    this.patientName = '';
    this.medDesc = '';
    this.status = '';
    this.visitDate='';
    this.taskList()
  }

  checkResetDisability()
  {
    if(this.date == '' && this.caseId == '' && this.error == '' && this.type == '' && this.medDesc == '' &&  this.patientName == '' && this.status=='' && this.visitDate=='')
    {
        return true
    }
    return false;
  }

  openPdf(value) {
    let url = value;
    const idUsingSubstring = url.substring(url.lastIndexOf('=') + 1);
    let param: any = {
      file_ids: [parseInt(idUsingSubstring)]
    }
    this.subscription.push(
      this.requestService
      .sendRequest(
        SignatureURLEnum.tempSingturUrlPreDefined,
        'GET',
        REQUEST_SERVERS.document_mngr_api_path,
        param
      ).subscribe(res => {
        if(res?.data?.[0]?.pre_signed_url) {
          window.open(res?.data?.[0]?.pre_signed_url);
        }
      },
      (error) => {
        this.toastrService.error('Something went wrong.', 'Failed');
      })
    )
	}

  viewTaskDetails(status, id, value) {
    if (status == 'Pending' || status == 'Complete' || status == 'Verified' || status == 'Acknowledged'
      || status == 'Error' || status == 'Dispensed' || status == 'Not Dispensed' || status == 'Transferred'
       || status == 'Partially Dispensed' || value?.type_id == 5 || value?.type_id == 4 || value?.type_id == 3) {
      this._service.redirectfrom = 'erx';
      this._service.taskid = id;
      this.viewSummaryCheck = true
    }
    else {
      this._service.taskid = id;
      if (!this.patientIn) this._router.navigate([this._router.url + '/prescribe'])
      else this.patientEmit.emit('prescribe')
    }
  }

  taskDetail() {
    let body =
    {
      "taskId": 1
    };
    this.loadSpin=true;
    this._service.taskdetail('', body).subscribe((response: any = []) => {
      this.loadSpin=false;
    
    }, err => {
      this.loadSpin=false;
    });
  }

  taskDelete(taskid) {
  
    let task = this.taskListData.data.find(res => res.task.id == taskid);
    
    let body = { "taskId": taskid };
    this.loadSpin=true;
    this._service.taskdelete('', body).subscribe((response: any = []) => {
      this.loadSpin=false;
      if (response.status == 200) {
        
          let data = {
            "status_id": 1,
            "user_id": task.prescriber.id,
            "action_id": 8,
            "task_id": task.task.id,
            "prescriber_id": task.prescriber.id
          }



          this._service.prescriptionEventLogs(data).subscribe((response: any) => {
          
          });
        }
        this.toastrService.success('Deleted Successfully', 'Success');
        this.taskList();
      
    }, err => {
      this.loadSpin=false;
      let data = {
        "status_id": 2,
        "user_id": task.prescriber.id,
        "action_id": 8,
        "task_id": task.task.id,
        "prescriber_id": task.prescriber.id
      }

      
      this._service.prescriptionEventLogs(data).subscribe((response: any) => {
      
      });
    
    });
  }

  viewSummaryFun(e) {
    this.viewSummaryCheck = false
    this.taskList()
  }

  checkRemoveDisabilty(value)
  {
    if(value.status=='Draft')
    {
      return false;
    }
    else if(value.action=='Printed')
    {
      return false;
    }
    return true;
  }

  checkRemoveDisabiltyColor(value)
  {
    if(value.status=='Draft')
    {
      return true;
    }
    else if(value.action=='Printed')
    {
      return true;
    }
    return false;
  }

  ngOnDestroy(): void {
		unSubAllPrevious(this.subscription);
	}

  openCustomoizeColumn(CustomizeColumnModal) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal-lg-package-generate',
		};
		this.modalCols = [];
		let self = this;
		this.columns.forEach(element => {
			let obj = self.alphabeticColumns.find(x => x?.name === element?.name);
			if(obj) {
				this.modalCols.push({ header: element?.name, checked: obj?.checked });
			}
		});
		this.CustomizeColumnModal.show();
	}

	onConfirm(click) {
		if (this.isAllFalse && !this.colSelected){
			this.toastrService.error('At Least 1 Column is Required.','Error');
			return false;
		}
		if(click) {
			this.customizedColumnComp;
			this.modalCols = makeDeepCopyArray(this.customizedColumnComp?.modalCols)
			let data: any = [];
			this.modalCols.forEach(element => {
				if(element?.checked) {
					data.push(element);
				}
				let obj = this.alphabeticColumns.find(x => x?.name === element?.header);
				if (obj) {
					if (obj.name == element.header) {
						obj.checked = element.checked;
					}
				}
			});
			this.localStorage.setObject('taskTableList' + this.storageData.getUserId(), data);
		}
		let groupByHeaderCol = getIdsFromArray(this.modalCols, 'header'); // pick header
		this.columns.sort(function (a, b) {
			return groupByHeaderCol.indexOf(a.name) - groupByHeaderCol.indexOf(b.name);
		});
		//set checked and unchecked on the base modal columns in alphabeticals columns
		this.alphabeticColumns.forEach(element => {
		let currentColumnIndex = findIndexInData(this.columns, 'name', element.name)
			if (currentColumnIndex != -1) {
				this.columns[currentColumnIndex]['checked'] = element.checked;
				this.columns = [...this.columns];
			}
		});
		// show only those columns which is checked
		let columnsBody = makeDeepCopyArray(this.columns);
		this.taskListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.taskListTable._internalColumns.sort(function (a, b) {
			return groupByHeader.indexOf(a.name) - groupByHeader.indexOf(b.name);
		});
		window.dispatchEvent(new Event('resize'));
		this.CustomizeColumnModal.hide();
	}

	onCancel() {
		this.CustomizeColumnModal.hide();
	}

	onSelectHeaders(isChecked) {
		this.colSelected = isChecked;
		if(!isChecked) {
			this.isAllFalse = true;
		}
	}

	onSingleSelection(isChecked) {
		this.isAllFalse = isChecked;
		if(isChecked) {
			this.colSelected = false;
		}
	}
  
}
