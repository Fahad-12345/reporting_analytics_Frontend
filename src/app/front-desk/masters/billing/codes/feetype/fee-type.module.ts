import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeeTypeRoutingModule } from './fee-type-routing.module';
import { FeeTypeComponent } from './fee-type/fee-type.component';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import {  PaginationModule } from 'ngx-bootstrap/pagination';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { SharedModule } from '@appDir/shared/shared.module';

@NgModule({
  declarations: [FeeTypeComponent],
  imports: [
    CommonModule,
	FeeTypeRoutingModule,
	CollapseModule.forRoot(),
    MatDatepickerModule,
	SharedModule,
    PaginationModule.forRoot(),
  ]
})
export class FeeTypeModule { }
