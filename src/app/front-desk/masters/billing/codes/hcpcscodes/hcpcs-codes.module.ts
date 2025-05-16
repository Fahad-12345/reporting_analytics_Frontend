import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HcpcsCodesRoutingModule } from './hcpcs-codes-routing.module';
import { HCPCSCodesComponent } from './hcpcs-codes/hcpcs-codes.component';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { PaginationModule } from 'ngx-bootstrap/pagination';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { SharedModule } from '@appDir/shared/shared.module';

@NgModule({
  declarations: [HCPCSCodesComponent],
  imports: [
    CommonModule,
	HcpcsCodesRoutingModule,
	CollapseModule.forRoot(),
    MatDatepickerModule,
	SharedModule,
    PaginationModule.forRoot(),
  ]
})
export class HcpcsCodesModule { }
