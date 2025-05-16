import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription, take } from 'rxjs';
import { RequestService } from '../../../../../app/shared/services/request.service';
import {
  ArReportType,
  PayLeftMarginValues,
  PayLeftMarginValuesWSubGrp,
  PayLeftMarginValuesWViewByandSubgroup,
  ReportType,
  SubgroupBy,
  ViewBy
} from '../../../reports/report.enum';

import { NgxDataTable } from '@appDir/shared/modules/ngx-datatable-custom/models/deliveries-ngx-datatable.models';

import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AnalyticsService } from '@appDir/analytics/analytics.service';
import { AnalyticsUrlsEnum } from '@appDir/analytics/helpers/analytics_Urls_enum';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import {
  getIdsFromArray,
  getLastRecordsIndexFromList,
  makeDeepCopyArray,
  removeEmptyAndNullsFormObject,
} from '@appDir/shared/utils/utils.helpers';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ModalDirective } from 'angular-bootstrap-md';
import { ReportsService } from '../../../reports/reports.service';
import { removeEmptyKeysFromObject } from '../../../reports/shared/helper';
import { DownloadReport } from '../../constant/constants';
import { ReportsExcelService } from '../../reportsExcel.service';
import { HighestPayingDropDown } from '@appDir/analytics/helpers/PaymentWise.enum';



@Component({
  selector: 'app-payment-report',
  templateUrl: './payment-report.component.html',
  styleUrls: ['./payment-report.component.scss'],
})
export class PaymentReportComponent implements OnInit, OnDestroy {
  @HostListener('window:resize', ['$event'])
  createdDeliveriesTableConf: NgxDataTable;
  @ViewChild('CustomizeColumnModal') CustomizeColumnModal: ModalDirective;
  @ViewChild('paymentReportTable') paymentReportTable: DatatableComponent;
  filterData: any;
  limit: number = 10;
  nf2Offset: number;
  nf2ActivePage: any;
  reportSelection: any;
  totalRecord: any;
  count: any;
  tableHeight1: string = '';
  @ViewChild(CustomizeColumnComponent) set con(con: CustomizeColumnComponent) {
    if (con) {
      // initially setter gets called with undefined
      this.customizedColumnComp = con;
    }
  }
  customizedColumnComp: CustomizeColumnComponent;
  alphabeticColumns: any[] = [];
  isAllFalse: boolean;
  colSelected: any;
  defaultPagination: any = {};
  paymentReportTypeId: number = 1;
  paymentReportsListingTableList: any[] = [];
  url: any;
 
  lastIndex: number = 0;
  modalCols: any[] = [];
  cols: any[] = [];
  copyCols: any[] = [];
  extraModalColumns: any[] = [
    { header: 'DOA', checked: false },
    { header: 'First Visit Date', checked: false },
    { header: 'Last visit Date', checked: false },
    // { header: 'Insurance Name', checked: true },
    { header: 'Specialty', checked: true },
    { header: 'Firm name', checked: true },
    { header: 'Attorney', checked: true },
    { header: 'Invoice Category', checked: false },
    // { header: 'Visit type', checked: false },
    { header: 'Check No', checked: false },
    // { header: 'Claim ID', checked: false },
    {header: 'Date Of Birth', checked: false},
    { header: 'Bill Status', checked: false },
    { header: 'EoR Status', checked: false },
    { header: 'Denial Status', checked: false },
    { header: 'Verification Status', checked: false },
    { header: 'Payment Status', checked: false },
    { header: 'Payment Type', checked: false },
    { header: 'Bill/Invoice Recipient Type', checked: true },
    { header: 'Bill/Invoice Recipient Name', checked: true },
    { header: 'Posted Date', checked: false },
    { header: 'Check Date', checked: true },
    { header: 'Check No', checked: false },
    { header: 'Check Amount', checked: true },
    { header: 'No. Of Days', checked: false },
    { header: 'Paid By', checked: false },
    { header: 'Bill/Invoice ID', checked: true },  
    { header: 'Case ID', checked: true },  
    { header: 'Case Type', checked: true }, 
    { header: 'Practice Location', checked: true }, 
    { header: 'Patient Name', checked: true },
    { header: 'Provider name', checked: true },
    { header: 'Bill/Invoice Date', checked: true },
    { header: 'Billed/Invoice Amount', checked: true },
    { header: 'Paid Amount', checked: true },  
    { header: 'Outstanding', checked: true },  
    { header: 'Write off', checked: true }, 
    { header: 'Over payment', checked: true },  
    { header: 'Interest', checked: true }, 
    { header: 'Denial Type', checked: true }, 
    { header: 'Created At', checked: true }, 
    { header: 'Updated At', checked: true }, 
    { header: 'Payment Created At', checked: true }, 
    { header: 'Payment Updated At', checked: true }, 
];
  filtersIncludesForDetailReport: any[] = [
    'insurance_ids',
    'case_type_ids',
    'visit_type_ids',
    'facility_location_ids',
    'patient_name',
    'employer_ids',
    'firm_name',
    'attornyName',
    'doctor_ids',
    'speciality_ids',
    'start_date',
    'end_date',
    'bill_recipient_type_id',
    'date_type',
    'report_type',
  ];
  
