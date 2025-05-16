import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Page } from '@appDir/front-desk/models/page';

@Component({
  selector: 'app-bill-details',
  templateUrl: './bill-details.component.html',
  styleUrls: ['./bill-details.component.scss']
})
export class BillDetailsComponent implements OnInit {
  BillDetailpage: Page;
  @Input() billingDetails
  constructor(public datePipeService:DatePipeFormatService) {this.BillDetailpage = new Page();
		this.BillDetailpage.pageNumber = 0;
		this.BillDetailpage.size = 10; }

  ngOnInit() {
    this.BillDetailpage.totalElements = this.billingDetails.length
  }
  onPageChange($event){}
  @ViewChild('myTable') table: any;
  toggleExpandRow(row, index?) {
    this.table.rowDetail.toggleExpandRow(row);
  }
  onDetailToggle(event) {
  }
 /**
   * API method to expand all the rows.
   */
  expandAllRows(): void {
    this.table.rowDetail.expandAllRows()
  }
}
