
import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { ToastrService } from 'ngx-toastr';
import { REQUEST_SERVERS } from '../../../../../request-servers.enum';
import { RequestService } from '../../../../../shared/services/request.service';
import { reportsUrlsEnum } from '../../../report.enum';

import * as moment from 'moment';
import { Subscription, take } from 'rxjs';

import {
  NgxDataTable,
} from '@appDir/shared/modules/ngx-datatable-custom/models/deliveries-ngx-datatable.models';

import { SelectionModel } from '@angular/cdk/collections';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AnalyticsService } from '@appDir/analytics/analytics.service';
import { AnalyticsUrlsEnum } from '@appDir/analytics/helpers/analytics_Urls_enum';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { VisitSummeryReportFilterFieldModel } from '@appDir/shared/filter/model/visit-report-summary-filter.model';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { getIdsFromArray, makeDeepCopyArray, removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ModalDirective } from 'angular-bootstrap-md';
import * as $ from 'jquery';
import {
  NF2_LIST_REPORTS,
  filterConfig,
} from '../../../constant/constants';
import { ReportsService } from '../../../reports.service';
import { removeEmptyKeysFromObject } from '../../../shared/helper';

@Component({
	selector: 'app-visit-report',
	templateUrl: './visit-summery-report.component.html',
	styleUrls: ['./visit-summery-report.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VisitSummeryReportComponent implements OnInit, OnDestroy {
  reorderable: boolean = true;
  loadingIndicator: boolean = true;
  createdDeliveriesTableConf: NgxDataTable;
  @ViewChild('CustomizeColumnModal') CustomizeColumnModal: ModalDirective;
  @ViewChild('visitReportTable') visitReportTable: DatatableComponent;
  customizedColumnComp: CustomizeColumnComponent;
  alphabeticColumns: any[] = [];
  isAllFalse: boolean;
  colSelected: any;
  visitReportsListingTableList: any[] = [];
  url: any;
  @ViewChild(CustomizeColumnComponent) set con(con: CustomizeColumnComponent) {
    if (con) { // initially setter gets called with undefined
      this.customizedColumnComp = con;
    }
  }
  modalCols: any[] = [];
  cols: any[] = [];
  filter: string[];
  showFilterFiled: VisitSummeryReportFilterFieldModel;
  rowData;
  subsription: Subscription;
  selectedReports = [];
  selectedPracticeLocation = [];
  selectedUniquePracticeLocation = [];
//   summary report
  groupby : number = 1;
  totalVisits : number = 0;
  filterResponse: any;
  practiceLocations : any;
  caseTypes : any[];
  providers : any[];
  specialities : any[];
  visitTypes : any[];
//   End summary report

  public loadSpin: boolean = false;

  reportSelection: any = new SelectionModel<Element>(true, []);
  reportsTotalRows: number;
  selectedCasePomPopUp: any;
  isSelectedLocationPopSaveDisabled = true;
  isMultiplePractice = false;
  getResultForMultiplePracticeParam;
  mulitpleObjects = [];
  filterParam: any;
  subscription: Subscription[] = [];
  constructor(private toastrService: ToastrService, private storageData: StorageData, public reportService: ReportsService, private modalService: NgbModal, private toaster: ToastrService, public datePipeService: DatePipeFormatService, private _route: ActivatedRoute, private _router: Router,
    public requestService: RequestService,private analyticsService : AnalyticsService,
    private location: Location, private router: Router, private localStorage: LocalStorage) {
    this.subsription = new Subscription();

  }

  ngOnInit() {
	this.getReportFilters();
    this.url = this.router.url.split('/')[2].split('?')[0];
    this.filter = filterConfig;
    // this.subsription.add(
    //   this._route.queryParams.subscribe((params) => {
	// 	console.log("paramssss",params)
    //     this.fetchReportsData({...params});
    //   }),
    // );
    if (this.url == 'visit-summery') {
      this.visitReportsListingTableList = this.localStorage.getObject('visitReportsTableList' + this.storageData.getUserId());
	  this.showFilterFiled = new VisitSummeryReportFilterFieldModel();
    }
    else if (this.url == 'visit-detail') {
      this.visitReportsListingTableList = this.localStorage.getObject('visitReportsTableList' + this.storageData.getUserId());
      
    }
  }
  ngAfterViewInit() {
    if (this.visitReportTable?._internalColumns) {
      this.cols = makeDeepCopyArray([...this.visitReportTable._internalColumns]);
      this.cols.forEach(element => {
        if (this.visitReportsListingTableList?.length) {
          let obj = this.visitReportsListingTableList.find(x => x?.header === element?.name);
          obj ? element['checked'] = true : element['checked'] = false;
        }
        else {
          element['checked'] = true;
        }
      });
      if (this.visitReportsListingTableList?.length) {
        const nameToIndexMap = {};
        this.visitReportsListingTableList.forEach((item, index) => {
          nameToIndexMap[item?.header] = index;
        });
        this.cols.sort((a, b) => nameToIndexMap[a?.name] - nameToIndexMap[b?.name]);
      }
      let cols = makeDeepCopyArray(this.cols);
      this.alphabeticColumns = cols.sort(function (a, b) {
        if (a.name < b.name) { return -1; }
        if (a.name > b.name) { return 1; }
        return 0;
      });
      this.onConfirm(false);
    }
  }

  applyFilter(params) {

    this.filterParam = removeEmptyKeysFromObject(params.value);
    const url = NF2_LIST_REPORTS;
    const data = { ...this.filterParam }
	if(data.group_by_id == 1 || data.group_by_id == 2 || data.group_by_id == 3){
	this.groupby = data.group_by_id;
	}
	// if (data.case_type_ids) {
	// 	for (let i = 0; i < data.case_type_ids.length; i++) {
	// 	  const idToMatch = data.case_type_ids[i];
	// 	  const matchedCaseType = this.filterResponse.case_types.find((caseType) => caseType.id === idToMatch);
	  
	// 	  if (matchedCaseType) {
	// 		this.caseTypes.push(matchedCaseType.name);
	// 	  }
	// 	}
	//   }
	//   if (data.practice_locations_ids) {
	// 	for (let i = 0; i < data.practice_locations_ids.length; i++) {
	// 	  const idToMatch = data.practice_locations_ids[i];
	// 	  const matchedLocation = this.filterResponse.practice_locations.find((location) => location.id === idToMatch);
	  
	// 	  if (matchedLocation) {
	// 		this.practiceLocations.push(matchedLocation.name);
	// 	  }
	// 	}
	//   }
	//   if (data.speciality_ids) {
	// 	for (let i = 0; i < data.speciality_ids.length; i++) {
	// 	  const idToMatch = data.speciality_ids[i];
	// 	  const matchedSpeciality = this.filterResponse.specialities.find((speciality) => speciality.id === idToMatch);
	  
	// 	  if (matchedSpeciality) {
	// 		this.specialities.push(matchedSpeciality.name);
	// 	  }
	// 	}
	//   }
	//   if (data.doctor_ids) {
	// 	for (let i = 0; i < data.doctor_ids.length; i++) {
	// 	  const idToMatch = data.doctor_ids[i];
	// 	  const matchedDoctor = this.filterResponse.providers.find((doctor) => doctor.id === idToMatch);
	  
	// 	  if (matchedDoctor) {
	// 		this.providers.push(matchedDoctor.name);
	// 	  }
	// 	}
	//   }
	//   console.log("yesssssssssssssss",this.practiceLocations,this.specialities, this.providers, this.caseTypes)
	

    this.fetchReportsData(data);
  }
  openCustomoizeColumn() {
    const ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      windowClass: 'modal-lg-package-generate',
    };
    this.modalCols = [];
    let self = this;
    this.cols.forEach(element => {
      let obj = self.alphabeticColumns.find(x => x?.name === element?.name);
      if (obj) {
        this.modalCols.push({ header: element?.name, checked: obj?.checked });
      }
    });
    this.CustomizeColumnModal.show();
  }
  resetButtonHandler() {
    this.filterParam = {};
	this.rowData = []

  }
  getReportFilters() {
    this.subsription.add(
      this.analyticsService.get(AnalyticsUrlsEnum.report_filters)
        .subscribe(
          (res: any) => {
            console.log(res,'responseeeee')
            let data = res && res.result ? res.result.data : null;
            if(data){
              this.filterResponse = data[0]
			  console.log("My response",this.filterResponse)
            }
          },
          (err) => {
          },
        ),
    );
  }

  fetchReportsData(filterParam?) {
    this.loadSpin = true;
    const filterData = { ...filterParam };
    this.addUrlQueryParams(removeEmptyAndNullsFormObject(filterParam));
    this.subsription.add(
      this.analyticsService.post(AnalyticsUrlsEnum.visit_summery_report,filterData).subscribe((data) => {
        this.loadSpin = false;
	
        this.rowData = data['result'].data ? [...data['result'].data] : [];
		this.totalVisits = Number(this.rowData[0].total_visits);
		let tempSpec = this.rowData[0].speciality; 
		if(this.groupby == 1){
		for (let i = 1; i < this.rowData.length ; i++) {
			this.totalVisits += Number(this.rowData[i].total_visits);
			if (tempSpec === this.rowData[i].speciality) {
				this.rowData[i].speciality = '';
			} else{
				tempSpec = this.rowData[i].speciality;
			}
		}}else if(this.groupby == 2){
		let tempProv = Number(this.rowData[0].provider); 
		
		for (let i = 1; i < this.rowData.length ; i++) {
			this.totalVisits += Number(this.rowData[i].total_visits);
			if (tempProv === this.rowData[i].provider) {
				this.rowData[i].provider = '';
			} else{
				tempProv = this.rowData[i].provider;
			}
		}}
		else if(this.groupby == 3){
		let tempStat = this.rowData[0].visitstatus;
		for (let i = 1; i < this.rowData.length ; i++) {
			this.totalVisits += Number(this.rowData[i].total_visits);
			if (tempStat === this.rowData[i].visitstatus) {
				this.rowData[i].visitstatus = '';
			} else{
				tempStat = this.rowData[i].visitstatus;
			}	
		  }}
		console.log("Row Data",this.rowData)
        this.reportSelection.clear();
        setTimeout(() => {
          $('datatable-body').scrollLeft(1);
        }, 50);
      },
        err => {
          this.loadSpin = false;;
        }),
    );
  }
  ngOnDestroy(): void {
    this.subsription.unsubscribe();
  }

  formatDate(param) {
    const dateTime2 = moment(param).format('YYYY-MM-DD');
    return dateTime2;
  }
  /**
   * Queryparams to make unique URL
   * @param params
   * @returns void
   */
  addUrlQueryParams(params: any): void {
    this.location.replaceState(this._router.createUrlTree([], { queryParams: params }).toString());
  }

  generateExcel() {
    const PaginationParams = {
      ...this.filterParam,
      order_by: OrderEnum.DEC,
      order: 'id'
    };
    let filters = removeEmptyKeysFromObject(PaginationParams);
    this.subscription.push(this.requestService.sendRequest(reportsUrlsEnum.reportsNf2_Excel_list_GET, 'url_base_with_token', REQUEST_SERVERS.fd_api_url,
      filters,
    )
      .pipe(
        take(1))
      .subscribe((res) => {
        if (res) {
          window.open(res);
        }
      }));
  }
  ///// Customize Column Area
  onConfirm(click) {
    if (this.isAllFalse && !this.colSelected) {
      this.toastrService.error('At Least 1 Column is Required.', 'Error');
      return false;
    }
    if (click) {
      this.customizedColumnComp;
      this.modalCols = makeDeepCopyArray(this.customizedColumnComp?.modalCols)
      let data: any = [];
      this.modalCols.forEach(element => {
        if (element?.checked) {
          data.push(element);
        }
        let obj = this.alphabeticColumns.find(x => x?.name === element?.header);
        if (obj) {
          if (obj.name == element.header) {
            obj.checked = element.checked;
          }
        }
      });
      if (this.url == 'visit-summery') {
        this.localStorage.setObject('visitReportsTableList' + this.storageData.getUserId(), data);
		
      }
      else if (this.url == 'visit-detail') {
        this.localStorage.setObject('visitReportsTableList' + this.storageData.getUserId(), data);
      }
    }
    let groupByHeaderCol = getIdsFromArray(this.modalCols, 'header'); // pick header
    this.cols.sort(function (a, b) {
      return groupByHeaderCol.indexOf(a.name) - groupByHeaderCol.indexOf(b.name);
    });
    //set checked and unchecked on the base modal columns in alphabeticals columns
    this.alphabeticColumns.forEach(element => {
      let currentColumnIndex = findIndexInData(this.cols, 'name', element.name)
      if (currentColumnIndex != -1) {
        this.cols[currentColumnIndex]['checked'] = element.checked;
        this.cols = [...this.cols];
      }
    });
    // show only those columns which is checked
    let columnsBody = makeDeepCopyArray(this.cols);
    this.visitReportTable._internalColumns = columnsBody.filter(c => {
      return c.checked == true;
    });
    let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
    this.visitReportTable._internalColumns.sort(function (a, b) {
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
    if (!isChecked) {
      this.isAllFalse = true;
    }
  }

  onSingleSelection(isChecked) {
    this.isAllFalse = isChecked;
    if (isChecked) {
      this.colSelected = false;
    }
  }
}



