import { ArSpacing, PayLeftMarginValues, billRecTyp, groupBy, valuewithgroupSubgroupByANDBilRec, valuewithsubgroupBy } from './../../report.enum';
import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AnalyticsService } from '@appDir/analytics/analytics.service';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { RequestService } from '@appDir/shared/services/request.service';
import {  normalized, removeEmptyKeysFromObject } from '@appDir/shared/utils/utils.helpers';
import { Subscription, take, filter } from 'rxjs';
import { ReportsService } from '../../reports.service';
import { AnalyticsUrlsEnum } from '@appDir/analytics/helpers/analytics_Urls_enum';
import { DownloadReport,convertToNumber } from '../../constant/constants';
// import { ArSpacing, ReportType } from '../../report.enum';
import { LeftMarginValues, LeftMarginValuesWithSubgroup, ReportType, SubgroupBy } from '../../report.enum';
import { ReportsExcelService } from '../../reportsExcel.service';
import { group } from '@angular/animations';

@Component({
  selector: 'app-a-r-report',
  templateUrl: './a-r-report.component.html',
  styleUrls: ['./a-r-report.component.scss'],

})
export class ARReportComponent implements OnInit {
  @HostListener('window:resize', ['$event'])
   headerHeight = 50;
   rowHeight = 50;
   pageLimit = 30;  
  showSummaryTable:boolean = false;
  url: any;
  Count: Boolean = false;
  filtersIncludesReport: any[] = 
  ['insurance_ids',
  'employer_ids', 
  'facility_location_ids', 
  'case_type_ids',
  'group_by',
  'subgroup_by',
  'patient_name',
  'firm_name',
  'attornyName', 
  'doctor_ids', 
  'speciality_ids', 
  'date_type',
  'start_date', 
  'end_date', 
  'bill_recipient_type_id', 
  'as_of'];
  rowData: any[] = [];
  subscription: Subscription = new Subscription();
  public loadSpin: boolean = false;
  filterParam: any;
  queryParams:any = {};
  recipient:boolean = false;
  lastRowIndex: number;
  secondLastRowIndex: number;
  bigscreen : Boolean = false
  summarydata: any[] = [];
  normalizeValue = normalized;
  Summarycolumns = [
     {prop: 'resulttype'},
    { prop: 'billed_amount'},
    { prop: 'check_amount' },
    { prop: 'write_off_amount' },
    { prop: 'balance_0_to_29_days'},
    { prop: 'balance_30_to_59_days'},
    { prop: 'balance_60_to_89_days' },
    { prop: 'balance_90_to_119_days' },
    { prop: 'balance_120_to_149_days' },
    { prop: 'balance_150plusdays' },
    { prop: 'total_outstanding_amount' }
  ];
  Percentdata: any[];
  defaultPagination:any = {};
  transformedData: any[];
  groupBy: string = null;
  subGroupBy: string = null;
  tableHeight1: string = ''; 
  ScrollBarV1: boolean = false; 


  constructor(public reportService: ReportsService, public datePipeService: DatePipeFormatService, private _route: ActivatedRoute, private _router: Router,
    public requestService: RequestService, private analyticsService: AnalyticsService,private el:ElementRef,
    private location: Location, private router: Router,
    private renderer: Renderer2,
    private reportsExcelService : ReportsExcelService,
    private activatedRoute : ActivatedRoute,
    private cdRef:ChangeDetectorRef) {
      this.onResize();
  }


 

  onResize() {
    const screenWidth : number  = window.innerWidth;
    if(screenWidth >= 1700){
      this.bigscreen = true
    } else if(screenWidth < 1700){
      this.bigscreen = false
    }
 }




