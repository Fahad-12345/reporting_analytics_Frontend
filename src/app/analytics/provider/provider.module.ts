import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProviderRoutingModule } from './provider-routing.module';
import { ProviderDashboardComponent } from './provider-dashboard/provider-dashboard.component';
import { AnalyticsSharedModule } from '../shared/analytics-shared.module';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { NgbNavModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [ProviderDashboardComponent],
  imports: [
    CommonModule,
    ProviderRoutingModule,
    AnalyticsSharedModule,
    BusyLoaderModule,
    NgbTooltipModule,
    NgbNavModule,
  ]
})
export class ProviderModule { }
