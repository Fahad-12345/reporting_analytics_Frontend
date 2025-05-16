import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AnalyticsSharedModule } from '../shared/analytics-shared.module';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [AdminDashboardComponent],
  imports: [
    CommonModule,
    FormsModule,
    AdminRoutingModule,
    AnalyticsSharedModule,
    BusyLoaderModule,
    NgbTooltipModule,
    MatProgressBarModule
  ],
  providers:[CurrencyPipe]
})
export class AdminModule { }