  ngOnInit(): void {
    // this.removeQueryParams();
    this.queryfunction();
    window.addEventListener('resize', this.onResize.bind(this));
   
  }
  queryfunction() {
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params && Object.keys(params).length > 0) {
        this.queryParams = params;
        this.filterParam = {
          ...params,
        };
        this.applyFilter(this.filterParam);
        this.loadSpin = true;
      }
    });
  }

 

 
  
  
  
  
  applyFilter(params) {
    this.filterParam = removeEmptyKeysFromObject(params);
    const keysToConvert:string[] = ['date_type', 'bill_recipient_type_id','Aggregate', 'group_by_id', 'subgroup_by_id', 'date_range_type_id'];
    keysToConvert.forEach(key => convertToNumber(this.filterParam, key));
    if(this.filterParam.bill_recipient_type_id){
      this.recipient = true;
    }else {
      this.recipient = false;
    }
    const data = { ...this.filterParam }
    
    const objectMap = {1:'Practice Location',2:'Specialty',3:'Provider', 16:'Practice', 5:'Bill Recipient Type', 10:'Case Type'};
    if(this.filterParam.group_by_id){
      this.groupBy = objectMap[this.filterParam.group_by_id]
    }
    if(this.filterParam.subgroup_by_id){
      this.subGroupBy= objectMap[this.filterParam.subgroup_by_id]
    }
    this.addUrlQueryParams(this.filterParam);
      this.fetchReportsData(data); 
  }

  resetFilter(event) {
    this.filterParam = {};
    this.rowData = [];
    this.showSummaryTable = false;
    this.addUrlQueryParams({});

  }

  onCatchGroupDataEvent(groupData: any,subgroupData:any) {
    // this.GROUPED = true;
    this.groupBy = groupData?.groupBy ? groupData?.groupBy : '';
    this.subGroupBy = subgroupData?.subGroupBy ? subgroupData?.subGroupBy : '';
    
  }

  fetchReportsData(filterParam?) {
    this.loadSpin = true;
    const filterData = { ...filterParam };

 
    
    this.subscription.add(
      this.analyticsService.post(AnalyticsUrlsEnum.account_receivable_report, filterData).subscribe((data) => {
        this.loadSpin = false;
        const tempPaymentData = data['result'].data.detailResults ? [...data['result'].data.detailResults] : [];

        
        switch(tempPaymentData?.length){
          case 1:
            this.tableHeight1 = '100px'
            break;
          case 2:
            this.tableHeight1 = '150px'
            break;
          case 3:
            this.tableHeight1 = '200px'
            break;
          case 4:
            this.tableHeight1 = '250px'
              break;
          case 5:
            this.tableHeight1 = '250px'
            break;
          case 6:
            this.tableHeight1 = '300px'
            break;
          case 7:
            this.tableHeight1 = '400px'
            break;
          case 8:
            this.tableHeight1 = '400px'
            break;
          case 9:
            this.tableHeight1 = '450px'
            break;
          default:
            this.tableHeight1= '600px'
        }
        setTimeout(() => {
          this.rowData = tempPaymentData;
            this.rowData = this.rowData.map(row => ({
              ...row,
              recipient_combined: `${row.bill_recipient_name || ''}  ${row.invoice_recipient_name || ''}`
            }));

           
          this.summarydata = data['result'].data.sumResults ? [...data['result'].data.sumResults] : []
         this.Percentdata = data['result'].data.PercentageResults ? [...data['result'].data.PercentageResults] : []
          if(tempPaymentData.length > 0){
          this.showSummaryTable = true
          }else {
            this.showSummaryTable = false
          }
        }, 100);
      },
        err => {
          this.loadSpin = false;
        }),
    );
  }
  
  onCellClick(rowIndex: number, columnName: string,shouldExecute:boolean) {
    const clickedRowData = this.rowData[rowIndex];
   
    const requestData: any = {};

    const commonParams = {
      date_type: this.filterParam?.date_type,
      start_date: this.filterParam?.start_date,
      end_date: this.filterParam?.end_date,
      facility_location_ids: this.filterParam?.facility_location_ids,
      case_type_ids:this.filterParam?.case_type_ids,
      speciality_ids:this.filterParam?.speciality_ids,
      doctor_ids:this.filterParam?.doctor_ids,
      insurance_ids:this.filterParam?.insurance_ids,
      patient_ids:this.filterParam?.patient_ids,
      attorney_ids:this.filterParam?.attorney_ids,
      employer_ids:this.filterParam?.employer_ids,
      firm_ids:this.filterParam?.firm_ids
  };

  Object.assign(requestData,commonParams);

if ((clickedRowData?.bill_recipient_type_id || clickedRowData?.bill_recipient_type_name) && !clickedRowData.group_by_id && !clickedRowData.subgroup_by_id ) {
  
   requestData.bill_recipient_type_id = clickedRowData?.bill_recipient_type_id;
   requestData.bill_recipient_type_name = `'${clickedRowData?.bill_recipient_type_name?.replace(/\(.*\)/, '').trim()}'`;

}

//bill_recipient_cases

if (clickedRowData?.bill_recipient_id && !clickedRowData.invoice_recipient_name && !clickedRowData.group_by_id && !clickedRowData.subgroup_by_id) {
  
  requestData.bill_recipient_id = clickedRowData?.bill_recipient_id;
  requestData.bill_recipient_type_id = clickedRowData?.bill_recipient_type_id;
}

if (clickedRowData?.group_by_id && !clickedRowData.subgroup_by_id && !clickedRowData.invoice_recipient_name && !clickedRowData.bill_recipient_id) {
  requestData.maingroup_by_id = this.filterParam?.group_by_id;
  
   requestData.group_by_id = clickedRowData?.group_by_id;
}

if(clickedRowData?.subgroup_by_id && clickedRowData?.group_by_id  && !clickedRowData.invoice_recipient_name && !clickedRowData.bill_recipient_id){
  
  requestData.maingroup_by_id = this.filterParam?.group_by_id;
  requestData.mainsubgroup_by_id = this.filterParam?.subgroup_by_id;
  
  requestData.group_by_id = clickedRowData?.group_by_id;
  requestData.subgroup_by_id = clickedRowData?.subgroup_by_id;

}
if(!clickedRowData?.subgroup_by_id && clickedRowData?.group_by_id && !clickedRowData.invoice_recipient_name && clickedRowData?.bill_recipient_id){
  
  requestData.maingroup_by_id = this.filterParam?.group_by_id;
  requestData.mainsubgroup_by_id = this.filterParam?.subgroup_by_id;
  requestData.group_by_id = clickedRowData?.group_by_id;
  requestData.bill_recipient_id = clickedRowData?.bill_recipient_id;
  requestData.bill_recipient_type_id = clickedRowData?.bill_recipient_type_id;
  
}
if(clickedRowData?.group_by_id &&  clickedRowData?.subgroup_by_id && !clickedRowData.invoice_recipient_name && clickedRowData?.bill_recipient_id ){
  requestData.maingroup_by_id = this.filterParam?.group_by_id;
  requestData.mainsubgroup_by_id = this.filterParam?.subgroup_by_id;
 
  requestData.group_by_id = clickedRowData?.group_by_id;
  requestData.subgroup_by_id = clickedRowData?.subgroup_by_id;
  requestData.bill_recipient_id = clickedRowData?.bill_recipient_id;
  requestData.bill_recipient_type_id = clickedRowData?.bill_recipient_type_id;
}
 // Invoice-Recipient_cases
 if (clickedRowData?.invoice_recipient_name && !clickedRowData?.bill_recipient_id  && !clickedRowData?.group_by_id && !clickedRowData?.subgroup_by_id) {
  
  requestData.invoice_recipient_name =  `'${clickedRowData?.invoice_recipient_name?.replace(/\(.*\)/, '').trim()}'`;
  requestData.bill_recipient_type_name = `'${clickedRowData?.bill_recipient_type_name?.replace(/\(.*\)/, '').trim()}'`;
}

if (clickedRowData?.group_by_id && !clickedRowData?.bill_recipient_id && !clickedRowData?.subgroup_by_id && !clickedRowData?.invoice_recipient_name) {
  requestData.maingroup_by_id = this.filterParam?.group_by_id;
  
   requestData.group_by_id = clickedRowData?.group_by_id;
}

if(clickedRowData?.subgroup_by_id && !clickedRowData?.bill_recipient_id && clickedRowData?.group_by_id && !clickedRowData?.invoice_recipient_name){
  
  requestData.maingroup_by_id = this.filterParam?.group_by_id;
  requestData.mainsubgroup_by_id = this.filterParam?.subgroup_by_id;
  
  requestData.group_by_id = clickedRowData?.group_by_id;
  requestData.subgroup_by_id = clickedRowData?.subgroup_by_id;

}
if(!clickedRowData?.subgroup_by_id && !clickedRowData?.bill_recipient_id && clickedRowData?.group_by_id && clickedRowData?.invoice_recipient_name){
  
  requestData.maingroup_by_id = this.filterParam?.group_by_id;
  requestData.mainsubgroup_by_id = this.filterParam?.subgroup_by_id;
  requestData.group_by_id = clickedRowData?.group_by_id;
  requestData.invoice_recipient_name =  `'${clickedRowData?.invoice_recipient_name?.replace(/\(.*\)/, '').trim()}'`;
  requestData.bill_recipient_type_name = `'${clickedRowData?.bill_recipient_type_name?.replace(/\(.*\)/, '').trim()}'`;
  
}
if(clickedRowData?.group_by_id && !clickedRowData?.bill_recipient_id &&  clickedRowData?.subgroup_by_id && clickedRowData.invoice_recipient_name){
  requestData.maingroup_by_id = this.filterParam?.group_by_id;
  requestData.mainsubgroup_by_id = this.filterParam?.subgroup_by_id;
 
  requestData.group_by_id = clickedRowData?.group_by_id;
  requestData.subgroup_by_id = clickedRowData?.subgroup_by_id;
  requestData.invoice_recipient_name =  `'${clickedRowData?.invoice_recipient_name?.replace(/\(.*\)/, '').trim()}'`;
  requestData.bill_recipient_type_name = `'${clickedRowData?.bill_recipient_type_name?.replace(/\(.*\)/, '').trim()}'`;
}
// Add columnName to the requestData object
requestData.columnName = columnName;

if (shouldExecute) {
  this.loadSpin = true;
  this.subscription.add(
    this.analyticsService
      .post(AnalyticsUrlsEnum.AR_detail_report, requestData)
      .subscribe((data) => {
        
        this.transformedData = data['result']?.data?.ARdetailResults[0]
          ? [...data['result']?.data?.ARdetailResults]
          : [];

        const detailReportData : string[] = this.transformedData[0];
      
        this.loadSpin = false;
if(shouldExecute){
        const transformData = (daysLabel: string) => {
          const billIds : string[] = detailReportData[`bill_label_${daysLabel}`];
          const mappedData = billIds?.map((billId, index) => ({
            bill_id: billId,
            case_id: detailReportData[`case_id_${daysLabel}`][index],
            billed_date: detailReportData[`billed_date_${daysLabel}`][index],
            accident_date: detailReportData[`accident_date_${daysLabel}`][index],
            bill_status: detailReportData[`bill_status_${daysLabel}`][index],
            eor_status: detailReportData[`eor_status_${daysLabel}`][index],
            denial_status: detailReportData[`denial_status_${daysLabel}`][index],
            verification_status: detailReportData[`verification_status_${daysLabel}`][index],
            payment_status: detailReportData[`payment_status_${daysLabel}`][index],
            case_type: detailReportData[`case_type_${daysLabel}`][index],
            patient_name: detailReportData[`patient_name_${daysLabel}`][index],
            specialty: detailReportData[`speciality_${daysLabel}`][index],
            practice_location: detailReportData[`practice_location_${daysLabel}`][index],
            provider_name: detailReportData[`provider_name_${daysLabel}`][index],
            dos_from_date: detailReportData[`dos_from_date_${daysLabel}`][index],
            dos_to_date: detailReportData[`dos_to_date_${daysLabel}`][index],
            check_date: detailReportData[`check_date_${daysLabel}`][index],
            check_amount: detailReportData[`check_amount_${daysLabel}`][index],
            billed_amount: detailReportData[`billed_amount_${daysLabel}`][index],
            paid_amount: detailReportData[`paid_amount_${daysLabel}`][index],
            outstanding_amount: detailReportData[`outstanding_amount_${daysLabel}`][index],
            write_off: detailReportData[`write_off_${daysLabel}`][index],
            over_payment: detailReportData[`overpayment_${daysLabel}`][index],
            interest_amount: detailReportData[`interest_${daysLabel}`][index],
            attorney_name: detailReportData[`attorney_name_${daysLabel}`][index],
            firm_name: detailReportData[`firm_name_${daysLabel}`][index],
            bill_recipient_name: detailReportData[`bill_recipient_name_${daysLabel}`][index],
            denial_type: detailReportData[`denial_type_${daysLabel}`][index]
          }));
          return mappedData;
        };

        const navigateToReport = (transformedData) => {
          const navigationExtras: NavigationExtras = {
            state: {
              transformedData: transformedData,
            },
            queryParams: this.filterParam
          };
          this.router.navigate(['/front-desk/reports/AR-detail-reports'], navigationExtras);
        };

        const daysMapping : object = {
          'Balance_0_to_29_Days': '0_to_29_days',
          'Balance_30_to_59_Days': '30_to_59_days',
          'Balance_60_to_89_Days': '60_to_89_days',
          'Balance_90_to_119_Days': '90_to_119_days',
          'Balance_120_to_149_Days': '120_to_149_days',
          'Balance_150PlusDays' : '150plusdays',
          'total_outstanding_amount' : 'total'
          
        };

        if (columnName in daysMapping) {
          const daysLabel : string = daysMapping[columnName];
          if (detailReportData[`bill_label_${daysLabel}`] !== null) {
            this.transformedData = transformData(daysLabel);
            navigateToReport(this.transformedData);
          }
        }
      }
      })
  );
}
}
  
      
  getRowClass(row: any) {
    // Check if it's the last row and apply a custom class
    if (row === this.summarydata) {
      this.renderer.addClass(this.el.nativeElement, 'bold-row');
    }
    return '';
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    window.removeEventListener('resize', this.onResize.bind(this));
  }
   calculateLeftMargin(prop: string): number {
    const subgroupBy = this.filterParam.subgroup_by_id ? SubgroupBy.SubgroupById : SubgroupBy.None;
    const groupedBy = this.filterParam.group_by_id ? groupBy.groupById : groupBy.None;
    const billRecDim = this.filterParam.bill_recipient_type_id ? billRecTyp.bilRec : billRecTyp.None;
    let countadjustment : number = 0;
    if(this.Count){
      countadjustment = 2
    }
    if(this.bigscreen){
      countadjustment += 1.5
    }
    switch (prop) {
      case 'resulttype':
        return subgroupBy === SubgroupBy.None && groupedBy === groupBy.None  ? ArSpacing.resulttype:
        subgroupBy === SubgroupBy.None && groupedBy !== groupBy.None && billRecDim !== billRecTyp.None ? valuewithsubgroupBy.Total:
         subgroupBy !== SubgroupBy.None && groupedBy !== groupBy.None && billRecDim === billRecTyp.None ? 
         valuewithsubgroupBy.Total : groupedBy !== groupBy.None && subgroupBy === SubgroupBy.None && billRecDim === billRecTyp.None ? ArSpacing.resulttype : valuewithgroupSubgroupByANDBilRec.Total;
      case 'billed_amount':
          return subgroupBy === SubgroupBy.None && groupedBy === groupBy.None  ? ArSpacing.billed_amount + countadjustment :
          subgroupBy === SubgroupBy.None && groupedBy !== groupBy.None && billRecDim !== billRecTyp.None ? valuewithsubgroupBy.billed_amount:
          
          subgroupBy !== SubgroupBy.None && groupedBy !== groupBy.None && billRecDim === billRecTyp.None ? 
          valuewithsubgroupBy.billed_amount + countadjustment : groupedBy !== groupBy.None && subgroupBy === SubgroupBy.None && billRecDim === billRecTyp.None  ? ArSpacing.billed_amount : valuewithgroupSubgroupByANDBilRec.billed_amount + countadjustment ;
      case 'check_amount':
            return subgroupBy === SubgroupBy.None && groupedBy === groupBy.None  ? ArSpacing.check_amount + countadjustment :
            subgroupBy === SubgroupBy.None && groupedBy !== groupBy.None && billRecDim !== billRecTyp.None ? valuewithsubgroupBy.check_amount:
            subgroupBy !== SubgroupBy.None && groupedBy !== groupBy.None && billRecDim === billRecTyp.None ?  
            valuewithsubgroupBy.check_amount + countadjustment : groupedBy !== groupBy.None && subgroupBy === SubgroupBy.None && billRecDim === billRecTyp.None ? ArSpacing.check_amount : valuewithgroupSubgroupByANDBilRec.check_amount + countadjustment;
      case 'write_off_amount':
        return subgroupBy === SubgroupBy.None && groupedBy === groupBy.None  ? ArSpacing.write_off_amount + countadjustment :
        subgroupBy === SubgroupBy.None && groupedBy !== groupBy.None && billRecDim !== billRecTyp.None ? valuewithsubgroupBy.write_off_amount:
        subgroupBy !== SubgroupBy.None && groupedBy !== groupBy.None && billRecDim === billRecTyp.None ?  
        valuewithsubgroupBy.write_off_amount + countadjustment: groupedBy !== groupBy.None && subgroupBy === SubgroupBy.None && billRecDim === billRecTyp.None ? ArSpacing.write_off_amount : valuewithgroupSubgroupByANDBilRec.write_off_amount + countadjustment ;
      case 'balance_0_to_29_days':
        return subgroupBy === SubgroupBy.None && groupedBy === groupBy.None   ? ArSpacing.Balance0To29Days + countadjustment  :
        subgroupBy === SubgroupBy.None && groupedBy !== groupBy.None && billRecDim !== billRecTyp.None ? valuewithsubgroupBy.Balance0To29Days:
        subgroupBy !== SubgroupBy.None && groupedBy !== groupBy.None && billRecDim === billRecTyp.None? 
        valuewithsubgroupBy.Balance0To29Days + countadjustment: groupedBy !== groupBy.None && subgroupBy === SubgroupBy.None && billRecDim === billRecTyp.None ? ArSpacing.Balance0To29Days : valuewithgroupSubgroupByANDBilRec.Balance0To29Days + countadjustment ; 
      case 'balance_30_to_59_days':
        return subgroupBy === SubgroupBy.None && groupedBy === groupBy.None  ? ArSpacing.Balance30To59Days + countadjustment  :
        subgroupBy === SubgroupBy.None && groupedBy !== groupBy.None && billRecDim !== billRecTyp.None ? valuewithsubgroupBy.Balance30To59Days:
        subgroupBy !== SubgroupBy.None && groupedBy !== groupBy.None && billRecDim === billRecTyp.None ? 
        valuewithsubgroupBy.Balance30To59Days + countadjustment: groupedBy !== groupBy.None && subgroupBy === SubgroupBy.None && billRecDim === billRecTyp.None ? ArSpacing.Balance30To59Days : valuewithgroupSubgroupByANDBilRec.Balance30To59Days + countadjustment ;
      case 'balance_60_to_89_days':
        return subgroupBy === SubgroupBy.None && groupedBy === groupBy.None   ? ArSpacing.Balance60To89Days + countadjustment  :
        subgroupBy === SubgroupBy.None && groupedBy !== groupBy.None && billRecDim !== billRecTyp.None ? valuewithsubgroupBy.Balance60To89Days:
        subgroupBy !== SubgroupBy.None && groupedBy !== groupBy.None && billRecDim === billRecTyp.None ? 
        valuewithsubgroupBy.Balance60To89Days + countadjustment: groupedBy !== groupBy.None && subgroupBy === SubgroupBy.None && billRecDim === billRecTyp.None ? ArSpacing.Balance60To89Days : valuewithgroupSubgroupByANDBilRec.Balance60To89Days + countadjustment ;
      case 'balance_90_to_119_days':
        return subgroupBy === SubgroupBy.None && groupedBy === groupBy.None   ? ArSpacing.Balance90To119Days + countadjustment  :
        subgroupBy === SubgroupBy.None && groupedBy !== groupBy.None && billRecDim !== billRecTyp.None ? valuewithsubgroupBy.Balance90To119Days:
        subgroupBy !== SubgroupBy.None && groupedBy !== groupBy.None && billRecDim === billRecTyp.None ? 
        valuewithsubgroupBy.Balance90To119Days + countadjustment: groupedBy !== groupBy.None && subgroupBy === SubgroupBy.None && billRecDim === billRecTyp.None ? ArSpacing.Balance90To119Days : valuewithgroupSubgroupByANDBilRec.Balance90To119Days + countadjustment  ;
      case 'balance_120_to_149_days':
        return subgroupBy === SubgroupBy.None && groupedBy === groupBy.None   ? ArSpacing.Balance120To149Days + countadjustment :
        subgroupBy === SubgroupBy.None && groupedBy !== groupBy.None && billRecDim !== billRecTyp.None ? valuewithsubgroupBy.Balance120To149Days:
        subgroupBy !== SubgroupBy.None && groupedBy !== groupBy.None && billRecDim === billRecTyp.None ? 
        valuewithsubgroupBy.Balance120To149Days + countadjustment: groupedBy !== groupBy.None && subgroupBy === SubgroupBy.None && billRecDim === billRecTyp.None ? ArSpacing.Balance120To149Days : valuewithgroupSubgroupByANDBilRec.Balance120To149Days + countadjustment ;
      case 'balance_150plusdays':
        return subgroupBy === SubgroupBy.None && groupedBy === groupBy.None   ? ArSpacing.Balance150PlusDays + countadjustment  :
        subgroupBy === SubgroupBy.None && groupedBy !== groupBy.None && billRecDim !== billRecTyp.None ? valuewithsubgroupBy.Balance150PlusDays:
        subgroupBy !== SubgroupBy.None && groupedBy !== groupBy.None && billRecDim === billRecTyp.None?
        valuewithsubgroupBy.Balance150PlusDays + countadjustment: groupedBy !== groupBy.None && subgroupBy === SubgroupBy.None && billRecDim === billRecTyp.None ? ArSpacing.Balance150PlusDays : valuewithgroupSubgroupByANDBilRec.Balance150PlusDays + countadjustment  ;
      case 'total_outstanding_amount':
        return subgroupBy === SubgroupBy.None && groupedBy === groupBy.None   ? ArSpacing.TotalDeniedAmount + countadjustment  :
        subgroupBy === SubgroupBy.None && groupedBy !== groupBy.None && billRecDim !== billRecTyp.None ? valuewithsubgroupBy.TotalDeniedAmount:
        subgroupBy !== SubgroupBy.None && groupedBy !== groupBy.None && billRecDim === billRecTyp.None ?
        valuewithsubgroupBy.TotalDeniedAmount + countadjustment: groupedBy !== groupBy.None && subgroupBy === SubgroupBy.None && billRecDim === billRecTyp.None ? ArSpacing.TotalDeniedAmount : valuewithgroupSubgroupByANDBilRec.TotalDeniedAmount + countadjustment   ;

    }
  }

  generateExcel() {
  this.loadSpin = true;
  this.filterParam.report_type = ReportType.Account_Receivable_Report;
    this.subscription.add(this.analyticsService.post(AnalyticsUrlsEnum.export_to_excel, this.filterParam)
      .pipe(
        take(1))
      .subscribe((res: any) => {
        const jsonData = res;
        const csvContent = jsonData.result.csvContent;

        const filteredCsvContent = this.reportsExcelService.getprocessedCsv(csvContent,ReportType.Account_Receivable_Report)
        if (filteredCsvContent) {

          DownloadReport(filteredCsvContent,'accountReceivableReport');
          this.loadSpin = false;
        }else {
          this.loadSpin = false;
        }
      },error =>{
        this.loadSpin = false;
      }));
  }
  addUrlQueryParams(params: any): void {
    this.location.replaceState(this.router.createUrlTree([], { queryParams: params }).toString());
  }

}
