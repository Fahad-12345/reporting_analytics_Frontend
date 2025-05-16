import { ReportFiltersComponent } from './components/reports-filter-component/report-filter-component';
import { TransportationComponent } from './components/tranportation-report-list/tranportation-report-list.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '@appDir/shared/shared.module';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { Location } from '@angular/common';
import { FdSharedModule } from '../fd_shared/fd-shared.module';
import { Nf2ReportsListComponent } from './components/nf2-reports-list/nf2-reports-list.component';
import { AppointmentStatusComponent } from './components/appointment status/appointment-status-report.component';
import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports/reports.component';
import { TableFilterComponent } from './shared/components/table-filter/table-filter.component';
import { CollapseModule } from 'ngx-bootstrap/collapse';

import { AppoinmentReportComponent } from './components/appoinment-report/appoinment-report.component';
import { DenialReportComponent } from './components/denial-report/denial-report.component';

import { ARReportComponent } from './components/a-r-report/a-r-report.component';
import { PaymentReportComponent } from './components/payment-report/payment-report.component';
import { ToNumberPipe } from '@appDir/analytics/shared/pipes/tonumber.pipe';
import { DenialDetailReportComponent } from './components/denial-detail-report/denial-detail-report.component';
import { ARDetailReportComponent } from './components/ar-detail-report/ar-detail-report.component';
import { StatusPopupComponent } from './components/status-popup/status-popup.component';
import { MatDialogModule } from '@angular/material/dialog';
import { SummaryPopupComponent } from './components/summary-popup/summary-popup.component';

@NgModule({
	declarations: [ReportsComponent, ReportFiltersComponent,TransportationComponent, AppointmentStatusComponent, Nf2ReportsListComponent, TableFilterComponent,StatusPopupComponent,
		AppoinmentReportComponent, DenialReportComponent, ARReportComponent, PaymentReportComponent,ToNumberPipe, DenialDetailReportComponent, ARDetailReportComponent, SummaryPopupComponent
	],
	imports: [
		CommonModule,
		ReportsRoutingModule,
		NgxDatatableModule,
		NgbTooltipModule,
		FdSharedModule, 
		SharedModule,
		CollapseModule.forRoot(),
		NgbModule,
		MatDialogModule
	],
	providers:[Location]
})
export class ReportsModule {}
