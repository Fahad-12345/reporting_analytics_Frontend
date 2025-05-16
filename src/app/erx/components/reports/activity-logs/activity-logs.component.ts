import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ErxService } from '@appDir/erx/erx.service';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { erx_url } from '../../erx-url.enum';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { getIdsFromArray, makeDeepCopyArray } from '@appDir/shared/utils/utils.helpers';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-activity-logs',
  templateUrl: './activity-logs.component.html',
  styleUrls: ['./activity-logs.component.scss']
})
export class ActivityLogsComponent implements OnInit, AfterViewInit {
  activityLogsData:any;
  toDate: any ;
  fromDate: any;  
  offset: any = 1
  limit: any = 10;
  min = new Date('1900/01/01').toISOString().split("T")[0];
  max = new Date().toISOString().split("T")[0];
  loadSpin: boolean;
  @ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('activityLogsList') activityLogsListTable: DatatableComponent;
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
	activityLogsListtingTable: any;

  
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
    this.getActivityLog(false);
    this.activityLogsListtingTable = this.localStorage.getObject('activityLogsTableList' + this.storageData.getUserId());
  }

  ngAfterViewInit() {
		if (this.activityLogsListTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.activityLogsListTable._internalColumns]);
			this.columns.forEach(element => {
				if(this.activityLogsListtingTable.length) {
					let obj = this.activityLogsListtingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.activityLogsListtingTable.length) {
				const nameToIndexMap = {};
				this.activityLogsListtingTable.forEach((item, index) => {
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

  resetFilters() {
    this.toDate='';
    this.fromDate= '';
    this.getActivityLog(false);
  }
  

  getActivityLog(filterCheck, IsExported?) {
    let body;
    if (filterCheck) {
      
      body =
      {
        "from":  this.fromDate? this.fromDate:moment(moment().format('YYYY-MM-DD')).subtract(30, 'days').format('YYYY-MM-DD'),
        "to":  this.toDate? this.toDate:moment().format('YYYY-MM-DD'),
        "offset": this.offset,
        "limit":  this.limit,
        'user_id':this.storageData.getUserId()
      }
    }
    else if (!filterCheck) {
      body =
      {
        "offset": this.offset,
        "limit": this.limit,
        "from":moment(moment().format('YYYY-MM-DD')).subtract(30, 'days').format('YYYY-MM-DD'),
        'to':  moment().format('YYYY-MM-DD'),
        'user_id':this.storageData.getUserId(),
      }
    }
    this.loadSpin=true;
    this.requestService.sendRequest(erx_url.audit_log, 'get', REQUEST_SERVERS.erx_api_url,body)
            .subscribe((response: any) => {
      if(IsExported)
      {
        window.open(response);
      }
      this.loadSpin=false;
      this.activityLogsData = response.data;
    
      
    }, err => {
      this.loadSpin=false;
    });
  }

  checkFilterDisability()
  {
   
    if(this.fromDate!='' && this.fromDate !=null)
    {
      return false;
    }
    else if(this.toDate!= '' && this.toDate!=null)
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
        'user_id':this.storageData.getUserId(),
        
      }
      let exportParams='?offset=' +
		body.offset +
		'&limit='+body.limit+
		'&from=' +
		body.from +
		'&to=' +
		body.to +
		'&isExport=true' +
		'&user_id=' +
		body.user_id;
    this.loadSpin=true;
     this._service.ActivitylogExport('',exportParams).subscribe(result=>{
    
      this.downloadFile(result);
    }, err => {
      this.loadSpin=false;
    })
  
  }
  
  downloadFile(result){
    const blob = new Blob([result], { type: 'text/csv' });
    const url= window.URL.createObjectURL(blob);
    window.open(url);
    this.loadSpin=false;
  }

  limitChange(event) {
    this.offset=1;
    this.limit = event;
    this.getActivityLog(true);
  }

  onPageChange(event){
	  this.offset = event.offset + 1;
    this.getActivityLog(true);
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
			this.localStorage.setObject('activityLogsTableList' + this.storageData.getUserId(), data);
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
		this.activityLogsListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.activityLogsListTable._internalColumns.sort(function (a, b) {
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
