import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsComponent } from './reports.component';
import { ReportsRoutingModule } from './reports-routing.module';
import { PrescriptionsLogComponent } from './prescriptions-log/prescriptions-log.component';
import { SharedModule } from '@appDir/shared/shared.module';
import { ActivityLogsComponent } from './activity-logs/activity-logs.component';
import { EventLogsComponent } from './event-logs/event-logs.component';
@NgModule({
  declarations: [ReportsComponent, PrescriptionsLogComponent, ActivityLogsComponent, EventLogsComponent],
  imports: [
    SharedModule,
    CommonModule,
    ReportsRoutingModule
  ]
})
export class ReportsModule { }
