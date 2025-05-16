import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CptCodesRoutingModule } from './cpt-codes-routing.module';
import { CPTCodesComponent } from './cpt-codes/cpt-codes.component';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import {  PaginationModule } from 'ngx-bootstrap/pagination';

import { SharedModule } from '@appDir/shared/shared.module';
import { MatDatepickerModule } from '@angular/material/datepicker';

@NgModule({
  declarations: [CPTCodesComponent],
  imports: [
    CommonModule,
	CptCodesRoutingModule,
	CollapseModule.forRoot(),
    MatDatepickerModule,
	SharedModule,
    PaginationModule.forRoot(),
  ]
})
export class CptCodesModule { }
