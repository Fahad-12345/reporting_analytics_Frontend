import { GroupByList, convertToNumber } from './../../constant/constants';
import { Location } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AnalyticsService } from '@appDir/analytics/analytics.service';
import { AnalyticsUrlsEnum } from '@appDir/analytics/helpers/analytics_Urls_enum';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import {  normalized, removeEmptyKeysFromObject } from '@appDir/shared/utils/utils.helpers';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription, take } from 'rxjs';
import { DownloadReport } from '../../constant/constants';
import { LeftMarginValues, LeftMarginValuesWithSubgroup, REPORT, ReportType, SubgroupBy } from '../../report.enum';
import { ReportsExcelService } from '../../reportsExcel.service';


@Component({
  selector: 'app-denial-report',
  templateUrl: './denial-report.component.html',
  styleUrls: ['./denial-report.component.scss'],
})
export class DenialReportComponent implements OnInit, OnDestroy {
  @HostListener('window:resize', ['$event'])
   headerHeight = 50;
  rowHeight = 50;
   pageLimit = 60;
 public hoveredColumn: string;
  isLoading: boolean;
  selectedRowData: any;
  transformedData: any;
  // clickedCell:boolean = false;
  
  /*** Models & Collections */
  filtersIncludesReport: any[] = [
    'facility_location_ids',
    'case_type_ids',
    'group_by',
    'subgroup_by',
    'aggregate',
    'date_range_type',
    'doctor_ids',
    'insurance_ids'
  ];
  rowData: any[] = [];
  loadSpin: boolean = false;
  filterParam: any = {};
  variable: true;
  groupBy: string = null;
  subGroupBy: string = null;
  Count: Boolean = false;
  normalizeValue = normalized;
  /** Subscriptions */
  subscription: Subscription = new Subscription();
  @ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('denialReport') denialTableList: DatatableComponent;
	customizedColumnComp: CustomizeColumnComponent;
  arrayData: any[];
  exceldata: any[];
  maindata: any[];
  mainlastdata: any[];
  queryParams:any = {};
  responseObject:any = {};
  DetailrowData: any[];
  denialdetailreport: { bill_id: any; billed_date: any; case_id: any; dos_from_date: any; dos_to_date: any; paid_Amount: any; write_off_amount: any; billed_amount: any; denied_amount: any; doa: any; case_type: any; patient_name: any; provider_name: any; practice_location: any; posted_date: any; denial_date: any; bill_recipient_name: any; };
	@ViewChild(CustomizeColumnComponent) set con(con: CustomizeColumnComponent) {
		if (con) { // initially setter gets called with undefined
			this.customizedColumnComp = con;
		}
	}
  modalCols :any[] = [];
	cols: any[] = [];
	alphabeticColumns:any[] =[];
	colSelected: boolean = true;
  	isAllFalse: boolean = false;
	denialreportlistingtable: any;
  limit: number;
  lastRowData: any[] = [];
  isCount: Boolean = false;
  // groupBY : any [] = [
  //   { id: 6, name: 'Insurance' },
  //   { id: 11, name: 'Denial Reasons' },
  //   ]
 
  columns = [
    { prop: 'bill_id', name: 'BILL ID' },
    { prop: 'billed_date', name: 'Billed Date' },
    { prop: 'case_id', name: 'Case ID' },
    { prop: 'dos_from_date', name: 'DOS FromDate' },
    { prop: 'dos_to_date', name: 'DOS ToDate' },
    { prop: 'paid_Amount', name: 'Paid Amount' },
    { prop: 'write_off_amount', name: 'Write OFF Amount' },
    { prop: 'billed_amount', name: 'Billed Amount' },
    { prop: 'denied_amount', name: 'Outstanding Amount' },
    { prop: 'doa', name: 'DOA' },
    { prop: 'case_type', name: 'Case Type' },
    { prop: 'patient_name', name: 'Patient Name' },
    { prop: 'provider_name', name: 'Provider Name' },
    { prop: 'practice_location', name: 'Practice Location' },
    { prop: 'posted_date', name: 'Posted Date' },
    { prop: 'denial_date', name: 'Denial Date' },
    { prop: 'bill_recipient_name', name: 'Bill Recipient Name' },
  ];

  Summarycolumns = [
    { prop: 'total'},
    { prop: 'balance_0_to_29_days' },
    { prop: 'balance_30_to_59_days' },
    { prop: 'balance_60_to_89_days' },
    { prop: 'balance_90_to_119_days' },
    { prop: 'balance_120_to_149_days' },
    { prop: 'balance_150_to_179_days' },
    { prop: 'balance_180plusdays'},
    { prop: 'total_denied_amount'}
  ];
  // { prop: 'empty_column_2', name: 'Empty Column 2', width: 100 },

