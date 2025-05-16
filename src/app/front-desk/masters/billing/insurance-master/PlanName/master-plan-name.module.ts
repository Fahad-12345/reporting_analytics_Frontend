import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MasterPlanNameRoutingModule } from './master-plan-name-routing.module';
import { PlannameComponent } from './planname/planname.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import {  CollapseModule } from 'ngx-bootstrap/collapse';
import { PaginationModule } from 'ngx-bootstrap/pagination';

import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { SharedModule } from '@appDir/shared/shared.module';
@NgModule({
  declarations: [PlannameComponent],
  imports: [
	CommonModule,
	MasterPlanNameRoutingModule,
    SharedModule,
    PaginationModule.forRoot(),
	CollapseModule.forRoot(),
  ]
})
export class MasterPlanNameModule { }
