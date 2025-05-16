import {
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AnalyticsService } from '@appDir/analytics/analytics.service';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription, take } from 'rxjs';
import { ReportType } from '../../report.enum';
import { AnalyticsUrlsEnum } from '@appDir/analytics/helpers/analytics_Urls_enum';
import { DownloadReport } from '../../constant/constants';

@Component({
  selector: 'app-ar-detail-report',
  templateUrl: './ar-detail-report.component.html',
  styleUrls: ['./ar-detail-report.component.scss']
})
export class ARDetailReportComponent implements OnInit  {
  loadSpin: boolean = false;
  data: any;
  rowdata:any[] = [];
  rowHeight = 50;
  columns = [
    { prop: 'bill_id', name: 'Bill/Invoice ID' },
    { prop: 'case_id', name: 'Case ID' },
    { prop: 'billed_date', name: 'Billed/Invoice Date' },
    {prop:'accident_date',name:'Accident Date'},
    { prop: 'case_type', name: 'Case Type' },
    { prop: 'patient_name', name: 'Patient Name' },
    { prop: 'specialty', name: 'Specialty' },
    { prop: 'practice_location', name: 'Practice Location' },
    { prop: 'provider_name', name: 'Provider Name' },
    { prop: 'dos_from_date', name: 'DOS From Date' },
    { prop: 'dos_to_date', name: 'DOS To Date' },
    {prop:'billed_amount',name:'Bill/Invoice Amount'},
    { prop: 'outstanding_amount', name: 'Outstanding Amount' },
    { prop: 'write_off', name: 'Write Off Amount' },
    { prop: 'over_payment', name: 'Over Payment' },
    {prop:'check_amount',name:'Check Amount'},
    { prop: 'paid_amount', name: 'Paid Amount' },
    { prop: 'interest_amount', name: 'Interest Amount' },
    {prop:'check_date',name:'Check Date'},
    { prop: 'attorney_name', name: 'Attorney Name' },
    { prop: 'firm_name', name: 'Firm Name' },
    { prop: 'bill_recipient_name', name: 'Bill/Invoice Recipient Name' },
    {prop:'bill_status',name:'Bill Status'},
    {prop:'eor_status',name:'EOR Status'},
    {prop:'denial_status',name:'Denial Status'},
    {prop:'verification_status',name:'Verification Status'},
    {prop:'payment_status',name:'Payment Status'},
    { prop: 'denial_type', name: 'Denial Type'}
   ];

   isLoading: boolean;
  headerHeight: any;
  subscription: Subscription = new Subscription();
  @ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('denialReport') denialTableList: DatatableComponent;
  
	customizedColumnComp: CustomizeColumnComponent;
  limit: any;
  pageLimit: any;
  reportsExcelService: any;
  @ViewChild(CustomizeColumnComponent) set con(con: CustomizeColumnComponent) {
		if (con) { // initially setter gets called with undefined
			this.customizedColumnComp = con;
		}
	}
  
  filterParam :any= {};
     constructor(private analyticsService: AnalyticsService , private el:ElementRef,
      private router:Router,private activatedRoute: ActivatedRoute) {
    }

    ngOnInit(): void {
      // this.onScroll(0);
      this.data = history.state;
      this.rowdata = [...this.data.transformedData];
     
      this.activatedRoute.queryParams.subscribe((params) => {
        if (params && Object.keys(params).length > 0) {
            this.filterParam = params;
        }
    });
      
    }
    ngAfterViewInit(){
      this.activatedRoute.queryParams.subscribe((params) => {
        if(params && Object.keys(params).length > 0){
          this.filterParam = params;
        }
      })
     }
  goBack(){
    this.loadSpin = true;
    const navigationExtras: NavigationExtras = {
      queryParams:this.filterParam
    };
    
    this.router.navigate(['/front-desk/reports/ar-reports'],navigationExtras)
  }
  convertToCSV(data: any[]): string {
    
    const csvRows = [];  
    const headers = this.columns.map(column => column.name);
    csvRows.push(headers.join(','));
  
    // Process each row of data
    data.forEach((row) => {
      const values = this.columns?.map(column => {
        let cellData = row[column.prop];
        if (cellData === undefined || cellData === null) {
          cellData = ''; // or provide a default value
        }
        
        // Convert cellData to string and escape double quotes
        cellData = String(cellData).replace(/"/g, '""');
        
        // If the cellData contains a comma, new line or double quote, enclose it in double quotes
        if (cellData.includes(',') || cellData.includes('\n') || cellData.includes('"')) {
          cellData = `"${cellData}"`;
        }
  
        return cellData;
      });
      csvRows.push(values.join(','));
    });
  
    return csvRows.join('\n');
  }
  
  formatValue(value: any, columnProp: string): string {
    const currencyFields = [
      'check_amount',
      'billed_amount',
      'paid_amount',
      'outstanding_amount',
      'write_off',
      'over_payment',
      'interest_amount'
    ];

    if (currencyFields.includes(columnProp)) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    }

    return value;
  }
  
  generateExcel() {
    const csvData = this.convertToCSV(this.rowdata);
    const blob = new Blob([csvData], { type: 'text/csv' }); //blob is used to create object urls 
    const url = window.URL.createObjectURL(blob);
  
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'AR-detail-report.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
