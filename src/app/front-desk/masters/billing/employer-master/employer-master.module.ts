import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployerMasterRoutingModule } from './employer-master-routing.module';
import { EmployerComponent } from './employer/employer.component';
import {  CollapseModule } from 'ngx-bootstrap/collapse';
import { PaginationModule } from 'ngx-bootstrap/pagination';

import { SharedModule } from '@appDir/shared/shared.module';

@NgModule({
  declarations: [EmployerComponent],
  imports: [
    CommonModule,
	EmployerMasterRoutingModule,
	SharedModule,
    PaginationModule.forRoot(),
	CollapseModule.forRoot(),
  ]
})
export class EmployerMasterModule { }