  SelectionType = SelectionType;
  columnName: any;
  showfirstTable: boolean = true;
  showSummaryTable: boolean = false;
  newdata: any[];
  subgroupByList: any[];
  GROUPED: boolean = false;
  bigscreen : Boolean = false;
  summaryTableHeight : string = '600px'
  // copyCols: any;
  
  constructor(
    private analyticsService: AnalyticsService,
    private reportsExcelService : ReportsExcelService,
    private el: ElementRef,private renderer: Renderer2,
    private router: Router,
    private location : Location,
    private activatedRoute : ActivatedRoute
    ) {
      this.onResize();

    }

    onResize() {
      const screenWidth : number = window.innerWidth;
      if(screenWidth >= 1700){
        this.bigscreen = true
      } else if(screenWidth < 1700){
        this.bigscreen = false
      }
   }
  

  ngOnInit(): void { 
  //  this.removeQueryParams();
    this.queryfunction();
    window.addEventListener('resize', this.onResize.bind(this));
  }
  removeQueryParams(): void {
    const navigationExtras: NavigationExtras = {
      queryParams: {}, 
      // queryParamsHandling: 'merge', 
    };
    this.router.navigate([], navigationExtras);
  }

  queryfunction() {
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params && Object.keys(params).length > 0) {
        this.queryParams = params;
        this.filterParam = {
          ...params,
        };

      
        this.onApplyFilter(this.filterParam);
        this.loadSpin=true
      }
    });
  }
  
  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    window.removeEventListener('resize', this.onResize.bind(this));

  }
 
  calculateLeftMargin(prop: string): number {
    const subgroupBy = this.filterParam.subgroup_by_id ? SubgroupBy.SubgroupById : SubgroupBy.None;
    let countadjustment : number = 0;
    if(this.Count){
      countadjustment = 2
    }
    if(this.bigscreen){
      countadjustment += 1.5
    }
    switch (prop) {
      case 'total':
        return subgroupBy === SubgroupBy.None ? LeftMarginValues.Total : LeftMarginValuesWithSubgroup.Total;
      case 'balance_0_to_29_days':
        return subgroupBy === SubgroupBy.None ? LeftMarginValues.Balance0To29Days + countadjustment : LeftMarginValuesWithSubgroup.Balance0To29Days + countadjustment; 
      case 'balance_30_to_59_days':
        return subgroupBy === SubgroupBy.None ? LeftMarginValues.Balance30To59Days + countadjustment : LeftMarginValuesWithSubgroup.Balance30To59Days + countadjustment;
      case 'balance_60_to_89_days':
        return subgroupBy === SubgroupBy.None ? LeftMarginValues.Balance60To89Days + countadjustment : LeftMarginValuesWithSubgroup.Balance60To89Days + countadjustment;
      case 'balance_90_to_119_days':
        return subgroupBy === SubgroupBy.None ? LeftMarginValues.Balance90To119Days + countadjustment : LeftMarginValuesWithSubgroup.Balance90To119Days + countadjustment;
      case 'balance_120_to_149_days':
        return subgroupBy === SubgroupBy.None ? LeftMarginValues.Balance120To149Days + countadjustment: LeftMarginValuesWithSubgroup.Balance120To149Days + countadjustment;
      case 'balance_150_to_179_days':
        return subgroupBy === SubgroupBy.None ? LeftMarginValues.Balance150To179Days + countadjustment : LeftMarginValuesWithSubgroup.Balance150To179Days + countadjustment;
      case 'balance_180plusdays':
        return subgroupBy === SubgroupBy.None ? LeftMarginValues.Balance180PlusDays + countadjustment : LeftMarginValuesWithSubgroup.Balance180PlusDays + countadjustment;
      case 'total_denied_amount':
        return subgroupBy === SubgroupBy.None ? LeftMarginValues.TotalDeniedAmount + countadjustment : LeftMarginValuesWithSubgroup.TotalDeniedAmount  + countadjustment;
      default:
        return 0;
    }
  }
  
  

  //#region Events
  onApplyFilter(filterParam) {
    this.loadSpin = true;
    // this.showfirstTable = true;
    filterParam = removeEmptyKeysFromObject(filterParam);
    const keysToConvert:string[] = ['date_type', 'Aggregate', 'group_by_id', 'subgroup_by_id', 'date_range_type_id'];
    
    keysToConvert.forEach(key => convertToNumber(this.filterParam, key));
    if (filterParam?.Aggregate === REPORT.Aggregate) {
      this.Count = true;
    } else {
      this.Count = false;
    }
    this.filterParam = filterParam;
    const objectMap = {3:'Provider',4:'Patient',6:'Insurance',11:'Denial Reason'};
    if(filterParam?.group_by_id){
      this.groupBy = objectMap[filterParam.group_by_id]
    }
    if(filterParam?.subgroup_by_id){
      this.subGroupBy= objectMap[filterParam.subgroup_by_id]
    }

   this.addUrlQueryParams(this.filterParam);
    this.fetchReportsData(filterParam);
    // this.fetchlastrowData(filterParam);
  }
  onResetFilter(resetValue: any) {
    this.rowData = [];
    this.lastRowData = [];
    this.showSummaryTable = false;
     this.addUrlQueryParams({});
  }

  onCatchGroupDataEvent(groupData: any,subgroupData:any) {
    this.GROUPED = true;
    this.groupBy = groupData?.groupBy ? groupData?.groupBy : '';
    this.subGroupBy = subgroupData?.subGroupBy ? subgroupData?.subGroupBy : '';
    
  }

  
 
  //#endregion

  //#region Methods
  fetchReportsData(filterParam?) {
    this.loadSpin = true;
    const filterData = { ...filterParam };
    this.subscription.add(
      this.analyticsService
      .post(AnalyticsUrlsEnum.denial_report, filterData)
      .subscribe(
        (data) => {
          this.lastRowData = []
            this.loadSpin = false;
            const tempPaymentData = data['result']?.data?.detailResults
            ? [...data['result']?.data?.detailResults]
            : [];
            switch(tempPaymentData?.length){
              case 1:
                this.summaryTableHeight = '100px'
                break;
              case 2:
                this.summaryTableHeight = '150px'
                break;
              case 3:
                this.summaryTableHeight = '200px'
                break;
              case 4:
                this.summaryTableHeight = '250px'
                  break;
              case 5:
                this.summaryTableHeight = '300px'
                break;
              case 6:
                this.summaryTableHeight = '350px'
                break;
              case 7:
                this.summaryTableHeight = '400px'
                break;
              case 8:
                this.summaryTableHeight = '450px'
                break;
              case 9:
                this.summaryTableHeight = '500px'
                break;
              default:
                this.summaryTableHeight = '600px'
                                                                      
            }
            setTimeout(() => {

              this.rowData = tempPaymentData;

              this.lastRowData = data['result']?.data?.summaryResults
              ? [...data['result']?.data?.summaryResults]
              : [];
              if(tempPaymentData.length >= 1){
              this.showSummaryTable = true 
              }else {
                this.showSummaryTable = false
              }
            }, 100);
          },
          (err) => {
            this.loadSpin = false;
            console.error('Error fetching data:', err);
          }
        )
    );
   
  }

 

  getRowClass(row: any) {
    // Check if it's the last row and apply a custom class
    if (row === this.lastRowData) {
      this.renderer.addClass(this.el.nativeElement, 'bold-row');
    }
    return '';
  }

  setHoveredColumn(columnName: string | null): void {
    this.hoveredColumn = columnName;
  }
  generateExcel() {
     this.loadSpin = true;
    this.filterParam.report_type = ReportType.Denial_Report;
    this.subscription.add(
      this.analyticsService
        .post(AnalyticsUrlsEnum.export_to_excel, this.filterParam)
        .pipe(take(1))
        .subscribe(
          (res: any) => {
            const jsonData = res;
            const csvContent = jsonData.result.csvContent;

            const filteredCsvContent = this.reportsExcelService.getprocessedCsv(csvContent,ReportType.Denial_Report)
            // Split the csvContent string into an array of rows  
            if (filteredCsvContent) {
              DownloadReport(filteredCsvContent, 'denialReport');
            }
             this.loadSpin = false;
          },
          (error) => {
             this.loadSpin = false;
            console.error('Error exporting to Excel:', error);
          }
        )
    );
  }
  toggleTables(): void {
    this.showfirstTable = !this.showfirstTable;
  }

 

  onCellClick(rowIndex: number, columnName: string,shouldExecute:boolean) {
     const clickedRowData = this.rowData[rowIndex];

     const requestData: any = {};

     const commonParams = {
      date_range_type_id: this.filterParam?.date_range_type_id,
      date_type: this.filterParam?.date_type,
      start_date: this.filterParam?.start_date,
      end_date: this.filterParam?.end_date,
      facility_location_ids:this.filterParam?.facility_location_ids,
      case_type_ids:this.filterParam?.case_type_ids,
      patient_ids:this.filterParam?.patient_ids,
      insurance_ids:this.filterParam?.insurance_ids,
      doctor_ids:this.filterParam?.doctor_ids
  };


// Check if denial_reason is available
if (clickedRowData?.denial_type_id) {
  
  requestData.denial_type_id = clickedRowData?.denial_type_id;
}

// Check if group_by_name is available
if (clickedRowData?.group_by_id && !clickedRowData?.subgroup_by_id ) {
  
  requestData.group_by_id = clickedRowData?.group_by_id;
  requestData.maingroup_by_id = this.filterParam.group_by_id;
}

// Check if sub_group_by_name is available
if (clickedRowData?.subgroup_by_id && clickedRowData?.group_by_id) {

  requestData.group_by_id = clickedRowData?.group_by_id;
  requestData.maingroup_by_id = this.filterParam.group_by_id
  requestData.subgroup_by_id = clickedRowData?.subgroup_by_id;
  requestData.mainsubgroup_by_id = this.filterParam?.subgroup_by_id;
}

requestData.columnName = columnName;

Object.assign(requestData,commonParams);



// Now you have a requestData object with the necessary properties
if(shouldExecute){
     this.loadSpin = true
      this.subscription.add(
        this.analyticsService
        .post(AnalyticsUrlsEnum.denial_detail_report, requestData)
        .subscribe(
          (data) => {
            this.transformedData= data['result'].data.denialdetailResults[0]
            ? [...data['result'].data.denialdetailResults]
            : [];
  const detailReportData = this.transformedData[0];
   this.loadSpin = false

   if (shouldExecute) {
    const columnDaysMap = {
        'Balance_0_to_29_Days': '0_to_29_days',
        'Balance_30_to_59_Days': '30_to_59_days',
        'Balance_60_to_89_Days': '60_to_89_days',
        'Balance_90_to_119_Days': '90_to_119_days',
        'Balance_120_to_149_Days': '120_to_149_days',
        'Balance_150_to_179_Days': '150_to_179_days',
        'Balance_180PlusDays': '180plusdays',
        'total_denied_amount': 'total'
    };

    function getDetailReportData(key)
 {
        return {
            billIds: detailReportData[`bill_id_${key}`],
            billedDates: detailReportData[`billed_date_${key}`],
            caseIds: detailReportData[`case_id_${key}`],
            DOSFromDate: detailReportData[`dos_from_date_${key}`],
            DOSToDate: detailReportData[`dos_to_date_${key}`],
            paidAmount: detailReportData[`paid_amount_${key}`],
            writeoffAmount: detailReportData[`write_off_amount_${key}`],
            billedAmount: detailReportData[`billed_amount_${key}`],
            deniedAmount: detailReportData[`denied_amount_${key}`], 
            DOA: detailReportData[`doa_${key}`],
            CaseType: detailReportData[`case_type_${key}`],
            PatientName: detailReportData[`patient_name_${key}`],
            providerName: detailReportData[`provider_name_${key}`],
            practiceLocation: detailReportData[`practice_location_${key}`],
            PostedDate: detailReportData[`posted_date_${key}`],
            denialDate: detailReportData[`denial_date_${key}`],
            BillRecipientName: detailReportData[`bill_recipient_name_${key}`]
        };
    }

    if (columnName in columnDaysMap) {
        const key = columnDaysMap[columnName];
        const reportData = getDetailReportData(key)
;

        if (reportData.billIds !== null) {
            this.transformedData = reportData.billIds.map((billId, index) => ({
                bill_id: billId,
                billed_date: reportData.billedDates[index],
                case_id: reportData.caseIds[index],
                dos_from_date: reportData.DOSFromDate[index],
                dos_to_date: reportData.DOSToDate[index],
                paid_amount: reportData.paidAmount[index],
                write_off_amount: reportData.writeoffAmount[index],
                billed_amount: reportData.billedAmount[index],
                denied_amount: reportData.deniedAmount[index],
                doa: reportData.DOA[index],
                case_type: reportData.CaseType[index],
                patient_name: reportData.PatientName[index],
                provider_name: reportData.providerName[index],
                practice_location: reportData.practiceLocation[index],
                posted_date: reportData.PostedDate[index],
                denial_date: reportData.denialDate[index],
                bill_recipient_name: reportData.BillRecipientName[index]
            }));
            const navigationExtras: NavigationExtras = {
              state: {
                transformedData: this.transformedData,
              },
              queryParams:this.filterParam
            };  
            // Navigate to the report page
            this.router.navigate(['/front-desk/reports/denial-detail-reports'], navigationExtras);
        }
    }
}
  }
)
)
}
  }
/**
	 * Queryparams to make unique URL
	 * @param params
	 * @returns void
	 */
addUrlQueryParams(params: any): void {
  this.location.replaceState(this.router.createUrlTree([], { queryParams: params }).toString());
}
//   
// }
}

