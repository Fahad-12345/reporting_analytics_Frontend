import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PracticeManagerRoutingModule } from './practice-manager-routing.module';
import { PracticeManagerDashboardComponent } from './practice-manager-dashboard/practice-manager-dashboard.component';
import { AnalyticsSharedModule } from '../shared/analytics-shared.module';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [PracticeManagerDashboardComponent],
  imports: [
    CommonModule,
    PracticeManagerRoutingModule,
    AnalyticsSharedModule,
    BusyLoaderModule,
    NgbTooltipModule,
    
  ]
})
export class PracticeManagerModule { }
