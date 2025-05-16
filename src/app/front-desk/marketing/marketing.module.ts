import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarketingRoutingModule } from './marketing-routing.module';
import { MarketingFormComponent } from './marketing-form/marketing-form.component';
import { DynamicFormModule } from '@appDir/shared/dynamic-form/dynamic-form.module';
import { SharedModule } from '@appDir/shared/shared.module';
// import { MarketingFormComponent } from '../marketing-form/marketing-form.component';

@NgModule({
  declarations: [MarketingFormComponent],
  imports: [
    CommonModule,
    MarketingRoutingModule,
    DynamicFormModule,
    SharedModule
  ]
})
export class MarketingModule { }