  filtersIncludesForSummaryReport: any[] = [
    'insurance_ids',
    'case_type_ids',
    'visit_type_ids',
    'facility_location_ids',
    'patient_name',
    'employer_ids',
    'firm_name',
    'attornyName',
    'doctor_ids',
    'speciality_ids',
    'start_date',
    'end_date',
    'bill_recipient_type_id',
    'date_type',
    'group_by',
    'subgroup_by',
    'aggregate',
  ];

  rowData:any[] = [];
  paymentSummaryReportData: any[] = [];
  subsription: Subscription;
  public loadSpin: boolean = false;
  isMultiplePractice = false;
  groupBy: string = '';
  subGroupBy: string = '';
  queryParams: any = {};
  filterParam: any;
  viewByName: string = 'Bill Date By ';
  endDateTrigger: Boolean = false;
  paymentReportType = ArReportType;
  subscription: Subscription[] = [];
  billRecepientID: any = null;
  countAggregate: Boolean = false;
  lastRowData : [] = [];
  billDate: Boolean = false;
  viewById: Boolean = false;
  bigscreen : Boolean = false
  showSummaryTable:boolean = false;
  summaryTableHeight : string = '600px'
  
  Summarycolumns = [
    { prop: 'group_by_name'},
    { prop: 'billed_amount' },
    { prop: 'paid_amount' },
    { prop: 'outstanding_amount' },
    { prop: 'write_off_amount' },
    { prop: 'overpayment' },
    { prop: 'interest_amount' },
  ];
  constructor(
    private toastrService: ToastrService,
    private storageData: StorageData,
    public reportService: ReportsService,
    private modalService: NgbModal,
    private toaster: ToastrService,
    public datePipeService: DatePipeFormatService,
    private _route: ActivatedRoute,
    private _router: Router,
    public requestService: RequestService,
    private analyticsService: AnalyticsService,
    private location: Location,
    private router: Router,
    private localStorage: LocalStorage,
    private reportsExcelService : ReportsExcelService,
  ) {
    this.onResize();
    this.subsription = new Subscription();
    this.initializeDefaultPagination();
  }

  onResize() {
    const screenWidth : number = window.innerWidth;
    if(screenWidth >= 1700){
      this.bigscreen = true
    } else if(screenWidth < 1700){
      this.bigscreen = false
    }
 }

  initializeDefaultPagination() {
    this.defaultPagination = {
      page: 1,
      per_page: 10,
      pagination: 1,
    };
  }

