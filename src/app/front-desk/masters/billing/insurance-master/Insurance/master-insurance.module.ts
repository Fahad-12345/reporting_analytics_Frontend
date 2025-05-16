import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MasterInsuranceRoutingModule } from './master-insurance-routing.module';
import { InsuranceComponent } from './insurance-list/insurance.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import {  CollapseModule } from 'ngx-bootstrap/collapse';

import { SharedModule } from '@appDir/shared/shared.module';
import { InsuranceFormComponent } from './insurance-form/insurance-form.component';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

@NgModule({
  declarations: [InsuranceComponent,InsuranceFormComponent],
  imports: [
    NgxMaskDirective, NgxMaskPipe,
	// InsuranceComponent,
    CommonModule,
	  MasterInsuranceRoutingModule,
    SharedModule,
    PaginationModule.forRoot(),
	  CollapseModule.forRoot(),
    ScrollToModule.forRoot(),
  ],
  providers:[
    provideNgxMask()
  ]
})
export class MasterInsuranceModule { }
