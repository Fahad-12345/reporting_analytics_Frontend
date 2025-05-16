import { NgModule } from '@angular/core';
import { SharedModule } from '@appDir/shared/shared.module';

import { AnalyticsRoutingModule } from './analytics-routing.module';
import { AnalyticsComponent } from './components/analytics/analytics.component';

@NgModule({
  declarations: [
    AnalyticsComponent,
   
    
  ],
  imports: [
    SharedModule,
    AnalyticsRoutingModule,
  ]
})
export class AnalyticsModule { }