  ngOnInit() {
    window.addEventListener('resize', this.onResize.bind(this));
    this.url = this.router.url.split('/')[2].split('?')[0];
    this.subsription.add(
      this._route.queryParams.subscribe((params) => {
        this.defaultPagination.per_page = params['per_page'] || 10;
        this.filterParam = params;
        this.nf2Offset = params['page'] ? Number(params['page']) - 1 : 0;
        this.paymentReportTypeId = params?.type;
        if (this.paymentReportTypeId == this.paymentReportType.Detail) {

          this.getStoredColumns();

          setTimeout(() => {
            this.renderTableHeaders();
          }, 300);
        }
      })
    );
  }
  calculateLeftMargin(prop: string): number {
    const subgroupBy = this.filterParam.subgroup_by_id ? SubgroupBy.SubgroupById : SubgroupBy.None;
    const viewBy = this.filterParam.view_by_id ? ViewBy.ViewById : ViewBy.None;
    let countadjustment : number = 0;
    if(this.countAggregate){
      countadjustment = 2
    }
    if(this.bigscreen){
      countadjustment += 1.5
    }
    switch (prop) {
      case 'group_by_name':
        return subgroupBy === SubgroupBy.None &&  viewBy === ViewBy.None ? PayLeftMarginValues.GroupBy  : subgroupBy !== SubgroupBy.None &&  viewBy !== ViewBy.None ? PayLeftMarginValuesWViewByandSubgroup.GroupBy  : PayLeftMarginValuesWSubGrp.GroupBy ;
      case 'billed_amount':
        return subgroupBy === SubgroupBy.None &&  viewBy === ViewBy.None ? PayLeftMarginValues.BilledAmount + countadjustment  : subgroupBy !== SubgroupBy.None &&  viewBy !== ViewBy.None ? PayLeftMarginValuesWViewByandSubgroup.BilledAmount + countadjustment  : PayLeftMarginValuesWSubGrp.BilledAmount + countadjustment ;
      case 'paid_amount':
        return subgroupBy === SubgroupBy.None &&  viewBy === ViewBy.None ? PayLeftMarginValues.PaidAmount + countadjustment  : subgroupBy !== SubgroupBy.None &&  viewBy !== ViewBy.None ? PayLeftMarginValuesWViewByandSubgroup.PaidAmount  + countadjustment : PayLeftMarginValuesWSubGrp.PaidAmount + countadjustment ;
      case 'outstanding_amount':
        return subgroupBy === SubgroupBy.None &&  viewBy === ViewBy.None ? PayLeftMarginValues.OutStandingAmount + countadjustment  : subgroupBy !== SubgroupBy.None &&  viewBy !== ViewBy.None ? PayLeftMarginValuesWViewByandSubgroup.OutStandingAmount + countadjustment  : PayLeftMarginValuesWSubGrp.OutStandingAmount + countadjustment ;
      case 'write_off_amount':
        if(countadjustment > 0){
          countadjustment = countadjustment -1;
        }
        return subgroupBy === SubgroupBy.None &&  viewBy === ViewBy.None ? PayLeftMarginValues.WriteOffAmount + countadjustment  : subgroupBy !== SubgroupBy.None &&  viewBy !== ViewBy.None ? PayLeftMarginValuesWViewByandSubgroup.WriteOffAmount + countadjustment  : PayLeftMarginValuesWSubGrp.WriteOffAmount + countadjustment ;
      case 'overpayment':
        if(countadjustment > 0){
          countadjustment = countadjustment -1;
        }
        return subgroupBy === SubgroupBy.None &&  viewBy === ViewBy.None ? PayLeftMarginValues.OverPayment + countadjustment  : subgroupBy !== SubgroupBy.None &&  viewBy !== ViewBy.None ? PayLeftMarginValuesWViewByandSubgroup.OverPayment + countadjustment  : PayLeftMarginValuesWSubGrp.OverPayment + countadjustment ;
      case 'interest_amount':
        if(countadjustment > 0){
          countadjustment = countadjustment -1;
        }
        return subgroupBy === SubgroupBy.None &&  viewBy === ViewBy.None ? PayLeftMarginValues.InterestAmount + countadjustment  : subgroupBy !== SubgroupBy.None && viewBy !== ViewBy.None ? PayLeftMarginValuesWViewByandSubgroup.InterestAmount  + countadjustment : PayLeftMarginValuesWSubGrp.InterestAmount + countadjustment ;
      default:
        return 0;
    }
  }
 

