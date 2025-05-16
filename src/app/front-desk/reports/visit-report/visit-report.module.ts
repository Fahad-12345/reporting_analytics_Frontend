import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VisitReportRoutingModule } from './visit-report-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@appDir/shared/shared.module';
import { VisitReportComponent } from './components/visit-report/visit-report.component';
import { VisitReportDetailComponent } from './components/visit-report-detail/visit-report-detail.component';
import { VisitSummeryReportComponent } from './components/visit-report-summery/visit-report-summery.component';
import { VisitReportFiltersComponent } from './shared/visit-report-filters/visit-report-filters.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { CollapseModule, ModalModule } from 'angular-bootstrap-md';



@NgModule({
  declarations: [VisitSummeryReportComponent, VisitReportComponent, VisitReportDetailComponent, VisitReportFiltersComponent],
  imports: [
    CommonModule,
    VisitReportRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    TabsModule.forRoot(),
		CollapseModule.forRoot(),
		ModalModule.forRoot(),
  ],
  exports:[VisitReportFiltersComponent]
})
export class VisitReportModule { }
