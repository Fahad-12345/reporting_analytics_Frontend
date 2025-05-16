import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ErxService } from '@appDir/erx/erx.service';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { erx_url } from '../../erx-url.enum';
import { Subscription } from 'rxjs';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { getIdsFromArray, makeDeepCopyArray } from '@appDir/shared/utils/utils.helpers';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-prescriptions-log',
  templateUrl: './prescriptions-log.component.html',
  styleUrls: ['./prescriptions-log.component.scss']
})
export class PrescriptionsLogComponent implements OnInit, AfterViewInit {
  offset: any = 1
  limit: any = 10;
  toDate: any ;
  fromDate: any;
  patientData: string = ""
  taskLogData: any;
  min = new Date('1900/01/01').toISOString().split("T")[0];
  max = new Date().toISOString().split("T")[0];
  updatedTaskLogData: any;
  public isOpenFilters: any = false;
  filterCheck = false;
  deaCodesList:any;
  loadSpin: boolean;
  //filters
  date: any = '';
  orderId: string = '';
  error: any = '';
  type: string='';
  patientName: any = '';
  drugSchedule: any=[];
  medDesc: any = '';
  status: any = null;
  patientIDs:number[]=[];
  subscription:Subscription[] = [];
  @ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('prescriptionLogsList') prescriptionLogsListTable: DatatableComponent;
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
	prescriptionLogsListtingTable: any;


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
    this.getDEAData();
    this.getTaskLog(false);
    this.prescriptionLogsListtingTable = this.localStorage.getObject('prescriptionLogsTableList' + this.storageData.getUserId());
  }

  ngAfterViewInit() {
		if (this.prescriptionLogsListTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.prescriptionLogsListTable._internalColumns]);
			this.columns.forEach(element => {
				if(this.prescriptionLogsListtingTable.length) {
					let obj = this.prescriptionLogsListtingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.prescriptionLogsListtingTable.length) {
				const nameToIndexMap = {};
				this.prescriptionLogsListtingTable.forEach((item, index) => {
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

  onPageChange(event){
	  this.offset = event.offset + 1;
    this.getTaskLog(true);
  }

  getPatientIds()
  {
    this.taskLogData.data.map(e=>{
      let patient=e.patient;
      const [first, last] = this.patientName.split(' ');
      if(patient.last_name && patient.first_name.toLowerCase().includes(first?.toLowerCase())){
        if(!this.patientIDs.includes(patient.id))
        {
          this.patientIDs.push(patient.id);
        }
        
      }
      else if(patient.last_name && patient.last_name.toLowerCase().includes(last?.toLowerCase())){
        if(!this.patientIDs.includes(patient.id))
        {
          this.patientIDs.push(patient.id);
        }
      }
      else if(patient.middle_name && patient.middle_name.toLowerCase().includes(this.patientName?.toLowerCase())){
        if(!this.patientIDs.includes(patient.id))
        {
          this.patientIDs.push(patient.id);
        }
      }
    })
  }

  getDEAData()
  {
    this.requestService.sendRequest(erx_url.dea_code+'?filter=false&page=1&per_page=10&order=DESC&pagination=1&current_location_id=2'
    , 'get',
    REQUEST_SERVERS.fd_api_url)
    .subscribe(res=>{
       if(res.result.data){
      res.result.data.splice(0, 1);
      this.deaCodesList=res.result.data;
      this.deaCodesList.map(res=>{
          res.federal_dea_class_code=res.federal_dea_class_code.toString();
      })     
    }
    });
  }

  resetFilters() {
    this.orderId='';
    this.type='';
    this.patientName='';
    this.drugSchedule=[];
    this.patientIDs=[];
    this.toDate='';
    this.fromDate= '';
    this.getTaskLog(false);
  }

  checkFilterDisability()
  {
   if(this.orderId!='' && this.orderId!=null)
   {
     return false;
   }
   else if(this.type!='' && this.type!=null)
    {
      return false;
    }
    else if(this.patientName!='' && this.patientName!=null )
    {
      return false;
    }
    else if(this.fromDate!='' && this.fromDate !=null)
    {
      return false;
    }
    else if(this.toDate!= '' && this.toDate!=null)
    {
      return false;
    }
    else if( this.drugSchedule.length!=0)
    {
      return false;
    }
    return true;
  }

  exportData()
  {
    let body =
      {
        "offset": this.offset,
        "limit": this.limit,
        "from": moment(moment().format('YYYY-MM-DD')).subtract(30, 'days').format('YYYY-MM-DD'),
        'to': moment().format('YYYY-MM-DD'),
        'isExport':true,
        'prescriberId':this.storageData.getUserId()
      }
      this.loadSpin=true;
      this._service.tasklogExport('', body).subscribe(result=>{
        console.log('result',result);
        this.downloadFile(result);
      },err=>{
        this.loadSpin=false;
      })
  }

  downloadFile(result){
    const blob = new Blob([result], { type: 'text/csv' });
    const url= window.URL.createObjectURL(blob);
    window.open(url);
    this.loadSpin=false;
  }

  getTaskLog(filterCheck, IsExported?) {
    let body;
    if (filterCheck) {
      this.patientIDs=[];
      this.taskLogData = this.updatedTaskLogData ? this.updatedTaskLogData : this.taskLogData;
      if(this.patientName!='') {
        this.getPatientIds();
      }
      body =
      {
        "from":  this.fromDate? this.fromDate:moment(moment().format('YYYY-MM-DD')).subtract(30, 'days').format('YYYY-MM-DD'),
        "to":  this.toDate? this.toDate:moment().format('YYYY-MM-DD'),
        "offset": this.offset,
        "limit":  this.limit,
        "patientIds": this.patientIDs,
        "drugSchedule": this.drugSchedule,
        "typeId": this.type!=null?this.type:null,
        "orderId": this.orderId,
        'prescriberId':this.storageData.getUserId()
      }
      if(this.patientName && this.patientIDs && this.patientIDs.length == 0) {
        delete body['patientIds']
      }
    }
    else if (!filterCheck) {
      body =
      {
        "offset": this.offset,
        "limit": this.limit,
        "from": moment(moment().format('YYYY-MM-DD')).subtract(30, 'days').format('YYYY-MM-DD'),
        'to': moment().format('YYYY-MM-DD'),
        'isExport': IsExported? true:false,
        'prescriberId':this.storageData.getUserId()
      }
    }
    this.loadSpin = true;
    if(filterCheck && !body.hasOwnProperty('patientIds')) {
      this.taskLogData = { data: [] };
      this.loadSpin = false;
      return false
    }
    this._service.tasklog('', body).subscribe((response: any) => {
      if(IsExported)
      {
        window.open(response);
        this.loadSpin=false;
      }
      this.taskLogData = response.tasks;
      if(!filterCheck) {
        this.updatedTaskLogData = this.taskLogData;
      }
      this.loadSpin=false;
    }, err => {
      this.loadSpin=false;
      console.log(err.status);
    });
  }

  limitChange(event) {
    this.offset=1;
    this.limit = event;
    this.getTaskLog(true);
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
			this.localStorage.setObject('prescriptionLogsTableList' + this.storageData.getUserId(), data);
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
		this.prescriptionLogsListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.prescriptionLogsListTable._internalColumns.sort(function (a, b) {
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
