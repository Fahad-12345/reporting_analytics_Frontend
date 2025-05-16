import { Component, Input, OnInit } from '@angular/core';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';

@Component({
  selector: 'app-invoice-detail-shareable',
  templateUrl: './invoice-detail-shareable.component.html',
  styleUrls: ['./invoice-detail-shareable.component.scss']
})
export class InvoiceDetailShareableComponent implements OnInit {
  isTablet: boolean = true;
  width:number = window.innerWidth;
  tabletWidth:number  = 1200;
  @Input() currentInvoice: any = {};
  constructor(public commonService:DatePipeFormatService) { }

  ngOnInit() {
    this.isTablet = this.width < this.tabletWidth;
    console.log(this.currentInvoice);
  }
  onWindowResize(event) {
    this.width = event.target.innerWidth;
    this.isTablet = this.width < this.tabletWidth;
}
}
