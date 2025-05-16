import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IcdCodesRoutingModule } from './icd-codes-routing.module';
import { ICDCodesComponent } from './icd-codes/icd-codes.component';
import { SharedModule } from '@appDir/shared/shared.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import {  CollapseModule } from 'ngx-bootstrap/collapse';
import { CodesModule } from '../codes.module';

@NgModule({
  declarations: [ICDCodesComponent],
  imports: [
    CommonModule,
	IcdCodesRoutingModule,
	SharedModule,
    PaginationModule.forRoot(),
	CollapseModule.forRoot(),
	CodesModule
  ]
})
export class IcdCodesModule { }
