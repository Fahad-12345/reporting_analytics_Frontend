import {
  Component,
  HostListener,
  ViewChild,
} from '@angular/core';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription, take } from 'rxjs';
import { RequestService } from '../../../../../app/shared/services/request.service';
import {
  ArReportType,
  ApptLeftMarginValuesWSubGrp,
  ApptLeftMarginValues,
  ApptLeftMarginValuesWViewByandSubgroup,
  ReportType,
  SubgroupBy,
  ViewBy,
  Aggregate,
  ViewBySummary,
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
import { ReportFiltersComponent } from '../reports-filter-component/report-filter-component';
import { Page } from '@appDir/front-desk/models/page';
import { AclService } from '@appDir/shared/services/acl.service';
import { Socket } from 'ngx-socket-io';
import { Title } from '@angular/platform-browser';
import {
  convertDateTimeForRetrieving,
} from '@appDir/shared/utils/utils.helpers';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { SummaryPopupComponent } from '../summary-popup/summary-popup.component';
@Component({
  selector: 'app-appoinment-report',
  templateUrl: './appoinment-report.component.html',
  styleUrls: ['./appoinment-report.component.scss'],
})
export class AppoinmentReportComponent extends PermissionComponent {
  statusParams: any;
  defaultPagination: any = {};
  loadSpin: boolean = false;
  appointmentStatusReport: any[] = [];
  modalCols: any[] = [];
  columns: any[] = [];
  alphabeticColumns: any[] = [];
  colSelected: boolean = true;
  isAllFalse: boolean = false;
  page: Page = new Page();
  valueFromPopup: any;
  groupbyColumnProp: string = 'group_by_name';

  filterFormDataValue: any;
  loaderSpinnerProgressOnly: boolean = false;

  @ViewChild('appointmentStatusList')
  appointmentStatusListTable: DatatableComponent;
  @ViewChild('CustomizeColumnModal') CustomizeColumnModal: ModalDirective;
  @ViewChild('ReportFilterComponent')
  reportFilterComponent: ReportFiltersComponent;
  customizedColumnComp: CustomizeColumnComponent;
  @ViewChild(CustomizeColumnComponent) set content(
    content: CustomizeColumnComponent
  ) {
    if (content) {
      // initially setter gets called with undefined
      this.customizedColumnComp = content;
    }
  }
  subcription: Subscription[] = [];
  appointmentStatusReportsListingTable: any;

  // ---------------------------

  @HostListener('window:resize', ['$event'])
  createdDeliveriesTableConf: NgxDataTable;
  @ViewChild('paymentReportTable') paymentReportTable: DatatableComponent;
  filterData: any;
  limit: number = 10;
  nf2Offset: number;
  nf2ActivePage: any;
  totalRecord: any;
  count: any;
  @ViewChild(CustomizeColumnComponent) set con(con: CustomizeColumnComponent) {
    if (con) {
      // initially setter gets called with undefined
      this.customizedColumnComp = con;
    }
  }
  appointmentStatusReportTypeId: number = 1;
  paymentReportsListingTableList: any[] = [];
  url: any;
  lastIndex: number = 0;
  cols: any[] = [];
  copyCols: any[] = [];
  filtersIncludesForDetailReport: any[] = [
    'referal_type',
    'clinic_location_ids',
    'appointment_status_ids',
    'insurance_ids',
    'case_type_ids',
    'facility_location_ids',
    'case_ids',
    'patient_name',
    'doctor_ids',
    'speciality_ids',
    'appointment_type_ids',
    'start_date',
    'end_date',
  ];
  filtersIncludesForSummaryReport: any[] = [
    'referal_type',
    'clinic_location_ids',
    'case_type_ids',
    'visit_type_ids',
    'case_ids',
    'appointment_status_ids',
    'insurance_ids',
    'facility_location_ids',
    'doctor_ids',
    'patient_name',
    'speciality_ids',
    'appointment_type_ids',
    'start_date',
    'end_date',
    'group_by',
    'subgroup_by',
    'view_by',
  ];
  paymentSummaryReportData: any[] = [];
  subsription: Subscription;
  groupBy: string = '';
  viewBySum: object = {};
  subGroupBy: string = '';
  queryParams: any = {};
  filterParam: any;
  viewByName: string = '';
  appointmentStatusReportType = ArReportType;
  subscription: Subscription[] = [];
  countAggregate: Boolean = false;
  lastRowData: [] = [];
  billDate: Boolean = false;
  viewById: Boolean = false;
  bigscreen: Boolean = false;
  showSummaryTable: boolean = false;
  isPdfClicked: boolean = false;
  globalFilters: any = {};
  summaryTableHeight: string = '450px';
  selectedOption = ''
  Summarycolumns = [
    { prop: 'Grand Total' },
    { prop: 'VC' },
    { prop: 'SC' },
    { prop: 'NS' },
    { prop: 'Total' },
  ];
  uniqueVisitTypes : number = 0;
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
    router: Router,
    private localStorage: LocalStorage,
    aclService: AclService,
    titleService: Title,
    private socket: Socket
  ) {
    super(aclService, router, _route, requestService, titleService);
    this.onResize();
    this.subsription = new Subscription();
    this.initializeDefaultPagination();
  }

  onResize() {
    const screenWidth: number = window.innerWidth;
    if (screenWidth >= 1700) {
      this.bigscreen = true;
    } else if (screenWidth < 1700) {
      this.bigscreen = false;
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
    this.page.size = 10;
    this.page.pageNumber = 1;

    this._route.queryParams.subscribe((params) => {
      this.appointmentStatusReportTypeId = params['type'] || this.appointmentStatusReportType.Detail;
        if(params.type == ArReportType.Detail){
          this.toaster.info('Displaying data of previous day by default. Use Date Range filter to change selection');
        }
    });
    this.subcription.push(
      this.socket.fromEvent('GETREPORTSURL').subscribe((message: any) => {
        this.loaderSpinnerProgressOnly = false;
        this.loadSpin = false;
        if (message && message.url) {
          window.open(message.url);
        } else {
          this.toaster.error(message);
        }
      })
    );
    this.socket.on('STARTREPORTSLOADER', (message) => {
      this.loaderSpinnerProgressOnly = true;
    });
    this.appointmentStatusReportsListingTable = this.localStorage.getObject(
      'appointmentStatusReportsTable' + this.storageData.getUserId()
    );
    
  }
  calculateLeftMargin(prop: string): number {
    const subgroupBy : SubgroupBy = this.filterParam?.subgroup_by_id
      ? SubgroupBy.SubgroupById
      : SubgroupBy.None;
    const viewBy : ViewBy= this.filterParam?.view_by_id ? ViewBy.ViewById : ViewBy.None;

    // Initialize count adjustment based on certain conditions
    let countadjustment: number = 0;
    if (this.countAggregate) {
      countadjustment = 2; // Adjust count for aggregate
    }
    if (this.bigscreen) {
      countadjustment += 1.5; // Additional adjustment for big screen
    }

    switch (prop) {
      case 'Grand Total':
        return subgroupBy === SubgroupBy.None && viewBy === ViewBy.None
          ? ApptLeftMarginValues.grandTotal + countadjustment
          : subgroupBy !== SubgroupBy.None && viewBy !== ViewBy.None
          ? ApptLeftMarginValuesWViewByandSubgroup.grandTotal + countadjustment
          : ApptLeftMarginValuesWSubGrp.grandTotal + countadjustment;

      case 'VC':
        return subgroupBy === SubgroupBy.None && viewBy === ViewBy.None
          ? ApptLeftMarginValues.VC + countadjustment
          : subgroupBy !== SubgroupBy.None && viewBy !== ViewBy.None
          ? ApptLeftMarginValuesWViewByandSubgroup.VC + countadjustment
          : ApptLeftMarginValuesWSubGrp.VC + countadjustment;

      case 'SC':
        return subgroupBy === SubgroupBy.None && viewBy === ViewBy.None
          ? ApptLeftMarginValues.SC + countadjustment
          : subgroupBy !== SubgroupBy.None && viewBy !== ViewBy.None
          ? ApptLeftMarginValuesWViewByandSubgroup.SC + countadjustment
          : ApptLeftMarginValuesWSubGrp.SC + countadjustment;

      case 'NS':
        return subgroupBy === SubgroupBy.None && viewBy === ViewBy.None
          ? ApptLeftMarginValues.NS + countadjustment
          : subgroupBy !== SubgroupBy.None && viewBy !== ViewBy.None
          ? ApptLeftMarginValuesWViewByandSubgroup.NS + countadjustment
          : ApptLeftMarginValuesWSubGrp.NS + countadjustment;

      case 'Total':
        return subgroupBy === SubgroupBy.None && viewBy === ViewBy.None
          ? ApptLeftMarginValues.Total + countadjustment
          : subgroupBy !== SubgroupBy.None && viewBy !== ViewBy.None
          ? ApptLeftMarginValuesWViewByandSubgroup.Total + countadjustment
          : ApptLeftMarginValuesWSubGrp.Total + countadjustment;

      default:
        return 0;
    }
  }

  ngAfterViewInit() {
    
    if (this.appointmentStatusListTable?._internalColumns) {
      this.columns = makeDeepCopyArray([
        ...this.appointmentStatusListTable?._internalColumns,
      ]);
      this.columns.forEach((element) => {
        if (this.appointmentStatusReportsListingTable?.length) {
          let obj = this.appointmentStatusReportsListingTable?.find(
            (x) => x?.header === element?.name
          );
          obj ? (element['checked'] = true) : (element['checked'] = false);
        } else {
          element['checked'] = true;
        }
      });
      if (this.appointmentStatusReportsListingTable?.length) {
        const nameToIndexMap : object = {};
        this.appointmentStatusReportsListingTable?.forEach((item, index) => {
          nameToIndexMap[item?.header] = index;
        });
        this.columns.sort(
          (a, b) => nameToIndexMap[a?.name] - nameToIndexMap[b?.name]
        );
      }
      let columns = makeDeepCopyArray(this.columns);
      this.alphabeticColumns = columns?.sort(function (a, b) {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      });
      this.onConfirm(false);
    }
    this.filterFormDataValue =
      this.reportFilterComponent &&
      this.reportFilterComponent?.searchForm &&
      this.reportFilterComponent?.searchForm.value
        ? this.reportFilterComponent?.searchForm.value
        : {};
  }
  onCatchGroupDataEvent(groupData: any) {
    this.groupBy = groupData?.groupBy ? groupData?.groupBy : '';
    this.subGroupBy = groupData?.subGroupBy ? groupData?.subGroupBy : '';
  }
  getRowClass = (row) => {
    return {
      'row-color': row?.view_by_name ? true : false,
    };
  };
  applyFilter(params) {
    this.filterParam = removeEmptyKeysFromObject(params);

    if (this.filterParam?.Aggregate == Aggregate.Count) {
      this.countAggregate = true;
    } else {
      this.countAggregate = false;
    }
    if (this.filterParam?.view_by_id != null) {
      this.viewById = true;
    } else {
      this.viewById = false;
    }
    const data : object = { ...this.defaultPagination, ...this.filterParam };
    this.nf2Offset = 0;
    if (this.appointmentStatusReportTypeId == this.appointmentStatusReportType.Detail) {
      this.filterFormDataValue = params;
      this.page.pageNumber = 1;
      params = {
        ...this.defaultPagination,
        ...params,
      };
      if (
        this.filterFormDataValue &&
        (this.filterFormDataValue['start_date'] == null ||
          this.filterFormDataValue['end_date'] == null)
      ) {
        this.reportFilterComponent.loadSpin = false;
        this.toaster.error('Date Range Field is Required', 'Error');
        return false;
      }
      

      this.getAppointmentStatusReport(params);
    } else {
      if (this.filterParam?.view_by_id == ViewBySummary.Month) {
        this.viewByName = 'Month';
      } else if (this.filterParam?.view_by_id == ViewBySummary.Specilaity) {
        this.viewByName = 'Specialty';
      } else if (this.filterParam?.view_by_id == ViewBySummary.VisitType) {
        this.viewByName = 'Visit Type';
      }
      this.groupbyColumnProp = params?.group_by_id === 25 ? 'outside_referring' : 'group_by_name';
        
      this.fetchPaymentSummaryReportData(data);
    }
  }

  fetchPaymentSummaryReportData(filterParam?) {
    this.loadSpin = true;
    this.isPdfClicked = false;
    filterParam['isPdfClicked'] = this.isPdfClicked;
    if (Array.isArray(filterParam?.in_house)) {
      if (filterParam?.in_house?.includes('all') || filterParam?.in_house?.length === 0) {
          delete filterParam?.in_house;
      }
  } 
    const filterData :object = { ...filterParam};
    this.globalFilters = filterData;

    this.subsription.add(
      this.analyticsService
        .post(AnalyticsUrlsEnum.appointment_summary_report, filterData)
        .subscribe(
          (data) => {

            this.lastRowData = [];
            this.loadSpin = false;
            let tempPaymentData = data['result']?.data
              ? [...data['result'].data]
              : [];
              const uniqueQualifiers : Set<any> = new Set(tempPaymentData?.map(item => item?.subgroup_by_qualifier));
              this.uniqueVisitTypes = uniqueQualifiers?.size;
            switch (tempPaymentData?.length) {
              case 1:
                this.summaryTableHeight = '100px';
                break;
              case 2:
                this.summaryTableHeight = '100px';
                break;
              case 3:
                this.summaryTableHeight = '150px';
                break;
              case 4:
                this.summaryTableHeight = '200px';
                break;
              case 5:
                this.summaryTableHeight = '250px';
                break;
              case 6:
                this.summaryTableHeight = '300px';
                break;
              case 7:
                this.summaryTableHeight = '350px';
                break;
              case 8:
                this.summaryTableHeight = '400px';
                break;
              case 9:
                this.summaryTableHeight = '450px';
                break;
              default:
                this.summaryTableHeight = '450px';
            }
            setTimeout(() => {
              this.paymentSummaryReportData = tempPaymentData;
              this.lastIndex = getLastRecordsIndexFromList(
                this.paymentSummaryReportData,
                1
              );
              if(this.viewById) {
                this.viewBySum = tempPaymentData[tempPaymentData?.length - 2];
              }

              this.lastRowData = tempPaymentData[tempPaymentData?.length - 1];  
              this.paymentSummaryReportData?.pop();


              if (tempPaymentData?.length >= 1) {
                this.showSummaryTable = true;
              } else {
                this.showSummaryTable = false;
              }
            }, 100);
          },
          (err) => {
            this.loadSpin = false;
          }
        )
    );
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

  generateStatusReportExcel() {
    this.loadSpin = true;
    this.filterParam.report_type = ReportType.Appointment_Status_Report;
    this.subsription.add(
      this.analyticsService
        .post(AnalyticsUrlsEnum.export_to_excel, this.filterParam)
        .pipe(take(1))
        .subscribe(
          (res: any) => {
            const jsonData : any = res;
            if (jsonData?.result?.csvContent) {
              DownloadReport(
                jsonData?.result?.csvContent,
                'AppointmentStatusReport'
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
  generateAppointmentSummaryReportExcel() {
    this.loadSpin = true;
    this.filterParam.report_type = ReportType.Appointment_Summary_Report;
    if (Array.isArray(this.filterParam?.in_house)) {
      if (this.filterParam?.in_house?.includes('all') || this.filterParam?.in_house?.length === 0) {
          delete this.filterParam?.in_house; 
      }
  } 
    this.subsription.add(
      this.analyticsService
        .post(AnalyticsUrlsEnum.export_to_excel, this.filterParam)
        .pipe(take(1))
        .subscribe(
          (res: any) => {
            const jsonData : any = res;
            if (jsonData?.result?.csvContent) {
              DownloadReport(
                jsonData?.result?.csvContent,
                'AppointmentSummaryReport'
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

  timeConversion(time) {
    return convertDateTimeForRetrieving(this.storageData, new Date(time));
  }
  
  async downloadAsPDF(){
    if (this.uniqueVisitTypes > 8  && this.globalFilters?.subgroup_by_id == ViewBySummary.Specilaity){
      this.toaster.error('Please select minimum 1 & maximum of 8 specilaities and regenerate report');
      return;
    }
    if (this.uniqueVisitTypes > 9 && this.globalFilters?.subgroup_by_id == ViewBySummary.VisitType){
      this.toaster.error('Please select minimum 1 & maximum of 9 Visit Types and regenerate report');
      return;
    }
    if(this.globalFilters?.group_by_id !== 1 && this.globalFilters?.subgroup_by_id !== 1){
      const ngbModalOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: false,
        windowClass: 'modal_extraDOc body-scroll history-modal',
        modalDialogClass: 'modal-lg modal-report' 
      };
  
      const modalRef : any = this.modalService.open(SummaryPopupComponent, ngbModalOptions);
      modalRef.componentInstance.disableMultiSelect = true;
      try {
        // Await the result from the child component
        const result : any = await modalRef.result;
        this.selectedOption = result; // 'facility' or 'facility_location'
  
        if (this.selectedOption) {
          // Remaining code can be executed here once the value is received
          this.processData();
        }
      } catch (error) {
      }
    }
    else{
      this.processData();
    }
  }

  processData() {
    
    const pdfName: string = 'AppointmentSummaryReport.pdf';
    this.isPdfClicked = true; 
    this.globalFilters['isPdfClicked'] = this.isPdfClicked;
    this.globalFilters['viewbyPdf'] = this.selectedOption;
    if (Array.isArray(this.globalFilters.in_house)) {
      if (this.globalFilters?.in_house?.includes('all') || this.globalFilters?.in_house?.length === 0) {
          delete this.globalFilters?.in_house; 
      }
  }
    this.subsription.add(
      this.analyticsService
        .post(AnalyticsUrlsEnum.generate_pdf, this.globalFilters)
        .subscribe(
          (pdfBlob) => {
            this.createPdfs(pdfBlob,pdfName)
          },

          (error) => {
          }
          )
        )
}

  getAppointmentStatusReport(filterParam) {   
    this.loadSpin = true;
    const filterData : object = { ...this.defaultPagination, ...filterParam };
    this.addUrlQueryParams(removeEmptyAndNullsFormObject(filterParam));
    this.statusParams =filterData
    this.subsription.add(
      this.analyticsService
        .post(AnalyticsUrlsEnum.status_report, filterData)
        .subscribe(
          (data) => {
            this.appointmentStatusReport = data['result']
              ? [...data['result']?.data]
              : [];
            this.totalRecord = this.appointmentStatusReport?.pop()?.count;
            this.loadSpin = false;
          },
          (err) => {
            this.loadSpin = false;
          }
        )
    );
  }



  reportFilter(params) {
    this.filterFormDataValue = params;
    this.page.pageNumber = 1;
    params = {
      page: this.page.pageNumber,
      per_page: this.page.size,
      paginate: true,
      ...params,
    };
    if (
      this.filterFormDataValue &&
      (this.filterFormDataValue['start_date'] == null ||
        this.filterFormDataValue['end_date'] == null)
    ) {
      this.reportFilterComponent.loadSpin = false;
      this.toaster.error('Date Range Field is Required', 'Error');
      return false;
    }
    this.getAppointmentStatusReport(params);
  }

  generateStatusPDF(){
    this.loadSpin = true;
    const filterData : object = { ...this.defaultPagination, ...this.statusParams };
    this.addUrlQueryParams(removeEmptyAndNullsFormObject(filterData));
    const pdfName : string = 'AppointmentStatusReport.pdf';
    this.subsription.add(
      this.analyticsService
        .post(AnalyticsUrlsEnum.generate_status_report_pdf, filterData)
        .subscribe(
          (pdfBlob) => {
            this.createPdfs(pdfBlob,pdfName)
          },

          (error) => {
          }
          ))
  }

  createPdfs(pdfBlob,pdfName){
    const result :string = pdfBlob['result'];
    const data : string = result['data'];
    const desiredObj : string = data['data'];
    const binaryString : string = window?.atob(desiredObj);
    const len : number = binaryString?.length;
    const bytes : Uint8Array = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString?.charCodeAt(i);
      }

    const blob : Blob = new Blob([bytes], { type: 'application/pdf' });
    const link : HTMLAnchorElement = document?.createElement('a');
    link.href = window?.URL.createObjectURL(blob);
    link.download = pdfName;
    link.click();
    this.loadSpin = false;
  }
  resetFilter(params) {
    if (this.appointmentStatusReportTypeId == this.appointmentStatusReportType.Detail) {
    this.page.pageNumber = 1;
    this.filterFormDataValue = params;
    params = {
      page: this.page.pageNumber,
      per_page: this.page.size,
      paginate: true,
      ...params,
    };
    this.getAppointmentStatusReport(params);
    }else {
      this.paymentSummaryReportData = [];
      this.lastRowData = [];
      this.showSummaryTable = false;
  }
  }

  onPageChange(event) {
    this.limit = event?.limit;
    this.nf2Offset = event?.offset;
    this.nf2ActivePage = event?.offset + 1;
    const PaginationParams : object = {
      ...this.filterParam,
      page: this.nf2ActivePage,
      per_page: this.limit,
      pagination: 1,
    };
    this.getAppointmentStatusReport(PaginationParams);    
  }

  openCustomoizeColumn(CustomizeColumnModal) {
    const ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      windowClass: 'modal-lg-package-generate',
    };
    this.modalCols = [];
    let self = this;
    this.columns?.forEach((element) => {
      let obj = self?.alphabeticColumns?.find((x) => x?.name === element?.name);
      if (obj) {
        this.modalCols?.push({ header: element?.name, checked: obj?.checked });
      }
    });
    this.CustomizeColumnModal.show();
  }

  onConfirm(click) {
    if (this.isAllFalse && !this.colSelected) {
      this.toaster.error('At Least 1 Column is Required.', 'Error');
      return false;
    }
    if (click) {
      this.customizedColumnComp;
      this.modalCols = makeDeepCopyArray(this.customizedColumnComp?.modalCols);
      let data: any = [];
      this.modalCols?.forEach((element) => {
        if (element?.checked) {
          data?.push(element);
        }
        let obj = this.alphabeticColumns?.find(
          (x) => x?.name === element?.header
        );
        if (obj) {
          if (obj?.name == element?.header) {
            obj.checked = element?.checked;
          }
        }
      });
      this.localStorage.setObject(
        'appointmentStatusReportsTable' + this.storageData?.getUserId(),
        data
      );
    }
    let groupByHeaderCol = getIdsFromArray(this.modalCols, 'header'); // pick header
    this.columns?.sort(function (a, b) {
      return (
        groupByHeaderCol?.indexOf(a.name) - groupByHeaderCol?.indexOf(b.name)
      );
    });
    this.alphabeticColumns?.forEach((element) => {
      let currentColumnIndex = findIndexInData(
        this.columns,
        'name',
        element.name
      );
      if (currentColumnIndex != -1) {
        this.columns[currentColumnIndex]['checked'] = element?.checked;
        this.columns = [...this.columns];
      }
    });
    let columnsBody = makeDeepCopyArray(this.columns);
    this.appointmentStatusListTable._internalColumns = columnsBody.filter(
      (c) => {
        return c?.checked == true;
      }
    );
    let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
    this.appointmentStatusListTable?._internalColumns.sort(function (a, b) {
      return groupByHeader?.indexOf(a.name) - groupByHeader?.indexOf(b.name);
    });

    window?.dispatchEvent(new Event('resize'));
    this.CustomizeColumnModal?.hide();
  }

  onCancel() {
    this.CustomizeColumnModal?.hide();
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

  entryCountSelection(value: string) {
    this.limit = parseInt(value);
    this.nf2Offset = 0;
    const pageParams : object = {
      ...this.filterParam,
      page: 1,
      per_page: value,
      pagination: 1,
    };

    this.getAppointmentStatusReport(pageParams);
  }

  navigateTo(caseid) {
    if (
      this.aclService?.hasPermission(
        this.userPermissions?.patient_case_list_patient_summary_menu
      )
    ) {
      this.router?.navigateByUrl(
        `/front-desk/cases/edit/${caseid}/patient/patient_summary`
      );
    } else if (
      this.aclService?.hasPermission(
        this.userPermissions?.patient_case_list_case_info_menu
      )
    ) {
      this.router?.navigateByUrl(
        `/front-desk/cases/edit/${caseid}/patient/case-info`
      );
    } else if (
      this.aclService?.hasPermission(
        this.userPermissions?.patient_case_list_personal_information_menu
      )
    ) {
      if (
        this.aclService?.hasPermission(
          this.userPermissions
            ?.patient_case_list_personal_information_personal_tab
        )
      ) {
        this.router?.navigateByUrl(
          `/front-desk/cases/edit/${caseid}/patient/personal-information`
        );
      } else if (
        this.aclService?.hasPermission(
          this.userPermissions
            ?.patient_case_list_personal_information_basic_contact_tab
        )
      ) {
        this.router?.navigateByUrl(
          `/front-desk/cases/edit/${caseid}/patient/personal-information/basic-contact`
        );
      } else if (
        this.aclService?.hasPermission(
          this.userPermissions
            ?.patient_case_list_personal_information_form_filler_tab
        )
      ) {
        this.router?.navigateByUrl(
          `/front-desk/cases/edit/${caseid}/patient/personal-information/form-filler`
        );
      } else if (
        this.aclService?.hasPermission(
          this.userPermissions
            ?.patient_case_list_personal_information_emergency_contact_tab
        )
      ) {
        this.router?.navigateByUrl(
          `/front-desk/cases/edit/${caseid}/patient/personal-information/emergency-contact`
        );
      } else if (
        this.aclService.hasPermission(
          this.userPermissions
            ?.patient_case_list_personal_information_gurantor_tab
        )
      ) {
        this.router?.navigateByUrl(
          `/front-desk/cases/edit/${caseid}/patient/personal-information/guarantor`
        );
      }
    } else if (
      this.aclService?.hasPermission(
        this.userPermissions?.patient_case_list_referrals_menu
      )
    ) {
      this.router?.navigateByUrl(`/front-desk/cases/edit/${caseid}/referrals`);
    } else if (
      this.aclService?.hasPermission(
        this.userPermissions?.patient_case_list_insurance_menu
      )
    ) {
      if (
        this.aclService?.hasPermission(
          this.userPermissions?.patient_case_list_insurance_attorney_tab
        )
      ) {
        this.router?.navigate(['edit', caseid, 'case-insurance', 'attorney'], {
          relativeTo: this.activatedRoute?.parent?.parent,
        });
      } else if (
        this.aclService?.hasPermission(
          this.userPermissions?.patient_case_list_insurance_insurance_tab
        )
      ) {
        this.router?.navigate(['edit', caseid, 'case-insurance', 'insurance'], {
          relativeTo: this.activatedRoute?.parent?.parent,
        });
      } else if (
        this.aclService?.hasPermission(
          this.userPermissions?.patient_case_list_insurance_employer_tab
        )
      ) {
        this.router?.navigate(['edit', caseid, 'case-insurance', 'employer'], {
          relativeTo: this.activatedRoute?.parent?.parent,
        });
      } else if (
        this.aclService?.hasPermission(
          this.userPermissions?.patient_case_list_insurance_accident_tab
        )
      ) {
        this.router?.navigate(['edit', caseid, 'case-insurance', 'accident'], {
          relativeTo: this.activatedRoute?.parent?.parent,
        });
      } else if (
        this.aclService?.hasPermission(
          this.userPermissions?.patient_case_list_insurance_vehicle_tab
        )
      ) {
        this.router?.navigate(['edit', caseid, 'case-insurance', 'vehicle'], {
          relativeTo: this.activatedRoute?.parent?.parent,
        });
      } else if (
        this.aclService?.hasPermission(
          this.userPermissions?.patient_case_list_insurance_household_tab
        )
      ) {
        this.router?.navigate(
          ['edit', caseid, 'case-insurance', 'house-hold-info'],
          { relativeTo: this.activatedRoute?.parent?.parent }
        );
      } else if (
        this.aclService?.hasPermission(
          this.userPermissions?.patient_case_list_insurance_medical_treatment_tab
        )
      ) {
        this.router?.navigate(
          ['edit', caseid, 'case-insurance', 'medical-treatment'],
          { relativeTo: this.activatedRoute?.parent?.parent }
        );
      }
    } else if (
      this.aclService?.hasPermission(
        this.userPermissions?.patient_case_list_injury_menu
      )
    ) {
      this.router?.navigate(['edit', caseid, 'injury'], {
        relativeTo: this.activatedRoute?.parent?.parent,
      });
    } else if (
      this.aclService?.hasPermission(
        this.userPermissions?.patient_case_list_marketing_menu
      )
    ) {
      this.router?.navigate(['edit', caseid, 'marketing'], {
        relativeTo: this.activatedRoute?.parent?.parent,
      });
    } else if (
      this.aclService?.hasPermission(
        this.userPermissions?.patient_case_list_docs_menu
      )
    ) {
      this.router?.navigate(['edit', caseid, 'document'], {
        relativeTo: this.activatedRoute?.parent?.parent,
      });
    } else if (
      this.aclService?.hasPermission(
        this.userPermissions?.patient_case_list_scheduler_menu
      )
    ) {
      this.router?.navigate(['edit', caseid, 'scheduler'], {
        relativeTo: this.activatedRoute?.parent?.parent,
      });
    } else if (
      this.aclService?.hasPermission(
        this.userPermissions?.patient_case_list_visits_menu
      )
    ) {
      this.router?.navigate(['edit', caseid, 'visits'], {
        relativeTo: this.activatedRoute?.parent?.parent,
      });
    } else if (
      this.aclService?.hasPermission(
        this.userPermissions?.patient_case_list_billing_menu
      )
    ) {
      this.router?.navigate(['edit', caseid, 'billing'], {
        relativeTo: this.activatedRoute?.parent?.parent,
      });
    }
  }

  historyStats(row) {
    const ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      windowClass: 'modal_extraDOc body-scroll history-modal',
      modalDialogClass: 'modal-lg',
    };
    let modelRef = this.modalService?.open(
      CreatedHistoryComponent,
      ngbModalOptions
    );
    modelRef.componentInstance.createdInformation = [row];
  }

  ngOnDestroy(): void {
    this.subcription.forEach((sub) => {
      sub.unsubscribe();
    });
    window?.removeEventListener('resize', this.onResize.bind(this));
  }
}