  ngAfterViewInit() {
    this.viewByName = 'Bill Date ';
    if (this.filterParam.date_type == 2) {
      this.viewByName = 'Bill Date ';
    } else if (this.filterParam.date_type == 1) {
      this.viewByName = 'DOS ';
    } else if (this.filterParam.date_type == 3) {
      this.viewByName = 'Check Date ';
    }
  }
  getStoredColumns() {
    if (this.paymentReportTypeId == this.paymentReportType.Detail) {
      //this.paymentReportsListingTableList = this.localStorage.getObject('paymentDetailReportsTableList' + this.storageData.getUserId());
    }
  }
  renderTableHeaders() {
    if (
      this.paymentReportTable?._internalColumns &&
      this.paymentReportTypeId == this.paymentReportType.Detail
    ) {
      this.cols = makeDeepCopyArray([
        ...this.paymentReportTable._internalColumns,
      ]);
      this.copyCols = makeDeepCopyArray([
        ...this.paymentReportTable._internalColumns,
      ]);
      this.cols.forEach((element) => {
        if (this.paymentReportsListingTableList?.length) {
          let obj = this.paymentReportsListingTableList.find(
            (x) => x?.header === element?.name
          );
          obj ? (element['checked'] = true) : (element['checked'] = false);
        } else {
          let obj = this.extraModalColumns.find(
            (x) => x?.header === element?.name
          );
          obj && obj.checked === false ? (element['checked'] = false) : (element['checked'] = true);
        }
      });
      if (this.paymentReportsListingTableList?.length) {
        const nameToIndexMap = {};
        this.paymentReportsListingTableList.forEach((item, index) => {
          nameToIndexMap[item?.header] = index;
        });
        this.cols.sort(
          (a, b) => nameToIndexMap[a?.name] - nameToIndexMap[b?.name]
        );
      }
      let cols = makeDeepCopyArray(this.cols);
      this.alphabeticColumns = cols.sort(function (a, b) {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      });
      this.onConfirm(false, true);
    }
  }
  onCatchGroupDataEvent(groupData: any) {
    this.groupBy = groupData?.groupBy ? groupData?.groupBy : '';
    this.subGroupBy = groupData?.subGroupBy ? groupData?.subGroupBy : '';
  }
  getRowClass = (row) => {
    if (row.bill_date) {
      this.billDate = true;
    } else {
      this.billDate = false;
    }
    return {
      'row-color': row?.bill_date ? true : false,
    };
  };
  applyFilter(params) {
    this.filterParam = removeEmptyKeysFromObject(params);
    // this.filtersIncludesForSummaryReport.push('view_by');
    if (this.filterParam.Aggregate == 4) {
      this.countAggregate = true;
    } else {
      this.countAggregate = false;
    }
    if (this.filterParam.view_by_id != null) {
      this.viewById = true;
    } else {
      this.viewById = false;
    }
    const data = { ...this.defaultPagination, ...this.filterParam };
    this.nf2Offset = 0;
    this.billRecepientID = params?.bill_recipient_type_id;
    if (this.paymentReportTypeId == this.paymentReportType.Detail) {
      if(this.billRecepientID !== undefined){
        this.onConfirm(false, true);
      }else{
      this.onConfirm(true, true);
      }
      this.fetchPaymentDetailReportData(data);
    } else {
      if (this.filterParam.view_by_id == 1) {
        if (this.filterParam.date_type == 2) {
          this.viewByName = 'Bill Date By ' + 'Month';
        } else if (this.filterParam.date_type == 1) {
          this.viewByName = 'DOS By ' + 'Month';
        } else if (this.filterParam.date_type == 3) {
          this.viewByName = 'Check Date By ' + 'Month';
        }
      } else if (this.filterParam.view_by_id == 2) {
        if (this.filterParam.date_type == 2) {
          this.viewByName = 'Bill Date By ' + 'quarter';
        } else if (this.filterParam.date_type == 1) {
          this.viewByName = 'DOS By ' + 'quarter';
        } else if (this.filterParam.date_type == 3) {
          this.viewByName = 'Check Date By ' + 'quarter';
        }
      } else if (this.filterParam.view_by_id == 3) {
        if (this.filterParam.date_type == 2) {
          this.viewByName = 'Bill Date By ' + 'year';
        } else if (this.filterParam.date_type == 1) {
          this.viewByName = 'DOS By ' + 'year';
        } else if (this.filterParam.date_type == 3) {
          this.viewByName = 'Check Date By ' + 'year';
        }
      }
      this.fetchPaymentSummaryReportData(data);
    }
  }
  onBillRecepientChangeEvent(changedValue: any) {
    this.billRecepientID = changedValue;
    if (
      !changedValue &&
      this.paymentReportTypeId == this.paymentReportType.Detail
    ) {
      this.onConfirm(false, true);
    }
  }
  onEndDateEvent() {
    this.endDateTrigger = true;
    if (!this.filtersIncludesForSummaryReport.includes('view_by')) {
      this.filtersIncludesForSummaryReport.push('view_by');
    }
  }
  onEndDateCancelledEvent() {
    const index = this.filtersIncludesForSummaryReport.indexOf('view_by', 0);
    if (index > -1) {
      this.filtersIncludesForSummaryReport.splice(index, 1);
    }
  }
  openCustomoizeColumn() {
    const ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      windowClass: 'modal-lg-package-generate',
    };
    this.modalCols = [];
    let self = this;
    this.cols = this.copyCols;
    this.cols.forEach((element) => {
      let obj = self.alphabeticColumns.find((x) => x?.name === element?.name);
      if (obj) {
        this.modalCols.push({ header: element?.name, checked: obj?.checked });
      }
    });
    this.extraModalColumns.forEach((colEl) => {
      let extraColumn = this.modalCols.find((x) => x?.header === colEl?.header);
      
      if (!extraColumn) {
        this.modalCols.push(colEl);
      } else {
        this.modalCols.splice(
          this.modalCols.indexOf(extraColumn),
          1,
          extraColumn
        );
      }
    });
    this.CustomizeColumnModal.show();
  }
  resetFilter(event) {
    this.nf2Offset = 0;
    this.filterParam = {};
   
    if (this.paymentReportTypeId == this.paymentReportType.Detail) {
      this.rowData = []
      this.totalRecord = 0

    } else {
      this.paymentSummaryReportData = [];
      this.showSummaryTable = false;
    }
  }

  fetchPaymentDetailReportData(filterParam?) {
    this.loadSpin = true;
    const filterData = { ...this.defaultPagination, ...filterParam };
    this.addUrlQueryParams(removeEmptyAndNullsFormObject(filterParam));
    this.subsription.add(
      this.analyticsService
        .post(AnalyticsUrlsEnum.paymentt_detail_report, filterData)
        .subscribe(
          (data) => {
            this.rowData = data['result']?.data?.actualdata
              ? [...data['result']?.data?.actualdata]
              : [];

              
            this.totalRecord = this.rowData[0]?.total_count;

            setTimeout(() => {
              $('datatable-body').scrollLeft(1);
            }, 50);
            this.loadSpin = false;
          },
          (err) => {
            this.loadSpin = false;
          }
        )
    );
  }
  onPageChange(event) {
    this.limit = event.limit;
    this.nf2Offset = event.offset;
    this.nf2ActivePage = event.offset + 1;
    const PaginationParams = {
      ...this.filterParam,
      page: this.nf2ActivePage,
      per_page: this.limit,
      pagination: 1,
    };
    this.fetchPaymentDetailReportData(PaginationParams);
  }
  entryCountSelection(value: string) {
    this.limit = parseInt(value);
    this.nf2Offset = 0;
    const pageParams = {
      ...this.filterParam,
      page: 1,
      per_page: value,
      pagination: 1,
    };

    this.fetchPaymentDetailReportData(pageParams);
  }
  fetchPaymentSummaryReportData(filterParam?) {
    this.loadSpin = true;
    const filterData = { ...filterParam };
    this.subsription.add(
      this.analyticsService
        .post(AnalyticsUrlsEnum.payment_summary_report, filterData)
        .subscribe(
          (data) => {
            this.lastRowData = []
            this.loadSpin = false;
            const tempPaymentData = data['result']?.data
            ? [...data['result'].data]
            : [];
            switch(tempPaymentData?.length){
              case 1:
                this.summaryTableHeight = '100px'
                break;
              case 2:
                this.summaryTableHeight = '100px'
                break;
              case 3:
                this.summaryTableHeight = '150px'
                break;
              case 4:
                this.summaryTableHeight = '200px'
                  break;
              case 5:
                this.summaryTableHeight = '250px'
                break;
              case 6:
                this.summaryTableHeight = '300px'
                break;
              case 7:
                this.summaryTableHeight = '350px'
                break;
              case 8:
                this.summaryTableHeight = '400px'
                break;
              case 9:
                this.summaryTableHeight = '450px'
                break;
              default:
                this.summaryTableHeight = '600px'
                                                                      
            }
            setTimeout(() => {

              this.paymentSummaryReportData = tempPaymentData;
              this.lastIndex = getLastRecordsIndexFromList(
              this.paymentSummaryReportData,
              1
            );
              this.lastRowData = data['result']?.data[data['result']?.data?.length - 1]
              this.paymentSummaryReportData.pop()
              if(tempPaymentData.length >= 1){
              this.showSummaryTable = true 
              }else {
                this.showSummaryTable = false
              }
            }, 100);
            
          },
          (err) => {
            this.loadSpin = false;
          }
        )
    );
  }
  ngOnDestroy(): void {
    this.subsription?.unsubscribe();
    window.removeEventListener('resize', this.onResize.bind(this));

  }

  /**
   * Queryparams to make unique URL
   * @param params
   * @returns void
   */
  addUrlQueryParams(params: any): void {
    this.location.replaceState(
      this._router.createUrlTree([], { queryParams: params }).toString()
    );
  }

  generatePaymentDetailReportExcel() {
    this.loadSpin = true;
    this.filterParam.report_type = ReportType.Payment_Detail_Report;
    
    let columnsBody = makeDeepCopyArray(this.cols);
    this.paymentReportTable._internalColumns = columnsBody.filter((c) => {
      return c.checked == true;
    });
    this.subsription.add(
      this.analyticsService
        .post(AnalyticsUrlsEnum.export_to_excel, this.filterParam)
        .pipe(take(1))
        .subscribe(
          (res: any) => {
            const jsonData = res;
            const csvContent = jsonData.result.csvContent;
           const filteredCsvContent = this.reportsExcelService.getprocessedCsv(csvContent,ReportType.Payment_Detail_Report,this.paymentReportTable._internalColumns)
          
          if (filteredCsvContent) {
            DownloadReport(filteredCsvContent, 'PaymentDetailReport');
            this.loadSpin = false;
          } else {
            this.loadSpin = false;
          }
        },
        (error) => {
          this.loadSpin = false;
        }
      )
)}
  generatePaymentSummaryReportExcel() {
    this.loadSpin = true;
    this.filterParam.report_type = ReportType.Payment_Summary_Report;
    this.subsription.add(
      this.analyticsService
        .post(AnalyticsUrlsEnum.export_to_excel, this.filterParam)
        .pipe(take(1))
        .subscribe(
          (res: any) => {
            const jsonData = res;
            if (jsonData?.result?.csvContent) {
              DownloadReport(
                jsonData?.result?.csvContent,
                'paymentSummaryReport'
              );
              this.loadSpin = false;
            } else {
              this.loadSpin = false;
            }
          },
          (error) => {
            this.loadSpin = false;
          }
        )
    );
  }
  ///// Customize Column Area
  onConfirm(click, billRecepientSelection?: boolean, additionalBillRecipient?:Boolean) {
    if (this.isAllFalse && !this.colSelected) {
      this.toastrService.error('At Least 1 Column is Required.', 'Error');
      return false;
    }
   
    if (
      billRecepientSelection &&
      this.paymentReportTypeId == this.paymentReportType.Detail
    ) {
      this.setColumnByRecepient();
      
    }
    if (click) {
      this.customizedColumnComp;
      if (this.cols.length != this.modalCols.length) {
        this.cols = this.copyCols;
        this.cols.forEach((element) => {
          element['checked'] = true;
        });
      }

      this.modalCols = makeDeepCopyArray(this.customizedColumnComp?.modalCols);
      let data: any = [];
      this.modalCols.forEach((element) => {
        if (element?.checked) {
          data.push(element);
        }
        let obj = this.alphabeticColumns.find(
          (x) => x?.name === element?.header
        );
        if (obj) {
          if (obj.name == element.header) {
            obj.checked = element.checked;
          }
        }
      });
      this.extraModalColumns.forEach(column => {
        const modalColObj = this.modalCols.find(item => item.header === column.header);
        if (modalColObj ) {
            column.checked = modalColObj.checked;
        }
    });

    }
    

    this.cols.forEach(element => {
      // Find the corresponding object in the second array based on the header
      const matchingItem = this.extraModalColumns.find(item => item.header === element.name);
      // Set the checked property based on the information in the second array
      if (matchingItem !== undefined) {
        element['checked'] = matchingItem.checked;
      }
    });
 
    let groupByHeaderCol = getIdsFromArray(this.modalCols, 'header'); // pick header
    this.cols.sort(function (a, b) {
      return (
        groupByHeaderCol.indexOf(a.name) - groupByHeaderCol.indexOf(b.name)
      );
    });
    //set checked and unchecked on the base modal columns in alphabeticals columns
    this.alphabeticColumns.forEach((element) => {
      let currentColumnIndex = findIndexInData(this.cols, 'name', element.name);
      if (currentColumnIndex != -1) {
        this.cols[currentColumnIndex]['checked'] = element.checked;
        this.cols = [...this.cols];
      }
    });
    this.extraModalColumns.forEach((element) => {
      let currentColumnIndex = findIndexInData(this.cols, 'name', element.header);
      if (currentColumnIndex != -1) {
        this.cols[currentColumnIndex]['checked'] = element.checked;
        this.cols = [...this.cols];
      }
    });
  
    // show only those columns which is checked
    let columnsBody = makeDeepCopyArray(this.cols);
    this.paymentReportTable._internalColumns = columnsBody.filter((c) => {
      return c.checked == true;
    });

    let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
    this.paymentReportTable._internalColumns.sort(function (a, b) {
      return groupByHeader.indexOf(a.name) - groupByHeader.indexOf(b.name);
    });
    

    window.dispatchEvent(new Event('resize'));
    this.CustomizeColumnModal.hide();
  }
  setColumnByRecepient() {
    this.cols = makeDeepCopyArray([...this.copyCols]);
    if (this.billRecepientID == HighestPayingDropDown.Firm) {
      this.excludeSpecificColumns([
        'Specialty',
        'Bill/Invoice ID',
        'Invoice Category',
        'Check No',
        'Bill Status',
        'EoR Status',
        'Denial Status',
        'Verification Status',
        'Payment Status',
        'Payment Type',
        'Bill/Invoice Recipient Type',
        'Posted Date',
        'Check Date',
        'Check Amount',
        'No. Of Days',
        'Paid By',
        'Practice Location',
        'Provider name',
        'Bill/Invoice Date'
      ]
      );
      this.includeSpecificColumns([
        'Case ID',
        'Case Type',
        'Patient Name',
        'Attorney',
        'Bill/Invoice Recipient Name', // new
        'Firm name',
        'DOA',
        'First Visit Date',
        'Last visit Date',
        'Billed/Invoice Amount',
        'Paid Amount',
        'Outstanding',
        'Write off',
        'Overpayment',
        'Interest'
      ])
    } else if (this.billRecepientID ==  HighestPayingDropDown.Insurance) {

      this.excludeSpecificColumns([
        'DOA',
        'Specialty',
        'Firm name',
        'Attorney',
        'Invoice Category',
        'Check No',
        'Bill Status',
        'EoR Status',
        'Denial Status',
        'Verification Status',
        'Payment Status',
        'Payment Type',
        'Bill/Invoice Recipient Type',
        'Posted Date',
        'Check Date',
        'Check No',
        'Check Amount',
        'No. Of Days',
        'Paid By',
        'Practice Location',
        'Provider name',
        'Bill/Invoice Date'
      ]
      );
      this.includeSpecificColumns([
        'Bill/Invoice ID',
        'Case ID',
        'Case Type',
        'Patient Name',
        'First Visit Date',
        'Last visit Date',
        'Bill/Invoice Recipient Name', // new
        'Billed/Invoice Amount',
        'Paid Amount',
        'Outstanding',
        'Write off',
        'Overpayment',
        'Interest'
      ])
    } else if (this.billRecepientID ==  HighestPayingDropDown.Patient) {
  
      this.excludeSpecificColumns([
        'DOA',
        'Firm name',
        'Attorney',
        'Invoice Category',
        'Check No',
        'Bill Status',
        'EoR Status',
        'Denial Status',
        'Verification Status',
        'Payment Status',
        'Payment Type',
        'Bill/Invoice Recipient Type',
        'Posted Date',
        'Check Date',
        'Check No',
        'Check Amount',
        'No. Of Days',
        'Paid By',
        'Practice Location',
        'Bill/Invoice Date'
      ]
      );
      this.includeSpecificColumns([
        'Bill/Invoice ID',
        'Case ID',
        'Case Type',
        'Patient Name',
        'Provider name',
        'Bill/Invoice Recipient Name', // new
        'Specialty',
        'First Visit Date',
        'Last visit Date',
        'Billed/Invoice Amount',
        'Paid Amount',
        'Outstanding',
        'Write off',
        'Overpayment',
        'Interest'
      ])
    } else if (this.billRecepientID ==  HighestPayingDropDown.Employer) {
      this.excludeSpecificColumns([
        'DOA',
        'Firm name',
        'Attorney',
        'Invoice Category',
        'Check No',
        'Bill Status',
        'EoR Status',
        'Denial Status',
        'Verification Status',
        'Payment Status',
        'Payment Type',
        'Bill/Invoice Recipient Type',
        'Posted Date',
        'Check Date',
        'Check No',
        'Check Amount',
        'No. Of Days',
        'Paid By',
        'Practice Location',
        'Bill/Invoice Date'
      ]
      );
      this.includeSpecificColumns([
        'Bill/Invoice ID',
        'Case ID',
        'Case Type',
        'Patient Name',
        'Provider name',
        'Employer Name',
        'Bill/Invoice Recipient Name', // new
        'Specialty',
        'First Visit Date',
        'Last visit Date',
        'Billed/Invoice Amount',
        'Paid Amount',
        'Outstanding',
        'Write off',
        'Overpayment',
        'Interest'
      ]
      )
    } 
    
    else if (this.billRecepientID ==  HighestPayingDropDown.Other) {
      this.excludeSpecificColumns([
        'DOA',
        'Firm name',
        'Attorney',
        'Invoice Category',
        'Check No',
        'Bill Status',
        'EoR Status',
        'Denial Status',
        'Verification Status',
        'Payment Status',
        'Payment Type',
        'Bill/Invoice Recipient Type',
        'Posted Date',
        'Check Date',
        'Check No',
        'Check Amount',
        'No. Of Days',
        'Paid By',
        'Practice Location',
        'Bill/Invoice Date'
      ]
      );
      this.includeSpecificColumns([
        'Bill/Invoice ID',
        'Case ID',
        'Case Type',
        'Patient Name',
        'Provider name',
        'Employer Name',
        'Bill/Invoice Recipient Name', // new
        'Specialty',
        'First Visit Date',
        'Last visit Date',
        'Billed/Invoice Amount',
        'Paid Amount',
        'Outstanding',
        'Write off',
        'Overpayment',
        'Interest'
      ]
      )
    }
    
    
    
    else {
      this.excludeSpecificColumns([
        'DOA',
        'Invoice Category',
        'Check No',
        'Bill Status',
        'EoR Status',
        'Denial Status',
        'First Visit Date',
        'Last visit Date',
        'Verification Status',
        'Payment Status',
        'Payment Type',
        'Posted Date',
        'Check No',
        'No. Of Days',
        'Paid By',  
      ]
      );
      this.includeSpecificColumns([
        "Bill/Invoice ID",
        "Case ID",
        'Check Date', // new
        'Check Amount', //New
        "Case Type",
        "Practice Location",
        "Specialty",
        'Firm name', //new
        'Attorney', //new
        "Patient Name",
        "Provider name",
        "Bill/Invoice Date",
        'Bill/Invoice Recipient Type',  // new
        "Bill/Invoice Recipient Name",
        "Billed/Invoice Amount",
        "Paid Amount",
        "Outstanding",
        "Write off",
        "Overpayment",
        "Interest",
        'Denial Type', 
        'Created At', 
        'Updated At', 
        'Payment Created At', 
        'Payment Updated At', 
      ]
      )
    }
  }
  excludeSpecificColumns(specificCols: any[]) {

    specificCols.forEach((column) => {
      this.cols = this.cols.filter((col) => col.name != column);
    });
    this.extraModalColumns.forEach(column => {
      const header = column.header;
      const isHeaderInList = specificCols.includes(header);
      if (isHeaderInList == true) {
          column.checked = false;
      }
  });
  }
  includeSpecificColumns(specificCols: any[]) {
    this.extraModalColumns.forEach(column => {
      const header = column.header;
      const isHeaderInList = specificCols.includes(header);
      if(isHeaderInList){
      column.checked = true;
      }
  });
  }
  filterExtraColumns(cols: any[]) {
    let filteredColumns = [];
    this.extraModalColumns.forEach((extra) => {
      cols = cols.filter((col) => col.name != extra.header);
    });
  
    filteredColumns = cols;
    return filteredColumns;
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
  historyStats(row) {
    const ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      windowClass: 'modal_extraDOc body-scroll history-modal',
      modalDialogClass: 'modal-lg',
    };
    let modelRef = this.modalService.open(
      CreatedHistoryComponent,
      ngbModalOptions
    );
    modelRef.componentInstance.createdInformation = [row];
  }
}
