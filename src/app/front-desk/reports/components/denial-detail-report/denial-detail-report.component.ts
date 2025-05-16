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
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-denial-detail-report',
  templateUrl: './denial-detail-report.component.html',
  styleUrls: ['./denial-detail-report.component.scss']
})
export class DenialDetailReportComponent implements OnInit {
  loadSpin: boolean = false;
  data: any;
  rowdata:any[] = [];
  rowHeight = 50;
  columns = [
    { prop: 'bill_id', name: 'Bill ID' },
    { prop: 'billed_date', name: 'Billed Date' },
    { prop: 'case_id', name: 'Case ID' },
    { prop: 'dos_from_date', name: 'DOS From Date' },
    { prop: 'dos_to_date', name: 'DOS To Date' },
    { prop: 'paid_amount', name: 'Paid Amount' },
    { prop: 'write_off_amount', name: 'Write Off Amount' },
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
   isLoading: boolean;
  headerHeight: any;
  subscription: Subscription = new Subscription();
  @ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('denialReport') denialTableList: DatatableComponent;
  
	customizedColumnComp: CustomizeColumnComponent;
  limit: any;
  pageLimit: any;
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
      this.rowdata = [...this.data?.transformedData];     
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
    
    this.router.navigate(['/front-desk/reports/denial-reports'],navigationExtras)
  }
  convertToCSV(data: any[]): string {
    const csvRows = [];
    // Get the column headers
    const headers = Object.keys(this.columns.reduce((acc, column) => {
      acc[column.prop] = column.name;
      return acc;
    }, {}));
  
    csvRows.push(headers.join(','));
  
    // Process each row of data
    data.forEach((row) => {
      const values = headers.map(header => {
        let cellData = row[header];
        if (cellData === undefined || cellData === null) {
          cellData = ''; // or provide a default value
        }
        
        // Convert cellData to string and escape double quotes
        cellData = String(cellData).replace(/"/g, '""');
        
        // If the cellData contains a comma, new line or double quote, enclose it in double quotes
        if (cellData?.includes(',') || cellData.includes('\n') || cellData.includes('"')) {
          cellData = `"${cellData}"`;
        }
  
        return cellData;
      });
      csvRows.push(values.join(','));
    });
  
    return csvRows.join('\n');
  }
  
  
  generateExcel() {
    const csvData = this.convertToCSV(this.rowdata);
    const blob = new Blob([csvData], { type: 'text/csv' }); //blob is used to create object urls 
    const url = window.URL.createObjectURL(blob);
  
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'denial-detail-report.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
  

}
