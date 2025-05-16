import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CodeTypeRoutingModule } from './code-type-routing.module';
import { CodeTypeComponent } from './code-type/code-type.component';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import {  PaginationModule } from 'ngx-bootstrap/pagination';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { SharedModule } from '@appDir/shared/shared.module';

@NgModule({
  declarations: [CodeTypeComponent],
  imports: [
    CommonModule,
	CodeTypeRoutingModule,
	CollapseModule.forRoot(),
    MatDatepickerModule,
	SharedModule,
    PaginationModule.forRoot(),
  ]
})
export class CodeTypeModule { }
